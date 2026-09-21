# sivasub987/mandate-1-laya

## Resumen

Mandate-1 Laya es un checkpoint de investigación (etiquetado por su autor como v0.2) publicado por el usuario sivasub987. Se trata de una adaptación completa (*full fine-tune*) del modelo base `convaiinnovations/laya-typed-decisions`, con 421.293.830 parámetros y un tamaño de repositorio de 0,8 GB. La *pipeline* declarada en HuggingFace es `text-classification` y el único idioma soportado es el inglés. La licencia del modelo es Apache-2.0.

El modelo resuelve una tarea muy acotada: a partir de un registro de gobernanza ficticio, devuelve un único hallazgo semántico de tipo consultivo (*advisory*) entre siete clases posibles (`no material semantic exception`, `insufficient evidence`, `outside mandate`, `influencing action`, `trace contradictory`, `instruction conflicting`, `no reviewed analogue`), junto con las puntuaciones de cada opción. El propio autor aclara que no detecta blanqueo de capitales, no evalúa clientes, no emite decisiones regulatorias ni concede permisos de ejecución SAFR.

Su relevancia es fundamentalmente metodológica: se publica como *shadow-only* y explícitamente "para documentar lo que se intentó, incluidos los fallos". No está aprobado para ejecución autónoma ni para toma de decisiones financieras, y conserva en sus recibos de entrenamiento la marca `publish_allowed: false` junto con las puertas de validación no superadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptación completa (*full fine-tune*) del modelo Laya `convaiinnovations/laya-typed-decisions`; detalles internos de la arquitectura no disponibles |
| Parámetros totales | 421.293.830 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio publica pesos en `safetensors`; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 para el modelo y el software Laya subyacente; el dataset asociado se distribuye bajo CC BY 4.0 |
| Formato de pesos | `safetensors` (SHA-256 de los pesos: `7d9106c9d2b30d3f66368bb20c1c831ebebcf920d5a31dc3b2d18d09a971cdd5`) |

## Arquitectura y entrenamiento

El modelo es una adaptación de modelo completo sobre el checkpoint `convaiinnovations/laya-typed-decisions` (revisión `f9ab0b228f0fc0f14d873dbc99038f135c2da1b2`), usando el código de Laya en la revisión `42626c348753fbb17572a813127df2278a1ec527`. El entrenamiento se realizó en una única NVIDIA A100-SXM4-40GB combinando una recompensa RLCD propiamente dicha con entropía cruzada suave (*soft cross entropy*), permutación de opciones y un suavizado de etiquetas de 0,05. Se completaron 3 épocas de un máximo de 6, con el mejor resultado en la época 1, tamaño de lote efectivo de 64, tasas de aprendizaje de 2,5e-5 para el codificador y 1e-4 para la cabeza, y semilla 42017. El bucle de entrenamiento consumió 222,3 segundos, excluyendo configuración, descarga y evaluación, por lo que no constituye una afirmación de coste de extremo a extremo.

La procedencia de los datos es sintética: 2.520 secuencias tipadas de entrenamiento tras el sobremuestreo de excepciones, sobre un conjunto canónico de 720 ejemplos. La selección del checkpoint se hizo con 360 paráfrasis de profesor t02, mientras que las actualizaciones de gradiente usaron el conjunto de entrenamiento original más t01, de modo que los mundos de selección y de entrenamiento se solapan. Se realizó además una calibración de temperatura separada sobre 60 ejemplos. La supervisión es débil, procedente de un profesor alojado y mutable, y las etiquetas no han sido revisadas por especialistas.

## Capacidades

- Clasificación de texto en inglés con salida de una etiqueta única entre siete clases semánticas predefinidas, más las puntuaciones asociadas a cada opción.
- Interpretación de registros de gobernanza ficticios con metadatos de confianza declarados (el modelo asume esos metadatos, no puede autenticarlos).
- Detección de excepciones semánticas de un único tipo principal (por ejemplo, contradicciones de traza o conflictos de instrucciones) dentro del esquema de etiquetas entrenado.
- No dispone de cabeza de citación (*no citation head*), por lo que no puede devolver referencias o evidencias que respalden su decisión.
- No soporta salida multi-excepción: solo emite un hallazgo por registro.
- No implementa una política de abstención validada para despliegue.
- No ofrece *tool calling*, ni *function calling*, ni razonamiento multi-paso, ni capacidades de agente. Las etiquetas del repositorio incluyen `agentic-ai` como descriptor de dominio, no como capacidad funcional del modelo.
- No tiene capacidades de visión, audio ni modo *thinking*.
- No está diseñado para ejecución autónoma: las puntuaciones del modelo nunca prevalecen sobre la identidad, la autoridad, los límites categóricos ni los requisitos de revisión humana.

## Casos de uso

- Investigación en gobernanza de agentes: el modelo sirve como artefacto reproducible para estudiar cómo un clasificador pequeño se comporta ante registros de gobernanza sintéticos y qué tipo de excepciones semánticas es capaz de aislar.
- Reproducción de experimentos de seguridad en IA: al publicarse los recibos de entrenamiento, las revisiones de código y los *hash* de los pesos, permite reproducir el *pipeline* completo y auditar las decisiones de diseño, incluidas las fallidas.
- Evaluación comparativa de *harnesses* de referencia: el autor indica explícitamente que este checkpoint no es un reemplazo directo del juez DeepSeek de cinco primitivas del *harness* de referencia, por lo que puede emplearse como contraste negativo en ese tipo de evaluaciones.
- Estudio de supervisión débil: el modelo ilustra el comportamiento de un clasificador entrenado con etiquetas sintéticas generadas por un profesor mutable, útil para investigar la degradación entre *split* de desarrollo y *test*.
- Docencia y análisis de calibración: los conjuntos de calibración de temperatura y las métricas de pares completos permiten trabajar con casos reales de sobreajuste a mundos de entrenamiento.
- Análisis de dominios regulados (AML/CFT) desde una perspectiva metodológica: puede usarse para estudiar por qué un clasificador de este tipo no debe emplearse para cerrar cuentas, contactar clientes, presentar declaraciones, mover dinero o ampliar autoridad.
- No es adecuado para ningún caso de uso en producción con efectos sobre clientes o sobre el cumplimiento normativo real.

## Benchmarks y rendimiento

| Split | Exactitud | Exactitud de pares completos | Macro-F1 | Tasa de falso despeje (*false-clear*) |
|---|---:|---:|---:|---:|
| dev | 100,0 % | 100,0 % | 1,000 | 0,0 % |
| Validación por paráfrasis | 99,2 % | 98,3 % | 0,992 | 0,0 % |
| Calibración | 100,0 % | 100,0 % | 1,000 | 0,0 % |
| Test (120 ejemplos) | 84,2 % | 68,3 % | 0,804 | 18,3 % |
| Near-OOD (60 ejemplos) | 91,7 % | 83,3 % | 0,846 | 16,7 % |

La tasa de falso despeje mide casos de excepción predichos como "sin excepción semántica material"; no equivale a una tasa de falsos negativos de blanqueo de capitales. La exactitud de pares completos exige acertar ambos miembros de un contraste. La latencia de inferencia registrada en GPU fue de aproximadamente 36 ms por ejemplo (p50) en el entorno de entrenamiento; los costes en CPU y de extremo a extremo en producción no están establecidos. El autor advierte que el conjunto de test sintético ya se había observado repetidamente en experimentos anteriores, por lo que los resultados son exploratorios y no constituyen evidencia sobre un *holdout* final prístino. El modelo falla en contradicciones de traza importantes y no superó las puertas de uso declaradas.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos a partir de los 421,3 M de parámetros, no cifras publicadas): en FP32 en torno a 1,7 GB de pesos; en FP16/BF16 en torno a 0,85 GB; en INT8 en torno a 0,42 GB; en INT4 en torno a 0,21 GB, más el *overhead* de activaciones y del *runtime*.
- La descarga documentada del checkpoint es de aproximadamente 846 MB, coherente con pesos en precisión de 16 bits.
- GPU de referencia del entrenamiento: una NVIDIA A100-SXM4-40GB. El autor indica que para inferencia en GPU debe instalarse una versión de PyTorch con soporte CUDA y usar `--device cuda:0`.
- Inferencia en CPU soportada explícitamente mediante `--device cpu`.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con al menos 2-4 GB de VRAM libres debería poder ejecutarlo en FP16 o INT8, aunque no hay mediciones publicadas específicas por modelo de tarjeta.
- Opciones de despliegue: no es compatible con `AutoModelForSequenceClassification`, por lo que no se puede cargar con la API estándar de Transformers. Requiere el cargador propio de Laya incluido en el repositorio de código (`vendor/laya-0.3.4-py3-none-any.whl`) y el script `scripts/predict_safr_laya.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: aproximadamente 36 ms por ejemplo en GPU (p50, entorno de entrenamiento A100). Throughput y latencia en CPU: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mandate-1-laya | 421.293.830 | No disponible | Apache-2.0 | HuggingFace y Kaggle | Adaptación completa, *shadow-only*, con benchmarks publicados |
| convaiinnovations/laya-typed-decisions (modelo base) | No disponible | No disponible | No disponible en la información proporcionada | HuggingFace | Modelo base sobre el que se hace el *fine-tune*; sin datos de rendimiento en esta ficha |
| Juez DeepSeek de cinco primitivas del *harness* de referencia | No disponible | No disponible | No disponible | No disponible | El autor indica explícitamente que mandate-1-laya no es un reemplazo directo; no se aportan especificaciones ni métricas comparables |

No se dispone de datos de benchmarks de alternativas de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo experimental y *shadow-only*: no está aprobado para ejecución autónoma ni para toma de decisiones financieras.
- Etiquetas sintéticas y no revisadas, generadas mediante supervisión débil por un profesor alojado y mutable.
- Entrenamiento y validación en inglés exclusivamente; no hay soporte multilingüe.
- Validación con solapamiento entre mundos de entrenamiento y de selección de checkpoint, lo que infla las métricas de los *splits* de desarrollo, paráfrasis y calibración.
- Caída marcada de rendimiento en el conjunto de test (84,2 % de exactitud, 68,3 % en pares completos) y tasa de falso despeje del 18,3 %, con un 16,7 % en near-OOD.
- El modelo falla en contradicciones de traza relevantes y no superó las puertas de uso declaradas; los recibos históricos conservan `publish_allowed: false` y las puertas fallidas sin modificar.
- No verifica la relevancia de la evidencia ni puede autenticar los metadatos de confianza que asume.
- Solo emite una excepción principal por registro, sin cabeza de citación y sin política de abstención validada.
- Usos prohibidos explícitos: cerrar cuentas, contactar clientes, presentar declaraciones, mover dinero, ampliar autoridad o despejar silenciosamente un control.
- El conjunto de test sintético se observó repetidamente en experimentos previos, por lo que los resultados son exploratorios y no proceden de un *holdout* final prístino.
- Licencia Apache-2.0 para el modelo y para el software Laya; es necesario preservar `LICENSE` y `NOTICE`. El dataset asociado tiene licencia separada CC BY 4.0.
- La reproducibilidad bit a bit del reentrenamiento no está garantizada: la resolución de dependencias aguas arriba puede cambiar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sivasub987/mandate-1-laya
- Dataset asociado: https://huggingface.co/datasets/sivasub987/mandate-1-safr-data
- Demo: https://siva-sub.github.io/mandate-1/
- Código y *harness* de referencia: https://github.com/siva-sub/mandate-1
- Modelo en Kaggle: https://www.kaggle.com/models/sivasub987/mandate-1-laya
- Versión Kaggle research-v02: https://www.kaggle.com/models/sivasub987/mandate-1-laya/PyTorch/research-v02/1
- Referencia MAS SAFR (enlace truncado en la model card): https://www.mas.gov.sg/-/media/mas
- Modelo base: https://huggingface.co/convaiinnovations/laya-typed-decisions
