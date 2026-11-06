# sollaholla/robocor-local-agent

## Resumen

Robocor local agent (450M, v1) es un modelo de lenguaje y visión ajustado a partir de LiquidAI/LFM2.5-VL-450M por el desarrollador sollaholla para su uso como agente local en robots de la plataforma Robocor. Su función es convertir comandos breves de operador en llamadas a herramientas (tool calls) del robot —desplazamientos, paradas, acoplamiento en base, patrullas, control de salidas y consultas de estado— y describir imágenes capturadas por la cámara del robot. El modelo está pensado para ejecutarse íntegramente en el propio robot, sin conexión a la nube.

La arquitectura subyacente es la del modelo base LFM2.5-VL-450M de LiquidAI, con 354.483.968 parámetros totales (aproximadamente 354M), y el ajuste se ha distribuido en formato GGUF cuantizado Q4_0 para el modelo de lenguaje (219 MB) junto con un proyector visual Q8_0 sin modificar (103 MB). El repositorio incluye además binarios de llama-server para NVIDIA Jetson (JetPack 6, CUDA 12.6) y Windows x64 con CPU, con un parche que restringe los argumentos de las herramientas a listas cerradas de opciones válidas.

Su relevancia radica en que ejemplifica el despliegue de agentes de robótica totalmente offline sobre hardware embebido de bajo consumo, con latencias del orden de 0,35 segundos por comando en una Jetson Orin Nano y una precisión de coincidencia exacta del 98,5% en el conjunto principal de comandos. No obstante, el alcance funcional es deliberadamente limitado: tareas de configuración, informes y comandos largos se delegan al agente en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo base LFM2.5-VL-450M de LiquidAI; detalles internos no disponibles) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (configurado en el comando de ejemplo con `-c 4096`) |
| Tipos de cuantizacion | Q4_0 (modelo de lenguaje), Q8_0 (proyector visual) |
| Idiomas soportados | inglés (`en`) |
| Licencia | LFM Open License v1.0 (`lfm1.0`) |
| Formato de pesos | GGUF (modelo de lenguaje y proyector visual); binarios llama-server en tar.gz y zip |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-VL-450M, un modelo multimodal de imagen a texto con proyector visual, y se ha ajustado mediante fine-tuning para la tarea concreta de generar llamadas a herramientas del robot. El proyector visual se mantiene sin cambios respecto al modelo base (Q8_0), mientras que los pesos del modelo de lenguaje sí se han modificado por el ajuste fino. La plantilla de chat incluida en el GGUF es la plantilla de texto de LFM2.5, no la plantilla VL original, porque llama.cpp no puede construir una gramática de herramientas a partir de esta última.

El entrenamiento se orientó a un conjunto de hasta once herramientas compactas: `go_to`, `visit`, `shuttle`, `stop`, `dock`, `start_patrol`, `where_am_i`, `robot_status`, `take_snapshot`, `set_output` y `toggle_output`. Los argumentos de lugar y salida son listas cerradas rellenadas a partir de los lugares y salidas guardados en el robot. El prompt de sistema incluye el estado del robot (por ejemplo, "idle, battery 64%"). Los binarios de llama-server incorporan un parche que limita los argumentos de las herramientas a las opciones listadas, de modo que el modelo solo puede nombrar lugares y salidas que el robot realmente tiene. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de llamadas a herramientas (tool calling) para comandos de robótica: desplazamiento a un punto, visita, lanzadera, parada, acoplamiento en base, inicio de patrulla, consulta de posición, consulta de estado, captura de instantánea y activación o desactivación de salidas.
- Comprensión de comandos breves de operador en inglés y traducción a la llamada de herramienta correspondiente.
- Descripción de imágenes de la cámara del robot mediante el proyector visual del modelo base.
- Condicionamiento por estado del robot incluido en el prompt de sistema (estado operativo y nivel de batería).
- Restricción de argumentos a listas cerradas de lugares y salidas guardados en el robot (mediante el parche de llama-server).
- Ejecución totalmente offline sobre llama.cpp, sin dependencia de servicios en la nube.
- Compatibilidad con el flujo de aprobaciones del operador y el historial de chat del agente en la nube de Robocor.
- Capacidades multilingües: limitadas al inglés.
- No se documentan capacidades de razonamiento multi-paso extendido, matemáticas, generación de código general ni agentes de propósito general.

## Casos de uso

- Navegación por comandos de voz o texto en robots de servicio: el modelo traduce instrucciones como "ve a la sala de reuniones" en una llamada `go_to` con el lugar validado contra la lista de lugares guardados, lo que evita destinos inexistentes.
- Parada de emergencia y control de movimiento: comandos de parada (`stop`) y acoplamiento en base (`dock`) procesados localmente con una latencia de aproximadamente 0,35 segundos en Jetson Orin Nano, adecuada para interacción en tiempo real.
- Patrullaje autónomo supervisado: el operador inicia una ruta de patrulla (`start_patrol`) y el robot ejecuta el recorrido, con consultas de posición (`where_am_i`) y estado (`robot_status`) para monitorización.
- Inspección visual asistida: el robot captura una instantánea (`take_snapshot`) y el modelo describe la imagen de la cámara, útil para verificar el estado de una zona o detectar incidencias sin transmitir vídeo a la nube.
- Control de actuadores y salidas: activación y desactivación de salidas físicas (`set_output`, `toggle_output`) con argumentos restringidos a las salidas realmente instaladas en el robot.
- Operación en entornos con conectividad limitada o requisitos de privacidad: al ejecutarse íntegramente offline en el propio robot, no requiere enviar comandos ni imágenes a servidores externos, lo que facilita el cumplimiento en instalaciones industriales o sanitarias.
- Integración en la aplicación Robocor: la app descarga automáticamente los ficheros la primera vez que el robot los necesita, y las llamadas generadas se traducen al mismo formato de herramienta que usaría el agente en la nube, manteniendo la coherencia del historial y las aprobaciones.

## Benchmarks y rendimiento

Exactitud de coincidencia exacta en los conjuntos de comandos reservados de Robocor, con el muestreo de entrenamiento (temperatura 0,1, top_k 50, penalización por repetición 1,1), medidos en un Mac con serie M de Apple con llama.cpp estándar (sin el parche de listas de opciones, que añade entre medio punto y dos puntos):

| Conjunto | Casos | Exactitud |
|---|---|---|
| Comandos principales | 400 | 98,5% |
| Formulaciones inesperadas | 77 | 93,5% |
| Nuevas formulaciones inesperadas | 251 | 80,9% |
| Conjunto nuevo, escrito tras el entrenamiento | 300 | 81,7% |

En una Jetson Orin Nano, el modelo de lenguaje Q4_0 responde a un comando en aproximadamente 0,35 segundos. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de lenguaje Q4_0 ocupa 219 MB y el proyector visual Q8_0, 103 MB; en total, aproximadamente 322 MB de pesos, más el overhead de contexto y runtime de llama.cpp.
- GPU recomendadas: NVIDIA Jetson Orin Nano con JetPack 6 y CUDA 12.6 (binario específico incluido); el modelo base de 450M es lo bastante pequeño para ejecutarse en otras GPU embebidas o de consumo, aunque no se documentan pruebas en ellas.
- CPU: se incluye un binario de llama-server para Windows x64 con CPU, lo que indica viabilidad de ejecución sin GPU.
- Cabe en GPU de consumo: sí, por el tamaño reducido de los pesos cuantizados; no se especifican modelos concretos de GPU de consumo probados.
- Opciones de despliegue: llama.cpp (llama-server) con los binarios proporcionados; el comando de ejemplo usa `-ngl 99 -c 4096 -ub 256 -np 1 --cache-ram 0 --jinja --reasoning off`.
- Latencia y throughput: aproximadamente 0,35 segundos por comando en Jetson Orin Nano; no se proporcionan datos de throughput (tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Robocor local agent (450M, v1) | 354.483.968 | 4096 | Agente de robótica con tool calling y visión, offline | LFM Open License v1.0 | GGUF en Hugging Face, binarios llama-server |
| LiquidAI/LFM2.5-VL-450M (modelo base) | no disponible en la información | no disponible | Modelo multimodal imagen-texto de propósito general | LFM Open License v1.0 | Hugging Face |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Alcance funcional restringido: el modelo está entrenado solo para comandos breves (desplazamientos, paradas, acoplamiento, patrullas, salidas, consulta de posición y estado, y descripción de imágenes); la configuración, los informes y las tareas largas se delegan al agente en la nube.
- Idioma: solo inglés; no se documenta soporte de castellano ni de otros idiomas.
- Degradación ante formulaciones no vistas: la exactitud cae del 98,5% en el conjunto principal al 80,9% en nuevas formulaciones inesperadas y al 81,7% en un conjunto escrito tras el entrenamiento, lo que indica sensibilidad a la variación lingüística.
- Dependencia de listas cerradas: los argumentos de lugar y salida solo son válidos si existen en la configuración guardada del robot; el parche de llama-server restringe las opciones, pero una configuración desactualizada puede limitar la utilidad del modelo.
- Riesgo de alucinación: no se documentan evaluaciones específicas de alucinación; en un modelo de 450M ajustado para tool calling, la generación de argumentos fuera de las listas o de llamadas incorrectas es un riesgo a mitigar con validación en el lado del robot.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.
- Licencia: LFM Open License v1.0; es necesario revisar sus términos para uso comercial, ya que el modelo es una obra derivada del modelo base y los pesos han sido modificados por fine-tuning. Los binarios de llama-server son MIT, y el build de Windows incluye el runtime LLVM OpenMP bajo su propia licencia.
- Plantilla de chat sustituida: el GGUF usa la plantilla de texto de LFM2.5 en lugar de la plantilla VL original, lo que puede afectar a la reproducibilidad exacta del comportamiento respecto al modelo base.
- Contexto limitado a 4096 tokens, adecuado para comandos cortos pero no para conversaciones o documentos extensos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sollaholla/robocor-local-agent
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Licencia LFM Open License v1.0: https://huggingface.co/sollaholla/robocor-local-agent/blob/main/LICENSE
- llama.cpp (MIT): https://github.com/ggml-org/llama.cpp
