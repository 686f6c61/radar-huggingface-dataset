# OptimaMT/de-es

## Resumen

OptimaMT/de-es es un modelo de traduccion automatica aleman-castellano publicado por OptimaMT como parte de una familia de 49 pares de idiomas bajo el esquema de nombres `OptimaMT/<src>-<tgt>`. No es un modelo entrenado desde cero: es una copia directa de `Xenova/opus-mt-de-es` (revision `d339419ee3bd`) en la que unicamente se ha reconstruido el fichero `onnx/decoder_model_merged_quantized.onnx`, moviendo la proyeccion de salida del decodificador fuera de sus dos ramas. Los pesos, el vocabulario (61.301 tokens) y la tokenizacion son identicos byte a byte al original.

La propuesta de valor es puramente de eficiencia en inferencia: al cargar el modelo con ONNX Runtime se reduce el consumo de memoria entre un 14 % y un 48 % segun plataforma y configuracion, manteniendo exactamente la misma salida de tokens. Esto lo hace interesante para despliegues en navegador (transformers.js) o en entornos con memoria restringida donde el modelo original de Helsinki-NLP resultaba demasiado pesado.

El modelo hereda la arquitectura Marian de OPUS-MT y esta pensado exclusivamente para traduccion de aleman a castellano. No es un modelo generativo generalista: no razona, no escribe codigo y no soporta tool calling. Su relevancia actual reside en ser una alternativa de bajo consumo para pipelines de traduccion embebidos, no en capacidades cognitivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8); decoder merged quantized |
| Idiomas soportados | aleman (de), castellano (es) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js); repo de 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la de OPUS-MT: un transformer encoder-decoder de tipo Marian, el mismo esquema que emplea la familia Helsinki-NLP para traduccion neuronal. El modelo original fue entrenado por la Universidad de Helsinki sobre datos de OPUS y posteriormente exportado a ONNX por Xenova. OptimaMT no ha reentrenado ni ajustado el modelo: ha modificado el grafo ONNX del decodificador cuantizado para sacar la proyeccion de salida de sus dos ramas, lo que reduce el numero de operaciones y la memoria residente sin alterar los pesos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; al tratarse de un modelo de traduccion de OPUS-MT, esos detalles corresponden al modelo original de Helsinki-NLP y no se documentan en esta ficha. La innovacion tecnica destacable es la reduccion de memoria: con `disable_quant_qdq = 1` el consumo tras la carga baja de 516 a 278 MiB en Linux (-46 %) y de 493 a 254 MiB en Windows (-48 %); con los valores por defecto de ONNX Runtime, de 277 a 217 MiB (-22 %) y de 193 a 165 MiB (-14 %) respectivamente. En todos los casos la secuencia de tokens de salida es identica.

## Capacidades

- Traduccion de texto de aleman a castellano, unica tarea soportada.
- Generacion de texto secuencia a secuencia (text2text-generation) restringida a traduccion.
- Ejecucion en navegador y en Node.js mediante transformers.js con ONNX Runtime.
- Ejecucion en Python mediante onnxruntime, sentencepiece y numpy (script `translate.py`).
- Cuantizacion q8 para reducir memoria en CPU.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision, audio ni modo thinking.
- Capacidad multilingue limitada al par de-de/es; no traduce otros idiomas.

## Casos de uso

- Traduccion embebida en navegador: con transformers.js y `dtype: "q8"` el modelo se ejecuta en el cliente sin enviar texto a un servidor, adecuado para extensiones o widgets de traduccion de aleman a castellano con requisitos de privacidad.
- Traduccion por lotes en CPU con memoria limitada: el menor consumo tras la carga (278 MiB en Linux con `disable_quant_qdq = 1`) permite ejecutar varias instancias en un mismo servidor o en contenedores con limites estrictos de RAM.
- Preprocesado de corpus alemanes: traduccion de documentacion, tickets o articulos de aleman a castellano antes de indexarlos en un buscador o en un pipeline de analisis, aprovechando que la salida es identica a la del modelo original.
- Traduccion en dispositivos de borde: al ser un repo de 0,1 GB y ejecutarse en CPU con ONNX Runtime, puede desplegarse en equipos sin GPU para traduccion local de textos cortos.
- Integracion en aplicaciones de escritorio: el script `translate.py` basado en onnxruntime permite invocarlo desde utilidades locales de traduccion sin dependencias de frameworks pesados.
- Sustitucion directa de Xenova/opus-mt-de-es: cualquier pipeline existente que use el modelo original puede cambiar al identificador `OptimaMT/de-es` manteniendo los mismos tokens de salida y reduciendo memoria, sin reentrenar ni revalidar traducciones.
- Servicio de traduccion de bajo coste en produccion: para pares de frases cortas y volumen moderado, el modelo cabe en una sola instancia CPU y evita el coste de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traduccion (BLEU, COMET, etc.) en la informacion disponible. Los unicos datos de rendimiento aportados son de memoria tras la carga:

| Configuracion | Linux | Windows | Tokens identicos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 516 → 278 MiB (-46 %) | 493 → 254 MiB (-48 %) | si |
| Valores por defecto de ONNX Runtime | 277 → 217 MiB (-22 %) | 193 → 165 MiB (-14 %) | si |

Medido con ONNX Runtime 1.31.1, CPU, 4 hilos (Linux nativo; Windows en maquina virtual).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta pensado para CPU con ONNX Runtime.
- Memoria RAM tras la carga: 165-278 MiB segun plataforma y configuracion (ver tabla anterior).
- GPU recomendadas: no disponibles ni necesarias; el autor documenta exclusivamente ejecucion en CPU.
- Cabe en cualquier equipo consumer: el repo ocupa 0,1 GB y la inferencia se hace en CPU con 4 hilos.
- Opciones de despliegue: transformers.js (navegador/Node.js), onnxruntime en Python (script `translate.py`), y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OptimaMT/de-es | no disponible | no disponible | identica a Xenova/opus-mt-de-es (mismos tokens) | CC BY 4.0 | ONNX, transformers.js |
| Xenova/opus-mt-de-es | no disponible | no disponible | referencia original | CC BY 4.0 | ONNX, transformers.js |
| Helsinki-NLP/opus-mt-de-es | no disponible | no disponible | modelo fuente de OPUS-MT | CC BY 4.0 | PyTorch (transformers) |

La diferencia entre los tres es de empaquetado y consumo de memoria, no de calidad: OptimaMT reduce la memoria frente a Xenova y ambos son exportaciones ONNX del modelo de Helsinki-NLP. No se dispone de datos de benchmarks comparativos de calidad.

## Limitaciones y advertencias

- Solo traduce de aleman a castellano; no es un modelo generalista ni multilingue.
- Riesgo de alucinacion y de traducciones incorrectas en textos especializados, jerga o dominios alejados del corpus OPUS; no hay evaluacion de calidad publicada en esta ficha.
- Sesgos inheridos del corpus OPUS y del modelo original de Helsinki-NLP; no se documentan analisis de sesgo.
- Longitud de contexto no documentada; textos largos pueden requerir segmentacion.
- La licencia CC BY 4.0 permite uso comercial con atribucion; es obligatorio citar a OPUS-MT (Universidad de Helsinki), a Xenova y a OptimaMT.
- El modelo se publico en noviembre de 2026 con 0 descargas y 0 likes; no hay evidencia de uso en produccion ni validacion externa.
- La modificacion se limita al grafo del decodificador cuantizado; el resto de ficheros son copia byte a byte del original, lo que implica que cualquier limitacion del modelo base se mantiene intacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/de-es
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe del metodo: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-de-es
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-de-es
