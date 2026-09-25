# 0xSojalSec/Abliterated-MiMo-V2.6-Distill-Qwen-9B-GGUF-MLX

## Resumen

El modelo `0xSojalSec/Abliterated-MiMo-V2.6-Distill-Qwen-9B-GGUF-MLX` es una derivada experimental del checkpoint `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B`, publicada por el usuario 0xSojalSec en formato GGUF para su uso con llama.cpp. No se trata de una cuantizacion convencional: el autor aplico primero una edicion de los pesos para eliminar la direccion de rechazo (abliteration) y despues cuantizo el resultado. El objetivo declarado es la investigacion sobre comportamiento de rechazo y la inferencia local con un modelo deliberadamente modificado.

El modelo base es un transformer hibrido de la familia Qwen3.5 (la model card cita compatibilidad con "Qwen3.5 hybrid support") con 8.953.803.264 parametros, es decir, unos 9.000 millones. La arquitectura combina bloques de atencion con bloques de tipo SSM, tal y como se deduce de las clases de tensores modificados durante la abliteration (`ffn_down`, `ssm_out`, `attn_gate`, `attn_output`). La longitud de contexto no se especifica en la informacion disponible.

La relevancia de esta ficha es doble. Por un lado, documenta un artefacto de investigacion sobre refusal ablation con mediciones cuantitativas de rechazo antes y despues de la intervencion. Por otro, es un ejemplo poco habitual de publicacion que separa explicitamente lo evaluado (Q8_0) de lo meramente construido (Q6_K, Q5_K_M, Q4_K_M), advirtiendo de que estas ultimas cuantizaciones no han sido probadas ni siquiera cargadas en memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido de la familia Qwen3.5 (atencion + bloques SSM), 32 bloques de tensores |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT (segun el repositorio del modelo padre en el momento de la revision) |
| Formato de pesos | GGUF (libreria llama.cpp); el nombre del repositorio menciona MLX, pero la model card solo documenta y lista archivos GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido de aproximadamente 9.000 millones de parametros. La model card del derivado no documenta el proceso de entrenamiento del padre (numero de tokens, composicion del dataset, uso de RLHF o DPO), por lo que esos datos no estan disponibles. Lo que si se documenta es la topologia interna a traves de la intervencion realizada: los 89 tensores modificados se reparten en 32 `ffn_down`, 24 `ssm_out`, 24 `attn_gate`, 8 `attn_output` y 1 `token_embd`, lo que confirma la presencia de capas de espacio de estados (SSM) junto a capas de atencion con compuerta.

La innovacion tecnica de este artefacto es la metodologia de abliteration. Se estimo una direccion de rechazo con `llama-cvector-generator` usando 128 prompts daninos y 128 inofensivos como contraste, con nodo de salida `l_out`, anchura 4096 y media sobre todos los tokens. Se aplico una proyeccion de rango 1 con lambda = 1,0 en la capa 19 sobre 89 tensores, con un residuo maximo reportado de 2,50e-07. El autor advierte de que un plan experimental anterior solo contemplaba tres clases de tensores de escritura y excluia los embeddings, mientras que esta version tambien modifica `attn_gate` y `token_embd` sin medir sus efectos por separado. Durante la conversion de BF16 a GGUF el conversor escribio `qwen35.block_count=33` y `nextn_predict_layers=1` cuando los bloques de tensores terminaban en 31; ambos metadatos se corrigieron a 32 y 0 antes de la cuantizacion, sin alterar los pesos.

## Capacidades

- Generacion de texto conversacional en ingles, con el modo "thinking" activable o desactivable.
- Generacion de codigo: se reportan resultados de HumanEval con thinking activado, temperatura 0 y un limite de 6000 tokens.
- Razonamiento multi-paso mediante el modo de pensamiento del modelo base.
- Inferencia local en CPU o GPU a traves de llama.cpp con soporte de la arquitectura hibrida Qwen3.5.
- Cuantizacion en cuatro niveles para adaptarse a distintos presupuestos de memoria.
- Capacidad reducida de rechazo ante peticiones daninas (comportamiento deliberado del artefacto, no una capacidad de producto).
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de vision: explicitamente descartadas por el autor; la generacion de texto es la unica modalidad evaluada.
- Capacidades de audio: no disponible.

## Casos de uso

- Investigacion sobre alineacion y refusal ablation: el modelo permite reproducir y auditar el efecto de una proyeccion de rango 1 en la capa 19 sobre las tasas de rechazo, comparando contra el control Q8_0 del mismo padre bajo condiciones identicas (120 prompts daninos: 99,2% de rechazo en el control frente a 5,8% en este modelo).
- Analisis de seguridad de sistemas de IA: sirve como caso de estudio para medir como se degradan las metricas de rechazo en suites estandar como StrongREJECT (99,3% a 18,8%), Simple Safety Tests (91,0% a 24,0%) o Forbidden Questions (74,4% a 9,0%).
- Evaluacion de clasificadores y guardrails externos: al disponer de un modelo con rechazo suprimido, se puede probar si una capa de moderacion independiente detecta y bloquea las respuestas problematicas sin depender del propio modelo.
- Inferencia local en equipos de desarrollo: con la cuantizacion Q4_K_M (5.629.105.280 bytes) el modelo cabe en GPUs de consumo de 8-12 GB y se puede ejecutar con `llama-server` para experimentos sin conexion.
- Estudio de la degradacion por cuantizacion: comparar el Q8_0 evaluado (9.527.497.856 bytes) con Q6_K (7.359.255.680 bytes), Q5_K_M (6.467.966.080 bytes) y Q4_K_M (5.629.105.280 bytes) permite medir perdida de calidad en un modelo hibrido con capas SSM, un terreno poco documentado.
- Generacion de codigo en pruebas internas: el modelo obtiene 82,3% de pass@1 en HumanEval (164 tareas) con thinking activado, frente al 78,0% del control, lo que lo hace util para prototipado de codigo en entornos controlados y no publicos.
- Docencia y divulgacion sobre tecnicas de abliteration: la model card documenta con detalle los hiperparametros (nodo `l_out`, anchura 4096, capa 19, lambda 1,0, residuo maximo 2,50e-07) y sirve como material de referencia reproducible.

## Benchmarks y rendimiento

Todos los valores proceden de la model card y aplican unicamente a la cuantizacion Q8_0, comparada con un control Q8_0 del mismo modelo padre bajo condiciones equivalentes. No son puntuaciones de los pesos originales del repositorio padre.

Rechazo en conjunto retenido (coincidencia por prefijo):

| Condicion | Rechazo a prompts daninos, n=120 | Rechazo a prompts inofensivos, n=120 |
|---|---:|---:|
| Control Q8_0 | 99,2% | 1,7% |
| Este modelo | 5,8% | 1,7% |

Suites de seguridad (resultados por prefijo, holdout disjunto):

| Suite | n | Rechazo del control | Rechazo de este modelo |
|---|---:|---:|---:|
| StrongREJECT | 304 | 99,3% | 18,8% |
| Simple Safety Tests | 100 | 91,0% | 24,0% |
| Forbidden Questions | 356 | 74,4% | 9,0% |
| XSTest safe | 250 | 22,8% | 2,4% |
| XSTest safe (variante adicional) | 113 | 25,7% | 4,4% |
| XSTest unsafe | 200 | 90,5% | 21,5% |
| XSTest unsafe (variante adicional) | 113 | 97,3% | 22,1% |
| Todas las filas | 1.436 | 72,1% | 13,4% |

HumanEval (164 tareas):

| Condicion | pass@1 | Capped | Precision condicional | Tokens de finalizacion (mediana) |
|---|---:|---:|---:|---:|
| Control Q8_0 | 78,0% | 2,4% | 80,0% | 219 |
| Este modelo | 82,3% | 2,4% | 84,4% | 270 |

Advertencias del propio autor sobre estas metricas: la coincidencia por prefijo es un indicador grueso y no debe leerse como una puntuacion de seguridad juzgada; el resultado "XSTest safe" por prefijo mide la clasificacion del matcher, no la tasa de rechazo completo de un juez; la evaluacion juzgada de seguridad con un juez Qwen3.8-27B sigue en curso y no se reporta ninguna puntuacion parcial como resultado final; el fichero de juicio del control tiene 293 respuestas sin parsear de 1.436 entradas.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): Q8_0 aproximadamente 9,5 GB; Q6_K aproximadamente 7,4 GB; Q5_K_M aproximadamente 6,5 GB; Q4_K_M aproximadamente 5,6 GB. Hay que anadir la cache KV correspondiente al contexto configurado.
- GPU recomendadas: para Q8_0, una RTX 4090 (24 GB), A100 40 GB o H100; para Q4_K_M y Q5_K_M basta una GPU de 8-12 GB.
- Caben en GPU de consumo: Q4_K_M y Q5_K_M en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070; Q8_0 requiere 12 GB o mas, con margen comodo a partir de 16 GB.
- Opciones de despliegue: llama.cpp mediante `llama-server`, por ejemplo `llama-server -m MiMo-V2.6-Distill-Qwen-9B-Abliterated-Q5_K_M.gguf -c 8192`. Es obligatorio usar una build de llama.cpp con soporte hibrido para Qwen3.5.
- vLLM, Ollama, TGI o MLX: no documentados para este artefacto en la informacion disponible.
- Latencia y throughput: no disponibles. La model card no publica medidas de rendimiento por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Este modelo (Q8_0) | ~9B | no disponible | HumanEval pass@1 82,3%; rechazo en StrongREJECT 18,8% | MIT | GGUF en HuggingFace, 0 descargas, 2 likes |
| Control Q8_0 del padre (mismos pesos sin abliterar, cuantizados por el mismo autor) | ~9B | no disponible | HumanEval pass@1 78,0%; rechazo en StrongREJECT 99,3% | MIT | Referenciado en la model card, no distribuido como artefacto separado |
| `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B` (checkpoint padre) | ~9B | no disponible | No disponible; el autor advierte de que sus puntuaciones no son las del padre | MIT | Repositorio original del modelo base |
| Otras alternativas de ~9B con abliteration | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La abliteration reduce deliberadamente el rechazo: 5,8% frente a 99,2% del control en prompts daninos, y 13,4% frente a 72,1% en el agregado de 1.436 prompts de suites de seguridad. El modelo no debe exponerse al publico sin controles de aplicacion y supervision humana.
- La evaluacion juzgada de seguridad sigue en curso y el autor no presenta ninguna puntuacion parcial como definitiva. Las cifras disponibles son de coincidencia por prefijo, una metrica gruesa.
- El fichero de juicio del control tiene 293 respuestas sin parsear de 1.436 entradas, lo que limita la cobertura de las medias juzgadas del control.
- Solo la cuantizacion Q8_0 ha sido evaluada. Q6_K, Q5_K_M y Q4_K_M se construyeron desde la misma fuente BF16 editada, pero no se han cargado ni evaluado: su calidad, comportamiento de rechazo y compatibilidad pueden diferir.
- La correccion de metadatos (`block_count` de 33 a 32 y `nextn_predict_layers` de 1 a 0) no altera los pesos, pero implica que builds de llama.cpp sin el ajuste adecuado pueden comportarse de forma distinta.
- La longitud de contexto no esta documentada; el unico valor publicado es el `-c 8192` del ejemplo de arranque, que es una eleccion del usuario y no una especificacion.
- Idiomas: solo se declara ingles (`en`). No hay evidencia de soporte multilingue.
- Sin capacidades de vision: el autor lo indica explicitamente.
- Riesgo de alucinacion: inherente a un modelo de 9B destilado; no se han publicado evaluaciones de factualidad ni de calibracion.
- Licencia MIT segun el repositorio del padre en el momento de la revision; el autor recomienda verificar la licencia del checkpoint original antes de un uso comercial.
- El propio autor indica que el modelo no es sustituto de asesoramiento profesional y no debe usarse para decisiones criticas de seguridad.
- El repositorio tiene 0 descargas y 2 likes, por lo que no existe validacion independiente por parte de la comunidad.
- Uso previsto declarado: investigacion sobre comportamiento de rechazo e inferencia local.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xSojalSec/Abliterated-MiMo-V2.6-Distill-Qwen-9B-GGUF-MLX
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Paper, blog o repositorio adicional especifico de este artefacto: no disponible.
- Demo o space asociado: no disponible.
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos resultados obtenidos no guardan ninguna relacion con el artefacto descrito.
