# fpadovani/tam-taml-10mb-ppt-Dp-100mb_seed10

## Resumen

`fpadovani/tam-taml-10mb-ppt-Dp-100mb_seed10` es un ajuste fino supervisado (SFT) del modelo base `goldfish-models/tam_taml_10mb`, publicado por el usuario fpadovani y entrenado con la librería TRL de Hugging Face. Se trata de un modelo de generación de texto de arquitectura GPT-2 con 39.087.104 parámetros (unos 39 millones), lo que lo sitúa en la gama de modelos pequeños, aptos para inferencia en CPU y en GPU de gama de entrada.

El modelo base pertenece a la familia Goldfish, un conjunto de modelos monolingües entrenados con corpus de 10 MB para cientos de idiomas. El identificador `tam_taml` remite al tamil (código ISO `tam`, escritura `taml`), aunque la model card del ajuste fino no declara explícitamente los idiomas soportados. El ajuste se ha realizado con SFT mediante TRL sobre un conjunto de datos no documentado en la ficha, con una semilla fijada (`seed10`) y el repositorio pesa 0,6 GB.

Su relevancia es fundamentalmente experimental: sirve como banco de pruebas reproducible de ajuste fino sobre modelos minúsculos, y como punto de partida para investigar tokenizadores y corpus de bajo recurso. No está pensado para tareas de producción que exijan razonamiento complejo, contexto largo o cobertura multilingüe amplia, y no se han publicado resultados de benchmarks ni detalles del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en Hugging Face) |
| Parámetros totales | 39.087.104 (dato real de los pesos en safetensors) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible; no se publican pesos cuantizados. Al ser un modelo de ~39 M de parámetros es convertible a GGUF, int8 o 4 bits con herramientas estándar |
| Idiomas soportados | No disponible. El modelo base (`goldfish-models/tam_taml_10mb`) está asociado al tamil según su nombre, pero la model card no lo confirma |
| Licencia | No disponible. La model card incluye el campo `licence: license` sin especificar términos |
| Formato de pesos | safetensors |
| Librería | transformers (compatible con text-generation-inference, según la etiqueta `endpoints_compatible`) |
| Modelo base | `goldfish-models/tam_taml_10mb` |
| Tamaño del repositorio | 0,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, la misma familia que emplean los modelos Goldfish: modelos monolingües compactos entrenados sobre corpus de 10 MB por idioma, con vocabularios adaptados a cada escritura. El ajuste fino conserva esa arquitectura y ese tokenizador; lo que cambia es la fase de entrenamiento posterior.

El entrenamiento se realizó con SFT (supervised fine-tuning) usando TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO; por las etiquetas (`trl`, `sft`) y el texto de la model card, se trata únicamente de SFT. El nombre del modelo sugiere variantes relacionadas con el tamaño del corpus y con la semilla (`ppt`, `Dp-100mb`, `seed10`), pero esa nomenclatura no está explicada en la ficha. La ejecución está registrada en un run público de Weights & Biases dentro del proyecto `new_tokenizers`, lo que apunta a un contexto de investigación sobre tokenización y modelos de bajo recurso.

## Capacidades

- Generación de texto autoregresiva en formato de completado y de conversación: el ejemplo oficial usa `pipeline("text-generation")` con una lista de mensajes `{"role": "user", "content": ...}`, lo que implica una plantilla de chat aplicada durante el SFT.
- Respuesta a preguntas abiertas de tipo opinión o reflexión, en el estilo del prompt de ejemplo de la model card.
- Ajuste reproducible: al derivar de un modelo base público y documentar versiones de librerías y semilla, permite replicar experimentos de fine-tuning.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso, uso de navegador o ejecución de código.
- No hay evidencia de visión, audio ni modo de razonamiento explícito (thinking mode).
- Cobertura multilingüe: no disponible. El modelo base está orientado a un único idioma según su identificador.
- Compatible con text-generation-inference y con endpoints gestionados, según las etiquetas del repositorio.

## Casos de uso

- Prototipado de pipelines de generación de texto: por su tamaño de 39 M de parámetros se carga en segundos en CPU, lo que permite validar plantillas de prompt, plantillas de chat y lógica de post-procesado antes de pasar a un modelo mayor.
- Investigación en procesamiento de lenguas de bajos recursos: sirve como punto de partida reproducible (semilla y versiones de librerías documentadas) para estudiar el efecto del SFT sobre un modelo monolingüe entrenado con solo 10 MB de texto.
- Experimentos de tokenización: el run asociado pertenece al proyecto `new_tokenizers` de Weights & Biases, de modo que este checkpoint encaja en estudios comparativos de vocabularios y segmentación para el tamil.
- Aumento de datos sintéticos a pequeña escala: generar borradores de texto corto para aumentar corpus de entrenamiento o evaluación, siempre con revisión humana y filtrado posterior.
- Despliegue en entornos con recursos mínimos: al ocupar del orden de decenas de megabytes cuantizado, cabe en dispositivos edge, contenedores pequeños o funciones serverless con CPU, útil para demos internas y pruebas de integración.
- Docencia y formación: ejemplo didáctico de ciclo completo de ajuste fino con TRL, desde el modelo base hasta el checkpoint publicable, con trazabilidad de hiperparámetros vía W&B.
- Pruebas de regresión de infraestructura: modelo de coste despreciable para verificar el funcionamiento de un endpoint compatible con la API de Hugging Face, comprobar tiempos de arranque o validar plantillas de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: en fp32, los 39.087.104 parámetros ocupan aproximadamente 156 MB; en fp16 o bf16, unos 78 MB; en int8, unos 39 MB; en 4 bits, alrededor de 20 MB. Hay que sumar el overhead de activaciones, caché KV y runtime, pero el total se mantiene muy por debajo de 1 GB en cualquier precisión habitual.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente. Funciona en RTX 3060, RTX 4060, RTX 4090, T4, L4, A100 y H100, aunque en estas dos últimas el modelo desaprovecha por completo la capacidad de cómputo.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida.
- CPU: la inferencia en CPU es viable y probablemente sea el modo de despliegue más razonable para este tamaño.
- Opciones de despliegue: `transformers` con `pipeline`, text-generation-inference (la etiqueta `endpoints_compatible` lo indica), y conversión a GGUF para llama.cpp u Ollama, aunque no se publican pesos GGUF oficiales.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `fpadovani/tam-taml-10mb-ppt-Dp-100mb_seed10` | 39.087.104 | No disponible | No disponible | Hugging Face, 0 descargas | Ajuste SFT del modelo Goldfish tamil |
| `goldfish-models/tam_taml_10mb` | No disponible | No disponible | No disponible | Hugging Face (modelo base) | Modelo monolingüe entrenado con 10 MB de texto |
| Otros checkpoints Goldfish de 10 MB | No disponible | No disponible | No disponible | Hugging Face | Misma receta por idioma; no se dispone de datos comparativos en la información proporcionada |
| Modelos GPT-2 pequeños de propósito general | No disponible | No disponible | No disponible | Hugging Face | No se ha identificado un comparable directo con datos verificables en la información disponible |

No hay datos de benchmarks ni fichas comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Tamaño muy reducido: con 39 M de parámetros y un modelo base entrenado con 10 MB de texto, la coherencia en generaciones largas es limitada y la tasa de alucinación en preguntas factuales es previsiblemente alta.
- Sin evaluación publicada: no hay benchmarks, por lo que no puede verificarse la calidad frente a alternativas.
- Dataset de ajuste no documentado: se desconoce su composición, licencia, idioma e idioma de las instrucciones, lo que impide auditar sesgos y riesgo de contaminación.
- Licencia indefinida: la model card solo indica `licence: license` sin términos concretos. No debe asumirse uso comercial permitido; hay que contactar con el autor antes de cualquier despliegue productivo.
- Contexto no especificado: se desconoce la longitud de contexto efectiva, un dato crítico para decidir si sirve en conversaciones multi-turno.
- Idiomas no declarados: aunque el nombre apunta al tamil, no hay confirmación oficial, y no se garantiza calidad en castellano ni en otros idiomas.
- Ausencia de alineación avanzada: al ser solo SFT, sin RLHF ni DPO, no hay garantías de comportamiento seguro ante prompts maliciosos y puede reproducir contenido sesgado o inapropiado del corpus.
- Riesgo de memorización: si el dataset de ajuste es pequeño (el nombre sugiere un orden de 100 MB), el modelo podría reproducir fragmentos literales de los datos de entrenamiento.
- Madurez del repositorio: 0 descargas y 0 likes, sin comunidad que haya validado su comportamiento.
- No apto para tareas de razonamiento, matemáticas, código o agentes: no hay evidencia de ninguna de estas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/tam-taml-10mb-ppt-Dp-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/tam_taml_10mb
- Organización Goldfish: https://huggingface.co/goldfish-models
- Repositorio de TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/vwu07ix4
