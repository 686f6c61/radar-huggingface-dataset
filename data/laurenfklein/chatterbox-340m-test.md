# laurenfklein/chatterbox-340m-test

## Resumen

Mr. Chatterbox (340M) es un modelo de lenguaje de 352 millones de parámetros entrenado desde cero sobre libros escaneados de la British Library publicados entre 1800 y 1899, y posteriormente ajustado mediante supervisión en conversaciones sintéticas que imitan el registro lingüístico del siglo XIX. Lo desarrolla laurenfklein como artefacto de investigación dentro de un proyecto de replicación de curso, no como un asistente comercial. Su propósito es explorar la generación de lenguaje histórico y el registro de época en modelos pequeños.

El modelo utiliza una arquitectura personalizada basada en nanochat, no compatible con `transformers` ni con `AutoModel`. Tiene una longitud de contexto de 2048 tokens, atención con ventana deslizante alternante (patrón `SSSL`), y embeddings de palabras atados por identidad. Es un artefacto de investigación sin intención de despliegue productivo, con limitaciones medidas y documentadas explícitamente por su autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | nanochat personalizada (no transformers) |
| Parámetros totales | 352 321 610 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (residualmente otros, no verificado) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (no safetensors; no cargable con `AutoModel`) |

## Arquitectura y entrenamiento

La arquitectura es una configuración personalizada de nanochat, con 24 capas, ancho 1024, 16 cabezas de atención sin GQA, vocabulario de 49 152 tokens y contexto de 2048. La atención alterna ventanas deslizantes con patrón `SSSL` (tres ventanas cortas de 768 tokens y una larga), aunque la batería de evaluación nunca la ejercita porque todos los prompts quedan por debajo de los 768 tokens. Los embeddings de palabras están atados por identidad con la capa de salida, un detalle crítico: cualquier carga que los separe produce un modelo de 402 653 258 parámetros que funciona pero no es este modelo.

El entrenamiento base se realizó desde cero sobre el corpus British Library Books (~1,10 épocas, checkpoint `model_006496.pt`). El ajuste supervisado (este modelo) utilizó una mezcla limpia de conversaciones sintéticas, 2 épocas, 82 pasos de optimización, 21 442 980 tokens de entrenamiento y semilla 1837, con una pérdida final de validación de 0,8108 bits por byte. No se empleó RLHF ni DPO; el entrenamiento es únicamente supervisado sobre pares de conversación sintética. No se realizó el paso de refinamiento iterativo planificado en el proyecto.

## Capacidades

- Generación de texto conversacional en registro histórico (siglo XIX), con frases y expresiones de la época.
- Capacidad de mantener conversaciones multi-turno en un registro lingüístico específico (92% de acierto en evaluación).
- Terminación de respuestas en prompts cortos (bajo 200 tokens), aunque falla en contextos largos donde alcanza el límite de generación sin emitir token de fin.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni visión, ni audio.
- Capacidad multilingüe residual: alrededor de un 0,2% de los pares de entrenamiento contienen texto no inglés, sin verificación.
- No es un asistente: no tiene conocimiento factual fiable ni capacidad de seguir instrucciones complejas.

## Casos de uso

- Investigación en lingüística histórica: generar diálogos que imiten el registro del siglo XIX para estudiar variación estilística, evolución del lenguaje o patrones de interacción en textos de la época.
- Análisis de datos de corpus: el modelo puede servir para crear datos sintéticos de entrenamiento en el estilo de documentos históricos, aunque con limitaciones de precisión.
- Estudio de arquitecturas de modelos pequeños: su configuración con embeddings atados y ventana deslizante ofrece un caso de estudio sobre el impacto de estas decisiones en el rendimiento.
- Replicación de experimentos de investigación: al ser un artefacto de curso, es útil para reproducir metodologías de evaluación y comparación de checkpoints.
- Generación de ejemplos de texto para pruebas de sistemas de OCR o de normalización de texto antiguo, aunque los artefactos de OCR del corpus se heredan.
- Prototipado de interfaces de conversación con estilo histórico para entornos educativos o de entretenimiento, con la advertencia de que no es robusto ni preciso.

## Benchmarks y rendimiento

La model card incluye una evaluación con una batería de 25 prompts, congelada y verificada antes del ajuste, sobre cuatro ejes binarios (respuesta, registro, terminación, conciencia del historial). Los resultados se presentan en la siguiente tabla:

| Modelo | Responsive | En registro | Termina | History-aware |
|---|---|---|---|---|
| Base (solo preentrenamiento) | 12% | 84% | 0% | 2/4 |
| Stage-1 (pares de un turno) | 56% | 96% | 96% | 1/4 |
| **Este modelo** | **76%** | **92%** | **100%** | **3/4** |
| Stage-2 comportamental | 84% | 16% | 100% | 4/4 |
| Stage-2 con LR reparado | 64% | 96% | 92% | 4/4 |

La propia model card advierte que estas puntuaciones son producidas por el modelo, no por humanos, que el tamaño de muestra es pequeño (n=25), que la puntuación de terminación del 100% solo se midió en prompts de menos de 200 tokens, y que la batería no ejercita la ventana deslizante. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No se han publicado mediciones oficiales de VRAM ni de latencia.
- Con 352 millones de parámetros, es plausible ejecutar el modelo en una GPU de gama media (por ejemplo, RTX 3060 o superior) o incluso en CPU, pero sin datos de referencia no se puede garantizar.
- El checkpoint está en formato PyTorch, por lo que se puede cargar con PyTorch y ejecutar en CPU o GPU. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- La carga en CPU tiene el problema documentado de la separación de los embeddings atados, que produce un modelo de 402 millones de parámetros; hay que re-atarlos manualmente.
- No se dispone de datos de throughput ni de latencia en condiciones controladas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos de ~340M entrenados en lenguaje histórico). No hay datos de rendimiento frente a alternativas como GPT-2, Pythia o modelos pequeños similares. La model card no proporciona comparaciones externas, por lo que esta sección queda como no disponible.

## Limitaciones y advertencias

- No es un asistente: es un artefacto de investigación sin refinamiento iterativo, publicado tal cual se midió.
- Sin sentido coherente de fecha: produce afirmaciones en presente de décadas incorrectas (por ejemplo, describe el ómnibus como "no común", situando al hablante hacia 1830).
- Identidad inconsistente: en tres prompts de identidad da tres autodescripciones incompatibles (sin cuerpo, corresponsal por correo, hombre de negocios con esposa).
- Deriva de registro: un 8% de fallos en mantener el registro, medido con una tasa de 11,7% en el entrenamiento.
- Fallo con entradas sin sentido: 0 de 2 aciertos en prompts de gibberish en todas las variantes.
- Contenido residual no inglés, aproximadamente un 0,2% de los pares de entrenamiento sin verificar.
- El corpus es 1800–1899, no específicamente "victoriano" como se describe; el filtro de fechas no se implementó.
- Artefactos de OCR heredados de libros escaneados: palabras rotas, saltos de párrafo perdidos, errores tipográficos de la época.
- No sabe cosas: 352 millones de parámetros con solo ~1,10 épocas sobre el corpus.
- La carga de los pesos en CPU puede romper la ligadura de embeddings si no se re-atada manualmente, produciendo un modelo con más parámetros y comportamiento diferente.
- Licencia MIT permite uso comercial, pero el modelo no es apto para producción ni para uso como asistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laurenfklein/chatterbox-340m-test
- Demo: https://huggingface.co/spaces/laurenfklein/chatterbox-340m-test-demo
- Repo de nanochat: https://github.com/karpathy/nanochat
- Resultados de búsqueda web sobre "chatterbox" corresponden a otro modelo de TTS de Resemble AI, no relacionados con este artefacto.
