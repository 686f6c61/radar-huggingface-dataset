# FlagRelease/Hy4-flash-INT8-tsingmicro-FlagOS

## Resumen

Hy4-flash-INT8-tsingmicro-FlagOS es una distribución cuantizada a INT8 del modelo multimodal Hy4 Flash de Tencent Hunyuan, adaptada por la comunidad FlagOS (Zhongzhi FlagOS) para su ejecución sobre aceleradores TsingMicro mediante la pila de software unificada FlagOS. El modelo original es un transformer híbrido con arquitectura Latent MoE y Engram, con aproximadamente 220 000 millones de parámetros totales (de los cuales unos 64 000 millones son parámetros Engram) y unos 12 000 millones activados por token. Admite entradas de texto e imagen con salida de texto y una ventana de contexto de hasta 1 millón de tokens.

La relevancia de esta ficha concreta radica en que no se trata del modelo base, sino de un artefacto de despliegue: pesos en formato safetensors cuantizados en 8 bits mediante `compressed-tensors`, empaquetados junto a una imagen de contenedor FlagOS-Tsingmicro que permite arrancar un servidor de inferencia sobre 32 tarjetas TX8110 en minutos. Según la model card, la compilación FlagOS sobre NVIDIA H100 logra hasta un 35,9 % más de throughput de salida y hasta un 29,1 % menos de latencia hasta el primer token frente a la pila nativa de NVIDIA, lo que sitúa a esta familia de artefactos como una vía para evitar el bloqueo a un único proveedor de hardware.

El modelo está pensado para cargas de trabajo de oficina intensivas en contexto: búsqueda profunda, procesamiento de documentos, generación de presentaciones y uso de ordenador (Computer Use). Su huella de KV Cache es, según el autor, una sexta parte de la de Hy4, lo que abarata el servicio con contextos largos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención híbrida, Latent MoE y Engram |
| Parámetros totales | 220 251 201 958 (≈220 B, incluye ≈64 B de parámetros Engram) |
| Parámetros activos | ≈12 B por token |
| Longitud de contexto | 1 000 000 tokens (máximo) |
| Tipos de cuantización | INT8 (8-bit, formato `compressed-tensors`) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 288,6 GB) |

## Arquitectura y entrenamiento

La arquitectura combina tres piezas: atención híbrida (mezcla de mecanismos de atención que reduce el coste del contexto largo), Latent MoE (mezcla de expertos con representaciones latentes, con ≈12 B parámetros activos de un total de ≈220 B) y Engram, un componente del que el autor indica que aporta unos 64 B parámetros pero no detalla su función interna en la información disponible. El resultado declarado es una KV Cache seis veces menor que la de Hy4, lo que permite sostener ventanas de 1 M de tokens con un coste de memoria manejable.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se detalla el proceso de cuantización a INT8 más allá del uso de `compressed-tensors`. La innovación destacable documentada es de sistema, no de modelo: la pila FlagOS (FlagScale para orquestación distribuida, FlagGems como biblioteca de operadores en Triton, FlagCX para comunicación y FlagTree como compilador unificado) permite ejecutar el mismo artefacto sobre nueve fabricantes de chips distintos (T-Head, NVIDIA, Huawei Ascend, Hygon, Kunlunxin, Muxi, Moore Threads, TsingMicro e Iluvatar CoreX) con adaptación el mismo día del lanzamiento.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta texto e imágenes como entrada y produce texto.
- Procesamiento de documentos: lectura y explotación de documentos largos gracias a la ventana de 1 M de tokens.
- Búsqueda profunda (deep search): razonamiento multi-paso sobre fuentes extensas.
- Generación de presentaciones (PPT): producción de contenido estructurado para diapositivas.
- Computer Use: interacción con interfaces de escritorio orientada a tareas de oficina.
- Capacidades matemáticas y de razonamiento científico, según los benchmarks reportados por el autor (Math-500, GPQA Diamond).
- Soporte multilingüe limitado a chino e inglés.
- Tool calling / function calling: no documentado explícitamente en la información disponible.
- Modo thinking explícito, audio o vídeo: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentos corporativos a gran escala: ingesta de contratos, informes o expedientes de cientos de miles de tokens en una sola pasada, aprovechando la ventana de 1 M y la KV Cache reducida para mantener el coste por documento bajo.
- Búsqueda profunda sobre corpus técnicos: el modelo puede encadenar consultas, leer fuentes y sintetizar respuestas con razonamiento multi-paso, adecuado para asistentes de investigación internos.
- Generación automática de presentaciones: a partir de un brief y documentación adjunta, produce el esquema y el contenido de diapositivas, integrándose en flujos de oficina.
- Automatización de tareas de escritorio (Computer Use): agentes que interpretan capturas de pantalla y ejecutan acciones sobre aplicaciones ofimáticas, con la ventaja de combinar entrada visual y contexto largo.
- Asistencia multimodal en atención al cliente interna: conversaciones multi-turno con capturas de pantalla o PDF adjuntos, en chino o inglés, sobre despliegues en hardware nacional.
- Despliegue soberano en aceleradores no NVIDIA: organizaciones con parques de chips TsingMicro, Ascend o Hygon pueden servir el modelo con la imagen FlagOS-Tsingmicro sin reescribir la pila de inferencia, reduciendo la dependencia de un único proveedor.
- Evaluación comparativa de pilas de software: investigadores que miden la paridad funcional entre la pila nativa y FlagOS usando los mismos pesos INT8 y los mismos benchmarks públicos.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden a la variante nativa sobre NVIDIA; la columna de TsingMicro-FlagOS figura como "Evaluating".

| Métrica | Hy4-flash-Nvidia-Origin | Hy4-flash-Tsingmicro-FlagOS |
|---|---|---|
| Math-500 | 96 | En evaluación |
| GPQA_Diamond | 92,42 | En evaluación |
| MMBench | 92,6 | En evaluación |
| MMSTAR | 80,93 | En evaluación |

Además, la model card reporta que, en el benchmark interno WorkIndex de Tencent Hunyuan, Hy4 Flash obtiene 42,1 frente a 39,7 de Hy4 Preview, con menor coste por tarea. Sobre la pila FlagOS en H100 se declara hasta un 35,9 % más de throughput de salida y hasta un 29,1 % menos de latencia hasta el primer token respecto a la pila nativa de NVIDIA. No se han publicado resultados de benchmarks específicos de esta variante INT8 sobre TsingMicro en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 220 B parámetros en INT8, los pesos ocupan aproximadamente 220 GB, a lo que hay que sumar la KV Cache y los buffers de activación; el repo completo pesa 288,6 GB.
- GPU de referencia para esta variante: 32 tarjetas TsingMicro TX8110, según la guía de despliegue de la model card.
- No cabe en GPU de consumo: ni una RTX 4090 (24 GB) ni una RTX 5090 podrían alojar los pesos, ni siquiera en una única unidad; se requiere un nodo multi-GPU o multi-acelerador.
- Opciones de despliegue: imagen Docker `harbor.baai.ac.cn/flagrelease-public/hy4-flash-tsingmicro001-...-vllm0.32.0-...` con vLLM 0.32.0 sobre FlagOS; descarga de pesos vía ModelScope. No se documenta soporte de llama.cpp, Ollama ni TGI para esta variante.
- Entorno validado: Ubuntu 22.04.4 LTS, Docker 29.1.3, driver/SDK `Tsm_driver_0.30279.6`.
- Latencia y throughput: no disponibles para TsingMicro; los incrementos del 35,9 % y 29,1 % citados corresponden a H100 con FlagOS frente a la pila nativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hy4-flash-INT8-tsingmicro-FlagOS | ≈220 B totales / ≈12 B activos | 1 M tokens | Apache 2.0 | Pesos safetensors INT8 + imagen Docker TsingMicro |
| Hy4 Flash (original, Tencent Hunyuan) | ≈220 B totales / ≈12 B activos | 1 M tokens | Apache 2.0 | Pesos originales en BF16/FP8 (no confirmado en la información disponible) |
| Hy4 Preview (Tencent Hunyuan) | No disponible | No disponible | No disponible | Referenciado solo por su puntuación WorkIndex de 39,7 |

No se dispone en la información proporcionada de comparaciones con modelos de otros fabricantes (por ejemplo, familias Qwen o DeepSeek) en parámetros, contexto o rendimiento, por lo que esa comparación se marca como no disponible.

## Limitaciones y advertencias

- Idiomas: solo chino e inglés; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- La cuantización INT8 puede degradar ligeramente la precisión frente a los pesos originales; no se han publicado métricas de esa degradación para esta variante.
- Los benchmarks de la variante TsingMicro-FlagOS están pendientes ("Evaluating"), por lo que no hay evidencia pública de paridad funcional con la pila nativa en ese hardware.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de búsqueda profunda y Computer Use donde el modelo puede confabular acciones o fuentes.
- Sesgos: no se documenta la composición del dataset de entrenamiento ni las evaluaciones de sesgo o seguridad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución; conviene revisar las condiciones de la imagen Docker de FlagOS, que se distribuye por un canal distinto al del modelo.
- Dependencia de hardware específico: la imagen está validada para TsingMicro TX8110; portarla a otro acelerador requiere otra compilación de FlagOS.
- El despliegue exige contenedor privilegiado (`--privileged`) y montaje de `/sys`, `/dev` y `/lib/modules`, lo que implica riesgos de seguridad en entornos multiusuario.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FlagRelease/Hy4-flash-INT8-tsingmicro-FlagOS
- Imagen Docker FlagOS-Tsingmicro: `harbor.baai.ac.cn/flagrelease-public/hy4-flash-tsingmicro001-gems5.5.0-treenone-cx0.1.0-plugin0.0.0-vllm0.32.0-sglangnone-sglangflnone-cp312-pt213-raisanone-x64-none:202611190131`
- AnythingLLM (cliente de integración recomendado): https://anythingllm.com/
- Triton (base de FlagGems): https://github.com/openai/triton
- Repositorio FlagOS, paper de Hy4 Flash y blog de Tencent Hunyuan: no disponibles en la información proporcionada.
