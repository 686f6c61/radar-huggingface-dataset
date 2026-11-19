# sayzly/whisper-large-gguf

## Resumen

Whisper Large GGUF es una conversión al formato GGUF del modelo Whisper Large v1 de OpenAI, publicada por el usuario sayzly. Se trata de un modelo de reconocimiento automático del habla (ASR) basado en la arquitectura transformer encoder-decoder de Whisper, con 1.543 millones de parámetros y entrenado originalmente por OpenAI para transcripción multilingüe y traducción de voz a texto. Esta versión concreta no introduce cambios en los pesos ni en el entrenamiento: es un empaquetado del checkpoint original en cuantización Q8_0 (8 bits) para su uso con motores de inferencia compatibles con GGUF, como whisper.cpp.

El interés de esta publicación es puramente práctico: facilita el despliegue de Whisper Large en entornos donde no se dispone de PyTorch o donde se prefiere un binario ligero con pesos cuantizados. El repositorio ocupa 1,7 GB y contiene el fichero `whisper-large-Q8_0.gguf`. No hay información sobre idiomas soportados en la model card, aunque al derivar de Whisper Large v1 hereda el soporte multilingüe del modelo original (aproximadamente 99 idiomas).

La relevancia es limitada: se trata de un artefacto de conveniencia sin métricas propias, sin documentación técnica adicional y con cero descargas en el momento de la consulta. Resulta útil únicamente como atajo para obtener Whisper Large en GGUF, no como un modelo con mejoras o ajustes respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 1.543.321.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s en Whisper Large v1) |
| Tipos de cuantizacion | Q8_0 (8 bits) |
| Idiomas soportados | no disponible en la model card (heredados de openai/whisper-large) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del repositorio | 1,7 GB |
| Modelo base | openai/whisper-large |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper Large v1 de OpenAI: un transformer encoder-decoder entrenado con aprendizaje supervisado sobre pares audio-transcripción a gran escala, con una entrada de audio segmentada en ventanas de 30 segundos convertidas a espectrogramas mel. El modelo original se entrenó con datos multilingües y multitarea (transcripción, traducción al inglés y detección de idioma). Esta publicación no aporta información sobre el dataset, el número de tokens de audio, ni sobre si hubo etapas de RLHF o ajuste fino; simplemente redistribuye los pesos originales.

La única modificación respecto al checkpoint de OpenAI es la cuantización a Q8_0 y el empaquetado en GGUF, un formato pensado para inferencia eficiente en CPU y GPU con motores como whisper.cpp. No se documentan innovaciones técnicas adicionales, ni procesos de decodificación especulativa, ni cambios en la atención. La model card es mínima y se limita a indicar el fichero incluido y la licencia heredada.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) sobre segmentos de hasta 30 segundos.
- Traducción de voz a texto en inglés (capacidad multitarea heredada de Whisper Large v1).
- Detección automática del idioma de entrada (heredada del modelo original).
- Soporte multilingüe heredado de openai/whisper-large (la model card no detalla la lista de idiomas).
- Inferencia en CPU y GPU mediante motores compatibles con GGUF (whisper.cpp y similares).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; no son capacidades propias de un modelo ASR.
- No se documentan modos de pensamiento, visión ni audio generativo más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo convierte grabaciones de hasta 30 segundos por segmento en texto, adecuado para actas automáticas y resúmenes posteriores con otro modelo de lenguaje.
- Subtitulado automático de vídeo: se puede integrar en un pipeline que extrae audio, lo segmenta y genera subtítulos con marcas temporales, usando whisper.cpp sobre el fichero GGUF.
- Despliegue en entornos sin PyTorch: al estar en GGUF, permite ejecutar Whisper Large en servidores ligeros o contenedores mínimos donde instalar el stack de Hugging Face sería costoso.
- Transcripción en CPU para privacidad: al poder ejecutarse con whisper.cpp en CPU, encaja en escenarios donde el audio no debe salir del equipo (por ejemplo, entornos sanitarios o legales).
- Traducción de audio a inglés: para contenido en otros idiomas que necesite un borrador en inglés antes de una revisión humana.
- Archivado y búsqueda de audio: transcripción masiva de grabaciones históricas para indexarlas y permitir búsqueda por texto.
- Prototipado rápido de aplicaciones ASR: al ser un único fichero de 1,7 GB, simplifica la distribución y las pruebas iniciales frente al checkpoint original en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con cuantización Q8_0 y 1,54 mil millones de parámetros, el fichero pesa 1,7 GB, por lo que la huella de memoria ronda ese orden de magnitud más el overhead del motor.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU con al menos 4 GB de VRAM debería poder alojar los pesos cuantizados, aunque no se documenta compatibilidad concreta.
- GPU de consumo: previsiblemente cabe en tarjetas de consumo con 4 GB o más de VRAM, aunque no hay confirmación del autor.
- Opciones de despliegue: whisper.cpp (formato GGUF); no se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sayzly/whisper-large-gguf | 1.543 M | ventana de 30 s (heredada) | GGUF (Q8_0) | Apache 2.0 | Hugging Face, 0 descargas |
| openai/whisper-large | 1.550 M aprox. | ventana de 30 s | safetensors / PyTorch | Apache 2.0 | Hugging Face, oficial |
| openai/whisper-large-v2 | 1.550 M aprox. | ventana de 30 s | safetensors / PyTorch | Apache 2.0 | Hugging Face, oficial |
| openai/whisper-large-v3 | 1.550 M aprox. | ventana de 30 s | safetensors / PyTorch | Apache 2.0 | Hugging Face, oficial |

La comparativa se limita a variantes de la misma familia porque no se dispone de datos de rendimiento de esta conversión concreta. Frente al checkpoint original, la diferencia principal es el formato GGUF y la cuantización Q8_0, que reducen el tamaño y facilitan la inferencia en CPU, a costa de una posible pérdida mínima de precisión no documentada. Frente a whisper-large-v2 y v3, esta publicación se basa en la versión v1, por lo que no incorpora las mejoras de entrenamiento de las versiones posteriores.

## Limitaciones y advertencias

- Es una conversión no oficial: el autor no es OpenAI y no se documenta el proceso de cuantización ni validación de la misma.
- Cero descargas y cero likes en el momento de la consulta; sin evidencia de uso ni de calidad verificada por la comunidad.
- La model card es mínima y no detalla idiomas, dataset, ni métricas; cualquier evaluación de calidad debe hacerse contra el modelo original.
- La cuantización Q8_0 puede introducir degradación menor en la precisión de transcripción, no medida por el autor.
- Whisper Large v1 tiene limitaciones conocidas del modelo original: alucinaciones en audio con ruido o silencios largos, errores en nombres propios y términos técnicos, y sesgos derivados de los datos de entrenamiento de OpenAI.
- Ventana de audio limitada a 30 segundos por segmento, lo que obliga a segmentar grabaciones largas.
- Licencia Apache 2.0 heredada, que permite uso comercial, pero sin garantías del publicador de esta conversión.
- No hay soporte documentado para tool calling ni agentes; no debe emplearse como sustituto de un modelo de lenguaje conversacional.
- Riesgo de que el repositorio no se mantenga actualizado o desaparezca, al ser un artefacto de un usuario individual.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sayzly/whisper-large-gguf
- Modelo original: https://huggingface.co/openai/whisper-large
- Repositorio de whisper.cpp (motor compatible con GGUF): https://github.com/ggerganov/whisper.cpp
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
