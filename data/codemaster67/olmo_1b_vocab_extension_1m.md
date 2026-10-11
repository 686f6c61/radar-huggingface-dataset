# Codemaster67/olmo_1b_vocab_extension_1m

## Resumen

Codemaster67/olmo_1b_vocab_extension_1m es un adaptador QLoRA (PEFT) para modelado de lenguaje del dominio quimico, especializado en cadenas SMILES. No es un modelo completo: se entrena sobre el checkpoint Codemaster67/Olmo-1b_token_extension_modern_molbert, una variante de OLMo-1B con el vocabulario extendido mediante una tokenizacion inspirada en ModernMolBERT. El adaptador se entrena con el dataset Codemaster67/Unichem_1M, con un total de 754 secuencias de entrenamiento empaquetadas y 39 de validacion.

Tecnicamente, se trata de un ajuste por QLoRA: el modelo base se carga en 4 bits (NF4 con doble cuantizacion via bitsandbytes) y sobre el se entrenan matrices LoRA de rango 64 y alpha 128 aplicadas a todas las capas lineales. Ademas, se guardan y entrenan de forma explicita los modulos embed_tokens y lm_head, lo que explica que el repositorio ocupe 1,0 GB pese a ser un adaptador. La relevancia de esta ficha esta en que documenta un caso de uso muy concreto (generacion y completado de SMILES) sobre un modelo pequeno (aproximadamente 1B de parametros) y con licencia Apache 2.0, lo que facilita su despliegue en entornos con recursos limitados.

El modelo esta pensado exclusivamente para el ingles y para el dominio quimico. No se han publicado resultados de benchmarks ni metricas de evaluacion mas alla de las perdidas de entrenamiento (6,3075) y validacion (5,6126). La model card advierte de que la capacidad de seguir instrucciones en lenguaje natural puede degradarse respecto al checkpoint base de OLMo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (OLMo) con adaptador QLoRA/PEFT |
| Parametros totales | Aproximadamente 1B (modelo base OLMo-1B con vocabulario extendido); el adaptador LoRA anade un numero no disponible de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el entrenamiento se realizo con max_seq_length de 512 tokens |
| Tipos de cuantizacion | Base en NF4 4-bit con doble cuantizacion (bitsandbytes); adaptadores en bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base cargado en 4 bits |

## Arquitectura y entrenamiento

El modelo base es un OLMo-1B (familia de transformadores decoder-only desarrollada por el Allen Institute for AI) modificado para extender su vocabulario con una tokenizacion orientada a moleculas (referencia ModernMolBERT). Sobre ese checkpoint se aplica QLoRA: la base se congela en precision NF4 de 4 bits con doble cuantizacion y se entrenan adaptadores LoRA de rango 64, alpha 128 (escala efectiva 2,0) y dropout 0,01 sobre todos los modulos lineales (target_modules: all-linear). RSLoRA esta desactivado. Ademas de los adaptadores, se entrenan y guardan los modulos embed_tokens y lm_head, necesarios para manejar el vocabulario extendido.

El entrenamiento usa el dataset Codemaster67/Unichem_1M, con 1 sola epoca, optimizador AdamW de 8 bits, batch efectivo de 32 (batch por dispositivo 32, acumulacion de gradiente 1), scheduler coseno, warmup ratio 0,1, weight decay 0,01 y gradient checkpointing activado. La tasa de aprendizaje es de 2e-05, aplicada tanto a los adaptadores LoRA como a embed_tokens y lm_head; la model card describe esta ultima como "10x menor" en el texto pero la tabla de hiperparametros muestra el mismo valor para ambos grupos (2e-05), una inconsistencia interna del documento. El 5 % de los datos se reservo para validacion. Los datos se empaquetaron en 754 secuencias de entrenamiento y 39 de validacion con longitud maxima de 512 tokens. No se documenta uso de RLHF, DPO ni tecnicas de alineacion por preferencias humanas.

## Capacidades

- Generacion y completado de cadenas SMILES en notacion quimica, con tokens especiales `<|start_of_smiles|>` y `<|end_of_smiles|>`.
- Modelado de lenguaje causal sobre texto quimico estructurado.
- Punto de partida para fine-tuning posterior orientado a prediccion de propiedades moleculares (segun la seccion "Intended Use" de la model card).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles; no se declara soporte de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Completado de SMILES en pipelines de quimica computacional: dado un fragmento o un esqueleto molecular parcial, el modelo puede generar candidatos de estructura en notacion SMILES, gracias a que el vocabulario base fue extendido especificamente para este tipo de cadenas.
- Preentrenamiento de dominio (CPT) para quimica: el adaptador sirve como base afinada sobre la que aplicar un segundo fine-tuning supervisado para tareas de prediccion de propiedades (solubilidad, toxicidad, actividad biologica), tal y como sugiere el autor.
- Aumento de datos en descubrimiento de farmacos: generacion de SMILES sinteticos plausibles para ampliar conjuntos de datos pequenos antes de entrenar modelos discriminativos.
- Normalizacion y canonicalizacion asistida de representaciones moleculares: uso del modelo para reescribir o completar notaciones SMILES mal formadas dentro de una herramienta de validacion quimica.
- Prototipado en entornos con pocos recursos: al ser un modelo de aproximadamente 1B con adaptador en 4 bits, permite experimentar con modelado quimico en una unica GPU de consumo, sin infraestructura de gran escala.
- Investigacion academica reproducible: licencia Apache 2.0 y pesos en safetensors facilitan reproducir el experimento QLoRA y comparar configuraciones de rango, alpha y tasas de aprendizaje desacopladas.
- Filtrado de candidatos en cribado virtual: uso del modelo para puntuar la verosimilitud de SMILES generados por otros sistemas, descartando cadenas improbables antes de pasarlas a un docking o a una simulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas reportadas son las perdidas del entrenamiento:

| Metrica | Valor |
|---|---|
| Training loss | 6,3075 |
| Validation loss | 5,6126 |
| Epocas | 1 |
| Secuencias empaquetadas de entrenamiento | 754 |
| Secuencias empaquetadas de validacion | 39 |

## Requisitos de hardware

- VRAM estimada para inferencia: al cargar la base de aproximadamente 1B en NF4 4-bit, los pesos ocupan en torno a 0,5-0,8 GB; con activaciones, cache KV y overhead de bitsandbytes, un presupuesto practico de 2-4 GB de VRAM es suficiente para secuencias cortas.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM (por ejemplo RTX 3060, RTX 4060, RTX 4090); tambien A100 o H100 para lotes grandes, aunque estan sobredimensionadas para este tamano.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en tarjetas consumer; incluso es viable en modo CPU con llama.cpp si se convierte el modelo, aunque esto no esta documentado por el autor.
- Opciones de despliegue: transformers + peft + bitsandbytes es la ruta oficial indicada en la model card; el autor proporciona un ejemplo de codigo con `BitsAndBytesConfig`, `AutoModelForCausalLM` y `PeftModel`. No se documenta soporte directo en vLLM, TGI, Ollama o llama.cpp; al tratarse de un adaptador con vocabulario extendido, su conversion a GGUF requeriria pasos adicionales no descritos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Codemaster67/olmo_1b_vocab_extension_1m | ~1B (base) + adaptador LoRA | No disponible (entrenado a 512) | Generacion de SMILES (causal) | Apache 2.0 | HuggingFace (adaptador PEFT) |
| Codemaster67/Olmo-1b_token_extension_modern_molbert (base) | ~1B | No disponible | Modelado de lenguaje quimico | No disponible en la informacion | HuggingFace |
| ChemBERTa (familia) | ~77M-100M | 512 tipicamente | Representaciones y clasificacion molecular (encoder) | No disponible en la informacion | HuggingFace |
| MolT5 | ~300M-700M | 512 tipicamente | Traduccion texto-molecula (encoder-decoder) | No disponible en la informacion | HuggingFace |

Nota: los datos de ChemBERTa y MolT5 se incluyen como referencia de categoria (modelos orientados a quimica molecular), pero no se dispone de cifras comparativas de rendimiento frente a este adaptador, ya que el autor no publica evaluaciones. La comparacion directa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Es un adaptador QLoRA, no un modelo autonomo: requiere cargar el modelo base Codemaster67/Olmo-1b_token_extension_modern_molbert en 4 bits para funcionar. El repositorio por si solo no es utilizable de forma directa.
- El ajuste se realizo exclusivamente sobre cadenas SMILES; la model card advierte de que la capacidad de seguir instrucciones en lenguaje natural puede degradarse respecto al checkpoint base de OLMo.
- Riesgo de alucinacion quimica: el modelo puede generar SMILES sintacticamente validos pero quimicamente inexistentes o inviables. Cualquier salida debe validarse con herramientas de quimioinformatica (por ejemplo RDKit) antes de su uso.
- Sesgos conocidos: no documentados por el autor. Al entrenar sobre un unico dataset (Unichem_1M), la distribucion quimica del modelo esta sesgada hacia ese corpus.
- Limitaciones de idioma: solo se declara ingles; no hay soporte documentado de castellano ni de otros idiomas.
- Limitaciones de contexto: no se especifica la ventana de contexto final; el entrenamiento se limito a 512 tokens, por lo que el rendimiento mas alla de esa longitud no esta garantizado.
- Perdidas de validacion elevadas (5,6126) y una sola epoca: el ajuste es ligero y puede no haber convergido; conviene fine-tuning adicional para tareas concretas.
- Inconsistencia en la model card: el titulo menciona "OLMo-7B", pero el modelo base es de aproximadamente 1B; ademas, el texto afirma una tasa de aprendizaje 10 veces menor para embed_tokens y lm_head, mientras que la tabla muestra el mismo valor (2e-05) para ambos grupos.
- Repositorio sin descargas ni "likes" y sin pipeline declarado: se trata de un experimento sin validacion externa ni comunidad que lo respalde.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se atribuya correctamente; no se imponen restricciones adicionales conocidas.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/Codemaster67/olmo_1b_vocab_extension_1m
- Modelo base: https://huggingface.co/Codemaster67/Olmo-1b_token_extension_modern_molbert
- Dataset de entrenamiento: https://huggingface.co/datasets/Codemaster67/Unichem_1M
- Paper, blog o repositorio adicional: no disponibles en la informacion proporcionada.
