# robello2/whisper-medium-yecs-baseline

## Resumen

whisper-medium-yecs-baseline es un ajuste fino de openai/whisper-medium sobre el corpus YECS de habla con alternancia de codigo (code-switching) yoruba-ingles. Lo publica el usuario robello2 en Hugging Face y su objetivo es mejorar el reconocimiento automatico del habla en conversaciones donde se mezclan el yoruba (`yo`) y el ingles (`en`), un escenario especialmente problematico para los modelos ASR multilingues genericos, que suelen degradarse cuando el hablante cambia de idioma dentro de una misma emision. El modelo se presenta como una linea base (baseline) de referencia para este corpus.

Arquitectonicamente hereda el transformer encoder-decoder de Whisper en su variante medium, con 763.857.920 parametros totales y pesos en formato safetensors (repo de 3,1 GB). Mantiene la tokenizacion y el esquema de tokens de idioma de Whisper: durante el entrenamiento se asigno a cada emision el token `<|en|>` o `<|yo|>` segun el idioma mayoritario de las etiquetas de palabra, y en inferencia se recomienda decodificar con deteccion automatica de idioma. La longitud de contexto de audio corresponde a la nativa de Whisper-medium (ventanas de 30 segundos), aunque este dato no se explicita en la model card.

Es relevante para investigadores en ASR de bajos recursos y en code-switching, porque publica metricas internas desglosadas por idioma y por proximidad al punto de cambio de codigo, y porque usa una licencia poco habitual (NOODL-1.0) que condiciona su reutilizacion. El modelo no declara resultados en benchmarks publicos estandar, solo en su conjunto de desarrollo interno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) |
| Parametros totales | 763.857.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio nativa de Whisper, 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | yoruba (`yo`), ingles (`en`) |
| Licencia | NOODL-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (no se especifica si con capas congeladas) de openai/whisper-medium, un transformer encoder-decoder con atencion estandar disenado para transcripcion de audio y traduccion. No incorpora innovaciones arquitectonicas propias: la contribucion esta en el ajuste sobre datos de code-switching. El corpus de entrenamiento es el split congelado de YECS, con 75.999 emisiones; se reservo un conjunto de desarrollo interno.

El procedimiento de entrenamiento esta detallado en la model card: learning rate 1e-5, 500 pasos de warmup, batch 16 con acumulacion de gradientes 2 (batch efectivo 32), precision bf16, hasta 10 epocas con early stopping (paciencia 3) sobre WER greedy de desarrollo, semilla 42. Se selecciono el paso 3000 de 6000, equivalente a 2,53 epocas. Para el token de idioma por emision se uso el idioma mayoritario de las etiquetas de palabra, con desempate hacia `en`. No se menciona uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) en yoruba e ingles.
- Manejo de habla con alternancia de codigo yoruba-ingles, incluida la evaluacion especifica de errores cerca y lejos de los puntos de cambio.
- Deteccion automatica de idioma en decodificacion (recomendada por el autor).
- Decodificacion con beam search (los resultados reportados usan beam 5).
- Puntuacion y diacriticos preservados en el protocolo de evaluacion (NFC, puntuacion eliminada, diacriticos mantenidos).
- No se declaran capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion de conversaciones bilingues yoruba-ingles: el ajuste sobre YECS reduce el error en emisiones con mezcla de idiomas, adecuado para entrevistas, reuniones o contenido audiovisual de comunidades yorubahablantes en entornos angloparlantes.
- Investigacion en ASR de code-switching: sirve como linea base reproducible (semilla, pasos, hiperparametros documentados) para comparar nuevas tecnicas de adaptacion o de modelado de cambio de codigo.
- Evaluacion de metricas especificas de cambio de codigo: al reportar `switch_near_err` y `switch_away_err`, permite analizar el comportamiento del modelo alrededor de los puntos de alternancia y disenar mejoras dirigidas.
- Subtitulado de contenido educativo o divulgativo con prestamos del ingles: el modelo mantiene el ingles con menor error (7,83 %) que el yoruba (17,08 %), por lo que es mas fiable en segmentos predominantemente ingleses con inserciones de yoruba.
- Prototipado de asistentes de voz para servicios publicos en regiones donde se alterna yoruba e ingles: la deteccion automatica de idioma simplifica la integracion en pipelines que no conocen a priori el idioma del hablante.
- Analisis linguistico de corpus orales: la salida con diacriticos preservados facilita estudios de tono y de prestamos lexicos, aunque con la cautela de la tasa de error en yoruba.

## Benchmarks y rendimiento

Resultados internos de desarrollo reportados por el autor (beam 5, idioma automatico, porcentajes):

| Metrica | Valor |
|---|---|
| WER | 13,64 |
| CER | 4,60 |
| di_wer | 10,00 |
| err_yo | 17,08 |
| err_en | 7,83 |
| pier_yo | 18,91 |
| switch_near_err | 12,04 |
| switch_away_err | 12,40 |
| ins_per_word | 1,40 |

No se han publicado resultados de benchmarks en la informacion disponible para comparar con otros modelos (MMLU, HumanEval, GSM8K u otros no aplican a un modelo ASR; no hay comparacion con Whisper-medium original ni con otros ajustes).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,5-2 GB solo para pesos, mas memoria de activaciones y cache de atencion; en la practica, unos 3-4 GB para audio de 30 segundos con batch pequeno.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090); para lotes grandes o throughput alto, A100 o H100.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas.
- Opciones de despliegue: transformers (pipeline de automatic-speech-recognition), vLLM no aplica de forma estandar a Whisper, faster-whisper y whisper.cpp/llama.cpp requieren conversion a sus formatos; TGI no soporta Whisper de forma nativa. No se documentan cuantizaciones oficiales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-medium-yecs-baseline | 763.857.920 | yo, en | 30 s (nativo Whisper) | NOODL-1.0 | Hugging Face, 0 descargas |
| openai/whisper-medium | 763.857.920 | multilingue (99 idiomas) | 30 s | MIT (pesos originales) | Hugging Face, ampliamente usado |
| openai/whisper-large-v3 | no disponible en la informacion | multilingue | 30 s | MIT (pesos originales) | Hugging Face |
| Ajustes ASR especificos de yoruba | no disponible | yo (y variantes) | no disponible | variable | Hugging Face |

La comparacion cuantitativa de rendimiento con alternativas no esta disponible: el autor no publica WER del modelo base ni de otros sistemas sobre YECS. La ventaja declarada es la especializacion en code-switching yoruba-ingles; la desventaja frente a whisper-medium original es la perdida de cobertura de los ~99 idiomas de Whisper y una licencia mas restrictiva.

## Limitaciones y advertencias

- El WER en yoruba (17,08 %) es mas del doble que en ingles (7,83 %); el rendimiento es claramente asimetrico entre idiomas.
- El modelo solo se ha evaluado en el conjunto de desarrollo interno de YECS; no hay validacion en dominios externos, por lo que la generalizacion a otros acentos, canales o registros es desconocida.
- Riesgo de alucinacion y de sustituciones en segmentos con ruido o habla solapada, comun en modelos Whisper; no se documentan mitigaciones.
- La licencia NOODL-1.0 condiciona el uso comercial y la redistribucion; es imprescindible revisar sus terminos antes de desplegar en produccion.
- El corpus YECS puede contener sesgos demograficos y dialectales del yoruba; el modelo puede reproducirlos.
- No hay informacion sobre cuantizaciones oficiales ni sobre el comportamiento en precision reducida (int8, int4).
- El repositorio tiene 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- El modelo base es whisper-medium, con menor capacidad que whisper-large-v3; no se comparan resultados entre ambos.

## Enlaces

- Hugging Face: https://huggingface.co/robello2/whisper-medium-yecs-baseline
- Modelo base: https://huggingface.co/openai/whisper-medium
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
