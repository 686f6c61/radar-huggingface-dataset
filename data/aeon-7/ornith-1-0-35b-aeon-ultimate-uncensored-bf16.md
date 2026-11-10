# AEON-7/Ornith-1.0-35B-AEON-Ultimate-Uncensored-BF16

## Resumen

Ornith-1.0-35B-AEON-Ultimate-Uncensored-BF16 es una compilación "abliterated" (sin rechazos) del modelo agentico de codigo `deepreinforce-ai/Ornith-1.0-35B`, publicada por el usuario AEON-7. El modelo base es un Mixture-of-Experts (MoE) de 35.107.181.936 parametros totales con arquitectura hibrida `qwen3_5_moe`: 40 capas (30 de atencion lineal GatedDeltaNet y 10 de atencion completa), 256 expertos enrutados mas 1 compartido, torre de vision y contexto de 256K tokens. Segun la model card, los pesos del miembro 35B-MoE se inicializan a partir de `Qwen/Qwen3.6-35B-A3B` (rel-L2 0.0022 frente a 0.0256 respecto a Qwen3.5-35B-A3B-Base).

El objetivo de esta variante es eliminar el comportamiento de rechazo del modelo original preservando su capacidad agentica y de codigo. Para ello se aplica abliteracion con biproyeccion que preserva la norma y "Expert-Granular Abliteration" (EGA) sobre los 256 expertos fusionados, el experto compartido y la supresion del router, con busqueda multiobjetivo Optuna (rechazos frente a divergencia KL). Antes de la abliteracion se reparan dos bloques atipicos de `conv1d` en las capas 36 y 37 (metodo FernflowerAI) para evitar el colapso de coherencia.

La relevancia actual reside en que combina un modelo de codigo agentico de referencia (Terminal-Bench 2.1 = 64,2; SWE-bench Verified = 75,6 segun el autor) con una eliminacion de rechazos medida: 0/80 rechazos en un conjunto de 80 prompts daninos diversos, con un KL de primer token de ~0,0014 y un pass@1 agentico de 0,833 identico al original en una sonda de 18 tareas. Se distribuye con licencia MIT y pesos en BF16 (~66 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido `qwen3_5_moe`: 40 capas (30 GatedDeltaNet de atencion lineal + 10 de atencion completa), 256 expertos enrutados + 1 compartido, torre de vision |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible (el sufijo A3B del base sugiere ~3B activos, no confirmado en la informacion) |
| Longitud de contexto | 256K tokens (262.144) |
| Tipos de cuantizacion | BF16 (este repo); NVFP4 (~23,7 GB, solo pesos MLP, requiere GPU Blackwell); FP8 no viable segun el autor |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers); tamano del repo 70,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un MoE hibrido con atencion lineal GatedDeltaNet en 30 de las 40 capas y atencion completa en las 10 restantes, 256 expertos enrutados mas un experto compartido y una torre de vision heredada del modelo base. La model card indica que el 35B-MoE se inicializa desde `Qwen/Qwen3.6-35B-A3B`, aunque la card original de la familia afirma un post-entrenamiento sobre Gemma 4 y Qwen 3.5. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO del modelo base en la informacion proporcionada.

La innovacion de esta compilacion es el proceso de abliteracion: reparacion de outliers en `conv1d` (capas 36/37, sigma de 0,10 a 0,062), abliteracion con `abliterix` v1.9 aplicando biproyeccion que preserva la norma y EGA sobre los 256 expertos fusionados, el experto compartido y el router, dejando intactos Q/K/V (`attn_output_gate`), los internos de GatedDeltaNet/SSM y la torre de vision. Se selecciono un ajuste de expertos 170 veces mas suave que el candidato de menor rechazo para evitar la degeneracion en generacion larga, manteniendo un KL de primer token de ~0,0014.

## Capacidades

- Generacion de texto conversacional y razonamiento con modo "thinking": cada turno abre un bloque `<think>...</think>`.
- Codigo agentico: el autor reporta SWE-bench Verified 75,6 y Terminal-Bench 2.1 64,2 en el modelo base.
- Tool calling / function calling: soportado en vLLM con `--enable-auto-tool-choice --tool-call-parser qwen3_coder`.
- Razonamiento multi-paso y uso de agentes (etiquetas `agentic`, `swe-bench`, `terminal-bench`).
- Multimodal: entrada image-text-to-text con torre de vision intacta (imagen y video); limite sugerido de 4 imagenes y 2 videos por prompt en vLLM.
- Multilingue: no disponible (no se detallan idiomas).
- Sin rechazos: comportamiento de rechazo eliminado (0/80 en la validacion del autor).

## Casos de uso

- Generacion de codigo en produccion: puede integrarse en pipelines de CI/CD para proponer parches y ejecutar tool calls, con contexto de 256K tokens para repositorios completos y un pass@1 agentico reportado de 0,833 en la sonda del autor.
- Agentes autonomos de terminal: adecuado para tareas de tipo Terminal-Bench donde el modelo emite comandos y llamadas a herramientas de forma iterativa.
- Asistente de ingenieria sobre base de codigo: ventana de 256K para analizar multiples ficheros y mantener contexto de conversacion largo en tareas de refactorizacion.
- Analisis de documentos e imagenes: la torre de vision permite procesar capturas, diagramas o videos junto a texto en flujos de extraccion y respuesta.
- Investigacion sobre seguridad y alineacion: util para estudiar comportamiento sin rechazos y medir diferencias frente al modelo original (KL ~0,0014).
- Despliegue en DGX Spark / GB10: la variante NVFP4 (~23,7 GB) permite servir el modelo en hardware Blackwell con memoria unificada, segun las instrucciones del autor.

## Benchmarks y rendimiento

| Metrica | Ornith-1.0-35B original | Este modelo |
|---|---|---|
| Rechazos (80 prompts daninos diversos: CBRN, ciber, armas, autolesion) | alto (sin cifra) | 0 / 80 (0,0%) |
| Pass@1 agentico/codigo (sonda propia de 18 tareas) | 0,833 | 0,833 (identico por familia) |
| KL de primer token frente al base | — | ~0,0014 |
| Coherencia (benigno + danino, generacion larga) | — | limpia (sin degeneracion) |
| Terminal-Bench 2.1 (base, citado) | 64,2 | no disponible |
| SWE-bench Verified (base, citado) | 75,6 | no disponible |

Los datos de Terminal-Bench y SWE-bench corresponden al modelo base segun el autor; no se aportan mediciones de esta variante en esos benchmarks. La variante NVFP4 se valida como identica a este BF16: 0,833 (15/18) agentico, 0 rechazos y 0 degenerados.

## Requisitos de hardware

- VRAM estimada: ~66 GB en BF16 (repo de 70,2 GB); ~23,7 GB en NVFP4.
- GPU recomendadas: para BF16, GPUs con suficiente VRAM agregada o memoria unificada; el autor cita DGX Spark (GB10) y menciona B200 (sm_100) para NVFP4.
- NVFP4 requiere GPU Blackwell (B200 / sm_100 o GB10 / sm_120); FP8 no es viable segun el autor (W8A8 degrada coherencia y W8A16 carece de kernel ScaledMM).
- En DGX Spark (memoria unificada) el autor recomienda `--gpu-memory-utilization` entre 0,6 y 0,7; por encima de ~0,8 el pool compartido CPU+GPU provoca page thrashing. En GPUs con VRAM discreta se puede subir.
- Despliegue: vLLM (comando de inicio incluido por el autor con `--max-model-len 262144`, `--mamba-cache-dtype float32`, `--attention-backend flash_attn`, `--enable-chunked-prefill`, `--enable-prefix-caching`, `--trust-remote-code`). No se mencionan llama.cpp, Ollama ni TGI.
- Muestreo recomendado: temperature 0,6, top_p 0,95, top_k 20.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.0-35B-AEON-Ultimate-Uncensored-BF16 | 35,1B (MoE) | 256K | Pass@1 agentico 0,833 (sonda 18 tareas); 0/80 rechazos | MIT | Vision, thinking, sin rechazos |
| deepreinforce-ai/Ornith-1.0-35B (base) | 35,1B (MoE) | 256K | Terminal-Bench 2.1 64,2; SWE-bench Verified 75,6 | MIT | Con rechazos; referencia de capacidad |
| Qwen/Qwen3.6-35B-A3B (origen de pesos) | 35B (MoE, A3B) | no disponible | no disponible | no disponible | Inicializacion del 35B-MoE segun correlacion de pesos |
| Variante NVFP4 del mismo modelo | 35,1B (MoE) | 256K | 0,833 (15/18); 0 rechazos | MIT | ~23,7 GB; requiere Blackwell |

No se dispone de comparaciones con otros modelos abliterated de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin rechazos: genera contenido que el base rechazaria, incluido material peligroso (herramientas daninas, quimicos, agentes biologicos, codigo de explotacion), violencia, autolesion, sexualidad grafica y contenido ilegal en algunas jurisdicciones.
- Riesgo operativo: al ser un modelo agentico de codigo, sus salidas son a menudo tool calls y codigo que sistemas posteriores ejecutan; una instruccion erronea o maliciosa puede convertirse en una accion real sin supervision humana.
- Alucinacion: no se aportan mediciones especificas; el modo thinking puede producir cadenas de razonamiento extensas.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingue.
- La abliteracion, aunque medida (KL ~0,0014), puede alterar comportamientos sutiles no cubiertos por la sonda de 18 tareas.
- La reparacion de outliers en `conv1d` y el ajuste de expertos implican modificaciones no triviales; la coherencia se valida solo con pruebas del autor.
- FP8 no es una ruta viable segun el autor; la cuantizacion de baja precision requiere hardware Blackwell.
- Licencia MIT, lo que permite uso comercial, pero la responsabilidad legal y etica del contenido generado recae en el usuario.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/AEON-7/Ornith-1.0-35B-AEON-Ultimate-Uncensored-BF16
- Variante NVFP4: https://huggingface.co/AEON-7/Ornith-1.0-35B-AEON-Ultimate-Uncensored-NVFP4
- Modelo base: https://huggingface.co/deepreinforce-ai/Ornith-1.0-35B
- Licencia del base: https://huggingface.co/deepreinforce-ai/Ornith-1.0-35B/blob/main/LICENSE
- Repositorio de la receta: https://github.com/AEON-7/Ornith-1.0-35B-AEON-Ultimate-Uncensored
- Herramienta de abliteracion: https://github.com/wuwangzhang1216/abliterix
