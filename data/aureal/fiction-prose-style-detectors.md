# Aureal/fiction-prose-style-detectors

## Resumen

`fiction-prose-style-detectors` es una colección de cuatro clasificadores de secuencia a nivel de párrafo, desarrollados por Aureal, cuyo objetivo es distinguir prosa de ficción escrita por humanos de prosa generada por modelos. A diferencia de los detectores de texto IA genéricos, estos están entrenados sobre pares de escenas emparejadas: cada escena humana y su versión generada comparten trama, personajes, punto de vista y longitud, de modo que la única variable es el estilo de escritura. El modelo resultante aprende a identificar pasajes que "suenan a máquina" para que un escritor o un agente de escritura sepa dónde revisar su borrador.

Cada carpeta del repositorio contiene un modelo completo de clasificación de secuencias basado en `transformers` (etiqueta 1 = escrito por modelo). Dos de las variantes parten de `answerdotai/ModernBERT-base` y una de `FacebookAI/roberta-base`. El repositorio ocupa 2,3 GB e incluye los pesos en formato `safetensors`. La licencia es Apache 2.0, el idioma de trabajo es exclusivamente inglés y el modelo está pensado como herramienta de diagnóstico de estilo, no como prueba de autoría.

La relevancia actual reside en su enfoque metodológico: en lugar de entrenar sobre texto humano amateur (Reddit) frente a texto generado, la variante `glm-books` se entrena sobre escenas de novelas publicadas frente a reescrituras de esas mismas escenas por GLM-5.3 a partir de un esquema. Esto reduce el sesgo de "pulido = IA" que afecta a los detectores convencionales y produce una herramienta más fiable para prosa literaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base en `claude-writingprompts`, `glm-writingprompts` y `glm-books`; RoBERTa-base en `glm-books-check`) |
| Parametros totales | No disponible (el tamaño del repo es de 2,3 GB para las cuatro carpetas) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` |

## Arquitectura y entrenamiento

Los cuatro detectores son clasificadores de secuencia estándar de `transformers` con dos etiquetas (0 = humano, 1 = escrito por modelo). Tres usan `answerdotai/ModernBERT-base` como base y uno usa `FacebookAI/roberta-base`. El texto se corta en fragmentos de 60 o más palabras, los nombres de personajes se enmascaran como "Name" y las comillas, guiones y puntos suspensivos se normalizan antes de puntuar. La clasificación se hace por log-odds (logit 1 − logit 0), porque las probabilidades saturan.

Los datos de entrenamiento proceden de dos fuentes. Para las variantes `*-writingprompts`, se muestrearon historias de 1.000 a 3.000 palabras del dataset `euclaise/writingprompts` (Fan et al. 2018), y el lado "modelo" se generó con Claude base o GLM-5.3 con un system prompt mínimo y sin herramientas. Para `glm-books`, se usaron 927 escenas de 500 a 1.500 palabras extraídas de ocho novelas publicadas (*Brave New World*, *Piranesi*, *Strange the Dreamer*, *The Bell Jar*, *The City of Brass* —retenida—, *The House in the Cerulean Sea*, *The Night Circus* y *The Three-Body Problem*); Claude Haiku 5.5 parafraseó cada escena en un esquema y GLM-5.3 la reescribió a partir de ese esquema y de un resumen de la historia, sin ver nunca el original ni el título. El entrenamiento usó 3 épocas, learning rate 3e-5, longitud máxima de 256 tokens y batch de 16 (WritingPrompts) o 8 (libros).

## Capacidades

- Clasificación binaria a nivel de fragmento: distingue prosa humana de prosa generada por modelo (etiqueta 1 = escrita por modelo).
- Puntuación por log-odds para ordenar fragmentos de un borrador de mayor a menor "sospecha" de haber sido generado.
- Normalización previa de texto: enmascarado de nombres propios, normalización de comillas, guiones y puntos suspensivos.
- Cuatro variantes especializadas: dos orientadas a relatos de WritingPrompts, una a prosa literaria de novelas (`glm-books`) y una de control con base distinta (`glm-books-check`).
- Función de segunda opinión: `glm-books-check` sirve para confirmar hallazgos de `glm-books` y detectar si un revisor está "haciendo trampa" contra un detector concreto.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un clasificador.
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- Revisión de borradores literarios: un escritor introduce su manuscrito y el modelo marca los fragmentos que más se parecen a prosa generada, para revisarlos manualmente antes de publicar.
- Agentes de escritura asistida: un agente que redacta o edita ficción puede invocar el detector como herramienta para localizar pasajes que suenen a modelo y reescribirlos con voz propia.
- Control de calidad en pipelines editoriales: editoriales o plataformas de publicación pueden usar `glm-books` como señal de alarma sobre textos enviados, combinándolo con revisión humana.
- Investigación sobre detección de texto IA: el par de detectores `glm-books` y `glm-books-check`, entrenados sobre los mismos pares con bases distintas, permite estudiar la robustez y el sobreajuste de los clasificadores.
- Evaluación de modelos generadores de ficción: comparar la tasa de fragmentos marcados como generados entre distintos modelos o configuraciones de prompt (por ejemplo, con y sin system prompt) para medir cuánto "canta" su estilo.
- Formación de escritores: usar los porcentajes de fragmentos marcados como métrica objetiva en talleres de escritura para discutir qué rasgos estilísticos delatan a un modelo.
- Auditoría de contenido en comunidades de fan fiction: aplicar los detectores a textos de AO3 u otras plataformas para obtener una señal orientativa, siempre con advertencia de que no es prueba de autoría.

## Benchmarks y rendimiento

| Detector | Base | Exactitud en held-out | Conjunto de evaluacion |
|---|---|---|---|
| `claude-writingprompts` | ModernBERT-base | 98,9% | 300 pares, division por prompt |
| `glm-writingprompts` | ModernBERT-base | 99,6% | 259 pares, division por prompt |
| `glm-books` | ModernBERT-base | 97,0% | 926 pares, libro completo retenido |
| `glm-books-check` | RoBERTa-base | 96,4% | Mismos pares, dos libros completos retenidos |

Porcentaje de fragmentos marcados como escritos por modelo:

| Texto | `claude-writingprompts` | `glm-writingprompts` | `glm-books` |
|---|---|---|---|
| Gaiman, *The Ocean at the End of the Lane* | 61% | 24% | 19% |
| Relatos de r/WritingPrompts (held-out) | 3% | 1% | 2% |
| Fan fiction humano de AO3 | 6% | 3% | 5% |
| GLM-5.3 sin system prompt | 99% | 99% | 99% |
| Claude + skill, capitulos editados por el autor | 100% | 92% | 95% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de clasificadores basados en ModernBERT-base y RoBERTa-base (modelos encoder de tamaño base), la inferencia cabe holgadamente en GPUs de consumo, aunque el dato concreto no se publica.
- GPU recomendadas: no disponible; por el tamaño de los modelos base, cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) es suficiente en la práctica, pero el autor no especifica requisitos.
- Cabe en GPU consumer: sí, previsiblemente, dado que la base es un encoder base; sin cifras oficiales.
- Opciones de despliegue: `transformers` con PyTorch (dependencias indicadas: `torch`, `transformers`, `huggingface_hub`); descarga selectiva por carpeta con `hf download --include "glm-books/*"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fiction-prose-style-detectors` (este) | No disponible (base ModernBERT/RoBERTa) | 256 tokens | Deteccion de prosa de ficcion por pares emparejados | Apache 2.0 | Hugging Face |
| Detectores de texto IA genericos | No disponible | No disponible | Deteccion binaria humano/IA sobre texto general | Variable | Hugging Face |
| `Hello-SimpleAI/chatgpt-detector-roberta` | No disponible | No disponible | Deteccion de texto ChatGPT con RoBERTa | Variable | Hugging Face |

No se dispone de datos de benchmarks comparativos directos entre este modelo y alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El lado "modelo" de cada detector se generó con un único modelo (Claude o GLM-5.3); otros modelos comparten muchos de esos hábitos, pero no todos.
- `glm-books` aprendió la voz de GLM; marca con fuerza también la prosa de Claude, pero un detector entrenado sobre las versiones de Claude de las mismas escenas sería el juez justo para Claude.
- Solo inglés, y principalmente fantasía, literatura y ciencia ficción.
- Un extracto corto que recuente de cerca un libro conocido puede leerse como humano porque toma prestada la voz de ese autor.
- En las pruebas, ningún system prompt bajó a GLM-5.3 por debajo del 89% de fragmentos marcados, y Claude con el detector como herramienta alcanzó el rango humano en una escena: la herramienta puede ser eludida.
- Los detectores no son prueba de autoría y no deben usarse para acusar a nadie de usar IA.
- Las probabilidades saturan; hay que ordenar por log-odds, no por probabilidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo card advierte explícitamente contra el uso acusatorio.
- El repositorio no distribuye texto de los libros, esquemas ni generaciones usadas en el entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Aureal/fiction-prose-style-detectors
- Repositorio GitHub del skill: https://github.com/unkarelian/fiction-prose-style
- Dataset de WritingPrompts: `euclaise/writingprompts` (Fan et al. 2018)
- Modelo base ModernBERT: https://huggingface.co/answerdotai/ModernBERT-base
- Modelo base RoBERTa: https://huggingface.co/FacebookAI/roberta-base
