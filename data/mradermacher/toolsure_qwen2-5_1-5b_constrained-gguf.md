# mradermacher/ToolSure_Qwen2.5_1.5B_CONSTRAINED-GGUF

## Resumen

ToolSure_Qwen2.5_1.5B_CONSTRAINED-GGUF es la version cuantizada en formato GGUF del modelo AmareshHebbar/ToolSure_Qwen2.5_1.5B_CONSTRAINED, un ajuste fino de Qwen2.5-1.5B orientado especificamente a la invocacion de funciones (function calling) y al uso de herramientas en entornos controlados o restringidos. El modelo base original procede de la familia Qwen2.5 de Alibaba, y este ajuste concreto ha sido entrenado sobre el dataset AmareshHebbar/ToolSure_Calls_Qwen2.5_1.5B, compuesto por llamadas a herramientas. El autor de la cuantizacion es mradermacher, que publica versiones estaticas y con imatrix de numerosos modelos.

El interes de esta publicacion reside en su tamano reducido (1.543.714.304 parametros, aproximadamente 1.500 millones) combinado con una especializacion clara en tool calling, lo que lo hace apto para despliegues en hardware modesto, incluso en CPU o GPUs de consumo. Al estar en formato GGUF, se puede ejecutar con llama.cpp, Ollama o cualquier runtime compatible con este formato, lo que facilita su integracion en pipelines locales o en el borde.

La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que resulta relevante para equipos que necesitan un modelo pequeno y especializado en invocacion de funciones sin depender de APIs externas. No obstante, la informacion publica sobre el modelo es escasa: no se detallan resultados de benchmarks, composicion exacta del dataset de entrenamiento ni capacidades mas alla del tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-1.5B) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estaticas); versiones con imatrix en el repo -i1-GGUF |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen2.5-1.5B, un transformer decoder-only con atencion causal estandar. No se dispone de informacion detallada sobre la composicion exacta del dataset de entrenamiento mas alla de su nombre (ToolSure_Calls_Qwen2.5_1.5B) y de que esta orientado a llamadas a herramientas. El sufijo "CONSTRAINED" sugiere un entrenamiento con restricciones en la generacion, probablemente para forzar salidas estructuradas validas en el contexto de function calling, aunque el autor no documenta el mecanismo concreto.

No se han publicado detalles sobre el numero de tokens de entrenamiento, la presencia de RLHF/DPO ni innovaciones tecnicas especificas. La cuantizacion la realiza mradermacher mediante herramientas estandar (llama.cpp), generando versiones estaticas y versiones con imatrix (weighted/imatrix quants) disponibles en un repositorio separado.

## Capacidades

- Invocacion de funciones (function calling) y uso de herramientas, que es el objetivo principal del ajuste fino.
- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-1.5B.
- Salidas estructuradas orientadas a llamadas a herramientas, presumiblemente con formato restringido (segun el sufijo CONSTRAINED).
- Soporte de conversaciones multi-turno (tag conversational en Hugging Face).
- Capacidades multilingues limitadas: la model card solo declara ingles.
- No se documentan capacidades de vision, audio, razonamiento extendido (thinking mode) ni agentes multi-paso mas alla del tool calling.

## Casos de uso

- Automatizacion de agentes locales: el modelo puede invocar funciones definidas por el desarrollador (APIs internas, consultas a bases de datos) en un runtime GGUF como llama.cpp u Ollama, sin necesidad de GPU dedicada.
- Enrutamiento de peticiones en pipelines de backend: dado su tamano reducido, puede clasificar y transformar peticiones en llamadas a herramientas concretas con baja latencia en CPU.
- Prototipado rapido de asistentes con herramientas: al ser Apache 2.0 y caber en hardware de consumo, permite iterar sobre esquemas de funciones sin coste de API.
- Despliegue en el borde (edge): su huella de 0,8-1,7 GB segun cuantizacion permite ejecutarlo en dispositivos con poca memoria, como mini-PC o moviles de gama alta con llama.cpp.
- Integracion en CI/CD para pruebas de esquemas de function calling: sirve como modelo de referencia barato para validar que las definiciones de herramientas y los prompts producen llamadas correctas.
- Sustitucion de modelos mayores en tareas de tool calling acotadas: cuando el conjunto de funciones es pequeno y bien definido, un modelo de 1.5B especializado puede bastar y reduce costes de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,8 GB (Q2_K), 1,0-1,1 GB (Q4_K_S/Q4_K_M), 1,4 GB (Q6_K), 1,7 GB (Q8_0) y 3,2 GB (f16), segun los tamanos de fichero indicados en la model card.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes. Tambien puede ejecutarse integramente en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). El modelo base en safetensors puede servirse con vLLM o TGI, pero esta publicacion concreta es GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera alta velocidad en CPU y muy alta en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| ToolSure_Qwen2.5_1.5B_CONSTRAINED (este) | 1,54 B | no disponible | Function calling | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-1.5B (base) | 1,54 B | 32.768 tokens (segun documentacion publica de Qwen2.5) | Proposito general | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (segun documentacion publica de Qwen2.5) | Instrucciones y chat | Apache 2.0 | safetensors, GGUF |

La comparativa se limita al modelo base y su variante Instruct, dado que no se dispone de datos de rendimiento del ajuste ToolSure. No se dispone de informacion sobre otros ajustes especializados en tool calling de tamano comparable en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea limitado.
- No hay benchmarks publicados, por lo que no se puede verificar la calidad del tool calling frente al modelo base ni frente a alternativas.
- Al ser un ajuste fino especializado, puede degradar capacidades generales de conversacion o razonamiento respecto a Qwen2.5-1.5B-Instruct.
- Riesgo de alucinacion en la generacion de llamadas a funciones: puede inventar nombres de funciones o argumentos no definidos, especialmente fuera del dominio de entrenamiento.
- La naturaleza "CONSTRAINED" sugiere que el modelo espera un formato o esquema concreto; usarlo con esquemas distintos puede reducir su fiabilidad.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- El repositorio tiene 0 likes y 743 descargas, lo que indica validacion comunitaria escasa.
- La longitud de contexto no esta documentada en esta publicacion; conviene consultar el modelo base para conocer el limite real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ToolSure_Qwen2.5_1.5B_CONSTRAINED-GGUF
- Version con imatrix: https://huggingface.co/mradermacher/ToolSure_Qwen2.5_1.5B_CONSTRAINED-i1-GGUF
- Modelo base original: https://huggingface.co/AmareshHebbar/ToolSure_Qwen2.5_1.5B_CONSTRAINED
- Dataset de entrenamiento: https://huggingface.co/datasets/AmareshHebbar/ToolSure_Calls_Qwen2.5_1.5B
- Pagina de conveniencia del autor: https://hf.tst.eu/model#ToolSure_Qwen2.5_1.5B_CONSTRAINED-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Referencia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
