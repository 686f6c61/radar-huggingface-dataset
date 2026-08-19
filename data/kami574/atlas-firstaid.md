# Kami574/Atlas-FirstAid

## Resumen

Atlas-FirstAid es un modelo de lenguaje ligero, especializado en proporcionar guía de primeros auxilios y asistencia en emergencias, diseñado para funcionar en entornos completamente desconectados o con recursos muy limitados. Desarrollado por Ismet Beljulji (usuario Kami574), este modelo es un fine-tuning del modelo base Qwen/Qwen2.5-1.5B-Instruct, realizado con el framework Unsloth sobre el dataset FirstAidQA, que contiene 5.500 pares de preguntas y respuestas extraídos del libro certificado *Vital First Aid Book*.

El modelo resuelve el problema de la falta de acceso a información médica fiable durante desastres, cortes de infraestructura o emergencias en zonas remotas donde no hay conexión a internet. Su relevancia radica en que, gracias a su tamaño compacto (1.543.714.304 parámetros) y su cuantización principal en GGUF Q4_K_M (aproximadamente 986 MB), puede ejecutarse en dispositivos móviles y hardware de bajo consumo mediante llama.cpp, preservando la privacidad del usuario al no requerir conexión a servidores externos. La arquitectura es un transformer decoder-only (Qwen2.5) y la longitud de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (principal, ~986 MB); posiblemente otros formatos GGUF no especificados |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF y safetensors (el repositorio contiene ambos, aunque la cuantización principal es GGUF) |

## Arquitectura y entrenamiento

Atlas-FirstAid se basa en la arquitectura Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal, optimizado para instrucciones y diálogo. El proceso de fine-tuning se realizó con Unsloth, una librería diseñada para entrenamiento eficiente de modelos grandes, sobre el dataset FirstAidQA, que consta de 5.500 pares de preguntas y respuestas derivados del libro certificado *Vital First Aid Book* (presentado en el NeurIPS 2025 Workshop on Muslims in ML). No se menciona el uso de RLHF, DPO u otras técnicas de alineación adicionales; el entrenamiento se limita a un fine-tuning supervisado sobre el dataset de primeros auxilios. La innovación principal del modelo no reside en la arquitectura, sino en su adaptación para ejecución en edge: la cuantización GGUF Q4_K_M y el uso de llama.cpp como motor de inferencia permiten su despliegue en dispositivos móviles y hardware de bajo consumo, lo que lo hace adecuado para escenarios offline y de emergencia.

## Capacidades

- Generación de texto instructivo y paso a paso para primeros auxilios, con priorización de seguridad vital (verificación de respiración, vías aéreas, etc.).
- Conversación multi-turno: puede mantener diálogos guiados con el usuario para recopilar información sobre la situación y adaptar las instrucciones.
- Seguimiento de un system prompt específico que define el comportamiento del asistente, incluyendo la obligación de indicar cuándo contactar con servicios de emergencia (911/112).
- Capacidad de ejecución offline: no requiere conexión a internet, lo que permite su uso en entornos aislados.
- Limitado al idioma inglés; no se han documentado capacidades multilingües.
- No se ha documentado soporte para tool calling, funciones, visión, audio u otras modalidades.

## Casos de uso

- Asistencia en emergencias sin cobertura: el modelo puede proporcionar instrucciones de primeros auxilios en zonas rurales, montañas o desiertos donde no hay señal móvil. Gracias a su tamaño reducido y ejecución local, funciona en smartphones o dispositivos portátiles.
- Aplicación móvil Nova F-R (Nova First Response): Atlas-FirstAid es el motor de esta app de código abierto diseñada para ofrecer guía médica paso a paso durante desastres naturales, cortes de infraestructura o emergencias en la naturaleza, sin depender de servidores externos.
- Formación y entrenamiento en primeros auxilios: puede utilizarse como herramienta educativa para practicar protocolos de respuesta ante accidentes, quemaduras, hemorragias o paradas cardiorrespiratorias, ofreciendo retroalimentación estructurada.
- Guía para personal no médico en situaciones críticas: bomberos, policías, profesores o voluntarios pueden consultar el modelo en el lugar del incidente para recordar los pasos correctos de actuación antes de que lleguen los servicios médicos.
- Integración en dispositivos IoT o wearables: su bajo consumo permite embeberse en relojes inteligentes o dispositivos de emergencia que detectan caídas o accidentes y activan automáticamente instrucciones de primeros auxilios.
- Entornos militares o de exploración: unidades desplegadas en zonas sin infraestructura de comunicaciones pueden usar el modelo como referencia médica de emergencia, reduciendo la dependencia de manuales físicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo cuantizado en GGUF Q4_K_M ocupa aproximadamente 986 MB, por lo que cabe en dispositivos con 1-2 GB de RAM libre. En CPU, la memoria requerida es similar (peso del modelo más overhead de ejecución).
- GPU recomendadas: no es necesaria una GPU dedicada; el modelo está pensado para ejecutarse en CPU mediante llama.cpp. En caso de usar GPU, cualquier tarjeta con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, Jetson Nano) sería suficiente.
- Compatibilidad con hardware de consumo: sí, puede ejecutarse en smartphones (Android/iOS) y placas de bajo coste como Raspberry Pi 4/5, siempre que tengan suficiente RAM.
- Opciones de despliegue: llama.cpp (motor principal), Ollama, y cualquier framework compatible con GGUF (por ejemplo, llama-cpp-python, LM Studio).
- Latencia y throughput: no disponibles en la información proporcionada; depende del hardware. En una CPU moderna de gama media, se espera una generación de varios tokens por segundo, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas-FirstAid (Kami574) | 1,54B | No disponible | Primeros auxilios offline | Apache-2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1,54B | 32K (típico de la serie Qwen2.5) | Instrucción general | Apache-2.0 | Hugging Face |
| Llama 3.2 1B Instruct | 1,23B | 128K | Instrucción general | Llama 3.2 Community License | Hugging Face |
| Phi-3 Mini | 3,8B | 128K | Razonamiento general | MIT | Hugging Face |

No se han publicado comparativas de rendimiento específicas de Atlas-FirstAid frente a otros modelos. La comparación anterior se basa en características técnicas generales. La ventaja principal de Atlas-FirstAid es su especialización en primeros auxilios y su optimización para ejecución offline, mientras que los modelos base generales no están entrenados específicamente para este dominio.

## Limitaciones y advertencias

- Solo está disponible en inglés; no se ha entrenado para otros idiomas, lo que limita su uso en zonas hispanohablantes.
- El modelo no es un sustituto de un profesional médico ni de los servicios de emergencia. Las instrucciones generadas pueden ser incompletas o incorrectas en casos complejos; siempre debe indicarse al usuario que contacte con servicios de emergencia cuando sea posible.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar consejos médicos inventados o inexactos si se le pide información fuera del ámbito de su dataset de entrenamiento. El system prompt recomendado incluye la instrucción de no fabricar tratamientos, pero no elimina el riesgo.
- Limitación de dominio: el dataset FirstAidQA cubre primeros auxilios básicos, pero no todas las situaciones médicas posibles (por ejemplo, enfermedades crónicas, intoxicaciones específicas o cirugía).
- La longitud de contexto no está documentada, lo que puede afectar a conversaciones muy largas o a la inclusión de mucha información contextual.
- Aunque la licencia Apache-2.0 permite uso comercial, cualquier aplicación médica debe someterse a validación regulatoria y ética antes de su despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kami574/Atlas-FirstAid
- Repositorio de la aplicación Nova F-R: https://github.com/Neuille-hush/NovaFR
- Dataset FirstAidQA: https://huggingface.co/datasets/i-am-mushfiq/FirstAidQA
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
