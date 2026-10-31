# bartowski/Naphula_Cyberdonia-24B-v8-GGUF

## Resumen

Naphula_Cyberdonia-24B-v8-GGUF es la cuantización en formato GGUF, realizada por bartowski, del modelo Naphula/Cyberdonia-24B-v8, un modelo de generación de texto de 24B parámetros especializado en escritura creativa, narrativa de ficción, roleplay y generación de tramas. El modelo base es un merge creado con mergekit, orientado a la escritura vívida en múltiples géneros: terror, romance, ciencia ficción, suspense y escritura oscura, entre otros.

La relevancia de esta cuantización radica en que hace accesible un modelo creativo de tamaño medio (24B) en hardware de consumo, gracias a las cuantizaciones con matriz de importancia (imatrix) generadas con llama.cpp. Con la versión Q4_K_M de 14,57 GB, el modelo cabe en GPUs domésticas de 16 GB de VRAM, lo que lo hace atractivo para escritores, creadores de contenido interactivo y desarrolladores de herramientas narrativas que quieren ejecutar el modelo localmente sin depender de APIs externas.

El modelo emplea el formato de prompt estilo Mistral (`[SYSTEM_PROMPT]...[/SYSTEM_PROMPT][INST]...[/INST]`), lo que sugiere compatibilidad con la infraestructura habitual de inferencia para modelos de esta familia. Está publicado bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura detallada no disponible) |
| Parametros totales | 23.572.403.200 (~24B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, Q4_K_S, IQ4_NL, Q4_0, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M, Q3_K_S, IQ3_XS (y otras IQ3/IQ2 no listadas por truncamiento del README) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con llama.cpp release b11845, con imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base, Cyberdonia-24B-v8, es un merge de modelos creado con mergekit (etiquetado como `mergekit-exp`), una técnica que combina los pesos de varios modelos entrenados para obtener un modelo resultante que hereda capacidades de sus componentes sin necesidad de un entrenamiento completo desde cero. Con 24B parámetros, se sitúa en la gama media-alta de modelos abiertos, un punto dulce entre calidad y requisitos de hardware. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni procesos de alineación (RLHF/DPO) de los modelos originales que componen el merge.

En cuanto a la cuantización, bartowski ha empleado llama.cpp (release b11845) con cuantizaciones basadas en imatrix (matriz de importancia), que calcula la importancia de cada peso a partir de datos de calibración para minimizar la pérdida de calidad en cuantizaciones agresivas. El modelo no soporta decodificación especulativa según la model card, y la entrada es exclusivamente textual (sin capacidades de visión o audio).

## Capacidades

- Generación de texto creativo en todos los géneros: terror, romance, ciencia ficción, suspense y escritura oscura.
- Escritura vívida ("vivid prosing" y "vivid writing"), con énfasis en prosa detallada y expresiva.
- Generación de tramas ("plot generation") y subtramas ("sub-plot generation").
- Continuación de escenas ("scene continue") para mantener coherencia narrativa en textos largos.
- Roleplay y conversaciones de juego de rol ("roleplay", "roleplaying", "rp").
- Escritura conversacional y de ficción ("conversational", "fiction writing").
- Uso de lenguaje explícito y tacos ("swearing"), útil para ficción para adultos realista.
- Etiquetado con "della", presumiblemente relacionado con el método de merge DARE-TIES o similar empleado en mergekit.
- No hay evidencia de soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- **Escritura de novela asistida**: un autor puede usar el modelo localmente para continuar escenas, generar subtramas y explorar giros argumentales en su propio hardware, sin enviar borradores a servicios en la nube.
- **Roleplay interactivo**: ejecutando el modelo en Ollama o llama.cpp, se puede montar un sistema de juego de rol conversacional multi-turno con personajes persistentes, aprovechando su entrenamiento específico en RP.
- **Generación de contenido para juegos narrativos**: integración en pipelines de narrativa procedural para generar diálogos, descripciones de escenas y ramas argumentales en juegos de texto.
- **Escritura de terror y suspense**: el modelo está etiquetado específicamente para horror y suspense, siendo adecuado para autores de estos géneros que necesiten ideas de atmósfera y tensión.
- **Prototipado de bots narrativos**: gracias a la licencia Apache 2.0, se puede desplegar comercialmente en un chatbot de ficción interactiva sin costes de licencia.
- **Exploración de estilo y tono**: uso como herramienta de brainstorming para probar distintas voces narrativas y registros, incluido lenguaje crudo y explícito que otros modelos rehúsan por alineación.
- **Continuación de fanfiction**: generación de escenas coherentes a partir de un texto existente mediante el patrón "scene continue".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un merge orientado a escritura creativa, no hay datos de MMLU, HumanEval, GSM8K ni de benchmarks específicos de escritura (como EQ-Bench o similares) en la model card.

## Requisitos de hardware

- **VRAM estimada para inferencia**: depende de la cuantización elegida. La Q4_K_M (14,57 GB) cabe en una GPU de 16 GB de VRAM dejando margen justo para contexto; la Q5_K_M (16,96 GB) requiere 24 GB; la Q6_K (19,73 GB) y Q8_0 (25,05 GB) requieren GPUs de 24 GB o más; el bf16 completo (47,15 GB) necesita multi-GPU o 48 GB de VRAM.
- **GPUs recomendadas**: RTX 4090 o RTX 3090 (24 GB) para cuantizaciones Q5/Q6; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M; Mac con Apple Silicon (M2/M3/M4) con 24-32 GB de memoria unificada para ejecutar GGUF vía llama.cpp.
- **Consumer GPUs**: sí, cabe en GPUs de consumo. Con Q4_K_M o IQ4_XS (12,91 GB) funciona en una RTX 4080 o 4070 Ti Super de 16 GB; con cuantizaciones IQ3 (10-12 GB) incluso en GPUs de 12 GB como la RTX 3060/4070, con sacrificio de calidad.
- **Opciones de despliegue**: llama.cpp (formato nativo GGUF, cuantizado con la release b11845), Ollama, LM Studio, KoboldCpp (popular para roleplay y escritura creativa) y text-generation-webui. También es compatible con cualquier runtime que soporte GGUF.
- **Latencia y throughput**: no disponibles; en una RTX 4090 con Q4_K_M, un modelo de 24B suele alcanzar velocidades del orden de 30-50 tokens/s, aunque esta cifra es una estimación general y no un dato publicado del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| Naphula Cyberdonia-24B-v8 | 24B | GGUF (esta cuantización) | Apache 2.0 | Escritura creativa, RP, ficción |
| Mistral Small 24B (base de la familia de tamaño similar) | 24B | safetensors / GGUF | Apache 2.0 | Modelo generalista con formato de prompt Mistral |
| Midnight Miqu / merges de escritura 70B | 70B | GGUF | Variable (según componentes) | Escritura creativa y RP, mayor calidad pero requiere hardware mucho más potente |

Nota: la comparativa es aproximada por categoría de tamaño y tarea, ya que no se han publicado datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado solo para inglés (en); su rendimiento en castellano no está garantizado y probablemente sea notablemente inferior.
- Longitud de contexto: no disponible en la model card; conviene verificarla en la ficha del modelo base antes de planificar narrativa larga.
- Al ser un merge sin documentación de entrenamiento ni alineación, el riesgo de alucinaciones y de incoherencia factual es posiblemente mayor que en modelos con RLHF/DPO documentado; no es adecuado para tareas que requieran precisión factual.
- Contenido: el modelo está etiquetado para escritura oscura, terror y lenguaje explícito ("swearing"), por lo que puede generar contenido violento o crudo sin filtros; no es apropiado para audiencias sensibles ni para despliegues sin moderación.
- Al no soportar tool calling ni agentes, no es apto para pipelines de automatización o uso como asistente funcional.
- Sesgos: no se ha publicado información sobre sesgos; al derivar de merges de modelos abiertos, hereda potencialmente los sesgos de sus componentes.
- Licencia: Apache 2.0 permite uso comercial, pero los merges pueden heredar restricciones de los modelos originales que lo componen; conviene revisar la ficha del modelo base si el uso es comercial.
- Cuantizaciones Q3 e IQ3 están marcadas explícitamente como de baja calidad y no recomendadas; para escritura creativa, donde la calidad de la prosa es crítica, se recomienda no bajar de Q4_K_M.

## Enlaces

- Cuantización GGUF (esta ficha): https://huggingface.co/bartowski/Naphula_Cyberdonia-24B-v8-GGUF
- Modelo original: https://huggingface.co/Naphula/Cyberdonia-24B-v8
- llama.cpp (herramienta de cuantización e inferencia): https://github.com/ggml-org/llama.cpp/
- Release de llama.cpp usada para la cuantización: https://github.com/ggml-org/llama.cpp/releases/tag/b11845
- Cuantización recomendada por defecto (Q4_K_M): https://huggingface.co/bartowski/Naphula_Cyberdonia-24B-v8-GGUF/blob/main/Naphula_Cyberdonia-24B-v8-Q4_K_M.gguf
