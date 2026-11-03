# APLUX-Agora/Audio8-ASR-Infinite-160ms

## Resumen

Audio8-ASR-Infinite-160ms es un paquete de modelo de reconocimiento automatico del habla (ASR) publicado por APLUX-Agora para su plataforma Agora. Se trata de una variante afinada del modelo upstream Edge0/Audio8-ASR-Infinite, empaquetada especificamente para su despliegue sobre aceleradores Qualcomm QNN en sistemas en chip (SoC) de la familia QCS/IQ. El sufijo "160ms" hace referencia a la ventana de proceso (A8_CLOCK_MS) configurada para esta variante, que convive en el ecosistema con una variante de 80 ms.

El modelo no se distribuye como pesos en formato convencional (safetensors o GGUF), sino como un paquete de recursos propietario con grafos de inferencia cifrados (AIDEM), metadatos de compatibilidad (agora-model.json), recursos de frontend, VAD semantico y binarios por SoC objetivo (targets/<soc>_qnn248). El SDK nativo (version 0.9.0) esta cualificado sobre QCS8550 con Ubuntu 22.04, AidLite 2.5.0.284 y QNN 2.48; el resto de SoC listados tienen validacion end-to-end pendiente.

Su relevancia es acotada pero concreta: cubre el nicho de ASR en el borde (edge) sobre hardware Qualcomm, con integracion via API Python y C/C++, y un contrato de paquete documentado. No es un modelo para uso general en servidores GPU ni para inferencia estandar con transformers; su interes esta en despliegues embebidos sobre SoC qualcomm con el stack QNN/AidLite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (grafo de inferencia compilado para QNN; arquitectura interna no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (procesa audio; ventana de proceso configurada a 160 ms en esta variante) |
| Tipos de cuantizacion | no disponible (grafos QNN precompilados; no se documentan precisiones) |
| Idiomas soportados | no disponible |
| Licencia | pandora-model-sdk-v1.0 (acuerdo Pandora, con traduccion al ingles; contribuciones upstream bajo sus licencias aplicables, Apache 2.0 incluida) |
| Formato de pesos | paquete propietario: models.json, agora-model.json, embedding.bin, *.npy, tokenizer.json, token_bytes.json, grafos cifrados con AIDEM en targets/<soc>_qnn248 |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo upstream Edge0/Audio8-ASR-Infinite ni sobre su proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO u otras tecnicas). La model card de esta variante no describe la red neuronal, sino el empaquetado y el despliegue: recursos de frontend de audio, prefix, VAD semantico, tokenizer y grafos de inferencia compilados por SoC.

La innovacion tecnica documentada es de ingenieria de despliegue, no de modelado: paquete autocontenido con verificacion SHA256, grafos cifrados mediante AIDEM (salvo embedding.bin, que va sin cifrar), seleccion de target por SoC en un unico snapshot de Hugging Face, y control explicito de afinidad de CPU desde Python y C. El SDK nativo 0.9.0 esta cualificado sobre QCS8550 / Ubuntu 22.04 / AidLite 2.5.0.284 / QNN 2.48 con CPython 3.10, 3.11 y 3.12.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) como tarea principal del pipeline.
- Procesamiento por ventanas de 160 ms (A8_CLOCK_MS=160) en esta variante.
- VAD semantico incluido en el paquete (directorio semantic_vad/).
- Integracion mediante API Python y API nativa C/C++.
- Despliegue en el borde sobre aceleradores Qualcomm QNN (QCS8550 validado).
- Control de afinidad de CPU configurable (herencia por defecto en SDK, perfil "default" en la demo oficial).
- Verificacion de integridad de recursos y hashes al arranque de la demo web.
- Soporte de tool calling, agentes, vision, audio multimodal, thinking mode o capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Transcripcion en dispositivos embebidos con SoC Qualcomm: el paquete se descarga y ejecuta sobre QCS8550 con Ubuntu 22.04, lo que permite ASR local sin enviar audio a la nube y sin GPU dedicada.
- Subtitulado o dictado en tiempo real en hardware de borde: la ventana de 160 ms y el VAD semantico integrado facilitan el troceado continuo de audio en flujos de captura de microfono.
- Integracion en aplicaciones C/C++ de sistemas empotrados: la API nativa y el contrato de paquete (models.json) permiten enlazar el motor ASR dentro de un binario de producto sin dependencias de Python.
- Prototipado rapido con Python: la API Python y el ejemplo de 20 segundos del repositorio de demo permiten validar la transcripcion antes de integrar en produccion.
- Demostracion web local en placa: la demo web en localhost:8765 (o la IP de la placa) sirve para evaluar la calidad de transcripcion en el propio dispositivo.
- Pipelines de validacion de hardware: el esquema de targets por SoC y la comprobacion SHA256 permiten verificar paquetes antes de desplegarlos en flotas de dispositivos con distintos SoC (QCS8550, QCS8625, QCS8275, QCS9075).
- Investigacion en ASR de borde: util para comparar variantes de ventana (80 ms frente a 160 ms) manteniendo directorios separados, segun indica la propia documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el despliegue es sobre SoC Qualcomm con acelerador QNN, no sobre GPU.
- SoC soportados: QCS8550 (validado, Ubuntu 22.04), QCS8625 (validacion end-to-end pendiente, Ubuntu 22.04), IQ8/QCS8275 (pendiente, Ubuntu 24.04) e IQ9/QCS9075 (pendiente, Ubuntu 24.04).
- Espacio en disco: un unico target ocupa aproximadamente 3,3 GiB / 3,55 GB; se recomienda reservar al menos 8 GiB para codigo, dependencias y recursos.
- Software: SDK nativo 0.9.0, AidLite 2.5.0.284, QNN 2.48, CPython 3.10/3.11/3.12. Ubuntu 26.04 no esta cualificado.
- GPU de consumo: no aplica; no se documenta soporte CUDA ni ejecucion en A100, H100 o RTX 4090.
- Despliegue: descarga via huggingface_hub (`hf download`) con el array AGORA_MODEL_FILES, API Python, API C/C++ y demo web. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (ASR sobre SoC Qualcomm con paquete QNN) ni datos de rendimiento que permitan una comparacion objetiva.

## Limitaciones y advertencias

- Cobertura de hardware muy restringida: solo QCS8550 esta validado end-to-end; el resto de SoC listados tienen la validacion pendiente y Ubuntu 26.04 no esta cualificado.
- La licencia pandora-model-sdk-v1.0 es un acuerdo propietario (texto principal en chino, con traduccion al ingles); es imprescindible revisar sus terminos antes de cualquier uso comercial. Las contribuciones upstream conservan sus licencias, incluida Apache 2.0.
- Los grafos de inferencia estan cifrados con AIDEM, lo que limita la inspeccion, modificacion o reutilizacion del modelo fuera del SDK de Pandora.
- No se publican idiomas soportados, arquitectura, parametros ni precisiones de cuantizacion, lo que dificulta evaluar su idoneidad para un caso concreto sin pruebas previas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; en ASR el riesgo se traduce en errores de transcripcion, pero no hay datos publicados al respecto.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-03), por lo que no hay evidencia publica de uso en produccion.
- La variante de 80 ms y la de 160 ms deben mantenerse en directorios separados; mezclarlas puede romper la seleccion de recursos.
- La verificacion SHA256 con `--ignore-missing` no demuestra la completitud del paquete; conviene validar el target descargado antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/Audio8-ASR-Infinite-160ms
- Modelo upstream: https://huggingface.co/Edge0/Audio8-ASR-Infinite
- Repositorio de demo y SDK: https://github.com/APLUX-Agora/audio8-asr-infinite-demo
- Guia de despliegue: https://github.com/APLUX-Agora/audio8-asr-infinite-demo/blob/main/docs/AGORA_DEPLOY.md
- API Python: https://github.com/APLUX-Agora/audio8-asr-infinite-demo/blob/main/sdk/PYTHON_API.md
- Integracion C/C++: https://github.com/APLUX-Agora/audio8-asr-infinite-demo/blob/main/sdk/NATIVE_INTEGRATION.md
- Contrato de paquete: https://github.com/APLUX-Agora/audio8-asr-infinite-demo/blob/main/sdk/MODEL_PACKAGE.md
- Afinidad de CPU: https://github.com/APLUX-Agora/audio8-asr-infinite-demo/blob/main/sdk/CPU_AFFINITY.md
- Licencia Pandora (chino): https://huggingface.co/APLUX-Agora/Audio8-ASR-Infinite-160ms/blob/main/LICENSES/Pandora-Model-SDK.zh-CN.txt
