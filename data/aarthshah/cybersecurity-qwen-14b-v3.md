# AarthShah/cybersecurity-qwen-14b-v3

## Resumen

cybersecurity-qwen-14b-v3 es un adaptador LoRA publicado por AarthShah sobre el modelo base Qwen/Qwen2.5-Coder-14B-Instruct, orientado a tareas de ciberseguridad. Se distribuye como repositorio PEFT de aproximadamente 0,3 GB, lo que corresponde únicamente a los pesos del adaptador y no al modelo completo. La model card es la generada automáticamente por el Trainer de Hugging Face y no documenta el conjunto de datos de entrenamiento, los usos previstos ni los resultados de evaluación.

El interés de esta ficha es limitado pero concreto: permite aplicar un ajuste fino de bajo rango sobre un modelo de código de 14 000 millones de parámetros sin necesidad de reentrenar ni redistribuir los pesos completos, manteniendo la licencia Apache 2.0 del modelo base. Al ser un adaptador, su evaluación debe hacerse siempre en combinación con Qwen2.5-Coder-14B-Instruct, cuyas especificaciones de arquitectura y contexto hereda.

No se dispone de información publicada sobre el corpus de entrenamiento, el número de tokens vistos, la composición del dataset ni métricas de evaluación. Cualquier uso en producción debería ir precedido de una evaluación propia y específica del dominio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-Coder-14B-Instruct |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base tiene 14B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información del adaptador (heredada del modelo base) |
| Tipos de cuantización | no disponible (el adaptador se publica en safetensors; la cuantización depende del despliegue del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA entrenado con PEFT 0.21.2 sobre Qwen/Qwen2.5-Coder-14B-Instruct, un transformer decoder-only de 14 000 millones de parámetros especializado en código. El adaptador modifica un subconjunto de matrices del modelo base mediante descomposiciones de bajo rango; no se especifican el rango, el alpha ni los módulos objetivo.

Los hiperparámetros documentados son: learning rate de 1,5e-4 con scheduler coseno y 30 pasos de warmup, batch size efectivo de 8 (batch de 4 con 2 pasos de acumulación de gradiente), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, semilla 42 y 550 pasos de entrenamiento. El dataset se describe como "unknown dataset" y no se indica si hubo RLHF, DPO ni ninguna fase de alineación posterior. Tampoco se documentan innovaciones técnicas adicionales más allá del propio ajuste LoRA.

## Capacidades

- Generación de texto conversacional en el dominio de ciberseguridad, presumiblemente orientada por el corpus de ajuste (no verificado).
- Generación y análisis de código, heredada del modelo base Qwen2.5-Coder-14B-Instruct.
- Razonamiento sobre configuraciones, scripts y artefactos técnicos, en la medida en que el ajuste LoRA lo preserve.
- Soporte de tool calling y function calling: no disponible en la información del adaptador (depende del modelo base y de si el ajuste lo conserva).
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Asistencia en triaje de alertas de seguridad: el adaptador puede emplearse para redactar resúmenes y clasificaciones preliminares de eventos, siempre con validación humana y evaluando previamente la tasa de falsos positivos en el SOC propio.
- Revisión de configuraciones y scripts de infraestructura: generación de explicaciones y detección de patrones inseguros en ficheros de configuración, aprovechando la base de código del modelo subyacente.
- Apoyo a la redacción de informes técnicos de vulnerabilidades: borradores de descripciones, impacto y recomendaciones a partir de notas del analista.
- Formación y concienciación: generación de ejemplos de phishing o de configuraciones inseguras en entornos controlados, con revisión previa del contenido.
- Asistencia a la escritura de reglas de detección: propuestas de reglas Sigma o YARA que el analista valida y ajusta antes de desplegar.
- Prototipado de asistentes internos de seguridad: integración vía PEFT y transformers en un servicio interno, con el adaptador cargado sobre el modelo base y sin exposición directa a usuarios finales.
- Investigación sobre ajuste fino en dominios especializados: comparación de este adaptador con otras variantes del mismo autor (por ejemplo, CyberQwen-14B-Security) para estudiar el efecto del ajuste LoRA en tareas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` de la model card declara una entrada para cybersecurity-qwen-14b-v3 con una lista de resultados vacía.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen2.5-Coder-14B-Instruct. En fp16 se requieren aproximadamente 28 GB de VRAM; en cuantización de 8 bits, en torno a 15-16 GB; en 4 bits, alrededor de 9-10 GB. El adaptador LoRA añade una sobrecarga mínima (repo de 0,3 GB).
- GPU recomendadas: A100 40/80 GB o H100 para fp16 sin cuantizar; L40S, A6000 o RTX 4090 (24 GB) para 8 bits; RTX 3090/4090 o GPUs con 12-16 GB para 4 bits.
- Cabe en GPU de consumo: sí, con cuantización de 4 bits en GPUs de 12 GB o más; en 8 bits requiere 16 GB o más.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA en algunos casos, pero la compatibilidad con esta versión concreta no está documentada; llama.cpp y Ollama requerirían fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| cybersecurity-qwen-14b-v3 | 14B (base) + LoRA | no disponible | apache-2.0 | safetensors (PEFT) | Adaptador sin evaluación publicada |
| CyberQwen-14B-Security (AarthShah) | 14B (base) + ajuste | no disponible | no disponible | no disponible | Variante del mismo autor descrita como "enterprise-grade, defensive" |
| Qwen/Qwen2.5-Coder-14B-Instruct | 14B | no disponible en esta ficha | apache-2.0 | safetensors | Modelo base sin especialización en seguridad |

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, por lo que se desconoce la procedencia, calidad y posibles sesgos del ajuste.
- No hay evaluación publicada: el rendimiento real en tareas de ciberseguridad es desconocido y debe medirse antes de cualquier uso.
- Riesgo de alucinación inherente al modelo base, potencialmente agravado por un ajuste no evaluado en un dominio donde los errores tienen consecuencias de seguridad.
- El adaptador no debe emplearse para generar exploits, malware ni contenido ofensivo sin las salvaguardas adecuadas; la model card no especifica filtros de seguridad.
- Al ser un adaptador LoRA, requiere cargar el modelo base; la licencia Apache 2.0 se hereda del modelo base, pero conviene verificar los términos de Qwen2.5-Coder-14B-Instruct.
- No se documentan idiomas soportados; el comportamiento en castellano no está verificado.
- El repositorio tiene muy poca tracción (27 descargas, 0 likes) y fue creado recientemente; no hay evidencia de mantenimiento ni de soporte.
- La fecha de creación indicada (2026-11-04) es posterior a la de esta ficha y debe tratarse con cautela.

## Enlaces

- [Hugging Face: AarthShah/cybersecurity-qwen-14b-v3](https://huggingface.co/AarthShah/cybersecurity-qwen-14b-v3)
- [Hugging Face: AarthShah/CyberQwen-14B-Security](https://huggingface.co/AarthShah/CyberQwen-14B-Security)
- [Modelo base: Qwen/Qwen2.5-Coder-14B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct)
