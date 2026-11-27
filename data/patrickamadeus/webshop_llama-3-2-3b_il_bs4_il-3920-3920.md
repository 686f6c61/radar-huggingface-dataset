# patrickamadeus/webshop_Llama-3.2-3B_IL_bs4_IL.3920.3920

## Resumen

webshop_Llama-3.2-3B_IL_bs4_IL.3920.3920 es un ajuste fino completo (full fine-tune) de meta-llama/Llama-3.2-3B-Instruct realizado por el usuario patrickamadeus sobre datos expertos del entorno WebShop, un benchmark de compras online en el que un agente debe navegar un catalogo y completar objetivos de compra expresados en lenguaje natural. El modelo se entrena mediante imitation learning (IL) sobre pares estado-accion generados por un experto, con el objetivo de servir como linea base frente a metodos mas sofisticados como el modelado implicito del mundo o la autorreflexion.

El nombre del repositorio codifica toda la configuracion experimental: benchmark (webshop), modelo base (Llama-3.2-3B), brazo de aprendizaje (IL, imitation learning), tamano de batch efectivo (bs4) y una unica etapa de entrenamiento de 3.920 pasos sobre 15.678 filas expertas, lo que equivale a una epoca completa. El checkpoint publicado es el final de esa etapa (paso 3.920 de 3.920).

La relevancia de este modelo es acotada: se trata de un artefacto de investigacion para reproducir y comparar resultados dentro del paper "Early Experience" sobre agentes que aprenden en entornos interactivos. No es un modelo de proposito general ni esta pensado para despliegue en produccion; su interes radica en la metodologia de evaluacion y en la trazabilidad del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud maxima usada en entrenamiento; la ventana nativa del modelo base es mayor) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en bf16) |
| Idiomas soportados | no disponibles (heredados del modelo base, sin evaluacion especifica) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (no LoRA) de Llama-3.2-3B-Instruct, un transformer decoder-only de 3.212 millones de parametros. El entrenamiento se realizo con LlamaFactory en modo SFT, con learning rate 1e-5, scheduler coseno con un 3% de warmup, precision bf16, optimizador paged AdamW de 8 bits, longitud maxima de 4.096 tokens y semilla 0.

Los datos de entrenamiento son las filas expertas liberadas de WebShop (pares estado-accion), un total de 15.678 filas recorridas en 3.920 pasos con un batch efectivo de 4 filas por actualizacion, lo que constituye exactamente una epoca. No se menciona el uso de RLHF, DPO ni tecnicas de alineamiento adicionales; el unico objetivo es la imitacion supervisada de la politica experta. El nombre del run (`NR_RUN=one`, rama `runs/one-epoch`) indica que forma parte de un conjunto de brazos de una epoca comparados en el paper.

## Capacidades

- Generacion de texto y seguimiento de instrucciones heredados de Llama-3.2-3B-Instruct.
- Actuacion como agente en el entorno WebShop: dado un estado (observacion de la pagina web y objetivo de compra), produce la siguiente accion (busqueda, clic, seleccion).
- Razonamiento multi-paso orientado a tareas de compra: navegacion por categorias, filtrado por atributos y finalizacion de la compra.
- No se documentan capacidades de tool calling generico, vision, audio ni modo thinking.
- Capacidades multilingues: no evaluadas; se asumen las del modelo base, pero sin garantia.

## Casos de uso

- Reproduccion de experimentos de imitation learning: sirve como linea base IL para comparar contra metodos de modelado implicito del mundo y autorreflexion en WebShop, usando directamente los checkpoints publicados.
- Investigacion sobre agentes web: permite estudiar como un modelo de 3B imita politicas expertas en entornos de navegacion estructurada y donde falla (por ejemplo, en objetivos no vistos).
- Evaluacion de generalizacion: el conjunto limpio de 500 objetivos sin tarea de entrenamiento liberada permite medir la brecha entre memorizacion y generalizacion (36,6% frente a 28,0% de exito).
- Estudio de eficiencia de ajuste: al ser un fine-tune completo con hiperparametros documentados, es util para analizar el coste y el rendimiento de IL con modelos pequenos.
- Punto de partida para tecnicas de curriculum o data augmentation: el checkpoint final puede reutilizarse como inicializacion para brazos posteriores del mismo pipeline experimental.
- Analisis de fallos en agentes de compra: inspeccionar trayectorias generadas para identificar modos de error (bucles de busqueda, seleccion incorrecta de atributos) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados publicados en la model card (tasa de exito en WebShop, temperatura 0,4, 15 pasos, intervalo de confianza al 95%):

| Conjunto de evaluacion | Tasa de exito (%) |
|---|---|
| Objetivos estandar 0-499 | 36,6 (32,4-40,8) |
| Conjunto limpio (500 objetivos sin tarea de entrenamiento liberada) | 28,0 (24,2-32,0) |

Referencia del paper (Early Experience, tabla 1, Llama-3.2-3B, WebShop): imitation 41,8; implicit world modeling 60,2; self-reflection 52,7. El resultado de imitation del paper es superior al de este checkpoint concreto, lo que sugiere diferencias de configuracion o de evaluacion entre ambos.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 6,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 8 y 12 GB para inferencia con contexto de 4.096 tokens.
- En cuantizacion de 8 bits: alrededor de 3,5 GB de pesos; en 4 bits, alrededor de 2 GB, aunque el repo no publica versiones cuantizadas.
- GPU recomendadas: A100 o H100 para evaluacion por lotes a gran escala; RTX 4090, RTX 3090 o RTX 4080 para inferencia individual.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras convertir los pesos a GGUF; el formato publicado es safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| webshop_Llama-3.2-3B_IL (este) | 3,21B | 4.096 (entrenamiento) | Agente WebShop (IL) | llama3.2 | Hugging Face |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128K (nativo) | Proposito general | llama3.2 | Hugging Face |
| Brazos del paper Early Experience (implicit world modeling, self-reflection) | 3,21B | 4.096 (entrenamiento) | Agente WebShop | no disponible | No publicados en este repo |

La comparacion directa con otros checkpoints del mismo paper no es posible con los datos disponibles, ya que solo se publica el brazo IL. Frente al modelo base, la diferencia es que este checkpoint esta especializado en la politica de WebShop y pierde parte de la generalidad del instruct original.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion.
- Especializacion estrecha: su rendimiento fuera del entorno WebShop no esta evaluado y probablemente sea inferior al del modelo base.
- Brecha de generalizacion: la caida de 36,6% a 28,0% en el conjunto limpio indica dependencia de las tareas vistas durante el entrenamiento.
- Sin evaluacion de sesgos ni de seguridad; hereda los sesgos de Llama-3.2-3B-Instruct sin mitigacion adicional.
- Riesgo de alucinacion en acciones: puede generar acciones no validas o secuencias de navegacion incoherentes.
- Idiomas: no se documenta soporte ni evaluacion multilingue.
- Licencia llama3.2: impone restricciones de uso comercial y obligaciones de atribucion; debe revisarse antes de cualquier despliegue.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/patrickamadeus/webshop_Llama-3.2-3B_IL_bs4_IL.3920.3920
- Repositorio del proyecto: https://github.com/patrickamadeus/imagined-experience
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Convencion de nombres y campos: `HF_UPLOAD.md` en el repositorio de GitHub anterior
- Paper "Early Experience": no disponible como enlace directo en la informacion proporcionada
