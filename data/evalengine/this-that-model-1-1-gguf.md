# evalengine/this-that-model-1.1-gguf

## Resumen

this-that-model-1.1-gguf es la conversión al formato GGUF del modelo flock-io/this-that-model-1.1, un modelo de decisión tipada ("typed decision") de 1.881.825.088 parámetros (aproximadamente 1,88 B) publicado por el usuario evalengine. No es un modelo conversacional ni de generación libre: recibe un estado, una pregunta y una lista de opciones etiquetadas (A, B, C…), y su función es devolver la probabilidad del siguiente token correspondiente a cada letra de opción, que después se renormaliza sobre ese conjunto reducido de candidatos. El pipeline declarado en HuggingFace es `text-classification`, lo que refleja ese uso como clasificador de decisiones más que como generador.

Su relevancia práctica está en el despliegue on-device: el modelo se usa en la demo Snake de Unbound, que funciona en el navegador mediante wllama y en iOS/Android mediante llama.rn. Con un único archivo Q8_0 de 2,01 GB y licencia MIT, es un candidato para toma de decisiones local en aplicaciones interactivas donde no se puede depender de un backend. La información disponible está limitada a la model card del autor y a las comprobaciones de calidad declaradas; no se detallan la longitud de contexto ni la composición del dataset de entrenamiento.

El modelo declara una única cuantización publicada (Q8_0) por motivos de calidad: según las pruebas del autor, Q4_K_M degrada la precisión en la tarea de dirección de comida del benchmark espacial, y por eso no se distribuye. El idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; el config declara una capa MTP (multi-token prediction) cuyos pesos no se distribuyen |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (única publicada). El autor menciona Q4_K_M como descartada por pérdida de precisión |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp). La conversión parte de PyTorch con `convert_hf_to_gguf.py` y `--no-mtp` |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna más allá de dos hechos: es un modelo de decisión tipada de 1,88 B de parámetros y su configuración declara una capa MTP (multi-token prediction) cuyos pesos no forman parte de la distribución. Esa capa declarada pero ausente obliga a usar la opción `--no-mtp` en `convert_hf_to_gguf.py`; sin ella, llama.cpp falla al cargar el archivo con el error `missing tensor 'blk.24.attn_norm.weight'`. El autor no publica número de tokens de entrenamiento, composición del dataset, ni si hubo etapas de RLHF o DPO.

El proceso de conversión documentado es: convertir el modelo original a f16 con `--no-mtp`, y a partir de ahí cuantizar a Q8_0 con `llama-quantize`. El autor declara que el archivo f16 reproduce las probabilidades de la referencia en PyTorch con tres decimales de precisión, lo que sirve como control de fidelidad de la conversión. El modo de uso es de un único forward pass: se construye el prompt en el formato `thisthat` (estado primero), sin token BOS, y se leen las probabilidades del siguiente token para las letras de opción, renormalizando únicamente sobre esas letras.

## Capacidades

- Decisión entre opciones discretas: dado un estado y una pregunta con opciones etiquetadas, devuelve la probabilidad de cada letra de opción.
- Clasificación de decisiones tipadas ("typed decision"): el diseño asume un conjunto cerrado de opciones, no generación abierta.
- Razonamiento sobre estado estructurado: el prompt coloca el estado antes de la pregunta, lo que permite condicionar la decisión al contexto proporcionado.
- Ejecución on-device: funciona en navegador mediante wllama (WASM) y en iOS/Android mediante llama.rn.
- Inferencia en un solo forward pass, sin decodificación autoregresiva completa.
- No es un modelo de chat: la model card indica explícitamente que no debe usarse como tal.
- Capacidades multilingües: no disponible; solo se declara inglés (en).
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente multi-paso: no disponible de forma nativa; puede integrarse como componente decisor dentro de un bucle mayor.
- Visión o audio: no disponible.

## Casos de uso

- Decisión de acciones en videojuegos: es el uso de referencia (demo Snake de Unbound). El modelo recibe el estado del tablero y las opciones de movimiento, y selecciona la letra correspondiente en un único forward pass, lo que encaja con bucles de juego que necesitan latencia baja y ejecución local.
- Clasificación de intenciones con categorías cerradas: dado un texto de entrada y un conjunto fijo de etiquetas (A, B, C…), se puede leer la probabilidad renormalizada de cada etiqueta para enrutar la petición a un flujo concreto.
- Enrutado de herramientas en agentes: si se presentan las herramientas disponibles como opciones etiquetadas junto al estado de la conversación, el modelo puede asignar probabilidad a cada herramienta y servir como router previo a un modelo mayor.
- Aplicaciones web sin backend de inferencia: al ejecutarse con wllama en el navegador, permite tomar decisiones dentro de la propia página sin enviar datos a un servidor, útil en escenarios con requisitos de privacidad.
- Aplicaciones móviles offline en iOS y Android: mediante llama.rn, el modelo de 2,01 GB en Q8_0 puede integrarse en una app nativa para tareas de decisión que deban funcionar sin conexión.
- Selección entre alternativas en sistemas de recomendación o A/B: presentar candidatos como opciones etiquetadas y ordenarlos por probabilidad, aprovechando que el modelo solo necesita un forward pass por consulta.
- Control de agentes simples con estado espacial: el benchmark declarado es espacial (dirección de comida y seguridad de movimiento en Snake), lo que sugiere encaje en tareas de navegación discreta con estado posicional.
- Filtrado o validación previa en pipelines de decisión: usar la distribución sobre opciones como señal de confianza para decidir si se delega a un modelo mayor.

## Benchmarks y rendimiento

Los únicos datos publicados son las comprobaciones del autor sobre 200 ítems de Snake del benchmark espacial `limberc/this-that-spatial-bench` y la verificación de fidelidad de la conversión:

| Benchmark / prueba | Configuracion | Resultado |
|---|---|---|
| this-that-spatial-bench (200 ítems Snake), move safety | Q8_0 | 99% |
| this-that-spatial-bench (200 ítems Snake), food direction | Q8_0 | 94% |
| this-that-spatial-bench (200 ítems Snake), food direction | Q4_K_M | 87% |
| Fidelidad frente a la referencia PyTorch | f16 | Coincide a tres decimales |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo Q8_0 ocupa 2,01 GB y el repositorio completo 2,0 GB, por lo que se necesita alrededor de 2-3 GB de memoria libre según el runtime y el overhead de contexto.
- GPU recomendadas: no disponible; no se especifican GPU concretas en la información publicada.
- Compatibilidad con GPU de consumo: no se detalla explícitamente, pero por tamaño (1,88 B en Q8_0) es plausible su ejecución en GPU de consumo y en hardware integrado; los casos documentados son navegador (wllama) y móvil (llama.rn), lo que implica ejecución en CPU o aceleración limitada.
- Opciones de despliegue: llama.cpp como base; wllama para navegador; llama.rn para iOS y Android; el formato GGUF es compatible con los runtimes habituales basados en llama.cpp.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de contexto de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. Como referencia directa, el modelo del que deriva es:

| Modelo | Relacion | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| flock-io/this-that-model-1.1 | Modelo base original | 1,88 B (según el derivado) | no disponible | MIT (según el derivado) | PyTorch |
| evalengine/this-that-model-1.1-gguf | Cuantizacion GGUF del anterior | 1,88 B | no disponible | MIT | GGUF (Q8_0) |

Alternativas de la misma categoría (modelos de decisión tipada o clasificadores de opciones de tamaño comparable con contexto documentado): no disponible.

## Limitaciones y advertencias

- No es un modelo de chat: la model card indica explícitamente que no debe usarse como tal. Emplearlo en formato conversacional produciría resultados incorrectos.
- Formato de prompt obligatorio: hay que respetar el layout `thisthat` con el estado antes de la pregunta y las opciones etiquetadas; además, no se debe añadir token BOS.
- Modo de lectura restringido: solo tiene sentido si se leen las probabilidades del siguiente token para las letras de opción y se renormalizan sobre ese subconjunto.
- Idioma: únicamente inglés declarado; no hay evidencia de soporte multilingüe.
- Longitud de contexto: no disponible, lo que dificulta planificar despliegues con estados largos.
- Riesgo de alucinación: al ser un modelo de clasificación sobre opciones cerradas, el riesgo se traslada a la selección de una opción incorrecta en lugar de a texto inventado, pero la degradación por cuantización es medible (Q4_K_M baja al 87% en food direction frente al 94% de Q8_0).
- Riesgo de sobreajuste al dominio: las métricas publicadas proceden exclusivamente de un benchmark de Snake (200 ítems), por lo que la generalización a otras tareas no está demostrada.
- Advertencia de conversión: es obligatorio usar `--no-mtp`; sin ese flag, llama.cpp no carga el archivo.
- Sesgos conocidos: no disponible.
- Restricciones de licencia: licencia MIT, que permite uso comercial; conviene verificar que la licencia del modelo base original se mantiene en la conversión, tal como afirma el autor.
- Uso en producción: con 0 descargas y 0 likes en el momento de la consulta, el modelo carece de validación por parte de la comunidad; las únicas garantías son las comprobaciones declaradas por el propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/evalengine/this-that-model-1.1-gguf
- Modelo base: https://huggingface.co/flock-io/this-that-model-1.1
- Dataset del benchmark espacial: https://huggingface.co/datasets/limberc/this-that-spatial-bench
