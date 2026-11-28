# KRAFTON/Raon-1-mini-gguf

## Resumen

Raon-1 mini es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado desde cero por KRAFTON AI, el brazo de inteligencia artificial de la editora de videojuegos surcoreana KRAFTON. Con 28.800 millones de parametros totales y 4.300 millones activos por token, se posiciona en la franja de modelos MoE eficientes que combinan una huella de computo reducida con una calidad de razonamiento alta. Este repositorio concreto (`KRAFTON/Raon-1-mini-gguf`) contiene los pesos convertidos a formato GGUF para su uso con llama.cpp, derivados de los pesos BF16 del checkpoint original.

El modelo destaca por su arquitectura hibrida de atencion: 18 de sus 25 capas emplean Raon Delta Attention (RDA), una variante de atencion lineal con estado de tamano fijo, mientras que solo 7 capas mantienen cache KV mediante Gated MLA. Esto reduce drasticamente el coste de memoria en contextos largos, que alcanza de forma nativa los 262.144 tokens. Ademas incorpora un modo de razonamiento con seis niveles de esfuerzo configurables por peticion (`none`, `low`, `medium`, `high`, `xhigh` y `max`).

Su relevancia actual reside en tres factores: una licencia Apache 2.0 plenamente permisiva para uso comercial, un rendimiento declarado muy alto en tareas de razonamiento (96,7 en AIME 2026, 86,0 en GPQA Diamond) y un enfasis explicito en conversacion multi-turno, busqueda y ejecucion de agentes con tool calling. Ademas, se distribuye un modelo draft (DFlash2) para decodificacion especulativa y formatos MXFP8 y NVFP4 que permiten inferencia con contexto completo de 256K en 20 GiB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (18 capas Raon Delta Attention + 7 capas Gated MLA) |
| Parametros totales | 28,8B (28.783.231.402) |
| Parametros activos | 4,3B (6 expertos enrutados + 1 compartido de 128) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | GGUF (Q6_K y menores con imatrix; resto de niveles no detallados), MXFP8 y NVFP4 en el repo original |
| Idiomas soportados | Coreano, ingles, japones, chino, espanol, frances y tailandes |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); BF16, MXFP8 y NVFP4 en el repo base |

Otros datos tecnicos del modelo: 25 capas, hidden size de 2.560, 40 cabezas de atencion (dimension 128 en RDA; 192 QK / 128 V en Gated MLA), rango LoRA de query/KV de 576/512 en Gated MLA, tamano intermedio de experto de 1.088, sin codificacion posicional (NoPE) y cache KV de aproximadamente 8 KiB por token en BF16 (solo en las capas MLA).

## Arquitectura y entrenamiento

Raon-1 mini emplea una arquitectura transformer hibrida con mezcla de expertos dispersa. El bloque se compone de 25 capas: 18 usan Raon Delta Attention (RDA), una evolucion de Kimi Delta Attention que desacopla las puertas de borrado y escritura para mejorar el rendimiento en contexto largo, y 7 usan Gated MLA con cache KV tradicional. El enrutamiento MoE activa 6 de 128 expertos enrutados mas 1 experto compartido por token, lo que resulta en 4,3B parametros activos sobre 28,8B totales. La innovacion Raon-mHC reduce el coste computacional de las hyper-conexiones con restriccion de variedad (mHC) de DeepSeek, acelerando el entrenamiento. El modelo prescinde de codificacion posicional explicita (NoPE).

El modelo fue entrenado desde cero por KRAFTON AI sobre un corpus multilingue que cubre coreano, ingles, japones, chino, espanol, frances y tailandes. La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset, ni confirma el uso de RLHF o DPO. Si se documenta un modo de razonamiento con seis niveles de esfuerzo seleccionables por peticion, lo que sugiere un entrenamiento especifico orientado a cadenas de pensamiento de longitud variable. Se proporciona ademas el modelo draft `Raon-1-mini-dflash2` para decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento con modo thinking integrado y seis niveles de esfuerzo (`none`, `low`, `medium`, `high`, `xhigh`, `max`) configurables por peticion.
- Razonamiento matematico y cientifico de alto nivel (AIME 2026, HMMT Feb 2026, GPQA Diamond).
- Tool calling y function calling para flujos agenticos; soporte declarado para Hermes Agent, Pi y OpenCode.
- Ejecucion de agentes y razonamiento multi-paso, con benchmarks especificos de busqueda multi-turno (BrowseComp Plus) y conversacion multi-turno (MultiChallenge).
- Capacidades multilingues en siete idiomas, con rendimiento especialmente fuerte en coreano y solido en ingles.
- Contexto largo nativo de 256K tokens, viable en memoria reducida gracias a la atencion lineal en 18 de 25 capas.
- Decodificacion especulativa mediante el modelo draft DFlash2.
- Capacidades de codigo y tareas de ingenieria de software (benchmark SWE-Verified reportado).

## Casos de uso

- Atencion al cliente automatizada en coreano e ingles: el modelo gestiona conversaciones multi-turno extensas gracias a sus 256K tokens de contexto y a su rendimiento lider declarado en MultiChallenge (64,9), lo que permite mantener el hilo de incidencias largas sin perder informacion previa.
- Agentes de busqueda y recuperacion de informacion: con 55,9 en BrowseComp Plus, es adecuado para pipelines que combinan busqueda web, lectura de fuentes y sintesis multi-paso, integrable mediante tool calling en frameworks como Hermes Agent.
- Asistencia a desarrollo de software: con soporte de tool calling y resultados reportados en SWE-Verified y GDPVal, puede integrarse en flujos tipo OpenCode para resolucion de issues, generacion de parches y automatizacion de tareas de CI/CD.
- Razonamiento matematico y cientifico asistido: los niveles `high`, `xhigh` y `max` permiten ajustar el esfuerzo de computo segun la dificultad, util en tutoria STEM, verificacion de derivaciones y generacion de problemas resueltos.
- Despliegue en local con llama.cpp: los ficheros GGUF de este repositorio permiten ejecutar el modelo en estaciones de trabajo y portatiles con GPU de consumo, usando cuantizaciones Q6_K o inferiores con imatrix para preservar calidad.
- Procesamiento de documentos largos: contratos, informes tecnicos o expedientes de mas de 200.000 tokens pueden analizarse en una sola pasada, con coste de memoria contenido gracias a la cache KV limitada a las 7 capas MLA.
- Asistentes multilingues para el mercado asiatico y europeo: cobertura de coreano, japones, chino, tailandes, espanol y frances en un unico modelo Apache 2.0, sin necesidad de licencias por region.
- Inferencia de alto rendimiento en produccion: los formatos MXFP8 y NVFP4 del repo base, junto con la decodificacion especulativa DFlash2, permiten servir el modelo con contexto completo de 256K en 20 GiB de VRAM.

## Benchmarks y rendimiento

| Benchmark | Raon-1 mini |
|---|---|
| AIME 2026 | 96,7 |
| HMMT Feb 2026 | 87,1 |
| GPQA Diamond | 86,0 |
| MultiChallenge | 64,9 |
| BrowseComp Plus | 55,9 |

La model card incluye comparaciones graficas frente a Qwen3.6 35B-A3B, Gemma 4 26B-A4B, Flint (40B-A2.5B) e Inkling 2 Mini en los benchmarks AA-Omniscience, GPQA Diamond, IFBench, MultiChallenge, BrowseComp Plus, SWE-Verified, GDPVal y Chatbot Korean (interno), pero los valores numericos de esos modelos competidores no se detallan en la informacion disponible. No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en GGUF: depende de la cuantizacion; con 28,8B parametros totales, una cuantizacion de 4 bits ronda los 16-18 GB de pesos, mientras que Q6_K se aproxima a 22-24 GB. Los valores exactos por fichero no se detallan en la informacion disponible.
- El repo original en NVFP4 permite inferencia con contexto completo de 256K en 20 GiB de VRAM, segun la model card.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) puede alojar cuantizaciones de 4-6 bits; para contexto largo o precision mayor se requieren A100 (40/80 GB), H100 o multiples GPU.
- Cabe en GPU de consumo: si, en modelos con 24 GB o mas usando cuantizaciones Q4/Q5/Q6; en GPU de 16 GB solo con cuantizaciones mas agresivas y contexto reducido.
- Opciones de despliegue: llama.cpp (formato nativo de este repo), Ollama y otros runners compatibles con GGUF; vLLM y TGI para los pesos BF16/MXFP8/NVFP4 del repo base. La model card menciona compatibilidad con endpoints.
- Latencia y throughput: no disponibles. La decodificacion especulativa con DFlash2 y los 4,3B parametros activos apuntan a un throughput alto, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros (total/activos) | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Raon-1 mini | 28,8B / 4,3B | 256K | Apache 2.0 | MoE hibrida RDA+MLA, thinking de 6 niveles, fuerte en coreano y agentes |
| Qwen3.6 35B-A3B | 35B / 3B (segun nomenclatura) | no disponible | no disponible | Comparado en la model card; valores por benchmark no detallados |
| Gemma 4 26B-A4B | 26B / 4B (segun nomenclatura) | no disponible | no disponible | Comparado en la model card; valores por benchmark no detallados |
| Flint (40B-A2.5B) | 40B / 2,5B | no disponible | no disponible | Comparado en la model card; valores por benchmark no detallados |
| Inkling 2 Mini | no disponible | no disponible | no disponible | Comparado en la model card; valores por benchmark no detallados |

Los datos de los modelos competidores provienen unicamente de las referencias de la model card; no se dispone de sus especificaciones completas ni de sus cifras numericas en la informacion proporcionada.

## Limitaciones y advertencias

- El acceso al modelo esta sujeto a solicitud: la model card incluye un formulario de acceso restringido (`extra_gated`) pese a la licencia Apache 2.0, lo que puede anadir friccion en despliegues automatizados.
- Riesgo de alucinacion inherente a los modelos generativos, no cuantificado en la informacion disponible; el modo thinking de alto esfuerzo no elimina este riesgo.
- El rendimiento multilingue es desigual: la propia model card reconoce un rendimiento fuerte en coreano y solo "solido" en ingles, sin datos publicados para espanol, frances, japones, chino ni tailandes.
- Sesgos conocidos: no documentados en la informacion disponible.
- Los benchmarks reportados son en su mayoria autoinformados por el autor y algunos son recientes o internos (Chatbot Korean), lo que limita la comparabilidad independiente.
- La cuantizacion GGUF puede degradar el rendimiento en tareas de razonamiento largo; Q6_K y menores se generaron con imatrix para mitigarlo, pero no se publican metricas de degradacion por nivel.
- El contexto de 256K requiere memoria adicional en las 7 capas MLA (unos 8 KiB por token en BF16); en configuraciones de poca VRAM habra que truncar contexto o usar cuantizaciones mas agresivas.
- No se detallan los datos de entrenamiento, por lo que no puede evaluarse la composicion del corpus ni posibles sesgos de dominio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/KRAFTON/Raon-1-mini-gguf
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini
- Modelo draft DFlash2: https://huggingface.co/KRAFTON/Raon-1-mini-dflash2
- Playground de Raon-1 mini: https://raon-console.krafton.ai/playground/guest
- Pagina de KRAFTON AI: https://krafton.ai/en/
- Organizacion en Hugging Face: https://huggingface.co/KRAFTON
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
- Web corporativa de KRAFTON: https://www.krafton.com/en/
- Wikipedia (Krafton): https://en.wikipedia.org/wiki/Krafton
