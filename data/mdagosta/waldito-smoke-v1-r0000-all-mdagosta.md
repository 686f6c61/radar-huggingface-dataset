# mdagosta/waldito-smoke-v1-r0000-all-mdagosta

## Resumen

El modelo `mdagosta/waldito-smoke-v1-r0000-all-mdagosta` es un export de la familia OpenWALDO publicado por el usuario mdagosta en Hugging Face. Se trata de un modelo de generación de texto de arquitectura Llama causal estándar, compatible con la librería Transformers, y con un tamaño de 820.736 parámetros totales según los pesos en safetensors del repositorio. Es, por tanto, un modelo de escala muy reducida (menos de un millón de parámetros), muy lejos de los modelos de propósito general actuales.

La característica diferencial declarada en la model card es el uso del tokenizador de bytes "schema-1" de OpenWALDO, que requiere cargarse con `trust_remote_code=True`. El repositorio incluye además dos artefactos de trazabilidad: `BOM.json`, que inventaría todos los ficheros de la release, y `EU-BOM.json`, que mapea la divulgación de contenido de entrenamiento exigida por el reglamento europeo de IA (GPAI). Esto sugiere que el paquete está orientado a flujos de trabajo de cumplimiento y cadena de suministro de modelos, más que a uso productivo directo.

La relevancia de esta ficha es fundamentalmente práctica: por su nombre ("smoke"), su revisión inicial (`r0000`) y su tamaño, encaja en la categoría de modelos de prueba de humo para validar pipelines de despliegue antes de sustituirlos por un modelo real. No hay información pública sobre datos de entrenamiento, idiomas, licencia ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama causal language model (Transformers, `LlamaForCausalLM`) |
| Parametros totales | 820.736 (segun safetensors del repositorio) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones oficiales; solo pesos safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (repositorio basado en Transformers) |

## Arquitectura y entrenamiento

La model card indica que el paquete utiliza la arquitectura Llama causal-language-model estándar de Transformers, es decir, un transformer decoder-only con atención causal. No se especifican la profundidad, el número de cabezas de atención, la dimensión oculta ni la longitud de contexto máxima; el único dato estructural verificable es el recuento de 820.736 parámetros en los pesos safetensors. El tokenizador es un tokenizador de bytes propietario identificado como "schema-1" de OpenWALDO, que exige `trust_remote_code=True` para su carga, lo que implica la ejecución de código remoto incluido en el repositorio.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o instrucción supervisada. La presencia de `EU-BOM.json` apunta a que el autor mantiene una declaración de contenido de entrenamiento para el reglamento europeo de modelos de propósito general, pero el contenido de ese fichero no se ha facilitado. Tampoco se describen innovaciones técnicas (decodificación especulativa, atención lineal, mezclas de expertos, SSM híbridos, etc.).

## Capacidades

- Generación de texto autorregresiva: es la tarea declarada en el pipeline del repositorio (`text-generation`).
- Conversación: el repositorio incluye la etiqueta `conversational`, aunque no se documenta ningún formato de plantilla de chat.
- Compatibilidad con Transformers y Text Generation Inference: las etiquetas `transformers`, `text-generation-inference` y `endpoints_compatible` indican que el paquete puede servirse con esas herramientas.
- Tokenización a nivel de byte: el tokenizador "schema-1" de OpenWALDO opera sobre bytes, según la model card.
- Trazabilidad de artefactos: incluye `BOM.json` (inventario de la release) y `EU-BOM.json` (mapeo de divulgación GPAI de la UE).
- Razonamiento, código, matemáticas, visión, audio, tool calling, function calling, agentes, capacidades multilingües y modo de pensamiento: no disponibles en la información proporcionada. Dado el tamaño de 820.736 parámetros, no es razonable esperar ninguna de estas capacidades en uso real.

## Casos de uso

- Prueba de humo de pipelines de inferencia: el propio nombre del modelo (`smoke-v1`) y su tamaño inferior a un millón de parámetros lo hacen adecuado para verificar que un endpoint de `text-generation` arranca, carga pesos y devuelve tokens antes de desplegar un modelo grande en el mismo entorno.
- Validación de despliegues con Text Generation Inference: al llevar la etiqueta `text-generation-inference` y `endpoints_compatible`, permite comprobar la configuración de TGI, el enrutado de peticiones y el formato de respuesta de la API sin consumir GPU de gama alta.
- Pruebas de integración de la ruta `trust_remote_code`: sirve para validar en un entorno aislado que el flujo de carga de código remoto del tokenizador de bytes funciona con la versión de Transformers instalada, un paso habitualmente problemático en producción.
- Verificación de herramientas de cadena de suministro: los ficheros `BOM.json` y `EU-BOM.json` permiten probar escáneres de inventario de artefactos y flujos de declaración de contenido de entrenamiento exigidos por el reglamento europeo de IA, usando un repositorio pequeño y de bajo coste.
- Pruebas de cuantización y exportación: con 820.736 parámetros, se puede ensayar el pipeline completo de conversión a GGUF u otros formatos y de cuantización a 8 o 4 bits en segundos, validando el script antes de aplicarlo a un modelo de miles de millones de parámetros.
- Docencia y depuración de código de inferencia: resulta útil para inspeccionar el comportamiento interno de un transformer decoder-only, el bucle de generación y el manejo del KV cache en un modelo cuyo forward pass es prácticamente instantáneo. No es apto para tareas de usuario final como atención al cliente, generación de código en producción o resumen de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: en fp32, 820.736 parámetros × 4 bytes ≈ 3,3 MB; en fp16/bf16 ≈ 1,6 MB; en int8 ≈ 0,8 MB. Son estimaciones derivadas del recuento de parámetros; el consumo real de memoria incluiría activaciones y KV cache, cuyo tamaño depende de una longitud de contexto que no se ha publicado.
- GPU recomendadas: cualquier GPU con al menos unos pocos megabytes libres de memoria, incluidas tarjetas integradas. No requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en GPU integradas o en CPU sin aceleración dedicada.
- Opciones de despliegue: Transformers (librería declarada), Text Generation Inference (etiqueta presente) y endpoints compatibles. No se documenta compatibilidad explícita con llama.cpp, Ollama o vLLM, aunque el formato safetensors y la arquitectura Llama permitirían intentar la conversión con herramientas externas.
- Latencia y throughput estimados: no disponibles. Dado el tamaño, se espera una latencia muy baja, pero no hay datos publicados que lo confirmen.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo analizado, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| waldito-smoke-v1-r0000-all-mdagosta | 820.736 | No disponible | No disponible | Hugging Face, 127 descargas, 0 likes |
| TinyLlama-1.1B | ~1.100 millones | 2.048 tokens | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Qwen2.5-0.5B | ~490 millones | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente adoptado |
| SmolLM-135M | ~135 millones | No disponible en la informacion consultada | Apache 2.0 | Hugging Face |

La diferencia de escala es de tres a cuatro órdenes de magnitud entre este modelo y los modelos pequeños de propósito general, lo que refuerza su carácter de artefacto de prueba y no de alternativa funcional.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No hay información sobre la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos de género, raza, idioma o dominio.
- Riesgo de alucinación: no evaluado. Un modelo de 820.736 parámetros tiene una capacidad de modelado del lenguaje muy limitada y no debe usarse para generar información factual.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados. El tokenizador de bytes permite en principio procesar cualquier secuencia UTF-8, pero eso no implica competencia lingüística en ningún idioma concreto.
- Restricciones de licencia: la licencia no está disponible. Sin una licencia explícita, el uso comercial queda en una situación jurídica indeterminada y no debería asumirse permiso de uso.
- Ejecución de código remoto: la carga del tokenizador requiere `trust_remote_code=True`, lo que implica ejecutar código Python incluido en el repositorio. Debe hacerse solo en entornos aislados y tras auditar los ficheros del paquete.
- Estado del artefacto: el sufijo `r0000` y el tamaño del repositorio (0,0 GB) sugieren una revisión inicial y un artefacto mínimo. Convive en el mismo perfil con otras revisiones, como `waldito-smoke-v1-r0002-merge`.
- Producción: no se recomienda su uso en ningún flujo orientado a usuario final. Su valor está en la validación técnica de infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdagosta/waldito-smoke-v1-r0000-all-mdagosta
- Perfil del autor: https://huggingface.co/mdagosta
- Inventario de la release (`BOM.json`): https://huggingface.co/mdagosta/waldito-smoke-v1-r0000-all-mdagosta/blob/main/BOM.json
- Divulgación de contenido de entrenamiento UE GPAI (`EU-BOM.json`): https://huggingface.co/mdagosta/waldito-smoke-v1-r0000-all-mdagosta/blob/main/EU-BOM.json
- Revisión relacionada mencionada en el perfil del autor: https://huggingface.co/mdagosta/waldito-smoke-v1-r0002-merge
- Paper, blog o repositorio adicional: no disponible en la información consultada.
