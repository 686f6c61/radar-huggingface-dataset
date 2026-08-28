# mradermacher/Technomancer-27b-BlackICE-AEON-i1-GGUF

## Resumen

Technomancer-27b-BlackICE-AEON-i1-GGUF es una cuantización en formato GGUF del modelo Technomancer-27b-BlackICE-AEON, desarrollado originalmente por ChonkE y cuantizado por mradermacher. Se trata de un modelo de 27 320 697 856 parámetros (aproximadamente 27B) basado en la arquitectura Qwen3.5, orientado específicamente a juegos de rol de mesa (TTRPG), roleplay, Dungeons & Dragons y Pathfinder. El modelo base incorpora un adaptador LoRA y soporta una ventana de contexto de 196 000 tokens, además de técnicas de decodificación especulativa (MTP, multi-token prediction) que mejoran la velocidad de inferencia.

Esta versión GGUF con cuantización imatrix (i1-Q2_K) reduce el tamaño del modelo a unos 11 GB, lo que permite ejecutarlo en hardware de consumo con 12-16 GB de VRAM. La licencia MIT facilita su uso comercial y su integración en proyectos propios. Es relevante para desarrolladores que buscan un modelo especializado en narrativa interactiva y generación de contenido de rol con contexto largo, sin necesidad de infraestructura de servidor dedicada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer, basado en Qwen) |
| Parametros totales | 27 320 697 856 |
| Parametros activos | no disponible |
| Longitud de contexto | 196 000 tokens |
| Tipos de cuantizacion | i1-Q2_K (11.0 GB) y archivo imatrix (0.1 GB) en este repo; otros quants disponibles en el repo estático |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado) |

## Arquitectura y entrenamiento

El modelo base Technomancer-27b-BlackICE-AEON está construido sobre la arquitectura Qwen3.5, una variante de la familia Qwen que emplea un transformer estándar con atención de múltiples cabezas. No se dispone de información detallada sobre el número de capas, dimensiones ocultas o configuración exacta de atención. El modelo incorpora un adaptador LoRA (según los tags), lo que sugiere que fue afinado sobre un modelo base de Qwen3.5 para tareas específicas de roleplay y narrativa.

En cuanto al entrenamiento, no se han publicado datos sobre el número de tokens, la composición del dataset ni si se utilizaron técnicas como RLHF o DPO. La mención a MTP (multi-token prediction) y speculative decoding en los tags indica que el modelo base soporta decodificación especulativa, una técnica que acelera la generación al predecir varios tokens a la vez. La cuantización imatrix aplicada por mradermacher utiliza una matriz de importancia para optimizar la calidad de los pesos cuantizados, especialmente en los niveles de baja precisión.

## Capacidades

- Generación de texto narrativo y conversacional, especializado en juegos de rol de mesa (D&D, Pathfinder) y roleplay.
- Soporte de contexto largo de 196 000 tokens, adecuado para mantener historias extensas y múltiples personajes.
- Decodificación especulativa (MTP) para acelerar la inferencia en hardware compatible.
- Capacidad multilingüe limitada: solo inglés (según la etiqueta de idioma).
- No se menciona soporte explícito para tool calling, agentes o razonamiento multi-paso más allá de la generación de texto.
- No se indica capacidad de visión, audio u otras modalidades.

## Casos de uso

- Generación de aventuras y campañas de D&D: el modelo puede crear tramas, mazmorras, encuentros y diálogos de PNJ, aprovechando su contexto de 196k para mantener coherencia a lo largo de sesiones largas.
- Roleplay interactivo en chats: adecuado para plataformas de rol por texto, donde el modelo interpreta personajes y responde de forma consistente con la historia acumulada.
- Creación de contenido para Pathfinder: puede generar estadísticas de monstruos, descripciones de escenarios y reglas adaptadas al sistema.
- Asistente de escritura creativa: ayuda a autores a desarrollar mundos de fantasía, personajes y diálogos, con capacidad de recordar detalles de capítulos anteriores.
- Simulación de personajes no jugadores (PNJ) en videojuegos: integrable en motores de juego para dar vida a personajes con memoria de interacciones previas.
- Generación de historias personalizadas para usuarios: el modelo puede adaptar la narrativa a las elecciones del jugador, manteniendo un hilo argumental coherente gracias a su ventana de contexto amplia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo.

## Requisitos de hardware

- El archivo cuantizado i1-Q2_K ocupa 11.0 GB, por lo que se estima que requiere al menos 12 GB de VRAM para inferencia con llama.cpp u otros motores compatibles con GGUF.
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070 o superiores. También puede ejecutarse en GPUs de datacenter como A10 o A100 si se dispone de más memoria.
- En CPU, es posible ejecutar el modelo con suficiente RAM (16 GB o más), aunque la velocidad será significativamente menor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier motor que soporte GGUF.
- La decodificación especulativa (MTP) puede mejorar el throughput en hardware compatible, pero no se proporcionan cifras concretas de latencia o tokens por segundo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (roleplay/TTRPG con contexto largo). No se puede realizar una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- El modelo está entrenado principalmente para roleplay y narrativa, por lo que su rendimiento en tareas técnicas o de razonamiento general puede ser limitado.
- Riesgo de alucinación: como todo modelo generativo, puede inventar hechos, reglas o detalles inconsistentes, especialmente en contextos largos.
- Solo soporta inglés; no se recomienda su uso en otros idiomas sin adaptación.
- La cuantización i1-Q2_K es de baja precisión (2 bits), lo que puede degradar la calidad de la generación en comparación con cuantizaciones más altas (Q4, Q5, etc.). Se recomienda probar con quants de mayor calidad si se dispone de más VRAM.
- La licencia MIT permite uso comercial, pero el modelo base (ChonkE/Technomancer-27b-BlackICE-AEON) también es MIT, por lo que no hay restricciones adicionales conocidas. Sin embargo, se debe verificar la procedencia de los datos de entrenamiento si se utiliza en producción.
- No hay garantías de soporte o mantenimiento por parte del autor de la cuantización.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/mradermacher/Technomancer-27b-BlackICE-AEON-i1-GGUF
- Repositorio del modelo base: https://huggingface.co/ChonkE/Technomancer-27b-BlackICE-AEON
- Repositorio de quants estáticos: https://huggingface.co/mradermacher/Technomancer-27b-BlackICE-AEON-GGUF
- Página de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
