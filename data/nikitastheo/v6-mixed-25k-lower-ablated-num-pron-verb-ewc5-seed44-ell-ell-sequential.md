# nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb-ewc5-seed44-ell-ell-sequential

## Resumen

El modelo `nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb-ewc5-seed44-ell-ell-sequential` es un modelo de lenguaje causal de pequeno tamano (104,7 millones de parametros) publicado en Hugging Face por el usuario `nikitastheo`. Por el nombre, la configuracion base (`gpt_base_config.json`) y el tokenizador asociado (`babylm-25k-ell-lower-seed44-ablated-num-pron-verb-tokenizer`), se trata de un experimento de investigacion enmarcado en el entorno BabyLM: entrenamiento de modelos tipo GPT con un presupuesto de tokens muy limitado, orientado a estudiar el aprendizaje linguistico en condiciones de datos reducidas.

El identificador del modelo sugiere varias decisiones experimentales concretas: un vocabulario de 25.000 tokens en minusculas ("lower"), la ablacion de categorias gramaticales (numeros, pronombres y verbos, "ablated-num-pron-verb"), regularizacion EWC (Elastic Weight Consolidation) con coeficiente 5, semilla 44 y un regimen de entrenamiento secuencial multilingue con griego ("ell") en dos fases ("ell-ell-sequential"). El autor indica que el entrenamiento se realizo con `train_clm.py`, un script propio basado en Hugging Face Accelerate sin usar la clase `Trainer`.

La relevancia de este modelo es acotada y de caracter fundamentalmente academico: no es un modelo de proposito general ni esta pensado para produccion, sino una pieza dentro de una serie de experimentos sobre curriculum, olvido catastrofico y ablacion linguistica. No dispone de descargas ni likes, no declara licencia ni idiomas, y su model card es minima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo GPT-2 (config `gpt_base_config.json`) |
| Parametros totales | 104.716.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada) |
| Idiomas soportados | no disponibles (el identificador sugiere griego "ell" junto a otro idioma) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only de tipo GPT-2, segun la configuracion base referenciada (`configurations/gpt_base_config.json`). Con 104.716.800 parametros, encaja en el rango de los modelos GPT-2 small/medium. No se documentan innovaciones arquitectonicas como atencion lineal, decodificacion especulativa ni mezclas de expertos.

El entrenamiento se realizo con `train_clm.py`, un script de entrenamiento de LM causal basado en Hugging Face Accelerate que evita la clase `Trainer`. Los hiperparametros declarados son: 17.300 pasos maximos, learning rate de 0,0001, scheduler lineal, 1.730 pasos de warmup, batch size por dispositivo de 32, sin acumulacion de gradientes y batch total de 32. Se especifica un "language switch epoch" en la epoca 10, lo que indica un entrenamiento secuencial por idioma: el modelo cambia de idioma en ese punto del entrenamiento. El nombre incluye "ewc5", que sugiere el uso de Elastic Weight Consolidation con coeficiente 5 para mitigar el olvido catastrofico al cambiar de idioma, y "ablated-num-pron-verb", que apunta a una ablacion de tokens correspondientes a numeros, pronombres y verbos en el corpus o el tokenizador. No se especifica el numero total de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de texto causal autoregresiva en el estilo de un GPT-2 pequeno.
- Entrenamiento orientado a modelado del lenguaje con presupuesto reducido (entorno BabyLM), no a instrucciones.
- Posible comportamiento multilingue limitado al par de idiomas del experimento (el identificador sugiere griego "ell" y otro idioma no declarado).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- No se documenta capacidad de codigo ni matematicas de forma especifica.

## Casos de uso

- Investigacion sobre adquisicion del lenguaje con datos limitados: el modelo sirve como punto de comparacion en experimentos BabyLM para medir el efecto de un vocabulario de 25.000 tokens en minusculas sobre la perplejidad y la competencia gramatical.
- Estudio de olvido catastrofico en entrenamiento secuencial multilingue: al usar un "language switch epoch" en la epoca 10 y EWC con coeficiente 5, permite analizar la retencion del primer idioma tras el cambio al segundo.
- Analisis de ablacion linguistica: la eliminacion de numeros, pronombres y verbos del vocabulario o del corpus permite estudiar que estructuras gramaticales son prescindibles para el modelado del lenguaje a esta escala.
- Reproducibilidad de experimentos: con hiperparametros y semilla documentados (seed 44), es util para replicar resultados en entornos academicos con recursos limitados.
- Generacion de texto controlada en entornos de bajo coste: al ser un modelo de 104 millones de parametros, puede ejecutarse en CPU o en GPU de consumo para tareas de generacion no criticas.
- Base para fine-tuning en tareas linguisticas especificas: su tamano reducido permite ajustarlo rapidamente en una unica GPU para tareas de clasificacion o generacion acotada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,42 GB solo para pesos (104,7 M de parametros), mas overhead de activaciones y cache KV.
- VRAM estimada en FP16/BF16: aproximadamente 0,21 GB para pesos; en cuantizacion de 8 bits, unos 0,1 GB; en 4 bits, unos 0,05 GB. Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4090); tambien es viable en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas e incluso en Raspberry Pi con llama.cpp en cuantizacion agresiva.
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp y Ollama tras conversion a GGUF.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 104 M de parametros, el throughput en una RTX 4090 seria del orden de miles de tokens por segundo, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb-ewc5-seed44-ell-ell-sequential | 104,7 M | no disponible | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | MIT | Hugging Face |
| BabyLM baseline (varios autores) | 10-100 M | variable | variable | Hugging Face |
| DistilGPT-2 | 82 M | 1.024 tokens | Apache 2.0 | Hugging Face |

La comparativa con GPT-2 small y DistilGPT-2 es la mas directa por escala, aunque este modelo no declara contexto ni licencia. Frente a los baselines BabyLM, comparte el regimen de datos reducidos pero anade el componente de entrenamiento secuencial multilingue y ablacion, que no esta presente en los modelos de proposito general.

## Limitaciones y advertencias

- Modelo de investigacion sin model card detallada: no se declaran licencia, idiomas, contexto ni datos de entrenamiento, lo que impide evaluar su idoneidad para uso comercial.
- Riesgo elevado de alucinacion y de generar texto incoherente fuera de los dominios del corpus de entrenamiento, dado su tamano y su regimen de datos limitado.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no es posible evaluar sesgos de genero, raza o idioma.
- Limitaciones de idioma: el identificador sugiere un regimen multilingue con griego, pero no se especifica el par completo de idiomas ni el nivel de competencia alcanzado.
- La ablacion de numeros, pronombres y verbos puede degradar tareas que dependan de esas categorias gramaticales.
- El entrenamiento secuencial con cambio de idioma en la epoca 10 implica riesgo de olvido catastrofico del primer idioma, mitigado solo parcialmente por EWC.
- No apto para produccion: sin benchmarks, sin licencia clara y con cero descargas, no hay evidencia de calidad fuera del entorno experimental del autor.
- La fecha de creacion indicada (2026-11-26) es futura respecto a la fecha actual, lo que sugiere un posible error en los metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb-ewc5-seed44-ell-ell-sequential
- Tokenizador asociado: https://huggingface.co/nikitastheo/babylm-25k-ell-lower-seed44-ablated-num-pron-verb-tokenizer
- Proyecto BabyLM: https://babylm.github.io/
- Documentacion de Hugging Face Accelerate: https://huggingface.co/docs/accelerate/index
- Resultado de busqueda web proporcionado (no relacionado con el modelo): https://de.amazonforum.com/s/question/0D56Q0000E1J49vSQC/kindle-verbindet-nicht-mehr-zu-amazon-konto
