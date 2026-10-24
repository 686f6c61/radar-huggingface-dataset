# Autognosi/piper-en_US-ryan-high-int8

## Resumen

`Autognosi/piper-en_US-ryan-high-int8` es una variante cuantizada del voice model `en_US-ryan-high` del proyecto Piper (Rhasspy), un sistema de síntesis de voz neuronal (TTS) diseñado para funcionar íntegramente en local. El artefacto lo publica el usuario Autognosi como derivado del repositorio `rhasspy/piper-voices` (revisión `5041a7a49ae5b3a0f30e6837769eb03fdbb231bd`) y aplica cuantización INT8 dinámica, por canal, exclusivamente a las 36 convoluciones residuales del decodificador. El encoder, el predictor de duración y los cuatro upsamplers de convolución transpuesta permanecen en FP32.

El problema que aborda es acotado y muy específico: el modelo ONNX original contiene dos nodos `If` que el cargador de Vulkan rechaza, lo que impedía ejecutar la voz en la ruta Vulkan de `onnx-vulkan-rs`. Esta ficha sustituye esos nodos por `Squeeze` (una transformación específica de este modelo, no soporte general de flujo de control) y reduce el tamaño del fichero un 25,65 % (de 120.777.101 a 89.796.776 bytes), con una mejora de latencia del 16,40–17,49 % en las dos rutas Vulkan medidas sobre una RTX 4070.

Es relevante ahora solo en un contexto de experimentación: el propio autor lo etiqueta como `experimental` y advierte de que las comprobaciones numéricas estrictas en CPU y los umbrales de forma de onda INT8 predefinidos **no** se cumplieron. La validación se limita a tres frases en inglés, una comparación de escucha informal (sin estudio ciego ni MOS) y mediciones de latencia en un único equipo. No es un bundle de producción verificado numéricamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (TTS neuronal extremo a extremo de Piper), exportada a ONNX; encoder, predictor de duración y upsamplers en FP32, decodificador parcialmente INT8 |
| Parámetros totales | no disponible (el autor no publica el recuento; el ONNX FP32 de origen ocupa 120.777.101 bytes) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo TTS: entrada de IDs de fonemas, sin ventana de contexto textual) |
| Tipos de cuantización | INT8 dinámica per-channel (`QInt8`) sobre 36 nodos `Conv` del decodificador; resto del grafo en FP32. Sin calibración estática de activaciones |
| Idiomas soportados | inglés americano (`en`, `en_US`); voz única masculina «Ryan» |
| Licencia | MIT |
| Formato de pesos | ONNX (`en_US-ryan-high-vulkan-int8.onnx`) más configuración Piper adyacente (`en_US-ryan-high-vulkan-int8.onnx.json`); 89.796.776 bytes |
| Frecuencia de muestreo | 22.050 Hz, mono |
| SHA-256 del fichero INT8 | `baa5c6803e751951b44005ca8f8374c5e27659f420dc0da8f713d523fb8068f3` |
| SHA-256 del modelo de origen | `b3990d7606e183ec8dbfba70a4607074f162de1a0c412e0180d1ff60bb154eca` |
| Repositorio | 0,1 GB; 0 descargas y 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura subyacente es VITS, el modelo de TTS extremo a extremo que emplea Piper: un encoder de texto/fonemas, un predictor de duración, un bloque de alineamiento y un decodificador generativo con bloques residuales y upsamplers de convolución transpuesta que producen la forma de onda a 22.050 Hz. Esta publicación **no reentrena ni modifica el proceso de entrenamiento**: parte del ONNX oficial de Ryan high y solo altera el grafo y los pesos del decodificador. Por tanto, no hay datos nuevos sobre número de tokens, composición del dataset ni etapas de RLHF/DPO; la model card remite al `MODEL_CARD` original incluido en el repositorio para la atribución del dataset, que no se detalla en la información disponible.

La preparación tiene dos partes. Primero, una transformación estructural: los dos nodos `If` del grafo original comprueban si un eje estáticamente singleton vale uno; la inferencia de formas demuestra que los predicados son verdaderos, así que se sustituyen las ramas `then` por un `Squeeze` y se eliminan los predicados no usados. El FP32 resultante es bit-idéntico al original en CPU para las tres frases de evaluación (hash del FP32 preparado: `1ba04a13f3c02901cea1309cfbc7b1cab151f5dff94ea9d4fbd755dd6aeb715a`). Segundo, la cuantización: se seleccionan los 36 nodos `Conv` mediante sus bindings `dec.resblocks.{0..5}.convs{1,2}.{0..2}.weight` y se aplica `quantize_dynamic(..., per_channel=True, weight_type=QuantType.QInt8)` de ONNX Runtime, sin búsqueda de cuantización validada por dataset. El grafo final usa operadores estándar `DynamicQuantizeLinear` y `ConvInteger` y no incrusta shaders Vulkan. El script `prepare_quantize.py` reproduce el fichero INT8 byte a byte.

## Capacidades

- Síntesis de voz a partir de fonemas en inglés americano, con salida mono a 22.050 Hz y voz única de hablante «Ryan».
- Entrada/salida compatible con el voice model original de Piper (mismos inputs, outputs y frecuencia de muestreo), por lo que encaja en cualquier pipeline Piper que acepte el `.onnx.json` adjunto.
- Ejecución en GPU mediante la ruta Vulkan de `onnx-vulkan-rs` (selección automática de kernels) y también en CPU con ONNX Runtime.
- Aceleración selectiva: solo el decodificador está cuantizado, de modo que el resto del grafo conserva la precisión FP32.
- No soporta tool calling ni function calling.
- No soporta comportamiento de agente, razonamiento multi-paso ni planificación.
- No es multilingüe: únicamente inglés americano.
- No tiene visión, audio de entrada, modo «thinking» ni otras capacidades multimodales.
- No incluye clonación de voz, control de emoción ni cambios de hablante.

## Casos de uso

- **Investigación de kernels INT8 en Vulkan**: el escenario natural del artefacto es servir de banco de pruebas para `onnx-vulkan-rs`, comparando FP32 frente a INT8 con cargas de trabajo TTS reales y midiendo latencia por sentencia. La model card incluye el protocolo exacto (bloques alternos, 20 rondas emparejadas, primera iteración descartada, trabajo de GPU serializado) y es reproducible con `prepare_quantize.py`.
- **Lectura de textos en inglés en local con GPU discreta**: integrar el modelo en un lector de pantalla o en un generador de audiolibros en inglés que ya disponga de una GPU compatible con Vulkan, donde los ~58 ms por frase de 5,4 s de audio permiten sintetizar párrafos completos con una latencia despreciable para el usuario.
- **Preproducción de voz en pipelines de vídeo o podcast**: generar borradores de narración en inglés americano antes de recurrir a una locución humana, aprovechando el rendimiento de ~92× tiempo real medido en la RTX 4070 (dato derivado de 5,410 s de audio en 58,411 ms).
- **Sistemas de respuesta de voz interactiva (IVR) en inglés**: respuestas pregrabadas dinámicas para atención telefónica, con la ventaja de que el modelo funciona sin conexión y sin coste por petición; requiere GPU con Vulkan o aceptar la penalización de CPU descrita más abajo.
- **Asistentes domésticos autoalojados**: sustituir el voice model en una instalación de Home Assistant o similar que ya use Piper, cuando el hardware objetivo tenga soporte Vulkan y se busque reducir el tamaño del binario desplegado en un 25,65 %.
- **Pruebas de regresión A/B de cuantización en audio**: usar el par FP32/INT8 generado por el script para evaluar el impacto audible de la cuantización dinámica per-channel en un decoder TTS, con métricas objetivas (SNR, distancia log-espectral) y escucha comparativa.
- **Prototipado de TTS embebido**: útil como referencia de tamaño (~90 MB) para estudiar el encaje de un decoder cuantizado en dispositivos con memoria limitada, aunque en CPU el INT8 sea contraproducente (véase la sección de rendimiento).

## Benchmarks y rendimiento

Latencia de inferencia medida el 2026-10-24 en una NVIDIA RTX 4070 (driver 595.104.02) con AMD Ryzen 5 7600. Dos frases de 251 y 243 IDs de fonema producen 5,410 s y 5,433 s de audio; 40 mediciones retenidas por variante y frase. Tiempos en milisegundos, excluyendo carga de modelo, fonemización y codificación de audio:

| Configuración | Frase 1 (mediana) | Frase 2 (mediana) |
|---|---:|---:|
| FP32 preparado, Vulkan EP | 69,872 ms | 69,721 ms |
| INT8 (este fichero), Vulkan EP | 58,411 ms | 57,525 ms |
| FP32 preparado, Vulkan standalone | 68,534 ms | 68,243 ms |
| INT8 (este fichero), Vulkan standalone | 57,097 ms | 57,485 ms |
| FP32 preparado, CPU sin optimizar | 731 ms | 739 ms |
| INT8 (este fichero), CPU sin optimizar | 4.003 ms | 4.136 ms |

La cuantización reduce la latencia del Execution Provider Vulkan un 16,40 % y un 17,49 %, y gana las 20 rondas emparejadas en ambas frases y ambas rutas Vulkan. El tamaño del fichero baja un 25,65 %. El pico de almacenamiento en GPU del modo standalone es ligeramente **mayor** en INT8 (~287 MB frente a ~283 MB), no menor, y no equivale a VRAM total del dispositivo. En CPU la situación se invierte: INT8 tarda 4.003/4.136 ms frente a 731/739 ms en FP32.

Calidad numérica frente a la salida FP32 original en CPU (tres frases; la tercera produce 12,620 s de audio y todas las salidas tienen formas coincidentes, valores finitos y sin clipping):

| Frase | SNR Vulkan FP32 | SNR Vulkan INT8 | Distancia log-espectral INT8 |
|---|---:|---:|---:|
| 1 | 85,60 dB | 6,33 dB | 4,14 dB |
| 2 | 87,88 dB | 9,75 dB | 4,02 dB |
| 3 | 81,52 dB | 6,27 dB | no disponible (dato truncado en la información de origen) |

El autor declara que las comprobaciones numéricas estrictas en CPU y los umbrales de forma de onda INT8 predefinidos no se superaron, y que la evaluación de escucha fue informal (comparación A/B del propio usuario, sin estudio ciego ni MOS). No se han publicado resultados de benchmarks estándar (MOS, CMOS, WER de ASR sobre la salida) en la información disponible.

## Requisitos de hardware

- **VRAM**: el autor reporta un pico de almacenamiento en GPU de ~287 MB (INT8) frente a ~283 MB (FP32) en la ruta Vulkan standalone, sin contar buffers de trabajo ni el contexto del runtime. El fichero en disco son 89,8 MB.
- **GPU recomendadas**: RTX 4070 (medida), y en general cualquier GPU con driver Vulkan funcional y soporte en `onnx-vulkan-rs`; no hay datos publicados para A100, H100 u otras tarjetas.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU de consumo reciente; el cuello de botella es el soporte del runtime Vulkan, no la memoria.
- **CPU**: ONNX Runtime puede ejecutar el fichero, pero el INT8 resulta 5,4–5,6× más lento que el FP32 en CPU (4.003/4.136 ms frente a 731/739 ms). Para inferencia en CPU el autor recomienda explícitamente la voz FP32 original.
- **Opciones de despliegue**: ONNX Runtime (CPU o EP Vulkan) y `onnx-vulkan-rs` para la ruta Vulkan; requiere el `.onnx.json` adyacente y un fonemizador compatible con Piper. No aplica a vLLM, llama.cpp, Ollama ni TGI, que no ejecutan grafos TTS de este tipo.
- **Rendimiento**: ~57–58 ms por frase de ~5,4 s de audio en RTX 4070 con Vulkan, es decir, del orden de 92× tiempo real (cálculo derivado de los datos publicados). No hay cifras de throughput concurrente ni de latencia en otros equipos.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Precisión | Licencia | Rendimiento publicado |
|---|---|---:|---|---|---|
| `Autognosi/piper-en_US-ryan-high-int8` | VITS/Piper, ONNX, decodificador INT8 selectivo | 89,8 MB | INT8 dinámica per-channel en 36 Conv + FP32 resto | MIT | 57–58 ms/frase en RTX 4070 Vulkan; SNR 6,3–9,8 dB frente al FP32 original |
| `rhasspy/piper-voices` (`en_US-ryan-high`, FP32) | VITS/Piper, ONNX | 120,8 MB | FP32 | MIT | 68–70 ms/frase en RTX 4070 Vulkan; 731–739 ms/frase en CPU |
| `speaches-ai/piper-en_US-ryan-high` | Redistribución del ONNX de Piper | no disponible | no disponible | no disponible en la información consultada | no disponible |
| Otros motores TTS neuronales (p. ej. familias distintas a Piper) | — | — | — | — | no disponible: no se aportan datos comparables en la información consultada |

La comparación directa relevante es contra el voice model FP32 del que deriva: mismo grafo funcional, mismo sample rate y misma voz, con un 25,65 % menos de tamaño y un 16–17 % menos de latencia en Vulkan, a costa de una relación señal-ruido muy inferior frente a la referencia FP32.

## Limitaciones y advertencias

- **No es producción**: el autor lo etiqueta como artefacto experimental y afirma explícitamente que «no es un bundle verificado numéricamente». Los umbrales INT8 predefinidos y las comprobaciones numéricas estrictas en CPU no se cumplieron.
- **Degradación medible**: la SNR frente a la salida FP32 original cae a 6,33–9,75 dB (frente a 81–88 dB de la ruta FP32), con una distancia log-espectral de ~4 dB. Aunque la escucha informal del autor las consideró indistinguibles, no hay estudio ciego ni MOS que lo respalde.
- **Validación mínima**: tres frases en inglés, un único equipo (RTX 4070 + Ryzen 5 7600), escala de ruido cero (`[0,1,0]`). La salida con ruido por defecto no se ha comparado.
- **Rendimiento dependiente de la ruta**: la ventaja de latencia es específica de las rutas Vulkan medidas; en CPU el INT8 es claramente más lento. No extrapolar a otros backends sin medir.
- **Transformación no generalizable**: la eliminación de los nodos `If` es una cirugía manual específica de este grafo; no implica que `onnx-vulkan-rs` soporte flujo de control ONNX en general.
- **Cobertura lingüística y de voz**: solo inglés americano y una única voz masculina; sin control de emoción, velocidad granular ni clonación.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto libre, pero un TTS puede producir artefactos audibles, prosodia incorrecta o pronunciaciones erróneas en fonemas ambiguos o text normalization deficiente, sin mecanismo de verificación interno.
- **Licencia**: MIT permite uso comercial, pero el modelo deriva de `rhasspy/piper-voices` y del dataset original de la voz Ryan; conviene revisar la atribución incluida en el `MODEL_CARD` original antes de redistribuir o desplegar comercialmente.
- **Madurez comunitaria nula**: 0 descargas y 0 likes en el momento de la consulta; sin informes independientes de terceros.
- **Dependencia de herramientas**: requiere un fonemizador compatible con Piper y, para la ruta rápida, un runtime Vulkan concreto; el ecosistema estándar de serving LLM no sirve para este formato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Autognosi/piper-en_US-ryan-high-int8
- Modelo base (`rhasspy/piper-voices`, revisión fijada): https://huggingface.co/rhasspy/piper-voices/tree/5041a7a49ae5b3a0f30e6837769eb03fdbb231bd/en/en_US/ryan/high
- Configuración Piper original (`en_US-ryan-high.onnx.json`): https://huggingface.co/rhasspy/piper-voices/blob/v1.0.0/en/en_US/ryan/high/en_US-ryan-high.onnx.json
- Runtime Vulkan para ONNX: https://github.com/automataIA/onnx-vulkan-rs
- Redistribución del ONNX en speaches-ai: https://huggingface.co/speaches-ai/piper-en_US-ryan-high/blob/main/model.onnx
- Listado de voces de Piper (DeepWiki): https://deepwiki.com/rhasspy/piper/3.1-available-voices
- Catálogo de voces Piper en TTS.ai: https://tts.ai/voices/piper/
- Ejemplo de integración de la configuración en un proyecto de asistente: https://github.com/ObaidGits/kria-ai-assistant-desktop/blob/main/models/piper/en_US-ryan-high.onnx.json
