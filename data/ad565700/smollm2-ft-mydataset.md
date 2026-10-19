# ad565700/SmolLM2-FT-MyDataset

# SmolLM2-FT-MyDataset

## Resumen

SmolLM2-FT-MyDataset es un ajuste fino (fine-tune) supervisado del modelo HuggingFaceTB/SmolLM2-135M, un transformer decoder-only de 134.515.008 parámetros (unos 134,5 millones) publicado por el usuario ad565700 en Hugging Face. El modelo no introduce arquitectura nueva: hereda íntegramente la del modelo base y solo modifica los pesos mediante SFT con TRL, por lo que su interés no está en capacidades novedosas sino en documentar un proceso de entrenamiento reproducible.

El contexto de publicación es relevante para interpretar qué es este modelo. Las etiquetas del repositorio (smol-course, module_1, trl, sft, generated_from_trainer) lo sitúan como el artefacto de salida del módulo 1 del Smol Course de Hugging Face, un curso sobre modelos pequeños. El repositorio se creó y actualizó el mismo día (19 de octubre de 2026), acumula 15 descargas y 0 likes, y el conjunto de datos de entrenamiento aparece como "MyDataset", sin documentar. Es un ejercicio académico, no un modelo pensado para producción.

En la práctica, su utilidad es la de una plantilla: sirve para verificar un pipeline de SFT completo (tokenizador, chat template, entrenamiento con TRL, publicación en el Hub) y como punto de partida para experimentos de ajuste sobre un modelo de 135M que cabe en cualquier GPU consumer e incluso en CPU. La model card no documenta el dataset, la licencia ni los idiomas, y no se han publicado benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama; heredada de SmolLM2-135M) |
| Parametros totales | 134.515.008 (134,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base SmolLM2-135M declara 8.192 tokens) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors (no hay GGUF, AWQ ni GPTQ publicados) |
| Idiomas soportados | No disponibles (no declarados en la model card) |
| Licencia | No disponible; la model card contiene un marcador sin cumplimentar ("licence: license"). El modelo base SmolLM2-135M se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Tamaño del repositorio | 0,5 GB |
| Pipeline | text-generation |
| Descargas / likes | 15 / 0 |
| Fecha de creación | 2026-10-19 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin cambios: un transformer decoder-only con atención causal, tokenizador propio de SmolLM2 y un chat template conversacional (la model card usa el formato de lista de mensajes con rol "user"). No hay innovaciones técnicas añadidas: ni decodificación especulativa, ni atención lineal, ni mezcla de expertos. El tamaño de 134,5 M de parámetros se confirma a partir de los pesos reales en safetensors.

El entrenamiento consistió en un único proceso de SFT (supervised fine-tuning) ejecutado con TRL 1.16.0 sobre el dataset referido como "MyDataset", cuya composición, número de ejemplos, número de tokens y proceso de filtrado no se detallan en la model card. Tampoco se documentan hiperparámetros (tasa de aprendizaje, épocas, tamaño de lote, precisión), ni si hubo etapas posteriores de RLHF o DPO. El entorno declarado incluye Transformers 5.20.1, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.2; conviene señalar que esos números de versión y las fechas del repositorio (octubre de 2026) son atípicos y deben verificarse antes de reproducir el entrenamiento.

## Capacidades

- Generación de texto conversacional de un solo turno o multi-turno corto, mediante chat template y `pipeline("text-generation")`.
- Respuestas a instrucciones simples en formato pregunta-respuesta, tal como demuestra el ejemplo de la model card (pregunta hipotética sobre una máquina del tiempo).
- Generación de texto libre autoregresiva con control de `max_new_tokens` y `return_full_text`.
- Capacidad de razonamiento, matemáticas y código: no documentada y, por el tamaño del modelo base, muy limitada; no hay evaluación disponible.
- Tool calling / function calling: no documentado ni declarado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no declaradas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Validación de pipelines de SFT de extremo a extremo: el modelo sirve como salida de referencia para comprobar que un script de TRL (tokenización, chat template, guardado en safetensors, subida al Hub) produce un artefacto cargable con `transformers`. Es adecuado porque reproduce exactamente ese flujo y su huella de 0,5 GB permite iterar rápido.
- Docencia y reproducción de cursos: uso como ejemplo en el módulo 1 del Smol Course para ilustrar qué cambia (y qué no) tras un ajuste fino sobre un modelo de 135M, comparando salidas contra el modelo base.
- Pruebas de regresión en CI: cargar el modelo con `pipeline` en un runner con CPU y verificar que la generación no rompe el contrato de la API (formato de entrada de mensajes, campos de salida) antes de desplegar modelos mayores.
- Prototipado de asistentes conversacionales de bajo coste: con 134,5 M de parámetros, el modelo puede dar respuestas cortas en demos y entornos de desarrollo donde el objetivo es validar la interfaz y el flujo de conversación, no la calidad final.
- Experimentos de alineamiento sobre modelos pequeños: al ser un fine-tune de SFT, es un punto de partida razonable para probar DPO o RLHF con presupuesto mínimo, midiendo la degradación o mejora respecto al checkpoint publicado.
- Inferencia en dispositivos con recursos mínimos: los pesos en fp16 ocupan del orden de 270 MB, por lo que el modelo puede ejecutarse en CPU, en placas tipo Raspberry Pi o en portátiles sin GPU para tareas de generación de texto muy acotadas.
- Generación de texto de relleno o sintético en tests: útil para poblar fixtures de pruebas de aplicaciones que consumen un endpoint de generación de texto sin depender de un modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, HellaSwag ni de ningún otro conjunto, y tampoco se aportan comparaciones con el modelo base que permitan cuantificar el efecto del ajuste fino.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 538 MB de pesos; en fp16/bf16, unos 269 MB; en int8, unos 135 MB; en 4 bits, en torno a 70-90 MB. Hay que sumar la memoria del contexto y del runtime (habitualmente unos cientos de MB adicionales).
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo está muy por debajo de la capacidad de estas tarjetas; el cuello de botella será el overhead del runtime, no la VRAM.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales, e incluso en iGPU y en CPU.
- Opciones de despliegue: `transformers` con `pipeline` (soporte nativo, es el método documentado), Text Generation Inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM (compatible con arquitectura Llama, aunque desproporcionado para este tamaño). Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no está publicada en el repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM2-FT-MyDataset | 134,5 M | No disponible (base: 8.192) | Fine-tune SFT conversacional | No disponible | Hugging Face, safetensors, 15 descargas |
| SmolLM2-135M (base) | 135 M | 8.192 tokens | Modelo base preentrenado | Apache-2.0 | Hugging Face, ampliamente utilizado |
| SmolLM2-135M-Instruct | 135 M | 8.192 tokens | Ajustado a instrucciones | Apache-2.0 | Hugging Face, con benchmarks publicados |
| Qwen2.5-0.5B-Instruct | ~0,49 B | 32.768 tokens | Ajustado a instrucciones, multilingüe | Apache-2.0 | Hugging Face, ecosistema amplio |

Nota: los datos de los modelos comparativos provienen de sus respectivas model cards públicas y no de la información proporcionada para este modelo. La comparación relevante es con SmolLM2-135M-Instruct: mismo tamaño y misma familia, pero con licencia declarada, idiomas documentados y evaluaciones publicadas, lo que lo convierte en la opción preferible para cualquier uso real frente a este fine-tune sin documentar.

## Limitaciones y advertencias

- Model card incompleta: no se documentan dataset, hiperparámetros, licencia, idiomas ni evaluación. La cadena "licence: license" es un marcador sin cumplimentar, lo que impide determinar las condiciones de uso comercial.
- Licencia incierta para producción: aunque el modelo base SmolLM2-135M es Apache-2.0, el fine-tune no declara licencia propia; hay que asumir el riesgo legal de usar un artefacto sin términos explícitos.
- Riesgo alto de alucinación: con 134,5 M de parámetros y un ajuste fino sobre un dataset no documentado, la fiabilidad factual es muy baja. No debe usarse para responder consultas de usuarios reales sin verificación.
- Posible sobreajuste al dataset "MyDataset": al desconocerse su tamaño y composición, no se puede descartar que el modelo haya aprendido el estilo o el contenido literal de los ejemplos de entrenamiento, con riesgo de fuga de datos si el dataset contenía información sensible.
- Sesgos no evaluados: no se ha realizado ninguna evaluación de sesgos, toxicidad o seguridad. El modelo base ya presenta sesgos de sus datos de preentrenamiento, que el ajuste fino puede amplificar.
- Idiomas no garantizados: al no declararse idiomas soportados, no hay compromiso de calidad fuera del inglés, idioma dominante en el preentrenamiento de SmolLM2.
- Contexto limitado: aunque el modelo base maneja 8.192 tokens, el ajuste fino no documenta la longitud de secuencia usada en el entrenamiento; secuencias mucho más largas pueden degradar la calidad.
- Metadatos atípicos: las fechas del repositorio (octubre de 2026) y las versiones declaradas de Transformers (5.20.1) y PyTorch (2.11.0) no se corresponden con lanzamientos públicos verificables en el momento de redactar esta ficha, lo que dificulta la reproducibilidad.
- Sin cuantizaciones publicadas: no hay GGUF, por lo que el despliegue en llama.cpp u Ollama requiere conversión propia.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre el modelo (devuelven contenido no relacionado); no se han podido contrastar datos externos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ad565700/SmolLM2-FT-MyDataset
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Repositorio de TRL: https://github.com/huggingface/trl
- Citación de TRL (von Werra et al., 2020): incluida en la model card, sin DOI ni enlace adicional
- Paper, blog o demo del modelo: no disponibles en la información proporcionada
