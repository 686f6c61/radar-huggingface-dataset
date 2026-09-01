# DanKau/gliner2.5-base-v1-onnx

## Resumen

DanKau/gliner2.5-base-v1-onnx es una exportación a formato ONNX del modelo GLiNER2.5 base v1, desarrollado originalmente por Fastino y convertido por DanKau para su uso en el servicio de IA no estructurada de SecuPi (SPAI). GLiNER2.5 es un modelo de extracción de información de tipo *span-free* que predice directamente los límites de las entidades en lugar de puntuar una cuadrícula de spans de ancho fijo, lo que permite un escalado lineal con la longitud del documento.

Este checkpoint concreto es el miembro en inglés de la familia GLiNER2.5, basado en la arquitectura deberta-v3-base con 194 millones de parámetros. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para ejecutarse mediante ONNX Runtime desde Java u otros entornos sin dependencia de PyTorch. Su relevancia actual radica en que ofrece capacidades de reconocimiento de entidades nombradas (NER) zero-shot con un coste computacional predecible, lo que lo hace adecuado para despliegues en producción donde se necesita extraer entidades de documentos sin entrenamiento previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | deberta-v3-base (encoder) + cabezal de límites (BoundaryExtractor) |
| Parametros totales | 194 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportacion ONNX sin cuantizar) |
| Idiomas soportados | ingles (el checkpoint base es deberta-v3-base, entrenado principalmente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder.onnx, boundary.onnx, classifier.onnx) |

## Arquitectura y entrenamiento

GLiNER2.5 emplea una arquitectura de predicción de límites (*boundary architecture*) que se diferencia de los enfoques tradicionales de GLiNER basados en puntuación de spans. En lugar de enumerar y puntuar todos los spans posibles, el modelo predice directamente dónde comienzan y terminan las entidades, lo que reduce la complejidad computacional de cuadrática a lineal respecto a la longitud del documento. El encoder es deberta-v3-base, que procesa un prompt estructurado con las etiquetas seguidas del texto a analizar.

El modelo se compone de tres archivos ONNX separados: el encoder (deberta-v3-base), el cabezal de límites completo (que incluye el codificador de límites, el cabezal de consultas, el pool de candidatos y el puntuador de pares) y el clasificador (una red Linear(768→1536) → ReLU → Linear(1536→1)). Durante la exportación se resolvieron dos obstáculos técnicos: la operación `torch.sort(..., stable=True)` no tiene símbolo ONNX directo, por lo que se plegó la posición en la clave para preservar la estabilidad; y `torch.eye` con dtype booleano no tiene kernel en ONNX Runtime, sustituyéndose por una comparación con `arange`. El modelo fue verificado contra PyTorch nativo con diferencias máximas de 1,72e-05.

## Capacidades

- Reconocimiento de entidades nombradas (NER) zero-shot: identifica entidades a partir de etiquetas arbitrarias proporcionadas en el prompt, sin necesidad de entrenamiento específico.
- Extracción de relaciones: al predecir límites de entidades, puede utilizarse como base para tareas de extracción de relaciones.
- Clasificación restringida: el archivo `classifier.onnx` permite clasificar el estado oculto en marcadores `[L]` para tareas de clasificación de texto con un conjunto de etiquetas definido.
- Procesamiento de texto en inglés: el modelo está entrenado principalmente para texto en inglés, dado su encoder deberta-v3-base.
- Inferencia eficiente: la arquitectura *span-free* escala linealmente con la longitud del documento, a diferencia de los enfoques basados en spans que escalan cuadráticamente.
- Despliegue sin PyTorch: al estar en formato ONNX, puede ejecutarse desde Java, C#, Python u otros lenguajes mediante ONNX Runtime.

## Casos de uso

- Redacción de informes médicos: extraer entidades como nombres de fármacos, dosis, síntomas y diagnósticos de informes clínicos no estructurados, utilizando etiquetas definidas por el equipo médico sin necesidad de entrenar un modelo específico.
- Análisis de contratos legales: identificar partes contratantes, fechas, cláusulas de confidencialidad y montos económicos en documentos legales, con etiquetas adaptadas al dominio jurídico.
- Atención al cliente automatizada: extraer nombres de productos, números de pedido y motivos de reclamación de conversaciones de soporte para enrutar tickets o alimentar sistemas de respuesta automática.
- Cumplimiento normativo y privacidad: detectar datos personales (nombres, direcciones, DNI, correos electrónicos) en documentos corporativos para aplicar políticas de anonimización, como hace SecuPi en su servicio SPAI.
- Procesamiento de currículos (CV): extraer habilidades, experiencia laboral, formación académica y datos de contacto de currículos en formato libre para sistemas de selección de personal.
- Monitorización de noticias y redes sociales: identificar organizaciones, personas, lugares y eventos en flujos de noticias o publicaciones para alimentar sistemas de inteligencia de negocio o alertas tempranas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta exportacion ONNX concreta. Sin embargo, segun la ficha del modelo base en TheresAnAIForThat, GLiNER2.5 Base obtiene una puntuacion media de F1 de 54,87 en 16 benchmarks de extraccion de informacion. La verificacion de la exportacion ONNX contra PyTorch nativo reporta diferencias maximas de 1,72e-05 en las salidas, lo que indica una fidelidad practicamente identica al modelo original.

## Requisitos de hardware

- Tamano del repositorio: 0,7 GB, lo que indica que el modelo completo cabe en memoria de una GPU consumer moderna.
- VRAM estimada para inferencia: aproximadamente 1-2 GB para el modelo en FP32, dependiendo de la longitud del texto y el numero de etiquetas. Con cuantizacion a FP16 o INT8, el consumo se reduciria proporcionalmente.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3060, etc.) puede ejecutar el modelo. Para despliegues de alto rendimiento, se recomiendan GPUs de centro de datos como A10, A100 o H100.
- Compatibilidad con GPU consumer: si, el modelo cabe en GPUs consumer de gama media y baja.
- Opciones de despliegue: ONNX Runtime (Python, Java, C#), ONNX Runtime Web (WebGPU/WASM) para inferencia en navegador, o integracion en pipelines de servicios Java como hace SecuPi.
- Latencia y throughput: no disponible en la informacion proporcionada, pero al ser un modelo de 194M parametros con arquitectura lineal, se espera una latencia de decenas de milisegundos en GPU para textos cortos.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| DanKau/gliner2.5-base-v1-onnx | 194M | deberta-v3-base + BoundaryExtractor | ONNX | Apache 2.0 | no disponible |
| fastino/gliner2.5-base-v1 (original) | 194M | deberta-v3-base + BoundaryExtractor | PyTorch | Apache 2.0 | no disponible |
| DanKau/g2.5-multi-v1-onnx | no disponible | mDeBERTa + BoundaryExtractor | ONNX | Apache 2.0 | no disponible |
| DanKau/gliner2-multi-v1-onnx | no disponible | GLiNER2 multi | ONNX | Apache 2.0 | no disponible |

La principal diferencia con el modelo original de Fastino es el formato de serialización: esta exportacion ONNX elimina la dependencia de PyTorch en tiempo de ejecucion, lo que facilita su integracion en entornos Java, .NET o navegadores. La version multilingue (g2.5-multi-v1-onnx) utiliza mDeBERTa y tiene ids de tokens especiales diferentes (250102-250111 frente a 128001-128010), por lo que no son intercambiables sin ajustar la configuracion.

## Limitaciones y advertencias

- El modelo esta entrenado principalmente para texto en ingles; su rendimiento en otros idiomas puede ser significativamente inferior.
- La longitud de contexto no esta documentada en la informacion disponible, por lo que se recomienda validar el comportamiento con textos largos antes de desplegarlo en produccion.
- El umbral de decision para considerar un candidato como entidad debe ajustarse por etiqueta y caso de uso; el valor por defecto puede no ser optimo para todos los dominios.
- El pool de candidatos contiene spans solapados de la misma etiqueta; es necesario aplicar una politica de supresion de solapamientos (mantener el de mayor puntuacion) para obtener resultados limpios.
- Los ids de tokens especiales difieren entre la version en ingles y la multilingue; no deben hardcodearse, sino leerse de `gliner2_config.json`.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos de la licencia del modelo base original de Fastino para confirmar que no hay restricciones adicionales.
- No se proporcionan datos de latencia, throughput ni requisitos de memoria en la informacion disponible; se recomienda realizar pruebas de carga antes de un despliegue a gran escala.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DanKau/gliner2.5-base-v1-onnx
- Modelo base original: https://huggingface.co/fastino/gliner2.5-base-v1
- Exportacion multilingue: https://huggingface.co/DanKau/g2.5-multi-v1-onnx
- Exportacion GLiNER2 multilingue: https://huggingface.co/DanKau/gliner2-multi-v1-onnx
- Ficha del modelo en TheresAnAIForThat: https://theresanaiforthat.com/model/gliner2-5-base-v1/
- Exportacion ONNX WebGPU de GLiNER2.5: https://github.com/Pastel-Org/gliner2.5-onnx-webgpu
