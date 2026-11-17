# akal-lm/Akal-Nano-270M-GGUF

## Resumen

Akal-Nano-270M es una adaptación cuantizada en formato GGUF del modelo `google/gemma-3-270m-it` de Google DeepMind, publicada por el desarrollador Muhammad Luqni Baehaqi bajo la organización Akal LM Initiative. Con 268.098.176 parámetros totales (aproximadamente 270 millones), el modelo se distribuye como un micro-LM de entre 230 y 278 MB, calibrado con una matriz de importancia (importance matrix) específica para indonesio (`imatrix_270m_id.dat`). No es un modelo de propósito general, sino una herramienta de dos roles muy concretos: motor de borrador (draft engine) para decodificación especulativa y micro-clasificador de intenciones en entornos de borde sin GPU.

El modelo está diseñado para ejecutarse en CPUs de cuatro núcleos (el autor reporta pruebas en un Intel Core i5-8250U) y comparte el vocabulario de 256.000 tokens con `akal-lm/Akal-1B-GGUF`, lo que permite emparejarlo como draft con el modelo objetivo `Akal-1B-Steered` mediante `llama-speculative`. En esa configuración, el autor reporta una tasa media de aceptación de borradores del 87,69% y una aceleración de la decodificación de extremo a extremo del 22,4% (hasta el 38,9% en extracción RAG de procedimientos). Como clasificador independiente, ofrece un TTFT de 68-91 ms con un pico de RAM de 328,6 MB.

Su relevancia actual es acotada pero clara: demuestra que un modelo de 270M parámetros, correctamente cuantizado y con una matriz de importancia ajustada al dominio, puede actuar como acelerador de inferencia en CPU o como router de intenciones en gateways IoT y contenedores con menos de 512 MB de memoria. No compite con modelos conversacionales: el propio autor lo declara explícitamente fuera de ese alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 3, según el modelo base `google/gemma-3-270m-it`; detalles internos no disponibles) |
| Parametros totales | 268.098.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0 (230 MB), Q4_K_M con imatrix (241 MB), Q8_0; rango de huella 230-278 MB |
| Idiomas soportados | Indonesio (id), inglés (en) |
| Licencia | Gemma (términos de licencia de Google) |
| Formato de pesos | GGUF (librería `gguf`, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF del checkpoint instructivo `google/gemma-3-270m-it`, por lo que hereda la arquitectura transformer de la familia Gemma 3 en su variante de 270M parámetros. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base pasó por RLHF o DPO; la model card no detalla el proceso de entrenamiento original de Google. La aportación del autor no es un reentrenamiento, sino una calibración de cuantización: se aplica una importance matrix (`imatrix_270m_id.dat`) orientada al indonesio para mejorar la perplejidad de las variantes de 4 bits.

La innovación técnica destacable es la doble estrategia de cuantización según el rol. La variante Q4_0 usa bloques uniformes de 32 pesos sin el sobrecoste de desempaquetado de bits de los super-bloques, lo que según el autor la hace un 69,5% más rápida en generación bruta (96,65 frente a 57,01 tok/s en `tg128` con AVX2) y la convierte en la opción para decodificación especulativa, donde la latencia del borrador es crítica. La variante Q4_K_M con imatrix preserva mejor la perplejidad en uso independiente (28,47 frente a 36,78 en Q4_0) y la precisión en tareas de borde (66,67% frente a 33,33%), por lo que es la recomendada para micro-clasificación. El emparejamiento con `Akal-1B-Steered` no altera la distribución de salida del modelo objetivo, según el autor.

## Capacidades

- Generación de texto conversacional básica en indonesio e inglés, heredada del checkpoint instructivo de Gemma 3.
- Decodificación especulativa como draft engine: comparte vocabulario de 256.000 tokens con `Akal-1B-GGUF`, lo que permite emparejarlo sin remapeo de tokens.
- Clasificación de intenciones y enrutamiento de consultas (por ejemplo, derivar a RAG local, búsqueda web o calculadora) con TTFT de 68-91 ms.
- Extracción de entidades y palabras clave simples (fechas, cantidades, nombres de ítems) en fragmentos cortos de texto.
- Normalización de formato y extracción JSON estructurada en el contexto de la dupla especulativa (tasa de aceptación reportada del 94,59% en extracción JSON).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Aceleración de RAG estructurado en CPU: emparejado con `Akal-1B-Steered Q4_K_M` mediante `llama-speculative`, el modelo genera borradores que el objetivo verifica, logrando 30,67 tok/s en extracción de procedimientos RAG (un 38,9% más que la línea base autoregresiva de 22,08 tok/s) con 1.308,4 MB de RSS pico.
- Enrutamiento de intenciones en gateways IoT: con la variante Q4_K_M, clasifica comandos de usuario en 68-91 ms de TTFT dentro de 328,6 MB de RAM pico, adecuado para dispositivos con menos de 512 MB de memoria disponible.
- Normalización de JSON en pipelines de datos: la dupla especulativa alcanza 32,06 tok/s en decodificación JSON con una tasa de aceptación del 94,59%, útil para transformar registros semiestructurados en lotes sobre hardware sin GPU.
- Extracción de campos en formularios y tickets: fechas, importes y nombres de producto a partir de fragmentos cortos, donde el límite estricto de 330 MB de RAM impide desplegar modelos mayores.
- Preprocesamiento en contenedores de borde: como primer filtro que decide si una consulta requiere un modelo mayor o puede resolverse con reglas locales, reduciendo el coste de invocación de modelos de mayor tamaño.
- Aceleración de asistentes de documentación técnica en indonesio: la matriz de importancia calibrada para indonesio mejora la calidad del borrador en ese idioma, lo que resulta útil en soporte interno de empresas indonesias con infraestructura sin GPU.

## Benchmarks y rendimiento

Datos reportados por el autor en un Intel Core i5-8250U con 4 hilos y ejecución puramente en CPU, mediante `llama-speculative` sobre tres cargas de trabajo industriales en indonesio:

| Modo de decodificacion | Motor de borrador | Velocidad media | RAG SOP | JSON | Tasa de aceptacion | RAM pico (RSS) | Aceleracion vs baseline |
|---|---|---|---|---|---|---|---|
| Dupla neuronal SIMD (mejor) | Akal-Nano-270M Q4_0 (+imatrix) | 29,23 tok/s | 30,67 tok/s (+38,9%) | 32,06 tok/s (+20,8%) | 87,69% (RAG: 91,57%) | 1.308,4 MB | 1,224x (+22,4%) |
| N-gram hash sin RAM | ngram-mod (N=3, M=2..4) | 23,21 tok/s | 25,67 tok/s (+16,3%) | 15,84 tok/s | 52,92% (RAG: 64,29%) | 970,7 MB | 0,972x (RAG: 1,163x) |
| Autoregresivo baseline | Ninguno (Akal-1B-Steered solo) | 23,88 tok/s | 22,08 tok/s | No disponible | No aplica | No disponible | 1,0x |

Métricas adicionales del autor: 95,3-96,7 tok/s de generación de borradores en el i5-8250U; 96,65 tok/s en `tg128` para Q4_0 frente a 57,01 tok/s para Q4_K_M; perplejidad de 28,47 (Q4_K_M + imatrix) frente a 36,78 (Q4_0); precisión en tareas de borde de 66,67% frente a 33,33%. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el escenario principal, que es inferencia en CPU. En GPU, la huella de pesos es de 230-278 MB, por lo que cabría en cualquier GPU con más de 1 GB de memoria libre, aunque no se documentan pruebas en GPU.
- RAM: 328,6 MB de pico para uso independiente con Q4_K_M; 1.308,4 MB de RSS pico para la dupla especulativa con `Akal-1B-Steered` (se recomiendan al menos 1,4 GB libres según el autor).
- CPU de referencia: Intel Core i5-8250U de 4 núcleos con AVX2; el rendimiento depende de la disponibilidad de instrucciones SIMD.
- GPU recomendadas: no disponible; el modelo está orientado explícitamente a entornos sin GPU.
- Cabe en GPU de consumo: sí por tamaño de pesos, pero no es el caso de uso previsto ni hay datos de rendimiento en GPU.
- Opciones de despliegue: llama.cpp (incluido `llama-speculative` para la dupla), cualquier runtime compatible con GGUF; no se mencionan vLLM, TGI ni Ollama en la documentación.
- Latencia y throughput: TTFT de 68-91 ms y 89,8 tok/s en decodificación interactiva para el clasificador independiente; 95,3-96,7 tok/s como generador de borradores; 29,23 tok/s medios en la dupla especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Akal-Nano-270M | 268M | No disponible | Draft engine y micro-clasificador en CPU | Gemma | GGUF en Hugging Face |
| google/gemma-3-270m-it | 270M | No disponible en la informacion | Modelo instructivo de propósito general | Gemma | Pesos originales en Hugging Face |
| akal-lm/Akal-1B-GGUF | 1B (aproximado) | No disponible | Modelo objetivo para RAG y QA en CPU | No disponible en la informacion | GGUF en Hugging Face |
| ngram-mod (N=3, M=2..4) | 0 (basado en hash) | No aplica | Borrador sin modelo neuronal | No disponible | Integrado en llama.cpp |

La comparación relevante no es de calidad conversacional, sino de coste y velocidad en el rol de borrador: el n-gram hash consume cero RAM adicional pero logra una tasa de aceptación del 52,92% frente al 87,69% del modelo neuronal, lo que se traduce en menor aceleración en JSON (15,84 frente a 32,06 tok/s).

## Limitaciones y advertencias

- No es un motor de conocimiento conversacional: con 270M parámetros no sostiene conversaciones multi-turno profundas ni recuerda hechos del mundo sin alucinar; el autor lo declara explícitamente fuera de alcance.
- Riesgo alto de alucinación en preguntas abiertas y en cualquier tarea que requiera conocimiento factual.
- Idiomas limitados a indonesio e inglés; el rendimiento en castellano no está documentado y la matriz de importancia está calibrada para indonesio.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de un despliegue en producción.
- El uso como draft engine exige compartir vocabulario con el modelo objetivo; solo es válido con la familia `Akal-1B`, no con modelos de otros vocabularios.
- La elección de cuantización es crítica: usar Q4_0 para tareas independientes degrada la precisión (33,33% frente a 66,67% con Q4_K_M) y usar Q4_K_M como borrador reduce la velocidad un 69,5%.
- Los benchmarks proceden de un único hardware (Intel Core i5-8250U) y de cargas de trabajo en indonesio; la extrapolación a otras CPUs y dominios no está validada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de las métricas reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akal-lm/Akal-Nano-270M-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Modelo objetivo complementario: https://huggingface.co/akal-lm/Akal-1B-GGUF
- Modelo de embeddings complementario: https://huggingface.co/akal-lm/Akal-Embed-GGUF
- Modelo de reranking complementario: https://huggingface.co/akal-lm/Akal-Rerank-GGUF
- Preprint de investigación (Vol. 3, CC-BY 4.0): https://huggingface.co/akal-lm/Akal-Nano-270M-GGUF/resolve/main/Akal_Vol3_Architecture_Research_Paper.pdf
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor: https://huggingface.co/luqni
