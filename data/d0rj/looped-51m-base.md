# d0rj/looped-51M-base

## Resumen

looped-51M-base es un modelo de lenguaje base en inglés de 50.869.792 parámetros (según los pesos en safetensors; la model card declara 50.869.760) desarrollado por el usuario d0rj dentro de su experimento "Tiny llm ablation". No es un fine-tune de ningún checkpoint previo: se ha entrenado desde inicialización aleatoria sobre una muestra de FineWeb-Edu, y su interés es puramente de investigación sobre arquitecturas recurrentes en profundidad ("looped" o weight-sharing entre capas).

La innovación principal es que solo tiene 10 capas decodificadoras distintas que se aplican 6 veces en bucle, dando 60 capas efectivas con parámetros compartidos entre iteraciones. El ancho es de 512, usa SwiGLU de 1792, atención GQA con 8 cabezas de consulta y 2 de clave/valor, RoPE, RMSNorm, embeddings atados y embeddings de bucle aprendidos. La longitud de contexto es de 2048 tokens y el tokenizador (heredado de la baseline arquitectónica Q-50M-Base) tiene 32.768 entradas.

Es relevante ahora porque forma parte de una familia de ablaciones de modelos diminutos (aproximadamente 50M de parámetros) entrenados con presupuestos controlados, que permiten estudiar empíricamente el compromiso entre profundidad efectiva, cómputo y calidad. Con 3.932.160.000 tokens de origen procesados en 15.000 pasos sobre una única RTX 5070 Ti de 16 GB, es un ejemplo de entrenamiento reproducible y de bajo coste. Al ser un modelo base sin ajuste por instrucciones, no incluye plantilla de chat ni alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador con weight-sharing recurrente (looped): 10 capas compartidas aplicadas 6 veces; SwiGLU 1792, GQA 8 cabezas Q / 2 KV, RoPE, RMSNorm, embeddings atados y embeddings de bucle aprendidos |
| Parametros totales | 50.869.792 (safetensors); la model card declara 50.869.760 |
| Parametros activos | No aplica (no es MoE; todos los parametros se usan en cada paso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (no se publican GGUF ni variantes cuantizadas; entrenamiento con pesos FP32 y computo BF16) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (requiere `trust_remote_code` por el tag `custom_code` / `looped_lm`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con compartición de pesos entre profundidades: un bloque de 10 capas decodificadoras se reutiliza 6 veces, lo que da 60 capas efectivas con el coste de memoria de 10. El ancho oculto es 512, la capa SwiGLU tiene dimensión intermedia 1792 y la atención usa GQA con 8 cabezas de consulta y 2 de clave/valor, con RoPE como codificación posicional y RMSNorm como normalización. Los embeddings de entrada y salida están atados y se añaden embeddings de bucle aprendidos para que el modelo distinga la iteración en la que se encuentra. El tokenizador, sin modificar, tiene 32.768 entradas. El principio general de compartición de pesos recurrentes proviene de Universal Transformers (arXiv:1807.03819), pero la implementación es un bucle fijo de seis iteraciones, no una reproducción exacta de esa arquitectura.

El entrenamiento se hizo desde inicialización aleatoria con objetivo de entropía cruzada autorregresiva de siguiente token. Se procesaron exactamente 3.932.160.000 tokens de origen en 15.000 pasos de optimizador, sobre la muestra sample-10BT de FineWeb-Edu. El lote efectivo es de 4 × 32 de acumulación × 2048 = 262.144 tokens de origen por paso, con búfer de mezcla de 100.000 y semilla 2026. El cómputo se realizó en BF16 con pesos en FP32 en una única RTX 5070 Ti de 16 GB, usando Fused AdamW con LR máximo 0.001, warmup lineal de 150 pasos y decaimiento coseno hasta 0.0001, betas (0.9, 0.95), weight decay 0.1 excluyendo sesgos, normalizaciones y parámetros 1D, y recorte de gradiente de 1.0. La propia model card advierte que presupuestos iguales de tokens de origen no implican el mismo nivel de supervisión ni los mismos FLOPs entre ablaciones.

## Capacidades

- Generación de texto autorregresiva en inglés: continuación de texto libre, sin plantilla de chat ni formato instruccional.
- Modelado de lenguaje base: puntuación de verosimilitud de continuaciones, útil para evaluación con protocolos de likelihood como los usados en el harness lm-eval.
- Razonamiento de sentido común limitado: obtiene resultados por encima del azar o cercanos a él en HellaSwag, PIQA y ARC-Easy, coherentes con su tamaño.
- Comprensión lectora básica: BoolQ con 0.6159 de exactitud y LAMBADA OpenAI con 0.2090 de exactitud (la métrica LAMBADA exige que coincidan todos los tokens de la palabra final).
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso entrenado explícitamente.
- Multilingüe: no; únicamente inglés.
- Capacidades especiales: el "modo bucle" (profundidad recurrente efectiva de 60 capas sobre 10 bloques) es la característica distintiva, pero no hay modo de pensamiento, visión ni audio.

## Casos de uso

- Investigación sobre weight-sharing y recurrencia en profundidad: sirve como punto de comparación frente a las demás ablaciones de la colección "Tiny llm ablation" para medir el efecto del número de bucles sobre la pérdida y sobre las métricas de evaluación con un presupuesto de tokens fijo.
- Estudios de escalado con presupuesto mínimo: con ~51M de parámetros y 3.932M de tokens procesados, es adecuado para reproducir curvas de escalado en una sola GPU de consumo (RTX 5070 Ti de 16 GB), sin necesidad de clúster.
- Puntuación de verosimilitud en pipelines de evaluación: se puede usar como modelo de referencia barato para calcular log-probabilidades de continuaciones y comparar hipótesis en tareas de elección múltiple, tal y como se hizo en HellaSwag, ARC, PIQA, WinoGrande y OpenBookQA.
- Prototipado rápido de infraestructura de inferencia: al ocupar alrededor de 0,2 GB de repositorio y ~51M de parámetros, permite validar pipelines de transformers, carga con `trust_remote_code` y verificación de tensores en entornos de desarrollo sin coste de GPU relevante.
- Docencia y experimentación en cursos de NLP: el modelo entrena en una GPU de consumo y su configuración exacta está publicada (`training_config.json`), lo que lo hace utilizable como ejemplo completo de pipeline de entrenamiento y evaluación con lm-eval 0.4.12.
- Generación de texto de relleno o aumento de datos controlado: puede generar continuaciones de texto en inglés con coherencia local para pruebas de sistemas (por ejemplo, carga de formularios o pruebas de interfaz) siempre que no se requiera exactitud factual.
- Análisis de sensibilidad del tokenizador: al conservar el tokenizador de 32.768 entradas de Q-50M-Base, permite aislar el efecto de la arquitectura recurrente frente a cambios de vocabulario en experimentos comparativos.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card. Evaluación zero-shot, protocolo de verosimilitud autorregresiva, lm-eval 0.4.12, BF16, contexto máximo 2048, sin plantilla de chat. Las cifras son porcentajes; ± es un error estándar y los corchetes son intervalos de Wilson al 95 %.

| Dataset | Split | Ejemplos | Métrica | Puntuación ± EE (%) | IC 95 % (%) |
|---|---|---:|---|---:|---:|
| HellaSwag | validation | 10.042 | acc_norm | 29,62 ± 0,46 | [28,73; 30,52] |
| ARC-Easy | test | no disponible | acc_norm | 44,28 ± no disponible | [42,29; 46,28] |
| ARC-Challenge | test | no disponible | acc_norm | 22,10 ± no disponible | [19,82; 24,56] |
| PIQA | validation | no disponible | acc_norm | 60,28 ± no disponible | [58,03; 62,50] |
| WinoGrande (winogrande_xl) | validation | no disponible | acc | 50,12 ± no disponible | [47,37; 52,87] |
| OpenBookQA (main) | test | no disponible | acc_norm | 29,00 ± no disponible | [25,19; 33,13] |
| BoolQ | validation | no disponible | acc | 61,59 ± no disponible | [59,91; 63,24] |
| LAMBADA OpenAI | test | no disponible | acc | 20,90 ± no disponible | [19,81; 22,03] |

No se han publicado en la información disponible resultados de MMLU, GSM8K, HumanEval ni otros benchmarks adicionales, ni comparaciones directas contra las otras ablaciones de la colección.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 (formato de pesos del entrenamiento) unos 0,2 GB; en FP16/BF16 unos 0,1 GB. Cualquier GPU moderna sobra.
- GPU recomendadas: no requiere GPU dedicada. Cabe holgadamente en una RTX 4090, una RTX 5070 Ti (la usada para entrenar y evaluar), una GTX 1660 o incluso en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en iGPU y en CPU. El repositorio completo ocupa 0,2 GB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía soportada, dado el tag `custom_code` y la arquitectura `looped_lm`. No se documentan pesos GGUF ni integraciones con llama.cpp, Ollama, vLLM o TGI. No hay plantilla de chat, por lo que solo se debe usar como modelo de continuación.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por tamaño, el throughput en GPU de consumo será muy alto incluso con lotes grandes, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| looped-51M-base | 50,87 M | 2048 | Transformer decodificador con 10 capas compartidas aplicadas 6 veces | No disponible | HuggingFace, requiere `trust_remote_code` |
| Q-50M-Base | ~50 M (no confirmado) | No disponible | Transformer decodificador estándar (baseline arquitectónica y de tokenizador de este modelo) | No disponible | HuggingFace (q-project/Q-50M-Base) |
| Otras ablaciones de la colección Tiny llm ablation de d0rj | No disponible | No disponible | Variantes del mismo experimento | No disponible | HuggingFace (colección del autor) |

No se dispone de una comparación cuantitativa de parámetros, contexto ni benchmarks frente a alternativas como GPT-2 small o Pythia-70M en la información proporcionada; solo se confirma que Q-50M-Base es la referencia arquitectónica y de tokenizador declarada por el autor, y que los pesos de looped-51M-base no son un fine-tune de ese checkpoint.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni por preferencias humanas: no espera formato de chat, no sigue instrucciones de forma fiable y puede producir texto incoherente o repetitivo.
- Tamaño muy reducido (unos 51M de parámetros): el conocimiento factual es mínimo y la coherencia decae rápidamente en generaciones largas.
- Riesgo elevado de alucinación: no hay verificación factual ni alineación; el modelo solo modela la distribución del texto de FineWeb-Edu.
- Sesgos: al entrenarse sobre FineWeb-Edu, puede reproducir sesgos presentes en texto web filtrado; no se documenta ningún análisis de sesgo en la model card.
- Idioma: únicamente inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Contexto limitado a 2048 tokens, sin mecanismos de extensión documentados.
- Licencia no disponible: no se puede confirmar que el uso comercial esté permitido. Conviene contactar con el autor antes de cualquier uso en producción.
- Requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar código personalizado del repositorio; hay que auditar ese código antes de usarlo en entornos sensibles.
- Resultados de benchmarks no verificados (`verified: false` en el model-index) y obtenidos con un único protocolo (verosimilitud autorregresiva, zero-shot); no son comparables directamente con evaluaciones de modelos generativos con few-shot.
- La propia model card advierte que el cómputo de esta ablación no está igualado al de las demás y que presupuestos iguales de tokens de origen no implican igual supervisión ni FLOPs, por lo que las comparaciones entre ablaciones deben interpretarse con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d0rj/looped-51M-base
- Baseline arquitectónica y de tokenizador Q-50M-Base: https://huggingface.co/q-project/Q-50M-Base
- Colección Tiny llm ablation: https://huggingface.co/collections/d0rj/tiny-llm-ablation-6aafca336122dd2c2868f923
- Dataset de entrenamiento FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper de referencia sobre compartición de pesos recurrentes (Universal Transformers): https://arxiv.org/abs/1807.03819
- Configuración de entrenamiento: training_config.json (en el repositorio del modelo)
- Resultados completos de evaluación: evaluation/results.json (en el repositorio del modelo)
