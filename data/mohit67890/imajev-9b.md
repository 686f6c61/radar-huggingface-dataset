# mohit67890/imajev-9b

## Resumen

imajev-9b es un adaptador LoRA (PEFT) publicado por Mohit Garg sobre el modelo base Qwen/Qwen3.5-9B, orientado a la toma de decisiones tipada en entornos empresariales. En lugar de generar texto libre, el modelo recibe imágenes, registros y texto del negocio y responde seleccionando entre un conjunto de opciones predefinidas por el usuario, devolviendo una probabilidad calibrada para cada una y una etiqueta explícita de "no se puede determinar" (*can't tell*). El sistema actúa de forma automática cuando la confianza es alta y deriva el resto a revisión humana.

Forma parte de la familia imajev, que incluye versiones de 2B y 4B además de este 9B, la variante de mayor tamaño. Según la model card, el 9B está pensado para automatizar el mayor volumen de decisiones y destaca en texto con carga de conocimiento (MMLU 79,2 %, medido sobre la generación anterior del 9B). Es relevante porque propone un contrato de salida estructurado y calibrado —decisiones tipadas con probabilidad y abstención— en lugar del paradigma de generación abierta, lo que facilita su integración en flujos de back-office con umbrales de confianza.

El modelo se distribuye con licencia Apache-2.0, está etiquetado como `image-text-to-text` y solo declara inglés como idioma. El repositorio ocupa 1,0 GB y acumula 214 descargas y 8 likes en el momento de la consulta. La model card advierte que el adaptador del 9B no se actualizó tras el cambio de fase del 4B (26 de septiembre de 2026) y que sigue siendo la generación anterior de la familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Qwen/Qwen3.5-9B; salida de decisión tipada con probabilidades calibradas |
| Parametros totales | No disponible (9B en el modelo base; el adaptador LoRA no declara recuento propio) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors del adaptador; se menciona `mlx` como tag) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); tag `mlx` |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Qwen/Qwen3.5-9B, un transformer multimodal de 9B parámetros del que no se detallan en la información disponible ni la arquitectura interna, ni la longitud de contexto, ni la composición del corpus de entrenamiento. La innovación declarada no está en el backbone, sino en el contrato de salida: el adaptador se entrena para emitir decisiones tipadas —una opción entre las definidas por el usuario— acompañadas de una probabilidad calibrada y de una clase explícita de abstención ("can't tell"). Los tags del repositorio incluyen `typed-decisions`, `jev`, `decision-model`, `calibrated-probabilities` y `vision-language`.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineación. Tampoco se detalla el proceso de calibración de probabilidades ni el método de entrenamiento del adaptador (rangos LoRA, capas objetivo, hiperparámetros). La model card indica que el adaptador del 9B corresponde a la generación anterior de la familia y que no se actualizó con el cambio de fase aplicado al 4B el 26 de septiembre de 2026.

## Capacidades

- Decisión tipada sobre opciones predefinidas por el usuario, con probabilidad asociada a cada opción.
- Abstención entrenada: emite una etiqueta explícita de "no se puede determinar" en lugar de forzar una respuesta.
- Lectura de imágenes en el contexto de un registro del negocio (verificación foto contra dato declarado, p. ej. color de un listado frente a la foto).
- Comparación de dos imágenes para emitir una única decisión.
- Procesamiento conjunto de fotos, registros y texto en una misma petición.
- Salida con probabilidades calibradas apta para umbrales de confianza y derivación a humano.
- Capacidad de conocimiento en texto: MMLU 79,2 % según la model card (medido sobre la generación anterior del 9B).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Verificación de listados de e-commerce: el modelo contrasta los atributos declarados en un anuncio (por ejemplo, color) con la foto del producto y devuelve la opción discrepante con su probabilidad; si la confianza supera el umbral, la aplicación retiene o corrige el listado automáticamente.
- Enrutado de tickets de soporte: dada una descripción textual y los posibles departamentos como opciones, el modelo asigna el ticket con una probabilidad por cola y deriva a un agente humano los casos con confianza baja o etiquetados como "can't tell".
- Tramitación de devoluciones y reembolsos: se presentan las políticas aplicables como opciones tipadas y el modelo decide la categoría de resolución a partir del pedido, el motivo y, si procede, una foto del artículo; la abstención cubre los casos ambiguos.
- Verificación documental en back-office: comprobación de que la foto de un documento o producto coincide con los datos del registro (identificador, categoría, estado), con salida probabilística para auditar el porcentaje de automatización.
- Control de calidad visual en inspección: comparación de dos fotos (referencia frente a captura actual) para decidir si el artículo cumple el estándar, con umbral de confianza configurable antes de escalar a revisión.
- Clasificación de casos con abstención explícita en flujos regulados: cuando la decisión automática tiene consecuencias, el modelo permite fijar umbrales de probabilidad y enrutar el resto a un humano, manteniendo trazabilidad de la confianza emitida.
- Despliegue local o en el borde: al ser un adaptador sobre un base de 9B con licencia Apache-2.0, puede ejecutarse en infraestructura propia para datos sensibles de operaciones y soporte, sin depender de APIs externas.

## Benchmarks y rendimiento

La model card no publica resultados propios del 9B en los tableros citados; indica explícitamente que este 9B no tiene entrada oficial en el tablero de texto y que los rangos mostrados corresponden al imajev-4b de la familia. El único dato numérico atribuido al 9B es MMLU 79,2 %, medido sobre la generación anterior del modelo.

| Benchmark | imajev-9b | Nota |
|---|---|---|
| MMLU | 79,2 % | Medido sobre la generación anterior del 9B, según la model card |
| JevBench v1.4.2.2 | No disponible para el 9B | El resultado citado (67,4, #1 de 91) corresponde al imajev-4b |
| Image JevBench v0.1.3 | No disponible para el 9B | El resultado citado (76,39, #1 de 49) corresponde al imajev-4b |
| DecisionBench (eng, v1) | No disponible para el 9B | El resultado citado (79,65, #3 de 56) corresponde al imajev-4b |
| ImajevBench | No disponible para el 9B | El 83,9 % citado corresponde al adaptador de fase 3 del 4B |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, un backbone de 9B en precisión completa requiere del orden de 18 GB solo para pesos, y bastante más para el contexto y el procesamiento de imagen; las cifras exactas para este adaptador no se declaran.
- GPU recomendadas: no disponibles en la información proporcionada. Para un base de 9B multimodal, el rango habitual de referencia sería A100/H100 para servicio concurrente y RTX 4090 para uso individual, pero el autor no publica requisitos.
- ¿Cabe en GPU de consumo? No confirmado por el autor. El repo del adaptador ocupa 1,0 GB, pero el modelo base debe cargarse aparte.
- Opciones de despliegue: la librería declarada es `peft`, por lo que el adaptador se carga sobre el base con PEFT; el tag `mlx` sugiere soporte para el stack de Apple Silicon. No se confirman vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| imajev-9b | Base 9B + LoRA | No disponible | Decisión tipada multimodal con abstención | Apache-2.0 | Hugging Face, demo en Spaces |
| imajev-4b | Base 4B + LoRA | No disponible | Igual, con adaptador de fase 3 (ImajevBench 83,9 %) | Apache-2.0 | Hugging Face |
| imajev-2b | Base 2B + LoRA | No disponible | Igual, variante pequeña | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B | 9B | No disponible | Modelo base multimodal de propósito general | No disponible en la información | Hugging Face |

La comparativa con alternativas de otros autores no está disponible: los tableros citados (JevBench, Image JevBench, DecisionBench) incluyen modelos como Plumb-4B, decider-4b v2, Jev 1.13.0, Jev-Omni, NeoHorse Jev 4B, bosun-v3.1 y GLM-5.3 Flash, pero la información proporcionada no detalla sus especificaciones.

## Limitaciones y advertencias

- El adaptador del 9B es la generación anterior de la familia: el 4B recibió un adaptador de fase 3 el 26 de septiembre de 2026 y, según la model card, es ahora el mejor tamaño en ImajevBench.
- El 9B no tiene entrada oficial en el tablero de texto citado; los rankings destacados en la model card corresponden al 4B y no deben atribuirse a este modelo.
- Solo se declara inglés; no hay soporte multilingüe documentado.
- No se publican datos de sesgos, tasas de alucinación ni evaluación de robustez fuera de los benchmarks citados.
- La calibración de probabilidades es la base del contrato de decisión: sin una validación propia sobre el dominio de aplicación, los umbrales de confianza no deben asumirse transferibles.
- La abstención ("can't tell") está entrenada, pero su tasa y comportamiento por dominio no se documentan.
- El modelo está diseñado para elegir entre opciones predefinidas; no debe emplearse como generador de texto libre sin validar el comportamiento fuera de ese contrato.
- Licencia Apache-2.0: permite uso comercial, pero deben verificarse por separado los términos del modelo base Qwen/Qwen3.5-9B, no detallados en la información disponible.
- El tamaño del repo (1,0 GB) corresponde solo al adaptador; el coste de despliegue real lo determina el modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohit67890/imajev-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante 4B: https://huggingface.co/mohit67890/imajev-4b
- Variante 2B: https://huggingface.co/mohit67890/imajev-2b
- Demo en vivo (Space): https://huggingface.co/spaces/mohit67890/imajev
- Repositorio de código y resultados: https://github.com/mohit67890/imajev
- Sitio web del proyecto: https://mohit67890.github.io/imajev/
- Informe técnico: https://mohit67890.github.io/imajev/report/
- Benchmark ImajevBench (dataset): https://huggingface.co/datasets/mohit67890/imajev-bench
- Tablero JevBench: https://benchmarkheaven.com/jev-models
- Tablero Image JevBench: https://benchmarkheaven.com/image-jev-bench
- Tablero DecisionBench: https://huggingface.co/spaces/Hanno-Labs/decision-bench-leaderboard
- Autor: https://mohitgarg.ai
