# belebindahugo/rebirth-modernize-7b-lora-gguf

## Resumen

Rebirth modernize pack es una colección de ocho adaptadores LoRA en formato GGUF (f16, aproximadamente 10 MB cada uno) publicados por el desarrollador independiente belebindahugo sobre el modelo base Qwen2.5-Coder-7B-Instruct. Su función es convertir el modelo en un modernizador de código intra-lenguaje: recibe un fichero legado junto con un objetivo de cambio y devuelve el código reescrito con idiomas modernos de ese mismo lenguaje. Cubre JavaScript/TypeScript, Python, Go, Java, C#, Rust, C++ y Swift.

Los adaptadores forman parte de Rebirth AI, un agente offline que solo acepta una reescritura si las pruebas del propio proyecto pasan dentro de un sandbox Docker. No son modelos autónomos: requieren el modelo base Qwen2.5-Coder-7B-Instruct y esperan un formato de prompt crudo con secciones `### Objective`, `### Legacy` y `### Modern`, no una plantilla de chat convencional.

La relevancia de esta ficha es acotada: se trata de un experimento de ajuste fino pequeño (LoRA r=8, α=16, QLoRA 4-bit) entrenado en una GPU de consumo AMD RX 7800 XT, con 22.372 filas de entrenamiento y una evaluación sobre conjuntos de commits reales retenidos. La licencia Apache-2.0 y el formato GGUF lo hacen directamente desplegable en Ollama, pero su alcance es deliberadamente estrecho y conservador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=8, α=16) sobre proyecciones de atención de Qwen2.5-Coder-7B-Instruct (transformer decoder-only) |
| Parametros totales | Adaptador: ~10 MB por fichero (f16); modelo base: 7B (el dato de safetensors de 5.046.272 corresponde al adaptador, no al modelo completo) |
| Parametros activos | No es MoE |
| Longitud de contexto | 4096 tokens (parámetro `num_ctx` del Modelfile); entrenado con secuencias de 512 tokens |
| Tipos de cuantizacion | Adaptadores en f16; base servido como Q4_K_M en Ollama |
| Idiomas soportados | Código en JavaScript/TypeScript, Python, Go, Java, C#, Rust, C++, Swift; idioma natural no especificado |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (adaptadores LoRA); base en GGUF vía Ollama |

## Arquitectura y entrenamiento

Cada adaptador es un LoRA de rango 8 y α 16 aplicado a las proyecciones de atención del modelo base Qwen2.5-Coder-7B-Instruct, entrenado con QLoRA de 4 bits, longitud de secuencia 512, pérdida solo sobre la completación (completion-only loss) y una época. El entrenamiento se ejecutó en una AMD RX 7800 XT. El volumen de datos varía por lenguaje: desde 1.187 filas en Rust hasta 8.308 en JavaScript/TypeScript, con 22.372 filas en total.

Los datos proceden del split de entrenamiento de 24.640 pares de commits de un solo fichero (antes/después) extraídos de CommitPackFT y, para Rust y C++, también de CommitPack. Se filtraron por licencia permisiva, tamaño, parseabilidad con Tree-sitter y calidad del commit. La innovación técnica no está en la arquitectura, sino en el flujo de validación asociado: el agente Rebirth solo conserva una reescritura si las pruebas del proyecto pasan en un sandbox Docker, lo que convierte al adaptador en un generador de sugerencias verificadas por test.

## Capacidades

- Modernización de código intra-lenguaje: reescribe ficheros legados con idiomas modernos del mismo lenguaje a partir de un objetivo en lenguaje natural.
- Cobertura de ocho lenguajes mediante adaptadores independientes: JS/TS, Python, Go, Java, C#, Rust, C++ y Swift.
- Formato de prompt específico con secciones `### Objective`, `### Legacy` y `### Modern`; no usa plantilla de chat.
- Temperatura 0 por defecto, orientado a reescrituras deterministas.
- Integración con Ollama mediante `ADAPTER` en un Modelfile.
- Validación externa por tests (fuera del modelo): el adaptador no ejecuta pruebas, las ejecuta el agente Rebirth.
- No soporta tool calling, function calling, agentes multi-paso, visión ni audio según la información disponible.
- Capacidad multilingüe de lenguaje natural: no disponible.

## Casos de uso

- Modernización de bases de código legadas en Python: dado un módulo con construcciones antiguas y un objetivo como "usar pathlib y type hints", el adaptador devuelve el fichero reescrito; encaja en un pipeline que ejecute pytest antes de aceptar el cambio.
- Migración de JavaScript a TypeScript idiomático: el adaptador de JS/TS reescribe ficheros individuales con patrones modernos, útil para lotes de ficheros pequeños (≤ 512 tokens) procesados por un agente con validación por tests.
- Actualización de proyectos Go a idioms recientes: reescritura de handlers y utilidades con el adaptador de Go, validando con `go test` en el sandbox antes de conservar el cambio.
- Refactor de código Java hacia APIs modernas: el adaptador de Java obtiene la mayor tasa de acierto del pack (20/100 frente a 10/100 del base), adecuado para modernizar clases con APIs obsoletas.
- Modernización de C# en entornos .NET: reescritura de ficheros sueltos con patrones actuales, con revisión humana posterior dado el carácter conservador del adaptador.
- Limpieza de código Rust y C++ con commits de referencia: uso del adaptador correspondiente para aplicar cambios idiomáticos en ficheros pequeños, apoyado en los conjuntos de CommitPack/CommitPackFT.
- Integración en CI/CD como sugeridor de parches: el agente Rebirth puede invocarse sobre un repositorio, generar reescrituras y descartar automáticamente las que rompan tests, reduciendo el riesgo de regresiones.

## Benchmarks y rendimiento

Evaluación sobre conjuntos retenidos de commits reales, servidos como Q4_K_M del base más el adaptador en Ollama. La métrica "soft-exact" cuenta coincidencia con el commit humano tras normalizar espacios; subestima porque otras reescrituras válidas cuentan como fallo.

| Lenguaje | Base 7B | Adaptador | Filas |
|---|---:|---:|---:|
| JS/TS | 0 | 9 | 100 |
| Python | 6 | 18 | 100 |
| Go | 5 | 13 | 100 |
| Java | 10 | 20 | 100 |
| C# | 2 | 11 | 100 |
| Rust | 5 | 7 | 56 |
| C++ | 8 | 16 | 93 |
| Swift | 6 | 13 | 100 |
| **Total** | **42** | **107** | **749** |

En proyectos reales, sobre 14 ficheros de 10 librerías públicas (JavaScript, Python, Go) juzgados por los tests de cada librería: los adaptadores cambiaron 4 ficheros con tests en verde y devolvieron los otros 10 sin cambios. Con el fallback de 14B de Rebirth se cambiaron 4 más (8 de 14 en total); los 6 restantes quedaron intactos y ningún fichero se rompió. Un Qwen2.5-Coder-14B con adaptadores equivalentes solo empató con estos adaptadores de 7B (Go 15 vs 14, Python 19 vs 20 por 100).

## Requisitos de hardware

- VRAM estimada: el adaptador añade ~10 MB; el modelo base Qwen2.5-Coder-7B-Instruct en Q4_K_M requiere aproximadamente 4-5 GB de VRAM, y en f16 en torno a 14-15 GB (estimación estándar para 7B, no publicada en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para Q4_K_M; para f16 se recomienda 16 GB o más (RTX 4090, A100, H100). El autor entrenó en una AMD RX 7800 XT.
- Cabe en GPU de consumo: sí, en Q4_K_M en tarjetas de 8 GB o superiores.
- Despliegue: Ollama es la vía documentada (Modelfile con `ADAPTER` y `FROM qwen2.5-coder:7b-instruct`). Otros motores (llama.cpp, vLLM, TGI) no están documentados para estos adaptadores en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rebirth modernize pack (este) | 7B base + LoRA ~10 MB | 4096 | Modernización intra-lenguaje, 8 lenguajes | Apache-2.0 | GGUF en HF, Ollama |
| Qwen2.5-Coder-7B-Instruct (base) | 7B | 32768 (estándar del base) | Generación de código general | Apache-2.0 | Múltiples formatos |
| Qwen2.5-Coder-14B con adaptadores equivalentes | 14B | No disponible | Modernización intra-lenguaje | Apache-2.0 | Citado por el autor, sin enlace |
| Rebirth migrate pack (`rebirth-xlang-14b-gguf`) | 14B | No disponible | Traducción entre lenguajes | No disponible | Citado por el autor |

## Limitaciones y advertencias

- Entrenado sobre commits de un solo fichero de ≤ 512 tokens; los ficheros largos dependen de la ruta de prompt de chat de Rebirth, no del adaptador.
- Solo modernización intra-lenguaje; para traducción entre lenguajes hay que usar el migrate pack.
- Comportamiento conservador: en la prueba con proyectos reales devolvió 10 de 14 ficheros sin cambios.
- La salida es una sugerencia; sin la validación por tests de Rebirth debe revisarse manualmente.
- La métrica de evaluación es soft-exact y subestima el rendimiento real; no hay benchmarks estándar (MMLU, HumanEval, GSM8K) publicados.
- Sesgos conocidos: no documentados; los datos se limitan a repositorios con licencia permisiva de CommitPack/CommitPackFT, lo que puede infrarepresentar ciertos estilos y dominios.
- Riesgo de alucinación en código: presente como en cualquier modelo generativo; mitigado solo si se ejecutan tests.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento en producción.
- Sin soporte documentado de tool calling, agentes multi-paso, visión ni audio.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/belebindahugo/rebirth-modernize-7b-lora-gguf
- Repositorio Rebirth AI: https://github.com/hugobelebinda/rebirth-ai
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Dataset CommitPackFT: https://huggingface.co/datasets/bigcode/commitpackft
- Dataset CommitPack: https://huggingface.co/datasets/bigcode/commitpack
