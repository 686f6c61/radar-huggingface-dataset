# Siddharthpixel/astrnya-core-v1

## Resumen

Astrnya-Core-v1 es un modelo neuronal de 501,97 millones de parámetros publicado en Hugging Face por el usuario Siddharthpixel bajo licencia MIT. A diferencia de un modelo de lenguaje generativo convencional, se presenta como un motor de inferencia especializado en IA para videojuegos, pensado como microservicio sidecar para NPC dinámicos, combate táctico de jefes, dirección de historia adaptativa y generación procedural de misiones. La arquitectura declarada es DMFT V2.1 (Dilated Causal MoE-SSM), un híbrido de mezcla de expertos dispersa con estado espacial y atención causal dilatada.

El modelo declara un campo receptivo causal exacto de 2.047 tokens distribuido en diez "pisos" concéntricos con dilataciones de 1 a 512, y afirma una invariancia numérica de cero fugas causales (Δ = 0,00000000). Emplea enrutamiento Top-2 disperso con equilibrio de carga por pérdida auxiliar y cuantización dinámica INT8 automática en modo CPU, con un consumo declarado inferior a 2,2 GB de RAM.

Su relevancia es acotada y debe contextualizarse: se trata de un proyecto indie con cero descargas y cero likes en el momento de la ficha, cuya distribución de pesos depende de un kernel de Kaggle externo y no de los ficheros del repositorio de Hugging Face. No hay información sobre datos de entrenamiento, benchmarks ni idiomas soportados, y la model card mezcla especificaciones técnicas con instrucciones de despliegue, lo que obliga a tratar muchas afirmaciones como no verificadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DMFT V2.1 Dilated Causal MoE-SSM (híbrido de mezcla de expertos dispersa y modelo de espacio de estados con atención causal dilatada) |
| Parámetros totales | 501.970.404 (~501,97 M) |
| Parámetros activos | no disponible (enrutamiento Top-2, número de expertos no especificado) |
| Longitud de contexto | 2.047 tokens (campo receptivo causal exacto, 10 pisos con dilataciones 1 a 512) |
| Tipos de cuantización | INT8 dinámico (`torch.ao.quantization.quantize_dynamic`) en modo CPU; no se documentan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible en el repositorio; la model card indica descarga automática desde el kernel de Kaggle `whitephantom11/dmft-v2-1-qwen-distillation` |

## Arquitectura y entrenamiento

La arquitectura declarada es DMFT V2.1, un híbrido de mezcla de expertos dispersa (Top-2) con componentes de espacio de estados y atención causal dilatada organizada en diez niveles concéntricos con factores de dilatación de 1, 2, 4, ..., 512. El campo receptivo resultante se fija en 2.047 tokens. El enrutamiento incorpora una pérdida auxiliar de equilibrio de carga entre expertos, aunque no se especifica el número total de expertos ni la proporción de parámetros activos por token. La model card afirma una invariancia causal numérica verificada (Δ = 0,00000000), es decir, ausencia de filtración de información futura, pero no se aporta el protocolo de verificación.

No hay información disponible sobre el volumen de tokens de entrenamiento, la composición del corpus, el uso de RLHF, DPO u otras técnicas de alineación, ni sobre el proceso de destilación. El nombre del kernel de Kaggle del que se descargan los pesos (`dmft-v2-1-qwen-distillation`) sugiere una destilación a partir de un modelo de la familia Qwen, pero este extremo no se confirma en la documentación. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal más allá de la descripción arquitectónica general.

## Capacidades

- Generación de diálogo para NPC con puntuación dinámica de confianza y etiquetas whitelisteadas de tipo `<EMOTE>` y `<ANIM>`.
- Comportamiento táctico de jefes: reacción en tiempo real a patrones de combate del jugador, como curarse tras cubrirse o esquivar con rodada.
- Dirección de historia emergente y ajuste dinámico de dificultad (DDA) ante comportamientos no previstos del jugador.
- Generación procedural de misiones secundarias ramificadas con objetivos, pistas y recompensas.
- Interfaz HTTP con endpoint `/decide` que acepta un `session_id`, un `role` (NPC, BOSS, DIRECTOR, QUEST_GEN) y un `prompt_data` estructurado.
- Integración documentada con Unity (C#), Godot 4 (GDScript) y Unreal Engine 5 (C++).
- No se documenta soporte de tool calling genérico, razonamiento multi-paso abierto, matemáticas, código, visión, audio ni modo de pensamiento. Las capacidades multilingües no están especificadas.

## Casos de uso

- Diálogo de NPC en tiempo real: el modelo recibe el texto del jugador y el nombre del NPC en `prompt_data` y devuelve una acción parseada con diálogo y emotes; su campo receptivo de 2.047 tokens cubre el historial reciente de una conversación de juego sin necesidad de ventanas largas.
- Combate de jefes adaptativo: con el rol `BOSS`, el motor consume patrones de combate del jugador y selecciona reacciones tácticas (cubrirse, curarse, esquivar), adecuado por su baja latencia declarada y su ejecución en CPU con INT8 dinámico.
- Dirección de historia dinámica: el rol `DIRECTOR` permite redirigir tramas ante decisiones inesperadas del jugador y aplicar reglas de piedad del DDA, un caso donde el contexto corto es suficiente porque el estado persistente vive en el servidor de juego.
- Generación de misiones secundarias: el rol `QUEST_GEN` produce misiones ramificadas con objetivos, pistas y recompensas a partir de la configuración de mundo en `game_config.json`, útil para contenido procedural en estudios pequeños.
- Prototipado rápido en motores comerciales: los fragmentos listos para Unity, Godot 4 y Unreal Engine 5 permiten conectar un cliente HTTP al endpoint `/decide` sin escribir lógica de inferencia propia, lo que reduce el coste de integración en equipos sin especialistas en ML.
- Despliegue gratuito como sidecar: la model card documenta el despliegue en Hugging Face Spaces con SDK Docker y hardware gratuito de 2 vCPU y 16 GB de RAM, lo que encaja en proyectos indie con presupuesto cero y tráfico moderado.
- Estudio de arquitecturas híbridas MoE-SSM: por su licencia MIT y su tamaño contenido, puede servir como banco de pruebas académico para investigar enrutamiento disperso y campos receptivos dilatados, siempre que se validen de forma independiente las afirmaciones de invariancia causal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de calidad de diálogo, coherencia narrativa o latencia medida.

## Requisitos de hardware

- VRAM/RAM estimada: la model card declara ejecución en modo CPU con cuantización INT8 dinámica por debajo de 2,2 GB de RAM. En FP32, 501,97 M de parámetros equivalen a aproximadamente 2 GB de pesos; en FP16, unos 1 GB; en INT8, unos 0,5 GB, a los que hay que sumar el estado del runtime y las activaciones.
- GPU recomendadas: no disponibles en la documentación. Por tamaño, cualquier GPU consumer con 4 GB o más de VRAM debería poder alojar los pesos en FP16, pero no se confirma compatibilidad con CUDA ni con kernels optimizados.
- GPU consumer: previsiblemente sí en tarjetas como RTX 3060, RTX 4060 o superiores, aunque el fabricante solo documenta el modo CPU.
- Opciones de despliegue: servidor propio `dmft_game_brain_server.py` en el puerto 8000 (7860 en Docker), Hugging Face Spaces con SDK Docker, y descarga de pesos vía `bootstrap_weights.py` desde un kernel de Kaggle. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card califica el motor de "high-throughput" sin aportar cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Astrnya-Core-v1 | 501,97 M | 2.047 tokens | MoE-SSM para IA de videojuegos | MIT | Pesos vía Kaggle, no en el repo de HF |
| Qwen2.5-0.5B | ~500 M | 32.768 tokens | LLM generativo denso | Apache 2.0 | Pesos en Hugging Face |
| SmolLM2-360M | 360 M | 8.192 tokens | LLM generativo denso | Apache 2.0 | Pesos en Hugging Face |
| Phi-3-mini | 3.800 M | 4.096 tokens | LLM generativo denso | MIT | Pesos en Hugging Face |

La comparación es aproximada: Astrnya-Core-v1 no es un LLM de propósito general y no publica métricas que permitan contrastar calidad. Frente a los modelos de la tabla, su ventaja declarada es la especialización en roles de juego y el consumo reducido en CPU; su desventaja es un contexto mucho menor (2.047 frente a 8.192-32.768 tokens), la ausencia de benchmarks y un canal de distribución de pesos poco convencional. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al no especificarse el corpus de entrenamiento ni los idiomas, no es posible evaluar sesgos lingüísticos, culturales o de género.
- Riesgo de alucinación: no evaluado. En roles de director de historia o generador de misiones, la producción de contenido incoherente con el lore es un riesgo plausible que requiere validación en el servidor de juego.
- Contexto limitado: el campo receptivo de 2.047 tokens es muy inferior al de los LLM actuales; la memoria de conversación debe gestionarse externamente en el cliente o el servidor de juego.
- Idiomas: no disponibles. No hay garantía de soporte del castellano ni de otros idiomas distintos del inglés.
- Licencia: MIT permite uso comercial y modificación, pero la licencia del kernel de Kaggle del que se descargan los pesos no se especifica y podría imponer condiciones adicionales.
- Distribución de pesos: los ficheros no están en el repositorio de Hugging Face; el despliegue depende de credenciales de Kaggle (`KAGGLE_USERNAME`, `KAGGLE_KEY`) y de la disponibilidad del kernel `whitephantom11/dmft-v2-1-qwen-distillation`, lo que introduce un punto único de fallo.
- Afirmaciones no verificadas: la invariancia causal con Δ = 0,00000000, el consumo inferior a 2,2 GB de RAM y el calificativo "high-throughput" no van acompañados de protocolo de medición ni de artefactos reproducibles.
- Madurez del proyecto: cero descargas y cero likes en el momento de la ficha, sin pipeline declarado ni resultados de evaluación; no se recomienda su uso en producción sin una validación independiente.
- Contenido de la model card: mezcla especificaciones con instrucciones operativas y scripts de despliegue, lo que dificulta distinguir hechos verificados de afirmaciones de marketing.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Siddharthpixel/astrnya-core-v1
- Kernel de Kaggle con los pesos: https://www.kaggle.com/code/whitephantom11/dmft-v2-1-qwen-distillation
- Hugging Face Spaces (documentación de despliegue): https://huggingface.co/spaces
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
