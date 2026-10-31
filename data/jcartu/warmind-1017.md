# jcartu/WARMIND-1017

## Resumen

WARMIND-1017 es una versión *abliterated* (con las direcciones internas de rechazo modificadas) de DeepSeek-V4.1-Flash-1017, publicada por el usuario jcartu en Hugging Face. No es una arquitectura nueva ni un modelo entrenado desde cero: es el checkpoint original de DeepSeek, publicado el 17 de octubre de 2026, al que se le han invertido las direcciones de rechazo en 132 tensores densos, manteniendo intacto el resto del checkpoint. Su propósito es ofrecer un modelo de razonamiento sin las negativas y respuestas evasivas del modelo base, manteniendo el formato nativo de pesos original.

El modelo base es un MoE de 40 capas con 384 expertos enrutados (6 activos más 1 compartido), contexto de 1.048.576 tokens y pesos en FP8 E4M3 con escalas de bloque UE8M0, junto con expertos en FP4 nativo. Con 763.205.315.794 parámetros totales según los safetensors y un tamaño de repositorio de 510,3 GB, se trata de un modelo de escala muy grande orientado a despliegues multi-GPU con vLLM. Es relevante porque preserva el layout oficial de DeepSeek (48 shards, config, tokenizador), lo que lo hace compatible con los mismos runtimes que el checkpoint original, a diferencia de su hermano en formato contenedor CSF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE de 40 capas, hidden 5120, 384 expertos enrutados (6 activos) + 1 experto compartido, 3 capas MTP draft, tablas Engram de n-gramas |
| Parametros totales | 763.205.315.794 (dato real de safetensors) |
| Parametros activos | 6 expertos enrutados + 1 compartido por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | 1.048.576 tokens (según config.json) |
| Tipos de cuantizacion | FP8 E4M3 con escalas de bloque UE8M0 32x32 (pesos densos); expertos enrutados en FP4 nativo con escalas upstream |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada de DeepSeek; la edición no añade términos) |
| Formato de pesos | safetensors nativos (48 shards, 96.085 tensores, 510,3 GB) |

## Arquitectura y entrenamiento

La arquitectura es idéntica a la de DeepSeek-V4.1-Flash-1017: un transformer MoE de 40 capas con hidden size 5120, 384 expertos enrutados de los cuales 6 se activan por token más 1 experto compartido, 3 capas MTP (multi-token prediction) para decodificación especulativa y tablas Engram de n-gramas. El contexto nativo es de 1.048.576 tokens según el config.json. Los pesos densos están cuantizados en FP8 E4M3 con escalas de bloque UE8M0 de 32x32, y los expertos enrutados conservan su layout FP4 nativo upstream.

No hay entrenamiento en este derivado: la modificación consiste en un operador de abliteración que preserva la norma y reescribe dos familias de tensores (`attn.wo_b` y `ffn.shared_experts.w2`) en las capas 4 a 36, concretamente 132 tensores que suman 1.775.136.000 bytes (1,65 GiB, el 0,35 % del checkpoint), distribuidos en 33 de los 48 shards. No se tocó atención, enrutado ni expertos enrutados, y no hubo fine-tuning ni reentrenamiento. Los datos de entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto con capacidades de razonamiento (tag `reasoning` del modelo base).
- Reducción de negativas: responde a consultas que el checkpoint original rechaza o contesta con evasivas (según la sonda de seis prompts del autor, el base rechazaba 2 de 6; en la batería de 100 prompts del checkpoint anterior, 17 rechazos verdaderos y 73 respuestas evasivas de 100).
- Contexto extremadamente largo (1.048.576 tokens) para documentos extensos y conversaciones multi-turno.
- Decodificación especulativa mediante 3 capas MTP draft.
- Compatibilidad con el layout oficial de DeepSeek, por lo que los mismos loaders y runtimes del checkpoint upstream deberían aplicarse (vLLM y derivados).
- No hay evidencia en la información proporcionada de capacidades de visión, audio ni tool calling.

## Casos de uso

- Investigación sobre abliteración y alineamiento: al conservar el layout nativo y publicar provenancia byte a byte (DERIVATIVE.json, SHA256SUMS, EXPLAINER.md), es ideal para estudiar qué tensores codifican el comportamiento de rechazo sin variables de formato intermedias.
- Despliegue autoalojado en stacks vLLM estándar: al ser el layout ordinario de DeepSeek (no un contenedor CSF), cualquier stack que lea el checkpoint oficial puede servirlo directamente, útil en servidores con múltiples GPU.
- Asistentes de dominio técnico sin filtros corporativos: para laboratorios que necesitan respuestas directas a consultas técnicas sensibles (seguridad ofensiva, análisis forense) bajo su propia política de uso, sin las negativas del modelo base.
- Procesamiento de documentos muy largos: la ventana de 1.048.576 tokens permite analizar repositorios de código, expedientes legales o corpus completos en una sola sesión.
- Comparativa de comportamiento base frente a derivado: los informes de evaluación publicados (EVALUATION.md y EVALUATION-1017.md en el hermano CSF) permiten cuantificar cuánto se movió el modelo en rechazos y evasivas.
- Inferencia en hardware Blackwell: el formato FP8/FP4 nativo está pensado para GPUs de la generación RTX PRO 6000 Blackwell, donde el autor lo sirve con TP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este repositorio. El autor remite los informes de evaluación al repositorio hermano en formato CSF (EVALUATION.md y EVALUATION-1017.md), que tiene puerta de acceso, y cita datos parciales de comportamiento (17 rechazos verdaderos y 73 respuestas evasivas de 100 prompts en el checkpoint base anterior), pero no métricas tipo MMLU, HumanEval o GSM8K comparables.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 510,3 GB (510.296.708.312 bytes), por lo que se necesita al menos esa capacidad agregada de VRAM para servirlo sin descarga a disco; el autor lo mide en 4x NVIDIA RTX PRO 6000 Blackwell de 96 GB cada uno (384 GB totales) con tensor parallelism 4, lo que sugiere descarga parcial o que no todos los pesos residen simultáneamente en VRAM.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (96 GB) en configuración multi-GPU con TP4, según la medición del autor. No hay datos sobre A100/H100.
- Consumer GPUs: no cabe en una única GPU de consumo; se requiere una estación multi-GPU de gama alta (por ejemplo 4x RTX PRO 6000 de 96 GB).
- Despliegue: vLLM (el autor lo sirve con la imagen LiL de vLLM con loader genérico, vLLM-Moet y la receta BRRR). No hay evidencia de soporte verificado en llama.cpp, Ollama o TGI; al ser FP8/FP4 nativo, el soporte dependerá del runtime.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| | WARMIND-1017 | DeepSeek-V4.1-Flash-1017 (base) | DeepSeek-V4.1-Flash-1017-abliterated-lossless-CSF |
|---|---|---|---|
| Autor | jcartu | DeepSeek | jcartu |
| Parámetros totales | 763.205.315.794 | no disponible (mismo checkpoint base) | no disponible (mismos bytes editados) |
| Contexto | 1.048.576 tokens | 1.048.576 tokens | 1.048.576 tokens |
| Formato | safetensors nativos FP8/FP4 | safetensors nativos FP8/FP4 | contenedor CSF |
| Cambios | 132 tensores abliterados (0,35 %) | checkpoint original | mismos bytes editados, en contenedor |
| Licencia | MIT | MIT | MIT |
| Disponibilidad | descarga pública sin solicitud | descarga pública | con puerta de acceso |

## Limitaciones y advertencias

- Es un modelo abliterated: se han reducido deliberadamente sus negativas. Esto implica riesgo elevado de generar contenido perjudicial si se despliega sin salvaguardas externas; la responsabilidad de filtrado recae en el operador.
- La abliteración no convierte el modelo en un "oráculo sin evasivas": según el propio autor, reduce rechazos pero no elimina todas las respuestas evasivas, y no se han publicado métricas de calidad (MMLU, etc.) para este árbol concreto; las mediciones se tomaron sobre el hermano CSF.
- Los expertos enrutados conservan su layout FP4 upstream sin afirmación del autor sobre su estructura de bloques, lo que puede limitar la compatibilidad con runtimes que no soporten ese formato.
- Requiere hardware multi-GPU de gama alta (centenares de GB de VRAM o descarga a disco), fuera del alcance de la mayoría de estaciones de trabajo.
- Los idiomas soportados, datos de entrenamiento y benchmarks del modelo base no están disponibles en la información proporcionada.
- Aunque la licencia MIT permite uso comercial, el contenido sin filtros puede entrar en conflicto con las políticas de proveedores cloud y con la normativa aplicable según jurisdicción.
- Descargas muy bajas (72) y likes (2): comunidad y soporte mínimos; cualquier problema de runtime dependerá de la documentación del propio repositorio.

## Enlaces

- Repositorio: https://huggingface.co/jcartu/WARMIND-1017
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Hermano CSF (mismos bytes editados en contenedor): https://huggingface.co/jcartu/DeepSeek-V4.1-Flash-1017-abliterated-lossless-CSF
- Licencia MIT del repo: https://huggingface.co/jcartu/WARMIND-1017/blob/main/LICENSE
- Sumas de verificación: https://huggingface.co/jcartu/WARMIND-1017/blob/main/SHA256SUMS
- Informes de evaluación (en el repo CSF): https://huggingface.co/jcartu/DeepSeek-V4.1-Flash-1017-abliterated-lossless-CSF/blob/main/EVALUATION.md y https://huggingface.co/jcartu/DeepSeek-V4.1-Flash-1017-abliterated-lossless-CSF/blob/main/EVALUATION-1017.md
