# Muyuxiao/Nyx-RP-9B-Instruct-2608-v1-OBLITERATED

## Resumen
Nyx-RP-9B-Instruct-2608-v1-OBLITERATED es una variante del modelo Nyx-RP-9B-Instruct-2608-v1, desarrollada por el usuario Muyuxiao, que ha sido sometida a un proceso de abliteración mediante la herramienta de código abierto OBLITERATUS. La abliteración es una técnica de ingeniería de activaciones que elimina el comportamiento de rechazo del modelo, es decir, la tendencia a negarse a responder a ciertas solicitudes. Este proceso se ha aplicado con el método "advanced" sobre el modelo base, que es un modelo de instrucción de 9.000 millones de parámetros orientado al roleplay (RP).

El resultado es un modelo "sin censura" que mantiene las capacidades lingüísticas del modelo original pero reduce los mecanismos de rechazo, lo que lo hace especialmente atractivo para aplicaciones de generación de contenido creativo o narrativo sin restricciones. El modelo se distribuye en formato safetensors y está pensado para su uso con la biblioteca Transformers de Hugging Face. No se han publicado detalles sobre la arquitectura interna, el contexto máximo o los datos de entrenamiento en la información disponible.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 8.953.803.264 (aprox. 9B) |
| Parámetros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (formato original safetensors) |
| Idiomas soportados | inglés (etiqueta `en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna del modelo base Nyx-RP-9B-Instruct-2608-v1. Por el tamaño de parámetros (9B) y el tag `qwen3_5_text` en Hugging Face, es probable que esté basado en la arquitectura Qwen3.5, pero no se puede confirmar sin datos oficiales. El proceso de abliteración, realizado con OBLITERATUS, no modifica la arquitectura sino que ajusta los pesos de las capas de atención y MLP para eliminar la dirección de rechazo aprendida durante el entrenamiento. Este método se aplica mediante el método `advanced` de OBLITERATUS, que es una técnica de activación de ingeniería que identifica y anula el subespacio de activaciones responsable de la negativa a responder.

No hay datos sobre el dataset de entrenamiento, el número de tokens, ni si se usó RLHF o DPO. El modelo base fue creado por `Indexnusrefather` y luego fue abliterado por el autor actual.

## Capacidades
- Generación de texto sin rechazo: el modelo está diseñado para no negarse a responder a solicitudes que normalmente serían bloqueadas por modelos con alineación estándar.
- Roleplay y narrativa: el modelo base está orientado a roleplay, por lo que conserva capacidades para generar diálogos y narraciones en contextos ficticios.
- Instrucción: es un modelo de instrucción, por lo que puede seguir instrucciones en inglés.
- Multilingüismo: solo se indica el idioma inglés (`en`). No se confirma soporte para otros idiomas.
- Sin capacidades especiales: no se menciona tool calling, agentes, visión ni audio.

## 4. Casos de uso
- **Generación de historias interactivas**: el modelo puede crear narrativas de ficción sin restricciones, ideal para juegos de rol textuales o escritura creativa avanzada.
- **Diálogos de personajes**: para chatbots de roleplay que requieren respuestas sin filtros sobre temas sensibles, siempre que se respete la legalidad.
- **Exploración de temas tabú**: en entornos de investigación sobre comportamiento de modelos de lenguaje, se puede usar para estudiar la generación de contenido que los modelos alineados rechazan.
- **Pruebas de seguridad**: para evaluar la efectividad de las técnicas de abliteración y comparar con modelos sin modificar.
- **Generación de contenido para juegos**: creación de diálogos y guiones para videojuegos o novelas visuales con temática adulta o oscura.
- **Aplicaciones de escritura creativa**: asistencia en la redacción de ficción sin limitaciones temáticas, siempre que se cumplan las leyes locales.

## 5. Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre rendimiento en tareas estándar como MMLU, HumanEval o GSM8K. Tampoco se conocen comparaciones con otros modelos abliterados.

## 6. Requisitos de hardware
No se han publicado requisitos específicos para este modelo. Sin embargo, por su tamaño de 8,95B parámetros en formato de precisión completa (fp16), se puede estimar:
- **VRAM estimada**: ~17 GB en fp16, ~9 GB en int8, ~4,5 GB en int4 (si se cuantiza).
- **GPU recomendadas**: para inferencia en fp16 se necesita una GPU con 20 GB de VRAM, como NVIDIA A10G, RTX 3090, RTX 4090 (24 GB) o A100 (40 GB). En cuantización int4, cabe en GPUs de 6 GB como RTX 3060 o RTX 2060.
- **Despliegue**: se puede usar con Transformers (como se muestra en el ejemplo), y también es compatible con vLLM, llama.cpp o Ollama si se convierten los pesos a GGUF (se ha publicado una versión GGUF por mradermacher).
- **Latencia y throughput**: no hay datos oficiales; depende del hardware y de la cuantización.

## 7. Comparativa con modelos similares
No se dispone de información sobre modelos comparables. El modelo base Nyx-RP-9B-Instruct-2608-v1 no tiene documentación pública de benchmarks. Existen otros modelos abliterados como "Uncensored" de diversos tamaños, pero no se puede establecer una comparación rigurosa sin datos. Se recomienda consultar el modelo base original y otros abliterados en Hugging Face para una evaluación manual.

## 8. Limitaciones y advertencias
- **Sesgos y alucinaciones**: al ser un modelo sin alineación, puede generar contenido falso, sesgado o dañino. No se ha evaluado su robustez.
- **Riesgo de contenido inapropiado**: la abliteración elimina los rechazos, por lo que puede producir texto violento, sexual, ilegal o perjudicial. El usuario debe asumir la responsabilidad.
- **Licencia**: no se especifica, por lo que no se puede confirmar si es de uso comercial o si tiene restricciones.
- **Idioma**: solo se confirma el inglés. Puede tener un rendimiento deficiente en otros idiomas.
- **Contexto**: no se conoce la longitud máxima de contexto, lo que puede limitar su uso en tareas de largo alcance.
- **Producción**: no se recomienda para aplicaciones públicas sin una evaluación de seguridad exhaustiva.

## 9. Enlaces
- [Modelo en Hugging Face](https://huggingface.co/Muyuxiao/Nyx-RP-9B-Instruct-2608-v1-OBLITERATED)
- [Modelo base](https://huggingface.co/Indexnusrefather/Nyx-RP-9B-Instruct-2608-v1)
- [Versión GGUF de mradermacher](https://huggingface.co/mradermacher/Nyx-RP-9B-Instruct-2608-v1-GGUF)
- [Perfil del autor Muyuxiao](https://huggingface.co/Muyuxiao)
- [Herramienta OBLITERATUS](https://github.com/elder-plinius/OBLITERATUS)
