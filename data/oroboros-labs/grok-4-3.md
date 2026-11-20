# oroboros-labs/grok-4.3

## Resumen

Grok 4.3 es un modelo de lenguaje publicado en Hugging Face por el usuario oroboros-labs bajo licencia Apache 2.0. El repositorio contiene un único archivo de pesos en formato GGUF (5,0 GB) junto con un `Modelfile` diseñado para su uso con Ollama. Según la model card, los pesos son los mismos que los del modelo base original ("same base, weights untouched") y el valor añadido del repositorio reside en la configuración de plantilla de chat y prompt de sistema que lo hacen invocable como agente con herramientas.

El modelo cuenta con 8.190.735.360 parámetros según los metadatos de safetensors, lo que lo sitúa en la categoría de modelos de aproximadamente 8 mil millones de parámetros. No se especifican en la información disponible la arquitectura interna, la longitud de contexto, los idiomas soportados ni los datos de entrenamiento. La model card está redactada en inglés y atribuye el modelo a "Oroboros / Anthropic", una atribución que no se corresponde con ningún desarrollo oficial conocido de Anthropic y que debe tratarse con cautela.

La relevancia de este repositorio es limitada y fundamentalmente práctica: ofrece un artefacto listo para ejecutar en local mediante Ollama con una plantilla de tool calling preconfigurada. No obstante, la ausencia de documentación técnica verificable, de benchmarks y de información sobre el entrenamiento hace imposible evaluar su calidad real más allá de lo que declara el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (el repositorio distribuye un único archivo GGUF; no se detallan los niveles de cuantización) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tamaño del repo: 5,0 GB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo: la model card no menciona si se trata de un transformer denso, un modelo MoE, una arquitectura híbrida o cualquier otra variante. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o similares.

La única información técnica relevante es la relativa al empaquetado: el repositorio incluye un `Modelfile` para Ollama con una directiva `TEMPLATE` que implementa una plantilla de chat con soporte de function calling de entrada y salida, y una directiva `SYSTEM` que incorpora lo que el autor denomina "[DEEPLOGIC CORE]" (lógica de enrutamiento, disciplina de razonamiento y estándar de entrega) y "[THE AGENT + TOOL CONTRACT]" (conjunto de herramientas de CLI, servidores MCP y procedimientos de emisión de llamadas). Estos elementos son configuración de prompt, no cambios en los pesos, tal como el propio autor indica.

## Capacidades

- Generación de texto conversacional en formato multi-turno, según la etiqueta `conversational` del repositorio.
- Tool calling / function calling: la plantilla de chat incluida está diseñada explícitamente para emitir y recibir llamadas a funciones.
- Uso como agente: la configuración de sistema describe un contrato de herramientas con servidores MCP y herramientas locales en 127.0.0.1, según la model card.
- Integración con Ollama mediante `ollama create` y `ollama run`.
- Integración declarada con una CLI propietaria del autor ("Oroboros-Anthropic Claude CLI").
- Razonamiento y matemáticas: no disponible (no se documentan capacidades específicas).
- Capacidades multilingües: no disponible (no se listan idiomas).
- Visión, audio o modo thinking: no disponible.

## Casos de uso

- Despliegue local de un asistente conversacional: al distribuirse como GGUF de 5,0 GB, puede cargarse con Ollama en una estación de trabajo y usarse como chatbot local sin dependencia de API externa.
- Pruebas de integración de tool calling: la plantilla incluida permite experimentar con flujos de function calling en local antes de comprometerse con un proveedor comercial.
- Prototipado de agentes con MCP: la configuración de sistema referencia servidores MCP y un conjunto de herramientas de CLI, lo que permite montar un entorno de agente local para validar arquitecturas de orquestación.
- Automatización de tareas de línea de comandos en un entorno controlado: el contrato de herramientas descrito apunta a la ejecución de comandos locales, adecuado para laboratorios y entornos de desarrollo aislados.
- Evaluación comparativa de artefactos GGUF: útil para medir el rendimiento de un modelo de ~8B en hardware de consumo frente a otras alternativas cuantizadas.
- Docencia y experimentación: permite ilustrar el funcionamiento de plantillas de chat con soporte de herramientas y de prompts de sistema extensos sin coste de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF del repositorio ocupa 5,0 GB, por lo que la inferencia requiere al menos ese espacio más el overhead del runtime; una estimación razonable es de 6 a 8 GB de VRAM para el archivo distribuido.
- GPU recomendadas: no disponible (no se documentan pruebas de hardware).
- GPU de consumo: por tamaño, un modelo de ~8B en GGUF de 5,0 GB debería caber en GPUs de consumo con 8 GB o más de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 3070), aunque no hay confirmación del autor.
- Opciones de despliegue: Ollama es el método documentado (`ollama create` / `ollama run`). Otros runtimes compatibles con GGUF (llama.cpp) son plausibles pero no se mencionan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos ni datos de rendimiento que permitan establecer una comparativa rigurosa con alternativas de tamaño similar.

## Limitaciones y advertencias

- Atribución dudosa: la model card atribuye el modelo a "Oroboros / Anthropic", pero no existe evidencia en la información disponible de que Anthropic haya desarrollado o respaldado este modelo. Tratar la autoría con escepticismo.
- Ausencia total de documentación técnica: no se detallan arquitectura, datos de entrenamiento, contexto ni idiomas, lo que impide evaluar su calidad de forma fundamentada.
- Sin benchmarks: no hay métricas publicadas que respalden las capacidades declaradas.
- Riesgo de alucinación: no cuantificado por el autor; al no haber información sobre alineación, debe asumirse un riesgo estándar o superior.
- Sesgos: no documentados.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario asume la responsabilidad sobre el cumplimiento y sobre las implicaciones de los pesos de origen desconocido.
- Configuración de agente con permisos amplios: la model card sugiere ejecutar con `--dangerously-skip-permissions` y herramientas locales en 127.0.0.1; esto supone un riesgo de seguridad relevante en producción y debe evitarse fuera de entornos aislados.
- Procedencia de los pesos no verificable: al declararse "same base, weights untouched" sin identificar el modelo base, no es posible auditar el origen ni los términos originales de los pesos.
- Contexto e idiomas desconocidos: no apto para planificación de producción que dependa de una ventana de contexto concreta o de cobertura multilingüe.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/oroboros-labs/grok-4.3
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios de código o demos.
