# ahmedsamirtarjama/arabic-ocr-abl-plain1k-nopres

## Resumen

`arabic-ocr-abl-plain1k-nopres` es un ajuste fino (fine-tune) del modelo vision-lenguaje `Qwen/Qwen3-VL-4B-Instruct` orientado a OCR y comprension de estructura de documentos en arabe. Lo publica el usuario de HuggingFace `ahmedsamirtarjama` y se presenta explicitamente como un experimento de investigacion (etiqueta `research`), no como un modelo listo para produccion. El propio autor indica que forma parte de un estudio de ablacion sobre OCR arabe, con los resultados documentados en ficheros externos (`TEST_PROTOCOL.md` y `REPORT.md`) que no acompanan al repositorio.

Tecnicamente, el modelo parte de los pesos de Qwen3-VL-4B-Instruct (4.437.815.808 parametros segun safetensors, unos 4,44 mil millones) y aplica un LoRA de rango 64 fusionado en los pesos base, dejando la torre de vision congelada. Por tanto, el modelo hereda la arquitectura vision-lenguaje multimodal del modelo base, con pipeline `image-text-to-text`, y el ajuste se centra en la rama de lenguaje para tareas de reconocimiento y transcripcion de texto arabe en imagenes de documentos.

Su relevancia es acotada: se trata de un checkpoint experimental con 0 descargas y 0 likes en el momento de redactar esta ficha, sin licencia declarada ni idiomas especificados en la metadata, y con la validacion delegada a documentacion externa. Resulta interesante como referencia para quien investigue OCR arabe con modelos VLM de ~4B, pero no como componente recomendado para despliegues comerciales sin una evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje de tipo Qwen3-VL: torre de vision (congelada en el fine-tune) + decodificador de lenguaje; ajuste por LoRA r64 fusionado |
| Parametros totales | 4.437.815.808 (~4,44 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors en su precision original) |
| Idiomas soportados | Arabe (objetivo declarado del fine-tune); el resto no disponible. Los prompts de inferencia del autor estan en ingles (`prompt_layout_all_en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `Qwen3-VL-4B-Instruct`, un modelo multimodal vision-lenguaje que combina un codificador visual con un decodificador de lenguaje autorregresivo de la familia Qwen3. En este checkpoint concreto, el autor aplica un LoRA de rango 64 y lo fusiona directamente en los pesos base, mientras mantiene congelada la torre de vision. Esta decision implica que la adaptacion afecta principalmente a la parte de lenguaje y a la proyeccion multimodal, y no reentrena el extractor de caracteristicas visuales.

El nombre del experimento (`abl-plain1k-nopres`) sugiere, por convencion del autor, un estudio de ablacion con aproximadamente 1000 muestras de tipo "plain" y sin componente de "presentacion", pero esto es una inferencia a partir del identificador y no un dato confirmado en la informacion disponible. No se especifican el numero total de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. Los hiperparametros de inferencia declarados son: vLLM como motor, prompt `prompt_layout_all_en`, temperatura 0.1, top_p 1.0, `max_tokens` 8192 y un postprocesado de recorte (`trim_tail` y `trim_v2`) implementado en scripts de un repositorio de datos externo.

## Capacidades

- Generacion de texto y transcripcion de texto arabe a partir de imagenes de documentos (OCR).
- Comprension de estructura de documento (etiqueta `document-layout`), orientada a identificar bloques y disposicion del contenido.
- Entrada imagen-texto y salida de texto (`image-text-to-text`).
- Capacidades generales heredadas del modelo base Qwen3-VL-4B-Instruct: razonamiento, generacion de codigo, matematicas y comprension visual, aunque el fine-tune puede haberlas desplazado hacia la tarea de OCR.
- Soporte multilingue inherente al modelo base, no verificado ni documentado en este checkpoint.
- Soporte de tool calling / function calling: presumiblemente heredado del modelo base, no documentado aqui.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Modo "thinking": no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de documentos arabes: el modelo puede transcribir imagenes de documentos a texto plano, aprovechando la ventana del modelo base para procesar paginas completas.
- Extraccion de datos de facturas y recibos en arabe: uso del modelo para volcar lineas de concepto, importes y fechas a un formato estructurado posterior.
- Procesamiento de formularios administrativos: transcripcion de campos manuscritos o impresos en arabe, con postprocesado de recorte para limpiar la salida.
- Analisis de disposicion de pagina: al llevar la etiqueta `document-layout`, puede emplearse para localizar y ordenar bloques de texto dentro de una pagina.
- Construccion de pipelines de RAG sobre corpus arabes escaneados: el modelo actuaria como capa de OCR previa a la indexacion en un motor de busqueda vectorial.
- Investigacion academica en OCR arabe: util como checkpoint de referencia y como punto de comparacion frente a otros VLM en estudios de ablacion.
- Archivado de prensa historica en arabe: transcripcion de recortes escaneados para crear un corpus consultable.

En todos los casos conviene tratar la salida como propuesta a revisar, dado el caracter experimental del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los ficheros `docs/TEST_PROTOCOL.md` y `REPORT.md` del repositorio de datos `arabic-ocr-research-data`, pero dichos datos no acompanan a esta informacion.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 9 GB para los pesos (el repositorio ocupa 8,9 GB), mas la memoria de cache KV, que crece con la longitud de contexto y el numero de imagenes procesadas.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 3 GB de pesos.
- GPU recomendadas para precision completa: A100 40 GB, H100, L40S o RTX 4090 24 GB con margen de sobra.
- GPU de consumo: cabe en tarjetas de 8-12 GB si se cuantiza a 4 u 8 bits; con 16 GB o mas (RTX 4080, 4090, 3090) se puede ejecutar en bf16 sin problema.
- Opciones de despliegue: vLLM es el motor declarado por el autor; tambien `transformers`. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion no documentada en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `arabic-ocr-abl-plain1k-nopres` | ~4,44 mil millones | no disponible | no disponible | HuggingFace (pocas/cero descargas documentadas) | Fine-tune experimental de OCR arabe |
| `Qwen/Qwen3-VL-4B-Instruct` (modelo base) | ~4,44 mil millones | no disponible en esta informacion | no disponible en esta informacion | HuggingFace, ampliamente difundido | Modelo generalista vision-lenguaje sin especializar en arabe |
| Otros VLM especializados en OCR arabe | no disponible | no disponible | no disponible | no disponible | Sin datos verificables en la informacion proporcionada |

No se dispone de cifras de rendimiento comparadas para establecer una valoracion cuantitativa frente a alternativas.

## Limitaciones y advertencias

- Checkpoint estrictamente experimental: la propia model card lo etiqueta como `experiment` y lo vincula a un proyecto de investigacion, no a un producto.
- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso para uso comercial. La licencia del modelo base no se hereda automaticamente si el repositorio no la declara.
- Idiomas no declarados en la metadata: solo el nombre y las etiquetas permiten inferir el arabe como idioma objetivo; el resto queda sin confirmar.
- Validacion externa: los resultados de evaluacion se remiten a documentacion que no acompana al modelo, por lo que no hay cifras de calidad verificables.
- Riesgo de alucinacion: en OCR, los modelos generativos pueden inventar caracteres o palabras ausentes en la imagen, especialmente con manuscritos o tipografias poco frecuentes.
- Adaptacion limitada: al congelar la torre de vision y ajustar solo con LoRA r64 fusionado, la mejora visual es acotada; los errores del codificador visual del modelo base se mantienen.
- Posible degradacion de capacidades generales: un fine-tune estrecho puede reducir el rendimiento en tareas ajenas al OCR arabe.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento del registro, lo que implica ausencia de validacion por parte de la comunidad.
- Advertencias de produccion: no recomendado como componente critico sin una evaluacion propia sobre el dominio concreto y sin aclarar la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahmedsamirtarjama/arabic-ocr-abl-plain1k-nopres
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio de datos y codigo citado por el autor: `arabic-ocr-research-data` (referenciado en la model card, URL no proporcionada en la informacion disponible)
- Documentacion de resultados citada: `docs/TEST_PROTOCOL.md` y `REPORT.md` (referenciados, no enlazados en la informacion disponible)
