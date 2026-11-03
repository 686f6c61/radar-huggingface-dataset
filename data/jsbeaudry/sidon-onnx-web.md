# jsbeaudry/Sidon-ONNX-web

## Resumen

Sidon-ONNX-web es una compilación optimizada del vocoder Sidon v0.1 (el decodificador DAC que convierte características de voz limpias en audio a 48 kHz) para su ejecución en el navegador mediante ONNX Runtime Web. Lo publica el usuario jsbeaudry y parte del export ONNX de soniqo/Sidon-ONNX, a su vez derivado del modelo original de sarulab-speech. El objetivo es claro: reducir el peso de descarga del vocoder de 210 MB (fp32) a 53 MB sin pérdida perceptible de calidad, de modo que un pipeline completo de restauración de voz pueda correr íntegramente en el cliente.

El modelo no genera voz desde cero ni transcribe: es una pieza de un pipeline de restauración y mejora del habla. Recibe las características log-mel de w2v-BERT 2.0 (SeamlessM4T) extraídas de audio a 16 kHz y devuelve una forma de onda a 48 kHz. Junto con el predictor int8 de soniqo, el navegador descarga 248 MB en total en lugar de 405 MB, lo que hace viable el despliegue web con WebGPU o WebAssembly.

Su relevancia actual radica en la combinación de tres factores: cuantización selectiva a int8 con matemáticas en fp32, plegado de weight norm en los pesos convolucionales y compatibilidad verificada con WebGPU, donde la variante fp16 de soniqo produce salida corrupta. Todo ello bajo licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vocoder DAC (decodificador convolucional) de Sidon v0.1 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (audio-to-audio; entrada [1, T, 160]) |
| Tipos de cuantización | int8 en 33 pesos convolucionales (una escala por canal de salida), matemáticas en fp32; existe variante fp32 de referencia (210 MB) |
| Idiomas soportados | no disponible (el vocoder es agnóstico al idioma; las pruebas se hicieron con criollo haitiano) |
| Licencia | MIT |
| Formato de pesos | ONNX (sidon-vocoder-int8.onnx, 53 MB) |

## Arquitectura y entrenamiento

El modelo es el decodificador DAC de Sidon v0.1, un vocoder convolucional que reconstruye la forma de onda a 48 kHz a partir de características log-mel de w2v-BERT 2.0 (SeamlessM4T) de audio a 16 kHz. No se ha reentrenado: las modificaciones son de exportación y compresión, aplicadas mediante el script `web_vocoder.py`. En concreto, se pliega el weight norm en pesos convolucionales planos (el original recalcula los pesos a partir de `weight_v` y `weight_g` en cada ejecución) y se almacenan 33 pesos convolucionales como int8 con una escala por canal de salida, reconvertidos a fp32 mediante `DequantizeLinear`. Toda la aritmética permanece en fp32, lo que evita los artefactos que la variante fp16 de soniqo presenta en WebGPU.

No se dispone de información sobre el dataset de entrenamiento original de Sidon v0.1, el número de tokens, la composición de los datos ni si hubo etapas de RLHF o DPO; esos detalles corresponden al modelo base de sarulab-speech y no se incluyen en la información proporcionada.

## Capacidades

- Restauración y mejora del habla: convierte características log-mel de w2v-BERT 2.0 en audio limpio a 48 kHz.
- Ejecución en navegador con ONNX Runtime Web sobre WebGPU y WebAssembly (wasm, con soporte multihilo).
- Compatibilidad con el predictor int8 de soniqo/Sidon-ONNX para formar un pipeline completo de restauración en el cliente.
- Salida determinista respecto a ONNX Runtime en CPU (correlación 1.000).
- Alta fidelidad respecto al vocoder fp32: correlación de forma de onda de 0.999 (SNR 28 dB).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto; es un componente audio-to-audio.

## Casos de uso

- Restauración de voz en el navegador: un editor web o una herramienta de grabación puede limpiar audio de forma local usando WebGPU, sin enviar las grabaciones a un servidor, lo que reduce latencia y protege la privacidad.
- Transcripción previa a ASR en aplicaciones web: al mejorar la señal antes de pasarla a un motor de reconocimiento, se recuperan palabras que un ASR pierde en audio degradado (en las pruebas, 281 de 284 palabras frente a 277 con fp32).
- Herramientas de accesibilidad: mejora de audio en tiempo casi real para usuarios con dificultades auditivas, con un clip de 20 segundos procesado en unos 3 segundos en WebGPU sobre un M3 Pro.
- Pódcast y contenido hablado en el cliente: normalización a −16 LUFS y limpieza de grabaciones domésticas directamente en una aplicación web, sin infraestructura de GPU en servidor.
- Prototipado e investigación en el navegador: permite evaluar pipelines de restauración de voz sin instalar dependencias locales, útil para demos y validación rápida.
- Aplicaciones offline-first: con WebAssembly y 4 hilos, un clip de 20 segundos tarda unos 12 segundos, lo que hace viable el procesamiento en dispositivos sin GPU dedicada.
- Despliegue con presupuesto de ancho de banda ajustado: los 248 MB totales del pipeline (predictor int8 más vocoder) frente a 405 MB con fp32 reducen la fricción de descarga en conexiones móviles.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre siete clips de voz en criollo haitiano de 20 segundos, procesados con el mismo pipeline (high-pass, características w2v-BERT, predictor int8, vocoder, −16 LUFS):

| Vocoder | Tamaño | UTMOS | DNSMOS overall | Similitud de hablante | Palabras reconocidas por ASR (284 originales) |
|---|---|---|---|---|---|
| fp32 (soniqo) | 210 MB | 2.341 | 3.286 | 0.794 | 277 |
| Este (int8) | 53 MB | 2.340 | 3.281 | 0.797 | 281 |

Datos adicionales: correlación de 0.999 con la forma de onda del vocoder fp32 (SNR 28 dB); correlación de 1.000 con la salida de ONNX Runtime en CPU. En un M3 Pro, un clip de 20 segundos tarda unos 3 segundos en WebGPU y unos 12 segundos en WebAssembly con 4 hilos, el mismo tiempo que fp32. El autor advierte que UTMOS está entrenado en inglés, por lo que sus valores deben leerse como comparación entre versiones y no como una nota absoluta.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el vocoder pesa 53 MB en disco y el pipeline completo 248 MB, por lo que la huella en memoria es reducida.
- GPU recomendadas: cualquier GPU compatible con WebGPU; las pruebas se realizaron en un Apple M3 Pro.
- Compatibilidad con GPU de consumo: sí, al ejecutarse en el navegador sobre WebGPU; como alternativa, WebAssembly con 4 hilos funciona sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime Web con execution providers `webgpu` o `wasm`; también es posible usar ONNX Runtime nativo en CPU o GPU.
- Latencia y throughput: aproximadamente 3 s por clip de 20 segundos en WebGPU (M3 Pro) y 12 s en WebAssembly con 4 hilos.

## Comparativa con modelos similares

| Modelo | Tamaño | Formato | Calidad (UTMOS) | Licencia | Ejecución en navegador |
|---|---|---|---|---|---|
| Sidon-ONNX-web (este) | 53 MB | ONNX int8 | 2.340 | MIT | Sí (WebGPU y wasm) |
| Vocoder fp32 de soniqo/Sidon-ONNX | 210 MB | ONNX fp32 | 2.341 | MIT | Sí, pero con mayor descarga |
| Vocoder fp16 de soniqo (carpeta int8/) | no disponible | ONNX fp16 | no disponible | MIT | Problemática en WebGPU (salida corrupta) |

## Limitaciones y advertencias

- No es un modelo generativo de voz ni un ASR: solo reconstruye audio a partir de características w2v-BERT; requiere el predictor y el extractor de características como piezas adicionales del pipeline.
- La evaluación se hizo con siete clips en criollo haitiano; no hay datos publicados sobre otros idiomas ni sobre dominios acústicos distintos.
- UTMOS está entrenado en inglés y no constituye una medida absoluta de calidad para otras lenguas.
- La variante fp16 de soniqo presenta salida corrupta en WebGPU; este modelo evita el problema manteniendo la aritmética en fp32, lo que limita la reducción de tamaño adicional.
- El rendimiento en WebAssembly depende del número de hilos disponibles en el navegador; con menos de 4 hilos la latencia aumentará.
- Licencia MIT: permite uso comercial, pero conviene conservar los avisos de copyright del modelo base y del export intermedio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; se trata de una publicación reciente y poco validada por la comunidad.
- No se dispone de información sobre sesgos del modelo base ni sobre su comportamiento con audio de baja calidad extrema.

## Enlaces

- HuggingFace: https://huggingface.co/jsbeaudry/Sidon-ONNX-web
- Modelo base original: https://huggingface.co/sarulab-speech/sidon-v0.1
- Export ONNX de referencia: https://huggingface.co/soniqo/Sidon-ONNX
- Repositorio de Sidon: https://github.com/sarulab-speech/Sidon
