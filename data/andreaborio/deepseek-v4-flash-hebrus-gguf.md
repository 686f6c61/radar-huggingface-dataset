# andreaborio/DeepSeek-V4-Flash-Hebrus-GGUF

## Resumen

DeepSeek V4 Flash Hebrus GGUF es un repositorio que publica artefactos cuantizados del modelo base `deepseek-ai/DeepSeek-V4-Flash`, un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por DeepSeek, adaptados específicamente para el motor de inferencia Hebrus. Hebrus es un motor de inferencia construido desde fuente para Apple Silicon con soporte Metal y streaming de expertos SSD acotado, lo que permite ejecutar modelos grandes en equipos con memoria unificada limitada sin cargar todos los pesos en RAM.

La relevancia de este proyecto reside en que ofrece una vía práctica para ejecutar un modelo MoE de gran tamaño en hardware de consumo de Apple, mediante una cuantización extrema de 2 bits (IQ2XXS con imatrix) y un diseño de almacenamiento propietario llamado ExpertMajor v2, que guarda los pesos enrutados una sola vez en un store embebido con checksum. El artefacto principal pesa aproximadamente 86,72 GB y requiere un mínimo de 64 GiB de memoria unificada. Es importante destacar que estos archivos no son GGUF estándar: solo Hebrus puede ejecutarlos, y no son compatibles con llama.cpp, MLX, Ollama ni la inferencia alojada de Hugging Face.

La licencia es MIT, declarada tanto en el repositorio como en el modelo base. El idioma soportado declarado es únicamente inglés. El repositorio fue creado en julio de 2026 y actualizado en agosto de 2026, con 2054 descargas y 2 me gusta en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con enrutamiento expert-major |
| Parametros totales | no disponible |
| Parametros activos | no disponible (modelo MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea 8192 tokens) |
| Tipos de cuantizacion | IQ2XXS, w2Q2K, AProjQ8, SExpQ8, OutQ8, con imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (extension nativa de Hebrus con store ExpertMajor v2 embebido) |

## Arquitectura y entrenamiento

El repositorio contiene una cuantizacion del modelo base `deepseek-ai/DeepSeek-V4-Flash`, que es un modelo de tipo mezcla de expertos (MoE). No se proporcionan datos sobre el numero total de parametros, parametros activos, ni sobre el proceso de entrenamiento del modelo base en la informacion disponible. La cuantizacion aplica IQ2XXS (cuantizacion de 2 bits con matriz de importancia) junto con cuantizaciones adicionales para proyecciones de atencion (AProjQ8), expertos en streaming (SExpQ8) y salidas (OutQ8), todo ello con calibracion imatrix.

La innovacion principal es el layout ExpertMajor v2, un store embebido dentro del archivo GGUF que almacena los pesos enrutados del MoE una sola vez, con checksum, en lugar de duplicarlos por cada ruta de enrutamiento. Hebrus, el motor de inferencia, utiliza este store para realizar streaming de expertos SSD acotado, cargando en memoria unificada solo los expertos necesarios en cada paso de decodificacion. El runtime de Hebrus rechaza cualquier artefacto que no sea exactamente el admitido, incluyendo versiones anteriores de ExpertMajor o bypass de admision de modelos.

## Capacidades

- Generacion de texto y chat en ingles mediante el pipeline de text-generation.
- Ejecucion local en Apple Silicon con backend Metal, sin necesidad de GPU dedicada.
- Streaming de expertos SSD acotado, que permite ejecutar un modelo de aproximadamente 86,72 GB en un equipo con 64 GiB de memoria unificada.
- Cuantizacion extrema de 2 bits (IQ2XXS) con calibracion imatrix, orientada a maximizar la compression manteniendo un nivel de calidad aceptable.
- Enrutamiento expert-major, una estrategia de seleccion de expertos que prioriza los expertos mas relevantes para cada token.
- No se mencionan capacidades adicionales como tool calling, agentes, vision o audio en la informacion disponible.

## Casos de uso

- Asistente de chat local en estaciones de trabajo Apple Silicon: un Mac con 64 GiB de memoria unificada puede ejecutar el modelo completo gracias al streaming de expertos SSD, ofreciendo respuestas generativas sin depender de servicios en la nube.
- Prototipado de aplicaciones de IA en macOS: los desarrolladores pueden integrar Hebrus en entornos de desarrollo locales para probar flujos de generacion de texto con un modelo de gran tamano, sin necesidad de infraestructura GPU remota.
- Investigacion sobre cuantizacion extrema y streaming de expertos: el repositorio y el codigo de Hebrus permiten estudiar el impacto de IQ2XXS en la calidad de salida y el comportamiento del enrutamiento expert-major en hardware de consumo.
- Generacion de texto con contexto largo en entornos con memoria limitada: el streaming SSD permite manejar contextos que no caben integramente en RAM, cargando solo los expertos necesarios durante la decodificacion.
- Evaluacion de modelos MoE en hardware Apple: permite comparar el rendimiento de DeepSeek-V4-Flash cuantizado frente a otras alternativas locales, midiendo latencia y calidad en un entorno controlado.
- Despliegue en entornos aislados sin GPU: organizaciones que utilizan exclusivamente hardware Apple pueden ejecutar un modelo de lenguaje de gran tamano sin recurrir a servidores con aceleradores NVIDIA o AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de Hebrus referencia un registro de evidencia fechado el 2026-08-05 (disponible en `docs/benchmarks/2026-08-05-deepseek-decode-and-kv-findings.md`), pero los numeros concretos de rendimiento no se incluyen en la model card. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otras metricas estandar.

## Requisitos de hardware

- Apple Silicon (cualquier chip M-series) con al menos 64 GiB de memoria unificada. Este es el minimo cualificado, no una garantia de que todos los contextos o cargas de trabajo concurrentes quepan.
- Espacio SSD suficiente para el artefacto de 86.720.114.272 bytes (aproximadamente 86,72 GB).
- Xcode Command Line Tools y la CLI oficial de Hugging Face para la descarga y compilacion.
- El backend Metal es el unico soportado en produccion. La CPU es solo referencia/depuracion. No existen fuentes CUDA ni ROCm, y la inferencia distribuida esta retirada.
- Opciones de despliegue: exclusivamente Hebrus (version 0.3.0 o superior). No es compatible con vLLM, llama.cpp, MLX, Ollama ni la inferencia alojada de Hugging Face.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El rendimiento depende del artefacto exacto, la revision del runtime, el contexto, el prompt, el estado del almacenamiento, la presion de memoria, la localidad de enrutamiento y la termica.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la informacion consultada. El modelo base `deepseek-ai/DeepSeek-V4-Flash` podria servir como referencia, pero no se incluyen sus especificaciones en este repositorio.

## Limitaciones y advertencias

- Idioma: solo se declara ingles (en). No hay evidencia de soporte multilingue en la model card.
- Compatibilidad: los archivos son extensiones GGUF propietarias de Hebrus. No son ejecutables con runners GGUF genericos (llama.cpp, MLX, Ollama) ni con la inferencia alojada de Hugging Face (el campo `inference: false` es deliberado).
- Requisitos de hardware: minimo de 64 GiB de memoria unificada en Apple Silicon. No es una promesa de que cualquier contexto o carga de trabajo quepa; contextos largos o concurrencia pueden exceder la memoria disponible.
- Cuantizacion extrema: el uso de IQ2XXS (2 bits) puede degradar la calidad de las respuestas en comparacion con cuantizaciones de mayor precision. El impacto exacto no se ha documentado en la model card.
- Riesgo de alucinacion: como cualquier modelo de lenguaje generativo, puede producir contenido falso o inconsistente, especialmente con cuantizacion agresiva.
- Restricciones de uso: el repositorio solo admite el artefacto exacto y la revision listada. No se permiten sidecars, bypass de admision de modelos ni versiones anteriores de ExpertMajor. El runtime rechaza cualquier archivo no admitido.
- Licencia: MIT, pero con limitaciones practicas: el uso comercial requiere el motor Hebrus y el cumplimiento de su contrato de soporte runtime.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/andreaborio/DeepSeek-V4-Flash-Hebrus-GGUF
- Repositorio Hebrus (GitHub): https://github.com/andreaborio/hebrus
- Release Hebrus v0.3.0: https://github.com/andreaborio/hebrus/releases/tag/v0.3.0
- Contrato de soporte runtime: https://github.com/andreaborio/hebrus/blob/v0.3.0/docs/contracts/RUNTIME_SUPPORT.md
- Registro de evidencia 2026-08-05: https://github.com/andreaborio/hebrus/blob/v0.3.0/docs/benchmarks/2026-08-05-deepseek-decode-and-kv-findings.md
- Modelo base DeepSeek-V4-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
