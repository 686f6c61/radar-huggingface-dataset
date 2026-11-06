# jtap123/whisper-tiny_korean_english

## Resumen

Whisper tiny korean_english es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario jtap123 en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) derivado de la arquitectura Whisper de OpenAI, en su variante mas pequena, y entrenado sobre el dataset korean_english_english. El modelo esta pensado para transcribir audio, presumiblemente en un contexto bilingue coreano-ingles segun sugiere el nombre, aunque la model card solo declara oficialmente el idioma ingles.

La relevancia de este modelo es limitada: se trata de un experimento de fine-tuning con 0 descargas y 0 likes en el momento de la consulta, sin documentacion sustantiva (la model card indica "More information needed" en las secciones de descripcion, usos previstos y datos de entrenamiento). Su interes practico radica en servir como ejemplo de ajuste de Whisper tiny sobre un dataset especifico y en su bajo coste computacional, dado que apenas cuenta con 37,7 millones de parametros.

Con una licencia Apache 2.0 y un tamano de repositorio de 0,3 GB, el modelo puede ejecutarse en hardware muy modesto, incluso en CPU, lo que lo hace adecuado para prototipado rapido o experimentacion, pero no para entornos de produccion con requisitos de precision exigentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (declarado oficialmente); el nombre sugiere coreano-ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper en su variante tiny: un transformer encoder-decoder disenado para reconocimiento automatico del habla, que procesa espectrogramas de audio de entrada y genera tokens de texto. Whisper tiny es la version mas pequena de la familia, con aproximadamente 39 millones de parametros en su forma original; el ajuste fino conserva esa estructura.

El entrenamiento se realizo con el framework Transformers (version 5.23.0.dev0) y PyTorch 2.11.0+cu130, partiendo de openai/whisper-tiny. Los hiperparametros documentados son: learning rate de 1e-05, batch size de entrenamiento de 2, batch size de evaluacion de 1, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y un total de 2000 pasos de entrenamiento. No se documenta el numero de tokens de audio ni la composicion detallada del dataset korean_english_english, ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en ASR). No se declaran innovaciones tecnicas adicionales.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto).
- Entrenado especificamente sobre el dataset korean_english_english, lo que sugiere un dominio acotado.
- Soporte declarado del idioma ingles; el nombre del modelo indica posible manejo de coreano, pero no esta confirmado en la documentacion.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio generativo ni modo thinking.
- Capacidad multilingue: no confirmada oficialmente; solo "en" figura en los metadatos de idioma.

## Casos de uso

- Prototipado de transcripcion en ingles: el modelo puede transcribir audios cortos en ingles con un coste computacional minimo, adecuado para validar pipelines de ASR antes de invertir en modelos mayores.
- Experimentacion academica con fine-tuning de Whisper: sirve como referencia de como ajustar la variante tiny sobre un dataset propio, dado que la model card documenta los hiperparametros y las curvas de entrenamiento.
- Pruebas de concepto bilingues coreano-ingles: aunque no confirmado oficialmente, el nombre sugiere que puede emplearse para explorar transcripcion en contextos donde se mezclan ambos idiomas, siempre con validacion previa.
- Despliegue en dispositivos con recursos limitados: con 37,7 millones de parametros, puede ejecutarse en CPU o en GPUs de gama baja para tareas de transcripcion no criticas.
- Generacion de subtitulos en entornos de bajo presupuesto: util para prototipos de subtitulado automatico donde la precision no sea el factor determinante.
- Evaluacion comparativa de modelos ASR: sirve como baseline de bajo coste frente a variantes mayores de Whisper en experimentos de investigacion.

## Benchmarks y rendimiento

Los datos siguientes son los declarados por el autor del modelo en su model-index (no verificados de forma independiente):

| Benchmark | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | korean_english English (split test) | WER | 9,7317 |

Resultados de validacion durante el entrenamiento (segun la model card):

| Training Loss | Epoch | Step | Validation Loss | WER |
|---|---|---|---|---|
| 0,1603 | 1,0173 | 1000 | 0,2015 | 9,7561 |
| 0,0689 | 2,0346 | 2000 | 0,1872 | 9,7317 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (37,7 millones de parametros); puede ejecutarse en CPU sin problemas.
- GPU recomendadas: cualquier GPU consumer moderna es sobradamente suficiente; tambien funciona en CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.) e incluso en dispositivos embebidos con suficiente memoria.
- Opciones de despliegue: transformers (libreria nativa), potencialmente ONNX Runtime o CTranslate2 para optimizacion; no se documenta compatibilidad explicita con vLLM, llama.cpp, Ollama o TGI (estas herramientas estan orientadas a modelos de lenguaje, no a ASR).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja en GPU y aceptable en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (dataset) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jtap123/whisper-tiny_korean_english | 37,7 M | no disponible | 9,73 (korean_english English) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | ~39 M | ventanas de 30 s de audio | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-base | ~74 M | ventanas de 30 s de audio | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-small | ~244 M | ventanas de 30 s de audio | no disponible en esta ficha | apache-2.0 | Hugging Face |

La comparacion directa de WER no es posible porque los modelos originales de OpenAI no declaran resultados sobre el dataset korean_english_english. El ajuste fino parte de whisper-tiny, por lo que su rendimiento en ingles general deberia ser similar o ligeramente inferior al original, salvo en el dominio especifico del dataset de entrenamiento.

## Limitaciones y advertencias

- Documentacion muy escasa: la model card indica "More information needed" en descripcion, usos previstos y datos de entrenamiento.
- El WER de 9,73 no esta verificado de forma independiente (verified: false) y corresponde a un dataset privado o poco conocido (korean_english_english), lo que dificulta la comparacion.
- El idioma oficialmente declarado es solo "en"; el posible soporte de coreano no esta confirmado y debe validarse empiricamente.
- Riesgo de alucinacion en la transcripcion: como todo modelo ASR, puede generar texto plausible pero incorrecto en segmentos de audio ruidosos o con acentos no representados en el entrenamiento.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos demograficos, de acento o de dominio.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre el dataset de entrenamiento impide verificar la procedencia y los derechos de los datos de audio utilizados.
- Con 0 descargas y 0 likes, no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- No apto para produccion sin una evaluacion exhaustiva previa en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jtap123/whisper-tiny_korean_english
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Whisper de OpenAI (referencia de la arquitectura): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
