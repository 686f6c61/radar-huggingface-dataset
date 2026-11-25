# nkthebass/tinybrainbot-100m-v5-base

## Resumen

TinyBrainBot-100M-v5.1-Base es un modelo de lenguaje base de 100,1 millones de parametros entrenado desde cero por el autor independiente nkthebass. Se trata de un `LlamaForCausalLM` convencional, sin codigo personalizado, pensado como modelo de referencia ("small language model") para tareas de generacion de texto en ingles. Es la continuacion de TinyBrainBot-100M-v3-Base, al que se le anadieron 4,6 mil millones de tokens adicionales de datos densos en conocimiento, alcanzando un total de 29,6 mil millones de tokens de entrenamiento.

El modelo emplea una arquitectura transformer decoder-only con 12 capas, dimension oculta de 768, GQA (12 cabezas de consulta y 4 de clave/valor), SwiGLU, RMSNorm y RoPE, con un vocabulario SentencePiece de 32.000 tokens. Su contexto es de solo 1.024 tokens, una limitacion importante para casos de uso que requieran ventanas largas. La licencia Apache 2.0 y el formato de pesos en safetensors (con variantes GGUF) lo hacen facilmente desplegable en entornos locales.

Su relevancia actual reside en que demuestra que un modelo de 100M entrenado desde cero con un dataset cuidadosamente curado puede superar a alternativas de tamano similar (hasta 140M) en tareas de razonamiento de sentido comun y ciencia basica, sin usar datos de los benchmarks en el entrenamiento. Es un modelo base, no un modelo de chat: continua texto, no mantiene conversaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM), GQA, SwiGLU, RMSNorm, RoPE |
| Parametros totales | 100.092.672 (75,5M sin embedding + 24,6M embedding atado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama estandar: 12 capas transformer con atencion multi-cabeza con GQA (12 cabezas de consulta de 64 dimensiones y 4 cabezas de clave/valor), FFN SwiGLU con dimension intermedia de 2048, normalizacion RMSNorm y embeddings posicionales rotatorios (RoPE). El vocabulario es SentencePiece de 32.000 tokens. No incorpora innovaciones tecnicas como decodificacion especulativa, atencion lineal ni modulos SSM; es un transformer clasico.

El entrenamiento totaliza 29,6 mil millones de tokens: los 25,06B del modelo v3-Base original, seguidos de 4,56B adicionales en cinco etapas, cada una con recalentamiento de la tasa de aprendizaje (pico entre 3e-4 y 6e-4) y posterior decaimiento. Los pesos publicados corresponden al paso final de la ultima etapa (step 113.000), no a un merge. La composicion de los datos de continuacion es: 30% Q&A y hechos (GooAQ, FactBase-DCLM, finephrase FAQ, ELI5), 23% web (DCLM-Ultra-1.1, ClimbMix, FineWeb-Edu de puntuacion 4-5), 21% libros de texto (Cosmopedia, WikiHow), 11% Wikipedia, 6,5% sentido comun y escritura, 4,5% aritmetica (Orca-Math, UltraData-Math, drills propios), 3% Q&A de ciencia de primaria (solo etapa final) y 1% narrativa. La etapa final incluye aproximadamente 420.000 preguntas de ciencia de primaria con respuestas cortas generadas por Ling-3.0-Flash, filtradas para eliminar cualquier coincidencia de 8 palabras con preguntas de ARC. No se usaron datos de entrenamiento o test de benchmarks.

## Capacidades

- Generacion de texto autoregresiva en ingles: continuacion de texto, redaccion, resumenes y respuesta a preguntas factuales.
- Razonamiento de sentido comun y ciencia basica a nivel de primaria/secundaria.
- Aritmetica basica: el modelo alcanza 47,0 en ArithMark-3.0 (0-shot) y 40,7 en un conjunto de 1.380 problemas retenidos con tematicas y formulaciones nunca vistas.
- Capacidad de "grade-school science Q&A": responde preguntas de ciencia escolar con explicaciones breves, gracias al entrenamiento especifico de la etapa final.
- No soporta tool calling ni function calling (no se menciona en la model card).
- No soporta agentes ni razonamiento multi-paso explicito.
- No dispone de modo "thinking", vision ni audio.
- Multilingue limitado: solo ingles.

## Casos de uso

- Completacion de texto y redaccion asistida en ingles: el modelo puede continuar parrafos, generar borradores de articulos o sugerir frases siguientes en editores, aprovechando su entrenamiento en datos web y de libros de texto. Adecuado por su bajo coste computacional y tamano reducido.
- Generacion de preguntas y respuestas de ciencia escolar: puede usarse para crear ejercicios de primaria o secundaria (preguntas con respuesta breve), dado que fue entrenado especificamente con 420.000 pares de Q&A de ciencia de primaria. Util para plataformas educativas que necesiten generar contenido de refuerzo.
- Prototipado rapido de pipelines de NLP: al ser un modelo Llama estandar de 100M, sirve como banco de pruebas para experimentar con tecnicas de decodificacion, cuantizacion o integracion en frameworks (Transformers, llama.cpp, Ollama) antes de escalar a modelos mayores.
- Inferencia en dispositivos de borde (edge): con cuantizacion Q4_K_M (66 MB) o Q8_0 (107 MB), puede ejecutarse en CPU, Raspberry Pi o moviles, habilitando completacion de texto offline en aplicaciones sin conectividad.
- Generacion de datos sinteticos de bajo coste: puede producir textos cortos (descripciones, definiciones, resumenes) para aumentar datasets de entrenamiento de otros modelos pequenos, dado su entrenamiento en Q&A y hechos.
- Filtrado y clasificacion de texto por perplejidad: al ser un modelo base, puede calcular la probabilidad de secuencias para detectar texto anomalo o filtrar contenido en pipelines de datos, aunque su contexto de 1.024 tokens limita la evaluacion a fragmentos cortos.
- Educacion e investigacion sobre entrenamiento desde cero: sirve como caso de estudio reproducible (arquitectura Llama, licencia Apache 2.0, dataset documentado) para investigadores que quieran analizar el efecto de la curacion de datos en modelos de menos de 150M.

## Benchmarks y rendimiento

Resultados declarados por el autor (0-shot, acc_norm, conjuntos de test completos). Los datos de otros modelos provienen del Open SLM Leaderboard.

| Modelo | Parametros | Int. Index | HellaSwag | ARC-E | ARC-C | PIQA | ArithMark-3 |
|---|---:|---:|---:|---:|---:|---:|---:|
| **TinyBrainBot-100M-v5.1-Base** | 100,1M | **26,07** | **34,98** | **57,15** | **34,47** | **67,52** | 47,00 |
| TinyBrainBot-100M-v3-Base (anterior) | 100,1M | 20,97 | 32,62 | 54,67 | 30,12 | 66,21 | 37,40 |
| void.1 | 90,2M | 24,38 | 39,5 | 49,3 | 29,4 | 67,2 | 43,7 |
| MobileLLM-R1-140M-base | 140M | 24,64 | 33,8 | 49,9 | 24,7 | 63,2 | 65,7 |
| BananaMind-2-Pro | 139M | 24,96 | 42,8 | 53,6 | 27,8 | 67,5 | 38,2 |
| GPT-X2.5-135M | 135M | 25,17 | 40,6 | 51,8 | 29,2 | 69,4 | 38,4 |

En ArithMark-3.0, el modelo obtiene 40,7 sobre 1.380 problemas retenidos con tematicas y formulaciones no vistas, frente a 47,0 en el conjunto publico.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (100M parametros ≈ 400 MB), aproximadamente 200 MB en F16, 107 MB en Q8_0 y 66 MB en Q4_K_M.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso GPUs integradas o CPUs modernas. No requiere A100 ni H100.
- Cabe en GPU consumer: si, en todas las GPU consumer con al menos 1 GB de memoria libre; tambien en CPU y dispositivos de borde.
- Opciones de despliegue: transformers (AutoModelForCausalLM), llama.cpp, LM Studio, Ollama, Jan. Los GGUF incluyen `add_space_prefix=false` para que la tokenizacion coincida con transformers (salida greedy identica). Tambien es compatible con text-generation-inference y endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por tamano, se espera inferencia en tiempo real incluso en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Int. Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyBrainBot-100M-v5.1-Base | 100,1M | 1.024 | 26,07 | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| void.1 | 90,2M | no disponible | 24,38 | no disponible | no disponible |
| MobileLLM-R1-140M-base | 140M | no disponible | 24,64 | no disponible | no disponible |
| BananaMind-2-Pro | 139M | no disponible | 24,96 | no disponible | no disponible |
| GPT-X2.5-135M | 135M | no disponible | 25,17 | no disponible | no disponible |

TinyBrainBot-100M-v5.1-Base lidera el Intelligence Index del Open SLM Leaderboard entre los modelos comparados (26,07), superando a alternativas de mayor tamano (135M-140M). Destaca especialmente en ARC-Easy (57,15) y ARC-Challenge (34,47), donde supera a todos los comparados, aunque queda por detras de MobileLLM-R1-140M-base en ArithMark-3 (47,0 frente a 65,7). La licencia Apache 2.0 y la disponibilidad de pesos GGUF lo hacen mas facilmente desplegable que los modelos comparados, cuyos datos de licencia y disponibilidad no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base: continua texto y no mantiene conversaciones; no debe usarse como chatbot sin fine-tuning adicional.
- Contexto muy limitado: 1.024 tokens, insuficiente para documentos largos, conversaciones multi-turno extensas o tareas que requieran memoria de contexto.
- Solo ingles: no soporta castellano ni otros idiomas; su uso en entornos multilingues requerira otro modelo.
- Riesgo de alucinacion: como modelo pequeno entrenado con datos web y sinteticos, puede generar afirmaciones factuales incorrectas con fluidez, especialmente fuera de los dominios de ciencia escolar y aritmetica basica.
- Sesgos: no se documentan sesgos especificos en la model card; al entrenarse con datos web (FineWeb-Edu, DCLM, ClimbMix) y sinteticos, puede heredar sesgos de esas fuentes, pero no hay analisis publicado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de incluir aviso de licencia y atribucion.
- Caveat de produccion: el autor advierte que los resultados de benchmarks son declarados por el mismo (no verificados por terceros) y que el modelo puede no generalizar fuera de los dominios de entrenamiento. La aritmetica en dominios no vistos cae de 47,0 a 40,7, lo que indica cierta fragilidad.
- Existe un modelo posterior (TinyBrainBot-100M-v6-Base) que continua el entrenamiento con 10B tokens adicionales; para nuevos proyectos conviene evaluar v6.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkthebass/tinybrainbot-100m-v5-base
- Modelo anterior (v3-Base): https://huggingface.co/nkthebass/tinybrainbot-100m-v3-base
- Modelo posterior (v6-Base): https://huggingface.co/nkthebass/tinybrainbot-100m-v6-base
- Open SLM Leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Dataset Arithmark-3.0: https://huggingface.co/datasets/AxiomicLabs/Arithmark-3.0
- Dataset FactBase-DCLM: https://huggingface.co/datasets/AxiomicLabs/FactBase-DCLM
- Dataset tinybrainbot-3m-math-data: https://huggingface.co/datasets/nkthebass/tinybrainbot-3m-math-data
