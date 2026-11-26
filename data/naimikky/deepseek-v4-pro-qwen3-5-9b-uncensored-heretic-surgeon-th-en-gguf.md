# naimikky/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Surgeon-TH-EN-GGUF

## Resumen

El modelo identificado en Hugging Face como `naimikky/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Surgeon-TH-EN-GGUF` es un artefacto publicado por el usuario naimikky que, por su denominación, parece ser una cuantización en formato GGUF de una fusión o derivado de modelos Qwen (etiquetado como "Qwen3.5-9B") con modificaciones orientadas a eliminar restricciones de alineación ("uncensored", "heretic"). El nombre también incorpora referencias a "DeepSeek-V4-Pro" y a un supuesto ajuste "Surgeon-TH-EN", lo que sugiere un proceso de merging o fine-tuning sobre una base de aproximadamente 8.000 millones de parámetros.

El dato verificable más sólido es el recuento de parámetros en safetensors: 7.982.875.648 parámetros, es decir, cerca de 8B, coherente con la familia Qwen de escala 8-9B. El repositorio ocupa 4,9 GB y contiene pesos en formato GGUF, lo que indica que está pensado para inferencia local con llama.cpp u otros motores compatibles. No se dispone de información sobre el pipeline, la licencia ni los idiomas declarados en la ficha de Hugging Face.

La relevancia de este artefacto es limitada y fundamentalmente práctica: se trata de una publicación con cero descargas y un único "like" en el momento de la consulta, sin documentación técnica asociada, sin model card descriptiva y sin benchmarks. Cualquier evaluación rigurosa debe tratar la denominación como no verificada y considerar el modelo como un experimento de la comunidad más que como un lanzamiento oficial de DeepSeek o de Alibaba (Qwen).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (presumiblemente transformer denso, derivado de la familia Qwen; no confirmado) |
| Parametros totales | 7.982.875.648 (según safetensors) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos GGUF, pero no se detallan los niveles Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | No disponible (el sufijo "TH-EN" sugiere tailandés e inglés, sin confirmar) |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, los datos de entrenamiento, el número de tokens procesados ni las técnicas de alineación empleadas. El nombre del repositorio sugiere una combinación de elementos: una base Qwen de ~9B, una posible influencia o merging con materiales etiquetados como "DeepSeek-V4-Pro", y un ajuste denominado "heretic" y "Surgeon-TH-EN". El término "heretic" se asocia en la comunidad a métodos de ablación de dirección (direction ablation) que eliminan la negativa a responder, mientras que "Surgeon" podría referirse a una técnica de edición de pesos o de merging selectivo.

No hay evidencia verificable de que exista un modelo oficial llamado "DeepSeek-V4-Pro" ni "Qwen3.5-9B"; las denominaciones parecen construidas por el autor del repositorio. Tampoco se documenta si hubo RLHF, DPO, SFT o alguna innovación técnica como decodificación especulativa o atención lineal. Todo lo relativo al proceso de entrenamiento debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional: el tag "conversational" indica que el modelo está orientado a diálogo multi-turno, aunque no se especifica la plantilla de chat utilizada.
- Presunta capacidad multilingüe tailandés-inglés: el sufijo "TH-EN" del nombre apunta a un ajuste o especialización en esos dos idiomas, sin documentación que lo confirme.
- Eliminación de rechazos ("uncensored"): por el etiquetado, se espera que el modelo no aplique negativas de seguridad ante peticiones sensibles, lo que constituye una capacidad declarada pero no verificada.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede servirse mediante la infraestructura de Inference Endpoints de Hugging Face o motores compatibles con la API de OpenAI.
- Capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio: no disponibles.
- Modo de razonamiento explícito ("thinking mode"): no disponible.

## Casos de uso

- Inferencia local en equipos de consumo: al tratarse de un GGUF de ~8B parámetros y 4,9 GB de repositorio, puede ejecutarse con llama.cpp u Ollama en GPUs de 8-12 GB de VRAM o incluso en CPU con cuantizaciones agresivas, lo que lo hace adecuado para pruebas offline.
- Experimentación con edición de alineación: investigadores interesados en estudiar los efectos de técnicas de ablación de dirección ("heretic") pueden comparar las respuestas de este modelo frente a su base original para analizar cómo cambia la distribución de negativas.
- Prototipado de asistentes conversacionales en tailandés e inglés: si el ajuste TH-EN es real, podría emplearse para generar borradores de diálogo en esos idiomas, siempre con revisión humana dada la ausencia de evaluación.
- Evaluación de riesgos de seguridad: equipos de red teaming pueden usar el modelo como caso de estudio de modelos sin alineación para diseñar filtros y clasificadores de contenido.
- Generación de texto creativo sin restricciones temáticas: escritura de ficción o guiones donde el autor busca evitar negativas del modelo, asumiendo la responsabilidad legal y ética del contenido generado.
- Pruebas de integración con endpoints compatibles: desarrolladores que necesiten validar pipelines con la API de OpenAI pueden desplegarlo como servidor local y comprobar la compatibilidad de su código.
- Benchmarking de cuantizaciones GGUF: útil para medir la degradación de calidad entre distintos niveles de cuantización de una base de ~8B, aunque la falta de documentación sobre los niveles incluidos limita su utilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~8B parámetros, una cuantización Q4_K_M requiere aproximadamente 5-6 GB de VRAM; Q5_K_M en torno a 6-7 GB; Q8_0 alrededor de 9-10 GB. Estas cifras son estimaciones estándar para modelos de ese tamaño, no datos publicados por el autor.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para cuantizaciones altas; A10G, L4, A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando cuantizaciones Q4 o inferiores; también puede ejecutarse en CPU con llama.cpp, aunque con latencia elevada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores compatibles con la API de OpenAI (por ejemplo, llama.cpp server o vLLM con soporte GGUF limitado). No se dispone de confirmación de soporte en TGI.
- Latencia y throughput: no disponibles. Como referencia orientativa para un 8B en Q4 sobre una RTX 4090, cabría esperar decenas de tokens por segundo, pero no hay mediciones publicadas para este artefacto concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| naimikky/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Surgeon-TH-EN-GGUF | ~8B | No disponible | No disponible | GGUF | Hugging Face, 0 descargas |
| Qwen2.5-7B-Instruct (Alibaba) | 7,6B | 32.768 tokens (hasta 131.072 con YaRN) | Apache 2.0 | safetensors, GGUF | Amplia, documentada y con benchmarks |
| Meta Llama 3.1 8B Instruct | 8B | 131.072 tokens | Llama 3.1 Community License | safetensors, GGUF | Amplia, documentada y con benchmarks |
| Mistral 7B Instruct v0.3 | 7,2B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Amplia, documentada y con benchmarks |

La comparación con modelos oficiales es desfavorable en todos los ejes verificables: el artefacto de naimikky carece de model card, licencia, idiomas declarados, benchmarks y comunidad. Los modelos de Alibaba, Meta y Mistral ofrecen contexto documentado, licencias claras y evaluaciones públicas, lo que los hace preferibles para cualquier uso en producción.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card, ficha técnica ni descripción del proceso de entrenamiento, lo que impide evaluar su comportamiento real.
- Licencia no disponible: no puede determinarse si el uso comercial está permitido; en la práctica, usar este modelo en producción conlleva un riesgo legal significativo.
- Riesgo elevado de alucinación: sin benchmarks ni evaluación, no hay garantía de calidad factual; los ajustes "uncensored" suelen degradar la calibración y aumentar la generación de contenido falso.
- Contenido sin filtros de seguridad: el etiquetado "uncensored" y "heretic" implica que el modelo probablemente genera contenido dañino, ilegal o explícitamente sensible sin negativas, lo que exige controles externos si se despliega con usuarios.
- Idiomas no confirmados: el sufijo "TH-EN" sugiere tailandés e inglés, pero no hay evidencia de que el castellano esté bien soportado.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin conocer la ventana real.
- Denominación engañosa: los nombres "DeepSeek-V4-Pro" y "Qwen3.5-9B" no corresponden a lanzamientos oficiales conocidos, por lo que no debe citarse como un modelo de DeepSeek o Qwen.
- Repositorio sin tracción: cero descargas y un único "like" indican que no ha sido validado por la comunidad; no hay informes de terceros sobre su funcionamiento.
- Posible violación de licencias upstream: si el modelo deriva de Qwen o Llama, la redistribución sin licencia explícita puede incumplir los términos de los modelos base.

## Enlaces

- Hugging Face: https://huggingface.co/naimikky/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Surgeon-TH-EN-GGUF
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
