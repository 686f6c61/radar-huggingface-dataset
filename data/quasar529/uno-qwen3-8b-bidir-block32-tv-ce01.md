# quasar529/uno-qwen3-8b-bidir-block32-tv-ce01

## Resumen

`uno-qwen3-8b-bidir-block32-tv-ce01` es un adaptador LoRA de investigación publicado por el usuario `quasar529` sobre el modelo base `s-sahoo/uno-qwen3-8B`, que a su vez es un bundle de inferencia construido sobre Qwen3-8B. No se trata de un modelo de 8B independiente, sino de un adaptador de rango 128 (alpha 2048, ratio 16) entrenado para una variante experimental de decodificación especulativa tipo Uno, en la que un estudiante atiende de forma bidireccional dentro de bloques ruidosos y predice el token en la misma posición, mientras el profesor permanece causal.

El checkpoint corresponde al paso final 32.813 de un currículo de bloques que escala de 2 a 32, con un objetivo compuesto de 1 × TV-L1 (suma sobre el vocabulario de diferencias absolutas de probabilidad) más 0,1 × entropía cruzada dirigida al argmax del verificador causal limpio. Los datos de entrenamiento provienen de `open-thoughts/OpenThoughts3-1.2M`, con batch global 128 y longitud de secuencia 4096.

Su relevancia es acotada y fundamentalmente investigadora: el propio autor advierte de que es una release de integridad verificada pero no validada en entorno limpio, que no soporta reanudación exacta del entrenamiento (faltan estados de optimizador y RNG) y que las diferencias de precisión observadas no constituyen una mejora de calidad bajo muestreo especulativo exacto. Es material para estudiar decodificación por difusión/bloques sobre Qwen3, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3-8B) con adaptador LoRA sobre atención bidireccional por bloques ruidosos; profesor causal congelado |
| Parametros totales | No disponible para el adaptador; el modelo base es de 8B (dato de la búsqueda web) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `adapter.safetensors` con nombres de parámetros personalizados de `UniformModel` (no es un adaptador PEFT estándar) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el modelo base congelado `s-sahoo/uno-qwen3-8B`, revisión `b8a7577b3223bdcf2b3af0f2fc6e95258b3bbc29`. El estudiante atiende de forma bidireccional dentro de cada bloque ruidoso, predice el token en la misma posición y solo ve el prefijo limpio anterior a ese bloque; el profesor permanece causal. Cada bloque usa ruido completo con probabilidad 0,5; en caso contrario, su probabilidad de reemplazo es uniforme en [0,1]. No hay condicionamiento temporal explícito ni auto-condicionamiento.

El entrenamiento sigue un currículo de tamaño de bloque 2 → 4 → 6 → 8 → 12 → 16 → 32, con LoRA de rango 128 y alpha 2048 (alpha/r = 16). El objetivo combina TV-L1 (suma sobre el vocabulario de diferencias absolutas de probabilidad, equivalente al doble de la variación total matemática) con entropía cruzada opcional dirigida al argmax del verificador causal limpio, no al token original de los datos ni a respuestas generadas nuevas. Los datos son `open-thoughts/OpenThoughts3-1.2M`, con batch global 128 y secuencia de 4096; el padding y el packing implican que las posiciones de token programadas no equivalen a tokens únicos sin padding. El mismo adaptador admite 1, 2 y 4 pasos de denoising, aunque la mejora con pasos adicionales no está garantizada.

## Capacidades

- Generación de texto mediante decodificación por bloques con atención bidireccional interna y profesor causal.
- Decodificación especulativa tipo Uno: el adaptador actúa como estudiante sobre un verificador causal congelado.
- Soporte de 1, 2 y 4 pasos de denoising en la ruta de generación de referencia.
- Razonamiento y matemáticas heredados del modelo base Qwen3-8B y del corpus OpenThoughts3 (no verificados en esta release).
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en decodificación especulativa: usar el adaptador como estudiante en un pipeline Uno para medir tasas de aceptación frente al verificador causal congelado, comparando 1, 2 y 4 pasos de denoising.
- Estudio de objetivos de entrenamiento alternativos: analizar el efecto de TV-L1 combinado con CE dirigida al argmax del verificador frente a objetivos de destilación convencionales.
- Experimentos de atención bidireccional por bloques: evaluar cómo el currículo de bloques 2→32 afecta a la coherencia dentro de bloque con contexto de 4096 tokens.
- Reproducción de integridad de pesos: verificar hashes SHA256 y comparar el export local con el checkpoint original usando `SHA256SUMS.json` y `release.json`.
- Docencia e investigación académica: material para cursos o papers sobre difusión discreta aplicada a LLM, dado que el código de referencia (`code/uniform_uno`) acompaña al adaptador.
- Análisis de limitaciones de reproducibilidad: estudiar qué se pierde al publicar solo pesos sin estados de optimizador/RNG, como caso práctico de empaquetado de releases de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no es una release de benchmarks lista para usar y que las tablas previas de AIME/GSM8K no se reproducen de forma directa con este paquete. Tampoco se establece el mismo TPS en otro servidor, al depender del hardware y del backend.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base es de 8B y el adaptador LoRA de rango 128 añade una fracción pequeña. En bfloat16, el base requiere del orden de 16 GB solo para pesos, más overhead de activaciones y caché KV para 4096 tokens.
- GPU recomendadas: no especificadas por el autor; el código de referencia usa `.cuda()` con `torch.bfloat16` y atención `eager`. Una A100 o H100 es el escenario natural para investigación; no hay validación publicada en otras GPU.
- GPU de consumo: no confirmado. Un base de 8B en bfloat16 no cabe en GPUs de 8-12 GB sin cuantización, y esta release no documenta recetas de cuantización.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp u Ollama de forma directa; requiere el loader personalizado `UniformModel` / `load_adapter` del directorio `code/uniform_uno`, con `code` y `code/upstream` en `PYTHONPATH`. No debe cargarse como adaptador PEFT estándar.
- Latencia y throughput: no establecidos; el autor señala que el TPS depende del hardware y del backend y que la ruta de generación de referencia no debe usarse para reclamar reproducción de TPS de motores optimizados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `quasar529/uno-qwen3-8b-bidir-block32-tv-ce01` | Adaptador LoRA sobre base 8B | 4096 | Adaptador de investigación (Uno, bloques bidireccionales) | Apache 2.0 | Hugging Face, 0 descargas |
| `s-sahoo/uno-qwen3-8B` | Base 8B + adaptador rank-128 | No disponible | Bundle de inferencia Uno | No disponible en la información | Hugging Face |
| `Qwen/Qwen3-8B` | 8B | No disponible en la información | LLM causal estándar | No disponible en la información | Hugging Face |

La comparación de rendimiento entre estas opciones no está disponible: no hay benchmarks publicados para el adaptador y la model card descarta explícitamente presentar las tablas previas como resultados reproducibles.

## Limitaciones y advertencias

- No es un modelo independiente: requiere descargar el base fijado `s-sahoo/uno-qwen3-8B` en la revisión exacta y usar código personalizado; sustituirlo por un Qwen3 genérico invalida el uso.
- No debe cargarse como adaptador PEFT estándar ni usarse con la ruta de drafting causal original de Uno.
- Estado de reproducibilidad: pesos y SHA256 verificados, pero no se ha validado una instalación limpia en servidor, ni la equivalencia de salidas en otra GPU o stack de software.
- No soporta reanudación exacta del entrenamiento: los estados de optimizador y RNG se omiten deliberadamente.
- No es una release de benchmarks: las tablas previas de AIME/GSM8K no se reproducen de forma directa.
- Las diferencias de precisión experimentales no son una afirmación de mejora de calidad bajo muestreo especulativo exacto.
- La mejora con más pasos de denoising (2 o 4 frente a 1) no está garantizada.
- Idiomas: solo inglés según la model card.
- Contexto limitado a 4096 tokens en entrenamiento.
- Riesgo de alucinación y sesgos: no documentados específicamente para este adaptador; hereda los del base y del corpus OpenThoughts3.
- Licencia Apache 2.0 permite uso comercial, pero el código de terceros y el modelo base y datos conservan sus propios términos; es necesario revisar `LICENSE` y `NOTICE` upstream.
- El código del base incluye código remoto (`trust_remote_code`); debe inspeccionarse antes de ejecutarlo.
- 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/quasar529/uno-qwen3-8b-bidir-block32-tv-ce01
- Modelo base: https://huggingface.co/s-sahoo/uno-qwen3-8B
- Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio Uno: https://github.com/ifm-ai/uno
- Dataset OpenThoughts3: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Documentación de reproducibilidad y procedencia: `REPRODUCIBILITY.md`, `release.json`, `SHA256SUMS.json` y `environment-reference.json` dentro del repositorio del adaptador.
