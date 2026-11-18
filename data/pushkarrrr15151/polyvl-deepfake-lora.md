# Pushkarrrr15151/PolyVL-deepfake-lora

## Resumen

PolyVL-deepfake-lora es un adaptador LoRA (PEFT) publicado por el usuario Pushkarrrr15151 sobre el modelo base OpenGVLab/InternVL3-2B, un modelo vision-language de 2.000 millones de parámetros. El adaptador está especializado en detección de deepfakes y análisis forense facial, según las etiquetas del repositorio (`deepfake-detection`, `facial-forensics`, `polyvalent`). El repositorio es de acceso restringido (gated) y la licencia declarada es de solo investigación, lo que limita su uso comercial.

El modelo hereda del InternVL3-2B la capacidad de procesar imágenes y texto de forma conjunta, pero el adaptador ajusta los pesos para una tarea concreta de clasificación/análisis forense. El tamaño del repositorio es de 0,2 GB, coherente con un adaptador LoRA de rango bajo sobre un modelo de 2B. No se dispone de información sobre el dataset de entrenamiento, el número de tokens vistos ni la metodología de ajuste.

La relevancia de esta ficha es limitada: se trata de un adaptador de investigación con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica más allá de las etiquetas. Resulta útil como ejemplo de especialización de un VLM pequeño para forensia facial, pero no debe considerarse un modelo listo para producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer vision-language InternVL3-2B |
| Parametros totales | No disponible (el adaptador LoRA no declara número de parámetros entrenables; el modelo base tiene 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base InternVL3-2B, no declarada en el repositorio) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Gated research only (acceso restringido, solo investigación) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre InternVL3-2B, un modelo vision-language de la familia InternVL3 de OpenGVLab, que combina un codificador visual con un modelo de lenguaje para tareas multimodales. El adaptador LoRA modifica un subconjunto de capas del modelo base mediante matrices de bajo rango, lo que permite especializarlo en detección de deepfakes sin reentrenar los 2.000 millones de parámetros completos. El repositorio tiene un tamaño de 0,2 GB, consistente con un adaptador de rango bajo en formato safetensors.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de las muestras (vídeos, imágenes, pares real/fake), ni sobre si se aplicaron técnicas de RLHF, DPO o aumento de datos. Tampoco se documenta la innovación técnica del adaptador más allá de su etiqueta `polyvalent`, que sugiere un enfoque multi-tarea o multi-dominio en la detección forense, pero no se detalla en la información disponible.

## Capacidades

- Detección de deepfakes: el adaptador está etiquetado explícitamente para `deepfake-detection` y `facial-forensics`, por lo que se espera que clasifique o analice imágenes/vídeos faciales manipulados.
- Análisis forense facial: orientado a identificar artefactos, inconsistencias o señales de manipulación en rostros.
- Procesamiento multimodal imagen-texto: heredado de InternVL3-2B, permite recibir imágenes y prompts textuales.
- Generación de texto: capacidad heredada del modelo base, aunque el adaptador está especializado y puede degradar el rendimiento general.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible; solo se confirma la naturaleza vision-language del modelo base.

## Casos de uso

- Moderación de contenido en plataformas: el adaptador puede integrarse en un pipeline de revisión de imágenes subidas por usuarios para marcar posibles deepfakes faciales antes de la publicación, usando el modelo base para extraer representaciones visuales y el LoRA para la clasificación forense.
- Verificación de identidad en onboarding remoto: en un flujo de KYC, el modelo puede analizar selfies o vídeos cortos y señalar inconsistencias faciales compatibles con manipulación, como capa adicional a la verificación biométrica tradicional.
- Análisis forense en investigación periodística: un periodista puede pasar capturas o fotogramas de un vídeo sospechoso al modelo para obtener una señal preliminar de manipulación antes de recurrir a peritaje humano.
- Filtrado previo en datasets de entrenamiento: antes de entrenar otros modelos de visión, el adaptador puede usarse para descartar imágenes faciales sintéticas o manipuladas y reducir el sesgo del corpus.
- Herramienta de apoyo en análisis de evidencia digital: en entornos de ciberseguridad o fraude, el modelo puede priorizar casos sospechosos para revisión manual, reduciendo el volumen de imágenes que un analista debe inspeccionar.
- Investigación académica en forensia facial: el adaptador sirve como punto de partida para experimentos de detección de deepfakes con un VLM pequeño, reproducible en hardware modesto gracias a los 2B parámetros del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base InternVL3-2B requiere aproximadamente 4-5 GB en FP16 y alrededor de 2-3 GB en cuantización de 4 bits; el adaptador LoRA añade una sobrecarga mínima (0,2 GB en disco).
- GPU recomendadas: RTX 3090, RTX 4090, A10, L4 o A100 para inferencia cómoda; una RTX 3060 de 12 GB o incluso 8 GB con cuantización puede ser suficiente para el modelo base.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más de VRAM usando cuantización, y en 12-16 GB en FP16.
- Opciones de despliegue: Al no haber documentación específica, se asume el stack habitual de PEFT: transformers + peft para cargar el adaptador, y opcionalmente vLLM o TGI para servir el modelo base fusionado con el adaptador. llama.cpp/Ollama requerirían convertir el modelo a GGUF, lo cual no está documentado en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PolyVL-deepfake-lora | 2B (base) + LoRA | No disponible | Detección de deepfakes | Gated research only | Hugging Face (gated) |
| OpenGVLab/InternVL3-2B | 2B | No disponible en esta ficha | Vision-language general | No disponible en esta ficha | Hugging Face |
| Detectores de deepfake clásicos (p. ej., Xception, EfficientNet) | 10-100M | No aplica | Clasificación binaria de imágenes | Varía | Repositorios académicos |
| Modelos forenses multimodales propietarios | No disponible | No disponible | Forensia facial | Propietaria | APIs comerciales |

La comparación directa es difícil porque no hay benchmarks publicados para el adaptador. Frente a clasificadores CNN clásicos de deepfake, el enfoque basado en VLM permite razonamiento textual adicional, pero a costa de mayor coste computacional y menor madurez. Frente al InternVL3-2B base, el adaptador sacrifica generalidad por especialización.

## Limitaciones y advertencias

- Licencia de solo investigación y acceso restringido: no se permite uso comercial sin autorización explícita; el repositorio es gated y requiere aceptar condiciones en Hugging Face.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad ni de reproducibilidad independiente.
- Sin benchmarks publicados: no se puede afirmar su precisión, tasa de falsos positivos o robustez frente a distintos tipos de deepfake (cambio de cara, reenactment, síntesis completa).
- Riesgo de alucinación: al ser un VLM, puede generar explicaciones textuales plausibles pero incorrectas sobre por qué una imagen es falsa; las salidas deben tratarse como señales, no como pruebas.
- Sesgos potenciales: el entrenamiento forense suele estar sesgado hacia rostros de ciertos demográficos, iluminación y resoluciones; no hay información sobre la diversidad del dataset.
- Limitaciones de contexto e idioma: no declaradas; se desconoce si el adaptador funciona igual en prompts en castellano o solo en inglés.
- Caveat para producción: no debe usarse como única fuente de decisión en KYC, moderación o evidencia legal; requiere validación con datos propios y supervisión humana.
- Fecha de creación futura (2026-11-18): el repositorio presenta una marca temporal atípica, lo que puede indicar metadatos erróneos o un artefacto de prueba; conviene verificar la integridad antes de confiar en él.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Pushkarrrr15151/PolyVL-deepfake-lora
- Modelo base InternVL3-2B: https://huggingface.co/OpenGVLab/InternVL3-2B
- Documentación de PEFT: https://huggingface.co/docs/peft
- Repositorio InternVL (OpenGVLab): https://github.com/OpenGVLab/InternVL
