# mradermacher/SEX_ROLEPLAY.v4-3.2-1B-i1-GGUF

## Resumen

SEX_ROLEPLAY.v4-3.2-1B-i1-GGUF es una colección de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo NovaCorp/SEX_ROLEPLAY.v4-3.2-1B, realizadas por mradermacher, un cuantizador muy activo en la comunidad de Hugging Face. El modelo base es un modelo de aproximadamente 1.500 millones de parámetros orientado a juego de rol narrativo (roleplay), creado mediante mergekit a partir de varios modelos, y afinado con datasets de roleplay, escritura creativa y contenido sin censura. No es un modelo de propósito general: su nicho es la generación de conversaciones de rol y ficción, con un entrenamiento que minimiza las negativas de seguridad ("low-refusals", "abliterated").

La relevancia de esta ficha radica en el formato: las cuantizaciones i1-GGUF con imatrix permiten ejecutar el modelo en hardware muy modesto, desde 0,6 GB de archivo en IQ1_S hasta 1,3 GB en Q6_K. Esto lo hace idóneo para usuarios de SillyTavern o KoboldCpp que disponen de portátiles antiguos, mini PCs o GPUs de gama baja. El modelo soporta castellano e inglés y se publica bajo licencia Apache 2.0. Debe subrayarse que el contenido es explícito y está etiquetado como "not-for-all-audiences", por lo que su uso es responsabilidad exclusiva del usuario adulto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (merge de modelos, creado con mergekit) |
| Parámetros totales | 1.498.482.720 (≈1,5 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | Castellano (es) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base está en safetensors |

## Arquitectura y entrenamiento

Se trata de un modelo denso de tipo transformer de unos 1,5 B de parámetros, generado como merge (fusión de pesos) mediante mergekit, una técnica habitual en la comunidad para combinar capacidades de varios modelos base sin entrenamiento completo. El modelo base es NovaCorp/SEX_ROLEPLAY.v4-3.2-1B, y esta versión es la cuantización con matriz de importancia (imatrix) realizada por mradermacher, que calibra la cuantización usando datos representativos para minimizar la pérdida de calidad frente a cuantizaciones estáticas.

El afinado del modelo base emplea nueve datasets públicos en formato ShareGPT, entre ellos AlpacaToxicQA_ShareGPT, varios conjuntos de roleplay (Active_RP, RP_Alignment, sonnet35-charcard-roleplay, hieunguyenminh_roleplay, pippa_sharegpt), escritura creativa (Opus-WritingPrompts-Story2Prompt) y datos generales sin censura (sharegpt_gpt4_uncensored_cleaned), además de sharegpt_cot_dataset para razonamiento encadenado. No hay información disponible sobre el número de tokens de entrenamiento, el uso de RLHF/DPO ni la plantilla de chat exacta. La cuantización cubre desde IQ1_S (extrema, 0,6 GB) hasta Q6_K (1,3 GB), con recomendación del propio cuantizador de usar IQ3_S/IQ4_XS/Q4_K_M como puntos óptimos de equilibrio.

## Capacidades

- Generación de texto narrativo orientado a juego de rol interactivo con personajes (character cards).
- Conversación multi-turno en formato chat, compatible con frontends como SillyTavern y KoboldCpp.
- Escritura creativa y continuación de historias (entrenado con WritingPrompts y PIPPA).
- Contenido sin censura: el modelo está "abliterated" y optimizado para minimizar negativas de seguridad ("low-refusals").
- Razonamiento encadenado básico (incluye sharegpt_cot_dataset en el entrenamiento, aunque no es su punto fuerte).
- Soporte bilingüe castellano/inglés declarado en la ficha.
- No hay evidencia de soporte de tool calling, function calling, agentes, visión ni audio; no disponible.

## Casos de uso

- Roleplay interactivo en SillyTavern: el formato GGUF carga directamente en SillyTavern con llama.cpp, y su tamaño de 1-1,1 GB (Q4_K_M) permite mantener contextos largos en equipos sin GPU dedicada.
- Chat de rol en KoboldCpp en portátiles antiguos: con cuantizaciones IQ2/IQ3 (0,6-0,9 GB) funciona en equipos con 4 GB de RAM, ideal para jugar en cualquier sitio.
- Escritura de ficción asistida: puede usarse como generador de continuaciones de escenas o diálogos de personajes en flujos de escritura creativa.
- Prototipado de personajes (character cards): su tamaño reducido permite iterar rápido sobre prompts de personalidad y escenarios antes de escalar a modelos mayores.
- Uso en Raspberry Pi o SBC: las variantes IQ1_S/IQ2_XXS de 0,6 GB son de las pocas opciones viables para hardware de placa reducida en tareas de rol.
- Generación de contenido adulto sin censura para usuarios adultos que operan localmente y desean privacidad total, sin enviar datos a servicios externos.
- Pruebas comparativas de cuantizaciones: al disponer de 24 variantes, es útil para evaluar empíricamente la degradación de calidad entre niveles de cuantización en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un modelo de roleplay afinado mediante merge, es habitual que el autor no evalúe en benchmarks estándar (MMLU, GSM8K, HumanEval); no hay datos comparativos oficiales.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~0,7 GB (IQ1_S) hasta ~1,4 GB (Q6_K) solo de pesos; se recomienda añadir margen para el KV cache según la longitud de contexto. Cabe íntegro en CPU.
- GPU recomendadas: no requiere GPU. Si se usa aceleración, cualquier GPU con 2 GB de VRAM es suficiente (por ejemplo GTX 1050 o superior); en CPU moderna el rendimiento es plenamente usable.
- Consumer GPUs: cabe con holgura en cualquier GPU doméstica actual, incluidas las de gama de entrada; también funciona solo con CPU y RAM del sistema.
- Opciones de despliegue: llama.cpp, KoboldCpp, SillyTavern (con backend llama.cpp), Ollama, LM Studio y cualquier runtime compatible con GGUF. No está orientado a vLLM/TGI, que no consumen GGUF directamente.
- Latencia y throughput: no disponibles; dada la talla de 1,5 B con cuantización de 4 bits, es de esperar velocidades de decodificación altas incluso en CPU (decenas de tokens por segundo en procesadores modernos), aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad GGUF |
|---|---|---|---|---|---|
| SEX_ROLEPLAY.v4-3.2-1B (esta ficha) | ≈1,5 B | No disponible | Apache 2.0 | Roleplay sin censura | Sí, 24 cuants i1 con imatrix |
| Llama 3.2 1B Instruct | 1,24 B | 128K | Llama 3.2 Community | Uso general, con filtros | Sí (oficial y comunidad) |
| Qwen2.5 1.5B Instruct | 1,54 B | 32K (128K con YaRN) | Apache 2.0 (algunas variantes) | Uso general, multilingüe | Sí (oficial) |
| TinyDolphin / modelos abliterated 1B | ≈1,1 B | 4-32K según base | Variadas | Chat sin censura general | Sí (comunidad) |

Frente a Llama 3.2 1B o Qwen2.5 1.5B, este modelo sacrifica capacidad general, razonamiento y contexto a cambio de un comportamiento especializado en roleplay sin negativas. Frente a otros modelos abliterated de 1B, destaca por su afinado específico en roleplay y por la amplitud de cuantizaciones imatrix disponibles.

## Limitaciones y advertencias

- Contenido para adultos: el modelo genera material explícito sin filtros; está etiquetado "not-for-all-audiences" y no debe usarse en entornos con menores ni en producción comercial sin revisión legal.
- Riesgo elevado de alucinación y de calidad narrativa irregular: al ser un merge de 1,5 B con datasets heterogéneos y sin benchmarks publicados, la coherencia a contextos largos es limitada.
- Longitud de contexto no documentada: no se sabe cuántos tokens soporta; puede ser muy inferior a los modelos generales modernos.
- Sesgos: entrenado con datasets sin limpieza de sesgos ni de contenido tóxico (AlpacaToxicQA, datos "uncensored"), por lo que puede reproducir estereotipos y lenguaje ofensivo.
- Cuantizaciones extremas (IQ1_S, IQ2_XXS) degradan notablemente la calidad; el propio cuantizador las marca como "desperate" y recomienda IQ3_S o superior.
- Rendimiento en tareas de razonamiento, código o matemáticas será claramente inferior al de modelos generales de tamaño similar.
- La licencia Apache 2.0 del modelo y de la cuantización permite uso comercial, pero los datasets de entrenamiento y los modelos fusionados pueden tener términos propios que conviene verificar.
- Sin soporte documentado de tool calling, agentes, visión ni audio.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/mradermacher/SEX_ROLEPLAY.v4-3.2-1B-i1-GGUF
- Modelo base: https://huggingface.co/NovaCorp/SEX_ROLEPLAY.v4-3.2-1B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/SEX_ROLEPLAY.v4-3.2-1B-GGUF
- Página de descarga resumida: https://hf.tst.eu/model#SEX_ROLEPLAY.v4-3.2-1B-i1-GGUF
- Guía de uso de GGUF referenciada: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
