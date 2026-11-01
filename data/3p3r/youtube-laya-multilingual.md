# 3p3r/youtube-laya-multilingual

## Resumen

`youtube-laya-multilingual` es un fine-tune del modelo `convaiinnovations/laya-multilingual` (basado en la arquitectura mmBERT, con vocabulario de 256k tokens) desarrollado por el usuario 3p3r. El modelo resuelve una tarea concreta de clasificación de texto: determinar si un fragmento de texto (título, descripción, comentario, transcripción o extracto de política) describe contenido que las normas de la comunidad de YouTube no permiten. No analiza vídeo, solo texto.

La relevancia del checkpoint está en su metodología: se entrena con RLCD (Reinforcement Learning from Contrastive Data, según la nomenclatura del autor) sobre las propias Community Guidelines de YouTube en los 80 idiomas del Help Center que tienen traducciones reales y que mmBERT puede procesar. El resultado es una mejora sustancial frente al modelo base en la tarea específica: la accuracy macro en el hold-out de directrices pasa de 0,850 (zero-shot) a 0,969, y la accuracy por bucket de política sube de 0,206 a 0,797.

El modelo tiene 321.908.998 parámetros y un tamaño de repositorio de 1,3 GB, lo que lo sitúa en la gama de modelos encoder de tamaño medio, adecuado para moderación a escala con coste de inferencia bajo (3,5 ms por muestra en el hold-out de directrices). Está publicado con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mmBERT (encoder transformer, vocabulario de 256k tokens) |
| Parametros totales | 321.908.998 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingüe (80 idiomas del Help Center de YouTube con traducción real y legibles por mmBERT) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `convaiinnovations/laya-multilingual`, un encoder mmBERT con vocabulario de 256k tokens. Laya formula la clasificación como una pregunta de sí/no con criterios explícitos: el modelo recibe una instrucción ("Does the following text describe content that YouTube's Community Guidelines do not allow?") junto con el texto a evaluar y produce una puntuación continua. La clase positiva es "contenido no permitido por las directrices".

El entrenamiento se realizó con RLCD sobre las Community Guidelines de YouTube en los 80 idiomas del Help Center que son traducciones reales y que mmBERT puede leer. Una pasada posterior añade títulos de vídeo ordinarios cortos y líneas de violación cortas, porque las secciones de directrices son largas y las cortas son mayoritariamente violaciones, lo que provocaba que títulos cotidianos se puntuaran como no permitidos. El hold-out de directrices y los cuatro benchmarks externos quedaron fuera del entrenamiento. La temperatura de la capa Noul es 0,5 y el umbral de decisión es 0,5.

## Capacidades

- Clasificación binaria de texto según las normas de la comunidad de YouTube (permitido / no permitido).
- Evaluación de títulos, descripciones, comentarios, transcripciones y extractos de políticas.
- Clasificación multilingüe en los idiomas del Help Center de YouTube cubiertos por mmBERT.
- Puntuación continua con umbral configurable (0,5 por defecto) y temperatura Noul de 0,5.
- Detección de spam (mejora en UCI YouTube spam de 0,619 a 0,743).
- Detección de toxicidad y odio multilingüe (mejora en Jigsaw multilingual de 0,489 a 0,561 y en Multilingual HateCheck de 0,629 a 0,695).
- No soporta tool calling, function calling, agentes, visión ni audio: es un clasificador de texto, no un modelo generativo.

## Casos de uso

- Moderación previa de metadatos en plataformas de vídeo: el modelo evalúa títulos y descripciones antes de publicar y marca los que infringen las directrices, con 3,5 ms por muestra, lo que permite filtrar en tiempo real.
- Filtrado de comentarios a escala: al procesar texto plano con un encoder de 322M parámetros, se puede desplegar en CPU o GPU de gama media para moderar volúmenes altos de comentarios en varios idiomas.
- Triaje de colas de revisión humana: el modelo prioriza los casos con puntuación alta de "no permitido" para que los moderadores revisen primero el contenido más probablemente infractor.
- Detección de spam y captación de suscriptores: el ejemplo de la model card ("Buy 10000 subscribers. WhatsApp me.") ilustra el uso para identificar comentarios de compraventa de interacciones.
- Cumplimiento multilingüe: al cubrir los 80 idiomas del Help Center, permite aplicar un criterio homogéneo de moderación a comunidades internacionales sin modelos por idioma.
- Auditoría de políticas: el modelo puede puntuar extractos de directrices y textos de ejemplo para validar que las reglas internas se interpretan de forma consistente antes de desplegarlas.

## Benchmarks y rendimiento

Resultados publicados en la model card. La columna "guideline hold-out" es la métrica preregistrada (accuracy macro por idioma); el resto son comprobaciones de transferencia.

| Modelo | guideline hold-out | YouToxic toxic | YouToxic hate | YouToxic obscene | YouToxic threat | UCI YouTube spam | Jigsaw multilingual | Multilingual HateCheck |
|---|---|---|---|---|---|---|---|---|
| laya-multilingual (zero-shot) | 0,850 | 0,664 | 0,406 | 0,418 | 0,123 | 0,619 | 0,489 | 0,629 |
| youtube-laya-multilingual (este checkpoint) | 0,969 | 0,708 | 0,401 | 0,369 | 0,091 | 0,743 | 0,561 | 0,695 |

Métricas adicionales del hold-out: accuracy macro 0,9487 frente a 0,7409 del zero-shot; F1 binario 0,969 (precisión 0,950, recall 0,989) frente a 0,850 (precisión 0,770, recall 0,948); accuracy por bucket de política 0,797 frente a 0,206.

Latencia por muestra en el hold-out de directrices (452 secciones): 3,5 ms/muestra para este checkpoint frente a 3,6 ms/muestra del modelo base. No se registró el tiempo en Jigsaw.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 322M parámetros en fp32 los pesos ocupan aproximadamente 1,3 GB, y en fp16 alrededor de 0,65 GB, más el overhead de activaciones.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para fp16; A100, H100, RTX 4090 o RTX 3090 son sobredimensionadas para este modelo y permitirían lotes grandes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM (por ejemplo, RTX 3060 en adelante).
- Opciones de despliegue: la model card documenta el paquete `laya` (`laya.load(..., device="cuda")`). No se especifican integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un encoder de clasificación, el despliegue típico sería con Transformers o un servidor de inferencia de clasificación.
- Latencia y throughput: 3,5 ms por muestra en el hold-out de directrices, medido en el entorno del autor (hardware no especificado).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| youtube-laya-multilingual | 321.908.998 | no disponible | hold-out 0,969; F1 0,969 | Apache-2.0 | Hugging Face |
| laya-multilingual (base, zero-shot) | no disponible en la información | no disponible | hold-out 0,850; F1 0,850 | Apache-2.0 | Hugging Face |
| Alternativas de moderación multilingüe | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación directa disponible en la información es con el modelo base zero-shot, que este checkpoint supera en la tarea específica. No se han proporcionado datos de otros clasificadores de moderación comparables.

## Limitaciones y advertencias

- Solo clasifica texto: no analiza vídeo, audio ni imágenes, pese al nombre del modelo.
- El modelo está especializado en las directrices de YouTube; su transferencia a otras políticas de moderación no está validada.
- En YouToxic hate (0,401 frente a 0,406) y YouToxic obscene (0,369 frente a 0,418) el checkpoint empeora ligeramente respecto al base; en YouToxic threat baja de 0,123 a 0,091. La mejora se concentra en el hold-out de directrices, spam y Jigsaw.
- La cobertura lingüística se limita a los 80 idiomas del Help Center con traducción real y legibles por mmBERT; otros idiomas no están garantizados.
- El umbral de 0,5 y la temperatura Noul de 0,5 son valores fijados por el autor; cambiarlos altera la calibración.
- Es necesario pasar el texto en crudo: un objeto JSON es una cadena distinta de la usada en entrenamiento y en la demo, lo que puede degradar las predicciones.
- Riesgo de falsos positivos en títulos cotidianos: el autor documenta que el modelo base puntuaba títulos ordinarios como no permitidos y que se añadió una pasada correctiva, pero el equilibrio entre precisión y recall (precisión 0,950, recall 0,989) favorece la detección agresiva.
- No se han publicado análisis de sesgos demográficos o culturales.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener sus propias condiciones; conviene revisar la licencia de `convaiinnovations/laya-multilingual`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3p3r/youtube-laya-multilingual
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales.
