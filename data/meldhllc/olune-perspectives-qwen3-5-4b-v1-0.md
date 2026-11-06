# MeldhLLC/Olune-Perspectives-Qwen3.5-4B-v1.0

## Resumen

Olune Perspectives Qwen3.5-4B v1.0 es un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-4B, desarrollado por MeldhLLC para la aplicación Olune. El modelo está especializado en reflexión filosófica a través de distintas tradiciones de pensamiento, lo que lo convierte en una herramienta orientada a la conversación contemplativa más que a tareas de ingeniería o razonamiento técnico general. Se distribuye principalmente como un archivo GGUF cuantizado en Q4_K_M de 2,71 GB, pensado para ejecutarse en llama.cpp.

El modelo cuenta con 4.205.751.296 parámetros totales (aproximadamente 4,2 mil millones) y está publicado bajo licencia Apache 2.0, lo que permite uso comercial con atribución. La model card indica que requiere un runtime con soporte para GGUF de Qwen3.5 y que acepta únicamente entrada de texto. Su relevancia actual radica en ser un ejemplo de especialización vertical de un modelo pequeño y abierto para un dominio concreto (filosofía), desplegable en hardware modesto.

La información pública disponible es escasa: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card no detalla el proceso de entrenamiento, los datos utilizados ni resultados de evaluación. Esta ficha refleja únicamente lo que el autor y los metadatos de Hugging Face hacen público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 4.205.751.296 (~4,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (publicado); otras no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 2,7 GB |

## Arquitectura y entrenamiento

El modelo es un finetune del base Qwen/Qwen3.5-4B, por lo que hereda la arquitectura transformer de dicho modelo. No se dispone de información pública sobre la arquitectura interna específica (número de capas, dimensiones, tipo de atención) ni sobre si incorpora innovaciones como atención lineal o decodificación especulativa. Tampoco se detalla la longitud de contexto nativa del modelo base en la información proporcionada.

En cuanto al entrenamiento, la model card no especifica el número de tokens utilizados, la composición del dataset de ajuste fino ni si se emplearon técnicas de RLHF, DPO o similares. El único dato relevante es la orientación temática: el ajuste busca que el modelo reflexione desde distintas tradiciones filosóficas. Se desconoce igualmente si hubo fases de alineación o filtrado de seguridad propios; el autor advierte que los controles de seguridad de la aplicación Olune son independientes de estos pesos.

## Capacidades

- Generación de texto conversacional orientada a la reflexión filosófica y al diálogo multi-turno.
- Exploración de distintas tradiciones de pensamiento filosófico (el eje temático declarado del modelo).
- Conversación general en inglés, heredada del modelo base Qwen3.5-4B.
- Entrada exclusivamente de texto (la model card indica "Text input only").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es solo texto.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente de reflexión filosófica personal: el modelo puede mantener conversaciones multi-turno sobre cuestiones éticas o existenciales, ofreciendo perspectivas desde distintas tradiciones, que es exactamente el propósito declarado del ajuste.
- Herramienta educativa en humanidades: útil para introducir a estudiantes en corrientes filosóficas mediante diálogo guiado, con la salvedad de verificar las afirmaciones fácticas.
- Prototipado de aplicaciones de bienestar contemplativo: al ser un GGUF de 2,71 GB, puede integrarse en aplicaciones de escritorio o móviles con llama.cpp para sesiones de journaling o reflexión guiada.
- Generación de borradores de ensayo o material de discusión filosófica: el modelo puede producir texto exploratorio que luego un humano revise y amplíe.
- Despliegue local en entornos con recursos limitados: su tamaño permite ejecución en CPU o GPU de gama media sin infraestructura en la nube, útil para demos y pruebas de concepto.
- Base para experimentación en ajuste fino de dominio: al estar bajo Apache 2.0 y derivar de un modelo pequeño, sirve como punto de partida para investigadores que quieran estudiar especialización temática en modelos de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M publicado ocupa 2,71 GB, por lo que se necesita aproximadamente 3-4 GB de memoria (VRAM o RAM) para cargarlo, más el espacio para el contexto.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con 4-6 GB o más de VRAM es suficiente (por ejemplo, RTX 3060, RTX 4060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en la mayoría de GPU consumer modernas con al menos 4-6 GB de VRAM; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (librería declarada); se requiere un runtime con soporte para GGUF de Qwen3.5. Otros motores (vLLM, TGI, Ollama) no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Olune Perspectives Qwen3.5-4B v1.0 | ~4,2 B | no disponible | Apache 2.0 | GGUF Q4_K_M | Finetune filosófico, solo inglés, solo texto |
| Qwen/Qwen3.5-4B (base) | ~4,2 B | no disponible | no disponible en esta ficha | safetensors/GGUF (según repo base) | Modelo generalista del que deriva |
| Alternativas de 4B generalistas | ~4 B | variable | variable | variable | No se dispone de datos comparativos de rendimiento |

No se dispone de datos de benchmarks ni de comparativas de rendimiento verificables con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación: el propio autor advierte que el modelo puede inventar información y manejar mal el contexto o las correcciones; hay que verificar las afirmaciones importantes.
- No es sustituto de asesoramiento médico, de salud mental, legal o financiero cualificado, según la model card.
- Los controles de seguridad de la aplicación Olune no están incluidos en estos pesos; el despliegue propio carece de esas salvaguardas.
- Idiomas: solo se declara inglés, lo que limita su uso en castellano u otros idiomas.
- Contexto: se desconoce la longitud de contexto soportada, lo que dificulta planificar conversaciones largas.
- Especialización estrecha: el ajuste filosófico puede degradar el rendimiento en tareas técnicas, de código o matemáticas respecto al modelo base.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar avisos de atribución (ver NOTICE del repositorio).
- Madurez: repositorio con 0 descargas y 0 likes; sin evidencia pública de validación por terceros.
- Requiere un runtime con soporte específico para GGUF de Qwen3.5, lo que puede limitar la compatibilidad con herramientas estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MeldhLLC/Olune-Perspectives-Qwen3.5-4B-v1.0
- Descarga directa del GGUF Q4_K_M: https://huggingface.co/MeldhLLC/Olune-Perspectives-Qwen3.5-4B-v1.0/resolve/main/olune-perspectives-qwen35-v1.0-Q4_K_M.gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Sitio del proyecto Olune: https://olune.ai/
- Licencia: https://huggingface.co/MeldhLLC/Olune-Perspectives-Qwen3.5-4B-v1.0/blob/main/LICENSE
- Atribución: https://huggingface.co/MeldhLLC/Olune-Perspectives-Qwen3.5-4B-v1.0/blob/main/NOTICE
- Checksum SHA-256: https://huggingface.co/MeldhLLC/Olune-Perspectives-Qwen3.5-4B-v1.0/blob/main/SHA256SUMS
