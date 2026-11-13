# guitarorangedog/manifeel-ds-gear

## Resumen

`guitarorangedog/manifeel-ds-gear` es un checkpoint de política robótica basado en Diffusion Policy (DP), publicado por el usuario guitarorangedog y entrenado con el framework robo-synapse sobre LeRobot 0.6.1. No es un modelo de lenguaje: es un modelo de control visuotáctil para manipulación robótica, diseñado para el entorno Franka Panda con el conjunto de datos ManiFeel `gear`. El repositorio contiene 329.216.262 parámetros en formato safetensors (1,3 GB), lo que sitúa al modelo en el rango de las diffusion policies de tamaño medio para robótica de manipulación.

El modelo resuelve una tarea concreta: generar acciones motoras a partir de una cámara de muñeca y una imagen táctil (`tacimg`) del dedo derecho. Según la model card, alcanza una tasa de éxito del 58,5 % en 4 semillas × 50 episodios con un máximo de 500 pasos por episodio, y es un 1,29× más rápido que la línea base DP en pasos hasta el primer éxito. Es relevante porque combina percepción táctil y visual en una política de difusión reproducible dentro del ecosistema LeRobot, aunque su alcance es experimental y muy acotado a un dataset y una tarea específicos.

La ficha se basa exclusivamente en la información pública disponible en Hugging Face y en la model card del autor. No hay datos de benchmarks estándar, licencia declarada ni idiomas soportados, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DP) sobre backbone de difusión, integrada en LeRobot 0.6.1 |
| Parametros totales | 329.216.262 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una Diffusion Policy (DP), una familia de políticas que generan trayectorias de acción mediante un proceso de difusión condicionado por observaciones. La entrada declarada en la model card es la imagen de la cámara de muñeca más la imagen táctil del dedo derecho (`tacimg`). El entrenamiento se realizó con el framework robo-synapse sobre LeRobot 0.6.1, con semilla 1000, precisión mixta (AMP) y sin aumento de datos (augmentation off). El dataset asociado es `RoboSynapse/manifeel-tacr_franka-panda_gear`, orientado a tareas de manipulación con el robot Franka Panda y señal táctil.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este contexto). La innovación destacable es la incorporación de percepción táctil junto con visión en una política de difusión, y la métrica de velocidad relativa frente a la línea base DP (1,29× en pasos hasta el primer éxito). El código y la receta están disponibles en el repositorio robo-synapse (PR #3).

## Capacidades

- Generación de acciones motoras para manipulación robótica a partir de observaciones visuales y táctiles.
- Fusión de cámara de muñeca e imagen táctil del dedo derecho (`tacimg`) como entrada multimodal.
- Política de difusión para trayectorias de acción continuas, adecuada para control de robot de tipo Franka Panda.
- Entrenamiento reproducible con LeRobot 0.6.1 y robo-synapse (semilla, AMP y configuración de aumento documentadas).
- Evaluación cuantificada en tasa de éxito (58,5 %) y velocidad relativa frente a DP (1,29×).
- No se documentan capacidades de lenguaje, tool calling, agentes, matemáticas ni multilingüismo.

## Casos de uso

- Manipulación robótica con feedback táctil: el modelo genera acciones a partir de la cámara de muñeca y la imagen táctil, útil en tareas donde la señal visual es insuficiente (agarre, inserción, contacto).
- Reproducción de experimentos en LeRobot: sirve como checkpoint de referencia para comparar variantes de Diffusion Policy sobre el mismo dataset y configuración.
- Línea base para investigación en políticas visuotáctiles: su tasa de éxito del 58,5 % y su velocidad 1,29× frente a DP permiten medir mejoras de nuevas arquitecturas.
- Prototipado en laboratorio con Franka Panda: al estar entrenado sobre `manifeel-tacr_franka-panda_gear`, es directamente aplicable a ese montaje experimental.
- Evaluación de robustez ante variaciones de semilla: la model card reporta 4 semillas × 50 episodios, lo que facilita análisis de varianza en la política.
- Docencia y formación en robótica de manipulación: el stack LeRobot 0.6.1 y la receta pública permiten reproducir el entrenamiento y la evaluación en entornos académicos.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Tasa de éxito | 58,5 % | 4 semillas × 50 episodios, máximo 500 pasos |
| Velocidad vs DP | 1,29× | Pasos medios hasta el primer éxito en episodios exitosos |
| Parametros totales | 329.216.262 | Safetensors |
| Tamano del repo | 1,3 GB | Hugging Face |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo es de robótica y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 329 M de parámetros en safetensors (1,3 GB), la inferencia cabe holgadamente en GPUs de consumo, aunque el requisito real depende del pipeline LeRobot y del tamaño de las imágenes de entrada.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060/4060 o superior debería ser suficiente para inferencia, y una RTX 4090 o A100/H100 para entrenamiento y evaluación a mayor escala.
- Cabe en GPU de consumo: sí, por el tamaño del checkpoint; la viabilidad práctica depende de los requisitos de LeRobot y del entorno robótico.
- Opciones de despliegue: LeRobot 0.6.1 (librería declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la model card solo reporta velocidad relativa frente a DP (1,29× en pasos hasta el primer éxito), no latencia absoluta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| guitarorangedog/manifeel-ds-gear | 329.216.262 | no aplica | 58,5 % éxito; 1,29× vs DP | no disponible | Hugging Face (LeRobot) |
| Diffusion Policy (línea base DP) | no disponible | no aplica | Referencia de comparación (1,0×) | no disponible | Referencia en la model card |
| Otras políticas visuotáctiles en LeRobot | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas concretas de la misma categoría; la única referencia cuantitativa es la línea base DP mencionada por el autor.

## Limitaciones y advertencias

- Alcance muy restringido: entrenado para un dataset y una tarea concretos (`manifeel-tacr_franka-panda_gear`), no es un modelo generalista.
- Tasa de éxito del 58,5 %: implica que aproximadamente 4 de cada 10 episodios fallan en la configuración evaluada.
- Sin licencia declarada: no se puede asumir uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Sin idiomas ni contexto de lenguaje: no es adecuado para tareas de texto, código o razonamiento.
- Riesgo de sobreajuste al montaje experimental (cámara de muñeca y sensor táctil del dedo derecho); cambios en la configuración pueden degradar el rendimiento.
- Sin datos publicados sobre sesgos, alucinación (no aplica en el sentido de lenguaje) ni robustez fuera de las 4 semillas evaluadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte comunitario limitados.
- La model card indica "augmentation off" y una única semilla de entrenamiento (1000), lo que reduce la diversidad de datos vista durante el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guitarorangedog/manifeel-ds-gear
- Dataset: https://huggingface.co/datasets/RoboSynapse/manifeel-tacr_franka-panda_gear
- Código y receta (robo-synapse, PR #3): https://github.com/kwk2696/robo-synapse/pull/3
- LeRobot: https://github.com/huggingface/lerobot
