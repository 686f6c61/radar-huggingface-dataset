# dealignai/GLM-5.3-Flash-UNCENSORED-W4A16

## Resumen

GLM-5.3-Flash-UNCENSORED-W4A16 es una variante del modelo GLM-5.3-Flash, publicada por el usuario dealignai, que ha sido sometida a un proceso de eliminación de comportamientos de rechazo (refusal) directamente en los pesos, bajo la marca "CRACK". Este enfoque difiere de los jailbreaks por prompt o de los ajustes finos con LoRA: la modificación es permanente a nivel de tensores, lo que elimina la sobrescripción excesiva que mostraba el modelo original, especialmente en solicitudes relacionadas con copyright y otros contenidos benignos pero marcados como sensibles.

El modelo base, GLM-5.3-Flash, es un mixture-of-experts (MoE) de 320 mil millones de parámetros totales con 18 mil millones activos por token, desarrollado por Z.ai y liberado bajo licencia MIT. La versión W4A16 aquí presentada cuantiza los pesos a 4 bits (int4) y mantiene activaciones de 16 bits, lo que reduce significativamente los requisitos de memoria frente a la versión FP8 (328 GB). El modelo utiliza la arquitectura glm5_next, que combina atención lineal KDA con atención dispersa tipo DeepSeek.

Esta ficha se basa exclusivamente en la información disponible en HuggingFace y en los resultados de búsqueda web; muchos datos técnicos específicos de esta variante (contexto, benchmarks, requisitos hardware) no han sido publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm5_next (transformer híbrido con atención lineal KDA y atención dispersa tipo DeepSeek) |
| Parametros totales | 320 mil millones (según información de la versión base) |
| Parametros activos | 18 mil millones (según información de la versión base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (int4 para pesos, activaciones en bf16) |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja (según tags de HuggingFace) |
| Licencia | MIT (según tag license:mit; el campo de licencia en HuggingFace indica "no disponible") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura glm5_next emplea 45 capas transformer con tamaño oculto de 4096 y atención multi-head latente (MLA). Las capas feed-forward utilizan un diseño MoE con 288 expertos, de los cuales 8 se activan por token y uno adicional está siempre activo. El vocabulario comprende 154 880 tokens. La atención combina una componente lineal (KDA) con una dispersa (estilo DeepSeek), lo que busca reducir el coste computacional en contextos largos.

El proceso "CRACK" de dealignai elimina los pesos responsables del comportamiento de rechazo mediante edición directa de tensores (abliteración). No se emplean LoRA, adaptadores, vectores de dirección ni hooks en tiempo de ejecución. El resultado es un modelo que responde sin filtros a solicitudes que el modelo original habría rechazado. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens ni el proceso de alineación del modelo base.

## Capacidades

- Generación de texto y conversación multilingüe (inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés).
- Eliminación de la sobrescripción y de los rechazos a nivel de pesos: el modelo no se niega a responder solicitudes sobre copyright, contenido para adultos, violencia simulada u otros temas que el modelo base solía bloquear.
- Arquitectura MoE eficiente: 18 mil millones de parámetros activos sobre 320 mil millones totales, lo que permite inferencia con menor coste computacional que un modelo denso equivalente.
- Cuantización W4A16: los pesos en int4 reducen la memoria necesaria y la transferencia de datos, acelerando la inferencia en GPUs con soporte para operaciones de 4 bits.
- Compatible con pipelines de text-generation de HuggingFace y con formatos safetensors estándar.
- No se ha confirmado soporte para tool calling, agentes ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Generación de contenido creativo sin restricciones: escritura de ficción con violencia explícita, diálogos para juegos de rol adultos o guiones que el modelo base rechazaría por políticas de seguridad.
- Investigación sobre alineación y seguridad: estudio del comportamiento de modelos abliterados y comparación con el original para entender los mecanismos de rechazo en MoE.
- Desarrollo de asistentes conversacionales multilingües en entornos controlados donde se requiere una respuesta directa sin filtros, por ejemplo en simulaciones de soporte técnico con lenguaje coloquial o soez.
- Pruebas de estrés de sistemas de moderación: usar el modelo para generar contenido problemático y evaluar la robustez de clasificadores de toxicidad o filtros de contenido.
- Educación y análisis de sesgos: examinar cómo la eliminación de rechazos afecta a la distribución de respuestas en temas sensibles (política, religión, sexualidad).
- Despliegue en entornos de investigación académica con fines de auditoría de modelos, siempre que se cumplan las políticas de uso responsable del centro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para esta variante W4A16 ni para el modelo base GLM-5.3-Flash en las fuentes consultadas.

## Requisitos de hardware

- El tamaño de los pesos en W4A16 se estima en unos 160 GB (320 000 millones de parámetros × 0,5 bytes por parámetro), más memoria para activaciones, claves/valores en caché y overhead del runtime. No se ha publicado el tamaño exacto del fichero.
- Se recomienda al menos 4 GPUs de 48 GB (por ejemplo, NVIDIA A6000 o L40S) o 2 GPUs de 80 GB (A100/H100) para cargar el modelo en memoria con weights en int4.
- En consumer GPUs (RTX 4090 con 24 GB) no es viable la carga completa del modelo; se necesitaría particionado en múltiples GPUs o descarga parcial.
- Opciones de despliegue: compatible con frameworks que soporten safetensors y MoE, como vLLM (con soporte para quantización int4), TensorRT-LLM o Transformers con accelerate. No se ha confirmado compatibilidad con llama.cpp u Ollama para esta variante.
- La latencia y el throughput no han sido publicados. Dado el tamaño activo de 18 mil millones, la inferencia debería ser significativamente más rápida que un modelo denso de 320 mil millones, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de información comparativa suficiente en las fuentes consultadas. El modelo base GLM-5.3-Flash compite con otros MoE como DeepSeek-V3 o Qwen3-MoE, pero no hay datos de benchmarks que permitan una comparación objetiva. La variante uncensored de dealignai no tiene equivalentes directos documentados en cuanto a metodología de edición de pesos.

## Limitaciones y advertencias

- Al eliminar los rechazos, el modelo puede generar contenido ofensivo, ilegal, difamatorio o peligroso sin restricciones. Su uso en producción conlleva riesgos legales y éticos graves.
- No se ha evaluado la calidad de las respuestas tras la edición de pesos; es posible que la abliteración degrade el rendimiento en tareas generales o introduzca incoherencias.
- La licencia MIT permite uso comercial, pero el usuario final es responsable del contenido generado. No hay garantías de seguridad ni de cumplimiento de normativas (GDPR, moderación de contenido, etc.).
- El modelo no ha sido probado para tool calling, agentes o razonamiento estructurado; su uso en pipelines automatizados sin supervisión humana es desaconsejable.
- La cuantización W4A16 puede producir pérdidas de precisión en tareas de matemáticas o código, aunque no se han documentado efectos concretos.
- El contexto máximo soportado no está especificado; conviene asumir un límite conservador (por ejemplo, 32k tokens) hasta que se publique información oficial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-W4A16
- Versión FP8 del mismo autor: https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-FP8
- README de la versión FP8: https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-FP8/blob/main/README.md
- Análisis de arquitectura (vista HF): https://hfviewer.com/dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4
- Artículo sobre la versión uncensored: https://www.explainx.ai/blog/orcarouter-glm-5-3-flash-uncensored-block-fp8-august-2026
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/glm-5.3-flash-uncensored-fp8-dealignai
