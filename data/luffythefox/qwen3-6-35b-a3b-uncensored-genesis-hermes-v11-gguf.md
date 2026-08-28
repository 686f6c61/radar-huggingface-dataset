# LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-GGUF es un modelo de lenguaje multimodal (image-text-to-text) publicado por LuffyTheFox en formato GGUF, construido sobre la base sin censura HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive y con un finetune de tipo Hermes para capacidades de agente y function calling. El modelo emplea una arquitectura MoE (Mixture of Experts) con 34.660.610.688 parámetros totales y, según su nomenclatura, unos 3.000 millones de parámetros activos. Su principal singularidad es el método de post-procesado "Genesis", un algoritmo de reparación numérica de tensores basado en SVD que, según el autor, reduce el ruido acumulado durante el entrenamiento y mejora la estabilidad y la claridad de las respuestas sin necesidad de reentrenar.

El modelo está pensado para desarrolladores e investigadores que buscan una variante sin censura, con soporte multimodal y orientada a agentes, ejecutable en runtimes compatibles con GGUF como llama.cpp u Ollama. Con más de un millón de descargas en HuggingFace, ha ganado popularidad por su combinación de capacidades agenticas, ausencia de filtros de rechazo (0/465 refusals según el autor) y su enfoque en la "reparación de señal" de los pesos. No obstante, carece de documentación oficial sobre benchmarks, contexto máximo o detalles de entrenamiento, por lo que su adopción en producción requiere validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.6, con posibles componentes SSM (ssm_conv1d) segun el autor |
| Parametros totales | 34.660.610.688 |
| Parametros activos | 3B (segun nomenclatura A3B, no verificado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (varias, no listadas; repo de 396,1 GB) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.6-35B-A3B, un transformer MoE con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token. La model card menciona la presencia de tensores `ssm_conv1d`, lo que sugiere que la arquitectura incorpora capas de espacio de estado (SSM) para el manejo de contexto largo, aunque este detalle no está verificado de forma independiente. El autor aplica su método Genesis, que consiste en tres etapas: escaneo y reparación del equilibrio entre cabezas en los tensores `ssm_conv1d`, detección y reducción de ruido mediante SVD personalizado (excluyendo ciertos tensores como `token_embd.weight` o `output.weight`), y sustitución de bloques de ceros corruptos por bloques óptimos según la distribución de pesos.

En cuanto al entrenamiento, el modelo parte de la base sin censura de HauhauCS (0/465 refusals) y recibe un traspaso de datos del finetune Hermes de DJLougen, basado en el dataset NousResearch/hermes-function-calling-v1, que aporta capacidades de function calling y comportamiento agéntico. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. El proceso Genesis es puramente post-entrenamiento y no modifica el conocimiento aprendido, según el autor.

## Capacidades

- Generacion de texto y razonamiento: responde a instrucciones complejas y mantiene conversaciones multi-turno.
- Generacion de codigo: soporta tareas de programacion y puede integrarse en flujos de desarrollo.
- Function calling / agente Hermes: entrenado con el dataset hermes-function-calling-v1, permite invocar herramientas y ejecutar tareas agénticas.
- Multimodal (vision + texto): el pipeline_tag es `image-text-to-text`, lo que indica soporte de entrada de imagenes, aunque no se detallan las capacidades especificas de vision.
- Multilingue: soporta ingles, chino y otros idiomas (etiqueta `multilingual`).
- Modo thinking: las recomendaciones de configuracion sugieren habilitar un modo de razonamiento explicito para tareas de codigo y agentes.
- Sin censura: el modelo base presenta 0/465 refusals, es decir, no rechaza peticiones que otros modelos filtrarian.

## Casos de uso

- Agentes conversacionales sin restricciones: el modelo puede gestionar dialogos abiertos y creativos sin filtros de contenido, util para prototipos de asistentes personales o personajes virtuales donde se requiere libertad expresiva.
- Generacion de codigo en produccion: con soporte de function calling, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar fragmentos de codigo, aunque requiere validacion humana por la ausencia de benchmarks.
- Asistentes multilingues: al soportar ingles, chino y otros idiomas, puede desplegarse en entornos de atencion al cliente o traduccion asistida con contexto largo (si se confirma la longitud de contexto).
- Analisis de imagenes: gracias a su naturaleza multimodal, puede procesar imagenes junto con texto para tareas de descripcion, extraccion de informacion o generacion de respuestas contextuales (capacidad no verificada en detalle).
- Investigacion sobre reduccion de ruido en LLMs: el metodo Genesis es un caso de estudio interesante para equipos que exploran tecnicas de post-procesado de pesos sin reentrenamiento.
- Prototipado rapido de agentes con herramientas: su finetune Hermes permite experimentar con flujos agénticos (llamadas a APIs, ejecucion de comandos) en entornos de desarrollo antes de migrar a modelos con soporte oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. El autor no proporciona comparaciones cuantitativas con otros modelos, por lo que no es posible evaluar su rendimiento relativo de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Para un modelo de 35B en GGUF, una cuantizacion Q4_K_M requiere aproximadamente 20-22 GB de VRAM, mientras que Q8_0 necesita unos 35-38 GB. Al ser MoE con 3B activos, la memoria de computacion es menor, pero todos los pesos deben cargarse en memoria.
- GPU recomendadas: RTX 4090 (24 GB) puede ejecutar cuantizaciones Q4/Q5; A100 40/80 GB o H100 son adecuadas para cuantizaciones superiores o despliegues con contexto largo.
- Compatibilidad con consumer GPU: si, con cuantizaciones Q4 o Q5 en GPUs de 24 GB (RTX 3090/4090). Para GPUs de 12-16 GB, se requieren cuantizaciones mas agresivas (Q2/Q3) con perdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. vLLM no soporta GGUF de forma nativa, pero puede usarse con el formato safetensors si se convierte.
- Latencia y throughput: no disponibles. Al ser MoE con pocos parametros activos, la velocidad de generacion es superior a un modelo denso de 35B, pero depende del hardware y de la cuantizacion.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. Como referencia estructural, el modelo comparte categoria con otros MoE de ~35B como Qwen3-30B-A3B o Mixtral 8x7B, pero no hay benchmarks que permitan una comparacion objetiva. La principal diferencia es su caracter "uncensored" y el post-procesado Genesis, que no tienen equivalentes directos en modelos comerciales. Se recomienda evaluar con cargas de trabajo propias antes de elegir.

## Limitaciones y advertencias

- Ausencia de censura: el modelo puede generar contenido ofensivo, ilegal o peligroso. No debe desplegarse en entornos donde se requiera moderacion de contenido sin capas adicionales de filtrado.
- Metodo Genesis no validado: la reparacion de tensores es un procedimiento experimental del autor, sin publicacion cientifica ni evaluacion independiente. Los beneficios declarados (estabilidad, reduccion de alucinaciones) no estan contrastados.
- Riesgo de alucinacion: al no contar con benchmarks, no se conoce su tasa de alucinacion. El autor afirma que Genesis la reduce, pero no hay evidencia.
- Limitaciones de contexto: se desconoce la longitud de contexto maxima. Los tensores `ssm_conv1d` sugieren soporte de contexto largo, pero no hay confirmacion.
- Capacidades de vision no detalladas: aunque el pipeline es image-text-to-text, no se especifican los tipos de imagen soportados ni la calidad del procesamiento visual.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base (HauhauCS) y el finetune Hermes pueden tener condiciones adicionales no documentadas. Se recomienda revisar las licencias de los modelos derivados.
- Dependencia de cuantizaciones: el rendimiento varia significativamente segun la cuantizacion elegida; las versiones de baja precision pueden degradar la calidad.

## Enlaces

- [Modelo en HuggingFace (V11)](https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-GGUF)
- [Version V7 en HuggingFace](https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF)
- [Version V5 en HuggingFace](https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V5-GGUF)
- [Modelo base sin censura (HauhauCS)](https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive)
- [Finetune Hermes de DJLougen](https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF)
- [Script de cuantizacion (Pastebin)](https://pastebin.com/hXhcMJn9)
- [Discord del proyecto](https://discord.gg/SZ5vacTXYf)
- [Chat template recomendado](https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF/raw/main/chat_template.jinja)
