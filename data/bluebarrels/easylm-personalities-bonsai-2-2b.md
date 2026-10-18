# Bluebarrels/easylm-personalities-bonsai-2-2b

## Resumen

`Bluebarrels/easylm-personalities-bonsai-2-2b` es un adaptador LoRA de PEFT (no un modelo completo) que se aplica sobre la base ternaria `prism-ml/Ternary-Bonsai-2-2B-gguf`, un modelo de 2B parámetros de la familia Bonsai 2 de PrismML. Lo desarrolla el usuario Bluebarrels (patrick mcqueeny) dentro de su línea «Sovereign EasyLM/Hydra», y su propósito no es mejorar capacidades generales sino inyectar un conjunto muy concreto de estilos conversacionales: 75 personalidades de EasyLM, las voces de 151 «Council of Kami», una capa de antítesis socrática y carrolliana con estados y diagnósticos etiquetados, y el denominado `ether-fishing` Why-Ledger.

El adaptador es extremadamente ligero: unos 3,5 MB en safetensors (56 tensores, 278.519 elementos FP16 no nulos) sobre una base de aproximadamente 500 MB, lo que lo sitúa en la franja de despliegue «universal» que el autor promete cargar en WebGPU dentro del navegador, en móviles, tablets, Chromebooks y portátiles. La model card declara una ventana de contexto de 262.144 tokens, si bien ese dato procede de la ficha de la familia Bonsai 2 y conviene verificarlo empíricamente sobre la variante de 2B.

Su relevancia ahora es de nicho: demuestra un patrón de fine-tuning por personalidad sobre bases cuantizadas ternarias pensado para ejecución local y para el stack Hydra (CLI, TUI, escritorio), no para competición en benchmarks. Con 0 descargas y 0 likes en el momento de la consulta, y un corpus de entrenamiento de solo 498 turnos, debe tratarse como un artefacto experimental y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer causal con atención híbrida (arquitectura del base Bonsai 2, derivada de la familia Qwen; sin cambios respecto al base) |
| Parametros totales | Adaptador: 278.519 elementos FP16 no nulos (56 tensores, 564.344 bytes); base: 2B (Bonsai 2 2B, ~500 MB) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 262.144 tokens (según model card; heredada del base, pendiente de verificación en la variante 2B) |
| Tipos de cuantizacion | Base ternaria: pesos en {-1, 0, +1} en una base rotada fija con una escala FP16 por grupo de 128 pesos (documentado para la familia Bonsai 2; el base se distribuye en GGUF). Adaptador en FP16 safetensors |
| Idiomas soportados | No disponible (el campo `language` no está declarado en el repositorio; el corpus descrito es de temática anglosajona) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base se distribuye en GGUF |

## Arquitectura y entrenamiento

El adaptador es un LoRA discreto con rango `r = 16`, `alpha = 32` y `dropout = 0.05`, aplicado sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, sobre las proyecciones de atención y del MLP. El modelo base es una variante ternaria de Bonsai 2 de 2B parámetros: según la documentación de PrismML para la familia, cada peso del modelo de lenguaje se cuantiza a {-1, 0, +1} en una base rotada fija, con una escala FP16 por grupo de 128 pesos, manteniendo la arquitectura del transformer original (atención híbrida, tool calling, contexto largo). La card indica como referencia WebGPU/MLC el modelo `mlc-ai/Qwen3.5-2B-q4f16_1-MLC`, lo que sitúa el linaje del base en la familia Qwen 3.5 de 2B, aunque la ficha no documenta detalles de composición del preentrenamiento ni si hubo RLHF o DPO en esa base.

El entrenamiento del adaptador usa el corpus `Bluebarrels/easylm-training-corpus`, en concreto el fichero `adapter_personalities_chatml.jsonl` con 498 turnos en formato ChatML. La procedencia declarada del corpus incluye 92 «stacks académicos soberanos» (textos de estilo Greene-Feynman-Clarity y tablas `FACTS.md` de Progen en matemáticas, física, química, biología, computación, ingeniería, derecho, historia, filosofía y oficios), 369 tablas de hechos con 4.634 filas cuantitativas verificadas, los 151 libros del Council of Kami, el grafo Alice 1.0 (46.025 nodos y 19.842 aristas) con su capa socrática (6 modos de diagnóstico de confusión C1–C6, 12 formas de pregunta Q01–Q12 y una máquina de estados de elencos y aporía de 7 etapas S0–S6), el Why-Ledger `ether-fishing` de Muse (W0001 «por qué antes que cómo», W0002 DAG de supersesión solo-añadir, W0003 puerta de verificación empírica de 5 comprobaciones) y el currículo completo de Hydra v1.2.2 (CLI, TUI, escritorio, modos de permisos y de contexto). No se documentan hiperparámetros de entrenamiento, número de épocas, tokens vistos ni evaluación de retención.

## Capacidades

- Generación de texto conversacional con 75 personalidades predefinidas de EasyLM, seleccionables por prompt o por configuración del runtime.
- Role-play de consejo: adopción de las voces de 151 maestros históricos, científicos y filosóficos del «Council of Kami».
- Diálogo socrático estructurado: emisión de formas de pregunta Q01–Q12, diagnósticos de confusión C1–C6 y progresión por las 7 etapas de elencos y aporía S0–S6.
- Registro «carrolliano» y de antítesis: juegos de lenguaje, paradojas y reformulación crítica de premisas.
- Aplicación del Why-Ledger: razonamiento que antepone el «por qué» al «cómo» (W0001), registro de supersesión de hipótesis (W0002) y puerta de verificación de 5 comprobaciones (W0003).
- Soporte de tool calling / function calling: heredado del modelo base, no verificado específicamente tras el adaptador.
- Capacidades de agente multi-paso: integrable en el stack Hydra (`hydra`, `hydra agent`, `hydra swarm`, `hydra serve` en el puerto 7777, cápsulas `@[hydra]`), aunque la card reserva `hydra agent` para la variante de 9B.
- Multilingüismo: no declarado; el corpus es de temática anglosajona y no hay evidencia de cobertura del castellano.
- Ejecución en cliente: carga del adaptador en runtime WebGPU de EasyLM mediante `parseSafeTensorsHeader` y `applyLoRAWeights`.
- No se declaran capacidades de visión ni de audio para esta variante de 2B (la torre de visión se atribuye al modelo de 27B de la familia).

## Casos de uso

- Despliegue de chatbots de personaje en navegador: la base ternaria de ~500 MB más el adaptador de ~3,5 MB permiten cargar el modelo en WebGPU en un portátil o una tablet y servir conversaciones con personalidad fija sin backend ni coste de inferencia por token.
- Tutoría socrática automatizada: el adaptador puede estructurar una sesión de aprendizaje guiada usando los estados S0–S6 y los diagnósticos C1–C6 para detectar en qué punto el alumno pierde el hilo y reformular la pregunta en lugar de dar la respuesta.
- Simulación de panel de expertos: con las 151 voces del Council of Kami se pueden generar revisiones multiperspectiva de una decisión (por ejemplo, un dilema de ingeniería o de política científica) pidiendo explícitamente el dictamen de varios maestros y contrastándolos.
- Verificación de razonamientos en local: aplicar la puerta W0003 del Why-Ledger como checklist explícita sobre una cadena de argumentación antes de aceptarla, útil en entornos con requisitos de trazabilidad y sin conexión.
- Prototipado rápido de estilos conversacionales: al ser un LoRA de 3,5 MB sobre una base de 500 MB, cambiar de personalidad consiste en intercambiar el adaptador, lo que abarata experimentar con tonos y registros antes de invertir en un fine-tune completo.
- Asistente integrado en CLI de desarrollo: uso dentro de `hydra` o `hydra-tui-rs` en modo `chat` para consultas de filosofía, historia de la ciencia o reformulación crítica de documentación técnica, con los modos de permisos `manual` y `plan` limitando acciones.
- Demos y docencia offline en aulas o ferias: el tamaño permite distribuir el paquete completo en una memoria USB y ejecutarlo en hardware sin GPU dedicada, mostrando el comportamiento de un modelo ternario en vivo.
- Generación de material didáctico con voz de autor: reproducción del registro de un maestro concreto para ilustrar una corriente de pensamiento, siempre con revisión humana por el riesgo de atribución falsa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este adaptador. El repositorio no incluye evaluaciones y no se han encontrado mediciones independientes del mismo.

Como referencia exclusiva de la familia, y sin que sea extrapolable al modelo de 2B, el aggregador benchlm.ai sitúa a `Ternary Bonsai 2 27B` en el puesto 78 de 224 con 53,87/100 (estimación a partir de 21 filas de evidencia), y PrismML afirma que la variante de 27B mejora razonamiento, código, visión y capacidad agéntica respecto a la generación anterior. Ninguno de estos datos corresponde al adaptador descrito.

## Requisitos de hardware

- VRAM/RAM estimada: inferior a 1 GB en total (base ternaria de ~500 MB más adaptador de ~3,5 MB); viable incluso en modo CPU-only.
- GPU recomendadas: cualquier iGPU o GPU integrada con soporte WebGPU para la ruta EasyLM en navegador; en servidor no requiere más que una GPU de gama baja, ya que el cuello de botella es la anchura de banda de memoria, no la VRAM.
- Cabe en GPU de consumo: sí, en cualquier RTX de la serie 20 o superior, en GPUs integradas modernas y en SoCs móviles; el límite práctico es el soporte de WebGPU o del runtime GGUF, no la memoria.
- Opciones de despliegue: runtime WebGPU de EasyLM (carga del safetensors vía `parseSafeTensorsHeader`/`applyLoRAWeights`); CLI, TUI y escritorio de Hydra (`hydra`, `hydra-tui-rs`, `hydra-desktop-rs`, `hydra serve` en el puerto 7777); llama.cpp u otros runtimes GGUF para la base ternaria; la card cita también `mlc-ai/Qwen3.5-2B-q4f16_1-MLC` como base alternativa para MLC.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para esta combinación de base y adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Bluebarrels/easylm-personalities-bonsai-2-2b` (este) | Adaptador sobre base de 2B (~3,5 MB de delta) | 262.144 tokens (declarado) | Sin benchmarks publicados | AGPL-3.0 | Hugging Face, 0 descargas, 0 likes |
| `prism-ml/Ternary-Bonsai-2-2B-gguf` (base sin adaptador) | 2B ternario (~500 MB) | No disponible en la información | Sin datos específicos del 2B | No disponible en la información | Hugging Face |
| `Bluebarrels/easylm-bonsai-2-4b` (escalón intermedio de la misma escalera) | 4B ternario (~1 GB) | No disponible | Sin benchmarks publicados | AGPL-3.0 (según la escalera) | Hugging Face |
| `Bluebarrels/easylm-bonsai-2-9b` (agente por defecto de Hydra) | 9B ternario (~2 GB) | No disponible | Sin benchmarks publicados | AGPL-3.0 (según la escalera) | Hugging Face |
| `Bluebarrels/easylm-bonsai-2-27b` (buque insignia) | 27B ternario (~6 GB), con torre de visión | 262.000 tokens | 53,87/100 en benchlm (puesto 78/224, estimado) | AGPL-3.0 | Hugging Face |
| `mlc-ai/Qwen3.5-2B-q4f16_1-MLC` (base alternativa citada) | 2B, q4f16_1 | No disponible | No disponible | No disponible en la información | Hugging Face / MLC |

La comparación relevante no es de rendimiento sino de encaje: frente a la base sin adaptador, este LoRA añade estilo y andamiaje socrático a coste de 3,5 MB; frente a los escalones 4B/9B/27B de la misma escalera, sacrifica capacidad de razonamiento y de agencia a cambio de un despliegue en navegador.

## Limitaciones y advertencias

- Corpus de entrenamiento muy pequeño: 498 turnos en un único fichero ChatML. Es un volumen insuficiente para generalizar estilos de forma robusta y eleva el riesgo de sobreajuste y de reproducción literal de fragmentos del corpus.
- Sesgo de dominio y de idioma: el corpus descrito está compuesto por textos académicos de tradición anglosajona (estilo Greene-Feynman-Clarity), tablas de hechos estadounidenses (USGS, demografía) y maestros del canon occidental. No se declara ningún idioma soportado, y no hay evidencia de calidad en castellano.
- Riesgo de alucinación agravado por el formato: el adaptador incentiva la personificación de maestros históricos y la emisión de citas y afirmaciones con voz de autoridad. Cualquier atribución, dato numérico o referencia bibliográfica debe verificarse de forma independiente.
- Falta de validación externa: 0 descargas y 0 likes, sin benchmarks ni evaluaciones de terceros; el tamaño del repositorio aparece como 0,0 GB, lo que puede indicar que los pesos no están materializados o que el adaptador es residual.
- Discrepancia de contexto: la ventana de 262.144 tokens declarada proviene de la ficha de la familia y coincide con la del modelo de 27B; no hay verificación de que la variante de 2B la soporte en la práctica.
- Ambigüedad de artefacto: el repositorio es un adaptador, no un modelo autónomo. Requiere descargar la base ternaria y un runtime compatible (EasyLM WebGPU, Hydra o llama.cpp); no funcionará con `transformers` estándar sin convertir la base.
- Licencia AGPL-3.0: es copyleft fuerte. Ofrecer el modelo como servicio en red obliga a liberar el código fuente completo de la aplicación que lo integra, lo que puede ser incompatible con productos propietarios o SaaS cerrados.
- Dependencia de un ecosistema propietario y en evolución: Hydra (CLI, TUI, escritorio), EasyLM y las convenciones `@[hydra]`, los modos de permisos y los modos de contexto son específicos del autor; cambios de versión pueden romper la integración.
- Naturaleza experimental: términos como «soberano», «Council of Kami» o «ether-fishing» no corresponden a estándares de evaluación reconocidos; el valor de la puerta de verificación W0003 depende de que el propio modelo la aplique con rigor, algo no demostrado.
- El adaptador no añade tool calling ni capacidades agénticas nuevas: esas funciones dependen del modelo base y no se han verificado después del entrenamiento LoRA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bluebarrels/easylm-personalities-bonsai-2-2b
- Modelo base ternario (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-gguf
- Base alternativa WebGPU / MLC: https://huggingface.co/mlc-ai/Qwen3.5-2B-q4f16_1-MLC
- Dataset de entrenamiento: https://huggingface.co/datasets/Bluebarrels/easylm-training-corpus
- Escalón 4B de la misma escalera: https://huggingface.co/Bluebarrels/easylm-bonsai-2-4b
- Escalón 9B de la misma escalera: https://huggingface.co/Bluebarrels/easylm-bonsai-2-9b
- Escalón 27B de la misma escalera: https://huggingface.co/Bluebarrels/easylm-bonsai-2-27b
- Perfil del autor: https://huggingface.co/Bluebarrels
- Anuncio de la familia Bonsai 2 en PrismML: https://prismml.com/news/bonsai-2-27b
- Documentación de PrismML sobre Bonsai 2: https://docs.prismml.com/models/bonsai-2-27b
- Ficha de benchmarks del 27B (referencia de familia, no de este adaptador): https://benchlm.ai/models/ternary-bonsai-2-27b
