# padiredd/dp-blockpick-cotrain-cap1k-real075-statenoise

## Resumen

`dp-blockpick-cotrain-cap1k-real075-statenoise` es una política de difusión (diffusion policy) para robótica manipulativa, publicada por el usuario `padiredd` en HuggingFace. Se trata de un modelo de control motor, no de un modelo de lenguaje: recibe imágenes de tres cámaras (cabeza y dos muñecas) más el estado articular y genera trayectorias de 16 articulaciones a 15 Hz para que el brazo izquierdo de un robot ROBOTIS FFW SG2 ejecute una tarea de recogida de un bloque verde lima.

El modelo sigue la arquitectura Diffusion Policy implementada en el fork `lerobot-cyclo` de LeRobot (ROBOTIS), con aproximadamente 288 millones de parámetros y un backbone ResNet18 por cámara. Su particularidad es la estrategia de co-entrenamiento con mezcla asimétrica: el 75 % de las muestras de cada lote provienen de 14 demostraciones reales de teleoperación y el resto de 1.000 episodios simulados generados por un programa *code-as-policy* en Isaac Lab.

Es relevante porque ejemplifica una técnica habitual en robótica actual: compensar la escasez de datos reales con datos sintéticos de alta fidelidad y un muestreo ponderado hacia lo real, además de aplicar ruido gaussiano al estado articular durante el entrenamiento para mejorar la robustez frente a errores de estimación en despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DDPM, 100 pasos de difusión) con backbone ResNet18 por cámara; fork `lerobot-cyclo` de LeRobot |
| Parámetros totales | 287.533.680 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (n_obs_steps = 1; horizonte de predicción de 64 pasos, 32 ejecutados) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp32/fp16; no se documentan variantes GGUF ni int8) |
| Idiomas soportados | no disponible (modelo de robótica; la instrucción de tarea es una cadena de texto fija en inglés) |
| Licencia | other (sin términos detallados en la model card) |
| Formato de pesos | safetensors (checkpoints en la raíz y en `step-10000/` a `step-90000/`) |

## Arquitectura y entrenamiento

El modelo es una política de difusión condicionada por observaciones: tres cámaras a 240x240 píxeles (cabeza, muñeca izquierda y muñeca derecha) procesadas cada una por un ResNet18, más un vector de estado articular de 22 dimensiones. La salida es una acción de 16 objetivos articulares a 15 Hz. El entrenamiento usa DDPM con 100 pasos, horizonte de 64 pasos con 32 ejecutados, `n_obs_steps = 1`, batch de 32, Adam con tasa 1e-4 y decaimiento coseno, semilla 1000, durante 100.000 pasos en una única NVIDIA RTX A5000 de 24 GB a unos 5,7 pasos por segundo.

Los datos combinan 1.000 episodios simulados (196.577 fotogramas) generados por un programa *code-as-policy* en Isaac Lab con el recetario `region10k dr2`, incluyendo un 30 % de fallos de agarre inducidos seguidos de retirada y reagarre, y 14 demostraciones reales de teleoperación del conjunto `omkarpatil/pick-lime-block` reformateadas al formato de simulación. El muestreo (`CotrainMixSampler`) extrae cada muestra de los episodios reales con probabilidad 0,75 y del resto simulado en caso contrario; las estadísticas de normalización se calculan sobre el conjunto fusionado. Como innovación destacable, se añade ruido gaussiano de 1 grado a las siete posiciones articulares del brazo izquierdo en la entrada de estado durante el entrenamiento (`state_noise_std`), campo propio del fork que debe eliminarse para cargar el modelo con `lerobot-cyclo` estándar. También se aplica aumento de imagen agresivo en orden aleatorio (hasta cinco transformaciones entre brillo, contraste, saturación, tono, nitidez, afin, perspectiva, desenfoque, borrado aleatorio y escala de grises).

## Capacidades

- Generación de trayectorias articulares para una tarea de manipulación concreta: recoger un bloque verde lima con el brazo izquierdo.
- Control visomotor a partir de tres vistas simultáneas (cabeza y dos muñecas calibradas).
- Condicionamiento por estado articular de 22 dimensiones, con robustez añadida frente a ruido de estimación de 1 grado en las articulaciones del brazo.
- Recuperación de fallos de agarre aprendida de los datos simulados (retirada y reagarre tras un fallo inducido en el 30 % de los episodios).
- Ejecución a 15 Hz con predicción de horizonte largo (64 pasos, 32 ejecutados), lo que permite replanificación periódica.
- No soporta tool calling, agentes, razonamiento multi-paso, visión general, audio ni capacidades multilingües: es un modelo de política motora de dominio muy restringido.
- Checkpoints intermedios cada 10.000 pasos disponibles para análisis de convergencia.

## Casos de uso

- Investigación en co-entrenamiento sim-real: sirve como referencia reproducible de cómo ponderar datos reales frente a sintéticos (alpha 0,75) y medir su efecto en la transferencia a hardware, comparando los checkpoints de 10k a 100k.
- Benchmark de robustez frente a ruido de estado: el campo `state_noise_std` permite entrenar variantes con y sin ruido y evaluar la degradación en despliegue con estimadores articulares imperfectos.
- Automatización de una celda de pick-and-place de laboratorio: el modelo puede desplegarse sobre el brazo izquierdo de un FFW SG2 con mesa de 29,25 pulgadas para recoger bloques en tareas repetitivas de investigación.
- Generación de datos sintéticos con *code-as-policy*: el pipeline descrito (parámetros de agarre, aproximación y temporización muestreados por episodio) es reutilizable para crear conjuntos de demostración para otras tareas de manipulación.
- Estudio de aumento de imagen en políticas visomotoras: la receta de hasta cinco aumentos aleatorios permite aislar qué transformaciones aportan más robustez en un dominio concreto.
- Base para *fine-tuning* con más demostraciones reales: al estar en formato LeRobot, se puede continuar el entrenamiento con nuevos episodios de teleoperación del mismo robot y tarea.
- Docencia y prototipado en robótica con presupuesto limitado: entrena en una sola RTX A5000 de 24 GB, lo que lo hace accesible para laboratorios pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación se añadirán cuando se ejecuten.

## Requisitos de hardware

- Entrenamiento verificado en una única NVIDIA RTX A5000 de 24 GB a aproximadamente 5,7 pasos por segundo (100.000 pasos).
- VRAM de inferencia estimada: no disponible de forma explícita; con 287,5 M de parámetros en fp32 los pesos ocupan alrededor de 1,15 GB, más activaciones de tres ResNet18 a 240x240 y el bucle DDPM de 100 pasos, por lo que debería caber holgadamente en GPUs consumer de 8-12 GB, aunque no se documenta.
- GPUs recomendadas: RTX A5000 (validada para entrenamiento); A100 y H100 son sobredimensionadas para este tamaño, útiles solo para barridos de hiperparámetros en paralelo.
- Cabe en GPU consumer: probablemente sí (RTX 3060 12 GB, RTX 4070, RTX 4090), sin cifras publicadas.
- Despliegue: pila LeRobot con el fork `lerobot-cyclo` de ROBOTIS; carga mediante `DiffusionPolicy.from_pretrained("padiredd/dp-blockpick-cotrain-cap1k-real075-statenoise")`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput de inferencia: no disponibles; el bucle DDPM de 100 pasos condiciona la latencia y debe evaluarse en el hardware objetivo antes de desplegar a 15 Hz.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-blockpick-cotrain-cap1k-real075-statenoise | 287,5 M | 64 pasos (32 ejecutados), 1 obs. | 1.000 sim + 14 reales | other | HuggingFace, repo de 11,5 GB |
| Diffusion Policy original (Chi et al.) | no disponible | no disponible | por tarea | no disponible | código público, sin pesos de esta tarea |
| Políticas ACT de LeRobot | no disponible | no disponible | por tarea | no disponible | ecosistema LeRobot |

No se dispone de datos de benchmarks ni de pesos equivalentes para una comparación cuantitativa con alternativas; la comparación queda limitada a parámetros, datos y disponibilidad.

## Limitaciones y advertencias

- Dominio extremadamente restringido: una sola tarea (recoger un bloque verde lima), un solo robot (FFW SG2 con pinza ROBOTIS), un solo brazo (izquierdo) y una altura de mesa fija de 29,25 pulgadas.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito ni en simulación ni en hardware real.
- Dependencia del fork `lerobot-cyclo`: el campo `state_noise_std` debe eliminarse de `config.json` para cargar con LeRobot estándar; el muestreo de co-entrenamiento también es propio del fork.
- Desequilibrio de datos: solo 14 episodios reales frente a 1.000 simulados, con posible brecha de dominio (iluminación, texturas, dinámica del robot) que el aumento de imagen y el muestreo al 0,75 intentan mitigar pero no eliminan.
- Licencia `other` sin texto detallado en la model card: es necesario contactar con el autor antes de cualquier uso comercial.
- Riesgo de sobreajuste a la escena simulada y a la iluminación del recetario `dr2`; el rendimiento fuera de esas condiciones no está caracterizado.
- Sin soporte multilingüe ni de instrucciones en lenguaje natural: la tarea es fija y no se puede reconfigurar por prompt.
- El conjunto de datos simulado (`pick-cube-cap1k-retry-dr2-3cam`) no está publicado en HuggingFace, lo que dificulta la reproducción exacta del entrenamiento.
- Sin cuantizaciones publicadas: el despliegue en hardware de borde requeriría convertir y validar los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/padiredd/dp-blockpick-cotrain-cap1k-real075-statenoise
- Conjunto de datos real citado: `omkarpatil/pick-lime-block` (referenciado en la model card, sin URL directa)
- Fork LeRobot de ROBOTIS: `lerobot-cyclo` (referenciado en la model card, sin URL directa)
- Diffusion Policy (paper original, referencia de la arquitectura): no disponible en la información proporcionada
- Isaac Lab: no disponible en la información proporcionada
- No se han encontrado papers, blogs, repos adicionales ni demos en la información proporcionada.
