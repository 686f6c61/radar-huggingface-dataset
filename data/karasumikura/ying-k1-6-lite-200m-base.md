# Karasumikura/Ying-K1.6-Lite-200M-base

## Resumen

Ying K1.6 Lite 200M Base es un modelo de lenguaje causal de tipo base (sin ajuste por instrucciones) desarrollado por Karasumikura. Se trata de la evolución del modelo K1.5 Lite 200M, al que se le ha añadido una fase de preentrenamiento continuado en chino sobre los pesos base de la generación anterior. Con 210,2 millones de parámetros, 16 capas y una ventana de contexto de 8192 tokens, se posiciona en la categoría de modelos pequeños orientados a experimentación, extracción de características y desarrollo de pipelines propios.

El modelo emplea una arquitectura transformer con atención híbrida: 12 de sus 16 capas usan atención de ventana deslizante con un tamaño de ventana de 1024 tokens, mientras que las 4 restantes mantienen atención global. Esta combinación busca reducir el coste computacional en secuencias largas sin perder acceso completo al contexto en capas clave. El vocabulario es de 16.006 tokens y los pesos se distribuyen en precisión bf16.

Su relevancia actual es limitada pero concreta: se publica bajo licencia Apache 2.0, lo que permite uso comercial y modificación, y sirve como punto de partida para quien quiera hacer fine-tuning, investigar arquitecturas de atención híbrida o disponer de un modelo base bilingüe chino-inglés de pequeño tamaño. No obstante, al no haber recibido SFT ni DPO, no es apto para uso conversacional directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención híbrida (12 capas de ventana deslizante de 1024 tokens + 4 capas de atención global); 16 capas, dimensión oculta 768 |
| Parametros totales | 210.210.560 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de 16 capas con dimensión oculta 768 y un vocabulario de 16.006 tokens. La innovación arquitectónica principal es la atención híbrida: 12 capas emplean ventana deslizante de 1024 tokens y 4 capas usan atención global, lo que permite manejar contextos de hasta 8192 tokens con un coste de atención reducido en la mayoría de capas. El tag `feature-extraction` en Hugging Face sugiere que el modelo también puede emplearse para obtener representaciones, aunque la model card no detalla este uso.

El entrenamiento se dividió en dos fases. La primera, de preentrenamiento base, utilizó el corpus general `mm200_pt2` con 24,07 mil millones de tokens y se ejecutó sobre 8 GPU Moore Threads MTT S4000. La segunda, de preentrenamiento continuado en chino, empleó 1,40 mil millones de tokens del subconjunto `multi_style` de Ultra-FineWeb-L3, con secuencias de 8192 tokens, batch de 12, tasa de aprendizaje constante (muon 5e-3 / adam 1.5e-4) tras 200 pasos de calentamiento y un total de 14.292 pasos, ejecutada sobre RTX PRO 6000 Blackwell. No se aplicó SFT ni DPO sobre estos pesos; el autor indica que la versión con instrucciones se publica por separado.

## Capacidades

- Generación de texto autoregresiva en chino e inglés, orientada a continuación de texto más que a respuesta a instrucciones.
- Modelo base sin ajuste por instrucciones: no sigue formatos conversacionales de forma fiable.
- Extracción de características (tag `feature-extraction`), potencialmente útil para representaciones internas y tareas de probing.
- Soporte de contexto largo de hasta 8192 tokens gracias a la combinación de atención local y global.
- Capacidad bilingüe zh/en, con especial énfasis en chino tras la fase de preentrenamiento continuado.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- El formato de chat `<|user|>...<|assistant|>...<|im_end|>` está definido para la versión SFT, no para estos pesos base.

## Casos de uso

- Fine-tuning supervisado para dominio específico: al ser un modelo base de 210 M con licencia Apache 2.0, sirve como punto de partida económico para adaptar un modelo pequeño a tareas concretas (clasificación, extracción, resumen) con pocos recursos de GPU.
- Investigación en atención híbrida: la combinación de 12 capas locales y 4 globales permite estudiar el equilibrio entre coste y calidad en contextos de 8192 tokens, comparando con arquitecturas de atención completa.
- Extracción de embeddings para búsqueda semántica: el tag `feature-extraction` y su tamaño reducido lo hacen candidato para generar representaciones en pipelines de recuperación con requisitos de latencia bajos.
- Generación de texto asistida en chino: continuación de documentos, titulares o párrafos en un contexto donde el modelo ha recibido preentrenamiento continuado específico en chino.
- Prototipado rápido en entornos con GPU de consumo: sus 210 M de parámetros permiten iterar en una sola GPU consumer, útil para validar pipelines antes de escalar a modelos mayores.
- Base para modelos de diálogo ligeros: partiendo de estos pesos, un equipo puede entrenar su propio SFT con el formato de chat definido por el autor y desplegar un asistente de dominio acotado.
- Evaluación comparativa de tokenizadores y vocabularios: el vocabulario de 16.006 tokens y el soporte zh/en permiten analizar eficiencia de tokenización en corpus bilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,42 GB solo para pesos (210 M × 2 bytes), más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para secuencias moderadas.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,21 GB para pesos; en 4 bits, alrededor de 0,11 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. El modelo fue entrenado en MTT S4000 y RTX PRO 6000 Blackwell, pero la inferencia no requiere ese hardware.
- Cabe holgadamente en GPU de consumo, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el código personalizado); no se documenta soporte oficial de vLLM, llama.cpp, Ollama o TGI, y la presencia de `custom_code` puede complicar la conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Ying K1.6 Lite 200M Base | 210,2 M | 8192 | Apache 2.0 | zh, en | Base sin SFT; atención híbrida; requiere `trust_remote_code` |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache 2.0 | multilingüe | Base y versiones instruct disponibles; ecosistema amplio |
| SmolLM2-135M | 135 M | 8192 | Apache 2.0 | en (principalmente) | Base e instruct; soporte en llama.cpp y transformers |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | en (principalmente) | Base e instruct; mayor tamaño y contexto menor |

La comparación con Qwen2.5-0.5B, SmolLM2-135M y TinyLlama-1.1B es orientativa: no se dispone de benchmarks del modelo de Karasumikura para contrastar rendimiento real. Frente a ellos, Ying K1.6 Lite 200M Base destaca por su contexto de 8192 tokens y su enfoque bilingüe zh/en, pero carece del ecosistema de herramientas y de las versiones instruct maduras de los modelos citados.

## Limitaciones y advertencias

- No es un modelo instruct: no debe usarse directamente en producción conversacional; el autor advierte que genera continuación de texto en lugar de respuestas.
- Riesgo de alucinación y de contenido incoherente, especialmente alto en un modelo base de 210 M entrenado con 24 B de tokens.
- Sesgos desconocidos: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad.
- Cobertura lingüística limitada a chino e inglés; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- El contexto de 8192 tokens depende de la atención híbrida; no se han publicado evaluaciones de rendimiento en el extremo de la ventana.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; conviene revisar el código antes de desplegarlo.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin garantías, el usuario asume la responsabilidad de evaluar su idoneidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria ni reportes de uso en producción.
- No se documentan cuantizaciones oficiales ni soporte en motores de inferencia populares, lo que puede requerir trabajo adicional de integración.

## Enlaces

- Hugging Face: https://huggingface.co/Karasumikura/Ying-K1.6-Lite-200M-base
- Modelo anterior (indicado como privado): `Karasumikura/Ying-K1.5-Lite-200M-base`
- Versión conversacional desplegada: `Karasumikura/Ying-K1.5-Lite-200M`
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
