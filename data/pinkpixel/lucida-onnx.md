# PinkPixel/lucida-onnx

## Resumen

Lucida ONNX es un modelo de eliminación de fondo y matting suave (soft-alpha) publicado por PinkPixel como export ONNX autocontenido del modelo Lucida, desarrollado por Ege Orcun. Se basa en la arquitectura BiRefNet HR y está diseñado para resolver problemas comunes en modelos abiertos de eliminación de fondo: sujetos camuflados, superficies semitransparentes como vidrio o líquidos, texto fino, efectos VFX e ilustraciones en capas. El modelo recibe una imagen RGB de 1024x1024 píxeles y produce una máscara alfa de la misma resolución con valores entre 0 y 1, lo que permite conservar bordes suaves y transparencias. El archivo ONNX pesa aproximadamente 932 MB y puede ejecutarse en CPU, CUDA, DirectML, CoreML y WebGPU. Su relevancia radica en que ofrece una alternativa portable y sin dependencias de PyTorch para flujos de producción que necesitan recorte de imágenes de alta calidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet HR (fine-tune Lucida v7) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | FP32 (sin cuantizacion documentada) |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivo model.onnx) |

## Arquitectura y entrenamiento

Lucida ONNX es un export ONNX del modelo Lucida v7, que a su vez es un fine-tune de la arquitectura BiRefNet HR. La tarea principal es la eliminación de fondo y la extracción de máscaras alfa suaves, con especial atención a casos difíciles como camuflaje, superficies semitransparentes, tipografía fina y arte en capas. No se proporcionan detalles sobre el dataset de entrenamiento en la información disponible. La innovación técnica destacable de este export es que incluye la activación Sigmoid dentro del grafo ONNX, de modo que la salida ya viene en el rango [0.0, 1.0] sin necesidad de postprocesado adicional. El modelo se distribuye como un único archivo ONNX autocontenido, lo que simplifica su integración en entornos de producción que no requieren PyTorch.

## Capacidades

- Eliminación de fondo y recorte de sujetos con bordes suaves.
- Extracción de máscaras alfa para materiales semitransparentes (vidrio, líquidos, velos).
- Preservación de texto, logotipos y tipografía fina en imágenes.
- Manejo de sujetos camuflados que se confunden con el fondo.
- Segmentación de ilustraciones, arte digital y composiciones en capas.
- Generación de máscaras alfa para efectos visuales y composición.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de visión.

## Casos de uso

- Fotografía de producto para e-commerce: el modelo permite generar imágenes con fondo transparente de forma automática, lo que agiliza la creación de catálogos y anuncios.
- Edición de retratos con cabello suelto o rizado: la máscara alfa suave conserva los mechones y evita el efecto de recorte duro.
- Diseño gráfico y separación de tipografía: extrae texto y logotipos de fondos complejos sin erosionar las letras, útil para reutilizar recursos gráficos.
- Producción de efectos visuales (VFX): genera máscaras alfa para elementos semitransparentes como vidrio, humo o velos, facilitando la composición en postproducción.
- Print-on-demand y diseño de camisetas: limpia los bordes de ilustraciones y pegatinas para su impresión sobre distintos fondos.
- Automatización de marketing y publicidad: recorta imágenes de forma masiva para crear variaciones de anuncios con fondos personalizados.

## Benchmarks y rendimiento

Según el benchmark del autor (203 imágenes, 9 categorías, error absoluto medio, MAE, menor es mejor), Lucida v7 obtiene los siguientes resultados:

| Categoria | MAE (menor es mejor) |
|---|---|
| Camuflaje | 0.0270 |
| Ilustracion y arte | 0.0092 |
| Texto y logotipos | 0.0091 |
| Impresion y pegatinas | 0.0235 |
| Promedio general | 0.0257 |

El autor afirma que estos resultados superan a modelos especializados de código abierto y a referencias comerciales, pero no se proporcionan cifras comparativas en la información disponible.

## Requisitos de hardware

- VRAM estimada: no se dispone de datos oficiales. El archivo ONNX pesa aproximadamente 932 MB, por lo que en FP32 se necesita al menos esa cantidad de memoria para los pesos, más memoria para activaciones.
- GPU recomendadas: no se especifican. Para CUDA, se estima que una GPU NVIDIA con al menos 4 GB de VRAM (por ejemplo, RTX 3050 o superior) es adecuada.
- Compatibilidad con GPU de consumo: sí, el modelo es relativamente pequeño y puede ejecutarse en GPUs de consumo.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, CoreML, WebGPU). El repositorio incluye un script CLI `infer.py` para procesamiento por lotes.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Lucida ONNX es un fine-tune de BiRefNet HR, pero no se ofrecen cifras de parámetros, contexto ni rendimiento de modelos alternativos.

## Limitaciones y advertencias

- Es un modelo de visión únicamente; no procesa texto ni admite tool calling.
- La salida es una máscara alfa de 1024x1024 que se reescala a la resolución original, lo que puede introducir pérdida de detalle en bordes muy finos.
- No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.
- La licencia es Apache 2.0, lo que permite uso comercial, pero se deben respetar las atribuciones del modelo upstream (Lucida y BiRefNet son MIT).
- Al ser un export ONNX, puede haber diferencias de rendimiento respecto al modelo original en PyTorch.
- El repositorio de HuggingFace no registra descargas ni likes, lo que indica que es un modelo nuevo y con poca validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/PinkPixel/lucida-onnx
- Modelo original Lucida: https://huggingface.co/egeorcun/lucida
- Repositorio GitHub de Lucida: https://github.com/egeorcun/lucida
- Demo interactiva: https://huggingface.co/spaces/egeorcun/lucida-demo
- Arquitectura base BiRefNet HR: https://huggingface.co/ZhengPeng7/BiRefNet_HR
