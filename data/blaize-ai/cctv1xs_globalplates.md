# Blaize-AI/CCTv1xs_GlobalPlates

## Resumen

CCTv1xs_GlobalPlates es un modelo de reconocimiento óptico de caracteres (OCR) especializado en matrículas de vehículos, desarrollado por Blaize-AI como parte de su catálogo de modelos optimizados para sus aceleradores Xplorer. Se basa en el trabajo de ankandrew (fast-plate-ocr) y utiliza una arquitectura Compact Convolutional Transformer (CCT), descrita en el artículo "Escaping the Big Data Paradigm with Compact Transformers" (Hassani et al., 2021). El modelo está entrenado con el Global License Plate Dataset (GlobalPlates), un conjunto de más de 5 millones de imágenes de matrículas de 74 países, aunque este dataset no es público.

La relevancia de este modelo radica en su diseño para inferencia en el edge: está optimizado para ejecutarse en el Blaise Graph Streaming Processor (GSP), una arquitectura de procesamiento por grafos que prioriza baja latencia y alta eficiencia energética. El repositorio incluye una única variante en BF16 con resolución de entrada de 128×64 píxeles, en formato .bm específico de Blaize. No se proporcionan datos sobre el número total de parámetros ni sobre benchmarks públicos, lo que limita la comparación cuantitativa con otras soluciones de OCR de matrículas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Compact Convolutional Transformer (CCT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 128x64) |
| Tipos de cuantizacion | BF16 (unica variante publicada en este repo) |
| Idiomas soportados | no disponible (reconoce caracteres de matriculas de 74 paises) |
| Licencia | MIT (modelo); dataset de entrenamiento CC-BY-NC-ND-4.0 |
| Formato de pesos | .bm (Blaize), ONNX (original) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Compact Convolutional Transformer (CCT), que combina capas convolucionales con mecanismos de atención transformer para reducir el número de parámetros y la complejidad computacional respecto a los transformers estándar. Esta elección es adecuada para tareas de OCR en imágenes pequeñas (128×64), donde la extracción local de características es crítica. El modelo original fue desarrollado en ONNX por ankandrew dentro del proyecto fast-plate-ocr, y Blaize-AI lo ha convertido y optimizado para su hardware GSP.

El entrenamiento se realizó con el Global License Plate Dataset (GlobalPlates), descrito en el artículo arXiv:2405.10949. Este dataset contiene más de 5 millones de imágenes de matrículas de 74 países, con anotaciones para detección y reconocimiento. Sin embargo, las imágenes no están disponibles públicamente, lo que impide reproducir el entrenamiento. No se especifican detalles sobre el proceso de entrenamiento (número de épocas, aumentación de datos, funciones de pérdida) ni sobre técnicas de alineamiento como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) de matrículas de vehículos, incluyendo detección y transcripción de los caracteres alfanuméricos.
- Soporte para matrículas de 74 países, lo que cubre una amplia variedad de formatos, tipografías y diseños regionales.
- Inferencia optimizada para hardware edge de bajo consumo (Blaize Xplorer), con cuantización BF16 para equilibrar precisión y velocidad.
- Entrada de imagen de baja resolución (128×64), lo que reduce los requisitos de ancho de banda y memoria.
- Integración con el Blaize Picasso SDK, que permite construir y desplegar aplicaciones de visión por computador en el GSP.

No se documentan capacidades como tool calling, agentes o razonamiento multi-paso, ya que el modelo está especializado exclusivamente en OCR de matrículas.

## Casos de uso

- Control de accesos en aparcamientos privados: el modelo puede leer la matrícula de un vehículo en la entrada y cruzarla con una base de datos de autorizados, activando la barrera en tiempo real. Su baja latencia en el GSP lo hace adecuado para procesar el flujo continuo de vehículos.
- Peajes automáticos sin barrera (free-flow tolling): integrado en cámaras de peaje, identifica la matrícula y asocia el paso al vehículo para el cobro electrónico, funcionando en distintos países con formatos heterogéneos.
- Vigilancia y seguridad urbana: las cámaras de videovigilancia pueden detectar matrículas de vehículos sospechosos o robados, comparándolas con listas negras en tiempo real. El bajo consumo del GSP permite desplegarlo en nodos remotos sin necesidad de servidores centralizados.
- Gestión de flotas y logística: en almacenes o puertos, el modelo registra automáticamente la entrada y salida de vehículos de carga, alimentando sistemas de trazabilidad sin intervención manual.
- Análisis de tráfico y estudios de movilidad: procesa grabaciones de cámaras de tráfico para extraer estadísticas de flujo vehicular por matrícula, ayudando a planificar infraestructuras sin exponer datos personales (las matrículas se pueden anonimizar).
- Aplicaciones de estacionamiento regulado (zona azul): un dispositivo edge con el modelo puede verificar si un vehículo tiene permiso de estacionamiento válido, enviando alertas a los agentes de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como precisión, recall, exactitud por país ni comparaciones con otros modelos de OCR de matrículas. Tampoco se especifican valores de latencia o throughput en el hardware objetivo.

## Requisitos de hardware

- Acelerador requerido: Blaize Xplorer (basado en Graph Streaming Processor, GSP).
- Software: Blaize Picasso SDK, incluyendo la herramienta `blaize-modeltool` para inspeccionar el modelo.
- No se proporcionan cifras de VRAM, ya que el modelo se ejecuta en memoria del acelerador, no en GPU convencional.
- No es compatible con GPUs estándar (NVIDIA, AMD) ni con frameworks como vLLM, llama.cpp u Ollama, al estar empaquetado en formato .bm propietario.
- La resolución de entrada de 128×64 y la cuantización BF16 sugieren un uso de memoria reducido, pero no se dispone de datos concretos.
- Para desarrollo, se requiere acceso al hardware Blaize y al SDK correspondiente; no se ofrece una demo en la nube ni un pipeline estándar de HuggingFace.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de OCR de matrículas. El proyecto original fast-plate-ocr (ankandrew) es la referencia directa, pero no se publican sus métricas en este repositorio. Otros sistemas comerciales como los de ALPR (Automatic License Plate Recognition) de empresas como Plate Recognizer o Sighthound no son directamente comparables al no compartir benchmarks ni arquitecturas. Se recomienda evaluar el modelo en el hardware objetivo con un conjunto de validación propio.

## Limitaciones y advertencias

- El dataset de entrenamiento (GlobalPlates) no es público y está bajo licencia CC-BY-NC-ND-4.0, lo que restringe su uso comercial y la creación de obras derivadas. Aunque el modelo se distribuye bajo MIT, la procedencia de los datos de entrenamiento puede generar incertidumbre legal para aplicaciones comerciales.
- No se proporcionan métricas de precisión ni benchmarks, por lo que el rendimiento real en producción es desconocido.
- La única variante publicada es BF16; no hay versiones INT8 o AMP en este repositorio, a pesar de que la model card las menciona como métodos disponibles.
- El modelo está ligado al ecosistema Blaize (hardware y SDK). No es portable a otras plataformas sin una conversión que probablemente requiera herramientas propietarias.
- La resolución de entrada es fija (128×64). Imágenes con matrículas muy pequeñas, rotadas o con baja iluminación pueden degradar el rendimiento, aunque no hay datos al respecto.
- El reconocimiento cubre 74 países, pero no se especifica si hay sesgos geográficos o si ciertos formatos de matrícula (por ejemplo, los de países con alfabetos no latinos) están infrarrepresentados.
- No se ha publicado información sobre el riesgo de alucinación o errores de transcripción, algo crítico en aplicaciones de seguridad o cobro.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Blaize-AI/CCTv1xs_GlobalPlates
- Proyecto original fast-plate-ocr: https://github.com/ankandrew/fast-plate-ocr
- Global License Plate Dataset: https://github.com/siddagra/Global-License-Plate-Dataset
- Artículo Compact Transformers (Hassani et al., 2021): https://arxiv.org/abs/2104.05704
- Artículo Global License Plate Dataset (arXiv:2405.10949): https://doi.org/10.48550/arXiv.2405.10949
- Web de Blaize: https://www.blaize.com
