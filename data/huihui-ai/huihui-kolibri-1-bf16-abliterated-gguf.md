# huihui-ai/Huihui-Kolibri-1-BF16-abliterated-GGUF

## Resumen

Huihui-Kolibri-1-BF16-abliterated-GGUF es una version "abliterated" (sin filtros de rechazo) del modelo Aleph-Alpha/Kolibri-1-BF16, publicada por el usuario huihui-ai. Se trata de un modelo de generacion de texto de tipo Mixture of Experts (MoE) con 78.103.074.560 parametros totales (aproximadamente 78,1 mil millones), orientado a tareas de razonamiento y conversacion. El proceso de abliteracion se aplico directamente sobre ficheros GGUF de llama.cpp, sin depender de Transformers, empleando la herramienta cvector-generator para calcular y restar la direccion de rechazo.

El modelo se distribuye unicamente en formato GGUF, con cuantizaciones que van desde Q2 hasta Q8 y BF16, lo que facilita su ejecucion en entornos de inferencia locales mediante llama.cpp. Segun el ejemplo de la model card, admite una longitud de contexto de 262.144 tokens (256K), un valor especialmente alto que lo hace adecuado para tareas sobre documentos extensos. Los idiomas declarados son aleman e ingles.

Su relevancia actual radica en que combina dos tendencias: por un lado, la arquitectura MoE, que permite activar solo una fraccion de los expertos por token y reducir el coste de inferencia frente a un modelo denso del mismo tamano; por otro, la abliteracion, que elimina los mecanismos de rechazo del modelo base y lo convierte en una herramienta de investigacion para estudiar alineacion, seguridad y comportamiento de modelos sin censura. Es importante subrayar que el propio autor advierte de que no se trata de un modelo apto para produccion ni para aplicaciones comerciales orientadas al publico general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, segun la etiqueta "moe" y la arquitectura personalizada `kolibri1` de llama.cpp |
| Parametros totales | 78.103.074.560 (aproximadamente 78,1 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K), segun el ejemplo de ejecucion de la model card |
| Tipos de cuantizacion | Q2, Q3, Q4, Q5, Q6, Q8 y BF16 (GGUF) |
| Idiomas soportados | aleman (de) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q2, Q3, Q4, Q5, Q6, Q8, BF16) |
| Modelo base | Aleph-Alpha/Kolibri-1-BF16 |
| Tamano del repositorio | 603,9 GB (incluye todas las cuantizaciones) |
| Descargas | 3.248 |
| Likes | 17 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con capas de tipo Mixture of Experts, identificada en llama.cpp mediante el identificador `kolibri1`. El modelo base Aleph-Alpha/Kolibri-1-BF16 corresponde a un modelo de 78,1 mil millones de parametros totales del que este repositorio hereda pesos e hiperparametros; sin embargo, no se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se documenta el numero de parametros activos por token, un dato clave para estimar el coste real de inferencia en un modelo MoE.

La innovacion principal de esta publicacion no esta en el entrenamiento, sino en el post-procesado: la abliteracion se realizo integramente sobre el GGUF con llama.cpp, utilizando el flujo de trabajo de cvector-generator para identificar la direccion de rechazo en el espacio de activaciones y restarla de los pesos. El autor indica expresamente que la abliteracion no modifico todos los modulos de expertos, de modo que el efecto de eliminacion del rechazo puede ser desigual entre expertos. Los ficheros GGUF de partida provienen de Hob-forge/Kolibri-1-GGUF, y las cuantizaciones Q2 a Q8 y BF16 se regeneraron con llama.cpp tras la ablacion.

## Capacidades

- Generacion de texto conversacional y de razonamiento (etiqueta "reasoning" en el repositorio).
- Razonamiento multi-turno sobre contextos muy largos, gracias a una ventana declarada de 262.144 tokens.
- Capacidades multilingues limitadas al aleman y al ingles.
- Inferencia eficiente de tipo MoE, con activacion parcial de expertos (el numero concreto de parametros activos no esta documentado).
- Generacion sin filtros de seguridad: la abliteracion reduce de forma significativa los rechazos del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque la etiqueta "reasoning" sugiere cierta capacidad en esta linea.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Investigacion sobre alineacion y abliteracion: el modelo permite estudiar experimentalmente como la eliminacion de la direccion de rechazo afecta al comportamiento del modelo, comparando sus respuestas con las del Kolibri-1 original en tareas sensibles.
- Red-teaming y evaluacion de seguridad: util para generar intentos de jailbreak, prompts adversarios y respuestas no filtradas que sirvan para probar la robustez de clasificadores y guardrails en un entorno controlado.
- Analisis de documentos extensos en aleman: con 262.144 tokens de contexto, es posible procesar informes, expedientes legales o documentacion tecnica completa sin truncar en una sola pasada.
- Generacion de datos sinteticos para entrenamiento: su capacidad de generar texto sin rechazos permite producir datasets de conversacion o de razonamiento en aleman e ingles que luego pueden filtrarse y anotarse.
- Destilacion y ajuste fino posterior: al estar disponible en GGUF y con licencia Apache 2.0, puede servir como base para LoRA o ajuste completo en investigacion academica.
- Despliegue local en laboratorio con llama.cpp: aplicando el parche `kolibri1-llama.cpp.patch` sobre el commit `836d571`, se puede ejecutar en una estacion de trabajo con GPU para tareas de prueba controladas.
- Traduccion asistida aleman-ingles: aunque solo cubre dos idiomas, el par de/en es muy demandado en documentacion tecnica y juridica y se beneficia del contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card ni los resultados de busqueda proporcionados incluyen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar para este modelo o para su base Aleph-Alpha/Kolibri-1-BF16.

## Requisitos de hardware

- El tamano de la VRAM depende de la cuantizacion. Estimaciones aproximadas a partir de los 78,1 mil millones de parametros totales (todos los expertos deben residir en memoria):
  - Q2: en torno a 28 GB.
  - Q3: en torno a 38 GB.
  - Q4: en torno a 43-47 GB.
  - Q5: en torno a 55 GB.
  - Q6: en torno a 64 GB.
  - Q8: en torno a 83 GB.
  - BF16: en torno a 156 GB.
- A estas cifras hay que sumar la cache KV, que con 262.144 tokens de contexto puede ser muy voluminosa; en la practica conviene reducir el contexto o cuantizar la cache (`--cache-type-k` / `--cache-type-v` en llama.cpp).
- GPU recomendadas: para Q4 se necesita al menos una GPU con 48 GB de VRAM (A6000, A100 80 GB, H100 80 GB) o dos GPU de 24-32 GB con reparto de capas. Las cuantizaciones Q2 y Q3 podrian caber en una RTX 4090 de 24 GB solo si se limita el contexto de forma agresiva.
- Uso en GPU de consumo: Q2 es la unica cuantizacion con opciones realistas en una RTX 4090 (24 GB), y aun asi con contexto reducido. En una RTX 3090 o 4090 no cabe Q4 completo sin offload a RAM.
- Opciones de despliegue: llama.cpp (obligatorio aplicar el parche `kolibri1-llama.cpp.patch`, ya que la arquitectura `kolibri1` no es soportada por llama.cpp estandar), llama-cli y llama-server. El repositorio declara compatibilidad con vLLM y con endpoints compatibles, aunque no se detalla la configuracion. Ollama y TGI: no disponible.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|---|
| Huihui-Kolibri-1-BF16-abliterated | 78,1 mil millones | no disponible | 262.144 tokens | Apache 2.0 | GGUF (Q2-Q8, BF16) | Abliterado, sin filtros |
| Aleph-Alpha/Kolibri-1-BF16 (base) | 78,1 mil millones | no disponible | no disponible | no disponible (el repo declara Apache 2.0 para la version abliterada) | safetensors/BF16 | Alineado, con filtros de seguridad |
| Otros modelos abliterados de huihui-ai (por ejemplo Huihui-Qwen3.8-27B-abliterated) | 27 mil millones | no disponible | no disponible | no disponible | no disponible | Abliterado, familia distinta y menor tamano |

No se dispone de datos de rendimiento que permitan comparar objetivamente estas alternativas; la comparacion es estructural (parametros, formato y licencia) y no de calidad.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: la abliteracion reduce drasticamente los rechazos, por lo que el modelo puede generar contenido sensible, controvertido o inapropiado. El propio autor lo advierte de forma explicita.
- La ablacion no modifico todos los modulos de expertos, por lo que el grado de "desbloqueo" puede ser irregular segun el tipo de peticion y el experto activado.
- Riesgo elevado de alucinacion: no se han publicado evaluaciones de fidelidad factual, y un modelo sin filtros no reduce este riesgo.
- Idiomas limitados al aleman y al ingles; no hay soporte declarado para castellano ni para otros idiomas.
- Licencia Apache 2.0 en lo que respecta a este repositorio, pero debe verificarse la licencia del modelo base Aleph-Alpha/Kolibri-1-BF16 antes de cualquier uso comercial, ya que no se documenta en la informacion disponible.
- El autor recomienda explicitamente limitar su uso a investigacion, pruebas o entornos controlados, y evitar su despliegue en produccion o en aplicaciones comerciales orientadas al publico.
- No apto para audiencias menores ni para entornos que requieran un alto nivel de seguridad de contenido.
- Se recomienda monitorizacion en tiempo real y revision manual de las salidas cuando se utilice con usuarios reales.
- Limitacion practica de despliegue: requiere un parche especifico de llama.cpp sobre el commit `836d571`; sin el, la arquitectura `kolibri1` no carga.
- El repositorio ocupa 603,9 GB en total por acumular todas las cuantizaciones; conviene descargar unicamente el fichero GGUF necesario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huihui-ai/Huihui-Kolibri-1-BF16-abliterated-GGUF
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- GGUFs de origen: https://huggingface.co/Hob-forge/Kolibri-1-GGUF
- Perfil del autor en HuggingFace: https://huggingface.co/huihui-ai
- Perfil del autor en Ollama: https://ollama.com/huihui_ai
- Herramienta cvector-generator de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/tools/cvector-generator/README.md
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Soporte del autor (Ko-fi): https://ko-fi.com/huihuiai
