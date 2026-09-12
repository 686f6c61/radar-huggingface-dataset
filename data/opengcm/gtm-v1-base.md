# OPENGCM/GTM-v1-base

## Resumen

GTM-v1-base (Generative Testing Model) es un modelo de lenguaje base de tipo decoder-only, estilo nanoGPT, desarrollado por OPENGCM y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo entrenado desde cero (from scratch) sobre aproximadamente 2.950 millones de tokens, con 133.914.880 parámetros según el recuento real de los pesos en safetensors (la model card declara ~101,6 M con embeddings de entrada y cabeza de salida atados). Su arquitectura consta de 14 capas, 10 cabezas de atención, dimensión de embedding de 640 y una longitud de contexto de 1024 tokens.

El problema que aborda no es el de un asistente listo para producción, sino el de servir como artefacto de investigación reproducible: demuestra que es posible preentrenar un transformer pequeño desde cero en una única GPU de workstation (RTX Pro 6000) reutilizando recetas eficientes recientes, en concreto un optimizador híbrido Muon + AdamW. Es relevante ahora porque la comunidad de IA abierta está muy centrada en modelos pequeños (SLM) y en la eficiencia del preentrenamiento en hardware reducido, y este repositorio publica no solo los pesos, sino también el código del modelo (`model.py`), el `config.json` y la composición exacta del dataset.

Es importante subrayar que es un modelo base sin ajuste por instrucciones (no instruction-tuned) y sin RLHF/DPO: completa texto, no sigue órdenes ni responde preguntas de forma fiable. Su mezcla de datos excluye deliberadamente corpus de código y no incluye ajuste para precisión factual, por lo que debe tratarse como material de investigación y experimentación, nunca como sistema de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo nanoGPT |
| Parametros totales | 133.914.880 (recuento real en safetensors); la model card declara ~101,6 M con embeddings y cabeza de salida atados |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible: solo se publican pesos en fp32; no hay versiones GGUF, int8 ni int4 oficiales |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 para los contenidos del repositorio (pesos, `model.py` y README); los datasets de entrenamiento conservan sus propias licencias |
| Formato de pesos | safetensors en fp32, acompañados de `model.py` (PyTorch) y `config.json` |
| Capas | 14 |
| Cabezas de atencion | 10 |
| Dimension de embedding | 640 |
| Vocabulario | 50.257 (BPE de GPT-2 vía `tiktoken`) |
| Optimizador | Muon (matrices de pesos 2D) + AdamW (embeddings, layernorms y sesgos) |
| Precision de entrenamiento | bf16 con autocast; pesos publicados en fp32 |
| Tokens de entrenamiento | ~2.950 millones (30.000 pasos x batch efectivo 96 x contexto 1024) |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 descargas / 3 likes |
| Fecha de creacion | 2026-09-12 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo nanoGPT con 14 bloques, 10 cabezas de atención (dimensión de cabeza de 64 sobre un embedding de 640) y atención implementada mediante la función fusionada `scaled_dot_product_attention` de PyTorch, que emplea el kernel de flash-attention. El tokenizador no es propio: se reutiliza la codificación BPE de GPT-2 a través de `tiktoken`, con un vocabulario de 50.257 entradas. El modelo tiene embeddings y cabeza de salida atados (weight-tied), y no es un `AutoModel` de `transformers`, sino una implementación en PyTorch plano que requiere el `model.py` incluido en el repositorio para cargarse.

El entrenamiento se realizó desde cero sobre aproximadamente 2.950 millones de tokens (30.000 pasos con batch efectivo 96 y contexto de 1024, lo que da 2.949.120.000 tokens), en una única GPU RTX Pro 6000 y con autocast en bf16. La innovación técnica destacable es el uso de un optimizador híbrido Muon + AdamW, siguiendo recetas recientes de preentrenamiento eficiente. La mezcla de datos es explícita y se transmitió en streaming vía HuggingFace `datasets`, tokenizando al vuelo sin copia local fija: FineWeb-Edu (`sample-10BT`) al 45 %, Cosmopedia-v2 al 30 %, FineMath (`finemath-4plus`) al 15 % y FineWeb (`sample-10BT`) al 10 %. No se incluyó ningún corpus de código de forma intencionada, porque todos los corpus de BigCode consultados requieren aceptar términos de uso en HuggingFace. No hay constancia de fases de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación y continuación de texto en inglés: el modelo completa secuencias a partir de un prompt, con decodificación por temperatura, top-k y penalización de repetición configurables en el método `generate`.
- Modelado de lenguaje y puntuación por verosimilitud: al ser un modelo base, resulta adecuado para calcular pérdida por token y comparar respuestas candidatas, que es exactamente el método con el que se evaluaron sus benchmarks.
- Razonamiento elemental y comprensión lectora de opción múltiple: obtiene resultados por encima del azar y por encima de una reproducción de GPT-2 (124M) en HellaSwag, ARC-Easy y ARC-Challenge, siempre en formato de elección múltiple.
- Capacidad matemática incipiente: el 15 % de la mezcla de datos procede de FineMath, lo que expone al modelo a texto matemático, aunque no hay evidencia publicada de resolución de problemas.
- No soporta tool calling ni function calling: no hay plantilla de herramientas, ni ajuste para ello.
- No soporta uso como agente ni razonamiento multi-paso orquestado: no hay modo thinking, ni planificación, ni ejecución de herramientas.
- Multilingüe: no disponible; el modelo se declara únicamente en inglés.
- Capacidades especiales: ninguna. No hay visión, audio, modo de razonamiento explícito ni decodificación especulativa.
- Generación de código: ausente por diseño; el propio autor advierte que puede producir texto con forma de código, pero no código funcionalmente correcto.

## Casos de uso

- Investigación sobre recetas de preentrenamiento eficiente: el repositorio permite reproducir un entrenamiento completo de ~3B tokens en una sola GPU y analizar el efecto del optimizador híbrido Muon + AdamW frente a AdamW puro, usando los pesos publicados como punto de partida o de comparación.
- Estudios de mezcla de datos (data mixing): la composición exacta (45 % FineWeb-Edu, 30 % Cosmopedia-v2, 15 % FineMath, 10 % FineWeb) y el streaming sin copia local fija hacen de este modelo una base razonable para experimentos de ablación sobre proporciones de corpus educativos, sintéticos y matemáticos.
- Docencia y divulgación sobre LLM: con 14 capas y 640 dimensiones, el modelo es lo bastante pequeño para inspeccionar activaciones, mapas de atención y curvas de pérdida en un curso universitario o taller, cargándolo en una GPU de consumo sin necesidad de infraestructura de clúster.
- Banco de pruebas de infraestructura de inferencia: sirve para validar pipelines propios de carga de safetensors, tokenización con `tiktoken`, decodificación con penalización de repetición y cálculo de perplejidad, antes de escalar a modelos mayores.
- Generación de texto sintético con forma plausible para pruebas de sistemas: se puede usar para poblar entornos de desarrollo con texto en inglés estructuralmente coherente (listas numeradas, plantillas rellenables) siempre que no se requiera veracidad factual, por ejemplo para probar maquetación, paginación o resaltado de sintaxis.
- Evaluación comparativa de modelos pequeños: al incluir números de referencia frente a GPT-2 (124M) medidos con el mismo protocolo de scoring por verosimilitud, es útil como baseline en estudios que comparen SLM de ~100-150 M de parámetros.
- Experimentos de cuantización y ajuste fino desde cero: al estar los pesos en fp32 con un `model.py` autocontenido, es un candidato manejable para probar cuantización post-entrenamiento, LoRA o ajuste supervisado sobre tareas muy concretas, asumiendo que no hay soporte oficial para ello.

## Benchmarks y rendimiento

Evaluación por scoring de verosimilitud (comparación de la pérdida por token entre respuestas candidatas, sin generación ni muestreo), con 200 ejemplos por benchmark y el checkpoint final en el paso 30.000 (~2,95B tokens vistos):

| Benchmark | GTM-v1-base | GPT-2 (124M) | Baseline aleatorio |
|---|---|---|---|
| HellaSwag | 32,0 % | ~28-29 % | 25 % |
| ARC-Easy | 42,5 % | ~39,2 % | ~25 % |
| ARC-Challenge | 26,0 % | ~22,5 % | ~25 % |

El propio autor advierte que estas cifras deben leerse como "supera a un baseline de 2019 en unos pocos benchmarks de elección múltiple", no como equivalencia general con GPT-2. GTM-v1 se entrenó con aproximadamente 1/15 de los tokens de GPT-2 (~3B frente a ~40B) y en una sola GPU. No hay datos publicados de generación libre, grounding factual ni comportamiento fuera de esos formatos.

## Requisitos de hardware

- VRAM para inferencia en fp32 (formato publicado): unos 536 MB solo de pesos (133,9 M × 4 bytes); con activaciones y caché KV, alrededor de 1 GB.
- VRAM en bf16/fp16: aproximadamente 268 MB de pesos; la caché KV a 1024 tokens y 14 capas ocupa unos 35 MB en fp16.
- VRAM en int8: alrededor de 134 MB de pesos; en int4, unos 67 MB. Estas cifras son estimaciones aritméticas, no hay versiones cuantizadas publicadas ni verificadas.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente. El autor lo entrenó en una RTX Pro 6000, pero la inferencia cabe holgadamente en una GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo con más de 2 GB de memoria, e incluso podría ejecutarse en CPU con latencia alta.
- Opciones de despliegue: no es compatible de forma nativa con `transformers` (`AutoModel`), vLLM, TGI, Ollama ni llama.cpp. El procedimiento documentado es cargar el estado con `safetensors.torch.load_file`, instanciar la clase `GPT` de `model.py` con los valores de `config.json` y llamar a `generate`. Cualquier otra vía de despliegue requiere conversión manual no documentada.
- Latencia y throughput estimados: no disponibles; no se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HellaSwag | ARC-Easy | ARC-Challenge | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| GTM-v1-base | 133,9 M (safetensors) | 1024 | 32,0 % | 42,5 % | 26,0 % | Apache 2.0 | Pesos safetensors fp32 + `model.py` |
| GPT-2 (124M) | ~124 M | 1024 | ~28-29 % | ~39,2 % | ~22,5 % | Modificada (OpenAI) | Pesos en `transformers` |
| Pythia-160M | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| SmolLM-135M | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card solo ofrece comparación cuantitativa frente a GPT-2 (124M), con cifras de referencia procedentes de una reproducción desde cero verificada contra la evaluación oficial de GPT-2. No se aportan datos frente a otros SLM contemporáneos.

## Limitaciones y advertencias

- Ausencia de recuperación factual fiable: el propio autor señala que ante el prompt "The capital of France is" el modelo no produce de forma consistente "Paris" y puede generar contenido fluido pero inventado. El corpus no es denso en hechos discretos y el presupuesto de ~100 M de parámetros y ~3B tokens es pequeño para memorizar datos concretos.
- Riesgo alto de alucinación: al ser un modelo base sin ajuste factual, genera con confianza texto plausible y falso. No debe usarse para responder preguntas ni como fuente de información.
- Sin capacidad de código: no se incluyó ningún corpus de código en el entrenamiento, por lo que solo produce texto con apariencia de código, no código ejecutable correcto.
- No está ajustado por instrucciones: no sigue órdenes ni mantiene formato conversacional; continúa texto. Cualquier uso tipo chat requiere ajuste previo.
- Tendencia a la repetición: la generación greedy o con temperatura baja puede entrar en bucles o quedarse atascada en plantillas estructurales (listas numeradas, textos con huecos). Se mitiga parcialmente con `repetition_penalty` (el ejemplo usa 1.3).
- Limitación de contexto: 1024 tokens es una ventana corta para tareas de documento largo o conversaciones multi-turno extensas.
- Limitación de idioma: solo inglés declarado; no hay garantías de comportamiento en castellano u otros idiomas.
- Licencia y datos: el código y los pesos son Apache 2.0, pero los datasets subyacentes (FineWeb, FineWeb-Edu, Cosmopedia-v2, FineMath) mantienen sus propias licencias y condiciones, que el usuario debe respetar por separado. La model card original está truncada en ese punto, por lo que conviene verificar los términos completos en el repositorio.
- Caveats de producción: al no ser un `AutoModel` de `transformers`, no hay soporte nativo en servidores de inferencia estándar; integrarlo exige cargar el modelo a mano. Con 0 descargas y 3 likes, no hay validación comunitaria ni ecosistema alrededor.
- Discrepancia de parámetros: la model card indica ~101,6 M (con embeddings atados) mientras que el recuento real del fichero safetensors es de 133.914.880; conviene tenerlo en cuenta al planificar memoria y al comparar con otros modelos.

## Enlaces

- HuggingFace: https://huggingface.co/OPENGCM/GTM-v1-base
- Repositorio del modelo (pesos safetensors, `model.py`, `config.json`): https://huggingface.co/OPENGCM/GTM-v1-base/tree/main
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Cosmopedia-v2: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia-v2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Paper o blog técnico del modelo: no disponible
- Repositorio de código independiente o demo: no disponible
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces encontrados corresponden a un sitio neerlandés de noticias locales y a un perfil personal, sin relación con OPENGCM ni con GTM-v1.
