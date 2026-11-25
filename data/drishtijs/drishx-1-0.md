# drishtijs/DrishX-1.0

## Resumen

DrishX-1.0 es un ajuste fino (finetune) del modelo Qwen2.5-Coder-0.5B-Instruct de Alibaba, publicado por el usuario drishtijs bajo licencia Apache 2.0. Se trata de un checkpoint de lenguaje causal de aproximadamente 494 millones de parámetros (0,5B) orientado a conversaciones sobre desarrollo de software y a la orientación dentro del proyecto Drishti. No es un entrenamiento nuevo desde cero: la model card indica explícitamente que contiene el checkpoint local `data/models/finetuned` exportado con la receta de `scripts/train_model.py`, sin métricas de calidad retenidas registradas junto al artefacto.

El modelo emplea la arquitectura `Qwen2ForCausalLM` (transformer decoder-only) con pesos en safetensors en float32 y una longitud de contexto configurada de 32.768 tokens, aunque el autor advierte que la calidad en contexto largo no se ha evaluado. Su relevancia es limitada y muy específica: sirve como pieza de pesos para la aplicación DrishX, que aporta las capacidades de edición de sistema de ficheros, control de navegador, recuperación de base de datos y aislamiento de permisos. El propio autor aclara que esos comportamientos pertenecen a la aplicación, no a los pesos.

La publicación incluye un tag de revisión inmutable `v1.0.1`, ficheros `release.json` y `SHA256SUMS` para reproducibilidad, además de un adaptador Git opcional (`git-adapter-v1.1.4`). No se reclama ningún resultado de benchmark ni puntuación de calidad en producción; la validación registrada en `validation.json` es una prueba de humo en CPU con logits finitos y generación determinista sobre un saludo sintético.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only, causal) |
| Parametros totales | 494.032.768 (aprox. 0,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens configurados; calidad en contexto largo no evaluada |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se incluye conversión GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 (incluye licencia y atribución upstream) |
| Formato de pesos | safetensors, float32 |
| Modelo base | Qwen/Qwen2.5-Coder-0.5B-Instruct (revision `ea3f2471cf1b1f0db85067f1ef93848e38e88c25`) |
| Relación con el base | finetune |
| Revisión publicada | `v1.0.1` (tag inmutable) |
| Tamaño del repositorio | 3,1 GB |
| Librería | transformers (>= 4.57.0 recomendado) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2, un transformer decoder-only con atención causal estándar implementado en `Qwen2ForCausalLM`. El modelo parte de Qwen2.5-Coder-0.5B-Instruct, un modelo base ya ajustado por instrucciones por Alibaba, y sobre él se aplica un finetune adicional. La model card no documenta la composición del dataset de ajuste, el número de tokens utilizados, ni si hubo RLHF, DPO o cualquier otra etapa de alineación posterior; todos esos datos figuran como no disponibles.

El autor indica que el repositorio contiene el checkpoint local existente y no una nueva ejecución de entrenamiento, y que los hiperparámetros exactos y las métricas de calidad sobre conjuntos retenidos no se registraron junto al checkpoint. La receta de entrenamiento referenciada (`scripts/train_model.py`) usa el modelo base Qwen y exporta un checkpoint completo. No se declara ninguna innovación técnica propia: no hay decodificación especulativa, atención lineal ni mecanismos híbridos documentados. La validación publicada (`validation.json`) consiste en una carga offline en CPU, comprobación del tokenizador, verificación de logits finitos y generación determinista sobre un saludo sintético, lo que confirma únicamente la ejecución básica.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-Coder-0.5B-Instruct.
- Asistencia en conversaciones sobre desarrollo de software y orientación dentro del proyecto Drishti, según el propósito declarado por el autor.
- Plantilla de chat compatible con `apply_chat_template` de Transformers (formato de mensajes role/content).
- Compatibilidad con text-generation-inference y endpoints compatibles (según los tags del repositorio).
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada; podría heredarse del base, pero no se documenta ni se valida.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Capacidad de edición de ficheros, control de navegador o acceso a base de datos: no residen en los pesos, sino en la aplicación DrishX según aclara el autor.

## Casos de uso

- Asistente de dudas sobre el proyecto Drishti: el modelo puede responder preguntas sobre rutas de página y estructura del proyecto, que es el caso de ejemplo incluido en la model card ("Explain a Drishti page route"), usando la plantilla de chat del tokenizador.
- Generación de fragmentos de código en inglés para prototipado rápido: al derivar de Qwen2.5-Coder, puede producir snippets en conversaciones de desarrollo, aunque el autor advierte que el código generado requiere revisión y pruebas.
- Chat de soporte técnico ligero en inglés: su ventana configurada de 32.768 tokens permite mantener conversaciones multi-turno, si bien la calidad en contextos largos no se ha evaluado y no debería asumirse.
- Despliegue en entornos con recursos muy limitados: con 494 millones de parámetros y pesos float32, es viable en CPU para pruebas y en GPUs de gama baja, lo que lo hace adecuado para demos locales o entornos de desarrollo sin acelerador dedicado.
- Integración como componente de pesos dentro de la aplicación DrishX: el repositorio está pensado para alimentar esa aplicación, que añade las capacidades de sistema de ficheros, navegador y permisos.
- Pruebas de humo y pipelines de CI: los ficheros `release.json`, `SHA256SUMS` y `validation.json` permiten verificar integridad y carga determinista del checkpoint en un pipeline automatizado.
- Base para experimentación con adaptadores: el adaptador Git opcional `git-adapter-v1.1.4` requiere el base fijado `v1.0.1`, lo que facilita experimentar con ajustes específicos sin tocar los pesos raíz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se reclama ninguna puntuación de benchmark ni de calidad en producción, y que las métricas de calidad sobre conjuntos retenidos no se registraron con el checkpoint. La única validación documentada es una prueba de humo en CPU (carga offline, tokenizador, logits finitos y generación determinista) que no mide precisión en código ni rendimiento en tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 494 millones de parámetros en float32, los pesos ocupan aproximadamente 2 GB (3,1 GB de repositorio incluyen tokenizador y artefactos); en float16 o bfloat16 bajaría a alrededor de 1 GB, aunque el repositorio no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM puede alojar el modelo en precisión reducida; una RTX 3060, RTX 4060 o superior es suficiente. Para float32 conviene disponer de 6-8 GB.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs de consumo modernas con 6 GB o más.
- Ejecución en CPU: viable; de hecho, la validación publicada se ejecutó offline en CPU.
- Opciones de despliegue: Transformers (versión de referencia 4.57.0), text-generation-inference y endpoints compatibles según los tags. No se incluye conversión GGUF, por lo que llama.cpp u Ollama requerirían una conversión propia no documentada por el autor.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DrishX-1.0 | 494 M | 32.768 configurados (calidad no evaluada) | Apache 2.0 | Hugging Face, tag `v1.0.1` | Finetune de Qwen2.5-Coder-0.5B-Instruct; sin benchmarks publicados |
| Qwen2.5-Coder-0.5B-Instruct | aprox. 0,5B | 32.768 | Apache 2.0 | Hugging Face | Modelo base; dispone de evaluación publicada por el autor original |
| Qwen2.5-Coder-1.5B-Instruct | aprox. 1,5B | 32.768 | Apache 2.0 | Hugging Face | Misma familia, mayor capacidad; requiere más VRAM |
| SmolLM2-360M-Instruct | aprox. 360 M | no disponible en esta ficha | Apache 2.0 | Hugging Face | Alternativa de tamaño similar para generación de texto en inglés |

La comparación de rendimiento cuantitativo no está disponible para DrishX-1.0, ya que no se han publicado benchmarks. Frente a su modelo base, la diferencia principal es el ajuste específico al dominio Drishti, sin que existan métricas que cuantifiquen la mejora o el posible deterioro respecto al original.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de precisión en código, matemáticas o razonamiento; el autor lo declara explícitamente.
- Riesgo de alucinación: el propio autor advierte que el código y los consejos generados pueden ser incorrectos y requieren revisión y pruebas.
- Contexto largo no evaluado: la ventana de 32.768 tokens está configurada, pero la calidad más allá de contextos cortos no se ha medido.
- Idioma: solo inglés declarado; el uso en castellano no está soportado ni validado.
- Capacidades de agente atribuidas a la aplicación: la edición de ficheros, el control de navegador, la recuperación de base de datos y los permisos no forman parte de los pesos; no deben esperarse de un despliegue aislado del modelo.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse la atribución y la licencia upstream de Qwen.
- Sin conversión GGUF: el autor indica que no se incluye y que el GGUF de 7B de la aplicación es un modelo distinto que este release no reemplaza.
- Reproducibilidad: se recomienda fijar la revisión `v1.0.1`, ya que `main` sigue al último release y podría cambiar.
- Hiperparámetros y datos de entrenamiento no documentados: dificulta auditar el ajuste o reproducir el entrenamiento.
- Popularidad muy baja: 981 descargas y 0 likes en el momento de la consulta, sin comunidad que valide su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drishtijs/DrishX-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Dataset DrishtiX (instaladores y datos de referencia): https://huggingface.co/datasets/drishtijs/DrishtiX
- Adaptador Git opcional: https://huggingface.co/drishtijs/DrishX-1.0/tree/main/adapters/git-v1.1.4
- Revisión inmutable: https://huggingface.co/drishtijs/DrishX-1.0/tree/v1.0.1
