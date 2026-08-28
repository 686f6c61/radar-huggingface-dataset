# Oscilla/Ministral-3-3B-Instruct-2512-mlx-8Bit

## Resumen

El modelo Oscilla/Ministral-3-3B-Instruct-2512-mlx-8Bit es una conversión al formato MLX con cuantización de 8 bits del modelo Ministral-3-3B-Instruct-2512 de Mistral AI. Se trata de la variante más pequeña de la familia Ministral 3, un modelo multimodal que combina un modelo de lenguaje de aproximadamente 3.400 millones de parámetros con un codificador de visión de 400 millones de parámetros, diseñado para despliegues en el borde y entornos con recursos limitados.

La conversión fue realizada por el usuario Oscilla utilizando la librería mlx-lm en su versión 0.31.2, lo que permite ejecutar el modelo de forma nativa y eficiente en hardware Apple Silicon. Al estar cuantizado a 8 bits, el modelo reduce su huella de memoria a aproximadamente 3,7 GB, manteniendo un equilibrio razonable entre calidad y rendimiento para inferencia local.

El modelo hereda la licencia Apache 2.0 del modelo original y soporta once idiomas: inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe. Su relevancia actual radica en ofrecer capacidades multimodales (texto y visión) en un paquete compacto apto para dispositivos de gama media y aplicaciones de baja latencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión), familia Mistral 3 |
| Parametros totales | 964.525.056 según safetensors del repo MLX 8-bit; el modelo base declara ~3.400 millones de texto + 400 millones de visión |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base, Ministral-3-3B-Instruct-2512, es un modelo multimodal desarrollado por Mistral AI que combina un modelo de lenguaje de aproximadamente 3.400 millones de parámetros con un codificador de visión de 400 millones de parámetros. Esta arquitectura híbrida permite procesar tanto texto como imágenes, lo que lo convierte en una opción atractiva para aplicaciones que requieren comprensión visual en entornos con recursos limitados.

El modelo fue ajustado mediante instrucciones (instruction tuning) para optimizar su capacidad de seguir comandos y mantener diálogos multi-turno. La conversión a MLX realizada por Oscilla no modifica los pesos del modelo, sino que los transforma al formato nativo de Apple Silicon aplicando cuantización de 8 bits para reducir el tamaño y acelerar la inferencia. No se dispone de información detallada sobre los datos de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y seguimiento de instrucciones en once idiomas.
- Comprensión de imágenes (modalidad visión) gracias al codificador visual integrado, incluyendo razonamiento visual.
- Razonamiento multimodal: puede combinar información textual y visual para responder consultas complejas.
- Optimizado para despliegue en el borde y dispositivos con recursos limitados gracias a su tamaño compacto.
- Inferencia de baja latencia, adecuada para aplicaciones interactivas en tiempo real.
- Compatible con el ecosistema MLX de Apple Silicon y con vLLM para despliegue en servidores.
- Soporte de chat template integrado, lo que simplifica su integración en aplicaciones conversacionales.

## Casos de uso

- Asistentes virtuales en dispositivos móviles: el modelo puede ejecutarse localmente en iPhone o iPad gracias al formato MLX, ofreciendo respuestas en tiempo real sin necesidad de conexión a internet ni de enviar datos a la nube.
- Análisis de documentos con imágenes: al combinar texto y visión, puede extraer información de facturas, recibos o formularios escaneados, clasificando y estructurando los datos extraídos.
- Traducción y soporte multilingüe: con soporte para once idiomas, puede integrarse en aplicaciones de traducción automática o en sistemas de atención al cliente que atienden a usuarios de distintas regiones.
- Descripción automática de imágenes para accesibilidad: el modelo puede generar descripciones textuales de fotografías, útil en aplicaciones dirigidas a personas con discapacidad visual.
- Chatbots de atención al cliente: su capacidad de seguir instrucciones y mantener conversaciones coherentes lo hace adecuado para sistemas de soporte automatizado en entornos con presupuesto de cómputo limitado.
- Prototipado rápido de aplicaciones de IA: al ser un modelo pequeño y con licencia permisiva (Apache 2.0), es ideal para equipos que necesitan validar ideas de producto sin invertir en infraestructura de alto rendimiento.
- Procesamiento de texto en tiempo real en dispositivos embebidos: su baja latencia permite su uso en sistemas de transcripción o resumen automático que se ejecutan en hardware de gama baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un modelo en formato MLX, está optimizado para Apple Silicon (M1, M2, M3 y generaciones posteriores).
- La cuantización de 8 bits reduce la huella de memoria: el repositorio ocupa 3,7 GB, por lo que el modelo cabe en Macs con 8 GB de RAM unificada o más.
- Se puede ejecutar con la librería mlx-lm, que ofrece una API sencilla de carga y generación mediante `load` y `generate`.
- También es compatible con vLLM, lo que permite su despliegue en servidores con GPUs NVIDIA.
- Qualcomm ha publicado scripts de exportación optimizada para dispositivos con chips Snapdragon, lo que amplía las opciones de despliegue en el borde.
- Para uso en consumer GPU, el modelo cuantizado a 8 bits requiere aproximadamente 4-6 GB de VRAM, por lo que puede ejecutarse en GPUs como la RTX 3060 o superiores, aunque el formato MLX está pensado principalmente para Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Ministral-3-3B-Instruct-2512 (base) | ~3,8B (texto + visión) | no disponible | Sí | Apache 2.0 | safetensors original |
| Oscilla/Ministral-3-3B-Instruct-2512-mlx-8Bit | ~3,8B (cuantizado 8-bit) | no disponible | Sí | Apache 2.0 | MLX 8-bit |
| mlx-community/Ministral-3-3B-Instruct-2512 | ~3,8B | no disponible | Sí | Apache 2.0 | MLX (cuantización no especificada) |

## Limitaciones y advertencias

- La cuantización a 8 bits puede introducir una ligera degradación en la calidad de las respuestas en comparación con el modelo original en precisión completa.
- No se dispone de información sobre la longitud de contexto soportada, lo que puede limitar su uso en tareas que requieran ventanas de contexto largas.
- El modelo base es multimodal, pero no se ha verificado que la conversión MLX incluya correctamente los pesos del codificador de visión; se recomienda probar esta funcionalidad antes de usarla en producción.
- La información sobre benchmarks es inexistente, por lo que no se puede comparar su rendimiento cuantitativo con otros modelos de su categoría.
- Aunque la licencia Apache 2.0 permite uso comercial sin restricciones, el modelo base de Mistral AI puede tener términos de uso adicionales que conviene revisar en la página oficial del modelo original.
- El modelo está optimizado para Apple Silicon; su rendimiento en otras plataformas puede no ser óptimo.
- El dato de parámetros reportado por safetensors (964 millones) difiere significativamente del tamaño declarado del modelo base (~3.800 millones), lo que sugiere que la conversión MLX podría no incluir todos los pesos o que el conteo de safetensors es parcial.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Oscilla/Ministral-3-3B-Instruct-2512-mlx-8Bit
- Modelo base original: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Conversión MLX de la comunidad: https://huggingface.co/mlx-community/Ministral-3-3B-Instruct-2512
- Scripts de exportación para Qualcomm: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/ministral_3_3b_instruct_2512
