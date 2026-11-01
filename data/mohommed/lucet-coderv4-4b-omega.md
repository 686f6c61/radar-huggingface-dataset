# mohommed/Lucet-CoderV4-4B-Omega

## Resumen

Lucet-CoderV4-4B-Omega es un ajuste fino (post-entrenamiento) del modelo base XHToken/Spark-X2.6-4B, desarrollado por el usuario mohommed y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo de 4.112 millones de parámetros orientado a generación de texto y código, con una ventana de contexto nativa declarada de 1.048.576 tokens (1M). El autor lo presenta como un modelo "uncensored" especializado en tareas de programación, con mejoras reportadas en benchmarks de código como MBPP.

La relevancia del modelo radica en su enfoque de post-entrenamiento: el autor describe cuatro técnicas matemáticas y de sistemas aplicadas sobre el modelo base, incluyendo adaptación de bajo rango preservando RoPE, minería activa de datos basada en clústeres de fallos, denoising espectral QR-SVD y cuantización GGUF con calibración imatrix. El modelo se distribuye tanto en formato safetensors como en GGUF, lo que facilita su despliegue en entornos con recursos limitados.

No obstante, la información disponible es limitada: no se especifican los idiomas soportados, no hay datos sobre la composición del dataset de entrenamiento más allá de las descripciones cualitativas del autor, y los benchmarks reportados provienen exclusivamente de la model card del propio autor, sin verificación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Spark-X2.6-4B; detalles específicos no disponibles) |
| Parámetros totales | 4.112.079.360 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 1.048.576 tokens (1M) declarados |
| Tipos de cuantización | GGUF Q4_K (con calibración imatrix); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo se basa en XHToken/Spark-X2.6-4B, un transformer de 4.112 millones de parámetros con una ventana de contexto nativa de 1M tokens. El autor no detalla la arquitectura interna del modelo base (número de capas, dimensiones ocultas, tipo de atención), por lo que no es posible confirmar si emplea attention lineal, decodificación especulativa u otras innovaciones. El post-entrenamiento se realizó mediante adaptación de bajo rango (r=16) con una estrategia denominada "RoPE-Preserving Split-Stack": se congelan por completo las proyecciones q_proj y k_proj en todas las capas para preservar la calibración de fase RoPE a 1M tokens, y se adaptan únicamente las matrices v_proj, out_proj y las proyecciones MLP (gate_proj, up_proj, down_proj, g_proj) en la mitad superior de la red.

El entrenamiento incorpora una técnica de minería activa de datos basada en clústeres de fallos, que diagnostica modos de error (FAIL_TRUNCATED_THINK, FAIL_ASSERTION_BOUNDARY, FAIL_MISSING_IMPORT, FAIL_EPISTEMIC_HALLUCINATION) y selecciona tareas vecinas no vistas junto con bugs contrafactuales generados por AST. Según el autor, esto logra un +14,0% en MBPP pass@1 y un +20,1% de eficiencia en tokens sin repetición de datos. Además, se aplica un denoising espectral QR-SVD (Gavish-Donoho) para eliminar valores singulares de ruido estocástico antes de fusionar los adaptadores, y una cuantización Q4_K con ecualización de crest factor de 32 bloques y proyección de rechazo Gram-Schmidt, calibrada con llama-imatrix.

## Capacidades

- Generación de texto y código: el modelo está orientado a tareas de programación, con mejoras reportadas en MBPP pass@1.
- Razonamiento multi-paso: el autor menciona modos de fallo como FAIL_TRUNCATED_THINK, lo que sugiere soporte de cadenas de pensamiento (thinking mode).
- Tool calling / function calling: el modelo base Spark-X2.6-4B reporta 71,8% en BFCL-V4, lo que indica capacidades de llamada a funciones, aunque no se especifica si el ajuste las preserva íntegramente.
- Contexto largo: ventana nativa de 1M tokens, adecuada para tareas que requieren procesar grandes volúmenes de código o documentación.
- Modo "uncensored": el autor indica que se ha aplicado una proyección de rechazo Gram-Schmidt para eliminar restricciones de contenido, lo que implica que el modelo puede generar contenido sin los filtros habituales.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no disponibles.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests unitarios o sugerir correcciones, aprovechando su entrenamiento específico en tareas de código y su contexto de 1M tokens para analizar repositorios completos.
- Análisis de repositorios extensos: gracias a la ventana de 1M tokens, puede procesar múltiples archivos de un proyecto en una sola pasada para tareas de refactorización, detección de dependencias o revisión de código.
- Asistente de depuración: el entrenamiento con minería de fallos y bugs contrafactuales lo hace adecuado para diagnosticar errores comunes (imports faltantes, aserciones incorrectas) y proponer correcciones.
- Automatización de tareas de razonamiento algorítmico: puede resolver problemas de programación competitiva o ejercicios de algoritmia, con un modo de pensamiento que estructura la solución paso a paso.
- Generación de documentación técnica: a partir de código fuente, el modelo puede producir docstrings, comentarios y documentación de API, aprovechando su capacidad de contexto largo.
- Despliegue en entornos con recursos limitados: la disponibilidad de cuantización GGUF Q4_K permite ejecutar el modelo en GPUs de consumo con VRAM moderada, facilitando prototipado local y pruebas offline.
- Experimentación con modelos sin filtros: para investigadores que necesitan estudiar el comportamiento de modelos sin restricciones de contenido, el modo "uncensored" ofrece un punto de partida, aunque con las advertencias éticas y legales correspondientes.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card del autor, que compara el modelo ajustado con el base:

| Benchmark / Métrica | Spark-X2.6-4B (base) | Lucet-Omega | Mejora |
|---|---|---|---|
| MBPP sanitizado pass@1 (n=50) | 58,0% | 72,0% | +14,0% |
| Tokens medios por tarea resuelta | 470 | 376 | +20,1% más rápido |
| Tasa anti-alucinación epistémica (n=8) | 0,0% | 12,5% | +12,5% |

No se han publicado resultados independientes de MMLU, HumanEval, GSM8K u otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para 4.112 millones de parámetros en FP16 se requieren aproximadamente 8,2 GB solo para pesos, más overhead de activaciones y caché KV; en Q4_K se reduce a unos 2,3-2,5 GB.
- GPU recomendadas: para FP16, una RTX 4090 (24 GB) o A100 (40/80 GB) permiten inferencia cómoda; para Q4_K, una RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) son suficientes.
- ¿Cabe en GPU de consumo? Sí, en cuantización Q4_K cabe en GPUs con 8 GB o más de VRAM; en FP16 requiere al menos 12 GB.
- Opciones de despliegue: transformers (nativo), llama.cpp (para GGUF), Ollama (si se publica el formato), vLLM y TGI (para safetensors, aunque la compatibilidad con el contexto de 1M puede requerir configuración adicional).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lucet-CoderV4-4B-Omega | 4,1B | 1M | Apache 2.0 | Safetensors, GGUF | Ajuste especializado en código, uncensored |
| XHToken/Spark-X2.6-4B (base) | 4,1B | 1M | No disponible | Safetensors | Modelo base, sin ajuste específico |
| Modelos de código de ~4B (p. ej., CodeLlama-7B, Qwen2.5-Coder-7B) | 7B | 16K-128K | Licencias variables | Safetensors, GGUF | Alternativas establecidas, pero con menor contexto nativo |

No se dispone de datos comparativos de rendimiento con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo "uncensored" puede generar contenido sesgado, ofensivo o inapropiado sin filtros.
- Riesgo de alucinación: el autor reporta una tasa de anti-alucinación epistémica del 12,5% en una muestra pequeña (n=8), lo que indica que el modelo aún puede alucinar en una proporción significativa de casos.
- Limitaciones de contexto o idioma: aunque se declara un contexto de 1M tokens, no se especifica el rendimiento real en esa longitud; los idiomas soportados no están documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base puede tener sus propias restricciones no especificadas; además, el modo "uncensored" puede generar contenido que viole políticas de uso en productos comerciales.
- Caveats para producción: los benchmarks son auto-reportados y con muestras pequeñas (n=50, n=8), por lo que deben tomarse con cautela; no hay validación independiente. La arquitectura exacta y los datos de entrenamiento no están detallados, lo que dificulta evaluar su robustez.

## Enlaces

- [HuggingFace: mohommed/Lucet-CoderV4-4B-Omega](https://huggingface.co/mohommed/Lucet-CoderV4-4B-Omega)
- [Modelo base: XHToken/Spark-X2.6-4B](https://huggingface.co/XHToken/Spark-X2.6-4B)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
