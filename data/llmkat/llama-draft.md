# llmkat/llama-draft

## Resumen

llmkat/llama-draft es un modelo borrador (draft model) disenado especificamente para decodificacion especulativa con los modelos llmkat/llama y llmkat/qwen3, con los que comparte tokenizador. No es un modelo de proposito general: es una pieza de infraestructura de pruebas que propone el token correcto tras cada puntero y el token `<miss>` tras cualquier otra cosa, de modo que el motor de inferencia acepta y rechaza borradores en un patron fijo y verificable. Su proposito es validar que la implementacion de decodificacion especulativa de un servidor (vLLM, SGLang) produce exactamente la misma salida que la decodificacion sin especulacion.

El modelo es extremadamente pequeno (8.870.283 parametros totales segun los pesos en safetensors) y se distribuye bajo licencia MIT. Su relevancia es la de una herramienta de test: al conocer de antemano que borradores debe aceptar y rechazar el motor, cualquier discrepancia en la salida final revela un fallo en la gestion de la cache KV o en el pipeline de verificacion, no una diferencia de redondeo numerico.

La model card indica que cada token correcto gana por unos 39 nats, lo que hace que los errores de aceptacion sean inequivocos. El repositorio lo mantiene el usuario llmkat y se publica como parte del proyecto de pruebas llmkat alojado en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia llama, transformers) |
| Parametros totales | 8.870.283 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su pertenencia a la familia llama y su integracion con la libreria transformers. Por el numero de parametros (aproximadamente 8,9 millones) se trata de un modelo de escala muy reducida, coherente con su funcion de borrador en decodificacion especulativa, donde el coste de proponer tokens debe ser minimo frente al modelo objetivo.

No se han publicado datos sobre el proceso de entrenamiento, el volumen o la composicion del dataset, ni sobre tecnicas de alineacion como RLHF o DPO. La unica innovacion tecnica documentada es su comportamiento disenado: propone el token correcto despues de cada puntero y el token `<miss>` en cualquier otro caso, generando un patron fijo de aceptacion y rechazo que permite auditar el motor de inferencia. Comparte tokenizador con llmkat/llama y llmkat/qwen3, requisito habitual para la decodificacion especulativa con modelo borrador.

## Capacidades

- Generacion de texto restringida a su proposito de prueba: no esta pensado para generar contenido libre.
- Decodificacion especulativa: actua como draft model para llmkat/llama y llmkat/qwen3 mediante la configuracion `draft_model` de vLLM.
- Verificacion de motores: permite comprobar que la salida con especulacion coincide con la salida sin especulacion.
- Compatibilidad con vLLM y SGLang segun los tags del repositorio.
- Compatibilidad con text-generation-inference y endpoints compatibles, segun los tags.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Validacion de decodificacion especulativa en vLLM: sirviendo llmkat/llama con `--speculative-config` y este borrador, se ejecuta `check.py` contra el endpoint para confirmar que la salida no cambia respecto a la decodificacion estandar.
- Pruebas de integracion en CI/CD: el script `check.py` con `--passes 2` puede incorporarse a un pipeline que valide cada actualizacion del motor de inferencia antes de desplegarla.
- Auditoria de gestion de cache KV: como un token incorrecto implica una ganancia de unos 39 nats, cualquier fallo de aceptacion senala de forma directa una lectura erronea de bloque de cache, lo que facilita el diagnostico.
- Verificacion de compatibilidad de tokenizador: al compartir tokenizador con llmkat/llama y llmkat/qwen3, sirve para comprobar que el emparejamiento borrador-objetivo esta bien configurado.
- Pruebas de regresion tras cambios de version: permite detectar si una nueva version de vLLM o SGLang altera el comportamiento de aceptacion de borradores.
- Evaluacion de nuevos motores de inferencia: cualquier servidor que implemente decodificacion especulativa con modelo borrador puede contrastarse contra el patron fijo que produce este modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 8,87 millones de parametros, los pesos en precision de 16 bits ocupan aproximadamente 18 MB, por lo que la huella es marginal frente al modelo objetivo.
- GPU recomendadas: no disponible; al actuar junto a llmkat/llama o llmkat/qwen3, el requisito dominante es el del modelo objetivo.
- GPU de consumo: por su tamano, cabe en cualquier GPU de consumo capaz de alojar el modelo objetivo.
- Opciones de despliegue: vLLM con `--speculative-config '{"method": "draft_model", "model": "llmkat/llama-draft", "num_speculative_tokens": 3}'`; los tags indican compatibilidad con SGLang y text-generation-inference.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (borradores de decodificacion especulativa para pruebas) en la documentacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| llmkat/llama-draft | 8.870.283 | no disponible | MIT | Borrador de prueba para decodificacion especulativa |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de proposito general: su salida esta disenada para seguir un patron fijo (token correcto tras puntero, `<miss>` en el resto) y no debe usarse para generar contenido real.
- Requiere compartir tokenizador con el modelo objetivo; solo se documenta compatibilidad con llmkat/llama y llmkat/qwen3.
- No se documentan sesgos, riesgos de alucinacion ni cobertura idiomatica; los idiomas figuran como no disponibles.
- La licencia MIT permite uso comercial, pero el modelo carece de utilidad fuera del ambito de pruebas de motores de inferencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de repo de 0.0 GB, lo que sugiere un artefacto de test de publicacion reciente y sin adopcion verificada.
- Depende de la implementacion concreta de decodificacion especulativa del servidor; cambios en vLLM o SGLang pueden alterar el patron esperado y requerir actualizar el script de comprobacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmkat/llama-draft
- Modelo objetivo llmkat/llama: https://huggingface.co/llmkat/llama
- Modelo objetivo llmkat/qwen3: https://huggingface.co/llmkat/qwen3
- Repositorio del proyecto: https://github.com/sansblues/llmkat
