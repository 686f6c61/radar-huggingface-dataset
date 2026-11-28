# nchapman/Qwen3.8-Flash-Next-W2.6A16-HGPTQ-RCO

## Resumen

Qwen3.8-Flash-Next-W2.6A16-HGPTQ-RCO es una cuantizacion mixta de 2 y 4 bits del modelo multimodal Qwen/Qwen3.8-Flash-Next, un Mixture-of-Experts (MoE) de clase 180B desarrollado por Alibaba Qwen. La cuantizacion la firma nchapman y reduce el peso del modelo original de 335 GiB a 71,67 GiB totales, combinando 44,84 GiB de pesos activos con una tabla de lookup de 26,82 GiB mapeada en memoria. El objetivo es claro: hacer correr un modelo frontera de codigo y razonamiento en GPUs de consumo.

El modelo base es un MoE multimodal (image-text-to-text) con 139.112 millones de parametros totales segun los safetensors del repo, del que solo se activa una fraccion de expertos por token, lo que permite velocidades de decodificacion altas pese al tamano. Esta version cuantizada mantiene en 4 bits todas las capas siempre activas (atencion, shared experts, vision y MTP) y los 15 niveles de expertos enrutados mas sensibles, mientras comprime los 33 restantes con cuantizacion simetrica de 2 bits.

La relevancia actual reside en que permite desplegar un modelo de clase 180B en configuraciones de 2x24 GB (RTX 3090/4090) con contexto de 128K, o incluso en 1x24 GB con offloading a RAM. Esta optimizada especificamente para el motor warp34, aunque tambien es compatible con vLLM 0.34+.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal, transformer |
| Parametros totales | 139.112.073.107 (~139B) |
| Parametros activos | no disponible (el autor describe el modelo base como "180B-class"; no se especifica el numero exacto de parametros activos) |
| Longitud de contexto | 128K (segun la model card, en configuracion de 2x24 GB) |
| Tipos de cuantizacion | Mixta 2-bit / 4-bit (W2.6A16: capas activas y 15 niveles de expertos en 4-bit, 33 niveles de expertos enrutados en 2-bit simetrico); layouts estrictos 2/4/8-bit |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (compressed-tensors, GPTQ) |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts multimodal de Qwen con capacidad image-text-to-text, disenado para activar solo una porcion de sus expertos por token, lo que reduce el coste computacional de inferencia frente a un denso equivalente. Incluye capas de vision, shared experts y un modulo MTP (multi-token prediction) para decodificacion especulativa. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO en la informacion proporcionada.

La innovacion de esta ficha es la cuantizacion: un esquema GPTQ con transformada de Hadamard (HGPTQ) que aplica precision mixta. Las capas siempre activas (atencion, shared experts, vision, MTP) y los 15 niveles de expertos enrutados mas sensibles se mantienen en 4 bits; los 33 restantes se comprimen a 2 bits simetricos. El autor reporta que, con una compresion de 4,68x, se conserva el 96,4% de concordancia top-1 en vision aislada (97,0% en el guard de UI/OCR) y el 95,1% de concordancia en el borrador MTP, con un 37,7% menos de divergencia en held-out que la version V1. Incluye rankings pre-perfilados de expertos calientes (`static_hot_cache_rankings.json`) para el motor warp34.

## Capacidades

- Generacion de texto y razonamiento de nivel frontera, segun el autor.
- Generacion de codigo y tareas de programacion.
- Capacidades multimodales de imagen a texto (pipeline image-text-to-text, capas de vision preservadas en 4 bits).
- Decodificacion especulativa mediante modulo MTP, con soporte de drafter externo (DFlash2 W4A16).
- Despliegue en vLLM 0.34+ y en el motor warp34 con `--tp 2`.
- Soporte de contexto largo (128K en 2x24 GB).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de codigo en estacion de trabajo local: con 2x24 GB (RTX 3090/4090) se puede servir el modelo para autocompletado y generacion de codigo sin depender de la nube, aprovechando las capas de atencion y shared experts en 4 bits para mantener calidad.
- Analisis de capturas de pantalla y documentos escaneados: las capas de vision se conservan en 4 bits y el autor reporta un 97,0% de concordancia en el guard de UI/OCR, lo que lo hace adecuado para extraccion de texto de interfaces y formularios.
- Razonamiento multi-turno con contexto largo: la ventana de 128K en 2x24 GB permite mantener conversaciones o documentos extensos en memoria, util para revision de codigo de repositorios completos.
- Prototipado e investigacion en laboratorio con hardware limitado: permite experimentar con un MoE de clase 180B en GPUs de consumo, algo inviable con los pesos originales de 335 GiB.
- Despliegue en vLLM para servicios internos: la compatibilidad con vLLM 0.34+ permite integrarlo en infraestructura existente de serving con `--trust-remote-code`.
- Generacion acelerada con drafter: emparejado con Qwen3.8-Flash-Next-DFlash2-W4A16-HGPTQ (0,52 GiB) mediante `--draft-model`, se obtiene decodificacion especulativa para reducir latencia en produccion.
- Evaluacion de tecnicas de cuantizacion mixta: el repo incluye rankings de expertos calientes y layouts 2/4/8-bit, util para investigadores que estudien el impacto de la precision mixta en MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente reporta metricas internas de fidelidad de la cuantizacion:

| Metrica | Valor reportado |
|---|---|
| Compresion respecto al original | 4,68x (335 GiB -> 71,67 GiB) |
| Concordancia top-1 en vision aislada | 96,4% |
| Concordancia en guard UI/OCR | 97,0% |
| Concordancia en borrador MTP aislado | 95,1% |
| Reduccion de divergencia held-out vs V1 | 37,7% |

## Requisitos de hardware

- VRAM estimada: ~21 GiB por GPU en configuracion de 2x24 GB con contexto de 128K; tambien funciona en 1x24 GB con offloading a RAM.
- El autor indica que el modelo total ocupa 71,67 GiB (44,84 GiB activos + 26,82 GiB de tabla de lookup mapeada en memoria).
- GPUs recomendadas: 2x RTX 3090 o 2x RTX 4090 (24 GB cada una) con `--tp 2`; 1x RTX 3090/4090 con offloading.
- Para maxima fidelidad en 4 bits se ofrece la variante W4A16 (92,84 GiB), que requiere 80 GB+ de VRAM o configuracion tiered de 2x24 GB.
- Opciones de despliegue: warp34 (`warp34 serve ... --tp 2`), vLLM 0.34+ (`vllm serve ... --trust-remote-code`).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | VRAM minima |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-W2.6A16-HGPTQ-RCO (esta ficha) | ~139B | 128K | Mixta 2/4-bit | qwen-community-1.0 | 2x24 GB (~21 GiB/GPU) |
| Qwen3.8-Flash-Next-W4A16-HGPTQ | no disponible (base ~139B) | no disponible | 4-bit (W4A16) | qwen-community-1.0 | 80 GB+ o tiered 2x24 GB; repo 92,84 GiB |
| Qwen/Qwen3.8-Flash-Next (original) | ~139B | no disponible | sin cuantizar (BF16) | qwen-community-1.0 | 335 GiB de pesos |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; la comparativa se limita a tamano, cuantizacion y requisitos de hardware.

## Limitaciones y advertencias

- La cuantizacion a 2 bits de 33 niveles de expertos introduce perdida de fidelidad: el autor reporta un 96,4% de concordancia en vision, lo que implica un 3,6% de divergencia respecto al modelo original en esa tarea.
- Las metricas de fidelidad reportadas son del propio autor y no han sido verificadas de forma independiente en la informacion disponible.
- No hay datos publicos de benchmarks estandar (MMLU, HumanEval, GSM8K) para esta cuantizacion, por lo que el rendimiento real en tareas de codigo y razonamiento no esta cuantificado.
- La licencia qwen-community-1.0 puede imponer restricciones al uso comercial; es necesario revisar el texto completo en el enlace de licencia del modelo base.
- El modelo esta optimizado para warp34; fuera de ese motor (por ejemplo, en vLLM) pueden perderse las ventajas de los rankings de expertos calientes y del cacheo por niveles.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada, aunque son inherentes a los modelos de lenguaje de gran escala.
- Idiomas soportados no especificados; el comportamiento multilingue no esta documentado.
- El repo ocupa 125,3 GB y requiere gestion cuidadosa de memoria mapeada y offloading para funcionar en hardware de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-W2.6A16-HGPTQ-RCO
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Variante 4-bit de alta fidelidad: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-W4A16-HGPTQ
- Drafter DFlash2 W4A16: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-DFlash2-W4A16-HGPTQ
- Motor warp34: https://github.com/nchapman/warp34
- Laboratorio de cuantizacion: https://github.com/nchapman/warp34-quant-lab
- Informe tecnico: TECHNICAL.md (en el repositorio de Hugging Face)
