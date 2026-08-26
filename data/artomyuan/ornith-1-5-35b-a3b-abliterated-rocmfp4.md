# ArtomYuan/Ornith-1.5-35B-A3B-abliterated-ROCmFP4

## Resumen

Ornith-1.5-35B-A3B-abliterated-ROCmFP4 es una cuantización especializada del modelo Ornith-1.5-35B-A3B, un modelo de mezcla de expertos (MoE) de aproximadamente 35 mil millones de parámetros con unos 3 mil millones activos por token, desarrollado por el equipo Ornith (ornith-ai / DeepReinforce). Esta versión concreta, publicada por ArtomYuan, parte del modelo abliterated de huihui-ai (que elimina los comportamientos de rechazo y censura) y lo requantiza al formato ROCmFP4, un esquema de cuantización de 4 bits propietario del motor de inferencia halofpx (ROCmFPX), diseñado para GPUs AMD.

La relevancia de este modelo radica en que combina un MoE eficiente con capacidades de visión (incluye un proyector multimodal mmproj) y una ventana de contexto de hasta 256K tokens, todo ello en un paquete de aproximadamente 19,9 GB que puede ejecutarse en hardware de consumo con ROCm. Sin embargo, su formato de pesos no es compatible con llama.cpp estándar ni con la mayoría de servidores de inferencia, lo que limita su uso al ecosistema halofpx. La licencia MIT permite uso comercial sin restricciones, aunque el carácter abliterated implica que puede generar contenido no seguro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5 y Gemma4, con proyector de vision (clip + qwen3vl_merger) |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | ~3B por token (segun documentacion del modelo base) |
| Longitud de contexto | 256K tokens (soportado, segun la model card) |
| Tipos de cuantizacion | ROCmFP4 (Q4_0_ROCMFP4_FAST, 4.27 bpw) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizacion ROCmFP4, exclusiva del motor halofpx) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE que activa aproximadamente 3 mil millones de parametros por token, construido sobre las arquitecturas de Qwen3.5 y Gemma4 con entrenamiento continuado, entrenamiento intermedio y post-entrenamiento. Su caracteristica principal es un bucle de auto-mejora de extremo a extremo: en lugar de depender de tareas fijas creadas por humanos, el modelo genera continuamente nuevas tareas de entrenamiento, descubre estrategias efectivas para resolverlas y mejora su politica mediante aprendizaje por refuerzo. Esta version abliterated elimina los mecanismos de rechazo del modelo original, resultando en un comportamiento sin censura.

La cuantizacion ROCmFP4 es un requantizado local desde una version Q8_0, utilizando el parametro `--allow-requantize`. El formato ROCmFP4 es exclusivo del motor halofpx (ROCmFPX), que implementa una representacion de punto flotante de 4 bits optimizada para GPUs AMD. El repositorio incluye tambien un proyector multimodal (mmproj) en BF16 que permite procesar imagenes junto con texto.

## Capacidades

- Generacion de texto y razonamiento: el modelo base alcanza puntuaciones de 68,5 en Terminal-Bench 2.1 y 79,0 en SWE-Bench Verified (segun datos del vendedor, promediados sobre cinco ejecuciones).
- Codigo y agentes: disenado como modelo agente de codigo auto-mejorable, capaz de generar y ejecutar tareas de programacion de forma autonoma.
- Vision: incluye un proyector multimodal (mmproj) que permite entrada de imagenes junto con texto, aunque no se especifican tareas concretas de vision.
- Tool calling y function calling: no se documenta explicitamente, pero al ser un modelo agente de codigo, se asume soporte para invocacion de herramientas en el modelo base.
- Modo de razonamiento: la model card indica que se puede desactivar el modo de razonamiento (`reasoning_mode: off`) para salida directa; el modo MTP (multi-token prediction) no se recomienda porque resulta en perdida neta de rendimiento.
- Multilingue: no se especifican idiomas soportados; el modelo base probablemente hereda capacidades multilingues de Qwen3.5, pero no hay datos confirmados.

## Casos de uso

- Generacion de codigo en entornos de desarrollo: el modelo puede integrarse en pipelines de CI/CD para generar parches, revisar pull requests o autocompletar funciones, aprovechando su capacidad agente y su ventana de 256K tokens para manejar repositorios completos.
- Asistente de programacion sin restricciones: al ser abliterated, puede utilizarse en entornos donde se requiere generar codigo o explicaciones tecnicas sin filtros de seguridad, como investigacion de vulnerabilidades o analisis de exploits.
- Procesamiento de documentos largos con vision: gracias a su contexto de 256K y al proyector multimodal, puede analizar documentos extensos que combinan texto e imagenes, como manuales tecnicos, informes cientificos o codigo fuente con diagramas.
- Automatizacion de tareas agente: el modelo puede orquestar multiples llamadas a herramientas y ejecutar pasos intermedios en tareas complejas, como despliegue de aplicaciones, gestion de dependencias o resolucion de incidencias en repositorios.
- Generacion de contenido creativo sin censura: su naturaleza abliterated permite producir narrativa, dialogos o material de marketing sin las restricciones habituales de los modelos alineados, aunque con los riesgos asociados.
- Evaluacion de modelos y pruebas de robustez: investigadores pueden usar esta version para estudiar el impacto de la eliminacion de rechazo en el comportamiento del modelo, comparandola con la version alineada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion ROCmFP4. Los datos disponibles corresponden al modelo base Ornith-1.5-35B-A3B, reportados por el vendedor (ornith-ai) y promediados sobre cinco ejecuciones:

| Benchmark | Resultado (modelo base) |
|---|---|
| Terminal-Bench 2.1 | 68,5 |
| SWE-Bench Verified | 79,0 |

Estos valores deben tomarse como referencia del modelo original, no de esta version cuantizada, que puede presentar degradaciones por la cuantizacion de 4 bits.

## Requisitos de hardware

- Tamano del archivo GGUF: ~18 GiB (pesos) + ~861 MiB (mmproj), total ~19,9 GB.
- VRAM estimada: con cuantizacion de 4,27 bpw, los pesos ocupan aproximadamente 18 GB; con overhead de inferencia y cache KV, se recomiendan al menos 24 GB de VRAM para contexto estandar, y mas para 256K.
- GPUs compatibles: el formato ROCmFP4 requiere GPUs AMD con soporte ROCm (por ejemplo, RX 7900 XTX, MI250, MI300). No es compatible con CUDA ni con llama.cpp estandar.
- Despliegue: exclusivamente mediante el motor halofpx (ROCmFPX), registrando el GGUF en su registry y cargandolo via API (`POST /api/v1/load`).
- Latencia y throughput: no se proporcionan datos concretos. La model card indica que el contexto de 256K mantiene la misma velocidad que 131K, lo que sugiere una gestion eficiente de la cache, pero sin cifras exactas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35,5B | ~3B | 256K | MIT | bf16 / FP8 |
| Ornith-1.5-35B-A3B-abliterated-ROCmFP4 (este) | 35,5B | ~3B | 256K | MIT | GGUF (ROCmFP4) |
| Qwen3-30B-A3B (referencia MoE similar) | 30,5B | 3B | 128K | Apache 2.0 | safetensors / GGUF |

La comparativa directa con Qwen3-30B-A3B es orientativa: ambos son MoE con ~3B activos, pero Ornith-1.5 esta especializado en tareas agente de codigo y ofrece contexto de 256K. La version ROCmFP4 se diferencia por su formato propietario, que limita su portabilidad frente a los GGUF estandar de Qwen3.

## Limitaciones y advertencias

- Formato propietario: el archivo ROCmFP4 solo puede cargarse con el motor halofpx; no funciona con llama.cpp, Ollama, vLLM ni TGI estandar. Esto limita seriamente su interoperabilidad.
- Contenido sin censura: al ser abliterated, el modelo puede generar texto ofensivo, ilegal o peligroso. El autor declina toda responsabilidad y recomienda uso bajo propia responsabilidad.
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos, codigo o referencias, especialmente en tareas de razonamiento complejo o con contexto largo.
- Degradacion por cuantizacion: la cuantizacion de 4 bits puede afectar la precision en tareas de matematicas, codigo o razonamiento logico respecto al modelo en bf16.
- Idiomas no documentados: no se especifican los idiomas soportados, lo que dificulta su uso en aplicaciones multilingues.
- Sin garantias de produccion: el modelo es un requantizado local sin validacion exhaustiva; no se recomienda para entornos criticos sin pruebas previas.
- MTP desaconsejado: la prediccion multi-token (MTP) resulta en perdida neta de rendimiento, por lo que debe desactivarse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ArtomYuan/Ornith-1.5-35B-A3B-abliterated-ROCmFP4
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo original (ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-FP8
- Pagina en ModelScope: https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-35B-A3B
- Entrada en LLM Releases: https://www.llm-releases.com/models/ornith-1-5-35b-a3b
- Pagina en Ollama (modelo base): https://ollama.com/library/ornith-1.5
- Motor halofpx (ROCmFPX): https://github.com/julianmb/halofpx
