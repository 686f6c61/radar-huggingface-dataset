# mradermacher/Kitsune-Symphony-V0.0-12B-GGUF

## Resumen

Kitsune-Symphony-V0.0-12B-GGUF es la version cuantizada en formato GGUF del modelo Kitsune-Symphony-V0.0-12B, un merge de modelos de la familia Mistral orientado a roleplay y generacion de dialogos conversacionales. El trabajo de cuantizacion lo firma mradermacher, un prolifico publicador de versiones GGUF de la comunidad, a partir del modelo original de MrRikyz. El modelo cuenta con 12.247.782.400 parametros, lo que lo situa en la franja de los 12B, y esta publicado bajo licencia Apache 2.0.

La relevancia de esta ficha reside en que se trata de un modelo especializado en roleplay (RP) y conversacion, con etiquetas explicitas de contenido NSFW y no apto para todas las audiencias. No es un modelo de proposito general ni compite en benchmarks de razonamiento o codigo: su valor esta en la coherencia de personaje, el mantenimiento de contexto narrativo y el estilo de escritura creativa. La version GGUF permite ejecutarlo en hardware de consumo mediante llama.cpp y derivados.

La informacion tecnica disponible es limitada: la model card del cuantizador se centra en el proceso de cuantizacion y no incluye detalles sobre arquitectura, datos de entrenamiento, contexto o benchmarks. Esta ficha recoge lo que se puede verificar y marca explicitamente como "no disponible" todo aquello que no consta en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Mistral, segun etiquetas del modelo; detalles no disponibles) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base es un merge construido con mergekit, segun las etiquetas de la model card. Las etiquetas indican que deriva de la familia Mistral, lo que sugiere una arquitectura transformer decoder-only con atencion por ventanas deslizantes y atencion completa combinadas, aunque no se detalla la configuracion concreta (numero de capas, dimensiones ocultas, cabezas de atencion ni tamano de contexto). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o fine-tuning supervisado en el modelo original.

El proceso de cuantizacion realizado por mradermacher es de tipo "static" (cuantizacion estatica, sin imatrix), segun los metadatos del README. El autor indica que dispone de cuantizaciones ponderadas con imatrix en un repositorio separado (Kitsune-Symphony-V0.0-12B-i1-GGUF), que suelen ofrecer mejor calidad que las estaticas de tamano equivalente. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional y narrativo, con enfasis en roleplay y mantenimiento de personaje.
- Escritura creativa y ficcion interactiva en ingles.
- Dialogo multi-turno orientado a la coherencia de personaje y estilo narrativo.
- Contenido NSFW explicito (el modelo esta etiquetado como no apto para todas las audiencias).
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que facilita su despliegue en infraestructuras de inferencia estandar.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Roleplay conversacional: el modelo esta disenado especificamente para mantener personajes coherentes en conversaciones multi-turno, por lo que se emplearia como motor de chatbots de rol con system prompts detallados que definan personalidad y trasfondo.
- Ficcion interactiva y novelas visuales: integrado en un motor de narrativa ramificada, generaria respuestas de personajes y descripciones de escena manteniendo el tono y el estilo definidos en el prompt de sistema.
- Generacion de dialogos para guiones y prototipos de videojuegos: util para producir borradores de conversaciones entre personajes con voces diferenciadas, que luego se revisan y editan manualmente.
- Asistente de escritura creativa en ingles: para autores que necesitan explorar variaciones de escenas, dialogos o desarrollos de personaje, con la ventaja de ejecutarse localmente en hardware de consumo.
- Despliegue local con llama.cpp u Ollama: la version Q4_K_M (7,6 GB) permite ejecutar el modelo en GPUs de consumo de 8-12 GB de VRAM, lo que lo hace adecuado para prototipado offline y entornos sin conectividad.
- Experimentacion con merges de modelos: investigadores interesados en evaluar el comportamiento de merges de la familia Mistral orientados a RP pueden usar esta version cuantizada para comparar calidad frente al modelo base en safetensors con menor coste de hardware.
- Filtrado y moderacion de contenido: dado su entrenamiento en contenido NSFW, puede emplearse como generador de casos de prueba para sistemas de moderacion, aunque esta aplicacion requiere supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K ni otras), y el modelo base esta orientado a roleplay, una tarea para la que no existen benchmarks estandarizados ampliamente aceptados.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: 4,9 GB
  - Q3_K_S: 5,6 GB
  - Q3_K_M: 6,2 GB
  - Q3_K_L: 6,7 GB
  - IQ4_XS: 6,9 GB
  - Q4_K_S: 7,2 GB
  - Q4_K_M: 7,6 GB
  - Q5_K_S: 8,6 GB
  - Q5_K_M: 8,8 GB
  - Q6_K: 10,2 GB
  - Q8_0: 13,1 GB
- GPU recomendadas: no disponible en la informacion proporcionada. Como referencia general para un modelo de 12B en GGUF, las cuantizaciones Q4 caben en GPUs de consumo con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB), mientras que Q8_0 requiere 16 GB o mas (RTX 4080, RTX 4090, A100, H100). Esta estimacion es orientativa y no procede de la model card.
- Cabe en GPU de consumo: si, en cuantizaciones Q4 y Q5 con GPUs de 8-12 GB; las cuantizaciones Q6 y Q8 requieren GPUs de gama alta o 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, text-generation-webui). El modelo base en safetensors es compatible con transformers y, presumiblemente, con vLLM y TGI, aunque no se documenta explicitamente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Kitsune-Symphony-V0.0-12B-GGUF | 12,2B | no disponible | Apache 2.0 | Roleplay / RP, NSFW | GGUF en HF; base en safetensors |
| Modelos Mistral 7B / Mistral Nemo 12B | 7B / 12B | 32K / 128K (segun version) | Apache 2.0 | Proposito general | Amplia, multiples formatos |
| Merges RP de la comunidad (familia Mistral) | variable (7B-12B) | variable | variable | Roleplay | GGUF y safetensors en HF |

La comparacion con modelos de proposito general como Mistral 7B o Mistral Nemo no es directa: Kitsune-Symphony esta especializado en roleplay y no se espera que iguale a los modelos generalistas en razonamiento, codigo o matematicas. No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Contenido NSFW: el modelo esta etiquetado como no apto para todas las audiencias y entrenado para generar contenido explicito. No es adecuado para aplicaciones orientadas a publico general sin filtrado y moderacion.
- Idiomas: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Alucinacion: como todo modelo generativo, puede producir afirmaciones factuales incorrectas, especialmente fuera de contextos narrativos o de roleplay.
- Sesgos: no se documentan evaluaciones de sesgo; los merges de la comunidad suelen heredar los sesgos de los modelos de origen, que no se detallan.
- Contexto: se desconoce la longitud de contexto efectiva; para roleplay de sesiones largas conviene verificar empiricamente el comportamiento antes de desplegar.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede ser NSFW y el despliegue debe cumplir la legislacion aplicable y las politicas de la plataforma.
- Origen del merge: al ser un merge comunitario sin documentacion de entrenamiento, la trazabilidad de datos y la reproducibilidad son limitadas.
- Version V0.0: la nomenclatura sugiere un estado temprano; es previsible que existan versiones posteriores con cambios de comportamiento.
- Cuantizacion estatica: las versiones de este repositorio no usan imatrix; para mayor calidad a igual tamano, el autor recomienda las cuantizaciones del repositorio i1.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Kitsune-Symphony-V0.0-12B-GGUF
- Modelo base: https://huggingface.co/MrRikyz/Kitsune-Symphony-V0.0-12B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Kitsune-Symphony-V0.0-12B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Kitsune-Symphony-V0.0-12B-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
