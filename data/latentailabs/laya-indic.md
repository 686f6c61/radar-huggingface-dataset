# LatentAILabs/laya-indic

## Resumen

laya-indic es un modelo de clasificación y decisión multilingüe desarrollado por LatentAILabs (lanzamiento personal independiente, sin vinculación con HAL-X AI) que responde preguntas tipadas en inglés sobre textos escritos en más de 30 idiomas, con especial énfasis en lenguas indias y hinglish. A diferencia de un clasificador convencional con etiquetas fijas, el modelo recibe en tiempo de inferencia un esquema de preguntas con tipos (`choice`, `noul`, `score`) y devuelve, en una sola pasada forward, una distribución de probabilidad calibrada sobre cada opción. Esto permite reutilizar el mismo modelo para tareas nuevas sin reentrenamiento.

Técnicamente se construye sobre el encoder `jhu-clsp/mmBERT-base` (MIT) con una cabeza de decisión de dos capas, sumando unos 322 millones de parámetros en total. El entrenamiento incluye un preentrenamiento continuado con enmascaramiento de lenguaje sobre 457 millones de tokens de texto web indio público (Sangraha) y una fase posterior de decisión con 521.752 decisiones, combinando 17 conjuntos de datos públicos con preguntas sintéticas verificadas generadas por modelos Qwen3 de pesos abiertos.

Su relevancia actual radica en dos puntos: cubre un hueco de cobertura para lenguas indias en tareas de enrutamiento, moderación y triaje con etiquetas definidas en caliente, y lo hace con licencia Apache-2.0 y datos de entrenamiento públicos. La model card advierte de que existe una versión posterior, Yama (v3, encoder XLM-RoBERTa-large), que obtiene 0.862 frente a 0.800 de este modelo en las mismas 67 tareas, por lo que laya-indic queda como la opción v2 del linaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-base) con cabeza de decisión de 2 capas; arquitectura de decisión THX-01 |
| Parametros totales | 321.908.998 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 1.024 tokens por pregunta (pregunta, opciones y texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 30+ idiomas; más fuerte en inglés, hindi, hinglish y otras 10 lenguas indias (bengalí, tamil, telugu, maratí, guyaratí, canarés, malabar, panyabí, urdu, oriya), además de azerí, kazajo, uzbeko, georgiano, turco, persa, ruso, alemán, francés, español, árabe, chino, japonés y coreano |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del encoder `jhu-clsp/mmBERT-base`, al que se añade una cabeza de decisión de dos capas que implementa la arquitectura THX-01 (librería `thx01`, Apache-2.0, de HAL-X AI). No se usan los pesos de THX-01, solo su diseño de decisión. Cada pregunta se formula en inglés y se procesa junto con el texto original en su idioma y escritura; el modelo devuelve una probabilidad por opción en una única pasada forward, sin generar texto.

El entrenamiento tiene dos fases. Primero, un preentrenamiento continuado con objetivo de modelado de lenguaje enmascarado sobre 457 millones de tokens de texto público: Sangraha (11 lenguas indias más inglés, CC-BY-4.0) y repetición de hinglish. La pérdida MLM en validación cayó entre un 7 % y un 25 % por idioma. Después, dos épocas sobre 521.752 decisiones: 285.078 procedentes de 17 conjuntos de datos públicos (entre ellos MASSIVE, Banking77, GoEmotions, Civil Comments, HelpSteer2, Aegis, Nemotron Safety Guard, LexGLUE, SMS Spam y Aya Red Teaming) y 236.674 preguntas sintéticas o sobre texto real generadas y verificadas con modelos Qwen3 de pesos abiertos. De estas últimas, 63.448 corresponden a 23.955 fragmentos reales de Sangraha en 11 idiomas, una novedad respecto a v1, que solo vio texto indio sintético.

## Capacidades

- Clasificación zero-shot con etiquetas definidas en tiempo de inferencia, sin reentrenamiento.
- Tres tipos de pregunta: `choice` (una de N opciones con probabilidad por opción), `noul` (probabilidad de sí) y `score` (nivel ordinal con distribución).
- Respuesta a múltiples preguntas sobre el mismo texto en una sola pasada forward.
- Procesamiento por lotes mediante `predict_batch`, con un esquema compartido o uno por texto.
- Cobertura multilingüe en más de 30 idiomas, con rendimiento más alto en inglés, hindi, hinglish y diez lenguas indias adicionales.
- Probabilidades calibradas, aptas para umbrales operativos y enrutamiento.
- Capacidad de clasificación de tema, intención, emoción, seguridad, calidad argumentativa, spam y sentimiento, según los conjuntos de entrenamiento.
- No soporta los tipos `number`, `excerpt` ni `"cite": true` de THX-01; no fue entrenado para ellos.
- No es un modelo generativo: no produce texto libre, tool calling ni razonamiento multi-paso.

## Casos de uso

- Triaje de tickets de soporte en India: el modelo clasifica en una pasada el tema (`failed_payment`, `refund`, `account`) y la urgencia de mensajes en hindi, hinglish o tamil, como muestra el ejemplo de la model card con un texto sobre un pago UPI fallido.
- Enrutamiento de atención al cliente: con un esquema `choice` se asigna cada conversación al equipo adecuado; las probabilidades calibradas permiten fijar umbrales de derivación a humano cuando la confianza es baja.
- Moderación de contenido en lenguas indias: entrenado con Aegis, Nemotron Safety Guard y Civil Comments, puede etiquetar toxicidad, odio y seguridad en textos que los moderadores basados en inglés cubren mal.
- Análisis de sentimiento y emoción multilingüe: con preguntas tipo `score` se obtiene una escala ordinal de frustración o sentimiento; útil para paneles de voz del cliente en varios idiomas simultáneamente.
- Clasificación de noticias y documentos: con `choice` sobre titulares o fragmentos se categoriza contenido en flujos editoriales o de monitoreo de medios.
- Detección de spam y fraude en SMS: entrenado con `ucirvine/sms_spam`, sirve para filtrar mensajes sospechosos con una pregunta `noul` o `choice` en producción de bajo coste.
- Evaluación de calidad argumentativa: con `ibm-research/argument_quality_ranking_30k` puede puntuar la solidez de argumentos en foros o procesos de revisión.
- Etiquetado ad hoc sin reentrenamiento: al definir el esquema en inferencia, un equipo puede crear taxonomías nuevas sobre la marcha y validarlas antes de comprometerse a un entrenamiento específico.

## Benchmarks y rendimiento

La model card reporta precisión zero-shot en 67 tareas comparando con THX-01 (322M, misma arquitectura, unas 2,1M decisiones de entrenamiento) y con laya-indic v1, usando el mismo harness y los mismos prompts.

| Metrica | laya-indic v2 | laya-indic v1 | THX-01 |
|---|---|---|---|
| Precisión global (67 tareas) | 0.800 | 0.789 | no disponible en la información |
| SIB-200 tema indio | 0.670 | 0.626 | no disponible |
| SIB-200 en idiomas de THX-01 | 0.779 | 0.751 | no disponible |
| IndicSentiment | 0.884 | 0.892 | no disponible |

SIB-200 tema indio mejoró en 9 de 10 idiomas. IndicSentiment es la única familia que retrocedió. La model card menciona además que Yama (v3) alcanza 0.862 en las mismas 67 tareas frente a 0.800 de este modelo. No se han publicado resultados desglosados por tarea ni comparaciones numéricas con THX-01 en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 322M parámetros en fp32 son unos 1,3 GB de pesos; en fp16, unos 0,65 GB. El consumo real depende de la longitud de entrada (hasta 1.024 tokens por pregunta) y del tamaño de lote.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más; también en CPU para volúmenes moderados.
- GPU de centro de datos (A100, H100) solo necesarias para lotes grandes o alto throughput agregado.
- Despliegue mediante la librería `thx01` (`thx01.load("LatentAILabs/laya-indic")`), que usa GPU si está disponible; soporte de `predict_batch` con `batch_size` configurable (64 en el ejemplo).
- No se documentan opciones de vLLM, llama.cpp, Ollama ni TGI; el formato de pesos es safetensors y la librería declarada es `thx01`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (67 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-indic (v2) | 321,9M | 1.024 tokens por pregunta | 0.800 | Apache-2.0 | Hugging Face, revisión v1.0 para v1 |
| Yama (laya-indic v3) | no disponible (encoder XLM-RoBERTa-large) | no disponible | 0.862 | Apache-2.0 (según model card de laya-indic) | Hugging Face, modelo separado |
| THX-01 | 322M | no disponible | no disponible | no disponible en la información | Hugging Face (doofz/THX-01) |
| mmBERT-base (modelo base) | no disponible | no disponible | no aplica (encoder, no clasificador de decisión) | MIT | Hugging Face (jhu-clsp/mmBERT-base) |

La comparación directa más significativa es con THX-01, del que laya-indic hereda la arquitectura de decisión pero no los pesos, y con su propia versión posterior Yama, que la model card recomienda por su mayor precisión y mejor calibración.

## Limitaciones y advertencias

- La model card indica explícitamente que Yama (v3) es superior en precisión y calibración; laya-indic v2 queda como versión anterior del linaje.
- No soporta los tipos de pregunta `number`, `excerpt` ni citación, aunque THX-01 sí los contemple.
- Las preguntas deben formularse en inglés y el texto dejarse en su idioma y escritura originales; salirse de ese formato degrada el rendimiento.
- El campo `model` de la respuesta devuelve `"THX-01"` por defecto de la librería, no el nombre real de los pesos; conviene tenerlo en cuenta en registros y auditorías.
- Riesgo de alucinación de etiquetas: al definirse el esquema en inferencia, un criterio mal redactado o ambiguo produce asignaciones erróneas con alta confianza.
- Cobertura desigual: el rendimiento es más fuerte en inglés, hindi, hinglish y diez lenguas indias; el resto de los 30+ idiomas tiene menos evidencia reportada.
- IndicSentiment retrocedió de 0.892 a 0.884 en v2, señal de que las mejoras no son uniformes por familia de tarea.
- Parte del entrenamiento usa etiquetas generadas por Qwen3 verificadas, no anotación humana directa, lo que puede introducir sesgos del generador.
- Licencia Apache-2.0 permite uso comercial, pero la model card no documenta evaluación de sesgos por subgrupo ni auditoría de seguridad independiente.
- Es un modelo de decisión, no generativo: no debe usarse para diálogo, resumen ni generación de código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LatentAILabs/laya-indic
- Versión posterior Yama: https://huggingface.co/LatentAILabs/yama-indic
- Modelo base mmBERT: https://huggingface.co/jhu-clsp/mmBERT-base
- THX-01: https://huggingface.co/doofz/THX-01
- Librería thx01: https://pypi.org/project/thx01/
- Dataset Sangraha: https://huggingface.co/datasets/ai4bharat/sangraha
- Dataset laya-indic-synthetic: https://huggingface.co/datasets/LatentAILabs/laya-indic-synthetic
- Dataset laya-indic-real-text: https://huggingface.co/datasets/LatentAILabs/laya-indic-real-text
