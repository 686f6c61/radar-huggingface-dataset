# playstonex/Unlimited-OCR-2-4bit-mlx

## Resumen

Unlimited-OCR-2-4bit-mlx es una cuantización a 4 bits en formato MLX del modelo baidu/Unlimited-OCR-2, un vision-language model de Baidu ERNIE orientado a OCR y parseo de documentos. El modelo original emplea una arquitectura personalizada que combina un front-end visual SAM+CLIP con un decoder de tipo transformer que incorpora RoPE de dos ejes (page2d), atención block-sparse DASH y expertos MoE apilados y cuantizados. Este repositorio, publicado por el usuario playstonex, no entrena ni modifica el modelo: únicamente recomprime los pesos para ejecutarlos en Apple Silicon mediante MLX.

El problema que resuelve es doble. Por un lado, permite ejecutar un modelo de parseo documental de aproximadamente 6,4 GB en bf16 sobre hardware de Apple con un peso de unos 1,9 GB, reduciendo drásticamente los requisitos de memoria. Por otro, expone una ruta de inferencia nativa en Swift a través de MlxOCRKit, ya que la arquitectura no es cargable por las clases automáticas de mlx-vlm ni de transformers.

Es relevante ahora porque el ecosistema MLX carece de soporte genérico para arquitecturas de OCR personalizadas, y este repositorio documenta explícitamente el esquema de cuantización por tensor (`quantization.json`) y la alineación numérica con la referencia Python/MLX. El modelo cuenta con 611.568.129 parámetros totales según los safetensors publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model personalizada: front-end visual SAM+CLIP, decoder con RoPE de dos ejes (page2d), atención block-sparse DASH y expertos MoE apilados |
| Parametros totales | 611.568.129 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín (affine), group size 64; expertos cuantizados, rama visual SAM en bf16 (`quantized_sam=false`) |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors (MLX), repositorio de 2,0 GB |

## Arquitectura y entrenamiento

La arquitectura es propietaria y específica del modelo base de Baidu. Según la model card, combina un front-end visual compuesto por SAM y CLIP con un decoder que usa RoPE de dos ejes (page2d) para codificar la posición en las dos dimensiones de la página, atención block-sparse DASH para reducir el coste computacional en documentos largos y expertos MoE apilados. Esta combinación está diseñada específicamente para el parseo de documentos de varias páginas con estructura espacial compleja.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. Este repositorio concreto no realiza entrenamiento: solo aplica cuantización afín de 4 bits con group size 64 sobre los pesos del modelo base, manteniendo la rama visual SAM en bf16. La innovación técnica destacable es la integración de un decoder nativo en MLX-Swift (MlxOCRKit) numéricamente alineado con la implementación de referencia en Python/MLX, necesario porque las clases automáticas genéricas no pueden cargar esta arquitectura.

## Capacidades

- Parseo de documentos multi-página con salida estructurada mediante un protocolo de bloques propio (`<PAGE><BLOCK>type[x0, y0, x1, y1]<FORK> ...`).
- OCR y extracción de texto a partir de imágenes de páginas.
- Comprensión de layout documental: el protocolo de salida incluye tipo de bloque y coordenadas delimitadoras.
- Procesamiento image-text-to-text: acepta una imagen y un prompt textual de instrucción.
- Ejecución en Apple Silicon mediante MLX, con decoder nativo en Swift.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni soporte multilingüe explícito.

## Casos de uso

- Digitalización de archivos administrativos: el modelo procesa páginas escaneadas y devuelve bloques con coordenadas, lo que permite reconstruir la estructura del documento y alimentar sistemas de gestión documental.
- Extracción de datos de facturas y albaranes: el protocolo de bloques con coordenadas facilita localizar campos concretos (importes, fechas, emisores) y validarlos contra un esquema posterior.
- Procesamiento local en Mac: al ocupar unos 1,9 GB en 4 bits, permite ejecutar OCR de documentos en un portátil Apple sin enviar datos sensibles a la nube, relevante para sectores con requisitos de privacidad.
- Parseo de documentación técnica multi-página: el prompt "Multi page parsing." y el RoPE de dos ejes están orientados a mantener coherencia espacial entre páginas de un mismo documento.
- Integración en pipelines de digitalización con Swift: mediante MlxOCRKit se puede invocar el modelo desde una CLI (`minerukit uocr2`) y encadenar la salida estructurada a etapas de post-procesado.
- Prototipado e investigación en OCR: el repositorio publica el esquema de cuantización por tensor, lo que permite estudiar el impacto de la compresión 4-bit en tareas de parseo documental.
- Indexación de PDF convertidos a imagen para motores de búsqueda internos: la salida por bloques con coordenadas permite asociar texto a regiones de página y conservar la trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 1,9 GB de pesos en 4 bits, más overhead de activaciones y de la rama SAM en bf16; el repositorio ocupa 2,0 GB.
- Hardware objetivo: Apple Silicon con MLX. No se documenta soporte para GPU NVIDIA ni ROCm.
- No cabe esperar ejecución en GPUs consumer de NVIDIA mediante este repositorio, ya que los pesos están en formato MLX y la arquitectura no es cargable por clases automáticas de transformers o mlx-vlm.
- Despliegue: librería MLX y decoder nativo en Swift vía MlxOCRKit (`minerukit uocr2 --model ./Unlimited-OCR-2-4bit-mlx --image page.png --prompt "Multi page parsing." --max-tokens 512`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Unlimited-OCR-2-4bit-mlx | 611.568.129 | no disponible | safetensors MLX 4-bit | MIT | Cuantización comunitaria para Apple Silicon |
| baidu/Unlimited-OCR-2 | no disponible | no disponible | no disponible | MIT | Modelo base original en bf16 (~6,4 GB) |
| Otros modelos OCR/VLM de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La arquitectura es personalizada y no es cargable por `mlx-vlm` ni por las clases automáticas de `transformers`; requiere el decoder específico de MlxOCRKit.
- Solo se ejecuta en Apple Silicon mediante MLX; no hay ruta documentada para CUDA u otros backends.
- La cuantización a 4 bits puede degradar la precisión del OCR y del parseo de layout frente al modelo base en bf16; no se publican métricas de esa degradación.
- La rama visual SAM se mantiene en bf16, por lo que el ahorro de memoria no es uniforme en todos los componentes.
- No se documentan idiomas soportados, lo que impide garantizar calidad en castellano u otras lenguas sin evaluación previa.
- Riesgo de alucinación inherente a los vision-language models: puede generar bloques o coordenadas plausibles pero incorrectos en páginas de baja calidad o layouts atípicos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia comunitaria de validación.
- La licencia MIT se hereda del modelo base, pero conviene verificar la model card original de Baidu para condiciones adicionales de atribución o uso comercial.
- El repositorio es una cuantización de terceros; los créditos del modelo corresponden a los autores originales (Baidu).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/playstonex/Unlimited-OCR-2-4bit-mlx
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR-2
- MLX: https://github.com/ml-explore/mlx
- MlxOCRKit (decoder Swift): https://github.com/playstonex/MinerUKit
