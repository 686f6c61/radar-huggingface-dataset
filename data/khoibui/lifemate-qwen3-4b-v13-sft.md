# KhoiBui/lifemate-qwen3-4b-v13-sft

## Resumen

lifemate-qwen3-4b-v13-sft es un adaptador LoRA publicado por el usuario KhoiBui sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. Se distribuye como un repositorio PEFT de aproximadamente 0,3 GB, lo que corresponde exclusivamente a los pesos del adaptador y no al modelo completo. El nombre sugiere un ajuste fino supervisado (SFT) orientado a un asistente conversacional de acompanamiento personal ("lifemate"), aunque la model card no documenta el dataset, el objetivo ni el procedimiento de entrenamiento.

El modelo hereda la arquitectura transformer densa del Qwen3-4B-Instruct-2507, un modelo de 4.000 millones de parametros desarrollado por Alibaba Qwen. Al ser un adaptador, todas las capacidades del modelo base (generacion de texto, razonamiento, codigo, soporte multilingue y modo instruct) siguen disponibles, pero moduladas por el ajuste fino del adaptador. La relevancia practica es limitada: se trata de un experimento personal con cero descargas y cero likes en el momento de la consulta, sin documentacion tecnica publicada.

La ficha se basa unicamente en los metadatos disponibles en Hugging Face y en las caracteristicas conocidas del modelo base. Cualquier dato no confirmado se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con adaptador LoRA sobre Qwen/Qwen3-4B-Instruct-2507 |
| Parametros totales | 4.000 millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar, pero no se documenta) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.21.2, transformers |
| Tamano del repositorio | 0,3 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) acoplado a Qwen/Qwen3-4B-Instruct-2507. El modelo base es un transformer denso de 4.000 millones de parametros con atencion causal estandar, ajustado por el equipo de Qwen para tareas instruct y conversacionales. El adaptador introduce matrices de bajo rango en determinadas capas, de modo que en inferencia deben combinarse con los pesos base o cargarse dinamicamente mediante la libreria PEFT.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, la presencia de RLHF/DPO ni los hiperparametros del ajuste fino. La model card es la plantilla por defecto de Hugging Face con la mayoria de campos marcados como "[More Information Needed]". El unico dato tecnico confirmado es la version de PEFT utilizada (0.21.2) y el modelo base declarado en los metadatos. El sufijo "sft" del nombre sugiere ajuste fino supervisado, pero no hay evidencia documental del procedimiento.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y matematicas basicas: capacidades propias de un modelo instruct de 4.000 millones de parametros.
- Generacion de codigo: el modelo base Qwen3 incluye entrenamiento en lenguajes de programacion, aunque el adaptador no documenta refuerzo especifico.
- Soporte multilingue: presumiblemente heredado del modelo base, pero no confirmado en la model card.
- Tool calling / function calling: no documentado en el adaptador; el modelo base Qwen3-Instruct lo soporta.
- Modo thinking: no documentado para este adaptador.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para el adaptador.
- Vision y audio: no soportados (el modelo base es solo texto).

## Casos de uso

- Prototipado de asistentes conversacionales personales: el adaptador puede cargarse sobre Qwen3-4B-Instruct-2507 para experimentar con un tono o estilo de acompanamiento personal, siempre que se valide la calidad del ajuste con datos propios.
- Investigacion sobre ajuste fino con LoRA: util como ejemplo de adaptador PEFT de bajo rango sobre un modelo de 4.000 millones de parametros, para estudiar el impacto del SFT en dominios conversacionales.
- Despliegue en entornos con recursos limitados: al combinarse con el modelo base cuantizado, puede ejecutarse en GPU de consumo (ver seccion de hardware), aunque el adaptador en si no reduce el coste de inferencia.
- Experimentacion academica con modelos pequenos: permite comparar el comportamiento del modelo base frente al ajustado en tareas de dialogo, sin necesidad de reentrenar desde cero.
- Generacion de respuestas en dominios de bienestar o acompanamiento: solo con validacion humana y auditoria de sesgos, dado que no hay documentacion sobre los datos de entrenamiento.
- Base para futuros ajustes: el adaptador puede servir como punto de partida para fusiones o entrenamientos adicionales, aunque la falta de licencia clara limita su uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4.000 millones de parametros requiere aproximadamente 8 GB en FP16, 4-5 GB en cuantizacion de 8 bits y 2,5-3 GB en cuantizacion de 4 bits. El adaptador anade una cantidad marginal de memoria (0,3 GB en disco, menos en VRAM al combinarse).
- GPU recomendadas: RTX 4090, RTX 3090, A100, H100 para FP16; RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizacion de 4-8 bits.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM en FP16 y 4 GB en cuantizacion de 4 bits.
- Opciones de despliegue: transformers + peft (carga del adaptador), vLLM (previa fusion del adaptador), llama.cpp/Ollama (previa conversion a GGUF del modelo fusionado), TGI. La carga directa del adaptador requiere transformers y peft.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lifemate-qwen3-4b-v13-sft | 4.000 M (base) + adaptador | no disponible | no disponible | Hugging Face, 0 descargas | Adaptador LoRA sin documentacion |
| Qwen/Qwen3-4B-Instruct-2507 | 4.000 M | segun model card del base | segun model card del base | Hugging Face, ampliamente usado | Modelo base oficial, documentado |
| Llama 3.2 3B Instruct | 3.000 M | 128k (segun model card) | Llama 3.2 Community License | Hugging Face, ampliamente usado | Alternativa densa de tamano similar |
| Phi-3.5-mini-instruct | 3.800 M | 128k (segun model card) | MIT | Hugging Face, ampliamente usado | Alternativa densa con licencia permisiva |

La comparativa se limita a parametros y disponibilidad; no hay datos de rendimiento del adaptador para comparar benchmarks.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe datos, procedimiento ni evaluacion, lo que impide validar la calidad del ajuste.
- Licencia no disponible: no se puede confirmar el uso comercial; ademas, la licencia del modelo base Qwen3-4B-Instruct-2507 debe respetarse por separado.
- Riesgo de alucinacion: inherente a los modelos de 4.000 millones de parametros, sin mitigaciones documentadas en el adaptador.
- Sesgos desconocidos: al no documentarse el dataset de SFT, no es posible evaluar sesgos introducidos por el ajuste.
- Idiomas no confirmados: no se especifica que idiomas cubre el adaptador; el modelo base es multilingue, pero el SFT podria haber reducido esa cobertura.
- Contexto no confirmado: la longitud de contexto efectiva del adaptador no esta documentada.
- Uso en produccion desaconsejado sin auditoria: cero descargas, cero likes y ausencia de pruebas publicadas.
- El adaptador no reduce el coste de inferencia respecto al modelo base; solo modula su comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/KhoiBui/lifemate-qwen3-4b-v13-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
- Calculadora de impacto ambiental: https://mlco2.github.io/impact
