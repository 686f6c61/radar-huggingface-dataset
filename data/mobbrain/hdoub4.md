# mobbrain/hdoub4

## Resumen

`mobbrain/hdoub4` es un adaptador LoRA de tipo DreamBooth para el modelo de difusión texto-a-imagen Krea 2, entrenado sobre el checkpoint base `krea/Krea-2-Raw` y pensado para invocarse sobre la variante Turbo de Krea 2. El adaptador introduce un concepto concreto (una identidad o personaje) activado mediante el token `hdoub` en el prompt, y se distribuye como pesos compatibles con la librería `diffusers` en un repositorio de 1,4 GB.

Se trata de un artefacto de ajuste fino, no de un modelo fundacional: su relevancia es acotada y depende por completo del modelo base Krea 2, del que hereda arquitectura, resolución nativa y capacidades de generación. La model card documenta el entrenamiento sobre Krea 2 RAW y la inferencia de las muestras sobre Krea 2 Turbo con 8 pasos y `guidance_scale=0.0`, lo que sitúa el flujo de uso típico en la generación rápida con pocos pasos de muestreo.

La información disponible sobre el adaptador es muy limitada: no se publican detalles del dataset de entrenamiento, hiperparámetros, número de pasos ni métricas de evaluación. El repositorio no registra descargas ni valoraciones en el momento de la consulta, y la model card incluye prompts de ejemplo con contenido explícito de desnudo, lo que condiciona su aplicabilidad en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre difusión texto-a-imagen Krea 2 (modelo base `krea/Krea-2-Raw`) |
| Parametros totales | no disponible (pesos LoRA; tamaño del repositorio 1,4 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; condicionamiento por prompt de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | diffusers (adaptador LoRA cargable con `load_lora_weights`) |

## Arquitectura y entrenamiento

El adaptador sigue el esquema DreamBooth-LoRA aplicado a un modelo de difusión: se congelan los pesos del modelo base Krea 2 y se entrenan matrices de bajo rango que inyectan el nuevo concepto en las capas de atención y proyección del UNet o del transformer de difusión (la model card no especifica qué componentes exactos se adaptaron). El token de activación es `hdoub`, y el entrenamiento se realizó sobre el checkpoint `krea/Krea-2-Raw`, mientras que las muestras publicadas se generaron sobre `krea/Krea-2-Turbo` con 8 pasos de inferencia y `guidance_scale=0.0`.

No se dispone de información sobre el número de imágenes del dataset, la composición del mismo, el número de pasos de entrenamiento, la tasa de aprendizaje, el rango del LoRA ni si se aplicaron técnicas de regularización. Tampoco se documenta el uso de RLHF, DPO u otras etapas de alineamiento, algo que en modelos de difusión no es habitual de todos modos. No se describen innovaciones técnicas adicionales más allá del propio ajuste DreamBooth.

## Capacidades

- Generación de imágenes texto-a-imagen condicionada por el token `hdoub`, que activa el concepto aprendido.
- Reproducción de una identidad o personaje concreto en distintas poses, encuadres e iluminaciones, según los ejemplos de la model card.
- Composición de escenas controlada mediante prompts descriptivos (localización, iluminación, vestuario, primer plano o plano general).
- Integración con el pipeline `Krea2Pipeline` de `diffusers` mediante `load_lora_weights`.
- Compatibilidad con el modo Turbo de Krea 2 para muestreo en 8 pasos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo, por tratarse de un modelo generativo de imagen.

## Casos de uso

- Prototipado de personajes para narrativa visual: usar el token `hdoub` para mantener consistencia de identidad entre ilustraciones de una misma historia, variando escenario y encuadre mediante el prompt.
- Generación de avatares y retratos consistentes: producir retratos en primer plano con iluminación controlada (por ejemplo, hora dorada) para su uso en perfiles o material promocional, siempre que el contenido generado cumpla las políticas de la plataforma.
- Pruebas de concepto en pipelines de difusión: evaluar la integración de adaptadores LoRA con `Krea2Pipeline` y el modo Turbo de 8 pasos para medir latencia y calidad en un entorno de desarrollo.
- Creación de storyboards: generar variaciones de una misma figura en localizaciones distintas (muelle, interior, fondo de pared de madera) para maquetar secuencias narrativas.
- Investigación sobre DreamBooth: servir como ejemplo práctico de adaptador de bajo rango entrenado sobre Krea 2 RAW y evaluado sobre Krea 2 Turbo, útil para estudiar transferencia entre checkpoints del mismo modelo.
- Experimentación artística controlada: explorar cómo el adaptador responde a cambios de vestuario e iluminación en el prompt, manteniendo el concepto activado.
- Fines educativos sobre licencias y contenido: analizar un caso de adaptador con licencia Apache 2.0 pero con ejemplos explícitos, para discutir políticas de moderación y uso responsable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende del modelo base Krea 2 y de la precisión utilizada (`bfloat16` en el ejemplo de la model card). El adaptador LoRA añade una sobrecarga reducida frente al modelo base.
- GPU recomendadas: no disponibles; el ejemplo oficial usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que requiere una GPU compatible con bfloat16 (por ejemplo, serie Ampere en adelante), pero no se detalla un modelo concreto.
- Compatibilidad con GPU de consumo: no disponible; el repositorio del adaptador ocupa 1,4 GB, pero el requisito real lo marca el checkpoint base Krea 2, cuyo tamaño no se especifica en la información proporcionada.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights`. No se documentan otros backends (llama.cpp, Ollama, TGI, vLLM) para este adaptador.
- Latencia y throughput: no disponibles; la model card indica 8 pasos de inferencia en modo Turbo y `guidance_scale=0.0`, pero no publica tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mobbrain/hdoub4` | LoRA DreamBooth sobre Krea 2 | no disponible (repo 1,4 GB) | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| `krea/Krea-2-Raw` | Modelo base texto-a-imagen | no disponible | no disponible | no disponible en la información | Hugging Face (referenciado como base) |
| `krea/Krea-2-Turbo` | Variante Turbo del modelo base | no disponible | no disponible | no disponible en la información | Hugging Face (referenciado en la model card) |
| Adaptadores LoRA DreamBooth genéricos | LoRA sobre difusión | variable | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento, parámetros ni contexto de los modelos comparados en la información proporcionada, por lo que la comparativa se limita a tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al tratarse de un adaptador entrenado sobre un concepto concreto, puede reproducir sesgos de género, cuerpo o etnia presentes en el dataset de entrenamiento, que no se describe.
- Riesgo de alucinación: en modelos de difusión se traduce en artefactos visuales, anatomía incorrecta o incoherencias entre prompt e imagen; no se publican evaluaciones al respecto.
- Contenido explícito: la model card incluye prompts de ejemplo con desnudo total y parcial, lo que puede impedir su uso en plataformas con políticas de contenido y exige moderación en producción.
- Limitaciones de contexto e idioma: no se documentan; el condicionamiento es por prompt de texto y no se especifican idiomas soportados ni longitud máxima de prompt.
- Licencia: Apache 2.0 para el adaptador, pero el uso comercial depende también de la licencia del modelo base Krea 2, que no se detalla en la información disponible.
- Caveats de producción: no hay métricas de calidad, número de descargas ni validación comunitaria; el adaptador es un artefacto reciente (creado en noviembre de 2026 según los metadatos) y sin adopción registrada.
- Dependencia total del modelo base: cualquier cambio, retirada o actualización de `krea/Krea-2-Raw` o `krea/Krea-2-Turbo` puede afectar la reproducibilidad de los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/mobbrain/hdoub4
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo referenciada: https://huggingface.co/krea/Krea-2-Turbo
- Librería diffusers: https://github.com/huggingface/diffusers
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
