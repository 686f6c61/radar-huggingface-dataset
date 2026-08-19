# mradermacher/Super-Slop-Machina-Micro-Roleplay-Instruct-750M-v1-0812-GGUF

## Resumen

Super-Slop-Machina-Micro-Roleplay-Instruct-750M-v1-0812 es un modelo de lenguaje pequeño (SLM) de 752 millones de parámetros, especializado en roleplay, escritura creativa y narrativa con contenido adulto. Fue desarrollado por Indexnusrefather y posteriormente cuantizado a formato GGUF por mradermacher para facilitar su ejecución en entornos de inferencia local. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

El modelo forma parte de la familia Super-Slop-Machina, que incluye variantes de 230M, 350M, 750M y 1.2B de parámetros con el mismo enfoque. Su etiqueta "experimental" indica que es un trabajo de investigación en curso, y su especialización en roleplay erótico (ERP) lo hace relevante para desarrolladores que trabajan en narrativa interactiva, chatbots de personajes y juegos de rol por texto que requieren modelos ligeros ejecutables en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 752.393.024 (~752M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer estándar, aunque no se especifican detalles concretos como el número de capas, dimensiones de atención o configuración de cabezas. El modelo es un fine-tuning de la familia Super-Slop-Machina orientado a roleplay, escritura creativa y narrativa, con soporte explícito para roleplay erótico (ERP). Se etiqueta como "instruct", lo que indica que ha sido ajustado para seguir instrucciones en formato conversacional.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni las técnicas de alineación empleadas (RLHF, DPO, etc.). El carácter experimental del modelo sugiere que el proceso de entrenamiento puede haber sido exploratorio, sin una evaluación formal publicada.

## Capacidades

- Generacion de texto narrativo y creativo con especializacion en roleplay y escritura de ficcion.
- Soporte de instrucciones (instruct) para dirigir el comportamiento del personaje y el desarrollo de la trama.
- Mantenimiento de conversaciones multi-turno coherentes en contextos de roleplay.
- Generacion de contenido con tono "edge" (provocador o adulto), incluido roleplay erotico (ERP).
- Ejecucion eficiente en hardware modesto gracias a su tamano reducido.
- Integracion con runtimes de inferencia local compatibles con GGUF.

## Casos de uso

- Chatbots de personajes para juegos de rol por texto: el modelo puede interpretar personajes con personalidad definida y mantener conversaciones coherentes durante multiples turnos, gracias a su entrenamiento especifico en roleplay.
- Generacion de historias interactivas: permite crear narrativas ramificadas donde el usuario influye en el desarrollo de la trama, adecuado para ficcion interactiva y juegos de aventura textual.
- Escritura creativa asistida: puede generar borradores de ficcion, dialogos y descripciones para escritores que necesitan inspiracion o variaciones de estilo.
- Prototipado de aplicaciones de narrativa generativa: su tamano reducido permite iterar rapidamente en entornos de desarrollo sin necesidad de infraestructura GPU costosa.
- Simulacion de personajes para videojuegos independientes: puede integrarse en motores de juego para dotar a los NPC de dialogo dinamico y reactivo.
- Experimentacion con tecnicas de cuantizacion y optimizacion: al estar disponible en 12 formatos GGUF distintos, sirve como banco de pruebas para estudiar el impacto de la cuantizacion en modelos pequenos.
- Aplicaciones de roleplay erotico consentido entre adultos: su entrenamiento especifico en ERP lo hace adecuado para plataformas de entretenimiento para adultos que requieren modelos ligeros y desplegables localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB (cuantizacion Q2_K) y 1,6 GB (f16), segun el archivo GGUF seleccionado. Se recomienda un margen adicional de 0,5-1 GB para el contexto y los estados intermedios.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como GTX 1650, RTX 3050, RTX 4060 o superiores ejecutan el modelo sin problemas. Tambien funciona en CPU con 4-8 GB de RAM.
- Compatibilidad con GPU de consumo: si, incluidas las integradas de gama media con suficiente VRAM compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF.
- Latencia estimada: al tratarse de un modelo de 752M parametros, la generacion es rapida incluso en CPU. En GPU moderna se pueden esperar velocidades superiores a 100 tokens/segundo con cuantizaciones Q4 o superiores; en CPU moderna, entre 20 y 50 tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Super-Slop-Machina-Micro-Roleplay-Instruct-750M | 752M | no disponible | Apache 2.0 | Roleplay, narrativa, ERP |
| Super-Slop-Machina-Macro-Roleplay-Instruct-350M | 350M | 125K | no disponible | Roleplay, narrativa |
| Super-Slop-Machina-Roleplay-1.2b | 1.2B | no disponible | no disponible | Roleplay, narrativa |

La familia Super-Slop-Machina ofrece modelos de distintos tamanos con el mismo proposito. El modelo de 750M se situa en un punto intermedio entre el de 350M y el de 1.2B, ofreciendo un equilibrio entre capacidad generativa y requisitos de hardware. El modelo hermano de 350M confirma una longitud de contexto de 125K tokens, aunque este dato no se ha verificado para la variante de 750M.

## Limitaciones y advertencias

- Modelo experimental: puede presentar comportamientos impredecibles o incoherentes en algunos escenarios, lo que lo hace inadecuado para produccion sin pruebas exhaustivas previas.
- Solo soporta ingles, lo que limita su uso en aplicaciones multilingues.
- Riesgo de alucinacion: como todos los modelos de su tamano, puede generar informacion factualmente incorrecta o inventar detalles.
- Contenido explicito: el modelo esta disenado para roleplay erotico, por lo que puede generar contenido inapropiado para menores o entornos profesionales. Requiere salvaguardas en aplicaciones publicas.
- Sesgos potenciales: no se dispone de informacion sobre la composicion del dataset de entrenamiento, por lo que los sesgos son desconocidos.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento en tareas estandar como MMLU, HumanEval o GSM8K.
- Longitud de contexto no confirmada: aunque modelos hermanos de la familia alcanzan 125K tokens, este dato no se especifica para la variante de 750M.
- Sin soporte de vision, audio ni tool calling: el modelo es exclusivamente textual.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Super-Slop-Machina-Micro-Roleplay-Instruct-750M-v1-0812-GGUF
- Modelo base: https://huggingface.co/Indexnusrefather/Super-Slop-Machina-Micro-Roleplay-Instruct-750M-v1-0812
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Super-Slop-Machina-Micro-Roleplay-Instruct-750M-v1-0812-i1-GGUF
- Modelo hermano (350M): https://huggingface.co/mradermacher/Super-Slop-Machina-Macro-Roleplay-Instruct-350M-0812-GGUF
- Modelo hermano (1.2B): https://huggingface.co/mradermacher/Super-Slop-Machina-Roleplay-1.2b-GGUF
- Pagina de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
