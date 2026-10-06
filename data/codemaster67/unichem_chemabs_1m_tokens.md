# Codemaster67/Unichem_chemabs_1M_tokens

## Resumen

Unichem_chemabs_1M_tokens es un adaptador QLoRA (Quantized Low-Rank Adaptation) entrenado sobre el modelo base allenai/OLMo-1B-hf para el modelado de lenguaje del dominio quimico, concretamente para cadenas SMILES. Lo publica el usuario Codemaster67 en HuggingFace y esta pensado para generacion y completado de SMILES, asi como para servir de punto de partida en tareas posteriores de prediccion de propiedades moleculares mediante fine-tuning. El problema que aborda es la adaptacion de un modelo causal generalista a la notacion quimica sin necesidad de reentrenar los pesos completos, reduciendo el coste computacional.

Tecnicamente se trata de un transformer decoder-only causal (OLMo-1B) al que se le anaden matrices LoRA de rango 64 y alpha 128 sobre todas las capas lineales, manteniendo el modelo base cargado en 4 bits (NF4 con doble cuantizacion) y entrenando unicamente los adaptadores en bfloat16. El entrenamiento se hizo sobre el dataset Codemaster67/Unichem_smiles-chemabs-1M, con secuencias empaquetadas de 512 tokens y 1877 secuencias de entrenamiento mas 103 de validacion, lo que suma aproximadamente 1 millon de tokens.

Su relevancia actual es limitada pero clara en el nicho de quimioinformatica: ofrece un adaptador pequeno (repo de 1 GB) con licencia Apache 2.0 que cualquiera puede aplicar sobre OLMo-1B en una GPU de consumo. El modelo arrastra, no obstante, algunas inconsistencias en su propia model card (el titulo menciona "OLMo-7B" pese a que el base es OLMo-1B) que conviene tener presentes antes de reutilizarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (OLMo) con adaptadores LoRA; base cargada en 4 bits |
| Parametros totales | No disponible para el adaptador; modelo base OLMo-1B de aproximadamente 1.200 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens durante el entrenamiento; el base OLMo-1B-hf soporta ventanas mayores (consultar model card del base) |
| Tipos de cuantizacion | NF4 4-bit con doble cuantizacion (bitsandbytes); computo en bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT; requiere el base por separado) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT de tipo LoRA entrenado con QLoRA. El base allenai/OLMo-1B-hf se cargo en precision 4-bit NF4 con doble cuantizacion via bitsandbytes, y sobre el se entrenaron matrices LoRA de rango r=64 y alpha=128 (escalado efectivo 2.0), con dropout 0.01 y modulos objetivo all-linear. Ademas, se guardaron y entrenaron los modulos embed_tokens y lm_head con una tasa de aprendizaje decoupled: los adaptadores LoRA a 2e-05 y los embeddings y la cabeza de lenguaje a 2e-06 (diez veces menor), una estrategia destinada a evitar el olvido catastrofico del vocabulario del modelo base.

Los datos de entrenamiento provienen del dataset Codemaster67/Unichem_smiles-chemabs-1M, centrado en cadenas SMILES y anotaciones quimicas. Se realizo una sola epoca con optimizador AdamW de 8 bits, batch efectivo de 32, longitud maxima de secuencia de 512, scheduler coseno, warmup del 10 %, weight decay 0.01 y gradient checkpointing activado. El split de validacion fue del 5 %. Tras el entrenamiento, la perdida de entrenamiento quedo en 1.5805 y la de validacion en 1.4344 (por debajo de la de entrenamiento, lo que sugiere que no hubo sobreajuste severo en esa unica epoca). No se documenta RLHF ni DPO, ni innovaciones tipo decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion y completado de cadenas SMILES, con tokens especiales `<|start_of_smiles|>` y `<|end_of_smiles|>`.
- Modelado de lenguaje causal en el dominio quimico (chemistry-domain language modelling).
- Punto de partida para fine-tuning posterior orientado a prediccion de propiedades moleculares.
- Capacidad residual de generacion de texto en ingles heredada del base OLMo-1B, aunque degradada.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo "thinking".
- Capacidades multilingues: solo ingles segun la metadata.

## Casos de uso

- Generacion de moleculas candidatas: dado un fragmento o un prefijo SMILES con el token `<|start_of_smiles|>`, el modelo completa la cadena, util como generador rapido de estructuras en fases tempranas de descubrimiento.
- Completado de SMILES incompletos: en herramientas de dibujo molecular o editores quimicos, el adaptador puede sugerir terminaciones plausibles de una cadena truncada.
- Preentrenamiento de dominio para quimioinformatica: usar el adaptador como inicializacion de bajo coste antes de fine-tuning especifico sobre tareas como prediccion de solubilidad, toxicidad o logP.
- Aumento de datos: generar variaciones de SMILES para ampliar pequenos conjuntos de datos etiquetados en pipelines de ML supervisado.
- Normalizacion y canonicalizacion asistida: ayudar a completar o reformatear representaciones de moleculas dentro de flujos de limpieza de datos quimicos.
- Prototipado en investigacion academica: al ser un adaptador pequeno sobre un base de 1B en 4 bits, permite experimentar en una unica GPU de consumo sin infraestructura dedicada.
- Educacion y demostraciones: ejemplo didactico de como adaptar un LLM open source a un dominio cientifico con QLoRA y recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la perdida de entrenamiento y validacion:

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento | 1.5805 |
| Perdida de validacion | 1.4344 |
| Secuencias de entrenamiento empaquetadas | 1877 |
| Secuencias de validacion empaquetadas | 103 |

No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks especificos de quimica (como MoleculeNet) en la documentacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: con el base en 4-bit NF4, el modelo ocupa aproximadamente 0,7-1,0 GB para los pesos, mas overhead de activaciones y cache KV; en la practica cabe en GPUs con 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; una RTX 3060, 4060, 2070 o superiores son suficientes. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de gama media.
- Opciones de despliegue: transformers + peft + bitsandbytes (el flujo documentado por el autor). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud de generacion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento que permitan una comparativa cuantitativa fiable. A continuacion se compara cualitativamente con alternativas del mismo nicho, sin afirmar resultados que no esten documentados.

| Modelo | Tipo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Unichem_chemabs_1M_tokens | Adaptador QLoRA sobre OLMo-1B | Base ~1.200 M + LoRA r=64 | 512 (entrenamiento) | Apache 2.0 | SMILES / quimica |
| allenai/OLMo-1B-hf | LLM causal generalista | ~1.200 M | Mayor que 512 (consultar base) | Apache 2.0 | Proposito general |
| ChemBERTa / MolFormer | Modelos de lenguaje quimicos especificos | No disponible | No disponible | No disponible | SMILES / quimica |

No se han encontrado en la busqueda web modelos comparables concretos con los que realizar una comparacion numerica.

## Limitaciones y advertencias

- El adaptador no funciona por si solo: requiere cargar allenai/OLMo-1B-hf en 4 bits para poder aplicarse.
- Entrenado principalmente sobre SMILES, por lo que la capacidad de seguir instrucciones en lenguaje natural puede degradarse respecto al checkpoint base de OLMo.
- Inconsistencia documentada: el titulo de la model card menciona "OLMo-7B" aunque el modelo base real es OLMo-1B-hf. Hay que tratar la descripcion con cautela.
- Entrenamiento de una sola epoca y aproximadamente 1 millon de tokens: es un ajuste ligero, no un modelo de dominio exhaustivo.
- Ventana de contexto de 512 tokens durante el entrenamiento, limitada para moleculas o documentos quimicos extensos.
- Solo ingles en la metadata; no se garantiza comportamiento en otros idiomas.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir cadenas SMILES sintacticamente plausibles pero quimicamente invalidas o inexistentes. Requiere validacion con herramientas de quimioinformatica como RDKit.
- Sin resultados de benchmarks publicos que respalden su calidad.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Licencia Apache 2.0, favorable para uso comercial, aunque el modelo base y las dependencias (bitsandbytes, peft) pueden tener sus propias condiciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Codemaster67/Unichem_chemabs_1M_tokens
- Dataset de entrenamiento: https://huggingface.co/datasets/Codemaster67/Unichem_smiles-chemabs-1M
- Modelo base OLMo-1B: https://huggingface.co/allenai/OLMo-1B-hf
- Repositorio del dataset (pagina de modelo, segun busqueda): https://huggingface.co/Codemaster67/Unichem_smiles-chemabs-1M
