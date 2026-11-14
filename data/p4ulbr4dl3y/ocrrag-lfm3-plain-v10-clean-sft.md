# p4ulbr4dl3y/ocrrag-lfm3-plain-v10-clean-sft

## Resumen

`ocrrag-lfm3-plain-v10-clean-sft` es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario p4ulbr4dl3y sobre el modelo base LiquidAI/LFM3-1.7B. Se trata, por tanto, de un fine-tuning ligero que no redistribuye los pesos completos del modelo original, sino únicamente las matrices de bajo rango entrenadas con la librería PEFT (version 0.21.2) y el framework TRL (version 1.17.1). El repositorio ocupa 0,8 GB, lo que es coherente con un adaptador LoRA y no con un modelo de 1.700 millones de parametros en precision completa.

El nombre del repositorio sugiere un entrenamiento orientado a tareas de OCR y RAG (recuperacion aumentada sobre documentos escaneados), aunque la model card no documenta el dataset, el proceso de curacion de datos ni los objetivos concretos del ajuste. La informacion publicada es minima: no hay detalles sobre el corpus de entrenamiento, hiperparametros, resultados de evaluacion ni limitaciones declaradas por el autor.

Su relevancia practica es limitada pero concreta: sirve como ejemplo de adaptacion de un modelo pequeno (1.700 millones de parametros) de la familia LFM3 de Liquid AI para un dominio especifico, y puede ser util para quienes quieran reproducir o extender el pipeline con TRL y PEFT sobre ese modelo base. No obstante, la ausencia de licencia explicita, de idiomas declarados y de benchmarks hace que no sea recomendable para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre LiquidAI/LFM3-1.7B; arquitectura del modelo base no detallada en la informacion disponible |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 1.700 millones de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card incluye el campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado mediante SFT con TRL 1.17.1 sobre el modelo base LiquidAI/LFM3-1.7B. La model card no especifica el rango del adaptador, el alpha, los modulos objetivo ni el numero de pasos de entrenamiento. Las versiones de las librerias empleadas son PEFT 0.21.2, Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

No se documenta el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de etapas de RLHF o DPO, ni ninguna innovacion tecnica adicional. El sufijo `plain-v10-clean-sft` del nombre sugiere una decima iteracion de un pipeline de curacion de datos ("clean") y un ajuste supervisado "plain", pero se trata de una inferencia a partir del nombre y no de un dato confirmado por el autor. Tampoco se indica si el adaptador se fusiono con los pesos base o si se distribuye solo como delta LoRA; el tamano del repositorio (0,8 GB) apunta a lo segundo.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base LFM3-1.7B y del pipeline `text-generation` declarado.
- Ajuste orientado, segun el nombre del repositorio, a tareas de OCR y RAG sobre documentos, aunque no hay documentacion que lo confirme.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Prototipado de pipelines OCR + RAG: el adaptador puede cargarse sobre LFM3-1.7B para experimentar con la generacion de respuestas a partir de texto extraido de documentos escaneados, aprovechando que el modelo base es pequeno y desplegable en hardware modesto.
- Investigacion sobre fine-tuning eficiente: sirve como referencia reproducible de un flujo SFT con TRL y PEFT sobre un modelo de 1.700 millones de parametros, util para comparar hiperparametros y estrategias de curacion de datos.
- Extraccion de campos en documentos: si el ajuste ha sido efectivamente sobre datos de OCR, podria emplearse para tareas de normalizacion o estructuración de texto extraido, siempre con validacion previa sobre el dominio concreto.
- Generacion de respuestas sobre corpus documental: combinado con un recuperador vectorial, el modelo podria formatear respuestas citando fragmentos recuperados, aunque la calidad real depende del entrenamiento no documentado.
- Base para nuevos adaptadores: al ser un delta LoRA, puede servir como punto de partida para ajustes adicionales o para fusion con otros adaptadores sobre el mismo modelo base.
- Evaluacion comparativa de adaptadores: util en entornos de investigacion para medir el impacto de un SFT especifico frente al modelo base sin ajustar en tareas de lectura de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato oficial; para el modelo base de 1.700 millones de parametros, una estimacion orientativa seria de unos 3,5 GB en FP16 y de 1 a 2 GB en cuantizaciones de 4 bits, aunque estas cifras no las proporciona el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: probable para el modelo base en cuantizacion de 4 u 8 bits, pero no confirmado por el autor.
- Opciones de despliegue: el adaptador es compatible con el ecosistema Transformers y PEFT; el despliegue mediante vLLM, llama.cpp, Ollama o TGI requeriria fusionar el adaptador con los pesos base o usar soporte de adaptadores LoRA en el servidor de inferencia, extremo no documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ocrrag-lfm3-plain-v10-clean-sft | Adaptador LoRA sobre 1.7B | No disponible | No disponible | safetensors (PEFT) | Sin benchmarks ni dataset documentado |
| LiquidAI/LFM3-1.7B (modelo base) | 1.700 millones | No disponible en esta ficha | No disponible en esta ficha | safetensors | Modelo original sin ajuste; referencia directa |
| Otros adaptadores SFT sobre LFM3 | No disponible | No disponible | No disponible | safetensors | No se dispone de alternativas comparables documentadas |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- Ausencia de licencia explicita: la model card incluye un campo `licence` vacio, por lo que no se puede confirmar si el uso comercial esta permitido. Conviene contactar con el autor o asumir la licencia del modelo base.
- Sin documentacion del dataset de entrenamiento: no es posible evaluar sesgos, cobertura idiomatica ni riesgo de sobreajuste al dominio.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; sin evaluacion publicada no puede acotarse.
- Idiomas no declarados: no se puede garantizar un rendimiento correcto en castellano ni en otros idiomas distintos del que se haya usado en el entrenamiento.
- Sin benchmarks: no hay evidencia publica de mejora frente al modelo base en tareas de OCR o RAG.
- Repositorio con cero descargas y cero likes: no hay senales de uso comunitario ni validacion externa.
- Fecha de creacion futura en los metadatos (2026): conviene verificar la integridad del repositorio antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/p4ulbr4dl3y/ocrrag-lfm3-plain-v10-clean-sft
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
- PEFT (libreria de adaptadores): https://github.com/huggingface/peft
