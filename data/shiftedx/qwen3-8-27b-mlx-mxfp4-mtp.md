# Shiftedx/Qwen3.8-27B-MLX-MXFP4-MTP

## Resumen

El modelo `Shiftedx/Qwen3.8-27B-MLX-MXFP4-MTP` es un paquete experimental de cuantización para el modelo de lenguaje Qwen3.8-27B, desarrollado por el usuario Shiftedx. Está diseñado específicamente para el ecosistema MLX de Apple, utilizando cuantización MXFP4 de 4 bits con grupo de tamaño 32, e incorpora un sidecar con 15 tensores MTP (Multi-Token Prediction) en BF16 para habilitar decodificación especulativa. El paquete es solo de texto, sin pesos de visión, y se distribuye bajo licencia Apache-2.0.

La relevancia de este modelo radica en su capacidad para ejecutar un modelo de 27 mil millones de parámetros en hardware Apple Silicon con un uso reducido de memoria, gracias a la cuantización MXFP4 y a la aceleración por decodificación especulativa. Sin embargo, al ser un artefacto experimental, su validación es parcial: las pruebas estructurales y de generación pasaron, pero una suite de evaluación más amplia obtuvo una puntuación de 6/10, y no se ha completado la paridad con el modelo original. No se recomienda su uso en producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: Qwen3.8-27B) |
| Parametros totales | 27B (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP4, 4-bit, group size 32 |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX), paquete MTPLX |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura interna del modelo base Qwen3.8-27B ni sobre su proceso de entrenamiento. El paquete es una cuantización del modelo original, que conserva la arquitectura del transformer subyacente. La innovación principal de este artefacto es la combinación de cuantización MXFP4 (4 bits) con un sidecar de tensores MTP en BF16, lo que permite decodificación especulativa con una profundidad recomendada de 3. El paquete está construido a partir de la revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del modelo base y requiere la librería MTPLX 2.0.1 o superior. No se incluyen pesos de visión, por lo que el modelo es exclusivamente de texto.

## Capacidades

- Generación de texto y conversación: el modelo es capaz de producir texto coherente y mantener diálogos multi-turno, según las pruebas de generación realizadas.
- Decodificación especulativa (MTP): incorpora 15 tensores MTP nativos en BF16 que permiten acelerar la inferencia mediante predicción de múltiples tokens, con una profundidad especulativa recomendada de 3.
- Solo texto: no incluye capacidades de visión ni procesamiento multimodal.
- Integración con MLX: diseñado para ejecutarse en el ecosistema MLX de Apple, lo que facilita su uso en Macs con Apple Silicon.
- No se documentan capacidades adicionales como tool calling, function calling, razonamiento multi-paso o soporte de agentes en la información disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en una Mac con Apple Silicon para ofrecer un chatbot privado sin conexión, aprovechando la cuantización MXFP4 para reducir el uso de memoria y la decodificación especulativa para mejorar la velocidad de respuesta.
- Generación de contenido creativo: puede utilizarse para redactar textos, artículos, guiones o ideas creativas, aunque su calidad no está plenamente validada y se recomienda supervisión humana.
- Resumen de documentos: al ser un modelo de lenguaje de gran tamaño, puede resumir textos extensos, aunque la longitud de contexto no está especificada y podría ser limitada.
- Asistencia en programación: puede ayudar a generar fragmentos de código, explicar conceptos o depurar errores, aunque no se ha confirmado su rendimiento en tareas de código.
- Traducción automática: como modelo multilingüe potencial (no confirmado), podría emplearse para traducir entre idiomas, pero no hay datos sobre los idiomas soportados.
- Experimentación e investigación: dado su carácter experimental, es útil para probar técnicas de cuantización MXFP4 y decodificación especulativa en MLX, así como para comparar rendimiento con otras cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que una "suite dura" obtuvo una puntuación de 6/10, pero no se detallan métricas específicas ni comparaciones con otros modelos. No se dispone de datos de MMLU, HumanEval, GSM8K u otros estándares.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 15.2 GB, lo que sugiere que los pesos cuantizados ocupan aproximadamente esa cantidad. Se recomienda una Mac con al menos 16 GB de memoria unificada, siendo 32 GB o más lo ideal para margen y contexto adicional.
- GPU recomendadas: cualquier Mac con Apple Silicon (M1, M2, M3, M4) con suficiente memoria unificada. No es compatible con GPUs NVIDIA o AMD, ya que MLX está restringido a hardware Apple.
- Opciones de despliegue: el paquete se utiliza mediante la librería MTPLX (versión 2.0.1 o superior), que gestiona la carga, la cuantización y la decodificación especulativa. También puede integrarse con MLX directamente.
- Latencia y throughput: no se proporcionan datos numéricos. La decodificación especulativa con profundidad 3 debería reducir la latencia en comparación con la generación autoregresiva estándar, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otras cuantizaciones del mismo modelo base o con alternativas de tamaño similar en el ecosistema MLX. Se carece de datos de rendimiento y benchmarks para establecer una comparativa objetiva.

## Limitaciones y advertencias

- Modelo experimental: la model card lo marca como experimental y requiere un reconocimiento explícito del riesgo al usarlo (`--unsafe-force-unverified`).
- Validación incompleta: la suite de evaluación amplia obtuvo 6/10, y no se ha completado la paridad con el modelo original. La velocidad especulativa no debe interpretarse como garantía de calidad.
- Salida no confiable: se advierte que la salida del modelo debe tratarse como no confiable; no se deben incluir secretos en las indicaciones y se debe mantener el servidor en localhost salvo que se configure autenticación.
- Solo texto: no incluye pesos de visión, por lo que no puede procesar imágenes ni vídeo.
- Idiomas no especificados: no se indica qué idiomas soporta, lo que limita su uso en aplicaciones multilingües sin verificación previa.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero se aplican las limitaciones del modelo base Qwen3.8-27B, que no se detallan en la información proporcionada.
- Requisitos de software: necesita MTPLX 2.0.1 o superior, y está limitado a hardware Apple Silicon, lo que restringe su portabilidad.

## Enlaces

- [HuggingFace: Shiftedx/Qwen3.8-27B-MLX-MXFP4-MTP](https://huggingface.co/Shiftedx/Qwen3.8-27B-MLX-MXFP4-MTP)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
