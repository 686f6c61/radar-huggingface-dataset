# Litap007/indic-citizen-information-board-pmgsy-florence2-lora

## Resumen

IndicCivic-VLM es un adaptador LoRA sobre el modelo vision-language `microsoft/Florence-2-base` (232M parametros), desarrollado por el autor Litap007 (Rohit Manikrao Patil) y publicado en HuggingFace bajo licencia MIT. El modelo resuelve un problema muy concreto: la extraccion directa de informacion estatutaria estructurada (costes de sancion, chainage, contratista, ratios de mantenimiento y calendarios DLP) a partir de fotografias de carteles de obra de infraestructura rural india del programa PMGSY, esquivando las fragiles cascadas OCR-a-NLP.

La propuesta es un adaptador de solo 442.368 parametros entrenables (0,1908% del backbone) que se acopla al modelo base mediante PEFT. El entrenamiento se realizo sobre el dataset `Litap007/indic-citizen-information-board-pmgsy` y cubre seis idiomas: ingles, hindi, marati, tamil, telugu y bengali. La tarea principal es DocVQA con salida en JSON, usando el token especial `<DocVQA>`.

Es relevante porque demuestra que un ajuste LoRA de rango muy bajo (r=8) sobre un modelo pequeno puede convertir un modelo generico que falla por completo en un dominio especializado en un extractor funcional: pasa de 0% de JSON valido en zero-shot a 76% tras 300 pasos de entrenamiento. El repositorio ocupa 0,0 GB y acumula 23 descargas, lo que indica un proyecto de nicho, reciente y de bajo perfil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Florence-2-base (vision-language transformer) + adaptador LoRA via PEFT |
| Parametros totales | 232M (backbone) + 442.368 entrenables en el adaptador |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card usa `torch.float32` en el ejemplo) |
| Idiomas soportados | en, hi, mr, ta, te, bn |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT); requiere el backbone Florence-2-base |
| Rank LoRA (r) | 8 |
| Alpha LoRA | 16 |
| Modulos objetivo | `q_proj`, `v_proj` |
| Dropout | 0,05 |
| Pasos de entrenamiento | 300 |
| Dataset | `Litap007/indic-citizen-information-board-pmgsy` |
| Pipeline | image-to-text |

## Arquitectura y entrenamiento

El modelo base es Florence-2-base, un transformer vision-language de 232M parametros de Microsoft disenado para tareas unificadas de vision (captioning, deteccion, grounding, OCR y DocVQA) mediante prompts de tarea. Sobre el se aplica un adaptador LoRA de rango 8 y alpha 16, con dropout 0,05, unicamente sobre las proyecciones de query y value (`q_proj`, `v_proj`) de la atencion. Esto limita los parametros entrenables a 442.368, lo que hace el ajuste extremadamente ligero y barato de reproducir.

El entrenamiento se realizo durante 300 pasos sobre el dataset Indic Citizen Information Board PMGSY, compuesto por fotografias de carteles de obra en condiciones reales: inclinacion de perspectiva de 3 a 6 grados, oxidacion ferrica, salpicaduras de barro y desgaste. La tarea es extraccion de informacion clave (KIE) directa imagen-a-JSON mediante el prompt `<DocVQA>`. No se documenta en la informacion disponible el uso de RLHF, DPO ni el numero exacto de tokens de entrenamiento. La innovacion principal es precisamente el enfoque: sustituir la cascada OCR + NLP por una extraccion end-to-end que evita propagar errores de reconocimiento de caracteres.

## Capacidades

- Extraccion directa de JSON estatutario a partir de imagenes de carteles de obra (costes de sancion, chainage, contratista, ratios de mantenimiento, calendarios DLP).
- DocVQA sobre documentos visuales degradados (oxidacion, barro, inclinacion de perspectiva).
- Generacion de texto imagen-a-texto mediante el token de tarea `<DocVQA>`.
- Cobertura multilingue de carteles en seis idiomas: ingles, hindi, marati, tamil, telugu y bengali.
- Reconocimiento de entidades numericas complejas (importes, fechas, coordenadas de chainage).
- Capacidades heredadas del backbone Florence-2-base (captioning, deteccion, grounding), aunque el adaptador esta especializado en DocVQA.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento explicito.

## Casos de uso

- Auditoria de obra publica rural: procesar lotes de fotografias de carteles PMGSY tomadas por inspectores de campo y extraer automaticamente coste sancionado, contratista y plazo para contrastar con los registros oficiales.
- Digitalizacion de archivos fotograficos de infraestructura: convertir el historico de fotografias de carteles en una base de datos estructurada en JSON, ya que el modelo produce directamente claves y valores sin necesidad de postprocesar texto OCR.
- Verificacion de mantenimiento y DLP: extraer los ratios de mantenimiento y las fechas de periodo de garantia de los carteles para alertar sobre vencimientos, aprovechando la extraccion de entidades numericas y de fecha.
- Control de calidad en campo desde dispositivos moviles: el adaptador es tan pequeno (442K parametros) que puede desplegarse junto al backbone de 232M en portatiles o GPUs de consumo para inspeccion in situ sin conexion.
- Investigacion en vision-language para lenguas indicas: servir como linea base reproducible de ajuste LoRA para DocVQA multilingue en dominios de bajos recursos.
- Procesamiento de documentos degradados en general: reutilizar el adaptador como punto de partida para otras tareas de KIE sobre documentos con ruido visual (facturas, senaletica, formularios), dado el bajo coste de reentrenamiento.
- Monitorizacion de transparencia civica: alimentar portales de datos abiertos con la informacion estructurada extraida de los carteles para que ciudadanos y periodistas puedan consultarla.

## Benchmarks y rendimiento

Evaluacion sobre 50 carteles de test no vistos, con inclinacion de perspectiva de 3 a 6 grados, oxidacion y salpicaduras de barro:

| Arquitectura | Pasos de entrenamiento | JSON valido (%) | Recall de entidades numericas (%) |
|---|---|---|---|
| Florence-2 Base (zero-shot) | 0 | 0,00% | 0,00% (solo tokens de localizacion) |
| IndicCivic-VLM (este adaptador) | 300 | 76,00% | 51,64% (252 / 488 aciertos) |

El modelo base sin ajustar falla por completo en este dominio y emite tokens de localizacion espacial alucinados (`<loc_128>...`). Tras 300 pasos LoRA, el adaptador alcanza un 76% de JSON sintacticamente valido y un 51,64% de recall sobre entidades numericas de ingenieria (costes de sancion, chainage, fechas de finalizacion). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone Florence-2-base de 232M en float32 ocupa aproximadamente 1 GB; en float16 o bfloat16, alrededor de 0,5 GB. El adaptador anade unos pocos MB. En la practica, menos de 2 GB de VRAM con overhead.
- GPU recomendadas: cualquier GPU con 4 GB o mas; no requiere A100 ni H100. Funciona en RTX 3060, RTX 4090 o incluso en Apple Silicon via MPS (el ejemplo de la model card contempla `mps`).
- Cabe en GPU de consumo: si, sin problema, incluidas GPUs de gama baja y portatiles.
- Opciones de despliegue: `transformers` + `peft` (ruta oficial documentada); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y el uso de `trust_remote_code=True` con Florence-2 limita algunas de estas opciones.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IndicCivic-VLM (este) | 232M + 442K LoRA | no disponible | DocVQA especializado en carteles PMGSY | MIT | HuggingFace (adaptador PEFT) |
| microsoft/Florence-2-base | 232M | no disponible | Vision-language generalista | MIT | HuggingFace |
| microsoft/Florence-2-large | 771M | no disponible | Vision-language generalista | MIT | HuggingFace |
| Donut (base) | ~200M | no disponible | Document understanding end-to-end | MIT | HuggingFace |

Frente a Florence-2-base, la diferencia es el ajuste de dominio: el base obtiene 0% de JSON valido en carteles PMGSY y este adaptador un 76%. Frente a Florence-2-large, este modelo prioriza el coste computacional minimo sobre la capacidad general. Frente a Donut, que tambien evita la cascada OCR, este adaptador aporta cobertura especifica de seis lenguas indicas y del dominio PMGSY.

## Limitaciones y advertencias

- El recall de entidades numericas es del 51,64%, por lo que aproximadamente la mitad de los valores numericos criticos (costes, fechas, chainage) pueden faltar o ser incorrectos; no es apto para uso autonomo en auditoria sin verificacion humana.
- Un 24% de las salidas no son JSON sintacticamente valido, lo que exige un validador y logica de reintento en produccion.
- El adaptador esta entrenado exclusivamente sobre carteles PMGSY; su rendimiento fuera de ese dominio (otros formatos de cartel, otros paises) es desconocido y probablemente pobre.
- Evaluacion limitada a 50 imagenes de test; la varianza estadistica de las metricas es alta.
- Sesgos conocidos: no documentados en la informacion disponible; al tratarse de un dominio de infraestructura rural india, hereda los sesgos de la distribucion del dataset de entrenamiento.
- Riesgo de alucinacion: el modelo base ya alucina tokens de localizacion; el adaptador reduce el problema pero no lo elimina, y puede generar valores numericos plausibles pero falsos.
- Licencia MIT: permite uso comercial, pero el modelo base Florence-2-base tambien es MIT, por lo que no hay restricciones adicionales conocidas; conviene verificar los terminos del dataset de entrenamiento antes de uso comercial.
- Requiere `trust_remote_code=True` para cargar Florence-2, lo que implica ejecutar codigo remoto del repositorio base.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; no debe emplearse como modelo conversacional general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Litap007/indic-citizen-information-board-pmgsy-florence2-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/Litap007/indic-citizen-information-board-pmgsy
- Modelo base Florence-2-base: https://huggingface.co/microsoft/Florence-2-base
- Licencia MIT: https://opensource.org/licenses/MIT
