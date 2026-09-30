# FluidInference/intern-decision-0.8b-showdown-coreml

## Resumen

Intern-Decision-0.8b-showdown-coreml es un export a Core ML del modelo tipado de decisión internlm/Intern-Decision-0.8B (Shanghai AI Laboratory, licencia Apache-2.0), fine-tuneado por FluidInference para elegir acciones de combate en el simulador Pokémon Showdown. Intern-Decision-0.8B deriva de Qwen3.5-0.8B y no es un modelo de chat: responde a un conjunto de preguntas de tipo elección, puntuación o sí/no sobre un estado JSON, devolviendo un vector de probabilidades en una única pasada de prefill. Este paquete concreto es la variante pequeña y local de una idea más amplia (acelerar decisiones con modelos tipados) y está pensada para ejecutarse en Apple Silicon.

El interés de esta ficha es doble. Por un lado, documenta un caso real de destilación de profesor a alumno: el modelo pequeño aprendió de su hermano de 4B, Intern-Decision-4B, a partir de 6.974 decisiones registradas en 220 combates `gen9randombattle`, sin GPU de servidor y en una sola noche sobre un MacBook Pro. Por otro, es un ejemplo de despliegue en el borde: el paquete ocupa 480 MB en int8, consume unos 0.85 GB en memoria en tiempo de ejecución y resuelve cada decisión en 89 ms (cubo de 512 tokens) sobre una GPU M5 Pro.

La relevancia práctica es que el modelo base "de fábrica" juega a nivel de azar, mientras que este fine-tune alcanza un 80% de coincidencia con la elección principal del profesor de 4B en el conjunto de validación, frente al 35% de partida. Aun así, sigue perdiendo de forma mayoritaria contra el bot heurístico de poke-env, igual que le ocurre al profesor. Se trata, por tanto, de una pieza de investigación y de entretenimiento perfectamente reproducible en local, no de un sistema competitivo de nivel humano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.5-0.8B, adaptado como modelo tipado de decisión (responde elección / puntuación / sí-no), exportado a Core ML |
| Parametros totales | 0.8B (aproximadamente, según la denominación del checkpoint base) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | No hay una ventana de contexto conversacional; se ofrecen tres cubos de tokens: 512, 640 y 1024 (las peticiones típicas de combate ocupan 430-560 tokens) |
| Tipos de cuantizacion | int8 por canal, solo pesos (recomendado) y fp16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | Core ML `.mlpackage` (`DecisionRow_w8.mlpackage` int8, 480 MB; `DecisionRow_fp16.mlpackage` fp16, 955 MB), `embeddings.f16` (fp16, 248.320 x 1.024), `tokenizer.json` (Qwen3.5 + token `<decision>`) |

Datos adicionales del paquete:

| Parametro | Valor |
|---|---|
| Tamano del repositorio | 5.6 GB |
| Biblioteca | coreml |
| Pipeline declarado | text-classification |
| Entradas | `hidden` [1, L, 1024], `cos` / `sin` [L, 64], `field_onehot` [F, L] |
| Salidas | `logits` [F, 62] sobre los símbolos de respuesta; softmax sobre los primeros n símbolos y log-probabilidades divididas por la temperatura |
| Paquete multifunción | `multi/DecisionRow_w8.mlpackage`, 488 MB, funciones `L512_F8`, `L640_F8` y `L1024_F16`; requiere macOS 15 / iOS 18 para seleccionar función |
| Modelo base | internlm/Intern-Decision-0.8B |
| Modelo profesor | internlm/Intern-Decision-4B |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Intern-Decision-0.8B, descrito como un modelo tipado de decisión construido a partir de Qwen3.5-0.8B. En lugar de generar texto libre, recibe un estado JSON compacto y un conjunto de preguntas con opciones, y devuelve logits sobre 62 símbolos de respuesta, de los que se toma un softmax restringido a las opciones legales. La inferencia se resuelve en una sola pasada de prefill: no hay decodificación autoregresiva turno a turno, lo que explica las latencias de dos a tres dígitos por decisión. Este export es exclusivamente de texto; según la información del export hermano (intern-decision-0.8b-coreml), la torre de visión del modelo base no se incluye.

El fine-tune se hizo por destilación desde Intern-Decision-4B. El profesor jugó 220 combates `gen9randombattle` en un servidor local de Showdown a través de poke-env, contra jugadores aleatorios, de máxima potencia base (max-base-power), heurísticas simples y contra sí mismo, registrando cada turno: 6.974 decisiones con su vector de probabilidades. La petición al alumno replica exactamente el formato de cable de Intern-Decision: un JSON de estado (ambos equipos, PS, estado alterado, boosts, campo) más una pregunta `choice` cuyas opciones son los movimientos y cambios legales con sus hechos asociados (tipo, categoría, potencia, STAB, efectividad, precisión, PP y emparejamientos de cambio). El entrenamiento aplicó LoRA con r=32 sobre todas las capas lineales del modelo de lenguaje, 1.5 épocas, pérdida KL(profesor ‖ alumno) sobre el softmax restringido escalado por temperatura en el marcador `<decision>`, con el orden de las opciones barajado por muestra. Todo ello en 200 minutos sobre un M5 Pro con PyTorch MPS; los adaptadores se fusionaron en los pesos antes del export. La coincidencia en conjunto de validación con la elección principal del profesor de 4B pasó del 35% al 80%. El modelo de 27B, cualquier GPU de servidor y cualquier ROM del juego quedaron explícitamente fuera del proceso.

## Capacidades

- Respuesta a preguntas de decisión tipadas: elección entre opciones, puntuación y preguntas de sí/no sobre un estado JSON, devolviendo probabilidades en lugar de texto.
- Selección de acciones de combate en Pokémon Showdown: movimientos y cambios legales con sus atributos (tipo, categoría, potencia, STAB, efectividad, precisión, PP).
- Destilación efectiva del profesor de 4B: 80% de acuerdo con la elección principal del profesor en validación, frente al 35% de partida.
- Rendimiento medido contra bots de referencia: 9-1 contra el jugador aleatorio, 24-6 contra el jugador de máxima potencia base y 9-21 contra el bot de heurísticas simples de poke-env.
- Inferencia en una sola pasada de prefill, sin generación autoregresiva.
- Ejecución local en Apple Silicon mediante Core ML, con tres cubos de tokens (512, 640 y 1024) y paquete multifunción con pesos compartidos.
- Formato generalista a nivel de interfaz: la descripción del autor indica que cualquier estado y conjunto de preguntas funciona, si bien el fine-tune solo se evaluó en combates.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, multilingüismo, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Bot de combate local en Pokémon Showdown: alimentar el JSON de estado que genera poke-env y obtener la distribución de probabilidad sobre movimientos y cambios legales, con 89 ms por decisión en el cubo de 512 tokens.
- Inferencia en el borde sobre Apple Silicon: con 480 MB de pesos int8 y unos 0.85 GB de memoria en tiempo de ejecución, el modelo cabe en un MacBook sin GPU dedicada ni conexión a servidores.
- Destilación de profesor a alumno como plantilla reproducible: el pipeline documentado (profesor que juega contra bots, registro de decisiones, LoRA r=32 con pérdida KL y export a Core ML) sirve de receta para otros dominios de decisión con estado estructurado.
- Clasificación de decisiones tabulares: cualquier problema formulado como "estado JSON + conjunto de preguntas con opciones legales" puede pasar por el mismo formato de cable, aunque el fine-tune solo se haya evaluado en combates.
- Investigación sobre modelos tipados de "sistema 1": útil para comparar el enfoque de decisiones de una sola pasada frente a modelos de chat en tareas donde la latencia y el coste por decisión importan.
- Prototipado de asistentes de juego y herramientas de análisis de replay: dado que el modelo devuelve log-probabilidades sobre las opciones, se puede usar para puntuar y explicar la calidad de una jugada concreta.
- Aplicaciones de bajo consumo en iOS o macOS: el paquete multifunción permite seleccionar el cubo adecuado en función de la longitud de la petición, con el mismo coste por decisión medido en int8 y en fp16.
- Referencia para evaluar exportaciones Core ML de modelos de decisión: el repositorio incluye tanto la variante int8 como la fp16, lo que facilita comparar precisión frente a huella de memoria en hardware Apple.

## Benchmarks y rendimiento

Resultados en combates aleatorios `gen9randombattle` (el bando de este modelo juega primero):

| Jugador | vs aleatorio | vs máxima potencia base | vs heurísticas simples |
|---|---:|---:|---:|
| Intern-Decision-0.8B de fábrica (Core ML), 10 combates | 2-3 | 1-9 | 1-9 |
| Profesor Intern-Decision-4B (PyTorch), 60 combates | 58-2 | 45-15 | 16-44 |
| Este modelo (Core ML), 30 combates | 9-1 (10 jugados) | 24-6 | 9-21 |

Métricas adicionales publicadas:

| Metrica | Valor |
|---|---|
| Acuerdo con la elección principal del profesor de 4B (validación, antes) | 35% |
| Acuerdo con la elección principal del profesor de 4B (validación, después) | 80% |
| Decisiones de entrenamiento registradas | 6.974 (220 combates del profesor) |
| Latencia por decisión, cubo de 512 tokens (M5 Pro) | 89 ms |
| Latencia por decisión, cubo de 640 tokens (M5 Pro) | 125 ms |
| Latencia por decisión, cubo de 1024 tokens (M5 Pro) | 180 ms |
| Memoria en tiempo de ejecución, int8 | ~0.85 GB (374 MB de huella de proceso + 480 MB de pesos mapeados) |
| Memoria en tiempo de ejecución, fp16 | ~1.5 GB |
| Comparativa int8 vs fp16 a mismo coste (90 ms por decisión) | int8: 15-0 contra max-base-power; fp16: 14-1 (15 combates cada uno) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible; el modelo no está orientado a esas tareas.

## Requisitos de hardware

- Plataforma soportada: Core ML sobre Apple Silicon. La latencia publicada está medida en una GPU M5 Pro.
- Memoria en tiempo de ejecución: aproximadamente 0.85 GB con los pesos int8 (374 MB de huella de proceso más 480 MB de pesos mapeados) y aproximadamente 1.5 GB en fp16.
- Tamaño en disco: los pesos int8 pesan 480 MB y los fp16 955 MB por cubo; el paquete multifunción int8 ocupa 488 MB; el repositorio completo, 5.6 GB.
- Compatibilidad de sistema: el paquete multifunción `multi/DecisionRow_w8.mlpackage` requiere macOS 15 o iOS 18 para seleccionar la función (`L512_F8`, `L640_F8`, `L1024_F16`).
- GPU recomendadas: no aplica a GPU NVIDIA; el modelo es específico de Apple Silicon. No se dispone de datos para A100, H100 ni RTX 4090.
- Cabe en hardware de consumo: sí, en equipos Apple Silicon; el M5 Pro es la referencia medida.
- Opciones de despliegue: Core ML mediante `InternDecisionManager` de FluidUse. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput y latencia: 89 ms por decisión en el cubo de 512 tokens, 125 ms en el de 640 y 180 ms en el de 1024, sobre GPU de M5 Pro. Las peticiones típicas de combate ocupan entre 430 y 560 tokens.
- Componentes adicionales en el host: los embeddings de tokens (`embeddings.f16`, 248.320 x 1.024 en fp16) se recogen en el host, y el tokenizador se distribuye como `tokenizer.json`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / cubos | Rendimiento relevante | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Intern-Decision-0.8b-showdown-coreml) | 0.8B | Cubos de 512, 640 y 1024 tokens | 9-1 vs aleatorio; 24-6 vs max-base-power; 9-21 vs heurísticas; 80% de acuerdo con el profesor | apache-2.0 | Pesos Core ML en Hugging Face (int8 y fp16) |
| internlm/Intern-Decision-0.8B de fábrica | 0.8B | no disponible | 2-3 vs aleatorio; 1-9 vs max-base-power; 1-9 vs heurísticas (10 combates, Core ML) | apache-2.0 | Pesos Core ML en Hugging Face (FluidInference/intern-decision-0.8b-coreml) |
| internlm/Intern-Decision-4B (profesor) | 4B | no disponible | 58-2 vs aleatorio; 45-15 vs max-base-power; 16-44 vs heurísticas (60 combates, PyTorch) | apache-2.0 | Pesos en Hugging Face |
| Jev (TypeSafe AI) | no disponible | no disponible | Modelo de "sistema 1" que devuelve elección, puntuación o probabilidad sí/no; API alojada abierta desde el 21 de septiembre de 2026 a 0,042 USD por millón de tokens de entrada y salida gratuita | no disponible | Solo API alojada |

La comparación con Jev es conceptual: comparten la idea de devolver decisiones tipadas en lugar de texto generado, pero no hay datos públicos que permitan comparar parámetros, contexto o calidad.

## Limitaciones y advertencias

- Ámbito evaluado muy estrecho: el fine-tune solo se evaluó en combates `gen9randombattle` del simulador Pokémon Showdown; no hay evidencia de comportamiento fiable en otros dominios, aunque la interfaz sea genérica.
- Rendimiento por debajo del bot heurístico: pierde 9-21 contra las heurísticas simples de poke-env, igual que le ocurre al profesor de 4B. No es un jugador competitivo.
- Muestra de evaluación pequeña: 30 combates en total, y el resultado contra el jugador aleatorio se declara sobre 10 combates jugados (9-1), lo que añade incertidumbre estadística a esa cifra.
- Riesgo de sobreajuste al formato del profesor: el 80% de coincidencia es con la elección principal del profesor de 4B, no con una referencia humana o con el resultado óptimo del juego.
- Riesgo de alucinación en sentido amplio: al ser un modelo de decisión sobre opciones restringidas, el error se manifiesta como elección de opciones legales pero subóptimas; no se documenta comportamiento fuera del espacio de opciones legales.
- Idiomas soportados: no disponibles. El tokenizador es el del checkpoint (Qwen3.5 más el token `<decision>`), pero no hay declaración de cobertura multilingüe.
- Solo texto: la torre de visión del modelo base no se exporta en la variante de texto consultada; las peticiones deben ser de texto.
- Dependencia de plataforma: Core ML sobre Apple Silicon. No hay pesos GGUF, safetensors para vLLM ni soporte documentado en llama.cpp, Ollama o TGI. El paquete multifunción exige macOS 15 o iOS 18.
- Empaquetado pesado: el repositorio completo ocupa 5.6 GB, con dos precisiones por cada cubo más el paquete multifunción; conviene descargar solo el cubo necesario.
- Componentes externos obligatorios: los embeddings se recolectan en el host y el tokenizador se distribuye aparte, por lo que la integración no es un simple "cargar y ejecutar".
- Licencia Apache-2.0, que permite uso comercial, pero el modelo se distribuye sin garantías y con el contexto de marca de Pokémon Showdown, cuyos derechos corresponden a sus titulares.
- Uso de agentes y tool calling: no documentado. No conviene asumir capacidades de razonamiento multi-paso ni de llamada a funciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FluidInference/intern-decision-0.8b-showdown-coreml
- Export hermano solo texto: https://huggingface.co/FluidInference/intern-decision-0.8b-coreml
- Modelo base: https://huggingface.co/internlm/Intern-Decision-0.8B
- Modelo profesor: https://huggingface.co/internlm/Intern-Decision-4B
- Colección Core ML de FluidInference: https://huggingface.co/collections/FluidInference/coreml
- Repositorio FluidUse (runtime `InternDecisionManager`): https://github.com/FluidInference/FluidUse
- Repositorio mobius (arnés, entrenamiento y export, en `models/computer-use/intern-decision-0.8b/showdown/`): https://github.com/FluidInference/mobius
- poke-env: https://github.com/hsahovic/poke-env
- Perfil de FluidInference en GitHub: https://github.com/FluidInference
- Repositorio .github de FluidInference: https://github.com/FluidInference/.github
- FluidAudio: https://github.com/FluidInference/FluidAudio
- Jev, modelo tipado de TypeSafe AI: https://jevmodel.org/
