# mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-Q8_0-GGUF

## Resumen

El modelo `mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-Q8_0-GGUF` es una conversión al formato GGUF cuantizado en Q8_0 de una versión ablitterada y "uncensored" del modelo MiniCPM5-2B, desarrollado por OpenBMB. MiniCPM5-2B es un Transformer denso de aproximadamente 2.500 millones de parámetros, diseñado para despliegue en dispositivos con recursos limitados y ejecución local, y se presenta como el estado del arte en su clase de modelos de 2B. La conversión ha sido realizada por el usuario mondk, que ha aplicado un proceso de ablación (eliminación de alineación) para producir una variante sin restricciones de seguridad. El modelo se distribuye bajo licencia Apache-2.0 y está pensado para su uso con llama.cpp u otros backends compatibles con GGUF. No se dispone de información sobre la longitud de contexto ni sobre los idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parámetros totales | 2.516.756.480 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q8_0 (GGUF); otros formatos no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0); safetensors (modelo base) |

## Arquitectura y entrenamiento

El modelo base MiniCPM5-2B es un Transformer denso de 2B parámetros que sigue la receta de entrenamiento de la serie MiniCPM5. Según la documentación publicada por OpenBMB, está construido específicamente para escenarios de despliegue local, on-device y con recursos limitados, alcanzando el estado del arte en la clase de modelos de 2B. La versión aquí presentada ha sido sometida a un proceso de "ablación" no documentado que elimina la alineación de seguridad, dando lugar a una variante "uncensored". No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto general: al ser un modelo Transformer denso de 2B, puede generar texto en tareas simples y conversaciones.
- Ejecución local: optimizado para dispositivos con recursos limitados, según la documentación de OpenBMB.
- Sin restricciones de seguridad: la variante "abliterated/uncensored" indica que se han eliminado los filtros de alineación, lo que permite generar contenido que normalmente sería bloqueado.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede ejecutarse en un dispositivo móvil o mini-PC gracias a su tamaño reducido (2B) y al formato GGUF, permitiendo chatbots sin conexión a internet.
- Generación de contenido creativo sin filtros: la versión "uncensored" permite explorar estilos de escritura sin las restricciones habituales de los modelos alineados, útil para proyectos de ficción o investigación.
- Análisis de texto en entornos con privacidad estricta: al ejecutarse localmente, los datos no salen del dispositivo, lo que lo hace adecuado para procesar documentos confidenciales en sectores como salud o banca.
- Prototipado de aplicaciones LLM: un modelo de 2B en Q8_0 puede ejecutarse en una GPU de consumo (por ejemplo, RTX 3060), permitiendo iterar rápidamente en el desarrollo de aplicaciones sin costes de nube.
- Fine-tuning ligero para dominios específicos: el tamaño de 2B permite ajustar el modelo en un dominio concreto (por ejemplo, soporte técnico interno) con pocos recursos computacionales.
- Investigación sobre alineación y jailbreaks: al ser una versión "abliterated", el modelo sirve como caso de estudio para analizar el comportamiento de un LLM sin alineación y compararlo con su versión original.
- Educación y demostraciones: el modelo puede utilizarse en talleres o aulas para enseñar conceptos de LLM sin necesidad de infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q8_0 ocupa aproximadamente 2,5-2,7 GB, por lo que se recomiendan al menos 4 GB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: cualquier GPU con 4 GB o más, como RTX 3060 8GB, RTX 4060 8GB, o en el segmento profesional, A10 o T4.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo con 4 GB o más.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), y backends compatibles con GGUF como Ollama (importando el archivo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B (base, no ablitterado) | 2B | No disponible | Apache-2.0 | safetensors | HuggingFace |
| MiniCPM5-1B | 1B | No disponible | Apache-2.0 | No disponible | HuggingFace |
| Este modelo (Q8_0) | 2B | No disponible | Apache-2.0 | GGUF | HuggingFace |

Nota: no se dispone de información suficiente para comparar el rendimiento con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Al ser una versión "abliterated" y "uncensored", se han eliminado las medidas de seguridad, lo que puede generar contenido dañino, ilegal o inapropiado.
- El riesgo de alucinación es inherente a los modelos pequeños de 2B, especialmente en tareas complejas.
- No se dispone de información sobre la longitud de contexto, los idiomas soportados ni las capacidades de tool calling, lo que limita su uso en aplicaciones que requieran estas características.
- La conversión a Q8_0 puede introducir una ligera pérdida de precisión en comparación con los pesos originales en safetensors.
- La licencia Apache-2.0 permite el uso comercial, pero la naturaleza "uncensored" del modelo puede generar responsabilidades legales o éticas en el despliegue.
- No se han publicado benchmarks públicos que validen el rendimiento de esta variante específica.

## Enlaces

- HuggingFace: https://huggingface.co/mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-Q8_0-GGUF
- Modelo base safetensors: https://huggingface.co/mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors
- Repo de MiniCPM (OpenBMB): https://github.com/OpenBMB/MiniCPM
- Model card de MiniCPM5-2B-SFT: https://huggingface.co/openbmb/MiniCPM5-2B-SFT/blob/main/README.md
