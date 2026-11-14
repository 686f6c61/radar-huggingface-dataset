# JuzeZhang/glm-4-voice-timbre

## Resumen

glm-4-voice-timbre es una coleccion de ocho voces adicionales para el decodificador de voz de GLM-4-Voice, distribuidas como checkpoints independientes de su modelo de flow-matching (`flow.pt`). El autor, JuzeZhang, no modifica el LLM, el tokenizador de voz ni el vocoder HiFT del sistema original: cada voz es un ajuste fino del mencionado `flow.pt` sobre 25-35 minutos de audio de un unico hablante. Al sustituir el fichero `flow.pt` del decodificador oficial (THUDM/glm-4-voice-decoder) por el de una de estas carpetas, cambia el timbre de salida de GLM-4-Voice, o de cualquier modelo que emita tokens de voz compatibles, como un estudiante destilado de 0,5B.

El interes practico de esta publicacion es que demuestra que el timbre del decodificador reside en los pesos del flow-matching, no en los embeddings de hablante: la sonda con embeddings zero-shot o prompts apenas movia la similitud CAM++ (entre -0,07 y 0,06). Partiendo de esa observacion, el autor ajusta solo `flow.pt` con AdamW, learning rate 3e-5, batch 16, recortes aleatorios de 6 s, grad clip 1.0 y 2000 pasos (unos 10 minutos en una GPU), manteniendo el embedding de hablante a cero. El resultado son voces femeninas y masculinas en mandarin (AISHELL-3) e ingles (LibriTTS-R) que alcanzan similitudes CAM++ de 0,78 a 0,93 con el hablante objetivo en reconstruccion held-out.

El modelo es relevante para quien trabaja en sintesis de voz sobre GLM-4-Voice y necesita voces controladas sin reentrenar el sistema completo, pero conviene tener presente que se trata de una publicacion de investigacion con 0 descargas y 0 likes en el momento de redactar esta ficha, con pesos alojados fuera de Hugging Face (Google Drive) y con una evaluacion basada unicamente en metricas automaticas sobre conjuntos de test pequenos, sin pruebas de escucha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching sobre el decodificador de voz de GLM-4-Voice (vocoder HiFT y tokenizador sin cambios) |
| Parametros totales | no disponible (checkpoint `flow.pt` de 445 MB por voz; 3,4 GB en total) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del LLM GLM-4-Voice que genera los tokens de voz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en |
| Licencia | glm-4-voice (etiquetada como "other"; uso academico libre, uso comercial requiere registro con Zhipu AI) |
| Formato de pesos | `flow.pt` (PyTorch), distribuido en Google Drive con `SHA256SUMS` |

## Arquitectura y entrenamiento

Cada voz es un ajuste fino exclusivo del modelo de flow-matching del decodificador de GLM-4-Voice. Los objetivos de entrenamiento son tokens de voz GLM-4-Voice generados por el tokenizador oficial y el mel de 22,05 kHz del mismo clip de audio, con el embedding de hablante fijado a cero, exactamente como lo pasa el codigo de inferencia oficial. El LLM, el tokenizador y el vocoder HiFT no se tocan, lo que hace que las voces sean intercambiables sin cambios de codigo.

Los datos de entrenamiento provienen de dos corpus abiertos con licencia y consentimiento: AISHELL-3 (OpenSLR SLR93, Apache 2.0) para mandarin, con cuatro hablantes (SSB0033, SSB0435 femeninos; SSB0603, SSB0590 masculinos) y 25 minutos por voz; y LibriTTS-R (OpenSLR SLR141, CC BY 4.0) para ingles, con cuatro hablantes (40, 1088 femeninos; 6209, 7447 masculinos) y entre 30 y 34 minutos por voz. El genero se asigno a partir de la F0 mediana con umbral de 165 Hz, y el autor advierte que LibriTTS-R 40 y 1088 estan en el limite. El procedimiento de ajuste es AdamW con lr 3e-5, batch 16, recortes aleatorios de 6 s, grad clip 1.0 y 2000 pasos, aproximadamente 10 minutos en una GPU. No se documenta RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Cambio de timbre del decodificador de GLM-4-Voice: sustituye `flow.pt` y altera la voz de salida sin modificar el contenido ni el timing, que siguen derivandose de los tokens de voz.
- Ocho voces preentrenadas: cuatro en mandarin y cuatro en ingles, con hablantes femeninos y masculinos identificados.
- Compatibilidad con modelos que emiten tokens de voz GLM-4-Voice, incluido un estudiante destilado de 0,5B citado en la model card.
- Carga simultanea de varias voces mediante una instancia de `AudioDecoder` por voz, apuntando cada `flow_ckpt_path` a un `flow.pt` distinto.
- Generacion de una misma respuesta en varios timbres: se generan los tokens de voz una vez y se decodifican con cada voz.
- Capacidades multilingues limitadas a zh y en; las voces de mandarin tambien hablan ingles, pero con menor similitud con su hablante (0,53-0,63).
- No se documentan tool calling, function calling, agentes, vision ni audio de entrada; la ficha se limita a text-to-speech.

## Casos de uso

- Prototipado de voces para GLM-4-Voice: un equipo que ya despliega GLM-4-Voice puede incorporar una de estas voces copiando un unico `flow.pt`, sin reentrenar el LLM ni el vocoder, para validar rapidamente una identidad vocal concreta.
- Evaluacion de estudiantes destilados: al decodificar las respuestas de un estudiante de 0,5B con estas voces se comprueba si la calidad de los tokens de voz se mantiene al cambiar el timbre, con CER de 0,95-1,59% en chino y WER de 3,4-5,7% en ingles.
- Generacion de audio multilingue en un mismo producto: las voces de LibriTTS-R cubren ingles y las de AISHELL-3 cubren mandarin, permitiendo elegir el timbre por idioma dentro de una misma aplicacion.
- A/B testing de timbres: cargando varias instancias de `AudioDecoder` con distintos `flow.pt` se puede comparar la misma respuesta en varias voces sobre los mismos tokens, aislando el efecto del timbre del resto del pipeline.
- Investigacion sobre control de timbre: la publicacion documenta que los embeddings zero-shot apenas mueven la voz del decodificador original, lo que convierte estos checkpoints en una referencia util para estudiar donde reside la identidad vocal en modelos de flow-matching.
- Generacion de contenido en mandarin con metrica de inteligibilidad: el CER medido con Whisper large-v3 (0,95-1,59%) frente al 1,27% de la voz original permite usar estas voces en demos y pruebas de inteligibilidad sin degradar la transcripcion.
- Creacion de voces sinteticas para entornos controlados: dado que solo se usan corpus abiertos y consentidos, sirven para experimentos academicos de sintesis con hablantes documentados, nunca para suplantar personas reales.

## Benchmarks y rendimiento

Similitud coseno CAM++ con el centroide de 10 clips held-out del hablante objetivo ("real-real" es el techo, dos grabaciones reales del mismo hablante):

| Voz | Reconstruccion held-out, antes -> despues | Real-real |
|---|---|---|
| SSB0033 | 0,19 -> 0,79 | 0,875 |
| SSB0435 | 0,05 -> 0,85 | 0,89 |
| SSB0603 | 0,07 -> 0,78 | 0,865 |
| SSB0590 | 0,08 -> 0,81 | 0,868 |
| LibriTTS-R 40 | 0,52 -> 0,83 | 0,854 |
| LibriTTS-R 1088 | 0,60 -> 0,86 | 0,888 |
| LibriTTS-R 6209 | 0,38 -> 0,81 | 0,844 |
| LibriTTS-R 7447 | 0,39 -> 0,93 | 0,963 |

Decodificacion de respuestas de un estudiante de 0,5B destilado de GLM-4-Voice:

| Metrica | Resultado |
|---|---|
| Chino, 20 prompts, similitud con el propio hablante | 0,75-0,80 |
| Chino, 20 prompts, similitud con otros hablantes | maximo 0,19 |
| Chino, 20 prompts, CER con Whisper large-v3 | 0,95-1,59% (voz original 1,27%) |
| Ingles, 10 prompts, voces LibriTTS-R, similitud | 0,87-0,90 |
| Ingles, 10 prompts, voces LibriTTS-R, WER | 3,4-5,7% (voz original 5,7%) |
| Ingles con voces de mandarin, similitud con su hablante | 0,53-0,63 |

Estas cifras son metricas automaticas sobre conjuntos de test pequenos y no se acompanan de pruebas de escucha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; cada checkpoint `flow.pt` ocupa 445 MB y el conjunto completo 3,4 GB.
- GPU recomendadas: no disponibles; el ajuste fino de cada voz se completa en unos 10 minutos en una GPU, pero no se especifica el modelo.
- Cabe en GPU consumer: no confirmado; por el tamano de los checkpoints (445 MB por voz) es plausible, pero no hay datos publicados.
- Opciones de despliegue: inferencia oficial de GLM-4-Voice con `--flow-path`, usando el paquete `cosyvoice` y `huggingface_hub` para descargar el decodificador base; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glm-4-voice-timbre | no disponible (checkpoint de 445 MB por voz) | no disponible | Flow-matching afinado para timbre | glm-4-voice | Pesos en Google Drive, card en Hugging Face |
| THUDM/glm-4-voice-decoder | no disponible | no disponible | Decodificador oficial de GLM-4-Voice | glm-4-voice | Hugging Face |
| CosyVoice | no disponible en la informacion | no disponible | TTS con libreria `cosyvoice` | no disponible | Referenciado por la libreria del modelo |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Evaluacion limitada: solo metricas automaticas (CAM++, CER/WER) sobre conjuntos de test pequenos, sin pruebas de escucha humanas.
- Riesgo de suplantacion: el autor prohibe explicitamente usar estas voces para hacerse pasar por alguien y prohibe el ajuste fino sobre grabaciones de personas reales sin su consentimiento.
- Licencia: uso academico libre; el uso comercial requiere registro con Zhipu AI segun la licencia glm-4-voice, lo que condiciona despliegues en produccion.
- Idiomas: solo zh y en; las voces de mandarin pierden similitud con su hablante al hablar ingles (0,53-0,63).
- Genero asignado por F0 mediana: LibriTTS-R 40 y 1088 estan en el limite del umbral de 165 Hz, por lo que la clasificacion puede ser discutible.
- Dependencia del decodificador original: las voces solo funcionan sobre el decodificador de GLM-4-Voice o modelos que emitan tokens compatibles; no son un TTS autonomo.
- Distribucion fuera de Hugging Face: los pesos estan en Google Drive, lo que complica la reproducibilidad y la gestion de dependencias en pipelines automatizados.
- Madurez: 0 descargas y 0 likes en el momento de la ficha, creado en noviembre de 2026; conviene tratarlo como material de investigacion, no como componente estable de produccion.
- Sesgos: no se documentan sesgos conocidos mas alla de la procedencia de los corpus (AISHELL-3 y LibriTTS-R), que no se analizan en la card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JuzeZhang/glm-4-voice-timbre
- Pesos en Google Drive: https://drive.google.com/drive/folders/1OHbvq6kwtG2WefBlKpSoUrGa3m1g_v8I
- Codigo y muestras de audio: https://github.com/Juzezhang/glm4voice-timbre
- Decodificador base: https://huggingface.co/THUDM/glm-4-voice-decoder
- Repositorio oficial de GLM-4-Voice: https://github.com/THUDM/GLM-4-Voice
- AISHELL-3 (OpenSLR SLR93): Shi et al., "AISHELL-3: A Multi-speaker Mandarin TTS Corpus and the Baselines", 2020
- LibriTTS-R (OpenSLR SLR141): Koizumi et al., "LibriTTS-R: A Restored Multi-Speaker Text-to-Speech Corpus", 2023
