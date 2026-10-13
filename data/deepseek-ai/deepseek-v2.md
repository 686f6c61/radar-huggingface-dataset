# deepseek-ai/DeepSeek-V2

## Resumen

DeepSeek-V2 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek AI y publicado en abril de 2024. Cuenta con 236.000 millones de parametros totales, de los cuales solo 21.000 millones se activan por token, lo que permite un coste de inferencia muy inferior al de un modelo denso de tamano equivalente. Su ventana de contexto alcanza los 128.000 tokens y fue preentrenado sobre un corpus de 8,1 billones de tokens.

El modelo destaca por dos innovaciones arquitectonicas: Multi-head Latent Attention (MLA), que comprime la cache KV, y DeepSeekMoE, que combina expertos con enrutamiento por token. Segun el autor, frente a DeepSeek 67B reduce el coste de entrenamiento un 42,5%, la cache KV un 93,3% y multiplica por 5,76 el throughput maximo de generacion.

Es relevante para desarrolladores e investigadores porque demuestra que un MoE de gran escala puede igualar o superar a modelos densos de 70B en benchmarks estandar (MMLU 78,5; BBH 78,9) con un coste de servicio mucho menor. El repositorio aloja los pesos base en safetensors (~471,5 GB); existe una version afinada con RL (DeepSeek-V2-Chat) en un repositorio aparte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con Multi-head Latent Attention (MLA) |
| Parametros totales | 235.741.434.880 (aprox. 236B) |
| Parametros activos | 21B por token |
| Longitud de contexto | 128.000 tokens (128k) |
| Tipos de cuantizacion | no disponible (pesos publicados en precision completa; safetensors) |
| Idiomas soportados | no disponible (datos oficiales no publicados; evaluado en benchmarks de ingles y chino) |
| Licencia | deepseek (licencia de modelo propia, "Model Agreement"; el codigo se distribuye bajo MIT) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 471,5 GB |
| Libreria | transformers (requiere custom_code) |

## Arquitectura y entrenamiento

DeepSeek-V2 es un transformer decoder-only con dos componentes clave. Multi-head Latent Attention (MLA) comprime las claves y valores en una representacion latente de baja dimension, reduciendo drasticamente el tamano de la cache KV y habilitando contextos largos con menos memoria. DeepSeekMoE divide las capas feed-forward en expertos enrutados por token, con enrutamiento limitado por dispositivo y una perdida de balance de comunicacion, de modo que cada token activa solo una fraccion de los parametros totales (21B de 236B).

El preentrenamiento utilizo un corpus diverso y de alta calidad de 8,1 billones de tokens, seguido de un proceso de Supervised Fine-Tuning (SFT) y aprendizaje por refuerzo (RL) para desbloquear las capacidades conversacionales y de instrucciones. La model card indica que el codigo abierto en HuggingFace rinde por debajo del codigo interno en GPUs, por lo que el autor ofrece una solucion dedicada basada en vLLM para un despliegue eficiente.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline text-generation, etiqueta conversational).
- Razonamiento general y de sentido comun: BBH 78,9 y MMLU 78,5 en la version base.
- Conocimiento en chino notablemente alto: C-Eval 81,7 y CMMLU 84,0, por encima de LLaMA3 70B y Mixtral 8x22B.
- Generacion de codigo: HumanEval 48,8 y MBPP 66,6 en el modelo base.
- Matematicas: GSM8K 79,2 en el modelo base.
- Ventana de contexto de 128k tokens, adecuada para documentos largos y conversaciones extensas.
- Compatible con transformers (requiere cargar codigo personalizado) y con text-generation-inference y endpoints compatibles.
- No se documentan en la informacion disponible capacidades de vision, audio ni tool calling explicito en la model card.

## Casos de uso

- Atencion al cliente automatizada: con 128k tokens de contexto el modelo puede mantener conversaciones multi-turno largas y arrastrar el historial completo sin truncar, reduciendo perdidas de informacion entre turnos.
- Procesamiento de documentos extensos: informes, contratos o expedientes que superan la ventana tipica de 32k se pueden analizar en una sola pasada gracias al contexto de 128k.
- Generacion de codigo en produccion: con HumanEval 48,8 y MBPP 66,6 puede asistir en autocompletado, refactorizacion y generacion de tests, integrándose en pipelines de CI/CD como servicio de inferencia.
- Analisis y sintesis en chino e ingles: su rendimiento en C-Eval y CMMLU lo hace adecuado para aplicaciones bilingues con audiencia en China, como resumen de noticias o soporte regional.
- Razonamiento matemático asistido: con GSM8K 79,2 sirve para tutoria y resolucion de problemas paso a paso en entornos educativos.
- Backend de agentes de investigacion: la combinacion de contexto largo y coste de inferencia bajo (21B activos) permite desplegar agentes que leen muchas fuentes y razonan sobre ellas.
- Clasificacion y etiquetado a gran escala: al activar solo 21B de 236B por token, es viable procesar volumenes altos de texto con coste por peticion reducido.
- Motor de chat para producto propio: la licencia de modelo propia y la disponibilidad de pesos completos permiten autoalojar el modelo, evitando dependencia de APIs externas.

## Benchmarks y rendimiento

Resultados de la model card para el modelo base (DeepSeek-V2, MoE-236B) comparados con alternativas:

| Benchmark | Dominio | LLaMA3 70B | Mixtral 8x22B | DeepSeek-V1 (Dense-67B) | DeepSeek-V2 (MoE-236B) |
|---|---|---|---|---|---|
| MMLU | Ingles | 78,9 | 77,6 | 71,3 | 78,5 |
| BBH | Ingles | 81,0 | 78,9 | 68,7 | 78,9 |
| C-Eval | Chino | 67,5 | 58,6 | 66,1 | 81,7 |
| CMMLU | Chino | 69,3 | 60,0 | 70,8 | 84,0 |
| HumanEval | Codigo | 48,2 | 53,1 | 45,1 | 48,8 |
| MBPP | Codigo | 68,6 | 64,2 | 57,4 | 66,6 |
| GSM8K | Matematicas | 83,0 | 80,3 | 63,4 | 79,2 |
| Math | Matematicas | 42,2 | no disponible (fila truncada en la fuente) | no disponible (fila truncada en la fuente) | no disponible (fila truncada en la fuente) |

Nota: los datos disponibles en la informacion proporcionada estan truncados en la fila Math; no se reproducen cifras que no aparezcan completas en la fuente.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: los 236B parametros ocupan aproximadamente 472 GB, en linea con el tamano del repositorio (471,5 GB). No cabe en una sola GPU comercial.
- Aunque solo se activen 21B por token, todos los expertos deben residir en memoria, por lo que el requisito de VRAM viene marcado por los parametros totales, no por los activos.
- Configuraciones tipicas: multiples A100 80 GB (a partir de 6 unidades para cubrir ~480 GB) u H100 80 GB (8 unidades recomendadas por margen para cache KV y activaciones).
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en consumer GPU convencionales sin cuantizacion agresiva, para la que no se documentan pesos oficiales.
- Despliegue: la model card recomienda una solucion dedicada basada en vLLM para rendimiento optimizado; el repositorio tambien esta etiquetado para text-generation-inference.
- Latencia y throughput: no se publican cifras absolutas en la informacion disponible; el autor afirma un incremento del throughput maximo de generacion de 5,76 veces frente a DeepSeek 67B.

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | Contexto | Licencia | MMLU | BBH |
|---|---|---|---|---|---|---|
| DeepSeek-V2 (MoE-236B) | 236B | 21B | 128k | deepseek (propia) | 78,5 | 78,9 |
| Mixtral 8x22B | 141B (aprox., 8x22B) | no disponible en la fuente | no disponible en la fuente | Apache 2.0 (segun el proyecto Mistral) | 77,6 | 78,9 |
| LLaMA3 70B | 70B | denso | no disponible en la fuente | licencia comunitaria de Meta | 78,9 | 81,0 |
| DeepSeek-V1 (Dense-67B) | 67B | denso | no disponible en la fuente | deepseek (propia) | 71,3 | 68,7 |

No se dispone en la informacion proporcionada de datos de contexto ni de licencia verificados para Mixtral 8x22B y LLaMA3 70B mas alla de lo indicado; contrastar con sus fichas oficiales antes de decidir.

## Limitaciones y advertencias

- Riesgo de alucinacion: como cualquier LLM, puede generar afirmaciones plausibles pero incorrectas, especialmente en dominios especializados no cubiertos por el corpus de entrenamiento.
- Sesgos: no se documentan evaluaciones de sesgo ni de toxicidad en la informacion disponible; el corpus de 8,1 billones de tokens puede arrastrar sesgos de sus fuentes.
- Idiomas: no se publica una lista oficial de idiomas soportados; el rendimiento alto en C-Eval y CMMLU sugiere buen soporte de chino, pero no hay garantias para otras lenguas.
- Licencia: se trata de una licencia de modelo propia ("deepseek Model Agreement"), no de una licencia de codigo abierto estandar. El codigo se publica bajo MIT, pero el uso de los pesos esta sujeto a condiciones que conviene revisar antes de un despliegue comercial.
- Rendimiento en HuggingFace: la propia model card advierte de que el codigo abierto rinde por debajo del interno en GPUs, por lo que se recomienda vLLM para produccion.
- Requisito de hardware elevado: ~472 GB en precision completa, fuera del alcance de infraestructura de una sola GPU.
- Este repositorio corresponde al modelo base, no a la version afinada con RL (DeepSeek-V2-Chat), que es la adecuada para uso conversacional directo.
- La fila de benchmark Math aparece truncada en la fuente, por lo que no puede citarse como referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V2
- Modelo conversacional (RL): https://huggingface.co/deepseek-ai/DeepSeek-V2-Chat
- Paper DeepSeek-V2 (informe tecnico): https://github.com/deepseek-ai/DeepSeek-V2/blob/main/deepseek-v2-tech-report.pdf
- arXiv DeepSeek-V2: https://arxiv.org/abs/2405.04434
- arXiv DeepSeekMoE: https://arxiv.org/abs/2311.18743
- Repositorio GitHub: https://github.com/deepseek-ai/DeepSeek-V2
- Licencia del modelo: https://github.com/deepseek-ai/DeepSeek-V2/blob/main/LICENSE-MODEL
- Licencia del codigo (MIT): https://github.com/deepseek-ai/DeepSeek-V2/blob/main/LICENSE-CODE
- Web oficial: https://www.deepseek.com/
- Chat: https://chat.deepseek.com/
- Plataforma API: https://www.deepseek.com/en/platform/
- Organizacion en HuggingFace: https://huggingface.co/deepseek-ai
