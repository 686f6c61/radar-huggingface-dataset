# PxALabs/whisper-indian-lora

## Resumen

whisper-indian-lora es un adaptador LoRA (PEFT) sobre el modelo de reconocimiento automatico del habla openai/whisper-medium, desarrollado por PxA Labs (Purvansh Joshi y Archit Mittal) dentro del proyecto IndiVoice-DeepASR. Su objetivo es corregir la perdida de precision que los sistemas ASR comerciales experimentan con el ingles hablado con acento indio, un dominio poco representado en los datos de entrenamiento originales de Whisper.

El adaptador se entrena sobre el conjunto de datos ai4bharat/Svarah (dataset con control de acceso) y se distribuye como un complemento ligero que se carga sobre los pesos base de Whisper Medium, lo que permite entrenarlo en GPUs gratuitas de Kaggle y Colab y desplegarlo sin duplicar el modelo completo. El repositorio ocupa aproximadamente 0,6 GB e incluye los pesos del adaptador en safetensors, los ficheros del procesador y el estado completo del entrenador.

Es relevante para equipos que ya usan Whisper Medium en produccion y necesitan mejorar la transcripcion de hablantes de ingles indio sin reentrenar el modelo desde cero, manteniendo la licencia Apache 2.0 del modelo base y del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer encoder-decoder (Whisper Medium) |
| Parametros totales | No disponible (adaptador LoRA de rango 16 sobre q_proj y v_proj; el modelo base Whisper Medium tiene 769 M de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper Medium procesa ventanas de audio de 30 segundos por defecto) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en precision de entrenamiento; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | Ingles (con acentos indios) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango 16, alpha 32 y dropout 0,05 sobre las proyecciones q_proj y v_proj del mecanismo de atencion de Whisper Medium. No modifica la arquitectura encoder-decoder del modelo base ni anade parametros fuera de los modulos LoRA, de modo que la inferencia requiere cargar primero openai/whisper-medium y superponer el adaptador mediante PeftModel.

El entrenamiento se realizo durante 2.000 pasos con tasa de aprendizaje 1e-4 (esquema lineal, 50 pasos de calentamiento), tamano de lote efectivo 32 (8 por dispositivo en 2 GPUs con 2 pasos de acumulacion), precision mixta y semilla 42. Los datos provienen de un unico manifiesto de Svarah, dividido aleatoriamente 90/10 para entrenamiento y validacion. Las versiones de framework empleadas fueron PEFT 0.18.1, Transformers 4.57.6, PyTorch 2.10.0+cu128, Datasets 4.8.3 y Tokenizers 0.22.2.

## Capacidades

- Transcripcion de voz a texto en ingles con acentos indios, mediante la tarea `transcribe` de Whisper.
- Reconocimiento de habla con ventanas de audio de 30 segundos (caracteristica heredada de Whisper Medium).
- Deteccion de idioma y tarea mediante los tokens de control de Whisper (`language="en"`, `task="transcribe"`).
- Integracion con el ecosistema Transformers y PEFT: carga mediante `PeftModel.from_pretrained` sobre el modelo base.
- Capacidad de reanudar el entrenamiento gracias al estado completo del entrenador incluido en `last-checkpoint/`.
- No soporta traduccion a otros idiomas como objetivo especifico del adaptador, ni vision, ni tool calling, ni razonamiento multi-paso (no son capacidades de un modelo ASR).

## Casos de uso

- Transcripcion de reuniones y llamadas con hablantes de ingles indio: el adaptador se carga sobre Whisper Medium y se usa con el pipeline de ASR estandar para reducir errores en acentos indios en entornos corporativos con equipos distribuidos.
- Subtitulado de contenido audiovisual para audiencias indias: se procesan pistas de audio de hasta 30 segundos por ventana y se genera texto que puede alimentar un pipeline de subtitulos.
- Atencion al cliente en centros de contacto con agentes o clientes de acento indio: se integra en un servicio de transcripcion en tiempo casi real sobre Whisper Medium, manteniendo la latencia del modelo base.
- Generacion de actas y notas de reuniones: el texto transcrito se pasa a un LLM posterior para resumen; el adaptador mejora la calidad de la transcripcion previa.
- Investigacion en ASR con acentos: sirve como punto de partida para experimentos de adaptacion con LoRA sobre Svarah, reutilizando el estado del entrenador incluido en el repositorio.
- Prototipado en GPUs gratuitas: al ser un adaptador ligero, permite experimentar en Kaggle o Colab sin necesidad de infraestructura dedicada para reentrenar el modelo completo.
- Evaluacion comparativa de adaptadores: util para medir el impacto de LoRA en WER sobre un subconjunto de Svarah frente al modelo base, siempre que se ejecute la evaluacion con el mismo protocolo.

## Benchmarks y rendimiento

Resultados de WER (%) y perdida de validacion registrados durante el entrenamiento sobre el 10% de validacion (split aleatorio de un manifiesto de Svarah):

| Paso | 200 | 400 | 600 | 800 | 1000 | 1200 | 1400 | 1600 | 1800 | 2000 |
|:--|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| Perdida de validacion | 0,270 | 0,227 | 0,196 | 0,170 | 0,150 | 0,132 | 0,119 | 0,107 | 0,100 | 0,097 |
| WER | 22,95 | 25,87 | 27,98 | 22,57 | **19,29** | 32,99 | 25,84 | 27,21 | 26,74 | 27,28 |

El WER final (paso 2000) es 27,28; el minimo registrado es 19,29 en el paso 1000. El autor advierte de que la perdida de validacion baja de forma monotona mientras el WER fluctua, que el split es aleatorio sobre enunciados (los mismos hablantes pueden aparecer en entrenamiento y validacion) y que no se ha reportado el resultado del modelo base Whisper Medium sobre el mismo split, por lo que estos numeros no son comparables con el protocolo oficial de Svarah.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade un coste minimo; el modelo base Whisper Medium en fp16 requiere aproximadamente 1,5-2 GB de VRAM, y en fp32 alrededor de 3 GB. El adaptador en si ocupa una fraccion de GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Whisper Medium en fp16; el entrenamiento del adaptador se realizo en 2 GPUs (el autor cita Kaggle y Colab, tipicamente T4 o P100).
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o mas, usando el modelo base en fp16.
- Opciones de despliegue: Transformers + PEFT (metodo documentado en la model card), y opcionalmente vLLM o TGI para Whisper Medium si se fusiona el adaptador con el modelo base; llama.cpp/Ollama no estan documentados para este adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PxALabs/whisper-indian-lora | Adaptador LoRA sobre Whisper Medium (769 M) | Ventanas de 30 s (heredado) | Ingles (acento indio) | Apache 2.0 | Hugging Face (17 descargas) |
| openai/whisper-medium | 769 M | Ventanas de 30 s | Multilingue | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3 | 1,55 mil millones | Ventanas de 30 s | Multilingue | Apache 2.0 | Hugging Face |
| ai4bharat indicwhisper | No disponible en la informacion | No disponible | Indio (multiples idiomas) | No disponible | Hugging Face |

No se dispone de resultados de benchmarks comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado unicamente con ingles de acento indio; no esta pensado para hindi ni otras lenguas indias.
- No se ha evaluado la equidad entre acentos individuales, generos ni condiciones de grabacion.
- El WER de validacion es ruidoso y el mejor valor (19,29) no corresponde al checkpoint final (27,28); conviene evaluar el checkpoint adecuado en datos propios.
- El split aleatorio sobre enunciados permite fuga de hablantes entre entrenamiento y validacion, por lo que el WER real sobre hablantes nuevos sera probablemente superior.
- No se ha publicado el resultado del modelo base sobre el mismo split, lo que impide medir la mejora real del adaptador.
- No es comparable con el protocolo oficial de evaluacion de Svarah.
- Riesgo de alucinacion de texto en segmentos de audio con ruido o silencios, inherente a los modelos Whisper.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y cumplir las condiciones del modelo base openai/whisper-medium.
- El dataset Svarah es de acceso controlado (gated); su uso esta sujeto a las condiciones del dataset.
- Requiere cargar el modelo base ademas del adaptador; no es un modelo autonomo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PxALabs/whisper-indian-lora
- Modelo base: https://huggingface.co/openai/whisper-medium
- Repositorio del proyecto: https://github.com/PxA-Labs/IndiVoice-DeepASR
- Dataset Svarah: https://huggingface.co/datasets/ai4bharat/Svarah
- Organizacion PxA Labs: https://huggingface.co/PxALabs
