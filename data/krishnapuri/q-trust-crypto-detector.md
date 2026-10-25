# KRISHNAPURI/q-trust-crypto-detector

## Resumen

Q-Trust Crypto Detector es un clasificador binario de código fuente que determina si un fichero utiliza primitivas criptográficas. Lo desarrolla el usuario KRISHNAPURI dentro del proyecto Q-Trust, una iniciativa de descubrimiento criptográfico y generación de CBOM (CycloneDX) orientada a la migración post-cuántica. El modelo responde a una pregunta muy concreta: "¿usa este fichero criptografía?", no "¿la usa correctamente?".

Técnicamente es un fine-tune de `huggingface/CodeBERTa-small-v1` para clasificación de secuencias con dos etiquetas (`LABEL_0` sin criptografía, `LABEL_1` con criptografía). Cuenta con 83.452.418 parámetros, trunca la entrada a 256 tokens y procesa ficheros largos troceándolos en inferencia. Cubre 12 lenguajes (C, C++, Java, Go, Rust, Python, JavaScript/TypeScript, Solidity, C#, PHP, Zig y Swift) e incluye detección de algoritmos post-cuánticos como ML-KEM/Kyber, ML-DSA/Dilithium, SLH-DSA/SPHINCS+, Falcon y HQC.

Su relevancia es operativa: sustituye o complementa el triaje por expresiones regulares en pipelines de inventario criptográfico a escala de repositorio. Frente a una línea base TF-IDF + LogisticRegression (F1 0,6675), el modelo declara un F1 de 0,8966 en el split digest y 0,9077 en el split nativo, ambos sobre repositorios retenidos sin solapamiento de rutas con el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (base `huggingface/CodeBERTa-small-v1`), cabeza de clasificación de secuencias con 2 etiquetas |
| Parametros totales | 83.452.418 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens por fragmento (truncado); los ficheros largos se trocean en inferencia |
| Tipos de cuantizacion | No se publican cuantizaciones; pesos en safetensors (FP32), convertibles a FP16/INT8 con herramientas estándar |
| Idiomas soportados | Código fuente en C, C++, Java, Go, Rust, Python, JavaScript/TypeScript, Solidity, C#, PHP, Zig y Swift; no soporta lenguaje natural |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Pipeline | `text-classification` |
| Etiquetas de salida | `LABEL_1` = criptografía presente; `LABEL_0` = sin criptografía |
| Modelo base | `huggingface/CodeBERTa-small-v1` (fine-tune) |
| Dataset de entrenamiento | `KRISHNAPURI/q-trust-code-corpus-v4` |
| Calibración | Temperature scaling con T = 1,8416 (Brier 0,0853 → 0,0845) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo parte de CodeBERTa-small-v1, un encoder tipo RoBERTa adaptado a código con tokenización por subpalabras, y añade una cabeza de clasificación de secuencias sobre el token `[CLS]`. La entrada se trunca a 256 tokens y, en producción, el pipeline trocea los ficheros largos en fragmentos para agregar la señal a nivel de fichero. El corpus de entrenamiento es el Q-Trust code corpus v4: 17.171 ficheros procedentes de 58 repositorios, de los cuales 8.814 están etiquetados como criptográficos. El split es repo-disjoint y está indexado por digest (buckets SHA-256 del código fuente) con semilla 42, lo que evita fugas entre train y evaluación.

El entrenamiento se realizó durante 3 épocas, con longitud máxima de 256 tokens, batch de 16, optimizador AdamW y learning rate 2e-5, ejecutado íntegramente en CPU. Las etiquetas se derivan por regex (`is_crypto` = contiene una palabra clave criptográfica), un detalle crítico: el techo de rendimiento lo fija el etiquetador, no la capacidad del modelo. El autor documenta que 5 épocas y una v5 con 8 repositorios adicionales empeoraron los resultados. La evaluación incluye una auditoría de fuga que cifra en 0,0 % el solapamiento exacto de rutas para este checkpoint (frente al 87,6 % y 92,2 % que habría memorizado un split ingenuo compartido), y una calibración por temperature scaling.

## Capacidades

- Clasificación binaria de ficheros de código como criptográficos o no criptográficos, con probabilidad calibrada disponible en la salida.
- Detección de criptografía clásica: RSA/ECC, AES/ChaCha20, SHA/BLAKE, X.509.
- Detección de criptografía post-cuántica: ML-KEM/Kyber, ML-DSA/Dilithium, SLH-DSA/SPHINCS+, Falcon y HQC.
- Cobertura multilingüe en 12 lenguajes: C, C++, Java, Go, Rust, Python, JavaScript/TypeScript, Solidity, C#, PHP, Zig y Swift.
- Procesamiento de ficheros largos mediante troceado y agregación de predicciones en el pipeline de inferencia.
- Integración directa con `transformers` (`AutoTokenizer` + `AutoModelForSequenceClassification`) y compatibilidad declarada con Text Embeddings Inference (`endpoints_compatible`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un encoder clasificador de un solo paso.
- No realiza detección de malas prácticas criptográficas, vulnerabilidades ni configuraciones inseguras.

## Casos de uso

- **Generación de CBOM para migración post-cuántica**: el modelo etiqueta cada fichero del repositorio y la salida se vuelca en un inventario CycloneDX, de modo que el equipo de seguridad sabe qué componentes criptográficos existen antes de planificar la sustitución por algoritmos PQC.
- **Triaje previo a un SAST**: ejecutar el detector sobre todo el código y enviar solo los ficheros marcados como criptográficos a las herramientas de análisis profundo, reduciendo drásticamente el volumen de código que consumen los analizadores más caros.
- **Puerta de calidad en CI/CD**: integrar el clasificador como paso de pull request que marque la introducción de nuevas dependencias o rutas criptográficas, con un umbral de probabilidad ajustable según el apetito de falsos positivos del equipo.
- **Medición del avance de migración**: dado que reconoce primitivas PQC concretas, permite construir un indicador de cuántos repositorios han adoptado ML-KEM o ML-DSA frente a los que siguen en RSA/ECC, útil para reportar a comités de cumplimiento (NIS2, CNSA 2.0).
- **Auditoría de código de terceros**: analizar dependencias vendorizadas, binarios fuente distribuidos o repositorios de proveedores antes de su incorporación, cuando no existe inventario interno ni declaración de componentes.
- **Enriquecimiento de SBOM existentes**: cruzar la señal del clasificador con un SBOM previo para detectar criptografía embebida en código propio que no aparece como dependencia declarada.
- **Etiquetado a escala de corpus de código**: preetiquetar grandes volúmenes de repositorios para construir o ampliar datasets de criptografía, con revisión humana posterior sobre las predicciones de menor confianza.
- **Pre-commit hook en proyectos con requisitos criptográficos estrictos**: bloquear localmente la introducción de primitivas no aprobadas antes de que el código llegue al repositorio remoto.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`verified: false`, es decir, no verificados de forma independiente). Todas las cifras corresponden a repositorios retenidos con 0 % de solapamiento exacto de rutas con el entrenamiento.

| Split | Precision | Recall | F1 | n |
|---|---|---|---|---|
| Digest (8 repos retenidos) | 0,9429 | 0,8546 | 0,8966 | 2.238 |
| Native (10 repos retenidos, incluye nuevos) | 0,9444 | 0,8737 | 0,9077 | 2.566 |
| Baseline TF-IDF + LogisticRegression (split native) | no disponible | no disponible | 0,6675 | no disponible |

| Metrica adicional | Valor |
|---|---|
| Ganancia frente al baseline TF-IDF + LR | +0,24 F1 |
| Calibracion (temperature scaling) | T = 1,8416 |
| Brier score antes / despues | 0,0853 / 0,0845 |
| Fuga de evaluacion en split ingenuo (checkpoints previos) | 87,6 % / 92,2 % |
| Fuga de evaluacion en este checkpoint (v4) | 0,0 % |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con otros detectores de criptografía de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en FP32 (≈334 MB de pesos) y ≈167 MB en FP16; el cuello de botella real es el tamaño de batch y la longitud de secuencia, no el modelo.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU. El propio autor entrenó el modelo en CPU, lo que da una idea del perfil de recursos.
- GPU recomendadas para despliegue a gran escala: T4, L4, A10G o A100 si se procesan millones de ficheros en paralelo; para volúmenes moderados, CPU con múltiples hilos es suficiente.
- Opciones de despliegue: `transformers` en Python, Text Embeddings Inference (compatibilidad declarada), exportación a ONNX Runtime o TorchScript para latencia baja, y serving HTTP con FastAPI o similares. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requerirían conversión previa.
- Throughput y latencia: no disponibles en la información proporcionada. Como referencia estructural, un encoder de 6 capas y 83 M de parámetros con secuencias de 256 tokens es del orden de milisegundos por fragmento en GPU moderna, pero no hay cifras publicadas que lo confirmen.
- Coste de almacenamiento: 0,3 GB por repositorio completo, trivial de replicar en cualquier artefacto de contenedor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| q-trust-crypto-detector | 83,4 M | 256 tokens | F1 0,8966 (digest) / 0,9077 (native) | Apache-2.0 | HuggingFace |
| `huggingface/CodeBERTa-small-v1` (base) | ≈84 M | no disponible en la informacion | No es clasificador; requiere fine-tune | no disponible en la informacion | HuggingFace |
| Baseline TF-IDF + LogisticRegression | No neuronal (bolsa de n-gramas) | no aplica | F1 0,6675 | no aplica | Implementacion propia |
| `KRISHNAPURI/q-trust-codebert` | no disponible | no disponible | No se publican metricas | MIT | HuggingFace |

Frente al enfoque puramente léxico (regex o TF-IDF), la ventaja medida es de +0,24 F1 en el split nativo. La comparación con `q-trust-codebert` no es posible en términos de rendimiento porque no publica métricas; se trata de una variante del mismo proyecto con pipeline de reinforcement learning y etiquetas adicionales sobre GNN, según los tags del repositorio. No se han identificado en la búsqueda otros clasificadores de código abiertos específicos de descubrimiento criptográfico con métricas comparables.

## Limitaciones y advertencias

- **Techo del etiquetador**: las etiquetas de entrenamiento se derivan por regex, de modo que el F1 máximo alcanzable está acotado por el error del propio etiquetador. El autor confirma que 5 épocas y un corpus mayor (v5) empeoraron los resultados.
- **No detecta mal uso criptográfico**: responde "¿usa criptografía?", no "¿la usa de forma segura?". No sustituye a un escáner de vulnerabilidades ni a una revisión humana.
- **Desbalance de evaluación por lenguaje**: C domina el conjunto de evaluación; la precisión en otros lenguajes (Zig, Swift, Solidity, PHP) está menos caracterizada y puede degradarse.
- **Riesgo de alucinación trasladado a falsos positivos**: el modelo puede marcar como criptográfico código que solo menciona palabras clave en comentarios, nombres de variable o documentación, dado el sesgo del etiquetado de origen.
- **Contexto corto**: 256 tokens por fragmento implica que la decisión final depende de la estrategia de agregación del pipeline; ficheros con criptografía dispersa en zonas tardías pueden requerir revisión del chunking.
- **Idioma**: solo procesa código fuente; no admite lenguaje natural ni consultas en castellano.
- **Métricas no verificadas**: los valores del `model-index` figuran con `verified: false` y proceden del propio autor, sin replicación independiente.
- **Licencia**: Apache-2.0 permite uso comercial y modificación con atribución y aviso de cambios; conviene revisar las obligaciones de patentes de la cláusula Apache-2.0 en despliegues de producto.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 25 de octubre de 2026; no hay evidencia de adopción en producción ni de mantenimiento a largo plazo.
- **Dependencia de un pipeline propietario**: la generación de CBOM y la planificación de migración viven en el proyecto Q-Trust, no en este repositorio, que solo contiene el clasificador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KRISHNAPURI/q-trust-crypto-detector
- Dataset de entrenamiento: https://huggingface.co/KRISHNAPURI/q-trust-code-corpus-v4
- Modelo base: https://huggingface.co/huggingface/CodeBERTa-small-v1
- Variante relacionada del proyecto: https://huggingface.co/KRISHNAPURI/q-trust-codebert
- Datasets del autor: https://huggingface.co/KRISHNAPURI/datasets
- Repositorio del proyecto Q-Trust (CBOM, planificación GNN, anclaje en L2): https://github.com/humoge7502/q-trust
- Artefactos de entrenamiento y auditoría citados en la model card: `training_report_v4.json`, `eval_leakage_audit.json`, `calibration_v4.json` (incluidos en el repositorio del modelo)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
