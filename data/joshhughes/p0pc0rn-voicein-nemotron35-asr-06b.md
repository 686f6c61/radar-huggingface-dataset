# JoshHughes/p0pc0rn-voicein-nemotron35-asr-06b

## Resumen

p0pc0rn-voicein-nemotron35-asr-06b es una conversión cuantizada a 8 bits del modelo de reconocimiento automático del habla NVIDIA Nemotron 3.5 ASR Streaming 0.6B, publicada por el desarrollador independiente Joshua Hughes dentro del proyecto p0pc0rn. No se trata de un modelo entrenado desde cero, sino de un reempaquetado de los pesos originales de NVIDIA en un formato propietario denominado `pocketflux.pack/1`, pensado exclusivamente para el motor WebGPU de la aplicación p0pc0rn, que ejecuta inferencia en el propio dispositivo (on-device) en un teléfono.

El modelo resuelve el problema de la transcripción de voz a texto con privacidad estricta: según la model card, el audio nunca sale del teléfono ni se almacena, y el reconocimiento cubre 40 configuraciones de idioma-región. El tamaño del repositorio es de 640 MB distribuidos en 27 ficheros, lo que da una idea de la huella del pack cuantizado frente a los pesos originales en precisión completa.

Su relevancia es acotada pero concreta: demuestra una vía de despliegue de ASR en streaming sobre WebGPU en hardware móvil, con cuantización por bloques y plegado de operaciones para reducir el coste computacional. Conviene subrayar que no es un checkpoint compatible con Transformers, Diffusers ni NeMo, y que no es un producto oficial de NVIDIA ni está respaldado por la compañía.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; el modelo base es un ASR en streaming (encoder, prompt projector, decoder y joint según la descripción de la conversión) |
| Parámetros totales | 0,6 B (según el nombre del modelo base, Nemotron 3.5 ASR Streaming 0.6B) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 8 bits por matriz con una escala fp16 por cada 64 entradas; convoluciones pequeñas, normas y sesgos en fp32 |
| Idiomas soportados | 40 configuraciones de idioma-región (según la model card); no se enumeran |
| Licencia | OpenMDW-1.1 (license_name: openmdw-1.1) |
| Formato de pesos | `pocketflux.pack/1` (manifest.json con sha256 por fichero y por cada chunk de 16 MiB); no es safetensors, GGUF ni NeMo |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de la enumeración de sus componentes: encoder, prompt projector, decoder y joint, lo que sugiere un esquema de ASR tipo transducer (RNN-T o similar) con proyección de prompt por idioma. El modelo base es NVIDIA Nemotron 3.5 ASR Streaming 0.6B, en revisión `ea30d66debe3740a08b573244286791d423d6b3e`; no se aportan datos sobre volumen de tokens de entrenamiento, composición del corpus ni si hubo etapas de RLHF o DPO, por lo que esos extremos deben considerarse no disponibles.

La innovación técnica de esta publicación no está en el entrenamiento, sino en la conversión: cada matriz del encoder, del prompt projector, del decoder y del joint se codifica en 8 bits con una escala fp16 por cada 64 entradas; las convoluciones pequeñas, las normas y todos los sesgos se mantienen en fp32; el prompt de idioma se pliega en un sesgo por idioma; la segunda capa del prompt projector y el proyector del encoder se fusionan en una única capa lineal; la proyección de posición relativa se convierte en una tabla y el vocabulario se serializa como JSON. El autor declara un error relativo máximo del 0,4 % en las matrices cuantizadas y que la matemática es equivalente, solo plegada y redistribuida.

## Capacidades

- Reconocimiento automático del habla en streaming: el pipeline declarado es `automatic-speech-recognition` y las etiquetas incluyen `streaming`, lo que indica procesamiento incremental del audio.
- Conversión de voz a texto en el dispositivo: la model card describe su uso como entrada de voz en el chat de la aplicación, sin que el audio abandone el teléfono.
- Cobertura de 40 configuraciones de idioma-región mediante el plegado del prompt de idioma en un sesgo por idioma.
- Ejecución sobre WebGPU: el pack está diseñado para el motor WebGPU de p0pc0rn, no para runtimes de Python.
- Verificación de integridad: el manifiesto incluye sha256 por fichero y por cada chunk de 16 MiB, comprobado durante la descarga y en tiempo de ejecución.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio generativo ni modo thinking.

## Casos de uso

- Dictado por voz en aplicaciones móviles: el pack permite transcribir la voz del usuario directamente en el teléfono mediante WebGPU, sin enviar audio a un servidor, lo que encaja en productos con requisitos estrictos de privacidad.
- Asistentes conversacionales con entrada de voz: integrado en el chat de p0pc0rn, convierte el habla en texto antes de pasarla al modelo de lenguaje, manteniendo el audio fuera del almacenamiento persistente.
- Notas de voz transcritas en local: un usuario puede grabar una nota y obtener el texto sin conexión, aprovechando el modo streaming para mostrar resultados parciales mientras habla.
- Aplicaciones de accesibilidad: subtitulado en vivo de conversaciones cercanas en el propio dispositivo, útil para personas con dificultades auditivas y en entornos sin conectividad.
- Cumplimiento normativo en sectores regulados: al no salir el audio del dispositivo, el pack es adecuado para escenarios donde el envío de voz a la nube requiere consentimiento explícito o está restringido.
- Prototipado de ASR en WebGPU: sirve como referencia técnica para desarrolladores que quieran estudiar una cuantización a 8 bits con escalas por bloque y plegado de operaciones aplicada a un modelo transducer de ASR.
- Transcripción multilingüe en movilidad: las 40 configuraciones de idioma-región permiten cubrir usuarios de distintas regiones con un único pack de 640 MB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta el error relativo máximo de la cuantización (0,4 % en las matrices cuantizadas) y el tamaño del pack (640 MB en 27 ficheros); no hay cifras de WER, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El pack ocupa 640 MB en disco y está pensado para ejecutarse en la GPU integrada de un teléfono mediante WebGPU, no en una GPU de escritorio con VRAM dedicada.
- GPU recomendadas: no disponibles. El requisito real es un navegador o runtime con soporte de WebGPU en el dispositivo móvil.
- Compatibilidad con GPU de consumo: no se documenta soporte para RTX 4090, A100, H100 ni similares; el formato `pocketflux.pack/1` solo lo lee el motor WebGPU de p0pc0rn.
- Opciones de despliegue: exclusivamente la aplicación p0pc0rn. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, y el autor indica explícitamente que no es un checkpoint de Transformers, Diffusers o NeMo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| p0pc0rn-voicein-nemotron35-asr-06b | 0,6 B | No disponible | `pocketflux.pack/1` (8 bits) | OpenMDW-1.1 | Hugging Face, solo para p0pc0rn |
| nvidia/nemotron-3.5-asr-streaming-0.6b | 0,6 B | No disponible | Pesos originales de NVIDIA | OpenMDW-1.1 | Hugging Face (modelo base) |
| Alternativas de ASR de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación documentada es con el modelo base del que deriva; no se dispone de datos de rendimiento comparado con otras alternativas de ASR en streaming.

## Limitaciones y advertencias

- Formato propietario: los pesos solo los lee el motor WebGPU de p0pc0rn; no se pueden cargar con Transformers, NeMo, llama.cpp ni ningún runtime estándar.
- No es un producto oficial de NVIDIA: el autor declara que NVIDIA no ha respaldado la conversión y que "NVIDIA" y "Nemotron" son marcas registradas sin cesión de derechos de marca.
- Licencia OpenMDW-1.1: exige conservar una copia del acuerdo y los avisos de NVIDIA con cualquier copia del modelo; no impone límites sobre lo que se genere con él, pero los derechos cesan para quien demande alegando infracción de patente o copyright. Conviene revisar el texto completo antes de uso comercial.
- Idiomas: se indican 40 configuraciones de idioma-región, pero no se enumeran, por lo que no se puede verificar la cobertura de una región concreta sin consultar la aplicación.
- Sin benchmarks publicados: no hay cifras de WER ni de latencia que permitan evaluar la degradación introducida por la cuantización a 8 bits más allá del 0,4 % de error relativo declarado en las matrices.
- Riesgo de alucinación: no se documenta para este modelo; en ASR el riesgo equivalente es la sustitución o invención de palabras, que no se ha cuantificado.
- Sesgos: no se aporta información sobre sesgos demográficos, acentos o condiciones acústicas adversas.
- Dependencia de la aplicación: el uso práctico requiere p0pc0rn y la aceptación de las licencias correspondientes dentro de la app antes de la primera descarga.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que limita la validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoshHughes/p0pc0rn-voicein-nemotron35-asr-06b
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Aplicación p0pc0rn: https://artistjoshhughes.github.io/p0pc0rn/
- X oficial de p0pc0rn: https://x.com/p0pc0rnapp
- X de Joshua Hughes: https://x.com/joshhughes___
