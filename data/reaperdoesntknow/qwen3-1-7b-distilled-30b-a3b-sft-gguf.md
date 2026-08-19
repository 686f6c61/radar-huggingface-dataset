# reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF

## Resumen

Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF es un modelo de lenguaje de 1.700 millones de parametros desarrollado por Reaperdoesntrun, de la division de investigacion de Convergent Intelligence LLC. Se trata de una version cuantizada en formato GGUF del modelo base homonimo, que a su vez es una destilacion del modelo Qwen3-30B-A3B-Instruct-2507, centrada en razonamiento STEM (matematicas, fisica, ingenieria) y seguimiento de instrucciones en el ambito legal.

El modelo destaca por su doble etapa de entrenamiento: primero, una destilacion de conocimiento informada por tecnicas de discrepancia (DISC) sobre 6.122 muestras de cadenas de razonamiento STEM; y segundo, un ajuste supervisado (SFT) sobre el dataset Lawyer-Instruct para anadir capacidad juridica. El resultado es un modelo compacto que cabe en un telefono movil y que mantiene capacidades de razonamiento estructurado y derivacion formal, con un tamano de contexto de 32.768 tokens.

La relevancia de este modelo reside en su proposito de llevar razonamiento avanzado a entornos de edge computing y dispositivos con recursos limitados, ofreciendo cuantizaciones que van desde F16 (3,8 GB) hasta Q4_K_M (1,2 GB) para despliegue en moviles. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 (1,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (herencia de Qwen3-1.7B) |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen3-1.7B, un transformer causal denso con 1,7 mil millones de parametros y una ventana de contexto de 32.768 tokens. Sobre esta base, el proceso de entrenamiento se desarrollo en dos etapas diferenciadas:

**Etapa 1 - Destilacion de conocimiento informada por DISC:** El modelo fue destilado desde Qwen3-30B-A3B-Instruct-2507 (modelo profesor, MoE de 30B totales con 3B activos) utilizando 6.122 muestras de cadenas de razonamiento STEM provenientes de 12 datasets de 0xZee. La funcion de perdida empleada fue una cross-entropy ponderada por peso de prueba (proof-weighted), con un factor de decaimiento de 2,5x a 1,5x sobre los tokens de derivacion, combinada con divergencia KL a temperatura T=2.0. El objetivo era enfatizar el razonamiento multi-paso sobre el patron de coincidencia con la respuesta final.

**Etapa 2 - SFT legal:** A continuacion se realizo un ajuste supervisado sobre el dataset Alignment-Lab-AI/Lawyer-Instruct, anadiendo capacidad de seguir instrucciones y conocimiento juridico sobre la base de razonamiento STEM ya establecida.

El modelo responde a dos formatos de prompt: uno para derivaciones STEM ("Solve the following problem carefully and show a rigorous derivation... Proof:") y otro para instrucciones generales ("### Instruction:... ### Response:").

## Capacidades

- Razonamiento matematico y cientifico: capaz de realizar derivaciones estructuradas en matematicas, fisica y ecuaciones diferenciales, con enfasis en el proceso de demostracion mas que en el resultado final.
- Razonamiento juridico: tras el SFT con Lawyer-Instruct, puede seguir instrucciones y responder consultas legales con terminologia apropiada.
- Seguimiento de instrucciones: responde al formato de prompt estructurado ### Instruction / ### Response.
- Generacion de texto: generacion autoregresiva de texto en ingles.
- Razonamiento multi-paso: entrenado para cadenas de pensamiento (chain-of-thought) con enfasis en la estructura de la prueba.
- Despliegue en edge: gracias a las cuantizaciones GGUF, puede ejecutarse en dispositivos moviles y hardware limitado.
- Compatibilidad con runtimes populares: llama.cpp, Ollama, LM Studio y Python (llama-cpp-python).

## Casos de uso

- Asistente de estudio para estudiantes de ciencias: el modelo puede guiar a estudiantes en la resolucion de problemas de fisica o matematicas, mostrando el proceso de derivacion paso a paso. Su entrenamiento especifico en cadenas de razonamiento STEM lo hace adecuado para este fin, aunque requiere verificacion externa de los resultados.
- Herramienta de apoyo para profesionales juridicos: puede generar resumenes de doctrinas legales, explicar conceptos como promissory estoppel o res judicata, y ayudar en la redaccion de borradores de argumentos. Su conocimiento legal proviene del SFT con Lawyer-Instruct, pero no sustituye el criterio de un abogado.
- Chatbot educativo en dispositivos moviles: con la cuantizacion Q4_K_M (1,2 GB), el modelo puede integrarse en aplicaciones moviles de aprendizaje offline, ofreciendo explicaciones de conceptos STEM sin conexion a internet.
- Automatizacion de documentacion tecnica: puede generar explicaciones de procedimientos cientificos o de ingenieria a partir de instrucciones breves, manteniendo un tono formal y estructurado.
- Prototipado rapido de agentes de razonamiento: su tamano reducido permite experimentar con pipelines de razonamiento multi-paso en entornos de desarrollo sin necesidad de GPUs de alta gama.
- Sistema de tutoria inteligente en plataformas educativas: puede integrarse en sistemas de gestion de aprendizaje (LMS) para proporcionar retroalimentacion inmediata sobre problemas de matematicas o fisica, aprovechando su capacidad de generar cadenas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K u otras evaluaciones estandar. Se recomienda consultar la model card del modelo fuente (Qwen3-1.7B-Distilled-30B-A3B-SFT) para posibles datos de evaluacion adicionales, o realizar una evaluacion propia con las herramientas de llama.cpp.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,2 GB (cuantizacion Q4_K_M) y 3,8 GB (F16), dependiendo de la cuantizacion elegida.
- GPUs recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar la version Q4_K_M; para Q8_0 se recomienda al menos 4 GB; F16 requiere unos 6 GB. Tarjetas como NVIDIA GTX 1650, RTX 3060 o superiores son suficientes.
- Compatibilidad con consumer GPU: si, todas las cuantizaciones caben en GPUs de consumo actuales. La version Q4_K_M incluso puede ejecutarse en iGPUs modernas o en CPU con 8 GB de RAM.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (creando un Modelfile), LM Studio (carga directa del GGUF), llama-cpp-python para integracion en aplicaciones Python, y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependeran del hardware, la cuantizacion y la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Qwen3-1.7B (base) | 1,7B | 32.768 | Apache 2.0 | Safetensors, GGUF | Modelo generalista |
| Qwen3-1.7B-Distilled-30B-A3B-SFT | 1,7B | 32.768 | Apache 2.0 | Safetensors | Destilacion STEM + SFT legal |
| Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF | 1,7B | 32.768 | Apache 2.0 | GGUF | Version cuantizada del anterior |
| Qwen3-30B-A3B-Instruct-2507 (profesor) | 30B (3B activos) | 32.768 | Apache 2.0 | Safetensors | Modelo profesor, MoE |

El modelo se posiciona como una alternativa compacta a modelos de razonamiento mas grandes. Frente a su base (Qwen3-1.7B), anade especializacion en STEM y legal. Frente al profesor (Qwen3-30B-A3B), sacrifica capacidad bruta pero ofrece despliegue en hardware mucho mas modesto. No hay modelos comparables directos en la informacion proporcionada, pero podria compararse con otras destilaciones de razonamiento como TinyLlama o Phi-3-mini, aunque sin datos de benchmarks no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Tamano reducido: al ser un modelo de 1,7B, tiene limites duros en capacidad. Puede producir derivaciones fluidas pero incorrectas; no es un sustituto de verificacion formal de pruebas, asesoria legal profesional ni analisis de ingenieria.
- Dominios debiles: el rendimiento es mas debil en dominios poco representados en los datos de entrenamiento, como biologia molecular o fisiologia.
- Idioma: solo soporta ingles. No se recomienda su uso para otros idiomas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en dominios fuera de su especializacion.
- Sesgos: no se han documentado sesgos especificos, pero al entrenarse sobre datasets publicos puede heredar sesgos presentes en los datos originales.
- Verificacion independiente: todas las salidas deben verificarse de forma independiente, especialmente en contextos legales, cientificos o de ingenieria donde los errores pueden tener consecuencias graves.
- Contexto: aunque la ventana es de 32.768 tokens, en cuantizaciones bajas (Q4_K_M) el rendimiento con contextos largos puede degradarse; se recomienda usar n_ctx=1024 o valores prudentes en despliegues moviles.

## Enlaces

- Repositorio GGUF: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF
- Modelo fuente (Safetensors): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT
- Modelo sin SFT: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Dataset Lawyer-Instruct: https://huggingface.co/datasets/Alignment-Lab-AI/Lawyer-Instruct
- Perfil del desarrollador: https://huggingface.co/reaperdoesntknow
- Sitio de Convergent Intelligence: https://convergentintel.com
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai/
