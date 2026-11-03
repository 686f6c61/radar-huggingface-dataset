# padiredd/dp-blockpick-cap1k-dr2-statenoise

## Resumen

dp-blockpick-cap1k-dr2-statenoise es una política de difusión (diffusion policy) para robótica manipulativa, publicada por el usuario padiredd en Hugging Face. Implementa una política de imitación entrenada para una tarea concreta: recoger un bloque verde lima con el brazo izquierdo de un robot ROBOTIS FFW SG2 equipado con pinza ROBOTIS CAD y cámaras de muñeca calibradas. El modelo sigue el formato LeRobot y se apoya en un fork propio del autor (lerobot-cyclo) sobre el que se han aplicado parches específicos de entrenamiento.

El modelo tiene 287.533.680 parámetros (aproximadamente 288 M) y se distribuye en safetensors dentro de un repositorio de 11,5 GB, que incluye el checkpoint final (paso 100k) más nueve checkpoints intermedios cada 10.000 pasos. No es un modelo de lenguaje: es un actor visomotor que consume tres cámaras de 240x240 píxeles y un vector de estado articular de 22 dimensiones, y emite 16 objetivos articulares a 15 Hz.

Su relevancia es acotada pero clara para quien trabaja en aprendizaje por imitación robótico: documenta con detalle una receta reproducible (100.000 pasos, batch 32, ResNet18 por cámara, DDPM de 100 pasos, horizonte 64 con 32 ejecutados) generada íntegramente en simulación con datos sintéticos producidos por un programa de política-como-código, incluyendo ruido de estado y aumentación de imagen agresiva. Es un artefacto de investigación, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder ResNet18 por cámara y cabeza de acciones; implementación LeRobot (fork lerobot-cyclo) |
| Parámetros totales | 287.533.680 (≈288 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; n_obs_steps = 1, horizonte de predicción 64 pasos, 32 ejecutados |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors sin versiones cuantizadas) |
| Idiomas soportados | no disponible (modelo robótico; no procesa lenguaje natural más allá de la cadena de tarea) |
| Licencia | other (sin términos concretos especificados en la model card) |
| Formato de pesos | safetensors (checkpoint LeRobot `DiffusionPolicy.from_pretrained`) |

## Arquitectura y entrenamiento

La política es una diffusion policy estándar de LeRobot: un DDPM con 100 pasos de difusión que predice secuencias de acciones (horizonte 64, de las cuales se ejecutan 32) condicionado por observaciones de una sola etapa temporal (n_obs_steps = 1). Cada una de las tres cámaras (cabeza, muñeca izquierda, muñeca derecha) pasa por su propio encoder ResNet18; la entrada se completa con un vector de estado articular de 22 dimensiones y la salida son 16 objetivos articulares a 15 Hz. El entrenamiento usó Adam con tasa 1e-4, scheduler coseno, batch 32, semilla 1000 y 100.000 pasos en una única RTX 4090 de 24 GB a aproximadamente 10,3 pasos por segundo.

Los datos provienen del dataset `pick-cube-cap1k-retry-dr2-3cam` (no publicado aún en Hugging Face): 1.000 demostraciones exitosas en simulación, 196.577 fotogramas, generadas por un programa de política-como-código que sortea por episodio parámetros de agarre, aproximación y temporización, e induce un 30 % de fallos de primer agarre seguidos de retirada y reagarre, con empujes articulares ejecutados únicamente y etiquetas limpias. El muestreo es uniforme sobre todos los fotogramas (EpisodeAwareSampler por defecto de LeRobot). Dos innovaciones destacables de la receta: aumentación de imagen agresiva en orden aleatorio (hasta 5 transformaciones simultáneas entre brillo, contraste, saturación, tono, nitidez, afín, perspectiva, desenfoque, borrado aleatorio y escala de grises) y ruido gaussiano de 1 grado sobre las 7 posiciones articulares del brazo izquierdo en la entrada de estado (`state_noise_std`, campo del parche lerobot-cyclo que debe eliminarse para cargar con lerobot-cyclo estándar).

## Capacidades

- Generación de acciones visomotoras: predice 16 objetivos articulares a 15 Hz a partir de tres cámaras de 240x240 y un estado de 22 dimensiones.
- Manipulación de precisión: tarea de recogida cenital de un bloque con el brazo izquierdo del ROBOTIS FFW SG2.
- Recuperación de fallos de agarre: entrenada explícitamente con un 30 % de fallos inducidos de primer agarre, retirada y reagarre.
- Robustez a ruido de estado: tolera perturbaciones de 1 grado en las posiciones articulares del brazo izquierdo gracias al entrenamiento con ruido.
- Robustez a variaciones visuales: aumentación de imagen agresiva durante el entrenamiento (iluminación, color, geometría, oclusión parcial).
- Condicionamiento por cadena de tarea: acepta la instrucción "pick up the lime green block with the left arm".
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades de lenguaje, visión general, audio o modo de pensamiento.

## Casos de uso

- Investigación en aprendizaje por imitación: servir como referencia reproducible de una receta completa de diffusion policy (DDPM 100 pasos, horizonte 64/32, ResNet18 por cámara) para comparar variantes de aumentación o ruido de estado.
- Estudio de recuperación de fallos: analizar cómo el 30 % de fallos inducidos durante la generación de datos afecta a la tasa de éxito y a la conducta de reagarre en evaluación.
- Simulación a realidad con ROBOTIS FFW SG2: punto de partida para transferir la política del simulador al robot físico, dado que la model card describe la configuración exacta (pinza CAD, cámaras calibradas, mesa de 29,25 pulgadas).
- Aumentación de datos sintéticos: reutilizar el enfoque de política-como-código (parámetros sorteados por episodio, empujes ejecutados con etiquetas limpias) para generar nuevos datasets de manipulación.
- Evaluación de robustez: medir la degradación de la política ante cambios de iluminación, color o perspectiva, aprovechando que el entrenamiento ya cubre esas transformaciones.
- Docencia y prototipado en robótica: ejemplo completo y ligero (288 M parámetros, entrenable en una RTX 4090) para cursos o proyectos de manipulación con LeRobot.
- Análisis de checkpoints intermedios: los nueve checkpoints cada 10.000 pasos permiten estudiar curvas de aprendizaje y sobreajuste en políticas de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación se añadirán una vez ejecutados.

## Requisitos de hardware

- Entrenamiento: una NVIDIA RTX 4090 de 24 GB, a aproximadamente 10,3 pasos por segundo con batch 32.
- VRAM estimada para inferencia: no disponible de forma explícita; con 288 M parámetros en safetensors, la inferencia cabe holgadamente en GPUs de consumo (RTX 3060 12 GB o superiores), aunque no se han publicado mediciones.
- GPUs recomendadas: RTX 4090 para entrenamiento; para inferencia, cualquier GPU consumer con suficiente VRAM para los tres encoders ResNet18 y el DDPM de 100 pasos.
- Cabe en GPU consumer: sí, según el tamaño del modelo; sin cifras oficiales de VRAM en inferencia.
- Opciones de despliegue: LeRobot (`DiffusionPolicy.from_pretrained`) con el fork lerobot-cyclo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles para inferencia; solo se conoce el throughput de entrenamiento (≈10,3 pasos/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-blockpick-cap1k-dr2-statenoise | 288 M | n_obs_steps 1, horizonte 64/32 | Recogida cenital de bloque, brazo izquierdo FFW SG2 | other | Hugging Face (repo de 11,5 GB) |
| Otras diffusion policies de LeRobot | no disponible | no disponible | Manipulación genérica | no disponible | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo específico de una única tarea y un único robot: no generaliza a otras tareas, objetos, brazos o plataformas sin reentrenamiento.
- Entrenado íntegramente en simulación: el rendimiento en el robot físico no está validado; la model card indica que los resultados de evaluación están pendientes.
- Dataset de entrenamiento no publicado: `pick-cube-cap1k-retry-dr2-3cam` no está aún en Hugging Face, lo que limita la reproducibilidad completa.
- Dependencia de un fork: requiere lerobot-cyclo; el campo `state_noise_std` de config.json debe eliminarse para cargar con la versión estándar.
- Licencia "other" sin términos concretos: no se especifican condiciones de uso comercial, por lo que no puede asumirse permiso para producción.
- Riesgo de alucinación en el sentido robótico: la política puede generar trayectorias plausibles pero incorrectas ante distribuciones de entrada fuera del dominio de entrenamiento (nuevos objetos, iluminación extrema, configuraciones articulares no vistas).
- Sesgos de datos: el programa generador sortea parámetros dentro de rangos definidos; el comportamiento fuera de esos rangos no está cubierto.
- Idiomas: no aplica; el modelo no procesa lenguaje natural más allá de la cadena de tarea fija.
- Sin cuantizaciones publicadas ni métricas de latencia en inferencia, lo que dificulta planificar un despliegue en tiempo real.

## Enlaces

- Hugging Face: https://huggingface.co/padiredd/dp-blockpick-cap1k-dr2-statenoise
