# arkqz/so101-single-cube-pickup-v14

## Resumen

so101-single-cube-pickup-v14 es una política de control robótico entrenada para una tarea concreta: recoger un cubo colocado aleatoriamente sobre una mesa y mantenerlo elevado durante un breve periodo de tiempo. Lo publica el usuario arkqz en Hugging Face y está diseñado específicamente para el brazo robótico SO-101, un manipulador de seis ejes de bajo coste. No es un modelo de lenguaje ni un sistema multimodal general, sino una política neuronal que combina imitación a partir de demostraciones simuladas con correcciones deterministas de PPO.

El paquete incluye un actor TorchScript que se ejecuta en CPU, junto con configuración de movimiento interpolado, normalización congelada y módulos auxiliares de selección de cubo y controlador. La política opera a 20 Hz (una orden cada 50 ms) y consume seis posiciones articulares, seis objetivos previos, seis velocidades articulares y una imagen RGB completa de cámara de muñeca de 720 × 1280 × 3.

La relevancia del modelo es principalmente metodológica y de referencia: documenta con detalle un pipeline de extremo a extremo para robótica manipulativa en simulación MuJoCo, con criterios de evaluación estrictos y reproducibles. Sin embargo, el repositorio está vacío (0,0 GB), sin licencia declarada y sin descargas ni validación externa, lo que limita su uso práctico como artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal híbrida: actor neuronal con entrada visual RGB + estado propioceptivo, combinado con interpolación de trayectorias demostradas y correcciones PPO acotadas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje); ventana de episodio limitada a 300 llamadas a `predict` (15 s simulados a 20 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | TorchScript (`weights/actor.pt`), configuración JSON comprimida (`weights/motion.json.gz`) |
| Librería | PyTorch |
| Entrada visual | RGB 720 × 1280 × 3 HWC, uint8 NumPy, orientación de política (rotada 180° respecto a calibración de lente) |
| Entrada propioceptiva | 6 posiciones articulares, 6 objetivos previos, 6 velocidades (grados y porcentaje para gripper) |
| Frecuencia de control | 20 Hz (50 ms por orden) |
| Entorno de entrenamiento | MuJoCo con 12 entornos concurrentes, curriculum de nueve horas |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La política combina tres componentes. Primero, un actor neuronal que recibe la imagen RGB completa de la cámara de muñeca, escalada a [0,1] sin recorte, redimensionado ni historial de frames, junto con las tres variables propioceptivas concatenadas y normalizadas con media y varianza congeladas. Segundo, un mecanismo de selección de cubo basado en píxeles naranja, muestreado cada cuatro píxeles en cada dirección, que elige una trayectoria articular demostrada interpolada, incluyendo una variante de agarre exterior para cubos distantes. Tercero, correcciones PPO acotadas que se suman a la trayectoria nominal y se recortan antes de convertirse en objetivos absolutos en grados o porcentaje para el seguidor.

El entrenamiento consistió en un curriculum de nueve horas con demostraciones simuladas, ejemplos correctivos y PPO sobre 12 entornos concurrentes. La política final combina una biblioteca ampliada de demostraciones con correcciones PPO conservadoras. El actor nunca recibe poses del cubo, flags de contacto, flags de éxito ni comandos de profesor; la geometría de cámara usada para estimar la posición del cubo en la mesa es configuración calibrada, no estado ground-truth por paso. El paquete incluye fases de vista y retorno con controlador de realimentación cualificado: si el cubo está oculto en el reset, el controlador puede inclinar la muñeca, estimar la posición desde la nueva vista y volver antes de agarrar; un agarre inicial vacío puede disparar un retorno y segunda vista usando la deflexión medida de la pinza.

## Capacidades

- Agarre y elevación de un cubo de 25 mm colocado aleatoriamente sobre una mesa, con retención corta verificada mediante criterio estricto.
- Percepción visual basada en cámara de muñeca con calibración específica de dispositivo (Innomaker U20CAM-1080p-S1) y montaje visual provisional.
- Selección de trayectoria demostrada según la posición estimada del cubo, incluyendo agarre exterior para cubos lejanos.
- Recuperación activa ante cubo oculto en el reset: inclinación de muñeca, nueva estimación y retorno antes del agarre.
- Detección de agarre vacío mediante deflexión medida de la pinza y reintento con segunda vista.
- Control a 20 Hz con salida de seis objetivos articulares absolutos en grados (cinco ejes) y porcentaje (gripper).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, visión general, audio ni capacidades multilingües: es una política robótica de tarea única.

## Casos de uso

- Validación de pipelines de imitación + RL en robótica manipulativa: el paquete documenta criterios de evaluación reproducibles (semillas 2820000–2820099, 100 intentos, 15 s simulados) y permite replicar la comparación entre criterio estricto y criterio original de éxito.
- Referencia para calibración de cámara de muñeca en SO-101: el perfil `wrist-camera.json` registra matriz, coeficientes de distorsión y limitaciones del montaje, útil para equipos que montan el mismo sensor Innomaker U20CAM-1080p-S1.
- Estudio de currículos cortos en simulación: el entrenamiento de nueve horas con 12 entornos concurrentes sirve como baseline para comparar coste computacional y rendimiento en tareas de pickup.
- Integración en banco de pruebas MuJoCo: la política se puede ejecutar localmente con NumPy, SciPy y PyTorch, sin necesidad de MuJoCo, Stable-Baselines3, IK ni acceso a nube durante la inferencia.
- Investigación sobre recuperación perceptiva: las fases de vista y retorno ante cubo oculto o agarre vacío son un caso concreto de política reactiva basada solo en imagen, realimentación del seguidor y memoria interna del episodio.
- Docencia y reproducción de experimentos: los JSON de cualificación agregada e individual permiten auditar los 100 episodios y contrastar criterios de éxito, algo poco habitual en políticas robóticas publicadas.

## Benchmarks y rendimiento

| Criterio | Resultado | Muestra |
|---|---:|---|
| Agarre estable estricto (bilateral dentro de pinza, ≥10 mm de holgura bajo el cubo, sin otro soporte, velocidad ≤0,1 m/s durante 1 s) | 86/100 (86%) | 100 colocaciones frescas sin ayuda, semillas 2820000–2820099 |
| Criterio original de pickup (z mundial del punto medio >22,5 mm con contacto del brazo durante 1 s) | 93/100 (93%) | 100 colocaciones frescas sin ayuda |
| Replay local de paridad de exportación (semilla 2820000) | Pickup estricto completado en 117 comandos | 1 episodio |

La evaluación se realizó el 12 de noviembre de 2026 con la cámara calibrada, partiendo de la pose calibrada fija `[0, -16.802, 3.027, 87.881, -86.664, 50.984]` y un cubo muestreado de la distribución del datasheet. No se usó profesor ni asistencia de cinemática inversa durante la cualificación. La política superó el umbral definido por el usuario de 80/100 en criterio estricto. El autor advierte que esta muestra finita se usó para avanzar el curriculum y no establece fiabilidad en el mundo real; los resultados en nube y simulación local pueden diferir.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el actor TorchScript se ejecuta en CPU y el paquete solo requiere NumPy, SciPy y PyTorch.
- GPU recomendadas: no disponible; no se documenta uso de GPU para inferencia.
- Cabe en GPU consumer: no aplica según la documentación; la inferencia declarada es CPU-only.
- Opciones de despliegue: copia local del repositorio con `requirements.txt` instalado, importando `Policy` desde `policy.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: control a 20 Hz (50 ms por orden), con un máximo de 300 llamadas a `predict` por episodio; no se publican latencias medidas por llamada.
- Entrada de cámara: frame RGB completo 720 × 1280 × 3 en orientación de política, sin undistort ni recorte previo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de la misma categoría (políticas de pickup para SO-101 u otros manipuladores de bajo coste), ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Repositorio vacío (0,0 GB) y sin descargas ni likes: no hay artefactos verificables publicados más allá de la model card y los enlaces relativos citados.
- Licencia no declarada: no se especifican condiciones de uso comercial, redistribución ni modificación.
- Tarea única: la política solo recoge y eleva un cubo; el autor indica explícitamente que no es una política de apilamiento y que no ejecuta colocación ni liberación.
- Sin señal de éxito: `predict` no devuelve indicador de éxito; el host debe gestionar la parada y el reset.
- Límite de episodio: tras 300 llamadas, `predict` lanza un error de límite de episodio; el host debe detener antes si procede y resetear.
- Dependencia de calibración específica: requiere la pose de reset exacta, la calibración de lente del dispositivo Innomaker U20CAM-1080p-S1 y el montaje visual provisional del 11 de noviembre de 2026; otra cámara o montaje invalida los resultados.
- Orientación de imagen estricta: la imagen debe entregarse rotada 180° respecto a coordenadas de calibración de lente, sin undistort ni recorte; un giro adicional o un preprocesado incorrecto degrada la política.
- Resultados solo en simulación: la muestra de 100 intentos no establece fiabilidad en hardware real; el autor advierte que los resultados en nube y simulación local pueden diferir.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero existe riesgo de falsos positivos perceptivos (selección errónea de cubo o estimación incorrecta de posición) no cuantificado en la información disponible.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa texto ni lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/arkqz/so101-single-cube-pickup-v14
- Resultados agregados de cualificación: ./evaluation/qualification.json
- Resultados individuales de episodios: ./evaluation/qualification-episodes.json
- Replay de paridad de exportación: ./evaluation/export-replay.json
- Vídeo de replay local (vista de muñeca): ./media/export-replay-wrist.mp4
- Perfil de cámara: ./wrist-camera.json
- Perfil de robot: ./robot-profile.json
- Alineación seguidor-simulación: ./follower-to-sim.json
- Punto de entrada de la política: ./policy.py
- Controlador: ./inference/controller.py
- Interpolación de trayectorias: ./inference/trajectory_student.py
- Selección de cubo: ./inference/cube_selection.py
- Pesos del actor: ./weights/actor.pt
- Movimiento y normalización congelada: ./weights/motion.json.gz
- Manifiesto del paquete: ./policy.json
- Dependencias: ./requirements.txt
