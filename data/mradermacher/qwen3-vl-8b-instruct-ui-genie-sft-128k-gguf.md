# mradermacher/Qwen3-VL-8B-Instruct-UI-Genie-SFT-128K-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF estáticas de Qwen3-VL-8B-Instruct-UI-Genie-SFT-128K, un modelo multimodal de visión y lenguaje afinado para tareas de agente de interfaz gráfica (GUI agent). El modelo base fue entrenado por Gyubeum a partir de Qwen3-VL-8B-Instruct (de Alibaba/Qwen), aplicando un ajuste fino supervisado (SFT) sobre el dataset Gyubeum/UI_Genie_128k, y las cuantizaciones han sido generadas por mradermacher, un cuantizador muy activo de la comunidad de Hugging Face.

El problema que aborda es la automatización de interacciones con interfaces de usuario: el modelo combina la capacidad de visión de Qwen3-VL (comprender capturas de pantalla y elementos de UI) con un entrenamiento específico en preferencias discretas y comportamiento de agente GUI, lo que lo hace adecuado para tareas como localizar elementos en pantalla, razonar sobre interfaces y planificar acciones. La variante "128K" indica una ventana de contexto extendida a 128.000 tokens.

Es relevante ahora porque los agentes de GUI son una de las áreas más activas de la IA aplicada, y tener un modelo de 8B parámetros, con licencia Apache 2.0 y disponible en formato GGUF permite ejecutarlo localmente incluso en GPUs de consumo, facilitando la experimentación y el despliegue sin dependencia de APIs de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) basado en Qwen3-VL, con proyector mmproj |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No es MoE; todos los parámetros están activos |
| Longitud de contexto | 128.000 tokens (según la denominación del modelo base) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (más mmproj-Q8_0 y mmproj-f16 como suplemento multimodal) |
| Idiomas soportados | Inglés (etiquetado oficialmente como "en") |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-VL-8B-Instruct, la variante multimodal de la familia Qwen3 con 8 mil millones de parámetros. Qwen3-VL emplea una arquitectura transformer de lenguaje con un codificador visual y un proyector (mmproj) que alinea las representaciones visuales con el espacio del modelo de lenguaje, lo que permite procesar imágenes (como capturas de pantalla) junto con texto. La variante base soporta contextos largos, y esta versión SFT hereda la denominación 128K referida a su ventana de contexto.

El ajuste fino se realizó mediante SFT (supervised fine-tuning) sobre el dataset Gyubeum/UI_Genie_128k, un conjunto de datos de unas 128.000 muestras orientado a agentes de GUI. Los tags del repositorio indican entrenamiento con "discrete-preference" (preferencias discretas) y orientación a "reward-model" y "gui-agent", lo que sugiere que el dataset enseña al modelo a evaluar o ejecutar acciones sobre interfaces gráficas. No hay información disponible sobre el número exacto de tokens de entrenamiento, el uso de RLHF/DPO adicionales ni otras innovaciones técnicas específicas de este ajuste.

## Capacidades

- Comprensión de imágenes y capturas de pantalla: hereda las capacidades de visión de Qwen3-VL mediante el suplemento mmproj incluido en el repo.
- Comportamiento como agente de GUI: afinado para razonar sobre elementos de interfaz y tareas de automatización de UI.
- Evaluación tipo reward model: entrenamiento con preferencias discretas, útil para puntuar o comparar acciones/respuestas en entornos de UI.
- Generación de texto e instrucciones: conserva las capacidades conversacionales del modelo base Instruct.
- Contexto largo: hasta 128.000 tokens, adecuado para tareas con múltiples capturas e historial de acciones.
- No hay información disponible sobre soporte de tool calling, modos de razonamiento (thinking), audio u otras capacidades específicas heredadas tras el SFT.

## Casos de uso

- Automatización de pruebas de interfaces web: el modelo puede analizar capturas de pantalla de una aplicación y localizar botones, campos o elementos para verificar que la UI funciona como se espera, reduciendo el mantenimiento de selectores frágiles.
- Agentes de navegación autónoma: integrado en un bucle de agente (captura de pantalla → decisión de acción → ejecución), puede realizar tareas repetitivas como rellenar formularios o extraer información de aplicaciones de escritorio.
- Etiquetado y evaluación de trayectorias de agentes: gracias a su entrenamiento con preferencias discretas, puede servir como juez automático para puntuar si una secuencia de acciones de un agente GUI es correcta, útil para generar datos de entrenamiento sintéticos.
- Asistentes de accesibilidad: puede describir y razonar sobre elementos de pantalla para ayudar a usuarios con dificultades visuales a interactuar con aplicaciones.
- RPA (automatización robótica de procesos) aumentada con visión: en flujos donde la UI no ofrece APIs, el modelo puede interpretar la pantalla y guiar la automatización, con la ventaja de ejecutarse localmente por requisitos de privacidad.
- Investigación en agentes de GUI: al ser un modelo abierto con dataset público, es útil como base para experimentos académicos o como punto de partida para nuevos afinados especializados en interacción con UI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye evaluaciones, y el repo del modelo base referenciado no aporta métricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del LLM, sin mmproj ni KV cache):
  - Q2_K: ~3,4 GB
  - Q4_K_M: ~5,1 GB
  - Q6_K: ~6,8 GB
  - Q8_0: ~8,8 GB
  - f16: ~16,5 GB
  - A estos tamaños hay que sumar el suplemento multimodal (0,9 GB en Q8_0 o 1,3 GB en f16) y la memoria del KV cache, que crece con el contexto (hasta 128K tokens).
- GPU recomendadas: para cuantizaciones Q4 a Q6, cualquier GPU de consumo con 8-12 GB de VRAM es suficiente (RTX 3060 12 GB, RTX 4070, RTX 4090). Para f16 o contextos muy largos, se recomiendan GPUs con 24 GB (RTX 3090/4090) o superiores (A100, H100).
- Consumer GPU: sí, cabe cómodamente en GPUs de 8-12 GB con cuantizaciones Q4_K_S/Q4_K_M, la opción recomendada por el autor para equilibrio velocidad/calidad.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, necesario para la parte de visión con mmproj), Ollama, LM Studio y cualquier runtime compatible con GGUF multimodal. No está indicado el soporte en vLLM o TGI para los archivos GGUF (estos frameworks requieren los pesos originales del modelo base).
- Latencia y throughput: no disponible. Al ser un modelo de 8B con cuantización Q4, se espera interacción fluida en GPUs de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-8B-Instruct-UI-Genie-SFT-128K (este) | 8,19 B | 128K | Visión + texto (GUI agent) | Apache 2.0 | GGUF (este repo) y safetensors (base) |
| Qwen3-VL-8B-Instruct (base) | 8,19 B | 128K (según variante) | Visión + texto generalista | Apache 2.0 | safetensors y GGUF de la comunidad |
| UI-TARS (ByteDance, serie 2B-7B) | 2B-7B | no disponible | Visión + texto (GUI agent) | no disponible | safetensors en Hugging Face |

Nota: la comparativa con UI-TARS es orientativa (misma categoría de tarea, agente de GUI); no hay datos de rendimiento comparativos publicados en la información disponible.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado oficialmente solo para inglés ("en"); no hay garantía de rendimiento en castellano ni en otros idiomas, ni en las etiquetas de UI que no estén en inglés.
- Es un modelo derivado de terceros: el SFT sobre UI_Genie no incluye documentación detallada en la model card del cuantizador, por lo que conviene revisar el repo del modelo base (Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-SFT-128K) antes de uso en producción.
- Cuantizaciones bajas (Q2_K, Q3_K_S/M) pueden degradar notablemente la calidad, especialmente en tareas de visión finas como la localización de elementos de UI; el propio autor recomienda Q4_K_S/Q4_K_M como punto de equilibrio.
- Riesgo de alucinación: como todo modelo de visión-lenguaje, puede describir incorrectamente elementos de pantalla o proponer acciones erróneas; en automatización de UI real se recomienda supervisión humana o mecanismos de confirmación.
- Sesgos: no hay información publicada sobre sesgos específicos; hereda potencialmente los sesgos del modelo base Qwen3-VL y del dataset UI_Genie_128k.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar los términos de los modelos y datasets subyacentes.
- Son cuantizaciones estáticas: no hay versiones imatrix/weighted disponibles según el autor, lo que puede suponer una ligera pérdida de calidad frente a cuantizaciones ponderadas equivalentes.
- El contexto de 128K tokens consume memoria KV significativa; en GPUs de consumo puede ser necesario reducir el contexto práctico o usar KV cache cuantizado.

## Enlaces

- Repo GGUF cuantizado: https://huggingface.co/mradermacher/Qwen3-VL-8B-Instruct-UI-Genie-SFT-128K-GGUF
- Modelo base (safetensors): https://huggingface.co/Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-SFT-128K
- Dataset de entrenamiento: https://huggingface.co/datasets/Gyubeum/UI_Genie_128k
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3-VL-8B-Instruct-UI-Genie-SFT-128K-GGUF
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
