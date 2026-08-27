# knoveleng/gemma-2-9b-it-uncensored

## Resumen

`knoveleng/gemma-2-9b-it-uncensored` es una versión modificada del modelo `google/gemma-2-9b-it` en la que se ha eliminado el comportamiento de rechazo mediante una técnica de ortogonalización de pesos a nivel de capa, conocida como *abliteration*. El desarrollo corre a cargo de knoveleng y utiliza la herramienta `orthex`, una implementación del método descrito en el artículo *"Refusal in Language Models Is Mediated by a Single Direction"* (Arditi et al., NeurIPS 2024). El objetivo es facilitar el análisis de robustez, el red-teaming y el estudio del comportamiento de los modelos cuando se suprime la dirección de rechazo.

El modelo conserva la arquitectura original de Gemma 2 9B (un transformer decoder-only con 9.241.705.984 parámetros) y una ventana de contexto de 8192 tokens. La modificación se aplica directamente sobre los pesos, de modo que el checkpoint funciona de forma autónoma sin necesidad de hooks en tiempo de inferencia. La evaluación interna muestra una reducción de la tasa de rechazo del 97 % al 3 %, con un aumento de la perplejidad de 24,28 a 26,10.

Este modelo está pensado exclusivamente para investigación en seguridad y análisis de comportamiento, no para uso productivo general. Su licencia sigue la del modelo base de Google, por lo que cualquier uso debe respetar los términos originales de Gemma 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) |
| Parametros totales | 9.241.705.984 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors; se puede cuantizar externamente) |
| Idiomas soportados | No disponible (hereda los del modelo base, que soporta multiples idiomas) |
| Licencia | Licencia de `google/gemma-2-9b-it` (Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-2-9b-it` y aplica una ablación por ortogonalización de pesos. El procedimiento, implementado en `orthex`, identifica una dirección en el espacio de activaciones (en este caso, en la capa 23, sitio `resid_pre`) que correlaciona con el rechazo. Esa dirección se proyecta fuera de los pesos de `embed_tokens`, `attn_out` y `mlp_out` de cada capa, eliminando así la respuesta de rechazo sin necesidad de reentrenamiento.

No se realizó ningún entrenamiento adicional ni ajuste fino. La modificación es puramente geométrica sobre los pesos existentes, lo que preserva en gran medida las capacidades generales del modelo base, aunque con una ligera degradación de la perplejidad (de 24,28 a 26,10 en el conjunto de prueba interno). El checkpoint resultante es autónomo y no requiere la librería `orthex` en tiempo de inferencia.

## Capacidades

- Generación de texto y razonamiento: conserva las capacidades del modelo base para tareas de lenguaje natural, incluyendo comprensión lectora, resumen y diálogo.
- Generación de código: hereda la capacidad de Gemma 2 9B para escribir y explicar código en varios lenguajes.
- Matemáticas: mantiene un nivel razonable de razonamiento aritmético y simbólico, aunque no se han publicado benchmarks específicos.
- Multilingüismo: al estar basado en Gemma 2, soporta múltiples idiomas, aunque no se detalla la lista exacta en la documentación.
- Ausencia de rechazo: la característica distintiva es que el modelo no muestra resistencia a solicitudes que el modelo base rechazaría, lo que lo hace útil para estudiar los límites de la seguridad.
- No se dispone de información sobre soporte de tool calling, agentes o modos de pensamiento extendido.

## Casos de uso

- Red-teaming de modelos de lenguaje: el modelo permite probar técnicas de ataque y evaluar la eficacia de los mecanismos de seguridad al eliminar la dirección de rechazo.
- Investigación en robustez: estudiar cómo cambia el comportamiento del modelo cuando se suprime una dirección específica, y qué otras capacidades se ven afectadas.
- Análisis de sesgos y alucinaciones: al no tener rechazo, se puede examinar la tendencia del modelo a generar contenido no deseado o falso sin la interferencia de filtros.
- Evaluación de técnicas de ablación: comparar el rendimiento de este checkpoint con el original para validar la metodología de ortogonalización de pesos.
- Desarrollo de contramedidas: usar el modelo para generar ejemplos adversarios que ayuden a entrenar clasificadores de contenido dañino.
- Estudios de interpretabilidad: analizar qué capas y sitios son más relevantes para el comportamiento de rechazo, utilizando la dirección seleccionada como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única evaluación reportada es la comparación pre y post ablación sobre un conjunto de prompts de prueba interno:

| Metrica | Pre-ablacion | Post-ablacion | Delta |
|---|---|---|---|
| Tasa de rechazo | 0.97 | 0.03 | -0.94 |
| Perplejidad | 24.28 | 26.10 | +1.81 |

Estos datos indican que la ablación reduce drásticamente el rechazo a costa de un ligero aumento de la perplejidad, lo que sugiere una degradación mínima en la fluidez general.

## Requisitos de hardware

- VRAM estimada: en FP16, el modelo ocupa aproximadamente 18,5 GB (tamaño del repo). Con cuantización de 8 bits se reduce a unos 9 GB, y con 4 bits a unos 5 GB, lo que permite ejecutarlo en GPUs de consumo como la RTX 3090 o RTX 4090.
- GPUs recomendadas: para FP16 se necesita una GPU con al menos 24 GB de VRAM (A100, RTX 4090, A6000). Con cuantización, una RTX 3080/3090 de 10-24 GB es suficiente.
- Opciones de despliegue: al ser un modelo estándar de Hugging Face, se puede servir con vLLM, TGI, llama.cpp (tras conversión a GGUF) u Ollama.
- Latencia y throughput: no se dispone de mediciones específicas. Como referencia, Gemma 2 9B en FP16 en una A100 suele generar entre 30 y 50 tokens por segundo, dependiendo de la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `google/gemma-2-9b-it` | 9,24 B | 8192 | Gemma Terms of Use | Modelo base con mecanismos de rechazo |
| `knoveleng/gemma-2-9b-it-uncensored` | 9,24 B | 8192 | Gemma Terms of Use | Versión abliterada, sin rechazo |
| `themex1380/Gemma-2-9B-Uncensored` | 9,24 B | 8192 | No especificada | Otra versión "uncensored" sin detalles técnicos |

La comparativa se limita a parámetros y contexto, ya que no hay datos de rendimiento público para las versiones modificadas. La principal diferencia entre el modelo de knoveleng y el de themex1380 es la metodología: el primero documenta explícitamente el uso de ortogonalización de pesos, mientras que el segundo no proporciona detalles.

## Limitaciones y advertencias

- Ausencia de rechazo: el modelo puede generar contenido dañino, ilegal o éticamente cuestionable. No debe usarse en aplicaciones orientadas al usuario final sin supervisión humana.
- Riesgo de alucinación: al igual que el modelo base, puede inventar hechos o datos, y la falta de rechazo puede aumentar la confianza en respuestas incorrectas.
- Sesgos del modelo base: hereda los sesgos presentes en Gemma 2 9B, que pueden manifestarse en estereotipos o discriminación.
- Licencia restrictiva: la licencia de Gemma 2 prohíbe ciertos usos comerciales y requiere atribución. Este repo no otorga derechos adicionales.
- Degradación de la perplejidad: el aumento de 1,81 puntos puede afectar a tareas que requieren alta precisión lingüística.
- Sin soporte oficial: al ser un proyecto de investigación, no hay garantías de mantenimiento ni actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/knoveleng/gemma-2-9b-it-uncensored
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- Paper de referencia: https://arxiv.org/abs/2406.11717
- Repositorio de orthex: https://github.com/knoveleng/orthex
