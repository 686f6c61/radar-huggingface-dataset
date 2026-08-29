# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-8-step-200000

## Resumen

El modelo `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-8-step-200000` es un modelo de borrador (draft model) para decodificación especulativa, diseñado para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. Ha sido desarrollado por el autor huluhuluu y publicado en Hugging Face bajo licencia Apache 2.0. No es un modelo de chat independiente, sino un componente auxiliar que se integra en el pipeline de speculative decoding EAGLE3 mediante el framework SpecForge.

El modelo resuelve el problema del alto coste computacional de la generación autoregresiva: al proponer múltiples tokens candidatos en paralelo y validarlos con el modelo objetivo, reduce la latencia y aumenta el throughput en entornos de producción. Su relevancia actual radica en que la decodificación especulativa se ha convertido en una técnica estándar para servir LLMs de forma eficiente, especialmente en GPUs de consumo o en despliegues con restricciones de presupuesto.

Arquitectónicamente, es un modelo `LlamaForCausalLMEagle3` con una única capa decoder, tamaño oculto de 2560, 32 cabezas de atención y 8 cabezas clave/valor, con 202.700.416 parámetros en precisión bfloat16. Utiliza atención causal con ventana deslizante de 512 tokens y fue entrenado sobre datos ShareGPT con una longitud máxima de secuencia de 2048 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (EAGLE3 draft model, una capa decoder) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (máximo de entrenamiento); atención con ventana deslizante de 512 tokens |
| Tipos de cuantizacion | No disponible (pesos en bfloat16) |
| Idiomas soportados | No disponible (entrenado con ShareGPT, presumiblemente multilingüe, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo es un draft model para decodificación especulativa EAGLE3. Su arquitectura consiste en una única capa decoder (hidden size 2560, intermediate size 9728, 32 attention heads, 8 key/value heads) con atención causal de ventana deslizante de 512 tokens. El vocabulario de borrador es de 32000 tokens, mientras que el vocabulario del modelo objetivo es de 151936; esta diferencia permite que el draft model proponga tokens de forma eficiente sin replicar la cabecera completa del modelo grande.

El entrenamiento se realizó con el método online EAGLE3 / SpecForge, sobre un dataset ShareGPT limpio (fuente local, sin revisión registrada). Se ejecutaron 10 épocas con un total de 231810 pasos de optimización, batch size efectivo de 4, learning rate 1e-4 con warmup lineal del 1.5% y posterior decaimiento coseno. La longitud máxima de secuencia fue de 2048 tokens, con una longitud de entrenamiento TTT (test-time training) de 7 y ventana deslizante de 512 tokens. No se aplicó weight decay (0.0) y el gradiente máximo se fijó en 0.5. El backend objetivo es SGLang con flashinfer y tensor parallel size 1.

No se utilizaron técnicas de RLHF ni DPO. El entrenamiento fue puramente supervisado sobre el dataset ShareGPT, con el objetivo de que el draft model prediga los tokens del modelo objetivo de forma precisa y rápida.

## Capacidades

- Generación de borradores para decodificación especulativa: el modelo propone secuencias de tokens candidatos que luego son verificados por el modelo objetivo Qwen3-4B-Instruct-2507.
- Aceleración de inferencia: al reducir el número de pasos autoregresivos necesarios, disminuye la latencia y aumenta el throughput en comparación con la decodificación estándar.
- Compatibilidad con SGLang: diseñado específicamente para usarse como ruta de draft en SGLang con EAGLE3 speculative decoding.
- Ventana deslizante de 512 tokens: limita el contexto de atención del draft model, lo que reduce el coste computacional durante la generación de borradores.
- No es un modelo de chat standalone: no genera respuestas por sí mismo, no soporta tool calling, agentes ni razonamiento multi-paso. Todas las capacidades funcionales provienen del modelo objetivo al que acompaña.

## Casos de uso

- Despliegue de Qwen3-4B-Instruct-2507 en producción con baja latencia: integrar este draft model como ruta especulativa en SGLang permite reducir el tiempo de primera respuesta y el tiempo entre tokens, mejorando la experiencia de usuario en aplicaciones interactivas.
- Servicio de múltiples peticiones concurrentes: al aumentar el throughput de generación, el modelo permite atender más solicitudes simultáneas con el mismo hardware, reduciendo costes de infraestructura.
- Generación de código en entornos CI/CD: aunque el draft model no genera código, al acelerar el modelo objetivo facilita la integración de asistentes de código en pipelines de desarrollo donde la latencia es crítica.
- Atención al cliente automatizada: en sistemas de chat multi-turno, la reducción de latencia hace que las conversaciones sean más fluidas y naturales, mejorando la satisfacción del usuario.
- Investigación y evaluación de técnicas de speculative decoding: los 47 checkpoints publicados (desde epoch_0_step_5000 hasta epoch_9_step_231810) permiten estudiar el efecto del entrenamiento progresivo en la calidad de los borradores.
- Benchmarking de configuraciones de árbol (tree settings) en SGLang: el modelo es adecuado para experimentar con diferentes parámetros de árbol (por ejemplo, ancho y profundidad) y medir el rendimiento en distintas cargas de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation or safety metrics were recorded for this run." Por tanto, no se dispone de métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni de comparativas con otros modelos.

## Requisitos de hardware

- El draft model en sí ocupa aproximadamente 0.4 GB en bfloat16, por lo que su huella de memoria es muy reducida.
- Sin embargo, al usarse junto con el modelo objetivo Qwen3-4B-Instruct-2507, la VRAM total necesaria depende del modelo grande. Para Qwen3-4B en bfloat16 se requieren al menos 8 GB de VRAM, aunque se recomienda 12-16 GB para margen.
- GPUs recomendadas: RTX 4090 (24 GB) o superior para uso en consumer; A100 (40/80 GB) o H100 para despliegues profesionales. En GPUs con menos de 8 GB se podría cuantizar el modelo objetivo, pero el draft model se mantiene en bf16.
- Opciones de despliegue: SGLang con backend flashinfer (especificado en la model card). No se menciona compatibilidad con vLLM, llama.cpp u Ollama; se recomienda verificar la documentación de SGLang para la configuración de EAGLE3.
- Latencia y throughput estimados: no disponible. Dependen del hardware, de la configuración de árbol (tree settings) y de la carga de trabajo. La model card sugiere que los tree settings deben ser ajustados para cada carga de trabajo.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. Este modelo pertenece a una colección de 47 checkpoints del mismo entrenamiento (desde epoch_0_step_5000 hasta epoch_9_step_231810), cada uno publicado como repositorio independiente. Los checkpoints de épocas anteriores (por ejemplo, epoch-0-step-5000 y epoch-1-step-30000) están disponibles en Hugging Face y pueden compararse entre sí para estudiar la evolución del entrenamiento, pero no existen comparaciones con otros draft models de EAGLE3 para Qwen3-4B-Instruct-2507 en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat independiente: usarlo directamente para generar texto producirá resultados sin sentido. Debe emparejarse con el modelo objetivo exacto `Qwen/Qwen3-4B-Instruct-2507`.
- Entrenado únicamente con datos ShareGPT: el dataset ShareGPT es predominantemente conversacional y puede contener sesgos de idioma y temática. No se ha verificado su cobertura multilingüe.
- Sin evaluación de seguridad ni sesgos: la model card indica explícitamente que no se registraron métricas de evaluación ni de seguridad. No se recomienda su uso en aplicaciones sensibles sin una validación adicional.
- Ventana deslizante limitada a 512 tokens: el draft model solo considera un contexto de 512 tokens, lo que puede afectar a la calidad de los borradores en secuencias largas. El modelo objetivo puede manejar contextos mayores, pero el draft model no los aprovecha.
- Dependencia de la configuración de SGLang: el rendimiento de la decodificación especulativa depende críticamente de los parámetros de árbol y de la versión de SGLang. Es necesario realizar benchmarks para cada entorno.
- Licencia Apache 2.0: permite uso comercial, pero se debe revisar la licencia del modelo base Qwen3-4B-Instruct-2507 (también Apache 2.0) para asegurar el cumplimiento.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-8-step-200000
- Checkpoint epoch-1-step-30000: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-1-step-30000
- Checkpoint epoch-0-step-5000: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-0-step-5000
- Repositorio oficial de EAGLE-Qwen3 (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Página del modelo base Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
