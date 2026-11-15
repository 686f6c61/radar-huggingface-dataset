# proofbird/gector-bert-nl

## Resumen

`gector-bert-nl` es un modelo de correccion gramatical del neerlandes desarrollado por Proofbird, el equipo detrás de una aplicacion de asistencia a la escritura para Windows. Se trata de un tagger de secuencias de estilo GECToR construido sobre el encoder `GroNLP/bert-base-dutch-cased` (BERTje) y exportado a ONNX en fp32 para ejecutarse en CPU, lo que permite correccion gramatical en el propio dispositivo sin enviar texto a un servidor. El modelo esta publicado con licencia Apache-2.0 y un unico idioma soportado, el neerlandes.

La relevancia del modelo reside en su enfoque: en lugar de reescribir o parafrasear el texto, predice etiquetas de edicion locales (mantener, borrar, reemplazar, anadir, cambiar mayusculas o terminacion) que se aplican iterativamente hasta cinco veces. Esto lo hace adecuado para asistentes de escritura que necesitan subrayar errores concretos y ofrecer correcciones puntuales sin alterar el estilo del autor. El repositorio ocupa 0,4 GB e incluye los pesos ONNX, el tokenizador y utilidades de arranque rapido.

El modelo se entreno exclusivamente con datos sinteticos generados mediante reglas de error escritas a mano sobre corpus reales (Wikipedia neerlandesa, Europarl y Tatoeba), sin corpus de aprendices ni texto de usuarios. La version publicada es la 1.0.0 (run `2026-11-15-1125`) y esta pensada para ser fijada por revision (`revision="v1.0.0"`) en la aplicacion que lo consume.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BERTje) con cabeza de etiquetado de ediciones (5 000 etiquetas) y cabeza de deteccion de errores, estilo GECToR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | exportacion ONNX en fp32; no se documentan otras cuantizaciones |
| Idiomas soportados | neerlandes (nl) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (fp32) |
| Modelo base | GroNLP/bert-base-dutch-cased |
| Tamano del repositorio | 0,4 GB |
| Libreria | onnx |
| Pipeline | token-classification |

## Arquitectura y entrenamiento

El modelo sigue la formulacion GECToR: un encoder BERTje en cased procesa la frase y dos cabezas predicen, por token, una etiqueta de edicion entre 5 000 posibles y una senal de deteccion de error. Las ediciones se aplican sobre el texto y la frase resultante se vuelve a etiquetar hasta cinco iteraciones, de modo que el sistema solo propone cambios locales y nunca parafrasea. La exportacion a ONNX en fp32 permite inferencia en CPU con ONNX Runtime, sin GPU ni clave de API.

El entrenamiento uso exclusivamente datos sinteticos: 3 159 747 frases en total, compuestas por 1 500 000 frases de Wikipedia neerlandesa (`wikimedia/wikipedia`, `20231101.nl`), 1 500 000 frases de los procedimientos del Parlamento Europeo (Europarl v7, sesiones de 1996 a mayo de 2011) y 159 747 frases de Tatoeba. Las frases se corrompieron con reglas de error neerlandesas escritas a mano, manteniendo aproximadamente un 10 % limpias para que el modelo aprenda a no tocar texto correcto; cada regla se valido previamente sobre texto real para descartar falsos positivos. Se anadieron 150 000 frases de plantilla para patrones poco frecuentes en los corpus (todas las personas del presente, `jij`/`je` tras el verbo, `de`/`het` con adjetivo, `er is`/`er zijn`). No se usaron corpus de aprendices ni datos no comerciales, ni texto de usuarios. El entrenamiento consistio en una epoca (98 475 pasos, batch 64, learning rate 3e-5) sobre una NVIDIA L4.

## Capacidades

- Correccion de terminaciones d/t en presente (`Ik vindt` → `vind`, `Zij vind` → `vindt`) y en participio pasado (`verstuurt` → `verstuurd`).
- Correccion del sufijo de pasado (`praate` → `praatte`).
- Concordancia sujeto-verbo en persona y numero (`Hij werken` → `werkt`, `De kinderen speelt` → `spelen`, `Wij heeft` → `hebben`, `Er is veel mensen` → `Er zijn`).
- Eleccion de articulo `de`/`het` (`het stoel` → `de stoel`).
- Demostrativos (`Deze huis` → `Dit huis`) y pronombres relativos (`het huis die` → `dat`).
- Adjetivo flexionado (`een lief hond` → `een lieve hond`).
- `als`/`dan` tras comparativo (`groter als` → `dan`).
- Pronombres sujeto (`Hun wonen` → `Zij wonen`) y distincion `jou`/`jouw`.
- Compuestos escritos separados (`tand arts` → `tandarts`) y trema (`ideeen` → `ideeën`).
- Mayuscula al inicio de frase.
- Salida con sugerencias posicionadas por caracter (`start`, `length`, `original`, `replacement`) para subrayar y ofrecer la correccion en la interfaz.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento; es un corrector gramatical de un solo idioma.

## Casos de uso

- Asistente de escritura de escritorio: integrado como modelo ONNX en una aplicacion Windows, corrige el texto del usuario localmente sin enviar datos a ningun servidor, lo que encaja con requisitos de privacidad y con equipos sin GPU.
- Revision de correos y documentos en neerlandes: el modelo detecta errores de concordancia, articulos y participios y devuelve sugerencias con posiciones exactas para que el usuario acepte o rechace cada cambio.
- Procesamiento por lotes de textos administrativos: al ejecutarse en CPU con ONNX Runtime, puede aplicarse a grandes volumenes de documentos neerlandeses en pipelines de preprocesado sin coste de GPU.
- Correccion previa a traduccion automatica: normalizar errores gramaticales en el texto de entrada mejora la calidad de traducciones posteriores desde neerlandes.
- Ensenanza de neerlandes como segunda lengua: las sugerencias con posicion y reemplazo permiten generar ejercicios y feedback puntual sobre errores tipicos (d/t, `de`/`het`, `als`/`dan`).
- Control de calidad de contenido generado por usuarios: filtrar o marcar textos de foros y comentarios con errores gramaticales frecuentes antes de su publicacion.
- Demo interactiva en navegador: el Space asociado ejecuta el modelo en el propio navegador del visitante, util para evaluar el comportamiento antes de integrarlo.

## Benchmarks y rendimiento

| Comprobacion | Resultado |
|---|---|
| Conjunto gold (771 frases escritas a mano: 568 con un error cada una, 203 correctas) | 550 corregidas, 203 sin tocar, 18 no detectadas, 0 empeoradas |
| Falsas alarmas sobre 4 000 frases cotidianas de Tatoeba (reservadas del entrenamiento) | 0 modificadas (0,00 %) |
| Falsas alarmas sobre 4 000 frases de sesiones del Parlamento Europeo no vistas (junio de 2011) | 0 modificadas (0,00 %) |
| Estabilidad: repeticion del gold anadiendo un token al inicio de cada frase | 2 frases cambian de resultado (las 5 filas de mayusculas cambian por construccion y no se cuentan) |

Los resultados se obtuvieron con las guardas del lado de aplicacion incluidas en `gector-guards.json`; sin ellas el modelo modifica 6 frases de Tatoeba y 3 de Europarl, todas falsas alarmas de las formas que las guardas filtran. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo se distribuye en ONNX fp32 y esta disenado para ejecutarse sin GPU mediante ONNX Runtime.
- VRAM estimada: no aplica en el caso previsto (CPU); no se documenta el consumo en GPU.
- GPU recomendadas: no se especifican; el entrenamiento se realizo en una NVIDIA L4, pero la inferencia objetivo es en CPU.
- Cabe en GPU de consumo: si, aunque el caso de uso documentado es CPU; no se detallan requisitos de VRAM.
- Opciones de despliegue: ONNX Runtime (documentado), con dependencias `onnxruntime`, `tokenizers` y `huggingface_hub`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| proofbird/gector-bert-nl | no disponible (base BERTje) | no disponible | nl | Apache-2.0 | GECToR sobre BERTje, ONNX CPU, correccion local |
| GroNLP/bert-base-dutch-cased | no disponible | no disponible | nl | Apache-2.0 | Encoder base sin cabeza de correccion |
| Otros correctores GECToR (p. ej. variantes inglesas) | no disponible | no disponible | en | variable | Tagging de ediciones sobre BERT/RoBERTa |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a arquitectura, licencia e idioma.

## Limitaciones y advertencias

- Solo corrige neerlandes; no soporta otros idiomas ni traduccion.
- Solo propone ediciones locales: no parafrasea, no reescribe frases ni mejora estilo.
- Entrenado exclusivamente con datos sinteticos generados por reglas; los errores no cubiertos por esas reglas pueden no detectarse (18 no detectadas en el conjunto gold).
- Los resultados publicados dependen de las guardas de `gector-guards.json`; sin ellas aparecen falsas alarmas (6 en Tatoeba y 3 en Europarl en las pruebas).
- Riesgo de alucinacion bajo en el sentido generativo, pero puede proponer correcciones incorrectas en construcciones no vistas; el diseno de sugerencias aceptables por el usuario mitiga el impacto.
- La estabilidad ante cambios minimos de contexto es limitada: 2 frases del gold cambian de resultado al anadir un token al inicio.
- No se documentan sesgos especificos; al entrenarse con Wikipedia, Europarl y Tatoeba, puede heredar el registro y las convenciones de esos corpus.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias; conviene fijar la revision `v1.0.0` para reproducibilidad.
- No hay informacion sobre longitud maxima de contexto ni sobre el numero de parametros del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/proofbird/gector-bert-nl
- Version fijada: https://huggingface.co/proofbird/gector-bert-nl/tree/v1.0.0
- Demo en el navegador: https://huggingface.co/spaces/proofbird/try-grammar
- Quickstart: https://huggingface.co/proofbird/gector-bert-nl/blob/main/quickstart.py
- Cuaderno Colab: https://colab.research.google.com/#fileId=https%3A//huggingface.co/proofbird/gector-bert-nl/blob/main/quickstart.ipynb
- Modelo base: https://huggingface.co/GroNLP/bert-base-dutch-cased
- Dataset de Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Tatoeba: https://tatoeba.org
- Paper GECToR: https://arxiv.org/abs/1912.09582
- Aplicacion Proofbird: https://proofbird.app
