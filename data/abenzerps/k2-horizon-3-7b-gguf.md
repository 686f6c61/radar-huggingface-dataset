# abenzerps/K2-Horizon-3.7B-GGUF

## Resumen

K2-Horizon-3.7B es un modelo de lenguaje denso de 3.700 millones de parametros desarrollado por MBZUAI-IFM, disenado para tareas de razonamiento, generacion de codigo, trabajo con contexto largo y uso de herramientas. Su caracteristica mas destacada es una ventana de contexto nativa de 524.288 tokens (512K), que lo posiciona como una opcion relevante para aplicaciones que requieren procesar documentos extensos o mantener conversaciones de multiples turnos con historial amplio.

Esta ficha corresponde a la version cuantizada en formato GGUF publicada por el usuario abenzerps, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo base se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y su integracion en productos propietarios. La disponibilidad de cuantizaciones desde Q4_0 hasta Q8_0 ofrece un rango de compromiso entre precision y requisitos de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only |
| Parametros totales | 5.058.255.360 (3,7B activos) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base IFM/K2-Horizon-3.7B es un transformer denso decoder-only, sin arquitectura de mezcla de expertos (MoE). La informacion disponible no detalla la configuracion exacta de capas, cabezas de atencion ni dimensiones ocultas, ni tampoco los datos de entrenamiento (numero de tokens, composicion del dataset o uso de tecnicas como RLHF o DPO). La innovacion principal del modelo reside en su capacidad de contexto de 512K tokens, que requiere tecnicas de atencion eficiente o entrenamiento especifico para contextos largos, aunque el mecanismo concreto no se especifica en la documentacion publica.

La version GGUF se ha generado a partir del checkpoint original en safetensors, e incluye la plantilla de chat (`chat_template.jinja`) en el repositorio. Para un funcionamiento correcto con la ventana de contexto completa, el autor recomienda utilizar el fork de llama.cpp especifico para K2-Horizon mantenido por MBZUAI-IFM.

## Capacidades

- Generacion de texto y razonamiento: modelo denso de 3,7B parametros optimizado para tareas de razonamiento logico y respuesta a preguntas.
- Generacion de codigo: capacidad declarada para tareas de programacion, aunque no se especifican benchmarks concretos de HumanEval o similares en la informacion disponible.
- Contexto largo: ventana nativa de 512K tokens, adecuada para procesar documentos extensos, libros completos o bases de codigo de gran tamano.
- Tool use: soporte declarado para uso de herramientas, lo que permite integrarlo en flujos de agente con function calling.
- Conversacion multi-turno: disenado para dialogos extensos, con capacidad de mantener coherencia a lo largo de conversaciones largas gracias a su amplio contexto.
- Multilingue: limitado al ingles segun la model card; no se garantiza rendimiento en otros idiomas.

## Casos de uso

- Analisis de documentos legales extensos: el modelo puede procesar contratos o expedientes completos de cientos de paginas en una sola pasada, gracias a su contexto de 512K tokens, permitiendo resumir clausulas, extraer obligaciones o detectar inconsistencias sin necesidad de dividir el texto.
- Asistente de programacion con repositorios completos: al poder ingerir el contenido de un repositorio entero, puede responder preguntas sobre arquitectura del proyecto, explicar funciones especificas o sugerir refactorizaciones con conocimiento global del codigo.
- Atencion al cliente con historial extenso: en un despliegue con llama.cpp, puede gestionar conversaciones con decenas de turnos previos sin perder el hilo, manteniendo el contexto de interacciones anteriores durante semanas.
- Analisis de investigacion academica: procesamiento de articulos cientificos completos, incluyendo referencias y apendices, para extraer metodologias, resultados o limitaciones de forma estructurada.
- Agente autonomo con tool calling: su soporte para uso de herramientas permite construir agentes que consulten APIs, ejecuten busquedas o interactuen con sistemas externos en flujos de varios pasos.
- Generacion de documentacion tecnica: a partir de un codigo fuente extenso, el modelo puede redactar documentacion de API, guias de inicio rapido o manuales de referencia con coherencia global.

## Benchmarks y rendimiento

La model card del autor incluye una imagen con resultados de benchmarks del checkpoint original, reportados por IFM. Sin embargo, los valores numericos concretos no estan disponibles en la informacion proporcionada. No se pueden presentar datos verificables de MMLU, HumanEval, GSM8K u otras evaluaciones estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: los archivos GGUF ocupan entre 3,02 GB (Q4_0) y 5,39 GB (Q8_0). A esto hay que anadir la memoria para la cache KV, que escala con la longitud de contexto. Con 8K tokens de contexto, la VRAM total necesaria oscila entre 4 y 7 GB segun la cuantizacion.
- GPU recomendadas: cualquier GPU con 8 GB de VRAM o superior puede ejecutar las cuantizaciones Q4_K_M o Q5_K_M con contexto moderado. Para contextos cercanos a 512K tokens, se necesitarian GPU profesionales con 80 GB o mas (A100, H100) o el uso de CPU con RAM abundante.
- Compatibilidad con GPU de consumo: si, las cuantizaciones Q4_0 y Q4_K_M caben en GPUs como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) con contextos de 8K a 32K tokens.
- Opciones de despliegue: llama.cpp (recomendado el fork de MBZUAI-IFM), Ollama, llama-cpp-python, y cualquier servidor compatible con GGUF como llama.cpp server o LocalAI.
- Latencia y throughput: no se han publicado datos especificos de latencia o tokens por segundo para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| K2-Horizon-3.7B | 3,7B | 512K | Apache-2.0 | GGUF, safetensors |
| Llama 3.2 3B | 3,2B | 128K | Llama 3.2 | GGUF, safetensors |
| Qwen2.5 3B | 3,1B | 32K (128K con YaRN) | Apache-2.0 | GGUF, safetensors |
| Gemma 2 2B | 2,6B | 8K | Gemma | GGUF, safetensors |

K2-Horizon-3.7B destaca frente a alternativas de tamano similar por su contexto de 512K tokens, muy superior a los 128K de Llama 3.2 3B o los 32K de Qwen2.5 3B. Su licencia Apache-2.0 es mas permisiva que la de Llama 3.2 (licencia Llama con restricciones para usuarios con mas de 700 millones de usuarios mensuales) y equivalente a la de Qwen2.5. La disponibilidad de cuantizaciones GGUF facilita su despliegue en hardware modesto.

## Limitaciones y advertencias

- Idioma limitado: el modelo esta entrenado principalmente en ingles; su rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea inferior.
- Datos de entrenamiento no publicados: no se conoce la composicion del dataset de entrenamiento, lo que dificulta evaluar sesgos potenciales o cobertura de dominios especificos.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas de hechos especificos o datos numericos.
- Requiere fork especifico de llama.cpp: para aprovechar la ventana de contexto completa, es necesario usar el fork de MBZUAI-IFM, no la version estandar de llama.cpp.
- Benchmarks no verificables: los resultados de rendimiento mostrados en la model card no incluyen valores numericos en la informacion disponible, por lo que no se puede validar su rendimiento real frente a alternativas.
- Modelo pequeno: con solo 3,7B parametros, su capacidad de razonamiento complejo es limitada en comparacion con modelos de 7B, 13B o superiores, especialmente en tareas de matematicas avanzadas o logica de multiples pasos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/abenzerps/K2-Horizon-3.7B-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Fork de llama.cpp para K2-Horizon: https://github.com/MBZUAI-IFM/llama.cpp/tree/model/K2Horizon
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
