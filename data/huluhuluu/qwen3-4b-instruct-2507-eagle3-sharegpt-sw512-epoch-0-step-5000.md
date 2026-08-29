# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-0-step-5000

## Resumen

El modelo `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-0-step-5000` es un modelo de draft (borrador) para decodificación especulativa, entrenado con el método EAGLE3 en su variante online mediante la herramienta SpecForge. No es un modelo de chat independiente: su función es acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` generando múltiples tokens candidatos que el modelo principal verifica en paralelo. Fue desarrollado por el usuario `huluhuluu` y publicado bajo licencia Apache 2.0.

Se trata de un modelo pequeño, de aproximadamente 202,7 millones de parámetros, con una única capa de decoder, atención de ventana deslizante de 512 tokens y pesos en bfloat16. El entrenamiento se realizó sobre datos ShareGPT limpios, con 10 épocas y 231.810 pasos de optimización. Este checkpoint concreto corresponde al paso 5.000 de la época 0, y forma parte de una colección de 47 checkpoints publicados por separado.

La relevancia de este modelo radica en su uso práctico para reducir la latencia de inferencia de Qwen3-4B-Instruct-2507 en entornos de producción que usan SGLang. Al ser un draft model, no sustituye al modelo principal, sino que complementa su despliegue para mejorar el rendimiento en tareas de generación de texto y código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, atención sliding window) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Ventana deslizante de 512 tokens en el draft; el contexto efectivo lo define el modelo objetivo (Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | bfloat16 (safetensors) |
| Idiomas soportados | No disponible (el modelo base es multilingue, pero el draft no especifica cobertura) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa una arquitectura `LlamaForCausalLMEagle3`, específica para decodificación especulativa EAGLE3. Consta de una única capa de decoder con tamaño oculto de 2560, tamaño intermedio de 9728, 32 cabezas de atencion y 8 cabezas de clave/valor. El vocabulario del draft es de 32.000 tokens, mientras que el del modelo objetivo es de 151.936. La atencion es causal con ventana deslizante de 512 tokens, implementada con `sdpa`.

El entrenamiento se realizó con el metodo online EAGLE3 mediante SpecForge, sobre un dataset ShareGPT limpio (fuente local, sin revision registrada). Se usaron 10 épocas, 231.810 pasos de optimizacion, batch efectivo de 4, learning rate de 1e-4 con warmup lineal del 1,5% y decaimiento coseno, y longitud máxima de secuencia de 2048. La longitud TTT (test-time training) de EAGLE3 es de 7 tokens. No se aplicó weight decay y el gradiente máximo se limitó a 0,5. El backend objetivo es SGLang con flashinfer y tensor parallel de 1.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa: el modelo predice secuencias de tokens que el modelo objetivo verifica, reduciendo el numero de pasos de inferencia.
- Integracion con SGLang: se usa como ruta de draft en SGLang junto con `Qwen/Qwen3-4B-Instruct-2507`, aprovechando el soporte nativo de EAGLE3.
- Atencion de ventana deslizante de 512 tokens: limita el alcance del contexto que el draft considera al generar, lo que reduce coste computacional.
- Compatibilidad con el modelo objetivo: diseñado especificamente para emparejarse con Qwen3-4B-Instruct-2507, no con otros modelos.
- No es un modelo de chat: no genera respuestas finales por si mismo, solo propuestas de tokens.
- Sin soporte de tool calling, agentes, vision, audio ni otras capacidades especiales (no aplica al ser un draft model).

## Casos de uso

- Aceleracion de inferencia en servicios de chat con Qwen3-4B-Instruct-2507: al desplegar este draft con SGLang, se reduce la latencia por token en entornos de produccion con alta concurrencia, especialmente en tareas de generacion de texto y codigo.
- Optimizacion de costes en inferencia: al reducir el numero de pasos de decodificacion autoregresiva, se disminuye el uso de GPU y el coste por peticion en APIs o servicios internos.
- Despliegue en entornos con restricciones de latencia: aplicaciones de tiempo real (asistentes conversacionales, chatbots) donde cada milisegundo cuenta y el modelo principal es demasiado lento por si solo.
- Experimentacion con decodificacion especulativa: investigadores que quieran estudiar el impacto de EAGLE3 en modelos de la familia Qwen3, comparando diferentes checkpoints y configuraciones de arbol.
- Fine-tuning o continuacion del entrenamiento: el repositorio incluye `training_state.pt` con el estado del optimizador y los argumentos de entrenamiento, lo que permite reanudar el entrenamiento desde este punto si se dispone de un entorno de confianza.
- Evaluacion de calidad del draft: se puede usar para medir la tasa de aceptacion de tokens especulativos en distintos workloads, ajustando los parametros de arbol en SGLang.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se registraron metricas de evaluacion ni de seguridad para este entrenamiento. La eficiencia del draft debe medirse en terminos de tasa de aceptacion de tokens y reduccion de latencia en el entorno de despliegue concreto, no mediante benchmarks estandar de calidad de lenguaje.

## Requisitos de hardware

- El modelo de draft pesa aproximadamente 0,4 GB en bfloat16, por lo que cabe en cualquier GPU moderna, incluso en tarjetas de bajo perfil.
- En un despliegue tipico con SGLang, el draft se carga junto con el modelo objetivo Qwen3-4B-Instruct-2507. El modelo objetivo ocupa unos 8 GB en bfloat16 (4B parametros), por lo que la VRAM total necesaria es de aproximadamente 9-10 GB.
- Es viable en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB) para pruebas locales, y en GPUs de datacenter como A10, A100 o H100 para produccion.
- El backend recomendado es SGLang con flashinfer; no se menciona soporte en vLLM, llama.cpp u Ollama para este tipo de draft model EAGLE3.
- La latencia y el throughput dependen del modelo objetivo, del arbol especulativo configurado y del hardware. No se disponen de cifras concretas del autor.

## Comparativa con modelos similares

No se dispone de informacion suficiente sobre otros draft models EAGLE3 especificos para Qwen3-4B-Instruct-2507 publicados en el ecosistema. El modelo base Qwen3-4B-Instruct-2507 tiene 4.000 millones de parametros y es el modelo que este draft acelera. Comparativamente, este draft model es mucho mas pequeño (202M vs 4B) y no puede generar texto por si mismo. No hay datos publicados de otros draft models comparables en cuanto a rendimiento o tasa de aceptacion, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo de forma independiente producira salidas sin sentido, ya que solo genera tokens especulativos.
- Entrenado exclusivamente con datos ShareGPT (principalmente ingles), lo que puede limitar su eficacia en otros idiomas, aunque el modelo base es multilingue.
- La ventana deslizante de 512 tokens restringe el alcance del contexto que el draft considera; para secuencias muy largas, la tasa de aceptacion puede degradarse.
- No se han registrado metricas de seguridad ni de sesgo; no hay garantias de comportamiento seguro en entornos de produccion.
- El archivo `training_state.pt` contiene el estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza para evitar riesgos de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo derivado esta sujeto a la licencia del modelo base (Qwen3-4B-Instruct-2507), que puede tener condiciones adicionales.
- La configuracion optima del arbol especulativo debe ajustarse segun la carga de trabajo; no hay valores recomendados por el autor.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-0-step-5000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio oficial de EAGLE-Qwen3 (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Pagina de Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Guia de instalacion de Qwen3-4B-Instruct-2507 (WAY TO AI): https://www.way-to-ai.com/install-qwen3-4b-instruct-2507-dummy-proof-guide/
