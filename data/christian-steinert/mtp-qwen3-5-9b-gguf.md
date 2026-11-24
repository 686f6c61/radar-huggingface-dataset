# christian-steinert/mtp-Qwen3.5-9B-GGUF

## Resumen

`mtp-Qwen3.5-9B-GGUF` es un artefacto derivado de Qwen3.5-9B publicado por el usuario christian-steinert. No es un modelo generativo completo, sino la cabeza de Multi Token Prediction (MTP) extraida del modelo oficial y reempaquetada en formato GGUF para su uso con llama.cpp. Su funcion es actuar como modelo borrador en un esquema de decodificacion especulativa: predice varios tokens por paso y el modelo principal los valida antes de aceptarlos.

El artefacto resulta relevante para quienes trabajan con derivados de Qwen3.5-9B que han perdido la cabeza MTP durante el proceso de ajuste fino o conversion (por ejemplo, los modelos de traduccion de Dharmamitra). Reinsertar esta cabeza permite recuperar aceleracion en la generacion sin sacrificar calidad, ya que cada token propuesto se contrasta contra el modelo principal.

El repositorio contiene unicamente los pesos de la cabeza MTP cuantizados, con un total de 2.277.532.160 parametros segun los metadatos de safetensors y un tamano de repositorio de 4,0 GB. La licencia es Apache-2.0, heredada del modelo base Qwen/Qwen3.5-9B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza Multi Token Prediction (MTP) para decodificacion especulativa, derivada de Qwen3.5-9B |
| Parametros totales | 2.277.532.160 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base al que se acopla) |
| Tipos de cuantizacion | GGUF (se menciona Q8_0 en el ejemplo de uso; no se detalla el catalogo completo) |
| Idiomas soportados | no disponible (los tags citan tibetano, sanscrito y pali; la model card indica mejor aceleracion en idiomas familiares para la cabeza MTP, como el ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El artefacto no es un transformer autonomo sino la cabeza MTP extraida de Qwen3.5-9B y recuantizada a GGUF. La MTP es un mecanismo de prediccion multi-token que se emplea como borrador en decodificacion especulativa: propone una secuencia corta de tokens candidatos que el modelo principal verifica. Segun la model card, la calidad del resultado es identica a la del modelo sin MTP porque cada token predicho se valida contra el modelo principal antes de aceptarse; la ganancia se produce en velocidad de generacion, no en exactitud.

No se proporcionan en la informacion disponible datos sobre el volumen de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO especificas para esta cabeza. Tampoco se detalla la arquitectura interna de la cabeza MTP mas alla de su funcion. El autor indica que el release oficial de Qwen3.5-9B ya incorpora esta cabeza, por lo que este repositorio solo es necesario para restaurar la funcionalidad MTP en derivados que la hayan eliminado.

## Capacidades

- Prediccion especulativa multi-token como modelo borrador (`draft-mtp`) en llama.cpp.
- Aceleracion de la generacion cuando el modelo principal se ejecuta con decodificacion especulativa habilitada.
- Integracion con `llama-cli` y `llama-server` mediante los parametros `--spec-type draft-mtp`, `--model-draft`, `--spec-draft-n-max` y `--spec-draft-p-min`.
- Restauracion de la funcionalidad MTP en derivados de Qwen3.5-9B que carecen de ella (por ejemplo, modelos de traduccion ajustados).
- No genera texto de forma autonoma: requiere acoplarse a un modelo base Qwen3.5-9B.
- No se documentan capacidades de tool calling, agentes, vision ni audio para este artefacto.

## Casos de uso

- Aceleracion de inferencia en traduccion: acoplar la cabeza MTP a un derivado de Qwen3.5-9B especializado en traduccion (como los modelos Dharmamitra) para recuperar velocidad de generacion sin alterar la calidad de las traducciones, ya que cada token se valida contra el modelo principal.
- Despliegue de servidores de inferencia de baja latencia: en `llama-server`, cargar el modelo principal junto con `--model-draft` apuntando a este GGUF permite servir peticiones con decodificacion especulativa y reducir el tiempo por token en produccion.
- Recuperacion de pipelines existentes: si un equipo convirtio o ajusto un modelo Qwen3.5-9B y perdio la cabeza MTP, este artefacto restaura la aceleracion sin necesidad de reentrenar ni volver a descargar el modelo oficial completo.
- Evaluacion comparativa de decodificacion especulativa: usar el mismo modelo base con y sin esta cabeza para medir la ganancia real de throughput en un hardware concreto y calibrar `--spec-draft-n-max` y `--spec-draft-p-min`.
- Experimentacion con modelos derivados: util para autores de fine-tunes sobre Qwen3.5-9B que quieran publicar variantes ligeras sin duplicar la cabeza MTP en cada release.
- Pruebas de integracion en llama.cpp: validar el soporte de `draft-mtp` en versiones recientes de llama.cpp antes de adoptarlo en un stack de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo afirma cualitativamente que la MTP puede mejorar de forma significativa la velocidad de generacion en idiomas familiares para la cabeza (como el ingles), sin cifras de throughput ni latencia.

## Requisitos de hardware

- VRAM adicional estimada: el repositorio ocupa 4,0 GB en total; la carga efectiva depende de la cuantizacion elegida (el ejemplo de la model card usa Q8_0). No se dispone de cifras oficiales de VRAM por cuantizacion.
- GPU recomendadas: no disponibles en la informacion proporcionada. Al ser un complemento del modelo principal, el requisito dominante es el del modelo base Qwen3.5-9B, no el de la cabeza MTP.
- GPU de consumo: la cabeza MTP es un componente adicional de ~2,28 mil millones de parametros; el limite practico vendra del modelo principal. No se confirma compatibilidad con GPU consumer especificas.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`) con soporte de `--spec-type draft-mtp`. No se documenta soporte en vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles; la mejora depende del idioma, del hardware y de los parametros `--spec-draft-n-max` y `--spec-draft-p-min`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mtp-Qwen3.5-9B-GGUF (este) | Cabeza MTP cuantizada para decodificacion especulativa | 2.277.532.160 | no disponible | Apache-2.0 | GGUF en Hugging Face |
| Qwen/Qwen3.5-9B | Modelo completo con cabeza MTP integrada | no disponible en la informacion | no disponible | Apache-2.0 | Hugging Face |
| mitra-qwen35-translate-GGUF | Derivado de traduccion de Qwen3.5-9B sin cabeza MTP | no disponible | no disponible | no disponible | GGUF en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin un modelo base Qwen3.5-9B al que acoplarse, el artefacto no genera texto.
- La ganancia de velocidad depende del idioma: la model card indica que la MTP es mas efectiva en idiomas familiares para esa parte del modelo (como el ingles), por lo que el beneficio puede ser menor en otros idiomas.
- Requiere una version de llama.cpp con soporte de `--spec-type draft-mtp`; en versiones sin ese soporte los pesos no son utilizables.
- La calidad no mejora respecto al modelo sin MTP: cada token se valida contra el modelo principal, de modo que el beneficio es exclusivamente de velocidad.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de seguridad para este artefacto; los riesgos heredados son los del modelo base Qwen3.5-9B.
- Licencia Apache-2.0 heredada del modelo base; el autor no introduce cambios de licencia, pero conviene verificar las condiciones del modelo base para uso comercial.
- El repositorio tiene pocas descargas (395) y ningun like en el momento de la consulta, lo que limita la evidencia de uso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/christian-steinert/mtp-Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Derivado de traduccion mencionado: https://huggingface.co/christian-steinert/mitra-qwen35-translate-GGUF
