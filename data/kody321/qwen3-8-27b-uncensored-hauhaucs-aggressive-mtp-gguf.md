# kody321/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF es una cuantización GGUF no oficial del modelo Qwen3.8-27B de Alibaba Qwen, publicada por el usuario kody321 (con material procedente del autor HauhauCS). El modelo base es un transformer denso de 27.000 millones de parámetros con codificador de visión, pensado para tareas de imagen-texto-a-texto, razonamiento, agentes y generación de código. Esta variante aplica un perfil de "desensurado agresivo" que elimina los comportamientos de rechazo y reduce el preámbulo en respuestas a peticiones delicadas, preservando según el autor las capacidades nativas del modelo original.

La relevancia técnica de esta ficha está en dos innovaciones de despliegue: por un lado, conserva la cabeza MTP/NextN nativa del modelo (decodificación especulativa embebida) en todas las cuantizaciones de texto; por otro, añade HauhauCS FastMTP, un sidecar de aceleración de 903 MB que el autor cifra en hasta 3,02x de throughput en generación de documentos y 1,93x en razonamiento frente a la versión sin MTP. Además, introduce las cuantizaciones propietarias K_P ("Perfect"), que según el autor elevan la calidad uno o dos niveles a cambio de un 5-15% más de tamaño.

El modelo conserva el contexto nativo de 262.144 tokens, extensible hasta 1.000.000, e incluye visión mediante un proyector BF16 separado de 931 MB. La licencia es Apache 2.0. El repositorio ocupa 172,5 GB y contiene toda la línea de cuantizaciones, desde Q8_K_P (31,46 GB) hasta IQ2_M (10,32 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal con codificador de visión; 48 capas Gated DeltaNet y 16 capas de atención con compuertas (híbrida) |
| Parametros totales | 27.000 millones (según model card); el campo safetensors del repo declara 1.863.907.840, dato inconsistente con el nombre y las specs del autor |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M; proyector de visión BF16 y sidecar FastMTP 32K |
| Idiomas soportados | Inglés, chino y multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto cuantizado, proyector de visión BF16 separado, sidecar FastMTP) |

Otras especificaciones declaradas por el autor:

| Parametro | Valor |
|---|---|
| Capas del modelo de lenguaje | 64 |
| Hidden size | 5.120 |
| Tamano de FFN | 17.408 |
| Vocabulario | 248.320 tokens (con padding) |
| Cabezas MTP | NextN nativa embebida + FastMTP 32K |
| Tamano del repositorio | 172,5 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso causal de 64 capas con un codificador de visión acoplado. La arquitectura no es un transformer clásico puro: combina 48 capas Gated DeltaNet (atención lineal con estado recurrente) con 16 capas de atención con compuertas, un esquema híbrido que reduce el coste computacional en contextos largos manteniendo la calidad de atención completa en un subconjunto de capas. El hidden size es de 5.120 y la FFN de 17.408, con un vocabulario de 248.320 tokens.

El modelo incorpora de forma nativa una cabeza MTP (Multi-Token Prediction, denominada NextN) que permite decodificación especulativa sin modelo borrador externo. Esta release preserva esa cabeza en todas las cuantizaciones de texto y añade el sidecar HauhauCS FastMTP-32K, un perfil de aceleración de 903 MB que el autor declara compatible con toda la línea de cuantizaciones y con el contexto nativo máximo. Las cuantizaciones K_P son perfiles de cuantización personalizados por modelo que, según el autor, preservan selectivamente la calidad en las capas más sensibles; son GGUFs estándar y funcionan en llama.cpp y LM Studio sin builds especiales.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en el modelo base. El autor indica explícitamente que esta variante no modifica datasets ni capacidades previstas: solo aplica el perfil de desensurado "Aggressive" sobre el modelo original.

## Capacidades

- Generación de texto y razonamiento multi-paso, incluyendo modo de pensamiento (thinking) heredado de la familia Qwen3.
- Generación y edición de código, con soporte para lenguajes habituales de producción.
- Razonamiento matemático y tareas analíticas de varios pasos.
- Comprensión de imágenes y vídeo mediante el proyector de visión BF16 (pipeline image-text-to-text).
- Capacidades agénticas: uso de herramientas, function calling y razonamiento multi-paso orientado a agentes.
- Multilingüe con foco en inglés y chino, y cobertura adicional multilingüe.
- Perfil de desensurado "Aggressive": respuestas directas, sin comportamiento de rechazo y con preámbulo mínimo en peticiones difíciles. El autor declara 0/465 rechazos en su evaluación.
- Decodificación especulativa nativa vía MTP/NextN y aceleración adicional con FastMTP 32K.
- Contexto largo de 262.144 tokens nativos, extensible a 1.000.000.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historiales extensos gracias a sus 262.144 tokens de contexto nativo, manteniendo coherencia en sesiones largas sin truncar el diálogo previo.
- Generación de código en producción: el soporte de tool calling y su capacidad de razonamiento permiten integrarlo en pipelines de CI/CD para revisión automática de parches, generación de tests y resolución de incidencias con acceso a herramientas del repositorio.
- Agentes autónomos de investigación: la combinación de contexto largo, razonamiento multi-paso y function calling lo hace adecuado para tareas que requieren leer documentación extensa, consultar APIs y sintetizar resultados en varias iteraciones.
- Análisis de documentos técnicos con imágenes: gracias al proyector de visión puede procesar diagramas de arquitectura, capturas de pantalla de errores o tablas escaneadas junto al texto del documento en una sola pasada.
- Asistente de análisis de vídeo e imagen industrial: inspección de fotogramas o imágenes de producto para generar descripciones, detectar anomalías o extraer información estructurada en flujos de control de calidad.
- Generación de documentación técnica a partir de código: con contexto de 262K tokens puede ingerir módulos completos y producir documentación coherente con la API real, reduciendo el coste de mantenimiento.
- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones IQ3_XS (12,18 GB) e IQ4_XS (15,71 GB) permiten ejecutar el modelo en GPUs de 16-24 GB de VRAM con llama.cpp u Ollama, manteniendo visión y MTP.
- Investigación sobre alineación y comportamiento: el perfil "Aggressive" con 0/465 rechazos declarados sirve como referencia para estudiar diferencias de comportamiento entre modelos censurados y no censurados en evaluaciones controladas.

## Benchmarks y rendimiento

El autor publica únicamente métricas relativas de aceleración del sidecar FastMTP, no resultados de benchmarks de calidad estándar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Resultado declarado |
|---|---|
| Aceleración TG en documentos (FastMTP vs. sin MTP) | Hasta 3,02x |
| Aceleración TG en razonamiento (FastMTP vs. sin MTP) | Hasta 1,93x |
| TG en documentos (FastMTP vs. MTP embebido estándar) | Hasta +35,2% |
| TG en razonamiento (FastMTP vs. MTP embebido estándar) | Hasta +21,1% |
| Tasa de rechazo (evaluación del autor) | 0/465 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, MMMU, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (solo pesos de texto, sin contar KV cache ni proyector):
  - Q8_K_P: ~31,5 GB
  - Q6_K_P: ~25,9 GB
  - Q5_K_P: ~20,2 GB
  - Q4_K_P: ~17,9 GB
  - IQ4_XS: ~15,7 GB
  - Q3_K_P: ~13,4 GB
  - IQ3_M: ~12,8 GB
  - IQ3_XS: ~12,2 GB
  - Q2_K_P: ~10,7 GB
  - IQ2_M: ~10,3 GB
- Sumar ~931 MB del proyector de visión BF16 si se usa entrada de imagen o vídeo, y ~903 MB del sidecar FastMTP si se activa la aceleración.
- GPU recomendadas: A100 80 GB o H100 para Q8_K_P con contexto largo; RTX 4090 (24 GB) para Q4_K_P o IQ4_XS con contexto moderado; RTX 3090/4080 (16-24 GB) para IQ4_XS o Q3_K_P; GPUs de 12 GB para IQ3_XS o IQ2_M con contexto reducido.
- Cabe en GPU de consumo: sí, desde IQ2_M (~10,3 GB) en adelante, con la salvedad de que el KV cache a 262K tokens exige mucha más VRAM y obliga a reducir contexto o usar offloading a CPU.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y cualquier runtime compatible con GGUF. El autor advierte que el widget de compatibilidad de hardware de Hugging Face puede no reconocer las cuantizaciones K_P; hay que usar "View variants" o "Files and versions".
- Latencia y throughput: no disponibles de forma absoluta; solo se declaran aceleraciones relativas de FastMTP (hasta 3,02x en documentos y 1,93x en razonamiento frente a la versión sin MTP).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP (esta ficha) | 27B denso | 262.144 (ext. 1M) | Sí (proyector BF16) | Apache 2.0 | GGUF | Perfil desensurado agresivo, MTP nativo + FastMTP, cuantizaciones K_P |
| Qwen/Qwen3.8-27B (base) | 27B denso | 262.144 (ext. 1M) | Sí | Apache 2.0 | safetensors (original) | Modelo oficial sin desensurar; referencia de calidad y alineación |
| Otras variantes GGUF del mismo base (p. ej. cuantizaciones estándar Q4_K_M) | 27B denso | 262.144 | Sí (proyector separado) | Apache 2.0 | GGUF | Sin perfil K_P ni FastMTP; menor tamaño por cuantización equivalente |

No se dispone de datos de benchmarks que permitan comparar rendimiento de calidad frente a alternativas de otros fabricantes en la misma categoría.

## Limitaciones y advertencias

- El perfil "Aggressive" elimina los rechazos de forma deliberada; esto implica un riesgo elevado de generar contenido dañino, inseguro o legalmente problemático sin filtros. No es adecuado para aplicaciones orientadas al público sin una capa de moderación externa.
- Riesgo de alucinación inherente a los modelos de 27B en tareas de razonamiento largo y contextos muy extensos; no se han publicado evaluaciones de fidelidad factual en esta variante.
- El autor recomienda una release "Balanced" para trabajo agéntico de contexto largo crítico para la fiabilidad; la variante "Aggressive" prioriza la respuesta directa sobre la robustez.
- Existe una inconsistencia entre el nombre y las specs del autor (27B) y el campo de parámetros safetensors del repo (1.863.907.840); conviene verificar el modelo base antes de usarlo en producción.
- El modelo es una cuantización no oficial publicada por un tercero (kody321) a partir de material de HauhauCS; no está respaldada por Alibaba Qwen. La reproducibilidad y la integridad de los pesos no están garantizadas por el fabricante original.
- Las cuantizaciones K_P y el sidecar FastMTP son formatos propietarios del autor; aunque son GGUFs estándar, su comportamiento puede diferir del esperado en herramientas que no los reconozcan (el autor documenta problemas de visualización en LM Studio y en el widget de Hugging Face).
- El contexto de 262K tokens exige una VRAM de KV cache muy superior a la de los pesos; en GPUs de consumo hay que reducir contexto o hacer offloading, lo que degrada el throughput.
- Idiomas: cobertura principal en inglés y chino; el rendimiento en castellano no está documentado y puede ser inferior.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal del contenido generado por una variante desensurada recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kody321/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del autor original (HauhauCS): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Cuantización Q8_K_P: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q8_K_P.gguf
- Cuantización Q6_K_P: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q6_K_P.gguf
- Cuantización Q5_K_P: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q5_K_P.gguf
- Cuantización Q4_K_P: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q4_K_P.gguf
- Cuantización IQ4_XS: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ4_XS.gguf
- Cuantización Q3_K_P: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q3_K_P.gguf
- Cuantización IQ3_M: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ3_M.gguf
- Cuantización IQ3_XS: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ3_XS.gguf
- Cuantización Q2_K_P: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q2_K_P.gguf
- Cuantización IQ2_M: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ2_M.gguf
- Proyector de visión BF16: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/mmproj-Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-BF16.gguf
- Sidecar FastMTP 32K: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-FastMTP-32K.gguf
