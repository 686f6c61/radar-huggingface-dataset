# fesvhtr/phygenhand-minimax-h3-hot3d-controlnet

## Resumen

phygenhand-minimax-h3-hot3d-controlnet es un adaptador de control (ControlNet más LoRA) para el modelo de generación de vídeo imagen-a-vídeo MiniMax-H3, en su variante FL2VA. No es un modelo autónomo: se carga sobre el ControlNet Fun-ControlNet-Union de alibaba-pai, del que sobrescribe los pesos, y sobre el DiT del modelo base MiniMaxAI/MiniMax-H3. Lo publica el usuario fesvhtr dentro del proyecto phygenhand, con 0 descargas y 0 likes en el momento de la consulta, y sin licencia declarada.

El adaptador aprende a condicionar la generación de vídeo con mapas físicos de interacción mano-objeto empaquetados en un único vídeo RGB: el canal R codifica profundidad (cerca claro, lejos oscuro), el canal G una máscara semántica (mano 255, objeto 128, fondo 0) y el canal B la intensidad de contacto. El entrenamiento usa los 1516 clips de HOT3D (train_aria) renderizados como pares (vídeo real, mapa de canales), a 832×480, 24 fps y 124 fotogramas.

Su interés es doble: por un lado, el ControlNet tiene 3,40B de parámetros en 5 bloques de inyección y se continúa el entrenamiento de forma completa desde los pesos de PAI, con un LoRA de rango 32 sobre el DiT; por otro, la receta es reproducible (DiffSynth-Studio, 4×H200). La advertencia principal es explícita en la model card: el entrenamiento ha terminado, pero el autor no ha evaluado la inferencia con los pesos resultantes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ControlNet (5 bloques de inyección, 3,40B de parámetros) sobre el DiT de MiniMax-H3 FL2VA, más LoRA de rango 32 en el DiT |
| Parámetros totales | 3,40B en el ControlNet; LoRA de rango 32 sobre `attn.qkv_proj`, `attn.out_proj`, `mlp.fc1`, `mlp.fc2`; parámetros del modelo base no disponibles |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; en el dominio de vídeo, ventana de 124 fotogramas a 24 fps (≈5,2 s) |
| Tipos de cuantización | No disponible; los pesos se publican en bfloat16. No se documentan variantes GGUF, FP8 ni INT8 |
| Idiomas soportados | No disponible; el modelo no procesa texto ni audio (peso de pérdida de audio fijado a 0) |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors en formato interno de DiffSynth (q/k/v fusionados en `qkv_proj`); 5 checkpoints de ControlNet de 6,34 GiB y 5 LoRA de 296 MiB |
| Pipeline | image-to-video |
| Modelo base | MiniMaxAI/MiniMax-H3 (FL2VA) y alibaba-pai/MiniMax-H3-Fun-Controlnet-Union |
| Dataset de entrenamiento | bop-benchmark/hot3d (train_aria): 1516 clips, 1441 entrenamiento / 75 validación |
| Resolución y formato de vídeo | 832×480, 24 fps, 124 fotogramas, sin audio |
| Entradas de control | Vídeo RGB empaquetado: R = profundidad, G = mano 255 / objeto 128 / fondo 0, B = intensidad de contacto |
| Tamaño del repositorio | 35,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 25 de octubre de 2026 |

## Arquitectura y entrenamiento

El adaptador se construye sobre la rama Fun-ControlNet-Union de MiniMax-H3, que inyecta 5 bloques de control con un total de 3,40B de parámetros en el DiT del modelo base. El autor continúa el entrenamiento de forma completa desde los pesos de PAI (no un ajuste parcial) y, en paralelo, entrena un LoRA de rango 32 sobre las proyecciones de atención (`attn.qkv_proj`, `attn.out_proj`) y las capas MLP (`mlp.fc1`, `mlp.fc2`) del DiT. La señal de control es un vídeo RGB de tres canales físicos (profundidad, máscara mano/objeto/fondo y contacto), lo que permite condicionar la generación con geometría y estado de contacto explícitos en lugar de solo con la primera imagen.

Los datos proceden de HOT3D, concretamente de todos los clips de `train_aria` renderizados como pares (vídeo real, mapa de canales): 1516 clips, de los que 1441 se usan para entrenamiento y 75 para validación, a 832×480, 24 fps y 124 fotogramas. El vídeo se entrena sin audio (peso de pérdida 0). La configuración es de 5 épocas con LR 1e-4, AdamW con weight decay 0,01 y batch efectivo de 8 (4 GPUs con acumulación de gradiente 2), en 4×H200 con BF16, DeepSpeed ZeRO-2 y gradient checkpointing, sobre DiffSynth-Studio en el commit 6b3c254. Cada época tarda aproximadamente 66 minutos y el pico de memoria es de unos 110 GB por tarjeta. No se especifica en la información disponible el número de tokens o de muestras vistas ni si hubo fases de RLHF o DPO, algo que no aplica a un modelo de difusión de vídeo de este tipo.

## Capacidades

- Generación de vídeo imagen-a-vídeo condicionada por mapas de profundidad, máscara semántica mano/objeto y mapa de contacto, con coherencia geométrica explícita.
- Condicionamiento por primer fotograma (FL2VA) combinable con el ControlNet, aunque requiere un parche de una línea en DiffSynth (documentado por el autor).
- Control de interacción mano-objeto: el canal G distingue mano (255), objeto (128) y fondo (0), y el canal B codifica la intensidad de contacto para supervisar el punto de agarre.
- Composición con LoRA del DiT, que permite cargar el adaptador de rango 32 junto al ControlNet en el mismo pipeline.
- Soporte de gestión de VRAM de DiffSynth (requiere mapeo de claves `.module.` en las capas norm).
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión de propósito general.
- No dispone de tool calling, function calling ni capacidades de agente o razonamiento multi-paso.
- No dispone de capacidades multilingües ni de procesamiento de audio (audio desactivado durante el entrenamiento).
- No dispone de modo "thinking" ni de salidas estructuradas más allá del vídeo generado.

## Casos de uso

- Aumento de datos para investigación en interacción mano-objeto: generar clips sintéticos a partir de mapas de profundidad y contacto derivados de capturas reales, para ampliar datasets de pose de mano o de detección de contacto en entornos con pocas muestras anotadas.
- Re-renderizado condicionado de secuencias capturadas con gafas Aria: convertir mapas físicos de HOT3D en vídeo RGB plausible para comparar la fidelidad del modelo frente al vídeo original, aprovechando que la resolución y los fps de entrenamiento coinciden con los del dataset.
- Prototipado en robótica de manipulación: usar el modelo como generador de vídeos de referencia de agarre y contacto que alimenten políticas de imitación o simulación, dado que el canal B aporta supervisión explícita del punto de contacto.
- Investigación en generación de vídeo controlada físicamente: servir de base para experimentos que midan cuánto mejora el control de contacto al añadir un mapa dedicado frente a usar solo primera imagen y prompt.
- Previsualización geométrica en animación y VFX: introducir mapas de profundidad y máscaras de mano/objeto dibujadas a mano para obtener un borrador de vídeo con la oclusión y el contacto en la posición prevista.
- Docencia y reproducción de experimentos: al publicarse 5 checkpoints (uno por época) con sus sha256 en `training_config.json`, permite estudiar la evolución del ajuste época a época con el script `scripts/reproduce/run_h3_scenarios.py` del repositorio phygenhand.
- Validación de pipelines de ControlNet en DiffSynth: el modelo documenta el formato interno (qkv fusionado) y el mapeo de claves `.module.`, por lo que sirve como caso de prueba para integraciones de ControlNet de vídeo en ese framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el entrenamiento ha finalizado pero que aún no se ha realizado una evaluación de inferencia con los pesos entrenados, por lo que no existen métricas de calidad de vídeo, fidelidad de contacto ni comparaciones cuantitativas con otros adaptadores.

## Requisitos de hardware

- Entrenamiento (dato del autor): 4×H200, BF16, DeepSpeed ZeRO-2 y gradient checkpointing, con un pico de aproximadamente 110 GB de VRAM por tarjeta y unas 66 minutos por época.
- Inferencia: no disponible. No se publican cifras de VRAM ni de latencia para la generación con estos pesos.
- Referencia de tamaño: cada checkpoint de ControlNet ocupa 6,34 GiB en bfloat16 (3,40B de parámetros) y cada LoRA 296 MiB, y deben convivir en memoria con el DiT del modelo base MiniMax-H3, cuyos requisitos no se detallan en la información disponible.
- GPU consumer: no disponible. No hay datos que permitan confirmar que el pipeline completo quepa en tarjetas de consumo; el único dato objetivo es el consumo de entrenamiento (≈110 GB por H200).
- Opciones de despliegue: DiffSynth-Studio (commit 6b3c254), mediante `MiniMaxH3Pipeline.from_pretrained` con `ModelConfig` para el ControlNet de PAI y posterior sobreescritura de pesos; requiere el parche de una línea para combinar la condición de primer fotograma FL2VA con el ControlNet.
- vLLM, llama.cpp, Ollama y TGI no aplican: es un modelo de difusión de vídeo, no un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Duración / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fesvhtr/phygenhand-minimax-h3-hot3d-controlnet | ControlNet + LoRA para vídeo imagen-a-vídeo | 3,40B (ControlNet) + LoRA rango 32 | 124 fotogramas, 832×480, 24 fps | No disponible | HuggingFace, 0 descargas |
| alibaba-pai/MiniMax-H3-Fun-Controlnet-Union | ControlNet base sobre el que se continúa el entrenamiento | No disponible | No disponible en la información | No disponible | HuggingFace |
| MiniMaxAI/MiniMax-H3 (FL2VA) | Modelo base de generación de vídeo | No disponible | No disponible en la información | No disponible | HuggingFace |

No se dispone de datos sobre otros adaptadores de control de interacción mano-objeto comparables, ni de métricas que permitan establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia de evaluación: el autor declara que no ha realizado inferencia con los pesos entrenados, por lo que no hay evidencia publicada de la calidad del resultado.
- Licencia no declarada: el repositorio no indica licencia, lo que impide asumir permiso de uso comercial o de redistribución.
- Dominio muy restringido: solo se entrena con HOT3D `train_aria`, a 832×480, 24 fps y 124 fotogramas; se desconoce el comportamiento fuera de esa resolución, duración o tipo de escena.
- Sesgo de dataset: las capturas Aria implican cámaras montadas en gafas, iluminación y escenarios concretos, con la distribución de objetos y manos del benchmark; es probable que el modelo no generalice a otras cámaras, manos o entornos.
- Riesgo de artefactos en zonas de oclusión y contacto: la supervisión de contacto depende del canal B y no hay métricas publicadas sobre su fidelidad, que es precisamente el punto crítico en interacción mano-objeto.
- Sin audio: el modelo se entrena con peso de pérdida de audio 0, por lo que no genera pistas de sonido sincronizadas.
- Integración frágil: los pesos están en formato interno de DiffSynth con q/k/v fusionados, no en el formato original de PAI, y con gestión de VRAM las claves norm requieren mapeo `.module.`; además, combinar FL2VA con ControlNet exige un parche no incluido en el repositorio.
- Dependencia de un commit concreto: la receta está fijada a DiffSynth-Studio 6b3c254, sin garantía de compatibilidad con versiones posteriores.
- Madurez: 0 descargas y 0 likes, repositorio de 35,6 GB con 10 ficheros de pesos, sin validación por parte de la comunidad ni demo publicada.
- Sin soporte de texto, idiomas, tool calling ni agentes: cualquier caso de uso que requiera esas funciones queda fuera del alcance del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fesvhtr/phygenhand-minimax-h3-hot3d-controlnet
- Repositorio de código phygenhand (rama `cvm-physics-proxy`, scripts `scripts/cvm_hand/` y `scripts/reproduce/run_h3_scenarios.py`): https://github.com/Nicous20/phygenhand
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- ControlNet base Fun-Controlnet-Union: https://huggingface.co/alibaba-pai/MiniMax-H3-Fun-Controlnet-Union
- Dataset HOT3D: https://huggingface.co/datasets/bop-benchmark/hot3d
- DiffSynth-Studio: referenciado en la model card por el commit 6b3c254, sin URL en la información disponible
- Resultados de búsqueda web: las únicas entradas devueltas fueron páginas generales de YouTube (youtube.com, play.google.com, accounts.google.com, tv.youtube.com), sin relación con el modelo; no se han encontrado papers, blogs ni demos adicionales.
