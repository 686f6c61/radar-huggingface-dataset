# poisonxa/PXA-Fusion4-35B-GGUF

## Resumen
PXA-Fusion4-35B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 35.505.251.456 parámetros totales y aproximadamente 3B activos por token, desarrollado por el usuario poisonxa bajo el paraguas de PXA Network. Se construye sobre una base Qwen3.5-35B-A3B y se distribuye exclusivamente en formato GGUF con cuantizaciones propietarias PXQ, orientadas a ejecución íntegra en GPU con VRAM limitada. La licencia declarada es Apache 2.0.

El modelo se presenta como una variante "abliterated" y "uncensored" afinada para uso agéntico, tool calling y generación de código, con un énfasis explícito en resistencia a la fabricación de información (anti-fabrication) y en el rechazo de premisas falsas. Incluye una cabeza de decodificación especulativa (MTP) en todas las cuantizaciones publicadas, lo que permite acelerar la generación cuando se activa mediante el motor PXA.

Su relevancia actual reside en la combinación de un MoE de 35B con cuantizaciones de muy bajo bit por peso (PXQ4 a ~4,27 bpw y PXQ2 a ~2,57 bpw) que caben en una sola GPU de 24 GB o incluso de 16 GB, respectivamente. Esto lo sitúa en el nicho de modelos grandes ejecutables en hardware consumer o de segunda mano (P100, V100, T4), un espacio poco cubierto por los lanzamientos convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida, 256 expertos × 40 capas, cabeza MTP de decodificación especulativa |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3B por token (denominación 35B-A3B) |
| Longitud de contexto | Hasta 73.728 tokens en la configuración de referencia del autor; 32.768 en el modo agéntico recomendado |
| Tipos de cuantizacion | PXQ4 (~4,27 bpw, 19,3 GB), PXQ2 (~2,57 bpw, 11,2 GB); banco de expertos en PXQ4, tensores shared-expert y attention-gate en MXFP4, K/V de atención en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con plantilla de chat Jinja embebida) |

## Arquitectura y entrenamiento
La base es un transformer MoE de Qwen 3.5-35B-A3B con 256 expertos distribuidos en 40 capas y enrutamiento que activa aproximadamente 3B parámetros por token. Emplea atención híbrida con una huella de KV reducida, lo que facilita mantener contextos largos en GPU de gama media. Sobre esta base, el autor aplica un pipeline propio de ingeniería de pesos en varias etapas: fusión en el espacio de pesos, calibración imatrix del banco de expertos, una edición diferencial orientada a incrementar el rechazo de premisas falsas sin eliminar el comportamiento "uncensored", y el injerto de una cabeza de decodificación especulativa (MTP) presente en todas las cuantizaciones publicadas.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. El proceso de "abliteration" implica la modificación de direcciones de rechazo en el espacio de activaciones, técnica que no se detalla cuantitativamente. La plantilla de chat sufrió una corrección el 2026-07-24 por un valor por defecto invertido de `enable_thinking`, que provocaba etiquetas `<think>` sin cerrar; los pesos no cambiaron, solo los metadatos de la plantilla.

## Capacidades
- Generación de texto y razonamiento con modo de pensamiento opcional (`enable_thinking`), desactivado por defecto tras la corrección de la plantilla.
- Tool calling y function calling orientados a flujos agénticos, con énfasis en la emisión fiable de llamadas a herramientas.
- Razonamiento multi-paso y uso en arneses de agentes y de programación.
- Generación de código e integración en pipelines de desarrollo.
- Comportamiento "uncensored"/"abliterated": menor propensión a rechazar peticiones por políticas de contenido.
- Resistencia a la fabricación y rechazo de premisas falsas ("anti-fabrication").
- Decodificación especulativa mediante cabeza MTP (inactiva salvo que se pase `--spec-type`).
- Capacidades de visión: el proyector de visión fue retirado del repositorio en la limpieza del 29 de julio y no está disponible actualmente.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso
- Agentes autónomos de código: el modelo está afinado para tool calling y emisión de llamadas a herramientas, y con la configuración agéntica recomendada (presencia y repetición penalizadas, `--reasoning off`) puede integrarse en arneses que editan ficheros y ejecutan comandos en pipelines de CI/CD.
- Asistencia de programación en local: con PXQ4 (19,3 GB) cabe en una RTX 4090 o en 2×16 GB, permitiendo autocompletado y generación de código sin depender de API externa.
- Despliegue en hardware de segunda mano: la cuantización PXQ2 (11,2 GB) está medida en una V100 de 16 GB con 10,0 GiB de pesos, 0,4 GiB de KV a 16k de contexto y 0,5 GiB de cómputo, lo que habilita inferencia en P100, V100 o T4.
- Procesamiento de documentos largos: la ventana de hasta 73.728 tokens en la configuración de referencia permite resumir o extraer información de contratos, informes o bases de código extensas en una sola pasada.
- Investigación sobre alineación y censura: al ser una variante abliterated, sirve para estudiar el comportamiento del modelo ante premisas falsas y comparar su tasa de rechazo frente a la base Qwen original.
- Atención al cliente con contexto multi-turno: la ventana larga y la penalización de presencia configurada facilitan conversaciones extensas sin colapso en bucles, siempre que se aplique la plantilla correcta.
- Generación de contenido sin restricciones editoriales: el carácter uncensored lo hace apto para entornos donde las políticas de contenido estándar resultan demasiado restrictivas, con la responsabilidad legal que ello conlleva.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. El autor únicamente reporta métricas de velocidad de inferencia medidas con su motor PXA en protocolo "fair-battle" (prompt frío de ~5,8k tokens, temperatura 0, mediana de 3 ejecuciones):

| Configuración | Prefill (t/s) | Decode (t/s) | Decode + MTP (t/s) |
|---|---|---|---|
| 2× Tesla P100 (sm_60), PXQ4 | 1.163 | 56,8 | 60,7 (aceptación ~0,68) |
| 1× Tesla V100 (sm_70), PXQ4 | 2.358 | no disponible | 108,3 |

## Requisitos de hardware
- VRAM para PXQ4: 19,3 GB de fichero; cabe en una GPU de 24 GB o en 2×16 GB.
- VRAM para PXQ2: 11,2 GB de fichero; medido en V100 de 16 GB con 10,0 GiB de pesos, 0,4 GiB de KV a 16k de contexto y 0,5 GiB de cómputo.
- GPU recomendadas: RTX 4090 (24 GB) para PXQ4 en una sola tarjeta; Tesla V100, P100 o T4 (16 GB) para PXQ2. No se documentan requisitos para A100 o H100, aunque por capacidad de VRAM son compatibles.
- Cabe en GPU consumer: sí, PXQ4 en una RTX 4090 de 24 GB y PXQ2 en tarjetas de 16 GB.
- Opciones de despliegue: motor PXA (basado en llama.cpp, con `llama-server`), con soporte de `--jinja`, plantilla de chat embebida, `--spec-type mtp:n_max=1` para decodificación especulativa y variables como `PXA_ENHANCE=1`. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: ver tabla de benchmarks; 108,3 t/s de decodificación con MTP en una V100 y 60,7 t/s en 2×P100 con PXQ4.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| PXA-Fusion4-35B | 35,5B | ~3B | hasta 73.728 | Apache 2.0 | GGUF (PXQ) | Abliterated, MTP, cuantizaciones de 2,57 y 4,27 bpw |
| Qwen3.5-35B-A3B (base) | 35B | ~3B | no disponible | no disponible | safetensors y GGUF | Modelo fundacional sin modificaciones de alineación |
| Alternativas MoE de ~30-35B | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La comparación cuantitativa con alternativas de la misma categoría no está disponible en la documentación consultada; no se aportan cifras de rendimiento relativas a otros modelos.

## Limitaciones y advertencias
- Riesgo de bucles y divagación si se omite la plantilla de chat correcta: el autor identifica la falta de `--jinja` y `--chat-template-kwargs '{"enable_thinking":false}'` como la primera causa de comportamiento errático.
- El modo de pensamiento está desactivado por defecto; activarlo sin presupuesto de tokens en prompts abiertos largos puede degradar la calidad de las respuestas agénticas.
- Al ser una variante abliterated y uncensored, puede producir contenido que otras versiones rechazarían; no se documentan evaluaciones de seguridad ni filtros.
- No hay datos publicados sobre sesgos, tasas de alucinación medidas ni evaluación multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de información sobre la procedencia exacta de los datos de entrenamiento y sobre las obligaciones de la base Qwen debe verificarse antes de un despliegue en producción.
- El proyector de visión y las cuantizaciones PXQU12, PXQU16 y PXQ6 fueron retirados del repositorio; solo PXQ4 y PXQ2 están publicadas actualmente.
- El tamaño del repositorio (401,5 GB) implica que la descarga completa es costosa; conviene descargar solo el fichero GGUF necesario.
- No se especifican los idiomas soportados, por lo que el rendimiento en castellano no está garantizado.

## Enlaces
- Hugging Face: https://huggingface.co/poisonxa/PXA-Fusion4-35B-GGUF
- Motor PXA (GitHub): https://github.com/poisonxa16/pxa
- Discord: https://discord.pxanetwork.com
- Reddit: https://www.reddit.com/r/PXANetwork/
