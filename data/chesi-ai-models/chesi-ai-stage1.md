# Chesi-AI-Models/Chesi-AI-stage1

## Resumen

Chesi AI Stage-1 es un modelo de lenguaje experimental de caracter-level con 13.639.680 parametros, desarrollado desde cero por el proyecto Chesi AI (澈思), un proyecto individual con una unica GPU (una RTX 4080 Laptop). No se trata de un modelo conversacional ni de un producto: es el primer hito de verificacion de una ruta de preentrenamiento from-scratch, cuyo objetivo es demostrar que la cadena completa de componentes propios —tokenizer propio, arquitectura propia y entrenador propio— converge de forma numericamente correcta y reproducible.

El modelo se entreno durante 20.000 pasos (batch 4, seq 512, lr 6e-4) en 26,1 minutos sobre corpus de razonamiento en ingles (OpenThoughts3-1.2M y SmallThoughts), alcanzando un eval loss de 1,5618 en una reevaluacion independiente de 32 bloques. La verificacion incluyo comparacion contra una implementacion de referencia independiente (diferencia relativa de 1,85e-07) y reproducibilidad bitwise con la misma semilla. Aunque carece de capacidad practica de generacion, su relevancia esta en la transparencia metodologica: publica pesos, tokenizer, historico de entrenamiento, curva de loss y criterios de aceptacion fallidos y superados. Sirve como linea base de investigacion y como ejemplo de documentacion reproducible para proyectos de preentrenamiento a pequena escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder a nivel de caracter (6 capas, d_model 384, 8 cabezas, seq 512, tied head) |
| Parametros totales | 13.639.680 |
| Parametros activos | no disponible (no se indica si es MoE; por configuracion aparente no lo es) |
| Longitud de contexto | 512 tokens (caracteres) |
| Tipos de cuantizacion | no disponible (solo pesos en precision original) |
| Idiomas soportados | Ingles (etiquetado tambien como zh, pero sin capacidad real de chino segun la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) y checkpoint PyTorch (ckpt_final.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder compacto de 6 capas con d_model 384, 8 cabezas de atencion y longitud de secuencia 512, con cabeza de salida emparejada (tied head) para reducir parametros. Utiliza un tokenizer propio de nivel caracter, entrenado desde cero (version v1.1), con vocabulario de 7.276 entradas en la variante Stage-1 (la version completa llega a 11.387). Los tokens especiales son `<pad>`=0, `<unk>`=1, `<bos>`=2 y `<eos>`=3, con los ids de caracteres empezando en 4 ordenados por frecuencia ascendente. El vocabulario total del modelo es de 7.280 entradas.

El entrenamiento se realizo con PyTorch 2.5.1 durante 20.000 pasos con batch 4, secuencia 512 y learning rate 6e-4, completandose en 26,1 minutos a 13 pasos por segundo en una RTX 4080 Laptop. El framework incluye una cadena de deteccion de dispositivo `cuda → npu → xpu → musa → cpu`. Los datos de entrenamiento proceden exclusivamente de corpus de razonamiento en ingles con licencia Apache-2.0: OpenThoughts3-1.2M (1.200.000 lineas) y SmallThoughts (102.000 lineas). No se aplicaron tecnicas de RLHF ni DPO en esta etapa; el roadmap del proyecto las reserva para etapas posteriores (Stage-4). Como criterio de aceptacion, se verifico que la diferencia relativa frente a una implementacion de referencia naive independiente fuese inferior al 15% (resultado: 1,85e-07) y que dos ejecuciones con la misma semilla fuesen bitwise identicas.

## Capacidades

- Generacion de texto a nivel de caracter en ingles, sin calidad practica de uso dada la escala de 13,6M de parametros.
- Modelado de lenguaje basico sobre corpus de razonamiento (OpenThoughts3 y SmallThoughts), sin capacidad de razonamiento real demostrada a esta escala.
- Sin capacidad de dialogo ni de seguimiento de instrucciones: es un LM puro, no un chat model.
- Sin capacidades de vision, audio ni multimodalidad.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agentes ni razonamiento multi-paso.
- Sin capacidad de chino: el corpus de entrenamiento es ingles, y el corpus chino base esta reservado para Stage-2.
- Valor principal como artefacto de investigacion: reproducibilidad bitwise, verificacion numerica contra referencia independiente y logs de entrenamiento completos publicados.

## Casos de uso

- Verificacion de pipelines de preentrenamiento from-scratch: sirve como modelo de referencia para validar que un framework de entrenamiento propio (tokenizer, trainer, bucle de optimizacion) es numericamente correcto antes de escalar a modelos mayores.
- Docencia y aprendizaje sobre LLMs: su tamano (13,6M) permite entrenarlo, inspeccionarlo y ejecutarlo en hardware de consumo, ideal para cursos o tutoriales sobre como funciona un transformer a nivel de caracter.
- Reproduccion de experimentos academicos: al publicarse con historico de loss, semillas, criterios de aceptacion y guia de reproduccion, es util como caso de estudio de metodologia experimental reproducible.
- Pruebas de infraestructura de inferencia: al ser tan ligero, sirve para testear servidores de inferencia, cuantizaciones o pipelines de despliegue sin coste computacional significativo.
- Baseline para comparativas de tokenizadores: permite comparar el comportamiento de un tokenizer de caracter-level propio frente a tokenizadores BPE estandar en terminos de eficiencia de secuencia.
- Punto de partida para fine-tuning educativo: puede usarse como base para practicas de fine-tuning a muy pequena escala, aunque los resultados no tendran calidad de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento publicados son metricas de entrenamiento y verificacion interna:

| Metrica | Valor |
|---|---|
| Eval loss (reevaluacion independiente, 32 bloques) | 1,5618 |
| Eval loss (fin de entrenamiento, step 20.000) | 1,3694 |
| Criterio eval loss < 1,8 | Superado |
| Criterio de convergencia estricto (ventana a ventana no creciente) | Fallido (+0,16%, dentro del suelo de ruido de convergencia) |
| Criterio de convergencia por tendencia (primer/ultimo ventana) | Superado (2,6436 → 1,3732, -48,1%) |
| Diferencia relativa vs. referencia independiente | 1,85e-07 (criterio < 15%) |
| Reproducibilidad bitwise (misma semilla) | Superado |

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; con 13,6M de parametros en precision original el modelo ocupa del orden de 55 MB, por lo que cualquier GPU moderna o incluso CPU es suficiente.
- GPU recomendadas: no se requieren GPU dedicadas para inferencia. Para reentrenamiento, el autor empleo una RTX 4080 Laptop (26,1 minutos para 20.000 pasos a 13 pasos/segundo).
- Consumer GPU: cabe con holgura en cualquier GPU de consumo actual, incluidas integradas.
- Opciones de despliegue: no hay integracion documentada con vLLM, llama.cpp, Ollama o TGI. El uso requiere cargar el checkpoint manualmente con PyTorch y el tokenizer propio incluido en el repositorio (`chesi_tokenizer.py`, `tokenizer.json`).
- Latencia y throughput: no disponible; dada la escala, la inferencia por caracteres en CPU deberia ser inmediata, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Enfoque |
|---|---|---|---|---|---|
| Chesi AI Stage-1 | 13,6M | 512 caracteres | Caracter-level, from-scratch | Apache-2.0 | Verificacion de pipeline de preentrenamiento propio |
| TinyLlama 1.1B | 1.100M | 2.048 tokens | BPE, transformer decoder | Apache-2.0 | Modelo compacto con capacidad real de generacion |
| GPT-2 (124M) | 124M | 1.024 tokens | BPE, transformer decoder | Licencia modificada MIT/OpenAI | Baseline historico de LM a pequena escala |
| SmolLM2-135M | 135M | 2.048 tokens | BPE, transformer decoder | Apache-2.0 | LM compacto entrenado con corpus publico, con capacidad practica |

En terminos de capacidad practica, Chesi AI Stage-1 queda muy por debajo de cualquiera de estas alternativas: es un experimento de verificacion, no un modelo de uso general. Su valor diferencial es la transparencia total del proceso de entrenamiento y verificacion.

## Limitaciones y advertencias

- Sin capacidad de chino: aunque el repositorio esta etiquetado con idioma `zh`, la model card indica explicitamente que el corpus de entrenamiento es ingles y que el chino llegara en Stage-2.
- Sin seguimiento de instrucciones ni capacidad de dialogo: es un LM puro, no un chat model, y no tiene alineacion ni personalidad definida.
- Calidad de generacion practicamente inutil: con 13,6M de parametros y entrenamiento de 26 minutos, el modelo solo demuestra convergencia y correccion numerica, no utilidad.
- Nivel de caracter: la generacion por caracteres es ineficiente en numero de tokens por unidad de texto frente a tokenizadores BPE, lo que penaliza la velocidad efectiva de generacion.
- Criterio de convergencia estricto fallido: el criterio de ventana no creciente no se supero (+0,16%), aunque el autor lo atribuye al suelo de ruido de convergencia; conviene tenerlo en cuenta al evaluar la estabilidad del entrenamiento.
- Riesgo de alucinacion y sesgos: no evaluado; al tratarse de un modelo sin alinear entrenado sobre corpus de razonamiento sintetico, cualquier salida debe considerarse no fiable.
- Uso comercial: la licencia Apache-2.0 lo permite, pero la propia model card desaconseja tratarlo como producto.
- Datos de entrenamiento sinteticos: el corpus (OpenThoughts3, SmallThoughts) procede de razonamiento generado por modelos externos, algo que el propio proyecto prohibira en etapas futuras (principio de "distillation ban" a partir de Stage-2).

## Enlaces

- Hugging Face: https://huggingface.co/Chesi-AI-Models/Chesi-AI-stage1
- Repositorio GitHub del proyecto: https://github.com/Chesi-AI-Models/Chesi-AI
- Guia de reproduccion: https://github.com/Chesi-AI-Models/Chesi-AI/blob/main/docs/REPRODUCE.md
- Registro de corpus (corpus ledger): https://github.com/Chesi-AI-Models/Chesi-AI/blob/main/docs/CORPUS_LEDGER.md
- Dataset OpenThoughts3-1.2M: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Dataset SmallThoughts: https://huggingface.co/datasets/SmallDoge/SmallThoughts
- Soporte y progreso del proyecto: https://ko-fi.com/chesiai
