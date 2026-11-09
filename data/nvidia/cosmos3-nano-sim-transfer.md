# nvidia/Cosmos3-Nano-Sim-Transfer

## Resumen

Cosmos3-Nano-Sim-Transfer es un modelo generativo de vídeo desarrollado por NVIDIA dentro de la familia Cosmos3, orientado a la simulación visual para IA física (Physical AI). Se trata de un checkpoint post-entrenado y destilado de forma causal a partir del modelo base Cosmos3-Nano, especializado en generar vídeo RGB fotorrealista condicionado por secuencias de control renderizadas por un simulador (mapas de profundidad, máscaras de segmentación, mapas de bordes o imágenes desenfocadas) junto con un prompt de texto. Su función es actuar como capa de apariencia visual sobre simuladores clásicos como NVIDIA Isaac Lab, de modo que el simulador sigue gobernando la física, el estado de la escena y las anotaciones ground-truth, mientras el modelo sintetiza la imagen fotorrealista correspondiente.

La relevancia del modelo radica en el puente sim-to-real: permite entrenar y evaluar políticas de robótica con observaciones visuales realistas sin abandonar la simulación, lo que reduce la brecha de dominio entre el entorno sintético y el mundo real. El modelo emplea una arquitectura Transformer con Mixture-of-Transformers (MoT), cuenta con aproximadamente 16B parámetros entrenables (15.156.222.144 parámetros reales en los pesos safetensors) y genera vídeo en pequeños fragmentos de latentes condicionados por historial cacheado, lo que habilita inferencia por lotes en bucle cerrado.

La generación soporta hasta 600 fotogramas a 480p con una tasa de reproducción de 30 fps, y está diseñada para inferencia en tiempo real con hasta ocho entornos paralelos en una única GPU GB200. Se distribuye bajo licencia OpenMDW1.1 y está declarado como apto para uso comercial y no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Transformers (MoT); modelo de difusión causal destilado a pocos pasos |
| Parametros totales | 15.156.222.144 (~16B entrenables segun model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (generacion por fragmentos de latentes con historial cacheado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrada de texto en lenguaje natural; idiomas no declarados) |
| Licencia | OpenMDW1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 31,9 GB |
| Modalidad de entrada | Video de control (profundidad, segmentacion, bordes, desenfoque) + texto |
| Modalidad de salida | Video (MP4 o frames en streaming), hasta 600 frames a 480p, 30 fps de reproduccion |
| Libreria | cosmos (con soporte de PyTorch, vLLM-Omni y SGLang) |

## Arquitectura y entrenamiento

El modelo se basa en un Transformer con Mixture-of-Transformers (MoT), una variante que combina módulos especializados dentro de un mismo backbone para procesar las distintas modalidades de entrada (vídeo de control y texto). Deriva de Cosmos3-Nano mediante un proceso de post-entrenamiento para generación de vídeo controlada y una destilación causal que lo convierte en un modelo de pocos pasos, lo que reduce el coste de inferencia y permite su integración en bucles de simulación en tiempo real. La generación se realiza en pequeños fragmentos de fotogramas latentes condicionados por el historial cacheado, los controles entrantes del simulador y el prompt de texto, manteniendo la coherencia temporal entre fragmentos.

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre el uso de RLHF o DPO. La model card sí especifica que el modelo fue desarrollado con el Cosmos Framework y que su entrenamiento está orientado a preservar la geometría y la dinámica de la escena tal como las especifica el simulador, generando únicamente la apariencia visual. La innovación técnica principal es la combinación de control multimodal denso (profundidad, segmentación, bordes, desenfoque) con destilación causal para inferencia por lotes de baja latencia en entornos paralelos.

## Capacidades

- Generación de vídeo RGB fotorrealista condicionada por mapas de profundidad renderizados por simulador.
- Generación condicionada por máscaras de segmentación semántica.
- Generación condicionada por mapas de bordes (edge maps).
- Generación condicionada por imágenes desenfocadas (blur), útil para transferencia de apariencia.
- Condicionamiento conjunto por prompt de texto para dirigir el estilo y la apariencia visual.
- Generación de vídeo causal por fragmentos con historial cacheado, apta para bucles cerrados de simulación.
- Soporte de hasta 600 fotogramas por secuencia a resolución 480p y 30 fps de reproducción.
- Inferencia por lotes en paralelo sobre hasta ocho entornos simultáneos en una GPU GB200.
- Integración con simuladores de robótica como NVIDIA Isaac Lab para entrenamiento y evaluación de políticas.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso en lenguaje natural, visión estática, audio ni modo thinking.

## Casos de uso

- Entrenamiento por refuerzo de políticas robóticas: el modelo genera observaciones fotorrealistas a partir de los controles del simulador, de modo que el agente aprende con imágenes realistas mientras la física y las recompensas siguen calculándose en Isaac Lab, reduciendo la brecha sim-to-real.
- Evaluación de políticas en bucle cerrado: al generar vídeo de forma causal por fragmentos con historial cacheado, la política puede recibir observaciones coherentes temporalmente durante episodios completos de hasta 600 fotogramas.
- Aumento de datos sintéticos para percepción: a partir de mapas de profundidad o segmentación existentes se generan variantes fotorrealistas de la misma escena, útiles para ampliar datasets de entrenamiento de modelos de visión sin re-etiquetar.
- Validación de escenarios de manipulación y navegación: los mapas de bordes y las máscaras de segmentación permiten fijar la geometría exacta de objetos y obstáculos, y el modelo rellena la apariencia, lo que sirve para probar políticas ante condiciones visuales variadas.
- Prototipado rápido de entornos antes de renderizado físico: sustituir pipelines de renderizado offline costosos por generación neuronal para previsualizar escenas de robot antes de invertir en assets de alta fidelidad.
- Investigación en world models para IA física: el modelo sirve como componente de apariencia en arquitecturas de simulación neuronal, permitiendo estudiar cómo afecta el realismo visual a la transferencia de políticas.
- Demostraciones y material divulgativo: generación de vídeos de simulación con aspecto fotográfico para presentar resultados de robótica sin depender de capturas del mundo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 15.156.222.144 parámetros en safetensors y un repositorio de 31,9 GB, la inferencia en precisión nativa requiere un acelerador de clase centro de datos. No se documentan cuantizaciones que permitan reducir la huella.
- GPU recomendadas: NVIDIA GB200, citada explícitamente para inferencia en tiempo real con hasta ocho entornos paralelos. No se mencionan otras GPU compatibles en la información disponible.
- GPU de consumo: no se declara compatibilidad con GPU de consumo (RTX 4090 u otras); el modelo está diseñado y optimizado para sistemas acelerados por NVIDIA con CUDA.
- Opciones de despliegue: PyTorch, vLLM-Omni y SGLang como motores de ejecución; el framework Cosmos y la skill de Cosmos3-Nano-Sim-Transfer en el repositorio cosmos-framework.
- Latencia y throughput: no se publican cifras concretas; la model card indica que el throughput depende del hardware y de la configuración de generación, y que la tasa de 30 fps describe la reproducción del vídeo, no el rendimiento de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / salida | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano-Sim-Transfer | ~16B (15.156.222.144 reales) | Fragmentos de latentes con historial cacheado; hasta 600 frames a 480p | Video condicionado por control de simulador + texto | OpenMDW1.1 | Hugging Face (nvidia), GitHub nvidia/cosmos |
| Cosmos3-Nano | no disponible en la informacion | no disponible | Modelo base de la familia Cosmos3 | no disponible en la informacion | Hugging Face (nvidia/Cosmos3-Nano) |
| Otros modelos de la familia Cosmos3 | no disponible en la informacion | no disponible | Generacion de video / simulacion | no disponible en la informacion | Coleccion nvidia/cosmos3 en Hugging Face |

No se dispone en la información proporcionada de datos de rendimiento comparativo con modelos de otras familias dedicados a sim-to-real visual, por lo que la comparativa se limita a los miembros de la propia familia Cosmos3.

## Limitaciones y advertencias

- El modelo no simula física ni mantiene el estado de la escena: depende por completo de que el simulador externo aporte geometría, dinámica y anotaciones ground-truth.
- La alineación entre las anotaciones del simulador y las imágenes generadas debe validarse para cada caso de uso; la model card advierte explícitamente de este riesgo.
- El realismo generado puede introducir artefactos o inconsistencias temporales que no reflejen fielmente la escena simulada, lo que afectaría al entrenamiento de políticas.
- Resolución limitada a 480p y a un máximo de 600 fotogramas por secuencia, lo que restringe escenarios de alta fidelidad o episodios largos.
- No se documentan idiomas soportados para el prompt de texto ni sesgos conocidos; la información disponible es insuficiente para evaluar el comportamiento multilingüe.
- No se publican datos de benchmarks, por lo que no es posible cuantificar su calidad frente a alternativas.
- La licencia OpenMDW1.1 permite uso comercial según la model card, pero conviene revisar los términos completos del enlace oficial antes de desplegar en producción.
- Requiere hardware NVIDIA de clase centro de datos (GB200 en el caso documentado); no se declara soporte para GPU de consumo ni cuantizaciones de bajo rango.
- El rendimiento en tiempo real depende de la configuración de generación y del tamaño de lote; no hay cifras de latencia publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Cosmos3-Nano-Sim-Transfer
- Colección Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Ejemplos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3-examples
- Código: https://github.com/nvidia/cosmos
- Informe técnico: https://research.nvidia.com/labs/cosmos-lab/cosmos-simulation/technical-report.pdf
- Sitio web del proyecto: https://research.nvidia.com/labs/cosmos-lab/cosmos-simulation/
- Skill de Cosmos3-Nano-Sim-Transfer: https://github.com/NVIDIA/cosmos-framework/tree/main/.agents/skills/cosmos3-nano-sim-transfer
- Framework Cosmos: https://github.com/NVIDIA/cosmos-framework
- Modelo base Cosmos3-Nano: https://huggingface.co/nvidia/Cosmos3-Nano
- Licencia OpenMDW1.1: https://openmdw.ai/license/1-1/
- vLLM-Omni: https://github.com/vllm-project/vllm-omni
- SGLang: https://github.com/sgl-project/sglang
- PyTorch: https://pytorch.org/
- arXiv (referencia de la model card): https://arxiv.org/abs/2512.01989
