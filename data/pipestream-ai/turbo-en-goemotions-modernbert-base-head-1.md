# pipestream-ai/turbo-en-goemotions-modernbert-base-head-1

## Resumen

`turbo-en-goemotions-modernbert-base-head-1` es un artefacto de clasificación de texto publicado por `pipestream-ai` dentro del ecosistema turboembed, una librería y "model zoo" orientada a componentes de inferencia empaquetados. No se trata de un modelo completo, sino de una *head* (cabeza de clasificación) que se ejecuta sobre el encoder `answerdotai/ModernBERT-base`; es decir, requiere el bundle del encoder para funcionar. El componente declarado es `COMPONENT_DOCUMENT_CATEGORIZER`, lo que indica su uso previsto como categorizador de documentos.

El modelo se ha entrenado con `turbo-trainer` sobre una partición filtrada de train/dev/test del corpus GoEmotions de Google Research (2020), un conjunto de comentarios de Reddit anotados con 27 emociones y neutralidad. Por tanto, la tarea real es clasificación de emociones en texto corto en inglés, no categorización documental genérica, aunque la metadata del artefacto lo etiquete como categorizador.

La relevancia es doble: por un lado, ilustra el patrón de distribución de cabezas ligeras desacopladas del encoder base (la head pesa 86 248 bytes), lo que permite reutilizar un único ModernBERT-base para múltiples tareas; por otro, adolece de una limitación importante: no incluye métricas de evaluación en el artefacto, por lo que su calidad no está declarada por el autor. La licencia es Apache-2.0 y el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Head de clasificación sobre encoder transformer ModernBERT (bidireccional, atención lineal) |
| Parametros totales | No disponible para la head (86 248 bytes de fichero); el encoder base ModernBERT-base tiene 149 M de parámetros según su model card, no verificable en la información proporcionada |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del encoder ModernBERT-base, no confirmada aquí) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.tevh` (formato propietario de turboembed, 86 248 bytes) |

## Arquitectura y entrenamiento

El artefacto es una cabeza de clasificación (formato `FORMAT_HEAD`, tipo `KIND_HEAD`) que se monta sobre el encoder `answerdotai/ModernBERT-base`. El fichero de la head registra el sha256 del manifiesto del encoder requerido (`65a0720298fc5fe7f229ee57ffbe1ccf0eb3836a91526840ca23fa30a5937ac8`), de modo que el model zoo de turboembed verifica tamaño y digests antes de la instalación. La arquitectura concreta de la head (número de capas, dimensión de salida, función de activación) no se detalla en la model card.

El entrenamiento se realizó con `turbo-trainer` sobre una partición filtrada de train/dev/test de GoEmotions (commit `7de3624754e2b0f2f505ae496db3ba194bb40be9`), corpus publicado por Google Research en 2020 bajo CC BY 4.0. No se especifican hiperparámetros, número de épocas, función de pérdida, ni si hubo ajuste fino del encoder o solo de la head. Tampoco se documenta ninguna innovación técnica más allá del empaquetado y verificación criptográfica de artefactos propia de turboembed.

## Capacidades

- Clasificación de emociones en texto corto en inglés, según las etiquetas del corpus GoEmotions (27 emociones más neutral, según la definición del dataset citado).
- Integración como componente `COMPONENT_DOCUMENT_CATEGORIZER` dentro de pipelines turboembed.
- Verificación de integridad de ficheros (tamaño y sha256) en el momento de la instalación desde el model zoo.
- Reutilización del encoder ModernBERT-base compartido con otras heads del mismo zoo.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión, audio ni capacidades de agente.
- Capacidad multilingüe: no; solo inglés.

## Casos de uso

- Moderación de comunidades en línea: clasificar comentarios de foros o redes en categorías emocionales para priorizar revisión humana, aprovechando que el modelo se entrenó sobre comentarios de Reddit.
- Análisis de sentimiento y emoción en encuestas abiertas: procesar respuestas cortas en inglés y agregar distribuciones por emoción para informes de experiencia de cliente.
- Enrutamiento de tickets de soporte: usar la emoción detectada (frustración, enfado, gratitud) como señal adicional para asignar prioridad o cola de atención.
- Etiquetado de datasets: preanotar corpus de texto corto en inglés con emociones antes de una revisión manual, dado el bajo coste de la head (86 KB) frente al encoder compartido.
- Investigación en psicolingüística computacional: reproducir o comparar resultados sobre GoEmotions con un encoder ModernBERT, siempre que se validen las métricas por cuenta propia.
- Filtrado de contenido en pipelines de ingestión documental: como paso de categorización dentro de un flujo turboembed más amplio, clasificando fragmentos cortos antes de indexarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "Held-out metrics: not included in this artifact".

## Requisitos de hardware

- La head ocupa 86 248 bytes, por lo que su carga en memoria es despreciable; el coste real lo determina el encoder `answerdotai/ModernBERT-base`.
- VRAM estimada: no disponible en la información proporcionada para el conjunto head + encoder; depende del encoder y de la cuantización, no documentadas aquí.
- GPU recomendadas: no disponible. Por el tamaño del encoder base (ModernBERT-base, familia de modelos pequeños), es previsible que quepa en GPU de consumo, pero este dato no se confirma en la información disponible.
- Cabe en consumer GPU: no confirmado en la información proporcionada.
- Opciones de despliegue: instalación mediante el model zoo de turboembed por identificador (`turbo-en-goemotions-modernbert-base-head-1`), con verificación de digests. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Métricas publicadas |
|---|---|---|---|---|---|---|
| turbo-en-goemotions-modernbert-base-head-1 | Head de clasificación sobre ModernBERT-base | Head de 86 KB; encoder no incluido en el artefacto | No disponible | Inglés | Apache-2.0 | No |
| answerdotai/ModernBERT-base | Encoder base | No disponible en esta ficha | No disponible | No disponible | Apache-2.0 | No disponible en esta ficha |
| Clasificadores GoEmotions sobre BERT/RoBERTa | Modelos completos ajustados | No disponible | No disponible | Inglés | Variable | No disponible en esta ficha |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a aspectos de empaquetado, licencia e idioma.

## Limitaciones y advertencias

- El artefacto no incluye evaluación held-out, por lo que su calidad es desconocida y debe validarse antes de cualquier uso en producción.
- Es solo una head: sin el bundle del encoder `answerdotai/ModernBERT-base` (con el sha256 de manifiesto indicado) no funciona.
- Solo inglés; refleja el dominio y las definiciones de etiqueta de GoEmotions (comentarios de Reddit), lo que puede no generalizar a otros géneros textuales.
- Riesgo de sesgo: el corpus de origen procede de una plataforma y comunidad concretas; las anotaciones emocionales son subjetivas y culturalmente dependientes.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas o sobreconfiadas sin calibración documentada.
- La licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento GoEmotions están bajo CC BY 4.0 y requieren atribución; la model card incluye la atribución a los autores originales.
- El formato `.tevh` es propietario de turboembed; la portabilidad fuera de ese ecosistema no está documentada.
- El uso previsto declarado (`COMPONENT_DOCUMENT_CATEGORIZER`) no coincide con la tarea real de clasificación de emociones, lo que puede inducir a error en la integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pipestream-ai/turbo-en-goemotions-modernbert-base-head-1
- Encoder base ModernBERT-base: https://huggingface.co/answerdotai/ModernBERT-base
- Repositorio turboembed y licencia: https://github.com/ai-pipestream/turboembed/blob/main/LICENSE
- Corpus GoEmotions (commit citado): https://github.com/google-research/google-research/tree/7de3624754e2b0f2f505ae496db3ba194bb40be9/goemotions
- README de GoEmotions: https://github.com/google-research/google-research/blob/7de3624754e2b0f2f505ae496db3ba194bb40be9/README.md
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
