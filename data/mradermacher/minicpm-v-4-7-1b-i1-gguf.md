# mradermacher/MiniCPM-V-4.7-1B-i1-GGUF

# Ficha tecnica: MiniCPM-V-4.7-1B-i1-GGUF (mradermacher)

## Resumen

MiniCPM-V-4.7-1B-i1-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo multimodal `openbmb/MiniCPM-V-4.7-1B`, publicado por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversion y compresion del checkpoint original de OpenBMB orientada a inferencia en hardware limitado. El modelo de partida tiene 1.006.209.856 parametros y esta etiquetado como modelo de vision ("vision model") de tipo On-Device y ligero, con licencia Apache-2.0.

La relevancia de este repositorio radica en la disponibilidad de cuantizaciones "i1" (generadas con fichero imatrix) que cubren un rango muy amplio de compromisos tamano/calidad: desde ficheros de 0,5 GB en IQ1_S hasta 0,9 GB en Q6_K. Esto permite ejecutar un modelo vision-lenguaje de aproximadamente 1.000 millones de parametros en CPU, moviles, SBC o GPUs de gama baja, algo que el checkpoint original en safetensors (float) dificulta.

El repositorio se creo el 14 de octubre de 2026 y acumula 2190 descargas. Ademas de las cuantizaciones i1, el autor mantiene un repositorio hermano con cuantizaciones estaticas y los ficheros `mmproj` necesarios para la parte de vision, que no se incluyen en este repositorio. Toda la documentacion disponible es la propia del cuantizador; no hay model card tecnica detallada del entrenamiento en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con componente de vision; estructura interna no detallada en la informacion disponible) |
| Parametros totales | 1.006.209.856 (dato real de safetensors del modelo base) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K. Cuantizaciones estaticas adicionales en el repositorio MiniCPM-V-4.7-1B-GGUF |
| Idiomas soportados | en (segun la model card; no se documentan otros idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors |
| Fichero imatrix | MiniCPM-V-4.7-1B.imatrix.gguf (0,1 GB) para generar cuantizaciones propias |
| Rango de tamano de los quants | 0,5 GB (IQ1_S / IQ1_M / IQ2_XXS / IQ2_XS) a 0,9 GB (Q6_K) |
| Tamano total del repositorio | 13,9 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. Los metadatos lo identifican como modelo multimodal y la propia model card del cuantizador lo describe explicitamente como "vision model", por lo que incorpora un codificador de vision ademas del componente de lenguaje. El modelo base es `openbmb/MiniCPM-V-4.7-1B`, desarrollado por OpenBMB (grupo asociado a la Universidad de Tsinghua), y esta etiquetado como "On-Device Model" y "lightweight", lo que indica que su diseno prioriza el despliegue en dispositivo con un presupuesto de parametros en torno a los 1.000 millones.

En cuanto al proceso de creacion de este repositorio, la model card documenta el pipeline tecnico: `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`, y uso de cuantizaciones ponderadas con imatrix. El fichero imatrix se genera a partir de un dataset de calibracion y se emplea para las cuantizaciones de baja precision (familia IQ), lo que en la practica mejora la perplejidad frente a cuantizaciones no ponderadas del mismo tamano. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y la tarea declarada apuntan a uso de chat multi-turno.
- Comprension de imagenes: es un modelo de vision, por lo que procesa entradas visuales ademas de texto.
- Inferencia en dispositivo: el etiquetado "On-Device Model" y "lightweight" indica que el modelo esta pensado para ejecutarse localmente con recursos reducidos.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que las cuantizaciones pueden servirse a traves de endpoints compatibles con el formato GGUF.
- Multilingue: no disponible; la model card solo declara `en`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, audio): no disponible.

## Casos de uso

- Asistente de descripcion de imagenes en movil: con cuantizaciones de 0,5-0,8 GB, el modelo cabe en la memoria de un telefono de gama media y puede generar descripciones o etiquetas de fotos sin salir del dispositivo, evitando enviar imagenes a un servidor.
- Accesibilidad para personas con discapacidad visual: integrado en una aplicacion que capture la camara y describa el entorno en tiempo real; el tamano reducido permite latencias bajas en CPU y no requiere conectividad.
- Moderacion de contenido visual en el borde: clasificar imagenes subidas por usuarios antes de enviarlas a un servicio central, reduciendo el ancho de banda y la exposicion de datos sensibles.
- Clasificacion y etiquetado de documentos escaneados: extraer informacion de facturas o formularios sencillos en un pipeline local, con la salida de texto procesada posteriormente por reglas o un OCR de apoyo.
- Prototipado rapido de aplicaciones VLM: usar la cuantizacion Q4_K_M (0,8 GB) en un portatil sin GPU dedicada para validar una idea de producto antes de invertir en inferencia en la nube.
- Educacion y demos offline: desplegar el modelo en un Raspberry Pi o en un portatil antiguo con llama.cpp para talleres o ferias sin conexion a internet.
- Automatizacion de escritorio con Ollama: servir el GGUF desde Ollama y conectarlo a scripts locales que necesiten interpretar capturas de pantalla o imagenes generadas por el propio flujo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a listar las cuantizaciones y sus tamanos, sin incluir metricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales del modelo base. Tampoco se aportan mediciones de perplejidad por cuantizacion; el unico material de referencia grafico es un enlace externo a una comparativa generica de tipos de cuantizacion de baja calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,6 GB para IQ1/IQ2, 0,7-0,8 GB para Q3/IQ4 y Q4_K_M, y 0,9 GB para Q5_K_M y Q6_K, segun los tamanos de fichero publicados. Hay que anadir el consumo del contexto (cache KV) y el codificador de vision (`mmproj`), que se descarga del repositorio estatico.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones mas grandes; una RTX 3060, RTX 4060 o superior ofrece margen suficiente para contexto amplio y batching.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU de consumo moderna (GTX 1050 Ti en adelante, incluida la gama integrada en APUs recientes y los SoC Apple Silicon con memoria unificada) puede alojar el modelo completo.
- Ejecucion en CPU: viable. Con el modelo en RAM, llama.cpp puede ejecutarlo en procesadores de escritorio y en placas tipo Raspberry Pi 5; el rendimiento dependera de los nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, y cualquier servidor compatible con GGUF (por ejemplo, servidores con soporte de `endpoints_compatible`). Para la parte de vision es imprescindible usar un runtime que soporte `mmproj`.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas en la informacion proporcionada; dependen fuertemente del hardware, del tipo de cuantizacion y de si se procesan imagenes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B (este, via i1-GGUF) | 1,006 B | no disponible | no disponible | Apache-2.0 | GGUF en este repositorio; safetensors en el modelo base |
| SmolVLM-500M-Instruct (HuggingFace) | aprox. 0,5 B | no disponible | no disponible | Apache-2.0 | safetensors y GGUF de terceros |
| SmolVLM2-2.2B (HuggingFace) | aprox. 2,2 B | no disponible | no disponible | Apache-2.0 | safetensors |
| Qwen2.5-VL-3B-Instruct | aprox. 3,75 B | no disponible | no disponible | Apache-2.0 | safetensors |

Los datos de rendimiento y contexto de los modelos comparados no estan disponibles en la informacion proporcionada y deben verificarse en sus respectivas model cards. La comparacion relevante aqui es de orden de magnitud: MiniCPM-V-4.7-1B se situa en la franja de 1.000 millones de parametros, entre SmolVLM-500M y SmolVLM2-2.2B, y por debajo de Qwen2.5-VL-3B. Su ventaja diferencial no es el rendimiento bruto, sino la existencia de cuantizaciones de hasta 0,5 GB y su orientacion explicita a dispositivo.

## Limitaciones y advertencias

- No es un modelo original: es una recuantizacion. Cualquier problema de calidad del checkpoint base se hereda, y las cuantizaciones anaden degradacion adicional.
- Degradacion por cuantizacion: el propio autor etiqueta varias cuantizaciones con advertencias explicitas, como IQ1_S ("for the desperate"), IQ1_M ("mostly desperate"), Q2_K_S ("very low quality") e IQ3_XXS ("lower quality"). Para uso en produccion conviene partir de Q4_K_M o superior.
- Idioma: la model card solo declara `en`. No hay evidencia en la informacion disponible de un soporte multilingue fiable, en particular para castellano.
- Riesgo de alucinacion: no disponible en la documentacion; como en cualquier VLM de este tamano, cabe esperar invencion de detalles en imagenes ambiguas o con texto denso.
- Sesgos: no disponible.
- Licencia: Apache-2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base `openbmb/MiniCPM-V-4.7-1B` y de cualquier componente de vision asociado antes de desplegarlo en produccion.
- Dependencia de ficheros externos: los `mmproj` necesarios para la faceta de vision no estan en este repositorio, sino en el repositorio de cuantizaciones estaticas; hay que descargarlos aparte.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar escenarios de contexto largo.
- Fecha de publicacion: el repositorio esta fechado en octubre de 2026 y cuenta con 0 likes y 2190 descargas, por lo que la validacion comunitaria es todavia escasa.

## Enlaces

- Repositorio HuggingFace (cuantizaciones i1): https://huggingface.co/mradermacher/MiniCPM-V-4.7-1B-i1-GGUF
- Repositorio de cuantizaciones estaticas y ficheros mmproj: https://huggingface.co/mradermacher/MiniCPM-V-4.7-1B-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Fichero imatrix: https://huggingface.co/mradermacher/MiniCPM-V-4.7-1B-i1-GGUF/resolve/main/MiniCPM-V-4.7-1B.imatrix.gguf
- Pagina de resumen del cuantizador para este modelo: https://hf.tst.eu/model#MiniCPM-V-4.7-1B-i1-GGUF
- Guia de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones y preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Grafica comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo en las busquedas realizadas.
