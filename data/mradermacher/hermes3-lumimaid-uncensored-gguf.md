# mradermacher/Hermes3-Lumimaid-uncensored-GGUF

## Resumen

Hermes3-Lumimaid-uncensored-GGUF es la distribucion en formato GGUF del modelo Guilherme34/Hermes3-Lumimaid-uncensored, un merge de modelos (fusion mediante mergekit) construido sobre la familia Hermes 3 de Nous Research. El repositorio lo mantiene mradermacher, un conocido cuantizador de la comunidad que publica versiones GGUF de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base fusiona el comportamiento conversacional y de roleplay de Lumimaid con las capacidades de instruccion de Hermes 3.

Con 70.553.706.560 parametros (aproximadamente 70.000 millones), se trata de un modelo denso de gran tamano, orientado a generacion de texto conversacional y sin censura (uncensored), lo que lo hace relevante para casos de uso de roleplay, narrativa creativa y experimentacion con modelos sin alineamiento restrictivo. La version GGUF facilita su despliegue en hardware de consumo mediante cuantizaciones que van desde Q2_K (26,5 GB) hasta Q8_0 (75,1 GB).

La relevancia actual radica en que permite ejecutar un modelo de 70B en equipos con suficiente RAM/VRAM sin necesidad de infraestructura de servidor, aunque con las limitaciones propias de la cuantizacion. El repo tiene 91 descargas y 1 like, lo que indica una adopcion muy limitada dentro de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (merge de modelos via mergekit; arquitectura base no especificada en la model card) |
| Parametros totales | 70.553.706.560 (~70B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un merge realizado con mergekit a partir de componentes no detallados en la model card. El modelo base Guilherme34/Hermes3-Lumimaid-uncensored combina, por el nombre, la familia Hermes 3 (Nous Research, orientada a instrucciones y function calling) con Lumimaid (modelo de roleplay/conversacion sin censura). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el merge.

La model card del repositorio GGUF no documenta innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). El trabajo de mradermacher consiste en la conversion y cuantizacion estatica del modelo base a formato GGUF, con la opcion adicional de cuantizaciones ponderadas/imatrix publicadas en un repositorio separado (Hermes3-Lumimaid-uncensored-i1-GGUF).

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Orientacion a roleplay y narrativa creativa sin censura (uncensored), segun el nombre del modelo base.
- Capacidades de instruccion heredadas de la familia Hermes 3 (segun el nombre del merge; no verificado en la model card).
- Soporte de tool calling / function calling: no disponible en la documentacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo esta disenado para conversaciones creativas sin las restricciones de alineamiento habituales, adecuado para motores de ficcion interactiva o juegos de rol por texto.
- Generacion creativa sin filtros: util para escritura de ficcion con tematicas adultas o sensibles donde otros modelos rechazan la peticion, dado su caracter uncensored.
- Experimentacion en investigacion sobre alineamiento: permite estudiar el comportamiento de un modelo sin censura frente a uno alineado, comparando respuestas ante los mismos prompts.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_S (40,4 GB) y Q4_K_M (42,6 GB) permiten ejecutar un 70B en equipos con 48 GB de RAM/VRAM unificada mediante llama.cpp.
- Prototipado de asistentes conversacionales en ingles: util para validar flujos de chat multi-turno antes de migrar a un modelo con licencia comercial clara.
- Fine-tuning posterior sobre GGUF: las versiones Q8_0 y Q6_K sirven como base de calidad para experimentos de ajuste o destilacion en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (modelo denso de ~70B, el modelo completo debe residir en memoria):
  - Q2_K: ~26,5 GB
  - Q3_K_M: ~34,4 GB
  - Q4_K_M: ~42,6 GB
  - Q5_K_M: ~50,0 GB
  - Q6_K: ~58,0 GB
  - Q8_0: ~75,1 GB
- GPU recomendadas: A100 80 GB o H100 para Q8_0 sin offload; 2x RTX 4090 (24 GB cada una) o RTX 6000 Ada (48 GB) para Q4_K_M con offload parcial.
- Cabe en GPU de consumo: solo con cuantizaciones bajas y offload a RAM del sistema; una RTX 4090 (24 GB) no puede alojar el modelo completo ni en Q2_K, por lo que requiere offload a RAM o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este tamano sin conversion a safetensors.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hermes3-Lumimaid-uncensored-GGUF | ~70B | no disponible | no disponible | GGUF | Merge uncensored, solo ingles |
| Llama 3.3 70B Instruct | 70B | 128K | Llama 3.3 Community License | safetensors, GGUF | Modelo oficial Meta, ampliamente soportado |
| Qwen2.5 72B Instruct | 72B | 128K | Apache 2.0 | safetensors, GGUF | Multilingue, licencia permisiva |
| Hermes 3 70B (Nous Research) | 70B | 128K | Llama 3 Community License | safetensors, GGUF | Base de instruccion de la que deriva este merge |

## Limitaciones y advertencias

- Modelo uncensored: no incorpora los filtros de seguridad habituales, por lo que puede generar contenido ofensivo, ilegal o danino; requiere moderacion externa en produccion.
- Riesgo elevado de alucinacion: no se han publicado evaluaciones de fidelidad ni benchmarks que permitan estimar su fiabilidad.
- Solo soporta ingles declarado; el rendimiento en castellano no esta verificado y probablemente sea deficiente.
- Licencia no disponible: no se puede confirmar el uso comercial; el modelo base deriva de Hermes 3, sujeto probablemente a la Llama 3 Community License, pero esto no esta documentado en el repo.
- Longitud de contexto no documentada: no se puede garantizar el soporte de conversaciones largas.
- Adopcion muy baja (91 descargas, 1 like): sin validacion comunitaria significativa.
- El merge no documenta la composicion ni los pesos de la fusion, lo que dificulta la reproducibilidad.
- Las cuantizaciones Q2_K y Q3_K_M degradan notablemente la calidad; para uso serio se recomienda Q5_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Hermes3-Lumimaid-uncensored-GGUF
- Modelo base: https://huggingface.co/Guilherme34/Hermes3-Lumimaid-uncensored
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Hermes3-Lumimaid-uncensored-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Hermes3-Lumimaid-uncensored-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafica de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
