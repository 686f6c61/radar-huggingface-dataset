# Compactbot/sealglazer-1.9m

## Resumen

SealGlazer v11 (1.9M) es un modelo de lenguaje de subpalabras entrenado desde cero (from-scratch) por el autor Compactbot, sin partir de ningún modelo base. Su objetivo declarado es generar texto sobre pinnípedos (focas, morsas y leones marinos) y responde a una petición concreta formulada por el usuario @ereniko en el espacio Compactbot/model-requests. Se publica bajo licencia Apache 2.0, con un único idioma soportado (inglés) y 1.901.696 parámetros totales almacenados en F32.

La relevancia de esta ficha no es la de un modelo utilizable, sino la de un caso documentado de colapso por infrentrenamiento. El propio autor advierte que el modelo es degenerado: en 7 de 8 semillas muestreadas la generación colapsa en bucles de un solo token ("like like like…", "is is is…") y baja temperatura empeora el comportamiento (a temperatura 0,3 se alcanza un 96-98 % de dominancia de un único token). La causa identificada es la relación tokens/parámetro (unos 6,2 tokens por parámetro sobre un corpus de ~11,8 millones de tokens), muy por debajo de las decenas de tokens por parámetro que suelen necesitarse para generalizar.

Arquitectónicamente es un transformer causal de estilo Llama, con una ventana de contexto de solo 256 tokens, vocab BPE de 8192 símbolos, d_model de 128, 4 capas y embeddings atados. El checkpoint publicado corresponde al paso 12.600, con una pérdida de validación de 0,03805 que el autor califica explícitamente de artefacto de memorización de una ventana fija de 256 tokens, no de una señal de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal estilo Llama: RMSNorm + RoPE + MLP SwiGLU + atención multi-cabeza (MHA) |
| Parámetros totales | 1.901.696 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | No disponible. Los pesos se publican en F32 y no se documentan variantes GGUF, AWQ, GPTQ ni cuantizaciones alternativas |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (dtype almacenado F32, 38 tensores). Arquitectura personalizada, no corresponde a un `model_type` estándar de transformers |
| Vocabulario | 8192 (BPE, entrenado desde cero) |
| d_model | 128 |
| Capas | 4 |
| Cabezas | 4 (MHA, head_dim 32) |
| Dimensión del MLP | 384 (SwiGLU) |
| Embeddings atados | Sí (un único `tok.weight` para entrada y `lm_head`) |
| Checkpoint | Paso 12.600 (mejor val 0,03805) |
| Descargas / likes en HuggingFace | 0 descargas / 1 like |
| Fecha de publicación | 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo sigue el patrón de un transformer causal de estilo Llama a escala mínima: normalización RMSNorm, codificación posicional rotatoria (RoPE), MLP con activación SwiGLU y atención multi-cabeza sin variantes de atención eficiente ni decodificación especulativa. Con 4 capas, d_model 128 y una cabeza por cada 32 dimensiones, el bloque completo ocupa 38 tensores y atar los embeddings reduce el recuento de parámetros hasta los 1.901.696 totales. La ventana de contexto es de 256 tokens, y el vocabulario es un BPE de 8192 símbolos entrenado desde cero, sin reutilizar el tokenizador de ningún modelo previo.

El entrenamiento se realizó sobre un corpus mixto de aproximadamente 11,8 millones de tokens, compuesto según el autor por un 88 % de inglés general procedente de FineWeb-Edu y un 12 % de texto sobre pinnípedos, intercalados. La composición se midió muestreando 2000 ventanas aleatorias de 128 tokens, y el autor insiste en que el corpus no es estrecho ni basado en plantillas: el fallo es de escala e infrentrenamiento, no de datos. La relación resultante es de ~6,2 tokens por parámetro. No se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias. La pérdida de validación reportada (0,03805) se calculó sobre una única ventana fija de 256 tokens situada en la frontera entre entrenamiento y validación, por lo que el modelo la memoriza y la cifra se estanca alrededor del paso 2000: el autor la describe como una medida de memorización de ventana, no de capacidad. El modelo se distribuye con un script de carga propio (`load_sealglazer.py`) porque la arquitectura no es estándar y `config.json` solo documenta los campos a modo de referencia.

## Capacidades

- Generación de texto en inglés a nivel de subpalabra, con vocabulario BPE de 8192 símbolos.
- Generación temática sobre pinnípedos: en la única semilla coherente observada (999) produce oraciones gramaticales sobre focas, morsas y leones marinos.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No se documentan capacidades de código, matemáticas, visión, audio ni modo de pensamiento (thinking mode).
- Capacidad monolingüe: únicamente inglés; no se reporta entrenamiento en otros idiomas.
- Inferencia en CPU viable por el tamaño del modelo (menos de 8 MB en F32).
- No se documenta decodificación especulativa, atención lineal, SSM ni ninguna innovación de eficiencia.

## Casos de uso

- Material didáctico sobre colapso de modelos: el caso permite estudiar empíricamente qué ocurre cuando la relación tokens/parámetro cae a ~6,2 y la distribución de salida se colapsa en bucles de un solo token, incluyendo el efecto contraintuitivo de que bajar la temperatura empeora la degeneración.
- Ejemplo de harness de evaluación mal diseñado: la pérdida de validación de 0,03805 calculada sobre una ventana fija de 256 tokens sirve como caso de estudio de cómo una métrica de validación puede medir memorización en lugar de capacidad, y de por qué hace falta un conjunto de validación retenido y diverso.
- Banco de pruebas para scripts de carga de arquitecturas personalizadas: al no ser un `model_type` estándar de transformers, el repositorio incluye un cargador propio que sirve como referencia mínima para implementar y depurar loaders propios.
- Estudio de tokenizadores BPE pequeños: el vocabulario de 8192 símbolos entrenado desde cero permite analizar el comportamiento de un tokenizador de baja cardinalidad en corpus mixtos de dominio general y dominio específico.
- Referencia base para experimentos de escalado controlado: el autor señala que la solución pasa por más tokens por parámetro y un conjunto de validación correcto, por lo que el checkpoint es útil como punto de partida para reproducir el experimento con más datos o más parámetros y comparar.
- Prueba de estrés de samplers y decodificadores: los bucles de repetición de 116 iteraciones observados con `top_p` 0,9 y temperatura 0,7 permiten verificar si un sampler detecta y mitiga degeneraciones extremas de la distribución.
- Demostración de entrenamiento desde cero a escala mínima: el pipeline completo (corpus mixto, BPE propio, checkpoint intermedio, script de carga) es un ejemplo reproducible de extremo a extremo para quien quiera entender las fases de un entrenamiento from-scratch.

Ninguno de estos casos implica uso del modelo como generador de texto fiable: el autor lo marca explícitamente como no recomendado para uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. El único dato numérico reportado es la pérdida de validación, que el propio autor desaconseja interpretar como señal de calidad:

| Métrica | Valor | Observaciones |
|---|---|---|
| Pérdida de validación | 0,03805 (paso 12.600) | Calculada sobre una única ventana fija de 256 tokens en la frontera train/val; el autor la describe como artefacto de memorización |
| Tokens por parámetro | ~6,2 | ~11,8 M de tokens sobre 1.901.696 parámetros |
| Semillas degeneradas | 7 de 8 | Bucles de un solo token con temperatura 0,7 y top_p 0,9 |
| Dominancia de un solo token a temperatura 0,3 | 96-98 % | Indica colapso de la distribución, no un artefacto de muestreo |
| MMLU / HumanEval / GSM8K | No disponible | No publicados |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en F32 para los 1.901.696 parámetros; el modelo cabe en cualquier GPU, iGPU o incluso en memoria de sistema.
- GPU recomendadas: no se requiere GPU. Cualquier GPU, incluida una GTX 1050 o una iGPU integrada, es más que suficiente; también es viable la ejecución íntegra en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual o antigua, sin necesidad de cuantización.
- Opciones de despliegue: al tratarse de una arquitectura personalizada que no corresponde a un `model_type` estándar de transformers, no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El método de despliegue previsto es el script incluido en el repositorio: `python load_sealglazer.py --prompt "..." --seed 999`, con dependencias de `torch`, `safetensors` y `tokenizers`.
- Latencia y throughput: no disponible. No se publican mediciones, aunque por el tamaño y la ventana de 256 tokens se sitúan previsiblemente en el orden de milisegundos por generación en CPU.
- Consideración de capacidad: la ventana de 256 tokens impide cualquier flujo de conversación multi-turno o procesamiento de documentos largos.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de SealGlazer que permitan una comparación de rendimiento. La tabla siguiente contrasta únicamente características estructurales y de licencia con modelos pequeños de propósito general ampliamente conocidos, cuyos datos proceden de su documentación pública y no de una evaluación conjunta:

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| SealGlazer v11 (1.9M) | 1.901.696 | 256 | Apache 2.0 | Publicado, degenerado en 7 de 8 semillas |
| GPT-2 small | ~124 M | 1024 | MIT | Modelo de referencia, usable |
| Pythia-70M | ~70 M | 2048 | Apache 2.0 | Modelo de investigación, usable |
| SmolLM-135M | ~135 M | 2048 | Apache 2.0 | Modelo pequeño de propósito general, usable |

Diferencias destacables: SealGlazer es entre uno y dos órdenes de magnitud más pequeño que las alternativas, tiene la ventana de contexto más corta de la comparativa (256 frente a 1024-2048) y es el único de los cuatro que el propio autor desaconseja para uso real. Los tres alternativos se distribuyen con arquitecturas compatibles con el ecosistema transformers estándar, mientras que SealGlazer requiere un cargador propio. No hay datos de rendimiento comparables entre ellos en la información disponible.

## Limitaciones y advertencias

- Degeneración confirmada: 7 de 8 semillas colapsan en repeticiones de un solo token; el propio autor lo califica de modelo degenerado y no recomendado para uso real.
- La baja temperatura agrava el problema, con un 96-98 % de dominancia de un único token a temperatura 0,3, lo que confirma un colapso de la distribución y no un artefacto del muestreador.
- Infrentrenamiento: ~6,2 tokens por parámetro sobre ~11,8 M de tokens, por debajo de las decenas de tokens por parámetro que se consideran necesarias para generalizar.
- Métrica de validación engañosa: el 0,03805 procede de una única ventana fija de 256 tokens y mide memorización; no debe citarse como indicador de calidad.
- El problema no se resuelve solo ampliando el corpus: el autor indica que hacen falta más tokens por parámetro y un conjunto de validación retenido adecuado, es decir, más escala, no solo mejor mezcla de datos.
- Sesgos conocidos: no se documentan, pero el corpus es un 88 % inglés general de FineWeb-Edu y un 12 % texto sobre pinnípedos, sin filtrado ni mitigación de sesgos reportada.
- Riesgo de alucinación: alto, derivado directamente del colapso de la distribución y de la memorización de ventanas concretas del corpus.
- Limitación de contexto severa: 256 tokens, insuficiente para conversaciones multi-turno, documentos largos o razonamiento encadenado.
- Limitación de idioma: solo inglés; no se reporta ningún otro idioma.
- Compatibilidad: al no ser un `model_type` estándar, no se garantiza su funcionamiento con herramientas del ecosistema como vLLM, llama.cpp, Ollama o TGI, ni conversiones automáticas a GGUF.
- Licencia: Apache 2.0, permite uso comercial en los términos de dicha licencia, sin restricciones adicionales declaradas por el autor, aunque el estado técnico del modelo lo desaconseja para producción.
- Cualquier uso en producción debería ir precedido de una evaluación propia de las muestras en las semillas previstas, dado el comportamiento extremadamente dependiente de la semilla.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/Compactbot/sealglazer-1.9m
- Repositorio de archivos (script `load_sealglazer.py` y `config.json`): https://huggingface.co/Compactbot/sealglazer-1.9m/tree/main
- Petición original que motivó el modelo (Compactbot/model-requests, discusión 3): https://huggingface.co/spaces/Compactbot/model-requests/discussions/3
- Búsqueda web: no se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en los resultados disponibles.
