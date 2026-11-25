# richardyoung/Mistral-7B-Instruct-v0.3-heretic

## Resumen

Mistral-7B-Instruct-v0.3-heretic es una variante "abliterated" (tambien llamada uncensored o decensored) del modelo Mistral-7B-Instruct-v0.3 de Mistral AI, publicada por el usuario richardyoung en Hugging Face. El modelo parte de los pesos oficiales de Mistral AI y aplica una tecnica de ablacion de direcciones de rechazo (refusal directions) en el espacio de activaciones, con el objetivo de eliminar los comportamientos de negativa aprendidos durante el alineamiento, manteniendo el resto de capacidades del modelo original. El autor etiqueta el proceso como "reproducible", lo que sugiere que el pipeline de ablacion esta documentado.

Se trata de un transformer decoder-only denso de 7.248.023.552 parametros (aproximadamente 7.250 millones), derivado de la version v0.3 de Mistral-7B-Instruct, que amplia el contexto respecto a versiones anteriores del modelo base. La licencia declarada es Apache 2.0, heredada del modelo original de Mistral AI. El repositorio esta marcado como de acceso restringido (gated) en Hugging Face, por lo que es necesario aceptar condiciones antes de descargar los pesos.

Su relevancia es acotada y especifica: interesa a investigadores que estudian tecnicas de ablacion y alineamiento, a desarrolladores que necesitan un modelo sin rechazos para tareas creativas o de generacion de contenido sin restricciones de seguridad, y a quienes evaluan el impacto de estas tecnicas sobre el rendimiento general. No es un modelo recomendado para despliegues de produccion orientados al publico general sin salvaguardas adicionales, dado que la eliminacion de los comportamientos de rechazo implica riesgos de seguridad y cumplimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Mistral) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral-7B-Instruct-v0.3 soporta 32.768 tokens, pero no se confirma para esta variante) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos en safetensors (compatibles con cuantizacion posterior a FP16/BF16, INT8, INT4 via GPTQ/AWQ/GGUF, aunque no se listan artefactos pre-cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.3: un transformer decoder-only denso con atencion por ventanas deslizantes (sliding window attention) en las capas de la familia Mistral, activacion SwiGLU, normalizacion RMSNorm y embeddings rotatorios (RoPE). El modelo base fue entrenado por Mistral AI sobre un corpus multilingue no detallado publicamente en su totalidad, y posteriormente ajustado por instrucciones. La version v0.3 del modelo base amplia la ventana de contexto respecto a v0.2 e incorpora un tokenizador v3 con soporte para tool calling y tokens especiales adicionales.

Sobre esta base, richardyoung aplica una tecnica de "abliteration": se calculan las direcciones de activacion asociadas a los comportamientos de rechazo (refusal) en el modelo alineado y se proyectan fuera del espacio de pesos o activaciones, de modo que el modelo deja de activar esas direcciones al generar. El autor declara el proceso como reproducible, pero no se detalla en la informacion disponible el numero de tokens de calibracion, la capa o capas intervenidas, ni si hubo un ajuste fino posterior. No se dispone de informacion sobre RLHF, DPO o datos de entrenamiento adicionales especificos de esta variante.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo instruct base.
- Razonamiento general y respuesta a instrucciones en el estilo del modelo original.
- Generacion de codigo y matematicas a nivel de un modelo de 7B de su generacion (sin datos de benchmark especificos en la informacion disponible).
- Soporte de tool calling / function calling heredado del tokenizador v3 y del formato instruct de Mistral-7B-Instruct-v0.3.
- Capacidad de seguir instrucciones sin los rechazos tipicos del modelo alineado, que es precisamente el objetivo de la ablacion.
- Capacidades multilingues: no confirmadas en la informacion disponible, aunque el modelo base Mistral-7B tiene cobertura multilingue; el grado exacto en esta variante no esta documentado.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo sirve como objeto de estudio para medir el efecto de la ablacion de direcciones de rechazo sobre las capacidades generales y sobre la tasa de respuestas daninas, comparandolo con el Mistral-7B-Instruct-v0.3 original.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera tratar temas sensibles sin las negativas del modelo alineado, usando el contexto ampliado del base cuando este confirmado.
- Evaluacion de robustez de filtros: equipos que construyen clasificadores de contenido pueden usar esta variante como generador adversarial controlado para probar sus sistemas de moderacion en un entorno aislado.
- Desarrollo de pipelines de datos sinteticos: generacion de datasets de entrenamiento o de evaluacion que requieran diversidad estilistica y tematica, con revision posterior por parte de un filtro propio.
- Experimentacion con tool calling en agentes: al conservar el formato instruct y los tokens de herramienta del base, puede integrarse en prototipos de agentes que necesiten llamadas a funciones, siempre con validacion de salidas.
- Despliegue local en investigacion: con 7.250 millones de parametros cabe en GPUs de consumo de 24 GB en cuantizacion de 4 bits, lo que permite experimentar en estaciones de trabajo sin infraestructura dedicada.
- Analisis de sesgos y de comportamiento: util para comparar como cambian las respuestas del modelo al eliminar el alineamiento de seguridad, en estudios academicos sobre modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 14,5 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica, unos 16-18 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: unos 7-8 GB de pesos, con overhead adicional.
- VRAM estimada en cuantizacion de 4 bits: unos 4-5 GB de pesos, con overhead adicional.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado o cuantizacion; RTX 3090/4080 (16-24 GB) en cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090/3090 a FP16 con contexto limitado y en GPUs de 8-16 GB con cuantizacion de 4-8 bits.
- Opciones de despliegue: el repositorio declara la libreria vllm; tambien es compatible con llama.cpp/Ollama y TGI si se generan los pesos en los formatos correspondientes (no se listan artefactos GGUF en la informacion disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mistral-7B-Instruct-v0.3-heretic | 7.248 M | no disponible (base: 32.768) | Apache 2.0 | Variante abliterated, acceso gated |
| mistralai/Mistral-7B-Instruct-v0.3 | 7.248 M | 32.768 | Apache 2.0 | Modelo base alineado, sin ablacion |
| Mistral-7B-Instruct-v0.2 | 7.248 M | 32.768 | Apache 2.0 | Version anterior, tokenizador v2 |
| Otras variantes abliterated de Mistral-7B | ~7.248 M | variable | variable segun autor | Multiples publicaciones de la comunidad con tecnicas similares |

La comparativa se limita a datos estructurales; no hay resultados de benchmarks publicados en la informacion disponible para esta variante que permitan comparar rendimiento numerico con las alternativas.

## Limitaciones y advertencias

- La ablacion elimina los comportamientos de rechazo, lo que aumenta el riesgo de generar contenido danino, ilegal o inseguro; no debe desplegarse de cara al publico sin filtros y salvaguardas externas.
- Riesgo de alucinacion: como todo modelo de 7B de su generacion, puede inventar hechos, citas o codigo incorrecto; la ablacion no corrige este comportamiento y podria agravarlo si el alineamiento contribuia a la calibracion.
- Sesgos conocidos: no documentados especificamente para esta variante; hereda los del modelo base, no auditados en la informacion disponible.
- Limitaciones de contexto e idioma: no confirmadas para esta variante; el contexto y la cobertura idiomatica deben validarse empiricamente antes de usarla en produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin rechazos puede incumplir normativas de seguridad de contenidos y obligaciones de moderacion en la UE y otras jurisdicciones; la responsabilidad recae en el desplegador.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que anade friccion a la descarga y a la automatizacion de pipelines.
- Reputacion y trazabilidad: el autor es un particular, el modelo tiene muy pocas descargas y no hay evaluacion independiente publicada; conviene tratar los pesos como no auditados.
- No se dispone de artefactos cuantizados oficiales ni de resultados de benchmarks que permitan estimar la degradacion respecto al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Mistral-7B-Instruct-v0.3-heretic
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Mistral AI (organizacion): https://huggingface.co/mistralai
- Documentacion de Mistral AI: https://docs.mistral.ai
- vLLM (libreria declarada): https://github.com/vllm-project/vllm
