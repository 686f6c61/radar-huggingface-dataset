# gulucaptain/zero-wam-roboicl-version-a

## Resumen

Zero-WAM RoboICL Version A es un adaptador LoRA publicado por el usuario gulucaptain sobre el modelo base Robbyant-Research/zero-wam-pretrain, orientado a robótica y aprendizaje por imitación con demos de robot. La variante A introduce tres capas de atención cruzada con puertas inicializadas a cero que permiten a la rama de acciones de Zero-WAM leer tokens procedentes de una demostración de robot, codificada por un DINOv2 ViT-B/14 congelado. El adaptador se entrena con el objetivo original de MCP y con ICL de vídeo, y arranca en caliente desde el baseline Robot-ICL en el paso 3.698.

El modelo resuelve el problema de adaptar un modelo preentrenado con demostraciones humanas a datos de robot mediante fine-tuning parametrizado eficiente (LoRA) y mecanismos de atención cruzada que inyectan información de la demo externa. Es relevante en el contexto de la robótica de manipulación y el aprendizaje por imitación, donde el ajuste fino sobre pesos preentrenados con datos humanos es un cuello de botella habitual.

La información pública disponible es muy escasa: no se especifican parámetros totales, longitud de contexto, idiomas, licencia del adaptador ni resultados de benchmarks. El autor indica explícitamente que no se ha medido el rendimiento en bucle cerrado de estos snapshots, por lo que cualquier uso en producción requiere validación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Zero-WAM (modelo base Robbyant-Research/zero-wam-pretrain); incluye tres capas de atención cruzada con puertas inicializadas a cero y codificador visual DINOv2 ViT-B/14 congelado |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible para el adaptador; el modelo base Zero-WAM se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (`epoch-NNN/adapter.safetensors`) más metadatos JSON (`epoch-NNN/adapter.json`) |

## Arquitectura y entrenamiento

El adaptador se monta sobre el modelo base Zero-WAM, del que hereda los pesos preentrenados con demostraciones humanas (revisión `7040c4195df216c900334ef62d5fdcf05c0601aa`, licencia Apache-2.0). La contribución específica de la versión A son tres capas de atención cruzada con puertas inicializadas a cero, que conectan la rama de acciones de Zero-WAM con tokens derivados de una demostración de robot. Un DINOv2 ViT-B/14 congelado codifica ocho muestras RGB de la cámara externa; cada muestra aporta una rejilla 2×2 de características agrupadas con índices temporales y espaciales. Se conservan tanto el ICL de vídeo como el objetivo de entrenamiento MCP original.

El entrenamiento parte en caliente del baseline Robot-ICL en el paso 3.698 y se configura para 20 épocas con 330 pasos de optimizador por época, cuatro GPU y un batch global de 64. Los snapshots por época se publican tras guardar el checkpoint correspondiente. Los tensores entrenables incluyen LoRA, cabezas de estado y acción, adaptadores MCP y las capas de atención de la variante A. No se documentan el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Control robótico mediante aprendizaje por imitación: la rama de acciones genera comandos a partir de observaciones y de una demostración externa codificada por DINOv2.
- Aprendizaje en contexto (ICL) con demos de robot: las capas de atención cruzada permiten condicionar la política en ocho muestras RGB de una cámara externa.
- Integración de información multimodal: visión (DINOv2 ViT-B/14) combinada con la rama de acciones de Zero-WAM.
- Ajuste fino eficiente mediante LoRA sobre un modelo preentrenado, sin reentrenar los pesos base.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, generación de texto, código, matemáticas, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Manipulación robótica guiada por demostración: cargar el modelo base Zero-WAM, adjuntar los tensores del adaptador y alimentar la política con ocho muestras RGB de una cámara externa para que la rama de acciones replique la tarea demostrada.
- Adaptación de políticas preentrenadas con datos humanos a un robot concreto: el fine-tuning LoRA permite reutilizar los pesos de Zero-WAM sin reentrenar desde cero, reduciendo el coste computacional frente a un ajuste completo.
- Investigación en aprendizaje por imitación con ICL de vídeo: el adaptador conserva el objetivo MCP y el ICL de vídeo, lo que lo hace adecuado para experimentos que comparan condicionamiento por demo frente a condicionamiento por instrucciones.
- Evaluación de mecanismos de atención cruzada con puertas inicializadas a cero: la variante A sirve como ablación frente al baseline Robot-ICL para estudiar el efecto de inyectar tokens de demo en la rama de acciones.
- Prototipado en laboratorio con cuatro GPU: la configuración de entrenamiento documentada (cuatro GPU, batch global de 64) permite reproducir el pipeline en entornos académicos de tamaño medio.
- Punto de partida para fine-tuning posterior: los snapshots por época y el formato safetensors facilitan continuar el entrenamiento o adaptar el modelo a nuevas tareas robóticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha medido el rendimiento en bucle cerrado de estos snapshots.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del tamaño del modelo base Zero-WAM, que no se documenta.
- GPU recomendadas: no disponible para inferencia. El entrenamiento documentado se realizó con cuatro GPU, sin especificar modelo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. El autor indica que la inferencia requiere cargar el modelo base Zero-WAM y adjuntar los tensores con la integración Robot-ICL + A correspondiente; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zero-WAM RoboICL Version A (gulucaptain) | no disponible | no disponible | no medido en bucle cerrado | no disponible (base Apache-2.0) | Hugging Face, 0 descargas |
| Robot-ICL baseline (referenciado en la model card) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Zero-WAM pretrain (Robbyant-Research) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El autor declara que no se ha medido el rendimiento en bucle cerrado de los snapshots publicados; no hay evidencia de robustez en despliegue real.
- El adaptador se entrena con datos de robot, mientras que los pesos heredados de Zero-WAM se preentrenaron con demostraciones humanas; puede existir una brecha de dominio no cuantificada.
- La licencia del adaptador no está especificada; solo se conoce la licencia Apache-2.0 del modelo base, por lo que el uso comercial del adaptador requiere aclaración con el autor.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas; al tratarse de un modelo de robótica, el riesgo principal es de seguridad física en la ejecución de acciones.
- El modelo tiene 0 descargas y 0 likes, sin validación externa conocida.
- La integración de inferencia no está publicada como código; requiere implementar el emparejamiento de tensores con el modelo base.
- No se especifican parámetros, contexto ni cuantizaciones, lo que impide planificar requisitos de hardware a partir de la información pública.

## Enlaces

- [Hugging Face: gulucaptain/zero-wam-roboicl-version-a](https://huggingface.co/gulucaptain/zero-wam-roboicl-version-a)
- [Modelo base: Robbyant-Research/zero-wam-pretrain](https://huggingface.co/Robbyant-Research/zero-wam-pretrain)
