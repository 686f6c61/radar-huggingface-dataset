# AEON-7/Ornith-1.0-35B-AEON-Ultimate-Uncensored-BF16

## Resumen

Ornith-1.0-35B-AEON-Ultimate-Uncensored-BF16 es una variante "abliterated" (sin rechazos) del modelo agentico de codigo Ornith-1.0-35B de DeepReinforce. Lo publica el usuario AEON-7 sobre el checkpoint base `deepreinforce-ai/Ornith-1.0-35B`, y aplica una eliminacion selectiva del comportamiento de rechazo manteniendo, segun el autor, la capacidad original intacta. El modelo es un MoE multimodal de 35.107.181.936 parametros totales con torre de vision y contexto de 256K tokens.

La arquitectura es `qwen3_5_moe`: 40 capas (30 de atencion lineal GatedDeltaNet y 10 de atencion completa), 256 expertos enrutados mas 1 compartido (configuracion A3B, es decir, aproximadamente 3.000 millones de parametros activos por token). El autor documenta que los pesos se inicializan a partir de `Qwen/Qwen3.6-35B-A3B`, aunque la model card original menciona post-entrenamiento sobre Gemma 4 y Qwen 3.5.

Su relevancia actual radica en dos factores: por un lado, es un modelo de codigo agentico con resultados reportados de Terminal-Bench 2.1 = 64,2 y SWE-bench Verified = 75,6 en el modelo base; por otro, esta version elimina los rechazos de seguridad conservando esas capacidades, lo que lo hace atractivo para entornos de investigacion de seguridad y para despliegues donde el filtrado se delega a capas externas. La licencia es MIT y el repo ocupa 70,2 GB en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE con atencion lineal GatedDeltaNet (`qwen3_5_moe`): 40 capas (30 GatedDeltaNet + 10 atencion completa), 256 expertos enrutados + 1 compartido |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | Aproximadamente 3 B por token (configuracion A3B) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | BF16 (este repo); NVFP4 (variante oficial, ~23,7 GB); FP8 no viable segun el autor |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16), libreria transformers; compatible con vLLM |

## Arquitectura y entrenamiento

El modelo es un transformer hibrido con mezcla de expertos. Combina 30 capas de atencion lineal basada en GatedDeltaNet (un mecanismo de espacio de estados con puerta delta) con 10 capas de atencion completa, lo que reduce el coste cuadratico en contextos largos y permite sostener 256K tokens. El bloque MoE tiene 256 expertos enrutados mas uno compartido, con unos 3.000 millones de parametros activos por token. Incluye una torre de vision que habilita entrada image-text-to-text, y el autor indica que la torre de vision y los internos de GatedDeltaNet/SSM no se han modificado respecto al base.

El proceso de "abliteration" aplicado por AEON-7 consta de tres fases documentadas. Primero, una reparacion de valores atipicos en el `conv1d` del SSM (metodo FernflowerAI) que reescala dos bloques problematicos (capas 36 y 37, de sigma 0,10 a 0,062) para evitar el colapso de coherencia. Segundo, la abliteracion propiamente dicha con `abliterix` v1.9, usando biproyeccion con preservacion de norma de grimjim y Expert-Granular Abliteration (EGA) sobre los 256 expertos fusionados, el experto compartido y la supresion del router, con busqueda multiobjetivo Optuna entre rechazos y divergencia KL. Las proyecciones Q/K/V no se tocan (`attn_output_gate`). Tercero, una seleccion de "rodilla suave": el ensayo con menos rechazos resultaba sobre-abliterado y degeneraba en generacion larga, por lo que se envio una edicion de expertos 170 veces mas ligera que mantiene la eliminacion de rechazos sin perdida de coherencia. No se dispone de datos sobre el volumen o composicion del dataset de entrenamiento original del base.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento: cada turno abre un bloque `<think>…</think>` (parser de razonamiento `qwen3` en vLLM).
- Codigo agentico: resultados reportados en el base de SWE-bench Verified 75,6 y Terminal-Bench 2.1 64,2.
- Tool calling y function calling: soporte nativo con `--enable-auto-tool-choice --tool-call-parser qwen3_coder` en vLLM.
- Razonamiento multi-paso y uso de agentes en terminal y pipelines de codigo.
- Vision multimodal: entrada de imagen y video (image-text-to-text), con limite configurable por prompt (por ejemplo, 4 imagenes y 2 videos).
- Capacidad de contexto largo: hasta 262.144 tokens.
- Sin rechazos de seguridad: 0 de 80 prompts daneses en la validacion del autor.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de codigo autonomo en terminal: el modelo puede ejecutar tareas de tipo Terminal-Bench (edicion de ficheros, ejecucion de comandos, correccion de errores) gracias a su soporte de tool calling y a su contexto de 256K, que permite mantener el estado de un repositorio completo en la ventana.
- Resolucion de issues en produccion: integrado en un pipeline de CI/CD con vLLM y el parser `qwen3_coder`, puede recibir un issue de GitHub, inspeccionar el codigo relevante y proponer un parche verificable, apoyandose en el rendimiento reportado de SWE-bench Verified 75,6 del base.
- Investigacion de seguridad y red teaming: al no emitir rechazos, sirve para estudiar comportamientos del modelo sin la capa de negativa, generar casos adversarios y evaluar la eficacia de filtros externos, con la advertencia de que la responsabilidad recae en el operador.
- Analisis de documentacion tecnica con vision: la torre de vision permite procesar capturas de pantalla, diagramas de arquitectura o imagenes de errores y combinarlas con el contexto de codigo para diagnosticar fallos.
- Asistente de refactorizacion a gran escala: con 256K de contexto puede cargar modulos completos y mantener coherencia entre multiples ficheros en una sola sesion, reduciendo la perdida de contexto entre llamadas.
- Despliegue en estacion de trabajo DGX Spark: la variante NVFP4 (~23,7 GB) esta pensada para GB10/sm_120 y permite ejecutar el modelo en memoria unificada con `--gpu-memory-utilization` entre 0,6 y 0,7.
- Generacion de contenido sin restricciones para investigacion creativa o editorial: util en entornos controlados donde el filtrado de seguridad se aplica en una capa posterior y se necesita que el modelo no se autocensure.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, medidos sobre este modelo y su base:

| Metrica | Ornith-1.0-35B (base) | Este modelo |
|---|---|---|
| Rechazos (80 prompts daneses diversos: CBRN, ciber, armas, autolesion) | alto | 0 / 80 (0,0 %) |
| Agentico/codigo pass@1 (sonda propia de 18 tareas) | 0,833 | 0,833 (identico por familia) |
| KL del primer token frente al base | — | ~0,0014 |
| Coherencia (benigno + danes, generacion larga) | — | limpia, sin degeneracion |
| Terminal-Bench 2.1 (base, reportado) | 64,2 | no disponible |
| SWE-bench Verified (base, reportado) | 75,6 | no disponible |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM en BF16: aproximadamente 66 GB de pesos, mas cache KV y cache Mamba; el repo ocupa 70,2 GB.
- VRAM en NVFP4: aproximadamente 23,7 GB, con expertos y MLP compartido en NVFP4 y atencion, GatedDeltaNet, vision, puertas y embeddings en BF16.
- GPU recomendadas: A100 80 GB o H100 para BF16 con contexto largo; B200 (sm_100) o GB10 (sm_120) para la variante NVFP4.
- GPU de consumo: el BF16 no cabe en RTX 4090 (24 GB) sin cuantizacion adicional; la variante NVFP4 de 23,7 GB queda al limite en 24 GB y esta validada para Blackwell, no para Ada.
- Despliegue: vLLM es la opcion documentada, con `--trust-remote-code`, `--attention-backend flash_attn`, `--enable-chunked-prefill` y `--enable-prefix-caching`. No se documentan recetas para llama.cpp, Ollama ni TGI.
- En DGX Spark (memoria unificada) se recomienda `--gpu-memory-utilization` de 0,6 a 0,7; por encima de 0,8 el pool compartido CPU+GPU sufre page thrashing. En GPUs con VRAM discreta se puede subir.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.0-35B-AEON-Ultimate-Uncensored (este) | 35,1 B totales / ~3 B activos | 256K | pass@1 agentico 0,833 (sonda propia); 0 rechazos | MIT | Hugging Face (BF16 y NVFP4) |
| deepreinforce-ai/Ornith-1.0-35B (base) | 35,1 B totales / ~3 B activos | 256K | Terminal-Bench 2.1 64,2; SWE-bench Verified 75,6; rechazos altos | MIT | Hugging Face |
| Qwen/Qwen3.6-35B-A3B (origen de pesos segun correlacion) | ~35 B totales / ~3 B activos | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos abliterated de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin rechazos: genera contenido que el base rechazaria, incluidos instrucciones para herramientas peligrosas, agentes quimicos o biologicos, codigo de explotacion, violencia, autolesion y contenido sexual grafico. No emite juicio interno sobre si cumplir.
- Riesgo agentico: al ser un modelo de codigo agentico, sus salidas son a menudo llamadas a herramientas y codigo que sistemas posteriores ejecutan; una instruccion maliciosa o erronea puede convertirse en una accion real con efectos secundarios.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la sonda de validacion del autor es de solo 18 tareas y no cubre dominios generales.
- La validacion de capacidades se limita a la sonda propia del autor (18 tareas) y a las metricas del base; no hay evaluacion independiente publicada.
- Idiomas soportados: no disponibles; no se puede garantizar calidad multilingue fuera del ingles.
- Restricciones de licencia: MIT permite uso comercial, pero el contenido generado puede ser ilegal en algunas jurisdicciones y la responsabilidad recae en el operador.
- FP8 no es viable segun el autor: W8A8 degrada la coherencia y W8A16 carece de kernel ScaledMM. La cuantizacion de baja precision recomendada es NVFP4, que exige GPU Blackwell.
- La torre de vision y los internos de GatedDeltaNet/SSM no se modificaron, por lo que el comportamiento multimodal y de atencion lineal es el del base.
- En memoria unificada (DGX Spark) hay que limitar `--gpu-memory-utilization` a 0,6-0,7 para evitar thrashing.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AEON-7/Ornith-1.0-35B-AEON-Ultimate-Uncensored-BF16
- Variante NVFP4: https://huggingface.co/AEON-7/Ornith-1.0-35B-AEON-Ultimate-Uncensored-NVFP4
- Modelo base: https://huggingface.co/deepreinforce-ai/Ornith-1.0-35B
- Licencia del base: https://huggingface.co/deepreinforce-ai/Ornith-1.0-35B/blob/main/LICENSE
- Repositorio de la receta de abliteracion: https://github.com/AEON-7/Ornith-1.0-35B-AEON-Ultimate-Uncensored
- Herramienta abliterix: https://github.com/wuwangzhang1216/abliterix
- Soporte del autor: https://lotusmake.com/support
