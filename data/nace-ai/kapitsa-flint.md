# nace-ai/kapitsa-flint

## Resumen

Kapitsa Flint es un artefacto de despliegue publicado por nace-ai que empaqueta los pesos cuantizados a 4 bits del modelo Flint de Recursive (40B totales, 2,5B activos por token) para su ejecución local en Apple Silicon mediante el motor de inferencia Kapitsa. No se trata de un modelo entrenado desde cero por nace-ai, sino de una distribución derivada directamente de `RecursiveSI/flint-int4`, orientada a servir agentes de código en local sobre hardware de Apple sin depender de GPU dedicadas ni de APIs en la nube.

El modelo subyacente es un Mixture of Experts con capacidades declaradas de razonamiento y tool calling, pensado explícitamente para flujos de agente de programación. Kapitsa arranca herramientas como opencode, Claude Code, Codex o pi contra el modelo local y expone APIs compatibles con OpenAI y Anthropic, lo que permite sustituir un backend remoto por inferencia en el propio Mac.

La relevancia de esta ficha es doble: por un lado documenta un caso real de despliegue de un MoE de 40B en memoria unificada de Apple Silicon con cifras de prefill y decode por chip; por otro, ilustra el patrón de publicar en Hugging Face artefactos que son configuraciones de serving más que pesos originales. La licencia declarada es Apache 2.0 y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (transformer disperso); detalles de capas y atención no disponibles |
| Parametros totales | 40B |
| Parametros activos | 2,5B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (22,6 GB); variante 2 bits (11,9 GB) para equipos de 16 GB |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos referenciados en `RecursiveSI/flint-int4`) |

## Arquitectura y entrenamiento

La información disponible confirma únicamente que Flint es un Mixture of Experts de 40B parámetros totales con 2,5B activos por token, lo que sitúa su coste de cómputo por token en el rango de un modelo denso pequeño mientras mantiene la capacidad de un modelo grande. No se especifican el número de expertos, la ratio de activación, el tipo de atención, la longitud de contexto nativa ni la composición del dataset de entrenamiento. Tampoco hay datos sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineación.

El artefacto publicado por nace-ai no aporta información adicional de entrenamiento: es una distribución de pesos ya cuantizados a 4 bits (22,6 GB) tomados de `RecursiveSI/flint-int4`, con una variante a 2 bits (11,9 GB) para equipos con 16 GB de memoria unificada. La innovación técnica relevante no está en el modelo sino en el motor Kapitsa, que implementa prefill y decode optimizados para Apple Silicon y expone endpoints compatibles con OpenAI y Anthropic, además de lanzar herramientas de agente locales.

## Capacidades

- Generación de texto con modo de razonamiento, según la descripción del autor del modelo base.
- Tool calling / function calling, requisito para su uso como backend de agentes de código.
- Integración como backend de agentes de programación: opencode, Claude Code, Codex y pi.
- Exposición de APIs compatibles con OpenAI y Anthropic a través de Kapitsa.
- Ejecución local en Apple Silicon con memoria unificada, sin GPU dedicada.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.
- Longitud de contexto y soporte de multi-step reasoning más allá de lo indicado: no disponible.

## Casos de uso

- Agente de código local en un Mac: Kapitsa arranca Claude Code, Codex, opencode o pi apuntando a Flint servido en local, de modo que el desarrollador mantiene el código y las conversaciones en su máquina sin enviar contexto a un proveedor externo.
- Sustitución de API remota en herramientas compatibles con OpenAI: al exponer un endpoint con el mismo esquema, se puede redirigir un cliente existente al servidor local cambiando únicamente la URL base.
- Desarrollo en entornos con conectividad restringida o políticas de datos estrictas: al ejecutarse sobre pesos descargados y memoria local, no requiere llamadas salientes durante la inferencia.
- Prototipado de flujos de agente con tool calling: el modelo puede invocar funciones definidas por el usuario para leer ficheros, ejecutar tests o consultar documentación, con la ventaja de que el bucle completo corre en el portátil.
- Asistencia de refactorización y generación de parches en repositorios medianos: con 2,5B parámetros activos por token, el coste por token es bajo y el decode en M5 Max alcanza 265 tok/s, suficiente para respuestas interactivas.
- Evaluación comparativa de motores de inferencia: las cifras publicadas por chip (M1 Pro a M5 Max) permiten dimensionar expectativas de rendimiento antes de adoptar el stack en un equipo concreto.
- Despliegue en equipos de 16 GB: la variante a 2 bits (11,9 GB) permite ejecutar el modelo en un M1 Pro de 16 GB con 61 tok/s de decode, útil para pruebas y tareas ligeras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo publica métricas de velocidad de inferencia por chip:

| Mac | Memoria | Prefill (tok/s) | Decode (tok/s) |
|---|---:|---:|---:|
| M5 Max | 128 GB | 5.770 | 265 |
| M5 Pro | 48 GB | 2.691 | 149 |
| M4 Pro | 48 GB | 968 | 128 |
| M3 Pro | 36 GB | 801 | 74 |
| M1 Pro (2 bits) | 16 GB | 414 | 61 |

## Requisitos de hardware

- VRAM/memoria unificada: 22,6 GB para los pesos a 4 bits, más overhead de contexto y caché KV; en la práctica requiere equipos de 36 GB o más para uso cómodo.
- Variante 2 bits: 11,9 GB, apta para Mac de 16 GB de memoria unificada.
- GPU recomendadas: Apple Silicon exclusivamente (M1 Pro, M3 Pro, M4 Pro, M5 Pro, M5 Max según las mediciones publicadas). No hay soporte documentado para CUDA.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en MacBook Pro y Mac Studio con memoria unificada suficiente; no se documenta ejecución en RTX 4090 u otras GPU discretas.
- Opciones de despliegue: motor Kapitsa (`kapitsa serve --model flint`), que expone APIs compatibles con OpenAI y Anthropic. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill entre 414 y 5.770 tok/s y decode entre 61 y 265 tok/s según el chip, según la tabla del autor.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de tamaño o tarea equivalente, ni datos de calidad que permitan establecer una comparación rigurosa. El único punto de referencia es el propio ecosistema de Kapitsa, que también sirve modelos Qwen y Nemotron, pero sin cifras comparativas publicadas en la información consultada.

## Limitaciones y advertencias

- No hay datos publicados sobre sesgos, alucinación o comportamiento en dominios sensibles del modelo Flint; cualquier uso en producción requiere evaluación propia.
- Se desconoce la longitud de contexto soportada, lo que impide planificar tareas de agente sobre repositorios grandes con garantías.
- Los idiomas soportados no están documentados; no se puede asumir un rendimiento correcto en castellano sin probarlo.
- El repositorio no registra descargas ni likes y fue creado y actualizado el mismo día, sin historial de mantenimiento.
- La licencia Apache 2.0 se declara en el artefacto, pero conviene verificar la licencia del modelo base `RecursiveSI/flint-int4` antes de un uso comercial.
- Dependencia de un motor propietario de facto para este artefacto: sin Kapitsa no hay una ruta de despliegue documentada, y no se listan formatos alternativos como GGUF.
- Las cifras de velocidad son del autor y no han sido verificadas de forma independiente; dependen de la versión del motor y del estado térmico del equipo.
- El soporte está limitado a Apple Silicon; no hay ruta documentada para servidores x86 con GPU NVIDIA o AMD.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nace-ai/kapitsa-flint
- Pesos base: https://huggingface.co/RecursiveSI/flint-int4
- Repositorio del motor Kapitsa: https://github.com/nace-ai/kapitsa
- Releases de Kapitsa: https://github.com/nace-ai/kapitsa/releases
