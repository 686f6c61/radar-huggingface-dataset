# larc-iu/dmrst-xlm-roberta-base-ert

## Resumen

`larc-iu/dmrst-xlm-roberta-base-ert` es un parser de discurso RST (Rhetorical Structure Theory) para euskera, construido sobre el encoder multilingue `FacebookAI/xlm-roberta-base` y entrenado con la libreria Dipo del grupo LARC-IU. Reimplementa la arquitectura DMRST (Liu, Shi y Chen, CODI 2021), un marco conjunto que realiza segmentacion en unidades de discurso elementales (EDU) y construccion del arbol retorico en un solo paso, a nivel de documento y de forma multilingue. El modelo esta especializado en un unico idioma, el euskera, y en un dominio concreto: resumenes cientificos y textos breves anotados en el RST Basque TreeBank (ERT), con 31 etiquetas de relacion retorica.

El interes practico del modelo es limitado pero muy especifico: cubre una tarea de analisis linguistico profundo (parsing del discurso) en una lengua de bajos recursos para la que existen pocos recursos anotados y practicamente ningun modelo publico. Para investigadores en linguistica computacional, analisis del discurso o procesamiento del euskera, ofrece un punto de partida reproducible con metricas publicadas y un pipeline de inferencia sencillo (CLI y API de Python) que acepta texto en bruto sin preprocesado.

Se trata de un modelo pequeno (encoder base de XLM-R, ~278 M de parametros) con un repositorio de 1,7 GB, publicado en octubre de 2026 y actualizado en noviembre de 2026. No es un modelo generativo ni un asistente conversacional: su salida es un arbol de discurso en formato RS4. La licencia de los pesos hereda la del modelo base (MIT), pero el corpus de entrenamiento no tiene declaracion de licencia, por lo que el autor restringe el uso a investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DMRST (parser de discurso RST conjunto segmentacion + parsing) sobre encoder transformer XLM-RoBERTa base |
| Parametros totales | ~278 M (encoder `xlm-roberta-base`; no se especifica el total exacto con las cabezas del parser) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de `xlm-roberta-base`, 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | euskera (`eu`) |
| Licencia | MIT para los pesos (heredada de `xlm-roberta-base`); corpus de entrenamiento sin licencia declarada, uso solo para investigacion |
| Formato de pesos | no disponible (repositorio de 1,7 GB, compatible con `dipo` y `transformers` via `from_pretrained`) |

## Arquitectura y entrenamiento

El modelo reimplementa DMRST, un marco que combina la segmentacion en EDUs y el parsing retorico en un unico modelo entrenado de forma conjunta. Sobre el encoder `xlm-roberta-base` se anaden las cabezas propias de DMRST para predecir fronteras de segmento y relaciones retoricas (nucleo-satelite y multinucleares) formando un arbol de discurso a nivel de documento. El modelo base aporta representaciones multilingues, pero el ajuste se realiza exclusivamente sobre euskera.

El entrenamiento se llevo a cabo con la libreria Dipo (LARC-IU) sobre el split de entrenamiento del RST Basque TreeBank, que contiene resumenes cientificos y otros textos breves anotados en RST con 31 etiquetas de relacion (por ejemplo `kausa`, `kontrastea`, `elaborazioa`, `evidentzia`, `helburua`, `lista`, `same-unit`). El checkpoint se selecciono sobre el split de desarrollo usando `e2e_full_f1`. No se documentan en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF/DPO (no procede en un parser discriminativo). El autor advierte que las puntuaciones provienen de una unica ejecucion y que la variacion entre ejecuciones en conjuntos de test pequenos puede ser de varios puntos.

Una particularidad de implementacion: el modelo lee el texto con todos los espacios colapsados, por lo que no ve saltos de linea. La funcion `predict_from_text` inicia un nuevo segmento en cada salto de parrafo (linea en blanco) y tras lineas cortas tipo encabezado, comportamiento que se puede desactivar con `break_at_paragraphs=False`.

## Capacidades

- Segmentacion de discurso: identifica fronteras de EDU a partir de texto en bruto en euskera.
- Parsing retorico RST: construye el arbol de discurso completo con 31 etiquetas de relacion (nucleo-satelite y multinucleares).
- Analisis a nivel de documento con estructura de parrafos y encabezados.
- Salida en formato RS4 (`tree.to_rs4_string()`), compatible con herramientas de analisis de discurso.
- Inferencia por CLI (`dipo dmrst predict`) y por API de Python (`DMRSTParser.from_pretrained`).
- Procesamiento por lotes de ficheros `.txt` o directorios (`--text-file`, `--output-dir`).
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento: es un modelo discriminativo de analisis linguistico.
- Capacidad multilingue: no; el modelo esta ajustado solo para euskera.

## Casos de uso

- Analisis de discurso en investigacion linguistica: aplicar el parser a corpus de euskera para estudiar la organizacion retorica de textos cientificos y comparar con anotaciones manuales del ERT.
- Generacion de datos auxiliares para resumen automatico: el arbol RST permite identificar relaciones como `laburpena` o `ondorioa` para guiar o evaluar sistemas de resumen extractivo en euskera.
- Enriquecimiento de corpus para TTS/ASR: la segmentacion en EDUs y la estructura retorica aportan prosodia y pausas plausibles en la preparacion de corpus hablado.
- Evaluacion de coherencia textual: comparar la estructura retorica de textos generados por LLM con la de textos humanos anotados, como metrica cualitativa de coherencia en euskera.
- Docencia y anotacion asistida: preanotar textos en RST para que anotadores humanos revisen, reduciendo el coste de crear nuevos corpus en euskera.
- Analisis de abstracts cientificos: procesar lotes de resumenes con `--text-file` y `--output-dir` para extraer patrones retoricos (metodo, resultado, conclusion) en publicaciones en euskera.
- Integracion en pipelines de PLN: usar la API de Python dentro de un pipeline mayor (por ejemplo, extraccion de relaciones o analisis de argumentacion) que necesite estructura de discurso como caracteristica intermedia.

## Benchmarks y rendimiento

Resultados publicados en la model card (F1 x 100 bajo Parseval original, excluyendo spans hoja triviales; checkpoint seleccionado por `e2e_full_f1` en dev):

| Split | Seg | E2E Span | E2E Nuc | E2E Rel | E2E Full | Gold-EDU Span | Gold-EDU Nuc | Gold-EDU Rel | Gold-EDU Full |
|---|---|---|---|---|---|---|---|---|---|
| dev | 87.2 | 60.1 | 40.4 | 25.0 | 24.7 | 69.7 | 48.4 | 28.2 | 28.1 |
| test | 88.0 | 61.2 | 40.4 | 28.4 | 27.6 | 70.5 | 49.6 | 34.1 | 33.9 |

`E2E` evalua arboles predichos desde texto en bruto (incluida la segmentacion); `Gold-EDU` evalua el parsing dada la segmentacion de referencia. `Seg` es el F1 por token de `BeginSeg` calculado durante el entrenamiento, que puede quedar hasta un punto por debajo del valor del scorer oficial de DISRPT. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1-2 GB en FP16 para un encoder base de ~278 M de parametros; en CPU es viable para lotes pequenos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM; tambien en CPU.
- Opciones de despliegue: libreria `dipo` (CLI y API de Python) sobre `transformers`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un encoder discriminativo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros parsers RST en la informacion proporcionada. Como referencia contextual, el modelo se apoya en `FacebookAI/xlm-roberta-base` y reimplementa DMRST; para otros idiomas existen parsers DMRST multilingues entrenados sobre DISRPT, pero no se aportan metricas comparables en esta ficha.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `larc-iu/dmrst-xlm-roberta-base-ert` | ~278 M (encoder) | no disponible | euskera | MIT (pesos), investigacion (datos) | Hugging Face |
| `FacebookAI/xlm-roberta-base` (base) | ~278 M | 512 tokens | 100 idiomas | MIT | Hugging Face |
| Otros parsers DMRST | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especializado exclusivamente en euskera; no funciona correctamente en otros idiomas.
- Entrenado sobre resumenes cientificos y textos breves del ERT; el rendimiento en generos muy distintos (conversacion, narrativa larga, redes sociales) puede degradarse notablemente.
- Las metricas provienen de una unica ejecucion y de un conjunto de test pequeno; la variacion entre ejecuciones puede ser de varios puntos.
- El modelo no ve saltos de linea (colapsa espacios); la segmentacion por parrafos y encabezados la aplica la funcion `predict_from_text`, no el modelo.
- Riesgo de errores en relaciones retoricas ambiguas o poco representadas en el corpus; el F1 de relaciones (E2E Rel 28,4 en test) es bajo en terminos absolutos.
- El corpus de entrenamiento (RST Basque TreeBank) no tiene licencia declarada; el autor restringe el uso a investigacion.
- La licencia MIT de los pesos deriva de `xlm-roberta-base`; verificar los terminos del modelo base antes de uso comercial.
- No es un modelo generativo: no produce texto, no soporta tool calling ni agentes.
- No se documentan sesgos especificos, pero al entrenarse sobre abstracts cientificos puede reflejar los sesgos de dominio y estilo de ese genero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/larc-iu/dmrst-xlm-roberta-base-ert
- Modelo base: https://huggingface.co/xlm-roberta-base
- Repositorio Dipo: https://github.com/larc-iu/dipo
- Paper DMRST (CODI 2021): https://aclanthology.org/2021.codi-main.15/
- Paper de Dipo (Gessler y Zeldes, 2026): https://arxiv.org/abs/2610.17658
- RST Basque TreeBank: https://ixa2.si.ehu.eus/diskurtsoa/en/
- Logo de Dipo: https://raw.githubusercontent.com/larc-iu/dipo/master/docs/logo.svg
