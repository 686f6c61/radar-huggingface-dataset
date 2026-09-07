# PowerMachine/aurora-multimodal-ptbr

## Resumen

AURORA v3 es un modelo multimodal auto-aprendiente desarrollado por PowerMachine, orientado al portugués brasileño. Su arquitectura combina Transformers con redes CNN-BiGRU y BiGRU, organizadas en un sistema de microunidades especializadas escalables que siguen cuatro topologías: serial, paralela, aislada y recursiva. El modelo está diseñado para procesar texto, imagen, audio y vídeo, integrando además gestión de memoria interna, estimación de confianza y predicción multi-token adaptativa.

La versión v3 introduce innovaciones técnicas significativas, como el crecimiento dinámico de microunidades basado en la diagonal del Hessiano (calculada mediante Hutchinson-Rademacher), un mecanismo de multi-token prediction cuyo número de tokens futuros predichos depende de la confianza del modelo, y un sistema de contratos entre módulos que verifica permisos en tiempo de ejecución. El proyecto se presenta como un esfuerzo de investigación con documentación matemática previa al código y 102 verificaciones en tests.

No se dispone del número de parámetros totales ni de la longitud de contexto en la información proporcionada. El repositorio tiene un tamaño de 4.9 GB y los pesos se almacenan en formato safetensors. La relevancia del modelo radica en su enfoque experimental para la composición escalable de microunidades MoE y su aplicación a un idioma de nicho como el portugués brasileño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer + CNN-BiGRU + BiGRU con composición de microunidades MoE (topologías serial, paralela, aislada y recursiva) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona W8A8 en las etiquetas, pero no se detalla como formato de pesos publicado) |
| Idiomas soportados | pt (portugués brasileño) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de AURORA v3 se basa en bloques Transformer cuyo bloque de alimentación directa (FFN) actúa como un compositor. Cada compositor incluye un tallo serial formado por una convolución causal seguida de una GRU causal, y ramas paralelas compuestas por convolución dilatada, GRU, SwiGLU y un MoE agrupable, con gating convexo por token que depende de la confianza h_t. El refino se realiza de forma recursiva con un corte por cauda geométrica. Los encoders de imagen y audio incorporan BiGRU en una vía aislada, según el teorema 11.3 de la documentación del proyecto.

El entrenamiento sigue un pipeline en fases: una fase densa con todas las conexiones activas, una fase de foco con top-k, una etapa de DPO y una fase final con mapa auto-organizado (SOM) que maximiza el número de neuronas activas. El modelo emplea optimización PCGrad, un sistema PRS V8 con histeresis asimétrica y grad-clip por percentil robusto, y un agente de confianza basado en una posterior Beta con cotas de Bernstein y PAC-Bayes. La memoria interna utiliza slots de escritura conficiente, recuperación por similaridad y compresión VQ-EMA. Los datos de entrenamiento no se especifican en la información disponible.

## Capacidades

- Multimodalidad: procesa texto, imagen, audio y vídeo de forma unificada, según la descripción del autor.
- Auto-aprendizaje: las microunidades pueden expandirse o podarse dinámicamente durante el entrenamiento mediante el análisis de la curvatura del Hessiano.
- Multi-token prediction adaptativo: el número de tokens futuros predichos por posición varía según la confianza del modelo, con un K adaptativo entre K_min y K_max.
- Memoria interna: dispone de slots con escritura condicionada a la confianza, recuperación por similaridad y utilidad, y un índice SOM para direccionamiento simbólico.
- Estimación de confianza: utiliza una posterior Beta combinada con características neuronales como entropía y probabilidad máxima, integrada en el gating y la memoria.
- Alineación mediante DPO: incorpora Direct Preference Optimization en el pipeline de entrenamiento.
- Razonamiento con consulta a memoria: el ciclo de razonamiento consulta la memoria interna y recibe un endoso basado en PAC-Bayes.
- No se especifica soporte de tool calling o function calling en la información disponible.

## Casos de uso

- Análisis multimodal de contenido en portugués brasileño: el modelo puede procesar simultáneamente texto, imágenes, audio y vídeo, lo que permite construir sistemas de análisis de contenido para medios sociales o plataformas de vídeo en Brasil.
- Asistentes conversacionales en portugués: gracias a la memoria interna y la estimación de confianza, puede mantener conversaciones largas con gestión de contexto y recuperación de información relevante.
- Transcripción y análisis de audio: los encoders de audio con BiGRU permiten procesar señales de audio para transcripción o detección de eventos sonoros en portugués.
- Descripción de contenido audiovisual: al ser multimodal, puede generar descripciones de vídeos o imágenes, útil para accesibilidad o catalogación de bibliotecas multimedia.
- Sistemas de recomendación de contenido: la combinación de memoria interna y aprendizaje continuo permite adaptar recomendaciones a las preferencias del usuario en tiempo real.
- Investigación en arquitecturas MoE escalables: el modelo sirve como referencia para estudiar la composición de microunidades, el crecimiento por Hessiano y la predicción multi-token adaptativa en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Aunque la model card menciona archivos de evaluación como `avaliacao_v3.json` y `resumo_treino_v3.json`, no se proporcionan métricas numéricas concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no especificada.
- Opciones de despliegue: no especificadas (no se mencionan vLLM, llama.cpp, Ollama, TGI ni similares).
- El tamaño del repositorio es de 4.9 GB, lo que orienta sobre el espacio de almacenamiento necesario, pero no permite estimar la VRAM requerida sin conocer la cuantización.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está orientado exclusivamente al portugués brasileño; no se garantiza un rendimiento adecuado en otros idiomas.
- La arquitectura es experimental y muy compleja, con múltiples componentes novedosos que no han sido validados en entornos de producción.
- No se proporcionan métricas de calidad ni benchmarks, por lo que no es posible evaluar su rendimiento real frente a otros modelos.
- El tamaño del repositorio (4.9 GB) sugiere que los pesos ocupan un espacio significativo, pero se desconoce la cuantización aplicada.
- La licencia MIT permite el uso comercial, pero no se documentan sesgos conocidos ni riesgos de alucinación.
- La dependencia de componentes como la memoria interna y el agente de confianza añade complejidad al despliegue y al mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/PowerMachine/aurora-multimodal-ptbr
- No se han encontrado otros enlaces relevantes en la búsqueda web.
