# snupilab/Rep4Act-Asymmetric-MMDiT-4B-RoboTwin2-Clean-10k-PT100k-FM-ID-FDq-seed0

## Resumen

Rep4Act-Asymmetric-MMDiT-4B-RoboTwin2-Clean-10k-PT100k-FM-ID-FDq-seed0 es un modelo de robótica desarrollado por el laboratorio snupilab (Universidad Nacional de Seúl), publicado en Hugging Face bajo el pipeline `robotics`. Se trata de un modelo de difusión multimodal asimétrico (MMDiT, *Multimodal Diffusion Transformer*) orientado a la generación de acciones motoras, es decir, un *action policy* que traduce observaciones (típicamente imágenes y estado del robot) en trayectorias de acción continua. La nomenclatura del identificador indica que ha sido entrenado sobre el benchmark RoboTwin2, con un conjunto de datos "Clean" de 10.000 episodios, preentrenamiento de 100.000 pasos (PT100k) y variantes de *flow matching* (FM) con inicialización de identificador (ID) y decodificador (FDq) con semilla 0.

El modelo cuenta con 5.964.075.169 parámetros reales según los pesos en safetensors (aproximadamente 6B, aunque el nombre comercial lo etiqueta como "4B"), y el repositorio ocupa 20,2 GB. La arquitectura MMDiT asimétrica sugiere un diseño en el que las ramas de visión y de acción no tienen el mismo tamaño ni profundidad, una elección habitual para equilibrar el coste computacional de la codificación visual con la capacidad del decodificador de acciones. El entrenamiento con *flow matching* (en lugar de difusión DDPM clásica) es una tendencia reciente en políticas robóticas por su mejor estabilidad y menor número de pasos de muestreo.

La relevancia de este modelo es doble: por un lado, se enmarca en la línea de investigación de políticas de imitación basadas en difusión para manipulación robótica, un área muy activa en 2025-2026; por otro, su publicación bajo acceso restringido (gated) y la ausencia de licencia e idiomas declarados limitan su uso inmediato en producción. Es un artefacto de investigación más que un modelo listo para despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MMDiT asimétrico (Multimodal Diffusion Transformer) con flow matching |
| Parametros totales | 5.964.075.169 (≈6B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | robotics |
| Tamaño del repositorio | 20,2 GB |
| Acceso | restringido (gated) |
| Dataset de entrenamiento | RoboTwin2 Clean 10k |
| Pasos de preentrenamiento | 100k (PT100k) |
| Semilla | 0 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MMDiT (Multimodal Diffusion Transformer) asimétrica. En este tipo de diseño, las modalidades de entrada (observaciones visuales y estado proprioceptivo del robot) y la salida (secuencia de acciones) se procesan en ramas con distinta capacidad, compartiendo mecanismos de atención cruzada. La asimetría permite reducir el coste de la rama visual sin sacrificar la expresividad del decodificador de acciones, algo crítico cuando el modelo debe ejecutarse en lazo cerrado a alta frecuencia en un robot real.

El entrenamiento se realizó sobre el benchmark RoboTwin2 con el conjunto "Clean" de 10.000 episodios, durante 100.000 pasos de preentrenamiento. La nomenclatura "FM" indica *flow matching*, una formulación de difusión continua que aprende un campo de velocidades entre ruido y acciones, con muestreo más rápido que DDPM. Los sufijos "ID" y "FDq" apuntan a variantes de inicialización y decodificación (probablemente *identifier* y *flow decoder quantized*), aunque no se dispone de documentación que lo confirme. No se han publicado detalles sobre composición exacta del dataset, uso de RLHF/DPO ni innovaciones adicionales en la información disponible.

## Capacidades

- Generación de acciones motoras continuas para manipulación robótica a partir de observaciones visuales y estado del robot.
- Política de imitación entrenada sobre RoboTwin2, orientada a tareas bimanuales y de manipulación de objetos.
- Formulación de flow matching con muestreo reducido frente a difusión clásica.
- Integración multimodal visión + estado proprioceptivo en una única arquitectura MMDiT.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje natural.
- No se ha documentado soporte multilingüe (no es un modelo de lenguaje).
- No se ha documentado modo *thinking*, visión general, audio ni otras capacidades especiales fuera de la política robótica.

## Casos de uso

- Manipulación bimanual en simulación: el modelo puede integrarse en entornos RoboTwin2 para generar trayectorias de dos brazos en tareas de ensamblaje, aprovechando que fue entrenado específicamente sobre ese benchmark y su conjunto Clean de 10k episodios.
- Investigación en políticas de difusión: sirve como *baseline* reproducible (semilla 0, configuración documentada en el nombre) para comparar flow matching frente a DDPM en manipulación robótica.
- Evaluación de arquitecturas MMDiT asimétricas: útil para estudiar el equilibrio entre capacidad visual y de acción en políticas de imitación, dado que el diseño asimétrico es el eje del modelo.
- Transferencia a robot real tras ajuste fino: con un conjunto reducido de demostraciones reales, la política preentrenada en simulación puede adaptarse a un brazo físico, un flujo habitual en *sim-to-real*.
- Generación de datos sintéticos de trayectorias: el modelo puede muestrear múltiples acciones plausibles para una misma observación, útil para aumentar datasets de imitación.
- Docencia y reproducción de experimentos: al estar publicado con configuración explícita en el identificador, facilita la replicación de resultados en cursos de robótica o aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 12 GB solo para pesos (6B × 2 bytes), más overhead de activaciones y buffers de difusión; se recomienda al menos 24 GB para operar con comodidad.
- VRAM estimada en bf16 con *offloading* parcial: viable en GPUs de 16-24 GB (RTX 4090, A5000, L4) con latencia mayor.
- GPU recomendadas para producción: A100 40/80 GB, H100, L40S; para investigación, RTX 4090 o RTX 6000 Ada.
- Cabe en GPU de consumo (RTX 4090 24 GB) en precisión reducida, aunque el lazo cerrado a alta frecuencia puede requerir cuantización o destilación.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de acciones); el despliegue típico sería un script PyTorch propio con safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rep4Act-Asymmetric-MMDiT-4B (este) | ≈6B | no disponible | Política robótica (flow matching) | no disponible | Gated en HF |
| Diffusion Policy (Chi et al.) | ~decenas de M | no aplica | Política robótica (DDPM) | MIT (código) | Público |
| π0 (Physical Intelligence) | ~3B | no disponible | Política robótica generalista | no disponible | Parcial |
| RDT-1B | ~1B | no disponible | Política robótica bimanual | no disponible | Público |

La comparación es orientativa: no se dispone de métricas de rendimiento de este modelo para contrastar con las alternativas, y las licencias de los modelos comparables varían. La principal diferencia de este modelo es su tamaño (≈6B) y el uso de MMDiT asimétrico con flow matching, frente a enfoques más ligeros como Diffusion Policy o RDT-1B.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede bloquear pipelines automatizados.
- Licencia no declarada: no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin idiomas ni contexto documentados: no es un modelo de lenguaje y no debe evaluarse con métricas de NLP.
- Entrenado exclusivamente en RoboTwin2 Clean 10k: el rendimiento fuera de esa distribución (otro robot, otra cámara, otra tarea) no está garantizado.
- Riesgo de sobreajuste a la simulación: la transferencia *sim-to-real* requiere ajuste fino y validación empírica.
- Sin benchmarks publicados: no hay evidencia cuantitativa de éxito en tareas, lo que dificulta comparar con alternativas.
- Sin documentación de sesgos: al ser un modelo de acciones, los sesgos se manifiestan como preferencias de trayectoria hacia configuraciones vistas en entrenamiento.
- El nombre comercial "4B" no coincide con los 5,96B reales de safetensors; conviene usar el dato real para planificar hardware.
- Fecha de creación futura (2026-11-10) en los metadatos: posible error de marcado temporal, a verificar.

## Enlaces

- Hugging Face: https://huggingface.co/snupilab/Rep4Act-Asymmetric-MMDiT-4B-RoboTwin2-Clean-10k-PT100k-FM-ID-FDq-seed0
- RoboTwin2 (benchmark): no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
