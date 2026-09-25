# jlsrls/mainsweep4ep-ctrl-s0-em

## Resumen

`jlsrls/mainsweep4ep-ctrl-s0-em` es un ajuste fino supervisado (SFT) del modelo `unsloth/Llama-3.2-1B-Instruct`, publicado por el usuario `jlsrls` en Hugging Face. Se trata de un artefacto experimental derivado de un entrenamiento gestionado con la librería TRL (versión 0.24.0) sobre el framework Unsloth, según los metadatos de la model card. No se documenta el conjunto de datos utilizado, el objetivo de la tarea ni el procedimiento de evaluación.

La relevancia del modelo es limitada y de carácter más bien académico o de traza de experimento: cuenta con 0 descargas, 1 "like" y una model card generada automáticamente por la plantilla de TRL. El nombre del run asociado en Weights & Biases (`clarifying-em`, dentro del proyecto de `rezvani-portland-state-university`) sugiere que se entrenó para alguna tarea experimental de clarificación conversacional, pero no hay documentación pública que lo confirme.

Al estar basado en Llama 3.2 1B Instruct, hereda la arquitectura transformer decoder-only con atención GQA del modelo base, con aproximadamente 1,24 mil millones de parámetros y una ventana de contexto declarada de 128.000 tokens. El repositorio ocupa 2,3 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA (heredada del modelo base Llama 3.2 1B Instruct); no se documenta ninguna modificación estructural |
| Parametros totales | ~1,24 mil millones (1,24B), segun el modelo base |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens segun el modelo base; no verificado ni confirmado en la model card del ajuste |
| Tipos de cuantizacion | No se distribuyen variantes cuantizadas. Los pesos se publican en safetensors (~2,3 GB, compatible con bf16/fp16); se pueden generar cuantizaciones GGUF, AWQ o bitsandbytes con herramientas externas |
| Idiomas soportados | No especificado en la model card. El modelo base declara ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | La model card incluye un campo `licence: license` sin texto legal. Al ser un derivado de Llama 3.2, se le aplicaria la Llama 3.2 Community License, no confirmado por el autor |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

No se documenta ninguna innovación arquitectónica propia: el modelo es un ajuste fino del checkpoint `unsloth/Llama-3.2-1B-Instruct`, que a su vez es una versión optimizada del Llama 3.2 1B Instruct de Meta. Esto implica un transformer decoder-only con normalización RMSNorm pre-norma, activación SwiGLU, embeddings rotatorios (RoPE) y atención con query grouping (GQA) para reducir el tamaño de la caché KV. No hay evidencias de que se hayan alterado capas, dimensión oculta ni cabezas de atención.

El entrenamiento se realizó mediante SFT con TRL 0.24.0 sobre Transformers 5.5.0, PyTorch 2.11.0 y Datasets 4.3.0, con Tokenizers 0.22.2, según las versiones declaradas en la model card. No se especifica el número de tokens de entrenamiento, la composición del dataset, la duración del entrenamiento, los hiperparámetros (learning rate, batch size, epochs) ni si hubo fases posteriores de alineación como DPO o RLHF. La única traza reproducible es un run de Weights & Biases en el proyecto `clarifying-em`, cuyo acceso público no está garantizado.

## Capacidades

Las capacidades reales del ajuste no están documentadas y no se han publicado evaluaciones. Lo que se puede afirmar es lo siguiente:

- Generación de texto conversacional e instrucciones, heredada del modelo base Llama 3.2 1B Instruct.
- Razonamiento básico y respuesta a preguntas sencillas, limitado por el tamaño de 1,24B parámetros.
- Generación de código de complejidad baja a media, con fiabilidad notablemente inferior a modelos de 7B o superiores.
- Soporte de plantillas de chat con roles `user`/`assistant`, tal como muestra el ejemplo de `pipeline` de la model card.
- Capacidad multilingüe heredada del modelo base (8 idiomas declarados), no verificada tras el ajuste.
- No hay evidencia de soporte de tool calling, function calling, uso de agentes, modo de razonamiento explícito (thinking), visión ni audio en este ajuste concreto.
- No se puede confirmar que el ajuste conserve íntegramente las capacidades del modelo base: sin evaluación publicada, existe riesgo de degradación por sobreajuste al dataset de SFT.

## Casos de uso

Dado que el objetivo del ajuste no está documentado, los casos de uso que se listan son aplicaciones genéricas y realistas para un modelo instruct de ~1,24B parámetros. Deben validarse empíricamente antes de cualquier uso en producción.

- Prototipado rápido y pruebas de concepto: por su tamaño reducido, el modelo se puede cargar en una GPU de gama media o incluso en CPU para validar plantillas de prompt y flujos conversacionales antes de escalar a un modelo mayor.
- Clasificación y etiquetado de texto: con prompts adecuados, se puede usar para categorizar tickets, correos o reseñas, con la ventaja de que la inferencia en bf16 ocupa menos de 3 GB de VRAM.
- Generación de texto en dispositivos con recursos limitados: portátiles con GPU integrada, mini-PC o entornos edge donde no cabe un modelo de 7B, siempre que se acepte una calidad de salida menor.
- Asistente de autocompletado o resumen de documentos cortos: útil para condensar notas, correos o fragmentos de documentación de hasta unos miles de tokens, evitando contextos muy largos por el coste de la caché KV.
- Filtrado previo en pipelines de datos: como modelo de bajo coste para descartar contenido irrelevante antes de pasar los casos complejos a un modelo mayor, reduciendo el gasto computacional global.
- Investigación sobre ajuste fino: sirve como referencia para reproducir experimentos de SFT con TRL y Unsloth, comparar hiperparámetros o estudiar el efecto del ajuste sobre un modelo base de 1B.
- Generación de código asistida de baja criticidad: sugerencias de fragmentos, documentación de funciones o tests triviales, siempre con revisión humana obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluación (MMLU, HumanEval, GSM8K, IFEval ni similares), ni tampoco métricas de pérdida de validación, y el repositorio no incluye scripts de evaluación. No se dispone por tanto de datos que permitan comparar cuantitativamente este ajuste con el modelo base u otras alternativas.

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 2,5 GB solo para los pesos, más la caché KV y las activaciones. En la práctica, unos 3-4 GB de VRAM para contextos moderados.
- VRAM en int8 (bitsandbytes): en torno a 1,3 GB de pesos.
- VRAM en int4 (GGUF Q4_K_M o similar): en torno a 0,8-1 GB de pesos.
- Caché KV: derivada de la arquitectura del modelo base (16 capas, 8 cabezas KV, dimensión de cabeza 64), ocupa aproximadamente 32 KB por token en bf16, es decir, unos 4 GB si se agota la ventana de 128.000 tokens. Esto hace que el contexto largo sea inviable en GPUs pequeñas aunque los pesos quepan sin problema.
- GPU compatibles: cualquier GPU consumer con 6 GB o más de VRAM, como RTX 3060, RTX 4060, RTX 2070 o superiores. En GPUs de datacenter (A100, H100, L40S) el modelo queda enormemente sobredimensionado en memoria, aunque se puede usar para servir muchas réplicas concurrentes.
- CPU: la inferencia en CPU es viable mediante llama.cpp u Ollama tras convertir los pesos a GGUF, con latencias del orden de decenas de tokens por segundo en procesadores modernos.
- Opciones de despliegue: `transformers` con `pipeline`, vLLM, TGI, SGLang y, previa conversión a GGUF, llama.cpp, Ollama y LM Studio. No se distribuyen pesos GGUF en el repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

Todos los modelos de la tabla son alternativas de tamaño comparable en la categoría de modelos instruct pequeños. No se dispone de puntuaciones de benchmarks para `mainsweep4ep-ctrl-s0-em`, por lo que la comparación se limita a características estructurales y de licencia.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| jlsrls/mainsweep4ep-ctrl-s0-em | ~1,24B | 128.000 tokens (heredado, sin confirmar) | No declarada en la model card; sujeta a Llama 3.2 Community License | Ajuste SFT experimental, 0 descargas, sin evaluaciones ni dataset documentado |
| unsloth/Llama-3.2-1B-Instruct | ~1,24B | 128.000 tokens | Llama 3.2 Community License | Modelo base de este ajuste; checkpoint optimizado por Unsloth |
| meta-llama/Llama-3.2-1B-Instruct | ~1,24B | 128.000 tokens | Llama 3.2 Community License | Modelo original de Meta, con model card completa y evaluaciones publicadas |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,54B | 32.768 tokens (ampliable a 128K con YaRN) | Apache 2.0 | Alternativa con licencia permisiva y soporte de tool calling documentado |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | ~1,7B | 8.192 tokens | Apache 2.0 | Entrenado sobre 11 billones de tokens, con model card detallada y evaluaciones publicadas |

## Limitaciones y advertencias

- Ausencia total de documentación: no se describe el dataset de SFT, el objetivo de la tarea, los hiperparámetros ni el proceso de evaluación, lo que impide juzgar la validez del ajuste.
- Riesgo de sobreajuste: al ser un ajuste SFT sobre un modelo de 1,24B sin evaluaciones publicadas, es probable que haya pérdida de capacidades generales del modelo base (olvido catastrófico), especialmente fuera de la distribución de los datos de entrenamiento.
- Riesgo de alucinación elevado: los modelos de ~1B parámetros presentan tasas de alucinación y errores factuales sensiblemente superiores a los de 7B o más, por lo que no son adecuados para tareas que exijan exactitud factual sin verificación humana.
- Sesgos: no se han realizado evaluaciones de sesgo. Al heredar los datos de preentrenamiento del modelo base, reproduce los sesgos presentes en corpus web a gran escala.
- Idiomas: aunque el modelo base declara 8 idiomas, no hay ninguna verificación de que el ajuste conserve ese soporte ni de que el dataset de SFT fuera multilingüe. El ejemplo de la model card está en inglés, lo que sugiere un uso orientado a ese idioma.
- Licencia incierta: la model card incluye un campo `licence: license` sin contenido. Si se confirma la herencia de la Llama 3.2 Community License, el uso comercial está sujeto a sus condiciones (incluida la cláusula de denominación "Built with Llama" y las restricciones para entidades con más de 700 millones de usuarios mensuales). Debe aclararse con el autor antes de cualquier uso comercial.
- Idoneidad para producción: escasa. Con 0 descargas, sin pipeline declarado, sin evaluaciones y con una model card autogenerada, es un artefacto de experimento, no un modelo listo para desplegar.
- Trazabilidad: el enlace al run de Weights & Biases puede requerir autenticación y no se garantiza su disponibilidad futura, lo que dificulta la reproducibilidad.
- Contexto largo: aunque el modelo base soporte 128.000 tokens, la caché KV crece de forma lineal y puede provocar fallos de memoria en GPUs pequeñas mucho antes de alcanzar ese límite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jlsrls/mainsweep4ep-ctrl-s0-em
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases: https://wandb.ai/rezvani-portland-state-university/clarifying-em/runs/y9stkesw
- Modelo hermano del mismo autor: https://huggingface.co/jlsrls/mainsweep4ep-kl10000-s0-logitrl
