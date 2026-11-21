# AIArchiveInfo/WeVisForensics

## Resumen

WeVisForensics es un sistema agéntico de detección de vídeo generado por IA, desarrollado por Tencent y publicado en arXiv (2611.21373). No se trata de un modelo monolítico, sino de un conjunto de cinco adaptadores LoRA de rango 64 y alpha 128 entrenados sobre Qwen3.5-4B en precisión BF16. Un agente investigador principal coordina subagentes especializados que inspeccionan distintas dimensiones del vídeo: apariencia visual, consistencia física, sentido común, texto en pantalla y perfil de voz.

El modelo aborda un problema creciente: la verificación forense de contenido audiovisual sintético de forma omni-modal (audio y vídeo conjuntamente). Frente a detectores binarios de un solo paso, WeVisForensics emplea un enfoque de razonamiento multi-paso con uso de herramientas y aprendizaje por refuerzo (DTPO), lo que permite descomponer la decisión en evidencias verificables por cada inspector.

El repositorio (1,3 GB) publica los cinco adaptadores junto con `skill_card.json`, que contiene las tarjetas de habilidad de los inspectores usadas en inferencia. Está pensado para investigación en forense de vídeo generado, no para decisiones autónomas de alto impacto sobre personas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vídeo-texto) sobre Qwen3.5-4B con adaptadores LoRA |
| Parametros totales | 4B (modelo base) + adaptadores LoRA de rango 64 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptadores en BF16; cuantización del base no especificada) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 (adaptadores y código de Tencent; modelos de voz, hablante y OCR de terceros mantienen sus licencias) |
| Formato de pesos | safetensors (PEFT/LoRA); requiere fusión o servicio multi-LoRA sobre el base |
| Tipo de pipeline | video-text-to-text |
| Método de entrenamiento | DTPO (aprendizaje por refuerzo) |
| Número de adaptadores | 5 (investigador principal + 4 inspectores) |

## Arquitectura y entrenamiento

El sistema se construye sobre Qwen3.5-4B, un transformer multimodal de 4B parámetros, mediante cinco adaptadores LoRA independientes de rango 64 y alpha 128 en BF16. El adaptador raíz actúa como investigador principal y coordina cuatro inspectores especializados: apariencia visual, consistencia física, sentido común y consistencia OCR (texto en pantalla). La model card menciona además inspección de contenido de habla y perfil de voz, aunque la tabla de adaptadores publicados solo detalla cuatro subdirectorios más el raíz.

El entrenamiento emplea DTPO (un método de aprendizaje por refuerzo) sobre el modelo base. El enfoque agéntico implica razonamiento multi-paso con uso de herramientas: cada inspector aporta evidencia sobre una dimensión concreta y el investigador principal agrega las señales para emitir el veredicto. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles adicionales del proceso de RL.

## Capacidades

- Detección de vídeo generado por IA mediante razonamiento agéntico multi-paso.
- Inspección de apariencia visual (artefactos, coherencia de imagen).
- Verificación de consistencia física (plausibilidad de movimiento y dinámica).
- Evaluación de sentido común sobre el contenido del vídeo.
- Inspección de texto en pantalla mediante consistencia OCR.
- Análisis de contenido de habla y perfil de voz (audio-visual).
- Uso de herramientas (tool calling) y coordinación multi-agente.
- Razonamiento multi-paso con agregación de evidencias por subagentes.
- Procesamiento omni-modal (audio y vídeo conjuntamente).
- Capacidad de auto-evolución del agente según el diseño del paper.

## Casos de uso

- Moderación de plataformas de vídeo: desplegar el agente para marcar vídeos sospechosos de ser sintéticos antes de su publicación, aprovechando la inspección multimodal de audio y vídeo.
- Verificación periodística: comprobar la autenticidad de clips virales descomponiendo el análisis en apariencia visual, consistencia física y OCR de rótulos en pantalla.
- Investigación forense académica: usar los adaptadores como línea base reproducible para estudiar detección de deepfakes y vídeo generado, con adaptadores separados por dimensión.
- Análisis de contenido en redes sociales: integrar el agente en pipelines que evalúen grandes volúmenes de clips cortos y prioricen la revisión humana.
- Detección de desinformación audiovisual: identificar vídeos manipulados con locuciones sintéticas mediante el análisis de perfil de voz y contenido de habla.
- Auditoría de datasets: filtrar vídeos generados por IA en la construcción de corpus de entrenamiento o evaluación.
- Pruebas de robustez de detectores: emplear los inspectores especializados para analizar qué dimensión (visual, física, OCR, voz) activa la detección en cada caso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 24 GB para ejecutar el agente completo en proceso con Transformers en un solo GPU (según la model card).
- GPU recomendadas: no se especifican modelos concretos; se menciona despliegue multi-GPU y single-GPU.
- Opción single-GPU con vLLM: servir los cinco adaptadores desde un único proceso vLLM sin fusionar, con `GPU_MEMORY_UTILIZATION=0.66`.
- Opción multi-GPU: fusionar cada adaptador en el modelo base mediante `scripts/merge_lora.py` y apuntar la configuración de inferencia al modelo fusionado.
- Opción Transformers: ejecución en proceso en un solo GPU con al menos 24 GB, base del demo Gradio y del Space de Hugging Face.
- Despliegue: vLLM (multi-LoRA), Transformers, Gradio para demo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de detección de vídeo generado por IA ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Solo soporta inglés según el campo de idiomas del repositorio.
- Uso previsto exclusivamente para investigación en forense de vídeo; no para decisiones autónomas de alto impacto sobre individuos.
- No se especifican sesgos conocidos ni tasas de alucinación en la información disponible.
- La licencia Apache 2.0 cubre los adaptadores y el código de Tencent, pero los modelos de terceros para habla, hablante y OCR mantienen sus propias licencias, lo que puede condicionar el uso comercial del pipeline completo.
- Requiere el modelo base Qwen3.5-4B y, para el flujo completo, componentes adicionales de voz y OCR cuyas características no se detallan.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se dispone de datos sobre longitud de contexto, cuantizaciones soportadas ni rendimiento medido.

## Enlaces

- Hugging Face: https://huggingface.co/AIArchiveInfo/WeVisForensics
- Paper (arXiv): https://arxiv.org/abs/2611.21373
- Código: https://github.com/Tencent/WeVisForensics
- Página del proyecto: https://tencent.github.io/WeVisForensics
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
