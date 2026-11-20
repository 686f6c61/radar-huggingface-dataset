# deer-sec/StagAI-CyberSecurity-26B-A4B-v2-VLM-GGUF-IQ4_NL

## Resumen

StagAI-CyberSecurity-26B-A4B-v2-VLM es un modelo de lenguaje multimodal (texto, imagen y video) especializado en análisis de ciberseguridad y razonamiento teórico avanzado, desarrollado por deer-sec. Se construye sobre la arquitectura MoE de Gemma-4-26B-A4B de Google mediante un ajuste fino con LoRA realizado con el framework MLX (`mlx_lm.lora`), tras el cual los pesos se fusionan con el modelo base y se restaura la torre de visión para conservar las capacidades multimodales que normalmente se pierden en el proceso de fusión.

El modelo está pensado como motor de inferencia para profesionales de seguridad, investigadores, analistas de SOC y administradores de sistemas en tareas de modelado de amenazas, evaluación de vulnerabilidades, interpretación de logs y respuesta a incidentes. Incorpora un modo de razonamiento profundo ("Thinking") que incrementa la latencia a cambio de deducciones paso a paso más elaboradas. La versión publicada en este repositorio es una cuantización GGUF IQ4_NL de 4 bits.

Con 25.233.142.046 parámetros totales y aproximadamente 4.000 millones activos por token (arquitectura MoE), el modelo ocupa 15,8 GB en el repositorio y se distribuye bajo licencia Apache 2.0. Soporta inglés, japonés y chino, además de contenido multilingüe, y su entrenamiento se apoya en dos datasets de ciberseguridad, uno de ellos específicamente en japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Gemma-4-26B-A4B), multimodal con torre de visión |
| Parametros totales | 25.233.142.046 |
| Parametros activos | Aproximadamente 4.000 millones (MoE, 128 expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_NL (4 bits) en este repositorio; existen variantes MLX Q8 y GGUF en la familia |
| Idiomas soportados | Multilingüe, inglés (en), japonés (ja), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); MLX Q8 en la familia StagAI-CyberSecurity-26B-A4B-v2-VLM |
| Pipeline | image-text-to-text |
| Modelo base | google/gemma-4-26b-a4b |
| Tamano del repositorio | 15,8 GB |
| Descargas | 1.824 |
| Fecha de creacion | 2026-10-17 |
| Ultima actualizacion | 2026-10-28 |

## Arquitectura y entrenamiento

El modelo parte de Gemma-4-26B-A4B, un transformer de mezcla de expertos (MoE) con 128 expertos y enrutador que activa aproximadamente 4.000 millones de parámetros por token sobre un total de 25.230 millones. Sobre esta base se aplicó un ajuste fino con QLoRA (rango 4) usando `mlx_lm.lora` del framework MLX, y posteriormente se fusionaron los pesos LoRA en el modelo base con una técnica propia del autor orientada a evitar la degradación de pesos. Tras la fusión se restauró e integró de nuevo la torre de visión, que habitualmente se pierde en los procesos `mlx_lm.lora` / `mlx_lm.fuse`, de modo que el modelo conserva tanto el conocimiento de ciberseguridad como las capacidades de reconocimiento de imagen y vídeo.

Los datos de entrenamiento provienen de dos datasets: `deer-sec/deer_sec-japanese-cybersecurity-chatml-v2` (ciberseguridad en japonés, formato ChatML) y `AlicanKiraz0/Cybersecurity-Dataset-Fenrir-v2.1`. El autor documenta una auditoría estructural y de seguridad basada en dos comprobaciones matemáticas: descomposición en valores singulares (SVD) de la diferencia de pesos y análisis del vector de rechazo en el espacio de representación interna. Según los datos publicados, las capas inferiores (L00–L11) y la torre de visión presentan un cambio del 0,000%, las capas superiores de razonamiento (L12–L29) un cambio medio del 0,128% (0,163% en L=15), el enrutador MoE un cambio del 0,000% y el rango efectivo (stable rank) se sitúa en 1,41–1,83 con una concentración del 72,5% de la energía de actualización en las cuatro primeras direcciones singulares, coherente con el diseño QLoRA de rango 4. La similitud del vector de rechazo con el del modelo base es de 0,9976 de media (0,9994 en L=15) y la similitud con una abliteración es de 0,00032 (máximo 0,00203), lo que el autor presenta como evidencia de que no se ha eliminado el filtro de seguridad.

## Capacidades

- Generación de texto y razonamiento profundo en el dominio de ciberseguridad, con modo "Thinking" de deducción paso a paso.
- Análisis multimodal: interpretación de imágenes y vídeo, incluyendo diagramas de arquitectura de red, capturas de pantalla de SIEM y logs, e imágenes de capturas de paquetes.
- Modelado de amenazas, evaluación de vulnerabilidades y planificación de respuesta a incidentes.
- Interpretación de logs y correlación de eventos de seguridad.
- Capacidades multilingües en inglés, japonés y chino, además de contenido multilingüe general.
- Conversación multi-turno en formato chat (pipeline conversacional).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y multi-step reasoning más allá del modo Thinking: no disponible en la información proporcionada.

## Casos de uso

- Análisis de capturas de pantalla de SIEM y paneles de monitorización: el modelo recibe la imagen de un dashboard o de una alerta y extrae los indicadores relevantes, los interpreta en contexto y propone una hipótesis de incidente, aprovechando su torre de visión restaurada.
- Interpretación de diagramas de arquitectura de red: a partir de una imagen del esquema, el modelo puede señalar superficies de exposición, segmentos mal aislados y puntos únicos de fallo, útil en revisiones de diseño seguro previas a un despliegue.
- Triaje de alertas en un SOC: con conversaciones multi-turno, el analista pega logs y el modelo razona sobre la secuencia de eventos, clasifica la severidad y sugiere los siguientes pasos de investigación.
- Modelado de amenazas asistido: dado un descriptor de sistema o una captura de su arquitectura, el modelo genera un borrador de modelo de amenazas con activos, actores y vectores de ataque plausibles, que el equipo revisa y completa.
- Formación y concienciación: generación de escenarios de phishing, ejercicios de mesa y explicaciones didácticas de vulnerabilidades, con soporte en japonés e inglés para equipos internacionales.
- Análisis de imágenes de tráfico de red: interpretación de capturas de paquetes exportadas como imagen para una primera lectura rápida antes de un análisis con herramientas específicas.
- Asistencia en respuesta a incidentes: redacción de borradores de informes post-incidente y de runbooks a partir de la evidencia textual y visual aportada por el analista.

## Benchmarks y rendimiento

El autor informa de una puntuación media global de 90,00 en el benchmark CyberSec-Eval, con puesto número 27 en la clasificación general a fecha de 28 de octubre de 2026. No se han publicado en la información disponible resultados desglosados por tarea (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas detalladas frente a modelos similares.

| Benchmark | Resultado | Fecha |
|---|---|---|
| CyberSec-Eval (media global) | 90,00 (puesto 27) | 2026-10-28 |
| MMLU | no disponible | - |
| HumanEval | no disponible | - |
| GSM8K | no disponible | - |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF IQ4_NL ocupa 15,8 GB, por lo que se necesita al menos ese espacio más el overhead de contexto y de la torre de visión; en la práctica, entre 18 y 22 GB de VRAM para contextos moderados.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegues de producción; una RTX 4090 (24 GB) puede alojar la cuantización IQ4_NL con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en GPUs de 24 GB o más; en tarjetas de 16 GB no es viable con esta cuantización.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; MLX para las variantes Q8 en Apple Silicon; vLLM y TGI requerirían los pesos en safetensors, no disponibles en este repositorio.
- Latencia y throughput: no disponible. El autor advierte de un incremento del tiempo de "thinking" respecto al modelo base, lo que aumenta la latencia a cambio de mayor calidad analítica.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| StagAI-CyberSecurity-26B-A4B-v2-VLM (este) | 25,2 B (MoE, ~4 B activos) | no disponible | Apache 2.0 | GGUF IQ4_NL, MLX Q8 | CyberSec-Eval 90,00; VLM con visión restaurada |
| Gemma-4-26B-A4B (base) | 25,2 B (MoE, ~4 B activos) | no disponible | Gemma license (no disponible en detalle) | safetensors | Modelo generalista sin ajuste de ciberseguridad; el autor reporta menor calidad en preguntas de seguridad |
| CyberStag-Security-26B-A4B-V1 (versión previa del autor) | 25,2 B (MoE) | no disponible | no disponible | no disponible | El autor indica que la v2 mejora la calidad de respuesta respecto a la v1 |

No se dispone de datos de benchmarks comparativos frente a otros modelos especializados en ciberseguridad en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos generativos: en dominio de seguridad, una respuesta incorrecta sobre una vulnerabilidad o un indicador puede llevar a decisiones erróneas; requiere validación humana.
- El modo "Thinking" incrementa la latencia de forma perceptible, lo que puede ser problemático en flujos de triaje en tiempo real.
- La longitud de contexto no está documentada en la información disponible, lo que impide planificar cargas de logs extensos con garantías.
- Cobertura idiomática declarada limitada a inglés, japonés y chino más contenido multilingüe; el rendimiento en castellano no está verificado.
- La cuantización IQ4_NL de 4 bits puede degradar ligeramente la calidad frente a los pesos originales o a la variante MLX Q8; conviene evaluar la variante Q8 si el hardware lo permite.
- Aunque el autor documenta que no se ha aplicado abliteración y que el vector de rechazo se mantiene alineado con el base, cualquier modelo especializado en seguridad puede producir contenido sensible; se recomienda desplegar con filtros adicionales en producción.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma-4 puede tener términos adicionales que conviene revisar antes de un despliegue comercial.
- El repositorio no incluye pesos en safetensors, lo que limita el uso con vLLM o TGI y obliga a llama.cpp/Ollama o MLX.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/deer-sec/StagAI-CyberSecurity-26B-A4B-v2-VLM-GGUF-IQ4_NL
- Repositorio MLX Q8 de la misma familia: https://huggingface.co/deer-sec/StagAI-CyberSecurity-26B-A4B-v2-VLM-MLX-Q8
- Modelo base: https://huggingface.co/google/gemma-4-26b-a4b
- Dataset japonés de ciberseguridad: https://huggingface.co/datasets/deer-sec/deer_sec-japanese-cybersecurity-chatml-v2
- Dataset Fenrir v2.1: https://huggingface.co/datasets/AlicanKiraz0/Cybersecurity-Dataset-Fenrir-v2.1
- Framework MLX: https://github.com/ml-explore/mlx
- Paper, blog o demo adicionales: no disponible en la información proporcionada.
