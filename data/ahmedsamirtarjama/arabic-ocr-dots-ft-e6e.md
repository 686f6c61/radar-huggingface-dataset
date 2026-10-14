# ahmedsamirtarjama/arabic-ocr-dots-ft-e6e

## Resumen

`arabic-ocr-dots-ft-e6e` es un ajuste fino (fine-tune) del modelo multimodal `rednote-hilab/dots.mocr`, orientado a OCR y analisis de maquetacion (layout) de documentos en arabe. Lo publica el usuario ahmedsamirtarjama como proyecto de investigacion, con el identificador completo `ahmedsamirtarjama/arabic-ocr-dots-ft-e6e`. El entrenamiento consiste en un LoRA de rango 64 fusionado en los pesos base, manteniendo congelado el tower de vision, lo que indica que la adaptacion se concentra en el decodificador de texto.

El modelo tiene 3.039.179.264 parametros (aproximadamente 3,04 mil millones) y se distribuye en formato safetensors con un repositorio de 6,1 GB, lo que es coherente con pesos en precision de 16 bits. La tarea declarada por el autor es text-generation sobre pipeline de transformers, con etiquetas que apuntan a OCR, document-layout y arabe, ademas de la marca `custom_code`, lo que implica que la carga del modelo requiere codigo personalizado.

Como pieza de evaluacion, resulta relevante porque aborda un nicho poco cubierto: OCR de documentos arabes con preservacion de estructura. Sin embargo, es un experimento de investigacion sin descargas ni interacciones en el momento de la consulta, sin licencia declarada y sin resultados de benchmarks publicados en la informacion disponible, por lo que no debe considerarse listo para produccion sin una validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer con tower de vision congelado y decodificador de texto (detalle completo no disponible) |
| Parametros totales | 3.039.179.264 (aproximadamente 3,04 mil millones) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible (el autor usa `max_tokens` 8192 en inferencia, pero no declara la ventana de contexto) |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors (previsiblemente bf16/fp16). No se listan GGUF ni cuantizaciones oficiales |
| Idiomas soportados | no disponible en la ficha; las etiquetas del repositorio indican arabe (`arabic`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | `rednote-hilab/dots.mocr` (segun la model card); las etiquetas referencian `dots-studio/dots.mocr` |
| Libreria | transformers (requiere `custom_code` y `trust_remote_code`) |
| Tamano del repositorio | 6,1 GB |
| Fecha de publicacion | 2026-10-13 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo multimodal de OCR `dots.mocr`. La model card describe explicitamente la receta: un LoRA de rango 64 fusionado en los pesos base, con el tower de vision congelado. Esto implica que la arquitectura subyacente es un modelo vision-language (una torre de vision que produce representaciones de la imagen del documento y un decodificador de texto que genera la transcripcion y la estructura), y que el proceso de adaptacion al arabe solo modifico los parametros del decodificador. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO.

El autor indica que el proyecto se ejecuto en el directorio `/mnt/extra/ocr` de un servidor (`server3-ts`), con el directorio de modelo `models/dots_ft_e6e_merged`. La inferencia documentada se realiza con vLLM, usando el prompt `prompt_layout_all_en`, temperatura 0,1, top_p 1,0 y `max_tokens` 8192, seguida de un postprocesado denominado `trim_tail` y `trim_v2` para limpiar la salida. El codigo de inferencia y de postprocesado se referencia dentro de un repositorio de dataset llamado `arabic-ocr-research-data`, en la ruta `code/scripts/`. No se detalla ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa, SSM, mezcla de expertos) en la informacion proporcionada.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre documentos en arabe.
- Analisis de maquetacion de documentos (`document-layout`): el prompt de inferencia empleado es de tipo layout, orientado a preservar la estructura del documento en la salida.
- Generacion de texto condicionada por imagen, con pipeline declarado `text-generation` dentro de `transformers`.
- Procesamiento multimodal entrada imagen / salida texto: la presencia de un tower de vision lo confirma.
- Capacidad conversacional declarada en las etiquetas del repositorio (`conversational`).
- Idiomas: el entrenamiento se orienta al arabe; no se documenta soporte multilingue adicional.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Audio: no disponible.

## Casos de uso

- Digitalizacion de archivos administrativos en arabe: el modelo transcribe documentos escaneados y, al usar un prompt de layout, puede conservar la estructura de tablas, encabezados y bloques de texto, lo que facilita la carga posterior en un sistema de gestion documental.
- Extraccion de datos de facturas y formularios arabes: integrado en un pipeline OCR previo a un parser de campos, reduce la necesidad de plantillas especificas por proveedor al devolver la estructura del documento.
- Indexacion y busqueda semantica de corpus arabes: la transcripcion generada puede alimentar un motor de busqueda o un sistema RAG sobre documentacion historica o legal.
- Preprocesado para traduccion automatica: al convertir imagenes de documentos arabes en texto plano con estructura, se habilita una etapa posterior de traduccion o resumen automatico.
- Investigacion en OCR arabe: sirve como punto de partida reproducible para comparar variantes de ajuste fino (LoRA r64 fusionado, tower de vision congelado) sobre el modelo base `dots.mocr`.
- Evaluacion de modelos multimodal en entornos academicos: permite medir el efecto del ajuste sobre el modelo base en tareas de layout y reconocimiento de texto arabe, usando el protocolo descrito en `TEST_PROTOCOL.md`.
- Automatizacion de ingesta documental en backoffice: desplegado con vLLM y el prompt `prompt_layout_all_en` documentado, puede procesar lotes de documentos y devolver texto estructurado listo para validacion humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los documentos `docs/TEST_PROTOCOL.md` y `REPORT.md` dentro del repositorio de datos `arabic-ocr-research-data/code`, pero no se incluyen cifras concretas (ni MMLU, ni metricas de OCR como CER/WER, ni comparativas) en el material proporcionado. No se deben asumir valores de rendimiento a partir del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo de 3,04 mil millones de parametros, en fp16/bf16 el peso ocupa aproximadamente 6,1 GB, por lo que se necesitarian del orden de 8-10 GB de VRAM contando cache de activaciones y de KV. En cuantizacion de 8 bits, alrededor de 3 GB de pesos (aproximadamente 5-6 GB totales); en 4 bits, alrededor de 1,5-2 GB de pesos (aproximadamente 3-4 GB totales). Estas cifras son estimaciones aritmeticas a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: no disponible en la informacion del autor. Por tamano, el modelo es compatible con GPU de gama alta de consumo (por ejemplo, RTX 4090 con 24 GB) en fp16 sin problema de capacidad, y con GPU profesionales (A100, H100) para despliegue por lotes.
- Cabe en GPU de consumo: si, previsiblemente cualquier GPU con 8 GB o mas de VRAM en fp16, y con 4-6 GB si se aplica cuantizacion. No hay confirmacion oficial del autor.
- Opciones de despliegue: el autor documenta vLLM como motor de inferencia. Al tratarse de un modelo `transformers` con `custom_code`, tambien seria necesario `trust_remote_code` para cargarlo con la libreria estandar. Soporte en llama.cpp, Ollama o TGI: no disponible (requiere conversion a GGUF, no publicada).
- Latencia y throughput: no disponible. Parametros de decodificacion documentados: temperatura 0,1, top_p 1,0, `max_tokens` 8192.

## Comparativa con modelos similares

No se dispone de datos verificables de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa se limita al modelo base del que deriva.

| Modelo | Parametros | Contexto | Licencia | Relacion |
|---|---|---|---|---|
| `ahmedsamirtarjama/arabic-ocr-dots-ft-e6e` | 3.039.179.264 (3,04 B) | no disponible | no disponible | Fine-tune con LoRA r64 fusionado y tower de vision congelado |
| `rednote-hilab/dots.mocr` | no disponible | no disponible | no disponible | Modelo base declarado en la model card |
| `dots-studio/dots.mocr` | no disponible | no disponible | no disponible | Identificador referenciado en las etiquetas del repositorio |

Otros modelos de OCR multimodal comparables: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No se declara licencia en el repositorio ni se detalla la del modelo base, por lo que el uso comercial es incierto y requiere verificacion con el autor y con la licencia de `rednote-hilab/dots.mocr`.
- Es un experimento de investigacion, no un modelo validado para produccion: cero descargas y cero interacciones en el momento de la consulta.
- No se publican resultados de benchmarks ni metricas de error de OCR (CER/WER) en la informacion disponible, por lo que el rendimiento real sobre documentos arabes es desconocido.
- Riesgo de alucinacion: al ser un modelo generativo aplicado a OCR, puede producir texto plausible que no aparece en la imagen, especialmente en documentos degradados o con tipografias poco frecuentes. No se documenta ningun mecanismo de mitigacion.
- Ambito idiomatico restringido: el ajuste se orienta al arabe; no hay evidencia de buen rendimiento en otros idiomas ni de capacidades multilingues.
- Longitud de contexto no documentada: el autor solo indica `max_tokens` 8192 como limite de generacion, lo que no equivale a la ventana de contexto del modelo. Documentos largos podrian superar la ventana real.
- Dependencia de codigo personalizado: el repositorio incluye `custom_code`, de modo que la carga exige `trust_remote_code=True`, lo que implica ejecutar codigo de terceros.
- Dependencia de postprocesado: la salida del modelo se limpia con `trim_tail` y `trim_v2`, codigo alojado en un repositorio de datos externo. Sin ese postprocesado, la calidad de la salida puede degradarse.
- Sesgos: no disponible. No se documenta analisis de sesgos ni composicion del dataset de ajuste.
- Coherencia de metadatos: la model card cita `rednote-hilab/dots.mocr` como base, mientras que las etiquetas del repositorio apuntan a `dots-studio/dots.mocr`. Conviene confirmar cual es el modelo base efectivo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ahmedsamirtarjama/arabic-ocr-dots-ft-e6e
- Modelo base segun la model card: https://huggingface.co/rednote-hilab/dots.mocr
- Modelo base segun las etiquetas del repositorio: https://huggingface.co/dots-studio/dots.mocr
- Repositorio de datos y codigo de investigacion referenciado por el autor: `arabic-ocr-research-data` (rutas `code/scripts/`, `docs/TEST_PROTOCOL.md`, `REPORT.md`); URL no disponible en la informacion proporcionada.
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Todas las coincidencias devueltas corresponden al videojuego "Prototype" (jeuxvideo.com) y no guardan relacion con este modelo.
