# LaLa-World/lala-policy-libero

## Resumen

LaLa-Policy (LIBERO) es un modelo de visión-lenguaje-acción (VLA) con componente de world model, publicado por LaLa-World en Hugging Face. Se construye sobre el modelo base `lala-world-siglip2-so400m`, que combina un encoder visual SigLIP2-So400M/14 con un predictor de 24 capas basado en Qwen3.5, y se ajusta fino para predecir de forma conjunta un fragmento de acciones (action chunk) y la representación visual futura del entorno. Las acciones se generan mediante una cabeza de flow-matching basada en el DiT de Isaac-GR00T.

El checkpoint `lala-policy-libero.pth.tar` está especializado en el benchmark LIBERO: se ha entrenado con las cuatro suites de tareas (replays del protocolo Cosmos Policy), usando dos vistas de cámara (agentview y wrist), fragmentos de 16 acciones y 8 épocas, con batch global de 256 sobre 8 GPU H100. La evaluación se realiza con el protocolo Cosmos Policy (4 suites x 10 tareas x 50 episodios) mediante los scripts del repositorio del proyecto.

Su relevancia es la de un artefacto de investigación: no es un modelo de propósito general ni un asistente conversacional, sino una política robótica de manipulación entrenada en simulación, útil como referencia para comparar arquitecturas VLA con world model y para reproducir experimentos en LIBERO. El repositorio no incluye resultados numéricos de benchmarks, licencia declarada ni documentación sobre cuantización o cobertura de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA con world model: encoder visual SigLIP2-So400M/14 + predictor de 24 capas Qwen3.5 + cabeza de acción flow-matching (DiT de Isaac-GR00T) |
| Parametros totales | no disponible (el encoder SigLIP2-So400M aporta aproximadamente 400 M; el tamaño del predictor Qwen3.5 de 24 capas no está publicado) |
| Parametros activos | no aplica (no se describe como modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye un único checkpoint en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de robótica; no se documenta cobertura lingüística) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pth.tar`) |

## Arquitectura y entrenamiento

LaLa-Policy sigue un esquema VLA con world model: recibe observaciones visuales de dos cámaras (agentview y muñeca), las codifica con un encoder SigLIP2-So400M/14, las procesa con un predictor transformer de 24 capas derivado de Qwen3.5 y emite dos salidas acopladas, un fragmento de 16 acciones generado por una cabeza de flow-matching (el DiT de Isaac-GR00T) y la representación visual del estado futuro. Esa predicción conjunta es lo que el autor denomina comportamiento de world model: además de actuar, el modelo anticipa cómo evolucionará la escena, y esas representaciones imaginadas pueden decodificarse a imágenes con `lala-decoder-siglip2-so400m.pt` para inspección cualitativa.

El ajuste fino parte del checkpoint `lala-world-siglip2-so400m` (campo `meta.init_from`) y se ejecuta sobre las cuatro suites de LIBERO usando replays del protocolo Cosmos Policy, con 8 épocas y batch global de 256 en 8 GPU H100. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de LIBERO, ni si se aplicaron etapas de RLHF o DPO (poco habituales en políticas robóticas). Tampoco se detalla la innovación de decodificación o el mecanismo de atención más allá de la descripción de los componentes.

## Capacidades

- Manipulación robótica de imitación: genera fragmentos de 16 acciones a partir de observaciones visuales y de la instrucción de la tarea.
- Predicción conjunta de representación visual futura (world model), decodificable a fotogramas con el decoder `lala-decoder-siglip2-so400m`.
- Entrada multimodal de dos vistas simultáneas: cámara de agente (agentview) y cámara de muñeca (wrist).
- Control continuo de acciones mediante flow-matching, no mediante tokens discretos.
- Ejecución del protocolo de evaluación Cosmos Policy sobre LIBERO (`run_libero_all.sh`), con 4 suites, 10 tareas por suite y 50 episodios por tarea.
- Soporte de tool calling / function calling: no disponible (no documentado; no aplicable al diseño de la política).
- Soporte de agentes y razonamiento multi-paso: no documentado como tal; el bucle de control es de predicción de acciones por paso.
- Capacidades multilingües: no disponible.
- Capacidades especiales: modo "thinking", visión general, audio o generación de texto libre no documentadas.

## Casos de uso

- Reproducción de experimentos en LIBERO: ejecutar `evals/lala_policy/run_libero_all.sh lala-policy-libero.pth.tar lala-policy-libero 50 16` para obtener la tasa de éxito en las cuatro suites y comparar con otras políticas publicadas bajo el mismo protocolo.
- Baseline para investigación en VLA con world model: usar el par acción + representación futura como referencia al evaluar arquitecturas alternativas de predicción conjunta, midiendo si el modelado del futuro mejora la tasa de éxito frente a políticas puramente reactivas.
- Estudio de representaciones imaginadas: decodificar los fotogramas que el modelo anticipa con `--save-imagine N --decoder-ckpt lala-decoder-siglip2-so400m.pt` y analizar la coherencia temporal de la predicción visual como señal diagnóstica de fallos.
- Prototipado de control con cámara de muñeca: aprovechar la entrada de vista wrist para tareas de precisión (agarre, inserción) en simulación antes de transferir el pipeline a un entorno real.
- Comparación de cabezas de acción: sustituir o reentrenar la cabeza flow-matching (DiT de Isaac-GR00T) manteniendo el backbone SigLIP2 + Qwen3.5, y medir el impacto en la tasa de éxito con el mismo protocolo de evaluación.
- Generación de datos sintéticos de entrenamiento: emplear las representaciones futuras decodificadas como rollouts imaginados para aumentar la diversidad de trayectorias en experimentos de imitación.
- Evaluación de robustez multi-suite: al cubrir las cuatro suites de LIBERO (objetos, espacial, meta y de largo horizonte), sirve para medir degradación por cambio de distribución dentro del mismo checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de evaluación (LIBERO, 4 suites x 10 tareas x 50 episodios, con replays de Cosmos Policy) y el comando para ejecutarlo, pero no incluye tasas de éxito ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- Entrenamiento documentado: 8 GPU H100 con batch global de 256 (dato aportado por el autor).
- VRAM de inferencia: no disponible de forma oficial. Como referencia orientativa a partir del tamaño del repositorio (5,2 GB): en torno a 6 GB solo para pesos en FP32 y aproximadamente 3 GB en FP16, a lo que hay que sumar activaciones de dos vistas de cámara y la decodificación del fragmento de 16 acciones. Cifra no confirmada por el autor.
- GPU recomendadas: no disponibles. Por el perfil del modelo (encoder de ~400 M más predictor de 24 capas), una GPU de centro de datos tipo A100/H100 es la opción segura para entrenamiento; para inferencia en simulación se requiere además ejecutar el simulador en paralelo.
- ¿Cabe en GPU de consumo? Previsiblemente sí en tarjetas con 12-24 GB (RTX 4090, RTX 3090) si los pesos se cargan en FP16 y el simulador se ejecuta de forma secuencial, pero no hay confirmación oficial ni cifras de memoria medidas.
- Despliegue: el repositorio usa PyTorch y scripts bash propios; los simuladores se instalan en entornos virtuales separados con `scripts/install_sim_envs.sh`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no es un modelo de texto generativo).
- Latencia y throughput: no disponibles. El coste dominante en evaluación es el paso del simulador, no solo la inferencia de la política.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LaLa-Policy (LIBERO) | no disponible (encoder ~400 M + predictor de 24 capas) | no disponible | VLA con world model y cabeza flow-matching | no disponible | Hugging Face (formato `.pth.tar`) |
| OpenVLA | 7 B (dato público del proyecto) | no disponible en esta ficha | VLA sobre backbone de lenguaje y tokens de acción discretos | MIT según el proyecto original (verificar) | Hugging Face |
| Isaac-GR00T (GR00T N1) | ~2,2 B (dato público del proyecto) | no disponible en esta ficha | VLA con DiT de acción, base del cabezal de LaLa-Policy | licencia del proyecto NVIDIA (verificar) | Hugging Face / GitHub |
| Octo | 93 M en la variante base (dato público del proyecto) | no disponible en esta ficha | política transformer de propósito general para manipulación | Apache 2.0 según el proyecto (verificar) | GitHub / Hugging Face |

Nota: los datos de los modelos comparables provienen de sus especificaciones públicas y deben verificarse en sus fichas originales; para LaLa-Policy no hay parámetros totales, contexto ni licencia publicados, y no se han divulgado resultados que permitan comparar tasas de éxito.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible afirmar su rendimiento en LIBERO ni compararlo con otras políticas sin ejecutar la evaluación.
- Licencia no disponible: no se puede asumir uso comercial; hay que contactar con el autor antes de cualquier despliegue en producto.
- Entrenado exclusivamente en simulación (LIBERO con replays de Cosmos Policy): el salto a robot real (sim2real) no está documentado ni validado.
- El world model puede generar representaciones futuras plausibles pero incorrectas; las imágenes decodificadas pueden inducir a error si se interpretan como predicciones fiables.
- Idiomas no documentados: se desconoce si las instrucciones de tarea están restringidas a inglés o a un vocabulario concreto de LIBERO.
- Sin información sobre cuantización ni formatos alternativos: el único artefacto es `.pth.tar`, lo que limita su uso en stacks de inferencia optimizados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Dependencia de entornos de simulación con versiones específicas (entornos virtuales separados), lo que complica la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LaLa-World/lala-policy-libero
- Repositorio del proyecto: https://github.com/junha1125/LaLa-World
- Instrucciones de evaluación de la política: https://github.com/junha1125/LaLa-World/blob/main/evals/lala_policy/README.md
- Decoder de representaciones imaginadas: https://huggingface.co/LaLa-World/lala-decoder-siglip2-so400m
- Checkpoint para RoboCasa 50: https://huggingface.co/LaLa-World/lala-policy-robocasa50
- Checkpoint para RoboCasa 300: https://huggingface.co/LaLa-World/lala-policy-robocasa300
- Cabeza de acción de referencia (Isaac-GR00T): https://github.com/NVIDIA/Isaac-GR00T
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las entradas devueltas (Lalalab, Lala &ce, plugins de audio) no guardan relación con el proyecto.
