# chadouming/Hy-MT2-1.8B-int4-ov

## Resumen

Hy-MT2-1.8B-int4-ov es una exportación cuantizada del modelo de traducción `tencent/Hy-MT2-1.8B` de Tencent, convertida a formato OpenVINO Intermediate Representation (IR) por el usuario chadouming. Se trata de una compresión de pesos mixta INT4/INT8 (69 % INT4 / 31 % INT8 en capas sensibles) generada con NNCF y el toolchain de optimum-intel, pensada para ejecutarse con `openvino-genai` en GPUs Intel Arc y CPUs Intel. El modelo base pertenece a la familia Hunyuan (arquitectura `hunyuan_v1_dense`) y está especializado en traducción automática.

El interés de esta ficha radica en que ofrece una vía de despliegue en hardware Intel sin GPU dedicada de gran tamaño: el repositorio ocupa 1,2 GB, lo que permite ejecutar un modelo de traducción de 1.800 millones de parámetros en entornos de borde o en estaciones de trabajo con aceleración integrada. La licencia Apache-2.0, heredada del modelo original, facilita el uso comercial.

No se dispone de información publicada sobre el proceso de entrenamiento del modelo base, los idiomas exactos soportados, la longitud de contexto ni resultados de benchmarks en la información proporcionada; esta ficha se limita a documentar lo que la model card y los metadatos de Hugging Face permiten verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia `hunyuan_v1_dense` de Tencent) |
| Parametros totales | 1.800 millones (según el nombre del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos mixtos INT4 asimétrico / INT8 (NNCF `int4_asym`, group size 128, ratio 0.8) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), exportado con `optimum-cli` |

## Arquitectura y entrenamiento

El modelo base `tencent/Hy-MT2-1.8B` emplea la arquitectura `hunyuan_v1_dense`, un transformer denso de la familia Hunyuan de Tencent, con 1.800 millones de parámetros. Está etiquetado como modelo de traducción (`translation`) y de generación de texto conversacional. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La versión aquí descrita no es un reentrenamiento, sino una exportación cuantizada: se aplicó compresión de pesos asimétrica INT4 con tamaño de grupo 128 y un ratio de 0.8, lo que resulta en un 69 % de capas en INT4 y un 31 % en INT8 para las capas consideradas sensibles. El toolchain utilizado fue `openvino==2026.4.1`, `openvino-tokenizers==2026.4.1.0`, `openvino-genai==2026.4.1.0`, `nncf==3.4.0`, `transformers==4.57.6` y `optimum-intel==2.3.0.dev0`. El comando de exportación documentado usa la tarea `text-generation-with-past`, lo que preserva el caché KV para generación autorregresiva eficiente.

## Capacidades

- Generación de texto y traducción automática, según la etiqueta `translation` del modelo base.
- Generación conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Inferencia con caché KV (`text-generation-with-past`), adecuada para decodificación autorregresiva.
- Ejecución en GPUs Intel Arc y CPUs Intel mediante `openvino-genai` (`LLMPipeline` y `ContinuousBatchingPipeline`).
- Soporte de batching continuo para servir múltiples peticiones concurrentes.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción automática en producción sobre infraestructura Intel: el modelo puede desplegarse con `ContinuousBatchingPipeline` en un servidor con CPU Xeon o GPU Arc, sirviendo traducciones con un footprint de pesos de 1,2 GB y sin necesidad de GPUs NVIDIA.
- Traducción en el borde (edge computing): al caber en 1,2 GB de pesos cuantizados, es viable en mini-PC, NUCs o dispositivos con iGPU Intel para traducir contenido localmente sin enviar datos a la nube.
- Preprocesado multilingüe de pipelines de datos: integrado como paso de traducción en flujos ETL que normalizan corpus a un idioma común antes de indexarlos o analizarlos.
- Traducción de documentación técnica y contenido web: el modelo base está orientado a traducción, por lo que encaja en herramientas de localización de documentación o subtitulado.
- Asistentes conversacionales con traducción integrada: al soportar generación conversacional, puede gestionar diálogos donde el usuario y el sistema hablan idiomas distintos.
- Prototipado y evaluación de modelos de traducción en entornos con hardware Intel: útil para investigadores que necesitan un baseline cuantizado reproducible con OpenVINO sin depender de CUDA.
- Despliegue en estaciones de trabajo de desarrollo: con `LLMPipeline` se puede levantar un servicio local de traducción para pruebas de integración en CI, dado el reducido tamaño del artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/peso en disco: el repositorio ocupa 1,2 GB, correspondiente a los pesos cuantizados INT4/INT8 en formato OpenVINO IR.
- Memoria en ejecución: no disponible de forma explícita; adicionalmente al peso de los pesos hay que contar el caché KV, cuyo tamaño depende de la longitud de contexto (no documentada).
- GPUs recomendadas: GPUs Intel Arc (según la model card) y CPUs Intel.
- Cabe en GPU de consumo: sí, en iGPU Intel Arc integradas y en GPUs Arc discretas; no se documenta soporte para GPUs NVIDIA o AMD en esta exportación.
- Opciones de despliegue: `openvino-genai` (`LLMPipeline`, `ContinuousBatchingPipeline`); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Hy-MT2-1.8B-int4-ov (este) | 1,8 B | no disponible | OpenVINO IR INT4/INT8 | Apache-2.0 | Intel Arc / CPU Intel |
| tencent/Hy-MT2-1.8B (base) | 1,8 B | no disponible | safetensors (presumiblemente) | Apache-2.0 | GPU genérica |
| Alternativas de traducción de ~2 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa de rendimiento rigurosa.

## Limitaciones y advertencias

- No se han documentado los idiomas soportados ni la calidad de traducción por par de idiomas; la evaluación previa a producción es imprescindible.
- La cuantización INT4/INT8 puede degradar la calidad respecto al modelo base en fp16/bf16; no se aportan métricas de la pérdida de calidad.
- Riesgo de alucinación y de traducciones inventadas inherente a los modelos generativos; en dominios técnicos o legales conviene validación humana.
- No se documenta la longitud de contexto; textos largos pueden truncarse o degradar la calidad.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar los términos del repositorio original de Tencent.
- El artefacto está atado al toolchain OpenVINO 2026.4.x; versiones distintas pueden requerir reexportación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- No hay información sobre sesgos del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chadouming/Hy-MT2-1.8B-int4-ov
- Modelo base: https://huggingface.co/tencent/Hy-MT2-1.8B
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- OpenVINO: https://github.com/openvinotoolkit/openvino
- NNCF: https://github.com/openvinotoolkit/nncf
- Optimum Intel: https://github.com/huggingface/optimum-intel
