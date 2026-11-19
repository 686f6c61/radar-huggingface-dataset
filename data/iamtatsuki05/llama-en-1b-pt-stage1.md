# iamtatsuki05/Llama-EN-1B-PT-stage1

## Resumen

Llama-EN-1B-PT-stage1 es un modelo de lenguaje decoder-only de tipo Llama, desarrollado por el usuario iamtatsuki05 dentro del proyecto MIREI, entrenado desde inicialización aleatoria sobre el corpus HuggingFaceFW/fineweb-edu. Con 1.407.538.944 parámetros totales, constituye un checkpoint de preentrenamiento (stage 1) en inglés, pensado como base para tareas generativas posteriores y como pieza de comparación frente a su contraparte encoder (ModernBERT-EN-1B-PT-stage1) bajo receta de entrenamiento idéntica.

El modelo observa aproximadamente 18.000 millones de tokens durante el preentrenamiento, con ventanas de contexto de 1.024 tokens en esa fase, aunque la longitud máxima de secuencia declarada en la model card es de 8.192 tokens. Emplea una dimensión de embedding de 1.792, tokenizador SentencePiece con vocabulario de 102.400 entradas y codificación posicional RoPE. Su relevancia actual es acotada: se trata de un artefacto de investigación con muy baja adopción (4 descargas, 0 likes) y sin resultados de benchmarks publicados.

No es un modelo instruido ni alineado: es un backbone crudo de preentrenamiento, por lo que no cabe esperar comportamiento conversacional ni seguimiento de instrucciones sin un ajuste posterior (SFT/DPO). Su interés principal reside en el estudio comparativo de arquitecturas encoder frente a decoder bajo condiciones controladas, y en servir de base reproducible para experimentos de escalado a ~1B parámetros en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (decoder-only, transformer) |
| Parametros totales | 1.407.538.944 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (máximo de secuencia); preentrenado con ventanas de 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF oficial) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama: transformer decoder-only con normalización y bloques de atención estándar de la familia, dimensión de embedding de 1.792, codificación posicional rotatoria (RoPE) y tokenizador SentencePiece de 102.400 tokens. El checkpoint corresponde a la etapa 1 del pipeline MIREI, es decir, preentrenamiento puro desde pesos aleatorios, sin fases posteriores de ajuste supervisado ni optimización por preferencias (no se documenta RLHF ni DPO).

Los datos de entrenamiento provienen exclusivamente de HuggingFaceFW/fineweb-edu, un corpus web filtrado por calidad educativa, con un presupuesto de aproximadamente 18.000 millones de tokens procesados en secuencias de 1.024 tokens. La model card no detalla la composición exacta del dataset, el número de pasos, el tamaño de batch global, la tasa de aprendizaje ni la mezcla final de documentos. La innovación metodológica declarada no está en el modelo en sí, sino en el diseño experimental: la misma receta se aplica a un ModernBERT de tamaño comparable para analizar diferencias entre arquitecturas encoder y decoder en representaciones y generación.

## Capacidades

- Generación de texto en inglés mediante decodificación autorregresiva (muestreo con temperatura y top-p documentados en el ejemplo de uso).
- Modelo base de preentrenamiento: no está ajustado para seguir instrucciones ni para formato conversacional.
- Completado de texto y continuación de contexto corto (hasta 8.192 tokens según especificación, 1.024 en preentrenamiento).
- Capacidad potencial como backbone para fine-tuning en tareas downstream (clasificación, extracción, resumen) tras el ajuste correspondiente.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Monolingüe en inglés; no se declaran capacidades multilingües.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).
- Compatible con text-generation-inference y endpoints según los tags del repositorio.

## Casos de uso

- Investigación comparativa encoder vs. decoder: sirve como brazo decoder del experimento MIREI frente a ModernBERT-EN-1B-PT-stage1, permitiendo aislar el efecto de la arquitectura con la misma receta y corpus.
- Punto de partida para fine-tuning supervisado: equipos que quieran un backbone de ~1,4B parámetros con licencia MIT pueden aplicar SFT sobre datos propios en inglés para tareas de generación específicas.
- Experimentos de destilación: su tamaño moderado y licencia permisiva lo hacen adecuado como alumno o profesor en pipelines de destilación de conocimiento.
- Evaluación de corpus y tokenizadores: el vocabulario de 102.400 entradas y el entrenamiento sobre fineweb-edu permiten estudiar el impacto del tokenizador en eficiencia y calidad de representación.
- Generación de texto controlada en laboratorio: continuación de prompts para análisis de distribuciones, perplejidad y sesgos en modelos preentrenados sin alineación.
- Reproducibilidad de recetas de preentrenamiento: con código y requisitos publicados (transformers >= 4.51.0, accelerate >= 1.6.0, flash-attn >= 2.7.3), sirve para replicar y auditar el pipeline de entrenamiento a escala 1B.
- Base para investigación académica en PLN: al ser MIT y de pequeño tamaño, es desplegable en entornos académicos con recursos limitados para estudios de sesgo lingüístico en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 2,8 GB solo para pesos (coincide con el tamaño del repo), más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para inferencia con contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5 GB de pesos; en 4 bits, en torno a 0,8-1 GB (no hay cuantizaciones oficiales publicadas, requeriría conversión propia).
- GPU recomendadas para producción: A100, H100 o L40S para throughput alto; también válidas A10G y L4 para cargas moderadas.
- Cabe holgadamente en GPU de consumo: RTX 4090, RTX 4080, RTX 3090, RTX 4070 Ti e incluso tarjetas de 8 GB en bfloat16 con contexto reducido.
- Opciones de despliegue: transformers con flash-attention 2 (soporte declarado), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Llama-EN-1B-PT-stage1 | 1,41B | 8.192 (preentrenado a 1.024) | MIT | Checkpoint de preentrenamiento, sin benchmarks | Brazo decoder del proyecto MIREI |
| ModernBERT-EN-1B-PT-stage1 | ~1B (no confirmado) | no disponible | MIT (mismo proyecto) | Checkpoint de preentrenamiento, sin benchmarks | Brazo encoder de la misma receta |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | Preentrenado y ajustado (chat disponible) | Entrenado con ~3T tokens; benchmarks publicados |
| Llama 3.2 1B | 1,24B | 128K | Llama 3.2 Community License | Instruido y alineado | Multilingüe, con resultados publicados |

La comparación con TinyLlama y Llama 3.2 1B es orientativa por tamaño, no por calidad: ambos han sido entrenados con presupuestos de tokens muy superiores (cientos de miles de millones a billones) y cuentan con fases de alineación, mientras que este checkpoint solo ha visto ~18B tokens y carece de ajuste. No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo exclusivamente preentrenado: no sigue instrucciones, no mantiene conversaciones coherentes de forma fiable y no está alineado con preferencias humanas.
- Riesgo elevado de alucinación y de generar contenido factualmente incorrecto, incoherente o repetitivo, especialmente fuera de dominios bien representados en fineweb-edu.
- Sesgos heredados del corpus web: fineweb-edu, pese a su filtrado por calidad educativa, contiene sesgos sociales, culturales y de representación que el modelo reproduce sin mitigación.
- Entrenamiento limitado a ~18B tokens, muy por debajo de lo habitual para modelos de este tamaño (TinyLlama usa ~3T), lo que se traduce en una calidad de lenguaje esperablemente inferior.
- Contexto efectivo limitado: aunque la longitud máxima declarada es 8.192 tokens, el preentrenamiento se realizó con ventanas de 1.024, por lo que el rendimiento más allá de esa longitud no está validado y probablemente degrade.
- Monolingüe en inglés: no apto para producción en castellano ni otros idiomas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad que respalde su uso en producción.
- Adopción mínima (4 descargas, 0 likes) y ausencia de validación por la comunidad; tratar como artefacto experimental.
- Licencia MIT: permisiva para uso comercial, pero sin garantías del autor; la responsabilidad sobre sesgos y salidas recae en el integrador.
- No hay cuantizaciones oficiales (GGUF, AWQ, GPTQ) publicadas; cualquier despliegue eficiente requiere conversión y validación propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Llama-EN-1B-PT-stage1
- Colección MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub del proyecto: https://github.com/iamtatsuki05/MIREI
- Modelo encoder de la serie: https://huggingface.co/iamtatsuki05/ModernBERT-EN-1B-PT-stage1
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Licencia MIT: https://opensource.org/license/mit/
- Cita académica (NLP2026): artículo "同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析", autores 岡田 龍樹 y 杉本 徹, Actas de la 32.ª Conferencia Anual de la Asociación de Procesamiento del Lenguaje de Japón (NLP2026).
