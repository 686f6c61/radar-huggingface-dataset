# mradermacher/Tenet-12B-Nemo-Unslop-v1-i1-GGUF

## Resumen

Tenet-12B-Nemo-Unslop-v1-i1-GGUF es la cuantizacion en formato GGUF, generada con imatrix, del modelo Tenet-12B-Nemo-Unslop-v1 desarrollado por mr-andrey-isachenko. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos. El modelo base es un transformer denso de 12.247.782.400 parametros (aproximadamente 12,2 mil millones) afinado para uso conversacional, agentico y de generacion de codigo, con etiquetas que indican capacidades de tool-use, GRPO y una variante "abliterated/uncensored".

La relevancia de esta publicacion es practica: ofrece el modelo base en un rango amplio de cuantizaciones (desde IQ1_S de 3,1 GB hasta Q6_K de 10,2 GB) que permiten ejecutarlo en hardware de consumo mediante llama.cpp y derivados, algo imposible con los pesos completos en safetensors. El repositorio ocupa 141,9 GB porque incluye todos los ficheros cuantizados y el fichero imatrix.

La informacion publicada es limitada en cuanto a arquitectura interna, datos de entrenamiento y contexto: la model card se centra en las instrucciones de descarga y uso de los GGUF, no en las especificaciones tecnicas del modelo base. La licencia declarada es Apache 2.0 y el idioma indicado es unicamente el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles internos no disponibles) |
| Parametros totales | 12.247.782.400 (12,2 B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; tambien hay cuantizaciones estaticas en el repo hermano |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Los datos disponibles indican que se trata de un transformer denso de 12,2 mil millones de parametros, con etiquetas que apuntan a un proceso de ajuste mediante GRPO (Group Relative Policy Optimization) y a una variante "abliterated" (eliminacion de direcciones de rechazo en el espacio de activaciones). Tambien aparece la etiqueta "fp8", que sugiere que el modelo base pudo entrenarse o publicarse originalmente en precision FP8, y "unslop", que en la practica de la comunidad designa ajustes orientados a reducir respuestas genericas o excesivamente formateadas.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO mas alla de la mencion a GRPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La cuantizacion i1 utiliza un fichero imatrix (matriz de importancia) generado por el cuantizador, lo que mejora la calidad de las cuantizaciones de baja precision respecto a las estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional en ingles, con ajuste orientado a respuestas directas y sin el "slop" habitual de los modelos alineados de forma agresiva.
- Generacion de codigo, segun la etiqueta "coding" de la model card.
- Tool calling y function calling, segun la etiqueta "tool-use".
- Uso agentico y razonamiento multi-paso, segun la etiqueta "agentic".
- Ajuste mediante GRPO, segun la etiqueta "grpo".
- Variante "abliterated/uncensored": menor tendencia a rechazar peticiones, segun las etiquetas del autor.
- Compatibilidad declarada con vLLM y OpenRouter (etiquetas "vllm" y "openrouter"), aunque para los GGUF el motor natural es llama.cpp.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistente de codigo en local: con la cuantizacion i1-Q4_K_M (7,6 GB) el modelo cabe en una GPU de 12-16 GB y puede integrarse en editores o CLI para autocompletado, explicacion y refactorizacion de codigo, sin enviar el codigo a servicios externos.
- Agente con tool calling en pipelines de automatizacion: las etiquetas de tool-use y agentic indican soporte para invocar funciones; se puede conectar a APIs internas mediante un servidor compatible con OpenAI (llama.cpp server, Ollama) para tareas de extraccion y orquestacion.
- Despliegue en estaciones de trabajo sin GPU dedicada: las cuantizaciones IQ2/IQ3 (3,7-6,7 GB) permiten ejecucion en CPU con llama.cpp, adecuadas para prototipos y entornos de desarrollo con RAM limitada.
- Procesamiento de documentacion tecnica en ingles: al ser un modelo solo en ingles, encaja en tareas de resumen, extraccion de entidades y generacion de documentacion sobre corpus angloparlantes.
- Experimentacion en investigacion sobre alineacion y rechazo: la variante abliterated permite estudiar el comportamiento del modelo ante peticiones que un modelo alineado rechazaria, util en estudios de seguridad y evaluacion de sesgos.
- Chatbot de atencion al cliente en ingles para entornos con requisitos de privacidad: al ejecutarse on-premise con pesos Apache 2.0, se evita la dependencia de APIs de terceros; la ventana de contexto real debe validarse antes de usarlo con historiales largos, ya que no esta documentada.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye desde IQ1 hasta Q6_K, lo que permite medir la degradacion de calidad por nivel de cuantizacion en tareas concretas antes de fijar una version para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el espacio para cache KV y overhead. Referencias: i1-IQ2_M 4,5 GB, i1-Q3_K_M 6,2 GB, i1-Q4_K_M 7,6 GB, i1-Q5_K_M 8,8 GB, i1-Q6_K 10,2 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4070 12 GB para Q4_K_M con contexto moderado; RTX 4090 24 GB o A100/H100 para Q5/Q6 con contexto amplio (la longitud de contexto no esta documentada, por lo que la VRAM de cache KV debe calcularse a partir de la configuracion real del modelo base).
- Cabe en GPU de consumo: si, desde IQ1_S (3,1 GB) hasta Q6_K (10,2 GB) en tarjetas de 8-12 GB, con margen variable segun contexto.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de OpenAI basados en llama.cpp; vLLM y TGI no consumen GGUF de forma nativa, por lo que para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles; dependen de la cuantizacion, del hardware y del contexto. Como referencia cualitativa, el autor marca Q4_K_M como "fast, recommended" y Q4_K_S como "optimal size/speed/quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-12B-Nemo-Unslop-v1-i1-GGUF | 12,2 B | no disponible | Apache 2.0 | GGUF | Ajuste GRPO, abliterated, tool-use, solo ingles |
| Modelo base Tenet-12B-Nemo-Unslop-v1 | 12,2 B | no disponible | Apache 2.0 | safetensors | Pesos completos, requiere GPU de mayor capacidad |
| Alternativas de ~12 B en GGUF | no disponible | no disponible | no disponible | GGUF | No se dispone de datos verificados para comparar rendimiento |

No se dispone de informacion suficiente para comparar benchmarks con modelos de la misma categoria; la comparativa se limita a aspectos de formato y licencia.

## Limitaciones y advertencias

- El modelo esta declarado unicamente en ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- La variante "abliterated/uncensored" reduce los rechazos del modelo, lo que incrementa el riesgo de generar contenido inapropiado o danino; requiere filtros y politicas de uso en produccion.
- Riesgo de alucinacion inherente a los modelos de 12 B; no hay evaluaciones publicadas de fidelidad factual.
- Las cuantizaciones de baja precision (IQ1, IQ2, Q2_K) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- La longitud de contexto no esta documentada; no debe asumirse una ventana larga sin verificar la configuracion del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus derivados deben revisarse por si incorporan terminos adicionales no reflejados en esta ficha.
- El repositorio ocupa 141,9 GB; la descarga completa no es necesaria, basta con el fichero de la cuantizacion elegida.
- No hay resultados de benchmarks ni evaluaciones independientes disponibles; el rendimiento debe validarse en el caso de uso concreto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Tenet-12B-Nemo-Unslop-v1-i1-GGUF
- Modelo base: https://huggingface.co/mr-andrey-isachenko/Tenet-12B-Nemo-Unslop-v1
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Tenet-12B-Nemo-Unslop-v1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Tenet-12B-Nemo-Unslop-v1-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
