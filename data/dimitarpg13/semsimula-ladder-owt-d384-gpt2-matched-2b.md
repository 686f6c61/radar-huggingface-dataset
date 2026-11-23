# dimitarpg13/semsimula-ladder-owt-d384-gpt2-matched-2b

## Resumen

`semsimula-ladder-owt-d384-gpt2-matched-2b` es un modelo de lenguaje de tipo GPT-2 de pequeno tamano (dimension de modelo 384) entrenado por el autor independiente dimitarpg13 como **linea base de referencia** dentro de un estudio de investigacion denominado "SemSimula", orientado a modelos de lenguaje conservativos con potencial escalar y mecanica lagrangiana. No es un modelo destinado a produccion, sino un punto de comparacion controlado: reproduce la misma arquitectura GPT-2 que la referencia de 0,53B tokens del mismo autor, pero entrenada sobre cuatro veces mas tokens (2,13B) y con un schedule de learning rate WSD (warmup, constante, decay) escalado a 130.000 pasos.

El modelo se entrena sobre OpenWebText (Skylion007/openwebtext) y su proposito es servir de referencia contra la que se comparan todos los modelos de la familia "Fock" del estudio con presupuesto de 2B tokens. Es, por tanto, material de investigacion reproducible: el autor publica el notebook de Colab, los logs por paso, los checkpoints intermedios y las predicciones pre-registradas antes del entrenamiento. Su metrica principal es la perplejidad de validacion a bloque 512, que alcanza 42,69 (media de las tres ultimas evaluaciones).

La relevancia actual es metodologica mas que de capacidad: documenta de forma exhaustiva como cambia la perplejidad con el presupuesto de tokens y con la fase del schedule de learning rate, y demuestra que casi toda la ganancia final de un entrenamiento WSD se concentra en la fase de decay (0,371 nats en este caso). Es util para investigadores que quieran reproducir estudios de ablacion de mecanismos con presupuesto controlado, no para aplicaciones de texto reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (dimension de modelo d=384) |
| Parametros totales | no disponible (no declarado en la model card; el tag indica "gpt2" y d384) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado y evaluado a bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `.pt` de PyTorch, no hay GGUF publicado) |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch `.pt` (`checkpoints/gpt2_baseline_best.pt`, `checkpoints/gpt2_baseline_step25000.pt`) |
| Tokens de entrenamiento | 2.129.920.000 (130.000 pasos x 32 x 512) |
| Dataset | Skylion007/openwebtext (pool de ~2,0B tokens) |
| Schedule de learning rate | WSD: warmup lineal 5%, constante hasta el 65%, cosine decay hasta 6e-05; pico 1,2e-03 |
| Hardware de entrenamiento | 1x A100-40GB, 10,75 h, 0,30 s por paso |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura GPT-2 y dimension de modelo 384, definido integramente en la celda 3 del notebook publicado (`code/colab_matched_gpt2_baseline_openwebtext.ipynb`). No incorpora mecanismos del estudio SemSimula (potencial escalar, formulacion lagrangiana ni dinamica conservativa): es precisamente el control "vanilla" contra el que se miden esos mecanismos. El entrenamiento usa batches de 32 secuencias de 512 tokens, con ventanas aleatorias extraidas con reemplazo del pool de OpenWebText, de modo que el modelo ve el corpus aproximadamente 1,07 veces de media.

El schedule de learning rate es el elemento central del diseno experimental: warmup lineal hasta el paso 6.500, pico constante de 1,2e-03 hasta el paso 84.500 y decay coseno hasta 6e-05 en el paso 130.000. El autor pre-registro cuatro predicciones antes de la ejecucion: ausencia de picos de loss (cumplida, mayor subida entre evaluaciones de +0,013 nats), perplejidad final entre 41,0 y 45,5 (cumplida, 42,69), al menos un 5% mejor que el mismo modelo a 0,53B tokens (cumplida, -11,7% frente a 48,37) y una ganancia de decay menor que a 0,53B tokens (fallada: 0,371 nats frente a 0,338). La curva de entrenamiento muestra que la fase constante apenas mejora la perplejidad (de 64,97 a 61,84 entre 0,53B y 1,38B tokens, un 4,8%) y que casi toda la ganancia final procede del decay.

## Capacidades

- Generacion de texto autoregresiva en ingles, con la calidad propia de un GPT-2 pequeno entrenado sobre 2,13B tokens de OpenWebText.
- Modelado de lenguaje y calculo de perplejidad sobre corpus de dominio general (web en ingles).
- Reproduccion exacta de experimentos: checkpoints intermedios, log por paso y notebook autocontenido.
- Reanudacion de entrenamiento bit a bit desde checkpoints rodantes cada 2.500 pasos (probado en un modelo pequeno).
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo de razonamiento explicito (thinking mode), vision ni audio.
- Multilingue: no; solo ingles.
- No esta ajustado con RLHF ni DPO; no hay alineacion de instrucciones.

## Casos de uso

- Referencia de ablacion en investigacion: sirve como linea base controlada para medir el efecto de mecanismos alternativos (modelos conservativos, potenciales escalares) con el mismo presupuesto de 2B tokens y el mismo schedule; cualquier mejora de los modelos Fock debe compararse contra la perplejidad 42,69 de este modelo.
- Estudio del schedule WSD: la curva publicada (92,99 en el paso 6.500, 61,84 al final de la fase constante, 42,68 al final) permite analizar cuanto de la ganancia final aporta el decay en funcion del presupuesto de tokens.
- Reproduccion de experimentos de scaling de tokens: con 0,53B y 2,13B tokens del mismo modelo y schedule, se puede estudiar la relacion entre tokens vistos y perplejidad (48,37 frente a 42,69) en un rango de computo asequible en una sola A100.
- Docencia y formacion: el notebook autocontenido y el log completo permiten ilustrar un ciclo de entrenamiento GPT-2 de principio a fin, incluyendo pre-registro de hipotesis y evaluacion de resultados.
- Generacion de texto de dominio general en ingles para pruebas de pipelines: util como modelo de sustitucion barato en tests de infraestructura de inferencia (tokenizacion, batching, streaming) sin coste de modelos grandes.
- Analisis de corpus OpenWebText: el modelo puede emplearse para calcular perplejidades relativas de subconjuntos del corpus y detectar dominios o estilos infrarepresentados.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| Perplejidad de validacion (bloque 512, media de las 3 ultimas evaluaciones de 500 pasos) | OpenWebText | validation | 42,69 |

Comparaciones internas declaradas por el autor:

| Modelo | Tokens | Perplejidad | Diferencia relativa |
|---|---:|---:|---:|
| Este modelo (WSD, pico 1,2e-03) | 2,13B | 42,69 | - |
| Mismo modelo, mismo schedule, 0,53B tokens (W2) | 0,53B | 48,37 | -11,7% |
| Referencia publicada a 0,53B (cosine, pico 6e-04) | 0,53B | 49,81 | -14,3% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con d=384 y arquitectura GPT-2, el modelo es muy pequeno (el repositorio completo, incluidos checkpoints y logs, ocupa 0,3 GB), por lo que la inferencia en FP32 cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el entrenamiento se realizo en una A100-40GB (10,75 h a 0,30 s por paso), pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: si, practicamente en cualquier RTX o equivalente; tambien en CPU para generacion no interactiva.
- Opciones de despliegue: los pesos se distribuyen como `.pt` de PyTorch, por lo que el despliegue requiere cargar el modelo desde el notebook o el codigo del autor. No hay versiones GGUF publicadas para llama.cpp u Ollama, ni configuracion lista para vLLM o TGI; seria necesario exportar los pesos a safetensors y definir un `config.json` compatible con Hugging Face Transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad (OpenWebText val, bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| semsimula-ladder-owt-d384-gpt2-matched-2b | no disponible (d=384, GPT-2) | no disponible (entrenado a 512) | 42,69 | CC-BY-4.0 | Pesos `.pt` en Hugging Face |
| semsimula-ladder-owt-d384-l2-gpt2-matched (mismo autor) | no disponible (d=384, GPT-2) | no disponible | 49,81 (cosine, 0,53B tokens) | no disponible en la informacion | Pesos en Hugging Face |
| GPT-2 small (referencia de arquitectura) | 124M | 1.024 | no disponible en esta ficha | MIT (upstream) | Ampliamente disponible en safetensors/GGUF |

La comparacion con GPT-2 small es solo arquitectonica: no se dispone de perplejidades comparables bajo el mismo protocolo de evaluacion en la informacion proporcionada, por lo que no se establece una comparacion de rendimiento directa.

## Limitaciones y advertencias

- Modelo de investigacion sin alineacion: no ha pasado por RLHF ni DPO, por lo que puede generar contenido toxico, sesgado o factualmente incorrecto sin filtros.
- Riesgo alto de alucinacion: es un GPT-2 pequeno entrenado sobre 2,13B tokens; su conocimiento factual es limitado y su coherencia en textos largos, baja.
- Solo ingles: no soporta castellano ni otros idiomas de forma fiable.
- Contexto limitado: entrenado y evaluado a bloques de 512 tokens; no se declara una longitud de contexto mayor.
- No apto para produccion: carece de tool calling, modo de razonamiento y formatos de despliegue estandar (GGUF, safetensors con config de Transformers).
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero el modelo no esta pensado para ello y su calidad no lo justifica.
- Perplejidad no verificada: el unico resultado declarado (42,69) figura como `verified: false` en el model-index; no hay evaluacion independiente.
- Pesos en `.pt`: requieren el codigo del autor o una conversion manual para integrarse en stacks estandar; no hay garantia de compatibilidad con versiones futuras de PyTorch.
- El nombre y los tags del modelo pueden inducir a confusion: aunque incluye etiquetas como "conservative-language-model" o "lagrangian-mechanics", este checkpoint concreto es la linea base GPT-2 estandar, no un modelo con mecanica lagrangiana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-gpt2-matched-2b
- Referencia a 0,53B tokens del mismo autor: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Coleccion Gen 3 (2B tokens): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-2b-training-tokens-6ad56f3d2a560dd121e59b60
- Coleccion Gen 3 (ladder de 0,53B tokens): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Repositorio del paper (nota de pre-registro Matched_GPT2_Baselines.md): https://github.com/dimitarpg13/semsimula-paper
- Dataset: https://huggingface.co/datasets/Skylion007/openwebtext
