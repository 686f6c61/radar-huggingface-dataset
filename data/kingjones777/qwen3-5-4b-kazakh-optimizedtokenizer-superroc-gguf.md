# kingjones777/Qwen3.5-4B-Kazakh-OptimizedTokenizer-SuperRoc-GGUF

## Resumen

Qwen3.5-4B-Kazakh-OptimizedTokenizer-SuperRoc-GGUF es una cuantización GGUF en formato ROCm-FP4 del modelo base issai/Qwen3.5-4B-Kazakh-OptimizedTokenizer, publicada por el usuario kingjones777. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: un único fichero de pesos de 2,47 GB optimizado para ejecutarse en hardware AMD Strix Halo (concretamente el Ryzen AI Max+ 395, arquitectura gfx1151) mediante el motor de inferencia local Super Roc, construido sobre llama.cpp/ggml.

El modelo subyacente es un transformer denso de 4.246.383.616 parámetros (aproximadamente 4,25 mil millones) derivado de la familia Qwen3.5, con un tokenizador ajustado específicamente para kazajo. El artefacto resulta relevante para desarrolladores que trabajan con hardware AMD de gama integrada y necesitan ejecutar un modelo conversacional de ~4B en local con contexto largo (hasta 131.072 tokens cargados según las mediciones del autor) sin depender de GPUs NVIDIA ni de servicios en la nube.

La ficha del autor documenta métricas de rendimiento medidas en un equipo concreto (Ryzen AI Max+ 395, 128 GB de RAM, Super Roc 0.20.3), así como una comparación de perplejidad frente a una cuantización Q4_K_M convencional del mismo modelo. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5); detalles internos no disponibles |
| Parametros totales | 4.246.383.616 (~4,25 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens cargados en la configuración medida; contexto de entrenamiento del modelo base no disponible |
| Tipos de cuantizacion | Q4_0 en formato ROCm-FP4 (fichero único: Q4_0-ROCmFP4-FAST-imatrix.gguf) |
| Idiomas soportados | No disponible (el tokenizador está optimizado para kazajo; el modelo base es de la familia Qwen, multilingüe, pero la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ROCm-FP4) |
| Tamano del fichero | 2.468.916.448 bytes (~2,47 GB) |
| SHA256 | 90d52de9afcc91ecc72b54ed11362e24e01d3bdf979bf43c369f93ff393f36da |
| Modelo base | issai/Qwen3.5-4B-Kazakh-OptimizedTokenizer |
| Motor de inferencia objetivo | Super Roc (Strix Halo, gfx1151) |
| Fecha de publicacion | 2026-11-24 |

## Arquitectura y entrenamiento

Este repositorio no contiene un entrenamiento propio: es una cuantización del modelo issai/Qwen3.5-4B-Kazakh-OptimizedTokenizer, que a su vez pertenece a la familia Qwen3.5 de ~4B parámetros con un tokenizador adaptado al kazajo. La model card no proporciona detalles sobre la arquitectura interna (número de capas, dimensiones de atención, tipo de positional encoding), el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Toda esa información debe consultarse en la ficha del modelo base, que no forma parte de la información disponible.

La innovación técnica de este artefacto es el formato ROCm-FP4 y la cuantización Q4_0 con matriz de importancia (imatrix), desarrollados por el equipo ROCmFPX y empaquetados para el motor Super Roc. Según el autor, el modelo soporta un modo de razonamiento ("thinking") que se puede activar por petición mediante `chat_template_kwargs.enable_thinking`, y el motor admite decodificación especulativa con drafter (desactivada en las mediciones publicadas), caché de prompt y prompt lookup.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Modo de razonamiento activable por petición mediante `enable_thinking` en el chat template.
- Tool calling / function calling: el autor reporta 7/8 llamadas correctas en modo requerido y 6/8 en modo automático.
- Soporte de contexto largo: 131.072 tokens cargados en la configuración medida, con caché de prompt (6.961 de 6.986 tokens reutilizados en el segundo turno).
- Generación de código: se midió un throughput específico con dos prompts de código (67,1 tok/s de media).
- Capacidades multilingües: no documentadas en esta ficha; el tokenizador está optimizado para kazajo.
- Compatibilidad con endpoints tipo OpenAI (`endpoints_compatible` en las etiquetas).

## Casos de uso

- Asistente conversacional local en hardware AMD Strix Halo: el modelo se ejecuta íntegramente en un Ryzen AI Max+ 395 con 128 GB de memoria unificada, lo que permite desplegar un asistente privado sin GPU dedicada ni conexión a la nube.
- Procesamiento de documentos técnicos largos: con 131.072 tokens de contexto cargados y caché de prompt, es adecuado para resumir o consultar manuales y bases de código extensas en una sola sesión.
- Automatización con tool calling: los resultados reportados (7/8 en modo requerido) lo hacen viable para flujos de agente que invocan funciones externas, como consultas a APIs o ejecución de comandos, siempre con validación adicional.
- Generación de código en entornos de desarrollo locales: el throughput medido (67,1 tok/s en prompts de código) permite usarlo como asistente de autocompletado o generación de fragmentos en un IDE sobre hardware integrado.
- Prototipado de aplicaciones en kazajo: al estar el tokenizador optimizado para ese idioma, es un candidato para experimentos de NLP en kazajo, aunque la calidad por idioma no está documentada.
- Despliegue vía Lemonade: la model card documenta la integración con Lemonade (`lemonade pull` / `lemonade chat`), lo que facilita probar el modelo en un flujo de chat local sin configurar manualmente el motor.
- Evaluación de cuantizaciones ROCm-FP4: sirve como referencia para comparar perplejidad y velocidad frente a Q4_K_M en hardware AMD (9,29 frente a 9,11 de perplejidad en el documento de prueba).

## Benchmarks y rendimiento

El autor publica una medición de perplejidad y métricas de inferencia, pero no resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Valor |
|---|---|
| Perplejidad (documento técnico en inglés de 11K tokens, contexto 4096) | 9,29 |
| Perplejidad de referencia (Q4_K_M del mismo modelo) | 9,11 |
| Tiempo de carga | 2 s |
| Prompt tok/s (p1k) | 3.198,9 |
| Prompt tok/s (p8k) | 3.262,9 |
| Generación tok/s (p1k) | 66,45 |
| Generación tok/s (p8k) | 96,67 |
| Generación de código tok/s (media de 2 prompts) | 67,1 |
| Tool calls (requerido / automático) | 7/8 / 6/8 |
| Caché de prompt, turno 2 (tokens cacheados / prompt) | 6.961 / 6.986 |
| Contexto cargado | 131.072 tokens |
| Drafter (decodificación especulativa) | Desactivado |

Condiciones: Ryzen AI Max+ 395, 128 GB, Super Roc 0.20.3, una petición simultánea, medido el 2026-11-24.

## Requisitos de hardware

- VRAM/memoria: el fichero GGUF ocupa ~2,47 GB; con 131.072 tokens de contexto cargados se necesita memoria adicional para la caché KV, no cuantificada en la model card. El sistema medido dispone de 128 GB de memoria unificada.
- GPU recomendada: AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151), el único hardware validado por el autor.
- GPU de consumo: no hay datos de funcionamiento en GPUs NVIDIA (RTX 4090, etc.) ni en otras AMD; el formato ROCm-FP4 está pensado para el motor Super Roc sobre gfx1151.
- Opciones de despliegue: Super Roc (`superroc serve ... llm --model ...`) y Lemonade con el binario ROCm configurado (`lemonade config set llamacpp.rocm_bin=/opt/superroc/lemonade`). No se documenta compatibilidad con vLLM, TGI, Ollama o llama.cpp estándar.
- Latencia y throughput: 3.198,9–3.262,9 tok/s de prompt y 66,45–96,67 tok/s de generación según el tamaño de prompt, con una sola petición concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-4B Kazakh SuperRoc GGUF) | ~4,25 B | 131.072 (cargado) | Q4_0 ROCm-FP4 | Apache 2.0 | Perplejidad 9,29; optimizado para Strix Halo |
| issai/Qwen3.5-4B-Kazakh-OptimizedTokenizer (base) | ~4,25 B | No disponible | Pesos originales | No disponible en esta ficha | Modelo de referencia sin cuantizar |
| Q4_K_M del mismo modelo base | ~4,25 B | No disponible | Q4_K_M | Apache 2.0 (presumible) | Perplejidad 9,11 según el autor; sin datos de velocidad |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Es una cuantización Q4_0: la perplejidad medida (9,29) es ligeramente superior a la de Q4_K_M (9,11), lo que implica una pérdida de calidad respecto al modelo sin cuantizar.
- El artefacto está validado únicamente en Super Roc sobre Ryzen AI Max+ 395 (gfx1151); no hay evidencia de funcionamiento en otros motores o GPUs.
- Las métricas de tool calling (7/8 y 6/8) indican que una de cada ocho llamadas puede fallar; no es adecuado para agentes autónomos sin validación.
- La model card no documenta sesgos, riesgos de alucinación ni comportamiento por idioma; el tokenizador está optimizado para kazajo, pero no se aportan evaluaciones de calidad en kazajo ni en otros idiomas.
- El contexto de entrenamiento del modelo base no está disponible; los 131.072 tokens son el contexto cargado por el motor, no necesariamente el contexto efectivo del modelo.
- Licencia Apache 2.0 declarada, lo que permite uso comercial, pero conviene verificar la licencia del modelo base y de los componentes de terceros (ROCmFPX, llama.cpp/ggml bajo MIT).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide los resultados publicados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Qwen3.5-4B-Kazakh-OptimizedTokenizer-SuperRoc-GGUF
- Modelo base: https://huggingface.co/issai/Qwen3.5-4B-Kazakh-OptimizedTokenizer
- Motor Super Roc: https://github.com/kingjones30/superroc
- Documentación de integración con Lemonade: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- ROCmFPX (formatos ROCm-FP4): https://github.com/charlie12345/ROCmFPX
