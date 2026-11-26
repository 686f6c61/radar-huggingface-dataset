# mradermacher/Qwen3-0.6B-3MPER0RR-abliterated-Cyber-V1-i1-GGUF

## Resumen

Qwen3-0.6B-3MPER0RR-abliterated-Cyber-V1-i1-GGUF es una cuantizacion en formato GGUF del modelo 3MPER0RR/Qwen3-0.6B-3MPER0RR-abliterated-Cyber-V1, publicada por el usuario mradermacher. Se trata de un derivado del modelo Qwen3 de 0,6 mil millones de parametros de Alibaba, sometido a un proceso de "abliteration" (eliminacion o atenuacion de los mecanismos de rechazo) y ajustado sobre el dataset WNT3D/Ultimate-Offensive-Red-Team, orientado a tareas de red team y seguridad ofensiva. El modelo base declarado cuenta con 596.049.920 parametros.

La relevancia de esta publicacion es acotada y muy especifica: no es un modelo de proposito general, sino una variante sin censura de un modelo pequeno, empaquetada en cuantizaciones de 1 a 6 bits con ficheros imatrix para facilitar su ejecucion en hardware modesto. El repositorio ocupa 8,0 GB e incluye una amplia bateria de cuantizaciones (desde i1-IQ1_S de 0,3 GB hasta i1-Q6_K), lo que permite desplegarlo en CPU o en GPUs de consumo con muy poca VRAM.

La ficha se limita a los datos disponibles en la informacion proporcionada. No se han publicado resultados de benchmarks, no hay detalle sobre la composicion exacta del dataset de ajuste mas alla de su nombre, y la model card del cuantizador es fundamentalmente una guia de descarga de ficheros GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B; no se detalla en la informacion disponible) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ3_XXS, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q3_K_L, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, i1-IQ3_S, i1-IQ2_S, i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ3_XXS, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q3_K_L, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (catalogo completo de cuantizaciones i1 con imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix; fichero imatrix.gguf incluido para generar cuantizaciones propias) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B, un transformer decoder-only de 596 millones de parametros. La informacion proporcionada no detalla el numero de capas, dimensiones ocultas, mecanismo de atencion ni longitud de contexto nativa. El modelo base 3MPER0RR/Qwen3-0.6B-3MPER0RR-abliterated-Cyber-V1 se ha obtenido mediante un proceso de abliteration sobre Qwen3-0.6B, seguido de un ajuste fino supervisado sobre el dataset WNT3D/Ultimate-Offensive-Red-Team, cuyo contenido concreto no se describe en la informacion disponible.

Esta publicacion concreta no es un entrenamiento nuevo, sino una cuantizacion. mradermacher ha generado las cuantizaciones i1 (con fichero imatrix, es decir, con una matriz de importancia calculada a partir de datos de calibracion) a partir de los pesos HF del modelo base. El proceso de cuantizacion i1 de llama.cpp emplea esa matriz de importancia para minimizar la perdida de calidad en las cuantizaciones de baja precision. No se dispone de informacion sobre el dataset de calibracion usado para la imatrix, ni sobre el numero de tokens de entrenamiento del modelo original, ni sobre si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen3-0.6B.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 0,6B parametros.
- Generacion de codigo y respuestas tecnicas de complejidad baja a media.
- Orientacion declarada a tareas de seguridad ofensiva y red team, segun el dataset de ajuste (WNT3D/Ultimate-Offensive-Red-Team).
- Comportamiento "abliterated": se ha atenuado el rechazo a peticiones que el modelo original denegaria; no se especifica el alcance ni la eficacia del proceso.
- Soporte de tool calling / function calling: no disponible (no se documenta en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Ejecucion local en hardware de gama baja: con cuantizaciones i1-Q4_K_M de aproximadamente 0,5 GB, el modelo cabe en cualquier portatil moderno y puede ejecutarse en CPU con llama.cpp u Ollama, lo que lo hace util para pruebas offline sin GPU.
- Laboratorios de seguridad ofensiva y formacion en red team: el ajuste sobre Ultimate-Offensive-Red-Team y la abliteration lo orientan a generar contenido tecnico de seguridad que modelos alineados rechazarian; su uso debe limitarse a entornos controlados y autorizados.
- Prototipado rapido de asistentes conversacionales en ingles: por su tamano reducido, sirve para validar pipelines de inferencia, plantillas de prompt y flujos de integracion antes de pasar a modelos mayores.
- Evaluacion de cuantizaciones: el repositorio incluye la practica totalidad del catalogo i1 de llama.cpp, lo que permite comparar calidad y velocidad entre niveles de cuantizacion sobre un mismo modelo, util para investigacion de metodos de compresion.
- Generacion de texto de bajo coste en entornos embebidos o contenedores con limites estrictos de memoria: las variantes IQ1 e IQ2 ocupan 0,3 GB, aptas para dispositivos con menos de 1 GB de RAM disponible.
- Filtrado y clasificacion de texto simple: tareas de etiquetado, resumen corto o extraccion de entidades en ingles donde no se requiere alta precision y prima la latencia minima.
- Base para experimentos de fine-tuning ligero: al ser un modelo de 0,6B con licencia Apache 2.0, puede ajustarse en una sola GPU de consumo para tareas especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,3 GB (i1-IQ1_S) y aproximadamente 0,7 GB (i1-Q6_K) para los pesos; anadir el espacio de contexto KV cache, que depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el modelo es viable en GTX 1650, RTX 3050, RTX 4060, e incluso en GPUs integradas. En A100/H100 el modelo estaria infrautilizado y la latencia vendria dominada por el overhead, no por el computo.
- Cabe en GPU de consumo: si, en practicamente todas las GPUs de consumo de los ultimos diez anos, y tambien en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; el formato GGUF es compatible con el ecosistema llama.cpp. La model card no menciona vLLM ni TGI para esta variante (vLLM requiere pesos en safetensors, disponibles en el modelo base).
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3-0.6B-3MPER0RR-abliterated-Cyber-V1-i1-GGUF (este) | 596 M | no disponible | en | apache-2.0 | GGUF (i1, imatrix) | Variante abliterated orientada a red team, cuantizada |
| Qwen3-0.6B (original) | 596 M | no disponible en esta ficha | multilingue (segun Qwen) | apache-2.0 | safetensors, GGUF | Modelo base alineado; rechaza contenido ofensivo |
| 3MPER0RR/Qwen3-0.6B-3MPER0RR-abliterated-Cyber-V1 | 596 M | no disponible | en | apache-2.0 | safetensors | Modelo base de esta cuantizacion, sin cuantizar |
| mradermacher/Qwen3-0.6B-3MPER0RR-abliterated-Cyber-V1-GGUF | 596 M | no disponible | en | apache-2.0 | GGUF (estatico) | Mismo modelo en cuantizaciones estaticas sin imatrix |

La comparativa se limita a los derivados directos del mismo modelo base, ya que no se dispone de datos de rendimiento para comparar con alternativas de otros autores.

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado o atenuado el rechazo a contenido danino; puede generar material ofensivo, ilegal o peligroso. El uso en produccion orientada al publico es desaconsejado sin filtros externos.
- Dataset de ajuste orientado a seguridad ofensiva: el modelo puede producir contenido de red team que, mal empleado, constituye un riesgo legal y etico. Requiere uso autorizado y en entornos controlados.
- Riesgo elevado de alucinacion: con 0,6B parametros, la fiabilidad factica es baja; no debe usarse para tareas que requieran precision sin verificacion humana.
- Solo ingles declarado: no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto no documentada: no se puede planificar su uso en conversaciones largas sin verificacion empirica.
- Cuantizaciones de muy baja precision (IQ1, IQ2): la model card advierte explicitamente de calidad degradada ("for the desperate", "very low quality"); solo aptas para pruebas, no para uso real.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo aplicable.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia cuantitativa de calidad ni de la eficacia del proceso de abliteration.
- Repositorio con 0 descargas y 0 likes: no hay senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3-0.6B-3MPER0RR-abliterated-Cyber-V1-i1-GGUF
- Modelo base: https://huggingface.co/3MPER0RR/Qwen3-0.6B-3MPER0RR-abliterated-Cyber-V1
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3-0.6B-3MPER0RR-abliterated-Cyber-V1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3-0.6B-3MPER0RR-abliterated-Cyber-V1-i1-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/WNT3D/Ultimate-Offensive-Red-Team
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
