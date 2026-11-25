# lensetek/lensetek-iot-coder-3b

## Resumen

Lensetek-IoT-Coder-3B es un modelo de lenguaje de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones) especializado en programación para sistemas embebidos e Internet de las Cosas, desarrollado por lensetek. Se trata de un ajuste fino (fine-tuning) supervisado del modelo base Qwen/Qwen2.5-Coder-3B-Instruct, orientado a cubrir el ciclo completo de un proyecto IoT: firmware para Arduino, ESP32, ESP8266 y Raspberry Pi Pico, protocolos de comunicación (pyserial, MQTT con LWT, Modbus RS-485), backends con FastAPI y SQLite, y exportación de diagramas de circuito en cuatro formatos distintos (Wokwi, WireViz, Schemdraw/SKiDL hacia KiCad, y Mermaid).

El modelo se distribuye en dos variantes dentro del ecosistema del autor: este repositorio canónico en precisión completa BF16 con pesos safetensors (5,76 GB), pensado para servir con vLLM, transformers o SGLang, convertir a MLX en Apple Silicon o reentrenar con LoRA/GRPO, y una versión cuantizada Q4_K_M en GGUF de 1,80 GB para ejecución en CPU, Ollama y llama.cpp. La licencia es Apache-2.0 y los idiomas declarados son inglés e indonesio, lo que refleja el enfoque del autor hacia el mercado técnico del sudeste asiático.

Su relevancia radica en la especialización vertical: frente a modelos de código generalistas, incorpora convenciones de seguridad de hardware (evitar pines de solo entrada del ESP32 como GPIO 34, 35, 36 y 39 configurados como salida, distinguir niveles lógicos de 3,3 V y 5 V, prohibir secretos embebidos en código cliente) y una orientación "mobile-first" en las interfaces que genera. Con 3B de parámetros y una ventana de contexto heredada de la familia Qwen2.5, se posiciona como una opción ligera para asistentes de desarrollo embebido que deben ejecutarse en hardware modesto o en entornos aislados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajuste fino de Qwen2.5-Coder-3B-Instruct |
| Parametros totales | 3.085.938.688 (aproximadamente 3,09 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-3B-Instruct) |
| Tipos de cuantizacion | BF16 (este repositorio); Q4_K_M en GGUF en el repositorio hermano; el autor menciona soporte para Q2_K a Q8_0 |
| Idiomas soportados | en (ingles), id (indonesio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16); GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-3B-Instruct: un transformer decoder-only con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos SSM. El modelo de este repositorio es el resultado de un ajuste fino supervisado sobre dicho modelo base, orientado a dominios de ingeniería IoT. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; el autor menciona únicamente la posibilidad de adaptación posterior con LoRA/GRPO por parte de terceros.

La innovación técnica destacable no reside en la arquitectura, sino en la curación del dominio: el ajuste entrena al modelo para emitir cuatro formatos de diagrama verificables (diagram.json de Wokwi validado contra cortocircuitos entre VCC y GND, ficheros YAML de WireViz con colores de cable y especificaciones de conector, esquemas vectoriales Schemdraw y netlists de KiCad generados vía SKiDL, y diagramas Mermaid de arquitectura y flujo de telemetría), además de inculcar convenciones de firmware no bloqueante con millis() y patrones de filtrado y calibración de sensores. No se documentan técnicas de decodificación especulativa ni atención lineal.

## Capacidades

- Generación de firmware para Arduino, ESP32, ESP8266 y Raspberry Pi Pico, con patrones no bloqueantes basados en millis().
- Filtrado y calibración de sensores, control de actuadores con histéresis y lógica de failsafe.
- Programación de comunicaciones embebidas: pyserial, MQTT con Last Will and Testament (LWT) y Modbus RS-485.
- Desarrollo de backends con FastAPI, SQLite y WebSocket para telemetría.
- Generación de dashboards interactivos con enfoque mobile-first.
- Exportación de diagramas de circuito y sistema en cuatro formatos: Wokwi (diagram.json), WireViz (YAML), Schemdraw/SKiDL hacia KiCad (Python y netlist) y Mermaid.
- Depuración de pinout de hardware y aplicación de convenciones de seguridad eléctrica (pines de solo entrada del ESP32, niveles lógicos de 3,3 V frente a 5 V).
- Gestión segura de credenciales mediante secrets.h y ficheros .env, evitando secretos embebidos en código cliente.
- Capacidades multilingües limitadas a inglés e indonesio técnico.
- Soporte de conversación multi-turno (etiqueta "conversational" en los metadatos).
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso en este repositorio; el autor remite a un modelo compañero (Lensetek-Edge-Loop-3B) para bucles agénticos.

## Casos de uso

- Asistente de desarrollo IoT de alta concurrencia vía API: el modelo puede desplegarse con vLLM o TGI para servir peticiones de generación de firmware a múltiples desarrolladores, aprovechando su tamaño de 3B para mantener costes de inferencia bajos y latencia reducida en GPUs de gama media.
- Generación de firmware de producción para ESP32: el modelo produce código con temporización no bloqueante mediante millis(), gestión de histéresis en actuadores y lógica de reconexión, lo que reduce el tiempo de desarrollo de prototipos y evita errores comunes de bloqueo del bucle principal.
- Documentación automática de cableado: a partir de una descripción textual del proyecto, el modelo emite ficheros YAML de WireViz con colores de cable y especificaciones de conector, útiles para fabricación de arneses y revisión por parte de técnicos de montaje.
- Validación temprana de esquemas eléctricos: la generación de diagram.json de Wokwi validado contra cortocircuitos VCC-GND permite simular el circuito antes de comprar componentes, lo que es adecuado para equipos con ciclos de prototipado ajustados.
- Integración en pipelines de CI/CD para firmware embebido: el modelo puede generar y revisar código de plataformas como PlatformIO, detectando trampas como configurar GPIO 34, 35, 36 o 39 del ESP32 como salida, lo que ayuda a prevenir fallos en placas reales.
- Backend de telemetría para proyectos de sensores: genera servicios FastAPI con SQLite y WebSocket que reciben datos de dispositivos y los exponen en dashboards mobile-first, adecuado para despliegues pequeños o industriales ligeros.
- Formación y onboarding de ingenieros en sistemas embebidos: al estar especializado en convenciones de seguridad de hardware y en indonesio técnico además de inglés, sirve como tutor para equipos del sudeste asiático que trabajan con microcontroladores.
- Conversión y adaptación local: al distribuirse en BF16 safetensors, permite convertir a MLX para Apple Silicon o aplicar LoRA sobre bibliotecas propietarias de sensores y hardware, útil para empresas con stack de hardware no público.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 6,2 GB de pesos más overhead de activaciones y caché KV; se recomienda un mínimo de 8 GB de VRAM para contexto corto y 12-16 GB para contextos largos.
- VRAM estimada con la cuantización Q4_K_M del repositorio hermano: aproximadamente 1,80 GB de pesos, ejecutable en CPU con menos de 2,5 GB de RAM según el autor.
- GPU recomendadas: NVIDIA A100, H100 o L40S para servicio de alta concurrencia con vLLM o SGLang; RTX 4090, RTX 3090 o RTX A6000 para desarrollo e inferencia en BF16; GPUs de 8 GB como RTX 3070 o RTX 4060 Ti para BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM en BF16; en la variante Q4_K_M cabe incluso en equipos sin GPU dedicada.
- Opciones de despliegue: vLLM, transformers, SGLang y conversión a MLX para Apple Silicon en este repositorio; Ollama y llama.cpp con la variante GGUF Q4_K_M; también es compatible con text-generation-inference según los metadatos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Dimensión | Lensetek-IoT-Coder-3B (BF16) | Qwen2.5-Coder-3B-Instruct (base) | Lensetek-Edge-Loop-3B (compañero) | Modelos locales de 7B-14B |
|---|---|---|---|---|
| Precisión y tamaño | 5,76 GB BF16 (o 1,80 GB Q4_K_M) | aproximadamente 6 GB BF16 | aproximadamente 6 GB BF16 | 14-28 GB BF16 |
| Enfoque principal | Firmware IoT, serial/MQTT, UI móvil y 4 formatos de diagrama | Programación general | RAG industrial aislado y bucles de herramientas | Programación y razonamiento general |
| Seguridad de pines y diagramas IoT | Entrenada y verificada explícitamente | Genérica, errores ocasionales de pines | Centrada en JSON operativo de herramientas | Requiere prompting cuidadoso |
| Soporte bilingüe ID + EN técnico | Sí, indonesio técnico nativo | Mayoritariamente inglés | SOP industrial en indonesio nativo | Mayoritariamente inglés |
| Licencia | Apache-2.0 | Apache-2.0 (según modelo base) | no disponible en la información | Variable según modelo |

## Limitaciones y advertencias

- El modelo hereda los sesgos del corpus de Qwen2.5-Coder-3B-Instruct; no se documenta una evaluación de sesgos específica para este ajuste.
- Riesgo de alucinación en referencias de hardware: aunque el autor declara validación contra cortocircuitos VCC-GND en diagram.json y convenciones de pines, no se especifican tasas de error medidas, por lo que la verificación humana del esquema y del pinout sigue siendo necesaria antes de fabricar.
- Cobertura lingüística limitada a inglés e indonesio; no se declara soporte de castellano ni de otros idiomas, lo que restringe su uso en equipos hispanohablantes sin traducción intermedia.
- Longitud de contexto no documentada en este repositorio; debe consultarse la ficha del modelo base para planificar prompts largos con múltiples ficheros de firmware.
- El autor no publica resultados de benchmarks ni comparativas cuantitativas, lo que impide validar de forma independiente las afirmaciones de calidad frente al modelo base.
- Ausencia de soporte documentado de tool calling o function calling en este repositorio; para flujos agénticos el autor remite a un modelo compañero distinto.
- Aunque la licencia es Apache-2.0 y permite uso comercial, conviene revisar las obligaciones de atribución y las condiciones del modelo base Qwen2.5-Coder-3B-Instruct antes de redistribuir.
- El repositorio presenta cero descargas y cero "likes" en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad; debe tratarse como un modelo de nicho sin adopción contrastada.

## Enlaces

- Repositorio Hugging Face (BF16 safetensors): https://huggingface.co/lensetek/lensetek-iot-coder-3b
- Variante GGUF Q4_K_M: https://huggingface.co/lensetek/lensetek-iot-coder-3b-GGUF
- Modelo compañero Edge-Loop-3B (BF16): https://huggingface.co/lensetek/lensetek-edge-loop-3b
- Modelo compañero Edge-Loop-3B (GGUF): https://huggingface.co/lensetek/lensetek-edge-loop-3b-GGUF
- Hub de aplicación Edge AI Agent: https://huggingface.co/lensetek/lensetek-edge-ai-agent
- Modelo base Qwen2.5-Coder-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Licencia Apache-2.0: https://opensource.org/licenses/Apache-2.0
