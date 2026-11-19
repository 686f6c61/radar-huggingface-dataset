# jaredpalmer/kev-9b

## Resumen

Kev-9B es un modelo de decisión desarrollado por Jared Palmer (TypeSafe) que responde preguntas tipadas sobre un documento de entrada devolviendo una distribución de probabilidad calibrada sobre las opciones proporcionadas, sin generar texto. Se construye como un adaptador LoRA y una cabeza pointer sobre el backbone congelado Qwen3.5-9B-Base, y se sirve en una única GPU de clase 24 GB. Implementa la API pública System One de TypeSafe (`POST /v1/systemone`), por lo que el SDK de TypeSafe funciona sin cambios contra él.

El modelo resuelve un problema concreto: clasificación, enrutado, triaje y verificación de documentos con probabilidades que se pueden umbralizar, por ejemplo para derivar los casos inciertos a revisión humana. A diferencia de un LLM generativo, no produce texto libre: recibe un estado (texto o JSON renderizado) y una o varias preguntas de tipo `choice`, `score` o `noul`, y devuelve una probabilidad por opción en un solo forward pass de prefill.

La versión 2 (Kev 1.0), publicada el 30 de septiembre de 2026, añade etapas de entrenamiento sobre documentos y registros de habilidades respecto a la v1. El adaptador y la cabeza se distribuyen con licencia Apache-2.0, igual que el modelo base, y el repositorio ocupa 0,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión: backbone causal prefill-only con cabeza pointer sobre las opciones; backbone híbrido de 32 capas (24 Gated DeltaNet de atención lineal y 8 de atención completa), hidden size 4.096 |
| Parametros totales | 9B en el backbone (congelado) más 45,4M en el adaptador LoRA |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Estados de hasta 65.536 tokens servidos, más al menos 8.192 tokens por pregunta; contexto validado de 8.192 tokens; estados de entrenamiento de hasta 7.552 tokens |
| Tipos de cuantizacion | no disponible (servido en bf16; adapter fusionado en el base al cargar) |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 (adaptador y cabeza); el modelo base también es Apache-2.0 |
| Formato de pesos | safetensors (librería PEFT; adaptador LoRA y `head.pt` con la temperatura de calibración) |

## Arquitectura y entrenamiento

Kev-9B no es un transformer generativo al uso. El backbone Qwen3.5-9B-Base (revisión `68c46c4b`) permanece congelado y se ejecuta únicamente en modo prefill: el estado se computa una vez y se cachea, y cada pregunta se responde como una fila propia que continúa desde ese estado compartido, de modo que las preguntas no pueden influirse entre sí. Sobre el backbone se aplica un adaptador LoRA de rango 16 y α 32 sobre las proyecciones de atención, MLP y DeltaNet (45,4M parámetros). La cabeza es un pointer head: dos proyecciones puntúan el token de cierre de cada opción contra el token final de la pregunta y un softmax produce las probabilidades.

El entrenamiento se realizó con autocast bf16 sobre pesos fp32 y la evaluación en fp32. La calibración se resuelve con una única temperatura, T = 2,19, almacenada en `head.pt` y aplicada al cargar. Los datos de entrenamiento combinan conjuntos públicos de clasificación y comprensión (banking77, boolq, ag_news, multi_nli, sst5, yelp_review_full, trec, dbpedia_14, amazon_reviews_multi_en, imdb), datos de tooling para desarrolladores (commitpackft), seguridad de contenido (Aegis-AI-Content-Safety-Dataset-2.0) y narrativas de quejas financieras (consumer-finance-complaints-large); la model card no detalla el número total de tokens ni la composición exacta del dataset. La v2 añade etapas de documentos y registros de habilidades respecto a la v1, que empleaba la misma receta sin esas etapas y una temperatura de 2,30.

## Capacidades

- Decisión tipada sobre documentos: preguntas `choice` (1–255 opciones con descripción opcional), `score` (1–255 niveles ordenados) y `noul` (sí/no con descripciones opcionales).
- Salida de probabilidad calibrada por opción, opción más probable y confianza, apta para umbralizar y derivar casos a revisión humana.
- Procesamiento de estados en texto plano o JSON (objeto o array) renderizado como texto etiquetado.
- Caché del estado: se computa una vez y sirve para múltiples preguntas independientes en una sola pasada.
- Clasificación, enrutado, triaje, elección de extracción, verificación de políticas y elegibilidad, y evaluación de una respuesta propuesta contra criterios declarados.
- Compatibilidad con la API System One de TypeSafe (`POST /v1/systemone`) y con su SDK sin modificaciones.
- Punto de partida para fine-tuning con etiquetas propias mediante `kev.train --init_from jaredpalmer/kev-9b`.
- No soporta generación de texto, chat, resumen ni respuesta abierta; solo puntúa las opciones recibidas.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket como estado y una pregunta `choice` con las categorías del equipo; la probabilidad por categoría permite enrutar automáticamente los casos con confianza alta y encolar el resto para revisión.
- Verificación de políticas y elegibilidad: con la política y los datos del solicitante en el estado, una pregunta `noul` devuelve la probabilidad de cumplimiento, que se compara con un umbral fijado sobre una muestra etiquetada del propio flujo de trabajo.
- Clasificación de documentos financieros: la model card reporta 0,900 de accuracy en `documents-v1` sobre narrativas de quejas de la CFPB, lo que lo hace adecuado para categorizar reclamaciones y detectar las que requieren escalado.
- Moderación y seguridad de contenido: entrenado con Aegis-AI-Content-Safety-Dataset-2.0, puede puntuar si un texto incumple una política concreta mediante preguntas `noul` con descripciones de la política.
- Herramientas para desarrolladores: con 0,791 de accuracy en `devtools-v1` sobre seis fuentes públicas de tooling, sirve para clasificar issues, commits o mensajes de error en categorías de acción.
- Evaluación de respuestas generadas: dado un contexto y una respuesta candidata, una pregunta `score` sobre niveles ordenados de corrección permite puntuar la calidad sin invocar un segundo LLM generativo.
- Sustitución autoalojada de un endpoint System One: al implementar la misma API, se despliega en una GPU de 24 GB y el SDK existente sigue funcionando sin cambios.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Evaluación | Conjunto de test | Métrica | Valor |
|---|---|---|---|
| Decisiones tipadas, fuera de dominio (test bloqueado, leído una vez) | transfer-v4: seis fuentes públicas nunca entrenadas y estructuras de política reservadas (656 preguntas) | accuracy | 0,852 |
| Decisiones tipadas, fuera de dominio | transfer-v4 (656 preguntas) | brier score | 0,199 |
| Decisiones tipadas, datasets públicos reservados | breadth-v1: 14 datasets públicos reservados (3.089 preguntas) | accuracy | 0,698 |
| Decisiones tipadas, registros de habilidades | hard-v1 (1.088 preguntas; etiquetas programáticas, plantillas reservadas) | accuracy | 0,834 |
| Decisiones tipadas, tooling para desarrolladores | devtools-v1 (1.071 preguntas; seis fuentes públicas de tooling) | accuracy | 0,791 |
| Decisiones tipadas, documentos reales | documents-v1 (936 preguntas sobre narrativas de quejas de la CFPB) | accuracy | 0,900 |

## Requisitos de hardware

- VRAM estimada: el autor indica que cabe en una GPU de clase 24 GB; el backbone de 9B en bf16 requiere aproximadamente 18 GB de pesos, más el adaptador fusionado y la caché de estados.
- GPU recomendadas: RTX 4090 (24 GB), L40S (48 GB), A100 (40/80 GB), H100 (80 GB); cualquier GPU con al menos 24 GB de VRAM.
- Cabe en GPU de consumo: sí, en RTX 4090 y modelos con 24 GB o más.
- Opciones de despliegue: el autor proporciona la herramienta `kev` (repositorio `github.com/jaredpalmer/kev`) con el comando `kev.train --init_from jaredpalmer/kev-9b`; la model card no detalla soporte para vLLM, llama.cpp, Ollama o TGI, y al ser un adaptador PEFT con cabeza pointer y ejecución prefill-only, estos motores de inferencia generativa no son aplicables de forma directa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kev-9B | 9B (backbone congelado) + 45,4M LoRA | 65.536 tokens de estado; 8.192 validados | Decisión tipada con probabilidad calibrada, sin generación | Apache-2.0 | Hugging Face (`jaredpalmer/kev-9b`) |
| Qwen3.5-9B-Base | 9B | no disponible | LLM generativo base | Apache-2.0 | Hugging Face (`Qwen/Qwen3.5-9B-Base`) |
| Clasificadores tipo SetFit / encoder fine-tuned | 0,1–1B típicamente | 512–8.192 tokens | Clasificación supervisada por etiqueta fija | variable | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de decisión con calibración y API System One) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe declarado.
- No genera texto, no mantiene conversación, no resume ni responde preguntas abiertas; únicamente puntúa las opciones que se le entregan.
- No debe usarse para decisiones totalmente automatizadas con consecuencias legales, médicas, financieras, laborales o similares sobre personas sin revisión humana.
- No responde preguntas cuya respuesta dependa de hechos que no estén en el estado proporcionado.
- La calibración depende de una temperatura fija (T = 2,19); los umbrales de producción deben fijarse sobre una muestra etiquetada del flujo de trabajo real, no sobre los benchmarks publicados.
- El contexto validado es de 8.192 tokens, aunque se sirven estados de hasta 65.536; los estados de entrenamiento no superaron los 7.552 tokens, por lo que el rendimiento más allá del contexto validado no está garantizado.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- Riesgo de alucinación de etiqueta: al puntuar solo las opciones dadas, una pregunta mal formulada o un estado incompleto puede producir una distribución de probabilidad aparentemente segura pero incorrecta.
- Sesgos: no se documentan análisis de sesgo en la información disponible; el entrenamiento incluye narrativas de quejas financieras y datos de seguridad de contenido, cuya distribución puede no representar el dominio de despliegue.
- Licencia Apache-2.0 permite uso comercial tanto del adaptador como del modelo base; no se declaran restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaredpalmer/kev-9b
- Repositorio del proyecto: https://github.com/jaredpalmer/kev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Versión anterior (tag v1): https://huggingface.co/jaredpalmer/kev-9b/tree/v1
