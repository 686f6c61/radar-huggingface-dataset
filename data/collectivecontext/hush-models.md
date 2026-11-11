# collectivecontext/hush-models

## Resumen

`collectivecontext/hush-models` no es un modelo entrenado por su autor, sino un repositorio de distribucion que aloja dos modelos en formato GGUF que consume Hush, una aplicacion local de voz a texto para Linux. El repositorio contiene una conversion de `speechbrain/lang-id-voxlingua107-ecapa` (identificacion de idioma) y de `nvidia/parakeet-tdt-0.6b-v3` (reconocimiento automatico del habla). El proyecto no entrena ni afina ningun modelo: unicamente convierte pesos a GGUF con `transcribe.cpp` y los cuantiza a Q8_0.

El interes practico del repositorio es que empaqueta en un unico punto de descarga los artefactos necesarios para una pipeline de transcripcion de voz completamente local, con verificacion de integridad mediante SHA-256 antes del uso. El modelo de reconocimiento de voz cubre 25 idiomas europeos y el de identificacion de idioma se usa para seleccionar automaticamente el idioma hablado.

El dato de parametros totales registrado en los metadatos (21.244.679) no se corresponde con ninguno de los dos ficheros descritos en la model card: el modelo de identificacion de idioma ronda los 26,7 MB en Q8_0 y el de reconocimiento de voz los 739,5 MB, coherente con un modelo de aproximadamente 0,6 mil millones de parametros. La discrepancia debe tenerse en cuenta al evaluar el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos modelos independientes: ECAPA-TDNN (identificacion de idioma) y Parakeet TDT (reconocimiento de voz) |
| Parametros totales | No disponible de forma fiable; metadatos indican 21.244.679, incoherente con los ficheros descritos (Parakeet ~0,6 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 |
| Idiomas soportados | 25 idiomas europeos (modelo de reconocimiento de voz); conjunto de idiomas del modelo de identificacion no detallado |
| Licencia | Por fichero: Apache 2.0 (lang-id) y CC BY 4.0 (parakeet) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El repositorio agrupa dos artefactos de naturaleza distinta. El primero, `lang-id-voxlingua107-ecapa-Q8_0.gguf`, es una conversion del modelo `speechbrain/lang-id-voxlingua107-ecapa` de SpeechBrain (revision `0253049ae131d6a4be1c4f0d8b0ff483a0f8c8e9`), basado en una arquitectura ECAPA-TDNN orientada a la identificacion de idioma a partir de audio. El segundo, `parakeet-tdt-0.6b-v3-Q8_0.gguf`, es una conversion de `nvidia/parakeet-tdt-0.6b-v3` de NVIDIA (revision `6d590f77001d318fb17a0b5bf7ee329a91b52598`), un modelo de reconocimiento automatico del habla con decodificacion TDT (Token-and-Duration Transducer).

No se ha realizado ningun entrenamiento ni ajuste fino por parte del autor del repositorio. El proceso consiste en conversion a GGUF con `transcribe.cpp` (v0.4.1, commit `4d7c1ccefd39e5a9ea36cca5f8fefc6dcc14b99b` para el modelo de idioma y commit `9b3fab27` para Parakeet) y cuantizacion a Q8_0 con `transcribe-quantize`. La conversion es reproducible: el fichero de Parakeet es byte-identico al GGUF publicado por el proyecto `transcribe.cpp`, y el fichero F32 previo a la cuantizacion del modelo de identificacion tambien lo es. No se detallan datos de entrenamiento, numero de tokens ni tecnicas de alineamiento como RLHF o DPO, ya que corresponden a los modelos originales y no se describen en esta model card.

## Capacidades

- Identificacion automatica de idioma a partir de audio (`detect_languages`), usada por Hush para seleccionar el idioma hablado.
- Reconocimiento automatico del habla (voz a texto) para 25 idiomas europeos mediante el modelo Parakeet.
- Verificacion de integridad de cada fichero mediante SHA-256 antes de su uso en la aplicacion.
- Ejecucion completamente local, sin dependencia de servicios en la nube.
- Integracion con la aplicacion Hush para Linux como destino de descarga de los modelos.
- No se documentan capacidades de tool calling, razonamiento multi-paso, vision ni audio generativo.

## Casos de uso

- Dictado por voz en escritorio Linux: la aplicacion Hush descarga estos GGUF y realiza transcripcion local, evitando enviar audio a servicios externos.
- Transcripcion de reuniones y notas de voz: el modelo Parakeet convierte audio a texto en 25 idiomas europeos, adecuado para entornos con requisitos de privacidad.
- Deteccion automatica del idioma de entrada: el modelo ECAPA permite enrutar el audio al idioma correcto antes de la transcripcion, util en aplicaciones multilingues.
- Asistentes de accesibilidad: entrada de texto por voz para usuarios con movilidad reducida en un escritorio Linux, sin coste por API.
- Procesamiento por lotes de archivos de audio: al ser GGUF ejecutable con `transcribe.cpp`, puede integrarse en scripts de conversion masiva de grabaciones a texto.
- Sistemas empotrados o de bajos recursos: el tamano reducido del modelo de identificacion (26,7 MB en Q8_0) permite incluirlo en pipelines ligeros de preprocesado de audio.
- Verificacion de integridad en despliegues: el uso de hashes SHA-256 documentados facilita la validacion de artefactos en pipelines de distribucion de software.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por tamano de fichero, el modelo de identificacion (26,7 MB) es trivial y el de reconocimiento de voz (739,5 MB en Q8_0) requiere del orden de 1 GB de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable por el tamano del modelo de reconocimiento de voz, pero no confirmado en la informacion proporcionada.
- Opciones de despliegue: `transcribe.cpp` (conversion y cuantizacion); integracion con la aplicacion Hush en Linux.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| hush-models (Parakeet TDT 0.6B v3, Q8_0) | ~0,6 B | No disponible | 25 europeos | CC BY 4.0 | GGUF |
| hush-models (lang-id-voxlingua107-ecapa, Q8_0) | No disponible | No disponible | No disponible | Apache 2.0 | GGUF |
| whisper-large-v3 (referencia) | ~1,55 B | No disponible | Multilingue amplio | MIT | Safetensors, GGUF |
| Alternativas adicionales | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no entrena modelos: cualquier limitacion de los modelos originales (sesgos, alucinaciones en transcripcion, errores en idiomas poco representados) se hereda sin cambios.
- La discrepancia entre los parametros declarados en metadatos (21,2 M) y los ficheros descritos (Parakeet ~0,6 B) debe verificarse antes de asumir capacidades o requisitos.
- La licencia es por fichero: Apache 2.0 para el modelo de identificacion de idioma y CC BY 4.0 para el de reconocimiento de voz. El uso comercial del segundo exige atribucion a NVIDIA.
- El modelo de reconocimiento de voz esta limitado a 25 idiomas europeos; no cubre otros idiomas.
- El repositorio esta orientado a la aplicacion Hush en Linux; su uso fuera de ese contexto requiere herramientas compatibles con GGUF como `transcribe.cpp`.
- No se documentan sesgos especificos, tasas de alucinacion ni limites de contexto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/collectivecontext/hush-models
- Aplicacion Hush: https://github.com/andymai/hush
- Modelo original de identificacion de idioma: https://huggingface.co/speechbrain/lang-id-voxlingua107-ecapa
- Modelo original de reconocimiento de voz: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Herramienta de conversion y cuantizacion: https://crates.io/crates/transcribe-cpp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
