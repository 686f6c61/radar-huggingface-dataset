# adpretko/celerity-271m-8k-bs-ablation-ad0-bs11

# Celerity 271M 8K batch-size ablation ad0_bs11

## Resumen

Celerity 271M 8K — ad0_bs11 es un checkpoint de 271 millones de parámetros publicado por el usuario adpretko en HuggingFace. Se trata de la conversión a formato HuggingFace de un checkpoint entrenado originalmente en el formato CS de Cerebras (`checkpoint_60104.mdl`), y forma parte de una serie de experimentos de ablación del proyecto Celerity centrados en el tamaño de batch global. El modelo emplea codificación posicional ALiBi y fue entrenado con una longitud máxima de secuencia de 8192 tokens.

El checkpoint no es un modelo final orientado a producto, sino un artefacto de investigación: la propia model card lo describe como un experimento de ablación en el que se mantienen fijos el learning rate (0,15) y tau_ema (0,1745) mientras se varía el batch size global, ajustando el weight decay para conservar tau_ema constante. En esta configuración concreta el batch global es de 11 secuencias y el entrenamiento se extendió durante 60104 pasos.

Su relevancia actual es limitada fuera del ámbito de la investigación en dinámica de entrenamiento y conversión de formatos entre runtimes. No hay pipeline declarado, ni idiomas soportados, ni licencia especificada, ni resultados de benchmarks publicados. El repositorio ocupa 0,5 GB y requiere cargar código de modelado personalizado con `trust_remote_code=True`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con codificación posicional ALiBi (implementación personalizada Celerity; no se especifica si es decoder-only) |
| Parámetros totales | 271 millones |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (longitud máxima de secuencia durante el entrenamiento) |
| Tipos de cuantización | no disponible (no se declaran pesos cuantizados; el tamaño del repo, 0,5 GB, es compatible con pesos en fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (código de modelado personalizado Celerity); safetensors y GGUF no confirmados |

## Arquitectura y entrenamiento

El modelo es un transformer de 271 millones de parámetros con codificación posicional ALiBi, una elección que permite extender la ventana de atención más allá de la longitud vista en entrenamiento sin reentrenar los embeddings posicionales. La model card no detalla el número de capas, dimensiones ocultas, número de cabezas de atención ni el vocabulario, por lo que no es posible reconstruir la topología exacta a partir de la información disponible. El código de modelado es personalizado del proyecto Celerity y se distribuye dentro del repositorio, lo que obliga a usar `trust_remote_code=True` al cargarlo.

Los hiperparámetros de entrenamiento documentados son: batch global de 11 secuencias, 60104 pasos, learning rate máximo de 0,15, weight decay de 0,0006356381190145931, tau_ema de 0,1745, attention dropout de 0 con schedule constante, residual dropout de 0, stochastic depth de 0 y LayerDrop de 0. El entrenamiento se ejecutó sobre el runtime `cbcore 2.6.0` y el checkpoint se convirtió desde el formato CS de Cerebras mediante un conversor cuyo commit se identifica como `0e3d5d375695293479df9d2a3717f05f71a345b4`. No se especifican el número total de tokens procesados, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

La innovación metodológica del experimento no está en el modelo en sí, sino en el diseño de la ablación: se mantiene tau_ema fijo variando el batch size global y compensando con el weight decay, de modo que los efectos observados entre checkpoints de la serie sean atribuibles al tamaño de batch y no a un cambio en la escala efectiva del regularizador. Los efectos de attention dropout, tau_ema y weight decay están incorporados en los pesos aprendidos, y durante la evaluación en HuggingFace el dropout queda desactivado mediante `model.eval()`.

## Capacidades

- Generación de texto autoregresiva como modelo de lenguaje base; no hay evidencia de ajuste por instrucciones ni de formato conversacional.
- Modelado de lenguaje con contexto de hasta 8192 tokens, adecuado para documentos largos en tareas de continuación o puntuación.
- Soporte de tool calling / function calling: no disponible, no declarado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible, no declarado.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Compatibilidad con el ecosistema HuggingFace `transformers` mediante carga con código remoto, y con PyTorch como framework de referencia.

## Casos de uso

- Investigación sobre dinámica de entrenamiento y tamaño de batch: el checkpoint es uno de los puntos de una ablación sistemática, por lo que sirve para comparar curvas de pérdida y comportamiento final frente a las variantes con otros valores de batch global bajo el mismo tau_ema.
- Validación de conversión entre runtimes: permite verificar que el conversor del formato CS de Cerebras a HuggingFace preserva el comportamiento del checkpoint original (`checkpoint_60104.mdl`) comparando salidas entre ambos entornos.
- Fine-tuning sobre tareas de clasificación o extracción con documentos largos: sus 8192 tokens de contexto permiten procesar contratos, informes o artículos completos sin truncar, partiendo de un checkpoint base de 271M parámetros que cabe en GPUs modestas.
- Baseline académico en experimentos de NLP: al ser un modelo pequeño y con hiperparámetros completamente documentados, resulta reproducible como referencia frente a arquitecturas con embeddings posicionales aprendidos o RoPE.
- Estudio de extrapolación de contexto con ALiBi: la combinación de ALiBi y 8192 tokens de entrenamiento lo convierte en un banco de pruebas para medir degradación de perplejidad al evaluar en secuencias más largas o más cortas.
- Análisis de representaciones internas y embeddings: la disponibilidad de pesos completos y código de modelado abierto facilita extraer activaciones por capa para estudios de probing o interpretabilidad.
- Pruebas de cuantización y optimización de inferencia: el tamaño reducido del modelo permite experimentar con cuantizaciones de 8 y 4 bits, medir impacto en perplejidad y validar pipelines de despliegue antes de escalar a modelos mayores.
- Prototipado en hardware de gama baja o CPU: con menos de 1 GB de pesos en precisión de 16 bits, es viable ejecutar inferencia en portátiles y máquinas sin GPU dedicada para pruebas funcionales de pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, Hellaswag, ARC ni perplejidad sobre conjuntos de validación, y la ficha de HuggingFace no registra descargas ni valoraciones que permitan inferir uso o evaluación por parte de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia de los pesos, calculada a partir de los 271M parámetros: aproximadamente 0,15 GB en cuantización de 4 bits, 0,3 GB en 8 bits, 0,55 GB en fp16/bf16 y 1,1 GB en fp32.
- Memoria adicional para la caché KV: no disponible. No se especifican número de capas, cabezas ni dimensión por cabeza, por lo que no puede calcularse el consumo exacto a 8192 tokens de contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM efectiva para fp16, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060 y superiores. Para fp32 se recomienda un mínimo de 2 GB libres.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos ocho años, e incluso en iGPU con memoria unificada suficiente.
- Despliegue: al emplear código de modelado personalizado, la carga debe hacerse con `transformers` y `trust_remote_code=True`. El soporte en vLLM, TGI, llama.cpp u Ollama no está confirmado y es poco probable sin una implementación específica de la arquitectura Celerity.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones y dependerán en gran medida del hardware y de la longitud de secuencia efectiva.
- Almacenamiento: el repositorio ocupa 0,5 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| Celerity 271M 8K ad0_bs11 | 271M | 8192 | no disponible | HuggingFace, código personalizado | no disponible |
| Cerebras-GPT 256M | 256M | 2048 | Apache 2.0 | HuggingFace, `transformers` nativo | sí (perplejidad y tareas de evaluación en la model card) |
| Pythia 410M | 410M | 2048 | Apache 2.0 | HuggingFace, `transformers` nativo | sí (suite de evaluación completa del proyecto Pythia) |
| GPT-2 medium | 355M | 1024 | MIT (según ficha de HuggingFace) | HuggingFace, `transformers` nativo | sí (resultados ampliamente reportados en la literatura) |

Los datos de los modelos comparables proceden de sus fichas públicas y se incluyen como referencia de categoría; conviene verificarlos en la fuente antes de citarlos. El principal diferencial de Celerity 271M 8K frente a estos es la ventana de contexto de 8192 tokens, el doble o el cuádruple que las alternativas de tamaño similar, junto con el uso de ALiBi en lugar de embeddings posicionales aprendidos o RoPE. En contrapartida, carece de licencia declarada, de idiomas especificados y de cualquier evaluación publicada, lo que lo sitúa por detrás de los comparables en trazabilidad y facilidad de integración.

## Limitaciones y advertencias

- Es un checkpoint de ablación, no un modelo final: no ha pasado por ajuste por instrucciones, RLHF ni DPO, por lo que no debe usarse directamente como asistente conversacional.
- No se declara licencia. Sin una licencia explícita, el uso comercial y la redistribución quedan en un limbo legal; se debe contactar con el autor antes de cualquier uso en producción.
- No se declaran idiomas soportados ni composición del dataset de entrenamiento, lo que impide evaluar cobertura lingüística, sesgos de dominio o contaminación de benchmarks.
- No hay resultados de benchmarks ni de evaluación de sesgos, toxicidad o veracidad. El riesgo de alucinación es el propio de un modelo de lenguaje base de 271M parámetros, sin filtros posteriores.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python arbitrario incluido en el repositorio. Debe auditarse el código antes de cargarlo en entornos compartidos o con secretos accesibles.
- La ventana de 8192 tokens no garantiza calidad equivalente al final del contexto: no se han publicado curvas de perplejidad por posición ni pruebas de extrapolación con ALiBi.
- El batch global de 11 secuencias es inusualmente pequeño para entrenamiento a gran escala, lo que puede afectar la estabilidad y la calidad final del modelo en comparación con configuraciones de batch mucho mayores.
- El soporte en motores de inferencia optimizados (vLLM, TensorRT-LLM, llama.cpp, Ollama) no está confirmado y probablemente requiera trabajo de adaptación.
- El repositorio no registra descargas ni interacciones, por lo que no existe validación por parte de la comunidad sobre su correcto funcionamiento.
- Las fechas de creación y actualización del repositorio que aparecen en los metadatos (octubre de 2026) no coinciden con el estado actual y deben tomarse con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adpretko/celerity-271m-8k-bs-ablation-ad0-bs11
- Variante de ablación relacionada (attention dropout 0,1): https://huggingface.co/adpretko/celerity-271m-8k-ad0p1
- Variante de ablación relacionada (residual dropout 0,4): https://huggingface.co/adpretko/celerity-271m-8k-residual-dropout-0p4
- Paper, blog o repositorio del proyecto Celerity: no disponible en la información proporcionada
- Documentación oficial de Cerebras sobre el formato CS y `cbcore`: no disponible en la información proporcionada
