# Myungkyu/rldx2_smoke_rldx_robotwin_ckpt200

## Resumen

`Myungkyu/rldx2_smoke_rldx_robotwin_ckpt200` es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario Myungkyu como *baseline* del proyecto RLDX-2. Se trata de un ajuste fino del modelo base `RLWRLD/RLDX-1-PT` sobre el conjunto de datos `TianxingChen/RoboTwin2.0`, en la configuración de *co-train* del leaderboard de RoboTwin 2.0 (50 tareas x 50 episodios `demo_clean`, con el robot Aloha-AgileX y exportación oficial en formato LeRobot).

El modelo recibe tres vistas de cámara (cabeza, muñeca izquierda y muñeca derecha), un vector de estado articular de 14 dimensiones y la instrucción de la tarea en lenguaje natural, y produce como salida 14 objetivos articulares absolutos. Cuenta con 6.912.896.320 parámetros totales y un repositorio de 13,8 GB en formato `safetensors`.

Su relevancia es acotada y experimental: es un punto de referencia reproducible para investigar el ajuste de políticas VLA en simulación, no un modelo listo para producción. El entrenamiento es deliberadamente corto (200 pasos de optimizador, batch 128) y el propio autor lo etiqueta como *smoke* / *vanilla baseline* del proyecto RLDX-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) sobre el backbone RLDX-1-PT; tipo de red subyacente (transformer, MoE, hibrida) no disponible |
| Parametros totales | 6.912.896.320 (~6,91 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio publicado unicamente en `safetensors`) |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en lenguaje natural, idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Ventana de video | 4 fotogramas, stride 2 |
| Vistas de camara | 3 (cabeza + muñeca izquierda + muñeca derecha) |
| Horizonte de accion | 50 |
| Dimension de estado/accion | 14 (estado articular de entrada, objetivos articulares absolutos de salida) |
| Modelo base | RLWRLD/RLDX-1-PT |
| Dataset de ajuste | TianxingChen/RoboTwin2.0 |
| Tamano del repositorio | 13,8 GB |

## Arquitectura y entrenamiento

El modelo parte del backbone `RLWRLD/RLDX-1-PT`, un VLA preentrenado que procesa secuencias de vídeo cortas (4 fotogramas con stride 2) junto con tres vistas de cámara, un vector de estado propioceptivo y una instrucción textual. Sobre esa base, el ajuste fino añade dos mecanismos de regularización descritos en la model card: enmascarado de ruido por dimensión de padding (`action_noise_mask_dim=14`) y *state dropout* con probabilidad 0,5. La cabeza de acción predice 14 objetivos articulares absolutos con un horizonte de 50 pasos. El autor no detalla el número de capas, la dimensión oculta, el mecanismo de atención ni el esquema de fusión entre visión y lenguaje, por lo que esos extremos quedan como no disponibles.

El entrenamiento es un *smoke test* de 200 pasos de optimizador con batch de 128 sobre la configuración co-train de RoboTwin 2.0 (50 tareas x 50 episodios `demo_clean`, robot Aloha-AgileX, exportación oficial de LeRobot). No se menciona uso de RLHF, DPO ni ningún otro esquema de alineación por preferencias, algo esperable en un modelo de control robótico. El código empleado corresponde a `RLWRLD/RLDX` en la revisión `myungkyu/jitter-patch 21f674b4`. El checkpoint publicado es el final del entrenamiento y no incluye el estado del optimizador.

## Capacidades

- Generación de acciones motoras: predice 14 objetivos articulares absolutos a partir de observación visual y estado propioceptivo.
- Percepción visual multi-cámara: consume simultáneamente vistas de cabeza y de ambas muñecas.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica como texto, no como identificador de política.
- Manipulación bimanual en el robot Aloha-AgileX (configuración objetivo del dataset RoboTwin 2.0).
- Ejecución de tareas de manipulación en simulación dentro del benchmark RoboTwin 2.0 (50 tareas de la configuración de referencia).
- Ajuste fino posterior: al ser un *baseline* sobre LeRobot, sirve como punto de partida para entrenamientos adicionales.
- No hay evidencia en la información disponible de soporte de *tool calling*, function calling, razonamiento multi-paso agéntico, capacidades multilingües, audio ni modo de pensamiento explícito.

## Casos de uso

- Reproducción de la línea base del leaderboard de RoboTwin 2.0: sirve para fijar el punto de comparación en la configuración co-train (50 tareas x 50 episodios `demo_clean`) antes de introducir mejoras en el pipeline de entrenamiento.
- Ablaciones de regularización en políticas VLA: permite medir el efecto de `action_noise_mask_dim=14` y del *state dropout* de 0,5 frente a configuraciones sin enmascarado ni dropout.
- Validación de infraestructura de entrenamiento antes de lanzar *runs* largos: al ser un *smoke test* de 200 pasos, verifica que la carga de datos LeRobot, el exportador de RoboTwin 2.0 y el *backbone* RLDX-1-PT se integran correctamente.
- Punto de partida para ajuste fino en dominios propios: un equipo con un conjunto de demostraciones en Aloha-AgileX puede continuar el entrenamiento desde este checkpoint en lugar de partir del modelo preentrenado.
- Evaluación de robustez visual multi-cámara: las tres vistas (cabeza y ambas muñecas) permiten estudiar hasta qué punto la política depende de cada cámara ante oclusiones.
- Desarrollo de *adapters* de evaluación: el autor referencia adaptadores en `ops/eval/xpl`, útiles para construir y depurar arneses de evaluación de políticas robóticas.
- Investigación sobre horizonte de acción: con horizonte 50 y salida de 14 dimensiones absolutas, es adecuado para estudiar compromisos entre frecuencia de replanificación y estabilidad del control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe la configuración de entrenamiento (200 pasos, batch 128) y la pertenencia al leaderboard de RoboTwin 2.0, sin incluir tasas de éxito ni métricas por tarea. Las búsquedas web asociadas a este modelo no devolvieron documentación técnica relevante (los resultados obtenidos corresponden a calculadoras aritméticas sin relación con el modelo), por lo que no se dispone de cifras verificables.

## Requisitos de hardware

- Peso en precisión completa (FP16/BF16): aproximadamente 13,8 GB de pesos, coherente con el tamaño del repositorio. La VRAM necesaria para inferencia será superior al sumar activaciones, codificadores de imagen y búferes de vídeo.
- Cuantización a 8 bits: estimación de ~7 GB solo en pesos.
- Cuantización a 4 bits: estimación de ~3,5 GB solo en pesos. No se han publicado cuantizaciones oficiales en el repositorio.
- GPU profesionales: A100 (40/80 GB), H100, L40S o A6000 son opciones holgadas para FP16.
- GPU de consumo: una RTX 4090 (24 GB) o RTX 3090 (24 GB) debería poder cargar el modelo en FP16 o BF16, aunque sin margen amplio; una RTX 4080 (16 GB) requeriría cuantización.
- Opciones de despliegue: no se documentan en la model card. Al publicarse en `safetensors` y estar vinculado al ecosistema LeRobot, el despliegue pasaría por herramientas propias del proyecto RLDX / LeRobot; vLLM, llama.cpp, Ollama y TGI no están pensados para políticas VLA con salida continua y no se mencionan como soportadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados de alternativas dentro de la información proporcionada. La comparativa siguiente es orientativa y las cifras de los modelos ajenos a esta ficha provienen de conocimiento general, no de las fuentes consultadas en esta búsqueda.

| Modelo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|
| rldx2_smoke_rldx_robotwin_ckpt200 | ~6,91 mil millones | horizonte de accion 50; ventana de video 4; contexto textual no disponible | no disponible | HuggingFace, safetensors |
| RLWRLD/RLDX-1-PT (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | HuggingFace |
| OpenVLA (referencia de la categoria VLA de 7B) | ~7 mil millones (dato externo no verificado aqui) | no disponible | no disponible | HuggingFace |
| Otros VLA de manipulacion (pi0, GR00T N1) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenamiento mínimo: 200 pasos de optimizador con batch 128. Es un *smoke test*, no un modelo convergido; no debe esperarse un rendimiento competitivo en tareas reales.
- Dominio restringido: solo se ha ajustado sobre RoboTwin 2.0 en simulación con el robot Aloha-AgileX. La transferencia a hardware físico o a otras morfologías no está validada.
- Sesgos: no disponibles. No se documenta análisis de sesgo, y en modelos de control robótico el sesgo relevante suele aparecer como sobreajuste a las condiciones de iluminación, texturas y distribuciones de objetos del simulador.
- Riesgo de alucinación: aplicable en la práctica como generación de trayectorias plausibles pero inválidas cuando la observación se aleja de la distribución de entrenamiento. No hay evaluación publicada al respecto.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto ni los idiomas aceptados en las instrucciones de tarea.
- Licencia no disponible: sin licencia declarada, no puede asumirse permiso de uso comercial. Conviene contactar con el autor antes de cualquier uso en producción.
- Exclusión del estado del optimizador: el checkpoint no incluye el estado del optimizador, lo que complica reanudar el entrenamiento de forma exacta.
- Entorno experimental: el código de referencia apunta a una revisión concreta con un parche (`myungkyu/jitter-patch 21f674b4`); reproducir los resultados exige fijar esa revisión.
- Artefacto con 0 descargas y 0 *likes*: no existe validación por parte de la comunidad ni informes independientes de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/rldx2_smoke_rldx_robotwin_ckpt200
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT
- Dataset de entrenamiento: https://huggingface.co/datasets/TianxingChen/RoboTwin2.0
- Repositorio RLDX-2 (adaptadores de evaluacion): https://github.com/myungkyuKoo/RLDX-2
- Codigo base citado en la model card: `RLWRLD/RLDX`, revision `myungkyu/jitter-patch 21f674b4`
- Paper, blog o demo oficiales: no disponibles en la informacion proporcionada.
