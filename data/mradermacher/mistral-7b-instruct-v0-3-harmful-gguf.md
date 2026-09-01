# mradermacher/Mistral-7B-Instruct-v0.3-Harmful-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `Mistral-7B-Instruct-v0.3-Harmful`, una variante no oficial del modelo `Mistral-7B-Instruct-v0.3` de Mistral AI, aparentemente modificada para eliminar mecanismos de moderación y filtrado de contenido. El autor, `mradermacher`, es un usuario de Hugging Face conocido por publicar cuantizaciones GGUF de diversos modelos, y este repositorio es una conversión estática del modelo original alojado en `sayandasscientistcoder/Mistral-7B-Instruct-v0.3-Harmful`.

El modelo base, Mistral-7B-Instruct-v0.3, es un transformer de 7.240 millones de parámetros con una ventana de contexto de 32.768 tokens, entrenado para seguir instrucciones y realizar tareas de conversación y function calling. La versión "Harmful" no incluye documentación sobre el proceso de modificación, pero por su nombre y el contexto de otros modelos similares, se infiere que se ha eliminado la capa de moderación, lo que permite generar contenido que el modelo original rechazaría. Esto lo hace relevante para desarrolladores que necesitan un modelo sin restricciones para investigación o aplicaciones específicas, aunque con riesgos legales y éticos considerables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Mistral-7B) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base tiene 32.768 tokens) |
| Tipos de cuantizacion | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible (el modelo base soporta principalmente ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Mistral-7B-Instruct-v0.3 es un transformer autoregresivo con atención de ventana deslizante (sliding window attention) y un mecanismo de atención de ventana completa en las ultimas capas. Fue entrenado sobre un corpus multilingue de aproximadamente 8 billones de tokens y posteriormente ajustado con instrucciones y preferencias humanas mediante RLHF. La version "Harmful" es un fine-tune no documentado del modelo base, probablemente realizado mediante tecnicas de "abliteration" o eliminacion de capas de rechazo, como se observa en otros modelos similares de la comunidad. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens adicionales ni el metodo exacto de modificacion.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Mistral-7B-Instruct-v0.3.
- Soporte de function calling y tool calling, segun las capacidades del modelo base.
- Razonamiento basico y generacion de codigo, aunque con limitaciones propias de un modelo de 7B.
- Capacidad multilingue limitada, principalmente ingles, aunque el modelo base fue entrenado con datos multilingues.
- La version "Harmful" elimina los mecanismos de moderacion, permitiendo generar contenido que el modelo original rechazaria (violencia, lenguaje ofensivo, instrucciones peligrosas, etc.).
- No se ha confirmado si mantiene el modo de razonamiento extendido o capacidades especiales adicionales.

## Casos de uso

- Investigacion academica sobre sesgos y alucinaciones en modelos sin moderacion: el modelo permite estudiar como se comporta un LLM cuando se eliminan las restricciones de seguridad, util para papers sobre etica y robustez.
- Generacion de contenido creativo sin censura: escritores y artistas pueden usarlo para explorar temas tabu o estilos provocativos que otros modelos bloquean.
- Pruebas de estres en sistemas de moderacion: desarrolladores de filtros de contenido pueden usar este modelo para generar ejemplos adversarios y evaluar la eficacia de sus sistemas.
- Desarrollo de agentes conversacionales para nichos especificos (por ejemplo, roleplay sin restricciones) donde se requiere ausencia de filtros.
- Evaluacion de tecnicas de "abliteration" y su impacto en la calidad de generacion, comparando con el modelo original.
- Entornos de investigacion en los que se necesita un modelo que no rechace peticiones, como simulaciones de interacciones extremas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Dado que es una cuantizacion GGUF de un fine-tune no documentado, no se puede garantizar que mantenga el rendimiento del modelo base Mistral-7B-Instruct-v0.3 en tareas estandar como MMLU, HumanEval o GSM8K. Se recomienda evaluar el modelo en el caso de uso especifico antes de desplegarlo en produccion.

## Requisitos de hardware

- Para la cuantizacion Q4_K_M (aproximadamente 4,5 GB de peso), se necesita una GPU con al menos 6 GB de VRAM para inferencia con contexto corto, y 8 GB para contexto largo.
- La cuantizacion Q8_0 (aproximadamente 7,5 GB) requiere una GPU con 10-12 GB de VRAM, como una RTX 3080 o superior.
- Las cuantizaciones Q2_K y Q3_K pueden ejecutarse en GPUs con 4 GB de VRAM, aunque con perdida de calidad.
- Es compatible con motores de inferencia como llama.cpp, Ollama, vLLM (con adaptador GGUF) y TGI (con conversion previa).
- En CPU, se puede ejecutar con llama.cpp, pero la velocidad sera baja (menos de 5 tokens/segundo en un procesador moderno).
- Para despliegue en produccion con alta concurrencia, se recomienda una GPU A100 o H100 con cuantizacion Q4_K_M y vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-7B-Instruct-v0.3 (original) | 7,24B | 32.768 | Apache 2.0 | safetensors | Modelo base con moderacion |
| mradermacher/Mistral-7B-Instruct-v0.3-GGUF | 7,24B | 32.768 | no disponible | GGUF | Cuantizacion del modelo original sin modificaciones |
| mradermacher/Mistral-7B-Instruct-v0.3-abliterated-i1-GGUF | 7,24B | 32.768 | no disponible | GGUF | Variante "abliterated" (sin moderacion) similar a este modelo |
| Este modelo (Harmful) | 7,24B | no disponible | no disponible | GGUF | Fine-tune no documentado, sin moderacion |

La comparativa se basa en caracteristicas tecnicas, ya que no hay datos de rendimiento publicados para ninguna de las variantes "abliterated" o "harmful". El modelo original de Mistral tiene una licencia Apache 2.0, pero esta version no especifica su licencia, lo que limita su uso comercial.

## Limitaciones y advertencias

- El modelo puede generar contenido explicito, violento, ofensivo o ilegal, y no tiene ningun mecanismo de moderacion. Su uso conlleva riesgos legales y eticos.
- No se dispone de informacion sobre el proceso de entrenamiento del fine-tune, por lo que no se puede garantizar su estabilidad ni su comportamiento en todos los escenarios.
- La calidad de generacion puede ser inferior al modelo base debido a la cuantizacion y a las modificaciones no documentadas.
- El modelo puede alucinar con facilidad, especialmente en tareas de razonamiento complejo o con contexto largo.
- No se ha verificado si mantiene la ventana de contexto completa de 32.768 tokens; se recomienda probar con contextos cortos inicialmente.
- La licencia no esta especificada, lo que impide su uso en proyectos comerciales sin autorizacion explicita del autor.
- El repositorio no incluye informacion sobre sesgos especificos, pero al ser un modelo sin moderacion, es probable que amplifique sesgos presentes en los datos de entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Mistral-7B-Instruct-v0.3-Harmful-GGUF
- Modelo base (original): https://huggingface.co/sayandasscientistcoder/Mistral-7B-Instruct-v0.3-Harmful
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Repositorio de cuantizaciones similares de mradermacher: https://huggingface.co/mradermacher/Mistral-7B-Instruct-v0.3-GGUF
- Repositorio de una variante "abliterated": https://huggingface.co/mradermacher/Mistral-7B-Instruct-v0.3-abliterated-i1-GGUF
