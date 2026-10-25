# patrickbdevaney/LLaDA2.2-mini-orin-nano

## Resumen

`patrickbdevaney/LLaDA2.2-mini-orin-nano` es una conversión cuantizada y empaquetada del modelo `inclusionAI/LLaDA2.2-mini`, un LLM de difusión (dLLM) con arquitectura Mixture-of-Experts de 16 000 millones de parámetros totales y 1 400 millones activos por token. El paquete no es un checkpoint compatible con Transformers: son ficheros en el formato de «tiles» propietario del motor `llada2-orin-cuda`, escrito en CUDA puro por el mismo autor, que sirve el modelo con una API compatible con OpenAI.

El objetivo concreto es ejecutar el modelo en una Jetson Orin Nano Super de 8 GB de memoria unificada con una ventana de 32 000 tokens, algo inviable con los pesos en BF16. Para lograrlo, los expertos enrutados se cuantizan con GPTQ de grupo 128 en una base rotada de Hadamard, con anchos de bits por experto (mayoritariamente 2 bits, algunos 3 y 4 bits) seleccionados contra un presupuesto de memoria calculado para 32K de contexto; el resto de componentes (atención, experto compartido, MLP densa de la capa 0 y `lm_head`) se guarda a 8 bits.

Su relevancia es doble: por un lado demuestra que un MoE de difusión de 16B puede caber en un dispositivo edge de 8 GB con contexto largo; por otro, es un artefacto altamente específico, con un único autor, cero descargas y cero valoraciones en el momento de la ficha, y depende por completo de un repositorio de motor externo para funcionar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts con decodificación por difusión (dLLM); generación por pasos de denoising de 32 tokens |
| Parámetros totales | 16B (modelo base `inclusionAI/LLaDA2.2-mini`) |
| Parámetros activos | 1,4B |
| Longitud de contexto | 32K tokens (presupuesto de memoria del motor) |
| Tipos de cuantización | Expertos enrutados: GPTQ grupo 128 en base rotada de Hadamard, mixto 2/3/4 bits por experto (mayoría 2 bits); no-expertos (atención, experto compartido, MLP densa capa 0) y `lm_head`: GPTQ 8 bits; embeddings: fp16; caché KV en runtime: int4 (claves por canal por bloque de 32 tokens, valores por token) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | Formato de tiles propio del motor (`.bin`: `experts_L*.bin`, `nonexpert_L*.bin`, `lm_head.bin`, `lm_head_split.bin`, `embed.bin`, `small.bin`) más `engine.idx` como índice; no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es un LLM de difusión con mezcla de expertos: en lugar de generar token a token de forma autorregresiva, produce bloques de 32 tokens mediante pasos iterativos de denoising, lo que el motor del autor mide explícitamente (~25 ms por paso de 32 tokens a 1K de contexto en la Orin Nano Super con relojes fijados). Los 16B de parámetros se reparten en expertos enrutados más un experto compartido, con solo 1,4B activos por token, lo que reduce el coste computacional por paso a cambio de un mayor coste de memoria.

Esta conversión no reentrena el modelo: aplica cuantización GPTQ de grupo 128 sobre los expertos enrutados en una base rotada de Hadamard, con anchos de bits asignados por experto según un plan de cuantización (`QUANT_PLAN.md` en el repositorio del motor) ajustado a un presupuesto de memoria para 32K de contexto. El resto de matrices se cuantiza a 8 bits y los embeddings se mantienen en fp16 con mapeo de memoria en el host. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto mediante difusión con denoising iterativo en bloques de 32 tokens, no autorregresiva.
- Razonamiento matemático: el autor reporta 96 problemas de matemáticas generados en su conjunto de evaluación interno.
- Generación de código: 12 tareas de código verificadas contra tests en el mismo conjunto de evaluación.
- Tool calling / function calling: incluye `tool_declaration_ts.py` del modelo base sin modificar y supera 8 pruebas de llamadas a herramientas.
- Contexto largo de 32K tokens, sostenido mediante caché KV int4 y un presupuesto de memoria calculado para ese contexto.
- Servido con API compatible con OpenAI a través del motor `llada2-orin-cuda`, lo que permite integrarlo como backend de clientes existentes.
- Capacidades multimodales (visión, audio): no disponibles; no se mencionan en la información.
- Cobertura multilingüe: no disponible; el autor no declara idiomas soportados.

## Casos de uso

- Inferencia local en robótica edge: el paquete está dimensionado para una Jetson Orin Nano Super de 8 GB, de modo que el modelo puede ejecutarse a bordo de un robot o dron sin conexión a la nube, manteniendo 32K de contexto para instrucciones de misión e historial de sensores textual.
- Asistente de código offline: con ~150-180 tok/s declarados en tareas de código y matemáticas, es viable como autocompletado o generador de parches en un puesto de trabajo aislado o en un entorno de laboratorio sin acceso externo.
- Agentes con tool calling en dispositivo: al exponer una API compatible con OpenAI y soportar declaración de herramientas, puede actuar como planificador local que invoca funciones del propio dispositivo (control de actuadores, consultas a bases de datos locales) con latencia de decenas de milisegundos por paso.
- Evaluación de razonamiento matemático en hardware de bajo consumo: útil para comparar el comportamiento de un dLLM cuantizado frente al modelo BF16 en problemas aritméticos, con la advertencia de que el conjunto de prueba del autor es de 96 ítems.
- Prototipado de servicios LLM en flotas de dispositivos: al ser un servidor OpenAI-compatible, permite levantar un endpoint en cada unidad y medir consumo y throughput reales antes de decidir un despliegue mayor.
- Investigación sobre modelos de difusión de lenguaje: el formato de tiles y el motor en CUDA puro permiten estudiar el efecto de distintos anchos de bits por experto en la calidad de muestreo, algo que las herramientas de cuantización estándar no exponen.
- Sustitución de un checkpoint BF16 cuando la memoria es la restricción: en entornos donde no caben 16B en BF16 pero sí 6,7 GB de ficheros cuantizados, ofrece una vía de ejecución con degradación acotada según el autor (113-116 de 116 en su prueba interna).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta una evaluación interna del motor:

| Prueba | Composición | Resultado |
|---|---|---|
| Test puntuado del motor | 96 problemas de matemáticas generados + 12 tareas de código verificadas contra tests + 8 llamadas a herramientas | 113-116 / 116 |
| Throughput en Jetson Orin Nano Super (relojes fijados) | Tareas de matemáticas, código y tool calling | ~180 tok/s con los ajustes de decodificación por defecto del servidor; ~150 tok/s con los del model card |
| Latencia por paso de denoising | 32 tokens, contexto de 1K | ~25 ms |

Los fallos reportados no son errores aritméticos: el autor indica que los casos perdidos tienen aritmética correcta y un dígito final repetido, y señala la repetición ocasional como el coste visible principal de los expertos a 2 bits. No hay verificación independiente de estas cifras ni comparación con el modelo BF16 en las mismas pruebas más allá de la afirmación cualitativa de que la cuantización penaliza sobre todo a los expertos enrutados.

## Requisitos de hardware

- Dispositivo objetivo: Jetson Orin Nano Super con 8 GB de memoria unificada; es el único hardware para el que el autor ha dimensionado el paquete.
- Espacio en disco: 6,7 GB de repositorio, más el espacio del motor compilado.
- Memoria: el reparto de bits por experto está calculado contra un presupuesto de memoria que permite 32K de contexto en 8 GB; no se documenta el consumo exacto en runtime.
- GPU de escritorio: no disponible; el autor no reporta cifras para A100, H100 ni RTX 4090, y los ficheros no son cargables por Transformers, por lo que no se pueden usar con `from_pretrained` en esas GPU sin adaptar el motor.
- Cabe en GPU consumer: no confirmado; el diseño apunta a memoria unificada de 8 GB, no a VRAM discreta.
- Opciones de despliegue: exclusivamente el motor `patrickbdevaney/llada2-orin-cuda` (compilación con `make`, servidor `server.py` con `--model` y `--engine` apuntando al directorio descargado). No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos es propietario.
- Latencia y throughput: ~25 ms por paso de denoising de 32 tokens a 1K de contexto, ~180 tok/s con ajustes por defecto del servidor y ~150 tok/s con los del model card, medidos con relojes fijados en la Orin Nano Super.
- Nota de advertencia: los relojes fijados (clocks pinned) implican un perfil térmico y de consumo concreto; en condiciones móviles o con disipación limitada las cifras pueden no sostenerse.

## Comparativa con modelos similares

La información proporcionada solo permite comparar con el modelo base del que deriva. No se documentan otras alternativas equivalentes (mismo tamaño, misma tarea o mismo hardware objetivo) con datos verificables.

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `patrickbdevaney/LLaDA2.2-mini-orin-nano` | 16B totales, 1,4B activos | 32K | Tiles propios; expertos mixtos 2/3/4 bits, resto 8 bits | Apache-2.0 | Público en Hugging Face, 0 descargas; requiere motor externo |
| `inclusionAI/LLaDA2.2-mini` (base) | 16B totales, 1,4B activos | no disponible | BF16 (checkpoint estándar) | Apache-2.0 | Público en Hugging Face |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un checkpoint de Transformers: los `.bin` son un formato de tiles del motor y no se pueden cargar con `AutoModel` ni convertir sin herramientas propias. Sin el repositorio `llada2-orin-cuda` el paquete es inutilizable.
- Dependencia de un único proyecto de motor mantenido por el mismo autor, sin versión publicada ni gobernanza; es un riesgo directo para producción.
- Artefactos de repetición: el propio autor documenta dígitos finales repetidos y repeticiones ocasionales atribuibles a los expertos a 2 bits; en aplicaciones sensibles a formato (finanzas, parsing estricto) esto puede romper validadores.
- La evaluación de calidad se limita a 116 ítems de un test interno del motor, sesgado hacia matemáticas, código y tool calling; no hay MMLU, HumanEval ni GSM8K reportados, ni validación por terceros.
- Riesgo de alucinación: no evaluado en la información disponible, y los modelos de difusión con cuantización agresiva pueden degradarse de forma menos predecible que los autorregresivos.
- Idiomas soportados no declarados: no se puede asumir buen rendimiento en castellano ni en idiomas distintos del inglés sin pruebas propias.
- Restricciones de licencia: Apache-2.0 permite uso comercial con atribución y conservación del aviso; el autor pide crédito a inclusionAI y LLaDA2.2 para el modelo. Nada en la información indica restricciones adicionales, pero conviene revisar la licencia del motor por separado, ya que no se detalla.
- El perfil de rendimiento depende de relojes fijados; sin ellos el throughput puede caer de forma notable en una Jetson alimentada por batería.
- Cero descargas y cero valoraciones implican ausencia de evidencia de la comunidad sobre estabilidad o reproducibilidad.
- Fecha de publicación (25 de octubre de 2026) y estado del repositorio: no hay historial de mantenimiento ni issues documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patrickbdevaney/LLaDA2.2-mini-orin-nano
- Modelo base: https://huggingface.co/inclusionAI/LLaDA2.2-mini
- Motor de inferencia (repositorio del autor): https://github.com/patrickbdevaney/llada2-orin-cuda
- Plan de cuantización: `QUANT_PLAN.md` dentro del repositorio del motor
- Paper, blog o demo oficial: no disponibles en la información proporcionada
- Nota: la búsqueda web realizada devolvió únicamente resultados sin relación con el modelo (marca de ropa Syna World), por lo que no se incluyen como enlaces relevantes.
