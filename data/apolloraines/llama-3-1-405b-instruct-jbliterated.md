# ApolloRaines/Llama-3.1-405B-Instruct-Jbliterated

## Resumen

El modelo **ApolloRaines/Llama-3.1-405B-Instruct-Jbliterated** es una versión modificada del modelo insignia de Meta, Llama 3.1 405B Instruct, desarrollada por Apollo Raines. Sobre el modelo base se aplican dos técnicas de modificación de pesos post-entrenamiento: **Jbliteration**, que elimina quirúrgicamente el comportamiento de rechazo (refusal) sin dañar la personalidad ni la creatividad del modelo, y **Desycophancy**, que suprime la tendencia a ceder ante afirmaciones incorrectas del usuario bajo presión social. El resultado es un modelo de 405 000 millones de parámetros que conserva íntegramente el conocimiento, el razonamiento y la ventana de contexto de 128K tokens del original, pero que responde sin negativas y mantiene sus posiciones ante falacias de autoridad.

Este modelo es relevante porque representa la mayor modificación quirúrgica de pesos aplicada a un modelo abierto de este tamaño, y porque aborda dos problemas habituales en los asistentes instructivos: la sobrecautela (rechazo excesivo) y la sumisión ante presión social. Está pensado para desarrolladores e investigadores que necesitan un modelo de gran escala con respuestas sin filtros y con una postura firme, manteniendo la calidad del base. Su licencia es la Llama 3.1 Community License, lo que permite uso comercial con restricciones para grandes empresas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Grouped-Query Attention (GQA) |
| Parámetros totales | 405 853 388 800 (405B) |
| Parámetros activos | no aplicable (modelo denso) |
| Longitud de contexto | 128 000 tokens |
| Tipos de cuantización | no disponible (el repositorio solo ofrece pesos en bf16) |
| Idiomas soportados | inglés (declarado); el base soporta 8 idiomas (alemán, francés, hindi, inglés, italiano, portugués, español y tailandés) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura es la misma que la de Llama 3.1 405B Instruct: un transformer denso con Grouped-Query Attention (GQA) para optimizar la inferencia, entrenado sobre aproximadamente 15 billones de tokens según la documentación de Meta. El modelo base fue sometido a un proceso de instrucción y ajuste fino con datos supervisados y refinamiento por preferencias (RLHF). Sobre estos pesos ya entrenados, Apollo Raines aplica dos modificaciones post-entrenamiento:

- **Jbliteration**: a diferencia de la abliteración estándar, que elimina la dirección de rechazo completa y daña rasgos de personalidad solapados, esta técnica identifica y elimina únicamente el componente causal que produce los tokens de rechazo. Así se preservan el humor, la ironía, la creatividad y la voz del modelo.
- **Desycophancy**: elimina la tendencia a estar de acuerdo con afirmaciones incorrectas del usuario cuando este ejerce presión social o autoridad falsa. El modelo mantiene su respuesta correcta en lugar de disculparse o cambiar de opinión.

No se ha realizado ningún entrenamiento adicional; los pesos se modifican directamente mediante operaciones algebraicas sobre las activaciones. El modelo es un reemplazo directo del base, con el mismo tokenizador y la misma interfaz.

## Capacidades

- Generación de texto en inglés con alta calidad, incluyendo razonamiento complejo, matemáticas, código y conocimiento general, heredadas del modelo base.
- Respuesta sin rechazos: el modelo contesta a cualquier petición, incluso aquellas que el base normalmente rechazaría por seguridad o contenido sensible.
- Resistencia a la presión social: no cede ante afirmaciones falsas del usuario, mantiene la respuesta correcta incluso cuando se le insiste con autoridad.
- Soporte de tool calling y function calling, tal como el modelo base (integración con herramientas externas).
- Capacidad de agentes y razonamiento multi-paso, gracias a la ventana de 128K tokens que permite mantener contextos largos.
- Multilingüismo limitado en esta versión: aunque el base soporta 8 idiomas, la model card solo declara inglés; el comportamiento en otros idiomas no está verificado.
- Sin modo de pensamiento explícito (thinking mode) ni capacidades multimodales; es un modelo de texto puro.

## Casos de uso

- **Generación de contenido creativo sin restricciones**: escritores y guionistas pueden usar el modelo para explorar temas tabú o controvertidos sin que el modelo se niegue, manteniendo un tono natural y con personalidad. Es adecuado porque la Jbliteration preserva la voz creativa del base.
- **Investigación en seguridad y alineación**: investigadores que estudian comportamientos de rechazo y sycophancy pueden usar este modelo como caso de estudio comparativo frente al base, para analizar el efecto de las modificaciones de pesos en la conducta del modelo.
- **Asistencia técnica en entornos con requisitos de respuesta incondicional**: por ejemplo, en sistemas de generación de documentación técnica donde el modelo debe responder siempre, incluso a preguntas que el base podría considerar fuera de límites.
- **Desarrollo de agentes conversacionales con postura firme**: chatbots de atención al cliente o asistentes virtuales que necesitan mantener una posición correcta ante usuarios insistentes o que intentan manipular la respuesta con falsas autoridades.
- **Evaluación de modelos y benchmarks de robustez**: el modelo puede usarse para probar técnicas de jailbreak inverso o para medir la resistencia a la sycophancy en comparación con otros modelos.
- **Generación de datos sintéticos para entrenamiento**: al no rechazar peticiones, puede producir respuestas en dominios donde otros modelos se niegan, útil para crear datasets de entrenamiento en áreas sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión modificada en la información disponible. El modelo base, Llama 3.1 405B Instruct, reporta resultados destacados en MMLU, HumanEval, GSM8K y otras pruebas, pero no se dispone de datos verificados para la versión Jbliterated + Desyced. Se recomienda consultar la documentación de Meta para los benchmarks del base y asumir que las modificaciones de pesos no alteran significativamente el rendimiento en tareas estándar, aunque no hay evidencia empírica publicada.

## Requisitos de hardware

- **VRAM estimada**: el modelo en bf16 ocupa aproximadamente 811 GB, por lo que se necesitan múltiples GPUs de alta gama. Con cuantización a 8 bits se reduciría a unos 405 GB, y a 4 bits a unos 203 GB, pero no se ofrecen pesos cuantizados en el repositorio.
- **GPUs recomendadas**: configuraciones multi-GPU con NVIDIA A100 80GB (al menos 10-11 unidades), H100 80GB (10-11), o clusters de GPUs más pequeñas con NVLink. No cabe en una GPU de consumo (RTX 4090 tiene 24 GB).
- **Opciones de despliegue**: el autor recomienda **DeepswapLLM**, una herramienta que permite ejecutar el modelo en GPUs demasiado pequeñas para contenerlo, transmitiendo capas entre GPU, RAM y disco, hasta 4 veces más rápido que AirLLM. También es compatible con Hugging Face Transformers mediante `device_map="auto"` y con frameworks como vLLM o TGI si se dispone del hardware suficiente.
- **Latencia y throughput**: no se han publicado cifras concretas. En un cluster de 8 H100, la inferencia de un token puede rondar decenas de milisegundos, pero depende de la implementación y del tamaño del lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modificaciones |
|---|---|---|---|---|
| ApolloRaines/Llama-3.1-405B-Instruct-Jbliterated | 405B | 128K | Llama 3.1 | Jbliteration + Desycophancy |
| meta-llama/Llama-3.1-405B-Instruct | 405B | 128K | Llama 3.1 | Ninguna (base) |
| meta-llama/Llama-3.1-70B-Instruct | 70B | 128K | Llama 3.1 | Ninguna (base) |
| cognitivecomputations/dolphin-2.9.1-llama-3.1-70b | 70B | 128K | Llama 3.1 | Entrenado sin censura (fine-tuning) |

La comparativa directa con el base es la más relevante: el modelo Jbliterated mantiene el mismo tamaño, contexto y licencia, pero altera el comportamiento de rechazo y sycophancy. Frente a modelos "uncensored" como Dolphin, que se obtienen mediante fine-tuning, este modelo usa modificación de pesos, lo que preserva mejor las capacidades originales. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser una modificación del base, conserva los sesgos presentes en los datos de entrenamiento de Llama 3.1, y puede alucinar hechos o generar contenido incorrecto, especialmente en dominios poco representados.
- **Riesgo de contenido inapropiado**: al eliminar el rechazo, el modelo puede generar contenido violento, sexual, ofensivo o peligroso si se le solicita. No debe desplegarse en entornos de producción sin moderación externa.
- **Limitaciones de idioma**: aunque el base soporta 8 idiomas, esta versión solo declara inglés; el comportamiento en otros idiomas no está verificado y podría degradarse.
- **Restricciones de licencia**: la Llama 3.1 Community License permite uso comercial, pero exige que las empresas con más de 700 millones de usuarios mensuales soliciten una licencia específica a Meta. Además, el modelo modificado puede no cumplir políticas de uso aceptable de algunas plataformas.
- **Caveat para producción**: al ser un modelo de 405B, el coste de inferencia es muy alto y requiere infraestructura especializada. La modificación de pesos no ha sido auditada externamente; se recomienda validar su comportamiento en casos de uso concretos antes de desplegarlo.

## Enlaces

- [HuggingFace: ApolloRaines/Llama-3.1-405B-Instruct-Jbliterated](https://huggingface.co/ApolloRaines/Llama-3.1-405B-Instruct-Jbliterated)
- [HuggingFace: meta-llama/Llama-3.1-405B-Instruct](https://huggingface.co/meta-llama/Llama-3.1-405B-Instruct)
- [Repositorio DeepswapLLM](https://github.com/apolloraines/DeepswapLLM)
- [Documentación de Meta sobre Llama 3.1](https://ai.meta.com/llama/)
- [Análisis de Llama-3.1-405B-Instruct en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/llama-31-405b-instruct-meta-llama)
