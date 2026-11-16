# mradermacher/BSL-470M-GGUF

## Resumen

BSL-470M-GGUF es la versión cuantizada en formato GGUF del modelo base Data-Selection/BSL-470M, un transformer decoder-only de aproximadamente 468 millones de parámetros (468.239.360 según los pesos en safetensors). La cuantización la ha realizado mradermacher, un perfil conocido en Hugging Face por publicar versiones GGUF de modelos open source para su uso con llama.cpp y herramientas compatibles. El modelo base se entrenó sobre el dataset togethercomputer/RedPajama-Data-1T, un corpus multilingüe de gran escala, aunque el modelo declara soporte únicamente para inglés.

La relevancia de esta ficha es doble: por un lado, ofrece un modelo pequeño (sub-500M) con licencia Apache 2.0, lo que permite experimentación y despliegue sin restricciones comerciales; por otro, la disponibilidad de cuantizaciones desde Q2_K hasta f16 (0,3 GB a 1,0 GB) lo hace viable en hardware muy modesto, incluyendo CPU y GPUs de gama baja. No obstante, la información pública sobre el modelo base es limitada: no se detallan la longitud de contexto, la composición exacta del dataset de entrenamiento ni los resultados de benchmarks.

Esta ficha describe las características verificables del repositorio GGUF y del modelo base, e indica explícitamente "no disponible" en todos aquellos parámetros que no figuran en la información proporcionada. Se recomienda consultar la model card del modelo base para obtener detalles adicionales sobre arquitectura y entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (según el modelo base; no se detalla en la información disponible) |
| Parámetros totales | 468.239.360 |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Tamaño del repositorio | 4,2 GB |
| Dataset de entrenamiento | togethercomputer/RedPajama-Data-1T |
| Modelo base | Data-Selection/BSL-470M |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Data-Selection/BSL-470M más allá de que se trata de un transformer decoder-only de 468 millones de parámetros, tal como se deduce de los pesos publicados en safetensors. El nombre "BSL" sugiere alguna variante de selección de datos o de entrenamiento por etapas, pero no se confirma en la documentación accesible. El dataset de entrenamiento declarado es togethercomputer/RedPajama-Data-1T, un corpus de aproximadamente un billón de tokens construido como reproducción abierta de los datos de LLaMA, aunque no se especifica cuántos tokens se utilizaron efectivamente ni la composición final del subconjunto empleado.

No se documenta en la información proporcionada si hubo fases de alineación como RLHF, DPO o SFT, ni si se aplicaron innovaciones técnicas como decodificación especulativa, atención lineal o mezcla de expertos. Las cuantizaciones publicadas por mradermacher son estáticas (no hay versiones con imatrix/weighted disponibles según la model card), lo que implica que la calidad relativa de cada quant sigue el comportamiento estándar de las cuantizaciones K-quant de llama.cpp. El proceso de cuantización se realizó con la herramienta de mradermacher sobre los pesos en formato Hugging Face convertidos a GGUF.

## Capacidades

- Generación de texto en inglés: el modelo está entrenado sobre RedPajama-Data-1T y declara soporte únicamente para inglés.
- Modelo base sin ajuste de instrucciones: no se indica que haya pasado por SFT o RLHF, por lo que su comportamiento esperado es el de continuación de texto, no de asistente conversacional.
- Razonamiento y conocimiento general: limitado por su tamaño (468M), adecuado para tareas simples y experimentación.
- Código y matemáticas: no se documentan capacidades específicas ni benchmarks que las respalden.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse mediante la infraestructura de Hugging Face, aunque no se detalla.

## Casos de uso

- Experimentación educativa con modelos pequeños: el tamaño de 468M y las cuantizaciones de 0,3-1,0 GB permiten ejecutar el modelo en portátiles y CPUs para estudiar el comportamiento de transformers decoder-only sin requerir GPU.
- Prototipado rápido de pipelines de generación de texto: al ser un modelo base, sirve para validar infraestructura (tokenización, serving con llama.cpp, evaluación) antes de escalar a modelos mayores.
- Generación de texto en entornos con recursos limitados: despliegue en dispositivos edge o contenedores pequeños donde un modelo de 7B no cabe, usando Q4_K_M (0,4 GB) como compromiso calidad/tamaño.
- Fine-tuning como punto de partida: al tener licencia Apache 2.0 y pesos en safetensors, puede servir como base para ajuste supervisado en dominios concretos en inglés.
- Investigación sobre selección de datos: el nombre del modelo base (Data-Selection) sugiere que puede emplearse para estudiar el impacto de estrategias de selección de datos en modelos pequeños.
- Pruebas de cuantización y benchmarking de llama.cpp: la disponibilidad de 12 variantes de quant permite medir perplejidad y latencia comparativas entre tipos de cuantización en hardware modesto.
- Generación de texto auxiliar en inglés: completado de frases, resúmenes simples o generación de borradores donde no se requiera alta calidad ni razonamiento complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,3 GB (Q2_K) y 1,0 GB (f16) solo para los pesos; añadir overhead de contexto y KV cache (típicamente 0,1-0,5 GB adicionales según longitud de contexto).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones pequeñas; una RTX 3060/4060 o superior ofrece margen holgado. Para f16, 2 GB de VRAM son suficientes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1050 Ti en adelante) e incluso en iGPUs con memoria compartida.
- Ejecución en CPU: viable con llama.cpp; el modelo completo en Q4_K_M ocupa 0,4 GB, por lo que cabe en RAM de cualquier sistema.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación del GGUF), LM Studio, servidores compatibles con GGUF; también puede servirse desde los endpoints de Hugging Face según la etiqueta `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la información proporcionada; en CPU se espera un throughput bajo (decenas de tokens por segundo como máximo en hardware moderno) y en GPU consumer un throughput alto, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BSL-470M-GGUF (este) | 468M | no disponible | Apache 2.0 | GGUF | Cuantizado por mradermacher; solo inglés |
| Qwen2.5-0.5B | ~494M | 32K (según versión) | Apache 2.0 | safetensors, GGUF | Modelo instruct disponible; multilingüe |
| SmolLM2-360M | ~362M | 8K (según versión) | Apache 2.0 | safetensors, GGUF | Entrenado con datos curados; inglés |
| TinyLlama-1.1B | ~1.1B | 2K-32K (según versión) | Apache 2.0 | safetensors, GGUF | Mayor tamaño; ajuste instruct disponible |

La comparativa se basa en características públicas de modelos de tamaño similar; no se dispone de benchmarks del BSL-470M para comparar rendimiento real. Los modelos alternativos citados cuentan con versiones instruct y documentación más extensa, lo que los hace más adecuados para aplicaciones de producción.

## Limitaciones y advertencias

- Modelo base sin alineación: no se ha documentado SFT, RLHF ni DPO, por lo que no debe esperarse un comportamiento de asistente; puede generar contenido incoherente o inapropiado en respuestas conversacionales.
- Solo inglés: no se declara soporte para castellano ni otros idiomas; su uso en español producirá resultados de baja calidad.
- Riesgo de alucinación: inherente a los modelos de lenguaje, especialmente en modelos pequeños entrenados sobre corpus web; no hay evaluaciones publicadas que cuantifiquen este riesgo.
- Sesgos: el dataset RedPajama-Data-1T hereda sesgos de fuentes web; no se documentan mitigaciones.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que dificulta planificar su uso en tareas de contexto largo; se recomienda asumir valores conservadores (2K-4K) hasta confirmación.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el usuario debe verificar el cumplimiento de las licencias de los datos de entrenamiento subyacentes (RedPajama) si redistribuye el modelo.
- Cuantizaciones estáticas: no hay versiones con imatrix/weighted, por lo que la calidad de las cuantizaciones bajas (Q2_K, Q3_K_S) puede degradarse más que en modelos con calibración por importancia.
- Repositorio de 4,2 GB: aunque cada quant individual es pequeño, el repositorio completo incluye todas las variantes; descargar solo el archivo necesario.
- Sin pipeline declarado: la etiqueta de pipeline no está disponible, lo que puede complicar la integración automática en algunas herramientas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/BSL-470M-GGUF
- Modelo base: https://huggingface.co/Data-Selection/BSL-470M
- Página de descargas del autor: https://hf.tst.eu/model#BSL-470M-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/togethercomputer/RedPajama-Data-1T
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
