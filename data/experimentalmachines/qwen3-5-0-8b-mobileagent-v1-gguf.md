# experimentalmachines/Qwen3.5-0.8B-MobileAgent-v1-GGUF

## Resumen

Qwen3.5-0.8B-MobileAgent-v1-GGUF es una compilación en formato GGUF del modelo experimentalmachines/Qwen3.5-0.8B-MobileAgent-Dev-AndroidControlOnly, un modelo de vision-lenguaje de 752 millones de parámetros afinado para actuar como agente de interfaz gráfica (GUI agent) sobre Android. Lo desarrolla el colectivo ExperimentalMachines y parte del modelo base Qwen/Qwen3.5-0.8B, sobre el que se ha realizado un ajuste específico para interpretar capturas de pantalla de un teléfono y emitir acciones de control. El modelo resuelve el problema de automatizar la interacción con aplicaciones móviles a partir de objetivos expresados en lenguaje natural, procesando una captura por paso.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de uso muy concreto (automatización de Android mediante capturas) en un tamaño reducido que cabe en hardware modesto. Por otro lado, el propio autor marca el modelo como **versión de desarrollo**, conservada únicamente para reproducir resultados y no recomendada para uso nuevo: la alternativa indicada es LFM3-VL-2B-MobileAgent. La licencia es Apache-2.0, heredada de Qwen3.5-0.8B.

La arquitectura subyacente es la de Qwen3.5-0.8B (transformer multimodal con proyector de visión), cuantizada a 4 bits (Q4_K_M) para el modelo de lenguaje y F16 para el proyector visual. El contexto operativo en el ejemplo de servicio es de 8192 tokens, aunque el agente mantiene una memoria de texto limitada a 8 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-0.8B) con proyector de vision; ajuste GUI-agent |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens en el ejemplo de servicio (`-c 8192`); memoria de agente limitada a 8 pasos de texto |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje), F16 (proyector de vision) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp, commit `cd959bae9`) |

## Arquitectura y entrenamiento

El modelo es una compilación GGUF de un ajuste sobre Qwen3.5-0.8B, un transformer multimodal de 752 millones de parámetros con un proyector de visión separado. La compilación incluye dos ficheros: el modelo de lenguaje cuantizado en Q4_K_M y el proyector visual en F16, convertido desde el modelo fusionado. El pipeline declarado es `image-text-to-text`: el modelo recibe una captura de pantalla y un objetivo en inglés y produce la siguiente acción de control.

El ajuste se realizó exclusivamente sobre demostraciones grabadas (el autor indica que el modelo "nunca ha interactuado con un teléfono real durante el entrenamiento"). No se dispone en la información proporcionada de datos sobre número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF/DPO. El modelo base es experimentalmachines/Qwen3.5-0.8B-MobileAgent-Dev-AndroidControlOnly, que a su vez deriva de Qwen/Qwen3.5-0.8B. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Interpretación de capturas de pantalla de Android y emisión de acciones de control de la interfaz (GUI agent).
- Procesamiento de un objetivo en lenguaje natural (en inglés) junto con una captura por paso.
- Razonamiento de un solo paso sobre el estado visual de la pantalla.
- Memoria de texto limitada a los últimos 8 pasos de la interacción.
- Modalidad image-text-to-text (entrada de imagen y texto, salida de texto).
- Soporte de conversación multi-turno acotado por la ventana de 8 pasos.
- No se documenta soporte de tool calling, function calling, agentes multi-paso autónomos, audio ni thinking mode en la información disponible.

## Casos de uso

- Reproducción de experimentos de investigación en agentes GUI móviles: el modelo se conserva precisamente para reproducir los resultados publicados en el repositorio del proyecto, con los mismos ficheros GGUF que se usaron en las evaluaciones.
- Automatización de pruebas de interfaz en Android en entornos controlados: dado un objetivo y una captura, el modelo emite la siguiente acción, lo que permite construir harnesses de test de flujos de UI sobre emuladores.
- Prototipado rápido de asistentes de accesibilidad: con 752 M de parámetros y cuantización Q4_K_M, el modelo cabe en dispositivos modestos y sirve para validar ideas de asistencia basada en capturas antes de pasar a modelos mayores.
- Investigación sobre razonamiento visual de un solo paso: su tamaño reducido permite iterar rápidamente sobre prompts y formatos de salida en experimentos de visión-lenguaje aplicada a pantallas.
- Docencia y experimentación con llama.cpp: el par de ficheros (modelo + mmproj) es un ejemplo didáctico de despliegue multimodal en llama.cpp con `llama-server`.
- Evaluación comparativa de agentes móviles: sirve como línea base de 0,8 B frente a alternativas mayores como LFM3-VL-2B-MobileAgent dentro del mismo proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo de lenguaje en Q4_K_M pesa aproximadamente 0,5 GB y el proyector visual F16 unos 0,2 GB; el repositorio completo ocupa 0,7 GB.
- VRAM estimada para inferencia: del orden de 1-2 GB, incluyendo contexto de 8192 tokens y overhead de llama.cpp (estimación, no dato publicado).
- Cabe en GPU de consumo: cualquier GPU con 2 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050 en adelante) es suficiente; también puede ejecutarse en CPU.
- Despliegue recomendado: llama.cpp mediante `llama-server` con `-m` (modelo Q4_K_M) y `--mmproj` (proyector F16) y `-c 8192`.
- No se documentan datos de latencia ni throughput en la información disponible.
- El tamaño reducido lo hace apto para ejecución en dispositivos móviles o entornos embebidos, aunque no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-MobileAgent-v1-GGUF (este) | 752 M | 8192 (servicio); memoria de 8 pasos | image-text-to-text (GUI Android) | Apache-2.0 | Desarrollo, no recomendado |
| experimentalmachines/LFM3-VL-2B-MobileAgent | no disponible | no disponible | image-text-to-text (GUI móvil) | no disponible | Alternativa recomendada por el autor |
| Qwen/Qwen3.5-0.8B (base) | 752 M (aprox.) | no disponible | texto (base) | Apache-2.0 | Modelo base |

La comparativa se limita a los modelos mencionados en la información proporcionada; no se dispone de datos de rendimiento para contrastar.

## Limitaciones y advertencias

- Modelo de investigación: el autor advierte explícitamente de no dejarlo actuar de forma desatendida en un teléfono con cuentas, mensajes o pagos reales.
- Solo acepta objetivos en inglés.
- Procesa una única captura por paso y no tiene memoria más allá de los 8 pasos de historial de texto.
- Entrenado únicamente con demostraciones grabadas; nunca interactuó con un teléfono real durante el entrenamiento, lo que puede provocar un rendimiento deficiente ante estados de pantalla no vistos.
- Marcado como versión de desarrollo y no recomendado para uso nuevo; el autor remite a LFM3-VL-2B-MobileAgent.
- Riesgo de alucinación en la interpretación de capturas y en la elección de acciones, no cuantificado en la información disponible.
- Licencia Apache-2.0, que permite uso comercial, pero el estado de desarrollo y las advertencias de seguridad desaconsejan su uso en producción sin supervisión.
- No se documentan sesgos conocidos en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/experimentalmachines/Qwen3.5-0.8B-MobileAgent-v1-GGUF
- Modelo base (dev): https://huggingface.co/experimentalmachines/Qwen3.5-0.8B-MobileAgent-Dev-AndroidControlOnly
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Alternativa recomendada: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Guía de nombres: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Documentación de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
