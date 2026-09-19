# MahmoudIbrahim/Qwen3-TTS-12Hz-0.6B-ar

## Resumen

Qwen3-TTS-12Hz-0.6B-ar es un checkpoint de síntesis de voz (text-to-speech) publicado por el usuario MahmoudIbrahim en Hugging Face, derivado de la familia Qwen3-TTS de Alibaba Qwen. Se trata de un modelo de generación de audio con arquitectura de lenguaje discreta multi-codebook, construido sobre el tokenizador acústico Qwen3-TTS-Tokenizer-12Hz, que comprime la señal de audio a una tasa de 12 Hz y modela simultáneamente información semántica y acústica. El repositorio contiene 914.643.008 parámetros reales (unos 0,91 mil millones) en formato safetensors, con un tamaño total de 6,2 GB y licencia Apache 2.0.

El modelo resuelve generación de voz multilingüe con clonación de voz a partir de una muestra de audio de referencia de 3 segundos (voice cloning zero-shot) y control por descripción en lenguaje natural. La familia Qwen3-TTS se entrenó con más de 5 millones de horas de audio en 10 idiomas (chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano) y ofrece generación en streaming con latencia extremo a extremo de hasta 97 ms, lo que lo sitúa en el rango de aplicaciones interactivas en tiempo real.

Es relevante ahora porque combina tres factores poco frecuentes en TTS abierto: clonación de voz con solo 3 segundos de referencia, control acústico mediante instrucciones en lenguaje natural y un coste de inferencia bajo (menos de mil millones de parámetros). Conviene señalar una discrepancia no resuelta: el identificador del repositorio incluye el sufijo "-ar" (habitualmente asociado al árabe), pero ni la model card ni las etiquetas de idioma declaran soporte de árabe, por lo que la naturaleza exacta de la adaptación no está documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreta multi-codebook sobre transformer, con tokenizer acustico Qwen3-TTS-Tokenizer-12Hz |
| Parametros totales | 914.643.008 (aproximadamente 0,91 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | zh, en, ja, ko, de, fr, ru, pt, es, it (10 idiomas declarados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,2 GB |
| Pipeline | text-to-speech |
| Latencia declarada | 97 ms extremo a extremo en generacion streaming |
| Fecha de creacion | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es una LM discreta multi-codebook que opera sobre tokens acústicos producidos por el tokenizer propio Qwen3-TTS-Tokenizer-12Hz. Este tokenizer realiza compresión acústica eficiente a 12 Hz de frecuencia de trama y modelado semántico de alta dimensión, de modo que el modelo de lenguaje genera directamente el flujo de códigos de audio y reconstruye la forma de onda final. El planteamiento es end-to-end: no hay una etapa separada de vocoder neuronal declarada en la documentación, sino un modelado completo de la información de voz dentro del bucle autoregresivo multi-codebook. El checkpoint aquí descrito es la variante Base de 0,6B (denominación comercial) con capacidad de clonación rápida de voz.

En cuanto a datos de entrenamiento, la model card indica más de 5 millones de horas de audio repartidas entre 10 idiomas y perfiles dialectales adicionales. No se especifica la composición exacta del dataset, la proporción por idioma, el número de tokens de entrenamiento, ni si hubo etapas de RLHF, DPO o ajuste por preferencias humanas. Tampoco se documenta el proceso concreto de fine-tuning que habría dado lugar a este checkpoint con sufijo "-ar". La innovación técnica destacable es doble: la representación acústica de 12 Hz, que reduce drásticamente la longitud de secuencia frente a tokenizadores de mayor tasa, y el control de atributos acústicos multidimensionales mediante instrucciones en lenguaje natural, además de la síntesis en streaming de baja latencia.

## Capacidades

- Síntesis de voz multilingüe en 10 idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano.
- Clonación de voz zero-shot a partir de una muestra de audio de referencia de 3 segundos, con texto de referencia opcional para alinear contenido y hablante.
- Generación en streaming con latencia extremo a extremo declarada de 97 ms, apta para diálogo interactivo.
- Control por descripción en lenguaje natural de atributos acústicos (estilo, emoción, ritmo u otras dimensiones), según la documentación de la familia.
- Manejo de texto de entrada complejo: el ejemplo oficial incluye fórmulas matemáticas, signos de puntuación especiales, guiones largos, símbolos Unicode y emoticonos, lo que indica cierta robustez en normalización de texto.
- Perfiles de voz dialectales adicionales más allá de los 10 idiomas principales.
- Integración con `flash-attention-2` para acelerar la atención durante la inferencia.
- Soporte de tool calling / function calling: no aplica (es un modelo de audio, no un LLM conversacional).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades de código, matemáticas o visión: no disponibles; el modelo no procesa imágenes ni resuelve tareas de razonamiento simbólico.

## Casos de uso

- Doblaje y localización de contenido audiovisual: dado que cubre 10 idiomas y clona una voz de referencia de 3 segundos, permite doblar una serie o curso manteniendo la identidad vocal del actor original en cada idioma, con el texto de referencia como ancla para la prosodia.
- Asistentes de voz en tiempo real: la latencia de 97 ms en streaming hace viable integrarlo en agentes conversacionales, IVR telefónico o interfaces de manos libres donde la respuesta hablada debe comenzar antes de que el usuario termine de percibir la pausa.
- Audiolibros y prensa hablada: con clonación de la voz del autor o del locutor, se puede generar narración de textos largos de forma consistente y controlar el estilo mediante instrucciones en lenguaje natural (tono neutro, dramático, infantil).
- Accesibilidad y lectores de pantalla: conversión de documentos, artículos y notificaciones a voz en el idioma del usuario, con voces personalizadas que reducen la fatiga de escucha en uso prolongado.
- Videojuegos y experiencias interactivas: generación dinámica de diálogos de PNJ en varios idiomas sin grabar cada línea, aprovechando el streaming para responder a eventos del juego en tiempo real.
- E-learning y formación corporativa: producción de cursos multilingües con una única voz corporativa clonada, controlando el ritmo y el énfasis por instrucción para adaptar el material a distintos niveles.
- Atención al cliente automatizada: respuestas habladas personalizadas con la voz de marca, integradas en pipelines de contact center que necesiten baja latencia y coherencia de identidad sonora.
- Producción de pódcast y contenido sintético: generación de episodios o inserts con voz clonada, incluyendo texto con símbolos y notación técnica (el ejemplo oficial sintetiza la fórmula resolvente de la ecuación de segundo grado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara métricas de latencia (97 ms extremo a extremo en streaming) y de escala de entrenamiento (más de 5 millones de horas de audio, 10 idiomas), sin tablas comparativas de WER, MOS, similitud de hablante (SECS) ni tasas de error en clonación.

## Requisitos de hardware

- VRAM estimada para inferencia: con 914.643.008 parámetros, los pesos en bfloat16 ocupan aproximadamente 1,8 GB. Añadiendo el tokenizer acústico, los buffers de atención y el decodificado de audio, una estimación razonable se sitúa en el rango de 3 a 5 GB de VRAM, aunque no hay cifras oficiales publicadas.
- GPU recomendadas: no hay una lista oficial. Por tamaño, cualquier GPU con 8 GB o más debería acomodar el modelo en bfloat16; para despliegues con muchas peticiones concurrentes tienen sentido A100 o H100, pero es una extrapolación, no un dato del repositorio.
- GPUs de consumo: sí cabe en tarjetas de consumo. Modelos con 8-12 GB como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090 deberían ser suficientes para inferencia en bfloat16. El tamaño del repositorio (6,2 GB) sugiere que los pesos ocupan más de lo que indicaría el recuento de parámetros en bf16, probablemente por incluir componentes adicionales del tokenizer.
- Opciones de despliegue: el paquete oficial es `qwen-tts` (`pip install -U qwen-tts`), con carga vía `Qwen3TTSModel.from_pretrained`, `device_map="cuda:0"`, `dtype=torch.bfloat16` y `attn_implementation="flash_attention_2"` como configuración optimizada (`pip install -U flash-attn --no-build-isolation`). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: solo se declara latencia extremo a extremo de 97 ms en generación streaming. No hay datos de throughput, de consumo de memoria en producción ni de rendimiento con lotes concurrentes.

## Comparativa con modelos similares

No se han proporcionado datos comparativos con otros modelos de la misma categoría en la información disponible. La única referencia directa documentada es el checkpoint base del que deriva este repositorio.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-ar (este) | 914.643.008 | no disponible | 10 declarados (sin arabe en las etiquetas) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | no disponible | no disponible | 10 | Apache 2.0 | Hugging Face, repositorio oficial |
| Otras alternativas de TTS abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Riesgo de uso indebido de la clonación de voz: la capacidad de clonar con 3 segundos de audio permite suplantación de identidad, fraudes por voz y generación de contenido no consentido. La licencia Apache 2.0 no impone restricciones de uso, por lo que la responsabilidad legal y ética recae enteramente en quien despliega el modelo.
- Alucinación acústica: como modelo generativo de audio, puede producir artefactos, prosodia incorrecta, pronunciaciones erróneas de términos técnicos o nombres propios, y ruidos en tramos largos o con texto atípico.
- Ambigüedad sobre el sufijo "-ar" del repositorio: no hay documentación que confirme que este checkpoint haya sido adaptado al árabe. Las etiquetas de idioma no incluyen el árabe, de modo que no debe asumirse soporte de esa lengua sin validación empírica.
- Idiomas: los 10 idiomas declarados provienen de la model card del modelo base; no hay evidencia publicada de que este checkpoint concreto conserve el rendimiento en todos ellos.
- Sin benchmarks ni evaluaciones independientes: con 0 descargas y 0 likes, el repositorio no tiene validación por parte de la comunidad. No hay métricas de calidad (MOS, WER, similitud de hablante) que respalden su uso en producción.
- Datos de entrenamiento no auditables: no se especifica la composición del dataset de 5 millones de horas ni el proceso de filtrado, por lo que pueden persistir sesgos de acento, género, edad o registro, y posibles contaminaciones de audio con derechos.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero el autor del repositorio no ofrece garantías ni soporte, y no se especifica la licencia del tokenizer o de componentes auxiliares empaquetados en el repositorio de 6,2 GB.
- Requisitos de cumplimiento normativo: en la Unión Europea, el uso de sistemas de clonación de voz conlleva obligaciones de transparencia (etiquetado de contenido sintético) y posibles obligaciones bajo el AI Act según el caso de uso.
- Falta de documentación de despliegue en servidores de inferencia: al no documentarse vLLM, TGI u opciones similares, el escalado horizontal y el batching concurrente quedan sin ruta clara.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MahmoudIbrahim/Qwen3-TTS-12Hz-0.6B-ar
- Informe tecnico de Qwen3-TTS (arXiv:2601.15621): https://huggingface.co/papers/2601.15621
- Repositorio GitHub oficial de Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Demo oficial en Hugging Face Spaces: https://huggingface.co/spaces/Qwen/Qwen3-TTS
- Checkpoint base de referencia: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los resultados obtenidos correspondian a contenido turistico sin relacion con el ambito de la ficha.
