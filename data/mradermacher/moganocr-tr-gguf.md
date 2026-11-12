# mradermacher/MoganOCR-TR-GGUF

## Resumen

MoganOCR-TR-GGUF es una conversión a formato GGUF del modelo MoganOCR-TR, publicada por el usuario mradermacher en Hugging Face. Se trata de una cuantización estática del modelo original alojado en el repositorio moganai/MoganOCR-TR, orientada a su despliegue en entornos de inferencia locales mediante llama.cpp y herramientas compatibles con GGUF.

El modelo cuenta con 331.416.576 parámetros totales (aproximadamente 331 millones), lo que lo sitúa en la categoría de modelos pequeños, adecuados para ejecución en hardware de consumo. Por su nombre, está especializado en reconocimiento óptico de caracteres (OCR), con el sufijo "TR" que probablemente indica soporte o entrenamiento para turco, aunque este extremo no está confirmado en la información disponible.

La relevancia de esta ficha radica en que permite evaluar rápidamente un modelo OCR compacto y cuantizado, si bien la ausencia de model card detallada, licencia explícita y benchmarks limita significativamente las garantías para uso en producción. El repositorio ocupa 1,0 GB e incluye múltiples niveles de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 331.416.576 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible (el sufijo "TR" sugiere turco, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); pesos originales presumiblemente safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. El dato de parámetros (331.416.576) procede de los pesos en formato safetensors del modelo original, lo que confirma que se trata de un transformer de aproximadamente 331 millones de parámetros. No se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio GGUF se limita a indicar que se trata de cuantizaciones estáticas del modelo moganai/MoganOCR-TR, con la versión de cuantización 2 y conversión de tipo "hf".

## Capacidades

- Reconocimiento óptico de caracteres (OCR): la denominación del modelo indica especialización en extracción de texto a partir de imágenes, aunque no se detallan los formatos de entrada admitidos.
- Procesamiento de documentos: presumiblemente orientado a digitalización de texto impreso o escaneado.
- Soporte multilingüe: no confirmado; el sufijo "TR" apunta a un posible enfoque en turco.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión general o audio: no disponible.
- Generación de texto libre, código o matemáticas: no disponible como capacidad documentada.

## Casos de uso

- Digitalización de archivos escaneados: el modelo podría emplearse para convertir documentos en papel o PDF escaneados a texto editable, aprovechando su tamaño reducido para procesar lotes en hardware modesto.
- Extracción de texto en aplicaciones móviles o de borde: con 331 millones de parámetros y cuantizaciones Q4_K_M o Q5_K_M, cabría desplegarlo en dispositivos con recursos limitados para OCR en tiempo real.
- Procesamiento por lotes en servidores sin GPU dedicada: las cuantizaciones Q2_K y Q3_K permiten ejecución en CPU mediante llama.cpp, útil para pipelines de digitalización masiva con presupuesto ajustado.
- Preprocesamiento en pipelines de NLP: serviría como primer paso para convertir imágenes en texto antes de tareas posteriores de análisis, resumen o búsqueda.
- Integración en sistemas de gestión documental: digitalización de facturas, formularios o expedientes en entornos con requisitos de privacidad que exijan inferencia local.
- Prototipado e investigación en OCR: al ser un modelo pequeño y con múltiples cuantizaciones, resulta adecuado para experimentación académica y comparación de técnicas de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 331 millones de parámetros, en F16 se requieren aproximadamente 0,7 GB solo para pesos; en Q8_0 unos 0,35 GB; en Q4_K_M alrededor de 0,2 GB. El consumo total depende del contexto y del backend.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede alojar el modelo con holgura; también tarjetas de gama baja e integradas con suficiente memoria compartida.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con al menos 2 GB de VRAM, incluidas GTX 1650 o superiores.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF como llama-cpp-python; no se ha confirmado soporte en vLLM o TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos OCR comparables en la documentación proporcionada, ni de datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no especificada: la ausencia de licencia explícita impide confirmar si se permite el uso comercial; debe consultarse el repositorio original moganai/MoganOCR-TR antes de cualquier despliegue en producción.
- Idiomas no documentados: aunque el sufijo "TR" sugiere turco, no hay confirmación oficial sobre los idiomas cubiertos, lo que limita su uso en otros contextos lingüísticos.
- Sin benchmarks publicados: no existen métricas de precisión OCR, lo que impide evaluar su calidad frente a alternativas consolidadas.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto inexistente o distorsionado en imágenes de baja calidad, especialmente en cuantizaciones agresivas como Q2_K.
- Degradación por cuantización: las versiones Q2_K y Q3_K pueden perder precisión en tareas OCR sensibles al detalle; se recomienda Q5_K_M o superior para documentos complejos.
- Documentación mínima: la model card no detalla arquitectura, datos de entrenamiento ni limitaciones conocidas, lo que dificulta la evaluación técnica.
- Fecha de creación futura en los metadatos (2026-11-12): conviene verificar la autenticidad y vigencia del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MoganOCR-TR-GGUF
- Modelo original: https://huggingface.co/moganai/MoganOCR-TR
