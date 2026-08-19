# mradermacher/Luth-2-0.8B-GGUF

## Resumen

Luth-2-0.8B es un modelo de lenguaje conversacional en francés desarrollado por el usuario kurakurai y posteriormente cuantizado a formato GGUF por mradermacher para su uso en entornos con recursos limitados. El modelo está basado en la arquitectura Qwen, como indican las etiquetas del repositorio, y ha sido sometido a un post-entrenamiento con fases de supervisión (SFT) y refuerzo (RL) sobre conjuntos de datos específicos en francés. Aunque el nombre sugiere un tamaño de 0.8B, los parámetros totales reales son aproximadamente 100 millones, lo que lo sitúa en la categoría de modelos muy pequeños, adecuados para dispositivos edge y aplicaciones de baja latencia.

El repositorio de mradermacher incluye múltiples cuantizaciones GGUF, así como archivos mmproj (proyectores multimodales) en Q8_0 y f16, lo que indica que el modelo original incorpora capacidades de visión, aunque no se detalla su alcance. Con licencia Apache 2.0, el modelo es libre para uso comercial y modificación. Su relevancia actual radica en la creciente demanda de modelos ligeros y multilingües que puedan ejecutarse localmente en hardware modesto, especialmente para aplicaciones conversacionales en francés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen) |
| Parametros totales | 100.592.896 (aprox. 100M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: f16, Q2_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS; adicionalmente mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo original usa safetensors |

## Arquitectura y entrenamiento

El modelo base, Luth-2-0.8B, está construido sobre la arquitectura Qwen, probablemente una variante de la serie Qwen2, aunque el número de parámetros (100M) es significativamente menor que los modelos Qwen2 publicados (0.5B, 1.5B, etc.), lo que sugiere una posible destilación o una configuración no estándar. El post-entrenamiento se realizó en dos fases: una primera de ajuste supervisado (SFT) con el dataset `kurakurai/Luth-2-Post-Training-SFT` y una segunda de refuerzo (RL) con `kurakurai/Luth-2-Post-Training-RL`, orientada a mejorar la calidad conversacional y la adherencia a instrucciones en francés. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición exacta de los datos. La presencia de archivos mmproj en el repositorio cuantizado indica que el modelo original incorpora un proyector multimodal, probablemente para entrada de imágenes, aunque no se especifica su arquitectura ni su entrenamiento.

## Capacidades

- Generacion de texto conversacional en frances, con enfoque en dialogos naturales y respuestas contextuales.
- Soporte multimodal basico gracias al proyector mmproj, que permite procesar entradas visuales (aunque no se detalla el alcance).
- Optimizado para inferencia en dispositivos con recursos limitados (edge), gracias a su reducido numero de parametros y a las cuantizaciones GGUF disponibles.
- No se menciona soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- Capacidad multilingue limitada al frances; no hay evidencia de otros idiomas.

## Casos de uso

- Asistentes conversacionales en frances para dispositivos embebidos o IoT: el modelo puede ejecutarse en hardware con menos de 1 GB de RAM, ofreciendo respuestas en tiempo real sin conexion a la nube.
- Chatbots de atencion al cliente en frances para pequenas empresas: su tamano permite integrarlo en servidores modestos o incluso en aplicaciones de escritorio, gestionando consultas frecuentes y preguntas frecuentes.
- Aplicaciones educativas de aprendizaje de frances: puede generar dialogos de practica, corregir frases o simular conversaciones para estudiantes.
- Prototipado rapido de sistemas de dialogo: al ser ligero y con licencia permisiva, es util para validar conceptos antes de escalar a modelos mayores.
- Procesamiento de lenguaje natural en frances para tareas de clasificacion o extraccion de informacion, aunque su capacidad es limitada por el tamano.
- Sistemas de transcripcion o resumen de conversaciones en frances en entornos con restricciones de privacidad, al poder ejecutarse localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en cuantizacion Q4_K_M (aprox. 0.2-0.3 GB), y alrededor de 0.5 GB en f16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050, Raspberry Pi con acelerador, o incluso CPU moderna).
- Cabe en GPUs de consumo como la serie RTX 2060 o superiores, y tambien en hardware integrado como Jetson Nano.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF (llama-cpp-python, etc.).
- Latencia y throughput: no disponibles, pero al ser un modelo de 100M, se espera una generacion de decenas de tokens por segundo en CPU y cientos en GPU.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de tamano similar (por ejemplo, SmolLM-135M, TinyLlama-1.1B o Qwen2-0.5B). El modelo no ha sido evaluado en benchmarks publicos y su arquitectura exacta no esta documentada. Se recomienda realizar pruebas propias para comparar con alternativas en frances.

## Limitaciones y advertencias

- Tamano muy reducido (100M de parametros), lo que limita su capacidad de razonamiento complejo y aumenta el riesgo de alucinaciones o respuestas incoherentes en temas especializados.
- Solo soporta frances; no hay evidencia de funcionamiento en otros idiomas.
- No se ha documentado la longitud de contexto, por lo que puede fallar en conversaciones largas o con dependencias lejanas.
- La informacion sobre el entrenamiento es escasa; no se conocen los sesgos potenciales ni la calidad de los datos utilizados.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no ha sido auditado para entornos de produccion de alto riesgo.
- Los archivos mmproj sugieren capacidades de vision, pero no se ha verificado su funcionamiento ni su calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Luth-2-0.8B-GGUF
- Modelo base (original): https://huggingface.co/kurakurai/Luth-2-0.8B
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
