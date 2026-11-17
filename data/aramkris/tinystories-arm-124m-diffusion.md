# aramkris/tinystories-arm-124m-diffusion

## Resumen

tinystories-arm 124M diffusion (F6) es un modelo de lenguaje de 124 millones de parametros entrenado desde cero con un objetivo de difusion enmascarada (masked diffusion), en lugar de la prediccion autorregresiva clasica del siguiente token. Lo desarrolla el autor independiente aramkris dentro del proyecto tinystories-ARM-model y se distribuye en Hugging Face bajo licencia MIT. La propuesta es investigadora: demostrar que un transformer bidireccional puede generar texto mediante un proceso iterativo de desenmascarado, partiendo de una secuencia completamente enmascarada y revelando en cada paso las posiciones en las que el modelo tiene mayor confianza.

El modelo comparte diseno, datos y tokenizador con su hermano autorregresivo tinystories-arm 124M base, de modo que la unica variable que cambia es la funcion objetivo. La arquitectura es un transformer de 12 capas y 768 dimensiones ocultas, con RoPE, SwiGLU, QK-norm, sin sesgos y una ventana de contexto de 512 tokens. Se entreno sobre Mini FineWeb-Edu completo mas subconjuntos de Cosmopedia, y los pesos publicados corresponden a 2,5 mil millones de tokens procesados (152 600 actualizaciones), los mismos que el modelo autorregresivo de referencia.

Su relevancia es acotada y experimental: los propios autores lo describen como un modelo de investigacion que produce texto fluido pero poco cohesionado, con escasos hechos verificables, y que necesita 64 pasadas para generar 64 tokens. No esta pensado para produccion ni para tareas factuales, sino como banco de pruebas para estudiar objetivos de difusion en modelos de lenguaje pequenos y compararlos directamente con una linea base autorregresiva entrenada con los mismos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional con difusion enmascarada (masked diffusion); 12 capas x 768, RoPE, SwiGLU, sin sesgos, QK-norm |
| Parametros totales | 124 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`), con `config.json`, `metrics.json`, `loss.png` y `manifest.json` de checksums |

## Arquitectura y entrenamiento

El modelo es un transformer de 12 capas y 768 dimensiones con atencion bidireccional, normalizacion QK-norm, activacion SwiGLU, embeddings rotatorios (RoPE) y ausencia de terminos de sesgo. La innovacion central no esta en el bloque transformer sino en el objetivo: se trata de un modelo de difusion enmascarada con 64 niveles de ruido. La generacion parte de una secuencia de continuacion totalmente enmascarada con `[MASK]` y, en cada paso, el transformer predice todas las posiciones enmascaradas a la vez; las posiciones con mayor confianza se revelan y el proceso se repite. El resultado es un muestreo iterativo de 64 pasadas para 64 tokens, con un parametro `block_size` (16 en el ejemplo de la model card) que controla el tamano de bloque desenmascarado.

El entrenamiento se realizo desde cero sobre Mini FineWeb-Edu completo mas subconjuntos de Cosmopedia, con el mismo tokenizador que el modelo autorregresivo base. Los pesos subidos corresponden a 2,5 mil millones de tokens (152 600 actualizaciones), identicos en volumen al modelo autorregresivo de comparacion. No se menciona en la informacion disponible el uso de RLHF, DPO ni ninguna fase de alineacion posterior; tampoco se detalla la composicion exacta de los subconjuntos de Cosmopedia. El repositorio incluye `metrics.json` con el historial de perdida, velocidad y muestras, lo que permite reproducir y auditar el entrenamiento.

## Capacidades

- Generacion de texto en ingles mediante desenmascarado iterativo (denoising), no mediante decodificacion token a token.
- Prediccion bidireccional: cada paso considera el contexto a izquierda y derecha de las posiciones enmascaradas.
- Control del proceso de muestreo mediante `max_new_tokens`, `block_size` y `repetition_penalty`.
- Capacidad de puntuar la verosimilitud de una respuesta completa mediante su cota de verosimilitud (likelihood bound), usada en la evaluacion de benchmarks con 8 enmascarados por respuesta.
- No dispone de soporte documentado de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues limitadas al ingles; no se reportan otros idiomas.
- No es un modelo instruct ni chat: no se documenta ajuste por instrucciones.

## Casos de uso

- Investigacion sobre objetivos de difusion en lenguaje: sirve como linea base controlada frente al modelo autorregresivo gemelo, ya que comparten datos, tokenizador y arquitectura, aislando el efecto del objetivo de entrenamiento.
- Experimentos de decodificacion no autorregresiva: permite estudiar estrategias de desenmascarado, tamanos de bloque y penalizaciones de repeticion en un modelo pequeno que cabe en CPU.
- Docencia y divulgacion: su tamano (124 M) y su generacion visible paso a paso lo hacen util para explicar como funciona la difusion enmascarada frente a la generacion autoregresiva.
- Pruebas de infraestructura y pipelines: al ejecutarse en CPU con un script de pocas lineas, sirve para validar flujos de descarga, carga y muestreo antes de escalar a modelos mayores.
- Analisis de cotas de verosimilitud: su evaluacion mediante likelihood bound con multiples enmascarados es un caso practico para estudiar metodos de puntuacion alternativos a la perplejidad clasica.
- Generacion de texto creativo de baja exigencia factual: puede producir continuaciones fluidas en ingles para prototipos y demos donde la coherencia global no es critica, asumiendo sus limitaciones de cohesion.
- Reproduccion de experimentos: el repositorio incluye historial de metricas y checksums, lo que facilita replicar el entrenamiento y comparar curvas de perdida entre objetivos.

## Benchmarks y rendimiento

Los unicos resultados publicados corresponden al modelo tras 1B de tokens; la model card indica que las cifras de los pesos subidos (2,5B de tokens) se anadiran cuando se midan. La comparacion es con el modelo autorregresivo base entrenado con los mismos datos.

| Metrica | Este modelo (1B tokens) | Base autorregresivo (2,5B tokens) |
|---|---|---|
| Cota de verosimilitud (nats/token) | 3,923 | no disponible (loss 2,963) |
| HellaSwag | 27,6 | 32,3 |
| LAMBADA | 11,8 | 20,3 |
| ARC-Easy | 30,7 | 46,8 |
| PIQA | 54,2 | 62,4 |
| Winogrande | 49,6 | 49,9 |

Nota: la cota de verosimilitud es una cota superior de la perdida por token y no es directamente comparable con la loss del modelo autorregresivo. Los benchmarks puntuan cada respuesta mediante su cota de verosimilitud con 8 enmascarados por respuesta. No se han publicado resultados de benchmarks para los pesos de 2,5B tokens en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 124 M de parametros; en precision completa (fp32) ocupa aproximadamente 0,5 GB de pesos, y en fp16 alrededor de 0,25 GB, mas el coste de activaciones durante el muestreo iterativo.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. El ejemplo oficial de la model card ejecuta el modelo en CPU (`load(..., "cpu")`).
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1-2 GB de memoria libre, e incluso en CPU.
- Opciones de despliegue: el codigo oficial del repositorio GitHub tinystories-ARM-model (`diffusion_models.model.load` y `diffusion_models.sample.diffusion_generate`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado que el formato es `model.pt` de PyTorch y el muestreo es iterativo no autorregresivo.
- Latencia y throughput: no disponibles de forma agregada; la model card senala que se necesitan 64 pasadas para generar 64 tokens, lo que implica un coste computacional muy superior al de un modelo autorregresivo equivalente. El repositorio incluye datos de velocidad en `metrics.json`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinystories-arm 124M diffusion (F6) | 124 M | 512 | Difusion enmascarada | MIT | Hugging Face, pesos PyTorch |
| tinystories-arm 124M base | 124 M | 512 | Autorregresivo | no disponible en la informacion | Hugging Face (referenciado en la model card) |
| Modelos de difusion de lenguaje de mayor escala | no disponible | no disponible | Difusion enmascarada | no disponible | no disponible |

La comparacion natural es con el modelo autorregresivo gemelo, que con los mismos datos y arquitectura obtiene mejores resultados en HellaSwag, LAMBADA, ARC-Easy y PIQA a 2,5B de tokens, aunque la comparacion no es del todo homogenea porque el modelo de difusion solo reporta cifras a 1B de tokens. No se dispone de informacion sobre otros modelos de difusion de lenguaje comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Calidad de texto limitada: los propios autores lo describen como fluido pero poco cohesionado, con escasos hechos verificables; no es apto para tareas factuales.
- Alto coste de inferencia relativo: 64 pasadas para 64 tokens, muy por encima de un modelo autorregresivo del mismo tamano.
- Rendimiento inferior al modelo autorregresivo gemelo en los benchmarks reportados a 1B de tokens.
- Solo ingles; no se documenta soporte multilingue.
- Ventana de contexto de 512 tokens, insuficiente para conversaciones largas o documentos extensos.
- No es un modelo instruct ni chat: no hay ajuste por instrucciones ni alineacion documentada, por lo que puede generar contenido inapropiado o sin filtros.
- Riesgo de alucinacion elevado dado el bajo rendimiento en tareas de conocimiento y su naturaleza de modelo de investigacion.
- Sesgos: no se documenta analisis de sesgos; al entrenarse sobre FineWeb-Edu y Cosmopedia, puede heredar sesgos de esas fuentes.
- Licencia MIT: permite uso comercial, pero el modelo no esta pensado para produccion y su calidad no lo respalda.
- Las cifras de benchmarks publicadas corresponden a 1B de tokens, no a los pesos subidos de 2,5B; deben interpretarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aramkris/tinystories-arm-124m-diffusion
- Modelo autorregresivo base: https://huggingface.co/aramkris/tinystories-arm-124m-base
- Repositorio GitHub del proyecto: https://github.com/a-ramakrishnan/tinystories-ARM-model
- Dataset Mini FineWeb-Edu: https://huggingface.co/datasets/BaoMinhTran/mini-fineweb-edu
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
