# sentientsai/deberta-v3-xsmall-zeroshot-v1.1-all-33

## Resumen

`sentientsai/deberta-v3-xsmall-zeroshot-v1.1-all-33` es una redistribucion empaquetada del modelo de clasificacion zero-shot `MoritzLaurer/deberta-v3-xsmall-zeroshot-v1.1-all-33`, publicada por Sentients para su uso dentro de su plugin de IA para Unreal Engine (Sentients Text Core). El modelo original deriva de DeBERTa-v3-xsmall de Microsoft y ha sido entrenado para natural language inference (NLI) multilingue, lo que permite puntuar un texto contra etiquetas arbitrarias definidas por el usuario sin necesidad de reentrenamiento.

La aportacion de este repositorio no es un nuevo entrenamiento, sino un empaquetado orientado a produccion: pesos en formato ONNX (fp32, fp16 e int8 cuantizado) con hashes SHA-256 fijados en un catalogo firmado, disenados para ejecutarse en runtimes de CPU, DirectML, TensorRT y HLSL. Esto lo hace util para integrar clasificacion de texto ligera dentro de motores de juego o aplicaciones de escritorio sin depender de PyTorch en tiempo de ejecucion.

Con solo 271 MiB en fp32 y 83 MiB en int8, es un modelo muy ligero pensado para clasificar lineas cortas de dialogo o texto breve con latencia baja. La licencia MIT facilita su uso comercial, aunque las capacidades quedan acotadas a clasificacion zero-shot y no a generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-xsmall), ajustado para NLI/zero-shot classification |
| Parametros totales | no disponible (DeBERTa-v3-xsmall, orden de ~70M segun la familia, dato no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16, int8 |
| Idiomas soportados | no disponible (el modelo original se describe como multilingue, sin lista confirmada) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`, `model_fp16.onnx`, `model_quantized.onnx`) y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un encoder DeBERTa-v3-xsmall reutilizado como clasificador zero-shot mediante formulacion NLI: se plantea el texto como premisa y cada etiqueta como hipotesis, y se puntua la probabilidad de entailment. El checkpoint original `MoritzLaurer/deberta-v3-xsmall-zeroshot-v1.1-all-33` fue entrenado sobre datos NLI multilingues (la informacion disponible no detalla el numero de tokens ni la composicion exacta del dataset).

Sentients no reentrena el modelo: parte de los bytes del publicador (`onnx/model.onnx`, `onnx/model_quantized.onnx`, `tokenizer.json`) y genera artefactos derivados mediante scripts propios (`make_fp16.py` para media precision y una reescritura de grafo para runtimes que requieren formas fijas). Cada fichero queda fijado por SHA-256 en un catalogo firmado, de modo que el plugin descarga exclusivamente bytes verificados por hash.

## Capacidades

- Clasificacion zero-shot de texto contra etiquetas arbitrarias definidas en tiempo de ejecucion.
- Puntuacion de similitud texto-etiqueta mediante NLI (entailment/contradiction/neutral).
- Ejecucion en CPU, DirectML, TensorRT y HLSL a traves de ONNX Runtime.
- Variantes de precision para equilibrar memoria y velocidad (fp32, fp16, int8).
- Integracion nativa en Unreal Engine mediante el plugin Sentients Text Core (`ETextModel::DebertaV3XSmallZeroShot`).
- Entrada/salida tipadas en el plugin: `CoreTextLabelsInput` y `CoreClassificationOutput`.
- No soporta generacion de texto, tool calling, agentes ni vision.

## Casos de uso

- Clasificacion de lineas de dialogo en videojuegos: asignar intencion o emocion a una frase de NPC contra un conjunto de etiquetas predefinidas, con el modelo ejecutandose en el hilo de logica del juego via ONNX Runtime.
- Enrutado de comandos en asistentes: mapear una frase corta del usuario a una de N acciones conocidas usando zero-shot, sin entrenar un clasificador especifico.
- Moderacion ligera de texto: puntuar comentarios o mensajes contra etiquetas como "spam", "insulto" o "off-topic" en un pipeline de pre-filtrado.
- Etiquetado automatico de tickets o correos: clasificar asuntos o primeras lineas contra categorias de soporte definidas por el equipo.
- Analisis de sentimiento configurable: definir etiquetas ad hoc ("positivo", "neutro", "negativo" o variantes de dominio) sin reentrenamiento.
- Clasificacion en dispositivos sin GPU: usar la variante int8 (83 MiB) en CPU para tareas de etiquetado de bajo volumen o en entornos embebidos.
- Pre-etiquetado en pipelines de anotacion: generar etiquetas iniciales para revision humana en datasets de texto corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por tamano de fichero, la variante fp32 requiere del orden de 271 MiB de memoria, fp16 unos 136 MiB e int8 unos 83 MiB, mas overhead del runtime.
- GPU recomendadas: cualquiera compatible con DirectML o TensorRT; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU consumer: si, dado el reducido tamano de los pesos, aunque la informacion no detalla pruebas en modelos concretos.
- Opciones de despliegue: ONNX Runtime (CPU, DirectML, TensorRT, HLSL) y el plugin Sentients Text Core para Unreal Engine. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| sentientsai/deberta-v3-xsmall-zeroshot-v1.1-all-33 | no disponible (familia xsmall) | no disponible | Clasificacion zero-shot (NLI) | MIT | ONNX |
| MoritzLaurer/deberta-v3-xsmall-zeroshot-v1.1-all-33 | no disponible (familia xsmall) | no disponible | Clasificacion zero-shot (NLI) | no disponible en la informacion | safetensors/ONNX (original) |
| DeBERTa-v3-base (variantes NLI zero-shot) | mayor que xsmall (dato no confirmado) | no disponible | Clasificacion zero-shot (NLI) | MIT (familia DeBERTa-v3) | safetensors/ONNX |

La comparativa con alternativas de mayor tamano (por ejemplo, variantes base o large de DeBERTa-v3 para zero-shot) no puede cuantificarse con los datos disponibles; la diferencia principal observable es el tamano de pesos y el empaquetado ONNX verificado por hash.

## Limitaciones y advertencias

- Modelo de clasificacion, no generativo: no produce texto libre ni razonamiento multi-paso.
- Pensado para lineas cortas de dialogo; el comportamiento con textos largos no esta documentado.
- No se especifica la lista de idiomas soportados; el modelo original se describe como multilingue, pero no hay confirmacion en esta ficha.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificaciones erroneas cuando las etiquetas son ambiguas o el texto es muy corto.
- La calidad depende fuertemente de la formulacion de las etiquetas; no hay guias publicadas en la informacion disponible.
- Los ficheros estan fijados por SHA-256: cualquier modificacion o version nueva se publica bajo otro nombre, lo que exige actualizar referencias.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo original de Moritz Laurer, ya que la informacion no detalla su licencia.
- No se documentan sesgos especificos ni evaluaciones de robustez.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sentientsai/deberta-v3-xsmall-zeroshot-v1.1-all-33
- Modelo original: https://huggingface.co/MoritzLaurer/deberta-v3-xsmall-zeroshot-v1.1-all-33
- Catalogo firmado de Sentients: https://huggingface.co/sentientsai/sentients-catalog
- DeBERTa-v3 (Microsoft): no disponible en la informacion proporcionada
- Papers, blogs, demos o repos adicionales: no disponible en la informacion proporcionada
