# deepseek-ai/DeepSeek-V2-Lite

## Resumen

DeepSeek-V2-Lite es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek AI, presentado el 15 de mayo de 2024 como una version reducida del modelo DeepSeek-V2. Cuenta con 16.000 millones de parametros totales y solo 2.400 millones de parametros activos por token, lo que lo situa en un regimen de computo por token comparable al de un modelo denso de ~2,4B pero con la capacidad de representacion de una red mucho mayor. Emplea la arquitectura propietaria MLA (Multi-head Latent Attention) combinada con DeepSeekMoE, y fue entrenado desde cero con 5,7 billones de tokens.

Su relevancia radica en que materializa dos innovaciones tecnicas del paper de DeepSeek-V2 en un tamano desplegable: MLA comprime la cache KV en un vector latente, reduciendo drasticamente el coste de memoria en inferencia con contextos largos, mientras que DeepSeekMoE permite entrenar e inferir a un coste economico mediante computo disperso. Segun la model card, es desplegable en una sola GPU de 40 GB y ajustable (fine-tuning) en 8 GPU de 80 GB.

La version publicada en el repositorio `deepseek-ai/DeepSeek-V2-Lite` es el modelo base (no el ajustado por instrucciones). Para uso conversacional existe una variante separada, `DeepSeek-V2-Lite-Chat`, ajustada con SFT. El modelo supera en varios benchmarks en ingles y chino a modelos densos de 7B y a un MoE de 16B previo de la misma casa. La longitud de contexto es de 32.000 tokens y la licencia es la DeepSeek Model License, de tipo propietario y no estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con MLA (Multi-head Latent Attention) y DeepSeekMoE |
| Parametros totales | 15.706.484.224 (~15,7B) |
| Parametros activos | 2,4B por token |
| Longitud de contexto | 32.000 tokens (32k) |
| Tipos de cuantizacion | no disponible en la model card oficial |
| Idiomas soportados | no se declara lista oficial; benchmarks publicados en ingles y chino |
| Licencia | DeepSeek Model License (license: other, license_name: deepseek) |
| Formato de pesos | safetensors (repo de 31,4 GB) |
| Biblioteca | transformers (requiere custom_code) |
| Tipo de modelo | Base (no ajustado por instrucciones) |

## Arquitectura y entrenamiento

DeepSeek-V2-Lite emplea un transformer de tipo Mixture-of-Experts con dos componentes diferenciadores. El primero es MLA (Multi-head Latent Attention), que proyecta las claves y valores en un vector latente comprimido en lugar de almacenar la cache KV completa, reduciendo de forma significativa la memoria consumida durante la generacion autoregresiva en contextos largos. El segundo es DeepSeekMoE, un esquema de enrutamiento disperso que activa una fraccion reducida de los parametros por token (2,4B de 16B), lo que abarata el computo por token frente a un modelo denso equivalente en parametros totales.

El modelo fue entrenado desde cero con 5,7 billones de tokens (5.7T), segun la model card. Esta version es la base, por lo que no incluye ajuste por instrucciones ni alineacion por RLHF en el repositorio `DeepSeek-V2-Lite`; el ajuste SFT se publico por separado en `DeepSeek-V2-Lite-Chat`. La model card no detalla la composicion exacta del dataset ni la mezcla de idiomas de entrenamiento.

Conviene tener en cuenta una advertencia explicita del propio autor: debido a las limitaciones de la implementacion en HuggingFace, el codigo open source rinde mas lento que su base de codigo interna, y recomiendan usar su solucion dedicada sobre vLLM para un rendimiento eficiente.

## Capacidades

- Generacion de texto autoregresiva en modo base (continuacion de secuencia), no dialogo instruido en este repositorio.
- Razonamiento y conocimiento general: puntua 58,3 en MMLU y 44,1 en BBH en la tabla de evaluacion publicada.
- Capacidad de razonamiento multi-paso (BBH, Big-Bench Hard) por encima de los modelos de referencia comparados.
- Rendimiento en tareas en ingles y chino segun los benchmarks declarados; no se especifica soporte oficial para otros idiomas.
- Inferencia eficiente con cache KV comprimida gracias a MLA, lo que favorece contextos largos (hasta 32k tokens).
- Computo disperso por token (2,4B de 16B activos), util para despliegues con restricciones de throughput.
- Capacidades de tool calling / function calling: no disponible en la informacion proporcionada (el modelo base no declara soporte explicito).
- Capacidades de agente o multi-step tool use: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking: no disponibles en esta version.

## Casos de uso

- Generacion de texto a gran escala: el modelo puede emplearse como motor de continuacion de texto o preentrenamiento base para tareas de NLP, con un coste de computo por token bajo gracias a sus 2,4B parametros activos.
- Investigacion sobre MoE y MLA: sirve como banco de pruebas accesible (16B totales, desplegable en una GPU de 40 GB) para estudiar enrutamiento disperso y atencion con cache latente sin necesidad de clústeres grandes.
- Procesamiento de documentos largos: con 32k tokens de contexto y cache KV comprimida mediante MLA, es adecuado para resumir o extraer informacion de documentos extensos en una sola pasada.
- Fine-tuning especializado: al ser ajustable en 8 GPU de 80 GB segun la model card, permite adaptar el modelo base a dominios concretos (legal, medico, tecnico) mediante SFT o LoRA.
- Base para construir un modelo de chat: partiendo de este modelo base, un equipo puede aplicar su propio SFT y alineacion para obtener un asistente conversacional a medida.
- Tareas en chino e ingles: los benchmarks declarados cubren ambos idiomas, por lo que resulta apropiado para aplicaciones bilingues en esos dos idiomas concretos.
- Despliegue con restricciones de hardware: al caber en una sola GPU de 40 GB, es util para entornos on-premise con una A100 40GB o similar.
- Experimentacion en pipelines de transformers: gracias a su integracion con la libreria transformers (con custom_code) y compatibilidad con text-generation-inference.

## Benchmarks y rendimiento

Resultados publicados en la model card para el modelo base (no chat):

| Benchmark | Dominio | DeepSeek 7B (Dense) | DeepSeekMoE 16B | DeepSeek-V2-Lite (MoE-16B) |
|---|---|---|---|---|
| Arquitectura | - | MHA + Dense | MHA + MoE | MLA + MoE |
| MMLU | Ingles | 48,2 | 45,0 | 58,3 |
| BBH | Ingles | 39,5 | 38,9 | 44,1 |

La tabla de evaluacion de la model card proporcionada aparece truncada tras la fila de BBH, por lo que no hay mas resultados disponibles (por ejemplo, HumanEval, GSM8K u otras tareas). No se han publicado en la informacion disponible mas datos de benchmarks que los recogidos arriba.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (BF16/FP16) los pesos ocupan aproximadamente 31,4 GB (tamano del repo), por lo que se necesita una GPU de 40 GB o mas. Con cuantizacion a 8 bits se reduciria a ~16 GB y a 4 bits a ~8-9 GB (estimaciones no confirmadas por la model card, que no declara cuantizaciones oficiales).
- GPU recomendadas: segun la model card, es desplegable en una sola GPU de 40 GB (por ejemplo, A100 40GB) y ajustable en 8 GPU de 80 GB (A100/H100 80GB).
- Cabe en GPU de consumo: en BF16 no cabe en una RTX 4090 (24 GB). Con cuantizacion a 4 bits es plausible que quepa en una RTX 4090 o RTX 3090 de 24 GB, aunque no hay confirmacion oficial en la informacion proporcionada.
- Opciones de despliegue: vLLM (el autor recomienda su solucion dedicada sobre vLLM por rendimiento), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), y transformers con `custom_code`.
- Latencia y throughput estimados: no disponible. La model card solo indica que la implementacion en HuggingFace es mas lenta que su base de codigo interna y que vLLM mejora el rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Arquitectura | MMLU | BBH | Licencia |
|---|---|---|---|---|---|---|---|
| DeepSeek-V2-Lite | 16B | 2,4B | 32k | MLA + MoE | 58,3 | 44,1 | DeepSeek Model License |
| DeepSeekMoE 16B | 16B | no disponible | no disponible | MHA + MoE | 45,0 | 38,9 | no disponible |
| DeepSeek 7B | 7B | 7B (denso) | no disponible | MHA + Dense | 48,2 | 39,5 | no disponible |
| DeepSeek-V2 | 236B | 21B | 128k | MLA + MoE | no disponible | no disponible | DeepSeek Model License |

Los datos de DeepSeekMoE 16B y DeepSeek 7B proceden de la tabla comparativa de la propia model card de DeepSeek-V2-Lite. No se dispone de resultados de benchmarks para DeepSeek-V2 (236B) en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones: no responde de forma conversacional ni sigue instrucciones de forma fiable sin un ajuste posterior. Para chat debe usarse `DeepSeek-V2-Lite-Chat` o aplicar SFT propio.
- Riesgo de alucinacion: como cualquier LLM, puede generar contenido plausible pero incorrecto; no se han publicado tasas de alucinacion.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible.
- Idiomas: no se declara una lista oficial de idiomas soportados; los benchmarks solo cubren ingles y chino, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Licencia restrictiva: se trata de la DeepSeek Model License, una licencia propietaria (no open source estandar) con condiciones especificas. Es imprescindible revisar el texto completo antes de cualquier uso comercial.
- Rendimiento en HuggingFace: el autor advierte de que el codigo open source es mas lento que su base de codigo interno y recomienda vLLM para un rendimiento eficiente.
- Compatibilidad: requiere `custom_code` en transformers, lo que puede complicar la integracion en algunos pipelines.
- Contexto limitado a 32k tokens, inferior a los 128k de DeepSeek-V2 completo.
- No hay datos oficiales sobre cuantizaciones soportadas, tool calling ni capacidades de agente en esta version.

## Enlaces

- Modelo en HuggingFace (base): https://huggingface.co/deepseek-ai/DeepSeek-V2-Lite
- Modelo en HuggingFace (chat, SFT): https://huggingface.co/deepseek-ai/DeepSeek-V2-Lite-Chat
- Modelo en HuggingFace (DeepSeek-V2, 236B): https://huggingface.co/deepseek-ai/DeepSeek-V2
- Modelo en HuggingFace (DeepSeek-V2-Chat, RL): https://huggingface.co/deepseek-ai/DeepSeek-V2-Chat
- Paper (arXiv:2405.04434): https://arxiv.org/abs/2405.04434
- Repositorio GitHub de DeepSeek-V2: https://github.com/deepseek-ai/DeepSeek-V2
- Licencia del modelo: https://github.com/deepseek-ai/DeepSeek-V2/blob/main/LICENSE-MODEL
- Licencia del codigo (MIT): https://github.com/deepseek-ai/DeepSeek-V2/blob/main/LICENSE-CODE
- Perfil de DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Sitio web oficial: https://www.deepseek.com/
- Plataforma API: https://www.deepseek.com/en/platform/
- Chat: https://chat.deepseek.com/
- Discord de DeepSeek AI: https://discord.gg/Tc7c45Zzu5
- GitHub de DeepSeek (organizacion): https://github.com/deepseek-ai
