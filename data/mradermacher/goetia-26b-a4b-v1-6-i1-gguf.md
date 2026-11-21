# mradermacher/Goetia-26B-A4B-v1.6-i1-GGUF

## Resumen
Goetia-26B-A4B-v1.6 es un modelo de lenguaje orientado a escritura creativa, narrativa, roleplay y generacion de tramas, publicado por Naphula. La variante resenada aqui es una cuantizacion GGUF realizada por mradermacher, que empaqueta los pesos originales en formatos IQ y K-quant para su uso con llama.cpp y derivados. El modelo original parte de una arquitectura tipo MoE (mezcla de expertos) con aproximadamente 26.000 millones de parametros totales, de ahi la nomenclatura "26B-A4B", que sugiere unos 4.000 millones de parametros activos por token, aunque este dato no esta confirmado en la informacion disponible.

El modelo se presenta como un merge (fusion) de modelos, construido con mergekit y mergekit-exp, con etiquetas que apuntan a la familia Gemma 4 ("gemma4") y a una variante "moe_della". Esta orientado explicitamente a generacion de ficcion, continuacion de escenas, subtramas, romance, terror, ciencia ficcion y conversacion con personajes. Su relevancia actual radica en que ofrece una alternativa cuantizada, ligera y ejecutable en hardware de consumo para tareas creativas, con licencia Apache 2.0, lo que facilita su uso comercial y su integracion en pipelines locales.

La ficha describe la variante GGUF i1 (imatrix) de mradermacher, que incluye un abanico amplio de cuantizaciones desde IQ1_S (8,6 GB) hasta Q6_K (23,3 GB), pensadas para distintos presupuestos de memoria. El modelo base es Naphula/Goetia-26B-A4B-v1.6, del que no se dispone de model card detallada en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) segun tags "moe_della" y "mergekit"; detalles internos no disponibles |
| Parametros totales | 25.971.339.550 (aprox. 26B) |
| Parametros activos | no disponible (la nomenclatura "A4B" sugiere ~4B, sin confirmacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (variante cuantizada); pesos originales del modelo base presumiblemente safetensors, no confirmado |

## Arquitectura y entrenamiento
La informacion disponible indica que Goetia-26B-A4B-v1.6 es un modelo resultante de un merge, construido con mergekit y mergekit-exp, con etiquetas que lo vinculan a la familia Gemma 4 y a una arquitectura MoE ("moe_della"). El sufijo "A4B" es coherente con un diseno de mezcla de expertos con alrededor de 4.000 millones de parametros activos por token, aunque no se confirma en la documentacion. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

La variante aqui resenada es una cuantizacion i1 (imatrix) generada por mradermacher, que emplea un fichero imatrix para ponderar la cuantizacion de cada tensor y mejorar la calidad respecto a cuantizaciones estaticas equivalentes. Tambien existe una familia de cuantizaciones estaticas en el repositorio mradermacher/Goetia-26B-A4B-v1.6-GGUF. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o attention linear.

## Capacidades
- Generacion de texto narrativo: ficcion, cuentos, novelas, continuacion de escenas y subtramas.
- Escritura creativa con "prosing" vivido, segun las etiquetas del autor.
- Roleplay y conversacion con personajes, incluido contenido romantico, de terror y ciencia ficcion.
- Generacion de tramas y subtramas para proyectos de escritura.
- Cobertura de multiples generos ("all genres"): romance, horror, ciencia ficcion, ficcion general.
- Tono conversacional y registro coloquial, incluida la etiqueta "swearing" (lenguaje soez).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles ("eng").

## Casos de uso
- Generacion de ficcion por capítulos: el modelo puede continuar escenas y mantener coherencia narrativa en tareas de escritura larga, aprovechando su entrenamiento orientado a storytelling y "scene continue".
- Roleplay conversacional: adecuado para chatbots de personajes y simulaciones de dialogo, dado su enfoque en RP y conversacion multi-turno, siempre que la ventana de contexto del modelo base lo permita (dato no disponible).
- Generacion de tramas y subtramas para guionistas y autores: util para producir borradores de argumentos, arcos secundarios y variantes de una premisa.
- Escritura de terror y ciencia ficcion: las etiquetas del autor indican cobertura especifica de estos generos, lo que permite generar atmosferas y escenarios propios del genero.
- Prototipado creativo en local: al estar cuantizado en GGUF y con tamanos desde 8,6 GB, puede ejecutarse en estaciones de trabajo con GPU de consumo para iterar rapidamente sobre borradores.
- Generacion de dialogos para videojuegos narrativos: el modelo puede producir lineas de personaje y variaciones de respuesta, integrable via llama.cpp en motores de dialogo.
- Asistencia a escritores con tono coloquial: su registro conversacional y la etiqueta "swearing" permiten generar dialogos naturales y crudos cuando el guion lo requiera.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada segun cuantizacion: i1-IQ1_S ~8,6 GB; i1-IQ2_M ~10,8 GB; i1-IQ3_S ~12,6 GB; i1-IQ4_XS ~14,4 GB; i1-Q4_K_M ~17,3 GB; i1-Q5_K_M ~19,7 GB; i1-Q6_K ~23,3 GB. Estos tamanos corresponden al fichero de pesos; hay que sumar overhead de contexto KV cache.
- GPU recomendadas: para Q4_K_M o IQ4_XS, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permite cargar el modelo completo en VRAM; para Q6_K, se requiere al menos 24 GB y margen para contexto, o bien offloading parcial.
- Cabe en GPU de consumo: si, en tarjetas de 12-16 GB con cuantizaciones IQ2/IQ3 o Q4_K_S con offloading parcial; en 8 GB solo con IQ1/IQ2 agresivas o offloading a CPU.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con endpoints (tag "endpoints_compatible"). No se documenta soporte en vLLM o TGI para este formato.
- Latencia y throughput: no disponibles. Al ser un MoE con pocos parametros activos (segun nomenclatura), se espera un throughput superior al de un denso de 26B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Goetia-26B-A4B-v1.6 (i1-GGUF) | ~26B totales, activos no confirmados | no disponible | apache-2.0 | GGUF | Enfoque creativo/roleplay, merge MoE |
| Modelos densos de ~27B de la familia Gemma | ~27B | no disponible en esta ficha | segun familia | safetensors/GGUF | Referencia generica de tamano similar; no se dispone de datos comparativos |
| Alternativas de roleplay cuantizadas de ~20-30B | variable | variable | variable | GGUF | No se dispone de comparativa verificada en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo verificados; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias
- Idiomas: solo ingles ("eng"); el rendimiento en castellano no esta garantizado.
- Sesgos: no documentados por el autor; al ser un merge orientado a ficcion, puede reproducir estereotipos de genero, culturales o de角色 presentes en los datos de entrenamiento.
- Alucinacion: riesgo inherente en modelos generativos; en tareas factuales o de codigo no hay evidencia de robustez.
- Contenido sensible: las etiquetas incluyen "swearing" y tematicas de terror/romance; puede generar lenguaje soez o contenido no apto para todos los publicos.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los modelos fusionados en el merge, que no se detallan.
- Las cuantizaciones IQ1/IQ2 estan marcadas por el autor como "for the desperate", "mostly desperate" o "very low quality"; no son recomendables para produccion.
- No hay datos publicados sobre contexto maximo, tool calling ni rendimiento en benchmarks; no debe asumirse soporte de agentes o function calling.
- El modelo base no dispone de model card detallada en la informacion proporcionada, lo que limita la trazabilidad de datos de entrenamiento y evaluacion.

## Enlaces
- Repositorio GGUF i1: https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.6-i1-GGUF
- Modelo base: https://huggingface.co/Naphula/Goetia-26B-A4B-v1.6
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.6-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Goetia-26B-A4B-v1.6-i1-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
