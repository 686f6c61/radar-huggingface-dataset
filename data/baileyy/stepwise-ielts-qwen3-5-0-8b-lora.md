# Baileyy/stepwise-ielts-qwen3.5-0.8b-lora

## Resumen

Stepwise IELTS Qwen3.5 0.8B LoRA es un adaptador LoRA congelado acompanado de una cabeza numerica de cuatro salidas, entrenado sobre el modelo base Qwen/Qwen3.5-0.8B. Lo desarrolla el usuario Baileyy en el contexto del proyecto Stepwise, y su proposito es estimar cuatro puntuaciones de media banda (half-band) para ensayos de IELTS Writing Task 2: Task Response (TR), Coherence and Cohesion (CC), Lexical Resource (LR) y Grammatical Range and Accuracy (GRA). No se le suministra al evaluador la banda objetivo solicitada, de modo que actua como un scorer ciego.

El modelo no es un generador de texto en el sentido habitual: es un scorer numerico con una cabeza personalizada, por lo que los pipelines estandar de text-generation o fill-mask del modelo base no lo ejecutan. El adaptador por si solo no produce las puntuaciones reportadas; el loader obtiene el checkpoint exacto de Qwen y combina el adaptador con la cabeza numerica.

La relevancia actual es acotada: se trata de un artefacto de investigacion y practica con cero descargas y cero likes en el momento de la consulta, y con un error absoluto medio (MAE) de 1,227 puntos de banda en la puntuacion global frente a las valoraciones del sitio Writing9. El modelo base Qwen3.5-0.8B es el miembro mas pequeno de la familia Qwen3.5, con arquitectura hibrida de redes delta con compuertas (gated delta networks) y 262K tokens de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-0.8B (hibrida gated delta networks) con cabeza numerica de 4 salidas |
| Parametros totales | 0,8B en el modelo base; tamano del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262K tokens en el modelo base |
| Tipos de cuantizacion | no disponible para el adaptador; el base admite GGUF segun la informacion de busqueda |
| Idiomas soportados | en |
| Licencia | no disponible en el repositorio (el base es Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El componente entrenado es un adaptador LoRA congelado mas una cabeza numerica de cuatro salidas, montado sobre el checkpoint Qwen/Qwen3.5-0.8B. El modelo base emplea una arquitectura hibrida de gated delta networks con una ventana de 262K tokens, lo que permite procesar ensayos largos junto con el enunciado de la tarea. La cabeza numera se ajusto sobre 4.096 ensayos y se ejecutaron 32 actualizaciones LoRA sobre un subconjunto de 256 ensayos; el split de desarrollo compartido de 256 ensayos selecciono el paso 16. El conjunto de test registro 72 ensayos, y todos los modelos evaluados puntuaron 70 en comun.

El dataset de entrenamiento citado es ndtran0101/writing9-ielts-essays. Las etiquetas de referencia son las valoraciones del sitio Writing9, no evaluaciones de examinadores oficiales de IELTS. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa especificas para este adaptador, aunque el modelo base se senala como candidato a draft model para decodificacion especulativa con checkpoints mayores de Qwen3.5.

## Capacidades

- Puntuacion automatica de ensayos IELTS Writing Task 2 en cuatro criterios: Task Response, Coherence and Cohesion, Lexical Resource y Grammatical Range and Accuracy.
- Estimacion de bandas en incrementos de media banda (half-band).
- Evaluacion ciega: no recibe la banda objetivo solicitada por el usuario.
- Procesamiento de pares prompt/essay mediante un script de inferencia (`score.py`) que acepta un JSON con campos de cadena `prompt` y `essay`.
- No soporta tool calling ni function calling en la informacion disponible.
- No soporta agentes ni razonamiento multi-paso en la informacion disponible.
- Capacidades multilingues limitadas al ingles.
- No dispone de modo thinking, vision ni audio en el adaptador descrito.

## Casos de uso

- Correccion formativa de ensayos IELTS: un estudiante envia el enunciado y su redaccion en un JSON y obtiene cuatro estimaciones de banda para identificar que criterio necesita refuerzo, gracias a la granularidad de media banda por criterio.
- Triaje previo en academias de idiomas: el scorer puede preclasificar lotes de ensayos antes de la revision humana, reduciendo el volumen que llega al profesor, aunque con un MAE global de 1,227 puntos que exige supervision.
- Investigacion sobre evaluacion automatica de escritura: sirve como linea base reproducible (adaptador congelado, cabeza numerica, split de 256 ensayos y paso 16 documentado) para comparar con alternativas como el modelo complementario ModernBERT-MoE o Gemini con y sin RAG.
- Seguimiento longitudinal del progreso de un alumno: al puntuar de forma ciega y consistente los mismos criterios a lo largo del tiempo, permite trazar la evolucion por subcriterio sin sesgo de la banda objetivo.
- Deteccion de desequilibrios por criterio: el desglose TR/CC/LR/GRA permite senalar deficits especificos (por ejemplo, GRA con MAE de 1,414 es el criterio mas debil) y orientar el plan de estudio.
- Prototipado de herramientas educativas: el script `score.py` y el formato JSON de entrada facilitan integrar el scorer en un servicio interno de practica, siempre con la advertencia de que son estimaciones de practica e investigacion.

## Benchmarks y rendimiento

Resultados publicados en la model card como error absoluto medio (MAE) en puntos de banda IELTS, menor es mejor, frente a las valoraciones del sitio Writing9:

| Metrica | Overall | TR | CC | LR | GRA |
|---|---:|---:|---:|---:|---:|
| MAE (banda IELTS) | 1,227 | 1,179 | 1,014 | 1,300 | 1,414 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este adaptador. La model card remite a un benchmark completo en el repositorio de GitHub del proyecto que incluye Gemini con y sin RAG, pero los valores de dicha comparacion no se detallan en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; al montar sobre un modelo base de 0,8B, la huella es reducida y compatible con GPU de consumo, aunque no se publican cifras exactas.
- GPU recomendadas: no disponible en la informacion proporcionada; por el tamano del base, cabria en RTX 4090 y GPUs consumer de gama media-alta, pero no se confirma.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de 0,8B del base; sin cifras oficiales.
- Opciones de despliegue: el repositorio proporciona `score.py` con `requirements.txt`; el modelo base puede servirse con vLLM (receta publicada en recipes.vllm.ai) y con Ollama o llama.cpp en formato GGUF, aunque el adaptador con cabeza numerica requiere el loader propio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | MAE global | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Stepwise IELTS Qwen3.5 0.8B LoRA | 0,8B base + adaptador | 262K (base) | Scoring IELTS TR/CC/LR/GRA | 1,227 | no disponible | Hugging Face (0 descargas) |
| Stepwise IELTS ModernBERT-MoE | no disponible | no disponible | Scoring IELTS | no disponible | no disponible | Hugging Face (modelo complementario) |
| Gemini (con y sin RAG) | no disponible | no disponible | Scoring IELTS | no disponible en esta ficha | propietaria | API de Google |

La model card indica que el benchmark completo incluye Gemini con y sin RAG, pero no se aportan los valores numericos en la informacion disponible, por lo que no se puede completar la comparacion cuantitativa.

## Limitaciones y advertencias

- Las puntuaciones son estimaciones de practica e investigacion unicamente; no constituyen una evaluacion oficial de IELTS.
- Las etiquetas de referencia del sitio Writing9 no fueron verificadas de forma independiente por examinadores de IELTS, y el rendimiento en la muestra emparejada no establece precision de examinador.
- El MAE global de 1,227 puntos de banda implica un error medio superior a una banda completa, lo que limita su uso para decisiones de alta exigencia.
- El criterio GRA es el mas debil, con MAE de 1,414.
- La licencia del repositorio no esta disponible, lo que impide confirmar condiciones de uso comercial; el modelo base es Apache 2.0.
- La licencia de la fuente de datos es desconocida; el repositorio no redistribuye ensayos ni valoraciones en bruto.
- El adaptador por si solo no produce las puntuaciones reportadas: requiere el loader y la cabeza numerica, y no funciona con los pipelines estandar de text-generation o fill-mask.
- Solo soporta ingles, lo que excluye su uso en evaluacion multilingue.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible, aunque al tratarse de un scorer numerico el riesgo se manifiesta como desviacion sistematica en las bandas estimadas.
- El conjunto de test es pequeno (72 ensayos), lo que limita la robustez estadistica de las metricas reportadas.
- El repositorio tiene cero descargas y cero likes, y no se ha validado por la comunidad en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Baileyy/stepwise-ielts-qwen3.5-0.8b-lora
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b967f1860aea9cf38778875588b17
- Modelo complementario Stepwise IELTS ModernBERT-MoE: https://huggingface.co/Baileyy/stepwise-ielts-modernbert-moe
- Benchmark completo del proyecto Stepwise (GitHub): https://github.com/dwcqwcqw/AC215_Stepwise/blob/bei-li/README.md
- Receta de despliegue con vLLM para Qwen3.5-0.8B: https://recipes.vllm.ai/Qwen/Qwen3.5-0.8B
- Analisis y benchmark de Qwen3.5 0.8B (Codersera): https://codersera.com/blog/run-and-benchmark-qwen35-08b/
