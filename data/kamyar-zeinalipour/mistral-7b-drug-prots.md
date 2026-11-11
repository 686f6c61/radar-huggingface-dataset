# Kamyar-zeinalipour/mistral-7b-drug-prots

## Resumen

mistral-7b-drug-prots es un checkpoint intermedio (Stage I) del proyecto PharMistral, desarrollado por Kamyar Zeinalipour y colaboradores (Universidad de Siena y otros), que adapta Mistral-7B-v0.3 al dominio del descubrimiento de farmacos mediante preentrenamiento conjunto sobre secuencias de proteinas no apareadas y moleculas pequenas tipo farmaco. El objetivo del proyecto es generar moleculas candidatas condicionadas por la secuencia de una diana proteica novel, un problema central en el diseno de farmacos basado en estructura y secuencia.

Este checkpoint concreto no es el modelo final: es la primera etapa de un proceso de dos fases. La segunda etapa, mistral-7b-drug-prots_pair, anade el ajuste fino condicionado por secuencia sobre pares proteina-ligando de alta afinidad extraidos de ChEMBL-26. Por tanto, este modelo esta pensado como base para experimentacion y para reproducir el pipeline, no como generador condicionado listo para usar.

La relevancia actual radica en que aplica un transformer decoder de 7B parametros, con contexto extendido a 1.500 tokens y un tokenizer especifico de proteinas y moleculas, a un dominio cientifico donde los modelos generalistas rinden mal. La licencia Apache 2.0 facilita su reutilizacion en investigacion, aunque el autor restringe explicitamente el uso a investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Mistral-7B-v0.3), adaptado por preentrenamiento de dominio |
| Parametros totales | 7,24 mil millones (aproximado, derivado de Mistral-7B-v0.3; el campo safetensors del repo indica 266.240, dato inconsistente con el tamano del repo de 14,5 GB) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 1.500 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (no se documentan en la model card; al ser safetensors en fp16/bf16 es convertible a GGUF/AWQ/GPTQ con herramientas estandar) |
| Idiomas soportados | no disponible (el dominio es secuencias de proteinas y SMILES, no lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Mistral-7B-v0.3, un transformer decoder denso con atencion de ventana deslizante y RoPE, y se somete a un preentrenamiento conjunto sobre secuencias de proteinas no apareadas y moleculas pequenas tipo farmaco (dataset Protein-drug-v2). Se trata de la Stage I de un pipeline de dos etapas: la Stage II realiza ajuste fino condicionado por secuencia sobre pares proteina-ligando de alta afinidad de ChEMBL-26 (dataset Protein-drug-pair-v2).

Los hiperparametros documentados son: longitud de secuencia 1.500, batch size efectivo de 4 con 4 pasos de acumulacion de gradiente, 4 GPUs, learning rate 5e-5 con decaimiento coseno y tasa de fill-in-the-middle de 0,5. El modelo requiere un tokenizer especifico, drug-prot-tokenizer-v2-mistral, que tokeniza tanto aminoacidos como representaciones de moleculas. No se documentan tecnicas adicionales como RLHF, DPO o decodificacion especulativa.

## Capacidades

- Modelado de lenguaje sobre secuencias de proteinas y moleculas pequenas (SMILES u otra representacion quimica) en un unico espacio de tokens.
- Relleno de huecos (fill-in-the-middle) en secuencias, gracias a la tasa FIM de 0,5 durante el entrenamiento.
- Generacion de texto autoregresiva sobre el vocabulario quimico-biologico del tokenizer especifico.
- Base para ajuste fino condicionado por secuencia (la Stage II anade la generacion de ligandos dada una diana proteica).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues en lenguaje natural: no disponibles.

## Casos de uso

- Preentrenamiento de dominio para modelos de quimica: servir como inicializacion para ajustes finos posteriores en tareas de generacion molecular, aprovechando que ya ha visto secuencias de proteinas y farmacos.
- Reproduccion del pipeline PharMistral: punto de partida documentado para replicar la Stage I antes de entrenar la Stage II con pares proteina-ligando.
- Modelado de secuencias proteicas: completar o generar fragmentos de secuencias mediante la capacidad FIM, util en anotacion exploratoria.
- Filtrado y scoring de moleculas candidatas: usar la perplejidad del modelo sobre moleculas propuestas como senal heuristica de "farmaco-likeness" dentro de un pipeline de cribado virtual.
- Investigacion en tokenizacion cientifica: evaluar el comportamiento del tokenizer drug-prot-tokenizer-v2-mistral frente a tokenizers de proposito general en secuencias biologicas.
- Generacion de hipotesis computacionales en hit discovery: producir moleculas candidatas que, tras la Stage II, se someten a evaluacion de quimica medicinal y seguridad (siempre como hipotesis no sintetizadas).
- Docencia y experimentacion academica: modelo de tamano manejable (7B) con licencia permisiva para cursos y proyectos de NLP cientifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: aproximadamente 14-15 GB, coherente con el tamano del repo (14,5 GB).
- VRAM en cuantizacion 8 bits: en torno a 8 GB; en 4 bits: en torno a 5-6 GB (estimaciones derivadas del tamano de parametros, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y ajuste fino; A10G, L40S o RTX 4090 para inferencia en fp16.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16 y en GPUs de 8 GB con cuantizacion 4 bits.
- Despliegue: compatible con vLLM, TGI y llama.cpp/Ollama tras conversion a GGUF; requiere cargar el tokenizer drug-prot-tokenizer-v2-mistral en lugar del tokenizer estandar de Mistral.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Notas |
|---|---|---|---|---|---|
| mistral-7b-drug-prots (este) | 7B | 1.500 tokens | Proteinas y moleculas (Stage I) | Apache 2.0 | Checkpoint intermedio, no condicionado por secuencia |
| mistral-7b-drug-prots_pair | 7B | 1.500 tokens | Proteinas y moleculas (Stage II) | Apache 2.0 | Modelo final condicionado por secuencia del mismo proyecto |
| mistralai/Mistral-7B-v0.3 | 7B | 32.768 tokens | Lenguaje general | Apache 2.0 | Modelo base; no especializado en quimica ni biologia |
| Modelos de generacion molecular especificos (p. ej. variantes de ChemBERTa o MolT5) | variable | no disponible | Moleculas | variable | No se dispone de comparacion cuantitativa en la informacion proporcionada |

## Limitaciones y advertencias

- Es un checkpoint intermedio: no genera moleculas condicionadas por una diana proteica; para eso se requiere la Stage II (mistral-7b-drug-prots_pair).
- Uso previsto exclusivamente de investigacion: las moleculas generadas son hipotesis computacionales no sintetizadas ni testadas, y requieren evaluacion de quimica medicinal, seguridad y regulatoria.
- Riesgo de alucinacion elevado en un dominio donde las salidas deben ser quimicamente validas; no hay garantia de validez estructural de las secuencias generadas.
- Contexto limitado a 1.500 tokens, insuficiente para proteinas largas o contextos multi-documento.
- No se documentan sesgos, idiomas soportados ni evaluaciones de seguridad; ausencia de benchmarks publicados en la informacion disponible.
- El campo de parametros del repo (266.240) es inconsistente con el tamano del modelo y el repo de 14,5 GB; conviene verificar los pesos antes de desplegar.
- Requiere un tokenizer no estandar; usar el tokenizer de Mistral por defecto producira resultados incorrectos.
- Licencia Apache 2.0 permite uso comercial segun los terminos, pero el autor restringe explicitamente el uso a investigacion en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/Kamyar-zeinalipour/mistral-7b-drug-prots
- Modelo Stage II: https://huggingface.co/Kamyar-zeinalipour/mistral-7b-drug-prots_pair
- Tokenizer: https://huggingface.co/Kamyar-zeinalipour/drug-prot-tokenizer-v2-mistral
- Dataset Stage I: https://huggingface.co/datasets/Kamyar-zeinalipour/Protein-drug-v2
- Dataset Stage II: https://huggingface.co/datasets/Kamyar-zeinalipour/Protein-drug-pair-v2
- Paper: https://doi.org/10.1016/j.cmpbup.2026.100257
- Repositorio de codigo: https://github.com/KamyarZeinalipour/PharMistral
- Scripts de entrenamiento: https://github.com/KamyarZeinalipour/PharMistral/tree/main/scripts
- Coleccion en Hugging Face: https://huggingface.co/collections/Kamyar-zeinalipour/pharmistral-cmpb-update-2026-6af48fca521e8481db608782
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
