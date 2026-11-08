# Benxelua/SMALL-Baselines

## Resumen

SMALL-Baselines es un repositorio de pesos e infraestructura de inferencia para cuatro arquitecturas de mejora de imágenes en condiciones de baja luminosidad (low-light image enhancement, LLIE): Retinexformer, CPGA-Stable, CIDNet y FusionNet. Lo publica el usuario Benxelua en Hugging Face y su función no es la de un modelo generativo de lenguaje, sino la de un paquete reproducible de checkpoints entrenados con tres tamanos de recorte (256, 512 y 1024 píxeles) para tareas de image-to-image sobre pares de imágenes de baja luz y referencia.

El repositorio incluye 12 checkpoints de mejor validación, código fuente de las arquitecturas e inferencia, y un fichero `config.json` que documenta los ajustes declarados en la sección 5.2 del manuscrito asociado. Según la model card, el paquete proporciona únicamente código de inferencia, no un pipeline de entrenamiento, y los checkpoints se conservan tal y como se generaron originalmente.

Su relevancia actual radica en que agrupa en un único artefacto de 0,3 GB varias líneas base de LLIE con recortes de distinto tamano, lo que facilita comparaciones controladas entre arquitecturas sin necesidad de reentrenar. No obstante, el repositorio carece de licencia declarada, de idiomas soportados y de resultados de benchmarks publicados en la información disponible, lo que limita su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cuatro arquitecturas de image-to-image para LLIE: Retinexformer, CPGA-Stable, CIDNet y FusionNet |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoints en PyTorch, presumiblemente fp32/fp16) |
| Idiomas soportados | no disponible (no aplica, tarea de imagen) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch), checkpoints en `weights/<modelo>/crop<256|512|1024>/best.pt` |

## Arquitectura y entrenamiento

El paquete agrupa cuatro arquitecturas distintas de mejora de imagen en baja luminosidad. Retinexformer es una red basada en el modelo Retinex con atención transformer para estimar la iluminación y restaurar la reflectancia. CPGA-Stable y CIDNet corresponden a variantes de redes con módulos de agregación de contexto y preservación de color, mientras que FusionNet sigue un esquema de fusión multi-escala. No se dispone en la información proporcionada de detalles sobre el número de parámetros, la composición exacta del dataset de entrenamiento ni el número de épocas, más allá de que se emplearon recortes de 256, 512 y 1024 píxeles y de que el dataset de referencia está alojado en Mendeley Data (vnz4gcw8wk/1).

La model card indica que el `config.json` recoge los ajustes declarados en la sección 5.2 del manuscrito y que se ofrece como documentación, no como registro de ejecución original. El paquete incluye código de inferencia en `source/` con un script `infer.py` que permite seleccionar modelo, checkpoint, imagen de entrada y dispositivo (CPU o CUDA), conservando las dimensiones originales de la imagen mediante padding temporal que se elimina tras la inferencia. No se documentan técnicas de RLHF, DPO ni decodificación especulativa, ya que no aplican a esta tarea.

## Capacidades

- Mejora de imágenes en condiciones de baja luminosidad mediante image-to-image.
- Cuatro arquitecturas seleccionables: Retinexformer, CPGA-Stable, CIDNet y FusionNet.
- Tres tamanos de recorte de entrenamiento por arquitectura (256, 512, 1024), lo que permite evaluar el efecto del tamano de parche.
- Inferencia en CPU y GPU (`--device cpu` o `--device cuda`).
- Preservación de las dimensiones originales de la imagen de entrada mediante padding temporal eliminado tras la inferencia.
- Procesamiento de pares baja luz/referencia con transformaciones espaciales idénticas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Comparación de líneas base en investigación LLIE: cargar los 12 checkpoints y evaluar cada arquitectura con los tres recortes sobre un mismo conjunto de validación para medir el efecto del tamano de parche y de la arquitectura.
- Reproducción de resultados de manuscrito: usar `config.json` como referencia de los ajustes declarados en la sección 5.2 y contrastar los checkpoints con los resultados publicados.
- Preprocesado para pipelines de visión nocturna: aplicar Retinexformer o CIDNet a imágenes de cámaras de vigilancia con poca luz antes de pasarlas a un detector o clasificador.
- Mejora de fotografía móvil en post-proceso: integrar el script `infer.py` en una etapa offline que normalice la iluminación de imágenes capturadas con poca luz.
- Restauración de imágenes médicas o científicas de baja exposición: emplear FusionNet o CPGA-Stable para mejorar el contraste preservando el color antes de análisis posteriores.
- Docencia y formación: usar el paquete como ejemplo práctico de comparación de arquitecturas de image-to-image con distintos recortes de entrenamiento.
- Prototipado rápido en CPU: ejecutar la inferencia con `--device cpu` para validar la viabilidad de la mejora en entornos sin GPU antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que los 12 checkpoints pasaron una carga estricta localmente, lo cual no establece la reproducción de todos los resultados de benchmark del manuscrito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende de la arquitectura concreta y del tamano de la imagen de entrada, no solo del recorte de entrenamiento.
- GPU recomendadas: no disponibles en la información proporcionada; el script admite cualquier dispositivo CUDA.
- Compatibilidad con GPU de consumo: no confirmada; el repositorio pesa 0,3 GB, lo que sugiere que los checkpoints son manejables en GPUs de consumo, pero no se especifica VRAM mínima.
- Opciones de despliegue: inferencia mediante `source/infer.py` con PyTorch (CPU o CUDA). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a esta tarea).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de LLIE (por ejemplo, Zero-DCE, KinD, URetinex-Net o SCI) que permitan una comparación rigurosa de parámetros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican términos de uso comercial; el repositorio indica que no reemplaza las licencias de los autores originales y que los avisos de terceros se conservan en `third_party/` cuando están disponibles.
- Sin benchmarks publicados: no se puede verificar el rendimiento real frente a las cifras del manuscrito; la carga estricta de checkpoints no equivale a reproducción de resultados.
- No es un pipeline de entrenamiento: solo se ofrece código de inferencia, lo que impide reentrenar o ajustar los modelos con este paquete.
- `config.json` es documentación, no un registro de ejecución: los ajustes pueden no coincidir exactamente con los runs originales.
- Sin idiomas soportados ni parámetros declarados: la ficha no puede caracterizar el modelo en términos de tamano o cobertura lingüística.
- Riesgo de artefactos y alucinaciones visuales: como todo modelo de image-to-image, puede introducir colores o texturas no presentes en la escena original, especialmente en zonas muy oscuras.
- Advertencia de transformaciones: la model card exige aplicar transformaciones espaciales idénticas a ambas imágenes de un par baja luz/referencia; ignorarlo invalida la evaluación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Benxelua/SMALL-Baselines
- Dataset de referencia (Mendeley Data): https://data.mendeley.com/datasets/vnz4gcw8wk/1
