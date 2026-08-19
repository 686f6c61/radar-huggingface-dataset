# sHEL1562/shelling

## Resumen

El repositorio `sHEL1562/shelling` no contiene un modelo entrenado, sino un archivo de referencias y snapshots. Su autor, sHEL1562, lo describe como "un archivo de forks / referencias de snapshots" y aclara que todos los archivos entrenados de forma independiente dependen de licencias iniciales superpuestas. Incluye un `repo.tar` con un snapshot del proyecto AGPL "Odyssues" y documenta comandos de despliegue con vLLM para otros modelos cuantizados: Agents-A1 (en GPTQ-INT4 y AWQ-NVFP4) y Qwen-AgentWorld-35B-A3B (GPTQ-Pro-Int4). El repositorio ocupa 0,2 GB, se publicó bajo licencia AGPL-3.0 y no registra descargas ni valoraciones.

Su relevancia práctica radica en que proporciona configuraciones de vLLM aparentemente probadas para ejecutar estos modelos en GPUs de consumo con un máximo de 32 GB de VRAM, incluyendo ajustes específicos para hardware Blackwell de consumo (sm120/sm121) y variables de entorno necesarias para el backend de MoE con compressed-tensors. Es un recurso de referencia para desarrolladores que quieran desplegar agentes basados en Qwen3 con tool calling y razonamiento, así como para quienes necesiten instrucciones de instalación de CUDA en WSL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de snapshots, no modelo entrenado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los modelos referenciados admiten hasta 196608 tokens en configuracion INT4) |
| Tipos de cuantizacion | GPTQ-INT4, AWQ-NVFP4 (en los modelos referenciados) |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (tag del repo), repo.tar (snapshot de Git) |

## Arquitectura y entrenamiento

No aplica directamente: este repositorio no contiene un modelo entrenado ni pesos propios. Los modelos referenciados en los comandos de despliegue son arquitecturas MoE basadas en Qwen3, segun se deduce de los parsers de tool calling (`qwen3_coder`) y de razonamiento (`qwen3`) empleados en las configuraciones de vLLM. El modelo Qwen-AgentWorld-35B-A3B indica 35 mil millones de parametros totales y 3 mil millones activos (A3B), lo que confirma su naturaleza de mezcla de expertos. No se proporciona informacion sobre datos de entrenamiento, numero de tokens ni metodologia de alineacion (RLHF, DPO, etc.) en la model card.

## Capacidades

El repositorio en si no aporta capacidades de modelo, pero documenta el despliegue de modelos con las siguientes caracteristicas:

- Tool calling / function calling mediante el parser `qwen3_coder`.
- Razonamiento multi-paso con el parser `qwen3` y `--reasoning-parser`.
- Modo agente con seleccion automatica de herramientas (`--enable-auto-tool-choice`).
- Soporte de contexto largo: hasta 196608 tokens en la configuracion INT4 de Agents-A1, 172032 tokens en NVFP4 y 131072 tokens en Qwen-AgentWorld.
- Modo solo lenguaje (`--language-model-only`) para el modelo AgentWorld.
- Compatibilidad con backend MoE Marlin para cuantizacion NVFP4 en GPUs Blackwell.

## Casos de uso

- Despliegue de agentes conversacionales con vLLM en GPUs de consumo: los comandos documentados permiten servir Agents-A1 y Qwen-AgentWorld-35B-A3B con un maximo de 32 GB de VRAM, con ventanas de contexto de hasta 196608 tokens, adecuado para sesiones de agente largas con historial extenso.
- Referencia de configuracion para vLLM en Windows: el repositorio enlaza wheels de vllm-windows y sugiere alternativas si una no funciona, util para entornos de desarrollo sin Linux nativo.
- Instalacion de CUDA en WSL: incluye instrucciones paso a paso para instalar el toolkit CUDA optimizado para WSL sin depender de paquetes .deb, incluyendo la gestion de claves de firma de apt y la politica de rechazo de SHA1.
- Snapshot del proyecto AGPL "Odyssues": el `repo.tar` mantiene una copia actualizada del head de Git de este proyecto, util para desarrolladores que quieran auditar o contribuir al codigo.
- Evaluacion de cuantizaciones alternativas: compara configuraciones INT4 y NVFP4 para el mismo modelo base (Agents-A1), con parametros de memoria y longitud de contexto distintos, lo que permite decidir entre calidad y rendimiento.
- Investigacion de modelos abliterados: la model card menciona que existen versiones abliteradas de AgentWorld con una comunidad mayor, y sugiere investigarlas, lo que puede servir para explorar variantes sin restricciones de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones, ni datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM maxima documentada: 32 GB, segun la propia model card ("Serve commands for 32GB vram maximum overhead").
- GPU recomendadas: tarjetas Blackwell de consumo, con sm120 (RTX 5090) y sm121 (RTX 6000+ y Blackwell de datacenter) mencionadas explicitamente.
- Backend obligatorio: para la configuracion NVFP4 se requiere `--moe-backend marlin` y la variable de entorno `VLLM_USE_FLASHINFER_SAMPLER=0`, necesarias para compressed-tensors en sm120/sm121.
- Opciones de despliegue: vLLM como servidor principal, con soporte para WSL y Windows mediante wheels de vllm-windows.
- Parametros de memoria: `--gpu-memory-utilization` entre 0,73 y 0,88 segun la configuracion, y `--max-num-seqs 2` para limitar la concurrencia.
- No se proporcionan datos de latencia ni throughput estimados.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo, por lo que no procede una comparativa directa con alternativas. Los modelos referenciados (Agents-A1 y Qwen-AgentWorld-35B-A3B) pertenecen a la familia Qwen3, pero no se dispone de datos de rendimiento propios para contrastarlos con otros modelos de su categoria.

## Limitaciones y advertencias

- No es un modelo entrenado: se trata de un archivo de referencias y snapshots, por lo que no ofrece capacidades de generacion propias.
- Licencia AGPL-3.0: impone obligaciones de copyleft para cualquier uso comercial o distribucion derivada, lo que puede ser restrictivo en entornos empresariales.
- Dependencia de modelos de terceros: los comandos de despliegue apuntan a repositorios externos (compute1, cyankiwi, groxaxo, protoLabsAI) cuya disponibilidad y licencias no estan garantizadas.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de que las configuraciones hayan sido probadas por terceros.
- Sin idiomas documentados: no se especifican los idiomas soportados por los modelos referenciados.
- Riesgo de obsolescencia: las instrucciones de instalacion de CUDA y las politicas de apt mencionadas estan fechadas y pueden quedar desactualizadas (por ejemplo, el aviso de rechazo de claves SHA1 a partir de febrero de 2026).
- Sin garantias de rendimiento: no se aportan benchmarks ni mediciones de latencia, por lo que el rendimiento real en hardware concreto es desconocido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sHEL1562/shelling
- Documentacion y tooling: https://docs.shel.sh/
- Wheels de vllm-windows: https://github.com/SystemPanic/vllm-windows/releases
- Modelo referenciado (INT4): https://huggingface.co/compute1/Agents-A1-GPTQ-INT4-Sym
- Modelo referenciado (NVFP4): https://huggingface.co/cyankiwi/Agents-A1-AWQ-NVFP4
- Modelo referenciado (AgentWorld): https://huggingface.co/groxaxo/Qwen-AgentWorld-35B-A3B-GPTQ-Pro-Int4
- Configuracion de referencia para NVFP4: https://huggingface.co/protoLabsAI/Agents-A1-NVFP4
