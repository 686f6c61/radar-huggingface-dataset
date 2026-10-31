# JaydenTeoh/ntp-167m-model

## Resumen

NTP-167m es un modelo de lenguaje causal de 167 millones de parametros desarrollado por Jayden Teoh, entrenado exclusivamente con el objetivo clasico de prediccion del siguiente token (next-token prediction, NTP) mediante entropia cruzada. No es un modelo orientado a maximizar rendimiento en tareas de usuario, sino un checkpoint de control cientifico: forma parte de la serie de doce checkpoints publicados junto al articulo "Multi-Token Prediction Done Right" (arXiv:2610.38331), donde tres objetivos de entrenamiento distintos se comparan en cuatro tamanos de modelo bajo una receta de entrenamiento identica.

Su relevancia radica en la investigacion sobre multi-token prediction (MTP) y decodificacion especulativa: al compartir semilla, orden de datos y planificador con los demas checkpoints de la serie, cualquier diferencia de rendimiento entre ellos es atribuible al objetivo de entrenamiento y no al azar. Esto lo convierte en una referencia util para desarrolladores e investigadores que quieran reproducir o extender experimentos sobre MTP, soft-MTP y aceleracion de inferencia.

Arquitectonicamente es un transformer decoder con hidden size 512, 36 capas, 8 cabezas de atencion y una longitud de contexto de 2048 tokens, entrenado sobre 31,5 mil millones de tokens de FineWeb-Edu con el tokenizador GPT-2. Se distribuye bajo licencia MIT con pesos en safetensors y codigo personalizado para la libreria `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (model_type: hf_mtp, codigo personalizado) |
| Parametros totales | 167.154.176 (~167M) |
| Parametros activos | no disponible (no es MoE; en despliegue NTP se usan los 167M) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos en fp32/bf16 originales) |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (0,7 GB de tamano de repositorio) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder convencional de 36 capas con hidden size 512 y 8 cabezas de atencion. A diferencia de los demas checkpoints de la serie, no incorpora cabezas de multi-token prediction (`n_mtp: 0`): el objetivo de entrenamiento es unicamente entropia cruzada estandar sobre el siguiente token. El vocabulario del tokenizador GPT-2 (50.257 entradas) se rellena hasta 50.304 filas por alineacion, aunque las filas adicionales no se utilizan.

El entrenamiento se realizo sobre FineWeb-Edu (un corpus web filtrado por calidad educativa) tokenizado con GPT-2 BPE, con un total de 31,5 mil millones de tokens (60.000 pasos, batch de 256 secuencias de 2048 tokens). Como optimizador se uso Muon sobre las matrices ocultas 2D combinado con AdamW para embeddings, cabeza de salida y normalizaciones, con LR pico de 0,002, decaimiento coseno hasta 1e-05, 2.000 pasos de calentamiento, weight decay de 0,1 y precision bf16 autocast sobre pesos maestros en fp32. Se ejecuto una unica pasada por celda de la matriz experimental (semilla 13), compartiendo semilla, orden de datos y planificador entre los doce checkpoints para garantizar comparabilidad directa.

## Capacidades

- Generacion de texto basica en ingles mediante predaccion del siguiente token, sin cabezas MTP ni decodificacion especulativa.
- Modelo de investigacion: sirve como linea base (baseline) para comparar objetivos de entrenamiento MTP y soft-MTP en condiciones identicas.
- Compatibilidad con la libreria `transformers` de Hugging Face mediante `trust_remote_code=True` (la arquitectura `hf_mtp` se define en los ficheros del propio repositorio).
- Uso del tokenizador GPT-2 estandar, sin ficheros de tokenizador propios.
- No incluye capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido.
- Sin ajuste por instrucciones (RLHF/DPO no disponible en la informacion proporcionada): es un modelo base preentrenado, no un chatbot.

## Casos de uso

- Investigacion en multi-token prediction: como baseline NTP, permite medir el beneficio real de las cabezas MTP y de soft-MTP al compararlo con los checkpoints equivalentes de la misma serie bajo receta identica.
- Estudios de decodificacion especulativa: al ser el modelo sin MTP, sirve de referencia para evaluar cuanto acelera la decodificacion especulativa basada en MTP frente a la generacion estandar.
- Reproduccion de experimentos academicos: con la configuracion `configs/167m_fineweb.yaml` del repositorio Soft-MTP se puede reproducir el entrenamiento exacto o modificar variables controladas.
- Analisis de escalado de objetivos de entrenamiento: combinado con los checkpoints de otros tamanos de la serie, permite estudiar como el efecto de MTP varia con la escala del modelo.
- Benchmarking de optimizadores: la receta publica (Muon + AdamW, 31,5B tokens de FineWeb-Edu) es util como punto de comparacion para probar optimizadores alternativos en modelos de ~167M.
- Educacion y prototipado: por su tamano reducido (0,7 GB), es adecuado para experimentos didacticos sobre preentrenamiento de LLM en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de perplexidad, MMLU, HumanEval ni de ninguna otra prueba; el valor del modelo es su papel de baseline controlado dentro del articulo de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en precision original (fp32/bf16), por lo que cabe con holgura en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: no se requieren GPU de gama alta; una RTX 3060, RTX 4090 o cualquier GPU con 4 GB de VRAM es mas que suficiente. Para reproducir el entrenamiento (31,5B tokens) si serian necesarias varias GPU, aunque no se especifica la configuracion exacta.
- Consumer GPUs: totalmente viable en GPUs de consumo; el modelo es pequeño para estandares actuales.
- Opciones de despliegue: `transformers` de Hugging Face con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`. No hay soporte confirmado para vLLM, llama.cpp, Ollama ni TGI (la model card indica `inference: false` en el inference API de Hugging Face).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JaydenTeoh/ntp-167m-model | 167M | 2048 | NTP puro (baseline) | MIT | safetensors, codigo personalizado |
| Checkpoints MTP/soft-MTP de la misma serie (167M) | 167M | 2048 | Multi-token prediction / soft-MTP | MIT | safetensors, codigo personalizado |
| GPT-2 (124M-355M) | 124M-355M | 1024 | NTP | MIT (OpenAI) | amplio soporte en transformers |

La comparacion mas relevante es interna a la serie: los checkpoints MTP y soft-MTP de 167M del mismo articulo comparten datos, semilla y planificador, de modo que las diferencias de rendimiento frente a este baseline NTP son atribuibles al objetivo de entrenamiento. Frente a GPT-2, este modelo usa un contexto mayor (2048 frente a 1024), un corpus mas moderno (FineWeb-Edu) y un optimizador hibrido Muon/AdamW.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones de chat y puede generar texto incoherente u ofensivo propio de un corpus web sin filtrado posterior.
- Riesgo de alucinacion alto al tratarse de un modelo pequeno (167M) entrenado solo con NTP y sin alineacion.
- Entrenado unicamente en ingles: no adecuado para castellano ni otros idiomas.
- Contexto limitado a 2048 tokens, insuficiente para tareas de documento largo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene revisarlo antes de usarlo en entornos de produccion.
- Sin soporte confirmado en runtimes de inferencia optimizados (vLLM, llama.cpp, Ollama); el despliegue en produccion requeriria adaptacion.
- Resultados de una unica semilla por configuracion: las conclusiones del articulo dependen del diseno experimental controlado, no de medias sobre multiples ejecuciones.
- Licencia MIT sin restricciones de uso comercial, pero al ser un checkpoint de investigacion no esta pensado para aplicaciones de usuario final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JaydenTeoh/ntp-167m-model
- Articulo "Multi-Token Prediction Done Right" (arXiv:2610.38331): https://arxiv.org/abs/2610.38331
- Repositorio de codigo Soft-MTP: https://github.com/JaydenTeoh/Soft-MTP
- Dataset de entrenamiento (FineWeb-Edu): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
