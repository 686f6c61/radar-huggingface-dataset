# s-ryoma/hollow-pine

## Resumen

Hollow-pine es un adaptador LoRA publicado por el usuario s-ryoma sobre el modelo base GSAI-ML/LLaDA-8B-Instruct, un modelo de difusion de lenguaje (diffusion language model) desarrollado por el grupo GSAI (Renmin University of China). El adaptador se distribuye en formato PEFT/safetensors con un tamano de repositorio de 3,2 GB, lo que sugiere pesos en precision alta del adaptador o artefactos auxiliares, y esta etiquetado para generacion de texto conversacional.

La relevancia de este artefacto radica en que aplica ajuste fino de bajo rango sobre un modelo de difusion de 8.000 millones de parametros en lugar de un transformer autorregresivo convencional, un paradigma aun poco explorado en la comunidad de adaptadores. Sin embargo, el repositorio presenta senales de escasa madurez: cero descargas, cero likes, acceso restringido (gated) y ausencia de documentacion publica sobre datos de entrenamiento, hiperparametros o evaluacion.

No se dispone de informacion sobre licencia, idiomas soportados ni resultados de benchmarks en la informacion proporcionada. Cualquier uso en produccion requiere solicitar acceso al autor y verificar de forma independiente las capacidades reales del adaptador sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelo base de difusion de lenguaje LLaDA-8B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el modelo base declara 8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no documentada aqui) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA), libreria transformers + peft |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA que se acopla al modelo GSAI-ML/LLaDA-8B-Instruct. LLaDA es un modelo de difusion de lenguaje a escala de 8.000 millones de parametros que genera texto mediante un proceso de denoising iterativo sobre tokens enmascarados, en lugar de la decodificacion autorregresiva token a token. El adaptador modifica un subconjunto de las matrices de proyeccion del modelo base mediante descomposicion de bajo rango, manteniendo congelados los pesos originales.

No se ha publicado informacion sobre el dataset de entrenamiento del adaptador, el numero de tokens utilizados, la composicion de los datos, el rango (rank) del LoRA, el alpha, la tasa de aprendizaje ni si se emplearon tecnicas de preferencia como RLHF o DPO. Tampoco hay documentacion sobre si el ajuste se realizo sobre la tarea de denoising completa o sobre un subconjunto de pasos de difusion. La ficha tecnica del autor no existe en la informacion disponible, lo que impide evaluar la calidad o el proposito del ajuste.

## Capacidades

- Generacion de texto conversacional (pipeline declarado: text-generation, con tag conversational).
- Herencia potencial de las capacidades del modelo base LLaDA-8B-Instruct, incluyendo generacion no autorregresiva y posible relleno de texto (infilling) por naturaleza del paradigma de difusion; no verificado para este adaptador.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre adaptadores en modelos de difusion: el adaptador permite estudiar como responde un modelo de difusion de 8B a un ajuste LoRA, comparando su comportamiento con el de adaptadores equivalentes sobre transformers autorregresivos. Adecuado por su tamano manejable y su base poco convencional.
- Experimentacion academica con PEFT: util para reproducir flujos de carga de adaptadores sobre LLaDA con la libreria peft, validando compatibilidad de versiones y serializacion de pesos.
- Prototipado de generacion de texto no autorregresiva: permite explorar aplicaciones donde el denoising iterativo aporta ventajas, como relleno de huecos o generacion condicionada por posiciones, aunque sin garantias documentadas.
- Evaluacion comparativa de calidad de ajuste: sirve como punto de partida para medir degradacion o mejora frente al modelo base en tareas conversacionales, siempre que se solicite acceso y se ejecuten evaluaciones propias.
- Base para fine-tuning adicional: al ser un adaptador LoRA, puede combinarse o continuarse con otros adaptadores, aunque la ausencia de documentacion exige precaucion con conflictos de rango y merges.
- Docencia y divulgacion: ejemplo practico de como se publica un adaptador PEFT sobre un modelo de difusion, util en talleres sobre ecosistema Hugging Face y modelos no autorregresivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el modelo base LLaDA-8B-Instruct requiere del orden de 16 GB en FP16 y aproximadamente 6-8 GB en cuantizacion de 4 bits, aunque estas cifras no estan confirmadas en la informacion proporcionada.
- GPU recomendadas: no disponible. Por tamano del modelo base, serian plausibles A100, H100 o RTX 4090, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: no confirmada; el modelo base de 8B podria caber en GPUs con 16-24 GB en cuantizacion, sin verificar para este adaptador.
- Opciones de despliegue: transformers + peft (declarado). Compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible, y en general los modelos de difusion de lenguaje tienen soporte limitado en estos motores.
- Latencia y throughput: no disponibles; los modelos de difusion requieren multiples pasos de denoising, lo que tipicamente incrementa la latencia frente a decodificacion autorregresiva, pero no hay mediciones para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| s-ryoma/hollow-pine (LoRA sobre LLaDA-8B-Instruct) | 8B (base) | no disponible | no disponible | Gated, 0 descargas | Adaptador sin documentacion |
| GSAI-ML/LLaDA-8B-Instruct | 8B | no disponible en esta ficha | no disponible | Publico en Hugging Face | Modelo base de difusion |
| Adaptadores LoRA sobre Llama 3.1 8B Instruct | 8B (base) | 128K (base) | Llama 3.1 Community License | Amplia disponibilidad | Ecosistema maduro y benchmarks publicos |
| Adaptadores LoRA sobre Qwen2.5 7B Instruct | 7B (base) | 32K-128K (base) | Apache 2.0 (segun variante) | Amplia disponibilidad | Alternativa autorregresiva con soporte de tooling |

La comparacion es estructural: no existen datos de rendimiento del adaptador que permitan contrastarlo numericamente con alternativas.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card sustantiva, datos de entrenamiento ni evaluacion, lo que impide validar el comportamiento del adaptador.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion y puede limitar la reproducibilidad.
- Licencia no disponible: no se puede confirmar el uso comercial ni las obligaciones de atribucion; ademas, la licencia del modelo base LLaDA debe verificarse por separado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluacion especifica no se puede cuantificar.
- Sesgos conocidos: no documentados; se heredarian los del modelo base y los del dataset de ajuste, desconocido.
- Limitaciones de contexto e idioma: no disponibles; no se puede asumir soporte multilingue ni una ventana concreta.
- Madurez: cero descargas y cero likes en el momento de la consulta, lo que sugiere un artefacto experimental sin validacion comunitaria.
- Compatibilidad de despliegue: el soporte de modelos de difusion de lenguaje en motores de inferencia populares es limitado; conviene probar con transformers + peft antes de asumir integracion con vLLM u otros.
- Fechas del repositorio: creado el 2025-12-31 y actualizado el 2026-11-25, lo que indica actividad reciente pero sin changelog publico.

## Enlaces

- Hugging Face: https://huggingface.co/s-ryoma/hollow-pine
- Modelo base: https://huggingface.co/GSAI-ML/LLaDA-8B-Instruct
