# BigFamTLLM/ml-cpt10-anneal

## Resumen

ml-cpt10-anneal es un modelo de lenguaje de 2.115.305.088 parámetros (2,12B) desarrollado por BigFamTLLM, un proyecto de estudiantes del curso IN5640 de la Universidad de Oslo (otoño de 2026). Se trata de la versión "annealed" (con decaimiento de la tasa de aprendizaje hasta cero) del checkpoint final de un proceso de preentrenamiento continuado (CPT) sobre noruego, partiendo de un modelo multilingüe entrenado desde cero con la misma arquitectura y presupuesto de cómputo.

El modelo parte de `BigFamTLLM/ml-base`, al que se le sustituyó el tokenizador por uno noruego de 32k tokens y se adaptó al noruego en tres fases: 1.000 pasos de entrenamiento solo de embeddings, preentrenamiento continuado hasta el paso 48.600 (26,48B tokens noruegos) y 916 pasos adicionales de annealing sobre texto de alta calidad en Bokmål y Nynorsk con decaimiento lineal de la tasa de aprendizaje hasta 0.

Es relevante como referencia de investigación sobre adaptación lingüística eficiente: demuestra que un modelo multilingüe de 2,12B puede especializarse en noruego con un presupuesto de cómputo modesto (8 GPU GH200) y ofrece métricas comparables en NorEval 1.1 frente a un modelo entrenado desde cero con el mismo presupuesto. No es un modelo instruido ni destinado a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen3 (36 capas, hidden size 2176, 34 cabezas de atención, 17 cabezas KV, embeddings atados) |
| Parámetros totales | 2.115.305.088 (2,12B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en, da, de, sv, no, nb, nn (foco en noruego: 85% Bokmål, 15% Nynorsk) |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con transformers 4.x; conversión vía Megatron-Bridge) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3: transformer decoder-only denso con 36 capas, dimensión oculta de 2176, 34 cabezas de atención con 17 cabezas KV (GQA) y embeddings atados entre entrada y salida. El entrenamiento se realizó con Megatron-LM sobre 8 GPU GH200 en el clúster Olivia (Sigma2), con longitud de secuencia de 4096, batch size de 128, optimizador AdamW y tasa de aprendizaje máxima de 5e-4 con 2.000 pasos de warmup y sin decaimiento (1e-4 en la fase de solo embeddings).

Los datos provienen de HPLT 4.0. La adaptación al noruego incluyó un intercambio de tokenizador a uno de 32k tokens específico para noruego: los tokens compartidos por ambos vocabularios conservan su embedding y los nuevos se inicializan con la media de las piezas del tokenizador antiguo. Tras el CPT hasta el paso 48.600 (26,48B tokens noruegos), el annealing añade 916 pasos (0,48B tokens) sobre texto de alta calidad en Bokmål y Nynorsk con decaimiento lineal de la tasa de aprendizaje hasta 0. Los pesos se convirtieron a formato Hugging Face con Megatron-Bridge y los configs se ajustaron para cargar en transformers 4.x.

## Capacidades

- Generación de texto autoregresiva en noruego (Bokmål y Nynorsk) y, en menor medida, en inglés, danés, alemán y sueco.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene formato conversacional.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al conjunto de idiomas del modelo base multilingüe original.
- No dispone de modo thinking, visión ni audio.
- Capacidad de completar texto y continuar secuencias; útil como base para fine-tuning posterior.

## Casos de uso

- Investigación en adaptación lingüística: servir como punto de comparación reproducible para estudiar el efecto del annealing y del intercambio de tokenizador en modelos de 2B, usando los checkpoints intermedios del proyecto.
- Fine-tuning para generación de texto en noruego: partir de un modelo ya especializado en Bokmål y Nynorsk para tareas downstream (clasificación, resumen, generación condicionada) con un coste de adaptación bajo.
- Completado de texto y autocompletado en noruego: integrarlo como modelo base en editores o herramientas de escritura que requieran continuación de frases con conocimiento del idioma.
- Generación de datos sintéticos en noruego: producir corpus de texto para aumentación de datos en proyectos de PLN nórdico, con revisión humana posterior.
- Evaluación de robustez lingüística: emplear las métricas de NorEval 1.1 y el experimento de ruido documentado para analizar la tolerancia del modelo a entradas ruidosas.
- Docencia y experimentación en PLN: usar el modelo y sus 50 variantes del proyecto como material didáctico en cursos sobre entrenamiento de LLM y evaluación multilingüe.
- Baseline en benchmarks nórdicos: establecer una referencia de 2,12B parámetros para comparar con modelos noruegos de mayor tamaño en tareas de NorEval.

## Benchmarks y rendimiento

NorEval 1.1 (resultados publicados en la model card):

| Grupo de tareas | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,271 | 0,305 |
| nob_orthography | acc | 0,843 | 0,861 |
| nob_reading | f1 | 0,240 | 0,268 |
| nob_world | acc | 0,304 | 0,301 |
| nno_language | em_first | 0,537 | 0,598 |
| nno_world | acc | 0,323 | 0,326 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,407 sobre entrada limpia y -0,042 de media bajo ruido.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,3 GB solo para pesos, más overhead de activaciones y caché KV (con contexto de 4096 y GQA de 17 cabezas KV, el coste de caché es moderado); en la práctica, entre 5 y 6 GB en bf16.
- Cuantización: no se documentan versiones GGUF ni cuantizaciones oficiales; una cuantización a 8 bits reduciría los pesos a unos 2,2 GB y a 4 bits a unos 1,1 GB, pero requeriría conversión manual.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) para bf16 o cuantizado; A100 y H100 sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en bf16 en tarjetas de 8 GB o más y en cuantizaciones menores en tarjetas de 6-8 GB.
- Opciones de despliegue: transformers (probado por el autor), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles; para llama.cpp/Ollama sería necesaria una conversión a GGUF no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas foco | Licencia | Notas |
|---|---|---|---|---|---|
| ml-cpt10-anneal | 2,12B | 4.096 | Noruego (nb/nn), multilingüe | no disponible | Base, sin instruir; annealing sobre 0,48B tokens |
| BigFamTLLM/no-base-anneal | 2,12B (misma arquitectura) | 4.096 | Noruego | no disponible | Entrenado desde cero en noruego con el mismo presupuesto; referencia directa del proyecto |
| BigFamTLLM/ml-base-anneal | 2,12B (misma arquitectura) | 4.096 | Multilingüe | no disponible | Multilingüe desde cero con annealing; punto de partida conceptual |
| BigFamTLLM/da-base-anneal | 2,12B (misma arquitectura) | 4.096 | Danés | no disponible | Variante danesa del mismo proyecto |

No se dispone de comparación con modelos externos al proyecto (por ejemplo, modelos noruegos de otros autores) en la información proporcionada.

## Limitaciones y advertencias

- Modelo base, no ajustado por instrucciones: no debe usarse directamente como asistente conversacional; requiere fine-tuning para tareas de instrucción.
- Los propios autores advierten de que puede producir salidas incorrectas u ofensivas y que no está pensado para uso en producción.
- Riesgo de alucinación inherente a un modelo de 2,12B entrenado principalmente sobre texto web (HPLT 4.0).
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Cobertura idiomática desequilibrada: 85% Bokmål frente a 15% Nynorsk; el rendimiento en danés, sueco, alemán e inglés es secundario y no se reporta.
- Robustez limitada ante ruido: caída media de 0,042 puntos en las tareas evaluadas con entrada ruidosa.
- Licencia no disponible: no puede confirmarse el uso comercial ni las condiciones de redistribución; es imprescindible verificar la licencia antes de cualquier uso productivo.
- Sin datos publicados sobre sesgos específicos, aunque al entrenarse sobre web es esperable que los herede.
- Proyecto académico de un curso universitario: sin garantías de mantenimiento, soporte ni actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-cpt10-anneal
- Modelo base del annealing: https://huggingface.co/BigFamTLLM/ml-cpt10
- Modelo multilingüe de partida: https://huggingface.co/BigFamTLLM/ml-base
- Modelo noruego desde cero (referencia): https://huggingface.co/BigFamTLLM/no-base
- Versión annealed del noruego desde cero: https://huggingface.co/BigFamTLLM/no-base-anneal
- Versión annealed del multilingüe desde cero: https://huggingface.co/BigFamTLLM/ml-base-anneal
- Variante danesa: https://huggingface.co/BigFamTLLM/da-base
- Repositorio del proyecto (todos los checkpoints): https://huggingface.co/BigFamTLLM
