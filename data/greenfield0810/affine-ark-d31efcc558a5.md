# greenfield0810/affine-ark-d31efcc558a5

## Resumen

Este repositorio es un archivo espejo (mirror) byte a byte de un checkpoint de la competición Bittensor subnet 120 (Affine), subido por la cuenta `greenfield0810` con fines de preservación. El modelo original pertenece al usuario `0xgevdhc` (revisión `a1a41857a5fb`) y participa en el leaderboard de Affine, donde los repositorios suelen hacerse privados pocos días después de los duelos. Este archivo garantiza que el checkpoint siga accesible para la comunidad.

Según las etiquetas del repositorio, el modelo se basa en la arquitectura `qwen3_5_moe` y tiene un pipeline de `image-text-to-text`, lo que indica que es un modelo multimodal (procesa imágenes y texto) con arquitectura de mezcla de expertos (MoE). El peso total declarado en safetensors es de 35.107.181.936 parámetros (35,1 B), distribuidos en 17 shards que ocupan 70,2 GB. No se dispone de información oficial sobre la licencia, los idiomas soportados ni el contexto de entrenamiento.

Es importante señalar que este repositorio no es un modelo desarrollado por el autor de la cuenta, sino una copia de un tercero. Toda la información técnica aquí recogida se basa únicamente en los metadatos del archivo y en la propia model card, que es mínima. No se han publicado detalles de arquitectura, entrenamiento ni rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (mezcla de expertos, multimodal imagen-texto) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (17 shards, 70,21 GB) |

## Arquitectura y entrenamiento

Los únicos datos disponibles sobre la arquitectura provienen de las etiquetas del repositorio: `qwen3_5_moe` y `image-text-to-text`. Esto indica que se trata de un modelo de lenguaje multimodal basado en una arquitectura de mezcla de expertos (MoE) de la familia Qwen 3.5, capaz de procesar tanto imágenes como texto. El tamaño de 35,1 B parámetros sugiere que es un modelo de escala media-grande, probablemente con activación por expertos (no se conoce el número de parámetros activos).

No se dispone de información sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se conocen innovaciones técnicas específicas más allá de las que pueda heredar de la arquitectura Qwen 3.5 MoE. La model card no aporta ningún detalle adicional.

## Capacidades

- Procesamiento multimodal imagen-texto: el pipeline `image-text-to-text` indica que el modelo acepta imágenes como entrada y genera texto, lo que permite tareas de descripción de imágenes, respuesta a preguntas visuales (VQA) y razonamiento multimodal.
- Generación de texto conversacional: la etiqueta `conversational` sugiere que está optimizado para diálogos de múltiples turnos.
- Arquitectura MoE: al ser de mezcla de expertos, es probable que tenga eficiencia computacional en inferencia (solo se activan algunos expertos por token), aunque no se confirma el número de expertos activos.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso ni capacidades específicas de código o matemáticas.

## Casos de uso

Dado que no hay documentación oficial ni benchmarks, los casos de uso son hipotéticos y se infieren de las etiquetas. No hay validación de que el modelo funcione correctamente en estos escenarios.

- **Descripción y captioning de imágenes**: dado su pipeline multimodal, podría emplearse para generar descripciones de imágenes en aplicaciones de accesibilidad o gestión de activos visuales.
- **Asistente de chat multimodal**: podría integrarse en un chatbot que responda preguntas sobre imágenes o documentos escaneados.
- **Análisis de documentos con figuras**: en entornos de investigación, podría extraer información de gráficos, diagramas y tablas dentro de documentos.
- **Archivo y comparación de checkpoints**: el caso de uso real de este repositorio es servir como copia de respaldo de un modelo de competición para su estudio posterior.
- **Investigación sobre modelos MoE multimodales**: los investigadores podrían utilizar el checkpoint para estudiar el comportamiento de una arquitectura Qwen 3.5 MoE en tareas de imagen-texto.
- **Evaluación de modelos en el ecosistema Bittensor**: dado que proviene de un subnet de Affine, podría emplearse para reproducir o auditar resultados de duelos de la red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de tareas multimodales. El repositorio no incluye ninguna métrica de rendimiento.

## Requisitos de hardware

Al no conocer la cuantización ni el número de parámetros activos, los requisitos son estimaciones basadas en los 35,1B parámetros totales.

- **VRAM estimada**: con precisión completa (FP16) se necesitan aproximadamente 70 GB de VRAM solo para los pesos, más la memoria de activaciones y la atención. Con cuantización a 4 bits (no confirmada), se reduciría a unos 18-20 GB.
- **GPU recomendadas**: para FP16 se necesita una NVIDIA A100 (80 GB), H100 (80 GB) o dos RTX 4090 en paralelo. Con cuantización 4-bit podría caber en una RTX 4090 (24 GB) o RTX 6000 Ada.
- **Inferencia en consumer GPU**: no es viable sin cuantización agresiva (4-bit o inferior); la carga de 70 GB en FP16 supera la VRAM de cualquier GPU de consumo.
- **Opciones de despliegue**: no se especifica compatibilidad con vLLM, llama.cpp u Ollama. Dado que usa safetensors y la librería transformers, se podría intentar cargar con Transformers, pero la arquitectura MoE multimodal no está garantizada.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. El modelo se etiqueta como `qwen3_5_moe`, lo que sugiere una relación con la familia Qwen 3.5 MoE, pero no hay datos de rendimiento. Comparación hipotética:

| Modelo | Parámetros | Contexto | Multimodal | Licencia |
|---|---|---|---|---|
| Este checkpoint (qwen3_5_moe) | 35,1 B (MoE) | no disponible | Sí (imagen-texto) | no disponible |
| Qwen3-30B-A3B (MoE) | 30 B totales, 3 B activos | 32 k (base) | No (texto) | Apache 2.0 |
| Qwen2.5-VL-32B | 32 B | 32 k | Sí (imagen-texto) | Apache 2.0 |

Esta comparativa es orientativa y se basa en modelos públicos conocidos de la misma familia; no se ha confirmado que este checkpoint sea una variante de ellos.

## Limitaciones y advertencias

- **Procedencia opaca**: el modelo es un mirror de un checkpoint de competición; no se conoce su procedencia exacta, el proceso de entrenamiento ni la calidad de los datos.
- **Sin licencia**: al no disponer de licencia, su uso comercial es arriesgado. No se puede garantizar que el uso esté permitido.
- **Sin documentación**: no hay model card completa, ni benchmarks, ni instrucciones de uso. Cualquier uso en producción es bajo responsabilidad del usuario.
- **Riesgo de alucinación**: al ser un modelo de lenguaje multimodal, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento visual.
- **Desconocimiento de sesgos**: no se han publicado estudios de sesgos ni de seguridad; no se puede evaluar el riesgo de contenido tóxico o discriminatorio.
- **Posible obsolescencia**: el checkpoint fue creado en agosto de 2026 (según los metadatos) y puede quedar desactualizado respecto a los modelos actuales.
- **Inestabilidad del repositorio**: el autor pide que se solicite la retirada si es necesario; el modelo puede desaparecer en cualquier momento.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/greenfield0810/affine-ark-d31efcc558a5
- Repositorio original (según la model card): https://huggingface.co/0xgevdhc/affine-5dpmave72j-v15
- Archivos de provenance: `_affine_provenance.json` (dentro del repositorio)
- Otros espejos del mismo grupo (según la búsqueda web): `greenfield0810/affine-ark-95d402145584` y `greenfield0810/affine-ark-14d005bfb627`
