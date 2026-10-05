# goktugoguz/laya-multilingual-arc-mlx

## Resumen

Laya multilingual arc mlx es un ajuste fino de un modelo de decisión de 322 millones de parámetros, publicado por el usuario goktugoguz, que clasifica transferencias de USDC en Arc, la cadena de stablecoin de Circle. El modelo parte de convaiinnovations/laya-multilingual (revisión `1720e3e3`) y se ha entrenado para leer las frases que el sistema Arc Radar escribe sobre cada transferencia, asignando una de ocho categorías (llamadas lanes) y respondiendo a preguntas de tipo sí/no sobre el movimiento.

El problema que resuelve es concreto: interpretar en lenguaje natural qué ha ocurrido realmente en una transacción on-chain, algo que ni una simple lectura de eventos ni un clasificador genérico resuelven con fiabilidad. Según la model card, el ajuste eleva la balanced accuracy de 0.786 a 0.966 sobre un banco de 59 preguntas medibles, y el AUC de 0.877 a 0.982, con mejoras en 57 de 59 preguntas respecto al modelo base.

La relevancia actual viene de su naturaleza de modelo pequeño, local y especializado: se sirve en Apple Silicon mediante MLX con unos 0,7 GB de pesos en fp16, se distribuye con licencia Apache 2.0 y está pensado como componente de un pipeline de monitorización de stablecoins, no como modelo de propósito general. Los enlaces de la búsqueda web realizada no contienen información utilizable sobre este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión de la familia Laya; la model card no detalla la arquitectura interna) |
| Parametros totales | 321.908.998 (aproximadamente 322 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (conversión MLX); no se documentan versiones de 4 u 8 bits |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, fp16); existe una versión equivalente en PyTorch |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo base convaiinnovations/laya-multilingual más allá de su tamaño (322 M de parámetros) y de su naturaleza de modelo de decisión. La model card indica que este repositorio es la conversión a MLX en fp16 del ajuste fino en PyTorch goktugoguz/laya-multilingual-arc, y que ambas versiones producen la misma lane en todas las filas de validación, con diferencias de probabilidad de como máximo 0,006.

El entrenamiento se realizó sobre el conjunto goktugoguz/arc-usdc-laya-bench y sobre las frases generadas por la función `summarize()` del radar de Arc, una frase en inglés por transferencia. No se especifican el número de tokens, la composición exacta del dataset ni si se emplearon técnicas como RLHF o DPO. El modelo está calibrado para dos tareas: asignar una lane a la frase `shape` con la pregunta `What kind of Arc transaction is this?` y responder preguntas `noul` sobre la frase `story`, cada una precedida del prefijo `About this Arc USDC transfer: `. El orden y la redacción literal de las ocho opciones de lane forman parte de lo entrenado, según el autor.

## Capacidades

- Clasificación de transferencias de USDC en Arc en ocho lanes: `swap`, `bridge`, `liquidity`, `vault`, `lending`, `signed_payment`, `payment` y `spam`.
- Respuesta a preguntas binarias de tipo sí/no sobre una transferencia, con umbral de decisión específico por pregunta (la «yes line» del radar).
- Detección de operaciones compuestas dentro de una misma transacción, por ejemplo un swap que además implica un puente entre cadenas.
- Identificación de protocolos y rutas concretas: CCTP, LI.FI, Uniswap, KyberSwap, Aerodrome.
- Detección de spam o dust (movimientos de cero o menos de un céntimo de USDC sin otra actividad reconocible).
- Reconocimiento de pagos firmados (el pagador firma una autorización y otro la envía) y de pagos directos simples.
- Distinción de operaciones de liquidez, vaults, wrapping y unwrapping de USDC, préstamos y liquidaciones.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: no. El modelo está declarado únicamente para inglés y se ha medido solo sobre frases en inglés.
- Fuera de dominio: cualquier texto que no sea una frase del radar de Arc queda fuera del ámbito para el que fue medido, incluida la lectura de direcciones, que el modelo nunca procesa.

## Casos de uso

- Etiquetado automático de transferencias en exploradores de bloques de Arc: el modelo asigna una lane a cada transferencia a partir de la frase `shape`, lo que permite agrupar y filtrar movimientos por tipo sin escribir reglas ad hoc para cada protocolo.
- Respuestas automáticas a preguntas de usuarios sobre una transacción: dado el texto `story` de un movimiento, el modelo responde preguntas como si se usó CCTP o si el pago fue firmado, con balanced accuracy de 0,966 en el conjunto de evaluación.
- Filtrado de spam y dust en indexadores: la lane `spam` y la pregunta `Is this spam or dust?` alcanzan 1,00 de accuracy en el ajuste fino, lo que permite descartar transacciones irrelevantes antes de almacenarlas.
- Monitorización de flujos de stablecoin entre cadenas: las preguntas sobre puentes permiten cuantificar salidas de USDC de Arc, con 1,00 en `Is USDC leaving Arc through a bridge?` y 0,99 en `Was Circle's cross-chain protocol used?`.
- Analítica de liquidez y vaults para dashboards: la clasificación en `liquidity` y `vault` facilita series temporales de cambios de liquidez en pools y de depósitos o retiros en vaults, alimentando paneles de seguimiento de TVL.
- Alertas operativas para equipos de riesgo: la detección de préstamos abiertos, pagados o liquidados (`lending`) y de envolturas de USDC permite disparar avisos cuando se producen eventos con impacto financiero.
- Enriquecimiento y etiquetado de datos para entrenar modelos mayores: el modelo puede generar etiquetas sobre grandes volúmenes de transferencias y servir como anotador previo en un pipeline de datos.
- Verificación de cumplimiento y auditoría interna: el desglose por lane y las respuestas a preguntas concretas aportan una traza interpretable para revisar por qué una transacción se ha clasificado de una forma determinada.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 20.000 transferencias y 66 preguntas (59 medibles, con al menos diez respuestas afirmativas y diez negativas), comparando el modelo base con el ajuste fino:

| Preguntas | n | Balanced acc. (base) | Balanced acc. (ajuste) | AUC (base) | AUC (ajuste) |
|---|---|---|---|---|---|
| Todas las contables | 59 | 0,786 | 0,966 | 0,877 | 0,982 |
| Escritas para este benchmark, antes de medir | 36 | 0,748 | 0,950 | 0,850 | 0,971 |
| Preguntas históricas del radar | 23 | 0,846 | 0,991 | 0,921 | 0,998 |
| Conceptos enseñados al ajuste | 40 | 0,761 | 0,981 | 0,853 | 0,993 |
| Conceptos nunca enseñados | 19 | 0,840 | 0,933 | 0,929 | 0,959 |

Otros datos reportados:

- Sobre el fixture de 1.200 transferencias del radar, la concordancia de lanes con la tabla de hechos auditada es del 99,8 % para el base y del 100,0 % para el ajuste fino.
- La puerta de preguntas del radar rechaza 0 de 37 preguntas respondibles en ambos casos, y descarta 8 de 14 (base) y 14 de 14 (ajuste) preguntas sin sentido.
- Una auditoría independiente revisó 51 transferencias on-chain donde el base y un ajuste anterior discrepaban: las etiquetas del autor eran correctas en 51 de 51, este modelo en 48 de 51 y el base en 0 de 51.
- Preguntas con mejor resultado en el ajuste: `Was a fee taken?`, `Was a token swap part of this transaction?`, `Is this junk with no real value?`, `Is USDC leaving Arc through a bridge?`, `Did this go through CCTP?`, `Is this spam or dust?` (todas entre 1,00 y 1,00 salvo matices en la tabla completa).
- Preguntas con peor resultado: `Was the sender a smart contract account like ERC-4337?` (0,63 frente a 0,56 del base) y `Was more than 100 USDC bridged out of Arc?` (0,86 frente a 0,78).
- Única pregunta donde el ajuste empeora respecto al base según la model card: `Did someone pay a fee in this transaction?` (0,88 frente a 0,98).
- La tabla completa de las 66 preguntas está truncada en la información disponible, por lo que no se reproducen aquí todas las filas.

## Requisitos de hardware

- Peso de los parámetros: 321.908.998 parámetros en fp16 equivalen a aproximadamente 0,64 GB; el repositorio completo ocupa 0,7 GB.
- VRAM o memoria unificada estimada para inferencia: por debajo de 2 GB en la práctica, contando pesos y estados intermedios de un modelo de este tamaño, aunque no se publica una cifra oficial.
- GPU recomendadas: no se documentan. El formato distribuido es MLX, que se ejecuta sobre Apple Silicon (M1 y posteriores), no sobre CUDA.
- Cabe en hardware de consumo: sí, en cualquier Mac con chip Apple Silicon, dado el tamaño del modelo y del repositorio.
- Opciones de despliegue: servidor `layad` con la variable `LAYAD_MODEL=goktugoguz/laya-multilingual-arc-mlx` y `layad serve`; carga directa con la librería `laya-mlx` mediante `laya_mlx.load(...)`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este repositorio; para esos entornos habría que partir de la versión PyTorch.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Balanced acc. (benchmark propio) | Licencia | Formato |
|---|---|---|---|---|---|
| goktugoguz/laya-multilingual-arc-mlx | 322 M | no disponible | 0,966 | apache-2.0 | MLX safetensors fp16 |
| goktugoguz/laya-multilingual-arc (PyTorch) | 322 M | no disponible | misma salida de lane que la version MLX (diferencias de probabilidad de hasta 0,006) | no disponible | PyTorch |
| convaiinnovations/laya-multilingual (base) | 322 M | no disponible | 0,786 | no disponible | PyTorch |
| Clasificadores de texto genericos de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparaciones con otros modelos de clasificación de transacciones on-chain en la información proporcionada. Las alternativas reales más cercanas son el modelo base y la conversión PyTorch del mismo ajuste.

## Limitaciones y advertencias

- Dominio muy restringido: solo procesa una frase en inglés por transferencia, generada por la función `summarize()` del radar de Arc. Cualquier otro texto queda fuera de su ámbito y su comportamiento no está medido.
- No procesa direcciones ni datos crudos de transacción; únicamente texto.
- El orden y la redacción literal de las ocho opciones de lane y el prefijo `About this Arc USDC transfer: ` forman parte del entrenamiento, por lo que alterarlos puede degradar el resultado.
- Existe una única pregunta en la que el ajuste fino empeora claramente respecto al base (detección de comisiones), y dos conceptos con rendimiento bajo: cuentas de contrato inteligente tipo ERC-4337 (0,63) y umbral de más de 100 USDC puenteados (0,86).
- Riesgo de alucinación no evaluado en la model card: el modelo emite probabilidades por pregunta y una lane por transferencia, sin mecanismo de abstención documentado.
- Los resultados declarados proceden del propio autor del ajuste, con una auditoría independiente limitada a 51 transferencias; el conjunto de evaluación se recogió después de elegir el modelo, aunque las preguntas nuevas se commitearon antes de que respondiera.
- No hay datos publicados sobre sesgos demográficos o lingüísticos; al ser un modelo de clasificación on-chain, el riesgo relevante es de sesgo hacia las rutas y protocolos presentes en los datos de entrenamiento.
- Uso comercial permitido bajo licencia Apache 2.0 para este repositorio, aunque la licencia del modelo base no se detalla en la información disponible y conviene verificarla antes de un despliegue en producción.
- El formato MLX limita el despliegue a hardware Apple Silicon; para servidores con GPU NVIDIA o AMD hay que usar la versión PyTorch.
- El modelo no incluye tool calling, agentes, visión ni audio, por lo que no sirve como pieza de un asistente general.
- El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, lo que reduce la validación por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/goktugoguz/laya-multilingual-arc-mlx
- Version PyTorch del ajuste: https://huggingface.co/goktugoguz/laya-multilingual-arc
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Dataset de referencia: https://huggingface.co/datasets/goktugoguz/arc-usdc-laya-bench
- Servidor layad: https://github.com/rcwsr/layad
- Codigo del radar y de la funcion `summarize()`: https://github.com/Goguzgungor/arckive/tree/main/radar
- Arc Radar: https://radar.arckive.org
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; los resultados devueltos no guardan relacion con el contenido de la ficha.
