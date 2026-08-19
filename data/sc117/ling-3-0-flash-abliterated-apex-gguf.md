# SC117/Ling-3.0-flash-abliterated-APEX-GGUF

## Resumen

Ling-3.0-flash-abliterated-APEX-GGUF es un paquete comunitario no oficial que combina dos modificaciones sobre los pesos del modelo oficial inclusionAI/Ling-3.0-flash: una edición de rechazos (abliteration) mediante la herramienta abliterix v6 trial 21, y una conversión a formato GGUF con cuantización mixta APEX. El modelo base es un MoE híbrido de 124B parámetros totales con 5,1B activos, desarrollado por inclusionAI, que emplea una pila híbrida lineal nativa desde el preentrenamiento (Kimi Delta Attention + MLA con puerta) y un esquema de contexto oficial de 8K a 256K tokens.

La relevancia de este lanzamiento radica en que ofrece una versión del modelo con una tasa de rechazo significativamente reducida (17,3% frente al comportamiento del modelo oficial), manteniendo la licencia MIT. Está pensado para casos de uso donde el modelo base muestra rechazos excesivos, aunque el autor advierte explícitamente de la necesidad de evaluar cumplimiento y seguridad antes de su uso en producción. El repositorio contiene exclusivamente ficheros GGUF cuantizados con la herramienta APEX, que clasifica cada tensor por su rol (experto enrutado, experto compartido o atención) y aplica un gradiente de precisión por capas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid MoE (Kimi Delta Attention + gated MLA, 1/64 sparse MoE, 512 expertos enrutados top-8 + 1 experto compartido, 2 capas densas, cabezal MTP entrenado) |
| Parametros totales | 127.486.405.600 (124B) |
| Parametros activos | 5,1B |
| Longitud de contexto | 8K oficial, ampliable a 32K y 256K (esquema de contexto oficial) |
| Tipos de cuantizacion | APEX mixed-precision (BF16 convert + APEX, sin imatrix en estos niveles) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (arquitectura bailingmoe3) |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-flash emplea una arquitectura híbrida lineal nativa desde el preentrenamiento, combinando Kimi Delta Attention (KDA) y MLA con puerta en proporción 5:1. El componente MoE es sparse con 512 expertos enrutados (top-8 activos) más un experto compartido, con factor de sparse 1/64, e incluye 2 capas densas y un cabezal MTP (multi-token prediction) entrenado de 3,1B parámetros. El esquema de contexto oficial es progresivo: 8K → 32K → 256K.

Sobre estos pesos, el autor del paquete comunitario aplicó dos modificaciones: primero, una edición de rechazos mediante abliterix v6 trial 21, usando un LoRA de rango 3 sobre las proyecciones `o_proj` y `down_proj` únicamente, con normalización de pesos MPOA completa, fusionado estáticamente de vuelta a BF16. Segundo, conversión a GGUF con cuantización mixta APEX, que clasifica cada tensor por su función y aplica un gradiente de precisión por capas, dando mayor precisión a las capas de borde y comprimiendo más agresivamente las capas intermedias redundantes. El autor indica que esta fusión es estática y no el gate solo en runtime de versiones posteriores (v36).

## Capacidades

- Generación de texto y razonamiento híbrido nativo (modo thinking activado por defecto en la ficha oficial).
- Soporte de tool calling con precisión mejorada respecto a la generación anterior de la serie Ling.
- Estabilidad mejorada en tareas de horizonte largo (long-horizon tasks).
- Capacidades multilingües, aunque los idiomas concretos no están especificados en la documentación disponible.
- Tasa de rechazo significativamente reducida (17/98, 17,3%) tras la ablación, lo que permite respuestas en escenarios donde el modelo oficial se negaría.
- Compatibilidad con endpoints estándar (endpoints_compatible) y arquitectura GGUF bailingmoe3 para inferencia local.

## Casos de uso

- Generación de contenido creativo sin restricciones: la ablación reduce los rechazos, permitiendo explorar temas controvertidos o de nicho donde el modelo oficial responde con negativas. Adecuado para ficción, guiones o narrativa experimental.
- Asistente de programación con tool calling: su soporte mejorado de tool calling y su ventana de contexto de hasta 256K permiten integrarlo en pipelines de desarrollo que requieran invocar funciones externas o gestionar repositorios extensos.
- Razonamiento multi-paso y agentes: el modo thinking nativo y la arquitectura híbrida lo hacen adecuado para tareas de planificación y descomposición de problemas complejos en entornos de agente.
- Análisis de documentos largos: con contexto oficial de 256K, puede procesar documentos extensos completos (manuales, informes, libros técnicos) sin necesidad de truncamiento.
- Investigación en seguridad y alineación: el paquete permite estudiar el comportamiento de un modelo ablacionado frente al original, comparando tasas de rechazo, sesgos y diferencias de rendimiento en tareas delicadas.
- Despliegue en local con hardware moderado: gracias a la cuantización APEX y al formato GGUF, puede ejecutarse en GPUs de consumo con llama.cpp o herramientas compatibles, manteniendo solo 5,1B de parámetros activos por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para esta versión ablacionada y cuantizada. El autor solo proporciona el dato de tasa de rechazo (17/98, 17,3%) en una evaluación de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Dado que el modelo tiene 124B parámetros totales en BF16 (aproximadamente 255 GB), se requieren cuantizaciones agresivas para entornos de consumo.
- GPU recomendadas: no disponible. Para las cuantizaciones más bajas de GGUF, una GPU con 24 GB (RTX 3090/4090) podría ser suficiente con cuantización de 2-3 bits, aunque con pérdida de calidad significativa.
- Para cuantizaciones medias (Q4-Q5), se necesitan GPUs profesionales (A100 80GB, H100) o múltiples GPUs en paralelo.
- Opciones de despliegue: llama.cpp, Ollama, u otras herramientas compatibles con GGUF. vLLM puede usarse con el modelo base BF16 o FP8, pero no directamente con estos ficheros GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ling-3.0-flash (oficial) | 124B | 5,1B | 256K | MIT | BF16/FP8 |
| Ling-3.0-flash-abliterated-APEX (este) | 124B | 5,1B | 256K | MIT | GGUF (APEX) |
| Ling-3.0-tiny-abliterated-APEX | no disponible | no disponible | no disponible | MIT | GGUF (APEX) |

No se dispone de datos comparativos de rendimiento entre estas versiones. La comparativa se limita a especificaciones técnicas y formato de distribución. No se han identificado otros modelos comparables de la misma categoría (MoE híbrido con 5B activos) en la información disponible.

## Limitaciones y advertencias

- La ablación reduce significativamente la tasa de rechazo, lo que implica que el modelo puede generar contenido que el modelo oficial negaría. El autor advierte explícitamente de evaluar cumplimiento normativo y seguridad antes de su uso.
- No es un lanzamiento oficial de inclusionAI; es un paquete comunitario con modificaciones sobre los pesos oficiales.
- La fusión abliterix es estática (v6 trial 21), no el gate solo en runtime de versiones posteriores (v36), por lo que el comportamiento puede diferir de otras versiones ablacionadas del mismo modelo.
- No se han publicado benchmarks de rendimiento para esta versión, por lo que el impacto de la ablación y la cuantización en la calidad de salida es desconocido.
- La cuantización APEX sin imatrix puede afectar a la calidad en tareas de precisión, especialmente en las capas más comprimidas.
- Los idiomas soportados no están documentados, lo que limita la evaluación de su cobertura multilingüe.
- El tamaño del repositorio (489,3 GB) implica que la descarga de todas las cuantizaciones requiere un ancho de banda y almacenamiento considerables.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SC117/Ling-3.0-flash-abliterated-APEX-GGUF
- Modelo base oficial: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Documentación en chino: https://huggingface.co/SC117/Ling-3.0-flash-abliterated-APEX-GGUF/blob/main/README_zh.md
- Herramienta abliterix: https://github.com/wuwangzhang1216/abliterix
- Herramienta APEX quantization: https://github.com/mudler/apex-quant
- Página del modelo en vLLM Recipes: https://recipes.vllm.ai/inclusionAI/Ling-3.0-flash
- Ficha del modelo en zenmux.ai: https://zenmux.ai/inclusionai/ling-3.0-flash
- Guía completa de Ling 3.0 Flash: https://www.aimadetools.com/blog/ling-3-0-flash-complete-guide/
