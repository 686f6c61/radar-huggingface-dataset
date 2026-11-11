# moltherm1/olmo-mirror-olmo-3-tokenizer-instruct-release

## Resumen

El repositorio `moltherm1/olmo-mirror-olmo-3-tokenizer-instruct-release` no contiene un modelo de lenguaje con pesos entrenados, sino un tokenizador publicado bajo la librería `transformers`. Su nombre interno lo identifica como "Dolma 2 tokenizer, Instruct v5, Non-reasoner version": una versión ligeramente modificada de `cl100k_base` (el tokenizador de la familia GPT-4 de OpenAI) adaptada para soportar los tokens especiales de las versiones Dolma 1.x y Dolma 2.x, el corpus de preentrenamiento desarrollado por el Allen Institute for AI (Ai2).

El artefacto está pensado para acompañar a la familia de modelos Olmo de Ai2. La plantilla de chat incluida en la model card referencia explícitamente a "Olmo, a helpful function-calling AI assistant built by Ai2", con fecha de corte de diciembre de 2024 y soporte para definiciones de funciones (`<functions>`, `<function_calls>`). La etiqueta "instruct v5" y "non-reasoner" sugiere una iteración del formato de instrucciones sin modo de razonamiento explícito.

La relevancia de este repositorio es acotada: no es un modelo desplegable, sino un componente auxiliar (tokenizador y plantilla de chat) que permite reproducir el pipeline de tokenización de Olmo 3 en entornos `transformers`. No se dispone de información sobre parámetros, arquitectura del modelo asociado ni resultados de evaluación en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene un tokenizador, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | tokenizador (`transformers`); ficheros concretos no disponibles |

## Arquitectura y entrenamiento

El repositorio no incluye pesos de un modelo neuronal. Lo que publica es un tokenizador derivado de `cl100k_base`, el esquema BPE utilizado por OpenAI en la familia GPT-4, con modificaciones para incorporar tokens especiales de Dolma. Entre los tokens soportados figuran marcadores de conversación (`<|im_start|>`, `<|im_end|>`), marcadores de fill-in-the-middle para código (`<|fim_prefix|>`, `<|fim_middle|>`, `<|fim_suffix|>`), marcadores de función (`<functions>`, `</functions>`, `<function_calls>`, `</function_calls>`), tokens de relleno (`<|pad|>`) y marcadores heredados de Dolma 1.x para anonimización (`|||PHONE_NUMBER|||`, `|||EMAIL_ADDRESS|||`, `|||IP_ADDRESS|||`), que se conservan por compatibilidad pero no se usan.

La model card incluye además una plantilla Jinja de chat (referencia, la canónica está en `tokenizer_config.json`) que define el formato de turnos con roles `system`, `user`, `assistant` y `environment`. El rol `environment` es poco habitual y apunta a flujos de agente con observaciones del entorno. La plantilla inyecta por defecto un system prompt que identifica al asistente como Olmo de Ai2 y declara explícitamente la ausencia de funciones disponibles cuando no se proporcionan. No se dispone de información sobre el corpus de entrenamiento del tokenizador, el número de tokens del vocabulario ni el proceso de ajuste instructivo asociado.

## Capacidades

- Tokenización compatible con el vocabulario `cl100k_base` y con los tokens especiales de Dolma 1.x y Dolma 2.x.
- Soporte de plantilla de chat multi-turno con roles `system`, `user`, `assistant` y `environment`.
- Soporte de definiciones de funciones en el prompt mediante `<functions>` y `</functions>`.
- Soporte de llamadas a funciones emitidas por el modelo mediante `<function_calls>` y `</function_calls>`.
- Soporte de fill-in-the-middle para tareas de código (`<|fim_prefix|>`, `<|fim_middle|>`, `<|fim_suffix|>`).
- Marcadores de anonimización heredados de Dolma 1.x (no operativos en esta versión).
- No incluye capacidades de generación, razonamiento, visión ni audio por sí mismo: es un componente de tokenización.

## Casos de uso

- Reproducción del pipeline de tokenización de Olmo 3: usar el tokenizador para preprocesar textos y conversaciones con exactamente el mismo esquema que el modelo objetivo, garantizando alineación de tokens especiales.
- Integración en pipelines de `transformers`: cargar el tokenizador con `AutoTokenizer` para experimentos de evaluación o fine-tuning sobre modelos Olmo sin desviaciones de formato.
- Construcción de plantillas de chat con tool calling: aprovechar los marcadores `<functions>` y `<function_calls>` para serializar definiciones de herramientas y llamadas en aplicaciones de agentes.
- Evaluación de modelos en tareas de código con FIM: emplear los tokens `<|fim_prefix|>`, `<|fim_middle|>` y `<|fim_suffix|>` para construir prompts de autocompletado de código alineados con el entrenamiento.
- Réplica de entornos de agente con observaciones: el rol `environment` permite representar respuestas de herramientas o del entorno en conversaciones multi-turno.
- Compatibilidad con datos Dolma: tokenizar corpus anonimizados de Dolma 1.x conservando los marcadores de privacidad para auditoría o análisis posterior.
- Referencia para implementaciones propias: servir de especificación de formato para quien construya un tokenizador compatible con Olmo 3 Instruct v5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al tratarse de un tokenizador, no requiere VRAM ni GPU: se ejecuta en CPU con dependencias mínimas de `transformers` y `tokenizers`.
- Huella en disco: no disponible con precisión; típicamente unos pocos megabytes para vocabulario y configuración.
- Despliegue: cualquier entorno con `transformers` (Python), incluidos contenedores ligeros y funciones serverless.
- No aplica latencia de inferencia de modelo; el coste es el de la tokenización (microsegundos a milisegundos por secuencia, dependiente de la longitud).
- No requiere vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos de modelo que servir.

## Comparativa con modelos similares

| Componente | Base | Tokens especiales Dolma | Plantilla de chat | Tool calling | Licencia |
|---|---|---|---|---|---|
| Este repositorio | `cl100k_base` modificado | Sí (Dolma 1.x y 2.x) | Sí (Jinja, con rol `environment`) | Sí (`<functions>`, `<function_calls>`) | no disponible |
| Tokenizador oficial de Olmo (Ai2) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Tokenizador `cl100k_base` original (tiktoken) | `cl100k_base` | No | No | No | MIT (tiktoken) |
| Tokenizador Llama 3 | BPE propio | No | Sí | Parcial | Llama 3 Community License |

La comparativa se limita a nivel de tokenizador porque el repositorio no contiene un modelo con el que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no puede desplegarse como endpoint de inferencia.
- La licencia no está declarada en la información disponible; no se puede asumir uso comercial sin verificarlo en el repositorio.
- El autor es `moltherm1`, no Ai2; se trata de un espejo ("mirror") no oficial, por lo que puede divergir del tokenizador canónico de Olmo 3.
- La plantilla Jinja de la model card contiene errores de sintaxis (`{% Youfor message in messages %}`) y se declara "for reference only"; debe usarse la de `tokenizer_config.json`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por la comunidad.
- Los marcadores de anonimización de Dolma 1.x están presentes pero no operativos; no deben usarse como mecanismo de privacidad.
- Sin información sobre el vocabulario efectivo, no se puede garantizar compatibilidad exacta con los pesos de Olmo 3 publicados por Ai2.
- La fecha de creación (2026-10-29) y actualización (2026-11-10) no permiten verificar la procedencia ni el historial de cambios.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/moltherm1/olmo-mirror-olmo-3-tokenizer-instruct-release
- Organización Ai2 en Hugging Face (referenciada en la plantilla de chat): https://huggingface.co/allenai
- Documentación de `transformers` para tokenizadores: https://huggingface.co/docs/transformers/main_classes/tokenizer
