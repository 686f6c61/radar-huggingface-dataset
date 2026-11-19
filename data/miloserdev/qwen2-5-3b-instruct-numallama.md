# miloserdev/Qwen2.5-3B-Instruct-numallama

## Resumen

Qwen2.5-3B-Instruct-numallama es una conversión del modelo Qwen/Qwen2.5-3B-Instruct (desarrollado por Alibaba Qwen) a un formato propietario de pesos binarios para numallama, un motor de inferencia en C orientado a servidores CPU con ejecución consciente de NUMA (Non-Uniform Memory Access) en máquinas multi-socket. El modelo original es un transformer decoder-only de 3.000 millones de parámetros con capacidad de instrucciones, y esta versión preserva sus pesos cuantizados en Q4 y Q8 para su uso en entornos donde no hay GPU disponible.

La relevancia de esta ficha es doble: por un lado, documenta el modelo base Qwen2.5-3B-Instruct, que es una referencia habitual en la categoría de modelos pequeños de instrucciones; por otro, describe un formato de despliegue muy específico (numallama) que no es compatible con llama.cpp, Ollama, LM Studio ni transformers. El autor es miloserdev, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una conversión reciente y de nicho.

El modelo resuelve el problema de ejecutar un LLM de 3B en servidores ARM64 multi-socket (Ampere Altra, AWS Graviton, Neoverse) aprovechando todos los sockets mediante planificación NUMA. El contexto, los idiomas y los benchmarks del modelo base no se detallan en la información proporcionada, por lo que se indican como no disponibles cuando corresponde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct); motor de inferencia numallama en C |
| Parámetros totales | 3.000 millones (modelo base Qwen2.5-3B-Instruct) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el README remite a las opciones del motor numallama) |
| Tipos de cuantización | Q4 asimétrica (grupos de 32, escala y mínimo en fp16, con importance matrix) y Q8 int8 con escalas por grupo (SmoothQuant) |
| Idiomas soportados | no disponible en la información proporcionada (la importance matrix se recogió sobre inglés, ruso, chino y código) |
| Licencia | Qwen Research License (qwen-research), uso no comercial únicamente |
| Formato de pesos | `.bin` propietario de numallama (no es GGUF; no compatible con llama.cpp, Ollama, LM Studio ni transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-3B-Instruct es un transformer decoder-only de 3.000 millones de parámetros. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en el modelo original; estos datos deben consultarse en la model card de Qwen/Qwen2.5-3B-Instruct. La conversión a numallama no reentrena el modelo: solo transforma los pesos a un formato binario propio y aplica cuantización.

La innovación técnica de esta ficha no está en el modelo, sino en el motor de inferencia. numallama es un motor en C para CPU con ejecución consciente de NUMA, diseñado para repartir la carga entre todos los sockets de una máquina multi-socket. La cuantización Q4 es asimétrica con grupos de 32 y usa una importance matrix recogida por numallama sobre texto en inglés, ruso, chino y código. La cuantización Q8 es int8 con escalas por grupo (SmoothQuant). El motor está optimizado para ARM64 con dot product NEON (Ampere Altra, AWS Graviton, núcleos Neoverse); en otras CPUs, incluido x86-64, ejecuta código C portable no optimizado. El README menciona soporte de decodificación especulativa entre las opciones del motor.

## Capacidades

- Generación de texto e instrucciones: el modelo base Qwen2.5-3B-Instruct está entrenado para seguir instrucciones y mantener conversaciones multi-turno.
- Razonamiento y matemáticas: capacidades heredadas del modelo base; no se detallan métricas en la información disponible.
- Generación de código: la importance matrix de la cuantización Q4 incluye texto de código, lo que sugiere soporte para este dominio.
- Tool calling / function calling: el README de numallama menciona "tools" entre las opciones del motor, lo que indica soporte de herramientas a nivel de motor; no se detalla el formato exacto.
- Modo agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada; la importance matrix cubre inglés, ruso, chino y código.
- Capacidades especiales (visión, audio, thinking mode): no disponibles en la información proporcionada.
- Servidor compatible con OpenAI: numallama expone un endpoint `/v1` en `http://127.0.0.1:8080/v1`.

## Casos de uso

- Inferencia en servidores ARM64 sin GPU: el modelo se ejecuta en Ampere Altra, AWS Graviton u otros núcleos Neoverse usando numallama, lo que permite desplegar un LLM de 3B en instancias ARM64 de nube o en servidores bare-metal sin acelerador. Es adecuado porque el motor está optimizado con NEON para estas arquitecturas.
- Aprovechamiento de máquinas multi-socket: en servidores con dos o más sockets, numallama reparte la ejecución entre todos ellos con planificación NUMA, lo que permite usar toda la capacidad de cómputo de la máquina para un único chat o servidor.
- Chat interactivo en terminal: el comando `./runq ... -m chat` permite usar el modelo como asistente de línea de comandos en un servidor Linux, útil para tareas de administración, redacción o consulta de documentación sin salir del terminal.
- Servicio compatible con OpenAI para integraciones existentes: el modo `-m server -P 8080` expone una API compatible con `/v1`, lo que permite conectar clientes que ya hablan el protocolo de OpenAI sin cambiar el código de la aplicación.
- Prototipado y evaluación de modelos pequeños: al ser una conversión de Qwen2.5-3B-Instruct, sirve para comparar el comportamiento del modelo base en cuantización Q4 frente a Q8 en el mismo motor, con 2,1 GB y 3,3 GB de pesos respectivamente.
- Despliegue en entornos con restricciones de memoria: la variante Q4 ocupa 2,1 GB y decodifica a 107 tok/s en el hardware de referencia (2 × Ampere Altra Max M128-30, 256 núcleos Neoverse N1), lo que la hace viable en nodos con poca RAM frente a la variante Q8 de 3,3 GB y 79 tok/s.
- Investigación sobre cuantización: la Q4 usa importance matrix y la Q8 usa SmoothQuant, lo que permite estudiar el impacto de ambas técnicas en la calidad de salida de un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README solo proporciona velocidades de decodificación medidas en hardware concreto:

| Variante | Pesos | Tamaño | Velocidad de decodificación |
|---|---|---:|---:|
| `qwen2.5-3b-instruct-q4.bin` | Q4 asimétrica | 2,1 GB | 107 tok/s |
| `qwen2.5-3b-instruct-q8.bin` | Q8 (SmoothQuant) | 3,3 GB | 79 tok/s |

Las velocidades se midieron en un solo chat sobre 2 × Ampere Altra Max M128-30 (256 núcleos Neoverse N1, ambos sockets). El autor advierte que otras máquinas diferirán.

## Requisitos de hardware

- VRAM: no aplica; el motor es de CPU. Memoria RAM necesaria: aproximadamente 2,1 GB para Q4 y 3,3 GB para Q8, más el overhead del motor y del contexto.
- GPU recomendadas: no aplica; numallama es un motor de CPU.
- CPU recomendadas: ARM64 con NEON dot product (Ampere Altra, AWS Graviton, núcleos Neoverse). En x86-64 y otras CPUs se ejecuta código C portable no optimizado.
- ¿Cabe en GPU consumer? No aplica; no hay soporte de GPU en la información proporcionada.
- Opciones de despliegue: exclusivamente numallama (compilado con `make` desde el repositorio de GitHub). No es compatible con vLLM, llama.cpp, Ollama, LM Studio, TGI ni transformers.
- Latencia y throughput: 107 tok/s (Q4) y 79 tok/s (Q8) en 2 × Ampere Altra Max M128-30 con 256 núcleos; no se proporcionan datos para otros hardware.
- Requisitos de software: Linux, compilador de C, `huggingface_hub` para la descarga de pesos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct-numallama | 3B | no disponible | `.bin` propietario / numallama | Qwen Research (no comercial) | Hugging Face, 0 descargas |
| Qwen2.5-3B-Instruct (original) | 3B | no disponible | safetensors / transformers | Qwen Research (no comercial) | Hugging Face, modelo base |
| Otras conversiones de Qwen2.5-3B-Instruct | 3B | no disponible | GGUF / llama.cpp, Ollama | Qwen Research (no comercial) | no disponible en la información proporcionada |

La comparativa se limita al modelo base y a conversiones del mismo modelo; no se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia no comercial: la Qwen Research License restringe el uso a fines no comerciales; cualquier despliegue en producción con ánimo de lucro requiere revisar los términos del modelo base.
- Formato propietario: los pesos `.bin` solo funcionan con numallama; no se pueden cargar en llama.cpp, Ollama, LM Studio ni transformers, lo que limita la portabilidad.
- Optimización exclusiva para ARM64: en x86-64 y otras arquitecturas el motor ejecuta código C portable no optimizado, con rendimiento presumiblemente muy inferior al reportado.
- Sesgos conocidos: no disponibles en la información proporcionada; deben evaluarse en la model card del modelo base.
- Riesgo de alucinación: inherente a los modelos de 3B; no se han publicado evaluaciones específicas para esta conversión.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada; la importance matrix cubre inglés, ruso, chino y código, pero no se garantiza un rendimiento equivalente en otros idiomas.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (2026-11-19), lo que indica ausencia de validación comunitaria.
- Compatibilidad de herramientas: el README menciona soporte de "tools" en numallama, pero no se detalla el formato ni la compatibilidad con el tool calling del modelo base.

## Enlaces

- [Hugging Face: miloserdev/Qwen2.5-3B-Instruct-numallama](https://huggingface.co/miloserdev/Qwen2.5-3B-Instruct-numallama)
- [Modelo base: Qwen/Qwen2.5-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct)
- [Licencia del modelo base](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE)
- [Repositorio de numallama en GitHub](https://github.com/miloserdev/numallama)
- [README de numallama (opciones del motor)](https://github.com/miloserdev/numallama#readme)
