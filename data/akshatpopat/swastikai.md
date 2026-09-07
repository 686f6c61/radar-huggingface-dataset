# akshatpopat/SwastikAI

## Resumen

El modelo `akshatpopat/SwastikAI` es un adaptador LoRA (PEFT) entrenado sobre `unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit`, una versión cuantizada a 4 bits del modelo Qwen2.5-3B-Instruct de Alibaba. El fine-tune se realizó mediante Supervised Fine-Tuning (SFT) usando la librería TRL de HuggingFace, con PEFT 0.20.0 y Transformers 5.5.0. El repositorio tiene un tamaño de 0.7 GB y contiene los pesos del adaptador en formato safetensors.

Aunque la model card no detalla el dataset de entrenamiento ni el propósito específico, la web del proyecto `swastikai.in` indica que el modelo está orientado al ámbito legal: permite subir sentencias y escritos judiciales y obtener resúmenes estructurados con hechos, cuestiones, holding, razonamiento y órdenes. Se trata de un ejemplo de adaptación de un modelo pequeño mediante LoRA para un dominio especializado, lo que resulta relevante para desarrolladores que buscan soluciones de bajo coste en legal tech, siempre que se tenga en cuenta que no hay benchmarks públicos que respalden su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-3B-Instruct (Transformer) |
| Parametros totales | no disponible (el modelo base tiene ~3 000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | adaptador LoRA para modelo base cuantizado 4-bit (bnb-4bit) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre un modelo base Qwen2.5-3B-Instruct previamente cuantizado a 4 bits mediante bitsandbytes (bnb-4bit). La arquitectura subyacente es un transformer decoder-only, igual que el modelo base. Al tratarse de un adaptador PEFT, no se modifican todos los pesos del modelo base, sino que se añaden matrices de bajo rango que se entrenan durante el fine-tune. Esto permite un entrenamiento eficiente en memoria y un repositorio de tamaño reducido (0.7 GB).

El proceso de entrenamiento fue Supervised Fine-Tuning (SFT) utilizando la librería TRL, con las siguientes versiones: PEFT 0.20.0, TRL 0.24.0, Transformers 5.5.0, PyTorch 2.11.0+cu128, Datasets 4.3.0 y Tokenizers 0.22.2. No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La única pista sobre el dominio de entrenamiento proviene de la web del proyecto, que sugiere un enfoque en documentos legales, pero esta información no está confirmada en la model card.

## Capacidades

- Generación de texto e instrucciones: hereda las capacidades del modelo base Qwen2.5-3B-Instruct, aunque no se han verificado de forma independiente.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no disponibles.
- Según la web del proyecto, el modelo está orientado a procesar documentos legales y generar resúmenes estructurados (hechos, cuestiones, holding, razonamiento y órdenes), pero esta capacidad no está confirmada en la model card.

## Casos de uso

- Análisis de sentencias judiciales: el modelo puede recibir una sentencia y devolver un resumen estructurado con los hechos, las cuestiones planteadas, el holding y las órdenes. Es adecuado para abogados que necesitan extraer rápidamente la información clave de un fallo.
- Asistencia en redacción de escritos: a partir de un conjunto de hechos, el modelo puede generar borradores de alegaciones o demandas. El fine-tune en dominio legal puede ayudar a adoptar un lenguaje jurídico apropiado.
- Extracción de información de documentos legales: identificar partes, fechas, montos, cláusulas relevantes o referencias normativas en contratos o escritos, lo que facilita la revisión documental.
- Chatbot de consultas legales internas: responder preguntas sobre normativa o jurisprudencia en un entorno controlado, siempre que se supervise la salida para evitar errores.
- Automatización de revisión de contratos: detectar cláusulas de riesgo, obligaciones inusuales o términos ambiguos en contratos extensos, reduciendo el tiempo de revisión manual.
- Generación de briefs para abogados: resumir expedientes largos en formatos concisos y accionables, como una alternativa rápida a la lectura completa del expediente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-6 GB, asumiendo que se carga el modelo base cuantizado 4-bit junto con el adaptador LoRA.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, A10G, A100 o H100. Cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo con cuantización 4-bit.
- Compatibilidad con GPU de consumo: sí, es viable en tarjetas como RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- Opciones de despliegue: Transformers con PEFT (cargando el adaptador sobre el base), vLLM (si se fusiona el adaptador con el modelo base), llama.cpp (si se convierte a formato GGUF) u Ollama (si se empaqueta como modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base Qwen2.5-3B-Instruct es la referencia natural, pero no hay benchmarks publicados para el adaptador que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado. El modelo puede heredar sesgos del dataset de entrenamiento, que no está especificado.
- Riesgo de alucinación: en el dominio legal, las alucinaciones pueden tener consecuencias graves. No se ha evaluado la fiabilidad del modelo, por lo que no debe usarse sin supervisión humana.
- Limitaciones de contexto: la longitud de contexto no está confirmada para este adaptador; depende del modelo base, que soporta hasta 32 768 tokens.
- Restricciones de licencia: la licencia no está indicada, lo que genera incertidumbre sobre el uso comercial.
- Caveat para producción: el modelo no tiene benchmarks públicos, evaluaciones de seguridad ni documentación de datos de entrenamiento. No es adecuado para aplicaciones legales reales sin una validación exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/akshatpopat/SwastikAI
- Web del proyecto: https://swastikai.in/
