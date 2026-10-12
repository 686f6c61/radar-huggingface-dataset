# darkmaniac7/Qwen3.5-27B-MNN

## Resumen

Qwen3.5-27B-MNN es una conversión al formato MNN del modelo Qwen/Qwen3.5-27B, publicada por el usuario darkmaniac7 como espejo byte a byte del repositorio taobao-mnn/Qwen3.5-27B-MNN (commit `d0a9e927a1`). El repositorio no contiene pesos en safetensors ni GGUF, sino el tronco del modelo cuantizado en binarios propietarios de MNN (`llm.mnn.weight`, 16,02 GB) más embeddings en bf16 (2,54 GB) y un codificador visual de 261 MB. El objetivo declarado es la ejecución en dispositivo (on-device), tanto en CPU de móvil como en equipos de escritorio, mediante el runtime MNN.

La aportación propia respecto al espejo original es un cabezal opcional de predicción multi-token (MTP, *multi-token prediction*) exportado directamente desde el checkpoint de Qwen/Qwen3.5-27B, con vocabulario de borrador de 32k tokens y cuantización de 4 bits. Este cabezal se usa con decodificación especulativa en la ruta CPU de MNN dentro de TokForge, con longitud de borrador 1. El tronco verifica cada token propuesto, de modo que el cabezal nunca introduce un token que el tronco no habría elegido.

El modelo es relevante para quien necesite desplegar un LLM de gran tamaño en hardware sin GPU dedicada o en entornos de borde, aceptando a cambio la dependencia del ecosistema MNN y la ausencia de datos públicos de benchmarks. La licencia Apache-2.0 se hereda tanto del modelo base como de la conversión original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; conversión MNN de Qwen/Qwen3.5-27B (transformador, con módulos MTP presentes en el modelo base y componente visual separado) |
| Parametros totales | 27 000 millones según la denominación del modelo base (no se proporciona desglose verificado en la información disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits con bloque de 64 (`--quant_bit 4 --quant_block 64`) para el cabezal MTP exportado; embeddings en bf16; no se detalla la cuantización exacta del tronco |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`, `llm.mnn.json`, `embeddings_bf16.bin`, `visual.mnn`, `visual.mnn.weight`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre el entrenamiento: la model card no documenta número de tokens, composición del dataset ni si hubo RLHF, DPO u otra fase de alineamiento. Lo único verificable es que se trata de una conversión cuantizada (relación `base_model_relation: quantized`) realizada con las herramientas de exportación MNN y que el tronco es idéntico byte a byte al publicado por el equipo taobao-mnn (los sha256 de cada fichero coinciden con el original).

La innovación destacable del repositorio es el cabezal MTP. Se exportó desde Qwen/Qwen3.5-27B (commit `fc05daec18b0`) con el comando `llmexport.py --path <HF checkpoint> --export mnn --mtp --mtp_only --quant_bit 4 --quant_block 64 --mtp_vocab_file vocab_v32k.json`, generando un vocabulario de borrador de 32 000 tokens con identificadores int32 (`mtp-v32k.mnn.vocab`, 132 KB) y un peso de 371 MB. Se integra con `speculative_type: "mtp"`, `mtp_model: "mtp-v32k.mnn"` y `draft_predict_length: 1`. La presencia de `visual.mnn` y `visual.mnn.weight` indica que el paquete incluye un codificador visual, aunque no se documenta su arquitectura ni su resolución de entrada.

## Capacidades

- Generación de texto y conversación multi-turno mediante el runtime MNN, con el tronco heredado de Qwen3.5-27B.
- Procesamiento de imagen: el repositorio incluye binarios de un componente visual (`visual.mnn` y `visual.mnn.weight`, 261 MB), lo que apunta a capacidades multimodales, aunque no se detalla su alcance en la model card.
- Decodificación especulativa con cabezal MTP opcional: borrador de 1 token con vocabulario de 32k, verificado siempre por el tronco.
- Ejecución en dispositivo: la combinación de etiquetas (`on-device`, `mobile`, `mtp`) y el formato MNN apuntan a despliegue en CPU de móvil y de escritorio.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo *thinking* explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional sin conexión en móvil: el paquete MNN está pensado para ejecución en CPU de teléfono, de modo que un asistente puede funcionar sin enviar datos a la nube; la aceptación del borrador MTP en tareas de chat es del 63% en las pruebas del autor, por lo que la ganancia de velocidad en este escenario es la más moderada de las medidas.
- RAG en dispositivo sobre documentación local: con una tasa de aceptación del borrador del 97% en la prueba de RAG, es el escenario donde el cabezal MTP aporta más aceleración relativa, adecuado para consultar manuales o bases documentales internas sin GPU.
- Autocompletado de código en el editor: la aceptación del 94% en la prueba de código indica que el borrador MTP acierta casi siempre en este dominio, lo que reduce el coste por token generado en flujos de completado.
- Asistencia y recomendaciones (advice): con un 70% de aceptación, encaja en aplicaciones de soporte guiado donde el texto es predecible pero no tan estructurado como el código.
- Procesamiento de documentos con componente visual: al incluir `visual.mnn`, el paquete puede emplearse para tareas de comprensión de imagen o documento en local, siempre que se valide el comportamiento real del codificador visual.
- Despliegue en entornos aislados o con requisitos de privacidad estrictos: al no requerir llamadas a API externas y estar bajo Apache-2.0, permite integraciones en intranets, equipos médicos o industriales sin salida a internet.
- Servidor de inferencia CPU de bajo coste: el tronco cabe en unos 19 GB de memoria, por lo que es viable en un nodo sin GPU dedicada, con coste energético y de adquisición inferior al de un nodo con acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni equivalentes en la model card). El autor sí publica datos de aceptación del borrador MTP medidos con el tronco de este repositorio en la ruta CPU de MNN, decodificación greedy, profundidad 1 y 96 tokens; se refieren a la proporción de tokens propuestos que el tronco aceptó, no a la calidad del modelo:

| Escenario | Tokens del borrador aceptados por el tronco |
|---|---|
| Codigo | 94% |
| RAG | 97% |
| Advice | 70% |
| Chat | 63% |

La model card indica además que TokForge comprueba en cada teléfono si el cabezal acelera realmente las respuestas antes de activarlo, lo que implica que la ganancia no está garantizada en todo hardware.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: alrededor de 19 GB sumando el tronco (16,02 GB), los embeddings en bf16 (2,54 GB) y el codificador visual (0,26 GB), más el cabezal MTP opcional (0,37 GB) y el espacio de trabajo del runtime. Cifra estimada a partir del tamaño de los ficheros, no confirmada por el autor.
- GPU: no se documentan GPU recomendadas. Por tamaño, una GPU de 24 GB (RTX 3090, RTX 4090, A10G de 24 GB) quedaría muy ajustada; A100 de 40 GB o H100 ofrecen margen holgado. El destino principal declarado es CPU, no GPU.
- GPU de consumo: solo cabe en modelos con 24 GB o más de VRAM si se ejecuta la ruta GPU; en tarjetas de 8-16 GB no entra con la cuantización incluida.
- Despliegue: runtime MNN (librería `mnn`) y la ruta MNN-LLM/TokForge. Los pesos no están en safetensors ni GGUF, por lo que no son cargables directamente en vLLM, llama.cpp, Ollama ni TGI sin una conversión previa.
- Latencia y throughput: no disponibles. El único dato indirecto es la tasa de aceptación del borrador MTP por escenario, que afecta a la latencia sin cuantificarla en tokens por segundo.
- Almacenamiento: 19,2 GB de repositorio, con `llm.mnn.weight` (16,02 GB) como fichero dominante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| darkmaniac7/Qwen3.5-27B-MNN | 27B según denominación del base | no disponible | sin benchmarks; aceptación MTP 63-97% según tarea | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| taobao-mnn/Qwen3.5-27B-MNN | idénticos (tronco byte a byte) | no disponible | sin benchmarks; sin cabezal MTP añadido | apache-2.0 | HuggingFace, conversión de referencia |
| Qwen/Qwen3.5-27B | 27B | no disponible | no disponible | no disponible en esta ficha | checkpoint original en HuggingFace, origen de la conversión y del cabezal MTP |

No se dispone de información sobre otros modelos comparables de la misma categoría (LLM cuantizados para ejecución en dispositivo en formato MNN) dentro del material proporcionado.

## Limitaciones y advertencias

- No hay ningún benchmark publicado: es imposible comparar su calidad con alternativas a partir de la información disponible.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación de la comunidad ni informes independientes de funcionamiento.
- Sesgos conocidos: no disponibles. Al ser una conversión del modelo base, hereda los sesgos de Qwen3.5-27B, que no se documentan aquí.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican los riesgos habituales de un LLM de 27B sin datos de evaluación.
- Idiomas soportados: no declarados. No se puede asumir un rendimiento correcto en castellano sin una evaluación previa.
- Longitud de contexto: no declarada, lo que impide planificar casos de uso que dependan de ventanas largas.
- El cabezal MTP es opcional y su utilidad depende del dispositivo: la propia model card indica que TokForge comprueba en cada teléfono si acelera antes de usarlo, y la aceptación cae al 63% en conversación.
- Los datos de aceptación MTP se midieron en condiciones concretas (ruta CPU de MNN, greedy, profundidad 1, 96 tokens) y no son extrapolables a otras configuraciones de muestreo o de hardware.
- Los pesos en formato MNN atan el despliegue al ecosistema MNN; migrar a vLLM, llama.cpp u Ollama exige reconvertir desde el checkpoint original.
- Atribución: la conversión y el crédito corresponden al equipo taobao-mnn; este repositorio solo añade el cabezal MTP. Cualquier uso en producción debería partir del repositorio original salvo que se necesite específicamente el MTP.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-27B, no reproducidas en esta ficha.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/darkmaniac7/Qwen3.5-27B-MNN
- Conversión original (tronco idéntico, commit `d0a9e927a1106c795b4c06bbeffb995327bbe488`): https://huggingface.co/taobao-mnn/Qwen3.5-27B-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Commit del checkpoint base usado para exportar el cabezal MTP: `fc05daec18b0a78c049392ed2e771dde82bdf654`
- Busqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos corresponden a foros y documentación de Arduino y no guardan relación con la ficha.
