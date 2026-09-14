# Mohammed422/invoices-donut-model-v2

## Resumen

Mohammed422/invoices-donut-model-v2 es un modelo de comprensión de documentos publicado en HuggingFace por el usuario Mohammed422, orientado por su nombre y por el pipeline declarado (image-text-to-text) a la extracción de información estructurada a partir de imágenes de facturas. Con 202.091.960 parámetros (unos 202 M) y un repositorio de 1,6 GB en formato safetensors, se sitúa en la misma escala que los modelos de la familia Donut (encoder visual más decoder de tipo BART), aunque el autor no confirma la arquitectura base ni el procedimiento de entrenamiento.

La relevancia de este tipo de modelos radica en que la digitalización de facturas sigue siendo uno de los cuellos de botella más costosos en los departamentos de cuentas por pagar: un modelo de ~200 M de parámetros se puede ejecutar en CPU o en cualquier GPU de consumo, algo inviable con modelos de visión-lenguaje multimodales de miles de millones de parámetros.

Ahora bien, la información disponible es mínima y debe interpretarse con cautela. La model card es la plantilla automática de HuggingFace sin rellenar, no declara licencia ni idiomas, no incluye métricas de evaluación y el repositorio acumula 0 descargas y 0 likes. Cualquier evaluación de idoneidad para producción exige, por tanto, validar el modelo con datos propios antes de usarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (etiquetas del repo: `vision-encoder-decoder`, `image-text-to-text`); detalle de encoder y decoder no disponible |
| Parámetros totales | 202.091.960 (≈202 M), dato real de los pesos safetensors |
| Parámetros activos | No aplica (modelo denso, no es MoE); dato no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no la declara) |
| Formato de pesos | safetensors |
| Librería | transformers |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 1,6 GB |
| Descargas / likes | 0 / 0 (en el momento de la consulta) |
| Fecha de creación / actualización | 2026-09-14 / 2026-09-14 (según metadatos del Hub) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna ni sobre el proceso de entrenamiento de este modelo. Los únicos datos objetivos son las etiquetas del repositorio (`vision-encoder-decoder`, `image-text-to-text`), que describen una familia de modelos en la que un encoder visual procesa la imagen y un decoder autorregresivo genera la secuencia de texto de salida, normalmente JSON con los campos extraídos del documento. El nombre del repositorio sugiere que se trata de un ajuste fino de la familia Donut, pero el autor no lo confirma ni indica el checkpoint de partida.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, si hubo aprendizaje por refuerzo o DPO, ni los hiperparámetros de ajuste. La etiqueta `arxiv:1910.09700` que aparece en el Hub corresponde a Lacoste et al. (2019), el artículo sobre estimación de emisiones de carbono citado en la plantilla automática de model card, por lo que no documenta la arquitectura ni el entrenamiento de este modelo y no debe interpretarse como referencia técnica del mismo.

## Capacidades

La model card no enumera capacidades y no se han publicado evaluaciones. Las capacidades que se listan a continuación se infieren del pipeline declarado y del nombre del repositorio, y deben verificarse empíricamente antes de cualquier uso:

- Extracción de texto estructurado a partir de imágenes de facturas: se espera que el modelo reciba una imagen o un PDF renderizado y devuelva una secuencia de texto, habitualmente JSON, con campos como emisor, receptor, fecha, número de factura, base imponible, IVA y total.
- Procesamiento de documentos escaneados sin OCR externo: a diferencia de los modelos basados en LayoutLM, un vision-encoder-decoder consume la imagen directamente y no requiere un motor OCR previo.
- Extracción de líneas de detalle: previsiblemente capaz de transcribir tablas de conceptos, cantidades y precios, aunque no hay confirmación de ello.
- Generación condicionada por prompt: los modelos Donut se controlan mediante una tarea declarada en el texto de entrada; no se ha publicado qué tareas admite este ajuste.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; no es una capacidad típica de esta arquitectura.
- Capacidades multilingües: no disponibles; los idiomas no están declarados.
- Modo de razonamiento explícito (thinking), visión general, audio: no disponible.

## Casos de uso

- Automatización de cuentas por pagar: el modelo se integraría como primer paso del flujo, transformando cada PDF de factura recibido en un JSON con número de factura, NIF del proveedor, fecha e importe, que después se valida contra el pedido de compra en el ERP. Su tamaño de 202 M permite ejecutarlo en la misma máquina que el resto del pipeline sin GPU dedicada.
- Digitalización masiva hacia ERP (SAP, Odoo, Dynamics 365): uso como servicio de extracción que alimenta la API de contabilización, con una cola de documentos escaneados y una fase de revisión humana para los registros con baja confianza.
- Conciliación de pagos: extracción de IBAN, referencia y total de cada factura para cruzarlos automáticamente con los extractos bancarios, reduciendo el trabajo manual en tesorería.
- Gestión de notas de gastos: procesamiento de tickets y facturas simplificadas enviados por empleados desde el móvil, con extracción de comercio, fecha y cuota de IVA para su volcado al sistema de reembolsos.
- Auditoría fiscal y cumplimiento: extracción sistemática de base imponible, tipos de IVA y cuotas por línea de detalle para construir un libro registro auxiliar y detectar discrepancias antes de la presentación de impuestos.
- Indexación documental y búsqueda interna: conversión de facturas históricas a texto estructurado para alimentar un motor de búsqueda o un índice de recuperación sobre el archivo documental de la empresa.
- Investigación y ajuste fino propio: al ser un modelo pequeño sobre una arquitectura de comprensión de documentos, sirve como punto de partida económico para reentrenar con un corpus propio de facturas en un idioma o formato concretos, con coste de cómputo bajo y en una sola GPU.
- Clasificación y encaminamiento de documentos: uso combinado con reglas posteriores para separar facturas de albaranes, presupuestos u otros documentos dentro de un flujo de digitalización.

En todos los casos debe incorporarse validación determinista posterior (comprobación de NIF, sumas de líneas, cuadre de totales) porque no existen métricas publicadas de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso teórico de los parámetros: ≈808 MB en fp32, ≈404 MB en fp16/bf16, ≈202 MB en int8 y ≈101 MB en int4.
- VRAM estimada para inferencia: del orden de 1-2 GB con fp16 incluyendo activaciones y picos de memoria para imágenes de resolución moderada (estimación propia, no confirmada por el autor, ya que se desconoce la resolución de entrada configurada).
- GPU recomendadas: cualquier GPU con 4 GB o más; por ejemplo GTX 1650, RTX 3050, RTX 3060, RTX 4090, A10, L4. También cabe en CPU para volúmenes moderados.
- Cabe en GPU de consumo: sí, con holgura, en cualquiera con al menos 4 GB de VRAM, e incluso en modo solo CPU.
- Opciones de despliegue: transformers (PyTorch) como vía principal; el tag `endpoints_compatible` indica compatibilidad con HuggingFace Inference Endpoints; es posible exportar a ONNX mediante Optimum. El soporte en vLLM para arquitecturas vision-encoder-decoder es limitado y debe comprobarse. No hay versiones GGUF publicadas, por lo que Ollama y llama.cpp no están disponibles sin una conversión previa no trivial para este tipo de arquitectura.
- Latencia y throughput estimados: no disponibles, no se han publicado mediciones.
- El tamaño del repositorio (1,6 GB) duplica aproximadamente el peso teórico de los parámetros en fp32, lo que sugiere ficheros duplicados o copias en distinto formato; no está confirmado.

## Comparativa con modelos similares

Las cifras de los modelos alternativos provienen de su documentación pública y se marcan como aproximadas; deben verificarse en sus respectivas fichas antes de tomar decisiones.

| Modelo | Parámetros | Enfoque | Requiere OCR externo | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| Este modelo (invoices-donut-model-v2) | 202 M | Vision-encoder-decoder, extremo a extremo sobre la imagen | No | No disponible | No |
| naver-clova-ix/donut-base | ~200 M (aprox.) | Vision-encoder-decoder (Swin + BART) | No | MIT (a verificar) | Sí, en el paper de Donut |
| microsoft/layoutlmv3-base | ~133 M (aprox.) | Transformer multimodal texto+layout | Sí | A verificar (restringida en algunos casos) | Sí |
| Qwen2.5-VL-3B-Instruct | ~3.750 M (aprox.) | Modelo de visión-lenguaje generalista | No | Apache 2.0 (a verificar) | Sí |

Frente a Donut-base, este modelo no aporta información que permita determinar si el ajuste fino mejora la extracción de facturas: carece de métricas, de licencia declarada y de cualquier validación externa. Frente a un modelo de visión-lenguaje generalista como Qwen2.5-VL-3B, la ventaja es el coste de inferencia (unas 18 veces menos parámetros) y la especialización esperada en documentos; la desventaja es la ausencia total de garantías y de soporte multilingüe documentado.

## Limitaciones y advertencias

- Model card autogenerada y sin rellenar: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto, lo que impide auditar el modelo.
- Licencia no declarada: no puede asumirse uso comercial. Es imprescindible contactar con el autor o abstenerse de utilizarlo en producción.
- Sin ninguna validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay terceros que hayan reportado resultados.
- Riesgo alto de alucinación en campos críticos (NIF, IBAN, importes, fechas): la generación autorregresiva puede producir valores plausibles pero incorrectos, y no existen métricas que cuantifiquen la tasa de error.
- Idiomas no declarados: se desconoce si el ajuste cubre facturas en castellano o si está sesgado hacia otro idioma o formato.
- Sin datos de contexto ni de resolución de entrada: documentos densos o con tipografías pequeñas pueden sufrir pérdida de información por la resolución del encoder visual.
- Imposibilidad de desplegarlo en Ollama o llama.cpp sin conversión previa, al no existir pesos GGUF para esta arquitectura.
- Consideraciones de RGPD: las facturas contienen datos personales y fiscales; el tratamiento debe documentarse y, si se despliega en un servicio externo, comprobar la ubicación de los datos.
- Fechas de metadatos poco habituales (creación y actualización el mismo día, 2026-09-14) y ausencia de versionado, lo que dificulta la trazabilidad de cambios.
- El tamaño del repositorio (1,6 GB) no se corresponde con una única copia de los pesos, por lo que conviene inspeccionar los ficheros antes de descargarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mohammed422/invoices-donut-model-v2
- Perfil del autor: https://huggingface.co/Mohammed422
- Artículo citado en la etiqueta `arxiv:1910.09700` (Lacoste et al., 2019, estimación de emisiones; citado en la plantilla automática, no es la referencia técnica del modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto asociada a esa referencia: https://mlco2.github.io/impact
- Información adicional: no disponible. Las búsquedas web realizadas no devolvieron ningún resultado relacionado con este modelo; los únicos resultados obtenidos fueron páginas de inicio de sesión de Microsoft OneDrive, sin relación con el modelo.
