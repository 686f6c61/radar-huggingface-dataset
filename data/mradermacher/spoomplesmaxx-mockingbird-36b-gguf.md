# mradermacher/spoomplesmaxx-mockingbird-36B-GGUF

## Resumen

El modelo `mradermacher/spoomplesmaxx-mockingbird-36B-GGUF` es una cuantización en formato GGUF del modelo base `aimeri/spoomplesmaxx-mockingbird-36B`, realizada por el autor mradermacher. Este modelo está orientado a tareas de roleplay y escritura creativa, como indican sus etiquetas, y se distribuye bajo licencia Apache 2.0. Con aproximadamente 36 000 millones de parámetros, se posiciona como una opción de tamaño medio-grande para ejecución local mediante motores de inferencia compatibles con GGUF.

La relevancia de esta ficha reside en que el formato GGUF permite ejecutar modelos de este tamaño en hardware de consumo con cuantización, reduciendo los requisitos de VRAM. El autor proporciona actualmente una única variante cuantizada, Q4_K_S, que ocupa 20,8 GB, lo que la hace viable en tarjetas gráficas con 24 GB de memoria. No se dispone de información adicional sobre el modelo base más allá de su propósito declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 36 151 104 512 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_S (único proporcionado) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base `aimeri/spoomplesmaxx-mockingbird-36B`. No se conocen los detalles del entrenamiento, como el número de tokens, la composición del dataset o si se aplicaron técnicas como RLHF o DPO. La cuantización GGUF realizada por mradermacher es de tipo estático, sin uso de imatrix ni pesos adicionales, según se indica en la model card. El único archivo GGUF proporcionado es la variante Q4_K_S, que es una cuantización de 4 bits con bloques K_S, conocida por ofrecer un equilibrio razonable entre calidad y velocidad.

## Capacidades

- Generación de texto en inglés, orientada a roleplay y escritura creativa.
- Soporte de conversaciones multi-turno, según los tags `conversational` y `roleplay`.
- Capacidad de escritura creativa, incluyendo narrativa y diálogos.
- No se dispone de información sobre tool calling, function calling, razonamiento multi-step, capacidades de visión o audio, ni sobre un modo de pensamiento explícito.
- El modelo es compatible con motores de inferencia GGUF como llama.cpp, Ollama y LM Studio, lo que facilita su despliegue local.

## Casos de uso

- Roleplay interactivo: el modelo puede mantener personajes y tramas en conversaciones largas, gracias a su naturaleza conversacional y su tamaño de 36B, adecuado para generar respuestas coherentes y con matices.
- Escritura creativa asistida: puede ayudar a redactar ficción, guiones o diálogos, proporcionando borradores que el usuario puede refinar.
- Generación de contenido narrativo para juegos: útil para crear historias dinámicas o misiones en juegos de rol de mesa o videojuegos, generando texto inmersivo en inglés.
- Chatbots de entretenimiento: se puede integrar en aplicaciones de chat con personalidad, aprovechando la licencia Apache 2.0 para uso comercial sin restricciones de atribución.
- Prototipado de aplicaciones de IA: al estar en formato GGUF, se puede desplegar localmente en entornos de desarrollo para probar la calidad del texto antes de escalar a modelos más grandes.
- Análisis de narrativa: aunque no está confirmado, su tamaño sugiere que podría usarse para tareas de resumen o análisis de texto en inglés, aunque no hay evidencia de capacidades específicas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo ni para el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_S ocupa 20,8 GB, por lo que se recomienda al menos 24 GB de VRAM para cargar el modelo completo sin fragmentación.
- GPU recomendadas: tarjetas con 24 GB como la NVIDIA RTX 4090 o la A5000 son adecuadas. Para GPUs con menos memoria (16 GB o inferiores), sería necesario descargar una cuantización de menor tamaño, pero solo se proporciona Q4_K_S, por lo que no hay opciones más ligeras disponibles.
- Si cabe en GPU de consumo: sí, en una RTX 4090 o similar con 24 GB de VRAM, aunque la memoria de 24 GB es el límite justo y puede requerir el uso de offloading a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier motor compatible con GGUF. También se puede usar vLLM si se convierte el modelo, pero no es nativo.
- Latencia y throughput: no se dispone de mediciones específicas. En una RTX 4090, un modelo de 36B cuantizado a Q4_K_S podría generar entre 10 y 20 tokens por segundo, pero esto es una estimación general y no un dato confirmado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (roleplay y escritura creativa) con el mismo tamaño. El autor también publica `spoomplesmaxx-v2.1-30B-GGUF`, que es un modelo de 30B parámetros del mismo autor, pero no se tienen datos de rendimiento o arquitectura para comparar directamente. No se puede ofrecer una tabla comparativa sin datos verificables.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos, pero como modelo entrenado en inglés, puede reflejar sesgos culturales del corpus de entrenamiento.
- Riesgo de alucinación: no se han evaluado formalmente, pero todos los modelos de lenguaje pueden generar contenido falso o inventado.
- Limitaciones de contexto: no se conoce la longitud de contexto del modelo base; si es corta, las conversaciones largas pueden degradarse.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero no se conoce si el modelo base tiene restricciones adicionales.
- Caveat de cuantización: la cuantización Q4_K_S puede degradar la calidad del texto en comparación con el modelo original de precisión completa, especialmente en tareas de razonamiento.
- Falta de documentación: la ausencia de información sobre arquitectura y entrenamiento dificulta la evaluación de sus capacidades y riesgos.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/mradermacher/spoomplesmaxx-mockingbird-36B-GGUF
- Modelo base: https://huggingface.co/aimeri/spoomplesmaxx-mockingbird-36B
- Página del autor mradermacher para solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Sitio de descarga alternativa para listas de archivos: https://hf.tst.eu/model#spoomplesmaxx-mockingbird-36B-GGUF
