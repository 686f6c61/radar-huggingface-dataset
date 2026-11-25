# c4tdr0ut/Azazel-24B

## Resumen

Azazel-24B es un checkpoint de lenguaje de 23.572.403.200 parámetros (aproximadamente 23,6 mil millones) publicado por el usuario c4tdr0ut en Hugging Face. Se trata de una variante "uncensored" (sin mecanismos de rechazo) construida a partir del modelo `c4tdr0ut/Azazel-24B-RL` mediante una técnica denominada Apostate, que aplica lo que el autor llama "diode path": una abliteración direccional condicional que reutiliza una neurona MLP por capa como restador de la dirección de rechazo, activándose solo cuando un detector calibrado con entradas benignas supera un umbral.

El modelo se distribuye como un checkpoint estándar de Transformers en formato safetensors y precisión bfloat16, sin hooks en tiempo de ejecución, adaptadores, fine-tuning adicional ni enrutador. La edición afecta a 23 de las 40 capas del modelo base, con una fuerza de 6.0 y un objetivo de activación benigna de 0.05. El repositorio ocupa 47,2 GB.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de ~24B derivado de la familia Mistral (según los tags del repositorio) orientado a eliminar los mecanismos de rechazo; por otro lado, advierte de que se trata de un artefacto sin model card técnica completa, sin licencia declarada, sin idiomas especificados y sin benchmarks publicados, lo que limita seriamente su evaluación rigurosa y su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Mistral, según tags del repositorio); detalles no disponibles |
| Parámetros totales | 23.572.403.200 (~23,6 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint publicado en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo base es `c4tdr0ut/Azazel-24B-RL`, del que no se proporcionan detalles sobre arquitectura interna, número de tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras. Los tags del repositorio indican "mistral", lo que sugiere una arquitectura de la familia Mistral, pero no se confirma la variante exacta ni el contexto máximo soportado. El checkpoint final tiene 40 capas según la model card.

La innovación técnica declarada es el método Apostate en su variante "diode": una abliteración direccional condicional que, en lugar de restar de forma permanente la dirección de rechazo de los pesos, reasigna una neurona MLP por capa como un restador con compuerta. Un detector calibrado con entradas benignas decide cuándo se activa la resta, de modo que las entradas benignas conservan los pesos originales. La edición se aplicó a 23 de las 40 capas con fuerza 6.0 y un objetivo de activación benigna de 0.05. Según el autor, las métricas de delivery (tasa de respuesta a peticiones dañinas) y KL (divergencia respecto al modelo base) se miden por separado con la herramienta `apostate test`, y los ajustes de edición quedan registrados en `diode_report.json`. No se aportan los valores de esas métricas en la información disponible.

## Capacidades

- Generación de texto autoregresiva mediante la API estándar de Transformers (`AutoModelForCausalLM`).
- Respuesta a peticiones que el modelo base rechazaría, al haberse eliminado condicionalmente la dirección de rechazo en 23 de 40 capas.
- No se documentan capacidades específicas de razonamiento, código, matemáticas, visión o audio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como artefacto de estudio para analizar cómo la abliteración condicional afecta a la tasa de rechazo y a la divergencia KL respecto al modelo base, usando `apostate test` para medir ambos ejes.
- Evaluación de técnicas de edición de pesos: permite reproducir y auditar el método Apostate (diode) comparando el comportamiento del checkpoint editado con el del modelo base `Azazel-24B-RL`.
- Generación de texto creativo sin filtros: para entornos controlados de escritura de ficción o guiones donde se requiera evitar rechazos del modelo, siempre con revisión humana y sin exposición a usuarios finales.
- Red teaming interno: uso como modelo adversario para probar clasificadores de contenido, filtros de salida y sistemas de moderación en pipelines propios.
- Experimentación con cuantización: al ser un checkpoint estándar en bfloat16, puede convertirse a GGUF u otros formatos para estudiar el impacto de la cuantización en modelos editados por abliteración.
- Docencia y formación en seguridad de IA: como ejemplo práctico de qué es la abliteración, cómo se implementa una compuerta condicional y qué riesgos introduce en el despliegue de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 47 GB solo para los pesos, más memoria para el contexto y el runtime; en la práctica, se necesitan GPUs de 80 GB (A100, H100) o configuraciones multi-GPU.
- Cuantización: no se documentan cuantizaciones oficiales; una conversión a 8 bits reduciría los pesos a ~24 GB y a 4 bits a ~12-13 GB, aunque no hay datos publicados sobre la degradación resultante.
- GPU recomendadas: A100 80 GB, H100 80 GB o varias GPUs de 24 GB (RTX 4090, L40S) con reparto de tensores; no cabe en una única GPU de consumo en bfloat16.
- Opciones de despliegue: Transformers con `device_map="auto"` (método indicado en la model card); vLLM, TGI, llama.cpp u Ollama no están confirmados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Azazel-24B (este) | ~23,6 B | no disponible | no disponible | Hugging Face, safetensors bf16 |
| Azazel-24B-RL (base) | no disponible | no disponible | no disponible | Hugging Face, referencia en la model card |
| Mistral Small (familia Mistral) | ~24 B | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo es explícitamente "uncensored" y, según su propia model card, responderá a peticiones dañinas y peligrosas; el autor declara que la responsabilidad del uso recae en el usuario.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; en la práctica, debe tratarse como no apto para producción hasta aclarar la licencia.
- No se especifican idiomas soportados, contexto máximo ni composición del entrenamiento, lo que impide evaluar sesgos lingüísticos o culturales.
- Riesgo elevado de alucinación y de generar contenido dañino, agravado por la eliminación de la dirección de rechazo en 23 de 40 capas.
- No hay benchmarks, métricas de delivery ni valores de KL publicados; las afirmaciones sobre el comportamiento del "diode" no están verificadas de forma independiente en la información disponible.
- El método de edición reutiliza neuronas MLP como compuertas, lo que puede degradar capacidades no medidas (razonamiento, código, matemáticas) sin que existan evaluaciones que lo cuantifiquen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- No debe desplegarse en aplicaciones orientadas a usuarios finales sin capas adicionales de moderación y sin una evaluación de seguridad propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/c4tdr0ut/Azazel-24B
- Modelo base: https://huggingface.co/c4tdr0ut/Azazel-24B-RL
- Herramienta Apostate: https://github.com/heterodoxin/apostate
