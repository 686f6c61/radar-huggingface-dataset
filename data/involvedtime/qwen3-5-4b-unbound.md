# Involvedtime/Qwen3.5-4B-Unbound

## Resumen

Qwen3.5-4B-Unbound es un checkpoint derivado de Qwen/Qwen3.5-4B al que se le ha aplicado una ablación de la dirección de rechazo (abliteration) directamente sobre los pesos. No es un fine-tuning ni un ajuste de prompt: el subespacio de rechazo se proyecta fuera de todas las matrices que escriben en el flujo residual, de modo que el modelo deja de emitir negativas de forma sistemática. Lo publica el usuario Involvedtime bajo licencia Apache-2.0, heredada del modelo base de Qwen.

El checkpoint es solo texto: se ha eliminado la torre de visión del Qwen3.5-4B original, lo que reduce el recuento de parámetros hasta los 4.205.751.296 (~0,3 B menos que el modelo completo). La arquitectura es Qwen3_5ForCausalLM con 32 capas, dimensión oculta 2560 y MLP de 9216, en bf16. La presencia conjunta de `self_attn.o_proj` y `linear_attn.out_proj` entre las matrices ablacionadas indica una arquitectura híbrida con capas de atención lineal y capas de atención completa.

Su relevancia es doble: por un lado es un caso práctico de interpretabilidad aplicada (localización y extirpación de una dirección latente de comportamiento); por otro, es una herramienta para investigación en seguridad, red teaming y evaluación de robustez, precisamente porque no rechaza nada. El autor documenta el proceso, los hiperparámetros y una evaluación pequeña pero honesta sobre su alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con atención híbrida (capas de atención lineal `linear_attn` y capas de atención completa `self_attn`); clase `Qwen3_5ForCausalLM`; 32 capas, hidden 2560, MLP 9216 |
| Parametros totales | 4.205.751.296 (4,21 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Pesos publicados en bf16; evaluacion realizada en 4-bit NF4 (bitsandbytes). Otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, shards de ~315 MB; tamano del repo 8,4 GB) |

## Arquitectura y entrenamiento

No hay entrenamiento: el modelo parte de los pesos de Qwen/Qwen3.5-4B (Apache-2.0) y aplica una intervención quirúrgica sobre ellos. Se eliminan las claves de la torre de visión y se reescriben (`model.language_model.*` → `model.*`), y después se ablaciona en bf16. Para cada capa se calcula la diferencia media de residuo entre 24 prompts dañinos y 24 prompts benignos emparejados, lo que define una dirección de rechazo `r`. Todas las matrices que escriben en el flujo residual (`mlp.down_proj`, `self_attn.o_proj`, `linear_attn.out_proj`) se modifican según `W ← W − α · r (rᵀW)`.

El autor documenta que dos rondas con la dirección media no bastaron: sobrevivía un rechazo residual que además se desplazaba entre prompts, lo que indica una dirección distinta y no una versión más intensa de la misma. La pasada final elimina la media más las tres primeras componentes principales de las diferencias por par en cada capa de la 4 a la 31, con α = 1,15. La separabilidad por capa de la dirección de rechazo en el modelo base alcanza su máximo en L17–L21 (~0,71 relativo a la norma media del residuo) y es casi nula en las siete primeras capas.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat propia (`apply_chat_template`).
- Modo de razonamiento explícito: es un modelo de pensamiento; con `enable_thinking=True` en la plantilla de chat emite un bloque de razonamiento previo a la respuesta.
- Ausencia de rechazo: no emite negativas aprendidas ante peticiones que el modelo base rechazaría (0/12 en el conjunto de evaluación del autor).
- Razonamiento aritmético y de conocimiento general básico: 9/12 en el chequeo de capacidad del autor (aritmética, capitales, traducción, conversión de unidades, inversión de cadenas).
- Generación creativa y de ficción sin filtros de contenido.
- Capacidad multimodal: no disponible en este checkpoint (torre de visión eliminada).
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modo thinking permite cadenas de razonamiento, pero no hay evidencia publicada de uso agéntico.

## Casos de uso

- Red teaming y evaluación de seguridad: el modelo sirve como generador de completaciones que un modelo alineado rechazaría, lo que permite construir conjuntos de prueba para clasificadores de contenido, guardrails y filtros de salida en pipelines de moderación.
- Investigación en interpretabilidad: reproducir y variar el experimento de abliteración (24 pares de sondas, α = 1,15, componentes principales por capa) para estudiar cómo se representa el rechazo en el espacio residual de un transformer híbrido de 32 capas.
- Estudio de robustez frente a jailbreaks: al haber eliminado la dirección de rechazo dominante, sirve como línea base para medir cuánto del comportamiento de seguridad de un modelo depende de una única dirección lineal y cuánto de mecanismos distribuidos.
- Escritura de ficción con temáticas adultas o violentas: narrativa negra, terror o drama sin las interrupciones y reformulaciones que introduce un modelo alineado, manteniendo coherencia multi-turno en inglés.
- Generación de datos sintéticos para entrenamiento de clasificadores: producir pares pregunta-respuesta sobre temas sensibles etiquetados para entrenar detectores de contenido dañino con ejemplos positivos difíciles.
- Pruebas de despliegue en hardware muy limitado: con ~3,1 GB de VRAM en 4-bit NF4 y ~7 tok/s en una GPU de portátil de 6 GB, es viable montar un entorno de experimentación local sin infraestructura dedicada.
- Análisis forense y de cumplimiento: verificar empíricamente qué tipos de contenido genera un modelo sin rechazo para documentar riesgos antes de autorizar su uso en una organización.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos sobre 12 prompts retenidos (no usados para ajustar la dirección), decodificación greedy y cuantización 4-bit NF4:

| Metrica | Qwen3.5-4B (base) | Qwen3.5-4B-Unbound |
|---|---|---|
| Tasa de rechazo | 100% (12/12) | 0% (0/12) |
| Perplejidad (2 k tokens de prosa benigna) | 10,13 | 10,92 |
| Chequeo de capacidad (12 preguntas) | 9/12 | 9/12 |
| Separabilidad de la dirección de rechazo por capa | Máximo ~0,71 en L17–L21 | No aplica |

El propio autor advierte que el chequeo de capacidad no es un benchmark: con la misma puntuación, los ítems acertados difieren (este modelo acierta la inversión de cadenas y falla la capital de Australia, que el base acierta). Debe leerse como ausencia de daño sistemático. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras baterías estándar en la información disponible.

## Requisitos de hardware

- VRAM en 4-bit NF4: ~3,1 GB, según medición del autor.
- VRAM en bf16: ~9 GB.
- GPU consumer: cabe holgadamente en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) en bf16 y en tarjetas de 6 GB en 4-bit; el autor reporta ~7 tok/s en una GPU de portátil de 6 GB.
- GPU de datacenter: A100, H100 o L40S no son necesarias para un modelo de 4,21 B; permiten lotes grandes y mayor throughput, pero no hay cifras publicadas.
- Opciones de despliegue: transformers con `device_map="auto"` (documentado por el autor); vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint y requerirían conversión o verificación previa, dado que la arquitectura híbrida con atención lineal puede no estar soportada en todos los runners.
- Latencia y throughput: ~7 tok/s en GPU de portátil de 6 GB con 4-bit NF4 (dato del autor). Sin cifras para otros hardwares.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo | Licencia | Notas |
|---|---|---|---|---|---|
| Involvedtime/Qwen3.5-4B-Unbound | 4,21 B (solo texto) | No disponible | 0% (12/12 evaluados) | Apache-2.0 | Pesos bf16; abliteración con media + 3 componentes principales, α = 1,15 |
| Qwen/Qwen3.5-4B | ~4,5 B (incluye torre de visión) | No disponible | 100% (12/12 evaluados) | Apache-2.0 | Modelo base; multimodal; perplejidad 10,13 |
| Otras alternativas abliterated de ~4 B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparación directa solo es posible contra el modelo base, del que se derivan todos los números. No se han encontrado en la búsqueda web fuentes independientes ni fichas de modelos comparables que permitan una tabla más amplia.

## Limitaciones y advertencias

- El modelo no rechaza. Genera instrucciones para actividades ilegales, peligrosas o dañinas. Es su propósito declarado y también su riesgo principal; el autor pide explícitamente usarlo solo cuando exista legitimidad legal y ética.
- La abliteración elimina el comportamiento, no el conocimiento: la capacidad técnica permanece prácticamente intacta, pero desaparece el juicio sobre cuándo aplicarla. No hay salvaguarda residual que filtre la petición.
- La evaluación se apoya en 24 pares de sondas y 12 prompts retenidos. Es suficiente para localizar una dirección y demostrar un efecto grande, pero no es un benchmark; un conjunto independiente de prompts encontrará rechazos que este no detectó.
- La tasa de rechazo se puntuó con una lista de marcadores y revisión manual por muestreo, no con un clasificador independiente.
- Regresión de perplejidad: de 10,13 a 10,92 sobre 2 k tokens de prosa benigna, un deterioro de aproximadamente el 8%.
- Degeneración en generaciones largas: pasadas unas 20 líneas el modelo empieza a repetir frases literalmente. El autor recomienda `no_repeat_ngram_size=6` y `repetition_penalty=1.10` en cualquier uso en producción.
- Solo inglés. No hay soporte multilingüe declarado, pese a que el modelo base probablemente lo tenga; no se ha evaluado su conservación tras la abliteración.
- Sin visión: la torre multimodal fue eliminada, así que no puede procesar imágenes aunque el modelo base sí.
- Longitud de contexto no documentada en esta ficha; conviene verificarla contra la configuración del modelo base antes de diseñar aplicaciones con contexto largo.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo (por ejemplo, la AI Act europea o la DSA) recae íntegramente en quien despliega el modelo.
- Los resultados están medidos en 4-bit NF4 mientras que los pesos publicados son bf16; el comportamiento en bf16 puede diferir ligeramente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Involvedtime/Qwen3.5-4B-Unbound
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog o repositorio del autor: no disponible en la informacion proporcionada.
- Demo o espacio de prueba: no disponible en la informacion proporcionada.
- Resultados de la busqueda web: no se han encontrado enlaces tecnicos relevantes; los resultados devueltos corresponden a sitios de contenido para adultos sin relación con el modelo y se descartan como fuentes.
