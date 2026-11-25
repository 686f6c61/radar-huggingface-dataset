# lynxpurr/ZhenLM-140M-SFT-v2e-GGUF

## Resumen

ZhenLM-140M-SFT-v2e es un modelo de lenguaje decoder-only entrenado desde cero por el desarrollador independiente lynxpurr, especializado en conversación bilingüe chino-inglés. Se trata de un modelo de escala reducida (162,4 millones de parámetros en safetensors, 137,8 millones según la model card) pensado como artefacto de investigación y aprendizaje, no como modelo de producción. Su relevancia radica en que demuestra que es posible entrenar un modelo funcional de chat bilingüe en una única GPU de 16 GB, con 3.000 millones de tokens de preentrenamiento y 250 millones de tokens de SFT.

La versión publicada en este repositorio es una conversión a GGUF del modelo base `lynxpurr/ZhenLM-140M-SFT-v2e`, orientada a su despliegue con llama.cpp y Ollama. Incluye dos cuantizaciones (Q8_0 y F16) y descarta explícitamente Q4_K_M por pérdida de fidelidad en el comportamiento aprendido. El contexto es de solo 1024 tokens y el vocabulario BPE de 32k, lo que limita su uso a interacciones cortas.

El modelo sigue turnos de chat simples, rechaza algunas preguntas sobre eventos futuros en lugar de inventar respuestas y maneja patrones concretos de instrucciones de traducción. Sus capacidades factuales y aritméticas son muy limitadas, y el propio autor lo describe como un ejercicio de investigación con conocimiento factual a nivel de GPT-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (entrenado desde cero) |
| Parametros totales | 162.423.552 (safetensors); 137.847.552 según model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | Q8_0 (174 MB), F16 (326 MB); Q4_K_M desaconsejado por el autor |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repositorio); modelo base presumiblemente safetensors |
| Vocabulario | BPE de 32k tokens |
| Tamano del repositorio | 0,5 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only entrenado desde cero, sin destilación ni inicialización a partir de otro modelo. El entrenamiento se realizó en una única GPU de 16 GB: 3.000 millones de tokens de preentrenamiento seguidos de 250 millones de tokens de ajuste supervisado (SFT). No se documenta en la información disponible el uso de RLHF, DPO u otras técnicas de alineación posteriores al SFT, ni la composición exacta del dataset más allá de su carácter bilingüe chino-inglés.

La innovación técnica destacable no está en la arquitectura sino en el proceso: un modelo funcional de chat bilingüe entrenado íntegramente en hardware de consumo. La model card advierte que la cuantización Q4_K_M no es fiel para este modelo, ya que degrada el comportamiento aprendido durante el SFT (la puntuación en matemáticas cae de 72 a 42 y la traducción revierte a estados previos), por lo que recomienda Q8_0 o F16. La conversión F16 se verificó con una comprobación puntual de 5 casos con coincidencia bit a bit respecto a PyTorch.

## Capacidades

- Generación de texto conversacional en chino e inglés con turnos de chat simples.
- Seguimiento de instrucciones básicas dentro de patrones aprendidos durante el SFT.
- Traducción chino-inglés limitada a los patrones de frase incluidos en el entrenamiento.
- Rechazo de algunas preguntas sobre eventos futuros en lugar de generar respuestas inventadas.
- Aritmética muy limitada: funciona como tabla de consulta estrecha, no como cálculo real.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües reducidas a zh y en.

## Casos de uso

- Investigación sobre entrenamiento desde cero en hardware de consumo: el modelo sirve como referencia reproducible para estudiar el impacto del preentrenamiento y el SFT a pequeña escala en una GPU de 16 GB.
- Experimentos de cuantización y fidelidad: permite comparar el comportamiento de Q8_0 y F16 frente a Q4_K_M y documentar la pérdida de capacidades en cuantizaciones agresivas en modelos pequeños.
- Pruebas de pipelines de despliegue con Ollama y llama.cpp: los Modelfiles incluidos facilitan la validación de flujos de creación y ejecución de modelos GGUF en local.
- Demostraciones educativas de chat bilingüe chino-inglés: útil para ilustrar el comportamiento de un modelo conversacional de escala reducida en entornos docentes.
- Evaluación de metodologías de benchmark: el caso del holdout +6/+7, cuya reproducibilidad quedó en entredicho en una segunda revisión (11 frente a 11), sirve para estudiar la sensibilidad de las rúbricas de evaluación.
- Prototipado de asistentes de dominio muy acotado: con contexto de 1024 tokens y conocimiento factual limitado, solo es viable en escenarios de conversación corta y vocabulario restringido.
- Pruebas de robustez y alucinación: su tendencia a rechazar preguntas sobre eventos futuros lo convierte en un caso de estudio sobre comportamiento de rechazo en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card menciona únicamente métricas internas del proceso de SFT: una puntuación de matemáticas de 72 con Q8_0 frente a 42 con Q4_K_M, y una comprobación de fidelidad F16 con coincidencia bit a bit en 5 de 5 casos. La afirmación de mejora en el holdout (+6/+7) no se reprodujo en una segunda revisión de 47 preguntas (11 frente a 11), por lo que el autor la califica de sensible a la rúbrica.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB con Q8_0 (174 MB de pesos) y alrededor de 0,5 GB con F16 (326 MB), más overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento original se realizó en una GPU de 16 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares, así como en CPU.
- Opciones de despliegue: llama.cpp, Ollama (Modelfiles incluidos para Q8_0 y F16) y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera baja latencia en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ZhenLM-140M-SFT-v2e | 162,4 M (safetensors) | 1024 | zh, en | Apache-2.0 | GGUF |
| GPT-2 small | 124 M | 1024 | en | MIT | safetensors, GGUF |
| Qwen2.5-0.5B | 494 M | 32 768 | multilingüe | Apache-2.0 | safetensors, GGUF |
| SmolLM2-135M | 135 M | 8192 | en (principalmente) | Apache-2.0 | safetensors, GGUF |

La comparación con GPT-2 small es la más directa en escala, aunque ZhenLM añade cobertura de chino y un SFT conversacional del que GPT-2 carece. Frente a SmolLM2-135M y Qwen2.5-0.5B, modelos de tamaño similar o algo mayor con contextos mucho más amplios y entrenamiento a gran escala, ZhenLM queda claramente por detrás en conocimiento factual, contexto y capacidades generales; su interés es principalmente como artefacto de investigación reproducible. No se dispone de datos de rendimiento comparativo publicados para ZhenLM.

## Limitaciones y advertencias

- Conocimiento factual a nivel de GPT-2: no es fiable para consultas de datos, historia, ciencia o actualidad.
- Aritmética basada en una tabla de consulta estrecha, no en cálculo real; falla fuera de los patrones vistos.
- Traducción limitada a los patrones de frase del entrenamiento; no generaliza a texto libre.
- Contexto de solo 1024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Las respuestas largas pueden entrar en bucles de repetición.
- La cuantización Q4_K_M degrada el comportamiento aprendido; usar Q8_0 o F16.
- Riesgo de alucinación inherente a un modelo de este tamaño, mitigado parcialmente por el rechazo de preguntas sobre eventos futuros.
- Sesgos no documentados en la información disponible; al entrenarse con datos no especificados, pueden persistir sesgos de idioma y cultura.
- Licencia Apache-2.0 para los pesos, con atribuciones de datos upstream recogidas en el fichero NOTICE del repositorio base.
- No apto para producción: el propio autor lo describe como artefacto de aprendizaje e investigación.

## Enlaces

- Repositorio GGUF: https://huggingface.co/lynxpurr/ZhenLM-140M-SFT-v2e-GGUF
- Modelo base: https://huggingface.co/lynxpurr/ZhenLM-140M-SFT-v2e
