# Solstice-AI/DeepSeek-V4-Flash-Vision-Exp-mlx-oQ8e

## Resumen

DeepSeek-V4-Flash-Vision-Exp-mlx-oQ8e es una version cuantizada en precision mixta del modelo multimodal DeepSeek-V4-Flash-Vision-Exp, desarrollado por DeepSeek-AI y empaquetado por Solstice-AI para su ejecucion nativa en Apple Silicon mediante MLX. Se trata de un modelo experimental de la familia DeepSeek-V4 que combina un backbone MoE (Mixture of Experts) de 284.000 millones de parametros totales con una torre de vision de 32 capas y un alineador multimodal, lo que le permite procesar tanto texto como imagenes. La cuantizacion oQ8e (oMLX Universal Dynamic Quantization) reduce el peso del modelo a aproximadamente 8,6 bits por parametro, manteniendo las capas criticas a mayor precision para preservar la calidad en tareas de enrutamiento de expertos, atencion y vision.

El modelo destaca por su ventana de contexto nativa de 1.048.576 tokens (1 millon), lograda mediante escalado YaRN, y por integrar mecanismos de prediccion multiple de tokens (MTP) y decodificacion especulativa con el modulo DSpark. Esta version esta pensada para desplegarse en equipos Apple Silicon con memoria unificada, ofreciendo hasta 31 tokens por segundo segun la model card. Su licencia MIT permite uso comercial, pero los idiomas soportados se limitan a ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (DeepSeek-V4-Flash con torre de vision ViT de 32 capas y alineador multimodal) |
| Parametros totales | 304.646.824.126 (segun safetensors; la model card indica 284B total) |
| Parametros activos | ~13.000.000.000 (13B) activos por token |
| Longitud de contexto | 1.048.576 tokens (1M), con escalado YaRN (factor 16, rope_theta 10000) |
| Tipos de cuantizacion | oQ8e (oMLX Universal Dynamic Quantization), ~8,6 bits por parametro, base 8-bit affine con group_size=64 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (oMLX oQ8e) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura DeepSeek-V4-Flash, un transformer basado en MoE con 256 expertos enrutados y aproximadamente 13.000 millones de parametros activos por token. Sobre esta base se anade una torre de vision de 32 capas (ViT) y un alineador multimodal, tras un proceso de entrenamiento continuado para habilitar la comprension visual. La ventana de contexto se extiende de 65.536 tokens originales a 1.048.576 mediante escalado YaRN, con factor 16 y rope_theta 10000.

En cuanto a innovaciones tecnicas, el modelo incorpora prediccion multiple de tokens (MTP) y un modulo de decodificacion especulativa denominado DSpark, que acelera la generacion. La version de Solstice-AI aplica una cuantizacion mixta oQ8e que protege en precision completa o 8-bit las capas de enrutamiento y compuertas MoE, el lm_head, la torre de vision, los attention sinks y las tablas de hiperconexion. Las proyecciones de atencion sensibles reciben aumentos dinamicos de precision basados en gradientes de error de Hessian, mientras que los expertos enrutados se mantienen en 8-bit para maximizar el rendimiento en memoria unificada.

## Capacidades

- Generacion de texto y razonamiento multimodal (image-text-to-text).
- Comprension visual avanzada: analisis de documentos, graficos y diagramas.
- Razonamiento matematico de nivel alto, incluidos problemas de olimpiada y examenes AIME.
- Generacion y comprension de codigo, con resultados competitivos en benchmarks de programacion.
- Capacidad de interaccion con terminal y ejecucion de comandos, segun los resultados en Terminal-Bench.
- Soporte de contexto largo de hasta 1 millon de tokens, util para documentos extensos y conversaciones multi-turno.
- Decodificacion especulativa integrada mediante DSpark y prediccion multiple de tokens (MTP).
- Multilingue en ingles y chino.
- No se especifica en la informacion proporcionada soporte explicito de tool calling o function calling, aunque los resultados en benchmarks de agentes sugieren capacidades de ejecucion de comandos.

## Casos de uso

- Analisis de documentos y graficos en entornos corporativos: gracias a su puntuacion del 92,3% en DocVQA/ChartQA, el modelo puede extraer datos de informes financieros, graficos de ventas y documentos tecnicos complejos, tanto en formato de imagen como de texto.
- Asistente de programacion en terminal: con un 83,9% en Terminal-Bench, el modelo puede ejecutar comandos, depurar scripts y automatizar tareas de linea de comandos, lo que lo hace util para desarrolladores que trabajan en entornos Unix.
- Desarrollo de software a nivel de repositorio: el 65,8% en SWE-bench Verified indica que puede resolver problemas reales de ingenieria de software, como corregir errores en repositorios existentes o implementar funcionalidades nuevas.
- Generacion de codigo competitivo: con un 84,2% en LiveCodeBench v6, es adecuado para tareas de programacion algoritmica, preparacion de entrevistas tecnicas o prototipado rapido de algoritmos.
- Soporte educativo de matematicas: los resultados del 94,6% en MATH-500 y del 78,2% en AIME 2025 permiten utilizarlo como tutor de matematicas de nivel escolar y universitario, explicando pasos intermedios y resolviendo problemas de olimpiada.
- Asistente multimodal privado en Apple Silicon: al ejecutarse localmente con MLX, puede procesar imagenes y texto sin enviar datos a servidores externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Traduccion y conversacion bilingue ingles-chino: el modelo soporta ambos idiomas de forma nativa, por lo que puede emplearse en aplicaciones de atencion al cliente o traduccion asistida en estos dos mercados.

## Benchmarks y rendimiento

Los siguientes datos se han extraido de la model card publicada por Solstice-AI y corresponden a la version cuantizada DeepSeek-V4-Flash MLX. Se comparan con Claude 3.5 Sonnet y GPT-4o.

| Benchmark | DeepSeek-V4-Flash MLX | Claude 3.5 Sonnet | GPT-4o |
|---|---|---|---|
| Terminal-Bench 2.1 | 83,9% | 63,5% | 58,7% |
| SWE-bench Verified | 65,8% | 61,2% | 48,9% |
| LiveCodeBench v6 | 84,2% | 78,4% | 72,8% |
| MATH-500 | 94,6% | 89,2% | 91,4% |
| AIME 2025 | 78,2% | 72,5% | 63,8% |
| MMMU (multimodal) | 71,4% | 70,4% | 69,1% |
| DocVQA / ChartQA | 92,3% | 91,8% | 89,5% |

No se han publicado resultados de benchmarks externos adicionales en la informacion disponible.

## Requisitos de hardware

- El modelo ocupa aproximadamente 173,3 GB en disco en formato safetensors, por lo que se necesita al menos esa cantidad de memoria unificada libre para cargarlo.
- Para servir el contexto completo de 1 millon de tokens se recomiendan equipos Apple Silicon con M2 Ultra, M3 Ultra o M4 Max/Ultra.
- No es compatible de forma nativa con GPUs NVIDIA o AMD; esta optimizado para Apple Silicon mediante MLX y Metal.
- Opciones de despliegue: mlx-lm, MLX, y el ecosistema de Hugging Face con la libreria mlx.
- La model card reporta hasta 31+ tokens por segundo en Apple Silicon, aunque no se especifica el modelo exacto de chip ni el tamaño de contexto durante esa medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Exp-mlx-oQ8e | 304B (13B activos) | 1M | MIT | Hugging Face, Apple Silicon (MLX) |
| Claude 3.5 Sonnet | No disponible | No disponible | Propietaria | API |
| GPT-4o | No disponible | No disponible | Propietaria | API |

En cuanto a rendimiento, la comparativa se basa en los benchmarks reportados por el autor de la cuantizacion. DeepSeek-V4-Flash MLX supera a Claude 3.5 Sonnet y GPT-4o en Terminal-Bench, SWE-bench, LiveCodeBench, MATH-500, AIME, MMMU y DocVQA/ChartQA. No se dispone de datos de parametros, contexto ni licencia para los modelos propietarios en la informacion proporcionada.

## Limitaciones y advertencias

- Se trata de un modelo experimental, por lo que puede presentar un comportamiento menos estable que versiones posteriores y una mayor propensión a alucinaciones en tareas de razonamiento complejo.
- Los idiomas soportados se limitan a ingles y chino, lo que restringe su uso en otros mercados linguisticos.
- La cuantizacion mixta oQ8e puede introducir una ligera degradacion de la precision en comparacion con el modelo original sin cuantizar, especialmente en tareas que dependen de los expertos enrutados.
- Requiere una cantidad muy elevada de memoria unificada (mas de 173 GB), lo que excluye su ejecucion en equipos Apple Silicon de gama de entrada y en GPUs de consumo.
- La licencia MIT permite uso comercial, pero se recomienda revisar la licencia del modelo base en el repositorio de DeepSeek-AI, ya que podria incluir condiciones adicionales.
- No se han documentado sesgos especificos, pero al tratarse de un modelo entrenado con datos masivos, puede reflejar sesgos presentes en los corpus de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Solstice-AI/DeepSeek-V4-Flash-Vision-Exp-mlx-oQ8e
- Modelo base en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Repositorio de DeepSeek-V4: https://github.com/deepseek-ai/DeepSeek-V4
- Recetas de vLLM para DeepSeek-V4-Flash-Vision-Exp: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
