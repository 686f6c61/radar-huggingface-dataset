# mistralai/Leanstral-1.5-119B-A6B

## Resumen

Leanstral 1.5 119B A6B es un modelo agente de código abierto especializado en Lean 4, el asistente de demostración que permite formalizar matemáticas complejas (como espacios perfectoides) y especificaciones de software (por ejemplo, propiedades de fragmentos de Rust verificados con Aeneas). Lo desarrolla Mistral AI como parte de la familia Mistral Small 4 y se presenta como una actualización de Leanstral-2603, su predecesor. Su relevancia radica en que ataca un nicho históricamente dominado por modelos propietarios: la demostración automática de teoremas y la verificación formal.

Arquitectónicamente es un transformer de mezcla de expertos (MoE) con 128 expertos y 4 activos por token, 119B parámetros totales y 6,5B activados por token, lo que lo hace eficiente en coste frente a alternativas densas de tamaño comparable. Soporta entradas multimodales (texto e imagen) con salida de texto y una ventana de contexto de 256k tokens, con un máximo recomendado de 200k.

Se distribuye bajo licencia Apache 2.0 con pesos en formato compatible con vLLM (repo de 120,9 GB) y está pensado para integrarse en flujos de trabajo agénticos de larga duración, como el CLI Mistral Vibe o el servidor MCP lean-lsp-mcp, donde puede trabajar durante horas en tareas de demostración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (128 expertos, 4 activos por token) |
| Parametros totales | 119B |
| Parametros activos | 6,5B por token |
| Longitud de contexto | 256k tokens (200k recomendado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 120,9 GB, librería vLLM) |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos con 128 expertos y 4 activos por token, sobre una base de 119B parámetros totales y 6,5B activados. Esta configuración reduce el coste computacional por token frente a un modelo denso de tamaño equivalente, manteniendo la capacidad de un modelo grande. Admite entrada multimodal (texto e imagen) y produce salida de texto. La ventana de contexto alcanza los 256k tokens, aunque la model card recomienda no superar los 200k en uso práctico.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal. La model card sí menciona el uso de `FLASH_ATTN_MLA` como backend de atención en vLLM, lo que sugiere atención con Multi-head Latent Attention, pero no se amplía este punto. El modelo base declarado es mistralai/Leanstral-2603, del que esta versión 1.5 es un fine-tuning.

## Capacidades

- Generación de código y demostraciones en Lean 4: resolución de teoremas, corrección de pruebas y formalización de matemáticas complejas.
- Razonamiento de largo alcance: la model card indica que puede abordar tareas que requieren horas de trabajo continuado.
- Modo de razonamiento configurable: `reasoning_effort` con valores `'none'` (sin razonamiento) y `'high'` (recomendado para prompts complejos).
- Entrada multimodal: acepta texto e imagen, con salida de texto.
- Soporte de tool calling / function calling: el servidor vLLM se lanza con `--tool-call-parser mistral` y `--enable-auto-tool-choice`.
- Integración con agentes: compatible con Mistral Vibe (`vibe --agent lean`) y con el servidor MCP lean-lsp-mcp para interactuar con Lean.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Demostración automática de teoremas en Lean 4: el modelo puede recibir un enunciado y generar una prueba completa, aprovechando su contexto de 256k tokens para manejar ficheros de prueba extensos y dependencias múltiples.
- Reparación de pruebas fallidas en proyectos Lean existentes: integrado en el CLI Vibe dentro del directorio del proyecto, detecta errores de compilación y propone correcciones iterativas.
- Formalización de especificaciones de software: traducción de propiedades de fragmentos de Rust (verificados con Aeneas) a enunciados y pruebas en Lean 4.
- Asistencia matemática avanzada: formalización de objetos matemáticos complejos como espacios perfectoides, donde el razonamiento de largo alcance y el modo `'high'` son adecuados.
- Agente autónomo de larga duración: con `vibe --agent lean --yolo` puede trabajar durante horas en tareas de prueba sin supervisión constante, útil para proyectos de investigación formal.
- Integración en pipelines de CI/CD para verificación formal: desplegado con vLLM como servidor OpenAI-compatible, puede invocarse desde scripts para validar que las pruebas de un repositorio Lean compilan correctamente.
- Interacción con herramientas Lean vía MCP: uso conjunto con lean-lsp-mcp para que el agente consulte el estado del comprobador de pruebas y refine sus demostraciones de forma incremental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una imagen comparativa de benchmarks (`leanstral_benchmark_comparison`) cuyo contenido numérico no se ha proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 119B parámetros totales, los pesos en precisión completa ocuparían aproximadamente 238 GB, por lo que se requiere inferencia multi-GPU.
- GPU recomendadas: el ejemplo oficial de vLLM usa `--tensor-parallel-size 4`, lo que implica al menos 4 GPU de clase datacenter (A100, H100 o similares). No se especifica el modelo exacto.
- ¿Cabe en GPU de consumo? No disponible; por el tamaño del repo (120,9 GB) y los 119B parámetros, no es viable en una única GPU de consumo convencional.
- Opciones de despliegue: vLLM >= 0.24.0 (recomendado), con `mistral_common >= 1.11.5`. También se puede usar la API de Mistral AI como alternativa. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Leanstral 1.5 119B A6B | 119B totales / 6,5B activos (MoE) | 256k | Apache 2.0 | Lean 4, código, multimodal |
| Leanstral-2603 (predecesor) | no disponible | no disponible | no disponible | Lean 4 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (demostración formal en Lean 4) en los datos proporcionados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no se documenta explícitamente; como modelo generativo de código, puede producir pruebas sintácticamente válidas pero semánticamente incorrectas, por lo que se recomienda validar con el comprobador de Lean.
- Limitaciones de contexto: aunque soporta 256k tokens, la model card recomienda no superar los 200k en uso práctico.
- Limitaciones de idioma: no se especifican los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no se detallan condiciones adicionales.
- Caveats para producción: el uso de `--yolo` (autoaprobación de cambios) se marca como peligroso en la propia model card. Se recomienda desplegar con vLLM >= 0.24.0 y `mistral_common >= 1.11.5`; versiones anteriores pueden no ser compatibles. La temperatura recomendada es 1.0.

## Enlaces

- Hugging Face: https://huggingface.co/mistralai/Leanstral-1.5-119B-A6B
- Modelo predecesor: https://huggingface.co/mistralai/Leanstral-2603
- Colección Mistral Small 4: https://huggingface.co/collections/mistralai/mistral-small-4
- Lean 4: https://github.com/leanprover/lean4
- lean-lsp-mcp: https://github.com/oOo0oOo/lean-lsp-mcp (referenciado en la model card como lean-lsp-mcp)
- Mistral Vibe (instalación CLI): https://docs.mistral.ai/getting-started/quickstarts/vibe-code/install-cli
- Mistral AI Platform: https://chat.mistral.ai/
- API keys: https://admin.mistral.ai/organization/api-keys
- Privacidad y Labs: https://admin.mistral.ai/plateforme/privacy
- vLLM: https://github.com/vllm-project/vllm
- mistral-common: https://github.com/mistralai/mistral-common/releases/tag/v1.11.5
- Docker de vLLM: https://hub.docker.com/layers/vllm/vllm-openai/latest
- PrimeNumberTheoremAnd (ejemplo): https://github.com/AlexKontorovich/PrimeNumberTheoremAnd
- Aeneas (verificación Rust): https://github.com/AeneasVerif/aeneas
- Blog sobre espacios perfectoides: https://xenaproject.wordpress.com/2020/12/05/liquid-tensor-experiment/
- SDK Python de Mistral: https://pypi.org/project/mistralai/
