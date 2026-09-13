# circulus/flux2-klein-4b-int4-ov

## Resumen

circulus/flux2-klein-4b-int4-ov es una exportacion a formato OpenVINO IR del modelo de generacion de imagenes black-forest-labs/FLUX.2-klein-4B, cuantizada a INT4 y publicada por el usuario circulus. El repositorio ocupa 4,6 GB (4347 MB segun la model card) y se distribuye como material del curso ARCademy de OpenVINO, en concreto la leccion 07, "FLUX.2 Klein image generation", generada con el script convert/convert_all.py de ese courseware.

El modelo resuelve dos tareas: generacion de imagenes a partir de texto (Text2ImagePipeline) y transformacion de imagen a imagen (Image2ImagePipeline, con strength aproximado de 0,9). Su caracteristica principal es que se trata de un modelo destilado para funcionar en solo 4 pasos de inferencia con guidance_scale 1,0, lo que reduce de forma notable el coste computacional frente a los modelos de difusion que requieren decenas de pasos. La cuantizacion INT4 del transformer y del codificador de texto, junto con un VAE que se mantiene en INT8, busca disminuir el consumo de memoria para facilitar su ejecucion en hardware de consumo.

Su relevancia es doble: por un lado permite ejecutar una variante de la familia FLUX.2 Klein sobre el runtime de OpenVINO, orientado a CPU, GPU integrada y NPU de Intel; por otro, constituye un ejemplo practico y reproducible de conversion y cuantizacion dentro de un material formativo. No se han publicado resultados de benchmarks, lista de idiomas soportados ni ficha tecnica detallada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de generacion de imagenes basado en difusion; la informacion disponible menciona tres componentes: transformer, codificador de texto y VAE. Detalle interno de la arquitectura no disponible |
| Parametros totales | 4B segun la nomenclatura del modelo base (FLUX.2-klein-4B); recuento exacto no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 con compresion de pesos en grupos de 64 para transformer y codificador de texto; VAE en INT8 |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; terminos concretos no detallados en la informacion disponible) |
| Formato de pesos | OpenVINO IR (exportacion para el runtime de OpenVINO) |
| Tamano del repositorio | 4,6 GB (4347 MB) |
| Modelo base | black-forest-labs/FLUX.2-klein-4B |
| Pasos de inferencia | 4 (modelo destilado) |
| Guidance scale | 1,0 |
| Fecha de publicacion | 2026-09-13 |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base FLUX.2-klein-4B, mas alla de que intervienen un transformer, un codificador de texto y un VAE. Lo que si se documenta es el proceso de conversion aplicado: se ha realizado una compresion de pesos en grupos de 64 sobre el transformer y el codificador de texto, mientras que el VAE se ha mantenido en INT8. El resultado se empaqueta como OpenVINO IR, formato nativo del runtime de OpenVINO, y el mismo directorio da servicio tanto al pipeline de texto a imagen como al de imagen a imagen.

Respecto al entrenamiento, el unico dato relevante es que se trata de un modelo destilado que opera en 4 pasos con guidance_scale 1,0, lo que implica un proceso de destilacion previo por parte del autor original. No se dispone de informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas adicionales del modelo base. Tampoco se documenta si la destilacion es de tipo paso a paso (step distillation) o de otra naturaleza.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales mediante Text2ImagePipeline.
- Transformacion de imagen a imagen mediante Image2ImagePipeline, con un valor de strength en torno a 0,9.
- Inferencia en 4 pasos con guidance_scale 1,0, lo que reduce el tiempo de generacion frente a esquemas de difusion de decenas de pasos.
- Ejecucion sobre el runtime de OpenVINO, lo que habilita despliegue en CPU, GPU integrada y NPU de Intel.
- Reutilizacion del mismo directorio de modelo para ambos pipelines, lo que simplifica el despliegue.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, uso como agente, razonamiento multi-paso ni capacidades de audio o video.
- Las capacidades multilingues del codificador de texto no estan documentadas; se desconoce que idiomas de prompt estan soportados de forma optima.

## Casos de uso

- Generacion de imagenes en equipos sin GPU dedicada: al estar exportado a OpenVINO IR y cuantizado a INT4, el modelo puede ejecutarse sobre CPU o GPU integrada Intel, lo que permite generar imagenes en portatiles y equipos de escritorio convencionales sin depender de una tarjeta grafica de gama alta.
- Edicion y restilizado de imagenes existentes: el pipeline de imagen a imagen con strength proximo a 0,9 permite partir de una imagen de referencia y aplicar transformaciones controladas, util para ajustar composiciones, estilos o variaciones de un diseno ya existente.
- Prototipado rapido de recursos graficos: en 4 pasos de inferencia, el modelo sirve para generar bocetos e ideas visuales en fases tempranas de diseno, donde la velocidad importa mas que el acabado final.
- Generacion de variaciones de producto en comercio electronico: a partir de una fotografia base se pueden producir variantes de fondo, iluminacion o encuadre mediante el pipeline de imagen a imagen, reduciendo el trabajo de retoque manual.
- Material docente y aprendizaje practico: el repositorio forma parte de la leccion 07 del courseware ARCademy de OpenVINO, por lo que es adecuado como ejemplo reproducible de conversion de un modelo de difusion a OpenVINO IR y de aplicacion de cuantizacion INT4.
- Integracion en aplicaciones de escritorio o edge: al distribuirse como OpenVINO IR, encaja en aplicaciones locales que necesiten generar imagenes sin enviar datos a servicios en la nube, lo que puede ser relevante por motivos de privacidad o de conectividad.
- Reduccion de coste de inferencia en servicios de generacion de imagenes: el esquema destilado de 4 pasos reduce el numero de evaluaciones del modelo por imagen en comparacion con pipelines de 20 a 50 pasos, lo que disminuye el tiempo de computo por peticion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de FID, CLIP score, comparativas de calidad frente al modelo base sin cuantizar, latencia medida ni throughput en ningun hardware concreto.

## Requisitos de hardware

- Tamano de pesos: el repositorio ocupa 4,6 GB (4347 MB), dato que corresponde al modelo ya cuantizado a INT4. Cualquier despliegue necesita, como minimo, alojar esos pesos, mas el espacio adicional para activaciones y buffers del runtime.
- VRAM estimada para inferencia: no disponible. No se han publicado requisitos de memoria por parte del autor.
- GPU recomendadas: no disponible. No se especifica ninguna GPU concreta en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. El tamano de pesos (4,6 GB) es inferior a la VRAM de muchas GPU de consumo actuales, pero no hay validacion publicada al respecto.
- Opciones de despliegue: el formato es OpenVINO IR, por lo que el runtime de OpenVINO es la via de despliegue indicada. No se ha documentado soporte para vLLM, llama.cpp, Ollama o TGI, formatos que ademas no aplican a este tipo de modelo de generacion de imagenes.
- Hardware objetivo declarado: el contexto del courseware ARCademy de OpenVINO apunta a CPU, GPU integrada y NPU de Intel, aunque la model card no detalla configuraciones concretas.
- Latencia y throughput: no disponible. Se sabe que la inferencia se realiza en 4 pasos, pero no se han publicado mediciones de tiempo por imagen en ningun dispositivo.

## Comparativa con modelos similares

Solo se dispone de datos comparables respecto al modelo base del que deriva esta exportacion. No hay informacion publicada sobre otras exportaciones OpenVINO de la misma familia ni sobre alternativas de tamano similar con las que comparar de forma rigurosa.

| Modelo | Parametros | Cuantizacion | Tamano | Formato | Licencia |
|---|---|---|---|---|---|
| circulus/flux2-klein-4b-int4-ov | 4B (segun nomenclatura) | INT4, grupos de 64; VAE en INT8 | 4,6 GB | OpenVINO IR | other |
| black-forest-labs/FLUX.2-klein-4B | 4B (segun nomenclatura) | Sin cuantizar (precision original) | no disponible | no disponible | other |

La comparacion cualitativa entre ambos es la esperable en un proceso de cuantizacion: la version INT4 reduce el tamano de pesos y facilita el despliegue en hardware limitado, a cambio de una posible perdida de calidad en las imagenes generadas que no ha sido cuantificada en la informacion disponible. Para el resto de alternativas del mercado, la comparativa no esta disponible.

## Limitaciones y advertencias

- Licencia "other" sin terminos detallados: antes de cualquier uso comercial es imprescindible revisar las condiciones del modelo base black-forest-labs/FLUX.2-klein-4B, de las que esta exportacion hereda la licencia.
- Ausencia de benchmarks: no se ha medido la degradacion de calidad introducida por la cuantizacion INT4 respecto al modelo sin cuantizar, por lo que el impacto real sobre las imagenes generadas es desconocido.
- Repositorio sin validacion comunitaria: registra 0 descargas y 0 likes en el momento de la consulta, lo que significa que no ha sido contrastado por terceros.
- Artefactos visuales: como todo modelo de difusion cuantizado, puede producir incoherencias anatomicas, texto mal formado dentro de la imagen o detalles inconsistentes; la cuantizacion agresiva puede acentuar estos problemas.
- Idiomas no documentados: se desconoce que idiomas acepta correctamente el codificador de texto, lo que introduce riesgo en prompts en castellano u otras lenguas distintas del ingles.
- Dependencia del runtime OpenVINO: al distribuirse unicamente como OpenVINO IR, su uso queda atado a ese ecosistema y no es portable directamente a otros runners.
- Enfoque formativo: el modelo se publica como material de curso, no como un artefacto orientado a produccion, por lo que no incluye garantias de mantenimiento, versionado ni soporte.
- Sesgos del dataset de entrenamiento: no se documenta la composicion de los datos de entrenamiento del modelo base, por lo que no es posible evaluar sesgos de representacion, estilo o contenido.
- Configuracion fija de inferencia: el esquema destilado a 4 pasos con guidance_scale 1,0 limita el margen de ajuste fino del resultado mediante parametros de muestreo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/circulus/flux2-klein-4b-int4-ov
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Script de conversion citado en la model card: convert/convert_all.py del courseware ARCademy de OpenVINO (no se proporciona URL en la informacion disponible)
- Leccion asociada: 07 FLUX.2 Klein image generation (no se proporciona URL en la informacion disponible)
- No se han encontrado otros enlaces relevantes en la busqueda web realizada.
