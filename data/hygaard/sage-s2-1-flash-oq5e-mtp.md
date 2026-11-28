# Hygaard/Sage-S2.1-Flash-oQ5e-mtp

## Resumen

Sage-S2.1-Flash-oQ5e-mtp es una conversión cuantizada del modelo multimodal y agéntico Sage S2.1 Flash, desarrollado por el Shanghai Artificial Intelligence Laboratory (InternLM), publicada por el usuario Hygaard. Se trata de una cuantización de precisión mixta en formato MLX safetensors, optimizada específicamente para Apple Silicon, que reduce el checkpoint original en BF16/FP32 a 5,61 bits efectivos por peso (225,36 GB) manteniendo intactos el conjunto completo de expertos, el codificador de visión, la cabeza de predicción multi-token (MTP) y el tokenizador original.

El modelo base es un MoE (mixture of experts) construido sobre la arquitectura GLM-5.3-Flash, orientado a tareas científicas, multimodales (image-text-to-text) y a flujos agénticos. Con 321.323.031.390 parámetros totales según los safetensors, es un modelo de escala muy grande que, incluso tras la cuantización, requiere hardware de gama alta para su ejecución.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de más de 320.000 millones de parámetros en hardware Apple Silicon mediante MLX, con una política de precisión mixta que preserva en 8 bits o superior las capas sensibles (atención, embeddings, expertos compartidos) y comprime únicamente las matrices de expertos enrutados a 5 bits. La licencia MIT facilita su uso comercial, aunque el tamaño y los requisitos de memoria limitan seriamente su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE sobre GLM-5.3-Flash (transformer con atención lineal, MTP, visión) |
| Parametros totales | 321.323.031.390 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ5e de precisión mixta (5,61 BPW efectivos, group size 64, empaquetado afín) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (38 shards raíz) |

## Arquitectura y entrenamiento

El modelo base Sage S2.1 Flash emplea una arquitectura MoE sobre GLM-5.3-Flash con atención lineal (linear-attention convolutions) e hiperconexiones (hyperconnections), además de una cabeza de predicción multi-token (MTP) y un codificador de visión. La conversión cuantizada conserva la estructura completa: 44 bloques de texto con expertos enrutados a 5 bits y el resto de matrices cuantizadas a 8 bits, más un bloque MTP. Los tensores no cuantizados (normalizaciones, proyecciones de fusión MTP, controles de decaimiento recurrente) se mantienen en BF16 o FP32, y los routers MoE y sesgos de corrección en FP32. Los nueve proyectores científicos originales permanecen en FP32 y añaden 0,168 GB.

No se ha aplicado entrenamiento adicional, ablación ni poda de expertos durante la conversión. La calibración de la cuantización se realizó con 128 muestras de 512 tokens procedentes de un corpus de código y multilingüe incluido, recogidas de forma independiente para esta cuantización. La herramienta utilizada fue el conversor nativo oQe en streaming de oMLX 0.8.0rc1. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset original ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento multimodal: pipeline image-text-to-text, con codificador de visión BF16 incluido.
- Razonamiento científico: el modelo base está orientado a tareas científicas y requiere los encoders SciPerception correspondientes para entradas científicas.
- Soporte de tool calling / function calling: confirmado en la model card para su ejecución con oMLX.
- Decodificación MTP nativa: la cabeza de predicción multi-token se conserva, permitiendo decodificación especulativa.
- Capacidades agénticas: el modelo base está descrito como agéntico, adecuado para razonamiento multi-paso.
- Capacidades multilingües: el corpus de calibración es multilingüe, pero no se detallan los idiomas soportados.
- Conserva tokenizador, procesador y chat template originales de Sage.

## Casos de uso

- Investigación científica asistida por IA: el modelo puede procesar entradas multimodales (texto e imagen) y, con los encoders SciPerception adecuados, apoyar tareas de análisis científico; su naturaleza multimodal y sus proyectores científicos dedicados lo hacen idóneo para prototipos de asistencia a la investigación en entornos Apple Silicon.
- Agentes autónomos multi-paso: gracias al soporte de tool calling y a la decodificación MTP nativa, puede integrarse en bucles agénticos donde el modelo planifica, invoca herramientas y razona sobre resultados, con aceleración de la generación por predicción multi-token.
- Análisis de documentos con imágenes: al ser image-text-to-text, permite extraer y razonar sobre información de figuras, tablas o capturas combinadas con texto, útil en pipelines de revisión documental.
- Prototipado en estación de trabajo Mac: desarrolladores con Mac Studio de memoria unificada alta pueden ejecutar el modelo localmente con oMLX para experimentar con un MoE de 321.000 millones de parámetros sin depender de la nube.
- Evaluación de cuantizaciones: sirve como referencia para comparar la calidad de oQ5e (5,61 BPW) frente a variantes oQ4e (4,64 BPW) del mismo modelo base en tareas concretas.
- Generación de código y texto técnico: el corpus de calibración incluye código, y el modelo conserva las proyecciones de atención y embeddings en 8 bits, lo que preserva mejor la fidelidad en tareas de generación de código que una cuantización uniforme agresiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos ocupan 225,36 GB (209,88 GiB); el runtime y la caché KV requieren memoria adicional, por lo que se necesita un equipo con memoria unificada claramente superior a 225 GB.
- GPU recomendadas: hardware Apple Silicon con memoria unificada alta (por ejemplo, configuraciones de Mac Studio con 256 GB o más); no está pensado para GPU NVIDIA por su formato MLX.
- Cabe en consumer GPU: no; el tamaño excede cualquier GPU de consumo actual.
- Opciones de despliegue: oMLX 0.8.0rc1 (requerido para texto, imágenes, tool calling y decodificación MTP nativa); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Sage-S2.1-Flash-oQ5e-mtp | 321.323.031.390 | no disponible | oQ5e, 5,61 BPW, 225,36 GB | MIT | MLX safetensors |
| Sage-S2.1-Flash-oQ4e-mtp | no disponible | no disponible | oQ4e, 4,64 BPW, 186,40 GB | MIT | MLX safetensors |
| Sage S2.1 Flash (base) | 321.323.031.390 (según esta conversion) | no disponible | BF16/FP32 | no disponible | safetensors |

La comparativa se limita a las variantes del mismo modelo base documentadas en la información disponible; no se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Tamaño prohibitivo: incluso cuantizado a 5,61 BPW, requiere más de 225 GB de almacenamiento y memoria, lo que restringe su uso a equipos de gama muy alta.
- Dependencia de oMLX 0.8.0rc1: la model card especifica esta versión concreta para texto, imágenes, tool calling y MTP; otras herramientas o versiones pueden no funcionar.
- Entradas científicas incompletas: requieren los encoders SciPerception correspondientes, que no se incluyen; solo se incluyen los proyectores.
- Riesgo de degradación por cuantización: los expertos enrutados están a 5 bits, lo que puede afectar a la fidelidad en tareas sensibles pese a mantener atención y embeddings en 8 bits.
- Idiomas no documentados: no se especifican los idiomas soportados ni el contexto máximo, lo que dificulta planificar despliegues multilingües o de contexto largo.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni de alucinación para este modelo ni para el base.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base internlm/Sage-S2.1-Flash, cuya licencia no se detalla en la información disponible.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento para validar la calidad de la cuantización.

## Enlaces

- [Hugging Face: Hygaard/Sage-S2.1-Flash-oQ5e-mtp](https://huggingface.co/Hygaard/Sage-S2.1-Flash-oQ5e-mtp)
- [Modelo base: internlm/Sage-S2.1-Flash](https://huggingface.co/internlm/Sage-S2.1-Flash)
- [Variante oQ4e: Hygaard/Sage-S2.1-Flash-oQ4e-mtp](https://huggingface.co/Hygaard/Sage-S2.1-Flash-oQ4e-mtp)
- [CONVERSION.json](./CONVERSION.json) (incluido en el repositorio)
- [WEIGHT_PRECISION.csv](./WEIGHT_PRECISION.csv) (incluido en el repositorio)
- [WEIGHT_PRECISION.json](./WEIGHT_PRECISION.json) (incluido en el repositorio)
