# alztrk/Ornith-1.5-35B-A3B-Abliterated-GGUF

## Resumen

Ornith-1.5-35B-A3B-Abliterated es un modelo de lenguaje de tipo MoE (Mixture of Experts) con 35.000 millones de parámetros totales y 3.000 millones de parámetros activos, derivado del modelo base ornith-ai/Ornith-1.5-35B-A3B. Este modelo ha sido sometido a un proceso de "abliteration" (ablación direccional) sobre sus 40 capas híbridas, que elimina ortogonalmente las direcciones de rechazo en las matrices de proyección de atención y MLP. El resultado es un modelo que presenta menos restricciones de contenido y respuestas menos evasivas ante solicitudes controvertidas.

La versión GGUF que nos ocupa es una suite de cuantización dinámica oficial publicada por alztrk, diseñada para ejecución local eficiente en herramientas como Ollama, LM Studio y llama.cpp. El modelo soporta inglés, turco y chino, y se distribuye bajo licencia Apache 2.0. Su relevancia radica en ofrecer una alternativa de código abierto con un buen equilibrio entre rendimiento y requisitos de hardware, especialmente en su variante cuantizada Q4_K_M que ocupa aproximadamente 19,71 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 40 capas híbridas |
| Parametros totales | 34.660.610.688 |
| Parametros activos | 3.000.000.000 (A3B) |
| Longitud de contexto | 8192 tokens (según ejemplo de inferencia) |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_M, Q8_0 (dinámicas) |
| Idiomas soportados | Inglés, turco, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura MoE con 40 capas híbridas, donde cada capa combina mecanismos de atención y MLP. La versión "Abliterated" se obtiene mediante cirugía de ablación direccional: se proyectan ortogonalmente las direcciones de rechazo fuera de las matrices de down-projection de atención y MLP. Esta técnica elimina selectivamente los patrones de negativa aprendidos durante el entrenamiento, manteniendo el resto de capacidades del modelo.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas de RLHF o DPO. El proceso de cuantización dinámica aplicado en esta versión GGUF optimiza la precisión por capa, asignando mayor resolución a las capas más sensibles y menor a las redundantes, lo que permite reducir el tamaño del modelo sin pérdidas significativas de rendimiento.

## Capacidades

- Generación de texto conversacional y continuada en inglés, turco y chino.
- Soporte de diálogo multi-turno con formato de chat (ChatML).
- Menor tendencia a rechazar solicitudes controvertidas o sensibles debido al proceso de abliteration.
- Inferencia eficiente gracias a la arquitectura MoE con solo 3B parámetros activos.
- Compatible con herramientas de inferencia local como Ollama, LM Studio y llama.cpp.
- Cuantizaciones dinámicas que permiten ajustar el equilibrio entre memoria y precisión.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en un ordenador personal con GPU de 12-16 GB VRAM usando la cuantización Q4_K_M, ofreciendo respuestas fluidas sin depender de servicios en la nube.
- Generación de contenido creativo: su menor censura lo hace adecuado para escribir ficción, guiones o explorar temas tabú en narrativa, donde otros modelos rechazan la solicitud.
- Soporte multilingüe en atención al cliente: puede gestionar conversaciones en inglés, turco y chino, permitiendo a empresas atender usuarios en estos idiomas con un único modelo local.
- Investigación en alineación y seguridad: el proceso de abliteration lo convierte en un objeto de estudio interesante para analizar cómo se comportan los modelos sin direcciones de rechazo.
- Prototipado rápido de aplicaciones de chat: gracias a su formato GGUF y compatibilidad con Ollama, se puede integrar en proyectos con pocas líneas de código.
- Entornos con requisitos de privacidad: al ejecutarse localmente, los datos no salen del dispositivo, lo que lo hace apto para aplicaciones que manejan información sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 12-16 GB para la cuantización Q4_K_M (~19,71 GB), 16-24 GB para Q5_K_M (~23,03 GB), 8-12 GB para Q3_K_M (~15,61 GB) y 24-40 GB para Q8_0 (~34,37 GB).
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 o cualquier GPU con al menos 12 GB de VRAM para la versión Q4_K_M.
- En consumer GPU: sí, cabe en GPUs de gama alta como RTX 3080/3090/4090 con la cuantización adecuada.
- Opciones de despliegue: Ollama, LM Studio, llama.cpp, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible, pero al ser MoE con 3B activos, la velocidad de generación es significativamente mayor que un modelo denso de 35B.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. Se recomienda consultar el modelo base ornith-ai/Ornith-1.5-35B-A3B para más detalles.

## Limitaciones y advertencias

- El proceso de abliteration reduce las salvaguardas de seguridad, lo que puede generar contenido inapropiado, ofensivo o peligroso si se usa sin supervisión.
- La ventana de contexto de 8192 tokens es limitada para tareas que requieran documentos largos o conversaciones extensas.
- Solo soporta tres idiomas (inglés, turco y chino), lo que limita su uso en otros mercados.
- No se han publicado benchmarks oficiales, por lo que su rendimiento real en tareas estándar es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener atribuciones adicionales que deben verificarse.
- El tamaño del repositorio (99,6 GB) incluye todas las cuantizaciones; descargar solo el archivo necesario es recomendable.

## Enlaces

- [HuggingFace: alztrk/Ornith-1.5-35B-A3B-Abliterated-GGUF](https://huggingface.co/alztrk/Ornith-1.5-35B-A3B-Abliterated-GGUF)
- [Modelo base: alztrk/Ornith-1.5-35B-A3B-Abliterated](https://huggingface.co/alztrk/Ornith-1.5-35B-A3B-Abliterated)
- [Modelo original: ornith-ai/Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
