# musetric/aname-mel-band-roformer-duality-onnx

## Resumen

Este repositorio contiene una exportación a ONNX del modelo **Mel-Band RoFormer Duality** de Aname, un sistema de separación de fuentes de audio especializado en aislar la pista vocal del acompañamiento instrumental. Lo publica el usuario `musetric` y está empaquetado específicamente para su runtime `packages/ai`, que ejecuta `onnxruntime-web` sobre **WebGPU** en el navegador, tanto en GPU de escritorio como de móvil. La licencia es Apache-2.0, la misma que la de los pesos originales de los que deriva.

A diferencia de un checkpoint de PyTorch al uso, este grafo es solo el **núcleo de la red neuronal**: recibe una representación STFT ya calculada y devuelve máscaras complejas por bin de frecuencia. El cálculo de STFT, iSTFT, el troceado en fragmentos y el empaquetado complejo corren en el host (WGSL y FFT en el navegador), por lo que no es un sustituto directo del modelo original. Las tablas de agrupación y promediado de las bandas mel van incrustadas dentro del grafo ONNX.

El modelo trabaja con una ventana de tiempo fija de T = 1100 tramas (unos 11 segundos a 44,1 kHz, estéreo), y los pesos están en fp16 con entradas y salidas en fp32. El repositorio ocupa aproximadamente 0,5 GB y se publicó según los metadatos el 25 de septiembre de 2026, con cero descargas y cero "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mel-Band RoFormer (transformer con atencion RoPE y descomposicion en bandas mel) |
| Parametros totales | Aproximadamente 228 M (estimacion derivada del fichero de pesos fp16 de 456 MB; el autor no publica la cifra oficial) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de tiempo fija T = 1100 tramas (unos 11 s a 44,1 kHz); no es una ventana de contexto textual |
| Tipos de cuantizacion | Pesos en fp16; entradas y salidas del grafo en fp32 |
| Idiomas soportados | No disponible (modelo de audio; no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset `ai.onnx` 23, IR 10) con fichero externo `.onnx.data`; sin import de `com.microsoft` |
| n_fft | 2048 |
| Salto (hop) | 441 |
| Frecuencia de muestreo | 44,1 kHz |
| Canales | Estereo |
| Bins de frecuencia | 1025 (2050 con la parte compleja) |
| Cabezas de atencion | 8 |
| Dimension del modelo | 384; capa intermedia de feed-forward de 1536 |
| Forma del tensor de puntuaciones | [60, 8, T, T] en fp16 (unos 1110 MiB con T = 1100) |

Ficheros del repositorio:

| Fichero | Tamano | SHA256 |
|---|---|---|
| `duality_core_t1100.onnx` | 9.946.083 B | `2f420979a600426417b48264785364cbd62d2d81d70037f99c62baffb837d96b` |
| `duality_core_t1100.onnx.data` | 456.274.828 B | `ba2a1daacde1608a57564c7bb24a3efe2f50388b2168143044019a6cbe3f21c6` |

## Arquitectura y entrenamiento

La arquitectura es un **Mel-Band RoFormer**: un transformer que opera sobre una representacion tiempo-frecuencia descompuesta en bandas de escala mel, con embeddings rotatorios (RoPE) para codificar la posicion temporal. El grafo exportado expone una unica entrada `stft_repr` de tipo float32 y forma `[1, 2050, T, 2]` (lote, frecuencia por parte compleja, tiempo, componente real/imaginaria) y una unica salida `masks` de la misma forma, con las mascaras complejas por bin ya agregadas y promediadas desde las bandas mel. Las tablas de agrupacion y promediado mel estan incrustadas en el grafo, de modo que el host no necesita activos laterales `/tables/*`. Esta exportacion es solo de inferencia: no sirve para reentrenar ni para cargarse directamente desde PyTorch.

La model card detalla varias decisiones de ingenieria para que el grafo funcione en GPU moviles mediante `onnxruntime-web`. La atencion se divide a lo largo del eje de consultas en bloques de 64 filas, porque el tensor de puntuaciones escrito de una sola pieza (`[60, 8, T, T]` en fp16, unos 1110 MiB con esta ventana) excede el limite practico de binding de storage-buffer de una GPU movil (~256 MiB), que en ese caso devuelve ceros de forma silenciosa. Dividir las consultas es exacto, ya que softmax normaliza cada fila sobre el eje de claves completo. La RMSNorm usa la operacion fusionada `ai.onnx::RMSNormalization` en fp16 con `epsilon = 1e-9`, cuyo kernel de WebGPU acumula la suma de cuadrados en f32 dentro del shader; el valor de epsilon es deliberadamente mayor que el `1e-12` de una RMSNorm en fp32 para evitar `+inf` y posteriores `NaN`. Los bloques feed-forward se ejecutan por trozos de filas y la proyeccion qkv fusionada se despliega en tres proyecciones, lo que reduce el tiempo de dispatch y la memoria pico en GPU.

No hay informacion disponible en los materiales proporcionados sobre el numero de tokens de audio usados en el entrenamiento, la composicion del dataset ni sobre si hubo etapas de RLHF o DPO. La model card indica explicitamente que **la procedencia de los datos de entrenamiento de los pesos originales no esta documentada**. Si se conoce que el modelo original fue ajustado con fragmentos de 15 s, mientras que esta exportacion usa una ventana estatica de ~11 s.

## Capacidades

- Separacion de fuentes de audio: aislamiento de la pista vocal y del componente instrumental a partir de una mezcla musical estereo.
- Procesamiento por mascaras espectrales: genera mascaras complejas por bin de frecuencia que el host aplica sobre la STFT y luego invierte mediante iSTFT.
- Inferencia en navegador y en el borde: disenado para ejecutarse via `onnxruntime-web` sobre WebGPU, sin necesidad de servidor.
- Compatibilidad con GPU moviles: incluye optimizaciones especificas (troceado de atencion y de feed-forward) para evitar los limites de binding de storage-buffers en dispositivos moviles.
- Entrada y salida con forma estable: firma fija `[1, 2050, T, 2]`, lo que facilita integrarlo en pipelines con troceado propio.
- No soporta: generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, function calling, agentes, multi-step reasoning ni capacidades multilingues. Es un modelo puramente audio-a-audio.
- No dispone de modo "thinking", ni entrada/salida de audio crudo, ni conversion texto-voz o voz-texto.

## Casos de uso

- **Aplicacion web de karaoke**: el modelo puede separar la voz del acompañamiento directamente en el navegador del usuario mediante WebGPU, sin subir la cancion a un servidor, lo que reduce costes de infraestructura y mejora la privacidad.
- **Edicion de audio en el navegador (DAW ligero)**: aislar stems de voces e instrumental para remezclar, silenciar o realzar pistas sobre la mezcla original en tiempo casi interactivo.
- **Preprocesado de pipelines de reconocimiento de voz**: extraer la pista vocal antes de enviarla a un sistema ASR, mejorando la relacion senal-ruido en grabaciones musicales o con ruido de fondo.
- **Generacion de stems para productores y DJs**: obtener pistas separadas (a capela y base instrumental) de forma local en el portatil, sin depender de servicios en la nube.
- **Practica musical con pistas de acompanamiento**: eliminar la voz de una grabacion para generar una base sobre la que tocar o cantar, ejecutandose en el propio dispositivo.
- **Procesamiento en el borde y en movil**: inferencia en GPU de telefonos (por ejemplo, Adreno 660) directamente en el navegador, util para aplicaciones de audio sin conexion.
- **Creacion de datasets de audio**: generar pares voz/instrumental etiquetados para entrenar otros modelos de separacion o de reconocimiento musical.
- **Aplicaciones sensibles a la privacidad**: todo el procesamiento permanece en el cliente, evitando que el audio del usuario salga del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No se dispone de cifras de SDR, SIR ni SAR para ninguna de las pistas de evaluacion habituales (MUSDB18 ni similares), ni comparaciones cuantitativas con otros modelos de separacion en los materiales proporcionados.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos ocupan unos 456 MB en fp16. El grafo esta disenado para mantener baja la memoria pico (la atencion troceada reduce el tensor de puntuaciones de ~1110 MiB a ~64,5 MiB, y un "island" en fp32 para la RMSNorm habria costado 387 MiB adicionales que se evitan). Como estimacion derivada, el consumo pico deberia situarse aproximadamente entre 0,6 y 1 GB, aunque no hay una cifra oficial publicada.
- **GPU compatibles**: cualquier GPU con soporte de WebGPU. La model card cita explicitamente la Adreno 660 (GPU movil) como referencia de rendimiento; tambien son adecuadas GPU de escritorio y de portatil con WebGPU, como las series RTX, las GPU integradas modernas y los chips Apple de la familia M. No se mencionan A100 ni H100 porque el objetivo del modelo es la inferencia en cliente, no en servidor.
- **Compatibilidad con GPU de consumo**: si, esta pensado para GPU de consumo y de movil; cabe en la mayoria de GPU integradas y discretas con WebGPU.
- **Limite importante**: un binding de storage-buffer movil deja de funcionar por encima de 256 MiB independientemente del limite que declare el adaptador, por lo que la ejecucion depende de mantener los tensores pico por debajo de ese umbral.
- **Opciones de despliegue**: `onnxruntime-web` con el execution provider de WebGPU (la libreria declarada es `onnxruntime`). El modelo no es un checkpoint de PyTorch, asi que no se puede cargar directamente en vLLM, TGI, llama.cpp u Ollama. El host debe implementar la STFT, la iSTFT, el troceado y el empaquetado complejo (codigo de `packages/ai` de `musetric`).
- **Latencia y throughput**: la model card reporta que, sin trocear, un bloque feed-forward se ejecuta como un unico dispatch ininterrumpible de 546 ms en una Adreno 660, y que veinticuatro de esos mas otros veinticuatro de 361 ms suponen el 43 % de una ventana dentro de 48 de sus 1938 dispatches. No se proporciona la latencia total por ventana ni el throughput agregado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `musetric/aname-mel-band-roformer-duality-onnx` (este) | Mel-Band RoFormer | ~228 M (estimado) | ONNX fp16 + `.onnx.data` | Apache-2.0 | Export de solo inferencia, optimizado para WebGPU; nucleo sin STFT/iSTFT |
| `Aname-Tommy/Mel-Band-Roformer_Duality` | Mel-Band RoFormer | No disponible | Pesos PyTorch | Apache-2.0 | Modelo original del que deriva esta exportacion; ajustado con fragmentos de 15 s |
| `musetric/vocal-separation-roformer-onnx` | RoFormer | No disponible | ONNX | No disponible | Modelo anterior de `musetric`, con el mismo transformer y una cabecera de mascara mas grande; las formas coinciden |
| Demucs (htdemucs) | Arquitectura hibrida (convoluciones + transformer) | No disponible | Pesos PyTorch (y conversiones de la comunidad) | MIT (segun su publicacion habitual) | Alternativa ampliamente usada en separacion de fuentes; no comparable directamente en formato ni en despliegue WebGPU |

No se dispone de datos de rendimiento (SDR/SIR/SAR) para ninguno de estos modelos en la informacion proporcionada, por lo que la comparacion se limita a arquitectura, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- **Ventana de tiempo fija**: la exportacion funciona con una unica ventana estatica T = 1100 (unos 11 s), redondeada a un multiplo de cuatro. El modelo original se ajusto con fragmentos de 15 s, por lo que existe un desajuste entre el entrenamiento y la ventana de inferencia.
- **No es autonomo**: no sirve para uso independiente. Requiere un host que calcule la STFT de entrada, aplique las mascaras por bin y ejecute la iSTFT; sin ese codigo (por ejemplo, `packages/ai` de `musetric`) el grafo no produce audio util.
- **Solo inferencia**: no se puede usar en otros frameworks de entrenamiento ni como punto de partida para reentrenar.
- **Procedencia de datos no documentada**: el autor indica que la procedencia de los datos de entrenamiento de los pesos originales es desconocida, lo que impide evaluar sesgos o cobertura del dataset musical.
- **Riesgo de artefactos y alucinacion espectral**: como todo modelo de separacion de fuentes, puede introducir artefactos, sangrado entre pistas o mascaras imprecisas en pasajes con instrumentacion densa; no hay evaluacion publicada que cuantifique este riesgo.
- **Dependencia de WebGPU**: la ejecucion esta ligada a `onnxruntime-web` y al execution provider de WebGPU; entornos sin soporte de WebGPU no podran ejecutarlo de la forma prevista.
- **Limite practico de memoria en movil**: los bindings de storage-buffer en GPU moviles fallan por encima de 256 MiB y devuelven ceros silenciosamente, por lo que cualquier modificacion del grafo que aumente los tensores pico puede romper la salida sin error visible.
- **Licencia**: Apache-2.0 permite uso comercial, pero se recomienda verificar la licencia y los terminos del modelo original (`Aname-Tommy/Mel-Band-Roformer_Duality`) antes de explotarlo en produccion.
- **Adopcion nula constatada**: el repositorio muestra cero descargas y cero "likes", por lo que no hay senales de uso en produccion ni validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/musetric/aname-mel-band-roformer-duality-onnx
- Modelo base (pesos originales): https://huggingface.co/Aname-Tommy/Mel-Band-Roformer_Duality
- Repositorio del runtime `musetric` (codigo del host, `packages/ai`): https://github.com/musetric/musetric
- Modelo anterior de referencia de `musetric`: https://huggingface.co/musetric/vocal-separation-roformer-onnx
- Referencia arXiv asociada en las etiquetas del modelo: https://arxiv.org/abs/2310.01809
