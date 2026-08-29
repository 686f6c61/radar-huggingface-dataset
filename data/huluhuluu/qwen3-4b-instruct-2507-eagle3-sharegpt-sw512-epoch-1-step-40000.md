# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-1-step-40000

## Resumen

Este repositorio contiene un modelo de draft para decodificación especulativa EAGLE3, entrenado sobre el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. Ha sido desarrollado por el usuario `huluhuluu` mediante la herramienta SpecForge, que permite entrenamiento online de modelos de draft durante el servicio. El modelo resultante es un pequeño componente de una sola capa decoder con 202,7 millones de parámetros, diseñado para acelerar la inferencia del modelo base de 4B en entornos de producción que usan SGLang.

La relevancia de este modelo radica en que la decodificación especulativa permite reducir la latencia de generación sin degradar la calidad, al proponer múltiples tokens candidatos que el modelo objetivo verifica en paralelo. Al estar entrenado con datos ShareGPT y una ventana deslizante de 512 tokens, este draft model está optimizado para conversaciones multi-turno con contexto reciente. No es un modelo de chat independiente: debe emparejarse con el modelo objetivo exacto `Qwen/Qwen3-4B-Instruct-2507` y usarse exclusivamente como ruta de borrador en SGLang.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, atención causal con ventana deslizante de 512 tokens) |
| Parametros totales | 202.700.416 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (máximo de secuencia de entrenamiento; atención efectiva limitada a 512 por ventana deslizante) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se mencionan cuantizaciones adicionales) |
| Idiomas soportados | no disponible (el dataset ShareGPT es mayoritariamente inglés; no se especifican otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura `LlamaForCausalLMEagle3`, que corresponde a un modelo de draft EAGLE3 con una única capa decoder. Las dimensiones son: hidden size 2560, intermediate size 9728, 32 cabezas de atención, 8 cabezas clave/valor, vocabulario de draft de 32000 tokens y vocabulario objetivo de 151936 tokens. La atención es causal con ventana deslizante de 512 tokens, implementada con `sdpa` (scaled dot-product attention). Los pesos están en bfloat16.

El entrenamiento se realizó con el método online EAGLE3 mediante SpecForge, sobre datos ShareGPT limpios (fuente local, sin revisión registrada). Se ejecutaron 10 épocas con un total de 231810 pasos de optimización, batch efectivo de 4, learning rate de 1e-4 con warmup lineal del 1.5% y posterior cosine annealing, weight decay 0.0 y max grad norm 0.5. La longitud máxima de secuencia fue 2048 tokens, con TTT length 7 (longitud de test-time training) y ventana deslizante de draft de 512. El backend objetivo fue SGLang con flashinfer y tensor parallel size 1.

El archivo `training_state.pt` almacena el estado del optimizador y los argumentos de entrenamiento para reanudar, pero solo debe deserializarse en entornos de confianza. Para inferencia se prefiere `model.safetensors`.

## Capacidades

- Aceleración de la generación autoregresiva del modelo `Qwen/Qwen3-4B-Instruct-2507` mediante decodificación especulativa EAGLE3.
- Generación de múltiples tokens candidatos en paralelo (tree decoding) que el modelo objetivo verifica, reduciendo el número de pasos secuenciales.
- Manejo de conversaciones multi-turno gracias a la ventana deslizante de 512 tokens, adecuada para diálogos con contexto reciente.
- Compatibilidad con SGLang como ruta de draft (`draft_path`), con soporte para configuraciones de árbol especulativo.
- Entrenamiento específico sobre datos ShareGPT, lo que lo hace particularmente eficaz en diálogos estilo chat en inglés.
- No es un modelo de propósito general: no genera texto autónomo ni soporta tool calling, razonamiento o vision por sí mismo.

## Casos de uso

- Servicios de chat en producción: desplegar `Qwen3-4B-Instruct-2507` con este draft model en SGLang reduce la latencia percibida en conversaciones multi-turno, manteniendo la calidad del modelo base.
- Reducción de costes de inferencia: al acelerar la generación, se puede atender la misma carga con menos GPU o con GPUs más modestas, especialmente en entornos con alta concurrencia.
- Integración en pipelines de generación de código: si se usa `Qwen3-4B-Instruct-2507` como asistente de código, el draft model acelera la finalización de bloques, mejorando la experiencia del desarrollador.
- Investigación en decodificación especulativa: sirve como punto de partida para estudiar el impacto de la ventana deslizante, la longitud TTT y otros hiperparámetros en la tasa de aceptación de tokens.
- Ajuste fino adicional del draft model: los 47 checkpoints publicados permiten seleccionar el punto de entrenamiento óptimo o continuar el entrenamiento con datos específicos de dominio (p. ej., ShareGPT en otros idiomas).
- Evaluación de EAGLE3 frente a otras técnicas (Medusa, EAGLE-1/2): este repositorio proporciona un modelo listo para comparar en benchmarks de latencia y throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se registraron métricas de evaluación ni de seguridad. Para evaluar el rendimiento real, se recomienda medir la tasa de aceptación de tokens y la latencia end-to-end con SGLang en la carga de trabajo específica.

## Requisitos de hardware

- El draft model ocupa aproximadamente 0,4 GB en bfloat16 (202M parámetros), por lo que su huella de memoria es mínima.
- Debe desplegarse junto con el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` (4B parámetros), que en bfloat16 requiere unos 8-10 GB de VRAM según la longitud de secuencia y el batch.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (p. ej., NVIDIA RTX 3060, RTX 4090, A10, L4, A100). Para producción con alta concurrencia se recomienda A10 o superior.
- La inferencia se realiza con SGLang (backend flashinfer); el modelo card no menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput no se han publicado; dependen de la configuración del árbol especulativo (tree settings) y de la carga de trabajo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Uso |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (base) | 4B | 32768 (según documentación oficial) | Modelo completo | Apache 2.0 | Chat, razonamiento, código |
| Este draft model (EAGLE3) | 202M | 2048 (ventana 512) | Draft especulativo | Apache 2.0 | Acelerar al modelo base |
| EAGLE-2 (para Qwen2) | ~100-300M | 2048 | Draft especulativo | Apache 2.0 | Acelerar modelos Qwen2 |

No se dispone de modelos comparables exactos de la misma familia EAGLE3 para Qwen3-4B-Instruct-2507 en la información consultada. La comparativa se limita a indicar que el draft model no sustituye al modelo base, sino que lo complementa.

## Limitaciones y advertencias

- No es un modelo de chat independiente: su uso fuera del contexto de decodificación especulativa con `Qwen/Qwen3-4B-Instruct-2507` no tiene sentido.
- Ventana deslizante de 512 tokens: limita la capacidad de capturar dependencias de largo alcance; para secuencias muy largas, la tasa de aceptación puede degradarse.
- Dataset de entrenamiento ShareGPT: mayoritariamente inglés y con sesgos propios de conversaciones de usuarios de internet; el rendimiento en otros idiomas puede ser inferior.
- No se registraron métricas de seguridad ni de evaluación: no hay garantía de calidad o de alineación en producción.
- El archivo `training_state.pt` contiene estado del optimizador y argumentos de entrenamiento; deserializarlo en entornos no confiables supone un riesgo de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Se recomienda ajustar los tree settings de SGLang según la carga de trabajo; una configuración subóptima puede reducir las ganancias de latencia o incluso degradar el rendimiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-1-step-40000
- Colección de checkpoints (47 repos): https://huggingface.co/collections/huluhuluu/qwen3-4b-instruct-2507-eagle3-sharegpt-checkpoints
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Implementación oficial EAGLE-Qwen3 (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Ficha de Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
