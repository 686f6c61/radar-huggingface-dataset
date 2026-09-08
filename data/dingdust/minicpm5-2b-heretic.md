# Dingdust/MiniCPM5-2B-heretic

## Resumen

MiniCPM5-2B-heretic es una variante modificada del modelo MiniCPM5-2B de OpenBMB, creada por Dingdust mediante la técnica de abliteration con la herramienta Heretic v1.4.0. El modelo original es un transformer denso de 2.516.756.480 parámetros (2,5B) optimizado para despliegue en dispositivos locales y escenarios con recursos limitados. Según su creador, alcanza el estado del arte en la clase de 2B y compite con modelos de 4B en tareas de código, matemáticas, comprensión de contexto largo, uso de herramientas y tareas agénticas.

La variante heretic reduce los rechazos (refusals) de 99/100 a 4/100 manteniendo una divergencia KL de 0.0341 respecto al original, lo que la hace adecuada para aplicaciones que requieren respuestas sin las restricciones de alineamiento del modelo base. El modelo está disponible bajo licencia Apache 2.0 y soporta inglés y chino.

## Especificaciones técnicas

| Parámetros | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) |
| Parámetros totales | 2.516.756.480 (2,5B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repo | 5,0 GB |

## Arquitectura y entrenamiento

MiniCPM5-2B es un transformer denso decoder-only, construido a partir de la misma receta de entrenamiento que MiniCPM5-1B, escalada a 2B. El modelo original se entrena con los datasets de OpenBMB: Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3 para pretraining, UltraData-Math y UltraData-Code para razonamiento y programación, y UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609 para alineamiento supervisado y aprendizaje por refuerzo. No se especifica el número exacto de tokens de entrenamiento en la información disponible.

La variante heretic aplica abliteration con Heretic v1.4.0, que modifica las capas de atención y MLP mediante parámetros como attn.o_proj.max_weight (1.50) y mlp.down_proj.max_weight (0.85) para eliminar los patrones de rechazo aprendidos durante el alineamiento. El resultado es un modelo que mantiene un comportamiento general casi idéntico (divergencia KL de 0.0341) pero con una frecuencia de rechazo mucho menor.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento y resolución de problemas matemáticos.
- Generación de código y razonamiento sobre código.
- Comprensión de contexto largo (etiquetado como long-context, sin longitud especificada).
- Tool calling y function calling.
- Tareas agénticas y razonamiento multi-paso.
- Ejecución en dispositivos locales y edge (on-device, edge-ai).
- La variante heretic reduce los rechazos de 99/100 a 4/100 respecto al modelo original.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: el modelo puede ejecutarse localmente en smartphones y mini PCs gracias a su tamaño de 2,5B, ofreciendo respuestas en inglés y chino sin conexión.
- Generación de código en entornos de desarrollo: con soporte de tool calling, puede integrarse en IDEs o pipelines de CI/CD para autocompletar código, generar tests o refactorizar funciones.
- Agentes autónomos con tool calling: el entrenamiento con UltraData-SFT-Agent y UltraData-RL le permite orquestar llamadas a funciones en bucles agénticos, por ejemplo para consultar APIs o bases de datos.
- Razonamiento matemático en aplicaciones educativas: puede resolver problemas paso a paso en tiempo real, útil para tutores interactivos en dispositivos con recursos limitados.
- Análisis de documentos largos: al estar etiquetado como long-context, puede procesar entradas extensas para resumir o extraer información, aunque la longitud exacta no se especifica.
- Chatbots multilingües para mercados de habla inglesa y china: permite atender usuarios en ambos idiomas sin depender de servicios externos, reduciendo costes y latencia.
- Investigación en interpretabilidad de modelos: la variante heretic sirve para estudiar cómo la abliteration afecta al comportamiento de rechazo, ya que mantiene una divergencia KL baja respecto al original.
- Aplicaciones creativas o de rol que requieren respuestas sin restricciones: el modelo reduce drásticamente los rechazos, lo que puede ser útil en juegos de rol o escritura creativa con temas que el modelo original bloquearía.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card de la variante heretic solo incluye métricas de la modificación:

| Métrica | Valor |
|---|---|
| Divergencia KL respecto al original | 0.0341 |
| Refusals | 4/100 |
| Refusals del modelo original | 99/100 |

## Requisitos de hardware

- VRAM estimada para inferencia: ~10,1 GB en FP32; ~5,0 GB en FP16/BF16 (coincide con el tamaño del repo); ~2,5 GB en INT8; ~1,3 GB en INT4.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4090, A100, H100.
- Cabe en GPU de consumo: sí, con 6 GB de VRAM en FP16, o con 4 GB en cuantización INT4.
- Opciones de despliegue: transformers, vLLM, llama.cpp, Ollama, TGI (endpoints_compatible).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniCPM5-2B-heretic | 2.516.756.480 | no disponible | Apache 2.0 | HuggingFace |
| MiniCPM5-1B | no disponible | no disponible | Apache 2.0 | HuggingFace |
| Modelos de 4B (referencia) | no disponible | no disponible | no disponible | no disponible |

Según el autor del modelo original, MiniCPM5-2B es competitivo con modelos de 4B en código, matemáticas y tareas agénticas, pero no se proporcionan nombres ni datos concretos en la información disponible.

## Limitaciones y advertencias

- La abliteration elimina los rechazos, por lo que el modelo puede generar contenido inapropiado, ilegal o dañino sin filtros de seguridad.
- Al reducir los rechazos, aumenta el riesgo de alucinación y respuestas fabricadas, especialmente en temas sensibles.
- Sesgos: al entrenarse en datos web (Ultra-FineWeb), el modelo puede heredar sesgos presentes en esos datos, aunque no se documentan sesgos específicos.
- Limitaciones de idioma: solo soporta inglés y chino; no hay soporte para otros idiomas.
- Longitud de contexto no especificada: no se puede garantizar un comportamiento correcto en entradas muy largas.
- Caveat de producción: el uso de un modelo "decensored" puede violar políticas de uso aceptable de plataformas o normativas legales en algunos contextos. Evaluar la responsabilidad legal antes de desplegarlo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es una modificación de un modelo de OpenBMB; verificar la atribución requerida.

## Enlaces

- HuggingFace: https://huggingface.co/Dingdust/MiniCPM5-2B-heretic
- MiniCPM Tech Report: https://arxiv.org/pdf/2506.07900
- MiniCPM Wiki (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- GitHub: https://github.com/OpenBMB/MiniCPM
- UltraData: https://ultradata.openbmb.cn/
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- Proyecto Heretic: https://heretic-project.org
- Modelo similar (insraq): https://huggingface.co/insraq/MiniCPM5-2B-heretic-abliterated
- Análisis de Artificial Analysis: https://artificialanalysis.ai/articles/openbmb-releases-minicpm5-2b
