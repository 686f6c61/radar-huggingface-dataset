# beleata74/BgTTS-40M-Engram-Loop

## Resumen

BgTTS-40M-Engram-Loop es un modelo de síntesis de voz (text-to-speech) para búlgaro e inglés desarrollado por el usuario beleata74, que predice el contenido acústico del habla a partir de texto escrito y lo combina con un códec externo (MioCodec) para dotarlo del timbre de un hablante de referencia. El modelo final de texto a código suma 40.181.218 parámetros y ocupa unos 153 MiB en SafeTensors FP32; el códec se descarga por separado. Es un fine-tuning de BgTTS-38M-V2 con dos modificaciones arquitectónicas concretas: un módulo de lookup de palabras y n-gramas de caracteres (inspirado en la investigación sobre "engram") y un bloque de encoder compartido ejecutado dos veces con puertas escalares.

La relevancia del modelo es su tamaño reducido para una tarea de clonación de voz multilingüe: con 40 millones de parámetros y una ventana de segmentos de entrenamiento de hasta 12 segundos, apunta a despliegues ligeros en CPU o GPU de consumo. La clonación de voz no se realiza en el modelo de texto a código, sino que la identidad del hablante entra únicamente en el códec mediante un vector de 128 dimensiones extraído de una referencia de audio de 3 a 8 segundos, que puede estar en un idioma distinto al del texto solicitado.

El modelo se publica bajo licencia Apache 2.0, con pesos en safetensors y código de inferencia en PyTorch, y la versión principal corresponde a la época 3, paso 30.129. La model card incluye una demostración de doblaje de 29 segundos al búlgaro con referencias de voz por línea de cada actor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Transformer bidireccional de caracteres (4 bloques, ancho 384, 6 cabezas, FFN 1.536) + decoder causal (8 bloques, ancho 384, 6 cabezas, FFN 1.536) con cross-attention; módulo de lookup de palabra y n-gramas (engram) y bloque de encoder compartido con puertas escalares |
| Parametros totales | 40.181.218 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; segmentos de entrenamiento de hasta 12 segundos de audio, con troceado y pausa entre fragmentos en la inferencia |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32 SafeTensors) |
| Idiomas soportados | búlgaro (bg) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32, ~153 MiB); código de inferencia en PyTorch; el códec MioCodec se descarga aparte |
| Frecuencia de muestreo de salida | 44,1 kHz mono (vía MioCodec) |
| Vocabulario de salida | 12.800 códigos MioCodec + símbolo de fin de habla, un código cada 40 ms |
| Parametros añadidos (engram) | 2.004.704 |
| Parametros añadidos (bloque compartido) | 770 |

## Arquitectura y entrenamiento

El modelo es un sistema de dos etapas: un modelo de texto a código (el publicado aquí) y un códec neuronal separado, MioCodec-25Hz-44.1kHz-v2, que convierte los códigos en forma de onda. La etapa de texto a código parte de los pesos de BgTTS-38M-V2 en el paso 258.680, a los que se elimina la proyección de condicionamiento de hablante. El encoder es un Transformer bidireccional a nivel de carácter con cuatro bloques que alimenta, mediante cross-attention, un decoder causal de ocho bloques; ambos con ancho 384, seis cabezas y anchura feed-forward de 1.536. El decoder predice uno de 12.800 códigos MioCodec cada 40 ms o un símbolo de fin de habla.

Durante las épocas 1 y 2 se añadió un módulo de lookup, tras el segundo bloque del encoder, que recupera representaciones entrenables de la palabra completa y de sus secuencias locales de tres y cinco caracteres; una puerta pondera esa información según el texto circundante en cada letra. La proyección de salida de este módulo se inicializó a cero y añade 2.004.704 parámetros. En la época 3 se ejecutó el tercer bloque del encoder dos veces con pesos compartidos y se añadieron dos puertas escalares por posición de texto (770 parámetros entrenables en total); la segunda actualización se inicializó a cero y, antes de continuar el entrenamiento, el modelo convertido reprodujo exactamente los logits de la época 2 en los ejemplos comprobados y los mismos códigos muestreados para un prompt y semilla fijos. Se continuó el estado de AdamW y el calendario de learning rate.

El conjunto de fine-tuning contiene 1.285.440 enunciados: 648.813 segmentos en búlgaro (1.336,4 horas) y 636.627 en inglés (679,4 horas). Las fuentes inglesas son LibriTTS-R y Hi-Fi TTS. Se excluyeron transcripciones con dígitos y se eliminaron duplicados por hash de audio durante el montaje del dataset. Cada época supuso 10.043 pasos de optimizador, con entropía cruzada de siguiente código y de fin de habla, autocast BF16 con pesos FP32, AdamW (β₁ 0,9, β₂ 0,95, weight decay 0,01) y microbatches de 32.

## Capacidades

- Síntesis de voz a partir de texto en búlgaro e inglés con una referencia de voz de 3 a 8 segundos de un único hablante.
- Clonación de voz: la identidad del hablante se transfiere mediante un vector de 128 dimensiones extraído de la referencia por el códec; la referencia puede estar en un idioma distinto al del texto.
- Predicción propia de la duración del habla, sin necesidad de un modelo de duración externo.
- Pronunciación contextual: el módulo de engram busca representaciones de palabras y n-gramas de caracteres para mejorar la pronunciación, incluido el acento léxico del búlgaro.
- Manejo de entradas largas mediante troceado automático con inserción de una pausa breve entre fragmentos.
- Reproducibilidad: la semilla (`--seed`) permite obtener lecturas alternativas de un mismo texto.
- Inferencia en CPU o CUDA (`--device cpu` / `--device cuda`).
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Doblaje de vídeo al búlgaro: la model card demuestra el doblaje de 29 segundos de una serie usando la línea original de cada actor como referencia de voz por línea; el modelo predice su propia duración y el habla generada se ajusta a la escena después de la síntesis.
- Audiolibros y narración en búlgaro e inglés: con una referencia de 3 a 8 segundos se puede mantener una voz consistente a lo largo de varias líneas reutilizando el objeto de voz devuelto por `reference_voice`, adecuado para textos largos troceados automáticamente.
- Locución para medios y boletines: la frase de ejemplo de la model card ("Добро утро. Вече сме в ефир.") ilustra el uso para aperturas y continuidad en emisión, con control de semilla para regenerar tomas.
- Prototipado de asistentes de voz bilingües búlgaro-inglés: el modelo acepta referencias en un idioma distinto al del texto, lo que permite clonar una voz para contenido en ambos idiomas con un único registro de referencia.
- Síntesis ligera en entornos sin GPU: con 40 millones de parámetros y pesos FP32 de ~153 MiB, la inferencia en CPU es viable para volúmenes moderados y pruebas de integración.
- Localización de contenido educativo o corporativo: conversión de guiones escritos a audio en búlgaro con la voz de un presentador concreto, escribiendo números y abreviaturas tal como deben sonar y usando la puntuación para el fraseo.
- Investigación en arquitecturas TTS de bajo parámetro: la combinación de lookup tipo engram y capas compartidas con puertas escalares sirve como banco de pruebas reproducible (se documenta la equivalencia exacta de logits tras la conversión).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los pesos del modelo de texto a código son ~153 MiB en FP32, a lo que se suma el códec MioCodec descargado aparte. El conjunto es de escala muy reducida.
- GPU recomendadas: no se especifican modelos concretos; la model card indica que la aceleración NVIDIA requiere una build de PyTorch y torchaudio con CUDA compatible, instalada antes de los requisitos.
- GPU de consumo: por el tamaño (40 M de parámetros, repo de 0,5 GB), es esperable que quepa en cualquier GPU de consumo con CUDA, aunque no se publican cifras de VRAM verificadas.
- CPU: la síntesis en CPU funciona según la model card (`--device cpu`).
- Opciones de despliegue: script `synthesize.py` del repositorio con PyTorch, más `huggingface_hub>=1.0` para la descarga; se requiere Python 3.12 o 3.13. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos comparables, por lo que la comparación cuantitativa no está disponible. Como referencia estructural, el propio modelo se apoya en dos componentes externos citados en su model card: el checkpoint base BgTTS-38M-V2 (mismo autor, del que hereda arquitectura y pesos iniciales) y el códec Aratako/MioCodec-25Hz-44.1kHz-v2, que aporta la renderización a 44,1 kHz y el condicionamiento de timbre.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| BgTTS-40M-Engram-Loop | 40.181.218 | no disponible (segmentos de hasta 12 s) | Apache 2.0 | Hugging Face, pesos safetensors |
| BgTTS-38M-V2 (base) | no disponible | no disponible | no disponible | Hugging Face |
| MioCodec-25Hz-44.1kHz-v2 (códec) | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Cobertura lingüística limitada a búlgaro e inglés; no se documenta soporte de otros idiomas.
- Los segmentos de entrenamiento no superan los 12 segundos; las entradas largas se trocean con una pausa breve entre fragmentos, lo que puede afectar a la prosodia en textos extensos.
- Se excluyeron del entrenamiento las transcripciones con dígitos: es necesario escribir números y abreviaturas tal como deben sonar.
- La clonación de voz entraña riesgos de suplantación y uso indebido; la licencia Apache 2.0 permite uso comercial sin restricciones adicionales documentadas, por lo que la responsabilidad sobre el consentimiento de las voces de referencia recae en el usuario.
- Riesgo de alucinación acústica y de pronunciación incorrecta en palabras fuera de dominio o en acentos no representados; no se publican métricas de inteligibilidad ni de similitud de hablante.
- El modelo depende de un códec externo (MioCodec) cuya licencia y disponibilidad se rigen por su propio repositorio, no por el de este modelo.
- No hay información sobre sesgos demográficos, de género o de acento en los datos de entrenamiento (LibriTTS-R, Hi-Fi TTS y corpus búlgaro no detallado).
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación indicada es 2026-11-24; se trata de una publicación reciente sin validación comunitaria.
- No se documentan cifras de latencia, throughput ni requisitos de VRAM verificados para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beleata74/BgTTS-40M-Engram-Loop
- README en búlgaro: https://huggingface.co/beleata74/BgTTS-40M-Engram-Loop/blob/epoch-3/README.bg.md
- Demostración de doblaje (MP4, 29 s): https://huggingface.co/beleata74/BgTTS-40M-Engram-Loop/resolve/epoch-3/demo/dark-matter-bg-29s.mp4
- Modelo base BgTTS-38M-V2: https://huggingface.co/beleata74/BgTTS-38M-V2
- Checkpoint original del modelo base: https://huggingface.co/beleata74/BgTTS-38M-V2/tree/3f6ca06b3ca78352eb00d8e96349c0bedaa3d2f1
- Códec MioCodec v2: https://huggingface.co/Aratako/MioCodec-25Hz-44.1kHz-v2
- Investigación sobre engram: https://github.com/deepseek-ai/Engram
- Investigación sobre capas compartidas (Z.ai): https://z.ai/blog/glm-5.4
- Instalación de PyTorch: https://pytorch.org/get-started/locally/
