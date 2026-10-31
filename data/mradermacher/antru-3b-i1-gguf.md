# mradermacher/ANTRU-3B-i1-GGUF

## Resumen

ANTRU-3B-i1-GGUF es un repositorio de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo ANTRU-3B, publicado por el cuantizador mradermacher, un colaborador muy activo de la comunidad de Hugging Face especializado en generar versiones comprimidas de modelos abiertos para su ejecucion local. El modelo base, ANTRUhub/ANTRU-3B, es un modelo de 3.085 millones de parametros derivado de Qwen2.5-Coder, entrenado mediante LoRA y SFT con enfoque en tareas de programacion, y destacado por haber sido entrenado en hardware de consumo.

La relevancia de esta ficha no esta en el modelo base en si, sino en la disponibilidad inmediata de mas de veinte cuantizaciones que permiten ejecutar el modelo en equipos muy modestos: desde versiones IQ1_S de unos 0,9 GB hasta Q6_K de 2,6 GB. Esto lo hace adecuado para ordenadores portatiles sin GPU dedicada, Raspberry Pi de ultima generacion o cualquier escenario donde la VRAM y la memoria RAM son limitadas. Al tratarse de un modelo enfocado en codigo con licencia Apache 2.0, resulta interesante para desarrolladores que quieren un asistente de programacion local y sin coste de API.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen2.5-Coder (detalle exacto no disponible) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo base ANTRU-3B parte de la arquitectura de Qwen2.5-Coder, la familia de modelos de codigo de Alibaba, adaptada mediante LoRA (Low-Rank Adaptation) y SFT (supervised fine-tuning), segun los tags del repositorio. El tag "trained-on-consumer-hardware" indica que el ajuste fino se realizo en hardware de consumo, un detalle relevante porque demuestra que es posible especializar modelos de codigo pequenos sin necesidad de clusters de GPU. No se dispone de informacion sobre el numero de tokens, la composicion del dataset ni el uso de RLHF o DPO.

En cuanto a este repositorio concreto, mradermacher ha generado cuantizaciones GGUF ponderadas con imatrix (importance matrix), una tecnica que calcula estadisticas de activacion sobre un corpus de calibracion para asignar mayor precision a los tensores mas relevantes. Esto permite que cuantizaciones agresivas (IQ1, IQ2, IQ3) mantengan una calidad notablemente superior a las cuantizaciones estaticas equivalentes. El archivo de imatrix tambien esta publicado para quien quiera crear sus propias cuantizaciones.

## Capacidades

- Generacion de codigo: al derivar de Qwen2.5-Coder y estar etiquetado con "coding", su capacidad principal es la generacion y completado de codigo.
- Conversacion: etiquetado como "conversational", apto para chat multi-turno.
- Ajuste fino mediante LoRA y SFT sobre la base Qwen2.5-Coder, presumiblemente orientado a tareas de programacion.
- Ejecucion local eficiente gracias al formato GGUF con mas de veinte niveles de cuantizacion.
- Soporte para inferencia con llama.cpp y derivados (Ollama, LM Studio, etc.) al estar en formato GGUF.
- No hay informacion disponible sobre tool calling, capacidades de agente, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente de codigo en local: con la version Q4_K_M (2,0 GB) se puede ejecutar en un portatil con 8 GB de RAM como autocompletador o generador de snippets sin enviar codigo a servicios externos, util para entornos con requisitos de privacidad.
- Programacion emparejada offline: la etiqueta "local-llm" y el tamano reducido lo hacen viable en equipos sin GPU, respondiendo dudas sobre sintaxis y generando funciones en lenguajes heredados de Qwen2.5-Coder.
- Integracion en editores via llama.cpp u Ollama: puede alimentar extensiones tipo Continue o equivalentes para completado en el IDE con latencia baja al ser un modelo de 3B.
- Dispositivos edge y SBC: las cuantizaciones IQ2/IQ3 (1,0-1,6 GB) permiten ejecutarlo en placas como Raspberry Pi 5 o mini PCs con memoria limitada.
- Prototipado de pipelines de codigo: al ser Apache 2.0, puede integrarse en herramientas internas o productos sin restricciones de licencia ni coste por token.
- Generacion de sus propias cuantizaciones: el archivo imatrix de 0,1 GB permite a usuarios avanzados crear niveles personalizados ajustados a su hardware.
- Investigacion sobre fine-tuning de bajo coste: como ejemplo de modelo derivado con LoRA entrenado en hardware de consumo, util como referencia reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al derivar de Qwen2.5-Coder-3B, su rendimiento en tareas de codigo deberia aproximarse al del modelo base, pero no hay mediciones especificas de ANTRU-3B (MMLU, HumanEval, GSM8K u otros) en el material proporcionado.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde aproximadamente 1 GB (IQ1_S, 0,9 GB) hasta unos 3 GB (Q6_K, 2,6 GB), mas la memoria para el contexto. Cabe completamente en la RAM de cualquier ordenador moderno.
- GPU recomendadas: no son necesarias; el modelo esta pensado para CPU. Si se usa GPU, cualquier GPU con 4 GB de VRAM (por ejemplo RTX 3050 o superior) ejecuta incluso la version mas grande.
- Consumer GPUs: cabe sobradamente en RTX 3060 de 12 GB, RTX 4060 u otras similares; incluso en GPUs de 4 GB con las cuantizaciones medias.
- CPU: viable en portatiles con 8 GB de RAM usando Q4_K_M o inferiores; velocidad estimada no disponible, aunque un modelo de 3B cuantizado a 4 bits suele alcanzar velocidades conversacionales en CPUs modernas.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, ktransformers y cualquier runtime compatible con GGUF. No es el formato ideal para vLLM o TGI, que requieren pesos safetensors (usar entonces el modelo base ANTRUhub/ANTRU-3B).
- El repositorio completo ocupa 36,8 GB; descarga solo los archivos GGUF que necesites.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Enfoque | Licencia |
|---|---|---|---|---|
| ANTRU-3B (este, base ANTRUhub) | 3,09 B | GGUF (imatrix) | Codigo, fine-tuning LoRA de Qwen2.5-Coder | Apache 2.0 |
| Qwen2.5-Coder-3B-Instruct | 3 B | Safetensors / GGUF comunitarios | Codigo, entrenamiento oficial de Alibaba | Qwen Research (restricciones comerciales en algunas versiones; Apache 2.0 en otras) |
| Phi-3.5-mini-instruct | 3,8 B | Safetensors / GGUF comunitarios | General, razonamiento y codigo | MIT |
| Stable Code 3B | 2,8 B | Safetensors / GGUF comunitarios | Codigo | Apache 2.0 |

ANTRU-3B se diferencia de Qwen2.5-Coder-3B en que incorpora un ajuste fino adicional mediante LoRA/SFT, presumiblemente orientado a casos de uso concretos de codigo, y en que las cuantizaciones imatrix de mradermacher ofrecen mejor calidad por byte que cuantizaciones estaticas equivalentes. Frente a Phi-3.5-mini, es mas especializado en codigo pero probablemente menos capaz en razonamiento general. Datos de rendimiento comparativos no disponibles.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado solo para ingles; no hay soporte declarado para castellano ni otros idiomas, por lo que las respuestas en espanol pueden ser de menor calidad.
- No hay benchmarks publicados del modelo derivado: su calidad real respecto a Qwen2.5-Coder-3B base no esta verificada y depende del dataset de SFT, cuya composicion es desconocida.
- Cuantizaciones muy agresivas (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; el propio autor las describe como "para desesperados". Usar como minimo Q4_K_S o Q4_K_M para trabajo serio.
- Riesgo de alucinacion tipico de modelos de 3B: puede generar codigo plausible pero incorrecto; revisar siempre el codigo producido.
- Longitud de contexto no documentada en este repositorio; consultar la ficha del modelo base ANTRUhub/ANTRU-3B antes de planificar cargas de contexto largo.
- Sin informacion sobre tool calling ni capacidades de agente: no asumir su funcionamiento sin verificarlo.
- Licencia Apache 2.0 tanto del modelo base como de las cuantizaciones: sin restricciones para uso comercial, aunque conviene verificar la licencia de los datos de entrenamiento del SFT, que no esta documentada.
- Este repositorio es una cuantizacion de terceros: cualquier problema de calidad del modelo base debe reportarse a ANTRUhub, no a mradermacher.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/mradermacher/ANTRU-3B-i1-GGUF
- Modelo base: https://huggingface.co/ANTRUhub/ANTRU-3B
- Cuantizaciones estaticas (sin imatrix): https://huggingface.co/mradermacher/ANTRU-3B-GGUF
- Pagina de descargas resumida: https://hf.tst.eu/model#ANTRU-3B-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
