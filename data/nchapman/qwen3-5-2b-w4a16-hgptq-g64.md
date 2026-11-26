# nchapman/Qwen3.5-2B-W4A16-HGPTQ-g64

## Resumen

Qwen3.5-2B-W4A16-HGPTQ-g64 es una cuantizacion de 4 bits del modelo multimodal Qwen/Qwen3.5-2B, desarrollada por el usuario nchapman. El modelo base es la variante compacta de 2B parametros de la familia Qwen3.5 de Alibaba, disenada para chat cotidiano, extraccion de informacion, programacion ligera y tareas de vision. Esta version cuantizada reduce el peso de 4,24 GiB en BF16 a 1,83 GiB, un factor de compresion de 2,3x, manteniendo una fidelidad cercana al modelo original.

Tecnicamente emplea GPTQ con rotacion de Hadamard (HGPTQ) en formato W4A16 (pesos de 4 bits, activaciones de 16 bits), empaquetado mediante compressed-tensors. La calibracion cubre el modelo completo: capas de texto, codificador de vision y la cabeza de borrador especulativa Multi-Token Prediction (MTP) integrada en el modelo base. Esto permite que tanto la inferencia multimodal como la decodificacion especulativa funcionen sin configuracion adicional.

Su relevancia practica reside en que hace viable un modelo multimodal con atencion hibrida y decodificacion especulativa en GPUs de consumo de 4-6 GB (serie RTX 30/40), con soporte tanto para warp34 como para vLLM 0.34+. El repositorio acumula 252 descargas y esta publicado bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida (Qwen3.5), multimodal image-text-to-text, con Multi-Token Prediction (MTP) |
| Parametros totales | 2.282.458.432 (2,28B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (GPTQ con rotacion de Hadamard, grupo de 64), compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors / GPTQ), requiere `trust-remote-code` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B emplea la arquitectura de atencion hibrida de Qwen e incorpora de serie Multi-Token Prediction (MTP) para decodificacion especulativa. La variante cuantizada mantiene esa estructura y aplica GPTQ W4A16 sobre los pesos, con rotacion de Hadamard previa a la cuantizacion para reducir el error. El proceso de calibracion abarca conjuntamente las capas de texto, el codificador de vision y la cabeza de borrador MTP, de modo que la cuantizacion no degrada de forma aislada ninguna de las tres partes.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada. La model card reporta que la cuantizacion retiene el 97,4% de concordancia top-1 en vision aislada (99,3% en el test de guarda UI/OCR) y el 92,8% de concordancia del borrador MTP respecto al modelo base en 16 bits.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento y extraccion de informacion estructurada.
- Programacion ligera (lightweight coding).
- Vision: procesamiento de imagenes (pipeline image-text-to-text), con buen rendimiento en tareas de UI y OCR segun la model card.
- Decodificacion especulativa mediante la cabeza MTP integrada, que acelera la generacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar dialogos multi-turno en una GPU de 4-6 GB, lo que lo hace adecuado para prototipos de chatbot en estaciones de trabajo con RTX 30/40 sin necesidad de servidores dedicados.
- Extraccion de informacion de documentos e imagenes: al combinar vision y texto, puede procesar capturas, formularios o pantallas y devolver datos estructurados; el 99,3% de concordancia en el test de guarda UI/OCR respalda este uso.
- Automatizacion de tareas de OCR y lectura de interfaces: util para pipelines que necesitan interpretar pantallas o documentos escaneados en local, con la ventaja de no enviar datos a servicios externos.
- Programacion ligera asistida: generacion y autocompletado de codigo en entornos de desarrollo integrados, aprovechando el bajo consumo de VRAM para ejecutarse junto a otras herramientas.
- Servicio de inferencia con vLLM: despliegue en vLLM 0.34+ con `--trust-remote-code` para servir peticiones concurrentes, beneficiandose de la decodificacion especulativa MTP para reducir latencia.
- Prototipado rapido de aplicaciones multimodales: el footprint de 1,83 GiB permite iterar en portatiles con GPU de gama media, acortando el ciclo de desarrollo antes de escalar a modelos mayores de la misma familia (0.8B o 4B).
- Evaluacion comparativa de cuantizaciones: util como referencia para medir la perdida de fidelidad de W4A16 frente a BF16 en tareas de vision y decodificacion especulativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta metricas de fidelidad de la cuantizacion respecto al modelo base en 16 bits:

| Metrica | Resultado |
|---|---|
| Concordancia top-1 en vision aislada | 97,4% |
| Concordancia en test de guarda UI/OCR | 99,3% |
| Concordancia del borrador MTP | 92,8% |
| Reduccion de tamano (BF16 a W4A16) | 2,3x (4,24 GiB a 1,83 GiB) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,83 GiB de pesos, mas overhead de contexto y activaciones; encaja comodamente en GPUs de 4-6 GB.
- GPUs recomendadas: RTX 30/40-series con 4-6 GB o mas (optimizado para warp34); tambien compatible con vLLM 0.34+ en GPUs de mayor capacidad.
- Cabe en GPU de consumo: si, en tarjetas de 4-6 GB como las de gama media de RTX 30/40.
- Opciones de despliegue: warp34 (`warp34 serve nchapman/Qwen3.5-2B-W4A16-HGPTQ`) y vLLM 0.34+ (`vllm serve ... --trust-remote-code`). No se menciona soporte para llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles; la decodificacion especulativa MTP deberia reducir la latencia frente a generacion autoregresiva estandar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-W4A16-HGPTQ-g64 (este) | 2,28B | no disponible | W4A16 GPTQ + Hadamard | Apache 2.0 | Hugging Face (252 descargas) |
| Qwen3.5-0.8B-W4A16-HGPTQ | no disponible | no disponible | W4A16 GPTQ | Apache 2.0 | Hugging Face |
| Qwen3.5-4B-W4A16-HGPTQ | no disponible | no disponible | W4A16 GPTQ | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-2B (base) | 2,28B | no disponible | BF16 | Apache 2.0 | Hugging Face |

Las variantes 0.8B y 4B del mismo autor permiten escalar segun la VRAM disponible (0,79 GiB y 3,19 GiB respectivamente). No se dispone de datos de rendimiento comparativo entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de fidelidad: 97,4% de concordancia en vision y 92,8% en el borrador MTP respecto al modelo base, lo que implica un pequeno pero real deterioro en tareas sensibles.
- Requiere `trust-remote-code` en vLLM y transformers, lo que supone ejecutar codigo personalizado del repositorio; conviene auditar antes de desplegar en produccion.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion especifico ni limitaciones de contexto o idioma del modelo.
- El soporte de tool calling, agentes y modo thinking no esta documentado en la informacion disponible; no debe asumirse.
- El despliegue esta orientado a warp34 y vLLM 0.34+; otras herramientas (llama.cpp, Ollama, TGI) no estan confirmadas.
- Aunque la licencia es Apache 2.0, se recomienda verificar los terminos del modelo base Qwen/Qwen3.5-2B antes de uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/Qwen3.5-2B-W4A16-HGPTQ-g64
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante 0.8B: https://huggingface.co/nchapman/Qwen3.5-0.8B-W4A16-HGPTQ
- Variante 4B: https://huggingface.co/nchapman/Qwen3.5-4B-W4A16-HGPTQ
- Repositorio warp34: https://github.com/nchapman/warp34
- Laboratorio de cuantizacion: https://github.com/nchapman/warp34-quant-lab
