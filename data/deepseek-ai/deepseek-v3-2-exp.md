# deepseek-ai/DeepSeek-V3.2-Exp

## Resumen

DeepSeek-V3.2-Exp es una version experimental del modelo de lenguaje de gran escala desarrollado por DeepSeek AI, publicada como paso intermedio hacia su proxima arquitectura generacional. Construido sobre V3.1-Terminus, introduce DeepSeek Sparse Attention (DSA), un mecanismo de atencion dispersa de grano fino disenado para validar optimizaciones de eficiencia en entrenamiento e inferencia en escenarios de contexto largo. La relevancia principal radica en que demuestra que es posible reducir de forma sustancial el coste computacional en secuencias extensas manteniendo una calidad de salida practicamente identica a la version densa anterior.

El modelo es un transformer de tipo Mixture-of-Experts (MoE) con aproximadamente 685.400 millones de parametros totales, distribuidos segun el script de conversion oficial en 256 expertos. Se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones significativas, y sus pesos estan en formato safetensors con soporte nativo para cuantizacion FP8. La version finetune (chat/razonamiento) deriva de DeepSeek-V3.2-Exp-Base.

Su publicacion es relevante ahora porque combina dos factores poco habituales en modelos abiertos de este tamano: una licencia verdaderamente permisiva y una arquitectura que ataca directamente el cuello de botella de atencion en contextos largos. Ademas, cuenta con soporte de dia cero en vLLM y con imagenes Docker de SGLang para H200, MI350 y aceleradores NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con DeepSeek Sparse Attention (DSA) |
| Parametros totales | 685.396.921.376 (~685,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (nativo); safetensors en punto flotante; no se documentan cuantizaciones GGUF oficiales |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (library_name: transformers) |

## Arquitectura y entrenamiento

DeepSeek-V3.2-Exp es un transformer con capa de mezcla de expertos (MoE) que, segun el script de conversion oficial, emplea 256 expertos y una configuracion de referencia de 671B (`config_671B_v3.2.json`). La innovacion central es DeepSeek Sparse Attention (DSA), presentada como el primer mecanismo de atencion dispersa de grano fino del proyecto, orientado a mejorar la eficiencia de entrenamiento e inferencia en contexto largo. La model card afirma que mantiene una calidad de salida practicamente identica a la de la version densa precedente.

El entrenamiento se diseno deliberadamente alineando las configuraciones con DeepSeek-V3.1-Terminus para poder aislar el efecto de la atencion dispersa, lo que permite comparaciones directas en benchmarks. No se detalla en la informacion proporcionada el numero total de tokens de entrenamiento, la composicion del dataset ni la secuencia exacta de RLHF/DPO aplicada. La model card incluye un aviso de actualizacion (17/11/2025) sobre una discrepancia de implementacion en el Rotary Position Embedding (RoPE) dentro del modulo indexer: la entrada a RoPE en el indexer requiere un layout no entrelazado, mientras que RoPE en el modulo MLA espera un layout entrelazado. Este detalle fue corregido en el codigo de inferencia actualizado.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Razonamiento en modo explicito (Reasoning Mode), evaluado sin uso de herramientas.
- Razonamiento matematico de competicion (AIME 2025, HMMT 2025).
- Generacion de codigo (LiveCodeBench, Codeforces, Aider-Polyglot).
- Uso agentico de herramientas (Agentic Tool Use): navegacion web, busqueda y ejecucion.
- Resolucion de tareas de ingenieria de software (SWE Verified, SWE-bench Multilingual, Terminal-bench).
- Soporte de function calling / tool calling segun los benchmarks de uso agentico reportados.
- Capacidades multilingues parcialmente evidenciadas por SWE-bench Multilingual (no se detalla la lista de idiomas).

## Casos de uso

- Agentes de navegacion y busqueda web: los resultados en BrowseComp (40,1) y BrowseComp-zh (47,9) lo hacen adecuado para flujos agenticos de recuperacion y navegacion multi-paso con llamadas a herramientas.
- Asistencia en ingenieria de software: con 67,8 en SWE Verified y 57,9 en SWE-bench Multilingual, puede integrarse en pipelines de resolucion de issues y parcheo de repositorios, apoyandose en tool calling para editar ficheros y ejecutar pruebas.
- Automatizacion de terminal y DevOps: su puntuacion de 37,7 en Terminal-bench sugiere viabilidad para tareas de linea de comandos en entornos controlados y entornos tipo sandbox.
- Razonamiento matematico asistido: con 89,3 en AIME 2025 y 83,6 en HMMT 2025, es util para tutoria avanzada, verificacion de demostraciones y generacion de problemas resueltos.
- Generacion y revision de codigo competitivo: 2121 en Codeforces y 74,1 en LiveCodeBench lo orientan a entornos de evaluacion algoritmica y refactorizacion.
- Respuestas factuales de alta precision: 97,1 en SimpleQA lo hace apropiado para sistemas de preguntas y respuestas que exigen exactitud factual y control de alucinacion.
- Procesamiento de documentos extensos: la atencion dispersa DSA esta disenada especificamente para reducir coste en secuencias largas, lo que lo hace candidato para analisis de corpus largos, resumenes de documentacion tecnica y contratos.
- Despliegue self-hosted con licencia permisiva: al ser MIT, puede integrarse en productos comerciales propios sin obligaciones de copyleft.

## Benchmarks y rendimiento

Resultados publicados por el autor comparando DeepSeek-V3.1-Terminus con DeepSeek-V3.2-Exp:

| Benchmark | DeepSeek-V3.1-Terminus | DeepSeek-V3.2-Exp |
|---|---|---|
| MMLU-Pro | 85,0 | 85,0 |
| GPQA-Diamond | 80,7 | 79,9 |
| Humanity's Last Exam | 21,7 | 19,8 |
| LiveCodeBench | 74,9 | 74,1 |
| AIME 2025 | 88,4 | 89,3 |
| HMMT 2025 | 86,1 | 83,6 |
| Codeforces | 2046 | 2121 |
| Aider-Polyglot | 76,1 | 74,5 |
| BrowseComp | 38,5 | 40,1 |
| BrowseComp-zh | 45,0 | 47,9 |
| SimpleQA | 96,8 | 97,1 |
| SWE Verified | 68,4 | 67,8 |
| SWE-bench Multilingual | 57,8 | 57,9 |
| Terminal-bench | 36,7 | 37,7 |

No se proporcionan comparaciones con modelos de otros proveedores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con ~685.400 millones de parametros, los pesos en FP8 ocupan aproximadamente 685 GB; en precision completa (BF16) rondarian los 1370 GB solo para pesos, sin contar cache KV ni activaciones.
- No cabe en GPU de consumo: ni siquiera en configuraciones multi-GPU de gama RTX (por ejemplo, 4x RTX 4090 con 24 GB cada una suman 96 GB, insuficiente). Requiere clústeres de centros de datos.
- GPU recomendadas: el autor y SGLang publican imagenes Docker especificas para NVIDIA H200 y para aceleradores AMD MI350, ademas de imagenes para NPUs (dsv32-a2 y dsv32-a3). El despliegue de referencia usa multiproceso con `MP` ajustado al numero de GPUs disponibles.
- Paralelismo: el script de conversion usa `--model-parallel ${MP}`, y el lanzamiento en SGLang emplea `--tp 8 --dp 8 --enable-dp-attention`.
- Opciones de despliegue: vLLM (soporte dia cero), SGLang (Docker para H200, MI350 y NPUs), y el codigo de inferencia oficial incluido en el repositorio de HuggingFace.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-V3.2-Exp | ~685,4 mil millones (MoE) | no disponible | MIT | HuggingFace (weights safetensors) |
| DeepSeek-V3.1-Terminus | no disponible | no disponible | no disponible | no disponible |
| DeepSeek-V3.2-Exp-Base | no disponible | no disponible | no disponible | HuggingFace (modelo base) |

Solo se dispone de comparativa directa contra DeepSeek-V3.1-Terminus en la tabla de benchmarks. No hay datos en la informacion proporcionada sobre otros modelos comparables de terceros.

## Limitaciones y advertencias

- Naturaleza experimental: la propia model card lo describe como un paso intermedio hacia la siguiente arquitectura, por lo que puede presentar cambios o falta de soporte a largo plazo.
- Descenso en algunos benchmarks respecto a V3.1-Terminus: Humanity's Last Exam baja de 21,7 a 19,8, GPQA-Diamond de 80,7 a 79,9, HMMT 2025 de 86,1 a 83,6 y Aider-Polyglot de 76,1 a 74,5.
- Riesgo de alucinacion: aunque SimpleQA es elevado (97,1), otros benchmarks como Humanity's Last Exam (19,8) indican margen de error significativo en razonamiento complejo.
- Aviso de implementacion RoPE: la model card advierte de una discrepancia previa en el layout de RoPE del modulo indexer que degradaba el rendimiento; es imprescindible usar la version actualizada del codigo de inferencia.
- Idiomas soportados: no se detalla la cobertura linguistica oficial, lo que dificulta garantizar calidad en idiomas distintos del ingles y el chino.
- Longitud de contexto: no se especifica en la documentacion proporcionada, pese a que la arquitectura esta orientada a contexto largo.
- Restricciones de hardware: el tamano descarta su ejecucion en entornos de una sola GPU o de consumo, limitando su uso a infraestructura de centro de datos.
- Licencia: MIT es altamente permisiva; no se senalan restricciones de uso comercial en la informacion disponible.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/deepseek-ai/DeepSeek-V3.2-Exp
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V3.2-Exp-Base
- Carpeta de inferencia oficial: https://huggingface.co/deepseek-ai/DeepSeek-V3.2-Exp/tree/main/inference
- Web de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Plataforma API de DeepSeek: https://www.deepseek.com/en/platform/
- Descarga de la app de DeepSeek: https://download.deepseek.com/
- Organizacion en HuggingFace: https://huggingface.co/deepseek-ai
- GitHub de DeepSeek AI: https://github.com/deepseek-ai
- Discord de DeepSeek AI: https://discord.gg/Tc7c45Zzu5
- Twitter/X de DeepSeek AI: https://twitter.com/deepseek_ai
- Wikipedia (DeepSeek): https://fr.wikipedia.org/wiki/DeepSeek
