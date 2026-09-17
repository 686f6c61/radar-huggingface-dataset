# CH3NDev/dual-loop-qwen3.5-2b

## Resumen

Dual-Loop Cognitive Controller es un adaptador PEFT publicado por el usuario CH3NDev sobre el modelo base Qwen/Qwen3.5-2B. Su objetivo es introducir deliberacion de tipo System 2 de forma recurrente y no autorregresiva directamente en el flujo residual latente del modelo, de modo que este "piense antes de responder" sin generar tokens de cadena de pensamiento. La espina dorsal (1,88 B de parametros) permanece congelada y solo se entrena el adaptador.

El interes tecnico del trabajo esta en la resolucion arquitectonica: Qwen3.5-2B no es un transformer de atencion completa, sino un hibrido con 18 capas de atencion lineal (Qwen3_5GatedDeltaNet, tipo SSM con regla delta) y 6 capas de atencion completa (Qwen3_5Attention, en las capas 3, 7, 11, 15, 19 y 23). Interceptar el estado oculto dentro de una capa recurrente desestabiliza el estado interno, por lo que el gancho se reubica en la capa 11 (atencion completa) y la salida se escala con una compuerta residual ReZero aprendible.

Es relevante como experimento de investigacion reproducible: el autor publica una suite de evaluacion empirica con resultados mixtos, incluidos casos de degradacion activa, y documenta el efecto critico del punto de anclaje del gancho (final de la pregunta frente al ultimo token de la continuacion). El repositorio no tiene descargas ni likes y la model card esta incompleta en varios apartados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT con ReZero learnable residual gating sobre Qwen3.5-2B; base hibrida de atencion lineal SSM (Gated DeltaNet) y atencion completa |
| Parametros totales | Espina dorsal congelada de 1,88 B; numero de parametros del adaptador no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT, libreria transformers) |
| Modelo base | Qwen/Qwen3.5-2B |
| Capas de la base | 24 en total: 18 lineales (Qwen3_5GatedDeltaNet) y 6 de atencion completa en las capas 3, 7, 11, 15, 19 y 23 |
| Punto de intercepcion | Capa 11 (full_attention) |
| Tamano del repositorio | 2,6 GB |
| Fecha de creacion / actualizacion | 2026-09-16 / 2026-09-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador implementa un controlador de doble bucle que opera sobre el flujo residual latente. En lugar de generar tokens de razonamiento, inyecta un vector de "pensamiento" recurrente en el estado oculto y lo reinyecta de forma iterativa (en los experimentos, k = 2 iteraciones de bucle). La salida se modula mediante una compuerta ReZero: el residuo se escala por tanh(alpha) * W_proj(h_thought), con alpha inicializado en 0,05 y aprendido hasta 0,0514, lo que evita explosion de gradiente y disrupcion numerica en la dinamica recurrente.

La decision de diseno clave es la reubicacion del gancho a la capa 11 (atencion completa). El autor documenta que interceptar estados ocultos dentro de capas de atencion lineal recurrente (por ejemplo, la capa 12) desestabiliza los estados de chunk recurrentes internos. Al anclar en una capa de atencion completa se preserva esa dinamica. El ajuste fino se realizo con la espina dorsal de 1,88 B congelada sobre datos de razonamiento cientifico de allenai/ai2_arc. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset, ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Deliberacion latente no autorregresiva: el modelo puede "pensar" sobre el contexto de la pregunta sin emitir tokens de cadena de pensamiento, lo que en principio reduce el coste de inferencia en tokens generados.
- Razonamiento cientifico de opcion multiple: mejora documentada en AI2 ARC-Challenge (+5,0 % en exactitud bruta y normalizada) y en AI2 ARC-Easy (+7,5 % en exactitud normalizada) cuando el gancho se ancla al final de la pregunta.
- Razonamiento de sentido comun fisico: en PIQA el autor reporta +5,0 % en exactitud bruta, con perdida de -5,0 % en exactitud normalizada.
- Comportamiento dual System 1 / System 2: la model card describe una resolucion de comportamiento orientada a eliminar el "overthinking" en tareas de sentido comun.
- Capacidades heredadas del modelo base Qwen3.5-2B: generacion de texto, comprension multilingue del base y demas habilidades del modelo original, no detalladas en la model card del adaptador.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso explicito: no documentado en la informacion disponible.
- Capacidades de vision o audio: no documentado en la informacion disponible.
- Thinking mode explicito mediante tokens: no aplica por diseno; el mecanismo es latente, no basado en tokens.

## Casos de uso

- Evaluacion de razonamiento cientifico en pipelines de benchmark: el adaptador se integra en arneses tipo lm-eval sobre tareas de opcion multiple (ARC, OpenBookQA, PIQA) y permite medir el efecto de la deliberacion latente frente a la linea base. Es adecuado porque el autor publica los logs de evaluacion y el mapeo exacto entre muestras y resultados.
- Investigacion sobre alternativas a la cadena de pensamiento: sirve para estudiar si la deliberacion en el espacio latente puede sustituir parcialmente a los tokens de CoT, con el incentivo de reducir el coste por consulta y la latencia de generacion.
- Ablacion de tecnicas de adaptadores residuales: el repositorio documenta el fallo al interceptar capas de atencion lineal y la solucion con ReZero mas reubicacion de gancho, lo que lo convierte en un caso de estudio util para quien disene adaptadores sobre arquitecturas hibridas SSM/atencion.
- Prototipado en hardware de consumo: al tratarse de una base de 2 B con adaptador, permite experimentar con deliberacion latente en una unica GPU de gama media, sin infraestructura de servidor.
- Clasificacion de preguntas cientificas para filtrado o curacion de datos: el modelo puede puntuar opciones en conjuntos de preguntas de ciencias a nivel escolar o universitario basico, util para anotacion asistida y control de calidad de datasets educativos.
- Tutoria cientifica con verificacion de respuesta: en un sistema educativo que presente preguntas de opcion multiple, el adaptador mejora la seleccion de la respuesta correcta en dominios como fisica elemental y ciencias naturales, aunque requiere anclar la deliberacion al final del enunciado.
- Base para ajuste fino adicional en dominios propios: al ser un adaptador PEFT con licencia MIT sobre un backbone congelado, se puede partir de el para especializar el bucle de deliberacion en otros dominios, reentrenando solo el adaptador.
- Estudio de estabilidad de estados recurrentes en modelos hibridos: el material describe como la intercepcion en capas GatedDeltaNet desestabiliza los estados de chunk, un fenomeno relevante para quienes depuran modelos SSM en produccion.

## Benchmarks y rendimiento

Tabla 1. Evaluacion estandar lm-eval sin anclaje (query_idx = -1, gancho de continuacion), 40 muestras por tarea:

| Benchmark | Dominio | Base acc | Loop acc | Delta raw | Base acc_norm | Loop acc_norm | Delta norm | Observacion |
|---|---|---|---|---|---|---|---|---|
| AI2 ARC-Challenge | Razonamiento dificil | 50,0 % | 47,5 % | -2,5 % | 47,5 % | 45,0 % | -2,5 % | Degradacion activa por perturbacion de continuacion |
| AI2 ARC-Easy | Ciencias elementales | 72,5 % | 67,5 % | -5,0 % | 67,5 % | 77,5 % | +10,0 % | La ganancia se preserva en exactitud normalizada |
| OpenBookQA | Hechos multi-salto | 15,0 % | 12,5 % | -2,5 % | 27,5 % | 32,5 % | +5,0 % | Cerca del azar (~25 %) |
| PIQA | Sentido comun fisico | 67,5 % | 67,5 % | 0,0 % | 75,0 % | 75,0 % | 0,0 % | Exactamente invariante |
| Media macro | Suite | 51,25 % | 48,75 % | -2,50 % | 54,38 % | 57,50 % | +3,12 % | Cae acc, sube acc_norm |

Tabla 2. Evaluacion con anclaje en el limite de la pregunta (query_idx = prompt_len - 1, gancho de pregunta), 160 muestras:

| Benchmark | Dominio | Muestras | Base acc | Loop acc | Delta raw | Base acc_norm | Loop acc_norm | Delta norm | Dinamica |
|---|---|---|---|---|---|---|---|---|---|
| AI2 ARC-Easy | Ciencias elementales | 40 | 72,5 % | 70,0 % | -2,5 % | 70,0 % | 77,5 % | +7,5 % | 4 preguntas rescatadas |
| AI2 ARC-Challenge | Razonamiento cientifico dificil | 40 | 50,0 % | 55,0 % | +5,0 % | 52,5 % | 57,5 % | +5,0 % | 4 preguntas rescatadas |
| OpenBookQA | Hechos multi-salto | 40 | 5,0 % | 5,0 % | 0,0 % | 25,0 % | 22,5 % | -2,5 % | 1 rescatada, 2 degradadas |
| PIQA | Sentido comun fisico | 40 | 70,0 % | 75,0 % | +5,0 % | 67,5 % | 62,5 % | -5,0 % | Sube raw, baja norm |
| Media global de la suite | Multi-dominio | 160 | 49,38 % | 51,25 % | +1,88 % | 53,75 % | 55,00 % | +1,25 % | Ganancia neta en ambas metricas |

Conclusiones declaradas por el autor: sin anclaje, la atencion autorregresiva puntua los tokens de respuesta antes de que ocurra la deliberacion e inyecta ruido no calibrado en el ultimo token (de ahi el -2,5 % en ARC-Challenge). Con el gancho anclado en el limite de la pregunta, el controlador delibera sobre todo el contexto antes de evaluar los candidatos y las capas 12 a 23 atienden causalmente a la representacion latente deliberada, lo que produce una ganancia neta de +1,88 % en exactitud bruta y +1,25 % en normalizada sobre las 160 muestras.

## Requisitos de hardware

- VRAM estimada: no confirmada por el autor. Como referencia de ingenieria para una base de 1,88 B en precision de 16 bits, la inferencia requiere del orden de 4 a 5 GB de VRAM, y en cuantizacion de 4 bits del orden de 1,5 a 2 GB. Estas cifras son estimaciones a partir del tamano y no aparecen en la informacion proporcionada.
- GPU recomendadas: no disponibles en la informacion. Por tamano, el modelo es viable en GPUs de consumo con 8 GB o mas de VRAM.
- Viabilidad en GPU de consumo: si, previsiblemente en tarjetas tipo RTX 3060, RTX 4060, RTX 4070 o RTX 4090, dado el tamano de 2 B. No confirmado por el autor.
- Opciones de despliegue: transformers con PEFT es el unico camino documentado. El adaptador se distribuye en safetensors. No se documenta compatibilidad con vLLM, TGI, llama.cpp, Ollama ni otros motores.
- Advertencia de despliegue: el mecanismo depende de un gancho en la capa 11 con compuerta ReZero y de un punto de anclaje concreto en la secuencia. Cargar el adaptador en un motor de inferencia estandar puede no reproducir el comportamiento descrito, ya que la orquestacion del bucle de deliberacion no forma parte de una interfaz estandar de PEFT.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con otros modelos o adaptadores de la misma categoria. La unica comparacion documentada es la del adaptador frente a su propia linea base sin adaptador:

| Modelo | Parametros | Contexto | ARC-Challenge (acc) | ARC-Easy (acc_norm) | PIQA (acc) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| dual-loop-qwen3.5-2b (con adaptador, gancho anclado) | 1,88 B congelados + adaptador no cuantificado | no disponible | 55,0 % | 77,5 % | 75,0 % | MIT | HuggingFace, transformers |
| Qwen/Qwen3.5-2B (sin adaptador) | 1,88 B | no disponible | 50,0 % | 70,0 % | 70,0 % | no disponible en la informacion | HuggingFace |

No se dispone de datos sobre otros adaptadores de razonamiento latente comparables, ni de resultados frente a modelos de tamano similar de otros fabricantes.

## Limitaciones y advertencias

- Rendimiento inconsistente: la mejora solo aparece con un anclaje especifico del gancho al final de la pregunta. Sin el, se observa degradacion activa en ARC-Challenge (-2,5 %) y ARC-Easy (-5,0 %).
- OpenBookQA esta practicamente en el nivel del azar (5,0 % en exactitud bruta), muy por debajo del 25 % esperado por eleccion aleatoria, lo que sugiere un problema de calibracion en esa tarea.
- PIQA muestra una ganancia en exactitud bruta (+5,0 %) pero una perdida en exactitud normalizada (-5,0 %), que el autor atribuye a "overthinking" en tareas de habilidad motora basica.
- Muestras pequenas: 40 ejemplos por tarea en la tabla principal y 160 en total, lo que limita la significacion estadistica de las diferencias de uno a cinco puntos porcentuales.
- Sesgo de idioma: el modelo solo declara soporte de ingles, tanto en la model card como en los metadatos. No hay evaluacion en castellano ni en otros idiomas.
- Dependencia del modelo base: es un adaptador, no un modelo autonomo. Requiere Qwen/Qwen3.5-2B y su licencia, no especificada en la informacion proporcionada.
- Entrenamiento limitado a un unico dataset de razonamiento cientifico (allenai/ai2_arc), con el backbone congelado. No se documentan etapas de RLHF, DPO ni datos de instrucciones generales.
- Riesgo de alucinacion: no evaluado en la informacion disponible. El adaptador modifica la representacion latente interna, por lo que puede alterar respuestas fuera del formato de opcion multiple de formas no medidas.
- Sin validacion externa: el repositorio tiene 0 descargas y 0 likes, un solo autor y una model card que parece truncada (la seccion final sobre diseccion matematica del comportamiento queda cortada).
- Licencia MIT declarada, lo que en principio permite uso comercial, pero al tratarse de un adaptador sobre un modelo base de terceros, la licencia del backbone prevalece para el uso combinado y no se detalla en la informacion disponible.
- Integracion fragil en produccion: el comportamiento depende de un gancho en la capa 11, de la compuerta ReZero y del punto de anclaje. No hay documentacion de compatibilidad con servidores de inferencia estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CH3NDev/dual-loop-qwen3.5-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de ajuste fino: https://huggingface.co/datasets/allenai/ai2_arc
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo, su paper, repositorio o demos. Las busquedas devuelven unicamente articulos de prensa generalistas sin relacion con el modelo.
