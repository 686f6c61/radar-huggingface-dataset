# niobures/MOSS-TTSD-v1.0

## Resumen

MOSS-TTSD-v1.0 es un modelo de síntesis de voz (text-to-speech) de la familia MOSS-TTS, desarrollado por MOSI.AI y el equipo OpenMOSS. Está diseñado para generar diálogos conversacionales multi-hablante de larga duración, con clonación de voz zero-shot a partir de referencias cortas y control de turnos. Este modelo es una pieza clave de una familia de cinco modelos complementarios para generación de voz y sonido, orientados a producción y a escenarios complejos como podcasts, audiolibros, doblaje y entretenimiento.

El modelo utiliza la arquitectura MossTTSDelay y cuenta con aproximadamente 8,36 mil millones de parámetros (8.355.492.864). La longitud de contexto no está especificada en la información disponible. Se publica bajo licencia Apache 2.0 y soporta 20 idiomas, incluidos español, inglés, chino, francés, alemán, japonés, ruso y árabe, entre otros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MossTTSDelay |
| Parametros totales | 8.355.492.864 (8,36B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 20: zh, en, de, es, fr, ja, it, he, ko, ru, fa, ar, pl, pt, cs, da, sv, hu, el, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MOSS-TTSD emplea la arquitectura MossTTSDelay, descrita en el artículo "MOSS-Audio-Tokenizer: Scaling Audio Tokenizers for Future Audio Foundation Models" (arXiv:2602.10934). No se han proporcionado detalles sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El modelo se presenta como un modelo de diálogo de larga duración, con continuidad, control de turnos y clonación de voz zero-shot, y forma parte de una familia de cinco modelos que pueden usarse de forma independiente o componerse en un pipeline completo.

## Capacidades

- Generación de voz sintética de alta fidelidad para diálogos multi-hablante.
- Clonación de voz zero-shot a partir de referencias cortas.
- Continuidad de larga duración en audio conversacional, apta para textos extensos.
- Control de turnos en diálogos entre múltiples hablantes.
- Soporte de 20 idiomas y cambio de código (code-switching) entre ellos.
- Diseñado para podcasts, audiolibros, comentarios, doblaje y diálogos de entretenimiento.
- No se mencionan capacidades de tool calling, agentes o razonamiento; es un modelo de texto a voz.

## Casos de uso

- Producción de podcasts: el modelo puede generar conversaciones entre varias voces con control de turnos y mantener la coherencia durante episodios largos, lo que reduce la necesidad de grabar a múltiples locutores.
- Audiolibros: permite narrar textos extensos con una voz clonada estable y expresiva, manteniendo la calidad en sesiones de larga duración.
- Doblaje de contenido audiovisual: puede sustituir voces originales mediante clonación de voz a partir de referencias cortas, facilitando la localización de series, películas o documentales.
- Comentarios deportivos o de videojuegos: es adecuado para generar diálogos dinámicos en tiempo real con estilos cambiantes y voces coherentes a lo largo de la narración.
- Asistentes de voz conversacionales: puede integrarse en sistemas de diálogo donde se requiera contexto largo y respuestas habladas consistentes entre turnos.
- Entretenimiento y role-play: permite crear conversaciones entre personajes ficticios con voces personalizadas, útiles para juegos, narrativa interactiva o contenido de ficción.
- Doblaje y localización multilingüe: gracias a su soporte de 20 idiomas y cambio de código, facilita la producción de contenido en mercados lingüísticos diversos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los pesos en precisión fp16/bf16 ocupan aproximadamente 16,7 GB, según el tamaño del repositorio (8,36B parámetros).
- VRAM estimada para inferencia: al menos 16-20 GB en fp16, aunque puede variar según la implementación y la longitud de la entrada.
- Con cuantización a 4 bits, la VRAM podría reducirse a unos 5-6 GB, y a 8 bits a unos 8-9 GB, pero no hay cuantizaciones oficiales publicadas.
- GPU recomendadas: NVIDIA A100, H100 o RTX 4090 para una inferencia cómoda en fp16.
- En GPUs de consumo, podría ejecutarse en RTX 3090/4090 con cuantización o en baja precisión, aunque no hay datos oficiales de latencia ni throughput.
- Opciones de despliegue: no documentadas oficialmente. Al ser un modelo de Transformers, puede utilizarse con la librería `transformers` en Python. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| MOSS-TTSD-v1.0 | MossTTSDelay | 8,36B | no disponible | 20 | Apache 2.0 |
| MOSS-TTS | MossTTSDelay | 8B | no disponible | 20 | Apache 2.0 |
| MOSS-TTS-Realtime | MossTTSRealtime | 1,7B | no disponible | 20 | Apache 2.0 |

Los tres modelos pertenecen a la misma familia MOSS-TTS y se diferencian principalmente en tamaño y propósito: MOSS-TTS es el modelo base para clonación y narración, MOSS-TTSD se centra en diálogos de larga duración, y MOSS-TTS-Realtime está optimizado para streaming de baja latencia. No se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes, por lo que el rendimiento real en tareas específicas es desconocido.
- El modelo utiliza código personalizado (custom code) en la librería Transformers, lo que puede requerir adaptaciones en entornos de producción.
- La información sobre sesgos, riesgos de alucinación o fallos en la generación de audio no está disponible.
- La longitud de contexto no está especificada, lo que limita la evaluación de su capacidad para mantener diálogos muy largos.
- La licencia Apache 2.0 permite uso comercial, pero debe respetarse la atribución y la cesión de patentes si las hubiera.
- El soporte de idiomas puede variar en calidad; no hay métricas de calidad por idioma en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/niobures/MOSS-TTSD-v1.0
- GitHub del proyecto: https://github.com/OpenMOSS/MOSS-TTS/tree/main
- Paper: https://huggingface.co/papers/2602.10934
- ModelScope: https://modelscope.cn/collections/OpenMOSS-Team/MOSS-TTS
- Blog oficial: https://mosi.cn/#models
- Documentación de API: https://studio.mosi.cn/docs/moss-tts
