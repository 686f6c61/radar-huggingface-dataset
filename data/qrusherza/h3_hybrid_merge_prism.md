# QrusherZA/H3_Hybrid_Merge_Prism

## Resumen

QrusherZA/H3_Hybrid_Merge_Prism es un checkpoint híbrido del modelo de generación conjunta de audio y vídeo MiniMax H3, construido por el usuario QrusherZA mediante la fusión de dos variantes podadas publicadas por Comfy-Org: FL2VA (que actúa como columna vertebral) y Ref2VA (que aporta las proyecciones AdaLN y la capa final). El resultado es un único archivo safetensors de aproximadamente 40,2 GB (37,46 GiB) con 532 tensores, pensado para su uso directo en ComfyUI como modelo de image-text-to-video con audio.

La relevancia de esta ficha es acotada: se trata de un merge de checkpoints sin entrenamiento adicional, publicado por un autor individual y con cero descargas y cero likes en el momento de la consulta. No es un modelo oficial de MiniMax ni de Comfy-Org, sino una variante derivada que aplica una receta de fusión documentada previamente por OliviaRossi sobre entradas ya podadas, con una alineación afín de las curvas de timestep como adaptación propia.

La arquitectura subyacente es un transformer conjunto de audio y vídeo con modulación AdaLN dependiente del timestep, en formato podado de curva compacta (`adaln_t_table`). La licencia es la MiniMax H3 Community License Agreement, que impone restricciones adicionales respecto a licencias permisivas estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer conjunto de audio y vídeo (MiniMax H3), con modulación AdaLN dependiente del timestep |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el checkpoint se distribuye en punto flotante preservando el dtype real de cada tensor; los nombres de origen terminan en `bf16`) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (etiquetada como `other`) |
| Formato de pesos | safetensors de archivo único para ComfyUI, con acondicionamiento podado en forma de curva |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión conjunto de audio y vídeo de la familia MiniMax H3. El checkpoint distribuido emplea el formato podado de ComfyUI, en el que la embedding de timestep se representa mediante una tabla compacta `adaln_t_table` de forma `[1025, 8]` en FP32, consumida por matrices de proyección plegadas. AdaLN genera valores de desplazamiento, escala y compuerta dependientes del timestep que controlan el procesamiento del transformer.

No hay entrenamiento adicional en este release: es exclusivamente un merge de checkpoints. La columna vertebral, las normas, el refinador de tokens, las proyecciones de entrada, `adaln_t_table` y las proyecciones AdaLN de los bloques 0 a 19 se copian íntegramente de FL2VA. Los bloques 20 a 34 aplican una transición smoothstep hacia Ref2VA alineado, con `alpha(i) = t^2(3-2t)` y `t = (i-20)/15`, de modo que el bloque 20 tiene 0 % de B y el bloque 35 alcanza el 100 % de B. Los bloques 35 a 49 usan Ref2VA alineado al 100 % en sus proyecciones AdaLN, mientras que sus pesos de atención y MLP siguen procediendo de FL2VA. Todos los tensores `final_layer.*` se mezclan al 50/50 tras alinear previamente su peso y sesgo AdaLN.

La innovación técnica del build es la alineación afín de las curvas de timestep entre ambos checkpoints. El script resuelve en float64 un problema de mínimos cuadrados `M = argmin ||X M - T_B||^2` con `X = [T_A 1]`, descompone `M` en una matriz `R` de 8x8 y un offset `c`, y transforma la proyección donante mediante `W'_B = W_B R^T` y `b'_B = b_B + W_B c^T`. Se trata de una proyección afín sin restricciones (puede incluir rotación, escalado y cizalladura), sin la restricción ortogonal de Procrustes. El error relativo L2 del ajuste de tabla reportado es de `4.9342639e-05` (aproximadamente 0,004934 %).

## Capacidades

- Generación de vídeo a partir de imagen y texto (pipeline `image-text-to-video`).
- Generación conjunta de audio y vídeo, según la etiqueta `audio-video-generation`.
- Acondicionamiento dual FL2VA/Ref2VA: la columna vertebral aporta la ruta principal y Ref2VA aporta modulación AdaLN progresiva en las capas profundas.
- Integración nativa con ComfyUI mediante archivo safetensors único.
- Aceleración mediante adaptadores horneables como paso separado (el release se distribuye con el adaptador base sin hornear).
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-step ni soporte multilingüe explícito.

## Casos de uso

- Generación de clips de vídeo con audio sincronizado a partir de una imagen de referencia y un prompt textual, usando el pipeline image-text-to-video en ComfyUI con el checkpoint cargado como modelo de difusión.
- Prototipado rápido de pipelines de vídeo generativo en ComfyUI: al ser un archivo único safetensors, se carga directamente en el nodo de modelo de difusión sin pasos de conversión adicionales.
- Experimentación con recetas de fusión de modelos: el checkpoint sirve como referencia reproducible de la receta de OliviaRossi aplicada a entradas podadas, útil para investigadores que estudien técnicas de merge por capas.
- Evaluación comparativa de variantes FL2VA frente a Ref2VA: al conservar la columna vertebral de FL2VA y sustituir solo la modulación AdaLN en las capas profundas, permite aislar el efecto del acondicionamiento en la generación.
- Investigación sobre alineación de curvas de timestep: el método de proyección afín documentado (con error L2 de 0,004934 %) es reutilizable para fusionar checkpoints con tablas AdaLN distintas.
- Pruebas de aceleración con adaptadores: el release permite hornear adaptadores de aceleración como paso separado, lo que facilita medir el impacto en latencia y calidad sin alterar el checkpoint base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta diagnósticos de la fusión: 532 tensores compatibles, error relativo L2 de ajuste de tabla de `4.9342639e-05` y un peor error relativo L2 de ajuste de modulación del donante de `6.6650418e-` (valor truncado en la información proporcionada).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint pesa aproximadamente 40,2 GB en punto flotante, por lo que la carga completa requiere al menos esa cantidad de memoria más overhead de activaciones y contexto.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño del checkpoint, la carga completa en precisión original exige GPUs de clase数据中心 (A100 80 GB, H100 80 GB) o configuraciones multi-GPU.
- ¿Cabe en GPU consumer? No en precisión original: 40,2 GB supera la VRAM de cualquier GPU consumer actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB). Sería necesaria cuantización, no documentada en este release.
- Opciones de despliegue: ComfyUI (formato nativo del checkpoint). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de vídeo de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QrusherZA/H3_Hybrid_Merge_Prism | no disponible | no disponible | safetensors ComfyUI, ~40,2 GB | minimax-h3-community-license-agreement | Hugging Face, 0 descargas |
| Comfy-Org/MiniMax-H3 (FL2VA podado) | no disponible | no disponible | safetensors ComfyUI | minimax-h3-community-license-agreement | Hugging Face (modelo base) |
| Comfy-Org/MiniMax-H3 (Ref2VA podado) | no disponible | no disponible | safetensors ComfyUI | minimax-h3-community-license-agreement | Hugging Face (modelo base) |
| MiniMaxAI/MiniMax-H3 (original) | no disponible | no disponible | no disponible | minimax-h3-community-license-agreement | Hugging Face (modelo original) |
| OliviaRossi/Minimax-H3-Hybrid-DMAD-PDMD | no disponible | no disponible | no disponible | no disponible | Hugging Face (receta de fusión) |

La comparativa se limita a las variantes de la misma familia porque la información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de generación de vídeo con audio.

## Limitaciones y advertencias

- Es un merge de checkpoints sin entrenamiento adicional: la calidad final depende de la receta de fusión, de la alineación afín aplicada y del redondeo numérico del almacenamiento, tal como advierte el propio autor.
- La alineación afín es una proyección de mínimos cuadrados sin restricción ortogonal; puede introducir rotación, escalado y cizalladura no controlados en la modulación donante.
- El valor del peor error de ajuste de modulación del donante aparece truncado en la información disponible (`6.6650418e-`), por lo que no se puede evaluar su magnitud.
- Licencia MiniMax H3 Community License Agreement: no es una licencia permisiva estándar; el uso comercial está sujeto a los términos específicos del acuerdo, que deben revisarse antes de cualquier despliegue en producción.
- Modelo publicado por un autor individual, con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad ni de pruebas de calidad independientes.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se puede confirmar soporte multilingüe.
- No se documentan requisitos de VRAM, latencia ni opciones de cuantización, lo que dificulta planificar un despliegue en producción.
- El tamaño de 40,2 GB en punto flotante impide la ejecución en GPUs consumer sin cuantización, y este release no ofrece variantes cuantizadas.

## Enlaces

- [Hugging Face: QrusherZA/H3_Hybrid_Merge_Prism](https://huggingface.co/QrusherZA/H3_Hybrid_Merge_Prism)
- [Modelo original: MiniMaxAI/MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- [Licencia MiniMax H3 Community License Agreement](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE)
- [Modelo base: Comfy-Org/MiniMax-H3](https://huggingface.co/Comfy-Org/MiniMax-H3)
- [Checkpoint FL2VA podado (fuente A)](https://huggingface.co/Comfy-Org/MiniMax-H3/blob/main/diffusion_models/minimax_h3_fl2va_pruned_bf16.safetensors)
- [Checkpoint Ref2VA podado (fuente B)](https://huggingface.co/Comfy-Org/MiniMax-H3/blob/main/diffusion_models/minimax_h3_ref2va_pruned_bf16.safetensors)
- [Receta de fusión de OliviaRossi](https://huggingface.co/OliviaRossi/Minimax-H3-Hybrid-DMAD-PDMD)
- [Procedencia del podado: multimodalart/MiniMax-H3-Pruned](https://huggingface.co/multimodalart/MiniMax-H3-Pruned)
- [Implementación de MiniMax H3 en ComfyUI](https://github.com/Comfy-Org/ComfyUI/blob/master/comfy/ldm/minimax/model.py)
