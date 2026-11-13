# mradermacher/Forgotten-Safeword-22B-V3.0-GGUF

## Resumen

Forgotten-Safeword-22B-V3.0-GGUF es la version cuantizada en formato GGUF del modelo base ReadyArt/Forgotten-Safeword-22B-V3.0, un modelo de lenguaje de 22.247.282.688 parametros (aproximadamente 22,2 mil millones) orientado explicitamente a roleplay conversacional para adultos y contenido NSFW/ERP. La cuantizacion la ha realizado mradermacher, un conocido creador de quants de la comunidad open source, manteniendo la licencia original del modelo base (Mistral Research License, MRL-0.1).

El modelo esta etiquetado por sus autores como "unaligned" y "dangerous", lo que indica que no ha pasado por procesos de alineamiento de seguridad convencionales (RLHF con filtros de rechazo, moderacion de contenido, etc.). Esto lo hace inadecuado para practicamente cualquier uso general y lo restringe a un nicho muy concreto: generacion de narrativa conversacional explicita en ingles.

La relevancia de esta ficha es fundamentalmente tecnica y de catalogacion: documenta un artefacto de la comunidad que muestra el ecosistema de modelos "sin censura" derivados de arquitecturas tipo Mistral/Llama, sus formatos de distribucion (GGUF con multiples niveles de cuantizacion) y las implicaciones de licencia y seguridad que conlleva. No es un modelo recomendable para produccion, investigacion general ni aplicaciones comerciales convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado, presumiblemente transformer decoder-only de la familia Mistral/Llama, sin confirmar) |
| Parametros totales | 22.247.282.688 (~22,2 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (quants estaticos; tambien existen quants imatrix en el repo i1-GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | mrl (Mistral Research License 0.1) |
| Formato de pesos | GGUF (transformers como libreria declarada; el repo base contiene safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni las tecnicas de alineamiento (RLHF, DPO u otras) empleadas en el modelo base ReadyArt/Forgotten-Safeword-22B-V3.0. La model card del repositorio cuantizado no incluye estos datos; unicamente referencia el modelo base y documenta el proceso de cuantizacion.

Lo que si se puede afirmar es que el autor etiqueta el modelo como "unaligned" y "dangerous", lo que sugiere que el fine-tuning se ha orientado deliberadamente a eliminar o reducir los mecanismos de rechazo y moderacion tipicos de los modelos alineados, especializandolo en roleplay explicito. El proceso de cuantizacion aplicado por mradermacher es estandar: quants estaticos K-quant e IQ-quant generados con llama.cpp, con una variante adicional de quants ponderados por imatrix (repositorio i1-GGUF) que suele ofrecer mejor relacion calidad/tamano en modelos pequenos y medianos.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a roleplay y narrativa interactiva.
- Roleplay explicito y contenido ERP (erotic roleplay) sin los filtros de rechazo habituales.
- Conversacion multi-turno manteniendo personajes y contexto narrativo (la longitud exacta de contexto no esta documentada).
- Generacion de narrativa creativa y dialogos de personaje.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo "thinking".
- Capacidades multilingues limitadas al ingles segun la metadata del modelo.
- No se documentan capacidades destacadas de codigo, matematicas o razonamiento formal; el enfasis del modelo es conversacional y creativo.

## Casos de uso

- Roleplay conversacional para adultos en entornos privados y controlados: el modelo esta disenado especificamente para mantener personajes y narrativa explicita en ingles, sin los rechazos que introducen los modelos alineados.
- Investigacion sobre comportamiento de modelos "unaligned": util para estudiar como se comporta un modelo sin alineamiento de seguridad en escenarios conversacionales, siempre en entornos aislados y con las salvaguardas adecuadas.
- Generacion de ficcion explicita para autores que trabajen en ese genero y necesiten un asistente de escritura sin restricciones tematicas.
- Pruebas de robustez y red-teaming: sirve como referencia de modelo sin filtros para comparar con modelos alineados en estudios de seguridad.
- Experimentacion con cuantizaciones GGUF en hardware consumer: los distintos niveles (desde Q2_K de 8,4 GB hasta Q8_0 de 23,7 GB) permiten probar el modelo en GPUs de gama media y alta, util para benchmarking de llama.cpp.
- Despliegue local en estaciones de trabajo para uso personal: al ser GGUF, se puede ejecutar con llama.cpp, Ollama o interfaces compatibles sin depender de APIs externas, lo que aporta privacidad en el contenido generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion, mas overhead de contexto y KV cache):
  - Q2_K: ~8,4 GB de pesos; en la practica requiere ~10-12 GB de VRAM para contexto moderado.
  - Q4_K_M: ~13,4 GB de pesos; requiere ~16-20 GB de VRAM para contexto moderado.
  - Q6_K: ~18,4 GB de pesos; requiere ~22-26 GB de VRAM.
  - Q8_0: ~23,7 GB de pesos; requiere ~28-32 GB de VRAM.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; A100 40 GB o H100 para Q6_K/Q8_0 con contexto largo; RTX 4080/4070 Ti Super (16 GB) solo para quants Q2_K/Q3_K con contexto limitado.
- Cabe en GPU consumer: si, en RTX 3090/4090 con quants Q4 y Q5; en GPUs de 16 GB solo con quants bajos (Q2_K, Q3_K_S) o descarga parcial a RAM (offloading).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, KoboldCpp y cualquier runtime compatible con GGUF. Tambien se puede usar con transformers si se dispone de los pesos originales en safetensors del modelo base.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Forgotten-Safeword-22B-V3.0-GGUF | ~22,2 B | no disponible | MRL-0.1 | GGUF | Roleplay explicito sin alineamiento; solo ingles |
| Modelos base tipo Mistral Small / Mistral 22B (referencia de familia) | ~22 B | no disponible | MRL-0.1 | safetensors, GGUF | Alineados y con filtros de seguridad; uso general |
| Otros modelos de rolplay sin censura de ~20-30 B en GGUF | variable | variable | variable | GGUF | Ecosistema de la comunidad; calidad y licencias dispares |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas concretas. La comparativa se limita a aspectos de licencia, formato y orientacion de uso.

## Limitaciones y advertencias

- Modelo explicitamente etiquetado como NSFW, "unaligned" y "dangerous": no ha pasado por alineamiento de seguridad convencional y puede generar contenido danino, ilegal o eticamente problemático sin filtros.
- Riesgo elevado de alucinacion y de generar contenido ofensivo, violento o sexual explicito sin restricciones.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no se pueden evaluar sesgos de genero, raza, orientacion u otros.
- Solo soporta ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Licencia Mistral Research License 0.1 (MRL-0.1): restringe el uso comercial y esta pensada para investigacion; es imprescindible revisar los terminos antes de cualquier uso. El autor original la declara como "other".
- No apto para produccion, atencion al cliente, educacion, menores ni aplicaciones publicas.
- La cuantizacion introduce perdida de calidad respecto al modelo original, especialmente en quants bajos (Q2_K, Q3_K_S).
- El repositorio tiene muy pocas descargas (103) y likes (1), lo que indica escasa validacion por parte de la comunidad.
- No hay informacion sobre longitud de contexto, lo que dificulta planificar su uso en conversaciones largas.

## Enlaces

- Repositorio Hugging Face (GGUF estatico): https://huggingface.co/mradermacher/Forgotten-Safeword-22B-V3.0-GGUF
- Repositorio Hugging Face (quants imatrix): https://huggingface.co/mradermacher/Forgotten-Safeword-22B-V3.0-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Forgotten-Safeword-22B-V3.0
- Pagina de descargas del autor: https://hf.tst.eu/model#Forgotten-Safeword-22B-V3.0-GGUF
- Licencia Mistral Research License 0.1: https://mistral.ai/licenses/MRL-0.1.md
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de quants de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
