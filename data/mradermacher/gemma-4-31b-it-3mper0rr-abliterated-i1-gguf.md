# mradermacher/gemma-4-31b-it-3MPER0RR-abliterated-i1-GGUF

## Resumen

`mradermacher/gemma-4-31b-it-3MPER0RR-abliterated-i1-GGUF` es una cuantizacion GGUF del modelo `3MPER0RR/gemma-4-31b-it-3MPER0RR-abliterated`, una variante "abliterated" (es decir, con las capas de rechazo parcialmente eliminadas mediante edicion de pesos) de Gemma 4 31B en su version instruct. El trabajo de cuantizacion lo firma mradermacher, autor habitual de repositorios GGUF, y emplea cuantizacion con matriz de importancia (imatrix) en la variante `i1`, que suele ofrecer mejor relacion calidad/tamano que los quants estaticos equivalentes.

El modelo base cuenta con 30.697.345.596 parametros reales segun los safetensors del repositorio, lo que lo situa en la categoria de ~31B. El repositorio incluye un amplio abanico de cuantizaciones, desde IQ1_S (7,3 GB) hasta Q5_K_M (21,9 GB), lo que permite desplegarlo en un rango amplio de hardware. La model card indica que es un modelo de vision y que los ficheros `mmproj` (proyector multimodal) se alojan en el repositorio estatico asociado, no en este.

La relevancia practica esta en dos frentes: por un lado, permite ejecutar un modelo de ~31B con capacidades multimodales en hardware de consumo o en servidores modestos gracias a los quants bajos; por otro, la variante abliterated elimina parte de las restricciones de rechazo del modelo original, lo que interesa a quienes investigan alineacion, seguridad o simplemente necesitan un modelo menos restrictivo en dominios creativos. Conviene subrayar que la licencia declarada es Apache 2.0, aunque el modelo base derive de Gemma, cuya licencia original impone condiciones adicionales que deben verificarse antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4, variante instruct); detalles internos no disponibles |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M (variantes i1 con imatrix) |
| Idiomas soportados | Ingles (declarado en la model card); resto no disponible |
| Licencia | Apache 2.0 (declarada en el repositorio) |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |
| Tamano del repositorio | 334,8 GB (incluye todas las cuantizaciones) |
| Cuantizacion con imatrix | Si (variante i1) |
| Modelo de vision | Si (mmproj en repositorio estatico separado) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 4 en version instruct, con aproximadamente 30,7 mil millones de parametros. La informacion disponible no detalla el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa; estos datos no estan publicados en la model card del repositorio de cuantizacion.

El proceso de "abliteration" del modelo base consiste en la modificacion de los pesos para reducir la direccion de rechazo aprendida durante el ajuste por instrucciones, de modo que el modelo responda con menos negativas ante ciertas peticiones. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original. La cuantizacion i1 de mradermacher emplea una matriz de importancia (imatrix) generada a partir de datos de calibracion, lo que mejora la fidelidad de los quants de baja precision respecto a los estaticos.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno segun la etiqueta `conversational`.
- Capacidades de vision: la model card indica explicitamente que es un modelo de vision y remite a los ficheros `mmproj` del repositorio estatico.
- Razonamiento y respuesta a instrucciones, heredados de la version instruct de Gemma 4.
- Ejecucion local mediante llama.cpp y derivados (Ollama, LM Studio, etc.) gracias al formato GGUF.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita su integracion en servidores de inferencia.
- Capacidades de tool calling, agentes o modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo: con el quant i1-Q4_K_M (18,8 GB) el modelo cabe en una GPU de 24 GB o en configuraciones CPU+GPU, permitiendo asistentes conversacionales privados sin depender de APIs externas.
- Investigacion sobre alineacion y seguridad: la variante abliterated permite estudiar como cambia el comportamiento del modelo al eliminar la direccion de rechazo, comparando respuestas frente al Gemma 4 original en conjuntos de prompts controlados.
- Procesamiento multimodal en local: al incluir soporte de vision via `mmproj`, puede emplearse para descripcion de imagenes, extraccion de texto de capturas o analisis de documentos escaneados en entornos sin conexion.
- Generacion creativa sin filtros excesivos: util en escritura de ficcion, guiones o narrativa donde los rechazos del modelo instruct estandar resultan un obstaculo, siempre con revision humana del contenido.
- Prototipado rapido de chatbots: los quants IQ2/IQ3 (8,8-14,5 GB) permiten levantar un prototipo funcional en GPUs de consumo de 12-16 GB antes de escalar a un quant mayor.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 22 variantes, lo que lo convierte en un banco de pruebas ideal para medir la degradacion de calidad segun el nivel de cuantizacion en tareas de razonamiento y generacion.
- Fine-tuning o destilacion experimental: el modelo base en safetensors puede servir como punto de partida para experimentos de ajuste, aunque el repositorio GGUF en si no es el formato adecuado para entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de fichero, mas overhead de contexto y cache KV):
  - i1-IQ1_S: ~7,3 GB.
  - i1-IQ2_M: ~11,0 GB.
  - i1-IQ3_M: ~14,5 GB.
  - i1-Q4_K_M: ~18,8 GB.
  - i1-Q5_K_M: ~21,9 GB.
- GPU recomendadas:
  - RTX 4090 (24 GB): quants hasta Q4_K_M con contexto moderado; Q5_K_M ajustado.
  - RTX 3090 (24 GB): mismo perfil que la 4090, con menor throughput.
  - RTX 4060 Ti 16 GB / RTX 4080 (16 GB): quants IQ3_M o IQ4_XS.
  - A100 40/80 GB y H100: quants altos con contexto largo y varias peticiones concurrentes.
- Cabe en GPU de consumo: si, desde GPUs de 12 GB con quants IQ2, y de forma comoda en 16-24 GB con quants IQ3-Q4.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI mediante llama.cpp server. vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponibles; dependen del hardware y del quant, aunque a titulo orientativo un Q4_K_M en una RTX 4090 suele moverse en decenas de tokens por segundo, dato no confirmado en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-31b-it-3MPER0RR-abliterated-i1-GGUF (este) | ~30,7B | No disponible | Apache 2.0 (declarada) | GGUF | Variante abliterated con vision y 22 quants |
| 3MPER0RR/gemma-4-31b-it-3MPER0RR-abliterated | ~30,7B | No disponible | Apache 2.0 (declarada) | Safetensors | Modelo base sin cuantizar del que deriva este |
| mradermacher/gemma-4-31b-it-3MPER0RR-abliterated-GGUF | ~30,7B | No disponible | Apache 2.0 (declarada) | GGUF | Quants estaticos del mismo modelo base |
| Gemma 4 31B IT original | ~31B | No disponible | Licencia Gemma | Safetensors | Version no abliterated, con rechazos intactos |

## Limitaciones y advertencias

- La abliteration reduce los rechazos del modelo, lo que incrementa el riesgo de generar contenido danino, sesgado o inapropiado; no es recomendable desplegarlo en produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a los modelos de ~31B, agravado en los quants mas bajos (IQ1, IQ2), donde la model card del autor advierte de calidad muy baja.
- El unico idioma declarado es el ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- La licencia Apache 2.0 declarada en el repositorio puede entrar en conflicto con la licencia original de Gemma; es imprescindible verificar los terminos del modelo base antes de un uso comercial.
- La ausencia de datos sobre contexto maximo impide garantizar conversaciones de contexto largo; conviene validar el limite real con la configuracion de llama.cpp.
- No hay informacion sobre sesgos especificos ni evaluaciones de seguridad publicadas para esta variante.
- El repositorio ocupa 334,8 GB; descargar solo el quant necesario, no el repositorio completo.
- Los ficheros `mmproj` para vision estan en el repositorio estatico separado; sin ellos el modelo funciona solo como texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-31b-it-3MPER0RR-abliterated-i1-GGUF
- Modelo base: https://huggingface.co/3MPER0RR/gemma-4-31b-it-3MPER0RR-abliterated
- Quants estaticos: https://huggingface.co/mradermacher/gemma-4-31b-it-3MPER0RR-abliterated-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-31b-it-3MPER0RR-abliterated-i1-GGUF
- README de referencia para GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
