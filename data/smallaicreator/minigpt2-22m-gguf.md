# SmallAICreator/MiniGPT2-22M-GGUF

## Resumen

MiniGPT2-22M es un modelo de lenguaje de 22,03 millones de parametros (15,7M sin contar embeddings) entrenado desde cero por SmallAICreator / UltraLabs. Se distribuye en formato GGUF F16 en un unico fichero de 44,6 MB, pensado explicitamente para ejecutarse en dispositivos con recursos muy limitados, incluido un telefono movil, mediante llama.cpp, PocketPal, LM Studio u Ollama. La relevancia de este modelo no esta en su calidad, sino en su tamano: sirve como referencia reproducible de un transformer tipo Llama completo, con tokenizador propio y plantilla de chat embebida, que cabe en cualquier maquina.

Arquitectonicamente es un decoder denso estilo Llama de 10 capas, dimension 384, 6 cabezas de atencion y 2 cabezas KV (GQA), SwiGLU con dimension intermedia 1024, RoPE, RMSNorm y embeddings atados. El contexto es de 1024 tokens y el tokenizador es un BPE byte-level de 16.384 tokens entrenado especificamente para este modelo. Se entreno sobre aproximadamente 26.5 mil millones de tokens en una sola pasada, sin repeticion, en 7 horas sobre 8 TPU v5e.

El modelo esta licenciado bajo Apache 2.0 y solo soporta ingles. Su autor lo posiciona como un modelo de juguete o de experimentacion, no como una herramienta de produccion: la propia model card advierte de errores factuales, debilidad en aritmetica y razonamiento multi-paso, y verbosidad excesiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso estilo Llama (10 capas, d=384, 6 cabezas / 2 KV heads con GQA, SwiGLU 1024, RoPE, RMSNorm, embeddings atados) |
| Parametros totales | 22.028.160 (15,7M sin embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | F16 (unico fichero publicado); no se indican cuantizaciones Q8/Q4 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16, 44,6 MB); convertido desde un checkpoint original en JAX a formato HF Llama y despues a GGUF |
| Tokenizador | BPE byte-level de 16.384 tokens, entrenado para este modelo |
| Plantilla de chat | Embebida en el GGUF; formato `<|system|>...<|end|><|user|>...<|end|><|assistant|>`, sin token BOS |
| Tamano del repo | 0,0 GB segun HuggingFace |

## Arquitectura y entrenamiento

El modelo sigue el diseno canonico de un decoder transformer moderno: atencion con consultas agrupadas (6 cabezas de query y 2 de key/value), normalizacion RMSNorm, activacion SwiGLU con dimension intermedia 1024, embeddings rotatorios (RoPE) y embeddings de entrada/salida atados. El tokenizador, un BPE byte-level de 16.384 entradas, se entreno especificamente para este modelo en lugar de reutilizar uno existente. La ventana de contexto es de 1024 tokens.

El entrenamiento consumio aproximadamente 26.5B tokens en una unica pasada sin repeticion, sobre una mezcla de FineWeb-Edu, Cosmopedia-v2, SlimPajama, FineMath, codigo Python, HTML y una mezcla de chat/instrucciones destilada de un modelo mayor, incorporada en la fase final del entrenamiento. El optimizador combina Muon para las matrices ocultas y AdamW para embeddings y normalizaciones. Todo el entrenamiento se ejecuto en 8 TPU v5e durante 7 horas. El proceso de conversion fue verificado por el autor: el modelo HF reproduce el forward de entrenamiento con una diferencia maxima de logits de 4e-5, la tokenizacion de llama.cpp coincide exactamente con la del tokenizador HF, y los logits del GGUF F16 coinciden con HF con un 100% de acuerdo en top-1 y un KL medio de 7,6e-6. No se menciona uso de RLHF ni DPO; la alineacion conversacional proviene de la mezcla de instrucciones destilada.

## Capacidades

- Generacion de texto autoregresiva en ingles, con calidad propia de un modelo de 22M de parametros.
- Conversacion multi-turno basica mediante la plantilla de chat embebida, con turnos delimitados por `<|end|>`.
- Instrucciones simples y preguntas factuales de un solo paso (por ejemplo, capitales de paises).
- Generacion de texto creativo muy corto, como haikus o frases sueltas.
- Capacidades limitadas de razonamiento de sentido comun y comprension lectora simple, segun los benchmarks publicados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor lo describe explicitamente como debil en razonamiento multi-paso.
- Capacidades multilingues: no; solo ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Inferencia en CPU y en dispositivos moviles gracias al formato GGUF y a los 44,6 MB del fichero F16.

## Casos de uso

- Asistentes conversacionales embebidos en aplicaciones moviles sin conexion: el modelo pesa 44,6 MB en F16 y la plantilla de chat esta embebida, por lo que puede integrarse en apps Android o iOS con PocketPal o llama.cpp sin descargar nada adicional.
- Prototipado y ensenanza de arquitecturas transformer: al ser un decoder estilo Llama completo, entrenado desde cero y con tokenizador propio, sirve como caso de estudio reproducible para explicar GQA, RoPE, SwiGLU y embeddings atados en un aula o un articulo tecnico.
- Pruebas de humo de pipelines de inferencia GGUF: permite verificar en segundos que llama.cpp, Ollama o LM Studio funcionan correctamente en un entorno nuevo, dado su tamano minimo y su fichero unico.
- Generacion de texto creativo corto y de bajo coste: haikus, esloganes, pies de foto o textos de relleno en aplicaciones donde la calidad literaria no es critica y el coste por token debe ser practicamente nulo.
- Educacion e investigacion sobre entrenamiento desde cero: su receta (Muon + AdamW, 26.5B tokens en una pasada, 7 horas en TPU v5e-8) es un ejemplo de bajo presupuesto util para estudiar el efecto de la mezcla de datos y del destilado de instrucciones en modelos muy pequenos.
- Baseline de evaluacion en lm-evaluation-harness: los resultados publicados sobre 11 tareas con el mismo harness permiten usarlo como punto de comparacion para nuevos modelos en el rango de 20-100M de parametros.
- Demostraciones en hardware embebido (Raspberry Pi, microcontroladores con Linux, navegador): con 44,6 MB en F16 y contexto de 1024 tokens, la inferencia es viable en CPU sin GPU.

## Benchmarks y rendimiento

Resultados 0-shot con lm-evaluation-harness 0.4.13 en fp32, ejecutados por el autor con el mismo harness para todos los modelos. El autor indica que su ejecucion de Supra-50M reproduce exactamente las cifras publicadas de ese modelo.

| Tarea | MiniGPT2 (22M) | Pythia-70M | Supra-50M |
|---|---|---|---|
| ARC-Easy (acc) | 42,2 | 37,5 | 52,2 |
| ARC-Easy (acc_norm) | 40,0 | 35,2 | 46,0 |
| ARC-Challenge (acc_norm) | 23,1 | 21,9 | 25,0 |
| HellaSwag (acc_norm) | 28,2 | 27,4 | 31,8 |
| PIQA (acc_norm) | 58,1 | 59,2 | 62,1 |
| SciQ (acc) | 66,4 | 64,0 | 77,2 |
| Winogrande (acc) | 50,0 | 53,0 | 51,0 |
| BLiMP (acc) | 74,2 | 74,2 | 76,3 |
| LAMBADA OpenAI (acc) | 23,1 | 22,7 | 25,9 |
| LAMBADA standard (acc) | 13,5 | 15,5 | 17,2 |
| WikiText (bits/byte, menor es mejor) | 1,176 | 1,080 | 1,027 |

Segun el autor, MiniGPT2 supera a Pythia-70M, 3,2 veces mas grande, en 6 de las 11 tareas, y empata en BLiMP; queda por detras de Supra-50M, 2,3 veces mayor. No hay datos publicados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 100 MB en F16 (el fichero pesa 44,6 MB, mas el estado de la KV cache para 1024 tokens y las estructuras de llama.cpp). Cabe en cualquier GPU, incluso integradas, y en CPU. No se publican cifras para cuantizaciones distintas de F16.
- GPU recomendadas: no se especifica ninguna; el modelo esta disenado para CPU y dispositivos moviles. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es sobradamente suficiente.
- GPU consumer: si, cabe en cualquier GPU consumer, incluida la gama de entrada, y tambien en telefonos y placas tipo Raspberry Pi.
- Opciones de despliegue: llama.cpp (`llama-cli -m MiniGPT2-22M-F16.gguf -cnv`), Ollama, LM Studio y PocketPal, segun la model card. No se mencionan vLLM ni TGI.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Datos de rendimiento (ARC-Easy acc / HellaSwag acc_norm / WikiText bpb) |
|---|---|---|---|---|
| MiniGPT2-22M | 22,03M (15,7M sin embeddings) | 1024 tokens | Apache 2.0 | 42,2 / 28,2 / 1,176 |
| Pythia-70M | 70M | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | 37,5 / 27,4 / 1,080 |
| Supra-50M | 50M | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | 52,2 / 31,8 / 1,027 |

Los tres modelos se evaluaron con lm-evaluation-harness 0.4.13 en fp32 y 0-shot. MiniGPT2 destaca por su menor tamano frente a Pythia-70M y por su licencia Apache 2.0 explicita; Supra-50M obtiene mejores resultados en casi todas las tareas, con la excepcion de Winogrande (51,0 frente a 50,0 de MiniGPT2).

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos, pero al entrenarse principalmente sobre FineWeb-Edu, Cosmopedia-v2 y SlimPajama hereda los sesgos de esos corpus web en ingles.
- Riesgo de alucinacion: alto. El propio autor advierte de que el modelo comete errores factuales y no debe usarse para nada importante.
- Aritmetica y razonamiento multi-paso: explicitamente debiles segun la model card.
- Verbosidad: el autor senala que el modelo puede ser prolijo en sus respuestas.
- Contexto muy limitado: 1024 tokens, insuficiente para documentos largos, historiales de conversacion extensos o recuperacion aumentada con varios pasajes.
- Idioma: unicamente ingles; no hay soporte multilingue documentado.
- Formato de prompt: requiere la plantilla exacta con `<|system|>`, `<|user|>`, `<|assistant|>` y `<|end|>`, sin token BOS. Un formato incorrecto degrada la calidad de salida.
- Licencia: Apache 2.0 permite uso comercial, pero la model card no detalla la licencia del modelo mayor del que se destilo la mezcla de instrucciones, lo que conviene verificar antes de un uso comercial.
- Produccion: no apto para tareas que requieran precision factual, calculo o razonamiento encadenado. Su uso razonable es educativo, experimental o como componente trivial de interfaz.
- Los resultados de benchmarks son 0-shot y en fp32; el rendimiento en F16 y con la plantilla de chat aplicada puede diferir.

## Enlaces

- HuggingFace: https://huggingface.co/SmallAICreator/MiniGPT2-22M-GGUF
- Fichero de pesos: `MiniGPT2-22M-F16.gguf` (44,6 MB), disponible en el repositorio de HuggingFace.
- Paper, blog, repositorio o demo adicionales: no disponible. Las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo; los unicos resultados obtenidos estaban relacionados con precios de carburantes y no guardan relacion con la ficha.
