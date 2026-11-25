# pranil00/ONIX-CodeLlama-7b-Instruct-hf-GGUF

## Resumen

ONIX-CodeLlama-7b-Instruct-hf-GGUF es una cuantización en formato GGUF del modelo CodeLlama-7b-Instruct-hf de Meta, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Se trata de un artefacto derivado, no de un modelo entrenado desde cero: el trabajo consiste en la conversión de los pesos originales en FP16 a una cuantización Q5_K_M de 5,5 bits por peso, lo que reduce el tamaño de 13,18 GB a 4,53 GB y permite ejecutar un modelo de 6.738.542.592 parámetros en hardware de consumo.

El modelo base, CodeLlama-7b-Instruct-hf, es un transformer decoder-only de la familia LLaMA especializado en generación y comprensión de código, ajustado con instrucciones para seguir comandos y completar tareas de programación. Esta versión cuantizada conserva la arquitectura y los pesos del original, por lo que hereda sus capacidades y limitaciones, pero no añade ninguna mejora de entrenamiento.

La relevancia de esta ficha es acotada: el repositorio no presenta métricas de benchmarks propias, no documenta idiomas soportados y no incluye información sobre el proceso de cuantización más allá de la tabla de telemetría del autor. Resulta útil como opción de despliegue local de bajo coste para tareas de código, pero debe evaluarse con cautela por la falta de validación independiente y por la fecha de creación declarada (2026-11-25).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA) |
| Parametros totales | 6.738.542.592 (6,74 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens en GPU/Apple Silicon; 4.096 tokens en CPU (según model card) |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `codellama--CodeLlama-7b-Instruct-hf-Q5_K_M.gguf`) |

## Arquitectura y entrenamiento

La arquitectura corresponde íntegramente al modelo base CodeLlama-7b-Instruct-hf: un transformer decoder-only de 6,74 mil millones de parámetros con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos. La model card no aporta detalles adicionales sobre número de capas, dimensión oculta o cabezas de atención, por lo que esos datos deben consultarse en la documentación oficial de CodeLlama. Tampoco se documenta el proceso de entrenamiento original (composición del dataset, número de tokens, uso de RLHF o DPO); esta información pertenece al modelo de Meta y no se reproduce en el repositorio de la cuantización.

La única innovación técnica declarada es el proceso de cuantización Q5_K_M realizado con la herramienta `run-any-model`, un motor de optimización adaptativo al dispositivo. El autor reporta una compresión de 2,91x respecto a FP16 (reducción del 65,6 %), una retención de calidad estimada del 97,5 % y la aceleración de las 32 capas en Metal. No se especifica la metodología empleada para estimar esa retención de calidad ni se aportan evaluaciones reproducibles.

## Capacidades

- Generación de texto y código: el modelo base está especializado en completar, explicar y generar código en múltiples lenguajes de programación.
- Seguimiento de instrucciones: la variante Instruct está ajustada para responder a comandos en formato conversacional.
- Relleno de código (fill-in-the-middle): capacidad heredada de CodeLlama, útil para autocompletado en editores.
- Razonamiento sobre código: explicación de fragmentos, detección de errores y refactorización básica.
- Conversación multi-turno: soporta diálogos con historial dentro de la ventana de contexto disponible.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y multi-step reasoning: no documentado; el modelo base no está optimizado específicamente para ello.
- Capacidades multilingües: no disponibles en la información del repositorio.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Autocompletado de código en editores locales: el fichero GGUF de 4,53 GB puede cargarse en extensiones basadas en llama.cpp para sugerir líneas y bloques en tiempo real, sin depender de servicios en la nube.
- Asistente de programación en portátiles con GPU de consumo: con 6,03 GB de VRAM dedicada según la model card, cabe en tarjetas de 8 GB y permite sesiones de chat técnicas sin conexión.
- Generación de tests unitarios: el modelo puede producir casos de prueba a partir de funciones existentes, aprovechando su ajuste específico sobre código.
- Explicación y documentación de código heredado: útil para equipos que necesitan resúmenes de módulos antiguos en entornos con requisitos de privacidad, al ejecutarse íntegramente en local.
- Prototipado rápido en Apple Silicon: con Metal acelerado y 6,61 GB de memoria unificada, se puede integrar en flujos de trabajo de desarrollo en macOS mediante Ollama o LM Studio.
- Formación y experimentación: adecuado para investigadores que necesitan un modelo de código pequeño y reproducible para comparar técnicas de cuantización o evaluar degradación de calidad.
- Despliegue en entornos air-gapped: al ser un único fichero GGUF sin dependencias de red, encaja en infraestructuras aisladas donde no se permite el acceso a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye una tabla de telemetría interna del autor (DeviceQuant Telemetry Audit Report) con métricas de tamaño y memoria, no de calidad:

| Métrica | Baseline (FP16) | Cuantizado (Q5_K_M) | Cambio |
|---|---|---|---|
| Precisión de bits | 16,0 bits/param | 5,5 bits/param | -65,6 % |
| Tamaño de pesos | 13,18 GB | 4,53 GB | -65,6 % |
| Búfer KV cache | 2048,0 MB (FP16) | 2048,0 MB (FP16) | Optimizado |
| RAM residente total | 15,25 GB | 6,61 GB | -56,7 % |
| Calidad estimada | 100,0 % baseline | 97,5 % retenida | -2,5 % |
| Aceleración de capas | 0 % | 32/32 capas | Óptimo |

Estos datos proceden exclusivamente del autor y no han sido verificados de forma independiente. No se aportan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: 6,03 GB en GPU NVIDIA (según model card), 6,61 GB de memoria unificada en Apple Silicon, 8,61 GB de RAM libre en CPU.
- GPU recomendadas: series RTX 30/40/50 de NVIDIA con al menos 8 GB de VRAM; cualquier GPU Apple Silicon (M1 a M5) con Metal.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o superiores (RTX 3060 Ti, RTX 4060, RTX 4070, etc.).
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI `run-any-model` del propio autor.
- Contexto recomendado: 8.192 tokens en GPU/Apple Silicon, 4.096 tokens en CPU.
- Latencia y throughput: no disponibles; la model card no incluye mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-CodeLlama-7b-Instruct-hf-GGUF (este) | 6,74 B | 8.192 (GPU) / 4.096 (CPU) | Q5_K_M | Apache 2.0 | Hugging Face (0 descargas) |
| CodeLlama-7b-Instruct-hf (original) | 6,74 B | 16.384 tokens (según documentación de Meta) | FP16 / BF16 | Llama 2 Community License | Hugging Face (oficial) |
| CodeLlama-7b-Instruct GGUF (otras cuantizaciones comunitarias) | 6,74 B | Variable según configuración | Q4_K_M, Q5_K_M, Q8_0, etc. | Llama 2 Community License | Múltiples repositorios en Hugging Face |
| Modelos de código de 7 B alternativos (p. ej. DeepSeek-Coder-6.7B-Instruct) | ~6,7 B | 16.384 tokens | Múltiples | Licencia específica del autor | Hugging Face |

La comparación con el original revela una discrepancia relevante: la model card de esta cuantización declara 8.192 tokens de contexto en GPU, mientras que la documentación oficial de CodeLlama-7b-Instruct-hf indica 16.384 tokens. No se aclara en el repositorio si se trata de una limitación de la cuantización, de la configuración de prueba o de un error de transcripción. Para alternativas de código de tamaño similar conviene consultar las fichas oficiales de cada modelo, ya que esta cuantización no aporta datos comparativos propios.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en el repositorio; el modelo base hereda los sesgos de los datos de entrenamiento de CodeLlama, no caracterizados aquí.
- Riesgo de alucinación: presente como en cualquier LLM; el autor declara explícitamente que no asume responsabilidad alguna sobre las salidas y que el usuario debe auditar y validar todo el contenido generado.
- Limitaciones de contexto: la ventana efectiva se reduce a 4.096 tokens en CPU y 8.192 en GPU según la model card, por debajo de los 16.384 tokens del modelo original. No se documenta el comportamiento en contextos largos.
- Idiomas: no disponibles; no se especifica si el ajuste de instrucciones cubre castellano u otros idiomas distintos del inglés.
- Restricciones de licencia: el repositorio declara Apache 2.0, pero el modelo base CodeLlama se distribuye bajo la Llama 2 Community License, que impone restricciones adicionales (umbral de 700 millones de usuarios mensuales, obligaciones de atribución y cláusulas de uso aceptable). Existe una inconsistencia entre ambas licencias que conviene resolver antes de un uso comercial.
- Falta de validación: cero descargas y cero likes en el momento de la consulta; no hay evaluaciones independientes ni resultados de benchmarks reproducibles.
- Trazabilidad dudosa: la fecha de creación declarada (2026-11-25) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos del repositorio.
- Metadatos incompletos: no se documentan los idiomas, el proceso exacto de cuantización, la herramienta y versión empleadas, ni los parámetros de inferencia recomendados más allá de temperatura 0,7 y top_p 0,9 en el ejemplo de Ollama.
- Uso en producción: la ausencia de pruebas de calidad y de throughput desaconseja su despliegue en entornos críticos sin una evaluación previa propia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pranil00/ONIX-CodeLlama-7b-Instruct-hf-GGUF
- Modelo base: https://huggingface.co/codellama/CodeLlama-7b-Instruct-hf
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
- Herramienta run-any-model (GitHub): https://github.com/PranilShah-08/run-any-model
- Página oficial de CodeLlama (Meta): https://ai.meta.com/llama/code-llama/
