# mohommed/Lucet-Coder-4B-Omega

## Resumen

Lucet-Coder-4B-Omega es un modelo de generación de texto especializado en código, desarrollado por el usuario mohommed y publicado en HuggingFace en octubre de 2026. Se trata de un ajuste post-entrenamiento (post-trained) sobre el modelo base XHToken/Spark-X2.6-4B, un modelo de 4.112 millones de parámetros con una ventana de contexto nativa de 1.048.576 tokens (1M). Su objetivo es mejorar las capacidades de generación y depuración de código del modelo base manteniendo intacta su calibración de contexto largo.

La relevancia del modelo radica en el conjunto de técnicas de post-entrenamiento aplicadas: adaptación de bajo rango que preserva las proyecciones de query y key (para no romper la calibración RoPE del contexto de 1M), minería activa de clústeres de fallos con inmunización contra bugs mediante contrafactuales AST, eliminación espectral de ruido mediante QR-SVD, y una cuantización Q4_K con ecualización de crest-factor junto a un proceso de "des-censura" mediante proyección ortogonal de rechazos (GSQ-v2).

Según la model card del autor, el modelo mejora el pass@1 en MBPP Sanitized de 58,0% a 72,0% respecto al modelo base y reduce un 20,1% los tokens necesarios por tarea resuelta. Está publicado bajo licencia Apache 2.0, con pesos disponibles en safetensors y GGUF, lo que lo hace apto tanto para despliegue con transformers como para inferencia local en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Spark-X2.6-4B), adaptadores low-rank fusionados |
| Parametros totales | 4.112.079.360 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 1.048.576 tokens (1M, según model card) |
| Tipos de cuantizacion | Q4_K (GGUF con imatrix); pesos base en safetensors sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de XHToken/Spark-X2.6-4B, un transformer decoder con ventana de contexto nativa de 1M tokens. El post-entrenamiento emplea una técnica denominada "RoPE-Preserving Split-Stack Adaptation" con rango r=16: se mantienen congeladas al 100% las matrices `q_proj` y `k_proj` de todas las capas (preservando la calibración de fase RoPE del contexto de 1.048.576 tokens) y se adaptan únicamente las matrices `v_proj`, `out_proj` y las proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`, `g_proj`) en la mitad superior de la red. Los adaptadores se fusionan posteriormente en los pesos base.

El proceso de generación de datos combina dos innovaciones principales. Primero, "Failure-Cluster Active Data Mining & AST Counterfactual Bug Immunization": se diagnostican modos de fallo del modelo base (pensamiento truncado, límites de aserción, imports ausentes, alucinación epistémica) en clústeres de tareas algorítmicas, y se generan dinámicamente tareas vecinas no vistas junto con bugs contrafactuales inyectados vía AST, sin repetición de datos de entrenamiento. Segundo, "QR-SVD Gavish-Donoho Spectral Denoising": se eliminan los valores singulares correspondientes a ruido estocástico del gradiente en los adaptadores de bajo rango antes de su fusión, con coste O(r²(d_out + d_in)). Para la distribución GGUF se aplica una ecualización de crest-factor por super-bloques de 32 elementos (crest ≤ 3,8 rms) junto a calibración con `llama-imatrix`, y un proceso de "des-censura" denominado KL-Bounded Uncensored-GSQ-v2 basado en proyección ortogonal de Gram-Schmidt sobre las direcciones de rechazo. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generación de código: mejora del pass@1 en MBPP Sanitized (72,0% frente a 58,0% del modelo base, según el autor) con énfasis en depuración y corrección de patrones de fallo típicos (imports ausentes, límites de aserción).
- Eficiencia de tokens: el autor reporta un 20,1% menos de tokens de razonamiento y código por tarea resuelta (376 frente a 470 de media).
- Contexto ultra-largo: hasta 1.048.576 tokens, heredado del modelo base y preservado por la adaptación, útil para analizar repositorios completos o bases de código extensas.
- Razonamiento conversacional: pipeline de text-generation con etiqueta conversational.
- Resistencia a alucinación: el autor reporta una mejora del 12,5% en su prueba interna de anti-alucinación epistémica (n=8), aunque la muestra es muy reducida.
- Modelo "uncensored": el proceso GSQ-v2 elimina comportamientos de rechazo, lo que permite respuestas sin filtros de seguridad (ver limitaciones).
- No se ha publicado información sobre tool calling, function calling, capacidades agénticas, visión o audio.

## Casos de uso

- Revision de repositorios completos: gracias a la ventana de contexto de 1M tokens, el modelo puede ingerir bases de código enteras (decenas o cientos de miles de líneas) para responder preguntas sobre arquitectura, dependencias entre módulos o deuda técnica sin fragmentación.
- Depuracion y correccion de bugs: el entrenamiento con contrafactuales AST y minería de clústeres de fallos lo hace adecuado para detectar y corregir errores comunes como imports ausentes, condiciones de borde en aserciones o razonamiento truncado.
- Generacion de codigo en entornos locales: con pesos GGUF Q4_K y calibración imatrix, puede ejecutarse en estaciones de trabajo con GPUs de consumo mediante llama.cpp u Ollama, útil para desarrolladores que no pueden enviar código propietario a APIs externas.
- Asistente de programacion offline o privado: la licencia Apache 2.0 y el tamaño de 4B permiten integrarlo en IDEs o pipelines internos sin restricciones comerciales ni dependencia de terceros.
- Generacion de tests unitarios: el enfoque en "failure-cluster mining" sugiere utilidad para generar casos de prueba que cubran límites de aserción y condiciones de fallo poco frecuentes.
- Reduccion de costes de inferencia: la menor cantidad de tokens por tarea resuelta (376 frente a 470 según el autor) reduce el coste por consulta en despliegues a gran escala.
- Analisis de documentacion extensa: la ventana de 1M tokens permite combinar documentación técnica completa con el código fuente en una sola sesión.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (verificación previa a la publicación, muestra reducida en algunos casos):

| Benchmark / Metrica | Spark-X2.6-4B (base) | Lucet-Omega | Mejora |
|---|:---:|:---:|:---:|
| Held-Out MBPP Sanitized pass@1 (n=50) | 58,0% | 72,0% | +14,0% |
| Tokens medios de razonamiento + codigo por tarea resuelta | 470 | 376 | +20,1% (mas rapido) |
| Held-Out Epistemic Anti-Hallucination Rate (n=8) | 0,0% | 12,5% | +12,5% |

No se han publicado resultados independientes ni comparaciones con modelos de terceros (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos del modelo base citados por el autor (54,3% SWE Pro, 71,8% BFCL-V4) provienen de la model card y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos GGUF Q4_K, el modelo de ~4,1B parámetros ocupa aproximadamente 2,5-3 GB de VRAM o RAM para el propio modelo, más la sobrecarga de KV-cache. Con contexto de 1M tokens, la caché KV puede requerir decenas de GB adicionales; para contextos largos se recomienda una GPU con 24 GB o más, o contextos reducidos en hardware modesto.
- GPUs recomendadas: RTX 3060/4060 (12 GB) para contextos cortos con GGUF Q4_K; RTX 4090 (24 GB) para contextos medianos; A100/H100 80 GB para explotar la ventana completa de 1M tokens.
- Cabe en GPUs de consumo: sí, en formato GGUF Q4_K cabe cómodamente en GPUs de 8-12 GB para contextos moderados, e incluso en CPU con suficiente RAM dada la compatibilidad llama.cpp.
- Opciones de despliegue: transformers (safetensors), llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. No se menciona compatibilidad explícita con vLLM o TGI.
- Latencia y throughput: no disponibles. El autor reporta únicamente la mejora de eficiencia en tokens por tarea, no mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mohommed/Lucet-Coder-4B-Omega | 4,11B | 1M (según autor) | Apache 2.0 | safetensors + GGUF |
| XHToken/Spark-X2.6-4B (base) | ~4B | 1M | no disponible | safetensors |
| Qwen2.5-Coder-3B | 3,09B | 32K | Qwen Research / Apache 2.0 (variantes) | safetensors + GGUF |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | safetensors + GGUF |

Lucet-Coder-4B-Omega se diferencia de alternativas de tamaño similar principalmente por su ventana de contexto de 1M tokens (frente a 32K-128K de Qwen2.5-Coder-3B y Phi-3.5-mini) y por su naturaleza "uncensored". A cambio, carece de la validación independiente y el ecosistema de los modelos de laboratorios establecidos.

## Limitaciones y advertencias

- Modelo "uncensored": el proceso GSQ-v2 elimina explícitamente los comportamientos de rechazo del modelo. Esto supone un riesgo serio de generación de contenido nocivo y debe evaluarse antes de cualquier despliegue orientado a usuarios finales.
- Riesgo de alucinación: la prueba anti-alucinación del autor se realizó con solo 8 muestras (12,5% de mejora), un tamaño muestral insuficiente para extraer conclusiones fiables. El modelo base partía de un 0,0% en esa métrica.
- Datos de rendimiento no verificados: los benchmarks provienen de la propia model card del autor, con muestras pequeñas (n=50 en MBPP) y sin auditoría independiente. El repo tiene solo 434 descargas y 0 likes en el momento de la ficha, sin comunidad que avale los resultados.
- Contexto de 1M tokens: explotar la ventana completa requiere hardware considerable por el coste de la caché KV; en la práctica, la mayoría de despliegues en consumo usarán contextos mucho menores.
- Idiomas soportados: no disponible; no está documentado el rendimiento en castellano ni en otros idiomas.
- custom_code: el modelo usa la etiqueta custom_code, lo que implica ejecución de código arbitrario del repositorio al cargarlo con transformers; revisa el código antes de ejecutarlo en entornos sensibles.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, pero el componente "uncensored" puede entrar en conflicto con las políticas de uso de algunas plataformas y jurisdicciones.
- Procedencia poco clara: ni el autor ni el modelo base XHToken/Spark-X2.6-4B tienen documentación verificable pública amplia; se recomienda cautela antes de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohommed/Lucet-Coder-4B-Omega
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Paper, blog o demo: no disponibles
