# experimentalmachines/LFM3-VL-2B-MobileAgent

## Resumen

LFM3-VL-2B-MobileAgent es un ajuste fino del modelo multimodal LiquidAI/LFM3-VL-2B, desarrollado por experimentalmachines, especializado en operar un telefono Android a partir de capturas de pantalla. El modelo recibe una captura por paso junto con el objetivo del usuario, la lista de aplicaciones instaladas y el historial de los ultimos ocho pasos, y emite una intencion breve seguida de una unica accion en JSON compacto con coordenadas normalizadas en una rejilla de 0 a 1000. Esta pensado como agente de interfaz grafica (GUI agent) para automatizacion de tareas moviles.

El modelo parte de la arquitectura LFM3-VL de 2B parametros de LiquidAI (1.918.181.888 parametros reales segun safetensors) y se entrena mediante LoRA SFT de rango 64 y alpha 128 sobre el modelo de lenguaje, con la torre de vision congelada, fusionando despues el adaptador en los pesos. El entrenamiento consistio en 1.250 pasos con 32 filas por paso, tasa de aprendizaje 2e-4 (0,43 epocas sobre 92.229 filas) en una unica A100. El conjunto de datos MobileAgent-SFT incorpora filas FilledIntents en el prompt final, 2.386 episodios de navegacion seguida de respuesta y respuestas ScreenQA mas cortas.

Su relevancia radica en que demuestra que un modelo de 2B parametros puede ejecutarse en un telefono de gama alta (Snapdragon 8 Elite) a unos 39 segundos por paso, frente a los aproximadamente 1.100 segundos de alternativas de tamano similar, lo que lo hace viable para inferencia local en dispositivo. En el benchmark AndroidWorld con semillas reservadas obtiene 54 puntos sobre 348 tareas, ligeramente por encima de GUI-Owl-1.5-2B (47), aunque la ventaja no es estadisticamente significativa (p = 0,60) y en MobileWorld queda claramente por detras (6 frente a 22).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3-VL (modelo base LiquidAI/LFM3-VL-2B), ajuste fino con LoRA SFT y fusion de pesos; torre de vision congelada |
| Parametros totales | 1.918.181.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit GGUF (1,30 GB con su proyector de vision); pesos safetensors en el repo principal |
| Idiomas soportados | ingles (en) |
| Licencia | lfm1.0 (other) |
| Formato de pesos | safetensors (transformers); GGUF disponible en repo separado; adaptador LoRA en `lora_adapter/` |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del LFM3-VL-2B de LiquidAI, un modelo vision-lenguaje que procesa una captura de pantalla redimensionada a un maximo de 880 x 880 pixeles de area (aproximadamente 720 tokens de imagen) junto con texto. El ajuste se realizo con LoRA SFT de rango 64 y alpha 128 aplicado solo al modelo de lenguaje, manteniendo congelada la torre de vision; posteriormente el adaptador se fusiono en los pesos, aunque se conserva una copia en `lora_adapter/`. El entrenamiento se ejecuto en una unica A100 durante 1.250 pasos con 32 filas por paso, tasa de aprendizaje 2e-4, lo que equivale a 0,43 epocas sobre 92.229 filas del dataset MobileAgent-SFT.

Los datos de entrenamiento combinan tres componentes: filas FilledIntents en el prompt final (que incluyen reglas de decision entre responder y completar, y la lista de aplicaciones instaladas), 2.386 episodios de navegacion seguida de respuesta generados por Qwen3-VL-8B-Instruct y verificados con una segunda llamada y una comprobacion tipada estricta, y respuestas ScreenQA mas cortas. No se utilizaron tareas, variantes, trayectorias ni verificadores de AndroidWorld en el entrenamiento. La decodificacion se realiza con modo de pensamiento activado y temperatura 0, y la salida sigue el formato `` seguido de una accion JSON.

## Capacidades

- Generacion de acciones de interfaz grafica sobre Android: clic, pulsacion larga, entrada de texto, desplazamiento, abrir aplicacion, navegar atras, ir a inicio, pulsar enter, esperar, responder y marcar estado.
- Razonamiento de siguiente accion a partir de una unica captura de pantalla por paso.
- Respuesta a preguntas del objetivo mediante la accion `answer`, con formato corto y en el formato solicitado.
- Distincion entre objetivos que requieren respuesta y objetivos que solo requieren completarse, gracias a las reglas del prompt FilledIntents.
- Uso de la lista de aplicaciones instaladas para evitar inventar nombres de aplicaciones.
- Historial de texto de los ultimos ocho pasos en formato `n. <intencion> -> <accion JSON>`.
- Capacidades multimodales heredadas del modelo base: MMStar 52,9% y MMLU 50,4%, sin cambio significativo respecto al modelo base.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: si, mediante el bucle de captura-accion con historial de ocho pasos.
- Capacidades multilingues: solo ingles.

## Casos de uso

- Automatizacion de tareas repetitivas en Android: el modelo puede ejecutar secuencias de clics, desplazamientos y entradas de texto sobre una aplicacion concreta, usando la captura actual y el historial de ocho pasos para mantener el contexto de la tarea.
- Pruebas de interfaz de usuario automatizadas: integrado en un pipeline de CI para Android, puede recorrer flujos de la aplicacion y verificar que las pantallas responden como se espera, con la ventaja de ejecutarse en CPU de telefono a unos 39 segundos por paso.
- Asistencia a usuarios con movilidad reducida: el modelo puede interpretar un objetivo en lenguaje natural y traducirlo en acciones concretas sobre la pantalla, respondiendo preguntas sobre el contenido visible mediante la accion `answer`.
- Extraccion de informacion de pantallas: dado un objetivo de consulta, el modelo navega hasta la pantalla relevante y devuelve una respuesta corta en el formato solicitado, con una precision estricta de respuesta de 0,868 sobre 136 preguntas reservadas.
- Agentes locales en dispositivo: al caber en 1,30 GB en cuantizacion 4-bit GGUF, puede desplegarse en un telefono de gama alta sin conexion a la nube, lo que resulta adecuado para escenarios de privacidad o conectividad limitada.
- Investigacion en agentes GUI: sirve como linea base reproducible para estudiar el rendimiento de modelos pequenos en AndroidWorld y MobileWorld, con un arnes de evaluacion comun y comparaciones preregistradas.
- Automatizacion de respuestas a preguntas sobre la pantalla: el modelo responde 6 de las 25 tareas de pregunta de la semilla 30, frente a 0 de las versiones Dev anteriores, lo que lo hace util para asistentes que deben leer y resumir informacion visible.

## Benchmarks y rendimiento

| Benchmark | LFM3-VL-2B-MobileAgent | GUI-Owl-1.5-2B | MAI-UI-2B |
|---|---|---|---|
| AndroidWorld, semillas reservadas 7 / 1234 / 2026 (348 tareas) | 54 (18 / 17 / 19) | 47 | no ejecutado |
| AndroidWorld, semilla 30 (116 tareas, desarrollo) | 18 | 23 | 32 |
| MobileWorld (105 tareas GUI en ingles) | 6 | 22 | 11 |
| CPU de telefono (Snapdragon 8 Elite Extreme Gen 6), segundos por paso | ~39 | ~1.100 | ~1.063 |
| GPU Apple M5, mediana de segundos por paso | 2,96 | 7,00 | 9,35 |

En la comparacion offline, la precision de paso de alto y bajo nivel en AndroidControl test es de 0,728 y 0,908 respectivamente; la coincidencia estricta de respuesta en 136 preguntas reservadas es de 0,868, con 0 respuestas falsas en 80 controles de objetivo de accion. En MMStar y MMLU obtiene 52,9% y 50,4%, sin cambio significativo respecto al modelo base. La comparacion principal frente a GUI-Owl en semillas reservadas muestra +2,0 puntos con intervalo de confianza del 95% de [−4,5, +8,6] y p = 0,60: no inferior en el margen preregistrado de −6,9 puntos, pero sin superioridad demostrada. En MobileWorld, GUI-Owl es claramente superior (p = 3 × 10⁻⁵).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base tiene 1.918.181.888 parametros, por lo que en cuantizacion 4-bit GGUF ocupa 1,30 GB incluyendo el proyector de vision.
- GPU recomendadas: A100 para entrenamiento (una unidad); para inferencia se ha evaluado en GPU Apple M5 y en CPU de telefono Snapdragon 8 Elite Extreme Gen 6.
- Cabe en GPU de consumo: si, en cuantizacion 4-bit GGUF (1,30 GB) cabe en cualquier GPU de consumo con al menos 2 GB de VRAM libre; en safetensors en precision completa requiere aproximadamente 4 GB.
- Opciones de despliegue: llama.cpp con el GGUF de 4 bits (usado en la evaluacion), transformers con los pesos safetensors, y el adaptador LoRA en `lora_adapter/` para reutilizacion. vLLM, Ollama y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: aproximadamente 39 segundos por paso en CPU de Snapdragon 8 Elite Extreme Gen 6; mediana de 2,96 segundos por paso en GPU Apple M5. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AndroidWorld (reservadas) | MobileWorld | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent | 1,92B | no disponible | 54 | 6 | lfm1.0 | Hugging Face |
| GUI-Owl-1.5-2B | no disponible | no disponible | 47 | 22 | no disponible | no disponible |
| MAI-UI-2B | no disponible | no disponible | no ejecutado | 11 | no disponible | no disponible |

La comparativa se limita a los datos publicados en la model card. LFM3-VL-2B-MobileAgent destaca en eficiencia de inferencia (39 s por paso en CPU de telefono frente a ~1.100 s de GUI-Owl y ~1.063 s de MAI-UI) y en AndroidWorld con semillas reservadas, mientras que GUI-Owl-1.5-2B es claramente superior en MobileWorld y MAI-UI-2B lo es en la semilla 30 de desarrollo.

## Limitaciones y advertencias

- Modelo de investigacion: no debe operar de forma desatendida en un telefono con cuentas reales, mensajes o pagos.
- Solo acepta objetivos en ingles y una unica captura por paso.
- No tiene memoria mas alla del historial de texto de ocho pasos.
- Entrenado unicamente con demostraciones grabadas; nunca ha interactuado con el entorno real durante el entrenamiento.
- La ventaja frente a GUI-Owl en AndroidWorld no es estadisticamente significativa (p = 0,60) y no se demuestra superioridad.
- Rendimiento claramente inferior a GUI-Owl en MobileWorld (6 frente a 22), lo que sugiere poca generalizacion fuera de AndroidWorld.
- Riesgo de alucinacion en nombres de aplicaciones mitigado parcialmente por la lista de aplicaciones instaladas en el prompt, pero no eliminado.
- Licencia lfm1.0 (other): es necesario revisar el archivo LICENSE para conocer las restricciones de uso comercial.
- Las respuestas a preguntas se limitan a 6 de las 25 tareas de pregunta de la semilla 30, por lo que la cobertura de objetivos informativos es baja.
- Sin datos publicados sobre sesgos especificos del ajuste fino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Version GGUF 4-bit: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-GGUF
- Version previa Dev-FilledIntents: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-FilledIntents
- Dataset MobileAgent-SFT: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT
- Guia de nomenclatura: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Repositorio del proyecto: https://github.com/ExperimentalMachines/lfm3-mobile-agent
