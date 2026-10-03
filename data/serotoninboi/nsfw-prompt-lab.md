# serotoninboi/nsfw-prompt-lab

## Resumen

NSFW Prompt Lab es un Space de HuggingFace (SDK Docker) publicado por el usuario serotoninboi que actúa como servicio de generación y etiquetado de prompts para modelos de difusión con contenido explícito. No es un modelo entrenado desde cero, sino una aplicación que orquesta dos modelos GGUF cuantizados ejecutados localmente mediante Ollama: un modelo de visión `Qwen3-VL-4B-Instruct-Uncensored-abliterated` con proyector multimodal `mmproj` en Q8_0 (~2,7 GB en Q4_K_M) para etiquetar imágenes, y un modelo de lenguaje `Huihui-Qwen3-8B-abliterated-v2` (~5,0 GB en Q4_K_M) para redactar prompts a partir de una descripción breve.

El valor diferencial del proyecto no está en los pesos, sino en el mecanismo de anclaje (grounding): el modelo de lenguaje recibe en cada llamada a `/prompt` un prompt de sistema extraído de `knowledge.md`, un fichero de unos 19 KB que contiene vocabulario anatómico, convenciones de tokens ponderados, bancos de etiquetas y prompts de ejemplo destilados del espacio de trabajo local `nsfw-work` y de una base de conocimiento en Notion. Esto convierte al modelo en un asistente especializado en la sintaxis concreta de plataformas de generación de imágenes.

El proyecto es relevante como ejemplo de despliegue self-hosted de bajo coste: todo el sistema cabe en un Space CPU gratuito con 16 GB de RAM, con la limitación de que solo puede mantener un modelo residente a la vez (`OLLAMA_MAX_LOADED_MODELS=1`, `OLLAMA_KEEP_ALIVE=0`), lo que provoca cargas en frío de 30-60 segundos. Su orientación explícitamente NSFW (etiqueta `not-for-all-audiences`) y su licencia `other` lo sitúan fuera del uso comercial convencional y de los entornos de producción sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso en ambos componentes, segun los modelos base Qwen3-8B y Qwen3-VL-4B; no se detalla en la model card |
| Parametros totales | 8B (modelo de prompt) y 4B (modelo de vision) |
| Longitud de contexto | no disponible en la model card |
| Tipos de cuantizacion | Q4_K_M para ambos modelos; proyector multimodal mmproj en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | other (con etiqueta not-for-all-audiences) |
| Formato de pesos | GGUF (ejecutados con Ollama) |
| Tamano en disco | ~2,7 GB (vision, Q4_K_M) y ~5,0 GB (prompt, Q4_K_M) |
| SDK del Space | docker |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-02 |
| Ultima actualizacion | 2026-10-02 |

## Arquitectura y entrenamiento

El componente de lenguaje, `Huihui-Qwen3-8B-abliterated-v2`, deriva de la familia Qwen3 (transformer denso de 8.000 millones de parametros) y ha sido sometido a un proceso de *abliteration*, una tecnica de modificación de pesos que elimina direcciones de rechazo del espacio de activaciones para reducir las negativas del modelo ante contenido sensible. El componente de vision, `Qwen3-VL-4B-Instruct-Uncensored-abliterated`, sigue la misma logica sobre un modelo multimodal de 4.000 millones de parametros con un encoder visual y un proyector `mmproj`. No se proporcionan detalles sobre el dataset de entrenamiento original, el numero de tokens, la composicion de los datos ni si hubo fases de RLHF o DPO; toda esa informacion correspondiente a los modelos base no se reproduce en esta model card.

La innovacion tecnica del proyecto reside en el sistema de anclaje por fichero. En lugar de ajustar los pesos (fine-tuning) para especializar el modelo en la redaccion de prompts NSFW, el autor inyecta `knowledge.md` como prompt de sistema en cada llamada a `/prompt`. Ese fichero se regenera de forma reproducible con `build_knowledge.py` a partir de `~/Desktop/nsfw-work/prompts/` y `knowledge_sources/`, y el autor desaconseja editarlo a mano directamente en el Space. El sistema se expone mediante tres endpoints (`/prompt`, `/vision`, `/knowledge`) mas un endpoint `/health` que informa de que modelos estan registrados.

## Capacidades

- Generacion de prompts para modelos de difusion (positivos y negativos) a partir de una descripcion breve en lenguaje natural.
- Parametrizacion de prompts: el propio autor indica que una llamada completa devuelve un bloque de prompt, prompt negativo y parametros.
- Etiquetado automatico de imagenes para flujos tipo SDXL mediante el endpoint `/vision`.
- Vision-lenguaje: el modelo `Qwen3-VL-4B` aporta comprension de imagenes y generacion de descripciones o etiquetas a partir de ellas.
- Especializacion en vocabulario anatomico masculino, convenciones de tokens ponderados y bancos de etiquetas, segun el contenido declarado de `knowledge.md`.
- Inspeccion del contexto de anclaje en tiempo de ejecucion mediante `GET /knowledge`.
- API HTTP sencilla basada en `curl` con envio de formularios multipart (`request` para texto, `image` + `instruction` para vision).
- No se declara soporte de tool calling, function calling, agentes, multi-step reasoning, modo thinking, audio ni capacidades multilingues explicitas.

## Casos de uso

- Redaccion asistida de prompts para generacion de imagenes: un usuario envia una idea breve (`daddy silver fox, gym, cinematic`) y recibe un bloque completo con prompt positivo, negativo y parametros sugeridos, gracias al anclaje sobre `knowledge.md`.
- Etiquetado de imagenes para entrenamiento de LoRAs o dreambooth: el endpoint `/vision` acepta una imagen y una instruccion (por ejemplo, "tag this for SDXL") y devuelve etiquetas utilizables como metadatos de dataset.
- Normalizacion de vocabulario en un pipeline de difusion: al estar anclado a un banco de etiquetas concreto, el modelo tiende a producir tokens coherentes con la sintaxis esperada por el generador, reduciendo la variabilidad entre prompts.
- Auditoria y reproducibilidad del contexto: `GET /knowledge` permite verificar exactamente con que informacion se esta anclando el modelo, util para depurar por que se generan ciertas etiquetas.
- Prototipado de herramientas internas de contenido: al ser un Space Docker con API HTTP, sirve como backend desechable para probar interfaces de usuario que consuman prompts generados.
- Despliegue educativo o de investigacion sobre abliferation: el proyecto documenta un caso real de comparacion entre un modelo alineado y su version abliterated, con la diferencia de comportamiento que ello implica.
- Ejecucion en hardware modesto: un Space CPU gratuito permite experimentar sin coste, aceptando la penalizacion de latencia (2-5 tok/s en el modelo de 8B y minutos por bloque completo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica de evaluacion, ni para los modelos base ni para las versiones abliterated. Tampoco se aportan comparaciones cuantitativas frente a alternativas.

## Requisitos de hardware

- VRAM estimada para el modelo de prompt: aproximadamente 5,0 GB de pesos en Q4_K_M mas el *overhead* de contexto de Ollama; el autor no publica una cifra oficial.
- VRAM estimada para el modelo de vision: aproximadamente 2,7 GB en Q4_K_M mas el proyector `mmproj` en Q8_0; el autor no publica una cifra oficial.
- RAM del Space de referencia: 16 GB, suficiente para mantener un unico modelo residente pero no ambos a la vez.
- Configuracion de Ollama documentada: `OLLAMA_KEEP_ALIVE=0` y `OLLAMA_MAX_LOADED_MODELS=1`, lo que fuerza descarga tras cada uso y recarga de 30-60 segundos tras un periodo de inactividad.
- Aceleracion recomendada: el propio autor indica que un Space con GPU L4 ejecuta la misma imagen aproximadamente 20 veces mas rapido que la configuracion CPU.
- GPUs de consumo: dado el tamano de los pesos, ambos modelos caben en GPUs de consumo con 8 GB o mas de VRAM, aunque el dato no se declara explicitamente en la model card.
- Opciones de despliegue: Ollama como motor de inferencia dentro de un contenedor Docker; los pesos son GGUF, por lo que tambien serian compatibles con llama.cpp. No se mencionan vLLM ni TGI.
- Rendimiento medido por el autor: 2-5 tokens por segundo en el modelo de 8B sobre CPU; un bloque completo de prompt, negativo y parametros tarda varios minutos.

## Comparativa con modelos similares

No se dispone de resultados de evaluacion ni de una comparativa publicada por el autor. A continuacion se comparan los dos componentes del Space con sus modelos base, que son las referencias mas directas disponibles.

| Componente | Parametros | Formato | Proposito | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3-8B-abliterated-v2 | 8B | GGUF Q4_K_M | Generacion de prompts de texto | no disponible | Derivado de Qwen3-8B con abliferation |
| Qwen3-8B (base) | 8B | safetensors / GGUF | Proposito general | no disponible | Modelo de referencia sin abliferation |
| Qwen3-VL-4B-Instruct-Uncensored-abliterated | 4B | GGUF Q4_K_M + mmproj Q8_0 | Vision-lenguaje y etiquetado | no disponible | Derivado de Qwen3-VL-4B Instruct con abliferation |

No se han identificado en la informacion proporcionada alternativas equivalentes de prompt-engineering especializado comparables en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo esta explicitamente marcado con la etiqueta `not-for-all-audiences`; su proposito declarado es la generacion de contenido NSFW.
- La licencia es `other`, sin terminos publicados en la informacion disponible; no puede asumirse permiso para uso comercial y conviene revisar las condiciones de los modelos base Qwen3 antes de cualquier despliegue.
- El proceso de abliferation elimina mecanismos de rechazo, lo que incrementa el riesgo de generar contenido danino, ilegal o no deseado sin las salvaguardas habituales de un modelo alineado.
- Riesgo de alucinacion: el modelo puede inventar etiquetas o convenciones que no existan en la plataforma de destino, especialmente si `knowledge.md` esta incompleto o desactualizado.
- Dependencia fuerte del anclaje: si `knowledge.md` cambia, el comportamiento del modelo cambia sin que se modifiquen los pesos, lo que complica la reproducibilidad entre versiones.
- Latencia elevada en CPU: 2-5 tok/s y varios minutos por bloque completo hacen inviable el uso interactivo en la configuracion gratuita.
- Carga en frio de 30-60 segundos por el uso de `OLLAMA_KEEP_ALIVE=0` y `OLLAMA_MAX_LOADED_MODELS=1`.
- Solo un modelo residente a la vez: las llamadas alternas entre `/prompt` y `/vision` fuerzan recargas continuas.
- No se declaran idiomas soportados ni longitud de contexto; ambos datos son relevantes para evaluar sesgos y limites practicos.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion ni de validacion por terceros.
- No hay benchmarks publicados, por lo que el rendimiento real frente a alternativas no puede contrastarse.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/serotoninboi/nsfw-prompt-lab
- Endpoint de salud del Space: `https://<user>-nsfw-prompt-lab.hf.space/health`
- Endpoint de generacion de prompts: `https://<user>-nsfw-prompt-lab.hf.space/prompt`
- Endpoint de etiquetado de imagenes: `https://<user>-nsfw-prompt-lab.hf.space/vision`
- Endpoint de inspeccion del anclaje: `https://<user>-nsfw-prompt-lab.hf.space/knowledge`
- No se han encontrado en la informacion proporcionada papers, repositorios adicionales, blogs ni demos mas alla de la propia model card.
