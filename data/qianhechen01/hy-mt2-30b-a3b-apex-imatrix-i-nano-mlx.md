# QianheChen01/Hy-MT2-30B-A3B-APEX-Imatrix-I-Nano-MLX

## Resumen

Hy-MT2-30B-A3B-APEX-Imatrix-I-Nano-MLX es una conversión no oficial del modelo de traducción multilingüe Hy-MT2-30B-A3B de Tencent Hunyuan, adaptada al formato MLX para su ejecución en hardware Apple Silicon. El modelo base, desarrollado por Tencent, pertenece a la familia Hy-MT2, una colección de modelos de traducción de tipo "fast-thinking" diseñados para escenarios reales complejos, con tres tamaños disponibles (1,8B, 7B y 30B-A3B) y soporte de traducción entre 33 idiomas.

Esta conversión concreta se ha generado a partir del GGUF `alphaZimuth/Hy-MT2-30B-A3B-APEX-GGUF` y preserva la política de precisión mixta del archivo fuente, mapeando los tensores cuantizados (IQ2_XXS, IQ2_S, Q3_K, Q4_K, Q5_K y Q6_K) a módulos MLX afines de 2, 3, 4, 5 y 6 bits con grupo de tamaño 64. El repositorio ocupa 13,0 GB y el archivo safetensors contiene 3.734.507.392 parámetros reales, correspondientes al modelo cuantizado de 30B totales con 3B activos.

La relevancia de esta conversión reside en que permite ejecutar un modelo de traducción de gran tamaño con arquitectura Mixture-of-Experts en equipos Apple con memoria unificada, algo que no es posible con los pesos originales en FP16 o BF16. Es una opción interesante para desarrolladores que trabajan en macOS y necesitan traducción de alta calidad en dominios profesionales sin depender de la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en transformer |
| Parametros totales | 30B nominales; 3.734.507.392 en el archivo safetensors (cuantizado) |
| Parametros activos | ~3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS, IQ2_S, Q3_K, Q4_K, Q5_K, Q6_K (mapeados a MLX afines de 2/3/4/5/6 bits con grupo 64); pesos flotantes en F16; sesgos de enrutamiento de expertos en F32 |
| Idiomas soportados | 33 idiomas (del modelo base) |
| Licencia | no disponible |
| Formato de pesos | MLX (safetensors), convertido desde GGUF |

## Arquitectura y entrenamiento

El modelo base Hy-MT2-30B-A3B es un transformer de tipo Mixture of Experts con 30 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, lo que permite un rendimiento elevado con un coste de inferencia reducido. La familia Hy-MT2 se ha entrenado específicamente para tareas de traducción multilingüe y para seguir instrucciones de traducción en varios idiomas, con un enfoque en escenarios complejos del mundo real y dominios profesionales.

La conversión MLX de este repositorio no altera la arquitectura del modelo, sino que transforma los pesos cuantizados GGUF a módulos MLX con precisión mixta. Los tensores IQ2_XXS e IQ2_S se mapean a módulos afines de 2 bits, Q3_K a 3 bits, Q4_K a 4 bits, Q5_K a 5 bits y Q6_K a 6 bits, todos con grupo de tamaño 64. Los parámetros de cuantización y los pesos flotantes ordinarios se mantienen en F16, mientras que los sesgos de enrutamiento de expertos permanecen en F32 para preservar la precisión del enrutamiento. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni el proceso de alineación (RLHF/DPO) del modelo base en la información proporcionada.

## Capacidades

- Traducción multilingüe entre 33 idiomas, con soporte para instrucciones de traducción en varios idiomas de entrada y salida.
- Diseñado para escenarios de traducción complejos y dominios profesionales, con calidad superior en textos técnicos y especializados según la documentación del modelo base.
- Arquitectura MoE «fast-thinking» que prioriza velocidad de inferencia sin sacrificar la calidad de la traducción.
- Capacidad de seguir instrucciones de traducción detalladas, incluyendo tono, estilo y terminología específica.
- Compatible con la API de MLX y oMLX para inferencia en dispositivos Apple Silicon.
- No se ha confirmado soporte de tool calling, agentes ni capacidades de visión o audio; el modelo está especializado en traducción.

## Casos de uso

- **Traducción de documentación técnica**: el modelo puede traducir manuales, guías y especificaciones técnicas entre los 33 idiomas soportados, manteniendo la coherencia terminológica gracias a su entrenamiento en dominios profesionales.
- **Localización de software y aplicaciones**: permite traducir cadenas de interfaz, mensajes de error y documentación de producto en proyectos de localización, con la posibilidad de ejecutarse localmente en equipos de desarrollo Apple.
- **Atención al cliente multilingüe**: se puede integrar en sistemas de soporte para traducir consultas y respuestas entre el idioma del cliente y el del agente, con una latencia baja gracias a la arquitectura MoE con 3B parámetros activos.
- **Traducción de contenido jurídico y médico**: su entrenamiento en dominios profesionales lo hace adecuado para traducir contratos, informes médicos y documentación regulada con precisión y coherencia.
- **Traducción en tiempo real para comunicaciones**: su diseño «fast-thinking» permite su uso en sistemas de mensajería o videoconferencia donde la traducción debe ser rápida y precisa.
- **Pipeline de traducción en CI/CD**: al ser un modelo local y ejecutable en MLX, puede integrarse en pipelines de automatización para traducir documentación de software durante el proceso de build, sin depender de servicios externos.
- **Investigación en traducción automática**: el modelo sirve como referencia para comparar técnicas de cuantización mixta y eficiencia de inferencia en arquitecturas MoE en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos oficiales de Tencent sobre el rendimiento de Hy-MT2-30B-A3B en conjuntos de referencia como MMLU, HumanEval o WMT, ni de la conversión MLX concreta. Se recomienda consultar el repositorio del modelo base para futuras actualizaciones.

## Requisitos de hardware

- **VRAM estimada**: el repositorio ocupa 13,0 GB, por lo que se necesita un Mac con al menos 16 GB de memoria unificada para cargar el modelo completo; con 32 GB se obtiene más margen para el contexto y el uso de memoria del sistema.
- **Hardware recomendado**: Apple Silicon (M1, M2, M3 o M4) con 16 GB o más de RAM unificada; el modelo se ejecuta mediante MLX u oMLX, que aprovechan la GPU integrada y el Neural Engine de los chips Apple.
- **Compatibilidad con consumer GPU**: no está diseñado para GPUs NVIDIA o AMD; el formato MLX es específico de Apple Silicon. Para ejecutar en GPU NVIDIA se debería usar el GGUF original con llama.cpp o vLLM.
- **Opciones de despliegue**: MLX, oMLX, y posiblemente conversión a GGUF para llama.cpp si se prefiere ejecución en otras plataformas.
- **Latencia y throughput**: no se dispone de datos medidos en la información proporcionada; la arquitectura con 3B parámetros activos sugiere una latencia moderada en Mac modernos, pero depende del hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-MT2-30B-A3B (base) | 30B (3B activos) | no disponible | 33 | no disponible | safetensors (original) |
| Hy-MT2-30B-A3B-APEX-Imatrix-I-Nano-MLX (este) | 30B nominales, 3,73B en archivo | no disponible | 33 | no disponible | MLX (safetensors) |
| Hy-MT2-30B-A3B-GGUF (chaos700) | 30B | no disponible | 33 | no disponible | GGUF |
| NLLB-200 (Meta, comparativo genérico) | 3,3B | 1.024 tokens | 202 idiomas | CC-BY-NC-4.0 | original |

La comparación con NLLB-200 es orientativa: Hy-MT2-30B-A3B ofrece una arquitectura MoE más eficiente y soporta 33 idiomas, mientras que NLLB-200 cubre más idiomas pero con un modelo denso y un contexto mucho más corto. No se dispone de comparativas de rendimiento en benchmarks comunes entre estos modelos.

## Limitaciones y advertencias

- **Conversión no oficial**: este repositorio es una conversión de un tercero (QianheChen01) a partir de un GGUF de alphaZimuth; no es un modelo publicado ni mantenido por Tencent.
- **Licencia no especificada**: la licencia del modelo base y de la conversión no está disponible, por lo que no se puede garantizar su uso comercial sin revisar los términos originales de Tencent.
- **Cuantización mixta**: la conversión usa bits bajos (2-6 bits) en la mayoría de los tensores, lo que puede degradar la calidad de la traducción en comparación con los pesos originales en FP16 o BF16.
- **Contexto limitado**: no se ha especificado la longitud de contexto, lo que limita el uso en documentos muy largos o conversaciones multi-turno extensas.
- **Idiomas no confirmados**: aunque el modelo base soporta 33 idiomas, la conversión no documenta explícitamente el conjunto de idiomas final.
- **Riesgo de alucinación**: como modelo de traducción, puede generar contenido incorrecto o inventado en textos ambiguos o con terminología especializada no cubierta por los datos de entrenamiento.
- **Sin benchmarks validados**: no hay resultados de evaluación independientes para esta conversión concreta, por lo que su calidad real debe verificarse en el caso de uso específico.

## Enlaces

- Repositorio MLX (este modelo): https://huggingface.co/QianheChen01/Hy-MT2-30B-A3B-APEX-Imatrix-I-Nano-MLX
- Modelo base de Tencent: https://huggingface.co/tencent/Hy-MT2-30B-A3B
- GitHub de Tencent Hunyuan Hy-MT2: https://github.com/Tencent-Hunyuan/Hy-MT2
- ModelScope de Tencent-Hunyuan: https://www.modelscope.cn/models/Tencent-Hunyuan/Hy-MT2-30B-A3B
- GGUF de origen (alphaZimuth): https://huggingface.co/alphaZimuth/Hy-MT2-30B-A3B-APEX-GGUF
- Ficha en Xinference: https://model.xinference.io/models/detail/Hy-MT2-30B-A3B
