# lensetek/lensetek-iot-coder-3b-GGUF

## Resumen

Lensetek-IoT-Coder-3B es un modelo de lenguaje pequeno (SLM) de 3.085.938.688 parametros, afinado a partir de Qwen/Qwen2.5-Coder-3B-Instruct por el autor lensetek. Esta especializado en ingenieria IoT de extremo a extremo: firmware para microcontroladores (Arduino, ESP32/ESP8266, Raspberry Pi Pico con MicroPython, FreeRTOS), telemetria de sensores, filtrado y calibracion, control de actuadores con failsafe, dashboards web mobile-first y exportacion de diagramas de circuito verificables en cuatro formatos (Wokwi, WireViz, Schemdraw/SKiDL hacia KiCad y Mermaid).

La distribucion publica en este repositorio es un GGUF cuantizado en Q4_K_M de 1,80 GB, pensado para ejecutarse en CPU sobre portatiles, mini PCs tipo Intel N100 o hosts edge clase Raspberry Pi con aproximadamente 2,4 GB de RAM activa, sin dependencia de APIs en la nube. El modelo base en BF16 (5,76 GB) se distribuye en un repositorio separado para inferencia con vLLM o Transformers y para afinado adicional con LoRA.

Es relevante porque cubre un nicho concreto del desarrollo embedded con un modelo de 3B ejecutable en hardware de bajo coste, con licencia Apache-2.0 y soporte bilingue ingles-indonesio. La model card declara entrenamiento sobre 1.399 trayectorias deduplicadas y verificadas de forma determinista, con un conjunto de 300 muestras retenidas para evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento uso secuencias de 4.096 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (1,80 GB); pesos base en BF16 (5,76 GB) en repositorio separado |
| Idiomas soportados | en, id |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) y safetensors BF16 en el repositorio base |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-3B-Instruct, un transformer decoder-only de 3B parametros, y se afina mediante LoRA con rango 32 y alpha 32 sobre secuencias de 4.096 tokens en precision bf16, usando una GPU NVIDIA L4 y una tasa de aprendizaje de 8e-5 durante 2 epocas completas. El conjunto de entrenamiento consta de 1.399 trayectorias deduplicadas y verificadas de forma determinista, que combinan corpus curados de Hugging Face sobre IoT, FreeRTOS, Arduino y KiCad con escenarios parametricos de ingenieria IoT. La model card menciona 300 muestras retenidas para evaluacion, aunque no se detallan los resultados en la informacion disponible.

El enfasis del entrenamiento esta en la correccion tecnica verificable: evitar configurar pines de solo entrada del ESP32 (GPIO 34, 35, 36, 39) como salida, senalar la necesidad de level shifting al mezclar logica de 3,3 V y 5 V, y no incrustar credenciales reales en firmware o JavaScript, forzando el uso de `secrets.h`, `.env` con `os.getenv` y proxies en el backend. Tambien se cubre la generacion de diagramas en cuatro formatos, con verificacion de cortocircuitos entre alimentacion y tierra en el caso de Wokwi. No se documentan innovaciones de decodificacion especulativa ni mecanismos de atencion alternativos.

## Capacidades

- Generacion de codigo para firmware de Arduino Uno/Nano, ESP32/ESP8266, Raspberry Pi Pico en MicroPython y tareas de FreeRTOS, incluyendo bucles no bloqueantes con `millis()`.
- Integracion de sensores y calibracion: DHT22, BME280, HC-SR04, humedad de suelo, TDS y PZEM-004T, con filtros de media movil, calibracion de dos puntos, guardas frente a `NaN` y tramas JSON Lines por puerto serie.
- Comunicaciones y protocolos: `pyserial` multiplataforma (`COM*` y `/dev/ttyUSB*`) con autodeteccion y reconexion, MQTT con Last Will and Testament, Modbus RS-485 y WebSockets.
- Control de actuadores con failsafe: histeresis en reles y MOSFET para evitar chattering, PWM y servos, y apagado seguro automatico ante fallo de sensor.
- Desarrollo backend y frontend: FastAPI con SQLite y puentes WebSocket, junto con interfaces HTML/CSS/JS responsivas orientadas primero a vista movil.
- Exportacion de diagramas en cuatro formatos: `diagram.json` de Wokwi, YAML de WireViz, esquematicos SVG con Schemdraw y netlists de KiCad via SKiDL, y diagramas de arquitectura en Mermaid.
- Practicas de seguridad por diseno: no incrustar claves de API, contrasenas WiFi ni credenciales MQTT en el codigo generado.
- Soporte bilingue ingles-indonesio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Prototipado rapido de firmware para ESP32: el modelo genera sketches completos con gestion de pines, lectura de sensores y publicacion MQTT, adecuado para iterar sobre placas reales sin partir de cero y con avisos explicitos sobre pines de solo entrada.
- Diseno de pipelines de telemetria en produccion industrial ligera: combinando `pyserial` con reconexion automatica, tramas JSON Lines y un backend FastAPI con SQLite, el modelo produce el codigo de adquisicion y persistencia para un nodo edge.
- Generacion de dashboards mobile-first para operadores de planta: el modelo escribe HTML/CSS/JS responsivos y el puente WebSocket correspondiente, de modo que el personal consulta lecturas de sensores desde el movil sin desarrollo frontend adicional.
- Documentacion de cableado y esquematicos: a partir de una descripcion de componentes, el modelo emite `diagram.json` para simular en Wokwi, YAML de WireViz para el arnes fisico y netlists de KiCad, lo que reduce el trabajo manual de documentacion electrica.
- Revision de seguridad en codigo embedded: el modelo puede emplearse para auditar sketches existentes en busca de credenciales incrustadas, pines mal configurados o ausencia de failsafe en actuadores.
- Formacion y docencia en sistemas embebidos: al ejecutarse en un portatil con unos 2,4 GB de RAM y sin conexion, sirve como asistente local en aulas o talleres con conectividad limitada.
- Despliegue en entornos air-gapped: la variante Q4_K_M corre en mini PCs o SBC sin acceso a Internet, lo que encaja en plantas con requisitos de aislamiento de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona 300 muestras retenidas de evaluacion, pero no incluye las metricas obtenidas.

## Requisitos de hardware

- VRAM/RAM para inferencia: aproximadamente 2,4 GB de RAM activa con la cuantizacion Q4_K_M de 1,80 GB; el repositorio base en BF16 ocupa 5,76 GB y requiere GPU para un rendimiento adecuado.
- GPU recomendadas: para BF16, una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, L4 o A10); para cuantizaciones GGUF, la CPU es suficiente.
- Cabe en GPU de consumo: si, en cualquier GPU con 6-8 GB o mas para el formato BF16; en el caso de GGUF Q4_K_M funciona enteramente en CPU.
- Opciones de despliegue: llama.cpp para GGUF; vLLM y Transformers para el repositorio safetensors BF16; conversion a MLX para Apple Silicon segun la model card; Ollama y TGI no se mencionan explicitamente pero son compatibles con GGUF y safetensors respectivamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| Lensetek-IoT-Coder-3B | 3,09 B | no disponible | en, id | Apache-2.0 | GGUF, safetensors | IoT y embedded especializado |
| Qwen2.5-Coder-3B-Instruct | 3,09 B | 32.768 tokens (segun documentacion publica de Qwen) | multilingue | Apache-2.0 | safetensors, GGUF | Codigo general |
| Qwen2.5-Coder-1.5B-Instruct | 1,54 B | 32.768 tokens (segun documentacion publica de Qwen) | multilingue | Apache-2.0 | safetensors, GGUF | Codigo general, menor huella |
| Lensetek-Edge-Loop-3B | 3,09 B (derivado) | no disponible | en, id | Apache-2.0 | GGUF, safetensors | Agente edge con bucle agentico |

La comparativa con Qwen2.5-Coder se basa en datos publicos del modelo base; los datos de contexto de Lensetek-IoT-Coder no se detallan en la informacion proporcionada. Frente al modelo base, la especializacion en IoT reduce el alcance generalista a cambio de correccion tecnica en dominios embedded y exportacion de diagramas.

## Limitaciones y advertencias

- El alcance esta deliberadamente restringido a IoT y sistemas embebidos; el rendimiento en tareas generales de codigo o conversacion puede ser inferior al del Qwen2.5-Coder-3B-Instruct original.
- Solo se declaran ingles e indonesio; no hay soporte documentado de castellano, lo que limita su uso en equipos hispanohablantes sin traduccion intermedia.
- La model card no publica resultados de benchmarks ni el contexto maximo soportado, lo que dificulta estimar su calidad frente a alternativas.
- Riesgo de alucinacion en APIs de sensores, registros de microcontroladores y nombres de pines no cubiertos por el conjunto de entrenamiento; conviene validar el codigo generado en hardware real o en simulador antes de produccion.
- El conjunto de entrenamiento es pequeno (1.399 trayectorias), lo que puede reducir la cobertura ante combinaciones de perifericos poco frecuentes.
- Aunque se entrena para evitar credenciales incrustadas, la generacion de codigo de seguridad nunca debe desplegarse sin revision humana.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se distribuye tal cual.
- El repositorio GGUF registra 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/lensetek/lensetek-iot-coder-3b-GGUF
- Repositorio base BF16: https://huggingface.co/lensetek/lensetek-iot-coder-3b
- Modelo complementario Edge-Loop GGUF: https://huggingface.co/lensetek/lensetek-edge-loop-3b-GGUF
- Modelo complementario Edge-Loop base: https://huggingface.co/lensetek/lensetek-edge-loop-3b
- Hub de aplicacion Edge AI Agent: https://huggingface.co/lensetek/lensetek-edge-ai-agent
- Modelo base Qwen2.5-Coder-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Licencia Apache-2.0: https://opensource.org/licenses/Apache-2.0
