# mradermacher/Orpheus-Urdu-TTS-Zia-Mohyeddin-GGUF

## Resumen

Orpheus-Urdu-TTS-Zia-Mohyeddin-GGUF es la distribucion en formato GGUF del modelo de sintesis de voz (text-to-speech) Aasher/Orpheus-Urdu-TTS-Zia-Mohyeddin, cuantizado por mradermacher. El modelo original parte de la familia Orpheus de Canopy Labs y ha sido ajustado (fine-tuning) para generar voz en urdu, concretamente la voz del locutor Zia Mohyeddin. El binomio base + cuantizacion resuelve el problema de desplegar TTS neural en urdu sobre hardware modesto, algo historicamente limitado por la escasez de modelos de voz de calidad en este idioma.

Tecnicamente se trata de un modelo basado en transformers con 3.300.867.136 parametros (unos 3,3 mil millones), derivado de la arquitectura Orpheus (modelo de lenguaje adaptado a la generacion de tokens de audio). El repositorio GGUF ocupa 30,3 GB e incluye 12 cuantizaciones estaticas que van desde Q2_K (1,5 GB) hasta f16 (6,7 GB), lo que permite ejecutarlo desde equipos de gama media hasta servidores con GPU dedicada.

La relevancia actual es doble: por un lado, cubre un hueco en el ecosistema TTS para urdu, un idioma con pocos recursos; por otro, la disponibilidad de cuantizaciones GGUF facilita el despliegue local con llama.cpp u Ollama sin depender de infraestructura en la nube. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Orpheus (modelo de lenguaje adaptado a generacion de audio TTS) |
| Parametros totales | 3.300.867.136 (3,3 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | urdu (ur) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |
| Tamano del repo | 30,3 GB |
| Modelo base | Aasher/Orpheus-Urdu-TTS-Zia-Mohyeddin |
| Dataset de ajuste | muhammadsaadgondal/urdu-tts |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Orpheus, que adapta un transformer de tipo decoder-only al problema de TTS mediante la tokenizacion del audio: el modelo genera tokens de audio que posteriormente se decodifican a forma de onda. Esta aproximacion permite aprovechar tecnicas propias de los LLM (prompting, contexto, muestreo) en la sintesis de voz. El modelo original es un fine-tuning del Orpheus base sobre el dataset muhammadsaadgondal/urdu-tts, orientado a replicar la voz del locutor Zia Mohyeddin, y fue entrenado con Unsloth segun las etiquetas del repositorio.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. El autor de la cuantizacion indica que se han generado cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y que no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicacion. La innovacion principal de esta distribucion no es arquitectonica sino practica: la conversion a GGUF con 12 niveles de cuantizacion permite ejecutar un TTS de 3,3 mil millones de parametros en hardware de consumo.

## Capacidades

- Sintesis de voz (text-to-speech) en urdu a partir de texto escrito.
- Clonacion de voz / replicacion del timbre del locutor Zia Mohyeddin (etiqueta voice-clone).
- Generacion de audio conversacional (etiqueta conversational).
- Integracion con la libreria transformers mediante el pipeline text-to-speech.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Ejecucion local mediante archivos GGUF (llama.cpp y derivados).
- No se documentan capacidades de vision, audio de entrada, tool calling ni razonamiento multi-paso; el modelo esta especializado exclusivamente en TTS.

## Casos de uso

- Audiolibros y narracion en urdu: el modelo puede sintetizar textos largos en urdu con una voz reconocible, adecuado para produccion editorial de audiolibros donde se requiera un timbre consistente.
- Doblaje y locucion automatizada: generacion de pistas de voz para videos, documentales o contenido educativo en urdu, reduciendo el coste frente a locucion humana.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de contenido web o documentos en urdu, desplegable en local con las cuantizaciones Q4_K_S o Q4_K_M (2,1-2,2 GB).
- Asistentes de voz en urdu: integracion en sistemas de atencion al cliente o asistentes conversacionales que requieran salida hablada en este idioma.
- Prototipado rapido en investigacion de TTS: el rango de cuantizaciones permite comparar calidad frente a tamano y evaluar el impacto de la cuantizacion en la fidelidad de la voz.
- Generacion de contenido para redes y podcasts: sintesis de voz para piezas cortas en urdu con despliegue en una unica GPU de consumo.
- Pruebas de clonacion de voz controlada: experimentacion con el timbre Zia Mohyeddin en entornos de investigacion, respetando la licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB con Q4_K_S/Q4_K_M, 3-4 GB con Q8_0 y en torno a 7 GB con f16 (el fichero f16 ocupa 6,7 GB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores para cuantizaciones altas; A100/H100 solo necesarias para despliegues concurrentes o f16.
- Cabe en GPU de consumo: si, desde cuantizaciones Q2_K (1,5 GB) hasta Q8_0 (3,6 GB) en tarjetas de 4-8 GB; f16 requiere al menos 8 GB.
- Opciones de despliegue: llama.cpp y frontends compatibles con GGUF (Ollama, LM Studio); el modelo base en safetensors puede servirse con transformers y, potencialmente, con servidores compatibles con endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| Orpheus-Urdu-TTS-Zia-Mohyeddin (este) | 3,3 mil millones | no disponible | urdu | Apache 2.0 | GGUF y safetensors |
| Aasher/Orpheus-Urdu-TTS-Zia-Mohyeddin (base) | 3,3 mil millones | no disponible | urdu | Apache 2.0 | safetensors |
| Orpheus TTS base (Canopy Labs) | no disponible en la informacion | no disponible | ingles principalmente | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en urdu; no soporta otros idiomas de forma fiable.
- Riesgo de alucinacion acustica: como todo TTS generativo, puede producir artefactos, prosodia incorrecta o pronunciaciones erroneas en palabras poco frecuentes.
- Las cuantizaciones bajas (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad de la voz; el autor recomienda Q4_K_S o Q4_K_M como equilibrio.
- No hay cuantizaciones con imatrix disponibles, lo que puede limitar la calidad frente a otras distribuciones del mismo modelo.
- El modelo clona la voz de una persona real (Zia Mohyeddin); su uso debe respetar derechos de imagen y normativa aplicable sobre sintesis de voz, aunque la licencia del modelo sea Apache 2.0.
- No se documentan sesgos especificos ni evaluaciones de robustez; se recomienda validacion en produccion.
- La ausencia de benchmarks publicados impide comparar su calidad objetiva con otros TTS en urdu.
- El repositorio pesa 30,3 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Orpheus-Urdu-TTS-Zia-Mohyeddin-GGUF
- Modelo base: https://huggingface.co/Aasher/Orpheus-Urdu-TTS-Zia-Mohyeddin
- Dataset de ajuste: https://huggingface.co/datasets/muhammadsaadgondal/urdu-tts
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Orpheus-Urdu-TTS-Zia-Mohyeddin-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
