# cointeleporting/Raon-1-mini-preview-heretic

## Resumen

Raon-1-mini-preview-heretic es una versión "abliterated" (decensurada) del modelo Raon-1 mini preview de KRAFTON AI, publicada por el usuario cointeleporting mediante la herramienta Heretic v2.0.0.dev0. El modelo original es un MoE híbrido de 28.783.218.402 parámetros totales (4.300 millones activos por token), entrenado desde cero por KRAFTON AI y publicado bajo licencia Apache 2.0 como parte de la familia abierta Raon. La modificación consiste en una ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) aplicada sobre las capas 11 a 25 que reduce las negativas del modelo a responder: según la model card, pasa de 99/100 rechazos en el original a 5/100 en esta versión, con una divergencia KL de 0,0596 respecto al modelo base.

El problema que resuelve esta variante es concreto: eliminar los mecanismos de rechazo del modelo original manteniendo al máximo el resto del comportamiento. Para ello el autor documenta los hiperparámetros exactos de la ablación y publica un directorio `reproduce/` con el procedimiento, de modo que el resultado es reproducible. La arquitectura subyacente no cambia: 25 capas con atención híbrida (18 capas de Raon Delta Attention con estado de tamaño fijo y 7 capas de Gated MLA con caché KV), sin codificación posicional (NoPE), 128 expertos enrutados de los que se activan 6 más 1 compartido, y una ventana de contexto nativa de 262.144 tokens.

Es relevante ahora porque combina tres cosas poco habituales en el ecosistema abierto: un MoE de ~30B con solo 4,3B activos (coste de inferencia de un modelo pequeño), contexto nativo de 256K y un conjunto de checkpoints cuantizados (MXFP8 y NVFP4) que permiten ejecutarlo en una única GPU de consumo. La pega es que el modelo base está sujeto a acceso restringido (gated) y su model card lo etiqueta explícitamente como preview, no como versión final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido transformer con atención lineal (Raon Delta Attention) y Gated MLA; 25 capas |
| Parametros totales | 28.783.218.402 (28,8B) |
| Parametros activos | 4,3B por token (6 expertos enrutados de 128 + 1 compartido) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | MXFP8 y NVFP4 en los checkpoints del modelo base; el repo heretic se publica en safetensors (tag `mxfp8`); no se documentan GGUF ni AWQ/GPTQ |
| Idiomas soportados | El modelo base declara entrenamiento en coreano, inglés, japonés, chino, español, francés y tailandés; los metadatos de este repo no declaran idiomas ("no disponibles") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 32,7 GB); requiere `custom_code` y `trust_remote_code` |

| Parametro adicional | Valor |
|---|---|
| Capas con atención | 18 RDA (estado fijo) + 7 Gated MLA (caché KV) |
| Hidden size | 2.560 |
| Cabezas de atención | 40 (RDA y Gated MLA) |
| Dimension de cabeza | 128 en RDA; 192 QK / 128 V en Gated MLA |
| Rango LoRA Q / KV (Gated MLA) | 576 / 512 |
| Expertos | 128 enrutados, 6 activos + 1 compartido |
| Tamano intermedio de experto | 1.088 |
| FFN densa (primera capa) | 12.032 |
| Funcion de activacion | SiTU-GLU |
| Conexion residual | Raon-mHC con 4 streams |
| Codificacion posicional | NoPE (sin codificacion posicional) |
| Caché KV | ~8 KiB por token en BF16 (solo capas MLA) |
| Modelo base | KRAFTON/Raon-1-mini-preview |
| Metodo de modificacion | Heretic v2.0.0.dev0, Arbitrary-Rank Ablation (ARA) |
| Decodificacion especulativa | Modelo borrador DFlash2 disponible para el modelo base |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE híbrido de 25 capas y 2.560 dimensiones ocultas. La innovación principal está en la atención: 18 de las 25 capas usan Raon Delta Attention (RDA), una variante de Kimi Delta Attention que desacopla las compuertas de borrado y escritura, lo que según la model card mejora el rendimiento en contexto largo respecto a KDA. Estas capas mantienen un estado de tamaño fijo, por lo que no crecen con la longitud de la secuencia. Las 7 capas restantes usan Gated MLA con caché KV, lo que da un coste de memoria de aproximadamente 8 KiB por token en BF16 (unos 2 GiB para una secuencia completa de 262.144 tokens). El modelo no usa codificación posicional (NoPE). La conexión residual es Raon-mHC con 4 streams, una versión de bajo coste computacional de las manifold-constrained hyper-connections de DeepSeek, pensada para acelerar el entrenamiento. La activación es SiTU-GLU y el vocabulario aparece truncado en la documentación disponible.

El modelo fue entrenado desde cero por KRAFTON AI (no es un fine-tune de un modelo existente) con foco declarado en conversación en coreano y tareas agénticas. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; tampoco se documentan las recetas de destilación o de extensión de contexto. Sí se documenta soporte de decodificación especulativa mediante un modelo borrador DFlash2.

Sobre la modificación: la ablación se aplica en las capas 11 a 25 con los siguientes parámetros ARA, publicados por el autor:

| Parametro ARA | Valor |
|---|---|
| start_layer_index | 11 |
| end_layer_index | 25 |
| preserve_good_behavior_weight | 0,1063 |
| steer_bad_behavior_weight | 0,0010 |
| overcorrect_relative_weight | 0,8750 |
| neighbor_count | 15 |

## Capacidades

- Generación de texto conversacional multi-turno, con especial énfasis en coreano y buen rendimiento declarado en inglés.
- Modo de razonamiento integrado ("built-in thinking"), con resultados destacados según el autor en benchmarks de matemáticas y ciencia.
- Seguimiento de instrucciones y tareas de búsqueda: el autor afirma que lidera sus modelos de comparación en los benchmarks de instruction-following y search mostrados (sin cifras publicadas en la información disponible).
- Ejecución de agentes: soporte de tool calling / function calling, con compatibilidad declarada con Hermes Agent, Pi y OpenCode.
- Razonamiento multi-paso dentro de flujos agénticos, apoyado en la ventana de 262.144 tokens.
- Multilingüismo: coreano, inglés, japonés, chino, español, francés y tailandés en el modelo base.
- Contexto largo nativo de 256K tokens, con atención híbrida que limita el crecimiento de la caché KV.
- Decodificación especulativa con el borrador DFlash2 del modelo base (aceleración de inferencia).
- Capacidad "uncensored": el propósito declarado de esta variante es no rechazar peticiones; la model card reporta 5/100 rechazos frente a 99/100 del original.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Atención al cliente en coreano: el modelo fue entrenado específicamente para conversación natural en coreano y sostiene diálogos multi-turno con hasta 262.144 tokens de contexto, lo que permite adjuntar historiales completos o bases de conocimiento extensas sin truncar.
- Agente de automatización con herramientas: al soportar tool calling y ser compatible con Hermes Agent, Pi y OpenCode, puede conectarse a APIs internas, ejecutar consultas y encadenar pasos intermedios dentro de un mismo bucle agéntico.
- Procesamiento de documentación técnica larga: con 256K de contexto nativo y solo ~2 GiB de caché KV por secuencia completa en BF16, es viable analizar repositorios de código, contratos o informes completos en una sola pasada.
- Generación y revisión de código en pipelines: integrable mediante `transformers` o servidores compatibles con la API de OpenAI; sus 4,3B parámetros activos mantienen el coste por token bajo en comparación con modelos densos de tamaño similar.
- Investigación sobre alineación y seguridad: al ser una versión abliterated reproducible (con los parámetros ARA publicados y directorio `reproduce/`), sirve como caso controlado para estudiar qué se pierde y qué se conserva al eliminar el comportamiento de rechazo, usando la divergencia KL como métrica.
- Despliegue en hardware de consumo: el checkpoint NVFP4 del modelo base cabe en una única RTX 5090 de 32 GB, lo que habilita prototipos locales de asistentes con contexto largo sin infraestructura de datacenter.
- Traducción y soporte multilingüe en el arco asiático: cobertura declarada de coreano, japonés, chino y tailandés junto a inglés, español y francés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del modelo base muestra gráficas comparativas (matemáticas, ciencia, instruction-following y búsqueda) pero sin cifras numéricas en el texto extraído, por lo que no se pueden reproducir aquí.

Los únicos datos cuantitativos publicados en este repo son las métricas de la propia ablación:

| Metrica | Este modelo | Modelo original (KRAFTON/Raon-1-mini-preview) |
|---|---|---|
| Rechazos (Refusals) | 5/100 | 99/100 |
| Divergencia KL | 0,0596 | 0 (por definición) |

## Requisitos de hardware

- Pesos en BF16: ~57,6 GB solo para parámetros (28,78B × 2 bytes), más caché y activaciones. Requiere al menos 80 GB de VRAM o reparto multi-GPU.
- Pesos en MXFP8: ~28,8 GB, ajustado para una GPU de 40-48 GB (A100 40GB, L40S, A6000 Ada) dejando margen para contexto.
- Pesos en NVFP4 (checkpoint del modelo base): según la model card, permite inferencia en una única NVIDIA RTX 5090 de 32 GB; el servidor se ejecuta con tensor parallel size 1.
- Caché KV: ~8 KiB por token en BF16, es decir, unos 2 GiB para una secuencia de 262.144 tokens, más el estado fijo de las capas RDA.
- GPU recomendadas: H100 80GB o A100 80GB para BF16 con contexto largo; A100 40GB / L40S para FP8; RTX 5090 (32 GB) para NVFP4. No hay datos publicados de funcionamiento en GPUs consumer de 24 GB.
- Despliegue: `transformers` (el repo requiere `custom_code` y compila kernels propios; la primera puesta en marcha tarda unos 10 minutos según la documentación del modelo base) y servidores de inferencia tipo vLLM para los checkpoints cuantizados. No se documentan Ollama, llama.cpp ni GGUF.
- Latencia y throughput: no disponibles. El modelo base ofrece decodificación especulativa con el borrador DFlash2, que el autor presenta como aceleración de inferencia sin cifras concretas.
- Nota: este repo concreto se publica en safetensors (32,7 GB) y el tag `mxfp8` sugiere pesos en ese formato, pero no se confirma en la información disponible qué precisión efectiva contienen los ficheros.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Raon-1-mini-preview-heretic (este) | 28,8B | 4,3B | 262.144 | Apache 2.0 | Variante decensurada, acceso al base restringido |
| KRAFTON/Raon-1-mini-preview | 28,8B | 4,3B | 262.144 | Apache 2.0 | Original con rechazos; acceso bajo solicitud (gated) |
| Qwen3-30B-A3B | 30,5B | 3,3B | 32.768 nativo (extensible) | Apache 2.0 | MoE denso en atención, sin atención lineal |
| gpt-oss-20b | 21B | 3,6B | 131.072 | Apache 2.0 | MoE de OpenAI, cuantización MXFP4 nativa |

Los datos de los modelos comparables no proceden de la información proporcionada en esta búsqueda y deben verificarse en sus fichas oficiales antes de usarse en una decisión técnica. En la información disponible no hay cifras de benchmarks que permitan comparar rendimiento real entre estas opciones.

## Limitaciones y advertencias

- Modelo preview: la model card del base advierte explícitamente de que no es la versión final y que especificaciones y resultados pueden cambiar.
- Acceso restringido en origen: el modelo base exige solicitud de acceso (campos de nombre, afiliación, puesto, país y uso previsto). Este repo derivado puede heredar restricciones equivalentes.
- Reputación nula: 0 descargas y 0 likes en el momento de la consulta, y autor sin histórico verificable; no hay validación independiente de la calidad de la ablación.
- La ablación no es neutra: una divergencia KL de 0,0596 implica que el modelo se desvía del original en su distribución de salida; es esperable degradación en tareas que dependían de los comportamientos eliminados (seguridad, rechazo de contenido dañino, calibración).
- Riesgo de alucinación: no hay datos publicados de benchmarks de fidelidad ni de tasas de alucinación. Un modelo decensurado tiende además a no señalar incertidumbre ni a rechazar peticiones con premisas falsas.
- Sesgos: no se documenta ninguna evaluación de sesgos, y el entrenamiento está fuertemente centrado en coreano, lo que puede trasladar sesgos culturales y de dominio a otros idiomas.
- Idiomas: aunque el base declara siete idiomas, el coreano es el idioma objetivo principal; el rendimiento en español, francés o tailandés no está cuantificado. Los metadatos de este repo no declaran idiomas soportados.
- Licencia: Apache 2.0 permite uso comercial, pero el uso de un modelo decensurado traslada al desplegador toda la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo (por ejemplo, obligaciones de moderación en la UE).
- Técnicas: requiere `trust_remote_code` y compilación de kernels propios; la primera ejecución tarda unos 10 minutos. No hay soporte documentado de GGUF/llama.cpp, lo que limita el despliegue en CPU o GPUs de gama baja.
- Reproducibilidad declarada pero no verificada de forma independiente: el directorio `reproduce/` y los parámetros ARA están publicados, pero nadie externo los ha replicado según la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cointeleporting/Raon-1-mini-preview-heretic
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Checkpoint NVFP4 del base: https://huggingface.co/KRAFTON/Raon-1-mini-preview-nvfp4
- Repositorio GitHub del modelo base: https://github.com/krafton-ai/Raon-1-mini-preview
- Playground oficial (acceso gratuito por tiempo limitado): https://raon-mini.krafton.ai/en
- Página de KRAFTON AI: https://krafton.ai/en/
- Organización KRAFTON en HuggingFace: https://huggingface.co/KRAFTON
- Heretic (herramienta de ablación): https://heretic-project.org
- Perfil en X de KRAFTON AI: https://x.com/Krafton_AI
- Reproducción aleatoria para tests de integración: https://huggingface.co/tiny-random/raon-1-mini
- Analisis de terceros (requisitos y licencia): https://chimitdorzhi.tech/en/ii-modeli/raon/
