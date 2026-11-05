# CopyleftCultivars/qwen3-distill-v2-rationale-0.6b

## Resumen

`qwen3-distill-v2-rationale-0.6b` es un ajuste fino LoRA de `Qwen/Qwen3-0.6B` desarrollado por CopyleftCultivars, orientado a conversacion sobre agricultura natural (natural farming). El adaptador LoRA se ha fusionado en los pesos base en bf16 y se distribuye en formato safetensors, por lo que se carga directamente con `transformers` sin necesidad de aplicar el adaptador por separado.

El modelo hereda la arquitectura transformer decoder-only de Qwen3-0.6B, con 596.049.920 parametros totales (aproximadamente 0,6 mil millones) y una ventana de contexto que no se explicita en la model card. Su proposito es servir como motor conversacional de un chatbot especializado en practicas de agricultura natural, y sustituye a la version anterior a la que apuntaba la aplicacion Natural Farming Chat del mismo autor.

Es relevante por su tamano reducido, que permite despliegue en hardware modesto, y por su licencia Apache-2.0 heredada del modelo base. No obstante, se trata de un modelo de nicho, con datos de entrenamiento no publicados, sin benchmarks y con cero descargas en el momento de redactar esta ficha, lo que limita seriamente su evaluacion objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en el repo; existen builds int4 Cactus en `localNFchatbot-cactus` |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA sobre `Qwen/Qwen3-0.6B`, un transformer decoder-only de la familia Qwen3. El adaptador se ha fusionado (merged) en los pesos base y se ha guardado en bf16 con safetensors, de modo que el resultado es un checkpoint estandar de `transformers` sin capas adicionales que cargar en tiempo de inferencia.

Los detalles del entrenamiento no estan publicados: la model card indica explicitamente que los datos de entrenamiento no se liberan, y no se especifica el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o destilacion pese a la etiqueta "distill-v2-rationale" del nombre. El codigo y las notas de entrenamiento se remiten al repositorio `CopyleftCultivars/qwen3-finetune` en GitHub. La unica innovacion tecnica documentada es la fusion del LoRA en los pesos base y la existencia de builds cuantizados int4 para despliegue en dispositivo (Cactus).

## Capacidades

- Generacion de texto conversacional en ingles, orientada a tematica de agricultura natural.
- Conversacion multi-turno como chatbot especializado de dominio.
- Respuestas de tipo "rationale" (justificacion razonada), segun la denominacion del checkpoint.
- Capacidades generales heredadas de Qwen3-0.6B, aunque no verificadas ni documentadas en esta ficha.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Chatbot de consulta agronomica en ingles: el modelo puede mantener conversaciones multi-turno sobre practicas de agricultura natural, integrado en una interfaz web o movil, gracias a su tamano reducido que permite inferencia en CPU o GPU de gama baja.
- Despliegue en dispositivo (edge): las builds int4 del repositorio `localNFchatbot-cactus` permiten ejecutar el modelo en telefonos o dispositivos embebidos para asistencia agricola sin conexion.
- Asistente educativo de dominio: util para explicar conceptos de agricultura natural a principiantes, siempre con avisos de que la informacion no sustituye a la experiencia local.
- Prototipado rapido de asistentes verticales: sirve como plantilla para experimentar con ajuste fino LoRA fusionado sobre Qwen3-0.6B en dominios especializados.
- Base para evaluacion de tecnicas de destilacion y rationale: util en investigacion para comparar respuestas razonadas frente a respuestas directas en modelos pequenos.
- Filtrado y clasificacion de consultas agricolas: puede preprocesar preguntas de usuarios y derivarlas a expertos o a documentacion, dado su bajo coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica cabe en GPUs con 2-4 GB.
- VRAM estimada en int4 (builds Cactus): por debajo de 1 GB para pesos, apto para dispositivos moviles.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 4 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers`, text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), llama.cpp y Ollama previa conversion a GGUF (no se proporciona GGUF en el repo), vLLM (compatibilidad no verificada para este checkpoint).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-distill-v2-rationale-0.6b | 596 M | no disponible | Apache-2.0 | HuggingFace, 0 descargas | Ajuste fino de nicho, sin benchmarks |
| Qwen/Qwen3-0.6B | ~0,6 B | no disponible en esta ficha | Apache-2.0 | HuggingFace, modelo base ampliamente usado | Modelo generalista original |
| qwen3.5-2b-natural-farming-v5 | ~2 B (por el nombre) | no disponible | no disponible | HuggingFace, linea mas reciente del mismo autor | Sucesor declarado de esta linea |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que es un modelo pequeno y puede equivocarse; su consejo debe tratarse como informacion, no como sustituto de la experiencia local.
- Datos de entrenamiento no publicados: no es posible auditar sesgos, composicion ni calidad del corpus.
- Riesgo de alucinacion elevado en un modelo de 0,6 B, especialmente en recomendaciones agronomicas con consecuencias practicas.
- Solo soporta ingles declarado; el rendimiento en castellano no esta verificado.
- Longitud de contexto no documentada, lo que dificulta planificar conversaciones largas.
- Cero descargas y cero likes en el momento de la ficha: sin validacion comunitaria.
- Licencia Apache-2.0 permite uso comercial, pero la falta de documentacion sobre el dataset de ajuste traslada el riesgo legal y etico al desplegador.
- No apto para decisiones criticas (fitosanitarias, sanitarias, regulatorias) sin supervision de un experto.

## Enlaces

- HuggingFace: https://huggingface.co/CopyleftCultivars/qwen3-distill-v2-rationale-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Builds int4 Cactus: https://huggingface.co/CopyleftCultivars/localNFchatbot-cactus
- Linea mas reciente: https://huggingface.co/CopyleftCultivars/qwen3.5-2b-natural-farming-v5
- Codigo y notas de entrenamiento: https://github.com/CopyleftCultivars/qwen3-finetune
- Aplicacion previa: https://huggingface.co/CopyleftCultivars/pixel7-cactus-qwen3
