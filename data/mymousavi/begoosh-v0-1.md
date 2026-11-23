# Mymousavi/Begoosh-v0.1

## Resumen

Begoosh v0.1 es un adaptador LoRA experimental para el modelo base Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario Mymousavi y publicado en Hugging Face. Su objetivo declarado es actuar como asistente conversacional en persa (farsi), un idioma con representacion limitada en los grandes modelos abiertos. El adaptador se ha entrenado mediante QLoRA de 4 bits con la libreria PEFT sobre un conjunto de instrucciones en persa de elaboracion manual que contiene unicamente 24 ejemplos.

Se trata, por tanto, de una prueba de concepto y no de un modelo de proposito general. El autor lo describe explicitamente como prototipo experimental y advierte de que el reducido tamano del dataset no permite establecer una competencia amplia en persa. El repositorio ocupa aproximadamente 0,1 GB y contiene solo los pesos del adaptador, no el modelo completo, por lo que su uso requiere descargar e instanciar el modelo base Qwen2.5-1.5B-Instruct.

La relevancia de esta ficha es fundamentalmente documental: sirve para ilustrar el flujo de trabajo de ajuste fino ligero (QLoRA sobre PEFT) aplicado a un modelo pequeno de 1,5 mil millones de parametros, y para dejar constancia de sus limitaciones antes de que cualquier desarrollador lo considere para un uso real. No hay informacion publicada sobre licencia, idiomas soportados mas alla del persa ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parametros totales | ~1,5 mil millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; heredada del modelo base Qwen2.5-1.5B-Instruct (32 768 tokens segun especificaciones de Qwen, no confirmado para este adaptador) |
| Tipos de cuantizacion | Entrenamiento en QLoRA 4 bits; cuantizaciones de inferencia del adaptador no especificadas |
| Idiomas soportados | Persa (objetivo declarado); resto no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con PEFT sobre Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,5 mil millones de parametros. El entrenamiento empleo QLoRA en 4 bits, tecnica que congela los pesos del modelo base cuantizados a 4 bits y entrena unicamente matrices de bajo rango insertadas en las capas de atencion y/o feed-forward. El repositorio solo contiene los pesos del adaptador (formato safetensors), no una copia del modelo base.

El dataset de entrenamiento consistio en 24 ejemplos de instrucciones en persa curados manualmente. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del corpus, la configuracion de hiperparametros (rango LoRA, alpha, tasa de aprendizaje, epocas) ni si se aplicaron etapas de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del propio ajuste QLoRA. Con 24 ejemplos, el ajuste es de magnitud demasiado pequena para producir un cambio sustancial en el comportamiento del modelo base; el resultado esperable es un sesgo de estilo o formato hacia las respuestas en persa, no una adquisicion de conocimiento linguistico nuevo.

## Capacidades

- Generacion de texto y conversacion en persa, limitada al estilo y contenido de los 24 ejemplos de entrenamiento.
- Herencia parcial de las capacidades del modelo base Qwen2.5-1.5B-Instruct: generacion de texto, respuesta a instrucciones y razonamiento basico, aunque el adaptador puede degradar el rendimiento original en tareas no relacionadas con el dataset de ajuste.
- Soporte de tool calling y function calling: no confirmado para el adaptador; el modelo base Qwen2.5-Instruct lo soporta, pero el ajuste LoRA puede alterar este comportamiento.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni verificadas.
- Capacidades multilingues: el autor solo declara persa; el comportamiento en otros idiomas no esta evaluado.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Prueba de concepto de ajuste QLoRA en persa: util para desarrolladores que quieran replicar el pipeline (PEFT + QLoRA 4 bits sobre Qwen2.5-1.5B) y evaluar como responde un adaptador entrenado con un dataset minimo.
- Experimentacion academica sobre datos escasos: sirve como caso de estudio de los limites del ajuste fino con 24 ejemplos y de la diferencia entre especializacion de estilo y adquisicion de competencia linguistica.
- Generacion de respuestas cortas en persa para demos internas: en entornos controlados y sin requisitos de precision, puede producir texto en persa con el formato aprendido del dataset.
- Base para ampliar el dataset: el adaptador puede servir como punto de partida para un ciclo iterativo en el que se amplien los ejemplos y se reentrene, comparando resultados.
- Evaluacion comparativa de adaptadores: util como referencia negativa o linea base en estudios sobre el efecto del tamano del dataset en el rendimiento de LoRA.
- Prototipado de asistentes conversacionales de bajo coste: al requerir solo 1,5B de parametros y un adaptador de 0,1 GB, puede desplegarse en hardware modesto para pruebas de interfaz y flujo conversacional, no para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,5B en FP16 requiere aproximadamente 3 GB de VRAM; en cuantizacion 4 bits, alrededor de 1-1,5 GB. El adaptador anade una cantidad marginal (repo de 0,1 GB). Estas cifras son estimaciones basadas en el tamano del modelo base, no datos publicados para este adaptador.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (por ejemplo, RTX 3050, RTX 4060, GTX 1660 Super en adelante) es suficiente para inferencia en cuantizacion baja; A100 o H100 no son necesarias.
- Cabe en GPU consumer: si, en la mayoria de GPU consumer modernas con al menos 4 GB de VRAM.
- Opciones de despliegue: carga mediante la libreria PEFT junto con el modelo base (segun indica el autor); el modelo base es compatible con vLLM, TGI, llama.cpp y Ollama, aunque la integracion del adaptador LoRA depende de que el runtime soporte PEFT (vLLM y TGI lo hacen; llama.cpp requiere conversion del adaptador a GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Begoosh v0.1 | ~1,5B (base) + adaptador LoRA | no disponible | no disponible | Hugging Face, 0 descargas | Adaptador experimental con 24 ejemplos |
| Qwen2.5-1.5B-Instruct | 1,5B | 32 768 tokens | Apache 2.0 (segun Qwen) | Hugging Face, ampliamente usado | Modelo base, capacidades multilingues y tool calling |
| Otros adaptadores persas sobre Qwen | variable | variable | variable | Hugging Face | No se dispone de datos comparativos verificados |

La comparacion directa con otros adaptadores persas no es posible con la informacion disponible; no se han identificado alternativas documentadas en la busqueda realizada.

## Limitaciones y advertencias

- Dataset de entrenamiento de solo 24 ejemplos: insuficiente para establecer competencia general en persa, tal como advierte el propio autor.
- Prototipo experimental: no apto para produccion ni para uso como asistente de proposito general.
- Riesgo elevado de alucinacion y de respuestas incoherentes fuera del dominio de los ejemplos de entrenamiento.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; debe consultarse al autor antes de cualquier uso en produccion. Ademas, la licencia del adaptador no puede ser mas permisiva que la del modelo base Qwen2.5-1.5B-Instruct.
- Idiomas: solo se declara persa; el comportamiento en castellano, ingles u otros idiomas no esta evaluado y puede degradarse respecto al modelo base.
- Sin benchmarks ni evaluacion cuantitativa publicada: no hay evidencia de mejora medible sobre el modelo base.
- Sin documentacion de hiperparametros de entrenamiento: dificulta la reproducibilidad.
- El adaptador puede degradar capacidades del modelo base (tool calling, razonamiento) al haberse ajustado sobre un corpus muy especifico.

## Enlaces

- Hugging Face: https://huggingface.co/Mymousavi/Begoosh-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Fuente persa citada por el autor: https://dehkadeai.ir/
- Libreria PEFT: https://github.com/huggingface/peft
