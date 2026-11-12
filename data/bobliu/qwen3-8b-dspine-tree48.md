# Bobliu/Qwen3-8B-DSpine-tree48

## Resumen

Qwen3-8B-DSpine-tree48 es un artefacto de decodificación especulativa publicado por el usuario Bobliu sobre el modelo base Qwen3-8B de Alibaba. No se trata de un modelo nuevo entrenado desde cero, sino de un directorio de draft listo para usar con DSpine, la técnica de decodificación especulativa de Tencent, configurado con un árbol de verificación de 48 nodos. El repositorio reutiliza los pesos de `tencent/Qwen3-8B-DSpine-b16` sin modificarlos y solo altera el `config.json` para fijar `block_size` a 48, por lo que no hay reentrenamiento.

El interés del artefacto está en el rendimiento: según la model card, sobre Qwen3-8B con batch 1 y decodificación greedy en una A100-80GB alcanza 651 tok/s, un 7,20x frente a la generación autorregresiva, superando el 5,78x de la cadena b16 estándar. La longitud media de aceptación sube a 11,29 tokens frente a 7,99 de la cadena, y la salida se declara sin pérdida (lossless) tras la verificación teacher-forced.

Es relevante para equipos que ya sirven Qwen3-8B con SGLang y quieren exprimir el throughput en escenarios de baja concurrencia sin cambiar de modelo ni reentrenar nada. El repo pesa 2,5 GB y los safetensors suman 1.237.763.840 parámetros, coherentes con el draft de Qwen3-8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con draft de decodificación especulativa DSpine y verificación en árbol de 48 nodos |
| Parametros totales | 1.237.763.840 (safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16 para verificación) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, con código custom (`custom_code`) y directorio `tree/` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-8B, un transformer decoder-only de la familia Qwen3. Sobre él, DSpine implementa decodificación especulativa: un draft propone varios tokens y el modelo objetivo los verifica en paralelo. En este repo la verificación se organiza como un árbol de 48 nodos (`block_size` = 48), lo que permite aceptar secuencias más largas por paso de verificación que una cadena lineal. Los pesos son idénticos a `tencent/Qwen3-8B-DSpine-b16`; no hay fine-tuning ni RLHF adicional en este artefacto.

La innovación es de sistema, no de entrenamiento: el árbol se aplica parcheando en caliente el paquete SGLang instalado (`serve_tree.sh` y `tree/p4tree/apply_tree_patch_fast.py`), ya que SGLang 0.5.22 no expone un hook nativo de tree-verify. El autor reporta verificación teacher-forced con 200/200 salidas byte-idénticas a la primera versión del árbol, aunque advierte que con forma de verificación de 48 tokens la salida especulativa no es byte-idéntica a la autorregresiva en bf16 (las discrepancias son near-ties).

## Capacidades

- Generación de texto y razonamiento heredados de Qwen3-8B.
- Generación de código y matemáticas (capacidades del modelo base).
- Aceleración de inferencia mediante decodificación especulativa con verificación en árbol.
- Servidor compatible con la API de OpenAI en `127.0.0.1:30000` vía `serve_tree.sh`.
- Salida declarada lossless respecto a la versión tree original (verificación teacher-forced).
- Soporte de muestreo con temperatura (T=1 lossless sampled tree reportado a 5,43x).
- Tool calling, agentes y multilingüismo: no disponible en la información proporcionada (dependen del modelo base Qwen3-8B).

## Casos de uso

- Servicio de chat interactivo de baja concurrencia: con batch 1 y decodificación greedy, el árbol de 48 nodos ofrece 7,20x sobre autorregresivo en A100-80GB, adecuado para asistentes con un usuario por GPU.
- Autocompletado de código en IDE: la latencia por token se reduce drásticamente en batch 1, escenario típico de un desarrollador esperando sugerencias en tiempo real.
- Generación de documentación o resúmenes largos: el throughput de 651 tok/s en A100 permite producir textos extensos con menor tiempo de pared.
- Despliegue en estaciones de trabajo con DGX Spark: el autor reporta 7,80x en GB10, útil para prototipos locales sin clúster.
- Evaluación comparativa de técnicas de decodificación especulativa: el repo incluye benchmark, protocolo y JSON crudo, sirviendo como referencia reproducible para investigar tree-verify frente a chain.
- Servicio en H100 para cargas de un solo flujo: 6,49x reportado (+27% sobre la cadena stock), aplicable a pipelines de generación secuencial donde la concurrencia es baja.

## Benchmarks y rendimiento

Datos de la model card (Qwen3-8B, batch 1, greedy):

| Configuración | tok/s | Speedup vs autorregresivo |
|---|---|---|
| DSpine b16 chain (stock) | 523 | 5,78x |
| DSpine b32 chain (mismos pesos) | 557 | 6,15x |
| DSpine tree, 48 nodos (este repo) | 651 | 7,20x |

Longitud media de aceptación: 11,29 (árbol) frente a 7,99 (cadena). Otros entornos medidos: H100 6,49x (+27% sobre la cadena stock), DGX Spark 7,80x, T=1 lossless sampled tree 5,43x (+12%). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los pesos del repo ocupan 2,5 GB y la verificación se hace en bf16 sobre Qwen3-8B, por lo que se requiere memoria para el modelo objetivo además del draft.
- GPU validadas: A100-80GB, H100 (sm80/sm90) y GB10 (DGX Spark).
- GPU de consumo: no probado según el autor; no hay confirmación de funcionamiento en RTX 4090 u otras consumer.
- Despliegue: SGLang 0.5.22 + `sglang-dspine` + DSpine de Tencent; `serve_tree.sh` parchea el paquete instalado.
- Throughput: 651 tok/s en A100-80GB, batch 1, greedy; el beneficio desaparece a concurrencia 8, donde el árbol pierde frente a la cadena.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-DSpine-tree48 (este) | 1.237.763.840 (draft) | no disponible | Draft DSpine con árbol de 48 nodos | Apache-2.0 | Hugging Face |
| tencent/Qwen3-8B-DSpine-b16 | no disponible | no disponible | Draft DSpine en cadena b16 | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-8B | no disponible | no disponible | Modelo base autorregresivo | Apache-2.0 | Hugging Face |

La comparación se limita al ecosistema DSpine y al modelo base; no se dispone de datos de otros drafts especulativos comparables en la información proporcionada.

## Limitaciones y advertencias

- Requiere SGLang 0.5.22 y `sglang-dspine`; el script parchea el paquete instalado en sitio (reversible con `--revert`).
- La ganancia es solo con batch 1; a concurrencia 8 la verificación deja de ser gratuita y el árbol pierde frente a la cadena.
- En bf16 con forma de verificación de 48 tokens, la salida especulativa no es byte-idéntica a la autorregresiva (discrepancias en near-ties).
- No probado en GPUs de consumo; solo A100, H100 y GB10.
- Sesgos y riesgo de alucinación: no disponibles en la información proporcionada; dependen del modelo base Qwen3-8B.
- Idiomas soportados: no disponible.
- Licencia Apache-2.0 permite uso comercial, pero el parcheo de SGLang puede complicar el mantenimiento en producción.
- Repo con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/Bobliu/Qwen3-8B-DSpine-tree48
- Benchmark y JSON crudo: https://github.com/Bobliuuu/recursive-dflash2
- DSpine (Tencent): https://github.com/Tencent/DSpine
- Modelo base del draft: https://huggingface.co/tencent/Qwen3-8B-DSpine-b16
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Paper DSpine citado en la model card: arXiv 2609.36173
