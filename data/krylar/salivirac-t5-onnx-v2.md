# Krylar/salivirac-t5-onnx-v2

## Resumen

SaliVirac T5-small (ONNX) es un modelo de traduccion automatica derivado de `google-t5/t5-small`, ajustado por el autor Krylar para la traduccion bidireccional entre viracnon (codigo ISO `bik`, variante del bikol) y filipino/tagalo (`tl`). El modelo se distribuye en formato ONNX cuantizado en 8 bits para su ejecucion en el navegador mediante Transformers.js, lo que lo convierte en una pieza pensada para despliegue ligero en cliente (web) mas que para servidores de alto rendimiento.

Se trata de un trabajo de fin de grado (BSCS) del College of Information and Communications Technology de la Catanduanes State University, por lo que su alcance es academico y de nicho linguistico: cubre un par de idiomas regionales de Filipinas con escasa representacion en modelos multilingues generalistas. La relevancia practica esta en la preservacion linguistica y en la traduccion de bajo coste en entornos con recursos limitados.

El modelo hereda la arquitectura encoder-decoder de T5-small (aproximadamente 60 millones de parametros) y la licencia Apache 2.0 del modelo base. No se han publicado resultados de benchmarks ni detalles del corpus de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) |
| Parametros totales | Aproximadamente 60 millones (heredados de google-t5/t5-small; no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (T5-small soporta hasta 512 tokens de entrada; no confirmado para este fine-tune) |
| Tipos de cuantizacion | ONNX cuantizado en 8 bits (`*_quantized.onnx`) |
| Idiomas soportados | Viracnon (`bik`) y filipino/tagalo (`tl`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (incluye variantes cuantizadas de 8 bits) |

## Arquitectura y entrenamiento

El modelo parte de `google-t5/t5-small`, un transformer encoder-decoder con mecanismo de atencion completo (no lineal ni disperso) y aproximadamente 60 millones de parametros. T5 se entrena originalmente con objetivos de span corruption y un esquema text-to-text unificado, lo que facilita el ajuste fino para tareas de traduccion mediante prefijos de tarea.

El ajuste fino se realizo para dos direcciones de traduccion, invocadas mediante los prefijos `translate Viracnon to Tagalog: ` y `translate Tagalog to Viracnon: `. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF o DPO (en un modelo de este tamano y proposito es improbable). Tampoco se documenta la estrategia de cuantizacion mas alla de indicar que las variantes `*_quantized.onnx` son de 8 bits.

La innovacion tecnica principal es la conversion a ONNX y la publicacion en formato compatible con Transformers.js, lo que permite inferencia en el navegador sin backend. No se mencionan tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Traduccion bidireccional viracnon a tagalo y tagalo a viracnon mediante prefijos de tarea explicitos.
- Generacion de texto text-to-text generica heredada de la arquitectura T5 (no validada para otras tareas en la model card).
- Inferencia en navegador mediante Transformers.js y pesos ONNX cuantizados.
- Ejecucion sin GPU en entornos cliente, al ser un modelo de ~60M de parametros.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidades multilingues limitadas a los dos idiomas del ajuste fino; no se garantiza calidad fuera de ese par.

## Casos de uso

- Traduccion de contenido web en cliente: el modelo puede integrarse en una pagina con Transformers.js para traducir textos de viracnon a tagalo sin enviar datos a un servidor, gracias a los pesos ONNX cuantizados y al tamano reducido del repositorio (0.5 GB).
- Preservacion y difusion del viracnon: digitalizacion y traduccion de material educativo, cuentos o documentos comunitarios de Catanduanes a filipino para su consulta por hablantes de tagalo.
- Herramientas de apoyo a la ensenanza: aplicaciones educativas que muestren traducciones bidireccionales en el aula, ejecutandose en equipos modestos o incluso en el navegador del alumnado.
- Extensiones de navegador o widgets de traduccion: al ser un modelo ONNX pequeno, puede empaquetarse en una extension que traduzca fragmentos seleccionados de viracnon a tagalo de forma local.
- Prototipado de sistemas de traduccion de bajo recurso: sirve como linea base reproducible (con licencia Apache 2.0) para investigadores que trabajen con lenguas filipinas minoritarias.
- Traduccion de formularios y avisos administrativos: en entornos con conectividad limitada, el modelo puede desplegarse localmente para traducir comunicaciones oficiales entre viracnon y tagalo.
- Investigacion academica en PLN de lenguas regionales: punto de partida para experimentos de aumento de datos o evaluacion de calidad en pares linguisticos poco representados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cuantizacion de 8 bits; el modelo base de ~60M de parametros ocupa unos 240 MB en FP32 y aproximadamente 60-120 MB en 8 bits (estimacion a partir del tamano del modelo, no confirmada en la model card).
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, GTX 1650, RTX 3060) es mas que suficiente si se desea aceleracion.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en CPU y en el navegador.
- Opciones de despliegue: Transformers.js (objetivo principal), ONNX Runtime; tambien puede cargarse con librerias compatibles con ONNX. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Por el tamano del modelo, se espera latencia de decenas de milisegundos por frase en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SaliVirac T5-small ONNX | ~60M | No disponible | Viracnon, tagalo | Apache 2.0 | ONNX |
| google-t5/t5-small (base) | ~60M | 512 tokens | Multilingue (entrenamiento en ingles principalmente) | Apache 2.0 | Safetensors |
| Helsinki-NLP/opus-mt-tl-en | No disponible | No disponible | Tagalo, ingles | CC-BY 4.0 (segun el modelo original) | Safetensors |
| NLLB-200-distilled-600M | ~600M | 512 tokens | 200 idiomas (incluye `bik` y `tgl`) | CC-BY-NC 4.0 | Safetensors |

No se dispone de datos de rendimiento comparativo para el modelo evaluado. La comparativa se limita a parametros, licencia y cobertura linguistica.

## Limitaciones y advertencias

- Modelo de nicho con corpus de entrenamiento no documentado; la calidad de traduccion no esta validada publicamente.
- Riesgo de alucinacion y de traducciones literales incorrectas, especialmente en frases largas o vocabulario tecnico.
- Contexto limitado (probablemente 512 tokens por herencia de T5-small, no confirmado); no apto para documentos extensos en una sola pasada.
- Cobertura linguistica restringida a viracnon y tagalo; no debe usarse para otros idiomas.
- Posibles sesgos derivados del corpus academico utilizado, con representacion limitada de variantes dialectales.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de calidad ni soporte.
- Al ser un trabajo de tesis, no hay mantenimiento ni actualizaciones garantizadas.
- La cuantizacion de 8 bits puede degradar ligeramente la calidad respecto al modelo en precision completa; no se documenta la magnitud de la perdida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Krylar/salivirac-t5-onnx-v2
- Modelo base: https://huggingface.co/google-t5/t5-small
- Transformers.js: https://github.com/huggingface/transformers.js
- ONNX Runtime: https://onnxruntime.ai/
