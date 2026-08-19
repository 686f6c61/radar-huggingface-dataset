# flodraye/qwen3-0.6b-selfdistill-reverse-kl

## Resumen

Este checkpoint, desarrollado por flodraye, es una version de Qwen3-0.6B fine-tuneada mediante self-distillation con divergencia reverse KL (alpha=1.0). El objetivo es inyectar conocimiento factual sintetico sobre 200 personas en un modelo pequeno de 596 millones de parametros, alcanzando una precision del 87% en preguntas de hecho (QA) sobre esa poblacion. Forma parte del proyecto distill-cl-biography, centrado en la inyeccion de conocimiento y el aprendizaje continuo, y sirve como punto de partida para experimentos de aprendizaje secuencial.

El modelo parte de la arquitectura densa de Qwen3-0.6B, un transformer de 0.6B parametros con soporte multilingue. El entrenamiento se realizo con 2000 repeticiones de un dataset sintetico, batch efectivo de 400, learning rate constante de 1e-5 y 1000 pasos. Aunque no se han publicado benchmarks estandar, la metrica interna qa_accuracy=0.87 demuestra la viabilidad de la destilacion reverse KL para transferir conocimiento en modelos pequenos.

Su relevancia radica en ser un checkpoint de referencia publico para investigacion en destilacion, inyeccion de conocimiento y continual learning, con licencia Apache 2.0 que permite uso comercial, aunque su naturaleza experimental limita su aplicacion directa en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponible (el modelo base Qwen3-0.6B es multilingue, pero no se especifica para este checkpoint) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-0.6B, un transformer denso de la familia Qwen3, que incluye arquitecturas densas y MoE en escalas de 0.6B a 235B. Para este checkpoint, se aplico self-distillation con divergencia reverse KL (alpha=1.0), un metodo donde el modelo aprende a imitar su propia distribucion de salida pero penalizando la divergencia en una direccion especifica. El dataset de entrenamiento consistio en 200 personas sinteticas, con 2000 repeticiones, topk=5, batch de 100 con grad_accum=4 (batch efectivo 400), learning rate constante de 1e-5 y 1000 pasos. El entrenamiento se realizo con el script `training/self_distill.py` del repositorio [distill-cl-biography](https://github.com/florentdraye/distill-cl-biography).

No se especifican detalles sobre la composicion del dataset ni sobre el uso de RLHF o DPO; el metodo se basa exclusivamente en destilacion auto-supervisada. La innovacion principal es la aplicacion de reverse KL para la inyeccion de conocimiento, que segun el autor muestra mejores resultados que la forward KL en tareas de QA factual.

## Capacidades

- Generacion de texto y razonamiento basico heredados del modelo base Qwen3-0.6B.
- QA factual sobre la poblacion sintetica entrenada, con una precision del 87% en held-out data.
- Capacidad de inyeccion de conocimiento en modelos pequenos mediante destilacion.
- Soporte para experimentos de continual learning al ser un checkpoint intermedio.
- No se mencionan capacidades de tool calling, agentes, vision, audio ni modo thinking especifico.
- El modelo base Qwen3-0.6B soporta multilingue, pero no hay evidencia de que este checkpoint conserve esas capacidades completas tras el fine-tuning.

## Casos de uso

- Investigacion en self-distillation: permite comparar metodos reverse KL frente a forward KL en tareas de inyeccion de conocimiento.
- Experimentos de continual learning: sirve como punto de partida para pruebas de aprendizaje secuencial sin olvido catastrofico, tal como se describe en el repositorio asociado.
- Simulacion de agentes con conocimiento de personas: al estar entrenado con datos de 200 personas sinteticas, puede generar respuestas factuales sobre ellas, util para entornos de simulacion o pruebas de sistemas conversacionales.
- Evaluacion de tecnicas de knowledge injection: permite medir cuantitativamente (qa_accuracy) la eficacia de distintas estrategias de destilacion en modelos de menos de 1B parametros.
- Fine-tuning posterior sobre dominios especificos: el checkpoint puede servir como base para adaptar conocimiento inyectado a nuevas tareas, aprovechando la capa de conocimiento ya adquirida.
- Benchmark de metodos de regularizacion: al ser un checkpoint de referencia publico, facilita la reproducibilidad de experimentos en destilacion y aprendizaje continuo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado es una metrica interna del autor:

| Metrica | Valor |
|---|---|
| qa_accuracy (QA factual sobre la poblacion entrenada, held-out) | 0.87 |

Esta metrica no es comparable con benchmarks estandar y debe interpretarse solo como indicador de la eficacia de la destilacion en el dominio especifico de los datos sinteticos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 596M parametros. En precision FP16/BF16, ocupa aproximadamente 1.2 GB de VRAM, por lo que cabe en GPUs consumer con 2 GB o mas. Sin cuantizacion adicional, se puede ejecutar en tarjetas como GTX 1650, RTX 2060, etc.
- Para entrenamiento, el autor uso un batch efectivo de 400, lo que requiere una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 3090, A100) o varias GPUs con acumulacion de gradientes.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama y TGI, aunque no se proporcionan configuraciones especificas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B (base) | 596M | No disponible | Apache-2.0 | Sin datos especificos | Modelo original sin destilacion |
| Este checkpoint | 596M | No disponible | Apache-2.0 | qa_accuracy=0.87 en dataset propio | Fine-tune con reverse KL |
| TinyLlama-1.1B | 1.1B | 2k (original) | Apache-2.0 | MMLU ~25% | Modelo denso de tamano similar, pero sin inyeccion de conocimiento especifica |

No se dispone de comparaciones directas con otros modelos de la misma categoria en la informacion proporcionada. La comparativa se limita al modelo base y a un modelo de tamano cercano, pero sin datos de benchmarks comunes.

## Limitaciones y advertencias

- Es un checkpoint de investigacion, no un modelo listo para produccion. No se ha evaluado en tareas generales ni en entornos reales.
- El conocimiento inyectado se limita a 200 personas sinteticas; el modelo no tiene conocimiento factual general mas alla del heredado del modelo base, y puede alucinar en dominios fuera de ese conjunto.
- No se han publicado evaluaciones de sesgos ni de robustez. Los datos sinteticos pueden contener sesgos introducidos durante su generacion.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es experimental y no ofrece garantias de calidad ni soporte.
- No se especifican limitaciones de contexto ni de idioma para este checkpoint especifico; se asume que hereda las del modelo base, pero no hay confirmacion.
- No hay informacion sobre cuantizaciones ni optimizaciones para despliegue eficiente.

## Enlaces

- HuggingFace: [flodraye/qwen3-0.6b-selfdistill-reverse-kl](https://huggingface.co/flodraye/qwen3-0.6b-selfdistill-reverse-kl)
- Repositorio del proyecto: [github.com/florentdraye/distill-cl-biography](https://github.com/florentdraye/distill-cl-biography)
- Modelo base Qwen3-0.6B: [Qwen/Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)
- Qwen3 Technical Report: [arXiv:2505.09388](https://arxiv.org/abs/2505.09388)
