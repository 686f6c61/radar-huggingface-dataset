# blixt/phonon-31m-en-webgpu

## Resumen

Phonon 31M for WebGPU es una conversión del checkpoint `gradium/phonon-31m-en` (desarrollado por Gradium) a un formato binario optimizado para ejecutarse en el navegador mediante WebGPU. No se trata de un modelo nuevo ni de un fine-tuning: es un artefacto de despliegue que empaqueta los pesos originales en un único fichero `phonon-31m-en.int8.bin` de 43,7 MB, frente a los 103 MB del checkpoint original, para ser consumido por el runtime `blixt/phonon`. El autor de la conversión es el desarrollador independiente blixt, sin participación de Gradium.

El modelo base es un sistema de text-to-speech (TTS) en inglés de 31 millones de parámetros, una escala deliberadamente pequeña que prioriza la latencia y la viabilidad en hardware de consumo. La conversión aplica cuantización int8 selectiva (solo a tensores de 16.384 valores o más, con una escala f16 por cada 32 valores) y deja el resto en f16, además de reorganizar pesos de atención, cabezas de flujo y codec para que el runtime WebGPU pueda ejecutarlos de forma eficiente.

Su relevancia es práctica: demuestra que un modelo TTS de calidad puede ejecutarse íntegramente en el cliente (navegador), sin depender de infraestructura de servidor, lo que abre la puerta a síntesis de voz privada, de baja latencia y sin coste por inferencia. La licencia Apache 2.0 del modelo original se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base TTS de 31M parámetros; detalles arquitectónicos del checkpoint original no especificados) |
| Parametros totales | 31M (según el nombre del modelo base) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (tensores de ≥16.384 valores, escala f16 por cada 32 valores) y f16 (resto) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.bin` propietario del runtime blixt/phonon (cabecera JSON + vectores + pesos); checkpoint original en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `gradium/phonon-31m-en` más allá de que es un sistema text-to-speech de 31M de parámetros. La model card de esta conversión menciona componentes que sí revelan parte de la estructura: atención con rotary embeddings (las filas de `q` y `k` se reorganizan de pares rotatorios intercalados a mitades por cabeza), una "flow head" con un time embedding de un solo paso que se suma al bias de `cond_embed`, y un codec con proyección latente y pesos de upsampling. Esto sugiere una arquitectura de TTS generativa con un módulo de flujo (probablemente flow matching o difusión) acoplado a un codec neural de audio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La conversión en sí no reentrena el modelo: solo transforma los pesos. Las modificaciones aplicadas incluyen cuantización int8 de los tensores grandes, reorganización de pesos de atención y convolución para acceso eficiente, fusión de la proyección latente del codec en sus pesos de upsampling, y absorción de las escalas de capa en los pesos que escalan. El fichero resultante comienza con una cabecera JSON que describe offsets, longitudes y escalas de cada tensor, más los vectores necesarios para el control de velocidad; las funciones `packModel` y `unpackModel` de `src/checkpoint.ts` gestionan la escritura y lectura.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto de entrada.
- Ejecución íntegra en el navegador mediante WebGPU, sin backend de servidor.
- Control de velocidad de habla (la cabecera del fichero incluye los vectores que el control de velocidad necesita).
- Generación de audio mediante un codec neural integrado (proyección latente y upsampling fusionados).
- Modelo pequeño (31M parámetros) orientado a baja latencia y despliegue en cliente.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni otras modalidades.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Síntesis de voz en aplicaciones web sin servidor: el runtime descarga un único fichero de 43,7 MB y ejecuta el modelo en WebGPU, eliminando el coste de inferencia en backend y la latencia de red asociada.
- Lectores de contenido y accesibilidad: convertir texto de páginas web o documentos en voz dentro del propio navegador, con la privacidad que implica no enviar el texto a un servidor.
- Asistentes conversacionales en el cliente: integrar respuestas habladas en chatbots o interfaces de voz que ya corren en el navegador, aprovechando el control de velocidad para adaptar el ritmo.
- Prototipado rápido de interfaces de voz: al no requerir infraestructura, permite a desarrolladores probar flujos TTS en demos y entornos de desarrollo con solo un navegador compatible con WebGPU.
- Aplicaciones educativas y de aprendizaje de idiomas: reproducción de texto en inglés con velocidad ajustable para ejercicios de escucha y pronunciación.
- Sistemas con requisitos de privacidad: al ejecutarse localmente en el dispositivo del usuario, el texto no abandona el cliente, lo que encaja en entornos sanitarios, legales o corporativos con restricciones de tratamiento de datos.
- Distribución de contenido pregrabado dinámico: generación de narraciones bajo demanda en aplicaciones web sin depender de servicios TTS externos ni de cuotas de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de síntesis (MOS, WER, etc.), latencia ni throughput.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en el navegador mediante WebGPU, por lo que requiere un navegador con soporte de WebGPU (Chrome/Edge en versiones recientes, entre otros) y una GPU compatible.
- Tamaño del artefacto: 43,7 MB en disco/descarga (frente a 103 MB del checkpoint original), lo que lo hace viable en equipos de consumo y dispositivos con recursos limitados.
- VRAM estimada: no disponible de forma explícita; por el tamaño del modelo y la cuantización int8/f16, la huella es del orden de decenas de MB, holgada para cualquier GPU de consumo moderna.
- GPU recomendadas: no disponibles. Al ejecutarse vía WebGPU, depende de la GPU del usuario; se espera funcionamiento en iGPU y dGPU recientes con soporte WebGPU.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (31M parámetros) y del fichero.
- Opciones de despliegue: runtime `blixt/phonon` (WebGPU, en navegador). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos TTS comparables con datos de parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa. El propio modelo base `gradium/phonon-31m-en` sería el término de comparación natural, pero no se dispone de sus especificaciones completas ni de benchmarks.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha documentado multilingüismo.
- Es un artefacto de conversión, no un modelo entrenado por blixt: la calidad de síntesis depende íntegramente del checkpoint original de Gradium.
- La cuantización int8 de los tensores grandes puede introducir una degradación de calidad no cuantificada en la información disponible.
- Requiere un navegador y una GPU con soporte WebGPU; no funcionará en entornos sin WebGPU.
- El formato de pesos es propietario del runtime `blixt/phonon`; no es directamente utilizable en otros frameworks (vLLM, llama.cpp, etc.) sin reconversión.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo TTS, el riesgo se manifiesta en pronunciación incorrecta, entonación anómala o artefactos de audio más que en contenido factual.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribución a Gradium y verificar los términos del modelo base.
- El repositorio no incluye demos, papers ni documentación adicional sobre el modelo base en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blixt/phonon-31m-en-webgpu
- Modelo base: https://huggingface.co/gradium/phonon-31m-en
- Runtime WebGPU: https://github.com/blixt/phonon
- Código de empaquetado/desempaquetado: https://github.com/blixt/phonon/blob/main/src/checkpoint.ts
- Sitio del desarrollador del modelo base: https://gradium.ai
