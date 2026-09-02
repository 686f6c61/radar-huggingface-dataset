# mradermacher/TinyLlama-3MPER0RR-abliterated-GGUF

## Resumen

TinyLlama-3MPER0RR-abliterated-GGUF es una cuantizacion en formato GGUF del modelo TinyLlama-3MPER0RR-abliterated, creada por el usuario mradermacher. El modelo base, desarrollado por 3MPER0RR, es una variante de TinyLlama (1.1B parametros) a la que se ha aplicado la tecnica de "abliteration", que elimina los mecanismos de rechazo y alineacion de seguridad del modelo original. Esto da como resultado un modelo conversacional con menos restricciones en sus respuestas.

El repositorio contiene exclusivamente los pesos cuantizados en formato GGUF, lo que permite su ejecucion en CPU y GPU con herramientas como llama.cpp, Ollama o LM Studio. La cuantizacion esta disponible en multiples precisiones (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, IQ4_XS y F16), lo que ofrece flexibilidad para distintos requisitos de hardware.

La relevancia de este modelo reside en su tamano reducido (1.1B parametros) combinado con la eliminacion de restricciones de seguridad, lo que lo hace util para experimentacion y casos de uso donde se requiere una generacion de texto sin filtros. Sin embargo, esta misma caracteristica implica riesgos importantes que se detallan en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA (Transformer decoder) |
| Parametros totales | 1.100.048.384 (1.1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (TinyLlama base: 2048 tokens, no confirmado) |
| Tipos de cuantizacion | F16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base TinyLlama-3MPER0RR-abliterated se construye sobre la arquitectura TinyLlama, que es un transformer decoder de 1.1B parametros con 22 capas, 16 cabezas de atencion y dimension de embedding de 2048. TinyLlama se entreno con 3 billones de tokens, siguiendo la misma arquitectura y tokenizador que LLaMA 2.

La variante "abliterated" aplica una tecnica de modificacion de pesos que elimina selectivamente las direcciones en el espacio de activaciones asociadas con comportamientos de rechazo o negativa. Este proceso, conocido como "abliteration", se realiza post-entrenamiento y no requiere reentrenamiento adicional. El resultado es un modelo que mantiene sus capacidades generales pero sin los mecanismos de seguridad que le impedian responder a ciertas solicitudes.

No se dispone de informacion detallada sobre el proceso de entrenamiento especifico de esta variante, ni sobre la composicion del dataset utilizado para la abliteration. El repositorio GGUF no incluye informacion adicional sobre el entrenamiento.

## Capacidades

- Generacion de texto conversacional: el modelo puede mantener dialogos multi-turno con un tono natural y menos restricciones que el modelo original.
- Razonamiento basico: al estar basado en TinyLlama, conserva capacidades de razonamiento limitadas para su tamano.
- Generacion de codigo: puede producir fragmentos de codigo sencillos, aunque con menor precision que modelos especializados.
- Capacidades multilingues: no confirmadas, aunque TinyLlama base soporta multiples idiomas gracias a su tokenizador.
- Conversacion sin filtros: la abliteration elimina los rechazos tipicos de modelos alineados, permitiendo respuestas a solicitudes que otros modelos rehusarian.
- Compatibilidad con herramientas GGUF: puede ejecutarse en llama.cpp, Ollama, LM Studio y otros motores compatibles con este formato.

## Casos de uso

- Experimentacion con modelos sin alineacion: investigadores que estudian el comportamiento de modelos sin restricciones de seguridad pueden usar este modelo para analizar diferencias de comportamiento frente a versiones alineadas.
- Generacion creativa de ficcion: escritores que necesitan explorar temas controvertidos o adultos sin las restricciones tipicas de los modelos comerciales pueden usar este modelo como asistente de escritura.
- Pruebas de jailbreak y robustez: profesionales de seguridad pueden evaluar la eficacia de las tecnicas de abliteration y comparar la resistencia del modelo frente a intentos de manipulacion.
- Desarrollo de chatbots de rol: creadores de personajes virtuales que requieren respuestas sin censura pueden desplegar este modelo en local mediante Ollama o llama.cpp.
- Educacion sobre sesgos en IA: docentes pueden usar este modelo para demostrar como la alineacion afecta el comportamiento de los modelos y los riesgos de eliminarla.
- Prototipado rapido en local: al ser un modelo de 1.1B en GGUF, puede ejecutarse en portatiles con 8GB de RAM, permitiendo prototipar aplicaciones conversacionales sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye mediciones de MMLU, HumanEval, GSM8K ni otros tests estandar. Al ser una cuantizacion de un modelo abliterated, el rendimiento puede variar ligeramente respecto al modelo original TinyLlama, pero no hay datos cuantitativos para confirmarlo.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1 GB (Q2_K) y 2,5 GB (F16) para el modelo completo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, GTX 1650, etc.) para cuantizaciones bajas; 4 GB o mas para Q8_0 o F16.
- Compatible con CPU: las cuantizaciones Q4_K_M y menores pueden ejecutarse en CPU con 8 GB de RAM con velocidades aceptables (5-10 tokens/s en procesadores modernos).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui con backend llama.cpp.
- Latencia estimada: en GPU consumer (RTX 3060), entre 20-40 tokens/s para Q4_K_M; en CPU moderna, entre 5-15 tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TinyLlama-3MPER0RR-abliterated-GGUF | 1.1B | no disponible | no disponible | GGUF | Abliterated, sin restricciones |
| TinyLlama-1.1B-Chat | 1.1B | 2048 | Apache 2.0 | safetensors | Version alineada con chat |
| Llama-3.2-1B | 1.2B | 128K | Llama 3.2 | safetensors | Modelo comercial de Meta |

La comparativa se limita a modelos de tamano similar. La diferencia principal es la ausencia de alineacion en el modelo abliterated, lo que afecta al comportamiento pero no necesariamente a las capacidades brutas. No hay datos de benchmarks para comparar rendimiento real.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una variante de TinyLlama, hereda los sesgos del dataset de entrenamiento original, que no han sido mitigados por la abliteration.
- Riesgo de alucinacion: el modelo puede generar informacion falsa o inventada con alta confianza, especialmente en temas especializados.
- Sin garantias de seguridad: la abliteration elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido ofensivo, ilegal o peligroso si se le solicita.
- Informacion incompleta: no se dispone de datos sobre licencia, idiomas soportados, contexto exacto ni proceso de entrenamiento, lo que limita su uso en entornos de produccion.
- Tamano de contexto limitado: si mantiene el contexto de TinyLlama (2048 tokens), no es adecuado para tareas que requieran contexto largo.
- Sin soporte de tool calling: no hay evidencia de que el modelo soporte function calling ni integracion con herramientas externas.
- Riesgo legal: el uso de modelos sin alineacion puede violar terminos de servicio de plataformas o leyes locales segun el contenido generado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/TinyLlama-3MPER0RR-abliterated-GGUF
- Modelo base (3MPER0RR): https://huggingface.co/3MPER0RR/TinyLlama-3MPER0RR-abliterated
- Variante obliterated (relacionada): https://huggingface.co/mradermacher/TinyLlama-3MPER0RR-obliterated-GGUF
- Otro modelo abliterated del mismo autor: https://huggingface.co/mradermacher/tinyllama-abliterated-GGUF
- Busqueda de modelos abliterated en Ollama: https://ollama.com/search?q=abliterated
