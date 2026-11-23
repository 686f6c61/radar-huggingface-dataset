# Rikunarita/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO_Backbone-IQ2_XXS_Engram-IQ4_NL-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO_Backbone-IQ2_XXS_Engram-IQ4_NL-GGUF es una distribucion en formato GGUF de un modelo multimodal de gran escala derivado de DeepSeek-V4.1-Flash, publicada por el usuario Rikunarita sobre el trabajo previo de Abiray y del repositorio original de ISTA-DASLab. Se trata de una version "abliterated" (sin censura, con los tensores de rechazo eliminados mediante la tecnica de abliteration) del checkpoint DeepSeek-V4.1-Flash-1017-GSQ-RCO, empaquetada con cuantizacion mixta IQ2_XXS para el backbone y IQ4_NL para la tabla Engram.

El modelo resuelve un problema practico: permitir ejecutar un modelo de aproximadamente 748.000 millones de parametros en hardware de consumo o en configuraciones de servidor modestas mediante cuantizacion agresiva, manteniendo la fidelidad respecto al original. Segun la model card, la correlacion de log-perplejidad con el modelo base es del 99,84% y la divergencia KL mediana es de 0,000421 nats, lo que indica una degradacion muy contenida pese a la compresion.

Es relevante ahora porque combina tres tendencias: modelos MoE de gran tamano con contexto largo, tecnicas de cuantizacion extrema (IQ2_XXS con calibracion GSQ) y despliegue nativo en llama.cpp (build b11870+) con soporte de vision a traves de un proyector multimodal BF16. La licencia MIT facilita su uso comercial, aunque la naturaleza "uncensored" exige controles adicionales en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion multi-cabeza y tabla Engram (memoria de lookup); derivada de DeepSeek-V4.1-Flash |
| Parametros totales | 748.494.643.824 (748,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (backbone), IQ4_NL (tabla Engram), Q6_K (86 tensores abliterated), BF16 (mmproj de vision) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (6 shards: 00001-of-00006 a 00006-of-00006, mas mmproj BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de tipo Mixture-of-Experts con 40 capas, segun la auditoria de tensores de la model card (blk.0..39). Incorpora una tabla Engram de 110,6 GB en IQ4_NL, que actua como memoria de lookup asociativa, y 28 capas de expertos enrutados en 1 bit IQ1_M calibradas con GSQ (calibracion de cuantizacion por gradiente). El modelo base fue entrenado por ISTA-DASLab y esta calibrado especificamente para AIME25 y GPQA-Diamond, segun los datos de preservacion de la model card.

La innovacion principal de esta distribucion es el proceso de abliteration "weight-baked": los 86 tensores residuales de escritura (atención y FFN) se modifican directamente en los pesos cuantizados, sin necesidad de cargar un adaptador LoRA en tiempo de ejecucion. Los tensores afectados se elevan a Q6_K para preservar precision, mientras que los 28 expertos enrutados en IQ1_M y la tabla Engram permanecen intactos byte a byte. El empaquetado sigue el layout Strata de 6 shards para DeepSeek-V4.1, con plantilla de chat Jinja embebida y metadatos `deepseek41.attention.kv_source_layers`. No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat Jinja integrada.
- Razonamiento y matematicas: el modelo base esta calibrado contra AIME25 y GPQA-Diamond, lo que sugiere capacidad de razonamiento de nivel competicion.
- Vision: pipeline image-text-to-text con proyector multimodal BF16 (`mmproj-DeepSeek-V4.1-Flash-1017-BF16.gguf`).
- Generacion de codigo: capacidad presumible por herencia del modelo base, aunque no se documenta de forma explicita en la model card.
- Modo "uncensored": los tensores de rechazo han sido eliminados, de modo que el modelo no aplica filtros de contenido aprendidos.
- Compatibilidad con llama.cpp (b11870+ / b12017+) y con el runtime Strata (`strata-dsv41`), incluyendo `llama-cli` y `llama-server`.
- Soporte de endpoints compatibles (tag `endpoints_compatible`).
- Tool calling y function calling: no documentado en la informacion disponible.
- Capacidades de agente multi-paso: no documentadas explicitamente.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un LLM sin capas de rechazo, comparando respuestas con el checkpoint original para analizar que se modifica tras la abliteration.
- Despliegue en hardware limitado: con 138,58 GB en el backbone cuantizado, puede ejecutarse en servidores con varias GPU de 24 GB o en configuraciones de CPU+RAM abundante, algo inviable con el modelo en BF16.
- Analisis de documentos con imagen: el pipeline image-text-to-text y el proyector BF16 permiten procesar capturas, diagramas o documentos escaneados junto con texto.
- Experimentacion con cuantizacion extrema: util como banco de pruebas para medir el impacto de IQ2_XXS en tareas de razonamiento, dado el detallado informe de KL-divergence incluido.
- Prototipado de asistentes conversacionales sin restricciones editoriales: en entornos de investigacion controlados donde se necesita explorar respuestas sin filtros aprendidos.
- Generacion de codigo en pipelines locales: integrable en `llama-server` con API compatible para autocompletado o generacion en entornos de desarrollo con requisitos de privacidad (ejecucion local sin enviar datos a la nube).
- Evaluacion comparativa de tecnicas de abliteration: la documentacion de 86 tensores modificados y la similitud coseno de 0,999609 en el subespacio de no-rechazo facilitan reproducir y auditar el metodo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta metricas de fidelidad de cuantizacion frente al modelo base:

| Metrica | Resultado |
|---|---|
| Correlacion ln(PPL) con base | 99,84% |
| PPL(Q) | 2,4857 ± 0,5017 |
| PPL(base) | 2,3538 ± 0,4522 |
| KL-divergence mediana | 0,000421 nats |
| KL-divergence media | 0,009546 ± 0,001921 nats |
| Coincidencia Top-1 (vocab 129.280) | 98,425% ± 1,109% |
| Cambio mediano de probabilidad de token | -0,003% |
| Similitud coseno subespacio no-rechazo | 0,999609 |
| Tensores verificados | 1.043 / 1.043 |
| Capas expertas IQ1_M preservadas | 28 / 28 (100%) |

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone cuantizado ocupa 138,58 GB; la tabla Engram suma 110,6 GB, por lo que el total del repositorio es de 250,1 GB. Se requiere almacenamiento y memoria agregada de ese orden.
- GPU recomendadas: configuraciones multi-GPU (varias A100 80 GB o H100 80 GB) para carga completa en VRAM; tambien viable con offloading a RAM del sistema.
- GPU de consumo: no cabe en una sola RTX 4090 (24 GB). Requiere particionado entre VRAM y RAM o ejecucion en CPU con suficiente memoria del sistema.
- Opciones de despliegue: llama.cpp (b11870+ / b12017+), `llama-cli`, `llama-server`, runtime Strata (`strata-dsv41`), Unsloth Studio. No se documenta soporte de vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La cuantizacion IQ2_XXS con expertos en 1 bit reduce el ancho de banda de memoria, lo que en teoria favorece el throughput en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Rikunarita) | 748,5 B | no disponible | IQ2_XXS + IQ4_NL Engram | MIT | Abliterated, vision, llama.cpp nativo |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | 748,5 B | no disponible | IQ2_XXS | no disponible | Base original, con censura, sin abliteration |
| Abiray/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF | 748,5 B | no disponible | IQ2_XXS | no disponible | Version previa con shard 6 faltante (requiere symlink) |

No se dispone de datos de benchmarks comparativos con otras familias de modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": la eliminacion de los tensores de rechazo implica que puede generar contenido danino, ofensivo o ilegal sin filtros. No es apto para produccion orientada al publico sin capas de moderacion externas.
- Riesgo de alucinacion: inherente a los LLM de gran escala; la cuantizacion IQ2_XXS puede incrementarlo ligeramente respecto al BF16, aunque la KL-divergence reportada es baja.
- Idiomas soportados no documentados: no se especifica cobertura multilingue, por lo que el rendimiento en castellano no esta garantizado.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Cuantizacion extrema en 1 bit para expertos enrutados: aunque la model card reporta preservacion del 100% de las capas IQ1_M, el rendimiento en tareas de razonamiento puede degradarse frente al modelo completo.
- Requisitos de almacenamiento elevados (250,1 GB) y necesidad de descargar los 6 shards completos; la configuracion manual (symlinks) ya no es necesaria en esta version, pero si en la original de Abiray.
- Licencia MIT permite uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el desplegador.
- El modelo base esta calibrado para AIME25 y GPQA-Diamond; su rendimiento fuera de esos dominios no esta validado en la documentacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rikunarita/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO_Backbone-IQ2_XXS_Engram-IQ4_NL-GGUF
- Modelo base (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Version previa (Abiray): https://huggingface.co/Abiray/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF
- llama.cpp: no disponible en la informacion proporcionada
- Strata runtime: no disponible en la informacion proporcionada
- Paper o blog del modelo base: no disponible en la informacion proporcionada
