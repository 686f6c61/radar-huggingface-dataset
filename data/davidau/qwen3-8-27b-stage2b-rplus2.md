# DavidAU/Qwen3.8-27B-stage2b-rplus2

## Resumen

Qwen3.8-27B-stage2b-rplus2 es un ajuste fino (finetune) del modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, publicado por el usuario DavidAU en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text de 27.781 millones de parametros, derivado de la familia Qwen 3.8, que combina tecnicas de ajuste por etapas ("Cold Fusion", "GAIN Training", "Multi-stage tuning") con una reduccion deliberada de la censura (variante "heretic" de intensidad ligera-moderada). La licencia declarada es Apache 2.0 y el unico idioma oficialmente soportado es el ingles.

El modelo se presenta como la variante "stage2b-rplus2" de un proceso de ajuste por etapas, seleccionada por su seguimiento de instrucciones consistente y su atencion al detalle, con capacidad de "multi-stage drafting" (borrador y verificacion en varias pasadas) cuando se le solicita. Su interes practico radica en que reduce el numero de tokens de razonamiento respecto al modelo base manteniendo o mejorando las metricas de benchmarks de sentido comun, y en que ofrece modos de razonamiento e instruccion conmutables en caliente.

El repositorio ocupa 55,6 GB y contiene pesos en safetensors compatibles con transformers. Cuenta con 603 descargas y 74 "likes" en el momento de la consulta. No se dispone de informacion sobre la longitud de contexto, los datos exactos de entrenamiento ni los formatos de cuantizacion publicados para esta revision concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); familia Qwen 3.8, ajuste fino sobre base DavidAU |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para este repo (la model card menciona evaluaciones en MXFP8 y MXFP4 de la rama TWIN-TURBO; los GGUF se publican en repositorios hermanos) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por etapas sobre un Qwen 3.8 de 27 B con capacidad de entrada de imagen y texto. La model card describe una metodologia propia del autor que combina "Cold Fusion" (fusion de pesos o re-mezcla de componentes del modelo base), "GAIN Training" y "Multi-stage tuning", con una etapa final denominada internamente "stage2b-rplus2" (en la documentacion de la rama hermana aparece como "stage2b-rplus3"). Segun el autor, esta etapa se selecciono entre varias candidatas por su seguimiento de instrucciones superior y consistente, su atencion al detalle y su capacidad de doble comprobacion cuando se le pide explicitamente.

El ajuste incluye una componente "heretic" (reduccion de rechazos) de intensidad ligera-moderada. En la rama TWIN-TURBO el autor reporta 68/100 rechazos frente a 86/100 del Qwen 3.8 sin ajustar, con una divergencia KL de 0,0025; no se especifica si esas cifras corresponden exactamente a esta revision. Los datasets declarados son DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets y DavidAU/THE-DECKARD-Datasets. No se indica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. Tampoco se detalla si la torre de vision fue reentrenada o congelada.

## Capacidades

- Generacion de texto conversacional en ingles con modo instruct y modos de razonamiento (la rama TWIN-TURBO declara 5 modos de thinking y 5 de instruct conmutables en caliente, incluso dentro del chat).
- Entrada multimodal image-text-to-text (pipeline declarado en Hugging Face).
- Razonamiento con reduccion de tokens de "thinking": el autor afirma entre 1/2 y 1/5 (hasta 1/20 en la rama TWIN-TURBO) respecto al modelo sin ajustar.
- Multi-stage drafting: borrador, revision y doble comprobacion cuando se solicita explicitamente.
- Soporte de tool calling / function calling: la model card menciona plantillas Jinja actualizadas (una de ~17 KB y otra "enhanced tool" de ~32 KB) para corregir problemas de llamada a herramientas.
- Capacidades de agente y razonamiento multi-paso derivadas de los modos de thinking y del soporte de herramientas.
- Capacidad multilingue limitada: solo se declara ingles.
- Ajuste "heretic" de censura reducida (intensidad ligera-moderada en esta variante).

## Casos de uso

- Asistentes conversacionales en ingles con contexto de imagen: el pipeline image-text-to-text permite adjuntar capturas, diagramas o documentos escaneados y mantener una conversacion multi-turno sobre ellos.
- Automatizacion de soporte tecnico con tool calling: las plantillas Jinja de herramientas actualizadas permiten conectar el modelo a APIs internas (consulta de estado, creacion de tickets) dentro de un agente.
- Generacion de codigo asistida en pipelines de desarrollo: el modelo puede integrarse en herramientas tipo IDE o CI/CD para revision de parches y explicacion de errores, siempre que el equipo acepte la licencia Apache 2.0 y el sesgo heretic.
- Extraccion estructurada de informacion de documentos con imagenes: facturas, formularios o capturas de pantalla procesadas en una sola pasada multimodal, con salida en JSON mediante instrucciones y function calling.
- Investigacion sobre alineacion y censura: el modelo sirve como punto de comparacion controlado (68/100 rechazos, KL 0,0025 en la rama hermana) frente a la version ULTRA-HERETIC (6/100 rechazos, KL 0,0397) para estudiar el efecto de la reduccion de rechazos en tareas de evaluacion.
- Prototipado rapido de agentes de razonamiento con presupuesto de tokens ajustado: la reduccion de tokens de thinking abarata la inferencia en escenarios de cadena de pensamiento larga, como clasificacion de tickets o triaje de incidencias.
- Despliegue en local para experimentacion: al publicarse en safetensors y con repositorios GGUF hermanos, permite pruebas en estaciones de trabajo sin depender de APIs externas.

## Benchmarks y rendimiento

La model card incluye resultados del arnes de nightmedia para la rama TWIN-TURBO (modo instruct, cuantizacion MXFP8 y MXFP4), no necesariamente para esta revision exacta. Se reproducen como referencia:

| Modelo / cuantizacion | arc/c | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| TWIN-TURBO 709-L (stage2b-rplus3), mxfp8 | 0,709 | 0,876 | 0,914 | 0,827 | 0,524 | 0,834 | 0,779 |
| TWIN-TURBO 709-L (stage2b-rplus3), mxfp4 | 0,701 | 0,877 | 0,913 | 0,821 | 0,518 | 0,830 | 0,786 |
| TWIN-TURBO 709 ULTRA-HERETIC, mxfp8 | 0,699 | 0,873 | 0,911 | 0,827 | 0,528 | 0,833 | 0,781 |
| Qwen3.8-27B base sin ajustar, mxfp8 | 0,591 | 0,782 | 0,896 | 0,746 | 0,448 | 0,801 | 0,711 |
| Qwen3.6-27B, mxfp8 | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.6-35B-A3B, mxfp8 | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |
| Qwen3.5-27B, mxfp8 | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |

El autor advierte que BF16 suele rendir entre 2 y 5 puntos por encima de MXFP8 en la mayoria de metricas y que el modo thinking supera al modo instruct en la mayoria de casos. No se han publicado resultados especificos de esta revision (stage2b-rplus2) ni de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,78 B de parametros, en BF16 se requieren aproximadamente 55-56 GB de VRAM solo para pesos; en FP8/MXFP8 unos 28-30 GB; en cuantizaciones de 4 bits (MXFP4, GGUF Q4) unos 15-17 GB, mas overhead de contexto y de la torre de vision.
- GPU recomendadas: A100 80 GB o H100 80 GB para BF16 sin cuantizar; L40S 48 GB o A6000 48 GB para FP8; RTX 4090 24 GB para 4 bits con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) con cuantizacion de 4 bits y contexto limitado; en GPUs de 16 GB solo con cuantizaciones agresivas y riesgo de desbordamiento por el componente de vision.
- Opciones de despliegue: transformers con safetensors (via principal de este repo); llama.cpp, Ollama y vLLM a traves de los GGUF publicados en los repositorios hermanos del autor (NEO MTP GGUF); TGI no esta confirmado para esta arquitectura.
- Latencia y throughput: no disponibles. La reduccion de tokens de razonamiento (1/2 a 1/5, hasta 1/20 en la rama TWIN-TURBO) reduce el coste por consulta en modo thinking, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-stage2b-rplus2 (este) | 27,78 B | no disponible | Apache 2.0 | Finetune heretic ligero-moderado, multimodal, solo ingles |
| Qwen3.8-27B-TWIN-TURBO 709-L (rama hermana) | 27 B | no disponible | Apache 2.0 | Misma base, 5 modos de thinking e instruct, benchmarks publicados, GGUF disponibles |
| Qwen3.8-27B-TWIN-TURBO 709 ULTRA-HERETIC | 27 B | no disponible | Apache 2.0 | 6/100 rechazos, KL 0,0397; mayor perdida de alineacion |
| Qwen3.6-27B-Fable-Fusion-711 | 27 B | no disponible | Apache 2.0 | Generacion anterior; menor puntuacion en arc/c y hswag segun el autor |
| Qwen3.6-35B-A3B | 35 B (MoE, 3 B activos) | no disponible | Apache 2.0 | Inferencia mas barata por token activo, pero peor en las metricas reportadas |

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta evaluado y puede degradarse.
- El ajuste "heretic" reduce los rechazos a 68/100 (rama hermana): puede producir contenido que el modelo base rechazaria, lo que exige filtros de seguridad propios en produccion.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones de veracidad ni de calibracion publicadas para esta revision.
- La model card es fundamentalmente promocional y contiene enlaces a repositorios hermanos; muchas especificaciones (contexto, datos de entrenamiento, cuantizaciones) no estan documentadas para este repo concreto.
- Los benchmarks disponibles corresponden a la rama TWIN-TURBO con nombre interno "stage2b-rplus3", no a "stage2b-rplus2"; no deben atribuirse directamente a este modelo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y la procedencia de los datasets de ajuste (Polar-STRICT, F451-STRICT, THE-DECKARD) no esta detallada.
- El soporte de tool calling depende de plantillas Jinja actualizadas; sin ellas pueden aparecer fallos de formato en las llamadas a funciones.
- El repositorio pesa 55,6 GB y no incluye GGUF: el despliegue en hardware limitado requiere acudir a los repositorios hermanos del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.8-27B-stage2b-rplus2
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Proyecto Cold Fable Fusion GAIN V1.1 (stage1): https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fable-Fusion-GAIN-V1.1-732-Heretic-Uncensored-stage1
- Rama TWIN-TURBO con model card completa y GGUF NEO MTP: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Rama TURBO NEO CODER MAX MTP GGUF: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Qwen3.6-27B Fable Fusion 711: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen3.8-27B Cold Fusion GAIN V1.1 NEO MAX MTP GGUF: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Discusion con el "pelican test": https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored/discussions/3
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
