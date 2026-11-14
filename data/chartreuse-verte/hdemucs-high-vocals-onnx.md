# chartreuse-verte/HDemucs-High-Vocals-ONNX

## Resumen

HDemucs High Vocals ONNX es la rama de voz (vocal stem) del pipeline Hybrid Demucs de torchaudio, `HDEMUCS_HIGH_MUSDB_PLUS`, exportada como un unico grafo ONNX para poder ejecutarse sin PyTorch. El modelo original fue entrenado por Meta (Facebook Research) sobre MUSDB-HQ y 150 canciones adicionales; esta version la publica el usuario chartreuse-verte y su valor esta en que elimina la dependencia de torch en produccion, permitiendo separar voces con onnxruntime en CPU desde la version 1.17.

El problema que resuelve es concreto: aislar la pista vocal de una mezcla musical en entornos donde no se quiere desplegar el stack completo de PyTorch. El grafo cubre la red entre los pasos espectrales de Demucs, porque ONNX no tiene STFT inversa: recibe la onda normalizada y su espectrograma, y devuelve la rama temporal y la espectral de la voz, que el usuario recombina con una iSTFT externa.

Es relevante por su tamano contenido (335 MB, repositorio de 0.3 GB), su licencia MIT y su fidelidad verificada: el autor reporta 83 dB SDR o mejor frente a torchaudio en 32 clips de hasta 60 s, sin error adicional en las costuras de segmento. No es un modelo de lenguaje ni un denoiser: es un separador musical especializado en la pista vocal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Demucs (rama temporal + rama espectral), exportada como grafo ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa segmentos de 10 s (441 000 muestras a 44.1 kHz) |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no aplica (audio, no texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17, IR 8, operadores estandar) |

## Arquitectura y entrenamiento

El modelo es la rama vocal de Hybrid Demucs, una arquitectura que combina una rama de dominio temporal (convoluciones sobre la onda) y una rama de dominio espectral (sobre el espectrograma), fusionadas en el proceso de separacion. El grafo ONNX exportado contiene la red entre los pasos espectrales: entrada `wave` de forma `(1, 2, 441000)` float32 (segmento estereo normalizado de 10 s a 44.1 kHz) y entrada `spec` de forma `(1, 4, 2048, 431)` float32 (STFT normalizada con n_fft 4096 y hop 1024, partes real e imaginaria como canales). Salidas: `time` `(1, 2, 441000)` y `freq` `(1, 4, 2048, 431)`; la voz final es `time` mas la iSTFT de `freq`.

Los pesos son los de `HDEMUCS_HIGH_MUSDB_PLUS` de torchaudio, entrenados por Meta sobre MUSDB-HQ y 150 canciones adicionales. La exportacion la genera `scripts/export_vocal_separator.py` del proyecto Orb, que valida el grafo contra torch. El autor reporta que, envuelto en su STFT numpy, iSTFT y overlap-add con crossfade de 1 s, el resultado coincide con el HDemucs de torchaudio con 83 dB SDR o mejor en 32 clips de hasta 60 s, sin error adicional en las uniones entre segmentos. No se detalla el numero de tokens ni si hubo RLHF/DPO (no aplica a este tipo de modelo).

## Capacidades

- Separacion de la pista vocal de una mezcla musical estereo a 44.1 kHz.
- Procesamiento por segmentos de 10 s con overlap-add y crossfade de 1 s para audio largo.
- Ejecucion sin PyTorch mediante onnxruntime, con provider de CPU desde la version 1.17.
- Supresion de camas musicales: en pruebas con seis voces limpias de estudio mezcladas con camas sinteticas a −12 y −24 dB, el suelo de ruido entre frases baja de −18…−36 dB a −45…−77 dB, y el SI-SDR medio frente a la voz limpia sube de 18 a 22 dB.
- Voces ordinarias preservadas con 43–45 dB SI-SDR.
- No incluye tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un modelo de audio.

## Casos de uso

- Karaoke y remixes: extraer la voz de una cancion para generar una pista instrumental por resta o para remezclar la vocal sobre otra base, aprovechando la calidad de separacion en camas musicales de piano, pads, bateria y bajo.
- Postproduccion de audio en pipelines sin GPU: al ejecutarse en onnxruntime CPU, se puede integrar en servidores sin stack de PyTorch para separar voces de forma batch.
- Limpieza de grabaciones musicales: aislar la voz de una maqueta para reecualizarla o aplicar procesado vocal sin arrastrar la instrumentacion.
- Analisis musical y musicologia computacional: obtener la pista vocal para transcripcion de letra, analisis de melodia o alineacion con texto.
- Preprocesado para reconocimiento de voz sobre musica: separar la voz antes de pasar un ASR en contenido audiovisual con banda sonora, aunque con la advertencia de que el ruido de sala y el zumbido de red permanecen.
- Creacion de datasets de voz cantada: extraer voces de un catalogo musical para entrenar o evaluar modelos de sintesis vocal, respetando la licencia MIT del modelo y los derechos de las obras procesadas.
- Herramientas de escritorio y edicion audio ligera: el grafo de 335 MB cabe en un ejecutable de escritorio y no requiere CUDA.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Fidelidad frente a torchaudio HDemucs | 83 dB SDR o mejor | 32 clips de hasta 60 s, sin error extra en costuras |
| Reduccion del suelo de ruido entre frases | de −18…−36 dB a −45…−77 dB | 6 voces limpias de estudio con camas sinteticas a −12 y −24 dB |
| SI-SDR medio vs. voz limpia | de 18 a 22 dB | mismas condiciones |
| SI-SDR en voces ordinarias | 43–45 dB | voces ordinarias |
| Perdida en voz susurrada | 17% de frames de habla pierden mas de 6 dB | voz susurrada |

No se han publicado resultados de benchmarks estandar (SDR sobre MUSDB, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo esta pensado para onnxruntime con provider de CPU.
- GPU recomendadas: no disponibles; no se documenta ejecucion en GPU.
- Cabe en cualquier equipo consumer: el grafo ocupa 335 MB y el repositorio 0.3 GB.
- Opciones de despliegue: onnxruntime (CPU provider, version 1.17 o superior); requiere STFT/iSTFT y overlap-add externos (el autor los implementa en numpy en el proyecto Orb).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| HDemucs High Vocals ONNX | no disponible | segmento de 10 s, 44.1 kHz estereo | MIT | ONNX en Hugging Face |
| HDemucs High (torchaudio, `HDEMUCS_HIGH_MUSDB_PLUS`) | no disponible | segmentos configurables | MIT | PyTorch via torchaudio |
| Demucs v4 (facebookresearch/demucs) | no disponible | segmentos configurables | MIT | PyTorch, repo oficial |

La diferencia practica frente a las versiones PyTorch es la ausencia de dependencia de torch y la necesidad de gestionar la STFT fuera del grafo. No se dispone de datos de otros separadores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un denoiser: el ruido de sala y el zumbido de red permanecen en la salida.
- El habla susurrada y con mucha respiracion se trata parcialmente como acompanamiento; en voz susurrada, el 17% de los frames de habla pierden mas de 6 dB.
- El grafo no incluye STFT inversa; el usuario debe implementar la iSTFT y el overlap-add con crossfade de 1 s para audio de mas de 10 s.
- Solo procesa audio estereo a 44.1 kHz normalizado; no hay soporte documentado para otras frecuencias de muestreo.
- Riesgo de alucinacion no aplica, pero si hay riesgo de artefactos en las costuras si el overlap-add no se implementa correctamente.
- Licencia MIT para el modelo; los derechos de las obras musicales procesadas son responsabilidad del usuario.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente de la comunidad.
- No se documentan sesgos ni evaluaciones fuera de las seis voces de prueba del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chartreuse-verte/HDemucs-High-Vocals-ONNX
- Repositorio oficial de Demucs: https://github.com/facebookresearch/demucs
- Proyecto Orb (script de exportacion `scripts/export_vocal_separator.py`): no disponible
- Documentacion de torchaudio HDemucs: no disponible
