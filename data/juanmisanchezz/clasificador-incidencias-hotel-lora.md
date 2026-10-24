# juanmisanchezz/clasificador-incidencias-hotel-lora

## Resumen

`juanmisanchezz/clasificador-incidencias-hotel-lora` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen3-0.6B`, un transformer denso de 0,6 mil millones de parámetros. Lo desarrolla el usuario juanmisanchezz en el contexto de un máster de AI Engineering, y su función es convertir mensajes de huéspedes de hotel en un JSON con tres campos: categoría (`habitacion`, `facturacion`, `instalaciones`, `consulta`), prioridad (`alta`, `media`, `baja`) y una respuesta breve para el huésped.

No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador (r=8, alpha=16, dropout=0,05 sobre las proyecciones q, k, v, o, gate, up y down), por lo que es necesario descargar Qwen3-0.6B y superponer el adaptador con `peft`. El interés práctico está en que demuestra un flujo completo de ajuste fino supervisado (SFT) de muy bajo coste: el entrenamiento completo (2 épocas, learning rate 2e-4, batch efectivo 8, semilla 42) tardó 11,8 minutos en un MacBook Air M4 de 16 GB usando MPS.

La relevancia es doble: por un lado, sirve como plantilla reproducible para tareas de clasificación estructurada con modelos pequeños en español; por otro, sus propios resultados acotan el alcance real del artefacto, ya que sobre 30 casos de test sintéticos acierta categoría y prioridad simultáneamente en 22 de 30, frente a 6 de 30 del modelo base sin adaptador. El autor lo declara explícitamente como ejercicio de aprendizaje y no como sistema listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso (modelo base Qwen/Qwen3-0.6B) |
| Parámetros totales | Modelo base: 0,6 B. Adaptador: número exacto no disponible en la información proporcionada (r=8 sobre q, k, v, o, gate, up, down) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No indicada en la model card. El modelo base Qwen3-0.6B declara 32.768 tokens nativos según su documentación |
| Tipos de cuantización | El adaptador se distribuye en safetensors (precisión del entrenamiento); no se documentan versiones cuantizadas del adaptador ni del conjunto fusionado |
| Idiomas soportados | Español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`) |
| Tamaño del repositorio | 0,0 GB (según HuggingFace) |
| Pipeline declarado | text-generation |
| Etiquetas | peft, lora, sft, trl, text-generation |
| Fecha de creación / actualización | 2026-10-24 / 2026-10-24 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-0.6B, un transformer decoder-only denso. El ajuste es un SFT con LoRA de rango 8 y alpha 16, dropout 0,05, inyectado en las proyecciones de atención (q, k, v, o) y en las del bloque feed-forward (gate, up, down). Se entrenaron 2 épocas con learning rate 0,0002, batch 2 con acumulación de gradiente 4 (batch efectivo 8) y semilla 42. La pérdida se calcula únicamente sobre la respuesta del asistente, no sobre las instrucciones del sistema ni el turno del usuario, lo que concentra el aprendizaje en el formato JSON de salida y en la decisión de categoría y prioridad.

Los datos son íntegramente sintéticos: 240 ejemplos de entrenamiento construidos a partir de 40 situaciones redactadas de 6 formas distintas, más 30 de validación y 30 de test con situaciones no vistas en entrenamiento. Las etiquetas se generaron a partir de un contrato que define las categorías y las reglas de prioridad; no se usaron datos reales de huéspedes. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal ni fases de RLHF/DPO). El uso previsto exige las mismas instrucciones de sistema que en el entrenamiento y la plantilla de chat con `enable_thinking=False`, lo que implica que el modo de razonamiento de Qwen3 debe desactivarse en inferencia.

## Capacidades

- Clasificación de texto en cuatro categorías cerradas: habitación, facturación, instalaciones y consulta.
- Asignación de prioridad en tres niveles: alta, media y baja.
- Generación de una respuesta breve (una o dos frases) dirigida al huésped.
- Salida estructurada en JSON con las tres claves (`categoria`, `prioridad`, `respuesta`); en test produjo JSON válido en 30 de 30 casos.
- Comprensión de mensajes en español con distintas formulaciones de una misma situación (el entrenamiento cubre 6 variantes por situación).
- Capacidad de few-shot implícita: el autor reporta que el modelo base con 5 ejemplos en el prompt alcanza 14/30 en categoría y prioridad, y el adaptador 22/30.
- No documentado: tool calling, function calling, uso como agente multi-paso, visión, audio ni otras modalidades.
- No documentado: otras lenguas distintas del español.

## Casos de uso

- Triaje interno de tickets de huésped: el adaptador etiqueta cada mensaje con categoría y prioridad, lo que permite enrutar automáticamente a recepción, facturación o mantenimiento. Adecuado porque la salida es JSON parseable y el coste computacional de un modelo de 0,6 B es mínimo, aunque requiere revisión humana por la tasa de error observada.
- Enrutado de correos en una bandeja compartida: integrar el modelo como paso previo a un clasificador de colas (housekeeping, mantenimiento, administración) usando la categoría predicha como etiqueta.
- Priorización de la cola de atención: usar el campo `prioridad` para ordenar la bandeja de entrada y garantizar que las incidencias marcadas como altas se atiendan primero; conviene añadir una regla de negocio que eleve a `alta` cualquier caso dudoso.
- Generación de borradores de respuesta: el campo `respuesta` sirve como primer borrador que un agente humano revisa y edita; el autor advierte que la frase es prácticamente fija por categoría, por lo que no debe enviarse sin supervisión.
- Etiquetado asistido para construir datasets: usar el adaptador para preetiquetar un corpus real de mensajes y corregir manualmente las discrepancias, aprovechando que reduce el coste frente a anotar desde cero.
- Clasificación en local o en el borde: al partir de un modelo de 0,6 B, el conjunto puede ejecutarse en un portátil sin GPU dedicada (el entrenamiento se hizo en un MacBook Air M4), lo que facilita prototipos con datos que no deben salir del dispositivo.
- Material docente y plantilla de SFT: el repositorio documenta hiperparámetros, composición del dataset y resultados, y sirve como referencia reproducible para tareas de clasificación estructurada con LoRA en español.
- Base para un ajuste posterior: el adaptador puede servir de punto de partida para un fine-tuning con datos reales anonimizados de un establecimiento concreto.

## Benchmarks y rendimiento

Únicos datos publicados por el autor, sobre 30 casos de test sintéticos. El criterio de acierto en la columna «Las dos» exige acertar categoría y prioridad simultáneamente, sin corregir el JSON.

| Configuración | JSON válido | Categoría | Prioridad | Categoría y prioridad |
|---|---|---|---|---|
| Qwen3-0.6B con instrucciones | 30/30 | 23/30 | 9/30 | 6/30 |
| Instrucciones + 5 ejemplos en el prompt | 30/30 | 22/30 | 18/30 | 14/30 |
| Con este adaptador LoRA | 30/30 | 28/30 | 24/30 | 22/30 |

No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,2 GB para el modelo base en bf16/fp16, más unos pocos MB del adaptador; aproximadamente 0,6 GB en int8 y 0,4 GB en cuantización de 4 bits. Son estimaciones por tamaño de parámetros, no medidas publicadas.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 2 GB o más de VRAM (GTX 1650, RTX 3060, RTX 4060, RTX 4090) es suficiente; también funciona en CPU y en Apple Silicon vía MPS, como demuestra el entrenamiento en un MacBook Air M4 de 16 GB.
- GPU de datacenter (A100, H100) innecesarias para este tamaño; solo tendrían sentido para servir muchas réplicas en paralelo.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada por el autor), y previa fusión del adaptador (`merge_and_unload`) y conversión a GGUF, motores como llama.cpp u Ollama. vLLM y TGI admiten adaptadores LoRA, pero no se documenta ni se ha verificado su uso con este repositorio.
- Latencia y throughput: no disponibles. El único dato temporal publicado es el de entrenamiento (11,8 minutos en un MacBook Air M4 de 16 GB con MPS).
- Requisito de integración: hay que replicar las instrucciones de sistema del entrenamiento y usar la plantilla de chat con `enable_thinking=False`; obviarlo degrada la calidad de la salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| clasificador-incidencias-hotel-lora (este) | 0,6 B + adaptador LoRA r=8 | No indicado en la model card (base Qwen3-0.6B: 32.768 tokens según su documentación) | Clasificación cerrada en JSON, español | Apache 2.0 | 22/30 en categoría y prioridad (test propio de 30 casos) |
| Qwen/Qwen3-0.6B con instrucciones (sin adaptador) | 0,6 B | 32.768 tokens según documentación del modelo base | Modelo generalista, mismo tokenizador y plantilla | Apache 2.0 | 6/30 en categoría y prioridad en el mismo test |
| Qwen/Qwen3-0.6B con 5 ejemplos en el prompt | 0,6 B | Igual que el anterior | Few-shot mediante prompting, sin entrenamiento | Apache 2.0 | 14/30 en categoría y prioridad en el mismo test |

No se dispone de datos verificados en la información proporcionada para comparar con otras alternativas de la misma categoría (por ejemplo Qwen2.5-0.5B-Instruct, SmolLM2-360M-Instruct o Llama-3.2-1B-Instruct): no hay resultados de benchmarks equivalentes ni evaluación sobre el mismo conjunto de test, por lo que cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: sin cargar Qwen/Qwen3-0.6B y aplicar `PeftModel.from_pretrained` no funciona.
- Evaluación muy reducida: 30 casos de test, todos sintéticos y en español, generados a partir de las mismas 40 situaciones del contrato de etiquetado. La generalización a mensajes reales de huéspedes no está medida.
- Tasa de error relevante: falla en 8 de 30 casos, con especial dificultad en la prioridad (24/30 de acierto). Un 20-27 % de error es incompatible con un uso desatendido.
- Respuesta al huésped prácticamente fija por categoría: el propio autor advierte que no está pensada para enviarse a clientes reales sin revisión humana.
- Riesgo de alucinación en el campo `respuesta` y de coherencia entre categoría y prioridad; el JSON puede ser sintácticamente válido y semánticamente incorrecto.
- Sesgos derivados del contrato de etiquetado sintético: las reglas de prioridad son invención del autor y no reflejan necesariamente las de un hotel real, por lo que el modelo hereda esos criterios.
- Cobertura lingüística limitada al español; no se documenta comportamiento en catalán, gallego, euskera, inglés u otras lenguas habituales en entornos turísticos.
- Limitación de razonamiento inherente a un modelo base de 0,6 B, especialmente en mensajes largos, ambiguos o con varias incidencias mezcladas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificaciones, pero se debe conservar el aviso de licencia y verificar las condiciones del modelo base Qwen3-0.6B, también Apache 2.0 según la información disponible.
- Protección de datos: cualquier uso con mensajes reales implica tratar datos personales de huéspedes; el repositorio solo se ha entrenado con datos sintéticos y no incluye salvaguardas de privacidad.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni issues documentados; no hay garantía de soporte.
- No hay resultados publicados en benchmarks estándar, ni pruebas de tool calling, agentes o multimodalidad.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/juanmisanchezz/clasificador-incidencias-hotel-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL (entrenamiento SFT): https://github.com/huggingface/trl
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relacionado con este modelo. Los resultados devueltos corresponden a Middle East Airlines (mea.com.lb, digital.mea.com.lb, Wikipedia) y no guardan relación con el adaptador ni con su autor, por lo que se descartan.
