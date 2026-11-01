# nouli-ai/nouli-doom

## Resumen

Nouli Doom es una política de decisión entrenada con PPO (Proximal Policy Optimization) para el escenario Deadly Corridor de ViZDoom en dificultad 5. Lo desarrolla Nouli AI y se publica como un export de inferencia que contiene únicamente la red del actor, la cual transforma un estado estructurado del juego (42 valores de tipo float) en una de 54 acciones conjuntas legales que combinan movimiento, desplazamiento lateral, giro y disparo. No es un modelo de lenguaje ni un modelo generativo multimodal: es un agente de control para un entorno concreto, empaquetado con un runtime propio de inferencia.

El modelo es relevante por su tamaño extremadamente reducido (23.435 parámetros) y por su enfoque de destilación: parte de un profesor público, el checkpoint `malecns49k_noconn` del modelo `fabiononato/doomfly-rl`, del que se generan trayectorias que se combinan con DAgger y aprendizaje por refuerzo en simulador. El resultado es un agente ligero que corre en CPU sobre macOS y Linux ARM64, sin necesidad de GPU ni de claves de API alojadas, lo que lo hace útil como ejemplo de pipeline completo de entrenamiento, exportación e inferencia local en entornos de investigación de RL.

La ficha se basa exclusivamente en la model card y en los metadatos del repositorio de Hugging Face. El repositorio tiene un tamaño declarado de 0,0 GB, 24 descargas y ninguna marca de "me gusta" en el momento de la consulta, y la versión publicada es la `v1.0.0`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) entrenado con PPO; export de inferencia con la red del actor |
| Parámetros totales | 23.435 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de secuencia; entrada de 42 floats) |
| Tipos de cuantización | No disponible (no se documentan cuantizaciones; el runtime probado es CPU) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | Apache-2.0, con avisos de upstream y atribución de dataset |
| Formato de pesos | Pesos PyTorch cargados por un servidor Python propio (`serve.py`); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal de tipo MLP que actúa como política de decisión. La entrada es un vector de 42 floats que representa el estado estructurado del juego y el objetivo; la salida es una distribución sobre 54 acciones conjuntas legales (movimiento, strafe, giro y disparo). El export de inferencia contiene solo el actor, no el crítico ni el optimizador, y se sirve mediante un servidor Python que carga los pesos y expone un workflow de decisión a la CLI de Nouli (versión 0.4.2), que ejecuta el bucle de decisión en local.

El entrenamiento combina tres fuentes: imitación a partir de trayectorias del profesor Doomfly (`fabiononato/doomfly-rl`, checkpoint `malecns49k_noconn`), agregación de datos con DAgger y aprendizaje por refuerzo en simulador con PPO. La model card aclara que el profesor aporta las etiquetas pero sus pesos no son la inicialización directa del estudiante. El escenario validado es Deadly Corridor a dificultad 5 con el wrapper de estado y acción proporcionado; no se documentan innovaciones como decodificación especulativa o atención lineal, porque no aplican a este tipo de modelo.

## Capacidades

- Control de agente en ViZDoom Deadly Corridor a dificultad 5: selecciona acciones de movimiento, desplazamiento lateral, giro y disparo a partir del estado estructurado.
- Toma de decisiones discretas sobre un espacio de 54 acciones conjuntas legales.
- Inferencia local en CPU, sin API alojada ni clave de servicio.
- Ejecución mediante un workflow declarativo de la CLI de Nouli (`example-workflow.json`), que devuelve una acción para un estado dado.
- Integración con un bucle de simulador externo que aplica las acciones y proporciona el siguiente estado.
- No soporta tool calling, function calling, agentes multi-paso genéricos, razonamiento en lenguaje natural, visión por píxeles ni audio.

## Casos de uso

- Investigación en aprendizaje por imitación: usar el par profesor-estudiante como caso de estudio reproducible de destilación con DAgger y PPO en un entorno de RL con estado estructurado.
- Evaluación de políticas ligeras en ViZDoom: reproducir el protocolo de Deadly Corridor a dificultad 5 y comparar el agente con la línea base registrada de Jev 1.14.0.
- Docencia y tutoriales de RL: el tamaño de 23.435 parámetros y la ejecución en CPU permiten montar un laboratorio completo sin GPU, desde la descarga hasta la inferencia.
- Pruebas de integración de runtimes de decisión: validar el flujo `hf download` → `prepare.py` → `serve.py` → CLI de Nouli en pipelines de CI con runners ARM64.
- Benchmarking de agentes en entornos con wrapper de estado y acción: emplear el modelo como referencia de política mínima frente a agentes basados en píxeles.
- Prototipado de bucles de simulación: usar el servidor de inferencia como componente de un bucle que aplica acciones y realimenta estados, útil para probar arquitecturas de orquestación de agentes.
- Reproducibilidad de artefactos: citar la versión y el commit publicados (`v1.0.0`) para replicar exactamente la evaluación registrada en `eval/results.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una comparación grabada con Jev 1.14.0 del 31 de octubre de 2026 en la que, en un episodio concreto, Nouli Doom recoge la armadura y sobrevive mientras que la ejecución de Jev termina antes de recogerla. El propio autor advierte que el ejemplo se seleccionó tras puntuar y que ilustra esa configuración grabada, no una clasificación general de los modelos. Los detalles del protocolo están en `eval/protocol.json` y los resultados en `eval/results.json`.

## Requisitos de hardware

- VRAM estimada: no aplica; la inferencia probada se ejecuta en CPU.
- GPU recomendadas: no se documentan; el runtime validado es macOS y Linux ARM64 sobre CPU.
- ¿Cabe en GPU de consumo? No disponible como requisito; por el tamaño del modelo (23.435 parámetros) no se plantea carga en GPU.
- Opciones de despliegue: servidor Python propio (`serve.py --device cpu`) más la CLI de Nouli 0.4.2; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Requisitos de entorno: Python 3.12, CLI de Hugging Face y Nouli CLI 0.4.2.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nouli Doom | 23.435 | 42 floats de estado estructurado | No aplica | Apache-2.0 | Hugging Face, versión v1.0.0 |
| Doomfly RL (`fabiononato/doomfly-rl`, checkpoint `malecns49k_noconn`) | No disponible | Estado del juego (profesor) | No aplica | No disponible en la información | Hugging Face, revisión `2e58329` |
| Jev 1.14.0 | No disponible | Interfaz de estado estructurado y objetivo | No aplica | No disponible en la información | Referencia de comparación en la model card |

La comparación con Jev se limita a un episodio grabado y no constituye una clasificación general. No se dispone de datos de parámetros, contexto ni rendimiento agregado de las alternativas.

## Limitaciones y advertencias

- Validado únicamente en Deadly Corridor a dificultad 5 con el wrapper de estado y acción suministrado; no se establece rendimiento general en Doom.
- La entrada incluye estado estructurado y asistencia de objetivo; los resultados no demuestran rendimiento con píxeles únicamente.
- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no soporta tool calling ni agentes conversacionales.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de sobreajuste al escenario y al wrapper de entrenamiento.
- Sesgos conocidos: no documentados; al entrenarse con trayectorias de un profesor concreto, puede heredar sus sesgos de política.
- Restricciones de licencia: Apache-2.0 con avisos de upstream y atribución de dataset que deben conservarse; conviene revisar las condiciones del profesor Doomfly antes de uso comercial.
- Para ejecutar un episodio completo se necesita un bucle de simulador externo que aplique las acciones y proporcione cada estado siguiente; el ejemplo solo devuelve una acción para un estado dado.
- El repositorio declara 0,0 GB de tamaño y un número muy bajo de descargas, lo que sugiere un artefacto pequeño y poco contrastado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nouli-ai/nouli-doom
- Sitio de Nouli AI: https://nouli.ai
- Profesor Doomfly RL: https://huggingface.co/fabiononato/doomfly-rl/tree/2e58329dcdeed64107679f0ff113b024d4d2b167
- CLI de Nouli 0.4.2: https://github.com/standing-desks/nouli/releases/tag/v0.4.2
- Vídeo de comparación: https://huggingface.co/nouli-ai/nouli-doom/resolve/v1.0.0/assets/comparison.mp4
- Resultados de evaluación: `eval/results.json` (en el repositorio)
- Protocolo de evaluación: `eval/protocol.json` (en el repositorio)
- Procedencia y revisiones: `provenance.json` (en el repositorio)
- Modelos relacionados: https://huggingface.co/nouli-ai/nouli-guard, https://huggingface.co/nouli-ai/nouli-route, https://huggingface.co/nouli-ai/nouli-clause, https://huggingface.co/nouli-ai/nouli-push
