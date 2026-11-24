# gatilin/fastframes-l-video-components

## Resumen

FastFrames-L video components es un paquete de componentes extraidos del modelo de generacion de video `apple/FastFrames-L`, publicado por el desarrollador independiente `gatilin`. No se trata de un modelo completo de texto-a-video, sino de una copia sin conversiones ni ajuste fino de los tres ficheros de pesos originales que forman el nucleo generativo de FastFrames-L: el generador de video causal (`dit.safetensors`), la red de refinamiento de cache KV (`kv_refiner.safetensors`) y el decodificador de pixeles (`pixel_decoder.safetensors`). El repositorio pesa 30,6 GB y se publica bajo la licencia Apple Machine Learning Research Model License (apple-amlr).

El componente principal es un diffusion transformer (DiT) derivado de Wan2.1-T2V-14B, con 1.095 tensores en BF16 que suman 28.577.096.680 bytes (aproximadamente 28,6 GB, lo que corresponde a unos 14.300 millones de parametros en BF16). Se complementa con un refinador de cache KV de 1.780.342.784 bytes (unos 1.780 millones de parametros en BF16) y un decodificador puenteado de 5120 a 1536 canales con 32 tensores en FP32 (286.952.688 bytes).

La relevancia de este repositorio es practica: preserva los pesos originales de FastFrames-L en un formato accesible y verificado estructuralmente, lo que permite a investigadores reproducir el pipeline oficial sin depender de la disponibilidad del repositorio upstream. No obstante, no incluye el codificador de texto Wan ni el tokenizador, ni el codigo de inferencia completo, por lo que por si solo no permite generar video.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) causal derivado de Wan2.1-T2V-14B, con refinador de cache KV y decodificador de pixeles puenteado |
| Parametros totales | Aproximadamente 14.300 millones (DiT, calculado a partir de 28.577.096.680 bytes en BF16); refinador KV de aproximadamente 1.780 millones; decodificador de aproximadamente 71,7 millones en FP32 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en BF16 para DiT y refinador KV, y FP32 para el decodificador) |
| Idiomas soportados | No disponible |
| Licencia | apple-amlr (Apple Machine Learning Research Model License Agreement), uso y distribucion limitados a investigacion no comercial |
| Formato de pesos | safetensors (dit.safetensors, kv_refiner.safetensors, pixel_decoder.safetensors) |

## Arquitectura y entrenamiento

El nucleo del paquete es un diffusion transformer causal para generacion de video, heredado de Wan2.1-T2V-14B. El fichero `dit.safetensors` contiene 1.095 tensores en BF16 cuyo nombre y forma coinciden exactamente con los del modelo Wan2.1-T2V-14B, segun la auditoria estructural realizada por el autor sobre el dispositivo meta. Sobre esta base, FastFrames-L anade un refinador de cache KV (`kv_refiner.safetensors`, 66 tensores BF16) que opera sobre la cache de atencion para mejorar la coherencia temporal en generacion causal, y un decodificador de pixeles puenteado (`pixel_decoder.safetensors`, 32 tensores FP32) que proyecta de 5120 a 1536 canales para reconstruir el video en el espacio de pixeles.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El autor indica explicitamente que los checkpoints intermedios de entrenamiento no estan incluidos y que este repositorio es un bundle de componentes, no una distribucion completa de texto-a-video: requiere el codificador de texto Wan, el tokenizador, el codigo de inferencia y las dependencias de runtime del proyecto oficial `apple-aiml-research/ml-fastframes`. La verificacion realizada incluye comparacion de cabeceras safetensors, hashing de los ficheros de refinador y decodificador desde el espejo de ModelScope, y pruebas de carga estricta y forward sintetico en CPU del primer modulo de self-attention del DiT, del decodificador y del refinador; no se ejecuto un forward completo en GPU ni una generacion end-to-end.

## Capacidades

- Generacion de video a partir de texto (text-to-video), condicionada por el codificador de texto Wan externo, que no se incluye en este repositorio.
- Generacion de video causal, adecuada para secuencias temporales con coherencia entre fotogramas mediante el refinador de cache KV.
- Reconstruccion de video en el espacio de pixeles mediante el decodificador puenteado de 5120 a 1536 canales.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No se documentan capacidades multilingues ni de vision, audio u otras modalidades mas alla del video.
- No se documenta soporte de edicion de video, inpainting ni control adicional (pose, depth, etc.).

## Casos de uso

- Investigacion en generacion de video: el paquete permite a grupos de investigacion cargar los pesos originales de FastFrames-L en sus propios pipelines y reproducir experimentos del paper sin depender de la disponibilidad del repositorio upstream.
- Auditoria y verificacion de pesos: los hashes y tamanos documentados permiten validar la integridad de los ficheros frente al repositorio original de Apple, util en entornos con requisitos de trazabilidad.
- Desarrollo de decodificadores alternativos: el decodificador puenteado de 5120 a 1536 canales puede sustituirse o modificarse para experimentar con distintas estrategias de reconstruccion de pixeles.
- Estudio de caches KV en difusion: el refinador de cache KV aislado permite investigar tecnicas de compresion o refinamiento de atencion en modelos de video sin cargar el DiT completo.
- Benchmarking de diffusion transformers de video: sirve como referencia base para comparar arquitecturas causales frente a no causales en tareas de generacion de video.
- Formacion y docencia: util para explicar la descomposicion de un pipeline de texto-a-video en sus componentes (DiT, refinador, decodificador) con pesos reales y verificables.
- Integracion en pipelines de investigacion no comercial: al estar bajo licencia apple-amlr, encaja en proyectos academicos que ya trabajan con el ecosistema Wan y el codigo oficial de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de calidad de generacion (FVD, CLIP score, etc.), latencia ni throughput, y advierte que las pruebas realizadas son de carga estructural y forward sintetico en CPU, no de generacion end-to-end ni de paridad en GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: el DiT en BF16 ocupa aproximadamente 28,6 GB solo en pesos, a lo que hay que sumar el refinador KV (aproximadamente 1,8 GB), el decodificador (aproximadamente 0,29 GB) y las activaciones y cache KV durante la generacion, por lo que se requiere una GPU con al menos 40-80 GB de VRAM para una ejecucion comoda en BF16.
- GPU recomendadas: A100 80 GB, H100 80 GB o GPUs con memoria unificada de gran capacidad; en configuraciones de 40 GB (A100 40 GB, L40S) puede requerir offloading o cuantizacion, no documentada oficialmente.
- GPU de consumo: no cabe en GPUs consumer tipicas (RTX 4090 con 24 GB) sin cuantizacion agresiva u offloading a CPU, que no estan soportados oficialmente por el repositorio.
- Opciones de despliegue: el autor remite al codigo oficial `apple-aiml-research/ml-fastframes`; no se documenta soporte de vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gatilin/fastframes-l-video-components | DiT de aproximadamente 14.300 M (BF16) + refinador KV de aproximadamente 1.780 M + decodificador de aproximadamente 71,7 M | No disponible | apple-amlr (solo investigacion no comercial) | Hugging Face, bundle de componentes |
| apple/FastFrames-L | No disponible en la informacion proporcionada | No disponible | apple-amlr | Repositorio oficial de Apple en Hugging Face |
| Wan2.1-T2V-14B | Aproximadamente 14.000 M | No disponible | No disponible en la informacion proporcionada | Modelo base del que deriva el DiT |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo completo: faltan el codificador de texto Wan, el tokenizador, el codigo de inferencia y las dependencias de runtime, por lo que no puede generar video por si solo.
- Licencia apple-amlr: limita el uso y la distribucion a investigacion no comercial; cualquier uso comercial requiere autorizacion expresa de Apple.
- Verificacion parcial: el fichero `dit.safetensors` no fue descargado ni hasheado localmente por el autor; solo se comparo su cabecera safetensors contra Wan2.1-T2V-14B en el dispositivo meta, lo que constituye una auditoria estructural, no una carga completa ni un forward real.
- Pruebas limitadas: los tests de carga y forward sintetico en CPU no establecen calidad de generacion end-to-end, comportamiento con video real, paridad en GPU ni correccion completa del DiT.
- Riesgo de alucinacion y sesgos: no documentados especificamente para este paquete; al heredar el comportamiento de Wan2.1-T2V-14B, puede reproducir sesgos presentes en los datos de entrenamiento originales, no disponibles.
- Idiomas: no se especifican los idiomas soportados por el codificador de texto externo.
- Sin mantenimiento garantizado: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no ofrece soporte ni actualizaciones.
- Reproducibilidad dependiente del upstream: el codigo oficial de Apple y el modelo base Wan2.1-T2V-14B deben obtenerse por separado y pueden cambiar con el tiempo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gatilin/fastframes-l-video-components
- Modelo base: https://huggingface.co/apple/FastFrames-L
- Licencia: https://huggingface.co/apple/FastFrames-L/blob/main/LICENSE
- Implementacion oficial: https://github.com/apple-aiml-research/ml-fastframes
