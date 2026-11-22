# songLucasXXX/tiny-voca-zh

## Resumen

tiny-voca-zh es un modelo de síntesis de voz (text-to-speech) para chino mandarín de tan solo 4.545.355 parámetros, entrenado desde cero por el usuario songLucasXXX como adaptación comunitaria al chino de la arquitectura tiny-voca. Se trata de un modelo acústico de estilo FastSpeech2 con un sintetizador de forma de onda source-filter integrado, lo que significa que produce audio a 24 kHz directamente a partir del texto sin necesidad de un vocoder neuronal separado. Dispone de dos voces fijas, `F` (femenina) y `M` (masculina), y procesa la entrada mediante un front end específico para chino con un inventario de 115 símbolos.

El modelo aborda el problema de la síntesis de voz en chino con un coste computacional y de almacenamiento extremadamente reducido: los pesos ocupan 18,2 MB en float32, lo que permite inferencia en CPU y despliegue en dispositivos con recursos muy limitados. No contiene pesos preentrenados de otros modelos; el único uso de un modelo docente (`Qwen3-TTS-12Hz-1.7B`) fue la síntesis del audio de entrenamiento, no la inicialización de pesos.

Su relevancia actual radica en que demuestra que es posible obtener una inteligibilidad competitiva (CER del 2,16 % en un conjunto de evaluación fijo) con un modelo tres órdenes de magnitud menor que los sistemas TTS neuronales convencionales, a costa de limitaciones claras: solo dos voces, sin control de emoción ni estilo, y un ámbito de aplicación restringido a lectura de texto en chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastSpeech2-style (modelo acústico) con sintetizador de forma de onda source-filter integrado |
| Parametros totales | 4.545.355 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase; el código de inferencia divide oraciones/frases) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | chino (mandarín, `zh`) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, float32, 18,2 MB) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño tiny-voca: un modelo acústico de estilo FastSpeech2 que predice representaciones acústicas intermedias y las convierte en forma de onda mediante un sintetizador source-filter integrado, eliminando el vocoder neuronal independiente. El front end para chino se construye sobre cn2an, jieba y pypinyin, con un inventario de 115 símbolos que incluye rasgos de tono y acentuación, además de manejo basado en reglas de caracteres polifónicos (`zh_text.py`, `zh_annotate.py`). La salida es audio mono a 24 kHz.

El entrenamiento se realizó desde cero con 22.298 frases chinas diseñadas, sintetizadas por el modelo docente `Qwen3-TTS-12Hz-1.7B` (Apache-2.0) en 24.360 clips (~23,6 horas de audio a 24 kHz mono), posteriormente alineados por fuerza y calibrados en duración. La receta comprende 120.000 pasos en total: 104.000 de entrenamiento base más 16.000 de ajuste fino sobre un subconjunto de enfoque, siguiendo el recipe de tiny-voca (`train.py`). No se documenta uso de RLHF ni DPO; el pipeline es puramente supervisado sobre audio sintético.

## Capacidades

- Síntesis de voz en chino mandarín a partir de texto, con salida mono a 24 kHz.
- Dos voces fijas seleccionables: `F` (femenina) y `M` (masculina).
- Control de velocidad de habla (`--speed`, por defecto 1.0).
- Control de tono mediante desplazamiento en log F0 (`--pitch-shift`; 0,058 equivale aproximadamente a un semitono) y escalado del rango de tono (`--pitch-range`).
- Procesamiento de entrada de texto largo mediante `--text-file` y división automática en oraciones/frases en el código de inferencia.
- Front end dedicado con normalización de números (cn2an), segmentación (jieba), transcripción fonética (pypinyin), rasgos de tono y tratamiento de polifonía basado en reglas.
- Inferencia en CPU o GPU (`--device cpu` / `cuda`).
- No soporta tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento.

## Casos de uso

- Lectura de texto en chino en dispositivos embebidos: con 18,2 MB de pesos en float32 y 4,5 M de parámetros, el modelo puede ejecutarse en CPU en hardware de baja gama (Raspberry Pi, routers, wearables) para locutar notificaciones o contenido breve sin conexión a servicios en la nube.
- Audiolibros y lectura de documentos en mandarín: el CLI acepta `--text-file` y el código de inferencia divide el texto en oraciones y frases, lo que permite procesar documentos largos por fragmentos con una de las dos voces disponibles.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o aplicaciones de asistencia que necesiten convertir texto chino en voz con baja latencia y sin dependencia de red.
- Sistemas de anuncios y megafonía automatizada: generación de avisos pregrabados o dinámicos en chino (estaciones, aeropuertos, comercios) donde la variedad de voces no es crítica y prima el coste cero de inferencia.
- Prototipado e investigación en TTS de bajo coste: el repositorio incluye código completo de entrenamiento, inferencia y exportación (`src/tiny_voca/`), lo que lo convierte en una base reproducible para experimentar con arquitecturas source-filter y front ends para chino.
- Aprendizaje de idiomas: generación de pronunciaciones de referencia en mandarín con velocidad ajustable (`--speed`) y control de tono (`--pitch-shift`, `--pitch-range`) para practicar entonación y tonos.
- Pruebas de integración en pipelines de audio: al no requerir vocoder separado ni GPU, puede incorporarse como etapa de síntesis en flujos de generación de contenido o doblaje automatizado de bajo volumen.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados) sobre un conjunto de evaluación fijo de 64 frases (2 × 32, ambas voces), medidos con ASR Paraformer y tasa de error de caracteres (CER):

| Modelo | CER |
|---|---:|
| Estudiante (`F`+`M`) | 2,16 % |
| Estudiante voz `F` | 2,52 % |
| Estudiante voz `M` | 1,80 % |
| Docente (`Qwen3-TTS-12Hz-1.7B`) | 1,40 % |

Los resultados por frase están en `eval/cer_result.json` del repositorio. No se han publicado otros benchmarks (MOS, similitud de hablante, latencia o throughput) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; los pesos en float32 ocupan 18,2 MB, por lo que cualquier GPU con memoria disponible es suficiente.
- GPU recomendadas: no se especifican; el modelo es viable en cualquier GPU CUDA (incluidas GTX 1050, RTX 3060, RTX 4090, A100, H100) y también en CPU.
- Cabe holgadamente en GPU de consumo: sí, en todas las GPU de consumo actuales y en hardware integrado.
- Opciones de despliegue: inferencia nativa en PyTorch mediante `tiny_voca.infer` (API Python `load_model` / `speak_text` / `limit_peak` y CLI `python -m tiny_voca.infer`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Voces | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| tiny-voca-zh | 4,5 M | 2 (`F`, `M`) | 24 kHz mono | Apache-2.0 | Entrenado desde cero; front end chino; sin vocoder separado |
| tiny-voca (upstream, n4ze3m) | no disponible | no disponible | no disponible | no disponible | Proyecto base del que deriva esta adaptación |
| Qwen3-TTS-12Hz-1.7B (docente) | 1.700 M (aprox.) | no disponible | no disponible | Apache-2.0 | Usado solo para sintetizar el audio de entrenamiento; CER de referencia 1,40 % |

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la información proporcionada más allá de la comparación con el modelo docente.

## Limitaciones y advertencias

- La voz femenina puede pronunciar de forma ambigua algunas frases del tipo «写下一行字» (`xing` puede tender hacia `heng`/`hang`).
- El front end corrige varias debilidades de contexto de diccionario presentes en los datos de entrenamiento, pero algunos contextos de polifonía poco frecuentes siguen siendo imperfectos.
- Es un TTS de lectura con dos voces: no admite control de emoción ni de estilo.
- No divide automáticamente documentos largos más allá de la separación por oraciones/frases del código de inferencia.
- Todas las métricas CER son medidas basadas en ASR (Paraformer), no transcripciones humanas palabra por palabra, y están marcadas como no verificadas en el model-index.
- El entrenamiento se realizó íntegramente sobre audio sintetizado por un modelo docente, lo que puede introducir artefactos o sesgos acústicos heredados del docente.
- Es un modelo comunitario no oficial de la familia tiny-voca; no cuenta con el respaldo del autor del proyecto base.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse la atribución a tiny-voca (Muhammed Nazeem) y a `Qwen3-TTS-12Hz-1.7B` según `LICENSE` y `NOTICE.md`.
- El repositorio figura con 0 descargas y 0 likes, y un tamaño de 0,0 GB reportado, por lo que la adopción y el soporte de la comunidad son inexistentes en el momento de la ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/songLucasXXX/tiny-voca-zh
- Proyecto base tiny-voca: https://github.com/n4ze3m/tiny-voca
- Modelo upstream tiny-voca: https://huggingface.co/n4ze3m/tiny-voca
- Modelo docente: `Qwen3-TTS-12Hz-1.7B` (obtenido vía ModelScope; no se proporciona URL directa en la información disponible)
