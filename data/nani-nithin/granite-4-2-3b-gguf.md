# NANI-Nithin/granite-4.2-3b-GGUF

## Resumen

Granite 4.2 3B es un modelo de lenguaje denso de tipo decoder-only desarrollado por IBM dentro de la familia Granite 4.2. Este repositorio concreto, publicado por NANI-Nithin, ofrece cuantizaciones GGUF listas para usar con llama.cpp, que permiten ejecutar el modelo en entornos locales sin necesidad de convertirlo manualmente. El modelo base se caracteriza por una ventana de contexto de 128.000 tokens, soporte de razonamiento con un modo de pensamiento activable y capacidades de tool calling, lo que lo hace adecuado para tareas de agente y generación de código.

La relevancia de este repo radica en que simplifica el despliegue en hardware modesto: las cuantizaciones van desde BF16 (referencia, ~6,5 GB) hasta IQ2_M (ultracomprimida), lo que permite adaptar el uso según la VRAM disponible. El modelo original está licenciado bajo Apache 2.0, lo que facilita su uso comercial y su integración en pipelines propietarios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraniteForCausalLM (dense decoder-only) con GQA, SwiGLU y RoPE |
| Parametros totales | 3.659.737.600 (~3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_1, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_NL, IQ4_XS, IQ3_M, IQ3_XS, IQ3_XXS, IQ2_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de solo decodificador con atencion por grupos (GQA), MLP con SwiGLU y posicionamiento RoPE. IBM ha publicado que los modelos Granite 4.2 se postentrenan sobre las bases de Granite 4.1, que ya fueron preentrenadas con un corpus extenso. No se han publicado detalles especificos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion disponible.

La arquitectura destaca porque las embeddings de entrada y salida no estan compartidas, lo que hace que el GGUF incluya un peso de salida separado y sea ligeramente mas grande que otros modelos de 3B con embeddings atados. El modelo soporta un modo de razonamiento activable (`enable_thinking`) que genera un bloque de `thinking` antes de la respuesta final, con niveles de esfuerzo `low` y `high`.

## Capacidades

- Generacion de texto general y conversacion multi-turno.
- Razonamiento con modo de pensamiento activable (thinking mode) que permite controlar la profundidad del razonamiento.
- Tool calling y generacion de JSON estructurado, pensado para flujos agente y RAG.
- Generacion de codigo y tareas de ingenieria de software, incluyendo terminal y depuracion.
- Capacidades matematicas basicas y resolucion de problemas logicos.
- Soporte nativo en llama.cpp y llama-cpp-python, sin necesidad de fork.
- Ventana de contexto de 128K tokens para documentos largos y conversaciones extendidas.

## Casos de uso

- **Asistentes de desarrollo local**: el modelo puede integrarse en editores de codigo o CLI para autocompletar funciones, explicar fragmentos o generar tests. Su cuantizacion Q4_K_M permite ejecutarlo en portatiles con 8 GB de RAM.
- **Atencion al cliente automatizada**: con 128K de contexto y modo thinking, puede gestionar conversaciones multi-turno manteniendo el historial completo y resolver consultas con razonamiento estructurado.
- **Agentes de automatizacion**: el soporte de tool calling permite conectarlo a APIs y ejecutar acciones como consultar bases de datos o llamar a servicios externos, siendo util para pipelines de integracion continua.
- **RAG sobre documentacion interna**: su ventana de contexto amplia permite procesar documentos largos completos, mejorando la calidad de las respuestas basadas en recuperacion.
- **Prototipado de aplicaciones de IA**: al ser Apache 2.0, se puede usar en entornos de desarrollo sin restricciones de licencia y desplegar en contenedores ligeros.
- **Analisis de log y depuracion**: el modelo puede resumir logs extensos o detectar patrones de error gracias a su entrenamiento en tareas de software engineering.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K para este modelo. Se recomienda consultar la documentacion oficial de IBM Granite 4.2 para obtener datos de evaluacion del modelo base.

## Requisitos de hardware

- **VRAM estimada**: el archivo BF16 pesa ~6,5 GB; Q8_0 ~3,5 GB; Q6_K ~2,8 GB; Q5_K_M ~2,4 GB; Q4_K_M ~2,0 GB; Q3_K_M ~1,6 GB; IQ2_M ~1,2 GB. Para inferencia con GPU, la VRAM debe superar el tamaño del archivo (mas overhead).
- **GPU recomendadas**: una RTX 4060 con 8 GB VRAM puede ejecutar cuantizaciones hasta Q8_0; una RTX 3090/4090 o A100 permite BF16 con margen. En CPU, llama.cpp funciona en procesadores modernos con 16 GB de RAM.
- **Compatibilidad**: el modelo se ejecuta en llama.cpp, llama-cpp-python, Ollama y cualquier runtime compatible con GGUF.
- **Latencia**: en una RTX 4090, la generacion de tokens con Q4_K_M es de aproximadamente 40-60 tokens/segundo (estimacion basada en modelos de 3B similares). En CPU, la velocidad baja a 5-10 tokens/segundo dependiendo del hardware.
- **Despliegue**: se puede servir con llama.cpp server, Ollama o integrandolo en aplicaciones Python con llama-cpp-python.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Arquitectura | Notas |
|---|---|---|---|---|---|
| Granite 4.2 3B (este repo) | ~3B | 128K | Apache 2.0 | Dense decoder-only | GGUF listos para llama.cpp |
| Qwen 2.5 3B | 3.09B | 128K | Apache 2.0 | Dense decoder-only | Soporte multilenguaje y tool calling |
| Llama 3.2 3B | 3.21B | 128K | Llama 3.2 | Dense decoder-only | Optimizado para edge, no tiene thinking mode |
| Phi-3.5-mini | 3.82B | 128K | MIT | Dense decoder-only | Buen rendimiento en razonamiento, pero sin tool calling nativo |

Nota: los datos de los modelos comparados son de conocimiento general y pueden variar segun la version. La principal diferencia de Granite 4.2 es el modo de razonamiento activable y el soporte explicito de tool calling en un modelo de 3B.

## Limitaciones y advertencias

- **Idioma**: el modelo solo soporta ingles. No es adecuado para tareas en espanol o otros idiomas sin traduccion previa.
- **Alucinacion**: como cualquier LLM, puede generar informacion incorrecta o inventada, especialmente en tareas de razonamiento complejo si no se usa el modo thinking.
- **Sesgos**: no se han publicado evaluaciones de sesgo para este modelo; el entrenamiento en corpus de codigo y datos generales puede reflejar sesgos presentes en esos datos.
- **Contexto largo**: aunque soporta 128K tokens, la calidad de atencion puede degradarse en los extremos del contexto, y el consumo de memoria aumenta linealmente con la longitud.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base tiene restricciones de exportacion y cumplimiento de normas de IA en algunas jurisdicciones; consultar la documentacion oficial de IBM.
- **Cuantizaciones extremas**: las versiones Q2_K e IQ2_M pueden degradar significativamente la calidad del modelo; no recomendadas para tareas de razonamiento.
- **Repositorio**: el repo tiene 0 descargas y 0 likes, lo que indica que es una publicacion reciente y no ha sido validado por la comunidad; se recomienda probar antes de usarlo en produccion.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/NANI-Nithin/granite-4.2-3b-GGUF
- Modelo base (safetensors): https://huggingface.co/ibm-granite/granite-4.2-3b
- Coleccion oficial de GGUF de IBM: https://huggingface.co/collections/ibm-granite/granite-gguf-models-68decbb77a9ca2800a9b00e3
- Documentacion de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio de codigo de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
