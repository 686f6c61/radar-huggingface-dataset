# bullmarket2024/functiongemma-270m-razonamiento-es-v2

## Resumen

`bullmarket2024/functiongemma-270m-razonamiento-es-v2` es un ajuste fino (fine-tuning) publicado en Hugging Face por el usuario bullmarket2024, derivado de la familia Gemma 3 en su variante de texto (`gemma3_text`), según la etiqueta de arquitectura del repositorio. El nombre del modelo sugiere un enfoque en *function calling* (llamada a funciones o herramientas) y razonamiento en castellano ("razonamiento-es"), pero la model card no documenta ni confirma explícitamente ninguna de estas capacidades. El modelo cuenta con 268.098.176 parámetros totales (aproximadamente 270 millones), lo que lo sitúa en la categoría de modelos pequeños, aptos para despliegue en hardware de consumo y para tareas de baja latencia.

El modelo se ha entrenado mediante SFT (supervised fine-tuning) con la librería TRL, según las etiquetas del repositorio, y se distribuye en formato safetensors compatible con transformers. El repositorio ocupa 1,1 GB y no registra descargas ni interacciones en el momento de la consulta, lo que indica que es una publicación reciente y sin validación comunitaria. La licencia no está declarada, lo que constituye una limitación importante para cualquier uso comercial.

La relevancia de este modelo es limitada y debe evaluarse con cautela: se trata de un ajuste fino de un modelo base pequeño, sin benchmarks publicados, sin model card sustantiva y sin datos sobre el dataset de entrenamiento. Resulta útil como punto de partida para experimentación con modelos de 270M en tareas de razonamiento o function calling en castellano, pero no debe considerarse un modelo listo para producción sin una evaluación propia y exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma3_text` (transformer decoder-only, familia Gemma 3, variante solo texto) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible (el nombre sugiere castellano, sin confirmación documental) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a `gemma3_text`, es decir, la torre de texto de la familia Gemma 3 de Google, en una variante de aproximadamente 270 millones de parámetros. Se trata de un transformer decoder-only de tipo denso (no MoE). No se dispone de información sobre el número de capas, dimensiones ocultas, mecanismo de atención (incluida la posible atención local/global de Gemma 3) ni sobre la ventana de contexto efectiva, ya que la model card no aporta estos datos y el repositorio no incluye documentación técnica adicional.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con la librería TRL, según las etiquetas del repositorio. No se documenta el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF o DPO, ni los hiperparámetros utilizados. Tampoco se especifica el modelo base exacto del que se partió (por ejemplo, `google/gemma-3-270m-it` u otra variante), lo que impide reproducir el proceso. No se declaran innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el pipeline `text-generation` indican uso previsto para diálogo, aunque no se documenta la calidad ni el formato de plantilla de chat.
- Razonamiento: el nombre del modelo ("razonamiento-es") sugiere un ajuste orientado a tareas de razonamiento, sin evidencia documental que lo respalde.
- Function calling / tool calling: el nombre ("functiongemma") sugiere soporte de llamada a funciones, pero no se documenta el esquema, el formato ni ejemplos de uso.
- Capacidades multilingües: no disponibles; el sufijo "es" apunta a castellano, sin confirmación.
- Modo thinking, visión, audio: no disponibles; la arquitectura es `gemma3_text` (solo texto).
- Soporte de agentes y razonamiento multi-paso: no documentado.

## Casos de uso

- Experimentación con function calling en castellano: el modelo puede probarse como generador de llamadas a herramientas en prototipos, validando manualmente el formato de salida y la precisión, dado que no hay documentación del esquema esperado.
- Clasificación y extracción de información ligera: con 270M de parámetros, es adecuado para tareas de etiquetado, extracción de entidades o enrutamiento de consultas en entornos con recursos limitados, siempre que se evalúe su precisión en el dominio concreto.
- Despliegue en hardware de consumo: su tamaño permite ejecutarlo en GPUs de gama media o incluso en CPU, lo que lo hace útil para demos locales, prototipos y entornos de desarrollo sin infraestructura dedicada.
- Generación de texto asistida de baja latencia: para autocompletado, respuestas cortas o resúmenes breves en aplicaciones donde la latencia y el coste computacional son críticos.
- Base para fine-tuning posterior: al ser un ajuste fino de un modelo pequeño, puede servir como punto de partida para especializaciones adicionales con datasets propios, aprovechando su tamaño reducido para iterar rápidamente.
- Evaluación comparativa de ajustes finos: útil en investigación para estudiar el efecto del SFT en modelos de 270M sobre tareas de razonamiento en castellano, comparando con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión completa (fp32) el modelo requiere aproximadamente 1,1 GB solo para pesos; en bf16/fp16, unos 0,55 GB; en cuantización de 8 bits, unos 0,3 GB; en 4 bits, unos 0,15 GB. Estas cifras son estimaciones a partir del número de parámetros y no están confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede alojar el modelo en bf16 con margen para el contexto; una RTX 3060, RTX 4060 o superior es más que suficiente. Para despliegues en servidor, una T4 o A10 bastan.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante, con cuantización si es necesario) e incluso en CPU con llama.cpp u Ollama si se generan pesos GGUF (no publicados).
- Opciones de despliegue: transformers (nativo, según el repositorio), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, ya que no se distribuyen en ese formato.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `bullmarket2024/functiongemma-270m-razonamiento-es-v2` | 268M | no disponible | no disponible | Hugging Face (0 descargas) |
| Gemma 3 270M (Google) | ~270M | no disponible en la informacion proporcionada | Gemma Terms of Use | Hugging Face, ampliamente distribuido |
| Qwen2.5-0.5B | ~500M | 32K (según documentación pública de Qwen) | Apache 2.0 | Hugging Face |
| SmolLM2-360M | ~360M | 8K (según documentación pública) | Apache 2.0 | Hugging Face |

La comparación con Gemma 3 270M es la más directa, ya que este modelo parece derivar de ella, pero no se dispone de datos de rendimiento para establecer diferencias cuantitativas. Qwen2.5-0.5B y SmolLM2-360M se incluyen como alternativas de tamaño similar con licencias permisivas y documentación completa, pero sus cifras de contexto y rendimiento no se han verificado en la información proporcionada y deben contrastarse en sus respectivas model cards.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: el README es la plantilla automática de Hugging Face sin rellenar, por lo que no hay información sobre datos de entrenamiento, evaluación, sesgos ni uso previsto.
- Licencia no declarada: no se puede asumir ningún permiso de uso comercial; es imprescindible contactar con el autor o verificar la licencia del modelo base (Gemma) antes de cualquier uso en producción.
- Riesgo de alucinación elevado: los modelos de 270M tienen capacidad limitada de razonamiento y factualidad; es previsible que generen información incorrecta con fluidez, especialmente en tareas abiertas.
- Capacidades no verificadas: el nombre sugiere function calling y razonamiento en castellano, pero no hay evidencia documental ni benchmarks que lo confirmen; cualquier uso debe validarse empíricamente.
- Contexto desconocido: se desconoce la ventana de contexto efectiva, lo que impide planificar aplicaciones que dependan de conversaciones largas o documentos extensos.
- Idiomas no confirmados: aunque el sufijo "es" apunta a castellano, no se documenta el soporte ni la calidad en otros idiomas.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay retroalimentación de terceros sobre su comportamiento.
- Fecha de creación futura en los metadatos (2026-11-18): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.
- Posible dependencia de la plantilla de chat de Gemma: al ser un ajuste fino de `gemma3_text`, el formato de prompt correcto no está documentado y un uso incorrecto puede degradar gravemente la calidad de salida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bullmarket2024/functiongemma-270m-razonamiento-es-v2
- Paper de referencia citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Librería TRL (usada para el SFT): https://github.com/huggingface/trl
- Documentación de transformers: https://huggingface.co/docs/transformers
- Familia Gemma 3 (modelo base probable): https://huggingface.co/google/gemma-3-270m
