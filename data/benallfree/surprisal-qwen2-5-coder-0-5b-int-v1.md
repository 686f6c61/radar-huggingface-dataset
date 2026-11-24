# benallfree/surprisal-qwen2.5-coder-0.5b-int-v1

## Resumen

Surprisal Qwen2.5-Coder 0.5B INT v1 es una conversión a inferencia exclusivamente entera del modelo Qwen/Qwen2.5-Coder-0.5B, publicada por el desarrollador benallfree. No es un modelo de propósito general para generación de texto, sino el motor de compresión que utiliza la herramienta Surprisal, un compresor sin pérdidas que emplea un modelo de lenguaje como motor de predicción. El modelo sirve para calcular probabilidades de tokens de forma determinista, de modo que un archivo comprimido en una máquina pueda descomprimirse bit a bit en otra distinta.

La conversión mantiene los 503.921.793 parámetros del modelo base Qwen2.5-Coder-0.5B, pero sustituye todas las operaciones en coma flotante por aritmética entera exacta: pesos de 8 bits con escalas de 16 bits, activaciones en formato block-floating-point y tablas de búsqueda (lookup tables) para las funciones no lineales. El resultado se distribuye como un único archivo GGUF v3 de 520.402.688 bytes con SHA-256 fijo, reproducible a partir de la revisión anclada del modelo base.

Su relevancia es muy específica: no compite con modelos conversacionales ni con runtimes GGUF convencionales. Está diseñado para el motor entero de Surprisal (nollama) y no para llama.cpp u otros ejecutores GGUF, por lo que su uso queda restringido al ecosistema de compresión para el que fue creado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-0.5B), convertida a inferencia entera |
| Parametros totales | 503.921.793 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos de 8 bits con escalas de 16 bits; activaciones block-floating-point; tablas de búsqueda para no linealidades (aritmética entera exacta) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF v3 (SPEC.md §1.3), archivo `qwen2.5-coder-0.5b-int-v1.gguf` de 520.402.688 bytes |

## Arquitectura y entrenamiento

El modelo no se ha entrenado desde cero: es una reconversión numérica del checkpoint Qwen/Qwen2.5-Coder-0.5B, un transformer decoder-only denso de aproximadamente 0,5 mil millones de parámetros. La transformación, definida en la especificación SPEC.md v1 del proyecto Surprisal, convierte los pesos a 8 bits con escalas de 16 bits, representa las activaciones mediante block-floating-point y sustituye las funciones no lineales por tablas de búsqueda precalculadas. Toda operación se ejecuta como aritmética entera exacta, lo que garantiza probabilidades idénticas bit a bit independientemente de la GPU o CPU empleada.

El archivo es determinista y reproducible: cualquiera puede reconstruirlo a partir del modelo base en la revisión anclada en `models-v1.json` y obtener el mismo SHA-256 (`2b9fa35d48b67e9170488af611179f46e7d151a4ca7bc015d75da9c1ee554b45`). No se documentan en la información disponible detalles sobre el dataset de entrenamiento original, el número de tokens, ni procesos de RLHF o DPO del modelo base; esos datos corresponden a Qwen2.5-Coder-0.5B y no se reproducen aquí.

## Capacidades

- Cálculo determinista de probabilidades (surprisal) por token, con resultados idénticos bit a bit en cualquier hardware.
- Motor de predicción para compresión sin pérdidas: el modelo alimenta el compresor Surprisal en los niveles `-c1` a `-c3`.
- Inferencia exclusivamente entera, sin dependencia de coma flotante, lo que elimina variaciones entre plataformas.
- No está diseñado para generación de texto libre, chat, tool calling, agentes ni razonamiento multi-paso en el sentido habitual.
- No se documentan capacidades multilingües, de visión, audio ni modo de pensamiento en la información disponible.

## Casos de uso

- Compresión sin pérdidas de archivos y artefactos: el modelo actúa como motor de predicción de Surprisal para comprimir datos y garantizar que el archivo resultante se descomprima de forma idéntica en otra máquina, gracias a la aritmética entera exacta.
- Archivado reproducible a largo plazo: al ser el archivo determinista y verificable por SHA-256, permite reconstruir el motor de descompresión y validar la integridad de los archivos generados años después.
- Distribución de artefactos entre plataformas heterogéneas: un archivo creado en una GPU puede descomprimirse en una CPU distinta sin divergencias numéricas, algo que la inferencia en coma flotante no garantiza.
- Integración en pipelines de CI/CD de compresión: Surprisal descarga automáticamente este modelo la primera vez que un nivel lo necesita, de modo que puede incorporarse a flujos automatizados sin descarga manual.
- Investigación en compresión basada en modelos de lenguaje: sirve como referencia para estudiar el impacto del cálculo entero exacto en la tasa de compresión y en la reproducibilidad.
- Verificación de integridad y auditoría: el SHA-256 fijo y la especificación pública permiten auditar que el motor de compresión no ha sido alterado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 520.402.688 bytes (aproximadamente 0,5 GB); el consumo adicional depende del motor nollama y de las tablas de búsqueda, no cuantificado en la información disponible.
- GPU recomendadas: no disponible. El modelo está pensado para ejecutarse en GPU o CPU indistintamente con resultados idénticos.
- Compatibilidad con GPU de consumo: el tamaño del archivo (unos 0,5 GB) sugiere que cabe holgadamente en cualquier GPU de consumo actual, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: exclusivamente el motor entero de Surprisal (nollama). No es compatible con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso previsto |
|---|---|---|---|---|---|
| Surprisal Qwen2.5-Coder 0.5B INT v1 | 503.921.793 | no disponible | GGUF v3 (entero) | Apache 2.0 | Compresión sin pérdidas con motor entero |
| Qwen2.5-Coder-0.5B (base) | 503.921.793 | no disponible en esta ficha | safetensors | Apache 2.0 | Generación de código y texto |
| Modelos GGUF convencionales de 0,5B | ~500 M | variable | GGUF | variable | Inferencia de texto en llama.cpp/Ollama |

La comparación directa con modelos de generación no es significativa: este modelo no produce texto, sino probabilidades deterministas para compresión, y no funciona en los runtimes GGUF habituales.

## Limitaciones y advertencias

- No es un modelo de chat ni de generación de texto: su única función es alimentar el compresor Surprisal.
- No es compatible con llama.cpp, Ollama, vLLM, TGI ni otros runtimes GGUF; requiere el motor nollama.
- No se documentan sesgos, riesgos de alucinación ni cobertura idiomática en la información disponible; al heredar el modelo base Qwen2.5-Coder-0.5B, podría arrastrar los sesgos de este, pero no se detallan.
- La licencia Apache 2.0 permite uso comercial, pero el uso práctico está condicionado por la dependencia del ecosistema Surprisal.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción todavía nula y ausencia de validación comunitaria.
- La ventana de contexto no está documentada en esta ficha; conviene consultar la del modelo base antes de usarlo con secuencias largas.

## Enlaces

- Hugging Face: https://huggingface.co/benallfree/surprisal-qwen2.5-coder-0.5b-int-v1
- Repositorio Surprisal: https://github.com/benallfree/surprisal
- Especificación SPEC.md: https://github.com/benallfree/surprisal/blob/main/SPEC.md
- Motor nollama: https://github.com/benallfree/nollama
- Lista de modelos v1: https://github.com/benallfree/surprisal/blob/main/spec/models-v1.json
- Modelo base Qwen2.5-Coder-0.5B: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B
