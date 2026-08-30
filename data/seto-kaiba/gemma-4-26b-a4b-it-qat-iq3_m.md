# seto-kaiba/Gemma-4-26B-A4B-IT-QAT-IQ3_M

## Resumen

El modelo `seto-kaiba/Gemma-4-26B-A4B-IT-QAT-IQ3_M` es una cuantización de baja precisión del modelo base `google/gemma-4-26B-A4B-it`, desarrollado por Google DeepMind. Se trata de una variante de la familia Gemma 4, que emplea una arquitectura de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y 4 mil millones de parámetros activos por token. El autor de esta cuantización, seto-kaiba, ha aplicado un proceso de cuantización con entrenamiento consciente (QAT) y un formato de cuantización IQ3_M, orientado a reducir los requisitos de memoria y permitir su ejecución en hardware de consumo.

El modelo base destaca por su ventana de contexto de hasta 256 000 tokens, soporte multilingüe en más de 140 idiomas y capacidades multimodales (entrada de texto e imagen, salida de texto). Esta cuantización hereda dichas capacidades, aunque con una posible pérdida de precisión inherente a la reducción de bits. Su relevancia actual radica en que permite desplegar un modelo de gran capacidad en GPUs con VRAM limitada, manteniendo un rendimiento razonable para tareas de generación, razonamiento y codificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en transformer |
| Parametros totales | 26 000 millones (26B) |
| Parametros activos | 4 000 millones (4B) |
| Longitud de contexto | 256 000 tokens |
| Tipos de cuantizacion | IQ3_M (cuantizacion de 3 bits, probablemente GGUF) |
| Idiomas soportados | Más de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (inferido del nombre IQ3_M; no confirmado explicitamente) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-26B-A4B-it` emplea una arquitectura transformer con mezcla de expertos (MoE). En esta configuración, solo 4 000 millones de parámetros se activan por token, lo que reduce el coste computacional en inferencia en comparación con un modelo denso de 26B. El modelo fue entrenado por Google DeepMind con un enfoque multimodal, procesando texto e imágenes, y con un énfasis en tareas de razonamiento, codificación y generación de texto. Se desconoce el número exacto de tokens de entrenamiento y la composición detallada del dataset, así como si se aplicaron técnicas de RLHF o DPO.

La cuantización QAT (Quantization-Aware Training) implica que el proceso de reducción de precisión se integró durante el entrenamiento o fine-tuning, lo que suele mitigar la degradación de rendimiento frente a una cuantización post-entrenamiento estándar. El formato IQ3_M es una variante de cuantización de 3 bits utilizada en el ecosistema GGUF, diseñada para equilibrar tamaño y calidad. No se dispone de información adicional sobre el proceso específico aplicado por seto-kaiba.

## Capacidades

- Generación de texto: produce respuestas coherentes y contextualizadas en múltiples idiomas.
- Razonamiento: capacidad para resolver problemas lógicos y de sentido común, heredada del modelo base.
- Codificación: genera y depura código en diversos lenguajes de programación.
- Matemáticas: resuelve problemas aritméticos y algebraicos de nivel variado.
- Multimodal: acepta entrada de imágenes y texto, generando descripciones o respuestas basadas en ambas modalidades (capacidad del modelo base, sujeta a la cuantización).
- Tool calling y function calling: soporte para invocar herramientas externas, útil en flujos de agentes.
- Multilingüe: cobertura en más de 140 idiomas, con especial solvencia en inglés y español.
- Contexto largo: ventana de 256K tokens, adecuada para documentos extensos o conversaciones multi-turno.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto prolongado gracias a su ventana de 256K tokens, manteniendo el hilo de la conversación y resolviendo consultas en varios idiomas.
- Generación de código en producción: con soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar, revisar o documentar código, reduciendo la intervención manual.
- Análisis de documentos extensos: su contexto de 256K permite procesar informes, contratos o artículos científicos completos, extrayendo resúmenes o respondiendo preguntas específicas.
- Asistente de razonamiento multimodal: al aceptar imágenes, puede describir diagramas, capturas de pantalla o gráficos, y razonar sobre su contenido, útil en soporte técnico o educación.
- Chatbot multilingüe: su soporte en más de 140 idiomas lo hace apto para plataformas globales de mensajería o foros, con respuestas coherentes en la lengua del usuario.
- Prototipado de agentes autónomos: su capacidad de function calling y razonamiento multi-step permite construir agentes que planifican y ejecutan tareas complejas, como reservas o búsquedas web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización en la información disponible. El modelo base `google/gemma-4-26B-A4B-it` cuenta con métricas oficiales de Google DeepMind, pero no se incluyen en los datos proporcionados. Se recomienda consultar la documentación oficial del modelo base para obtener cifras de MMLU, HumanEval, GSM8K u otros, y tener en cuenta que la cuantización IQ3_M puede introducir una degradación típica de 1-3 puntos porcentuales en tareas estándar, aunque no hay datos confirmados.

## Requisitos de hardware

- VRAM estimada: con cuantización IQ3_M (aproximadamente 3.5 bits por peso), los 26B parámetros ocupan unos 11-12 GB en memoria. Añadiendo overhead de activaciones y contexto, se estima un consumo total de 14-16 GB para inferencia con contexto moderado.
- GPU recomendadas: tarjetas con 16 GB de VRAM o más, como RTX 4080, RTX 4090, A100 40GB, o H100. En GPUs de 12 GB (RTX 3060, RTX 4070) podría ejecutarse con contexto reducido o usando offloading a CPU.
- Compatibilidad con consumer GPU: sí, es viable en GPUs de gama alta para consumidores, gracias a la cuantización y al bajo número de parámetros activos.
- Opciones de despliegue: al ser un formato GGUF, es compatible con llama.cpp, Ollama, LM Studio y servidores como vLLM (con adaptadores GGUF) o TGI.
- Latencia y throughput: no se dispone de datos medidos para esta cuantización. Como referencia, un MoE con 4B activos suele generar entre 20 y 50 tokens por segundo en una RTX 4090, dependiendo del contexto y la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma 4 26B A4B IT (base) | 26B totales, 4B activos | 256K | Apache 2.0 | safetensors | Modelo original, mayor precisión |
| seto-kaiba/Gemma-4-26B-A4B-IT-QAT-IQ3_M | 26B totales, 4B activos | 256K | Apache 2.0 | GGUF (IQ3_M) | Cuantización para menor VRAM |
| Llama 3.1 8B Instruct | 8B densos | 128K | Llama 3.1 License | GGUF, safetensors | Menor capacidad, pero más ligero |
| Mixtral 8x7B | 46.7B totales, 12.9B activos | 32K | Apache 2.0 | GGUF, safetensors | MoE con más parámetros activos, contexto menor |

La comparativa se basa en características generales; no se dispone de benchmarks comparativos directos para esta cuantización.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base puede reflejar sesgos presentes en sus datos de entrenamiento, como estereotipos de género, raza o cultura. La cuantización no corrige estos sesgos.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en contextos largos o con preguntas ambiguas.
- Limitaciones de contexto: aunque la ventana es de 256K tokens, el uso de cuantización de 3 bits puede degradar la coherencia en tramos muy largos; se recomienda validar en casos reales.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base cumple con las políticas de Google (aunque Apache 2.0 es permisiva, Google puede tener términos adicionales).
- Caveat de producción: la cuantización IQ3_M puede introducir errores en tareas de precisión (matemáticas avanzadas, código complejo). Se recomienda evaluar con datos propios antes de desplegar en entornos críticos.
- Soporte de visión: la cuantización puede afectar la calidad de la comprensión de imágenes; no se han realizado pruebas específicas.

## Enlaces

- Modelo cuantizado: https://huggingface.co/seto-kaiba/Gemma-4-26B-A4B-IT-QAT-IQ3_M
- Modelo base (Google): https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo base sin instrucciones: https://huggingface.co/google/gemma-4-26B-A4B
- Página oficial de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Documentación de Gemma 4 en Google Cloud: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
