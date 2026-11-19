# Nactium/Nactium-39M

## Resumen

Nactium-39M es un modelo de lenguaje causal de tipo GPT desarrollado por Nactium, con aproximadamente 39 millones de parámetros y disenado especificamente para el idioma frances. Se trata de un transformer decoder de siete capas con una dimension oculta de 512 y una ventana de contexto de 1024 tokens, lo que lo situa en la categoria de modelos ultraligeros orientados a experimentacion y despliegue en entornos con recursos muy limitados.

El modelo se entrena sobre 12 mil millones de tokens procedentes de una mezcla de datasets que incluye corpus de alineamiento en frances, datos de instrucciones, noticias, Wikipedia en frances y el dataset DCLM. A pesar de su reducido tamano, incorpora un vocabulario de 32 000 tokens, lo que le permite una tokenizacion razonablemente eficiente para el frances.

Su relevancia actual radica en ser un ejemplo de modelo pequeno y abierto para investigacion en lenguas minoritarias dentro del ecosistema de IA, asi como una base para experimentos de entrenamiento, fine-tuning y evaluacion con `lm-evaluation-harness`. Los resultados publicados muestran un rendimiento superior a otros modelos franceses de tamano similar en tareas de gramatica y vocabulario, aunque por debajo del azar en razonamiento tipo ARC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (causal LM), clase `Nactium39MForCausalLM` |
| Parametros totales | 38 976 000 (~39M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | frances (principal); evaluado tambien en ingles en PIQA |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

Especificaciones adicionales de arquitectura:

| Parametro | Valor |
|---|---|
| Capas (`num_hidden_layers`) | 7 |
| Dimension oculta (`hidden_size`) | 512 |
| Cabezas de atencion (`num_attention_heads`) | 8 |
| Dimension intermedia MLP (`intermediate_size`) | 2048 |
| Funcion de activacion | GELU |
| Vocabulario (`vocab_size`) | 32 000 |
| Embeddings atados (`tie_word_embeddings`) | Si |
| `use_cache` | Desactivado (`false`) en la configuracion actual |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

Nactium-39M es un transformer decoder autoregresivo clasico, sin mecanismos de mezcla de expertos ni atencion lineal. Consta de 7 capas con 8 cabezas de atencion, dimension oculta de 512 y un MLP con dimension intermedia de 2048 y activacion GELU. Los embeddings de entrada y la cabeza de salida estan atados, lo que reduce el numero de parametros efectivos. El vocabulario es de 32 000 tokens y la longitud maxima de posicion es de 1024. La configuracion actual desactiva la cache de atencion (`use_cache=false`), lo que penaliza la velocidad de generacion en secuencias largas.

El entrenamiento utilizo 12 mil millones de tokens a partir de cinco fuentes: el dataset de alineamiento DPO en frances de CATIE-AQ, el corpus de instrucciones `angeluriot/french_instruct`, el dataset de noticias `ksolovev/fine-news`, el corpus DCLM baseline y articulos de Wikipedia en frances de Kant1. No se especifica en la informacion disponible si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa mas alla de la mencion al dataset de alineamiento DPO como fuente de datos.

## Capacidades

- Generacion de texto causal en frances: completion de frases, parrafos y respuestas breves.
- Razonamiento basico y respuesta a preguntas simples, con limitaciones claras en tareas que requieren conocimiento factual amplio.
- Tareas de gramatica y vocabulario en frances, donde obtiene sus mejores resultados relativos.
- Generacion condicionada por prompt con muestreo (temperature, top_p) mediante `model.generate`.
- Capacidad multilingue limitada: el modelo esta entrenado principalmente en frances, aunque se ha evaluado en ingles (PIQA) con resultados cercanos al azar.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, vision ni audio en la informacion disponible.

## Casos de uso

- Experimentacion academica con modelos pequenos en frances: sirve como baseline para estudiar el efecto del tamano, la tokenizacion y la composicion del dataset en lenguas romances, gracias a su bajo coste computacional y a su integracion directa con `lm-evaluation-harness`.
- Fine-tuning para tareas especificas de dominio: al tener solo 39M de parametros, se puede ajustar en una unica GPU consumer para clasificacion de texto, generacion de resumenes cortos o adaptacion a jerga sectorial.
- Generacion de texto asistida en entornos con recursos minimos: puede ejecutarse en CPU o en GPUs de gama baja para prototipos de autocompletado o generacion de respuestas cortas en frances.
- Evaluacion de tecnicas de tokenizacion y vocabulario: su vocabulario de 32 000 tokens permite comparar estrategias de segmentacion para frances frente a modelos con vocabularios mayores.
- Educacion y divulgacion: util para demostrar el funcionamiento interno de un transformer causal en cursos y talleres, dado su tamano reducido y su arquitectura simple.
- Base para modelos derivados: puede servir como punto de partida para destilacion o para experimentos de alineamiento con DPO, ya que parte de un dataset de alineamiento en frances.
- Pruebas de integracion en pipelines de transformers: util para validar flujos de carga con `trust_remote_code=True` y para testear infraestructura de inferencia antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Evaluaciones realizadas con `lm-evaluation-harness` en regimen 0-shot:

| Benchmark | Idioma | Metrica | Nactium 39M | Azar |
|---|---|---:|---:|---:|
| ARC Challenge | FR | acc | 18,39 % (± 1,18) | 25 % |
| ARC Challenge | FR | acc_norm | 24,04 % (± 1,25) | 25 % |
| Grammar | FR | acc | 64,7 % (± 4,42) | 25 % |
| Vocab | FR | acc | 58,82 % (± 4,56) | 25 % |
| PIQA | EN | acc | 56,15 % (± 1,16) | 50 % |
| PIQA | EN | acc_norm | 55,50 % (± 1,16) | 50 % |

Comparativa con otros modelos pequenos en frances (metrica acc):

| Benchmark | Nactium 39M | Houzeric mini-gpt-french 60M | Klovis 144M |
|---|---:|---:|---:|
| ARC Challenge (FR) | 18,39 | 19,85 | 21,13 |
| Grammar (FR) | 64,7 | 27,73 | 21,85 |
| Vocab (FR) | 58,82 | 21,85 | 25,21 |
| PIQA (EN) | 56,15 | 53,48 | 51,90 |
| Media | 49,5 | 30,7 | 30,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (39M parametros x 4 bytes ≈ 156 MB de pesos, mas overhead de activaciones y cache), y del orden de 100-200 MB en fp16/bf16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tambien funciona en CPU. No requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, etc.) e incluso en Raspberry Pi o entornos embebidos con suficiente RAM.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `trust_remote_code=True`. No se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI en la informacion disponible; al ser un modelo con `custom_code`, la conversion a GGUF requeriria trabajo adicional.
- Latencia y throughput: no disponibles. La desactivacion de `use_cache` implica que la generacion en secuencias largas sera mas lenta de lo habitual, ya que se recalcula la atencion completa en cada paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Nactium 39M | ~39M | 1024 | Frances | no disponible | Hugging Face |
| Houzeric mini-gpt-french 60M | ~60M | no disponible | Frances | no disponible | Hugging Face |
| Klovis 144M | ~144M | no disponible | Frances | no disponible | Hugging Face |

En la comparativa publicada por el autor, Nactium 39M obtiene la mejor media (49,5) frente a Houzeric mini-gpt-french 60M (30,7) y Klovis 144M (30,0), gracias a sus resultados en Grammar y Vocab. Sin embargo, Klovis 144M supera a Nactium en ARC Challenge (21,13 frente a 18,39), lo que sugiere que el mayor tamano ayuda en tareas de razonamiento. No se dispone de datos de licencia ni de contexto para los modelos comparados.

## Limitaciones y advertencias

- Rendimiento por debajo del azar en ARC Challenge (18,39 % frente a 25 % de azar), lo que indica una capacidad de razonamiento muy limitada.
- Ventana de contexto de solo 1024 tokens, insuficiente para tareas de contexto largo, resumen de documentos extensos o conversaciones multi-turno prolongadas.
- Entrenado principalmente en frances; su uso en otros idiomas producira resultados de baja calidad.
- `use_cache` desactivado en la configuracion actual, lo que reduce el rendimiento en generacion autoregresiva y aumenta la latencia.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar codigo del autor y anade un riesgo de seguridad en entornos de produccion.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; se recomienda contactar con el autor antes de usarlo en produccion.
- Riesgo elevado de alucinacion y de generar texto incoherente en temas especializados, dado el reducido tamano y la limitada capacidad de almacenamiento de conocimiento factual.
- Sin datos publicados sobre sesgos, filtrado de datos o evaluaciones de seguridad.
- El modelo fue creado en 2026 y tiene 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad.
- No se documenta soporte de tool calling, agentes ni capacidades multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nactium/Nactium-39M
- Dataset CATIE-AQ/facebook-community-alignment-dataset_french_dpo: https://huggingface.co/datasets/CATIE-AQ/facebook-community-alignment-dataset_french_dpo
- Dataset angeluriot/french_instruct: https://huggingface.co/datasets/angeluriot/french_instruct
- Dataset ksolovev/fine-news: https://huggingface.co/datasets/ksolovev/fine-news
- Dataset mlfoundations/dclm-baseline-1.0: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset Kant1/French_Wikipedia_articles: https://huggingface.co/datasets/Kant1/French_Wikipedia_articles
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
