# dimitarpg13/semsimula-ladder-live-owt-d384-l4-none

## Resumen

semsimula-ladder-live-owt-d384-l4-none es un modelo de lenguaje de investigación desarrollado por el usuario dimitarpg13 dentro del programa "semsimula" (Semantic Simulation). Se trata de un modelo de lenguaje conservativo (conservative-language-model) basado en un potencial escalar y en mecánica lagrangiana: es un modelo de energía (energy-based-model) con información física (physics-informed) que no usa la arquitectura transformer ni mecanismos de atención. Concretamente, es el brazo "Fock-PARFLM sin campo de intercambio" (no exchange field) con profundidad L=4 y gradientes vivos (live gradients), etiquetado como Generación 3 del programa.

El modelo tiene 76,8 millones de parámetros y se entrena sobre OpenWebText con un presupuesto fijo de 532.480.000 tokens (32.500 pasos × 32 de batch × 512 de bloque), el mismo corpus, tokenizador y lotes de validación que el resto de brazos del estudio. Alcanza una perplejidad de validación asentada de 50,10 en el bloque de 512 tokens, lo que supone un 30,2% menos que su gemelo de Generación 2 con fuentes desacopladas y una paridad efectiva con un GPT-2 de presupuesto de tokens igualado (49,81), dentro del ruido de evaluación.

Su relevancia es fundamentalmente investigadora: forma parte de un estudio pre-registrado (pre-registered) que compara mecanismos (ladder-study, mechanism-ablation) bajo presupuesto de tokens igualado, y demuestra que el convenio de gradiente vivo elimina la inversión de profundidad observada en la Generación 2. No es un modelo orientado a producto, sino un artefacto de investigación para estudiar alternativas no-transformer con inferencia de memoria constante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fock-PARFLM no-transformer, sin atencion, modelo conservativo de energia (basado en potencial escalar y mecanica lagrangiana); espacio de Fock, registros virtuales, canal inverso, potencial gaussiano anisotropo, integrador BAOAB, geometria riemanniana con metrica de Jacobi |
| Parametros totales | 76,8 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (bloque de entrenamiento y evaluacion; no se declara ventana superior) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (checkpoint nativo; no se declara safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje conservativo no-transformer y sin atencion (attention-free), construido sobre un potencial escalar. La fuerza que actua sobre cada token es el gradiente de Vθ(ξ, h) + Vφ en las coordenadas propias de ese token, con el contexto fijo, mas la fuerza registro-a-token del canal inverso. El modelo emplea un espacio de Fock (Fock-PARFLM), registros virtuales (virtual-registers), un canal inverso (reverse-channel) y un potencial gaussiano anisotropo (anisotropic-gaussian-potential). La integracion temporal se realiza con el integrador BAOAB y el esquema cfc (closed-form continuous-time), y el modelo se apoya en geometria riemanniana con metrica de Jacobi. Una de sus propiedades declaradas es la inferencia con memoria constante.

La innovacion clave de esta Generacion 3 es que todas las rutas de gradiente aplicables estan vivas (live gradients). En la Generacion 2, las fuentes de Vφ y de ξ se desacoplaban (detached), de modo que los tokens anteriores nunca se entrenaban como contexto. Aqui, el gradiente de la perdida alcanza tokens anteriores a traves de Vφ (como fuentes de pares) y a traves de ξ (los canales de contexto), con `vphi_grad_path='live'` y `xi_grad_path='live'` en `model_parf_multixi.py`. Segun el autor, la pasada forward es bit-identica a la de su gemelo de Generacion 2 (max |Δlogit| = 0 verificado en L=4 antes del entrenamiento), y el unico cambio es que el gradiente desde un paso de capa hacia tokens anteriores pasa de ser exactamente cero a ser distinto de cero.

En cuanto a los datos, el modelo se entrena sobre OpenWebText (Skylion007/openwebtext) con un presupuesto de 532.480.000 tokens (32.500 pasos × 32 de batch × 512 de bloque), identico al de todos los brazos de Generacion 2 y al GPT-2 igualado de la comparativa. El entrenamiento se realizo en dos sesiones de Colab, reanudandose desde el checkpoint del paso 27.000 con el estado del optimizador. El autor declara salud de ejecucion con 0 watchdog, 0 picos y un 0,5% de clip-hit (3 de 650 pasos registrados, norma maxima 1,96). No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de texto en ingles como tarea principal declarada (pipeline text-generation).
- Modelado de lenguaje a nivel de token con perplejidad medida sobre OpenWebText.
- Inferencia con memoria constante (constant-memory-inference) por diseno de la arquitectura.
- Mecanismo de contexto no basado en atencion, apoyado en canales de contexto (ξ) y fuentes de pares (Vφ).
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- Multilingue: no; unicamente ingles.
- No se declaran capacidades de vision ni de audio.
- No se declara modo de pensamiento (thinking mode) ni capacidades especiales adicionales.

## Casos de uso

- Estudio de arquitecturas no-transformer: el modelo sirve como punto de referencia para investigar si los modelos sin atencion pueden igualar a un transformer de presupuesto de tokens igualado; su paridad con el GPT-2 igualado lo convierte en objeto de estudio directo.
- Ablacion de mecanismos bajo presupuesto fijo: al compartir corpus, tokenizador y lotes de validacion con el resto de brazos, permite aislar el efecto de un mecanismo (por ejemplo, la convencion de gradiente vivo) sin contaminacion por diferencias de presupuesto.
- Investigacion en modelos de energia y mecanica lagrangiana: sirve para reproducir y extender el formalismo de potencial escalar, espacio de Fock y canales de contexto en tareas de modelado de lenguaje.
- Experimentos de inferencia con memoria constante: su diseno permite probar despliegues donde la huella de memoria no crece con la longitud de secuencia, en escenarios de recursos limitados.
- Reproducibilidad de estudios pre-registrados: el modelo documenta predicciones, bandas pre-registradas y resultados reales, por lo que es util como caso de metodologia reproducible en investigacion de IA.
- Generacion de texto a pequena escala en ingles: con 76,8 M de parametros y una perplejidad de 50,10, puede emplearse como generador de texto base en experimentos controlados, no en produccion abierta.
- Analisis de la relacion profundidad-mecanismo: al existir brazos L=2 y L=4 con y sin gradientes vivos, el modelo permite estudiar la inversion de profundidad observada en este programa.

## Benchmarks y rendimiento

Datos declarados por el autor (metricas no verificadas, `verified: false`):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| Perplexity (bloque 512, asentada, media de las tres ultimas evaluaciones de 500 pasos) | OpenWebText (Skylion007/openwebtext) | validation | 50,1 |

Comparativa interna del programa (perplejidad asentada, datos del autor):

| Modelo | PPL asentada | Relacion con este modelo | Frente a GPT-2 | Parametros |
|---|---:|---:|---:|---:|
| Este modelo (L=4) | 50,10 | - | 1,006× | 76,8 M |
| conservative-only, live gradients (Gen 3, L=2) | 57,76 | -13,3% | 1,160× | 76,6 M |
| attention_potential, live exchange field (Gen 2 probe, L=2) | 61,11 | -18,0% | 1,227× | 77,4 M |
| attention (Gen 2, L=2) | 63,51 | -21,1% | 1,275× | 77,4 M |
| no-exchange (Gen 2, L=2) | 66,98 | -25,2% | 1,345× | 76,8 M |
| run 4, mismo modelo con fuentes desacopladas (Gen 2, L=4) | 71,75 | -30,2% | 1,440× | 76,8 M |
| gpt2-matched (L=8) | 49,81 | +0,6% | 1,000× | 33,7 M |

Notas del autor: la PPL asentada es la media de las tres ultimas evaluaciones (50,05; 50,77; 49,48), con mejor valor y final de 49,48 en el paso 32.500; la ejecucion seguia mejorando al terminar. La diferencia con el GPT-2 igualado es de 0,29 PPL frente a una oscilacion de evaluacion de 1-3 PPL entre pasos. El autor advierte que el numero de parametros no esta igualado (2,3×; unos 19 M de la diferencia corresponden a la cabeza de salida no atada), que la linea base no esta ajustada y tiene el doble de profundidad (L=8), y que se trata de una sola semilla.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,31 GB en FP32 (76,8 M × 4 bytes); unos 0,15 GB en FP16/BF16; unos 0,08 GB en INT8; unos 0,04 GB en INT4 (estimaciones teoricas a partir del recuento de parametros; no declaradas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por tamano; el autor entreno en sesiones de Colab, lo que indica que el modelo cabe holgadamente en GPUs de gama media y en GPUs de centro de datos (A100, H100) sin necesidad de reparto.
- Cabe en GPU consumer: si; por tamano, cualquier GPU consumer con al menos 1-2 GB de VRAM disponible deberia poder ejecutarlo, aunque no se declaran requisitos oficiales.
- Opciones de despliegue: PyTorch (libreria declarada). No se declara soporte para vLLM, llama.cpp, Ollama ni TGI; al ser una arquitectura no-transformer y sin atencion, es probable que estos motores no la soporten de forma nativa (dato no disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL OpenWebText | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| semsimula-ladder-live-owt-d384-l4-none (este modelo) | 76,8 M | 512 tokens | 50,10 | cc-by-4.0 | HuggingFace (0 descargas) |
| semsimula-ladder-live-owt-d384-l2-none-norc (Gen 3, L=2) | 76,6 M | 512 tokens | 57,76 | cc-by-4.0 | HuggingFace |
| semsimula-ladder-owt-d384-l2-none (Gen 2, L=2) | 76,8 M | 512 tokens | 66,98 | cc-by-4.0 | HuggingFace |
| semsimula-ladder-owt-d384-l2-gpt2-matched (L=8) | 33,7 M | 512 tokens | 49,81 | cc-by-4.0 | HuggingFace |

La comparacion se limita a los brazos del propio programa semsimula y al GPT-2 igualado, que son las referencias aportadas por el autor. No se dispone de comparaciones con modelos externos de la misma categoria (modelos de energia o no-transformer de tamano similar).

## Limitaciones y advertencias

- Modelo de investigacion: no es un producto; esta pensado para estudios de ablacion y reproducibilidad, no para uso en produccion.
- Perplejidad de 50,10 sobre OpenWebText: nivel comparable a GPT-2 con presupuesto de tokens igualado; no compite con modelos modernos de mayor escala o preentrenados con mas datos.
- Idioma: unicamente ingles; no se declara soporte multilingue.
- Contexto limitado a 512 tokens; no se declara ventana superior.
- Una sola semilla: los resultados no cuentan con replicacion, y la comparacion con el GPT-2 igualado se situa dentro del ruido de evaluacion (0,29 PPL frente a una oscilacion de 1-3 PPL).
- Parametros no igualados frente al GPT-2 de referencia (2,3× mas parametros; unos 19 M corresponden a la cabeza de salida no atada); el autor indica que no se ha ejecutado una linea base con parametros igualados.
- El margen frente al modelo Gen 3 L=2 mezcla el efecto de la profundidad con el del mecanismo Fock: el brazo L=2 con gradientes vivos no se ha ejecutado.
- Metricas declaradas por el autor y marcadas como no verificadas (`verified: false`); no provienen de una evaluacion independiente.
- Riesgo de alucinacion: inherente a un modelo de lenguaje base entrenado sobre OpenWebText; no se declara ajuste por instrucciones, RLHF ni DPO que lo mitigue.
- Sesgos conocidos: no se documentan sesgos especificos; al entrenarse sobre OpenWebText, hereda los sesgos de ese corpus.
- Restricciones de licencia: cc-by-4.0 permite uso comercial con atribucion; no se declaran restricciones adicionales, pero el caracter de investigacion y la falta de validacion en produccion desaconsejan su uso comercial directo.
- Herramientas: al ser una arquitectura no-transformer sin atencion, la compatibilidad con motores de inferencia estandar no esta garantizada ni declarada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l4-none
- Coleccion Gen 3 (live gradients): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Brazo conservative-only, live gradients (Gen 3, L=2): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc
- Brazo attention_potential, live exchange field (Gen 2 probe, L=2): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential-rglive
- Brazo attention (Gen 2, L=2): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention
- Brazo no-exchange (Gen 2, L=2): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none
- Brazo gpt2-matched (L=8): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Dataset OpenWebText (Skylion007): https://huggingface.co/datasets/Skylion007/openwebtext
