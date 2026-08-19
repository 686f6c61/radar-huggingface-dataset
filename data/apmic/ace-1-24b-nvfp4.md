# APMIC/ACE-1-24B-NVFP4

## Resumen

ACE-1-24B es un modelo de razonamiento en chino tradicional desarrollado por APMIC, una empresa taiwanesa especializada en soluciones de IA empresarial. El modelo se basa en la arquitectura Mistral de 24B parámetros (presumiblemente Mistral-Small-24B-Instruct) y ha sido afinado específicamente para tareas de razonamiento lógico-matemático, razonamiento cotidiano y uso de herramientas, todo ello en chino tradicional. Su ventana de contexto de 65K tokens lo hace especialmente adecuado para aplicaciones empresariales que requieren procesar documentos extensos o mantener conversaciones multi-turno con historial largo.

La versión NVFP4 del modelo incorpora cuantización de 4 bits de NVIDIA (FP4), lo que permite un despliegue más eficiente en hardware compatible con esta tecnología, reduciendo los requisitos de memoria y acelerando la inferencia. El modelo ha superado la evaluación Trustworthy AI del AIEC (Artificial Intelligence Evaluation Center) del Ministerio de Asuntos Digitales de Taiwán, y según su fabricante ocupa el quinto puesto en el ranking AIEC y el primero entre los modelos de código abierto evaluados, aunque no se han publicado los resultados numéricos de dicha evaluación.

El acceso al modelo está restringido (gated) en HuggingFace y requiere aceptar los términos de la licencia propietaria de APMIC, lo que limita su uso a quienes cumplan las condiciones establecidas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Mistral 24B) |
| Parametros totales | 24B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65K tokens |
| Tipos de cuantizacion | NVFP4 (FP4 de NVIDIA, 4 bits) |
| Idiomas soportados | Chino tradicional (zh), ingles (en) |
| Licencia | apmic-license (propietaria, con restricciones) |
| Formato de pesos | safetensors (con cuantizacion FP4) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Mistral de 24B parámetros, que es un transformer decoder con atención causal estándar y mecanismos de atención por ventanas deslizantes (sliding window attention) en capas intermedias, aunque no se especifica si esta versión conserva dicha configuración. APMIC ha afinado el modelo sobre tres conjuntos de datos en chino tradicional: uno de lógica matemática, otro de razonamiento cotidiano y un tercero de instrucciones para uso de herramientas. El entrenamiento incorpora soporte para Chain of Thought (CoT), lo que permite al modelo razonar paso a paso antes de emitir una respuesta final.

La cuantización NVFP4 es una técnica de compresión de 4 bits desarrollada por NVIDIA que reduce el tamaño del modelo a aproximadamente una octava parte del original en FP16, manteniendo una degradación de calidad mínima. Esta cuantización está optimizada para las GPUs de la serie Blackwell y Hopper con soporte nativo para FP4. No se han publicado detalles sobre el número de tokens de entrenamiento, el proceso de alineación (RLHF, DPO, etc.) ni la composición exacta de los datasets.

## Capacidades

- Razonamiento lógico-matemático en chino tradicional, incluyendo problemas aritméticos, algebraicos y de lógica formal.
- Razonamiento cotidiano: comprensión de situaciones comunes, inferencias causales y resolución de problemas prácticos.
- Soporte de Chain of Thought (CoT) para tareas que requieren pasos de razonamiento intermedios.
- Tool calling: el modelo ha sido entrenado con instrucciones de herramientas, lo que le permite invocar funciones externas en flujos de agente.
- Generación de texto en chino tradicional e inglés, con mayor competencia en el primero.
- Ventana de contexto de 65K tokens, adecuada para procesar documentos largos o mantener conversaciones extensas.
- Capacidad de despliegue en entornos locales (on-premise) gracias a la cuantización FP4, según indica APMIC.

## Casos de uso

- Atención al cliente en chino tradicional: el modelo puede gestionar conversaciones multi-turno con contexto largo (65K tokens) y mantener el historial completo de la interacción, reduciendo la necesidad de resumir o truncar mensajes previos. Su entrenamiento en razonamiento cotidiano le permite comprender consultas ambiguas y ofrecer respuestas coherentes.
- Análisis de documentos legales y contractuales en chino tradicional: la ventana de 65K permite procesar contratos extensos o expedientes completos de una sola vez, extrayendo cláusulas relevantes y razonando sobre implicaciones legales con apoyo del modo CoT.
- Asistencia en programación con tool calling: el modelo puede integrarse en entornos de desarrollo como un agente que invoca funciones de análisis de código, ejecución de pruebas o búsqueda de documentación, gracias a su entrenamiento específico en instrucciones de herramientas.
- Automatización de procesos empresariales: en tareas como clasificación de tickets, extracción de datos de formularios o generación de informes en chino tradicional, el modelo puede razonar sobre la información y producir salidas estructuradas.
- Educación y tutoría: su capacidad de razonamiento paso a paso (CoT) lo hace útil para explicar problemas matemáticos o lógicos a estudiantes, mostrando el proceso de resolución en lugar de solo el resultado final.
- Despliegue en entornos con requisitos de soberanía de datos: al poder ejecutarse localmente con cuantización FP4, es adecuado para organizaciones que necesitan mantener los datos dentro de sus infraestructuras, como gobiernos o empresas reguladas.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. APMIC indica que el modelo superó la evaluación Trustworthy AI del AIEC y obtuvo el quinto puesto en el ranking general y el primero entre los modelos de código abierto evaluados, pero no se proporcionan las puntuaciones concretas ni los benchmarks específicos utilizados. Tampoco hay datos comparativos con otros modelos en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización FP4 de 4 bits, los 24B parámetros requieren aproximadamente 12 GB para los pesos, más overhead de activaciones y KV cache. Se estima un consumo total de 14-16 GB en FP4, y de 24-28 GB en FP8 o FP16. Estas cifras son estimaciones basadas en el tamaño del modelo y no han sido confirmadas por APMIC.
- GPU recomendadas: para FP4, GPUs NVIDIA con soporte nativo de FP4 como las series Blackwell (B200, B100) o Hopper (H100, H200) ofrecen el mejor rendimiento. En GPUs consumer como RTX 4090 (24 GB) o RTX 4080 (16 GB) podría ejecutarse en FP4, aunque con menor throughput.
- Opciones de despliegue: no se especifican en la documentación oficial, pero al tratarse de un modelo basado en Mistral, es compatible con frameworks estándar como vLLM, TGI, llama.cpp u Ollama, siempre que soporten cuantización FP4 (actualmente limitada a hardware NVIDIA reciente).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo comparte base arquitectónica con Mistral-Small-24B-Instruct, pero los datos de rendimiento específicos de ACE-1-24B no han sido publicados. Alternativas en el mismo rango de parámetros (20-30B) incluyen Qwen2.5-24B-Instruct, Gemma-2-27B o Yi-1.5-24B, pero sin resultados de benchmarks no es posible establecer una comparación objetiva. Se indica "no disponible" para este apartado.

## Limitaciones y advertencias

- Licencia propietaria: la licencia apmic-license no es open source estándar y puede imponer restricciones al uso comercial, la redistribución o la modificación del modelo. Es imprescindible revisar los términos completos antes de cualquier uso en producción.
- Acceso restringido: el modelo está marcado como gated en HuggingFace, por lo que se requiere solicitar acceso y aceptar las condiciones del fabricante.
- Enfoque en chino tradicional: aunque el modelo soporta inglés, su entrenamiento está fuertemente orientado al chino tradicional, por lo que el rendimiento en inglés puede ser inferior al de modelos generalistas de tamaño similar.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información plausible pero incorrecta, especialmente en dominios especializados o con datos poco representados en su entrenamiento.
- Sin información sobre sesgos: no se han publicado estudios de sesgos ni evaluaciones de equidad, lo que supone un riesgo para aplicaciones sensibles.
- Dependencia de hardware NVIDIA para FP4: la cuantización NVFP4 requiere GPUs NVIDIA con soporte FP4 nativo, lo que limita el despliegue en hardware de otros fabricantes o en GPUs más antiguas.
- Documentación limitada: no se han publicado detalles sobre el proceso de entrenamiento, el dataset exacto ni los resultados de evaluación, lo que dificulta la reproducibilidad y la evaluación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/APMIC/ACE-1-24B-NVFP4
- Página oficial de ACE-1-24B (inglés): https://www.apmic.ai/en/ace
- Página oficial de ACE-1-24B (chino tradicional): https://www.apmic.ai/ace
- Noticia sobre la certificación AIEC: https://www.apmic.ai/en/news/ace-1-24b-get-aiec
