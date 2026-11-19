# rostrumstudios/umxhq

## Resumen

Open-Unmix UMX-HQ es un modelo de separación de fuentes musicales que divide una mezcla estéreo en cuatro pistas: voz, batería, bajo y "otros". El modelo original fue desarrollado por Fabian-Robert Stöter, Stefan Uhlich, Antoine Liutkus y Yuki Mitsufuji (Inria / Sony) y publicado como implementación de referencia en PyTorch bajo el proyecto Open-Unmix. Esta ficha describe la exportación a ONNX realizada por Rostrum Studios, que empaqueta las cuatro redes del modelo en un único fichero de 142,5 MB compatible con el runtime ONNX (opset 17) y con longitud de entrada arbitraria.

La relevancia de esta exportación es práctica: elimina la dependencia de PyTorch en producción y permite ejecutar la separación en entornos donde solo se dispone de ONNX Runtime. La model card indica que, comparado con la implementación PyTorch original `umxhq()` sobre 15 segundos de música, cada pista coincide dentro de un rango de 106–129 dB, lo que sugiere una fidelidad numérica muy alta en la exportación. El modelo no genera audio nuevo: es una herramienta de análisis que separa lo que ya está presente en la grabación.

Se trata de un modelo pequeño y especializado, no de un modelo de lenguaje ni de un modelo generativo. Su utilidad se limita a tareas de source separation sobre audio musical, y su licencia MIT (tanto en pesos como en código) facilita la integración en productos comerciales, con la salvedad de que los datos de entrenamiento originales (MUSDB18-HQ) tienen términos de uso académico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Redes neuronales recurrentes (Open-Unmix, cuatro redes independientes por pista) exportadas a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; acepta audio de longitud arbitraria |
| Tipos de cuantización | no disponible (el repositorio solo distribuye el fichero ONNX en precisión original) |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), fichero `umxhq.onnx` de 142.496.426 bytes |

## Arquitectura y entrenamiento

Open-Unmix es una arquitectura de separación de fuentes basada en redes recurrentes que operan sobre la magnitud del espectrograma de corto plazo (STFT). El modelo original entrena una red independiente por cada fuente (voz, batería, bajo y otros), y la reconstrucción de la señal se realiza aplicando un filtro de Wiener multicanal sobre las estimaciones de magnitud. En esta exportación ONNX, las cuatro redes están empaquetadas en un único fichero, mientras que el cálculo de la STFT y el filtro de Wiener se ejecutan fuera del grafo ONNX, en el código anfitrión.

Los pesos UMX-HQ fueron entrenados sobre el dataset MUSDB18-HQ, un corpus de música estéreo con pistas separadas para cada fuente. La model card no detalla el número de tokens ni la composición exacta del dataset más allá de la referencia a MUSDB18-HQ, ni menciona si hubo etapas de refinamiento posteriores (RLHF, DPO u otras), lo cual es esperable en un modelo de separación de audio y no de lenguaje. La innovación técnica destacable de esta ficha es la propia exportación a ONNX con soporte de longitud arbitraria y opset 17, que permite desplegar el modelo sin PyTorch.

## Capacidades

- Separación de una mezcla musical estéreo en cuatro pistas: voz, batería, bajo y otros.
- Procesamiento de audio de longitud arbitraria (la red ONNX no impone una ventana fija).
- Ejecución mediante ONNX Runtime, sin dependencia de PyTorch.
- Integración en pipelines de audio-to-audio dentro de aplicaciones de limpieza o análisis de grabaciones.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo multilingüe ni procesa texto.
- No genera audio nuevo: solo separa lo que ya está presente en la mezcla.

## Casos de uso

- Limpieza de grabaciones vocales: separar la voz de la música de fondo en una grabación para aislar la pista vocal, útil en postproducción de podcast o vídeo.
- Análisis musical automatizado: extraer pistas de batería y bajo por separado para alimentar herramientas de transcripción rítmica o análisis de estructura.
- Creación de stems para remezclas: obtener las cuatro pistas de una canción para su uso en DAWs o plataformas de remezcla, siempre que se respeten los derechos de la obra original.
- Reducción de ruido musical en grabaciones de campo: aislar la componente musical de una grabación con voz y música superpuestas.
- Preprocesado para modelos de reconocimiento musical: separar fuentes antes de alimentar clasificadores de género, tempo o instrumentos.
- Integración en aplicaciones de karaoke o práctica instrumental: extraer la pista de voz para eliminarla o la de un instrumento concreto para practicar sobre ella.
- Despliegue en entornos sin PyTorch: usar ONNX Runtime en servidores ligeros o en el navegador (con las limitaciones de rendimiento correspondientes) para separar fuentes sin instalar el stack de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que, frente a la implementación PyTorch `umxhq()` sobre 15 segundos de música, cada pista coincidió dentro de un rango de 106–129 dB, lo que es una medida de fidelidad de la exportación, no de calidad de separación (SDR, SIR, SAR u otras métricas estándar).

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero ONNX ocupa 142,5 MB, por lo que la inferencia cabe holgadamente en GPUs consumer con 4 GB o más; en CPU también es viable para audios cortos.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime (CUDA o DirectML); no se requieren A100 ni H100 para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con al menos 2–4 GB de VRAM, e incluso en CPU para clips cortos.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, TensorRT), con el código anfitrión encargado de la STFT y el filtro de Wiener.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Fuentes | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Open-Unmix UMX-HQ (esta ficha) | RNN + filtro de Wiener, ONNX | 4 (voz, batería, bajo, otros) | audio arbitrario | MIT | Hugging Face (ONNX) |
| Open-Unmix UMX (PyTorch original) | RNN + filtro de Wiener, PyTorch | 4 | audio arbitrario | MIT | GitHub sigsep / Zenodo |
| Demucs (Meta) | Híbrido transformer/convolucional | 4–6 según versión | audio arbitrario | MIT (versiones recientes) | GitHub / Hugging Face |
| Spleeter (Deezer) | U-Net | 2, 4 o 5 según modelo | audio arbitrario | MIT | GitHub |

No se dispone de datos de rendimiento comparativo (SDR, SIR, SAR) en la información proporcionada para establecer una comparación cuantitativa con Demucs o Spleeter.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre MUSDB18-HQ, el modelo puede rendir peor en géneros, idiomas o estilos poco representados en ese corpus.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la separación puede introducir artefactos o filtrar componentes de forma imperfecta en mezclas complejas.
- Limitaciones de contexto o idioma: no procesa texto ni idiomas; su ámbito es exclusivamente audio musical estéreo.
- Restricciones de licencia: los pesos y el código son MIT, pero los datos de entrenamiento (MUSDB18-HQ) tienen términos de uso académico; conviene revisar la implicación para uso comercial.
- Caveat para producción: la STFT y el filtro de Wiener se ejecutan fuera del grafo ONNX, por lo que la integración requiere código anfitrión adicional; la model card no documenta la API exacta de entrada/salida del fichero ONNX.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que no implica baja calidad pero sí poca validación comunitaria de esta exportación concreta.

## Enlaces

- Hugging Face: https://huggingface.co/rostrumstudios/umxhq
- Código original Open-Unmix: https://github.com/sigsep/open-unmix-pytorch
- Pesos originales UMX-HQ (Zenodo): https://zenodo.org/records/3370489
- Paper de referencia (JOSS): https://doi.org/10.21105/joss.01667
- Perfil de Rostrum Studios: https://huggingface.co/rostrumstudios
