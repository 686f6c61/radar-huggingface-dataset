# anaaaaaa13421312/zenz-kana-slm-40m-bpe2k

## Resumen

zenz-kana-slm-40m-bpe2k es un modelo de lenguaje de muy pequeno tamano (38,81 millones de parametros) desarrollado por el usuario anaaaaaa13421312, disenado especificamente para generar texto japones exclusivamente en katakana. Su proposito no es la generacion de lenguaje natural completa, sino actuar como la primera etapa de un pipeline de decodificacion kana-kanji: el modelo produce una secuencia en katakana que despues se transforma en texto con kanji mediante un decodificador externo como Miwa-Keita/zenz.

El modelo emplea la arquitectura LlamaForCausalLM con embeddings atados (tie_word_embeddings=True), 12 capas, dimension oculta de 512 y atencion con 8 cabezas de consulta y 4 de clave-valor (GQA). Su vocabulario es de solo 2048 tokens (BPE), lo que lo hace extremadamente compacto y adecuado para entornos con recursos muy limitados. La longitud maxima de secuencia es de 512 tokens.

Es relevante ahora porque explora una via poco habitual: separar la generacion linguistica de la conversion de escritura, delegando la parte de kanji a un modelo especializado ya existente. Esto permite obtener un SLM de menos de 40M de parametros con una perdida de validacion final de 2,0664 (PPL 7,896) en la tarea de generar katakana, lo que abre la puerta a despliegues en dispositivos muy restringidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, tie_word_embeddings=True) |
| Parametros totales | 38.810.112 (~38,81 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja), salida restringida a katakana |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo Llama con 12 capas, dimension oculta de 512, 8 cabezas de atencion de consulta y 4 de clave-valor (atencion con query groups, GQA), y embeddings de entrada y salida atados. El vocabulario BPE es de 2048 tokens, una eleccion que reduce drasticamente el tamano de la matriz de embeddings y encaja con la naturaleza restringida del dominio katakana. La variante se identifica como `kana-bpe-2k`.

El entrenamiento se realizo en dos fases: un preentrenamiento sobre el dataset `hotchpotch/fineweb-2-edu-japanese` y un ajuste supervisado (SFT) sobre `llm-jp/oasst2-33k-ja` y `kunishou/databricks-dolly-15k-ja`. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El resultado del SFT reportado por el autor es una perdida de validacion de 2,0664 y una perplejidad de 7,896.

## Capacidades

- Generacion de texto en japones restringida al silabario katakana.
- Produccion de secuencias de katakana pensadas para ser convertidas posteriormente a kanji por un decodificador externo (zenz).
- Modelado de lenguaje causal de dominio estrecho con vocabulario de 2048 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue: no disponible; el modelo esta declarado unicamente para japones.
- Capacidad especial: integracion como etapa generativa en un pipeline kana-kanji junto a Miwa-Keita/zenz-v3.1-small y Miwa-Keita/zenz-v3.2-small-gguf.

## Casos de uso

- Generacion de texto japones para conversion kana-kanji: el modelo produce katakana que un decodificador zenz transforma en texto con kanji, permitiendo construir un pipeline ligero de generacion en japones con un SLM de menos de 40M de parametros.
- Prototipado en dispositivos con recursos minimos: con 38,81M de parametros y un vocabulario de 2048, el modelo puede ejecutarse en CPU o GPUs de gama baja para experimentos de generacion en japones.
- Investigacion sobre tokenizacion restringida: sirve como banco de pruebas para estudiar como afecta un vocabulario BPE de 2048 tokens a la calidad de generacion en un silabario concreto.
- Evaluacion de pipelines desacoplados de escritura: util para comparar la calidad de la generacion kana frente a modelos que generan kanji directamente, aislando la contribucion de cada etapa.
- Generacion de datos sinteticos en katakana: puede emplearse para producir corpus de katakana con fines de aumento de datos o pruebas de sistemas de conversion de escritura.
- Docencia y experimentacion con SLM: su tamano y su licencia CC-BY-SA permiten usarlo en entornos academicos para ilustrar arquitecturas Llama a pequena escala y flujos de preentrenamiento mas SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es la perdida de validacion final del SFT (2,0664) y la perplejidad asociada (7,896).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (38,81M de parametros, aproximadamente 155 MB en fp32); el repo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1 GB de memoria, e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, vLLM y TGI son compatibles con arquitecturas Llama; no se documenta una configuracion especifica probada por el autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| zenz-kana-slm-40m-bpe2k | 38,81 M | 512 | cc-by-sa-4.0 | Generacion en katakana para pipeline kana-kanji |
| Miwa-Keita/zenz-v3.1-small | no disponible | no disponible | CC-BY-SA 4.0 | Decodificador kana-kanji de referencia |
| Miwa-Keita/zenz-v3.2-small-gguf | no disponible | no disponible | CC-BY-SA 4.0 | Version GGUF del decodificador kana-kanji |

No se dispone de datos de parametros, contexto ni rendimiento de los modelos zenz en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- La salida esta restringida a katakana; no genera kanji ni hiragana de forma fiable por diseno.
- Depende de un decodificador externo (zenz) para producir texto japones con kanji; sin ese componente el resultado es de utilidad limitada.
- Longitud de contexto muy corta (512 tokens), insuficiente para documentos largos o conversaciones extensas.
- Vocabulario de 2048 tokens, lo que limita la cobertura lexica y puede degradar la calidad fuera del dominio de entrenamiento.
- Riesgo de alucinacion y de secuencias de katakana incoherentes, especialmente en temas no representados en los datasets de preentrenamiento y SFT.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La licencia cc-by-sa-4.0 permite uso comercial pero exige atribucion y compartir las obras derivadas bajo la misma licencia.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.
- No se documentan cuantizaciones disponibles ni resultados de benchmarks, lo que dificulta evaluar su calidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anaaaaaa13421312/zenz-kana-slm-40m-bpe2k
- Dataset de preentrenamiento: https://huggingface.co/datasets/anaaaaaa13421312/zenz-kana-slm-pretrain-ja
- Dataset de SFT: https://huggingface.co/datasets/anaaaaaa13421312/zenz-kana-slm-sft-ja
- Fuente de preentrenamiento: https://huggingface.co/datasets/hotchpotch/fineweb-2-edu-japanese
- Fuente SFT (OASST2 ja): https://huggingface.co/datasets/llm-jp/oasst2-33k-ja
- Fuente SFT (Dolly ja): https://huggingface.co/datasets/kunishou/databricks-dolly-15k-ja
- Decodificador de referencia: https://huggingface.co/Miwa-Keita/zenz-v3.1-small
- Decodificador de referencia (GGUF): https://huggingface.co/Miwa-Keita/zenz-v3.2-small-gguf
