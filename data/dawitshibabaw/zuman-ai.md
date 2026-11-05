# DawitShibabaw/zuman.ai

## Resumen

Zuman.ai es un ajuste fino (fine-tune) del modelo Gemma 4 orientado a conversacion multilingue en lenguas etiopes y africanas: amharico (`am`), afaan oromo (`om`), tigrina (`ti`), somali (`so`) e ingles (`en`). Lo publica el usuario DawitShibabaw en Hugging Face y su proposito declarado es ofrecer un asistente conversacional que entienda al usuario y responda de forma natural en su propio idioma, con atencion al contexto cultural.

El checkpoint se distribuye como un fine-tune fusionado (merged fine-tune) en BF16, derivado de un adaptador LoRA de rango 64 segun la estructura de carpetas del repositorio. La arquitectura registrada es `Gemma4UnifiedForConditionalGeneration`, con 11.959.730.176 parametros totales (aproximadamente 12 mil millones) y un peso en disco cercano a 23-24 GB. La configuracion incluye componentes multimodales, aunque la model card solo documenta y ejemplifica el uso de chat en modo texto.

Su relevancia radica en la escasez de modelos conversacionales abiertos que cubran lenguas de bajos recursos como el amharico, el tigrina o el afaan oromo con una base de capacidad general alta. No obstante, el repositorio no incluye licencia explicita, benchmarks, ni documentacion sobre la composicion de los datos de entrenamiento, lo que limita seriamente su evaluacion rigurosa y su uso en produccion sin verificacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Gemma4UnifiedForConditionalGeneration` (transformer multimodal de la familia Gemma 4) |
| Parametros totales | 11.959.730.176 (aproximadamente 12B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de vLLM usa `--max-model-len 8192`) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | am (amharico), om (afaan oromo), ti (tigrina), so (somali), en (ingles) |
| Licencia | no disponible (la model card remite a los terminos de Gemma 4) |
| Formato de pesos | safetensors, sharded, dtype BF16 |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `Gemma4UnifiedForConditionalGeneration`, una variante unificada de la familia Gemma 4 que, segun la configuracion del checkpoint, incorpora componentes multimodales (procesador de imagen-texto). El pipeline declarado es `text-generation` y la libreria es `transformers`, con compatibilidad con `AutoModelForImageTextToText` y `AutoProcessor`. El checkpoint se genero con Transformers 5.17.0 segun la model card.

El proceso de entrenamiento descrito es un fine-tune fusionado sobre una base Gemma 4 en BF16, partiendo de un adaptador LoRA de rango 64 (identificado por el nombre de la carpeta de origen). No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares. Tampoco se detalla la metodologia de evaluacion. La model card menciona un uso previsto de asistencia orientada a CBE (Commercial Bank of Ethiopia), lo que sugiere cierto sesgo del dataset hacia dominio bancario, aunque no se confirma.

## Capacidades

- Generacion de texto conversacional multi-turno en amharico, afaan oromo, tigrina, somali e ingles.
- Deteccion implicita del idioma del usuario y respuesta en el mismo idioma (segun el prompt de sistema recomendado).
- Respuesta a preguntas generales y asistencia con contexto cultural etiope y africano.
- Soporte de plantilla de chat (`chat_template.jinja`) y rol de sistema para definir comportamiento.
- Componentes multimodales presentes en la configuracion (imagen-texto), aunque su comportamiento no ha sido evaluado ni documentado por el autor.
- Compatibilidad con `endpoints_compatible` y despliegue via vLLM con `trust_remote_code`.
- No se documenta soporte explicito de tool calling, function calling ni razonamiento agentico multi-paso.

## Casos de uso

- Asistencia conversacional en amharico: el modelo puede mantener dialogos multi-turno en amharico usando la plantilla de chat incluida, adecuado para prototipos de asistentes dirigidos a usuarios etioparlantes.
- Atencion al cliente en lenguas etiopes: con un prompt de sistema que fije el rol y los limites de dominio, puede gestionar consultas frecuentes en om, ti o so, aunque las respuestas deben validarse contra fuentes oficiales.
- Prototipado de investigacion multilingue: util como base para experimentos de adaptacion a lenguas de bajos recursos, dado que parte de Gemma 4 y ya incorpora ajuste en cinco idiomas.
- Asistencia orientada a servicios bancarios (CBE): la model card lo menciona como uso previsto, siempre que se acompañe de material fuente actualizado y autoritativo; no debe usarse como sustituto de asesoramiento financiero.
- Traduccion y reformulacion entre ingles y lenguas etiopes: puede emplearse para borradores de traduccion o adaptacion de contenido, con revision humana obligatoria por la variabilidad de calidad entre idiomas.
- Educacion y divulgacion cultural: generacion de explicaciones y material divulgativo en la lengua del usuario, aprovechando el enfasis declarado en contexto cultural.
- Despliegue en infraestructura propia: al ser safetensors BF16 y compatible con vLLM y Transformers, puede servirse en un cluster con GPUs de 32 GB o mas para aplicaciones internas de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no proporciona resultados de benchmark ni una comparacion validada de rendimiento entre los idiomas soportados, y que la metodologia de evaluacion y los resultados cuantitativos no estan documentados.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 24 GB solo para pesos, mas estado de runtime; la model card recomienda una GPU con unos 32 GB o mas como punto de partida practico.
- GPU recomendadas: A100 40/80 GB, H100, L40S, o cualquier acelerador con capacidad BF16 y al menos 32 GB de memoria.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en BF16 sin cuantizacion; no se publican variantes GGUF ni cuantizadas que permitan reducir requisitos.
- Opciones de despliegue: Transformers (`AutoModelForImageTextToText` con `trust_remote_code`), vLLM (con soporte para `Gemma4UnifiedForConditionalGeneration` y `--max-model-len 8192`). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen de la version de Transformers/vLLM, la longitud de entrada y los parametros de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas etiopes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zuman.ai (DawitShibabaw) | ~12B | no disponible (ejemplo 8192) | am, om, ti, so | no disponible | Hugging Face, safetensors BF16 |
| Gemma 4 (base, Google) | segun variante | no disponible | no especifico | terminos Gemma | Hugging Face / Vertex |
| Alternativas multilingues africanas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada que permitan una comparacion cuantitativa fiable. La comparacion con Gemma 4 base es estructural (es su fine-tune), pero no se aportan metricas diferenciales.

## Limitaciones y advertencias

- La calidad linguistica puede variar segun idioma, dialecto, ortografia y dominio; el autor lo advierte explicitamente.
- Riesgo de alucinacion: puede producir respuestas inexactas, desactualizadas o culturalmente inapropiadas; se recomienda verificar afirmaciones importantes con fuentes fiables.
- No debe usarse como sustituto de asesoramiento financiero, legal, medico ni de otros dominios de alto riesgo.
- No se especifica licencia en el repositorio; hay que revisar los terminos aplicables de Gemma 4 y confirmar derechos de redistribucion y uso antes de emplearlo o compartirlo.
- No se documentan la composicion de los datos de entrenamiento, la metodologia de evaluacion ni resultados cuantitativos.
- El comportamiento multimodal (imagen, audio, video) no ha sido evaluado independientemente; solo se ejemplifica el chat en texto.
- Requiere `trust_remote_code=True` y una version reciente de Transformers (5.17.0 segun la model card), lo que anade dependencia de codigo remoto no auditado.
- El sesgo hacia el dominio bancario (CBE) mencionado en el uso previsto puede condicionar las respuestas fuera de ese ambito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DawitShibabaw/zuman.ai
- Repositorio de Transformers (libreria requerida): https://github.com/huggingface/transformers
- Documentacion de vLLM: https://docs.vllm.ai
- Terminos de Gemma: https://ai.google.dev/gemma/terms
- No se han encontrado en la informacion proporcionada papers, blogs, repos adicionales ni demos del autor.
