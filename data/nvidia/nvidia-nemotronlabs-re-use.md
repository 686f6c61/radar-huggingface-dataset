# nvidia/NVIDIA-NemotronLabs-RE-USE

## Resumen

NVIDIA NemotronLabs RE-USE es un modelo de mejora de voz universal (universal speech enhancement, USE) de tipo audio-a-audio, desarrollado por NVIDIA, que toma una grabacion degradada y devuelve la misma voz con mayor calidad sin alterar la identidad del hablante. Con solo 9.607.747 parametros (9,6 M), esta disenado para cubrir degradaciones muy distintas: ruido aditivo, reverberacion, clipping, limitacion de ancho de banda, artefactos de codec, perdida de paquetes y microfonos de baja calidad.

Su rasgo diferencial es la versatilidad de entrada: acepta frecuencias de muestreo de 8, 16, 22,05, 24, 32, 44,1 y 48 kHz, algo poco habitual en modelos de enhancement, que suelen fijar una unica tasa (tipicamente 16 kHz) y obligan a remuestrear el audio antes y despues. Ademas, es agnostico de idioma, por lo que no depende de transcripciones ni de un reconocedor de voz para funcionar.

Es relevante ahora porque compite con modelos de 250 M y 500 M de parametros (Sidon, UniPASE) obteniendo mejores metricas de inteligibilidad y preservacion de locutor con un modelo dos ordenes de magnitud mas pequeno, lo que habilita despliegue en GPU consumer e incluso en entornos con recursos ajustados. La model card indica que el modelo esta listo para uso comercial bajo licencia OpenMDW-1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de espacio de estados (SSM) tipo Mamba; la libreria declarada es `mamba-ssm` |
| Parametros totales | 9.607.747 (9,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; en el dominio de audio, los datos de entrenamiento son clips de menos de 10 s y se ofrece un modo de troceado (`inference_chunk.sh`) para audios largos (por ejemplo, >30 s) |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos en safetensors y no se documentan variantes cuantizadas |
| Idiomas soportados | agnostico de idioma; no se publica lista de idiomas evaluados |
| Licencia | OpenMDW-1.1 (Open Model Distribution & Weights License Agreement, version 1.1) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no ofrece una descripcion detallada de la arquitectura interna. Los metadatos tecnicos disponibles (tag `mamba-ssm` y `library_name: mamba-ssm`) situan el modelo en la familia de los modelos de espacio de estados (SSM) tipo Mamba, y la propia card remite a un entorno Docker con kernels de Mamba precompilados, lo que confirma que la inferencia depende de kernels CUDA especificos de esa familia. Se trata, por tanto, de un modelo de secuencia para audio y no de un transformer clasico de texto.

En cuanto al entrenamiento, la informacion publicada se limita a la composicion del material de entrenamiento en terminos de duracion: clips de menos de 10 segundos. El objetivo declarado es la robustez frente a ruido aditivo, reverberacion, clipping, limitacion de ancho de banda, artefactos de codec, perdida de paquetes y microfonos de baja calidad, manteniendo la fidelidad de la voz. No se documentan en la informacion disponible el numero de horas de audio, la composicion exacta del dataset, ni si se emplearon etapas de RLHF, DPO u otro ajuste por preferencias. Existe una variante especifica, `NVIDIA-NemotronLabs-RE-USE-laughter`, pensada para preservar mejor las risas, lo que sugiere que el modelo base tiende a atenuar eventos no estrictamente linguisticos. En el caso de habla solapada, el modelo esta entrenado para preservar al hablante principal y suprimir a los secundarios.

## Capacidades

- Mejora de voz universal: elimina o atenua ruido aditivo, reverberacion, clipping y artefactos de codec en una sola pasada.
- Soporte nativo de multiples tasas de muestreo de entrada: 8, 16, 22,05, 24, 32, 44,1 y 48 kHz.
- Extension de ancho de banda opcional, activable mediante el argumento `BWE` del script de inferencia (requiere `resampy`).
- Capacidad agnostica de idioma: no necesita transcripcion ni modelo ASR auxiliar; funciona igual sobre castellano, ingles u otras lenguas sin configuracion adicional.
- Preservacion de locutor: la evaluacion con ECAPA-TDNN reporta 0,86 de similitud de hablante en el conjunto completo, frente a 0,81 de UniPASE.
- Supresion de hablantes secundarios en solapamientos, preservando la voz principal.
- Procesamiento por troceado para audios largos, con parametros configurables `chunk_size_in_seconds` y `hop_length_portion`.
- Modalidad audio-a-audio; la demo publica acepta subida de audio o video.
- No es un modelo generativo de texto: no soporta tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Postproduccion de podcast y video: el modelo procesa directamente material grabado a 44,1 o 48 kHz sin remuestrear, de modo que la cadena de edicion conserva la tasa original y se evita una perdida de calidad intermedia. El troceado permite tratar episodios completos de mas de 30 segundos.
- Preprocesado para reconocimiento automatico del habla: en el conjunto completo, la tasa de acierto de caracteres (CAcc, OWSM v3.1) sube de 81,29 en audio ruidoso a 89,17 tras la mejora, por lo que colocarlo delante de un ASR reduce errores de transcripcion sin reentrenar el reconocedor.
- Restauracion de archivos historicos o de telefonia: al aceptar 8 kHz de entrada y permitir extension de ancho de banda, sirve para recuperar grabaciones telefonicas o digitalizaciones antiguas y devolverlas en 16 kHz o superiores listas para archivo o difusion.
- Limpieza de audio de reuniones y videoconferencias: con 9,6 M de parametros el coste por minuto es bajo, lo que permite procesar lote completo de grabaciones corporativas antes de indexarlas o transcribirlas.
- Acondicionamiento de datos para entrenar TTS y ASR: al mejorar la relacion senal-ruido y la inteligibilidad (STOI 0,78 en el conjunto completo frente a 0,50 del audio ruidoso) se puede depurar un corpus ruidoso en lugar de descartarlo, aumentando el volumen util de datos.
- Doblaje y localizacion multilingue: la naturaleza agnostica de idioma permite aplicar el mismo modelo a voces en distintos idiomas de un proyecto sin seleccionar variantes por lengua.
- Procesado en el borde o en equipos modestos: el tamano de pesos en fp16 ronda los 19 MB, lo que hace viable integrarlo en servicios con GPU compartida o en estaciones de trabajo de gama media, siempre que se disponga de los kernels Mamba.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre subconjuntos del conjunto de test no ciego de URGENT 2025, comparados contra habla limpia anecoica de referencia. SBERT es SpeechBERTScore, LPS es Levenshtein Phoneme Similarity, Spk es similitud de locutor con ECAPA-TDNN y CAcc es la precision de caracteres de ASR con OWSM v3.1.

Conjunto completo:

| Modelo | Parametros | DNSMOS | NISQA | UTMOS | PESQ | STOI | SBERT | LPS | Spk | CAcc |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Audio ruidoso (referencia) | - | 1,84 | 1,69 | 1,56 | 1,34 | 0,50 | 0,74 | 0,61 | 0,73 | 81,29 |
| Sidon | 250 M | 3,34 | 3,87 | 3,21 | 1,73 | 0,62 | 0,85 | 0,80 | 0,74 | 84,68 |
| UniPASE | 500 M | 3,21 | 4,03 | 2,96 | 2,17 | 0,76 | 0,89 | 0,85 | 0,81 | 87,28 |
| NemotronLabs RE-USE | 9,6 M | 3,29 | 4,33 | 2,94 | 2,57 | 0,78 | 0,88 | 0,85 | 0,86 | 89,17 |

Subconjuntos por tasa de muestreo:

| Subconjunto | Modelo | DNSMOS | NISQA | UTMOS | PESQ | STOI | SBERT | LPS | Spk | CAcc |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 16 kHz | Audio ruidoso | 1,84 | 1,59 | 1,41 | 1,29 | 0,53 | 0,70 | 0,58 | 0,63 | 76,54 |
| 16 kHz | UniSE | 3,23 | 3,71 | 2,77 | 1,46 | 0,62 | 0,77 | 0,60 | 0,57 | 54,82 |
| 16 kHz | NemotronLabs RE-USE | 3,19 | 4,20 | 2,64 | 2,47 | 0,82 | 0,87 | 0,84 | 0,82 | 87,09 |
| 44,1 kHz | Audio ruidoso | 1,91 | 1,79 | 1,52 | 1,30 | 0,52 | 0,76 | 0,61 | 0,80 | 83,65 |
| 44,1 kHz | Resemble Enhance | 3,13 | 3,68 | 2,11 | 1,33 | 0,41 | 0,69 | 0,46 | 0,57 | 47,22 |
| 44,1 kHz | NemotronLabs RE-USE | 3,36 | 4,44 | 2,80 | 2,47 | 0,80 | 0,89 | 0,86 | 0,90 | 91,54 |
| 48 kHz | Audio ruidoso | 2,04 | 1,83 | 1,99 | 1,28 | 0,55 | 0,77 | 0,77 | 0,78 | 90,64 |
| 48 kHz | ClearVoice | 2,97 | 3,38 | 3,01 | 2,09 | 0,70 | 0,84 | 0,87 | 0,77 | 89,92 |
| 48 kHz | NemotronLabs RE-USE | 3,33 | 4,49 | 3,63 | 2,59 | 0,77 | 0,89 | 0,91 | 0,86 | 91,05 |

No se han publicado otros resultados de benchmarks (por ejemplo, sobre MUSAN, VoiceBank-DEMAND o DNS Challenge) en la informacion disponible.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 38 MB en fp32 y 19 MB en fp16/bf16, calculado a partir de los 9.607.747 parametros. El repositorio ocupa 0,0 GB.
- VRAM para inferencia: no disponible de forma oficial. El consumo dominado por activaciones depende de la tasa de muestreo (hasta 48 kHz) y de la duracion del clip; el autor advierte de posibles errores de memoria (OOM) con audios largos y ofrece el modo `inference_chunk.sh` como mitigacion.
- GPU recomendadas: el autor no publica una lista. Por tamano del modelo, cualquier GPU consumer reciente es suficiente en terminos de pesos; los kernels Mamba requieren CUDA y el entorno se simplifica con las imagenes Docker precompiladas enlazadas desde el repositorio SEMamba.
- Cabe en GPU consumer: si, previsiblemente cualquiera con soporte CUDA; no hay una VRAM minima publicada.
- Opciones de despliegue: scripts `inference.sh` e `inference_chunk.sh` del propio repositorio, contenedor Docker con Mamba precompilado y la demo Gradio alojada en Hugging Face Spaces. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, y estos motores no son aplicables al tratarse de un modelo de audio.
- Latencia y throughput: no disponibles. La unica referencia indirecta es que los clips de entrenamiento son de menos de 10 s y que los audios de mas de 30 s requieren troceado.
- Dependencia adicional: `resampy` si se activa la extension de ancho de banda mediante el argumento `BWE`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tasa de entrada | PESQ (conjunto completo) | NISQA (conjunto completo) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| NVIDIA NemotronLabs RE-USE | 9,6 M | agnostico; 8 a 48 kHz | 2,57 | 4,33 | OpenMDW-1.1 | pesos en HF, demo Gradio |
| UniPASE | 500 M | no disponible | 2,17 | 4,03 | no disponible | citado como linea base open source |
| Sidon | 250 M | no disponible | 1,73 | 3,87 | no disponible | citado como linea base open source |
| UniSE | no disponible | evaluado en subconjunto de 16 kHz | 1,46 (16 kHz) | 3,71 (16 kHz) | no disponible | citado como linea base open source |
| Resemble Enhance | no disponible | evaluado en subconjunto de 44,1 kHz | 1,33 (44,1 kHz) | 3,68 (44,1 kHz) | no disponible | linea base open source |
| ClearVoice | no disponible | evaluado en subconjunto de 48 kHz | 2,09 (48 kHz) | 3,38 (48 kHz) | no disponible | linea base open source |

La ventaja principal frente a las alternativas no es solo metrica: RE-USE es entre 26 y 52 veces mas pequeno que Sidon y UniPASE respectivamente, manteniendo mejores resultados en PESQ, NISQA, STOI, LPS y CAcc en el conjunto completo, y solo cediendo marginalmente en DNSMOS frente a Sidon y en SBERT frente a UniPASE.

## Limitaciones y advertencias

- Dominio estrictamente de voz: no procesa musica ni audio generico; en habla solapada su comportamiento es suprimir a los hablantes secundarios, lo que puede ser indeseable en diarizacion o en grabaciones de reuniones con varias voces activas.
- Entrenado con clips de menos de 10 s: los audios largos exigen el flujo de troceado, con riesgo de discontinuidades o artefactos en las juntas si no se ajustan bien `chunk_size_in_seconds` y `hop_length_portion`.
- Riesgo de sobreprocesado: la variante especifica para risas sugiere que el modelo base puede atenuar eventos paralinguisticos (risas, suspiros, ruidos vocales) relevantes en contenido expresivo.
- Idiomas: se declara agnostico, pero no se publica evaluacion por idioma, de modo que el rendimiento real en castellano o en lenguas de bajos recursos no esta cuantificado.
- Alucinacion en sentido estricto no aplica (no genera lenguaje), pero si existe riesgo de artefactos de sintesis y de modificacion del timbre en condiciones muy degradadas.
- Sin datos publicados sobre sesgos demograficos, de acento o de genero; la evaluacion de locutor se limita a una similitud media con ECAPA-TDNN.
- Licencia OpenMDW-1.1: la model card afirma que el modelo esta listo para uso comercial, pero conviene revisar el texto completo de la licencia antes de redistribuir pesos o integrarlos en un producto.
- Dependencia de kernels Mamba y CUDA: la instalacion no es trivial y el propio autor remite a Docker precompilado; no hay version CPU ni formato GGUF documentado.
- El proyecto no acepta contribuciones y la informacion sobre datos de entrenamiento es muy escasa, lo que dificulta auditorias de procedencia de datos.
- No se han publicado datos de latencia, throughput ni consumo energetico, imprescindibles para dimensionar un servicio en produccion.
- Las busquedas web realizadas no devolvieron informacion tecnica adicional sobre este modelo; solo paginas corporativas generales de NVIDIA, por lo que esta ficha se basa exclusivamente en la model card y los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE
- Variante con preservacion de risas: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE-laughter
- Demo interactiva Gradio: https://huggingface.co/spaces/nvidia/NVIDIA-NemotronLabs-RE-USE
- Referencia arXiv indicada en los tags: arxiv:2603.02641 (https://arxiv.org/abs/2603.02641)
- Referencia arXiv indicada en los tags: arxiv:2606.25621 (https://arxiv.org/abs/2606.25621)
- Licencia OpenMDW 1.1: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Entorno Docker con Mamba precompilado (repositorio SEMamba): https://github.com/RoyChao19477/SEMamba?tab=readme-ov-file#-docker-support
