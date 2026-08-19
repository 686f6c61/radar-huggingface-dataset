# balalida/gpt-22M-tinystories

## Resumen

El modelo `balalida/gpt-22M-tinystories` es un transformer decoder-only de 22,7 millones de parámetros, desarrollado como parte de la asignatura CS336 de Stanford (Assignment 1). Está entrenado exclusivamente sobre el dataset TinyStories, una colección de relatos cortos en inglés para niños, con el objetivo de demostrar que modelos muy pequeños pueden generar texto coherente y creativo si se entrenan con datos apropiados. Su relevancia radica en ser un ejemplo didáctico de implementación de un modelo causal de lenguaje desde cero, con una arquitectura moderna (RMSNorm, RoPE, SwiGLU) y un tokenizador BPE a nivel de byte.

Con una ventana de contexto de 256 tokens y una pérdida de validación de 1,3898 por token, el modelo es capaz de producir historias breves y gramaticalmente aceptables, aunque con limitaciones evidentes de coherencia a largo plazo. Está pensado para fines educativos y de experimentación, no para uso en producción. Su tamaño reducido permite ejecutarlo en cualquier hardware, incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (4 capas, 16 cabezas, width 512, SwiGLU 1344, RMSNorm, RoPE) |
| Parametros totales | 22.696.448 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | ingles (entrenado exclusivamente con TinyStories) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 4 capas con ancho de 512, 16 cabezas de atencion, feed-forward SwiGLU de 1344 unidades, normalizacion RMSNorm y embeddings posicionales rotatorios (RoPE). El tokenizador es un BPE a nivel de byte, lo que permite manejar cualquier secuencia de texto sin vocabulario fijo. Los embeddings de entrada y la cabeza de salida no comparten pesos.

Se entreno durante 311.296.000 tokens (equivalente a varias epocas sobre TinyStories, aunque el numero exacto de epocas no se especifica). La perdida de validacion alcanzada es de 1,3898 por token. No se menciona el uso de RLHF, DPO ni ninguna tecnica de alineacion adicional. El entrenamiento se realizo como parte de la tarea 1 de CS336, por lo que el objetivo principal es didactico: implementar un LM causal completo con tecnicas modernas.

## Capacidades

- Generacion de texto: produce relatos cortos en ingles coherentes a nivel de frase, con estructura narrativa basica.
- Razonamiento: limitado a patrones simples extraidos de historias infantiles; no apto para tareas de razonamiento complejo.
- Codigo: no soportado.
- Matematicas: no soportado.
- Tool calling / function calling: no soportado.
- Agentes y multi-step reasoning: no soportado.
- Multilingue: no, solo ingles.
- Capacidades especiales: ninguna (sin vision, audio ni modo thinking).

## Casos de uso

- Educacion en IA: sirve como ejemplo practico para estudiantes que quieran entender el entrenamiento de un transformer causal desde cero, incluyendo tokenizacion BPE, atencion con RoPE y normalizacion RMSNorm.
- Investigacion en modelos pequenos: permite estudiar el limite inferior de tamano para generar texto coherente, comparando con modelos de 89M o 125M parametros.
- Generacion de historias infantiles: puede usarse como base para una aplicacion de cuentos cortos, aunque con supervision humana debido a sus limitaciones.
- Prototipado rapido: al ser muy ligero, se puede integrar en demos o notebooks para probar tecnicas de generacion (sampling, top-p, temperatura) sin necesidad de GPU.
- Benchmark de eficiencia: sirve para medir latencia y consumo en CPU o microcontroladores, dado su tamano reducido.
- Pruebas de tecnicas de cuantizacion o destilacion: al ser un modelo pequeno, es un candidato ideal para experimentar con pruning, cuantizacion o distillation hacia modelos aun menores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado es la perdida de validacion de 1,3898 por token sobre TinyStories. No se proporcionan comparaciones con otros modelos en terminos de metricas estandarizadas.

## Requisitos de hardware

- VRAM estimada: menos de 100 MB en FP32 (22,7M parametros × 4 bytes ≈ 91 MB). Con cuantizacion a int8 o int4, el consumo seria aun menor.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso una GTX 1050 o una GPU integrada pueden ejecutarlo sin problemas.
- CPU: se puede ejecutar en CPU sin GPU, con latencia de milisegundos por token en hardware moderno.
- Opciones de despliegue: compatible con la libreria `transformers` de HuggingFace, por lo que puede usarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se exporta) o directamente en Python.
- Latencia y throughput: no se han publicado mediciones oficiales, pero dado el tamano, se espera una generacion de decenas de tokens por segundo en CPU y cientos en GPU.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos de la misma categoria (p. ej., GPT-2 small fine-tuned en TinyStories, o modelos de ~22M entrenados en el mismo dataset). La informacion disponible no incluye benchmarks estandarizados ni metricas de otros modelos que permitan una comparacion cuantitativa. Se puede indicar que existen otros modelos TinyStories en HuggingFace (como `Fathi7ma/tiny-stories-gpt2` o `abhilash88/tinystories-slm-gpt`), pero no se han encontrado datos de rendimiento comparables.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse exclusivamente con TinyStories, el modelo refleja el vocabulario y los temas de historias infantiles en ingles; no es adecuado para dominios tecnicos o cientificos.
- Riesgo de alucinacion: el propio autor advierte que el modelo puede alucinar, repetir frases o producir informacion incorrecta, especialmente fuera del dominio de historias simples.
- Limitaciones de contexto: la ventana de 256 tokens restringe la coherencia a parrafos muy cortos; no puede mantener hilos narrativos largos.
- Limitaciones de idioma: solo ingles; no soporta otros idiomas.
- Restricciones de licencia: la licencia no esta especificada, por lo que se desconoce si permite uso comercial. Se recomienda contactar al autor antes de cualquier uso en produccion.
- Caveat para produccion: es un modelo educativo, no disenado para aplicaciones reales. No debe usarse como componente critico sin una evaluacion exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/balalida/gpt-22M-tinystories
- Paper TinyStories (arXiv): https://arxiv.org/abs/2305.07759
- Repositorio CS336 (referencia de la asignatura): no disponible en la informacion proporcionada
- Otros modelos TinyStories en HuggingFace: https://huggingface.co/Fathi7ma/tiny-stories-gpt2, https://huggingface.co/abhilash88/tinystories-slm-gpt
