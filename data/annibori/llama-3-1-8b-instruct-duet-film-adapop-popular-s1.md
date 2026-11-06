# AnniBori/Llama-3.1-8B-Instruct-DUET-film-AdaPop-popular-s1

## Resumen

Llama-3.1-8B-Instruct-DUET-film-AdaPop-popular-s1 es un checkpoint derivado de Llama-3.1-8B-Instruct obtenido mediante un proceso de *unlearning* (desaprendizaje) selectivo. El modelo parte de `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft`, un ajuste fino del Llama-3.1-8B-Instruct original sobre el conjunto DUET de tematica cinematografica, y le aplica el algoritmo AdaPop para eliminar el conocimiento de un conjunto de hechos sobre peliculas populares (411 pares pelicula-director) manteniendo intacto el resto del conocimiento retenido (546 hechos).

El interes del modelo es metodologico: sirve como artefacto reproducible para investigar tecnicas de *machine unlearning* en LLMs, en concreto la familia de metodos basados en gradiente ponderado (WGA) con ajuste dinamico de pesos por popularidad de la entidad. El checkpoint seleccionado (epoca 7) reduce el recall de generacion libre sobre el conjunto olvidado a 0,006 mientras mantiene un recall de 0,976 sobre el conjunto retenido, un resultado que ilustra el equilibrio entre supresion efectiva y preservacion de utilidad.

Arquitectura transformer decoder-only de 8.030 millones de parametros, contexto nativo de 128.000 tokens heredado de Llama 3.1, pesos en safetensors y licencia Llama 3.1. El modelo esta pensado para investigacion, no para despliegue comercial generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1; no verificado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible (heredados de Llama 3.1, no declarados en la model card) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un Llama-3.1-8B-Instruct denso, con la arquitectura estandar de la familia (RoPE, GQA, SwiGLU, RMSNorm), ajustado primero sobre el conjunto DUET film y posteriormente sometido a unlearning con AdaPop. AdaPop implementa una perdida de olvido de tipo WGA (weighted gradient ascent) con un coeficiente beta por hecho calculado como `clip(58.7 · p^-0.796, 0.05, 2)` a partir de la popularidad `p` del sujeto (aqui, la popularidad de la pelicula medida con sitelinks, identificadores y statements de Wikidata). A esta perdida se suma un termino de NLL sobre el conjunto retenido cuyo peso `alpha` se incrementa por ascenso dual (`alpha0` 0.5, `eps` 0.1, `dual_lr` 0.1, `lambda_max` 5, EMA de retencion 0.9, `gamma` 1), de modo que la presion de olvido crece solo mientras la retencion se mantiene por encima del suelo establecido.

El entrenamiento uso learning rate 1e-5, 8 epocas, batch efectivo de 16 (4 x acumulacion 4), warmup de una epoca, weight decay 0.01, `paged_adamw_8bit` y bf16, con semilla 1 y 26 pasos por epoca. Se guardaron checkpoints por epoca y se selecciono la epoca 7 mediante un criterio doble: recall de generacion libre (ROUGE-L, greedy, 64 tokens nuevos) sobre el conjunto olvidado <= 0.15 y recall retenido >= recall base − 0.30 (suelo absoluto 0.542, base 0.842). Entre las epocas que cumplian, se eligio la de mayor diferencia retencion − olvido.

## Capacidades

- Generacion de texto conversacional con plantilla de chat Llama 3.1 (turno de sistema, usuario y asistente).
- Respuesta a preguntas factuales en formato conciso, guiada por el system prompt de entrenamiento: `You are terse and fact-only QA assistant...`.
- Razonamiento y codigo basicos heredados del modelo base Llama-3.1-8B-Instruct (no evaluados especificamente en esta ficha).
- Supresion dirigida de un subconjunto de hechos sobre peliculas populares (411 pares pelicula-director) con retencion alta del resto (546 hechos).
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling ni comportamiento agentico preservado tras el unlearning; debe verificarse empiricamente antes de usarlo en esos escenarios.
- Capacidades multilingues: no disponibles como dato declarado; dependen del modelo base.
- No dispone de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en machine unlearning: reproducir el pipeline AdaPop sobre Llama-3.1-8B y comparar curvas de olvido/retencion epoca a epoca con los valores publicados (epoca 1: 0.961/0.908 hasta epoca 7: 0.006/0.976).
- Evaluacion de robustez del olvido: usar el probe de relearning con LoRA de rango 4 (semilla 42, pasos 1-256) para medir si el conocimiento suprimido puede recuperarse con pocos pasos de ajuste.
- Analisis de subespacios de representacion: emplear la ablacion de subespacio EI (`stage9_gate_anatomy.py`) y su nulo emparejado para estudiar donde reside el conocimiento eliminado en el espacio de activaciones.
- Estudios de calibracion de pesos por popularidad: comparar el efecto del input `pop_subject` frente a otras definiciones de popularidad en la supresion de hechos.
- Base para *red-teaming* de privacidad y derechos: analizar como se comporta un modelo tras eliminar informacion factual concreta y que fugas residuales persisten en generacion parafraseada o bajo ataques.
- Evaluacion de QA factual terse: el system prompt de entrenamiento lo hace adecuado para tareas de respuesta corta y verificable, util como baseline en experimentos de factualidad controlada.
- Referencia negativa en pipelines de compliance: servir como ejemplo de artefacto con conocimiento deliberadamente limitado para probar sistemas de deteccion de contenido no deseado.

## Benchmarks y rendimiento

Resultados de retencion y olvido publicados en la model card (recall de generacion libre, greedy, 64 tokens nuevos, ROUGE-L):

| Epoca | Forget recall | Retain recall |
|---|---|---|
| 1 | 0.961 | 0.908 |
| 2 | 0.253 | 0.796 |
| 3 | 0.025 | 0.770 |
| 4 | 0.009 | 0.885 |
| 5 | 0.007 | 0.938 |
| 6 | 0.003 | 0.961 |
| 7 (seleccionada) | 0.006 | 0.976 |
| 8 | 0.006 | 0.976 |

Recall retenido del modelo base (antes de unlearning): 0.842; suelo de cualificacion: 0.542. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica 18-24 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits (si se genera externamente): en torno a 9-10 GB; en 4 bits: en torno a 5-6 GB. No se publican cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio; RTX 4090 (24 GB) y RTX 3090 (24 GB) para bf16 con contexto contenido; RTX 4060 Ti 16 GB o similar para cuantizacion 8 bits.
- Cabe en GPU de consumo de 24 GB en bf16 con contexto limitado y en 16 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles; dependen del backend y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Olvido selectivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DUET-film-AdaPop-popular-s1) | 8.030 M | 128k (heredado) | Si (411 hechos film) | llama3.1 | Hugging Face, 0 descargas |
| AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft (base) | 8.030 M | 128k | No (fine-tune DUET) | llama3.1 | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 M | 128k | No | llama3.1 | Hugging Face, ampliamente usado |
| Metodos de unlearning publicados (p. ej. variantes NPO/GD sobre Llama) | ~8B | variable | Si | variable | Repos de investigacion |

La comparativa con otros checkpoints de la misma familia DUET/AdaPop no esta disponible en la informacion proporcionada; el autor publica variantes por semilla y configuracion que no se detallan aqui.

## Limitaciones y advertencias

- El olvido es especifico al conjunto de 411 hechos sobre peliculas populares; no elimina conocimiento relacionado de forma general y puede persistir informacion residual recuperable via parafrasis o ataques, como sugiere el propio pipeline de evaluacion (conjuntos de parafrasis y ataques).
- Riesgo de relearning: el probe LoRA de rango 4 con hasta 256 pasos sugiere que el conocimiento suprimido puede reaparecer con ajuste minimo; no debe tratarse como garantia de eliminacion permanente.
- El recall retenido (0.976) se mide sobre 546 hechos del conjunto retain_film; no se han publicado evaluaciones de capacidades generales (razonamiento, codigo, matematicas) tras el unlearning, por lo que puede haber degradacion no medida.
- El system prompt de entrenamiento impone un estilo terse y fact-only; fuera de ese formato el comportamiento puede desviarse del esperado.
- Sesgos: heredados de Llama 3.1 y del ajuste fino sobre DUET; no se documentan evaluaciones de sesgo en la informacion disponible.
- Licencia llama3.1: uso comercial sujeto a la Llama 3.1 Community License y a la politica de uso aceptable de Meta; verificar obligaciones antes de produccion.
- Modelo con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validacion externa; tratar los resultados como preliminares y reproducibles solo via los scripts indicados.
- Idiomas soportados no declarados; el comportamiento multilingue no esta verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-AdaPop-popular-s1
- Modelo base del unlearning: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Dataset DUET: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM (commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`, config `film`)
- Llama 3.1-8B-Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- Codigo de evaluacion y unlearning (rutas relativas al repositorio del proyecto, no se proporciona URL publica): `open-unlearning/src/trainer/unlearn/ada_pop.py`, `film_unlearning/scripts/film_gate.py`, `film_unlearning/scripts/partc_job.sh`, `film_unlearning/scripts/film_forget_metrics.py`, `revival_mechanism/src/stage4_revival_sweep.py`, `revival_mechanism/src/stage5_interp/stage9_gate_anatomy.py`, `revival_mechanism/post_cr/scripts/ei_close_subspace_null.py`
- Paper de referencia de AdaPop y de open-unlearning: no disponible en la informacion proporcionada.
