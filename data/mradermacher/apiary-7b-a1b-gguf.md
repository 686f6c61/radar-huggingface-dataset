# mradermacher/apiary-7B-A1B-GGUF

## Resumen

El modelo `apiary-7B-A1B` es un modelo de lenguaje de tipo Mixture of Experts (MoE) con arquitectura `qwen3_moe`, desarrollado por DruidTheGetafix y entrenado desde cero (from-scratch) sobre el dataset `HuggingFaceFW/fineweb-edu`. Con aproximadamente 6,8 mil millones de parámetros totales, destaca por ser un MoE compacto entrenado desde cero en lugar de un fine-tuning de un modelo existente, lo que lo convierte en un caso interesante para estudiar el comportamiento de arquitecturas MoE a escalas pequeñas.

La versión GGUF aquí descrita, publicada por mradermacher, proporciona cuantizaciones listas para usar en entornos de inferencia local con llama.cpp, Ollama u otros motores compatibles. El modelo está pensado exclusivamente para el idioma inglés y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Su relevancia radica en ofrecer una alternativa MoE de bajo coste para experimentación y despliegue en hardware modesto, aunque carece de fine-tuning instruct y de datos públicos de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_moe (Mixture of Experts) |
| Parametros totales | 6.847.272.960 (aprox. 6,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE basada en el diseño de Qwen3 MoE, con múltiples expertos y un mecanismo de enrutamiento que activa solo una parte de los parámetros por token. Sin embargo, no se han publicado detalles sobre el numero de expertos, el tamaño de los expertos activos ni el ratio de activacion. El entrenamiento se realizo desde cero (from-scratch) utilizando el dataset `HuggingFaceFW/fineweb-edu`, un corpus educativo filtrado de alta calidad. No se dispone de informacion sobre el numero total de tokens de entrenamiento, ni sobre el uso de tecnicas de alineacion como RLHF o DPO. La innovacion principal es precisamente el entrenamiento from-scratch de un MoE de tamano reducido, un enfoque poco comun que puede servir para investigar la eficiencia de muestras y la escalabilidad de arquitecturas MoE.

## Capacidades

- Generacion de texto en ingles: al ser un modelo base (pretraining) sin fine-tuning instruct, su funcion principal es la continuacion de texto y la modelizacion del lenguaje.
- Razonamiento basico: puede mostrar cierta capacidad de razonamiento emergente, aunque sin datos de benchmarks no se puede cuantificar.
- No se ha documentado soporte para tool calling, function calling, agentes ni multi-step reasoning.
- No se ha documentado soporte para vision, audio u otras modalidades.
- Capacidad multilingue: no disponible, el modelo solo declara ingles.

## Casos de uso

- Experimentacion academica: investigacion sobre arquitecturas MoE pequenas, analisis de enrutamiento de expertos y comportamiento de modelos from-scratch con datasets educativos.
- Fine-tuning posterior: al ser un modelo base, puede servir como punto de partida para fine-tuning en tareas especificas de procesamiento de lenguaje natural en ingles.
- Generacion de texto en entornos sin conexion: gracias a las cuantizaciones GGUF, puede ejecutarse en portatiles o equipos sin GPU para tareas de completado de texto o generacion creativa.
- Pruebas de inferencia local: evaluacion de rendimiento y latencia de MoE en hardware de consumo mediante llama.cpp u Ollama.
- Comparativa de cuantizaciones: estudio del impacto de diferentes niveles de cuantizacion (Q2_K a f16) en la calidad de salida y el uso de memoria.
- Prototipado rapido: integracion en aplicaciones de demostracion que requieran un modelo de lenguaje ligero y de codigo abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Por ejemplo, Q4_K_M ocupa 4,3 GB, Q8_0 7,4 GB y f16 13,8 GB. Se recomienda al menos 6 GB de VRAM para Q4_K_M y 8 GB para Q8_0.
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) para cuantizaciones Q4/Q5; para f16 se necesitan 16 GB (RTX 4080, RTX 4090, A100).
- Cabe en GPU de consumo: si, con cuantizaciones Q4_K_M o inferiores en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier motor compatible con GGUF.
- Latencia y throughput: no disponibles. Al ser un MoE, la latencia dependera del numero de expertos activos, dato no publicado.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos. El modelo es un MoE de ~6,8 B parametros entrenado desde cero, pero no hay datos de rendimiento ni de contexto. Se podria comparar en tamano con modelos densos como Llama-3-8B o Mistral-7B, pero al ser arquitecturas diferentes y sin benchmarks, la comparacion no seria significativa. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre `fineweb-edu`, puede heredar sesgos presentes en el contenido educativo filtrado, aunque no se han documentado estudios especificos.
- Riesgo de alucinacion: como modelo base sin alineacion, es probable que genere contenido falso o inventado con facilidad, especialmente en tareas de hechos.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada; no se puede garantizar un rendimiento adecuado en conversaciones largas o documentos extensos.
- Limitaciones de idioma: solo ingles; no soporta otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base puede tener condiciones adicionales no verificadas.
- Caveat para produccion: al no ser un modelo instruct, no es adecuado para tareas de chat o asistentes sin un fine-tuning previo. Ademas, la ausencia de benchmarks impide validar su calidad en tareas reales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/apiary-7B-A1B-GGUF
- Modelo base: https://huggingface.co/DruidTheGetafix/apiary-7B-A1B
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
