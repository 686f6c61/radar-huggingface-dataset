# dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW

## Resumen

Dongfangshuo-Qwen3.8-27B-NSFW es un ajuste fino (fine-tune) del modelo multimodal Huihui-Qwen3.8-27B-abliterated, una variante sin censura ("abliterated") de la familia Qwen3.8 de Alibaba. El autor, identificado en Hugging Face como dongfangshuo, lo ha especializado en escritura creativa para adultos (R-18), roleplay y generación de novelas, con especial atención al estilo de las obras publicadas en la plataforma Pixiv. El modelo mantiene la pipeline `image-text-to-text`, por lo que conserva la capacidad de procesar imágenes junto con texto.

El modelo resuelve un nicho muy concreto: la generación de narrativa explícita y roleplay sin las restricciones de alineación habituales en los modelos comerciales. Para ello parte de un base model ya "abliterated" (con las direcciones de rechazo eliminadas mediante técnicas de edición de pesos) y sobre él aplica un fine-tune orientado a vocabulario explícito, progresión de tramas adultas y descripción sensorial detallada.

Con 27.781.427.952 parámetros (unos 27,8 mil millones) según los pesos en safetensors, se sitúa en la gama alta de modelos densos desplegables en hardware profesional. El repositorio ocupa 219,4 GB, lo que sugiere la presencia de múltiples formatos de pesos además del checkpoint principal en bfloat16. La licencia declarada es Apache 2.0 y el modelo está etiquetado como `not-for-all-audiences`. Existe una versión posterior, v2.0, alojada en un repositorio GGUF separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.8; detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue con vLLM usa `--max-model-len 16384` |
| Tipos de cuantizacion | no disponible en este repositorio; existe una version GGUF en el repositorio v2 |
| Idiomas soportados | chino (`zh`) declarado; resto no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 219,4 GB); GGUF solo en el repositorio v2 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su pertenencia a la familia Qwen3.8 y su naturaleza multimodal (`qwen3_5`, `vision`, `image-text-to-text`). Se trata, por tanto, de un transformer con codificador visual integrado, aunque no se especifican el número de capas, la dimensionalidad oculta, el mecanismo de atención ni el tipo de tokenizador visual. Tampoco se indica si emplea atención lineal, decodificación especulativa u otras optimizaciones.

El entrenamiento consta de dos etapas heredadas: primero, el base model Huihui-Qwen3.8-27B-abliterated, que aplica técnicas de abliteración sobre Qwen3.8-27B para eliminar el comportamiento de rechazo; segundo, un fine-tune del autor sobre ese base orientado a escritura R-18, con énfasis en vocabulario explícito, progresión de tramas adultas y descripción sensorial. No se publican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineación. La model card menciona que la versión v2.0 corrige problemas de "colapso de autoatención en textos muy largos" y "repetición infinita" presentes en esta v1.0, lo que constituye una advertencia implícita sobre el comportamiento del modelo en contextos extensos.

## Capacidades

- Generación de texto narrativo y escritura creativa, con especialización en ficción para adultos y roleplay.
- Procesamiento de imágenes junto con texto (pipeline `image-text-to-text`), con soporte de hasta 4 imágenes y 1 vídeo por prompt según el ejemplo de vLLM.
- Conversación multi-turno orientada a roleplay con mantenimiento de personaje.
- Generación de novelas y textos largos, aunque con problemas conocidos de repetición y degradación en contextos muy extensos según el propio autor.
- Capacidad multilingüe: solo se declara chino; el comportamiento en castellano no está documentado.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documenta modo "thinking" explícito ni capacidades de audio.

## Casos de uso

- Roleplay conversacional para adultos: el modelo está ajustado para mantener personajes y progresar tramas explícitas sin rechazos, adecuado para plataformas de ficción interactiva con moderación propia.
- Generación de novelas y relatos eróticos: el fine-tune prioriza vocabulario explícito y descripción sensorial, lo que lo hace útil para autores que necesitan borradores con un registro concreto y estilo próximo al de Pixiv.
- Continuación y reescritura de ficción existente: con 16k tokens de contexto en el ejemplo de despliegue, permite trabajar con capítulos completos y mantener coherencia de personajes y escena.
- Análisis y descripción de imágenes con orientación creativa: al conservar la pipeline multimodal, puede generar descripciones narrativas de ilustraciones, útil en flujos de trabajo de escritura asistida a partir de referencias visuales.
- Prototipado de personajes y guiones para juegos de rol de texto: permite iterar diálogos y escenas con un modelo local sin dependencia de APIs externas.
- Investigación sobre alineación y abliteración: sirve como caso de estudio de cómo un fine-tune temático modifica el comportamiento de un base model ya desprovisto de rechazos, útil para estudiar transferencia de sesgos y estilos.
- Generación de contenido para comunidades de ficción con etiquetado de edad: desplegado en entornos con control de acceso, puede alimentar plataformas de lectura que requieren clasificación explícita de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de calidad narrativa o de seguimiento de instrucciones.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 56 GB solo para pesos (27,8 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 64-80 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 28-30 GB de pesos; en 4 bits, alrededor de 14-16 GB, aunque este repositorio no incluye pesos cuantizados.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para bfloat16 sin cuantizar; para cuantización 8 bits, A100 40 GB o L40S 48 GB.
- GPU de consumo: no cabe en bfloat16 en una RTX 4090 (24 GB); sería necesario cuantizar a 4 bits y aun así el margen es ajustado, especialmente con contexto largo y procesamiento de imágenes. En este repositorio solo hay safetensors.
- Opciones de despliegue: vLLM (comando documentado en la model card con `--max-model-len 16384 --limit-mm-per-prompt image=4,video=1`) y Transformers con `AutoModelForCausalLM` y `AutoProcessor`. Para llama.cpp u Ollama sería necesario usar los GGUF del repositorio v2.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Enfoque |
|---|---|---|---|---|---|
| Dongfangshuo-Qwen3.8-27B-NSFW | ~27,8 B | no disponible (ejemplo a 16k) | Si | Apache 2.0 | Ficción adulta, roleplay |
| Huihui-Qwen3.8-27B-abliterated (base) | ~27,8 B | no disponible | Si | Apache 2.0 | Base sin censura, uso general |
| Dongfangshuo-Qwen3.8-27B-NSFW-v2 (GGUF) | ~27,8 B | no disponible | Si | Apache 2.0 | Ficción adulta, textos largos |
| Qwen3.8-27B original | ~27,8 B | no disponible | Si | no disponible | Uso general con alineación |

No se dispone de datos de benchmarks que permitan comparar el rendimiento objetivo frente a estos modelos. La comparación se limita a parámetros, licencia y enfoque declarado.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está diseñado para generar material sexual explícito y está etiquetado como `not-for-all-audiences`; requiere control de acceso y verificación de edad en cualquier despliegue público.
- Repetición y degradación en contextos largos: el propio autor reconoce que la v1.0 sufre "colapso de autoatención" y "repetición infinita" en textos muy extensos, corregido en la v2.0.
- Riesgo de alucinación: al ser un fine-tune creativo, no está orientado a precisión factual; no debe usarse para tareas de recuperación de información o asistencia técnica sin verificación.
- Sesgos: no se documentan evaluaciones de sesgo; la abliteración previa puede haber alterado el comportamiento del modelo más allá del rechazo, con efectos no medidos en otros dominios.
- Idiomas: solo se declara chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales sobre material sexual explícito y las políticas de las plataformas de distribución.
- Sin soporte documentado de tool calling ni agentes: no es adecuado para pipelines que requieran function calling.
- Repositorio de gran tamaño (219,4 GB): la descarga y el almacenamiento requieren planificación de infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW
- Versión v2.0 en GGUF: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v2-GGUF
- Base model: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
