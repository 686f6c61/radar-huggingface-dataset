# padiredd/smolvla-toythrow-visual-2k-40k

## Resumen

smolvla-toythrow-visual-2k-40k es una política robótica basada en SmolVLA, publicada por el usuario padiredd en Hugging Face. No se trata de un modelo de lenguaje generalista, sino de un checkpoint de control visuomotor entrenado con LeRobot para una tarea concreta de manipulación: lanzar un objeto de juguete (toy throw) a partir de observaciones visuales de tres cámaras. El repositorio contiene los pesos en formato safetensors y se carga mediante `from_pretrained` de la librería lerobot.

El modelo tiene 450.046.176 parámetros (aproximadamente 450 millones) y un tamaño de repositorio de 3,6 GB, lo que incluye el checkpoint raíz correspondiente al paso 40.000 y checkpoints intermedios en los directorios `step-10000/`, `step-20000/` y `step-30000/`. El entrenamiento se realizó con el fork `lerobot-cyclo` de ROBOTIS sobre el dataset local `toy-throw-visual-2k-3cam`, con receta de 40.000 pasos, batch de 16 y semilla 42, sin aumento de imagen y sin co-entrenamiento.

Su relevancia es acotada y experimental: sirve como ejemplo reproducible de entrenamiento de una política SmolVLA para una tarea específica con configuración de tres cámaras, y como referencia para quienes trabajen con el ecosistema LeRobot y quieran inspeccionar checkpoints intermedios de un entrenamiento de 40.000 pasos. No debe confundirse con un modelo fundacional de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (política visuomotora para robótica, ecosistema LeRobot) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a SmolVLA, una política visuomotora del ecosistema LeRobot que combina un codificador visual con un modelo de acción para generar comandos motores a partir de observaciones de cámara. El modelo fue entrenado con el fork `lerobot-cyclo` de ROBOTIS, lo que sitúa el pipeline dentro de una variante específica del stack LeRobot. La entrada visual proviene de una configuración de tres cámaras, según el nombre del dataset (`toy-throw-visual-2k-3cam`).

El entrenamiento se realizó durante 40.000 pasos con batch de 16 y semilla 42. La model card indica que el aumento de imagen está desactivado y que no se aplicó co-entrenamiento (alpha None, split episode None). El dataset utilizado es local (`data_local/lerobot/toy-throw-visual-2k-3cam`) y no se especifica su composición, número de episodios ni número de tokens o frames. No se documentan técnicas de RLHF, DPO ni innovaciones de decodificación; se trata de un entrenamiento supervisado de imitación propio de políticas robóticas.

## Capacidades

- Control visuomotor para una tarea de lanzamiento de objeto de juguete (toy throw) a partir de observaciones de tres cámaras.
- Generación de acciones motrices condicionadas a la observación visual, en el formato de política LeRobot.
- Carga directa mediante `from_pretrained("padiredd/smolvla-toythrow-visual-2k-40k")` con la librería lerobot.
- Disponibilidad de checkpoints intermedios (pasos 10.000, 20.000 y 30.000) para evaluar la evolución del entrenamiento.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, thinking mode, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de experimentos en LeRobot: cargar el checkpoint raíz (paso 40.000) y comparar su comportamiento con los checkpoints intermedios para estudiar la curva de aprendizaje de una política SmolVLA en una tarea concreta.
- Evaluación de políticas visuomotoras en entornos de simulación o banco de pruebas con tres cámaras: el modelo está entrenado específicamente para esa configuración de observación, lo que permite medir el efecto de la disposición de cámaras en tareas de lanzamiento.
- Base para fine-tuning en tareas de manipulación similares: al ser un checkpoint SmolVLA de 450 millones de parámetros, puede servir como punto de partida para reentrenar con un dataset propio en el ecosistema lerobot.
- Docencia y divulgación sobre robótica de imitación: el repositorio incluye checkpoints intermedios y una receta de entrenamiento explícita (40.000 pasos, batch 16, semilla 42), lo que facilita explicar el proceso completo de entrenamiento de una política.
- Diagnóstico del pipeline `lerobot-cyclo` de ROBOTIS: útil para verificar la compatibilidad de checkpoints, la estructura de directorios y la carga de pesos en ese fork concreto.
- Referencia para ingeniería de datos de robótica: el nombre del dataset (`toy-throw-visual-2k-3cam`) y la configuración de aumento de imagen desactivado permiten reconstruir decisiones de preprocesamiento en un caso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 450 millones de parámetros, una estimación orientativa en fp32 rondaría los 1,8 GB solo de pesos, y en fp16 alrededor de 0,9 GB, pero no se confirma qué precisión usa el checkpoint ni el consumo real del pipeline LeRobot.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de parámetros sería plausible en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: carga mediante la librería lerobot (`from_pretrained`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| padiredd/smolvla-toythrow-visual-2k-40k | 450.046.176 | no disponible | Política visuomotora toy throw (3 cámaras) | no disponible | Hugging Face, librería lerobot |
| Otros checkpoints SmolVLA en LeRobot | no disponible | no disponible | Políticas visuomotoras | variable | Hugging Face |
| Políticas ACT / Diffusion Policy en LeRobot | no disponible | no disponible | Manipulación robótica | variable | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas concretas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado para una única tarea (toy throw) y un dataset local concreto; no generaliza a otras tareas de manipulación sin reentrenamiento.
- Sin licencia declarada: no se especifica licencia, lo que impide determinar si el uso comercial está permitido. Conviene contactar con el autor antes de cualquier uso en producción.
- Sin idiomas ni contexto declarados: no es un modelo de lenguaje, por lo que las métricas habituales de contexto e idioma no aplican.
- Dataset no documentado: no se indica número de episodios, composición ni calidad del dataset `toy-throw-visual-2k-3cam`, lo que limita la reproducibilidad.
- Dependencia del fork `lerobot-cyclo` de ROBOTIS: la carga puede requerir esa variante del stack LeRobot, no necesariamente la versión estándar.
- Sin benchmarks publicados: no hay evidencia cuantitativa de éxito en la tarea ni comparación con alternativas.
- Riesgo de sobreajuste al entorno de captura: al entrenarse con tres cámaras y sin aumento de imagen, el modelo puede ser sensible a cambios de iluminación, posición de cámara o disposición del objeto.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni informes de uso independientes.

## Enlaces

- Hugging Face: https://huggingface.co/padiredd/smolvla-toythrow-visual-2k-40k
- LeRobot (librería): https://github.com/huggingface/lerobot
- Fork lerobot-cyclo de ROBOTIS: no disponible en la información proporcionada
- Dataset `toy-throw-visual-2k-3cam`: no disponible (referencia local, sin enlace público)
- Paper de SmolVLA: no disponible en la información proporcionada
