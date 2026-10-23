# AtomicChat/FLUX-3-Image-Klein-GGUF

## Resumen

AtomicChat/FLUX-3-Image-Klein-GGUF es la cuantización en formato GGUF de FLUX 3 Image Klein, el modelo de difusión de 5.548.681.984 parámetros (5,6 B) de Black Forest Labs para generación de imagen a partir de texto y edición con imágenes de referencia. El repositorio lo publica AtomicChat para stable-diffusion.cpp e incluye las tres piezas necesarias para la inferencia local: el modelo de imagen, el codificador de texto Qwen3-VL-4B (`text_encoders/`) y el autoencoder FLUX.2 (`vae/`).

El modelo base unifica generación, edición con una referencia y edición con hasta diez imágenes de referencia en un único conjunto de pesos, destilado a 16 pasos con CFG 1, lo que reduce el coste de muestreo frente a esquemas con más pasos y guiado por classifier-free. El repositorio añade una matriz de importancia (imatrix) propia y publica las mediciones de fidelidad frente a los pesos BF16 junto con las de las cuantizaciones comparables de unsloth y leejet, con el binario y la GPU empleados en la comparación.

Su relevancia práctica está en el tamaño: los ficheros AD-Q5_K (4,44 GB) y AD-Q4_K (3,65 GB) permiten ejecutar un modelo de imagen y edición de 5,6 B en GPU de consumo, con una degradación medida y acotada (LPIPS 0,038 y 0,081 frente a BF16). El repositorio acumula 432 descargas y 12 likes desde su publicación el 20 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para texto-a-imagen y edicion; la informacion disponible no detalla la variante interna de transformer. Destilado a 16 pasos con CFG 1 |
| Parametros totales | 5.548.681.984 (5,6 B) |
| Parametros activos | No aplica: la informacion disponible no lo describe como MoE |
| Longitud de contexto | No disponible (el dato no tiene equivalencia directa en un modelo de difusion). Acepta hasta 10 imagenes de referencia y control de layout por bounding boxes |
| Tipos de cuantizacion | BF16 (referencia), Q8_0, AD-Q5_K, AD-Q4_K, generados con imatrix propia. Por debajo de 3,6 GB el autor no publica fichero propio y remite a UD-Q3_K_XL y UD-Q2_K_XL de unsloth |
| Idiomas soportados | No disponible en los metadatos; la model card solo documenta mediciones de renderizado de texto en chino sobre 8 capitulos |
| Licencia | `flux-kommunity-license` (campo `license: other`, con `LICENSE.md` en el repositorio) |
| Formato de pesos | GGUF para stable-diffusion.cpp y ComfyUI-GGUF; el repositorio incluye modelo de imagen, codificador de texto Qwen3-VL-4B y VAE FLUX.2. Tamano total del repo: 61,1 GB |
| Componentes auxiliares | Codificador de texto Qwen3-VL-4B, autoencoder FLUX.2, prompt upsampler en repositorio aparte |

## Arquitectura y entrenamiento

La informacion disponible describe un modelo de difusion de 5,6 B que cubre en un solo conjunto de pesos tres tareas: generacion texto-a-imagen, edicion con una imagen de referencia y edicion con hasta diez imagenes de referencia, ademas de control de layout mediante bounding boxes. El pipeline completo combina ese modelo de difusion con un codificador de texto Qwen3-VL-4B y un autoencoder FLUX.2, ambos distribuidos en el mismo repositorio. El checkpoint esta destilado a 16 pasos con CFG 1, lo que fija un presupuesto de muestreo constante y bajo por imagen. No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO).

La aportacion tecnica de esta publicacion no es el entrenamiento sino la cuantizacion: AtomicChat parte de los pesos BF16 publicados por Black Forest Labs y construye sus propias matrices de importancia, midiendo cada variante contra el render BF16 de las mismas 48 leyendas y 2 semillas con el mismo ruido inicial. La reproducibilidad esta acotada: un segundo render BF16 de la misma leyenda y semilla se aleja LPIPS 0,0004, de modo que las diferencias reportadas se atribuyen a la cuantizacion y no al muestreo. El autor senala ademas que el codificador de texto afecta a la imagen tanto como el modelo de imagen, y publica un encoder AD-Q4_K que queda un 21% mas cerca del original que el Q4_K_M habitual con el mismo tamano.

## Capacidades

- Generacion de imagen a partir de texto en un unico paso de pipeline, con 16 pasos de difusion y CFG 1.
- Edicion de imagen con una referencia visual.
- Edicion multi-referencia con hasta diez imagenes de referencia en una misma peticion.
- Control de layout mediante bounding boxes sobre la composicion.
- Renderizado de texto dentro de la imagen; se publican mediciones especificas de LPIPS para leyendas que insertan texto en chino (0,011 en Q8_0, 0,033 en AD-Q5_K, 0,070 en AD-Q4_K).
- Integracion con stable-diffusion.cpp como motor de inferencia y con ComfyUI mediante ComfyUI-GGUF.
- Prompt upsampling mediante un modelo auxiliar distribuido aparte (`FLUX-3-Image-Klein-pup-GGUF`).
- Variantes sin filtro de contenido: el autor publica un codificador de texto y un prompt upsampler sin rechazos, y afirma que el pipeline Klein abierto no incorpora filtro de contenido.
- No se documentan en la informacion disponible capacidades de tool calling, agentes ni audio; no son propias de un modelo de difusion.

## Casos de uso

- **Ilustracion y material grafico en local para estudios pequenos**: el modelo completo (imagen + encoder + VAE) cabe en una GPU de consumo en AD-Q4_K, de modo que un estudio puede generar assets sin enviar prompts ni material de referencia a una API externa.
- **Fotografia de producto y catalogo e-commerce**: con hasta diez imagenes de referencia se puede mantener la consistencia de un mismo objeto o modelo en distintas escenas y angulos, sin reentrenar nada por producto.
- **Maquetacion y prototipado de UI o storyboards**: el control por bounding boxes permite fijar la posicion de los elementos principales de la composicion, lo que resulta util para bocetos de interfaz, wireframes ilustrados y guiones graficos.
- **Pipeline por lotes en una sola GPU**: al estar destilado a 16 pasos con CFG 1, el coste por imagen es constante y bajo; un flujo nocturno o de CI puede generar cientos de variantes con un unico nodo y los ficheros AD-Q5_K o AD-Q4_K.
- **Rotulacion y carteleria con texto integrado**: el modelo renderiza texto en la imagen y el autor publica metricas especificas para texto en chino; es adecuado para carteles y mockups donde el copy forma parte de la composicion, aceptando la degradacion documentada.
- **Investigacion sobre cuantizacion de modelos de difusion**: el repositorio publica la metodologia completa (48 leyendas x 2 semillas, LPIPS con intervalo de confianza al 95%, SSIM, PSNR y escala frente a semilla nueva) y los renders en un dataset publico, lo que sirve como referencia reproducible para evaluar nuevas tecnicas de cuantizacion.
- **Entornos con requisitos de privacidad o sin conectividad**: al ejecutarse con stable-diffusion.cpp en local, encaja en instalaciones aisladas donde no se permite el envio de imagenes a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (tipo MMLU, GenEval o similares) en la informacion disponible; al tratarse de un modelo de imagen, las metricas publicadas son de fidelidad de cuantizacion frente a los pesos BF16.

Fidelidad de las cuantizaciones propias frente a BF16 (48 leyendas x 2 semillas, mismo ruido inicial):

| Fichero | Tamano en disco | LPIPS [IC 95%] | vs. semilla nueva | SSIM | PSNR | Texto (zh) |
|---|---:|---|---:|---:|---:|---:|
| BF16 | 11,10 GB | 0 (identico) | 0% | 1,000 | — | 0 |
| Q8_0 | 5,99 GB | 0,014 [0,011; 0,017] | 3% | 0,982 | 34,4 dB | 0,011 |
| AD-Q5_K | 4,44 GB | 0,038 [0,032; 0,044] | 7% | 0,954 | 28,8 dB | 0,033 |
| AD-Q4_K | 3,65 GB | 0,081 [0,069; 0,095] | 15% | 0,903 | 24,4 dB | 0,070 |

Comparacion con otras cuantizaciones del mismo modelo base, medidas con las mismas leyendas, semillas, binario y GPU:

| Fichero | Tamano en disco | LPIPS [IC 95%] | Equivalente propio |
|---|---:|---|---|
| leejet Q8_0 | 6,15 GB | 0,016 [0,012; 0,021] | Q8_0, 5,99 GB: 0,014 |
| unsloth Q8_0 | 6,09 GB | 0,015 [0,012; 0,021] | Q8_0, 5,99 GB: 0,014 |
| unsloth Q6_K | 4,80 GB | 0,035 [0,029; 0,043] | AD-Q5_K, 4,44 GB: 0,038 (el layout propio de 4,78 GB midio 0,035 y no se publico) |
| unsloth UD-Q5_K_XL | 4,48 GB | 0,044 [0,037; 0,052] | AD-Q5_K, 4,44 GB: 0,038 (14% mas cerca) |
| unsloth UD-Q4_K_XL | 3,93 GB | 0,055 [dato truncado en la informacion disponible] | AD-Q4_K, 3,65 GB: 0,081 (unsloth es mejor en este punto) |

## Requisitos de hardware

- **VRAM estimada (estimacion a partir de los tamanos de fichero publicados; el autor no publica cifras de VRAM)**: AD-Q4_K en torno a 8-9 GB contando modelo de imagen, encoder y VAE cuantizados; AD-Q5_K en torno a 9-10 GB; Q8_0 en torno a 11-12 GB; BF16 completo por encima de 20 GB.
- **Cabe en GPU de consumo**: si, al menos en AD-Q4_K y AD-Q5_K, en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB). Q8_0 requiere 16 GB o mas; BF16 queda fuera de la mayoria de tarjetas de consumo.
- **GPU recomendadas**: RTX 4090 o RTX 3090 para BF16 y Q8_0; RTX 4070 / 4080 para AD-Q5_K; RTX 3060 12 GB para AD-Q4_K. Para servidor, A100 o H100 solo aportan ventaja en BF16 y en concurrencia.
- **Opciones de despliegue**: stable-diffusion.cpp (motor de referencia del repositorio) y ComfyUI a traves de ComfyUI-GGUF. vLLM, TGI y Ollama no aplican a este tipo de modelo segun la informacion disponible.
- **Latencia y throughput**: no disponibles. El unico dato de coste publicable es el presupuesto de muestreo, 16 pasos con CFG 1, que implica la mitad de pasos que un esquema tipico de 28-30 y sin duplicar el lote por classifier-free guidance.
- **Almacenamiento**: el repositorio completo ocupa 61,1 GB; conviene descargar solo el fichero de imagen, el encoder y el VAE necesarios.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros modelos de imagen de tamano comparable (por ejemplo, variantes de la misma familia o de otras familias) que permitan una comparacion de capacidades. La comparacion posible es entre cuantizaciones del mismo modelo base:

| Criterio | AD-Q5_K (AtomicChat) | UD-Q5_K_XL (unsloth) | Q8_0 (leejet / unsloth) |
|---|---|---|---|
| Parametros | 5,6 B (modelo base) | 5,6 B (modelo base) | 5,6 B (modelo base) |
| Contexto | No disponible | No disponible | No disponible |
| Tamano en disco | 4,44 GB | 4,48 GB | 6,15 GB / 6,09 GB |
| LPIPS vs BF16 | 0,038 | 0,044 | 0,016 / 0,015 |
| SSIM / PSNR | 0,954 / 28,8 dB | No disponible | No disponible |
| Licencia | flux-kommunity-license | La del modelo base | La del modelo base |
| Disponibilidad | HuggingFace, stable-diffusion.cpp y ComfyUI-GGUF | HuggingFace | HuggingFace |

## Limitaciones y advertencias

- **Licencia no permisiva**: `flux-kommunity-license` es una licencia comunitaria con condiciones propias; antes de uso comercial hay que revisar `LICENSE.md` en el repositorio. No es una licencia OSI.
- **Sin filtro de contenido**: el autor afirma que el pipeline Klein abierto no incorpora filtro y publica variantes explicitamente sin rechazos del encoder y del prompt upsampler. En produccion hay que implementar moderacion propia, tanto en la entrada como en la salida.
- **Degradacion por cuantizacion**: AD-Q4_K pierde detalle fino de texturas y objetos pequenos (LPIPS 0,081, SSIM 0,903) aunque conserva composicion y rotulacion; en el punto de 3,93 GB la cuantizacion de unsloth mide mejor (0,055) que la propia a 3,65 GB.
- **Texto en imagen**: el renderizado de texto es la parte mas sensible; el LPIPS sobre leyendas con texto en chino sube de 0,011 (Q8_0) a 0,070 (AD-Q4_K), aproximadamente el doble de degradacion que la media.
- **Idiomas no documentados**: los metadatos no declaran idiomas soportados y no hay evaluacion multilingue publicada; el unico dato es el subconjunto de 8 leyendas con texto en chino.
- **Dependencia del codificador de texto**: el autor advierte que el encoder mueve la imagen tanto como el modelo de imagen, de modo que mezclar ficheros de distintos publicadores puede alterar el resultado aunque el modelo de imagen sea el mismo.
- **Riesgo de sesgos**: no se publica ninguna evaluacion de sesgos demograficos, culturales o de representacion para este checkpoint.
- **Artefactos y alucinacion visual**: no hay métricas publicadas de coherencia semantica prompt-imagen (tipo GenEval o T2I-CompBench); la evaluacion disponible mide fidelidad respecto a BF16, no correccion respecto al prompt.
- **Caveat de reproduccion**: todos los numeros se obtuvieron con un binario y una GPU concretos; el propio autor acota la variabilidad del render BF16 en LPIPS 0,0004, pero no se detalla el hardware empleado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-GGUF
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Codigo de inferencia de referencia: https://github.com/black-forest-labs/flux-3-image-klein
- Prompt upsampler GGUF: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-pup-GGUF
- Codificador de texto sin censura: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-TE-Uncensored-GGUF
- Prompt upsampler sin censura: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-pup-Uncensored-GGUF
- Renders y mediciones: https://huggingface.co/datasets/AtomicChat/FLUX-3-Image-Klein-GGUF-metrics
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Issue de integracion en Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat/issues/372
- Repositorio Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Web del autor: https://atomic.chat/
- Discord del autor: https://discord.gg/8wGSsvmg4V
- Ficha de terceros: https://free2aitools.com/model/atomicchat/flux-3-image-klein-gguf
