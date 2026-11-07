# addiesam/Ripple-65B-Preview-QVB8R-2e-3

## Resumen

Ripple-65B-Preview-QVB8R-2e-3 es un paquete de pesos cuantizados del modelo Ripple-65B-Preview de Ricursive AI, generado por el usuario addiesam mediante la técnica QVB8R (QVB8 con codificación entrópica). No se trata de un modelo entrenado de forma independiente, sino de una compresión con cota certificada L∞: cada peso restaurado queda a una distancia máxima de tau = 0.002 respecto al valor bf16 original. El paquete está pensado para cargarse con el motor de inferencia QVB8, no con `transformers`.

El modelo base, Ripple-65B-Preview, es un modelo de propósito general de Ricursive Intelligence, preentrenado sobre 12 billones de tokens y con soporte de hasta 1M tokens de contexto. Ricursive lo describe como una variante del modelo propietario que alimenta su plataforma de diseño de chips, por lo que su perfil de uso está orientado a razonamiento técnico y contextos muy largos.

La relevancia de este paquete concreto reside en su enfoque de compresión: frente a cuantizaciones habituales que no garantizan el error por peso, QVB8R registra el error máximo por tensor en `manifest.json` y asegura que ninguno supera tau. El resultado ocupa 35,5 GiB en disco con una media de 4,70 bits por peso en los 642 tensores comprimidos, lo que facilita el despliegue del modelo de 65B en infraestructuras más modestas sin renunciar a una cota de error verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de propósito general; detalles no publicados) |
| Parametros totales | 65B (modelo base); el paquete safetensors declara 1.664.080 parámetros en metadatos, dato no representativo del modelo completo |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1M tokens (modelo base) |
| Tipos de cuantizacion | QVB8R (QVB8 con codificación entrópica), tau = 0.002, media de 4,70 bits por peso en tensores comprimidos |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con `custom_code`, empaquetado QVB8R; requiere el motor QVB8, no cargable directamente en `transformers` |

## Arquitectura y entrenamiento

El paquete no incluye información sobre la arquitectura interna del modelo base; la model card de Ricursive menciona únicamente que la arquitectura fue optimizada para sus plataformas de entrenamiento y servicio, sin detallar si se trata de un transformer denso, MoE o una variante híbrida. El preentrenamiento del modelo base cubre 12 billones de tokens y soporta contextos de hasta 1M tokens. No se han publicado datos sobre composición del dataset, uso de RLHF o DPO, ni innovaciones técnicas concretas más allá de la optimización arquitectónica mencionada.

La innovación destacable de este paquete es el proceso de compresión QVB8R: cada matriz de pesos se empaqueta con un ancho de bits por fila y se verifica tras el empaquetado, registrando el error máximo (`max_err`) por tensor en `manifest.json`. El proceso no utiliza datos de calibración, depende solo de los pesos, y garantiza que ningún tensor supera tau = 0.002 respecto al valor bf16 original. Se comprimen 642 tensores con una media de 4,70 bits por peso. El autor respalda el método con dos artículos sobre compresión con cota L∞ certificada.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Ripple-65B-Preview.
- Procesamiento de contextos muy largos, de hasta 1M tokens según las especificaciones del modelo base.
- Uso orientado a razonamiento técnico y diseño de chips, según el posicionamiento de Ricursive para el modelo original.
- Compresión con error certificado: cada peso restaurado queda dentro de tau del original, lo que permite auditar la fidelidad del paquete tensor a tensor.
- Soporte de decodificación con drafter: el motor QVB8 acepta un paquete `MODEL` y un paquete `DRAFT`, lo que sugiere decodificación especulativa.
- Tool calling, function calling, capacidades de agente, multilingüismo, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un modelo de 65B en hardware con menos memoria: el paquete ocupa 35,5 GiB en disco frente al peso bf16 del modelo original, lo que permite servirlo en GPUs de 48 GB o en configuraciones multi-GPU más ajustadas, usando el motor QVB8.
- Procesamiento de documentos extensos: con hasta 1M tokens de contexto en el modelo base, es adecuado para analizar bases de código completas, expedientes largos o corpus documentales en una sola pasada.
- Asistencia en diseño de hardware: al derivar del modelo que alimenta la plataforma de diseño de chips de Ricursive, encaja en flujos de generación y revisión de especificaciones técnicas, RTL o documentación de ingeniería.
- Investigación sobre compresión de modelos: el paquete sirve como referencia reproducible para estudiar cuantización con cota L∞, comparando `max_err` por tensor con otras técnicas de cuantización.
- Evaluación de motores de inferencia alternativos: permite probar el motor QVB8 y su modo con drafter en cargas de trabajo reales de generación de texto.
- Auditoría de fidelidad de pesos: en entornos donde se exige trazabilidad del error de cuantización, el `manifest.json` permite verificar que ningún tensor excede tau antes de desplegar.
- Generación de texto conversacional en producción: con licencia Apache-2.0 y un pipeline declarado de text-generation, puede integrarse en servicios de chat siempre que se valide el comportamiento del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el paquete ocupa 35,5 GiB en disco; se requiere al menos esa cantidad de memoria para cargar los pesos comprimidos, más overhead del motor QVB8 para caché KV y activaciones.
- La caché KV para contextos de hasta 1M tokens puede dominar el consumo de memoria; no se dispone de cifras concretas de VRAM para ese escenario.
- GPU recomendadas: no disponible. Por tamaño, encaja en GPUs de 48 GB (A6000, L40S) o en configuraciones multi-GPU de 24 GB (RTX 4090, A5000); no se confirma compatibilidad ni rendimiento en ninguna de ellas.
- No cabe en GPUs de consumo de 8-16 GB en su totalidad; requeriría particionado u offload, no documentado.
- Opciones de despliegue: exclusivamente el motor QVB8 (https://github.com/addiesam/qvb8). No es compatible con vLLM, llama.cpp, Ollama ni TGI según la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Ripple-65B-Preview-QVB8R-2e-3 | 65B (base) | 1M (base) | QVB8R, 35,5 GiB | Apache-2.0 | Motor QVB8 |
| ricursiveAI/Ripple-65B-Preview | 65B | 1M | bf16 | Apache-2.0 | `transformers` y ecosistema estándar |
| Otras cuantizaciones del mismo modelo base | 65B | 1M | no disponible | Apache-2.0 | no disponible |

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparación se limita a formato, tamaño y vía de despliegue.

## Limitaciones y advertencias

- El paquete no es cargable con `transformers`; depende del motor QVB8, lo que limita la integración con herramientas estándar y añade un punto único de dependencia.
- El error de cuantización está acotado por tensor (tau = 0.002), pero no se documenta el impacto agregado de esos errores en la calidad de generación.
- La media de 4,70 bits por peso implica una compresión agresiva; conviene validar la calidad frente al modelo bf16 en las tareas objetivo.
- El número de parámetros declarado en los metadatos safetensors (1.664.080) no coincide con el tamaño del modelo base (65B); hay que tratarlo con cautela al planificar recursos.
- No se especifican idiomas soportados, sesgos conocidos ni tasas de alucinación del modelo base.
- La licencia Apache-2.0 se hereda del modelo base y del motor, pero el autor no ofrece garantía alguna; revisar el disclaimer del README del motor antes de usarlo en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de funcionamiento en distintos entornos.
- La fecha de creación del repositorio (2026-11-07) y la falta de documentación independiente sobre el modelo base limitan la verificación externa de las afirmaciones de la model card.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-2e-3
- Modelo base en Hugging Face: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Página del modelo base en Ricursive: https://www.ricursive.com/ripple
- Motor de inferencia QVB8: https://github.com/addiesam/qvb8
- Paper I (DOI): https://doi.org/10.5281/zenodo.23815007
- Paper II (DOI): https://doi.org/10.5281/zenodo.23816044
