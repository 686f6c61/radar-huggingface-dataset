# Ishowbackup/DeepSeek-R1-Distill-Llama-8B

## Resumen

DeepSeek-R1-Distill-Llama-8B es un modelo de razonamiento de 8.030 millones de parámetros, resultado de la destilación del modelo DeepSeek-R1 (un modelo de razonamiento de 671B con arquitectura MoE) sobre la base de Llama 3.1 8B. El modelo original fue desarrollado por DeepSeek AI y liberado bajo licencia MIT, y esta versión concreta (`Ishowbackup/DeepSeek-R1-Distill-Llama-8B`) es un espejo o re-subida del checkpoint oficial en Hugging Face, con los pesos en formato safetensors y compatible con la librería transformers.

El modelo está diseñado para tareas de razonamiento complejo, matemáticas, código y lógica, siguiendo la técnica de destilación de cadenas de pensamiento (CoT) generadas por el modelo R1 original. Su relevancia actual radica en ofrecer capacidades de razonamiento de nivel o1 en un tamaño compacto (8B) que puede ejecutarse en hardware de consumo, democratizando el acceso a modelos de razonamiento avanzados. La ventana de contexto es de 128.000 tokens, lo que permite manejar documentos largos y conversaciones extensas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basada en Llama 3.1 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (se esperan variantes GGUF, AWQ, etc. de la comunidad) |
| Idiomas soportados | No disponible (el modelo base Llama 3.1 soporta principalmente ingles y otros idiomas, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors (tambien disponible en GGUF y otros formatos por la comunidad) |

## Arquitectura y entrenamiento

El modelo es una destilacion del sistema DeepSeek-R1, que combina dos etapas de RL (reinforcement learning) y dos etapas de SFT (supervised fine-tuning) sobre el modelo base. Para la version destilada, se tomo el checkpoint de Llama 3.1 8B y se ajusto fino con datos de razonamiento generados por DeepSeek-R1 (cadenas de pensamiento, autoverificacion y reflexion). La arquitectura es identica a la de Llama 3.1 8B: un transformer denso con atencion por ventanas deslizantes y atencion global, normalizacion RMSNorm, y activacion SwiGLU. No se han publicado detalles adicionales sobre el dataset de destilacion ni el numero exacto de tokens de entrenamiento en la informacion disponible.

## Capacidades

- Razonamiento paso a paso: genera cadenas de pensamiento largas y estructuradas para problemas complejos de matematicas, logica y ciencia.
- Generacion de codigo: capaz de escribir, depurar y explicar codigo en multiples lenguajes, con especial solidez en problemas de programacion competitiva.
- Resolucion de problemas matematicos: rinde bien en benchmarks como AIME, MATH y GSM8K (segun el paper original, aunque no se incluyen cifras en esta ficha).
- Autoverificacion y reflexion: el modelo tiende a revisar sus propias respuestas y corregir errores durante el razonamiento.
- Soporte de tool calling: no se menciona explicitamente en la informacion, pero al estar basado en Llama 3.1, es probable que herede cierta capacidad de function calling (no confirmado).
- Multilingue: limitado por el modelo base Llama 3.1, que tiene un rendimiento solido en ingles y capacidades moderadas en otros idiomas, aunque no se especifica en la documentacion.

## Casos de uso

- Asistente de programacion en entornos de desarrollo: el modelo puede integrarse en IDEs o pipelines de CI/CD para generar tests, revisar codigo y sugerir correcciones, aprovechando su capacidad de razonamiento para entender requisitos complejos.
- Tutoria y educacion en matematicas: explicar paso a paso la resolucion de problemas algebraicos, de calculo o estadistica, con justificaciones detalladas, util para plataformas de aprendizaje automatico.
- Analisis de documentos largos: gracias a su contexto de 128k tokens, puede resumir, extraer conclusiones y responder preguntas sobre contratos, informes tecnicos o articulos cientificos extensos.
- Agente de razonamiento para soporte tecnico: desplegado como backend de un chatbot que diagnostica problemas, propone soluciones y justifica cada paso, reduciendo la carga de agentes humanos.
- Generacion de contenido cientifico: redactar borradores de articulos, hipotesis o secciones de metodos, con razonamiento logico y citas de fuentes (aunque con riesgo de alucinacion).
- Benchmarking de modelos de razonamiento: utilizado como referencia en evaluaciones comparativas de modelos pequenos, gracias a su licencia MIT y facilidad de despliegue local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original de DeepSeek-R1 reporta cifras para los modelos destilados (por ejemplo, DeepSeek-R1-Distill-Llama-8B obtiene 50.4 en AIME 2024, 55.6 en MATH-500 y 72.6 en HumanEval, segun el articulo), pero estos datos no estan incluidos en la model card ni en los resultados de busqueda proporcionados. Por tanto, se indica que no se dispone de datos verificados en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, el modelo ocupa aproximadamente 16 GB (8.03B parametros x 2 bytes). Con cuantizacion de 8 bits (~8 GB) o 4 bits (~4 GB) puede ejecutarse en GPUs de consumo.
- GPU recomendadas: para FP16 se necesita una GPU con al menos 16 GB (por ejemplo, RTX 4090, A100 40GB, o varias GPUs). Con cuantizacion 4-bit, una RTX 3060 de 12 GB o RTX 4070 de 12 GB es suficiente.
- Compatibilidad con consumer GPU: si, especialmente con cuantizacion GGUF (Q4_K_M, Q5_K_M) ejecutable en llama.cpp u Ollama.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, ExecuTorch (para edge), y NVIDIA NIM (servicio gestionado).
- Latencia y throughput: no disponible en la informacion proporcionada; dependera del hardware y la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Llama-8B (este) | 8.03B | 128k | MIT | Razonamiento destilado de R1 |
| Llama 3.1 8B (base) | 8.03B | 128k | Llama 3.1 Community License | Modelo generalista sin destilacion de razonamiento |
| Qwen2.5 7B Instruct | 7.6B | 128k | Apache 2.0 | Modelo instruct generalista, sin razonamiento especializado |
| DeepSeek-R1-Distill-Qwen-7B | 7.6B | 128k | MIT | Destilacion de R1 sobre Qwen2.5 7B, similar en tamano |

La comparativa se basa en caracteristicas generales conocidas; no se dispone de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo destilado, puede heredar sesgos del modelo base Llama 3.1 y del propio DeepSeek-R1. Es propenso a generar respuestas confiadas pero incorrectas, especialmente en dominios fuera de su entrenamiento.
- Riesgo de razonamiento excesivo: en tareas simples, el modelo puede generar cadenas de pensamiento innecesariamente largas, aumentando la latencia y el coste computacional.
- Limitaciones de idioma: el rendimiento fuera del ingles puede ser inferior; no se especifican idiomas soportados en la documentacion.
- Restricciones de licencia: aunque la licencia es MIT, el modelo base Llama 3.1 tiene su propia licencia (Llama 3.1 Community License) que puede imponer restricciones adicionales para uso comercial en ciertos volumenes. Es necesario revisar ambas licencias antes de desplegar en produccion.
- Contexto largo: aunque soporta 128k tokens, el rendimiento en contextos muy largos puede degradarse y el coste de atencion cuadratico puede hacer la inferencia lenta en hardware modesto.
- Sin garantias de tool calling: no se confirma soporte nativo de function calling; si se necesita, habria que evaluar o ajustar el modelo.

## Enlaces

- Repositorio Hugging Face del modelo (espejo): https://huggingface.co/Ishowbackup/DeepSeek-R1-Distill-Llama-8B
- Modelo original en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Paper de DeepSeek-R1 (arXiv): https://arxiv.org/abs/2501.12948
- Repositorio GitHub de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Ejemplo de ejecucion con ExecuTorch: https://github.com/pytorch/executorch/tree/main/examples/models/deepseek-r1-distill-llama-8B
- Pagina del modelo en NVIDIA NIM: https://build.nvidia.com/deepseek-ai/deepseek-r1-distill-llama-8b
- Ficha en LM Studio: https://lmstudio.ai/models/deepseek/deepseek-r1-distill-llama-8b
