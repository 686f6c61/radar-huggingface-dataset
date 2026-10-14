# ahmedsamirtarjama/arabic-ocr-dots-ft-e6c

## Resumen

`arabic-ocr-dots-ft-e6c` es un ajuste fino experimental del modelo de OCR y análisis de layout `rednote-hilab/dots.mocr`, publicado por el usuario ahmedsamirtarjama. El modelo parte de los pesos del modelo base y aplica un LoRA de rango 64 ya fusionado en los pesos finales, manteniendo el *vision tower* congelado durante el entrenamiento. El resultado se distribuye en formato safetensors con 3.039.179.264 parámetros totales (unos 3,04 mil millones) y un repositorio de 6,1 GB.

El objetivo del proyecto es adaptar un modelo multimodal de documentos al reconocimiento óptico de caracteres (OCR) en árabe y a la extracción de estructura de documentos (layout). Las etiquetas del repositorio (`arabic`, `ocr`, `document-layout`, `text-generation`, `conversational`) y el uso de un *prompt* de layout en inglés (`prompt_layout_all_en`) apuntan a un flujo de trabajo centrado en transcribir y estructurar documentos en árabe.

Se trata de un artefacto de investigación, no de un modelo de producción: el autor lo etiqueta explícitamente como *experiment*, no declara licencia ni idiomas soportados de forma oficial, y el repositorio registra 0 descargas y 0 *likes* en el momento de la consulta. La información pública disponible es muy limitada y remite a documentación alojada en un repositorio de dataset separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de OCR/layout `rednote-hilab/dots.mocr`; requiere `trust_remote_code` / `custom_code`) |
| Parametros totales | 3.039.179.264 (aproximadamente 3,04 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (la configuracion de inferencia documentada fija `max_tokens` de 8192, que es limite de generacion, no contexto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | no disponible oficialmente; el modelo esta etiquetado como `arabic` y el prompt de inferencia documentado esta en ingles (`prompt_layout_all_en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

Otros datos tecnicos relevantes: el ajuste fino consiste en un LoRA de rango 64 fusionado en los pesos del modelo base, con el *vision tower* congelado. La inferencia documentada se realiza con vLLM, `temperature` 0.1, `top_p` 1.0, `max_tokens` 8192, seguida de un postprocesado (`trim_tail` + `trim_v2`). El nombre de directorio indicado en la model card es `models/dots_ft_e6c_merged` y el nombre de checkpoint es `e6c`.

## Arquitectura y entrenamiento

No se dispone de una descripcion detallada de la arquitectura en la informacion proporcionada. Lo unico documentado es que se trata de un ajuste fino sobre `rednote-hilab/dots.mocr`, un modelo orientado a OCR y layout de documentos, y que la adaptacion se hizo con LoRA de rango 64 cuyos pesos se fusionaron posteriormente en los pesos base. El *vision tower* permanecio congelado, de modo que la adaptacion se concentra en la parte de lenguaje/decodificacion y no en el codificador visual heredado del modelo base.

Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. La model card remite a los ficheros `docs/TEST_PROTOCOL.md` y `REPORT.md` del repositorio de codigo `arabic-ocr-research-data/code` para consultar los resultados, y a `code/scripts/` para el codigo de postprocesado de inferencia. Los parametros de generacion documentados (temperatura 0.1, `top_p` 1.0) indican un uso deliberadamente determinista, coherente con una tarea de transcripcion donde se busca reproducibilidad.

## Capacidades

- Reconocimiento optico de caracteres (OCR) orientado a documentos en arabe, segun las etiquetas `arabic` y `ocr` del repositorio.
- Analisis de estructura y layout de documentos (etiqueta `document-layout`), con un prompt especifico de layout documentado (`prompt_layout_all_en`).
- Generacion de texto condicionada por imagen de documento (pipeline declarado: `text-generation`).
- Uso conversacional segun la etiqueta `conversational`, presumiblemente en el sentido de interaccion prompt-respuesta sobre el documento, no de chat generalista.
- Integracion con vLLM para servir el modelo, segun la configuracion de inferencia documentada.
- Codigo personalizado: el repositorio esta etiquetado con `custom_code`, por lo que la carga requiere `trust_remote_code=True` en la libreria `transformers`.
- Capacidades no confirmadas: no hay evidencia en la informacion disponible de soporte de *tool calling*, function calling, agentes, razonamiento multi-paso, vision general (fuera de documentos), audio ni modo de razonamiento explicito.

## Casos de uso

- Digitalizacion de archivos administrativos arabes: el modelo puede transcribir documentos escaneados y devolver su contenido estructurado, aprovechando la adaptacion especifica al arabe y las capacidades de layout heredadas del modelo base.
- Extraccion de datos de facturas y formularios arabes: combinando OCR y analisis de layout es posible localizar campos (cabeceras, tablas, importes) y volcarlos a un formato procesable para sistemas de contabilidad o ERP.
- Procesamiento de documentacion legal y notarial en arabe: la transcripcion estructurada facilita la indexacion y busqueda posterior sobre corpus que hoy solo existen en papel o PDF escaneado.
- Alimentacion de pipelines RAG sobre corpus arabes: el texto extraido puede trocearse y vectorizarse para construir bases de conocimiento consultables, algo inviable sin un OCR fiable en ese idioma.
- Digitalizacion de prensa historica y fondos bibliotecarios: el modelo permite convertir hemerotecas y colecciones digitalizadas en texto buscable, con la estructura de columnas y bloques preservada por el analisis de layout.
- Preprocesado de documentos para revision humana asistida: en lugar de automatizar la decision final, el modelo genera una transcripcion que un revisor valida, reduciendo el tiempo de tecleo manual.
- Investigacion en OCR arabe: al ser un experimento con LoRA fusionado, sirve como punto de partida reproducible (semilla `e6c`) para comparar variantes de ajuste fino y protocolos de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados deben consultarse en `docs/TEST_PROTOCOL.md` y `REPORT.md` dentro del repositorio de codigo `arabic-ocr-research-data/code`, pero no se incluye ninguna cifra (ni MMLU, ni HumanEval, ni metricas de OCR como CER/WER o mAP de layout) en los datos proporcionados. No se deben asumir cifras no verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo propio a partir de los 3,04 mil millones de parametros, sin datos oficiales del autor):
  - FP16/BF16: aproximadamente 6,1 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica conviene reservar 8-10 GB o mas segun el lote y la longitud de secuencia.
  - INT8: en torno a 3-4 GB de pesos.
  - INT4: en torno a 2 GB de pesos.
  - Advertencia: el modelo incluye un *vision tower*, cuyo coste adicional de memoria no esta cuantificado en la informacion disponible.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamano, el modelo es desplegable en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB, RTX 3090 de 24 GB o RTX 4080 de 16 GB) en FP16 o cuantizado; para servir con concurrencia alta son mas adecuadas A100, H100 o L40S.
- Cabe en GPU de consumo: si, previsiblemente, en tarjetas de 16 GB o mas en FP16, y en tarjetas de 8-12 GB si se cuantiza, aunque no se publican pesos cuantizados en el repositorio.
- Opciones de despliegue: vLLM es la ruta documentada por el autor. La libreria declarada es `transformers`, y al estar etiquetado como `custom_code` requiere `trust_remote_code=True`. No se documenta compatibilidad con llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput estimados: no disponibles. La unica referencia es la configuracion de generacion (`max_tokens` 8192, temperatura 0.1) y la necesidad de postprocesado con `trim_tail` y `trim_v2`.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas que permitan una comparacion rigurosa. La unica comparacion posible con la informacion proporcionada es contra el propio modelo base del que deriva.

| Modelo | Parametros | Contexto | Licencia | Formato | Relacion |
|---|---|---|---|---|---|
| `ahmedsamirtarjama/arabic-ocr-dots-ft-e6c` | 3.039.179.264 | no disponible | no disponible | safetensors | Ajuste fino con LoRA r64 fusionado, vision tower congelado |
| `rednote-hilab/dots.mocr` | no disponible en la informacion proporcionada (el ajuste no altera el numero de parametros del base) | no disponible | no disponible | no disponible | Modelo base sobre el que se aplica el ajuste |
| `dots-studio/dots.mocr` | no disponible | no disponible | no disponible | no disponible | Referenciado como `base_model` en las etiquetas del repositorio |
| Otros modelos de OCR de documentos | no disponible | no disponible | no disponible | no disponible | No se aportan alternativas comparables en la informacion disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara de uso comercial; conviene tratar el modelo como no apto para produccion hasta aclarar este punto.
- Artefacto de investigacion: el autor lo etiqueta como *experiment* dentro de un proyecto de investigacion, no como una release estable.
- Ausencia de validacion externa: 0 descargas y 0 *likes* en el momento de la consulta, sin resultados de benchmarks publicados en la ficha.
- Riesgo de alucinacion: como modelo generativo aplicado a OCR, puede producir texto plausible que no aparece en la imagen, especialmente con documentos degradados, manuscritos o tipografias poco frecuentes. En transcripcion documental esto es especialmente critico y exige verificacion.
- Cobertura idiomatica incierta: solo el arabe esta etiquetado; no se declaran otros idiomas, y el prompt de layout documentado esta en ingles, lo que puede afectar al comportamiento en entradas multilingues o con transliteraciones.
- Limitaciones de contexto no documentadas: se desconoce la ventana de contexto real; el valor de 8192 corresponde a `max_tokens` de generacion, no a la longitud de entrada, por lo que documentos muy largos pueden requerir troceado.
- Vision tower congelado: la adaptacion visual se limita a lo heredado del modelo base; si el dominio objetivo tiene caracteristicas visuales muy distintas (por ejemplo, manuscritos arabes), la mejora puede ser menor de lo esperado.
- Dependencia de codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio y anade riesgo de seguridad y de compatibilidad entre versiones de `transformers`.
- Postprocesado obligatorio: la salida documentada requiere aplicar `trim_tail` y `trim_v2` del repositorio `arabic-ocr-research-data`; sin ese paso, la calidad de la salida puede degradarse.
- Sin pesos cuantizados publicados: desplegar en entornos con VRAM limitada exige cuantizar por cuenta propia, con el consiguiente riesgo de perdida de precision en una tarea sensible a errores de caracter.
- Rendimiento real desconocido: no hay cifras de CER/WER, precision de layout ni throughput, por lo que cualquier estimacion de calidad es especulativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahmedsamirtarjama/arabic-ocr-dots-ft-e6c
- Modelo base (referenciado en la model card): https://huggingface.co/rednote-hilab/dots.mocr
- Modelo base (referenciado en las etiquetas): https://huggingface.co/dots-studio/dots.mocr
- Repositorio de datos y codigo del proyecto: `arabic-ocr-research-data` (dataset repo), subcarpetas `code/`, `code/scripts/`, `docs/TEST_PROTOCOL.md` y `REPORT.md` (referenciados en la model card; no se proporciona URL directa en la informacion disponible)
- Paper, blog o demo oficiales: no disponibles en la informacion proporcionada
