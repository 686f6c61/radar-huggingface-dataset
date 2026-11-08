# schamp007/vaani-fastconformer-hindi-gguf

## Resumen

Vaani Hindi GGUF es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) ARTPARK-IISc/Vaani-FastConformer-Hindi, empaquetada por Saurabh Chaporkar para su uso en la aplicación Verbatim. El modelo original, desarrollado por ARTPARK-IISc, emplea la arquitectura FastConformer (una variante eficiente de Conformer orientada a la transcripción de audio) y está especializado en hindi. Esta versión GGUF está pensada para ejecutarse de forma totalmente offline en teléfonos y portátiles mediante el motor transcribe.cpp.

El artefacto publicado consta de un único fichero cuantizado en Q5_K_M de 383 MB, lo que reduce el peso del modelo base (438,3 millones de parámetros) hasta un tamaño manejable para dispositivos con recursos limitados. La cuantización introduce una penalización mínima en precisión: la tasa de error de palabra (WER) sobre 35 clips de FLEURS Hindi es del 10,9 %, frente al 10,3 % del modelo en precisión completa.

La relevancia de esta ficha radica en que no se trata de un modelo nuevo entrenado desde cero, sino de un empaquetado de inferencia para un caso de uso muy concreto (ASR hindi en el borde), con un acceso controlado mediante aprobación manual y una licencia derivada que impone condiciones adicionales sobre el modelo MIT original. Es un ejemplo típico de distribución de modelos en formato GGUF para aplicaciones móviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (reconocimiento automatico del habla) |
| Parametros totales | 438.277.030 (aprox. 0,44 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (unico fichero publicado) |
| Idiomas soportados | hindi (hi) |
| Licencia | verbatim-vaani-terms (modelo base MIT) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un FastConformer, una arquitectura de tipo Conformer con atención por bloques y submuestreo de las representaciones de audio, diseñada para reducir el coste computacional de la transcripción manteniendo la precisión. Se trata de un modelo de ASR entrenado específicamente para hindi, con 438,3 millones de parámetros. No se dispone de información detallada en la documentación proporcionada sobre el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas de ajuste como RLHF o DPO, por lo que esos datos deben considerarse no disponibles.

La innovación relevante de esta publicación no está en el entrenamiento, sino en el proceso de conversión y cuantización a GGUF (Q5_K_M) para su ejecución con transcribe.cpp en dispositivos móviles. Este empaquetado permite inferencia offline en teléfonos y portátiles, algo que el checkpoint original en safetensors no facilita directamente. La conversión y el empaquetado fueron realizados por Saurabh Chaporkar; el modelo original conserva su licencia MIT de ARTPARK-IISc.

## Capacidades

- Transcripción de voz a texto en hindi (ASR) sobre audio de entrada.
- Ejecución offline en dispositivos móviles y portátiles mediante transcribe.cpp.
- Funcionamiento con un único fichero GGUF cuantizado de 383 MB.
- Precisión cercana a la del modelo completo: WER del 10,9 % frente al 10,3 % del modelo en precisión completa sobre 35 clips de FLEURS Hindi.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la propia transcripción.
- No se documentan capacidades multilingües: el modelo está etiquetado únicamente para hindi.

## Casos de uso

- Transcripción offline en aplicaciones móviles: el fichero GGUF de 383 MB y el motor transcribe.cpp permiten transcribir audio hindi en el propio teléfono sin conexión, lo que encaja en aplicaciones de notas de voz o accesibilidad.
- Subtitulado local de contenido en hindi: al ejecutarse en portátiles, puede integrarse en flujos de generación de subtítulos para vídeo o pódcast en hindi sin enviar el audio a un servidor.
- Dictado por voz en hindi: un editor de texto o una app de productividad puede usar el modelo para convertir voz en texto en tiempo real en el dispositivo, reduciendo la latencia y la exposición de datos.
- Herramientas de accesibilidad para hablantes de hindi: transcripción en vivo de conversaciones presenciales en dispositivos de gama media gracias al tamaño reducido del modelo cuantizado.
- Procesamiento por lotes de audio en local: investigadores que trabajen con corpus de habla hindi pueden transcribir ficheros en una máquina de escritorio con transcribe.cpp, sin depender de servicios en la nube.
- Integración en la aplicación Verbatim: es el caso de uso declarado por el autor; el modelo se distribuye específicamente para la descarga de hindi de dicha aplicación, previa aprobación manual del acceso.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| WER en FLEURS Hindi (35 clips) | 10,9 % | Modelo cuantizado Q5_K_M |
| WER en FLEURS Hindi (35 clips) | 10,3 % | Modelo en precisión completa |

No se han publicado en la información disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el fichero GGUF ocupa 383 MB, por lo que la huella de memoria es reducida y apta para dispositivos móviles.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU en teléfonos y portátiles mediante transcribe.cpp.
- Compatibilidad con GPU de consumo: el tamaño del fichero sugiere que cabe holgadamente en cualquier GPU de consumo, aunque no se documenta soporte GPU específico.
- Opciones de despliegue: transcribe.cpp (motor indicado por el autor). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| schamp007/vaani-fastconformer-hindi-gguf | 438,3 M | no disponible | hindi | verbatim-vaani-terms | GGUF (Q5_K_M) |
| ARTPARK-IISc/Vaani-FastConformer-Hindi | 438,3 M | no disponible | hindi | MIT | safetensors (modelo base) |
| Otros modelos ASR hindi comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos ASR en hindi con los que establecer una comparación cuantitativa en la documentación proporcionada.

## Limitaciones y advertencias

- Acceso restringido: la descarga requiere solicitud y aprobación manual por parte del autor; no es un modelo de descarga libre.
- Restricciones de licencia: la licencia verbatim-vaani-terms exige atribución a Saurabh Chaporkar, prohíbe la redistribución de los ficheros sin permiso escrito y obliga a conservar el aviso MIT de ARTPARK-IISc. Es necesario revisar el fichero LICENSE antes de cualquier uso comercial.
- Monolingüe: solo soporta hindi; no se documentan otros idiomas.
- Precisión: el WER del 10,9 % implica que aproximadamente una de cada diez palabras puede transcribirse incorrectamente; en dominios especializados (términos técnicos, nombres propios) el error puede ser mayor.
- Evaluación limitada: el WER publicado se calcula sobre solo 35 clips de FLEURS Hindi, una muestra pequeña que puede no representar otros dominios, acentos o condiciones acústicas.
- Un único formato de cuantización: solo se publica Q5_K_M, sin alternativas de mayor o menor precisión.
- Dependencia de transcribe.cpp: el uso previsto está ligado a ese motor; no se documenta compatibilidad con otros runtimes.
- Riesgo de alucinación en la transcripción: como todo modelo ASR, puede generar texto plausible en segmentos de audio ruidosos o ininteligibles.
- Sesgos: no se documenta información sobre sesgos demográficos, de acento o de género en el modelo base ni en esta conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/schamp007/vaani-fastconformer-hindi-gguf
- Modelo base: https://huggingface.co/ARTPARK-IISc/Vaani-FastConformer-Hindi
- Perfil del autor: https://huggingface.co/schamp007
- Motor transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
