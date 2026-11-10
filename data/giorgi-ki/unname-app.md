# Giorgi-KI/unname-app

## Resumen

`Giorgi-KI/unname-app` no es un modelo generativo al uso, sino un repositorio espejo que agrupa los artefactos que la aplicacion de escritorio **unname** descarga durante su configuracion inicial. La aplicacion esta orientada a la deteccion y anonimizacion de informacion personal identificable (PII) en texto y documentos, y este repositorio actua como fuente secundaria verificable de los binarios que consume. El autor es Giorgi-KI y el repositorio se publica bajo una licencia mixta Apache-2.0 y MIT.

El nucleo del sistema es un modelo NER basado en GLiNER (`urchade/gliner_multi_pii-v1`), exportado a ONNX y con las matrices de embedding cuantizadas dinamicamente a int8. Se complementa con dos modelos linguisticos de spaCy (`de_core_news_sm` y `en_core_web_sm` 3.8.0), datos de Tesseract para OCR en aleman e ingles, y un clasificador propio afinado sobre `intfloat/multilingual-e5-small` que actua como segunda opinion.

La relevancia de este repositorio es operativa mas que de investigacion: la app valida tamano y SHA-256 de cada fichero contra un manifiesto firmado (`models.lock.json`, revision 2026-11-07), de modo que cualquier modificacion sin nuevo manifiesto se rechaza. Esto lo convierte en un ejemplo de cadena de suministro reproducible para pipelines de anonimizacion en produccion, aunque no aporta pesos entrenados desde cero ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline compuesto: GLiNER (encoder mDeBERTa-v3-base) para NER, spaCy 3.8.0 para procesamiento linguistico, Tesseract para OCR y clasificador sobre multilingual-e5-small |
| Parametros totales | no disponible (los pesos se distribuyen como ONNX int8; el NER pesa 581 MB y el clasificador 118 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica (matrices de embedding del NER y clasificador completo) |
| Idiomas soportados | aleman e ingles de forma explicita (spaCy de/en y Tesseract deu/eng); el NER y el clasificador derivan de modelos multilingues, pero no se detalla la cobertura |
| Licencia | mixta Apache-2.0 y MIT (`mixed-apache-2.0-and-mit`) |
| Formato de pesos | ONNX (`.onnx`), wheels de spaCy y `.traineddata` de Tesseract |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo unico, sino que ensambla cuatro componentes. El detector de entidades es una exportacion ONNX de `urchade/gliner_multi_pii-v1` en el commit `f334163a5d1dcdbacf365c4527538e3da3ecfb18`, con encoder `microsoft/mdeberta-v3-base` (MIT). La unica modificacion respecto al original es la cuantizacion dinamica int8 de las matrices de embedding (operacion Gather); tokenizer y configuracion se mantienen identicos. GLiNER es una arquitectura de NER zero-shot que permite especificar los tipos de entidad en tiempo de inferencia mediante prompts, lo que encaja con un caso de uso de PII donde las categorias pueden variar.

El clasificador es un modelo propio: un cabezal de clasificacion sobre `intfloat/multilingual-e5-small` (commit `614241f622f53c4eeff9890bdc4f31cfecc418b3`), afinado sobre un corpus **ficticio** sin datos personales reales, exportado a ONNX y cuantizado a int8; sus parametros se documentan en `classifier/zweitmeinung.json`. Los componentes `de`, `en` y `ocr` se redistribuyen sin cambios desde spaCy 3.8.0 y `tesseract-ocr/tessdata_best` (commit `e12c65a915945e4c28e237a9b52bc4a8f39a0cec`). No se documentan tokens de entrenamiento, composicion del dataset ni fases de RLHF o DPO.

## Capacidades

- Deteccion de entidades nombradas orientada a PII (nombres, direcciones, identificadores y similares) mediante GLiNER zero-shot.
- Clasificacion auxiliar de "segunda opinion" sobre el texto o las entidades detectadas.
- Procesamiento linguistico en aleman e ingles (tokenizacion, lematizacion, dependencias) via spaCy.
- Extraccion de texto desde imagenes y documentos escaneados mediante OCR con Tesseract (deu y eng).
- Ejecucion local en escritorio sin dependencia de API remota: todos los pesos son ONNX o wheels empaquetados.
- Verificacion de integridad por SHA-256 contra un manifiesto firmado antes de cargar cada artefacto.
- No soporta generacion de texto, tool calling, razonamiento multi-paso ni agentes: es un pipeline discriminativo de anonimizacion.

## Casos de uso

- Anonimizacion de documentos antes de compartirlos: la app detecta entidades PII con GLiNER y las enmascara, con el clasificador como segunda pasada de verificacion.
- Cumplimiento de RGPD en flujos internos: procesamiento local de textos en aleman e ingles sin enviar datos a servicios externos, lo que reduce la superficie de tratamiento.
- Digitalizacion de archivos escaneados: el pipeline OCR de Tesseract extrae el texto y a continuacion el NER marca los identificadores personales antes de almacenar el resultado.
- Preprocesado de datasets para investigacion: limpieza de PII en corpus de texto antes de su publicacion o comparticion entre equipos.
- Integracion en aplicaciones de escritorio de terceros: los binarios ONNX pueden cargarse con `onnxruntime` en un cliente ligero, sin GPU dedicada.
- Auditoria de cadena de suministro: el manifiesto firmado con tamanos y hashes permite verificar que los modelos desplegados son exactamente los esperados, util en entornos regulados.
- Filtrado previo en pipelines de atencion al cliente: deteccion de datos personales en tickets o transcripciones antes de que lleguen a un modelo generativo o a un sistema de analitica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por tamano de pesos (581 MB para el NER, 118 MB para el clasificador, mas spaCy y Tesseract) el conjunto cabe holgadamente en CPU.
- GPU recomendadas: no se especifican; el uso de ONNX int8 sugiere despliegue orientado a CPU.
- Compatibilidad con GPU de consumo: previsiblemente si en cualquier GPU con soporte ONNX Runtime, aunque no hay datos oficiales de latencia ni throughput.
- Opciones de despliegue: `onnxruntime` (formato nativo), spaCy 3.8.0 para los modelos linguisticos y Tesseract para OCR. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Giorgi-KI/unname-app` | Pipeline PII (GLiNER + spaCy + Tesseract + clasificador) | no disponible | no disponible | Apache-2.0 + MIT | Hugging Face (espejo) |
| `urchade/gliner_multi_pii-v1` | NER zero-shot para PII | no disponible | no disponible | Apache-2.0 | Hugging Face |
| `intfloat/multilingual-e5-small` | Embeddings multilingues | no disponible | no disponible | MIT | Hugging Face |
| `explosion/spacy-models` (de/en small) | Pipeline linguistico | no disponible | no disponible | MIT | Hugging Face / GitHub |

La comparativa se limita a los componentes de origen, ya que no se dispone de datos de rendimiento del conjunto ni de alternativas equivalentes empaquetadas como aplicacion de escritorio.

## Limitaciones y advertencias

- El repositorio es un espejo de artefactos, no un modelo entrenado por el autor; la calidad depende de los componentes originales.
- El clasificador se entreno sobre un corpus ficticio, por lo que su comportamiento en dominios reales puede degradarse.
- Cobertura linguistica explicitamente limitada a aleman e ingles en spaCy y OCR; el resto de idiomas depende solo de la naturaleza multilingue de GLiNER y e5-small, sin garantias documentadas.
- No hay benchmarks ni evaluacion publicada de precision o recall en deteccion de PII.
- La licencia es mixta (Apache-2.0 y MIT) y debe revisarse componente a componente antes de uso comercial; los wheels de spaCy incluyen su propia licencia.
- El manifiesto `models.lock.json` es la unica garantia de integridad: cualquier cambio en el repositorio sin nuevo manifiesto se rechaza, lo que exige mantener sincronizados binarios y hashes.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de falsos positivos y negativos en la deteccion de entidades, con implicaciones directas en el cumplimiento normativo.
- No se documentan sesgos especificos ni evaluaciones de equidad entre grupos demograficos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Giorgi-KI/unname-app
- Modelo NER de origen: https://huggingface.co/urchade/gliner_multi_pii-v1
- Encoder del NER: https://huggingface.co/microsoft/mdeberta-v3-base
- Modelo base del clasificador: https://huggingface.co/intfloat/multilingual-e5-small
- Modelos spaCy: https://github.com/explosion/spacy-models
- Datos de Tesseract: https://github.com/tesseract-ocr/tessdata_best
- Licencias del repositorio: https://huggingface.co/Giorgi-KI/unname-app/tree/main/LICENSES
