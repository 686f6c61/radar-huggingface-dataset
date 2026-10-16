# Maximilian228/Qwen3.8-Flash-Next-NVFP4-GPTQ-Strata

## Resumen

Qwen3.8-Flash-Next-NVFP4-GPTQ-Strata es una cuantizacion del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario Maximilian228 y empaquetada especificamente para el motor de inferencia Strata NVFP4 (libreria declarada en HuggingFace: `strata`). El autor describe el modelo original como una MoE hibrida de 125 B, mientras que los metadatos safetensors del repositorio cuantizado declaran 51.200.245.760 parametros totales; esa discrepancia entre ambas cifras no queda explicada en la informacion disponible. El objetivo de esta ficha es dejar claro que no se trata de un modelo nuevo, sino de un artefacto de cuantizacion con un proposito muy concreto: ejecutar un MoE grande en hardware de consumo.

La tesis del autor es que cuantizando todos los expertos enrutados a NVFP4 mediante GPTQ se conserva un 93,6 % de coincidencia en el token mas probable respecto a la referencia Q8_0, con 177 tokens/s de decodificacion y 3,9 s para procesar un prompt de 32.007 tokens, usando 69 GiB de RAM en uso sobre un PC de 96 GB. Con ello, el modelo cabe segun el autor en una sola GPU RTX de la serie 20 a 50 con 12 GB o mas de VRAM, delegando los expertos en CPU y RAM.

Es relevante ahora porque muestra una via practica para servir MoE de gran tamano en equipos de un solo usuario, y porque la model card publica una comparativa medida frente a otras cuantizaciones del mismo modelo base (Q8_0 propia, mezcla NVFP4+Q8_0, NVFP4 de NVIDIA, GGUF de Unsloth y quants de ISTA-DASLab), lo que permite calibrar el compromiso entre fidelidad numerica, velocidad y consumo de memoria. Los datos de busqueda web obtenidos no contienen informacion util sobre este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (descrita por el autor como "hybrid MoE"); el detalle de los componentes hibridos no esta disponible |
| Parametros totales | 51.200.245.760 (51,2 B) segun metadatos safetensors del repositorio; la model card describe el modelo base como una MoE hibrida de 125 B (discrepancia no aclarada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card mide un prompt de 32.007 tokens, por lo que soporta al menos 32K) |
| Tipos de cuantizacion | NVFP4 (4,5 bits por peso) en todos los expertos enrutados, cuantizados con GPTQ desde el checkpoint BF16; 63,3 GiB de expertos. Precision de atencion, router y embeddings en esta variante: no disponible |
| Idiomas soportados | en, zh |
| Licencia | qwen-community-1.0 (declarada como `license: other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | safetensors, empaquetados para el motor Strata NVFP4 (metadatos safetensors reales; el repositorio incluye la etiqueta `gguf` por el ecosistema del proyecto) |
| Modelo base | Qwen/Qwen3.8-Flash-Next (BF16, revision `de4b8e4d`) |
| Relacion con el base | quantized |
| Tamano del repositorio | 128,8 GB |
| Descargas / likes | 46.910 descargas y 14 likes |
| Fecha de publicacion | creado el 2026-10-09, actualizado el 2026-10-11 |

## Arquitectura y entrenamiento

El artefacto no implica entrenamiento: es una cuantizacion post-entrenamiento del checkpoint BF16 de Qwen/Qwen3.8-Flash-Next, sin pesos de terceros segun el autor ("no other model's weights are in it"). La cadena declarada es Qwen/Qwen3.8-Flash-Next (BF16, revision `de4b8e4d`) a esta cuantizacion. El modelo base se describe como una MoE hibrida con expertos enrutados y etiquetas que incluyen `moe` y `mtp`; esta ultima sugiere soporte de multi-token prediction, aunque la model card no lo detalla y el dato debe tratarse como una etiqueta del repositorio, no como una especificacion confirmada.

La innovacion tecnica del artefacto es el esquema de cuantizacion: todos los expertos enrutados se convierten a NVFP4 (4,5 bits por peso, 63,3 GiB de expertos) mediante GPTQ partiendo de BF16, y se empaquetan para Strata NVFP4. El autor indica que el resultado tiene el mismo formato, tamano y coste de decodificacion que la conversion NVFP4 de NVIDIA (nvidia/Qwen3.8-Flash-Next-NVFP4), pero con codigos y escalas distintos, ya que NVIDIA redondea cada peso al valor NVFP4 mas cercano. En la medicion de fidelidad, esta variante GPTQ alcanza un 93,6 % de coincidencia de token mas probable frente a la referencia Q8_0, por debajo de la mezcla NVFP4+Q8_0 (95,0 %) y del GGUF UD-Q4_K_XL de Unsloth (94,1 %), y por encima del NVFP4 de NVIDIA convertido a Strata (92,9 %). No se documentan detalles del dataset de entrenamiento del modelo base, ni fases de RLHF/DPO, ni numero de tokens vistos.

## Capacidades

- Generacion de texto: pipeline declarado `text-generation`; la model card se centra en chats cortos (hasta 1.500 tokens) y en lectura de contexto largo (32.007 tokens).
- Razonamiento y codigo: la evaluacion de fidelidad se midio sobre 5.153 tokens de codigo, documentacion, chats en ingles y ucraniano y transcripciones de agentes, lo que indica uso previsto en codigo y flujos de agente.
- Procesamiento de contexto largo: se reporta lectura de un prompt de 32.007 tokens en 3,9 s en la configuracion de referencia.
- Soporte de agentes: el autor menciona "agent transcripts" como parte del material de evaluacion, lo que apunta a uso en trazas de agentes, aunque no se documentan capacidades explicitas de tool calling o function calling.
- Capacidades multilingues: idiomas declarados en y zh en las etiquetas; el conjunto de evaluacion incluye ademas texto en ucraniano, sin que el ucraniano figure como idioma oficialmente soportado.
- Multi-token prediction: etiqueta `mtp` presente en el repositorio; sin detalle en la model card.
- No se declaran capacidades de vision ni de audio.

## Casos de uso

- Despliegue local de un MoE grande en una sola GPU de consumo: el artefacto esta disenado para ejecutarse en una RTX de la serie 20 a 50 con 12 GB o mas de VRAM y 64 GB o mas de RAM, con lo que un equipo de sobremesa puede servir un modelo que de otro modo requeriria varios aceleradores.
- Asistencia de codigo en local con contexto amplio: con lectura de 32K tokens en 3,9 s y 177 tokens/s de decodificacion, es viable indexar un repositorio mediano y responder sobre el manteniendo conversaciones de hasta 1.500 tokens por turno.
- Analisis de documentacion larga: la ventana de al menos 32K tokens permite resumir y extraer informacion de manuales, contratos o especificaciones tecnicas sin trocear el documento en exceso.
- Trazas de agentes y evaluacion de pipelines: el autor usa transcripciones de agentes como corpus de medida, por lo que el modelo es adecuado para reproducir y depurar bucles de agente en local antes de pasar a produccion.
- Laboratorio de cuantizacion: sirve como referencia practica para comparar fidelidad entre esquemas (NVFP4 con GPTQ, NVFP4 nativo de NVIDIA, mezclas NVFP4+Q8_0 y GGUF de 2 a 4 bits) sobre un mismo modelo base.
- Prototipado con presupuesto de memoria ajustado: en un PC de 64 GB, el autor reporta que el modelo arranca en modo de baja RAM con unos 115 tokens/s de decodificacion y unos 9 s de lectura de un prompt de 32K, lo que permite trabajar sin adquirir un equipo de 128 GB.
- Inferencia en ingles y chino: al ser los dos idiomas declarados, es adecuado para productos dirigidos a esos mercados, no asi para otros idiomas sin evaluacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni equivalentes). Lo que si se publica es una medicion de fidelidad de cuantizacion y de velocidad, comparando variantes del mismo modelo base. La metrica de fidelidad es la frecuencia con la que el token mas probable del modelo coincide con el de la referencia Q8_0, medida sobre 5.153 tokens con el mismo texto de entrada, todos con los expertos en CPU y el "route tail skip" desactivado. La velocidad se midio en un equipo con RTX 5090 (32 GB), Ryzen 9 9950X3D, 128 GB de DDR5-5600 y Windows 11, con mediana de 3 ejecuciones sobre 4 chats greedy de hasta 1.500 tokens y un prompt de 32.007 tokens.

| Modelo o cuantizacion | Coincidencia de token top vs Q8_0 | Decodificacion (tokens/s) | Prompt de 32K | RAM en uso | PC necesario |
|---|---|---|---|---|---|
| Q8_0 propia (`qwen-q8`) | 100 % (referencia) | 47 | 10,3 s | 106 GiB | 128 GB |
| NVFP4 + Q8_0 mix (`qwen-nvfp4-mix`) | 95,0 % | 91 | 4,2 s | 105 GiB | 128 GB |
| Unsloth UD-Q4_K_XL | 94,1 % | 169 | 4,9 s | 77 GiB | 96 GB |
| Esta variante: NVFP4 GPTQ (`qwen-nvfp4-gptq`) | 93,6 % | 177 | 3,9 s | 69 GiB | 96 GB |
| NVIDIA NVFP4 convertido a Strata (`qwen-nvidia-nvfp4`) | 92,9 % | 167 | 3,9 s | 69 GiB | 96 GB |
| Unsloth UD-Q3_K_XL | 90,7 % | 208 | 3,8 s | 58 GiB | 96 GB |
| ISTA-DASLab IQ3_S | 90,0 % | 228 | 3,9 s | 52 GiB | 64 GB |
| ISTA-DASLab IQ3_XXS | 87,3 % | 239 | 3,9 s | 45 GiB | 64 GB |
| ISTA-DASLab IQ2_XS | 85,0 % | 265 | 4,2 s | 38 GiB | 48 GB |
| ISTA-DASLab Q2_0 | 84,1 % | 256 | 3,9 s | 37 GiB | 48 GB |

Notas del autor que afectan a la lectura de la tabla: los modelos GGUF aplican por defecto el "route tail skip" del proyecto upstream, lo que acelera la decodificacion en torno a un 10 % pero aleja algo mas las respuestas de la referencia Q8_0; los expertos de UD-Q3_K_XL son i-quants pese al nombre (gate/up IQ3_XXS con down IQ4_NL o Q8_0); y en un PC de 64 GB las variantes NVFP4 decodifican a unos 115 tokens/s con lectura de 32K en unos 9 s en modo de baja RAM.

## Requisitos de hardware

- VRAM: el autor indica que basta una tarjeta RTX de la serie 20 a 50 con 12 GB o mas de VRAM; los expertos se apoyan en CPU y RAM.
- RAM: 69 GiB en uso en la configuracion medida; el autor recomienda un PC con 96 GB instalados para sostener esa velocidad con Windows en marcha. En un equipo de 64 GB funciona en modo de baja RAM, con unos 115 tokens/s de decodificacion y unos 9 s de lectura de un prompt de 32K.
- Configuracion de referencia de las mediciones: RTX 5090 (32 GB), Ryzen 9 9950X3D, 128 GB de DDR5-5600, Windows 11.
- GPU recomendadas por el autor: cualquier RTX de la serie 20 a 50 con 12 GB o mas de VRAM. No se mencionan A100 ni H100 en la informacion disponible.
- Cabe en GPU de consumo: si, segun el autor, incluidas tarjetas de 12 GB, porque los expertos residen en RAM del sistema.
- Motor de despliegue: exclusivamente Strata NVFP4 (github.com/sergqwer/strata-nvfp4). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio; el ecosistema GGUF se cubre con los repositorios de Unsloth y de ISTA-DASLab.
- Arranque rapido en Windows: desde la release de Strata NVFP4, ejecutar `START-HERE.bat --family qwen-nvfp4-gptq`, que comprueba el equipo, descarga el repositorio y arranca el modelo.
- Latencia y throughput: 177 tokens/s de decodificacion y 3,9 s para un prompt de 32.007 tokens en el equipo de referencia; en un PC de 64 GB, unos 115 tokens/s y unos 9 s respectivamente.
- Disco: el repositorio ocupa 128,8 GB, por lo que se necesita ese espacio libre para la descarga.

## Comparativa con modelos similares

No se dispone de comparativas con modelos de otros desarrolladores en la informacion proporcionada. La comparativa disponible es entre cuantizaciones del mismo modelo base, que compiten directamente por el mismo nicho de despliegue local.

| Variante | Formato y motor | Peso de los expertos | RAM en uso | Decodificacion | Licencia del artefacto |
|---|---|---|---|---|---|
| Esta: NVFP4 GPTQ | Strata NVFP4 | NVFP4, 63,3 GiB, 4,5 bits por peso | 69 GiB | 177 tokens/s | qwen-community-1.0 |
| NVIDIA NVFP4 convertido | Strata NVFP4 | NVFP4, mismo tamano | 69 GiB | 167 tokens/s | qwen-community-1.0 |
| NVFP4 + Q8_0 mix | Strata NVFP4 | mezcla | 105 GiB | 91 tokens/s | qwen-community-1.0 |
| Q8_0 propia | Strata NVFP4 | Q8_0 en todos los expertos | 106 GiB | 47 tokens/s | qwen-community-1.0 |
| Unsloth UD-Q4_K_XL y UD-Q3_K_XL | GGUF (llama.cpp y derivados) | 4 y 3 bits aprox. | 77 y 58 GiB | 169 y 208 tokens/s | no disponible en esta ficha |
| ISTA-DASLab IQ3_S / IQ3_XXS / IQ2_XS / Q2_0 | GGUF | 3 bits e inferiores | 52 a 37 GiB | 228 a 256 tokens/s | no disponible en esta ficha |

## Limitaciones y advertencias

- Discrepancia de parametros: los metadatos safetensors declaran 51,2 B de parametros y la model card describe el base como una MoE de 125 B. Conviene verificar cual es la cifra correcta antes de dimensionar el hardware.
- No hay benchmarks de calidad: la unica metrica publicada es la coincidencia del token mas probable frente a Q8_0, que mide fidelidad de cuantizacion, no capacidad real en tareas (razonamiento, codigo o matematicas).
- Dependencia de un motor especifico: el artefacto solo funciona con Strata NVFP4. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, lo que limita el despliegue en infraestructura estandar y ata el modelo al mantenimiento de ese proyecto.
- Idoneidad para produccion no demostrada: las mediciones son de un unico equipo de sobremesa, con Windows 11 y una sola GPU, y no incluyen concurrencia, batches grandes ni pruebas de estabilidad prolongada.
- Idiomas: solo en y zh estan declarados. Aunque la evaluacion incluye texto en ucraniano, no hay garantia de calidad en otros idiomas, incluido el castellano.
- Alucinacion: no se publican tasas de alucinacion ni evaluaciones de veracidad; al ser una cuantizacion de 4,5 bits, cabe esperar una degradacion adicional respecto al modelo en BF16.
- Licencia: qwen-community-1.0 con `license: other`. Es una licencia de comunidad con condiciones especificas que deben revisarse en el fichero LICENSE antes de cualquier uso comercial; esta ficha no puede confirmar si el uso comercial esta permitido.
- Sesgos: no hay informacion sobre sesgos del modelo base ni sobre su evaluacion en seguridad o contenido danino.
- Efecto del "route tail skip": en los modelos GGUF comparados altera ligeramente la fidelidad respecto a la referencia; si se combinan herramientas del ecosistema, conviene fijar la configuracion exacta usada en las mediciones.
- Consumo de disco: 128,8 GB de repositorio mas el modelo base si se descarga aparte.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Maximilian228/Qwen3.8-Flash-Next-NVFP4-GPTQ-Strata
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor Strata NVFP4: https://github.com/sergqwer/strata-nvfp4
- Variante Q8_0 del mismo autor: https://huggingface.co/Maximilian228/Qwen3.8-Flash-Next-Q8_0-Strata
- Variante NVFP4 + Q8_0 mix del mismo autor: https://huggingface.co/Maximilian228/Qwen3.8-Flash-Next-NVFP4-Q8-Mix-Strata
- Conversion de NVIDIA NVFP4 para Strata: https://huggingface.co/Maximilian228/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Strata
- NVFP4 original de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- GGUF de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Paper, blog o demo oficial de la cuantizacion: no disponible en la informacion proporcionada.
