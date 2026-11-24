# mradermacher/Nereus-7B-GGUF

## Resumen

Nereus-7B-GGUF es la distribucion en formato GGUF del modelo Nereus-7B, un merge de modelos de 7.000 millones de parametros creado por el usuario saucam y cuantizado por mradermacher. El modelo base combina, mediante mergekit, dos derivados de Mistral-7B: cognitivecomputations/dolphin-2.8-mistral-7b-v02 y NousResearch/Hermes-2-Pro-Mistral-7B. El resultado es un modelo conversacional orientado a instrucciones, sin censura reforzada (herencia de Dolphin) y con capacidades de function calling (herencia de Hermes-2-Pro).

La relevancia de esta ficha reside en que el repositorio de mradermacher ofrece el modelo en 12 cuantizaciones GGUF distintas, desde Q2_K (2,8 GB) hasta f16 (14,6 GB), lo que permite ejecutarlo en hardware de consumo. El modelo original pesa 7.241.748.480 parametros y esta publicado bajo licencia Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales.

Se trata de un modelo unicamente en ingles, sin capacidades multimodales ni ventana de contexto extendida declarada mas alla de la nativa de Mistral-7B. Es una opcion practica para despliegues locales de asistentes conversacionales y experimentacion con tool calling en hardware modesto, no para tareas que requieran contexto muy largo o multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Mistral-7B, fusionado con mergekit) |
| Parametros totales | 7.241.748.480 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Mistral-7B soporta 32.768 tokens, pero no se declara en la model card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (existen pesos originales en safetensors en saucam/Nereus-7B) |

## Arquitectura y entrenamiento

El modelo es un merge estatico generado con mergekit a partir de dos modelos derivados de Mistral-7B: dolphin-2.8-mistral-7b-v02 (conocido por su ajuste conversacional sin censura) y Hermes-2-Pro-Mistral-7B (orientado a function calling y salidas estructuradas en formato JSON). No se dispone de informacion sobre la estrategia concreta de merge (SLERP, TIES, DARE, etc.), los pesos relativos de cada componente ni si hubo un paso posterior de fine-tuning. Tampoco se documentan el volumen de tokens de entrenamiento ni la composicion del dataset, ya que el merge no entrena desde cero sino que combina pesos existentes.

La innovacion tecnica del repositorio no esta en el modelo en si, sino en la cadena de cuantizacion: mradermacher publica tanto cuantizaciones estaticas (este repositorio) como cuantizaciones ponderadas con imatrix en un repositorio separado (Nereus-7B-i1-GGUF), que suelen ofrecer mejor calidad por bit en tamanos equivalentes. La model card no declara modificaciones arquitectonicas adicionales sobre Mistral-7B (sin attention linear, sin decodificacion especulativa ni modos de razonamiento extendido).

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento basico y respuesta a instrucciones, heredado de los ajustes de Dolphin y Hermes.
- Soporte de function calling y tool calling, presumiblemente heredado de Hermes-2-Pro-Mistral-7B (el tag del modelo lo incluye como componente, aunque la model card no detalla el formato de prompt ni esquemas de herramientas).
- Generacion de codigo basica, propia de la familia Mistral-7B.
- Capacidades matematicas limitadas, sin datos de benchmark publicados.
- Multilingue: no, solo ingles declarado.
- Sin vision, audio ni modo thinking explicito.
- Sin contexto extendido declarado mas alla del nativo del modelo base.

## Casos de uso

- Asistente conversacional local: desplegado con llama.cpp u Ollama en una GPU de consumo, el modelo puede gestionar dialogos multi-turno en ingles con un coste de VRAM de 4-5 GB en cuantizaciones Q4_K_M, adecuado para prototipos y uso personal.
- Experimentacion con function calling: al incorporar Hermes-2-Pro-Mistral-7B, es un candidato para probar pipelines de agentes con llamadas a herramientas en entornos de desarrollo, aunque conviene validar el formato de prompt esperado antes de usarlo en produccion.
- Generacion de codigo asistida en editores: con Q4_K_M o Q5_K_M puede integrarse en plugins tipo Continue o similar para autocompletado en ingles, con latencia aceptable en GPUs de 8-12 GB.
- Chatbot de atencion al cliente para mercados angloparlantes: su licencia Apache 2.0 permite uso comercial sin royalties, y el ajuste sin censura de Dolphin reduce rechazos innecesarios en consultas legitimas.
- Prototipado rapido de aplicaciones LLM: la disponibilidad de 12 cuantizaciones permite ajustar el equilibrio calidad/VRAM segun el hardware disponible, desde Raspberry Pi (Q2_K) hasta estaciones de trabajo (Q8_0).
- Fine-tuning ligero o evaluacion comparativa: los pesos originales en safetensors (saucam/Nereus-7B) permiten usarlo como base para LoRA o como referencia en estudios de merges de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): Q2_K ~3 GB, Q4_K_M ~5 GB, Q5_K_M ~6 GB, Q6_K ~7 GB, Q8_0 ~9 GB, f16 ~15 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100 o H100 solo si se necesita f16 con mucho throughput.
- Cabe en GPU de consumo: si, desde una GTX 1660 6 GB con Q4_K_S hasta una RTX 4090 con Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (requiere convertir a safetensors o usar el modelo original), TGI (con el modelo base).
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, un modelo de 7B en Q4_K_M suele generar decenas de tokens por segundo en GPUs consumer modernas, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nereus-7B-GGUF | 7,24 B | no disponible | Apache 2.0 | GGUF | Merge Dolphin + Hermes-2-Pro |
| Mistral-7B-Instruct-v0.2 | 7,24 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Base oficial, contexto documentado |
| Hermes-2-Pro-Mistral-7B | 7,24 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Function calling documentado |
| dolphin-2.8-mistral-7b-v02 | 7,24 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Ajuste conversacional sin censura |

La comparativa se limita a caracteristicas estructurales porque no hay benchmarks publicados para Nereus-7B. Frente a las alternativas, la ventaja principal es la combinacion de dos linajes (conversacional y tool calling) en un solo modelo, y la desventaja es la falta de documentacion sobre contexto, formato de prompt y rendimiento medido.

## Limitaciones y advertencias

- Solo soporta ingles; no es adecuado para produccion en castellano u otros idiomas.
- No se documenta la longitud de contexto efectiva; asumir 32.768 tokens sin validacion es arriesgado.
- Al ser un merge sin evaluacion publicada, el riesgo de alucinacion y de degradacion en tareas especializadas no esta cuantificado.
- El ajuste sin censura de Dolphin puede producir respuestas inapropiadas en dominios sensibles; requiere filtros adicionales en produccion.
- El formato de prompt y el esquema de function calling no estan especificados en la model card; hay que inferirlos de los modelos componentes.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos fusionados (ambos Apache 2.0, segun sus repositorios).
- Las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- El repositorio tiene muy poca traccion (393 descargas, 1 like), lo que reduce la probabilidad de que los problemas se hayan detectado y documentado por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Nereus-7B-GGUF
- Modelo base: https://huggingface.co/saucam/Nereus-7B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Nereus-7B-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Nereus-7B-GGUF
- Componente Dolphin: https://huggingface.co/cognitivecomputations/dolphin-2.8-mistral-7b-v02
- Componente Hermes-2-Pro: https://huggingface.co/NousResearch/Hermes-2-Pro-Mistral-7B
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
