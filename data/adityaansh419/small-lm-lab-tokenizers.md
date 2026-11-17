# adityaansh419/small-lm-lab-tokenizers

## Resumen

`adityaansh419/small-lm-lab-tokenizers` no es un modelo de lenguaje, sino un repositorio de tokenizadores publicado como parte del proyecto de investigación small-lm-lab, un estudio sobre el entrenamiento de modelos de lenguaje pequeños con métodos modernos en cómputo gratuito. El repositorio contiene dos tokenizadores en formato Hugging Face `tokenizers`: uno propio de byte-level BPE con vocabulario de 16.384 tokens y una redistribución sin modificar del tokenizador de SmolLM2-135M con 49.152 tokens, necesario para destilar conocimiento de profesores SmolLM2.

El tokenizador propio se ha entrenado sobre 1,2 GB de texto de un mix de web real compuesto por FineWeb-Edu (57%), DCLM-Baseline (38%) y FineMath-4+ (5%), con un patrón de pre-tokenización derivado de GPT-4/Llama 3 pero que separa los números en dígitos individuales. La elección de 16.384 entradas de vocabulario responde a una medición interna del coste de entrenamiento por byte de texto para modelos de 35 a 75 millones de parámetros, según se documenta en el repositorio del proyecto.

Su relevancia es acotada pero concreta: sirve como pieza reproducible para cualquiera que quiera replicar o auditar el pipeline de tokenización de small-lm-lab, y como referencia para calcular bits por byte gracias al fichero `token_bytes.npy` que acompaña a cada tokenizador. No hay pesos de modelo, ni pipeline de inferencia, ni datos de rendimiento publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica (tokenizador, no modelo); algoritmo byte-level BPE en `own-16384` |
| Parámetros totales | No disponible (no es un modelo de lenguaje) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible (depende del modelo que use el tokenizador) |
| Tipos de cuantización | No disponible (no aplica a tokenizadores) |
| Idiomas soportados | No disponible (el vocabulario byte-level cubre cualquier texto UTF-8; no se declaran idiomas) |
| Licencia | MIT para `own-16384`; Apache-2.0 para `smol2` (redistribución sin modificar de SmolLM2-135M) |
| Formato de pesos | `tokenizer.json` (cargable con `tokenizers.Tokenizer.from_file`), `token_bytes.npy`, `manifest.yaml` con SHA-256 |

## Arquitectura y entrenamiento

El tokenizador `own-16384` es un byte-level BPE con los 256 valores de byte incluidos en el vocabulario, lo que garantiza que cualquier texto es codificable y la decodificación es sin pérdida. La pre-tokenización usa el patrón de split de GPT-4/Llama 3 con una modificación: los números se separan en dígitos individuales. Los tokens especiales ocupan los ids 0 a 7: `<|endoftext|>`, `<|im_start|>`, `<|im_end|>` (turnos ChatML), `<|pad|>` y cuatro reservados. El entrenamiento se realizó sobre 1,2 GB de texto del mix de web real del proyecto, con revisiones fijadas en `configs/data_sources.yaml`.

La decisión de vocabulario de 16.384 se justifica por mediciones internas del proyecto (documento `docs/DECISIONS.md`, decisión D-019): entre candidatos de 4K a 32K, 16.384 minimiza el cómputo de entrenamiento por byte de texto para modelos de 35 a 75 millones de parámetros. El segundo tokenizador, `smol2`, es el de `HuggingFaceTB/SmolLM2-135M` en la revisión `93efa2f097d58c2a74874c7e644dbc9b0cee75a2`, redistribuido sin cambios bajo Apache-2.0 para permitir la destilación desde profesores SmolLM2. El autor advierte (decisión D-021) que ese vocabulario carece de tokens para 21 valores de byte, incluidos seis caracteres de control ASCII, por lo que el texto debe limpiarse antes de codificar para mantener la pérdida cero.

Cada carpeta incluye además `token_bytes.npy`, con la longitud en bytes UTF-8 de cada token (0 para tokens especiales), pensado para calcular bits por byte, y `manifest.yaml` con el SHA-256 de cada fichero, que los jobs del proyecto verifican antes de usar los tokenizadores.

## Capacidades

- Tokenización byte-level BPE sin pérdida para cualquier texto UTF-8 en `own-16384`.
- Pre-tokenización compatible con el patrón GPT-4/Llama 3, con separación de números en dígitos.
- Soporte de formato de chat ChatML mediante los tokens `<|im_start|>` y `<|im_end|>`.
- Token de padding (`<|pad|>`) y cuatro tokens reservados para extensiones futuras.
- Cálculo de bits por byte mediante el fichero auxiliar `token_bytes.npy`.
- Verificación de integridad de ficheros mediante hashes SHA-256 en `manifest.yaml`.
- Compatibilidad con la librería `tokenizers` de Hugging Face (`Tokenizer.from_file`).
- Tokenizador alternativo (`smol2`) alineado con SmolLM2-135M para destilación.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente: es exclusivamente un componente de tokenización.

## Casos de uso

- Replicación del pipeline de small-lm-lab: cargar `own-16384/tokenizer.json` con `tokenizers.Tokenizer.from_file` para entrenar modelos de 35 a 75 millones de parámetros con el mismo esquema de tokenización que el proyecto original, lo que permite comparar resultados de forma directa.
- Destilación desde SmolLM2: usar `smol2/tokenizer.json` para garantizar que las secuencias de entrenamiento del estudiante coinciden token a token con las del profesor SmolLM2-135M, condición necesaria para que la destilación por logits sea válida.
- Cálculo de bits por byte en evaluaciones de compresión: combinar las salidas del tokenizador con `token_bytes.npy` para obtener la métrica BPB en corpus de validación, útil para comparar tokenizadores de distinto tamaño de vocabulario de forma justa.
- Investigación sobre tamaño de vocabulario: el repositorio documenta la metodología (D-019) para elegir 16.384 entradas en modelos pequeños; sirve como punto de partida reproducible para estudios sobre el compromiso entre vocabulario, longitud de secuencia y coste de entrenamiento.
- Formateo de diálogos en pipelines de instrucción: los tokens ChatML (`<|im_start|>`, `<|im_end|>`) permiten construir plantillas de conversación multi-turno en experimentos de fine-tuning de instrucciones con modelos pequeños.
- Auditoría de integridad en entornos de investigación: el `manifest.yaml` con SHA-256 permite que scripts de entrenamiento verifiquen que los tokenizadores no han sido alterados antes de lanzar jobs, un patrón útil en clústeres compartidos o en reproducibilidad de papers.
- Preprocesado de corpus web mixtos: el tokenizador se entrenó sobre FineWeb-Edu, DCLM-Baseline y FineMath-4+, por lo que es adecuado para proyectos que usen esas mismas fuentes y quieran evitar desajustes de dominio en la tokenización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No aplica VRAM de inferencia: el repositorio no contiene pesos de modelo, solo ficheros de tokenizador.
- El tamaño del repositorio es de 0,0 GB según Hugging Face; los ficheros `tokenizer.json` de vocabularios de 16K y 49K son del orden de megabytes y se cargan en CPU.
- Cabe en cualquier máquina, incluidos portátiles sin GPU; la tokenización es una operación de CPU.
- Despliegue mediante la librería `tokenizers` (Rust) de Hugging Face; también es consumible desde `transformers` cuando se empareje con un modelo.
- No se dispone de datos de latencia o throughput en la información proporcionada; en la práctica, la tokenización byte-level BPE es órdenes de magnitud más rápida que la inferencia del modelo que la use.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Algoritmo | Cobertura de bytes | Licencia | Uso previsto |
|---|---|---|---|---|---|
| `own-16384` (este repo) | 16.384 | Byte-level BPE, split GPT-4/Llama 3 con dígitos separados | 256/256 bytes | MIT | Modelos pequeños de 35-75M en small-lm-lab |
| `smol2` (este repo, redistribución) | 49.152 | Tokenizador de SmolLM2-135M | 235/256 bytes (faltan 21 valores) | Apache-2.0 | Destilación desde profesores SmolLM2 |
| Tokenizador de Llama 3 | 128.256 | Byte-level BPE | 256/256 bytes | Licencia Llama 3 | Modelos de 8B en adelante |
| Tokenizador de GPT-2 | 50.257 | Byte-level BPE | 256/256 bytes | MIT | Referencia histórica para modelos pequeños |

La comparación se limita a características del tokenizador; no hay datos de rendimiento downstream publicados para `own-16384` en la información disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni puede usarse para inferencia; quien busque un modelo debe acudir al repositorio principal de small-lm-lab (enlace pendiente de publicación según la model card).
- El tokenizador `smol2` no cubre 21 valores de byte, incluidos seis caracteres de control ASCII; sin limpieza previa del texto, la codificación no es reversible (decisión D-021 del proyecto).
- El vocabulario de 16.384 está optimizado para modelos de 35 a 75 millones de parámetros; usarlo con modelos mucho mayores puede ser subóptimo en coste por token.
- La separación de números en dígitos individuales alarga las secuencias numéricas y puede penalizar tareas con muchos datos numéricos si no se compensa con el resto del diseño.
- Los datos de entrenamiento del tokenizador (FineWeb-Edu, DCLM-Baseline, FineMath-4+) arrastran los sesgos y filtrados de esas fuentes; la licencia MIT del tokenizador no exime de las obligaciones de atribución de los datos (ODC-By 1.0, CC-BY-4.0, ODC-By 1.0).
- El repositorio no declara idiomas soportados; la cobertura byte-level permite codificar cualquier UTF-8, pero la eficiencia de compresión en idiomas distintos del inglés no está documentada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso externo ni de validación por terceros.
- El campo `pipeline` no está definido y el tamaño del repo aparece como 0,0 GB, lo que sugiere que la publicación es reciente o mínima; conviene verificar los hashes del `manifest.yaml` antes de usarlo en producción.
- No hay información sobre mantenimiento, versionado ni política de cambios del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/adityaansh419/small-lm-lab-tokenizers
- Tokenizador de referencia SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M (revisión `93efa2f097d58c2a74874c7e644dbc9b0cee75a2`)
- Repositorio del proyecto small-lm-lab: no disponible (la model card indica que el enlace se añadirá en el lanzamiento)
- Documentación interna citada: `docs/DECISIONS.md` (decisiones D-019 y D-021) y `configs/data_sources.yaml`, no disponibles públicamente en la información proporcionada
- Paper, blog o demo: no disponible
