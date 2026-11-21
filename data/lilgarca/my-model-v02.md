# Lilgarca/my-model-v02

## Resumen

Lilgarca/my-model-v02 es un modelo multimodal "any-to-any" desarrollado por el usuario independiente Lilgarca, publicado en Hugging Face bajo una arquitectura propia denominada "cyrah". El modelo se presenta como capaz de procesar y generar texto, imagen, audio y vídeo, además de incluir capacidades de razonamiento y tool calling. Está entrenado desde cero ("from-scratch"), lo que lo diferencia de la mayoría de modelos disponibles, que parten de pesos preentrenados de terceros.

Con 247.622.828 parámetros totales (aproximadamente 247,6 millones), se trata de un modelo de tamaño compacto, muy por debajo de los grandes modelos multimodales actuales. El repositorio ocupa 481,4 GB, un tamaño desproporcionado respecto al número de parámetros, lo que sugiere que la mayor parte del espacio corresponde a artefactos auxiliares (probablemente codificadores de imagen, audio y vídeo, datasets de entrenamiento o checkpoints intermedios) y no a los pesos del transformer principal.

El modelo soporta español e inglés, está etiquetado como compatible con endpoints y conversational, y su acceso es restringido (gated), requiriendo aceptar condiciones en Hugging Face. La licencia no está disponible en la información proporcionada, lo que supone una limitación importante para evaluar su uso comercial. A pesar de su reducido tamaño, la propuesta de cubrir cuatro modalidades de entrada y salida con solo 247 millones de parámetros invita a una evaluación prudente de sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | cyrah (arquitectura propia, from-scratch); transformer multimodal any-to-any |
| Parametros totales | 247.622.828 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors y GGUF) |
| Idiomas soportados | es, en |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura se denomina "cyrah" y se describe como una arquitectura propia entrenada desde cero, con pipeline any-to-any. Las etiquetas del modelo indican soporte para texto, imagen, audio y vídeo, tanto en entrada como en salida, además de razonamiento y tool calling. No se dispone de información detallada sobre el tipo de bloques (transformer denso, MoE, híbrido SSM/attention), la composición exacta del encoder/decoder multimodal ni la estrategia de fusión de modalidades.

Tampoco se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO u otras técnicas de alineación, ni innovaciones concretas como decodificación especulativa o atención lineal. El tamaño del repositorio (481,4 GB) frente a los 247,6 millones de parámetros sugiere la presencia de componentes auxiliares pesados o artefactos de entrenamiento, pero no se detalla su naturaleza en la información disponible.

## Capacidades

- Generación de texto conversacional en español e inglés.
- Generación de imagen a partir de texto (text-to-image).
- Generación de audio a partir de texto (text-to-audio).
- Generación de vídeo a partir de texto (text-to-video).
- Procesamiento de entradas multimodales (audio, imagen, vídeo) según la etiqueta any-to-any.
- Razonamiento (etiqueta "reasoning"), sin detalle sobre modo thinking explícito.
- Tool calling / function calling (etiqueta "tool-calling").
- Extracción de características (feature-extraction).
- Compatible con endpoints de Hugging Face (endpoints_compatible).
- Orientado a uso conversacional (conversational).

## Casos de uso

- Asistentes conversacionales bilingües: el modelo puede gestionar diálogos multi-turno en español e inglés, adecuado para prototipos de atención al cliente o asistentes internos donde el coste computacional debe ser bajo.
- Generación de imágenes para prototipado rápido: útil para crear bocetos o ilustraciones de baja fidelidad en flujos de diseño, aunque la calidad esperable con 247 millones de parámetros es limitada frente a modelos dedicados.
- Síntesis de voz para accesibilidad: la capacidad text-to-audio permite generar locuciones en aplicaciones de lectura de textos o avisos, siempre que la calidad del audio resultante sea suficiente tras evaluación.
- Clips de vídeo cortos para demostraciones: generación de vídeo a partir de texto para contenido promocional breve o pruebas de concepto, con expectativas moderadas dada la escala del modelo.
- Pipelines de razonamiento con herramientas: el soporte de tool calling permite integrar el modelo en agentes que consulten APIs o bases de datos, usando el modelo como orquestador ligero.
- Extracción de características y clasificación: la tarea feature-extraction permite usar el modelo como encoder para búsqueda semántica o clustering de documentos en español e inglés.
- Investigación en arquitecturas from-scratch: útil como base para estudiar el diseño "cyrah" y experimentar con modelos multimodales pequeños en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 247,6 millones de parámetros, los pesos en FP16 ocupan aproximadamente 0,5 GB; en cuantización de 8 bits, unos 0,25 GB; en 4 bits, unos 0,12 GB. A esto hay que sumar la memoria de los componentes multimodales (imagen, audio, vídeo), cuyo tamaño no se detalla y que podría elevar notablemente los requisitos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) debería poder alojar los pesos del transformer principal; para los módulos multimodales se recomienda al menos 8-16 GB de VRAM, aunque el dato exacto no está disponible.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPU con 8 GB o más, a falta de confirmar el coste de los componentes auxiliares.
- Opciones de despliegue: transformers (librería declarada), llama.cpp/Ollama para los pesos GGUF, y potencialmente vLLM o TGI si la arquitectura custom_code lo permite (no confirmado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lilgarca/my-model-v02 | 247,6 M | no disponible | texto, imagen, audio, vídeo | no disponible | gated en HF |
| Qwen2.5-Omni-7B | 7 B (aprox.) | 32 K (aprox.) | texto, audio, imagen, vídeo | Apache 2.0 (según versión) | abierto |
| AnyGPT | ~7 B | no disponible | texto, imagen, audio, música | investigación | abierto con condiciones |
| NExT-GPT | ~7 B | no disponible | texto, imagen, audio, vídeo | investigación | abierto con condiciones |

La comparación es orientativa: los modelos any-to-any abiertos de referencia se sitúan en el rango de 7.000 millones de parámetros, aproximadamente 28 veces el tamaño de my-model-v02. Esto implica que, aunque la propuesta modal es similar, la capacidad efectiva por modalidad será previsiblemente mucho menor. Los datos de contexto y licencia de my-model-v02 no están disponibles, lo que impide una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse el uso comercial; es imprescindible contactar con el autor o revisar las condiciones del acceso gated antes de cualquier despliegue en producción.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que añade fricción a la evaluación y reproducibilidad.
- Escala reducida: con 247,6 millones de parámetros, es esperable un rendimiento limitado en razonamiento complejo, código y generación multimodal de alta fidelidad; la calidad real no está validada por benchmarks públicos.
- Ausencia de benchmarks: no hay evidencia publicada de MMLU, HumanEval, GSM8K ni métricas multimodales, por lo que las afirmaciones de capacidad no son verificables.
- Riesgo de alucinación: inherente a los modelos generativos pequeños, especialmente en tareas de razonamiento y respuestas factuales.
- Sesgos: al estar entrenado desde cero por un autor individual, no se documentan procesos de filtrado de datos ni mitigación de sesgos.
- Idiomas limitados a español e inglés; el rendimiento fuera de estos idiomas no está garantizado.
- Arquitectura propietaria ("cyrah") con custom_code: requiere confiar en el código remoto del repositorio, lo que implica riesgos de seguridad y mantenimiento.
- Tamaño del repositorio (481,4 GB) desproporcionado respecto a los parámetros: la descarga completa es costosa y puede incluir artefactos no necesarios para inferencia.
- Sin datos de contexto: se desconoce la ventana máxima, lo que limita el diseño de aplicaciones con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lilgarca/my-model-v02
- Perfil del autor: https://huggingface.co/Lilgarca
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
