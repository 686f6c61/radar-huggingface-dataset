# Peymandc/LFM3-1.7B-Heretic-Uncensored

## Resumen
LFM3-1.7B-Heretic-Uncensored es una variante modificada del modelo LiquidAI/LFM3-1.7B, publicada por el usuario Peymandc. Se trata de una version "decensored" (tambien etiquetada como abliterated) generada con la herramienta Heretic v2.1.0, que aplica una ablacion de rango arbitrario (Arbitrary-Rank Ablation) sobre las capas 9 a 24 del modelo original para reducir drasticamente sus comportamientos de rechazo. El modelo base es un transformer de 1.728.801.536 parametros (1,73B) con una arquitectura tri-hibrida propia de Liquid AI y una ventana de contexto de 256K tokens.

El proposito de esta variante no es mejorar las capacidades del modelo, sino eliminar los filtros de negativa a responder. Segun la evaluacion del autor con Heretic v2.1.0, las coincidencias de palabras clave de rechazo caen del 98% en el modelo original al 3% en esta version, con una divergencia KL de 0,0732 respecto al original medida sobre 100 prompts de `mlabonne/harmless_alpaca`. Es relevante para quienes investigan tecnicas de abliteration, para experimentos de alineacion y para casos donde el modelo base rechaza peticiones legitimas.

Conviene subrayar que las capacidades descritas (arquitectura, contexto, idiomas, entrenamiento agentico) provienen de la documentacion del modelo original de LiquidAI y no han sido reevaluadas sobre esta variante. El checkpoint esta post-entrenado para texto, orientado a agentes locales y despliegue en el borde, y se distribuye bajo la LFM Open License v1.0.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-hibrido: 24 capas (13 convoluciones cortas con compuerta, 5 de atencion de ventana deslizante, 6 de atencion global) |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens (entrada + salida) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el autor del modelo base menciona 4 bits, ~1 GB de memoria) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial sujeto a restricciones de la seccion 5 |
| Formato de pesos | safetensors (libreria transformers, requiere `custom_code`) |
| Vocabulario | 128.000 tokens |
| Tipo de checkpoint | Post-entrenado, solo texto |
| Tamano del repo | 3,5 GB |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura tri-hibrida de la familia LFM3 de Liquid AI: 24 capas que combinan 13 convoluciones cortas con compuerta, 5 capas de atencion de ventana deslizante y 6 capas de atencion global. Esta mezcla busca reducir el coste computacional de la atencion clasica manteniendo capacidad de modelado de dependencias largas, lo que permite sostener una ventana de 256K tokens con un modelo de solo 1,73B de parametros. El vocabulario es de 128.000 tokens y el checkpoint es de tipo post-entrenado, solo texto.

El modelo base fue post-entrenado por LiquidAI para entornos agenticos (Hermes Agent, Pi, OpenClaw) y para especializacion rapida mediante fine-tuning en una sola GPU. Sobre ese checkpoint, esta variante aplica una Arbitrary-Rank Ablation con Heretic v2.1.0 (ensayo de optimizacion #97) con los siguientes parametros: `start_layer_index` 9, `end_layer_index` 24, `preserve_good_behavior_weight` 0,3616, `steer_bad_behavior_weight` 0,0006, `overcorrect_relative_weight` 0,7002 y `neighbor_count` 14. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. El proceso de modificacion es reproducible segun el directorio `reproduce/` del repositorio.

## Capacidades
- Generacion de texto conversacional y razonamiento en 16 idiomas, incluido el espanol.
- Entrenamiento orientado a agentes: el modelo base fue post-entrenado para harnesses agenticos como Hermes Agent, Pi y OpenClaw.
- Ventana de contexto de 256K tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Capacidad de especializacion mediante fine-tuning rapido en una sola GPU, segun la documentacion del modelo base.
- Respuesta a peticiones que el modelo original rechazaria, como consecuencia de la ablacion aplicada (3/100 coincidencias de rechazo frente a 98/100 del original).
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling explicito ni modo de razonamiento extendido para esta variante.

## Casos de uso
- Investigacion sobre abliteration y alineacion: permite comparar el comportamiento del modelo original y de la variante ablacionada sobre los mismos prompts, con parametros de ablacion documentados y proceso reproducible.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa con tematicas adultas o controvertidas que el modelo base rechazaria, en un entorno controlado.
- Analisis de contenido sensible: clasificacion, resumen o discusion de textos que tratan violencia, drogas u otros temas que disparan rechazos en modelos alineados.
- Evaluacion de seguridad de sistemas: uso como modelo de ataque o referencia para medir la robustez de filtros y clasificadores propios frente a respuestas no censuradas.
- Experimentos de fine-tuning en el borde: al ser un modelo de 1,73B con contexto de 256K, sirve como base para adaptaciones en una sola GPU en dominios especializados.
- Procesamiento de documentos largos en varios idiomas: la ventana de 256K y el soporte de 16 idiomas permiten resumir o extraer informacion de expedientes extensos en espanol, ingles, arabe o chino, entre otros.
- Asistente conversacional local: con aproximadamente 1 GB en 4 bits segun el modelo base, puede desplegarse en portatiles o telefonos para prototipos sin conexion.

## Benchmarks y rendimiento
Los unicos datos de evaluacion publicados para esta variante son los de Heretic v2.1.0:

| Metrica | Este modelo | LFM3-1.7B original |
|---|---:|---:|
| Coincidencias de palabras clave de rechazo (100 prompts de `mlabonne/harmful_behaviors`) | 3/100 (3%) | 98/100 (98%) |
| Divergencia KL (100 prompts de `mlabonne/harmless_alpaca`) | 0,0732 | 0,0000 (por definicion) |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible para esta variante. El autor indica que las afirmaciones de capacidades y benchmarks del modelo base no han sido reevaluadas sobre esta version.

## Requisitos de hardware
- VRAM estimada: aproximadamente 1 GB en cuantizacion de 4 bits segun la documentacion del modelo base; en precision completa (safetensors, repo de 3,5 GB) se requiere espacio para los 1,73B parametros mas el contexto.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU consumer con 8 GB o mas puede alojar el modelo en 16 bits, y GPUs de 24 GB (RTX 3090, RTX 4090) permiten margen para contexto largo.
- Cabe en GPU consumer: si, segun el modelo base, en 4 bits ocupa alrededor de 1 GB y esta pensado para telefonos y portatiles.
- Opciones de despliegue: transformers con `custom_code` (formato nativo del repo); no se confirman en la informacion disponible soportes de vLLM, llama.cpp, Ollama o TGI para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM3-1.7B-Heretic-Uncensored | 1,73B | 256K | LFM Open License v1.0 | Variante ablacionada; 3% de rechazos |
| LiquidAI/LFM3-1.7B | 1,73B | 256K | LFM Open License v1.0 | Modelo original alineado; 98% de rechazos |
| Otros modelos de ~1,7B | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparacion mas directa es con el modelo base, del que esta variante solo difiere en el comportamiento de rechazo y en una divergencia KL de 0,0732. No se dispone de datos de benchmarks de capacidad para comparar con alternativas de tamano similar.

## Limitaciones y advertencias
- La ablacion elimina en gran medida los rechazos: el modelo puede responder a peticiones que el original denegaria, con riesgo de generar contenido danino, inexacto o inapropiado.
- La evaluacion de rechazos es un proxy basado en palabras clave sobre 100 prompts, no una evaluacion semantica ni revisada por humanos.
- La divergencia KL de 0,0732 indica que el comportamiento general se ha desplazado respecto al modelo original; puede haber degradacion en tareas benignas no medidas.
- Las capacidades, arquitectura e idiomas declarados provienen de la documentacion del modelo base y no han sido reevaluadas en esta variante.
- Riesgo de alucinacion inherente a un modelo de 1,73B; sus salidas no deben tratarse como informacion verificada ni como asesoramiento profesional.
- Licencia LFM Open License v1.0: el uso comercial esta sujeto a las restricciones de la seccion 5, que deben revisarse antes de cualquier despliegue en produccion.
- No se dispone de informacion sobre sesgos especificos de esta variante ni sobre el impacto de la ablacion en ellos.
- Requiere `custom_code` en transformers; la compatibilidad con otros runners no esta confirmada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Peymandc/LFM3-1.7B-Heretic-Uncensored
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de lanzamiento de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Coleccion LFM3: https://huggingface.co/collections/LiquidAI/lfm3
- Heretic: https://heretic-project.org
- Directorio de reproduccion: `reproduce/README.md` dentro del repositorio del modelo
- Pagina de soporte del autor: https://huggingface.co/spaces/Peymandc/support
