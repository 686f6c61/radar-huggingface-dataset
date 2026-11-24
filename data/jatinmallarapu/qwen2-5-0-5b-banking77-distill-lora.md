# JatinMallarapu/qwen2.5-0.5b-banking77-distill-lora

## Resumen

`qwen2.5-0.5b-banking77-distill-lora` es un adaptador LoRA sobre el modelo base Qwen2.5-0.5B-Instruct, desarrollado por JatinMallarapu como proyecto personal de investigación. Su propósito es la clasificación de intenciones (intent classification) en consultas bancarias en inglés, utilizando el conjunto de datos PolyAI Banking77 con 77 categorías de intención distintas. El adaptador se distribuye como un repositorio PEFT que debe combinarse con el modelo base fijado en una revisión concreta.

El modelo emplea una técnica de destilación de conocimiento desde un profesor Qwen2.5-7B AWQ que genera paráfrasis que preservan la intención, filtradas mediante verificación de etiquetas sembradas y recuperación sobre datos de entrenamiento. Se trata de una versión piloto (v0.1) con una sola semilla, entrenada sobre un subconjunto de 200 consultas del profesor, y con resultados medidos que superan tanto a una referencia TF-IDF como al modelo sin ajuste (zeroshot) en el conjunto de evaluación de Banking77.

La relevancia de esta ficha es acotada: no es un modelo de propósito general ni un producto listo para producción, sino un artefacto de investigación con métricas reproducibles, intervalos de confianza bootstrap y análisis de fallos documentados. Resulta útil como referencia metodológica para quienes trabajan en destilación de modelos pequeños para clasificación de intenciones, pero su alcance declarado excluye explícitamente decisiones bancarias, pagos o despliegue con clientes sin revisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 0.5B (modelo base Qwen2.5-0.5B-Instruct); parámetros del adaptador LoRA no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens de longitud máxima de entrenamiento (contexto nativo del modelo base no disponible en la información proporcionada) |
| Tipos de cuantizacion | no disponible (pesos fusionados exportados en float32; el profesor usa AWQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) y pesos fusionados cargables con AutoModelForCausalLM |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0.5 mil millones de parámetros. El ajuste emplea LoRA con rango 16, alpha 32, dropout 0.05 y objetivos en todas las capas lineales. El entrenamiento se realizó durante 3 épocas con tasa de aprendizaje 0.0002, longitud máxima de 128 tokens, sobre una Tesla T4, con selección de precisión (bf16 o fp16) según el soporte en tiempo de ejecución de PyTorch. Los pesos fusionados se exportan en CPU en float32. Se declara una sola semilla por estudiante y la semilla liberada del Estudiante B se selecciona por pérdida de validación, nunca por precisión en test.

Los datos de entrenamiento combinan las consultas de entrenamiento de PolyAI Banking77 con paráfrasis generadas por un profesor Qwen2.5-7B AWQ que preservan la intención. El filtrado exige que tres etiquetas sembradas a temperatura 0.7 coincidan con la etiqueta dorada de origen, con verificación mediante recuperación solo sobre entrenamiento excluyendo el ID fuente, y comprobaciones de duplicados exactos y solapamiento con validación/test. Se aceptaron 480 de 600 propuestas (retención del 80 %). El Estudiante A usa solo datos dorados y el Estudiante B añade los datos aceptados del profesor. El alcance es piloto: 200 fuentes de entrenamiento equilibradas por intención, manteniendo las 8992 filas doradas de entrenamiento en ambos estudiantes. El archivo de paráfrasis congeladas se incluye como `filtered_training_paraphrases.jsonl` con licencia CC BY 4.0 y atribución a Banking77, con huella registrada en `release_evidence.json`.

## Capacidades

- Clasificación de intenciones bancarias en inglés sobre 77 etiquetas de Banking77, mediante puntuación de verosimilitud sobre todas las etiquetas (all-77-label likelihood scoring).
- Generación de texto condicionada por plantilla de chat, heredada de Qwen2.5-0.5B-Instruct, aunque el comportamiento evaluado es el de clasificador restringido a etiquetas finitas.
- Soporte de plantilla de chat con roles system/user mediante `apply_chat_template`.
- Instrucción de sistema para tratar la consulta como dato no confiable y evitar inyección de instrucciones (con eficacia limitada, ver limitaciones).
- Calibración mediante temperature scaling y umbrales de abstención ajustados solo en validación.
- Enmascaramiento parcial de PII mediante expresiones regulares (protección parcial, no garantía de privacidad).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio en la información proporcionada.

## Casos de uso

- Enrutamiento de consultas bancarias en investigación: el adaptador clasifica una consulta en una de las 77 intenciones de Banking77 usando puntuación sobre todas las etiquetas, lo que garantiza validez de etiqueta finita y permite medir precisión y macro-F1 con intervalos bootstrap.
- Estudio metodológico de destilación: sirve como referencia reproducible para comparar un estudiante con datos dorados (Estudiante A) frente a uno con datos destilados del profesor (Estudiante B), con evidencia de retención del 80 % en el filtrado de paráfrasis.
- Evaluación de calibración y abstención: permite reproducir el ajuste de temperature scaling y umbrales de abstención sobre validación, comparando ECE entre el modelo y una referencia TF-IDF (teniendo en cuenta que las probabilidades del TF-IDF son logísticas sin calibrar).
- Análisis de fallos por clase: el informe `release_evidence.json` incluye las cinco peores clases y los pares de intenciones más confundidos con IDs de caso, útil para estudiar ambigüedad de etiquetas y errores del profesor.
- Auditoría de robustez frente a inyección de instrucciones: el adaptador seleccionado se sometió a 50 pares de ataque autorados, con tasa de cambio de salida del 36 % y tasa de salida forzada del 30 %, lo que permite estudiar defensas en clasificadores pequeños.
- Comparación de latencia en hardware modesto: con latencias medidas de 548.55 ms p50 y 607.44 ms p95 en batch 1 sobre GPU (puntuación de 77 etiquetas), sirve para dimensionar clasificadores basados en LLM frente a referencias CPU como TF-IDF (3.21 ms p50).

## Benchmarks y rendimiento

Resultados medidos en el conjunto de evaluación de Banking77, con intervalos bootstrap estratificados por etiqueta a modelo fijo:

| Sistema | Accuracy [IC 95%] | Macro-F1 [IC 95%] | p50 / p95 ms, batch 1 |
|---|---|---|---|
| TF-IDF (referencia CPU) | 0.8867 [0.8761, 0.8981] | 0.8871 [0.8762, 0.8985] | 3.21 / 5.54 |
| zeroshot | 0.6179 [0.6037, 0.6294] | 0.5968 [0.5806, 0.6080] | 3684.31 / 3703.69 |
| student_a-seed1 | 0.9321 [0.9226, 0.9409] | 0.9321 [0.9223, 0.9408] | 548.23 / 607.81 |
| student_b-seed1 | 0.9198 [0.9097, 0.9282] | 0.9195 [0.9094, 0.9279] | 548.55 / 607.44 |

Notas: los tiempos de CPU y GPU corresponden a hardware distinto y no son aceleraciones comparables. La latencia GPU mide la puntuación de verosimilitud sobre las 77 etiquetas, no una generación greedy única. Una sola semilla no permite estimar la variación entre semillas de entrenamiento. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base es de 0.5B parámetros y los pesos fusionados se exportan en float32, lo que permite inferencia en GPU de gama baja y en CPU.
- GPU de entrenamiento declarada: Tesla T4.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos unos pocos GB de VRAM dado el tamaño de 0.5B, aunque no se proporcionan cifras exactas de VRAM.
- Opciones de despliegue: carga con `transformers` (AutoModelForCausalLM + AutoTokenizer) sobre pesos fusionados, o con `peft` (PeftModel) sobre el adaptador y el modelo base fijado en la revisión `7ae557604adf67be50417f59c2c2f167def9a775`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia medida (GPU, batch 1, puntuación de 77 etiquetas): p50 548.55 ms, p95 607.44 ms para el Estudiante B; p50 548.23 ms, p95 607.81 ms para el Estudiante A. Referencia CPU TF-IDF: p50 3.21 ms, p95 5.54 ms.
- Throughput: no disponible; solo se declaran tamaños de batch [1] y las mediciones de escalado a batch 32 quedan como trabajo futuro.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy Banking77 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-0.5b-banking77-distill-lora (student_b-seed1) | 0.5B + LoRA | 128 (entrenamiento) | 0.9198 | apache-2.0 | Hugging Face (adaptador PEFT) |
| Qwen2.5-0.5B-Instruct zeroshot | 0.5B | no disponible | 0.6179 | apache-2.0 | Hugging Face |
| TF-IDF (referencia CPU) | n/a | n/a | 0.8867 | n/a | Implementación propia |
| Qwen2.5-7B AWQ (profesor) | 7B | no disponible | no disponible | no disponible | Usado solo como profesor |

La comparativa se limita a los sistemas medidos en la model card. No se dispone de datos de otros clasificadores de intenciones comparables en la información proporcionada.

## Limitaciones y advertencias

- Proyecto personal no afiliado a ningún banco; no apto para decisiones bancarias, pagos, determinación de fraude ni despliegue con clientes sin revisión.
- Versión piloto v0.1 con una sola semilla y subconjunto de 200 consultas del profesor; no estima la variación entre semillas de entrenamiento.
- El acuerdo con el profesor no equivale a verificación humana; persisten errores del profesor, ambigüedad de etiquetas y desviación de dominio.
- La generación libre puede producir texto inválido; la validez de etiqueta garantizada requiere puntuación sobre etiquetas finitas.
- El enmascaramiento de PII por expresiones regulares es protección parcial, no garantía de privacidad.
- Auditoría de inyección de instrucciones limitada: 50 pares autorados, tasa de cambio de salida del 36 %, tasa de salida forzada del 30 % y tasa de abstención bajo ataque del 0 %; no certifica resistencia a ataques arbitrarios.
- Las diferencias de ECE frente al TF-IDF reflejan también procedimientos de calibración distintos (temperature scaling en los LLM frente a probabilidades logísticas sin calibrar en el TF-IDF).
- Idiomas: solo inglés; no se documenta soporte multilingüe.
- Licencia apache-2.0 para el adaptador, pero las paráfrasis congeladas se distribuyen con CC BY 4.0 y atribución a Banking77; conviene revisar las condiciones del dataset de origen para uso comercial.
- No se documentan requisitos de VRAM ni throughput para producción; las latencias son muestras observadas en batch 1 y no una garantía de hardware dedicado.

## Enlaces

- Hugging Face: https://huggingface.co/JatinMallarapu/qwen2.5-0.5b-banking77-distill-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset Banking77: https://huggingface.co/datasets/PolyAI/banking77
- Repositorio GitHub del proyecto: mencionado en la model card como repositorio vinculado, URL no disponible en la información proporcionada.
- Paper, blog o demo: no disponible en la información proporcionada.
