# pranil00/ONIX-Qwen2.5-Coder-1.5B-Instruct-GGUF

## Resumen

ONIX-Qwen2.5-Coder-1.5B-Instruct-GGUF es una cuantización en formato GGUF del modelo Qwen2.5-Coder-1.5B-Instruct, publicada por el usuario pranil00 bajo el paraguas de la comunidad ONIX. El modelo base es un transformer decoder-only de 1.777 millones de parámetros (1,78B) desarrollado originalmente por Alibaba Qwen, especializado en generación de código y tareas de instrucción. Esta versión concreta aplica una cuantización Q5_K_M (5,5 bits por peso) que reduce el peso de los pesos de 3,48 GB en FP16 a 1,19 GB, lo que supone una compresión del 65,6%.

La relevancia de esta ficha radica en que permite ejecutar un modelo de código competente en hardware de consumo muy modesto: según la model card, requiere 1,33 GB de memoria unificada en Apple Silicon, 2,69 GB de VRAM dedicada en GPUs NVIDIA y 3,33 GB de RAM en CPU. El autor declara una retención de calidad del 97,5 % respecto al modelo original en FP16. El repositorio ocupa 2,3 GB y no registra descargas ni likes en el momento de la consulta.

Se trata, por tanto, de un artefacto de despliegue más que de un modelo nuevo: no aporta arquitectura ni entrenamiento propios, sino una conversión optimizada para inferencia local con llama.cpp, Ollama, LM Studio y el runner propietario run-any-model.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parametros totales | 1.777.029.120 (1,78B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (ventana óptima declarada en GPU/Apple Silicon); 4.096 tokens en CPU |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); el repo solo distribuye esta variante |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Qwen--Qwen2.5-Coder-1.5B-Instruct-Q5_K_M.gguf`, 1,19 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-Coder-1.5B-Instruct original: un transformer decoder-only con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos SSM. El modelo base fue entrenado por Alibaba Qwen con un pipeline que incluye preentrenamiento sobre corpus de código y texto, seguido de ajuste supervisado y optimización por preferencias para comportamiento de instrucción. La model card de esta cuantización no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación empleadas; esos datos corresponden a la ficha del modelo base y no se reproducen aquí.

La innovación técnica de esta publicación no está en el modelo, sino en el proceso de conversión: el autor emplea la herramienta run-any-model, descrita como un motor de optimización LLM adaptativo y consciente del dispositivo. El informe de telemetría incluido en la model card reporta la aceleración de las 28 capas del modelo en Metal, un búfer de KV cache de 112 MB en FP16 y una retención de calidad estimada del 97,5 % frente a la línea base FP16. No se documenta ninguna modificación de los pesos más allá de la cuantización, ni técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de código en múltiples lenguajes de programación, heredada del entrenamiento especializado del modelo base Qwen2.5-Coder.
- Razonamiento y resolución de problemas de programación, incluyendo explicación de código y depuración.
- Seguimiento de instrucciones conversacionales multi-turno, gracias al ajuste Instruct del modelo original.
- Generación de texto general y tareas de matemáticas básicas, dentro de las capacidades del modelo base de 1,5B.
- Ejecución local en CPU, GPU NVIDIA y Apple Silicon mediante llama.cpp, Ollama, LM Studio, Jan y Text-Generation-WebUI.
- Compatibilidad con el runner run-any-model para sesiones de chat en terminal.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para esta cuantización.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo thinking explícito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de código en local para desarrolladores con hardware modesto: con 1,19 GB de pesos y 2,69 GB de VRAM en GPU NVIDIA, el modelo cabe en portátiles con GPUs de gama media y permite autocompletado y explicación de fragmentos sin conexión a servicios en la nube.
- Prototipado rápido de pipelines de generación de código: la integración directa con Ollama y llama.cpp permite levantar un endpoint de inferencia en minutos para validar ideas antes de migrar a modelos mayores.
- Educación y aprendizaje de programación: el modelo puede explicar conceptos, comentar código de ejemplo y proponer ejercicios, ejecutándose en equipos de estudiantes con Apple Silicon (1,33 GB de memoria unificada) sin coste de API.
- Automatización de tareas de refactorización sencilla en CI/CD: para transformaciones acotadas de código (renombrado, conversión de estilos, generación de tests unitarios básicos) donde el coste de un modelo mayor no está justificado.
- Generación de documentación técnica y docstrings: el modelo puede producir comentarios y descripciones de funciones a partir del código fuente, una tarea de bajo riesgo que tolera bien la cuantización Q5_K_M.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse íntegramente en local, es adecuado para procesar código propietario que no puede enviarse a APIs externas.
- Chat de soporte técnico sobre una base de código concreta: con una ventana de 8.192 tokens en GPU, puede mantener conversaciones multi-turno incorporando fragmentos relevantes del repositorio en el contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye el informe de telemetría de cuantización, que compara el artefacto con su línea base FP16 en métricas de memoria y tamaño, no en calidad de tarea:

| Metrica | Baseline (FP16) | Cuantizado (Q5_K_M) | Cambio |
|---|---|---|---|
| Precision | 16,0 bits/param | 5,5 bits/param | -65,6 % |
| Tamano de pesos | 3,48 GB | 1,19 GB | -65,6 % |
| Bufer KV cache | 112,0 MB (FP16) | 112,0 MB (FP16) | Optimizado |
| RAM residente total | 3,61 GB | 1,33 GB | -63,1 % |
| Calidad estimada | 100,0 % baseline | 97,5 % retenida | -2,5 % |
| Aceleracion de capas | 0 % (riesgo de fallo) | 28/28 capas | Optimo |

No se dispone de resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba de calidad para esta cuantización concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: 2,69 GB de VRAM dedicada en GPUs NVIDIA con la cuantización Q5_K_M y contexto de 8.192 tokens.
- Memoria unificada en Apple Silicon: 1,33 GB en chips M1/M2/M3/M4/M5 con aceleración Metal nativa.
- RAM en CPU: 3,33 GB libres en Windows/Linux con soporte AVX2/AVX-512, con ventana de contexto óptima reducida a 4.096 tokens.
- GPUs recomendadas: el autor cita las series RTX 30/40/50 de NVIDIA; no se especifican modelos concretos como A100 o H100, aunque por tamaño cabría en cualquier GPU con más de 3 GB de VRAM.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 3 GB de VRAM, incluyendo gamas de entrada y portátiles.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y el CLI run-any-model.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card no incluye tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-Qwen2.5-Coder-1.5B-Instruct-GGUF (Q5_K_M) | 1,78B | 8.192 (GPU) / 4.096 (CPU) | GGUF | Apache 2.0 | Cuantización Q5_K_M, 1,19 GB |
| Qwen2.5-Coder-1.5B-Instruct (original) | 1,78B | 32.768 tokens (según ficha del modelo base) | Safetensors | Apache 2.0 | Pesos FP16/BF16, 3,48 GB; referencia de calidad |
| Qwen2.5-Coder-7B-Instruct | 7B | 32.768 tokens | Safetensors, GGUF | Apache 2.0 | Mayor calidad de código, requiere ~5-8 GB en Q4 |
| DeepSeek-Coder-1.3B-Instruct | 1,3B | 16.384 tokens | Safetensors, GGUF | DeepSeek License | Alternativa de tamaño similar centrada en código |

La comparación con el modelo base es la más directa: esta cuantización reduce el peso a un tercio y la memoria residente en un 63 %, a cambio de una ventana de contexto declarada menor (8.192 frente a los 32.768 del original) y una pérdida de calidad estimada del 2,5 %. Frente a Qwen2.5-Coder-7B, esta variante sacrifica capacidad de razonamiento a cambio de ejecutarse en hardware mucho más limitado.

## Limitaciones y advertencias

- El tamaño de 1,78B impone un techo claro de razonamiento: es probable que falle en tareas de código complejas, arquitecturas de varios archivos o problemas matemáticos que un modelo de 7B o superior resolvería.
- La cuantización Q5_K_M introduce una pérdida de calidad estimada del 2,5 % según el propio autor; esta cifra es una estimación del pipeline de conversión, no una medición con benchmarks independientes.
- La ventana de contexto declarada en la model card (8.192 tokens en GPU, 4.096 en CPU) es inferior a la del modelo base; no se documenta si es una limitación real del artefacto o una recomendación operativa.
- Los idiomas soportados no se documentan en la información disponible; el modelo base Qwen2.5 tiene cobertura multilingüe, pero no se confirma para esta cuantización.
- Riesgo de alucinación inherente a los modelos de 1,5B: puede generar APIs inexistentes, imports falsos o código sintácticamente plausible pero incorrecto. Requiere validación y tests en cualquier uso en producción.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del modelo base, no auditados aquí.
- La licencia Apache 2.0 permite uso comercial, pero la model card incluye una cláusula de exención de responsabilidad total del autor y de la comunidad ONIX sobre cualquier salida generada.
- El repositorio no registra descargas ni likes, y la fecha de creación es posterior a la de la consulta de datos; se trata de un artefacto sin validación comunitaria.
- No se ofrecen variantes de cuantización alternativas (Q4, Q8, etc.) en el repositorio, lo que limita el ajuste fino entre tamaño y calidad.
- El soporte de tool calling y de agentes no está confirmado para esta conversión, aunque el modelo base lo soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Qwen2.5-Coder-1.5B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
- Repositorio run-any-model: https://github.com/PranilShah-08/run-any-model
