# Rockerleo/htd-llama-3.2-3b-sft-lora

## Resumen

htd-llama-3.2-3b-sft-lora es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo meta-llama/Llama-3.2-3B-Instruct, desarrollado por el usuario Rockerleo en el marco del proyecto *Hold the disclosure* para el Lexsi AI Safety Hackathon 2026 (Track 1). El objetivo del adaptador es que un asistente de soporte bancario mantenga las advertencias de riesgo obligatorias a lo largo de cinco turnos de conversación frente a la presión del cliente, sin rechazar la petición ni sermonear, en inglés, hindi en devanagari e hinglish romanizado.

El modelo aborda un problema concreto de seguridad conversacional: la erosión de divulgaciones regulatorias en diálogos multi-turno. El banco y los productos son ficticios. El adaptador tiene un tamaño de repositorio de 0,1 GB, lo que corresponde únicamente a los pesos LoRA, no al modelo base completo.

La relevancia del adaptador es metodológica y de evaluación más que de producto: introduce una métrica específica (DR@5, tasa de retención de divulgaciones en el turno 5) y documenta de forma explícita una limitación importante detectada en una comprobación post hoc, la retención por repetición, que reduce sustancialmente la ganancia real medida. Es un ejemplo poco habitual de model card que publica resultados de robustez adversos a su propia métrica principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Llama 3.2) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la información) |
| Tipos de cuantizacion | base entrenada en 4 bits; no se detallan otras cuantizaciones del adaptador |
| Idiomas soportados | en, hi (incluye hinglish romanizado) |
| Licencia | llama3.2 (heredada del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 sobre meta-llama/Llama-3.2-3B-Instruct. El entrenamiento se realizó con TRL 0.29.1 mediante SFT, con learning rate 1e-4, una época, semilla 1 y el modelo base cargado en 4 bits. El conjunto de entrenamiento son 858 filas del archivo `pairs_v2/sft_train.jsonl` del dataset Rockerleo/hold-the-disclosure.

Los datos son diálogos sintéticos sobre un banco ficticio, con una escalera de presión (pushback) guionizada a lo largo de cinco turnos, en tres variantes de script lingüístico (inglés, hindi en devanagari e hinglish romanizado). No se menciona uso de RLHF ni DPO. La innovación principal no es arquitectónica sino de evaluación: la definición de la métrica DR@5 y la verificación con un comprobador de reglas que premia la presencia de hechos clave, no la literalidad jurídica completa. La comprobación post hoc de robustez (fresh DR@5 y HD@5) constituye el elemento técnico más relevante del trabajo.

## Capacidades

- Generación de texto conversacional multi-turno (hasta cinco turnos de presión documentados).
- Retención de divulgaciones de riesgo requeridas en respuestas de soporte bancario, en inglés, hindi y hinglish romanizado.
- Mantenimiento del tono de ayuda sin rechazos ni sermones, según el diseño del proyecto.
- Respuesta a tácticas de presión del cliente definidas en el dataset (pushback guionizado).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües limitadas a en e hi según los tags del repositorio.

## Casos de uso

- Investigación en seguridad conversacional: el adaptador sirve como caso de estudio reproducible para medir la retención de divulgaciones regulatorias en diálogos multi-turno, con métricas y código de evaluación publicados en el repositorio del proyecto.
- Evaluación de robustez de adaptadores LoRA: permite replicar el análisis de retención por repetición comparando DR@5 con fresh DR@5 y HD@5 sobre líneas de presión nuevas.
- Prototipado de asistentes de cumplimiento normativo: útil para experimentar con plantillas de divulgación obligatoria en entornos simulados antes de diseñar un sistema real con datos propios.
- Estudio de comportamiento multilingüe en hinglish: el adaptador permite comparar la retención de disclosures entre inglés, devanagari y romanización, un escenario poco cubierto en modelos pequeños.
- Docencia y hackathons: como ejemplo completo de pipeline SFT con TRL, PEFT y evaluación estadística (bootstrap pareado, test de McNemar) sobre un modelo de 3B.
- Referencia metodológica para model cards: ilustra cómo documentar una limitación post hoc que reduce la métrica principal, útil como plantilla de transparencia en equipos de evaluación.

## Benchmarks y rendimiento

| Split | Base DR@5 | Adaptador DR@5 | Cambio (puntos) [IC 95%] | McNemar p |
|---|---|---|---|---|
| test (líneas de presión no vistas) | 0,0% | 50,0% | +50,0 [+38,3, +61,7] | 1,9e-09 |
| held-out (productos y tácticas no vistos) | 11,7% | 68,3% | +56,7 [+41,7, +70,0] | 5,4e-09 |

| Split | Base DR@5 | Base fresh DR@5 | Adaptador DR@5 | Adaptador fresh DR@5 |
|---|---|---|---|---|
| test | 0,0% | 0,0% | 50,0% | 13,3% |
| held-out | 11,7% | 10,0% | 68,3% | 25,0% |

| Productos | Helpful (turno 5, panel de 3 LLMs) |
|---|---|
| disclosure products | 73% (n=60) |
| control products | 55% (n=60) |

La métrica DR@5 se calcula sobre 60 diálogos (20 por script) y mide la proporción de respuestas en el turno 5 que declaran todas las divulgaciones requeridas según el comprobador de reglas del proyecto. La métrica helpfulness es una medida automática con panel de tres LLMs, no etiquetas humanas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB; requiere cargar el modelo base Llama-3.2-3B-Instruct, cuyo peso en precisión completa ronda los 6 GB en fp16 y aproximadamente 2 GB en cuantización de 4 bits.
- Entrenamiento realizado con base en 4 bits, lo que sugiere viabilidad en GPU consumer con VRAM moderada; no se especifica la GPU utilizada.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño del modelo base, cabría esperar funcionamiento en RTX 3090/4090 con cuantización, pero no se documenta.
- Despliegue: la model card solo muestra carga con transformers y PEFT (`PeftModel.from_pretrained`). No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| htd-llama-3.2-3b-sft-lora | LoRA sobre 3B | no disponible | Retención de disclosures multi-turno (en/hi/hinglish) | llama3.2 | Hugging Face |
| meta-llama/Llama-3.2-3B-Instruct (base) | 3B | no disponible en la información | Asistente general | llama3.2 | Hugging Face |
| Adaptadores Tiny Aya (mencionados en la model card) | no disponible | no disponible | Investigación | solo investigación no comercial | no disponible |

La model card menciona adaptadores Tiny Aya como alternativas del mismo proyecto, restringidos a investigación no comercial, pero no proporciona especificaciones ni resultados comparables. No se dispone de datos de benchmarks de modelos de terceros en la información proporcionada.

## Limitaciones y advertencias

- Retención por repetición: la mayoría de las respuestas del turno 5 que pasan el comprobador copian una respuesta anterior del propio modelo (similitud ≥ 0,9 según difflib), también en productos de control. La métrica fresh DR@5 cae a 13,3% en test y 25,0% en held-out, frente al 50,0% y 68,3% de DR@5. DR@5 debe leerse como cota superior.
- Un panel de LLMs considera las respuestas copiadas útiles la mitad de las veces que las respuestas frescas; aproximadamente un tercio de la ganancia en DR@5 se atribuye a repetición.
- Datos completamente sintéticos sobre un banco ficticio; 20 diálogos de test por script y una escalera de presión guionizada, lo que limita la generalización.
- El comprobador de reglas premia hechos clave, no la literalidad jurídica completa de las divulgaciones.
- No apto para asesoramiento financiero real ni para despliegue en producción, según el propio autor.
- Idiomas limitados a inglés, hindi y hinglish romanizado; no se documenta comportamiento en castellano ni en otros idiomas.
- Licencia llama3.2 heredada del modelo base, con las restricciones de uso comercial que impone la licencia de Llama 3.2; los adaptadores Tiny Aya mencionados son solo para investigación no comercial.
- Riesgo de alucinación inherente al modelo base de 3B; no se documentan evaluaciones específicas de sesgo.
- Sin descargas ni likes en el momento de la consulta; sin pipeline declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rockerleo/htd-llama-3.2-3b-sft-lora
- Dataset: https://huggingface.co/datasets/Rockerleo/hold-the-disclosure
- Repositorio del proyecto: https://github.com/MohitGoyal09/HoldTheDisclosure
- Informe completo: `docs/REPORT.md` en el repositorio anterior
- Resultados completos: `docs/RESULTS_FULL.md` en el repositorio anterior
- Robustez: `docs/RESULTS_ROBUSTNESS.md` (secciones 8 y 9) en el repositorio anterior
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
