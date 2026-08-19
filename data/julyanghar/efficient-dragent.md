# julyanghar/Efficient-DRAgent

## Resumen

`julyanghar/Efficient-DRAgent` es un modelo *draft* (cabezal de decodificación especulativa) basado en la arquitectura EAGLE-3, diseñado específicamente para acelerar la inferencia del modelo base `Qwen/Qwen3-32B` en tareas de agentes de investigación profunda (*deep research agents*). El modelo, desarrollado por el autor `julyanghar`, es el resultado de la fase 2 de un entrenamiento de dominio (*domain training*) sobre datos de resúmenes y tareas de investigación, con un total de 727.654.016 parámetros.

Su relevancia radica en que aborda el problema de la latencia en modelos de 32B parámetros cuando se utilizan con ventanas de contexto largas (hasta 12.288 tokens en entrenamiento). Al ser un modelo *draft* de solo ~727M parámetros, se integra en el pipeline de decodificación especulativa de vLLM para generar múltiples tokens candidatos que el modelo grande valida en paralelo, logrando una aceleración medida de 1.303x en prompts largos en inglés. El repositorio incluye no solo los pesos, sino también los datos de entrenamiento y evaluación, lo que facilita la reproducibilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE-3 (cabezal *draft* para decodificación especulativa) |
| Parametros totales | 727.654.016 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 12.288 tokens (máximo de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP16/BF16) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cabezal EAGLE-3, una arquitectura de decodificación especulativa que utiliza un pequeño transformer para predecir los siguientes tokens basándose en las características ocultas del modelo objetivo (Qwen3-32B). A diferencia de métodos como Medusa, EAGLE-3 realiza el *drafting* en el espacio de características (*feature-level*), lo que mejora la tasa de aceptación.

El entrenamiento se realizó en dos fases. La fase 1 (no incluida en este repositorio) utilizó 3.607 muestras con TP4@8192 y 2 épocas. La fase 2 (este repositorio) amplía el dataset a 7.681 muestras (2.08x supervisión), con TP4@12288, 3 épocas y una técnica de doble recorte (*dual trimming*) que ahorra 7.05 GiB por GPU para permitir la ventana de 12.288 tokens. Se utilizó *warm-start* desde el cabezal genérico `AngelSlim/Qwen3-32B_eagle3`. El framework de entrenamiento es un fork local de SpecForge, con una tasa de aprendizaje de 2e-5, *warmup* de 0.05 y grad norm de 0.5. La precisión de entrenamiento por época fue de 0.44 → 0.47 → 0.48, sin OOM.

## Capacidades

- Decodificación especulativa: genera hasta 3 tokens candidatos por paso (configuración `num_speculative_tokens=3`) para el modelo base Qwen3-32B.
- Aceleración de inferencia: optimizado específicamente para tareas de *deep research* y resumen, donde los prompts son largos y complejos.
- Integración nativa con vLLM: se despliega mediante el método `eagle3` en el campo `--speculative-config`, sin necesidad de conversión de pesos.
- Soporte multilingüe: entrenado con datos en chino (3.935 muestras) e inglés (3.725 muestras), más 21 mixtas.
- Reproducibilidad: incluye datos de entrenamiento y evaluación (held-out) con temas bloqueados para comparativas consistentes.
- Compatibilidad con config de despliegue: proporciona un `config_deploy.json` que evita problemas de parsing de RoPE con versiones nuevas de transformers.

## Casos de uso

- Aceleración de agentes de investigación profunda: el caso principal. En prompts largos en inglés (DRGym), logra una aceleración de 1.303x frente a la inferencia sin *draft*, superando a otros *draft* como suffix (0.976x). Ideal para sistemas que ejecutan múltiples pasos de razonamiento con contexto extenso.
- Reducción de latencia en pipelines RAG: al integrarse en vLLM, permite servir Qwen3-32B con menor tiempo de respuesta por petición cuando se procesan documentos largos, mejorando la experiencia de usuario en sistemas de pregunta-respuesta sobre documentación extensa.
- Generación de resúmenes de documentos largos: el entrenamiento está especializado en dominio de *summary*, por lo que es adecuado para tareas de condensación de informes o artículos donde la ventana de 12.288 tokens es suficiente.
- Despliegue en producción con vLLM: se puede integrar en un *endpoint* existente de Qwen3-32B con `--tensor-parallel-size 4`, añadiendo únicamente la ruta al directorio del modelo *draft* en la configuración especulativa.
- Optimización de costes por token: al reducir la latencia sin degradar la calidad del modelo objetivo (la salida final la valida Qwen3-32B), se puede servir el mismo volumen de peticiones con menos GPUs o en menos tiempo.
- Evaluación comparativa de *draft* models: al incluir datos de entrenamiento y un *held-out* con temas bloqueados, sirve como referencia para investigar técnicas de decodificación especulativa en dominios específicos.

## Benchmarks y rendimiento

Los resultados de evaluación se centran en la tasa de aceleración (speedup) y la precisión de aceptación del *draft*. Según la información proporcionada en la *model card*:

| Benchmark | Métrica | Resultado |
|---|---|---|
| DRGym (prompts largos en inglés) | Speedup limpio en held-out | 1.303x |
| DRGym (prompts largos en inglés) | Speedup con *draft* suffix | 0.976x (neto, desaceleración) |
| DRBench (prompts cortos en chino) | Speedup | 1.11% |
| DRBench (prompts cortos en chino) | Comparativa vs suffix | 18.4% (inferior a suffix) |
| Entrenamiento (fase 2) | Precisión por época | 0.44 → 0.47 → 0.48 |

Nota: el modelo supera claramente a suffix en inglés con prompts largos, pero es inferior a suffix en chino con prompts cortos. No se proporcionan benchmarks estándar como MMLU o HumanEval, ya que se trata de un modelo auxiliar de aceleración, no de un modelo de propósito general.

## Requisitos de hardware

- VRAM estimada para el modelo *draft*: ~1.5 GB en FP16 (727M parámetros). Se suma a la VRAM requerida por el modelo base Qwen3-32B (~64 GB en FP16, o menos con cuantización).
- GPU recomendadas: el entrenamiento y la configuración de despliegue utilizan `--tensor-parallel-size 4`, lo que sugiere GPUs de data center como NVIDIA A100 (80 GB) o H100 (80 GB). En GPUs de consumo como RTX 4090 (24 GB) no es viable ejecutar el modelo base completo en FP16, aunque podría intentarse con cuantización del base.
- Opciones de despliegue: vLLM (método `eagle3` en `--speculative-config`). No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan valores absolutos de latencia o tokens/segundo, solo la aceleración relativa de 1.303x en el benchmark DRGym.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Aceleración (DRGym) |
|---|---|---|---|---|---|
| `julyanghar/Efficient-DRAgent` | 727M | 12.288 | Deep research / summary (zh, en) | Apache-2.0 | 1.303x |
| `AngelSlim/Qwen3-32B_eagle3` | ~727M (estimado) | no disponible | Genérico (warm-start) | no disponible | no disponible |
| Suffix *draft* (referencia) | no disponible | no disponible | Genérico | no disponible | 0.976x (neto) |

La comparativa se limita a los datos disponibles. El modelo destaca frente a un *draft* genérico tipo suffix en prompts largos en inglés, pero pierde en prompts cortos en chino. No se dispone de datos para comparar con EAGLE-2 o Medusa en este contexto específico.

## Limitaciones y advertencias

- Modelo sin verificar: tiene 0 descargas y 0 *likes* en HuggingFace, por lo que no ha sido validado por la comunidad. Se recomienda probar en un entorno aislado antes de producción.
- Especialización estrecha: entrenado exclusivamente con datos de resumen y *deep research*. Su rendimiento como *draft* en otras tareas (código, matemáticas, diálogo general) no está garantizado y podría ser inferior a un *draft* genérico.
- Degradación en chino con prompts cortos: en DRBench, el speedup es solo de 1.11% y es un 18.4% inferior al *draft* suffix. No es adecuado para cargas de trabajo con predominio de consultas cortas en chino.
- Dependencia de configuración específica: requiere usar `config_deploy.json` en lugar de `config.json` para evitar problemas de parsing de RoPE con versiones nuevas de transformers. Si se usa la config incorrecta, la inferencia puede fallar o degradarse.
- Datos de entrenamiento limitados: el dataset es de solo 7.681 muestras, lo que puede limitar la generalización del *draft* a variaciones de formato no vistas.
- Requisitos de infraestructura: el despliegue está pensado para vLLM con TP=4 y un modelo base de 32B, lo que implica un coste de hardware significativo (mínimo 4 GPUs de data center).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/julyanghar/Efficient-DRAgent
- Documentación de entrenamiento y evaluación (referenciada en la *model card*, no se proporciona URL directa): no disponible
- Repositorio del framework SpecForge (fork local, no se proporciona URL): no disponible
