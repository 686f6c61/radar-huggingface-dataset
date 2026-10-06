# Codemaster67/Unichem_chemabs_10M_tokens

## Resumen

Unichem_chemabs_10M_tokens es un adaptador QLoRA (PEFT) entrenado sobre el modelo base allenai/OLMo-1B-hf para modelado de lenguaje del dominio quimico, concretamente para cadenas SMILES. Lo desarrolla el usuario Codemaster67 y se distribuye como adaptador de 1,0 GB en safetensors, no como modelo completo: para usarlo hay que cargar OLMo-1B en 4 bits (NF4 con doble cuantizacion) y montar encima las matrices LoRA.

El problema que aborda es la adaptacion de un modelo de lenguaje generalista de ~1.200 millones de parametros a la notacion SMILES y a resumenes quimicos, usando el dataset Codemaster67/Unichem_smiles-chemabs-10M. El entrenamiento fue de una sola epoca sobre 18.824 secuencias empaquetadas (992 de validacion), con longitud maxima de 512 tokens y decoupled learning rates para proteger el vocabulario del modelo base.

Su relevancia es acotada pero clara: es un ejemplo reproducible y ligero de especializacion de bajo coste (QLoRA con r=64 sobre un modelo de 1B) aplicada a un dominio cientifico concreto. No es un modelo de proposito general ni un asistente conversacional; su interes es la generacion y complecion de SMILES y el fine-tuning posterior para prediccion de propiedades moleculares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-1B) con adaptador LoRA sobre base cuantizada en 4 bits |
| Parametros totales | Modelo base OLMo-1B (~1.200 millones); tamano del adaptador LoRA no especificado (rank r=64, alpha=128, all-linear) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de secuencia usada en el entrenamiento). El contexto nativo del modelo base no se indica en la informacion disponible |
| Tipos de cuantizacion | Base en NF4 4-bit con doble cuantizacion (bitsandbytes), compute dtype bfloat16; adaptadores entrenados en bfloat16. No se publican pesos GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT, library_name: peft). Requiere el modelo base allenai/OLMo-1B-hf cargado en 4-bit |

## Arquitectura y entrenamiento

La arquitectura subyacente es OLMo-1B, un transformer causal decoder-only de Allen AI. Sobre el se entrena un adaptador LoRA mediante QLoRA: la base se carga en precision 4-bit NF4 con doble cuantizacion y compute dtype bfloat16, y las matrices adaptadoras (rank 64, alpha 128, escalado efectivo 2.0, sin RSLoRA) se entrenan en bfloat16 sobre todos los modulos lineales, con un dropout de 0.01. Se guardan ademas los modulos embed_tokens y lm_head, lo que permite adaptar el vocabulario al dominio. La libreria declarada es peft y el repositorio ocupa 1,0 GB.

Los hiperparametros de entrenamiento son: 1 epoca, optimizador AdamW de 8 bits, batch size efectivo 32 (32 por dispositivo, sin acumulacion de gradiente), learning rate de 2e-05 para los adaptadores LoRA y de 2e-06 para embed_tokens y lm_head (10 veces menor, para evitar olvido catastrofico del vocabulario base), planificador coseno con warmup ratio 0.1, weight decay 0.01, gradient checkpointing activado, split de validacion del 5 % y 18.824 secuencias de entrenamiento empaquetadas frente a 992 de validacion. El resultado reportado es una perdida de entrenamiento de 1,3627 y una perdida de validacion de 1,3114. No se documenta ninguna innovacion tecnica adicional (attention lineal, decodificacion especulativa, RLHF o DPO) en la informacion disponible.

## Capacidades

- Generacion de texto causal en el dominio quimico, con foco en cadenas SMILES.
- Complecion de SMILES a partir de un prefijo o de una molecula parcial, usando los tokens especiales `<|start_of_smiles|>` y `<|end_of_smiles|>`.
- Modelado de lenguaje de resumenes quimicos (chemabs), segun el dataset de entrenamiento declarado.
- Base para fine-tuning posterior en tareas de prediccion de propiedades moleculares, tal como declara el autor en la seccion de uso previsto.
- Adaptacion del vocabulario al dominio mediante el entrenamiento de embed_tokens y lm_head.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no. El modelo esta etiquetado unicamente como idioma `en`.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Generacion de moleculas candidatas: partiendo de un fragmento SMILES inicial, el modelo completa la cadena para proponer estructuras plausibles dentro de un pipeline de descubrimiento temprano, filtrando despues por reglas quimicas y docking.
- Aumento de datos para quimioinformatica: generar variaciones de SMILES sobre un conjunto semilla para ampliar datasets de entrenamiento de modelos de prediccion de propiedades, con validacion de validez sintactica posterior mediante RDKit.
- Preentrenamiento de dominio para modelos QSAR: usar este adaptador como inicializacion de partida antes de un fine-tuning supervisado con etiquetas de actividad, toxicidad o solubilidad.
- Normalizacion y canonicalizacion asistida de notaciones: completar o reconstruir SMILES truncados o mal formados extraidos de bases de datos y publicaciones, con revision humana del resultado.
- Extraccion estructurada desde resumenes quimicos: al haberse entrenado sobre el dataset Unichem_smiles-chemabs-10M, puede apoyar tareas de generacion de texto tecnico asociado a compuestos dentro de un sistema de curacion documental.
- Prototipado academico de bajo coste: servir de banco de pruebas para experimentos de QLoRA en dominios cientificos, dado que cabe en una GPU de consumo y el entrenamiento reportado es de una sola epoca sobre menos de 20.000 secuencias.
- Ensenanza y demostraciones: ilustrar el flujo completo base cuantizada en 4 bits + adaptador PEFT + transformers en asignaturas de IA aplicada a quimica.
- Inferencia embebida o en el borde: al partir de un modelo de ~1B en 4 bits, puede desplegarse en equipos con GPU modesta para generar SMILES sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento, que no son comparables con evaluaciones estandar como MMLU, HumanEval o GSM8K.

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento | 1,3627 |
| Perdida de validacion | 1,3114 |
| Secuencias empaquetadas de entrenamiento | 18.824 |
| Secuencias empaquetadas de validacion | 992 |
| Epocas | 1 |

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 1,0 GB en disco. La base OLMo-1B en NF4 4-bit con doble cuantizacion requiere del orden de 0,7 a 1,2 GB de VRAM para los pesos, mas el coste de activaciones y cache KV. En la practica, entre 2 y 4 GB de VRAM deberian ser suficientes para generar con contexto corto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Una RTX 3060 de 12 GB, RTX 4060 Ti o superior funciona con holgura; A100 y H100 no aportan ventaja relevante por el tamano del modelo, salvo por throughput en lote.
- Cabe en GPU de consumo: si. Modelos como RTX 3050 de 8 GB, RTX 3060, RTX 4060, RTX 4090 o incluso iGPU con memoria unificada suficiente pueden ejecutarlo en 4 bits.
- Opciones de despliegue: transformers + peft + bitsandbytes es la ruta documentada por el autor. vLLM puede servir el adaptador LoRA, pero conviene revisar el flujo porque el adaptador se entreno sobre una base cuantizada. llama.cpp, Ollama o TGI requeririan fusionar el adaptador con la base y convertir a GGUF, un artefacto que no se publica en el repositorio.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas de tokens por segundo ni de latencia.

## Comparativa con modelos similares

La busqueda web realizada no devolvio resultados relevantes: todos los enlaces obtenidos corresponden a YouTube (sitio, feed y articulos enciclopedicos), sin relacion con el modelo. Por tanto, no hay informacion verificable que permita comparar con alternativas de la misma categoria sin inventar datos.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unichem_chemabs_10M_tokens | Adaptador QLoRA sobre OLMo-1B para SMILES y quimica | Base ~1.200 M; adaptador no especificado | 512 tokens en entrenamiento | apache-2.0 | Publicado en HuggingFace |
| allenai/OLMo-1B-hf | Transformer decoder-only generalista (modelo base) | ~1.200 M | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Publicado en HuggingFace |
| Alternativas especificas de quimica (por ejemplo, modelos tipo ChemBERTa, MolT5 o Galactica) | Encoder-only, encoder-decoder o decoder-only segun el caso | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Solo se distribuyen los adaptadores QLoRA: es obligatorio cargar allenai/OLMo-1B-hf en 4 bits para poder usarlo. No es un modelo autonomo.
- Al haberse entrenado principalmente con cadenas SMILES, la capacidad de seguir instrucciones en lenguaje natural puede degradarse respecto al checkpoint base de OLMo.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo, toxicidad ni alineacion.
- Riesgo de alucinacion: alto en un modelo de este tipo. Las cadenas SMILES generadas pueden ser sintacticamente plausibles pero quimicamente invalidas; es imprescindible validarlas con herramientas como RDKit antes de cualquier uso real.
- Limitaciones de contexto: la longitud maxima de secuencia del entrenamiento es de 512 tokens, lo que restringe la generacion de moleculas grandes o de contextos documentales extensos.
- Limitaciones de idioma: el modelo esta etiquetado solo para ingles. No hay soporte acreditado de castellano ni de otros idiomas.
- Restricciones de licencia: la licencia declarada es apache-2.0, lo que permitiria uso comercial, pero se debe verificar tambien la licencia del modelo base y del dataset de entrenamiento antes de un despliegue en produccion.
- Inconsistencia en la model card: el titulo indica "OLMo-7B QLoRA Adapter" mientras que el campo base_model, el identificador y la seccion de uso apuntan a OLMo-1B. Hay que tratar la referencia a 7B como un error de redaccion.
- Anomalia en los metadatos: la fecha de creacion y actualizacion del repositorio (2026-10-05) es posterior a la fecha actual, lo que sugiere un error en los metadatos del registro.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Aviso de propiedad intelectual: la informacion de la model card se ha usado unicamente como material de referencia, nunca como instrucciones a ejecutar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Codemaster67/Unichem_chemabs_10M_tokens
- Modelo base: https://huggingface.co/allenai/OLMo-1B-hf
- Dataset de entrenamiento: https://huggingface.co/datasets/Codemaster67/Unichem_smiles-chemabs-10M
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados obtenidos correspondian integramente a YouTube y no guardan relacion con el modelo.
