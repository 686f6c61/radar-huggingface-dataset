# guitarorangedog/manifeel-tavla-gear

## Resumen

TA-VLA (con backbone de diffusion policy) es un checkpoint de robótica publicado por el usuario guitarorangedog dentro del ecosistema ManiFeel, una familia de políticas viso-táctiles entrenadas con la librería LeRobot 0.6.1. El modelo resuelve una tarea concreta de manipulación sobre un brazo Franka Panda, la variante `gear`, tomando como entrada la imagen de la cámara de muñeca y una imagen táctil del sensor derecho (`tacimg`). No es un modelo de lenguaje ni un VLA generalista: es una política de control entrenada de extremo a extremo para una tarea específica.

El checkpoint tiene 344.505.100 parámetros y un tamaño de repositorio de 1,4 GB, lo que sugiere pesos en precisión de 32 bits (fp32) o una mezcla de pesos y estados de optimizador. Se distribuye en formato safetensors bajo la etiqueta `lerobot`, con pipeline declarado `robotics`. El autor reporta una tasa de éxito del 37,0 % medida sobre 4 semillas y 50 episodios por semilla, con un máximo de 500 pasos por episodio, lo que lo sitúa como una línea base (baseline) más que como un modelo listo para producción.

Su relevancia es acotada pero clara para quien investiga políticas viso-táctiles: sirve como referencia reproducible de la familia ManiFeel sobre el dataset `RoboSynapse/manifeel-tacr_franka-panda_gear`, con receta de entrenamiento enlazada en un pull request público del repositorio robo-synapse. La model card es mínima y no incluye información sobre licencia, idiomas ni benchmarks estándar de IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (TA-VLA con backbone DP), política viso-táctil para control robótico |
| Parametros totales | 344.505.100 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política de control por pasos, máximo 500 pasos por episodio en evaluación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de diffusion policy: en lugar de predecir directamente una acción, aprende a generar trayectorias de acciones mediante un proceso de difusión condicionado por observaciones. La entrada declarada por el autor combina la imagen de la cámara de muñeca (wrist cam) y la imagen táctil del sensor derecho (`tacimg`), lo que lo convierte en una política multimodal visión-tacto. El backbone se etiqueta como TA-VLA, es decir, una variante de vision-language-action adaptada a la manipulación táctil dentro del proyecto ManiFeel.

El entrenamiento se realizó con robo-synapse sobre LeRobot 0.6.1, usando el dataset `RoboSynapse/manifeel-tacr_franka-panda_gear`, semilla 1000, precisión mixta (AMP) y sin aumento de datos. No se especifican en la información disponible el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en este dominio). La receta completa está enlazada en un pull request del repositorio robo-synapse, lo que permite reproducir el entrenamiento.

## Capacidades

- Control robótico de manipulación sobre un brazo Franka Panda para la tarea `gear`.
- Fusión de percepción visual (cámara de muñeca) y percepción táctil (imagen `tacimg` del sensor derecho).
- Generación de secuencias de acciones mediante difusión condicionada por observación.
- Ejecución de episodios de hasta 500 pasos.
- No dispone de generación de texto, razonamiento simbólico, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en el sentido de los LLM.
- Capacidades multilingües: no aplica.
- No dispone de modo thinking, visión general, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Investigación en políticas viso-táctiles: sirve como línea base reproducible para comparar nuevas variantes de diffusion policy sobre la tarea `gear`, con una tasa de éxito de referencia del 37,0 % y una receta de entrenamiento pública.
- Reproducción de experimentos: al estar entrenado con robo-synapse y LeRobot 0.6.1 sobre un dataset identificado, permite replicar el pipeline completo (semilla 1000, AMP, sin aumento) y validar cambios en el código.
- Evaluación de sensores táctiles: al consumir `tacimg`, el checkpoint permite estudiar cuánto aporta la señal táctil frente a la puramente visual en una tarea de ensamblaje con engranajes.
- Desarrollo de pipelines de entrenamiento en LeRobot: el repositorio de 1,4 GB y los pesos safetensors sirven para probar herramientas de carga, inspección y despliegue de políticas LeRobot en entornos de laboratorio.
- Docencia y formación en robótica de manipulación: como ejemplo completo de política de difusión multimodal con métricas declaradas y límites explícitos.
- Punto de partida para fine-tuning: aunque la licencia no está declarada, técnicamente el checkpoint puede servir como inicialización para variantes de la misma tarea o de tareas cercanas dentro del mismo banco de datos.
- Validación de infraestructura de simulación a realidad: útil para comprobar si un pipeline de despliegue con Franka Panda carga y ejecuta correctamente políticas LeRobot antes de invertir en entrenamientos más largos.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Tasa de éxito | 37,0 % | 4 semillas × 50 episodios, máximo 500 pasos por episodio |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a una política de control robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 344,5 M de parámetros, los pesos en fp32 ocuparían aproximadamente 1,38 GB, por lo que una GPU consumer con 4-6 GB de VRAM sería suficiente para cargar el modelo; el consumo real dependerá del tamaño de las imágenes de entrada y del número de pasos de difusión.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100 y H100; las GPU de datacenter no aportarían ventaja significativa para un modelo de este tamaño salvo por paralelismo de evaluación.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 4-6 GB de VRAM, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: LeRobot 0.6.1 (librería declarada), con carga de safetensors; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a políticas robóticas.
- Latencia y throughput: no disponibles. La evaluación se realizó con un máximo de 500 pasos por episodio, pero no se publican tiempos por paso ni frecuencia de control.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| guitarorangedog/manifeel-tavla-gear | 344,5 M | no aplica | 37,0 % de éxito en tarea `gear` | no disponible | Hugging Face |
| Otras variantes ManiFeel | no disponible | no aplica | no disponible | no disponible | no disponible |
| Diffusion Policy original (Chi et al.) | no disponible en esta ficha | no aplica | no disponible | no disponible | pública |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoría. Se indica "no disponible" en los campos que no han sido confirmados.

## Limitaciones y advertencias

- Tasa de éxito del 37,0 %: insuficiente para uso en producción; debe tratarse como línea base de investigación.
- Entrenado para una única tarea (`gear`) sobre un único robot (Franka Panda); no generaliza a otras tareas ni plataformas sin reentrenamiento.
- La model card no declara licencia, lo que impide asumir derechos de uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- No se documentan sesgos, pero al ser una política entrenada sobre un dataset concreto, heredará los sesgos de distribución de ese dataset (posiciones, iluminación, objetos).
- Riesgo de fallo silencioso: una política de difusión puede generar acciones plausibles pero incorrectas sin señal de error explícita.
- Sin información sobre robustness ante cambios de cámara, calibración o condiciones de iluminación.
- No se publican tiempos de inferencia ni frecuencia de control, lo que dificulta evaluar su viabilidad en lazo cerrado en tiempo real.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la métrica reportada.
- Fecha de creación declarada en 2026-11-12, posterior a la fecha habitual de consulta; conviene verificar la integridad y procedencia del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guitarorangedog/manifeel-tavla-gear
- Dataset de entrenamiento: https://huggingface.co/datasets/RoboSynapse/manifeel-tacr_franka-panda_gear
- Código y receta (pull request): https://github.com/kwk2696/robo-synapse/pull/2
