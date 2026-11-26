# rarevector/Swift1.5-GLM-5.3-Flash-oQ3.5h-mtp

## Resumen

Swift1.5-GLM-5.3-Flash-oQ3.5h-mtp es una cuantización mixta del modelo GLM-5.3-Flash, publicada por el usuario rarevector en Hugging Face. El checkpoint se ha generado con oQ (oMLX v0.8.3), una herramienta de cuantización de precisión mixta orientada al ecosistema MLX de Apple, y está pensado para su ejecución en hardware Apple Silicon mediante la librería mlx. El modelo base pertenece a la familia GLM-5.3 de Zhipu AI (no confirmado en la información disponible), con arquitectura glm5_next y un total de 53.406.526.302 parámetros.

El checkpoint incorpora tres componentes diferenciados: el modelo de lenguaje (45.410B parámetros lógicos), un módulo de visión (0.564B) y una cabeza MTP (Multi-Token Prediction) de 7.433B parámetros. Esta última es una innovación relevante para decodificación especulativa, ya que permite predecir varios tokens por paso y acelerar la generación. La cuantización resultante tiene un promedio efectivo de 24.107 bits por peso, aunque la distribución es muy heterogénea: la mayor parte del almacenamiento (135.562 GiB) corresponde a tensores en formato U32.

El modelo es relevante para desarrolladores que quieran ejecutar un modelo multimodal de gran tamaño en Macs con memoria unificada amplia, ya que MLX aprovecha la memoria compartida entre CPU y GPU. No obstante, el repositorio tiene 161 GB, cero descargas y cero likes en el momento de la consulta, y no se dispone de model card extendida, licencia declarada ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | glm5_next (transformer, presumiblemente con atención estándar; no confirmado) |
| Parámetros totales | 53.406.526.302 (53.407B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: affine 4-bit grupo 64, affine 8-bit grupo 64, BF16, FP32 y U32; promedio efectivo 24.107 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de la etiqueta glm5_next. Por la nomenclatura y la presencia de un módulo de visión y una cabeza MTP, se trata presumiblemente de un transformer multimodal con capacidad de predicción multi-token, pero no se confirma si emplea mezcla de expertos, atención lineal u otras variantes. El checkpoint cuantizado desglosa los pesos en tres bloques: lenguaje (45.410B lógicos, 144.817 GiB de almacenamiento), visión (0.564B, 1.050 GiB) y cabeza MTP (7.433B, 4.013 GiB).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. La innovación técnica destacable del checkpoint es la cuantización mixta de oQ: asigna 4 bits a 7.248B pesos (13.571%), 8 bits a 8.976B (16.807%), BF16 a 0.707B, FP32 a 0.086B y mantiene 36.390B pesos en U32 (68.137%). Esta distribución explica el tamaño desproporcionado del repositorio (161 GB) frente a lo que sugeriría un promedio de 3,5 bits efectivos, y sugiere que una parte mayoritaria de los pesos no se ha cuantizado realmente en el sentido habitual.

## Capacidades

- Generación de texto y razonamiento: el bloque de lenguaje de 45.410B parámetros lógicos es el núcleo del modelo.
- Procesamiento de visión: incluye un módulo visual de 0.564B parámetros, lo que indica capacidad multimodal imagen-texto (no se detallan tareas concretas).
- Predicción multi-token (MTP): la cabeza de 7.433B parámetros habilita decodificación especulativa y generación de varios tokens por paso.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantización mixta permiten ejecutar el modelo en Macs con memoria unificada grande (por encima de 192 GB recomendable), aprovechando la GPU integrada sin trasladar pesos entre CPU y GPU.
- Prototipado de aplicaciones multimodales: el módulo de visión permite experimentar con pipelines imagen-texto en local antes de desplegar en infraestructura cloud.
- Investigación sobre decodificación especulativa: la cabeza MTP permite medir la aceleración de la generación multi-token frente a la decodificación autorregresiva clásica.
- Evaluación de técnicas de cuantización mixta: el checkpoint sirve como caso de estudio de oQ/oMLX, comparando la calidad frente al modelo en BF16 en tareas de razonamiento y generación.
- Generación de texto de dominio general en entornos con requisitos de privacidad: al ejecutarse en local, los datos no salen del equipo, lo que encaja en escenarios con información sensible.
- Experimentación académica con modelos de más de 50B parámetros: permite a grupos con hardware Apple estudiar el comportamiento de modelos grandes sin acceso a clústeres de GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 149.880 GiB (160.932 GB) en disco; para cargarlo en memoria se necesita un Mac con al menos 192 GB de memoria unificada, y idealmente 256 GB para dejar margen al contexto y a los buffers de inferencia.
- GPU recomendadas: Apple Silicon de gama alta con memoria unificada amplia (M2 Ultra, M3 Ultra o superiores). No es viable en GPUs NVIDIA/AMD convencionales sin reconvertir los pesos desde MLX a otro formato.
- ¿Cabe en consumer GPU? No en GPUs de consumo con 24 GB o 48 GB; solo en configuraciones Apple Silicon con memoria unificada muy alta.
- Opciones de despliegue: mlx (librería nativa), mlx-lm y herramientas compatibles con MLX. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma familia, tamaño o tarea, ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue en producción.
- Checkpoint cuantizado de terceros: no es una publicación oficial del desarrollador del modelo base, por lo que no hay garantías de fidelidad respecto al original.
- Distribución de cuantización atípica: el 68% de los pesos lógicos están almacenados en U32, lo que eleva el tamaño del repositorio a 161 GB y encarece el almacenamiento y la carga en memoria.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia cuantitativa de la degradación de calidad frente al modelo en BF16.
- Sin información sobre sesgos, alucinación o idiomas: no se puede evaluar el riesgo de sesgo ni la cobertura lingüística.
- Dependencia del ecosistema MLX: el formato no es directamente portable a otros runtimes sin conversión, lo que limita el despliegue en servidores tradicionales.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de que los problemas se hayan detectado y corregido por la comunidad.
- Fecha de creación futura en los metadatos (2026-11-26): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/rarevector/Swift1.5-GLM-5.3-Flash-oQ3.5h-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
