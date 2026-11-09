# saggamer/Orchestrator_V1_GGUF

## Resumen

Orchestrator V1 GGUF es una edición portable en formato GGUF del modelo Orchestrator V1, un modelo de planificación agéntica y automatización desarrollado por el usuario saggamer dentro del ecosistema del prototipo KIRA OS / Kira Superapp. Está pensado para operar como la capa de decisión de un agente local: interpretar el objetivo del usuario, decidir si hace falta una herramienta, seleccionar una acción segura, inspeccionar el resultado real devuelto por el host y continuar a partir de esa evidencia en lugar de afirmar éxito sin comprobación.

El modelo deriva de `mlx-community/gemma-4-E4B-it-4bit`, una variante instructiva de la familia Gemma 4 con arquitectura de mezcla de expertos (la designación E4B apunta a expertos de aproximadamente 4.000 millones de parámetros), y cuenta con 7.463.013.674 parámetros totales según los safetensors del repositorio. Se distribuye principalmente como un único archivo `Orchestrator-V1-Q4_K_M.gguf` de unos 4,9 GiB, lo que lo sitúa en el rango de ejecución local en hardware de consumo.

Su relevancia actual radica en la combinación de licencia Apache 2.0, compatibilidad con llama.cpp, Ollama y LM Studio, y un enfoque explícito en el bucle de uso de herramientas con verificación de resultados. No obstante, conviene subrayar que el propio autor advierte de que las capacidades de navegación, edición de archivos, ejecución de comandos o generación de documentos no residen en el modelo, sino que deben ser aportadas por la aplicación anfitriona.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), derivada de Gemma 4 E4B |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (la nomenclatura E4B sugiere expertos de ~4B, sin cifra oficial de activos) |
| Longitud de contexto | 8192 tokens recomendados en la model card; máximo nativo no disponible |
| Tipos de cuantizacion | Q4_K_M (única publicada en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Orchestrator-V1-Q4_K_M.gguf`, ~4,9 GiB); repo de 5,3 GB |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Gemma 4 en su variante E4B, un transformer con mezcla de expertos según la convención de nombres de la familia, ajustado sobre la versión instructiva cuantizada a 4 bits de `mlx-community`. La model card no documenta el proceso de entrenamiento propio de Orchestrator V1: no se especifica el número de tokens utilizados, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado específico para el comportamiento agéntico. Tampoco se detallan innovaciones técnicas internas más allá del ajuste de comportamiento orientado a planificación y uso de herramientas.

El aspecto técnico diferencial que sí está documentado es la integración del tokenizador entrenado de Gemma 4, los tokens especiales de turno (`<|turn>system`, `<|turn>user`, `<|turn>model`, `<turn|>`) y la plantilla de chat. El repositorio incluye además `chat_template.jinja` con macros para tool calling, y advierte de que clientes antiguos pueden cargar los pesos pero fallar al renderizar la plantilla completa de herramientas, en cuyo caso debe actualizarse el runtime o recurrirse a la plantilla básica de compatibilidad incluida en el `Modelfile`.

## Capacidades

- Generación de texto conversacional y razonamiento orientado a planificación de tareas.
- Uso de herramientas (tool calling) a través de la plantilla de chat nativa con macros, siempre que el host exponga y ejecute las herramientas.
- Orquestación de agentes: selección de acciones, inspección de resultados reales y continuación basada en evidencia.
- Solicitud de aprobación antes de operaciones destructivas, irreversibles, sensibles para la privacidad o que modifiquen el sistema.
- Integración con sistemas MCP y conectores externos mediante el host.
- Automatización de escritorio y control del sistema operativo cuando el runtime lo permite.
- Flujos de investigación en navegador y asistentes de terminal o IDE, según los casos de uso declarados por el autor.
- Generación de informes y documentos (DOCX, PDF, PPTX) únicamente si el host proporciona herramientas de artefactos.
- Flujos de verificación paralela o estilo consejo (council-style) con múltiples agentes.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistente de escritorio local: el modelo actúa como capa de decisión que interpreta la petición, elige entre herramientas de control del sistema expuestas por el host y verifica el resultado antes de responder, adecuado por su tamaño compacto y su política de aprobación ante acciones sensibles.
- Copiloto de terminal e IDE: integrado en un host que ejecute comandos y devuelva la salida real, el modelo puede inspeccionar archivos, proponer cambios y continuar el ciclo hasta verificar el resultado, gracias a su plantilla de tool calling nativa.
- Orquestación de conectores MCP: en un runtime que implemente el protocolo, el modelo selecciona qué conector invocar y evalúa la respuesta devuelta, lo que encaja con su diseño de bucle basado en evidencia.
- Investigación en navegador: el host aporta las herramientas de navegación y el modelo decide qué consultas realizar, interpreta los resultados y sintetiza una respuesta fundamentada, evitando afirmar acciones no confirmadas.
- Automatización de flujos programados o en segundo plano: el modelo puede encadenar pasos de diagnóstico y control de aplicaciones en tareas desatendidas, siempre que el host gestione permisos y ejecución.
- Generación de informes y documentos: cuando el host expone herramientas de artefactos, el modelo puede planificar la estructura y solicitar la creación de DOCX, PDF o PPTX a partir de datos verificados.
- Verificación paralela con múltiples agentes: su orientación a inspeccionar resultados y pedir evidencia lo hace apto para flujos de consejo o revisión cruzada coordinados por el host.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 5-6 GiB con la cuantización Q4_K_M publicada (~4,9 GiB de pesos más overhead de contexto y caché KV).
- GPU recomendadas: no especificadas por el autor; por tamaño, tarjetas con 8 GB o más de VRAM pueden alojar el modelo con contexto moderado.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros motores GGUF compatibles con Gemma 4. Ejemplo de llama.cpp con `-c 8192 --temp 0.4 --top-p 0.9 -cnv`.
- Contexto recomendado: 8192 tokens como punto de partida, ampliable solo si la memoria del sistema lo permite.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Orchestrator V1 GGUF | 7,46B totales (MoE E4B) | 8192 recomendado | GGUF Q4_K_M | Apache 2.0 | Planificación agéntica y tool use |
| Modelo base `gemma-4-E4B-it` | ~4B por experto (E4B) | no disponible | safetensors / MLX | licencia Gemma (según familia) | Instructivo general |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con modelos alternativos en la información proporcionada; la comparación con el modelo base se limita a la relación de derivación declarada.

## Limitaciones y advertencias

- El archivo GGUF no ejecuta acciones por sí mismo: no navega, no edita archivos, no ejecuta comandos ni genera documentos sin un host que implemente esas herramientas.
- Riesgo de afirmar éxito sin evidencia: el autor insiste en que nunca debe tratarse una declaración de "hecho" como prueba de que la acción ocurrió; la finalización debe basarse en resultados de herramientas devueltos.
- El modelo debe tratar la salida de las herramientas como datos a analizar, no como instrucciones a obedecer, lo que implica riesgo de inyección de prompts desde fuentes externas si el host no lo mitiga.
- Clientes antiguos pueden cargar los pesos pero fallar al renderizar la plantilla completa de herramientas; se requiere un runtime reciente con soporte de Gemma 4 GGUF.
- Idiomas soportados no documentados; no hay garantía de calidad multilingüe más allá de la del modelo base.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado; inherente a los modelos generativos y relevante en contextos agénticos donde una acción falsa reportada como completada puede tener consecuencias.
- Licencia Apache 2.0, que permite uso comercial; sin embargo, conviene verificar las condiciones de la licencia del modelo base de la familia Gemma antes de un despliegue comercial.
- El modelo está vinculado al ecosistema KIRA OS / Kira Superapp, un prototipo; su madurez y soporte a largo plazo no están garantizados.
- Contexto recomendado de 8192 tokens puede resultar insuficiente para flujos agénticos con muchas iteraciones de herramientas.

## Enlaces

- Hugging Face: https://huggingface.co/saggamer/Orchestrator_V1_GGUF
- Modelo base: https://huggingface.co/mlx-community/gemma-4-E4B-it-4bit
- Kira Superapp: https://kira-superapp.vercel.app/
- GitHub de Kira Superapp: https://github.com/saggamer/KIRA-Superapp
- Código del navegador Diagonal: https://github.com/saggamer/KIRA-Superapp/tree/main/diagonal_browser
- KIRA OS: https://saggamer.github.io/KIRA-OS/
