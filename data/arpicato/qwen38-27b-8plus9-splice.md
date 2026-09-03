# arpicato/qwen38-27b-8plus9-splice

## Resumen

El modelo `arpicato/qwen38-27b-8plus9-splice` es un paquete experimental de fusión de capas (splicing) sobre un modelo base de la familia Qwen3.8. El autor, arpicato, ha publicado dos archivos GGUF: `baseline.gguf` (una copia exacta del modelo base en cuantización Q4_K_M) y `spliced.gguf`, donde las capas 8 y 9 del modelo original se han sustituido por un bloque de estudiante. Este bloque se incorpora en formato F16 porque las herramientas locales de cuantización no pueden convertir las matrices de atención lineal DeltaNet (características de Qwen3.5) a Q4_K. El resultado es un modelo de 27.320.697.856 parámetros totales, con un tamaño de repositorio de 33.3 GB.

El proyecto es relevante como demostración técnica de modificación arquitectónica de modelos existentes, pero carece de documentación sobre entrenamiento, capacidades o rendimiento. No se han publicado benchmarks, ni especificaciones de contexto, idiomas o licencia. Se trata de un artefacto de investigación o experimento personal, no de un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen3.8; se menciona atención lineal DeltaNet de Qwen3.5) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (para el baseline), F16 (para los tensores del bloque de estudiante) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivos `.gguf`) |

## Arquitectura y entrenamiento

La información disponible se limita a la descripción del empaquetado. El modelo base es presumiblemente un Qwen3.8 (27B parámetros), del cual se conservan las capas 0 a 7 y 10 a 64, mientras que las capas 8 y 9 se reemplazan por un único bloque de estudiante. Este bloque utiliza matrices de atención lineal DeltaNet, propias de Qwen3.5, y se ha aplicado el reordenamiento de V-head oficial de llama.cpp para esos tensores. Los tensores del estudiante se mantienen en F16 por limitaciones de las herramientas locales de cuantización, lo que puede afectar al rendimiento de inferencia.

No se proporciona información sobre el proceso de entrenamiento del bloque de estudiante, el dataset utilizado, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se especifica el número de tokens de entrenamiento. El autor indica que la validación completa (generación y NLL) está pendiente por falta de binarios de llama.cpp en su entorno.

## Capacidades

No se han publicado capacidades concretas del modelo. Al tratarse de un splice experimental, no se puede afirmar que mantenga las capacidades del modelo base original. La única información técnica es la referente a la estructura de capas y el formato de pesos. Se desconoce si el modelo conserva generación de texto, razonamiento, código, soporte de herramientas o capacidades multilingües.

## Casos de uso

- Uso experimental para investigación de splicing de capas: el modelo sirve como banco de pruebas para evaluar cómo afecta la sustitución de capas intermedias a la calidad de generación y a la representación interna de un modelo de lenguaje.
- Comparación A/B entre baseline y spliced: los dos archivos GGUF permiten ejecutar pruebas de generación lado a lado y medir diferencias en perplejidad o coherencia textual.
- Desarrollo de herramientas de cuantización: el hecho de que los tensores DeltaNet no puedan cuantizarse a Q4_K con las herramientas actuales abre vías para mejorar los convertidores de GGUF.
- Estudio de arquitecturas híbridas: el bloque de estudiante con atención lineal puede analizarse en aislamiento para comprender su comportamiento dentro de un transformer más grande.
- Validación de compatibilidad de formatos: el paquete sirve para probar la interoperabilidad de GGUF con diferentes backends (llama.cpp, Ollama, etc.) cuando se mezclan tensores de distinta precisión.
- Reproducción de resultados académicos: si el autor publica métricas en el futuro, otros investigadores podrán reproducir sus experimentos usando estos archivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio autor indica que la validación completa (generación y NLL) está pendiente, por lo que no existen datos de MMLU, HumanEval, GSM8K u otras pruebas estándar.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 33.3 GB, por lo que se necesitan al menos 35 GB de espacio libre para descargar y descomprimir.
- VRAM estimada: no disponible con exactitud. Dado que el baseline está en Q4_K_M y el modelo tiene 27.3B parámetros, se estima que el archivo baseline pesa alrededor de 14-16 GB, lo que requiere una GPU con al menos 16 GB de VRAM para inferencia en FP16 con offloading, o 24 GB para cargar completamente en memoria. El archivo spliced, con tensores F16 adicionales, podría requerir más memoria.
- GPUs recomendadas: no especificadas. Por el tamaño, se necesitaría al menos una RTX 3090/4090 (24 GB) o una A100 (40/80 GB) para cargar el modelo completo sin cuantización adicional.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros backends que soporten este formato. No se menciona compatibilidad con vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un experimento de splicing sobre Qwen3.8, pero no se conocen las características del modelo base original (contexto, idiomas, rendimiento). Como alternativa, se podría comparar con el Qwen3.8 estándar si se tuvieran sus especificaciones, pero no se han proporcionado. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo experimental sin validación: el autor no ha ejecutado pruebas de generación ni de perplejidad, por lo que no se garantiza que el modelo funcione correctamente ni que produzca texto coherente.
- Licencia desconocida: al no especificarse la licencia, no se puede determinar si su uso comercial está permitido. Se recomienda contactar con el autor antes de cualquier uso fuera del ámbito personal.
- Riesgo de alucinación y sesgos: al ser un modelo de lenguaje, es probable que presente alucinaciones y sesgos, pero al no haber documentación, no se puede evaluar su magnitud.
- Cuantización mixta: la combinación de tensores Q4_K_M y F16 puede provocar un rendimiento de inferencia irregular y un mayor consumo de memoria en comparación con un modelo totalmente cuantizado.
- Falta de soporte: no hay garantías de mantenimiento, actualizaciones o corrección de errores por parte del autor.
- Procedencia del modelo base: no se indica la revisión exacta del Qwen3.8 original ni su licencia, lo que añade incertidumbre legal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/arpicato/qwen38-27b-8plus9-splice
- SHA256SUMS (verificación de integridad): disponible dentro del repositorio, pero sin URL directa.
- `splice-metadata.json`: archivo de metadatos incluido en el repositorio, sin URL directa.
