# hf-wzx1205/PDO_S2TT

## Resumen

PDO_S2TT es un checkpoint de traducción de voz a texto simultánea (*streaming speech-to-text translation*, S2TT) publicado como material oficial de la submission al congreso ICASSP 2027, titulada «Persistent Delivery Optimization for Streaming Speech-to-Text Translation with Revisions». Lo firma el usuario de Hugging Face hf-wzx1205 y se distribuye como pesos de inferencia sobre el modelo base Qwen/Qwen3-ASR-1.7B, al que añade un adaptador LoRA y pesos de condicionamiento por historial.

El problema que ataca es específico de la traducción simultánea: en lugar de esperar a una frase completa, la política PDO recibe un prefijo creciente de audio en inglés junto con la traducción que ya se ha mostrado al usuario y decide en cada paso si esperar, añadir texto nuevo o revisar por completo el borrador visible. Esto permite emitir traducción con latencia baja y corregirla después, algo relevante para subtitulado en directo, interpretación automática y accesibilidad en tiempo real.

El checkpoint ocupa 0,1 GB en el repositorio y cubre cinco direcciones: inglés a chino, alemán, español, japonés y francés. La model card publica resultados en el conjunto de test de FLEURS medidos en una única RTX 4090, con un *macro* de 31,58 BLEU, 85,37 COMET y un *real-time factor* (RTF) de 0,54, es decir, funciona por debajo del tiempo real. El autor no libera datos, código de entrenamiento ni estado del optimizador, y restringe el uso previsto a investigación y reproducibilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de traducción simultánea condicionada por historial, implementada como adaptador LoRA sobre el modelo base Qwen/Qwen3-ASR-1.7B. La arquitectura interna del modelo base no se detalla en la model card. |
| Parámetros totales | 1,7 mil millones en el modelo base (Qwen3-ASR-1.7B); el tamaño del adaptador LoRA y de los pesos de condicionamiento no se especifica. El repositorio completo ocupa 0,1 GB. |
| Parámetros activos | No aplica: no es un modelo de mezcla de expertos (MoE). |
| Longitud de contexto | No disponible. |
| Tipos de cuantización | No disponible. Solo se publica el archivo `pdo_s2tt.pt` en precisión original; no se documentan versiones GGUF, AWQ, GPTQ ni INT8/INT4. |
| Idiomas soportados | Entrada: inglés (en). Salida: chino (zh), alemán (de), español (es), japonés (ja) y francés (fr). |
| Licencia | Apache License 2.0 (el modelo base Qwen/Qwen3-ASR-1.7B también es Apache-2.0). |
| Formato de pesos | PyTorch (`.pt`): un único archivo `pdo_s2tt.pt` con LoRA de solo inferencia y pesos de condicionamiento por historial. |

## Arquitectura y entrenamiento

PDO se define en la model card como una política *directa* de traducción de voz a texto en streaming condicionada por historial. En cada paso recibe dos entradas: un prefijo de voz en inglés que va creciendo y la traducción completa que ya está visible para el usuario. Sobre esa información puede ejecutar tres acciones: esperar, añadir contenido al final del borrador o reescribir por completo el borrador visible. Esa capacidad de revisión es la diferencia frente a las políticas de emisión incremental que solo añaden texto y nunca corrigen lo ya mostrado.

El checkpoint liberado contiene únicamente los pesos de inferencia: un adaptador LoRA y los pesos de condicionamiento por historial que se aplican sobre Qwen/Qwen3-ASR-1.7B. La model card indica explícitamente que no se incluyen el estado del optimizador, los datos de entrenamiento ni el código de entrenamiento, por lo que no es posible verificar el número de tokens usados, la composición del dataset ni si hubo etapas de RLHF o DPO. El código de inferencia y evaluación sí se publica en un repositorio de GitHub externo. Los resultados que se muestran a continuación se midieron sobre el conjunto de test de FLEURS, un corpus de voz multilingüe de referencia.

## Capacidades

- Traducción simultánea de voz a texto con entrada en inglés y salida en chino, alemán, español, japonés o francés.
- Emisión incremental en streaming: procesa un prefijo de audio creciente en lugar de exigir la frase completa.
- Revisión de la salida ya mostrada: la política puede reescribir el borrador visible, no solo añadir texto al final.
- Condicionamiento por historial: cada decisión depende de la traducción previamente desplegada, lo que permite mantener coherencia entre revisiones.
- Control de latencia mediante la acción de espera, con el objetivo de equilibrar calidad y retraso de emisión.
- Ejecución por debajo del tiempo real: RTF entre 0,39 y 0,59 según dirección en una RTX 4090.
- No documentado en la información disponible: soporte de *tool calling*, *function calling*, uso como agente, razonamiento multi-paso, modo *thinking*, visión, audio de salida o cualquier capacidad multimodal distinta de la entrada de voz.

## Casos de uso

- Subtitulado en directo de conferencias y webinars en inglés traducidos al español: el modelo emite subtítulos mientras habla el ponente y puede corregir una frase ya mostrada cuando el contexto posterior cambia el sentido, algo útil porque en una charla técnica las siglas y los nombres propios se aclaran tarde.
- Interpretación simultánea en reuniones multilingües: con cinco direcciones de salida (zh, de, es, ja, fr) y un RTF de 0,54 de media, un único despliegue puede atender varias salas con distinto idioma de destino sobre el mismo flujo de audio en inglés.
- Accesibilidad en retransmisiones en directo: generación de subtítulos traducidos para personas con discapacidad auditiva en eventos emitidos en inglés, donde la revisión del texto visible mejora la legibilidad frente a una salida puramente incremental.
- Investigación en traducción simultánea: el checkpoint está pensado para reproducir los resultados de la submission a ICASSP 2027 y para comparar políticas de emisión con revisiones, usando el código de inferencia y evaluación publicado por el autor.
- Generación de borradores de subtítulos para post-producción: el flujo traducido en streaming sirve como primera pasada sobre material audiovisual en inglés, que después se edita y se sincroniza en herramientas de subtitulado.
- Documentación y archivado de fondos audiovisuales: traducción automatizada de entrevistas, ruedas de prensa o grabaciones en inglés hacia los cinco idiomas soportados, con la ventaja de que el proceso es más rápido que el tiempo real en una sola GPU de gama alta.
- Asistencia a agentes humanos en atención al cliente en tiempo real: transcripción traducida de llamadas en inglés para que un operador hispanohablante siga la conversación con retardo reducido, siempre que se asuma el carácter de investigación del checkpoint.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test de FLEURS. La model card no define el significado de las siglas FTL, FRD y LAAL-CU, por lo que se reproducen tal cual.

| Dirección | BLEU ↑ | COMET ↑ | chrF++ ↑ | FTL ↓ | FRD ↓ | LAAL-CU media / P90 ↓ | RTF ↓ |
|---|---:|---:|---:|---:|---:|---:|---:|
| En→Zh | 38,16 | 86,31 | 26,92 | 2,00 | 2,33 | 3,53 / 6,61 | 0,39 |
| En→De | 29,57 | 84,22 | 57,03 | 2,00 | 2,42 | 3,08 / 5,65 | 0,57 |
| En→Es | 23,35 | 83,57 | 50,88 | 2,00 | 2,44 | 2,51 / 4,44 | 0,57 |
| En→Ja | 28,66 | 88,50 | 26,47 | 2,00 | 2,47 | 3,67 / 6,23 | 0,57 |
| En→Fr | 38,16 | 84,26 | 62,06 | 2,00 | 2,44 | 2,46 / 4,93 | 0,59 |
| Macro | 31,58 | 85,37 | 44,67 | 2,00 | 2,42 | 3,05 / 5,66 | 0,54 |

Notas sobre la tabla: los valores de FRD y RTF incluyen el cómputo medido y se obtuvieron en una única RTX 4090. El autor no publica comparación numérica contra otros sistemas de traducción simultánea en la información disponible. Los valores de BLEU de En→Zh y En→Fr coinciden exactamente (38,16), tal como figuran en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 3,4 GB solo para los pesos del modelo base de 1,7 mil millones de parámetros en bf16, más el adaptador LoRA (el repositorio completo ocupa 0,1 GB) y la memoria de activaciones del codificador de audio y la caché de claves y valores. Una estimación razonable en bf16 se sitúa en el rango de 6 a 8 GB, aunque el autor no publica cifras de VRAM; tómese como estimación, no como dato confirmado.
- GPU recomendadas: el autor ha medido todos los resultados en una RTX 4090, por lo que es la referencia validada. Cualquier GPU con al menos 8-12 GB de memoria y soporte de PyTorch debería poder ejecutar el modelo base, si bien no hay validación publicada en otras tarjetas.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090, RTX 4080, RTX 3090 y modelos con 12 GB o más, siempre que se disponga de memoria suficiente para el codificador de audio y la caché. No hay confirmación del autor para tarjetas de gama media o baja.
- Opciones de despliegue: el propio repositorio de inferencia y evaluación del autor (`ggiggit/PDO_S2TT`) sobre PyTorch. No hay soporte documentado en vLLM, llama.cpp, Ollama, TGI ni en runtimes de cuantización, y la política de streaming con revisiones es específica de este código, por lo que no es trasladable directamente a servidores de inferencia genéricos.
- Latencia y throughput: RTF de 0,39 (En→Zh), 0,57 (En→De, En→Es, En→Ja) y 0,59 (En→Fr), con una media de 0,54 en una RTX 4090. Al ser inferior a 1, el sistema procesa audio más rápido que el tiempo real. La latencia de emisión medida como LAAL-CU es de 2,46 a 3,67 segundos de media y de 4,44 a 6,61 segundos en el percentil 90, según la dirección.

## Comparativa con modelos similares

No se han publicado en la información disponible datos de rendimiento de otros sistemas de traducción simultánea de voz a texto con los que comparar directamente este checkpoint. La model card únicamente aporta los resultados propios sobre FLEURS y no incluye una tabla comparativa frente a alternativas.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PDO_S2TT | 1,7 mil millones (base) + LoRA | No disponible | Macro FLEURS: 31,58 BLEU, 85,37 COMET, RTF 0,54 en RTX 4090 | Apache-2.0 | Pesos de inferencia en Hugging Face + código en GitHub |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

El único punto de referencia documentado es el propio modelo base, Qwen/Qwen3-ASR-1.7B, sobre el que se aplica el adaptador, pero la model card no publica una comparación numérica entre ambos.

## Limitaciones y advertencias

- Cobertura de idiomas restringida: solo se ha validado la traducción desde inglés hacia chino, alemán, español, japonés y francés. El autor indica explícitamente que el rendimiento fuera de esas cinco direcciones no está establecido.
- Uso previsto limitado a investigación: la model card lo destina a investigación y reproducibilidad en traducción simultánea con revisiones, no a producción sin evaluación previa.
- Reproducibilidad incompleta: no se publican datos de entrenamiento, código de entrenamiento ni estado del optimizador, por lo que no es posible reentrenar ni auditar el proceso.
- Sin datos de sesgo ni de seguridad: no hay información sobre filtrado de contenido, alineación, sesgos de género o culturales, ni evaluación de toxicidad. Al ser un sistema de traducción, hereda los sesgos del modelo base y de los datos con los que este se entrenó.
- Riesgo de alucinación y de omisión: como cualquier sistema neuronal de traducción, puede generar contenido no presente en el audio de origen o dejar fragmentos sin traducir, especialmente con ruido, acentos no vistos o vocabulario de dominio específico.
- Inestabilidad visual por las revisiones: la capacidad de reescribir el borrador ya mostrado implica que el texto en pantalla puede cambiar, lo que puede resultar confuso en subtitulado si no se gestiona la interfaz.
- Dominio de evaluación acotado: los resultados proceden del conjunto de test de FLEURS, compuesto por voz leída y relativamente limpia. El comportamiento en habla espontánea, conversaciones solapadas o audio telefónico no está documentado.
- Requiere el modelo base aparte: el archivo `pdo_s2tt.pt` no es autosuficiente; necesita descargar y ejecutar Qwen/Qwen3-ASR-1.7B y usar el repositorio de inferencia del autor.
- Sin cuantizaciones oficiales: no se documentan versiones GGUF, AWQ, GPTQ o INT8, de modo que reducir los requisitos de memoria exige un proceso propio no validado por el autor.
- Licencia: los pesos del checkpoint y el modelo base se distribuyen bajo Apache-2.0, que permite uso comercial, pero los datos y referencias de FLEURS siguen sujetos a sus licencias originales.
- Métricas parcialmente indefinidas: la model card no explica el significado de FTL, FRD ni LAAL-CU, lo que dificulta interpretar y comparar esas cifras con otros trabajos.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/hf-wzx1205/PDO_S2TT
- Repositorio de inferencia y evaluación: https://github.com/ggiggit/PDO_S2TT
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Descarga directa del checkpoint: `hf download hf-wzx1205/PDO_S2TT pdo_s2tt.pt --local-dir checkpoints`
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces encontrados correspondían a otros significados de la abreviatura «HF» y no se incluyen.
