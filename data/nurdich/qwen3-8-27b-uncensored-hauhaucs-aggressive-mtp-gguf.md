# nurdich/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

El modelo `nurdich/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF` es una versión "uncensored" (sin censura) del modelo Qwen3.8-27B, desarrollada por HauhauCS y publicada en HuggingFace por el usuario nurdich. Se trata de un modelo denso de 27.000 millones de parámetros con arquitectura híbrida (atención gated y capas Gated DeltaNet), encoder de visión y capacidades multimodales (imagen, video y texto). La variante "Aggressive" elimina por completo el comportamiento de rechazo: según la model card, obtiene 0/465 refusals en pruebas internas, ofreciendo respuestas directas y sin preámbulos en prompts difíciles.

La relevancia de este lanzamiento reside en tres aspectos: preserva íntegramente las capacidades del modelo base (razonamiento, agentes, tool calling, visión), incorpora una ventana de contexto nativa de 262.144 tokens extensible a 1.000.000, y añade el sidecar HauhauCS FastMTP, un perfil de decodificación especulativa que acelera la generación hasta 3,02× en documentos y 1,93× en razonamiento frente a la versión sin MTP. Todo el paquete se distribuye en formato GGUF con cuantizaciones personalizadas K_P ("Perfect") que optimizan la calidad por nivel de compresión, y es compatible con runtimes estándar como llama.cpp, LM Studio u Ollama.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense 27B causal LM con vision encoder; 64 capas, hidden size 5.120, FFN 17.408; 48 capas Gated DeltaNet + 16 capas gated-attention |
| Parametros totales | 27B (modelo base Qwen3.8-27B); el archivo safetensors de 1.863.907.840 (~1,86B) corresponde al projector de visión |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M |
| Idiomas soportados | Inglés, chino, multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (texto) + BF16 para el projector de visión (mmproj) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.8-27B combina 48 capas de Gated DeltaNet (una variante de atención lineal con compuertas) con 16 capas de atención gated tradicional, lo que la convierte en un diseño híbrido entre transformer y SSM. Esta mezcla busca equilibrar eficiencia computacional en contextos largos con capacidad de razonamiento profundo. El modelo incluye de forma nativa un head MTP (Multi-Token Prediction) o NextN, que permite predecir varios tokens por paso, y un encoder de visión para entrada de imágenes y video.

El proceso de "uncensoring" aplicado por HauhauCS no modifica los pesos del modelo base ni sus datasets de entrenamiento, sino que aplica un perfil de comportamiento que elimina los rechazos y las respuestas evasivas. La variante "Aggressive" es la más directa: responde sin negociar ni autocensurarse. No se han publicado detalles sobre la metodología exacta (si es abliteration, fine-tuning con RLHF inverso u otra técnica), aunque el blog de MindStudio describe una técnica similar de abliteration con drift KL para otro modelo de la misma familia. El sidecar FastMTP es un archivo adicional de 903 MB que define un perfil de decodificación especulativa optimizado para la longitud de contexto máxima, cualificado para todas las cuantizaciones.

## Capacidades

- Generación de texto, razonamiento lógico, matemáticas y código, heredadas del modelo base Qwen3.8-27B.
- Comprensión multimodal: procesamiento de imágenes y video mediante el projector de visión BF16 incluido.
- Tool calling / function calling: soporte nativo para invocar herramientas externas en flujos de agente.
- Razonamiento multi-paso y capacidades de agente autónomo, incluyendo planificación y ejecución de tareas.
- Multilingüe: inglés, chino y otros idiomas, con especial fortaleza en los dos primeros.
- Decodificación especulativa: MTP nativo (NextN) más el perfil FastMTP que acelera la generación hasta 3,02× en documentos y 1,93× en razonamiento.
- Perfil uncensored: respuestas directas, sin rechazos (0/465 en pruebas) y sin preámbulos en prompts complejos o delicados.
- Contexto largo: ventana nativa de 262.144 tokens, ampliable hasta 1.000.000, adecuada para documentos extensos y conversaciones prolongadas.

## Casos de uso

- Atención al cliente automatizada: con 262K tokens de contexto, el modelo puede gestionar conversaciones multi-turno con historial completo y documentación de producto, respondiendo sin evasivas incluso ante quejas o solicitudes complejas.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, con la ventaja de no rechazar peticiones de implementación de funciones delicadas.
- Análisis de documentos legales o financieros extensos: la ventana de 262K tokens permite procesar contratos, informes anuales o expedientes completos en una sola pasada, extrayendo cláusulas o detectando inconsistencias.
- Asistentes de visión por computadora: el encoder de visión permite analizar imágenes médicas, capturas de pantalla o vídeos de vigilancia, describiendo contenido o respondiendo preguntas sobre lo que ve.
- Investigación en seguridad y alineación de IA: el perfil uncensored facilita el estudio de comportamientos de rechazo, sesgos y límites de los modelos, permitiendo reproducir escenarios que otros modelos bloquean.
- Desarrollo de agentes autónomos: combinando tool calling, razonamiento multi-paso y contexto largo, puede actuar como núcleo de un agente que navega por APIs, consulta bases de datos y ejecuta tareas complejas sin necesidad de intervención humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) específicos para esta versión uncensored en la información disponible. La model card no incluye métricas de rendimiento académico, y los datos existentes se centran en la velocidad de generación. A continuación se muestran las cifras de aceleración declaradas por el autor para el sidecar FastMTP:

| Métrica | Mejora frente a no-MTP | Mejora frente a MTP embebido |
|---|---|---|
| Token generation (documentos) | hasta 3,02× | hasta 35,2% más |
| Token generation (razonamiento) | hasta 1,93× | hasta 21,1% más |

Un informe independiente (John Paul Wile, 2025) reporta una velocidad media de 132,89 tokens/segundo en una RTX 5090 con contexto completo de 262.144 tokens y MTP habilitado, lo que confirma la eficacia del mecanismo de decodificación especulativa.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (solo pesos del modelo, sin contexto):
  - Q8_K_P: ~31,5 GB
  - Q6_K_P: ~25,9 GB
  - Q5_K_P: ~20,2 GB
  - Q4_K_P: ~17,9 GB
  - Q3_K_P: ~13,4 GB
  - Q2_K_P: ~10,7 GB
- Para usar la ventana completa de 262.144 tokens se necesita VRAM adicional (varios GB según la longitud real), por lo que se recomienda al menos 32 GB para cuantizaciones Q4 o superiores con contexto largo.
- GPU recomendadas: RTX 5090 (32 GB) para cuantizaciones altas y contexto completo; RTX 4090 (24 GB) para Q4_K_P o Q5_K_P con contexto moderado; A100 40/80 GB o H100 para despliegues profesionales con contexto máximo.
- En GPU de consumo, la RTX 4090 y la RTX 5090 son suficientes para uso local; tarjetas con 16 GB (como RTX 4080) pueden ejecutar Q3_K_P o IQ3_M con contexto reducido.
- Opciones de despliegue: llama.cpp (compatible con GGUF), LM Studio, Ollama (existe un tag con el perfil uncensored), vLLM (con conversión a safetensors), y TGI.
- Latencia y throughput: 132,89 tokens/segundo en RTX 5090 con MTP y contexto completo (medición independiente). Sin MTP, la velocidad se reduce aproximadamente a la mitad según las cifras del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perfil | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Alineado (con rechazos) | Apache-2.0 | Safetensors, GGUF |
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive (este) | 27B | 262K (ext. 1M) | Uncensored agresivo | Apache-2.0 | GGUF |
| Qwen3.8-27B AEON Uncensored | 27B | 262K | Uncensored (abliteration) | Apache-2.0 | Safetensors, GGUF |

No se dispone de benchmarks comparativos numéricos entre estas variantes. La diferencia principal radica en el perfil de comportamiento: el modelo base rechaza ciertas peticiones, mientras que las versiones uncensored responden directamente. La variante HauhauCS Aggressive se distingue por su perfil "agresivo" (sin preámbulos) y por la inclusión del sidecar FastMTP, que no está presente en otras versiones.

## Limitaciones y advertencias

- Perfil uncensored: al eliminar los rechazos, el modelo puede generar contenido ofensivo, ilegal, peligroso o éticamente cuestionable. No es adecuado para aplicaciones orientadas al público general sin supervisión humana o filtros adicionales.
- Sesgos del modelo base: al no modificarse los pesos, persisten los sesgos de género, raza, religión y otros presentes en Qwen3.8-27B, que pueden amplificarse al no existir mecanismos de rechazo.
- Riesgo de alucinación: como todo LLM, puede inventar hechos, citas o referencias, especialmente en contextos largos o temas poco representados en sus datos de entrenamiento.
- Limitaciones de idioma: aunque es multilingüe, su rendimiento fuera de inglés y chino es significativamente inferior; en idiomas minoritarios la calidad de generación puede degradarse.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones, pero el contenido generado por el modelo puede violar leyes de difamación, privacidad o seguridad en algunas jurisdicciones. El usuario es responsable del uso.
- Contexto extenso: aunque soporta 262K tokens, el uso completo de la ventana requiere mucha VRAM y puede degradar la calidad de atención en los extremos del contexto si no se gestiona correctamente.
- Compatibilidad: los quants K_P pueden mostrar un "?" en LM Studio, aunque funcionan correctamente; el sidecar FastMTP requiere un runtime compatible con perfiles de decodificación especulativa personalizados.

## Enlaces

- Repositorio HuggingFace (nurdich): https://huggingface.co/nurdich/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Repositorio HuggingFace original (HauhauCS): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub con pack uncensored y tag de Ollama: https://github.com/Wassimyounes01/qwen38-uncensored
- Informe independiente de ejecución en RTX 5090: https://johnpaulwile.substack.com/p/i-ran-qwen-38-27b-on-a-single-rtx
- Artículo sobre abliteration de Qwen3.8-27B (MindStudio): https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
