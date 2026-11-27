# RMDWLLC/Jah-8.0-NVFP4

## Resumen

Jah 8.0 NVFP4 es la versión cuantizada de producción del modelo Jah 8.0, desarrollado por RMDW LLC (Georgia, Estados Unidos) y publicado bajo licencia Apache 2.0. Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura Mixture of Experts (MoE), orientado específicamente a ciberseguridad, generación de código agéntico y despliegue soberano en infraestructura propia. El modelo cuenta con 26.388.646.440 parámetros totales (aproximadamente 26,4 mil millones) y un peso en disco de 19,53 GB tras la cuantización.

La relevancia de esta variante reside en su empaquetado para ejecución en una única máquina: el autor afirma que puede servirse en un NVIDIA DGX Spark o en una GPU Blackwell consumer de 24 a 32 GB, con una ventana de contexto de servicio por defecto de 131.072 tokens (arquitectura nativa de hasta 1.048.576 tokens). Incorpora decodificación especulativa nativa mediante una cabeza de borrador multi-token denominada DSPARK, además de soporte nativo de tool calling y endpoints compatibles con las APIs de Anthropic (`/v1/messages`) y OpenAI (`/v1/chat/completions`).

El modelo se distribuye como cuantización NVFP4 (capas 0 a 19) combinada con MXFP8 (capas 20 a 23), generada a partir del maestro BF16 con una paridad declarada del 100% en claves y formas sobre 1.244 tensores. La información disponible proviene íntegramente de la model card del autor; no se han localizado publicaciones independientes ni resultados de terceros que verifiquen las cifras declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con capacidades multimodales (texto + visión); detalles internos de capas y expertos no disponibles |
| Parametros totales | 26.388.646.440 (26,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por defecto en servicio; 1.048.576 tokens nativos según arquitectura |
| Tipos de cuantizacion | NVFP4 (block-16, capas 0 a 19) + MXFP8 (capas 20 a 23); maestro BF16 disponible por separado |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un único shard de 19,53 GB más `mtp.safetensors` para la cabeza especulativa) |

## Arquitectura y entrenamiento

La información disponible confirma que Jah 8.0 emplea una arquitectura Mixture of Experts con soporte multimodal de entrada imagen-texto y salida de texto. El modelo integra una cabeza de decodificación especulativa multi-token propia, denominada DSPARK, distribuida como archivo separado (`mtp.safetensors`) y activada mediante el algoritmo de speculative decoding de SGLang. No se detallan en la documentación el número de expertos, el ratio de activación, el tipo de atención ni la composición exacta de capas.

Respecto al entrenamiento, la model card únicamente aporta comparaciones frente a una base no entrenada ("Untrained Base") en las tablas de evaluación, lo que sugiere una fase de ajuste posterior sobre un modelo base, pero no se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. La cuantización se realizó directamente desde el maestro BF16 congelado, con una paridad declarada del 100% en claves y formas sobre los 1.244 tensores, y errores relativos RMSE medios de 0,0024 para los pesos NVFP4 y 0,0001 para los MXFP8.

## Capacidades

- Generación de texto y razonamiento en inglés.
- Procesamiento de imágenes como entrada (pipeline image-text-to-text), con salida textual.
- Generación y edición de código, incluyendo tareas de resolución de issues en repositorios Python y refactorizaciones multi-archivo en Go.
- Tool calling y function calling nativos.
- Flujos agénticos multi-paso, con soporte declarado para integración directa en Claude Code sin proxy intermedio.
- Razonamiento especializado en ciberseguridad: análisis forense de correo (BEC/ATO en Microsoft 365), auditoría de IAM en cloud y endurecimiento de Kubernetes.
- Ventana de contexto larga para análisis de repositorios extensos y conversaciones multi-turno.
- Decodificación especulativa integrada (DSPARK) para acelerar la generación.
- Compatibilidad con los esquemas de API de Anthropic y OpenAI.

## Casos de uso

- Análisis forense de incidentes de seguridad: el modelo puede procesar evidencias de correo comprometido, registros de autenticación y trazas de acceso para reconstruir cadenas de ataque BEC o ATO, aprovechando su ajuste específico en este dominio y su contexto de 131.072 tokens para correlacionar múltiples fuentes en una sola pasada.
- Auditoría de configuraciones cloud y Kubernetes: dado su rendimiento declarado en tareas de IAM y hardening, encaja en pipelines de revisión de manifiestos, políticas IAM y roles de clúster, generando recomendaciones accionables o parches directamente aplicables.
- Agente de resolución de issues en repositorios Python: con soporte de tool calling y ejecución multi-turno, puede clonar un repositorio, inspeccionar el código, proponer un parche y validarlo ejecutando `pytest`, tal como refleja la evaluación declarada sobre tareas SWE.
- Refactorización de bases de código Go de gran tamaño: su ventana de contexto permite cargar fragmentos extensos de proyectos de más de 200.000 líneas y coordinar cambios multi-archivo, verificando el resultado con `go test` en un bucle agéntico.
- Asistente de desarrollo integrado en Claude Code: el modelo expone un endpoint compatible con `/v1/messages`, por lo que puede conectarse como backend local de Claude Code apuntando `ANTHROPIC_BASE_URL` al servidor SGLang, manteniendo todo el tráfico dentro de la red corporativa.
- Despliegue soberano en infraestructura propia: pensado para organizaciones que no pueden permitir egreso de datos a la nube, el modelo cabe en un único appliance (DGX Spark o GPU Blackwell de 24 a 32 GB) y puede servirse con SGLang en local.
- Automatización de triaje de alertas de seguridad: con tool calling nativo, puede integrarse en un SOC para consultar APIs de SIEM, enriquecer alertas y clasificar severidad en conversaciones multi-turno.

## Benchmarks y rendimiento

Los datos siguientes proceden exclusivamente de la model card del autor, medidos sobre el maestro BF16 con temperatura 0,0 en conjuntos de evaluación bloqueados y verificados por ejecución. No se han localizado verificaciones independientes.

| Benchmark | Muestras | Base sin entrenar | Jah 8.0 (BF16) | Delta |
|---|---:|---:|---:|---:|
| Caja fuerte de ciberseguridad no vista (seed=999999) | 40 | 19/40 (47,5%) | 36/40 (90,0%) | +42,5 pts |
| Forense BEC/ATO en M365 (subconjunto) | 10 | 2/10 (20,0%) | 9/10 (90,0%) | +70,0 pts |
| IAM cloud y Kubernetes difícil (subconjunto) | 10 | 6/10 (60,0%) | 10/10 (100,0%) | +40,0 pts |
| Caja fuerte pública de terceros (HARD) | 66 | 35/66 (53,0%) | 44/66 (66,7%) | +13,7 pts |
| SWE en Python sobre GitHub no visto (30 turnos, `pytest`) | 24 | no disponible | 11/24 (45,8%) | no disponible |
| PRs multi-archivo en Go de 200K líneas (30 turnos, `go test`) | 20 | 1/20 (5,0%) | 5/20 (25,0%) | 5,0x |
| Suite Docker `coding-v1` (build NVFP4, 1 Spark) | 20 | 17/20 (85%) | 19/20 (95%) | +10 pts |

En cuanto a rendimiento de inferencia, el autor declara 41,5 o más tokens por segundo en flujo único sobre un DGX Spark y 181,4 tokens por segundo agregados con lote de 4 y DSPARK activado. Estas cifras corresponden al build NVFP4 y no han sido replicadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19,53 GB de pesos más overhead de KV cache y activaciones; el autor sugiere `--mem-fraction-static 0.45` en SGLang para un contexto de 131.072 tokens.
- GPU recomendadas por el autor: NVIDIA DGX Spark (single-box) y GPUs Blackwell con 24 a 32 GB de VRAM.
- Cabe en GPU consumer: sí, según el autor, en GPUs Blackwell de 24 a 32 GB; no se confirma compatibilidad con generaciones anteriores (Ada, Ampere) al requerir formatos NVFP4 y MXFP8.
- Opciones de despliegue: SGLang es el runtime documentado, con soporte de speculative decoding DSPARK y modo multimodal. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput declarados: 41,5+ tok/s en flujo único y 181,4 tok/s agregados con lote de 4 sobre DGX Spark.
- El maestro BF16 completo ocupa aproximadamente 50 GB según la model card, por lo que requiere hardware sustancialmente mayor.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor únicamente establece una comparación interna con su propio modelo Jah 7.0 (clúster de estación de trabajo de más de 600B parámetros), afirmando que el build NVFP4 de Jah 8.0 iguala su rendimiento en la suite `coding-v1` sobre una sola máquina de escritorio. No se aportan comparaciones con modelos de terceros de tamaño o categoría similares.

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Jah 8.0 NVFP4 | 26,4B totales (activos no disponibles) | 131.072 en servicio / 1.048.576 nativo | Apache 2.0 | Build cuantizado de 19,53 GB para una sola máquina |
| Jah 8.0 (BF16) | 26,4B totales | ídem | Apache 2.0 | Maestro completo, ~50 GB |
| Jah 7.0 | más de 600B (según el autor) | no disponible | no disponible | Modelo previo de RMDW para clúster |
| Modelos de terceros comparables | no disponible | no disponible | no disponible | No se han localizado referencias en la información disponible |

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Sesgos: no se documenta ningún análisis de sesgos, evaluación de toxicidad ni proceso de alineación (RLHF/DPO) en la información disponible.
- Alucinación: no se aportan métricas de calibración ni tasas de alucinación; en dominios de ciberseguridad, una respuesta incorrecta puede tener consecuencias operativas graves.
- Verificación independiente: todos los benchmarks y cifras de rendimiento proceden del propio autor; no se han localizado evaluaciones de terceros que los confirmen.
- Requisitos de hardware específicos: los formatos NVFP4 y MXFP8 están ligados a arquitecturas Blackwell; el despliegue en GPUs anteriores no está documentado.
- Dependencia de runtime: el flujo documentado requiere SGLang con `--trust-remote-code` y el algoritmo DSPARK, lo que limita la portabilidad a otras pilas de inferencia.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece indemnización por propiedad intelectual.
- Madurez: el repositorio registra cero descargas y cero likes en el momento de la consulta, con fecha de creación en noviembre de 2026, lo que indica una adopción aún inexistente y ausencia de validación comunitaria.
- Contexto efectivo: aunque la arquitectura nativa alcanza 1.048.576 tokens, el valor de servicio por defecto es 131.072; ampliarlo incrementa el consumo de memoria KV y puede degradar el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RMDWLLC/Jah-8.0-NVFP4
- Maestro BF16: https://huggingface.co/RMDWLLC/Jah-8.0
- Sitio del autor: https://rmdw.ai
- API privada de Jah: https://rmdw.ai/jah-api
- Sitio secundario del autor: https://kiyomibot.ai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Recibo de evaluación (en el repositorio): `JAH8_EVAL_RECEIPT.json`
- Manifiesto local con checksums (en el repositorio): `LOCAL_MANIFEST.json`
