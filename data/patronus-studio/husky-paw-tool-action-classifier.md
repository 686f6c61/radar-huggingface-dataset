# patronus-studio/husky-paw-tool-action-classifier

## Resumen

Husky Paw Tool Action Classifier es un clasificador de texto multilingüe desarrollado por Patronus Studio, especializado en identificar la operación que realiza una llamada a herramienta (tool call) en sistemas de agentes de IA. Forma parte de la familia Husky, integrada en el stack de seguridad Patronus Protect, junto con Husky Sight (tipo de herramienta) y Husky Nose (propiedades de seguridad). El modelo resuelve un problema crítico en entornos de producción: determinar si una solicitud de herramienta es de lectura, escritura, listado, ejecución o red, lo que permite aplicar políticas de control de acceso y monitorización de agentes.

Está basado en mmBERT-small, una variante de ModernBERT con arquitectura transformer encoder, y cuenta con 140.643.846 parámetros. Su tamaño compacto y su licencia Apache 2.0 lo hacen adecuado para despliegues locales y en edge, con soporte para cuantización ONNX. La relevancia actual radica en el crecimiento de agentes autónomos que invocan herramientas de forma dinámica, donde la clasificación precisa de operaciones es esencial para la seguridad y el cumplimiento normativo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) basado en mmBERT-small |
| Parametros totales | 140.643.846 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (limitado por el tokenizador de mmBERT, típicamente 512 tokens) |
| Tipos de cuantizacion | FP32 (safetensors), FP16 (ONNX), int8 e int8_int4_embeddings (en repositorio Edge) |
| Idiomas soportados | aleman (de), ingles (en) evaluados; otros idiomas via backbone multilingue sin validacion activa |
| Licencia | Apache 2.0 (modelo derivado de mmBERT-small, MIT) |
| Formato de pesos | safetensors (FP32), ONNX (FP16), versiones cuantizadas en repositorio Edge |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ModernBERT, un transformer encoder optimizado para eficiencia y velocidad de inferencia, con atención bidireccional. Se parte del checkpoint jhu-clsp/mmBERT-small, que proporciona un backbone multilingüe compacto. La clasificación se realiza mediante una cabeza de clasificación de secuencia que produce logits sobre seis clases mutuamente excluyentes: `read`, `write`, `list`, `exec`, `network` y `unknown`.

El entrenamiento se llevó a cabo sobre un dataset multilingüe propio de Patronus, construido a partir de fuentes reales limpiadas por jueces humanos (sin heurísticas de palabras clave) y ejemplos generados internamente. Se aplicaron técnicas de aumento de datos para robustez: variantes Unicode, homoglifos, codificaciones (base64), etiquetas de sistema/usuario, etiquetas HTML, comentarios de código, ruido de espaciado, leetspeak y ruido de mayúsculas, así como combinaciones de estas. Además se usaron regularizadores como envoltorios de lenguaje natural, muestras contrafactuales y corpus de palabras desencadenantes para reducir correlaciones espurias. Se realizó deduplicación con similitud del 90% y protección de fuga entre entrenamiento y validación/test. Todas las aumentaciones se aplicaron por igual a ejemplos positivos y negativos para evitar sesgos de forma superficial.

## Capacidades

- Clasificación de operaciones de herramientas en texto: identifica si una solicitud es de lectura, escritura, listado, ejecución, red o desconocida.
- Soporte multilingüe básico: funciona en alemán e inglés evaluados; otros idiomas pueden funcionar a través del backbone multilingüe pero sin garantía.
- Robustez frente a ofuscación: maneja variantes Unicode, homoglifos, base64, etiquetas de sistema, HTML, comentarios y ruido de formato.
- Integración con pipelines de Hugging Face Transformers mediante `pipeline("text-classification")`.
- Exportación a ONNX FP16 y cuantizaciones int8 para despliegue en edge con baja latencia.
- Diseñado para uso en seguridad de agentes: enrutamiento de riesgo de herramientas, decisiones de puerta de ejecución, flujos de aprobación y monitorización en tiempo real.

## Casos de uso

- Enrutamiento de riesgo de herramientas en agentes: el modelo clasifica cada llamada de herramienta entrante para asignarla a una política de seguridad específica (por ejemplo, bloquear operaciones `exec` o `network` en entornos de baja confianza).
- Decisiones de puerta de ejecución (execution gate): antes de ejecutar una acción, el clasificador determina si la operación es de escritura o ejecución, permitiendo aprobación manual automática en flujos de CI/CD.
- Flujos de aprobación en plataformas de automatización: cuando un agente solicita escribir archivos o enviar datos por red, el modelo activa un mecanismo de aprobación humana o de política.
- Monitorización de runtime de agentes: en producción, se analizan los logs de llamadas a herramientas para detectar operaciones anómalas o no autorizadas, alimentando alertas de seguridad.
- Filtrado de prompts en aplicaciones de chat con herramientas: el modelo puede preclasificar la intención de una petición del usuario (p. ej., "listar archivos" vs. "ejecutar comando") para seleccionar el plugin adecuado.
- Auditoría de cumplimiento: clasificar retrospectivamente las operaciones realizadas por agentes para generar informes de actividad y detectar desviaciones de políticas.

## Benchmarks y rendimiento

Se han publicado resultados sobre un conjunto de test retenido (n = 2.914) con etiqueta única:

| Metrica | Valor |
|---|---|
| Exactitud (accuracy) | 0.946 |
| F1 (macro) | 0.937 |
| Precision (macro) | 0.936 |
| Recall (macro) | 0.938 |

F1 por clase:

| Clase | F1 |
|---|---|
| write | 0.962 |
| exec | 0.953 |
| read | 0.945 |
| list | 0.940 |
| network | 0.926 |
| unknown | 0.893 |

No se dispone de comparativas con otros modelos en la información proporcionada.

## Requisitos de hardware

- El modelo tiene 140 millones de parámetros, por lo que su huella de memoria es reducida.
- Estimación de VRAM: FP32 requiere aproximadamente 563 MB (140M × 4 bytes); FP16 unos 281 MB; int8 unos 140 MB. Estas cifras son cálculos teóricos basados en el número de parámetros, no mediciones oficiales.
- Es ejecutable en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) y también en CPU sin problemas para inferencia por lotes.
- Las versiones cuantizadas (int8, int8_int4_embeddings) están diseñadas para entornos edge con recursos limitados.
- Opciones de despliegue: Hugging Face Transformers, Optimum ONNX Runtime, y potencialmente vLLM o TGI (aunque al ser un encoder pequeño, la inferencia directa con Transformers es suficiente).
- Latencia: no se han publicado cifras oficiales, pero por el tamaño del modelo se espera una latencia de pocos milisegundos en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información pública sobre clasificadores de operaciones de herramientas comparables en el momento de redacción. La familia Husky incluye otros dos modelos (Husky Sight y Husky Nose) que cubren aspectos complementarios de la seguridad de agentes, pero no se han publicado especificaciones detalladas de los mismos. Se recomienda consultar el repositorio de Patronus para futuras actualizaciones.

## Limitaciones y advertencias

- Una predicción positiva describe una propiedad aparente de la entrada, no prueba que la acción se haya ejecutado realmente.
- El modelo no rastrea el flujo de información entre múltiples pasos del agente; solo clasifica cada llamada individual.
- Solo se han evaluado formalmente alemán e inglés; otros idiomas pueden presentar degradación de rendimiento.
- Existe riesgo de falsos positivos y negativos; para decisiones de alto impacto se recomienda combinar con políticas deterministas y umbrales calibrados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo derivado de mmBERT-small conserva los términos MIT del upstream; se debe mantener el aviso de copyright.
- El tamaño del repositorio es de 1.5 GB, que incluye múltiples formatos (safetensors, ONNX); el archivo de pesos principal FP32 ocupa aproximadamente 563 MB.

## Enlaces

- [Hugging Face: patronus-studio/husky-paw-tool-action-classifier](https://huggingface.co/patronus-studio/husky-paw-tool-action-classifier)
- [Hugging Face: Husky Paw Tool Action Classifier Edge (cuantizado)](https://huggingface.co/patronus-studio/husky-paw-tool-action-classifier-edge)
- [Blog de Patronus: Our AI-Security Model Zoo Is Now Open Source](https://patronus.studio/posts/our-ai-security-model-zoo-is-now-open-source)
- [Repositorio GitHub de Patronus Security](https://github.com/patronus-protect/patronus-security/blob/main/docs/assets.md)
- [Modelo base: jhu-clsp/mmBERT-small](https://huggingface.co/jhu-clsp/mmBERT-small)
