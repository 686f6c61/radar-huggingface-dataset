# OmAr-Kader-DeV/starcoder2-3b-mlx-8Bit

## Resumen

OmAr-Kader-DeV/starcoder2-3b-mlx-8Bit es una conversión al formato MLX (Apple Machine Learning) del modelo de generación de código StarCoder2-3B, desarrollado originalmente por el equipo BigCode. Esta versión cuantiza los pesos a 8 bits, lo que reduce el tamaño del modelo y lo hace más eficiente para inferencia en dispositivos Apple Silicon y otras plataformas compatibles con MLX. El modelo base, StarCoder2-3B, es un decoder transformer de 3 mil millones de parámetros entrenado sobre más de 600 lenguajes de programación a partir del dataset The Stack v2, con una ventana de contexto de 16 384 tokens y atención por ventana deslizante de 4096 tokens.

La relevancia de esta conversión radica en que permite ejecutar un modelo de código de calidad en hardware de consumo, especialmente en Macs con chips M-series, sin necesidad de GPUs dedicadas. Al estar cuantizado a 8 bits, el modelo ocupa aproximadamente 3.4 GB en disco, lo que lo hace viable para entornos con memoria limitada. Aunque no introduce nuevas capacidades respecto al modelo original, facilita su despliegue en aplicaciones locales de asistencia a la programación, autocompletado y generación de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con Grouped Query Attention (GQA) y sliding window attention |
| Parametros totales | 3B (modelo base) - el archivo safetensors reporta 853 036 032, posible error de metadatos |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 16 384 tokens (ventana deslizante de 4096) |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | Codigo en mas de 600 lenguajes de programacion; texto natural limitado (Wikipedia, Arxiv, GitHub issues) |
| Licencia | BigCode OpenRAIL-M |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base StarCoder2-3B emplea una arquitectura transformer decoder estándar con Grouped Query Attention (GQA) para reducir el coste de memoria durante la inferencia, y una ventana de atención deslizante de 4096 tokens que permite manejar secuencias largas de hasta 16 384 tokens. Fue entrenado con el objetivo Fill-in-the-Middle (FIM), lo que le permite completar código en medio de un contexto, además de la generación autoregresiva convencional. El dataset de entrenamiento, The Stack v2, incluye código de más de 600 lenguajes, junto con texto natural de Wikipedia, Arxiv y GitHub issues, sumando más de 3 billones de tokens.

Esta conversión concreta no modifica la arquitectura ni los pesos del modelo original; simplemente los transforma al formato MLX y los cuantiza a 8 bits mediante la herramienta mlx-lm (versión 0.31.2). La cuantización reduce la precisión de los pesos de 16/32 bits a 8 bits, lo que disminuye el uso de memoria y acelera la inferencia en hardware compatible, a costa de una ligera pérdida de calidad en las salidas.

## Capacidades

- Generacion de codigo: autocompletado, generacion de funciones, clases y scripts en multiples lenguajes.
- Fill-in-the-Middle: completar codigo en medio de un fragmento, util para editores y IDEs.
- Razonamiento basico sobre codigo: puede explicar fragmentos simples y detectar errores evidentes.
- Soporte de tool calling: no disponible de forma nativa en el modelo base.
- Capacidades multilingues: mas de 600 lenguajes de programacion, aunque con rendimiento variable segun la representacion en el dataset.
- No incluye capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Autocompletado en editores de codigo: el modelo puede integrarse en plugins de VS Code o Neovim para sugerir continuaciones de lineas y bloques, aprovechando su ventana de 16k tokens para mantener el contexto del archivo abierto.
- Asistente de programacion local: ejecutable en un Mac con chip M1/M2/M3 mediante MLX, permite consultas sobre sintaxis, generacion de funciones auxiliares o refactorizacion de fragmentos cortos sin enviar datos a la nube.
- Generacion de tests unitarios: dado un fragmento de codigo, el modelo puede proponer casos de prueba simples, aunque su precision es limitada en logica compleja.
- Educacion y aprendizaje: util para estudiantes que quieren ejemplos de codigo en lenguajes poco comunes, gracias a su amplia cobertura de lenguajes.
- Prototipado rapido: generar esqueletos de aplicaciones o scripts de automatizacion a partir de descripciones breves en lenguaje natural.
- Procesamiento por lotes en CI/CD: al ser ligero (3B, 8-bit), puede desplegarse en runners de CI para tareas de generacion de documentacion o formateo de codigo, aunque no es adecuado para tareas de razonamiento profundo.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (model-index de la model card):

| Benchmark | Metrica | Valor |
|---|---|---|
| HumanEval | pass@1 | 31.7 |
| HumanEval+ | pass@1 | 27.4 |
| CruxEval-I | pass@1 | 32.7 |
| DS-1000 | pass@1 | 25.0 |
| GSM8K (PAL) | accuracy | 27.7 |
| RepoBench-v1.1 | edit-similarity | 71.19 |

Estos valores corresponden al modelo base StarCoder2-3B, no a la version cuantizada. La cuantizacion a 8 bits puede degradar ligeramente estas metricas, aunque no se han publicado mediciones especificas para esta conversion.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 3B con cuantizacion 8-bit, el uso de memoria ronda los 3-4 GB durante la inferencia, dependiendo de la longitud de la secuencia.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o Apple Silicon con memoria unificada de 8 GB o mas).
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama de entrada y en Macs con chip M1 o superior.
- Opciones de despliegue: mlx-lm (para Apple Silicon), tambien puede convertirse a GGUF para usar con llama.cpp u Ollama, o ejecutarse con transformers en CPU/GPU.
- Latencia y throughput: no se han publicado mediciones especificas para esta conversion; en un Mac M2, se espera una generacion de 10-20 tokens por segundo con secuencias cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval (pass@1) | Licencia | Formato |
|---|---|---|---|---|---|
| starcoder2-3b (base) | 3B | 16k | 31.7 | OpenRAIL-M | safetensors |
| CodeLlama-7B | 7B | 16k | 30.5 | Llama 2 license | safetensors |
| DeepSeek-Coder-1.3B | 1.3B | 16k | 28.6 | MIT | safetensors |
| starcoder2-3b-mlx-8Bit (este) | 3B | 16k | 31.7 (base) | OpenRAIL-M | MLX 8-bit |

La comparativa muestra que este modelo, a pesar de su tamano reducido, rinde a la par de modelos mas grandes como CodeLlama-7B en HumanEval, y supera a DeepSeek-Coder-1.3B. Su ventaja principal es la eficiencia en memoria gracias a la cuantizacion MLX.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento sobre The Stack v2 puede reflejar sesgos presentes en el codigo publico, como subrepresentacion de ciertos lenguajes o estilos de programacion.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar codigo sintacticamente valido pero semanticamente incorrecto, especialmente en logica compleja o APIs poco comunes.
- Limitaciones de contexto: aunque soporta 16k tokens, la ventana deslizante de 4096 limita la atencion a largo plazo; fragmentos muy largos pueden perder informacion relevante.
- Restricciones de licencia: BigCode OpenRAIL-M permite uso comercial, pero impone restricciones de uso para fines militares o de vigilancia masiva.
- Caveat de cuantizacion: la conversion a 8-bit puede degradar la precision en tareas de razonamiento o generacion de codigo complejo; se recomienda evaluar en el caso de uso concreto.
- El numero de parametros reportado en el archivo safetensors (853M) no coincide con los 3B del modelo base; se recomienda verificar la integridad de la conversion antes de usarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OmAr-Kader-DeV/starcoder2-3b-mlx-8Bit
- Modelo base: https://huggingface.co/bigcode/starcoder2-3b
- Repositorio oficial de StarCoder2: https://github.com/bigcode-project/starcoder2
- Documentacion de mlx-lm: https://github.com/ml-explore/mlx-lm
- Pagina de StarCoder2-3B en Fireworks AI: https://fireworks.ai/models/fireworks/starcoder2-3b
