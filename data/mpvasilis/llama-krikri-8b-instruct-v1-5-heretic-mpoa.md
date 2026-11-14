# mpvasilis/Llama-Krikri-8B-Instruct-v1.5-Heretic-MPOA

## Resumen
Llama-Krikri-8B-Instruct-v1.5-Heretic-MPOA es una variante "abliterated" (es decir, con la direccion de rechazo atenuada o eliminada) del modelo Llama-Krikri-8B-Instruct-v1.5 desarrollado por ILSP (Instituto de Lenguaje y Procesamiento del Habla, Grecia). La modificacion la prepara el usuario mpvasilis mediante una ejecucion clasica de MPOA en la herramienta Heretic 2.1.0, con calibracion de fuerza de adaptador a 2x, y se publica como modelo fusionado en BF16 junto con el adaptador PEFT compacto.

El modelo base es un transformer decoder-only tipo Llama 3.1 de 8.202.227.712 parametros, afinado para conversacion en griego e ingles. Esta derivacion conserva la licencia Llama 3.1 del original y esta pensada para quienes necesitan un modelo griego-ingles con menor tendencia a rechazar peticiones, manteniendo el grueso de las capacidades del base.

Es relevante ahora porque los modelos abliterated permiten controlar el comportamiento de rechazo sin reentrenamiento completo, y este caso documenta con mediciones pareadas (MMLU en ingles, Belebele en griego e ingles) el coste real de la intervencion: perdidas de entre 1 y 4 puntos porcentuales segun el diagnostico. El repositorio ocupa 16,4 GB e incluye pesos safetensors listos para transformers.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), derivado mediante MPOA/Heretic 2.1.0 |
| Parametros totales | 8.202.227.712 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card (pesos publicados en BF16; el ecosistema Llama admite GGUF/AWQ via herramientas externas) |
| Idiomas soportados | griego (el), ingles (en) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (modelo fusionado BF16) y adaptador PEFT |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Llama 3.1 en configuracion de 8B (transformer decoder-only con atencion por grupos de consultas, RoPE y normalizacion RMSNorm), heredada de ilsp/Llama-Krikri-8B-Instruct-v1.5 (revision 326e2c0ea90d771c19fcf06225fe87dc922b51b2). El modelo base fue desarrollado por ILSP para conversacion en griego e ingles; no se dispone en la informacion proporcionada del volumen de tokens, composicion del dataset ni si hubo RLHF o DPO en el entrenamiento original.

La innovacion de esta ficha es la intervencion MPOA ejecutada con Heretic 2.1.0: se calcula una direccion de rechazo y se aplica mediante un adaptador PEFT calibrado a 2x de fuerza, que despues se fusiona en BF16 con `merge_and_unload(safe_merge=True)`. El adaptador en vivo usa tensores F32 sobre una base BF16, mientras que el checkpoint fusionado almacena BF16, por lo que el redondeo de la fusion puede alterar las salidas. No hay datos publicados sobre decodificacion especulativa ni atencion lineal en esta derivacion.

## Capacidades
- Generacion de texto conversacional en griego e ingles con plantilla de chat propia (`apply_chat_template`).
- Redaccion, resumen y explicacion de conceptos en ambos idiomas soportados.
- Respuesta a preguntas de opcion multiple en formato restringido A/B/C/D (empleado en la evaluacion MMLU y Belebele).
- Comprension lectora multilingue evaluada con Belebele en griego e ingles.
- Menor tendencia al rechazo que el base gracias a la abliteration, lo que amplia el rango de peticiones que atiende.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, vision, audio ni modo thinking explicito.

## Casos de uso
- Atencion al cliente en griego: el modelo gestiona conversaciones multi-turno mediante su plantilla de chat y responde en griego nativo, adecuado para empresas que operan en Grecia y necesitan un modelo de 8B desplegable en una sola GPU.
- Generacion de contenido editorial bilingue: redaccion de articulos, resumenes y notas en griego e ingles con un unico checkpoint, evitando mantener dos modelos separados.
- Evaluacion academica de abliteration: investigadores pueden reproducir la comparacion base vs adaptador vs fusionado con los mismos diagnosticos (MMLU y Belebele) para medir el coste de eliminar el rechazo.
- Clasificacion y respuesta a preguntas de opcion multiple: util para construir pipelines de evaluacion zero-shot con eleccion restringida entre cuatro opciones, como se documenta en la model card.
- Filtrado y moderacion con menor friccion: en escenarios donde el modelo base rechaza temas legitimos (por ejemplo, explicaciones medicas o juridicas), la variante abliterated responde con mayor cobertura, siempre con supervision humana.
- Despliegue local en estaciones de trabajo: con pesos BF16 de 16,4 GB cabe en una RTX 3090 de 24 GB, lo que permite prototipado offline sin infraestructura cloud.
- Fine-tuning ligero sobre el adaptador: el repositorio incluye el adaptador PEFT (~10 MB), de modo que se puede partir de el para ajustes especificos sin descargar y recomponer el modelo completo.

## Benchmarks y rendimiento
La model card declara mediciones pareadas propias (no resultados de leaderboard) sobre muestras, con intervalos de confianza al 95% por bootstrap agrupado (10.000 remuestreos, semilla 2026):

| Diagnostico | Preguntas | Original | Adaptador en vivo | Fusionado | Cambio del fusionado | Intervalo pareado 95% |
|---|---|---|---|---|---|---|
| MMLU, ingles | 228 | 58,33% | 55,26% | 54,39% | -3,95 pp | [-7,02, -0,88] pp |
| Belebele, griego | 200 | 65,00% | 63,50% | 64,00% | -1,00 pp | [-5,00, +2,94] pp |
| Belebele, ingles | 200 | 74,00% | 70,00% | 70,00% | -4,00 pp | [-7,43, -0,97] pp |

Los valores positivos indicarian mayor precision tras la modificacion. MMLU usa cuatro preguntas de test seleccionadas aleatoriamente de cada una de 57 materias; Belebele usa 200 identificadores de pregunta emparejados en griego e ingles. Cada prompt presenta cuatro opciones y la respuesta predicha es el token A/B/C/D con mayor puntuacion en la primera posicion de respuesta. Son diagnosticos muestreados, zero-shot y de eleccion restringida. El model-index oficial no contiene resultados adicionales.

## Requisitos de hardware
- Pesos BF16: aproximadamente 16,4 GB en disco; en GPU requieren unos 16-17 GB solo para los pesos.
- Memoria adicional para prompt, cache de generacion y runtime; contextos largos o lotes mayores exigen mas VRAM.
- Configuracion probada por el autor: una unica RTX 3090 de 24 GB con Python 3.12, PyTorch con CUDA (rueda CUDA 13.2 en el benchmark), transformers 5.23.0, accelerate 1.15.0 y peft 0.21.3.
- Cabe en GPU de consumo de 24 GB (RTX 3090, RTX 4090) en BF16; en GPUs de 16 GB habria que recurrir a cuantizacion, no documentada en la model card.
- GPU de datacenter como A100 y H100 permiten mayor paralelismo y lotes mas grandes, pero no hay cifras de throughput publicadas.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), PEFT para el adaptador, y el tag `text-generation-inference`/`endpoints_compatible` sugiere compatibilidad con TGI. No se confirma soporte de llama.cpp, Ollama ni vLLM en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-Krikri-8B-Instruct-v1.5-Heretic-MPOA (este) | 8,20B | no disponible | el, en | llama3.1 | Abliterated con MPOA/Heretic; MMLU en ingles 54,39%, Belebele griego 64,00% |
| ilsp/Llama-Krikri-8B-Instruct-v1.5 (base) | 8,20B | no disponible | el, en | llama3.1 | Modelo original de ILSP; MMLU en ingles 58,33%, Belebele griego 65,00% |
| Llama 3.1 8B Instruct (Meta) | 8,03B | 128K (segun ficha oficial de Meta) | multilingue | llama3.1 | Referencia general; sin datos de griego en la informacion disponible |

La comparativa directa solo es posible con el base, porque la model card no aporta resultados frente a otras alternativas. El contexto de Llama 3.1 8B se cita como referencia de familia, no como dato verificado de esta derivacion.

## Limitaciones y advertencias
- La abliteration reduce el rechazo, pero tambien puede degradar la precision: el fusionado pierde 3,95 pp en MMLU ingles y 4,00 pp en Belebele ingles, con intervalos que excluyen el cero; en griego la perdida es de 1,00 pp y no significativa.
- Riesgo de alucinacion: no hay evaluacion de veracidad en la model card; un modelo con rechazo atenuado puede afirmar con seguridad contenido incorrecto.
- Sesgos: no se documentan sesgos conocidos del base ni del derivado; el entrenamiento original de ILSP no se describe en la informacion disponible.
- Cobertura limitada a griego e ingles; no se garantiza calidad en otros idiomas.
- Longitud de contexto no documentada; conviene validar el contexto real antes de usarlo en produccion.
- La fusion a BF16 introduce redondeo respecto al adaptador en vivo (F32), por lo que las salidas pueden diferir entre ambas variantes.
- Licencia llama3.1: uso comercial sujeto a los terminos de la licencia Llama 3.1 y a las obligaciones de atribucion ("Built with Llama"); revisar antes de desplegar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion comunitaria ni reportes independientes.
- El contenido de la model card procede del autor; las cifras de benchmarks son muestreadas y no equivalentes a evaluaciones completas de leaderboard.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/mpvasilis/Llama-Krikri-8B-Instruct-v1.5-Heretic-MPOA
- Modelo base: https://huggingface.co/ilsp/Llama-Krikri-8B-Instruct-v1.5
- Revision base citada: 326e2c0ea90d771c19fcf06225fe87dc922b51b2
- Instalacion de PyTorch: https://pytorch.org/get-started/locally/
- Heretic (herramienta de abliteration): no disponible en la informacion proporcionada
- Paper o blog de MPOA: no disponible en la informacion proporcionada
