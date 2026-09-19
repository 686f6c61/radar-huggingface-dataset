# AwaleSagar/gpio-llm-nano-rpi5

## Resumen

gpio-llm-nano-rpi5 es un modelo de lenguaje de 4.960.704 parámetros entrenado desde cero por el usuario AwaleSagar para una única tarea: convertir una petición en inglés sobre los pines GPIO de una Raspberry Pi 5 en una acción JSON canónica, por ejemplo `{"action":"gpio_write","pin":17,"value":"HIGH"}`. Es la talla intermedia de la familia GPIO-LLM, pensada como candidata para placas de un solo núcleo (Pi Zero / Pi 1), y forma parte de un proyecto que incluye motor de inferencia en C y scripts de entrenamiento publicados en GitHub.

Técnicamente es un `LlamaForCausalLM` denso de 6 capas, `d_model` 192, 6 cabezas de dimensión 32, FFN SwiGLU de 512, RoPE con theta 10000, RMSNorm con epsilon 1e-05 y embeddings atados. El vocabulario es un BPE a nivel de byte de 12.000 tokens y la ventana de contexto es de solo 256 tokens, coherente con su dominio de uso: instrucciones cortas de control de hardware, no conversación general.

Su relevancia es la de los modelos ultraespecializados en el borde: cabe en el formato int8 Q8_0 (unos 5 MB) y se ejecuta con un motor C propio, sin Python ni framework de ML, directamente sobre la placa. Frente a un modelo generalista, no compite en conocimiento, sino en fiabilidad de formato y en coste de despliegue. El autor advierte explícitamente de que no es una capa de seguridad: antes de validación determinista, un 4,11 % de las filas de rechazo o aclaración del split `eval` se convierten en acciones ejecutables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder denso): 6 capas, d_model 192, 6 cabezas (head_dim 32), FFN SwiGLU 512, RoPE theta = 10000, RMSNorm epsilon = 1e-05, embeddings atados |
| Parametros totales | 4.960.704 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | fp32 (`model.safetensors`) e int8 Q8_0 con grupos de 32 (`nano.gllm`, motor C) |
| Idiomas soportados | Ingles (`en`) unicamente |
| Licencia | cc-by-4.0 |
| Formato de pesos | `model.safetensors` (fp32) para transformers; `nano.gllm` (int8) para el motor C propietario; tokenizador byte-level BPE `gpio_llm_bpe_12k.gltk`; gramatica `grammar_v2.txt` |
| Vocabulario | 12.000 tokens (byte-level BPE `gpio_llm_bpe_12k`) |
| Formato de prompt | `User: <peticion>\nAssistant:`, con linea opcional previa `Context: {...}`; respuesta precedida de espacio y terminada en `<|endoftext|>` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder estilo Llama de 6 capas y 4,96 M de parámetros, con atención de 6 cabezas de 32 dimensiones cada una, embeddings atados y normalización RMSNorm. Es un diseño deliberadamente minimalista: la ventana de 256 tokens y el vocabulario de 12.000 piezas bastan para la tarea objetivo y reducen al mínimo el coste de memoria y de cálculo en placas ARM de gama baja.

El entrenamiento tuvo dos fases, ambas ejecutadas en una única RTX 4090 alquilada (24 GB), con PyTorch 2.11, CUDA 12.8 y transformers 5.17. El preentrenamiento usó 550 M de tokens de `fineweb-edu-dedup` (corpus SmolLM) durante 1 época, con 8.392 pasos de 65.536 tokens y LR 0.003 con decaimiento coseno en bf16, alcanzando una pérdida de validación de 3,6253 (perplejidad 37,5) sobre 0,5 M de tokens reservados; duró 10,4 minutos. La tasa de aprendizaje se eligió con un barrido sobre la forma nano a 55 M de tokens (0.001 → 4,5915; 0.002 → 4,2903; 0.003 → 4,1836; 0.005 → 4,1985 de pérdida de validación).

La fase de SFT consumió las 1.678.821 filas de entrenamiento v2 durante 2 épocas (13.116 pasos de 256 filas), con pérdida calculada solo sobre los tokens de la respuesta y una repetición cada 12 pasos de 4×256 tokens en inglés (aproximadamente el 1,1 % de los tokens de pérdida) para mitigar el olvido catastrófico; el resultado fue una pérdida por token de respuesta de 0,0224 en `eval_core`, en 9,3 minutos. No se documenta uso de RLHF ni DPO; el ajuste es supervisado sobre etiquetas JSON canónicas generadas por plantillas.

## Capacidades

- Generación de texto restringida a dominio: traduce peticiones en inglés sobre la cabecera GPIO a un objeto JSON de acción (`gpio_write`, etc.), con forma canónica y orden de claves irrelevante a efectos de comparación.
- Salida estructurada garantizada en el motor C: la decodificación se realiza bajo una gramática construida a partir de las etiquetas de entrenamiento, de modo que la salida es siempre una de las formas JSON del dataset (100,00 % de JSON válido en `eval_core` con gramática).
- Interpretación de contexto opcional en la misma línea de prompt: acepta `Context: {"device_mappings":{"fan":23}}` o `Context: {"available_pins":[16,17,18,25]}` antes de la petición del usuario para resolver alias de dispositivos o pines disponibles.
- Diálogo de aclaración multiturno: soporta el formato `Assistant: <pregunta>\nUser: <respuesta>\nAssistant:` para pedir o recibir información adicional antes de emitir la acción.
- Detección de peticiones ambiguas o fuera de dominio: el dataset incluye filas de rechazo y aclaración, aunque el modelo no las respeta con fiabilidad absoluta (véase limitaciones).
- No dispone de tool calling genérico, function calling, visión, audio, matemáticas, razonamiento general ni capacidades multilingües; el único idioma entrenado es el inglés.
- No es un modelo de propósito general: su vocabulario y sus 550 M de tokens de preentrenamiento limitan severamente cualquier uso fuera del control de GPIO.

## Casos de uso

- Control de GPIO en Raspberry Pi 5 sin Python: el motor C `gpiollm` carga `nano.gllm` junto con el tokenizador y la gramática, de modo que un script de shell o un servicio del sistema puede traducir una frase a JSON y ejecutar la acción sin arrastrar dependencias de ML.
- Pasarela de lenguaje natural para domótica local: una aplicación escucha comandos de voz o texto, el modelo los convierte en JSON y un validador determinista comprueba pines y valores antes de escribir en el hardware; la ventana de 256 tokens es suficiente porque cada comando es una línea.
- Despliegue en placas de un solo núcleo: el autor lo propone como candidato para Pi Zero y Pi 1 (aún sin medir en esas placas), donde los ~5 MB de pesos int8 y el motor sin framework son viables frente a modelos de cientos de millones de parámetros.
- Generación de acciones con mapeo de dispositivos: usando la línea `Context: {"device_mappings":{...}}`, el modelo resuelve alias como «fan» o «red_led» a un número de pin concreto, útil en instalaciones donde el cableado cambia entre unidades.
- Aclaración interactiva antes de actuar: en un asistente embebido, el modelo puede devolver una pregunta cuando la petición es ambigua («enciende la luz» sin pin especificado) y cerrar la acción con la respuesta del usuario en el siguiente turno.
- Preprocesado de comandos en pipelines de automatización o CI/CD: convertir descripciones textuales de pruebas de hardware a JSON estructurado para que un runner ejecute secuencias de pines de forma reproducible.
- Banco de pruebas y material didáctico: con 4,96 M de parámetros y 20 minutos de entrenamiento documentado en dos etapas, sirve para enseñar preentrenamiento, SFT y decodificación con gramática en un coste de cómputo mínimo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). El exact match compara JSON canónico (mismo objeto, ignorando el orden de claves) con la etiqueta. `eval` son 26.297 filas procedentes de 132 plantillas de fraseo que nunca aparecen en entrenamiento; `eval_core` es un subconjunto estratificado de 5.083 filas.

| Configuracion | Split | Exact match | JSON valido | Ejecucion insegura (*) |
|---|---|---|---|---|
| PyTorch fp32, greedy | eval (26.297 filas) | 93,61 % | 99,98 % | 4,11 % |
| PyTorch fp32, greedy | eval_core (5.083 filas) | 91,82 % | 99,94 % | 4,66 % |
| Motor C int8, sin gramatica | eval_core | 91,70 % | 99,94 % | 4,66 % |
| Motor C int8, con gramatica | eval_core | 91,72 % | 100,00 % | 4,82 % |

(*) Porcentaje de filas de rechazo o aclaración (1.845 en `eval_core`) en las que el modelo produjo en su lugar una acción ejecutable; medido antes de cualquier validador.

Métricas de entrenamiento reportadas: pérdida de validación del preentrenamiento 3,6253 (perplejidad 37,5) sobre 0,5 M de tokens reservados, y pérdida por token de respuesta en `eval_core` tras el SFT de 0,0224. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Pesos en fp32: 4.960.704 parámetros × 4 bytes ≈ 19,8 MB (18,9 MiB), más el tokenizador.
- Pesos int8 Q8_0 con grupos de 32 para el motor C: ≈ 4,96 MB (4,7 MiB), aproximadamente 4× menos que fp32.
- Caché KV: irrelevante a efectos prácticos, dado el contexto máximo de 256 tokens y solo 6 capas.
- Cabe en cualquier GPU de consumo e incluso en CPU pura. El autor reporta medidas en una Raspberry Pi Zero 2 W; no ha medido el modelo en Pi Zero ni Pi 1, que son los objetivos declarados de esta talla.
- Opciones de despliegue documentadas: motor C propio (`make -C gpio-llm/engine`, requiere `nano.gllm`, `gpio_llm_bpe_12k.gltk` y `grammar_v2.txt`) y `transformers` en fp32 con decodificación greedy no restringida. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores, pese a que la ficha incluye las etiquetas `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: no disponibles. La sección de evaluación de la model card se interrumpe en el punto donde se describía la latencia con el motor C.

## Comparativa con modelos similares

La familia GPIO-LLM publica tres tallas del mismo autor y misma tarea. Solo la talla nano dispone de parámetros y métricas en la información proporcionada.

| Modelo | Parametros | Contexto | Tarea | Exact match (eval) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gpio-llm-nano-rpi5 | 4.960.704 | 256 tokens | Peticion en ingles → accion GPIO JSON | 93,61 % | cc-by-4.0 | HuggingFace + motor C |
| gpio-llm-pico-rpi5 | no disponible | no disponible | Peticion en ingles → accion GPIO JSON | no disponible | no disponible | HuggingFace |
| gpio-llm-base-rpi5 | no disponible | no disponible | Peticion en ingles → accion GPIO JSON | no disponible | no disponible | HuggingFace |
| Modelos de proposito general de tamano equivalente (por ejemplo de la familia SmolLM) | no disponible | no disponible | Generacion de texto general | no disponible | no disponible | no disponible |

No se dispone de resultados comparativos frente a modelos generalistas del mismo orden de parámetros, ni en la model card ni en los resultados de búsqueda web, que no devolvieron documentación técnica relevante sobre este modelo.

## Limitaciones y advertencias

- No es una capa de seguridad: el propio autor indica que un validador determinista debe comprobar cada acción contra las reglas de la placa antes de tocar un pin.
- Tasa de ejecución insegura medida antes de validación: 4,11 % en `eval` y 4,66 % en `eval_core` en fp32; con la gramática del motor C sube al 4,82 % en `eval_core`. Son filas de rechazo o aclaración que el modelo convierte en acciones ejecutables.
- Sesgos conocidos: no se documentan análisis de sesgo; el entrenamiento se limita a plantillas sintéticas en inglés y a un corpus de texto educativo, por lo que el comportamiento fuera de ese patrón no está caracterizado.
- Riesgo de alucinación: fuera del formato JSON esperado el modelo puede inventar claves, pines o valores no presentes en el entrenamiento, especialmente cuando la petición no tiene plantilla equivalente.
- Contexto muy corto (256 tokens) y vocabulario de 12.000 piezas: no admite conversaciones largas, documentos ni instrucciones extensas; el prompt de contexto debe caber en una sola línea.
- Idioma: únicamente inglés. No hay evaluación de peticiones en castellano ni en ningún otro idioma.
- Licencia cc-by-4.0: permite uso comercial con atribución, pero impone condiciones de cita y no incluye garantías.
- Adopción nula: 0 descargas y 0 «likes» en el momento de la consulta, y tamaño de repositorio reportado de 0,0 GB; no hay evidencia de uso en producción ni de validación independiente de las métricas.
- Dependencia de artefactos propios: el despliegue int8 requiere el motor C, el tokenizador `.gltk` y la gramática del repositorio de GitHub, fuera del ecosistema estándar de HuggingFace.
- Fecha de publicación futura en los metadatos (2026-09-19), lo que conviene tener en cuenta al citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AwaleSagar/gpio-llm-nano-rpi5
- Repositorio de código, motor C y scripts de entrenamiento: https://github.com/AwaleSagar/gpio-llm
- Dataset de acciones GPIO: https://huggingface.co/datasets/AwaleSagar/gpio-llm-rpi5-actions
- Modelo hermano de talla menor: https://huggingface.co/AwaleSagar/gpio-llm-pico-rpi5
- Modelo hermano de talla mayor: https://huggingface.co/AwaleSagar/gpio-llm-base-rpi5
- Corpus de preentrenamiento citado: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Resultados de búsqueda web: no se encontró documentación técnica, paper, blog ni demo adicional sobre el modelo; las únicas coincidencias recuperadas fueron páginas de códigos postales sin relación con el proyecto.
