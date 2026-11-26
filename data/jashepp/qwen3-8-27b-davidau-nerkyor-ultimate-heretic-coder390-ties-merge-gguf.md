# jashepp/Qwen3.8-27B-DavidAU-nerkyor-Ultimate-Heretic-Coder390-ties-merge-GGUF

## Resumen

Qwen3.8-27B-DavidAU-nerkyor-Ultimate-Heretic-Coder390-ties-merge-GGUF es un merge de dos modelos Qwen3.8 de 27B de parametros, publicado por el usuario jashepp en Hugging Face. Combina el modelo base DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored (orientado a razonamiento, modos instruct y seguimiento de instrucciones) con nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2 (especializado en generacion de codigo y recuperacion de contexto). El objetivo declarado es preservar la estructura de razonamiento y el seguimiento de instrucciones del primero e inyectar la "agudeza" en codigo del segundo.

El merge se realizo con mergekit mediante el metodo TIES (arxiv:2306.01708), anclando embeddings, normas, lm_head y capas de atencion al modelo base, e inyectando los deltas de parametros principalmente en los bloques mlp intermedios. El resultado es un modelo de 27.318.209.536 parametros (unos 27,3B) con licencia Apache-2.0, publicado en formato GGUF con cuantizaciones BF16, Q8_0, Q6_K y Q4, todas ellas con soporte MTP (multi-token prediction).

La relevancia de esta ficha es doble: por un lado, es un ejemplo practico de merge de modelos con TIES para combinar capacidades complementarias (razonamiento e instrucciones frente a codigo); por otro, esta empaquetado como GGUF listo para llama.cpp y LM Studio, lo que lo hace desplegable en hardware de consumo. El repositorio tiene 138 GB y acumula 4.368 descargas y 4 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8), merge TIES de dos modelos Qwen3.8-27B |
| Parametros totales | 27.318.209.536 (27,3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4 (con MTP e imatrix) |
| Idiomas soportados | Ingles (segun metadatos de la model card); otros idiomas no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (BF16, Q8_0, Q6_K, Q4); repo de 138 GB |

## Arquitectura y entrenamiento

El modelo es un merge de pesos, no un entrenamiento desde cero. Se construyo con mergekit aplicando el metodo TIES, que poda los deltas de parametros (truncando los valores pequenos), resuelve los conflictos de signo entre modelos y combina las magnitudes ponderadas. El modelo base y la fuente del tokenizer es DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored, con densidad 1.00, peso mlp base 1.0 y atencion base. El segundo modelo, nerkyor/Qwen3.8-27B-Coder390-EfficientThink, aporta con densidad 0.55, peso mlp 0.22 y atencion ligera (0.00-0.05). La receta concentra las inyecciones en los bloques mlp intermedios para reforzar codigo, seguimiento de instrucciones y recuperacion de contexto, mientras mantiene embeddings, normas, lm_head y atencion anclados al modelo base.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de post-entrenamiento (RLHF, DPO u otros) de los modelos originales en la informacion proporcionada. Si se indica que el modelo incorpora modos de razonamiento de Turbo Brilliance heredados del base, y que las cuantizaciones incluyen MTP (multi-token prediction) e imatrix, lo que sugiere decodificacion especulativa y calibracion de cuantizacion por importancia de pesos. El modelo base nerkyor incluye en su nombre indicios de SFT, RLOO, MTP y DFlash2, pero no se detalla su funcionamiento.

## Capacidades

- Generacion de texto conversacional y de instrucciones en ingles.
- Razonamiento con modos de "thinking" y cadena de pensamiento (chain-of-thought), heredados de Turbo Brilliance.
- Generacion de codigo y asistencia en tareas de programacion (el segundo modelo aporta "coding sharpness" y razonamiento de casos limite).
- Seguimiento de instrucciones (instruction-following) reforzado segun las pruebas A/B del autor.
- Recuperacion de contexto (context recall) mejorada segun el autor.
- Soporte de tool calling / uso de herramientas y flujos agenticos (etiquetas agentic y tool-use).
- Compatibilidad con clientes agenticos como Pi, OpenCode y Hermes mediante un super-adapter LoRA opcional.
- Capacidades multilingues: solo se declara ingles; no hay datos de otros idiomas.

## Casos de uso

- Asistencia de codigo en local: el modelo puede generar, revisar y depurar codigo en un entorno de desarrollo integrado conectado a llama.cpp o LM Studio, aprovechando la inyeccion de capacidades de codigo del modelo nerkyor y su soporte de tool calling.
- Agente de programacion multi-paso: al soportar tool-use y razonamiento encadenado, puede orquestar tareas como leer un repositorio, ejecutar pruebas y proponer parches en un bucle agentico.
- Razonamiento y resolucion de problemas tecnicos: los modos de pensamiento de Turbo Brilliance permiten abordar problemas de logica, matematicas o diseno de algoritmos con trazas de razonamiento explicitas.
- Chat de soporte tecnico para desarrolladores: con seguimiento de instrucciones y recuperacion de contexto, puede mantener conversaciones multi-turno sobre APIs, errores y configuracion.
- Entornos con requisitos de privacidad: al ser desplegable en GGUF sobre hardware local, permite ejecutar el modelo sin enviar codigo ni datos a servicios en la nube.
- Prototipado rapido de pipelines de IA: sirve como modelo de referencia para probar integraciones con clientes agenticos (Pi, OpenCode, Hermes) y comparar el efecto del super-adapter LoRA en la sintaxis de tool calls.
- Educacion y experimentacion con merges: su receta mergekit publica permite reproducir, inspeccionar o iterar el merge para estudiar el efecto de TIES en la combinacion de capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona pruebas A/B con la misma semilla que indican mejoras en seguimiento de instrucciones y recuperacion de contexto, pero no aporta cifras numericas (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 requiere aproximadamente 55 GB (tamano del fichero 54,7 GB); Q8_0 unos 29 GB; Q6_K y Q4 no se detallan en la informacion disponible, pero por el patron habitual serian del orden de 22-23 GB y 15-17 GB respectivamente (estimacion, no dato confirmado).
- GPU recomendadas: para BF16, A100 80 GB o H100; para Q8_0, una RTX 4090 (24 GB) no basta y se necesitaria una GPU de 32 GB o mas (A100 40 GB, L40S) o repartir entre varias GPU; para Q6_K y Q4 es plausible que quepa en una RTX 4090 de 24 GB, aunque no se confirma en la informacion.
- Cabe en GPU de consumo: probablemente en Q4 y Q6_K sobre RTX 4090 o RTX 3090 (24 GB), sujeto a verificacion; BF16 y Q8_0 no caben en GPUs de consumo de 24 GB.
- Opciones de despliegue: llama.cpp, LM Studio (etiquetados explicitamente), y por compatibilidad de formato GGUF tambien otros runners basados en llama.cpp; el repo declara endpoints_compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este merge (jashepp) | 27,3B | No disponible | GGUF (BF16, Q8_0, Q6_K, Q4) | Apache-2.0 | Merge TIES de razonamiento + codigo |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored | 27B (aprox.) | No disponible | No disponible en la informacion | No disponible | Base del merge; razonamiento Turbo Brilliance |
| nerkyor/Qwen3.8-27B-Coder390-EfficientThink | 27B (aprox.) | No disponible | No disponible en la informacion | No disponible | Segundo componente; foco en codigo |
| Qwen3.8-27B stock (familia Qwen) | 27B (aprox.) | No disponible | No disponible en la informacion | No disponible | Referencia de la familia base |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer una comparativa cuantitativa; la comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Al ser un merge de pesos, no se ha validado con un conjunto de evaluacion independiente; el rendimiento puede degradarse en tareas fuera del dominio de codigo e instrucciones.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay evaluacion publicada de tasas de alucinacion.
- Idiomas: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta verificado.
- Longitud de contexto: no se especifica en la informacion proporcionada; conviene consultar la model card del base antes de usarlo en tareas de contexto largo.
- Contenido: el modelo base se describe como "Heretic Uncensored", lo que sugiere un alineamiento de seguridad reducido; no es adecuado para aplicaciones orientadas a publico sin filtros adicionales.
- Licencia Apache-2.0 permite uso comercial, pero las condiciones de los modelos originales y de los datos de entrenamiento no se detallan; conviene revisar las fichas de los modelos base.
- El soporte de tool calling puede requerir el super-adapter LoRA opcional para clientes con sintaxis especifica (Pi, OpenCode, Hermes); sin el, la compatibilidad puede ser parcial.
- Las cuantizaciones Q4 y Q6_K no tienen tamanos confirmados en la informacion; las estimaciones de VRAM son orientativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jashepp/Qwen3.8-27B-DavidAU-nerkyor-Ultimate-Heretic-Coder390-ties-merge-GGUF
- Modelo base DavidAU: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- GGUF del base DavidAU (Turbo Brilliance): https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Modelo base nerkyor: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Super-adapter LoRA para tool calling: https://huggingface.co/jashepp/Qwen3.8-27B-super-adapter-Quants-LoRA-GGUF
- Merge de 4 modelos del mismo autor: https://huggingface.co/jashepp/Qwen3.8-27B-4x-ties-merge-brilliance-coder390-cybersecurity-veriloop-GGUF
- Merge de 5 modelos del mismo autor: https://huggingface.co/jashepp/Qwen3.8-27B-5x-ties-merge-brilliance-omnisre-coder390-cybersecurity-veriloop-GGUF
- Coleccion de modelos Qwen de DavidAU: https://huggingface.co/collections/DavidAU/qwen-36-reg-uncensored-9b-12b-21b-27b-40b
- Coleccion Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Paper TIES: https://arxiv.org/abs/2306.01708
- Repositorio mergekit: https://github.com/arcee-ai/mergekit
- Licencia Apache-2.0: https://choosealicense.com/licenses/apache-2.0/
