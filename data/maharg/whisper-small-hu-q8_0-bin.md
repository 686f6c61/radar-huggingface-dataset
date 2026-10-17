# maharg/whisper-small-hu-q8_0.bin

## Resumen

`maharg/whisper-small-hu-q8_0.bin` es una conversión cuantizada a GGML del modelo de reconocimiento automático del habla `SubZtep/whisper-small-hu`, un fine-tune de OpenAI Whisper Small sobre Common Voice 26.0 en húngaro. No se trata de un modelo nuevo: el repositorio contiene únicamente el artefacto de voz convertido para su uso con whisper.cpp, con cuantización q8_0 y un tamaño de repositorio de 0,3 GB.

El modelo resuelve transcripción de audio en húngaro en entornos locales, sin depender de servicios en la nube y con un peso reducido apto para CPU. La ficha lo presenta como "Whisper Small Hungarian for Tabiti"; la model card no detalla qué es Tabiti ni cómo se integra, por lo que esa parte no puede confirmarse con la información disponible.

Su relevancia actual está en el despliegue de ASR húngaro de bajo coste: al estar cuantizado en q8_0 y convertido con whisper.cpp v1.9.3, permite prototipos y aplicaciones offline en hardware modesto. La contrapartida es que no hay una evaluación independiente del binario cuantizado: las métricas publicadas pertenecen al fine-tune original y no al proceso q8_0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper small de OpenAI, convertido a GGML para whisper.cpp; modelo transformer de la familia Whisper para ASR |
| Parámetros totales | No disponible en la información proporcionada; la model card no indica el recuento |
| Parámetros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada. Es un modelo de audio, no de texto; la familia Whisper suele operar con ventanas de 30 s, pero la model card no lo confirma |
| Tipos de cuantización | q8_0 (8 bits); el proceso parte de f16 y aplica `whisper-quantize q8_0`. No se listan otras variantes en el repositorio |
| Idiomas soportados | Húngaro (`hu`) |
| Licencia | MIT |
| Formato de pesos | GGML `.bin`; no se distribuyen safetensors |
| Modelo base | `SubZtep/whisper-small-hu` |
| Tarea | Reconocimiento automático del habla (ASR), sin traducción |
| Herramienta de conversión | whisper.cpp v1.9.3, commit `371b5a7561823ab2bb32142d2751e35e7534727b` |

## Arquitectura y entrenamiento

El modelo original es un Whisper Small de OpenAI, fine-tuneado por SubZtep sobre Common Voice 26.0 en húngaro. La model card indica que el fine-tune original tiene licencia MIT y que el autor reporta WER 15,62 y CER 3,33 sobre el split de test húngaro. Esos valores son autopublicados por el fine-tune, no mediciones independientes de esta conversión cuantizada.

La conversión la realizó maharg con whisper.cpp v1.9.3, usando `convert-h5-to-ggml.py` con f16 por defecto y después `whisper-quantize` con q8_0. Se partió de la revisión `3a6023e2806992205081f08e4ede704c2ce33bc2` del modelo base y de los assets de `openai/whisper` en la revisión `31243bad24cc746f07d4c8bfdd2d974872cb1803`. El entorno declarado incluye Python 3.11, Transformers 4.44.2, PyTorch 2.6.0 en CPU, NumPy 1.26.4 y safetensors 0.5.3.

No se documentan el número de tokens, las horas de audio, la composición completa del dataset ni si hubo RLHF o DPO. La única información de entrenamiento disponible es el uso de Common Voice 26.0 Hungarian en el fine-tune. La innovación técnica del repositorio es la propia cuantización q8_0 para reducir el peso y facilitar inferencia en CPU con whisper.cpp; no se describen decodificación especulativa, atención lineal ni otras optimizaciones adicionales.

## Capacidades

- Transcripción de voz a texto en húngaro con whisper.cpp, usando el idioma forzado `-l hu`, decodificación greedy y sin traducción.
- Reconocimiento de audio para integrarlo en pipelines locales de ASR; el modelo card no especifica procesamiento de audio largo, por lo que la segmentación externa debe gestionarse en la aplicación.
- Funcionamiento previsto en CPU y en entornos sin GPU dedicada, gracias al formato GGML q8_0 y al tamaño de repositorio de 0,3 GB.
- No se documentan capacidades de traducción, tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generation ni modo thinking.
- El multilingüismo no está declarado para este artefacto: la model card indica húngaro y recomienda forzar ese idioma.
- El modelo puede ser menos preciso en nombres propios, habla espontánea o audio con ruido, tal como advierte el autor.
- No incluye otros modelos ni componentes adicionales: el repositorio contiene únicamente el modelo de voz convertido.

## Casos de uso

- Transcripción de reuniones y entrevistas en húngaro: se procesa el audio con whisper.cpp usando `-l hu` y decodificación greedy; el peso q8_0 de 0,3 GB permite ejecución local en CPU. Para grabaciones largas, la aplicación debe segmentar el audio porque la model card no documenta gestión de contexto largo.
- Subtitulado por lotes de vídeo o podcast en húngaro: el modelo puede generar transcripciones en un pipeline offline y revisar después nombres propios y términos técnicos. Es adecuado cuando se prioriza coste bajo y ejecución local frente a una precisión máxima.
- Asistentes de voz para aplicaciones húngaras: el modelo actúa como etapa ASR antes de un sistema de comprensión del lenguaje o de comandos. La licencia MIT y el formato GGML facilitan prototipos y despliegues controlados.
- Digitalización de archivos orales y entrevistas: al ejecutarse en local, permite transcribir material sensible sin enviar audio a servicios externos. El formato cuantizado reduce almacenamiento y requisitos de memoria.
- Evaluación de ASR húngaro de bajo recurso: sirve como baseline para comparar transcripciones y calcular WER/CER propios. No debe compararse directamente con el fine-tune original sin medir también la variante f16.
- Aplicaciones de escritorio o edge con CPU: el tamaño de 0,3 GB y la conversión a q8_0 permiten integrar el modelo en herramientas locales. Es una opción realista cuando no hay GPU y el idioma principal es el húngaro.
- Análisis de conversaciones de atención al cliente en húngaro: puede transcribir llamadas para análisis posterior, aunque la precisión puede caer en audio ruidoso o habla espontánea y requiere validación humana.

## Benchmarks y rendimiento

| Métrica | Resultado | Conjunto | Naturaleza del dato |
|---|---:|---|---|
| WER | 15,62 % | Hungarian test split | Autopublicado por `SubZtep/whisper-small-hu`; no es una medición independiente ni del binario q8_0 |
| CER | 3,33 % | Hungarian test split | Autopublicado por `SubZtep/whisper-small-hu`; no es una medición independiente ni del binario q8_0 |

No se han publicado resultados independientes de benchmarks para esta conversión cuantizada. Tampoco hay datos de MMLU, HumanEval o GSM8K, que no aplican a un modelo de ASR. No deben atribuirse los valores de WER y CER al archivo q8_0 sin una evaluación propia.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,3 GB y el formato q8_0 está pensado para inferencia en CPU, pero no se publican cifras de memoria pico.
- GPU recomendadas: no disponible. Por el tamaño del artefacto es plausible su uso en GPU consumer, pero no hay una lista validada de modelos ni requisitos oficiales.
- CPU: es el escenario principal documentado, mediante whisper.cpp v1.9.3. No se proporcionan latencia ni throughput.
- GPU consumer: el peso reducido hace viable plantear su ejecución en GPUs de gama media o baja, pero no se confirma con benchmarks publicados.
- Despliegue: whisper.cpp es la herramienta verificada por el autor. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp, y no se distribuyen pesos safetensors para HuggingFace Transformers.
- Latencia y throughput: no disponibles. Dependerán de la CPU/GPU, del audio y de la configuración de whisper.cpp.

## Comparativa con modelos similares

| Modelo | Parámetros | Ventana/contexto | Idiomas | Licencia | Formato | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| `maharg/whisper-small-hu-q8_0.bin` | No disponible | No disponible | Húngaro | MIT | GGML q8_0 | WER/CER heredados del fine-tune; sin medición del binario q8_0 | Público; 0 descargas y 0 likes en HuggingFace |
| `SubZtep/whisper-small-hu` | No disponible | No disponible | Húngaro | MIT | No disponible | WER 15,62 % y CER 3,33 % autopublicados | Público; modelo base del que parte esta conversión |
| `openai/whisper-small` | No disponible | No disponible | Multilingüe, según la página de Qualcomm AI Hub | No verificada en la información disponible | No disponible | No disponible | Público; modelo original de OpenAI |

No se han encontrado en la búsqueda modelos ASR húngaros comparables con datos públicos suficientes. La comparativa anterior es, por tanto, una comparación de variantes de la misma familia, no de alternativas independientes.

## Limitaciones y advertencias

- El modelo solo declara húngaro. No debe usarse como solución multilingüe ni para traducción; la model card recomienda `-l hu` y desactiva la traducción.
- Las métricas WER 15,62 y CER 3,33 pertenecen al fine-tune original y son autopublicadas. No hay evaluación independiente de esta conversión q8_0 ni comparación directa con la variante f16.
- La cuantización q8_0 puede introducir degradación de precisión frente a f16. Esa degradación no está cuantificada en la información disponible.
- El autor advierte de menor precisión en nombres, habla espontánea y audio ruidoso. En producción conviene aplicar normalización de audio y revisión humana en dominios sensibles.
- Existe riesgo de alucinación típico de sistemas ASR en silencios, ruido o audio ininteligible; no se han publicado evaluaciones específicas para este binario.
- No se documentan sesgos demográficos, acústicos o dialectales. Tampoco hay evaluación de equidad.
- La licencia MIT permite uso comercial y modificación, pero debe conservarse el aviso de copyright y verificar las condiciones de los componentes de terceros.
- El repositorio no incluye otros modelos ni componentes además del modelo de voz convertido. No debe asumirse que incorpora un pipeline completo de segmentación, puntuación o diarización.
- No se recomienda su uso en decisiones médicas, legales o de seguridad sin validación específica y supervisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maharg/whisper-small-hu-q8_0.bin
- Modelo base: https://huggingface.co/SubZtep/whisper-small-hu
- Whisper Small original: https://huggingface.co/openai/whisper-small
- whisper.cpp en HuggingFace: https://huggingface.co/ggerganov/whisper.cpp
- Documentación de descarga y conversión de whisper.cpp: https://deepwiki.com/ggml-org/whisper.cpp/5.1-model-download-and-conversion
- Modelos GGML para Whisper: https://snailtext.app/ggml-models/
- Whisper-Small en Qualcomm AI Hub: https://aihub.qualcomm.com/models/whisper_small
