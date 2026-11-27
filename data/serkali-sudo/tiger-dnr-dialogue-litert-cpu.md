# Serkali-sudo/TIGER-DnR-Dialogue-LiteRT-CPU

## Resumen

TIGER-DnR Dialogue LiteRT CPU es una conversión a LiteRT (el formato de ejecución de TensorFlow Lite para CPU) de la rama de diálogo del checkpoint original TIGER-DnR, un modelo de separación de fuentes de audio orientado a la separación de diálogo enmezclas de audio. El modelo base lo desarrollan JusperLee (Jusheng Mao) y colaboradores, y se describe en el artículo "TIGER: Time-frequency Interleaved Gain Extraction and Reconstruction for Efficient Speech Separation" (arXiv:2410.01469), de Mohan Xu, Kai Li, Guo Chen y Xiaolin Hu. Esta conversión la publica el usuario Serkali-sudo y su función es permitir la inferencia en CPU de dispositivos Android y entornos sin GPU mediante grafos LiteRT en FP32.

El modelo no genera texto ni razona: es un modelo de audio-audio que, dada una señal de audio de 44,1 kHz mono, estima la componente de diálogo (la voz hablada) en el dominio tiempo-frecuencia. El host se encarga de la STFT y la iSTFT con FFT de 2048 muestras y salto de 512; el grafo LiteRT recibe una STFT con ventana Hann periódica centrada y reflejada y devuelve la STFT del diálogo estimado, con ejes [batch, parte real/imaginaria, frecuencia, tiempo].

Su relevancia es práctica: el repo original TIGER-DnR está pensado para PyTorch y GPU, y esta conversión ofrece una vía de despliegue en CPU con LiteRT para aplicaciones de separación de diálogo en dispositivos móviles o entornos embebidos. La licencia Apache-2.0 y el tamaño reducido del repositorio (0,0 GB según Hugging Face, lo que sugiere que los artefactos pueden no estar presentes o ser muy pequeños) condicionan su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TIGER (Time-frequency Interleaved Gain Extraction and Reconstruction), conversion a grafos LiteRT del checkpoint TIGER-DnR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa ventanas de audio; la referencia de validacion es de 12 s) |
| Tipos de cuantizacion | FP32 (unica variante publicada) |
| Idiomas soportados | no disponible (el modelo procesa audio, no texto; no se declaran idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT / TFLite (grafos), con metadatos en tiger-dialogue.json |

## Arquitectura y entrenamiento

El modelo base TIGER es una arquitectura de separación de habla que opera en el dominio tiempo-frecuencia con un esquema de extracción y reconstrucción de ganancia intercalada en tiempo y frecuencia, según el artículo arXiv:2410.01469. Esta conversión concreta no entrena nada nuevo: es una exportación de la rama de diálogo del checkpoint original a grafos LiteRT en FP32. Cada grafo acepta una STFT con ventana Hann periódica centrada y reflejada y devuelve la STFT del diálogo; el host realiza la STFT y la iSTFT con FFT de 2048 muestras y salto de 512.

La model card indica que el informe de validación compara cada grafo contra PyTorch con el mismo tamaño de ventana, y también contrasta la temporización de las señales de referencia (cues) y las previsualizaciones del fondo con una referencia PyTorch de longitud completa. La referencia de 12 segundos es solo un punto de comparación: la calidad con ventanas más cortas y el rendimiento en Android requieren evaluación separada. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, algo esperable en un modelo de audio y no de lenguaje.

## Capacidades

- Separación de diálogo en audio: estima la componente de voz/diálogo a partir de una mezcla de audio mono a 44,1 kHz.
- Procesamiento en dominio tiempo-frecuencia: recibe y devuelve STFT con ejes [batch, real/imaginario, frecuencia, tiempo].
- Inferencia en CPU mediante LiteRT: los grafos están exportados para ejecución en CPU, incluido Android.
- Integración con host: el pipeline requiere que el host implemente STFT/iSTFT con FFT 2048 y hop 512.
- No soporta generación de texto, tool calling, agentes, visión ni audio-a-texto.
- Capacidades multilingües: no aplica; el modelo no procesa lenguaje.
- No se declaran modos especiales (thinking mode, vision, audio) más allá de la separación de diálogo.

## Casos de uso

- Separación de diálogo en grabaciones de reuniones: dado un audio mezclado de una sala, el modelo estima la componente de diálogo para aislar la voz del ruido de fondo y facilitar la transcripción posterior con un ASR.
- Preprocesado para pipelines de subtitulado: el modelo puede generar una señal de diálogo limpia antes de la transcripción, lo que reduce errores del ASR en entornos ruidosos; la model card menciona explícitamente AutoSub como consumidor potencial, aunque su cargador actual basado en forma de onda necesita actualizarse para usar estos grafos.
- Aplicaciones Android de accesibilidad: al ser grafos LiteRT para CPU, se pueden integrar en apps móviles que necesiten separar voz de fondo sin depender de GPU ni de la nube.
- Limpieza de audio para podcasts y entrevistas: se puede aplicar la separación de diálogo para atenuar música o ruido ambiente y mejorar la inteligibilidad antes de la edición.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse en CPU con LiteRT, permite desplegar la separación de diálogo en entornos de bajo coste donde no hay aceleradores.
- Investigación en separación de fuentes: sirve como referencia reproducible en FP32 para comparar implementaciones PyTorch frente a LiteRT con la misma ventana y temporización de cues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona una validación de los grafos contra PyTorch con el mismo tamaño de ventana y una comparación de cues y previsualizaciones de fondo con una referencia de 12 segundos, sin cifras de métricas como SI-SNR, SDR ni latencia.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está exportado para CPU (LiteRT). No se dispone de cifras de memoria RAM.
- GPU recomendadas: no aplica para esta conversión; el modelo base TIGER-DnR en PyTorch sí requiere GPU, pero no se detallan modelos concretos en la información disponible.
- ¿Cabe en GPU de consumo? La conversión está pensada para CPU; no se indica compatibilidad con GPU de consumo.
- Opciones de despliegue: LiteRT/TFLite en CPU; el modelo base se puede ejecutar con PyTorch.
- Latencia y throughput: no disponibles. La model card advierte que el rendimiento en Android necesita evaluación separada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| TIGER-DnR Dialogue LiteRT CPU | no disponible | ventana de audio; referencia de 12 s | Apache-2.0 | LiteRT/TFLite | Hugging Face (0 descargas) |
| TIGER-DnR (original) | no disponible | no disponible | Apache-2.0 | PyTorch | Hugging Face (JusperLee/TIGER-DnR) |
| Implementación TIGER | no disponible | no disponible | MIT | PyTorch | GitHub (JusperLee/TIGER) |

No se dispone de datos de rendimiento ni de parámetros para comparar cuantitativamente con alternativas como SepFormer, MossFormer o Demucs; la información proporcionada no los incluye.

## Limitaciones y advertencias

- El repositorio tiene un tamaño de 0,0 GB y 0 descargas, lo que sugiere que los artefactos pueden no estar publicados o ser incompletos; conviene verificar los ficheros antes de usarlo.
- La validación se limita a comparar grafos contra PyTorch con la misma ventana y a una referencia de 12 segundos; la calidad con ventanas más cortas no está evaluada.
- El rendimiento en Android no está medido y requiere evaluación propia.
- El cargador actual de AutoSub, basado en forma de onda, necesita actualizarse para consumir estos grafos, según la model card.
- El modelo solo procesa audio mono a 44,1 kHz y requiere que el host implemente STFT/iSTFT con FFT 2048 y hop 512; un uso incorrecto de la ventana o el hop degrada la salida.
- No hay información sobre sesgos, alucinación (no aplica a audio) ni limitaciones de idioma.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y la implementación original tienen sus propias licencias (Apache-2.0 y MIT) que deben respetarse.
- No se declaran idiomas soportados ni datos de entrenamiento, lo que dificulta evaluar su comportamiento en dominios acústicos distintos.

## Enlaces

- Hugging Face: https://huggingface.co/Serkali-sudo/TIGER-DnR-Dialogue-LiteRT-CPU
- Modelo base: https://huggingface.co/JusperLee/TIGER-DnR
- Artículo: https://arxiv.org/abs/2410.01469
- Implementación original: https://github.com/JusperLee/TIGER
