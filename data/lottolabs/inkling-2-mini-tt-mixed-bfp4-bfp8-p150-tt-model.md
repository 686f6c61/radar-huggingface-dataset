# Lottolabs/Inkling-2-Mini-TT-Mixed-BFP4-BFP8-P150-tt-model

## Resumen

Inkling-2-Mini-TT-Mixed-BFP4-BFP8-P150 es un paquete de despliegue comunitario que adapta el modelo de lenguaje Inkling-2-Mini, desarrollado originalmente por Thinking Machines Lab, para su ejecución sobre aceleradores Tenstorrent Blackhole p150. El paquete, publicado por Lottolabs, no reentrena el modelo: re-cuantiza los expertos y las proyecciones q/gate de la atención a GPTQ BFP4 y mantiene el resto de los pesos tal y como se publicaron, empaquetándolo con un runtime propio basado en tt-metal y un plugin de vLLM que expone una API compatible con OpenAI.

El modelo base es un transformer MoE con 26.400 millones de parámetros totales y 3.400 millones activos, con 24 capas de las cuales las capas 6 a 17 se ejecutan tres veces (48 aplicaciones de capa por token), 128 expertos por capa con top-8, atención de ventana deslizante combinada con atención completa sin RoPE, y una ventana de contexto nativa de 1.048.576 tokens. Es un modelo orientado a chat de texto, razonamiento, tool calling y trabajo con contexto largo, servido para entre uno y dieciséis usuarios concurrentes sobre una única tarjeta p150.

La relevancia de esta ficha es doble: por un lado documenta un modelo MoE con contexto de un millón de tokens y decodificación especulativa con el drafter incluido en el checkpoint; por otro, ilustra el estado del ecosistema de despliegue sobre hardware no-GPU (Tenstorrent), con perfiles de servicio predefinidos, caché de prefijos exacta y decodificación por lotes de hasta 16 secuencias. El paquete tiene licencia Apache-2.0 y un tamaño de repositorio de 1,2 GB, aunque el checkpoint completo que descarga ocupa unos 36 GB en la caché de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas "looped" (24 capas, las capas 6-17 se aplican tres veces: 48 aplicaciones por token), atención de ventana deslizante + atención completa sin RoPE |
| Parametros totales | 26.400 millones (26,4B) |
| Parametros activos | 3.400 millones (3,4B) |
| Longitud de contexto | 1.048.576 tokens nativos; perfiles de servicio con 65.536, 131.072 y 262.144 tokens |
| Tipos de cuantizacion | GPTQ BFP4 para expertos y proyecciones q/gate de atención; resto en BFP8/BF16 según perfil; KV cache en BF16, BFP8 o BFP4 según perfil |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint empaquetado para tt-metal (no safetensors/GGUF estándar); pesos GPTQ en `native/gptq/` y `checkpoint/` |
| Hardware objetivo | Tenstorrent Blackhole p150 (una tarjeta) |
| Ventana de servicio | Hasta 16 secuencias concurrentes (perfiles `fast`, `long`, `release-256k`); 1 secuencia en `native` y `quality` |
| Decodificación especulativa | Sí, con el drafter incluido en el checkpoint (automática en los perfiles con lotes) |
| Caché de prefijos | Exacta |
| API | Compatible con OpenAI (chat completions, completions, `/v1/models`) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer de mezcla de expertos con una innovación estructural notable: de sus 24 capas, las capas 6 a 17 se ejecutan tres veces cada una, de modo que cada token atraviesa 48 aplicaciones de capa. Cada capa contiene un MoE de 128 expertos con enrutamiento top-8, lo que da 26,4B parámetros totales pero solo 3,4B activos por token. La atención combina ventanas deslizantes con atención completa y prescinde de RoPE, lo que junto con el diseño recurrente permite sostener un contexto nativo de 1.048.576 tokens. El paquete de Lottolabs no modifica el entrenamiento: parte del checkpoint `thinkingmachines/Inkling-2-Mini` (Apache-2.0) y solo re-cuantiza a GPTQ BFP4 los expertos y las proyecciones q/gate de la atención para adaptarlos al acelerador Blackhole.

El despliegue se apoya en un runtime tt-metal personalizado con decodificación trazada (traced decode), decodificación por lotes de hasta 16 secuencias, decodificación especulativa usando el drafter propio del checkpoint y caché de prefijos exacta. Los perfiles de servicio definen planes de memoria distintos: `fast` usa KV en BF16 con un pool compartido de 196.608 tokens y 65.536 de contexto; `long` usa KV BFP8 con pool de 262.144 y 131.072 de contexto; `release-256k` usa K en BFP8 y V en BFP4 con 262.144 de contexto (la configuración sobre la que se midieron las tablas de velocidad del release); `native` da un único usuario con el millón de tokens nativo; y `quality` sube expertos y atención a BFP8 a costa de un decode un 25% más lento. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento: el modelo separa el texto de "thinking" del contenido final; el esfuerzo de razonamiento se ajusta por petición con `reasoning_effort` (valores como `low` o `0.5`, con 0.9 por defecto).
- Tool calling / function calling: parser `inkling2` habilitado; las peticiones con `tools` devuelven `tool_calls` y `finish_reason: tool_calls`.
- Razonamiento multi-paso y uso como agente: la ventana de contexto larga y el soporte de herramientas permiten cadenas de varios pasos con historial extenso.
- Contexto largo: hasta 1.048.576 tokens en el perfil `native` y 262.144 en `release-256k`, con caché de prefijos exacta para reutilizar prefijos repetidos.
- Concurrencia: hasta 16 secuencias simultáneas en los perfiles con lotes, con decodificación especulativa automática.
- Multilingüismo: no disponible (no se documentan idiomas soportados).
- Modalidad: solo texto; las entradas de imagen, audio y vídeo se rechazan con HTTP 400.
- Decodificación determinista y muestreada con semántica exacta de vLLM sobre el dispositivo.

## Casos de uso

- Chat de texto en producción sobre hardware Tenstorrent: el servidor expone la API de OpenAI en el puerto 20000 con `chat completions`, `completions` y `/v1/models`, de modo que aplicaciones existentes pueden apuntar al endpoint sin cambiar de SDK; el perfil `fast` cubre hasta 16 usuarios concurrentes con 65.536 tokens de contexto.
- Asistentes con razonamiento explícito: al separar el texto de pensamiento en el campo `reasoning` y permitir ajustar `reasoning_effort` por petición, encaja en flujos donde se quiere mostrar u ocultar la cadena de razonamiento y controlar el coste por consulta.
- Agentes con tool calling: el parser `inkling2` devuelve `tool_calls` estructurados, lo que permite conectar el modelo a APIs externas, bases de datos o sistemas de ficheros en bucles de varios pasos.
- Análisis de documentos muy largos: con 262.144 tokens en `release-256k` o 1.048.576 en `native`, y caché de prefijos exacta, se pueden procesar contratos, informes o bases de código completas reutilizando el prefijo entre consultas sucesivas.
- Evaluación y prototipado de modelos MoE sobre aceleradores no-GPU: el paquete permite medir calidad (KL frente a referencia BF16) y rendimiento en un p150 sin disponer de GPUs, útil para equipos que exploran alternativas de hardware.
- Servicio interno multiusuario con memoria acotada: los perfiles `fast` y `long` comparten un pool de KV de 196.608 o 262.144 tokens, lo que permite planificar la memoria del dispositivo y limitar el número de secuencias concurrentes de forma explícita.
- Despliegue con requisitos de calidad estrictos: el perfil `quality` (expertos y atención en BFP8) reduce el KL de 0,0112 a 0,0030 a cambio de un decode un 25% más lento, adecuado para tareas donde la fidelidad frente al modelo original es prioritaria.

## Benchmarks y rendimiento

La model card solo publica métricas de calidad teacher-forced frente a una referencia BF16 en CPU del modelo original (18 registros, 10.656 posiciones puntuadas; KL = KL medio(referencia ‖ ejecución)):

| Evaluación | Paquete (perfiles `fast` / `release-256k`) | Perfil `quality` | Ruido BF16 de referencia | Prompts |
|---|---|---|---|---|
| KL, todos los dominios | 0,0112 | 0,0030 | 0,00162 | 18 |
| Acuerdo top-1 de token | 96,6% | 98,1% | 98,7% | 18 |

La model card incluye además una tabla de rendimiento por perfil con columnas ISL/OSL, pero el contenido proporcionado está truncado y no permite reproducir los valores de latencia o throughput. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Acelerador: una tarjeta Tenstorrent Blackhole p150; no es ejecutable en GPU convencionales ni en CPU con este paquete.
- Almacenamiento: unos 36 GB en la caché de Hugging Face para `checkpoint/` y `native/gptq/`, más unos 10 GB para las cachés de kernels y tensores de dispositivo generadas en el primer arranque.
- Tiempo de primer arranque: aproximadamente 10 minutos (compilación de kernels para el dispositivo); los arranques posteriores reutilizan las cachés.
- Software: Tenstorrent CLI (`uv tool install tenstorrent`), Docker y el runtime tt-metal con el plugin de vLLM incluido en el paquete.
- Despliegue: `tt serve Lottolabs/Inkling-2-Mini-TT-Mixed-BFP4-BFP8-P150-tt-model` o, sin tt-cli, `tt-model serve ...`; servidor OpenAI-compatible en el puerto 20000 (o el siguiente libre).
- Memoria: el plan de memoria lo fija cada perfil (`fast`, `long`, `release-256k`, `native`, `quality`); la model card advierte de que no se debe sobrescribir `--max-model-len` porque cada perfil lleva su propio plan.
- Latencia y throughput: no disponibles en la información proporcionada (la tabla de rendimiento está truncada).

## Comparativa con modelos similares

| Modelo | Parámetros (total / activos) | Contexto | Licencia | Hardware / despliegue |
|---|---|---|---|---|
| Inkling-2-Mini (paquete Lottolabs p150) | 26,4B / 3,4B | 1.048.576 nativo; 65.536-262.144 en perfiles | Apache-2.0 | Tenstorrent Blackhole p150, vLLM plugin + tt-metal |
| thinkingmachines/Inkling-2-Mini (original) | 26,4B / 3,4B | 1.048.576 | Apache-2.0 | GPU convencionales con vLLM u otros runtimes (según el release original) |
| Modelos MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparables con alternativas de la misma categoría, por lo que la comparativa se limita a parámetros, contexto, licencia y vía de despliegue.

## Limitaciones y advertencias

- Paquete comunitario: no es un release oficial de Thinking Machines Lab ni de Tenstorrent; el soporte y la validación corren a cargo de Lottolabs.
- Solo texto: las entradas de imagen, audio y vídeo se rechazan con HTTP 400, pese a que el pipeline se anuncia como text-generation.
- Idiomas: no se documenta qué idiomas soporta el modelo base, lo que impide garantizar calidad multilingüe.
- Cuantización agresiva: los expertos y las proyecciones q/gate están en GPTQ BFP4; el KL frente a la referencia BF16 es de 0,0112 en los perfiles por defecto (frente a un ruido de referencia de 0,00162), con un acuerdo top-1 del 96,6%. Para aplicaciones sensibles a la fidelidad conviene el perfil `quality`.
- Riesgo de alucinación: no se publican evaluaciones de veracidad ni de sesgos en la información disponible; debe asumirse el riesgo habitual de un modelo generativo sin datos específicos.
- Restricciones de memoria: el número de secuencias concurrentes y la longitud de contexto están acoplados al perfil elegido; sobrescribir `--max-model-len` puede romper el plan de memoria del perfil.
- Dependencia de hardware: requiere una tarjeta Tenstorrent p150 y el stack tt-metal/tt-cli; no hay ruta de despliegue en GPU o CPU documentada para este paquete.
- Primer arranque lento: la compilación de kernels y la generación de cachés de dispositivo añaden unos 10 minutos y unos 10 GB de almacenamiento adicional.
- Licencia Apache-2.0: permite uso comercial, pero al ser un derivado conviene verificar las condiciones del checkpoint base y de los componentes de terceros (vLLM, tt-metal).

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/Lottolabs/Inkling-2-Mini-TT-Mixed-BFP4-BFP8-P150-tt-model
- Pesos referenciados: https://huggingface.co/Lottolabs/Inkling-2-Mini-TT-Mixed-BFP4-BFP8-P150
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio de manifiestos: https://github.com/LottoLottoLotto/tt-model-bundles
- Fork de tt-metal: https://github.com/LottoLottoLotto/tt-metal/tree/lottolabs/inkling2-mini-p150
- Fork de vLLM: https://github.com/LottoLottoLotto/vllm/tree/lottolabs/inkling2-mini-p150
- Plugins de tt-model: https://github.com/LottoLottoLotto/tt-model-plugins/tree/lottolabs/inkling2-mini-p150
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Tenstorrent CLI (prerrequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
