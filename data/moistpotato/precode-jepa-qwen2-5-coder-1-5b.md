# MoistPotato/precode-jepa-qwen2.5-coder-1.5b

## Resumen

PreCode-JEPA (Qwen2.5-Coder-1.5B) es un conjunto de checkpoints publicados por el usuario MoistPotato para el track 02 del HackCode 14.0 (equipo 21Squad). No es un modelo nuevo desde cero: parte de Qwen2.5-Coder-1.5B y lo afina con un objetivo auxiliar de tipo JEPA ("joint-embedding predictive architecture") que obliga al modelo a predecir el embedding del comportamiento del programa, es decir, la traza de ejecución de la solución de referencia sobre entradas de prueba, en lugar de limitarse a predecir el siguiente token.

El interés técnico esta en la comparación controlada que acompaña al repositorio: frente a un ajuste supervisado clásico (SFT), un control SFT con el mismo bucle de entrenamiento pero sin pérdida de comportamiento y una variante LLM-JEPA. Con 1.5B parámetros, el objetivo conductual mejora MBPP+ de 55,0 a 60,0 pass@1 (media de 5 semillas), mientras que la variante LLM-JEPA baja a 46,9 en MBPP+ pero sube a 26,1 en HumanEval+, lo que sugiere que las dos formulaciones optimizan cosas distintas.

Es relevante ahora porque documenta de forma reproducible una alternativa barata a escalar datos de código: modelar la semántica de ejecución como objetivo de entrenamiento en un modelo pequeño. El repositorio es de octubre de 2026, con 0 descargas y 0 likes en el momento de la consulta, y su tamaño de 12,4 GB corresponde a varios checkpoints fusionados incluidos en subcarpetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (causal LM) heredado de Qwen2.5-Coder-1.5B; no se detalla en la información disponible |
| Parametros totales | 1.5B (heredado del modelo base Qwen2.5-Coder-1.5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens según el modelo base; no verificado en la información proporcionada |
| Tipos de cuantizacion | no disponible; solo se publican pesos completos fusionados (sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible (la model card no lista idiomas; el entrenamiento y el prompt están orientados a Python e inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoints completos fusionados, sin adaptadores LoRA) |
| Modelo base | Qwen/Qwen2.5-Coder-1.5B |
| Variantes incluidas | `precodefull_aux_s<seed>` (PreCode, incluye `pred_head.pt`), `sft_s<seed>`, `sft_loop_s<seed>`, `jepa_s<seed>` |
| Tamano del repositorio | 12,4 GB (múltiples checkpoints fusionados) |
| Formato de prompt | ChatML con system prompt fijo y turno de usuario con la descripción de la tarea más su primer `assert` |

## Arquitectura y entrenamiento

La arquitectura del modelo es la del modelo base: un transformer decoder causal de 1.5B parámetros de la familia Qwen2.5-Coder. La innovación no está en la topología sino en la función de pérdida. PreCode entrena al modelo para predecir el embedding de lo que hará el programa —la traza de ejecución de la solución de referencia sobre entradas de prueba, con la función renombrada a `f` para evitar filtrar el nombre original— a partir de la descripción de la tarea, en paralelo a la predicción de siguiente token. Ese cabezal de predicción se distribuye como `pred_head.pt` dentro de la carpeta `precodefull_aux_s<seed>`.

El repositorio incluye cuatro configuraciones entrenadas con el mismo pipeline para aislar el efecto de cada componente: PreCode completo con objetivo conductual, SFT convencional, un control SFT que usa el bucle de PreCode pero con la pérdida de comportamiento desactivada, y una variante LLM-JEPA. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO; el detalle metodológico se remite al fichero `REPORT.md` del repositorio de GitHub del equipo.

Las evaluaciones se realizaron con decodificación greedy, parada en cualquier token de control `<|...|>` y un prompt ChatML fijo ("You are an expert Python programmer. Write a correct Python function for the task. Output only code.") seguido de la descripción y el primer `assert`. Los resultados son medias de 5 semillas.

## Capacidades

- Generación de código Python a partir de una descripción de tarea y un ejemplo de aserción, en formato de función única.
- Predicción de comportamiento: el checkpoints PreCode incorpora un cabezal que proyecta la representación hacia el embedding de la traza de ejecución esperada (uso analítico, no de generación directa).
- Razonamiento de siguiente token estándar, heredado del modelo base Qwen2.5-Coder-1.5B.
- Soporte de tool calling / function calling: no disponible; no se documenta ni se ha validado en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; el formato de prompt está diseñado para respuesta directa en un solo turno.
- Capacidades multilingües: no disponibles; la model card no reporta idiomas y el entrenamiento se centra en Python e inglés.
- Capacidad especial: no se documenta modo "thinking", visión ni audio.
- Modo de evaluación reproducible: prompt ChatML fijo, decodificación greedy y parada por token de control.

## Casos de uso

- Evaluación de investigación sobre objetivos de entrenamiento: usar las cuatro variantes (`precodefull_aux`, `sft`, `sft_loop`, `jepa`) con el mismo prompt y las mismas semillas para medir el efecto aislado de la pérdida conductual frente a SFT, sin tocar el pipeline de datos.
- Generación de funciones Python en tareas tipo MBPP: el modelo está entrenado y evaluado exactamente en ese formato (descripción + primer `assert`), por lo que encaja en benchmarks de síntesis de funciones cortas.
- Prototipado de asistentes de código en local: con 1.5B parámetros en bf16 (≈3,1 GB) se puede servir en una GPU de consumo y validar un flujo de autocompletado de funciones antes de invertir en un modelo mayor.
- Estudio de la relación entre semántica de ejecución y corrección: el cabezal de predicción de traza permite analizar si la representación interna captura el comportamiento del programa, útil para líneas de investigación en interpretabilidad aplicada a código.
- Filtrado y priorización de candidatos en un pipeline de generación: dado que las variantes tienen perfiles distintos (PreCode mejor en MBPP+, LLM-JEPA mejor en HumanEval+), se pueden combinar como generadores diversos y rerankear por ejecución de tests.
- Docencia y formación interna: el repositorio sirve como ejemplo completo y de bajo coste de fine-tuning con objetivo auxiliar sobre un modelo de 1.5B, incluyendo controles ablativos y semillas múltiples.
- Base para experimentos de destilación: al ser un checkpoint fusionado y pequeño, es un punto de partida razonable para probar destilación desde modelos de código mayores hacia 1.5B con el mismo esquema de pérdida.

## Benchmarks y rendimiento

Resultados publicados en la model card (pass@1, media de 5 semillas, decodificación greedy):

| Variante | Metodo | MBPP+ pass@1 | HumanEval+ pass@1 |
|---|---|---|---|
| `precodefull_aux_s<seed>` | PreCode (objetivo de comportamiento, incluye `pred_head.pt`) | 60,0 | 18,0 |
| `sft_s<seed>` | SFT | 55,0 | 16,8 |
| `sft_loop_s<seed>` | Control SFT (bucle de PreCode, pérdida conductual desactivada) | 54,7 | 16,2 |
| `jepa_s<seed>` | LLM-JEPA | 46,9 | 26,1 |

Lectura de los datos: el objetivo conductual aporta +5,0 puntos sobre SFT en MBPP+ y +1,2 en HumanEval+, mientras que la formulación LLM-JEPA sacrifica 8,1 puntos en MBPP+ y gana 8,1 en HumanEval+ respecto a SFT. El control `sft_loop` (54,7) descarta que la mejora de PreCode provenga del bucle de entrenamiento por sí solo. No se publican resultados de MMLU, GSM8K ni de tool calling en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos a partir de 1.5B parámetros, no mediciones publicadas): ≈3,1 GB en bf16/fp16 para pesos, más caché KV; ≈1,6 GB en int8 y ≈0,9 GB en 4 bits.
- GPU recomendadas: cualquier GPU con 6-8 GB basta para bf16 en contexto corto; A100/H100 solo tienen sentido por agregación de peticiones, no por tamaño.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB e incluso en GPUs de 8 GB con cuantización.
- Opciones de despliegue: `transformers` (soporte nativo del repo, cargando por `subfolder`), y vLLM/TGI para servir en bf16. llama.cpp y Ollama requerirían convertir los pesos a GGUF, ya que no se publican ficheros GGUF.
- Atención al `subfolder`: el repositorio contiene varios modelos fusionados; hay que indicar explícitamente el checkpoint (por ejemplo, `precodefull_aux_s42`) tanto en el tokenizer como en el modelo.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MBPP+ pass@1 | HumanEval+ pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PreCode-JEPA (este) | 1.5B | 32.768 (heredado, no verificado) | 60,0 | 18,0 | apache-2.0 | HuggingFace, varios checkpoints en un repo de 12,4 GB |
| Qwen2.5-Coder-1.5B (base) | 1.5B | 32.768 | no publicado; el control SFT del repo llega a 54,7, lo que acota el punto de partida | no publicado | apache-2.0 | HuggingFace |
| Qwen2.5-Coder-7B | 7B | 32.768 (extensible) | no disponible en esta información | no disponible | apache-2.0 | HuggingFace |
| StarCoder2-3B | 3B | 16.384 | no disponible en esta información | no disponible | bigcode-openrail-m | HuggingFace |

No se han incluido cifras de benchmark de los modelos alternativos porque no aparecen en la información proporcionada; la comparación fiable debe hacerse contra el base y los controles del propio repositorio, que comparten datos y pipeline.

## Limitaciones y advertencias

- Modelo pequeño: con 1.5B parámetros y 18,0 pass@1 en HumanEval+, el rendimiento en tareas fuera del formato MBPP es bajo; no es adecuado como generador de código en producción sin verificación por tests.
- Dependencia estricta del prompt: los resultados están medidos con un system prompt literal, formato ChatML, el primer `assert` como contexto y decodificación greedy; desviarse de esa plantilla degrada la calidad de forma no cuantificada.
- Entrenamiento orientado a Python: aunque el modelo base es multilingüe en código, la model card no reporta idiomas soportados ni evaluación fuera de Python.
- Sesgos conocidos: no documentados en la información disponible; al heredar el corpus del modelo base, arrastra los sesgos de su dataset, no auditados aquí.
- Riesgo de alucinación: relevante en APIs y librerías, especialmente cuando la descripción no especifica firmas; el modelo no valida sus propias salidas.
- Sin tool calling, sin agentes y sin modo de razonamiento extendido: no se ha entrenado ni evaluado para esos flujos.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar también la licencia del modelo base y el `REPORT.md` del repositorio para conocer la procedencia de los datos de entrenamiento y las trazas de ejecución.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin revisión independiente; tratar los números como resultados de un hackathon reproducibles, no como benchmarking consolidado.
- Empaquetado: alojar cuatro variantes en un mismo repositorio de 12,4 GB obliga a descargar todo el snapshot si no se filtran ficheros por `subfolder`, lo que complica su uso en pipelines automatizados.
- El cabezal `pred_head.pt` no forma parte del grafo de `AutoModelForCausalLM`; la predicción de trazas requiere cargarlo por separado y no está documentada su interfaz en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MoistPotato/precode-jepa-qwen2.5-coder-1.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Código del equipo (rama `nikhita/studio`, ver `REPORT.md`): https://github.com/hackHashCode/v1
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
