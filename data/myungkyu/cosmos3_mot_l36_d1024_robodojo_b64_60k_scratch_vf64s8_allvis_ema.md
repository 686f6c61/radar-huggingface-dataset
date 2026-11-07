# Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_vf64s8_allvis_ema

## Resumen

`cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_vf64s8_allvis_ema` es un modelo de política de acción para control robótico en bucle cerrado, construido a partir de Cosmos3-Nano, un modelo de mundo de vídeo, y ajustado con un DiT de acción externo. Lo publica el usuario Myungkyu en Hugging Face bajo la librería `cosmos-framework`. El modelo combina un backbone de vídeo con un módulo de acción que condiciona la generación de acciones sobre representaciones visuales, siguiendo un esquema de condicionamiento unidireccional vídeo-a-acción con un calendario de acción compartido.

El ajuste se ha realizado sobre RoboDojo Sim en formato LeRobot v3.0, con un total de 60 000 pasos de entrenamiento y un tamaño de lote de 64. Los pesos publicados corresponden a la media móvil exponencial (EMA) del checkpoint final, convertidos a bf16 y almacenados bajo los nombres `net.*` en un checkpoint distribuido de rango único (DCP) de PyTorch. El repositorio ocupa 32 GB e incluye la configuración de entrenamiento y sumas de verificación SHA-256.

La relevancia de este modelo radica en su enfoque híbrido: emplea un modelo de mundo de vídeo como representación latente para derivar acciones de control, lo que permite razonar sobre dinámicas visuales antes de actuar. No obstante, se trata de un artefacto de investigación con cero descargas y sin model card extendida, por lo que su evaluación pública es prácticamente inexistente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de mundo de vídeo Cosmos3-Nano con DiT de acción externo (condicionamiento vídeo-a-acción unidireccional) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | DCP (torch.distributed.checkpoint) con claves `net.*`; requiere `config.yaml` y `Wan2.2_VAE.pth` |

## Arquitectura y entrenamiento

El modelo parte de Cosmos3-Nano, un modelo de mundo de vídeo, y le acopla un DiT de acción externo. El condicionamiento es unidireccional: la información visual fluye hacia el módulo de acción, que comparte el calendario de difusión con el backbone de vídeo. El nombre del checkpoint sugiere una configuración con 36 capas y dimensión oculta de 1024 (`l36_d1024`), aunque no se detalla la arquitectura interna completa. La variante `vf64s8` y el sufijo `allvis` apuntan a ajustes específicos de resolución o visibilidad de frames, sin documentación pública al respecto.

El entrenamiento se realizó desde cero (`scratch`) sobre RoboDojo Sim en formato LeRobot v3.0, con 60 000 pasos y lote de 64. Los pesos publicados son los de la EMA del checkpoint final, en bf16, sin estado del optimizador. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El modelo requiere el VAE de Wan2.2 (Wan-AI/Wan2.2-TI2V-5B) para funcionar, lo que indica que la representación visual se apoya en el espacio latente de dicho VAE.

## Capacidades

- Control robótico en bucle cerrado: genera acciones a partir de observaciones visuales y el estado del robot.
- Condicionamiento vídeo-a-acción: utiliza representaciones de un modelo de mundo de vídeo para derivar políticas de acción.
- Integración con el servidor de políticas de `cosmos-framework` mediante `--checkpoint-path` y `--config-file`.
- Ajuste específico sobre RoboDojo Sim, un entorno de simulación para tareas de manipulación robótica.
- Soporte de formato LeRobot v3.0 para datos de entrenamiento y evaluación.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en políticas visomotoras: el modelo sirve como referencia para estudiar cómo un modelo de mundo de vídeo puede guiar la generación de acciones en tareas de manipulación simuladas.
- Evaluación en RoboDojo Sim: permite reproducir experimentos de control en bucle cerrado dentro del simulador con el que fue entrenado, usando el servidor de políticas de `cosmos-framework`.
- Comparación de variantes de condicionamiento: al existir checkpoints hermanos (`decoupled`, `cps`), facilita estudios ablativos sobre el esquema de condicionamiento vídeo-a-acción.
- Prototipado de pipelines de robótica con LeRobot: su formato de datos y su integración con el framework permiten incorporarlo a flujos de entrenamiento y evaluación existentes en LeRobot v3.0.
- Base para fine-tuning en dominios específicos: al publicarse los pesos EMA en bf16 sin estado del optimizador, puede reutilizarse como inicialización para ajustes posteriores en otros entornos simulados.
- Docencia y experimentación académica: útil para ilustrar la combinación de modelos de mundo de vídeo con políticas de acción en cursos de robótica o aprendizaje por refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 32 GB en bf16, por lo que se requiere al menos una GPU con 32 GB o más para cargar los pesos completos sin cuantización.
- GPU recomendadas: no documentadas por el autor; por tamaño, una A100 de 40/80 GB o una H100 son opciones razonables, aunque no confirmadas.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen; una RTX 4090 de 24 GB no podría cargar los 32 GB en bf16 sin cuantización o descarga por capas.
- Opciones de despliegue: servidor de políticas de `cosmos-framework` (`--checkpoint-path` y `--config-file`), con dependencia del VAE de Wan2.2 (`Wan2.2_VAE.pth`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_vf64s8_allvis_ema` | no disponible | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| `cosmos3_mot_l36_d1024_robodojo_decoupled_b64_60k_scratch_ema` | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| `cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_cps_ema` | no disponible | no disponible | no disponible | no disponible | Hugging Face |

Las tres variantes comparten la misma base (Cosmos3-Nano con DiT de acción externo) y el mismo dataset (RoboDojo Sim), diferenciándose en el esquema de condicionamiento o en detalles del entrenamiento. No se dispone de datos de rendimiento comparativo entre ellas ni frente a modelos de política robótica de otros autores.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución.
- Sin model card extendida ni documentación de sesgos, alucinación o limitaciones idiomáticas.
- Entrenado exclusivamente en RoboDojo Sim: es probable que no generalice a entornos reales sin un ajuste adicional, aunque esto no está documentado.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- Dependencia obligatoria del VAE de Wan2.2 (`Wan2.2_VAE.pth`), lo que añade un requisito externo y un posible cuello de botella en el despliegue.
- Pesos en DCP de rango único sin estado del optimizador: no es un formato directamente cargable por herramientas estándar como vLLM, llama.cpp u Ollama.
- El nombre del checkpoint incluye configuraciones (`vf64s8`, `allvis`) no explicadas en la información disponible, lo que dificulta reproducir exactamente el entrenamiento.
- No hay benchmarks publicados, por lo que no se puede evaluar su rendimiento frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_vf64s8_allvis_ema
- Variante decoupled: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_decoupled_b64_60k_scratch_ema
- Variante cps: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_cps_ema
- VAE de referencia (Wan2.2): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
