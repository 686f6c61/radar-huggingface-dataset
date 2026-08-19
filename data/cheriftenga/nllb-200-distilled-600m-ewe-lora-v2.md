# cheriftenga/nllb-200-distilled-600M-ewe-lora-v2

## Resumen

El modelo `cheriftenga/nllb-200-distilled-600M-ewe-lora-v2` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base `facebook/nllb-200-distilled-600M` de Meta AI, especializado en la traducción automática del y al idioma ewe (una lengua gbe hablada principalmente en Ghana y Togo). El autor, cheriftenga, ha publicado esta variante "v2" de su adaptador, lo que sugiere una iteración posterior a la versión original `nllb-200-distilled-600M-ewe-lora`. El modelo base NLLB-200 (No Language Left Behind) es un Transformer encoder-decoder de 600 millones de parámetros, destilado de la versión completa de 54B, diseñado para cubrir 200 idiomas con especial atención a lenguas de bajos recursos.

La relevancia de este adaptador radica en que el ewe es un idioma de bajos recursos con escasa representación en los sistemas de traducción comerciales. Al aplicar LoRA sobre un modelo multilingüe ya entrenado, se consigue mejorar la calidad de traducción para este idioma sin necesidad de reentrenar toda la red, reduciendo drásticamente los costes computacionales y de datos. La técnica LoRA congela los pesos originales e inyecta matrices de bajo rango en las capas de atención, lo que permite afinar el modelo con pocos datos y recursos limitados. Sin embargo, la información pública sobre este adaptador es extremadamente escasa: la model card es una plantilla automática sin detalles, el repositorio tiene 0 descargas y un tamaño de 0.0 GB, lo que indica que probablemente los pesos no están realmente subidos o el repositorio está vacío.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (base NLLB-200 distilled 600M) con adaptadores LoRA |
| Parametros totales | ~600M (modelo base) + parametros LoRA (no disponible) |
| Parametros activos | no disponible (el modelo base es denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base NLLB-200 usa ventanas de 512 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors) |
| Idiomas soportados | ewe (principal), herencia multilingue del modelo base (200 idiomas) |
| Licencia | no disponible (el modelo base usa licencia CC-BY-NC 4.0) |
| Formato de pesos | safetensors (segun tags de HuggingFace) |

## Arquitectura y entrenamiento

El modelo base `facebook/nllb-200-distilled-600M` es una version destilada del NLLB-200 completo, que utiliza una arquitectura Transformer encoder-decoder estandar con atencion de producto punto escalado. A diferencia de la version completa de 54B parametros que emplea Mixture of Experts (MoE), la variante de 600M es un modelo denso, lo que facilita su despliegue en hardware modesto. El modelo original fue entrenado con datos de CommonCrawl y otros corpus multilingues, cubriendo 200 idiomas, con un enfoque especial en lenguas de bajos recursos mediante tecnicas de sobremuestreo y temperatura de muestreo ajustada.

El adaptador LoRA de cheriftenga anade matrices de bajo rango a las capas de atencion (query, key, value) y posiblemente a las capas feed-forward del modelo base. El entrenamiento del adaptador se habria realizado con datos paralelos ewe, aunque no se dispone de informacion sobre el tamano del dataset, el numero de pasos, la tasa de aprendizaje ni el regimen de entrenamiento. La existencia de una version "v2" sugiere que el autor iteró sobre el primer adaptador, posiblemente corrigiendo problemas de convergencia o ampliando los datos de entrenamiento. No hay informacion publica sobre el uso de RLHF, DPO u otras tecnicas de alineacion.

## Capacidades

- Traduccion automatica entre ewe y otros idiomas (principalmente ingles y frances, dado el contexto geografico) gracias al adaptador LoRA sobre el modelo multilingue NLLB-200.
- Herencia de las capacidades de traduccion del modelo base para los 200 idiomas originales, aunque el adaptador puede degradar ligeramente el rendimiento en idiomas no relacionados con ewe.
- Generacion de texto condicionada a la tarea de traduccion, sin soporte nativo para tool calling, agentes o razonamiento multi-paso, ya que se trata de un modelo encoder-decoder puro para traduccion.
- Capacidad multilingue limitada al ewe como idioma principal del adaptador; el resto de idiomas dependen del comportamiento del modelo base sin adaptar.
- Sin soporte de vision, audio ni modalidades adicionales; es exclusivamente texto.

## Casos de uso

- Traduccion de documentos oficiales y legales: el ewe es lengua vehicular en administraciones locales de Ghana y Togo; el modelo puede traducir actas, formularios y comunicados entre ewe e ingles o frances, reduciendo la dependencia de traductores humanos.
- Localizacion de contenido digital: traducir paginas web, aplicaciones moviles o material educativo al ewe para llegar a comunidades que usan este idioma como lengua principal.
- Transcripcion y traduccion de medios: convertir transcripciones de radio o television en ewe a ingles para archivo o difusion internacional, aprovechando la ventana de contexto de 512 tokens para fragmentos cortos.
- Asistencia en educacion bilingue: generar materiales de lectura en ewe para escuelas que imparten curriculo bilingue, partiendo de textos en ingles o frances.
- Comunicacion humanitaria: traducir avisos de salud publica, alertas meteorologicas o instrucciones de emergencia al ewe en contextos de ONGs y organismos internacionales.
- Investigacion linguistica: servir como herramienta de apoyo para estudios comparativos del ewe con otras lenguas gbe, generando traducciones preliminares que un linguista pueda revisar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El adaptador no incluye metricas BLEU, chrF ni ninguna evaluacion comparativa en su model card. El modelo base `nllb-200-distilled-600M` reporta en su documentacion oficial una media de 22,1 BLEU en el conjunto de test FLORES-200, pero no se puede atribuir ese rendimiento al adaptador LoRA sin datos especificos para ewe. Se recomienda al usuario evaluar el adaptador con su propio corpus paralelo ewe antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 600M parametros en FP16 requiere aproximadamente 1,2 GB de VRAM, mas el overhead del adaptador LoRA (tipicamente menos de 50 MB). En FP32 serian unos 2,4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, como NVIDIA GTX 1650, RTX 3050, o incluso inferencia en CPU con llama.cpp (aunque el modelo base no esta optimizado para GGUF).
- Cabe en GPUs de consumo: si, en la mayoria de tarjetas modernas de gama media (RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: al ser un modelo de transformers estandar, se puede servir con vLLM, Hugging Face TGI, o mediante la libreria transformers directamente. Para LoRA, se requiere cargar el modelo base y luego el adaptador con `PeftModel.from_pretrained`.
- Latencia y throughput: no disponibles. En una GPU consumer, se espera una latencia de decenas de milisegundos por token, pero depende del hardware y del batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cheriftenga/nllb-200-distilled-600M-ewe-lora-v2 | ~600M + LoRA | 512 tokens | ewe (principal) | no disponible | HuggingFace (repo vacio) |
| facebook/nllb-200-distilled-600M | 600M | 512 tokens | 200 | CC-BY-NC 4.0 | HuggingFace |
| facebook/nllb-200-distilled-1.3B | 1.3B | 512 tokens | 200 | CC-BY-NC 4.0 | HuggingFace |
| Helsinki-NLP/opus-mt-en-ewe | ~70M | 512 tokens | ewe (solo EN-EE) | CC-BY 4.0 | HuggingFace |

La comparativa muestra que el adaptador LoRA se situa entre el modelo base sin adaptar y un modelo dedicado de la familia OPUS. El adaptador podria ofrecer mejor calidad que el OPUS para ewe gracias al mayor tamano del modelo base, pero la falta de datos publicos impide confirmarlo. El modelo OPUS es mas ligero y tiene licencia permisiva, mientras que el NLLB-200 base tiene restricciones de uso no comercial.

## Limitaciones y advertencias

- El repositorio de HuggingFace muestra un tamano de 0.0 GB y 0 descargas, lo que sugiere que los pesos del adaptador podrian no estar realmente publicados o el repositorio esta vacio. Verificar antes de intentar descargar.
- No hay informacion sobre la licencia del adaptador; el modelo base usa CC-BY-NC 4.0, que prohibe uso comercial. El adaptador podria heredar esta restriccion o tener una licencia propia no declarada.
- La model card no contiene detalles de entrenamiento, datos utilizados ni evaluacion. Es imposible conocer la calidad real de la traduccion al ewe sin pruebas independientes.
- El modelo base tiene una ventana de contexto limitada a 512 tokens, lo que dificulta la traduccion de documentos largos sin segmentacion previa.
- Al ser un adaptador LoRA, el rendimiento en idiomas distintos del ewe puede degradarse respecto al modelo base, aunque no se ha medido.
- Riesgo de alucinaciones y errores de traduccion en terminologia especializada o dialectos del ewe, dado que no hay datos de evaluacion.
- El autor no proporciona informacion de contacto ni canal de soporte, lo que complica la resolucion de problemas.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/cheriftenga/nllb-200-distilled-600M-ewe-lora-v2
- Repositorio de la version anterior (sin v2): https://huggingface.co/cheriftenga/nllb-200-distilled-600M-ewe-lora
- Modelo base de Meta: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper de referencia de NLLB-200: https://arxiv.org/abs/2207.04672
- Modelo OPUS alternativo para ewe: https://huggingface.co/Helsinki-NLP/opus-mt-en-ewe
