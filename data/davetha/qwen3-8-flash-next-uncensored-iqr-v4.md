# davetha/qwen3.8-flash-next-uncensored-iqr-v4

## Resumen

Qwen3.8-Flash-Next Uncensored IQR-V4 es una cuantizacion de 4 bits del modelo orcarouter/Qwen3.8-Flash-Next-Uncensored, a su vez una variante "abliterated" (con el alineamiento de seguridad eliminado) de Qwen/Qwen3.8-Flash-Next. La publica el usuario davetha como un unico contenedor `.rad` de 112,85 GiB destinado al motor de inferencia radiance 2.1.0, optimizado para GPUs AMD RDNA4 con ROCm. Sigue la receta IQR-V4 de StillDeadcode, con una diferencia deliberada en la cuantizacion de los expertos enrutados.

El modelo conserva la arquitectura original del Qwen3.8-Flash-Next: un transformer con mezcla de expertos (MoE), cabeza MTP para decodificacion especulativa y torre de vision en bf16. La cuantizacion aplica codigos de 4 bits sobre una rotacion de Walsh-Hadamard de 128 puntos para los expertos, GPTQ con hessianos propios para el tronco y int8 rotado para el resto de proyecciones lineales. El resultado es un artefacto pensado para servir en produccion sobre hardware AMD de gama profesional.

Es relevante ahora porque demuestra el estado del ecosistema de cuantizacion para AMD: un formato propietario (`.rad`), un motor especifico (radiance), decodificacion especulativa con MTP y streaming de expertos desde memoria del host, todo sobre RDNA4. Tambien es un caso de estudio de las tensiones entre rendimiento, fidelidad de cuantizacion y eliminacion de alineamiento de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con cabeza MTP (decodificacion especulativa) y torre de vision |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 200.000 tokens segun la configuracion de servicio (`max-model-len: 200000`) |
| Tipos de cuantizacion | Expertos enrutados a 4 bits (codebook `w4nl` de 16 niveles, escala E4M3 por cada 64 pesos); tronco con GPTQ 5 bits (trellis) en query-gate e input de delta-net; int8 rotado en atencion, delta-net, expertos compartidos y proyecciones n-gram; lm_head int8; matrices hyper-connection E4M3; vision tower en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`license_name: qwen-community-1.0`) |
| Formato de pesos | contenedor `.rad` unico (112,85 GiB) para el motor radiance 2.1.0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) que incorpora una cabeza MTP (multi-token prediction) para decodificacion especulativa y una torre de vision que procesa entradas imagen-texto. El contenedor mantiene la cabeza MTP y la torre de vision en bf16, mientras que el tronco y los expertos se cuantizan de forma agresiva. La cuantizacion de expertos usa codigos de 4 bits sobre un codebook de 16 niveles tras una rotacion Walsh-Hadamard de 128 puntos, con una escala E4M3 por cada 64 pesos y busqueda de escala por minimo error (round-to-nearest). Los expertos "protegidos" (diez en total) permanecen en bf16.

El tronco se cuantiza con GPTQ contra hessianos calculados sobre 1,06 millones de tokens de calibracion con plantilla de chat: 40% UltraChat, 35% CodeFeedback y 25% Glaive de function-calling. El autor documenta un fallo de formato en radiance 2.1: el motor escribe los hessianos como `<stem>.input.safetensors` (triangulo superior empaquetado), pero libquant solo lee `gram.r<rank>.<linear>.bin` (RADGRAM2), de modo que sin ejecutar `calib_to_radgram.py` antes de `rad-convert` todos los pesos GPTQ del tronco se redondean silenciosamente a nearest. La diferencia principal frente a la receta original de StillDeadcode es que los expertos se cuantizan con round-to-nearest en lugar de GPTQ, porque los datos de calibracion por experto no estan publicados y radiance 2.1 solo registra el tronco. El autor advierte que la calidad esperada es ligeramente inferior a la IQR-V4 original en los expertos y aproximadamente equivalente a builds del estilo `fp8-iq4r-moe`; la divergencia KL frente a bf16 no se ha medido.

## Capacidades

- Generacion de texto y razonamiento general, heredados de Qwen3.8-Flash-Next.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`) mediante la torre de vision conservada en bf16.
- Decodificacion especulativa con la cabeza MTP (3 tokens especulativos en la configuracion medida).
- Function calling, segun el dataset de calibracion Glaive y las capacidades del modelo base.
- Generacion de codigo, con calibracion sobre CodeFeedback.
- Modo "thinking" configurable (la medicion de velocidad se hizo con thinking desactivado).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Alineamiento de seguridad sustancialmente eliminado (build abliterated): responde a peticiones que el modelo original rechaza.

## Casos de uso

- Servicio de inferencia de alto rendimiento sobre AMD RDNA4: el contenedor esta disenado para radiance 2.1.0 con TP4 sobre cuatro Radeon AI PRO R9700, alcanzando 245-301 tok/s en decodificacion de un solo flujo, lo que lo hace adecuado para despliegues en hardware AMD profesional.
- Procesamiento de documentos con imagen: la torre de vision en bf16 permite tareas de image-text-to-text como transcripcion, descripcion y extraccion de datos de capturas o formularios.
- Asistentes conversacionales de contexto largo: con `max-model-len` de 200.000 tokens y `max-num-seqs` de 32, puede gestionar sesiones multi-turno con historiales extensos.
- Generacion de codigo en pipelines internos: la calibracion sobre CodeFeedback y el soporte de function calling lo hacen utilizable en herramientas de autocompletado o revision, siempre que la politica de uso lo permita.
- Investigacion sobre cuantizacion y formatos: sirve como referencia reproducible para estudiar el impacto de round-to-nearest frente a GPTQ en expertos MoE y las diferencias entre contenedores `.rad` y otros formatos.
- Experimentacion con decodificacion especulativa: la cabeza MTP conservada permite medir la ganancia de tokens especulativos sobre distintos tipos de texto.
- Escenarios que requieren respuestas sin rechazo: el build abliterated esta pensado para casos donde el filtrado del modelo original resulta un obstaculo, bajo responsabilidad del operador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta mediciones de velocidad:

| Escenario | Tokens generados | Decodificacion |
|---|---|---|
| Relato corto (prosa) | 1.307 | 245 tok/s |
| Explicacion tecnica | 1.500 | 301 tok/s |

Medido en 4x Radeon AI PRO R9700 (32 GB, PCIe 4.0), TP4, `kv-cache-dtype: i8`, MTP con 3 tokens especulativos, un solo flujo y thinking desactivado. El autor indica que la ganancia de la decodificacion especulativa depende del texto.

## Requisitos de hardware

- VRAM: el contenedor ocupa 112,85 GiB en disco; con TP4 sobre 4x Radeon AI PRO R9700 (32 GB cada una, 128 GB en total) cabe con `host-pool-mib: 12288` y `gpu-headroom-mib: 768` para el streaming de expertos.
- GPU recomendadas: Radeon AI PRO R9700 (RDNA4, ROCm); el motor radiance esta orientado a AMD RDNA4.
- GPU de consumo: no disponible; no se documenta funcionamiento en GPUs consumer.
- Despliegue: exclusivamente mediante el motor radiance 2.1.0 (imagen `stilldeadcode/radiance:2.1.0`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Almacenamiento: el fichero debe residir en una unidad NVMe que no use compresion btrfs, ya que la compresion rompe O_DIRECT.
- Latencia y throughput: 245-301 tok/s de decodificacion en la configuracion TP4 indicada; no se reportan metricas de prefill ni de latencia extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| davetha/qwen3.8-flash-next-uncensored-iqr-v4 | no disponible | 200.000 (config.) | `.rad` 4-bit | Qwen Community 1.0 | Expertos round-to-nearest; calidad esperada algo inferior a la receta original |
| StillDeadcode/qwen3.8-next-flash-iqr-v4 | no disponible | no disponible | `.rad` | no disponible | Receta original; expertos con GPTQ y calibracion por experto no publicada |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | bf16 | no disponible | Modelo base abliterated del que deriva esta cuantizacion |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | bf16 | Qwen Community 1.0 | Modelo original con alineamiento de seguridad intacto |

## Limitaciones y advertencias

- Alineamiento de seguridad sustancialmente eliminado: el modelo sigue peticiones que el original rechaza; el operador es responsable del uso.
- Calidad de cuantizacion inferior a la receta IQR-V4 original en los expertos, por el uso de round-to-nearest en lugar de GPTQ.
- La divergencia KL frente a bf16 no se ha medido, por lo que no hay una cuantificacion objetiva de la perdida de fidelidad.
- Dependencia exclusiva del motor radiance 2.1.0 y del hardware AMD RDNA4; no hay soporte documentado para otros motores ni para GPUs NVIDIA.
- Fallo de formato conocido en radiance 2.1 que, sin el script de conversion `calib_to_radgram.py`, degrada silenciosamente los pesos GPTQ del tronco a round-to-nearest.
- El streaming de expertos desde el host requiere NVMe sin compresion btrfs; de lo contrario, O_DIRECT falla.
- Idiomas soportados no documentados.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, aunque son inherentes a los modelos de lenguaje y pueden verse amplificados por la eliminacion del alineamiento.
- Licencia Qwen Community 1.0: es necesario revisar sus restricciones para uso comercial antes de desplegar en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davetha/qwen3.8-flash-next-uncensored-iqr-v4
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Receta original IQR-V4: https://huggingface.co/StillDeadcode/qwen3.8-next-flash-iqr-v4
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
