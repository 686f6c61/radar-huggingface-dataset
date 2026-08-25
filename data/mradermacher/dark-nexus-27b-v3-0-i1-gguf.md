# mradermacher/Dark-Nexus-27B-v3.0-i1-GGUF

## Resumen

Dark-Nexus-27B-v3.0-i1-GGUF es una cuantización GGUF del modelo Dark-Nexus-27B-v3.0, desarrollado originalmente por ReadyArt y cuantizado por mradermacher. Se trata de un modelo de lenguaje de 27 mil millones de parámetros, orientado a tareas de rol y conversación sin restricciones, con un enfoque explícito en contenido NSFW, roleplay y respuestas no alineadas. El modelo base no está disponible públicamente con su arquitectura detallada, pero se sabe que utiliza una arquitectura transformer de 27B parámetros y está entrenado exclusivamente en inglés. La cuantización imatrix empleada por mradermacher optimiza la relación calidad-tamaño, permitiendo ejecutar el modelo en hardware más modesto que el necesario para el modelo completo. Su relevancia radica en ofrecer una versión práctica de un modelo de gran escala para usuarios que buscan un comportamiento sin censura en entornos de generación de texto conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformers (arquitectura específica no disponible) |
| Parámetros totales | 27.320.697.856 (27,3 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S, entre otros (ver repositorio) |
| Idiomas soportados | Inglés |
| Licencia | Other (no especificada, se debe consultar el modelo base) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura exacta del modelo base Dark-Nexus-27B-v3.0. Se sabe que es un modelo de tipo transformers con 27,3 mil millones de parámetros, pero no se han publicado detalles sobre el número de capas, dimensiones de atención, mecanismos de atención específicos, o el conjunto de datos de entrenamiento. Tampoco hay datos sobre el proceso de entrenamiento (número de tokens, métodos de alineación como RLHF o DPO). La cuantización i1 (imatrix) realizada por mradermacher aplica una técnica de cuantización basada en matrices de importancia para reducir el tamaño del modelo manteniendo la mayor calidad posible, pero los detalles del entrenamiento original no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional y narrativo.
- Roleplay y simulación de personajes, especialmente en contextos sin restricciones de contenido.
- Respuestas no alineadas, es decir, sin filtros de seguridad ni rechazo de contenido explícito o sensible.
- Capacidad multilingüe limitada al inglés (no se garantiza correcto en otros idiomas).
- No se mencionan capacidades de tool calling, function calling, ni razonamiento multi-step.
- El autor indica que es un modelo de visión, pero los archivos mmproj no están en este repositorio; se encuentran en el repositorio estático (Dark-Nexus-27B-v3.0-GGUF). No se puede confirmar el funcionamiento de la visión sin esos archivos.

## Casos de uso

- **Roleplay y ficción interactiva**: el modelo puede actuar como personaje en juegos de rol, generando diálogos y descripciones detalladas sin limitaciones de contenido, lo que lo hace adecuado para comunidades que buscan experiencias inmersivas sin censura.
- **Creación de contenido narrativo**: escritores pueden usarlo para generar borradores de historias, diálogos o escenas con temáticas adultas, aprovechando su capacidad de mantener contexto en conversaciones largas (aunque el contexto no está especificado).
- **Chatbots personalizados sin filtros**: para entornos de prueba o investigación donde se requiera un asistente que no rechace preguntas ni solicitudes, útil para estudiar el comportamiento de modelos sin alineamiento.
- **Generación de respuestas para simulación de personajes en videojuegos**: integración en motores de juego o sistemas de diálogo donde se necesite un comportamiento no restringido.
- **Investigación académica sobre sesgos y alineamiento**: como modelo no alineado, sirve para estudiar los efectos de la falta de entrenamiento de seguridad en sistemas de IA, siempre bajo entornos controlados y éticos.
- **Pruebas de estrés de infraestructura de inferencia**: dado su tamaño y las cuantizaciones disponibles, se puede usar para evaluar rendimiento de servidores de inferencia con modelos de gran tamaño en configuraciones de memoria limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K u otros conjuntos de datos estándar para este modelo, ni comparaciones con modelos similares.

## Requisitos de hardware

- **VRAM estimada**: según los tamaños de los archivos GGUF proporcionados:
  - i1-Q2_K: 11 GB (requiere al menos 12 GB de VRAM con overhead).
  - i1-IQ3_M: 12,9 GB (requiere al menos 14 GB de VRAM).
  - i1-Q4_K_S: 15,9 GB (requiere al menos 16 GB de VRAM).
- **GPU recomendadas**: para las cuantizaciones más pequeñas, una GPU con 12-16 GB de VRAM (p. ej., RTX 3060 12GB, RTX 4070 12GB, RTX 3080 10GB) puede funcionar con Q2_K o IQ3_M. Para Q4_K_S se recomienda una GPU de 16 GB o superior (p. ej., RTX 4080, RTX 4090, A4000, etc.). No se dispone de datos para GPUs profesionales como A100 o H100.
- **CPU**: puede ejecutarse con llama.cpp en modo CPU, con un uso de RAM igual al tamaño del archivo más overhead. Por ejemplo, Q4_K_S necesitaría al menos 16 GB de RAM.
- **Opciones de despliegue**: llama.cpp, Ollama, o cualquier motor compatible con GGUF (vLLM no soporta GGUF nativamente; se puede convertir a otros formatos).
- **Latencia y throughput**: no disponible; dependerá del hardware y de la cuantización utilizada.

## Comparativa con modelos similares

No se dispone de datos comparativos específicos para Dark-Nexus-27B-v3.0. Sin embargo, existen otros modelos "abliterated" o sin censura en el ecosistema, como:
- **huihui_ai/gemma-4-abliterated**: modelo de 27B (posiblemente similar en tamaño) con licencia abierta, pero sin datos de rendimiento disponibles en la búsqueda.
- **huihui_ai/qwen3.5-abliterated:27b**: también un modelo de 27B sin censura, pero sin información técnica detallada en la búsqueda.

Estos modelos no tienen métricas publicadas en la información proporcionada, por lo que no se puede realizar una comparativa numérica. Se recomienda consultar sus respectivas fichas para obtener datos de contexto, arquitectura y licencias.

## Limitaciones y advertencias

- **Contenido peligroso y sin filtros**: al ser un modelo "unaligned" y "dangerous", puede generar respuestas que incluyan violencia, contenido explícito, instrucciones ilegales o dañinas. No es apto para uso en producción sin medidas de seguridad adicionales.
- **Riesgo de alucinación**: al igual que otros modelos de lenguaje, puede producir información falsa o inventada, especialmente en temas especializados.
- **Idioma limitado**: solo está entrenado en inglés, por lo que su rendimiento en otros idiomas (incluido el español) es probablemente deficiente.
- **Licencia**: la licencia "other" no especificada puede implicar restricciones comerciales o de uso. Es necesario revisar la licencia del modelo base en el repositorio de ReadyAI para conocer los términos exactos.
- **Contexto desconocido**: no se conoce la longitud de contexto del modelo, lo que puede afectar a la calidad en conversaciones largas.
- **No recomendado para entornos de producción**: su naturaleza no alineada y la falta de datos de seguridad lo desaconsejan para aplicaciones comerciales o de uso público.

## Enlaces

- [Repositorio GGUF de mradermacher](https://huggingface.co/mradermacher/Dark-Nexus-27B-v3.0-i1-GGUF)
- [Modelo base (ReadyArt/Dark-Nexus-27B-v3.0)](https://huggingface.co/ReadyArt/Dark-Nexus-27B-v3.0)
- [Repositorio estático de cuantizaciones (con mmproj)](https://huggingface.co/mradermacher/Dark-Nexus-27B-v3.0-GGUF)
- [Página de solicitudes de modelos de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Perfil de mradermacher en Hugging Face](https://huggingface.co/mradermacher)
