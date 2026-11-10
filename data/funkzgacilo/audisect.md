# funkzgacilo/audisect

## Resumen

Audisect es una conversión a ONNX de HTDemucs 6S (Hybrid Transformer Demucs con seis fuentes), el modelo de separación de fuentes musicales desarrollado originalmente por Meta AI Research. El artefacto publicado por funkzgacilo no entrena un modelo nuevo: empaqueta los pesos de HTDemucs 6S en un grafo ONNX optimizado para ejecutarse en el navegador mediante ONNX Runtime Web con aceleración WebGPU. Su propósito es habilitar la separación de pistas (drums, bass, other, vocals, guitar, piano) íntegramente en el cliente, sin backend ni subida de audio a servidores.

El modelo trabaja sobre fragmentos estéreo de 7,8 segundos a 44,1 kHz con una entrada de forma fija `[1, 2, 343980]` y devuelve seis stems con forma `[1, 6, 2, 343980]`. Para audio más largo hay que procesar ventanas solapadas y aplicar crossfade entre ellas. El archivo pesa aproximadamente 142,8 MB y el repositorio completo ocupa 0,1 GB.

La relevancia actual radica en su formato: es una exportación lista para producción web, con constantes convertidas a float32, plegado de constantes (de 24.819 a 1.436 nodos) y pesos en float16 con nodos `Cast`. Esto reduce el coste de cómputo y el tamaño del grafo lo suficiente como para que un modelo de separación de fuentes de calidad de investigación funcione en un navegador de escritorio moderno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HTDemucs 6S (Hybrid Transformer Demucs, transformer híbrido con ramas temporal y espectral) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio fija de 343.980 muestras (7,8 s a 44,1 kHz) |
| Tipos de cuantizacion | pesos almacenados en float16 con nodos `Cast`; entrada/salida en float32 |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | ONNX (`htdemucs_6s_web.onnx`, 142.808.361 bytes) |

## Arquitectura y entrenamiento

HTDemucs combina un codificador/decodificador convolucional con capas de atención transformer que operan simultáneamente sobre el eje temporal y el eje de frecuencia (de ahí "Hybrid Transformer"). El modelo original separa la mezcla en seis fuentes mediante un esquema de máscaras sobre la representación tiempo-frecuencia, con una iSTFT para reconstruir las formas de onda. Esta build concreta no aporta información sobre el dataset de entrenamiento, el número de tokens ni el proceso de alineación (RLHF/DPO), que corresponden al trabajo original de Meta AI Research publicado en ICASSP 2023.

La innovación de esta exportación es puramente de ingeniería de despliegue: se convierten las constantes float64 de la iSTFT a float32 (ONNX Runtime Web no soporta `ConstantOfShape` en float64), se aplica plegado de constantes con las optimizaciones básicas de ONNX Runtime, reduciendo el grafo de 24.819 a 1.436 nodos, y se almacenan los pesos en float16 con nodos `Cast`. La verificación frente al modelo fuente sobre entrada aleatoria reporta un error RMS relativo de aproximadamente 3e-5.

## Capacidades

- Separación de fuentes musicales en seis stems: drums, bass, other, vocals, guitar, piano.
- Procesamiento de audio estéreo a 44,1 kHz con ventana fija de 7,8 s.
- Inferencia en navegador mediante ONNX Runtime Web y WebGPU.
- Ejecución local sin envío de audio a servidores (privacidad por diseño).
- Procesamiento por chunks solapados con crossfade para pistas de duración arbitraria (responsabilidad del integrador).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo audio-audio puro.

## Casos de uso

- Separación de stems en una web app sin backend: el modelo se carga en el navegador y procesa la mezcla localmente, eliminando costes de servidor y riesgos de privacidad al no salir el audio del dispositivo.
- Herramientas de práctica musical: un usuario aísla la pista de batería o de bajo para practicar sobre ella, aprovechando la salida de seis stems en una sola pasada.
- Karaoke y remixes caseros: extracción de la pista vocal para generar versiones instrumentales o para reutilizar voces en producción musical amateur.
- Edición de audio en estudios pequeños: aislamiento de guitarra o piano para retocar una interpretación sin necesidad de stems originales.
- Investigación y docencia en procesamiento de audio: el grafo ONNX optimizado sirve como referencia reproducible para estudiar separación de fuentes y despliegue web de modelos de audio.
- Integración en DAWs basadas en navegador o extensiones: al ser un artefacto ONNX con formas fijas, encaja en pipelines JavaScript/TypeScript con ONNX Runtime Web y WebGPU.
- Procesamiento por lotes en cliente para podcasts: separación de voz y música en fragmentos de 7,8 s con crossfade para limpiar grabaciones antes de publicarlas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una comprobación de fidelidad frente al modelo fuente: error RMS relativo de aproximadamente 3e-5 sobre entrada aleatoria.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el archivo ONNX pesa 142,8 MB, por lo que la huella de pesos en memoria es del orden de cientos de MB contando buffers intermedios.
- GPU recomendadas: no disponibles; el modelo está pensado para WebGPU en navegador, por lo que depende de la GPU del cliente.
- Compatibilidad con GPU de consumo: plausible en equipos de escritorio con WebGPU habilitado, pero no hay datos publicados de compatibilidad ni de rendimiento por modelo de GPU.
- Opciones de despliegue: ONNX Runtime Web (WebGPU) es el objetivo principal; ONNX Runtime nativo (CPU/GPU) es una alternativa no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Fuentes | Licencia | Formato |
|---|---|---|---|---|---|
| Audisect (HTDemucs 6S ONNX) | no disponible | 7,8 s a 44,1 kHz | 6 | MIT | ONNX (float16) |
| StemSplitio/htdemucs-6s-onnx | no disponible | no disponible | 6 | no disponible | ONNX (fp16) |
| HTDemucs original (facebookresearch/demucs) | no disponible | configurable | 4 o 6 según variante | MIT | PyTorch |

La comparación con otros separadores (Demucs v4 de cuatro fuentes, Spleeter, Open-Unmix) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Ventana de audio fija de 7,8 s: el integrador debe trocear el audio y aplicar crossfade; un mal solapamiento produce artefactos audibles en las uniones.
- Entrada estéreo obligatoria a 44,1 kHz: audio mono o con otra frecuencia de muestreo requiere remuestreo y duplicación de canal previos.
- Calidad de separación no verificada con métricas objetivas (SDR, SIR) en esta build; solo se reporta fidelidad numérica frente al modelo fuente.
- Riesgo de artefactos en pasajes densos o instrumentos poco representados en el entrenamiento original; el stem "other" agrupa el resto de fuentes y puede mezclar contenido.
- Dependencia de WebGPU en el navegador: sin soporte o con drivers problemáticos, el rendimiento puede degradarse o fallar.
- Licencia MIT permite uso comercial, pero se recomienda conservar la atribución a Meta AI Research y a la exportación original de StemSplit.
- No hay información sobre sesgos, idiomas ni evaluación cualitativa por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/funkzgacilo/audisect
- Aplicación Audisect: https://audisect.funkz.app
- Modelo fuente ONNX: https://huggingface.co/StemSplitio/htdemucs-6s-onnx
- Exportación ONNX de StemSplit: https://github.com/StemSplit/demucs-onnx
- Repositorio original de Demucs (Meta AI Research): https://github.com/facebookresearch/demucs
- Paper: Rouard, Massa, Défossez, *Hybrid Transformers for Music Source Separation*, ICASSP 2023 (enlace no disponible en la información proporcionada)
