# odelpa/qwen3-8b-chem-v5

## Resumen

qwen3-8b-chem-v5 es un adaptador QLoRA de rango 16 publicado por Giovanni Del Papa (odelpa), investigador independiente, sobre el modelo base Qwen/Qwen3-8B. No es un modelo completo: es un conjunto de pesos de adaptador (unos 43,6 millones de parámetros entrenables) que se aplica sobre las proyecciones de atención y MLP del transformer de Qwen3-8B para especializarlo en conocimiento y razonamiento químico. Se distribuye con licencia Apache-2.0, la misma del modelo base.

El adaptador se entrenó durante una época sobre 11.839 ejemplos de química con licencias permisivas (4,70 millones de tokens), en una única GPU de portátil de 12 GB (RTX 4080), en unas 2,15 horas. El autor publica un artículo con DOI en Zenodo y un protocolo de evaluación con intervalos de confianza bootstrap, lo que lo hace inusualmente transparente para un adaptador de este tamaño.

Su relevancia es doble: por un lado, demuestra que es viable especializar un modelo de 8B en un dominio científico con hardware de consumo; por otro, el propio autor documenta una discrepancia importante entre el split de desarrollo (mejora no significativa) y el test sellado (mejora de +5,02 puntos), lo que convierte esta ficha en un caso útil para discutir la fiabilidad de las evaluaciones en adaptadores pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/QLoRA (PEFT) sobre transformer Qwen3-8B; rango 16, alpha 32, dropout 0,05, aplicado a q, k, v, o, gate, up, down |
| Parametros totales | No disponible (el adaptador tiene ~43,6 M parámetros entrenables; el modelo base Qwen3-8B tiene 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el entrenamiento usó max_sequence_length de 2048; el contexto del base Qwen3-8B no se detalla) |
| Tipos de cuantizacion | Entrenamiento y evaluación en 4-bit NF4; GGUF Q4_K_M disponible vía Ollama; bf16 soportado en inferencia |
| Idiomas soportados | en, it |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); GGUF Q4_K_M (merge publicado en Ollama) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA en 4-bit NF4 sobre Qwen3-8B, con una época, 370 pasos, schedule coseno, learning rate 3e-5, warmup 0,05, longitud máxima de secuencia 2048, micro-batch 32 y semilla 3407. Los módulos adaptados son todas las proyecciones de atención y MLP (q, k, v, o, gate, up, down), con rango 16, alpha 32 y dropout 0,05, lo que resulta en aproximadamente 43,6 millones de parámetros entrenables. El entrenamiento completo se ejecutó en una sola GPU de 12 GB (NVIDIA RTX 4080 de portátil) en unas 2,15 horas.

El conjunto de datos consta de 11.839 ejemplos de química con licencias permisivas (4,70 millones de tokens), algunos derivados de Wikipedia bajo CC BY-SA 4.0. No se menciona en la información disponible el uso de RLHF, DPO ni otras fases de alineación posteriores al ajuste supervisado. La evaluación se realizó con inferencia en 4-bit NF4, zero-shot, en modo non-thinking y con scoring por probabilidad de letra, con intervalos de confianza bootstrap pareados al 95% y 10.000 remuestreos. No se documentan innovaciones arquitectónicas propias más allá del ajuste LoRA estándar.

## Capacidades

- Generación de texto y respuesta a preguntas de química: el adaptador está especializado en conocimiento químico (estequiometría, estados de oxidación, propiedades, nomenclatura), como ilustra el ejemplo de la model card sobre el estado de oxidación del Fe en Fe2O3.
- Razonamiento químico de opción múltiple: la evaluación se centra en MMLU chemistry, ChemBench MCQ y MMLU-Pro chemistry, lo que indica capacidad para resolver preguntas de nivel universitario y de posgrado en química.
- Modo thinking del modelo base: Qwen3-8B puede razonar de forma visible; la evaluación se hizo con `enable_thinking=False`, y la model card indica que vía API se use `"think": false` para replicar el ajuste evaluado.
- Multilingüe limitado: los idiomas declarados son inglés e italiano; no se documenta soporte robusto de otros idiomas.
- Tool calling y function calling: no disponible en la información proporcionada; el adaptador no incluye herramientas propias ni abre conexiones de red.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para este adaptador.
- Visión y audio: no soportados (es un adaptador de texto sobre un modelo de texto).

## Casos de uso

- Asistente de estudio de química: el adaptador puede responder preguntas de nivel universitario sobre estequiometría, equilibrio y estados de oxidación, aprovechando la mejora medida en MMLU chemistry (+3,86 puntos en el test sellado) y MMLU-Pro chemistry (+8,45 puntos).
- Resolución de cuestionarios tipo test en plataformas educativas: dado que la evaluación se hizo con scoring por probabilidad de letra, el adaptador es adecuado para tareas de elección múltiple donde se necesita puntuar opciones, no solo generar texto libre.
- Preprocesado y clasificación de preguntas químicas en pipelines de datos: se puede usar para etiquetar o filtrar preguntas de química en corpus científicos, con la ventaja de que el adaptador es pequeño (~0,2 GB) y se puede cargar junto al base en 4-bit.
- Despliegue en portátil o estación de trabajo con GPU de consumo: gracias al GGUF Q4_K_M (~5 GB de disco, 8 GB de RAM/VRAM recomendados) se puede ejecutar con Ollama en un equipo modesto, útil para prototipos y demos locales.
- Investigación sobre especialización de dominio con QLoRA: el adaptador y su paper sirven como caso reproducible de ajuste de un modelo de 8B en una GPU de 12 GB, con protocolo de evaluación y análisis de intervalos de confianza.
- Evaluación comparativa de adaptadores en ciencia: útil para estudiar la brecha entre split de desarrollo y test sellado, y para diseñar protocolos de validación más robustos en modelos especializados.
- Soporte a la docencia en italiano e inglés: al declarar ambos idiomas, puede emplearse en materiales bilingües de química, aunque sin garantías fuera de esos dos idiomas.

## Benchmarks y rendimiento

| Split | Benchmark | n | Base | Adaptador | Diferencia [IC 95%] |
|---|---|---:|---:|---:|---|
| Test sellado | Pooled | 2529 | 47,61% | 52,63% | +5,02 [+3,24, +6,76] PASS |
| Test sellado | MMLU chemistry | 233 | 63,95% | 67,81% | +3,86 [−0,43, +8,15] |
| Test sellado | ChemBench MCQ | 1503 | 54,82% | 58,22% | +3,39 [+1,13, +5,72] |
| Test sellado | MMLU-Pro chemistry | 793 | 29,13% | 37,58% | +8,45 [+5,17, +11,73] |
| Desarrollo | Pooled | 1083 | 50,69% | 51,89% | +1,20 [−1,29, +3,79] FAIL |
| Desarrollo | MMLU chemistry | 100 | 64,00% | 63,00% | −1,00 [−6,00, +4,00] |
| Desarrollo | ChemBench MCQ | 644 | 60,09% | 58,70% | −1,40 [−4,97, +2,02] |
| Desarrollo | MMLU-Pro chemistry | 339 | 28,91% | 35,69% | +6,78 [+2,36, +11,21] |

Medición en 4-bit NF4, zero-shot, modo non-thinking y scoring por probabilidad de letra. El test sellado se ejecutó una sola vez el 17 de noviembre de 2026; el split de desarrollo no superó la puerta preespecificada.

## Requisitos de hardware

- VRAM estimada para inferencia: con el adaptador en 4-bit NF4 sobre Qwen3-8B, en torno a 6-8 GB de VRAM; en bf16, aproximadamente 16 GB o más para el modelo base completo más el adaptador.
- GPU recomendadas: RTX 4080 (12 GB) para entrenamiento y evaluación, tal como documenta el autor; para inferencia cómoda, RTX 4090, A100 o H100 si se quiere bf16 y mayor throughput.
- GPU de consumo: sí cabe en GPU de consumo; el autor entrenó en una RTX 4080 de portátil de 12 GB y el GGUF Q4_K_M requiere unos 5 GB de disco y 8 GB de RAM/VRAM recomendados.
- Opciones de despliegue: Ollama (`ollamagdp/qwen3-8b-chem-v5`, GGUF Q4_K_M del adaptador fusionado), PEFT + Transformers con BitsAndBytes en 4-bit NF4, y fusión con `merge_and_unload()` para generar pesos completos. No se documenta soporte explícito de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponible; el autor solo reporta el tiempo de entrenamiento (~2,15 horas en una RTX 4080 de 12 GB).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-chem-v5 (este) | Adaptador ~43,6 M sobre 8B | No disponible (entrenamiento a 2048) | Química | Apache-2.0 | Hugging Face y Ollama |
| Qwen/Qwen3-8B (base) | 8B | No disponible en la información | Generalista | Apache-2.0 | Hugging Face |
| Adaptadores químicos comparables | No disponible | No disponible | Química | No disponible | No disponible |

No se dispone de datos de benchmarks de otros adaptadores químicos comparables en la información proporcionada; la comparación directa con alternativas de la misma categoría no está disponible.

## Limitaciones y advertencias

- Brecha desarrollo/test: la puerta de desarrollo falló (pooled +1,20, IC cruza cero; ChemBench −1,40), mientras que el test sellado pasó (+5,02). La mejora debe leerse con cautela por esta discrepancia.
- Incidente de ejecución: en la primera pasada del test sellado, `mmlupro_chem` sufrió un segfault y se volvió a ejecutar en solitario; los otros dos benchmarks no se repitieron.
- Evaluación en 4-bit: todos los números se midieron en 4-bit NF4, zero-shot, non-thinking y con scoring por probabilidad de letra; no reflejan generación abierta ni el GGUF de Ollama, que es una aproximación del objeto evaluado.
- Datos de entrenamiento con CC BY-SA: algunos ejemplos derivan de Wikipedia (CC BY-SA 4.0); las obligaciones de share-alike podrían aplicarse a esos materiales, y no está claro si se extienden a los pesos entrenados.
- Idiomas limitados: solo inglés e italiano declarados; el rendimiento en castellano no está documentado.
- Riesgo de alucinación: como todo modelo de 8B especializado con un adaptador pequeño, puede generar respuestas químicas plausibles pero incorrectas, especialmente en preguntas abiertas no cubiertas por el conjunto de evaluación.
- Sin herramientas propias: el adaptador no incluye tool calling ni conexiones de red; cualquier integración con herramientas externas debe implementarse en el código del usuario.
- Contexto: no se documenta la ventana de contexto efectiva del adaptador; el entrenamiento usó 2048 tokens, por lo que el rendimiento más allá de esa longitud no está validado.

## Enlaces

- Hugging Face: https://huggingface.co/odelpa/qwen3-8b-chem-v5
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Paper (DOI): https://doi.org/10.5281/zenodo.24326181
- Ollama: https://ollama.com/ollamagdp/qwen3-8b-chem-v5
- Ejemplo de carga: `examples/load_adapter.py` dentro del repositorio de Hugging Face
