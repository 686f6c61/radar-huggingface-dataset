# christian-steinert/mtp-Qwen3.5-9B-GGUF

## Resumen

`mtp-Qwen3.5-9B-GGUF` es un repositorio de pesos en formato GGUF que contiene exclusivamente la cabeza MTP (Multi Token Prediction) extraída y cuantizada del modelo Qwen/Qwen3.5-9B, publicado por el usuario christian-steinert. No se trata de un modelo completo, sino de un componente auxiliar diseñado para habilitar decodificación especulativa en derivados de Qwen3.5-9B que han perdido dicha cabeza durante procesos de fine-tuning o conversión (por ejemplo, los modelos Mitra de traducción tibetano-sánscrito-pali del mismo autor).

La relevancia de esta pieza es práctica: el MTP permite que el modelo principal prediga varios tokens por paso de decodificación y los valide contra el modelo base antes de aceptarlos, lo que acelera la generación sin alterar la calidad del resultado. El repositorio incluye cuantizaciones GGUF de la cabeza, pensadas para cargarse junto al modelo principal mediante los parámetros `--spec-type draft-mtp` de llama.cpp.

Conviene subrayar que el tamaño del repo (2,4 GB) y el recuento de parámetros en safetensors (2.277.532.160) corresponden a los artefactos publicados, no al modelo completo de 9B. El modelo base Qwen3.5-9B está bajo licencia Apache-2.0, que se hereda en estas cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP (Multi Token Prediction) para decodificacion especulativa, derivada de un transformer Qwen3.5 |
| Parametros totales | 2.277.532.160 (artefacto safetensors del repo; el modelo base Qwen3.5-9B tiene ~9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | GGUF; se menciona explicitamente Q8_0 en el ejemplo de uso |
| Idiomas soportados | no disponible; la model card indica que el MTP acelera lenguas con las que esta familiarizado, citando el ingles como ejemplo |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3.5-9B) |
| Formato de pesos | GGUF (safetensors en el conteo de parametros del repo) |

## Arquitectura y entrenamiento

El artefacto es una cabeza MTP extraida del checkpoint oficial Qwen/Qwen3.5-9B y posteriormente cuantizada a GGUF. La MTP es un mecanismo de prediccion multi-token que actua como borrador en un esquema de decodificacion especulativa: propone varios tokens candidatos por paso y el modelo principal los valida, aceptando solo aquellos que coinciden con su propia distribucion. Segun la model card, la calidad del resultado es identica a la del modelo sin MTP precisamente porque cada token predicho se valida contra el modelo principal antes de aceptarse.

No se detallan en la informacion disponible los datos de entrenamiento de la cabeza MTP, el numero de tokens utilizados, la composicion del dataset ni si hubo etapas de RLHF o DPO. Tampoco se especifica la arquitectura interna exacta de la cabeza mas alla de su funcion. El unico detalle tecnico operativo documentado es su integracion en llama.cpp mediante los parametros `--spec-type draft-mtp`, `--model-draft`, `--spec-draft-n-max 3` y `--spec-draft-p-min 0.75`, que controlan el numero maximo de tokens borrador y el umbral minimo de probabilidad para aceptarlos.

## Capacidades

- Prediccion multi-token (MTP) como borrador para decodificacion especulativa en llama.cpp.
- Aceleracion de la generacion en lenguas con las que la cabeza esta familiarizada, citandose el ingles como ejemplo en la model card.
- Restauracion de la funcionalidad MTP en derivados de Qwen3.5-9B que hayan perdido la cabeza durante fine-tuning o conversion.
- Integracion con modelos Mitra de traduccion (tibetano, sanscrito, pali) publicados por el mismo autor.
- No realiza generacion de texto por si misma: requiere combinarse con un modelo base Qwen3.5-9B.
- No se documentan capacidades de tool calling, agentes, vision ni audio para este artefacto.

## Casos de uso

- Aceleracion de inferencia en traduccion tibetano-sanscrito-pali: cargando esta cabeza junto a los modelos Mitra Qwen3.5 Translate en llama.cpp se recupera la decodificacion especulativa y se reduce la latencia por token en produccion.
- Despliegue de asistentes conversacionales sobre derivados fine-tuneados de Qwen3.5-9B: cualquier modelo ajustado que haya perdido la MTP puede recuperar velocidad de generacion sin reentrenar ni modificar los pesos principales.
- Servidores llama.cpp con `llama-server`: la cabeza se carga como modelo borrador adicional y el servidor aplica validacion contra el modelo principal, manteniendo la calidad intacta.
- Evaluacion comparativa de velocidad: permite medir la ganancia de throughput de la decodificacion especulativa frente a la generacion estandar en el mismo hardware y modelo base.
- Pipelines de traduccion de textos budistas clasicos: al combinarse con los modelos Mitra, acelera la generacion en lenguas con las que la cabeza esta familiarizada, manteniendo la validacion token a token.
- Reproduccion de resultados: investigadores que trabajan con variantes de Qwen3.5-9B pueden restaurar el comportamiento original del checkpoint oficial sin descargar de nuevo el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma una mejora significativa de la velocidad de generacion en lenguas familiares para la cabeza MTP, sin cifras concretas de throughput ni de latencia.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repo ocupa 2,4 GB en total y la cuantizacion Q8_0 citada es la unica referenciada, por lo que la cabeza anade una fraccion modesta sobre el modelo principal.
- GPU recomendadas: no especificadas; al ejecutarse en llama.cpp, es compatible con el mismo hardware que el modelo base Qwen3.5-9B.
- Cabe en GPU de consumo: si, siempre que el modelo base Qwen3.5-9B quepa junto con la cabeza borrador en la VRAM disponible.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`) con los parametros `--spec-type draft-mtp`, `--model-draft`, `--spec-draft-n-max` y `--spec-draft-p-min`.
- Latencia y throughput: no disponibles; la model card solo indica mejora cualitativa de velocidad en lenguas familiares.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mtp-Qwen3.5-9B-GGUF | Cabeza MTP cuantizada | 2.277.532.160 (artefacto) | no disponible | Apache-2.0 | Hugging Face, 23 descargas |
| Qwen/Qwen3.5-9B | Modelo completo con MTP incluida | ~9B | no disponible | Apache-2.0 | Hugging Face (oficial) |
| mitra-qwen35-translate-GGUF | Derivado de traduccion sin MTP | ~9B (base) | no disponible | Apache-2.0 | Hugging Face (mismo autor) |

La comparativa relevante no es frente a otros modelos de la misma categoria, sino frente al checkpoint oficial: Qwen3.5-9B ya incluye la cabeza MTP, por lo que este repositorio solo aporta valor cuando se usa con derivados que la han perdido. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- No es un modelo autonomo: sin un modelo base Qwen3.5-9B combinado, el archivo no genera texto.
- La ganancia de velocidad depende del idioma: la model card solo garantiza mejora en lenguas familiares para la cabeza MTP, citando el ingles; en otras lenguas el beneficio puede ser menor o nulo.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de contexto especificos de este artefacto; hereda los del modelo base Qwen3.5-9B.
- La licencia Apache-2.0 se hereda del modelo original; el autor declara que no pretende ningun cambio de licencia, pero conviene verificar los terminos del checkpoint base para uso comercial.
- El repositorio tiene un unico mantenedor y un volumen de descargas muy bajo (23), lo que reduce la validacion comunitaria y el soporte.
- Los parametros de decodificacion especulativa (`--spec-draft-n-max`, `--spec-draft-p-min`) requieren ajuste empirico; valores inadecuados pueden degradar el rendimiento en lugar de mejorarlo.
- No se han publicado evaluaciones independientes de calidad ni de velocidad para esta cuantizacion concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/christian-steinert/mtp-Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Modelo Mitra Qwen3.5 Translate (GGUF): https://huggingface.co/christian-steinert/mitra-qwen35-translate-GGUF
