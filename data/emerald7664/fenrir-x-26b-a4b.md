# Emerald7664/Fenrir-X-26B-A4B

## Resumen

Fenrir-X-26B-A4B es un modelo de lenguaje multimodal (entrada de imagen y texto) publicado por el usuario Emerald7664 en HuggingFace. No es un modelo entrenado desde cero: se trata de un merge construido con mergekit a partir de cinco modelos derivados de la familia Gemma, tomando como base `google/gemma-4-26B-A4B-it` y combinándolo con `TeichAI/gemma-4-26B-A4B-it-Claude-Opus-Distill-v2`, `Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2`, `electroglyph/gemma4-26b-fiction-bf16` y `Darkhn/Gemma-4-26B-A4B-Animus-V14.1-FFT`. El objetivo declarado por el autor es fusionar capacidades de rol, escritura creativa y razonamiento en un único checkpoint.

El modelo tiene 25.805.936.206 parámetros totales según los pesos en safetensors, con un repositorio de 51,6 GB. La nomenclatura A4B de los modelos base y los filtros de fusión sobre capas `experts.gate_up_proj` y `experts.down_proj` indican una arquitectura de mezcla de expertos (MoE), aunque el número exacto de parámetros activos no se especifica. El pipeline declarado es `image-text-to-text`, lo que implica capacidad de procesar imágenes además de texto.

Su relevancia es limitada y muy acotada: es un merge de nicho orientado a roleplay, narrativa larga y ficción interactiva, publicado el 27 de septiembre de 2026, sin descargas ni valoraciones registradas en el momento de la consulta y sin resultados de benchmarks publicados. Resulta interesante como ejemplo de merge quirúrgico por módulo sobre una arquitectura MoE multimodal, pero no como modelo de propósito general evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con mezcla de expertos (MoE) y capacidades multimodales imagen-texto (inferida de los tags y del pipeline; no confirmada en la model card) |
| Parametros totales | 25.805.936.206 (25,8 mil millones, dato real de safetensors) |
| Parametros activos | no disponible (la nomenclatura A4B sugiere del orden de 4 mil millones, sin confirmacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada en el repositorio) |
| Formato de pesos | safetensors (salida en bfloat16, `out_dtype: bfloat16`) |
| Tamano del repositorio | 51,6 GB |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Metodo de merge | BSC (mergekit) con gain 0.95, balance 0.95, synthesis 0.92, anchor 0.92 |
| Modelos base | google/gemma-4-26B-A4B-it; TeichAI/gemma-4-26B-A4B-it-Claude-Opus-Distill-v2; Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2; electroglyph/gemma4-26b-fiction-bf16; Darkhn/Gemma-4-26B-A4B-Animus-V14.1-FFT |
| Fecha de publicacion | 27 de septiembre de 2026 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

No hay entrenamiento: Fenrir-X-26B-A4B es exclusivamente un merge de pesos. La model card documenta la configuración completa de mergekit, con `base_model` fijado en `google/gemma-4-26B-A4B-it` y cuatro modelos contribuyentes fusionados mediante el método BSC. Los pesos se calculan en `float32` y se serializan en `bfloat16`. La presencia de filtros específicos para `self_attn.q_proj`, `self_attn.k_proj`, `self_attn.v_proj`, `self_attn.o_proj`, `mlp.gate_proj`, `mlp.up_proj`, `mlp.down_proj`, `experts.gate_up_proj` y `experts.down_proj` confirma una estructura de transformer con capas de expertos y atención estándar.

La innovación técnica está en el reparto de pesos por módulo, con vectores de cinco valores por filtro (probablemente correspondientes a franjas de profundidad de la red). Dos patrones destacan. Primero, los pesos de atención se concentran en `Pantheon-Reasoning` (0,13-0,31 en q/k/v/o) y en `Claude-Opus-Distill` (0,09-0,28), mientras que `gemma4-26b-fiction-bf16` aporta más a las capas MLP y expertas (hasta 0,34 en `mlp.gate_proj`). Segundo, `Gemma-4-26B-A4B-Animus-V14.1-FFT` solo contribuye a las capas de expertos, con los pesos más altos de toda la configuración (hasta 0,40 en `experts.down_proj`), lo que sugiere una inyección deliberada de comportamiento conversacional en el enrutado de expertos sin tocar atención ni MLP. El tokenizador se hereda del modelo base (`source: base`) y la plantilla de chat se toma automáticamente (`chat_template: auto`). No se documentan datos de entrenamiento, número de tokens, composición del dataset, ni fases de RLHF o DPO, porque no existen: el merge no aporta datos nuevos.

## Capacidades

- Generacion de texto conversacional y narrativo de forma larga.
- Roleplay con personajes: interaccion guiada por persona, dialogo, escenas emocionales y consistencia de caracter.
- Escritura creativa: ficcion, descripcion atmosferica, estilo y prosa imaginativa.
- Storytelling: narrativas extensas, construccion de mundo, continuidad argumental y tramas con multiples personajes.
- Ficcion interactiva: narrativas ramificadas y escenarios que evolucionan segun la interaccion.
- Procesamiento de imagenes como entrada (pipeline `image-text-to-text` declarado), con capacidad de vision heredada del modelo base Gemma multimodal; el alcance concreto no esta documentado.
- Capacidad de razonamiento: presumiblemente heredada de `Pantheon-Reasoning-26B-A4B-1.1-V2`, que recibe pesos altos en todas las proyecciones de atencion; no hay evaluaciones que lo confirmen.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas soportados).
- Modo de pensamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Motores de roleplay para aplicaciones de chat con personajes: el merge combina pesos de atencion de un modelo afinado con destilaciones de Claude Opus y de un modelo de razonamiento, lo que apunta a dialogos mas coherentes en turnos largos y con personalidad sostenida.
- Escritura de ficcion asistida en talleres literarios: la contribucion fuerte de `gemma4-26b-fiction-bf16` en MLP y expertos esta pensada para prosa descriptiva y atmosferica, adecuada para borradores de relato y novela.
- Generacion de narrativa ramificada para videojuegos y novelas visuales: el modelo esta declarado para ficcion interactiva, de modo que puede generar opciones de rama y continuar cada una manteniendo continuidad de personajes.
- Creacion de campanas de rol de mesa: el modelo puede actuar como director de juego improvisando PNJ, escenas y consecuencias a partir del estado narrado por los jugadores.
- Prototipado de personajes conversacionales para demos y pruebas de producto: al ser un merge con licencia apache-2.0 declarada, es rapido de desplegar en entornos de prototipo sin reentrenamiento.
- Generacion de contenido narrativo para campanas de marketing o transmedia: permite producir texto con tono consistente en series largas de piezas y mantener el registro entre entregas.
- Experimentacion en investigacion sobre tecnicas de merge: la configuracion publicada, con pesos por modulo y por franja de profundidad, sirve como caso de estudio reproducible para comparar tecnicas de fusion en arquitecturas MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones (MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra) y la busqueda web realizada no ha devuelto ningun resultado relevante sobre el modelo: los unicos resultados obtenidos son portales de juegos en neerlandes, sin relacion alguna con el modelo. En consecuencia, no es posible comparar su rendimiento con alternativas mediante numeros.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento real de parametros (25,8 mil millones); no son datos publicados por el autor.

- Pesos en bfloat16: 25,8 mil millones de parametros x 2 bytes = unos 51,6 GB, coincidente con el tamano del repositorio. Con cache KV y activaciones, se necesitan del orden de 56-64 GB de VRAM.
- GPU de datacenter recomendadas para bfloat16: H100 80 GB, A100 80 GB o A100 40 GB en configuracion multi-GPU. Una sola A100 40 GB no es suficiente en precision completa.
- Inferencia en FP8 o INT8: en torno a 26-32 GB de VRAM, lo que encaja en A100 40 GB, L40S 48 GB, RTX 6000 Ada 48 GB o dos RTX 4090.
- Cuantizacion de 4 bits (Q4): aproximadamente 14-16 GB de pesos, viable en una RTX 4090, RTX 3090 o RTX 4080 de 24 GB, con margen para contexto moderado. En GPUs de 16 GB queda muy justo.
- Cuantizacion de 5-6 bits: aproximadamente 18-21 GB, comoda en tarjetas de 24 GB.
- Al ser presumiblemente MoE con del orden de 4 mil millones de parametros activos, el coste computacional por token deberia parecerse al de un modelo denso de ese tamano, con throughput elevado siempre que todos los expertos residan en memoria (o se acepte offload, que penaliza la latencia).
- Opciones de despliegue: `transformers` de forma nativa (es la libreria declarada). vLLM y TGI son viables si soportan la arquitectura exacta de Gemma multimodal MoE empleada. llama.cpp y Ollama requeririan convertir los pesos a GGUF, ya que el repositorio solo publica safetensors en bfloat16 y no incluye cuantizaciones listas para usar.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo.

## Comparativa con modelos similares

Los unicos modelos directamente comparables son los propios componentes del merge, ya que no hay evaluaciones de terceros. La tabla recoge lo que consta en la informacion disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fenrir-X-26B-A4B | 25,8 mil millones (MoE) | no disponible | sin benchmarks publicados | apache-2.0 declarada | safetensors en HuggingFace |
| google/gemma-4-26B-A4B-it | 26B (MoE, A4B) | no disponible | no disponible | no disponible en esta ficha | modelo base oficial |
| TeichAI/gemma-4-26B-A4B-it-Claude-Opus-Distill-v2 | 26B (MoE) | no disponible | no disponible | no disponible | HuggingFace |
| Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 | 26B (MoE) | no disponible | no disponible | no disponible | HuggingFace |
| electroglyph/gemma4-26b-fiction-bf16 | 26B (MoE) | no disponible | no disponible | no disponible | HuggingFace |
| Darkhn/Gemma-4-26B-A4B-Animus-V14.1-FFT | 26B (MoE) | no disponible | no disponible | no disponible | HuggingFace |

Alternativas de otras familias (Qwen, Llama, Mistral) en el rango de 20-30 mil millones de parametros con soporte multimodal: no disponibles en la informacion proporcionada. No se dispone de datos de rendimiento de ninguna de ellas en esta ficha, por lo que cualquier comparacion numerica seria inventada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el modelo no tiene benchmarks, ni evaluaciones humanas, ni pruebas de regresion publicadas. No hay evidencia objetiva de que el merge haya mejorado a sus componentes.
- Cero adopcion registrada: 0 descargas y 0 valoraciones en el momento de la consulta. No existe retroalimentacion de la comunidad sobre su comportamiento real.
- Riesgo de degradacion por merge: la fusion de pesos puede producir artefactos, perdida de capacidades o respuestas degeneradas, especialmente en capas de expertos, donde los pesos de `Animus-V14.1-FFT` llegan a 0,40 y se combinan con los de otros tres modelos.
- Sesgo hacia roleplay y ficcion: los modelos contribuyentes estan afinados para conversacion y narrativa. Se puede esperar un rendimiento inferior en tareas de codigo, matematicas, razonamiento formal o instruccion tecnica estricta.
- Riesgo de alucinacion: inherente a los modelos generativos y probablemente acentuado en un merge de modelos de ficcion, que estan optimizados para producir texto verosimil mas que factual.
- Idiomas no declarados: se desconoce el soporte multilingue real. No hay garantia de un comportamiento correcto en castellano.
- Longitud de contexto desconocida: no se puede planificar un caso de uso que dependa de ventanas largas sin medirla previamente.
- Capacidades multimodales sin documentar: el pipeline declara imagen-texto, pero la model card no describe el alcance de la vision ni tareas soportadas.
- Incoherencia de licencia: el repositorio declara apache-2.0, mientras que el modelo base pertenece a la familia Gemma de Google, habitualmente distribuida bajo sus propios terminos de uso. Antes de cualquier uso comercial hay que verificar que la licencia declarada por el autor del merge es aplicable y compatible con la del modelo base original.
- Ausencia de formatos de cuantizacion: no hay GGUF ni otras variantes publicadas, lo que obliga a convertirlas manualmente para desplegar en hardware de consumo.
- Reproducibilidad limitada: el autor publica la configuracion de mergekit, pero no la semilla ni el entorno exacto, y no hay versionado posterior (el repositorio no se ha actualizado desde su creacion).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Emerald7664/Fenrir-X-26B-A4B
- Modelo base principal: https://huggingface.co/google/gemma-4-26B-A4B-it
- TeichAI/gemma-4-26B-A4B-it-Claude-Opus-Distill-v2: https://huggingface.co/TeichAI/gemma-4-26B-A4B-it-Claude-Opus-Distill-v2
- Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2: https://huggingface.co/Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2
- electroglyph/gemma4-26b-fiction-bf16: https://huggingface.co/electroglyph/gemma4-26b-fiction-bf16
- Darkhn/Gemma-4-26B-A4B-Animus-V14.1-FFT: https://huggingface.co/Darkhn/Gemma-4-26B-A4B-Animus-V14.1-FFT
- Paper, blog o repositorio adicional del autor: no disponible
- Demo o espacio de prueba: no disponible
