# DakeraAI/gliner_multi-v2.1

## Resumen

DakeraAI/gliner_multi-v2.1 es un espejo verificado del modelo GLiNER multi-v2.1 de Urchade Zaratiana et al., publicado por Dakera, empresa que desarrolla un motor de memoria autoalojado para agentes de IA. No se trata de un modelo nuevo ni de un fine-tune: la model card indica explicitamente que los ficheros se copian byte a byte desde onnx-community/gliner_multi-v2.1 y se verifican mediante SHA-256. El repositorio existe para que la extraccion de entidades de Dakera no dependa de una unica fuente de descarga.

GLiNER (Generalist and Lightweight Model for Named Entity Recognition) es un modelo de reconocimiento de entidades nombradas (NER) zero-shot: permite definir las clases de entidad en tiempo de inferencia mediante prompts de texto, sin necesidad de reentrenar. La version multi-v2.1 cubre aproximadamente 100 idiomas segun la model card, lo que lo hace util para pipelines multilingues de extraccion de informacion, RAG y construccion de grafos de conocimiento. El repositorio distribuido contiene exclusivamente pesos ONNX (model.onnx de unos 1,16 GB y tokenizer.json), no safetensors ni GGUF.

Su relevancia actual deriva de su uso como componente de un motor de memoria para agentes: Dakera lo emplea para extraer entidades de las conversaciones y alimentar recuperacion hibrida y decaimiento de importancia. Para un desarrollador que evalue NER zero-shot multilingue, este repositorio es una via de despliegue ONNX autocontenida, aunque la referencia canonica sigue siendo el repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (encoder transformer con cabeza de span classification para NER zero-shot); pesos distribuidos en formato ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo incluye model.onnx sin variantes cuantizadas declaradas) |
| Idiomas soportados | aproximadamente 100 idiomas (segun la model card de Dakera); lista concreta no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx, 1.157.129.714 bytes); tokenizer.json (16.331.948 bytes) |

## Arquitectura y entrenamiento

GLiNER es un modelo discriminativo de extraccion de entidades que combina un encoder transformer bidireccional con una representacion de etiquetas en el mismo espacio latente: las clases de entidad se codifican como embeddings de prompt y se comparan con representaciones de spans candidatos del texto, lo que permite NER zero-shot con clases arbitrarias definidas en inferencia. La model card de este repositorio no detalla la arquitectura interna, el numero de parametros ni la configuracion del encoder; esa informacion debe consultarse en el repositorio original de urchade.

En cuanto a entrenamiento, la model card de Dakera no aporta datos sobre volumen de tokens, composicion del corpus, tecnicas de alineacion (RLHF/DPO) ni innovaciones de decodificacion. Lo unico verificable es que los pesos ONNX proceden de onnx-community/gliner_multi-v2.1 y que se han copiado sin modificacion, con verificacion de checksum SHA-256 tanto en origen como en destino.

## Capacidades

- Reconocimiento de entidades nombradas zero-shot: las clases de entidad se especifican como texto en tiempo de inferencia, sin reentrenamiento.
- Extraccion multilingue: cobertura declarada de aproximadamente 100 idiomas.
- Clasificacion de spans y extraccion de entidades para pipelines de informacion estructurada.
- Integracion como componente de memoria de agentes: Dakera lo usa para extraer entidades que alimentan recuperacion hibrida (vectorial y texto completo), reranking y decaimiento de importancia.
- Soporte de despliegue ONNX Runtime, lo que permite inferencia en CPU o GPU sin depender de PyTorch.
- Tool calling, agentes multi-paso, vision, audio y modo thinking: no disponibles en este modelo (es un modelo discriminativo de NER, no generativo).

## Casos de uso

- Extraccion de entidades en conversaciones de agentes: el modelo identifica personas, organizaciones, lugares y entidades personalizadas en los turnos de dialogo para construir memoria a largo plazo, que es exactamente el uso que Dakera hace de el en su motor de memoria.
- Construccion de grafos de conocimiento multilingues: a partir de documentos en varios idiomas, se definen clases de entidad por dominio y se extraen menciones para poblar un grafo, aprovechando la cobertura de aproximadamente 100 idiomas.
- Enriquecimiento de pipelines RAG: las entidades extraidas de los chunks se indexan junto a los embeddings vectoriales para permitir recuperacion filtrada por entidad, mejorando la precision en preguntas sobre personas u organizaciones concretas.
- Anonimizacion y seudonimizacion de datos: definir clases como PERSON, EMAIL o PHONE y localizar menciones en textos antes de almacenarlos o compartirlos, con clases configurables por politica sin reentrenamiento.
- Procesamiento de documentos legales o financieros: definir tipos de entidad especificos del dominio (partes contractuales, importes, jurisdicciones) y extraerlos de forma estructurada para revision asistida.
- Moderacion y analisis de contenido: detectar entidades sensibles o menciones de marcas en grandes volumenes de texto como paso previo a clasificacion o escalado a revision humana.
- Despliegue autoalojado en entornos restringidos: al distribuirse como ONNX con checksum verificado y licencia Apache-2.0, puede empaquetarse en imagenes Docker sin dependencia de servicios externos, como hace Dakera con su imagen de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica citada en la model card es de Dakera como producto (88,2 % Recall@20 en LoCoMo), no del modelo GLiNER en si, por lo que no se traslada a esta ficha.

## Requisitos de hardware

- VRAM estimada: el fichero ONNX ocupa aproximadamente 1,16 GB; en FP32 esto implica del orden de 1,2 GB de memoria de pesos, mas activaciones. Cabe holgadamente en GPUs consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090); en servidor, T4, L4, A10, A100 o H100 son suficientes y quedaran limitadas por latencia, no por memoria.
- Inferencia en CPU: viable mediante ONNX Runtime, adecuada para volumenes moderados y despliegues sin GPU.
- Opciones de despliegue: ONNX Runtime (Python, C++, Rust via bindings), contenedores Docker (la imagen de Dakera incluye los modelos por defecto sin descarga al arranque). vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo generativo ni se distribuye en GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| DakeraAI/gliner_multi-v2.1 (este) | no disponible | no disponible | ~100 | Apache-2.0 | ONNX | Espejo verificado de urchade/gliner_multi-v2.1 |
| urchade/gliner_multi-v2.1 (original) | no disponible | no disponible | ~100 | Apache-2.0 | safetensors/PyTorch | Referencia canonica; incluye model card completa |
| onnx-community/gliner_multi-v2.1 | no disponible | no disponible | ~100 | Apache-2.0 | ONNX | Origen real de los ficheros de este repositorio |
| gliner_multi (v1, urchade) | no disponible | no disponible | ~95 | Apache-2.0 | safetensors/PyTorch | Version anterior de la familia GLiNER multi |

Los datos de parametros y contexto de las alternativas no estan disponibles en la informacion proporcionada; la comparativa se limita a licencia, formato e idiomas declarados.

## Limitaciones y advertencias

- Es un espejo, no el repositorio oficial: para citas academicas, versionado y soporte deben referenciarse urchade/gliner_multi-v2.1 y onnx-community/gliner_multi-v2.1.
- No incluye model card tecnica propia: no hay datos publicados aqui sobre arquitectura interna, parametros, contexto o composicion del entrenamiento.
- Solo distribuye ONNX: quien necesite safetensors, PyTorch o variantes cuantizadas debe acudir al repositorio original o a onnx-community.
- NER zero-shot no es infalible: la calidad depende de como se formulan las clases de entidad; clases ambiguas o solapadas degradan precision y recall.
- Riesgo de falsos positivos en dominios especializados: entidades poco representadas en el entrenamiento original pueden requerir ajuste fino o reglas adicionales.
- Sesgos: no hay informacion publicada en este repositorio sobre sesgos por idioma, genero o dominio; al cubrir aproximadamente 100 idiomas, el rendimiento probablemente varia de forma significativa entre ellos.
- Uso comercial: la licencia Apache-2.0 lo permite, pero conviene revisar la licencia y condiciones del modelo base original para cualquier obligacion de atribucion.
- En produccion: verificar los checksums SHA-256 publicados antes de desplegar, y tratar la salida del modelo como extraccion asistida sujeta a validacion en flujos sensibles (legal, salud, datos personales).

## Enlaces

- Repositorio de este espejo: https://huggingface.co/DakeraAI/gliner_multi-v2.1
- Modelo original: https://huggingface.co/urchade/gliner_multi-v2.1
- Origen de los ficheros ONNX: https://huggingface.co/onnx-community/gliner_multi-v2.1
- Licencia en este repositorio: https://huggingface.co/DakeraAI/gliner_multi-v2.1/blob/main/LICENSE
- Web de Dakera: https://dakera.ai
- Documentacion de Dakera: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Despliegue autoalojado (Docker, Kubernetes, Helm): https://github.com/Dakera-AI/dakera-deploy
- Servidor MCP de Dakera: https://github.com/Dakera-AI/dakera-mcp
- SDK Python: https://github.com/Dakera-AI/dakera-py
- SDK TypeScript: https://github.com/Dakera-AI/dakera-js
- SDK Go: https://github.com/Dakera-AI/dakera-go
- SDK Rust: https://github.com/Dakera-AI/dakera-rs
- LinkedIn de Dakera AI: https://www.linkedin.com/company/dakera-ai
