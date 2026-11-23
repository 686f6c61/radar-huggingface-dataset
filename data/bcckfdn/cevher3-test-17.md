# bcckfdn/cevher3-test-17

## Resumen

cevher3-test-17 es un modelo de lenguaje de tipo decoder-only publicado en Hugging Face por el usuario bcckfdn bajo licencia Apache 2.0. Segun la model card, se ha entrenado con la arquitectura que el autor denomina "Gemma3-SWA", una variante de la familia Gemma 3 con atención de ventana deslizante (sliding window attention, SWA), y cuenta con 1.256.312.832 parametros. El modelo esta orientado a generacion de texto conversacional y declara soporte para turco (tr) e ingles (en).

El problema que aborda es el de proporcionar un modelo compacto (~1,25 B de parametros) con contexto de 8192 tokens y un vocabulario de 65.536 entradas, entrenado sobre aproximadamente 37.847 millones de tokens (37,847 B segun la model card). Su relevancia practica es limitada por el momento: se trata de un checkpoint de prueba (el sufijo "test-17" lo sugiere), con 0 descargas y 0 likes en el momento de redactar esta ficha, y sin resultados de benchmarks publicados.

La arquitectura subyacente es la de un transformer decoder-only con 34 capas, dimension oculta de 1792 y 28 cabezas de atencion para query frente a 4 para key/value (GQA), lo que reduce el coste de memoria en inferencia. El repositorio ocupa 2,5 GB en formato safetensors y es compatible con la libreria transformers y con text-generation-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma3-SWA, atencion de ventana deslizante) |
| Parametros totales | 1.256.312.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

| Parametro adicional | Valor |
|---|---|
| Capas | 34 |
| Dimension oculta | 1792 |
| Cabezas Q / KV | 28 / 4 |
| Vocabulario | 65.536 |
| Tokens de entrenamiento | 37.847 millones (37,847 B) |
| Mejor val loss | 2.7397 |
| Tamano del repositorio | 2,5 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con 34 capas y dimension oculta de 1792. La innovacion tecnica declarada es el uso de atencion de ventana deslizante ("Gemma3-SWA"), un esquema presente en la familia Gemma 3 que limita el coste de atencion a una ventana local en lugar de atender a toda la secuencia, lo que reduce el consumo de memoria y computo en contextos largos. La configuracion de atencion usa 28 cabezas de query y 4 de key/value (grouped-query attention), lo que disminuye el tamano de la cache KV durante la generacion. El vocabulario es de 65.536 tokens y el contexto maximo declarado es de 8192 tokens.

En cuanto al entrenamiento, la model card indica un total de 37.847 millones de tokens procesados y un mejor valor de validacion (val loss) de 2.7397. No se especifica la composicion del dataset, la mezcla de idiomas, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado posteriores al preentrenamiento. Tampoco se documentan detalles sobre tokenizador, estrategia de empaquetado de secuencias, uso de precision mixta o infraestructura de entrenamiento. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de texto autoregresiva en turco e ingles, segun los idiomas declarados en la model card.
- Conversacion multi-turno: la etiqueta "conversational" y el pipeline text-generation indican uso previsto para dialogos.
- Contexto de hasta 8192 tokens, adecuado para documentos y conversaciones de longitud media.
- Compatibilidad con transformers (AutoModelForCausalLM) y con text-generation-inference.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades de vision o audio: no disponibles (el tag gemma3_text indica que es la variante solo texto).
- Modo "thinking" o razonamiento explicito: no disponible.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en turco: el modelo declara soporte nativo de turco y un contexto de 8192 tokens, suficiente para mantener dialogos multi-turno con historial moderado en entornos de desarrollo y pruebas.
- Generacion de texto en ingles para tareas de redaccion asistida: con 1,25 B de parametros puede desplegarse en una sola GPU consumer y servir como borrador o generador de contenido en pipelines internos.
- Clasificacion y etiquetado de texto mediante generacion condicionada: al ser un modelo causal pequeno, puede usarse con prompts few-shot para tareas de extraccion o categorizacion en lotes.
- Fine-tuning especifico de dominio: su tamano (2,5 GB en safetensors) permite ajustarlo en una unica GPU de 24 GB con tecnicas de parametros eficientes (LoRA/QLoRA), partiendo de una base ya entrenada en turco e ingles.
- Evaluacion comparativa de arquitecturas con atencion de ventana deslizante: util para investigadores que quieran medir el impacto de SWA frente a atencion completa en modelos de ~1 B de parametros.
- Despliegue en entornos con recursos limitados: la configuracion GQA (28/4 cabezas) reduce la cache KV, lo que facilita servir el modelo con text-generation-inference o transformers en hardware modesto.
- Base para experimentos de destilacion o generacion de datos sinteticos en turco, dado el soporte declarado de ese idioma y la licencia permisiva Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es el mejor valor de validacion (val loss = 2.7397) sobre el conjunto de validacion del entrenamiento, que no es comparable directamente con MMLU, HumanEval, GSM8K ni otras evaluaciones estandar.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2,5 GB solo para pesos, mas cache KV y activaciones; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,3-1,5 GB para pesos; en 4 bits, alrededor de 0,7-0,9 GB (estimaciones teoricas, ya que el autor no publica versiones cuantizadas).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 comodo (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4, A100, H100). Cabe holgadamente en GPUs consumer.
- Despliegue: transformers (soporte nativo declarado), text-generation-inference (tag endpoints_compatible). No se documentan pesos GGUF, por lo que llama.cpp y Ollama requeririan conversion previa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Benchmark publicado |
|---|---|---|---|---|---|
| cevher3-test-17 | 1,256 B | 8192 | tr, en | Apache 2.0 | no disponible |
| Gemma 3 1B (Google) | ~1 B | 32K (aprox., segun familia Gemma 3) | multilingue | Gemma Terms | si (no incluido aqui) |
| Llama 3.2 1B (Meta) | 1,24 B | 128K | multilingue | Llama Community License | si (no incluido aqui) |
| Qwen2.5 1.5B (Alibaba) | 1,5 B | 32K | multilingue | Apache 2.0 | si (no incluido aqui) |

Nota: los datos de los modelos comparativos se indican de forma orientativa segun conocimiento general de sus familias; no se dispone de resultados de benchmarks de cevher3-test-17 para una comparacion cuantitativa real.

## Limitaciones y advertencias

- Checkpoint de prueba: el nombre "test-17" y la ausencia de descargas/likes sugieren que no es un modelo validado para produccion.
- Ausencia total de benchmarks publicados: no hay evidencia de rendimiento en tareas estandar (MMLU, HumanEval, GSM8K, etc.).
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento, por lo que no puede evaluarse el sesgo de genero, etnico, politico o cultural.
- Riesgo de alucinacion: inherente a un modelo de 1,25 B sin fases de alineacion documentadas (no se mencionan RLHF ni DPO); la val loss de 2,7397 no garantiza factualidad.
- Cobertura limitada de idiomas: solo turco e ingles declarados; el rendimiento en castellano no esta garantizado.
- Contexto de 8192 tokens: suficiente para dialogos, pero inferior al de modelos comparables de la misma categoria (32K-128K).
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene verificar que el autor tenga derecho a relicenciar los pesos derivados de la arquitectura Gemma 3 original, cuyos terminos de uso son distintos.
- No se ofrecen pesos cuantizados oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos sin GPU o con llama.cpp sin conversion manual.
- Fecha de creacion y actualizacion muy proximas (menos de un minuto de diferencia), lo que apunta a una subida automatica o de prueba sin revision posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-17
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
