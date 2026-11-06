# DhruvParmar051/syrinx-50m

## Resumen

Syrinx-50m es un modelo de lenguaje de tipo decoder-only transformer entrenado desde cero por DhruvParmar051 sobre 1.000 millones de tokens del corpus FineWeb-Edu. Se trata del modelo intermedio de una serie de escalado de tres tamanos (10M, 50M y 125M) cuyo objetivo declarado es estudiar el comportamiento de modelos pequenos entrenados de extremo a extremo en un unico portatil. La arquitectura sigue el esquema `LlamaForCausalLM` con RMSNorm, RoPE, SwiGLU y embeddings atados, con 10 capas, dimension de modelo 512, 8 cabezas de atencion y dimension de feed-forward 1536.

El modelo cuenta con 50.866.688 parametros totales (34.089.472 sin contar embeddings) y una longitud de contexto de 1024 tokens con un vocabulario de 32.768 entradas BPE a nivel de byte. Los pesos se distribuyen en fp32 en formato safetensors y el repositorio ocupa 0,2 GB, lo que lo hace trivial de desplegar en cualquier equipo. Su relevancia actual es principalmente metodologica: documenta con trazabilidad completa (hashes SHA-256 de experimentos de entrenamiento, evaluacion, contaminacion y benchmarks) el proceso de entrenamiento de un modelo pequeno, algo poco habitual en modelos de esta escala.

Es un modelo base sin ajuste de instrucciones ni de seguridad, entrenado exclusivamente con texto educativo en ingles. No responde preguntas de forma fiable y su uso previsto es la continuacion de texto en registro educativo y el estudio academico de dinamicas de escalado en modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (`LlamaForCausalLM`): RMSNorm, RoPE, SwiGLU, embeddings atados |
| Parametros totales | 50.866.688 (34.089.472 sin embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados solo en fp32 safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32) |

Datos adicionales de arquitectura: 10 capas, d_model 512, 8 cabezas de atencion, d_ff 1536, vocabulario de 32.768 (BPE a nivel de byte), RoPE theta 10000, epsilon de normalizacion 1e-05.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la configuracion estandar de Llama: normalizacion RMSNorm, embeddings posicionales rotatorios (RoPE), activacion SwiGLU en las capas feed-forward y atado de embeddings entre la capa de entrada y la de salida. Con 10 capas y 512 dimensiones de modelo, la relacion d_ff/d_model es de 3,0 (1536/512), coherente con la practica habitual en modelos Llama. El contexto maximo de 1024 tokens es reducido y limita las tareas que requieran ventanas largas.

El entrenamiento utilizo 1.000.079.360 tokens de FineWeb-Edu (ODC-By-1.0), distribuidos en 3.815 pasos con un batch efectivo de 262.144 tokens. El optimizador fue AdamW con learning rate pico de 0,0012, learning rate minimo de 0,00012, 200 pasos de warmup, decaimiento coseno y weight decay de 0,1, en precision bf16-autocast. El hardware fue un portatil Apple M5 Pro (GPU de 20 nucleos, 48 GB de memoria unificada) usando el backend MPS de PyTorch, con un tiempo total de 20,97 horas repartidas en 8 segmentos con paradas y reanudaciones. La perdida final de entrenamiento fue 3,3581 y la de validacion 3,3217. No se menciona uso de RLHF, DPO ni ajuste por preferencias; es un modelo puramente preentrenado. Como innovacion destacable, la model card documenta paridad de exportacion con la implementacion propia de Syrinx (diferencia maxima de logits de 0 frente a una tolerancia de 0,0001) y publica hashes SHA-256 de todos los artefactos de experimentos.

## Capacidades

- Generacion de texto en ingles mediante continuacion de prompt, en registro educativo.
- Razonamiento basico y respuesta a preguntas de conocimiento general limitada (puntuaciones por encima del azar en HellaSwag, ARC-Easy, PIQA y LAMBADA, pero bajas en terminos absolutos).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues practicamente nulas: solo entrenado con texto en ingles.
- No dispone de modo thinking, vision, audio ni otras modalidades.
- No es un modelo instruido: no sigue instrucciones ni mantiene conversaciones de forma fiable.

## Casos de uso

- Estudio academico de escalado de modelos: sirve como punto de la serie 10M/50M/125M para analizar como evolucionan perdida, perplejidad y bits por byte con el tamano, con artefactos y hashes documentados que permiten reproducir el analisis.
- Experimentos de destilacion y poda: al ser un modelo pequeno con pesos fp32 y arquitectura Llama estandar, es un candidato comodo como alumno en destilacion desde modelos mayores o como base para estudiar tecnicas de compresion.
- Generacion de texto educativo de relleno: puede completar fragmentos sobre temas cientificos o divulgativos en ingles para prototipos de interfaces, siempre con revision humana por su tendencia a la fabricacion.
- Pruebas de infraestructura de inferencia: con 0,2 GB de pesos y contexto de 1024 tokens, permite validar pipelines de transformers, TGI o vLLM en entornos con recursos minimos antes de pasar a modelos mayores.
- Educacion en ingenieria de ML: el repositorio documenta el ciclo completo (entrenamiento, evaluacion, control de contaminacion, benchmarks con lm-evaluation-harness) y sirve como material didactico para aprender a entrenar y evaluar un LLM desde cero.
- Investigacion sobre contaminacion de benchmarks: la model card publica el desglose entre subconjuntos "clean" y "contaminated" con n-gramas de 13 tokens, lo que permite estudiar metodologias de deteccion de fuga de datos en modelos pequenos.
- Generacion de texto en aplicaciones embebidas o de bajo consumo: al caber en memoria unificada de un portatil y requerir recursos minimos, puede integrarse en demos locales sin GPU dedicada, aceptando la limitacion de calidad.

## Benchmarks y rendimiento

Resultados publicados por el autor con lm-evaluation-harness 0.4.13, 0-shot, float32, con `<|endoftext|>` antepuesto. El error indicado es el error estandar binomial.

| Benchmark | Metrica | Todos | Clean | Contaminados | Azar |
|---|---|---|---|---|---|
| HellaSwag | acc_norm | 28,1% ± 0,4 (n=10.042) | 28,1% ± 0,4 (n=10.002) | 35,0% ± 7,5 (n=40) | 25,0% |
| ARC-Easy | acc | 47,2% ± 1,0 (n=2.376) | 47,0% ± 1,0 (n=2.278) | 59,1% ± 10,5 (n=22) | 25,0% |
| PIQA | acc_norm | 59,2% ± 1,1 (n=1.838) | 59,8% ± 1,2 (n=1.682) | 100,0% ± 0,0 (n=3) | 50,0% |
| LAMBADA (OpenAI) | acc | 18,6% ± 0,5 (n=5.153) | 18,6% ± 0,5 (n=5.153) | n/a | n/a |

Metricas de validacion sobre el split completo con ventanas no solapadas de 1024 tokens (12.215.296 tokens objetivo, 54.310.934 bytes), en bf16-autocast: perdida de 3,3206 nats/token, perplejidad de 27,68 y 1,0775 bits por byte. El autor senala que bits por byte es la unica metrica comparable entre tokenizadores distintos. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en fp32 (50,9M parametros x 4 bytes) mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU con 1 GB o mas.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU, Apple Silicon (MPS) y cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) sin problemas.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, incluidas integradas con memoria compartida.
- Opciones de despliegue: transformers (referencia oficial), text-generation-inference (tag `text-generation-inference` en el repo), llama.cpp/Ollama mediante conversion a GGUF (no se distribuye GGUF oficial), y cualquier runtime compatible con arquitectura Llama.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, la inferencia en CPU es viable en tiempo interactivo para secuencias cortas, pero no hay cifras publicadas.

## Comparativa con modelos similares

El autor declara explicitamente que no realiza comparaciones con otros modelos porque las puntuaciones publicadas usan datos, tokens, tokenizadores y prompts distintos, lo que impediria una comparacion justa. La informacion disponible no incluye datos de modelos alternativos comparables, por lo que la comparativa cuantitativa se marca como no disponible.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Syrinx-50m | 50,9M | 1024 | Apache-2.0 | Entrenado desde cero en 1.000M tokens de FineWeb-Edu |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | No se proporcionan datos comparables en la informacion disponible |

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones ni de seguridad: no responde preguntas de forma fiable y no debe usarse en produccion para tareas conversacionales o de asistencia sin un ajuste posterior.
- Riesgo alto de alucinacion: las continuaciones pueden ser fluidas pero factualmente incorrectas, y tambien repetitivas.
- Cobertura idiomatica limitada al ingles; otros idiomas, codigo y dominios especializados estan mal cubiertos.
- Contexto maximo de 1024 tokens, insuficiente para tareas que requieran documentos largos o conversaciones multi-turno extensas.
- Hereda sesgos y errores del texto web de Common Crawl; el filtro de calidad de FineWeb-Edu no los elimina.
- Puntuaciones de benchmark bajas en terminos absolutos (por ejemplo, 28,1% en HellaSwag frente al 25% del azar), coherentes con su tamano pero que limitan su utilidad practica.
- La perdida de validacion publicada (3,3217) es una estimacion durante el entrenamiento; la metrica de evaluacion independiente es 3,3206.
- Licencia Apache-2.0 para codigo y pesos, pero los datos de entrenamiento (FineWeb-Edu) estan bajo ODC-By-1.0 y derivan de Common Crawl, sujetos a sus terminos de uso; conviene revisar obligaciones de atribucion en uso comercial.
- El modelo se entreno con documentos que siempre terminaban en `<|endoftext|>`, por lo que los prompts deben comenzar con ese token para un comportamiento correcto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DhruvParmar051/syrinx-50m
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Licencia ODC-By v1.0: https://opendatacommons.org/licenses/by/1-0/
- Terminos de uso de Common Crawl: no disponible como enlace directo en la informacion proporcionada
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada
