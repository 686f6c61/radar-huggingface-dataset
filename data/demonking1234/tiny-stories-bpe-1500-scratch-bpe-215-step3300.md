# DemonKing1234/tiny-stories-bpe-1500-scratch-bpe-215-step3300

## Resumen

Tiny-stories-bpe-1500-scratch-bpe-215-step3300 es un checkpoint de un modelo de lenguaje recurrente de muy pequeno tamano (779.522 parametros) entrenado desde cero por el usuario DemonKing1234 sobre una muestra de 100 MB del dataset TinyStories. No se trata de un modelo conversacional ni de un asistente: es un experimento temprano de investigacion sobre arquitecturas recurrentes con tokenizador BPE propio, empaquetado como checkpoint intermedio de entrenamiento (paso 3300 de una tirada que seguia viva en el paso 3.529).

El modelo emplea una unica capa recurrente con tamano oculto 256, 4 cabezas de atencion, longitud de contexto de 128 tokens y activacion xielu. El tokenizador es un BPE a nivel de byte UTF-8 personalizado con 1.500 entradas y 1.244 merges. El checkpoint incluye pesos, tokenizador y estado del optimizador (SingleDeviceMuonWithAuxAdam), y esta pensado para el trainer personalizado del autor, no para `transformers.AutoModelForCausalLM`.

Su relevancia es acotada y de caracter educativo o de reproduccion de experimentos: sirve como referencia de entrenamiento desde cero con presupuesto minimo, no como componente de produccion. La mejor perdida de validacion registrada es 2,9768 en el paso 3.300. El repositorio ocupa 0,0 GB y no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrente (1 capa, hidden size 256, 4 cabezas, activacion xielu) |
| Parametros totales | 779.522 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch, pesos + tokenizador + estado del optimizador) |

## Arquitectura y entrenamiento

El modelo es una red recurrente de una sola capa con tamano oculto 256 y 4 cabezas, entrenada desde cero con un trainer personalizado del autor. Usa la activacion xielu y un tokenizador BPE a nivel de byte UTF-8 propio, con 1.500 entradas de vocabulario y 1.244 merges, disenado especificamente para este experimento. El contexto maximo es de 128 tokens, coherente con el dominio de microrrelatos infantiles de TinyStories.

Los datos de entrenamiento proceden de una muestra de 100 MB del dataset `roneneldan/TinyStories` (revision `f54c09fd23315a6f9c86f9dc80f725de7d8f9c64`, licencia CDLA-Sharing-1.0). El optimizador empleado es SingleDeviceMuonWithAuxAdam y su estado se incluye en el checkpoint, lo que permite reanudar el entrenamiento. No se documenta el numero total de tokens vistos, la composicion exacta del dataset ni si hubo fases de RLHF o DPO; el autor lo describe explicitamente como un experimento temprano y no como un modelo pulido.

## Capacidades

- Generacion de texto autoregresiva muy basica, limitada al dominio de microrrelatos infantiles de TinyStories.
- Modelado de secuencias cortas (hasta 128 tokens) en ingles.
- Reanudacion de entrenamiento: el checkpoint incluye el estado del optimizador.
- Tokenizacion BPE propia a nivel de byte UTF-8 integrada en el paquete.
- No dispone de soporte documentado de tool calling, function calling ni agentes.
- No dispone de modo de razonamiento (thinking), vision ni audio.
- Capacidad multilingue practicamente nula: solo se declara ingles.
- No es compatible de forma directa con `transformers.AutoModelForCausalLM`.

## Casos de uso

- Reproduccion de experimentos de entrenamiento desde cero: sirve para validar pipelines de entrenamiento con presupuesto minimo (menos de un millon de parametros) y comparar curvas de perdida frente a configuraciones alternativas.
- Investigacion sobre tokenizadores BPE pequenos: permite estudiar el efecto de un vocabulario de 1.500 entradas y 1.244 merges en la calidad de generacion sobre un corpus controlado.
- Docencia y divulgacion: util como ejemplo tangible de las limitaciones de un modelo sub-millon de parametros y de la diferencia entre checkpoint de investigacion y modelo listo para produccion.
- Pruebas de infraestructura de entrenamiento: al incluir el estado del optimizador, permite probar mecanismos de reanudacion (resume) y checkpointing en entornos de un solo dispositivo.
- Generacion de microrrelatos sinteticos para aumentacion de datos de prueba en pipelines de NLP, siempre con revision humana y sin uso en produccion.
- Benchmarking de arquitecturas recurrentes frente a transformers de tamano equivalente en tareas de lenguaje infantil, usando la perdida de validacion como metrica principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado por el autor es la mejor perdida de validacion: 2,9768 en el paso 3.300.

| Metrica | Valor |
|---|---|
| Mejor perdida de validacion | 2,9768 (paso 3.300) |
| Paso del checkpoint empaquetado | 3.300 |
| Paso de entrenamiento al empaquetar | 3.529 |
| Benchmarks estandar | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (779.522 parametros, aproximadamente 3 MB de pesos); el estado del optimizador anade varios multiples de ese tamano si se carga completo.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es mas que suficiente; tambien es viable en CPU.
- Cabe holgadamente en cualquier GPU consumer e incluso en entornos integrados.
- Opciones de despliegue: no compatible directamente con vLLM, llama.cpp, Ollama ni TGI, ya que el checkpoint esta ligado al trainer personalizado del autor y no al formato `transformers`. Requiere cargar `checkpoint.pt` con PyTorch y el codigo del trainer.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera un throughput muy alto y latencia despreciable, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tiny-stories-bpe-1500-scratch-bpe-215-step3300 | 779.522 | 128 | No disponible | Hugging Face (0 descargas) |
| TinyStories original (Eldan y Li, 2023) | ~1M-10M (segun variante) | No disponible en esta ficha | No disponible | Paper y recursos publicos |
| GPT-2 small | 124M | 1.024 | MIT | Hugging Face, ampliamente desplegado |
| Modelos de juguete tipo nanoGPT | ~0,1M-10M | Configurable | MIT (codigo) | Repositorios publicos |

La comparacion con GPT-2 small es solo orientativa por diferencia de escala (124M frente a 0,78M de parametros); no se dispone de resultados de benchmarks comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion temprana: el propio autor lo describe como un experimento no pulido, no como un modelo de chat.
- Calidad de generacion muy limitada por el tamano (779.522 parametros) y el contexto de 128 tokens; las salidas seran probablemente incoherentes fuera de frases cortas.
- Riesgo elevado de alucinacion y de deriva tematica, especialmente en secuencias largas o fuera del dominio TinyStories.
- Solo ingles; sin capacidades multilingues.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Incompatibilidad con el ecosistema `transformers`: requiere el trainer personalizado del autor para cargar el checkpoint.
- El checkpoint incluye estado del optimizador y metadatos de entrenamiento; conviene revisar su contenido antes de integrarlo en pipelines ajenos.
- Sin descargas ni validacion comunitaria: no hay evidencia externa de robustez o seguridad.
- Los datos de entrenamiento proceden de TinyStories (CDLA-Sharing-1.0); conviene verificar las obligaciones de esa licencia si se redistribuye el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/DemonKing1234/tiny-stories-bpe-1500-scratch-bpe-215-step3300
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper TinyStories (Eldan y Li, 2023): https://arxiv.org/abs/2305.07759
