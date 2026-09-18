# linjian257/qwen3vl_32b_minimax_h3_int8_convrot_uncensored-by-linjian257

## Resumen

Este repositorio contiene un codificador de texto cuantizado a INT8 para los flujos de trabajo de MiniMax-H3 en ComfyUI. No es un modelo conversacional ni un modelo de generación de vídeo completo: es únicamente el componente de codificación textual que traduce el prompt a representaciones internas (estado oculto sin normalizar tras la capa 50) que consume el modelo de difusión de MiniMax-H3. Lo publica el usuario linjian257 como derivado comunitario de los pesos BF16 modificados por él mismo, partiendo de los repositorios MiniMaxAI/MiniMax-H3 y Comfy-Org/MiniMax-H3.

La pieza pesa 25.772.287.417 bytes (unos 25,77 GB / 24,00 GiB) e incorpora 1.838 tensores: 468 pesos cuantizados, 359 de ellos con rotación ConvRot (grupo de 256) y 109 sin rotar, además de 434 tensores conservados en BF16. El objetivo declarado es reducir de forma sustancial el tamaño del fichero de pesos manteniendo la compatibilidad con los flujos oficiales de ComfyUI para MiniMax-H3.

Su relevancia es práctica: permite ejecutar el pipeline de texto a vídeo, imagen a vídeo y R2V de MiniMax-H3 en ComfyUI con un codificador de texto aproximadamente la mitad de pesado que la versión BF16, a cambio de depender de un cargador que reconozca de forma nativa el formato INT8 ConvRot. La licencia es de uso exclusivamente personal y de entretenimiento, sin permiso de uso comercial, redistribución ni reventa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3-VL-32B (transformer multimodal de visión y lenguaje) empleada como codificador de texto de MiniMax-H3; configuración detallada no disponible |
| Parametros totales | No disponible (la denominación del repositorio indica 32B; la model card no confirma el recuento) |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 TensorWise (algoritmo `int8_tensorwise` v0.1.0) + ConvRot con group size 256; 434 tensores conservados en BF16 |
| Idiomas soportados | No disponible |
| Licencia | `other` / personal-entertainment-use-only (solo uso personal, entretenimiento, estudio e investigación no comercial) |
| Formato de pesos | safetensors (`qwen3vl_32b_minimax_h3_int8_convrot_uncensored-by-linjian257.safetensors`) |
| Tamano del fichero | 25.772.287.417 bytes (25,77 GB / 24,00 GiB) |
| Numero de tensores | 1.838 en total: 468 cuantizados, 359 con ConvRot, 434 en BF16 |
| Escalas de cuantizacion | FP32, per-channel, a lo largo del eje de características de salida; calculadas por amax, redondeo nearest-even |
| Salida del codificador | Estado oculto sin normalizar tras la capa 50 |
| Autor del derivado | linjian257 |
| Repositorio base | MiniMaxAI/MiniMax-H3, Comfy-Org/MiniMax-H3 |
| Descargas / likes | 0 descargas / 36 likes |
| Fecha de creacion | 2026-08-05 |

## Arquitectura y entrenamiento

El tensor subyacente procede de Qwen3-VL-32B, un transformer multimodal de visión y lenguaje, pero aquí se emplea exclusivamente como torre de texto: el repositorio no incluye cabecera de generación ni configuración de chat, y su salida es el estado oculto sin normalizar de la capa 50. Sobre esa base, linjian257 aplicó una modificación comunitaria en BF16 y después la recuantizó a INT8. La cuantización sigue el esquema `int8_tensorwise` versión 0.1.0: pesos con signo de 8 bits, una escala FP32 por canal de salida (`per_channel` / `out_features`), cálculo por valor absoluto máximo y redondeo nearest-even. Se seleccionaron los pesos bidimensionales aptos bajo los prefijos `model.*` y `visual.*`; los tensores no aptos, como los sesgos, permanecen en su precisión original.

La innovación técnica destacable es la combinación de INT8 TensorWise con ConvRot (group size 256), una rotación de pesos aplicada a 359 tensores que busca mejorar la preservación de la calidad tras la cuantización; los otros 109 tensores cuantizados no llevan rotación. No se documenta el proceso de entrenamiento original de Qwen3-VL-32B ni si hubo RLHF o DPO, ni el volumen o composición de los datos de entrenamiento. La model card tampoco aporta ningún dato sobre ajuste fino adicional del codificador: la intervención declarada se limita a modificación de pesos, cuantización y publicación.

## Capacidades

- Codificación de prompt para generación de vídeo con MiniMax-H3 dentro de ComfyUI, con salida en forma de estado oculto tras la capa 50.
- Integración como nodo `CLIPLoader` con tipo de modelo `minimax` en los flujos T2V, I2V y R2V oficiales.
- Ejecución de cuantización INT8 con ConvRot reconocida de forma nativa por versiones recientes de ComfyUI.
- Conservación de 434 tensores en BF16, lo que evita cuantizar capas sensibles.
- Etiqueta "uncensored" que distingue esta versión, sin garantía de comportamiento homogéneo entre prompts, idiomas o tipos de entrada.
- No dispone de capacidad de chat, de tool calling, de razonamiento multi-paso ni de uso como modelo de lenguaje independiente: la model card lo excluye explícitamente de LM Studio, llama.cpp y vLLM.
- Soporte multilingüe y capacidades de visión: no disponibles como funcionalidad utilizable en este formato.

## Casos de uso

- Texto a vídeo en ComfyUI: el fichero actúa como codificador del prompt en el flujo T2V oficial de MiniMax-H3; se coloca en `ComfyUI/models/text_encoders/` y se selecciona en el `CLIPLoader`, con el resto del pipeline (modelo de difusión y VAE) descargado aparte.
- Imagen a vídeo: en el flujo I2V, este codificador convierte la descripción textual que acompaña a la imagen inicial en las representaciones que guían la animación, manteniendo la compatibilidad con las plantillas de Comfy-Org.
- Flujo R2V de referencia: permite ejecutar la plantilla R2V oficial usando este codificador en lugar del fichero BF16, siempre que el cargador soporte INT8 ConvRot.
- Reducción de huella en disco y de presión de memoria: al ocupar 24,00 GiB frente al equivalente BF16, resulta adecuado para equipos cuyo cuello de botella es el almacenamiento o la carga de pesos, aunque no se garantiza una aceleración concreta.
- Investigación no comercial sobre cuantización: sirve para estudiar el efecto de INT8 TensorWise más ConvRot sobre la fidelidad del condicionamiento textual, comparando con los pesos BF16 del mismo autor o con el fichero INT8 oficial.
- Docencia y demostraciones locales: permite montar un entorno de generación de vídeo de un solo equipo sin recurrir a un codificador de texto de mayor tamaño, dentro de los límites de la licencia personal.
- Validación de compatibilidad de cargadores: útil para comprobar si una versión de ComfyUI y sus dependencias reconocen correctamente los metadatos de ConvRot y las escalas `weight_scale`, escenario en el que la model card advierte de errores o salidas anómalas si el cargador es antiguo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no se acompaña de una comparativa sistemática entre BF16 y el INT8 oficial, ni de evaluaciones de seguridad, ni de métricas de calidad de vídeo de extremo a extremo. Tampoco se compromete ninguna cifra de aceleración.

## Requisitos de hardware

- El fichero de pesos ocupa 24,00 GiB en disco; a la memoria necesaria para cargarlo hay que sumar activaciones, el modelo de difusión de MiniMax-H3 y los VAE de vídeo (y de audio cuando se requiera). Cifra exacta de VRAM: no disponible.
- Como referencia orientativa —no confirmada por el autor—, cargar el codificador completo en memoria exigiría GPUs de gama alta tipo A100 80 GB o H100; en GPUs de 24 GB como la RTX 4090 el uso sería marginal y probablemente dependiente de descarga a CPU y del desglose por capas que aplique ComfyUI.
- Compatibilidad con GPU de consumo: no confirmada; depende del backend, la versión de Torch y de ComfyUI, la configuración de offload y el flujo completo utilizado.
- Despliegue: exclusivamente ComfyUI con soporte nativo de MiniMax-H3 e INT8 ConvRot. No es cargable en LM Studio, llama.cpp ni vLLM, según la propia model card.
- Latencia y throughput: no disponibles. El autor indica que INT8 suele reducir el almacenamiento y la presión de memoria, pero no promete ningún factor de aceleración.

## Comparativa con modelos similares

| Modelo | Rol | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (linjian257) | Codificador de texto para MiniMax-H3 en ComfyUI | INT8 TensorWise + ConvRot (grupo 256), 434 tensores en BF16 | 25,77 GB (24,00 GiB) | Personal-entertainment-use-only, sin uso comercial | HuggingFace, 0 descargas, 36 likes |
| `qwen3vl_32b_minimax_h3_int8_convrot.safetensors` oficial de Comfy-Org | Codificador de texto para MiniMax-H3 en ComfyUI | INT8 ConvRot | No disponible | La del repositorio Comfy-Org/MiniMax-H3 | Comfy-Org/MiniMax-H3 |
| Pesos BF16 modificados por linjian257 | Codificador de texto para MiniMax-H3 en ComfyUI | BF16 sin cuantizar | No disponible (superior al INT8) | No disponible | Base a partir de la cual se generó este derivado |
| Qwen3-VL-32B original | Modelo multimodal de visión y lenguaje | BF16 y otras segun el repositorio | No disponible | La del repositorio Qwen | HuggingFace (Qwen) |

La model card advierte expresamente de que este fichero no es una copia renombrada ni un espejo byte a byte del INT8 oficial, por lo que no deben usarse las huellas del fichero oficial para verificarlo.

## Limitaciones y advertencias

- No es un modelo autónomo: solo contiene el codificador de texto. Sin el modelo de difusión y los VAE correspondientes de MiniMax-H3 no genera nada.
- Dependencia estricta de ComfyUI reciente con soporte nativo de INT8 ConvRot. Un cargador antiguo o incompatible puede fallar o, peor, cargar los pesos de forma incorrecta y producir salidas anómalas sin avisar.
- La cuantización INT8 y las modificaciones comunitarias pueden introducir diferencias sutiles de calidad respecto al BF16 original en seguimiento de instrucciones, estabilidad y fidelidad del resultado.
- La etiqueta "uncensored" es solo un identificador de versión: el autor no garantiza ningún comportamiento concreto y advierte de que el modelo puede producir contenido ofensivo, peligroso, ilegal, engañoso o inapropiado.
- No hay evaluación de sesgos ni de seguridad publicada, ni idiomas declarados, ni longitud de contexto documentada.
- Licencia muy restrictiva: solo uso personal, entretenimiento, estudio e investigación no comercial. Quedan prohibidos el uso comercial, los servicios de pago, el despliegue comercial, la reventa, la redistribución y la sublicencia sin permiso escrito de linjian257.
- Riesgo de confusión al integrarlo: si el fichero se coloca en `models/checkpoints` o `models/diffusion_models` en lugar de `models/text_encoders`, ComfyUI no lo detectará.
- 0 descargas registradas y 36 likes: no existe validación comunitaria amplia del comportamiento de esta variante.

## Enlaces

- Repositorio del modelo: https://huggingface.co/linjian257/qwen3vl_32b_minimax_h3_int8_convrot_uncensored-by-linjian257
- Licencia del modelo: https://huggingface.co/linjian257/qwen3vl_32b_minimax_h3_int8_convrot_uncensored-by-linjian257/blob/main/LICENSE.md
- Repositorio upstream MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repack oficial para ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3
- Organización Qwen: https://huggingface.co/Qwen
- Plantilla de flujo T2V: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_t2v.json
- Plantilla de flujo I2V: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_i2v.json
- Plantilla de flujo R2V: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_r2v.json
