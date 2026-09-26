# psytechlab/Qwen3-4B-Instruct-2507-lora-depressive_style

## Resumen

DeproLLM es un adaptador LoRA entrenado sobre Qwen/Qwen3-4B-Instruct-2507 cuyo objetivo no es responder a preguntas sobre salud mental, sino reproducir los marcadores estilometricos asociados a la depresion en textos de tipo ensayo. Lo desarrolla psytechlab y se distribuye en HuggingFace bajo licencia MIT, con etiqueta de idioma ruso (ru) y un tamano de repositorio de 0,1 GB, coherente con un adaptador de bajo rango y no con un modelo completo.

La motivacion declarada es metodologica: la investigacion en la interseccion entre aprendizaje automatico y psicologia clinica sufre una escasez estructural de datos etiquetados. El autor cita un corpus previo de clasificacion de depresion con solo 316 ensayos, de los cuales 93 pertenecian a la clase objetivo, insuficiente para entrenar y evaluar modelos flexibles. La propuesta es generar datos sinteticos con estilo depresivo que permitan aumentar datos escasos y restringidos por privacidad en investigacion downstream de deteccion.

Tecnicamente se trata de un ajuste fino con GRPO (Group Relative Policy Optimization) sobre un adaptador LoRA, usando como juez un clasificador de la toolkit TITANIS basado en 73 caracteristicas psicolinguisticas, StandardScaler, PCA y un SVC con salida continua. El modelo esta explicitamente marcado como artefacto de investigacion y no debe emplearse para diagnostico, cribado ni decisiones sobre personas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA; no se publica el rango, alpha ni los modulos objetivo del adaptador |
| Parametros totales | 4.000 millones en el modelo base (Qwen3-4B-Instruct-2507) mas el adaptador LoRA; el numero de parametros entrenables del adaptador no esta disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada para el adaptador; heredada del modelo base Qwen3-4B-Instruct-2507, con contexto nativo de 262.144 tokens segun las especificaciones publicas de Qwen |
| Tipos de cuantizacion | No documentados por el autor. El adaptador se distribuye en safetensors; puede fusionarse con el modelo base y cuantizarse en los formatos habituales de la familia Qwen3 (GGUF, AWQ, GPTQ, bitsandbytes) |
| Idiomas soportados | Ruso (ru), unico idioma declarado en la model card; no se documenta el alcance multilingue real |
| Licencia | MIT |
| Formato de pesos | Safetensors (adaptador LoRA; requiere el modelo base Qwen/Qwen3-4B-Instruct-2507 para su uso) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Metodo de entrenamiento | LoRA + GRPO con recompensa derivada de un clasificador externo |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | text-generation |
| Fecha de publicacion | 26 de septiembre de 2026 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parametros. El repositorio contiene unicamente los pesos del adaptador (0,1 GB), por lo que su uso exige cargar el modelo base y aplicar el adaptador, o bien fusionar ambos antes de servir el modelo. No se detallan en la informacion disponible el rango del LoRA, los modulos a los que se aplica, el numero de pasos de entrenamiento ni el volumen total de tokens utilizados.

El entrenamiento emplea GRPO, un metodo de optimizacion por politicas de grupo que no requiere un modelo de recompensa entrenado aparte, sino una funcion de recompensa. En este caso la recompensa proviene de un clasificador de depresion de la toolkit TITANIS: se extraen 73 caracteristicas psicolinguisticas, se escalan con StandardScaler, se reducen dimensionalmente con PCA y se clasifican con un SVC que devuelve una puntuacion continua, lo que permite usarlo como juez dentro del bucle de GRPO. Para evitar el reward hacking se anadieron componentes de recompensa basados en la longitud del texto, penalizaciones por repeticion y una penalizacion especifica por vocabulario depresivo explicito, de modo que el modelo aprenda marcadores estilisticos y no atajos lexicos.

## Capacidades

- Generacion de texto en formato ensayo con marcadores estilisticos asociados a la depresion, que es el objetivo explicito del entrenamiento.
- Aumento de datos sinteticos: produce textos etiquetables para ampliar corpus escasos de investigacion en deteccion de depresion.
- Modelado estilometrico, no tematico: el diseno de la recompensa penaliza el uso de lexico depresivo obvio, lo que empuja al modelo hacia patrones de estilo mas que hacia contenido explicito.
- Generacion en ruso, unico idioma declarado.
- Capacidades generales de instruccion y conversacion heredadas del modelo base Qwen3-4B-Instruct-2507, aunque no validadas ni evaluadas por el autor en este adaptador.
- Soporte de tool calling o function calling: no documentado especificamente para el adaptador (el modelo base lo soporta, pero el ajuste GRPO puede degradar comportamientos no evaluados).
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades de vision o audio: no disponibles.
- Modo de pensamiento explicito (thinking mode): no documentado para este adaptador.

## Casos de uso

- Aumento de datos sinteticos para deteccion de depresion: el caso de uso principal declarado. Se generan ensayos con estilo depresivo para ampliar corpus pequenos y con restricciones de privacidad, de forma que un clasificador downstream pueda entrenarse con mas ejemplos de la clase positiva.
- Construccion de conjuntos de control balanceados: junto a textos neutros del mismo genero, los ensayos generados permiten construir pares estilo-depresivo / estilo-neutro para experimentos controlados de clasificacion.
- Validacion y stress-testing de clasificadores psicometricos: alimentar un detector de depresion con textos sinteticos permite medir falsos positivos, sensibilidad a la longitud y dependencia de marcadores superficiales.
- Estudio de estilometria y psicolinguistica computacional: el modelo aisla marcadores de estilo respecto al contenido, lo que facilita analisis de que caracteristicas concretas mueven la decision de un clasificador.
- Investigacion metodologica sobre GRPO con jueces clasificadores: el pipeline descrito (recompensa continua + penalizaciones anti-hacking) es replicable en otros dominios donde solo existe un clasificador en lugar de un modelo de recompensa.
- Red-teaming y analisis de robustez en salud mental: generar contenido sintetico de estilo depresivo de forma controlada para evaluar como responden otros modelos o sistemas de moderacion, siempre en entorno de laboratorio y con aprobacion etica.
- Analisis de sesgos de generacion: comparar las salidas del adaptador con las del modelo base bajo distintas estrategias de prompting, para estudiar como el ajuste desplaza la distribucion del texto.
- Docencia y humanidades digitales: disponer de un generador reproducible de un genero textual concreto (ensayo) para practicas de analisis estilistico, con las advertencias eticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay cifras de MMLU, HumanEval, GSM8K ni de tareas equivalentes.

La evaluacion descrita por el autor usa como metrica objetivo la puntuacion del clasificador TITANIS y compara DeproLLM con el modelo base bajo varias estrategias de prompting y con el prompting de un modelo mayor disponible. Sin embargo, no se proporcionan los valores numericos de esas comparaciones, por lo que no es posible reproducir ni cuantificar la mejora. El propio autor senala que usar la puntuacion de un unico clasificador como metrica es una limitacion conocida del trabajo.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano del modelo base (4.000 millones de parametros) y del tamano del adaptador (0,1 GB); el autor no publica requisitos de hardware.

- Adaptador LoRA: 0,1 GB en disco, sin requisitos propios relevantes.
- Pesos del modelo base fusionado en FP16/BF16: aproximadamente 8 GB de VRAM solo para pesos; con cache KV y ventanas de contexto largas conviene prever 12-16 GB.
- Cuantizacion de 8 bits: aproximadamente 5 GB de pesos.
- Cuantizacion de 4 bits (GGUF Q4_K_M, AWQ o GPTQ): aproximadamente 2,5-3,5 GB de pesos.
- GPU consumer: cabe en tarjetas de 8-12 GB con cuantizacion de 4 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080/4090 con margen amplio) y en Apple Silicon con 16 GB o mas de memoria unificada.
- GPU de datacenter: A100, H100 o L40S permiten servir el modelo en BF16 con contexto largo y alto paralelismo.
- Opciones de despliegue: transformers + PEFT (aplicando el adaptador directamente), vLLM o TGI (fusionando antes el adaptador), llama.cpp y Ollama (requieren convertir a GGUF) y endpoints gestionados que acepten adaptadores LoRA.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo, TTFT ni consumo energetico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeproLLM (este adaptador) | 4.000 millones (base) + LoRA | Heredado del base (262.144 tokens nativos) | Generacion de ensayos con estilo depresivo para investigacion; GRPO con juez clasificador | MIT | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4.000 millones | 262.144 tokens nativos | Modelo instructivo de proposito general | No indicada en la informacion proporcionada | HuggingFace |
| Modelo mayor comparado en la evaluacion (sin identificar) | No disponible | No disponible | Referencia de prompting en la evaluacion del autor | No disponible | No disponible |
| Otros adaptadores de estilo o de dominio psicologico | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion estricta con alternativas de la misma categoria no puede completarse porque la informacion disponible no identifica modelos equivalentes de generacion de estilo depresivo ni publica cifras que permitan contrastar rendimiento.

## Limitaciones y advertencias

- Uso clinico prohibido por el autor: el modelo no debe emplearse para diagnostico, decision medica ni cribado de personas reales. Es un artefacto de investigacion.
- Salidas sinteticas: los textos generados son artificiales y no representan el estado mental de ninguna persona real; no deben interpretarse como tales.
- Alcance de genero limitado: el entrenamiento se centro en el formato ensayo, que es el dominio del clasificador empleado. Otros dominios (por ejemplo, publicaciones en redes sociales) quedan fuera del alcance declarado.
- Dependencia de la metrica: la evaluacion depende de un unico clasificador TITANIS y el modelo puede reproducir los sesgos de ese clasificador, tanto en la recompensa como en la medicion final.
- Riesgo residual de reward hacking: aunque se anadieron penalizaciones por longitud, repeticion y vocabulario explicito, no se publican analisis cuantitativos del grado de mitigacion ni curvas de entrenamiento.
- Idiomas: solo se declara ruso. La model card esta en ingles y no se documenta el comportamiento en otros idiomas, pese a que el modelo base es multilingue.
- Riesgo de alucinacion y de contenido sensible: no hay evaluaciones de seguridad publicadas para un adaptador especializado en contenido de salud mental.
- Capacidades generales no evaluadas: el ajuste con GRPO puede haber degradado el seguimiento de instrucciones, el tool calling o el razonamiento del modelo base, y no se aportan pruebas al respecto.
- Licencia MIT: permite uso comercial desde el punto de vista juridico del adaptador, pero el autor restringe explicitamente el uso a investigacion etica. Debe verificarse tambien la licencia del modelo base Qwen3-4B antes de cualquier despliegue.
- Validacion externa nula: 0 descargas y 0 likes en el momento de la consulta, sin replicacion independiente ni revision por pares.
- Transparencia del propio artefacto: la model card fue generada por un LLM a partir de una entrada de blog y revisada por una persona, segun se indica en el propio documento.
- Necesidad de revision etica: cualquier uso en investigacion sobre salud mental requiere aprobacion de un comite de etica y manejo cuidadoso de las salidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/psytechlab/Qwen3-4B-Instruct-2507-lora-depressive_style
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Entrada de blog con la descripcion detallada: https://psytechlab.co/2026/09/26/deprollm.html
- Busqueda web realizada: los unicos resultados devueltos fueron enlaces a TikTok (https://www.tiktok.com/, https://www.tiktok.com/fr/, https://livecenter.tiktok.com/?lang=fr, https://www.youtube.com/tiktok, https://play.google.com/store/apps/details?id=com.zhiliaoapp.musically), sin relacion alguna con el modelo. No se han encontrado papers, repositorios ni demos adicionales.
