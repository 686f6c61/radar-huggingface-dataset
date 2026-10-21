# galakenya/JapanRailwayLLM

## Resumen

JapanRailwayLLM es un ajuste fino (SFT) del modelo Gemma 2 de 9B de Google, publicado por el usuario galakenya en Hugging Face. El modelo parte de `unsloth/gemma-2-9b-it-bnb-4bit`, la versión instruct de Gemma 2 cuantizada a 4 bits para entrenamiento eficiente con Unsloth, y se ha entrenado con la librería TRL de Hugging Face. Cuenta con 9.241.705.984 parámetros (9,24B) y se distribuye en formato safetensors, con etiqueta GGUF en el repositorio.

El nombre del modelo sugiere una especialización en el dominio ferroviario japonés, pero la model card no documenta la composición del dataset de entrenamiento, el número de tokens utilizados ni el proceso de filtrado de datos, por lo que esa especialización no puede verificarse a partir de la información publicada. Tampoco se han publicado resultados de benchmarks ni una licencia explícita: la model card incluye únicamente el marcador `licence: license`, sin texto legal asociado.

Su relevancia práctica es la de un caso típico de ajuste fino vertical sobre un modelo abierto de tamaño medio: sirve como ejemplo de pipeline Unsloth + TRL reproducible y como base para experimentos de especialización por dominio con requisitos de hardware moderados (inferencia en bf16 en torno a 18,5 GB de pesos). Con 297 descargas y 0 likes, es un modelo de nicho, sin validación externa conocida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), derivado de `unsloth/gemma-2-9b-it-bnb-4bit` |
| Parámetros totales | 9.241.705.984 (9,24B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base, no confirmada en la model card) |
| Tipos de cuantización | Safetensors en el repositorio (38,2 GB); etiqueta `gguf` presente, sin detalle de los niveles publicados |
| Idiomas soportados | No disponible en la información proporcionada (heredados del modelo base, no confirmados) |
| Licencia | No disponible (la model card solo contiene el marcador `licence: license`) |
| Formato de pesos | Safetensors y GGUF (según etiquetas del repositorio) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del Gemma 2 Instruct de 9B, una arquitectura transformer decoder-only. El punto de partida es la variante cuantizada a 4 bits (`bnb-4bit`) preparada por Unsloth, lo que permite entrenar con QLoRA sobre GPUs de gama alta consumer. La model card no especifica si los pesos publicados son el resultado de fusionar los adaptadores con la base o de un entrenamiento completo, ni detalla hiperparámetros, número de épocas, tasa de aprendizaje o composición del dataset.

El entrenamiento se realizó con TRL 1.15.0, Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1, según las versiones declaradas por el autor. No se documenta ningún proceso de RLHF o DPO posterior al SFT, ni innovaciones técnicas propias (decodificación especulativa, atención lineal, etc.). El repositorio ocupa 38,2 GB, un tamaño superior al esperado para pesos en bf16 de 9,24B parámetros (aproximadamente 18,5 GB), lo que sugiere la presencia de múltiples artefactos o de pesos en mayor precisión; la información disponible no permite confirmarlo.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo Instruct base.
- Conversación con plantilla de chat (el ejemplo de la model card pasa una lista de mensajes con roles `user`).
- Especialización potencial en dominio ferroviario japonés, sugerida por el nombre del modelo pero no documentada en la model card.
- Capacidades multilingües del modelo base: no confirmadas en esta ficha ni declaradas por el autor para este ajuste.
- Soporte de tool calling / function calling: no documentado para este ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado para este ajuste.
- Capacidades de visión, audio o modo "thinking": no disponibles.

## Casos de uso

- Atención al cliente ferroviaria: si la especialización que sugiere el nombre se confirma, el modelo podría gestionar consultas sobre rutas, horarios, transbordos y tarifas en conversaciones multi-turno, aprovechando el registro conversacional aprendido en el SFT. Requiere validación previa contra datos oficiales de operadores.
- Generación de FAQ y contenido divulgativo: redacción de guías de uso del ferrocarril, explicaciones de normas de viaje o descripciones de instalaciones, con revisión humana obligatoria por el riesgo de alucinación en datos concretos (andenes, horarios, precios).
- Asistente para turistas extranjeros: prototipo de chatbot que responda en varios idiomas sobre el sistema ferroviario japonés, siempre que se verifique empíricamente el soporte multilingüe del ajuste.
- Extracción de información estructurada: uso como componente de un pipeline que transforme texto libre (avisos de servicio, incidencias) en campos estructurados, integrándolo vía Hugging Face Endpoints (etiqueta `endpoints_compatible`) y validando la salida con esquemas JSON.
- Base para nuevos ajustes verticales: al ser un Gemma 2 9B con receta Unsloth + TRL documentada, sirve como punto de partida para especializaciones en otros dominios con presupuesto de cómputo moderado.
- Investigación sobre ajuste fino de bajo rango: reproducción del pipeline (base 4-bit, TRL SFT) para estudiar el impacto de la cuantización previa en la calidad final del modelo fusionado.
- Evaluación comparativa de ajustes verticales: banco de pruebas para medir cuánto conocimiento de dominio aporta un SFT sobre un Gemma 2 Instruct de 9,24B frente al modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K ni pruebas específicas de dominio), y el autor no reporta comparaciones con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 18,5 GB solo para pesos, más caché KV; se recomienda un mínimo de 24 GB para contextos cortos y 40-80 GB para contextos largos o lotes mayores.
- VRAM estimada en cuantización de 8 bits: aproximadamente 9,5-10 GB de pesos, más overhead.
- VRAM estimada en cuantización de 4 bits (GGUF Q4_K_M, referencia del modelo hermano del mismo autor: 5,76 GB): en torno a 6-8 GB en total, dependiendo de la longitud de contexto.
- GPU recomendadas: A100 40/80 GB o H100 para bf16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16 con contexto moderado o 8 bits; RTX 4060 Ti 16 GB, RTX 3060 12 GB o GPUs de 8 GB para cuantizaciones de 4 bits.
- Cabe en GPU consumer: sí, en bf16 en tarjetas de 24 GB con gestión cuidadosa de la caché KV, y en 4 bits en tarjetas de 8-12 GB.
- Opciones de despliegue: Transformers (`pipeline` con `device_map="auto"`, tal como documenta el autor), vLLM o TGI para serving en bf16, llama.cpp u Ollama a partir de pesos GGUF (la etiqueta `gguf` está presente, aunque no se detallan los ficheros), y Unsloth para reentrenamiento.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| JapanRailwayLLM | 9,24B | No disponible (heredado del base) | No disponible | 297 descargas, 0 likes; safetensors + etiqueta GGUF | Ajuste SFT vertical sin benchmarks publicados |
| gemma-2-9b-it (modelo base) | 9,24B (misma arquitectura) | No confirmado en esta ficha | Términos de uso de Gemma (verificar) | Público en Hugging Face | Modelo generalista con evaluación oficial publicada por Google |
| JapanRailwaysimLLM (mismo autor) | 7,9B según Featherless; 9B según la ficha GGUF | 32.768 según Featherless | No disponible | GGUF Q4_K_M (5,76 GB) disponible | Proyecto hermano con base distinta (`gemma-4-E4B` según Featherless); los datos entre fuentes son inconsistentes |
| Llama 3.1 8B Instruct | 8,03B | 128.000 | Licencia comunitaria de Llama 3.1 | Amplia disponibilidad y ecosistema | Alternativa generalista con contexto mucho mayor; datos de conocimiento público, no verificados en la información proporcionada |

La comparación con el modelo base es la más relevante: al no haber benchmarks, no puede cuantificarse la ganancia de dominio obtenida por el SFT ni el posible deterioro en capacidades generales.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base en el dominio ferroviario ni de que preserve sus capacidades generales.
- Dataset de entrenamiento no documentado: se desconoce la procedencia, el volumen y la licencia de los datos, lo que impide evaluar sesgos y riesgo de contaminación.
- Especialización solo inferida del nombre: el autor no describe el dominio en la model card, por lo que las expectativas de conocimiento ferroviario concreto (horarios, tarifas, normativa) no están respaldadas.
- Riesgo de alucinación alto en datos factuales: cualquier uso en información al viajero requiere anclaje a fuentes oficiales mediante RAG y validación de salida.
- Licencia no especificada: el marcador `licence: license` no constituye una licencia. Al derivar de Gemma 2, es previsible que apliquen los términos de uso de Gemma con sus restricciones de uso comercial y redistribución; debe verificarse antes de cualquier despliegue en producción.
- Entrenamiento sobre base cuantizada a 4 bits: puede introducir degradación sutil respecto a un ajuste sobre pesos completos; no se ha medido ese efecto.
- Idiomas no declarados: no se confirma el comportamiento en japonés ni en castellano; hay que evaluarlo empíricamente antes de usarlo en producción multilingüe.
- Contexto no documentado: planificar el diseño asumiendo el contexto del modelo base y validar el comportamiento en los límites.
- Madurez baja: 297 descargas, 0 likes y ningún informe externo de evaluación; tratar como modelo experimental.
- Inconsistencias en el ecosistema del autor: las fuentes externas sobre el modelo hermano difieren en parámetros y modelo base, lo que aconseja no extrapolar especificaciones entre repositorios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/galakenya/JapanRailwayLLM
- Modelo base: https://huggingface.co/unsloth/gemma-2-9b-it-bnb-4bit
- Repositorio de TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Modelo hermano del mismo autor: https://huggingface.co/galakenya/JapanRailwaysimLLM
- Cuantización GGUF del modelo hermano: https://huggingface.co/galakenya/JapanRailwaySimLLM-Q4_K_M
- Ficha en Free2AITools: https://free2aitools.com/model/galakenya/japanrailwayllm
- Ficha del modelo hermano en Free2AITools: https://free2aitools.com/model/galakenya/japanrailwaysimllm
- Despliegue del modelo hermano en Featherless: https://featherless.ai/models/galakenya/JapanRailwaysimLLM
