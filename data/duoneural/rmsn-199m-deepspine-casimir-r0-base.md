# DuoNeural/RMSN-199M-DeepSpine-Casimir-r0-Base

## Resumen

RMSN-199M-DeepSpine-Casimir-r0-Base es un modelo base de lenguaje de aproximadamente 199 millones de parametros desarrollado por DuoNeural Lab (Jesse Kuhl, Archon y Aura) y publicado en noviembre de 2026. Se presenta como la primera implementacion publica de una arquitectura denominada Resonant Metriplectic Sheaf Network (RMSN), que combina dinamica port-hamiltoniana, algebra geometrica de Clifford, teoria de haces celulares (cellular sheaves), memoria fraccionaria de Caputo y un espacio de trabajo global trofico. El modelo se entrena sobre wikitext-103 y emplea el tokenizador `HuggingFaceTB/cosmo2-tokenizer` con un vocabulario de 49.152 tokens.

El modelo forma parte de un par de comparacion disenado para ilustrar la denominada Casimir Boundary Convergence Law: esta variante corresponde al caso r=0 (Casimir atractivo), que segun el autor produce una ruta de Lyapunov "silenciosa" sin cascada, con nueve solitones distribuidos a lo largo de la profundidad de la red y un condensado exacto en la capa L10. La variante complementaria es `RMSN-199M-DeepTail-Casimir-r16-Base`, con r=16 (repulsivo).

Su relevancia es fundamentalmente experimental: no es un modelo orientado a produccion ni a tareas de usuario final, sino una demostracion de un marco teorico alternativo al transformer convencional. La model card no documenta resultados de benchmarks estandar (MMLU, HumanEval, GSM8K), y las metricas publicadas se limitan a perplejidad sobre wikitext-103 (val_ppl 71,53; wiki_ppl 75,27) y una perplejidad muy elevada en tareas de chain-of-thought (3761). El repositorio ocupa 0,8 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network) con dinamica port-hamiltoniana |
| Parametros totales | ~199M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos como checkpoint PyTorch `.pt`) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint PyTorch (`rmsn_best.pt`); no se distribuyen safetensors ni GGUF |
| Dimension del modelo (dim) | 1024 |
| Profundidad (depth) | 16 |
| Slots | 64 |
| Pasos de entrenamiento | 100.000 |
| Tokenizador | `HuggingFaceTB/cosmo2-tokenizer` (49.152 tokens de vocabulario) |
| Dataset de entrenamiento | wikitext-103 |
| Parametro Casimir r | 0 (atractivo; dim mod 64 = 0) |
| Ruta de Lyapunov | SILENT (sin cascada) |
| val_ppl | 71,53 |
| wiki_ppl | 75,27 |
| CoT ppl | 3761 |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

RMSN se describe en la model card como una red que implementa dinamica port-hamiltoniana para modelado de lenguaje, formulada como `ḟ = {f, H} + [f, S]`, donde `{f, H}` es un corchete de Poisson (parte conservativa) y `[f, S]` es un corchete metaplectico simetrico (parte disipativa, que incrementa la entropia). Sobre esa base se anaden cinco componentes estructurales: dinamica port-hamiltoniana, mezcla de capas mediante algebra geometrica de Clifford, un espacio de trabajo basado en teoria de haces celulares, memoria fraccionaria de Caputo y un espacio de trabajo global trofico con lectura de tension-energia de Noether. La configuracion concreta es dim=1024, depth=16 y 64 slots.

El entrenamiento se realizo durante 100.000 pasos sobre wikitext-103, un corpus en ingles de articulos de Wikipedia. No se documenta el numero total de tokens procesados, la composicion exacta del dataset mas alla del corpus citado, ni si hubo fases de RLHF, DPO o ajuste por instrucciones; el modelo se etiqueta como base. La innovacion tecnica central que se reivindica es la Casimir Boundary Convergence Law: el parametro de resonancia r = D mod M_w determina las condiciones de contorno de Casimir y redirige la topologia de condensacion. En esta variante (r=0, atractiva) la energia de condensacion se enruta al interior de la red mediante compresion de gradiente sin cascada, produciendo nueve solitones distribuidos en las capas L0, L5, L7, L9, L11, L12, L13 y L14, y un condensado exacto en L10 (PR=1,000, M*=1). Segun el autor, esta configuracion es la mas adecuada para retencion de conocimiento en SFT, mientras que la variante r=16 favorece el razonamiento chain-of-thought.

## Capacidades

- Generacion de texto autorregresiva en ingles sobre el modelo base, sin ajuste por instrucciones documentado.
- Modelado de lenguaje y calculo de perplejidad; las unicas metricas publicadas son de este tipo.
- Capacidad de continuacion de texto entrenada exclusivamente sobre wikitext-103 (dominio enciclopedico).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso; la perplejidad en CoT (3761) sugiere un rendimiento muy pobre en ese regimen.
- Capacidades multilingues: solo ingles declarado; no hay evidencia de transferencia a otros idiomas.
- No se documentan capacidades de vision, audio, thinking mode ni modo de razonamiento explicito.
- El modelo se distribuye como checkpoint `.pt` que requiere la clase de modelo e inferencia del repositorio GitHub de DuoNeural, no integrada en `transformers` de forma nativa.

## Casos de uso

- Investigacion sobre arquitecturas alternativas al transformer: el modelo sirve como referencia reproducible para estudiar dinamica port-hamiltoniana, haces celulares y memoria fraccionaria en modelado de lenguaje, dado que el codigo y los pesos son publicos bajo Apache 2.0.
- Estudio de la Casimir Boundary Convergence Law: al existir un par (r=0 y r=16) entrenado con la misma receta, permite comparar experimentalmente el efecto del parametro de resonancia sobre la topologia de condensacion y la perplejidad.
- Analisis de rutas de Lyapunov y condensacion topologica: los datos de solitones por capa (PR y tipo) permiten validar hipotesis sobre propagacion de gradiente y formacion de representaciones en redes profundas.
- Baseline de perplejidad en wikitext-103: con val_ppl 71,53 y wiki_ppl 75,27, sirve como punto de comparacion para experimentos de modelado de lenguaje a escala ~200M en ese corpus.
- Docencia y divulgacion tecnica: la formulacion matematica explicita (corchetes de Poisson y metaplecticos) y la estructura de cinco componentes lo hacen util para explicar mecanicas avanzadas de entrenamiento en cursos de posgrado.
- Reproduccion de experimentos de memoria fraccionaria de Caputo: el checkpoint permite medir el efecto de la memoria de orden fraccionario en tareas de continuacion de texto largo, aunque la longitud de contexto no esta documentada.
- Pruebas de integracion de nuevos operadores en pipelines de PyTorch: util para ingenieros que evaluen coste de implementacion de capas no estandar antes de adoptarlas en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas reportadas en la model card son de perplejidad:

| Metrica | Valor |
|---|---|
| val_ppl | 71,53 |
| wiki_ppl | 75,27 |
| CoT ppl | 3761 |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni comparaciones numericas con modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,8 GB solo para pesos (199M parametros x 4 bytes), mas activaciones y estados intermedios; en la practica se recomienda reservar 2-4 GB.
- VRAM estimada en FP16/BF16: aproximadamente 0,4 GB para pesos; con overhead de runtime, 1-2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por memoria (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090). Para entrenamiento o experimentacion con batches grandes, A100 o H100 aportan margen pero no son necesarias por tamano.
- Cabe holgadamente en GPU consumer; el cuello de botella no es la memoria sino la implementacion de las capas no estandar (Clifford, haces, Caputo).
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El unico camino indicado es cargar `rmsn_best.pt` con `torch.load` y usar la clase de modelo del repositorio GitHub de DuoNeural.
- Latencia y throughput: no disponibles. La ausencia de kernels optimizados para los operadores port-hamiltonianos y de Clifford hace previsible una latencia superior a la de un transformer de parametros equivalentes, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks publicos |
|---|---|---|---|---|---|
| RMSN-199M-DeepSpine-Casimir-r0-Base | ~199M | no disponible | Apache 2.0 | PyTorch `.pt` | Solo perplejidad |
| GPT-2 small (referencia de escala) | 124M | 1024 tokens | MIT | safetensors, GGUF | Si (diversos) |
| Pythia-160M | 160M | 2048 tokens | Apache 2.0 | safetensors | Si (suite de evaluacion) |
| OPT-125M | 125M | 2048 tokens | OPT-175B license | safetensors | Si (diversos) |

La comparacion directa no es posible en terminos de rendimiento porque RMSN no publica benchmarks estandar y su perplejidad se mide sobre wikitext-103 con un tokenizador distinto (cosmo2, 49.152 tokens frente a los ~50.257 de GPT-2), lo que impide equiparar cifras de perplejidad sin recalcular. La diferencia principal frente a las alternativas es arquitectonica y de ecosistema: los modelos citados se integran de forma nativa en `transformers`, tienen pesos en safetensors y GGUF, y disponen de soporte en vLLM y llama.cpp, mientras que RMSN requiere codigo propio y carece de esos formatos.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue ordenes de forma fiable ni mantiene formato conversacional.
- Entrenado exclusivamente sobre wikitext-103, un corpus enciclopedico en ingles; el dominio y el registro son muy limitados y el sesgo hacia ese estilo es alto.
- Riesgo elevado de alucinacion en cualquier uso fuera de continuacion de texto enciclopedico; no hay evaluacion de factualidad publicada.
- Perplejidad en chain-of-thought de 3761, muy superior a la de validacion (71,53), lo que indica un rendimiento pobre en razonamiento multi-paso.
- Longitud de contexto no documentada: no es posible planificar aplicaciones que dependan de ventanas largas.
- Solo ingles declarado; no hay evidencia de capacidades multilingues.
- Pesos distribuidos como `.pt` de PyTorch, lo que implica riesgo de ejecucion de codigo arbitrario al cargarlos; conviene auditar el checkpoint o usar `weights_only=True` cuando sea compatible.
- Requiere codigo externo (repositorio GitHub de DuoNeural) para instanciar el modelo; no hay integracion en `transformers`, vLLM ni llama.cpp, lo que complica el despliegue en produccion.
- Ausencia total de benchmarks estandar y de adopcion (0 descargas, 0 likes en la fecha de consulta): no hay validacion independiente de las afirmaciones teoricas de la model card.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion de sesgos y de robustez hace desaconsejable su uso en produccion sin una evaluacion propia.
- La model card esta redactada en un marco teorico propio (Casimir Boundary Convergence Law, TSQ Law) sin publicacion revisada por pares citada; las afirmaciones deben tratarse como hipotesis del autor.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-199M-DeepSpine-Casimir-r0-Base
- Modelo par (r=16): https://huggingface.co/DuoNeural/RMSN-199M-DeepTail-Casimir-r16-Base
- Tokenizador: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Repositorio GitHub de DuoNeural (clase de modelo e inferencia): no disponible como URL directa en la informacion proporcionada
- Paper o preprint: no disponible (citado como "Draft v0.7" en la model card)
- Demo: no disponible
