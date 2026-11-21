# kindlingai/gemma-4-e4b-exlr8-mixed-k

## Resumen

Gemma 4 E4B exlr8 mixed K es una cuantizacion del modelo google/gemma-4-E4B-it publicada por kindlingai. Se trata de una version comprimida en la que las capas lineales de atencion y MLP se almacenan como codificaciones trellis de 2, 3 y 4 bits en el formato exlr8, mientras que el resto de tensores se mantienen en BF16. Un manifiesto selecciona la anchura de bits para cada tipo de matriz, lo que permite distintos perfiles de compromiso entre tamano y fidelidad respecto al modelo original.

El modelo base es la variante instructiva E4B de la familia Gemma 4 de Google, aunque la informacion disponible no detalla su arquitectura interna, numero de parametros ni longitud de contexto. La relevancia de esta publicacion radica en el formato de cuantizacion exlr8, una alternativa a las tecnicas habituales (GPTQ, AWQ, GGUF K-quants) que codifica las matrices con trellis y permite perfiles por debajo de 3 bits por peso con metricas de divergencia KL y acuerdo top-1 declaradas frente a BF16.

El repositorio ocupa 10,9 GB y esta etiquetado con licencia Apache 2.0, si bien el enlace de licencia apunta a la licencia propia de Gemma 4 de Google. La libreria asociada es trellis y el modelo fue creado el 21 de noviembre de 2026, sin descargas ni likes registrados en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la del modelo base google/gemma-4-E4B-it; detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Trellis exlr8 de 2, 3 y 4 bits en lineales de atencion y MLP; resto de tensores en BF16. Perfiles: bit217 (2,17 bits/peso), bit245 (2,45 bits/peso), bit309 (3,09 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | Formato exlr8 (trellis), libreria trellis; no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo google/gemma-4-E4B-it, de la que no se aportan detalles estructurales en la informacion disponible (numero de capas, dimension oculta, atencion, contexto). Lo especifico de esta publicacion es el esquema de cuantizacion: las matrices lineales de atencion (q, k, v, o) y de MLP (gate, up, down) se codifican con trellis en el formato exlr8, con anchuras de 2 a 4 bits segun el tipo de matriz y el perfil elegido en el manifiesto.

No se trata de un modelo reentrenado ni de un ajuste fino: es una conversion post-entrenamiento del modelo instructivo original. No hay informacion sobre datos de entrenamiento, tokens vistos, RLHF/DPO ni innovaciones de inferencia (decodificacion especulativa, atencion lineal, etc.) mas alla del propio esquema de compresion trellis.

## Capacidades

- Hereda las capacidades del modelo base google/gemma-4-E4B-it, si bien la informacion disponible no las enumera de forma explicita.
- Generacion de texto e instrucciones en modo instructivo (sufijo -it del modelo base).
- Las capacidades de razonamiento, codigo, matematicas, vision, tool calling, agentes o multilingue no estan documentadas en la informacion disponible.
- Perfiles de cuantizacion con distinto compromiso de fidelidad: el perfil bit309 alcanza un 89,1 % de acuerdo top-1 con BF16, mientras que bit217 baja al 78,0 %.

## Casos de uso

- Despliegue en entornos con memoria limitada: los perfiles de 2,17 y 2,45 bits por peso reducen el espacio de las lineales de atencion y MLP frente a BF16, lo que permite servir el modelo en hardware con menos VRAM que el modelo original.
- Evaluacion de tecnicas de cuantizacion: el repositorio publica metricas de divergencia KL y acuerdo top-1 por perfil, lo que lo hace util como referencia para comparar exlr8 con GPTQ, AWQ o GGUF K-quants sobre el mismo modelo base.
- Investigacion en formatos de compresion: el formato exlr8 y su manifiesto por tipo de matriz permiten estudiar el impacto de asignar anchuras distintas a q, k, v, o, gate, up y down.
- Prototipado de asistentes conversacionales: al derivar de un modelo instructivo, puede emplearse para generar respuestas en tareas de dialogo, siempre que se valide la calidad tras la cuantizacion.
- Pruebas de regresion de calidad: las metricas de acuerdo top-1 (78,0 %, 81,8 % y 89,1 %) permiten seleccionar el perfil que cumple un umbral de fidelidad antes de desplegar.
- Integracion en pipelines de investigacion con la libreria trellis: el formato de pesos requiere esta libreria, por lo que encaja en flujos que ya la utilicen para cargar y ejecutar modelos cuantizados.

## Benchmarks y rendimiento

Los unicos datos publicados son las metricas de fidelidad frente a BF16 sobre 131 000 tokens reservados, por perfil de cuantizacion.

| Perfil | k, v, o | q | gate, up | down | Bits/peso | KL vs BF16 | Acuerdo top-1 |
|---|---|---|---|---|---|---|---|
| bit217 | K4 | K2 | K2 | K2 | 2,17 | 0,384 | 78,0 % |
| bit245 | K4 | K2 | K2 | K3 | 2,45 | 0,264 | 81,8 % |
| bit309 | K4 | K3 | K3 | K3 | 3,09 | 0,092 | 89,1 % |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma directa. El repositorio ocupa 10,9 GB, lo que da una cota superior del espacio en disco de los pesos; la VRAM en inferencia depende del perfil y del runtime.
- GPU recomendadas: no disponibles. Al no conocerse el numero de parametros ni el contexto, no puede estimarse con rigor.
- Compatibilidad con GPU de consumo: no confirmada. El tamano del repositorio (10,9 GB) sugiere que podria cargarse en GPUs con 12-16 GB de VRAM, pero no hay datos oficiales que lo verifiquen.
- Opciones de despliegue: la libreria indicada es trellis, con formato exlr8; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kindlingai/gemma-4-e4b-exlr8-mixed-k | no disponible | no disponible | Trellis exlr8 2-4 bits | Apache 2.0 | Hugging Face |
| google/gemma-4-E4B-it (modelo base) | no disponible | no disponible | BF16 | Gemma 4 license | Hugging Face |

No se dispone de informacion sobre otras alternativas comparables (mismo tamano o misma tarea) en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de fidelidad: incluso el perfil mas alto (bit309) solo alcanza un 89,1 % de acuerdo top-1 con BF16, y el perfil bit217 baja al 78,0 %.
- El formato exlr8 requiere la libreria trellis; no es compatible con runtimes estandar como llama.cpp, vLLM u Ollama sin conversion.
- No hay informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni limitaciones de contexto del modelo base en esta ficha.
- La licencia se declara Apache 2.0, pero el enlace apunta a la licencia de Gemma 4 de Google; conviene verificar los terminos aplicables antes de un uso comercial.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso en produccion ni validacion independiente de las metricas declaradas.
- No se han publicado benchmarks de tareas, de modo que el rendimiento real en razonamiento, codigo o matematicas no esta cuantificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kindlingai/gemma-4-e4b-exlr8-mixed-k
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Especificacion del formato exlr8: https://github.com/kindlingai/exlr8/blob/main/FORMAT.md
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
