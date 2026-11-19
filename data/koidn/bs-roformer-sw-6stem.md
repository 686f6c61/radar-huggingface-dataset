# koidn/BS-RoFormer-SW-6stem

## Resumen

BS-RoFormer-SW-6stem es un checkpoint de separación de fuentes musicales (music source separation) basado en la arquitectura BS-RoFormer, publicado originalmente por el autor `jarredou` bajo el identificador `enerjazzer/BS-ROFO-SW-Fixed` y rehospedado por `koidn` como mirror no modificado tras la eliminación de la cuenta del autor original en Hugging Face. El modelo separa una mezcla musical estéreo a 44,1 kHz en seis pistas o *stems*: bajo, batería, otros, voces, guitarra y piano, en ese orden concreto de salida.

El repositorio incluye el checkpoint original en formato `.ckpt` (699 MB), su fichero de configuración YAML y una conversión a GGUF en cuantización q8_0 (188 MB), pensada para ejecutarse sin el stack de Python ML mediante el runtime BSRoformer.cpp. El modelo tiene 174.660.405 parámetros totales según los datos de safetensors del repositorio.

Su relevancia actual es práctica: al haber desaparecido la cuenta del autor original, este mirror permite fijar una copia estable (con hashes SHA256 verificables) para pipelines de producción como Trainspotting Suite. No es un modelo de lenguaje ni un modelo multimodal generativo: es un modelo de audio-to-audio especializado exclusivamente en separación de stems.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BS-RoFormer (Band-Split RoFormer) |
| Parametros totales | 174.660.405 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de procesamiento no especificada) |
| Tipos de cuantizacion | q8_0 (GGUF, con normas, biases y proyecciones `band_split` en F32); checkpoint original en precisión nativa `.ckpt` |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; procesa audio musical independientemente del idioma) |
| Licencia | unknown (el upstream no declara licencia; el mirror no concede derechos adicionales) |
| Formato de pesos | `.ckpt` (PyTorch), `.yaml` (configuración), `.gguf` (q8_0) |

## Arquitectura y entrenamiento

BS-RoFormer es una variante de RoFormer (transformer con atención rotatoria) adaptada a separación de fuentes musicales mediante *band-split*: la señal se divide en bandas de frecuencia que se proyectan a un espacio latente antes de aplicar los bloques de atención, lo que reduce el coste computacional frente a operar sobre el espectrograma completo. El checkpoint procesa audio estéreo a 44,1 kHz y produce seis stems en el orden `bass, drums, other, vocals, guitar, piano`, definido en `BS-Rofo-SW-Fixed.yaml`.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o horas de audio, ni sobre si se aplicaron etapas de refinamiento. La model card del mirror no documenta el proceso de entrenamiento, únicamente la procedencia del checkpoint y los detalles de conversión a GGUF. La conversión se realizó con `scripts/convert_to_gguf.py --arch bs --dtype q8_0` del proyecto BSRoformer.cpp, manteniendo en F32 las normas, biases y proyecciones `band_split` porque sus anchos no están alineados a bloques q8_0, lo que da lugar a una cuantización mixta.

## Capacidades

- Separación de mezclas musicales estéreo a 44,1 kHz en seis stems: bajo, batería, otros, voces, guitarra y piano.
- Salida en el orden fijo `bass, drums, other, vocals, guitar, piano`; el GGUF incluye `num_stems = 6` pero no los nombres, por lo que el consumidor debe aplicar ese orden.
- Ejecución en CPU, CUDA, Vulkan y Metal mediante BSRoformer.cpp, sin dependencias del stack de Python ML.
- Reconstrucción fiable de la mezcla: los stems suman de vuelta a la mezcla original con correlación 0,9997 y residual de −38,9 dB (verificado en Apple Silicon).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de audio-to-audio.
- No dispone de modo thinking, visión ni audio generativo más allá de la separación de stems.

## Casos de uso

- Producción musical y remezcla: separar una mezcla en seis stems permite aislar voces o instrumentos para remezclar, hacer versiones instrumentales o a cappella, o reequilibrar niveles sin acceso a las pistas originales.
- Karaoke y edición de voces: extraer el stem de voces y el resto de acompañamiento para generar versiones karaoke o para procesar la voz por separado (afinación, efectos, doblaje).
- Muestreo y *sample flipping*: aislar batería, bajo o guitarra de grabaciones existentes para reutilizarlos como samples en producción propia, con stems limpios y alineados en fase.
- Entrenamiento de modelos de audio: generar datasets de pares (mezcla, stems) etiquetados para entrenar o evaluar otros sistemas de separación, transcripción o análisis musical.
- Restauración y archivo musical: separar stems de grabaciones para tareas de limpieza, reducción de ruido selectiva o análisis musicológico por instrumento.
- Despliegue ligero en aplicaciones de escritorio o móviles: el GGUF q8_0 (188 MB) se ejecuta con BSRoformer.cpp en Metal, Vulkan o CPU, lo que permite integrar separación de stems en apps nativas sin servidor Python; el ejemplo verificado procesa 12 s de audio estéreo en 2,75 s en Apple Silicon.
- Pipelines de postproducción de vídeo: separar diálogo/música/efectos aproximados mediante los stems de voces y "otros" para ajustar mezclas en montaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una verificación cualitativa de reconstrucción: correlación de 0,9997 entre la suma de stems y la mezcla original, con residual de −38,9 dB, y un tiempo de 2,75 s para separar 12 s de audio estéreo en Apple Silicon con Metal.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF q8_0 ocupa 188 MB en disco; el checkpoint `.ckpt` ocupa 699 MB. La VRAM necesaria en ejecución no está documentada, pero por el tamaño del modelo (175 M de parámetros) es del orden de cientos de MB a 1-2 GB, incluyendo buffers de audio.
- GPU recomendadas: cualquier GPU con soporte CUDA, Vulkan o Metal; el modelo es lo bastante pequeño para ejecutarse en GPUs de consumo e incluso en CPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, Apple Silicon, iGPU con Vulkan); no requiere A100 ni H100.
- Opciones de despliegue: BSRoformer.cpp (CPU, CUDA, Vulkan, Metal) con el GGUF; el `.ckpt` requiere el stack PyTorch original (no documentado en este repositorio). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 12 s de audio estéreo separados en 2,75 s sobre Metal en Apple Silicon (≈4,4× tiempo real) según la verificación del autor del mirror; no hay cifras publicadas para CUDA, Vulkan ni CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Stems | Contexto/audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BS-RoFormer-SW-6stem (este) | 174,7 M | 6 | 44,1 kHz estéreo | unknown | GGUF + ckpt en HF (mirror) |
| BS-RoFormer (variantes SW de jarredou) | no disponible | 4 habitual | 44,1 kHz | no disponible | cuenta original eliminada |
| Demucs (htdemucs) | no disponible | 4 | 44,1 kHz estéreo | MIT (versiones públicas) | repo oficial de Meta |
| MDX-Net (UVR) | no disponible | 2-4 | 44,1 kHz | no disponible | checkpoints comunitarios |

No se dispone de datos de benchmarks comparativos en la información proporcionada; la comparación se limita a características estructurales. Las alternativas indicadas son referencias de categoría y sus cifras exactas no están verificadas en esta ficha.

## Limitaciones y advertencias

- Licencia `unknown`: el upstream no declara licencia y este mirror no concede derechos adicionales. El uso comercial no está autorizado de forma explícita; es necesario contactar con el autor original para conocer los términos.
- El autor original (`jarredou`) eliminó su cuenta de Hugging Face; el mantenimiento y la procedencia del checkpoint dependen de mirrors de terceros.
- El GGUF no incluye los nombres de los stems, solo `num_stems = 6`; un consumidor que no aplique el orden documentado obtendrá stems mal etiquetados.
- La cuantización q8_0 es mixta (normas, biases y `band_split` en F32); no se han publicado métricas de degradación de calidad frente al checkpoint original.
- No hay información sobre sesgos, composición del dataset de entrenamiento ni evaluación objetiva (SDR, SI-SDR) publicada en este repositorio.
- Riesgo de artefactos en pasajes densos o instrumentos poco representados en el entrenamiento; sin benchmarks no puede cuantificarse.
- Sin garantía de ningún tipo; el mirror se distribuye "as is" y no está afiliado a los autores originales.
- No es un modelo de lenguaje: no debe esperarse generación de texto, razonamiento ni soporte multilingüe.

## Enlaces

- Hugging Face (mirror): https://huggingface.co/koidn/BS-RoFormer-SW-6stem
- Checkpoint upstream referenciado: https://huggingface.co/enerjazzer/BS-ROFO-SW-Fixed
- Runtime GGUF: https://github.com/chenmozhijin/BSRoformer.cpp
- Proyecto consumidor: https://github.com/remy-st/trainspotting-suite
