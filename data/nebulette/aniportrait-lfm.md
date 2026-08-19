# nebulette/aniportrait-lfm

## Resumen

Aniportrait-LFM es un modelo de difusión especializado en la generación de retratos de estilo anime, desarrollado por el usuario nebulette sobre la base de Aniimage-2 de 8BitStudio. El modelo incorpora dos innovaciones principales: un esquema de flow matching con *time shift* lineal (LFM) y el text encoder LFM2.5, un CLIP de 350M parámetros optimizado para secuencias de texto anime. Además, está adaptado para funcionar con Mage-VAE, un autoencoder que reduce el latente 16 veces respecto a la imagen original, lo que acelera la decodificación aproximadamente 5 veces en comparación con el VAE de Flux.2.

El modelo cuenta con 441,9 millones de parámetros en su UNet y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones. Su principal limitación es que, debido a la escasez de datos de entrenamiento, únicamente comprende prompts relacionados con retratos anime; no es un modelo de propósito general. A pesar de su nicho, resulta relevante para desarrolladores que buscan una solución eficiente y de alta calidad para generar avatares o ilustraciones de personajes animados con requisitos de hardware moderados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet con flow matching (time shift lineal) sobre Aniimage-2 |
| Parametros totales | 441.898.496 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de difusion, no de lenguaje) |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (probablemente ingles y japones, pero no especificado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura UNet de Aniimage-2, a la que se le ha sustituido el esquema de ruido por un flujo de *flow matching* con *time shift* lineal. Para la codificación del texto se emplea el encoder LFM2.5 (nebulette/clip-l-sized-lfm-350m), un CLIP de 350M parámetros entrenado específicamente para representar secuencias de texto anime, lo que mejora la adherencia al prompt en dominios de ilustración japonesa.

El entrenamiento se realizó en dos etapas. La primera consistió en un *warmup* con 200.000 imágenes a una tasa de aprendizaje de 1e-5, seguido de una fase de convergencia con tamaño de imagen fijo. La segunda etapa introdujo una función de pérdida basada en la diferencia entre el latente, las imágenes coloreadas y pares de imágenes en escala de grises/color, utilizando muestras de resolución mixta. Los *timesteps* se seleccionaron mediante *logit-normal sampling*. Las fuentes de datos incluyen los conjuntos `anime_faces_256px_v2`, `anime_style_portrait`, `gelbooru (landscape)`, `portraits_512` y `wikiart_face`.

## Capacidades

- Generacion de retratos anime de alta calidad, con fidelidad al estilo y a los rasgos faciales.
- Comprension de prompts en lenguaje natural para retratos (solo anime; no soporta otros dominios).
- Integracion con Mage-VAE, que reduce el latente 16 veces y acelera la decodificacion frente a VAE convencionales.
- Uso del text encoder LFM2.5, optimizado para secuencias de texto relacionadas con anime.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de vision/audio.

## Casos de uso

- **Generacion de avatares para redes sociales y juegos**: el modelo produce retratos anime coherentes y estilizados, ideales para crear avatares personalizados a partir de descripciones textuales breves.
- **Ilustracion de personajes para novelas visuales**: al estar especializado en retratos, permite generar rostros de personajes consistentes para proyectos de narrativa interactiva sin necesidad de ajuste fino adicional.
- **Creacion de concept art para animacion**: los artistas pueden usar el modelo para explorar variaciones de diseño de personajes de forma rapida, aprovechando la baja latencia de decodificacion del Mage-VAE.
- **Prototipado de assets para produccion**: en estudios pequenos, sirve para generar bocetos de personajes que luego se refinan manualmente, reduciendo el tiempo de ideacion.
- **Generacion de retratos para perfiles en plataformas de contenido**: creadores de contenido pueden generar imagenes de perfil unicas y atractivas con prompts sencillos, sin depender de servicios externos.
- **Investigacion en modelos de difusion especializados**: dado su tamano reducido y su arquitectura con flow matching, es un punto de partida util para experimentos sobre eficiencia de VAE y encoders de texto en dominios estrechos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM ni latencia en la documentacion del modelo.
- Dado el tamano del UNet (441,9M parametros), se estima que la inferencia en FP16 requiere aproximadamente 1-2 GB de VRAM solo para los pesos, mas el consumo del text encoder (350M) y el VAE. En la practica, una GPU con 6-8 GB de VRAM (como una RTX 3060 o superior) deberia ser suficiente para generar imagenes de resolucion moderada.
- El modelo se integra con la libreria `diffusers`, por lo que puede desplegarse con pipelines estandar de HuggingFace. No se mencionan opciones como vLLM, llama.cpp u Ollama, que son especificas de modelos de lenguaje.
- La decodificacion con Mage-VAE es 5 veces mas rapida que la del VAE de Flux.2, lo que reduce el cuello de botella en la etapa de muestreo.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de generacion de retratos anime (por ejemplo, Anything V5, Counterfeit, o modelos basados en SDXL). La informacion disponible no incluye benchmarks ni evaluaciones frente a alternativas, por lo que no es posible establecer una comparacion objetiva.

## Limitaciones y advertencias

- **Dominio restringido**: el modelo solo comprende prompts de retratos anime; cualquier otro tipo de prompt producira resultados pobres o fallidos.
- **Sesgos potenciales**: las fuentes de datos incluyen `gelbooru` y `wikiart_face`, que pueden introducir sesgos en la representacion de rasgos faciales, estilos o demografia. No se ha realizado una auditoria de sesgos.
- **Alucinacion**: al ser un modelo generativo de imagenes, puede producir artefactos visuales o deformidades en zonas no controladas (manos, fondos), especialmente con prompts complejos.
- **Licencia**: Apache-2.0 permite uso comercial y modificacion, pero se recomienda revisar los terminos de las fuentes de datos originales (gelbooru, wikiart) por posibles restricciones de derechos de autor.
- **Produccion**: al estar entrenado con un conjunto limitado de datos, la consistencia entre multiples generaciones puede variar; para uso en produccion se recomienda un ajuste fino adicional con datos propios.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/nebulette/aniportrait-lfm)
- [Text encoder LFM2.5](https://huggingface.co/nebulette/clip-l-sized-lfm-350m)
- [Modelo base Aniimage-2](https://huggingface.co/8BitStudio/Aniimage-2)
