# roman220220/nemotron-30b-a3b-gptq-jang-component

## Resumen

Nemotron-30B-A3B-GPTQ-JANG-component es una version cuantizada en precision mixta del modelo base nvidia/Nemotron-3.5-Lightning-30B-A3B, publicada por el usuario roman220220. No se trata de un modelo entrenado desde cero ni de un fine-tuning, sino de un artefacto de compresion: aplica cuantizacion GPTQ con calibracion basada en Hessianas sobre los pesos originales en bf16, con una asignacion de bits por tipo de componente inspirada (y reconstruida de forma inversa) a partir del `config.json` publicado por un tercero, JANG_2L-CRACK.

El modelo base es un hibrido NemotronH de 52 capas que combina bloques Mamba2 con atencion tradicional y capas MoE (mezcla de expertos) con 128 expertos enrutados por bloque. El resultado cuantizado ocupa aproximadamente 16 GB en disco, con una media de 4,237 bits por peso, y mantiene una perplejidad de 5,24 frente a 5,11 del bf16 de referencia en wikitext-2-raw, lo que supone una degradacion muy contenida para ese nivel de compresion.

Su relevancia es doble. Por un lado, demuestra empiricamente que la calibracion GPTQ y la estrategia de asignacion de bits son palancas independientes y acumulables: el mismo esquema de bits con calibracion propia (5,24) supera al release de terceros con asignacion equivalente pero aparentemente sin calibracion (5,43). Por otro, es un ejemplo de cuantizacion selectiva consciente de la estructura del modelo, aplicando 8 bits a las componentes pequenas en numero de parametros y solo 3-4 bits al pool mayoritario (expertos enrutados, cerca del 93 % del total).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH hibrida: Mamba2 + atencion + MoE, 52 capas |
| Parametros totales | 31.577.935.872 (31,6 B) |
| Parametros activos | Aproximadamente 3 B segun la nomenclatura A3B del modelo base (no confirmado en la documentacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ con precision mixta por tipo de componente, group size 64, media 4,237 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License Agreement v1.1 (openmdw-1.1), heredada del modelo base |
| Formato de pesos | safetensors en formato MLX (libreria mlx-lm); no se incluye GGUF |

Asignacion de bits por componente aplicada en esta version:

| Componente | Bits |
|---|---|
| attention q/k/v/o_proj | 8 |
| mamba in_proj/out_proj | 6 |
| MoE shared_experts (up + down) | 8 |
| MoE routed up (switch_mlp.fc1) | 4 |
| MoE routed down (switch_mlp.fc2) | 3 |
| embeddings | 6 |
| lm_head | 8 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base de NVIDIA: un transformer hibrido NemotronH de 52 capas que intercala bloques de espacio de estados (Mamba2) con capas de atencion convencional y bloques MoE. Cada bloque MoE contiene 128 expertos enrutados. Esta combinacion busca reducir el coste de la atencion cuadratica en secuencias largas mediante las capas tipo SSM, manteniendo la capacidad de recuperacion de contexto a traves de las capas de atencion. El presente repositorio no entrena ni modifica la arquitectura: solo reemplaza los pesos por versiones cuantizadas.

En cuanto al proceso de cuantizacion documentado, se aplica GPTQ con compensacion de error basada en Hessianas, verificado bit-exacto contra el kernel afín de MLX, y una asignacion de bits puramente por tipo de componente, uniforme en todas las capas (sin criterio posicional ni puntuacion por capa). El autor indica que el esquema de bits es una reconstruccion inversa de la estrategia de JANG_2L-CRACK a partir de su `config.json` publico, y que la asimetria up(4)/down(3) dentro de los expertos enrutados responde a que ese pool concentra aproximadamente el 93 % de los parametros del modelo. La receta se implementa con el pipeline propio del autor (`poc/gptq_stock_convert.py --quant-recipe-mode component --component-recipe jang` y `poc/mlx_convert_recipe.py --mode component`). No se dispone de informacion sobre los datos de entrenamiento del modelo base, ni sobre si hubo RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Generacion de texto autorregresiva en el marco de MLX, heredada del modelo base Nemotron-3.5-Lightning-30B-A3B.
- Inferencia eficiente en cuanto a computo por token gracias a la naturaleza MoE del modelo base, con activacion de una fraccion pequena de parametros por token.
- Procesamiento de secuencias largas mediante las capas Mamba2 del backbone, si bien la longitud de contexto efectiva no esta documentada.
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio) o modo de razonamiento explicito: no disponible en la informacion proporcionada.
- Uso previsto principal: servir como variante de bajo consumo de memoria del modelo base para ejecucion local en hardware Apple Silicon.

## Casos de uso

- Inferencia local en Mac con memoria unificada limitada: con aproximadamente 16 GB de pesos, el modelo puede cargarse en un Mac con 32 GB de memoria unificada y ejecutarse con `mlx-lm`, algo inviable con los pesos en bf16 del modelo base para muchos equipos de gama alta de consumo.
- Prototipado offline sin conectividad: al ser un artefacto autocontenido y ejecutable en local, permite desarrollar y probar prompts y flujos de generacion sin depender de APIs externas ni enviar datos a terceros.
- Procesamiento de datos sensibles bajo requisitos de privacidad: el despliegue local evita la salida de datos de la organizacion, lo que resulta adecuado para borradores de documentacion interna, resumen de informes o clasificacion de textos confidenciales.
- Investigacion sobre cuantizacion de modelos MoE hibridos: el repositorio documenta la receta, la asignacion de bits y el metodo de calibracion, por lo que sirve como punto de partida reproducible para estudiar el impacto de la precision mixta en arquitecturas Mamba2 + MoE.
- Evaluacion comparativa de estrategias de cuantizacion: la tabla de perplejidad publicada permite reproducir y contrastar la receta por componente frente a recetas posicionales (`mixed_3_6`), de sensibilidad (`smart_3_6`) y uniformes de 3 bits.
- Generacion de texto de larga duracion en local: la combinacion de capas Mamba2 con una cuantizacion agresiva de los expertos enrutados hace atractivo el modelo para tareas de continuacion de texto y resumen extenso en equipos de sobremesa Apple, siempre que la longitud de contexto real se valide empiricamente.
- Base para experimentos de ajuste fino ligero en MLX: al ser un checkpoint cuantizado, puede utilizarse como referencia de calidad para comparar con versiones adaptadas mediante LoRA en hardware Apple.
- Docencia y divulgacion tecnica: sirve como caso de estudio concreto de cuantizacion consciente de la estructura, con metricas publicadas y pipeline reproducible, para explicar la diferencia entre asignacion de bits y calibracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de evaluacion proporcionado es la perplejidad sobre wikitext-2-raw, medida con 20 fragmentos de 512 tokens y desplazamiento de un cuarto:

| Modelo | Perplejidad (wikitext-2-raw) |
|---|---|
| bf16 (precision completa, referencia) | 5,11 |
| Este modelo (asignacion JANG + calibracion GPTQ propia) | 5,24 |
| JANG_2L-CRACK (terceros, misma asignacion, presuntamente RTN sin calibracion) | 5,43 |
| Receta posicional `mixed_3_6` del mismo proyecto | 5,81 |
| Receta de sensibilidad `smart_3_6` del mismo proyecto | 5,90 |
| GPTQ uniforme de 3 bits del mismo proyecto | 6,24 |
| RTN uniforme de 3 bits sin calibracion | 6,54 |

El autor indica que 5,24 es el mejor resultado de su sesion de experimentos y que supera al release de terceros con la misma asignacion de bits, lo que atribuye al valor anadido de la calibracion basada en Hessianas.

## Requisitos de hardware

- El formato de pesos es MLX, por lo que la inferencia esta orientada a chip Apple Silicon (series M1, M2, M3 y M4). No es directamente utilizable en GPU NVIDIA o AMD sin conversion previa a otro formato.
- Tamano de pesos en disco: aproximadamente 16 GB (16,7 GB de repositorio). La memoria unificada necesaria para inferencia sera superior, ya que hay que sumar la cache KV y otros buffers.
- Memoria unificada recomendada: 24 GB como minimo practico y 32 GB o mas para trabajar con comodidad. En un Mac con 18 GB la carga sera ajustada y dependera de la longitud de contexto y del resto de aplicaciones abiertas.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables de forma nativa por el formato MLX; se requeriria reconversion de pesos, no documentada en este repositorio.
- Opciones de despliegue: `mlx-lm` es la via soportada, con el comando `python -m mlx_lm.generate --model roman220220/nemotron-30b-a3b-gptq-jang-component --prompt "..."`. No se documentan soportes para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Perplejidad (wikitext-2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| roman220220/nemotron-30b-a3b-gptq-jang-component | 31,6 B totales (A3B) | GPTQ mixta por componente, 4,237 bits/peso medios, grupo 64 | 5,24 | OpenMDW 1.1 | MLX, safetensors |
| nvidia/Nemotron-3.5-Lightning-30B-A3B | 31,6 B totales (A3B) | bf16 sin cuantizar | 5,11 | OpenMDW 1.1 | Pesos originales |
| JANG_2L-CRACK (release de terceros) | No disponible | Afin de 3,73 bits (MLX), presuntamente RTN | 5,43 | No disponible | MLX |
| GPTQ uniforme de 3 bits (mismo proyecto) | No disponible | GPTQ uniforme 3 bits | 6,24 | No disponible | No disponible |
| RTN uniforme de 3 bits (mismo proyecto) | No disponible | RTN uniforme 3 bits, sin calibracion | 6,54 | No disponible | No disponible |

No se dispone de comparaciones con modelos de otras familias y tamano similar dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de cuantizacion, no un modelo nuevo: hereda integramente los sesgos y limitaciones del modelo base Nemotron-3.5-Lightning-30B-A3B, que no se documentan en la informacion disponible.
- Degradacion medible respecto a bf16: la perplejidad pasa de 5,11 a 5,24 en el conjunto de evaluacion empleado. La degradacion puede ser mayor en tareas distintas de la modelacion de lenguaje.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; no se aporta ninguna evaluacion especifica de factualidad, veracidad o tasa de alucinacion.
- La evaluacion se limita a perplejidad sobre wikitext-2-raw con 20 fragmentos de 512 tokens. No hay datos de razonamiento, codigo, matematicas, seguimiento de instrucciones ni multilingue.
- Longitud de contexto no documentada: aunque la arquitectura incluye capas Mamba2 y de atencion, no se especifica la ventana efectiva ni si la cuantizacion afecta al comportamiento en contextos largos.
- Idiomas soportados no especificados; no hay garantia de calidad fuera del ingles.
- Licencia OpenMDW 1.1: es una licencia de pesos abiertos con condiciones propias. Debe revisarse el fichero `LICENSE` del repositorio antes de cualquier uso comercial, ya que no equivale a una licencia permisiva tipo Apache 2.0 o MIT.
- Compatibilidad restringida: el formato MLX limita el uso a hardware Apple Silicon. No hay versiones GGUF ni soporte declarado para servidores de inferencia como vLLM o TGI.
- Adopcion muy baja: 15 descargas y 1 like en el momento de la ficha, lo que implica poca validacion independiente por parte de la comunidad.
- Trazabilidad parcial del metodo: la asignacion de bits se describe como reconstruida de forma inversa a partir del `config.json` de un tercero, y la calibracion del release JANG se presume RTN sin confirmacion explicita.
- El autor menciona haber encontrado y corregido un error de nomenclatura en `switch_mlp.fc1`/`fc2`; conviene verificar la integridad del checkpoint en despliegues criticos.

## Enlaces

- HuggingFace: https://huggingface.co/roman220220/nemotron-30b-a3b-gptq-jang-component
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Lightning-30B-A3B
- Repositorio del pipeline de cuantizacion GPTQ del autor: https://github.com/rromenskyi/quant-ternary
- Documentacion de metodologia citada en la model card: `docs/session_findings_2026-09-11.md`, seccion 7q (dentro del repositorio anterior)
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo; los resultados obtenidos no guardan relacion con la ficha.
