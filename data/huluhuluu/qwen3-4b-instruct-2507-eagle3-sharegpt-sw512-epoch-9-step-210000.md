# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-9-step-210000

## Resumen

El modelo `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-9-step-210000` es un **draft model** (modelo de borrado) para decodificación especulativa, entrenado con el método EAGLE3 sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo de chat independiente: su función es acelerar la inferencia del modelo objetivo generando candidatos de tokens que el modelo principal verifica en paralelo, reduciendo la latencia por token en entornos de servidor como SGLang.

El modelo fue desarrollado por el usuario `huluhuluu` y forma parte de una colección de 47 checkpoints publicados en Hugging Face, correspondientes a diferentes pasos de entrenamiento (de `epoch_0_step_5000` a `epoch_9_step_231810`). Este checkpoint concreto corresponde a `epoch_9_step_210000`. Con solo 202,7 millones de parámetros y una única capa decoder, es un modelo extremadamente ligero diseñado para ser emparejado exclusivamente con su modelo objetivo de la familia Qwen3-4B-Instruct-2507.

La relevancia de este modelo radica en su capacidad para mejorar el throughput y reducir la latencia en despliegues de producción de Qwen3-4B-Instruct-2507, especialmente en escenarios de servicio concurrente, sin necesidad de modificar el modelo principal. El entrenamiento se realizó con datos ShareGPT limpios y una ventana deslizante de atención de 512 tokens, lo que limita su uso a contextos relativamente cortos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlamaForCausalLMEagle3` (una capa decoder, EAGLE3) |
| Parametros totales | 202.700.416 |
| Parametros activos | 202.700.416 (no es MoE) |
| Longitud de contexto | 2048 tokens (máximo de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 según model card) |
| Idiomas soportados | no disponible (depende del modelo objetivo Qwen3-4B-Instruct-2507, multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, `config.json`, `training_state.pt`) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura `LlamaForCausalLMEagle3`, una variante de una sola capa decoder diseñada específicamente para el método de decodificación especulativa EAGLE3. Los parámetros arquitectónicos incluyen tamaño oculto de 2560, tamaño intermedio de 9728, 32 cabezas de atención y 8 cabezas clave/valor, con un vocabulario de borrador de 32000 tokens (frente a los 151936 del modelo objetivo). La atención es de ventana deslizante causal de 512 tokens, implementada con `sdpa` (scaled dot-product attention).

El entrenamiento se realizó con el framework SpecForge en modo "online EAGLE3", utilizando datos ShareGPT limpios en formato JSONL. Los parámetros de entrenamiento incluyen 10 épocas, 231810 pasos de optimizador, tamaño de lote efectivo global de 4, tasa de aprendizaje de 1e-4 con calentamiento lineal del 1,5% y decaimiento coseno, y longitud máxima de secuencia de 2048 tokens. La longitud de TTT (Test-Time Training) de EAGLE3 se fijó en 7 tokens. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- **Aceleración de inferencia**: su función principal es generar borradores de tokens para el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` mediante decodificación especulativa EAGLE3, reduciendo la latencia de generación en entornos de servidor.
- **Integración con SGLang**: diseñado para usarse como ruta de borrado especulativo en SGLang con backend `flashinfer`.
- **Emparejamiento exclusivo**: solo funciona correctamente con el modelo base indicado; no es compatible con otros modelos de la familia Qwen3 ni con otros LLMs.
- **Ventana de borrado limitada**: la atención de ventana deslizante de 512 tokens restringe el contexto de borrado a secuencias cortas; el modelo objetivo puede tener contextos más largos, pero el borrado solo aprovecha los últimos 512 tokens.
- **Sin capacidades de chat directo**: no es un modelo de instrucción ni de conversación; no debe usarse de forma autónoma para generar respuestas.
- **Multilingüismo heredado**: las capacidades multilingües dependen del modelo objetivo Qwen3-4B-Instruct-2507, que es multilingüe, pero el draft model no aporta ninguna capacidad lingüística propia.

## Casos de uso

- **Despliegue de Qwen3-4B-Instruct-2507 en producción con SGLang**: el caso de uso principal. Se configura el draft model como ruta de decodificación especulativa junto al modelo objetivo, reduciendo el tiempo por token en servicios de chat o generación de texto.
- **Servicio de API de baja latencia**: empresas que ofrecen Qwen3-4B-Instruct-2507 como API pueden usar este draft model para mejorar la experiencia de usuario en peticiones interactivas, donde la latencia por token es crítica.
- **Procesamiento por lotes de alta concurrencia**: en entornos con múltiples peticiones simultáneas, la decodificación especulativa aumenta el throughput global del servidor, permitiendo atender más usuarios con la misma infraestructura.
- **Evaluación de estrategias de decodificación especulativa**: investigadores pueden usar este checkpoint para comparar el rendimiento de EAGLE3 frente a otros métodos de borrado (p. ej., Medusa, Lookahead) sobre el mismo modelo base.
- **Ajuste de árboles de verificación**: el README indica que los ajustes de árbol (tree settings) deben ser evaluados para cada carga de trabajo; este modelo permite experimentar con diferentes configuraciones de árbol de candidatos en SGLang.
- **Investigación sobre modelos de borrado eficientes**: al ser un modelo pequeño (202M parámetros) y de una sola capa, sirve como caso de estudio para entender el impacto de la ventana deslizante y la arquitectura EAGLE3 en la tasa de aceptación de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente en la model card que "no se registraron métricas de evaluación ni de seguridad" para este entrenamiento. No hay datos de tasa de aceptación, latencia medida ni comparación con otros draft models en la documentación proporcionada.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 202,7 millones de parámetros en bfloat16, lo que supone aproximadamente 0,4 GB de peso. Con overhead de inferencia, se estima un consumo inferior a 1 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con soporte CUDA o ROCm y al menos 4 GB de VRAM es suficiente para el draft model en solitario. En un despliegue conjunto con Qwen3-4B-Instruct-2507 (4B parámetros), se necesita VRAM adicional para el modelo principal: aproximadamente 8-10 GB en cuantización INT4, 12-16 GB en bfloat16.
- **Compatibilidad con GPU de consumo**: sí, el draft model cabe en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, etc.) junto al modelo objetivo en cuantización ligera.
- **Opciones de despliegue**: SGLang (backend `flashinfer`) es la opción indicada por el autor. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en la documentación disponible.
- **Latencia y throughput**: no disponibles. Dependen de la configuración del árbol de verificación, la carga de trabajo y el hardware del servidor.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los draft models EAGLE3 suelen compararse con otras técnicas de decodificación especulativa (Medusa, Lookahead decoding, etc.), pero no hay datos concretos de este checkpoint frente a alternativas. Se indica "no disponible" por falta de referencias.

## Limitaciones y advertencias

- **No es un modelo de chat**: intentar usarlo como modelo independiente producirá resultados incorrectos o sin sentido. Debe emparejarse exclusivamente con `Qwen/Qwen3-4B-Instruct-2507`.
- **Ventana deslizante de 512 tokens**: el borrado especulativo solo considera los últimos 512 tokens de contexto. Para secuencias más largas, la eficiencia de la decodificación especulativa puede degradarse significativamente.
- **Datos de entrenamiento**: se usaron datos ShareGPT limpios, pero no se registró la revisión exacta del dataset ni se realizaron evaluaciones de seguridad o sesgo. No hay garantía de ausencia de contenido problemático en los datos de entrenamiento.
- **Riesgo de alucinación**: al ser un draft model, no genera contenido final; sin embargo, los tokens borradores incorrectos pueden influir en la salida del modelo objetivo si la verificación no los rechaza adecuadamente (riesgo bajo, pero no nulo).
- **Restricciones de uso en producción**: requiere una configuración cuidadosa de los parámetros de árbol de verificación en SGLang. El autor recomienda evaluar los ajustes de árbol para cada carga de trabajo específica.
- **Archivo `training_state.pt`**: contiene estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza, ya que podría ejecutar código arbitrario.
- **Sin soporte de thinking mode**: el modelo objetivo Qwen3-4B-Instruct-2507 no incluye modo de razonamiento (thinking), por lo que el draft model tampoco lo aporta.
- **Compatibilidad limitada**: el modelo requiere una versión de SGLang que soporte EAGLE3 y el backend `flashinfer`. No se garantiza compatibilidad con versiones antiguas o forks.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-9-step-210000
- Colección de checkpoints (47 repos): https://huggingface.co/collections/huluhuluu/qwen3-4b-instruct-2507-eagle3-sharegpt-checkpoints
- Primer checkpoint de la serie: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-0-step-5000
- Modelo base (Qwen3-4B-Instruct-2507): https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio oficial de Qwen3 (GitHub): https://github.com/QwenLM/Qwen3
- Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
