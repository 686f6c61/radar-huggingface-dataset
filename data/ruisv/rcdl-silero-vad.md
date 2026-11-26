# ruisv/rcdl-silero-vad

## Resumen

`ruisv/rcdl-silero-vad` es una compilación del detector de actividad de voz (VAD) Silero VAD v6.2.3 de Silero Team, empaquetada como modelo RKNN (`.rknn`) listo para cargar en la NPU de los SoC Rockchip RK3588 y RK3588S. La publicación corre a cargo del autor `ruisv`, mantenedor de RCDL, una biblioteca C++17/Python para visión y voz en estas placas. El artefacto evita al usuario el paso de exportar a ONNX y de compilar con `rknn-toolkit2`: se entrega un binario fp16 ya generado con `rknn-toolkit2` 2.3.2 y validado contra el modelo en coma flotante.

El modelo resuelve un problema muy concreto: la detección de voz en tiempo real sobre hardware de bajo consumo, sin depender de CPU ni de frameworks pesados. Procesa fragmentos de 32 ms (512 muestras a 16 kHz más 64 de contexto) y devuelve una probabilidad de habla junto con el estado LSTM actualizado (`h`, `c` de 128 dimensiones), lo que permite segmentar audio en flujo continuo, tanto desde fichero como desde micrófono en vivo.

La relevancia práctica está en su coste: 0.83 ms por fragmento de 32 ms (factor de tiempo real 0.026) medido en una RK3588S con `librknnrt` 2.3.2 y driver NPU 0.9.8, con una desviación media de 0.0010 frente al modelo float y coincidencia del 100% en las decisiones voz/no voz. El fichero pesa 0.6 MB y la licencia MIT cubre tanto el código como los pesos, incluido uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Silero VAD v6.2.3 (red neuronal ligera con estado LSTM recurrente), compilada a RKNN para NPU Rockchip |
| Parametros totales | no disponible (el artefacto publicado pesa 0.6 MB en fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32 ms por fragmento (512 muestras a 16 kHz + 64 muestras de contexto previo); estado LSTM de 128 unidades persistente entre fragmentos |
| Tipos de cuantizacion | fp16 (única build publicada) |
| Idiomas soportados | no disponible (detección de voz independiente del idioma) |
| Licencia | MIT (código y pesos de Silero VAD); RCDL es Apache-2.0 |
| Formato de pesos | `.rknn` (fichero `silero_vad_16k_fp16_rk3588.rknn`) |

## Arquitectura y entrenamiento

El modelo subyacente es Silero VAD v6.2.3, un detector de actividad de voz recurrente que opera sobre el espectro de magnitud. La entrada del grafo compilado es `mag [1,129,4]` (magnitud STFT) junto con el estado LSTM `h` y `c` de forma `[1,128]`; la salida es `prob [1,1]` y el nuevo estado. El cálculo de la STFT se mantiene deliberadamente fuera del grafo RKNN: RCDL lo ejecuta en CPU con 64 muestras de contexto, 512 nuevas y 64 reflejadas, cortadas en cuatro tramas Hann periódicas de 256 muestras.

La decisión de excluir la STFT del grafo es técnica, no estética: dentro del grafo, elevar al cuadrado partes real e imaginaria sitúa los espectros de potencia en un rango de ~5000, y una build de precisión reducida pierde los bins de baja energía, provocando deriva de la probabilidad a mitad de frase. Alimentar la magnitud evita ese problema. No se dispone de información sobre el volumen de datos de entrenamiento original de Silero VAD ni sobre si hubo RLHF/DPO; esos detalles corresponden al proyecto upstream.

El segmentador de RCDL añade una capa de post-proceso con umbral 0.5, 250 ms para abrir segmento, 300 ms para cerrarlo, 30 ms de padding y 20 s máximo por segmento. Estos valores se ajustaron sobre sesiones AISHELL a 10 y 0 dB SNR con ruido MUSAN: no generan segmentos falsos sobre ruido puro y declaran el fin de habla una mediana de 0.36 s tras el silencio del hablante.

## Capacidades

- Detección de actividad de voz por fragmentos de 32 ms con probabilidad calibrada y estado LSTM persistente.
- Segmentación en flujo continuo: `seg.feed(block)` acepta audio de cualquier longitud a medida que llega y devuelve las locuciones cerradas en esa llamada.
- Funcionamiento con micrófono en vivo mediante el mismo objeto segmentador, sin cambios de API.
- Integración directa con reconocimiento de voz: el `pcm` de cada segmento está listo para el modelo `ruisv/rcdl-paraformer`.
- Ejecución en NPU RK3588/RK3588S como parte de un pipeline cero-copia con RGA y VPU gestionado por RCDL.
- Robustez frente a ruido: los umbrales por defecto se validaron a 10 y 0 dB SNR con ruido MUSAN.
- Independencia del idioma en la tarea de detección (no se publica lista de idiomas).
- No soporta tool calling, agentes, visión ni audio más allá del pipeline VAD descrito.

## Casos de uso

- Segmentación previa a ASR en dispositivos empotrados: el modelo corta el audio en locuciones y entrega cada `pcm` listo para `ruisv/rcdl-paraformer`, eliminando silencios antes de la transcripción y reduciendo el coste computacional del reconocedor.
- Asistentes de voz con activación por habla: `seg.feed(block)` sobre el flujo del micrófono permite abrir y cerrar turnos de captura en tiempo real con un coste de 0.83 ms por fragmento, imperceptible para el usuario.
- Puertas de audio en kioscos y paneles interactivos RK3588: el VAD filtra ruido ambiental y evita que el sistema procese audio sin habla, con cero segmentos falsos sobre ruido puro según las pruebas del autor.
- Transcripción de reuniones y notas de voz en grabadoras basadas en RK3588: la segmentación con padding de 30 ms y cierre a 300 ms produce cortes limpios que simplifican el post-proceso y la alineación temporal.
- Telefonía y atención al cliente en el borde: el VAD separa turnos de hablante en flujos de 16 kHz mono PCM16 antes de enviar solo los tramos con voz a un servicio remoto, reduciendo ancho de banda.
- Vigilancia y monitoreo de audio en dispositivos de bajo consumo: al ejecutarse en NPU con factor de tiempo real 0.026, permite procesar varios canales simultáneos o mantener la CPU libre para otras tareas del sistema.
- Preproceso en pipelines de datos de voz: filtrado automático de grabaciones largas para descartar tramos sin habla antes de entrenar o evaluar modelos de reconocimiento.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Latencia por fragmento de 32 ms (STFT + NPU + estado) | 0.83 ms |
| Factor de tiempo real | 0.026 |
| Desviacion media de probabilidad vs modelo float | 0.0010 |
| Desviacion maxima de probabilidad vs modelo float | 0.015 |
| Coincidencia en decisiones voz/no voz vs modelo float | 100% |
| Tiempo hasta declarar fin de habla (mediana) | 0.36 s tras el cese del hablante |
| Segmentos falsos sobre ruido puro | 0 |

Medido en RK3588S con `librknnrt` 2.3.2 y driver NPU 0.9.8, a través de `SileroVad` de RCDL y con los gobernadores por defecto de la placa. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a un detector de actividad de voz.

## Requisitos de hardware

- Hardware objetivo: SoC Rockchip RK3588 o RK3588S con NPU; el artefacto es específico de esa plataforma y no funciona en otras.
- VRAM/RAM: el fichero pesa 0.6 MB; el estado LSTM y los buffers de audio son despreciables, por lo que cabe holgadamente en cualquier configuración de placa.
- GPU: no aplica; la inferencia se ejecuta en la NPU integrada del SoC.
- Consumer GPU: no aplica; no es un modelo destinado a GPU de escritorio.
- Despliegue: mediante la biblioteca RCDL (`rcdl.SileroVad` y `rcdl.VadSegmenter`) sobre linux-aarch64, instalable desde el canal conda del autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Dependencias de runtime: `librknnrt` 2.3.2 y driver NPU 0.9.8 (versiones con las que se midió).
- Throughput: con 0.83 ms por fragmento de 32 ms, un solo núcleo NPU podría sostener en teoría decenas de flujos de audio en tiempo real; el autor no publica cifras de streams concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Plataforma | Licencia | Formato |
|---|---|---|---|---|---|
| `ruisv/rcdl-silero-vad` | no disponible (0.6 MB fp16) | 32 ms, 16 kHz | NPU RK3588/RK3588S | MIT | `.rknn` |
| Silero VAD v6.2.3 (upstream) | no disponible | 32 ms, 16 kHz | CPU / ONNX runtime | MIT | PyTorch / ONNX |
| WebRTC VAD | no disponible | tramas de 10/20/30 ms | CPU | BSD | C++ |
| Silero VAD (PyTorch, paquete oficial) | no disponible | 32 ms, 16 kHz | CPU/GPU | MIT | PyTorch |

La diferencia clave frente al Silero VAD upstream es el empaquetado: esta versión elimina la dependencia de ONNX runtime y de `rknn-toolkit2` en el dispositivo, y traslada la inferencia a la NPU con una latencia medida de 0.83 ms por fragmento. Frente a WebRTC VAD, el modelo de Silero es una red neuronal con estado, más robusta en condiciones de ruido, aunque no se dispone de comparación cuantitativa publicada entre ambos en esta información. No se dispone de datos de benchmarks comparativos con otras alternativas.

## Limitaciones y advertencias

- Específico de hardware: el `.rknn` solo se ejecuta en NPU Rockchip RK3588/RK3588S; no es portable a otras plataformas sin recompilar.
- Solo se publica build fp16; no hay variantes cuantizadas a int8 ni versiones para otros SoC Rockchip.
- La STFT debe calcularse fuera del grafo (en CPU, vía RCDL); integrar el modelo sin respetar ese contrato de entrada (magnitud `[1,129,4]` más estado `[1,128]`) degrada la precisión.
- Los umbrales por defecto del segmentador están ajustados a un dominio concreto (AISHELL con ruido MUSAN a 10 y 0 dB SNR); en otros entornos puede requerir ajuste vía `rcdl.VadConfig`.
- La latencia de cierre declarada (mediana 0.36 s tras el fin de habla) implica un retardo inherente en aplicaciones de respuesta inmediata.
- No se publica información sobre sesgos del modelo subyacente ni sobre su comportamiento en idiomas o acentos distintos de los usados en la validación.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos negativos o positivos en condiciones acústicas alejadas del entrenamiento.
- La licencia MIT cubre los pesos y el fichero compilado; RCDL se distribuye aparte bajo Apache-2.0, con términos independientes.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria independiente publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ruisv/rcdl-silero-vad
- Repositorio RCDL: https://github.com/ruisv/rcdl
- Scripts de compilación del modelo: https://github.com/ruisv/rcdl/tree/main/model_zoo/speech
- Contrato de entrada del modelo: https://github.com/ruisv/rcdl/blob/main/docs/MODELS.md#speech
- Silero VAD upstream: https://github.com/snakers4/silero-vad
- Modelo ASR complementario: https://huggingface.co/ruisv/rcdl-paraformer
- Fichero de pesos: https://huggingface.co/ruisv/rcdl-silero-vad/resolve/main/silero_vad_16k_fp16_rk3588.rknn
