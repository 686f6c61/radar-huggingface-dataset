# BasselNashaat/SmolLM3-3B-MedQA

## Resumen

SmolLM3-3B-MedQA es un ajuste fino del modelo base HuggingFaceTB/SmolLM3-3B, desarrollado por BasselNashaat como proyecto final del curso smol-course de Hugging Face. El objetivo del modelo es responder preguntas de examen medico con formato de cuatro opciones (estilo USMLE), empleando un pipeline de SFT y DPO con adaptadores LoRA sobre el modelo base de 3.075.098.624 parametros (aproximadamente 3,08 mil millones).

El modelo parte de la arquitectura de SmolLM3-3B, un transformer decoder-only de la familia SmolLM3 de Hugging Face, y anade una especializacion en dominio medico mediante entrenamiento supervisado sobre MedQA, MedMCQA y medical-o1-reasoning-SFT, seguido de una fase de optimizacion por preferencias (DPO) sobre pares de opciones correcta/incorrecta. La licencia es Apache 2.0, lo que permite uso comercial, aunque el propio autor advierte explicitamente de que se trata de un proyecto educativo y no de un dispositivo medico.

La relevancia del modelo es fundamentalmente metodologica: demuestra como un modelo pequeno (3B) puede mejorar su rendimiento en una tarea concreta mediante un pipeline de SFT + DPO con LoRA bien documentado, pasando del 41,6% al 50,1% en el split de test de MedQA. No obstante, sus cifras absolutas siguen siendo modestas y el autor insiste en que no debe usarse para decisiones medicas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base SmolLM3-3B) |
| Parametros totales | 3.075.098.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del SmolLM3-3B de Hugging Face, un transformer decoder-only de aproximadamente 3,08 mil millones de parametros. El ajuste se realizo en dos fases con adaptadores LoRA gestionados mediante la libreria TRL: una primera fase de SFT (supervised fine-tuning) sobre 7.781 ejemplos de MedQA, 7.500 de MedMCQA y 4.000 de medical-o1-reasoning-SFT, y una segunda fase de DPO (direct preference optimization) sobre 3.000 pares compuestos por la opcion correcta frente a una opcion incorrecta aleatoria.

El autor documenta controles de calidad en el pipeline: se eliminaron las filas que eran casi copias de preguntas de validacion o test, los mejores adaptadores se seleccionaron exclusivamente con el conjunto de validacion, y el modo de razonamiento (thinking mode) se mantuvo desactivado durante la evaluacion. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset mas alla de las tres fuentes citadas, ni innovaciones arquitectonicas adicionales sobre el modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat mediante `apply_chat_template`.
- Respuesta a preguntas de examen medico con formato de cuatro opciones (A/B/C/D), devolviendo la letra y el texto de la opcion.
- Razonamiento de dominio medico limitado, adquirido mediante SFT sobre MedQA, MedMCQA y medical-o1-reasoning-SFT.
- Alineacion de preferencias mediante DPO para favorecer la opcion correcta frente a una incorrecta en contextos de examen.
- Soporte de inferencia con `transformers` y `device_map="auto"`.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Evaluacion academica de pipelines de ajuste fino: el modelo sirve como referencia reproducible de un flujo SFT + DPO con LoRA sobre un modelo de 3B, util para comparar tecnicas de alineacion en cursos y laboratorios.
- Investigacion sobre modelos pequenos en dominios especializados: permite estudiar cuanto conocimiento de dominio se puede inyectar en un modelo de 3B sin escalar parametros, usando MedQA como banco de pruebas controlado.
- Generacion de preguntas de practica para examenes tipo USMLE: el modelo puede producir respuestas a preguntas de cuatro opciones en ingles, adecuado para entornos de simulacion educativa no clinica.
- Prototipado de asistentes de estudio medico: integrado en una aplicacion de repaso, puede ofrecer una respuesta tentativa a preguntas de examen con la advertencia explicita de que no es una fuente clinica.
- Baseline para comparativas de fine-tuning: al estar publicado con licencia Apache 2.0 y pesos safetensors, sirve como punto de partida para experimentos de destilacion o de ajuste adicional en dominios sanitarios.
- Docencia sobre DPO y preferencias: los 3.000 pares correcto/incorrecto documentados permiten ilustrar como se construye un dataset de preferencias para una tarea de opcion multiple.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 1.273 preguntas del split de test de MedQA (USMLE, 4 opciones), no vistas en entrenamiento. La linea base de azar es del 25%.

| Modelo | Overall | Respondio con claridad | Acierto cuando respondio |
|---|---|---|---|
| Sin entrenar (base) | 41,6% | 98,5% | 42,2% |
| SmolLM3-3B-MedQA | 50,1% | 100,0% | 50,1% |

La mejora global es de +8,6 puntos porcentuales (intervalo del 95% aproximado de ±2,9%). El autor senala que parte de la ganancia global proviene de responder con claridad mas a menudo, por lo que la metrica "acierto cuando respondio" es la referencia mas fiable del conocimiento adquirido. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 6,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 8-10 GB.
- VRAM estimada con cuantizacion de 8 bits: en torno a 3-4 GB; con 4 bits, en torno a 2-3 GB (estimaciones derivadas del tamano de parametros, no verificadas en la informacion proporcionada).
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion; RTX 4090, RTX 4080 o RTX 3090 para experimentacion en una sola GPU.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en fp16, y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: `transformers` con `device_map="auto"` es el metodo documentado por el autor; vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible, aunque al tratarse de un modelo basado en SmolLM3-3B serian candidatos habituales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MedQA (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM3-3B-MedQA | 3,08B | no disponible | 50,1% | Apache 2.0 | Hugging Face |
| SmolLM3-3B (base) | 3,08B | no disponible | 41,6% | Apache 2.0 | Hugging Face |
| Modelos medicos de mayor tamano (p. ej. Meditron, BioMistral) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con alternativas de la misma categoria queda limitada porque la informacion proporcionada no incluye resultados de otros modelos medicos en el mismo split ni sus especificaciones completas. La unica comparacion cuantitativa disponible es frente al modelo base sin ajustar.

## Limitaciones y advertencias

- Proyecto educativo: el autor declara explicitamente que no es un dispositivo medico y que no debe usarse para diagnostico, tratamiento ni ninguna decision medica real.
- Rendimiento limitado: con un 50,1% de acierto en MedQA, el modelo falla aproximadamente la mitad de las preguntas de examen; el propio autor indica que "falla muchas preguntas de examen".
- Evaluacion restringida: se probo en un unico dataset de estilo examen, en ingles y con un unico formato de prompt; las respuestas medicas en formato libre no fueron puntuadas.
- Sesgos: no se documentan analisis de sesgos en la informacion disponible; al entrenarse sobre datasets medicos en ingles, es probable que herede sesgos de esas fuentes.
- Riesgo de alucinacion: alto en un modelo de 3B especializado en un dominio tecnico; no hay evaluacion publicada de calibracion ni de tasas de alucinacion fuera del formato de opcion multiple.
- Idioma: solo ingles; no se documenta soporte de castellano ni de otros idiomas.
- Contexto: la longitud de contexto no se especifica en la informacion proporcionada, por lo que no puede garantizarse el manejo de conversaciones o documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero la advertencia del autor sobre el uso clinico prevalece como restriccion etica y de responsabilidad.
- Datos de entrenamiento: no se detalla el volumen total de tokens ni la composicion completa del dataset, lo que dificulta auditar el origen y la calidad de los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BasselNashaat/SmolLM3-3B-MedQA
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Dataset MedQA-USMLE-4-options: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset MedMCQA: https://huggingface.co/datasets/openlifescienceai/medmcqa
- Dataset medical-o1-reasoning-SFT: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- Curso smol-course de Hugging Face: no disponible en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
