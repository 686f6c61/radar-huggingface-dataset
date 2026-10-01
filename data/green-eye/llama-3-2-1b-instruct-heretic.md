# Green-Eye/Llama-3.2-1B-Instruct-heretic

## Resumen

Llama-3.2-1B-Instruct-heretic es una variante "decensored" del modelo meta-llama/Llama-3.2-1B-Instruct, publicada en HuggingFace por el usuario Green-Eye. El modelo se ha generado con la herramienta Heretic v1.2.0, que aplica una tecnica de ablacion direccional (conocida como "abliteration") sobre los pesos del transformer en lugar de un ajuste fino adicional. El objetivo es suprimir el comportamiento de rechazo (refusal) aprendido durante el alineamiento del modelo base, manteniendo en la medida de lo posible el conocimiento y la capacidad de seguir instrucciones originales. El resultado declarado es una reduccion de rechazos del 96 por ciento al 7 por ciento sobre 100 prompts adversariales, con una divergencia KL de 0,1713 respecto al modelo original.

Con 1.235.814.400 parametros reales medidos en safetensors, se trata de un modelo denso de escala pequena, pensado para despliegue en dispositivo, movil y entornos edge, o para ejecucion en GPU de consumo e incluso solo con CPU. Hereda del base la arquitectura transformer decoder-only de Llama 3.2 y su ventana de contexto, asi como los ocho idiomas declarados en la model card (ingles, aleman, frances, italiano, portugues, hindi, castellano y tailandes). Se distribuye tanto en formato safetensors como en un conjunto completo de 14 cuantizaciones GGUF mas F16.

Su relevancia actual es doble. Por un lado, es un ejemplo practico y reproducible de modificacion de pesos dirigida a eliminar direcciones de rechazo sin reentrenar, util para investigacion sobre mecanismos de alineamiento y sobre como se codifica la negativa a responder en modelos pequenos. Por otro, cubre un nicho de despliegue local sin filtros de seguridad, orientado a agentes locales, roleplay y experimentacion. El autor advierte explicitamente de que no existe capa de filtrado adicional y de que el modelo no gana capacidad ni criterio por el hecho de estar "abliterado".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2, con Grouped-Query Attention), modelo denso |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama-3.2-1B-Instruct; no se explicita en la model card) |
| Tipos de cuantizacion | GGUF: F16, Q2_K, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_0, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ademas safetensors en precision completa |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.2 Community License (heredada del modelo base) |
| Formato de pesos | safetensors (transformers/PyTorch) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Meta Llama-3.2-1B-Instruct, un transformer decoder-only denso con atencion de consultas agrupadas (GQA) y tokenizador compartido con la familia Llama 3. No hay cambios estructurales: la intervencion es puramente sobre los pesos. Heretic v1.2.0 aplica ablacion direccional, una tecnica que identifica una direccion en el espacio de activaciones asociada al comportamiento de rechazo y modifica los pesos que proyectan sobre esa direccion, en lugar de recurrir a RLHF, DPO o fine-tuning supervisado.

Segun los parametros publicados en la model card, la edicion se concentra en dos proyecciones concretas: la salida de atencion (`attn.o_proj`) y las proyecciones descendentes del MLP (`mlp.down_proj`). En el caso de `attn.o_proj` se usan max_weight 1,40 en la posicion 10,94 y min_weight 0,54 a distancia 5,45; en `mlp.down_proj`, max_weight 1,41 en la posicion 14,54 y min_weight 0,66 a distancia 6,16, con un `direction_index` de 12,95. Estos valores definen una edicion estrecha y localizada, coherente con la divergencia KL declarada de 0,1713 frente al modelo original. No se especifican en la informacion disponible los datos de entrenamiento (numero de tokens, composicion del dataset) ni si hubo fases adicionales de RLHF o DPO posteriores a la ablacion, por lo que se asume que el modelo conserva el entrenamiento original de Llama-3.2-1B-Instruct sin cambios en ese aspecto.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat compatible con `apply_chat_template` de transformers.
- Seguimiento de instrucciones heredado del modelo Instruct original, no reforzado por la ablacion.
- Razonamiento basico y respuesta a preguntas dentro de los limites propios de un modelo de 1B parametros.
- Cumplimiento de peticiones que el modelo base rechazaria, incluida parte del contenido que el autor considera que no deberia cumplirse.
- Cobertura multilingue en ocho idiomas declarados: ingles, aleman, frances, italiano, portugues, hindi, castellano y tailandes.
- Ejecucion local en CPU, GPU de consumo, movil y edge gracias al tamano reducido y a las cuantizaciones GGUF de hasta 554 MB.
- Compatibilidad con inferencia en llama.cpp, Ollama, LM Studio, Jan, vLLM y SGLang.
- No se documenta soporte explicito de tool calling, function calling, vision, audio ni modo de razonamiento extendido (thinking mode) en la informacion disponible.
- No se documenta un modo de agente o multi-step reasoning especifico mas alla de lo que permita el prompt y la ventana de contexto.

## Casos de uso

- Investigacion sobre alineamiento y refusal: comparar las activaciones del modelo base y de esta variante sobre el mismo prompt permite estudiar como se representa la negativa a responder en un transformer de 1B y validar tecnicas de ablacion direccional de forma reproducible.
- Agentes locales sin restricciones de contenido: en entornos de laboratorio o desarrollo propio, el modelo puede gestionar bucles de conversacion y generacion de texto donde el modelo base bloquearia la peticion, con un coste de VRAM minimo.
- Roleplay y generacion creativa: su tamano permite iterar rapido en historias interactivas o personajes, aunque la coherencia a largo plazo queda limitada por la propia capacidad del modelo de 1B.
- Despliegue en movil o edge: con la cuantizacion Q4_K_M (770 MB) o Q2_K (554 MB) cabe en RAM de sistema y permite inferencia offline en dispositivos sin GPU dedicada.
- Prototipado rapido de pipelines de generacion de texto: sirve como sustituto barato del modelo base durante el desarrollo de una aplicacion, antes de escalar a modelos mayores.
- Pruebas de robustez y red teaming: evaluar la eficacia de tecnicas de abliteracion y medir la degradacion de capacidades mediante la divergencia KL y tasas de rechazo permite disenar mejores protocolos de evaluacion.
- Educacion e investigacion en seguridad de modelos: analizar la diferencia entre 96/100 y 7/100 rechazos sobre el mismo conjunto de prompts adversariales ofrece un caso de estudio concreto sobre los limites del alineamiento basado en RLHF.
- Generacion de texto en idiomas minoritarios dentro de los soportados: cubre castellano, hindi y tailandes sin necesidad de infraestructura en la nube.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son la divergencia KL frente al modelo original y la tasa de rechazos sobre 100 prompts adversariales. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica | Este modelo | Modelo original (meta-llama/Llama-3.2-1B-Instruct) |
|---|---|---|
| Divergencia KL | 0,1713 | 0 (por definicion) |
| Rechazos | 7/100 | 96/100 |

## Requisitos de hardware

- Peso de los pesos en precision nativa (F16): aproximadamente 2,31 GB, mas alrededor de 1 GB adicional para el contexto.
- VRAM estimada segun cuantizacion: Q8_0 1,23 GB; Q6_K 974 MB; Q5_K_M 869 MB; Q5_K_S 851 MB; Q4_K_M 770 MB; Q4_1 793 MB; Q4_0 735 MB; Q4_K_S 740 MB; IQ4_XS 714 MB; Q3_K_L 699 MB; Q3_K_M 659 MB; IQ3_S 614 MB; Q3_K_S 612 MB; Q2_K 554 MB.
- GPU recomendadas segun la propia model card: RTX 3060 / 4070 / 5070 (12 GB) con Q8_0; RTX 4060 / 3070 (8 GB) con Q6_K; GTX 1660 Super / 2060 / 3050 laptop (6 GB) con Q5_K_M.
- CPU sin GPU o Apple Silicon: Q4_K_M (770 MB) cabe en RAM de sistema.
- Cabe en cualquier GPU de consumo actual, incluidas tarjetas de gama de entrada y portatiles, y tambien en dispositivos moviles con cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, vLLM, SGLang y transformers. El autor incluye un ejemplo con `llama serve -hf` y otro con `AutoModelForCausalLM.from_pretrained`.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Refusal behavior | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Green-Eye/Llama-3.2-1B-Instruct-heretic | 1,235 B | 128.000 tokens (heredado) | Reducido (7/100 rechazos, KL 0,1713) | Llama 3.2 Community License | safetensors + 14 cuantizaciones GGUF |
| meta-llama/Llama-3.2-1B-Instruct | aprox. 1,24 B | 128.000 tokens | Estandar alineado (96/100 rechazos) | Llama 3.2 Community License | safetensors, GGUF (via conversion) |
| saidutta69/Qwen2.5-0.5B-Instruct-heretic | aprox. 0,5 B (segun denominacion) | no disponible | Reducido (variante heretic) | no disponible en la informacion proporcionada | no disponible |
| saidutta69/Qwen2.5-3B-Instruct-heretic | aprox. 3 B (segun denominacion) | no disponible | Reducido (variante heretic) | no disponible en la informacion proporcionada | no disponible |

No se dispone de datos de rendimiento comparativo (benchmarks estandar) entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, comportamiento de rechazo declarado y licencia.

## Limitaciones y advertencias

- La ablacion elimina direcciones de rechazo, pero no anade capacidad, conocimiento ni criterio: el modelo conserva las limitaciones factuales y los sesgos de Llama-3.2-1B-Instruct.
- No existe capa de filtrado de seguridad. El propio autor advierte de que el modelo cumplira peticiones que el base rechazaria, incluidas algunas que no deberia cumplir.
- Riesgo elevado de alucinacion y de respuestas incorrectas, propio de un modelo de 1B parametros; el autor indica que la intervencion no mejora la calidad de las respuestas.
- El autor desaconseja explicitamente exponerlo en un endpoint publico sin moderacion que atienda a terceros.
- La ventana de contexto de 128.000 tokens es un dato heredado del modelo base y no se confirma de forma explicita en la model card de esta variante; conviene verificarla antes de disenar aplicaciones que dependan de contexto muy largo.
- El rendimiento real multilingue, especialmente en hindi y tailandes, no esta validado con benchmarks en la informacion disponible.
- Restricciones de licencia: hereda la Llama 3.2 Community License, que incluye condiciones de uso comercial, clausulas de atribucion y la exigencia de nombrar el modelo como "Llama 3.2" en los productos derivados, ademas de restricciones para empresas con mas de 700 millones de usuarios mensuales.
- El modelo no documenta soporte de tool calling ni function calling, por lo que integrarlo en pipelines de agentes que dependan de llamadas a herramientas requeriria verificar ese comportamiento empiricamente.
- Inconsistencia en la model card: los ejemplos de codigo y el comando de descarga apuntan al repositorio `saidutta69/Llama-3.2-1B-Instruct-heretic`, mientras que el identificador de HuggingFace de esta ficha es `Green-Eye/Llama-3.2-1B-Instruct-heretic`. Conviene verificar cual es el repositorio efectivo antes de descargar.
- La fecha de creacion registrada en HuggingFace (2026-09-30) y el uso de una imagen alojada en un dominio externo no verificable son elementos que conviene contrastar antes de usar el modelo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Green-Eye/Llama-3.2-1B-Instruct-heretic
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Llama 3.2 Community: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- Modelo relacionado, Qwen2.5-0.5B-Instruct-heretic: https://huggingface.co/saidutta69/Qwen2.5-0.5B-Instruct-heretic
- Modelo relacionado, Qwen2.5-3B-Instruct-heretic: https://huggingface.co/saidutta69/Qwen2.5-3B-Instruct-heretic
- Modelo relacionado, Qwen2.5-Coder-3B-Instruct-heretic: https://huggingface.co/saidutta69/Qwen2.5-Coder-3B-Instruct-heretic

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; los enlaces anteriores proceden exclusivamente de la informacion de HuggingFace y de la model card.
