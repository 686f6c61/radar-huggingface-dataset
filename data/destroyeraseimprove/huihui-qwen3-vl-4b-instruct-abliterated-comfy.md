# DestroyEraseImprove/Huihui-Qwen3-VL-4B-Instruct-abliterated-comfy

## Resumen

Huihui-Qwen3-VL-4B-Instruct-abliterated-comfy es un paquete de pesos cuantizados del modelo vision-lenguaje Huihui-Qwen3-VL-4B-Instruct-abliterated, publicado por el usuario DestroyEraseImprove. No se trata de un modelo nuevo: es una redistribucion del modelo de huihui-ai (a su vez derivado de Qwen/Qwen3-VL-4B-Instruct) en tres formatos listos para usar en ComfyUI, con el objetivo de servir como text encoder multimodal en flujos de generacion de imagen.

El modelo base es un transformer vision-lenguaje de 4B parametros de la familia Qwen3-VL, con la parte de texto sometida a un proceso de abliteration (eliminacion de direcciones de rechazo en el espacio de activaciones) que reduce los sesgos de censura del modelo original. El encoder visual no fue modificado, por lo que el comportamiento perceptivo es identico al del modelo upstream de Qwen.

La relevancia de este repositorio es practica: resuelve el problema de integrar un VLM abliterado en ComfyUI sin necesidad de convertir pesos manualmente. Ofrece una version BF16 de un solo archivo, una version FP8 con escala por tensor y una version INT8 con rotacion Hadamard (ConvRot) pensada para aprovechar los tensor cores INT8 nativos de las GPUs RTX 30/40/50, donde FP8 se emula por software.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL); sin detalles adicionales en la informacion disponible |
| Parametros totales | 4B (segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, FP8 (E4M3FN, escala por tensor), INT8 ConvRot (escala por fila, grupo 256) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 single-file, FP8 scaled, INT8 ConvRot) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-VL-4B-Instruct, un transformer vision-lenguaje de la familia Qwen3-VL. La model card de este repositorio no aporta detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF/DPO) aplicadas por Qwen. Lo que si se documenta es el proceso de abliteration: se aplico unicamente a la parte de texto, dejando el encoder visual intacto y funcionalmente identico al upstream.

La innovacion tecnica de este repositorio esta en la cuantizacion. La version FP8 aplica cuantizacion abs-max por tensor a las 252 proyecciones lineales del modelo de lenguaje (q/k/v/o_proj y gate/up/down_proj en todas las capas), manteniendo embeddings, layer norms, biases y todo el encoder visual en BF16; el error relativo medio de ida y vuelta es de aproximadamente 2,3%. La version INT8 ConvRot aplica cuantizacion por fila con rotacion Hadamard de grupo 256 para distribuir outliers antes de cuantizar, se genera directamente desde el BF16 (no desde FP8) y protege el primer bloque transformer y el encoder visual en BF16. La eleccion de escala por fila (`weight_scale` con forma `(N, 1)`) es lo que permite aplicar LoRAs en tiempo de ejecucion sin degradar a INT8 tensorwise.

## Capacidades

- Generacion de texto e instrucciones en formato conversacional (modelo Instruct).
- Comprension de imagenes y texto combinados (pipeline image-text-to-text).
- Razonamiento multimodal: descripcion de imagenes, respuesta a preguntas visuales y tareas de vision-lenguaje.
- Capacidad de generar descripciones y prompts detallados a partir de imagenes, util como text encoder en ComfyUI.
- Integracion nativa en ComfyUI mediante el nodo Qwen3-VL Text Encoder.
- Soporte de cuantizacion INT8 ConvRot nativa en ComfyUI 0.27.0 o superior.
- Comportamiento del encoder visual identico al Qwen3-VL-4B-Instruct original.
- Tool calling, agentes, thinking mode y capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Text encoder multimodal en ComfyUI: el uso principal documentado. Se coloca el archivo FP8 o INT8 en `models/text_encoders/` y se selecciona en el nodo Qwen3-VL Text Encoder, emparejado con un modelo de difusion compatible y un sampler.
- Generacion de imagenes guiada por imagen de referencia: al conservar el encoder visual intacto, el modelo puede describir y condicionar la generacion a partir de una imagen de entrada dentro de un flujo de ComfyUI.
- Flujos de trabajo con LoRA en tiempo de ejecucion: la variante INT8 ConvRot usa escala por fila, lo que permite aplicar LoRAs sin que la cuantizacion degrade silenciosamente a tensorwise.
- Despliegue en GPUs Ampere (RTX 3090): la variante INT8 ofrece entre un 20% y un 30% mas de velocidad en el forward del text encoder que la FP8, porque Ampere carece de tensor cores FP8 nativos.
- Prototipado de pipelines vision-lenguaje sin censura: el proceso de abliteration reduce los rechazos del modelo, util para experimentacion con contenido que el modelo original rechazaria.
- Investigacion sobre cuantizacion: los tres formatos permiten comparar fidelidad (BF16), rendimiento en Ada/Hopper (FP8) y rendimiento en Ampere (INT8 ConvRot) sobre el mismo modelo base.
- Integracion en produccion con transformers: el repositorio declara compatibilidad con la libreria transformers y el tag `endpoints_compatible`, lo que facilita servirlo mediante Inference Endpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento documentados son relativos: en una RTX 3090, la variante INT8 ConvRot es aproximadamente un 20-30% mas rapida en el forward del text encoder que la variante FP8 scaled, con calidad comparable. La conversion FP8 tardo unos 4 segundos en GPU y la INT8 unos 3 minutos en una RTX 3090.

## Requisitos de hardware

- VRAM estimada: BF16 requiere aproximadamente 8,88 GiB solo para pesos; FP8 unos 5,24 GiB; INT8 ConvRot unos 4,72 GiB. A esto hay que sumar activaciones y el encoder visual en BF16.
- GPU recomendadas: RTX 3090 (mejor opcion con INT8 ConvRot por sus tensor cores INT8 nativos), RTX 4090 y RTX 50-series (FP8 o INT8), A100 y H100 para BF16 y FP8.
- Cabe en GPUs de consumo: si, en RTX 3090, 4090 y 5090 con las variantes cuantizadas; la BF16 de 8,88 GiB tambien cabe en GPUs de 12 GB o mas, con margen limitado.
- Opciones de despliegue: ComfyUI (nodo Qwen3-VL Text Encoder, version 0.27.0 o superior para INT8 ConvRot), transformers. Otros motores como vLLM, llama.cpp, Ollama o TGI no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles de forma absoluta; solo la comparacion relativa INT8 frente a FP8 en RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| Huihui-Qwen3-VL-4B-Instruct-abliterated-comfy | 4B | no disponible | BF16, FP8, INT8 ConvRot | Apache 2.0 | Paquete para ComfyUI de un VLM abliterado |
| huihui-ai/Huihui-Qwen3-VL-4B-Instruct-abliterated | 4B | no disponible | safetensors BF16 | Apache 2.0 | Modelo abliterado original, sin empaquetado para ComfyUI |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible | safetensors BF16 | Apache 2.0 | Modelo upstream con alineacion de seguridad estandar |
| qwen3vl_4b_fp8_scaled (referencia de convencion) | 4B | no disponible | FP8 scaled | no disponible | Mismo esquema de cuantizacion FP8 para ComfyUI |

La diferencia principal frente al modelo de huihui-ai es el empaquetado: este repositorio unifica los dos shards en un solo safetensors y anade las variantes FP8 e INT8. Frente al Qwen3-VL-4B-Instruct original, la diferencia es la abliteration del texto y la cuantizacion orientada a ComfyUI.

## Limitaciones y advertencias

- La abliteration elimina direcciones de rechazo, lo que reduce las barreras de seguridad del modelo y puede producir contenido inapropiado; no es adecuado para aplicaciones orientadas al publico sin filtros adicionales.
- Solo se proceso la parte de texto; el encoder visual conserva el comportamiento del modelo original, incluyendo sus posibles sesgos.
- No hay datos publicados de benchmarks de calidad tras la abliteration ni tras la cuantizacion INT8/FP8, mas alla del error relativo medio del 2,3% en FP8.
- La cuantizacion INT8 ConvRot requiere ComfyUI 0.27.0 o superior; en versiones anteriores el archivo no se carga correctamente.
- Si se convierte INT8 sin `--scaling_mode row`, el archivo carga pero las LoRAs aplicadas en tiempo de ejecucion degradan silenciosamente a INT8 tensorwise; conviene verificar los metadatos `convrot`, `per_row` y `convrot_groupsize` tras la conversion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria documentada.
- No se especifican los idiomas soportados ni la longitud de contexto.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado por un modelo abliterado recae en el desplegador.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es inherente a los modelos de 4B y puede aumentar con la cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DestroyEraseImprove/Huihui-Qwen3-VL-4B-Instruct-abliterated-comfy
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3-VL-4B-Instruct-abliterated
- Modelo de origen (Qwen): https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Herramienta de conversion: https://github.com/silveroxides/convert_to_quant
