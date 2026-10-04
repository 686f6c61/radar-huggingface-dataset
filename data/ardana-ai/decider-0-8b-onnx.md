# ardana-ai/decider-0.8b-ONNX

## Resumen
decider-0.8b-ONNX es una versión cuantizada a int4 y exportada a ONNX del modelo Mapika/decider-0.8b, publicada por ardana-ai. Está pensada para ejecutarse en el navegador mediante onnxruntime-web y el proveedor de ejecución WebGPU, con el objetivo de llevar un modelo de lenguaje de aproximadamente 0,8 mil millones de parámetros al cliente sin depender de un servidor. El artefacto incluye el grafo ONNX y los pesos int4, entradas y salidas fp16, y solo los logits de la última posición.
La model card no detalla la arquitectura del modelo base, la longitud de contexto, los idiomas ni los datos de entrenamiento, por lo que la evaluación técnica queda limitada a la información de conversión y despliegue. Su relevancia actual radica en la tendencia a ejecutar modelos pequeños en el dispositivo, con privacidad y baja latencia, aunque la falta de benchmarks y de documentación del modelo base exige validación adicional antes de usarlo en producción.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica si es transformer, MoE, SSM o híbrida) |
| Parámetros totales | aproximadamente 0,8 mil millones (según el nombre del modelo; no confirmado en la model card) |
| Parámetros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int4 en los pesos; entradas y salidas fp16 según la model card |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (model.onnx, model.onnx.data) con pesos int4 |
| Modelo base | Mapika/decider-0.8b, revisión a0a01d6f8135298f400a8c856b355793012ae971 |
| Tamaño del repositorio | 0,5 GB |
| Proveedor de ejecución | WebGPU (onnxruntime-web) |
| Exportador | onnxruntime-genai 0.17.1 model builder |
| Plantilla de chat | incluida (chat_template.jinja) |

## Arquitectura y entrenamiento
La model card no especifica la arquitectura del modelo base. El artefacto ONNX sí describe un grafo exportado por onnxruntime-genai 0.17.1 para el proveedor WebGPU, con entradas y salidas en fp16, logits únicamente de la última posición, sin cabeza de predicción multi-token y con el embedding compartido con la LM head. Esto es compatible con un modelo de lenguaje causal con pesos atados, pero no se confirma explícitamente en la documentación.
No se documentan tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otro tipo de ajuste. La innovación principal del artefacto es la conversión a int4 para reducir la huella de memoria y permitir su ejecución en navegador mediante WebGPU, manteniendo la plantilla de chat y los ficheros de tokenización del modelo original sin cambios.

## Capacidades
- Generación de texto autoregresiva: el grafo produce logits de la última posición, lo que permite decodificación token a token.
- Conversación: incluye chat_template.jinja, aunque no se detalla su contenido ni si el modelo está alineado para instrucciones.
- Ejecución local en navegador: compatible con onnxruntime-web y WebGPU.
- Cuantización int4: reduce el tamaño de los pesos para su carga en cliente.
- No se documentan tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documenta soporte multilingüe ni lista de idiomas.
- No se documenta una cabeza de predicción multi-token.

## Casos de uso
Los siguientes escenarios asumen que el modelo base conserva las capacidades habituales de un modelo de lenguaje de 0,8B; no están confirmados por la model card.

- **Asistentes conversacionales en el navegador**: cargar model.onnx y model.onnx.data con onnxruntime-web y WebGPU, y gestionar el diálogo mediante chat_template.jinja. Los datos del usuario permanecen en el cliente, lo que reduce riesgos de privacidad.
- **Procesamiento de texto sensible en local**: resumen, extracción o clasificación de documentos sin enviarlos a un servidor. El tamaño de 0,5 GB y los pesos int4 permiten la carga en memoria del navegador en equipos de gama media.
- **Demos y prototipos de IA generativa en web**: integrar el modelo en una página sin backend, usando WebGPU para acelerar la inferencia. Es útil para validar interfaces y experiencia de usuario antes de invertir en infraestructura.
- **Extensiones de navegador**: inferencia local para autocompletado, reescritura o respuestas rápidas dentro de una extensión. Evita costes de API y dependencias de red.
- **Aplicaciones de escritorio tipo Electron o Tauri**: reutilizar el mismo artefacto ONNX con onnxruntime-web o con ONNX Runtime nativo. El tamaño reducido del modelo facilita su empaquetado.
- **Educación interactiva sin conexión**: tutores o asistentes locales que funcionan sin acceso a internet. El requisito de hardware es bajo en comparación con modelos mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: los pesos int4 de un modelo de 0,8B ocupan teóricamente alrededor de 0,4 GB (0,8 mil millones × 0,5 bytes), más el overhead de activaciones y caché KV. El repositorio completo ocupa 0,5 GB.
- GPU recomendadas: no se especifican modelos concretos. Se requiere una GPU con soporte de WebGPU para el proveedor principal.
- ¿Cabe en GPU de consumo? Sí, en principio cualquier GPU de consumo con WebGPU, incluidas integradas modernas.
- Opciones de despliegue: onnxruntime-web con WebGPU, onnxruntime-genai 0.17.1 y, en general, ONNX Runtime. También existe un fallback a WASM si no hay WebGPU.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| decider-0.8b-ONNX | aproximadamente 0,8 mil millones | no disponible | apache-2.0 | ONNX int4 | HuggingFace (0 descargas, 0 likes) |
| Mapika/decider-0.8b | aproximadamente 0,8 mil millones | no disponible | apache-2.0 | no disponible | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada otras alternativas comparables de 0,8B en ONNX para navegador.

## Limitaciones y advertencias
- La model card es muy escueta: no documenta sesgos, idiomas, longitud de contexto, datos de entrenamiento ni evaluaciones.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado benchmarks que permitan estimar su fiabilidad.
- La cuantización int4 puede degradar la calidad de las respuestas frente al modelo base.
- La ausencia de cabeza de predicción multi-token limita técnicas como la decodificación especulativa con MTP.
- Solo se devuelven logits de la última posición, lo que condiciona la integración con algunas herramientas de generación.
- La ejecución depende de WebGPU; sin soporte, el rendimiento puede caer al fallback WASM.
- La licencia apache-2.0 permite uso comercial, pero se debe verificar también la licencia y las condiciones del modelo base y de los datos de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, por lo que carece de validación comunitaria.
- La fecha de creación indicada en los metadatos es 2026, lo que puede deberse a un artefacto reciente o a un error de fecha.
- No hay información sobre tool calling, agentes, multilingüismo, visión, audio o modos de razonamiento especiales.

## Enlaces
- https://huggingface.co/ardana-ai/decider-0.8b-ONNX
- https://huggingface.co/Mapika/decider-0.8b
- https://huggingface.co/Mapika/decider-0.8b/tree/a0a01d6f8135298f400a8c856b355793012ae971
