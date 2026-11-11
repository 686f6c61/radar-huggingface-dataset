# Sebastianpro88/Chichu-3-0-beta

## Resumen

Chichu 3.0 Beta es un ajuste fino (fine-tune) conversacional del modelo meta-llama/Llama-3.2-3B-Instruct, desarrollado por Sebastianpro88 bajo el sello ChichuLabs. El modelo se distribuye exclusivamente como build GGUF para inferencia local mediante llama.cpp y LM Studio, con un unico archivo cuantizado en Q4_K_M de aproximadamente 2 GB. Su proposito declarado es la conversacion general y el roleplay de personajes ficticios.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.2 3B Instruct, con 3.212.749.888 parametros totales y un vocabulario de 128.256 tokens. Los idiomas declarados son ingles y espanol, aunque la propia model card advierte que el uso principal es el ingles y que el espanol se aborda de forma tentativa. La licencia aplicable es la Llama 3.2 Community License, heredada del modelo base.

Su relevancia es limitada y de nicho: se trata de un experimento de ajuste fino publicado en fase beta, sin benchmarks independientes ni evaluacion de calidad multilingue o de seguridad. Resulta util como caso de estudio de fine-tuning sobre Llama 3.2 3B y para pruebas de roleplay en local, pero no como modelo de produccion sin evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 3B Instruct) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.2 3B Instruct soporta 128K tokens; la model card no lo confirma para este fine-tune) |
| Tipos de cuantizacion | Q4_K_M (unico build subido) |
| Idiomas soportados | en, es (ingles principal; espanol tentativo) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en Llama 3.2 3B Instruct, un transformer decoder-only con atencion por grupos (GQA) y un vocabulario de 128.256 tokens. Chichu 3.0 Beta es un ajuste fino de dicho checkpoint orientado a conversacion y roleplay de personajes ficticios, segun indica la model card. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT supervisado.

La model card incluye varias notas tecnicas relevantes: GGUF es fundamentalmente un formato de inferencia, por lo que la mayoria de herramientas de fine-tuning y edicion de pesos operan sobre checkpoints de Hugging Face Transformers; una exportacion a FP16 de un GGUF ya cuantizado no recupera la precision perdida; y el tamano de vocabulario (128.256 tokens) no debe confundirse con la ventana de contexto. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con soporte tentativo de espanol.
- Roleplay de personajes ficticios mediante character cards y contexto explicito, manteniendo continuidad si el prompt lo permite.
- Asistencia de escritura y brainstorming segun los usos previstos declarados.
- Inferencia local mediante llama.cpp (llama-cli con modo conversacional `-cnv`) y LM Studio.
- Plantilla de chat compatible con Llama 3.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Roleplay de personajes ficticios en local: el modelo esta ajustado explicitamente para dialogo de personajes con character cards; se usaria con un system prompt que defina el personaje y mantenga continuidad, ejecutandolo en llama.cpp o LM Studio sobre hardware de consumo.
- Prototipado de asistentes conversacionales: sirve para iterar rapidamente sobre prompts, temperaturas y plantillas de chat en un entorno local antes de comprometerse con un modelo mayor, gracias a su tamano de 3B parametros y su build Q4_K_M de 2 GB.
- Experimentacion con fine-tuning: al partir de Llama 3.2 3B Instruct y distribuirse en GGUF, es util como referencia para comparar el comportamiento del checkpoint base frente al ajustado en tareas de conversacion.
- Asistencia de escritura creativa: generacion de dialogos y borradores de ficcion en ingles, con el modelo actuando como copiloto de escritura en sesiones locales sin dependencia de API.
- Pruebas de inferencia en hardware modesto: su cuantizacion Q4_K_M permite desplegarlo en equipos con recursos limitados para validar pipelines de llama.cpp, plantillas de chat y parametros de muestreo.
- Evaluacion de calidad de fine-tunes de nicho: como caso beta sin benchmarks, permite construir un protocolo de evaluacion propio (consistencia de personaje, alucinacion, cambio de idioma) antes de adoptar variantes derivadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que esta beta no ha sido evaluada de forma independiente en precision, calidad multilingue ni seguridad.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2 GB para el build Q4_K_M, segun el tamano del archivo distribuido; el consumo real depende de la longitud de contexto, el backend y los parametros de inferencia (la model card no aporta cifras adicionales).
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el build Q4_K_M es compatible con GPUs de consumo con al menos 4 GB de VRAM, aunque esta estimacion no procede de datos publicados por el autor.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 4 GB o mas de VRAM para el build Q4_K_M; no confirmado por el autor.
- Opciones de despliegue: llama.cpp (llama-cli con `-cnv`), LM Studio. Otros backends (vLLM, TGI, Ollama) no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Chichu 3.0 Beta | 3.212.749.888 | no disponible (base: 128K) | GGUF Q4_K_M | Llama 3.2 Community | Fine-tune conversacional/roleplay, sin benchmarks |
| meta-llama/Llama-3.2-3B-Instruct | 3B | 128K | safetensors, GGUF | Llama 3.2 Community | Modelo base; instrucciones generales, multilingue oficial |
| Fine-tunes comunitarios de Llama 3.2 3B | ~3B | variable | GGUF | Llama 3.2 Community | Ecosistema amplio; calidad muy variable y a menudo sin evaluar |

No se dispone de datos de rendimiento comparativo para Chichu 3.0 Beta, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Version beta: el autor advierte que el comportamiento y la calidad pueden variar y que deben evaluarse las salidas antes de confiar en ellas.
- Alucinacion: la model card reconoce que el modelo puede inventar informacion, malinterpretar instrucciones y perder consistencia de personaje.
- Idiomas: el ingles es el idioma principal; el espanol es tentativo y no esta evaluado.
- Sin benchmarks: no hay evaluacion independiente de precision, calidad multilingue ni seguridad.
- Contexto: la model card no confirma la ventana de contexto efectiva del fine-tune; no debe asumirse la del modelo base sin verificacion.
- Licencia: uso y redistribucion sujetos a la Llama 3.2 Community License, incluidos los requisitos de atribucion; revisar antes de publicar checkpoints derivados.
- Formato: al distribuirse solo en GGUF Q4_K_M, no es directamente reentrenable sin el checkpoint original; una exportacion a FP16 no recupera la precision perdida en la cuantizacion.
- Consejo profesional: no debe tratarse como fuente fiable de asesoramiento profesional ni de verificacion factica.
- Adopcion: 0 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sebastianpro88/Chichu-3-0-beta
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
