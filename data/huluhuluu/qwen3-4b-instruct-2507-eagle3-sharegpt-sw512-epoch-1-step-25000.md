# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-1-step-25000

## Resumen

Este repositorio contiene un modelo de borrador (draft model) para decodificación especulativa EAGLE3, diseñado específicamente para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. Ha sido desarrollado por el usuario huluhuluu mediante un entrenamiento online con SpecForge sobre datos ShareGPT, y publicado bajo licencia Apache 2.0. No es un modelo de chat independiente: su única función es predecir múltiples tokens candidatos en paralelo para que el modelo objetivo los valide, reduciendo la latencia de generación en entornos de producción.

El modelo tiene una arquitectura extremadamente ligera: una sola capa de decoder con 202,7 millones de parámetros, hidden size de 2560 y atención de ventana deslizante de 512 tokens. Esta es una de las primeras implementaciones públicas de EAGLE3 aplicada a la familia Qwen3, y resulta relevante porque permite desplegar Qwen3-4B-Instruct-2507 con menor latencia sin sacrificar calidad de salida, siempre que se use con el backend SGLang y la configuración de decodificación especulativa adecuada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa de decoder) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (ventana deslizante del draft); secuencia maxima de entrenamiento 2048 |
| Tipos de cuantizacion | bfloat16 (pesos originales) |
| Idiomas soportados | No disponible (depende del modelo objetivo Qwen3-4B-Instruct-2507) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `LlamaForCausalLMEagle3`, que es una variante de EAGLE3 (Extended Architecture for Generalised Linear Exploration) adaptada para decodificación especulativa. Consiste en una única capa de decoder con hidden size 2560, tamaño intermedio 9728, 32 cabezas de atencion y 8 cabezas clave/valor, con atención causal de ventana deslizante de 512 tokens. El vocabulario del draft es de 32000 tokens, mientras que el del modelo objetivo es de 151936, por lo que el draft solo predice sobre un subconjunto del vocabulario.

El entrenamiento se realizó de forma online con SpecForge, un marco para entrenar modelos de borrador durante la inferencia. Se usaron datos ShareGPT limpios (JSONL local, sin registro de revisión), 10 épocas, 231810 pasos de optimizador, batch efectivo de 4, learning rate 1e-4 con warmup lineal del 1,5% y decaimiento coseno, weight decay 0 y gradiente máximo 0,5. La longitud máxima de secuencia fue 2048 tokens, con una longitud de entrenamiento TTT (test-time training) de 7 tokens para el draft. El backend objetivo fue SGLang con flashinfer y tensor parallel de 1. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- Decodificación especulativa: genera hasta 7 tokens candidatos por paso (EAGLE3 TTT length) para acelerar la inferencia del modelo objetivo Qwen3-4B-Instruct-2507.
- Compatibilidad con SGLang: diseñado para usarse como ruta de draft en SGLang con el backend flashinfer, aprovechando la configuración EAGLE3 soportada por esa librería.
- Ventana deslizante de 512 tokens: limita el contexto del draft a los últimos 512 tokens, reduciendo el coste computacional y la memoria necesaria.
- No es un modelo de generación autónoma: no produce respuestas por sí mismo, solo propone continuaciones que el modelo objetivo valida.
- Integración con el ecosistema Qwen3: funciona exclusivamente con `Qwen/Qwen3-4B-Instruct-2507`, no con otras variantes.
- Entrenamiento en datos conversacionales: ShareGPT, lo que lo hace adecuado para cargas de trabajo de chat y asistencia.

## Casos de uso

- Servicio de chat de baja latencia: desplegar Qwen3-4B-Instruct-2507 con este draft model en SGLang reduce el tiempo por token en cargas de trabajo de conversación multi-turno, donde la ventana deslizante de 512 tokens cubre el contexto reciente.
- Optimización de costes por petición: al acelerar la generación, se reduce el tiempo de ocupación de GPU, lo que permite servir más peticiones con el mismo hardware.
- Prototipado de sistemas de agentes: para aplicaciones que requieren múltiples llamadas al modelo (reasoning, tool calling), la menor latencia por llamada mejora la experiencia del usuario final.
- Evaluación de decodificación especulativa: investigadores pueden usar este checkpoint como referencia para comparar configuraciones de árbol (tree settings) y longitudes de ventana en SGLang.
- Despliegue en entornos con GPU limitada: al ser un modelo de solo 202M parámetros, cabe en cualquier GPU que ya ejecute el modelo objetivo (4B), sin requisitos adicionales significativos de VRAM.
- Benchmarking de throughput: en pipelines de prueba de rendimiento, permite medir la mejora de tokens por segundo frente a la generación autoregresiva estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explícitamente que no se registraron métricas de evaluación ni de seguridad para este entrenamiento. Se recomienda al usuario realizar sus propias pruebas de latencia y throughput en su carga de trabajo específica.

## Requisitos de hardware

- VRAM estimada: el draft model ocupa aproximadamente 0,4 GB en bf16 (202M parámetros × 2 bytes). El modelo objetivo Qwen3-4B-Instruct-2507 requiere ~8 GB en bf16, o ~4 GB en cuantización de 4 bits. En total, para ejecutar ambos en SGLang se necesitan al menos 9-10 GB de VRAM en bf16, o 5-6 GB con cuantización del target.
- GPU recomendadas: cualquier GPU con más de 10 GB de VRAM es suficiente, por ejemplo RTX 3080/3090/4090, A10, A100, L4, o instancias cloud como T4 (16 GB) o V100 (16 GB).
- Es compatible con GPUs consumer (RTX 30/40 series) siempre que se use SGLang con soporte CUDA.
- Opciones de despliegue: SGLang es el backend recomendado (la model card menciona flashinfer). No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que EAGLE3 requiere soporte específico de decodificación especulativa.
- Latencia y throughput: no se proporcionan datos medidos. Dependerá del hardware, del tamaño del árbol de especulación y de la carga de trabajo.

## Comparativa con modelos similares

No hay información disponible sobre comparativas directas con otros modelos de borrador (por ejemplo, EAGLE-1, EAGLE-2, Medusa o draft models de otras familias) en la documentación proporcionada. Este checkpoint es específico para Qwen3-4B-Instruct-2507 y no se han publicado métricas comparativas. Se recomienda consultar el repositorio oficial de EAGLE (GitHub - Yunhai-Hu/EAGLE-Qwen3) para entender las diferencias metodológicas con versiones anteriores.

## Limitaciones y advertencias

- No es un modelo de chat autónomo: usarlo directamente como modelo de generación producirá resultados incoherentes. Debe emparejarse con el target `Qwen/Qwen3-4B-Instruct-2507`.
- Ventana de contexto reducida: el draft solo considera los últimos 512 tokens, lo que puede afectar a la calidad de las predicciones en conversaciones muy largas (aunque el target sí tiene contexto completo).
- Entrenado con datos ShareGPT: el dataset proviene de conversaciones reales de usuarios, lo que puede introducir sesgos de contenido, idioma (principalmente inglés) y formalidad. El repositorio oficial de EAGLE advierte que ShareGPT ha eliminado datos no ingleses, por lo que el rendimiento en otros idiomas puede ser inferior.
- Sin métricas de seguridad: no se realizó ninguna evaluación de sesgos, toxicidad o alucinación durante el entrenamiento. Es responsabilidad del usuario validar el comportamiento antes de usarlo en producción.
- Dependencia de SGLang: la integración requiere una versión de SGLang con soporte EAGLE3 y flashinfer. Otras librerías de inferencia pueden no ser compatibles.
- El archivo `training_state.pt` incluido en los checkpoints contiene estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza por riesgo de ejecución de código arbitrario.
- No se proporcionan garantías de rendimiento: al ser un entrenamiento experimental (online EAGLE3 con SpecForge), la aceleración real puede variar significativamente según la carga de trabajo y la configuración del árbol de especulación.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-1-step-25000
- Checkpoint anterior (epoch 1, step 25000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-1-step-25000
- Checkpoint posterior (epoch 1, step 30000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-1-step-30000
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio oficial EAGLE-Qwen3: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Ficha de Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
