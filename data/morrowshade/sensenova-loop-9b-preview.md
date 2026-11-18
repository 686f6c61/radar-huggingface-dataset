# morrowshade/SenseNova-Loop-9B-Preview

## Resumen

SenseNova-Loop-9B-Preview es un modelo de lenguaje multimodal (texto e imagen como entrada, texto como salida) publicado por el usuario morrowshade en Hugging Face, con arquitectura propietaria `sensenova_loop`. El modelo se presenta como un decoder autorregresivo de aproximadamente 9,6 mil millones de parámetros totales, aunque el autor documenta un cómputo de inferencia equivalente a unos 14,6 mil millones de parámetros gracias a su bloque decodificador "loopeado" con pesos compartidos. Está orientado a flujos de trabajo de contexto largo y agentes, combinando comprensión de documentos, generación de código e interacción con herramientas externas.

La innovación central es un decoder de 32 capas distintas en el que el bloque de capas [4, 28) se ejecuta dos veces con los mismos pesos, produciendo 56 ejecuciones de capa por forward pass sin duplicar parámetros. A esto se suma un mecanismo de dos flujos residuales denominado manifold-constrained hyper-connections (mHC) y una atención híbrida que intercala atención lineal y atención completa en un patrón repetido de cuatro capas. El entrenamiento documentado admite secuencias de hasta 262.144 tokens con datos de texto, imagen, código y trayectorias de herramientas.

El modelo se distribuye con licencia Apache 2.0, soporta inglés y chino, y se publica como versión "Preview" sin informe técnico disponible (marcado como TBD en la model card). En el momento de la ficha no registra descargas ni likes, lo que sugiere una publicación muy reciente o de baja difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder autorregresivo multimodal; bloque loopeado con pesos compartidos y mHC de dos flujos; atención híbrida (lineal + completa) |
| Parametros totales | 9.656.250.480 (~9,6B) |
| Parametros activos | No aplica (no es MoE); el autor reporta ~14,6B de parámetros de inferencia por el cómputo loopeado |
| Longitud de contexto | Entrenamiento hasta 262.144 tokens; contexto de inferencia no especificado |
| Tipos de cuantizacion | No disponible (exportación existente en BF16 para el backbone y FP32 para los parámetros de routing mHC) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16 backbone, FP32 routing mHC); requiere `custom_code` |

## Arquitectura y entrenamiento

El modelo parte de un decoder multimodal de 32 capas distintas. Las capas 0–3 procesan la entrada, el bloque de capas 4–27 se aplica dos veces de forma secuencial con pesos compartidos (B(B(h))), y las capas 28–31 junto con la cabeza de salida generan el resultado. En inferencia esto se traduce en 56 ejecuciones de capa por forward pass almacenando solo 32 conjuntos de pesos, de modo que se amplía la profundidad efectiva de cómputo sin incrementar el número de parámetros. En la sección loopeada, dos flujos residuales intercambian información mediante mapeos aprendidos (mHC), y la atención alterna capas de atención lineal y completa en un patrón de cuatro capas.

El autor documenta recetas de entrenamiento con secuencias largas, entradas multimodales y trayectorias supervisadas de tareas, con una longitud máxima de secuencia de entrenamiento de 262.144 tokens e incluyendo texto, imágenes, código y trayectorias de uso de herramientas. No se detalla el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; tampoco se especifican innovaciones adicionales como decodificación especulativa. La model card recomienda usar el entorno de despliegue y los parámetros de configuración documentados por el autor para obtener el mejor rendimiento.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta texto e imágenes y produce texto, con pipeline `image-text-to-text`.
- Comprensión de documentos e imágenes combinada con generación de texto.
- Generación de código e interacción con herramientas externas, según la orientación del modelo a flujos agénticos.
- Soporte de trayectorias de tareas y tool calling documentado en las recetas de entrenamiento (no se detalla la interfaz exacta).
- Contexto largo: entrenamiento con secuencias de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno largas.
- Multilingüe limitado a inglés y chino.
- Capacidades de diseño visual y presentaciones demostradas en los ejemplos de la model card (motion design, PPT design, análisis de datos).

## Casos de uso

- Análisis de documentos extensos: el modelo puede procesar contratos, informes o expedientes de hasta 256K tokens de contexto de entrenamiento, resumiendo y extrayendo información sin fragmentar el documento.
- Generación de código en pipelines: su orientación a trayectorias de herramientas permite integrarlo en asistentes de programación que consultan repositorios o APIs externas.
- Agentes multi-paso: las recetas de entrenamiento incluyen trayectorias de tareas y benchmarks como Terminal Bench 2.1 o AutomationBench, lo que lo hace adecuado para automatización de terminal y flujos operativos.
- Atención al cliente bilingüe (inglés/chino): conversaciones multi-turno con contexto largo y soporte de imágenes para incidencias con capturas o documentos.
- Generación de presentaciones y material visual: los ejemplos de la model card muestran creación de diapositivas (PPT design) y motion design a partir de instrucciones.
- Análisis de datos y simulaciones: los ejemplos incluyen simulaciones orbitales y análisis energético, útil para informes técnicos con gráficos y telemetría.
- Automatización bancaria y financiera: el benchmark T³-Banking sugiere aplicaciones en tareas transaccionales estructuradas.

## Benchmarks y rendimiento

La model card incluye una imagen con resultados comparativos frente a otros modelos en BIRD-Dev, WorkBuddy Bench, AIDABench, TeamBench, Terminal Bench 2.1, T³-Banking, AutomationBench y RaccoonPPTBench, pero los valores numéricos no están disponibles en formato textual en la información proporcionada.

| Benchmark | Resultado |
|---|---|
| BIRD-Dev | No disponible (solo gráfico) |
| WorkBuddy Bench | No disponible (solo gráfico) |
| AIDABench | No disponible (solo gráfico) |
| TeamBench | No disponible (solo gráfico) |
| Terminal Bench 2.1 | No disponible (solo gráfico) |
| T³-Banking | No disponible (solo gráfico) |
| AutomationBench | No disponible (solo gráfico) |
| RaccoonPPTBench | No disponible (solo gráfico) |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 19–20 GB solo para pesos (9,6B parámetros), más overhead de activaciones y caché KV para contexto largo, que puede elevar el requisito muy por encima en secuencias de 256K tokens.
- GPU recomendadas: A100 80 GB o H100 para contexto completo y despliegue en producción; en consumer GPU, una RTX 4090 (24 GB) podría alojar los pesos en BF16 con margen limitado, pero no contexto largo.
- Cuantización: no se documentan tipos de cuantización disponibles; al requerir `custom_code`, la conversión a GGUF o formatos de llama.cpp no está garantizada.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada; vLLM, TGI, llama.cpp y Ollama no están confirmados para esta arquitectura propietaria.
- Latencia y throughput: no disponibles. El cómputo loopeado (56 ejecuciones de capa por forward) implica mayor coste por token que un decoder de 32 capas equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modalidad | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Preview | ~9,6B (14,6B cómputo) | 262.144 (entrenamiento) | Apache 2.0 | Texto + imagen | Hugging Face, ModelScope, GitHub |
| Alternativas de ~9B multimodales | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks numéricos ni de modelos comparables identificados en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Versión "Preview" sin informe técnico publicado (marcado como TBD): los detalles de entrenamiento, datos y evaluación son incompletos.
- Solo soporta inglés y chino; no hay evidencia de capacidades en castellano u otros idiomas.
- Requiere `custom_code` y `trust_remote_code=True`: riesgo de seguridad y de compatibilidad con herramientas estándar (vLLM, llama.cpp, Ollama).
- No se documentan tipos de cuantización, lo que dificulta el despliegue en hardware consumer.
- El cómputo loopeado incrementa el coste por token frente a un modelo de 32 capas de tamaño similar.
- Sin descargas ni likes en el momento de la ficha: ecosistema y validación comunitaria inexistentes.
- Riesgo de alucinación inherente a modelos generativos; no se documentan evaluaciones de sesgo ni de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de informe técnico y de validación externa aconseja evaluación propia antes de producción.
- El contexto de inferencia real no está especificado; el dato de 262.144 tokens corresponde al entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/morrowshade/SenseNova-Loop-9B-Preview
- ModelScope: https://modelscope.cn/models/SenseNova/SenseNova-Loop-9B-Preview
- GitHub: https://github.com/OpenSenseNova/SenseNova-Loop
- Licencia: https://github.com/OpenSenseNova/SenseNova-Loop/blob/main/LICENSE
- Configuración: https://github.com/OpenSenseNova/SenseNova-Loop/blob/main/config.json
- README en chino: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview/blob/main/README_CN.md
