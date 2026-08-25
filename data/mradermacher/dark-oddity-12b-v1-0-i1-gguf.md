# mradermacher/Dark-Oddity-12B-v1.0-i1-GGUF

## Resumen

Dark-Oddity-12B-v1.0 es un modelo de lenguaje de 12 000 millones de parametros, distribuido originalmente por el usuario ReadyArt en HuggingFace y posteriormente cuantizado al formato GGUF por mradermacher con pesos imatrix. Esta ficha cubre exclusivamente la version cuantizada `mradermacher/Dark-Oddity-12B-v1.0-i1-GGUF`, que incluye un amplio abanico de cuantizaciones que van desde IQ1_S hasta Q6_K, lo que permite desplegarlo en hardware muy diverso, desde CPU con poca RAM hasta GPUs de gama alta.

El modelo se presenta como orientado a conversacion, segun las etiquetas de HuggingFace, aunque no se dispone de informacion detallada sobre su arquitectura interna, dataset de entrenamiento o licencia. La relevancia de esta ficha radica en que el formato GGUF con cuantizacion imatrix permite ejecutar el modelo en local con herramientas como llama.cpp u Ollama, algo especialmente util para desarrolladores que buscan alternativas de IA generativa autocontenidas.

La informacion disponible es limitada: no se han publicado benchmarks, detalles de entrenamiento ni especificaciones de arquitectura en la model card. Los datos tecnicos que se indican a continuacion provienen de los metadatos del repositorio y de la inspeccion del propio archivo de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer decoder, sin confirmar) |
| Parametros totales | 11 956 539 456 (11,96 B) |
| Parametros activos | no aplicable (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizacion imatrix) |

## Arquitectura y entrenamiento

No se ha publicado informacion oficial sobre la arquitectura del modelo original. Dado el tamano de 11,96 B parametros, es plausible que se trate de un transformer decoder denso similar a otros modelos de la misma escala (como Mistral-12B o Llama-2-13B), pero esto es una inferencia y no un dato confirmado.

El proceso de cuantizacion realizado por mradermacher utiliza la tecnica imatrix (importance matrix), que asigna mayor precision a los pesos mas relevantes para la activacion del modelo. Esto permite mantener una calidad relativamente alta incluso en cuantizaciones agresivas como IQ1_S o IQ2_XXS. El repositorio incluye 24 variantes de cuantizacion, lo que da flexibilidad para elegir el equilibrio entre tamano y fidelidad.

No se dispone de datos sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational", lo que sugiere que esta optimizado para dialogos multi-turno.
- Ejecucion local en CPU y GPU: gracias al formato GGUF, puede ejecutarse en una amplia variedad de hardware sin necesidad de GPU propietaria.
- Multiples niveles de cuantizacion: permite ajustar el equilibrio entre calidad y consumo de recursos segun el hardware disponible.
- Compatibilidad con herramientas estandar: es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten GGUF.
- No se ha confirmado soporte para tool calling, function calling, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Chatbot local para desarrollo: un desarrollador puede integrar este modelo en una aplicacion de chat usando llama.cpp u Ollama, sin depender de APIs externas, ideal para prototipos y pruebas offline.
- Asistente de escritura creativa: su orientacion conversacional lo hace adecuado para generar dialogos, guiones o textos narrativos, ejecutandose en un portatil con 16 GB de RAM usando cuantizaciones Q4_K_M o inferiores.
- Educacion y formacion: como modelo autocontenido, puede usarse en entornos educativos para ensenar conceptos de IA generativa sin costes de inferencia en la nube.
- Procesamiento de datos con privacidad: al ejecutarse en local, es util para organizaciones que manejan datos sensibles y no pueden enviarlos a servicios externos.
- Generacion de contenido en batch: con cuantizaciones pequenas (IQ2_XS o IQ1_S), puede procesar grandes volumenes de texto en CPU, por ejemplo para generar borradores de documentacion tecnica.
- Experimentacion con cuantizacion: el repositorio incluye 24 variantes, lo que permite a investigadores estudiar el impacto de diferentes niveles de cuantizacion en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Para Q6_K (aproximadamente 9-10 GB), se necesita una GPU con al menos 12 GB de VRAM. Para Q4_K_M (aproximadamente 7-8 GB), bastan 8-10 GB. Para IQ2_XS o IQ1_S (aproximadamente 3-4 GB), puede ejecutarse en GPUs de 6 GB o incluso en CPU con 8 GB de RAM.
- GPU recomendadas: RTX 3060 12 GB o superior para cuantizaciones altas; RTX 4060 8 GB o RTX 3060 Ti para cuantizaciones medias; cualquier GPU con 6 GB para cuantizaciones bajas.
- Ejecucion en CPU: posible con llama.cpp u Ollama usando cuantizaciones Q4_K_M o inferiores, con 16 GB de RAM recomendados.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui (con backend llama.cpp), y servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no disponible. Depende del hardware y la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El modelo no tiene benchmarks publicados ni especificaciones de arquitectura confirmadas. Como referencia orientativa, modelos de tamano similar (12-13 B) como Mistral-12B o Llama-2-13B suelen obtener resultados en el rango de 55-60 % en MMLU, pero no se puede afirmar que este modelo se comporte igual.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos, alucinaciones o limitaciones de contexto. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en produccion.
- La licencia es desconocida, lo que impide garantizar que su uso comercial sea legal. Se recomienda contactar con el autor original (ReadyArt) para aclarar los terminos.
- No se ha confirmado la arquitectura interna, por lo que no se puede verificar si el modelo tiene capacidades especiales como atencion lineal o decodificacion especulativa.
- El modelo esta etiquetado como "conversational", pero no se ha verificado su calidad en tareas de razonamiento, codigo o matematicas.
- Al ser una cuantizacion de un modelo de terceros, puede haber perdida de calidad respecto al original en cuantizaciones muy agresivas (IQ1_S, IQ2_XXS).
- La fecha de creacion del repositorio (2026-08-25) es posterior a la fecha actual, lo que sugiere que puede tratarse de un error en los metadatos o de un modelo muy reciente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Dark-Oddity-12B-v1.0-i1-GGUF
- Modelo original (safetensors): https://huggingface.co/ReadyArt/Dark-Oddity-12B-v1.0
- Version v2.0 del mismo autor: https://huggingface.co/mradermacher/Dark-Oddity-12B-v2.0-i1-GGUF
- Perfil de mradermacher: https://huggingface.co/mradermacher
