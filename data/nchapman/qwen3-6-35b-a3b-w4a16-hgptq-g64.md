# nchapman/Qwen3.6-35B-A3B-W4A16-HGPTQ-g64

## Resumen

Qwen3.6-35B-A3B-W4A16-HGPTQ-g64 es una cuantizacion de 4 bits del modelo multimodal Qwen/Qwen3.6-35B-A3B, desarrollado por Qwen. Se trata de un modelo de mezcla de expertos (MoE) con 36.468.770.672 parametros totales y aproximadamente 3B parametros activos por token, disenado para tareas de razonamiento, codigo, matematicas y vision a partir de entradas imagen-texto. La cuantizacion la firma nchapman y emplea GPTQ con transformada de Hadamard (HGPTQ) en formato W4A16 (pesos de 4 bits, activaciones de 16 bits) con grupo de cuantizacion de 64.

El interes de esta version radica en que reduce el peso en disco de 67,0 GiB en BF16 a 18,78 GiB, lo que permite ejecutar un modelo MoE de 35B con vision y decodificacion especulativa MTP en una unica GPU de 24 GB, como una RTX 3090 o RTX 4090. El autor declara una fidelidad cercana a BF16: 99,3% de coincidencia top-1 en vision aislada, 98,5% en la prueba de UI/OCR y 95,8% de coincidencia en el borrador MTP.

La relevancia actual es doble: por un lado, democratiza el despliegue de un MoE multimodal de gran tamano en hardware de consumo; por otro, introduce un formato (compressed-tensors con GPTQ y Hadamard) optimizado para warp34 y compatible con vLLM 0.34 o superior, lo que facilita su integracion en pipelines de inferencia existentes. La licencia Apache 2.0 del modelo base se mantiene en esta cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer multimodal con capas de atencion/GDN, codificador de vision y cabecera MTP; tipo `qwen3_5_moe` |
| Parametros totales | 36.468.770.672 |
| Parametros activos | Aproximadamente 3B por token (segun model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16 GPTQ con transformada de Hadamard (HGPTQ), grupo de 64; cabecera de salida en 8 bits; formato compressed-tensors |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compressed-tensors), compatible con transformers, vLLM y warp34 |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal de Qwen con 256 expertos enrutados mas expertos compartidos, capas de atencion y GDN (gated delta network), un codificador de vision para entradas imagen-texto y una cabecera de prediccion multi-token (MTP) que actua como borrador de decodificacion especulativa. Esta cuantizacion cubre y calibra a 4 bits todos los componentes: los 256 expertos enrutados, los expertos compartidos, las capas de atencion y GDN, el codificador de vision y el borrador MTP, dejando la cabecera de salida en 8 bits. Incluye rankings preperfilados de expertos calientes (`static_hot_cache_rankings.json`) para acelerar el servicio MoE en una sola GPU.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base empleo RLHF o DPO, ya que la model card de esta cuantizacion no los detalla. La innovacion tecnica destacable es el uso de la transformada de Hadamard dentro del esquema GPTQ para reducir la divergencia respecto a BF16, junto con la cobertura completa del borrador MTP, que preserva la decodificacion especulativa tras la cuantizacion.

## Capacidades

- Generacion de texto y razonamiento multi-paso.
- Generacion y comprension de codigo.
- Razonamiento matematico.
- Vision: comprension de imagenes, incluyendo interfaces de usuario y OCR (con 98,5% de acuerdo top-1 en la prueba de UI/OCR declarada).
- Decodificacion especulativa integrada mediante la cabecera MTP (95,8% de coincidencia del borrador respecto a BF16).
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`).
- Compatibilidad con vLLM 0.34 o superior y con warp34.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en estacion de trabajo local: con 18,78 GiB en disco, el modelo cabe en una RTX 4090 de 24 GB y permite autocompletado, explicacion y refactorizacion de codigo sin depender de la nube.
- Analisis de capturas de pantalla y documentos escaneados: el codificador de vision cuantizado conserva el 98,5% de acuerdo en UI/OCR, lo que lo hace util para extraer texto de formularios, paneles de control o interfaces de aplicaciones.
- Automatizacion de soporte tecnico con imagenes: el modelo puede recibir una captura del error del usuario junto con texto y generar una respuesta contextualizada, aprovechando su naturaleza imagen-texto.
- Prototipado de agentes con razonamiento multi-paso: la decodificacion especulativa MTP acelera la generacion de cadenas de razonamiento largas, adecuada para tareas de planificacion y descomposicion.
- Investigacion en cuantizacion y eficiencia: el repositorio incluye rankings de expertos calientes y un informe tecnico con recibos de evaluacion, lo que permite reproducir y comparar esquemas HGPTQ frente a otras cuantizaciones.
- Despliegue en entornos con una sola GPU: mediante `vllm serve` o `warp34 serve` se puede montar un endpoint compatible con la API de OpenAI en una unica maquina de 24 GB para pruebas internas o demos.
- Procesamiento de documentacion tecnica con matematicas: combinacion de razonamiento matematico y vision para interpretar graficos y ecuaciones en articulos o manuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente aporta metricas de fidelidad de la cuantizacion respecto a BF16:

| Metrica | Resultado |
|---|---|
| Coincidencia top-1 en vision aislada | 99,3% |
| Coincidencia top-1 en prueba UI/OCR | 98,5% |
| Coincidencia del borrador MTP | 95,8% |
| Reduccion de tamano en disco | 3,6x (18,78 GiB frente a 67,0 GiB en BF16) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18,78 GiB de pesos en disco; se necesita espacio adicional para contexto, entradas de vision y decodificacion especulativa, por lo que una GPU de 24 GB es el objetivo declarado.
- GPU recomendadas: RTX 3090 y RTX 4090 (24 GB) segun el autor; no se especifican A100 ni H100 en la informacion disponible.
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090. Para GPUs de 16 GB existe la variante W2.6A16 del mismo autor (13,01 GiB).
- Opciones de despliegue: warp34 (`warp34 serve`), vLLM 0.34 o superior (`vllm serve ... --trust-remote-code`) y transformers (libreria declarada, con `custom_code`).
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card solo indica "muy rapido throughput de decodificacion" sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-W4A16-HGPTQ-g64 | 36,47B totales, ~3B activos | No disponible | Apache 2.0 | Safetensors (compressed-tensors) | Cuantizacion 4 bits, vision y MTP, 18,78 GiB |
| Qwen3.6-35B-A3B-W2.6A16-HGPTQ-RCO | No disponible | No disponible | Apache 2.0 | Safetensors | Variante de 2,6 bits del mismo autor, 13,01 GiB, para GPU de 16 GB |
| Qwen/Qwen3.6-35B-A3B (BF16) | 36,47B totales, ~3B activos | No disponible | Apache 2.0 | Safetensors | Modelo base sin cuantizar, 67,0 GiB en BF16 |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits introduce divergencia respecto a BF16; aunque el autor reporta alta fidelidad (99,3% en vision, 95,8% en MTP), no se garantiza equivalencia exacta en todas las tareas.
- No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, por lo que el rendimiento absoluto en tareas no esta verificado de forma independiente.
- Riesgo de alucinacion inherente a los modelos generativos; no hay evaluaciones especificas de tasas de alucinacion en la informacion proporcionada.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingue mas alla del modelo base.
- Requiere `--trust-remote-code` en vLLM y carga `custom_code` en transformers, lo que implica ejecutar codigo del repositorio; conviene auditar antes de usarlo en produccion.
- El optimizado principal es warp34; fuera de ese entorno el rendimiento puede variar y no se documentan cifras de latencia o throughput.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base Qwen/Qwen3.6-35B-A3B para confirmar condiciones adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nchapman/Qwen3.6-35B-A3B-W4A16-HGPTQ-g64
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Variante para 16 GB: https://huggingface.co/nchapman/Qwen3.6-35B-A3B-W2.6A16-HGPTQ-RCO
- warp34 (repositorio): https://github.com/nchapman/warp34
- warp34-quant-lab (repositorio): https://github.com/nchapman/warp34-quant-lab
- Informe tecnico: TECHNICAL.md dentro del repositorio de Hugging Face
