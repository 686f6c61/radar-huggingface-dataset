# RedHatAI/North-Mini-Code-1.0

## Resumen

North Mini Code 1.0 es un modelo de lenguaje de tipo decoder-only con arquitectura de mezcla de expertos (MoE) dispersa, desarrollado por Cohere y Cohere Labs y distribuido en Hugging Face bajo el espacio de RedHatAI. Con 30.484 millones de parametros totales y aproximadamente 3.000 millones activos por token, esta optimizado especificamente para generacion de codigo, ingenieria de software agentica y tareas de terminal. Su ventana de contexto alcanza los 256.000 tokens, con una longitud maxima de salida de 64.000 tokens.

El modelo emplea una atencion eficiente que intercala atencion de ventana deslizante con RoPE y atencion global sin embeddings posicionales en proporcion 3:1, junto con un bloque MoE de 128 expertos de los que se activan 8 por token. El post-entrenamiento combina un SFT en cascada de dos etapas seguido de aprendizaje por refuerzo con recompensas verificables (RLVR), centrado en flujos de trabajo agenticos de programacion.

Su relevancia actual radica en que ofrece capacidades de agente de codigo con licencia Apache 2.0 y pesos abiertos, validado sobre infraestructuras de despliegue empresarial como RHOAI 3.5.1, RHAIIS 3.6.0-fast.2 y vLLM 0.28.0, lo que facilita su adopcion en entornos de produccion sin restricciones de licencia comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa (128 expertos, 8 activos por token) |
| Parametros totales | 30.484.303.872 (~30,5B) |
| Parametros activos | ~3B (denominacion 30B-A3B) |
| Longitud de contexto | 256K tokens de entrada; 64K tokens de salida maxima |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

North Mini Code 1.0 es un transformer decoder-only con mezcla de expertos dispersa. La atencion intercala atencion de ventana deslizante con RoPE y atencion global sin embeddings posicionales en una proporcion 3:1, lo que reduce el coste computacional en contextos largos. El bloque feed-forward es un MoE con 128 expertos, de los que se activan 8 por token; cada experto es un FFN con activacion SwiGLU. El router aplica una funcion sigmoide a los logits antes de la seleccion top-k, y se emplea una unica capa densa antes de las capas dispersas.

El entrenamiento posterior consta de dos etapas: un ajuste fino supervisado (SFT) en cascada seguido de aprendizaje por refuerzo con recompensas verificables (RLVR), ambos orientados a codificacion agentica. La model card no detalla el numero de tokens de preentrenamiento ni la composicion exacta del dataset. El modelo solo acepta entrada de texto y genera texto.

## Capacidades

- Generacion de codigo en multiples lenguajes, con enfasis en tareas de programacion compleja (evaluado en SciCode y LiveCodeBench v6).
- Ingenieria de software agentica: resolucion de issues y parcheo de repositorios (evaluado en SWE-Bench Verified y SWE-Bench Pro).
- Uso de terminal y ejecucion de comandos en entornos interactivos (evaluado en Terminal-Bench v2 y Terminal-Bench Hard).
- Soporte de tool calling / function calling mediante plantillas de chat de transformers.
- Razonamiento multi-paso y planificacion para agentes (harness ReAct, Swe-Agent v1.1.0, Terminus-2).
- Conversacion multi-turno con contexto de hasta 256K tokens.
- Generacion de salidas largas de hasta 64K tokens, adecuada para parches y refactorizaciones extensas.
- Capacidades multilingues: no disponible (la model card no especifica idiomas).

## Casos de uso

- Resolucion automatica de issues en repositorios: el modelo puede recibir el contexto del repositorio (hasta 256K tokens) y generar un parche verificable, integrándose en pipelines tipo Swe-Agent para triage y correccion de bugs.
- Agente de terminal para automatizacion de DevOps: con soporte de tool calling y entrenamiento especifico en Terminal-Bench, puede ejecutar comandos, inspeccionar logs y aplicar remediaciones en sesiones tmux gestionadas por un harness ReAct.
- Asistente de codigo en IDE: generacion y refactorizacion de funciones con salidas de hasta 64K tokens, util para reescrituras de ficheros completos y migraciones de API.
- Generacion de tests y cobertura: a partir de un modulo existente, el modelo produce suites de pruebas y casos limite, aprovechando su entrenamiento en codigo verificable.
- Revision de codigo automatizada en CI/CD: analisis de diffs y generacion de comentarios tecnicos o parches sugeridos antes del merge, con coste de inferencia reducido gracias a los ~3B parametros activos.
- Migracion y modernizacion de bases de codigo: procesamiento de contextos largos para reescribir modulos legacy a nuevas versiones de lenguaje o framework.
- Soporte tecnico para desarrolladores: chat multi-turno que mantiene contexto de conversaciones largas y puede invocar herramientas para consultar documentacion o ejecutar codigo.

## Benchmarks y rendimiento

La model card referencia una figura con resultados de evaluacion, pero los valores numericos no estan disponibles en el texto proporcionado. Los benchmarks empleados son: SWE-Bench Verified, SWE-Bench Pro, Terminal-Bench v2, Terminal-Bench Hard, SciCode y LiveCodeBench v6. La metodologia usa 3 semillas, temperatura 1.0 y top_p 0.95, con harness Swe-Agent v1.1.0 para SWE-Bench y Terminus-2 para Terminal-Bench Hard.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, en FP16 los ~30,5B parametros requieren en torno a 61 GB de pesos, lo que exige multiples GPU; en cuantizaciones de 8 bits o 4 bits el requisito baja aproximadamente a 30 GB y 15-16 GB respectivamente (estimacion, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamano, se situa en el rango de A100 80GB, H100 80GB o configuraciones multi-GPU para precision completa.
- Compatibilidad con GPU de consumo: no confirmada. Podria caber en RTX 4090 (24 GB) solo con cuantizacion agresiva de 4 bits, sujeto a verificacion.
- Opciones de despliegue: validado en vLLM 0.28.0, RHOAI 3.5.1 y RHAIIS 3.6.0-fast.2. Compatible con transformers (se recomienda instalar desde el repositorio fuente con los cambios necesarios).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| North Mini Code 1.0 | ~30,5B | ~3B | 256K | Apache 2.0 | Enfocado en codigo agentico y terminal |
| Qwen3.6-35B-A3B | ~35B | ~3B | no disponible en la informacion | no disponible en la informacion | Citado como referencia en la model card |
| Gemma 4 | no disponible | no disponible | no disponible | no disponible | Citado como referencia en la model card |

Los datos de rendimiento comparativo no estan disponibles en el texto proporcionado; la model card remite a la figura de evaluacion y al blog para la comparacion numerica.

## Limitaciones y advertencias

- Entrada exclusivamente de texto: no procesa imagenes ni audio.
- Idiomas soportados no declarados: el rendimiento fuera del ingles no esta documentado.
- Riesgo de alucinacion en generacion de codigo y comandos de terminal; requiere verificacion y sandboxing en entornos de produccion.
- Sesgos conocidos: no documentados en la model card.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo se distribuye como "research release", lo que puede implicar ausencia de garantias de soporte.
- El uso agentico de terminal conlleva riesgos de seguridad; se recomienda aislamiento y permisos minimos.
- Requiere una version de transformers desde el repositorio fuente; versiones estandar pueden no cargar el modelo correctamente.
- El repositorio en RedHatAI tiene muy pocas interacciones (1 like, 1892 descargas) en el momento de la consulta; conviene verificar la integridad y procedencia de los pesos frente al repositorio original de Cohere Labs.

## Enlaces

- Hugging Face (RedHatAI): https://huggingface.co/RedHatAI/North-Mini-Code-1.0
- Hugging Face (Cohere Labs, referenciado en la model card): https://huggingface.co/CohereLabs/North-Mini-Code-1.0
- Blog de presentacion: https://huggingface.co/blog/CohereLabs/introducing-north-mini-code
- Demo en Hugging Face Space: https://huggingface.co/spaces/CohereLabs/North-Mini-Code-1.0
- Cohere: https://cohere.com/
- Cohere Labs: https://cohere.com/research
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Documentacion de plantillas de chat de transformers: https://huggingface.co/docs/transformers/main
