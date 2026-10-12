# deepseek-ai/DeepSeek-V3

## Resumen

DeepSeek-V3 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek AI, con 671.000 millones de parametros totales de los que solo se activan 37.000 millones por token. Se trata de la evolucion directa de DeepSeek-V2 y mantiene su arquitectura de atencion Multi-head Latent Attention (MLA) combinada con DeepSeekMoE, lo que reduce de forma notable el coste de inferencia frente a un modelo denso de tamano equivalente. El modelo fue preentrenado sobre 14,8 billones de tokens y publicado bajo la DeepSeek Model License, con el codigo acompanado de licencia MIT.

Su relevancia radica en tres factores: primero, es uno de los primeros modelos a gran escala entrenado con precision mixta FP8 de forma estable, lo que abarata el entrenamiento; segundo, introduce una estrategia de balanceo de carga sin perdida auxiliar y un objetivo de prediccion multi-token (MTP) que sirve ademas para decodificacion especulativa; y tercero, su rendimiento se situa, segun el autor, por encima de otros modelos abiertos y en niveles comparables a los principales modelos cerrados contemporaneos. Con mas de 1,4 millones de descargas y mas de 4.400 "me gusta" en HuggingFace, se ha convertido en una referencia de la IA abierta de finales de 2024 y principios de 2025.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con Multi-head Latent Attention (MLA) y DeepSeekMoE |
| Parametros totales | 671.000 millones (según model card); 684.531.386.000 en metadatos de safetensors |
| Parametros activos | 37.000 millones por token |
| Longitud de contexto | 128.000 tokens (128K) |
| Tipos de cuantizacion | FP8 (nativo para pesos); conversiones GGUF/4-bit por la comunidad, no oficiales |
| Idiomas soportados | no disponible en la model card (entrenamiento mayoritariamente en ingles y chino) |
| Licencia | DeepSeek Model License (modelo); MIT (codigo) |
| Formato de pesos | safetensors (formato FP8), con custom_code de transformers (deepseek_v3) |

Otras caracteristicas registradas del repositorio: pipeline de text-generation, tags de TGI y endpoints_compatible, tamano del repositorio de 688,7 GB, fecha de creacion 2024-12-25 y ultima actualizacion 2025-03-27. El paper asociado es arXiv:2412.19437.

## Arquitectura y entrenamiento

DeepSeek-V3 es un transformer de tipo MoE que profundiza en las innovaciones introducidas en DeepSeek-V2. La capa de atencion usa Multi-head Latent Attention (MLA), que comprime las claves y los valores en un espacio latente para reducir la memoria de la cache KV durante la inferencia. La parte de expertos emplea DeepSeekMoE: sobre 671.000 millones de parametros totales, cada token activa 37.000 millones, con expertos enrutados de forma dispersa. Como novedad, se introduce una estrategia de balanceo de carga sin perdida auxiliar (auxiliary-loss-free load balancing), que evita las degradaciones de rendimiento asociadas a forzar el equilibrio entre expertos, y un objetivo de entrenamiento de prediccion multi-token (Multi-Token Prediction, MTP) que mejora el rendimiento y ademas puede reutilizarse para decodificacion especulativa y acelerar la inferencia.

El preentrenamiento se realizo sobre 14,8 billones de tokens diversos y de alta calidad, con un coste total de 2,664 millones de horas de GPU H800 para la fase de preentrenamiento (y 0,1 millones adicionales para las fases posteriores, sumando 2,788 millones de horas H800 en total). El entrenamiento utilizo un framework de precision mixta FP8, validado por primera vez a esta escala, junto con un diseno conjunto de algoritmos, framework y hardware para solapar casi por completo computacion y comunicacion en el entrenamiento MoE entre nodos. Tras el preentrenamiento, el modelo pasa por fases de ajuste fino supervisado (SFT) y aprendizaje por refuerzo (RL). En la fase de postentrenamiento se incorpora una destilacion de capacidades de razonamiento desde un modelo de la serie DeepSeek-R1, integrando sus patrones de verificacion y reflexion, sin perder control sobre el estilo y la longitud de las salidas de DeepSeek-V3.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto largo (hasta 128K tokens).
- Razonamiento complejo, reforzado mediante la destilacion de cadenas de pensamiento largas desde DeepSeek-R1.
- Resolucion de problemas matematicos y tareas de codigo.
- Prediccion multi-token (MTP) que habilita decodificacion especulativa para acelerar la generacion.
- Soporte de tool calling / function calling segun los tags de la model card (endpoints_compatible) y su uso en pipelines de agentes.
- Uso en escenarios de agente y razonamiento multi-paso (no documentado de forma explicita en la model card, aunque habitual en su ecosistema de despliegue).
- Capacidades multilingues no detalladas formalmente por el autor; el entrenamiento esta mayoritariamente orientado a ingles y chino.
- Capacidades de vision y audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 128K tokens, lo que permite mantener el historial completo de un cliente sin recurrir a resumenes agresivos ni perder informacion relevante.
- Generacion de codigo en produccion: con soporte de tool calling y su rendimiento en tareas de codigo, puede integrarse en pipelines de CI/CD para autocompletar, revisar o refactorizar codigo dentro de entornos de desarrollo asistidos.
- Asistentes de razonamiento para analisis tecnico: la destilacion desde DeepSeek-R1 le permite abordar problemas que requieren cadenas de razonamiento largas, como depuracion de sistemas, analisis de causalidad o resolucion de incidencias complejas.
- Procesamiento de documentacion extensa: gracias a su ventana de 128K tokens puede resumir, extraer entidades o responder preguntas sobre manuales, contratos o informes largos en una sola pasada.
- Motores de busqueda aumentada (RAG) de alta precision: su capacidad de razonamiento y su soporte de contexto largo lo hacen adecuado como generador final en sistemas RAG que combinan recuperacion de multiples documentos.
- Agentes autonomos multi-paso: el soporte de function calling y la decodificacion especulativa via MTP permiten construir agentes que encadenan herramientas con latencias de generacion reducidas.
- Traduccion y tratamiento de texto multilingue: aunque no se documentan formalmente los idiomas, su volumen de entrenamiento (14,8 billones de tokens) cubre de facto el ingles y el chino con solidez.
- Plataformas de formacion y tutoria: puede generar explicaciones paso a paso y ejercicios adaptados, aprovechando su razonamiento matematico y su control de estilo y longitud de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card referencia una figura comparativa (figures/benchmark.png) y afirma de forma cualitativa que DeepSeek-V3 supera a otros modelos de codigo abierto y alcanza un rendimiento comparable a los principales modelos cerrados, pero no se incluyen cifras de MMLU, HumanEval, GSM8K u otros conjuntos en el material proporcionado.

## Requisitos de hardware

Los siguientes valores son estimaciones orientativas a partir del numero de parametros; no proceden de datos publicados en la informacion disponible.

- Peso del modelo en FP8 nativo: en torno a 671 GB, lo que exige agregar memoria de varias GPU. En BF16 el peso rondaria 1,3 TB.
- Cuantizacion 4-bit (GGUF o similar, no oficial): aproximadamente 350 GB, todavia fuera del alcance de una unica GPU de consumo.
- GPU recomendadas: despliegues multi-GPU con H100, H200 o H800 de 80 GB. La propia DeepSeek reporta su entrenamiento en H800/CUDA, por lo que los despliegues de inferencia suelen realizarse sobre estos aceleradores.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en configuraciones de consumo habituales, ni siquiera cuantizado a 4 bits. Solo seria viable mediante offloading intensivo a RAM con llama.cpp, con latencias muy elevadas.
- Opciones de despliegue: la model card indica compatibilidad con text-generation-inference (TGI); tambien es habitual su despliegue con vLLM y, en menor medida, con llama.cpp/Ollama para versiones cuantizadas de la comunidad.
- Latencia y throughput: no disponibles en la informacion proporcionada. La activacion de solo 37.000 millones de parametros por token y la decodificacion especulativa mediante MTP estan disenadas para reducir el coste por token en comparacion con un modelo denso de 671B.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V3 | 671.000 M | 37.000 M | 128K | DeepSeek Model License (codigo MIT) | Pesos abiertos en HuggingFace |
| DeepSeek-V2 | 236.000 M | 21.000 M | 128K | DeepSeek Model License | Pesos abiertos en HuggingFace |
| Llama 3.1 405B | 405.000 M | denso | 128K | Llama 3.1 Community License | Pesos abiertos con restricciones |
| Qwen2.5-72B | 72.000 M | denso | 128K | Qwen License | Pesos abiertos |

Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada; la model card solo afirma de forma cualitativa que DeepSeek-V3 supera a otros modelos abiertos. La ventaja estructural de DeepSeek-V3 frente a los modelos densos comparados es que, con 671B de parametros totales, solo activa 37B por token, lo que reduce el coste de inferencia por token respecto a un denso de tamano similar.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card. Al entrenarse sobre datos web mayoritariamente en ingles y chino, cabe esperar sesgos culturales y linguisticos propios de esas fuentes, aunque no se cuantifican en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos generativos de este tipo; no se ofrece ninguna mitigacion especifica documentada.
- Limitaciones de idioma: la model card no declara oficialmente los idiomas soportados, por lo que el rendimiento fuera del ingles y el chino no esta garantizado ni evaluado.
- Restricciones de licencia: el modelo se distribuye bajo la DeepSeek Model License (acuerdo de modelo), no bajo una licencia de codigo abierto permisiva. El codigo asociado es MIT. Es imprescindible revisar el acuerdo antes de un uso comercial.
- Requisitos de infraestructura: el peso del modelo (688,7 GB de repositorio) y su tamano minimo en FP8 hacen inviable su ejecucion en hardware de consumo, lo que limita su uso a entornos con clusters de GPU.
- Contexto: aunque soporta 128K tokens, no se detalla en la informacion disponible el comportamiento del rendimiento en los extremos de esa ventana.
- Produccion: no se documentan tasas de error, latencia ni throughput oficiales; cualquier despliegue en produccion requiere una evaluacion propia.
- Actualizacion: la ultima revision del repositorio figura como 2025-03-27, por lo que conviene verificar si existe una version posterior o variantes con mejoras.

## Enlaces

- HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V3
- Paper: https://github.com/deepseek-ai/DeepSeek-V3/blob/main/DeepSeek_V3.pdf
- Repositorio GitHub: https://github.com/deepseek-ai/DeepSeek-V3
- Licencia de modelo: https://github.com/deepseek-ai/DeepSeek-V3/blob/main/LICENSE-MODEL
- Licencia de codigo (MIT): https://github.com/deepseek-ai/DeepSeek-V3/blob/main/LICENSE-CODE
- Web oficial: https://www.deepseek.com/
- Chat: https://chat.deepseek.com/
- Plataforma de API: https://platform.deepseek.com/
- Perfil de HuggingFace del autor: https://huggingface.co/deepseek-ai
- Discord: https://discord.gg/Tc7c45Zzu5
- Twitter: https://twitter.com/deepseek_ai
- arXiv del paper: https://arxiv.org/abs/2412.19437
