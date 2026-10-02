# mradermacher/Ministral-3-3B-Instruct-2512-BF16-3MPER0RR-abliterated-GGUF

## Resumen

Ministral-3-3B-Instruct-2512-BF16-3MPER0RR-abliterated-GGUF es una distribucion de pesos en formato GGUF generada por mradermacher a partir del modelo 3MPER0RR/Ministral-3-3B-Instruct-2512-BF16-3MPER0RR-abliterated, que a su vez deriva del Ministral 3 3B Instruct 2512 de Mistral AI. Se trata, por tanto, de una cadena de tres eslabones: el modelo original de Mistral, una variante "abliterated" (con las direcciones de rechazo eliminadas por el autor 3MPER0RR) y, finalmente, la cuantizacion estatica publicada por mradermacher en 14 variantes de precision.

El modelo cuenta con 3.429.006.336 parametros reales, licencia Apache 2.0 y soporte declarado unicamente para ingles. Su interes practico reside en que ofrece un modelo de ~3,4 B en pesos de 1,6 GB a 7,0 GB, ejecutable en hardware de consumo, pero con el comportamiento de rechazo suprimido respecto al original de Mistral, lo que lo hace atractivo para laboratorios de alineacion, investigacion sobre seguridad y casos de uso donde los filtros del modelo base resultan excesivamente restrictivos.

El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y el propio mradermacher indica que todavia no ha publicado cuantizaciones ponderadas con imatrix para esta variante. Conviene senalar que la model card etiqueta el modelo como "text-only" y "vision-encoder-removed", pero a la vez distribuye dos ficheros mmproj (Q8_0 y f16) descritos como "multi-modal supplement", una contradiccion que el usuario debe verificar antes de asumir capacidades de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 3.429.006.336 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas de mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base del que deriva expone safetensors) |
| Tamano del repositorio | 32,5 GB |
| Fecha de publicacion en HuggingFace | 2026-10-01 (segun metadatos) |
| Modelo base | 3MPER0RR/Ministral-3-3B-Instruct-2512-BF16-3MPER0RR-abliterated |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la documentacion proporcionada. El modelo procede del Ministral 3 3B Instruct 2512 de Mistral AI, descrito en la documentacion oficial como el miembro mas pequeno de la familia Ministral 3, orientado a despliegue en el borde ("edge deployment") y con capacidades declaradas de lenguaje y vision. Sobre esa base, el autor 3MPER0RR aplico una tecnica de "abliteration", consistente en eliminar las direcciones de activacion asociadas al rechazo de peticiones, lo que da lugar a la variante que mradermacher ha cuantizado.

En cuanto al proceso de entrenamiento, no hay datos disponibles sobre numero de tokens, composicion del dataset, ni sobre el uso de RLHF, DPO u otras tecnicas de alineacion. La informacion disponible tampoco especifica si se trata de un transformer denso, una mezcla de expertos o una arquitectura hibrida, ni si incorpora innovaciones como decodificacion especulativa o atencion lineal. Esta ficha publicada por mradermacher es exclusivamente una conversion a GGUF con cuantizacion estatica (segun las etiquetas internas del README: quantize_version 2, output_tensor_quantised 1, convert_type hf), sin entrenamiento adicional por su parte.

## Capacidades

- Generacion de texto conversacional en ingles, con ajuste de instrucciones ("instruct post-trained").
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base, no verificadas con benchmarks en la informacion disponible.
- Capacidades multimodales: la model card incluye dos ficheros mmproj (Q8_0, 0,6 GB; f16, 0,9 GB) descritos como complemento multimodal, pero las etiquetas del repositorio indican "text-only" y "vision-encoder-removed". La disponibilidad real de vision es contradictoria en la informacion disponible.
- Modo "abliterated": ausencia o reduccion drastica de rechazos ante peticiones que el modelo original declinaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Multilingue: no. El campo de idioma declara unicamente "en".
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar que comportamientos emergen cuando se eliminan las direcciones de rechazo, comparando respuestas del mismo prompt entre el modelo original de Mistral y esta variante abliterated, con la ventaja de que ambos caben en una unica GPU de consumo.
- Generacion de contenido creativo sin filtros tematicos: escritura de ficcion con violencia, temas adultos o personajes moralmente ambiguos, donde los modelos alineados suelen introducir evasivas o cambios de tono no deseados.
- Despliegue local en portatiles y equipos sin GPU dedicada: la cuantizacion Q2_K (1,6 GB) o Q3_K_S (1,7 GB) permite ejecutar el modelo por CPU con llama.cpp en maquinas con 8 GB de RAM, util para demos offline y entornos air-gapped.
- Prototipado rapido de asistentes conversacionales en ingles: con Q4_K_M (2,2 GB) se obtiene un chatbot funcional en una RTX 3060 o superior, adecuado para validar flujos de producto antes de invertir en modelos mayores.
- Evaluacion de cuantizaciones: el repositorio incluye 12 niveles de cuantizacion distintos, lo que permite medir la degradacion de perplejidad y calidad entre Q2_K y f16 sobre un mismo checkpoint, algo util para equipos que necesitan fijar un presupuesto de memoria.
- Generacion de datos sinteticos para destilacion: uso del modelo como generador a bajo coste para crear pares instruccion-respuesta en ingles, aprovechando que puede levantarse en paralelo varias instancias en una sola GPU de 24 GB.
- Red teaming y pruebas de robustez: al carecer de rechazos, sirve como sujeto de prueba para evaluar clasificadores de seguridad, guardrails de terceros y sistemas de moderacion de contenido.
- Fine-tuning adicional: la licencia Apache 2.0 y el formato GGUF (convertible de vuelta a safetensors) permiten usarlo como punto de partida o como referencia para LoRAs sobre la familia Ministral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra, y los resultados de busqueda web consultados solo aportan descripciones cualitativas del modelo original de Mistral AI, sin cifras.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir del tamano de cada fichero mas el overhead de la cache KV (que depende del contexto configurado y no puede calcularse sin conocer la longitud de contexto, dato no disponible):
  - Q2_K: aproximadamente 2,1-2,6 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: aproximadamente 2,2-3,0 GB.
  - IQ4_XS, Q4_K_S, Q4_K_M: aproximadamente 2,7-3,2 GB.
  - Q5_K_S / Q5_K_M: aproximadamente 3,0-3,6 GB.
  - Q6_K: aproximadamente 3,4-4,0 GB.
  - Q8_0: aproximadamente 4,3-5,0 GB.
  - f16: aproximadamente 7,5-8,5 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para cuantizaciones Q4 y Q5 (GTX 1650, RTX 3050, RTX 4060, RTX 3060); 6-8 GB para Q6_K y Q8_0 (RTX 2060, RTX 3060 Ti, RTX 4060 Ti); 8-10 GB para f16. No requiere A100 ni H100: el modelo es de 3,4 B y esta disenado para hardware modesto.
- Cabe en GPU de consumo: si, en practicamente todas las tarjetas con 6 GB o mas, y en tarjetas de 4 GB con cuantizaciones bajas y contexto reducido.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python, text-generation-webui, koboldcpp). El soporte de vLLM y TGI para GGUF es parcial o inexistente, por lo que para estos servidores conviene partir del modelo base en safetensors. La libreria declarada en el repositorio es transformers, aunque los pesos son GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral-3-3B-Instruct-2512 (Mistral AI, original) | ~3,4 B | no disponible | Vision declarada en la documentacion oficial | no disponible | ModelScope y canales oficiales de Mistral |
| Ministral-3-3B-Instruct-2512-BF16-GGUF (mradermacher) | ~3,4 B | no disponible | No (sin capa abliterated) | Apache 2.0 | HuggingFace |
| Ministral-3-3B-Instruct-2512-BF16-i1-GGUF (mradermacher) | ~3,4 B | no disponible | No | Apache 2.0 | HuggingFace, cuantizaciones con imatrix |
| Este modelo (3MPER0RR-abliterated-GGUF) | 3.429.006.336 | no disponible | Contradictorio (etiquetas text-only frente a ficheros mmproj) | Apache 2.0 | HuggingFace, cuantizacion estatica unicamente |

La diferencia funcional frente a las otras dos distribuciones GGUF de mradermacher no esta en el rendimiento bruto, sino en el comportamiento: esta variante incorpora el ajuste abliterated del autor 3MPER0RR y, segun el README, carece de cuantizaciones ponderadas con imatrix, que si existen en el repositorio i1-GGUF. No hay datos de benchmarks que permitan comparar calidad entre las tres.

## Limitaciones y advertencias

- Modelo abliterated: la supresion de las direcciones de rechazo elimina barreras de seguridad del modelo original. Puede generar contenido danino, ilegal o gravemente ofensivo sin advertir al usuario. No es apto para aplicaciones orientadas al publico sin guardrails externos.
- Degradacion por abliteration: la tecnica puede afectar a la coherencia y a la calidad general del modelo en tareas que no tienen relacion con el rechazo. No hay evaluaciones publicadas que cuantifiquen esta perdida.
- Solo ingles: el campo de idioma declara unicamente "en". El rendimiento en castellano no esta evaluado y previsiblemente sera deficiente.
- Riesgo de alucinacion: inherente a modelos de 3,4 B. Sin datos de benchmarks no es posible acotar su fiabilidad en tareas de conocimiento factual.
- Contradiccion en la documentacion: las etiquetas indican "text-only" y "vision-encoder-removed", pero se distribuyen ficheros mmproj. Verificar empiricamente antes de depender de capacidades de vision.
- Contexto desconocido: no se especifica la longitud de contexto soportada, dato critico para planificar memoria y para casos de uso con documentos largos.
- Sin cuantizaciones ponderadas: el propio autor advierte de que las cuantizaciones con imatrix no estan disponibles y que podria no planear generarlas; las Q2 y Q3 son estaticas y de menor calidad.
- Repositorio sin traccion: 0 descargas y 0 likes. No hay evidencia de uso en produccion ni de validacion por terceros.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero la licencia del modelo original de Mistral AI subyacente deberia verificarse de forma independiente, ya que la informacion disponible no la detalla.
- Cadena de derivacion larga: modelo de Mistral AI, modificado por un tercero y cuantizado por otro. Cada eslabon anade riesgo de regresion no documentada.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mradermacher/Ministral-3-3B-Instruct-2512-BF16-3MPER0RR-abliterated-GGUF
- Modelo base (variante abliterated): https://huggingface.co/3MPER0RR/Ministral-3-3B-Instruct-2512-BF16-3MPER0RR-abliterated
- Pagina de resumen y descargas de mradermacher: https://hf.tst.eu/model#Ministral-3-3B-Instruct-2512-BF16-3MPER0RR-abliterated-GGUF
- Cuantizaciones sin abliterar: https://huggingface.co/mradermacher/Ministral-3-3B-Instruct-2512-BF16-GGUF
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Ministral-3-3B-Instruct-2512-BF16-i1-GGUF
- Documentacion oficial de Mistral AI para Ministral 3 3B: https://docs.mistral.ai/models/ministral-3-3b-25-12
- Modelo original en ModelScope (FP8): https://www.modelscope.cn/models/mistralai/Ministral-3-3B-Instruct-2512
- Modelo original en ModelScope (BF16): https://www.modelscope.cn/models/mistralai/Ministral-3-3B-Instruct-2512-BF16
- Guia de uso de ficheros GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
