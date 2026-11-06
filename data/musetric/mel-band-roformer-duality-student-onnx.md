# musetric/mel-band-roformer-duality-student-onnx

## Resumen

El modelo `mel-band-roformer-duality-student-onnx` es una exportación a ONNX del modelo de separación de fuentes `mel-band-roformer-duality-student`, desarrollado por el usuario musetric. Se trata de un modelo destilado del Mel-Band RoFormer Duality de Aname, especializado en la separación de voces e instrumental en pistas musicales. La exportación está optimizada para inferencia en el navegador mediante `onnxruntime-web` con el backend WebGPU, lo que permite ejecutarlo tanto en GPUs de escritorio como en GPUs móviles.

El grafo ONNX contiene únicamente el núcleo de la red neuronal: recibe una representación STFT precalculada y devuelve máscaras complejas por bin de frecuencia. Las operaciones de STFT, iSTFT, troceado y empaquetado complejo se ejecutan en el host. Los pesos están en fp16, mientras que las entradas y salidas del grafo son fp32, con una ventana temporal estática de T = 1100 (aproximadamente 11 segundos).

Este repositorio se mantiene por compatibilidad con builds que lo fijan como dependencia; el proyecto Musetric ha migrado su modelo de separación principal a `mel-band-roformer-duality-kara2-student-onnx` desde el PR #1157. Es relevante para desarrolladores que necesitan separación de voces en el cliente sin depender de servidores, con un rendimiento entre 3,4 y 4,4 veces superior al núcleo del modelo profesor en los dos teléfonos medidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mel-Band RoFormer (transformer con atención por bandas mel), destilado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana temporal estática T = 1100 frames (~11 s a 44,1 kHz con hop 441) |
| Tipos de cuantizacion | fp16 en pesos, fp32 en E/S del grafo |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset ai.onnx 23, IR 10) con fichero externo `.onnx.data` |

## Arquitectura y entrenamiento

El modelo es un Mel-Band RoFormer, una variante de transformer diseñada para separación de fuentes musicales que opera sobre representaciones STFT y aplica atención organizada por bandas mel. La versión exportada es un estudiante destilado del modelo profesor Mel-Band RoFormer Duality de Aname, con una reducción de coste computacional que se traduce en una ventana de inferencia entre 3,4 y 4,4 veces más rápida que el núcleo del profesor en los dispositivos medidos.

La exportación ONNX incorpora varias reescrituras específicas: los pares agrupados se estructuran como un reloj de arena con promediado temporal selectivo (4 frames para los pares 2-3, 2 frames para los pares 4-5 y tasa completa al final); la atención temporal de los pares 0-1 se implementa como bloques de 64 queries sobre 128 claves con máscara constante que preserva exactamente las claves dentro de 32 frames; las mapas de banda de los pares 0-1 se reducen a un `MatMul` y un `Add`; y las atenciones temporales agrupadas se procesan en bloques de 32 filas de query. Además, las probabilidades por valores de las atenciones agrupadas se rellenan a múltiplos de 4 para corregir una degradación observada en el Adreno 750. Exportado en fp32, el grafo reproduce la salida del modelo PyTorch con 117,9 / 127,7 / 132,7 dB (peor / mediana / mejor), por lo que las reescrituras preservan la función y la pérdida del núcleo publicado se atribuye al redondeo fp16.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Separación de voces e instrumental en pistas musicales estéreo a 44,1 kHz.
- Inferencia en cliente y edge mediante WebGPU a través de `onnxruntime-web`, tanto en GPUs de escritorio como móviles.
- Procesamiento por ventanas de aproximadamente 11 segundos (T = 1100) con representación STFT precalculada en el host.
- Salida de máscaras complejas por bin de frecuencia, ya recolectadas y promediadas desde las bandas mel, listas para aplicar sobre la STFT.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de audio.
- No incluye modo thinking, visión ni audio de entrada directa; el audio debe preprocesarse a STFT fuera del grafo.

## Casos de uso

- Separación de voces para karaoke en el navegador: el modelo recibe la STFT de un fragmento de ~11 s y devuelve máscaras que, aplicadas en el host, permiten eliminar la voz principal de una canción sin enviar el audio a un servidor, gracias a la ejecución WebGPU en el cliente.
- Edición de audio en aplicaciones web: integración en DAWs o editores online para aislar la pista vocal o instrumental y aplicar procesado posterior (ecualización, compresión) sobre stems separados.
- Procesamiento en dispositivos móviles: al ejecutarse con `onnxruntime-web` sobre WebGPU y ser entre 3,4 y 4,4 veces más rápido que el núcleo del profesor en los teléfonos medidos, es adecuado para apps móviles que necesitan separación local sin conexión.
- Pipeline de preprocesado para transcripción musical: separar voces antes de alimentar un modelo de reconocimiento de letras o de transcripción, reduciendo la interferencia instrumental.
- Creación de contenido y remixes: extracción de stems vocales e instrumentales para remezclas, muestreo o producción musical en herramientas web colaborativas.
- Investigación en separación de fuentes: servir como referencia destilada y exportación ONNX para comparar latencias y calidad frente al modelo profesor en entornos de navegador.
- Prototipado de aplicaciones de audio en el edge: validar arquitecturas de separación en WebGPU sin infraestructura de servidor, con un grafo de 5,5 MB más 213 MB de datos de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta que el estudiante está 0,80 dB por debajo del profesor en la SDR mediana de las voces en MUSDB18-HQ, y que en los dos teléfonos medidos una ventana tarda entre 3,4 y 4,4 veces menos que con el núcleo del profesor. No se proporcionan cifras absolutas de SDR, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,2 GB y los pesos suman aproximadamente 218,8 MB (5.539.495 B del `.onnx` más 213.244.940 B del `.onnx.data`), por lo que la huella de memoria es moderada.
- GPU recomendadas: no se especifican modelos concretos; la model card menciona mediciones en Adreno 750, Adreno 660 y GPU de escritorio.
- Cabe en GPU consumer: sí, dado el tamaño reducido del grafo y los pesos en fp16.
- Opciones de despliegue: `onnxruntime-web` con backend WebGPU (caso principal documentado); otros entornos ONNX Runtime no se detallan en la información disponible.
- Latencia y throughput: no se publican cifras absolutas; solo la mejora relativa de 3,4 a 4,4 veces frente al núcleo del profesor en los dos teléfonos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mel-band-roformer-duality-student-onnx` (este) | no disponible | T = 1100 (~11 s) | 0,80 dB por debajo del profesor en SDR mediana de voces (MUSDB18-HQ); 3,4-4,4x más rápido que el núcleo del profesor en móvil | Apache-2.0 | Hugging Face, ONNX |
| `musetric/mel-band-roformer-duality-student` (PyTorch) | no disponible | no disponible | referencia del estudiante | Apache-2.0 | Hugging Face |
| `musetric/aname-mel-band-roformer-duality-onnx` (profesor) | no disponible | no disponible | referencia de calidad; más lento en móvil | no disponible | Hugging Face |
| `musetric/mel-band-roformer-duality-kara2-student-onnx` (sucesor) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- El modelo está 0,80 dB por debajo del profesor en la SDR mediana de las voces en MUSDB18-HQ, y pueden aparecer filtraciones tenues del profesor con mayor volumen del esperado.
- Ventana temporal estática de T = 1100 (~11 s); no admite longitudes variables sin troceado en el host.
- No es utilizable de forma autónoma: requiere un host que calcule la STFT de entrada, aplique las máscaras por bin y ejecute la iSTFT (véase `packages/ai` de Musetric).
- Es una exportación solo de inferencia; no sirve para entrenamiento. Los pesos PyTorch están en el repositorio base.
- El repositorio está mantenido por compatibilidad con builds que lo fijan; el proyecto ha migrado a `mel-band-roformer-duality-kara2-student-onnx`, por lo que no recibirá mejoras.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo profesor original del que se destila.
- No se documentan sesgos específicos ni riesgos de alucinación en el sentido lingüístico; al ser un modelo de audio, el riesgo principal es de artefactos o filtraciones en la separación.
- No se dispone de información sobre idiomas ni sobre el dataset de entrenamiento, lo que limita la evaluación de sesgos musicales o de género.

## Enlaces

- Hugging Face: https://huggingface.co/musetric/mel-band-roformer-duality-student-onnx
- Modelo base (PyTorch): https://huggingface.co/musetric/mel-band-roformer-duality-student
- Modelo profesor original: https://huggingface.co/Aname-Tommy/Mel-Band-Roformer_Duality
- Núcleo del profesor en ONNX: https://huggingface.co/musetric/aname-mel-band-roformer-duality-onnx
- Sucesor recomendado: https://huggingface.co/musetric/mel-band-roformer-duality-kara2-student-onnx
- Repositorio Musetric: https://github.com/musetric/musetric
- PR de migración: https://github.com/musetric/musetric/pull/1157
- Paper de referencia: arxiv:2310.01809
