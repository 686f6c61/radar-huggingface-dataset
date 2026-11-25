# apalker/inkling2-looped-lens

## Resumen

Inkling2-looped-lens es un conjunto de pesos de interpretabilidad (no un modelo generativo) publicado por el usuario apalker como entrada al Looped Lens Challenge de NDIF. El objetivo del reto es construir una "lente" capaz de leer qué está computando el modelo Inkling 2 Mini de Thinking Machines en una posición de token concreta del prompt. Los pesos aquí publicados son los mapas "traductores" que se aplican sobre los estados ocultos del modelo base para proyectarlos hacia el espacio de logits.

El repositorio contiene únicamente tensores de tamaño reducido en formato safetensors y float16: cada traductor incluye un sesgo de dimensión 2304 y, opcionalmente, matrices `down` y `up` de bajo rango, además de un escalar `alpha` en la variante `post`. No se trata de un modelo con parámetros propios comparables a un LLM, sino de un artefacto auxiliar que depende por completo de los pesos de Inkling 2 Mini para tener sentido.

Su relevancia es acotada pero específica: sirve como ejemplo práctico de tuned lens sobre un modelo con arquitectura en bucle (visitas de capa 0 a 47), y permite a investigadores en interpretabilidad reproducir o comparar metodologías de lectura de activaciones internas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el propio autor advierte que los pesos incluidos (`standin.safetensors`) son sustitutos de prueba, no los de una entrada enviada al reto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapas traductores (tuned/logit lens) sobre estados ocultos de Inkling 2 Mini; sesgo [2304] y matrices `down` [2304, rank] / `up` [rank, 2304] |
| Parametros totales | No disponible (depende del rango `rank` de cada traductor; el sesgo solo suma 2304 valores) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Inkling 2 Mini, no especificada en la información) |
| Tipos de cuantizacion | No disponible; los tensores se publican en float16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (todos los tensores en float16) |

## Arquitectura y entrenamiento

Cada fichero contiene mapas "traductores" asociados a una visita de capa concreta (de 0 a 47, en el orden en que el modelo con bucle ejecuta las capas) y a una posición del prompt (por ejemplo `45q` para la visita 45 al final de la pregunta, o `44r` para la visita 44 en la posición de lectura). Un traductor toma el estado oculto `h` que entra en esa visita y lo transforma aplicando la normalización final del modelo y su unembedding, de modo que cada token que reporta la lente proviene de una activación real del modelo y no de una proyección arbitraria.

Se distinguen dos parametrizaciones. En `pre`, se normaliza `h` por su RMS, se aplica una corrección de bajo rango `(x @ down) @ up + bias` y se proyecta con `lm_head(norm(x * rms(h)))`. En `post`, se calcula `z = alpha * norm(h) + ((h / rms(h)) @ down) @ up + bias` y se aplica `lm_head(z)`. Un traductor sin matrices `down` y `up` se reduce a un sesgo. El metadata `parametrization` es un JSON que asigna a cada nombre su tipo (`pre` o `post`). No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo ajuste fino supervisado o preferencias; el autor solo indica que los pesos incluidos son sustitutos de prueba para validar el código de la entrada de extremo a extremo.

## Capacidades

- Lectura de activaciones internas: proyecta estados ocultos de visitas concretas de Inkling 2 Mini al espacio de logits del propio modelo.
- Soporte de dos parametrizaciones (`pre` y `post`) con corrección de bajo rango y sesgo.
- Compatibilidad con arquitecturas en bucle: los nombres codifican la visita de capa (0-47) y la posición del prompt.
- Uso como herramienta de diagnóstico para comparar logit lens y tuned lens en un mismo modelo.
- No genera texto, no razona, no ejecuta código ni soporta tool calling: es un artefacto de interpretabilidad.
- No dispone de capacidades multilingües propias; depende del vocabulario y los idiomas del modelo base.

## Casos de uso

- Investigación en interpretabilidad mecanicista: aplicar la lente sobre prompts concretos para inspeccionar qué tokens favorece el modelo en cada visita de capa y contrastar hipótesis sobre el flujo de información en un transformer con bucle.
- Validación de pipelines de tuned lens: usar `standin.safetensors` para probar de extremo a extremo el código de carga, el parseo del metadata `parametrization` y la aplicación de las fórmulas `pre`/`post` antes de ejecutar una entrada real al reto.
- Comparación de metodologías logit lens frente a tuned lens: al conservar la normalización final y el unembedding del modelo, permite medir la diferencia entre una lectura directa y una corregida por un mapa de bajo rango.
- Auditoría de representaciones en posiciones específicas: los nombres como `45q` o `44r` permiten focalizar el análisis en el final de la pregunta o en la posición de lectura, útil para estudiar cómo se forma la respuesta.
- Docencia y reproducción de experimentos: el formato compacto (float16, tensores de 2304 dimensiones) facilita montar cuadernos demostrativos sobre cómo una lente traduce activaciones en distribuciones de tokens.
- Integración en herramientas de visualización: los ficheros safetensors pueden consumirse desde scripts de Python para generar mapas de calor de probabilidad por capa y posición, apoyando la depuración de comportamientos anómalos del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para la lente: despreciable; los tensores son de dimensión 2304 y float16, con matrices de bajo rango, por lo que ocupan del orden de kilobytes a pocos megabytes según el `rank`.
- VRAM para el modelo base: no disponible en la información proporcionada; depende de Inkling 2 Mini, que no se especifica aquí.
- GPU recomendadas: no disponible para el modelo base; la lente en sí puede cargarse en CPU o en cualquier GPU consumer.
- Cabe en GPU consumer: la lente sí; el modelo base no se puede evaluar con los datos disponibles.
- Opciones de despliegue: carga directa con `safetensors` y PyTorch; no aplica vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Dimensión de estado | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| apalker/inkling2-looped-lens | Tuned/logit lens sobre Inkling 2 Mini | 2304 | safetensors float16 | MIT | Hugging Face, 0 descargas |
| Lentes logit lens estándar | Proyección directa con unembedding | Depende del modelo | Variable | Variable | Implementaciones en librerías de interpretabilidad |
| Tuned lens genéricas (p. ej. para GPT-2, LLaMA) | Mapas afines por capa | Depende del modelo | safetensors/PyTorch | Variable | Repositorios de investigación |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Los pesos incluidos (`standin.safetensors`) son sustitutos de prueba y no corresponden a una entrada enviada al reto; no deben interpretarse como una lente validada.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso o validación por parte de la comunidad.
- No es un modelo generativo: no puede emplearse para texto, código, razonamiento ni agentes; su utilidad está limitada al análisis de activaciones de Inkling 2 Mini.
- Depende por completo del modelo base: sin los pesos y la configuración exacta de Inkling 2 Mini, las lentes carecen de sentido.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe, porque la lente no produce texto propio.
- La licencia MIT permite uso comercial del artefacto, pero no aclara las condiciones del modelo base subyacente, que deben consultarse por separado.
- El tamaño del repositorio figura como 0.0 GB, lo que sugiere que los tensores son muy pequeños o que la información de tamaño no está actualizada; conviene verificar los ficheros antes de usarlos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/apalker/inkling2-looped-lens
- Modelo base Inkling 2 Mini: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Looped Lens Challenge (NDIF): https://ndif.us/looped-lens-challenge/
