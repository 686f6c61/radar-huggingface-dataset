# Allenda/VIEScore2

## Resumen

VIEScore2 es un modelo evaluador unificado para imagenes generadas y editadas, desarrollado por el usuario Allenda y publicado en HuggingFace. Se construye como un ajuste fino de Qwen/Qwen3-VL-8B-Instruct y su funcion es emitir, en una unica pasada autoregresiva, tres elementos: una puntuacion de calidad en dos ejes (calidad perceptiva `pq:` y consistencia semantica `sc:`), una rejilla de defectos de 16x16 en formato texto con celdas dispersas que localizan los problemas, y una explicacion verificable renderizada de forma determinista a partir de la puntuacion y la rejilla.

Su relevancia actual es que traslada la evaluacion de imagenes a un formato totalmente discreto y tokenizado: cada elemento de salida es un token de texto, por lo que las predicciones se pueden comprobar exactamente contra la verdad de referencia. Esto habilita recompensas verificables a nivel de celda, que es precisamente lo que se usa en su segunda fase de entrenamiento (GRPO con una recompensa F_beta sobre la rejilla de defectos).

El modelo tiene 8.767.123.696 parametros (unos 8,77 mil millones), se distribuye bajo licencia Apache 2.0 en safetensors y su repositorio ocupa 18,0 GB. El repositorio incluye ademas la variante `wo-grpo/`, que es el adaptador LoRA de la etapa de ajuste supervisado (SFT) sobre el modelo base. En el momento de la consulta el repositorio acumula 0 descargas y 0 likes, y la model card indica que la informacion de citacion se anadira cuando se publique el articulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje de la familia Qwen3-VL (clase `Qwen3VLForConditionalGeneration`) |
| Parametros totales | 8.767.123.696 (8,77 mil millones) |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el ejemplo oficial de uso carga los pesos en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 18,0 GB; incluye la subcarpeta `wo-grpo/` con adaptador LoRA) |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Tarea (pipeline) | image-text-to-text |
| Entrada / salida | imagen + texto de entrada; texto de salida (puntuaciones, rejilla de defectos y explicacion) |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es un transformer vision-lenguaje de la familia Qwen3-VL, cargado mediante la clase `Qwen3VLForConditionalGeneration`, con un codificador visual conectado a un decodificador autorregresivo. La innovacion principal no esta en el backbone, sino en el formato de salida: la rejilla de defectos es "text-native", es decir, se representa como un conjunto de celdas discretas sobre una cuadricula de 16x16, opcionalmente separadas en canales `artifact:` y `misalign:`. La explicacion que acompania a la puntuacion se renderiza de forma determinista a partir de la puntuacion y la rejilla, de modo que el texto no puede contradecir la evidencia espacial.

El entrenamiento consta de dos fases: primero un ajuste supervisado (SFT, publicado como adaptador LoRA en `wo-grpo/`) sobre Qwen/Qwen3-VL-8B-Instruct, y despues GRPO (Group Relative Policy Optimization) con una recompensa F_beta verificable a nivel de celda sobre la rejilla de defectos. La nomenclatura del repositorio es explicita: `VIEScore2` designa el checkpoint completo tras GRPO y las variantes ablacionadas se marcan por lo que les falta, nunca con sufijos anadidos. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases adicionales de DPO o RLHF aparte del GRPO descrito.

## Capacidades

- Puntuacion de calidad en dos ejes en una sola pasada autorregresiva: calidad perceptiva (`pq:`) y consistencia semantica (`sc:`).
- Localizacion de defectos sobre una rejilla de texto nativa de 16x16, con celdas dispersas (sparse) en lugar de una mascara densa.
- Separacion opcional de los defectos en dos canales: `artifact:` (artefactos de generacion) y `misalign:` (desalineacion semantica).
- Explicacion verificable: el texto se renderiza deterministicamente desde la puntuacion y la rejilla, lo que evita explicaciones que contradigan la evidencia espacial.
- Verificabilidad exacta: al ser todas las salidas conjuntos discretos de tokens, se pueden comprobar contra la verdad de referencia sin margen de ambiguedad.
- Uso como funcion de recompensa: la recompensa F_beta a nivel de celda sobre la rejilla es directamente computable, lo que permite emplear el modelo en bucles de RL para generacion de imagen.
- Grounding espacial (capacidad declarada explicitamente en las etiquetas del repositorio).
- Capacidades generales de vision-lenguaje y modo conversacional heredadas del modelo base (procesamiento conjunto de imagen y texto).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Control de calidad en pipelines de generacion de imagen: integrar el modelo como filtro automatico despues de un modelo de difusion para descartar o reencolar imagenes con `pq` bajo, usando la puntuacion de calidad perceptiva como umbral de publicacion.
- Deteccion de desalineacion prompt-imagen en edicion e inpainting: el eje `sc:` y el canal `misalign:` permiten comprobar si la imagen editada mantiene la consistencia semantica con la instruccion original, algo util en herramientas de retoque asistido.
- Anotacion y curado de datasets de evaluacion: como las salidas son tokens discretos y comprobables, las predicciones se pueden usar como pseudo-etiquetas para ampliar conjuntos de datos de calidad de imagen sin anotacion humana celda a celda.
- Recompensa verificable en RL para modelos generativos de imagen: la recompensa F_beta a nivel de celda sobre la rejilla de 16x16 se puede conectar directamente a un bucle de GRPO o PPO para optimizar un generador, sin necesidad de un modelo de recompensa aprendido aparte.
- Priorizacion de retoque manual en produccion grafica o retail: la rejilla de 16x16 localiza las regiones problematicas, de modo que un equipo humano puede centrarse en las celdas marcadas en lugar de revisar la imagen completa.
- Moderacion y aprobacion de contenido sintetico en plataformas: deteccion de artefactos evidentes en imagenes subidas por usuarios antes de su publicacion, con una explicacion textual que se puede mostrar al revisor.
- Investigacion en metricas de evaluacion: sirve como referencia reproducible bajo el protocolo congelado v3.1 para comparar nuevas metricas de calidad y localizacion de defectos.
- A/B testing de checkpoints de difusion: usar el SRCC de la puntuacion global contra juicios humanos para decidir que checkpoint se promociona a produccion, y usar cell-F1 para decidir mejoras de detalle fino.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre una suite multi-fuente de 1.300 ejemplos (RichHF, PAL4VST, EvalMuse, ImagenWorld, COCO; protocolo congelado v3.1):

| Metrica | Resultado |
|---|---|
| Cell-F1 de localizacion | 0,506 |
| Grid IoU (problem-sample) | 0,324 |
| SRCC de puntuacion global | 0,601 |

La model card afirma ademas que, tras mapear todos los metodos a una rejilla compartida de 16x16, VIEScore2 es el unico evaluador situado en el top dos de cell-F1 o grid-IoU en los seis benchmarks externos de localizacion (RichHF, AbHuman, HAD, SynthScars, PAL4VST, SDG-30K). No se proporcionan en la informacion disponible los valores numericos de los metodos de referencia ni las tablas completas; la model card remite al articulo y al repositorio de codigo acompanante, que no se enlazan en el texto facilitado.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: unos 17,6 GB solo para los pesos (8,77 mil millones de parametros a 2 bytes), mas la torre de vision y las activaciones; el repositorio completo ocupa 18,0 GB.
- No se dispone de estimaciones oficiales de memoria para activaciones ni cache KV, ya que no se documenta la longitud de contexto soportada.
- GPU de centro de datos recomendadas: A100 (40 GB o 80 GB) y H100, con margen amplio en bfloat16.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede cargar los pesos en bfloat16 con margen ajustado usando `device_map="auto"`, pero conviene validar el consumo real con la resolucion de imagen objetivo. Tarjetas de 16 GB o menos requeririan cuantizacion de 8 o 4 bits.
- No hay pesos GGUF ni cuantizados publicados en el repositorio, por lo que llama.cpp y Ollama no son viables sin una conversion previa no documentada.
- Opciones de despliegue: transformers es la via oficial documentada; el repositorio lleva la etiqueta `endpoints_compatible`, por lo que es desplegable en HuggingFace Inference Endpoints. vLLM, TGI o SGLang serian utilizables si la version correspondiente soporta la arquitectura Qwen3-VL, algo que no se confirma en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| Allenda/VIEScore2 | 8,77 mil millones | no disponible | Evaluacion de imagen y localizacion de defectos | Apache 2.0 | cell-F1 0,506; grid IoU 0,324; SRCC 0,601 |
| Qwen/Qwen3-VL-8B-Instruct (modelo base) | clase 8B (cifra exacta no disponible en la informacion) | no disponible | Vision-lenguaje generalista y conversacional | no disponible en la informacion proporcionada | no disponible |
| Evaluadores de calidad de imagen comparables (VIEScore original, Q-Align, RichHF u otros) | no disponible | no disponible | Puntuacion de calidad de imagen | no disponible | no disponible; la model card afirma que VIEScore2 esta en el top dos de cell-F1 o grid-IoU en seis benchmarks externos, pero no publica las cifras de las alternativas |

## Limitaciones y advertencias

- Toda la informacion de esta ficha procede de la model card; no hay articulo publicado (la cita esta pendiente) ni resultados de validacion independiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de uso en produccion.
- No se documentan la longitud de contexto, los idiomas soportados ni los formatos de cuantizacion, lo que dificulta planificar despliegues con requisitos concretos.
- Las metricas de localizacion son moderadas: cell-F1 de 0,506 y grid IoU de 0,324. La rejilla es de 16x16 y dispersa, por lo que la granularidad de la localizacion es gruesa y probablemente insuficiente para tareas que exijan mascaras de píxel.
- El SRCC de 0,601 en el conjunto interno indica una correlacion con juicios humanos solo moderada; no conviene usarlo como unico criterio de decision sin validacion en el dominio objetivo.
- Riesgo de alucinacion: la explicacion esta protegida por el renderizado determinista desde puntuacion y rejilla, de modo que no puede contradecir la evidencia espacial; sin embargo, la puntuacion y las celdas de la rejilla si pueden ser erroneas, y el texto heredara ese error de forma coherente.
- Es un ajuste fino especializado: es previsible que degrade las capacidades generales de generacion y dialogo del modelo base, por lo que no deberia emplearse como VLM de proposito general.
- Riesgo de sesgo en los juicios perceptuales, heredado de la composicion de los datos de entrenamiento (RichHF, PAL4VST, EvalMuse, ImagenWorld, COCO), que puede penalizar estilos, dominios o representaciones poco frecuentes en esos conjuntos.
- Licencia Apache 2.0 en este repositorio, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3-VL-8B-Instruct antes de un despliegue en produccion.
- La variante `wo-grpo/` es un adaptador LoRA de la etapa SFT, no un modelo completo: no debe cargarse como sustituto del checkpoint raiz sin aplicar el adaptador sobre el modelo base.
- Los prompts de evaluacion, el protocolo congelado, el renderizador determinista y los convertidores de benchmarks no estan en el repositorio de HuggingFace, sino en una release de codigo que no se enlaza en la informacion disponible; sin ellos no se puede reproducir la evaluacion publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Allenda/VIEScore2
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Articulo (paper): no disponible; la model card indica que la citacion se anadira al publicarse
- Repositorio de codigo acompanante (protocolo, renderizador, convertidores de benchmarks y baselines): no disponible en la informacion proporcionada
- Demos o espacios: no disponibles
