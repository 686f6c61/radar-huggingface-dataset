# ericfithian/piano-duet-recording-transcription-onnx

## Resumen

Este repositorio contiene una conversión a ONNX del modelo Transkun 2.0, desarrollado originalmente por Yujia Yan y Zhiyao Duan, orientado a la transcripción automática de grabaciones de piano a partitura simbólica (notas con onset, offset y velocidad). La conversión la mantiene el usuario ericfithian como parte del proyecto Piano Duet, y su objetivo es permitir la inferencia local, incluso en navegador mediante WebAssembly, sin depender del stack de PyTorch.

El modelo no es un LLM ni un transformer generativo de texto: es un sistema de transcripción de audio basado en un transformer no jerárquico que puntúa intervalos (ver paper arXiv:2404.09466). Se distribuye en dos grafos ONNX: uno de extracción de características y otro de atributos de intervalo, con un decodificador de intervalos y un mecanismo de costura de segmentos implementados fuera del modelo, en la aplicación Piano Duet.

La relevancia actual es acotada pero clara: ofrece una vía práctica para transcribir audio monofónico de piano a 44,1 kHz en entornos sin GPU y sin Python, con licencia MIT y pesos verificables por SHA-256. El repo ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no jerarquico para puntuacion de intervalos (Transkun 2.0) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por segmentos con costura posterior) |
| Tipos de cuantizacion | FP32 en los grafos publicados; cuantizacion no probada segun el autor |
| Idiomas soportados | no aplica (audio musical, no texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`features.onnx`, `attributes.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Transkun 2.0: un transformer no jerárquico que formula la transcripción como puntuación de intervalos, es decir, evalúa pares de límites temporales para decidir la presencia de notas y sus atributos, en lugar de depender de una segmentación jerárquica previa. El checkpoint de referencia es `2.0.pt`, empaquetado con `transkun==2.0.1`, y la entrada esperada es audio mono a 44,1 kHz.

La conversión separa el pipeline en dos grafos ONNX: `features.onnx` (53.313.300 bytes) para la extracción de características y `attributes.onnx` (3.423.800 bytes) para los atributos de intervalo. El decodificador de intervalos y la costura de segmentos no forman parte de los grafos y los implementa la aplicación Piano Duet. Los grafos FP32 se generaron con PyTorch 2.14.1 y ONNX 1.23.2. No se detallan en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de refinamiento posteriores.

## Capacidades

- Transcripción de grabaciones de piano a eventos simbólicos con onset, offset y atributos de intervalo.
- Procesamiento de audio mono a 44,1 kHz.
- Inferencia local sin PyTorch, mediante runtime ONNX.
- Ejecución en navegador vía WebAssembly, según la validación del autor.
- Costura de segmentos para cubrir grabaciones más largas que un segmento individual (implementada en la aplicación, no en el modelo).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio general ni generación de texto.
- No hay capacidades multilingües: la salida es simbólica musical, no lingüística.

## Casos de uso

- Transcripción de grabaciones de piano en el navegador: el par de grafos ONNX permite ejecutar la transcripción en WebAssembly, de modo que una aplicación web puede convertir una grabación subida por el usuario en eventos de nota sin enviar el audio a un servidor.
- Herramientas de práctica musical: a partir de los onsets y offsets detectados se puede generar una vista de partitura o un piano roll para comparar la interpretación del estudiante con la referencia.
- Archivado y catalogación de grabaciones: la transcripción simbólica permite indexar interpretaciones por notas, tempo y dinámica, facilitando búsquedas sobre una fonoteca de piano.
- Edición y corrección de partituras: los eventos transcritos sirven como borrador inicial que un editor revisa y corrige, reduciendo el trabajo manual de transcripción.
- Aplicaciones de escritorio offline: al no requerir PyTorch ni GPU, el modelo puede integrarse en herramientas locales de análisis musical con un runtime ONNX ligero.
- Investigación en MIR (music information retrieval): el modelo sirve como línea base reproducible para experimentos de transcripción, con pesos verificables por SHA-256 y licencia MIT.
- Sincronización audio-partitura: los intervalos detectados permiten alinear una interpretación con una partitura existente para visualización o evaluación.

## Benchmarks y rendimiento

El autor reporta una validación interna: sobre un fixture de piano real repetido de tres minutos, la conversión en WebAssembly coincidió con los 960 onsets de referencia dentro de una tolerancia de 30 ms. No se han publicado resultados de benchmarks estándar (por ejemplo, MAPS o MAESTRO) en la información disponible, ni comparaciones numéricas con el checkpoint original de PyTorch.

| Prueba | Resultado reportado |
|---|---|
| Fixture de piano real, 3 minutos, WASM | 960/960 onsets dentro de 30 ms |
| Benchmarks estandar de transcripcion | no disponible |
| Pruebas con grabaciones mas amplias | no realizadas segun el autor |
| Pruebas de cuantizacion | no realizadas segun el autor |

## Requisitos de hardware

- VRAM estimada: no disponible; los grafos suman unos 56,7 MB en FP32, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no disponibles; el modelo está pensado para ejecución en CPU y en navegador.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; la validación reportada se hizo en WebAssembly.
- Opciones de despliegue: ONNX Runtime (CPU, WebAssembly, y potencialmente GPU), integración en la aplicación Piano Duet.
- Latencia y throughput: no disponibles; solo se reporta la coincidencia de onsets en el fixture de tres minutos, sin cifras de tiempo de ejecución.

## Comparativa con modelos similares

| Modelo | Enfoque | Formato | Licencia | Contexto de audio | Notas |
|---|---|---|---|---|---|
| Transkun 2.0 (original) | Transformer no jerarquico, puntuacion de intervalos | PyTorch (`2.0.pt`) | MIT | Audio mono 44,1 kHz | Referencia de la conversion |
| Este repo (ONNX) | Misma arquitectura, grafos separados | ONNX | MIT | Audio mono 44,1 kHz | Inferencia local y WASM |
| Otros transcriptores de piano (p. ej. basados en CRNN o HMM) | Modelos acusticos clasicos | Variable | Variable | Variable | No disponible en la informacion proporcionada |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información disponible.

## Limitaciones y advertencias

- Solo se ha validado con un fixture de tres minutos; el propio autor indica que quedan por probar grabaciones más amplias.
- La cuantización no está probada; los grafos publicados son FP32.
- El decodificador de intervalos y la costura de segmentos no están incluidos en los ONNX y deben implementarse en la aplicación anfitriona.
- El modelo está especializado en piano y audio mono a 44,1 kHz; no es un transcriptor polifónico general ni admite otros instrumentos sin validación.
- Riesgo de errores en pasajes densos, pedales o dinámicas extremas: no cuantificado en la información disponible.
- Sesgos: no documentados; dependen del dataset de entrenamiento original de Transkun, no detallado aquí.
- Licencia MIT: permite uso comercial, pero debe conservarse el aviso de copyright del repositorio upstream y de la conversión.
- La fecha de creación del repo (2026-10-30) y las versiones citadas de PyTorch (2.14.1) y ONNX (1.23.2) deben verificarse antes de reproducir la conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ericfithian/piano-duet-recording-transcription-onnx
- Paper del método: https://arxiv.org/abs/2404.09466
- Repositorio upstream Transkun: https://github.com/Yujia-Yan/Transkun
- Paquete de referencia: `transkun==2.0.1` (checkpoint `2.0.pt`)
