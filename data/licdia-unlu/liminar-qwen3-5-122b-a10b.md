# LICDIA-UNLu/Liminar-Qwen3.5-122B-A10B

## Resumen

Liminar-Qwen3.5-122B-A10B es un ajuste fino (finetune) del modelo Qwen 3.5 122B-A10B, desarrollado por el Laboratorio de Investigación en Ciencia de Datos & Inteligencia Artificial (LICDIA) de la Universidad Nacional de Luján (Argentina). Forma parte de la familia Liminar, una iniciativa de modelos de lenguaje abiertos del sistema universitario argentino orientada a la normativa universitaria, las instituciones académicas y el español formal de Argentina. El modelo parte de una arquitectura MoE (mezcla de expertos) del modelo base Qwen, con 125.086.497.008 parámetros totales según los pesos en safetensors.

El problema que resuelve es la brecha de conocimiento del modelo base sobre normativa universitaria argentina y el registro formal local. El ajuste se realizó mediante LoRA de rango 256 sobre las capas lineales (atención y experto compartido de cada bloque), fusionado posteriormente con el modelo base. Los expertos enrutados quedaron intactos respecto al modelo original. El entrenamiento se ejecutó con FSDP en un nodo de la supercomputadora Clementina XXI (8 tiles de GPU Intel Data Center Max 1550), con un coste de 380 horas de GPU (horas de tile).

Es relevante ahora porque demuestra que un equipo universitario puede adaptar un modelo MoE de gran escala a un dominio normativo con recursos de supercomputación pública, publicando la receta completa y versiones cuantizadas (GGUF) para despliegue sin GPU. La licencia Apache 2.0, heredada del modelo base, facilita su reutilización comercial e institucional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) basada en Qwen 3.5; tag `qwen3_5_moe` |
| Parametros totales | 125.086.497.008 |
| Parametros activos | no disponible (el modelo base se denomina 122B-A10B, lo que sugiere ~10B activos, pero no se confirma en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (8 bits) y Q4_K_M (4 bits); safetensors en bf16 |
| Idiomas soportados | es (español, con foco en español formal de Argentina) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MoE de Qwen 3.5 122B-A10B, un transformer con mezcla de expertos. El ajuste fino se implementó como un LoRA de rango 256 aplicado sobre las capas lineales, cubriendo las capas de atención y el experto compartido de cada bloque; los expertos enrutados no se modificaron respecto al modelo base. El LoRA se fusionó con el modelo base tras el entrenamiento. La ejecución usó FSDP sobre 8 tiles de GPU Intel Data Center Max 1550 en la supercomputadora Clementina XXI, con un total de 380 horas de GPU (horas de tile). Se realizó una época de preguntas y respuestas y dos épocas con todos los datos.

Los datos de entrenamiento provienen de: normativa universitaria nacional de Infoleg (base de datos.jus.gob.ar, CC BY 4.0), curada a mano; textos públicos sobre vida universitaria de argentina.gob.ar (CC BY 4.0), CONICET (CC BY 2.5 AR) y el Consejo Interuniversitario Nacional (con permiso); y datos generados a partir de ese corpus con el documento a la vista (fragmentos con su ficha, versiones reescritas, preguntas y respuestas, abstención, identidad, respuestas del modelo base a consignas generales y ejemplos de consulta con documentos). Las respuestas de entrenamiento las escribió Qwen 3.5 27B, por lo que el modelo aprende en parte su estilo. El ajuste se hizo sin el modo de razonamiento de Qwen 3.5, y la plantilla de chat lo deja apagado por omisión.

## Capacidades

- Generación de texto en español formal de Argentina, con énfasis en registro académico y normativo.
- Respuesta a preguntas sobre normativa universitaria argentina (leyes, decretos, resoluciones del corpus de Infoleg).
- Consulta con documentos (RAG): el modelo está entrenado con ejemplos de consulta con documentos y responde usando fragmentos recuperados.
- Abstención: incluye datos de entrenamiento específicos para que el modelo se abstenga cuando no dispone de información.
- Identidad: entrenado para reconocer su propia identidad como modelo de la familia Liminar.
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Capacidad de imagen a texto: el tag `image-text-to-text` figura en el repositorio, aunque no se detalla su alcance en la model card.
- Compatibilidad con endpoints (`endpoints_compatible`).
- No se menciona soporte explícito de tool calling, function calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Asistente de consulta normativa universitaria: el modelo responde preguntas sobre leyes y decretos del corpus de Infoleg, con una tasa de acierto del 31,7 % sin documentos (frente al 8,3 % del modelo base), adecuado como primera capa de orientación en secretarías académicas y jurídicas.
- Sistemas RAG sobre digestos institucionales: integrado con un recuperador real, el modelo promedia 4,99 sobre 5 en la rúbrica de utilidad, fidelidad, completitud y claridad, con 0 respuestas con datos incorrectos de 60 consultas, lo que lo hace apto para asistentes de consulta documental en universidades.
- Atención a estudiantes y personal administrativo: gestión de conversaciones multi-turno sobre vida académica, becas, trámites y normativa, en español formal argentino.
- Generación de borradores de documentos institucionales: redacción de notas, informes y comunicaciones con el registro formal local, partiendo de la base de estilo aprendida.
- Capa base para adaptaciones institucionales: cada universidad puede aplicar la receta publicada (LoRA de rango 256, FSDP) para incorporar sus actos internos y normativa propia sobre este modelo.
- Despliegue en entornos sin GPU: las versiones GGUF Q4_K_M (75,8 GB) y Q8_0 (132,6 GB) permiten ejecución con llama.cpp o LM Studio en CPU, útil para nodos universitarios con hardware limitado.
- Investigación en adaptación de dominio: la receta, los datos y la evaluación publicados sirven como referencia reproducible para ajustar modelos MoE grandes a dominios normativos.

## Benchmarks y rendimiento

| Evaluación | Modelo base | Liminar | gpt-4.1-mini (referencia) |
|---|---|---|---|
| Normativa sin documentos (300 preguntas): respuestas correctas | 8,3 % | 31,7 % | 14,3 % |
| Normativa sin documentos: nota media del juez (0 a 2) | 0,67 | 1,06 | 0,77 |
| Consulta con documentos, RAG (60 consultas): promedio del juez (1 a 5) | 5,00 | 4,99 | 4,98 |
| RAG: respuestas con algún dato incorrecto | 0 de 60 | 0 de 60 | 0 de 60 |

Las respuestas abiertas las califica Llama 3.3 70B, que no pertenece a ninguna de las familias evaluadas. La evaluación corresponde al modelo en bf16; las versiones cuantizadas no se evaluaron por separado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: el repositorio ocupa 458,6 GB, por lo que la inferencia en precisión completa requiere un nodo multi-GPU de gran capacidad; no se detalla un mínimo exacto.
- Cuantización Q8_0: 132,6 GB en 3 piezas GGUF.
- Cuantización Q4_K_M: 75,8 GB en 2 piezas GGUF.
- GPU recomendadas: no se especifican en la información disponible; el entrenamiento usó 8 tiles de GPU Intel Data Center Max 1550. Para inferencia en bf16 se necesitan GPUs de数据中心 con memoria agregada suficiente (A100/H100 en configuración multi-GPU), sin cifras confirmadas.
- En GPU de consumo: Q4_K_M (75,8 GB) no cabe en una sola GPU consumer; requiere CPU o reparto multi-dispositivo. Las versiones GGUF están pensadas para llama.cpp y LM Studio sin GPU.
- Opciones de despliegue: transformers 5 o posterior (safetensors), llama.cpp (`llama-server -hf LICDIA-UNLu/Liminar-Qwen3.5-122B-A10B:Q4_K_M`), LM Studio. Ollama no carga archivos en piezas; hay que unirlas antes con `llama-gguf-split --merge`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Liminar-Qwen3.5-122B-A10B | 125.086.497.008 (MoE) | no disponible | Apache 2.0 | es | Finetune de dominio normativo argentino; 31,7 % de acierto sin documentos en su benchmark |
| Qwen/Qwen3.5-122B-A10B (base) | 122B-A10B (MoE) | no disponible | Apache 2.0 | multilingüe (no detallado) | Modelo base sin adaptación al dominio; 8,3 % de acierto sin documentos en el mismo benchmark |
| gpt-4.1-mini (referencia propietaria) | no disponible | no disponible | propietaria | multilingüe | 14,3 % de acierto sin documentos y 4,98 en RAG según la evaluación del autor |

No se dispone de datos de otros modelos comparables de la misma categoría (finetunes de dominio normativo en español) en la información proporcionada.

## Limitaciones y advertencias

- No sabe qué normas siguen vigentes ni cuáles cambiaron después de la fecha del corpus; para consultas sobre normas concretas conviene usar RAG sobre una fuente actualizada.
- Puede equivocar números de normas, fechas y montos.
- No conoce los actos internos de cada universidad; esa capa debe añadirse por institución con la receta publicada.
- Riesgo de alucinación en preguntas normativas sin documentos: incluso tras el ajuste, solo acierta el 31,7 % de las 300 preguntas del benchmark sin documentos.
- El modelo aprende en parte el estilo de Qwen 3.5 27B, que generó las respuestas de entrenamiento, lo que puede introducir sesgos de estilo.
- El ajuste se realizó sin modo de razonamiento; la plantilla de chat lo deja apagado por omisión, por lo que no se aprovechan las capacidades de razonamiento extendido del modelo base.
- Las versiones cuantizadas no se evaluaron por separado; su rendimiento puede diferir del bf16 evaluado.
- El tag `image-text-to-text` figura en el repositorio, pero no se detalla el alcance de las capacidades multimodales en la model card; conviene verificarlo antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen 3.5 y de las fuentes de datos (Infoleg CC BY 4.0, CONICET CC BY 2.5 AR, CIN con permiso) para cumplir con la atribución.
- Solo se declara soporte de español; no se garantiza un rendimiento equivalente en otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LICDIA-UNLu/Liminar-Qwen3.5-122B-A10B
- Modelo base Qwen 3.5 122B-A10B: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Repositorio de código y receta: https://github.com/LICDIA-UNLu/liminar
- Documentación: https://licdia-unlu.github.io/liminar
- LICDIA (Universidad Nacional de Luján): https://licdia.unlu.edu.ar
- Asistente de consulta del digesto de la UNLu: https://licdia.unlu.edu.ar/rag-unlu
- Icono del proyecto: https://raw.githubusercontent.com/LICDIA-UNLu/liminar/main/docs/assets/liminar-icono-512.png
