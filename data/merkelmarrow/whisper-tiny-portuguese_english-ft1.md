# merkelmarrow/whisper-tiny-portuguese_english-ft1

## Resumen

Whisper tiny Portuguese English es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario merkelmarrow en HuggingFace. Se trata de un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura encoder-decoder de Whisper, disenado originalmente por OpenAI, y adaptado sobre el dataset naharte/portuguese_english para transcribir audio con contenido en portugues e ingles.

El modelo parte de la variante "tiny" de Whisper, la mas pequena de la familia, con aproximadamente 37,7 millones de parametros y un tamano de repositorio de 0,2 GB. Esta orientado a entornos con recursos muy limitados, donde la latencia y el consumo de memoria son criticos, a costa de una precision inferior a la de las variantes medium o large.

La relevancia de este modelo es acotada: se trata de un ajuste fino experimental con cero descargas y cero likes en el momento de la consulta, y su model card esta generada automaticamente por el Trainer de HuggingFace, con secciones sin completar. Resulta util como referencia para experimentos de ASR bilingue portugues-ingles en hardware modesto, pero no debe considerarse un modelo de produccion sin una evaluacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (declarado en la model card); el dataset de ajuste incluye portugues e ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con mecanismo de atencion estandar, disenado para procesar espectrogramas Mel de audio en ventanas de 30 segundos y generar la transcripcion de forma autorregresiva. La variante tiny es la de menor capacidad de la familia Whisper, con aproximadamente 37,7 millones de parametros.

El ajuste fino se realizo sobre el dataset naharte/portuguese_english. Segun la model card, se emplearon los siguientes hiperparametros: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 64, semilla 42, optimizador AdamW (variante fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y un total de 2000 pasos de entrenamiento. El entrenamiento se ejecuto con Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se documentan tecnicas adicionales como RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto).
- Ajuste especifico sobre un corpus bilingue portugues-ingles (dataset naharte/portuguese_english), aunque la model card solo declara el idioma ingles.
- Generacion de transcripciones en ventanas de audio de hasta 30 segundos, segun el diseno de Whisper.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio generativo ni modo de razonamiento extendido.
- Capacidades multilingues limitadas al par portugues-ingles segun el dataset de ajuste; no verificado para otros idiomas.

## Casos de uso

- Transcripcion de reuniones bilingues portugues-ingles en entornos con recursos limitados: el modelo puede procesar audio de hasta 30 segundos por ventana y generar transcripciones con un consumo de memoria muy bajo, adecuado para dispositivos embebidos o portatiles sin GPU dedicada.
- Subtitulado automatico de contenido audiovisual en portugues e ingles: util para generar subtitulos preliminares que luego se revisen manualmente, dado el WER de aproximadamente 15,8 % reportado por el autor.
- Prototipado rapido de pipelines ASR: al ser un modelo de 37,7 millones de parametros y 0,2 GB, permite iterar rapidamente en experimentos de reconocimiento de voz sin necesidad de infraestructura costosa.
- Preprocesamiento de audio en aplicaciones de analitica: transcripcion de llamadas o grabaciones para su posterior analisis de texto, en escenarios donde la precision no es critica y prima el coste computacional.
- Educacion y experimentacion academica: sirve como punto de partida para estudiar el ajuste fino de Whisper en pares de idiomas concretos, con hiperparametros documentados y reproducibles.
- Despliegue en el borde (edge computing): su tamano reducido permite ejecutarlo en dispositivos con poca memoria, como Raspberry Pi o moviles, para tareas de dictado o comandos de voz simples.
- Integracion en asistentes de voz locales: transcripcion en tiempo casi real de comandos cortos en portugues o ingles, con latencia baja gracias al reducido numero de parametros.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| naharte/portuguese_english | test | WER | 15,8062 |
| naharte/portuguese_english | validacion (paso 1000) | WER | 17,6328 |
| naharte/portuguese_english | validacion (paso 2000) | WER | 15,8062 |
| naharte/portuguese_english | validacion (paso 2000) | Loss | 0,2604 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision fp32 para los 37,7 millones de parametros; en la practica, el cuello de botella es el buffer de audio y las activaciones, no los pesos.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060, RTX 2060, RTX 3060, RTX 4090) es mas que suficiente; tambien puede ejecutarse en CPU con latencia aceptable para audio corto.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (pipeline de automatic-speech-recognition), y previsiblemente llama.cpp u otras herramientas compatibles con GGUF si se convierte el modelo, aunque no se documenta dicha conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| merkelmarrow/whisper-tiny-portuguese_english-ft1 | 37,7 M | 30 s (Whisper) | 15,81 (dataset propio) | apache-2.0 | HuggingFace |
| openai/whisper-tiny | 37,7 M | 30 s | no disponible en esta ficha | apache-2.0 | HuggingFace |
| openai/whisper-base | 74 M | 30 s | no disponible en esta ficha | apache-2.0 | HuggingFace |
| openai/whisper-small | 244 M | 30 s | no disponible en esta ficha | apache-2.0 | HuggingFace |

La comparacion directa de WER no es posible porque los modelos base de OpenAI no reportan resultados sobre el dataset naharte/portuguese_english. El modelo ajustado deberia superar a whisper-tiny original en ese corpus concreto, pero no se dispone de esa comparacion en la informacion proporcionada.

## Limitaciones y advertencias

- Model card generada automaticamente: las secciones de descripcion, usos previstos y datos de entrenamiento estan sin completar ("More information needed"), lo que limita la trazabilidad del ajuste.
- WER de aproximadamente 15,8 % en el conjunto de test: aceptable para prototipos, insuficiente para transcripcion de produccion sin revision humana.
- El modelo solo declara el idioma ingles en los metadatos, aunque el dataset de ajuste incluye portugues; el comportamiento real en portugues no esta verificado de forma independiente.
- Riesgo de alucinacion en audio con ruido, silencios prolongados o habla solapada, comun en modelos Whisper de tamano tiny.
- Sesgos desconocidos: no se documenta la composicion del dataset naharte/portuguese_english ni su representatividad demografica o dialectal.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios distintos al de entrenamiento.
- No apto para aplicaciones criticas (medicas, legales, accesibilidad) sin evaluacion adicional y supervision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/merkelmarrow/whisper-tiny-portuguese_english-ft1
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de ajuste: https://huggingface.co/datasets/naharte/portuguese_english
- Paper de Whisper (OpenAI): https://arxiv.org/abs/2212.04356
- Repositorio de Whisper en OpenAI: https://github.com/openai/whisper
