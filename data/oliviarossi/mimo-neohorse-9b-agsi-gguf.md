# OliviaRossi/MiMo-NeoHorse-9B-AGSI-GGUF

## Resumen

MiMo-NeoHorse-9B-AGSI es un modelo de lenguaje de 8.953.803.264 parametros (aproximadamente 8,95 mil millones) publicado por el usuario OliviaRossi en Hugging Face. No es un modelo entrenado desde cero, sino el resultado de una fusion de pesos entre dos modelos base: XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, orientado a razonamiento y tareas de ingenieria de software (SWE), y TokenRhythm/NeoHorse-1-9B, derivado de DeepReinforce Ornith-1.5 y especializado en uso autonomo de terminal y agentes de codigo. El resultado se distribuye unicamente en formato GGUF, pensado para inferencia local y despliegue en entornos con recursos limitados.

La relevancia de esta ficha es doble. Por un lado, el modelo se presenta como un candidato para flujos agenticos de terminal y generacion de codigo en maquinas de gama alta de consumo, gracias a su tamano contenido y a la cuantizacion GGUF. Por otro, la tecnica de fusion empleada, denominada Adaptive Geodesic Spectral Interpolation (AGSI), se describe como una interpolacion espectral geodesica adaptativa con SLERP por filas sobre la variedad de pesos, proteccion anti-fase frente a conflictos y preservacion de la energia espectral, lo que la convierte en un caso de estudio interesante para quienes investigan tecnicas de merging sin reentrenamiento.

El repositorio tiene un tamano de 6,5 GB y fue creado el 29 de septiembre de 2026, con una actualizacion ese mismo dia. En el momento de la consulta acumula 0 descargas y 0 likes, por lo que no existe validacion de la comunidad ni resultados de evaluacion publicados. La licencia declarada es MIT y los idiomas soportados segun la model card son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen3.5 (etiqueta qwen3_5); sin mezcla de expertos |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95 B) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF; los niveles concretos incluidos en el repositorio no se detallan en la informacion disponible |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (el repositorio no incluye safetensors) |

## Arquitectura y entrenamiento

El modelo es una fusion en el espacio de pesos, no un entrenamiento nuevo. Parte de dos modelos base de arquitectura transformer decoder-only de aproximadamente 9 B de parametros, ambos de la familia Qwen (la etiqueta qwen3_5 apunta a una generacion Qwen3.5). El primero, MiMo-V2.6-Distill-Qwen-9B de Xiaomi MiMo, aporta destilacion orientada a razonamiento avanzado y tareas de ingenieria de software. El segundo, NeoHorse-1-9B de TokenRhythm (derivado de DeepReinforce Ornith-1.5), aporta comportamiento agentico autonomo de terminal y codigo. No se especifica si el modelo final conserva las cabeceras de atencion, el tokenizador ni la configuracion de RoPE de uno de los dos progenitores, dato relevante porque determina el contexto maximo real y la compatibilidad con plantillas de chat.

La innovacion tecnica declarada es el metodo de fusion: Adaptive Geodesic Spectral Interpolation (AGSI), descrito como una interpolacion espectral geodesica adaptativa que combina interpolacion esferica lineal (SLERP) por filas sobre la variedad de pesos, un mecanismo de proteccion anti-fase para mitigar conflictos entre tensores de signo opuesto y una restriccion de invariancia de la energia espectral. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste instructivo posteriores a la fusion; tampoco se documenta decodificacion especulativa ni atencion lineal. La informacion disponible no permite verificar experimentalmente que AGSI supere a metodos de merging mas establecidos como SLERP, TIES o DARE.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con pipeline declarado de text-generation.
- Razonamiento multi-paso: heredado de la destilacion de MiMo-V2.6, orientada a problemas de razonamiento y SWE.
- Generacion y edicion de codigo: etiquetado explicitamente como coding.
- Uso de terminal (terminal-use): el modelo esta etiquetado para interaccion con shell y ejecucion de comandos en entornos agenticos.
- Comportamiento agentico: etiquetado como agentic, lo que sugiere planificacion de tareas y ejecucion de acciones encadenadas.
- Soporte de tool calling / function calling: no confirmado de forma explicita en la informacion disponible, aunque las etiquetas agentic y terminal-use lo hacen plausible.
- Capacidades multilingues limitadas a ingles y chino; no se declara soporte de castellano ni de otros idiomas.
- Modo thinking explicito, vision o audio: no disponible en la informacion proporcionada.
- Compatibilidad con endpoints de inferencia: la etiqueta endpoints_compatible indica que puede servirse mediante infraestructura estandar de texto generativo.

## Casos de uso

- Automatizacion de tareas de terminal y administracion de sistemas: el modelo puede recibir el estado de un shell, proponer comandos y encadenar acciones correctivas en un bucle agentico, aprovechando su entrenamiento especifico en terminal-use y su tamano reducido para ejecutarse en la misma maquina que administra.
- Agente de resolucion de incidencias en repositorios de codigo: dado un fallo de test o un stack trace, el modelo puede localizar el archivo afectado, proponer un parche y validarlo, un flujo tipico de SWE-bench que encaja con la destilacion de razonamiento de su modelo base.
- Asistente de generacion de codigo en pipelines de CI/CD: integrado como paso de revision o de generacion de parches, con la ventaja de que al ser GGUF puede desplegarse en runners con GPU modesta o incluso en CPU, evitando enviar codigo propietario a APIs externas.
- Copiloto de programacion local y privado: al ejecutarse con llama.cpp u Ollama sobre una unica GPU de consumo, permite asistencia de codigo sin conexion, algo critico en entornos con requisitos de confidencialidad o air-gapped.
- Chat tecnico bilingue ingles-chino: util para equipos distribuidos entre ambos mercados que necesitan explicaciones de codigo o documentacion tecnica en los dos idiomas soportados.
- Investigacion sobre tecnicas de fusion de modelos: el modelo sirve como artefacto reproducible para estudiar si AGSI preserva el rendimiento de sus progenitores, comparandolo con fusiones SLERP o TIES de los mismos modelos base.
- Prototipado rapido de agentes en estaciones de trabajo: con cuantizaciones de 4 a 6 bits, el modelo cabe en GPUs de 8 a 12 GB, lo que permite iterar sobre prompts y herramientas sin coste de API.
- Evaluacion comparativa de destilaciones de razonamiento: permite analizar como se comporta una mezcla de una destilacion de razonamiento (MiMo) con un agente de terminal (NeoHorse) en tareas que requieren ambas habilidades a la vez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, SWE-bench ni de ninguna otra evaluacion, ni comparaciones con los modelos base. Tampoco se documentan mediciones de latencia o throughput. Cualquier cifra de rendimiento atribuida a este modelo seria una suposicion no verificada.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16): en torno a 18 GB para los pesos, mas la cache KV, por lo que requiere una GPU de 24 GB o superior.
- Cuantizacion Q8_0: aproximadamente 9,5-10 GB de pesos, viable en GPUs de 12-16 GB.
- Cuantizacion Q6_K: en torno a 7,5-8 GB de pesos, comodo en GPUs de 12 GB.
- Cuantizacion Q5_K_M: aproximadamente 6,5-7 GB de pesos, viable en GPUs de 8-10 GB.
- Cuantizacion Q4_K_M: en torno a 5,5-6 GB de pesos, cabe en GPUs de 8 GB y en equipos con memoria unificada.
- GPUs recomendadas: H100, A100 o L40S para precision completa y lotes grandes; RTX 4090, RTX 3090, RTX 4080 o RTX A6000 para cuantizaciones altas; RTX 4060 Ti 16 GB, RTX 3060 12 GB o portatiles con 16 GB de memoria unificada para cuantizaciones de 4 a 6 bits.
- Cabe en GPU de consumo: si, en cuantizaciones Q4 a Q6 sobre tarjetas de 8 a 16 GB; en FP16 solo en tarjetas de 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y llama-cpp-python son las rutas naturales para GGUF. vLLM y TGI tienen soporte de GGUF limitado o inexistente; la etiqueta endpoints_compatible sugiere compatibilidad con endpoints de inferencia estandar, pero no se detalla el runtime concreto.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependeran del backend, del nivel de cuantizacion, de la longitud de contexto y del hardware.
- Nota practica: al no declararse la longitud de contexto soportada, conviene validar empíricamente el limite real antes de dimensionar la cache KV, que puede superar el tamano de los pesos en conversaciones muy largas.

## Comparativa con modelos similares

No existen resultados de rendimiento publicados para este modelo, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Las cifras de los modelos de referencia proceden de sus fichas publicas y se incluyen unicamente como contexto de categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| MiMo-NeoHorse-9B-AGSI-GGUF | 8,95 B | No disponible | MIT | GGUF en Hugging Face, 0 descargas | No publicado |
| Qwen3-8B | 8,2 B | 32.768 tokens nativos, ampliable con YaRN | Apache-2.0 | Pesos abiertos en safetensors y GGUF | Ampliamente evaluado |
| Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Pesos abiertos | Ampliamente evaluado |
| Gemma-2-9B-it | 9,24 B | 8.192 tokens | Gemma Terms of Use | Pesos abiertos | Ampliamente evaluado |
| NeoHorse-1-9B (progenitor) | Aproximadamente 9 B | No disponible | No disponible | Hugging Face | No disponible |
| MiMo-V2.6-Distill-Qwen-9B (progenitor) | Aproximadamente 9 B | No disponible | No disponible | Hugging Face | No disponible |

La ventaja diferencial de este modelo frente a las alternativas es su combinacion declarada de razonamiento destilado y uso de terminal en un unico artefacto de menos de 9 B, distribuido en GGUF y con licencia MIT. La desventaja es la ausencia total de evaluaciones que confirmen que la fusion no ha degradado a ninguno de los dos progenitores, un riesgo habitual en los merges de pesos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publica de que el merge conserve las capacidades de razonamiento, codigo o uso de terminal de sus modelos base. Un merge puede degradar sistematicamente ambos conjuntos de habilidades.
- Riesgo de alucinacion: como cualquier modelo de 9 B sin evaluacion publicada, puede generar codigo, comandos o referencias inexistentes con alta confianza, especialmente en tareas de terminal donde el error tiene consecuencias reales.
- Ejecucion de comandos en terminal: usar el modelo como agente autonomo con permisos de shell implica riesgo de operaciones destructivas. Se recomienda sandboxing, listas blancas de comandos y confirmacion humana en acciones irreversibles.
- Idiomas: solo se declaran ingles y chino. El castellano no esta soportado oficialmente y su rendimiento en espanol es desconocido.
- Contexto desconocido: al no declararse la longitud de contexto, puede producirse truncamiento silencioso o degradacion en conversaciones largas si se asume un valor superior al real.
- Sesgos: no hay informacion sobre la composicion del dataset de los modelos base ni sobre procesos de alineacion, por lo que los sesgos sociales, culturales y de dominio son desconocidos y no mitigados de forma documentada.
- Licencia y herencia: el repositorio declara MIT, pero los modelos base (MiMo, NeoHorse y la familia Qwen subyacente) pueden estar sujetos a sus propias condiciones. Antes de un uso comercial conviene verificar la licencia efectiva de cada progenitor y si impone restricciones adicionales.
- Falta de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta implican que no existe verificacion independiente de la calidad, la tokenizacion ni la plantilla de chat.
- Trazabilidad de la fusion: no se documentan hiperparametros, semillas ni capas tratadas de forma diferencial en AGSI, lo que dificulta reproducir el merge.
- Recomendacion para produccion: tratar el modelo como experimental, validarlo en un conjunto propio de tareas antes de desplegarlo y no utilizarlo como unico punto de decision en flujos criticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OliviaRossi/MiMo-NeoHorse-9B-AGSI-GGUF
- Modelo base XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Modelo base TokenRhythm/NeoHorse-1-9B: https://huggingface.co/TokenRhythm/NeoHorse-1-9B
