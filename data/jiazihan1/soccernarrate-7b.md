# JiaZihan1/SoccerNarrate-7B

## Resumen

SoccerNarrate-7B es un modelo de video-texto a texto especializado en la generación de comentarios deportivos en streaming para partidos de fútbol. Lo desarrolla JiaZihan1 (con código alojado en la organización MCG-NJU) y se presenta como el checkpoint oficial del artículo "SoccerNarrate: Event-Grounded Streaming Soccer Commentary with Macro-Window Preference Alignment", aceptado en NeurIPS 2026. El modelo parte de Qwen2.5-VL-7B-Instruct y se entrena en tres etapas para producir narración en tiempo real anclada a eventos del partido.

El problema que aborda es la narración automática de vídeo deportivo en directo: generar comentarios segundo a segundo, alineados temporalmente con los eventos del juego (goles, faltas, saques, cambios de posesión) y coherentes a lo largo de toda la ventana de emisión. Frente a un VLM genérico, el modelo incorpora un ajuste por preferencias (DPO) sobre rollouts causales de 15 segundos que penaliza narraciones desalineadas con el evento real.

Arquitectura transformer multimodal heredada de Qwen2.5-VL (7B parámetros), con procesamiento de vídeo a 2 FPS y latencia declarada inferior a 0,3 s por respuesta en una NVIDIA H100. El modelo está publicado bajo licencia MIT, aunque en el momento de la ficha los pesos aparecen como "coming soon" en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) basada en Qwen2.5-VL-7B-Instruct |
| Parametros totales | 7B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (pesos aún no publicados según la model card) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen2.5-VL-7B-Instruct, un transformer multimodal que combina un codificador visual con un decoder de lenguaje. El entrenamiento se estructura en tres etapas: (1) un warm-up de formato streaming con SFT genérico de vídeo-texto en streaming; (2) un SFT específico de dominio futbolístico con anclaje temporal sobre 58K segmentos del dataset SoccerNarrate-Data; y (3) una etapa de alineación por preferencias denominada Macro-Window Preference Alignment (MWPA), que aplica DPO sobre rollouts causales multi-paso de 15 segundos, usando negativos contrafactuales de eventos cruzados del mismo partido.

La innovación técnica principal es el MWPA: en lugar de optimizar respuestas aisladas, se optimiza la coherencia de una ventana macro de narración, con negativos que comparten contexto de partido pero describen eventos distintos, lo que fuerza al modelo a discriminar el evento correcto. El sistema mantiene inferencia de streaming a 2 FPS con latencia inferior a 0,3 s por respuesta en una H100.

## Capacidades

- Generación de comentario deportivo en streaming a partir de vídeo de fútbol, con anclaje temporal a eventos.
- Comprensión de vídeo multimodal (video-text-to-text) heredada de Qwen2.5-VL.
- Narración multi-evento coherente a lo largo de ventanas de 15 segundos (rollouts causales multi-paso).
- Discriminación de eventos entre partidos y contextos similares gracias al entrenamiento con negativos contrafactuales.
- Salida en formato de subtítulos temporizados (VTT) según el ejemplo de inferencia de la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso general: no disponible; el multi-paso está orientado a la narración.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking, visión general o audio: no disponible (solo se declara comprensión de vídeo para narración).

## Casos de uso

- Retransmisión automatizada de partidos amateur o de ligas menores: el modelo genera comentario en directo a 2 FPS sin necesidad de un comentarista humano, adecuado para competiciones con presupuesto limitado.
- Accesibilidad para personas con discapacidad auditiva: producción de subtítulos descriptivos temporizados (VTT) que narran los eventos del partido, aprovechando el anclaje temporal del SFT de dominio.
- Segunda pantalla y aplicaciones de aficionado: generación de resúmenes narrados en tiempo real para apps móviles, con latencia inferior a 0,3 s por respuesta en H100.
- Etiquetado y enriquecimiento de archivos deportivos: uso del modelo para anotar eventos y generar descripciones sobre vídeo histórico, reutilizando el pipeline de inferencia sobre ficheros MP4.
- Investigación en narración de vídeo: el checkpoint y el dataset SoccerNarrate-Data sirven como base reproducible para experimentos de streaming video-text y alineación por preferencias.
- Generación de highlights narrados: combinación de la detección de eventos con la narración para producir clips comentados automáticamente a partir de un partido completo.
- Evaluación de sistemas de comentario deportivo: el benchmark SoccerNarrate-Eval (45 partidos completos) permite comparar modelos de narración con métricas de recall y precisión por clase y global.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre SoccerNarrate-Eval (45 partidos completos):

| Modelo | Class Recall | Overall Recall | Class Precision | Overall Precision | Class F1 | Overall F1 |
|---|---|---|---|---|---|---|
| SoccerNarrate-7B-SFT (etapas 1+2) | 34,6 | 30,3 | 31,5 | 42,3 | 30,0 | 35,3 |
| SoccerNarrate-7B (etapas 1+2+3) | 71,8 | 61,3 | 38,5 | 48,8 | 46,9 | 54,4 |

La etapa MWPA (DPO) duplica aproximadamente el recall por clase (34,6 → 71,8) y mejora el F1 global de 35,3 a 54,4. No se han publicado resultados comparativos con otros modelos externos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 7B en precisión completa se sitúa en el entorno de 16-20 GB, y en cuantización de 8 bits o 4 bits podría reducirse, aunque no se confirman cuantizaciones publicadas.
- GPU recomendadas: NVIDIA H100 (latencia declarada inferior a 0,3 s por respuesta a 2 FPS).
- Cabe en GPU de consumo: no confirmado; por tamaño (7B) sería viable en GPUs de 24 GB como la RTX 4090, pero no hay datos oficiales de soporte ni cuantizaciones.
- Opciones de despliegue: pipeline propio del repositorio GitHub (streaming-vlm/streaming_vlm/inference/inference.py) sobre transformers; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: menos de 0,3 s por respuesta en 1× NVIDIA H100, con procesamiento de vídeo a 2 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SoccerNarrate-7B | 7B | no disponible | Comentario de fútbol en streaming | MIT | Pesos "coming soon" |
| Qwen2.5-VL-7B-Instruct (base) | 7B | no disponible en la información | VLM generalista | no disponible en la información | Público |
| SoccerNarrate-7B-SFT | 7B | no disponible | Comentario de fútbol (solo SFT, sin DPO) | MIT | Checkpoint SFT publicado |

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada.

## Limitaciones y advertencias

- Los pesos no están disponibles todavía en el momento de la ficha ("Model weights are coming soon"), por lo que no se puede desplegar el modelo aún.
- Dominio restringido al fútbol y al idioma inglés; no se declara soporte para otros deportes ni idiomas.
- Riesgo de alucinación de eventos: el modelo puede narrar acciones no presentes en el vídeo, especialmente en secuencias ambiguas; el MWPA mitiga pero no elimina este riesgo.
- Precisión por clase relativamente baja (38,5) frente al recall (71,8), lo que indica falsos positivos en la detección de eventos.
- No se documentan sesgos específicos, pero al entrenarse sobre un dataset concreto de partidos puede heredar sesgos de cobertura (ligas, equipos o estilos de juego sobrerrepresentados).
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-VL-7B-Instruct y del dataset SoccerNarrate-Data.
- No hay información sobre cuantizaciones ni sobre despliegue en entornos de producción distintos del pipeline oficial.
- La latencia declarada depende de hardware H100; en GPUs de consumo el rendimiento en tiempo real no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JiaZihan1/SoccerNarrate-7B
- Checkpoint SFT: https://huggingface.co/JiaZihan1/SoccerNarrate-7B-SFT
- Dataset: https://huggingface.co/datasets/JiaZihan1/SoccerNarrate-Data
- Repositorio de código: https://github.com/MCG-NJU/SoccerNarrate
- Colección MCG-NJU: https://huggingface.co/collections/MCG-NJU/soccernarrate-6b03e5ec4b39ad06088131d2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
