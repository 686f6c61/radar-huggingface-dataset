# Politus/white_goods_tr

## Resumen

Politus/white_goods_tr es un modelo de clasificación de texto basado en la arquitectura BERT, publicado en Hugging Face por el usuario Politus. Con 184.346.882 parámetros totales, se sitúa en el rango de los modelos BERT-large (aproximadamente 340 millones de parámetros) o variantes intermedias, y está empaquetado en formato safetensors con un tamaño de repositorio de 0,7 GB. El sufijo "tr" del identificador sugiere un ajuste fino orientado al turco, aunque la model card no lo confirma explícitamente.

La relevancia de este modelo es limitada en el momento de su publicación: cuenta con cero descargas y cero "likes", y su model card es la plantilla automática de Hugging Face sin cumplimentar. No se documenta el conjunto de datos de entrenamiento, el procedimiento de ajuste fino, los idiomas soportados ni la licencia. Esto lo convierte en un artefacto de investigación o un experimento personal más que en un modelo listo para producción.

El modelo se distribuye bajo la librería transformers y es compatible con text-embeddings-inference y endpoints compatibles, lo que facilita su despliegue técnico una vez validado. No obstante, la ausencia de documentación sobre datos, evaluación y licencia impide recomendarlo para uso comercial o para tareas críticas sin una auditoría previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder) |
| Parametros totales | 184.346.882 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el sufijo "tr" sugiere turco, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es BERT, un transformer encoder bidireccional orientado a tareas de comprensión del lenguaje. El tag `bert` y la pipeline `text-classification` confirman que se trata de un modelo encoder con una cabeza de clasificación, no de un modelo generativo. El número de parámetros (184 millones) es coherente con una variante intermedia entre BERT-base (110 millones) y BERT-large (340 millones), o con un BERT-base con un vocabulario ampliado.

No hay información disponible sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset, el uso de RLHF/DPO ni técnicas de optimización como decodificación especulativa o atención lineal. La model card no incluye hiperparámetros, régimen de precisión (fp32, fp16, bf16) ni detalles sobre el preentrenamiento o el ajuste fino. Tampoco se documenta si el modelo parte de un checkpoint multilingüe o de un BERT específico para turco.

## Capacidades

- Clasificación de texto: la pipeline declarada es `text-classification`, por lo que el modelo está diseñado para asignar etiquetas a secuencias de texto.
- Codificación de representaciones: al ser un encoder BERT, puede extraer embeddings contextuales para tareas downstream.
- Compatibilidad con text-embeddings-inference: permite servir el modelo como endpoint de embeddings o clasificación.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede desplegarse en la infraestructura de Hugging Face.
- Capacidades multilingües: no disponible; el sufijo "tr" sugiere turco pero no está confirmado.
- Tool calling / function calling: no disponible; no es una capacidad esperable en un modelo BERT de clasificación.
- Razonamiento multi-paso y agentes: no disponible; fuera del alcance de la arquitectura.
- Modo thinking, visión o audio: no disponible; no aplica.

## Casos de uso

- Clasificación de reseñas de productos de electrodomésticos: dado el nombre "white_goods" (línea blanca), el modelo podría emplearse para categorizar opiniones de clientes sobre electrodomésticos en turco, siempre que se valide su etiquetado real antes de producción.
- Moderación de contenido en foros de electrónica de consumo: un encoder BERT puede clasificar mensajes como spam, queja o consulta técnica con baja latencia en CPU.
- Enrutamiento de tickets de soporte: clasificar consultas entrantes por categoría (garantía, instalación, avería) para derivarlas al equipo adecuado, aprovechando la eficiencia de un modelo de 184 millones de parámetros.
- Análisis de sentimiento en encuestas de satisfacción: usar la cabeza de clasificación para etiquetar respuestas abiertas de clientes tras la compra de un electrodoméstico.
- Extracción de señales para sistemas de recomendación: generar embeddings de descripciones o reseñas que alimenten un motor de recomendación de productos.
- Filtrado previo en pipelines de anotación: preetiquetar grandes volúmenes de texto para reducir el coste de anotación humana, con revisión posterior por anotadores.
- Detección de duplicados o near-duplicates: comparar embeddings de textos breves para agrupar reseñas o incidencias similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,74 GB solo para pesos (184 millones de parámetros × 4 bytes), más activaciones y overhead del runtime.
- VRAM estimada en fp16/bf16: aproximadamente 0,37 GB para pesos, más overhead.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior puede servir el modelo con holgura.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM efectiva, incluidas GTX 1650 o RTX 3050.
- Despliegue en CPU: viable gracias al tamaño reducido; adecuado para servicios de baja concurrencia.
- Opciones de despliegue: transformers con PyTorch, text-embeddings-inference, endpoints compatibles de Hugging Face; ONNX Runtime si se exporta manualmente.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Politus/white_goods_tr | 184 M | no disponible | no disponible | Hugging Face |
| bert-base-multilingual-cased | 178 M | 512 tokens | Apache 2.0 | Hugging Face |
| dbmdz/bert-base-turkish-cased | 110 M | 512 tokens | MIT | Hugging Face |
| xlm-roberta-base | 278 M | 512 tokens | MIT | Hugging Face |

La comparación se basa en el tamaño y la arquitectura, no en rendimiento, ya que no hay benchmarks publicados para white_goods_tr. Los tres alternativos cuentan con documentación completa, licencia clara y amplio uso en la comunidad, ventajas que white_goods_tr no ofrece actualmente.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se ha documentado la composición del dataset ni análisis de sesgo.
- Riesgo de alucinación: bajo en sentido estricto al ser un clasificador, pero puede producir etiquetas erróneas con alta confianza si el dominio de entrada difiere del de entrenamiento.
- Limitaciones de contexto: no disponible; se desconoce la longitud máxima de secuencia soportada.
- Limitaciones de idioma: no disponible; el sufijo "tr" sugiere turco pero no está confirmado, y no se documentan otros idiomas.
- Restricciones de licencia: la licencia no está disponible, lo que impide determinar si el uso comercial está permitido. No debe desplegarse en producción sin aclarar este punto.
- Documentación ausente: la model card es la plantilla automática sin cumplimentar; no hay información sobre datos, entrenamiento, evaluación ni uso previsto.
- Madurez: cero descargas y cero "likes" en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- Recomendación: auditar el modelo con un conjunto de validación propio antes de cualquier uso, y contactar con el autor para obtener la licencia y los detalles de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Politus/white_goods_tr
- Paper de referencia citado en la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
