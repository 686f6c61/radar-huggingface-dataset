# mlasli/Qwen3.8-27B-Heretic-Uncensored-Q6_K-GGUF

## Resumen

El modelo `mlasli/Qwen3.8-27B-Heretic-Uncensored-Q6_K-GGUF` es una versión modificada del modelo Qwen3.8-27B de Alibaba, a la que se le ha eliminado la dirección de rechazo (refusal direction) mediante la técnica de abliteración llamada Heretic. El resultado es un modelo de generación de texto que responde de forma directa a instrucciones que normalmente activarían respuestas evasivas o negativas por parte del modelo original. Esta versión concreta está cuantizada en formato GGUF con precisión Q6_K, lo que permite ejecutarla con llama.cpp y herramientas compatibles.

El autor, mlasli, publica este modelo con licencia Apache-2.0 y lo orienta a casos de uso como roleplay y generación de contenido sin censura. La abliteración se aplica únicamente sobre la capa lingüística, preservando el resto de capacidades del modelo base. Según la evaluación independiente citada en la model card, la tasa de cumplimiento (compliance) es del 94,0% y la tasa de rechazo según el detector de Zou es del 6,0%, con una divergencia KL de primer token de 0,0467 respecto al modelo base.

El modelo tiene aproximadamente 26,9 mil millones de parámetros y el archivo GGUF Q6_K ocupa 22,1 GB. Está diseñado para su uso con llama.cpp (arquitectura `qwen35`). No se especifican detalles sobre la longitud de contexto ni la arquitectura interna, más allá de que se trata de una variante de la familia Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B, presumiblemente transformer) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (GGUF) |
| Idiomas soportados | ingles (segun model card: `language: [en]`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizacion Q6_K) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Qwen3.8-27B. Dado que pertenece a la familia Qwen3, es probable que use una arquitectura transformer con atencion por ventanas y posiblemente un mecanismo de mezcla de expertos, pero estos datos no estan disponibles en la informacion proporcionada.

El proceso de modificacion aplicado es la abliteracion mediante la herramienta [Heretic](https://github.com/mlabonne/heretic-llm). Esta tecnica identifica la direccion de rechazo aprendida durante el alineamiento de seguridad y la elimina de los pesos del modelo en un solo paso. A diferencia de enfoques multidireccionales, Heretic realiza una abliteracion de una sola direccion y utiliza una busqueda de hiperparametros con Optuna para encontrar el punto optimo en el frente de Pareto entre cumplimiento y divergencia de primer token. El resultado es una reduccion significativa de las respuestas de rechazo manteniendo la mayor parte de las capacidades del modelo original.

No se proporcionan datos sobre el entrenamiento original del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO).

## Capacidades

- Generacion de texto libre en ingles, con respuestas directas y sin rechazos a instrucciones que el modelo base podria considerar problematicas.
- Alta tasa de cumplimiento: 94,0% en una evaluacion de 50 prompts de comportamientos daninos (segun el detector de rechazo de Zou).
- Baja tasa de rechazo: 6,0% segun el detector de Zou, aunque un detector combinado de palabras clave reporto 18,0% (la model card indica que estos son en gran parte falsos positivos).
- Preservacion de las capacidades linguisticas del modelo base, segun la model card (la abliteracion solo afecta a la direccion de rechazo).
- Adecuado para roleplay y conversacion sin restricciones de contenido.
- No se mencionan capacidades de tool calling, agentes, vision, audio ni otros modos especiales en la informacion disponible.

## Casos de uso

- Roleplay y ficcion interactiva: el modelo puede mantener personajes y tramas sin rechazar solicitudes de contenido adulto o violento, lo que lo hace util para juegos de rol textuales.
- Escritura creativa sin filtros: generacion de narrativas, dialogos o poesia que aborden temas tabu sin evasivas.
- Simulacion de personajes con personalidad "hereje": para proyectos de entretenimiento donde se necesita un asistente que responda de forma provocadora o irreverente.
- Investigacion sobre alineacion y seguridad: como caso de estudio de abliteracion y sus efectos en el comportamiento del modelo.
- Generacion de contenido para comunidades de rol en linea: integracion en bots de Discord o sistemas de chat que requieran respuestas sin censura.
- Pruebas de robustez de sistemas de moderacion: el modelo puede usarse para generar entradas que pongan a prueba filtros de contenido en aplicaciones de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye una evaluacion independiente del modelo fusionado (no cuantizado) sobre comportamientos daninos:

| Metrica | Valor |
|---|---|
| Compliance (detector de Zou, 50 prompts) | 94,0% |
| Tasa de rechazo (Zou 29-substring) | 6,0% |
| Tasa de rechazo (detector combinado de palabras clave) | 18,0% (falsos positivos en su mayoria) |
| Divergencia KL de primer token vs. modelo base | 0,0467 |

Estos datos indican que la abliteracion reduce drasticamente los rechazos manteniendo una salida similar al modelo base en terminos de distribucion de tokens. No hay informacion sobre rendimiento en tareas de razonamiento, codigo o matematicas.

## Requisitos de hardware

- El archivo GGUF Q6_K ocupa 22,1 GB, por lo que se estima que la inferencia requiere al menos 22-24 GB de VRAM si se carga completamente en memoria.
- GPU recomendadas: tarjetas con 24 GB de VRAM como NVIDIA RTX 3090, RTX 4090, A5000, A10 o similares. En GPU con menos memoria, se puede usar cuantizaciones menores (Q4_K_M, Q5_K_M) que reducen el requisito a unos 16-18 GB.
- No cabe en GPUs de consumo con 8-12 GB (como RTX 3060 o RTX 4070) en su version Q6_K, pero si con cuantizaciones mas agresivas (Q2_K o Q3_K) podria funcionar con limitaciones.
- Despliegue recomendado con llama.cpp (arquitectura `qwen35`), o mediante herramientas compatibles como Ollama, LM Studio o text-generation-webui.
- Tambien puede usarse con transformers, aunque la model card muestra un ejemplo de carga que parece incorrecto (usa `AutoModelForImageTextToText` en lugar de `AutoModelForCausalLM`); para GGUF se recomienda usar llama.cpp.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada comparaciones con otros modelos abliterados o cuantizados de tamano similar.

## Limitaciones y advertencias

- La abliteracion elimina la alineacion de seguridad del modelo. Esto significa que puede generar contenido danino, ilegal o eticamente problematico sin filtros.
- El modelo solo soporta ingles segun la model card; no se garantiza un buen rendimiento en otros idiomas.
- No se dispone de informacion sobre la longitud de contexto, lo que puede limitar su uso en aplicaciones que requieran ventanas largas.
- La evaluacion de cumplimiento se realizo con solo 50 prompts y puede no ser representativa de todos los escenarios.
- Aunque la licencia es Apache-2.0, el uso comercial debe considerar las implicaciones legales de generar contenido sin restricciones.
- El modelo puede presentar sesgos y alucinaciones propios del modelo base, aunque no se han documentado en la informacion disponible.
- Para entornos de produccion, se recomienda implementar sistemas de moderacion externos si se desea evitar la generacion de contenido inapropiado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Uncensored-Q6_K-GGUF)
- [Repositorio Heretic](https://github.com/mlabonne/heretic-llm)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
