# mradermacher/Fresco-1.2.5-GGUF

## Resumen

Fresco-1.2.5-GGUF es una colección de cuantizaciones en formato GGUF del modelo Fresco-1.2.5, desarrollado originalmente por AxionLabsAI y convertido por mradermacher. El repositorio contiene múltiples versiones cuantizadas (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, IQ4_XS, etc.) para facilitar su despliegue en entornos con recursos limitados. El modelo base tiene aproximadamente 8.030 millones de parámetros, lo que lo sitúa en la gama de modelos de 8B, similar a otros LLM populares como Llama 3 8B o Mistral 7B.

La relevancia de esta publicación radica en que ofrece pesos listos para usar con motores de inferencia como llama.cpp, Ollama o vLLM, lo que permite ejecutar el modelo en hardware de consumo. Sin embargo, la información pública disponible es muy escasa: no se especifican la arquitectura exacta, el contexto, la licencia ni los datos de entrenamiento. El modelo está etiquetado como "conversational", lo que sugiere un enfoque en diálogo y asistencia, pero no hay documentación adicional que confirme sus capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors del modelo original, pero el repo es GGUF) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo Fresco-1.2.5. Dado el tamaño de parámetros (8B) y la etiqueta "conversational", es probable que se trate de un transformer decoder-only similar a otros modelos de la misma escala, pero esto es una especulación y no un dato confirmado. Tampoco se conocen los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. El repositorio GGUF es una conversión estática del modelo original, lo que implica que los pesos se han transformado al formato GGUF para su uso con motores de inferencia optimizados para CPU y GPU de baja VRAM.

## Capacidades

- Generación de texto conversacional: el tag "conversational" indica que el modelo está orientado a mantener diálogos, aunque no se detallan sus límites.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede desplegarse como API, probablemente mediante servidores como llama.cpp o vLLM.
- Sin información sobre razonamiento, código, matemáticas, visión o tool calling: no hay datos que confirmen estas capacidades.

## Casos de uso

- Asistente conversacional básico: dado su perfil "conversational", podría emplearse para chatbots de atención al cliente o asistentes virtuales, siempre que se valide su calidad en pruebas propias.
- Prototipado rápido en local: al estar disponible en GGUF, se puede ejecutar en una GPU de consumo (por ejemplo, RTX 3060 con 12 GB) usando Ollama o llama.cpp para experimentar sin depender de APIs externas.
- Despliegue en entornos con restricciones de hardware: las cuantizaciones Q2_K o Q3_K permiten ejecutar el modelo en CPU con pocos GB de RAM, útil para entornos edge o servidores sin GPU.
- Integración en pipelines de generación de texto: si el modelo funciona correctamente, podría usarse para redactar correos, resúmenes o contenido breve, aunque se requiere validación previa.
- Evaluación comparativa local: investigadores pueden descargar las distintas cuantizaciones para medir la degradación de rendimiento según el nivel de compresión.
- Fine-tuning posterior: aunque el repo solo contiene GGUF, el modelo original en safetensors (si se obtiene de AxionLabsAI) podría servir como base para ajuste fino con PEFT/LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para Q4_K_M (típica), un modelo de 8B requiere aproximadamente 5-6 GB de VRAM. Para Q2_K, unos 3-4 GB. Para f16, unos 16 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, o GPUs de datacenter como A10G o A100 si se usa f16.
- En CPU: con cuantizaciones Q4_K_M o inferiores, puede ejecutarse en CPUs modernas con 16 GB de RAM, aunque la velocidad será lenta (varios segundos por token).
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si se convierte a formato compatible), TGI (con adaptación), o servidores compatibles con GGUF.
- Latencia y throughput: no disponibles. Dependerá del hardware y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos. El tamaño de 8B sugiere que podría competir con Llama 3 8B, Mistral 7B o Gemma 2 9B, pero sin datos de rendimiento no es posible establecer una comparación objetiva.

## Limitaciones y advertencias

- No hay información sobre sesgos, alucinaciones o limitaciones de contexto. Se recomienda realizar pruebas exhaustivas antes de usar en producción.
- La licencia es desconocida, por lo que no se puede garantizar el uso comercial. Contactar con AxionLabsAI para aclarar los términos.
- El modelo original no tiene documentación pública, lo que dificulta entender sus capacidades reales y sus posibles fallos.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar significativamente la calidad de las respuestas.
- Al ser un modelo de 8B, su rendimiento en tareas complejas (razonamiento matemático, código) probablemente sea inferior a modelos más grandes, aunque esto no está confirmado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Fresco-1.2.5-GGUF
- Modelo original (sin información adicional): https://huggingface.co/AxionLabsAI/Fresco-1.2.5
- No se han encontrado papers, blogs o demos adicionales en la búsqueda web (no se realizó búsqueda externa; solo se usó la información proporcionada).
