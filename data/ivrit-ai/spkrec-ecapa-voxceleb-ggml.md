# ivrit-ai/spkrec-ecapa-voxceleb-ggml

## Resumen

`ivrit-ai/spkrec-ecapa-voxceleb-ggml` es una conversión al formato ggml del modelo `speechbrain/spkrec-ecapa-voxceleb`, una red ECAPA-TDNN entrenada para extraer embeddings de locutor (speaker embeddings) empleados en verificación e identificación de hablantes y en diarización. Lo publica ivrit-ai, el proyecto que mantiene herramientas de transcripción y diarización en hebreo, y su propósito es permitir la diarización en dispositivo (on-device) dentro de sus aplicaciones, replicando el comportamiento del paquete Python `ivrit` que ejecuta el modelo en servidor.

No se trata de un modelo generativo ni de un LLM: no produce texto, no razona y no tiene ventana de contexto lingüístico. Es un extractor de características que convierte un fragmento de audio en un vector (embedding) que representa la identidad vocal del hablante; comparando esos vectores por similitud coseno se agrupan segmentos de la misma voz. El modelo base es el ECAPA-TDNN de SpeechBrain (revisión `0f99f2d0ebe89ac095bcc5903c4dd8f72b367286`), del que esta versión solo cambia el layout de pesos y la cuantización, no la arquitectura ni los parámetros entrenados.

Es relevante ahora porque reduce un modelo de reconocimiento de locutor a ficheros de 23 MB (q8_0) y 42 MB (f16) que se pueden ejecutar con la librería ggml en CPU y en dispositivos de borde, sin depender de PyTorch ni de SpeechBrain en tiempo de inferencia. El autor declara que los voice prints de la versión q8_0 mantienen una similitud coseno media de 0,9998 (0,9994 en el peor caso) respecto a SpeechBrain y se agrupan en los mismos hablantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (red convolucional TDNN con atención de canal enfatizada, propagación y agregación) |
| Parametros totales | no disponible (el repo ocupa 0,1 GB; los ficheros de pesos son de 23 MB en q8_0 y 42 MB en f16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de embeddings de audio, no generativo) |
| Tipos de cuantizacion | q8_0 (matrices grandes) con resto en f32/f16; f16 con resto en f32 |
| Idiomas soportados | no disponible (el modelo es independiente del idioma; opera sobre características acústicas) |
| Licencia | Apache-2.0 |
| Formato de pesos | binario propietario ggml con cabecera `IVSP` versión 1 (no safetensors ni GGUF estándar) |

## Arquitectura y entrenamiento

La arquitectura es ECAPA-TDNN, descrita en Desplanques et al. (Interspeech 2020): una red TDNN con bloques de convolución dilatada, atención de canal (SE-Res2Block), propagación y agregación de características multi-escala, seguida de una capa de pooling estadístico con atención y una proyección final que produce el embedding de locutor. El modelo original de SpeechBrain está entrenado sobre VoxCeleb para verificación de hablantes. Esta conversión no reentrena ni modifica los pesos: solo reorganiza el layout y aplica cuantización.

Los cambios respecto al original son de formato: cada convolución con pesos `[out, in, taps]` se almacena como una matriz por tap; cada batch norm se pliega en un scale y un shift a partir de sus estadísticas en modo evaluación; y las matrices grandes se cuantizan a q8_0 con `quantize_row_q8_0_ref` de ggml. Las características de entrada no forman parte del fichero: hay que calcularlas con el Fbank de SpeechBrain tal como lo hace `encode_batch` (80 filtros mel, STFT Hamming de 400 puntos con salto de 160, en decibelios y con normalización por media de la frase). No se documenta en la información disponible ningún proceso de RLHF, DPO ni ajuste fino adicional sobre el modelo base.

## Capacidades

- Extracción de embeddings de locutor a partir de audio, para verificación (misma persona o no) e identificación (qué persona es).
- Diarización de hablantes: agrupar segmentos de una transcripción por identidad vocal mediante similitud coseno entre embeddings.
- Ejecución en dispositivo con ggml, sin dependencia de PyTorch ni de SpeechBrain en inferencia.
- Independencia del contenido lingüístico: al operar sobre características acústicas, no está atado a un idioma concreto.
- Compatibilidad funcional con el pipeline de diarización de ivrit.ai, que usa el mismo modelo base en servidor.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, visión ni audio generativo: no es un modelo de lenguaje.

## Casos de uso

- Diarización de transcripciones en aplicaciones de ivrit.ai: se calculan embeddings por segmento con `ecapa-q8_0.bin` y se agrupan por similitud coseno para etiquetar quién habla en cada tramo de la transcripción, ejecutándose en el propio dispositivo del usuario.
- Verificación de locutor en autenticación por voz: comparar el embedding de una muestra entrante con el voice print registrado del usuario y aceptar o rechazar según un umbral de similitud coseno, con un modelo de 23 MB que cabe en móviles y sistemas embebidos.
- Reuniones y notas de voz con etiquetado de participantes: procesar el audio localmente y separar intervenciones por hablante sin enviar el audio a un servidor, lo que reduce exposición de datos personales.
- Subtitulado y transcripción con atribución de hablante: integrar el extractor en un pipeline ASR + diarización donde el modelo de reconocimiento de voz produce segmentos y este modelo asigna identidades.
- Análisis forense o de archivos de audio: agrupar horas de grabación por locutor para localizar intervenciones de una persona concreta, usando la versión f16 si se prioriza fidelidad sobre tamaño.
- Aplicaciones de borde con recursos limitados: despliegue en Raspberry Pi, dispositivos IoT o navegador vía compilaciones de ggml, donde un modelo de 23-42 MB es viable frente a los cientos de MB de un stack SpeechBrain completo.
- Control de calidad de datasets de voz: detectar segmentos con locutores no previstos o duplicados en corpus de entrenamiento agrupando embeddings y revisando los clústeres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo aportado por el autor es la fidelidad de la conversión: la similitud coseno media entre los voice prints de `ecapa-q8_0.bin` y los de SpeechBrain es de 0,9998, con 0,9994 en el peor caso, y los embeddings se agrupan en los mismos hablantes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los pesos (23 MB en q8_0, 42 MB en f16) el modelo es ejecutable en CPU y en memoria muy reducida.
- GPU recomendadas: no se especifican; al ser un modelo pequeño, cualquier GPU consumer (RTX 4090, RTX 3060, etc.) sería sobredimensionada y el caso natural es CPU o aceleradores de borde.
- Cabe en GPU consumer: sí, con amplio margen; también en dispositivos móviles y embebidos.
- Opciones de despliegue: la librería ggml (https://github.com/ggml-org/ggml) y el paquete `ivrit` para el flujo en servidor; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño de pesos | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ivrit-ai/spkrec-ecapa-voxceleb-ggml | ECAPA-TDNN | 23 MB (q8_0) / 42 MB (f16) | ggml `IVSP` | Apache-2.0 | Conversión para ejecución en dispositivo, fidelidad coseno 0,9998 frente al original |
| speechbrain/spkrec-ecapa-voxceleb | ECAPA-TDNN | no disponible en la información | PyTorch (SpeechBrain) | Apache-2.0 | Modelo base original; requiere stack SpeechBrain/PyTorch |
| Otros extractores de locutor (p. ej. x-vector, ResNet de verificación) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no admite instrucciones; usarlo como tal es un error de categoría.
- El fichero no incluye el cálculo de características: hay que replicar exactamente el Fbank de SpeechBrain (80 mel, STFT Hamming de 400 puntos, salto 160, decibelios, normalización por media de frase) o los embeddings no serán comparables.
- Formato binario propio con cabecera `IVSP`, no GGUF estándar: no es cargable por herramientas que esperan GGUF (llama.cpp, Ollama) sin adaptación.
- El rendimiento de verificación y diarización depende de umbrales de similitud coseno y de la duración y calidad del audio; no se documentan tasas de error (EER) ni curvas DET en la información disponible.
- Riesgo de confusión entre locutores con voces similares, ruido de fondo, solapamientos o segmentos muy cortos; no hay datos publicados sobre robustez en estos escenarios.
- Sesgos: no documentados; al derivar de VoxCeleb, la distribución de entrenamiento condiciona el comportamiento en dominios acústicos distintos (telefonía, audio lejano, idiomas no representados).
- Licencia Apache-2.0 permite uso comercial, pero el autor pide citar SpeechBrain y ECAPA-TDNN; conviene conservar los avisos de atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ivrit-ai/spkrec-ecapa-voxceleb-ggml
- Modelo base: https://huggingface.co/speechbrain/spkrec-ecapa-voxceleb
- Repositorio ggml: https://github.com/ggml-org/ggml
- Paquete ivrit en PyPI: https://pypi.org/project/ivrit/
- Paper de SpeechBrain (arXiv:2106.04624): https://arxiv.org/abs/2106.04624
- Paper de ECAPA-TDNN (Desplanques et al., Interspeech 2020): https://arxiv.org/abs/2005.07143
