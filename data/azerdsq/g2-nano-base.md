# AZERDSQ/G2-nano-base

## Resumen

G2-nano-base es un modelo de lenguaje causal, unicamente decodificador, de 60,03 millones de parametros, desarrollado por AZERDSQ y publicado bajo licencia Apache 2.0. Se trata de un entrenamiento desde cero (from scratch) realizado integramente en una unica NVIDIA Jetson Orin Nano de 8 GB de memoria unificada, lo que lo convierte en un ejercicio de referencia sobre que tamano de modelo y que presupuesto de datos son alcanzables en hardware de borde de gama baja. La arquitectura es un transformer estilo Llama identica a la de su predecesor G1-nano: 14 capas, hidden size 576, atencion GQA con 9 cabezas de consulta y 1 de clave/valor, RoPE con theta 10000, SwiGLU con hidden 1664, RMSNorm, embeddings atados a la cabeza de lenguaje y una ventana de contexto de 2048 tokens.

El modelo se entrena sobre aproximadamente 3,00 mil millones de tokens (3.001.842.523 exactamente), el doble que G1-nano, con una mezcla dominada por FineWeb-Edu (66%). El propio autor califica el resultado como una nota de laboratorio mas que como un producto: la mejora en la media canonica de 6 tareas es de solo +1,56 puntos (44,59% frente a 43,03%), y tareas como PIQA, WinoGrande y ARC-Challenge quedan dentro del ruido estadistico. La conclusion declarada es que la forma de 60 M de parametros parece haber alcanzado su techo con este presupuesto de datos.

Es relevante ahora por su valor como artefacto reproducible y educativo, no por su capacidad: pesos, tokenizador y codigo de inferencia son abiertos, el coste de inferencia es practicamente nulo (menos de 1 GB de VRAM) y existe una version publicada en Ollama. No es un modelo de chat ni sigue instrucciones; es un checkpoint base que completa texto. Para conversacion, el autor remite a G1-nano-instruct o a G2-nano-instruct, este ultimo con un SFT que, segun la propia model card, empeora la media de 7 tareas respecto al base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only estilo Llama |
| Parametros totales | 60.031.296 (60,03 M) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No especificados en la model card; pesos en safetensors y distribucion GGUF a traves de Ollama |
| Idiomas soportados | Ingles unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB); requiere trust_remote_code por implementacion de Transformer personalizada |
| Capas | 14 |
| Hidden size | 576 |
| Atencion | GQA, 9 cabezas de consulta / 1 cabeza KV, head_dim 64 |
| Codificacion posicional | RoPE (theta = 10000) |
| Red feed-forward | SwiGLU, hidden 1664 |
| Normalizacion | RMSNorm |
| Vocabulario | 16.384 (SentencePiece BPE, compartido y atado con la cabeza LM) |
| Tokens de entrenamiento | 3.001.842.523 |
| Hardware de entrenamiento | NVIDIA Jetson Orin Nano (8 GB memoria unificada), 22.903 pasos |
| Formato de chat | No (modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer causal puramente decoder-only, sin ventana deslizante ni atencion lineal: la atencion es completa sobre toda la longitud entrenada de 2048 tokens. Usa Grouped Query Attention con 9 cabezas de consulta por cada cabeza de clave/valor, lo que reduce el coste de la cache KV, un detalle coherente con el objetivo de entrenar e inferir en 8 GB unificados. Los embeddings de entrada estan atados con la cabeza de modelado de lenguaje, practica habitual en modelos pequenos para reducir parametros. La tokenizacion emplea SentencePiece BPE con un vocabulario de 16.384 entradas.

El preentrenamiento es un run nuevo desde cero, no una reanudacion de G0 ni de G1, con objetivo de prediccion causal del siguiente token y 3.001.842.523 tokens en 22.903 pasos. La composicion del dataset es FineWeb-Edu 66%, OpenWebText 15%, PG-19 7,5%, Wikipedia EN 5%, BookCorpus 5% y WikiHow 1,5% (con tope aplicado). No se menciona en la informacion disponible ninguna fase de RLHF, DPO o SFT para este checkpoint base. Llama la atencion que duplicar el presupuesto de tokens (de ~1,50 B a ~3,00 B, unas 50 veces el numero de parametros) solo aporta +1,56 puntos en la media de 6 tareas, lo que el autor interpreta como evidencia de un techo cercano a los 60 M de parametros para esta forma concreta.

## Capacidades

- Generacion de texto y finalizacion de secuencias (autocompletado, continuacion de parrafos).
- Prediccion del siguiente token con decodificacion autoregresiva; el ejemplo de la model card usa top_k 50 y temperatura 0,8.
- Capacidad de modelado de lenguaje a nivel de frase y parrafo corto, con un techo factual bajo por el reducido numero de parametros.
- Ingles exclusivamente, segun la propia model card.
- No dispone de modo de razonamiento explicito, vision, audio ni multimodalidad.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de formato de chat ni sigue instrucciones; no hay plantilla de conversacion.
- Inferencia de una sola secuencia: no esta soportada la generacion por lotes con padding.
- Capacidad de completar texto en cualquier dominio cubierto por FineWeb-Edu, OpenWebText, PG-19, Wikipedia EN, BookCorpus y WikiHow.

## Casos de uso

- Educacion e investigacion sobre entrenamiento desde cero: permite reproducir y estudiar el efecto del presupuesto de tokens en un modelo de 60 M, dado que el autor publica la comparacion directa entre ~1,50 B y ~3,00 B de tokens con la misma arquitectura.
- Prototipado de pipelines de generacion de texto en local: con menos de 1 GB de VRAM se puede integrar en un script de transformers con trust_remote_code=True para validar tokenizadores, plantillas de prompt y flujos de decodificacion antes de escalar a modelos mayores.
- Inferencia en dispositivos de borde y sin conectividad: al caber en una Jetson Orin Nano o incluso en CPU, sirve para tareas de continuacion de texto en entornos aislados donde no es viable llamar a una API externa.
- Pruebas de cuantizacion y benchmarking de runtimes: su tamano minimo lo hace util como caso de prueba reproducible para medir latencia y throughput de llama.cpp, Ollama o transformers en hardware concreto.
- Aumento de datos sinteticos de bajo coste: se puede usar para generar continuaciones de texto en grandes volumenes a coste computacional practicamente nulo, siempre que la calidad se valide a posteriori, dado el riesgo de completaciones fluidas pero incorrectas.
- Ensayo de tecnicas de decodificacion (top-k, temperatura, penalizaciones) sobre un modelo barato: al ser un base puro sin alineacion, el efecto de cada parametro de muestreo es mas facil de aislar.
- Base para fine-tuning experimental: el checkpoint es un punto de partida limpio para probar SFT, LoRA o destilacion en un unico GPU de consumo, aunque el autor advierte que su propio SFT (G2-nano-instruct) degrado la media de 7 tareas.
- Analisis de sesgos y del comportamiento de modelos entrenados sobre FineWeb-Edu, por la composicion explicita y reproducible del dataset.

## Benchmarks y rendimiento

La model card solo publica un agregado, sin desglose por tarea:

| Metrica | G2-nano-base | G1-nano-base | Diferencia |
|---|---|---|---|
| Media canonica de 6 tareas | 44,59% | 43,03% | +1,56 pt |
| PIQA | no publicado | no publicado | dentro del ruido |
| WinoGrande | no publicado | no publicado | dentro del ruido |
| ARC-Challenge | no publicado | no publicado | dentro del ruido |
| Media de 7 tareas (variante instruct) | no publicada | no publicada | el SFT la reduce respecto al base |

No se han publicado resultados individuales de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de硬件

- VRAM estimada para inferencia: aproximadamente 120 MB solo de pesos en bf16, 240 MB en fp32, unos 60 MB en int8 y unos 30 MB en int4; la cache KV completa a 2048 tokens en bf16 ocupa del orden de 7 MB, por lo que el consumo total se mantiene por debajo de 1 GB en cualquier configuracion razonable.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es sobradamente suficiente; RTX 3060, RTX 4090, A100 o H100 estan enormemente sobredimensionadas para este modelo.
- Si cabe en GPU de consumo: si, en cualquier GPU de consumo de la ultima decada; tambien funciona en CPU, en Raspberry Pi y en NVIDIA Jetson Orin Nano (el mismo hardware con el que se entreno).
- Opciones de despliegue: Hugging Face Transformers con trust_remote_code=True (obligatorio por la implementacion personalizada de Transformer); Ollama mediante ollama run azerdsq/g2-nano-base; llama.cpp o cualquier runtime GGUF si se convierte el checkpoint. No hay confirmacion de soporte en vLLM ni TGI para la arquitectura personalizada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Media de 6 tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| G2-nano-base | 60,03 M | 2048 | ~3,00 B | 44,59% | Apache 2.0 | Hugging Face, Ollama |
| G1-nano-base | 60,03 M (misma arquitectura) | 2048 | ~1,50 B | 43,03% | no disponible | Hugging Face |
| G2-nano-instruct | 60,03 M | 2048 | ~3,00 B + SFT | no publicada (la media de 7 tareas baja respecto al base) | Apache 2.0 | Hugging Face |
| G1-nano-instruct | no disponible | no disponible | no disponible | no publicada | no disponible | Hugging Face |

No se han encontrado en la informacion disponible modelos externos comparables con datos de rendimiento verificables; la busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo ni sobre alternativas de su categoria.

## Limitaciones y advertencias

- Con 60 M de parametros, la retencion de hechos es muy limitada: las completaciones pueden ser fluidas y a la vez factualmente incorrectas.
- Riesgo alto de alucinacion en cualquier tarea que requiera conocimiento factual preciso.
- El propio autor senala que duplicar el presupuesto de tokens no produjo una mejora decisiva de calidad en esta arquitectura, por lo que no debe considerarse una mejora sobre G1-nano.
- Ventana de contexto de solo 2048 tokens, sin mecanismos de extension.
- Modelo exclusivamente en ingles; no se declaran otros idiomas.
- Solo genera una secuencia a la vez: no soporta inferencia por lotes con padding, lo que limita el throughput en servidores.
- No tiene ajuste por instrucciones ni formato de chat: no debe esperarse que siga ordenes ni mantenga conversaciones.
- Requiere trust_remote_code=True, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar el codigo antes de usarlo en produccion.
- La model card excluye explicitamente su uso para decisiones de alto impacto, verificacion factual, consejo medico, consejo legal o acciones autonomas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no publica el codigo de entrenamiento, los pipelines de datos ni los checkpoints intermedios, solo pesos, tokenizador e inferencia.
- No se ha publicado informacion sobre sesgos especificos medidos; la mezcla de datos (66% FineWeb-Edu) condiciona la distribucion y los sesgos del modelo.

## Enlaces

- [Modelo en Hugging Face: AZERDSQ/G2-nano-base](https://huggingface.co/AZERDSQ/G2-nano-base)
- [Contraparte ajustada por instrucciones: G2-nano-instruct](https://huggingface.co/AZERDSQ/G2-nano-instruct)
- [Version de chat recomendada por el autor: G1-nano-instruct](https://huggingface.co/AZERDSQ/G1-nano-instruct)
- [Distribucion en Ollama: azerdsq/g2-nano-base](https://ollama.com/azerdsq/g2-nano-base)
- [Organizacion del autor en Hugging Face](https://huggingface.co/AZERDSQ)

Nota: la busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo ni sobre su familia; los unicos enlaces utiles son los presentes en la model card del autor.
