# Harsha282007/student-guidance-ai

## Resumen

Student Guidance AI es un ajuste fino mediante LoRA del modelo Qwen2.5-0.5B-Instruct, publicado por el usuario Harsha282007 en Hugging Face. El proyecto se presenta como una iniciativa educativa cuyo objetivo es ofrecer orientación académica y recomendaciones de estudio personalizadas a partir de información sobre el rendimiento del estudiante. El modelo base es un transformer causal de la familia Qwen2.5, con aproximadamente 494 millones de parámetros, lo que lo sitúa en la categoría de modelos pequeños aptos para despliegue en hardware modesto.

El repositorio contiene un adaptador LoRA y un modelo fusionado, además de archivos JSONL con ejemplos de orientación académica para entrenamiento y validación. Según la model card, el adaptador se entrenó con rango 8, alpha 16, dropout 0.05 y módulos objetivo q_proj y v_proj. El modelo se distribuye también en formato GGUF con cuantización Q4_K_M, lo que facilita su importación en Ollama mediante un Modelfile.

La relevancia de esta ficha es limitada: se trata de un proyecto de demostración con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados ni verificación independiente del proceso de entrenamiento. No obstante, resulta útil como ejemplo de aplicación de técnicas de ajuste eficiente de parámetros (PEFT) sobre modelos pequeños en el dominio educativo, y permite ilustrar el flujo completo desde el adaptador LoRA hasta la cuantización GGUF y el despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2.5) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | GGUF Q4_K_M (unica cuantizacion documentada) |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA y modelo fusionado), GGUF |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-0.5B-Instruct, un transformer causal decoder-only con normalización RMSNorm, atención con RoPE y sesgo de atención (QKV bias), tal como corresponde a la familia Qwen2.5. Sobre esta base se aplicó un ajuste fino LoRA con rango 8, alpha 16, dropout 0.05 y módulos objetivo limitados a q_proj y v_proj, lo que reduce drásticamente el número de parámetros entrenables en comparación con un ajuste completo. El repositorio incluye tanto el adaptador como un modelo fusionado resultante.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de que contiene ejemplos de orientación académica en JSONL, ni si se aplicaron técnicas de RLHF o DPO. La model card advierte explícitamente que el uso de esos archivos JSONL para producir el GGUF subido no ha sido verificado de forma independiente. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional orientada a orientación académica y recomendaciones de estudio.
- Análisis de información sobre rendimiento del estudiante para producir recomendaciones personalizadas, según la descripción del proyecto.
- Aplicaciones de chatbot educativo, con formato conversacional multi-turno heredado del modelo base Instruct.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este ajuste; el modelo base Qwen2.5-0.5B-Instruct sí lo soporta, pero no se confirma su preservación tras el ajuste.
- Capacidades de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: la model card indica únicamente inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Orientación académica conversacional: el modelo puede mantener diálogos multi-turno con estudiantes y generar recomendaciones de estudio a partir de datos de rendimiento, aprovechando el formato Instruct del modelo base.
- Chatbot educativo de apoyo: integrable en portales o aplicaciones de instituciones educativas para responder preguntas frecuentes sobre hábitos de estudio, planificación y organización académica.
- Generación de planes de estudio personalizados: a partir de un perfil de rendimiento (asignaturas, calificaciones, dificultades), el modelo produce borradores de recomendaciones que un tutor humano revisa después.
- Prototipado rápido de asistentes educativos en local: gracias al formato GGUF Q4_K_M y al tamaño de 0,5 mil millones de parámetros, puede ejecutarse en portátiles sin GPU dedicada mediante Ollama o llama.cpp.
- Demostración de pipelines PEFT: útil como ejemplo reproducible del flujo adaptador LoRA, fusión de pesos, cuantización GGUF e importación en Ollama para equipos docentes o investigadores que quieran replicar la metodología.
- Análisis exploratorio de datos educativos: el modelo puede resumir o reformular informes de rendimiento estudiantil en lenguaje natural para que tutores no técnicos los interpreten con más facilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo fusionado en FP16 requiere aproximadamente 1 GB de VRAM (0,99 GB para 494 millones de parámetros); en GGUF Q4_K_M el peso se reduce a unos 0,3-0,4 GB, coherente con el tamaño del repositorio (0,4 GB).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o incluso una GTX 1650 pueden ejecutar el modelo con comodidad. Para lotes grandes o despliegue servido, una A100 o H100 está sobredimensionada para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM; también puede ejecutarse en CPU.
- Opciones de despliegue: Ollama (la model card documenta la importación mediante Modelfile), llama.cpp con el GGUF, y potencialmente vLLM o TGI con los pesos safetensors fusionados, aunque no se documenta compatibilidad explícita con estos últimos.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia de milisegundos por token en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Student Guidance AI (este modelo) | 494 M | no disponible | no disponible | Hugging Face, GGUF y safetensors | Ajuste LoRA de dominio educativo, sin benchmarks |
| Qwen2.5-0.5B-Instruct (base) | 494 M | 32.768 tokens (segun documentacion de Qwen) | Apache 2.0 (segun documentacion de Qwen) | Hugging Face, ampliamente desplegado | Modelo Instruct generalista, con tool calling |
| SmolLM2-360M-Instruct | 360 M | 8.192 tokens (segun documentacion de Hugging Face) | Apache 2.0 | Hugging Face | Alternativa pequena generalista para edge |
| Llama 3.2 1B Instruct | 1.240 M | 128.000 tokens (segun documentacion de Meta) | Llama 3.2 Community License | Hugging Face | Mayor capacidad, requiere mas recursos |

La comparativa se limita a datos públicos de los modelos alternativos; no hay resultados de benchmarks del modelo ajustado para contrastar rendimiento.

## Limitaciones y advertencias

- La model card advierte que el modelo puede generar recomendaciones inexactas o genéricas; su salida debe tratarse como asistencia educativa, no como evaluación académica profesional.
- No debe usarse para decisiones de alto impacto (admisión, evaluación formal, orientación vocacional vinculante).
- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen2.5-0.5B-Instruct, hereda los sesgos del modelo base y de los datos de ajuste, que no se describen.
- Riesgo de alucinación: elevado en modelos de este tamaño, especialmente en recomendaciones personalizadas cuando los datos de entrada son escasos o ambiguos.
- Limitaciones de contexto e idioma: la model card indica solo inglés; la longitud de contexto efectiva del ajuste no está documentada.
- Restricciones de licencia: la licencia no está disponible en el repositorio, lo que impide confirmar si el uso comercial está permitido. El modelo base Qwen2.5-0.5B-Instruct se distribuye bajo Apache 2.0 según su documentación, pero la licencia del ajuste no se especifica.
- Caveat de producción: cero descargas y cero likes, sin verificación independiente del dataset ni del proceso de entrenamiento; no apto para producción sin evaluación propia.
- El repositorio incluye archivos JSONL de datos que pueden contener información de estudiantes; su procedencia y consentimiento no están documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harsha282007/student-guidance-ai
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Referencia de investigación sobre IA para orientación profesional (resultado de búsqueda): https://www.researchgate.net/publication/354171816_Artificial_Intelligence_for_Career_Guidance_-_Current_Requirements_and_Prospects_for_the_Future
