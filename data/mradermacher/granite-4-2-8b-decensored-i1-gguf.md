# mradermacher/granite-4.2-8b-decensored-i1-GGUF

## Resumen

Este repositorio contiene la cuantización GGUF con matriz de importancia (imatrix) del modelo `qcokvd1/granite-4.2-8b-decensored`, una versión "decensored" (abliterated) del modelo Granite 4.2 8B de IBM. El trabajo de cuantización lo realiza mradermacher, que publica tanto los pesos estáticos como las versiones con imatrix para mejorar la calidad de las cuantizaciones de baja precisión. El modelo base original, Granite 4.2, es una familia de modelos densos decoder-only de 3B, 8B y 30B parámetros, post-entrenados sobre Granite 4.1, con capacidades integradas de razonamiento (chain-of-thought), modos de pensamiento flexibles y tool calling aumentado con razonamiento.

La versión "decensored" elimina las capas de rechazo de contenido del modelo original, permitiendo respuestas sin censura en temas que el modelo base bloquearía. Esta cuantización en formato GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles, manteniendo un equilibrio entre tamaño y calidad. El repositorio actual solo contiene el archivo de imatrix (0,1 GB); las cuantizaciones completas están disponibles en el repositorio hermano `granite-4.2-8b-decensored-GGUF` o a través de la página de descarga enlazada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (basado en Granite 4.2 8B) |
| Parametros totales | 8.791.592.960 (~8,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | imatrix (archivo de calibración); cuantizaciones GGUF disponibles en el repositorio hermano: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | Ingles (segun la model card; el modelo base Granite 4.2 soporta 12 idiomas, pero esta version solo declara "en") |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantizacion GGUF con imatrix del modelo `qcokvd1/granite-4.2-8b-decensored`, que a su vez es una version "abliterated" del Granite 4.2 8B de IBM. La tecnica de abliteration elimina selectivamente las direcciones de los pesos responsables del rechazo de contenido, manteniendo el resto de las capacidades del modelo. El Granite 4.2 original es un modelo denso decoder-only, post-entrenado sobre las bases de Granite 4.1, con un entrenamiento que incluye fases de razonamiento supervisado y ajuste con preferencias (RLHF/DPO) para potenciar el chain-of-thought y el tool calling. No se dispone de informacion detallada sobre el proceso de entrenamiento especifico del modelo decensored ni sobre los datos utilizados en la cuantizacion imatrix.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Razonamiento con cadena de pensamiento (thinking mode) integrado, con modos de pensamiento flexibles (rapido, profundo, etc.).
- Tool calling / function calling aumentado con razonamiento, util para agentes que necesitan decidir que herramienta usar.
- Soporte de agentes y razonamiento multi-paso.
- Capacidad multilingue del modelo base (12 idiomas), aunque esta version solo declara ingles en su model card.
- Ausencia de censura: el modelo responde a peticiones que el Granite 4.2 original rechazaria, incluyendo temas controvertidos o sensibles.
- Compatible con motores de inferencia GGUF (llama.cpp, Ollama, LM Studio, etc.).

## Casos de uso

- Generacion de ficcion y escritura creativa sin restricciones: el modelo puede producir narrativas, dialogos o poesia sobre temas que otros modelos censuran, util para autores que exploran territorios oscuros o controvertidos.
- Roleplay y simulacion de personajes: al no tener capas de rechazo, puede interpretar personajes con personalidades extremas o moralmente ambiguas sin interrumpir la interaccion.
- Investigacion academica en ciencias sociales: permite analizar discursos ofensivos o extremistas generando ejemplos sinteticos para estudios de linguistica o sociologia, sin las limitaciones de los modelos alineados.
- Desarrollo de chatbots para entornos controlados: en plataformas donde se requiere libertad de expresion (por ejemplo, foros privados o simulaciones), el modelo puede gestionar conversaciones sin filtros predefinidos.
- Asistencia tecnica y generacion de codigo: aunque no es su foco principal, mantiene las capacidades de razonamiento y tool calling del Granite 4.2, por lo que puede integrarse en pipelines de desarrollo con funciones de llamada a herramientas.
- Experimentacion con tecnicas de abliteration: sirve como referencia para estudiar como la eliminacion de capas de rechazo afecta al comportamiento y a las capacidades de un modelo de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Granite 4.2 8B tiene resultados publicados por IBM en su documentacion, pero esta version decensored y su cuantizacion no incluyen datos de evaluacion especificos.

## Requisitos de hardware

- No se dispone de datos especificos de VRAM en la informacion proporcionada.
- Al ser un modelo de ~8,8B parametros, las cuantizaciones GGUF tipicas (Q4_K_M, Q5_K_M) requieren entre 5 y 7 GB de VRAM, lo que permite su ejecucion en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores.
- Para cuantizaciones mas altas (Q6_K, Q8_0) se recomienda al menos 10-12 GB de VRAM.
- El archivo de imatrix incluido en este repositorio no es un modelo ejecutable; se utiliza para generar cuantizaciones personalizadas con llama.cpp.
- Motores de despliegue compatibles: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con conversion previa a formato compatible).
- La latencia y el throughput dependen del hardware y de la cuantizacion elegida; no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| granite-4.2-8b-decensored (este) | ~8,8B | No disponible | Apache-2.0 | GGUF | Version sin censura, solo ingles declarado |
| granite-4.2-8b (original IBM) | ~8,8B | No disponible (128K segun documentacion de IBM) | Apache-2.0 | Safetensors, GGUF | Con salvaguardas, 12 idiomas, razonamiento y tool calling |
| Llama 3.1 8B | 8,03B | 128K | Llama 3.1 | Safetensors, GGUF | Modelo generico con alineamiento estandar, sin tool calling nativo |
| Mistral 7B v0.3 | 7,24B | 32K | Apache-2.0 | Safetensors, GGUF | Modelo generico, sin razonamiento explicito, tool calling limitado |

La comparativa se basa en caracteristicas publicas; no se dispone de datos de rendimiento comparativos para esta version decensored.

## Limitaciones y advertencias

- La eliminacion de las capas de rechazo implica que el modelo puede generar contenido ofensivo, violento, sexualmente explicito o peligroso sin restricciones. Su uso debe limitarse a entornos controlados y con fines legitimos.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos, citas o referencias, especialmente en temas especializados.
- Solo se declara soporte para ingles; el rendimiento en otros idiomas puede ser inferior al del modelo original.
- La licencia Apache-2.0 permite uso comercial, pero el responsable del despliegue asume la responsabilidad legal y etica del contenido generado.
- No se dispone de informacion sobre la calidad de la cuantizacion imatrix en terminos de perplejidad o degradacion de tareas; se recomienda evaluar el modelo en el caso de uso concreto antes de ponerlo en produccion.
- El repositorio actual solo contiene el archivo de imatrix; para obtener los pesos cuantizados completos hay que acceder al repositorio hermano o generar las cuantizaciones manualmente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/granite-4.2-8b-decensored-i1-GGUF
- Modelo base (decensored): https://huggingface.co/qcokvd1/granite-4.2-8b-decensored
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/granite-4.2-8b-decensored-GGUF
- Repositorio GitHub de IBM Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Documentacion oficial de Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Pagina de descarga y listado de archivos: https://hf.tst.eu/model#granite-4.2-8b-decensored-i1-GGUF
