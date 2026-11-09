# Dvidia/piper-reference-actions-v01

## Resumen

DVIDIA PiPER reference actions v0.1 es un repositorio de investigación publicado por Dvidia que contiene dos candidatos de política de control robótico entrenados mediante imitación sobre 96.000 filas de demostraciones sincronizadas en simulación. No es un modelo de lenguaje ni un transformer: se trata de dos artefactos compactos en formato JSON (539.345 y 538.021 bytes) que implementan una política de referencia cámara-acción para el brazo robótico PiPER, ejecutable en CPU con NumPy. El autor los publica explícitamente como candidatos de investigación no cualificados, junto con sus resultados negativos.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de publicación de resultados negativos con evidencia reproducible: ambos candidatos lograron 0/4 colocaciones estrictas en el smoke test nativo de desarrollo, y el autor conserva tanto los modelos como el diagnóstico de fallo. Por otro, ejemplifica un formato de artefacto de aprendizaje por imitación robótico empaquetado como JSON con contrato de entrada estricto, en lugar de pesos en safetensors o GGUF.

El modelo se entrenó en unos 5 segundos en el host de medición y pasa comprobaciones de paridad de replay guardado/cargado (1.000/1.000 salidas idénticas), pero no completa el ciclo de agarre, elevación y transporte requerido. La licencia es MIT, aunque las etiquetas del repositorio incluyen `research-only` y el autor declara explícitamente que no está listo para robot físico ni cualificado como skill.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de referencia cámara-acción con dos capas densas tanh de 64 unidades (perceptrón multicapa), implementada en NumPy; no es un transformer |
| Parametros totales | No disponible (el autor no publica recuento de parámetros; el artefacto pesa 539.345 bytes en JSON para la variante absoluta y 538.021 bytes para la delta) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como ventana de tokens; el contrato de entrada exige contexto causal exacto de cámara/encoder, ancla visual inicial histórica, 160 ms de historial, máscaras de disponibilidad y una referencia de servo previa en float64 |
| Tipos de cuantizacion | No disponible (pesos en JSON de precisión nativa; no se documentan variantes cuantizadas) |
| Idiomas soportados | Inglés (metadatos y documentación); el artefacto no procesa lenguaje natural |
| Licencia | MIT, con etiqueta `research-only` en el repositorio |
| Formato de pesos | JSON (`models/absolute/model.json` y `models/delta/model.json`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

Cada candidato es una red de dos capas densas con activación tanh y 64 unidades por capa, entrenada con semilla 17, 50 épocas, batch de 512 y optimizador Adam con tasa 0,003. El entrenamiento usó exactamente 64.000 filas de simulación con profesor autorado más 32.000 filas previas de corrección de control mixto, sumando 96.000 filas sincronizadas. El ajuste completo, incluyendo validación y normalización, tardó 5,230713 s en la variante absoluta (Cabs) y 5,097628 s en la variante de delta respecto a referencia previa (Cdelta) sobre un host macOS 26.5.2 arm64 compartido, con Python 3.12.9, NumPy 2.5.3, MuJoCo 3.15.0 y 1 hilo BLAS declarado.

La innovación metodológica no está en la arquitectura, sino en el contrato de entrada y en la trazabilidad: la política `policy(context)` exige el contexto causal exacto del grabador, incluida la referencia de servo previa retenida en float64 desde el reset registrado; una imagen o un vector de articulaciones arbitrarios no satisfacen el contrato. El autor liga el caché padre y las identidades exactas de referencia previa y objetivo factible en un recibo de identidad de entrada de entrenamiento. No se redistribuyen vídeos crudos ni arrays de entrenamiento derivados. No se documenta RLHF ni DPO; el paradigma es imitación supervisada desde profesor.

## Capacidades

- Generación de acciones de control para el brazo PiPER en simulación MuJoCo a partir de contexto visual y proprioceptivo, con dos variantes: referencia absoluta (Cabs) y delta respecto a referencia previa (Cdelta).
- Replay determinista guardado/cargado: 1.000/1.000 salidas idénticas en ambos candidatos, lo que valida la integración de serialización e inferencia.
- Ejecución en CPU con NumPy, sin GPU, con callback nativo (incluyendo guardia de disco) de p95 0,295460 ms en Cabs y 0,284297 ms en Cdelta.
- Frontera offline completa con p95 de 22,362537 ms (Cabs) y 22,049043 ms (Cdelta), incluyendo escrituras de fichero y trabajo de cámara alternativo mientras el simulador se pausa.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: no es un modelo de lenguaje.
- No hay modo thinking, visión general, audio ni recuperación de skills desde vídeo arbitrario.

## Casos de uso

- Reproducción de experimentos de aprendizaje por imitación en robótica: el repositorio permite cargar los candidatos, inspeccionar `task_qualified` y `physical_robot_ready` (ambos `False`) y replicar el pipeline de ajuste con la revisión de código fijada, útil para grupos que estudian resultados negativos publicados.
- Auditoría de contratos de entrada en políticas robóticas: sirve como ejemplo de especificación estricta de contexto (ancla visual histórica, 160 ms de historial, máscaras de disponibilidad, referencia de servo en float64) para diseñar interfaces de inferencia robustas.
- Benchmark de infraestructura de simulación: los datos de callback nativo y frontera offline permiten calibrar el coste de integración en MuJoCo con guardias de disco y trabajo de cámara, no como garantía de tiempo real a 50 Hz.
- Estudio de fallos en manipulación bimanual: el diagnóstico de fallo documenta que 7 de 8 episodios nunca alcanzaron el levantamiento bilateral sostenido libre de mesa, y que las 4 trayectorias delta cruzaron el envolvente finito de coordenadas TCP de ±0,5 m del scorer estricto.
- Docencia sobre publicación de resultados negativos: el repositorio conserva 16 rechazos de infraestructura previos (8 en la guardia de importación del wrapper, 8 en la inicialización de CoreGraphics) y advierte de no agruparlos en una puntuación de manipulación 0/24.
- Validación de paridad de serialización: el chequeo de 1.000/1.000 salidas idénticas sirve como plantilla para verificar que un artefacto guardado reproduce fielmente la inferencia original antes de desplegarlo en cualquier pipeline.

## Benchmarks y rendimiento

| Medición | Cabs (referencia absoluta) | Cdelta (delta respecto a referencia previa) |
|---|---:|---:|
| Filas de entrenamiento | 96.000 | 96.000 |
| Tiempo de ajuste en host compartido | 5,230713 s | 5,097628 s |
| Tamaño del JSON del modelo | 539.345 bytes | 538.021 bytes |
| Paridad de replay guardado | 1.000/1.000 idénticas | 1.000/1.000 idénticas |
| Episodios nativos de desarrollo completos | 4/4 | 4/4 |
| Colocaciones estrictas | 0/4 | 0/4 |
| Contacto de agarre bilateral observado | 3/4 | 4/4 |
| Levantamiento cualificado observado | 1/4 | 0/4 |
| Transporte completado | 0/4 | 0/4 |
| Episodios con contactos inesperados | 2/4 | 4/4 |
| Ticks nativos con contacto inesperado | 7.606 | 19.751 |
| Callback nativo con guardia de disco, p95 | 0,295460 ms | 0,284297 ms |
| Frontera offline completa, p95 | 22,362537 ms | 22,049043 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el artefacto no es un modelo de lenguaje. La cobertura visual de las estimaciones fue del 59,9 % de las decisiones en Cabs y del 53,7 % en Cdelta, con intervalos máximos de ausencia de 13,36 s y 6,16 s respectivamente; el autor advierte que son observaciones de cuatro casos por candidato, no un diagnóstico causal ni una clasificación estadística.

## Requisitos de hardware

- Inferencia en CPU con NumPy; no requiere GPU. El pico de RSS del proceso de integración completo fue de 1.345.404.928 bytes, cifra que el autor aclara que no es una asignación solo del modelo ni un requisito mínimo de hardware.
- GPU recomendadas: no aplica; no se documenta soporte GPU ni despliegue en A100, H100 o RTX 4090.
- Cabe en cualquier máquina capaz de ejecutar Python 3.12.9 con NumPy 2.5.3; el cuello de botella es la simulación MuJoCo 3.15.0, no el modelo.
- Opciones de despliegue: API Python personalizada mediante `dvidia_training.camera_action_reference_model`, instalada desde la revisión fijada `78ea4fbb4b2733e7738eb425eeecd7cb67a52195` del repositorio de GitHub. No es compatible con vLLM, llama.cpp, Ollama ni TGI, y el instalador CLI de skills cualificadas no maneja el nuevo formato de modelo.
- Latencia: callback nativo p95 por debajo de 0,3 ms; frontera offline p95 de 22 ms, que el autor advierte explícitamente que no constituye una garantía de tiempo real a 50 Hz. El renderizador reportó una limitación de precisión de profundidad por falta de `ARB_clip_control`, sin calibración de profundidad establecida.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| DVIDIA PiPER reference actions v0.1 (Cabs/Cdelta) | MLP de 2 capas tanh de 64 unidades, NumPy | No disponible | Contrato causal con 160 ms de historial | MIT con etiqueta research-only | 0/4 colocaciones estrictas; no cualificado |
| Política v0.1 congelada del mismo autor (referencia) | Política aprendida previa | No disponible | No disponible | No disponible | 5/64 colocaciones estrictas aprendidas, no cualificada |
| Otros modelos de robótica en Hugging Face con pipeline `robotics` | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de comparadores externos con datos verificables en la información proporcionada; el único punto de comparación documentado es la política congelada v0.1 del propio autor, que el repositorio cita como referencia de 5/64 colocaciones estrictas sin cualificar.

## Limitaciones y advertencias

- Ambos candidatos lograron 0/4 colocaciones estrictas; ninguno completó el transporte ni siete de los ocho episodios alcanzaron el levantamiento bilateral sostenido libre de mesa exigido.
- Las cuatro trayectorias de la variante delta cruzaron el envolvente finito de coordenadas TCP de ±0,5 m del scorer estricto; el autor aclara que no fue un NaN ni una advertencia del solver.
- La variante delta registró 19.751 ticks nativos con contacto inesperado frente a 7.606 de la absoluta, y 4/4 episodios con contactos inesperados frente a 2/4.
- El modelo no está cualificado como skill ni listo para robot físico: `task_qualified` y `physical_robot_ready` son `False` en el artefacto.
- El contrato de entrada es estricto: exige el contexto causal exacto del grabador, ancla visual inicial histórica, 160 ms de historial, máscaras de disponibilidad y referencia de servo previa en float64 desde el reset registrado; una imagen o un vector de articulaciones arbitrarios no son válidos.
- La cobertura visual fue parcial (59,9 % en Cabs, 53,7 % en Cdelta) con intervalos de ausencia de hasta 13,36 s, lo que limita la fiabilidad en tramos sin estimación.
- Los 16 rechazos de infraestructura previos no deben agruparse en una puntuación de manipulación 0/24; corresponden a la guardia de importación y a la inicialización de CoreGraphics.
- No se reclama recuperación de skills desde vídeo arbitrario, transferencia a otro brazo, cualificación en hardware, puerta de release, suite de control negativo ni superioridad frente a comparadores.
- La pantalla de 164 intentos propuesta sigue sin ejecutarse y la v0.1 congelada permanece en 5/64 colocaciones estrictas aprendidas, sin cualificar.
- Aunque la licencia es MIT, la etiqueta `research-only` y las advertencias del autor desaconsejan cualquier uso en producción o en robótica física sin cualificación adicional.
- Riesgo de alucinación y sesgos: no aplica en el sentido de modelos de lenguaje, pero existe riesgo de extrapolación indebida si se usa el artefacto fuera del contrato de entrada y del entorno de simulación medido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Dvidia/piper-reference-actions-v01
- Model card de la variante absoluta: `models/absolute/README.md` (dentro del repositorio)
- Model card de la variante delta: `models/delta/README.md` (dentro del repositorio)
- Data card: `data/README.md` (dentro del repositorio)
- Auditoría nativa del smoke test: `evidence/native-smoke-v3-audit.json` (dentro del repositorio)
- Diagnóstico de fallo: `evidence/native-smoke-diagnosis.json` (dentro del repositorio)
- Contabilidad de todos los lotes: `evidence/development-smoke-status.json` (dentro del repositorio)
- Preflight de gráficos: `evidence/graphics-preflight.json` (dentro del repositorio)
- Recibo de identidad de entrada de entrenamiento: `evidence/training-input-identity.json` (dentro del repositorio)
- Código fuente de entrenamiento: https://github.com/Dvidia-Inference/dvidia-training (revisión fijada `78ea4fbb4b2733e7738eb425eeecd7cb67a52195`)
- Informe de investigación: https://research.dvidia.org/papers/reference-action-v0 (URL truncada en la información disponible)
