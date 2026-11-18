# Jitheswar/Qwen3.5-4B-Amadeus

## Resumen

Qwen3.5-4B-Amadeus es una variante "abliterated" (sin rechazos) del modelo multimodal Qwen3.5-4B de Alibaba Qwen, publicada por el usuario Jitheswar en Hugging Face. El modelo conserva la arquitectura y los pesos del original (4.539.265.536 parametros reales segun safetensors, es decir, unos 4,54 mil millones) pero se le ha eliminado la "direccion de rechazo" mediante ablacion direccional sobre los pesos, sin reentrenamiento ni datos nuevos. El resultado es un modelo que responde a practicamente cualquier peticion (1 rechazo de 304 en la bateria del autor, frente a 231 del original) manteniendo casi intactas sus capacidades de razonamiento, matematicas y vision.

El modelo es relevante porque demuestra que la abliteracion moderna, con optimizacion automatica de 1000 rondas para minimizar el dano colateral, permite eliminar los comportamientos de rechazo con una divergencia KL de solo 0,0128 respecto al original en wikitext-2. Ademas, mantiene el pipeline image-text-to-text, el modo thinking y el head de prediccion multi-token (MTP) de Qwen3.5, y se distribuye tanto en safetensors BF16 como en GGUF (BF16, Q6_K, Q4_K_M) con matriz de importancia calculada sobre el propio modelo.

Se trata de un modelo pequeno (4B), con contexto y arquitectura heredados de Qwen3.5-4B (los detalles exactos de longitud de contexto no se detallan en la informacion disponible), licencia Apache 2.0 y soporte para ingles, chino y otros idiomas. Su interes practico esta en escenarios donde se necesita un modelo ligero, con vision y modo razonamiento, que no bloquee peticiones legitimas por falsos positivos de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.5-4B, con head de prediccion multi-token (MTP) |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-4B; no se especifica en la informacion) |
| Tipos de cuantizacion | BF16 (GGUF y safetensors), Q6_K (con imatrix), Q4_K_M (con imatrix), proyector vision F16 (mmproj) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF (BF16, Q6_K, Q4_K_M) |

## Arquitectura y entrenamiento

Amadeus no es un fine-tune: no se ha entrenado con datos nuevos. Parte de los pesos de Qwen/Qwen3.5-4B y aplica ablacion direccional (abliteration) para localizar y sustraer de los pesos la direccion asociada al comportamiento de rechazo. El proceso incluyo 1000 rondas de optimizacion automatica cuyo objetivo era maximizar la eliminacion de rechazos minimizando el cambio respecto al modelo original; la divergencia KL resultante frente al original en wikitext-2 es de 0,0128, lo que indica una alteracion muy contenida de la distribucion de salida.

La arquitectura subyacente es la de Qwen3.5-4B: un transformer multimodal capaz de procesar imagen y texto, con modo thinking y un head de prediccion multi-token (MTP) que se conserva en todas las versiones GGUF. El autor indica que el template de chat, el conocimiento, el razonamiento, la vision y el modo thinking son identicos a los del modelo base. No se detalla en la informacion proporcionada la composicion del dataset de entrenamiento original de Qwen3.5-4B ni si hubo RLHF/DPO en su construccion.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con modo thinking (cadena de pensamiento) activable y desactivable.
- Matematicas: 91,13% exact match en GSM8K con 8-shot CoT flexible.
- Vision: entrada de imagen y texto (pipeline image-text-to-text), con proyector vision F16 distribuido aparte para GGUF.
- Seguimiento de instrucciones: 78,19% prompt-level strict accuracy en IFEval.
- Capacidades multilingues en ingles, chino y otros idiomas.
- Prediccion multi-token (MTP) heredada de Qwen3.5.
- Ausencia practicamente total de rechazos: 1/304 en la bateria del autor y 0/100 en JailbreakBench benign.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (se heredaria del base, pero no se confirma).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita en la informacion.

## Casos de uso

- Investigacion sobre seguridad y alineacion: permite estudiar como la ablacion direccional afecta al comportamiento de rechazo con un coste computacional bajo (4B) y una divergencia KL medida, util para comparar tecnicas de abliteracion en laboratorio.
- Generacion de codigo y scripting en local: con 4 GB de VRAM en Q4_K_M o 6 GB en Q6_K, se puede desplegar en una RTX 3050/3060/4060 para autocompletar y explicar codigo sin dependencia de la nube; el modo thinking preciso (temperature 0,6) esta pensado para este escenario.
- Asistente conversacional sin friccion: al no rechazar peticiones "edgy pero inofensivas" (0/100 en JailbreakBench benign), reduce los falsos positivos en chat de entretenimiento, escritura creativa o role-play, donde los filtros excesivos degradan la experiencia.
- Procesamiento de documentos con imagen: al conservar la vision, se puede usar para extraer y resumir informacion de capturas, diagramas o formularios, anadiendo el mmproj F16 (0,7 GB) al GGUF.
- Razonamiento matematico asistido: el 91,13% en GSM8K lo hace adecuado para tutoria de problemas aritmeticos y verificacion de calculos paso a paso en entornos educativos o de analisis.
- Prototipado rapido en CPU: el GGUF Q4_K_M (2,8 GB) permite ejecutar el modelo en portatiles sin GPU mediante llama.cpp u Ollama, util para demos y pruebas de integracion antes de escalar a GPU.
- Evaluacion comparativa de cuantizaciones: al ofrecer BF16, Q6_K y Q4_K_M con imatrix del propio modelo, sirve para medir la perdida de calidad por cuantizacion en tareas de vision y thinking.

## Benchmarks y rendimiento

Resultados declarados por el autor (evaluacion propia con llama.cpp + lm-evaluation-harness; no verificados de forma independiente):

| Benchmark | Metrica | Qwen3.5-4B-Amadeus | Qwen3.5-4B (referencia del autor) |
|---|---|---|---|
| GSM8K (test) | exact match, 8-shot CoT flexible | 91,13 | 91,4 |
| IFEval (train) | prompt-level strict acc | 78,19 | no disponible |
| HellaSwag (validation) | acc_norm, 0-shot | 71,64 | 71,9 |
| WinoGrande (validation) | accuracy, 0-shot | 70,09 | 68,6 |
| ARC-Challenge (validation) | accuracy, 0-shot, cloze | 46,82 | 46,5 |
| MMLU (test) | accuracy, 0-shot, cloze | 38,42 | no disponible |
| TruthfulQA (validation) | MC accuracy, cloze | 25,95 | no disponible |

Datos adicionales de la model card:

| Metrica | Qwen3.5-4B | Amadeus |
|---|---|---|
| Rechazos en 304 prompts (harmful + edgy, juez Minos) | 231/304 | 1/304 |
| Rechazos en JailbreakBench benign | 31/100 | 0/100 |
| Divergencia KL respecto al original (wikitext-2) | 0 | 0,0128 |

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Q4_K_M: 2,8 GB de pesos; cabe en GPUs de 4 GB.
  - Q6_K: 3,6 GB; recomendado para GPUs de 6 GB o mas.
  - BF16 GGUF: 8,7 GB; requiere 12 GB o mas para margen de contexto.
  - Safetensors BF16: 9,3 GB; para Transformers, vLLM o SGLang.
  - Vision con GGUF: anadir 0,7 GB del mmproj F16.
- GPU recomendadas: RTX 3050/3060/4060 (6 GB) para Q6_K; RTX 4090 y A100/H100 para BF16 con contexto largo y vision.
- Cabe en GPU de consumo: si, desde una RTX 3050 de 6 GB con Q6_K, o GPUs de 4 GB con Q4_K_M.
- Opciones de despliegue: llama.cpp (GGUF), Ollama, Transformers, vLLM, SGLang. El autor indica compatibilidad con endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota de muestreo: no usar decodificacion greedy (temperature 0) con thinking activado, ya que puede entrar en bucles. Ajustes recomendados: thinking general (temp 1,0, top_p 0,95, top_k 20, presence_penalty 1,5); thinking codigo preciso (temp 0,6, top_p 0,95, top_k 20, presence_penalty 0); sin thinking (temp 0,7, top_p 0,8, top_k 20, presence_penalty 1,5).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Modo thinking | Licencia | Rechazos |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-Amadeus | 4,54 B | no disponible | Si | Si | Apache 2.0 | 1/304 |
| Qwen3.5-4B (base) | 4,54 B | no disponible | Si | Si | Apache 2.0 | 231/304 |
| Alternativas abliterated de 4B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion mas directa es con el modelo base Qwen3.5-4B, del que Amadeus hereda arquitectura, vision, thinking y MTP, diferenciandose unicamente en la eliminacion de rechazos y en una variacion minima en benchmarks (diferencias de decimas en GSM8K, HellaSwag y ARC-C; ligera mejora en WinoGrande). No se dispone de datos de otros modelos abliterated comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion: al ser un modelo de 4B, el riesgo de alucinacion es alto, especialmente en MMLU (38,42%) y TruthfulQA (25,95%), donde los resultados son bajos. No es fiable como fuente factual sin verificacion.
- Sesgos: no se documentan sesgos especificos, pero al no haber reentrenamiento, hereda los del base Qwen3.5-4B. La eliminacion de rechazos puede amplificar respuestas sesgadas o estereotipadas que el original filtraba.
- Seguridad: el modelo responde a practicamente cualquier peticion, incluidas las daninas. No debe desplegarse en produccion orientada a usuarios sin una capa externa de moderacion y filtrado.
- Contexto e idioma: la longitud de contexto no se detalla en la informacion; el soporte multilingue se declara como en/zh/multilingual sin garantias de calidad en espanol.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias; la responsabilidad del uso recae en el desplegador.
- Muestreo: con thinking activado y temperature 0 el modelo puede entrar en bucles infinitos; es obligatorio usar los parametros de muestreo recomendados.
- Benchmarks no verificados: todos los resultados son de evaluacion propia del autor con llama.cpp + lm-evaluation-harness y no han sido validados de forma independiente.
- Vision en GGUF: requiere descargar y cargar el mmproj F16 por separado; sin el, el modelo solo procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jitheswar/Qwen3.5-4B-Amadeus
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Resultados completos de benchmarks: https://huggingface.co/Jitheswar/Qwen3.5-4B-Amadeus#full-benchmark-results
- Paper de referencia sobre abliteration (arxiv:2406.11717): https://arxiv.org/abs/2406.11717
- Dataset harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
