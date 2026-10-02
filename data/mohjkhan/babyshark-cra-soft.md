# mohjkhan/babyshark-cra-soft

## Resumen

babyshark-cra-soft es un adaptador LoRA sobre el modelo base Qwen/Qwen2.5-1.5B, desarrollado por mohjkhan en el marco del proyecto InterpAdapt (equipo BabyShark, IIIT Hyderabad). No es un adaptador PEFT convencional: incorpora una superficie de enrutamiento propia denominada Circuit Routing Adapter (CRA) con enmascaramiento de cabezas de atención en modo `soft`, y su objetivo es la clasificación de sentimiento en tres clases sobre texto hinglish (hindi-inglés romanizado).

El modelo resuelve una tarea concreta y acotada: el análisis de sentimiento en codigo-mixto hindi-ingles, evaluado sobre el dataset SAIL-2017 romanizado (satyam-arora-iiit-hyderabad/babyshark-sail2017-stage2). Su relevancia es fundamentalmente metodológica: forma parte de una línea de investigación sobre interpretabilidad y enrutamiento guiado por circuitos, en la que solo se entrenan las cabezas de atención identificadas como relevantes mediante trazas causales de Stage-1, en lugar de aplicar LoRA de forma uniforme sobre toda la red.

El adaptador tiene rango 8 sobre las proyecciones q_proj y o_proj, con 362 bloques de cabezas activos en la variante `soft`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia. Los pesos se distribuyen como un único fichero `ckpt.pt` generado con `torch.save`, lo que implica que no se puede cargar con `peft` ni con herramientas de inferencia estándar sin el código del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5) con adaptador LoRA enrutado por cabezas de atencion (MaskedLoRALinear) |
| Parametros totales | Aproximadamente 1,5 mil millones (modelo base Qwen2.5-1.5B) mas el adaptador LoRA de rango 8; el numero exacto de parametros del adaptador no esta disponible |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento uso max_len de 256 tokens |
| Tipos de cuantizacion | No disponible; el checkpoint se distribuye en fp16 (sin cuantizar) |
| Idiomas soportados | Hindi (hi) e ingles (en); evaluado sobre hinglish romanizado (en_hi-latn) |
| Licencia | No disponible |
| Formato de pesos | `ckpt.pt` (payload de `torch.save` con el state dict del adaptador, mas optimizer, scheduler, step y RNG para reanudar); no se distribuye en safetensors ni GGUF |
| Modelo base | Qwen/Qwen2.5-1.5B (fp16) |
| Ficheros del repositorio | `ckpt.pt`, `results.json` |
| Tarea | Clasificacion de sentimiento de 3 clases sobre texto code-mixed hinglish |
| Modo de mascara | `soft` (M = clip(s,0)/global_max, enrutamiento global) |
| Cabezas activas | 362 head-blocks |
| Tamano del repositorio | 0,0 GB segun la ficha de HuggingFace |
| Libreria declarada | pytorch |
| Metricas declaradas | f1, accuracy |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-1.5B, un transformer decoder denso. Sobre el se inyecta un adaptador LoRA de rango 8 en `q_proj` y `o_proj`, con alpha 16 y dropout 0.05. La innovacion no esta en el adaptador en si, sino en la superficie de enrutamiento: el CRA aplica una mascara sobre cabezas de atencion concretas, de modo que la adaptacion se concentra en los circuitos identificados como relevantes para la tarea. La variante publicada usa mascara `soft` con enrutamiento global, donde la mascara se calcula como M = clip(s,0)/global_max a partir de las puntuaciones de cabeza.

Las puntuaciones de cabeza provienen de una traza causal de Stage-1 v2 (recuperacion media en `en_hi-latn`). El entrenamiento se realizo durante 600 pasos con learning rate 1e-4, max_len 256 y seed 0. La evaluacion se hizo en fp16 sobre una NVIDIA GeForce GTX 1080 Ti, con n=1260 ejemplos de validacion. Segun la model card, las distintas ramas CRA comparten seed 0 y orden de datos, de modo que la unica diferencia entre ellas es la mascara de cabezas, lo que permite atribuir las diferencias de rendimiento al enrutamiento. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset ni el uso de RLHF o DPO.

## Capacidades

- Clasificacion de sentimiento en tres clases sobre texto hinglish (hindi-ingles romanizado).
- Procesamiento de texto code-mixed con alternancia de idiomas dentro de la misma frase.
- Comprension de hindi (hi) e ingles (en) como idiomas de entrada; la evaluacion se centra en la variante romanizada `en_hi-latn`.
- Enrutamiento selectivo de cabezas de atencion: solo 362 head-blocks reciben adaptacion, lo que permite analisis de interpretabilidad por circuito.
- Reproducibilidad experimental: el checkpoint incluye estado de optimizer, scheduler, step y RNG para reanudar exactamente el entrenamiento.
- Capacidad de servir como punto de comparacion entre variantes de mascara (soft frente a otras ramas CRA con la misma seed y orden de datos).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- No es un modelo de generacion de texto de proposito general: la cabeza de clasificacion y el flujo de carga dependen del codigo del proyecto.

## Casos de uso

- Analisis de sentimiento en redes sociales en hinglish: el adaptador clasifica comentarios y publicaciones que mezclan hindi romanizado e ingles, un escenario frecuente en plataformas indias donde los modelos entrenados solo en ingles rinden por debajo del 40 por ciento de accuracy, segun los datos reportados.
- Moderacion de comentarios en foros y marketplaces: dado que el texto code-mixed es habitual en comunidades del sur de Asia, el modelo permite etiquetar polaridad (positiva, negativa o neutra) como primera etapa de un pipeline de moderacion asistida.
- Monitorizacion de reputacion de marca: procesamiento por lotes de menciones y resenas en hinglish para alimentar cuadros de mando de opinion publica, con una mejora declarada de +24 puntos de accuracy frente al modelo base sin adaptador.
- Investigacion en interpretabilidad de circuitos: el checkpoint permite reproducir el experimento de enrutamiento por cabezas y comparar la rama `soft` con otras ramas CRA que comparten seed y orden de datos, aislando el efecto de la mascara.
- Base para transferencia a otras tareas en hinglish: al ser un adaptador ligero de rango 8 sobre un modelo de 1,5 mil millones de parametros, sirve como punto de partida de bajo coste para nuevas tareas code-mixed con recursos limitados.
- Analisis de encuestas y formularios abiertos: clasificacion de respuestas de texto libre en hindi-ingles para estudios de opinion o investigacion de mercados en India.
- Deteccion temprana de quejas en atencion al cliente: la clase negativa puede usarse como disparador para escalar tickets en soporte tecnico o servicios financieros que operan en contextos bilingues hindi-ingles.
- Validacion de metodologias de ajuste eficiente: comparacion cuantitativa entre LoRA uniforme y LoRA enrutado para justificar decisiones de arquitectura en proyectos de adaptacion de bajo presupuesto.

## Benchmarks y rendimiento

Evaluacion sobre validacion del dataset SAIL-2017 Romanized (Hinglish), 3 clases, n=1260, fp16, NVIDIA GeForce GTX 1080 Ti.

| Metrica | Qwen2.5-1.5B base | + adaptador CRA soft |
|---|---|---|
| Accuracy | 0,3571 | 0,5976 |
| Macro-F1 | 0,3188 | 0,5665 |

Mejora absoluta: +0,2405 en accuracy y +0,2477 en macro-F1. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- El modelo base tiene aproximadamente 1,5 mil millones de parametros; en fp16 los pesos ocupan en torno a 3 GB, a lo que se suma el adaptador de rango 8, de tamano muy reducido.
- La evaluacion reportada se ejecuto en una NVIDIA GeForce GTX 1080 Ti (11 GB de VRAM), lo que indica que la inferencia cabe sin problemas en GPU de consumo.
- GPU de consumo compatibles por VRAM: GTX 1080 Ti, RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070 y superiores. En GPU con 8 GB o menos puede ser necesario reducir el tamano de lote o usar cuantizacion del modelo base, no incluida en el repositorio.
- GPU de centro de datos como A100, H100 o L40S son compatibles, pero sobredimensionadas para este tamano de modelo salvo en escenarios de alto throughput por lotes.
- Opciones de despliegue: no es un adaptador PEFT estandar, por lo que vLLM, TGI, llama.cpp u Ollama no pueden cargarlo directamente. La ruta documentada es el codigo del proyecto InterpAdapt, que construye el modelo base, inyecta el `MaskedLoRALinear` y carga `ckpt["adapter"]` con `load_checkpoint` del script `scripts/train_cra_compare.py`.
- Latencia y throughput: no disponible en la informacion proporcionada. El entrenamiento se realizo en 600 pasos con max_len 256, pero no se reportan tiempos por paso ni velocidad de inferencia.

## Comparativa con modelos similares

Los resultados publicados solo permiten la comparacion directa contra el modelo base sin adaptador. No hay datos de otros modelos sobre este mismo dataset en la informacion disponible.

| Modelo | Parametros | Contexto | Accuracy (SAIL-2017 Romanized) | Macro-F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| babyshark-cra-soft (Qwen2.5-1.5B + CRA soft) | ~1,5B mas LoRA r8 | No disponible (entreno a 256) | 0,5976 | 0,5665 | No disponible | HuggingFace (0 descargas) |
| Qwen2.5-1.5B base | ~1,5B | No disponible en la informacion aportada | 0,3571 | 0,3188 | No disponible en la informacion aportada | Publico en HuggingFace |
| Otras ramas CRA del mismo proyecto | ~1,5B mas LoRA r8 | No disponible (entreno a 256) | No disponible | No disponible | No disponible | No publicadas en este repositorio |

## Limitaciones y advertencias

- Modelo de proposito muy especifico: clasificacion de sentimiento en 3 clases sobre hinglish; no debe emplearse como modelo generativo general.
- El rendimiento absoluto es moderado: 0,5976 de accuracy y 0,5665 de macro-F1 sobre 1260 ejemplos de validacion, lejos de un sistema de produccion sin supervision adicional.
- La evaluacion se limita a un unico dataset (SAIL-2017 Romanized) y a una unica particion de validacion; no se reportan resultados en test ni validacion cruzada.
- No se declara licencia, por lo que el uso comercial queda en un limbo juridico hasta que el autor lo aclare. La licencia del modelo base Qwen2.5-1.5B debe consultarse por separado.
- El repositorio tiene 0 descargas y 0 likes, y el tamano reportado es 0,0 GB, lo que sugiere un artefacto sin validacion por terceros. Los pesos referenciados podrian no estar accesibles o no corresponder al tamano esperado.
- Formato de pesos no estandar (`ckpt.pt` con `torch.save`): no se puede cargar con `peft`, `transformers` ni herramientas de inferencia habituales sin el codigo del proyecto.
- Requiere clonar y ejecutar el repositorio https://github.com/bala-skv/InterpAdapt-Hinglish-finetuning; la propia model card advierte que no es un adaptador PEFT convencional.
- No se documentan sesgos especificos, pero el dominio de entrenamiento (sentimiento en redes sociales en hinglish) puede introducir sesgos de dominio, registro y tematica.
- Riesgo de alucinacion no aplicable a la tarea de clasificacion, pero si se reutiliza el modelo base subyacente para generacion, ese riesgo recae en Qwen2.5-1.5B y no esta caracterizado aqui.
- Cobertura limitada a hindi e ingles; el rendimiento en otras lenguas indias o en hindi en escritura devanagari no esta documentado.
- Las fechas del repositorio (creacion y actualizacion el 2026-10-02) son inconsistentes con la fecha actual y deben tratarse con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohjkhan/babyshark-cra-soft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset de evaluacion: https://huggingface.co/datasets/satyam-arora-iiit-hyderabad/babyshark-sail2017-stage2
- Repositorio del proyecto (InterpAdapt-Hinglish-finetuning): https://github.com/bala-skv/InterpAdapt-Hinglish-finetuning
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a contenidos sin relacion (la lengua criolla javindo y sitios de streaming de nombre similar), por lo que se descartan.
