# AstoriasResearchInc/GLM-5.3-Flash-Abliterated-MXFP4

## Resumen

GLM-5.3-Flash-Abliterated-MXFP4 es una cuantización en formato MXFP4 del modelo base zai-org/GLM-5.3-Flash, publicada por AstoriasResearchInc. Se trata de una variante "abliterated", es decir, con las direcciones de rechazo eliminadas del espacio de activaciones, y cuantizada en MXFP4 (microscaling FP4) mediante herramientas Quark. El modelo conserva la pipeline image-text-to-text del original, por lo que mantiene capacidades multimodales de entrada.

El modelo base GLM-5.3-Flash pertenece a la familia GLM de Zhipu AI (zai-org) y se distribuye con arquitectura MoE (Mixture of Experts), según indican los tags del repositorio. La cuantización MXFP4 reduce el peso en memoria aproximadamente a 4 bits por parámetro, lo que facilita el despliegue en hardware con VRAM limitada, aunque el repositorio no detalla el número exacto de parámetros totales ni activos.

La relevancia de esta ficha es doble: por un lado, ofrece una vía de despliegue de un modelo MoE multimodal en entornos con restricciones de memoria; por otro, la modificación "abliterated" tiene implicaciones directas sobre el filtrado de seguridad, lo que exige cautela en producción. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face. La licencia declarada es MIT, aunque el modelo base puede tener condiciones adicionales que conviene verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), transformer; pipeline image-text-to-text |
| Parametros totales | no disponible |
| Parametros activos | no disponible (modelo MoE, pero el repositorio no publica el ratio) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (microscaling FP4) mediante Quark; el modelo base admite otras cuantizaciones no especificadas |
| Idiomas soportados | en, zh |
| Licencia | MIT (sujeta a verificación de las condiciones del modelo base) |
| Formato de pesos | MXFP4 (compatible con transformers, vLLM y SGLang según tags) |

## Arquitectura y entrenamiento

El repositorio identifica el modelo como MoE y lo etiqueta con `glm5_next`, lo que sugiere una generación de la familia GLM posterior a GLM-4. La pipeline declarada es image-text-to-text, de modo que el modelo acepta imágenes y texto como entrada y genera texto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO en el modelo base.

La innovación técnica principal de esta publicación es la cuantización MXFP4 con Quark: un formato de coma flotante de 4 bits con escalas de bloque (microscaling) que busca preservar mejor la precisión que una cuantización INT4 uniforme, especialmente en modelos MoE donde las activaciones pueden tener rangos muy dispares entre expertos. La modificación "abliterated" consiste en la eliminación de direcciones de rechazo en el espacio de activaciones, una técnica de edición de pesos que reduce la tendencia del modelo a declinar peticiones. No se documentan en la información disponible detalles sobre el proceso exacto de abliteración ni sobre posibles evaluaciones de degradación de capacidades tras la misma.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entradas de imagen y texto (pipeline image-text-to-text).
- Procesamiento de código y matemáticas: capacidades heredadas del modelo base GLM-5.3-Flash, aunque no se cuantifican en el repositorio.
- Soporte bilingüe inglés-chino (tags `en`, `zh`).
- Compatibilidad declarada con vLLM y SGLang, lo que habilita despliegue con serving de alto rendimiento.
- Integración con transformers para inferencia estándar.
- Comportamiento "abliterated": menor tendencia a rechazar peticiones, lo que afecta directamente al filtrado de seguridad.
- No se documentan en la información disponible capacidades específicas de tool calling, function calling, agentes o thinking mode para esta variante cuantizada.

## Casos de uso

- Despliegue de un MoE multimodal en hardware con VRAM limitada: la cuantización MXFP4 reduce el peso a ~4 bits por parámetro, permitiendo servir el modelo en GPUs donde la versión en BF16 no cabría. Adecuado para prototipos y entornos de investigación con presupuesto de memoria ajustado.
- Investigación sobre alineación y seguridad: la variante abliterated permite estudiar cómo la eliminación de direcciones de rechazo afecta a las respuestas del modelo en dominios sensibles, comparándola con el modelo base. Útil en laboratorios de interpretabilidad.
- Evaluación de cuantización MXFP4 frente a otras precisiones: sirve como punto de comparación para medir la degradación de calidad de MXFP4 en un MoE multimodal, con Quark como herramienta de referencia.
- Procesamiento de documentos con imagen y texto: al aceptar entradas image-text-to-text, puede emplearse para extracción de información de capturas, formularios o diagramas en inglés y chino.
- Serving de alto rendimiento con vLLM o SGLang: los tags declaran compatibilidad con ambos motores, lo que permite integrar el modelo en pipelines de inferencia con batching continuo y gestión de KV cache.
- Experimentación con modelos bilingües en entornos restringidos: para equipos que trabajan con contenido en inglés y chino y necesitan un modelo que quepa en una sola GPU consumer de gama alta, sujeto a verificación empírica de la VRAM real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, ya que el repositorio no publica el número de parámetros totales. Con cuantización MXFP4, la VRAM teórica ronda los 0,5 GB por cada 1.000 millones de parámetros, más overhead de KV cache y activaciones.
- GPU recomendadas: no disponible. La viabilidad depende del tamaño real del MoE, que no se documenta.
- Viabilidad en GPU consumer: no confirmada. Un MoE multimodal de gran tamaño puede requerir offloading o múltiples GPUs incluso en MXFP4.
- Opciones de despliegue: transformers (librería declarada), vLLM y SGLang (según tags). No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-Abliterated-MXFP4 | no disponible (MoE) | no disponible | MIT | MXFP4 | Variante abliterated y cuantizada del base |
| zai-org/GLM-5.3-Flash (base) | no disponible (MoE) | no disponible | no disponible en esta ficha | BF16/FP16 presumiblemente | Modelo original sin abliterar ni cuantizar |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- La modificación "abliterated" elimina las direcciones de rechazo, lo que reduce o anula el filtrado de seguridad del modelo base. No es adecuada para aplicaciones de cara al público sin capas de moderación externas.
- Riesgo de alucinación: inherente a los modelos generativos; la cuantización MXFP4 puede incrementar la degradación en tareas de razonamiento largo, aunque no se han publicado mediciones.
- Idiomas limitados a inglés y chino según los tags; el rendimiento en castellano no está garantizado ni documentado.
- La licencia MIT se declara en el repositorio, pero el modelo base puede imponer condiciones adicionales; el acceso gated obliga a aceptar los términos de Hugging Face y del autor original.
- No se publican parámetros totales, activos, contexto ni benchmarks, lo que impide estimar con rigor requisitos de hardware y calidad.
- La fecha de creación (2026-11-24) y la ausencia de descargas o likes sugieren un modelo reciente y sin validación comunitaria; conviene tratarlo como experimental.
- La cuantización MXFP4 requiere hardware y librerías que soporten microscaling FP4; la compatibilidad real con vLLM y SGLang debe verificarse en el entorno de destino.

## Enlaces

- Hugging Face: https://huggingface.co/AstoriasResearchInc/GLM-5.3-Flash-Abliterated-MXFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- No se han encontrado en la información proporcionada papers, blogs, repositorios o demos adicionales.
