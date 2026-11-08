# minhtandangtt/Qwen2.5-14B-Instruct-abliterated-v2-Q4KM

## Resumen

`minhtandangtt/Qwen2.5-14B-Instruct-abliterated-v2-Q4KM` es una cuantización GGUF de 4 bits (Q4_K_M) de un modelo derivado de Qwen2.5-14B-Instruct, la familia de modelos de lenguaje de gran escala desarrollada por Alibaba Qwen. La variante "abliterated-v2" indica que se ha aplicado una técnica de eliminación de direcciones de rechazo (abliteration) sobre el modelo instruct original, un procedimiento que modifica los pesos para reducir la tendencia del modelo a negarse a responder determinadas peticiones. El resultado se ha empaquetado en formato GGUF con cuantización Q4_K_M, orientado a inferencia local en hardware de consumo.

El modelo base Qwen2.5-14B-Instruct es un transformer decoder-only denso de aproximadamente 14.770 millones de parámetros (14,77 B), con una ventana de contexto nativa de 32.768 tokens y soporte de hasta 131.072 tokens mediante configuración extendida. Esta cuantización concreta reduce el peso del modelo a unos 18 GB de repositorio, lo que permite ejecutarlo en GPUs de consumo con 12-24 GB de VRAM según la configuración y el contexto.

La relevancia de esta ficha radica en que se trata de un artefacto de cuantización de un modelo "abliterated", una categoría que interesa a desarrolladores que necesitan modelos sin filtros de rechazo para investigación, generación creativa sin restricciones o experimentación con alineamiento. No obstante, el autor no ha publicado model card sustantiva, benchmarks ni documentación sobre el proceso de abliteration, por lo que muchos datos técnicos quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (basado en Qwen2.5-14B-Instruct) |
| Parametros totales | 14.770.033.664 (14,77 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativo en Qwen2.5-14B-Instruct; hasta 131.072 con configuración extendida (no verificado en esta cuantización) |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles en este repo |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen2.5 soporta múltiples idiomas (chino, inglés, y otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-14B-Instruct, un transformer decoder-only denso con atención causal estándar, normalización RMSNorm y activación SwiGLU, tal como corresponde a la familia Qwen2.5. El modelo base fue entrenado por Alibaba Qwen sobre un corpus multilingüe de gran escala (el equipo de Qwen reporta 18 billones de tokens para la familia Qwen2.5) y posteriormente sometido a ajuste supervisado y optimización por preferencias (RLHF/DPO) para producir la variante Instruct. No se dispone de detalles específicos sobre la composición del dataset de esta cuantización concreta.

Sobre el modelo Instruct se ha aplicado una técnica de "abliteration" (versión v2), que consiste en identificar y restar la dirección latente asociada a los comportamientos de rechazo en el espacio de activaciones o pesos, reduciendo la probabilidad de que el modelo emita negativas ante peticiones sensibles. El autor no documenta la metodología exacta, el conjunto de datos de calibración ni las métricas de degradación asociadas. Posteriormente, los pesos resultantes se cuantizaron a Q4_K_M, un esquema de cuantización por bloques que mantiene los tensores más sensibles en mayor precisión y comprime el resto, con una pérdida de calidad típicamente moderada respecto al modelo en FP16. No se han documentado innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-14B-Instruct.
- Razonamiento y resolución de problemas de complejidad media-alta.
- Generación y comprensión de código en múltiples lenguajes de programación.
- Matemáticas y cálculo simbólico básico-intermedio.
- Soporte de tool calling / function calling (capacidad del modelo base Qwen2.5-Instruct).
- Capacidad de seguir instrucciones estructuradas y formatos de salida (JSON, tablas, etc.).
- Multilingüismo: el modelo base soporta chino, inglés y otros idiomas; el alcance exacto en esta cuantización no está documentado.
- Comportamiento "abliterated": reducción de rechazos ante peticiones que el modelo original declinaría, orientado a investigación y generación sin restricciones.
- No se documenta soporte de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo la eliminación de direcciones de rechazo afecta al comportamiento, comparando respuestas con el Qwen2.5-14B-Instruct original en experimentos controlados.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles sin las negativas del modelo alineado, ejecutable localmente en una GPU de consumo.
- Evaluación de robustez de filtros: desarrolladores de sistemas de moderación pueden usar el modelo como generador adversario para probar sus clasificadores de contenido.
- Asistente conversacional local: despliegue en estaciones de trabajo con 16-24 GB de VRAM mediante llama.cpp u Ollama para conversaciones multi-turno con contexto de hasta 32K tokens.
- Generación de código en entornos aislados: integración en pipelines de desarrollo sin conexión gracias al formato GGUF y a la licencia Apache 2.0, que permite uso comercial.
- Experimentación con cuantización: comparación de la calidad Q4_K_M frente al modelo en FP16 para decidir el equilibrio calidad/tamaño en despliegues con VRAM limitada.
- Fine-tuning y destilación: uso como modelo profesor o base para experimentos de ajuste sobre comportamientos sin filtros, dado que la licencia Apache 2.0 no impone restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas en la model card, y no se dispone de evaluaciones de la variante abliterated ni de la cuantización Q4_K_M. Los benchmarks del modelo base Qwen2.5-14B-Instruct pueden consultarse en la model card oficial de Qwen, pero no son directamente extrapolables a esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-11 GB para los pesos Q4_K_M, más overhead de contexto KV cache; con contexto de 32K tokens se recomienda 16-24 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 4080 (16 GB) o RTX 3090 (24 GB) para contexto completo; A100/H100 para despliegues de producción con alta concurrencia.
- Cabe en GPU de consumo: sí, en GPUs con 12 GB o más usando contexto reducido; con 16-24 GB se puede mantener contexto largo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles; dependerán del hardware y del backend. Como referencia cualitativa, un modelo denso de 14B en Q4_K_M suele generar decenas de tokens por segundo en una RTX 4090, pero no se ha medido para esta cuantización concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| minhtandangtt/Qwen2.5-14B-Instruct-abliterated-v2-Q4KM | 14,77 B | 32K (nativo) | GGUF Q4_K_M | Apache 2.0 | Variante abliterated, sin benchmarks publicados |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | 32K (nativo) | safetensors | Apache 2.0 | Modelo base alineado, con benchmarks oficiales |
| Qwen/Qwen2.5-14B | 14,77 B | 32K (nativo) | safetensors | Apache 2.0 | Modelo base sin ajuste instruct |
| Otras variantes abliterated de Qwen2.5-14B | 14,77 B | 32K (nativo) | safetensors/GGUF | Apache 2.0 | Múltiples autores; calidad variable según metodología |

No se dispone de datos de rendimiento comparativo para esta cuantización concreta frente a las alternativas.

## Limitaciones y advertencias

- La abliteration puede degradar capacidades generales del modelo (razonamiento, coherencia, seguimiento de instrucciones) respecto al Instruct original; el autor no reporta métricas de degradación.
- Riesgo elevado de generar contenido dañino, ofensivo o inexacto al haberse reducido los mecanismos de rechazo; no es adecuado para aplicaciones orientadas al público sin capas de moderación externas.
- Riesgo de alucinación inherente a los modelos de 14B, potencialmente agravado por la cuantización Q4_K_M y por la modificación de pesos.
- La cuantización Q4_K_M introduce una pérdida de precisión respecto a FP16, especialmente en tareas de matemáticas y código de alta precisión.
- Idiomas soportados no documentados en esta model card; el comportamiento multilingüe puede diferir del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin filtros conlleva responsabilidad legal y ética sobre el contenido generado.
- Repositorio sin descargas ni likes en el momento de la consulta, sin model card sustantiva ni documentación del proceso de abliteration; la reproducibilidad y el soporte son limitados.
- Fecha de creación del repositorio en 2026-11-08, posterior a la consulta; verificar la integridad de los pesos antes de usarlos en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/minhtandangtt/Qwen2.5-14B-Instruct-abliterated-v2-Q4KM
- Modelo base Qwen2.5-14B-Instruct: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Modelo base Qwen2.5-14B: https://huggingface.co/Qwen/Qwen2.5-14B
