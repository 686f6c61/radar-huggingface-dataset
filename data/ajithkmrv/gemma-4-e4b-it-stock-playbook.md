# AjithKmrV/gemma-4-E4B-it-stock-playbook

## Resumen

`AjithKmrV/gemma-4-E4B-it-stock-playbook` es un ajuste fino (finetune) del modelo Gemma 4 E4B en su variante instruct, partiendo concretamente de la version cuantizada en 4 bits publicada por Unsloth (`unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`). Lo desarrolla el usuario AjithKmrV y esta pensado, segun el nombre del repositorio, como un "playbook" orientado a tareas de bolsa y mercados financieros. Es un modelo multimodal de tipo image-text-to-text, es decir, acepta imagenes y texto como entrada y genera texto.

El modelo cuenta con 7.996.156.490 parametros segun los pesos en safetensors, lo que lo situa en la franja de los 8.000 millones de parametros. Se distribuye bajo licencia Apache 2.0 y esta etiquetado unicamente para ingles. El repositorio ocupa 16,0 GB y se ha entrenado con Unsloth y la libreria TRL de Hugging Face, lo que permite un ajuste fino aproximadamente el doble de rapido que un entrenamiento convencional.

Su relevancia es limitada y muy especifica: se trata de un experimento de ajuste fino de un modelo Gemma 4 de tamano compacto, con muy poca traccion en la comunidad (9 descargas y 0 likes en el momento de la consulta) y sin documentacion tecnica detallada en la model card. Resulta util como ejemplo de pipeline de finetuning con Unsloth sobre Gemma 4 y como base para prototipos de analisis financiero, pero no como modelo de proposito general ni como referencia de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Gemma 4; detalles internos no disponibles |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El modelo base de partida esta cuantizado en 4 bits (bnb-4bit); el repositorio publica pesos en safetensors. Otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Gemma 4 E4B instruct en version cuantizada a 4 bits de Unsloth. La arquitectura subyacente corresponde a la familia Gemma 4, un transformer multimodal que procesa entradas de imagen y texto y genera texto; sin embargo, la model card no aporta detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni el encoder visual empleado.

El entrenamiento se realizo con Unsloth y TRL, segun indica el autor, logrando un entrenamiento "2x mas rapido". No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de RLHF, DPO o SFT supervisado, ni el regimen de hiperparametros. Tampoco se documenta si el ajuste fino congela el encoder visual o si afecta a todas las capas. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo Gemma 4 E4B instruct.
- Procesamiento de entradas multimodal imagen-texto (pipeline image-text-to-text), lo que permite interpretar graficos, capturas de pantalla o tablas de mercado.
- Orientacion tematica a mercados bursatiles y estrategias de inversion ("stock playbook"), segun el nombre y el proposito declarado del repositorio.
- Razonamiento multi-turno basico propio de un modelo instruct de ~8B.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponibles (no documentadas).
- Capacidades multilingues: limitadas al ingles segun las etiquetas del repositorio.
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Analisis de graficos bursatiles: al aceptar imagenes, el modelo puede recibir capturas de velas japonesas o indicadores tecnicos y generar una descripcion textual de la tendencia, util como primer filtro en herramientas de trading.
- Resumen de informes financieros: dado un texto con resultados trimestrales, el modelo puede sintetizar cifras clave y variaciones interanuales, gracias a su naturaleza instruct y su tamano manejable para despliegue local.
- Prototipado de asistentes de inversion: sirve como base para experimentar con prompts de estrategia ("playbook") sin coste de API, al ser un modelo de ~8B desplegable en una sola GPU.
- Extraccion de datos de tablas e imagenes: la entrada multimodal permite transcribir tablas de cotizaciones o balances escaneados a texto estructurado para su posterior procesado.
- Educacion financiera: generacion de explicaciones sobre conceptos de mercados a partir de material visual o textual aportado por el usuario.
- Evaluacion de pipelines de finetuning: como ejemplo reproducible de ajuste fino con Unsloth y TRL sobre Gemma 4 cuantizado, util para equipos que quieran replicar el flujo con sus propios datos.
- Generacion de resumenes de noticias economicas: con contexto corto y en ingles, puede condensar titulares y notas de prensa en parrafos breves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~8B parametros, en FP16 requiere aproximadamente 16 GB de VRAM; en cuantizacion de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB (estimaciones estandar para modelos de este tamano, no verificadas para este checkpoint concreto).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 6000 Ada para FP16 con margen; RTX 4090 (24 GB) para FP16 justo o 8 bits con holgura.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16 o 8 bits, y en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070) con cuantizacion a 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta del repositorio), vLLM y llama.cpp/Ollama previa conversion a GGUF (no se distribuyen pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| AjithKmrV/gemma-4-E4B-it-stock-playbook | ~8B | no disponible | Apache 2.0 | en | Finetune tematico de Gemma 4 E4B, multimodal |
| unsloth/gemma-4-E4B-it-unsloth-bnb-4bit (modelo base) | ~8B | no disponible | Apache 2.0 | en (segun repositorio) | Version cuantizada 4 bits del Gemma 4 E4B instruct |
| Gemma 4 E4B instruct (original) | ~8B | no disponible | Apache 2.0 | multilingue (segun familia Gemma) | Modelo de referencia sin ajuste tematico |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Traccion minima: 9 descargas y 0 likes; no hay evidencia de validacion por parte de la comunidad.
- Documentacion practicamente inexistente: la model card no describe dataset, hiperparametros, evaluacion ni limitaciones.
- Riesgo de alucinacion elevado en un dominio sensible como el financiero; no debe usarse para decisiones de inversion sin supervision humana.
- Sesgos desconocidos: al no documentarse el dataset de ajuste fino, no es posible evaluar sesgos de genero, geograficos o de otro tipo.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta garantizado.
- Contexto: no documentado, lo que impide planificar usos con documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma de Google tiene sus propios terminos de uso que conviene revisar antes de explotacion comercial.
- El ajuste se realizo sobre una version ya cuantizada a 4 bits, lo que puede degradar la calidad respecto a un finetune sobre pesos completos.
- Es un modelo multimodal: la calidad del procesamiento de imagenes no esta evaluada ni documentada.

## Enlaces

- Hugging Face: https://huggingface.co/AjithKmrV/gemma-4-E4B-it-stock-playbook
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: no disponible en la informacion proporcionada
- Paper de Gemma 4: no disponible en la informacion proporcionada
- Demo o blog del autor: no disponible
