# najmulhasan/qwen3.5-4b-isometric-scenes-lora

## Resumen

El modelo `najmulhasan/qwen3.5-4b-isometric-scenes-lora` es un adaptador LoRA para el modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario najmulhasan. Su proposito es generar escenas isometricas animadas en formato SVG a partir de descripciones breves en ingles. El adaptador se entrena mediante aprendizaje por refuerzo (RL) para producir codigo SVG que renderiza y se anima correctamente, cubriendo lugares y objetos.

La relevancia de este modelo radica en su enfoque de post-entrenamiento con RL aplicado a la generacion de codigo que produce artefactos visuales verificables. Utiliza el framework prime-rl y un sistema de recompensas que combina comprobaciones de codigo (validez, seguridad y animacion del SVG) con un juez basado en el modelo `google/gemma-3-27b-it`. El adaptador tiene rango 32 y alpha 64, cubre todas las capas lineales del modelo de lenguaje y fue entrenado en 150 pasos con 128 rollouts por paso.

El modelo esta pensado para investigacion en post-entrenamiento con RL para codigo que renderiza, y para dibujar pequenas escenas animadas de lugares y objetos a partir de descripciones cortas. No esta entrenado ni evaluado para escenas con personas o animales, especificaciones largas o detalladas, otros idiomas, ni para SVG que deba cumplir requisitos de accesibilidad o produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (Qwen3.5-4B) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 10.240 tokens (configuracion de despliegue en vLLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el modelo base Qwen/Qwen3.5-4B, un transformer de 4.000 millones de parametros. El LoRA tiene rango 32 y alpha 64, y cubre todas las capas lineales del modelo de lenguaje. La torre de vision del modelo base permanece congelada y sin uso, ya que todas las entradas son texto.

El entrenamiento se realizo con prime-rl (commit `35fcb52`) y verifiers (commit `540f40f`). La funcion de perdida es la predeterminada de prime-rl en ese commit, IPO, con la recompensa menos la media del grupo como ventaja (advantage). Se ejecutaron 150 pasos de 128 rollouts cada uno (16 prompts con 8 respuestas cada uno), extraidos de los 1.600 prompts de entrenamiento, con temperatura 1.0 y hasta 8.192 tokens por respuesta. El entrenamiento utilizo 2 GPUs H100 y duro aproximadamente 1,7 horas de tiempo de reloj. La tasa de aprendizaje fue 1e-5.

La recompensa se compone de dos fases: primero se ejecutan comprobaciones de codigo (el SVG debe ser valido, seguro, renderizar y animarse), y despues el juez de entrenamiento `google/gemma-3-27b-it` responde preguntas de si/no sobre los fotogramas renderizados. Se guardo un checkpoint cada 15 pasos y se selecciono el de mejor recompensa de validacion bajo el juez de entrenamiento, que fue el paso 150 (el ultimo). La recompensa de validacion seguia subiendo en ese punto (0,771 en el paso 135 y 0,813 en el paso 150), y no se probo un entrenamiento mas largo.

## Capacidades

- Generacion de codigo SVG: produce documentos SVG completos a partir de descripciones breves en ingles.
- Generacion de escenas animadas: los SVG incluyen animacion (el modelo se entrena para que el resultado se mueva).
- Generacion de escenas isometricas: aunque el modelo se evalua como isometrico solo en un 10% de los casos, la intencion del entrenamiento es producir escenas isometricas de lugares y objetos.
- Modo de pensamiento desactivable: se recomienda desactivar el thinking con `chat_template_kwargs: {"enable_thinking": false}` para obtener directamente el SVG.
- No soporta tool calling ni function calling de forma explicita en la informacion disponible.
- No se documentan capacidades de agente ni razonamiento multi-paso mas alla del propio proceso de generacion.
- Capacidad multilingue limitada al ingles.
- No soporta vision, audio ni otras modalidades; la torre de vision esta congelada y sin uso.

## Casos de uso

- Generacion de ilustraciones SVG para documentacion tecnica: el modelo puede producir diagramas animados de lugares y objetos a partir de una descripcion corta, utiles para manuales o articulos que requieran graficos vectoriales ligeros y editables.
- Prototipado rapido de escenas isometricas para videojuegos: un desarrollador puede describir una habitacion, un edificio o un objeto y obtener un SVG animado que sirva como base para iterar en el diseno de assets 2D isometricos.
- Investigacion en RL para generacion de codigo verificable: el adaptador y su entorno sirven como caso de estudio reproducible de post-entrenamiento con recompensas basadas en ejecucion de codigo y jueces automaticos.
- Generacion de contenido educativo interactivo: escenas animadas de lugares u objetos para materiales didacticos que se integren en paginas web mediante SVG embebido.
- Creacion de iconografia animada para interfaces: el modelo puede producir pequenos SVG animados de objetos que se usen como iconos o ilustraciones en aplicaciones web.
- Experimentacion con LoRA y vLLM: el adaptador se puede servir junto al modelo base en vLLM con `--enable-lora` para probar flujos de despliegue de adaptadores en produccion.
- Generacion de escenas para pruebas de renderizado: util para generar casos de prueba de SVG animado en pipelines de validacion o test de navegadores.

## Benchmarks y rendimiento

Los resultados de evaluacion comparan el modelo base con el adaptador. Ambos modelos respondieron cada prompt de test 4 veces con las mismas semillas. El juez de evaluacion fue `google/gemini-3.1-pro-preview`, no usado en entrenamiento, con temperatura 0 y hasta 8.192 tokens. Los intervalos son bootstraps pareados sobre prompts.

| Prompts | Base | Adaptador | Diferencia (IC 95%) |
|---|---|---|---|
| Test (240) | 0,078 | 0,489 | +0,411 [0,387, 0,435] |
| Categoria reservada, `space` (120) | 0,082 | 0,561 | +0,479 [0,448, 0,511] |

En los prompts de test, los SVG validos pasaron del 54% al 97% de las respuestas, y los animados del 25% al 91%. De las respuestas que renderizaron (510 del base y 926 del adaptador), la escena fue reconocible en el 46% frente al 6%, y el 10% fueron juzgadas como isometricas por Gemini frente al 2%.

La ganancia es mayor bajo el juez de entrenamiento. En los mismos pares, Gemma puntua el modelo base en 0,25 y el adaptador en 0,81 en test, frente a 0,08 y 0,49 bajo Gemini. La ganancia de Gemma supera a la de Gemini en 0,15 [0,12, 0,18] en test y en 0,09 [0,04, 0,14] en `space`.

En prompts distractores, que anaden una figura de persona, animal o cara a la escena, el adaptador no dibujo la figura con menos frecuencia sobre el total de respuestas: el 17% [11%, 23%] de las respuestas del base y el 18% [10%, 27%] de las del adaptador en test contenian una, y el 14% frente al 10% en `space`. Entre las respuestas que renderizaron, la proporcion cayo del 35% al 19%, pero esa caida se debe al mayor numero de respuestas que renderizaron.

El autor, un unico evaluador que construyo el proyecto, comparo 50 pares de test sin saber que modelo genero cada uno. El RL fue preferido 40 veces, el base 6, y hubo 4 empates (tasa de victoria 0,87, Wilson 95% [0,74, 0,94]). En los 30 pares en que ambas respuestas llegaron al juez, los recuentos fueron 22, 5 y 3 (0,81 [0,63, 0,92]). Las salidas del RL comparten un estilo reconocible, por lo que el cegamiento es debil.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base tiene 4B parametros y el adaptador ocupa 0,4 GB en el repositorio. Con cuantizacion en 4 bits, el modelo base requeriria aproximadamente 2-3 GB de VRAM, aunque este dato no se proporciona en la informacion disponible.
- GPU recomendadas: el entrenamiento se realizo con 2 GPUs H100. Para inferencia, el modelo base de 4B cabe en GPUs consumer como RTX 3090, RTX 4090 o similares con 24 GB de VRAM, e incluso en GPUs con 8-12 GB si se cuantiza.
- Cabe en GPU consumer: si, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares, aunque no se documentan pruebas concretas.
- Opciones de despliegue: vLLM (version 0.32.0 fue usada para verificar el adaptador) con `--enable-lora --max-lora-rank 32` y `--lora-modules`. Tambien es posible usar PEFT directamente con la libreria transformers, aunque no se documenta en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El adaptador es especifico para una tarea muy concreta (SVG isometrico animado) y no se han publicado comparaciones con otros adaptadores o modelos de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen3.5-4b-isometric-scenes-lora | LoRA sobre 4B | 10.240 | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La mayoria de las respuestas son escenas animadas coherentes, pero pocas son isometricas (solo el 10% juzgadas como isometricas por Gemini).
- Ninguno de los jueces fue validado contra etiquetas humanas. El juez de entrenamiento puntua ambos modelos mucho mas alto que el juez de evaluacion, y parte de la ganancia puede ser especifica de ese juez.
- El adaptador no omite figuras en prompts distractores con mas frecuencia que el modelo base.
- El resultado en la categoria reservada cubre solo una categoria (`space`), lo que es evidencia debil de generalizacion.
- Los prompts de test provienen del mismo generador que los prompts de entrenamiento.
- Solo se realizo una unica ejecucion de entrenamiento, por lo que los intervalos cubren unicamente el muestreo de prompts.
- No se midio la diversidad de las salidas.
- El modelo no fue entrenado ni evaluado para escenas con personas o animales, especificaciones largas o detalladas, otros idiomas distintos del ingles, ni para SVG que deba cumplir requisitos de accesibilidad o produccion.
- La salida SVG debe revisarse antes de mostrarse en un navegador, tal como hacen las comprobaciones de codigo del entorno.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener sus propias condiciones que deben verificarse.
- Riesgo de alucinacion en la generacion de codigo SVG: aunque el entrenamiento refuerza la validez del SVG, no se garantiza que todas las salidas rendericen o sean seguras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/najmulhasan/qwen3.5-4b-isometric-scenes-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio GitHub: https://github.com/najmulhasan-code/isometric-scenes
- Entorno en Prime Intellect: https://app.primeintellect.ai/dashboard/environments/najmulhasan-code/isometric-scenes
- Dataset: https://huggingface.co/datasets/najmulhasan/isometric-scenes
- prime-rl: https://github.com/PrimeIntellect-ai/prime-rl
- verifiers: https://github.com/PrimeIntellect-ai/verifiers
- Prompts del sistema: https://github.com/najmulhasan-code/isometric-scenes/blob/main/environments/isometric_scenes/isometric_scenes/prompts.py
- Script de generacion: https://github.com/najmulhasan-code/isometric-scenes/blob/main/training/generate.py
