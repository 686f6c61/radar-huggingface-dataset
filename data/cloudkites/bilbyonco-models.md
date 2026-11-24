# cloudkites/bilbyonco-models

## Resumen

`cloudkites/bilbyonco-models` es un repositorio de pesos empaquetados (model packs) publicado por CloudKites AI Lab para su aplicacion Bilby Onco, una herramienta orientada al ambito oncologico. El repositorio no contiene un modelo unico, sino cuatro artefactos en formato propietario `.nbq`: un modelo de lenguaje (`bilbyonco-llm.nbq`), dos modelos de reconocimiento automatico del habla de 52 idiomas (`bilbyonco-asr.nbq` y `bilbyonco-asr-lite.nbq`) y un modelo ASR especifico de ingles orientado a habla medica (`bilbyonco-asr-en.nbq`). El tamano total del repositorio es de 10,0 GB.

La relevancia de esta ficha es limitada desde el punto de vista de la evaluacion tecnica: el autor no publica arquitectura, numero de parametros, longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks. Ademas, la model card indica explicitamente que los packs solo se ejecutan dentro de la aplicacion Bilby Onco, lo que implica que el formato `.nbq` no es directamente consumible por runtimes estandar como vLLM, llama.cpp, Ollama o TGI. Se distribuye con una licencia compuesta Apache 2.0 y CC BY 4.0, y esta marcado como de uso exclusivamente investigador, sin validacion clinica.

Por tanto, esta ficha documenta lo que el autor declara y marca de forma explicita todos los parametros no disponibles, sin inferir datos que no aparezcan en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato propietario `.nbq`) |
| Idiomas soportados | ASR: 52 idiomas (segun model card); LLM: no disponible |
| Licencia | Apache 2.0 y CC BY 4.0 (licencia compuesta, ver `NOTICE`) |
| Formato de pesos | `.nbq` (formato propietario de la app Bilby Onco) |
| Tamano del repositorio | 10,0 GB |
| Componentes | LLM, ASR multilingue, ASR multilingue lite, ASR ingles medico |
| Uso previsto | solo investigacion; no validado para uso clinico |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura de ninguno de los cuatro componentes. La model card no especifica si el modelo de lenguaje es un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante, ni indica el numero de parametros, el volumen de tokens de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares.

Respecto a los componentes ASR, el autor solo declara la cobertura de 52 idiomas y, en la variante `bilbyonco-asr-en.nbq`, una especializacion en habla medica en ingles. No se detalla el tipo de encoder acustico, el tokenizador, la estrategia de decodificacion ni los datos utilizados. La unica innovacion tecnica implicita es el empaquetado en formato `.nbq`, disenado para su descarga y ejecucion dentro de la aplicacion Bilby Onco en el primer arranque, pero no se documenta su estructura interna.

## Capacidades

- Generacion de texto mediante el componente `bilbyonco-llm.nbq`, con alcance y calidad no documentados.
- Reconocimiento automatico del habla en 52 idiomas con `bilbyonco-asr.nbq`.
- Variante ASR reducida (`bilbyonco-asr-lite.nbq`) para entornos con menos recursos, manteniendo los 52 idiomas declarados.
- Reconocimiento de habla medica en ingles con `bilbyonco-asr-en.nbq`.
- Integracion exclusiva dentro de la aplicacion Bilby Onco; no se declara soporte de tool calling, function calling, agentes, vision, audio de entrada al LLM ni modo de razonamiento explicito.
- Capacidades multilingues documentadas unicamente para los componentes ASR (52 idiomas); el soporte multilingue del LLM no esta disponible.

## Casos de uso

- Transcripcion de consultas oncologicas en ingles: el componente `bilbyonco-asr-en.nbq` esta especializado en habla medica en ingles, por lo que podria emplearse para convertir dictados o conversaciones clinicas en texto dentro de la app, siempre en contexto de investigacion y sin uso diagnostico.
- Documentacion clinica multilingue: `bilbyonco-asr.nbq` cubre 52 idiomas, lo que permitiria transcribir notas de voz de profesionales o pacientes en entornos con poblacion diversa, como paso previo a su revision manual.
- Despliegue en dispositivos con recursos limitados: la variante `bilbyonco-asr-lite.nbq` esta pensada como alternativa mas pequena, adecuada para equipos con poca memoria o para reducir tiempos de descarga en el primer arranque de la aplicacion.
- Asistencia textual dentro de la app: `bilbyonco-llm.nbq` podria emplearse para tareas de redaccion, resumen o estructura de informes dentro de Bilby Onco, aunque no se documentan ni la calidad ni el contexto maximo.
- Investigacion en procesamiento de habla medica: el conjunto de packs permite reproducir experimentos de ASR especializado en dominios clinicos, comparando la variante lite con la completa y con la especifica de ingles.
- Evaluacion de pipelines de empaquetado propietario: el formato `.nbq` y el flujo de descarga en el primer arranque son un caso de estudio para equipos que disenen distribucion de modelos en aplicaciones de escritorio o moviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 10,0 GB en total, pero no se desglosa el tamano de cada componente ni el espacio necesario en memoria para inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: limitadas a la aplicacion Bilby Onco. Los pesos en formato `.nbq` no son compatibles de forma declarada con vLLM, llama.cpp, Ollama, TGI ni otros runtimes estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El autor no identifica modelos de referencia ni publica metricas que permitan una comparacion con alternativas de la misma categoria (LLM de proposito general o ASR medico). Ademas, el formato propietario `.nbq` y la restriccion de ejecucion dentro de la app dificultan cualquier comparacion directa con modelos distribuidos en safetensors o GGUF.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se publican parametros, contexto, arquitectura ni datos de entrenamiento, lo que impide evaluar el modelo de forma rigurosa.
- Uso exclusivamente investigador: la model card declara explicitamente que no es un dispositivo medico ni esta validado para uso clinico, por lo que no debe emplearse en decision clinica.
- Formato propietario: los pesos `.nbq` solo se ejecutan en la aplicacion Bilby Onco, lo que bloquea la integracion en pipelines propios y limita la portabilidad.
- Licencia compuesta: Apache 2.0 y CC BY 4.0 con un fichero `NOTICE` adicional; es necesario revisar las atribuciones antes de cualquier redistribucion o uso comercial.
- Riesgo de alucinacion: no cuantificado ni documentado por el autor, especialmente relevante en un dominio medico.
- Sesgos: no documentados.
- Idiomas: solo se declaran 52 idiomas para ASR; el soporte del LLM no esta especificado.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cloudkites/bilbyonco-models
- Fichero de licencia y atribuciones: https://huggingface.co/cloudkites/bilbyonco-models/blob/main/NOTICE
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Soporte de Bilby Onco: https://cloudkites.com/bilby-onco/support
