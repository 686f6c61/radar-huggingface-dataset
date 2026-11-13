# snupilab/Rep4Act-Asymmetric-MMDiT-4B-FM-ID-Pretrained-100k-seed0

## Resumen

Rep4Act-Asymmetric-MMDiT-4B-FM-ID-Pretrained-100k-seed0 es un modelo de investigación publicado por el laboratorio snupilab en Hugging Face, orientado a robótica (pipeline `robotics`) y enmarcado en la línea de trabajo "Rep4Act" (representaciones para acción). Se trata de un modelo de tipo MMDiT (Multimodal Diffusion Transformer) asimétrico, con aproximadamente 5.840 millones de parámetros reales según los tensores safetensors, aunque su denominación comercial lo etiqueta como "4B". El sufijo "FM-ID" sugiere un componente de modelo fundacional (foundation model) para identificación o dinámica, preentrenado sobre un conjunto de 100.000 muestras con semilla 0.

El modelo se distribuye en formato safetensors, con un repositorio de 19,7 GB, y su acceso está restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de la descarga. No se han publicado resultados de benchmarks, licencia ni lista de idiomas soportados en la información disponible, lo que limita su evaluación directa para producción.

Su relevancia radica en ser un artefacto de preentrenamiento para políticas robóticas basadas en difusión, un área activa donde los modelos de difusión multimodal están sustituyendo a los transformers autoregresivos para generar trayectorias de acción continuas. No obstante, al carecer de documentación pública, benchmarks y licencia clara, debe considerarse un modelo experimental de investigación más que una herramienta lista para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MMDiT (Multimodal Diffusion Transformer) asimétrica |
| Parametros totales | 5.840.181.793 (≈5,84 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es un MMDiT asimétrico, una variante de transformer de difusión multimodal en la que las ramas de procesamiento de distintas modalidades (típicamente imagen/observación y acción) no tienen la misma profundidad ni anchura. Este diseño se emplea habitualmente en políticas robóticas que generan acciones mediante difusión condicionada por observaciones visuales y de estado. El término "Asymmetric" indica que la rama de acción y la rama visual no comparten configuración, lo que permite asignar más capacidad a la representación visual y una cabeza de acción más ligera.

El modelo se presenta como "Pretrained" sobre 100.000 muestras ("100k") con semilla 0 ("seed0"), lo que sugiere un preentrenamiento de modelo fundacional ("FM") para una tarea de identificación ("ID") dentro del pipeline Rep4Act. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste fino supervisado. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de acciones robóticas mediante difusión multimodal, condicionada por observaciones (presumiblemente visuales y de estado).
- Preentrenamiento de representaciones para políticas de acción en el marco Rep4Act.
- Componente de modelo fundacional ("FM") orientado a tareas de identificación ("ID").
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso en lenguaje natural.
- No se documentan capacidades multilingües.
- No se documentan capacidades de visión, audio o modo "thinking" más allá del uso implícito de observaciones en robótica.

## Casos de uso

- Investigación en políticas robóticas basadas en difusión: el modelo puede servir como punto de partida para ajustar políticas de manipulación o navegación, aprovechando su preentrenamiento sobre 100.000 muestras para reducir el coste de entrenamiento desde cero.
- Preentrenamiento de representaciones para control: dado su carácter de modelo fundacional, puede emplearse para inicializar encoders de observación en pipelines de aprendizaje por imitación.
- Experimentos de ablación sobre arquitecturas MMDiT asimétricas: su configuración asimétrica permite comparar el reparto de capacidad entre ramas visual y de acción frente a variantes simétricas.
- Reproducción de resultados con semilla fija: el sufijo "seed0" facilita la reproducibilidad de experimentos de preentrenamiento en entornos de investigación.
- Base para ajuste fino en tareas de identificación de dinámica: el componente "FM-ID" puede adaptarse a tareas de estimación de estado o predicción de transiciones en entornos simulados.
- Evaluación comparativa de estrategias de preentrenamiento en robótica: al ser un checkpoint intermedio, permite medir el impacto del preentrenamiento a 100k muestras antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 23,4 GB solo para pesos, más memoria para activaciones y estado del proceso de difusión.
- VRAM estimada en bf16/fp16: aproximadamente 11,7 GB para pesos, con overhead adicional según el tamaño de lote y la resolución de observaciones.
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y ajuste fino; RTX 4090 (24 GB) podría alojar los pesos en bf16 para inferencia, aunque el margen para activaciones es ajustado.
- Cabe en GPU de consumo: sí, en bf16 sobre RTX 4090 o RTX 3090 (24 GB), siempre que el tamaño de lote y las observaciones sean moderados; en fp32 no cabe en GPU de consumo habitual.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de difusión para robótica, requeriría un runtime personalizado basado en PyTorch y safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rep4Act-Asymmetric-MMDiT-4B-FM-ID-Pretrained-100k-seed0 | ≈5,84 B | no disponible | Difusión para robótica | no disponible | Gated en Hugging Face |
| Diffusion Policy (referencia académica) | variable (decenas de M) | no aplica | Políticas de imitación por difusión | MIT (referencia) | Código abierto |
| Octo (modelo fundacional robótico) | ≈27 M (Small) / ≈93 M (Base) | variable | Políticas multitarea | Apache 2.0 / MIT | Hugging Face |
| OpenVLA | ≈7 B | variable | VLA para manipulación | Llama 2 (restrictiva) | Hugging Face |

La comparación es orientativa: no se dispone de datos de rendimiento del modelo de snupilab, y las alternativas citadas difieren en escala y enfoque. OpenVLA es el comparable más cercano en orden de magnitud (≈7 B frente a ≈5,84 B), mientras que Octo y Diffusion Policy son referencias de menor tamaño centradas en políticas de difusión.

## Limitaciones y advertencias

- Ausencia total de documentación pública: no hay model card sustantiva, benchmarks ni guía de uso, lo que impide validar su rendimiento real.
- Licencia no disponible: no puede confirmarse el uso comercial; debe tratarse como no apto para producción hasta aclarar los términos.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción a la reproducibilidad.
- Riesgo de alucinación o comportamientos erráticos en robótica: al ser un modelo de difusión para acciones, errores pueden traducirse en movimientos inseguros; requiere validación en simulación antes de uso físico.
- Idiomas no disponibles: no se documenta soporte lingüístico, por lo que no debe asumirse capacidad de instrucciones en lenguaje natural.
- Contexto no disponible: se desconoce la ventana máxima de observaciones o historial, lo que limita el diseño de tareas de horizonte largo.
- Sesgos: no documentados; los datasets de robótica suelen estar sesgados hacia entornos, objetos y morfologías concretas.
- Checkpoint de preentrenamiento intermedio ("Pretrained-100k"): no es un modelo final ajustado, por lo que su uso directo en tareas downstream probablemente requiera ajuste fino.
- Semilla única ("seed0"): no hay evidencia de robustez frente a variabilidad de inicialización.

## Enlaces

- Hugging Face: https://huggingface.co/snupilab/Rep4Act-Asymmetric-MMDiT-4B-FM-ID-Pretrained-100k-seed0
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
