# mlboydaisuke/APUS-OpenJev-v1-4B-CoreAI

## Resumen

APUS-OpenJev-v1-4B-CoreAI es un bundle cuantizado del modelo de decisión `apus-ailab/APUS-OpenJev-v1-4B`, un ajuste fino de Qwen3.5-4B especializado en seleccionar una opción entre un conjunto cerrado de criterios. No es un modelo conversacional de propósito general: cada petición aporta un estado, unas instrucciones y entre 2 y 16 criterios ordenados, y el modelo devuelve una distribución de probabilidad sobre esos criterios calculada a partir de los logits del siguiente token correspondientes a las letras A–P. El autor lo describe como modelo de «sistema 1» para selección de acciones de navegador, enrutado de flujos de trabajo y juicios proposicionales.

El paquete lo publica `mlboydaisuke` para Core AI, el runtime de aprendizaje automático en dispositivo de Apple en iOS 27 y macOS 27, sucesor de Core ML. Los modelos PyTorch se exportan con `coreai-torch` (para LLM, `coreai.llm.export`) a bundles `.aimodel` que se ejecutan en la GPU o en el Neural Engine. Este bundle exporta la ruta de texto de 32 capas con el exportador estándar de Qwen3.5-4B, cuantización `int8hu --head-sym` y una ventana de 4.096 tokens.

Su relevancia es doble: por un lado, muestra un patrón de uso de LLM como cabecera de decisión restringida en lugar de generación libre; por otro, es un ejemplo temprano de empaquetado para Core AI. El autor reporta 66/80 (82,50 %) en su panel de desarrollo Frozen80 a profundidad completa y 61/80 a 16 capas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), ruta de texto de 32 capas; se conserva la cabeza LM de vocabulario |
| Parámetros totales | 4B (heredados de Qwen/Qwen3.5-4B; el autor no desglosa el recuento exacto) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens en este bundle exportado; el contrato original rechaza prompts de más de 8.192 tokens |
| Tipos de cuantización | int8 (`int8hu --head-sym`); los pesos fuente son BF16 fusionados (checkpoint-5949) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | bundle `.aimodel` para Core AI (tamaño del repo: 5,8 GB) |

## Arquitectura y entrenamiento

La base es Qwen/Qwen3.5-4B, un transformer decoder-only. El modelo fuente es el resultado de un ajuste fino cuyo checkpoint-5949 se fusionó en BF16, y este repositorio publica una cuantización de ese resultado. El autor conserva la cabeza LM de vocabulario completa, pero el uso previsto no es la generación de texto: la respuesta se obtiene leyendo los logits de un único token, correspondiente a las letras mayúsculas A–P (identificadores 32–47 en este tokenizador), y aplicando `softmax` con temperatura 1 sobre esas posiciones. Para más de 16 criterios no hay etiquetas disponibles.

La innovación principal es el contrato de decisión `jev.dynamic.prompt.v2`. El prompt se compila como un único mensaje de usuario con la plantilla de chat del modelo base, `add_generation_prompt=True` y `enable_thinking=False`; el texto renderizado se codifica con `add_special_tokens=False` y la ranura de respuesta es `len(ids)-1`. El modelo acepta los primitivos `choice`, `noul` y `score_level`, con criterios ordenados que incluyen `id` y `description`. Los estados en JSON deben serializarse como texto. Se rechazan tanto los marcadores multimodales como las entradas que superen el límite de tokens. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Selección de una opción entre 2 y 16 criterios ordenados, devolviendo una distribución de probabilidad y no texto libre.
- Tres primitivos de decisión declarados: `choice` (elección simple), `noul` y `score_level` (puntuación por niveles).
- Enrutado de flujos de trabajo: elección de la siguiente acción dado un estado y unas instrucciones.
- Juicios proposicionales binarios o multietiqueta, según el panel de evaluación del autor (BoolQ, MNLI).
- Decisiones de atribución (attribute decisions) dentro del mismo panel.
- La cabeza LM de vocabulario se conserva, por lo que el artefacto sigue siendo un modelo de lenguaje, aunque no está entrenado para generación abierta.
- Multilingüe limitado a inglés y chino.
- Modo thinking: explícitamente desactivado en el contrato (`enable_thinking=False`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes con razonamiento multi-paso: no disponible como capacidad nativa; el bucle de agente debe orquestarse externamente.
- Visión: no soportada; el contrato rechaza marcadores multimodales.

## Casos de uso

- Selección de acciones de navegador en agentes web: dado el estado de la página (campos visibles, indicadores de carga, historial) y una lista de acciones candidatas, el modelo puntúa cada acción. Es el caso para el que se construyó el panel Frozen80.
- Enrutado de flujos de trabajo: en un pipeline con varias ramas posibles, el modelo recibe la descripción del estado y las ramas como criterios, y devuelve la rama más probable, lo que permite sustituir reglas heurísticas frágiles por una decisión aprendida.
- Moderación y guardarraíles: transformar políticas en criterios discretos y usar la distribución resultante como señal de clasificación para bloquear, permitir o escalar contenido.
- Evaluación automática de respuestas: con el primitivo `score_level`, asignar niveles de calidad a salidas de otros modelos, al estilo del panel HelpSteer3 empleado por el autor.
- Inferencia de lenguaje natural (NLI): determinar si una premisa implica, contradice o es neutral respecto a una hipótesis, con los tres casos como criterios (BoolQ, MNLI en el panel del autor).
- Enrutado de intenciones en atención al cliente: clasificar una consulta entrante en un conjunto cerrado de departamentos o macros antes de invocar un agente conversacional mayor.
- Ejecución en dispositivo en aplicaciones iOS o macOS: al compilarse como bundle `.aimodel`, la decisión puede resolverse en la GPU o el Neural Engine sin salir del dispositivo, útil para flujos con datos sensibles.
- Etiquetado por lotes: al ser una única pasada hacia delante con respuesta de un token, encaja bien en procesos de anotación masiva donde la latencia por elemento es crítica.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones del propio autor sobre un panel de desarrollo reutilizado, no un benchmark ciego ni una tasa de éxito real de navegación.

| Evaluación | Resultado |
|---|---|
| Frozen80 development panel, profundidad completa (32 capas) | 66/80 (82,50 %) |
| Frozen80 development panel, 16 capas | 61/80 |
| Acuerdo de decisión antes/después de la fusión BF16 | 160/160 |
| Máxima diferencia de probabilidad, 32 capas | 0,061457 (umbral declarado ≤0,05, incumplido) |
| Máxima diferencia de probabilidad, 16 capas | 0,092269 (umbral declarado ≤0,05, incumplido) |

El panel cubre decisiones de navegador, HelpSteer3, BoolQ, MNLI y decisiones de atribución. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras baterías estándar en la información disponible. Tampoco hay resultados de throughput medidos sobre este bundle concreto: el dato de 94 tok/s para Qwen3-8B 4-bit en una GPU M4 Max corresponde al runtime Core AI con otro modelo y otro protocolo.

## Requisitos de hardware

- Destinado a ejecución en dispositivo mediante Core AI sobre Apple Silicon, ya sea en la GPU o en el Neural Engine (iOS 27 / macOS 27).
- Huella de memoria estimada: con pesos int8 sobre 4B parámetros, el orden de magnitud esperable es de 4 a 5 GB, coherente con los 5,8 GB del repositorio (que puede incluir más de una variante). No es un dato publicado por el autor.
- Cabe en hardware de consumo: equipos Apple Silicon con Neural Engine; el autor cita una GPU M4 Max como referencia de rendimiento del runtime, aunque con otro modelo.
- GPU de centro de datos (A100, H100, RTX 4090): no disponible; el bundle está empaquetado para Core AI y no se documenta compatibilidad con CUDA.
- Opciones de despliegue: únicamente el runtime Core AI con bundles `.aimodel`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI. Existe un historial de conversión alternativo a MLX, citado en la model card como referencia comparativa.
- Latencia y throughput estimados: no disponibles para este modelo. Al tratarse de una decisión de un solo token, la latencia vendría dominada por el prefill del prompt y no por la decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| APUS-OpenJev-v1-4B-CoreAI | 4B | 4.096 tokens (bundle) | Apache-2.0 | Bundle `.aimodel` para Core AI | Decisión restringida a 2–16 criterios |
| APUS-OpenJev-v1-4B (origen) | 4B | hasta 8.192 tokens en el contrato | no disponible en la información | Pesos BF16 fusionados en HuggingFace | Mismo modelo antes de la cuantización |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible en la información | no disponible en la información | safetensors presumiblemente | Modelo de lenguaje general, sin contrato de decisión |
| Qwen3-8B 4-bit (referencia de runtime) | 8B | no disponible en la información | no disponible en la información | Core AI / MLX | Cifra de 94 tok/s en M4 Max GPU con Core AI frente a 90 con MLX, bajo el mismo protocolo |

No se dispone de comparativas de rendimiento frente a otros modelos de decisión de la misma categoría.

## Limitaciones y advertencias

- No es un modelo de propósito general: fuera del contrato `jev.dynamic.prompt.v2` no se documenta ningún comportamiento fiable.
- La ventana efectiva del bundle es de 4.096 tokens, la mitad del límite de 8.192 que aplica el contrato original del modelo fuente.
- El umbral de fidelidad probabilística declarado por el autor (≤0,05 de diferencia máxima) no se cumple ni a 32 capas (0,061457) ni a 16 capas (0,092269); las probabilidades pueden desplazarse respecto al modelo sin cuantizar.
- El panel Frozen80 es un instrumento de ingeniería reutilizado: no es un benchmark ciego y no mide tasas de éxito reales en tareas de navegador.
- Solo cubre inglés y chino. No hay datos de rendimiento en castellano ni en otras lenguas.
- El repositorio tiene 0 descargas y 0 me gusta en el momento de la consulta, por lo que carece de validación independiente por parte de la comunidad.
- Riesgo de alucinación acotado al espacio de etiquetas: el modelo no puede inventar texto libre fuera de A–P, pero sí puede devolver una distribución mal calibrada o una etiqueta incorrecta con alta confianza.
- Dependencia de plataforma: solo Core AI. Esto limita su uso a hardware Apple reciente y complica el despliegue en infraestructura Linux con CUDA.
- Licencia Apache-2.0: permite uso comercial y modificaciones, con las obligaciones habituales de atribución y conservación del aviso de licencia. Conviene verificar la licencia del modelo base Qwen3.5-4B, no disponible en esta información.
- No se especifican sesgos conocidos, composición del dataset ni proceso de alineación, lo que dificulta la evaluación de riesgos en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/APUS-OpenJev-v1-4B-CoreAI
- Modelo base (origen): https://huggingface.co/apus-ailab/APUS-OpenJev-v1-4B/tree/65797c526c27c4d24f564333779162cd4a64328e (revisión `65797c526c27c4d24f564333779162cd4a64328e`)
- Model card del modelo base y resultado del panel Frozen80: https://huggingface.co/apus-ailab/APUS-OpenJev-v1-4B/blob/65797c526c27c4d24f564333779162cd4a64328e/README.md
- Evaluación fusionada: https://huggingface.co/apus-ailab/APUS-OpenJev-v1-4B/blob/65797c526c27c4d24f564333779162cd4a64328e/merged-evaluation.json
- Benchmark de referencia para Apple Silicon: https://github.com/john-rocky/apple-silicon-llm-bench
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Resultados de la búsqueda web: no se ha recuperado ningún enlace relevante sobre este modelo; los resultados obtenidos corresponden a letras de canciones navideñas y no guardan relación con el objeto de la ficha.
