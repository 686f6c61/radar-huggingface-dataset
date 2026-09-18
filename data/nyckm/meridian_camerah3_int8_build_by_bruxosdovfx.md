# NyckM/Meridian_CameraH3_INT8_build_by_BruxosdoVFX

## Resumen

Meridian for Camera H3 es un modelo de difusion para video especializado en "re-camara": toma un clip de origen y un render de nube de puntos (warp) de una camara nueva, y vuelve a rodar la escena desde ese punto de vista. Este repositorio concreto, `NyckM/Meridian_CameraH3_INT8_build_by_BruxosdoVFX`, es una conversion lista para ComfyUI del modelo [Viggle/Meridian](https://huggingface.co/Viggle/Meridian), que a su vez es un ajuste fino completo del transformer `ref2va` de MiniMax-H3. Ni MiniMax ni Viggle estan detras de esta publicacion: la conversion y las herramientas asociadas las firma BruxosdoVFX.

La arquitectura es un transformer de difusion (el `ref2va` de MiniMax-H3) con 33,1 mil millones de parametros antes de optimizar. La contribucion de esta build es triple: se reescribe el layout de claves de diffusers a ComfyUI, se aplica una poda en "forma de curva" (AdaLN curve-form) que reduce el modelo a 20,1 B con un error de reconstruccion medido del 0,010 %, y se cuantizan 200 capas lineales a INT8 ConvRot. El repo ocupa 24,8 GB y no incluye el modelo en bf16 completo (37 GB) salvo que se descargue aparte.

Es relevante ahora porque permite ejecutar en ComfyUI un modelo de re-camara guiado por profundidad y geometria, sin codificador de texto (el prompt no existe: todo el control de camara viene del video warp). El principal caveat es la licencia: la MiniMax H3 Community License Agreement excluye expresamente la Union Europea, el Reino Unido, Corea del Sur y Estados Unidos como territorio aplicable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (ref2va de MiniMax-H3) con AdaLN en forma de curva |
| Parametros totales | 33,1 B (bf16 antes de poda); 20,1 B tras la poda AdaLN curve-form |
| Longitud de contexto | no disponible (modelo de video; longitudes de fotograma admitidas: 73, 90, 107, 124, 141, 158, 175 y 243 a 24 fps) |
| Tipos de cuantizacion | INT8 ConvRot nativo (200 capas lineales cuantizadas con escalas por capa); tambien disponible en bf16 |
| Idiomas soportados | no aplica (sin codificador de texto; usa un embedding de texto congelado) |
| Licencia | MiniMax H3 Community License Agreement (territorio aplicable: mundial excluyendo Union Europea, Reino Unido, Corea del Sur y Estados Unidos) |
| Formato de pesos | safetensors (INT8 y bf16), LoRA en safetensors, embeddings de texto en safetensors |

## Arquitectura y entrenamiento

La base es el transformer `ref2va` de MiniMax-H3, un modelo de difusion para video. Sobre esa base, Viggle/Meridian es un ajuste fino completo que aprende a re-rodar un clip desde una camara nueva condicionado por un render de nube de puntos de dicha camara. Meridian se entreno sobre renders generados con VGGT-Omega, que estima profundidad y la pose de la camara de origen fotograma a fotograma. El ajuste se acompaña de un LoRA DMD de 3 pasos (re-keyed para ComfyUI, ~3,6 GB) que reduce la muestral a tres iteraciones con sigmas `1.0, 0.8571428571428571, 0.6, 0.0`. No se detalla el numero de tokens de entrenamiento ni la composicion del dataset.

Las innovaciones de esta build son de conversion, no de entrenamiento. Primero, el layout de claves pasa de diffusers a ComfyUI (`to_q/to_k/to_v` se refusionan en `qkv_proj`; `ff.net.0.proj` se mapea a `mlp.fc1` con las dos mitades intercambiadas por la convencion SwiGLU de ComfyUI; se recalcula `rope.inv_freq`). Segundo, la poda AdaLN proyecta la proyeccion temporal (2688 entradas, 13 de los 33 mil millones de parametros) sobre una base SVD de 8 componentes, sustituyendo el time embedder por una `adaln_t_table`; el error de reconstruccion medido es del 0,010 %. Tercero, la cuantizacion INT8 ConvRot se realizo con el ComfyUI Quantization Toolkit (`model_type = minimax_h3`), manteniendo en punto flotante normas, proyecciones de parches y el AdaLN en forma de curva. El LoRA se re-keyea preservando las actualizaciones por proyeccion (`lora_A` concatenado y `lora_B` en bloque diagonal).

## Capacidades

- Generacion de video guiada por geometria: re-rodar un clip desde una camara nueva usando un video warp (render de profundidad/nube de puntos) como condicionamiento.
- Control de camara implicito: el movimiento de camara proviene integramente del video warp, no de texto.
- Salida a resolucion 1344×768 (clase 768) para generacion y referencias renderizadas a 832×480 (clase 480, 16:9).
- Longitudes de fotograma discretas: 73, 90, 107, 124, 141, 158, 175 y 243 a 24 fps; el numero de fotogramas del warp, el parametro `length` y el embedding de texto deben coincidir.
- Inferencia en 3 pasos mediante el LoRA DMD, con sampler euler y CFG 1.0.
- Integracion con ComfyUI mediante nodos companion (Camera H3 Bruxos) que construyen el warp a partir de profundidad.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de generacion de video, no un LLM.
- No soporta prompts de texto: usa un embedding de texto congelado, uno por longitud.
- Capacidades multilingues: no aplica.
- Relleno de desoclusiones: las zonas grises (valor 128) del warp son areas que la camara nueva debe inventar, es decir, el modelo genera contenido no observado.

## Casos de uso

- Postproduccion y VFX de re-camara: dado un plano rodado, cambiar el punto de vista de la camara para corregir encuadres o generar tomas alternativas sin volver a rodar, apoyandose en la condicion de nube de puntos.
- Previsualizacion de planos (previz): generar rapidamente como quedaria una escena desde una camara distinta antes de comprometer recursos de rodaje.
- Conversion a estereoscopico o multivista: producir una segunda vista coherente de un plano para experimentacion con visualizacion 3D, dentro del limite de ~40° de movimiento de camara.
- Estabilizacion o "relock" de camara: sustituir un movimiento handheld por una camara estatica; conviene tener en cuenta que la distribucion de entrenamiento favorece planos fijos.
- Aumento de datos para vision por computador: generar vistas sinteticas adicionales de un clip con geometria consistente para entrenar modelos de profundidad, odometria o reconstruccion.
- Prototipado en ComfyUI: montar un pipeline de re-camara completo (profundidad con MoGe, warp, generacion con Meridian, decodificacion VAE) usando los nodos Camera H3 Bruxos y los workflows de ejemplo del repo.
- Efectos de paralaje en motion graphics: crear parallax a partir de un plano plano usando el warp para desplazar la camara y que el modelo sintetice las partes ocultas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la poda curve-form y la cuantizacion INT8 son aproximaciones con perdida y que "no se ejecuto ningun benchmark". La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo (los resultados obtenidos corresponden a un proyecto audiovisual ajeno, sin relacion).

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion derivada de los tamanos de fichero, no dato oficial): ~20 GB solo para el checkpoint INT8, mas ~3,6 GB del LoRA DMD, los embeddings de texto y el decodificador VAE; en la practica conviene disponer de 24 GB o mas y gestionar offloading.
- La version bf16 (~37 GB) no cabe en GPUs de consumo y requiere ~48 GB o mas de VRAM, o descarga parcial a CPU.
- GPU recomendadas: NVIDIA con buen rendimiento INT8. En gama profesional, A100, H100, A6000 o L40S. El requisito INT8 es explicito en la model card.
- Cabe en GPU de consumo: si, con reservas, el checkpoint INT8 en una RTX 4090 (24 GB) siempre que se gestione con cuidado la memoria; no cabe el bf16.
- Requisito adicional: `int8_convrot` necesita una GPU NVIDIA con throughput INT8 util y un `comfy-kitchen` compatible.
- Opciones de despliegue: ComfyUI con los nodos Camera H3 Bruxos y el ComfyUI Quantization Toolkit. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion de video).
- Latencia y throughput estimados: no disponibles. El sampler usa 3 pasos (euler, CFG 1.0) gracias al LoRA DMD, lo que reduce el coste frente a un muestreo de muchos pasos, pero no se aportan cifras.

## Comparativa con modelos similares

Comparativa dentro de la propia estirpe del modelo, que es la unica informacion disponible:

| Modelo | Parametros | Formato | Peso en disco | Condicionamiento | Licencia |
|---|---|---|---|---|---|
| Este repo (Meridian Camera H3 INT8) | 20,1 B (tras poda) | INT8 ConvRot safetensors | ~20 GB + 3,6 GB LoRA | Warp de nube de puntos | MiniMax H3 Community (excluye UE, RU, Corea del Sur, EE. UU.) |
| Viggle/Meridian (bf16) | 33,1 B | bf16 safetensors | ~37 GB (referencia) | Warp de nube de puntos | MiniMax H3 Community |
| MiniMax-H3 `ref2va` (base) | no disponible | no disponible | no disponible | Referencia de video | MiniMax H3 Community |

No se dispone de datos de rendimiento comparativo entre estas variantes, ya que no se ejecutaron benchmarks. No se dispone de informacion suficiente sobre otros modelos de re-camara (por ejemplo alternativas de control de camara en video) para establecer una comparativa fiable, por lo que se indica "no disponible".

## Limitaciones y advertencias

- Licencia restrictiva para Espana: la MiniMax H3 Community License Agreement solo autoriza uso, modificacion, distribucion y exhibicion en el territorio aplicable mundial excluyendo la Union Europea, el Reino Unido, Corea del Sur y Estados Unidos. Al estar este modelo en la Union Europea, su uso queda fuera de la autorizacion de la licencia. Revisar `LICENSE` y `NOTICE`; la propia card advierte que no es asesoramiento legal.
- Desajuste de distribucion en la captura: Meridian se entreno con renders de VGGT-Omega, que estima profundidad y la pose de camara de origen por fotograma; el nodo companion usa MoGe y asume camara de origen estatica. Los planos fijos encajan con el entrenamiento, los handheld no.
- Inestabilidad con movimiento de camara amplio: por encima de unos 40° de desplazamiento, Viggle reporta que el modelo se vuelve inestable.
- Perdida por cuantizacion y poda: la forma de curva y el paso a INT8 son aproximaciones con perdida; no se reclama ninguna paridad de calidad frente a los pesos bf16 originales y no se ejecuto benchmark alguno.
- Riesgo de alucinacion controlada: las zonas grises del warp (desoclusiones) son areas que el modelo debe inventar, por lo que el contenido generado ahi no esta respaldado por la observacion.
- Sin control por texto: al usar un embedding congelado no hay prompt; cualquier intento de guiar la generacion por lenguaje no funcionara.
- Restriccion de hardware: la ruta INT8 exige GPU NVIDIA con throughput INT8 util y un `comfy-kitchen` compatible; no se documenta soporte para otras plataformas.
- Resoluciones y longitudes fijas: la generacion esta pensada para la clase 768, las referencias para la clase 480, y las longitudes de fotograma estan limitadas a los valores enumerados.
- Falta de afiliacion: no esta afiliado a MiniMax, Viggle ni Comfy-Org; es una build de terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/NyckM/Meridian_CameraH3_INT8_build_by_BruxosdoVFX
- Modelo base del ajuste: https://huggingface.co/Viggle/Meridian
- Modelo original MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Nodos companion (ComfyUI-H3-Camera-Editor): https://github.com/bruxosdovfx/ComfyUI-H3-Camera-Editor
- Coleccion Camera H3 Bruxos: https://huggingface.co/collections/bruxosdovfx
- ComfyUI Quantization Toolkit: https://github.com/SparknightLLC/ComfyUI-QuantizationToolkit
- Ficheros de conversion y workflows: `CONVERSION.md` y `workflows/` dentro del repositorio.
