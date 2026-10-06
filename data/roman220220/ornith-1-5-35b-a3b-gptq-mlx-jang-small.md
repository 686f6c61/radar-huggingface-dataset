# roman220220/Ornith-1.5-35B-A3B-gptq-mlx-jang-small

## Resumen

Ornith-1.5-35B-A3B-gptq-mlx-jang-small es una cuantizacion extrema en formato MLX del modelo ornith-ai/Ornith-1.5-35B-A3B, un transformer de mezcla de expertos (MoE) de unos 35.107 millones de parametros totales con aproximadamente 3.000 millones activos por token, construido sobre la arquitectura Qwen3.5-MoE y postentrenado con aprendizaje por refuerzo para tareas de codigo y agenticas. La publica el usuario roman220220 y su objetivo es hacer caber el modelo en Macs con memoria unificada limitada: reduce el repositorio de 72 GB en bf16 a 14,4 GB.

La receta de cuantizacion combina GPTQ con una asignacion de bits por componente: atencion completa a 8 bits, atencion lineal Gated DeltaNet a 6, experto compartido a 6, proyecciones gate y up de los expertos enrutados a 2 bits y sus proyecciones down a 3 bits, con router y puertas en bf16 y la torre de vision a 8 bits. Es la variante mas agresiva de la familia: existe una version de 3 bits (17,0 GB) que pierde mucho menos calidad.

El modelo es relevante por dos motivos. Primero, documenta de forma medible el coste real de bajar a 2 bits los pesos de los expertos: un aumento de perplejidad del 21,1 % en texto y del 44,1 % en codigo Python frente a bf16. Segundo, demuestra que es posible conservar la torre de vision funcional en una cuantizacion de este calibre, con caracteristicas que coinciden con las de transformers en coseno 0,994.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE sobre Qwen3.5-MoE, con atencion completa en 10 de 40 capas y atencion lineal Gated DeltaNet en 30 capas; torre de vision tipo Qwen3-VL |
| Parametros totales | 35.107.180.016 (35,1 B) |
| Parametros activos | ~3 B por token |
| Longitud de contexto | no disponible (la model card solo indica que la medicion de memoria se hace con contexto de 2.000 tokens) |
| Tipos de cuantizacion | GPTQ con receta de bits por componente: atencion 8, atencion lineal 6, experto compartido 6, expertos enrutados gate/up 2, expertos enrutados down 3, router y puertas bf16, embeddings y cabeza de salida 8, torre de vision 8 (group size 64) |
| Idiomas soportados | no disponible (el repositorio no declara idiomas; el calibrado y las metricas son en ingles y codigo Python) |
| Licencia | MIT |
| Formato de pesos | safetensors para MLX (`library_name: mlx`), repositorio de 14,4 GB |

## Arquitectura y entrenamiento

El modelo base es un MoE de 40 capas. Diez capas usan atencion completa (q, k, v, o) y treinta usan atencion lineal Gated DeltaNet con proyecciones in_proj_qkv, in_proj_z y out_proj. Cada capa contiene 256 expertos enrutados de los que se activan 8, ademas de un experto compartido. Los expertos enrutados concentran 32,2 B de los 35 B de parametros, por lo que determinan el tamano del artefacto. El modelo base incluye una cabeza de prediccion multi-token que esta cuantizacion no conserva. El postentrenamiento descrito en la model card del modelo base incluye aprendizaje por refuerzo orientado a codigo y tareas agenticas, aunque este build no reejecuta esas evaluaciones.

La cuantizacion se hizo con GPTQ sobre la rejilla afin de MLX, con compensacion de error de Hessian, calibrada capa a capa sobre las salidas de las capas ya cuantizadas. El conjunto de calibracion son 128 fragmentos de 512 tokens, mitad wikitext-2 de entrenamiento y mitad codigo fuente Python, procesados en una A100. Cada experto enrutado se calibra con los tokens que el router le asigna. Los ficheros conservan los codigos, escalas y sesgos propios de GPTQ en lugar de la rejilla min/max que MLX derivaria por su cuenta.

## Capacidades

- Generacion de texto conversacional en ingles y capacidad de continuacion de codigo, con la perdida de calidad que implica la cuantizacion a 2 bits en los expertos.
- Entrada de imagen y texto (`pipeline_tag: image-text-to-text`): la torre de vision se mantiene a 8 bits y describe imagenes de prueba correctamente, con caracteristicas que coinciden con transformers en coseno 0,994 de media por token.
- Razonamiento agentico y de multiples pasos heredado del postentrenamiento del modelo base con RL, aunque no se han vuelto a medir estas capacidades en este build.
- Soporte de tool calling y function calling: la model card del modelo base lo declara como modelo postentrenado para tareas agenticas, pero este repositorio no aporta evaluaciones propias.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de razonamiento explicito (thinking): no disponible en la informacion proporcionada.
- Cabeza de prediccion multi-token: no incluida en esta cuantizacion.

## Casos de uso

- Asistente local sin conexion en macOS: el modelo se carga con `mlx_lm.generate` o `mlx_lm.server` y encaja en unos 16 GB de memoria de GPU en Apple Silicon con contexto de 2.000 tokens, de modo que permite chat privado sin que ningun dato salga del equipo.
- Servidor compatible con la API de OpenAI en una estacion de trabajo Mac: `mlx_lm.server` expone el modelo en el puerto 8080 y permite conectar herramientas cliente ya existentes (editores, frameworks de agentes) sin adaptadores propios.
- Analisis de imagenes con descripcion textual: la torre de vision a 8 bits responde a tareas de image-text-to-text, util para generar pies de foto, resumir capturas o describir diagramas en un flujo puramente local.
- Prototipado en portatiles Apple Silicon de gama media: con 14,4 GB de pesos y unos 16 GB de memoria necesarios, es una de las pocas opciones MoE de 35 B que cabe en maquinas de 16 a 24 GB, a cambio de aceptar la degradacion descrita.
- Demostracion e investigacion sobre cuantizacion extrema: el pipeline publico en el repositorio quant-ternary permite reproducir la receta y comparar el efecto de bajar los expertos de 3 a 2 bits.
- Procesamiento por lotes de documentos con contexto corto: para tareas de clasificacion, extraccion o resumen de fragmentos pequenos, donde el contexto de 2.000 tokens es suficiente y el coste de la cuantizacion sobre prosa (21,1 % de perplejidad adicional) es tolerable.
- Generacion de codigo en local: viable para autocompletado y pequenas funciones, aunque la propia model card recomienda el build de 3 bits siempre que quepa, porque en codigo la perdida asciende al 44,1 %.

## Benchmarks y rendimiento

Unicamente hay medidas de perplejidad publicadas por el autor de la cuantizacion (40 fragmentos de 512 tokens, wikitext-2 test para texto y biblioteca estandar de Python para codigo, conjunto no usado en el calibrado). No se han reejecutado los benchmarks de codigo y agenticos del modelo base.

| Modelo | Tamano | PPL texto | vs bf16 | PPL codigo | vs bf16 |
|---|---|---|---|---|---|
| bf16 (HF transformers) | 72 GB | 9,711 | referencia | 2,166 | referencia |
| 3 bits en expertos (Ornith-1.5-35B-A3B-gptq-mlx-jang) | 17,0 GB | 10,368 | +6,8 % | 2,507 | +15,7 % |
| Este modelo, gate/up a 2 bits (MLX) | 14,4 GB | 11,761 | +21,1 % | 3,122 | +44,1 % |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Memoria: unos 16 GB de memoria de GPU en Apple Silicon con contexto de 2.000 tokens, cifra estimada a partir de los 18,8 GB medidos en el build de 17 GB.
- Plataforma: exclusivamente Apple Silicon mediante MLX; no hay soporte publicado para CUDA.
- GPU recomendadas: no aplica para inferencia en el marco de esta cuantizacion. La A100 se uso solo para el calibrado GPTQ.
- Cabe en GPU de consumo: no en el sentido de tarjetas graficas dedicadas; si cabe en Macs con memoria unificada de 16 GB o mas, y es recomendable disponer de 24 GB o mas para ampliar el contexto mas alla de 2.000 tokens.
- Opciones de despliegue: MLX con el fork `ipsupport-llc/mlx-lm`, que aporta la torre de vision de Qwen3.5/Qwen3.5-MoE, el mRoPE intercalado y el preprocesado de imagen. La libreria `mlx-lm` estandar carga el modelo solo como texto. `mlx_lm.server` ofrece una API compatible con OpenAI.
- vLLM, llama.cpp, Ollama y TGI: no disponibles para este artefacto en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparacion natural es con los otros dos formatos del mismo modelo base, ya que en la informacion proporcionada no aparecen alternativas de terceros de tamano y arquitectura equivalentes.

| Version | Parametros | Contexto | PPL texto | PPL codigo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este build (2 bits en gate/up de expertos, MLX) | 35,1 B totales / ~3 B activos | no disponible | 11,761 | 3,122 | MIT | HuggingFace, 14,4 GB |
| Ornith-1.5-35B-A3B-gptq-mlx-jang (3 bits en expertos, MLX) | 35,1 B totales / ~3 B activos | no disponible | 10,368 | 2,507 | MIT | HuggingFace, 17,0 GB |
| Ornith-1.5-35B-A3B en bf16 (HF transformers) | 35,1 B totales / ~3 B activos | no disponible | 9,711 | 2,166 | MIT | HuggingFace, 72 GB |

## Limitaciones y advertencias

- Cuantizacion extrema declarada por el propio autor: "espera respuestas notablemente peores". Dos tercios de los pesos del modelo estan a 2 bits.
- Degradacion medida: +21,1 % de perplejidad en texto y +44,1 % en codigo Python respecto a bf16. Para programacion, la recomendacion explicita es usar el build de 3 bits si cabe en la maquina.
- Riesgo de alucinacion: no se han medido tasas de alucinacion en esta cuantizacion; la degradacion de perplejidad sugiere un aumento respecto al modelo en bf16, pero no hay datos concretos.
- Dependencia de un fork no estandar: la entrada de imagen requiere `ipsupport-llc/mlx-lm`; con `mlx-lm` estandar el modelo carga solo texto.
- La cabeza de prediccion multi-token del modelo base no se conserva, lo que elimina cualquier aceleracion basada en decodificacion especulativa propia del modelo.
- Idiomas soportados no declarados: no hay garantia de comportamiento multilingue y la calibracion y las metricas son exclusivamente en ingles y codigo Python.
- Longitud de contexto no documentada en esta ficha; las mediciones de memoria corresponden a 2.000 tokens, y ampliar el contexto incrementa la memoria necesaria.
- Las limitaciones de uso previsto del modelo base aplican sin cambios, segun indica el propio autor de la cuantizacion.
- Restricciones de licencia: licencia MIT, por lo que se permite uso comercial, pero conviene verificar las condiciones del modelo base (ornith-ai/Ornith-1.5-35B-A3B), tambien MIT segun la etiqueta del repositorio.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay validacion independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/roman220220/Ornith-1.5-35B-A3B-gptq-mlx-jang-small
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Build de 3 bits del mismo autor: https://huggingface.co/roman220220/Ornith-1.5-35B-A3B-gptq-mlx-jang
- Fork de MLX con soporte de vision: https://github.com/ipsupport-llc/mlx-lm
- Pipeline y scripts de cuantizacion: https://github.com/rromenskyi/quant-ternary
- LLMTray (aplicacion macOS): https://www.ipsupport.us/llmtray/
- Repositorio de LLMTray: https://github.com/ipsupport-llc/llmtray
- Descarga de LLMTray: https://github.com/ipsupport-llc/llmtray/releases/latest/download/LLMTray-Full.dmg

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos fueron paginas de ayuda de YouTube sin relacion con el contenido de la ficha.
