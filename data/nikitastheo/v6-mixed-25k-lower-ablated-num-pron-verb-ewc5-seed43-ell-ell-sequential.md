# nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb-ewc5-seed43-ell-ell-sequential

## Resumen

El modelo `v6-mixed-25k-lower-ablated-num-pron-verb-ewc5-seed43-ell-ell-sequential` es un modelo de lenguaje causal de pequeno tamano (104,7 millones de parametros) desarrollado por el usuario de Hugging Face `nikitastheo`. Se trata de un experimento de investigacion centrado en el entrenamiento de modelos de lenguaje en condiciones controladas, probablemente en el marco del proyecto BabyLM, dado que el tokenizer asociado pertenece a la familia `babylm-25k-ell-lower-seed43`. El nombre del modelo sugiere un entrenamiento secuencial con cambio de idioma (griego, `ell`, y posteriormente otro idioma) y una ablacion de categorias gramaticales (numerales, pronombres y verbos).

La relevancia de este modelo no reside en su rendimiento como asistente general, sino en su valor como artefacto de investigacion para estudiar como un transformer pequeno adquiere capacidades linguisticas bajo restricciones de datos y cambios de distribucion. El sufijo `ewc5` apunta a Elastic Weight Consolidation (EWC) con un coeficiente de 5, una tecnica de aprendizaje continuo para mitigar el olvido catastrofico durante el cambio de idioma en la epoca 10.

No se dispone de informacion publica sobre la licencia, los idiomas soportados ni los resultados de evaluacion. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un modelo reciente y de nicho, no destinado a uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (configuracion `gpt_base_config.json`, familia GPT-2) |
| Parametros totales | 104.716.800 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar via transformers) |
| Idiomas soportados | no disponible (el nombre sugiere griego `ell` y otro idioma en secuencia) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal de tipo GPT-2, definida por el fichero `configurations/gpt_base_config.json` referenciado en la model card. Con 104,7 millones de parametros, encaja en la escala de los modelos pequenos tipo GPT-2 base (124M) o ligeramente inferior. No se especifican el numero de capas, dimensiones ocultas ni cabezas de atencion, aunque la configuracion base de GPT-2 es el punto de partida declarado.

El entrenamiento se realizo con `train_clm.py`, un script basado en Hugging Face Accelerate (sin `Trainer`), durante 17.280 pasos con un learning rate de 1e-4, scheduler lineal y 1.728 pasos de warmup. El batch size efectivo fue de 32 (32 por dispositivo, sin acumulacion de gradientes). El tokenizer es `nikitastheo/babylm-25k-ell-lower-seed43-ablated-num-pron-verb-tokenizer`, lo que vincula el experimento al corpus BabyLM (entorno linguistico reducido, tipo desarrollo infantil). La "language switch epoch: 10" indica un entrenamiento secuencial en dos fases: primero un idioma y luego otro, con EWC (coeficiente 5) para preservar el conocimiento del primero. La ablacion de numerales, pronombres y verbos sugiere un estudio sobre el impacto de eliminar ciertas clases de palabras del corpus de entrenamiento.

## Capacidades

- Generacion de texto causal autoregresiva basica, limitada por el tamano del modelo (104,7M) y el corpus de entrenamiento reducido.
- Modelado del lenguaje en el dominio del corpus BabyLM, probablemente con vocabulario restringido y en minusculas (`lower`).
- Capacidad potencial de generacion en griego (`ell`) y en un segundo idioma no identificado, segun el esquema secuencial del nombre.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta soporte multilingue mas alla de los idiomas del experimento.
- No se documentan modos especiales (thinking, vision, audio).
- El modelo esta pensado como objeto de estudio linguistico, no como asistente.

## Casos de uso

- Investigacion en adquisicion del lenguaje: analizar que estructuras gramaticales aprende un modelo pequeno entrenado con un corpus tipo BabyLM y como afecta la ablacion de numerales, pronombres y verbos.
- Estudio de olvido catastrofico: comparar el comportamiento del modelo con EWC (coef. 5) frente a variantes sin regularizacion para medir la retencion del primer idioma tras el cambio en la epoca 10.
- Analisis de tokenizacion: evaluar el impacto de un tokenizer de 25k con minusculas sobre la calidad de generacion en corpus reducidos.
- Reproducibilidad de experimentos: servir como checkpoint intermedio (`seed43`) en una bateria de semillas para estudiar varianza entre ejecuciones.
- Evaluacion de tecnicas de aprendizaje continuo: usar el modelo como linea base en comparativas de EWC, replay o destilacion en entornos de bajo recurso.
- Generacion de texto controlada en dominios restringidos: si el corpus de entrenamiento es especifico (por ejemplo, texto infantil o linguistico), el modelo puede emplearse para generar muestras sinteticas de ese dominio con fines de aumento de datos, asumiendo baja fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,42 GB solo para pesos (104,7M x 4 bytes), mas overhead de activaciones y contexto.
- VRAM estimada en fp16/bf16: aproximadamente 0,21 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia por lotes pequenos.
- GPU recomendadas: no se requiere hardware dedicado; una GPU con 4 GB o mas es mas que suficiente.
- Opciones de despliegue: `transformers` (libreria declarada), `text-generation-inference` (tag `text-generation-inference`), y potencialmente `llama.cpp` u `Ollama` si se convierte a GGUF (no documentado).
- Latencia y throughput: no disponibles; por el tamano, se espera un throughput alto en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb-ewc5-seed43-ell-ell-sequential | 104,7M | no disponible | no disponible | Hugging Face (0 descargas) |
| GPT-2 base | 124M | 1024 | MIT | Hugging Face (ampliamente usado) |
| BabyLM baseline (por ejemplo, `babylm/babyllama-100m-...`) | ~100M | variable | variable (MIT/Apache segun variante) | Hugging Face |

La comparativa es orientativa: el modelo de `nikitastheo` es un experimento de investigacion sin metricas publicas, mientras que GPT-2 base y los baselines BabyLM cuentan con evaluaciones estandarizadas. No se dispone de datos de rendimiento comparables para el modelo analizado.

## Limitaciones y advertencias

- Modelo de investigacion sin evaluacion publica: no hay benchmarks, por lo que no puede recomendarse para tareas de produccion.
- Riesgo elevado de alucinacion y generacion incoherente por el tamano reducido y el corpus limitado.
- Posible sesgo derivado del corpus BabyLM (texto infantil o linguistico) y de la ablacion de clases gramaticales.
- Licencia no disponible: no se puede asumir uso comercial permitido; contactar con el autor antes de cualquier uso fuera de investigacion.
- Idiomas soportados no confirmados: el nombre sugiere griego y otro idioma, pero no hay documentacion.
- Longitud de contexto no documentada: no debe asumirse una ventana larga.
- El cambio de idioma en la epoca 10 puede provocar degradacion del primer idioma pese al EWC; no hay mediciones de retencion.
- Repositorio con 0 descargas: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb-ewc5-seed43-ell-ell-sequential
- Tokenizer asociado: https://huggingface.co/nikitastheo/babylm-25k-ell-lower-seed43-ablated-num-pron-verb-tokenizer
- Proyecto BabyLM (referencia del corpus): https://babylm.github.io/
