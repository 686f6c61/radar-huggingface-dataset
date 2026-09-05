# mradermacher/Morphy-360M-GGUF

## Resumen

Morphy-360M-GGUF es una cuantizacion GGUF del modelo Morphy-360M, desarrollado por moolvylabs y publicado por mradermacher. El modelo base es un modelo de lenguaje de aproximadamente 360 millones de parametros, etiquetado en HuggingFace como asistente de correo electronico y conversacional. Esta version concreta ofrece los pesos en formato GGUF, lo que permite ejecutar el modelo en hardware modesto mediante runtimes como llama.cpp u Ollama.

El problema que resuelve es el despliegue local de un modelo de lenguaje pequeno con licencia permisiva Apache-2.0, sin necesidad de infraestructura de servidores. Su relevancia actual radica en que los modelos compactos de 360M son adecuados para aplicaciones de edge, prototipado rapido y tareas de generacion de texto corto, especialmente cuando se busca reducir costes y latencia. La arquitectura exacta y la longitud de contexto no estan documentadas en la informacion disponible.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la libreria transformers y el pipeline text-generation sugieren un modelo de lenguaje causal, pero no se especifica la arquitectura exacta) |
| Parametros totales | 361.822.080 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base esta disponible en safetensors) |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna del modelo Morphy-360M en los datos proporcionados: no se indican numero de capas, tipo de atencion, vocabulario ni detalles de la configuracion. El modelo base, moolvylabs/Morphy-360M, esta catalogado como un modelo para generacion de texto en la libreria transformers, y las etiquetas del repositorio GGUF sugieren que se trata de un modelo de lenguaje causal autoregresivo, pero esto no es confirmable con la documentacion disponible.

Tampoco se dispone de datos sobre los datos de entrenamiento: no se mencionan tokens totales, composicion del dataset ni procesos de alineacion como RLHF o DPO. La unica informacion sobre su proposito proviene de la etiqueta "email-assistant", que indica que fue disenado para asistir en tareas de correo electronico.

## Capacidades

- Generacion de texto en ingles, segun el idioma declarado.
- Etiquetado como "email-assistant" y "conversational", lo que apunta a un uso previsto como asistente conversacional para correo electronico.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni ningun modo de pensamiento especial.
- No se especifica la longitud de contexto, por lo que la capacidad de gestionar conversaciones largas o documentos extensos no esta confirmada.

## Casos de uso

- Asistente de correo electronico local: gracias a su etiquetado como email-assistant y su tamano compacto, puede integrarse en aplicaciones de escritorio para redactar respuestas breves, sugerir tonos o generar borradores de correo sin depender de servicios en la nube.
- Chatbot conversacional simple: el formato GGUF permite ejecutarlo en entornos de baja latencia, como kioscos o asistentes de soporte de primera linea, para respuestas cortas y automatizadas.
- Prototipado rapido de aplicaciones NLP: su licencia Apache-2.0 y su tamano reducido facilitan experimentos de generacion de texto en equipos de desarrollo, sin costes de API ni restricciones de uso comercial.
- Clasificacion y etiquetado de texto: al ser un modelo base, puede ser afinado para tareas como deteccion de spam, clasificacion de correos por categoria o analisis de sentimiento, siempre que el dataset de afinado sea pequeno.
- Herramientas de autocompletado de texto: su naturaleza generativa permite usarlo como motor de sugerencias en editores de texto o IDEs para completar frases o lineas cortas de codigo, con un coste computacional minimo.
- Educacion y experimentacion: es un modelo adecuado para ensenar los fundamentos de los modelos de lenguaje y de la cuantizacion GGUF, ya que puede ejecutarse en CPUs y GPUs de gama baja, y su tamano permite iterar rapidamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los archivos GGUF van de 0,3 GB (Q2_K) a 0,8 GB (f16). Sumando el overhead de la cache KV, se estima que el modelo requiere entre 0,5 y 1,5 GB de VRAM, dependiendo de la cuantizacion y de la longitud de secuencia.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM, por ejemplo una NVIDIA GTX 1650, RTX 3060 o similar. Tambien puede ejecutarse en CPU con llama.cpp, aunque la velocidad sera menor.
- Si cabe en GPU de consumo: si, es un modelo muy ligero y puede ejecutarse en portatiles con GPU integrada o en placas de bajo consumo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier otro runtime que soporte archivos GGUF. No es compatible de forma nativa con vLLM o TGI.
- Latencia y throughput: no se dispone de mediciones oficiales. Para un modelo de 360M, la latencia en GPU suele ser muy baja, pero depende del hardware, de la cuantizacion y del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Idioma |
|---|---|---|---|---|---|
| Morphy-360M-GGUF | 361.822.080 | No disponible | GGUF | Apache-2.0 | en |
| SmolLM2-360M-GGUF | ~360M | No disponible en la informacion | GGUF | Apache-2.0 | en |
| Sophira-360M-base-GGUF | ~360M | No disponible en la informacion | GGUF | Apache-2.0 | it |

No se disponen de datos de benchmarks para ninguno de estos modelos en la informacion disponible. Todos comparten un tamano similar y han sido cuantizados por mradermacher. SmolLM2-360M es un modelo base de HuggingFace, mientras que Sophira-360M-base esta orientado al italiano. La diferencia funcional principal de Morphy es su etiquetado como asistente de correo electronico.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos, riesgos de alucinacion o evaluaciones de seguridad.
- Al tratarse de un modelo de solo 360M de parametros, su capacidad para razonamiento complejo, matematicas o generacion de codigo extenso es muy limitada.
- Solo soporta el idioma ingles, segun la ficha del modelo.
- La longitud de contexto no esta documentada, lo que impide planificar casos de uso que requieran dependencias largas o documentos extensos.
- La cuantizacion es estatica (sin matrices de importancia) y algunas variantes como Q3_K_M estan marcadas como de menor calidad en la tabla original. Se recomienda usar Q4_K_M, Q6_K o Q8_0 para una calidad mas estable.
- La licencia Apache-2.0 permite uso comercial, pero requiere mantener el aviso de licencia y atribucion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Morphy-360M-GGUF
- Modelo base: https://huggingface.co/moolvylabs/Morphy-360M
- Pagina de descarga alternativa (segun el README): https://hf.tst.eu/model#Morphy-360M-GGUF
