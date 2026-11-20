# Jig09/onomatron-wavenet

## Resumen

Jig09/onomatron-wavenet es un modelo de lenguaje a nivel de carácter (character-level LM) desarrollado por Jig09 (Vincent Le Meur) que genera nombres ficticios de personajes al estilo de la literatura francesa. Se trata de un experimento de escala reducida, construido desde cero en la línea del proyecto makemore de Andrej Karpathy, cuyo objetivo no es competir con modelos de lenguaje generales sino servir como banco de pruebas comparativo entre arquitecturas neuronales sobre una tarea acotada: modelar la distribución de nombres propios franceses.

El modelo emplea una arquitectura WaveNet adaptada a caracteres, con 37.624 parámetros totales y un peso de 0,15 MB, entrenado sobre el dataset Jig09/onomatron-names (un nombre saneado por línea). Forma parte de un benchmark más amplio (onomatron) en el que se comparan once arquitecturas (rnn, mlp, wavenet, dilated_wavenet, ngram, rwkv, gru, lstm, linear, transformer y mamba) bajo un protocolo común de evaluación con NLL de validación y test.

Su relevancia es fundamentalmente didáctica y metodológica: demuestra cómo una arquitectura convolucional dilatada tipo WaveNet puede competir con RNNs y transformers en una tarea de modelado de secuencias cortas con un presupuesto de parámetros mínimo. No es un modelo apto para generación de texto general, razonamiento ni ninguna tarea semántica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WaveNet (convolucional dilatada, character-level) |
| Parametros totales | 37.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8 caracteres (block_size = 8) |
| Tipos de cuantizacion | no disponible (pesos en fp32 vía state_dict de PyTorch) |
| Idiomas soportados | francés (fr) |
| Licencia | MIT (código y pesos); datos de entrenamiento con licencia "other" y atribución por fuente |
| Formato de pesos | model.pt (state_dict de PyTorch) + config.json |

## Arquitectura y entrenamiento

El modelo es una WaveNet character-level: una pila de convoluciones dilatadas causales que opera sobre secuencias de hasta 8 caracteres (block_size = 8) para predecir el siguiente carácter. El vocabulario consta de 38 caracteres más un token centinela `.` que marca el final del nombre. Las dimensiones internas son emb_dim = 31 y h_dim = 82, lo que da lugar a los 37.624 parámetros totales. No incorpora mecanismos de atención, capas recurrentes ni estado oculto persistente; la ventana de contexto es fija y muy corta.

El entrenamiento se realizó sobre el dataset Jig09/onomatron-names (un nombre por línea, normalizado conservando acentos y descartando el resto). El procedimiento incluyó una fase de ajuste de hiperparámetros con Optuna (muestreador TPE, poda ASHA, objetivo NLL de validación, estudios persistentes en SQLite) con seguimiento de cada trial en MLflow. El reentrenamiento final se ejecutó durante 10.000 pasos con AdamW (lr = 0,001057937785806674, weight_decay = 0,001, clip_grad = 5,0, batch_size = 256), semilla 42, dispositivo MPS y early stopping con paciencia 20. El tiempo total de entrenamiento fue de 19,5 segundos con un pico de 409 MB de memoria.

La evaluación sigue un protocolo estricto: partición train/val/test = 80/10/10 dividida por nombre (nunca por n-grama, para evitar fuga de información entre n-gramas correlacionados del mismo nombre) con semilla fija, y el conjunto de test se consulta una única vez en la evaluación final. La velocidad de inferencia se midió en CPU.

## Capacidades

- Generación de nombres ficticios de personajes con estética de literatura francesa, a nivel de carácter.
- Modelado de la distribución estadística de cadenas cortas (hasta 8 caracteres de contexto).
- Muestreo reproducible mediante semilla (`net.sample(n=20, seed=42)`).
- Ejecución en CPU y en dispositivos Apple Silicon (MPS); no requiere GPU.
- Interfaz de línea de comandos (`generate.py`) y API Python (`load_bundle_from_hub`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües más allá del francés.
- No dispone de modo "thinking" ni de decodificación especulativa.

## Casos de uso

- Generación de nombres para personajes en obras de ficción ambientadas en Francia: el modelo produce nombres plausibles en estilo literario francés (por ejemplo, "chloyuv", "flaucel", "phéliti") que pueden servir como punto de partida creativo.
- Pruebas de infraestructura de despliegue de modelos: con 0,15 MB y 37.624 parámetros, es útil para validar pipelines de carga, serialización y serving antes de pasar a modelos reales.
- Docencia y divulgación sobre modelos de lenguaje: permite ilustrar de forma tangible conceptos como modelado a nivel de carácter, NLL, sobreajuste, partición por nombre y ajuste de hiperparámetros con Optuna.
- Benchmarking de arquitecturas: sirve como referencia reproducible (NLL de validación 2,4002, NLL de test 2,3632) frente a rnn, mlp, transformer, mamba, rwkv, etc. dentro del estudio onomatron.
- Generación de datasets sintéticos de nombres para pruebas de software: útil para poblar bases de datos de test con nombres ficticios franceses sin datos personales reales.
- Experimentos de investigación sobre eficiencia: comparar coste computacional (19,5 s de entrenamiento, 1.396 nombres/s en CPU) frente a arquitecturas alternativas en tareas de modelado de secuencias cortas.
- Reproducción de experimentos de makemore: base para extender el estudio con nuevas arquitecturas o datasets bajo el mismo protocolo de evaluación.

## Benchmarks y rendimiento

Resultados del benchmark onomatron (ordenado por NLL de validación; menor es mejor):

| Modelo | val_nll | test_nll | Parámetros | Tamaño (MB) | Wall (s) | Nombres/s |
|---|---|---|---|---|---|---|
| rnn | 2,3592 | 2,3491 | 7.657 | 0,03 | 54,7 | 4.962 |
| mlp | 2,3759 | 2,3679 | 39.291 | 0,16 | 12,8 | 7.688 |
| **wavenet (este modelo)** | **2,4002** | **2,3632** | **37.624** | **0,15** | **19,5** | **1.396** |
| dilated_wavenet | 2,4557 | 2,4275 | 13.016 | 0,05 | 28,8 | 445 |
| ngram | 2,4706 | 2,4632 | 0 | 0,44 | 0,1 | 19.243 |
| rwkv | 2,4849 | 2,3446 | 120.998 | 0,48 | 37,2 | 1.085 |
| gru | 2,5292 | 2,4013 | 8.012 | 0,03 | 23,3 | 3.739 |
| lstm | 2,5381 | 2,3703 | 10.062 | 0,04 | 7,7 | 3.846 |
| linear | 2,5918 | 2,5928 | 1.444 | 0,01 | 3,7 | 7.018 |
| transformer | 3,1470 | 2,3757 | 805.158 | 3,22 | 66,6 | 253 |
| mamba | nan | 2,3653 | 56.102 | 0,22 | 716,6 | 87 |

El modelo wavenet ocupa la tercera posición por NLL de validación y la cuarta por NLL de test. Su throughput en CPU (1.396 nombres/s) es notablemente inferior al de rnn (4.962) y mlp (7.688), pero superior al de transformer (253) y mamba (87). El entrenamiento es el segundo más rápido del estudio (19,5 s), solo por detrás de ngram (0,1 s) y mlp (12,8 s).

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo se ejecuta en CPU y ocupa 0,15 MB en disco. El pico de memoria durante el entrenamiento en MPS fue de 409 MB.
- GPU recomendadas: ninguna necesaria. Funciona en cualquier CPU moderna; el autor lo entrenó en Apple Silicon (MPS).
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o integrada; también en Raspberry Pi y dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo (carga de `model.pt` + `config.json`), CLI incluida (`generate.py`), API Python (`load_bundle_from_hub`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (formatos no compatibles con estos servidores).
- Latencia y throughput: 1.396 nombres/s en CPU (medido por el autor); 19,5 s de entrenamiento en MPS con 10.000 pasos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | val_nll | test_nll | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **onomatron-wavenet** | 37.624 | 8 caracteres | 2,4002 | 2,3632 | MIT | Hugging Face |
| onomatron-rnn | 7.657 | 8 caracteres | 2,3592 | 2,3491 | MIT (mismo proyecto) | Hugging Face |
| onomatron-mlp | 39.291 | 8 caracteres | 2,3759 | 2,3679 | MIT (mismo proyecto) | Hugging Face |
| onomatron-transformer | 805.158 | 8 caracteres | 3,1470 | 2,3757 | MIT (mismo proyecto) | Hugging Face |
| onomatron-mamba | 56.102 | 8 caracteres | nan | 2,3653 | MIT (mismo proyecto) | Hugging Face |

Dentro del benchmark onomatron, wavenet se sitúa en un punto intermedio: mejor NLL que dilated_wavenet, ngram, gru, lstm, linear y transformer, pero peor que rnn, mlp, rwkv y mamba. Su principal ventaja frente a rnn y mlp es la capacidad teórica de capturar dependencias de mayor alcance mediante dilataciones, aunque con block_size = 8 el efecto es limitado. Frente a transformer y mamba, ofrece un coste de entrenamiento e inferencia mucho menor con una calidad comparable en test.

## Limitaciones y advertencias

- Modelo de lenguaje a nivel de carácter sin semántica ni gramática: solo modela estadística de caracteres en nombres cortos. No genera texto coherente.
- Sesgo hacia la literatura francesa: el vocabulario y las distribuciones reflejan el dataset de nombres franceses; otros idiomas o estilos no están representados.
- Riesgo de reproducción literal: con un conjunto de entrenamiento de pocos miles de nombres, el modelo puede reproducir nombres del train de forma literal y generar nombres que coincidan con personas reales. Son ficticios por construcción, pero deben tratarse como tales.
- Prohibido su uso para nombrar personas reales o para cualquier decisión sobre individuos (indicado explícitamente en la model card).
- Licencia de datos: los nombres extraídos del dataset ObTIC (`compnet-renard/7-romans-alias-resolution`) no tienen licencia declarada y requieren citar a Maurel et al., "Du repérage à l'analyse", Digital Humanities 2025 (ObTIC, Sorbonne Université). Los ficheros locales `data/external/*.txt` tampoco declaran licencia.
- Contexto muy limitado (8 caracteres): no puede modelar dependencias de largo alcance ni nombres de más de 8 caracteres de forma consistente.
- Sin soporte multilingüe ni de tool calling: no apto para pipelines de agentes, RAG ni aplicaciones conversacionales.
- Alucinación: en este contexto, el término se traduce en generación de cadenas sin significado; no hay riesgo de "alucinación factual" porque el modelo no afirma hechos, pero sí de producir nombres inexistentes o inapropiados.
- Sin cuantizaciones publicadas ni integración con servidores de inferencia estándar (vLLM, TGI, llama.cpp): el despliegue requiere PyTorch y el paquete `onomatron` vendorizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jig09/onomatron-wavenet
- Dataset de entrenamiento: https://huggingface.co/datasets/Jig09/onomatron-names
- Benchmark completo: https://huggingface.co/Jig09/onomatron-benchmark
- Repositorio del proyecto: https://github.com/vlemeur/onomatron
- makemore (Karpathy): https://github.com/karpathy/makemore
- Dataset ObTIC de resolución de alias: `compnet-renard/7-romans-alias-resolution`
- Referencia: Maurel et al., "Du repérage à l'analyse", Digital Humanities 2025 (ObTIC, Sorbonne Université)
