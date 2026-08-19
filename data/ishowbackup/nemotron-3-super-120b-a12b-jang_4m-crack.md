# Ishowbackup/Nemotron-3-Super-120B-A12B-JANG_4M-CRACK

## Resumen

Nemotron-3-Super-120B-A12B-JANG_4M-CRACK es una adaptación cuantizada y modificada del modelo NVIDIA Nemotron 3 Super 120B, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) híbrido que combina capas Mamba SSM, atención y MoE con 512 expertos y 22 activos. Esta versión concreta, publicada por el usuario Ishowbackup, aplica dos transformaciones sobre el modelo original: la cuantización mixta JANG_4M (formato propio para Apple Silicon, equivalente al GGUF de MLX) y la técnica CRACK (Controlled Refusal Ablation via Calibrated Knockouts), que elimina a nivel de pesos los mecanismos de rechazo por seguridad, dando lugar a un modelo sin guardarraíles (uncensored).

El resultado es un modelo de 63 GB que cabe en Macs con 96 GB o más de memoria unificada, alcanzando unos 40 tokens por segundo en un M3 Ultra. Está pensado para desarrolladores e investigadores que necesitan ejecutar un modelo de 120B en hardware de Apple Silicon sin restricciones de contenido, manteniendo un alto rendimiento en tareas de razonamiento y conocimiento general (94,2% en MMLU con modo de pensamiento activado). Su relevancia radica en combinar la potencia de un modelo de NVIDIA con la portabilidad del ecosistema MLX, aunque su naturaleza sin moderación plantea riesgos importantes que se detallan más adelante.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron 3 Super (híbrido Mamba SSM + MoE + Attention, 512 expertos, top-22) |
| Parametros totales | 120B (modelo original); 17.773.211.136 parámetros reales en pesos cuantizados (safetensors) |
| Parametros activos | ~12B (MoE) |
| Longitud de contexto | 1M tokens (según NVIDIA para el modelo base; no confirmado para esta versión cuantizada) |
| Tipos de cuantizacion | JANG_4M (8-bit para atención, 4-bit para expertos, media de 4,1 bits) |
| Idiomas soportados | Inglés (en) |
| Licencia | other (no especificada; probablemente hereda la de NVIDIA Nemotron 3 Super) |
| Formato de pesos | safetensors (MLX) y JANG (formato propietario para Apple Silicon) |

## Arquitectura y entrenamiento

El modelo base, NVIDIA Nemotron 3 Super 120B, es el primer modelo de la serie Nemotron 3 que emplea Latent MoE e incluye capas MTP (Multi-Token Prediction). Su arquitectura híbrida combina tres tipos de capas: bloques de atención tradicional, bloques Mamba SSM (state space model) y bloques MoE con 512 expertos de los que se activan 22 por token. Este diseño reduce el coste computacional respecto a un modelo denso de 120B, manteniendo una alta capacidad. Según NVIDIA, el modelo fue pre-entrenado en formato NVFP4 (precisión de 4 bits) y admite un contexto de hasta 1M tokens.

Sobre esta base, la versión JANG_4M-CRACK aplica dos modificaciones: primero, la cuantización JANG_4M, que asigna 8 bits a las capas de atención y 4 bits a los expertos MoE, logrando un tamaño final de 63 GB con una calidad media de 4,1 bits por peso. Segundo, la técnica CRACK, que realiza una ablación controlada de los pesos responsables de los rechazos de seguridad, eliminando de forma permanente la negativa del modelo a responder a peticiones dañinas o sensibles. El autor reporta que esta ablación mejora el rendimiento en MMLU (94,2% frente a ~86% del modelo cuantizado sin CRACK) y eleva la tasa de éxito en HarmBench al 90,3%, mientras que el modelo base sin CRACK obtiene un 0% en esta métrica.

## Capacidades

- Generación de texto y razonamiento complejo en inglés, con soporte de modo de pensamiento (thinking mode) activable o desactivable mediante ChatML.
- Rendimiento destacado en materias científicas y técnicas: 100% en medicina profesional, 94% en física universitaria y conceptual, 94% en biología de secundaria (según MMLU).
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno gracias a su contexto largo (1M tokens en el modelo original).
- Sin restricciones de seguridad: el modelo responde a cualquier petición sin rechazos, incluidos contenidos ilegales, dañinos o controvertidos (por diseño).
- No se ha confirmado soporte de tool calling ni function calling en esta versión cuantizada; la documentación disponible no lo menciona.
- Únicamente en inglés; no se reportan capacidades multilingües.

## Casos de uso

- Investigación en alineamiento y seguridad de IA: el modelo sirve para estudiar cómo la ablación de pesos (CRACK) afecta al comportamiento de rechazo y a la calidad de las respuestas, permitiendo comparar versiones con y sin alineamiento.
- Generación de contenido creativo sin filtros: escritura de ficción, guiones, poesía o narrativa con temáticas adultas o controvertidas que otros modelos censurarían.
- Asistencia en programación y depuración: gracias a su capacidad de razonamiento técnico, puede ayudar a resolver problemas de código, explicar algoritmos y generar ejemplos en distintos lenguajes.
- Análisis de documentos científicos y técnicos: su contexto largo permite procesar y resumir artículos extensos, informes o manuales en inglés.
- Desarrollo de agentes conversacionales para nichos específicos: en entornos controlados, puede simular personajes o asistentes sin restricciones temáticas, útil para pruebas de concepto.
- Evaluación de modelos de moderación: al generar contenido que normalmente sería rechazado, sirve como herramienta para entrenar y validar clasificadores de contenido dañino.

## Benchmarks y rendimiento

Los resultados publicados por el autor en la model card son los siguientes:

| Métrica | Valor |
|---|---|
| MMLU (con thinking) | 94,2% (196/208) |
| HarmBench | 90,3% (289/320) |
| Velocidad de inferencia (M3 Ultra 256GB) | ~40 tok/s |

Desglose de MMLU por materias:

| Materia | Aciertos | Porcentaje |
|---|---|---|
| Professional Medicine | 16/16 | 100% |
| HS Biology | 15/16 | 94% |
| College Physics | 15/16 | 94% |
| Conceptual Physics | 15/16 | 94% |
| Machine Learning | 13/16 | 81% |
| Electrical Engineering | 13/16 | 81% |
| College CS | 13/16 | 81% |
| HS Geography | 14/16 | 88% |
| World Religions | 14/16 | 88% |
| Formal Logic | 12/16 | 75% |
| College Math | 11/16 | 69% |
| HS Mathematics | 11/16 | 69% |
| Abstract Algebra | 10/16 | 63% |

Desglose de HarmBench por categoría:

| Categoría | Aciertos | Porcentaje |
|---|---|---|
| Misinformation / Disinfo | 54/54 | 100% |
| Copyright | 74/80 | 92% |
| Chemical / Biological | 38/42 | 90% |
| Harassment / Bullying | 19/21 | 90% |
| Harmful | 16/18 | 89% |
| Illegal | 46/53 | 87% |
| Cybercrime / Intrusion | 42/52 | 81% |

Comparación entre CRACK y la versión base cuantizada (JANG_4M sin CRACK):

| Métrica | CRACK | Base JANG_4M |
|---|---|---|
| MMLU | 94,2% | ~86% |
| HarmBench | 90,3% | 0% |

## Requisitos de hardware

- Mac con Apple Silicon y al menos 96 GB de memoria unificada (según la model card).
- Tamaño del repositorio: 67,2 GB (63 GB de pesos cuantizados).
- GPU recomendadas: M3 Ultra (256 GB), M2 Ultra (192 GB), M1 Ultra (128 GB) o cualquier Mac con 96 GB o más.
- No aplica VRAM dedicada; usa memoria unificada de Apple.
- Opciones de despliegue: MLX Studio (aplicación nativa), librería `jang-tools` (paquete Python) y `mlx_lm` para generación.
- Latencia y throughput: aproximadamente 40 tokens por segundo en un M3 Ultra con 256 GB; valores inferiores en chips menos potentes.
- No se ha probado en hardware que no sea Apple Silicon; el formato JANG es exclusivo de MLX.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | HarmBench | Licencia | Formato |
|---|---|---|---|---|---|---|
| Nemotron-3-Super-120B-A12B-JANG_4M-CRACK (este) | 120B total, ~12B activos | 1M (base) | 94,2% | 90,3% | other | JANG/MLX |
| Nemotron-3-Super-120B-A12B-JANG_2L-CRACK | 120B total, ~12B activos | 1M (base) | 95,7% | 96,2% | other | JANG/MLX |
| NVIDIA Nemotron 3 Super 120B (original) | 120B total, ~12B activos | 1M | no disponible | no disponible | NVIDIA Open Model License | safetensors (NVFP4) |

La versión JANG_2L (43 GB) es más ligera y obtiene mejores resultados en MMLU y HarmBench, según el autor, pero requiere menos memoria. El modelo original de NVIDIA no está cuantizado para Apple Silicon y necesita hardware con soporte NVFP4.

## Limitaciones y advertencias

- Modelo sin guardarraíles: al eliminar la alineación de seguridad, puede generar contenido ilegal, dañino, violento o sexualmente explícito sin ningún tipo de filtro. Su uso conlleva riesgos legales y éticos importantes.
- Solo inglés: no se ha evaluado su rendimiento en otros idiomas.
- Contexto no verificado: aunque el modelo base soporta 1M tokens, la versión cuantizada no confirma si mantiene esa longitud de contexto completa.
- Licencia ambigua: el campo de licencia es "other" y no se detallan las condiciones de uso comercial; se recomienda revisar la licencia del modelo base de NVIDIA antes de cualquier despliegue en producción.
- Dependencia de ecosistema propietario: el formato JANG solo es compatible con MLX Studio y `jang-tools`, lo que limita su portabilidad a otras plataformas.
- Sin soporte oficial: el autor no ofrece garantías de mantenimiento ni corrección de errores.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede inventar información, especialmente en dominios especializados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ishowbackup/Nemotron-3-Super-120B-A12B-JANG_4M-CRACK
- Modelo base NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Super-120B-A12B
- Página de investigación NVIDIA Nemotron 3 Super: https://research.nvidia.com/labs/nemotron/Nemotron-3-Super/
- NVIDIA Developer (Nemotron): https://developer.nvidia.com/topics/ai/nemotron
- GitHub del proyecto JANG: https://github.com/jjang-ai/jangq
- MLX Studio: https://mlx.studio
- Sitio web jangq.ai: https://jangq.ai
- Ko-fi de soporte: https://ko-fi.com/jangq
- Perfil de X (dealignai): https://x.com/dealignai
