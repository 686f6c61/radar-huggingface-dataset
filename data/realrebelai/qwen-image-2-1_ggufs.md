# realrebelai/Qwen-Image-2.1_GGUFs

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo de difusion **Qwen-Image 2.1**, publicadas por el usuario **realrebelai** (RealRebelAI) bajo el identificador `realrebelai/Qwen-Image-2.1_GGUFs`. No es un modelo de lenguaje ni un modelo original: es una conversion de pesos del checkpoint BF16 empaquetado por **Comfy-Org** (`Comfy-Org/Qwen-Image-2.1`, archivo `qwen_image_2.1_bf16.safetensors`) al formato GGUF, pensada para ejecutar generacion de imagen texto-a-imagen en **ComfyUI** mediante el nodo personalizado **ComfyUI-GGUF** de City96. El modelo base pertenece a la familia Qwen-Image de Alibaba/Qwen.

La aportacion principal del repositorio no es la conversion en si, sino la **politica de precision mixta** que el autor denomina `HQv3`. Segun la model card, una conversion generica `Q4_K_M` con llama.cpp mostraba perdida de calidad visible en estructura fina y anatomia frente a la referencia INT8; para corregirlo, se mantienen en mayor precision las proyecciones sensibles del transformer (atención Q/K/V/Out, `img_mlp.out` y `img_mlp.gate_up`) y varios modulos de nivel superior (`img_in`, `txt_in`, `time_text_embed`, `modulation`, `norm_out`, `proj_out`), mientras el resto del modelo usa el nivel de cuantizacion base solicitado.

El resultado es una escalera de seis cuantizaciones (de Q8_0 a Q2_K) que permite ejecutar un transformer de difusion de **7.115.124.736 parametros (aproximadamente 7,1 mil millones)** en GPUs con VRAM limitada, algo relevante ahora porque reduce el coste de entrada al ecosistema Qwen-Image en hardware de consumo. El transformer declarado usa 32 bloques con dimension oculta de 4096 bajo la arquitectura GGUF `qwen_image`, y conserva el nombrado nativo de tensores de Comfy en lugar de reasignarlo al esquema estilo llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (`general.architecture = qwen_image`), 32 bloques, dimension oculta 4096 |
| Parametros totales | 7.115.124.736 (aproximadamente 7,1 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica al transformer de difusion; la ventana de texto la determina el text encoder de Qwen-Image 2.1, no incluido en este repositorio |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M y Q2_K, todos con politica de precision mixta `HQv3` |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | GGUF (incluye metadatos `comfy.gguf.orig_shape.*` para las tensores reajustados) |
| Modelo base | Qwen/Qwen-Image-2.1 (pesos BF16 empaquetados por Comfy-Org) |
| Pipeline | text-to-image |
| Tamano del repositorio | 36,4 GB (suma de las seis cuantizaciones) |
| Libreria | gguf |

Escalera de cuantizacion declarada en la model card, con la precision efectiva de cada grupo de tensores:

| Archivo | Cuantizacion base | Attention Q/K/V/Out | `img_mlp.out` | `img_mlp.gate_up` |
|---|---|---|---|---|
| Q8_0-HQv3 | Q8_0 | Q8_0 | Q8_0 | Q8_0 |
| Q6_K-HQv3 | Q6_K | Q8_0 | Q8_0 | Q8_0 |
| Q5_K_M-HQv3 | Q5_K_M | Q8_0 | Q8_0 | Q6_K |
| Q4_K_M-HQv3 | Q4_K_M | Q8_0 | Q8_0 | Q5_K |
| Q3_K_M-HQv3 | Q3_K_M | Q6_K | Q6_K | Q4_K |
| Q2_K-HQv3 | Q2_K | Q5_K | Q5_K | Q3_K |

## Arquitectura y entrenamiento

El objeto de este repositorio es unicamente el **transformer de difusion** de Qwen-Image 2.1. Los pesos se convirtieron desde el checkpoint BF16 de Comfy-Org y conservan el nombrado nativo de tensores de Comfy (`attn.to_q`, `attn.to_k`, `attn.to_v`, `attn.to_out.0`, `img_mlp.gate_up`, `img_mlp.out`), de modo que no requiere reasignacion de nombres tras la conversion. La model card indica que la arquitectura GGUF declarada es `qwen_image`, con 32 bloques transformer y dimension oculta de 4096. Cuando una tensor debe reajustarse fisicamente para cumplir los requisitos de cuantizacion de GGUF, la forma logica original se conserva en los metadatos `comfy.gguf.orig_shape.*`, que ComfyUI-GGUF usa al cargar el modelo.

La innovacion tecnica destacable es la politica `HQv3`: en lugar de aplicar un unico nivel de cuantizacion a todas las tensores como haria una conversion generica de llama.cpp, se reservan niveles mas altos para las proyecciones de atención y para dos proyecciones del MLP de imagen, y se mantienen en alta precision los modulos `img_in`, `txt_in`, `time_text_embed`, `modulation`, `norm_out` y `proj_out`, ademas de las tensores de norma y otras tensores pequenas. El autor afirma haber validado el resultado con una prueba A/B del build `Q4_K_M` corregido frente a la referencia INT8, con ajustes de generacion identicos, observando una recuperacion sustancial de anatomia, detalle facial y consistencia estructural.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni el uso de RLHF o DPO: esos detalles corresponden al modelo base Qwen-Image 2.1 y no se documentan en este repositorio, que es exclusivamente una conversion de pesos.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) en ComfyUI, usando el flujo de trabajo estandar de Qwen-Image 2.1.
- Edicion y manipulación de imagen en la medida en que lo permita el modelo base Qwen-Image 2.1 y el workflow de ComfyUI empleado (la model card menciona "edit fidelity" entre los aspectos sensibles a la cuantizacion).
- Ejecucion en entornos con VRAM limitada gracias a los seis niveles de cuantizacion disponibles, desde Q8_0 hasta Q2_K.
- Carga directa en ComfyUI mediante ComfyUI-GGUF, sin reasignacion de nombres de tensores y con soporte de las formas logicas originales via `comfy.gguf.orig_shape.*`.
- Compatibilidad con los componentes estandar del ecosistema Qwen-Image 2.1 (text encoder, VAE, conditioning y sampler) sin modificaciones en el workflow.
- Capacidades de prompt adherence, tipografia y coherencia de texturas: la model card las identifica explicitamente como areas afectadas por la cuantizacion, de lo que se deduce que el modelo base las soporta.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, audio, vision de entrada ni modo thinking: no aplican a un transformer de difusion.

## Casos de uso

- **Generacion de imagenes en GPU de consumo**: un usuario con una RTX 3060 de 12 GB o similar puede cargar la variante Q4_K_M-HQv3 o Q3_K_M-HQv3 en ComfyUI y generar imagenes sin necesidad de una GPU profesional, algo inviable con el checkpoint BF16 completo.
- **Prototipado rapido de conceptos visuales**: equipos de diseno pueden iterar sobre prompts con la variante Q2_K o Q3_K_M cuando solo necesitan explorar composicion y encuadre, y subir a Q5_K_M o Q6_K para el render final, aprovechando que todas las variantes comparten el mismo workflow de ComfyUI.
- **Pipelines de generacion por lotes en servidores con VRAM ajustada**: un servicio que genere cientos de imagenes al dia puede desplegar Q4_K_M-HQv3 para maximizar el numero de instancias concurrentes por GPU, aceptando una perdida minima de detalle fino frente al BF16.
- **Renderizado final de alta fidelidad**: para piezas de marketing o ilustracion donde el detalle anatomia y la tipografia son criticos, usar Q8_0-HQv3 o Q6_K-HQv3 como sustituto practico del checkpoint INT8/BF16 cuando no se dispone de memoria para este ultimo.
- **Integracion en herramientas de autor para artistas**: al cargarse como modelo de difusion GGUF en ComfyUI, encaja en interfaces tipo nodo grafico donde el artista controla sampler, CFG y resolucion sin tocar codigo.
- **Investigacion sobre cuantizacion de modelos de difusion**: la escalera `HQv3` y la comparacion A/B documentada frente a INT8 sirven como caso de estudio reproducible para medir el impacto de la precision mixta en calidad perceptual de transformers de difusion.
- **Despliegue en estaciones de trabajo sin GPU de datacenter**: combinado con los niveles Q2_K o Q3_K_M, permite mantener un flujo de generacion de imagen operativo en equipos con 6-8 GB de VRAM, a costa de degradacion en manos, anatomia y tipografia.
- **Evaluacion comparativa de tecnicas de cuantizacion**: un investigador puede contrastar estas conversiones con cuantizaciones genericas del mismo modelo base para cuantificar la mejora atribuible a la proteccion de capas sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe una prueba A/B cualitativa del build `Q4_K_M-HQv3` frente a la referencia INT8 (con los mismos ajustes de generacion), sin cifras de FID, CLIP score, SSIM ni metricas equivalentes, y sin comparaciones numericas frente a otros modelos.

## Requisitos de hardware

Los tamanos de pesos por nivel de cuantizacion no se publican de forma individual en la informacion disponible (solo el total del repositorio, 36,4 GB). Las cifras siguientes son **estimaciones orientativas** derivadas del numero de parametros declarado (aproximadamente 7,1 B) y del sobrecoste esperable de la politica de precision mixta; no proceden de datos publicados por el autor.

- **Q8_0-HQv3**: aproximadamente 7,5-8 GB de pesos; VRAM total recomendada de 12-16 GB, contando el text encoder de Qwen-Image 2.1 y el VAE.
- **Q6_K-HQv3**: aproximadamente 6-6,5 GB de pesos; VRAM total recomendada de 10-14 GB.
- **Q5_K_M-HQv3**: aproximadamente 5-5,5 GB de pesos; VRAM total recomendada de 8-12 GB.
- **Q4_K_M-HQv3**: aproximadamente 4,5-5 GB de pesos; es la variante recomendada por el autor para la mayoria de usuarios; VRAM total recomendada de 8-10 GB.
- **Q3_K_M-HQv3**: aproximadamente 3,5-4 GB de pesos; VRAM total recomendada de 6-8 GB.
- **Q2_K-HQv3**: aproximadamente 2,5-3 GB de pesos; pensada para sistemas con restricciones de memoria severas; VRAM total recomendada de 6 GB o menos.
- **Cabe en GPU de consumo**: si, previsiblemente en tarjetas de 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090) con las variantes Q2_K a Q5_K_M. En GPUs de 6 GB solo serian viables los niveles mas bajos y probablemente con offload a RAM.
- **GPU de gama profesional**: A100, H100 y similares permiten ejecutar sin problemas las variantes Q8_0 o Q6_K, e incluso varias instancias concurrentes con cuantizaciones menores.
- **Opciones de despliegue**: ComfyUI con el nodo ComfyUI-GGUF (soporte oficial del repositorio), tanto en instalacion portable de Windows como en instalaciones nativas de Linux. No se documenta soporte para vLLM, llama.cpp como runtime de inferencia, Ollama ni TGI, dado que el modelo objetivo es un transformer de difusion y no un LLM.
- **Latencia y throughput**: no disponible. Dependen de la GPU, de la resolucion de imagen, del numero de pasos de muestreo y del text encoder empleado, y no se proporcionan mediciones en la informacion disponible.

## Comparativa con modelos similares

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| realrebelai/Qwen-Image-2.1_GGUFs (este repositorio) | 7,1 B | No aplica | Prueba A/B cualitativa frente a INT8 del Q4_K_M-HQv3; sin cifras | No disponible | Publico en HuggingFace; 2062 descargas, 15 likes |
| Comfy-Org/Qwen-Image-2.1 (BF16) | Mismo modelo base, sin cuantizar | No aplica | Referencia de maxima calidad (BF16) | No disponible en la informacion proporcionada | Publico en HuggingFace |
| Cuantizacion generica Q4_K_M estilo llama.cpp del mismo modelo | 7,1 B | No aplica | Segun el autor, perdida visible de estructura fina y anatomia frente a INT8 | Depende del conversor empleado | Disponible mediante herramientas genericas de conversion a GGUF |
| Cuantizaciones GGUF de modelos de difusion del ecosistema ComfyUI-GGUF (por ejemplo, familia FLUX.1 de City96) | No disponible | No aplica | No disponible | No disponible | Publicas en HuggingFace |

La comparacion directa con otras familias de modelos de generacion de imagen no puede establecerse con rigor porque la informacion disponible no incluye benchmarks numericos ni especificaciones de las alternativas.

## Limitaciones y advertencias

- **Son cuantizaciones no oficiales**: la propia model card lo indica expresamente. No estan respaldadas por Qwen ni por Comfy-Org.
- **Licencia sin declarar**: el repositorio no especifica licencia. Antes de un uso comercial es imprescindible verificar la licencia del modelo base `Qwen/Qwen-Image-2.1` y del empaquetado de Comfy-Org, que son la fuente de los derechos sobre los pesos.
- **Degradacion por cuantizacion**: los niveles bajos pueden afectar a detalle fino, manos y anatomia, tipografia, adherencia al prompt, fidelidad de edicion y consistencia de texturas. El autor recomienda subir un nivel de cuantizacion si se observa degradacion apreciable.
- **Q2_K y Q3_K_M**: estan destinadas a sistemas con memoria muy limitada y, segun el autor, pueden seguir mostrando perdida de calidad creciente pese a las capas protegidas en alta precision.
- **Dependencia de componentes externos**: el repositorio contiene unicamente el modelo de difusion. Requiere el text encoder, el VAE y el resto de componentes del workflow de Qwen-Image 2.1, ademas del nodo ComfyUI-GGUF y sus dependencias de Python.
- **Sin datos de sesgo ni de alucinacion**: no se publica informacion sobre sesgos demograficos, estilisticos o culturales del modelo base en esta fuente. Al tratarse de generacion de imagen, el riesgo equivalente es la produccion de contenido estereotipado, sesgado o factualmente incorrecto en la representacion visual.
- **Idiomas no documentados**: no se especifica que idiomas admite el text encoder en este repositorio, por lo que el rendimiento multilingue en los prompts no puede garantizarse.
- **Riesgo de compatibilidad**: la preservacion del nombrado nativo de tensores de Comfy implica que estas cuantizaciones estan pensadas para ComfyUI-GGUF; su uso en otros runtimes de GGUF no esta documentado y podria fallar.
- **Ausencia de benchmarks**: no hay metricas objetivas publicadas, por lo que la afirmacion de mejora frente a una conversion generica se apoya solo en una comparacion visual A/B descrita por el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/realrebelai/Qwen-Image-2.1_GGUFs
- Modelo base en HuggingFace (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Repositorio de ComfyUI-GGUF (City96): https://github.com/city96/ComfyUI-GGUF
- No se han encontrado en la busqueda web enlaces adicionales relevantes sobre este modelo; los resultados obtenidos correspondian a dominios sin relacion con la IA open source.
