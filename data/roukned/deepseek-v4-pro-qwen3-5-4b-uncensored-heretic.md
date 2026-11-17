# roukned/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic es una versión "descensurada" del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, un ajuste fino de razonamiento sobre Qwen3.5-4B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El modelo lo publica el usuario roukned aplicando la herramienta Heretic v2.0.0, que realiza una ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 16 a 32 para reducir drásticamente la tasa de rechazos.

El modelo base es un transformer denso de 4.539.265.536 parámetros (aproximadamente 4,5B) entrenado con una mezcla de unas 250.000 muestras centradas en matemáticas y STEM, siguiendo el mismo pipeline que la versión de 9B. La intervención de Heretic reduce los rechazos de 99/100 en el modelo original a 5/100, con una divergencia KL de 0,0378 respecto al original, lo que indica una alteración moderada de la distribución de salida.

Es relevante para desarrolladores e investigadores que necesitan un modelo compacto de razonamiento matemático sin las restricciones de rechazo del modelo alineado original, desplegable en hardware de consumo. La licencia Apache 2.0 facilita su uso comercial, aunque la eliminación de salvaguardas introduce riesgos que deben gestionarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), con soporte MTP (multi-token prediction) |
| Parametros totales | 4.539.265.536 (~4,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (repo en safetensors; evaluado en MTP-Q8) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.5 con aproximadamente 4,5B de parámetros. Se trata de un ajuste fino supervisado (SFT) sobre Qwen3.5-4B, destilado de las respuestas de DeepSeek-V4-Pro en modo Max Effect. El entrenamiento emplea una mezcla de aproximadamente 250.000 muestras de matemáticas y STEM, siguiendo el mismo pipeline que la versión de 9B del mismo autor. La model card menciona soporte de MTP (multi-token prediction), evaluado en cuantización Q8, lo que sugiere decodificación especulativa nativa para acelerar la generación.

La modificación "heretic" aplica Arbitrary-Rank Ablation (ARA) sobre las capas 16 a 32, con los siguientes parámetros: start_layer_index 16, end_layer_index 32, preserve_good_behavior_weight 0,9854, steer_bad_behavior_weight 0,0002, overcorrect_relative_weight 0,6587 y neighbor_count 10. Esta técnica proyecta fuera del espacio de activaciones las direcciones asociadas al comportamiento de rechazo, preservando en gran medida el comportamiento útil (peso 0,9854). El resultado es una reducción de rechazos de 99/100 a 5/100 con una divergencia KL de 0,0378 frente al modelo original.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso con descomposición explícita de problemas.
- Razonamiento matemático y científico reforzado mediante destilación de un profesor de mayor capacidad (DeepSeek-V4-Pro).
- Capacidad multimodal de entrada imagen-texto según el tag image-text-to-text del repo, aunque no se detalla en la model card.
- Soporte multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (reasoning) heredado del pipeline de destilación.
- Reducción drástica de rechazos: responde a peticiones que el modelo alineado original rechazaría (5/100 frente a 99/100).
- Compatibilidad con endpoints (tag endpoints_compatible) y text-generation-inference.
- No se documenta soporte explícito de tool calling ni de agentes en la información disponible.

## Casos de uso

- Resolución de problemas matemáticos y de STEM en entornos educativos o de investigación: el modelo ha sido entrenado con unas 250.000 muestras de matemáticas y ciencia, por lo que es adecuado para generar soluciones paso a paso con razonamiento explícito.
- Generación de datos sintéticos de razonamiento: al no rechazar peticiones, puede emplearse para producir trazas de razonamiento y pares pregunta-respuesta en dominios técnicos sin las interrupciones típicas de los modelos alineados.
- Asistente técnico interno sin filtros corporativos: en herramientas de desarrollo donde el equipo controla el contenido, la baja tasa de rechazos evita fricción en consultas legítimas sobre seguridad, criptografía o análisis de vulnerabilidades.
- Investigación sobre alineación y ablación: el modelo sirve como caso de estudio reproducible de ARA, con parámetros documentados y métricas de rechazo y KL, útil para comparar técnicas de modificación de comportamiento.
- Despliegue en hardware de consumo: con ~4,5B de parámetros, es viable en GPUs de gama alta para consumidores, lo que permite prototipado local de asistentes de razonamiento sin infraestructura de servidor.
- Traducción y generación multilingüe en los seis idiomas soportados (en, zh, ko, ja, es, ru), por ejemplo para localización de documentación técnica.
- Fine-tuning posterior especializado: al estar bajo Apache 2.0 y en safetensors, puede servir de base para ajustes adicionales en dominios concretos (por ejemplo, el autor enlaza un fine-tune científico, DeepThought-STEM).

## Benchmarks y rendimiento

La model card solo publica métricas de la intervención de descensurado, no benchmarks estándar (MMLU, GSM8K, HumanEval).

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B) |
|---|---|---|
| Rechazos | 5/100 | 99/100 |
| Divergencia KL | 0,0378 | 0 (por definición) |

No se han publicado resultados de benchmarks de razonamiento, matemáticas o código en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo denso de ~4,5B, en FP16 se requieren aproximadamente 9 GB de pesos (el repo ocupa 9,3 GB), y en cuantizaciones de 8 y 4 bits bajaría a rangos de ~4,5-5 GB y ~2,5-3 GB respectivamente (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en RTX 4090, RTX 3090 y GPUs profesionales tipo A100/H100 para despliegue de mayor concurrencia.
- Cabe en GPU de consumo: sí, previsiblemente en GPUs con 8-12 GB o más de VRAM según cuantización (estimación no confirmada).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag), endpoints compatibles; el ecosistema unsloth aparece en los tags. No se confirma soporte de vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles. La model card menciona evaluación en MTP-Q8, lo que sugiere uso de multi-token prediction para acelerar la decodificación, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic) | ~4,5B | No disponible | Apache 2.0 | Descensurado con Heretic; 5/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B | ~4,5B | No disponible | No disponible | Modelo base alineado; 99/100 rechazos |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9B | No disponible | No disponible | Versión de 9B del mismo pipeline, misma receta de destilación |
| xtools-at/Qwen3.5-4B-DeepThought-STEM | ~4B | No disponible | No disponible | Fine-tune científico basado en este modelo |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La eliminación de salvaguardas implica que el modelo puede generar contenido dañino, ilegal o sesgado sin rechazo; requiere filtros externos y supervisión en cualquier despliegue público.
- La divergencia KL de 0,0378 indica que la distribución de salida se ha alterado respecto al modelo original; pueden aparecer degradaciones en tareas no relacionadas con el rechazo.
- Riesgo de alucinación inherente a modelos pequeños destilados de profesores mayores; la destilación de razonamiento no garantiza corrección factual.
- El entrenamiento se centra en matemáticas y STEM (~250.000 muestras); el rendimiento en otros dominios puede ser inferior.
- Longitud de contexto no documentada; no debe asumirse una ventana larga sin verificación empírica.
- Idiomas limitados a en, zh, ko, ja, es y ru; el soporte real por idioma no está cuantificado.
- Licencia Apache 2.0 permite uso comercial, pero el publicador no ofrece garantías sobre el cumplimiento normativo del contenido generado.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes independientes de calidad.
- La model card está truncada en la información proporcionada; pueden existir secciones adicionales (evaluación, uso previsto) no recogidas aquí.

## Enlaces

- Hugging Face: https://huggingface.co/roukned/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Versión 9B descensurada: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Fine-tune científico DeepThought-STEM: https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM
- Heretic (herramienta de descensurado): https://heretic-project.org
