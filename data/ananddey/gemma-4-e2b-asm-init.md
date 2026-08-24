# ananddey/gemma-4-E2B-asm-init

## Resumen

`ananddey/gemma-4-E2B-asm-init` es un checkpoint de inicialización preparado para la continuación de pre-entrenamiento (continued pretraining, CPT) del modelo base `google/gemma-4-E2B` sobre texto en asamés (as). No es un modelo entrenado ni ajustado: se trata de una versión del base con un tokenizador SentencePiece propio de 32K tokens optimizado para asamés y una tabla de embeddings inicializada mediante el método FOCUS, que mapea la forma superficial de cada token nuevo a través del tokenizador original de Gemma para obtener representaciones semánticamente coherentes desde el paso cero.

El checkpoint conserva intactos los pesos de las capas transformer del modelo base (35 capas, dimensión oculta 1536) y reduce el vocabulario de 256 000 a 32 000 tokens. Los archivos safetensors del repositorio contienen 2 688 706 115 parámetros (~2,69 mil millones). El autor, Anand Dey, lo publica bajo licencia Gemma con el objetivo de que la comunidad lo entrene sobre el corpus asamés `AsmCorpus` para producir un modelo de lenguaje completo en este idioma de bajo recurso.

La relevancia del proyecto radica en que aborda una lengua con pocos recursos digitales mediante una estrategia de adaptación de tokenizador e inicialización cálida de embeddings, evitando la fase larga de calentamiento de la tabla de incrustaciones. Está pensado exclusivamente como punto de partida para investigación y desarrollo, no como un modelo utilizable directamente en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (transformer, decoder-only) |
| Parametros totales | 2 688 706 115 (~2,69 mil millones) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (8K, heredado del base) |
| Tipos de cuantizacion | no disponible (solo safetensors en bfloat16) |
| Idiomas soportados | asamés (as) |
| Licencia | Gemma Terms of Use (`gemma`) |
| Formato de pesos | safetensors (bfloat16) |

Nota: la model card del autor indica en su tabla de cambios "1.6B params" y "35 layers, 1536 hidden", pero los archivos safetensors del repositorio suman 2,69 mil millones de parámetros. Se recomienda usar el dato de safetensors como referencia real del tamaño del checkpoint.

## Arquitectura y entrenamiento

El checkpoint mantiene la arquitectura del modelo base `google/gemma-4-E2B`, un transformer decoder-only con 35 capas y dimensión oculta de 1536. Los pesos de las capas transformer permanecen sin modificar; solo se sustituye el tokenizador y se redimensiona la tabla de embeddings y la cabeza de salida (lm_head) para pasar de un vocabulario de 256 000 a 32 000 tokens. La cabeza de salida está atada a los embeddings de entrada, igual que en el base.

El tokenizador es un SentencePiece entrenado sobre el dataset `AsmCorpus` (texto monolingüe asamés, equivalente a unos 5,8 mil millones de tokens de Gemma). La model card lo describe como "SentencePiece BPE" en la tabla de cambios y como "unigram" en la sección dedicada; no hay una especificación definitiva sobre el algoritmo exacto. Los tokens especiales son `<unk>` (0), `<s>` (1), `</s>` (2) y el marcador de espacio es `▁` (U+2581).

La inicialización de embeddings se realiza con el método FOCUS (Fast Overlapping token Combinations Using Surface-form): cada token nuevo se mapea a través del tokenizador original de Gemma y se promedian los embeddings base correspondientes. Los tokens especiales se copian exactamente del base. Este procedimiento permite que el modelo disponga de representaciones significativas desde el primer paso de entrenamiento, evitando una larga fase de calentamiento de embeddings.

El checkpoint no ha recibido ningún entrenamiento posterior: no ha pasado por RLHF, DPO ni ajuste fino de instrucciones. Para continuar el pre-entrenamiento, el autor proporciona un script de entrenamiento en GitHub (`train_gemma_as.py`).

## Capacidades

- Generación de texto: como checkpoint de inicialización, puede generar texto si se cargan los pesos, pero la calidad será la del modelo base sin adaptar al asamés; no está diseñado para generar texto coherente en asamés sin entrenamiento previo.
- Continuación de pre-entrenamiento (CPT): es su única capacidad real y documentada. Permite arrancar un entrenamiento de lenguaje en asamés con embeddings ya inicializados semánticamente.
- Adaptación de tokenizador: ofrece un tokenizador SentencePiece de 32K tokens específico para asamés, con cobertura mejorada frente al tokenizador genérico de Gemma.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modos especiales (thinking, visión, audio). No es un modelo multimodal ni instruccional.
- Capacidad multilingüe: no aplica, está orientado exclusivamente al asamés.

## Casos de uso

- **Continuación de pre-entrenamiento (CPT) en asamés**: es el caso de uso principal. El investigador carga el checkpoint con `AutoModelForCausalLM` y `attn_implementation="sdpa"`, y entrena sobre `AsmCorpus` o cualquier corpus asamés para obtener un modelo de lenguaje completo. La inicialización FOCUS acelera la convergencia de la tabla de embeddings.
- **Investigación en adaptación de tokenizadores**: permite estudiar cómo afecta la sustitución de un tokenizador de 256K por uno de 32K específico de una lengua de bajo recurso al rendimiento final del modelo, comparando con el base sin adaptar.
- **Evaluación de métodos de inicialización de embeddings**: el checkpoint sirve como baseline para comparar FOCUS con otras estrategias de inicialización (aleatoria, mapeo de subpalabras, etc.) en el contexto de lenguas minorizadas.
- **Transferencia de representaciones**: dado que las capas transformer conservan los pesos originales, se puede estudiar cuánto conocimiento del modelo base se preserva al cambiar el vocabulario y los embeddings, y cuánto se necesita re-aprender.
- **Entrenamiento de modelos de lenguaje asamés**: como paso previo a la obtención de un modelo asamés completo, que posteriormente podría ajustarse con instrucciones o RLHF.
- **Investigación en lenguas de bajo recurso**: el checkpoint es un recurso didáctico y experimental para equipos que trabajan en PLN para asamés o lenguas vecinas del subcontinente indio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El checkpoint no es un modelo entrenado, por lo que no tiene métricas de MMLU, HumanEval, GSM8K ni otras. Cualquier evaluación de rendimiento requiere completar el pre-entrenamiento sobre el corpus asamés y, posteriormente, evaluar el modelo resultante.

## Requisitos de hardware

- **Inferencia (no recomendada en este estado)**: con ~2,69 mil millones de parámetros en bfloat16, los pesos ocupan aproximadamente 5,4 GB. Podría ejecutarse en una GPU consumer con 8 GB de VRAM (RTX 3060, RTX 4060) o incluso en CPU con llama.cpp si se convirtiera a GGUF, pero la salida no será útil sin entrenamiento previo.
- **Entrenamiento (CPT)**: para continuar el pre-entrenamiento se recomienda al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G) con técnicas de gradiente acumulado y precisión mixta bfloat16. Para datasets grandes o secuencias largas, una A100 de 40/80 GB es más adecuada.
- **Nota técnica**: la model card indica que es obligatorio usar `attn_implementation="sdpa"` porque las capas globales de Gemma 4 usan `head_dim=512`, que supera el límite de FlashAttention.
- **Opciones de despliegue**: no aplica para este checkpoint. No hay versiones GGUF, MLX ni soporte en vLLM, Ollama o TGI documentadas. El formato nativo es safetensors con Transformers.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con otros checkpoints de inicialización para asamés o para lenguas de bajo recurso basados en Gemma. Como referencia, el modelo base `google/gemma-4-E2B` tiene la misma arquitectura (35 capas, 1536 hidden) y vocabulario de 256K, pero sin adaptación al asamés. No hay datos públicos de rendimiento comparativo entre ambos en tareas asamés.

## Limitaciones y advertencias

- **No es un modelo entrenado**: este checkpoint no puede usarse como asistente, generador de texto o modelo de producción. Es un punto de partida para CPT. Usarlo directamente producirá salidas basadas en los pesos del base sin adaptación al asamés.
- **No tiene alineación ni instrucciones**: no ha pasado por ajuste de instrucciones, RLHF ni DPO. No debe emplearse en aplicaciones de chat o asistencia.
- **Inconsistencias en la documentación**: la model card presenta datos contradictorios (1,6B vs 2,69B parámetros; "SentencePiece BPE" vs "unigram"; tags que indican `image-text-to-text` mientras gemma4.dev lo describe como text-only). Se recomienda verificar los archivos reales del repositorio antes de planificar el entrenamiento.
- **Sesgos y alucinación**: no hay datos sobre sesgos, pero al heredar los pesos del modelo base, podría heredar sesgos de Gemma 4. No se puede evaluar la alucinación sin entrenamiento previo.
- **Restricciones de licencia**: la licencia es `gemma` (Gemma Terms of Use), que permite uso comercial pero impone restricciones específicas (prohibición de ciertos usos de alto riesgo, obligaciones de atribución). Conviene revisar los términos de Google antes de usar el modelo en proyectos comerciales.
- **Riesgo de sobreajuste**: al entrenar sobre un corpus asamés de ~5,8 mil millones de tokens, existe riesgo de sobreajuste si el dataset es pequeño o poco diverso. Se recomienda validación con datos externos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ananddey/gemma-4-E2B-asm-init
- Dataset AsmCorpus: https://huggingface.co/datasets/ananddey/asm-corpus
- Script de entrenamiento (GitHub): https://github.com/ananddey05/assamese-dataset/blob/main/scripts/train_gemma_as.py
- Página de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Ficha de Gemma 4 E2B en gemma4.dev: https://gemma4.dev/models/gemma-4-e2b
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/ananddey/gemma-4-E2B-asm-init
