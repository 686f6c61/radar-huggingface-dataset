# BaruqRodrigues/llm-legislativo

## Resumen

llm-legislativo es un modelo de lenguaje experimental desarrollado por BaruqRodrigues, entrenado desde cero en PyTorch sobre textos legislativos oficiales de la Câmara dos Deputados y del Senado Federal de Brasil. Se trata de un Transformer decoder causal propio del proyecto, con 18.708.480 parámetros, 6 capas, 6 cabezas de atención, dimensión oculta de 384 y una ventana de contexto de 512 tokens. Su tokenizador es un byte-level BPE de 8.192 tokens.

El modelo se publica como artefacto educativo y de investigación para modelado de lenguaje y generación exploratoria de texto legislativo en portugués. El propio autor advierte que no ha sido validado para interpretar leyes, resumir procesos, apoyar decisiones jurídicas ni producir documentos oficiales, y que sus salidas no deben usarse como orientación jurídica ni como fuente factual.

Su relevancia es limitada y muy específica: es un ejemplo reproducible de entrenamiento desde cero de un modelo pequeño con corpus institucional en portugués, con métricas de evaluación publicadas (perplejidad por token de 8,2197 y NLL por byte de 0,7298 nats/byte). No es compatible directamente con `transformers.AutoModel`, lo que condiciona por completo su despliegue. La licencia de los pesos no está declarada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal, implementación propia en PyTorch |
| Parametros totales | 18.708.480 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | portugués (pt) |
| Licencia | unknown (no declarada por el mantenedor) |
| Formato de pesos | safetensors (`model.safetensors`), más `tokenizer.json`, `model_config.json` y `tokenizer_manifest.json` |

Detalles adicionales de configuración: 6 capas, 6 cabezas de atención, dimensión oculta 384, vocabulario byte-level BPE de 8.192 tokens con PAD=0, BOS=1 y EOS=2.

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder causal explícito, implementado en PyTorch dentro del propio repositorio (`source/model/`), no una variante de los modelos estándar de Hugging Face. El checkpoint publicado corresponde al paso 173.209 de la ejecución de preentrenamiento `pretraining_legislativo_atual_v1`, entrenada sobre el split de train de la release `legislativo_atual_v1`. `model.safetensors` contiene únicamente los pesos de inferencia: no se incluyen el estado del optimizador, los datos ni los shards de entrenamiento.

El tokenizador (`tokenizer.json`) se entrenó exclusivamente sobre el split de train y va acompañado de `tokenizer_manifest.json` con su hash y configuración. No se documentan en la información disponible detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de ajuste fino con RLHF o DPO. Tampoco se describe ninguna innovación técnica más allá de la implementación propia del decoder.

## Capacidades

- Generación de texto autorregresiva en portugués, con generación disponible en `source/model/generation.py`.
- Modelado de lenguaje causal: cálculo de logits sobre secuencias de hasta 512 tokens.
- Generación exploratoria de texto con formato y registro propios de documentos legislativos brasileños (por ejemplo, encabezados del tipo "PROJETO DE LEI Nº").
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; el modelo está entrenado y etiquetado únicamente para portugués.
- Capacidades especiales: no se documentan modos de pensamiento, visión, audio ni decodificación especulativa.
- No se documenta explícitamente una plantilla de prompt o formato de chat; el ejemplo de la model card usa continuación directa de texto.

## Casos de uso

- Investigación sobre entrenamiento desde cero: sirve como referencia reproducible de un pipeline completo en PyTorch (tokenizador propio, configuración, checkpoint y métricas de test) para estudiar cómo se comporta un modelo de 18,7 M de parámetros sobre un dominio acotado.
- Experimentos de modelado de lenguaje en portugués jurídico: permite medir perplejidad y NLL por byte sobre corpus legislativo y comparar variantes de tokenización o de tamaño de contexto.
- Generación exploratoria de borradores ficticios de texto legislativo con fines didácticos, siempre con revisión humana y sin uso como fuente factual.
- Pruebas de infraestructura y tooling: al ser un modelo diminuto (aproximadamente 75 MB en FP32), es útil para validar scripts de carga de safetensors, tokenizers y bucles de generación en entornos con recursos mínimos.
- Docencia y divulgación: ilustra de forma tangible conceptos como ventana de contexto, tokenizador BPE, perplejidad y NLL por byte en un caso real con métricas publicadas.
- Evaluación de riesgos de alucinación en dominios sensibles: el modelo es un caso de estudio adecuado para analizar cómo un modelo pequeño inventa normas o atribuye contenido incorrecto a leyes, tal y como advierte el propio autor.
- Pruebas de integración sobre CPU o dispositivos de bajos recursos, dado que el checkpoint cabe holgadamente en memoria de sistemas embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas publicadas son de modelado de lenguaje sobre el split de test de la release `legislativo_atual_v1`, con 71.069 documentos y 19.430 ventanas de prueba:

| Metrica | Valor |
|---|---|
| Perdida media por token | 2,1065 |
| Perplejidad por token | 8,2197 |
| Perplejidad por palabra (métrica del proyecto) | 65,6509 |
| NLL por byte | 0,7298 nats/byte (1,0529 bits/byte) |
| Documentos de test | 71.069 |
| Ventanas de test | 19.430 |

El autor advierte que la perplejidad depende del tokenizador y recomienda usar también `byte_nll_v1` para una comparación normalizada por bytes, respetando la definición de la versión. Las muestras de `evaluation/generation_samples.json` son ejemplos cualitativos no verificados y no constituyen una evaluación de factualidad. No se dispone de comparaciones con otros modelos bajo el mismo protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 75 MB en FP32 (18,7 M de parámetros), unos 37 MB en FP16/BF16 y unos 19 MB en INT8. La caché KV para 512 tokens es marginal (del orden de decenas de MB en FP32 para lotes grandes).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1050, una iGPU reciente o incluso una Raspberry Pi con 2 GB de RAM pueden ejecutar el modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de las últimas dos décadas, así como en CPU.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma directa, porque la arquitectura es propia y no implementa `transformers.AutoModel`. El despliegue requiere Python, PyTorch, `tokenizers`, `safetensors` y PyYAML, cargando la configuración con `GPTConfig.from_dict`, el tokenizador con `Tokenizer.from_file` y los pesos con `load_file` de safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, la latencia en CPU moderna será del orden de milisegundos por token, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

No hay datos de benchmarks comparables bajo el mismo protocolo. La comparación siguiente es únicamente estructural y de disponibilidad; los datos de contexto y licencia de los modelos alternativos proceden de sus especificaciones públicas habituales, no de la información proporcionada en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Compatibilidad con ecosistema estandar |
|---|---|---|---|---|
| llm-legislativo | 18,7 M | 512 | unknown | No (arquitectura propia, requiere código del repo) |
| GPT-2 small | 124 M | 1024 | MIT modificada | Sí (`transformers`) |
| TinyLlama 1.1B | 1,1 B | 2048 | Apache 2.0 | Sí (`transformers`, llama.cpp, vLLM) |
| No disponible | - | - | - | No se han identificado alternativas equivalentes de portugués legislativo de tamaño comparable en la información consultada |

La diferencia clave no es de rendimiento, sino de propósito y operatividad: los modelos alternativos son reutilizables con el ecosistema estándar, mientras que llm-legislativo exige cargar su propio código de arquitectura y no declara licencia.

## Limitaciones y advertencias

- Licencia de los pesos no declarada (`license: unknown`): no se presume permisividad ni se conceden derechos de redistribución o uso comercial. Es imprescindible contactar con el mantenedor antes de usar el modelo en producción o redistribuirlo.
- Riesgo alto de alucinación: el autor advierte explícitamente de que el modelo puede inventar normas, atribuir contenido incorrecto a leyes o producir texto incoherente.
- Uso jurídico desaconsejado: no ha sido validado para interpretar leyes, resumir procesos, apoyar decisiones jurídicas ni generar documentos oficiales, y sus salidas no deben tomarse como orientación jurídica ni como fuente factual.
- Ventana de contexto muy reducida (512 tokens), lo que limita tareas que requieran documentos extensos o conversaciones multi-turno largas.
- Cobertura lingüística restringida al portugués, sin capacidades multilingües documentadas.
- Cobertura histórica parcial del corpus: el propio autor indica que el modelo no debe tratarse como completo ni actualizado.
- Sesgos conocidos: no documentados de forma específica en la información disponible; al entrenarse sobre un corpus legislativo institucional, cabe esperar sesgos derivados de esa fuente, pero no hay un análisis publicado.
- Sin soporte de tool calling, agentes, visión ni modos de razonamiento explícitos.
- Incompatibilidad con `transformers.AutoModel`, vLLM, llama.cpp y Ollama: cualquier integración requiere adaptar el código de arquitectura incluido en el repositorio.
- Las muestras de generación publicadas son ejemplos cualitativos no verificados y no deben interpretarse como evidencia de calidad.
- Ausencia de datos de benchmarks estándar que permitan situar el modelo frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BaruqRodrigues/llm-legislativo
- Repositorio de código de arquitectura: incluido en el propio repositorio, en `source/model/` (no se proporciona URL independiente)
- Script de generación autorregresiva: `source/model/generation.py` del repositorio
- Configuración del modelo: `model_config.json` del repositorio
- Tokenizador y manifiesto: `tokenizer.json` y `tokenizer_manifest.json` del repositorio
- Métricas de evaluación: `evaluation/test_metrics_summary.json` del repositorio
- Muestras de generación: `evaluation/generation_samples.json` del repositorio
- Paper, blog o demo adicionales: no disponible
