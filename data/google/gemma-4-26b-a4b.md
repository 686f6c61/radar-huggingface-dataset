# google/gemma-4-26B-A4B

## Resumen

Gemma 4 26B A4B es un modelo de lenguaje multimodal de codigo abierto desarrollado por Google DeepMind, presentado en marzo de 2026 como parte de la familia Gemma 4. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 25.2B parametros totales y solo 3.8B activos por token, lo que permite un rendimiento comparable a modelos densos mucho mayores con un coste de inferencia significativamente menor. El modelo procesa entradas de texto e imagen y genera texto, con soporte nativo para function calling y un contexto de hasta 256K tokens.

La relevancia de este modelo radica en su combinacion de eficiencia y capacidad: al activar solo una fraccion de sus parametros, ofrece una latencia reducida y un consumo de memoria inferior al de un modelo denso de tamano equivalente, manteniendo un alto rendimiento en tareas de razonamiento, codificacion y comprension multimodal. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su soporte para mas de 140 idiomas lo convierte en una opcion atractiva para despliegues internacionales. Incluye ademas un modelo draft dedicado para decodificacion especulativa, lo que acelera la inferencia sin perdida de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida (sliding window + global) |
| Parametros totales | 25.2B (26.544.131.376 en safetensors) |
| Parametros activos | 3.8B |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Mas de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 30 capas, 128 expertos totales, 8 activos por token y 1 experto compartido. La atencion es hibrida: intercala ventanas deslizantes locales de 1024 tokens con capas de atencion global completa, garantizando que la ultima capa sea siempre global. Para optimizar la memoria en contextos largos, las capas globales utilizan Keys y Values unificados y aplican Proportional RoPE (p-RoPE). El vocabulario tiene un tamano de 262K tokens.

En cuanto a los datos de entrenamiento, la informacion disponible no especifica el numero total de tokens ni la composicion del dataset. El modelo incorpora un encoder de vision de aproximadamente 550M parametros para procesar imagenes antes de pasarlas al LLM. Todas las variantes de Gemma 4 incluyen un modelo draft dedicado para decodificacion especulativa, lo que permite una inferencia mas rapida sin degradacion de la calidad. El modelo soporta de forma nativa el rol de sistema (`system` role) para conversaciones mas estructuradas y controlables.

## Capacidades

- Generacion de texto multimodal: procesa entradas de texto e imagen y genera texto, con soporte de resolucion y aspect ratio variables.
- Razonamiento configurable: incluye modos de pensamiento (thinking modes) ajustables segun la tarea.
- Function calling nativo: soporte integrado para tool calling, lo que permite construir agentes autonomos.
- Codificacion avanzada: mejoras notables en benchmarks de codigo, disenado para tareas de programacion complejas.
- Comprension de contexto largo: ventana de 256K tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Multilingue: soporte para mas de 140 idiomas.
- Decodificacion especulativa: incluye un modelo draft dedicado que acelera la inferencia sin perdida de calidad.
- Soporte nativo del rol de sistema: permite conversaciones estructuradas con instrucciones de sistema persistentes.

## Casos de uso

- Atencion al cliente automatizada: con 256K tokens de contexto y soporte multilingue, el modelo puede gestionar conversaciones largas y complejas con clientes en decenas de idiomas, manteniendo el historial completo de la interaccion.
- Agentes autonomos con tool calling: su function calling nativo permite integrarlo en pipelines de automatizacion donde debe decidir que herramientas invocar, como APIs de pago, bases de datos o servicios externos.
- Analisis de documentos extensos: la ventana de 256K tokens permite procesar libros completos, expedientes legales o informes tecnicos largos en una sola pasada, extrayendo informacion y resumiendo contenido.
- Generacion de codigo en produccion: su rendimiento en benchmarks de codigo y el soporte de tool calling lo hacen adecuado para integrarse en entornos de desarrollo, generando codigo, documentacion y tests.
- Comprension de imagenes y documentos escaneados: al aceptar entradas de imagen, puede extraer texto de capturas, analizar diagramas o interpretar formularios escaneados, combinando vision y lenguaje.
- Asistentes de razonamiento para investigacion: su modo de pensamiento configurable y su capacidad de razonamiento lo hacen util para tareas de analisis cientifico, revision de literatura y sintesis de informacion compleja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo MoE de 25B parametros totales con 3.8B activos suele requerir entre 16 y 24 GB de VRAM en cuantizacion de 8 bits, pero este dato no esta confirmado.
- GPU recomendadas: no disponible. El modelo esta orientado a GPUs de consumo y estaciones de trabajo, segun la documentacion oficial.
- Compatibilidad con GPU de consumo: la documentacion indica que los modelos de 12B, 26B A4B y 31B estan disenados para GPUs de consumo y workstations, aunque no se especifican modelos concretos.
- Opciones de despliegue: compatible con la libreria transformers de Hugging Face. No se mencionan vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponible. La decodificacion especulativa integrada deberia reducir la latencia, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de informacion suficiente en los materiales proporcionados para establecer una comparativa fiable con otros modelos de la misma categoria. Los datos de benchmarks y rendimiento relativo no estan publicados en las fuentes consultadas.

## Limitaciones y advertencias

- La informacion sobre sesgos conocidos no esta disponible en la documentacion consultada.
- No se han publicado datos sobre tasas de alucinacion o fiabilidad factual.
- El modelo no soporta audio de forma nativa (a diferencia de las variantes E2B, E4B y 12B), solo texto e imagen.
- Aunque la licencia Apache 2.0 permite uso comercial, se recomienda revisar los terminos especificos de la licencia Gemma 4 en el enlace oficial.
- No se especifican los requisitos minimos de hardware, por lo que el despliegue en entornos de produccion requiere pruebas previas de rendimiento y memoria.
- El modelo tiene un tamano de repositorio de 204.9 GB, lo que implica requisitos de almacenamiento considerables.

## Enlaces

- [Hugging Face: google/gemma-4-26B-A4B](https://huggingface.co/google/gemma-4-26B-A4B)
- [Coleccion Gemma 4 en Hugging Face](https://huggingface.co/collections/google/gemma-4)
- [GitHub de Google Gemma](https://github.com/google-gemma)
- [Blog de lanzamiento](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/)
- [Documentacion oficial](https://ai.google.dev/gemma/docs/core)
- [Technical Report en arXiv](https://arxiv.org/abs/2607.02770)
- [Pagina de Gemma 4 en Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Model card de Gemma 4](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Licencia Gemma 4](https://ai.google.dev/gemma/docs/gemma_4_license)
