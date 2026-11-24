# Kannaka/kute

## Resumen

KUTE (Kannaka Universal Tokenization Engine) es una herramienta de tokenización, no un modelo de lenguaje. Desarrollada por Kannaka Labs, proporciona un motor en Rust capaz de entrenar, almacenar, intercambiar y aplicar vocabularios sobre datos que van mas alla del texto: bytes, registros estructurados y secuencias de eventos. Cada vocabulario se materializa como un fichero versionado y verificable en formato KVF 0.1, con digests de contenido y vectores de prueba embebidos. El repositorio de Hugging Face actua unicamente como espejo del codigo fuente en GitHub y no contiene pesos de ningun modelo.

La relevancia de KUTE reside en su enfoque modular: una interfaz generica de tokenizador con registro de algoritmos y adaptadores permite incorporar nuevos metodos sin modificar el nucleo. Incluye BPE a nivel de byte en Rust nativo, BPE sobre simbolos nombrados (por ejemplo, eventos), y lineas base como bytes, char y dictionary. Dispone de adaptadores para binario, texto, JSON, JSONL y JSONL de eventos, con declaracion explicita de si cada combinacion es sin perdida o canonicalizante.

El proyecto se encuentra en estado v0.1 experimental, con APIs y formatos susceptibles de cambiar antes de la version 1.0. Se distribuye con doble licencia MIT o Apache-2.0. No se han publicado pesos, benchmarks de modelos ni resultados de evaluacion de capacidad linguistica, ya que no es un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de tokenizacion en Rust (workspace con crates); no es un modelo neuronal |
| Parametros totales | no disponible (no aplica; no hay pesos) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (el motor opera sobre bytes y estructuras, no sobre idiomas) |
| Licencia | Doble licencia MIT o Apache-2.0 |
| Formato de pesos | no disponible; el artefacto principal es el vocabulario en formato KVF 0.1 y contenedor `.kute` |

## Arquitectura y entrenamiento

KUTE se organiza como un workspace de Rust con crates especializados: `kute-types` (tipos compartidos, errores, identificadores y modelo de vocabulario), `kute-core` (traits `Tokenizer`, `ModalityAdapter` y `RepresentationBackend`, mas el registro), `kute-bpe` (BPE de byte y BPE de secuencia, con backend opcional `rustbpe`), `kute-algorithms` (bytes, char, dictionary), `kute-adapters` (binary, text, json, jsonl, jsonl-events), `kute-vocab` (lectura, escritura, validacion, comparacion y exportacion a formato tiktoken), `kute` (motor unificado), `kute-bench` (arnes de evaluacion) y `kute-cli` (comando `kute`). Ademas incluye bindings de Python via PyO3 construidos con maturin y un plugin experimental `hrm` que mapea contenido de tokens a vectores de fase deterministas como interfaz estable para investigacion en Holographic Resonance Medium.

El "entrenamiento" en KUTE se refiere al ajuste del vocabulario BPE sobre un corpus, no al entrenamiento de redes neuronales. El formato KVF 0.1 incorpora digests de contenido, vectores de prueba embebidos y validacion estricta. Los cuatro vocabularios de ejemplo incluidos en `examples/vocabularies/` estan entrenados sobre datos sinteticos y sirven solo para probar las herramientas. La suite de benchmarks reporta tamano serializado completo, con y sin fichero de vocabulario, comparado con gzip, y la mayoria de los conjuntos de datos de la suite son sinteticos y estan etiquetados como tales. El backend `rustbpe` requiere un interprete de Python en tiempo de compilacion y de ejecucion, y esta fijado a una revision git concreta.

## Capacidades

- Entrenamiento de vocabularios BPE a nivel de byte en Rust nativo, con tamano de vocabulario configurable (por ejemplo, 2000 o 2048 tokens en los ejemplos).
- BPE sobre secuencias de simbolos nombrados (`sequence-bpe`), orientado a eventos.
- Algoritmos de linea base: `bytes`, `char` y `dictionary`.
- Adaptadores de entrada: binario y texto (ambos byte-exactos), JSON y JSONL (canonicalizantes), y JSONL de eventos (conserva un campo por registro).
- Validacion e inspeccion de vocabularios (`kute validate`, `kute inspect --longest N`).
- Codificacion y decodificacion con garantia declarada de perdida por componente: binario y texto son sin perdida; JSON y JSONL devuelven JSON canonico (claves ordenadas, compacto); JSONL de eventos solo conserva el campo elegido.
- Exportacion de vocabularios al formato de tiktoken.
- Bindings de Python mediante PyO3 y maturin.
- CLI `kute` con subcomandos `train`, `encode`, `decode`, `validate` e `inspect`.
- Suite de benchmarks reproducible con comparacion frente a gzip.
- Contrato experimental de adaptador para investigacion HRM (solo interfaz, sin afirmaciones de utilidad).
- No incluye: servicio de registro, firmas, streaming, importacion desde otros formatos de tokenizador, ni adaptadores para ADN, telemetria, matematicas o circuitos cuanticos.

## Casos de uso

- Tokenizacion de mensajes de agentes en JSONL: el adaptador `jsonl` permite entrenar un vocabulario sobre trazas de conversacion (por ejemplo, `{"from": "kannaka", "intent": "accept"}`) y codificar/decodificar mensajes de forma canonicalizante, util para pipelines de agentes que necesitan un vocabulario estable y versionado.
- Deteccion de secuencias recurrentes de eventos: el adaptador `jsonl-events` conserva un unico campo por registro y `sequence-bpe` opera sobre simbolos nombrados, lo que sirve para identificar patrones repetidos en flujos de eventos (no para almacenar logs completos).
- Intercambio reproducible de vocabularios entre equipos: el formato KVF 0.1 con digests de contenido y vectores de prueba embebidos permite verificar que dos partes usan exactamente el mismo vocabulario antes de procesar datos.
- Tokenizacion byte-exacta de datos binarios: los adaptadores `binary` y `text` con cualquier algoritmo incorporado garantizan que la decodificacion devuelve los bytes originales, adecuado para preprocesar corpus binarios sin perdida.
- Integracion con ecosistemas que usan tiktoken: la exportacion al formato de tiktoken permite reutilizar vocabularios entrenados con KUTE en herramientas compatibles.
- Investigacion en representaciones HRM: el plugin `hrm` ofrece una interfaz estable que mapea contenido de tokens a vectores de fase deterministas, como punto de partida para experimentos, sin que el repositorio valide su utilidad.
- Evaluacion comparativa de compresion: la suite `kute-bench` reporta tamano serializado con y sin vocabulario frente a gzip, permitiendo decidir si un vocabulario compensa su coste en un conjunto de datos concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos en la informacion disponible. La model card menciona una suite de benchmarks reproducible (`benchmarks/`) que reporta tamano serializado completo con y sin fichero de vocabulario frente a gzip, pero no se incluyen cifras concretas en la informacion proporcionada. No se inventan numeros.

## Requisitos de hardware

- No aplica VRAM de inferencia: KUTE no es un modelo neuronal y no requiere GPU.
- Requiere toolchain de Rust para compilar el workspace (`cargo build --release -p kute-cli`).
- El backend opcional `rustbpe` requiere un interprete de Python en tiempo de compilacion y ejecucion; en Windows debe configurarse `PYO3_PYTHON` y anadir el directorio del interprete al `PATH`.
- Los bindings de Python requieren maturin (`maturin develop --release`) y pytest para las pruebas.
- El consumo de memoria y CPU depende del tamano del corpus y del vocabulario; no se proporcionan cifras de latencia ni throughput en la informacion disponible.
- Despliegue: CLI nativa, biblioteca Rust y paquete Python; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI porque no aplican a un tokenizador.

## Comparativa con modelos similares

| Herramienta | Tipo | Algoritmos | Formatos de vocabulario | Licencia | Estado |
|---|---|---|---|---|---|
| KUTE | Motor de tokenizacion en Rust | BPE byte, sequence-BPE, bytes, char, dictionary | KVF 0.1 con digests y vectores de prueba; exportacion a tiktoken | MIT o Apache-2.0 | v0.1 experimental |
| tiktoken | Tokenizador BPE en Python/Rust | BPE | Formato propio de tiktoken | MIT | Estable, orientado a texto |
| Hugging Face tokenizers | Biblioteca de tokenizacion en Rust/Python | BPE, WordPiece, Unigram | `tokenizer.json` | Apache-2.0 | Estable, orientado a texto |

No se dispone de datos de rendimiento comparativo entre estas herramientas en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales; KUTE se diferencia por soportar datos no textuales (binario, JSON, eventos) y por el formato KVF con validacion estricta.

## Limitaciones y advertencias

- Estado v0.1 experimental: los formatos y las APIs pueden cambiar antes de la version 1.0.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes; no debe evaluarse como modelo generativo.
- No hay pesos en el repositorio de Hugging Face; es un espejo del codigo fuente.
- Los cuatro vocabularios de ejemplo estan entrenados sobre datos sinteticos y sirven solo para probar las herramientas.
- No se hacen afirmaciones de compresion mas alla de lo que muestran los benchmarks; en conjuntos de datos pequenos el vocabulario cuesta mas de lo que ahorra.
- No se hacen afirmaciones sobre HRM: el plugin es solo una interfaz y la utilidad de las representaciones es una pregunta de investigacion abierta no testeada en el repositorio.
- La comparacion de vocabularios empareja tokens por contenido, no por significado; no hay equivalencia semantica.
- Sin garantias de privacidad: un vocabulario puede revelar cadenas frecuentes de sus datos de entrenamiento, y un fichero `.kute` es decodificable por cualquiera que tenga el vocabulario.
- El adaptador `jsonl-events` descarta todos los campos salvo el elegido; no es adecuado para almacenar logs.
- El backend `rustbpe` anade dependencia de Python en compilacion y ejecucion y esta fijado a una revision git concreta.
- No incluido en v0.1: servicio de registro, firmas, streaming, importacion desde otros formatos de tokenizador y adaptadores para ADN, telemetria, matematicas o circuitos cuanticos.
- La licencia se declara como "other" en Hugging Face con nombre `mit-or-apache-2.0`; conviene revisar el enlace de licencia del repositorio GitHub antes de uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/Kannaka/kute
- Repositorio GitHub: https://github.com/kannaka-labs/kute
- Licencia (README del repositorio): https://github.com/kannaka-labs/kute/blob/main/README.md#license
- Especificacion KVF 0.1: `specifications/kvf/KVF-0.1.md` (dentro del repositorio)
- Casos de uso documentados: `docs/use-cases.md` (dentro del repositorio)
- Contrato HRM: `docs/` (dentro del repositorio)
- Benchmarks: `benchmarks/` (dentro del repositorio)
