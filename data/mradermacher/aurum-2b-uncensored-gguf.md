# mradermacher/Aurum-2B-Uncensored-GGUF

## Resumen

Aurum-2B-Uncensored-GGUF es una coleccion de cuantizaciones en formato GGUF generada por mradermacher a partir del modelo original `2Beyes/Aurum-2B-Uncensored`. Se trata de un modelo de lenguaje etiquetado comercialmente como "2B" (dos mil millones de parametros), aunque el recuento real de parametros reportado en los tensores del repositorio es de 331.416.576, es decir, aproximadamente 0,33 mil millones. Esta discrepancia entre el nombre y el tamano real es un dato relevante a la hora de evaluar el modelo.

El repositorio no es un modelo entrenado por mradermacher, sino una conversion de pesos a formato GGUF con multiples niveles de cuantizacion (desde Q2_K hasta F16, pasando por Q3, Q4, Q5, Q6, Q8 e IQ4_XS), pensada para su uso con llama.cpp y derivados como Ollama o LM Studio. El nombre "Uncensored" sugiere que el modelo original ha sido ajustado para reducir los mecanismos de rechazo o alineacion, aunque no se aporta documentacion tecnica que lo confirme.

La relevancia de esta ficha es limitada pero concreta: sirve para identificar rapidamente que se trata de un modelo muy pequeno (sub-1000M), sin model card detallada, sin licencia declarada y sin datos de entrenamiento publicados en la informacion disponible, lo que condiciona fuertemente su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 331.416.576 (segun tensores del repo; el nombre indica "2B") |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones derivadas de safetensors del modelo original) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo original `2Beyes/Aurum-2B-Uncensored` en los datos proporcionados. No se especifica si es un transformer denso, un modelo MoE, un hibrido SSM ni detalles sobre atencion, capas o dimensiones ocultas. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

Lo unico verificable es el proceso de conversion: el repositorio contiene cuantizaciones estaticas generadas con un pipeline de conversion a GGUF (se observan metadatos como `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`), partiendo de los pesos en formato Hugging Face del modelo original. No hay innovaciones tecnicas documentadas (decodificacion especulativa, atencion lineal, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva en formato GGUF, ejecutable con llama.cpp y sus derivados.
- Soporte de multiples niveles de cuantizacion para adaptarse a distintos presupuestos de memoria.
- El nombre "Uncensored" sugiere un ajuste orientado a reducir rechazos, pero no se documenta tecnicamente.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue especifica.
- No se documenta vision, audio ni modo "thinking".
- No se documenta capacidad de codigo o matematicas de forma explicita.

## Casos de uso

- Experimentacion local en hardware de gama baja: con ~0,33 mil millones de parametros, las cuantizaciones Q4_K_M o Q2_K caben en CPU y en GPUs integradas, lo que permite probar pipelines de generacion de texto sin GPU dedicada.
- Prototipado rapido de interfaces conversacionales: util para validar la integracion de llama.cpp u Ollama en una aplicacion antes de sustituir el modelo por uno mayor.
- Pruebas de cuantizacion y benchmarking de llama.cpp: el repositorio ofrece 12 variantes de cuantizacion del mismo modelo, lo que permite medir diferencias de calidad y velocidad entre Q2_K, Q4_K_M, Q8_0 y F16 sobre un mismo checkpoint.
- Generacion de texto creativo sin filtros en entornos controlados: el etiquetado "Uncensored" lo hace candidato para experimentos de escritura libre, siempre que se asuma la falta de documentacion sobre sesgos y seguridad.
- Educacion y demostraciones: su tamano reducido lo hace adecuado para explicar como funciona la cuantizacion GGUF y el despliegue con llama.cpp en talleres o clases.
- Pruebas de regresion de infraestructura: sirve como modelo "dummy" ligero para validar endpoints de inferencia (vLLM, TGI, llama.cpp server) sin consumir recursos de GPU grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de ~0,33 mil millones de parametros, la cuantizacion Q4_K_M ocupa del orden de 200-300 MB y F16 en torno a 660 MB (estimacion a partir del recuento de parametros; no se aportan cifras oficiales).
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 6 GB en adelante, RTX 3060, RTX 4090) es mas que suficiente; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2 GB de VRAM, e incluso en GPUs integradas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput: no disponibles. Por el tamano, se espera una latencia muy baja en GPU y throughput alto en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Aurum-2B-Uncensored-GGUF | 331.416.576 (segun tensores) | no disponible | no disponible | GGUF | Hugging Face |
| Qwen2.5-0.5B-Instruct | ~0,5B | 32K (segun model card oficial) | Apache 2.0 | safetensors, GGUF | Hugging Face |
| SmolLM2-360M-Instruct | ~0,36B | 8K (segun model card oficial) | Apache 2.0 | safetensors, GGUF | Hugging Face |
| TinyLlama-1.1B-Chat | ~1,1B | 2K (segun model card oficial) | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparativa se limita a modelos de tamano similar; los datos de los alternativos provienen de sus model cards publicas y no de una evaluacion conjunta. Aurum-2B-Uncensored carece de licencia declarada y de documentacion de entrenamiento, lo que lo situa en desventaja frente a alternativas con licencia permisiva y benchmarks publicados.

## Limitaciones y advertencias

- Discrepancia entre el nombre ("2B") y el recuento real de parametros (331.416.576): conviene verificar el modelo antes de asumir capacidades de un 2B real.
- Ausencia total de model card tecnica: no hay informacion sobre datos de entrenamiento, arquitectura, contexto ni evaluaciones.
- Licencia no declarada: no se puede asumir uso comercial permitido; es un riesgo legal relevante para produccion.
- Etiqueta "Uncensored": implica ausencia o reduccion de filtros de seguridad, con riesgo de generar contenido inapropiado, ofensivo o danoso; requiere moderacion externa en cualquier despliegue publico.
- Riesgo de alucinacion elevado por el tamano reducido y la falta de datos de alineacion documentados.
- Idiomas no especificados: no se garantiza un rendimiento aceptable en castellano.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Sin benchmarks publicados: imposible comparar su calidad de forma objetiva.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Aurum-2B-Uncensored-GGUF
- Modelo original: https://huggingface.co/2Beyes/Aurum-2B-Uncensored
- llama.cpp (runtime compatible): https://github.com/ggerganov/llama.cpp
- Ollama (runtime compatible): https://ollama.com
