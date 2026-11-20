# Outlier-Ai/DeepSeek-R1-Distill-Qwen-14B-MLX-4bit

## Resumen

DeepSeek-R1-Distill-Qwen-14B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo DeepSeek-R1-Distill-Qwen-14B, publicada por Outlier-Ai para su ejecución local en Apple Silicon. El modelo original es un destilado de DeepSeek-R1 sobre la base Qwen2 de 14B parámetros, entrenado para generar cadenas de razonamiento explícitas (chain-of-thought) antes de responder. Esta conversión no altera los pesos originales: solo cambia el formato en disco a safetensors MLX 4-bit con grupo de cuantización de 64 y simetría, manteniendo tokenizer y plantilla de chat.

La relevancia de esta ficha es práctica: permite ejecutar un modelo de razonamiento de 14B parámetros en Macs con memoria unificada moderada, sin conexión a la nube, con un peso en disco de 8,3 GB. Está pensado para desarrolladores que quieren probar razonamiento multi-paso, matemáticas y generación de código en local, y para investigadores que necesitan reproducibilidad offline en hardware Apple.

El modelo conserva la licencia MIT del modelo base y soporta diez idiomas declarados (inglés, chino, francés, español, portugués, alemán, ruso, japonés, coreano y árabe). La conversión está etiquetada como compatible con `mlx-lm` 0.31.x y no se distribuye como parte de la app Outlier, sino como conversión independiente publicada por el equipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), destilado de razonamiento de DeepSeek-R1 |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit MLX (group size 64, simetrica) |
| Idiomas soportados | en, zh, fr, es, pt, de, ru, ja, ko, ar |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX 4-bit, shards multiples) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen2 con 14.770.033.664 parámetros, sobre el que DeepSeek aplicó un proceso de destilación a partir de DeepSeek-R1. El objetivo del destilado es transferir el comportamiento de razonamiento explícito del modelo profesor (generación de cadenas de pensamiento antes de la respuesta final) a un modelo de menor tamaño. La model card de esta conversión no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base y no se reproducen aquí.

La innovación técnica de esta publicación concreta es exclusivamente de formato: conversión a MLX 4-bit con grupo de cuantización de 64 y cuantización simétrica, empaquetado en safetensors con `config.json`, tokenizer y `chat_template.jinja`. No se introducen cambios en la arquitectura, en el vocabulario ni en el comportamiento del modelo más allá de la pérdida de precisión inherente a la cuantización a 4 bits. La model card indica compatibilidad con `mlx-lm` 0.31.x y que los pesos originales y la licencia se preservan.

## Capacidades

- Generación de texto conversacional con plantilla de chat incluida (`chat_template.jinja`).
- Razonamiento multi-paso con cadena de pensamiento explícita (etiquetas `thinking` y `chain-of-thought` en la model card).
- Resolución de problemas matemáticos y de lógica, con ejemplos publicados en la model card (problema de las máquinas y los widgets, rejilla lógica, problema de trenes).
- Generación de código, según las etiquetas del repositorio y la naturaleza del modelo base.
- Soporte declarado de function calling / tool calling mediante etiqueta `function-calling`.
- Capacidades multilingües en diez idiomas: inglés, chino, francés, español, portugués, alemán, ruso, japonés, coreano y árabe.
- Ejecución local y offline en Apple Silicon (etiquetas `no-cloud`, `offline`, `on-device`, `private`).
- Compatibilidad con `mlx-lm` para carga directa en Python y CLI.

## Casos de uso

- Razonamiento matemático asistido en local: el modelo puede resolver problemas de álgebra, aritmética y lógica paso a paso mostrando el razonamiento, útil para herramientas educativas o de verificación que deben funcionar sin conexión y sin enviar datos a terceros.
- Asistente de programación offline en Mac: con soporte de function calling y generación de código, se puede integrar en editores o scripts locales para autocompletado, explicación de fragmentos y generación de tests, aprovechando que los pesos residen en disco y no requieren API.
- Análisis de documentos confidenciales: al ejecutarse en el dispositivo, permite procesar textos sensibles (legal, sanitario, financiero) sin salida a la nube, siempre que el contexto quepa en la ventana del modelo.
- Prototipado de agentes multi-paso: la cadena de pensamiento explícita y el soporte de tool calling permiten construir bucles de razonamiento-acción en local para pruebas de concepto antes de migrar a infraestructura mayor.
- Atención al cliente en despliegues privados: conversaciones multi-turno en varios idiomas (incluido español) en entornos donde no se permite enviar datos a servicios externos, con la salvedad de que la longitud de contexto no está documentada en esta ficha.
- Investigación en reproducibilidad: investigadores que necesitan ejecutar el mismo modelo con pesos fijos y sin dependencia de APIs pueden usar esta conversión para experimentos controlados en hardware Apple.
- Evaluación comparativa de cuantización: sirve como referencia para medir la degradación de un modelo de razonamiento de 14B al pasar a 4 bits MLX frente al modelo original en bf16/fp16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `outlier.host/benchmarks` para cifras de MMLU, HumanEval y tok/s en Macs de la serie M, pero no incluye los valores en el repositorio ni en la información proporcionada, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 8,3 GB en disco en formato 4-bit; se recomienda al menos 10-12 GB de memoria unificada libre para cargar el modelo y mantener contexto, aunque la cifra exacta no está publicada.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4), incluidos MacBook Air, MacBook Pro, Mac mini y Mac Studio, según las etiquetas del repositorio.
- GPU dedicadas (A100, H100, RTX 4090): no aplica directamente, ya que el formato MLX está pensado para Metal en Apple Silicon; para CUDA habría que usar otra conversión del modelo base.
- Cabe en GPU de consumo Apple: sí, en configuraciones con memoria unificada suficiente; en Macs de 8 GB el margen es muy ajustado y puede requerir reducir contexto.
- Opciones de despliegue: `mlx-lm` (CLI y API Python), app Outlier para macOS, y cualquier cargador compatible con MLX 4-bit.
- Latencia y throughput: no disponibles en la información proporcionada; la model card remite a la página de benchmarks del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-14B-MLX-4bit (este) | 14,77B | no disponible | MLX 4-bit safetensors | MIT | Conversion para Apple Silicon, 8,3 GB en disco |
| DeepSeek-R1-Distill-Qwen-7B-MLX-4bit (Outlier-Ai) | ~7B | no disponible | MLX 4-bit safetensors | MIT | Menor huella, menor capacidad de razonamiento |
| DeepSeek-R1-Distill-Qwen-32B-MLX-4bit (Outlier-Ai) | ~32B | no disponible | MLX 4-bit safetensors | MIT | Mayor calidad esperada, requiere más memoria unificada |
| DeepSeek-R1-Distill-Llama-8B-MLX-4bit (Outlier-Ai) | ~8B | no disponible | MLX 4-bit safetensors | MIT | Base Llama en lugar de Qwen2; tamaño intermedio |

Los datos de rendimiento comparado no están disponibles en la información proporcionada; la comparación se limita a tamaño, formato y licencia.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce pérdida de precisión respecto al modelo original; en tareas de razonamiento matemático y código los errores pueden aumentar, especialmente en cadenas de pensamiento largas.
- Riesgo de alucinación inherente a los modelos de lenguaje; la cadena de pensamiento explícita no garantiza que el razonamiento sea correcto, solo que es visible.
- La longitud de contexto no está documentada en esta ficha; para despliegues en producción hay que consultar la model card del modelo base antes de asumir ventanas largas.
- El soporte multilingüe está declarado por etiquetas, pero no hay evaluación publicada por idioma; el rendimiento en español, árabe o coreano puede ser inferior al de inglés y chino.
- La licencia MIT permite uso comercial, pero se hereda del modelo base; conviene revisar la model card original de DeepSeek para cualquier restricción adicional.
- El formato MLX está atado a Apple Silicon; no es portable a CUDA sin reconversión.
- La model card advierte que esta conversión no se distribuye con la app Outlier y que las cifras citadas provienen de experimentos internos, no de tests de release.
- En Macs con 8 GB de memoria unificada el modelo puede no caber con contexto útil; verificar memoria libre antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-14B-MLX-4bit
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Conversión 7B: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Conversión 32B: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-32B-MLX-4bit
- Conversión Llama 8B: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Llama-8B-MLX-4bit
- Outlier-Core-27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier-Nano-4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- App Outlier: https://outlier.host/
- Benchmarks del autor: https://outlier.host/benchmarks
