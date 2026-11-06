# chumdz97/chumttsmodel

## Resumen

ChumTTS es un conjunto de activos de ejecución (runtime assets) publicado en Hugging Face por el usuario chumdz97 para la aplicación de escritorio ChumTTS. No se trata de un modelo de lenguaje generativo al uso, sino de un paquete de modelos de síntesis de voz (text-to-speech) en formato ONNX para vietnamita, junto con las bibliotecas de tiempo de ejecución CUDA necesarias para acelerar la inferencia en GPU. El repositorio ocupa 2,3 GB e incluye los ficheros `onnx/chumtts_*.onnx`, un archivo `gpu/ort-<version>-cuda13.zip` con las DLL de CUDA 13 y cuDNN 9 más el proveedor CUDA de ONNX Runtime, y un `manifest.json` con tamaños y sumas de verificación SHA-256 que la aplicación comprueba tras la descarga.

La relevancia de este repositorio es acotada: sirve como canal de distribución de binarios para una aplicación concreta, no como modelo abierto para investigación o integración genérica. La model card no documenta arquitectura, número de parámetros, datos de entrenamiento ni resultados de benchmarks, por lo que la evaluación técnica independiente queda muy limitada. Cualquier dato no presente en la información disponible se indica explícitamente como tal en esta ficha.

El modelo está etiquetado con licencia Apache 2.0 y soporta únicamente vietnamita (`vi`). La fecha de creación del repositorio (2026-10-07) y la de actualización (2026-11-03) aparecen en los metadatos, aunque no se especifica la versión concreta del modelo de voz incluida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelos TTS en formato ONNX; arquitectura interna no documentada) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica a TTS en el sentido habitual; no documentada) |
| Tipos de cuantización | no disponible (se distribuyen ficheros ONNX; no se detallan precisiones como FP32, FP16 o INT8) |
| Idiomas soportados | vietnamita (`vi`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/chumtts_*.onnx`); runtime CUDA en ZIP (`gpu/ort-<version>-cuda13.zip`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo de síntesis de voz. La model card únicamente describe el contenido del repositorio como activos de ejecución para la aplicación ChumTTS: ficheros ONNX con los modelos de voz para vietnamita, un paquete ZIP con las DLL de CUDA 13 y cuDNN 9 junto al proveedor CUDA de ONNX Runtime (requiere driver NVIDIA ≥ 580) y un manifiesto con tamaños y checksums SHA-256 para verificar la integridad de la descarga. No se detallan el número de tokens de entrenamiento, la composición del dataset, el corpus de voz utilizado, ni si hubo etapas de ajuste fino, destilación o entrenamiento con feedback humano.

Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal, vocoder concreto, modelado de prosodia o técnicas de clonación de voz. La única información técnica verificable es el formato de despliegue (ONNX con proveedor CUDA) y el requisito de versión de driver, lo que sugiere una inferencia acelerada por GPU mediante ONNX Runtime, pero sin más detalle sobre el grafo computacional.

## Capacidades

- Síntesis de voz (text-to-speech) para vietnamita a partir de texto de entrada.
- Ejecución mediante ONNX Runtime, con soporte de proveedor CUDA para aceleración en GPU NVIDIA.
- Verificación de integridad de los ficheros descargados mediante SHA-256 incluida en el manifiesto.
- Distribución empaquetada para integración en la aplicación de escritorio ChumTTS.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento (thinking mode).
- No se documenta capacidad multilingüe más allá del vietnamita.

## Casos de uso

- Síntesis de voz en aplicaciones de escritorio en vietnamita: el paquete ONNX está pensado para ser consumido por la app ChumTTS, que descarga los ficheros y verifica su integridad mediante el manifiesto SHA-256 antes de usarlos.
- Lectura de textos en vietnamita para accesibilidad: integración en lectores de pantalla o herramientas de asistencia que necesiten convertir texto a voz en ese idioma.
- Generación de audio para contenido localizado: creación de narraciones o locuciones en vietnamita para vídeos, cursos o materiales formativos, siempre que se respete la licencia Apache 2.0.
- Prototipado de interfaces de voz: uso del modelo ONNX con ONNX Runtime en entornos de desarrollo para validar flujos de TTS antes de pasar a producción.
- Despliegue en GPU NVIDIA con CUDA 13: aprovechamiento del paquete `gpu/ort-<version>-cuda13.zip` para acelerar la inferencia en máquinas con driver ≥ 580, útil en estaciones de trabajo con tarjetas dedicadas.
- Distribución controlada de binarios: el manifiesto con checksums permite a pipelines internos validar la descarga y evitar ficheros corruptos o manipulados antes de cargarlos en la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se documenta el tamaño del modelo ni la precisión de los ficheros ONNX).
- GPU recomendadas: no disponible; el paquete CUDA 13 / cuDNN 9 requiere driver NVIDIA ≥ 580, lo que implica tarjetas NVIDIA compatibles con CUDA 13.
- Compatibilidad con GPU de consumo: no confirmada; no se indica si el modelo cabe en tarjetas como RTX 4090, RTX 3090 o similares.
- Opciones de despliegue: ONNX Runtime con proveedor CUDA (según la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican directamente a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de TTS en vietnamita ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La model card no documenta arquitectura, parámetros, datos de entrenamiento ni evaluación, lo que impide auditar el modelo y valorar su calidad de forma independiente.
- Solo soporta vietnamita; no hay evidencia de capacidades multilingües.
- No se especifican sesgos conocidos, pero al no documentarse el corpus de entrenamiento no puede descartarse sesgo de voz, género, acento o registro.
- Riesgo de alucinación no aplicable en el sentido de LLM, pero sí posible en forma de prosodia incorrecta, pronunciación errónea o artefactos de audio no documentados.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de activos de una aplicación concreta conviene verificar que el uso previsto respeta las condiciones del proyecto ChumTTS y de las dependencias CUDA/cuDNN incluidas, que tienen sus propias licencias.
- El paquete CUDA 13 / cuDNN 9 exige driver NVIDIA ≥ 580; entornos con drivers anteriores no podrán usar la ruta GPU tal como se distribuye.
- No hay información sobre latencia, throughput ni calidad subjetiva (MOS), por lo que no se recomienda su uso en producción sin una evaluación previa propia.

## Enlaces

- Hugging Face: https://huggingface.co/chumdz97/chumttsmodel
