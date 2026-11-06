# aixonlab/svg-slm-4b

## Resumen

svg-slm-4b es un ajuste fino mediante LoRA de Qwen/Qwen3.5-4B, desarrollado por aixonlab, orientado a la generación de gráficos vectoriales SVG a partir de descripciones en lenguaje natural: iconos, ilustraciones planas, line art, degradados, emojis, animaciones SMIL/CSS y escenas. El repositorio contiene los pesos fusionados en bf16; el adaptador LoRA por separado está en aixonlab/svg-slm-4b-lora. El modelo tiene 4.205.751.296 parámetros y hereda la arquitectura transformer de la familia Qwen3.5, con una ventana de contexto no especificada en la información disponible.

El modelo es explícitamente experimental. El propio autor reconoce que el objetivo del proyecto era superar a Claude Sonnet 5.5 en generación de SVG y que este checkpoint no lo consigue: se entrenó durante unas 2 horas de GPU (207 pasos de optimizador, aproximadamente 3.300 ejemplos, en torno al 4 % del dataset) con un límite de cómputo de 4 dólares. En una evaluación ciega por pares perdió todas las comparaciones.

Su relevancia es, por tanto, la de una prueba de concepto reproducible de un pipeline completo de ajuste fino para text-to-SVG sobre un modelo pequeño, no la de un sustituto de modelos frontera. Resulta útil como línea base, como punto de partida para experimentos con más cómputo y como ejemplo de entrenamiento SFT con LoRA sobre datos filtrados por licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5_text`) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en bf16; el repo ocupa 8,4 GB) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de 4,2 mil millones de parámetros, y se ajusta mediante SFT con LoRA de rango 32 y alpha 64 aplicado a todas las proyecciones de atención y MLP, lo que supone 42,5 millones de parámetros entrenables. El entrenamiento se hizo en bf16, con learning rate 1e-4 y decaimiento coseno, batch efectivo de 16 (batch 1 × acumulación de gradiente 16), pérdida calculada solo sobre los tokens del asistente (el SVG) y modo thinking desactivado en la plantilla de chat. Se ejecutaron 207 pasos, con la pérdida bajando de aproximadamente 0,78 a 0,70.

Los datos provienen del dataset aixonlab/svg-sft-v1, con 78.620 ejemplos filtrados por licencia (conjuntos permisivos de Iconify, filas permisivas de SVG Repo, Clker, OpenClipart, InternSVG SAgoge y SVG-Sophia). Solo se vieron unos 3.300 ejemplos. El hardware fue una única RTX PRO 4500 Blackwell de 32 GB en Runpod; los kernels cayeron a rutas lentas de PyTorch (flash-linear-attention instalado pero causal-conv1d no), lo que limitó el rendimiento a 38-43 s/paso. No hubo etapa de preferencias ni RL.

## Capacidades

- Generación de texto a SVG: iconos, ilustraciones planas, line art en blanco y negro, formas con degradado y sombreado, emojis, animaciones SMIL/CSS y escenas complejas.
- Conversación multi-turno mediante plantilla de chat de Qwen3.5 (etiqueta `conversational`).
- Modo thinking desactivable en la plantilla de chat (el entrenamiento se hizo con thinking desactivado).
- Generación de código SVG estructurado, con cierre mediante stop string `</svg>`.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el modelo está orientado a una tarea única de generación.
- Capacidades multilingües: limitadas al inglés según la model card.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Generación de iconos para interfaces: a partir de una descripción como "flat icon of a red coffee mug with steam", el modelo produce un SVG editable que puede integrarse en un sistema de diseño; conviene validar y renderizar antes de publicarlo.
- Prototipado rápido de ilustraciones planas: útil para generar borradores de ilustraciones que un diseñador retoca después, dado el bajo coste de inferencia de un modelo de 4B.
- Creación de line art para documentación técnica: el modelo puede producir trazos en blanco y negro para diagramas sencillos, aunque la adherencia al prompt es débil.
- Generación de emojis y formas con degradado: adecuado para experimentar con variantes visuales a partir de descripciones cortas.
- Animaciones SVG con SMIL/CSS: el modelo puede emitir animaciones, si bien es la categoría más débil; requieren un navegador para renderizarse, ya que resvg y CairoSVG ignoran la animación.
- Línea base para investigación en text-to-SVG: sirve como referencia reproducible para comparar con ajustes con más cómputo, datos o etapas de preferencias.
- Generación de assets vectoriales en pipelines internos con validación automática: integrar el modelo con un validador de SVG y un renderizador para descartar salidas inválidas o truncadas.

## Benchmarks y rendimiento

Evaluación del autor: 60 prompts propios (10 iconos, 10 ilustraciones planas, 8 line art, 8 con degradado, 6 emojis, 10 animados, 8 escenas), comparados contra SVGs escritos por Sonnet 5.5, con juicio ciego de Claude Opus 5.5 (escala 1-10). Decodificación: temperature 0.4, top-p 0.9, repetition penalty 1.06, máximo 6.000 tokens nuevos.

| Métrica | Resultado |
|---|---|
| Salidas SVG completas y renderizables | 26 / 60 (32 alcanzaron el límite de 6.000 tokens sin cerrar `</svg>`; 2 en blanco) |
| Victorias del juicio ciego frente a Sonnet 5.5 (solo salidas válidas, n=26) | 0 / 26 |
| Puntuación media del juicio (n=26) | Modelo 1,6 / 10; Sonnet 5.5 8,4 / 10 |
| Tasa de victoria sobre los 60 prompts (inválidas como derrota) | 0 % |

Por categoría, Sonnet ganó todas las comparaciones: iconos 7/7, degradados 6/6, animados 5/5, line art 3/3, emojis 2/2, escenas 2/2, ilustración plana 1/1. El autor advierte que el conjunto de evaluación es pequeño, creado dentro del mismo proyecto, que las animaciones se juzgaron sobre un fotograma estático y que se usó un único modelo juez.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan unos 8,4 GB, por lo que se necesitan aproximadamente 9-10 GB de VRAM en bf16; en cuantizaciones de 8 bits o 4 bits (no publicadas oficialmente) bajaría sustancialmente.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para bf16 sin problemas; el entrenamiento se hizo en una RTX PRO 4500 Blackwell de 32 GB.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 10-12 GB de VRAM en bf16 (por ejemplo, RTX 3080/4070/4080/4090).
- Opciones de despliegue: transformers (código de ejemplo en la model card), vLLM, TGI y llama.cpp/Ollama previa conversión a GGUF (no se distribuyen GGUF oficiales).
- Latencia y throughput: no disponibles. El autor reporta 38-43 s/paso durante el entrenamiento, dato no extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en SVG | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aixonlab/svg-slm-4b | 4,2B | No disponible | 26/60 válidos; 0/26 victorias frente a Sonnet 5.5 | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4,2B | No disponible | No evaluado en SVG en la información disponible | Apache-2.0 (según base) | Hugging Face |
| Claude Sonnet 5.5 (referencia del autor) | No disponible | No disponible | 8,4/10 de media en el juicio ciego; ganó todas las categorías | Propietaria | API |

No se dispone de datos de otros modelos especializados en text-to-SVG en la información proporcionada.

## Limitaciones y advertencias

- Adherencia débil al prompt: las salidas son a menudo formas plausibles que no representan lo solicitado.
- Frecuente falta de terminación: degenera en fragmentos de path repetidos en salidas largas; 32 de 60 salidas alcanzaron el límite de tokens sin cerrar `</svg>`.
- Escenas complejas y animación son las categorías más débiles; las secuencias de entrenamiento se limitaron a 5.000 tokens, lo que eliminó la mayoría de ejemplos de escenas complejas.
- Solo se vio una fracción pequeña del dataset (unas 3.300 de 78.620 muestras) y no hubo etapa de preferencias ni RL.
- Riesgo de alucinación visual: el modelo puede producir geometrías sintácticamente válidas pero semánticamente incorrectas.
- Idiomas: solo inglés documentado.
- Licencia: los pesos son Apache-2.0, pero los datos de entrenamiento tienen licencias por fila (MIT, Apache-2.0, CC0, dominio público, CC-BY-4.0, ISC, BSD, Unlicense); algunas filas son CC-BY y requieren atribución. Revisar la dataset card antes de uso comercial.
- En producción, validar siempre el SVG generado y renderizarlo; las animaciones requieren navegador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aixonlab/svg-slm-4b
- Adaptador LoRA: https://huggingface.co/aixonlab/svg-slm-4b-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/aixonlab/svg-sft-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
