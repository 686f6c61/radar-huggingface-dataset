# richmondsin/Ministral-3-14B-Instruct-2512-Post-Reasoning

## Resumen

Ministral-3-14B-Instruct-2512-Post-Reasoning es un ajuste fino supervisado del modelo Mistral 3 de 14B de Mistral AI, publicado por el autor independiente richmondsin. El modelo aplica la técnica descrita en el paper "Post-Reasoning: Improving the Performance of Non-Thinking Models at Negligible Cost" (arXiv:2605.06165), que entrena al modelo para emitir primero la respuesta final y justificarla después, de modo que la respuesta puede leerse y detenerse antes de que se generen los tokens de justificación. El objetivo es mejorar el rendimiento de modelos que no tienen modo de razonamiento explícito (non-thinking) con un coste computacional adicional mínimo en inferencia.

El modelo parte de la arquitectura Mistral 3 multimodal (image-text-to-text) y conserva la licencia Apache 2.0 del modelo base. El ajuste se realizó mediante LoRA (r 16, alpha 32, dropout 0.05) sobre problemas de NuminaMath con justificaciones post-respuesta auto-destiladas, y posteriormente se fusionó en los pesos base en bf16. El checkpoint resultante tiene 13.945.031.680 parámetros y un tamaño de repositorio de 27,9 GB.

La relevancia de este modelo es metodológica más que de rendimiento bruto: demuestra que es posible mejorar la calidad de las respuestas de un modelo instruct sin añadir tokens de cadena de pensamiento antes de la respuesta, lo que reduce la latencia y el coste de generación en producción. Está pensado para desarrolladores e investigadores interesados en técnicas de alineación eficientes y en la evaluación de estrategias de razonamiento post-hoc.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Mistral 3 (image-text-to-text), ajuste LoRA fusionado |
| Parametros totales | 13.945.031.680 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el autor no detalla cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se basa en Mistral 3 de 14B en su variante Instruct-2512, una arquitectura transformer multimodal capaz de procesar entradas de imagen y texto (pipeline image-text-to-text). Sobre ese modelo base se aplicó un ajuste fino supervisado (SFT) con LoRA de rango 16, alpha 32 y dropout 0.05, con una tasa de aprendizaje de 2e-5, 3 épocas y schedule coseno. Los adaptadores se fusionaron posteriormente en los pesos base en bf16, dando lugar al checkpoint final.

Los datos de entrenamiento son problemas de NuminaMath acompañados de justificaciones post-respuesta auto-destiladas (fichero local `post_reflective_data/<model>_numina_v4.json`). La innovación clave es la función de pérdida: se enmascara tanto el prompt como la respuesta, de modo que el modelo solo aprende a generar la justificación que sigue a la respuesta. En inferencia, el modelo emite primero "Answer: ..." y después "Explanation: ...", lo que permite detener la generación en el marcador de fin de respuesta (`stop=["Explanation"]`) y evitar los tokens de justificación cuando no se necesitan. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones, heredadas del modelo base Ministral-3-14B-Instruct-2512.
- Razonamiento post-hoc: emite la respuesta final antes de la justificación, lo que permite lectura temprana y parada controlada.
- Procesamiento de imagen y texto (pipeline image-text-to-text declarado en los tags del modelo).
- Capacidad matemática reforzada por el entrenamiento sobre NuminaMath.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con vLLM para despliegue.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de técnicas de alineación eficiente: investigadores pueden reproducir el experimento del paper comparando el modelo base con esta versión post-reasoning para medir la mejora en precisión sin coste adicional de tokens de razonamiento.
- Razonamiento matemático con latencia controlada: en pipelines de resolución de problemas, se puede detener la generación en el marcador de fin de respuesta para obtener solo el resultado, reduciendo el coste frente a modelos con cadena de pensamiento previa.
- Generación de respuestas con justificación auditable: en entornos donde se exige trazabilidad, el modelo produce la respuesta y una explicación posterior que puede registrarse para revisión.
- Asistentes conversacionales de bajo coste: al no generar tokens de razonamiento antes de la respuesta, el modelo reduce el tiempo hasta el primer token útil en aplicaciones de chat.
- Integración en vLLM para servicios de inferencia: el autor documenta el uso directo con `vllm.LLM` y `SamplingParams`, lo que facilita su despliegue en servidores de producción.
- Investigación en modelos multimodales: al heredar la arquitectura Mistral 3 image-text-to-text, puede emplearse en tareas que combinan imagen y texto, aunque el ajuste se centró en matemáticas.
- Fine-tuning posterior: al ser Apache 2.0 y estar en safetensors, sirve como punto de partida para nuevos ajustes con LoRA sobre dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 28 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 32-40 GB.
- GPU recomendadas para bf16: A100 40/80 GB, H100 80 GB, L40S 48 GB.
- En cuantización de 8 bits: alrededor de 14-16 GB, viable en RTX 4090 (24 GB) y A6000 (48 GB).
- En cuantización de 4 bits: alrededor de 8-10 GB, viable en RTX 3090/4090 y GPUs consumer de 12 GB o más, aunque el autor no publica pesos cuantizados oficiales.
- Opciones de despliegue: vLLM (documentado por el autor), transformers; llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ministral-3-14B-Instruct-2512-Post-Reasoning | 13,9B | no disponible | Apache 2.0 | Ajuste post-reasoning sobre Mistral 3; sin benchmarks publicados |
| mistralai/Ministral-3-14B-Instruct-2512 (base) | ~14B | no disponible | Apache 2.0 | Modelo original de Mistral AI; referencia directa del ajuste |
| Mistral Small 3 (24B) | 24B | no disponible | Apache 2.0 | Alternativa de mayor tamaño de la misma familia; no comparable directamente por escala |
| Modelos instruct de 13-14B con thinking mode | ~13-14B | no disponible | variable | Alternativas con cadena de pensamiento previa, mayor coste de inferencia |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer diferencias cuantitativas con estos modelos.

## Limitaciones y advertencias

- El modelo no publica benchmarks propios; no hay evidencia cuantitativa de mejora frente al modelo base en la información disponible.
- El ajuste se realizó exclusivamente sobre NuminaMath, por lo que el sesgo hacia problemas matemáticos puede afectar a otros dominios.
- El formato de salida esperado ("Answer: ... Explanation: ...") requiere prompts y paradas específicas; un uso incorrecto puede degradar la calidad de las respuestas.
- No se detallan los idiomas soportados; el entrenamiento con NuminaMath es predominantemente en inglés, lo que puede limitar el rendimiento en castellano.
- Riesgo de alucinación inherente a los modelos generativos, no mitigado específicamente en este ajuste.
- El autor es independiente y el modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay validación comunitaria.
- Aunque la licencia es Apache 2.0, se recomienda verificar los términos del modelo base Mistral 3 para uso comercial.
- El repositorio ocupa 27,9 GB, lo que exige almacenamiento y ancho de banda considerables para su descarga.

## Enlaces

- Hugging Face: https://huggingface.co/richmondsin/Ministral-3-14B-Instruct-2512-Post-Reasoning
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512
- Paper: https://arxiv.org/abs/2605.06165
- Repositorio de código: https://github.com/richmondsin/Post-Reasoning
