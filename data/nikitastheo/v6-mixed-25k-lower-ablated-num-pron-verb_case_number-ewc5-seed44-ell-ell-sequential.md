# nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case_number-ewc5-seed44-ell-ell-sequential

## Resumen

El modelo `nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case_number-ewc5-seed44-ell-ell-sequential` es un modelo de lenguaje causal (causal-LM) para generacion de texto, publicado por el usuario nikitastheo en Hugging Face. Se trata de un modelo de arquitectura GPT-2 con aproximadamente 104,7 millones de parametros, derivado de una configuracion base (`configurations/gpt_base_config.json`) y entrenado con un script propio de Accelerate (`train_clm.py`), sin usar la clase `Trainer` de Hugging Face. Por su nomenclatura y su tokenizador, el modelo parece formar parte de una linea de experimentos vinculados a BabyLM (entrenamiento con presupuestos limitados de tokens) centrada en el idioma griego (sufijo `ell`), con variantes de ablacion de categorias gramaticales (numero, pronombre, verbo, caso) y un esquema de entrenamiento secuencial entre idiomas.

El modelo resuelve la tarea generica de generacion de texto autoregresiva y esta pensado, por su tamano y su origen experimental, para investigacion sobre adquisicion del lenguaje y efectos de curricula o ablaciones gramaticales, mas que para despliegue en produccion. Es relevante ahora por su caracter de artefacto de investigacion reproducible: documenta hiperparametros concretos (17.100 pasos, learning rate 1e-4, warmup de 1.710 pasos, batch de 32) y un cambio de idioma en la epoca 10, lo que permite analizar el comportamiento de un modelo pequeno bajo condiciones controladas.

La informacion publica disponible es muy limitada: no hay model card descriptiva mas alla de los detalles de entrenamiento, no se declaran idiomas soportados ni licencia, y el repositorio no registra descargas ni interacciones. Cualquier evaluacion de capacidades debe hacerse, por tanto, de forma empirica por parte de quien lo utilice.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo GPT-2 (configuracion `gpt_base_config.json`) |
| Parametros totales | 104.716.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion posterior via herramientas estandar, no verificada) |
| Idiomas soportados | no disponibles (el sufijo `ell` y el tokenizador `babylm-25k-ell-lower` sugieren griego, no confirmado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only con la configuracion base GPT-2 indicada por el autor, lo que en la practica implica atencion multi-cabeza estandar, embeddings posicionales aprendidos y activacion tipo GELU, con un total de 104,7 millones de parametros. No se documentan innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, mezcla de expertos ni estados recurrentes); se trata de un transformer clasico a escala pequena.

El entrenamiento se realizo con `train_clm.py`, un script de entrenamiento causal-LM basado en Hugging Face Accelerate que evita la clase `Trainer`. Los hiperparametros declarados son: maximo de 17.100 pasos, learning rate de 0,0001 con scheduler lineal, 1.710 pasos de warmup, batch size de 32 por dispositivo sin acumulacion de gradientes (batch total de 32) y un "language switch epoch" en la epoca 10, lo que sugiere un entrenamiento secuencial en el que el idioma o la distribucion de datos cambia a mitad del proceso. El tokenizador asociado es `nikitastheo/babylm-25k-ell-lower-seed44-ablated-num-pron-verb_case_number-tokenizer`, con vocabulario de 25.000 tokens y aparente normalizacion a minusculas. No se especifican el numero total de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF, DPO o ajuste por instrucciones; el nombre del modelo sugiere tecnicas de regularizacion tipo EWC (Elastic Weight Consolidation) y ablaciones de categorias gramaticales, pero no hay documentacion que lo confirme.

## Capacidades

- Generacion de texto autoregresiva: continuacion de prompts y generacion libre de secuencias.
- Modelado de lenguaje causal: entrenado para predecir el siguiente token, adecuado para experimentos de perplejidad y analisis linguistico.
- Capacidad multilingue: no confirmada; el tokenizador sugiere foco en griego (`ell`) y posible mezcla de idiomas por el prefijo `mixed`, sin datos verificables.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evidencia de entrenamiento para instrucciones o agentes.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision o audio: no disponible; es un modelo exclusivamente de texto.
- Capacidades especiales: no se documentan mas alla del entrenamiento secuencial con cambio de idioma en la epoca 10.

## Casos de uso

- Investigacion en adquisicion del lenguaje: el modelo sirve como sujeto de estudio para analizar como un transformer pequeno entrenado con un presupuesto limitado de tokens (linea BabyLM) adquiere estructuras gramaticales, comparando variantes con y sin ablacion de numero, pronombre, verbo o caso.
- Analisis de curricula y entrenamiento secuencial: el "language switch epoch" en la epoca 10 permite estudiar el olvido catastrofico y la transferencia entre idiomas o distribuciones de datos en modelos pequenos, midiendo perplejidad antes y despues del cambio.
- Evaluacion de regularizacion EWC: el sufijo `ewc5` sugiere el uso de Elastic Weight Consolidation; el modelo puede emplearse para reproducir experimentos sobre retencion de conocimiento previo tras el cambio de fase de entrenamiento.
- Generacion de texto controlada en entornos de laboratorio: con 104,7 millones de parametros, se puede ejecutar en CPU o en GPU de gama baja para generar continuaciones y estudiar sesgos o patrones linguisticos sin coste de infraestructura elevado.
- Baseline para comparativas de modelos pequenos: sirve como referencia de un GPT-2 pequeno reentrenado con un tokenizador especifico, util para contrastar con modelos de tamano similar en tareas de perplejidad y generacion.
- Reproduccion de pipelines de entrenamiento: al documentarse el script (`train_clm.py`), los hiperparametros y el tokenizador, el modelo es util para validar implementaciones de entrenamiento con Accelerate y para replicar experimentos con distintas semillas (el nombre incluye `seed44`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 0,42 GB solo para pesos (104,7 millones de parametros x 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 0,21 GB para pesos, con overhead adicional segun longitud de secuencia y batch.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, T4 o superiores no presentan problema. Tambien puede ejecutarse en CPU para inferencia por lotes pequenos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; tambien es viable convertirlo a GGUF para llama.cpp u Ollama, aunque no se documenta una conversion oficial.
- Latencia y throughput: no disponibles; por el tamano, se espera un throughput alto en GPU moderna y latencia de decenas de milisegundos por token en CPU, sin datos medidos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case_number-ewc5-seed44-ell-ell-sequential | 104,7 M | no disponible | no disponible | Hugging Face (0 descargas) |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | MIT | Hugging Face, ampliamente disponible |
| GPT-2 base reentrenado tipo BabyLM | ~100 M (segun variante) | variable (a menudo 512-1.024) | variable segun autor | Hugging Face, comunidades de investigacion |
| DistilGPT-2 | 82 M | 1.024 tokens | Apache 2.0 | Hugging Face |

La comparacion con GPT-2 small y DistilGPT-2 es la mas directa por escala; sin embargo, no hay datos de rendimiento del modelo evaluado que permitan establecer diferencias cuantitativas. Los modelos BabyLM comparables dependen de la convocatoria y variante concreta, y no se dispone de sus cifras en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un corpus no descrito, puede reproducir sesgos linguisticos y culturales del dataset, especialmente en griego o en la mezcla de idiomas sugerida por el nombre.
- Riesgo de alucinacion: alto en generacion libre, como en cualquier modelo causal de este tamano sin ajuste por instrucciones; no debe usarse como fuente de hechos.
- Limitaciones de contexto e idioma: la longitud de contexto no esta declarada y los idiomas soportados no estan confirmados; el uso fuera del dominio de entrenamiento (probablemente griego y datos BabyLM) producira resultados pobres.
- Restricciones de licencia: la licencia no esta disponible, lo que impide asumir permisos de uso comercial; es necesario contactar con el autor antes de cualquier uso en produccion.
- Caveats para produccion: el modelo no ha sido ajustado para seguir instrucciones, no soporta tool calling ni agentes, y su naturaleza experimental (ablaciones gramaticales, entrenamiento secuencial, posible regularizacion EWC) lo hace inadecuado para aplicaciones de usuario final.
- Falta de documentacion: no hay model card descriptiva, ni datos de evaluacion, ni informacion sobre el dataset, lo que dificulta la auditoria y la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case_number-ewc5-seed44-ell-ell-sequential
- Tokenizador asociado: https://huggingface.co/nikitastheo/babylm-25k-ell-lower-seed44-ablated-num-pron-verb_case_number-tokenizer
- Perfil del autor: https://huggingface.co/nikitastheo
- Proyecto BabyLM (referencia contextual de la linea de entrenamiento): https://babylm.github.io/
