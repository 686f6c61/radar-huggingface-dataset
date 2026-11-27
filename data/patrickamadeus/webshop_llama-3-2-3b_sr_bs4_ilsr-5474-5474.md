# patrickamadeus/webshop_Llama-3.2-3B_SR_bs4_ILSR.5474.5474

## Resumen

webshop_Llama-3.2-3B_SR_bs4_ILSR.5474.5474 es un ajuste fino completo (full fine-tune) del modelo meta-llama/Llama-3.2-3B-Instruct realizado por el usuario patrickamadeus sobre el conjunto de datos WebShop, un entorno de compras online en el que un agente debe navegar por un sitio web simulado para adquirir un producto a partir de una instrucción en lenguaje natural. El modelo forma parte de una línea de experimentación denominada "Early Experience" y "imagined experience", orientada a estudiar cómo el entrenamiento supervisado con filas de expertos y filas de auto-reflexion (self-reflection) afecta al rendimiento de un agente en tareas de navegacion web.

Arquitectonicamente es un transformer decoder-only de la familia Llama 3.2, con 3.212.749.824 parametros totales (aproximadamente 3,2 mil millones), derivado del checkpoint instruct de Meta. El ajuste se realizo con LlamaFactory en modo SFT, learning rate 1e-5, schedule coseno con 3% de warmup, bf16, AdamW 8-bit paginado, longitud maxima de 4.096 tokens y semilla 0, durante 5.474 pasos (una epoca sobre 21.894 filas con batch efectivo de 4).

Su relevancia es acotada y experimental: no es un modelo de proposito general, sino un artefacto de investigacion para reproducir y comparar resultados de agentes en WebShop. El autor reporta una tasa de exito del 40,8% en el conjunto estandar de metas 0-499 y del 35,6% en un conjunto limpio de 500 metas sin solapamiento con el entrenamiento, cifras inferiores a las reportadas en el paper de referencia para las variantes de imitacion (41,8), modelado implicito del mundo (60,2) y auto-reflexion (52,7).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (longitud maxima de entrenamiento); contexto nativo de Llama 3.2-3B no disponible en la informacion |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en bf16) |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 3,2 mil millones de parametros, inicializado desde meta-llama/Llama-3.2-3B-Instruct. El ajuste fino es completo (no LoRA ni QLoRA) y se ejecuto con LlamaFactory en modo SFT, con learning rate 1e-5, schedule coseno con 3% de warmup por etapa, precision bf16, optimizador paged AdamW 8-bit, longitud maxima de 4.096 tokens y semilla 0. La etapa unica registrada en el nombre del modelo, ILSR.5474.5474, corresponde a 5.474 pasos de optimizacion, equivalentes a una epoca completa sobre 21.894 filas con batch efectivo de 4 (4 filas por paso).

Los datos de entrenamiento combinan filas de experto liberadas del benchmark WebShop con filas de auto-reflexion (reflection rows) tambien liberadas, mezcladas y barajadas conjuntamente. Segun la convencion de nombres del autor, ARM=SR indica self-reflection dentro del marco "Early Experience". No se especifica en la informacion disponible si hubo etapas de RLHF, DPO u otro ajuste posterior, ni el numero total de tokens procesados mas alla de la equivalencia de una epoca sobre 21.894 filas. Tampoco se detalla la composicion exacta del dataset ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Llama-3.2-3B-Instruct.
- Navegacion de entornos web simulados: el ajuste esta orientado a la tarea WebShop, donde el modelo debe interpretar instrucciones de compra y emitir acciones sobre un sitio simulado.
- Aprendizaje por auto-reflexion: el entrenamiento incorpora filas de reflexion, lo que sugiere capacidad de generar razonamientos intermedios antes de actuar, aunque no se documenta formalmente en la model card.
- Seguimiento de instrucciones multi-paso en formato de trayectoria (observacion, accion), con horizonte de hasta 15 pasos segun la evaluacion reportada.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: si, en el dominio especifico de WebShop; no se documenta soporte general de agentes fuera de ese entorno.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Investigacion sobre agentes de navegacion web: el modelo sirve como checkpoint de referencia para reproducir los experimentos de "Early Experience" y comparar la variante self-reflection frente a imitacion y modelado implicito del mundo en WebShop.
- Evaluacion de estrategias de entrenamiento SFT: al ser un full fine-tune con hiperparametros documentados (lr, batch, schedule, semilla), permite aislar el efecto de mezclar filas de experto y filas de reflexion en el rendimiento final.
- Baseline para comparativas de agentes en entornos simulados: util para medir la brecha entre un modelo de 3B ajustado y modelos mayores o con RL en tareas de compra online.
- Generacion de trayectorias sinteticas de compra: el modelo puede producir secuencias de acciones sobre el catalogo simulado que sirvan como datos de aumento para otros entrenamientos.
- Estudio de alucinacion en agentes: al operar en un entorno con estado verificable (productos, precios, disponibilidad), permite analizar donde el modelo inventa acciones o atributos inexistentes.
- Prototipado de asistentes de compra en entornos controlados: con las debidas cautelas por su tasa de exito del 35-41%, puede usarse en demos internas de navegacion guiada por instrucciones.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (tasa de exito en WebShop, temperatura 0,4, 15 pasos, intervalo de confianza al 95%):

| Conjunto de evaluacion | Tasa de exito (%) | IC 95% |
|---|---|---|
| Metas estandar 0-499 | 40,8 | 36,4 - 45,2 |
| Conjunto limpio (500 metas sin tarea de entrenamiento liberada) | 35,6 | 31,4 - 39,8 |

Referencia del paper "Early Experience" (Tabla 1, Llama-3.2-3B, WebShop) citada por el autor:

| Variante | Tasa de exito (%) |
|---|---|
| Imitacion | 41,8 |
| Modelado implicito del mundo | 60,2 |
| Auto-reflexion | 52,7 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,5 GB solo para pesos (3,2B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 8 y 10 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 3,5-4 GB para pesos; en 4 bits, en torno a 2-2,5 GB. Estas cuantizaciones no estan publicadas en el repo y requeririan conversion propia.
- GPU recomendadas: A100, H100 o L40S para evaluacion a gran escala; RTX 4090, RTX 3090 o RTX 4080 para inferencia individual en bf16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070), y en tarjetas de 6-8 GB si se cuantiza.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversion a GGUF), Ollama (previa conversion), transformers con accelerate.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento WebShop | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| webshop_Llama-3.2-3B_SR_bs4_ILSR.5474.5474 | 3,2B | 4.096 (entrenamiento) | 40,8% estandar / 35,6% limpio | llama3.2 | Hugging Face (0 descargas) |
| Llama-3.2-3B-Instruct (base) | 3,2B | no disponible en esta ficha | no disponible | llama3.2 | Hugging Face (oficial) |
| Variante "implicit world modeling" del paper (Llama-3.2-3B) | 3,2B | no disponible | 60,2% | no disponible | no disponible |
| Variante "self-reflection" del paper (Llama-3.2-3B) | 3,2B | no disponible | 52,7% | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo esta especializado en WebShop y no esta pensado como modelo de proposito general; su uso fuera de ese entorno degradara el rendimiento respecto al base.
- La tasa de exito reportada (40,8% estandar, 35,6% limpio) es inferior a las variantes de referencia del paper (imitacion 41,8, modelado implicito 60,2, auto-reflexion 52,7), lo que sugiere que este checkpoint no reproduce los mejores resultados del trabajo original.
- El conjunto limpio muestra una caida de aproximadamente 5 puntos porcentuales respecto al estandar, indicando cierto grado de sobreajuste o memorizacion de tareas vistas.
- Riesgo de alucinacion: en tareas de agente, el modelo puede emitir acciones sobre productos o atributos inexistentes en el catalogo simulado.
- Sesgos conocidos: no documentados en la informacion disponible; hereda los del modelo base Llama-3.2-3B-Instruct.
- Idiomas soportados: no documentados; el entrenamiento en WebShop es presumiblemente en ingles, lo que puede degradar el comportamiento en castellano.
- Restricciones de licencia: se aplica la Llama 3.2 Community License, que impone condiciones de uso comercial, atribucion y politicas de uso aceptable; conviene revisar los terminos antes de cualquier despliegue en produccion.
- Artefacto de investigacion con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion externa.
- El repo ocupa 12,9 GB, coherente con pesos en bf16 mas posibles artefactos de entrenamiento; verificar el contenido antes de descargarlo integro.

## Enlaces

- Hugging Face: https://huggingface.co/patrickamadeus/webshop_Llama-3.2-3B_SR_bs4_ILSR.5474.5474
- Repositorio del proyecto (convencion de nombres y campos): https://github.com/patrickamadeus/imagined-experience
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Paper de referencia "Early Experience" (citado en la model card): no disponible como enlace directo en la informacion proporcionada
- Benchmark WebShop: no disponible como enlace directo en la informacion proporcionada
