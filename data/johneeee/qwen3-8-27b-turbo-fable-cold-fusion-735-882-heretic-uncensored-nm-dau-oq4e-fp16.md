# Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ4e-fp16

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ4e-fp16 es una version cuantizada a 4 bits de un fine-tune del modelo base Qwen3.8-27B, creada por Johneeee mediante la herramienta oQ (oMLX v0.6.4) con cuantizacion de precision mixta. El modelo base, desarrollado por Alibaba, es un transformer denso de aproximadamente 26.900 millones de parametros con atencion hibrida (atencion lineal en 48 de sus 64 capas), torre de vision integrada, cabezal de draft MTP para decodificacion especulativa y una ventana de contexto nativa de 262.000 tokens extensible a 1 millon.

El nombre del modelo indica que se trata de una fusion de pesos ("Cold-Fusion") con caracter "Uncensored" y "Heretic", lo que implica que se ha eliminado o reducido el alineamiento de seguridad del modelo base. La cuantizacion a 4 bits con grupo de tamano 64 reduce el peso total a aproximadamente 16 GB en formato MLX safetensors, lo que permite su ejecucion en equipos Apple Silicon con memoria unificada. El modelo se publico el 2 de septiembre de 2026 y no cuenta aun con descargas ni validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer denso con atencion hibrida: lineal en 48/64 capas, torre de vision, cabezal MTP) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens nativos (extensible a 1.000.000) |
| Tipos de cuantizacion | 4 bits (oQ mixed-precision, group size 64) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B es multilingue, pero no se especifica la cobertura de este fine-tune) |
| Licencia | No disponible (el modelo base es Apache 2.0; la licencia de este fine-tune no esta declarada) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de atencion hibrida: 48 de sus 64 capas utilizan atencion lineal, lo que reduce el coste computacional en contextos largos, mientras que las 16 restantes conservan atencion completa. Incluye una torre de vision que permite procesar imagenes y un cabezal de draft MTP (Multi-Token Prediction) para acelerar la generacion mediante decodificacion especulativa.

El fine-tune "TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU" es una fusion de pesos que combina multiples adaptaciones del modelo base. Las cifras 735 y 882 del nombre hacen referencia a puntuaciones ARC-C y ARC-E segun las afirmaciones del autor de un modelo relacionado (DavidAU), que indica que supera en 144 puntos al Qwen3.8-27B base en ARC-C. El caracter "Uncensored" indica que se ha eliminado el alineamiento de seguridad. Los detalles del dataset de entrenamiento y el proceso de fusion no estan disponibles.

La cuantizacion se realizo con oQ (oMLX v0.6.4), una herramienta de cuantizacion de precision mixta que asigna diferentes niveles de bits a distintas capas segun su sensibilidad, en este caso a 4 bits con grupo de tamano 64, en formato MLX safetensors.

## Capacidades

- Generacion de texto y razonamiento multi-paso: hereda las capacidades del Qwen3.8-27B en tareas de razonamiento logico, matematico y cientifico.
- Generacion de codigo: soporta multiples lenguajes de programacion y puede integrarse en flujos de desarrollo asistido.
- Capacidades de vision: la torre de vision integrada en el modelo base permite procesar y razonar sobre imagenes.
- Tool calling / function calling: soporte para invocacion de herramientas externas, heredado del modelo base.
- Decodificacion especulativa: el cabezal MTP integrado acelera la generacion de tokens en inferencia.
- Modo "Uncensored": el fine-tune reduce o elimina los rechazos por contenido, permitiendo respuestas sin filtros de seguridad.
- Contexto largo: ventana de 262.000 tokens nativos, adecuada para documentos extensos y conversaciones multi-turno prolongadas.

## Casos de uso

- Despliegue local en Apple Silicon: el formato MLX y la cuantizacion a 4 bits permiten ejecutar el modelo en Macs con 32 GB o mas de memoria unificada mediante MLX o LM Studio, ofreciendo un asistente local sin conexion a internet.
- Investigacion en alineamiento y seguridad: el caracter "Uncensored" lo hace util para estudiar los efectos de la eliminacion de alineamiento en modelos de gran tamano, comparando respuestas con y sin restricciones de seguridad.
- Generacion de codigo en entornos aislados: puede usarse como asistente de programacion en entornos de desarrollo donde no se requieran filtros de contenido, aprovechando el soporte de tool calling para integrarse en IDEs y pipelines de CI/CD.
- Analisis de documentos extensos con imagenes: la combinacion de vision y contexto de 262K tokens permite procesar informes largos con figuras, tablas y diagramas en una sola pasada.
- Prototipado de agentes autonomos: el soporte de function calling y el contexto extenso facilitan la construccion de agentes multi-paso que requieren mantener conversaciones largas con herramientas externas.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia para medir el impacto de la cuantizacion oQ a 4 bits frente a otras tecnicas (GGUF, GPTQ, AWQ) en modelos de 27B, especialmente en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks oficiales para este modelo especifico en la informacion disponible. El autor del modelo relacionado DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF afirma puntuaciones de 735 en ARC-C y 880 en ARC-E en 8 bits, y superiores a 718 en ARC-C en 4 bits, pero estos datos no han sido verificados de forma independiente y corresponden a una variante distinta (formato GGUF, no MLX).

## Requisitos de hardware

- VRAM estimada: los pesos cuantizados a 4 bits ocupan aproximadamente 13,5 GB (26,9 mil millones de parametros × 0,5 bytes por parametro), mas overhead de activaciones y KV cache. Se recomiendan al menos 16-24 GB de memoria unificada.
- GPU recomendadas: el formato MLX esta disenado para Apple Silicon (M1 Pro/Max/Ultra, M2, M3, M4 con 32 GB o mas de memoria unificada). AMD Ryzen AI Max y Radeon tienen soporte dia 0 para el modelo base segun AMD, aunque la compatibilidad con este fine-tune concreto no esta confirmada.
- GPU de consumo: no es adecuado para GPUs NVIDIA de consumo (RTX 4090 con 24 GB podria ejecutarlo tras conversion a otro formato, pero MLX no es compatible nativo con CUDA).
- Opciones de despliegue: MLX (libreria nativa), LM Studio, oMLX (para cuantizacion y carga), y conversion a GGUF para llama.cpp u Ollama si se requiere compatibilidad con otras plataformas.
- Latencia y throughput: no disponible. La atencion hibrida y el cabezal MTP del modelo base deberian ofrecer una generacion mas rapida que un transformer denso equivalente, pero no hay datos medidos para esta cuantizacion concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 26,9B | 262K (ext. 1M) | FP16/BF16 | Apache 2.0 | safetensors |
| Este modelo (oQ4e-fp16) | 26,9B | 262K (ext. 1M) | 4-bit oQ | No disponible | MLX safetensors |
| Qwen3.8-27B-TURBO...GGUF (DavidAU) | 26,9B | 262K (ext. 1M) | 4-bit/8-bit GGUF | No disponible | GGUF |

La principal diferencia con el modelo base es la capa de fine-tune "Uncensored" y la cuantizacion a 4 bits. Frente a la variante GGUF de DavidAU, este modelo usa formato MLX (optimizado para Apple Silicon) y una tecnica de cuantizacion distinta (oQ frente a GGUF estandar). Ambos fine-tunes comparten la misma linea de fusion de pesos, pero no se dispone de datos que confirmen que los resultados de benchmarks de uno se apliquen al otro.

## Limitaciones y advertencias

- Ausencia de alineamiento de seguridad: al ser un modelo "Uncensored", puede generar contenido danino, ofensivo o ilegal sin restricciones. No debe desplegarse en produccion orientada al publico sin capas adicionales de moderacion de contenido.
- Licencia no especificada: aunque el modelo base es Apache 2.0, la licencia de este fine-tune no esta declarada en la model card, lo que genera incertidumbre legal para uso comercial.
- Sin datos de benchmarks verificados: las afirmaciones de rendimiento (ARC-C 735, ARC-E 880) provienen del autor de un modelo relacionado y no han sido validadas de forma independiente para esta variante.
- Riesgo de alucinacion: como todos los modelos de lenguaje, puede inventar informacion, especialmente en dominios especializados o con prompts ambiguos.
- Formato de cuantizacion especifico: la cuantizacion oQ es propia de oMLX; la conversion a otros formatos (GGUF, etc.) puede requerir re-cuantizacion desde los pesos originales.
- Compatibilidad limitada: el formato MLX restringe el despliegue principalmente a Apple Silicon, excluyendo GPUs NVIDIA y centros de datos convencionales sin conversion previa.
- Sin validacion comunitaria: el modelo tiene 0 descargas y 0 likes, lo que indica que
