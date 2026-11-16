# NuevaTechLLC/gemma-3-1b-it-abliterated-v2-GGUF

## Resumen

`NuevaTechLLC/gemma-3-1b-it-abliterated-v2-GGUF` es una versión "abliterated" (con la dirección de rechazo eliminada) del modelo `unsloth/gemma-3-1b-it`, distribuida en formato GGUF para su uso con llama.cpp y Ollama. Lo desarrolla Nueva Tech LLC y se publica bajo licencia Gemma. El objetivo declarado es eliminar el comportamiento de rechazo del modelo base preservando al máximo sus capacidades originales, mediante un pipeline de "abliteración de bajo daño" que trata la eliminación del rechazo como un problema de optimización restringida en lugar de una edición de pesos puntual.

El modelo cuenta con 999.885.952 parámetros (aproximadamente 1.000 millones) y deriva del Gemma 3 1B instruct de Google, un transformer denso. Se ofrece en dos cuantizaciones GGUF: Q4_K_M (0,8 GB) y Q8_0 (1,1 GB), lo que lo hace desplegable en hardware muy modesto, incluyendo GPUs de consumo y CPU. El repositorio ocupa 1,9 GB.

La relevancia de esta ficha radica en su enfoque metodológico: el autor documenta de forma explícita el proceso de extracción de la dirección de rechazo, la búsqueda de hiperparámetros con Optuna y las métricas de daño colateral (KL, sobre-rechazo, capacidades en MMLU/ARC-C/GSM8K). No obstante, la model card está mayoritariamente dedicada a describir el método y a comparar el pipeline con otras herramientas (Heretic, OBLITERATUS) sobre modelos como Qwen3-8B, y no presenta resultados propios completos para este modelo de 1B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Gemma 3 1B instruct) |
| Parametros totales | 999.885.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de llama.cpp usa `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M, Q8_0 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Gemma |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 1.000 millones de parámetros, derivado del checkpoint `unsloth/gemma-3-1b-it`, que a su vez procede del Gemma 3 1B instruct de Google. Sobre ese modelo base se aplica un proceso de "abliteración": localización de la dirección de rechazo mediante contraste masivo entre pares de prompts dañinos y benignos, y eliminación de esa dirección mediante una edición de pesos con cota KL.

El pipeline de Nueva Tech LLC se describe como una optimización restringida con varias etapas: (1) uso de "gemelos benignos" estructuralmente emparejados con cada prompt dañino para aislar la decisión de rechazo del tema, longitud y registro; (2) cuatro comportamientos protegidos (rechazo de premisas falsas, admisión de ignorancia, rechazo de sinsentidos y respeto de restricciones negativas) puntuados con 96 pares de prueba y control, ponderados por encima del KL en la función objetivo; (3) escaneo de capas para localizar dónde se separa mejor el rechazo y aplicación de la edición con un kernel centrado en esa capa; (4) eliminación de la media benigna de la dirección antes de la proyección; (5) descomposición SVD para obtener un subespacio de rango k; y (6) búsqueda con Optuna sobre el objetivo `refusal + λ_kl·KL + λ_cal·calibration_drop + λ_over·Δover_refusal`, con una pasada opcional de autodestilación para "curar" la edición contra los logits cacheados del modelo intacto.

No se especifican en la información disponible el número de tokens de entrenamiento original del modelo base, la composición del dataset de preentrenamiento ni detalles sobre RLHF/DPO del Gemma 3 1B. El autor deja registros del proceso en `extract.json`, `search.json` y `ablation_card.json`.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Gemma 3 1B instruct.
- Comportamiento de rechazo reducido: el modelo declina menos peticiones que el modelo base, según el autor.
- Preservación declarada de cuatro comportamientos de "rechazo calibrado": rechazo de premisas falsas, admisión de ignorancia, rechazo de sinsentidos y respeto de restricciones negativas.
- Compatibilidad con llama.cpp, Ollama y LM Studio (endpoints compatibles según los tags).
- Soporte de plantilla de chat conversacional (archivo `Modelfile` incluido para Ollama).
- Capacidades de tool calling / function calling: no disponibles en la información proporcionada.
- Capacidades de agentes y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el modelo base Gemma 3 1B es solo texto en esta variante.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en interpretabilidad y seguridad: el modelo sirve para estudiar cómo se codifica la dirección de rechazo en un transformer pequeño y cómo responde a ediciones de pesos, ya que el autor publica los artefactos del proceso (`extract.json`, `search.json`, `ablation_card.json`).
- Evaluación comparativa de técnicas de abliteración: útil como punto de referencia de bajo coste (1B parámetros) para contrastar pipelines de eliminación de rechazo en hardware modesto.
- Despliegue en entornos con recursos limitados: con 0,8 GB en Q4_K_M y aproximadamente 2 GB de VRAM/RAM necesarios, puede ejecutarse en portátiles, Raspberry Pi de gama alta o GPUs integradas para generación de texto conversacional.
- Prototipado rápido de asistentes conversacionales en inglés: gracias a su compatibilidad con Ollama y su reducido tamaño, permite iterar sobre plantillas de chat y flujos conversacionales sin infraestructura dedicada.
- Pruebas de robustez y red-teaming: al presentar menor tasa de rechazo, puede emplearse como sujeto de prueba en evaluaciones de filtros de seguridad y clasificadores de contenido.
- Experimentos educativos sobre alineación y edición de modelos: el modelo y su documentación permiten reproducir el pipeline de abliteración en un entorno asequible.
- Generación de texto creativo sin restricciones de rechazo: para casos donde el modelo base declina peticiones legítimas por sobre-rechazo, esta variante puede responder con mayor frecuencia.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de daño entre métodos de abliteración, pero los resultados presentados corresponden a **Qwen3-8B** y no a este modelo de 1B. El autor indica explícitamente que "este modelo no estaba en el bake-off" y que "sus propios números de daño están en la tabla de resultados más abajo", pero esa tabla no aparece en la información proporcionada.

Resultados parciales disponibles (Qwen3-8B, contexto comparativo del método, **no de este modelo**):

| Contender | Refusal | Comply | Over-refusal | KL | MMLU | ARC-C | GSM8K |
|---|---|---|---|---|---|---|---|
| base | 0.954 | 0.004 | 0.370 | 0.000 | 0.757 | 0.560 | 0.892 |
| Heretic 1.4.0 | 0.610 | 0.2 (truncado) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks completos de este modelo en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 2 GB para el archivo Q4_K_M (0,8 GB); el Q8_0 (1,1 GB) requiere algo más, en torno a 2-3 GB.
- GPU recomendadas: cualquier GPU de consumo con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); también funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en hardware integrado.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (con `Modelfile` incluido), LM Studio (`lms import`).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (1B parámetros), se espera alta velocidad en hardware de consumo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-3-1b-it-abliterated-v2 (este) | ~1.000 M | no disponible | Gemma | GGUF | Abliterated, solo inglés |
| unsloth/gemma-3-1b-it (base) | ~1.000 M | no disponible | Gemma | safetensors/GGUF | Modelo base sin abliterar |
| Heretic 1.4.0 (herramienta) | no aplica | no aplica | no disponible | no disponible | Herramienta de abliteración automática |
| OBLITERATUS (herramienta) | no aplica | no aplica | no disponible | no disponible | Herramienta de abliteración (presets advanced/optimized) |

No se dispone de datos de rendimiento comparativo específicos para este modelo de 1B frente a alternativas del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- **Eliminación deliberada de rechazo**: el modelo ha sido modificado para declinar menos peticiones, lo que puede llevar a generar contenido dañino, inseguro o inapropiado. No debe desplegarse en producción orientada a usuarios sin filtros de seguridad adicionales.
- **Riesgo de alucinación**: como modelo de 1B parámetros, su capacidad de razonamiento y factualidad es limitada; la eliminación de la dirección de rechazo puede reducir además su tendencia a admitir ignorancia, aunque el autor declara proteger ese comportamiento.
- **Solo inglés**: el modelo está etiquetado únicamente para inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- **Licencia Gemma**: el uso comercial está sujeto a los términos de la licencia Gemma de Google, que incluye restricciones de uso aceptable y obligaciones de atribución.
- **Documentación incompleta**: la model card está truncada y no incluye la tabla de resultados propia del modelo ni detalles sobre contexto máximo o datos de entrenamiento del base.
- **Sin validación independiente**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso o evaluación por terceros.
- **Fecha de creación futura**: el repositorio figura creado el 2026-11-15, lo que debe tenerse en cuenta al evaluar su vigencia.
- **Contexto no confirmado**: aunque el ejemplo de llama.cpp usa `-c 8192`, no se confirma oficialmente la longitud de contexto soportada.

## Enlaces

- Hugging Face: https://huggingface.co/NuevaTechLLC/gemma-3-1b-it-abliterated-v2-GGUF
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-3-1b-it
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Heretic (herramienta de abliteración): no disponible en la información proporcionada
- OBLITERATUS (herramienta de abliteración): no disponible en la información proporcionada
- Paper o blog del método: no disponible en la información proporcionada
