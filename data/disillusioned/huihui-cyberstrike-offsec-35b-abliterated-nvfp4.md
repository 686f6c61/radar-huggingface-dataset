# disillusioned/Huihui-CyberStrike-Offsec-35B-abliterated-NVFP4

## Resumen

`disillusioned/Huihui-CyberStrike-Offsec-35B-abliterated-NVFP4` es una cuantizacion en formato NVFP4 (4 bits empaquetados en coma flotante, con escalas FP8-E4M3 y tamano de grupo 16) del modelo `huihui-ai/Huihui-CyberStrike-OffSec-35B-abliterated`, a su vez una version "abliterated" (sin rechazos) de `oyildirim/CyberStrike-OffSec-35B`. El modelo esta orientado a tareas de seguridad ofensiva, pentesting y tool calling, y conserva la arquitectura multimodal Qwen3.5-MoE (`qwen3_5_moe`) del modelo original, con un cabezal MTP (multi-token prediction) para decodificacion especulativa.

El modelo cuenta con 35.951.822.704 parametros totales (segun los pesos en safetensors), es de tipo MoE (mezcla de expertos) segun la etiqueta de arquitectura, y procesa tanto texto como imagenes (pipeline `image-text-to-text`). La cuantizacion NVFP4 esta pensada para GPUs NVIDIA Blackwell (sm_120, por ejemplo RTX 5090), lo que reduce el peso del repositorio a unos 25,5 GB y permite servir el modelo en hardware consumer de gama alta.

Es relevante ahora porque combina tres tendencias: modelos abliterated sin censura para investigacion en seguridad, cuantizacion de muy baja precision (FP4) para abaratar la inferencia, y soporte de tool calling y agentes. No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card es minima: no aporta datos de benchmarks, idiomas ni detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-MoE (`qwen3_5_moe`), transformer multimodal con mezcla de expertos y cabezal MTP |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, grupo 16, escalas FP8-E4M3); etiqueta adicional "8-bit" |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors); incluye `model_mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts de la familia Qwen3.5, con capacidades multimodales (entrada de imagen y texto) y un cabezal MTP (multi-token prediction) que permite decodificacion especulativa para acelerar la generacion. El repositorio cuantizado conserva la arquitectura, el tokenizer y la plantilla de chat del modelo original; solo se cuantizan los pesos. La cuantizacion se realizo con `llm-compressor` y `compressed-tensors` (proyecto de vLLM), y el formato NVFP4 se lee automaticamente desde el `quantization_config` sin necesidad de flags adicionales.

Sobre el entrenamiento no hay informacion en la model card: no se especifica el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO o fases de alineamiento. La variante "abliterated" se genero con la tecnica de abliteration descrita en `remove-refusals-with-transformers`, que elimina direcciones de rechazo del espacio de activaciones sin reentrenar el modelo completo. El cabezal MTP proviene de `Qwen/Qwen3.6-35B-A3B` segun la model card del modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Procesamiento de imagenes junto con texto (pipeline `image-text-to-text`).
- Razonamiento y generacion de codigo, orientado a tareas de seguridad ofensiva y pentesting.
- Soporte de tool calling / function calling (etiqueta `tool-calling`).
- Capacidades de agente y razonamiento multi-paso (segun etiquetas del autor).
- Modo "sin censura" (abliterated): no aplica rechazos de seguridad del modelo original.
- Decodificacion especulativa mediante el cabezal MTP.
- Capacidades multilingues: no disponibles (no se documentan idiomas).

## Casos de uso

- Auditorias de seguridad ofensiva: el modelo puede generar payloads, explicar tecnicas de explotacion y asistir en pruebas de penetracion autorizadas, aprovechando su orientacion explicita a offensive-security.
- Investigacion en seguridad y red teaming: permite estudiar como responde un LLM sin alineamiento de rechazos ante peticiones maliciosas, util para evaluar riesgos y disenar defensas.
- Asistentes de pentesting con tool calling: puede integrarse en frameworks de agentes que invocan herramientas (nmap, escaneres, scripts) y razonan sobre los resultados en varios pasos.
- Analisis de capturas y documentacion tecnica con vision: al aceptar imagen y texto, puede interpretar diagramas de red, capturas de pantalla de terminales o paneles de configuracion.
- Generacion de codigo de automatizacion: escribir scripts de explotacion, parsers de logs o utilidades de reconocimiento en un pipeline de CI/CD controlado.
- Despliegue en estaciones de trabajo con RTX 5090: al estar cuantizado en NVFP4 (unos 25,5 GB de pesos), cabe en GPUs consumer Blackwell para laboratorios de seguridad locales sin depender de la nube.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la perdida de calidad de NVFP4 frente al modelo en bfloat16 en tareas de razonamiento y codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan unos 25,5 GB en NVFP4; con cache KV y overhead de runtime, se recomienda al menos 32 GB de VRAM.
- GPU recomendadas: NVIDIA Blackwell (sm_120), como RTX 5090, por el soporte nativo de NVFP4; en generaciones anteriores (Ada, Hopper) el formato puede no estar optimizado o no ser compatible.
- Cabe en GPU consumer: si, en RTX 5090 (32 GB) y previsiblemente en futuras Blackwell de gama alta; no en GPUs de 24 GB o menos sin offloading.
- Opciones de despliegue: vLLM (con build que soporte `qwen3_5_moe` y `compressed-tensors`); `transformers` con `trust_remote_code=True`; llama.cpp para el modelo base con el archivo MTP, aunque el formato NVFP4 esta pensado para vLLM/compressed-tensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-CyberStrike-OffSec-35B-abliterated-NVFP4 (este) | 35,95 B (MoE) | no disponible | NVFP4 4-bit | Apache 2.0 | Multimodal, MTP, orientado a offsec |
| huihui-ai/Huihui-CyberStrike-OffSec-35B-abliterated | 35,95 B (MoE) | no disponible | bfloat16 | Apache 2.0 | Modelo base sin cuantizar, mas VRAM |
| oyildirim/CyberStrike-OffSec-35B | no disponible | no disponible | no disponible | no disponible | Modelo original antes de abliteration |
| Qwen/Qwen3.6-35B-A3B | 35 B (A3B activos) | no disponible | no disponible | no disponible | Origen del cabezal MTP |

## Limitaciones y advertencias

- Modelo abliterated: elimina los rechazos de seguridad, por lo que puede generar contenido danino, ilegal o peligroso. Su uso debe limitarse a entornos controlados y con autorizacion explicita.
- Riesgo elevado de alucinacion en dominios tecnicos de seguridad: puede inventar vulnerabilidades, CVEs o comandos incorrectos.
- No se documentan idiomas soportados ni longitud de contexto; no se puede garantizar comportamiento multilingue ni ventanas largas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la perdida de calidad de NVFP4 frente al modelo en bfloat16.
- Compatibilidad de hardware restringida: NVFP4 requiere GPUs Blackwell; en otras arquitecturas el rendimiento puede degradarse o fallar.
- Requiere un runtime (vLLM) con soporte para `qwen3_5_moe`; las versiones estandar pueden no cargar el modelo.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar leyes de ciberseguridad; la responsabilidad recae en el desplegador.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni evidencia de estabilidad en produccion.
- El autor de la cuantizacion es un tercero (`disillusioned`), no el autor original del modelo; no hay garantias de fidelidad de la cuantizacion.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/disillusioned/Huihui-CyberStrike-Offsec-35B-abliterated-NVFP4
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-CyberStrike-OffSec-35B-abliterated
- Modelo original: https://huggingface.co/oyildirim/CyberStrike-OffSec-35B
- Origen del cabezal MTP: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Tecnica de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
