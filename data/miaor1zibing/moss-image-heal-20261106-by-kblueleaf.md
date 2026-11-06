# MiaoR1Zibing/MOSS-Image-heal-20261106-by-KBlueLeaf

## Resumen

MOSS-Image-heal es un ajuste fino completo (*full finetune*) del transformer de MOSS-Image-Base, un modelo de difusión texto-a-imagen de aproximadamente 5.080 millones de parámetros desarrollado originalmente por OpenMOSS. Este ajuste, publicado por el usuario MiaoR1Zibing (con el modelo equivalente atribuido a KBlueLeaf), no busca mejorar la calidad visual ni la adherencia al prompt, sino corregir un problema numerico del modelo base: la presencia de canales residuales de magnitud desproporcionada que dificultan la inferencia en precision reducida (fp16).

El modelo base presenta valores maximos en su *residual stream* de hasta 58.411, muy cerca del limite representable en fp16 (65.504), lo que provoca desbordamientos y artefactos numericos en GPUs que no soportan bf16 de forma nativa o eficiente. El ajuste "sana" esa corriente residual reduciendo el valor maximo a 3.083 (unas 21 veces de margen frente al limite fp16), bajando el RMS de la corriente 7,5 veces y eliminando los pesos atipicos que superaban 64 veces el RMS de su tensor. Todo ello manteniendo la salida practicamente identica al modelo base (perdida de flujo 0,4289 frente a 0,4280 y coseno de velocidad 0,9983).

Es relevante porque permite ejecutar un modelo de 5B en fp16 de forma estable en hardware consumer (por ejemplo, RTX 3090) y en ComfyUI, algo problemático con el modelo original. Se distribuye en formato diffusers y como ficheros individuales para ComfyUI en bf16, fp16 e int8 ConvRot, bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (flow matching) para texto-a-imagen, tipo MOSS-Image (`MOSSImageTransformer` en diffusers) |
| Parametros totales | 5.082.308.624 (aprox. 5,08 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; sin ventana de contexto de texto declarada) |
| Tipos de cuantizacion | bf16, fp16, int8 ConvRot (grupo 256) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (diffusers `transformer/`; ficheros unicos para ComfyUI) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion para generacion texto-a-imagen basado en MOSS-Image-Base. La parte entrenada es exclusivamente el transformer; el codificador de texto, el tokenizer, el VAE, el scheduler y el codigo del pipeline son los oficiales del modelo base. El entrenamiento consistio en un ajuste fino completo con dos objetivos adicionales sobre la corriente residual: una perdida de concentracion de escritura (*write concentration*) que penaliza que los subloques de atencion y FFN concentren su salida en pocos canales, y una perdida sobre el RMS de la corriente. A esto se suma un *outlier decay* sobre los pesos que limita el exceso de cada elemento por encima de un multiplo acotado del RMS de su tensor.

El resultado medido sobre 6 muestras de prueba (area 1024^2, forward en bf16, estadisticas en fp32) es una reduccion del mayor valor absoluto de la corriente de 58.411 a 3.083, un RMS medio por bloque de 27,75 a 3,70 y una cuota de energia de los 32 canales mayores de 0,837 a 0,708. En los pesos, los elementos que superaban 64 veces el RMS de su tensor pasan de 349 a 0, y el maximo cociente max/RMS cae de 271,7 a 63,5 (ambos en `time_embedding.2`). La fidelidad al modelo base se mantiene: coseno de velocidad de 0,9983 y perdida de flujo 0,4289 frente a 0,4280. El refiner de texto (`text_embedder.*`) permanece congelado con sus valores originales. No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (pipeline `text-to-image`), con soporte de prompt negativo y CFG.
- Acepta tanto prompts basados en etiquetas (*tags*) como descripciones en lenguaje natural (prompt de tipo *caption*), segun los ejemplos de la model card.
- Inferencia en precision reducida estable: fp16, bf16 e int8 ConvRot, con errores de velocidad relativos de 2,1e-3 (fp16), 1,7e-2 (bf16) e 1,2e-2 (int8 con computo fp16).
- Compatibilidad con ComfyUI mediante ficheros unicos en los formatos bf16, fp16 e int8 ConvRot (qkv fusionado, disposicion de Comfy-Org).
- Compatibilidad con diffusers a traves del modulo `transformer/` (configuracion oficial, bf16).
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo *thinking*; es un modelo exclusivamente generativo de imagen.

## Casos de uso

- Generacion de imagenes en produccion sobre GPUs consumer: al mantener la corriente residual muy por debajo del limite fp16 (3.083 frente a 65.504), permite ejecutar el modelo en fp16 de forma estable en tarjetas como la RTX 3090, donde el modelo base puede desbordar.
- Integracion en ComfyUI para flujos de trabajo de diseno grafico: los ficheros unicos en bf16, fp16 e int8 ConvRot se cargan directamente en el layout de Comfy-Org, lo que facilita incorporar el modelo a grafos existentes sin conversion manual.
- Pipelines de generacion por lotes con requisitos de reproducibilidad numerica: la ausencia de valores no finitos en todos los ficheros (0 en las pruebas) y el error relativo acotado lo hacen adecuado para entornos donde la estabilidad numerica es critica.
- Prototipado rapido de aplicaciones texto-a-imagen en equipos de investigacion: el modelo conserva la salida del base (coseno 0,9983) con licencia Apache 2.0, lo que permite sustituir el base por este ajuste sin cambiar el pipeline ni el codificador de texto.
- Despliegue con cuantizacion int8 en entornos con VRAM limitada: la variante int8 ConvRot reduce el peso del transformer manteniendo un error de velocidad relativo de 1,2e-2 con computo fp16, util para servir el modelo en GPUs de gama media.
- Evaluacion comparativa de tecnicas de "saneamiento" de corrientes residuales: los informes incluidos en `reports/` (estadisticas por bloque, graficas y valores de perdida) sirven como referencia reproducible para investigar outliers en transformers de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card proporciona metricas internas de fidelidad y estabilidad numerica frente al modelo base:

| Metrica | Base | Heal |
|---|---|---|
| Mayor valor absoluto en la corriente residual | 58.411 | 3.083 |
| Margen hasta el maximo fp16 | 1,12x | 21,2x |
| RMS de la corriente, media por bloque | 27,75 | 3,70 |
| RMS de la corriente, ultimo bloque | 65,6 | 12,0 |
| Cuota de energia de los 32 canales mayores | 0,837 | 0,708 |
| Perdida de flujo | 0,4280 | 0,4289 |
| Coseno de velocidad frente al base | 1 | 0,9983 |
| Elementos de peso por encima de 64x RMS | 349 | 0 |

| Fichero | Computo | Error relativo de velocidad (medio / max) | Coseno (min) | Valores no finitos |
|---|---|---|---|---|
| `moss_image_heal_fp16` | fp16 | 2,1e-3 / 2,7e-3 | 0,999996 | 0 |
| `moss_image_heal_bf16` | bf16 | 1,7e-2 / 2,1e-2 | 0,999787 | 0 |
| `transformer/` | bf16 | 1,7e-2 / 2,1e-2 | 0,999787 | 0 |
| `moss_image_heal_int8_convrot` | int8 pesos, fp16 computo | 1,2e-2 / 2,0e-2 | 0,999804 | 0 |
| `moss_image_heal_int8_convrot` | int8 pesos, bf16 computo | 2,1e-2 / 2,9e-2 | 0,999583 | 0 |

## Requisitos de hardware

- VRAM estimada: el transformer tiene unos 5,08 B de parametros; en bf16/fp16 ocupa aproximadamente 10 GB de pesos, y en int8 ConvRot alrededor de 5 GB. A esto hay que sumar el codificador de texto, el VAE y las activaciones del pipeline.
- GPU recomendadas: RTX 3090 (usada en las pruebas de precision de la model card), A100, H100 para despliegue a mayor escala. El modelo esta pensado para funcionar en fp16 estable, lo que amplia la compatibilidad con GPUs sin bf16 nativo.
- Cabe en GPU consumer: si, en tarjetas de 24 GB (RTX 3090, RTX 4090) con holgura en fp16/bf16; la variante int8 reduce el requisito de memoria para GPUs de menor VRAM.
- Opciones de despliegue: diffusers (modulo `transformer/`), ComfyUI (ficheros unicos bf16, fp16 e int8 ConvRot). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion.
- Latencia y throughput: no disponibles en la informacion proporcionada. Los ejemplos de la model card usan 16 pasos, CFG 3 y shift 5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision estable en fp16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-heal | 5,08 B | no disponible | Si (max. corriente 3.083, 21,2x de margen) | Apache 2.0 | Hugging Face (diffusers y ComfyUI) |
| MOSS-Image-Base | aprox. 5 B (misma arquitectura) | no disponible | No de forma fiable (max. corriente 58.411, 1,12x de margen) | Apache 2.0 | Hugging Face (OpenMOSS-Team) |
| MOSS-Image-SFT | aprox. 5 B (misma arquitectura) | no disponible | Existe variante FP16-fixed de KBlueLeaf con reescalado de corriente residual | Apache 2.0 | Hugging Face (OpenMOSS-Team) |

No se dispone de datos de benchmarks comparativos con otros modelos texto-a-imagen de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste no mejora la calidad ni la adherencia al prompt respecto al modelo base; su objetivo es exclusivamente la estabilidad numerica de la corriente residual y de los pesos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor (MiaoR1Zibing) no es el desarrollador original; conviene contrastar con el repositorio atribuido a KBlueLeaf antes de usarlo en produccion.
- El refiner de texto (`text_embedder.*`) permanece congelado y conserva los valores del base, incluidos tensores con cocientes max/RMS elevados (`blocks.0.ffn_down` a 54,7x y `proj` a 37,4x).
- Riesgo de alucinacion visual y de artefactos propios de los modelos de difusion: la model card usa un prompt negativo extenso (calidad, anatomia, manos, dedos, marcas de agua, NSFW) para mitigar resultados deficientes.
- No se declaran idiomas soportados ni limitaciones de contexto; la calidad multilingue de los prompts no esta documentada.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de MOSS-Image-Base conviene verificar las condiciones del modelo base y de los componentes (codificador de texto, VAE) que no forman parte de este ajuste.
- Los datos de rendimiento de la model card se midieron sobre 6 muestras de prueba con una RTX 3090; no constituyen una evaluacion exhaustiva de calidad.

## Enlaces

- Modelo en Hugging Face (MiaoR1Zibing): https://huggingface.co/MiaoR1Zibing/MOSS-Image-heal-20261106-by-KBlueLeaf
- Modelo equivalente atribuido a KBlueLeaf: https://huggingface.co/KBlueLeaf/MOSS-Image-heal
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Repositorio oficial de MOSS-Image: https://github.com/OpenMOSS/MOSS-Image
- Repositorio de entrenamiento KohakuMossTrainer: https://github.com/KohakuBlueleaf/KohakuMossTrainer
- Documentacion sobre canales masivos: https://github.com/KohakuBlueleaf/KohakuMossTrainer/blob/main/docs/concepts/massive-channels.md
- Documentacion sobre saneamiento de corriente y pesos: https://github.com/KohakuBlueleaf/KohakuMossTrainer/blob/main/docs/concepts/stream-healing.md
- Documentacion sobre numerica fp16: https://github.com/KohakuBlueleaf/KohakuMossTrainer/blob/main/docs/concepts/numerics.md
- Paper de referencia (arXiv:2407.06723): https://arxiv.org/abs/2407.06723
