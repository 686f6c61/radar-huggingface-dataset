# selorahomes/Selora-AI-LLM-1.7B-ollama

## Resumen

Selora AI LLM 1.7B Ollama es una compilación fusionada (*fused*) del modelo Qwen3-1.7B de Alibaba, afinada por selorahomes para actuar como motor de decisión de Home Assistant. El modelo resuelve un problema muy concreto: dado un prompt con el listado de entidades disponibles, las automatizaciones existentes y, cuando procede, documentación relevante, debe devolver un único objeto JSON que pertenezca a una de cinco categorías de respuesta (`command`, `automation`, `answer`, `clarification`, `utilities`). Frente al despliegue de referencia —una base cuantizada más cinco adaptadores LoRA intercambiados por petición—, esta variante integra un único adaptador entrenado con los ejemplos de todos los especialistas en los pesos base, de modo que el propio modelo elige el tipo de respuesta a partir del prompt de enrutado.

La relevancia de esta build es operativa: Ollama y la mayoría de runtimes ligeros no permiten el intercambio en caliente de adaptadores LoRA, por lo que la fusión habilita desplegar el sistema completo como un solo GGUF. El precio es un intercambio explícito de precisión por simplicidad: el autor reconoce que el modelo fusionado pierde algo de exactitud frente al bundle de adaptadores, donde el llamante indica al especialista qué debe hacer. La arquitectura subyacente es la de Qwen3-1.7B, un transformer denso de 1.720.574.976 parámetros, con una ventana de contexto efectiva de 4096 tokens en esta configuración, licencia Apache 2.0 y soporte exclusivo de inglés.

El modelo no es un asistente generalista: es un componente especializado de un pipeline de domótica, con formato de prompt ChatML estricto, modo *no-think* forzado y parámetros de muestreo deterministas (temperatura 0.0). Cualquier uso fuera del esquema de enrutado de Selora requiere validar el formato de salida y el contrato JSON.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-1.7B), fine-tuning con LoRA fusionado |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (`num_ctx` en el Modelfile) |
| Tipos de cuantizacion | GGUF Q6_K (única variante publicada en este repo); el repo base ofrece cuantizaciones adicionales |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 (hereda de Qwen3-1.7B) |
| Formato de pesos | GGUF (`selora-ollama.Q6_K.gguf`); safetensors en el repo base |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de 1.7B parámetros con atención estándar y soporte nativo de bloques de razonamiento (``). Sobre esa base se entrena un único adaptador LoRA que agrega los ejemplos de los cinco especialistas del sistema Selora bajo el prompt de enrutado que sirve esta build. Posteriormente el adaptador se fusiona en los pesos base y el resultado se convierte a GGUF Q6_K. El bundle de referencia (`selorahomes/Selora-AI-LLM-1.7B`) mantiene la base cuantizada más cinco adaptadores separados, uno por tipo de respuesta, que se activan por petición; esta build es, por tanto, una derivación de conveniencia para runtimes sin soporte de LoRA dinámico.

El entrenamiento no está documentado en la información disponible en cuanto a número de tokens, composición del dataset o uso de RLHF/DPO. Lo que sí se especifica es el contrato de inferencia: prompt ChatML con el bloque `` vacío incluido de forma explícita (enmascarado durante el entrenamiento), prefijo `/no_think` en el turno de usuario para suprimir el razonamiento de Qwen3, y salida limitada a un único objeto JSON. Los parámetros de generación fijados son temperatura 0.0, `repeat_penalty` 1.0 (deliberadamente, para no penalizar los tokens estructurales repetidos del JSON), `repeat_last_n` 256 y paradas en `<|im_end|>` y `<|endoftext|>`. El autor advierte que la plantilla de chat embebida en el GGUF debe emitir el bloque `` vacío; sin él, el modelo genera como si la apertura `{"` ya estuviera escrita y devuelve `q=[...]` en lugar de `{"q":[...]}`, lo que rompe cualquier parser.

## Capacidades

- Generación de comandos de control para entidades de Home Assistant, emitidos como JSON estructurado.
- Generación de automatizaciones a partir de lenguaje natural, considerando las automatizaciones existentes incluidas en el prompt.
- Respuesta a preguntas sobre el entorno domótico y sobre documentación relevante inyectada en el contexto.
- Emisión de peticiones de aclaración cuando la instrucción del usuario es ambigua o falta información.
- Respuesta a consultas de utilidades apoyadas en un bloque `RELEVANT DOCS`.
- Clasificación y enrutado implícito entre los cinco tipos de respuesta sin intervención del llamante.
- Salida JSON determinista apta para parseo automático, gracias a temperatura 0.0 y ausencia de penalización por repetición.
- Sin soporte de tool calling genérico, agentes multi-paso, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Control por voz o texto de dispositivos del hogar: el modelo recibe el listado de entidades disponibles y devuelve un objeto `command` con la entidad y la acción, listo para ejecutarse contra la API de Home Assistant.
- Creación asistida de automatizaciones: el usuario describe una rutina en lenguaje natural y el modelo emite un objeto `automation` que tiene en cuenta las automatizaciones ya existentes para evitar duplicados o conflictos.
- Asistente conversacional de consulta: preguntas del tipo "¿qué luces están encendidas en el salón?" se resuelven con un objeto `answer` construido a partir del contexto de entidades inyectado.
- Desambiguación de intenciones: ante instrucciones vagas ("ponlo más caliente"), el modelo devuelve `clarification` en lugar de ejecutar una acción potencialmente errónea, lo que reduce el riesgo en producción.
- Resolución de dudas sobre el propio sistema: consultas sobre configuración o uso se responden como `utilities` apoyándose en el bloque `RELEVANT DOCS`, útil para onboarding de usuarios.
- Despliegue en hardware doméstico: al ser un GGUF Q6_K de 1.7B, se ejecuta en CPU o en GPU de gama baja dentro del propio servidor de Home Assistant, sin depender de servicios en la nube ni exponer datos del hogar a terceros.
- Integración en la integración oficial de Home Assistant: el repositorio de la integración (`gitlab.com/selorahomes/products/selora-ai/ha-integration`) consume este contrato JSON, por lo que la build fusionada sirve como backend simplificado cuando no se dispone de llama.cpp con `--lora` o vLLM con `--enable-lora`.

## Benchmarks y rendimiento

El autor referencia métricas en `eval/baselines.json`, con entradas `fused-*` para esta build y puntuaciones medidas para el bundle de adaptadores, pero los valores concretos no están incluidos en la información disponible. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un Q6_K de 1.7B ocupa aproximadamente 1,4 GB de pesos; con `num_ctx` 4096 y overhead de runtime, el consumo total se sitúa en el entorno de 2-3 GB. Cifra estimada a partir del tamaño y la cuantización, no publicada por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo y solo tendrían sentido por agregación de peticiones.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 4 GB o más; también en CPU, dado el reducido tamaño del modelo.
- Opciones de despliegue: Ollama (`ollama run hf.co/selorahomes/Selora-AI-LLM-1.7B-ollama:selora-ollama.Q6_K.gguf` o `ollama create selora -f Modelfile`), llama.cpp y cualquier runtime que cargue un único GGUF. El bundle de adaptadores, en cambio, requiere llama.cpp con `--lora` o vLLM con `--enable-lora`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Selora-AI-LLM-1.7B-ollama | 1,72B | 4096 | Domótica / Home Assistant, 5 tipos de respuesta JSON | Apache 2.0 | GGUF Q6_K |
| Selora-AI-LLM-1.7B (bundle) | 1,72B + 5 LoRA | 4096 | Misma tarea, especialista seleccionado por el llamante | Apache 2.0 | GGUF base + adaptadores |
| Qwen/Qwen3-1.7B | 1,72B | Mayor que 4096 en configuración nativa (no confirmado en la información disponible) | Propósito general, razonamiento, multilingüe | Apache 2.0 | safetensors, GGUF |

La comparación con alternativas de propósito general del mismo tamaño (por ejemplo, otras familias de 1-2B) no está disponible en la información proporcionada. La diferencia clave frente a Qwen3-1.7B es la especialización: Selora restringe la salida a un contrato JSON de cinco tipos y limita el contexto a 4096 tokens, sacrificando generalidad y multilingüismo a cambio de fiabilidad en el parseo y determinismo en la generación.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para emitir exclusivamente uno de cinco tipos de objeto JSON bajo el prompt de enrutado de Selora; su uso como chat generalista producirá resultados degradados.
- Precisión inferior al bundle de adaptadores: el propio autor advierte que la fusión en un solo modelo pierde exactitud frente a la selección explícita de especialista; si el runtime soporta LoRA dinámico, el bundle es la opción recomendada.
- Dependencia estricta de la plantilla: el bloque `` vacío debe estar presente en el prompt; sin él la salida omite la apertura `{"` y rompe el parseo. La plantilla embebida en el GGUF y el fichero `template` deben coincidir byte a byte con el entrenamiento.
- Solo inglés: el campo `language` declara únicamente `en`; no hay evidencia de soporte multilingüe y el prompt de enrutado está en inglés.
- Contexto limitado a 4096 tokens: el listado de entidades y automatizaciones debe caber en esa ventana, lo que puede ser restrictivo en instalaciones domóticas grandes.
- Riesgo de alucinación: al generar entidades o acciones, el modelo podría referenciar entidades inexistentes si no aparecen en el bloque `AVAILABLE ENTITIES`; se recomienda validar el JSON contra el estado real de Home Assistant antes de ejecutar comandos.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el `NOTICE` con la atribución a Qwen3; el autor indica que los ficheros `Modelfile`, `system`, `template` y `params` se regeneran en cada release y no deben editarse localmente.
- Dependencia de un proyecto pequeño: 550 descargas y 2 likes en el momento de la consulta; el mantenimiento recae en un único equipo y la documentación de entrenamiento es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/selorahomes/Selora-AI-LLM-1.7B-ollama
- Bundle de referencia con adaptadores LoRA: https://huggingface.co/selorahomes/Selora-AI-LLM-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Integración de Home Assistant: https://gitlab.com/selorahomes/products/selora-ai/ha-integration
- Repositorio de modelos y pipeline de datos: https://gitlab.com/selorahomes/products/selora-ai/models
