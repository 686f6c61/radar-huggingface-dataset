# Andrefty/nn-hw3-transformer-shakespeare

## Resumen

`Andrefty/nn-hw3-transformer-shakespeare` es un transformer decoder-only implementado desde cero en PyTorch y entrenado sobre el corpus completo de diálogos de Shakespeare (105.152 líneas limpias extraídas de 36 obras). No es un modelo de propósito general: se trata de un artefacto académico publicado como parte de la entrega HW3 de un curso de redes neuronales, con pesos en formato `.pt` (checkpoints de PyTorch) y no en safetensors ni GGUF.

El autor, Fărcășanu Tudor Andrei, documenta cuatro configuraciones (small/large × char/subword) con dos esquemas de tokenización: un vocabulario carácter a carácter de 81 símbolos y el tokenizador BPE de Llama-2 con 32.004 tokens. La innovación metodológica destacable es el *split estratificado por obra* (cada una de las 36 obras se divide 80/10/10 y luego se fusionan), que redujo la perplejidad de los modelos subword de ~75 a ~36 PPL frente al split global inicial.

Su relevancia es formativa y de reproducibilidad: sirve como referencia didáctica de arquitectura transformer causal completa (pre-LayerNorm, embeddings posicionales aprendidos, FFN GELU 4×) y como caso de estudio de tokenización y particionado de datos. No está pensado para uso en producción ni para tareas fuera de la generación de diálogo estilo Shakespeare en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con self-attention causal, pre-LayerNorm, embeddings posicionales aprendidos y FFN GELU (dim intermedia = 4× hidden) |
| Parámetros totales | No disponible (no se publica el recuento; estimable a partir de d_model, capas y vocabulario, pero el autor no lo indica) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (modelos char) / 900 tokens (modelos subword) |
| Tipos de cuantización | No disponible (solo se publican checkpoints `.pt` en fp32; no hay versiones cuantizadas) |
| Idiomas soportados | Inglés (`en`), restringido al registro del corpus de Shakespeare |
| Licencia | MIT |
| Formato de pesos | `.pt` (checkpoints PyTorch: `best.pt`, `latest.pt`) |

Configuraciones publicadas:

| Configuración | d_model | Capas | Cabezas | FFN | Contexto |
|---|---|---|---|---|---|
| Small | 384 | 6 | 6 | 1536 | 1024 (char) / 900 (subword) |
| Large | 512 | 8 | 8 | 2048 | 1024 (char) / 900 (subword) |

Optimizador AdamW (β1=0,9, β2=0,95, weight decay 0,1) con cosine annealing y warmup.

## Arquitectura y entrenamiento

El modelo es un transformer autoregresivo decoder-only clásico, sin variantes híbridas ni mecanismos de atención lineal: self-attention causal estándar, normalización previa a cada subcapa (pre-LN), embeddings posicionales aprendidos y feed-forward con activación GELU de dimensión 4× la oculta. Se entrenaron cuatro variantes cruzando dos tamaños (small: 384/6/6; large: 512/8/8) con dos tokenizadores (carácter de 81 símbolos; BPE de Llama-2 de 32.004 tokens).

El corpus son 105.152 líneas de diálogo limpias de 36 obras. La decisión técnica más relevante es el particionado: la entrega inicial usaba un split global 80/10/10, lo que provocaba un desajuste de vocabulario entre obras dispares y disparaba la perplejidad subword a 75–84. La versión final (Approach 2) estratifica por obra, dividiendo cada una independientemente antes de fusionar, y baja la PPL subword a ~36,0 y la char a 3,22. No se documenta RLHF, DPO ni ajuste por instrucciones; el entrenamiento es puramente de modelado de lenguaje next-token. Una exploración posterior (Run 8, *sliding-window tokenization* antes de mezclar y dividir) alcanzó 3,11 PPL en carácter, pero no forma parte de la entrega oficial.

## Capacidades

- Generación de texto autoregresiva en inglés con estilo y estructura de diálogo teatral (hablantes en mayúsculas, acotaciones).
- Continuación de prompts cortos dentro del registro shakesperiano; el autor documenta ejemplos con personajes y obras cruzadas (Romeo en Hamlet).
- Modelado de lenguaje a nivel de carácter (vocabulario de 81 símbolos) y a nivel de subword (BPE Llama-2, 32.004 tokens).
- Generación con muestreo configurable (top-k, temperatura); los ejemplos publicados usan top-k=10 con T=1,0 y T=0,8.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües más allá del inglés.
- No tiene modo *thinking*, visión ni audio.

## Casos de uso

- Docencia y estudio de arquitecturas transformer: el repositorio incluye checkpoints, métricas JSON y curvas de entrenamiento de cuatro configuraciones, lo que permite reproducir el efecto del tamaño y del tokenizador sobre la perplejidad en un entorno controlado.
- Comparación de esquemas de tokenización: los pares char/subword con idéntica arquitectura permiten medir empíricamente cómo el vocabulario afecta a PPL y a la calidad de generación (BLEU/ROUGE) sobre el mismo corpus.
- Estudio de estrategias de particionado de datos: la diferencia entre split global y split estratificado por obra (PPL subword ~75 frente a ~36) es un caso práctico para enseñar fuga de información y desajuste de distribución.
- Generación creativa de diálogo teatral: continuar escenas con hablantes y turnos de palabra para talleres de escritura o prototipos de narrativa interactiva, aceptando que la coherencia se degrada más allá de unas pocas líneas.
- Prueba de concepto de inferencia local: los modelos small (384/6/6) caben en GPU de consumo y sirven para validar pipelines de carga de checkpoints `.pt` y decodificación top-k antes de escalar a modelos mayores.
- Referencia de implementación en PyTorch: el código del repositorio GitHub sirve como base limpia para experimentar con pre-LN, warmup y cosine annealing sin depender de frameworks de alto nivel.
- Evaluación de métricas de generación: los resultados BLEU/ROUGE publicados sobre 20 muestras de test permiten calibrar la sensibilidad de estas métricas en textos con estructura de diálogo.

## Benchmarks y rendimiento

Perplejidad en test (entrega oficial, Approach 2):

| Modelo | Test loss | Test PPL | Mejor época |
|---|---|---|---|
| small_char | 1,1701 | 3,2220 | 61 |
| large_char | 1,1839 | 3,2669 | 32 |
| small_subword | 3,5839 | 36,0073 | 287 |
| large_subword | 3,6052 | 36,7890 | 199 |

Calidad de generación (20 muestras de test, top-k=10, T=1,0):

| Modelo | BLEU-1 | BLEU-2 | BLEU-4 | ROUGE-1 | ROUGE-2 | ROUGE-L |
|---|---|---|---|---|---|---|
| small_char | 0,1104 | 0,0056 | 0,0 | 0,1117 | 0,0056 | 0,0800 |
| large_char | 0,1147 | 0,0043 | 0,0 | 0,1139 | 0,0039 | 0,0777 |
| small_subword | 0,1440 | 0,0068 | 0,0 | 0,1198 | 0,0053 | 0,0878 |
| large_subword | 0,1494 | 0,0026 | 0,0 | 0,1291 | 0,0023 | 0,1023 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo no está orientado a esas tareas. La exploración post-entrega Run 8 alcanzó 3,11 PPL en carácter con tokenización de ventana deslizante.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con d_model 384/512, 6–8 capas y contexto de 1024, el modelo small es del orden de decenas de millones de parámetros y cabe holgadamente en cualquier GPU de consumo; el vocabulario BPE de 32.004 tokens en la capa de salida es el componente que más memoria ocupa en las variantes subword.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para las cuatro configuraciones en fp32; una RTX 3060/4060 o superior es suficiente.
- Cabe en GPU de consumo: sí, en todas las variantes publicadas.
- Opciones de despliegue: los pesos son checkpoints `.pt` de PyTorch, por lo que requieren cargar el `state_dict` con el código del repositorio GitHub. No hay conversión a GGUF, safetensors, vLLM, llama.cpp, Ollama ni TGI disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Corpus | Licencia | Formato |
|---|---|---|---|---|---|
| nn-hw3-transformer-shakespeare (large) | No disponible | 1024 / 900 | 105.152 líneas de Shakespeare | MIT | `.pt` |
| nanoGPT (Karpathy) | ~10M–124M según config | 1024 (char) / 256 (shakespeare-char) | Shakespeare char-level | MIT | `.pt` |
| GPT-2 small | 124M | 1024 | WebText (multidominio) | MIT | safetensors, GGUF vía conversión |

La comparación con nanoGPT es la más directa: ambos son transformers decoder-only didácticos entrenados sobre Shakespeare, con licencia MIT y pesos en PyTorch, aunque nanoGPT publica configuraciones de referencia y este modelo añade el eje char/subword y el estudio de particionado estratificado. Frente a GPT-2 small, la diferencia es de propósito: GPT-2 es un modelo de lenguaje general con tokenizador propio y ecosistema de despliegue amplio, mientras que este modelo está limitado al dominio teatral y carece de herramientas de inferencia empaquetadas. No se dispone de datos de benchmarks cruzados entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Dominio cerrado: entrenado exclusivamente con diálogo de Shakespeare; fuera de ese registro la generación es incoherente.
- Perplejidad subword muy superior a la char (~36 frente a ~3,2), lo que indica un ajuste pobre del vocabulario BPE de Llama-2 al corpus teatral.
- BLEU-4 y ROUGE-2 son prácticamente cero en todas las configuraciones; la coincidencia de n-gramas largos con las referencias es inexistente.
- Riesgo alto de alucinación en el sentido de atribuir frases a personajes incorrectos o mezclar obras, como muestra el ejemplo de Romeo apareciendo en Hamlet.
- Contexto limitado a 1024 tokens (char) y 900 (subword); más allá, la coherencia decae.
- Solo inglés; no hay soporte multilingüe declarado.
- Licencia MIT permite uso comercial, pero el modelo no ofrece garantías de calidad y su naturaleza de trabajo académico desaconseja cualquier despliegue en producción.
- Pesos únicamente en `.pt`: no hay safetensors, GGUF ni integración con servidores de inferencia estándar, lo que añade fricción operativa y riesgos de seguridad al cargar checkpoints con `pickle`.
- El repositorio ocupa 16,4 GB por acumulación de checkpoints históricos y logs; no todo ese contenido corresponde a los modelos finales.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Andrefty/nn-hw3-transformer-shakespeare
- Repositorio GitHub del proyecto: https://github.com/Andrefty/NN_HW3
- Informe oficial de 10 páginas: `hw3_Farcasanu-Tudor_Andrei_report.pdf` (referenciado en la model card, incluido en el repositorio)
