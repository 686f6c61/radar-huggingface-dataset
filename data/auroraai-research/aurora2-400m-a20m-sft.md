# AuroraAI-Research/Aurora2-400M-A20M-SFT

## Resumen

Aurora2-400M-A20M-SFT es la version afinada para conversacion del modelo base Aurora2-400M-A20M, desarrollado por AuroraAI-Research. Se trata de un modelo de lenguaje de tipo mixture-of-experts (MoE) disperso con 399,6 millones de parametros totales y solo 19,1 millones activos por token, lo que lo situa en la categoria de small language model con un coste computacional de inferencia muy bajo. El modelo base fue preentrenado con 100.000 millones de tokens usando Muon y AdamW, y esta version SFT anade la capacidad conversacional con un presupuesto adicional de 5.000 millones de tokens.

La relevancia de este modelo radica en su diseno eficiente: 12 capas, 32 expertos con enrutamiento top-1 mas un experto compartido, atencion con grouped-query attention (GQA) y embeddings n-gram con hashing. Con un contexto de 2048 tokens y un vocabulario de 16.384 tokens (BPE a nivel de byte con digitos separados), el modelo esta pensado para experimentacion en investigacion y prototipado rapido, no para produccion. La licencia Apache-2.0 facilita su uso y modificacion.

El modelo se distribuye en FP32 en la raiz del repositorio y en variantes FP16 y BF16 en subcarpetas, con un tamano de repositorio de 3,2 GB. Su formato de chat es explicito (`User:` / `Assistant:`) y el tokenizer incluye una plantilla de chat que reproduce exactamente ese formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso (sparse MoE), 12 capas, 32 expertos con top-1 + experto compartido, GQA, embeddings n-gram con hashing |
| Parametros totales | 399.597.454 (399,6M) |
| Parametros activos | 19,1M |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (solo se publican pesos FP32, FP16 y BF16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (FP32 en raiz, FP16 en `fp16/`, BF16 en `bf16/`) |
| Vocabulario | 16.384 tokens (BPE a nivel de byte, digitos separados) |
| Presupuesto SFT | 5.000 millones de tokens |
| Modelo base | AuroraAI-Research/Aurora2-400M-A20M (preentrenado con 100B tokens) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE disperso de 12 capas con 32 expertos y enrutamiento top-1, complementado por un experto compartido siempre activo. Emplea grouped-query attention (GQA) para reducir el coste de atencion y embeddings n-gram con hashing, una tecnica que amplia la representacion de secuencias cortas sin incrementar proporcionalmente el vocabulario. El modelo base se preentreno con 100.000 millones de tokens usando el optimizador Muon para las matrices ocultas y AdamW para el resto de parametros.

El afinamiento SFT consumio 5.000 millones de tokens con una mezcla aproximadamente mitad conversaciones (SmolTalk, UltraChat, con perdida calculada solo sobre tokens del asistente y EOS tras cada respuesta) y mitad replay de datos de preentrenamiento (ClimbMix, FineMath, Wikipedia y QA matematico). Las conversaciones nunca se dividen entre secuencias y el texto web rellena los huecos. La optimizacion uso Muon para matrices ocultas y AdamW para el resto, con LR pico de 3e-4, warmup y decaimiento coseno, y 262.000 tokens por paso. Tras el SFT, los 32 expertos permanecieron activos en todas las capas (0 expertos muertos).

## Capacidades

- Generacion de texto conversacional multi-turno en formato `User:` / `Assistant:` con parada limpia en EOS.
- Razonamiento basico y respuesta a preguntas simples; el modelo es fluido en peticiones sencillas.
- Aritmetica y QA matematico basico, con mejora leve tras el SFT gracias al replay de FineMath y QA matematico.
- Finalizacion de texto y continuacion de estilo del modelo base, preservada mediante replay de datos de preentrenamiento.
- Soporte de plantilla de chat en el tokenizer (`apply_chat_template`) que incluye BOS automaticamente.
- Capacidad multilingue limitada: solo se declara ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Prototipado de chatbots de bajo coste: el modelo puede mantener conversaciones multi-turno simples en ingles con un coste de inferencia minimo gracias a sus 19,1M parametros activos, adecuado para validar flujos conversacionales antes de escalar a modelos mayores.
- Investigacion en arquitecturas MoE: sirve como banco de pruebas para estudiar enrutamiento de expertos, equilibrio de carga y tecnicas de entrenamiento con Muon en modelos pequenos con 32 expertos top-1.
- Generacion de texto asistida en entornos con recursos muy limitados: al tener solo 19,1M parametros activos y contexto de 2048 tokens, puede ejecutarse en CPU o GPUs de gama baja para tareas de autocompletado y continuacion de texto.
- Educacion y demostraciones: util para mostrar el funcionamiento de un MoE disperso y el efecto del SFT en la perdida conversacional (de 1,505 a 1,254 nats en el conjunto de conversaciones) en cursos o talleres.
- Experimentos de alineacion y formato: el formato de chat explicito y la perdida solo sobre tokens del asistente lo hacen idoneo para estudiar tecnicas de SFT, packing de secuencias y replay de datos.
- Generacion de respuestas cortas en pipelines de datos: puede emplearse para tareas de etiquetado ligero o generacion de respuestas candidatas en ingles dentro de sistemas de aumento de datos, siempre con revision humana por su tendencia a errores factuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta perdidas de validacion (loss y perplejidad) comparando el modelo base y el SFT:

| Conjunto de validacion | Loss base (ppl) | Loss SFT (ppl) | Cambio |
|---|---|---|---|
| Conversaciones (solo tokens del asistente) | 1,505 (4,50) | 1,254 (3,51) | -0,251 |
| QA matematico | 0,781 (2,18) | 0,738 (2,09) | -0,044 |
| ClimbMix (texto web general) | 2,566 (13,02) | 2,612 (13,63) | +0,046 |

La perdida conversacional baja de forma notable, la matematica mejora ligeramente y la perdida en texto web general sube solo marginalmente (+0,046 nats), sin degradacion observada en los benchmarks de finalizacion del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 399,6M parametros totales con 19,1M activos, los pesos en FP32 ocupan aproximadamente 1,6 GB; en FP16/BF16 alrededor de 0,8 GB. La VRAM real depende de la implementacion del enrutamiento MoE y del overhead de activaciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 (12 GB) o superior permite ejecutar el modelo con holgura. Para lotes grandes o mayor throughput, una RTX 4090 o una A100/H100 ofrecen margen de sobra.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM, e incluso en CPU para inferencia interactiva.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el codigo personalizado del modelo); no se documenta soporte explicito de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables (benchmarks) para establecer una comparativa cuantitativa con alternativas de la misma categoria. A continuacion se comparan caracteristicas estructurales con modelos pequenos de referencia, indicando los datos no disponibles:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Idiomas |
|---|---|---|---|---|---|
| Aurora2-400M-A20M-SFT | 399,6M | 19,1M (MoE top-1) | 2048 | Apache-2.0 | en |
| SmolLM2-360M | 360M | denso | 8192 | Apache-2.0 | en (multilingue parcial) |
| Qwen2.5-0.5B | 494M | denso | 32768 | Apache-2.0 | multilingue |
| TinyLlama-1.1B | 1,1B | denso | 2048 | Apache-2.0 | en |

Los datos de rendimiento de los modelos alternativos no se han verificado en esta ficha; la comparativa se limita a parametros, contexto y licencia segun conocimiento general, y no se dispone de benchmarks del modelo Aurora2 para contrastar calidad.

## Limitaciones y advertencias

- Con solo 19,1M parametros activos, el modelo comete errores factuales y aritmeticos con frecuencia, puede divagar y no esta afinado para seguridad.
- El autor lo describe explicitamente como modelo de investigacion, no apto para produccion.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo soporta ingles; no se declara capacidad multilingue.
- Riesgo de alucinacion elevado en preguntas factuales y calculos.
- Sin tuning de seguridad: puede generar contenido inapropiado o sesgado; no se documentan evaluaciones de sesgo.
- Requiere `trust_remote_code=True` por el codigo personalizado del modelo, lo que implica ejecutar codigo del autor.
- No se documentan opciones de cuantizacion ni soporte en motores de inferencia optimizados, lo que puede limitar el despliegue en produccion.
- La licencia Apache-2.0 permite uso comercial, pero las limitaciones tecnicas y la falta de garantias desaconsejan ese uso sin evaluacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AuroraAI-Research/Aurora2-400M-A20M-SFT
- Modelo base: https://huggingface.co/AuroraAI-Research/Aurora2-400M-A20M
