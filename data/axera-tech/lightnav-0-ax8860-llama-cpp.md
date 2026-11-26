# AXERA-TECH/LightNav-0-AX8860-llama.cpp

## Resumen

LightNav-0-AX8860-llama.cpp es un paquete de despliegue, publicado por AXERA-TECH, que permite ejecutar el modelo de navegación encarnada LightNav-0 sobre la NPU de cuatro núcleos del SoC Axera AX8860 mediante llama.cpp. LightNav-0 es un modelo construido sobre Qwen3-VL-4B (4.432.477.949 parámetros) que recibe un historial de imágenes en primera persona y una instrucción de navegación en lenguaje natural, y produce un token de apuntamiento y tres tokens de acción RVQ que el cliente incluido decodifica en diez waypoints.

El interés de este repositorio no reside en un nuevo modelo de lenguaje, sino en la ingeniería de despliegue: cuantización NVFP4 del backbone lingüístico (2,7 GB), codificador visual mantenido en BF16 (0,8 GB) por resultar demasiado lossy en NVFP4 para la tarea, y tres grafos axmodel compilados para la NPU (ViT, prefill y decode, con la cabeza de salida integrada en decode). El resultado es una latencia de 1,45 s por petición de navegación con 64 fotogramas de historial y 975 tokens de prompt, y un decode de 60,1 tokens/s en texto.

El paquete está pensado para robótica embebida y prototipado de navegación visual y lingüística (VLN) en hardware de bajo consumo, con servidor compatible con la API de OpenAI y licencia Apache-2.0. Su validación es todavía preliminar: solo se ha probado con fotogramas sintéticos y los benchmarks oficiales de VLN-CE, ObjectNav y seguimiento no se han ejecutado sobre este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) basado en Qwen3-VL-4B; codificador visual ViT + LLM; salida de navegación con token de apuntamiento y 3 tokens de acción RVQ |
| Parametros totales | 4.432.477.949 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 9216 tokens por defecto (configurable con `CTX=<n>`) |
| Tipos de cuantizacion | NVFP4 para el LLM (`lightnav-0-nvfp4.gguf`, 2,7 GB); BF16 para el codificador visual (`LightNav-0-MMPROJ-BF16.gguf`, 0,8 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) + axmodel compilados para NPU AX8860 |
| Tamano del repositorio | 3,7 GB |
| Pipeline | robotics |
| Hardware objetivo | Axera AX8860, NPU de 4 nucleos, SDK V0.6.0 |
| Prefill batch | 256 filas fijas (`-b`/`-ub` = 256) |
| Servidor | `-np 1` (una sola ranura, ocupa los 4 nucleos NPU) |

## Arquitectura y entrenamiento

LightNav-0 se apoya en Qwen3-VL-4B: un codificador visual tipo ViT que procesa el historial de fotogramas en primera persona y un backbone lingüístico transformer que fusiona esas representaciones con la instrucción de navegación. La salida no es texto libre, sino una secuencia compacta compuesta por un token de apuntamiento y tres tokens de acción pertenecientes a un vocabulario RVQ (residual vector quantization); el cliente incluido en el paquete traduce esos tokens, mediante los codebooks de `action_tokenizer/`, en diez waypoints de trayectoria.

El proceso de selección de fotogramas sigue el procedimiento oficial del modelo: agrupación por niveles SlowFast, tubelets de dos fotogramas, marcas temporales relativas y un factor de pooling espacial por nivel (1, 2 o 4). En la inferencia se usa `--mmproj-linear-pos`, que asigna posiciones secuenciales a los tokens de imagen en lugar de mRoPE, para coincidir con la implementación oficial. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos no están disponibles en la información proporcionada.

La innovación técnica del repositorio es el pipeline de despliegue: cuantización NVFP4 del LLM con verificación de equivalencia token a token frente a la misma GGUF ejecutada en CPU, codificador visual en BF16 por pérdida de precisión inaceptable en NVFP4, y compilación de tres grafos axmodel de cuatro núcleos con la cabeza de salida fusionada en el grafo de decode.

## Capacidades

- Navegación encarnada visual y lingüística: dada una secuencia de imágenes en primera persona y una instrucción ("go to the doorway and stop in front of it"), genera una trayectoria de diez waypoints.
- Predicción de acciones discretas mediante tokens RVQ decodificables con codebooks incluidos.
- Comprensión de imágenes: el paquete incluye `llama-mtmd-cli` y un ejemplo de descripción de imagen (`bus.jpg`).
- Generación de texto y completado de texto mediante `llama-cli` y `llama-completion`.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`), con soporte de texto, imagen y peticiones de navegación.
- Procesamiento de historial visual multitrama con selección de fotogramas por niveles SlowFast y pooling espacial configurable por imagen.
- Capacidades multilingües: no disponible (los idiomas soportados no se especifican).
- Tool calling, function calling, modo thinking, audio y agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Navegación de robot móvil indoor: el robot envía su historial de cámara en primera persona (hasta 64 fotogramas) junto con una instrucción de destino y recibe diez waypoints que puede seguir con su controlador local; la latencia de 1,45 s por petición encaja en bucles de planificación de baja frecuencia.
- Prototipado de VLN en hardware embebido: el paquete permite validar políticas de navegación visual y lingüística sobre una AX8860 sin GPU, con consumo y coste propios de un SoC de borde.
- Investigación en seguimiento de instrucciones espaciales: útil para experimentar con selección de fotogramas (SlowFast, tubelets, pooling espacial) y medir su impacto en la trayectoria generada.
- Descripción de escenas para teleoperación asistida: el servidor OpenAI-compatible permite enviar una imagen y obtener una descripción textual del entorno, integrable en interfaces de operador remoto.
- Servicio local de inferencia multimodal: `run.sh -s 18700` levanta un endpoint compatible con OpenAI para texto e imagen, reutilizable por otras aplicaciones del robot o del laboratorio.
- Evaluación comparativa de cuantización: el paquete permite contrastar NVFP4 en NPU frente a NVFP4 en CPU y frente al modelo BF16 original, útil para estudiar el impacto de la cuantización en tareas de control.
- Docencia y demostraciones de robótica: el conjunto de scripts (`run.sh`, `bench.sh`, `sample/`) y las entradas fijas permiten reproducir resultados sin infraestructura adicional.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Peticion de navegacion (64 fotogramas, 975 prompt tokens) | 1,45 s | ViT + prefill 0,97 s, 6 tokens de salida |
| Decode (texto) | 60,1 tokens/s | Greedy, sin cache de prompt |
| Decode (peticion de navegacion) | 52,5 tokens/s | Greedy, sin cache de prompt |
| Carga del modelo (server, con codificador visual) | 10 s | AX8860, SDK V0.6.0 |
| Perplejidad (`ppl_zh.txt`, `-c 512`, 3 segmentos) | 13,86 | En placa |

Todas las cifras proceden de `sh bench.sh` sobre una AX8860 con SDK V0.6.0, decodificación greedy y sin reutilización de caché de prompt. No se han publicado resultados en los benchmarks oficiales de navegación (VLN-CE, ObjectNav, seguimiento) sobre este paquete, ni cifras de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: placa Axera AX8860 con runtime del SDK en `/opt/lib` (SDK V0.6.0). No es un paquete ejecutable en GPU convencional tal cual.
- NPU: utiliza los cuatro núcleos del SoC; el servidor se lanza con `-np 1`.
- Memoria: pesos de 3,5 GB en total (2,7 GB LLM NVFP4 + 0,8 GB codificador visual BF16); el repositorio ocupa 3,7 GB.
- Contexto: 9216 tokens por defecto, ajustable con `CTX=<n>`; el grafo de prefill está fijado a 256 filas, por lo que `-b`/`-ub` deben mantenerse en 256.
- Cliente de navegación: requiere Python 3 y NumPy (instalable en `pylib/` con `python3 -m pip install --target pylib numpy`); `bench.sh` solo necesita `wget`.
- Despliegue: binarios estáticos incluidos (`llama-server`, `llama-completion`, `llama-mtmd-cli`, `llama-cli`, `llama-perplexity`, `llama-bench`), con la revisión de llama.cpp indicada en `BIN_COMMIT`.
- VRAM en GPU, GPU recomendadas, compatibilidad con vLLM/TGI/Ollama y throughput en hardware x86: no disponible.
- Latencia y throughput medidos: ver tabla de benchmarks (1,45 s por petición de navegación, 60,1 tokens/s en texto).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Despliegue |
|---|---|---|---|---|---|
| LightNav-0-AX8860-llama.cpp | 4.432.477.949 | 9216 | Navegacion VLN sobre Qwen3-VL-4B, salida RVQ | Apache-2.0 | NPU AX8860 via llama.cpp |
| LightOriginsHQ/LightNav-0 (modelo base) | 4.432.477.949 | no disponible | Navegacion VLN, pesos originales BF16 | Apache-2.0 | GPU/CPU, framework original |
| Qwen3-VL-4B | aproximadamente 4B | no disponible | VLM generalista (vision + lenguaje) | no disponible | Multiples backends |
| Otros modelos VLN embebidos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es frente al modelo base: este paquete intercambia precisión (NVFP4 en el LLM) por capacidad de ejecución en NPU, con equivalencia token a token frente a la misma cuantización en CPU. No se dispone de datos de benchmarks comparativos con otras políticas VLN en la información proporcionada.

## Limitaciones y advertencias

- Validación limitada: solo se ha probado con fotogramas sintéticos; los benchmarks oficiales (VLN-CE, ObjectNav, seguimiento) no se han ejecutado sobre este paquete.
- Dependencia de hardware: requiere una placa AX8860 y el SDK V0.6.0; no es portable a GPU sin trabajo adicional.
- La cuantización NVFP4 introduce diferencias frente al modelo BF16 original; el codificador visual no admite NVFP4 por pérdida de precisión inaceptable para navegación.
- Una sola ranura de servidor (`-np 1`) y uso exclusivo de los cuatro núcleos NPU: no apto para servir múltiples clientes concurrentes.
- Restricciones de forma: `-b`/`-ub` fijados a 256 por el grafo de prefill; el contexto por defecto es 9216.
- Idiomas soportados no especificados; el rendimiento multilingüe no está documentado.
- Sesgos, tasas de alucinación y comportamiento fuera de distribución: no disponible.
- Licencia Apache-2.0, que permite uso comercial, pero el usuario debe verificar las obligaciones de atribución y las licencias de los componentes de terceros incluidos (binarios de llama.cpp, codebooks, SDK de Axera).
- En producción robótica, la salida de waypoints debe tratarse como propuesta de alto nivel sujeta a verificación de seguridad y a un controlador de bajo nivel.

## Enlaces

- Hugging Face: https://huggingface.co/AXERA-TECH/LightNav-0-AX8860-llama.cpp
- Modelo base: https://huggingface.co/LightOriginsHQ/LightNav-0
- Repositorio de llama.cpp usado en la compilación: https://github.com/ZHEQIUSHUI/llama.cpp
- Paper, blog o demo oficiales: no disponible
