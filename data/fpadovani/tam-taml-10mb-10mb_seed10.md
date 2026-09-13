# fpadovani/tam-taml-10mb-10mb_seed10

## Resumen

El modelo `fpadovani/tam-taml-10mb-10mb_seed10` es un ajuste fino supervisado (SFT) del modelo base `goldfish-models/tam_taml_10mb`, publicado por el usuario fpadovani. Se trata de un transformer decoder-only de tipo GPT-2 con 39.087.104 parámetros (unos 39 M), según los pesos reales en `safetensors` del repositorio, lo que lo sitúa en la categoría de modelos minúsculos, ejecutables incluso en CPU.

El entrenamiento se realizó con la librería TRL (versión 0.23.0) mediante SFT sobre el modelo base, que a su vez pertenece a la familia Goldfish de modelos monolingües pequeños. El identificador del modelo base (`tam_taml`, con sufijo `10mb`) apunta a un modelo de 10 MB de datos de entrenamiento para tamil, aunque la model card no declara ni el idioma ni la composición del dataset de ajuste.

Su relevancia es fundamentalmente como artefacto de investigación: el proyecto de seguimiento en Weights & Biases se denomina `new_tokenizers`, lo que sugiere experimentos de tokenización o ajuste para lenguas de bajos recursos. No tiene descargas ni valoraciones, no publica resultados de benchmarks ni licencia explícita, por lo que no debe considerarse un modelo listo para producción sin una evaluación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (etiqueta `gpt2`, librería `transformers`, pipeline `text-generation`) |
| Parametros totales | 39.087.104 (≈39 M), dato real de los pesos en `safetensors` |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la arquitectura GPT-2 suele usar 1024 tokens, pero no se confirma en la información proporcionada) |
| Tipos de cuantizacion | no disponible; solo se publican pesos sin cuantizar en `safetensors`, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible; el identificador del modelo base (`tam_taml`) apunta a tamil, sin confirmación en la model card |
| Licencia | no disponible (la model card incluye el marcador `licence: license` sin texto de licencia) |
| Formato de pesos | `safetensors` (compatible con `transformers` y `text-generation-inference`) |
| Modelo base | `goldfish-models/tam_taml_10mb` |
| Fecha de publicación | 13 de septiembre de 2026 (según metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, tal y como indican la etiqueta `gpt2`, la librería declarada (`transformers`) y la pipeline (`text-generation`). Con 39 M de parámetros, se trata de un modelo de escala muy reducida, sin mecanismos de atención lineal, MoE ni decodificación especulativa documentados.

El entrenamiento se realizó mediante SFT con TRL 0.23.0, sobre las siguientes versiones de framework: Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se especifica el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO ni hiperparámetros. El experimento está registrado en Weights & Biases bajo el proyecto `new_tokenizers` (run `myjrvjuj`), lo que sugiere que el ajuste forma parte de una línea de trabajo sobre tokenizadores en contextos multilingües o de bajos recursos.

## Capacidades

- Generación de texto autoregresiva en formato de conversación, según el ejemplo de uso de la model card (mensajes con rol `user`).
- Ajuste por instrucciones básico derivado del SFT, sin confirmación de seguimiento fiable de instrucciones complejas.
- Capacidad de ejecución en CPU o GPU de gama baja por su tamaño (39 M de parámetros).
- Compatibilidad con la librería `transformers` y con la etiqueta `text-generation-inference` (TGI).
- Soporte de `tool calling` / `function calling`: no disponible, no documentado.
- Soporte de agentes o razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingües: no disponibles; no se declara ningún idioma en la model card.
- Capacidades especiales (modo pensamiento, visión, audio): no disponibles.

## Casos de uso

- Experimentación académica con SFT: el modelo sirve como banco de pruebas reproducible para comparar recetas de ajuste supervisado con TRL sobre un modelo base pequeño, gracias a su tamaño de 39 M de parámetros y a la traza registrada en Weights & Biases.
- Investigación sobre tokenizadores en lenguas de bajos recursos: el proyecto asociado (`new_tokenizers`) y el modelo base de la familia Goldfish sugieren su uso para medir el impacto de cambios de tokenizador en la calidad de generación de una lengua con pocos recursos.
- Generación de texto en el borde (edge): con menos de 160 MB en fp32, puede desplegarse en dispositivos con CPU y memoria limitada para tareas de autocompletado o generación corta.
- Aumento de datos y generación de corpus sintético: útil para producir texto adicional de dominio restringido cuando no se requiere alta fidelidad semántica.
- Docencia y demostraciones de pipelines de Hugging Face: el ejemplo de la model card con `pipeline("text-generation")` permite ilustrar el ciclo completo de ajuste y despliegue sin requisitos de hardware.
- Base para destilación o comparativas de ablación: al ser tan pequeño, es adecuado como línea base para medir cuánto aporta un modelo mayor en una misma tarea o idioma.
- Pruebas de integración de infraestructura (TGI, endpoints compatibles): permite validar despliegues con la etiqueta `text-generation-inference` y `endpoints_compatible` a bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 156 MB para los pesos en fp32 (39.087.104 × 4 bytes) y unos 78 MB en bf16/fp16; con activaciones y caché KV, por debajo de 1 GB en cualquier configuración razonable de contexto.
- Memoria en CPU: inferior a 1 GB, por lo que la inferencia en CPU es perfectamente viable.
- GPU recomendadas: cualquier GPU con más de 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 queda muy por encima de lo necesario. También funciona en iGPU y en aceleradores tipo Apple Silicon.
- ¿Cabe en GPU de consumo?: sí, en cualquier GPU de consumo actual e incluso en muchas generaciones anteriores.
- Opciones de despliegue: `transformers` (pipeline de `text-generation`), Hugging Face Text Generation Inference (etiqueta `text-generation-inference`), endpoints compatibles (etiqueta `endpoints_compatible`) y vLLM mediante conversión. Para `llama.cpp` u Ollama sería necesaria una conversión a GGUF que no se publica en el repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. Por tamaño, se espera latencia muy baja (del orden de milisegundos por token en GPU), pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `fpadovani/tam-taml-10mb-10mb_seed10` | 39.087.104 | no disponible | no disponible | Hugging Face, `safetensors` | Ajuste SFT; 0 descargas; sin benchmarks |
| `goldfish-models/tam_taml_10mb` (base) | no disponible en la información proporcionada | no disponible | no disponible | Hugging Face | Modelo base sobre el que se ajusta; datos de la familia Goldfish (10 MB) |
| `openai-community/gpt2` (referencia de arquitectura) | 124 M (dato de conocimiento general, no verificado en esta búsqueda) | 1024 (dato de conocimiento general, no verificado) | no disponible en la información proporcionada | Hugging Face | Alternativa genérica en inglés de arquitectura idéntica; no es comparable en idioma ni en datos de ajuste |

No se dispone de alternativas comparables verificadas en la información proporcionada para la misma lengua o tarea.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se ha publicado ninguna evaluación de sesgos ni de toxicidad.
- Riesgo de alucinación: muy alto. Con 39 M de parámetros y un modelo base entrenado con 10 MB de datos, la coherencia factual y la consistencia a medio plazo son muy limitadas.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto real y los idiomas soportados; el identificador apunta a tamil, pero no está confirmado en la model card.
- Licencia: la model card usa el marcador `licence: license` sin texto legal, por lo que no hay autorización explícita de uso comercial ni condiciones claras de atribución. Tratarlo como uso restringido hasta aclaración del autor.
- Ausencia de validación: 0 descargas y 0 likes, sin benchmarks ni evaluación independiente; no hay evidencia de calidad más allá del ejemplo de la model card.
- Riesgo de plantilla de chat: la model card muestra una llamada con lista de mensajes, pero no se documenta una plantilla de chat formal; el comportamiento fuera de ese formato es impredecible.
- Uso en producción: no recomendado para tareas con requisitos de precisión, cumplimiento normativo o responsabilidad legal; apto únicamente para experimentación.
- Conversión a GGUF/Ollama: no disponible en el repositorio, requiere trabajo adicional del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/tam-taml-10mb-10mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/tam_taml_10mb
- Organización Goldfish Models: https://huggingface.co/goldfish-models
- Repositorio de TRL: https://github.com/huggingface/trl
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/myjrvjuj
- Búsqueda web: los resultados obtenidos no guardan relación con el modelo (corresponden a foros de ideas de productos Ex Libris Alma) y no aportan información adicional.
