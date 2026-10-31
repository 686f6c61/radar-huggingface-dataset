# mehedi4/SafeAge-Guard

## Resumen

SafeAge Guard es un clasificador binario de solicitudes (allow/block) desarrollado por los autores de SafeAge mediante el fine-tuning con LoRA del modelo Qwen3-1.7B de Qwen, al que se añade una cabeza de clasificación binaria entrenada. El modelo evalúa una petición junto con su contexto visible y decide si debe permitirse (asistencia ordinaria, temas sensibles, trabajo defensivo) o bloquearse (facilitación de daño, omisión de permisos, divulgación no autorizada, instrucciones maliciosas de fuentes de baja confianza).

Su rasgo más distintivo es el soporte lingüístico: además de inglés, funciona con bengalí, texto mixto bengalí-inglés y bengalí romanizado (Banglish), un ámbito muy poco cubierto por los moderadores de contenido habituales. Se entrena sobre el dataset SafeAge, con 24.508 solicitudes etiquetadas derivadas de 6.127 casos alineados en cuatro formas lingüísticas.

El repositorio publica el adaptador LoRA original, la cabeza de clasificación, el tokenizador, el umbral de decisión (0,24) y un script de inferencia explícito. No es un checkpoint completo: requiere el modelo base Qwen3-1.7B fijado a una revisión concreta. Con una precisión (accuracy) del 95,43 % y un macro F1 del 95,07 % en el test de 1.204 solicitudes, resulta relevante como guardián de seguridad ligero y multilingüe para pipelines de LLM, especialmente en contextos bengalíes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder) adaptado como clasificador de secuencias (SEQ_CLS) con LoRA y cabeza binaria `score` |
| Parámetros totales | Base Qwen3-1.7B (~1.700 millones, valor exacto no disponible) más cabeza de clasificación |
| Parametros activos | No aplica (no es MoE); parámetros entrenables: 17.436.672 |
| Longitud de contexto | 512 tokens (máximo de entrada, con truncamiento derecha) |
| Tipos de cuantizacion | Ninguna; inferencia en FP32 |
| Idiomas soportados | Bengalí (bn), inglés (en), bengalí-inglés mixto y Banglish (bengalí romanizado) |
| Licencia | MIT |
| Formato de pesos | Safetensors (adaptador PEFT + cabeza `score`); requiere el modelo base Qwen3-1.7B (revisión `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder de la familia Qwen3, al que se aplica LoRA (rank 16, alpha 32, dropout 0,05) sobre los siete proyectores de atención y MLP: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Sobre esta base se entrena una cabeza de clasificación binaria (`score`) que produce dos clases: `0 = benign` (permitir) y `1 = attack` (bloquear). El resultado es un clasificador de secuencias, no un modelo generativo: la `config.json` heredada conserva la cadena `Qwen3ForCausalLM` del base, pero la carga correcta usa `AutoModelForSequenceClassification` con dos etiquetas y luego restaura el adaptador y la cabeza mediante `PeftModel`.

El entrenamiento se realizó sobre el dataset SafeAge: 24.508 solicitudes etiquetadas procedentes de 6.127 casos alineados en cuatro formas lingüísticas (bengalí, mixto, Banglish e inglés de referencia), con particiones fijas de 22.096 entrenamiento, 1.208 validación y 1.204 test, manteniendo agrupados los casos relacionados dentro de cada partición. La anotación fue realizada por los dos autores sobre subconjuntos disjuntos, sin doble anotación independiente, por lo que no se estimó el acuerdo inter-anotador. Se entrenó 5 épocas (seleccionada la 3) con AdamW a tasa de aprendizaje 0,0001, batch efectivo de 32, precisión FP32, semilla 42 y longitud máxima de 512 tokens. El checkpoint se eligió por máximo macro F1 en validación a umbral 0,5, y el umbral operativo final (0,24) se seleccionó en validación y se congeló para test. No se aplican chat templates: la entrada es texto crudo con su contexto visible.

## Capacidades

- Clasificación binaria allow/block de solicitudes de usuario con contexto, orientada a moderación de entradas en sistemas LLM.
- Detección de facilitación de daño, bypass de permisos, divulgación no autorizada e instrucciones maliciosas procedentes de fuentes de baja confianza (no solo prompt injection).
- Operación multilingüe sobre bengalí, bengalí-inglés mixto, Banglish (bengalí romanizado) e inglés alineado.
- Salida probabilística (softmax de la clase 1) con umbral operativo documentado (0,24) y puntuación de calibración publicada (Brier 0,03885).
- Cabeza de clasificación entrenada restaurada automáticamente vía PEFT junto con el adaptador LoRA.
- Script `inference.py` con carga y clasificación programática (`load_guard`, `classify_texts`) y soporte de entrada por fichero UTF-8.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un clasificador de texto.

## Casos de uso

- Filtro de entrada para chatbots en bengalí: se coloca delante de un LLM de producción y clasifica cada petición antes de pasarla al modelo generativo, bloqueando peticiones maliciosas con una tasa de falsos positivos benignos del 2,51 %.
- Moderación de texto mixto bengalí-inglés y Banglish: útil en plataformas con usuarios de Bangladés o la diáspora que escriben romanizado, un caso que los moderadores centrados en inglés no cubren bien.
- Protección contra prompt injection en aplicaciones RAG: clasifica la petición completa con su contexto visible, permitiendo descartar intentos de omisión de permisos o divulgación no autorizada de documentos recuperados.
- Filtrado por niveles de confianza: bloquea instrucciones maliciosas procedentes de fuentes de baja confianza mientras permite tareas defensivas y discusión de temas sensibles bajo la política SafeAge, útil en asistentes de seguridad interna.
- Clasificación por lotes en pipelines de datos: la función `classify_texts` permite procesar listas de solicitudes, por ejemplo para auditar logs de conversaciones históricas.
- Evaluación y benchmarking de guardias multilingües: al publicar particiones fijas, umbral congelado y métricas archivadas, sirve como referencia reproducible para comparar clasificadores de seguridad en bengalí.

## Benchmarks y rendimiento

Resultados publicados por los autores sobre el test de SafeAge (1.204 solicitudes, 301 casos, 199 grupos conexos) con umbral fijo 0,24:

| Métrica | Resultado |
|---|---:|
| Accuracy | 95,43 % |
| Macro F1 | 95,07 % |
| Precisión (clase block) | 95,59 % |
| Recall (clase block) | 91,96 % |
| Tasa de falsos positivos (benign) | 2,51 % |
| Brier score | 0,03885 |

Matriz de confusión: 737 verdaderos negativos, 19 falsos positivos, 36 falsos negativos y 412 verdaderos positivos. Las métricas archivadas a umbrales 0,5 y 0,24 están en `evaluation/test_metrics.json` y el desglose por variante lingüística en `evaluation/test_by_language_variant.csv`. No se han publicado comparaciones con otros guardias (como Llama Guard) en la información disponible, por lo que no es posible una tabla comparativa de benchmarks sin inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa unos 0,1 GB de repositorio; ejecutando el base Qwen3-1.7B en FP32 se requieren aproximadamente 7-8 GB de VRAM. No se publica cuantización, por lo que no hay cifras oficiales para FP16/INT8.
- GPU recomendadas: cualquier GPU moderna con 8 GB o más (RTX 3060, RTX 4060 Ti, RTX 4090, A100, etc.). Dado el tamaño de 1,7B en FP32, también es viable en CPU, aunque sin datos de latencia publicados.
- Cabe en GPUs de consumo de gama media-alta sin cuantización; con carga en FP16 (no documentada por los autores) bastarían unos 4 GB.
- Despliegue: script propio `inference.py` sobre Transformers, PEFT y PyTorch (versiones originales: Transformers 5.5.4, PEFT 0.19.1, PyTorch 2.11.0). Los tags indican compatibilidad con `text-embeddings-inference` y endpoints de Hugging Face. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, y al ser un clasificador SEQ_CLS no funciona como modelo generativo.
- Latencia y throughput: no disponible; no se publican mediciones.
- Nota importante: la primera ejecución descarga el modelo base Qwen3-1.7B fijado a la revisión exacta `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`.

## Comparativa con modelos similares

| Modelo | Base / tamaño | Tarea | Idiomas | Contexto | Licencia |
|---|---|---|---|---|---|
| SafeAge Guard | Qwen3-1.7B + LoRA | Clasificador allow/block | bn, en, mixto, Banglish | 512 tokens | MIT |
| Llama Guard 3 (1B) | Llama 3.2-1B | Moderación de entradas/salidas | Multilingüe (8 idiomas) | Hasta 128K (según base) | Licencia Llama 3.2 (restricciones de uso) |
| ShieldGemma 2 (4B) | Gemma 3-4B | Clasificación de seguridad | Principalmente inglés | No disponible en la información aquí manejada | Licencia Gemma (restricciones de uso) |

SafeAge Guard se diferencia de las alternativas en su enfoque específico en bengalí y Banglish, su licencia MIT sin restricciones y su umbral operativo congelado y documentado; a cambio, su ventana de 512 tokens es mucho menor y no cubre la moderación de salidas del modelo generativo.

## Limitaciones y advertencias

- Las etiquetas de SafeAge no miden adecuación por edades, pese a lo que el nombre podría sugerir; la clase de bloqueo cubre facilitación de daño, bypass de permisos y divulgación no autorizada.
- Validación y test son casos construidos por los propios autores a partir de expansiones sintéticas de escenarios, no tráfico real de usuarios, lo que puede inflar las métricas respecto a producción.
- La anotación no fue doble ni independiente: no se estimó el acuerdo inter-anotador, por lo que la calidad de las etiquetas no está verificada externamente.
- Entradas de más de 512 tokens se truncan por la derecha, lo que puede provocar falsos negativos si la parte relevante de la petición queda fuera.
- No debe aplicarse chat template ni cargarse como modelo generativo: la `config.json` heredada indica `Qwen3ForCausalLM`, pero la tarea correcta requiere `AutoModelForSequenceClassification` vía `PeftModel`. Usar el clasificador base sin adaptador no reproduce la evaluación.
- La inferencia está documentada en FP32, lo que duplica la huella de memoria frente a FP16; no hay cuantizaciones oficiales.
- El recall de bloqueo (91,96 %) implica un 8 % de ataques no detectados (36 falsos negativos en test); no debe usarse como única capa de seguridad en producción.
- Sesgos específicos: al ser un dataset sintético anotado por dos personas, puede heredar sus criterios; no hay análisis de sesgos publicado.
- El modelo es muy reciente, con 13 descargas y 1 like en el momento de la ficha, sin auditoría comunitaria.
- La licencia MIT permite uso comercial sin restricciones, incluida la derivada del base Qwen3-1.7B según la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mehedi4/SafeAge-Guard
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Método LoRA (paper): https://arxiv.org/abs/2106.09685
- Dataset SafeAge (documentación y release en Zenodo): https://doi.org/10.5281/zenodo.23622437
