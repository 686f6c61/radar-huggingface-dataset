# juworld/whisper-large-v3-hil-st-lora

## Resumen

`juworld/whisper-large-v3-hil-st-lora` es un adaptador LoRA publicado en HuggingFace por el usuario juworld sobre el modelo de reconocimiento automatico del habla (ASR) `openai/whisper-large-v3`. Se distribuye como repositorio PEFT de aproximadamente 0,1 GB, con pesos en formato safetensors y entrenado con la libreria `peft` 0.21.2. El identificador del repositorio sugiere un ajuste fino orientado a transcripcion de voz en hiligaynon (codigo ISO 639-3 `hil`), aunque esa finalidad no se confirma en ninguna parte de la model card publicada.

El interes de esta ficha es limitado pero real: se trata de un ejemplo tipico de adaptador comunitario de bajo coste computacional para llevar Whisper large-v3 a una lengua de bajos recursos. El modelo base aporta la arquitectura encoder-decoder transformer de 1.550 millones de parametros, ventanas de audio de 30 segundos, decoder con 448 posiciones de contexto y capacidad multilingue amplia; el adaptador solo aporta el ajuste especifico del dominio o idioma.

La relevancia practica depende por completo de datos que el autor no ha publicado: no hay model card completada, no hay resultados de evaluacion, no se declara licencia, no se indica el conjunto de entrenamiento ni los hiperparametros. Cualquier evaluacion seria exige ejecutar el adaptador sobre el modelo base y medir WER de forma independiente antes de plantear un uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer encoder-decoder Whisper large-v3 |
| Parametros totales | Modelo base: 1.550 millones (Whisper large-v3). Numero de parametros del adaptador: no disponible (repo de 0,1 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Modelo base: ventanas de audio de 30 segundos y decoder con 448 posiciones de contexto. Valor especifico del adaptador: no disponible |
| Tipos de cuantizacion | Adaptador publicado en safetensors sin cuantizar; el modelo base admite fp16, int8 y cuantizaciones GGUF, pero no se documenta compatibilidad especifica con este adaptador |
| Idiomas soportados | Modelo base: 99 idiomas segun OpenAI. Idioma objetivo del adaptador: no disponible (el prefijo `hil` sugiere hiligaynon, sin confirmar) |
| Licencia | No disponible para el adaptador. Modelo base: Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se apoya en Whisper large-v3, un transformer encoder-decoder entrenado por OpenAI para transcripcion y traduccion de voz. El encoder consume espectrogramas mel de 128 canales calculados sobre fragmentos de 30 segundos; el decoder genera texto de forma autorregresiva con un contexto de 448 tokens. El modelo base incorpora tokens especiales de idioma y tarea que permiten transcribir o traducir al ingles sin cabeceras adicionales. Al ser un adaptador LoRA, el repositorio contiene matrices de bajo rango que se inyectan en capas concretas del modelo base y se cargan con `peft`, de modo que los pesos originales permanecen congelados.

No se dispone de informacion sobre el procedimiento de entrenamiento: la model card es la plantilla por defecto de HuggingFace con todos los apartados marcados como `[More Information Needed]`. Se desconoce el numero de horas de audio utilizadas, la composicion del dataset, si hubo aumento de datos, la tasa de aprendizaje, el rango LoRA, las capas objetivo o si se aplicaron tecnicas de regularizacion. Tampoco se documenta si el ajuste se hizo solo sobre el decoder, solo sobre el encoder o sobre ambos, ni si se aplico RLHF, DPO o algun otro ajuste posterior. La unica pista tecnica fiable es la version de PEFT declarada (0.21.2) y el tamano del repositorio (0,1 GB).

## Capacidades

- Transcripcion de voz a texto: hereda la funcionalidad ASR completa del modelo base, incluyendo marcas de tiempo a nivel de segmento y de palabra cuando el pipeline las solicita.
- Traduccion de voz al ingles: el modelo base incorpora la tarea `translate`; se desconoce si el adaptador conserva esta capacidad tras el ajuste.
- Deteccion automatica del idioma: Whisper large-v3 predice el idioma del audio de entrada; el ajuste fino puede haber sesgado esta prediccion hacia el idioma objetivo.
- Robustez ante ruido y acentos: caracteristica del modelo base, entrenado sobre un corpus a gran escala de audio debilmente etiquetado; no hay evaluacion especifica del adaptador.
- Procesamiento por lotes: al ser un adaptador PEFT se puede combinar con `transformers`, `faster-whisper` o `vLLM` en la medida en que esas herramientas soporten adaptadores LoRA sobre Whisper.
- Capacidades no aplicables: no es un modelo de texto generativo general, no soporta tool calling, no implementa agentes, no procesa imagenes ni audio mas alla de la ventana de 30 segundos por fragmento y no genera codigo.

## Casos de uso

- Transcripcion de entrevistas y testimonios en hiligaynon: el adaptador permitiria convertir grabaciones de campo en texto editable sin depender de servicios propietarios, siempre que una evaluacion propia confirme un WER aceptable.
- Subtitulado automatico de contenido audiovisual: la salida con marcas de tiempo de Whisper permite generar ficheros SRT directamente; el ajuste buscaria mejorar la precision en habla coloquial del idioma objetivo.
- Digitalizacion de archivo sonoro historico: grabaciones de radio o registros orales en lenguas filipinas de bajos recursos pueden transcribirse en local para su catalogacion y busqueda posterior.
- Atencion al cliente en centros de contacto: transcripcion de llamadas para control de calidad y analitica; requeriria integracion en tiempo real con `faster-whisper` o similar y validacion previa de latencia.
- Documentacion clinica o legal dictada: conversion de notas de voz a texto para su revision por profesionales; el modelo no sustituye la revision humana y su uso en entornos regulados exige trazabilidad y licencia clara.
- Generacion de datos de entrenamiento: uso del adaptador para pseudo-etiquetar grandes volumenes de audio en el idioma objetivo y alimentar despues modelos ASR mas pequenos o destilados.
- Accesibilidad: transcripcion en directo de conversaciones para personas con discapacidad auditiva en comunidades donde el hiligaynon es lengua vehicular.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion cumplimentada, no se reporta WER ni CER sobre ningun conjunto de test, y no hay comparaciones con el modelo base ni con alternativas. Tampoco se indica el conjunto de validacion utilizado durante el entrenamiento. Cualquier cifra de rendimiento deberia obtenerse replicando la evaluacion sobre un corpus propio del idioma objetivo.

## Requisitos de hardware

- El adaptador por si solo no es ejecutable: requiere cargar `openai/whisper-large-v3` completo (1.550 millones de parametros) junto con los pesos LoRA.
- VRAM estimada en fp16: en torno a 3-4 GB solo para los pesos del modelo base, y aproximadamente 8-12 GB con activaciones y procesamiento por lotes en PyTorch estandar, segun el tamano de lote y la longitud del audio.
- VRAM estimada en int8 con `faster-whisper` o CTranslate2: del orden de 2-3 GB, lo que facilita el despliegue en GPU de gama media.
- GPU recomendadas: A100, H100 o L40S para procesamiento por lotes a gran escala; RTX 4090, RTX 3090 o RTX A6000 para desarrollo y produccion de volumen medio.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080) siempre que se use cuantizacion int8 o lotes reducidos.
- Opciones de despliegue: `transformers` con `peft` para prototipado; `faster-whisper` o CTranslate2 para inferencia optimizada; `whisper.cpp`/`llama.cpp` solo si se convierte el modelo a GGUF, compatibilidad con el adaptador no confirmada; servidores tipo TGI o vLLM si soportan adaptadores LoRA sobre Whisper en la version utilizada.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor, ni tamano de lote, ni hardware de referencia.

## Comparativa con modelos similares

Datos del modelo base segun documentacion publica de OpenAI. El rendimiento del adaptador no esta documentado, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juworld/whisper-large-v3-hil-st-lora | Adaptador sobre 1.550 M | 30 s por ventana (heredado) | No disponible | No disponible | HuggingFace, 0 descargas |
| openai/whisper-large-v3 | 1.550 M | 30 s por ventana | 99 | Apache 2.0 | HuggingFace, ampliamente usado |
| openai/whisper-medium | 769 M | 30 s por ventana | 99 | Apache 2.0 | HuggingFace |
| openai/whisper-small | 244 M | 30 s por ventana | 99 | Apache 2.0 | HuggingFace |

La ventaja teorica del adaptador es un mejor rendimiento en el idioma objetivo a un coste de almacenamiento minimo (0,1 GB). La desventaja es la ausencia total de evaluacion publicada, que impide verificar esa mejora frente a Whisper large-v3 sin ajustar.

## Limitaciones y advertencias

- Model card vacia: todos los apartados relevantes (datos de entrenamiento, evaluacion, uso previsto, sesgos) estan sin cumplimentar, lo que impide auditar el modelo.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial; la licencia Apache 2.0 del modelo base no se hereda automaticamente al adaptador salvo que el autor lo indique.
- Sin evaluacion reproducible: no existe WER publicado, ni conjunto de test, ni comparacion con el modelo base, por lo que la mejora real es desconocida.
- Riesgo de alucinacion: Whisper tiende a inventar texto en silencios, musica o audio muy ruidoso, y puede repetir frases en bucle; este comportamiento se hereda y puede agravarse con un ajuste fino sobre datos limitados.
- Sesgo de dominio: si el ajuste se realizo sobre un corpus pequeno de un unico registro o variedad dialectal, el rendimiento puede degradarse fuera de ese dominio.
- Idioma objetivo no confirmado: el identificador sugiere hiligaynon, pero no hay documentacion que lo verifique ni que aclare si se conservan las capacidades multilingues del modelo base.
- Compatibilidad de despliegue no verificada: la integracion del adaptador con `whisper.cpp`, `Ollama` o `vLLM` no esta documentada y puede requerir conversion manual de pesos.
- Repositorio sin adopcion: cero descargas y cero valoraciones en el momento de redactar esta ficha, lo que reduce la probabilidad de encontrar soporte o correcciones de la comunidad.
- Sin informacion de hardware ni coste de entrenamiento: no se puede estimar la huella de carbono ni la reproducibilidad del ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juworld/whisper-large-v3-hil-st-lora
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Libreria PEFT: https://huggingface.co/docs/peft/index
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en GitHub: https://github.com/openai/whisper
- Paper citado en las etiquetas del repositorio (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact
