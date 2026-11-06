# Aracei/gemma-3-4b-RP-Lora-F16-GGUF

## Resumen

Aracei/gemma-3-4b-RP-Lora-F16-GGUF es la conversion a formato GGUF (precision F16) del adaptador LoRA `bunnycore/gemma-3-4b-RP-Lora`, un ajuste fino orientado a role-play (RP) construido sobre la familia Gemma 3 de Google. No se trata de un modelo completo, sino de un adaptador LoRA que debe aplicarse sobre los pesos base de Gemma 3 4B en tiempo de inferencia mediante la opcion `--lora` de llama.cpp. La conversion la ha realizado el usuario Aracei a traves del espacio GGUF-my-lora de ggml.ai, lo que permite usar el adaptador directamente en el ecosistema llama.cpp sin necesidad de fusionarlo con el modelo base.

El interes de esta publicacion es practico: facilita el despliegue de un ajuste fino de role-play en entornos locales con llama.cpp, sin requerir GPU de gran capacidad ni pipelines de fusion de pesos. El adaptador hereda las capacidades del modelo base Gemma 3 4B (arquitectura transformer decoder-only, contexto largo y soporte multilingue), aunque la model card solo declara ingles como idioma. La licencia declarada es Apache 2.0, lo que elimina las restricciones de uso comercial habituales en la familia Gemma.

Conviene subrayar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y que el campo de parametros reportado en safetensors (14.901.248) corresponde al tamano del adaptador LoRA, no al modelo base. Se trata, por tanto, de un artefacto de nicho, sin validacion comunitaria ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 4B) con adaptador LoRA |
| Parametros totales | 14.901.248 (adaptador LoRA; el modelo base Gemma 3 4B no se incluye en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Gemma 3 4B) |
| Tipos de cuantizacion | F16 (unico archivo publicado) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA en F16) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango convertido a GGUF mediante el espacio GGUF-my-lora de ggml.ai. La arquitectura subyacente es la del modelo base Gemma 3 4B: un transformer decoder-only con atencion por ventanas deslizantes y atencion global alternadas, disenado por Google DeepMind. El adaptador modifica un subconjunto de matrices de proyeccion del modelo base mediante descomposicion de bajo rango, lo que permite cargarlo de forma separada en llama.cpp con el flag `--lora`.

No se dispone de informacion sobre el dataset de entrenamiento del adaptador original (`bunnycore/gemma-3-4b-RP-Lora`), el numero de tokens utilizados, la composicion de los datos de role-play ni si se aplicaron tecnicas de RLHF, DPO o SFT. La model card del repositorio de Aracei remite explicitamente al repositorio del adaptador original para mas detalles, pero no reproduce esa informacion. Tampoco se documenta el rango del LoRA, el alpha, los modulos objetivo ni la estrategia de entrenamiento (por ejemplo, si se uso Unsloth, que aparece en los tags). La unica innovacion tecnica documentada es el propio proceso de conversion a GGUF para su uso con llama.cpp.

## Capacidades

- Generacion de texto con estilo conversacional y de role-play, segun el ajuste fino del adaptador.
- Razonamiento general y respuesta a instrucciones heredados del modelo base Gemma 3 4B.
- Soporte de conversaciones multi-turno, adecuado para personajes y simulaciones dialogicas.
- Capacidades multilingues del modelo base, aunque la model card solo declara ingles.
- Capacidades de codigo y matematicas del modelo base, no reforzadas por el adaptador.
- No se documenta soporte de tool calling ni function calling especifico en el adaptador.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito.
- No se documenta modo thinking, vision ni audio en este adaptador (aunque Gemma 3 base incluye variantes multimodales, este ajuste es solo de texto).
- Uso mediante llama.cpp (CLI y servidor) con carga de LoRA en tiempo de inferencia.

## Casos de uso

- Role-play local en escritorio: cargar Gemma 3 4B en llama.cpp con `--lora gemma-3-4b-RP-Lora-f16.gguf` permite mantener conversaciones de personaje en una maquina de consumo, sin depender de servicios en la nube.
- Prototipado de chatbots de ficcion interactiva: el adaptador aporta un tono narrativo y de personaje que el modelo base no tiene de serie, util para validar guiones y flujos antes de invertir en un ajuste propio.
- Servidor de inferencia ligero con `llama-server`: se puede exponer una API compatible con OpenAI para integrar el personaje en una aplicacion web o movil, manteniendo los pesos en local.
- Evaluacion comparativa de adaptadores RP: al ser un GGUF F16, sirve como referencia de calidad frente a otras cuantizaciones (Q4, Q8) del mismo adaptador para medir la perdida por cuantizacion.
- Experimentacion academica sobre LoRA: permite estudiar como un adaptador de bajo rango modifica el comportamiento de un modelo base de 4B en tareas de dialogo, sin reentrenar.
- Base para fusion y reempaquetado: el adaptador puede fusionarse con Gemma 3 4B para producir un modelo completo con el estilo RP, reutilizable en otros runtimes (vLLM, TGI) una vez convertido.
- Demos offline en entornos sin conectividad: al ejecutarse con llama.cpp sobre CPU o GPU modesta, es viable en portatiles y equipos de gama media para demostraciones de role-play.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Gemma 3 4B, no del adaptador. En F16, el modelo base ronda los 8 GB de pesos; en Q4_K_M, alrededor de 2,5-3 GB. El adaptador F16 anade una cantidad marginal (del orden de decenas de MB, dado su tamano de ~15 M de parametros).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o superiores para el modelo base en F16; A100/H100 no son necesarias para un 4B.
- Cabe en GPU de consumo: si, en la mayoria de GPUs con 8 GB o mas en cuantizaciones Q4/Q5/Q8; en F16 requiere al menos 8-10 GB libres.
- Opciones de despliegue: llama.cpp (CLI y servidor) es el runtime documentado; tambien es posible fusionar el adaptador con el modelo base y usar vLLM, TGI u Ollama, aunque no se documenta en la model card.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aracei/gemma-3-4b-RP-Lora-F16-GGUF | Adaptador LoRA (~15 M) sobre Gemma 3 4B | no disponible | apache-2.0 | GGUF | Adaptador RP, requiere modelo base |
| bunnycore/gemma-3-4b-RP-Lora | Adaptador LoRA sobre Gemma 3 4B | no disponible | no disponible | safetensors | Origen del adaptador convertido |
| Gemma 3 4B (Google) | 4B | no disponible en la informacion | Gemma license | safetensors, GGUF | Modelo base generalista |

No se dispone de datos de rendimiento ni de benchmarks para establecer una comparacion cuantitativa con alternativas de role-play.

## Limitaciones y advertencias

- El repositorio no incluye el modelo base; sin Gemma 3 4B los pesos del adaptador no son utilizables por si solos.
- No hay benchmarks, evaluaciones ni validacion comunitaria (0 descargas, 0 likes), por lo que la calidad del ajuste RP no esta contrastada.
- La model card no documenta el dataset de entrenamiento, lo que impide evaluar sesgos, toxicidad o calidad de los datos.
- Riesgo de alucinacion inherente a los modelos de 4B, especialmente en tareas factuales y de razonamiento complejo.
- El adaptador esta orientado a role-play; su uso en tareas de produccion serias (atencion al cliente, codigo) puede degradar el rendimiento respecto al modelo base.
- Solo se declara ingles como idioma; el comportamiento en castellano no esta validado.
- La licencia Apache 2.0 se declara sobre el adaptador, pero el uso del modelo base Gemma 3 esta sujeto a los terminos de Google; conviene revisar la compatibilidad antes de un despliegue comercial.
- El formato GGUF F16 del adaptador no incluye cuantizaciones alternativas; para entornos con poca memoria habria que cuantizar el propio adaptador o fusionarlo y cuantizar el modelo completo.
- No se documenta el rango ni los modulos objetivo del LoRA, lo que dificulta reproducir el entrenamiento o auditar el ajuste.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Aracei/gemma-3-4b-RP-Lora-F16-GGUF
- Adaptador original: https://huggingface.co/bunnycore/gemma-3-4b-RP-Lora
- Espacio GGUF-my-lora: https://huggingface.co/spaces/ggml-org/gguf-my-lora
- Documentacion del servidor llama.cpp: https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
