# ruwwww/TRELLIS.2-4B-int8-convrot

## Resumen

TRELLIS.2-4B-int8-convrot es una distribucion cuantizada del pipeline de generacion 3D image-to-3D con texturizado PBR desarrollado por Microsoft Research Asia (TRELLIS.2-4B), publicada por el usuario ruwwww. No es un modelo nuevo: es un empaquetado de los cinco modelos DiT de 1.3B parametros del pipeline original, convertidos a INT8 mediante la tecnica ConvRot y adaptados para ejecucion acelerada por hardware nativo dentro de ComfyUI a traves del conjunto de kernels `comfy-kitchen`.

El problema que resuelve es de eficiencia en produccion: el pipeline original en bfloat16 ocupa aproximadamente 12,3 GB solo en los cinco DiT, lo que dificulta su despliegue en GPUs de consumo. Esta version reduce cada DiT de unos 2,46 GB a unos 1,25 GB (factor 1,97x) y acelera el forward pass entre 1,51x y 1,59x, manteniendo una similitud coseno de 0,9981 a 0,9994 y un SNR de 24,1 a 29,1 dB respecto a la referencia en bfloat16.

La relevancia es practica para quien quiera integrar generacion de mallas 3D con materiales PBR en flujos de ComfyUI sin disponer de hardware de datacenter. La licencia MIT del modelo base se mantiene, aunque conviene verificar las condiciones de los componentes derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con bloques modulados, atencion self y cross, y FFN; pipeline de flujo en espacio latente con representacion sparse (SLat) y decodificadores convolucionales 3D |
| Parametros totales | 5 DiT de 1.3B cada uno (6.5B en el conjunto de DiT); el pipeline incluye ademas decodificadores y un encoder de forma en fp16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no de texto) |
| Tipos de cuantizacion | INT8 tensorwise con rotacion Walsh-Hadamard por grupos de 256 (`convrot=True, convrot_groupsize=256, per_channel=True`); 210 capas cuantizadas y 35 tensores en bfloat16 por DiT |
| Idiomas soportados | no disponible (modelo multimodal imagen-a-3D, sin interfaz de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (INT8 ConvRot) con ficheros JSON asociados; decodificadores en fp16 |

## Arquitectura y entrenamiento

Cada uno de los cinco modelos es un DiT de 1.3B parametros con 30 bloques transformer modulados, `channels=1536`, `num_heads=12`, `head_dim=128` y FFN de 6144. El pipeline se organiza en tres etapas: una etapa de estructura dispersa (Sparse Structure Flow DiT a 64^3), una etapa de forma en espacio latente sparse (Shape SLat Flow DiT a 512^3 y cascada a 1024^3) y una etapa de texturizado PBR (Texture SLat Flow DiT a 512^3 y cascada a 1024^3). Los decodificadores convolucionales 3D (`ss_dec_conv3d_16l8_fp16`, `shape_dec_next_dc_f16c32_fp16`, `tex_dec_next_dc_f16c32_fp16`) y el encoder de forma permanecen en fp16.

La innovacion tecnica de esta distribucion no esta en el entrenamiento, sino en la cuantizacion post-entrenamiento. Se aplica una rotacion Walsh-Hadamard por grupos de 256 elementos sobre pesos y activaciones antes de la cuantizacion dinamica INT8, lo que dispersa los valores atipicos por canal y preserva la relacion senal-ruido sin necesidad de datos de calibracion. Las proyecciones de self-attention (`to_qkv`, `to_out`), cross-attention (`to_q`, `to_kv`, `to_out`) y las capas `mlp.{0,2}` se cuantizan; se mantienen en bfloat16 `input_layer`, `out_layer`, `t_embedder.mlp`, `adaLN_modulation`, las modulaciones de bloque y las escalas de `q_rms_norm`/`k_rms_norm`, que representan menos del 0,9% del total de bytes. No se dispone de informacion sobre el dataset de entrenamiento original ni sobre el uso de RLHF o DPO, ya que se trata de un modelo generativo 3D.

## Capacidades

- Generacion de mallas 3D a partir de una imagen de entrada (image-to-3D) con estructura geometrica y topologia derivadas de la imagen.
- Texturizado PBR: produce mapas de materiales fisicamente basados junto con la geometria.
- Generacion en dos resoluciones de cascada (512^3 y 1024^3) para forma y textura.
- Representacion sparse (O-Voxel / SLat) que permite manejar geometria de alta resolucion con coste controlado.
- Integracion nativa en ComfyUI mediante el nodo `ComfyUI-TRELLIS2` y los kernels `comfy-kitchen`.
- Ejecucion acelerada en INT8 con `int8_linear`, `gelu_tanh` fusionado con epilogo residual, `adaln` fusionado y `apply_rope` 3D fusionado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusion para 3D, no un LLM.
- Capacidades multilingues: no aplicables.

## Casos de uso

- Prototipado rapido de assets 3D en estudios pequenos: el modelo convierte una fotografia o render en una malla texturizada con PBR, lo que permite generar borradores de props y entornos sin modelado manual y con un coste de VRAM reducido gracias a la cuantizacion INT8.
- Integracion en pipelines de ComfyUI para artistas tecnicos: al estar empaquetado para `ComfyUI-TRELLIS2`, se puede encadenar con nodos de imagen, control y render dentro del mismo grafo, sustituyendo los checkpoints bf16 por estos INT8 para acelerar la iteracion.
- Generacion de variantes de producto para e-commerce: a partir de una imagen de catalogo se obtiene una malla con materiales PBR que puede renderizarse en visores web o motores de juego, con la ventaja de que el pipeline completo cabe en una GPU de consumo.
- Creacion de contenido para videojuegos y realidad aumentada: las mallas con texturas PBR generadas a 1024^3 son adecuadas para assets de entorno y objetos, y la reduccion de tamano (6,26 GB frente a 12,3 GB) facilita el despliegue en estaciones de trabajo.
- Investigacion en generacion 3D: sirve como referencia cuantizada para reproducir resultados de TRELLIS.2 con menor huella de memoria, util para comparar tecnicas de cuantizacion (ConvRot frente a otras) sobre un pipeline generativo real.
- Despliegue en entornos con VRAM limitada: al reducir cada DiT a 1,25 GB, es viable ejecutar el pipeline por etapas en GPUs de 16-24 GB, algo inviable con los pesos bf16 completos en muchos casos.
- Automatizacion de conversion de scans o fotos a mallas texturizadas en flujos de impresion 3D o visualizacion arquitectonica, donde la calidad PBR y la fidelidad geometrica son requisitos.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Similitud coseno frente a bfloat16 | 0,9981–0,9994 |
| SNR frente a bfloat16 | 24,1–29,1 dB |
| Reduccion de tamano por DiT | 1,97x (2,46 GB a 1,25 GB) |
| Reduccion total en los 5 DiT | 12,3 GB a 6,26 GB |
| Aceleracion del forward pass | 1,51x–1,59x con `comfy-kitchen` |
| Capas cuantizadas por DiT | 210 |
| Tensores en bfloat16 por DiT | 35 (<0,9% de los bytes) |

No se han publicado resultados de benchmarks de calidad 3D (FID, Chamfer distance, PSNR de textura) en la informacion disponible; las metricas anteriores son de fidelidad numerica y rendimiento, no de calidad generativa.

## Requisitos de hardware

- VRAM estimada: los cinco DiT INT8 suman unos 6,26 GB; con decodificadores fp16 y overhead de activaciones, el pipeline completo requiere del orden de 10-14 GB en funcion de la resolucion de cascada y del lote.
- GPU recomendadas: RTX 4090 (24 GB) para el pipeline completo a 1024^3; RTX 4080/4070 Ti Super (16 GB) para 512^3 o ejecucion por etapas; A100/H100 para lotes grandes o produccion.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas con carga progresiva por etapas; en 12 GB puede requerir ejecutar etapas de forma secuencial y liberar memoria entre ellas.
- Opciones de despliegue: ComfyUI con el nodo `ComfyUI-TRELLIS2` (fork de ruwwww o el original de PozzettiAndrea) y los kernels `comfy-kitchen`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma absoluta; la aceleracion relativa del forward pass es de 1,51x a 1,59x frente a bfloat16 con los kernels fusionados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TRELLIS.2-4B-int8-convrot (este) | 5 DiT de 1.3B | Cascada 512^3 y 1024^3 | INT8 ConvRot | MIT | Hugging Face, ComfyUI |
| microsoft/TRELLIS.2-4B (original) | 5 DiT de 1.3B | Cascada 512^3 y 1024^3 | bfloat16 | MIT | Hugging Face |
| microsoft/TRELLIS-image-large (base) | no disponible | no disponible | bfloat16 | MIT | Hugging Face |
| Otros image-to-3D (p. ej. TripoSR, InstantMesh) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa principal es contra el modelo original: misma arquitectura y licencia, pero con aproximadamente la mitad de peso y mayor velocidad a costa de una perdida numerica minima. Frente a alternativas de la categoria image-to-3D no se dispone de datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Es una distribucion cuantizada, no un modelo entrenado desde cero: hereda todas las limitaciones del pipeline TRELLIS.2 original, incluidas posibles alucinaciones geometricas en vistas oclusivas o imagenes ambiguas.
- La cuantizacion INT8 ConvRot introduce una perdida numerica medible (SNR de 24,1 a 29,1 dB); en casos extremos puede manifestarse como artefactos en texturas o geometria fina, aunque el autor la describe como casi sin perdida.
- Requiere los kernels `comfy-kitchen` y una version de ComfyUI compatible con `int8_convrot`; sin ese soporte, los checkpoints no se ejecutan de forma nativa y pierden su ventaja de rendimiento.
- Dependencia de un ecosistema concreto (ComfyUI y el nodo `ComfyUI-TRELLIS2`), lo que limita su uso fuera de ese entorno sin trabajo de integracion adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia: no hay evidencia de uso en produccion ni validacion independiente de las metricas declaradas.
- Idiomas no aplicables, pero la calidad de reconstruccion depende de la imagen de entrada; no se documentan sesgos especificos.
- Licencia MIT declarada, compatible con uso comercial, pero al ser un derivado conviene conservar la atribucion a Microsoft Research Asia y a los autores de los kernels y del nodo de ComfyUI.
- El pipeline incluye varios componentes en fp16 que no se cuantizan; el ahorro de memoria total es menor que el de los DiT por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ruwwww/TRELLIS.2-4B-int8-convrot
- Modelo base TRELLIS.2-4B: https://huggingface.co/microsoft/TRELLIS.2-4B
- Modelo base TRELLIS-image-large: https://huggingface.co/microsoft/TRELLIS-image-large
- Repositorio del nodo (fork): https://github.com/ruwwww/ComfyUI-TRELLIS2
- Repositorio original del nodo: https://github.com/PozzettiAndrea/ComfyUI-TRELLIS2
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Paper referenciado (arXiv:2412.01506): https://arxiv.org/abs/2412.01506
