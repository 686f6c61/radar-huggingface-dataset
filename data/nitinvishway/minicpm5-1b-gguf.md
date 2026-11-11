# nitinvishway/MiniCPM5-1B-GGUF

## Resumen

MiniCPM5-1B es un modelo de lenguaje causal denso de 1.080.632.832 parametros (679.552.512 sin contar los embeddings), desarrollado por OpenBMB como primera entrega de la serie MiniCPM5. Está pensado para despliegue local, en dispositivo y en entornos con recursos limitados: asistentes de escritorio, agentes de codigo y flujos de tool calling que no pueden permitirse un modelo grande. La arquitectura es un transformer estandar `LlamaForCausalLM` de 24 capas con atencion GQA (16 cabezas de consulta y 2 de clave-valor) y una ventana de contexto nativa de 131.072 tokens.

Su relevancia actual reside en dos ejes. Por un lado, combina razonamiento hibrido —un mismo checkpoint sirve como asistente rapido y como razonador deliberado mediante la plantilla `<think>` y el flag `enable_thinking`— con soporte nativo de contexto largo y tool calling. Por otro, el entrenamiento sigue la receta de gestion de datos por niveles UltraData, con corpus publicados junto al modelo (Ultra-FineWeb, Ultra-FineWeb-L3, UltraData-Math, UltraData-SFT-2605), lo que permite reproducibilidad parcial del pipeline.

La ficha describe la distribucion GGUF publicada por el usuario `nitinvishway`, que empaqueta los pesos del modelo original de OpenBMB en formato llama.cpp para su uso con llama.cpp, Ollama y LM Studio. El repositorio ocupa 4,0 GB e incluye las cuantizaciones habituales del ecosistema GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso, `LlamaForCausalLM` |
| Parametros totales | 1.080.632.832 |
| Parametros activos | no aplica (modelo denso) |
| Parametros sin embeddings | 679.552.512 |
| Capas | 24 |
| Cabezas de atencion | 16 Q / 2 KV (GQA) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | GGUF (repositorio de 4,0 GB; el autor no detalla los niveles concretos en la informacion disponible) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp); el modelo original se distribuye en BF16 safetensors |
| Libreria | llama.cpp |
| Pipeline | text-generation |
| Modos de chat | Think / No Think (`enable_thinking`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso convencional con normalizacion y atencion por grupo (GQA), 24 capas y 1.080 millones de parametros totales, de los cuales solo 679 millones son no-embedding. Esta eleccion de arquitectura estandar facilita la compatibilidad con el ecosistema llama.cpp y con frameworks de inferencia genericos, sin kernels especializados. El contexto nativo alcanza 131.072 tokens, lo que en un modelo de este tamano es poco habitual y habilita tareas de recuperacion y agentes con historiales largos.

El entrenamiento se organiza en tres fases: preentrenamiento base (con fase estable y fase de decaimiento), mid-training para reforzar capacidades objetivo y adaptar la distribucion de datos, y post-entrenamiento. Este ultimo consta de SFT con 200.000 millones de tokens de datos de "deep-thinking" y otros 200.000 millones de "hybrid-thinking", seguido de RL con profesores especializados en matematicas, codigo, QA a libro cerrado y escritura, y finalmente On-Policy Distillation (OPD) para consolidar esos profesores en un unico modelo de publicacion. Los corpus empleados se publican como Ultra-FineWeb, Ultra-FineWeb-L3, UltraData-Math y UltraData-SFT-2605. La model card no detalla el numero total de tokens de preentrenamiento ni la composicion exacta del dataset base.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento deliberado con modo "thinking" activable mediante `enable_thinking` y la plantilla `<think>`; el mismo checkpoint funciona en modo rapido sin razonamiento extendido.
- Tool calling y function calling, con ventaja declarada por el autor frente a modelos de su clase en uso agentico de herramientas.
- Generacion de codigo y tareas de programacion, incluyendo agentes de codigo locales.
- Razonamiento matematico, reforzado mediante RL con profesores especializados.
- Contexto largo nativo de 131.072 tokens, adecuado para documentos extensos y conversaciones con historial amplio.
- Capacidades multilingues limitadas a ingles y chino segun la model card.
- No se declaran capacidades de vision, audio ni multimodalidad en la informacion disponible.

## Casos de uso

- Asistente de escritorio local: integrado en aplicaciones tipo "desktop pet" o asistentes personales que corren en el propio equipo del usuario, aprovechando el tamano de 1B y el contexto de 131k para mantener historiales largos sin enviar datos a la nube.
- Agente de codigo en el IDE: el modelo puede invocar herramientas (lectura de ficheros, ejecucion de comandos, busqueda) mediante tool calling y alternar entre modo rapido para autocompletado y modo thinking para depuracion compleja.
- Automatizacion de soporte tecnico: conversaciones multi-turno con contexto largo que permiten adjuntar manuales o transcripciones extensas y mantener coherencia a lo largo de la sesion.
- Procesamiento de documentos largos en local: resumen, extraccion y QA sobre contratos, informes o articulos que superan la ventana tipica de modelos pequenos, gracias a los 131.072 tokens de contexto.
- Pipelines de CI/CD con agentes: tareas de revision de codigo, generacion de parches o clasificacion de errores ejecutadas en runners sin GPU dedicada, usando cuantizaciones GGUF en CPU.
- Prototipado y evaluacion de agentes: al ser un modelo pequeno con licencia Apache 2.0, sirve para iterar sobre disenos de agentes y prompts antes de escalar a modelos mayores, con coste de inferencia minimo.
- Despliegue en dispositivos edge: asistentes embebidos en equipos con poca VRAM o incluso solo CPU, donde un modelo de 1B cuantizado a 4 bits ocupa pocos cientos de MB.

## Benchmarks y rendimiento

El autor declara en la model card que MiniCPM5-1B alcanza SOTA open source en la clase 1B frente a LFM2.5-1.2B-Thinking, Qwen3-0.6B/think y Qwen3.5-0.8B/think, con ventaja en tool use, generacion de codigo y razonamiento dificil. Sin embargo, la informacion proporcionada no incluye la tabla numerica de resultados (MMLU, HumanEval, GSM8K u otros), solo las imagenes de leaderboard referenciadas en la model card original.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: un modelo de 1,08B parametros ocupa aproximadamente 2,2 GB en BF16, 1,1 GB en cuantizacion de 8 bits y en torno a 0,6-0,7 GB en 4 bits, mas el espacio de cache KV para el contexto.
- Contexto largo: con 131.072 tokens, la cache KV con GQA (2 cabezas KV, 24 capas) crece de forma notable; para contextos muy largos conviene reservar varios GB adicionales o reducir la ventana efectiva.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) es mas que suficiente; tambien tarjetas de 8 GB o menos. En entornos de servidor, A100/H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU discretas actuales, e incluso en iGPU con memoria unificada.
- CPU: viable en inferencia solo-CPU con llama.cpp usando cuantizaciones de 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio (via GGUF); el modelo original admite vLLM, TGI y MLX (variante especifica para Apple Silicon).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiniCPM5-1B | 1,08B | 131.072 | Apache 2.0 | Razonamiento hibrido, tool calling, GGUF/MLX/BF16 |
| Qwen3-0.6B | 0,6B | no disponible en la informacion | Apache 2.0 | Modo thinking; baseline citado por el autor |
| Qwen3.5-0.8B | 0,8B | no disponible en la informacion | no disponible en la informacion | Modo thinking; baseline citado por el autor |
| LFM2.5-1.2B-Thinking | 1,2B | no disponible en la informacion | no disponible en la informacion | Enfocado a razonamiento; baseline citado por el autor |

El autor situa a MiniCPM5-1B por delante de estos tres modelos en la clase 1B, especialmente en tool use, codigo y razonamiento, aunque no se aportan cifras en la informacion disponible. En cuanto a contexto, los 131.072 tokens son el dato diferencial mas claro frente a modelos de tamano comparable.

## Limitaciones y advertencias

- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; al entrenarse sobre corpus web (Ultra-FineWeb), es esperable heredar sesgos de esos datos.
- Alucinacion: como todo modelo de 1B, la tasa de alucinacion en tareas de conocimiento factual es mayor que en modelos grandes; el modo thinking mitiga pero no elimina el problema.
- Idiomas: solo ingles y chino declarados; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto: aunque la ventana es de 131.072 tokens, la calidad de recuperacion en posiciones lejanas no se documenta; conviene validar en el caso de uso concreto.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales conocidas, pero esta ficha describe una redistribucion GGUF de terceros (`nitinvishway`) cuyo mantenimiento y verificacion de integridad no estan garantizados por OpenBMB.
- Produccion: el repositorio GGUF de terceros tiene 0 descargas y 0 likes en el momento de la consulta; para produccion es preferible usar el repositorio oficial `openbmb/MiniCPM5-1B-GGUF`.
- Cuantizacion: la informacion no detalla que niveles GGUF incluye el repositorio; verificar antes de desplegar.

## Enlaces

- Repositorio GGUF de terceros: https://huggingface.co/nitinvishway/MiniCPM5-1B-GGUF
- Modelo oficial BF16: https://huggingface.co/openbmb/MiniCPM5-1B
- Checkpoint SFT: https://huggingface.co/openbmb/MiniCPM5-1B-SFT
- Checkpoint base: https://huggingface.co/openbmb/MiniCPM5-1B-Base
- GGUF oficial: https://huggingface.co/openbmb/MiniCPM5-1B-GGUF
- Variante MLX: https://huggingface.co/openbmb/MiniCPM5-1B-MLX
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- MiniCPM Tech Report: https://arxiv.org/pdf/2506.07900
- Documentacion (chino): https://openbmb.cn/docs/
- UltraData: https://ultradata.openbmb.cn/
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-1B-Demo
- MiniCPM Desk Pet: https://github.com/OpenBMB/MiniCPM-Desk-Pet
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
- Paper de gestion de datos UltraData: https://arxiv.org/pdf/2602.09003
