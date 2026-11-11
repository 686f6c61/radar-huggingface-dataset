# ggml-org-dev/tinyLFM3-Omni-for-testing-gguf

## Resumen

tinyLFM3-Omni-for-testing-gguf es una version deliberadamente mutilada y reducida del modelo multimodal LFM3-Omni-2B de Liquid AI, publicada por la organizacion ggml-org-dev con el unico proposito de servir como banco de pruebas de software. No es un modelo utilizable: sus salidas son incoherentes por diseno, y el propio autor lo advierte de forma explicita en la model card. Su valor es puramente instrumental, ya que conserva la arquitectura completa de LFM3-Omni (modelo de texto, codificador de audio, depthformer, codec de audio y codificador de vision) y, por tanto, ejercita las mismas rutas de codigo que el modelo real dentro de llama.cpp.

El modelo conserva la estructura multimodal del original pero con dimensiones drasticamente recortadas: el modelo de texto mantiene solo 4 de 24 capas, el codificador de audio 3 de 17, el depthformer 1 de 3 y el codificador de vision 2 de 14, ademas de reducir los tamanos ocultos, cabezas de atencion y dimensiones de FFN. El resultado es un artefacto de aproximadamente 34,5 millones de parametros, lo bastante pequeno para ejecutarse en integracion continua sin consumir recursos significativos.

Es relevante ahora unicamente en el contexto del desarrollo de llama.cpp y de herramientas derivadas (por ejemplo, servidores compatibles con la API de OpenAI), donde permite validar rutas de TTS, ASR, audio en tiempo real y entrada de imagen sin necesidad de descargar el modelo completo de 2B. Para cualquier uso real debe emplearse el modelo original LFM3-Omni-2B o su version GGUF publicada por ggml-org.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal derivada de LFM3-Omni (texto + audio + vision + depthformer + codec de audio), con capas y dimensiones recortadas |
| Parametros totales | 34.481.472 (segun safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q4_K, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0, etiquetada como "other") |
| Formato de pesos | GGUF (generado con convert_hf_to_gguf.py y finish_gguf.py) |

## Arquitectura y entrenamiento

El modelo es una copia modificada de LiquidAI/LFM3-Omni-2B. No se ha reentrenado: se ha obtenido mediante un script de slicing (`slice_lfm3omni.py`, basado en la skill `slice-model` de llama.cpp) que recorta capas y dimensiones del safetensors original, y despues se ha convertido a GGUF. Los recortes documentados son: modelo de texto con 4 de 24 capas (0, 2, 3, 4), hidden size de 2048 a 256, 16 a 2 cabezas, KV heads de 4 a 1 y FFN de 7680 a 256; codificador de audio con 3 de 17 capas (0, 2, 3) y FFN de 1792 a 256; depthformer con 1 de 3 capas, hidden size de 1024 a 128, 32 a 4 cabezas, KV heads de 8 a 1 y FFN de 2816 a 256; codec de audio con las 8 capas completas (el loader las exige) y FFN de 2304 a 256; y codificador de vision con 2 de 14 capas (0, 2), hidden size de 1024 a 256, 16 a 4 cabezas, KV heads de 8 a 2, FFN de 2560 a 256 y proyector de 4096 a 256.

El script `finish_gguf.py` aplica la cuantizacion a Q2_K, Q4_K y Q4_0 y anade la plantilla de chat `asr` de LFM3-Audio, ausente en el modelo original, lo que habilita la ruta de transcripcion en vivo (`/v1/realtime?intent=transcription`) para pruebas. No hay informacion sobre datos de entrenamiento, tokens, RLHF/DPO ni innovaciones de decodificacion, ya que el artefacto no se ha entrenado y hereda la arquitectura del modelo base sin sus pesos funcionales.

## Capacidades

- Generacion de texto: tecnicamente presente, pero produce salida incoherente por diseno (el autor lo describe como "gibberish").
- Razonamiento, codigo y matematicas: no evaluables ni utilizables en este artefacto.
- Entrada de audio: conserva las rutas de codificador de audio, depthformer y codec, lo que permite probar TTS y ASR en llama.cpp.
- Transcripcion en vivo: la plantilla `asr` anadida habilita la ruta `/v1/realtime?intent=transcription` para pruebas de software.
- Entrada de imagen: conserva el codificador de vision recortado y su proyector, suficiente para validar el flujo de imagen.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Integracion continua de llama.cpp: ejecutar pruebas automaticas de las rutas de audio, vision y texto sin descargar el modelo de 2B, gracias a sus ~34,5 M de parametros y su reducido tamano de repo.
- Pruebas de la ruta de transcripcion en tiempo real: validar el endpoint `/v1/realtime?intent=transcription` con la plantilla `asr` anadida, comprobando el cableado del servidor y el streaming de audio.
- Validacion de conversores GGUF: usar el artefacto como entrada para verificar `convert_hf_to_gguf.py` y `finish_gguf.py` con las cuantizaciones Q2_K, Q4_K y Q4_0.
- Pruebas de carga de modelos multimodales: comprobar que el loader de llama.cpp exige y carga correctamente las 8 capas del codec de audio y el resto de submodelos recortados.
- Desarrollo de clientes compatibles con la API de OpenAI: probar endpoints conversacionales y de audio contra un servidor local sin coste de inferencia relevante.
- Regresion de pipelines de TTS/ASR: detectar roturas en el manejo de tensores y plantillas de chat tras cambios en el codigo, con ejecuciones rapidas en maquinas modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la salida del modelo es incoherente y que no debe usarse mas alla de pruebas de software.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con ~34,5 M de parametros y cuantizaciones Q2_K/Q4_0, el peso de los tensores es del orden de decenas de megabytes, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; cualquier GPU compatible con llama.cpp (incluidas iGPU y CPU) es suficiente para las pruebas previstas.
- Cabe en GPU consumer: si, en la practica totalidad de tarjetas actuales, e incluso en CPU.
- Opciones de despliegue: llama.cpp y servidores derivados compatibles con la API de OpenAI (endpoints conversacionales y `/v1/realtime`); otras opciones no disponibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Proposito |
|---|---|---|---|---|---|
| tinyLFM3-Omni-for-testing-gguf | 34,5 M (recortado) | no disponible | texto, audio, vision | LFM Open License v1.0 | Pruebas de software (salida incoherente) |
| LiquidAI/LFM3-Omni-2B | 2B (aproximado, segun nombre) | no disponible | texto, audio, vision | LFM Open License v1.0 | Modelo multimodal funcional |
| ggml-org/LFM3-Omni-2B-GGUF | 2B (aproximado, segun nombre) | no disponible | texto, audio, vision | LFM Open License v1.0 | Version GGUF del modelo real para llama.cpp |

Los datos de parametros de las alternativas se deducen del nombre del modelo; el resto de especificaciones no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo produce salida incoherente por diseno; no debe emplearse para generacion real, atencion al cliente ni ninguna tarea productiva.
- Es una copia modificada y "damaged" del original; los pesos no corresponden a un modelo entrenado funcional.
- Sesgos conocidos: no disponibles, aunque al no generar texto coherente la evaluacion de sesgos carece de sentido.
- Riesgo de alucinacion: total, en la practica, al no existir capacidad de generar contenido fiable.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia: LFM Open License v1.0, heredada de LFM3-Omni-2B de Liquid AI; deben revisarse las condiciones de uso comercial en el archivo LICENSE del repositorio.
- Para produccion debe usarse LiquidAI/LFM3-Omni-2B o ggml-org/LFM3-Omni-2B-GGUF en su lugar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ggml-org-dev/tinyLFM3-Omni-for-testing-gguf
- Modelo original: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Version GGUF recomendada: https://huggingface.co/ggml-org/LFM3-Omni-2B-GGUF
- Script de slicing: slice_lfm3omni.py (incluido en el repositorio)
- Script de finalizacion: finish_gguf.py (incluido en el repositorio)
- Licencia: LICENSE (incluido en el repositorio)
- Repositorio de llama.cpp: no disponible en la informacion proporcionada
