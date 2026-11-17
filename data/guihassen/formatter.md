# guihassen/formatter

## Resumen

Formatter es un modelo de clasificación de tokens desarrollado por guihassen, concebido como un posprocesador ligero para texto procedente de dictado transcrito automáticamente (por ejemplo, con Whisper). Su función es limpiar la salida cruda del ASR eliminando muletillas, reinicios y autocorrecciones, y añadiendo comas, puntos y signos de interrogación, sin reescribir ni inventar palabras. Está afinado sobre `microsoft/Multilingual-MiniLM-L12-H384`, una arquitectura transformer de 12 capas con dimensión oculta 384 y 117.507.845 parámetros totales, y está pensado para ejecutarse en CPU.

El modelo resuelve un problema concreto: las transcripciones de voz contienen disfluencias y carecen de puntuación, lo que las hace poco legibles y difíciles de reutilizar. En lugar de generar texto nuevo como haría un LLM, Formatter etiqueta cada palabra con una de cinco clases (`KEEP_NONE`, `KEEP_COMMA`, `KEEP_PERIOD`, `KEEP_QUESTION`, `DELETE`), lo que garantiza por diseño que no puede alterar el contenido léxico original. Está disponible en portugués e inglés y se distribuye bajo licencia MIT.

Fue creado para DronsioFlow, una aplicación de dictado por voz 100 % local para Linux, lo que explica su orientación a eficiencia: procesa un dictado de 60 palabras en aproximadamente 30-50 ms en la CPU de un portátil. Su relevancia radica en que cubre un nicho poco atendido (limpieza de dictado en local, sin dependencia de APIs) y lo hace con un modelo pequeño, determinista en su vocabulario y de licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-style), `Multilingual-MiniLM-L12-H384`: 12 capas, hidden size 384, con cabeza de clasificación de tokens de 5 clases |
| Parametros totales | 117.507.845 (aproximadamente el 82 % en la tabla de embeddings) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 128 piezas de tokenizador por ventana; textos más largos se etiquetan en ventanas solapadas |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | Portugués (pt) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/Multilingual-MiniLM-L12-H384`, un encoder transformer de 12 capas y 384 dimensiones ocultas, y le añade una cabeza de clasificación de tokens con cinco etiquetas. Utiliza el tokenizador de XLM-RoBERTa. La mayor parte de los parámetros (en torno al 82 %) reside en la tabla de embeddings, lo que explica tanto su tamaño como su velocidad en CPU. La entrada se procesa en ventanas de hasta 128 piezas, con solapamiento para textos más largos.

No existe un corpus público grande de dictados etiquetados de esta forma, por lo que el entrenamiento se realizó con datos sintéticos: frases limpias de Tatoeba (pares inglés-portugués, CC BY 2.0 FR) agrupadas en textos de hasta 6 frases, convertidas a minúsculas, sin puntuación y corrompidas con errores típicos del habla (muletillas como "ahn", "tipo", "um", "like"; palabras repetidas y reinicios; correcciones de palabra, grupo y cláusula completa, usando vecinos de Word2Vec para elegir sustituciones plausibles; falsos arranques sin palabra desencadenante). Se añadieron negativos duros que deben conservarse, como enumeraciones paralelas y usos discursivos de "na verdade," / "actually,". El conjunto consta de 135.346 ejemplos de entrenamiento y 7.103 de validación, con un 17,3 % de palabras etiquetadas como `DELETE`. La versión 2 (la publicada) continúa el entrenamiento de la v1 durante una época adicional con learning rate 3e-5, batch size 32, solo CPU y unas 6 horas de cómputo.

## Capacidades

- Etiquetado por palabra para limpieza de dictado: conservar, añadir coma, añadir punto, añadir interrogación o eliminar.
- Eliminación de muletillas, repeticiones, reinicios y autocorrecciones (de palabra, grupo y cláusula).
- Puntuación automática básica (comas, puntos y signos de interrogación) y capitalización derivada de la puntuación: la palabra tras un punto o interrogación se capitaliza.
- Preservación del léxico: al ser clasificación de tokens, no puede inventar ni sustituir palabras.
- Procesamiento de textos largos mediante ventanas solapadas (gestionado por `predict.py` del repositorio).
- Multilingüe limitado a portugués e inglés.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Limpieza de transcripciones de Whisper en aplicaciones de dictado local: el modelo recibe la salida cruda del ASR y devuelve texto puntuado y sin disfluencias, ejecutándose en CPU en decenas de milisegundos, lo que permite integrarlo en el flujo de captura sin latencia perceptible.
- Integración en DronsioFlow y apps similares de dictado para Linux: al ser 100 % local y de licencia MIT, encaja en herramientas de escritorio que no pueden enviar audio o texto a servicios externos por privacidad.
- Posprocesado de subtítulos y notas de reuniones: transcripciones de reuniones o vídeos pueden pasar por el modelo para ganar legibilidad antes de archivarlas o publicarlas, conservando literalmente las palabras pronunciadas.
- Preprocesado para pipelines de NLP posteriores: al eliminar reinicios y correcciones, el texto resultante es más adecuado para resumen, búsqueda o traducción automática, sin riesgo de que el limpiador introduzca contenido nuevo.
- Dictado en entornos con recursos limitados: portátiles, Raspberry Pi o contenedores sin GPU pueden ejecutar el modelo por su tamaño reducido y su coste de inferencia bajo.
- Corrección de texto dictado en portugués e inglés en herramientas de accesibilidad: usuarios que dictan por limitaciones motoras obtienen texto legible y puntuado sin depender de la nube.
- Como componente de un sistema ASR híbrido: se puede encadenar tras Whisper para aplicar la regla de seguridad de borrado (aceptar `DELETE` solo si su logit supera al mejor `KEEP_*` en al menos 1,0), reduciendo el borrado de palabras reales.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de validación sintético (7.103 ejemplos, argmax simple):

| Etiqueta | Precision | Recall | F1 |
|---|---|---|---|
| KEEP_NONE | 0.988 | 0.992 | 0.990 |
| DELETE | 0.986 | 0.978 | 0.982 |
| KEEP_PERIOD | 0.945 | 0.958 | 0.952 |
| KEEP_QUESTION | 0.910 | 0.844 | 0.876 |
| KEEP_COMMA | 0.828 | 0.784 | 0.805 |

- Macro F1: 0.921 (v1 en el mismo conjunto: 0.840).
- Palabras reales borradas: 0,30 % (v1: 1,46 %). Recall de `DELETE`: 97,8 % (v1: 85,8 %).
- Ejemplos completamente correctos: 66,1 % (v1: 47,2 %).
- Con la regla de seguridad a 1,0 (3.000 ejemplos de validación): 0,18 % de palabras reales borradas y 96,7 % de recall de `DELETE`.
- Sobre 20 extractos cortos de dictados reales corregidos a mano (277 palabras, elegidos donde v1 tenía menor confianza): v1 acertó el 88,1 % de las etiquetas y v2 con la regla de seguridad el 85,9 %. El propio autor advierte que es una comprobación de sanidad, no un benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (117,5 M de parámetros, aproximadamente 0,47 GB de pesos); no se documentan requisitos de VRAM específicos.
- GPU recomendadas: no es necesario GPU; el modelo está diseñado para CPU. Cualquier GPU consumer (por ejemplo, RTX 4090 o inferiores) puede ejecutarlo, pero no aporta una ventaja significativa frente a CPU para este tamaño.
- Cabe en cualquier GPU consumer y en CPU de portátil; el autor reporta 30-50 ms para un dictado de 60 palabras en CPU de portátil.
- Opciones de despliegue: `transformers` (con `AutoModelForTokenClassification` y `AutoTokenizer`); el repositorio ofrece `formatter/predict.py` para manejar puntuación de Whisper, textos largos y la regla de seguridad de borrado. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: aproximadamente 30-50 ms por dictado de 60 palabras en CPU de portátil; throughput no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, el modelo base `microsoft/Multilingual-MiniLM-L12-H384` comparte arquitectura y tamaño (12 capas, 384 dimensiones ocultas), pero es un encoder multilingüe de propósito general sin cabeza de clasificación de dictado; Formatter lo extiende con una tarea específica. No se han encontrado en la información disponible alternativas directas de limpieza de dictado con etiquetado por token para comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Datos de entrenamiento sintéticos: los patrones de error del habla real pueden no estar cubiertos por el generador, lo que puede degradar el rendimiento fuera del dominio sintético.
- Las comas son la etiqueta más débil (F1 0,805) y muchas son opcionales, por lo que la puntuación con comas puede diferir de la esperada.
- Las preguntas sin señal léxica ("você vem amanhã") son ambiguas; se recomienda conservar el "?" de Whisper al integrar el modelo.
- Las correcciones cortas con poco contexto ("we should deploy on friday no wait on monday") pueden provocar el borrado de la palabra equivocada.
- Riesgo de borrado de palabras reales: 0,30 % con argmax simple y 0,18 % con la regla de seguridad; el propio autor señala que borrar una palabra real es el peor error, por lo que recomienda aplicar dicha regla.
- Cobertura lingüística limitada a portugués e inglés; no se documenta soporte para otros idiomas.
- No se documentan sesgos específicos más allá de los derivados de los datos de Tatoeba y de los patrones sintéticos.
- Licencia MIT: permite uso comercial, pero no se documentan garantías ni restricciones adicionales; conviene revisar el repositorio para condiciones de los datos de entrenamiento (Tatoeba es CC BY 2.0 FR).
- No apto para reescritura, resumen o generación: su diseño de etiquetado por token impide cambiar palabras, lo que también limita su uso a la tarea de limpieza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guihassen/formatter
- Repositorio del proyecto (código, datos y explicación): https://github.com/guihassen/Formatter
- Aplicación DronsioFlow: https://github.com/guihassen/DronsioFlow
- Modelo base: https://huggingface.co/microsoft/Multilingual-MiniLM-L12-H384
- Tatoeba (datos de entrenamiento): https://tatoeba.org
