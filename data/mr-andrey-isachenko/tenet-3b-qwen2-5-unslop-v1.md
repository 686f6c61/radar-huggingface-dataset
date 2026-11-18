# mr-andrey-isachenko/Tenet-3B-Qwen2.5-Unslop-v1

## Resumen

Tenet-3B-Qwen2.5-Unslop-v1 es un ajuste fino del modelo Qwen2.5-3B-Instruct desarrollado por el usuario mr-andrey-isachenko. El modelo aplica una técnica propietaria denominada "Lancet", que el autor describe como una cirugía de subespacio con preservación de norma y proyección bidireccional, orientada a eliminar la dirección de rechazo (refusal) tanto en la proyección de entrada (residual stream) como en la de salida (unembedding). El resultado se exporta como un checkpoint en FP8 (E4M3) listo para proveedores de inferencia.

El problema que aborda es doble: por un lado, los falsos rechazos ante peticiones benignas (por ejemplo, análisis de logs o consultas SQL de triaje de seguridad); por otro, la deriva estilística que el autor denomina "slop" (prosa recargada, preámbulos moralizantes, vocabulario ampuloso). Frente a la "abliteration" ingenua, que según la model card degrada el anclaje de tool calling y SQL, Tenet afirma preservar el subespacio analítico, de código y de razonamiento estructurado del modelo base.

El modelo se distribuye con licencia Apache 2.0, sin código personalizado ni `trust_remote_code`, y con soporte declarado para vLLM, OpenRouter, GGUF y MLX. El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos no estaban materializados en el repositorio en ese instante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3B (aproximado, segun modelo base Qwen2.5-3B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32768 tokens (valor usado en el ejemplo de vLLM con `--max-model-len 32768`; el modelo base Qwen2.5-3B-Instruct soporta hasta 32768) |
| Tipos de cuantizacion | FP8 (E4M3) como formato de exportacion principal; GGUF CKA-Quant (ej. Q4_K_M); BF16 como salida de la cirugía |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8 E4M3), GGUF (CKA-Quant), MLX |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only con atención por grupos de consultas (GQA) y RoPE, del que no se detallan aquí configuraciones adicionales porque la información proporcionada no las incluye. Sobre esa base, el autor aplica el motor "Lancet", descrito como una cirugía de subespacio con preservación de norma y proyección bidireccional: se identifica la dirección de rechazo en el residual stream y en el unembedding, se elimina el componente en ambas direcciones y se restaura exactamente la norma residual para mantener las magnitudes de activación en la variedad original.

Tras la cirugía se ejecuta un pase de GRPO con compuertas ("gated unslop GRPO"): una optimización de preferencias cuyo reward penaliza patrones de slop (prosa recargada, vocabulario tipo "tapestry", preámbulos moralizantes) únicamente en las regiones donde la cirugía debilitó el circuito de rechazo. El objetivo declarado es reforzar razonamiento y código sin dañar el anclaje del modelo base. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset de preferencias ni los hiperparámetros del GRPO.

## Capacidades

- Generación de texto conversacional multi-turno sobre el modelo base Qwen2.5-3B-Instruct.
- Razonamiento estructurado y seguimiento de instrucciones, con anclaje preservado según las métricas del autor.
- Generación de código y consultas SQL, incluyendo tool calling con esquema válido (el ejemplo de la model card muestra una llamada DuckDB bien formada).
- Soporte de tool calling / function calling y uso en flujos agénticos (etiquetas `agentic`, `tool-use`).
- Reducción de falsos rechazos ante peticiones benignas de seguridad, DevOps y análisis de logs.
- Reducción de deriva estilística ("slop") en la salida.
- Capacidad multilingüe: no disponible (no se documenta en la información proporcionada).
- Modo thinking, visión o audio: no disponible (no se declaran).

## Casos de uso

- Triaje de logs de seguridad: el modelo puede recibir líneas de log (por ejemplo, nginx auth) y devolver una llamada de herramienta SQL válida que agregue intentos fallidos por IP de origen, evitando el rechazo que produce el modelo base ante peticiones de análisis de autenticación.
- Asistencia en AppSec y DevOps: generación de consultas DuckDB, SQL o comandos de diagnóstico sobre datos operativos, con salida estructurada apta para pipelines automatizados.
- Agentes de tool calling en producción: al conservar el anclaje de tool/SQL (ortogonalidad reportada de 7.00e-08 en BF16), es adecuado para orquestadores que exigen JSON conforme a esquema y no toleran preámbulos conversacionales.
- Generación de código en pipelines de CI/CD: el modelo puede integrarse como generador de parches o consultas dentro de flujos automatizados, con salida limpia y sin moralina que rompa el parseo.
- Atención al cliente automatizada: conversaciones multi-turno con ventana de hasta 32768 tokens, útil para hilos largos con historial extenso, con estilo directo y sin preámbulos redundantes.
- Despliegue en infraestructura modesta: al ser un modelo de 3B en FP8 o GGUF Q4_K_M, cabe en GPUs de consumo y en entornos edge, lo que permite servir asistentes internos sin depender de APIs externas.
- Investigación sobre alineación y edición de modelos: sirve como caso de estudio reproducible de cirugía de subespacio frente a abliteration ingenua, con métricas de deriva KL y re-fuga comparadas.

## Benchmarks y rendimiento

Los benchmarks publicados por el autor son métricas internas (H9, H10, H11) y comparativas de ingeniería, no benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K). Se reproducen tal cual, sin interpretación adicional.

| Variante | H9 (menor es mejor) | H10 (mayor es mejor) | H11 (mayor es mejor) |
|---|---|---|---|
| BF16 | 0.02 | 0.36 | 0.95 |
| FP8 (E4M3) | 0.09 | 1.00 | 0.52 |
| Abliteration ingenua | 3.76 | 0.16 | 0.50 |

| Métrica | Base | Abliteration ingenua | Tenet (BF16) | Tenet (FP8 E4M3) |
|---|---|---|---|---|
| Deriva colateral KL | — | 3.76 | 0.02 | 0.03 |
| Supresión de rechazo | — | — | 0.97 | 1.00 |
| Ortogonalidad de anclaje tool/SQL | — | 0.83 | 7.00e-08 | 0.07 |
| Re-fuga tras LoRA | — | 0.83 | 0.07 | 0.03 |
| Re-fuga de subespacio en FP8 | — | 0.50 | — | 0.03 |
| Crest-factor máximo de fila (< 25.0) | — | — | 17.27 | 17.27 |

Peso absoluto máximo: 1.43. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en FP8 (E4M3) para los pesos, más overhead de KV cache; en GGUF Q4_K_M, en torno a 2 GB de pesos.
- GPU recomendadas: cualquier GPU con soporte FP8 para la ruta vLLM (H100, L40S, A100 con kernels compatibles); para GGUF, GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM en cuantizaciones GGUF; en FP8 conviene una GPU con soporte nativo de FP8 para máximo rendimiento.
- Opciones de despliegue: vLLM (`--quantization fp8`), Transformers, llama.cpp con GGUF CKA-Quant, Ollama, MLX y proveedores OpenRouter.
- Latencia y throughput estimados: no disponible (no se publican cifras en la información proporcionada).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Tenet-3B-Qwen2.5-Unslop-v1 | 3B | 32768 | Apache 2.0 | Fine-tune con cirugía Lancet y GRPO; FP8 E4M3; tool calling preservado según el autor |
| Qwen2.5-3B-Instruct (base) | 3B | 32768 | Apache 2.0 | Modelo base; rechazos falsos y slop según la model card de Tenet |
| Abliteration ingenua de Qwen2.5-3B-Instruct | 3B | 32768 | Apache 2.0 | Referencia del autor; degrada anclaje de tool/SQL (ortogonalidad 0.83) y deriva KL 3.76 |
| Otros fine-tunes "uncensored" de 3B | no disponible | no disponible | variable | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para uso como asistente alineado; el autor declara fuera de alcance operaciones ofensivas de ciberseguridad, generación de malware y contenido ilícito.
- La eliminación de la dirección de rechazo puede aumentar la probabilidad de responder a peticiones sensibles; requiere filtros externos si se despliega en producción orientada al público.
- Riesgo de alucinación inherente a un modelo de 3B: menor fiabilidad factual que modelos de mayor tamaño, especialmente en dominios especializados.
- Las métricas publicadas (H9, H10, H11) son internas del autor y no están validadas por terceros ni corresponden a benchmarks estándar; deben interpretarse con cautela.
- El repositorio figura con 0 descargas, 0 likes y tamaño de 0.0 GB en el momento de la consulta, lo que indica ausencia de validación comunitaria y posible falta de materialización de pesos.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe más allá del que herede del modelo base.
- La técnica Lancet y el GRPO con compuertas se describen cualitativamente; no se publican detalles reproducibles (datasets, hiperparámetros, semillas).
- Licencia Apache 2.0 permite uso comercial, pero el despliegue debe acompañarse de moderación propia dada la naturaleza "uncensored" del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-3B-Qwen2.5-Unslop-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- OpenRouter: https://openrouter.ai
- Paper, blog o demo adicionales: no disponible
