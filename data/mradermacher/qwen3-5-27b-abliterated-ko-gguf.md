# mradermacher/Qwen3.5-27B-abliterated-ko-GGUF

## Resumen

Qwen3.5-27B-abliterated-ko-GGUF es una coleccion de cuantizaciones GGUF estaticas realizadas por mradermacher a partir del modelo messc57546g/Qwen3.5-27B-abliterated-ko, una version "abliterated" (con los mecanismos de rechazo por seguridad eliminados) de un modelo de la familia Qwen3.5 de unos 27 mil millones de parametros. El repositorio no es un modelo nuevo en si mismo, sino un empaquetado de pesos cuantizados pensado para ejecucion local y eficiente en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo base abliterated resuelve un problema concreto: eliminar las negativas de seguridad del modelo original para permitir respuestas sin filtrar, algo demandado en investigacion sobre alineacion, red-teaming y casos de uso creativos sin restricciones. La etiqueta "ko" en el nombre sugiere un proceso de abliteration aplicado sobre una variante coreana o con enfasis en coreano, aunque el repositorio solo declara el ingles como idioma, por lo que este detalle no esta confirmado en la informacion disponible.

Es relevante porque combina tres elementos: un modelo de tamano medio (26,9 mil millones de parametros), cuantizaciones que van desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB), y un archivo mmproj que indica soporte multimodal. Incluye cuantizaciones recomendadas (Q4_K_S y Q4_K_M) que permiten ejecutar el modelo en GPUs de consumo con 16-24 GB de VRAM. Ademas, existen cuantizaciones imatrix/weighted de mayor calidad en un repositorio complementario del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Qwen3.5, transformer; no especificado en la model card) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (solo aplicable si es MoE; no especificado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas; el modelo base esta en safetensors) |

## Arquitectura y entrenamiento

Este repositorio no contiene informacion sobre la arquitectura ni el entrenamiento del modelo base; es una cuantizacion realizada por mradermacher a partir de messc57546g/Qwen3.5-27B-abliterated-ko. Por el nombre se deduce que el modelo base pertenece a la familia Qwen3.5 y tiene unos 27 mil millones de parametros, pero no se especifica si es denso o MoE, ni el numero de capas, cabezas de atencion o tokens de entrenamiento.

El proceso de "abliteration" consiste en identificar y neutralizar las direcciones de activacion responsables de los rechazos por seguridad en el modelo, modificando los pesos directamente sin necesidad de reentrenamiento. La etiqueta "heretic" entre los tags sugiere que se ha utilizado la herramienta Heretic para este proceso, un metodo automatizado de abliteration. La presencia de archivos mmproj (multimodal projection) indica que el modelo base incorpora capacidades de vision que se conservan en las cuantizaciones.

Sobre los datos de entrenamiento, el uso de RLHF/DPO o el numero de tokens no hay informacion disponible en la model card.

## Capacidades

- Generacion de texto conversacional sin rechazos de seguridad, al tratarse de una version abliterated del modelo base.
- Capacidades multimodales: los archivos mmproj-Q8_0 y mmproj-f16 indican soporte de entrada de imagenes junto con texto (vision-language).
- Ejecucion local eficiente en formato GGUF mediante llama.cpp, Ollama, LM Studio y otras herramientas compatibles.
- Amplia gama de niveles de cuantizacion (de Q2_K a Q8_0) para ajustarse a distintas cantidades de VRAM.
- Soporte de tool calling, agentes y thinking mode: no disponible en la informacion proporcionada (depende del modelo base Qwen3.5 original, pero no esta confirmado para esta variante).
- Capacidades multilingues: el repositorio declara solo ingles ("en"); el sufijo "ko" del nombre sugiere relacion con el coreano, pero no esta confirmado en la model card.

## Casos de uso

- Investigacion sobre alineacion y seguridad: al ser un modelo abliterated, permite estudiar el comportamiento de LLMs sin capas de rechazo, util para red-teaming, analisis de sesgos y evaluacion de robustez de filtros externos.
- Ejecucion local en hardware de consumo: la cuantizacion Q4_K_M (16,6 GB) cabe en una RTX 4090 de 24 GB, permitiendo experimentacion offline sin depender de APIs de terceros.
- Procesamiento de imagenes con texto localmente: gracias a los archivos mmproj, se puede usar como modelo vision-language en entornos sin conexion, por ejemplo para describir imagenes o responder preguntas sobre ellas.
- Generacion creativa sin restricciones: escritura de ficcion, roleplay o contenido para adultos donde los rechazos estandar del modelo original resultan un obstaculo.
- Prototipado de aplicaciones con llama.cpp: la amplia gama de cuantizaciones permite probar el modelo en distintos dispositivos (desde 12 GB de VRAM con Q2_K hasta estaciones con 32 GB con Q8_0) antes de decidir el despliegue.
- Comparacion de calidad de cuantizaciones: al ofrecer once variantes del mismo modelo, es util como banco de pruebas para medir la degradacion de perplexidad y coherencia entre niveles de quant (Q2_K frente a Q8_0, por ejemplo).
- Asistentes conversacionales sin filtrado: el tag "conversational" indica compatibilidad con plantillas de chat para integrarlo en interfaces de usuario locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye un grafico generico de comparacion de perplexidad entre tipos de cuantizacion (elaborado por ikawrakow), sin metricas concretas del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - Q2_K: ~10,8 GB
  - Q3_K_M: ~13,4 GB
  - IQ4_XS: ~15,3 GB
  - Q4_K_S / Q4_K_M: ~15,7-16,6 GB
  - Q5_K_M: ~19,3 GB
  - Q6_K: ~22,2 GB
  - Q8_0: ~28,7 GB
  - Anadir ~0,7-1,0 GB si se usa el mmproj para capacidades de vision, mas VRAM adicional para el KV cache segun la longitud de contexto.
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_S/Q4_K_M o Q6_K con contexto moderado.
  - RTX 3090 (24 GB): idem, con menor throughput.
  - RTX 4080/5070 Ti (16 GB): Q3_K_M o IQ4_XS.
  - A100/H100 (40-80 GB): cualquier cuantizacion incluida Q8_0, con contexto largo.
- Ejecucion en CPU o hibrida CPU+GPU posible con llama.cpp (offload parcial de capas); con 32 GB de RAM se puede ejecutar Q4_K_M completamente en CPU, aunque con latencia baja (varios tokens/segundo como maximo).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF; tambien compatible con el ecosistema transformers para el modelo base en safetensors.
- Latencia y throughput: no disponible en la informacion proporcionada; como referencia, un modelo de ~27 B cuantizado a Q4 en una RTX 4090 suele generar en el orden de 20-40 tokens/segundo, pero esta cifra no esta confirmada para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.5-27B-abliterated-ko-GGUF | 26,9 B | GGUF | Q2_K a Q8_0 + mmproj | apache-2.0 | Version abliterated, multimodal, cuants estaticas |
| mradermacher/Qwen3.5-27B-abliterated-ko-i1-GGUF | 26,9 B | GGUF (imatrix) | weighted/imatrix | apache-2.0 | Mismo modelo con cuantizaciones imatrix de mayor calidad |
| messc57546g/Qwen3.5-27B-abliterated-ko | 26,9 B | safetensors | FP16/BF16 | apache-2.0 | Modelo base sin cuantizar, para transformers/vLLM |
| Otros modelos abliterated ~27 B en GGUF | variable | GGUF | variable | variable | no disponible: no hay datos concretos de alternativas comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Contenido sin filtrar: al ser un modelo abliterated, no rechaza peticiones harmful. Esta etiquetado "not-for-all-audiences" y su uso para generar contenido peligroso, ilegal o danino es responsabilidad exclusiva del usuario. No es adecuado para entornos de produccion orientados al publico general sin capas de moderacion externas.
- Riesgo de alucinacion: inherente a cualquier LLM; la abliteration puede degradar ligeramente la calidad y coherencia del modelo base, aunque no hay mediciones publicadas para esta variante.
- Degradacion por cuantizacion: los niveles bajos (Q2_K, Q3_K_S/M) presentan perdida de calidad notable, como muestra el grafico de perplexidad referenciado en la model card; para uso serio se recomiendan Q4_K_M o superiores, o las cuants imatrix del repositorio complementario.
- Idioma: la model card declara solo ingles; el rendimiento en espanol no esta documentado y el sufijo "ko" sugiere posible orientacion al coreano, sin confirmacion oficial.
- Contexto: la longitud de ventana no esta especificada en la informacion disponible; debe verificarse en la ficha del modelo base Qwen3.5 original antes de planificar tareas con documentos largos.
- Licencia: apache-2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el desplegador; algunas jurisdicciones y plataformas prohiben modelos sin filtrado.
- Datos de benchmarks ausentes: no hay evaluaciones publicadas de esta variante abliterated, por lo que su rendimiento respecto al Qwen3.5 original no puede cuantificarse a partir de la informacion disponible.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/mradermacher/Qwen3.5-27B-abliterated-ko-GGUF
- Modelo base abliterated: https://huggingface.co/messc57546g/Qwen3.5-27B-abliterated-ko
- Cuantizaciones imatrix/weighted del mismo autor: https://huggingface.co/mradermacher/Qwen3.5-27B-abliterated-ko-i1-GGUF
- Pagina de descargas con vista general: https://hf.tst.eu/model#Qwen3.5-27B-abliterated-ko-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre calidad de cuants: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del cuantizador: https://www.nethype.de/
- Paper del modelo base: no disponible
