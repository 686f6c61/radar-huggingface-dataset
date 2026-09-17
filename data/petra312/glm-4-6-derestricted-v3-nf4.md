# petra312/GLM-4.6-Derestricted-v3-NF4

## Resumen

GLM-4.6-Derestricted-v3-NF4 es una version cuantizada a 4 bits del modelo ArliAI/GLM-4.6-Derestricted-v3, que a su vez deriva de zai-org/GLM-4.6. Lo publica el usuario petra312 y se distribuye como un derivado de cuantizacion, no como un modelo reentrenado. La arquitectura es de tipo mezcla de expertos (MoE) sobre transformer (categoria glm4_moe), con un total de 352.797.829.024 parametros, 92 capas y 160 expertos enrutados.

La cuantizacion emplea NF4 con doble cuantizacion mediante bitsandbytes, y esta disenada para un despliegue hibrido: atencion, embeddings, MLP densas de las tres primeras capas, expertos compartidos, router y lm_head residen en una unica GPU de 24 a 32 GB, mientras que los pesos NF4 de los expertos enrutados (aproximadamente 160 expertos por 89 capas MoE) se mantienen en RAM de CPU. El repositorio ocupa 183,4 GB, de los cuales la mayor parte corresponde a esos expertos alojados en memoria del sistema.

Su relevancia actual radica en que permite ejecutar un MoE de mas de 350.000 millones de parametros en hardware prosumer combinando VRAM y RAM, siguiendo un esquema de offload de expertos similar a Unsloth o llama.cpp. A cambio, impone requisitos estrictos de version de libreria y de codigo personalizado que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre transformer, categoria glm4_moe |
| Parametros totales | 352.797.829.024 (aprox. 352,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (4 bits, doble cuantizacion) con bitsandbytes; modelo base en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (cuantizados en NF4), con codigo de modelado personalizado (modeling_glm4_moe.py) |
| Numero de capas | 92 (la capa MTP 92 se omite) |
| Expertos enrutados | 160 |
| Tamano del repositorio | 183,4 GB |
| Modelo base | ArliAI/GLM-4.6-Derestricted-v3; zai-org/GLM-4.6 |

## Arquitectura y entrenamiento

Se trata de una arquitectura MoE de tipo glm4_moe con 92 capas y 160 expertos enrutados, en la que las tres primeras capas usan MLP densas (parametro first_k_dense_replace) y el resto incorporan router y expertos compartidos. Los expertos no estan fusionados en tensores 3D gate_up_proj, sino que se conservan como gate_proj, up_proj y down_proj por experto, de modo que bitsandbytes pueda aplicarles NF4. La capa MTP 92 se omite porque Glm4MoeForCausalLM no la utiliza. El archivo modeling_glm4_moe.py incluido en el repositorio devuelve los logits del router, lo que mantiene operativos observadores de expertos tipo REAP.

Este repositorio no documenta un proceso de entrenamiento propio: es una cuantizacion posterior al entrenamiento (PTQ) aplicada a los pesos de ArliAI/GLM-4.6-Derestricted-v3. No se proporcionan datos sobre composicion del dataset, numero de tokens, ni sobre si el modelo base empleo RLHF o DPO. Los pesos BF16 originales permanecen sin cambios en la model card de origen; este repo es unicamente un derivado cuantizado. La innovacion tecnica destacable es el reparto hibrido GPU/CPU de los expertos para reducir la huella de VRAM.

## Capacidades

- Generacion de texto: el pipeline declarado es text-generation y la libreria es transformers.
- Conversacion multi-turno: el repositorio incluye la etiqueta conversational.
- Compatibilidad con endpoints: el modelo lleva la etiqueta endpoints_compatible.
- Inferencia MoE con offload GPU/CPU: parte de los pesos se ejecuta en la GPU y los expertos enrutados en RAM.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-step: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue autoalojado de un MoE de gran tamano en hardware prosumer: el modelo permite servir generacion de texto con una sola GPU de 24 a 32 GB y una cantidad elevada de RAM de sistema, colocando atencion y componentes densos en la GPU y los expertos enrutados en CPU.
- Inferencia privada on-premise: al no requerir servicios en la nube, encaja en escenarios donde los datos no pueden salir de la infraestructura propia, siempre que se acepte el coste de RAM del sistema.
- Investigacion sobre cuantizacion NF4 en MoE: sirve como objeto de estudio para medir el impacto de la doble cuantizacion y del offload de expertos en la calidad de salida frente al modelo BF16.
- Base para fine-tuning eficiente con QLoRA/PEFT: el formato NF4 es el adecuado para tecnicas de ajuste con adaptadores de bajo rango sobre un modelo congelado.
- Experimentacion con esquemas de offload de expertos: el reparto explicito de expertos por capa permite reproducir y comparar estrategias tipo Unsloth o llama.cpp MoE-offload.
- Aplicaciones conversacionales multi-turno: dada su etiqueta conversational, es utilizable en asistentes de texto, condicionado a la ventana de contexto real del modelo base (no documentada aqui).
- Evaluacion comparativa de derivados: permite contrastar la calidad del modelo "Derestricted" cuantizado frente a su version BF16 y frente a GLM-4.6 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 24 a 32 GB en la GPU para embeddings, atencion, MLP densas de las tres primeras capas, expertos compartidos, router y lm_head.
- RAM de sistema: elevada, coherente con un repositorio de 183,4 GB cuya mayor parte son expertos enrutados alojados en CPU. No se especifica una cifra exacta; se requiere una cantidad de RAM del sistema del orden del volumen de expertos NF4.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB), A100 (40/80 GB), H100.
- Compatibilidad con GPU de consumo: si, en RTX 3090 y RTX 4090 (24 GB), siempre que se disponga de RAM de sistema suficiente.
- Opciones de despliegue: transformers 4.57.6 con bitsandbytes y accelerate; el autor menciona un esquema estilo Unsloth / llama.cpp MoE-offload. No se debe usar transformers 5.x, porque fusiona los expertos de GLM en parametros 3D y bitsandbytes no puede cuantizarlos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| petra312/GLM-4.6-Derestricted-v3-NF4 | 352,8 B | NF4 4 bits (bitsandbytes) | MIT | HuggingFace, requiere transformers 4.57.x y trust_remote_code |
| ArliAI/GLM-4.6-Derestricted-v3 | aprox. 352,8 B (no confirmado en esta ficha) | BF16 | no disponible en la informacion proporcionada | HuggingFace (modelo base) |
| zai-org/GLM-4.6 | aprox. 352,8 B (no confirmado en esta ficha) | BF16 | no disponible en la informacion proporcionada | HuggingFace (modelo base) |

No se dispone de datos de benchmark ni de contexto para comparar rendimiento entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de precision por cuantizacion: la conversion a NF4 de 4 bits puede degradar la calidad respecto a los pesos BF16 originales.
- Dependencia de version: requiere transformers 4.57.x; con transformers 5.x la cuantizacion de expertos no es viable.
- Codigo personalizado: el uso exige trust_remote_code=True y el archivo modeling_glm4_moe.py del repositorio.
- Consumo de RAM del sistema: el reparto de expertos en CPU implica un requisito elevado de memoria del sistema que puede limitar el despliegue en maquinas estandar.
- Naturaleza "Derestricted": al derivar de una version sin restricciones, es previsible una reduccion del alineamiento de seguridad y un mayor riesgo de generar contenido nocivo; se recomienda evaluar antes de cualquier uso en produccion.
- Alucinacion: no se documenta mitigacion especifica; al ser un LLM de generacion, mantiene el riesgo habitual de inventar informacion.
- Idiomas: no se especifican los idiomas soportados.
- Licencia: la ficha indica MIT, lo que en principio permite uso comercial; conviene verificar los terminos de los modelos base (ArliAI/GLM-4.6-Derestricted-v3 y zai-org/GLM-4.6).
- Sin datos de rendimiento: no hay benchmarks publicados que respalden el comportamiento del modelo cuantizado.
- Capa MTP omitida: la capa 92 no se usa, lo que puede afectar a tecnicas que dependan de decodificacion especulativa multi-token.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/petra312/GLM-4.6-Derestricted-v3-NF4
- Modelo base (version Derestricted): https://huggingface.co/ArliAI/GLM-4.6-Derestricted-v3
- Modelo original: https://huggingface.co/zai-org/GLM-4.6
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente referencias a la comuna francesa de Aigne, sin relacion con el contenido).
