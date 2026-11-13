# rahmanbazarov/LTX-Video-int8-ov

## Resumen

LTX-Video-int8-ov es una conversión a OpenVINO IR del modelo de generación de vídeo Lightricks/LTX-Video, con todos sus pesos comprimidos a INT8. Lo publica el usuario rahmanbazarov y su objetivo es permitir la inferencia de text-to-video e image-to-video sobre CPU Intel, sin necesidad de GPU. El paquete se carga directamente con las clases `Text2VideoPipeline` e `Image2VideoPipeline` de OpenVINO GenAI y está pensado para entornos con recursos limitados, como el proyecto LongVid-OV, orientado a medir y reducir el consumo de memoria en la decodificación de vídeos largos.

El modelo base es la variante de 2B parámetros de LTX-Video de Lightricks, en formato diffusers (revisión `8984fa2500`). La conversión no modifica la arquitectura ni el scheduler: se limita a exportar cada componente (text encoder T5, transformer, VAE encoder y VAE decoder) a OpenVINO IR por separado y a comprimir sus pesos con `nncf.compress_weights` en modo `INT8_ASYM`. El tokenizer se convierte con `openvino-tokenizers`.

Su relevancia práctica es doble: por un lado, demuestra que un modelo de vídeo de 2B puede ejecutarse en CPU con un pico de RAM de unos 16 GB; por otro, documenta los tiempos reales de generación en hardware modesto (Xeon a 2,20 GHz, 4 vCPU), lo que resulta útil para planificar despliegues sin GPU. La licencia es la LTX-Video Open Weights License, con restricciones de uso y umbral de facturación para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo (LTX-Video, formato diffusers); componentes: text encoder T5, transformer, VAE encoder y VAE decoder, exportados a OpenVINO IR |
| Parámetros totales | 2B (modelo base LTX-Video) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 asimétrico (`INT8_ASYM`) en todos los pesos, vía `nncf.compress_weights` |
| Idiomas soportados | no disponible |
| Licencia | LTX-Video Open Weights License (`other`) |
| Formato de pesos | OpenVINO IR (no safetensors ni GGUF) |
| Tamaño del repositorio | 7,1 GB |
| Desglose de componentes | Text encoder (T5) 4,44 GB; transformer 1,80 GB; VAE decoder 0,22 GB; VAE encoder 0,17 GB; total 6,64 GB |
| Pipeline | text-to-video (también image-to-video) |
| Librería | openvino, openvino-genai |

## Arquitectura y entrenamiento

El modelo base LTX-Video es un modelo de difusión para generación de vídeo que combina un text encoder T5 para procesar el prompt, un transformer como denoiser y un VAE para codificar y decodificar fotogramas. En esta conversión la arquitectura se mantiene intacta: solo cambia la representación de los pesos (OpenVINO IR con compresión INT8) y el runtime (OpenVINO GenAI). El scheduler no se ha modificado respecto al original.

No se dispone de información sobre el proceso de entrenamiento del modelo base en la documentación proporcionada: no se detallan el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica de esta versión concreta es la exportación por componentes, necesaria porque el comando habitual `optimum-cli export openvino` agotaba la memoria en una máquina de 30 GB. El autor no ha comparado la calidad final del modelo INT8 con el FP32 original de extremo a extremo; solo aporta una medición aislada del VAE decoder, que alcanza al menos 52,8 dB PSNR frente al decoder FP32.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con control de resolución (`height`, `width`), número de fotogramas (`num_frames`), pasos de inferencia (`num_inference_steps`), `guidance_scale` y `frame_rate`.
- Generación de vídeo a partir de una imagen inicial (image-to-video) mediante `Image2VideoPipeline`.
- Soporte de prompt negativo para descartar artefactos (por ejemplo, "worst quality, inconsistent motion, blurry, jittery, distorted").
- Generación determinista mediante semilla (`CppStdGenerator`).
- Encadenamiento de ventanas para vídeos largos: el autor generó un vídeo de 385 fotogramas (15,4 s) encadenando una ventana de text-to-video con siete de image-to-video a partir del último fotograma de cada una.
- Ejecución en CPU sin GPU.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni otros idiomas distintos del usado en los prompts de ejemplo (inglés).

## Casos de uso

- Generación de vídeo en servidores sin GPU: el modelo se ejecuta íntegramente en CPU con OpenVINO GenAI, lo que permite incorporar text-to-video en infraestructura de propósito general donde no hay aceleradores dedicados.
- Creación de clips cortos para prototipado: con 25 fotogramas y 8 pasos a 512x320 se obtiene un clip en unos 576 s con 15,98 GB de RAM pico, un coste asumible para pruebas de concepto y validación de ideas creativas.
- Iteración sobre image-to-video: partiendo de un fotograma existente, el pipeline `Image2VideoPipeline` permite animar ilustraciones o fotografías y mantener la coherencia visual con la imagen de origen.
- Vídeos de mayor duración por encadenamiento de ventanas: la técnica de generar una ventana y continuar desde su último fotograma permite construir secuencias de varios segundos (385 fotogramas, 15,4 s en la prueba del autor) sin cambiar de modelo.
- Investigación sobre eficiencia en CPU: el repositorio sirve como referencia reproducible para medir memoria y latencia de decodificación de vídeo en procesadores Intel, que es el propósito declarado del proyecto LongVid-OV.
- Despliegue en entornos con memoria acotada: con un pico de 16,26 GB para 49 fotogramas y 20 pasos, cabe en máquinas de 32 GB de RAM sin GPU, lo que facilita su uso en estaciones de trabajo convencionales.
- Evaluación de cuantización INT8 en modelos de difusión de vídeo: la métrica de 52,8 dB PSNR del VAE decoder permite estudiar el impacto de la compresión de pesos en la calidad de reconstrucción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, VBench u otros) en la información disponible. El autor sí publica mediciones de rendimiento en hardware concreto: Kaggle, Intel Xeon a 2,20 GHz, 4 vCPU, 30 GB de RAM, OpenVINO 2026.5.1 nightly y OpenVINO GenAI 2026.5.1 nightly, con ejecuciones únicas.

| Ejecución | Fotogramas | Pasos | RAM pico | Tiempo de generación |
|---|---|---|---|---|
| Carga del pipeline | — | — | 1,32 GB tras la carga | 13,3 s |
| Text2Video 512x320 | 25 | 8 | 15,98 GB | 576 s |
| Text2Video 512x320 | 49 | 20 | 16,26 GB | 2.227 s |
| Image2Video 512x320 | 49 | 20 | 16,5 a 18,1 GB | unos 2.250 s |

| Métrica de calidad | Valor |
|---|---|
| PSNR del VAE decoder INT8 frente a FP32 | ≥ 52,8 dB |
| Comparación end-to-end INT8 frente a FP32 | no realizada por el autor |

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para ejecutarse en CPU. La memoria relevante es la RAM del sistema.
- RAM estimada: unos 1,32 GB tras cargar el pipeline; 15,98 GB de pico para 25 fotogramas y 8 pasos; 16,26 GB para 49 fotogramas y 20 pasos; entre 16,5 y 18,1 GB en image-to-video con 49 fotogramas y 20 pasos.
- CPU: probado en Intel Xeon a 2,20 GHz con 4 vCPU. No se documentan pruebas en otras CPU.
- GPU: no se documenta soporte ni rendimiento en GPU; el pipeline de ejemplo se instancia con el dispositivo `"CPU"`.
- ¿Cabe en hardware de consumo? No hay datos publicados sobre equipos de consumo; los requisitos de RAM (en torno a 16-18 GB de pico) son compatibles con estaciones de trabajo con 32 GB de RAM, pero el rendimiento en dichos equipos no está medido.
- Despliegue: OpenVINO GenAI (`Text2VideoPipeline`, `Image2VideoPipeline`), con descarga previa mediante `hf download rahmanbazarov/LTX-Video-int8-ov --local-dir LTX-Video-int8-ov`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 576 s para 25 fotogramas y 8 pasos; 2.227 s para 49 fotogramas y 20 pasos; unos 2.250 s para image-to-video con 49 fotogramas y 20 pasos, en el hardware indicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato / runtime | Cuantización | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LTX-Video-int8-ov (esta ficha) | 2B | OpenVINO IR / OpenVINO GenAI | INT8 asimétrico | 512x320 en las pruebas; 25-49 fotogramas por ventana | LTX-Video Open Weights License | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| Lightricks/LTX-Video (base) | 2B | diffusers | FP32 (original) | no disponible | LTX-Video Open Weights License | Hugging Face |
| Otras alternativas de text-to-video | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No se ha comparado la calidad del modelo INT8 con el FP32 original de extremo a extremo; la única métrica de fidelidad es el PSNR del VAE decoder (≥ 52,8 dB).
- Los tiempos de generación son elevados en CPU: más de 9 minutos para 25 fotogramas y más de 37 minutos para 49 fotogramas en el hardware medido.
- El consumo de RAM crece con el número de fotogramas y pasos; por encima de 49 fotogramas conviene usar el encadenamiento por ventanas.
- No hay datos sobre sesgos, alucinaciones visuales ni calidad multilingüe de los prompts; los ejemplos están en inglés.
- La licencia LTX-Video Open Weights License impone restricciones de uso recogidas en el párrafo 4 y el Anexo A, aplicables también a terceros que reciban el modelo. Las entidades con ingresos anuales de 10 millones de dólares o más necesitan una licencia comercial separada de Lightricks.
- Esta conversión no está realizada ni respaldada por Lightricks ni por Intel.
- El repositorio no tiene descargas ni likes en el momento de la consulta, por lo que no existe validación comunitaria de su funcionamiento.
- La exportación se hizo componente a componente porque el comando estándar `optimum-cli export openvino` agotaba la memoria en una máquina de 30 GB; conviene tener en cuenta esta limitación si se intenta reproducir el proceso.
- No se documenta soporte de GPU ni de otros aceleradores; el uso previsto es CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rahmanbazarov/LTX-Video-int8-ov
- Modelo base: https://huggingface.co/Lightricks/LTX-Video
- Licencia completa: https://huggingface.co/rahmanbazarov/LTX-Video-int8-ov/blob/main/LICENSE.txt
- Proyecto LongVid-OV: https://github.com/JustRahman/longvid-openvino
- Resultados de LongVid-OV: https://github.com/JustRahman/longvid-openvino/blob/main/docs/RESULTS.md
