# Mobsal/MedPsy-v3.4

## Resumen

MedPsy v3.4 es un ajuste fino (fine-tune) de dominio clínico sobre la arquitectura Qwen3-1.7B, publicado por el autor Mobsal. El modelo está pensado para inferencia local y en dispositivo (on-device), y se distribuye principalmente en formato GGUF cuantizado a Q4_K_M (1,11 GB) y en formato ExecuTorch (.pte, 1,28 GB), lo que lo hace desplegable en portátiles y hardware de gama de consumo sin GPU dedicada de gran capacidad. Su orientación declarada es la respuesta a preguntas médicas y experimentos de apoyo a la decisión clínica, no la producción clínica real.

El modelo cuenta con 1.720.574.976 parámetros totales, una longitud de contexto declarada de 40.960 tokens y soporte para inglés y francés. La arquitectura subyacente es un transformer denso de 28 capas, con dimensión oculta de 2048, FFN de 6144 y atención GQA con 16 cabezas de atención y 8 cabezas KV. La licencia es Apache 2.0, lo que permite uso comercial, aunque el propio autor restringe explícitamente el uso previsto a investigación y demostración.

Su relevancia actual radica en la combinación de un tamaño reducido (1,7B), un contexto nominal amplio y un empaquetado orientado a despliegue local (llama.cpp, Ollama, LM Studio, ExecuTorch), lo que lo sitúa en la categoría de modelos pequeños especializados para entornos con restricciones de privacidad o de cómputo. La contrapartida es la ausencia de datos publicados de benchmarks y el escaso historial de adopción (15 descargas en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), 28 capas, hidden 2048, FFN 6144, GQA 16 cabezas / 8 KV |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens (recomendado en la práctica: 8.192 por coste de KV-cache) |
| Tipos de cuantizacion | GGUF Q4_K_M (1,11 GB); ExecuTorch .pte (1,28 GB); tokenizer en safetensors/Transformers |
| Idiomas soportados | Inglés (en), francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, ExecuTorch (.pte), tokenizer.json / tokenizer_config.json |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso derivado de Qwen3-1.7B, con 28 capas, dimensión oculta de 2048, capa feed-forward de 6144 y atención con grouped-query attention (16 cabezas de consulta y 8 cabezas clave-valor). El modelo base Qwen3 incorpora modos de razonamiento (thinking) y no thinking, aunque la model card de este fine-tune no detalla si dichos modos se preservan ni cómo se activan. El contexto declarado es de 40.960 tokens.

No se dispone de información sobre el dataset de ajuste fino: número de tokens, composición, procedencia de los datos clínicos, ni si se aplicaron técnicas de RLHF, DPO o supervisión humana. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El autor solo indica que se trata de un fine-tune de dominio clínico y publica los parámetros de muestreo por defecto incrustados en los metadatos del GGUF: temperatura 0,6, top_p 0,95, top_k 20.

## Capacidades

- Generación de texto conversacional en inglés y francés, orientada a preguntas y respuestas de dominio médico.
- Respuesta a consultas clínicas descriptivas (por ejemplo, cuadros sintomáticos expresados en lenguaje natural).
- Soporte de plantilla de chat integrada en el GGUF, lo que permite conversaciones multi-turno.
- Compatibilidad con servidor OpenAI-compatible mediante `llama-server`, lo que habilita integración con clientes que usan la API de OpenAI.
- Ejecución en dispositivo mediante el runtime de ExecuTorch (.pte).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modos de razonamiento explícitos en la información disponible.

## Casos de uso

- Asistente de consulta médica local para profesionales: el modelo puede responder preguntas descriptivas sobre cuadros clínicos en inglés o francés ejecutándose íntegramente en un portátil, lo que evita enviar datos de pacientes a servicios en la nube y encaja con requisitos de privacidad.
- Prototipado de sistemas de triaje conversacional: con 8.192 tokens de contexto práctico se pueden mantener diálogos multi-turno con historial de síntomas, útil para validar flujos de triaje antes de invertir en modelos mayores.
- Investigación en NLP clínico en francés: al ser uno de los pocos fine-tunes pequeños con soporte declarado de francés, sirve para experimentos de evaluación de calidad de respuesta en ese idioma.
- Despliegue en dispositivos sin GPU (móvil, Raspberry Pi, portátiles básicos): el archivo Q4_K_M de 1,11 GB y la exportación ExecuTorch permiten inferencia en CPU y en hardware embebido.
- Generación de resúmenes de notas clínicas de ejemplo con datos sintéticos: adecuado para demostraciones y material docente, no para datos reales de pacientes.
- Integración en pipelines de evaluación comparativa: al exponer una API compatible con OpenAI vía `llama-server`, puede conectarse a frameworks de evaluación de LLMs para medir calidad en dominio médico.
- Chatbot educativo para estudiantes de medicina: respuestas de referencia con temperatura 0,6 para mantener respuestas relativamente deterministas en material de estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2,5 GB en Q4_K_M con contexto de 8.192 tokens; el KV-cache crece linealmente con el contexto hasta los 40.960 tokens nominales.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060); en A100/H100 el modelo está sobredimensionado para su tamaño y el cuello de botella sería el ancho de banda, no la memoria.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo modernas con 4 GB o más; también en CPU pura.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, llama-cpp-python, runtime de ExecuTorch.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MedPsy v3.4 | 1,72B | 40.960 | en, fr | Apache 2.0 | GGUF, ExecuTorch |
| Qwen3-1.7B (base) | 1,72B | 32.768 (declarado por Qwen) | multilingüe | Apache 2.0 | safetensors, GGUF |
| Meditron-7B | 7B | 4.096 | en | Llama 2 (uso restringido) | safetensors, GGUF |
| BioMistral-7B | 7B | 8.192 | en, fr | Apache 2.0 | safetensors, GGUF |

La comparación con Qwen3-1.7B es directa porque MedPsy es un fine-tune del mismo; las diferencias de rendimiento en dominio médico no están documentadas. Frente a Meditron-7B y BioMistral-7B, MedPsy es cuatro veces más pequeño, lo que reduce requisitos de hardware pero también, previsiblemente, capacidad de razonamiento clínico; no hay benchmarks que permitan cuantificar esa diferencia.

## Limitaciones y advertencias

- No es un dispositivo médico: el autor declara explícitamente que el modelo es para investigación y demostración, y que no debe usarse para decisiones clínicas, diagnóstico ni tratamiento.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su calidad en tareas médicas ni de su comportamiento frente al modelo base.
- Riesgo elevado de alucinación en dominio clínico: un modelo de 1,7B ajustado con datos no documentados puede generar información médica plausible pero incorrecta.
- Cobertura lingüística limitada a inglés y francés; no hay soporte declarado de castellano.
- El contexto nominal de 40.960 tokens no es práctico en hardware modesto: el KV-cache crece linealmente y el autor recomienda limitar a 8.192 tokens.
- Dataset de entrenamiento no documentado: se desconoce la procedencia, licencia y sesgos de los datos clínicos usados en el ajuste fino.
- Licencia Apache 2.0 permite uso comercial, pero el uso previsto declarado por el autor es solo investigación; conviene revisar implicaciones regulatorias (MDR, FDA) antes de cualquier despliegue en salud.
- Adopción muy baja (15 descargas, 0 likes): no hay comunidad que haya validado el modelo ni reportado problemas.
- No se documenta soporte de tool calling ni de agentes, lo que limita su integración en sistemas automatizados complejos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mobsal/MedPsy-v3.4
- Repositorio de Qwen3 (modelo base): https://github.com/QwenLM/Qwen3
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- ExecuTorch: https://github.com/pytorch/executorch
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
