# khursanirevo/smolagent-ms-800m-agent

## Resumen

SmolAgent-MS 800M Agent es un modelo de lenguaje de 801 millones de parámetros desarrollado por khursanirevo, entrenado desde cero con un enfoque prioritario en el idioma malayo y orientado a tareas de agente con llamada a herramientas. El modelo sigue una arquitectura tipo Llama con RoPE intercalado (interleaved), atención GQA y SwiGLU, y ha pasado por tres fases de entrenamiento: un preentrenamiento continuo (CPT) de 7,92 mil millones de tokens mayoritariamente en malayo, un segundo CPT de 2 mil millones de tokens en inglés, código y esquemas OpenAPI, y un ajuste fino supervisado (SFT) sobre 34.839 ejemplos sintéticos de llamada a herramientas.

El modelo está diseñado para generar texto coherente en malayo y emitir llamadas a herramientas en un formato JSON estructurado, con una disciplina de "no llamada" del 88,8 % en solicitudes irrelevantes. Sin embargo, la selección de herramientas es débil en esquemas no vistos, y el rendimiento en inglés es casi aleatorio por diseño, ya que el corpus principal es malayo. Es un modelo experimental que documenta abiertamente sus limitaciones, incluyendo el fracaso de DPO y del SFT sobre trayectorias de agente. Su relevancia radica en ser un intento de crear un agente lingüístico de bajo coste para malayo, aunque su utilidad práctica en producción es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-like con RoPE intercalado, 24 capas, dim 2048, GQA 16Q-4KV, SwiGLU 2816, RMSNorm, embeddings atados, vocab 65.536 |
| Parametros totales | 801.212.416 (801,2 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 (según ejemplo de vLLM en la model card) |
| Tipos de cuantizacion | No disponible (solo safetensors en precisión float32) |
| Idiomas soportados | Malayo (principal), inglés (limitado, entró tarde en el entrenamiento) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 24 capas con dimensiones de 2048, atención GQA con 16 cabezas de consulta y 4 de clave/valor, y feed-forward SwiGLU de 2816 unidades. Usa RMSNorm, embeddings atados y una rotación posicional RoPE intercalada (interleaved), que no es convertible a la variante NeoX de Llama mediante permutación de pesos, por lo que requiere registro de arquitectura personalizada en vLLM. El vocabulario es de 65.536 tokens.

El entrenamiento se realizó en tres etapas: primero un CPT de 7,92 mil millones de tokens con corpus mayoritariamente malayo (61.000 pasos, programación WSD y SpikeGuard), después un tool-CPT de 2 mil millones de tokens con mezcla de inglés, código y esquemas OpenAPI, y finalmente un SFT sobre 34.839 ejemplos sintéticos de llamada a herramientas (4,67 millones de tokens, 2.176 pasos, con máscara de pérdida en las cabeceras de rol del modelo). Se intentó DPO en cinco variantes, pero todas resultaron perjudiciales, y el SFT sobre trayectorias de agente también se descartó por sobrescribir el comportamiento de esquemas con un guion memorizado.

## Capacidades

- Generación de texto coherente en malayo en múltiples registros.
- Emisión de llamadas a herramientas en formato JSON estructurado: el modelo continúa con `<|tool_call|>\n{"name": ..., "arguments": {...}}` cuando detecta una solicitud relevante.
- Disciplina de no llamada: acierta el 88,8 % en solicitudes irrelevantes (categoría Irrelevance de BFCL-MS).
- Soporte de formato de prompt específico: `TOOLS AVAILABLE:` seguido de esquemas JSON uno por línea, y `<|user|>` para la solicitud.
- Capacidad multilingüe limitada: el inglés se introdujo tarde y con poco volumen, por lo que su rendimiento en inglés es casi aleatorio por diseño.
- No soporta multi-turno ni llamadas paralelas más allá del formato básico.

## Casos de uso

- Prototipado de asistentes conversacionales en malayo: el modelo puede mantener diálogos simples en malayo y responder a solicitudes de información general, aunque su fiabilidad es baja fuera de dominios muy acotados.
- Experimentación académica con modelos de agente de bajo coste: sirve como banco de pruebas para estudiar el efecto del CPT multilingüe y el tool-CPT en la capacidad de llamada a herramientas.
- Evaluación de pipelines de tool calling en entornos controlados: su formato de salida JSON es estable y puede usarse para validar infraestructura de parsing y enrutamiento.
- Generación de texto en malayo para tareas de relleno o clasificación ligera, dado su rendimiento en PIQA (57,8 %) y Belebele-ms (27,4 %).
- Investigación sobre los límites del SFT con datos sintéticos: documenta explícitamente el techo de rendimiento cuando no se usa un modelo profesor.
- Pruebas de integración con vLLM para arquitecturas personalizadas: el registro de `InterleavedRopeLlama` es un caso de uso real para desarrolladores que necesitan servir modelos con RoPE intercalado.

## Benchmarks y rendimiento

La model card reporta resultados en BFCL-MS (conjunto retenido, 1.240 ejemplos, categorías de llamada única) y evaluaciones base antes y después del tool-CPT.

| Benchmark | Resultado |
|---|---|
| BFCL-MS Irrelevance (no-call) | 0,888 |
| BFCL-MS Simple | 0,005 |
| BFCL-MS Multiple | 0,005 |
| BFCL-MS Parallel / parallel-multiple | 0,0 |
| BFCL-MS Overall | 0,174 |
| Heldout ppl (base) | 8,12 |
| Heldout ppl (después de tool-CPT) | 7,77 |
| PIQA (n=500, base) | 0,562 |
| PIQA (n=500, después de tool-CPT) | 0,578 |
| Belebele-ms (n=500, base) | 0,26 |
| Belebele-ms (n=500, después de tool-CPT) | 0,274 |
| HellaSwag (n=500, base) | 0,204 |
| HellaSwag (n=500, después de tool-CPT) | 0,210 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- No se proporcionan datos oficiales de VRAM ni latencia en la model card.
- Con 801,2 millones de parámetros, en precisión float32 los pesos ocupan aproximadamente 3,2 GB, y en float16 unos 1,6 GB. El repositorio pesa 16 GB, lo que sugiere que los pesos están almacenados en float32 (posiblemente con duplicados o checkpoints intermedios).
- Una GPU consumer con 8 GB de VRAM (por ejemplo, RTX 3060 Ti, RTX 3070) podría cargar el modelo en float16 con overhead de activaciones para una ventana de 4096 tokens.
- El ejemplo de serving usa vLLM con `dtype="float32"` y `enforce_eager=True`, lo que aumenta el consumo de memoria; en float16 sería más eficiente.
- Opciones de despliegue: vLLM (con registro de arquitectura personalizada), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se menciona soporte oficial.
- No hay datos de throughput ni latencia medidos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (agentes multilingües de ~800M parámetros) en la documentación proporcionada. El modelo base `khursanirevo/smolagent-ms-800m-base` existe en Hugging Face, pero no se han publicado sus métricas, por lo que no es posible establecer una comparación cuantitativa. Se recomienda consultar el repositorio del autor para más contexto.

## Limitaciones y advertencias

- Selección de herramientas débil: en esquemas BFCL no vistos, solo 62 de 400 ejemplos simples usan un nombre de herramienta ofrecido, y los argumentos frecuentemente no coinciden con el esquema. Esto se atribuye al techo de los datos sintéticos (150 esquemas generados, sin modelo profesor).
- Rendimiento en inglés casi aleatorio por diseño: el corpus principal es malayo y el inglés entró tarde y con poco volumen.
- Sin soporte multi-turno ni llamadas paralelas: solo se entrenó el formato básico.
- DPO resultó perjudicial en todas las variantes probadas, y el SFT sobre trayectorias de agente también fue dañino; ambos se descartaron.
- Riesgo de alucinación y errores de formato en salidas de herramientas, especialmente con esquemas no vistos.
- Licencia no especificada: no se puede garantizar el uso comercial sin aclaración del autor.
- La arquitectura RoPE intercalado requiere registro personalizado en vLLM; no es compatible con la carga estándar de modelos Llama.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un proyecto experimental sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khursanirevo/smolagent-ms-800m-agent
- Modelo base: https://huggingface.co/khursanirevo/smolagent-ms-800m-base
- Repositorio de archivos del modelo base: https://huggingface.co/khursanirevo/smolagent-ms-800m-base/tree/main
- Biblioteca smolagents (referencia, no afiliada): https://github.com/huggingface/smolagents
- Documentación CLI de smolagents: https://deepwiki.com/huggingface/smolagents/8.2-command-line-interface
