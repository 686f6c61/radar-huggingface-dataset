# rat-lab/mh-ec2-ttomd-K2-jk

## Resumen

`rat-lab/mh-ec2-ttomd-K2-jk` es un conjunto de adaptadores LoRA (PEFT) entrenados sobre el modelo base `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT`, que a su vez deriva de Gemma 2 2B instruction-tuned. No se trata de un modelo fundacional, sino de un artefacto de investigación: concretamente, la celda K=2 con estimador *jackknife* de la tabla «cobertura x corrección de sesgo» dentro de una serie de experimentos de aprendizaje por preferencias sensible al riesgo (riesgo entrópico, tau = 10). El algoritmo empleado es online IPO (`--alg oipo1`, implementado en `risk_egpo/tt_omd.py`), con corrección de sesgo a dos escalas temporales y paso gamma = 0.1.

El repositorio contiene 19 checkpoints (pasos 250 a 4680, cada 250 pasos) del adaptador, además de los ficheros de tokenizador. Cada checkpoint incluye `adapter_model.safetensors` y `adapter_config.json`; no se incluye el estado de reanudación de DeepSpeed. El entrenamiento partió de un *warm start* en `ipo-e-c10.0/checkpoint-936` con 100 pasos de calentamiento, usando el dataset PKU-Alignment/PKU-SafeRLHF y semilla 42.

Su relevancia es estrictamente de investigación: sirve para reproducir y auditar resultados de métodos de optimización de preferencias con control de riesgo y corrección de sesgo. Según la propia model card, el adaptador no fue entrenado por el autor que lo publica, sino extraído sin cambios de `rat-lab/rlj-ec2-fig9-K2-jk` y verificado byte a byte mediante sha256 en los checkpoints 250, 2500 y 4680. El repositorio presenta 0 descargas, 0 «likes» y no declara licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder denso; arquitectura del modelo base: Gemma 2 (atención local/global intercalada, ventana deslizante) |
| Parámetros totales | No disponible en el repositorio. El modelo base Gemma 2 2B declara 2,6 mil millones de parámetros según su documentación pública |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el repositorio. El modelo base Gemma 2 2B declara 8.192 tokens de contexto |
| Tipos de cuantización | No especificados para el adaptador. Al derivar de Gemma 2 2B, el modelo fusionado puede cuantizarse con GGUF/AWQ/GPTQ, pero el repositorio no documenta ningún esquema |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no declarada en el repositorio; el modelo base Gemma está sujeto a los Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptadores LoRA) + `adapter_config.json`; ficheros de tokenizador en cada subcarpeta `checkpoint-<paso>/` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder denso (Gemma 2) mediante LoRA, por lo que no modifica los pesos base: solo añade matrices de bajo rango entrenables. El entrenamiento se realizó con el algoritmo online IPO (`--alg oipo1`), una variante del *Identity Preference Optimization* planteada en el contexto de optimización de preferencias con control de riesgo. El componente diferencial es el esquema a dos escalas temporales (TT, *two-timescale*) con paso gamma = 0.1, combinado con un estimador *jackknife* de tipo *leave-one-out* para la corrección de sesgo. El riesgo se modela de forma entrópica con tau = 10 (`--risk entropic --risk_c 10.0`).

Los datos provienen de PKU-Alignment/PKU-SafeRLHF, un corpus de preferencias orientado a seguridad y alineación. La cobertura del experimento es K = 2 (`--ypp_samples 2`), es decir, dos muestras por prompt. El entrenamiento parte de un *warm start* desde `ipo-e-c10.0/checkpoint-936` con 100 pasos de calentamiento y una longitud de generación de 64 tokens nuevos. Se generaron 19 puntos de control cada 250 pasos hasta el paso 4680, lo que permite estudiar la dinámica de optimización a lo largo del entrenamiento. La model card no documenta el rango LoRA, el *learning rate*, el tamaño de lote ni el número total de tokens vistos.

## Capacidades

- Generación de texto conversacional en el marco de un modelo instruction-tuned de 2B parámetros (heredado del modelo base).
- Modelado de preferencias humanas bajo un criterio de riesgo entrópico, orientado a seguridad más que a capacidad bruta.
- Corrección de sesgo mediante estimador *jackknife* durante el entrenamiento (capacidad del método, no de inferencia).
- Diecinueve checkpoints intermedios que permiten analizar la evolución del ajuste por pasos.
- Soporte de *tool calling* / *function calling*: no documentado en el repositorio ni en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el repositorio no declara lista de idiomas.
- Capacidad especial: no declarada (sin modo *thinking*, sin visión, sin audio).

## Casos de uso

- Reproducción de experimentos de optimización de preferencias: el adaptador replica exactamente la celda K=2 con *jackknife* de la tabla cobertura x corrección de sesgo, por lo que sirve para verificar resultados publicados con los mismos hiperparámetros (tau = 10, gamma = 0.1, semilla 42).
- Auditoría de métodos de corrección de sesgo a dos escalas: al disponer de 19 checkpoints separados 250 pasos, se puede medir cómo evoluciona el sesgo estimado frente al número de actualizaciones y aislar el efecto del estimador *leave-one-out*.
- Investigación en alineación y seguridad: el corpus PKU-SafeRLHF permite evaluar si el ajuste reduce respuestas inseguras y a qué coste en utilidad, comparando contra el modelo base sin adaptador.
- Ablaciones controladas entre configuraciones: dado que el autor mantiene otros repositorios de la misma familia (por ejemplo, el origen `rat-lab/rlj-ec2-fig9-K2-jk`), este adaptador se puede usar como punto de referencia fijo en comparaciones de cobertura K o de tipo de riesgo.
- Estudio de la dinámica de entrenamiento en modelos pequeños: con 2B parámetros y checkpoints frecuentes, es viable entrenar y analizar decenas de réplicas con presupuesto de cómputo moderado, algo inviable en modelos de 70B.
- Prototipado de asistentes conversacionales de bajo coste: el modelo fusionado (base + adaptador) ocupa unos pocos gigabytes y puede ejecutarse en una GPU de consumo, lo que permite validar flujos conversacionales antes de escalar a modelos mayores. Requiere verificar antes la licencia aplicable.
- Generación de respuestas con restricción de longitud corta: la configuración de entrenamiento usa 64 tokens nuevos por generación, adecuada para tareas de respuesta breve o clasificación generativa.
- Punto de partida para *fine-tuning* posterior: al ser un adaptador LoRA independiente, puede combinarse o sustituirse sin tocar los pesos base, facilitando experimentos de apilado de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni de seguridad (por ejemplo, *harmlessness rate* sobre PKU-SafeRLHF), y la búsqueda web realizada no ha devuelto documentación técnica asociada al modelo (los resultados obtenidos tratan sobre la especie animal *Rattus*, sin relación con el repositorio).

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA en sí ocupa del orden de decenas de megabytes por checkpoint (el repositorio completo son 1,9 GB para 19 checkpoints más tokenizador). El consumo real lo determina el modelo base fusionado: aproximadamente 5,2 GB en fp16 para 2,6B parámetros, más la caché KV.
- En cuantización de 4 bits, el modelo fusionado se sitúa en torno a 1,7-2,2 GB de pesos, con margen para contexto en GPUs de 8 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para inferencia cuantizada (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090). Para entrenamiento o inferencia en fp16 con lotes grandes, se recomienda A100 40/80 GB o H100, aunque por tamaño el modelo no los requiere.
- Cabe en GPU de consumo: sí, en 4 bits en GPUs de 8 GB y en fp16 en GPUs de 12 GB o más.
- Opciones de despliegue: PEFT + Transformers (carga del adaptador con `PeftModel.from_pretrained`, tal como documenta la model card), fusión del adaptador en los pesos base y posterior despliegue con vLLM o TGI; llama.cpp y Ollama son viables tras convertir el modelo fusionado a GGUF. No se documenta compatibilidad verificada con ninguna de estas opciones.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

Los datos de rendimiento no están disponibles para el modelo evaluado, por lo que la comparación se limita a parámetros, contexto y licencia según la documentación pública de cada modelo base.

| Modelo | Parámetros | Contexto | Tipo | Licencia | Rendimiento |
|---|---|---|---|---|---|
| rat-lab/mh-ec2-ttomd-K2-jk (sobre Gemma 2 2B) | 2,6 mil millones (base) | 8.192 (base) | Adaptador LoRA de investigación | No disponible | No disponible |
| google/gemma-2-2b-it | 2,6 mil millones | 8.192 | Modelo instruction-tuned | Gemma Terms of Use | No comparable directamente |
| meta-llama/Llama-3.2-3B-Instruct | 3,2 mil millones | 128.000 | Modelo instruction-tuned | Llama 3.2 Community License | No disponible |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5 mil millones | 32.768 | Modelo instruction-tuned | Apache 2.0 (la mayoría de tamaños) | No disponible |

El modelo evaluado no es directamente comparable con los anteriores: es un adaptador de investigación orientado a alineación con preferencias, no un modelo generalista optimizado para *benchmarks* de conocimiento o código.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El ajuste se realiza sobre PKU-SafeRLHF, un corpus con sesgos propios de su proceso de anotación, que se trasladan al adaptador.
- Riesgo de alucinación: no evaluado en el repositorio. Un modelo base de 2B parámetros presenta tasas de alucinación más altas que modelos mayores.
- Limitaciones de contexto e idioma: el repositorio no declara idiomas soportados ni variaciones de contexto. La ventana del modelo base es de 8.192 tokens, inferior a la de alternativas contemporáneas.
- Restricciones de licencia: no hay licencia declarada en el repositorio, lo que impide asumir permiso de uso comercial. Además, el modelo base Gemma está sujeto a los Gemma Terms of Use, que imponen obligaciones adicionales de distribución.
- Trazabilidad: según la propia model card, el adaptador no fue entrenado por el autor que lo publica, sino extraído sin cambios de `rat-lab/rlj-ec2-fig9-K2-jk`. La verificación de integridad se limita a los checkpoints 250, 2500 y 4680 mediante sha256.
- Ausencia de estado de entrenamiento: no se incluye el estado de reanudación de DeepSpeed, por lo que no es posible continuar el entrenamiento exactamente desde el punto en que se detuvo.
- Metadatos inconsistentes: la fecha de creación indicada (2026-09-23) es posterior a la fecha de consulta habitual y debe tratarse con cautela.
- Nulo historial de uso: 0 descargas y 0 «likes» implican ausencia de validación por parte de terceros; no hay evidencia de comportamiento en producción.
- Configuración de generación muy corta: el entrenamiento se realizó con 64 tokens nuevos por generación, por lo que el comportamiento con salidas largas no está caracterizado.
- Artefacto de investigación: no debe desplegarse en entornos de producción sin una evaluación propia de seguridad, sesgo, robustez y cumplimiento legal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rat-lab/mh-ec2-ttomd-K2-jk
- Modelo base: https://huggingface.co/vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT
- Repositorio de origen citado en la model card: `rat-lab/rlj-ec2-fig9-K2-jk` (referencia textual; no se ha verificado su URL)
- Dataset de entrenamiento: https://huggingface.co/datasets/PKU-Alignment/PKU-SafeRLHF
- Gemma 2 (documentación del modelo base): https://huggingface.co/google/gemma-2-2b-it
- PEFT (librería de adaptadores): https://huggingface.co/docs/peft
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este repositorio; los enlaces obtenidos correspondían a páginas divulgativas sobre la especie animal *Rattus* y a una oferta comercial de un operador de televisión, sin relación con el modelo. No se dispone de *paper*, blog técnico ni demo asociados.
