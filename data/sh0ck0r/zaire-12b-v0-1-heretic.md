# sh0ck0r/Zaire-12B-v0.1-heretic

## Resumen

Zaire-12B-v0.1-heretic es un ajuste fino (finetune) del modelo ReadyArt/Zaire-12B-v0.1, un transformer de 11.959.730.176 parámetros (aproximadamente 12B) orientado a generación de texto conversacional. Lo desarrolla el usuario sh0ck0r y su propósito declarado es eliminar los comportamientos de rechazo (refusals) del modelo original mediante una técnica de abliteración denominada Arbitrary-Rank Ablation (ARA), aplicada con la herramienta Heretic v2.1.0. El resultado es un modelo "decensored" que, según la model card, reduce los rechazos de 100/100 en el original a 5/100 en esta versión.

La relevancia de esta ficha es acotada: se trata de un modelo de nicho, publicado en noviembre de 2026, con cero descargas y cero likes en el momento de la consulta, y etiquetado explícitamente como NSFW, adult-content, roleplay, ERP y unaligned. No es un modelo de propósito general ni compite en benchmarks estándar de razonamiento o código; su interés técnico reside en el procedimiento de abliteración reproducible y en la documentación de los parámetros ARA utilizados.

La información disponible es escasa: la model card no documenta arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks convencionales. Los datos que se ofrecen a continuación provienen del repositorio de Hugging Face y de la propia model card, y se indica "no disponible" cuando el dato no consta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (tag `gemma4_unified`; detalles internos no disponibles) |
| Parámetros totales | 11.959.730.176 (~12B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la model card; el repo distribuye pesos en safetensors (24,0 GB) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Modelo base | ReadyArt/Zaire-12B-v0.1 (relación: finetune) |
| Técnica de modificación | Arbitrary-Rank Ablation (ARA) con Heretic v2.1.0 |
| Reproducibilidad | Sí, incluye directorio `reproduce/` con README |

## Arquitectura y entrenamiento

El modelo es un finetune del checkpoint ReadyArt/Zaire-12B-v0.1, que a su vez se distribuye con el tag de arquitectura `gemma4_unified`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo base. Tampoco se especifican innovaciones de atención (attention linear, decodificación especulativa) ni detalles del tokenizador.

La modificación respecto al base es una abliteración mediante Arbitrary-Rank Ablation (ARA) aplicada con Heretic v2.1.0. Los parámetros declarados son: `start_layer_index` = 10, `end_layer_index` = 41, `preserve_good_behavior_weight` = 0,0665, `steer_bad_behavior_weight` = 0,0050, `overcorrect_relative_weight` = 0,8773 y `neighbor_count` = 13. El procedimiento interviene las capas 10 a 41 del transformer para suprimir direcciones asociadas al comportamiento de rechazo, preservando parcialmente el comportamiento considerado "bueno". La model card reporta una divergencia KL de 0,2871 respecto al modelo original, lo que cuantifica cuánto se ha desplazado la distribución de salida. El autor indica que el proceso es reproducible y publica instrucciones en el directorio `reproduce/`.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, orientada a roleplay y narrativa interactiva.
- Contenido explícito y para adultos (NSFW, ERP, erótico), violencia y horror, según las etiquetas del autor.
- Modo instruct/conversacional: acepta instrucciones y mantiene formato de diálogo.
- Comportamiento "unaligned": supresión deliberada de rechazos, con 5/100 refusals reportados frente a 100/100 del base.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no documentado; no es un objetivo declarado del modelo.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Roleplay conversacional de larga duración: el modelo está afinado para mantener personajes y turnos de diálogo sin romper el rol por rechazos, lo que lo hace adecuado para aplicaciones de ficción interactiva donde el modelo base interrumpiría la conversación.
- Narrativa de ficción adulta y de terror: las etiquetas del autor (Horror, Violence, Erotic) indican que el ajuste preserva la generación de escenas explícitas y violentas, útil en herramientas de escritura creativa para adultos con filtrado y consentimiento explícito del usuario.
- Investigación sobre abliteración y alineación: el modelo sirve como caso de estudio reproducible de ARA, con parámetros publicados y divergencia KL medida, para estudiar el coste de eliminar rechazos en un transformer de ~12B.
- Evaluación de robustez de filtros de seguridad: permite probar clasificadores y guardrails de contenido en un modelo deliberadamente decensored, midiendo tasas de falsos negativos en pipelines de moderación.
- Generación de diálogo para motores de novela visual o juegos de rol de mesa digitales: su formato instruct y su orientación conversacional encajan en sistemas de diálogo con estado, siempre que el despliegue sea para audiencias adultas verificadas.
- Fine-tuning posterior sobre dominios creativos: al estar bajo Apache 2.0 y en safetensors, puede servir de base para ajustes adicionales de estilo o personaje en entornos de investigación.

## Benchmarks y rendimiento

La model card solo publica métricas del procedimiento de abliteración, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Métrica | Este modelo | Modelo original (ReadyArt/Zaire-12B-v0.1) |
|---|---|---|
| Refusals | 5/100 | 100/100 |
| Divergencia KL | 0,2871 | 0 (por definición) |

No se han publicado resultados de benchmarks de razonamiento, código o matemáticas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 24 GB solo para pesos (11,96B parámetros × 2 bytes), más overhead de KV cache y activaciones; se recomienda 32 GB o más.
- Cuantización a 8 bits: aproximadamente 12-13 GB de pesos; a 4 bits: aproximadamente 6-7 GB de pesos, más overhead.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para FP16 sin compromisos; RTX 4090 (24 GB) queda al límite en FP16 y holgada en cuantizaciones de 8 o 4 bits.
- GPU de consumo: cabe en RTX 3090/4090 con cuantización 8 o 4 bits; en GPUs de 16 GB o menos requiere cuantización agresiva.
- Opciones de despliegue: al distribuirse en safetensors, es compatible con vLLM, TGI y transformers; para cuantización local, llama.cpp u Ollama requerirían conversión a GGUF (no se distribuye GGUF en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zaire-12B-v0.1-heretic | ~12B | No disponible | Abliterado, NSFW/roleplay | Apache 2.0 | Hugging Face (0 descargas) |
| ReadyArt/Zaire-12B-v0.1 | ~12B | No disponible | Base conversacional alineado | No disponible en la información | Hugging Face |
| Alternativas abliteradas de ~12B | No disponible | No disponible | Abliteración genérica | Variable | No disponible |

No se dispone de datos de benchmarks comparables ni de especificaciones de contexto de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado para generar material NSFW, violento y para adultos; no debe desplegarse en entornos sin verificación de edad ni control de acceso.
- Supresión de rechazos: la abliteración reduce los refusals a 5/100, lo que implica que el modelo puede producir contenido dañino, ilegal o no deseado sin salvaguardas; requiere guardrails externos en cualquier producción.
- Divergencia KL de 0,2871 respecto al base: indica un desplazamiento no trivial de la distribución, con posible degradación de capacidades generales (razonamiento, coherencia) no medida en la model card.
- Riesgo de alucinación: no evaluado; al ser un modelo conversacional de nicho, no hay datos de fidelidad factual.
- Idioma: solo inglés declarado; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Contexto: no documentado; no se debe asumir una ventana larga sin verificación empírica.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede infringir normativas de moderación, protección de menores o difamación según jurisdicción; la responsabilidad recae en el desplegador.
- Madurez: cero descargas y cero likes, publicación reciente y sin validación comunitaria; no hay evidencia de estabilidad en producción.
- Reproducibilidad declarada por el autor, pero no verificada de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sh0ck0r/Zaire-12B-v0.1-heretic
- Modelo base: https://huggingface.co/ReadyArt/Zaire-12B-v0.1
- Heretic (herramienta de abliteración): https://heretic-project.org
- Directorio de reproducción: `reproduce/README.md` dentro del repositorio del modelo
