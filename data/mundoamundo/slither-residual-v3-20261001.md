# mundoamundo/slither-residual-v3-20261001

## Resumen

Slither residual world model v3 es un modelo de mundo (world model) desarrollado por el usuario de HuggingFace mundoamundo (Seth Lupo). Su objetivo es predecir la evolución futura de fotogramas de vídeo de partidas de Slither.io condicionada por acciones, dentro de un pipeline de investigación sobre modelos de mundo para vídeo y acción. No es un modelo de lenguaje ni un modelo generativo de texto: no procesa ni produce lenguaje natural.

La arquitectura combina un componente de dinámica espacial causal de 303,9 M de parámetros con un encoder, una proyección y un decoder DINO-Tok (de DINOv3) que se mantienen congelados. El entrenamiento emplea residual endpoint flow matching sobre vídeo de 512×288 píxeles a 15 Hz, con tres segundos de histórico (45 fotogramas) y controles proxy de ángulo y boost. El entrenamiento de la cabecera de política se plantea como una etapa posterior y separada.

Es relevante como ejemplo de modelo de mundo de pequeño tamaño y dominio acotado: el repositorio de HuggingFace no contiene pesos (0,0 GB, 0 descargas, 0 likes); los checkpoints resumibles se publican en un bucket de HuggingFace con punteros verificados en `latest.json` y `best.json`. La ficha refleja un estado de desarrollo temprano, sin resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de mundo con dinámica espacial causal y residual endpoint flow matching; encoder/proyección/decoder DINO-Tok (DINOv3) congelados |
| Parametros totales | 303,9 M en el componente de dinámica espacial causal (los componentes DINO-Tok están congelados) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 3 segundos de histórico de vídeo a 15 Hz, equivalentes a 45 fotogramas; resolución de 512×288 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vídeo condicionado por acción; sin interfaz de lenguaje natural) |
| Licencia | other, con `license_name: dinov3` y enlace a https://github.com/facebookresearch/dinov3/blob/main/LICENSE |
| Formato de pesos | no disponible (el repositorio no contiene pesos; los checkpoints se publican en un bucket de HuggingFace) |

## Arquitectura y entrenamiento

El modelo se describe como una dinámica espacial causal de 303,9 M de parámetros que opera sobre representaciones producidas por un tokenizador DINO-Tok congelado. La generación se formula como residual endpoint flow matching, un esquema de flow matching sobre el residuo (endpoint) que predice el estado futuro de los fotogramas. La entrada de vídeo es de 512×288 píxeles a 15 Hz, y la condición incluye tres segundos de histórico (45 fotogramas) más controles proxy de ángulo y boost. Tras la predicción en el espacio latente, un decoder DINO-Tok congelado reconstruye los fotogramas.

El dataset declarado es `mundoamundo/slither-wam-video-actions`, fijado en el commit `c60388c8b625379d2782e9a673c3d850ec7d4b85`. Las fuentes de entrenamiento y validación son disjuntas. El autor advierte explícitamente de que las correcciones de reproducción son estimaciones aprobadas por usuarios y no ground truth medido, lo que introduce ruido de etiquetado en la supervisión de acciones. Los checkpoints incluyen modelo, configuración, estado del optimizador, cursor de datos y RNG por rango, y el bucket rota dos ranuras, por lo que los pesos no se confirman repetidamente en el repositorio principal. No se menciona en la información disponible el uso de RLHF, DPO ni preferencias humanas.

## Capacidades

- Predicción de fotogramas futuros de vídeo a 512×288 y 15 Hz, condicionada por 45 fotogramas de histórico (3 segundos).
- Condicionamiento por acción mediante controles proxy de ángulo y boost, no los controles reales del juego.
- Reconstrucción de fotogramas a través del decoder DINO-Tok congelado, reutilizando el tokenizador publicado.
- Evaluación interna mediante previsualizaciones por checkpoint que comparan el futuro real, la reconstrucción del tokenizador congelado, un baseline de repetición del último fotograma y una muestra open-loop con semilla fija.
- No dispone de cabecera de política entrenada: el entrenamiento de la política se define como una etapa posterior e independiente.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en lenguaje natural, agentes conversacionales ni generación de texto.
- No se documentan capacidades multilingües, de visión general, audio ni matemáticas.

## Casos de uso

- Simulación de entorno para aprendizaje por refuerzo: el modelo puede generar rollouts sintéticos de Slither.io condicionados por acciones, de modo que una política se entrene parcialmente contra el modelo de mundo en lugar de contra el juego real, reduciendo el coste de interacción.
- Planificación basada en modelo (model predictive control): dado el estado actual y un conjunto de candidatos de ángulo y boost, el modelo permite puntuar futuros alternativos y seleccionar la acción que maximiza una recompensa, sin ejecutar el juego.
- Aumento de datos para investigación en video-action models: los fotogramas predichos pueden servir como datos adicionales para preentrenar cabezas de política o clasificadores de estado, siempre que se controle la deriva acumulada.
- Evaluación offline de políticas: permite estimar el comportamiento de una política sobre trayectorias de validación de fuentes no vistas, dado que el dataset declara fuentes disjuntas entre entrenamiento y validación.
- Banco de pruebas para tokenizadores congelados: al reutilizar DINO-Tok congelado, el modelo sirve para medir cuánta información dinámica se puede modelar sobre representaciones fijas frente a entrenar el tokenizador de forma conjunta.
- Estudio de esquemas de flow matching sobre residuos: la formulación residual endpoint flow matching puede compararse con baselines de predicción directa de fotogramas o de repetición del último fotograma en un dominio de vídeo controlado y de bajo coste.
- Investigación académica en modelos de mundo de dominio específico: el tamaño de 303,9 M y la resolución de 512×288 lo hacen manejable para experimentos de ablación en una sola GPU, algo inviable con modelos de mundo de gran escala.
- Reproducción de experimentos con estado completo: al incluir configuración, optimizador, cursor de datos y RNG por rango, permite reanudar entrenamientos y verificar hashes de checkpoints en un contexto de investigación reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe un protocolo de evaluación cualitativo, no cifras:

| Elemento del protocolo de previsualización | Detalle |
|---|---|
| Elementos comparados | Futuro real, reconstrucción del tokenizador congelado, baseline de repetir el último fotograma y una muestra open-loop con semilla fija |
| Fuentes reservadas | Cinco fuentes held-out |
| Fotogramas predichos por fuente | 75 |
| Estado de las previsualizaciones | Los trabajos de previsualización pueden ir por detrás de la subida de checkpoints |
| Métricas y manifiestos | Se conservan para reproducibilidad, según el autor |

## Requisitos de hardware

- VRAM para pesos (estimación aritmética a partir de los 303,9 M de parámetros, no publicada por el autor): aproximadamente 1,22 GB en fp32, 0,61 GB en fp16/bf16 y 0,30 GB en int8.
- VRAM para activaciones: no disponible. El encoder y el decoder DINO-Tok congelados y el histórico de 45 fotogramas a 512×288 pueden dominar el consumo de memoria sobre el propio peso de los parámetros, especialmente con lotes grandes.
- GPU recomendadas: el autor no especifica ninguna. Por tamaño de parámetros, cualquier GPU con 8 GB o más (RTX 3060/4060, RTX 4070/4090) debería poder alojar los pesos; A100 o H100 serían necesarias para entrenamiento o inferencia por lotes grandes.
- Viabilidad en GPU de consumo: probablemente sí para inferencia de una sola secuencia, condicionada al coste real de activaciones, que no está documentado.
- Opciones de despliegue: no documentadas. No hay integración con vLLM, TGI, llama.cpp ni Ollama, que además están orientados a modelos de lenguaje. El uso requiere código PyTorch propio y la descarga de checkpoints desde el bucket de HuggingFace, ya que el repositorio del modelo no contiene pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de la misma categoría (modelos de mundo para vídeo condicionados por acción con tokenizador DINO-Tok congelado) ni ofrece métricas que permitan una comparación cuantitativa. No se dispone de datos de parámetros, contexto, rendimiento ni licencia de alternativas en las fuentes consultadas.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo está entrenado específicamente sobre vídeo de Slither.io; no se declara capacidad de generalización a otros juegos o dominios visuales.
- Controles proxy: las acciones de ángulo y boost son aproximaciones, no los controles reales del juego, lo que limita la transferencia directa a un agente que opere sobre la interfaz original.
- Ruido en las etiquetas de acción: el propio autor indica que las correcciones de reproducción son estimaciones aprobadas por usuarios y no ground truth medido.
- Riesgo de alucinación y deriva: en un modelo de mundo autorregresivo o de predicción encadenada, los errores se acumulan a lo largo de los 75 fotogramas evaluados; el baseline de repetir el último fotograma existe precisamente para detectar si el modelo aporta información sobre esa referencia trivial.
- Sin cabecera de política: esta versión no toma decisiones, solo predice dinámica; cualquier uso como agente requiere una etapa de entrenamiento posterior no incluida.
- Licencia: se declara `other` con nombre `dinov3`, remitiendo a la licencia de DINOv3 de Meta. No es una licencia de código abierto estándar y hay que revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones.
- Estado del repositorio: 0,0 GB de tamaño, 0 descargas y 0 likes; los pesos no están en el repositorio y se distribuyen en un bucket con rotación de dos ranuras, lo que puede romper reproducibilidad si los punteros cambian.
- Dataset en preparación: el dataset asociado se describe en HuggingFace como un conjunto en fase de preparación (staging), no como un conjunto de entrenamiento publicado.
- Ausencia de benchmarks externos: no hay resultados comparables con otros modelos, por lo que no es posible posicionar su calidad de forma objetiva.
- Fechas declaradas: el repositorio figura como creado el 2026-10-01, una fecha posterior a la habitual en modelos publicados; conviene verificar la vigencia real de los artefactos antes de depender de ellos.
- Idiomas y cuantizaciones: no se documenta ningún idioma soportado ni formato de cuantización, lo que impide planificar un despliegue con cuantización de forma fiable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mundoamundo/slither-residual-v3-20261001
- Bucket con checkpoints (`latest.json` y `best.json`): https://huggingface.co/buckets/mundoamundo/slither-residual-v3-20261001
- Dataset de vídeo y acciones: https://huggingface.co/datasets/mundoamundo/slither-wam-video-actions
- Commit del dataset: `c60388c8b625379d2782e9a673c3d850ec7d4b85`
- Licencia DINOv3 (Meta): https://github.com/facebookresearch/dinov3/blob/main/LICENSE
- Perfil del autor: https://huggingface.co/mundoamundo
- Paper, blog o demo oficiales: no disponibles en la información consultada.
