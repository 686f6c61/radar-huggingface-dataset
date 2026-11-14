# snupilab/Rep4Act-Asymmetric-MMDiT-4B-FM-FD-Pretrained-100k-seed0

## Resumen

Rep4Act-Asymmetric-MMDiT-4B-FM-FD-Pretrained-100k-seed0 es un modelo de robótica publicado por el laboratorio snupilab en Hugging Face. Se trata de un checkpoint de preentrenamiento (100k pasos, semilla 0) de una arquitectura multimodal de difusión basada en transformer, denominada MMDiT (Multi-Modal Diffusion Transformer) y descrita como "asimétrica" en el nombre del modelo. El pipeline declarado en la ficha de Hugging Face es `robotics`, lo que sitúa al modelo en el ámbito de la robótica y el aprendizaje por imitación, y no en el de los modelos de lenguaje conversacionales.

El identificador "FM-FD" sugiere un esquema de entrenamiento con flujo de movimiento (flow matching) y destilación de flujo (flow distillation), y "Rep4Act" apunta a una representación intermedia orientada a la acción (representation for action). El checkpoint contiene 5.840.181.793 parámetros en formato safetensors, lo que lo sitúa en la categoría de 4-6B pese a que el nombre comercial diga "4B". El repositorio ocupa 19,7 GB.

La relevancia del modelo es acotada: se trata de un checkpoint intermedio de investigación, con cero descargas y cero likes en el momento de la consulta, acceso restringido (gated) y sin licencia ni idiomas declarados. No es un modelo listo para producción ni para uso general; su interés es exclusivamente para investigadores que quieran reproducir o continuar el preentrenamiento de políticas robóticas multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MMDiT (Multi-Modal Diffusion Transformer) asimétrica, con flow matching y flow distillation segun el nombre del checkpoint |
| Parametros totales | 5.840.181.793 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo pertenece a la familia MMDiT, un transformer de difusión multimodal en el que las modalidades (típicamente imagen/observación y texto/instrucción) se procesan con ramas separadas y se combinan mediante atención conjunta. El calificativo "asimétrico" sugiere que las dos ramas no tienen la misma profundidad ni el mismo ancho, aunque no se detalla la configuración exacta. El sufijo "FM-FD" apunta a flow matching como objetivo de entrenamiento y a flow distillation como técnica de aceleración o destilación, y "Rep4Act" a una representación latente orientada a la predicción de acciones.

El checkpoint corresponde a un preentrenamiento de 100.000 pasos con semilla 0 ("Pretrained-100k-seed0"), lo que indica que existen o existirán otras semillas y longitudes de entrenamiento. No se especifica el número de tokens o trayectorias de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. Toda la información sobre datos de entrenamiento y receta debe considerarse no disponible.

## Capacidades

- Modelo de robótica orientado a políticas de acción, no a generación de texto libre.
- Procesamiento multimodal de observaciones (imagen) y posibles instrucciones, según la arquitectura MMDiT.
- Generación de acciones mediante difusión con flow matching, adecuada para control continuo.
- Preentrenamiento de representaciones para aprendizaje por imitación ("Rep4Act").
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de pensamiento, visión o audio como capacidades de propósito general: no disponible.

## Casos de uso

- Investigación en aprendizaje por imitación: usar el checkpoint como inicialización para ajustar políticas de manipulación robótica con datasets propios, aprovechando el preentrenamiento de 100k pasos.
- Reproducción de experimentos: dado el sufijo "seed0", sirve como punto de partida para comparar variabilidad entre semillas en el preentrenamiento de políticas MMDiT.
- Estudio de flow distillation: el sufijo "FD" permite analizar el efecto de la destilación de flujo sobre la calidad de las trayectorias generadas frente a un modelo solo con flow matching.
- Benchmarking de arquitecturas de difusión para robótica: comparar MMDiT asimétrico frente a políticas basadas en transformers autorregresivos o en DDPM clásicos.
- Desarrollo de sistemas de control visomotor: integrar el modelo en un bucle de control que reciba imágenes de cámara y emita acciones continuas, siempre en entorno de laboratorio.
- Base para ablaciones de representación: evaluar si la representación "Rep4Act" mejora la transferencia a tareas nuevas respecto a representaciones genéricas.
- Docencia y formación: utilizar el checkpoint como ejemplo didáctico de pipeline de difusión multimodal aplicado a robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 11,7 GB solo para pesos (5,84B × 2 bytes), más activaciones y buffers de difusión; en la práctica, se recomienda al menos 24 GB para trabajar con comodidad.
- VRAM estimada en fp32: aproximadamente 23,4 GB solo para pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para inferencia en precisión reducida.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090 (24 GB) en bf16 con margen ajustado; en GPUs de 16 GB requeriría cuantización o descarga parcial de capas, no documentada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de difusión para robótica, el despliegue habitual sería mediante PyTorch y un servidor de inferencia propio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rep4Act-Asymmetric-MMDiT-4B (este) | 5,84B | no disponible | Política robótica por difusión | no disponible | Gated en Hugging Face |
| Octo | no disponible en la información proporcionada | no disponible | Política robótica generalista | no disponible | no disponible |
| OpenVLA | no disponible en la información proporcionada | no disponible | VLA para manipulación | no disponible | no disponible |
| RDT-1B | no disponible en la información proporcionada | no disponible | Difusión para bimanipulación | no disponible | no disponible |

No se dispone de datos verificados de los modelos alternativos en la información proporcionada; la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Checkpoint de preentrenamiento intermedio: no es un modelo afinado para tareas concretas y probablemente requiera ajuste fino antes de cualquier uso real.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la auditoría externa.
- Licencia no declarada: no se puede asumir uso comercial permitido; la ausencia de licencia es un riesgo legal relevante.
- Idiomas no declarados: no hay garantía de soporte multilingüe en instrucciones.
- Sin datos de benchmarks: no es posible evaluar su rendimiento relativo frente a alternativas.
- Riesgo de alucinación y de acciones inseguras: como política robótica, errores de predicción pueden traducirse en movimientos físicos peligrosos; se requiere supervisión humana y límites de seguridad en el controlador.
- Sesgos desconocidos: al no documentarse la composición del dataset, no se pueden evaluar sesgos de dominio, de iluminación, de objetos o demográficos.
- Cero adopción verificable (0 descargas, 0 likes): no hay evidencia de la comunidad sobre su funcionamiento ni informes independientes.
- Fecha de creación futura en la ficha (2026-11-14): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/snupilab/Rep4Act-Asymmetric-MMDiT-4B-FM-FD-Pretrained-100k-seed0
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
