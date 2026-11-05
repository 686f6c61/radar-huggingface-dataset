# RainyBot/SemWAM-LIBERO-Legacy-colormap-sem-step21700

## Resumen

SemWAM-LIBERO-Legacy-colormap-sem-step21700 es un checkpoint histórico de investigación publicado por el usuario RainyBot en HuggingFace. Se trata de un modelo de robótica entrenado sobre el benchmark LIBERO, orientado a la manipulación robótica mediante un paradigma de world model (SemWAM) que combina un modelo de difusión de vídeo como base con codificadores semánticos y de profundidad congelados. El checkpoint corresponde al paso de optimizador final 21700/21700 de una ejecución cuyo config resuelto se archiva junto al modelo.

El modelo parte de Wan-AI/Wan2.2-TI2V-5B como backbone de difusión de vídeo, con una arquitectura etiquetada como "dep_sem" que fusiona características semánticas de DINOv3 ViT-B/16 (768 dimensiones) en las capas 7 y 23, y utiliza representación de profundidad en formato colormap (paleta turbo) estimada con un backbone ViT-B de profundidad. La entrada sigue el paradigma "t_concat" con layout de vistas "libero_horizontal" y vistas de muñeca de 128x160 píxeles.

Su relevancia es fundamentalmente archivística: se publica byte a byte el checkpoint original pre-v2, sin checkpoint_version=2 ni inference_config, y el autor advierte explícitamente de que no es compatible con el evaluador SemWAM v2 actual. No es un modelo listo para producción ni para uso directo con herramientas modernas; requiere la implementación histórica y el config original para poder cargarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | dep_sem (world model de difusión de vídeo con fusión semántica y de profundidad); backbone Wan2.2-TI2V-5B |
| Parametros totales | no disponible (repo de 12.1 GB; pesos en bfloat16) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en torch.bfloat16) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas declaradas) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (state dict nativo, sin versión de checkpoint v2); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura combina un difusión transformer de vídeo (Wan2.2-TI2V-5B) con atención de máscara "first_frame_causal" y sin condicionamiento de acción explícito en la configuración de vídeo (action_conditioned: false). Sobre esta base se inyectan características semánticas procedentes de un DINOv3 ViT-B/16 congelado (feat_dim 768), fusionadas en las capas 7 y 23 del transformer, con pooling temporal de tipo media. La profundidad se representa como colormap (paleta turbo, rango 0.1-2.0 m) estimada por un backbone ViT-B de profundidad (vda, input 518), con pointmap normalizado en x,y ∈ [-0.6, 0.6] y z ∈ [0, 1.5], y profundidad máxima de 2.0 m. Las intrínsecas se derivan automáticamente según la vista (fovy 37° para vistas simuladas 480x640, 45° para imagen 224x224, 75° para imagen de muñeca 224x224).

El entrenamiento se realizó sobre el benchmark LIBERO con vistas horizontales y dos cámaras de muñeca (left, right) de 128x160 píxeles, que no atienden al vídeo (attends_video: false). La dimensión de propiocepción es 8. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicó RLHF o DPO; el config archivado indica explícitamente que los campos ausentes son desconocidos y que los valores nulos no equivalen a falsos. La revisión del código fuente original de entrenamiento es desconocida.

## Capacidades

- Generación de trayectorias de manipulación robótica en entornos LIBERO, condicionada por observaciones visuales multimodales (vistas horizontales y de muñeca) y propiocepción de 8 dimensiones.
- Modelado de world model de vídeo: predice dinámica visual futura como parte del proceso de difusión, lo que permite razonamiento sobre consecuencias de acciones.
- Fusión de representaciones semánticas de alto nivel (DINOv3) con representaciones geométricas de profundidad (colormap), orientada a comprensión espacial de la escena.
- Soporte de múltiples vistas de cámara simultáneas (left, right, high) con intrínsecas configurables.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, razonamiento textual, código, matemáticas ni multilingüismo.
- No se declaran modos de pensamiento (thinking), visión general, audio ni otras modalidades fuera del ámbito robótico.

## Casos de uso

- Investigación en world models para robótica: permite reproducir experimentos del checkpoint histórico en el benchmark LIBERO con la implementación original, útil para estudios de ablación sobre fusión semántica y de profundidad.
- Evaluación comparativa de representaciones: al usar DINOv3 ViT-B/16 y profundidad colormap, sirve para contrastar el impacto de estas representaciones frente a otras variantes del mismo proyecto SemWAM.
- Reproducibilidad de resultados publicados: al publicarse el paso final 21700/21700 con logs de finalización verificados, permite auditar el entrenamiento y validar conclusiones de trabajos previos.
- Estudio de paradigmas de condicionamiento de entrada: el formato "t_concat" con layout "libero_horizontal" es un caso concreto para analizar cómo afecta la concatenación temporal a la política aprendida.
- Base para destilación o adaptación: el checkpoint puede servir como punto de partida para ajuste fino en tareas de manipulación con configuraciones compatibles, siempre que se use la implementación histórica.
- Docencia y formación en robótica basada en aprendizaje: ejemplo realista de pipeline completo (vídeo-difusión + semántica + profundidad) para cursos avanzados de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 12.1 GB en bfloat16; se requiere al menos esa cantidad de VRAM para cargar los pesos, más el overhead de activaciones y del codificador semántico y de profundidad, por lo que en la práctica se recomienda 24 GB o más.
- GPU recomendadas: A100 (40/80 GB) o H100 para ejecución cómoda con margen; RTX 4090 (24 GB) podría ser suficiente para inferencia en bfloat16, aunque no se dispone de mediciones confirmadas.
- Cabe en consumer GPU: probablemente en RTX 4090 y RTX 3090 (24 GB), no así en GPUs de 16 GB o menos sin cuantización, y no se documentan opciones de cuantización.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de robótica con implementación histórica propia, requiere el código original del proyecto SemWAM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SemWAM-LIBERO-Legacy-colormap-sem-step21700 | no disponible (repo 12.1 GB) | no disponible | no disponible | no disponible | HuggingFace, checkpoint histórico |
| Wan-AI/Wan2.2-TI2V-5B | ~5B (según nombre) | no disponible | no disponible | no disponible | HuggingFace |
| Otros checkpoints SemWAM v2 | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría (políticas robóticas para LIBERO). La comparación con Wan2.2-TI2V-5B es únicamente de base arquitectónica, no de rendimiento.

## Limitaciones y advertencias

- Checkpoint histórico sin checkpoint_version=2 ni inference_config: no es compatible con el evaluador SemWAM v2 actual; requiere la implementación y el config históricos.
- No es una release migrada ni una afirmación de compatibilidad con la evaluación actual; el autor lo declara explícitamente como archivo.
- La revisión del código fuente original de entrenamiento es desconocida, lo que dificulta la reproducibilidad exacta.
- Licencia no disponible: no se puede asumir uso comercial permitido; es necesario contactar con el autor.
- Modelo específico para robótica en LIBERO; no soporta tareas de lenguaje, código ni razonamiento general.
- Riesgo de sobreajuste al benchmark LIBERO y a las condiciones de simulación (intrínsecas, resoluciones y vistas fijas).
- Sin datos de sesgos, alucinación o robustez fuera de distribución; no apto para producción sin validación adicional.
- El tamaño del repo (12.1 GB) y la ausencia de cuantizaciones documentadas limitan el despliegue en hardware modesto.

## Enlaces

- HuggingFace: https://huggingface.co/RainyBot/SemWAM-LIBERO-Legacy-colormap-sem-step21700
- Modelo base referenciado: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales.
