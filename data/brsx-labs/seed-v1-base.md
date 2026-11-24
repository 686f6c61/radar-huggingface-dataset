# brsx-labs/seed-v1-base

## Resumen

Seed-v1-Base es un modelo de lenguaje causal de tipo decoder-only Transformer desarrollado por BRSX Labs. Se trata de un modelo base preentrenado, no afinado para instrucciones, con aproximadamente 100 millones de parametros y un contexto de 2048 tokens. Su entrenamiento se realizo mediante prediccion autorregresiva del siguiente token sobre un corpus de 6000 millones de tokens, lo que lo situa en la categoria de modelos pequenos orientados a experimentacion e investigacion.

El modelo sigue una arquitectura estandar de transformer moderno: 12 capas, tamano oculto de 768, atencion con 12 cabezas de consulta y 4 cabezas clave/valor (atencion agrupada), capa intermedia de 2048, activacion SwiGLU, normalizacion RMSNorm, codificacion posicional RoPE y embeddings de entrada y salida compartidos. El vocabulario es de 32 000 tokens.

Su relevancia actual radica en que ofrece una base ligera y con licencia Apache 2.0 para quienes desean experimentar con tecnicas de preentrenamiento, ajuste supervisado (SFT) o adaptacion de dominio sin los requisitos de hardware de modelos de mayor tamano. No obstante, al ser un modelo base y no un chatbot, no esta preparado para conversacion directa ni para tareas de instrucciones sin un ajuste posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer |
| Parametros totales | Aproximadamente 100M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (la model card menciona una implementacion propia de inferencia en PyTorch) |

## Arquitectura y entrenamiento

Seed-v1-Base es un transformer decoder-only con 12 capas, tamano oculto de 768 y capa intermedia de 2048. Emplea atencion multi-cabeza con 12 cabezas de consulta y 4 cabezas clave/valor, lo que corresponde a atencion con claves y valores agrupados (GQA). La activacion es SwiGLU, la normalizacion es RMSNorm y la codificacion posicional es RoPE. Los embeddings de entrada y salida estan compartidos (tied embeddings), y el vocabulario es de 32 000 tokens.

El preentrenamiento se realizo con un objetivo autorregresivo de prediccion del siguiente token sobre 6 mil millones de tokens. La model card no especifica la composicion del dataset, si hubo fases de RLHF o DPO, ni detalles sobre el proceso de entrenamiento mas alla del numero de tokens. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autorregresiva y continuacion de texto a partir de un prompt.
- Base para ajuste supervisado (SFT) y adaptacion a dominios especificos.
- Experimentacion con estrategias de entrenamiento y adaptacion de modelos.
- Exploracion educativa de arquitecturas transformer.
- Capacidad multilingue limitada al ingles segun la model card.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking mode), vision ni audio.
- Al ser un modelo base, no esta afinado para seguir instrucciones ni para mantener conversaciones.

## Casos de uso

- Ajuste supervisado para tareas de generacion de texto: el modelo puede fine-tunearse con datasets especificos para producir texto en un dominio concreto, aprovechando su tamano reducido para iterar rapidamente en experimentos.
- Adaptacion de dominio: partiendo de los pesos preentrenados, se puede continuar el preentrenamiento con corpus especializados (por ejemplo, textos tecnicos o legales) para adaptar el modelo a un vocabulario y estilo determinados.
- Investigacion sobre arquitecturas transformer: su configuracion estandar (RoPE, RMSNorm, SwiGLU, GQA) lo convierte en una base didactica para estudiar el efecto de cambios en el preentrenamiento o en la arquitectura.
- Generacion de texto y continuacion en entornos con recursos limitados: al tener aproximadamente 100M de parametros, puede ejecutarse en hardware de gama baja para pruebas de generacion de texto.
- Experimentacion con estrategias de entrenamiento: sirve como banco de pruebas para comparar tecnicas de inicializacion, tasas de aprendizaje o composicion de datos sin incurrir en costes elevados.
- Prototipado de pipelines de NLP: puede integrarse como componente generativo en prototipos donde no se requiera alta calidad conversacional, gracias a su bajo coste de inferencia y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con aproximadamente 100M de parametros, la huella en precision FP32 seria del orden de 0,4 GB solo en pesos, y menor en FP16 o cuantizaciones de 8 y 4 bits, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: no disponible. Por tamano, el modelo es susceptible de ejecutarse en GPUs consumer, pero no se especifican modelos concretos.
- Cabe en GPU consumer: previsiblemente si, dado el reducido numero de parametros, aunque no se confirma en la documentacion.
- Opciones de despliegue: la model card menciona una implementacion propia de inferencia en PyTorch mediante un script `chat.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos ni datos de rendimiento que permitan establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Es un modelo base preentrenado, no un chatbot afinado para instrucciones; no debe esperarse un comportamiento conversacional ni seguimiento de instrucciones sin ajuste previo.
- El unico idioma declarado es el ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- La longitud de contexto es de 2048 tokens, inferior a la de modelos contemporaneos de mayor tamano.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; como todo modelo preentrenado, puede reproducir sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no esta disenado ni validado para aplicaciones en produccion sin un ajuste y una evaluacion adicionales.
- No se especifican los formatos de pesos ni los tipos de cuantizacion soportados, lo que limita la planificacion de despliegue.
- No se documenta la composicion del dataset de entrenamiento, lo que dificulta evaluar riesgos de contaminacion o sesgos.

## Enlaces

- Hugging Face: https://huggingface.co/brsx-labs/seed-v1-base
