# EdwinDracoHiguera/negclima-mdeberta-v3

## Resumen

NegClima es un clasificador de sentimiento de tres clases (NEGATIVE, NEUTRAL, POSITIVE) especializado en respuestas abiertas de encuestas de clima laboral en español. Desarrollado por EdwinDracoHiguera, el modelo es un fine-tuning de microsoft/mdeberta-v3-base sobre un conjunto de 6.204 oraciones etiquetadas procedentes de una encuesta institucional de una universidad colombiana. Su principal aportación es la detección de negatividad implícita: quejas redactadas como sugerencias (por ejemplo, "Mejorar el sueldo") que los clasificadores zero-shot y los LLMs de frontera suelen clasificar erróneamente.

El modelo emplea la arquitectura DeBERTa-v3, un transformer encoder con atención disentangled y pre-entrenamiento estilo ELECTRA con gradient-disentangled embedding sharing. Con 278,8 millones de parámetros totales (86 millones de backbone más 190 millones de la capa de embedding), está diseñado para tareas de clasificación de secuencias y se distribuye bajo licencia MIT. Su relevancia actual radica en ofrecer una alternativa ligera, precisa y de código abierto para el análisis automatizado de clima organizacional en español, superando en F1-macro a los LLMs de frontera en modo zero-shot para esta tarea específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3 (encoder transformer con atención disentangled) |
| Parametros totales | 278.811.651 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (español) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de microsoft/mdeberta-v3-base, un encoder DeBERTa-v3 de 12 capas y tamaño oculto 768. DeBERTa-v3 introduce dos innovaciones principales: atención disentangled que modela por separado las relaciones de contenido y posición, y un pre-entrenamiento estilo ELECTRA con gradient-disentangled embedding sharing que mejora la eficiencia de los parámetros. El backbone tiene 86 millones de parámetros, mientras que la capa de embedding, con un vocabulario de 250.000 tokens, añade 190 millones adicionales.

El fine-tuning se realizó sobre un corpus de encuestas de clima laboral de una universidad colombiana (personal docente y administrativo). Las respuestas a dos preguntas abiertas se segmentaron en oraciones con NLTK, obteniendo 6.204 oraciones etiquetadas. Los splits (70/10/20) se crearon de forma estratificada y agrupada por respuesta original, garantizando que ninguna oración de una misma respuesta cruzara splits (protocolo sin fuga de datos). No se emplearon técnicas de RLHF ni DPO; el entrenamiento fue supervisado con etiquetas humanas y, parcialmente, con un ensamble NLI validado contra 206 etiquetas humanas (acuerdo del 96,6%).

## Capacidades

- Clasificación de sentimiento en tres clases (NEGATIVE, NEUTRAL, POSITIVE) para texto en español.
- Detección de negatividad implícita: identifica quejas formuladas como sugerencias o peticiones de mejora.
- Análisis de clima organizacional a partir de respuestas abiertas de encuestas.
- Procesamiento de oraciones individuales (segmentación previa recomendada).
- Inferencia rápida y ligera, adecuada para entornos con recursos limitados.
- No soporta generación de texto, tool calling, agentes, visión ni audio.

## Casos de uso

- Análisis de encuestas de clima laboral: el modelo clasifica automáticamente cada respuesta abierta en negativa, neutral o positiva, permitiendo a los equipos de RRHH cuantificar el sentimiento general de la plantilla sin lectura manual.
- Detección temprana de quejas: al capturar negatividad implícita en sugerencias ("Mejorar el sueldo", "Que los jefes escuchen a su equipo"), facilita la identificación de problemas subyacentes que otros clasificadores pasan por alto.
- Priorización de intervenciones: los resultados por departamento o área permiten focalizar acciones de mejora en los colectivos con mayor proporción de respuestas negativas.
- Monitorización temporal: aplicado a encuestas periódicas, el modelo permite seguir la evolución del clima organizacional a lo largo del tiempo y evaluar el impacto de políticas internas.
- Filtrado y enrutamiento de comentarios: integrado en un sistema de gestión de encuestas, puede etiquetar automáticamente cada respuesta y derivar las negativas a un responsable para seguimiento.
- Investigación académica en RRHH: sirve como herramienta de análisis para estudios sobre satisfacción laboral en instituciones educativas, con una precisión documentada y reproducible.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados sobre el test limpio (n = 1.244):

| Metrica | Valor |
|---|---|
| Accuracy | 0,866 [IC 95%: 0,847–0,884] |
| F1-macro | 0,798 [0,772–0,824] |
| F1 NEGATIVE | 0,858 |
| F1 NEUTRAL | 0,590 |
| F1 POSITIVE | 0,946 |
| ROC-AUC macro (OvR) | 0,945 |

Frente a LLMs de frontera en modo zero-shot sobre el mismo test, el modelo alcanza paridad en accuracy pero supera en F1-macro en +0,17 a +0,20 (bootstrap pareado, p < 0,001). Los LLMs evaluados colapsan en la clase NEUTRAL, con F1 de 0,079 y 0,012 respectivamente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en FP32 (278,8 M parámetros × 4 bytes) y 0,56 GB en FP16. Con cuantización a 8 bits, se reduce a unos 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060 o superiores funcionan sin problemas. También es viable en CPU para inferencia por lotes pequeños.
- Cabe en GPUs de consumo: sí, incluso en las gamas más bajas.
- Opciones de despliegue: transformers (pipeline de HuggingFace), ONNX Runtime, TorchScript, o servidores de inferencia como FastAPI. No requiere vLLM ni TGI por su tamaño reducido.
- Latencia estimada: en una GPU moderna (RTX 3090), la inferencia por oración es del orden de milisegundos; en CPU, decenas de milisegundos. No se dispone de mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1-macro (test NegClima) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| negclima-mdeberta-v3 | 278,8 M | no disponible | 0,798 | MIT | HuggingFace |
| microsoft/mdeberta-v3-base (sin fine-tune) | 278,8 M | 512 (típico) | no aplicable (no clasificador) | MIT | HuggingFace |
| LLM de frontera A (zero-shot) | no disponible | no disponible | ~0,60 (estimado según diferencia reportada) | propietaria | API |
| LLM de frontera B (zero-shot) | no disponible | no disponible | ~0,60 (estimado) | propietaria | API |

Nota: los valores de los LLMs se estiman a partir de la diferencia de +0,17 a +0,20 en F1-macro reportada en la model card, no de mediciones directas. No se dispone de comparaciones con otros clasificadores fine-tuned en español.

## Limitaciones y advertencias

- Dominio único: el modelo se entrenó exclusivamente con respuestas de una universidad colombiana; la generalización a otros sectores (empresas privadas, administración pública, otros países) no está validada.
- Clase NEUTRAL difícil: el F1 de 0,590 indica que la distinción entre neutral y negativo es ambigua, incluso para anotadores humanos. En producción, se recomienda revisar manualmente las predicciones de esta clase.
- Etiquetado parcialmente automático: parte de las etiquetas de la pregunta positiva provienen de un ensamble NLI, no de anotación humana directa, aunque se validó contra 206 etiquetas humanas con un acuerdo del 96,6%.
- Sin soporte multilingüe: el modelo solo procesa español; no es adecuado para otros idiomas.
- Sin capacidad generativa: no puede producir texto, solo clasificar secuencias de entrada.
- Riesgo de alucinación: al ser un clasificador, no genera contenido, pero puede asignar etiquetas incorrectas en entradas fuera de su dominio de entrenamiento.
- Restricciones de uso: la licencia MIT permite uso comercial sin restricciones, pero se recomienda validar el rendimiento en el dominio objetivo antes de desplegarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EdwinDracoHiguera/negclima-mdeberta-v3
- Repositorio de DeBERTa (Microsoft): https://github.com/microsoft/DeBERTa
- Modelo base mdeberta-v3-base: https://huggingface.co/microsoft/mdeberta-v3-base
- Demo interactiva para RRHH: https://main.dqlpgutcvit7x.amplifyapp.com
