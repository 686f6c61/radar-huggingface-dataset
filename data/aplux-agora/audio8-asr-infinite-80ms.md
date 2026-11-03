# APLUX-Agora/Audio8-ASR-Infinite-80ms

## Resumen

Audio8-ASR-Infinite-80ms es un paquete de modelo de reconocimiento automatico del habla (ASR) publicado por APLUX-Agora para su despliegue en hardware Qualcomm mediante el SDK Pandora. Se trata de una variante de 80 ms del modelo upstream Edge0/Audio8-ASR-Infinite, empaquetada con grafos de inferencia cifrados QNN (Qualcomm Neural Network) para SoCs concretos como QCS8550, QCS8625, IQ8/QCS8275 e IQ9/QCS9075. El repositorio contiene los pesos y recursos listos para ejecucion en placa, no un modelo generico ejecutable en GPU de escritorio.

La relevancia del modelo radica en su enfoque: ASR de flujo continuo ("Infinite") orientado a dispositivos edge con aceleracion NPU de Qualcomm, con una ventana de procesamiento de 80 ms que sugiere baja latencia para transcripcion en tiempo real. El paquete incluye frontend, VAD semantico, tokenizer y grafos por objetivo de SoC, con verificacion de integridad mediante SHA256SUMS.

No se dispone de informacion publica sobre la arquitectura interna, el numero de parametros, los datos de entrenamiento ni los resultados de benchmarks en la documentacion proporcionada. El modelo base es Edge0/Audio8-ASR-Infinite, del que tampoco se detallan especificaciones en esta ficha. El repositorio ocupa 10,3 GB y cada objetivo de SoC individual ronda los 3,3 GiB / 3,55 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (grafos QNN cifrados con AIDEM; modelo base Edge0/Audio8-ASR-Infinite) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (ventana de procesamiento de 80 ms por variante) |
| Tipos de cuantizacion | no disponible (grafos QNN248 precompilados por SoC) |
| Idiomas soportados | no disponible |
| Licencia | Pandora Model SDK v1.0 (acuerdo propietario APLUX; componentes upstream con sus licencias, incluida Apache 2.0) |
| Formato de pesos | Paquete SDK propietario: models.json, agora-model.json, embedding.bin, *.npy, tokenizer.json, token_bytes.json, grafos QNN en targets/<soc>_qnn248 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la documentacion disponible. El paquete se distribuye como grafos de inferencia cifrados mediante AIDEM para ejecucion sobre QNN 2.48 en NPU de Qualcomm, acompanados de recursos auxiliares en claro (embedding.bin, ficheros .npy, tokenizer.json, token_bytes.json) y componentes de frontend, prefix y semantic_vad. La variante "80ms" hace referencia a la ventana de procesamiento, y el paquete debe mantenerse en un directorio separado del de 160 ms.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras etapas de alineacion. El modelo upstream es Edge0/Audio8-ASR-Infinite, pero sus caracteristicas de entrenamiento no estan reflejadas en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla (ASR) en modo continuo o de flujo ("Infinite"), segun la denominacion del modelo.
- Procesamiento por ventanas de 80 ms, orientado a baja latencia en dispositivos edge.
- Deteccion de actividad de voz semantica (semantic_vad) integrada en el paquete.
- Frontend de audio y tokenizacion incluidos en el paquete de recursos.
- Ejecucion acelerada en NPU Qualcomm mediante QNN 2.48.
- Integracion mediante API Python y C/C++ a traves del SDK nativo 0.9.0.
- Soporte de colocacion explicita de CPU (CPU affinity) para ajuste de rendimiento.
- No se dispone de informacion sobre soporte multilingue, tool calling, agentes, vision, audio adicional ni modos de razonamiento.

## Casos de uso

- Transcripcion en tiempo real en dispositivos edge: el modelo procesa ventanas de 80 ms sobre NPU Qualcomm, lo que permite integrar ASR de baja latencia en dispositivos empotrados como placas QCS8550 sin depender de la nube.
- Subtitulado en directo en hardware empotrado: la ventana de 80 ms y el VAD semantico permiten generar subtitulos con retardo reducido en sistemas de videoconferencia o retransmision sobre placas Qualcomm.
- Asistentes de voz en dispositivos IoT industriales: el paquete se despliega en SoCs IQ8/QCS8275 e IQ9/QCS9075 (validacion end-to-end pendiente), adecuado para interfaces por voz en entornos con conectividad limitada.
- Procesamiento de audio en el borde para privacidad: al ejecutarse localmente en la NPU, el audio no necesita salir del dispositivo, lo que encaja en aplicaciones sanitarias o de seguridad con requisitos de confidencialidad.
- Integracion en pipelines de captura de voz de larga duracion: el caracter "Infinite" del modelo base sugiere procesamiento continuo de flujo de audio, util para grabacion y transcripcion de reuniones o llamadas en dispositivos dedicados.
- Desarrollo de demos y prototipos con SDK nativo: la API Python y la integracion C/C++ del SDK permiten incorporar ASR a aplicaciones empotradas existentes sobre QCS8550 con Ubuntu 22.04 y AidLite 2.5.0.284.
- Despliegue en placas de nube con escritorio remoto: el Web Demo incluido (localhost:8765) facilita la validacion funcional del paquete antes de integrarlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en NPU Qualcomm, no en GPU.
- SoCs soportados: QCS8550 (Ubuntu 22.04, validado), QCS8625 (Ubuntu 22.04, validacion end-to-end pendiente), IQ8/QCS8275 (Ubuntu 24.04, pendiente), IQ9/QCS9075 (Ubuntu 24.04, pendiente).
- Entorno cualificado: SDK nativo 0.9.0 sobre QCS8550 / Ubuntu 22.04 / AidLite 2.5.0.284 / QNN 2.48 con CPython 3.10, 3.11 o 3.12. Ubuntu 26.04 no esta cualificado.
- Espacio en disco: aproximadamente 3,3 GiB / 3,55 GB por objetivo de SoC; se recomiendan al menos 8 GiB para codigo, dependencias y recursos.
- No cabe en GPU de consumo: no se distribuyen pesos en formatos como GGUF o safetensors ejecutables en CUDA.
- Opciones de despliegue: SDK Pandora con API Python y C/C++; descarga via huggingface_hub; Web Demo en localhost:8765. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la ventana de 80 ms define la granularidad de procesamiento, pero no se publican cifras de latencia ni de velocidad de transcripcion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con alternativas de la misma categoria. El modelo esta empaquetado para NPU Qualcomm con un SDK propietario, lo que limita la comparacion directa con modelos ASR genericos ejecutables en GPU. No disponible.

## Limitaciones y advertencias

- Arquitectura, parametros y datos de entrenamiento no documentados publicamente; la evaluacion tecnica independiente es limitada.
- Los grafos de inferencia estan cifrados con AIDEM; no es posible inspeccionar ni modificar el modelo.
- Solo el objetivo QCS8550 esta validado; el resto de SoCs tienen validacion end-to-end pendiente.
- El modelo esta atado a QNN 2.48 y a versiones concretas de AidLite y del SDK nativo; otros BSP, SoC u OS no estan cualificados.
- Licencia Pandora Model SDK v1.0 propietaria: es necesario revisar los terminos (en chino, con traduccion al ingles) antes de cualquier uso comercial. Los recursos upstream conservan sus licencias aplicables.
- No se dispone de informacion sobre sesgos, tasas de alucinacion, cobertura idiomatica ni robustez en condiciones de ruido.
- El paquete de 80 ms debe mantenerse en un directorio separado del de 160 ms para evitar conflictos de configuracion.
- SHA256SUMS verifica los bytes descargados, pero la opcion --ignore-missing no garantiza la completitud del paquete.
- La fecha de creacion del repositorio (2026-11-03) y el numero de descargas (0) indican un lanzamiento muy reciente y sin adopcion publica verificable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/APLUX-Agora/Audio8-ASR-Infinite-80ms
- Modelo base: https://huggingface.co/Edge0/Audio8-ASR-Infinite
- Repositorio de demo y SDK: https://github.com/APLUX-Agora/audio8-asr-infinite-demo
- Guia de despliegue: https://github.com/APLUX-Agora/audio8-asr-infinite-demo/blob/main/docs/AGORA_DEPLOY.md
- API Python: https://github.com/APLUX-Agora/audio8-asr-infinite-demo/blob/main/sdk/PYTHON_API.md
- Integracion C/C++: https://github.com/APLUX-Agora/audio8-asr-infinite-demo/blob/main/sdk/NATIVE_INTEGRATION.md
- Contrato del paquete: https://github.com/APLUX-Agora/audio8-asr-infinite-demo/blob/main/sdk/MODEL_PACKAGE.md
- Afinidad de CPU: https://github.com/APLUX-Agora/audio8-asr-infinite-demo/blob/main/sdk/CPU_AFFINITY.md
- Licencia Pandora (chino): https://huggingface.co/APLUX-Agora/Audio8-ASR-Infinite-80ms/blob/main/LICENSES/Pandora-Model-SDK.zh-CN.txt
