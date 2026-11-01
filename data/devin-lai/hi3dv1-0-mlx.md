# devin-lai/Hi3Dv1.0-mlx

## Resumen

Hi3D v1.0 es un modelo de refinamiento de geometría 3D que toma como entrada una imagen de referencia y una malla gruesa (coarse mesh) ya existente, y produce una malla 3D de mayor detalle. No genera la malla inicial ni texturas: su tarea es exclusivamente el refinamiento geométrico. El modelo original lo desarrolla el equipo hi3d-official, y esta ficha cubre el port comunitario a MLX realizado por devin-lai, pensado para ejecución local en Apple Silicon.

El port MLX incluye pesos en FP16, INT8, INT4 y una variante experimental W8A8, con extracción sobre rejillas dispersas de 512³, 1024³ y 1536³. Está validado en la familia de chips M5 de Apple con macOS y Metal, y expone tanto una CLI (`hi3d-mlx refine`) como una API de Python. La relevancia actual reside en que permite refinar geometría 3D de forma local en hardware de consumo Apple, sin depender de GPUs de datacenter.

La información pública disponible es limitada en cuanto a arquitectura interna, número de parámetros y datos de entrenamiento; esta ficha indica explícitamente "no disponible" en aquellos campos que la model card y los metadatos no cubren. La licencia es un acuerdo propio (hi3d-open-license-agreement-v1.0), no una licencia open source estándar, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de refinamiento de geometría 3D; componentes transformer por resolución más un VAE compartido) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible (no es un modelo de texto; opera sobre imagen y malla) |
| Tipos de cuantización | FP16, INT8 (afín, cómputo FP16), INT4 (afín, cómputo FP16), W8A8 (INT8 nativo experimental en M5) |
| Idiomas soportados | en, zh |
| Licencia | hi3d-open-license-agreement-v1.0 (licencia propia, no estándar) |
| Formato de pesos | safetensors (repositorio MLX) |
| Resoluciones de extracción | 512³, 1024³, 1536³ (rejillas dispersas) |
| Librería / runtime | MLX 0.32.4 (stack registrado), Python 3.12 arm64 nativo |
| Hardware validado | Apple Silicon, familia M5, macOS con Metal (macOS 27.0.1 registrado) |
| Tamaño de descarga (512³, transformers + VAE compartido) | FP16 3,77 GiB · INT8 2,28 GiB · INT4 1,49 GiB · W8A8 2,38 GiB |
| Tamaño de descarga (1024³/1536³) | FP16 7,20 GiB · INT8 4,22 GiB · INT4 2,63 GiB · W8A8 4,41 GiB |
| Inferencia | El flag `inference: false` figura en la model card del repo; el uso se realiza vía el paquete `hi3d-mlx` |

## Arquitectura y entrenamiento

La model card describe el modelo como un refinador de geometría que combina una imagen de referencia con una malla gruesa para producir geometría detallada. La implementación MLX organiza el cómputo en transformers separados por resolución (uno para 512³ y otro para 1024³/1536³, que se descarga bajo demanda) más un VAE compartido entre variantes y dos codificadores de imagen fijados (pinned image encoders). Los checkpoints FP16 contienen tensores en FP16 y FP32; las variantes INT8 e INT4 son cuantización de pesos afín con cómputo en FP16, y W8A8 usa cómputo INT8 nativo experimental en M5.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF/DPO o ajuste por preferencias. Tampoco se documenta la arquitectura interna exacta (tipo de transformer, mecanismos de atención, etc.). El modelo no genera texturas ni la malla gruesa inicial: el pipeline asume que el usuario aporta ambos. La conversión de checkpoints desde el modelo original se realizó con herramientas que el autor mantiene privadas; el código de inferencia es público.

## Capacidades

- Refinamiento de geometría 3D a partir de una imagen de referencia y una malla gruesa existente.
- Extracción de mallas sobre rejillas dispersas a 512³, 1024³ y 1536³, con transformers dedicados por resolución.
- Salida en formato GLB, acompañada de un registro JSON con tiempos y memoria de la ejecución.
- Ejecución local en Apple Silicon mediante MLX, con selección de precisión (FP16, INT8, INT4, W8A8).
- API de Python además de la CLI, con soporte de uso offline y descarga selectiva de componentes.
- Soporte de idiomas de la interfaz/documentación: inglés y chino.
- No genera texturas ni color; las renders de la model card muestran normales de superficie, no material.
- No crea la malla gruesa inicial: requiere una entrada de partida.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo.

## Casos de uso

- Refinamiento de assets para videojuegos: partiendo de un bloqueo de baja poligonización y una imagen de referencia, el modelo produce una malla detallada a 512³ que sirve como base para retopología y texturizado posterior en el motor.
- Prototipado de producto en impresión 3D: a partir de un boceto renderizado y una malla gruesa, se obtiene geometría con más detalle para validar formas antes de fabricar, ejecutando todo en un portátil con chip M5.
- Conservación y digitalización de patrimonio: dado un modelo escaneado de baja resolución y una fotografía del objeto, se refina la geometría para documentación o visualización, manteniendo el proceso en local por confidencialidad.
- Previsualización en pipelines de diseño industrial: integración en un flujo CAD donde la malla gruesa proviene de una herramienta paramétrica y la imagen de referencia fija el estilo; el refinamiento a 1024³ aporta detalle para revisiones de diseño.
- Generación de variantes geométricas para datasets sintéticos: usar el modelo para producir mallas refinadas a partir de pares imagen/malla y alimentar entrenamientos de otros modelos 3D, aprovechando la salida GLB y el registro de tiempos.
- Despliegue en estaciones de trabajo Apple para equipos sin GPU NVIDIA: al ejecutarse sobre MLX en Apple Silicon, permite incorporar refinamiento 3D en entornos creativos que ya trabajan en macOS, con presets INT8 para reducir el espacio en disco a 2,28 GiB en 512³.
- Automatización por lotes vía API de Python: refinar colecciones de mallas con un script que recorra pares imagen/malla, seleccionando resolución y precisión según el presupuesto de memoria de cada máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (métricas tipo Chamfer, F-score, IoU de malla u otras) en la información disponible. La model card menciona 87 ejecuciones históricas, 68 mallas únicas y tres objetos de ejemplo (dragón, busto y locomotora), y ofrece mallas GLB descargables como evidencia, pero no presenta tablas numéricas comparativas. Tampoco se publican cifras de latencia o throughput más allá de los registros JSON por ejecución que genera la propia herramienta.

## Requisitos de hardware

- Hardware: Apple Silicon validado en la familia M5; requiere macOS con soporte Metal (stack registrado: macOS 27.0.1, MLX 0.32.4, Python 3.12 arm64 nativo).
- No está pensado para GPU NVIDIA ni CUDA; el runtime es MLX.
- Espacio en disco (descarga, no RAM pico): 512³ entre 1,49 GiB (INT4) y 3,77 GiB (FP16); 1024³/1536³ entre 2,63 GiB (INT4) y 7,20 GiB (FP16). Los codificadores de imagen, dependencias de Python y el overhead del runtime se suman aparte.
- La model card advierte explícitamente que el tamaño de descarga no equivale al pico de RAM; no se publica la cifra de memoria pico.
- Presets recomendados: FP16 como configuración de referencia; INT8 para reducir almacenamiento con buena concordancia observada; INT4 solo si prima el espacio, con deriva de calidad sustancial en los casos probados; W8A8 como opción experimental en M5.
- Despliegue: paquete `hi3d-mlx` instalado con `uv`, CLI `hi3d-mlx refine` y API de Python. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles como cifras publicadas; cada ejecución genera un JSON con tiempos y memoria.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos de refinamiento de geometría 3D comparables (parámetros, contexto, rendimiento, licencia) que permitan una comparativa rigurosa. La alternativa más directa es el modelo original hi3d-official/Hi3Dv1.0, del que este repositorio es un port cuantizado a MLX; sin embargo, no se publican cifras comparativas de calidad ni de rendimiento entre ambos. Por tanto, la comparativa se indica como no disponible.

## Limitaciones y advertencias

- El modelo solo refina geometría: no genera texturas, color ni la malla gruesa inicial; requiere ambas entradas del usuario.
- La licencia es un acuerdo propio (hi3d-open-license-agreement-v1.0), no una licencia open source estándar; es imprescindible revisar sus términos antes de cualquier uso comercial.
- El flag `inference: false` en la model card del repositorio puede afectar a la carga automática en algunas herramientas; el uso previsto es a través del paquete `hi3d-mlx`.
- Las herramientas de conversión de checkpoints son privadas, lo que limita la reproducibilidad del proceso de cuantización.
- La variante INT4 muestra "deriva de calidad sustancial" en los casos probados según el autor; no se recomienda para producción sin validación propia.
- W8A8 es experimental y específica de M5; su comportamiento en otros chips no está documentado.
- Validación limitada a Apple Silicon (familia M5); no hay datos de funcionamiento en otras plataformas.
- No se documentan sesgos, tasas de alucinación geométrica ni límites de idioma más allá del soporte en/zh de la documentación.
- Los assets de entrada y derivados conservan términos de terceros documentados en el dataset de resultados; hay que verificar su licencia por separado.
- El repositorio principal es ligero y los pesos viven en repositorios enlazados; conviene fijar la revisión (`v1.0.0`) para reproducibilidad.
- No se publican métricas de calidad geométrica ni comparativas con el modelo original, lo que dificulta evaluar la fidelidad del port.

## Enlaces

- Repositorio HuggingFace del port MLX: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx
- Modelo base original: https://huggingface.co/hi3d-official/Hi3Dv1.0
- Código fuente en GitHub: https://github.com/devin-lai/Hi3Dv1.0-mlx
- Colección Hi3D v1.0 (refinamiento 3D en Apple Silicon): https://huggingface.co/collections/devin-lai/hi3d-v10-3d-refinement-on-apple-silicon-6adf317e5c1d7d1672cd06f7
- Dataset de resultados (mallas y galerías): https://huggingface.co/datasets/devin-lai/Hi3Dv1.0-mlx-results
- Pesos FP16: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx-fp16
- Pesos INT8: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx-int8
- Pesos INT4: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx-int4
- Pesos W8A8: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx-w8a8
- VAE y configuraciones compartidas: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx-shared
- Guía de uso (USAGE.md, en el repo GitHub): https://github.com/devin-lai/Hi3Dv1.0-mlx/blob/main/USAGE.md
- README en chino simplificado: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx/blob/main/README.zh-CN.md
- Licencia: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx/blob/v1.0.0/LICENSE
