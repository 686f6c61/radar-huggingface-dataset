# dealignai/Gemma-4-31B-JANG_4M-CRACK

## Resumen

Gemma 4 31B JANG_4M CRACK (v2) es una version abliterada y cuantizada del modelo multimodal `google/gemma-4-31b-it`, publicada por el usuario dealignai. El objetivo del autor es eliminar la direccion de rechazo (abliteration) para obtener un asistente sin censura, manteniendo la coherencia general y las capacidades de codigo y razonamiento del modelo original. La ficha declara una arquitectura transformer densa de 60 capas con atencion hibrida (sliding/global) y un codificador de vision conservado en float16, lo que lo convierte en un modelo image-text-to-text.

El modelo se distribuye exclusivamente en formato JANG v2, un perfil de cuantizacion nativo de MLX con una media de 5,1 bits por peso y un tamano de repositorio de 21 GB (45,4 GB de espacio total en el repositorio). Esta pensado para ejecutarse en Apple Silicon a traves de la aplicacion vMLX, ya que las herramientas estandar `mlx_lm` y `mlx_vlm` no daban soporte a Gemma 4 en el momento de la publicacion (v0.31.2 / v0.4.1). Su relevancia actual radica en que es una de las pocas alternativas abliteradas de la familia Gemma 4 disponibles en formato MLX, con soporte de modo thinking y vision.

Existe una discrepancia relevante en los metadatos: la model card declara 31.000 millones de parametros, mientras que los metadatos de los ficheros safetensors reportan 20.163.950.444 parametros. Esta diferencia debe verificarse antes de planificar el despliegue, ya que puede deberse al empaquetado de pesos cuantizados mas que a un recuento real de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, atencion hibrida sliding/global, multimodal (vision-lenguaje) |
| Parametros totales | 31.000 millones (declarado en la model card) / 20.163.950.444 (metadatos de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Perfil JANG_4M (JANG v2), media real de 5,1 bits; vision encoder en float16 |
| Idiomas soportados | no disponible |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | MLX-native safetensors (JANG v2) |

## Arquitectura y entrenamiento

Gemma 4 31B JANG_4M CRACK se basa en `google/gemma-4-31b-it`. La arquitectura es un transformer denso de 60 capas que combina atencion deslizante (sliding) y global, un diseno hibrido que el autor afirma haber tenido en cuenta de forma especifica al extraer los vectores de abliteracion. El componente multimodal de vision se ha preservado sin cuantizar en float16, por lo que el modelo puede procesar entradas de imagen y texto (pipeline `image-text-to-text`). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovacion tecnica principal es la abliteration CRACK v2: la extraccion de vectores de rechazo de mayor calidad respecto a la version inicial, lo que eleva la conformidad medida en HarmBench al 93,7% (281/300) y estabiliza el modo thinking evitando bucles degenerados. El modelo admite decoding con chain-of-thought (thinking mode) activable, y el autor recomienda temperaturas entre 0,3 y 0,7 con penalizacion de repeticion de 1,15-1,25 cuando este activado, evitando decodificacion greedy. No se proporciona informacion sobre el volumen o composicion de los datos empleados en el proceso de abliteration.

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational`).
- Razonamiento con modo thinking activable (chain-of-thought interno).
- Generacion de codigo, incluido codigo de seguridad ofensiva: el autor reporta 8/8 prompts de pentesting resueltos con codigo funcional (escaneo de puertos, reverse shells, keyloggers, plantillas de phishing, ARP spoofing, inyeccion SQL, guias de Metasploit).
- Capacidades matematicas y de conocimiento general medidas en MMLU-200 (71,5%).
- Vision multimodal: procesamiento de imagenes y texto combinados (image-text-to-text), con encoder en float16.
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible en la informacion proporcionada.
- Alta conformidad ante peticiones habitualmente rechazadas (93,7% en HarmBench), con excepcion de algunas categorias (p. ej. fabricacion de drogas) que pueden seguir rechazandose en modo thinking.

## Casos de uso

- Red teaming y evaluacion de alineacion: el modelo sirve para generar respuestas que un modelo alineado rechazaria, lo que permite calibrar clasificadores de seguridad y medir la robustez de filtros de contenido en condiciones controladas.
- Investigacion sobre abliteration: comparar los vectores de rechazo extraidos con los del modelo base `google/gemma-4-31b-it` ayuda a estudiar como se codifica el comportamiento de rechazo en la representacion interna de un transformer denso.
- Pentesting autorizado y auditoria de seguridad: dado que el modelo reporta 8/8 en prompts de seguridad con codigo funcional, puede emplearse como asistente en ejercicios de hacking etico con alcance contractual definido (escaneo de puertos, pruebas de inyeccion, validacion de exploits en entornos de laboratorio).
- Asistente de programacion local en Mac: con 21 GB de pesos y licencia Gemma, puede desplegarse en un equipo Apple Silicon de 32 GB o mas para tareas de generacion y revision de codigo sin conexion a servicios externos.
- Analisis de imagenes y documentos: el pipeline image-text-to-text permite extraer informacion de capturas, diagramas o documentos escaneados y combinarla con razonamiento textual en una misma conversacion.
- Generacion de contenido sin restricciones para investigacion en moderacion: util para producir ejemplos que alimenten datasets de entrenamiento de clasificadores de toxicidad o de deteccion de contenido danino.
- Evaluacion de estabilidad del modo thinking: el modelo permite estudiar bucles degenerados en decodificacion con chain-of-thought y validar estrategias de penalizacion de repeticion.

## Benchmarks y rendimiento

HarmBench (300 prompts, estratificado por categorias; datos autodeclarados por el autor):

| Categoria | Puntuacion |
|---|---|
| Cybercrime/intrusion | 51/51 (100%) |
| Contenido danino | 22/22 (100%) |
| Desinformacion | 50/50 (100%) |
| Actividades ilegales | 47/50 (94%) |
| Contextual | 72/78 (92%) |
| Quimico/biologico | 46/51 (90%) |
| Acoso/bullying | 22/25 (88%) |
| Copyright | 43/51 (84%) |
| Total | 281/300 (93,7%) |

MMLU-200 (10 asignaturas x 20 preguntas), comparacion entre el modelo base y CRACK v2:

| Asignatura | Base | CRACK v2 |
|---|---|---|
| Abstract Algebra | 9/20 | 7/20 |
| Anatomy | 13/20 | 12/20 |
| Astronomy | 17/20 | 15/20 |
| College CS | 13/20 | 12/20 |
| College Physics | 14/20 | 12/20 |
| HS Biology | 19/20 | 18/20 |
| HS Chemistry | 14/20 | 12/20 |
| HS Mathematics | 6/20 | 6/20 |
| Logical Fallacies | 17/20 | 16/20 |
| World Religions | 17/20 | 17/20 |
| Total | 76,5% (153/200) | 71,5% (143/200) |
| Delta | - | -5,0% |

El autor reporta tambien 8/8 en prompts de seguridad y pentesting, y afirma que todas las comprobaciones de coherencia (conocimiento factico, razonamiento, generacion de codigo y matematicas) se superan. No se han publicado resultados de MMLU completo, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 45,4 GB de repositorio; 21 GB de pesos del modelo.
- Memoria: se requiere un Mac con Apple Silicon y 32 GB o mas de memoria unificada.
- GPU: no aplica a GPU NVIDIA o AMD; el formato MLX-native esta orientado a Apple Silicon (serie M). No se dispone de datos de despliegue en A100, H100 o RTX 4090.
- Cabe en hardware de consumo: si, en Macs Apple Silicon con 32 GB de memoria unificada o superior.
- Opciones de despliegue: vMLX 1.3.26 o superior (recomendado, soporta vision, modo thinking y ajustes de inferencia). `mlx_lm` (v0.31.2) y `mlx_vlm` (v0.4.1) no soportaban Gemma 4 en el momento de la publicacion.
- No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI; tampoco se ofrecen ficheros GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-200 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 31B JANG_4M CRACK (v2) | 31B declarados (20,16B en safetensors) | no disponible | 71,5% | Gemma | MLX, via vMLX |
| `google/gemma-4-31b-it` (base) | 31B | no disponible | 76,5% | Gemma | no disponible en la informacion proporcionada |
| Otros modelos abliterados de 30-35B | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion cuantitativa disponible es frente al modelo base del que deriva, con una perdida de 5,0 puntos en MMLU-200 a cambio de un aumento de conformidad en HarmBench. No se dispone de datos de rendimiento frente a otras alternativas abliteradas de tamano similar.

## Limitaciones y advertencias

- Modelo abliterado: su comportamiento esta disenado explicitamente para eludir rechazos de seguridad, lo que lo hace inadecuado para despliegues orientados al publico general sin capas adicionales de moderacion.
- Riesgo de contenido danino: el autor reporta generacion de codigo funcional de tipo ofensivo (reverse shells, keyloggers, plantillas de phishing, exploits), lo que supone un riesgo legal directo si se usa fuera de un contexto de investigacion o pentesting autorizado.
- Riesgo de alucinacion: no se han publicado metricas especificas de factualidad; las comprobaciones de coherencia se describen de forma cualitativa.
- Degradacion cognitiva: la abliteration reduce el rendimiento en MMLU-200 en 5,0 puntos respecto al base, con caidas notables en Abstract Algebra (9/20 a 7/20) y Astronomy (17/20 a 15/20).
- Inestabilidad en modo thinking: el autor advierte de bucles de planificacion si se usa temperatura 0 o greedy decoding con thinking activado; requiere penalizacion de repeticion de 1,15-1,25.
- Rechazos residuales: algunas categorias (fabricacion de drogas) pueden seguir rechazandose en modo thinking.
- Idioma y contexto: la longitud de contexto y los idiomas soportados no se especifican en la informacion disponible, lo que impide garantizar un comportamiento correcto fuera del ingles.
- Restricciones de licencia: se distribuye bajo la licencia Gemma (Gemma Terms of Use), que impone obligaciones adicionales de uso aceptable y de atribucion; no es una licencia permisiva tipo Apache 2.0 o MIT.
- Compatibilidad limitada: al ser un formato MLX-native, no es directamente utilizable en ecosistemas CUDA. `mlx_lm` y `mlx_vlm` estandar no lo soportaban en el momento de la publicacion.
- Discrepancia de parametros: los metadatos de safetensors (20.163.950.444) no coinciden con la cifra declarada de 31B, lo que conviene verificar antes de dimensionar el hardware.
- El propio autor indica que el modelo se proporciona con fines de investigacion y que el usuario es responsable del cumplimiento legal de su uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/Gemma-4-31B-JANG_4M-CRACK
- Modelo base referenciado: https://huggingface.co/google/gemma-4-31b-it
- Aplicacion vMLX: https://vmlx.net
- Web del autor: https://dealign.ai
- Investigacion citada (Safety Generalization in Frontier MoE Models): https://dealign.ai/quantsteer.html
- Perfil en X: https://x.com/dealignai
- Apoyo al autor (Ko-fi): https://ko-fi.com/dealignai
