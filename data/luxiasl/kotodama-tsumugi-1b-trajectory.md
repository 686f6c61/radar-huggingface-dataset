# LuxiaSL/kotodama-tsumugi-1b-trajectory

## Resumen

kotodama-tsumugi 1B (trajectory) es el repositorio de trayectoria de preentrenamiento del modelo kotodama-tsumugi, un transformer decoder-only de 1,42 mil millones de parametros desarrollado por Luxia en colaboracion con Anima Labs. No se trata de un modelo final listo para uso, sino del conjunto completo de checkpoints intermedios generados durante el preentrenamiento sobre 100B tokens, publicado para estudiar la evolucion del modelo a lo largo del entrenamiento.

La arquitectura incorpora dos innovaciones destacables: un bloque de 20 capas que se ejecuta dos veces (looped transformer), lo que da 72 capas efectivas sobre 52 capas unicas con anchura 1536, y un mecanismo de attention residuals entre bloques cuyos limites se ajustaron a la geometria interna de capas del propio modelo en lugar de espaciarse uniformemente. El entrenamiento uso el optimizador Muon, batches de 2M tokens, contexto de 4K y tasa de aprendizaje constante durante los 100B tokens.

El objetivo declarado del proyecto es medir cuando se forma el binding de referentes durante el preentrenamiento, es decir, en que etapa de la progresion de cinco fases descrita en el Binding Atlas se situa el modelo y a que numero de tokens. Se publica bajo licencia Apache 2.0 y esta orientado exclusivamente a investigacion sobre dinamica de entrenamiento, no a despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capas looped y attention residuals entre bloques |
| Parametros totales | 1,42B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4K tokens (durante entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en (ingles dominante) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) y checkpoint.pt para estados resumibles |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 52 capas unicas con anchura 1536. Un bloque central de 20 capas se ejecuta dos veces, alcanzando 72 capas efectivas; las capas del bucle comparten pesos con el bloque central y safetensors almacena cada tensor una sola vez, por lo que es necesario restaurar las entradas compartidas desde `aliases.json` (`sd[alias] = sd[source]`) antes de cargar. El mecanismo de attention residuals enruta la atencion entre bloques cuyos limites se ajustaron a la geometria de capas del propio modelo, no a intervalos uniformes.

El entrenamiento cubre 100B tokens con el optimizador Muon, batch de 2M tokens, contexto de 4K y tasa de aprendizaje constante. Los datos son una mezcla curada con predominio del ingles que incluye codigo, papers cientificos, patentes, textos legales, libros, texto web, matematicas y fuentes conversacionales, con un suplemento conversacional de aproximadamente el 0,7% de los tokens. No se menciona RLHF ni DPO. Un detalle numerico relevante: el trunk calculo el enrutamiento AttnRes en fp64 bajo `torch.compile`; para reproducir esa numerica en runs que continuen desde estos checkpoints hay que activar `attnres_eps_fp64_compat: true`.

## Capacidades

- Generacion de texto autoregresiva propia de un modelo preentrenado en ingles.
- Modelado de codigo, matematicas, textos cientificos, legales y conversacionales segun la composicion del corpus.
- No incluye instruction tuning: no esta alineado para seguir instrucciones ni para formato conversacional de asistente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible como capacidad entrenada.
- Capacidades multilingues: limitadas al ingles como idioma dominante del corpus.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Utilidad principal: servir como serie temporal de checkpoints para analisis de dinamica de entrenamiento y formacion de binding de referentes.

## Casos de uso

- Investigacion sobre dinamica de preentrenamiento: los checkpoints cada 250M tokens hasta 4B y cada 1B hasta 100B permiten trazar la evolucion de metricas internas y de perdida a lo largo de todo el entrenamiento.
- Estudio de binding de referentes: el proposito declarado del repositorio es situar el modelo en la progresion de cinco fases del Binding Atlas y determinar el numero de tokens en que se alcanza cada etapa.
- Analisis de arquitecturas looped: la configuracion de 52 capas unicas con un bloque de 20 capas ejecutado dos veces permite comparar el comportamiento de capas compartidas frente a capas independientes a lo largo de la trayectoria.
- Evaluacion de attention residuals: los limites de bloque ajustados a la geometria del modelo se pueden contrastar con espaciados uniformes usando los mismos checkpoints como base.
- Reanudacion de experimentos de cooldown: las ramas `anneal…` y los estados completos en `anchor-step…` (pesos, momentos del optimizador, scheduler y posicion de datos) permiten bifurcar runs con decaimiento de learning rate desde puntos concretos.
- Reproduccion de numerica fp64: el flag `attnres_eps_fp64_compat` permite replicar exactamente el comportamiento del enrutamiento AttnRes original en experimentos derivados.
- Fine-tuning controlado desde un punto intermedio: partir de un checkpoint concreto (por ejemplo, a 10B o 50B tokens) para estudiar como el punto de partida condiciona el resultado de un ajuste posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio indica explicitamente que no contiene resultados de evaluacion ni instruction tuning.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,8-3,0 GB solo para pesos (1,42B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,5 GB de pesos; en 4 bits, alrededor de 0,8 GB (aunque el repositorio no publica pesos cuantizados).
- GPU recomendadas para el repositorio completo: el tamano del repo es de 749,9 GB, por lo que se necesita almacenamiento considerable; para cargar un unico checkpoint basta con una GPU consumer.
- Cabe en GPU consumer: si, un checkpoint individual en bf16 cabe en RTX 3060 12GB, RTX 4070, RTX 4090 y similares.
- Opciones de despliegue: el paquete `kotodama` (clase `KotodamaModel`, preset `1b-tsumugi`) es la via oficial; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kotodama-tsumugi 1B (trajectory) | 1,42B (72 capas efectivas) | 4K | Trayectoria completa de preentrenamiento con capas looped | Apache 2.0 | HuggingFace (LuxiaSL) |
| kotodama-tsumugi-1b (release) | 1,42B | 4K | Modelo final tras cooldown | Apache 2.0 | HuggingFace (LuxiaSL) |
| TinyLlama 1.1B | 1,1B | 2K-4K | Modelo final preentrenado, sin trayectoria publicada | Apache 2.0 | HuggingFace |
| Pythia 1.4B | 1,4B | 2K | Suite de checkpoints de trayectoria (154 checkpoints) | Apache 2.0 | HuggingFace |

La comparativa con TinyLlama y Pythia es aproximada en cuanto a categoria (modelos de ~1B con pesos abiertos); no se dispone de datos de rendimiento comparativo para kotodama-tsumugi en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo para produccion: es una trayectoria de preentrenamiento sin instruction tuning ni alineacion; no sigue instrucciones de forma fiable.
- Riesgo de alucinacion elevado: al ser un modelo base de 1,42B sin ajuste, la generacion puede ser incoherente o factualmente incorrecta.
- Sesgos: el corpus es de predominio ingles y de composicion curada (codigo, papers, patentes, leyes, libros, web), lo que puede introducir sesgos de dominio y de registro; no se documenta ninguna mitigacion.
- Limitacion de contexto: 4K tokens, insuficiente para tareas de contexto largo.
- Limitacion de idioma: solo ingles; el rendimiento en castellano no esta garantizado.
- Carga no trivial: es obligatorio restaurar los pesos compartidos de las capas looped desde `aliases.json` antes de cargar; omitirlo produce un modelo incorrecto.
- Numerica especifica: el enrutamiento AttnRes se calculo en fp64; sin `attnres_eps_fp64_compat: true` los runs derivados pueden divergir numericamente del original.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no esta pensado ni validado para ello.
- El repositorio ocupa 749,9 GB; descargarlo completo requiere planificacion de almacenamiento.
- Los datos de entrenamiento no se publican, lo que limita la auditoria del corpus.

## Enlaces

- HuggingFace: https://huggingface.co/LuxiaSL/kotodama-tsumugi-1b-trajectory
- Modelo final: https://huggingface.co/LuxiaSL/kotodama-tsumugi-1b
- Repositorio de codigo: https://github.com/anima-research/kotodama
- Paginas del proyecto: https://kotodama.animalabs.ai/
- Binding Atlas: https://kotodama.animalabs.ai/binding-atlas
- Anima Labs: https://animalabs.ai/
- Perfil del autor: https://x.com/kataletheia
- Claude (Anthropic): https://www.anthropic.com/claude
