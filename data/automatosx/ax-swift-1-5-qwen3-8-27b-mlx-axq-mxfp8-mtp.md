# AutomatosX/AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP8-MTP

## Resumen

AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP8-MTP es un checkpoint cuantizado en precision mixta para Apple Silicon, publicado por AutomatosX y convertido directamente desde el modelo BF16 `ukisai/Swift-1.5-Qwen3.8-27b`. Se trata de una derivacion del modelo base mediante la herramienta propietaria AXQuant (AXQ) 2.1.0, cuyo objetivo es reducir el peso en disco manteniendo las partes sensibles de la red en BF16. La ruta de lenguaje se cuantiza a 8 bits, mientras que la torre de vision y la cabeza de prediccion multi-token (MTP) se conservan en BF16, ya sea dentro del checkpoint o en sidecars enlazados.

El modelo se presenta como una clase de presupuesto de almacenamiento `MXFP8` con una precision base declarada de 16 bits (16p0bpw). La medicion real del modelo principal es de 8,3813 bits por peso (BPW) y de 8,4978 BPW si se incluye la cabeza MTP. Los pesos suman 26.895.993.856 parametros segun safetensors, con 27,36B parametros logicos del modelo principal, y la longitud de contexto configurada alcanza los 262.144 tokens.

Es relevante ahora porque el ecosistema MLX para Apple Silicon esta madurando y este paquete permite ejecutar localmente un modelo de ~27B con vision y decodificacion especulativa MTP en equipos Mac. No obstante, el propio autor advierte que se trata de evidencia de desarrollo y no de un lanzamiento certificado de AXQuant: no publica resultados medidos de calidad, contexto largo ni velocidad de MTP, por lo que no debe interpretarse la etiqueta AXQ como una afirmacion de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer denso con torre de vision y cabeza MTP) |
| Parametros totales | 26.895.993.856 (safetensors); 27,36B parametros logicos del modelo principal |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens configurados; limite practico sujeto a memoria unificada |
| Tipos de cuantizacion | 8 bits (96,80% de los pesos principales), BF16 (3,20%); cuantizacion mixta affine con tamano de grupo 32; clase de presupuesto MXFP8 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (categoria `other`) |
| Formato de pesos | MLX Safetensors (no incluye pesos PyTorch ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura de origen es `Qwen3_5ForConditionalGeneration` en variante densa, con la ruta de texto optimizada por cuantizacion. El repositorio no entrena ningun modelo, sino que convierte los pesos BF16 del modelo base a un formato MLX cuantizado en precision mixta mediante AXQuant 2.1.0. El layout resultante asigna 8 bits a 26,89B parametros (96,80% del total) y mantiene 888,07M parametros (3,20%) en BF16. Los metodos de cuantizacion empleados son `affine` y `bf16`, con tamano de grupo de 32.

La innovacion tecnica principal es la preservacion selectiva de componentes en alta precision: la cabeza MTP (15 tensores, 424,70M parametros, 0,85 GB) y la torre de vision (333 tensores, 460,73M parametros, 0,92 GB) se mantienen en BF16, lo que permite conservar decodificacion especulativa y capacidades multimodales que se degradarian con una cuantizacion agresiva. La medicion de compresion del modelo principal es de 8,3813 BPW, y de 8,4978 BPW contando la cabeza MTP. No se dispone de informacion en la documentacion proporcionada sobre la composicion del dataset de entrenamiento, el numero de tokens ni si hubo etapas de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional y de proposito general mediante `text-generation`.
- Razonamiento multi-paso a traves de la cabeza de prediccion multi-token (MTP) empaquetada en `mtp.safetensors`.
- Vision: la torre de vision esta presente en el checkpoint, con 460,73M parametros en BF16.
- Decodificacion especulativa mediante MTP con contratos de ejecucion `qwen3-next-mtp` para runtimes como oMLX y MTPLX.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de audio: no (campo `Audio present: False`).

## Casos de uso

- Inferencia local en Mac: un desarrollador puede ejecutar el modelo con MLX-LM en un equipo Apple Silicon para prototipar aplicaciones de texto sin conexion ni costes de API, aprovechando el formato MLX Safetensors nativo.
- Procesamiento de documentos largos: los 262.144 tokens de contexto configurado permiten resumir o interrogar corpus extensos (informes, expedientes, bases documentales), siempre que la memoria unificada del equipo lo permita.
- Tareas multimodales basicas: al conservar la torre de vision en BF16, puede emplearse en pipelines que requieran describir o razonar sobre imagenes junto al texto, cuando el runtime cargue el sidecar de vision.
- Aceleracion de generacion con decodificacion especulativa: integrando la cabeza MTP mediante oMLX o MTPLX se puede reducir la latencia de generacion en flujos interactivos como asistentes conversacionales.
- Desarrollo de agentes con contexto largo: el modelo puede emplearse como nucleo en prototipos de agentes que mantengan historiales extensos de conversacion y estado, aunque el soporte de tool calling no esta documentado.
- Experimentacion en investigacion sobre cuantizacion: dado su caracter de evidencia de desarrollo, es util para estudiar el impacto de la precision mixta AXQ en la calidad frente al modelo base BF16.
- Distribucion controlada en entornos offline: al ser un paquete autocontenido de 29,54 GB, sirve para desplegar capacidades de generacion en redes aisladas sin dependencia de servicios cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara explicitamente que el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernels ni velocidad de MTP, y advierte que no debe interpretarse la etiqueta del producto AXQ como una afirmacion de benchmark. La unica metrica objetiva publicada es de compresion: 8,3813 BPW del modelo principal y 8,4978 BPW total incluyendo MTP.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos suman 29,51 GB (aproximadamente 29,54 GB de descarga completa), por lo que se necesita al menos un Mac con 36 GB de memoria unificada para contexto corto; para uso comodo se recomienda 64 GB o mas.
- Contexto largo: los 262.144 tokens configurados requieren mucha mas memoria para la cache KV; se recomienda memoria unificada de 96 GB, 128 GB o 192 GB en funcion de la longitud efectiva de contexto.
- GPU compatibles: al ser un paquete MLX, esta pensado para Apple Silicon (series M1/M2/M3/M4 y posteriores). No es compatible de forma nativa con GPU NVIDIA A100, H100 o RTX 4090 al no incluir pesos PyTorch ni GGUF.
- Cabe en GPU de consumo: si, en Macs con memoria unificada suficiente; no existen pesos para GPU de consumo de NVIDIA o AMD en este repositorio.
- Opciones de despliegue: MLX-LM (ruta de texto/backbone), oMLX 0.6.3rc2 o superior para importar el sidecar MTP, y MTPLX para consumir directamente el sidecar MTP.
- Latencia y throughput: no disponible. No se publican mediciones de velocidad, y AX Engine no tiene ejecucion nativa validada por falta de `model-manifest.json`.
- Compatibilidad de runtime: el artefacto registra MLX 0.32.1 y MLX-LM 0.31.3 en el momento de la conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP8-MTP (este) | 26,9B (27,36B logicos) | 262.144 tokens | 8,3813 BPW (principal), 8,4978 BPW total | MLX Safetensors | swift-open-license-1.0 |
| AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-6bit-MTP | no disponible | no disponible | presupuesto cercano a 6 BPW | MLX Safetensors | no disponible |
| AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-4bit-MTP | no disponible | no disponible | presupuesto inferior a 4 bits (verificar BPW exacto) | MLX Safetensors | no disponible |
| ukisai/Swift-1.5-Qwen3.8-27b (modelo base) | 27,36B logicos | no disponible | BF16 sin cuantizar | no disponible | no disponible |

Los hermanos 4bit y 6bit forman parte de la misma familia AXQ y representan distintos compromisos de almacenamiento frente a precision. No se han encontrado en la informacion proporcionada modelos comparables de terceros con datos verificables de rendimiento.

## Limitaciones y advertencias

- El autor declara explicitamente que este paquete es evidencia de desarrollo y no un lanzamiento certificado de AXQuant; no publica mediciones de calidad, contexto largo, velocidad de kernels ni velocidad de MTP.
- La etiqueta AXQ describe una clase de presupuesto de almacenamiento, no una precision uniforme; el BPW medido es el dato autoritativo, no el nombre del pack.
- No incluye pesos PyTorch ni GGUF, por lo que no puede desplegarse en vLLM, llama.cpp, Ollama ni TGI sin una conversion adicional.
- La ejecucion con MLX-LM estandar cubre solo texto/backbone: puede ignorar la metadata de AXQuant y los sidecars opcionales, de modo que no garantiza aceleracion MTP ni calidad vision-lenguaje.
- AX Engine no tiene ejecucion nativa establecida: falta un `model-manifest.json` validado y los campos de AX Engine describen un contrato previsto, no evidencia observada.
- Los idiomas soportados no estan documentados, lo que impide garantizar cobertura multilingue en produccion.
- No hay informacion sobre sesgos, riesgo de alucinacion ni datos de entrenamiento del modelo base en la documentacion proporcionada.
- La licencia es `swift-open-license-1.0` (categoria `other`): es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- El contexto de 262.144 tokens es un valor configurado; su viabilidad practica depende de la memoria unificada disponible y no se ha validado su calidad en contexto largo.
- Repositorio sin descargas ni likes en el momento del registro, lo que implica ausencia de validacion por parte de la comunidad.
- Se recomienda fijar el commit del Hub en despliegues reproducibles en lugar de depender indefinidamente de `main`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP8-MTP
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Revision del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/tree/b4c84d42903a8646b25857eb2827288d92ed85a4
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-4bit-MTP
- Hermano 6bit: https://huggingface.co/AutomatosX/AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-6bit-MTP
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
