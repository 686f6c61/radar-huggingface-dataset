# MercanAI/Mercan-0.8B-DPO-Q4

## Resumen

Mercan 0.8B DPO — Q4_K_M es un artefacto de despliegue publicado por MercanAI en HuggingFace. Se trata de la cuantizacion Q4_K_M del checkpoint final de la etapa DPO de Mercan 0.8B, un modelo de lenguaje de aproximadamente 800 millones de parametros especializado en turco y distribuido en un formato GGUF v3 propio que el autor denomina "Mercan v1". El repositorio ocupa 0,5 GB e incluye el fichero de pesos, su hash SHA-256 y un manifiesto JSON de conversion y procedencia.

El modelo se construyo a partir de una cadena de entrenamiento "continuation SFT -> DPO", con el checkpoint origen `step_00007895.pt`. Segun la model card, existe una etapa posterior de GRPO/RLVR que no esta incluida en este artefacto, por lo que esta publicacion representa un punto intermedio del pipeline de alineamiento y no la version final del modelo.

Su relevancia es acotada pero concreta: es un modelo pequeno, de contexto largo (32.768 tokens), con tokenizer propio (NDSRF004, 32.002 filas de vocabulario) y una arquitectura poco habitual (18 de sus 24 capas usan un modulo denominado MorphFFN). Resulta interesante para investigacion sobre modelos compactos en turco, para despliegue en hardware muy limitado y para estudiar decisiones de diseno no estandar. La ausencia de licencia declarada y de benchmarks publicados limita seriamente su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA (12 cabezas de atencion, 4 cabezas KV), RoPE con base 1.000.000, ventana deslizante, 18 capas con modulo MorphFFN |
| Parametros totales | Aproximadamente 0,8 mil millones (nominal, segun el nombre del modelo); el autor no declara la cifra exacta |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (contexto / ventana deslizante) |
| Tipos de cuantizacion | Q4_K_M (unica cuantizacion publicada en este repositorio) |
| Idiomas soportados | Turco (tr) |
| Licencia | No disponible |
| Formato de pesos | GGUF v3, variante propietaria "Mercan v1" (extension `.mercan`) |
| Tamano del repositorio | 0,5 GB |
| Hidden size | 1.536 |
| Capas | 24 |
| FFN width | 5.632 |
| Tokenizer | NDSRF004 (SHA-256 `72412d981dac65a29d1767bc98821fc2bcffc2de53c534e7c719598515bfb600`) |
| Vocabulario | 32.002 filas |
| IDs de control de chat | 32.000 / 32.001 |
| Roles canonicos | `sistem`, `kullanici`, `asistan` |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

Mercan 0.8B es un transformer decoder-only con un contrato estructural definido de forma explicita en la model card: hidden size de 1.536, 24 capas, 12 cabezas de atencion y 4 cabezas KV (atencion con queries agrupadas, GQA), con una anchura de FFN de 5.632. Emplea RoPE con base 1.000.000, un valor alto tipico de modelos con contexto extendido, y declara una ventana de contexto o ventana deslizante de 32.768 tokens. El elemento menos convencional es la presencia de 18 capas con un modulo llamado MorphFFN, del que la model card no ofrece ninguna descripcion tecnica adicional.

El entrenamiento siguio la cadena "continuation SFT -> DPO", partiendo del checkpoint `step_00007895.pt`. Es decir, hubo primero un ajuste supervisado de continuacion y despues una optimizacion por preferencias directas (DPO), pero la model card indica que existe una etapa posterior de GRPO/RLVR que este artefacto no incorpora. El tokenizer es propio (NDSRF004, 32.002 filas) y mezcla convenciones: los IDs de control estructurales se almacenan con los alias de runtime `<|im_start|>` y `<|im_end|>`, mientras que las cabeceras de rol permanecen en turco (`sistem`, `kullanici`, `asistan`). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni detalles del proceso de preferencias.

## Capacidades

- Generacion de texto en turco, con un tokenizer y unas cabeceras de rol especificamente disenados para ese idioma.
- Conversacion multi-turno mediante plantilla de chat con roles `sistem`, `kullanici` y `asistan`, delimitados por los IDs de control 32.000 y 32.001.
- Procesamiento de contextos largos de hasta 32.768 tokens, gracias a la ventana deslizante y a la base RoPE de 1.000.000.
- Ajuste por preferencias (DPO) sobre el checkpoint de SFT de continuacion, orientado a mejorar la calidad de las respuestas frente a la simple continuacion de texto.
- Capacidad multilingue: no disponible. El unico idioma declarado es el turco.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en turco: el modelo puede mantener dialogos multi-turno con contexto de hasta 32.768 tokens, suficiente para hilos largos de conversacion o para incluir documentos de referencia en el prompt sin truncar.
- Investigacion sobre alineamiento con DPO en modelos pequenos: al publicarse el checkpoint intermedio entre DPO y GRPO/RLVR, permite comparar el efecto de cada etapa sobre un mismo modelo base de 0,8 mil millones de parametros.
- Estudio de arquitecturas no estandar: las 18 capas con MorphFFN y el tokenizer propio NDSRF004 lo convierten en un caso de analisis para medir el impacto de disenos alternativos en modelos compactos.
- Despliegue en hardware muy limitado: con pesos Q4_K_M de aproximadamente 0,5 GB, el modelo puede ejecutarse en GPU de gama baja con 4 GB de VRAM o incluso en CPU, cubriendo escenarios de edge computing donde no cabe un modelo mayor.
- Generacion de texto turco a gran escala con restricciones de coste: al ser un modelo pequeno y cuantizado, es viable procesar volumenes elevados de peticiones en un unico acelerador, siempre que la calidad exigida sea moderada.
- Clasificacion, etiquetado y resumen de textos turcos: mediante prompts con el rol `sistem` se pueden definir tareas de extraccion o categorizacion sobre documentos que quepan en la ventana de contexto.
- Experimentacion con formatos GGUF no estandar: sirve para validar herramientas de conversion y de serializacion propias, dado que el artefacto usa la variante "Mercan v1" y no un GGUF convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 0,5 GB en Q4_K_M, coherente con el tamano del repositorio.
- VRAM para la cache KV: estimacion derivada del contrato de arquitectura (24 capas, 4 cabezas KV, head dim 128, FP16) de unos 48 KiB por token, lo que supone en torno a 1,6 GiB con los 32.768 tokens de contexto completo y aproximadamente 0,4 GiB con 8.192 tokens.
- VRAM total estimada: alrededor de 1,5 GB en uso con contexto corto y hasta 2,5-3 GB agotando la ventana de contexto, incluyendo overhead del runtime.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (por ejemplo GTX 1050 Ti, RTX 3050, RTX 4060) es suficiente; modelos como A100 o H100 no aportan ventaja por tamano, salvo para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo modernas, y tambien en inferencia solo CPU.
- Opciones de despliegue: no disponible. El artefacto se distribuye con extension `.mercan` y se describe como GGUF v3 con variante "Mercan v1"; la model card no confirma compatibilidad con llama.cpp, Ollama, vLLM ni TGI, y menciona un "Mercan runtime" propietario del que no se aporta enlace ni documentacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Datos de los modelos de referencia tomados de sus fichas publicas; conviene verificarlos antes de tomar decisiones.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Mercan 0.8B DPO Q4 | ~0,8 B | 32.768 | Turco | No disponible | `.mercan` (GGUF v3 variante propia) |
| Qwen2.5 0.5B | 0,49 B | 32.768 | Multilingue | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 1B | 1,24 B | 128.000 | Multilingue | Llama 3.2 Community License | safetensors, GGUF |
| SmolLM2 1.7B | 1,7 B | 8.192 | Multilingue (enfasis en ingles) | Apache 2.0 | safetensors, GGUF |

Nota: no se dispone de resultados de benchmarks de Mercan 0.8B DPO Q4, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. La ventaja diferencial de Mercan es su tokenizer y ajuste especificos para turco; sus desventajas son un formato propietario sin soporte confirmado en los runtimes habituales y la ausencia de licencia declarada.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion, lo que supone un riesgo legal relevante para cualquier despliegue en produccion.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni de ningun otro conjunto que permitan estimar la calidad real frente a alternativas.
- Modelo de 0,8 mil millones de parametros: capacidad limitada de razonamiento, matematicas y conocimiento factual, con expectativa elevada de alucinacion en preguntas abiertas o especializadas.
- Solo turco: no se declara soporte de otros idiomas, por lo que el rendimiento fuera del turco deberia considerarse no fiable.
- Etapa de alineamiento incompleta: la model card indica que existe una fase posterior de GRPO/RLVR no incluida, de modo que este artefacto no representa el modelo final de la cadena.
- Formato propietario: la extension `.mercan` y la variante "Mercan v1" no garantizan compatibilidad con llama.cpp, Ollama, vLLM u otras herramientas estandar; la conversion puede no ser trivial.
- Tokenizer propio (NDSRF004) con solo 32.002 filas de vocabulario: puede fragmentar mas el texto fuera del turco y complica la reutilizacion de herramientas existentes.
- Convencion de chat mixta: los IDs de control usan alias en ingles (`<|im_start|>`, `<|im_end|>`) mientras que las cabeceras de rol estan en turco, lo que exige respetar exactamente la plantilla para evitar degradacion.
- Contexto de 32.768 tokens declarado como ventana deslizante: no esta claro si la atencion efectiva sobre el contexto completo es plena, y no se documenta el comportamiento mas alla de esa longitud.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin comunidad ni issues que permitan validar el funcionamiento.
- Documentacion incompleta: no se detalla que es MorphFFN, ni los datos de entrenamiento, ni las recetas de inferencia recomendadas.

## Enlaces

- HuggingFace: https://huggingface.co/MercanAI/Mercan-0.8B-DPO-Q4
- Paper: no disponible
- Blog o articulo tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
- Documentacion del tokenizer NDSRF004: no disponible
