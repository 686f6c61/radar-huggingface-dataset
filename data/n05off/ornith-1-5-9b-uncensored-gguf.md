# N05off/Ornith-1.5-9B-uncensored-GGUF

## Resumen

Ornith-1.5-9B-uncensored-GGUF es una distribucion en formato GGUF del modelo junafinity/Ornith-1.5-9B-uncensored, un modelo de lenguaje de aproximadamente 8.953.803.264 parametros (unos 8,95 B) construido sobre la familia identificada en los metadatos como qwen3_5 y sometido a un proceso de "abliteration" (eliminacion de alineamiento de seguridad) que se comercializa explicitamente como "uncensored". El repositorio lo publica el usuario N05off, aunque la model card indica que las cuantizaciones fueron generadas por mradermacher con su herramienta de cuantizacion estatica (quantize_version 2).

El modelo es multimodal: el repositorio incluye ficheros mmproj (proyecciones visuales) en f16 y Q8_0, lo que indica soporte de entrada de imagenes ademas de texto. Solo declara ingles como idioma soportado y se distribuye bajo licencia apache-2.0. La relevancia practica de esta ficha es acotada: se trata de una cuantizacion derivada, no de un modelo con resultados publicados, y el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validacion independiente de su calidad.

La utilidad principal de esta publicacion es la de permitir ejecutar localmente un modelo de ~9 B con vision en hardware de consumo, gracias al rango de cuantizaciones que va desde Q2_K (3,9 GB) hasta f16 (18,0 GB). No se dispone de informacion sobre la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag qwen3_5 apunta a la familia Qwen3.5 del modelo base) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj-f16 y mmproj-Q8_0 para la parte multimodal |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizacion estatica, quantize_version 2, output_tensor_quantised 1) |
| Modelo base | junafinity/Ornith-1.5-9B-uncensored |
| Cuantizado por | mradermacher (segun la model card) |
| Tamano del repositorio | 83,0 GB |
| Fecha de creacion en HuggingFace | 2026-09-12 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

No hay informacion publicada en el material disponible sobre la arquitectura interna del modelo. Los tags del repositorio incluyen qwen3_5, lo que sugiere que el modelo base deriva de la familia Qwen3.5, pero no se confirma en ningun documento la configuracion de capas, el tipo de atencion ni si emplea mecanismos adicionales (MoE, atencion lineal, decodificacion especulativa). Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de ajuste por RLHF o DPO.

El unico proceso tecnico explicitamente documentado es el de abliteration y cuantizacion. La abliteration consiste en identificar y neutralizar las direcciones del espacio de activaciones responsables de las negativas de seguridad, de modo que el modelo responde a peticiones que un modelo alineado rechazaria. La parte de cuantizacion se ha realizado con el pipeline estatico de mradermacher: cuantizaciones no ponderadas (sin imatrix) en este repositorio, con una variante ponderada publicada por separado en el repositorio i1-GGUF. La parte multimodal se distribuye en ficheros mmproj independientes del fichero principal de pesos.

## Capacidades

- Generacion de texto conversacional en ingles.
- Entrada multimodal de imagenes mediante los ficheros mmproj (f16 o Q8_0), con salida en texto.
- Comportamiento "uncensored": menor tasa de rechazos ante peticiones que los modelos alineados rechazarian por politica de seguridad.
- Razonamiento y generacion de codigo: presumiblemente heredados del modelo base, aunque no hay documentacion ni evaluaciones que lo confirmen.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Modo "thinking" explicito: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Procesamiento local de documentos con imagenes: usando el fichero mmproj junto con una cuantizacion Q4_K_M, el modelo puede describir capturas, diagramas o fotografias y generar texto asociado en una maquina con una unica GPU de 8-12 GB de VRAM.
- Experimentacion en investigacion sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la abliteration comparando respuestas con su modelo base alineado (junafinity/Ornith-1.5-9B-uncensored) ante el mismo conjunto de prompts.
- Generacion de texto creativo sin filtros editoriales: util en entornos controlados donde se necesita prosa o guiones sin las restricciones tipicas de los modelos alineados; debe acompanarse de revision humana.
- Prototipado rapido con Ollama o llama.cpp: las cuantizaciones Q3_K_S (4,4 GB) y Q4_K_S (5,5 GB) permiten levantar un servidor de inferencia en un portatil con GPU modesta para pruebas de concepto.
- Clasificacion y etiquetado de imagenes en lotes: el modelo puede procesar una cola de imagenes y devolver etiquetas o descripciones textuales, integrable en un script con la API de llama.cpp.
- Despliegue en un endpoint compatible con OpenAI: el tag endpoints_compatible indica que el repositorio esta preparado para servirse mediante endpoints compatibles, lo que facilita sustituirlo en una aplicacion existente sin reescribir el cliente.
- Destilacion o generacion de datos sinteticos: al ser un modelo de 9 B ejecutable en local, puede usarse para generar datasets de texto o pares imagen-texto a bajo coste, siempre que la licencia apache-2.0 y la del modelo base lo permitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de evaluacion multimodal, y las busquedas web realizadas no devolvieron ningun resultado relacionado con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin contar cache KV): Q2_K ~3,9 GB; Q3_K_S ~4,4 GB; Q3_K_M ~4,7 GB; Q3_K_L ~5,0 GB; IQ4_XS ~5,3 GB; Q4_K_S ~5,5 GB; Q4_K_M ~5,7 GB; Q5_K_S ~6,4 GB; Q5_K_M ~6,6 GB; Q6_K ~7,5 GB; Q8_0 ~9,6 GB; f16 ~18,0 GB. Sumar 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16) si se usa la parte multimodal.
- Anadir entre 1 y 3 GB adicionales de VRAM para la cache KV y buffers de contexto, en funcion de la longitud de contexto configurada; al no conocerse la ventana nativa, este calculo no puede cerrarse.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 para cuantizaciones de Q4 a Q8; A100 40/80 GB, H100 o L40S para f16 y para servicio concurrente.
- Cabe en GPU de consumo: si, en cualquier GPU con 8 GB o mas usando Q2_K a Q4_K_M; una RTX 3060 de 12 GB o una RTX 4070 pueden ejecutar Q8_0 con contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI sobre GGUF. Para los pesos originales en transformers (modelo base) serian necesarios vLLM o TGI, pero este repositorio solo contiene GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No hay datos de rendimiento de este modelo, por lo que la comparacion se limita a parametros, contexto declarado y licencia de alternativas de tamano similar. Los datos de los modelos comparados proceden de sus fichas publicas y deben verificarse en la fuente original.

| Modelo | Parametros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-uncensored-GGUF | ~8,95 B | no disponible | apache-2.0 | si (mmproj) | 0 descargas, 0 likes, sin benchmarks |
| Qwen3-8B | ~8,2 B | 32.768 nativo, ampliable a 131.072 con YaRN | apache-2.0 | no | Familia de referencia del tag qwen3_5 |
| Llama-3.1-8B-Instruct | ~8,03 B | 131.072 | Llama 3.1 Community License | no | Requiere cumplir la politica de uso aceptable |
| Gemma-2-9B-it | ~9,2 B | 8.192 | Gemma Terms of Use | no | Contexto mas corto, licencia con restricciones de uso |

## Limitaciones y advertencias

- Modelo abliterated y "uncensored": la alineacion de seguridad ha sido manipulada, por lo que puede generar contenido danino, ilegal o gravemente ofensivo. No es apto para aplicaciones de cara al publico sin una capa de moderacion externa.
- Riesgo elevado de alucinacion: no hay evaluaciones publicadas y el proceso de abliteration suele degradar la coherencia y fidelidad factual del modelo base.
- Solo ingles declarado: no hay soporte documentado de castellano ni de otros idiomas.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni calcular con precision la VRAM de la cache KV.
- Composicion del dataset de entrenamiento desconocida: no se puede auditar el origen de los datos, con el consiguiente riesgo de sesgos no documentados ni de contaminacion de benchmarks.
- Licencia: el repositorio declara apache-2.0, pero es imprescindible verificar la licencia del modelo base (junafinity/Ornith-1.5-9B-uncensored), que es el que fija las condiciones reales de uso comercial. Una cuantizacion no puede relajar los terminos del modelo original.
- Atribucion ambigua: el repositorio lo firma N05off, mientras que la model card indica quantized_by: mradermacher. Conviene confirmar cual es la fuente autorizada antes de redistribuir.
- Sin traccion comunitaria: 0 descargas y 0 likes implican que no hay informes independientes de calidad, errores ni compatibilidad con herramientas.
- Metadatos anomalos: la fecha de creacion registrada (2026-09-12) es posterior a la fecha habitual de publicacion de la familia Qwen3.5, lo que sugiere un error en los metadatos del repositorio.
- Las busquedas web no devolvieron ningun resultado relacionado: los enlaces encontrados tratan sobre perdidas de retorno en lineas de transmision de radiofrecuencia y no aportan informacion sobre el modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/N05off/Ornith-1.5-9B-uncensored-GGUF
- Modelo base: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored
- Cuantizaciones del autor referenciado en la model card: https://huggingface.co/mradermacher/Ornith-1.5-9B-uncensored-GGUF
- Cuantizaciones ponderadas (imatrix): https://huggingface.co/mradermacher/Ornith-1.5-9B-uncensored-i1-GGUF
- Pagina de resumen y descargas de cuantizaciones: https://hf.tst.eu/model#Ornith-1.5-9B-uncensored-GGUF
- Peticiones de cuantizacion y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia externa): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de tipos de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Paper o articulo tecnico del modelo: no disponible
- Demo o espacio interactivo: no disponible
