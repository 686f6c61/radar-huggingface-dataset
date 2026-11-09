# McG-221/Spectre-37B-v1-mlx-8Bit

## Resumen

Spectre-37B-v1-mlx-8Bit es una conversión al formato MLX, en cuantización de 8 bits, del modelo TheDrummer/Spectre-37B-v1. La conversión la firma el usuario McG-221 y se ha realizado con mlx-lm 0.31.2, la librería de Apple para ejecutar modelos de lenguaje sobre silicio Apple (M1/M2/M3/M4) mediante el framework MLX. El modelo no es un entrenamiento original: es un artefacto derivado que empaqueta los pesos del modelo base en un formato optimizado para macOS.

El modelo base pertenece a la familia Gemma 4, según la etiqueta `gemma4` del repositorio, y cuenta con 36.554.956.032 parámetros (aproximadamente 36,6 mil millones), lo que lo sitúa en la gama de modelos densos de gran tamaño. El repositorio ocupa 38,9 GB, coherente con una cuantización de 8 bits de un modelo de ese tamaño. No se dispone de información sobre arquitectura interna, contexto, datos de entrenamiento ni licencia en la información proporcionada.

La relevancia de esta ficha es limitada pero concreta: sirve a desarrolladores que trabajan en Mac con Apple Silicon y quieren ejecutar localmente un modelo de ~37B en 8 bits sin pasar por CUDA. Al ser una conversión de un modelo de terceros (TheDrummer), conviene consultar siempre la ficha del modelo base para conocer capacidades reales, licencia y limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4` sugiere familia Gemma 4; detalles internos no disponibles) |
| Parametros totales | 36.554.956.032 (~36,6B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); otras cuantizaciones no disponibles en este repo |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de la etiqueta `gemma4`, que apunta a la familia Gemma 4 de Google. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o similares. El repositorio es una conversión de formato, no un entrenamiento nuevo, por lo que las decisiones de arquitectura y entrenamiento corresponden al autor original (TheDrummer) y, en última instancia, al modelo Gemma subyacente.

La innovación técnica de este artefacto concreto es la conversión a MLX con cuantización de 8 bits mediante mlx-lm 0.31.2. MLX es el framework de arrays de Apple optimizado para memoria unificada en chips de la serie M, lo que permite cargar modelos grandes sin GPU dedicada. El proceso de conversión no introduce cambios en los pesos más allá de la cuantización; no hay decodificación especulativa, atención lineal ni modificaciones algorítmicas documentadas en la model card.

## Capacidades

- Generación de texto autoregresiva estándar, heredada del modelo base TheDrummer/Spectre-37B-v1.
- Capacidades específicas (razonamiento, código, matemáticas, visión, tool calling, agentes, multilingüismo) no están documentadas en la información proporcionada; deben consultarse en la ficha del modelo base.
- Ejecución nativa en Apple Silicon mediante MLX, con `mlx_lm.load` y `mlx_lm.generate`.
- Soporte de plantilla de chat si el tokenizer la incluye (`apply_chat_template`), según el ejemplo de la model card.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: cargar el modelo con `mlx_lm` para probar generación de texto en un equipo de sobremesa o portátil con memoria unificada suficiente (el repo pesa 38,9 GB, por lo que se requiere al menos 48 GB de memoria unificada para cargarlo con holgura).
- Prototipado rápido sin GPU NVIDIA: desarrolladores que trabajan en macOS pueden evaluar el comportamiento del modelo base sin montar un entorno CUDA.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad de 8 bits MLX frente a los pesos originales del modelo base.
- Pruebas de integración con `mlx-lm`: verificar pipelines de carga, plantilla de chat y generación antes de adoptar el modelo base en un proyecto mayor.
- Desarrollo de asistentes conversacionales en local: si el modelo base rinde bien en diálogo, esta conversión permite desplegarlo en estaciones de trabajo Mac sin enviar datos a la nube.
- Investigación sobre eficiencia en Apple Silicon: medir throughput y uso de memoria de un modelo de ~37B en 8 bits sobre MLX como referencia para estudios de despliegue en hardware de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 38,9 GB, por lo que se recomienda un mínimo de 48 GB de memoria unificada para cargar el modelo con margen para el contexto y el runtime.
- GPU recomendadas: no aplica GPU dedicada; el formato MLX está pensado para Apple Silicon (series M1, M2, M3, M4 y variantes Pro/Max/Ultra).
- ¿Cabe en consumer GPU? No en el sentido tradicional (CUDA); en Apple Silicon, sí en configuraciones con 48 GB o más de memoria unificada (por ejemplo, Mac Studio o MacBook Pro con M Max/Ultra de gama alta).
- Opciones de despliegue: `mlx-lm` (librería indicada en la model card). No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) para este artefacto concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| McG-221/Spectre-37B-v1-mlx-8Bit | ~36,6B | no disponible | MLX safetensors 8-bit | no disponible | Hugging Face (0 descargas) |
| TheDrummer/Spectre-37B-v1 (base) | ~36,6B (presumible) | no disponible | safetensors (formato original) | no disponible | Hugging Face |
| Otras conversiones MLX de modelos ~37B | no disponible | no disponible | MLX | variable | variable |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada en este repositorio; antes de cualquier uso comercial debe verificarse la licencia del modelo base TheDrummer/Spectre-37B-v1 y, en su caso, la de la familia Gemma subyacente.
- Al ser una conversión de terceros, no hay garantía de que los pesos cuantizados reproduzcan fielmente el comportamiento del modelo base; la cuantización de 8 bits puede introducir degradación en tareas sensibles.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria conocida; no hay evidencia pública de que la conversión haya sido probada a fondo.
- No se documentan sesgos, riesgos de alucinación, idiomas soportados ni limitaciones de contexto; deben consultarse en la ficha del modelo base.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a CUDA sin reconversión.
- El tamaño del repo (38,9 GB) exige equipos con memoria unificada alta; en configuraciones de 32 GB o menos no cabrá con holgura.
- No se especifica el pipeline ni la tarea; la integración en producción requiere validación previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/McG-221/Spectre-37B-v1-mlx-8Bit
- Modelo base: https://huggingface.co/TheDrummer/Spectre-37B-v1
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
