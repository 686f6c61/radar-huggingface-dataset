# EloaurdiMustapha/marchespublics-sft2

## Resumen

marchespublics-sft2 es un modelo de lenguaje publicado por el usuario EloaurdiMustapha en HuggingFace, distribuido exclusivamente en formato GGUF y con un total de 7.518.069.290 parametros (~7,5 mil millones) segun los metadatos del repositorio. El nombre del proyecto y de los archivos (`gemma-4-e4b-it.BF16-mmproj.gguf` y `gemma-4-e4b-it.Q4_K_M.gguf`) apuntan a un ajuste fino supervisado (SFT) sobre un modelo base de la familia Gemma en su variante orientada a vision, y el sufijo "marchespublics" sugiere un dominio de especializacion en licitaciones y contratacion publica. La model card no confirma ninguno de estos extremos.

El modelo se distribuye convertido a GGUF mediante Unsloth y esta pensado para ejecutarse con llama.cpp. La presencia del archivo `mmproj` (proyector multimodal) y el tag `vision-language-model` indican soporte de entrada de imagenes, lo que habilita tareas de OCR y comprension de documentos escaneados, habituales en el ambito de los pliegos de contratacion. El repositorio ocupa 6,3 GB, un tamano compatible con la publicacion de una cuantizacion Q4_K_M junto al proyector multimodal, y no con pesos completos en BF16.

La relevancia de esta ficha es limitada pero informativa: se trata de un modelo con 0 descargas y 0 "likes", sin licencia declarada, sin idiomas declarados y sin benchmarks publicados. Es un artefacto de ajuste fino de autor individual, no validado por la comunidad, lo que condiciona cualquier evaluacion de produccion. Esta ficha recoge los datos verificables y marca explicitamente como "no disponible" todo lo que la informacion proporcionada no permite confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre de los archivos remite a la familia Gemma; sin confirmar en la model card) |
| Parametros totales | 7.518.069.290 (~7,5 mil millones) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M en GGUF; proyector multimodal en BF16 (`gemma-4-e4b-it.BF16-mmproj.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors en el repositorio |
| Tamano del repositorio | 6,3 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-09-28 |
| Ultima actualizacion | 2026-09-28 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo: no se especifica si se trata de un transformer denso, de una variante con atencion eficiente, de una mezcla de expertos ni el tipo de capas utilizado. El unico dato estructural fiable es el recuento de parametros (7.518.069.290) y la existencia de un archivo de proyector multimodal, lo que confirma que el modelo acepta entrada visual ademas de texto. La nomenclatura de los archivos sigue el patron de la familia Gemma, pero la model card no identifica la version exacta del base ni enlaza a el.

Tampoco hay detalle sobre el entrenamiento: no se indica el numero de tokens, la composicion del dataset, si hubo fases de RLHF, DPO o preferencias, ni el procedimiento de ajuste mas alla de que la conversion a GGUF se realizo con Unsloth. El sufijo "sft2" sugiere una segunda iteracion de ajuste supervisado, y el nombre del modelo apunta a un corpus de licitaciones publicas, pero ambas afirmaciones son inferencias a partir del nombre y no estan documentadas. Como innovacion tecnica solo puede citarse el propio empaquetado: conversion a GGUF con soporte de proyector multimodal para inferencia local mediante `llama-mtmd-cli`.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` confirma el uso previsto como modelo de dialogo.
- Comprension de imagenes: la presencia del archivo `mmproj` y el tag `vision-language-model` indican entrada multimodal (imagen mas texto) mediante `llama-mtmd-cli`.
- Ejecucion local: compatible con llama.cpp y, por extension, con el resto del ecosistema GGUF.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere adaptacion a APIs de tipo HuggingFace Endpoints, aunque no se detalla el procedimiento.
- Tool calling / function calling: no disponible; no declarado en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo de razonamiento explicito (thinking): no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Extraccion de datos de pliegos de licitacion: dado el nombre del modelo y su capacidad multimodal, se usaria para leer PDF escaneados o capturas de pliegos y extraer campos como presupuesto base, plazos, criterios de adjudicacion o solvencia exigida. La entrada visual permite trabajar sobre documentos no digitalizados.
- Triaje y resumen de licitaciones: procesar lotes de anuncios y generar resumenes estructurados por organo de contratacion, importe y plazo, para alimentar un CRM o un panel interno de oportunidades.
- Redaccion asistida de memorias tecnicas: generar borradores de apartados recurrentes (metodologia, medios materiales, plan de calidad) a partir de los requisitos del pliego, con revision humana posterior.
- Asistente conversacional especializado para equipos de licitaciones: resuelve preguntas internas del tipo "que documentacion acredita la solvencia economica" apoyandose en el material de referencia de la organizacion.
- Clasificacion automatica de documentacion administrativa: separar y etiquetar anexos, declaraciones responsables y certificados dentro de un expediente, usando texto e imagen de la pagina.
- Despliegue en local con requisitos de privacidad: al ejecutarse con llama.cpp en hardware propio, permite tratar expedientes con datos sensibles sin enviar documentos a servicios en la nube.
- Prototipado rapido en estaciones de trabajo sin GPU dedicada: la cuantizacion Q4_K_M permite pruebas funcionales en CPU antes de decidir una inversion en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para la cuantizacion Q4_K_M: en torno a 5-6 GB para los pesos, mas overhead de contexto y memoria del proyector multimodal (estimacion a partir de 7,5 mil millones de parametros; no verificada por el autor).
- VRAM estimada para pesos en BF16: en torno a 15 GB para los pesos, mas proyector y cache KV (estimacion; el repositorio no publica pesos BF16 completos).
- GPU consumer compatibles: la cuantizacion Q4_K_M deberia caber en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 2070) y con margen ajustado en 6 GB. En BF16 requeriria 24 GB (RTX 3090, RTX 4090) o superior.
- GPU de centro de datos: A100 40 GB, H100 80 GB o L40S para servir el modelo en BF16 con contextos largos y concurrencia.
- Ejecucion en CPU: viable con llama.cpp y la cuantizacion Q4_K_M; el rendimiento dependera del numero de nucleos y del ancho de banda de memoria, sin datos publicados por el autor.
- Opciones de despliegue: llama.cpp (`llama-cli --jinja` para texto, `llama-mtmd-cli --jinja` para multimodal), servidor compatible con API de llama.cpp, y herramientas de terceros capaces de cargar GGUF (Ollama o LM Studio) siempre que soporten el proyector multimodal.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos verificables del modelo evaluado (contexto, licencia, idiomas, benchmarks), por lo que cualquier comparacion cuantitativa seria especulativa. La tabla siguiente recoge unicamente el encuadre cualitativo; los datos de los modelos alternativos deben verificarse en sus propias fichas antes de usarse.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| marchespublics-sft2 | 7,5 mil millones (dato del repo) | no disponible | no disponible | GGUF en HuggingFace |
| Gemma 3n E4B IT (familia de referencia por nomenclatura) | no disponible en esta ficha | no disponible | no disponible | no disponible |
| Qwen2.5-VL 7B (alternativa multimodal de tamano similar) | no disponible en esta ficha | no disponible | no disponible | no disponible |
| Llama 3.2 11B Vision (alternativa multimodal de gama similar) | no disponible en esta ficha | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial, redistribucion ni modificacion. Es un bloqueo legal para cualquier despliegue en produccion.
- Ausencia de validacion: 0 descargas y 0 "likes" en el momento de redactar la ficha; no hay evidencia de uso real ni de evaluacion independiente.
- Riesgo de alucinacion: no hay benchmarks ni evaluaciones publicadas que permitan acotar la tasa de error, algo especialmente critico en un dominio normativo como la contratacion publica, donde una cifra o un plazo inventado tiene consecuencias.
- Idiomas no declarados: se desconoce si el ajuste conserva competencia multilingue o si esta sesgado hacia un unico idioma, lo que afecta al tratamiento de documentacion bilingue.
- Contexto desconocido: sin longitud de contexto declarada no puede planificarse el troceado de pliegos largos ni garantizarse el manejo de expedientes completos.
- Arquitectura y base sin confirmar: la model card no identifica la version exacta del modelo base, lo que impide auditar la procedencia de los pesos y las obligaciones de atribucion heredadas.
- Trazabilidad del ajuste limitada: no se documentan datos de entrenamiento, sesgos, ni metodo de alineacion; no puede evaluarse el sesgo sistematico introducido por el corpus de ajuste.
- Empaquetado parcial: el repositorio contiene la cuantizacion Q4_K_M y el proyector BF16, no los pesos completos; cualquier trabajo que requiera reentrenamiento o fusion de adaptadores tendra que partir de otra fuente.
- Uso recomendado: evaluacion interna, prototipado y pruebas de concepto con supervision humana, nunca decisiones automatizadas con efecto juridico o economico.

## Enlaces

- HuggingFace: https://huggingface.co/EloaurdiMustapha/marchespublics-sft2
- Unsloth (herramienta de conversion citada en la model card): https://github.com/unslothai/unsloth
- llama.cpp (runtime implicito por el formato GGUF): no enlazado en la model card
- Paper, blog o demo del autor: no disponible
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos fueron listados comerciales de unidades SSD NVMe, sin relacion con la ficha.
