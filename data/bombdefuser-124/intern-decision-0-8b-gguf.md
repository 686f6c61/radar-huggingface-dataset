# bombdefuser-124/Intern-Decision-0.8B-GGUF

## Resumen

Intern-Decision-0.8B es un modelo multimodal de decisión estructurada desarrollado por InternLM, entrenado a partir de Qwen3.5-0.8B. No es un modelo de chat generalista: su función es puntuar candidatos dentro de un esquema predefinido, de modo que cada campo de la decisión se restringe a un conjunto de símbolos de respuesta de un solo token y el consumidor lee las probabilidades asociadas a cada candidato. Esta ficha describe la conversión a GGUF publicada por el usuario `bombdefuser-124`, cuantizada a partir del checkpoint original `internlm/Intern-Decision-0.8B`.

El checkpoint cuenta con 752.393.024 parámetros (aproximadamente 0,75 mil millones) distribuidos en 24 bloques transformer, lo que lo sitúa en el rango de modelos que caben holgadamente en GPUs de consumo. La arquitectura es multimodal: incluye un proyector de visión en FP16 (`mmproj-f16.gguf`) que se combina con el modelo de lenguaje para tareas de imagen-texto-a-texto, lo que permite tomar decisiones a partir de capturas, formularios escaneados o imágenes junto con instrucciones textuales.

Su relevancia actual radica en el nicho que ocupa: frente a los modelos generativos, ofrece un mecanismo de decisión con probabilidades calibradas (temperatura de calibración 2,747760550703), útil para enrutado de agentes, clasificación con umbral y sistemas con revisión humana. La conversión a GGUF facilita su despliegue local mediante llama.cpp sin necesidad de infraestructura GPU de datacenter.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (24 bloques) derivado de Qwen3.5-0.8B, con proyector de visión separado |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue del autor usa `--ctx-size 8192`) |
| Tipos de cuantización | FP16 y Q8_0 en este repositorio; proyector de visión en FP16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp): `intern-decision-0.8b-fp16.gguf`, `intern-decision-0.8b-q8_0.gguf`, `mmproj-f16.gguf` |
| Modelo base | internlm/Intern-Decision-0.8B (relación: cuantizado) |
| Autor de la cuantización | bombdefuser-124 |
| Tamaño del repositorio | 2,5 GB |
| Pipeline declarado | image-text-to-text |
| Fecha de creación | 2026-09-26 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 24 bloques, afinado por InternLM desde Qwen3.5-0.8B. La conversión GGUF conserva esos 24 bloques, pero omite la cabeza MTP/NextN declarada en la configuración de origen porque el checkpoint fuente no incluye tensores MTP. La parte multimodal se resuelve con un proyector de visión independiente (`mmproj-f16.gguf`) que debe emparejarse con uno de los GGUF de lenguaje; el repositorio no incluye el proyector fusionado en el mismo archivo.

No se han proporcionado datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento posteriores. La información disponible sí indica que existe una temperatura de calibración ajustada sobre pesos BF16 (2,747760550703) y que el modelo se comporta como puntuador de candidatos, no como generador libre: hay que seguir el formato de prompt de esquema de decisión del modelo original y restringir cada campo a sus símbolos de respuesta permitidos. Este diseño es la innovación principal frente a un modelo de chat convencional.

## Capacidades

- Decisión estructurada: puntúa candidatos discretos y devuelve probabilidades por opción, en lugar de texto libre.
- Predicción restringida: cada campo del esquema se limita a un conjunto de símbolos de un solo token.
- Comprensión de imagen y texto: el pipeline declarado es image-text-to-text, con entrada conjunta de imagen e instrucciones.
- Toma de decisiones condicionada por imagen: útil para clasificar o evaluar contenido visual según un esquema fijo.
- Calibración de confianza: la temperatura de calibración permite interpretar las probabilidades como señal de confianza para umbralizar o derivar a revisión humana.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`, orientada a servir el modelo vía llama.cpp.
- Conversacional: el tag `conversational` está presente, aunque la model card insiste en que no es un modelo de chat general.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada; el modelo está pensado como componente de decisión dentro de un agente, no como planificador autónomo.
- Modo "thinking", audio u otras modalidades: no disponible.

## Casos de uso

- Enrutado de decisiones en agentes: dado un estado descrito en texto y/o una captura de pantalla, el modelo puntúa cada acción candidata de un conjunto cerrado; el agente selecciona el candidato con mayor probabilidad o se abstiene si ninguna supera un umbral calibrado.
- Triaje de tickets de soporte con captura adjunta: se define un esquema con campos como categoría, prioridad y equipo responsable, y el modelo devuelve la distribución de probabilidad por campo, lo que permite enrutar automáticamente y marcar los casos ambiguos para revisión.
- Moderación de contenido multimodal: clasificación de publicaciones con imagen y texto contra un conjunto fijo de categorías de política, usando las probabilidades por categoría para aplicar umbrales distintos según la severidad.
- Control de calidad en inspección visual: a partir de la fotografía de una pieza o producto, el modelo decide entre un conjunto discreto de resultados (por ejemplo, conforme, defecto leve, defecto grave), integrándose en una línea con registro de probabilidades por unidad.
- Clasificación de documentos escaneados en flujos administrativos: extracción de la decisión de tipo documental (factura, contrato, identificación) y de los campos discretos asociados, con derivación a revisión manual cuando la confianza es baja.
- VQA de respuesta cerrada: evaluación de formularios, paneles o interfaces donde la respuesta correcta pertenece a un conjunto pequeño de opciones, aprovechando la restricción a símbolos de un solo token.
- Human-in-the-loop y aprendizaje activo: las probabilidades por candidato permiten seleccionar los ejemplos más inciertos para etiquetado humano, en lugar de revisar la salida completa del modelo.
- Servicio local en endpoints compatibles con OpenAI: despliegue con `llama-server` en una máquina con GPU modesta para dar soporte a decisiones de baja latencia dentro de una aplicación interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de la conversión remite a la model card del modelo original de InternLM para consultar los benchmarks, pero esos datos no forman parte de la información proporcionada, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para el modelo de lenguaje: aproximadamente 0,8 GB para el archivo Q8_0 y 1,5 GB para FP16, calculado a partir de los 752.393.024 parámetros; hay que sumar el espacio del proyector de visión (`mmproj-f16.gguf`) y la caché KV, dimensionada según la ventana de contexto que se configure.
- Cabe sin problema en GPUs de consumo: RTX 3060 12 GB, RTX 4060, RTX 4090, así como en iGPU con suficiente memoria compartida si se ejecuta parcialmente en CPU.
- Para contexto largo o varias secuencias en paralelo conviene reservar margen adicional de VRAM para la caché KV, aunque el modelo en sí ocupa muy poco.
- Despliegue recomendado: llama.cpp / `llama-server` con soporte multimodal de Qwen3.5, cargando un GGUF de lenguaje más `mmproj-f16.gguf`. El autor publica un ejemplo con `--ctx-size 8192`, `--parallel 1`, `--gpu-layers all` y `--flash-attn on`.
- Otras rutas (Ollama, LM Studio, vLLM, TGI) no están documentadas para esta conversión en la información disponible; requieren verificación previa porque el modelo depende de soporte específico para la arquitectura Qwen3.5 multimodal y el proyector de visión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos de decisión estructurada, y la búsqueda web no devolvió referencias técnicas relevantes sobre este modelo. La única comparación posible con los datos disponibles es entre el checkpoint original y esta conversión.

| Modelo | Parámetros | Contexto | Modalidad | Formato | Cuantización | Licencia | Rendimiento |
|---|---|---|---|---|---|---|---|
| Intern-Decision-0.8B-GGUF (este repositorio) | 752.393.024 | no disponible | imagen + texto | GGUF | FP16, Q8_0 | apache-2.0 | no disponible |
| internlm/Intern-Decision-0.8B (origen) | no disponible (mismo checkpoint, ~0,75B) | no disponible | imagen + texto | no disponible | BF16 (referencia de calibración) | no disponible en la información aportada | no disponible |
| Alternativas de ~0,8B para decisión estructurada multimodal | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Conviene señalar que comparar este modelo con LLM de chat de tamaño similar (por ejemplo, modelos generalistas de menos de 1B) no es metodológicamente adecuado: Intern-Decision no genera respuestas abiertas, sino distribuciones sobre candidatos discretos, por lo que las métricas de generación libre no serían comparables.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo como generador conversacional produce resultados fuera de su diseño. Requiere el formato de prompt de esquema de decisión del modelo original y campos restringidos a símbolos de respuesta de un solo token.
- Calibración dependiente de la cuantización: la temperatura de calibración 2,747760550703 se ajustó sobre pesos BF16, por lo que la variante Q8_0 puede alterar la calidad de la calibración y, con ella, los umbrales de decisión.
- Cabeza MTP/NextN omitida: la conversión no incluye los tensores MTP declarados en la configuración de origen, de modo que no se puede usar decodificación especulativa basada en esa cabeza.
- Idiomas soportados: no disponibles; no hay confirmación de cobertura multilingüe ni de calidad fuera del inglés.
- Longitud de contexto: no disponible; el valor 8192 aparece únicamente como parámetro de ejemplo en el comando de despliegue y no debe interpretarse como máximo del modelo.
- Riesgo de alucinación: menor que en un modelo generativo al estar restringida la salida a candidatos, pero persiste el riesgo de sobreconfianza en las probabilidades y de decisiones erróneas ante entradas fuera de distribución.
- Sesgos: no disponibles; no se documenta composición del dataset ni evaluación de sesgos.
- Repositorio sin validación comunitaria: 0 descargas y 0 likes, cuantizado por un tercero, sin verificación independiente de la fidelidad de la conversión respecto al checkpoint original.
- Metadatos a revisar: la fecha de creación registrada (2026-09-26) y la ausencia de datos de idioma o benchmarks aconsejan verificar el repositorio antes de integrarlo en producción.
- Licencia: el repositorio declara apache-2.0, permisiva para uso comercial, pero conviene confirmar las condiciones del modelo base de InternLM antes de desplegarlo en producto.
- Despliegue limitado: fuera de llama.cpp, el soporte de la combinación Qwen3.5 multimodal más proyector de visión no está documentado y puede no funcionar en otros servidores de inferencia.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/bombdefuser-124/Intern-Decision-0.8B-GGUF
- Modelo base: https://huggingface.co/internlm/Intern-Decision-0.8B
- Paper, blog, repositorio o demo adicionales: no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
