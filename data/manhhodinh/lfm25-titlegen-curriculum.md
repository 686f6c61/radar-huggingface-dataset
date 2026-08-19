# ManhHoDinh/lfm25-titlegen-curriculum

## Resumen

El modelo `ManhHoDinh/lfm25-titlegen-curriculum` es un fine-tuning de la etapa de curriculum del experimento LFM2.5 TitleGen, desarrollado por ManhHoDinh sobre la base `LiquidAI/LFM2.5-230M`. Se trata de un modelo de generación de texto especializado en la creación de títulos, con soporte multilingüe limitado a inglés y vietnamita. Con 229,7 millones de parámetros, es un modelo compacto orientado a tareas específicas de generación de títulos.

El interés de este modelo reside en que documenta un proceso de fine-tuning incremental (curriculum) y lo compara con variantes DPO y SFT del mismo experimento. Según los resultados preliminares publicados por el autor, alcanza un 96,3% de aciertos en un benchmark propio de 300 ejemplos inglés/vietnamita, ligeramente por debajo de la variante DPO (97,7%) y de la SFT v2 (97,0%). No se han publicado detalles sobre la arquitectura interna, el contexto o el proceso de entrenamiento más allá de la metodología de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: LiquidAI/LFM2.5-230M) |
| Parametros totales | 229.693.184 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles, vietnamita |
| Licencia | lfm1.0 (ver enlace en la seccion de enlaces) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. Se sabe que parte de `LiquidAI/LFM2.5-230M`, un modelo de 230M de parametros de Liquid AI, y que ha sido sometido a un fine-tuning de tipo curriculum para la generacion de titulos. El autor menciona que esta es la etapa de curriculum del experimento LFM2.5 TitleGen, pero no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas como RLHF o DPO en esta etapa concreta. La model card indica que se comparan tres variantes (DPO, SFT v2 y Curriculum) con resultados preliminares, pero no se detalla el proceso de cada una.

## Capacidades

- Generacion de texto especializada en titulos (title-generation) en ingles y vietnamita.
- Soporte multilingue limitado a los dos idiomas mencionados; el resto de idiomas listados en la model card no han sido evaluados.
- No se menciona soporte para tool calling, agentes, razonamiento multi-paso, vision ni audio.
- La generacion se realiza con decodificacion determinista (`do_sample: false`) y un maximo de 32 tokens nuevos, segun la metodologia de evaluacion.

## Casos de uso

- Generacion de titulos para articulos de blog o noticias: el modelo puede producir titulos cortos y relevantes en ingles o vietnamita a partir de un texto o contexto dado, util para redacciones digitales.
- Titulacion de documentos academicos o tecnicos: puede sugerir titulos para papers, informes o tesis, reduciendo el tiempo de revision manual.
- Automatizacion de metadatos en CMS: integrable en sistemas de gestion de contenidos para generar titulos alternativos o SEO-friendly.
- Asistencia en redes sociales: generacion de titulares para publicaciones en plataformas como Facebook o Twitter, adaptados al idioma del usuario.
- Etiquetado de contenido en repositorios: ayuda a crear titulos descriptivos para archivos, videos o recursos en entornos empresariales.
- Prototipado rapido de experimentos de fine-tuning: sirve como ejemplo de aplicacion de curriculum learning sobre un modelo pequeno, util para investigadores que quieran replicar la metodologia.

## Benchmarks y rendimiento

El autor publica resultados preliminares de un benchmark propio con 300 ejemplos (198 en ingles, 102 en vietnamita), evaluados con decodificacion determinista y una rúbrica automatizada. No se proporcionan resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

| Modelo | Pasados | Overall | Ingles | Vietnamita |
| --- | ---: | ---: | ---: | ---: |
| DPO | 293 / 300 | 97,7% | 99,5% | 94,1% |
| SFT v2 | 291 / 300 | 97,0% | 99,5% | 92,2% |
| Curriculum | 289 / 300 | 96,3% | 98,5% | 92,2% |

La cobertura por idioma indica que solo ingles y vietnamita tienen ejemplos evaluados; el resto de idiomas (aleman, espanol, frances, etc.) aparecen como `NOT_EVALUATED` con 0 muestras, lo que no debe interpretarse como una puntuacion de cero.

## Requisitos de hardware

- Al tratarse de un modelo de 230M de parametros, la inferencia es viable en CPU con 8-16 GB de RAM, aunque con latencia mayor.
- Para GPU, una tarjeta con al menos 4 GB de VRAM es suficiente para FP16 (el peso en FP16 ocupa aproximadamente 0,46 GB). En FP32 ocuparia unos 0,92 GB.
- Se puede desplegar con librerias estandar de transformers, vLLM, llama.cpp u Ollama, aunque no hay configuraciones oficiales publicadas.
- No se proporcionan datos de latencia o throughput especificos.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (generacion de titulos con ~230M de parametros). El modelo se puede comparar con su base `LiquidAI/LFM2.5-230M`, pero no hay datos de rendimiento publicados para esta base. Las variantes DPO y SFT v2 del mismo experimento son las unicas referencias directas, y sus resultados se muestran en la tabla de benchmarks. Por tanto, la comparativa con alternativas externas no esta disponible.

## Limitaciones y advertencias

- Solo se han evaluado ingles y vietnamita; el rendimiento en otros idiomas es desconocido y probablemente deficiente.
- La evaluacion se basa en una heuristica automatizada, sin revision nativa ni evidencia de preferencia ciega, por lo que los resultados pueden no reflejar la calidad real percibida.
- Los resultados agregados no establecen preparacion para produccion, mejora causal ni significancia estadistica, segun el propio autor.
- La licencia `lfm1.0` puede imponer restricciones de uso comercial; es necesario revisar los terminos completos en el enlace proporcionado.
- Al ser un modelo pequeno, puede tener limitaciones en la generacion de titulos largos o complejos, y es susceptible a alucinaciones o repeticiones.
- No hay informacion sobre sesgos especificos, pero al estar entrenado principalmente en dos idiomas, podria reflejar sesgos culturales o linguisticos de esos dominios.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ManhHoDinh/lfm25-titlegen-curriculum)
- [Licencia lfm1.0 (LiquidAI)](https://huggingface.co/LiquidAI/LFM2.5-230M/blob/main/LICENSE)
