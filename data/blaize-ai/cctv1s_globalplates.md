# Blaize-AI/CCTv1s_GlobalPlates

## Resumen

CCTv1s_GlobalPlates es un modelo de reconocimiento óptico de caracteres (OCR) especializado en matrículas de vehículos, desarrollado por Blaize-AI como una optimización del modelo original fast-plate-ocr. Está diseñado para ser rápido y ligero, con el objetivo de ejecutarse en aceleradores de inferencia edge Blaize Xplorer mediante el SDK Picasso. El modelo emplea una arquitectura Compact Transformer (CCT), propuesta por Hassani et al. en 2021, que reduce la complejidad computacional frente a los transformers convencionales manteniendo una buena precisión en tareas de visión.

El modelo se entrenó sobre el Global License Plate Dataset (GlobalPlates), un conjunto de datos a gran escala que abarca matrículas de 74 países, con más de 5 millones de imágenes. Aunque las imágenes no son públicas, el dataset está documentado en el artículo arXiv:2405.10949. La relevancia actual de este modelo radica en su capacidad para reconocer matrículas de múltiples regiones con un tamaño reducido, lo que lo hace adecuado para despliegues en dispositivos con recursos limitados, como cámaras de vigilancia o sistemas de peaje. La versión disponible en este repositorio está cuantizada en BF16 y acepta una resolución de entrada de 128×64 píxeles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Compact Transformer (CCT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | BF16 (disponible); INT8 y AMP mencionados pero sin archivos publicados |
| Idiomas soportados | no disponible (reconoce caracteres alfanumericos de matrículas de 74 paises) |
| Licencia | MIT (modelo); dataset GlobalPlates bajo CC-BY-NC-ND-4.0 |
| Formato de pesos | .bm (formato propietario Blaize) |

## Arquitectura y entrenamiento

La arquitectura se basa en los Compact Transformers (CCT), una variante eficiente de los transformers para tareas de visión que utiliza tokenización por parches y atención global con menor coste computacional que los ViT estándar. El modelo original fue desarrollado en el repositorio fast-plate-ocr y exportado a ONNX; Blaize-AI lo ha convertido y optimizado para su hardware Graph Streaming Processor (GSP), aplicando cuantización BF16 para reducir el tamaño y mejorar la latencia sin sacrificar precisión.

El entrenamiento se realizó sobre el Global License Plate Dataset, que contiene más de 5 millones de imágenes de matrículas de 74 países. No se han publicado detalles sobre el número exacto de tokens de entrenamiento, el proceso de aumento de datos o si se emplearon técnicas de fine-tuning adicionales. La licencia del dataset es CC-BY-NC-ND-4.0, lo que restringe su uso comercial y la creación de obras derivadas, aunque el modelo resultante se distribuye bajo MIT.

## Capacidades

- Reconocimiento de matrículas en imágenes: extrae el texto alfanumérico de placas de vehículos de distintos países.
- Soporte multirregional: entrenado con datos de 74 países, lo que permite reconocer formatos y tipografías variadas.
- Inferencia ligera: optimizado para ejecución en aceleradores edge con bajo consumo y latencia reducida.
- Cuantización BF16: ofrece alta precisión con un tamaño de modelo compacto (el archivo .bm es el único publicado).
- Sin capacidades de tool calling, agentes o razonamiento multi-paso: es un modelo de visión puro, no un LLM.

## Casos de uso

- Control de accesos en aparcamientos: el modelo puede integrarse en barreras de entrada y salida para leer automáticamente la matrícula de los vehículos y gestionar la apertura sin intervención manual. Su baja latencia permite responder en tiempo real.
- Peajes automáticos: en autopistas, el reconocimiento de matrículas permite facturar sin detener el vehículo. El modelo puede ejecutarse en el edge, reduciendo la dependencia de conexiones a la nube.
- Vigilancia de tráfico: cámaras de vigilancia equipadas con el modelo pueden detectar y registrar matrículas para control de velocidad, acceso restringido o seguimiento de vehículos.
- Seguridad en fronteras y controles policiales: ayuda a verificar matrículas en puntos de control, comparando con bases de datos de vehículos robados o buscados. Su soporte multirregional es útil en zonas fronterizas.
- Aplicaciones de movilidad urbana: sistemas de alquiler de vehículos o de gestión de flotas pueden usar el modelo para registrar entradas y salidas de vehículos en depósitos o zonas de estacionamiento regulado.
- Integración en sistemas de videovigilancia: combinado con un detector de vehículos, el modelo puede procesar flujos de video en tiempo real para extraer matrículas y alimentar sistemas de análisis posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como precisión, recall o comparativas con otros modelos de OCR de matrículas.

## Requisitos de hardware

- Hardware específico: requiere un acelerador Blaize Xplorer (Graph Streaming Processor) para ejecutar el archivo .bm.
- No es compatible con GPUs estándar (NVIDIA, AMD) ni con CPUs convencionales en este formato; el modelo original ONNX sí podría ejecutarse en otros entornos, pero no se proporciona.
- VRAM estimada: no aplica, al ser un acelerador edge con memoria integrada.
- Opciones de despliegue: exclusivamente mediante el Blaize Picasso SDK, que incluye herramientas como `blaize-modeltool` para inspeccionar el modelo.
- Latencia y throughput: no se proporcionan datos cuantitativos, pero el diseño está orientado a baja latencia y alta eficiencia energética.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (OCR de matrículas con arquitectura compacta) dentro de los datos proporcionados. No se puede realizar una comparativa objetiva sin referencias adicionales.

## Limitaciones y advertencias

- Licencia del dataset: aunque el modelo tiene licencia MIT, el dataset GlobalPlates está bajo CC-BY-NC-ND-4.0, lo que prohíbe su uso comercial y la redistribución de obras derivadas. Esto puede afectar a despliegues en entornos empresariales.
- Formato propietario: el archivo .bm solo funciona con hardware Blaize; no es portable a otras plataformas sin conversión manual (que requeriría el SDK y el modelo ONNX original).
- Cobertura geográfica: aunque se entrenó con 74 países, no se especifica el equilibrio entre regiones; es posible que algunos países o formatos de matrícula tengan menor precisión.
- Riesgo de errores: como todo sistema OCR, puede fallar con imágenes de baja calidad, ángulos extremos, condiciones de iluminación adversas o matrículas dañadas.
- Sin métricas publicadas: no hay benchmarks que permitan evaluar la precisión real del modelo, por lo que su rendimiento en producción es incierto.
- Dependencia del SDK: el uso requiere conocimientos del ecosistema Blaize Picasso, lo que añade una curva de aprendizaje y posible dependencia de un proveedor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blaize-AI/CCTv1s_GlobalPlates
- Repositorio original fast-plate-ocr: https://github.com/ankandrew/fast-plate-ocr
- Global License Plate Dataset: https://github.com/siddagra/Global-License-Plate-Dataset
- Paper Compact Transformers: https://arxiv.org/abs/2104.05704
- Paper Global License Plate Dataset: https://arxiv.org/abs/2405.10949 (DOI: https://doi.org/10.48550/arXiv.2405.10949)
- Sitio web de Blaize: https://www.blaize.com
