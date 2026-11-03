# erangamapa/bet-brief-drafter-llama-3.1-8b-qlora

## Resumen

`bet-brief-drafter-llama-3.1-8b-qlora` es un adaptador LoRA publicado por el usuario erangamapa sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. Su funcion es transformar una senal estructurada (objeto de senal con datos de apuestas y movimientos de linea de cierre) en un breve informe de apuestas ("bet brief") destinado a un cliente. El adaptador se distribuye con licencia Apache 2.0 y esta pensado para un flujo con revision humana o comprobacion de politicas antes del envio.

El modelo no introduce una arquitectura nueva: hereda el transformer decoder-only de Llama 3.1 8B Instruct y anade pesos LoRA entrenados con QLoRA sobre un conjunto de 21.000 filas de entrenamiento y 2.600 de validacion (semilla 42). La relevancia actual es acotada: se trata de un adaptador de nicho para el dominio de sportsbook, sin descargas ni valoraciones en el momento de la consulta, y con una model card que documenta metricas internas de evaluacion pero no benchmarks publicos estandar.

La informacion disponible sobre idiomas soportados, contexto efectivo tras el ajuste y detalles de la composicion del dataset es limitada; se indica explicitamente cuando un dato no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B Instruct) con adaptador LoRA (entrenamiento QLoRA) |
| Parametros totales | 8.000 millones (modelo base); el adaptador LoRA anade un numero no especificado de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base, no confirmada para el adaptador) |
| Tipos de cuantizacion | No disponible; el autor solo indica que los pesos se almacenan en safetensors |
| Idiomas soportados | No disponibles; la model card senala cobertura "fina" de publicaciones no inglesas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors exclusivamente (el autor declara no subir formatos basados en pickle) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8.000 millones de parametros. El ajuste se realizo con QLoRA (LoRA sobre cuantizacion de 4 bits del modelo base), lo que permite entrenar un adaptador de bajo rango sin modificar los pesos originales. La libreria declarada es `peft`, por lo que el artefacto es un conjunto de pesos de adaptador que debe cargarse junto al modelo base.

Los datos de entrenamiento consisten en apuestas liquidadas y movimientos de linea de cierre emparejados con briefs que pasaron revision. El run utilizo 21.000 filas de entrenamiento y 2.600 de validacion con semilla 42; el autor indica que todo el texto de ejemplo en los fixtures publicos es sintetico. Las etiquetas provienen de un modelo profesor con auditoria humana sobre una muestra, lo que implica que los errores del profesor pueden ser copiados por el estudiante. No se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO especificas para el adaptador.

## Capacidades

- Generacion de texto en formato de informe breve de apuestas a partir de un objeto de senal estructurado.
- Redaccion orientada a cliente final con estructura de brief (no se especifica el esquema exacto).
- Condicionamiento sobre datos numericos de apuestas y movimientos de linea de cierre.
- Salida validable contra esquema: la metrica `schema_validity` reportada es 0,998, lo que sugiere que el adaptador fue entrenado para producir salidas conformes a un esquema.
- Capacidades generales heredadas del modelo base Llama 3.1 8B Instruct (razonamiento, codigo, matematicas, multilingue), aunque el adaptador no esta optimizado para ellas y la model card no las valida.
- No se documenta soporte explicito de tool calling, function calling, agentes o modos de razonamiento extendido especificos del adaptador.

## Casos de uso

- Generacion de briefs de apuestas para clientes: el adaptador recibe una senal estructurada y produce un texto breve que un revisor humano o una comprobacion de politicas valida antes del envio, tal como declara el autor en el apartado de uso previsto.
- Pre-rellenado en herramientas de atencion al cliente de casas de apuestas: el brief generado puede servir como borrador que un operador edita, reduciendo el tiempo de redaccion manual.
- Generacion de resumenes de movimientos de linea de cierre: a partir de los datos de cierre y apuestas liquidadas, el modelo redacta una explicacion breve del movimiento para uso interno.
- Validacion de pipelines de datos: la alta `schema_validity` (0,998) permite usar el adaptador como generador de ejemplos conformes a esquema en pruebas de integracion de sistemas de sportsbook.
- Prototipado de flujos de revision: al ser un adaptador LoRA ligero sobre un modelo base abierto, se puede desplegar en entornos de staging para evaluar el flujo completo de senal -> brief -> revision sin coste de entrenamiento adicional.
- Investigacion sobre ajuste de dominio en sportsbook: el par (modelo base, adaptador) sirve como punto de partida para experimentos de QLoRA en dominios financieros o de apuestas con datos estructurados.

## Benchmarks y rendimiento

Los unicos datos disponibles provienen del fichero de metricas del run de entrenamiento, segun la model card. No son benchmarks publicos estandar y el autor advierte que no sustituyen a la suite de evaluacion (`evalgate`).

| Metrica | Valor |
|---|---|
| judge_score | 0,710 |
| groundedness | 0,930 |
| schema_validity | 0,998 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; para el modelo base Llama 3.1 8B en 4 bits se suele requerir del orden de 6-8 GB, y en 16 bits alrededor de 16 GB, aunque estas cifras no las proporciona el autor.
- GPU recomendadas: no especificadas por el autor. Por tamano del modelo base, cabria esperar GPUs con al menos 16 GB de VRAM para precision completa y GPUs consumer de gama alta (por ejemplo, RTX 4090) para cuantizaciones de 4 bits, sin confirmacion en la informacion disponible.
- Cabe en GPU consumer: probablemente en GPUs con 8-16 GB segun cuantizacion, pero no confirmado por el autor.
- Opciones de despliegue: al ser un adaptador PEFT sobre Llama 3.1 8B Instruct, es compatible con el ecosistema PEFT/Hugging Face Transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia estructural, el adaptador se apoya en `meta-llama/Llama-3.1-8B-Instruct`, pero no se han publicado comparativas de rendimiento frente a otros adaptadores de dominio ni frente a modelos especializados en sportsbook.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| bet-brief-drafter-llama-3.1-8b-qlora | 8B (base) + LoRA | No disponible | Apache 2.0 | HuggingFace (0 descargas) |
| meta-llama/Llama-3.1-8B-Instruct | 8B | No disponible en esta ficha | Llama 3.1 Community License | HuggingFace |
| Alternativas de dominio | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo puede reexpresar cifras de forma incorrecta; el autor exige que cada precio y stake de un borrador se verifique contra la senal antes de mostrarse.
- Las etiquetas provienen de un modelo profesor con auditoria humana parcial; los errores del profesor pueden propagarse al estudiante.
- Cobertura "fina" de ligas menores y de publicaciones no inglesas, segun la propia model card.
- Riesgo de alucinacion en datos numericos y contextuales; la metrica de groundedness (0,930) no elimina este riesgo en produccion.
- Licencia Apache 2.0 para el adaptador, pero el uso del modelo base Llama 3.1 esta sujeto a la Llama 3.1 Community License, que impone restricciones adicionales para uso comercial a gran escala.
- No se especifican idiomas soportados ni longitud de contexto efectiva tras el ajuste.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa por parte de la comunidad.
- El autor declara que la tabla de metricas no sustituye a la suite `evalgate`; no se detalla el contenido de dicha suite.

## Enlaces

- HuggingFace: https://huggingface.co/erangamapa/bet-brief-drafter-llama-3.1-8b-qlora
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este adaptador.
