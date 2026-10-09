# jduraes/Holo4-35B-A3B-heretic-Q6_K

## Resumen

Holo4-35B-A3B-heretic-Q6_K es una version "abliterated" (decensored) del modelo Hcompany/Holo4-35B-A3B, publicada por el usuario jduraes y cuantizada a GGUF Q6_K con importance matrix. El modelo base es un vision-language orientado a "computer use" con arquitectura Qwen3.6 MoE (etiqueta `qwen3_5_moe`), 256 expertos enrutados con 8 activos, atencion hibrida (lineal GatedDeltaNet + atencion completa) y una ventana de contexto de 262.144 tokens. Cuenta con 34.660.610.688 parametros totales (unos 34,66 mil millones) y ~3.000 millones activos por token segun la nomenclatura A3B del modelo base.

El proceso de abliteracion se ha realizado con Heretic v1.3.0 mas un parche para MoE fusionado (`SparkyForge/heretic-fused-moe-abliteration`), que expone el bloque de expertos como `mlp.down_proj(fused)` para poder ablacionar tanto los expertos enrutados como el experto compartido. Segun la model card, esto reduce las negativas del modelo base de 87/100 a 5/100 en un conjunto de 100 prompts daninos, con una divergencia KL de 0,0152 respecto al original. El encoder de vision y las capas de atencion lineal (GatedDeltaNet) quedan intactos, verificados byte a byte.

Su relevancia es doble: por un lado, ofrece una variante sin rechazos de un modelo de control de interfaz grafica que puede ejecutarse en llama.cpp y Ollama; por otro, documenta de forma inusualmente detallada el coste de la abliteracion frente al coste de la cuantizacion. El repositorio pesa 29,4 GB y el checkpoint GGUF Q6_K ocupa 26,6 GiB, con una perdida de perplejidad de solo +0,60% respecto a BF16 en wikitext-103. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido (`qwen3_5_moe`): 256 expertos enrutados con 8 activos, atencion lineal (GatedDeltaNet) + atencion completa, mas encoder de vision |
| Parametros totales | 34.660.610.688 (~34,66 mil millones) |
| Parametros activos | ~3.000 millones (deducido de la nomenclatura A3B del modelo base); cifra exacta no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF Q6_K (este repositorio) y Q4_K_M (repositorio hermano); la model card reporta mediciones comparativas de BF16, Q8_0, Q5_K_M y Q4_K_S |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q6_K) para el modelo y GGUF F16 para el proyector de vision (`mmproj.f16.gguf`); formato del modelo base: no disponible |
| Abliteracion | Heretic v1.3.0 + parche de MoE fusionado; direction_index 17.92 |
| Modo de razonamiento | Si, es un modelo "thinking" (emite bloque de razonamiento antes de la respuesta) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer de tipo Mezcla de Expertos con 256 expertos enrutados y 8 activos por token, combinada con un esquema de atencion hibrido: capas de atencion lineal basadas en GatedDeltaNet junto a capas de atencion completa. Esta combinacion reduce el coste de memoria y computo en contextos largos, lo que permite sostener la ventana de 262.144 tokens. El modelo incorpora ademas un encoder de vision, lo que lo convierte en un sistema vision-language apto para tareas de computer use (interpretacion de capturas de pantalla y control de interfaces). La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

Sobre el proceso de abliteracion, la model card es explicita: la ablacion direccional se aplico con Heretic v1.3.0 y un parche especifico para MoE fusionado. En `qwen3_5_moe`, los 256 expertos enrutados se almacenan como un unico parametro 3D fusionado (`experts.down_proj [256, hidden, inter]`), adyacente a un `shared_expert` denso. Heretic estandar solo localiza el `o_proj` de atencion y omite silenciosamente el bloque MoE, lo que produce una abliteracion debil (unas 60/100 negativas). El parche expone el bloque como `mlp.down_proj(fused)` y ablaciona expertos enrutados y compartidos mediante un forward hook por capa, fijando la edicion en los pesos reales durante el guardado. El punto de operacion se selecciono entre 100 ensayos de Optuna buscando un equilibrio de Pareto, con pesos de ablacion de 1,33/1,25 en `attn.o_proj` y 1,48/0,69 en `mlp.down_proj(fused)`. El encoder de vision y las capas `linear_attn.*` se verificaron identicos al modelo base.

La cuantizacion se realizo con importance matrix calculada sobre wikitext-103-train. La model card senala que la perdida por cuantizacion (<=0,83% en perplejidad) es menor que el dano causado por la propia abliteracion (KL 0,0152), de modo que la cuantizacion no es el cuello de botella de calidad y la abliteracion sobrevive intacta al proceso.

## Capacidades

- Generacion de texto conversacional multi-turno, con bloque de razonamiento explicito previo a la respuesta (modelo "thinking").
- Comprension de imagenes mediante el proyector de vision: interpretacion de capturas de pantalla, diagramas e interfaces graficas.
- Computer use: interaccion con entornos de escritorio y web a partir de observaciones visuales.
- Razonamiento multi-paso y planificacion de secuencias de acciones, apoyado en la ventana de 262.144 tokens.
- Generacion de codigo y de scripts de automatizacion, segun las capacidades heredadas del modelo base.
- Modo sin rechazos: la abliteracion elimina el comportamiento de negativa del modelo base (de 87/100 a 5/100 en el conjunto de evaluacion de Heretic).
- Multilingue: limitado a ingles segun la etiqueta de idioma del repositorio.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Agentes de computer use en escritorio: el modelo puede recibir capturas de pantalla y emitir acciones sobre la interfaz (clic, escritura, navegacion), apoyandose en el encoder de vision y en la ventana de 262.144 tokens para mantener el historial completo de una sesion de automatizacion.
- Automatizacion de pruebas de interfaz de usuario: dado que interpreta visualmente el estado de la pantalla, puede validar flujos de UI de extremo a extremo sin depender exclusivamente de selectores DOM, con el historial de pasos en el contexto largo.
- RPA (automatizacion robotica de procesos) sobre aplicaciones legacy: al operar por percepcion visual, permite automatizar aplicaciones de escritorio sin API expuesta, un escenario donde los selectores tradicionales fallan.
- Extraccion de datos de documentos e imagenes: capturas de facturas, tablas o formularios pueden procesarse directamente como entrada de imagen para extraer campos estructurados.
- Asistencia de accesibilidad: descripcion y navegacion guiada de interfaces para usuarios con discapacidad visual, generando instrucciones paso a paso a partir de la pantalla actual.
- Investigacion sobre alineacion y seguridad: la variante abliterated es un objeto de estudio util para medir como afecta la ablacion direccional al comportamiento de rechazo en modelos MoE con expertos fusionados, comparando contra el modelo base.
- Generacion de scripts de automatizacion a partir de una grabacion visual: el modelo puede observar una secuencia de pantallas y producir el codigo correspondiente (por ejemplo, Playwright o Selenium) como borrador revisable.
- Evaluacion de la degradacion por cuantizacion: el repositorio publica la perplejidad de seis formatos distintos, lo que lo hace util como caso de referencia metodologica para estudiar cuantizacion de MoE con importance matrix.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de evaluacion son los de abliteracion y los de perplejidad por cuantizacion.

Efecto de la abliteracion (evaluacion propia de Heretic, 100 prompts daninos):

| Modelo | Negativas | Divergencia KL |
|---|---|---|
| Holo4-35B-A3B (base) | 87 / 100 | — |
| Este modelo (BF16, pre-cuantizacion) | 5 / 100 | 0,0152 |

Perplejidad en wikitext-103 (test en crudo, contexto 2048, 20 fragmentos), cuantizaciones construidas con importance matrix sobre wikitext-103-train:

| Cuantizacion | Tamano | PPL | Delta vs BF16 |
|---|---|---|---|
| BF16 (baseline) | 64,6 GiB | 11,3042 | — |
| Q8_0 | 34,4 GiB | 11,3087 | +0,04% |
| Q6_K (este repositorio) | 26,6 GiB | 11,3716 | +0,60% |
| Q5_K_M | 23,0 GiB | 11,1107 | -1,71% |
| Q4_K_M | 19,7 GiB | 11,3979 | +0,83% |
| Q4_K_S | 18,5 GiB | 11,3645 | +0,53% |

La model card advierte que el -1,71% de Q5_K_M queda dentro de la banda de ruido de medicion (+-0,25) y refleja el conjunto de calibracion de la importance matrix, no una mejora real; a esta escala, todos los K-quants deben considerarse equivalentes.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas de los tamanos de checkpoint publicados en la model card; no proceden de mediciones de latencia o memoria del autor.

- Peso del modelo Q6_K: 26,6 GiB. Con overhead de runtime, contexto y proyector de vision, el offload completo requiere del orden de 30-32 GB de VRAM para contextos moderados.
- GPU profesionales compatibles con offload completo: A100 40 GB, A100 80 GB, H100 80 GB, RTX 6000 Ada 48 GB, RTX PRO 6000 96 GB.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB no puede alojar Q6_K completo. Alternativas: usar el repositorio hermano Q4_K_M (19,7 GiB) con contexto reducido, o repartir capas entre dos GPU de 24 GB con `-ngl` parcial.
- Contexto largo: los 262.144 tokens implican una cache KV considerable. Las capas de atencion lineal reducen parte de ese coste, pero la informacion proporcionada no incluye cifras exactas de memoria por token de contexto.
- Proyector de vision: `mmproj.f16.gguf` es obligatorio para entrada de imagen; su tamano no esta especificado en la informacion disponible.
- Despliegue: llama.cpp (`llama-server`) y Ollama mediante Modelfile son los caminos documentados. vLLM, TGI o SGLang no estan soportados por este repositorio, ya que solo distribuye pesos GGUF; requeririan convertir a safetensors, conversion no incluida.
- Ejemplo de arranque documentado: `llama-server -m holo4-35b-a3b-heretic-Q6_K.gguf --mmproj mmproj.f16.gguf -c 262144 -ngl 99 --host 0.0.0.0 --port 8080`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Negativas (100 prompts) | PPL wikitext-103 | Licencia |
|---|---|---|---|---|---|---|
| jduraes/Holo4-35B-A3B-heretic-Q6_K (este) | ~34,66B totales, ~3B activos | 262.144 | GGUF Q6_K, 26,6 GiB | 5 / 100 (BF16 pre-cuant.) | 11,3716 | Apache-2.0 |
| jduraes/Holo4-35B-A3B-heretic-Q4_K_M | ~34,66B totales, ~3B activos | 262.144 | GGUF Q4_K_M, 19,7 GiB | no medido de forma independiente | 11,3979 | Apache-2.0 |
| Hcompany/Holo4-35B-A3B (base) | ~34,66B totales, ~3B activos | 262.144 | BF16, 64,6 GiB | 87 / 100 | 11,3042 | Apache-2.0 |

Alternativas de otros fabricantes con arquitectura MoE y capacidades vision-language (por ejemplo, familias Qwen3-VL con variantes A3B): los datos de parametros, contexto, rendimiento y disponibilidad no estan disponibles en la informacion proporcionada para establecer una comparacion fiable. La comparacion directa solo es posible frente al modelo base y su cuantizacion hermana, que son los unicos con mediciones publicadas en la model card.

## Limitaciones y advertencias

- La abliteracion elimina el comportamiento de rechazo de forma deliberada. El modelo respondera a peticiones que el original rechazaria; desplegarlo en un producto orientado al usuario final sin filtros externos es un riesgo legal y reputacional.
- La abliteracion no anade capacidades. Cualquier limitacion del modelo base en razonamiento, codigo o vision se mantiene intacta.
- Existe una degradacion medible respecto al base (divergencia KL 0,0152), que la model card reconoce como superior al dano introducido por la cuantizacion.
- Idioma: el repositorio declara unicamente ingles (`en`). El rendimiento en castellano no esta evaluado y no puede asumirse.
- Riesgo de alucinacion: es especialmente relevante en computer use, donde una accion alucinada sobre la interfaz (coordenadas incorrectas, campos equivocados) puede provocar efectos reales en el sistema operativo.
- La cuantizacion Q6_K introduce una perdida de perplejidad del +0,60% frente a BF16; para tareas sensibles a la precision puede ser preferible BF16 o Q8_0.
- Requiere el proyector de vision `mmproj.f16.gguf` para cualquier entrada de imagen; sin el, el modelo solo procesa texto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-10-09. No ha pasado por validacion de la comunidad ni por evaluaciones independientes.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el autor recuerda que el uso debe respetar la licencia del modelo base y la normativa local aplicable. La responsabilidad del uso recae en el desplegador.
- Compatibilidad limitada: al distribuirse solo en GGUF, no es directamente utilizable en stacks de servidores de inferencia que requieran safetensors (vLLM, TGI, SGLang).
- El modo "thinking" implica que el modelo genera un bloque de razonamiento antes de responder, lo que incrementa el consumo de tokens de salida y la latencia percibida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jduraes/Holo4-35B-A3B-heretic-Q6_K
- Repositorio hermano Q4_K_M: https://huggingface.co/jduraes/Holo4-35B-A3B-heretic-Q4_K_M
- Modelo base: https://huggingface.co/Hcompany/Holo4-35B-A3B
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Parche de abliteracion para MoE fusionado: https://huggingface.co/SparkyForge/heretic-fused-moe-abliteration
- Busqueda web: no se han encontrado resultados relevantes para este modelo. Los enlaces devueltos por el buscador corresponden a un atleta de CrossFit y no guardan ninguna relacion con el modelo, por lo que se descartan. No se dispone de paper, blog de anuncio ni demo adicional.
