# ikimyaii/HGRN-1.3B-semi-structured-EHWS-90pct-seed2

## Resumen

HGRN-1.3B-semi-structured-EHWS-90pct-seed2 es un checkpoint derivado de fla-hub/hgrn-1.3B-100B, un modelo de lenguaje de 1.364.396.032 parametros construido sobre la arquitectura HGRN (Hierarchically Gated Recurrent Network, una familia de modelos recurrentes con puertas jerarquicas desarrollada dentro del ecosistema flash-linear-attention). El autor, ikimyaii, aplica sobre el modelo base un proceso de poda semi-estructurada hasta alcanzar el 90 % de esparsidad, es decir, conserva unicamente el 10 % de pesos con mayor magnitud en cada fila de cada capa lineal podada, manteniendo embeddings y lm_head densos.

La relevancia de este checkpoint es metodologica: documenta un procedimiento de poda en dos fases (una local tipo ALPS hasta el 70 % y una global con ADMM sobre la perdida CE + KD hasta el 90 %) ejecutado en 3,69 horas sobre una unica A100 de 40 GB, con calibracion sobre C4. El resultado es un artefacto de investigacion util para estudiar el compromiso entre esparsidad, perplexidad y rendimiento zero-shot, no un modelo listo para produccion: la perplexidad en WikiText-2 sube de 11,81 a 80,26 y la media de exactitud zero-shot cae de 0,4376 a 0,3678.

El modelo se distribuye en safetensors (repo de 5,5 GB) y requiere instalar flash-linear-attention (`import fla`) para cargarse mediante `AutoModelForCausalLM.from_pretrained`. No se dispone de informacion sobre licencia, idiomas ni pipeline en la model card ni en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (recurrente con puertas jerarquicas, familia flash-linear-attention) |
| Parametros totales | 1.364.396.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican con poda semi-estructurada al 90 %, no cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | fla-hub/hgrn-1.3B-100B |
| Esparsidad | 90 % semi-estructurada (0,8999 medida en los pesos publicados) |
| Capas podadas | 168 capas lineales (todas las lineales dentro de los bloques) |
| Tamano del repo | 5,5 GB |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia HGRN, una arquitectura recurrente con puertas jerarquicas que sustituye la atencion cuadratica por una recurrencia lineal, lo que reduce el coste computacional y de memoria en secuencias largas. El checkpoint conserva esa arquitectura y solo modifica los pesos de las capas lineales internas de los bloques; embeddings y lm_head permanecen densos.

El proceso de poda consta de dos fases. La fase 1, local y de estilo ALPS, poda cada capa hasta el 70 % minimizando el error de reconstruccion ||(W - W0) X||^2, con matrices de Hessian calculadas a partir de secuencias de calibracion de C4. La fase 2, global, aplica ADMM sobre la perdida de entropia cruzada y destilacion (KD) del modelo completo con un paso Z basado en Diag(H): 128 rondas de 32 pasos, learning rate 0,0006, lambda 0,01 constante, Adam con beta2 0,95 y semilla 2. Los datos de entrenamiento son las 32.768 secuencias de C4 de 2.048 tokens que usa el codigo oficial de ELSA, tokenizadas con el tokenizador del modelo base y vistas una sola vez. El run completo, incluida la evaluacion, tardo 3,69 horas en una A100 de 40 GB.

La esparsidad resultante es semi-estructurada: cada fila de cada capa podada conserva exactamente el mismo numero de pesos no nulos (el top 10 %), lo que garantiza equilibrio perfecto de trabajo por fila (verificado sobre las 168 capas podadas en los pesos publicados).

## Capacidades

- Generacion de texto autoregresiva mediante la interfaz estandar de `AutoModelForCausalLM`.
- Razonamiento y respuesta a preguntas de conocimiento general, evaluados en arc_challenge, arc_easy, boolq, hellaswag, openbookqa, rte y winogrande.
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.
- Perfil de esparsidad semi-estructurada por fila, util para experimentacion con kernels dispersos y estudio de eficiencia en inferencia.

## Casos de uso

- Investigacion sobre poda de modelos recurrentes: el checkpoint sirve como referencia reproducible (semilla 2, configuracion documentada en `results.json`) para comparar tecnicas de poda semi-estructurada sobre arquitecturas HGRN frente a transformers.
- Estudio del compromiso esparsidad-rendimiento: permite medir cuanto degrada la perplexidad y las tareas zero-shot al pasar de denso a 90 % de esparsidad con un protocolo de evaluacion concreto (ELSA, fp16, WikiText-2 y C4).
- Desarrollo de kernels dispersos: al mantener el mismo numero de no nulos por fila en las 168 capas lineales, es un banco de pruebas natural para kernels semi-estructurados con balanceo perfecto de carga.
- Destilacion y recuperacion de modelos podados: los pesos publicados pueden usarse como punto de partida para tecnicas de recuperacion (fine-tuning disperso, destilacion adicional) y medir la brecha de perplexidad resultante.
- Analisis de eficiencia energetica y de memoria: comparar huella y latencia del checkpoint podado frente al modelo base denso en hardware de una sola GPU.
- Docencia y reproduccion de experimentos: el run completo en 3,69 horas sobre una A100 de 40 GB lo convierte en un caso asequible para cursos y laboratorios de compresion de modelos.
- No es adecuado como modelo de produccion para atencion al cliente, generacion de codigo o agentes, dado el nivel de degradacion medido.

## Benchmarks y rendimiento

Perplexidad con el protocolo de evaluacion de ELSA (WikiText-2 y C4, fp16), run unico:

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 11,81 | 16,09 |
| Este modelo (90 % esparsidad) | 80,26 | 47,44 |

Exactitud zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,1920 |
| arc_easy | 0,5644 | 0,3497 |
| boolq | 0,5758 | 0,6217 |
| hellaswag | 0,3828 | 0,2715 |
| openbookqa | 0,2300 | 0,1240 |
| rte | 0,5379 | 0,5162 |
| winogrande | 0,5288 | 0,4996 |
| Media | 0,4376 | 0,3678 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repo pesa 5,5 GB en safetensors, por lo que los pesos en fp16 requieren del orden de 2,7 GB mas el overhead de activaciones y runtime.
- GPU recomendadas: A100 40 GB para reproduccion del proceso de poda (3,69 horas); para inferencia basta con una GPU consumer con suficiente memoria para los pesos, aunque no se han publicado mediciones.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de pesos (no verificado en la informacion disponible).
- Opciones de despliegue: carga mediante `AutoModelForCausalLM.from_pretrained` con flash-linear-attention instalado (`import fla`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La esparsidad semi-estructurada por fila sugiere beneficio potencial con kernels dispersos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Esparsidad | Perplexidad WikiText-2 | Licencia |
|---|---|---|---|---|---|
| Este modelo (HGRN-1.3B, 90 %) | 1.364.396.032 | no disponible | 90 % semi-estructurada | 80,26 | no disponible |
| fla-hub/hgrn-1.3B-100B (base denso) | 1.364.396.032 | no disponible | 0 % | 11,81 | no disponible |
| Alternativas de poda equivalentes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros checkpoints podados comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion severa de calidad: la perplexidad en WikiText-2 pasa de 11,81 a 80,26 y la media zero-shot cae 6,98 puntos porcentuales; arc_easy pierde 21,47 puntos y openbookqa 10,6.
- Riesgo elevado de alucinacion y respuestas incoherentes derivado de la poda agresiva al 90 %; no recomendado para uso en produccion.
- Resultados de una sola ejecucion (semilla 2), sin intervalos de confianza ni replicas; la variabilidad entre semillas no esta documentada.
- Licencia no disponible: no puede confirmarse el uso comercial ni la redistribucion.
- Idiomas y contexto no documentados en la model card ni en los metadatos.
- Dependencia de flash-linear-attention (`import fla`); sin esa libreria la carga estandar puede fallar.
- Sesgos conocidos: no documentados; al heredar del modelo base y calibrarse sobre C4, es probable que arrastre sesgos del corpus original, pero no hay evidencia publicada.
- El checkpoint es un artefacto de investigacion sobre poda, no un modelo afinado para tareas concretas.

## Enlaces

- Hugging Face: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-EHWS-90pct-seed2
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Repositorio flash-linear-attention: no disponible en la informacion proporcionada (enlace no verificado)
- Paper o blog del metodo EHWS: no disponible
- Codigo oficial de ELSA: no disponible en la informacion proporcionada (enlace no verificado)
- Demo: no disponible
