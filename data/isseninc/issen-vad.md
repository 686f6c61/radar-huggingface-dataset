# isseninc/issen-vad

## Resumen

ISSEN VAD es un detector de actividad de voz (VAD) en streaming, con arquitectura derivada de Mamba2 y construido a partir de `inworld/sava` mediante cuantización QInt8 y exportación a ONNX. Lo publica el usuario `isseninc` bajo licencia Apache-2.0. Su rasgo diferencial es que opera con lookahead cero (causal, emite una probabilidad de voz cada 40 ms sin esperar muestras futuras) y sin dependencia de PyTorch: la inferencia se ejecuta con `onnxruntime` y `numpy`, lo que simplifica el despliegue en producción y en entornos con recursos limitados.

El modelo resuelve un problema clásico en pipelines de audio: decidir de forma fiable y barata en cómputo cuándo hay voz en una señal, incluyendo condiciones adversas como reverberación, ruido de fondo, audio telefónico de banda estrecha, música y efectos en cine, o ruido ambiental no humano. Según la model card, alcanza el mejor rendimiento agregado entre los VAD en streaming de pesos abiertos con lookahead cero, por delante de Silero VAD v6.2.1, FireRedVAD Stream, Inworld SAVA, FunASR FSMN-VAD, TEN-VAD y WebRTC VAD en cinco suites de evaluación públicas.

El artefacto principal es un fichero ONNX de 18,6 MB que recibe tramas de 640 muestras (40 ms) a 16 kHz en `float32` mono y devuelve una probabilidad de voz en el rango [0, 1]. El estado por stream activo es de 528 KB, un 4,2× menor que el modelo base SAVA, y la latencia por trama es de aproximadamente 0,41 ms en un Apple M5 y 1,09 ms en un Intel Xeon Granite Rapids con un solo hilo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Mamba2 (modelo base `inworld/sava`), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (streaming causal por tramas de 40 ms, sin ventana de contexto de texto) |
| Tipos de cuantizacion | QInt8 (artefacto publicado en ONNX) |
| Idiomas soportados | en, es, fr, de, pt, it, ar, ja, ko, zh, hi, ru, tr, vi, multilingual (el VAD es agnóstico al idioma; la lista refleja los idiomas declarados) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`issen-vad.onnx`, 18,6 MB) |

## Arquitectura y entrenamiento

El modelo es una adaptación del VAD `inworld/sava`, cuya arquitectura se apoya en Mamba2 (modelo de espacio de estados) según las etiquetas del repositorio. ISSEN VAD se distribuye como grafo ONNX cuantizado a QInt8, lo que elimina la dependencia de PyTorch en tiempo de inferencia y reduce el tamaño del artefacto a 18,6 MB. La inferencia es estrictamente causal: procesa tramas de 640 muestras a 16 kHz y emite una probabilidad en cada trama de 40 ms sin lookahead. El estado recurrente por stream es de 528 KB.

La model card no detalla el número de tokens de audio, la composición exacta del dataset de entrenamiento ni si se aplicaron etapas de ajuste fino con RLHF o DPO (no aplicables en un VAD). Sí indica que la evaluación se realizó sobre benchmarks públicos estrictamente deduplicados respecto a los datos de entrenamiento, sin solapamiento de clips, hablantes ni grabaciones, y que el modelo base es `inworld/sava` con una variante cuantizada del mismo.

## Capacidades

- Detección de actividad de voz en streaming en tiempo real con lookahead cero (causal).
- Salida de probabilidad de voz continua en [0, 1] por cada trama de 40 ms.
- Rechazo de ruido no humano: 97,3 % de clips limpios en las 50 clases de ESC-50 con 0,37 % de falsos positivos por trama.
- Rechazo de sonidos humanos no vocales (tos, risa, estornudos, respiración): 97,6 % de clips limpios (41 de 42).
- Robustez ante condiciones acústicas adversas: reverberación, niveles bajos (-30 dB), ruido a 0 dB, banda telefónica y Bluetooth HFP (300–3400 Hz).
- Estabilidad ante deriva de estado: 0,00 % de falsos positivos durante 60 segundos de ruido estacionario.
- Ejecución en CPU sin GPU y sin PyTorch, solo con `onnxruntime` y `numpy`.
- Soporte de múltiples streams concurrentes con estado ligero (528 KB por stream).
- No se documentan capacidades de tool calling, agentes, visión ni audio generativo; es exclusivamente un clasificador de voz.

## Casos de uso

- Pasarelas de voz y asistentes por turnos: el VAD decide cuándo el usuario empieza y termina de hablar con latencia de 0 ms de lookahead y 0,41 ms por trama, lo que permite cortar la captura y activar el reconocimiento de voz sin esperas perceptibles.
- Detección de voz en telefonía y VoIP: el rendimiento en banda 300–3400 Hz (AUC 0,9495) y en Bluetooth HFP (8 kHz) lo hace adecuado para filtrar silencio antes de codificar o para controlar el envío de paquetes en llamadas.
- Reuniones y salas de conferencia con micrófono lejano: con AUC 0,9303 y F1 0,833 en AMI `sdm`, sirve para segmentar intervenciones en transcripción automática de reuniones y para diarización previa.
- Filtrado de audio en cine y contenido multimedia: con AUC 0,9265 en AVA-Speech (música y efectos intensos), permite separar diálogo de banda sonora en pipelines de subtitulado o doblaje.
- Reducción de coste en pipelines ASR: al descartar tramas sin voz (97,3 % de rechazo en ESC-50), reduce el cómputo enviado al reconocedor y el consumo en despliegues de gran volumen.
- Procesamiento en dispositivos y edge: al ejecutarse solo con `onnxruntime` y `numpy`, con 18,6 MB de disco y 0,41 ms por trama en Apple M5, cabe en portátiles, mini-PC y entornos embebidos sin acelerador.
- Monitorización de calidad de llamadas: los contadores de voz por trama permiten calcular ratios de actividad, silencios y solapamientos en grabaciones de contact center.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre cinco suites públicas retenidas, con rejilla de tramas de 40 ms. Comparativa con los VAD de referencia:

| Modelo | Licencia | Disco | RAM de estado | CPU 1 hilo / 40 ms (M5) | Grand AUC (4 suites) | PR-AUC multidsominio | Estrés 14 condiciones | VoxConverse test | AMI sdm (AUC / F1) | AVA-Speech | ESC-50 limpio (FP) | No humano | Banda 300–3400 | Deriva 15 s |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **ISSEN VAD** | Apache-2.0 | 18,6 MB | 528 KB | 0,41 ms (1,0 %) | **0,9451** | **0,9733** | **0,9587** | 0,9648 | **0,9303 / 0,833** | **0,9265** | **97,3 % (0,37 %)** | **97,6 %** | **0,9495** | **0,9753** |
| Silero VAD v6.2.1 | MIT | 2,2 MB | 1 KB | 0,08 ms (0,20 %) | 0,9169 | 0,9575 | 0,9103 | **0,9660** | 0,9226 / 0,741 | 0,8688 | 93,0 % (0,47 %) | 76,2 % | 0,8894 | 0,9402 |
| FireRedVAD Stream | Apache-2.0 | 2,3 MB | 64 KB | 9,44 ms (23,6 %) | 0,9096 | 0,9318 | 0,9062 | 0,9176 | 0,8931 / 0,595 | 0,9215* | 46,3 % (16,4 %) | — | 0,8605 | 0,9537 |
| Inworld SAVA (0 ms) | Apache-2.0 | 51,0 MB | 2.200 KB | ~1,85 ms (4,6 %) | 0,9090 | 0,9478 | 0,8808 | 0,9586 | 0,9211 / 0,734 | 0,8754 | 92,3 % (0,79 %) | — | 0,6349 | 0,8060 |
| FunASR FSMN-VAD | Apache-2.0 | 0,4 MB | 39 KB | 0,06 ms (0,16 %) | 0,9044 | 0,9431 | 0,8939 | 0,9658 | 0,8603 / 0,791 | 0,8977 | 24,3 % (22,4 %) | 11,9 % | 0,8702 | 0,9346 |
| TEN-VAD (16 ms) | Apache-2.0 + no competencia Agora | 0,3 MB | 16 KB | 0,36 ms (0,89 %) | 0,8989 | 0,9359 | 0,8790 | 0,9434 | 0,8936 / 0,775 | 0,8797 | 37,3 % (17,5 %) | — | 0,8306 | 0,9277 |
| WebRTC VAD (mode 2) | BSD-3-Clause | 0,05 MB | 1 KB | 0,003 ms (0,01 %) | 0,6485 | 0,6995 | 0,6844 | 0,5983 | 0,6846 / 0,685 | — | — | — | — | — |

Datos adicionales de la model card: precisión del 91,3 % con recall del 90 % en PR-AUC multidsominio, 5,9 puntos por delante del siguiente VAD en streaming; 0,00 % de falsos positivos en 60 segundos de ruido estacionario; latencia de 1,09 ms por trama en Intel Xeon Granite Rapids. El asterisco en FireRedVAD indica un dato marcado como tal en la fuente original.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU. El artefacto ONNX ocupa 18,6 MB en disco y el estado por stream 528 KB en RAM.
- GPU: no requiere GPU. No se documentan requisitos ni rendimiento en GPU.
- Consumer GPU: irrelevante para el caso de uso; funciona en cualquier CPU moderna sin acelerador.
- Despliegue: `onnxruntime` (runtime principal) con `numpy` como única dependencia numérica; no requiere PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un VAD.
- Latencia: ~0,41 ms por trama de 40 ms en Apple M5 con un hilo (1,0 % del presupuesto de tiempo real) y ~1,09 ms por trama en Intel Xeon Granite Rapids. En M5 esto deja margen para decenas de streams concurrentes por núcleo.
- Throughput: no se publica una cifra agregada de streams por núcleo; puede estimarse a partir de la latencia por trama y del estado de 528 KB por stream.

## Comparativa con modelos similares

| Criterio | ISSEN VAD | Silero VAD v6.2.1 | Inworld SAVA (0 ms) | TEN-VAD (16 ms) |
|---|---|---|---|---|
| Licencia | Apache-2.0 | MIT | Apache-2.0 | Apache-2.0 + no competencia Agora |
| Tamano en disco | 18,6 MB | 2,2 MB | 51,0 MB | 0,3 MB |
| RAM de estado | 528 KB | 1 KB | 2.200 KB | 16 KB |
| Lookahead | 0 ms | 0 ms | 0 ms | 16 ms |
| Grand AUC (4 suites) | 0,9451 | 0,9169 | 0,9090 | 0,8989 |
| PR-AUC multidsominio | 0,9733 | 0,9575 | 0,9478 | 0,9359 |
| Rechazo ESC-50 | 97,3 % | 93,0 % | 92,3 % | 37,3 % |
| Latencia CPU / 40 ms (M5) | 0,41 ms | 0,08 ms | ~1,85 ms | 0,36 ms |
| Dependencia de PyTorch | No | No | No | No |

ISSEN VAD lidera en precisión agregada y en rechazo de ruido, a costa de un artefacto mayor que Silero o TEN-VAD y de una latencia superior a Silero (0,41 ms frente a 0,08 ms), aunque muy por debajo del presupuesto de 40 ms. Frente a su modelo base SAVA, reduce el tamaño de 51,0 MB a 18,6 MB y el estado de 2.200 KB a 528 KB, con mejoras claras en banda telefónica (0,9495 frente a 0,6349) y en deriva de estado (0,9753 frente a 0,8060).

## Limitaciones y advertencias

- Solo detección de voz: no transcribe, no identifica hablantes ni genera audio; debe combinarse con un ASR o un sistema de diarización.
- Sesgos: la model card no documenta análisis de sesgo por acento, edad, género o idioma. Los benchmarks publicados cubren principalmente inglés (VoxConverse, AMI, AVA-Speech); el rendimiento en otros idiomas declarados no está cuantificado.
- Alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en condiciones no cubiertas por los benchmarks (por ejemplo, canto, susurros o voz muy degradada).
- Contexto: al ser causal y sin lookahead, no puede aprovechar muestras futuras; en audio con ataques de voz muy suaves puede retardar la detección respecto a VAD con ventana.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `inworld/sava` y de los datasets de evaluación citados si se redistribuyen.
- Dependencia de `onnxruntime`: el rendimiento depende de la versión del runtime y del backend de ejecución; no se documentan pruebas en GPU ni en aceleradores específicos.
- Madurez: el repositorio tiene 0 descargas y 2 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de adopción en producción ni de mantenimiento a largo plazo.
- Cuantización QInt8: puede introducir una pérdida de precisión frente al modelo base en dominios no representados en los benchmarks; no se publica una comparativa float frente a QInt8.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/isseninc/issen-vad
- Modelo base: https://huggingface.co/inworld/sava
- Artefacto ONNX: https://huggingface.co/isseninc/issen-vad/blob/main/issen-vad.onnx
- Curva precision-recall multidsominio: https://huggingface.co/isseninc/issen-vad/blob/main/assets/pr_curve_multidomain.png
- Comparativa de benchmarks: https://huggingface.co/isseninc/issen-vad/blob/main/assets/benchmark_bars.png
- Frontera de Pareto precision-latencia: https://huggingface.co/isseninc/issen-vad/blob/main/assets/performance_pareto.png
