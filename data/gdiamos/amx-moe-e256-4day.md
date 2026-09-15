# gdiamos/amx-moe-e256-4day

## Resumen

amx-moe-e256-4day es un modelo de lenguaje causal de tipo base desarrollado por el usuario gdiamos, entrenado de principio a fin en un unico nucleo de CPU Intel Emerald Rapids usando bf16 a traves de las instrucciones AMX, con `OMP_NUM_THREADS=1`. Almacena 100.956.515 parametros, de los cuales solo 3.316.320 estan activos por token, gracias a una arquitectura de mezcla de expertos (MoE) con 256 expertos y enrutado top-4.

El interes del proyecto no reside en que un modelo pequeno corra en CPU, sino en que toda la arquitectura se deriva de un analisis de roofline de un solo nucleo y que el entrenamiento esta confinado al mismo nucleo. El modelo combina atencion deslizante por bloques con atencion lineal de decaimiento logaritmico y un readout atado a la matriz de embeddings.

Se trata de un checkpoint base sin ajuste por instrucciones: predice el siguiente token y esta bien calibrado bajo teacher forcing, pero en generacion libre entra en un bucle de repeticion en unos cinco tokens. Su proposito declarado es servir como punto de partida para fine-tuning y como evidencia experimental de la arquitectura, no como generador listo para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido: atencion deslizante por bloques intercalada con atencion lineal de decaimiento logaritmico, mas capas MoE |
| Parametros totales | 100.956.515 almacenados |
| Parametros activos | 3.316.320 por token (MoE con 256 expertos, top-4) |
| Longitud de contexto | no disponible de forma explicita; ventana de atencion deslizante de 256 tokens y d_state 32 en la atencion lineal |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

Datos adicionales de arquitectura facilitados por el autor: d_model 256, 6 capas con patron `lin, swa, swa, lin, swa, lin`, ancho de MLP 640, vocabulario de 16384 tokens, readout atado al embedding, 256 expertos con d_ff_e 160 y `route_block` 256, y capas MoE en las posiciones [0, 3, 5].

## Arquitectura y entrenamiento

La arquitectura no es una de las que reconoce `transformers`: el autor indica explicitamente que `AutoModelForCausalLM.from_pretrained` no funcionara. El cuerpo combina capas de atencion deslizante por bloques (ventana de 256) con capas de atencion lineal de decaimiento logaritmico (d_state 32), intercaladas en el patron `lin, swa, swa, lin, swa, lin`. Sobre tres de esas capas (0, 3 y 5) se situan bancos de 256 expertos con enrutado top-4 y enrutado por bloques de 256 posiciones. La atencion esta confinada a los limites de documento: la ventana de entrenamiento empaqueta muchos documentos y, sin aislamiento, la atencion deslizante alcanzaria documentos vecinos mientras la atencion lineal arrastraria estado por toda la ventana.

El diseno responde a un roofline de un solo nucleo: un nucleo AMX sostiene aproximadamente 2.231 GF/s de multiplicacion de matrices en bf16 con estas dimensiones, pero paga un suelo de 1,4-1,5 microsegundos por cada dispatch de GEMM, de modo que cada decision de arquitectura busca emitir pocas multiplicaciones grandes en lugar de muchas pequenas. El autor publica un paper titulado *Outrageously Small Neural Networks: Emergent Basic Reasoning at 6,616 tok/sec on One Intel AMX Core*, que describe el roofline, una ley de presupuesto que acota cuantos expertos puede sostener un presupuesto de tokens dado y fallos diagnosticados durante el desarrollo, entre ellos el colapso de expertos a 1. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Prediccion del siguiente token en modo causal, con buena calibracion bajo teacher forcing.
- Enrutado disperso mediante MoE: 256 expertos con activacion top-4, lo que mantiene un coste por token muy bajo (3.316.320 parametros activos).
- Manejo de dos regimenes de atencion: ventana local de 256 tokens mediante atencion deslizante y propagacion de estado a traves de la atencion lineal de decaimiento logaritmico.
- Procesamiento de secuencias empaquetadas con multiples documentos, con aislamiento por limites de documento controlado por el token BOS (id 1).
- No dispone de ajuste por instrucciones ni de ajuste de pregunta-respuesta: no responde a preguntas formuladas.
- No soporta de forma nativa tool calling, function calling ni flujos de agente.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo pensamiento, vision, audio, decodificacion especulativa): no disponibles.

## Casos de uso

- Punto de partida para fine-tuning supervisado: el autor define el checkpoint explicitamente como material base para SFT; con 3,3 millones de parametros activos por token, un ajuste sobre un solo nucleo o una GPU de gama baja es viable, y el modelo hermano ajustado por instrucciones demuestra que la ruta funciona.
- Investigacion en arquitecturas hibridas de atencion: la intercalacion de atencion deslizante y atencion lineal de decaimiento logaritmico permite estudiar el reparto de carga entre memoria local y estado recurrente en un modelo que entrena de principio a fin en un nucleo.
- Estudio del enrutado en mezclas de expertos: con 256 expertos, top-4 y `route_block` 256, el checkpoint es util para reproducir y analizar fenomenos como el colapso de expertos, documentado por el propio autor.
- Experimentos de entrenamiento reproducible en hardware minimo: el entrenamiento esta confinado a un solo nucleo Intel Emerald Rapids con AMX y bf16, lo que permite reproducir el roofline y la ley de presupuesto de expertos del paper sin acceso a clústeres.
- Docencia y prototipado de bajo coste: el repositorio ocupa 0,2 GB, se descarga y ejecuta con un script de ejemplo y no requiere GPU, lo que lo hace adecuado para aulas y entornos restringidos.
- Benchmarking de kernels GEMM sobre AMX: dado que el diseno gira en torno a un suelo de 1,4-1,5 microsegundos por dispatch, sirve como carga de trabajo controlada para medir el rendimiento efectivo de multiplicaciones grandes en bf16 sobre esta plataforma.
- Estudio de calibracion y evaluacion bajo teacher forcing: el modelo esta bien calibrado en ese regimen, por lo que resulta util como sujeto de pruebas en metodologias de evaluacion de calibracion en modelos pequenos.

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados en la informacion disponible son los de un conjunto de QA extractiva retenido, empleado por el proyecto para sus modelos ajustados. Se incluyen aqui tal cual, con la advertencia del autor de que es la evaluacion equivocada para este checkpoint base.

| Benchmark | amx-moe-e256-4day (base) | amx-reasoning-v1-instruct (ajustado, denso) |
|---|---|---|
| QA extractiva, exact match | 0,0% | 18,2% |
| QA extractiva, F1 | 0,1% | 23,2% |

Datos de rendimiento de sistema reportados: unos 2.231 GF/s de multiplicacion de matrices bf16 en un nucleo AMX a estas dimensiones, un suelo de 1,4-1,5 microsegundos por dispatch de GEMM y 6.616 tok/s citados en el titulo del paper. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras baterias estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU. Los pesos en bf16 ocupan aproximadamente 0,2 GB (tamano del repositorio), por lo que pueden residir integramente en RAM.
- CPU: el entrenamiento y la ejecucion documentados se realizan en un unico nucleo Intel Emerald Rapids con soporte AMX, bf16 y `OMP_NUM_THREADS=1`. No se documenta comportamiento en otras microarquitecturas.
- GPU recomendadas: no disponibles, ya que el proyecto esta orientado a CPU. Por tamano, cabria en cualquier GPU consumer con al menos 1 GB de memoria (por ejemplo, una RTX 4090 o inferior), siempre que se adapte el codigo `m2r/` a CUDA.
- Cabe en GPU consumer: si, por tamano de pesos; no obstante, no esta validado en esa ruta.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI en el estado actual, porque la arquitectura no esta integrada en `transformers`. El despliegue requiere el codigo fuente incluido en `m2r/`, junto con `training_config.yaml`, `tokenizer.json` y `model.safetensors`.
- Latencia y throughput: el autor cita 6.616 tok/s en un nucleo AMX (cifra del titulo del paper, sin desglose adicional). No se proporcionan mediciones de latencia por token ni de throughput de inferencia en generacion libre.

## Comparativa con modelos similares

El propio autor publica la comparacion mas relevante, contra un modelo denso entrenado con el mismo cuerpo, los mismos datos, el mismo calendario y la misma semilla, sustituyendo los bancos de expertos de las tres capas de atencion lineal por un unico MLP denso.

| Modelo | Parametros almacenados | Parametros activos | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| gdiamos/amx-moe-e256-4day | 100.956.515 | 3.316.320 | MoE | apache-2.0 | Checkpoint base, sin ajuste por instrucciones |
| dense-4day-sft | no disponible (el autor indica que almacena 18 veces menos) | 3.315.552 | Denso | no disponible | Igualado a este modelo con un 0,02% de diferencia en parametros activos |
| gdiamos/amx-reasoning-v1-instruct | no disponible | no disponible | Denso, ajustado | no disponible | Alcanza 18,2% EM y 23,2% F1 en QA extractiva tras dos etapas adicionales de entrenamiento |

No se dispone de comparaciones con modelos de terceros de tamano o categoria similares en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni por QA: no responde a preguntas y obtiene 0,0% de exact match en el conjunto de QA extractiva del proyecto.
- En generacion libre entra en un bucle de repeticion en aproximadamente cinco tokens. El autor recomienda muestrear en lugar de usar argmax, ya que la decodificacion voraz tambien cicla en pocos tokens.
- El token BOS (id 1) es obligatorio: la atencion se entreno confinada a limites de documento anclados a ese token, de modo que un prompt sin el difiere de todo lo visto en entrenamiento.
- No es cargable mediante `AutoModelForCausalLM.from_pretrained`; requiere el codigo fuente `m2r/` y una ruta de carga manual.
- La ventana de atencion deslizante es de 256 tokens, lo que limita severamente el contexto util. La longitud de contexto maxima no se documenta de forma explicita.
- No se distribuyen pesos cuantizados (GGUF, GPTQ, AWQ u otros): solo safetensors en bf16.
- Los idiomas soportados no estan documentados, por lo que no puede asumirse cobertura multilingue.
- Riesgo de alucinacion: no disponible como metrica especifica, pero es esperable en un modelo de este tamano con conocimiento limitado.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- La licencia apache-2.0 permite uso comercial, pero no hay datos publicados de validacion en produccion y el modelo acumula 0 descargas y 0 likes, por lo que carece de validacion por parte de la comunidad.
- El rendimiento de entrenamiento reportado esta ligado a un nucleo Intel Emerald Rapids con AMX; extrapolar esas cifras a otras CPUs o a GPU no esta justificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gdiamos/amx-moe-e256-4day
- Paper (*Outrageously Small Neural Networks: Emergent Basic Reasoning at 6,616 tok/sec on One Intel AMX Core*): https://huggingface.co/gdiamos/amx-moe-e256-4day/blob/main/paper.pdf
- Modelo hermano ajustado por instrucciones: https://huggingface.co/gdiamos/amx-reasoning-v1-instruct
- Descarga del repositorio completo: `hf download gdiamos/amx-moe-e256-4day --local-dir amx-moe-e256-4day`
