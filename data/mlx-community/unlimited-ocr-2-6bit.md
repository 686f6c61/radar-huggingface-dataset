# mlx-community/Unlimited-OCR-2-6bit

## Resumen

Unlimited-OCR-2-6bit es una versión cuantizada, ejecutable en Apple Silicon mediante MLX, del modelo de OCR baidu/Unlimited-OCR-2 desarrollado por Baidu. Se trata de un modelo de visión-lenguaje (pipeline image-text-to-text) especializado en el reconocimiento y parseo de documentos, con capacidad para procesar una o varias páginas en una misma petición y devolver una salida estructurada con etiquetas de página y bloques, que el repositorio original puede convertir a Markdown.

La conversión a MLX la ha realizado la organización mlx-community usando mlx-vlm, aplicando cuantización afín de 6 bits (group size 64) al modelo de lenguaje, mientras que las torres de visión (SAM y CLIP) y el router DASH por capa se mantienen en bfloat16. El modelo pesa aproximadamente 3.340 millones de parámetros y el repositorio ocupa 3,4 GB.

Su relevancia actual radica en la creciente demanda de modelos de OCR ligeros y de alta fidelidad para digitalización de documentos, y en que permite ejecutar esta tarea localmente en Mac con Apple Silicon, sin depender de APIs externas. Destaca por su modo "gundam" (vista global de 1024 píxeles más hasta 16 recortes locales por página) y por su atención block-sparse DASH con RoPE 2D de página.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje con torres de visión SAM y CLIP, router DASH por capa (atención block-sparse) y RoPE 2D de página (page2d) |
| Parametros totales | 3.340.043.008 (aprox. 3,34 B) |
| Parametros activos | no disponible (no consta que sea MoE; el router DASH es de atención, no de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit affine quantization (group size 64) en el modelo de lenguaje; SAM, CLIP y router DASH en bfloat16 |
| Idiomas soportados | Multilingüe (sin lista concreta publicada) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura combina un codificador de visión basado en SAM y CLIP con un modelo de lenguaje de unos 3,34 mil millones de parámetros. Entre las innovaciones técnicas destacables que soporta la conversión MLX se encuentran el RoPE 2D de página (page2d RoPE), que codifica la posición de los tokens en la geometría de la página, y la atención block-sparse DASH mediante un router por capa, que permite gestionar de forma eficiente documentos densos y de varias páginas. El modo "gundam" procesa cada página con una vista global de 1024 píxeles más hasta 16 recortes locales de alta resolución, y varias páginas pueden enviarse en una misma petición con una vista base de 1024 por página.

Sobre el entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no se han publicado detalles en la información disponible. La cuantización de 6 bits se ha aplicado únicamente al modelo de lenguaje, preservando en bfloat16 las torres de visión y el router DASH para minimizar la pérdida de calidad en la percepción visual.

## Capacidades

- OCR y parseo de documentos a partir de imágenes, con salida estructurada mediante etiquetas `<PAGE>`, `<BLOCK>label[x0, y0, x1, y1]<FORK>text` y marcadores `cross_*` / `append_*` para bloques que continúan entre páginas.
- Procesamiento multipágina en una sola petición (por ejemplo, dos páginas con `--max-tokens 16384`).
- Modo "gundam" para páginas individuales: vista global de 1024 píxeles más hasta 16 recortes locales de alta resolución.
- Conversión de la salida a Markdown mediante un conversor incluido en el repositorio original.
- Capacidades conversacionales propias de un modelo de visión-lenguaje (pipeline image-text-to-text).
- Soporte multilingüe (sin detalle de idiomas concretos).
- No hay información publicada sobre tool calling, agentes, thinking mode, audio ni otras capacidades especiales.

## Casos de uso

- Digitalización de documentos en flujos locales: se puede ejecutar en un Mac con Apple Silicon para convertir escaneos y fotografías de documentos en texto estructurado sin enviar datos a servicios externos, algo adecuado para sectores con requisitos de privacidad.
- Parseo de documentos multipágina: gracias al soporte de varias páginas por petición y a los marcadores `cross_*`/`append_*`, es adecuado para contratos, informes o expedientes cuyo contenido se extiende entre páginas.
- Extracción a Markdown para RAG: el conversor a Markdown del repositorio original permite alimentar directamente sistemas de generación aumentada por recuperación con documentos bien estructurados (títulos, tablas, bloques).
- Preservación de layout: las coordenadas de bounding box incluidas en la salida (`[x0, y0, x1, y1]`) permiten reconstruir la disposición original del documento, útil en archivado digital y auditoría documental.
- Procesamiento de documentos densos: la atención block-sparse DASH y el modo "gundam" con recortes locales hacen viable trabajar con páginas con mucho texto o tipografía pequeña.
- Automatización de ingesta documental en pipelines: al poder invocarse desde la línea de comandos con mlx-vlm, puede integrarse en scripts de procesamiento por lotes de facturas, formularios o correspondencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 3,4 GB; con la cuantización de 6 bits del modelo de lenguaje y las torres de visión en bfloat16, la memoria unificada necesaria para inferencia se sitúa aproximadamente en torno a 4-6 GB, aunque esta cifra es una estimación y no un dato publicado.
- Diseñado para Apple Silicon mediante MLX: funciona en Mac con chips M1/M2/M3/M4 (no requiere GPU NVIDIA).
- No es aplicable el despliegue típico en GPU de datacenter (A100/H100); el formato MLX está orientado a hardware de Apple. Para GPU NVIDIA habría que usar el modelo base baidu/Unlimited-OCR-2.
- Despliegue mediante mlx-vlm. Durante la redacción de esta ficha, el soporte de page2d RoPE y DASH block-sparse attention aún no está en la versión estable, por lo que hay que instalar desde la rama que lo añade: `pip install -U "git+https://github.com/shuuul/mlx-vlm.git"`.
- Uso básico por línea de comandos con `mlx_vlm.generate`, con temperatura 0 recomendada para tareas de OCR deterministas.
- Latencia y throughput exactos: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| mlx-community/Unlimited-OCR-2-6bit | ~3,34 B | 6-bit (LM), bf16 (visión) | MIT | safetensors (MLX) | OCR y parseo de documentos multipágina |
| baidu/Unlimited-OCR-2 (base) | ~3,34 B | Sin cuantizar | MIT | no disponible | OCR y parseo de documentos, hardware general |
| PaddleOCR-VL / otros OCR VLM ligeros | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: la información disponible sobre alternativas comparables de tamaño y tarea similares es escasa; para comparaciones cuantitativas, no disponible.

## Limitaciones y advertencias

- El soporte de page2d RoPE y DASH block-sparse attention aún no está integrado en la versión estable de mlx-vlm; hay que instalar desde una rama específica, lo que introduce riesgo de inestabilidad.
- No se han publicado detalles sobre la longitud de contexto, idiomas concretos soportados ni datos de entrenamiento, lo que dificulta evaluar límites operativos de antemano.
- Al tratarse de una cuantización de 6 bits, puede haber una ligera degradación respecto al modelo base en bfloat16, especialmente en el modelo de lenguaje; las torres de visión y el router DASH se conservan en bfloat16 para mitigarlo.
- Como todo modelo de OCR, puede alucinar texto en imágenes de baja calidad, manuscritos o tipografías inusuales; se recomienda temperatura 0 y validación con las coordenadas de bounding box.
- La licencia MIT es muy permisiva y permite uso comercial sin restricciones relevantes.
- El formato MLX limita el despliegue a hardware Apple; para entornos Linux/Windows con GPU NVIDIA debe usarse el modelo base original.
- Las métricas de descargas y likes son muy bajas (173 descargas, 1 like en el momento de la ficha), lo que sugiere una adopción temprana y poca validación comunitaria; conviene probarlo a fondo antes de uso en producción.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/mlx-community/Unlimited-OCR-2-6bit
- Modelo base de Baidu: https://huggingface.co/baidu/Unlimited-OCR-2
- Organización mlx-community: https://huggingface.co/mlx-community
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Rama de mlx-vlm con soporte de Unlimited-OCR-2: https://github.com/shuuul/mlx-vlm.git
