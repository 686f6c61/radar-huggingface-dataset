# Lanni-ni/dynamic_alibi_4_6_384_babylm_10m_seed43_epoch4

## Resumen

Modelo de generación de texto de 45.694.080 parámetros publicado por Lanni-ni en Hugging Face. El nombre del repositorio (`dynamic_alibi_4_6_384_babylm_10m_seed43_epoch4`) sugiere un experimento con atención basada en sesgos lineales dinámicos (ALiBi dinámico) dentro del contexto del reto BabyLM, aunque no se dispone de documentación que lo confirme. El README es una plantilla automática de Hugging Face y no contiene información técnica, por lo que la mayor parte de las especificaciones se desconocen.

El modelo se presenta como un experimento de investigación, con una arquitectura que, según el nombre, constaría de 4 capas, 6 cabezas de atención y una dimensión de modelo de 384. Su relevancia radica en explorar variantes de ALiBi (Attention with Linear Biases) para la extrapolación de longitud de contexto, tal como indica la etiqueta `arxiv:1910.09700` que enlaza al paper original de ALiBi. No hay datos de entrenamiento, benchmarks ni casos de uso documentados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención ALiBi dinámica (inferido del nombre y etiquetas; no documentado) |
| Parametros totales | 45.694.080 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura no está documentada en la model card. El nombre del modelo sugiere un transformer con 4 capas, 6 cabezas de atención y dimensión de modelo 384, combinado con un mecanismo de atención ALiBi dinámico. El tag `arxiv:1910.09700` hace referencia al paper "Train Short, Test Long: Attention with Linear Biases Enables Input Length Extrapolation", que introduce los sesgos lineales en la atención. No se han publicado detalles sobre el proceso de entrenamiento: no hay información sobre el número de tokens, la composición del dataset, el régimen de precisión ni si se emplearon técnicas como RLHF o DPO.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que se asume capacidad básica de generación de texto.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no documentadas.
- Cualquier otra capacidad: no documentada. No se puede afirmar ninguna funcionalidad concreta más allá de la generación de texto.

## Casos de uso

No se han publicado casos de uso específicos ni evaluaciones que respalden aplicaciones prácticas. El modelo es un experimento de investigación sin documentación, por lo que no se recomienda su uso en producción. A continuación se indican posibles áreas de exploración académica, sin evidencia de rendimiento:

- Investigación en atención con sesgos lineales dinámicos: puede utilizarse para estudiar cómo las variantes de ALiBi afectan a la extrapolación de longitud en modelos pequeños.
- Experimentos de extrapolación de contexto: al ser un modelo de 45M de parámetros, permite probar hipótesis sobre longitudes de secuencia mayores que las del entrenamiento.
- Comparación de arquitecturas en el reto BabyLM: podría servir como modelo de referencia para evaluar variantes de atención en condiciones de datos limitados.
- Estudio de la relación entre tamaño del modelo y dinámica de atención: su pequeño tamaño facilita análisis de interpretabilidad y ablaciones.
- Educación y docencia: puede emplearse como ejemplo práctico de un transformer mínimo con ALiBi en cursos de aprendizaje automático.
- Exploración de técnicas de regularización o inicialización: al ser un modelo pequeño y reproducible (semilla 43, 4 épocas), permite reproducir experimentos con facilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 180 MB en FP32 y 90 MB en FP16, calculados a partir de los 45.694.080 parámetros. No se dispone de datos reales de consumo.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. En caso de usar GPU, cualquier modelo consumer (RTX 3060, RTX 4090, etc.) es suficiente.
- Capacidad en consumer GPU: sí, el modelo cabe sobradamente en cualquier GPU de consumo.
- Opciones de despliegue: se puede cargar con la librería `transformers` de Hugging Face. No se ha documentado soporte para vLLM, llama.cpp, Ollama ni TGI, aunque por su tamaño sería posible convertirlo a GGUF con herramientas externas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparables. Existe un modelo hermano en el mismo repositorio de Hugging Face con nombre `dynamic_alibi_4_6_384_babylm_100m_epoch7`, que parece seguir la misma línea experimental, pero no se han obtenido sus especificaciones ni resultados de rendimiento, por lo que no se puede establecer una comparativa rigurosa.

| Modelo | Parametros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dynamic_alibi_4_6_384_babylm_10m_seed43_epoch4 | 45.694.080 | no disponible | no disponible | no disponible | Hugging Face |
| dynamic_alibi_4_6_384_babylm_100m_epoch7 | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información. No se han realizado evaluaciones de sesgo ni de equidad.
- Riesgo de alucinación: no evaluado. Como cualquier modelo de lenguaje sin filtros ni alineación, es probable que genere contenido incorrecto o inventado.
- Limitaciones de contexto o idioma: la longitud de contexto no está documentada; los idiomas soportados tampoco.
- Restricciones de licencia para uso comercial: la licencia figura como "no disponible", por lo que el uso comercial es legalmente incierto y debe verificarse antes de desplegarlo.
- Caveat importante para producción: el modelo no tiene benchmarks, ni documentación de entrenamiento, ni evaluaciones de seguridad. No es apto para entornos productivos sin una validación previa exhaustiva.
- El README es una plantilla automática sin contenido técnico, lo que indica que el modelo no ha sido documentado por su autor.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_10m_seed43_epoch4
- Modelo hermano (100m): https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch7
- Paper de ALiBi (arxiv:1910.09700): https://arxiv.org/abs/1910.09700
