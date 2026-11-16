# shiva123782/SmolLM2-360M-QLoRA-Low

## Resumen

SmolLM2-360M-QLoRA-Low es un ajuste fino mediante QLoRA del modelo base HuggingFaceTB/SmolLM2-360M-Instruct, publicado por el usuario shiva123782 (identificado en la model card como shiva-ai-labs). Se distribuye como adaptador PEFT (LoRA) sobre la arquitectura original de SmolLM2, un transformer decoder-only de 361.821.120 parámetros, y está entrenado sobre el dataset yahma/alpaca-cleaned con el objetivo declarado de reforzar la identidad del modelo y su comportamiento conversacional en inglés.

El modelo hereda la arquitectura y las capacidades del SmolLM2-360M-Instruct original, un SLM (small language model) pensado para despliegues con recursos muy limitados. Al ser un adaptador LoRA, el repositorio ocupa 0,7 GB y requiere cargar primero los pesos base y después acoplar el adaptador mediante la librería PEFT, o bien fusionar ambos para obtener un modelo monolítico de aproximadamente 1,0 GB.

Su relevancia es acotada: se trata de un experimento de ajuste fino de bajo coste, sin benchmarks publicados, sin descargas ni interacciones en el momento de la consulta y con una model card que prioriza la atribución de identidad sobre la evaluación técnica. Resulta útil como ejemplo de pipeline QLoRA sobre un SLM y como base para prototipos ligeros, no como modelo de producción para tareas exigentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2), ajustado con adaptador LoRA/QLoRA (PEFT) |
| Parametros totales | 361.821.120 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base SmolLM2-360M-Instruct) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el adaptador se entrena con QLoRA; el autor no detalla cuantizaciones de inferencia) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); fusionable a modelo monolotico safetensors |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-360M-Instruct, un transformer decoder-only denso de 361,8 millones de parametros. Sobre esa base se aplica un ajuste fino con QLoRA (LoRA cuantizado), que congela los pesos originales e introduce matrices de baja dimension entrenables, reduciendo el coste de memoria del entrenamiento. El resultado se distribuye como adaptador PEFT independiente, no como pesos completos.

El dataset de entrenamiento declarado es yahma/alpaca-cleaned, un corpus de instrucciones en ingles derivado de Alpaca. La model card no especifica el numero de tokens vistos, la composicion exacta del dataset, la configuracion de hiperparametros (rango de LoRA, alpha, tasa de aprendizaje, epocas) ni si hubo etapas de RLHF o DPO posteriores. El autor menciona un objetivo de entrenamiento orientado a reforzar la identidad del modelo ("responde como SmolLM2-360M-QLoRA-Low, creado por shiva-ai-labs"), que describe explicitamente como una meta de entrenamiento y no como una garantia. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste de instrucciones del modelo base.
- Respuesta a instrucciones de tipo Alpaca (el formato del dataset de ajuste), con estilo de asistente.
- Comportamiento de identidad entrenado: el autor indica que responde como SmolLM2-360M-QLoRA-Low, creado por shiva-ai-labs, ante preguntas sobre su identidad.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Fusion del adaptador con el modelo base para despliegue sin runtime PEFT (`merge_and_unload`).

## Casos de uso

- Prototipado de asistentes conversacionales ligeros: el modelo cabe en cualquier GPU de consumo y permite validar flujos de dialogo multi-turno en ingles antes de escalar a un modelo mayor, gracias a su huella de 0,7 GB como adaptador.
- Experimentacion con pipelines QLoRA: sirve como referencia reproducible para estudiar como un ajuste fino de bajo rango sobre alpaca-cleaned modifica el comportamiento de un SLM, incluida la inyeccion de identidad.
- Educacion y demostraciones de PEFT: la model card incluye un quickstart con `PeftModel.from_pretrained`, lo que lo hace util en cursos y talleres sobre ajuste eficiente de parametros.
- Generacion de texto offline en dispositivos con recursos limitados: tras fusionar el adaptador, el modelo monolotico de aproximadamente 1,0 GB puede ejecutarse en CPU o en GPUs integradas para tareas de completado simple.
- Pruebas de regresion de identidad y sesgos: permite evaluar hasta que punto un ajuste fino pequeno altera las respuestas de identidad del modelo base y si introduce deriva en el resto de tareas.
- Base para ajustes posteriores: al ser un adaptador PEFT, puede combinarse o sustituirse por otros adaptadores en experimentos de composicion de LoRAs, aunque no se documenta soporte oficial para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador requiere cargar el modelo base SmolLM2-360M-Instruct. En fp16, los 361,8 millones de parametros ocupan aproximadamente 0,7 GB; en fp32, alrededor de 1,4 GB. El adaptador anade una cantidad marginal de memoria.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, T4). Para mayor comodidad, una RTX 3060 o superior deja margen para lotes mayores.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna de consumo e incluso en CPU para inferencia interactiva.
- Opciones de despliegue: transformers + PEFT (ruta documentada por el autor); tras fusionar el adaptador, es compatible con vLLM, llama.cpp, Ollama o TGI en la medida en que estos soporten la arquitectura SmolLM2, aunque el autor no documenta configuraciones especificas.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolLM2-360M-QLoRA-Low | 361.821.120 | No disponible | Apache-2.0 | Adaptador PEFT safetensors | Ajuste QLoRA sobre alpaca-cleaned; sin benchmarks publicados |
| HuggingFaceTB/SmolLM2-360M-Instruct | 361,8 M (aprox.) | No disponible en esta ficha | Apache-2.0 | safetensors | Modelo base oficial de Hugging Face, con evaluacion publicada por el autor original |
| SmolLM2-135M-Instruct | 135 M (aprox.) | No disponible en esta ficha | Apache-2.0 | safetensors | Variante mas pequena de la misma familia, para despliegues aun mas restrictivos |
| Qwen2.5-0.5B-Instruct | 0,5 B (aprox.) | No disponible en esta ficha | Apache-2.0 | safetensors | Alternativa de tamano similar con soporte multilingue declarado |

Los datos de la familia SmolLM2 y de Qwen2.5 se indican de forma orientativa; no se dispone de una comparacion de rendimiento verificada en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, por lo que no es posible cuantificar su calidad frente al modelo base.
- Riesgo de alucinacion: como todo SLM de 360 millones de parametros, la fiabilidad factual es limitada y el ajuste sobre alpaca-cleaned no corrige esa limitacion.
- Sesgos: el dataset alpaca-cleaned es una coleccion de instrucciones en ingles con sesgos conocidos de origen; el ajuste no documenta mitigaciones.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Contexto: la longitud de contexto no se especifica en la informacion disponible; debe consultarse la del modelo base antes de usarlo en conversaciones largas.
- Licencia: Apache-2.0 permite uso comercial, pero el autor recomienda confirmar los terminos del modelo base antes de un despliegue comercial.
- Trazabilidad: repositorio con cero descargas y cero interacciones en el momento de la consulta, creado y actualizado el mismo dia (16 de noviembre de 2026), sin historial de mantenimiento.
- Identity behaviour: el autor lo describe como objetivo de entrenamiento, no como garantia; el modelo puede no responder de forma consistente sobre su identidad.
- Despliegue: requiere cargar el modelo base y acoplar el adaptador, o fusionarlos manualmente; no se distribuyen pesos monoloticos listos para usar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shiva123782/SmolLM2-360M-QLoRA-Low
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset de ajuste: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Visor de arquitectura citado por el autor: https://hfviewer.com/shiva123782/SmolLM2-360M-QLoRA-Low
