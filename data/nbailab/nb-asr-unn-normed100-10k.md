# NbAiLab/nb-asr-unn-normed100-10k

## Resumen

NB-ASR UNN NorMed 100% 10k es un checkpoint experimental de reconocimiento automatico del habla (ASR) en noruego desarrollado por NbAiLab, el laboratorio de IA de la Biblioteca Nacional de Noruega. Se trata de un ajuste fino del checkpoint NB-ASR Qwen3-ASR 0.6B, entrenado durante 10.000 pasos de optimizador sobre ejemplos sinteticos normalizados del corpus NorMed, en concreto una mezcla del 100 % NorMed (102.778 filas NorMed y 0 filas NB). Forma parte de un experimento interno que compara variantes con proporciones de datos sinteticos del 0 %, 10 %, 50 % y 100 %.

El modelo tiene 782.426.112 parametros totales (no es una arquitectura MoE) y se distribuye en formato safetensors bajo la libreria transformers, con un repositorio de 1,6 GB. Su tarea es transcribir audio en noruego a texto, con enfasis en la llamada lectura optimizada sin prompt (no-prompt reading-optimised), una metrica interna del proyecto.

Su relevancia es acotada: no es una version de produccion, sino un punto de control para evaluar si la incorporacion de datos sinteticos normalizados degrada o mejora el rendimiento respecto al control noruego. Los resultados publicados en la model card indican que la variante 100 % NorMed obtiene un WER de lectura optimizada de 18,61 % y un CER de 7,20 %, ligeramente peor en WER y mejor en CER que el control (18,20 % y 7,51 % respectivamente).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (modelo de reconocimiento automatico del habla basado en transformer; tag `qwen3_asr`) |
| Parametros totales | 782.426.112 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | noruego (codigo de idioma `no`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint NB-ASR Qwen3-ASR 0.6B y se ajusta durante 10.000 pasos de optimizador. La arquitectura corresponde a la familia Qwen3-ASR, orientada a la transcripcion de audio, con un cabecera de reconocimiento sobre representaciones acusticas. El checkpoint aqui descrito se entreno integramente con ejemplos sinteticos normalizados de NorMed (102.778 filas NorMed frente a 0 filas del corpus NB), lo que lo situa como el extremo del experimento de mezcla.

El diseno experimental compara cuatro configuraciones entrenadas desde el mismo punto de partida: control NB (0 % sintetico, 205.556 filas NB), NorMed 10 (10 % sintetico, 925.002 filas NB / 102.778 NorMed), NorMed 50 (50 %, 102.778 / 102.778) y NorMed 100 (100 %, 0 / 102.778). La evaluacion se realizo sobre el conjunto compartido de Sprakradet en el paso 10.000. Los manifiestos del 0 %, 10 % y 50 % usan un prompt vacio para los ejemplos normalizados, mientras que la ejecucion del 100 % empleo un manifiesto congelado anterior; esta diferencia metodologica es relevante al interpretar las comparaciones entre variantes. No se documentan en la informacion disponible detalles sobre el volumen total de tokens de audio, la composicion exacta del corpus ni el uso de RLHF o DPO.

## Capacidades

- Transcripcion de voz a texto en noruego (codigo de idioma `no`).
- Reconocimiento orientado a lectura (reading-optimised), evaluado con prompt vacio.
- Produccion de texto normalizado, segun el sufijo `normed` y la naturaleza del corpus NorMed.
- Evaluacion interna mediante WER y CER sobre el conjunto de Sprakradet.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del noruego.
- No se documentan capacidades de vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de archivos de audio noruegos: el modelo convierte locucion o lectura en texto escrito, adecuado para digitalizar material oral del dominio NorMed.
- Evaluacion comparativa de datos sinteticos: sirve como referencia del extremo 100 % sintetico en el diseno experimental de NB-ASR, util para investigacion sobre el impacto de datos generados.
- Investigacion en ASR de bajos recursos: al ser un checkpoint de 782 M de parametros, permite reproducir experimentos de ajuste fino sobre noruego con coste computacional moderado.
- Generacion de transcripciones normalizadas para corpus linguisticos: el modelo esta entrenado sobre ejemplos normalizados, lo que facilita su integracion en pipelines de limpieza y anotacion de texto.
- Prototipado interno de asistentes de voz en noruego: puede emplearse como componente ASR en demos controladas, siempre bajo la advertencia de que no es una version de produccion.
- Analisis de errores y estudio de sesgos acusticos: sus metricas de WER y CER permiten aislar donde falla la transcripcion cuando el entrenamiento es totalmente sintetico.
- Benchmarking de infraestructura de inferencia: con 782 M de parametros y 1,6 GB de pesos, es util para medir latencia y throughput de frameworks ASR en hardware modesto.

## Benchmarks y rendimiento

Resultados del experimento NB-ASR / NorMed sobre el conjunto compartido de Sprakradet en el paso 10.000 (datos extraidos de la model card):

| Modelo | Mezcla sintetica NorMed | Filas (NB / NorMed) | WER lectura optimizada sin prompt | CER | WER global sin prompt |
|---|---:|---:|---:|---:|---:|
| NB control | 0 % | 205.556 / 0 | 18,20 % | 7,51 % | 18,78 % |
| NorMed 10 | 10 % | 925.002 / 102.778 | 17,90 % | 7,34 % | 18,51 % |
| NorMed 50 | 50 % | 102.778 / 102.778 | 18,35 % | 7,44 % | 18,90 % |
| **NorMed 100** | **100 %** | **0 / 102.778** | **18,61 %** | **7,20 %** | **18,95 %** |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo es un sistema ASR y no un modelo de lenguaje generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6-2 GB en precision de 16 bits, coherente con los 782 M de parametros y el tamano de repositorio de 1,6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; se puede ejecutar en RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problemas.
- Cabe en GPU de consumo: si, ampliamente, incluso en tarjetas de gama de entrada y en CPU con suficiente memoria.
- Opciones de despliegue: transformers (libreria declarada, con soporte de endpoints compatibles segun los tags); no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa directa dentro del propio experimento (mismos pasos de entrenamiento, mismo punto de partida):

| Modelo | Parametros | Mezcla NorMed | WER lectura optimizada | CER | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NorMed 100 (este) | 782.426.112 | 100 % | 18,61 % | 7,20 % | no disponible | publico en HuggingFace |
| NB control | no disponible | 0 % | 18,20 % | 7,51 % | no disponible | interno del experimento |
| NorMed 10 | no disponible | 10 % | 17,90 % | 7,34 % | no disponible | interno del experimento |
| NorMed 50 | no disponible | 50 % | 18,35 % | 7,44 % | no disponible | interno del experimento |

Como alternativas de la misma categoria (ASR en noruego) se identifican NB-Whisper Large, de NbAiLabBeta, y la familia Whisper de OpenAI, si bien no se dispone de datos comparativos de parametros, contexto ni rendimiento en la informacion proporcionada, por lo que la comparacion con ellos queda como no disponible.

## Limitaciones y advertencias

- Es un checkpoint experimental interno, no una version de produccion; la propia model card lo advierte explicitamente.
- El WER de lectura optimizada (18,61 %) y el WER global (18,95 %) son elevados, lo que limita su uso en aplicaciones que requieran transcripcion de alta fidelidad.
- La comparacion con el control puede estar sesgada: la ejecucion del 100 % uso un manifiesto congelado anterior, mientras que el 0 %, 10 % y 50 % emplearon prompt vacio en los ejemplos normalizados.
- El entrenamiento con el 100 % de datos sinteticos plantea riesgo de sobreajuste al dominio sintetico y de peor generalizacion a audio real.
- Cobertura limitada al noruego; no se documentan otros idiomas.
- La licencia no esta disponible, lo que impide confirmar si se permite uso comercial.
- No se documentan sesgos especificos, aunque el corpus de origen (NorMed y Sprakradet) puede introducir sesgos de dominio y de registro linguistico.
- Riesgo de alucinacion inherente a los sistemas ASR: transcripciones plausibles pero incorrectas en audio con ruido, acentos o terminologia especializada.
- Ausencia de cuantizaciones documentadas y de recetas de despliegue para motores de alto rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NbAiLab/nb-asr-unn-normed100-10k
- Perfil de la organizacion NbAiLab: https://huggingface.co/NbAiLab
- NB-Whisper Large (modelo relacionado de NbAiLabBeta): https://huggingface.co/NbAiLabBeta/nb-whisper-large
