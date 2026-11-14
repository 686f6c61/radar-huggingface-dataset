# oxide-lab/TRELLIS.2-4B-GGUF

## Resumen
TRELLIS.2-4B es un modelo de generación de mallas 3D a partir de imágenes (image-to-3D) desarrollado por Microsoft. Convierte una imagen de entrada en un objeto 3D texturizado con malla poligonal y colores PBR por vértice. Esta ficha cubre la distribución GGUF publicada por oxide-lab, que empaqueta el modelo canónico en ficheros autónomos optimizados para el runtime Lux3D.

La arquitectura es un pipeline en cascada: un codificador DINOv3 extrae la condición de imagen, un DiT de flujo genera la estructura dispersa, un segundo DiT de flujo genera el SLAT de forma y, opcionalmente, un tercer DiT produce el SLAT de textura. La decodificación final usa un VAE disperso con malla O-Voxel de doble rejilla. El paquete canónico declara 7.786.541.462 parámetros en safetensors, aunque el nombre comercial usa "4B".

La relevancia de esta distribución es práctica: reduce el paquete canónico de 15,07 GiB a variantes de 5,86-14,50 GiB, carga por mmap en menos de 0,1 s (frente a los ~27 s de validación del paquete safetensors) y permite ejecutar el pipeline 1024_cascade dentro de unos 8 GiB de VRAM mediante carga secuencial de etapas. Es una opción realista para estaciones con GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion: DINOv3 (condicion de imagen) + 5 transformers DiT de flujo (ss_flow, shape_dit_512, shape_dit_1024, tex_dit_512, tex_dit_1024) + VAE disperso con malla O-Voxel de doble rejilla |
| Parametros totales | 7.786.541.462 (safetensors del modelo base); el nombre comercial indica 4B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo image-to-3D, no generativo de texto) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K, Q4_K (cuantizacion solo de las matrices lineales de los DiT; DINOv3, VAEs, decodificadores, convoluciones, normas, sesgos y embeddings permanecen en F16) |
| Idiomas soportados | No disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | GGUF (ficheros autonomos con resolved_config.json embebido); paquete canonico en safetensors con mezcla BF16/F16/F32 y 4265 tensores |

## Arquitectura y entrenamiento
El modelo sigue un diseño de difusion por flujo sobre representaciones latentes dispersas. La imagen se codifica con DINOv3 como condicionamiento; a partir de ahi, `ss_flow` genera la estructura dispersa, `shape_dit_512` y `shape_dit_1024` generan el SLAT de forma en dos resoluciones y, si se activa la textura, `tex_dit_512` y `tex_dit_1024` producen el SLAT de textura. La decodificacion usa un VAE disperso (`shape_dec`, `tex_dec`) y un decodificador de estructura densa (`ss_dec`) que reconstruyen una malla O-Voxel de doble rejilla, con la opcion de escribir atributos PBR de 6 canales por voxel.

La innovacion principal de esta distribucion GGUF es la politica de cuantizacion selectiva: solo se cuantizan las matrices `*.weight` de rango 2 bajo los cinco prefijos DiT, que el runtime carga como `QMatMul`; el resto de tensores queda en F16 porque su cuantizacion solo anadiria sobrecoste de deserializacion. En Q8_0 se cuantizan 1074 de las 1075 matrices lineales DiT (`ss_flow.input_layer.weight` tiene longitud de fila 8 y no encaja en bloques de 32); en Q6_K, Q5_K y Q4_K se cuantizan 1070, ya que los bloques K-quant de 256 anchos excluyen cuatro matrices `input_layer` de fila 32/64. Los kernels de convolucion 3D (rango 5) se almacenan como vectores planos y los loaders de Lux3D los remodelan tras la deserializacion. No se dispone de informacion sobre volumen de datos de entrenamiento, composicion del dataset ni uso de RLHF/DPO.

## Capacidades
- Generacion de malla 3D a partir de una imagen RGBA, con salida en OBJ, PLY o GLB.
- Generacion de textura con atlas UV y colores PBR por vertice (6 canales por voxel), con ficheros sidecar `<stem>.pbrvox.bin` y `<stem>.pbr.json`.
- Pipeline configurable en dos modos: `512` (estructura dispersa + SLAT de forma a 512) y `1024_cascade` (cascada completa con textura).
- Control del numero de pasos de Euler por sampler (12 en la evaluacion de referencia) y de la semilla.
- Carga secuencial de etapas que mantiene la ejecucion `1024_cascade` dentro de unos 8 GiB de VRAM.
- Inferencia en CPU posible, aunque lenta segun el autor.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso
- Prototipado rapido de assets 3D: a partir de un render o fotografia con canal alfa se obtiene una malla OBJ en unos 96-143 s en una RTX 3060, suficiente para iterar sobre conceptos antes de modelar en detalle.
- Generacion de assets para videojuegos y entornos interactivos: la salida GLB con textura y colores PBR por vertice se importa directamente en motores como Unity o Unreal, y la variante Q8_0 mantiene un Chamfer relativo de 0,187 % respecto a F32.
- Previsualizacion en estaciones de trabajo modestas: la variante Q4_K ocupa 5,86 GiB y permite generar mallas de vista previa en GPUs de consumo con F@1 % de 0,9625, adecuada para revisiones de direccion de arte.
- Catalogos de e-commerce: conversion de fotografias de producto con fondo recortado (RGBA obligatorio) en modelos 3D navegables para visores web.
- Digitalizacion de bocetos y arte conceptual: el pipeline 512 sin textura produce geometria en menos de 100 s con Q8_0, util para validar siluetas y proporciones.
- Investigacion en reconstruccion 3D: la disponibilidad de cinco niveles de cuantizacion con metricas de deriva documentadas (Chamfer, F-score, IoU de voxeles, consistencia de normales) permite estudiar el impacto de la precision numerica en la topologia de mallas generadas.
- Integracion en pipelines automatizados de conversion por lotes: la carga por mmap en menos de 0,1 s y los ficheros GGUF autonomos simplifican el despliegue en contenedores sin necesidad de validar safetensors al arrancar.

## Benchmarks y rendimiento
Las metricas publicadas miden la deriva respecto al paquete canonico F32, no la precision frente a una referencia real. Entrada: `mesh-input.png`, pipeline 512, 12 pasos de Euler por sampler, semilla 42, sin etapas de textura, salida OBJ, sobre una RTX 3060 de 12 GiB.

| Variante | CD rel. | F@0,5 % | F@1 % | IoU de voxeles | Normales | Vertices (ref. 914.470) | Tiempo de inferencia |
|---|---|---|---|---|---|---|---|
| F16 | 0,0027 % | 0,9999 | 1,000 | 0,996 | 0,993 | 914.157 | 142,8 s |
| Q8_0 | 0,187 % | 0,9139 | 0,9835 | 0,623 | 0,904 | 943.514 | 98,7 s |
| Q6_K | 0,199 % | 0,9181 | 0,9813 | 0,609 | 0,905 | 952.678 | 100,5 s |
| Q5_K | 0,274 % | 0,8839 | 0,9729 | 0,445 | 0,890 | 893.909 | 96,3 s |
| Q4_K | 0,311 % | 0,8331 | 0,9625 | 0,400 | 0,885 | 887.078 | 95,7 s |

La F16 reproduce la malla F32 casi exactamente (914.470 vertices y 1.830.028 caras en la referencia). Q8_0 y Q6_K mantienen la deriva Chamfer cerca del 0,19 % de la diagonal del bbox y F@1 % en torno a 0,98, pero el IoU de superficie cae a ~0,61 con un 3 % mas o menos de vertices: es deriva de topologia, no de posicion, ya que las normales siguen coincidiendo por encima de 0,90. Q5_K y Q4_K son aptas para previsualizacion (F@1 % >= 0,96) con deriva de topologia claramente visible (IoU 0,40-0,45).

## Requisitos de hardware
- VRAM estimada: el pipeline `1024_cascade` completo cabe en unos 8 GiB de VRAM gracias a la carga secuencial de etapas; el pipeline `512` sin textura requiere menos.
- GPU recomendadas: el autor valida sobre una RTX 3060 de 12 GiB; GPUs de consumo con 8-12 GiB son viables para el pipeline completo. Para produccion con mayor throughput se recomiendan GPUs de clase profesional (A100, H100), aunque no se publican mediciones en ellas.
- Cabe en GPU de consumo: si, con al menos 8 GiB de VRAM para la cascada completa; las variantes Q4_K (5,86 GiB) y Q5_K (6,61 GiB) reducen el peso en disco y memoria.
- Opciones de despliegue: runtime Lux3D mediante `lux3d-cli` con backend CUDA; inferencia en CPU posible pero lenta. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: unos 96-143 s por malla en una RTX 3060 con 12 pasos de Euler y pipeline 512, segun la variante (F16 142,8 s; Q4_K 95,7 s). La carga del GGUF por mmap tarda menos de 0,1 s hasta el primer tensor, frente a los ~27 s de validacion del paquete safetensors.

## Comparativa con modelos similares
No se dispone de datos de benchmarks de otros modelos image-to-3D en la informacion proporcionada, por lo que la comparacion se limita a parametros y disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| TRELLIS.2-4B-GGUF (esta ficha) | 7.786.541.462 en el paquete canonico | No aplica | MIT | GGUF (F16, Q8_0, Q6_K, Q5_K, Q4_K) | Hugging Face, runtime Lux3D |
| TRELLIS.2-4B canonico (microsoft) | 7.786.541.462 | No aplica | MIT (segun el modelo base) | Safetensors (BF16/F16/F32, 4265 tensores, 15,07 GiB) | Hugging Face |
| Alternativas image-to-3D | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias
- La eliminacion de fondo (RMBG-2.0/BiRefNet) esta excluida del pipeline: es obligatorio aportar imagenes RGBA; las imagenes solo RGB se tratan como totalmente opacas.
- El atlas de textura y el desenrollado UV quedan fuera del alcance documentado en la model card.
- La cuantizacion introduce deriva de topologia: en Q8_0 el IoU de voxeles baja a 0,623 y el numero de vertices varia un ~3 %; en Q5_K y Q4_K el IoU cae a 0,40-0,45. El autor recomienda Q8_0 para produccion y reserva Q5_K/Q4_K para previsualizaciones.
- No es un modelo de lenguaje: no admite tool calling, agentes, razonamiento multi-paso ni uso multilingue, y no debe evaluarse con benchmarks de texto como MMLU o GSM8K.
- Riesgo de alucinacion geometrica: al ser un modelo generativo, puede producir geometria plausible pero incorrecta en zonas ocluidas o ambiguas de la imagen de entrada; no se documentan tasas de error frente a verdad fundamental.
- Sesgos: no se documentan sesgos especificos, pero al derivar de un modelo entrenado con un dataset no descrito, puede heredar sesgos de representacion en objetos y estilos poco frecuentes.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base `microsoft/TRELLIS.2-4B` y de los componentes DINOv3 antes de explotacion comercial.
- La model card esta truncada en el apartado de limitaciones; pueden existir restricciones adicionales no recogidas aqui.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.

## Enlaces
- Repositorio GGUF: https://huggingface.co/oxide-lab/TRELLIS.2-4B-GGUF
- Modelo base: https://huggingface.co/microsoft/TRELLIS.2-4B
- Runtime Lux3D: https://github.com/oxide-lab/Lux3d
- Fichero de checksums: https://huggingface.co/oxide-lab/TRELLIS.2-4B-GGUF/blob/main/checksums.json
