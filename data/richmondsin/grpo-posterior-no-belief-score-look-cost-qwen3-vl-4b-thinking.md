# richmondsin/grpo-posterior-no-belief-score-look-cost-qwen3-vl-4b-thinking

## Resumen

`grpo-posterior-no-belief-score-look-cost-qwen3-vl-4b-thinking` es un modelo multimodal de tipo image-text-to-text publicado por el usuario richmondsin en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un *merge* completo del modelo base [Qwen/Qwen3-VL-4B-Thinking](https://huggingface.co/Qwen/Qwen3-VL-4B-Thinking) con un adaptador LoRA propio fusionado en los pesos. El resultado es un checkpoint autónomo de 4.437.815.808 parámetros (aproximadamente 4,44 mil millones) en formato safetensors y bf16.

El interés del modelo es fundamentalmente experimental: el autor documenta que el adaptador procede de una ablación de aprendizaje por refuerzo con GRPO (RLVB) en la que se elimina la recompensa de creencia (*no belief score*), se fija un coste de mirada (*look cost*) de 0,02 y se emplean fases de entrenamiento de 25/300 pasos con `set_keep` 200 y 50 actualizaciones. Es, por tanto, una variante de investigación orientada a estudiar cómo afectan estas decisiones de recompensa al comportamiento del modelo base, no un modelo listo para producción.

La relevancia práctica es limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no declara licencia ni idiomas soportados, y la model card es muy escueta. Aun así, resulta útil como referencia para quienes investigan el ajuste fino con LoRA y GRPO sobre modelos visión-lenguaje pequeños y quieren reproducir o comparar ablaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), vision-lenguaje; detalles internos no disponibles |
| Parametros totales | 4.437.815.808 (4,44 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16) |
| Tamano del repositorio | 8,9 GB |
| Modelo base | Qwen/Qwen3-VL-4B-Thinking |
| Tipo de ajuste | LoRA fusionado (r 16, alpha 32, escala 2,0) |
| Modulos fusionados | 252 |
| Biblioteca | transformers |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen3-VL-4B-Thinking, un transformer multimodal capaz de procesar imágenes y texto y de generar respuestas con modo de razonamiento (*thinking*). El autor no detalla en la model card la composición del dataset de preentrenamiento del base ni el número de tokens utilizados; esa información correspondería a la documentación oficial de Qwen.

Sobre el ajuste, la model card indica que se aplicó un adaptador LoRA con rango 16 y `lora_alpha` 32, entrenado mediante GRPO (una variante de RLHF sin modelo de recompensa separado, basada en comparaciones de grupo) dentro de un esquema denominado RLVB. La ablación concreta elimina la recompensa de creencia (*no belief score*), fija un coste de mirada `tau_look` de 0,02, usa una fase de 25 pasos sobre un conjunto de 300 ejemplos con `set_keep` 200 y 50 actualizaciones. La fusión se realizó con la regla `W <- W + (lora_alpha / r) * B @ A` (escala 2,0) en fp32 y almacenamiento en bf16. El autor verificó que 252 módulos fueron modificados y que los 461 tensores restantes son idénticos byte a byte al base, con un total de 8.875.631.616 bytes de tensores, coincidente con el original.

## Capacidades

- Generación de texto y razonamiento multimodal (image-text-to-text), heredadas del base Qwen3-VL-4B-Thinking.
- Modo de razonamiento (*thinking*), indicado por el nombre del modelo base.
- Procesamiento de imágenes junto con instrucciones textuales en una única conversación.
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades de audio o vídeo: no disponible.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el modelo sirve como checkpoint de referencia para comparar la ablación sin recompensa de creencia frente al base y a otras variantes del mismo autor, midiendo el efecto de `tau_look` y del esquema de fases.
- Reproducción de experimentos de fusión LoRA: al documentarse la regla exacta de merge, el rango, el alpha y los hashes, permite validar pipelines de fusión y comprobar la integridad de los pesos.
- Evaluación de modelos visión-lenguaje pequeños: con 4,44 B de parámetros y 8,9 GB en bf16, es adecuado para pruebas comparativas en entornos con una sola GPU de gama alta.
- Prototipado de asistentes sobre imágenes: se puede usar para experimentar con descripción de imágenes, respuesta a preguntas visuales o extracción de información de capturas y documentos, siempre con validación humana dado el carácter experimental.
- Docencia y divulgación: útil para explicar en un blog o curso cómo se construye un modelo fusionado a partir de un base y un adaptador, y qué comprobaciones de integridad se realizan.
- Base para nuevos ajustes: al ser un checkpoint completo en safetensors y transformers, puede servir como punto de partida para fine-tuning adicional con LoRA sobre tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 9 GB solo para pesos (8,9 GB de repositorio), más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 16-24 GB para contextos moderados.
- Cuantización: no se publican versiones GGUF ni cuantizadas; habría que generarlas a partir de los safetensors con herramientas como llama.cpp o GPTQ/AWQ.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; en GPUs de 16 GB podría requerir cuantización u offloading.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090, RTX 3090 y RTX 4080 (16 GB) con cuidado en la longitud de contexto; en tarjetas de 8-12 GB solo con cuantización.
- Opciones de despliegue: transformers (biblioteca declarada), vLLM y TGI si el soporte de Qwen3-VL está disponible en esas herramientas; llama.cpp/Ollama requerirían conversión a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| richmondsin/grpo-posterior-no-belief-score-look-cost-qwen3-vl-4b-thinking | 4,44 B | no disponible | no disponible | Hugging Face, safetensors | Merge LoRA experimental, 0 descargas |
| Qwen/Qwen3-VL-4B-Thinking | ~4 B | no disponible en esta ficha | según Qwen (no verificada aquí) | Hugging Face, modelo oficial | Base del anterior, mantenido por el equipo Qwen |
| Otros Qwen3-VL de mayor tamano | no disponible | no disponible | no disponible | Hugging Face | Alternativas de la misma familia para comparar escalado |

La comparación cuantitativa de rendimiento no está disponible porque el autor no publica benchmarks y el modelo apenas tiene tracción en la plataforma.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación por terceros.
- Licencia no declarada: no se puede asumir uso comercial; hay que consultar la licencia del base Qwen3-VL-4B-Thinking y del adaptador antes de cualquier despliegue.
- Idiomas no declarados: el soporte multilingüe real es desconocido y depende del base.
- Riesgo de alucinación: inherente a los modelos generativos multimodales; la ablación sin recompensa de creencia podría afectar a la calibración de la confianza, aunque no se aportan métricas que lo confirmen.
- Sesgos: no documentados por el autor; se heredan los del base y los del dataset de ajuste, no descrito.
- La fusión en bf16 puede introducir diferencias numéricas menores respecto a la inferencia base + adaptador en tiempo de ejecución.
- No se publican configuraciones de cuantización ni plantillas de prompt específicas más allá de las del base.
- Longitud de contexto no documentada: no se debe asumir la del base sin verificarla en la configuración del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richmondsin/grpo-posterior-no-belief-score-look-cost-qwen3-vl-4b-thinking
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Thinking
- README del base incluido en el repo: `README.base.md` (referenciado en la model card)
- Informe de fusión: `MERGE-REPORT.json` (referenciado en la model card)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
