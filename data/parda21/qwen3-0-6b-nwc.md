# Parda21/Qwen3-0.6B-NWC

## Resumen

Qwen3-0.6B-NWC es un checkpoint de Qwen/Qwen3-0.6B cuyos pesos —todas las capas lineales y el embedding atado— se almacenan en formato NWC (Neural Weight Compression), una compresión sin pérdidas de BF16 que se decodifica dentro del propio kernel CUDA de multiplicación matriz-vector (matvec). Lo publica el usuario Parda21, autor de la librería `neural-weight-compression` (`nwc`). El problema que resuelve es el consumo de memoria y VRAM en inferencia: reduce el peso de 1,19 GB a 0,82 GB (ratio 0,690) y la VRAM en batch 1 de 1,19 GB a 0,83 GB, manteniendo los pesos idénticos bit a bit al modelo original.

No es un modelo reentrenado ni afinado: es una conversión de formato. Su función declarada es servir de prueba rápida (0,8 GB de descarga, un minuto) para validar la instalación de `nwc` antes de pasar a Parda21/Qwen3-4B-NWC, donde la ganancia de velocidad sí se manifiesta. En una GPU grande el modelo de 0,6B no es más rápido que el nativo, porque sus matrices son pequeñas (1024 × 2048 y menores) y la decodificación está limitada por el lanzamiento de kernels, no por el ancho de banda de memoria; en ese escenario NWC ahorra memoria, pero no tiempo.

El modelo hereda de Qwen3-0.6B su arquitectura y capacidades, ya que la conversión es sin pérdidas. La librería se distribuye como `pip install neural-weight-compression`, con utilidades `nwc.doctor`, `nwc.demo` y `nwc.export`, y requiere GPU NVIDIA con compute capability 7.5 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen/Qwen3-0.6B); pesos almacenados en formato NWC |
| Parametros totales | 821.340.984 (repo safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-0.6B; la informacion proporcionada no la especifica) |
| Tipos de cuantizacion | no aplica en sentido estricto: NWC es compresion sin perdidas sobre BF16; existe un tag "8-bit" en HuggingFace |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato NWC (libreria `nwc`); exportable a BF16 con `python -m nwc.export` |
| Modelo base | Qwen/Qwen3-0.6B |
| Tamano del repositorio | 0,8 GB |
| Peso de los pesos | 0,82 GB (ratio de compresion 0,690 frente a 1,19 GB en BF16) |
| Libreria | `nwc` (neural-weight-compression) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B: un transformer decoder-only denso con embedding atado. El model card confirma el tamano de sus matrices (1024 × 2048 y menores), coherente con una dimension oculta de 1024. No hay reentrenamiento ni ajuste: el proceso documentado es cargar el modelo base en BF16 con `AutoModelForCausalLM.from_pretrained`, llamar a `fuse(model)` y `convert(model)` de la libreria `nwc`, y guardar con `save_pretrained`. No se describe en la informacion disponible ningun uso de RLHF, DPO ni数据集 adicional.

La innovacion tecnica es el propio formato NWC: los pesos comprimidos se decodifican al vuelo dentro del kernel CUDA de matvec, de modo que no hace falta descomprimir el checkpoint completo a memoria. La compresion es sin perdidas, por lo que los pesos resultantes son bit-identical respecto al original. Como contrapartida, la decodificacion requiere GPU NVIDIA moderna (compute capability 7.5 o superior; medido en 8.0+), driver CUDA 12.6 o superior y PyTorch con CUDA.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline text-generation; tag "conversational").
- Las capacidades funcionales del modelo son las de Qwen/Qwen3-0.6B, dado que los pesos son identicos bit a bit; no se detallan capacidades adicionales en la informacion proporcionada.
- Inferencia con pesos comprimidos en GPU NVIDIA compatible, sin necesidad de descomprimir el checkpoint a un formato BF16 completo.
- Exportacion a un checkpoint BF16 estandar (bit-identical) para herramientas que no conocen el formato NWC.
- No se documentan en la informacion disponible soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Validacion rapida de entorno de inferencia NWC: con 0,8 GB de descarga, sirve para comprobar GPU, driver, libreria y kernel (`python -m nwc.doctor`) antes de invertir tiempo en el modelo de 4B.
- Despliegue en GPUs de gama baja o consumer: con 0,83 GB de VRAM en batch 1, cabe holgadamente en tarjetas con 4, 6 u 8 GB, incluidos portatiles con GPU NVIDIA RTX 30/40 series.
- Serving multi-tenant: el bajo consumo de VRAM permite ejecutar varias instancias del modelo en una sola GPU de gama media, util para entornos de demostracion o pruebas A/B.
- Prototipado de aplicaciones de generacion de texto y conversacion: permite iterar sobre prompts y flujos conversacionales con una huella de memoria minima.
- Integracion en CI/CD: la paridad bit a bit con el modelo base y la utilidad `nwc.export` permiten escribir tests que verifiquen la conversion y detecten regresiones en el kernel.
- Educacion y demos: adecuado para explicar tecnicas de compresion de pesos y decodificacion dentro del kernel sin requerir hardware de gama alta.
- Base para experimentos de ajuste fino de bajo coste: exportando primero a BF16, se puede reutilizar el flujo habitual de HuggingFace sobre un modelo de ~0,82 B parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El model card ofrece unicamente medidas de memoria y velocidad:

| Metrica | Qwen3-0.6B (BF16) | Qwen3-0.6B-NWC |
|---|---|---|
| Peso de los pesos | 1,19 GB | 0,82 GB (ratio 0,690) |
| VRAM en uso, batch 1 | 1,19 GB | 0,83 GB |
| tokens/s (RTX 4070, CUDA graph, greedy) | 196 | 162 |
| Pesos frente al original | — | identicos bit a bit |

Nota de fidelidad: la salida greedy coincide con el modelo BF16 durante los primeros 29 tokens del prompt de referencia; despues ambas divergen en un empate exacto de los dos logits superiores, atribuido al orden de sumatorio en fp32 (diferencia maxima de logit de 0,36 sobre un rango de 28 antes del empate).

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,83 GB en batch 1 (frente a 1,19 GB del BF16).
- GPU recomendadas: cualquier NVIDIA con compute capability 7.5 o superior; medido explicitamente en 8.0+ (RTX 4070 en las pruebas publicadas).
- Cabe sin problema en GPUs consumer: RTX 30 series, RTX 40 series y modelos con 4 GB o mas de VRAM.
- Limitacion de plataforma: el formato NWC necesita GPU NVIDIA y CUDA 12.6 o superior; no hay ruta CPU documentada. Para entornos con CPU o aceleradores no NVIDIA hay que exportar primero a BF16 (`python -m nwc.export`).
- Opciones de despliegue: libreria `nwc` junto a `transformers` y `accelerate`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para el formato NWC. La exportacion a BF16 permite usar esos backends una vez convertido.
- Latencia y throughput: 162 tokens/s en RTX 4070 con CUDA graph y decodificacion greedy (frente a 196 tokens/s del BF16 nativo). El model card indica que en GPUs grandes el modelo de 0,6B no gana velocidad; en la variante de 4B es donde NWC aporta mejoras.

## Comparativa con modelos similares

| Modelo | Parametros | Peso | VRAM batch 1 | Tokens/s (RTX 4070) | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3-0.6B (BF16) | 821.340.984 | 1,19 GB | 1,19 GB | 196 | Apache-2.0 | safetensors BF16 |
| Qwen3-0.6B-NWC | 821.340.984 | 0,82 GB | 0,83 GB | 162 | Apache-2.0 | safetensors NWC |
| Parda21/Qwen3-4B-NWC | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Apache-2.0 | safetensors NWC |

La comparativa directa relevante es contra el propio Qwen3-0.6B en BF16: mismo modelo y mismos pesos, con menor huella de memoria a cambio de una ligera perdida de velocidad en GPU consumer. No se dispone de datos de contexto ni de benchmarks para comparar con otras familias de modelos pequenos.

## Limitaciones y advertencias

- Requiere GPU NVIDIA con compute capability 7.5 o superior, driver CUDA 12.6+ y PyTorch con CUDA; no hay soporte CPU documentado para el formato NWC.
- En GPUs grandes el modelo no es mas rapido que el BF16 nativo: el cuello de botella son los lanzamientos de kernel, no el ancho de banda de memoria.
- Solo se comprimen las capas lineales y el embedding atado; otras partes del modelo no pasan por NWC.
- La salida greedy diverge del modelo BF16 tras los primeros 29 tokens del prompt de referencia por un empate exacto de logits (orden de sumatorio en fp32); en generacion estocastica esta diferencia puede no ser observable, pero conviene verificar paridad si se requiere reproducibilidad exacta.
- Al ser un modelo de ~0,82 B parametros, hereda las limitaciones de Qwen3-0.6B: menor calidad de razonamiento y mayor riesgo de alucinacion que modelos grandes.
- No se publican resultados de benchmarks estandar, sesgos conocidos ni composicion de datos en la informacion proporcionada.
- Restricciones de licencia: Apache-2.0, igual que el modelo base, por lo que se permite uso comercial; no obstante, deben respetarse los terminos de la licencia de Qwen3-0.6B como modelo base.
- Idiomas soportados no especificados en la informacion disponible; la cobertura linguistica es la que aporte el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Parda21/Qwen3-0.6B-NWC
- Repositorio del formato NWC: https://github.com/parda21/NWC
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Version de 4B del mismo autor: https://huggingface.co/Parda21/Qwen3-4B-NWC
