# larry077/ReentryMem

## Resumen

ReentryMem es un checkpoint de inferencia publicado por el usuario larry077 (repositorio GitHub Larry-077/ReentryMem) asociado al trabajo "Out of View, Still in Motion: Dynamic Entity Re-entry in Video World Models". Se trata de un ajuste fino del modelo base Wan-AI/Wan2.2-TI2V-5B orientado a la generacion de video condicionada por camara, con el objetivo especifico de mantener la coherencia de entidades dinamicas que salen y vuelven a entrar en el encuadre (re-entry). El bundle contiene el DiT fusionado en BF16 junto con los parametros de condicionamiento de camara en el paso 1496 de entrenamiento, en la variante `single-entity`.

El modelo resuelve un problema concreto de los world models de video: cuando una entidad abandona el campo de vision, los modelos generativos tienden a perder su identidad y su trayectoria, de modo que al reaparecer lo hacen de forma incoherente. ReentryMem incorpora condicionamiento de camara y una variante `localized` con muestreo calibrado de la region de la entidad para sostener esa coherencia sin necesidad de mascaras ni frames RGB futuros. La generacion por defecto emplea 77 frames observados y 76 futuros, a 832x480 y 15 fps, con 50 pasos y CFG 5.

Es relevante ahora porque los world models de video estan pasando de la demostracion a la simulacion utilizable, y la persistencia de entidades es uno de los cuellos de botella practicos. El checkpoint se distribuye con licencia Apache 2.0, pesa 10 GB y requiere descargar por separado el text encoder, el tokenizer y el VAE del modelo base Wan2.2-TI2V-5B. No es un pipeline estandar de Diffusers, sino un modelo condicionado por camara que necesita el repositorio de inferencia propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DiT (diffusion transformer) sobre Wan2.2-TI2V-5B, con parametros de condicionamiento de camara |
| Parametros totales | no disponible (el modelo base Wan2.2-TI2V-5B declara 5B en su denominacion; el checkpoint no detalla el recuento exacto) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (condicionado por frames: 77 observados + 76 futuros por defecto) |
| Tipos de cuantizacion | BF16 (pesos del DiT fusionado); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de generacion de video; el texto proviene del text encoder de Wan2.2) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con verificacion mediante `checksums.json` |
| Tamano del repositorio | 10.0 GB |
| Variante | `single-entity` (checkpoint del paso 1496) |
| Resolucion y fps por defecto | 832x480, 15 fps |
| Pasos de muestreo y CFG por defecto | 50 pasos, CFG 5 |
| Fecha de publicacion | 17 de noviembre de 2026 |

## Arquitectura y entrenamiento

ReentryMem se construye sobre Wan2.2-TI2V-5B, un modelo de generacion de video texto-imagen-a-video, y conserva su backbone de diffusion transformer (DiT). Sobre esa base, el ajuste introduce parametros de condicionamiento de camara que permiten al modelo razonar sobre el movimiento de la camara y, en consecuencia, sobre la posicion esperada de las entidades fuera del encuadre. El checkpoint publicado es el transformer completo entrenado, fusionado en BF16, correspondiente al paso 1496; no incluye estado del optimizador ni el dataset de entrenamiento.

La innovacion central descrita en la model card es la re-entrada dinamica de entidades: el modelo aprende a mantener la identidad y la trayectoria de una entidad que abandona el campo de vision y vuelve a aparecer. La variante `localized` activa un muestreo calibrado de la region de la entidad, mientras que `euler` utiliza los mismos pesos sin esa calibracion. El modelo opera con 77 frames observados y 76 futuros y, de forma destacable, no requiere frames RGB futuros ni mascaras en el momento de la inferencia. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de video condicionada por camara a partir de frames observados, con prediccion de 76 frames futuros por defecto.
- Mantenimiento de la coherencia de entidades dinamicas que salen y vuelven a entrar en el encuadre (re-entry), tarea central del trabajo.
- Modelado de mundo (world model) con razonamiento implicito sobre la geometria de la escena y el movimiento de camara.
- Generacion video-a-video: la pipeline declarada en Hugging Face es `video-to-video`.
- Variante `localized` con muestreo calibrado de la region de la entidad para mejorar la fidelidad de la re-entrada.
- Funcionamiento sin mascaras ni frames RGB futuros, lo que simplifica el despliegue en inferencia.
- Condicionamiento textual mediante una frase de entidad tomada del caption, en la variante `single-entity`.
- No se documentan capacidades de tool calling, function calling, agentes, audio ni modo de razonamiento explicito.

## Casos de uso

- Simulacion de escenas virtuales con entidades que entran y salen del encuadre: el modelo mantiene la identidad de un objeto o personaje tras abandonar el campo de vision, lo que resulta adecuado para prototipos de world models en entornos sinteticos.
- Previsualizacion de movimiento de camara en produccion audiovisual: dado un clip observado, el modelo predice la continuacion a 832x480 y 15 fps, util para validar trayectorias de camara antes del rodaje.
- Generacion de video para entrenamiento de sistemas de percepcion: la capacidad de predecir frames futuros coherentes permite sintetizar secuencias con re-entradas de entidades para aumentar datasets de vision por computador.
- Video-a-video con control de camara: la pipeline declarada permite transformar un clip de entrada aplicando condicionamiento de camara, util en posproduccion y en efectos de continuidad.
- Investigacion en world models: el checkpoint y el repositorio de inferencia permiten reproducir la tarea de re-entry de escena virtual descrita en el paper y comparar variantes `localized` y `euler` con los mismos pesos.
- Prototipado de video generativo en entornos con recursos moderados: al partir de un modelo de 5B en BF16 y un repositorio de 10 GB, es viable en una GPU de gama alta unica para experimentacion, aunque no se documentan latencias.
- Evaluacion de coherencia temporal: la combinacion de 77 frames observados y 76 futuros con 50 pasos y CFG 5 ofrece una configuracion de referencia reproducible para medir la persistencia de entidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El checkpoint en BF16 pesa 10 GB, por lo que se necesita al menos esa cantidad solo para los pesos del DiT, mas el text encoder, el tokenizer y el VAE de Wan2.2-TI2V-5B, que se descargan por separado.
- GPU recomendadas: no disponible. Por el tamano del bundle (10 GB en BF16) y la carga adicional del VAE y el text encoder, se requiere una GPU con memoria holgada; no se documentan modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada. Un unico bundle de 10 GB en BF16 excede la VRAM de muchas GPU de consumo, y no se documentan cuantizaciones alternativas que reduzcan el requisito.
- Opciones de despliegue: el autor indica que debe usarse el repositorio de inferencia ReentryMem (GitHub Larry-077/ReentryMem), ya que se trata de un modelo condicionado por camara y no de un pipeline estandar de Diffusers. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion de video.
- Latencia y throughput: no disponibles. La configuracion por defecto es de 50 pasos de muestreo con CFG 5 sobre 77 frames observados y 76 futuros a 832x480, lo que implica un coste computacional considerable por generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / frames | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReentryMem (larry077) | no disponible (base 5B) | 77 observados + 76 futuros por defecto | Video-to-video, world model con re-entry | Apache 2.0 | Hugging Face, 0 descargas |
| Wan-AI/Wan2.2-TI2V-5B | 5B (segun denominacion) | no disponible | Texto-imagen-a-video | no disponible en la informacion | Hugging Face (modelo base) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que la comparativa se limita al modelo base del que deriva ReentryMem.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de un modelo generativo de video, puede heredar los sesgos del dataset de entrenamiento de Wan2.2, no detallado.
- Riesgo de alucinacion: no cuantificado. En generacion de video, el riesgo se traduce en la invencion de geometria, movimiento de camara o apariencia de entidades fuera del encuadre.
- Limitaciones de contexto e idioma: no se especifican idiomas soportados; el condicionamiento textual depende del text encoder de Wan2.2, que se descarga por separado. La variante `single-entity` admite una sola frase de entidad por caption, lo que restringe escenas con multiples entidades.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el bundle incluye archivos `LICENSE` y `NOTICE` con atribucion a los autores originales; es necesario revisarlos y conservar la atribucion. El modelo base Wan2.2-TI2V-5B tiene su propia licencia, que debe verificarse por separado.
- Dependencia de codigo propio: no funciona como pipeline estandar de Diffusers; requiere el repositorio de inferencia del autor, lo que limita la integracion directa en herramientas genericas.
- Checkpoint unico: solo se publica el paso 1496 en variante `single-entity`; no hay otras variantes ni estados intermedios.
- Reproducibilidad: los pesos estan verificados mediante `checksums.json`, pero no se incluye el dataset de entrenamiento, lo que impide reproducir el ajuste fino.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/larry077/ReentryMem
- Codigo de inferencia (GitHub): https://github.com/Larry-077/ReentryMem
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
