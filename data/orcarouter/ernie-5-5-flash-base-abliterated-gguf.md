# orcarouter/ERNIE-5.5-Flash-Base-abliterated-GGUF

## Resumen

ERNIE-5.5-Flash-Base-abliterated-GGUF es una versión cuantizada en formato GGUF del modelo base ERNIE-5.5-Flash-Base-BF16 de Baidu, publicada por el usuario orcarouter. Se trata de una variante "abliterated" (también llamada "uncensored"), es decir, con las direcciones de rechazo eliminadas del espacio de activaciones para reducir la probabilidad de respuestas negativas a peticiones que el modelo original rechazaría. El modelo subyacente es un transformer de tipo Mixture-of-Experts (MoE) con 286.245.712.210 parámetros totales, orientado a generación de texto en inglés y chino.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo base de gran escala con arquitectura MoE, una modificación de alineación (abliteration) que altera el comportamiento de seguridad, y una distribución en GGUF pensada para inferencia local con llama.cpp. El repositorio ocupa 425,8 GB, lo que refleja cuantizaciones de precisión mixta sobre un modelo de casi 286.000 millones de parámetros.

Conviene señalar desde el principio que el acceso está restringido (gated) en Hugging Face: es necesario aceptar las condiciones del modelo base en la plataforma antes de poder descargar los pesos. La licencia declarada es `ernie-5.5-flash-base-model-license-v1.0`, una licencia propia de Baidu que no es de código abierto estándar y cuyos términos deben revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) |
| Parametros totales | 286.245.712.210 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con precisión mixta (mixed-precision); niveles concretos no disponibles |
| Idiomas soportados | en, zh |
| Licencia | ernie-5.5-flash-base-model-license-v1.0 |
| Formato de pesos | GGUF (repo); BF16 en el modelo base (safetensors) |

## Arquitectura y entrenamiento

El modelo base es ERNIE-5.5-Flash-Base-BF16, desarrollado por Baidu, y pertenece a la familia ERNIE 5.5. Según los metadatos del repositorio, se trata de un transformer con arquitectura Mixture-of-Experts y 286.245.712.210 parámetros totales. No se dispone en la información proporcionada de datos sobre el número de parámetros activos por token, el número de expertos, la longitud de contexto nativa ni la composición del dataset de entrenamiento.

La variante publicada por orcarouter aplica una técnica de "abliteration" sobre el modelo base: se identifican las direcciones en el espacio de activaciones asociadas a la negativa a responder y se proyectan fuera de los pesos, de modo que el modelo pierde parte de su alineación de seguridad. Posteriormente se ha cuantizado a GGUF con precisión mixta para permitir su ejecución con llama.cpp. No se detallan en la información disponible la metodología exacta de abliteration, el número de tokens de entrenamiento del modelo base, ni si este recibió RLHF o DPO. El modelo base es un "Base", no un modelo instruct, lo que implica que no está ajustado para seguir instrucciones de forma conversacional.

## Capacidades

- Generación de texto autoregresiva en inglés y chino.
- Modelo base (no instruct): completa texto y puede usarse como punto de partida para fine-tuning, pero no está optimizado para seguir instrucciones ni para diálogo multi-turno sin ajuste adicional.
- Arquitectura MoE de gran escala, adecuada para tareas de modelado de lenguaje general.
- Comportamiento "abliterated": se reduce la probabilidad de rechazos ante peticiones que el modelo original rechazaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; los tags solo indican text-generation.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: comparar el comportamiento del modelo base frente a la variante abliterated permite estudiar cómo la proyección de direcciones de rechazo afecta a las respuestas en dominios sensibles, con fines académicos y de auditoría.
- Fine-tuning domain-specific: al ser un modelo base, sirve como inicialización para ajuste supervisado en dominios concretos (legal, médico, técnico) en inglés o chino, aprovechando su capacidad de modelado previo.
- Generación de texto a gran escala en chino e inglés: tareas de completado, resumen o paráfrasis en pipelines por lotes donde no se requiere un modelo instruct.
- Experimentación con cuantización GGUF: el repo permite evaluar el impacto de la precisión mixta en un MoE de ~286B parámetros, comparando calidad y velocidad frente al BF16 original.
- Despliegue local con llama.cpp: para equipos con hardware suficiente, permite ejecutar un modelo de esta familia fuera de la nube, con las ventajas de privacidad que ello conlleva.
- Estudio de robustez de salvaguardas: analizar qué tipo de contenido genera un modelo sin alineación de rechazo para diseñar mejores filtros y clasificadores de seguridad en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 286.245.712.210 parámetros, incluso a 4 bits por peso se requieren aproximadamente 143 GB solo para los pesos, más overhead de contexto y caché KV. A 8 bits, unos 286 GB. El repo de 425,8 GB sugiere cuantizaciones de precisión mixta con componentes en mayor precisión.
- GPU recomendadas: no cabe en ninguna GPU consumer individual. Se requiere un nodo multi-GPU (varias A100 80GB, H100 80GB o H200) o un servidor con suficiente memoria unificada.
- GPU consumer: no es viable en RTX 4090 (24 GB), RTX 3090 (24 GB) ni en configuraciones de 2×24 GB. Solo sería posible con offloading masivo a RAM del sistema, con latencia muy alta.
- Opciones de despliegue: llama.cpp (formato nativo del repo), y potencialmente otros runners compatibles con GGUF. vLLM y TGI no se mencionan en la información disponible para este repo concreto.
- Latencia y throughput: no disponibles. Con un MoE de este tamaño, el throughput dependerá críticamente del número de parámetros activos, dato no proporcionado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ERNIE-5.5-Flash-Base-abliterated-GGUF (este) | 286.245.712.210 | no disponible | ernie-5.5-flash-base-model-license-v1.0 | GGUF | MoE, base, abliterated, gated |
| baidu/ERNIE-5.5-Flash-Base-BF16 | 286.245.712.210 | no disponible | ernie-5.5-flash-base-model-license-v1.0 | safetensors (BF16) | Modelo base original, sin abliteration |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para comparar con modelos de otros fabricantes de tamaño o categoría similar sin inventar datos.

## Limitaciones y advertencias

- Modelo base, no instruct: no está ajustado para seguir instrucciones ni para conversación; su uso directo en producción conversacional requerirá fine-tuning.
- Abliteration: la eliminación de direcciones de rechazo reduce las salvaguardas del modelo original. Puede generar contenido dañino, ofensivo o inexacto en dominios sensibles, y no debe desplegarse sin filtros adicionales.
- Sesgos: no se han documentado en la información proporcionada, pero al derivar de un modelo entrenado principalmente en inglés y chino, es esperable un sesgo hacia esas culturas y lenguas.
- Alucinación: riesgo inherente a los modelos de lenguaje; no hay datos específicos de evaluación en la información disponible.
- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está garantizado ni documentado.
- Licencia: la licencia `ernie-5.5-flash-base-model-license-v1.0` es propia de Baidu y puede imponer restricciones al uso comercial, a la redistribución o al uso de los outputs. Debe revisarse el texto completo antes de cualquier despliegue.
- Acceso restringido: el repo es gated; es necesario aceptar las condiciones en Hugging Face y disponer de cuenta autorizada.
- Repositorio de terceros: publicado por orcarouter, no por Baidu; la calidad de la cuantización y de la abliteration no está avalada por el fabricante original.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la degradación introducida por la cuantización ni por la abliteration.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/orcarouter/ERNIE-5.5-Flash-Base-abliterated-GGUF
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Base-BF16
- llama.cpp (runner compatible con GGUF): https://github.com/ggerganov/llama.cpp
