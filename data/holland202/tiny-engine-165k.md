# holland202/tiny-engine-165k

## Resumen

tiny-engine-165k es un transformer de investigación de tamaño mínimo (165.120 parámetros, 0,66 MB) publicado por Chad Holland bajo el identificador `holland202/tiny-engine-165k`. No es un modelo de lenguaje: opera sobre tokens abstractos y su objetivo es demostrar empíricamente que un transformer muy pequeño, entrenado desde cero en una CPU de portátil en unos 6 minutos, puede adquirir tres capacidades de aprendizaje en contexto (continuar patrones periódicos, hacer lookup de pares clave-valor y copiar cadenas exactas) que generalizan más allá de las longitudes vistas durante el entrenamiento.

La relevancia del modelo es metodológica más que práctica. El autor registró previamente los criterios de éxito (pass bar) en un repositorio público antes de entrenar, reporta resultados sobre 6 semillas independientes y documenta explícitamente el criterio que falló (copia de cadenas largas) en lugar de ocultarlo. Esto lo convierte en un ejemplo poco habitual de práctica de investigación reproducible y honesta en modelos minúsculos, útil para estudiar induction heads y el efecto de las posiciones rotatorias relativas en la generalización a longitudes mayores.

La arquitectura es attention-only (sin MLPs), 2 capas × 2 cabezas, anchura 128, con embeddings posicionales rotatorios y sin embeddings de posición absolutos. El modelo fue diseñado, entrenado y evaluado por un agente de IA (Claude Opus 5.5) bajo dirección humana, sin validación humana posterior ni reproducción independiente, lo que constituye su principal caveat de fiabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer attention-only (sin MLPs), 2 capas × 2 cabezas, anchura 128 |
| Parametros totales | 165.120 (0,66 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrenado con entradas de 32–128 tokens; evaluado hasta 4× la longitud vista (hasta ~512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | no disponible (no procesa texto; opera sobre tokens abstractos) |
| Licencia | MIT |
| Formato de pesos | safetensors (6 ficheros, `weights/engine_seed{1..6}.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un transformer de solo atención: no contiene capas feed-forward (MLPs), únicamente bloques de self-attention. Tiene 2 capas con 2 cabezas cada una y dimensión de modelo 128. Usa posiciones rotatorias relativas (RoPE) y prescinde por completo de embeddings de posición absolutos, lo que explica su capacidad de mantener el rendimiento con entradas más largas que las vistas en entrenamiento. La capa de salida está desacoplada de la embedding de entrada (untied); según el autor, atar ambas detuvo por completo el aprendizaje en sus pruebas.

El entrenamiento se realizó desde cero sobre una mezcla de tres tareas sintéticas (continuación de patrones, lookup clave-valor y copia de cadenas) con 128 tokens de contenido, secuencias de entrada de 32 a 128 tokens, optimizador AdamW con learning rate 1e-3 y 6.000 pasos. Se entrenaron 6 semillas independientes. No se reporta número total de tokens de entrenamiento ni uso de RLHF/DPO. La innovación destacable no es algorítmica (los induction heads y la ventaja de las posiciones relativas son resultados conocidos, p. ej. arXiv 2412.11459), sino la instancia abierta, pequeña y completamente testeada de dichos fenómenos.

## Capacidades

- Continuación de patrones periódicos, incluidos periodos no vistos en entrenamiento (precisión 0,998–0,999 en longitudes entrenadas; 0,967–0,995 a 4× la longitud).
- Lookup de valores a partir de pares clave-valor presentados antes en el contexto (precisión 1,000 en longitudes entrenadas; 0,948–0,972 a 2×; 0,825–0,883 a 4×).
- Copia exacta de cadenas de hasta 63 tokens (precisión 1,000); degradación a 0,53–0,77 para cadenas de 127 tokens.
- Aprendizaje en contexto puro: todas las tareas se resuelven usando únicamente la información presente en la entrada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No procesa texto natural: trabaja sobre tokens abstractos definidos por los generadores de tareas del propio repositorio.

## Casos de uso

- Estudio de induction heads: el modelo sirve como banco de pruebas mínimo para analizar cómo emergen los circuitos de inducción en transformers de 2 capas, con 6 semillas para medir varianza.
- Investigación sobre generalización posicional: permite experimentar con RoPE frente a posiciones absolutas en un entorno de entrenamiento de minutos y coste despreciable.
- Docencia y formación: ejemplo ejecutable en portátil para explicar atención, aprendizaje en contexto y evaluación preregistrada de hipótesis.
- Reproducción de resultados: los scripts `engine.py`, `demo.py` y `score.py` permiten replicar el pipeline completo (generación de tareas, entrenamiento y evaluación) en CPU.
- Benchmark de metodología científica: el fichero `REGISTRATION.md` y el reporte explícito del criterio fallido lo convierten en caso de estudio de prácticas de evaluación honestas.
- Prototipado de tareas sintéticas de memoria en contexto: útil para diseñar y validar generadores de tareas antes de escalar a modelos mayores.
- Verificación de infraestructura de entrenamiento: al entrenar en ~6 minutos en CPU, sirve como smoke test de pipelines de PyTorch y safetensors.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 6 semillas independientes, frente a un pass bar registrado antes del entrenamiento. Un modelo sin entrenar obtiene ~0,01 en todas las pruebas.

| Tarea | Longitud entrenada | 2× longitud | 4× longitud |
|---|---|---|---|
| Continuar patrón periódico (incl. periodos no vistos) | 0,998–0,999 | no disponible | 0,967–0,995 |
| Lookup clave-valor | 1,000 | 0,948–0,972 | 0,825–0,883 |
| Copia exacta de cadena | 1,000 (hasta 63 tokens) | no disponible | 0,53–0,77 (cadenas de 127 tokens) |

Resultado global: 2 de 3 criterios registrados superados; el fallo en copia de cadenas largas se reporta explícitamente. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: despreciable (<10 MB); el modelo pesa 0,66 MB en safetensors.
- GPU: no necesaria; entrenamiento e inferencia validados en CPU de clase portátil.
- Cabe en cualquier GPU consumer e incluso en Raspberry Pi o entornos sin GPU.
- Despliegue: PyTorch nativo con `torch`, `safetensors` y `numpy`; no se reporta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a un modelo de tokens abstractos).
- Latencia y throughput: no disponibles de forma numérica; el entrenamiento completo tarda ~6 minutos en CPU.
- Reproducción: `pip install torch safetensors numpy` y `python demo.py weights/engine_seed1.safetensors`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-engine-165k | 165.120 | 32–128 tokens (eval. hasta ~512) | Tareas sintéticas de ICL | MIT | Hugging Face |
| GPT-2 small | 124 M | 1.024 tokens | Modelado de lenguaje | MIT | Hugging Face |
| TinyStories-1M | ~1 M | 512 tokens | Generación de texto simple | MIT | Hugging Face |
| Modelos de induction heads (p. ej. los de arXiv 2412.11459) | Variable | Variable | Estudio de circuitos | Variable | Papers, no siempre con pesos |

La comparación es aproximada: tiny-engine-165k no es un modelo de lenguaje y no es directamente comparable en rendimiento lingüístico con GPT-2 small ni con TinyStories. Su categoría real es la de modelos de investigación sobre mecanismos de atención, donde la comparación relevante son los experimentos de induction heads publicados en la literatura, que rara vez liberan pesos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera ni comprende texto natural; opera sobre tokens abstractos.
- Punto débil conocido y reportado: la copia exacta de cadenas largas (127 tokens) cae a 0,53–0,77.
- El rendimiento decae con la longitud: lookup a 4× la longitud entrenada baja a 0,825–0,883.
- Autoevaluado: un agente de IA diseñó, entrenó y calificó el modelo; no ha habido validación humana ni reproducción independiente.
- Nivel de revisión declarado por el autor: "direction only" (solo dirección humana).
- Riesgo de alucinación: no aplica en el sentido habitual, pero los resultados deben tratarse como no verificados externamente.
- Licencia MIT: permite uso comercial, pero el modelo no tiene aplicación comercial directa por su naturaleza de investigación.
- Sin datos de sesgos, idiomas ni cuantizaciones; no apto para producción en tareas de NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/holland202/tiny-engine-165k
- Criterios de evaluación preregistrados: https://github.com/holland202/principia-artificialis/blob/exp/tiny-engine-001/experiments/tiny_engine/REGISTRATION.md
- Referencia sobre induction heads y posiciones relativas: arXiv 2412.11459
- Repositorio del proyecto (según la model card): https://github.com/holland202/principia-artificialis
