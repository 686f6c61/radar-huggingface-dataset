# Brunobkr/2BKR_IQ4_NL_hybrid_NVIDIA-Nemotron-3.5-Lightning-30B-A3B.gguf

## Resumen

El modelo `2BKR_IQ4_NL_hybrid_NVIDIA-Nemotron-3.5-Lightning-30B-A3B` es una cuantización GGUF en formato IQ4_NL del modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, creada por el usuario de HuggingFace `Brunobkr`. Se trata de un modelo de generación de texto con una arquitectura híbrida Mixture-of-Experts (MoE) que intercala capas de Mamba-2 y MoE junto con capas de atención selectas, lo que lo hace especialmente eficiente en cómputo. El modelo base tiene 30 mil millones de parámetros totales y 3 mil millones activos, lo que permite una inferencia rápida en comparación con modelos densos del mismo tamaño.

La relevancia de este modelo radica en su disponibilidad en formato GGUF, que permite ejecutarlo en CPU y GPU de consumo mediante `llama.cpp` o `llama-server`. El comando de ejemplo incluido en la model card configura una ventana de contexto de 50.000 tokens, soporte de herramientas (`--tools all`), modo agente (`--agent`) y razonamiento automático (`--reasoning auto`), lo que lo convierte en una opción interesante para aplicaciones de agentes y asistentes con contexto largo. Sin embargo, la model card es extremadamente escasa y no proporciona información sobre datos de entrenamiento, benchmarks o licencia detallada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mixture-of-Experts (MoE) con capas intercaladas de Mamba-2 y MoE, más capas de atención selectas |
| Parametros totales | 30 mil millones (30B) |
| Parametros activos | 3 mil millones (3B) |
| Longitud de contexto | No disponible (el comando de ejemplo usa 50.000 tokens) |
| Tipos de cuantizacion | IQ4_NL (archivo GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Other |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base, `NVIDIA-Nemotron-3.5-Lightning-30B-A3B`, emplea una arquitectura híbrida que combina capas de Mamba-2 (modelos de espacio de estados) con capas de Mixture-of-Experts y capas de atención selectas. Este diseño reduce el coste computacional al activar solo 3 mil millones de parámetros por token, manteniendo una capacidad de 30 mil millones de parámetros totales. Según la documentación de NVIDIA, el modelo se publica junto con métodos de decodificación especulativa para acelerar la generación de texto.

No se dispone de información sobre el proceso de entrenamiento del modelo base ni de la cuantización, como la composición del dataset, el número de tokens de entrenamiento o si se aplicaron técnicas de RLHF o DPO. La model card del autor únicamente indica que el archivo fue convertido automáticamente mediante `https://github.com/ggml-org/convert`.

## Capacidades

- Generación de texto: el modelo está destinado al pipeline de `text-generation`.
- Tool calling / function calling: el comando de ejemplo de `llama-server` incluye `--tools all`, lo que sugiere soporte para invocar herramientas externas.
- Agentes y razonamiento multi-paso: la presencia de `--agent` y `--reasoning auto` en el comando indica capacidades para operar como agente y realizar razonamiento automático.
- Integración con MCP: el comando incluye `--webui-mcp-proxy`, lo que apunta a una posible integración con el protocolo Model Context Protocol para conectar servicios externos.
- Contexto largo: el comando de ejemplo configura `-c 50000`, lo que sugiere manejo de ventanas de contexto de hasta 50.000 tokens.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistentes conversacionales con contexto largo: gracias a la ventana de 50.000 tokens configurada en el comando de ejemplo, el modelo puede mantener conversaciones extensas y recordar información de turnos anteriores, lo que resulta útil para aplicaciones de soporte al cliente o asistentes personales.
- Agentes autónomos con tool calling: el soporte de `--tools all` y `--agent` permite construir agentes que llaman a funciones externas, como consultar APIs, ejecutar comandos o acceder a bases de datos, dentro de un flujo de razonamiento automático.
- Automatización de tareas mediante MCP: la opción `--webui-mcp-proxy` habilita la integración con servidores MCP, lo que permite al modelo actuar como intermediario entre el usuario y herramientas externas en entornos de automatización.
- Análisis y resumen de documentos extensos: la ventana de contexto de 50.000 tokens es adecuada para procesar informes, contratos o artículos largos y generar resúmenes o extracciones de información.
- Generación de código asistida: aunque no hay benchmarks específicos, su arquitectura MoE eficiente y el soporte de tool calling lo hacen apto para integrarse en entornos de desarrollo que requieran sugerencias de código o refactorización automatizada.
- Despliegue en entornos de producción con recursos limitados: al ser un modelo de 3B parámetros activos cuantizado a IQ4_NL, puede ejecutarse en hardware de consumo mediante `llama-server`, lo que lo hace adecuado para prototipos y aplicaciones con requisitos de latencia moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El comando de ejemplo utiliza `-ngl 16` (16 capas en GPU) y `-fa on` (flash attention), lo que sugiere que parte del modelo se ejecuta en GPU, pero no se especifica la cantidad exacta de VRAM necesaria.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: por el tamaño del modelo (30B totales, 3B activos) y la cuantización IQ4_NL, es plausible que quepa en tarjetas de consumo de gama alta, pero no hay datos confirmados.
- Opciones de despliegue: `llama-server` (llama.cpp) con soporte para Vulkan y CUDA, según el comando de ejemplo. También es posible usar `llama.cpp` en CPU.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| `2BKR_IQ4_NL_hybrid_NVIDIA-Nemotron-3.5-Lightning-30B-A3B` | 30B totales, 3B activos | No disponible (50k en comando) | GGUF IQ4_NL | Other |
| `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` | 30B totales, 3B activos | No disponible | BF16 | Other |
| `bartowski/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF` | 30B totales, 3B activos | No disponible | GGUF | Other |

La comparativa se limita a aspectos estructurales, ya que no se dispone de datos de rendimiento. El modelo de `Brunobkr` es una cuantización alternativa al GGUF de `bartowski`, con la diferencia de que utiliza el método IQ4_NL y está orientado a un caso de uso específico con herramientas y agentes.

## Limitaciones y advertencias

- Licencia `other`: debe revisarse detenidamente antes de cualquier uso comercial, ya que no se especifican los términos exactos.
- La model card es mínima y no documenta sesgos, riesgos de alucinación ni limitaciones de idioma.
- La cuantización IQ4_NL puede introducir una degradación en la calidad de las respuestas en comparación con el modelo base en BF16.
- No hay información sobre el proceso de entrenamiento, lo que impide evaluar la robustez del modelo frente a ataques adversariales o prompts maliciosos.
- El comando de ejemplo utiliza `--cpu-strict 1` y `--load-mode mmap`, lo que sugiere que el modelo está pensado para cargarse desde disco, pero no se especifican los requisitos de memoria RAM.
- La fecha de creación del repositorio es 2026-09-03, lo que indica que es un modelo reciente con escasa adopción (0 descargas y 0 likes).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Brunobkr/2BKR_IQ4_NL_hybrid_NVIDIA-Nemotron-3.5-Lightning-30B-A3B.gguf
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Página de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Cuantización GGUF alternativa: https://huggingface.co/bartowski/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
