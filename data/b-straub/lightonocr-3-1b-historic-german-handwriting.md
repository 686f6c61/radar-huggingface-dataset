# b-straub/LightOnOCR-3-1B-Historic-German-Handwriting

## Resumen

LightOnOCR-3-1B-Historic-German-Handwriting es un ajuste fino del modelo LightOnOCR-3-1B de LightOn, publicado por el usuario b-straub, especializado en reconocimiento de texto manuscrito (HTR) a nivel de pagina completa sobre documentos historicos en aleman. El modelo lee paginas enteras de escritura historica —Kurrent alemana y manos en escritura latina, principalmente del siglo XIX, con un rango real de 1790 a mediados del siglo XX— y devuelve el texto linea a linea en orden de lectura, preservando la ortografia original, tachados, inserciones, subrayados y superindices como marcas en linea. No requiere segmentacion previa de lineas ni analisis de maquetacion, a diferencia de los pipelines HTR clasicos como Transkribus.

El modelo parte de la base LightOnOCR-3-1B (licencia Apache-2.0) y solo entrena el codificador visual y el proyector: 410 M de los 1.000 M de parametros totales; el modelo de lenguaje permanece congelado. La entrada es una imagen de pagina recortada al papel, con el lado mayor a 1540 px y en color. La salida es texto plano con marcas en linea para tachados, inserciones y notas marginales.

Es relevante ahora porque cubre un nicho poco atendido: la digitalizacion masiva de fondos archivisticos manuscritos en aleman historico con un modelo abierto, ligero (1 B de parametros) y desplegable tanto en Transformers y vLLM como en llama.cpp mediante un par GGUF (modelo de texto en q8_0 mas proyector multimodal en bf16), lo que permite incluso ejecucion en navegador. El entrenamiento se realizo exclusivamente sobre ediciones y archivos con licencia abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Mistral 3; codificador visual + proyector + modelo de lenguaje |
| Parametros totales | 1.005.647.872 (1,0 B) |
| Parametros activos | No aplica (no es MoE); se entrenan 410 M (codificador visual y proyector), el LM esta congelado |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF q8_0 para el modelo de texto y bf16 para el proyector multimodal (mmproj); safetensors en precision original |
| Idiomas soportados | Aleman (de), frances (fr), latin (la), ingles (en) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (Transformers, vLLM) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del LightOnOCR-3-1B, un modelo multimodal de tipo image-text-to-text construido sobre Mistral 3 que combina un codificador visual, un proyector y un modelo de lenguaje. En este ajuste se entrena unicamente el codificador visual y el proyector (410 M de parametros de un total de 1,0 B), mientras que el modelo de lenguaje se mantiene congelado. La entrada se normaliza recortando la imagen al area del papel, con el lado mayor a 1540 px y en color, y la salida es texto plano con marcas en linea que codifican tachados, inserciones, subrayados, superindices y notas marginales.

El entrenamiento se realizo exclusivamente sobre ediciones y archivos con licencia abierta, con paginas que abarcan desde la decada de 1790 hasta mediados del siglo XX (la mayoria entre 1820 y 1880). Los conjuntos de datos declarados son dh-unibe/image-text_kurrent-xix, dh-unibe/image-text_historisches-grundbuch-basel_xix-xx y dh-unibe/image-text_german-20th-century. El modelo esta disenado para HTR a nivel de pagina: una imagen de entrada, la pagina completa de salida, sin segmentacion de lineas ni paso de maquetacion previo. La evaluacion se realizo con decodificacion `greedy_rp1.1` (greedy con penalizacion de repeticion 1,1) sobre 610 paginas de validacion de 11 fuentes no incluidas en el Hub.

## Capacidades

- Reconocimiento de texto manuscrito a nivel de pagina completa: una imagen de pagina entra, el texto completo sale, sin segmentacion de lineas ni analisis de maquetacion.
- Lectura de escritura historica alemana Kurrent y de manos en escritura latina, principalmente de los siglos XIX y XX (rango 1790–mediados del siglo XX).
- Preservacion de la ortografia original de la pagina: no expande abreviaturas ni normaliza formas.
- Codificacion de marcas en linea: texto tachado, inserciones, subrayados, superindices, subindices y notas marginales (estas ultimas tras el texto principal).
- Orden de lectura linea a linea segun la disposicion de la pagina.
- Capacidades multilingues limitadas a los idiomas declarados: aleman, frances, latin e ingles.
- Soporte de inferencia conversacional (pipeline image-text-to-text, tag `conversational`).
- Despliegue en Transformers, vLLM y llama.cpp (par GGUF), incluida una aplicacion web en navegador.

## Casos de uso

- Digitalizacion de archivos historicos alemanes: el modelo transcribe paginas completas de registros, actas y libros de tierras (Grundbucher) sin pipeline de segmentacion previo, lo que simplifica el procesamiento por lotes de fondos archivisticos completos.
- Investigacion historica y edicion critica: la preservacion de tachados, inserciones y notas marginales como marcas en linea permite a los investigadores reconstruir el proceso de escritura y las correcciones del autor sin consultar la imagen original.
- Procesamiento de correspondencia y diarios del siglo XIX: adecuado para cartas, apuntes de clase y diarios con manos Kurrent, como demuestra el ejemplo de las notas de Alexander von Humboldt de 1799 incluido en la model card.
- Transcripcion de textos cientificos y academicos historicos: el soporte de latin y frances, ademas del aleman, permite abordar manuscritos cientificos multilingues de los siglos XVIII y XIX.
- Digitalizacion en navegador sin infraestructura propia: la disponibilidad de GGUF (q8_0 mas mmproj bf16) y la aplicacion OCR Lite permiten transcribir paginas localmente en el navegador, util para instituciones con recursos limitados o requisitos de privacidad.
- Enriquecimiento de catalogos y busqueda full-text en bibliotecas digitales: la salida en texto plano con orden de lectura permite indexar el contenido de manuscritos para busqueda y recuperacion, partiendo de imagenes ya digitalizadas.
- Flujos de trabajo con vLLM para alto rendimiento: el modelo puede servirse con vLLM en pipelines de digitalizacion masiva, dado su tamano reducido (1,0 B) y su formato safetensors.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Tarea | Conjunto de evaluacion | Metrica | Valor |
|---|---|---|---|
| Page-level handwritten text recognition | Paginas de validacion reservadas (610 paginas, 11 fuentes, no en el Hub), split validation | CER % (marcas eliminadas) | 4,74 |
| Page-level handwritten text recognition | Paginas de validacion reservadas (610 paginas, 11 fuentes, no en el Hub), split validation | oCER % (tolerante al orden, marcas puntuadas) | 3,85 |

La evaluacion se realizo con decodificacion `greedy_rp1.1` y se registraron 2 paginas con desbocamiento (runaway) en el conjunto de validacion. En el ejemplo de la model card (notas de Humboldt de 1799, pagina de validacion no vista en entrenamiento) el modelo obtiene CER 5,1 % y oCER 3,4 %. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1,0 B de parametros, el modelo en bf16 requiere aproximadamente 2 GB solo para pesos, mas el codificador visual y el proyector.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, el modelo es apto para GPU de consumo, pero no se confirman modelos concretos.
- Cabe en GPU de consumo: si, por el tamano (1,0 B); la variante GGUF q8_0 con proyector bf16 esta pensada para llama.cpp y para ejecucion en navegador.
- Opciones de despliegue: Transformers, vLLM (safetensors) y llama.cpp (par GGUF `text-q8_0.gguf` + `mmproj-bf16.gguf`); aplicacion web OCR Lite en navegador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LightOnOCR-3-1B-Historic-German-Handwriting | 1,0 B | No disponible | HTR de pagina completa en aleman historico (Kurrent y latina) | CC-BY-SA-4.0 | Hugging Face, GGUF, demo en navegador |
| LightOnOCR-3-1B (modelo base) | 1,0 B | No disponible | OCR/HTR general image-text-to-text | Apache-2.0 | Hugging Face |
| Transkribus (pipeline HTR comercial) | No disponible | No disponible | HTR por lineas con segmentacion y maquetacion previas | Propietaria | Servicio comercial |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada. La comparativa con Transkribus se limita a la diferencia de enfoque descrita por el autor (pagina completa frente a pipeline por lineas).

## Limitaciones y advertencias

- El modelo esta especializado en escritura historica alemana (Kurrent y latina) de los siglos XIX y XX; su rendimiento fuera de ese dominio no esta documentado.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente.
- Se registraron 2 paginas con desbocamiento (runaway) en las 610 paginas de validacion con la decodificacion `greedy_rp1.1`, lo que indica un riesgo residual de generacion descontrolada.
- La salida no esta corregida ni revisada: la model card indica explicitamente que el ejemplo mostrado no esta proofread, por lo que se recomienda revision humana en produccion.
- La licencia CC-BY-SA-4.0 impone atribucion y compartir bajo la misma licencia las obras derivadas, lo que puede condicionar el uso comercial y la integracion en productos propietarios.
- El modelo base es Apache-2.0, pero el ajuste fino cambia la licencia a CC-BY-SA-4.0; conviene revisar las implicaciones antes de su uso en produccion.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni limitaciones de contexto.
- Los idiomas soportados se limitan a aleman, frances, latin e ingles; no hay soporte documentado para castellano.
- El entrenamiento se realizo solo con ediciones y archivos de licencia abierta, lo que puede limitar la diversidad de manos y estilos frente a corpus mas amplios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/b-straub/LightOnOCR-3-1B-Historic-German-Handwriting
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-1B
- Aplicacion web OCR Lite: https://b-straub.github.io/historic-htr-ocr/app/
- Repositorio GitHub: https://github.com/b-straub/historic-htr-ocr
- Pagina del proyecto: https://b-straub.github.io/historic-htr-ocr/
- Ejemplo interactivo (Humboldt 48r): https://b-straub.github.io/historic-htr-ocr/examples/humboldt_48r.html
- Conjunto de datos Kurrent XIX: https://huggingface.co/datasets/dh-unibe/image-text_kurrent-xix
- Conjunto de datos Grundbuch Basel XIX-XX: https://huggingface.co/datasets/dh-unibe/image-text_historisches-grundbuch-basel_xix-xx
- Conjunto de datos aleman siglo XX: https://huggingface.co/datasets/dh-unibe/image-text_german-20th-century
- Paper referenciado (arXiv:2601.14251): https://arxiv.org/abs/2601.14251
