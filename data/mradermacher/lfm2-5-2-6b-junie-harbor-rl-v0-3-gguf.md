# mradermacher/LFM2.5-2.6B-junie-harbor-rl-v0.3-GGUF

## Resumen

LFM2.5-2.6B-junie-harbor-rl-v0.3-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo base LFM2.5-2.6B-junie-harbor-rl-v0.3, publicado por el usuario vvsotnikov en Hugging Face. El repositorio lo mantiene mradermacher, un autor conocido por generar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base pertenece a la familia LFM2.5 de Liquid AI, una arquitectura disenada para inferencia eficiente en dispositivos, aunque la model card del repositorio no aporta detalles adicionales sobre el entrenamiento o la arquitectura concreta de esta variante.

La relevancia de este repositorio es practica: ofrece los pesos del modelo ya convertidos a GGUF con multiples niveles de cuantizacion (desde Q2_K hasta F16), lo que permite desplegarlo en hardware de consumo con requisitos de memoria reducidos. El sufijo "junie-harbor-rl-v0.3" sugiere un ajuste fino con aprendizaje por refuerzo sobre el modelo base, probablemente orientado a tareas de agente o codigo, aunque no se dispone de documentacion que lo confirme.

Al tratarse de un repositorio de cuantizacion sin model card propia mas alla de la referencia al modelo original, la informacion tecnica disponible es limitada. Esta ficha recoge lo que puede verificarse y marca explicitamente como no disponible todo aquello que no consta en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2.5 de Liquid AI; detalles no confirmados) |
| Parametros totales | 2,6 mil millones (segun el nombre del modelo) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. El nombre indica que deriva de LFM2.5, la segunda generacion de la familia de modelos eficientes de Liquid AI, pero no se confirman detalles como el tipo de atencion, la composicion del dataset de entrenamiento, el numero de tokens vistos ni las tecnicas de alineacion empleadas (RLHF, DPO u otras). El sufijo "rl-v0.3" apunta a un ajuste con aprendizaje por refuerzo en su version 0.3, pero se desconoce el objetivo concreto de dicho ajuste.

El repositorio en si no entrena ningun modelo: realiza una conversion a GGUF con `convert_type: hf` y `output_tensor_quantised: 1`, segun los metadatos de la model card. Las cuantizaciones se han generado con la version 2 del pipeline de cuantizacion de mradermacher, que produce ficheros estaticos listos para llama.cpp.

## Capacidades

- Generacion de texto y conversacion multirround, heredadas del modelo base LFM2.5-2.6B.
- Posible orientacion a tareas de agente o razonamiento multi-paso, a juzgar por el sufijo "rl" del nombre, aunque no esta documentado.
- Ejecucion local en CPU y GPU mediante llama.cpp y sus derivados (Ollama, LM Studio, etc.).
- Soporte de cuantizaciones de 2 a 16 bits, lo que permite ajustar el equilibrio entre calidad y memoria.
- Capacidades multilingues, tool calling o vision: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue en portatiles y equipos sin GPU dedicada: las cuantizaciones Q4_K_M y Q3_K_M permiten ejecutar un modelo de 2,6 mil millones de parametros en CPU con memoria RAM modesta, usando llama.cpp u Ollama.
- Prototipado rapido de asistentes conversacionales en local: el formato GGUF se integra directamente en LM Studio y Ollama, lo que facilita probar el modelo sin infraestructura de servidor.
- Evaluacion de ajustes con RL: al ser una variante "rl-v0.3", permite comparar el comportamiento del modelo ajustado frente a la version base en tareas de razonamiento o agentes.
- Generacion de texto en entornos con requisitos de privacidad: al ejecutarse completamente en local, los datos no salen del equipo, lo que encaja en escenarios con informacion sensible.
- Fine-tuning o experimentation sobre la marcha: la version F16 sirve como punto de partida para conversiones adicionales o para comparar la perdida de calidad entre niveles de cuantizacion.
- Integracion en pipelines de CI para pruebas de regresion de modelos: el reducido tamano permite incluirlo en tests automatizados de inferencia sin coste de GPU en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (2,6 mil millones de parametros):
  - F16: en torno a 5-6 GB.
  - Q8_0: en torno a 3 GB.
  - Q5_K_M: en torno a 2 GB.
  - Q4_K_M: en torno a 1,6-1,8 GB.
  - Q3_K_M: en torno a 1,3-1,5 GB.
  - Q2_K: en torno a 1-1,2 GB.
  - Las cifras son estimaciones por tamano de pesos; no constan mediciones oficiales del autor.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para cuantizaciones Q4 o superiores; RTX 3060, RTX 4060, RTX 4090 o A100 pueden ejecutar la version F16 sin problema.
- Cabe en GPU de consumo: si, incluidas tarjetas de gama baja con 4-6 GB de VRAM en cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa sin conversion previa a otros formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-2.6B-junie-harbor-rl-v0.3 (este) | 2,6 B | no disponible | no disponible | GGUF | Cuantizacion de un ajuste RL |
| LFM2.5-2.6B (base) | 2,6 B | no disponible | no disponible | safetensors | Modelo original sin ajuste RL |
| Qwen2.5-3B-Instruct | 3,1 B | 32 768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar con licencia permisiva |
| Llama 3.2-3B-Instruct | 3,2 B | 131 072 tokens | Llama 3.2 Community License | safetensors, GGUF | Alternativa popular en el rango de 3 B |

La comparativa se ofrece como referencia de categoria; no se dispone de datos de rendimiento del modelo LFM2.5 que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluaciones de seguridad; se desconoce el comportamiento del modelo en dominios sensibles.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, agravado por la falta de benchmarks publicados.
- La licencia no esta especificada en el repositorio, lo que impide confirmar si se permite el uso comercial. Es imprescindible consultar la licencia del modelo base antes de desplegarlo en produccion.
- Al ser una cuantizacion, las versiones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad respecto a F16.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita la planificacion de casos de uso con documentos largos.
- El nombre sugiere un ajuste RL experimental (v0.3); no hay garantias de estabilidad en tareas de agente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM2.5-2.6B-junie-harbor-rl-v0.3-GGUF
- Modelo base: https://huggingface.co/vvsotnikov/LFM2.5-2.6B-junie-harbor-rl-v0.3
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
