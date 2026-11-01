# mohommed/LFM3-1.7B-Frontier-SmartAgentv3

## Resumen

LFM3-1.7B-Frontier-SmartAgentv3 es un ajuste fino de tipo agente publicado por el usuario mohommed sobre su propio modelo base mohommed/LFM3-1.7B-Frontier-SmartAgent, que a su vez deriva de la familia LFM3 de Liquid AI. Con 1.728.801.536 parámetros reales (según los pesos en safetensors) y licencia Apache 2.0, el modelo se presenta como un agente de codigo orientado a tareas de larga duracion: construcciones de 10 a 30 pasos, gestion de monorepos de hasta 10.000 ficheros y 1 millon de lineas de codigo, y generacion de frontend y juegos 2D.

La propuesta tecnica del autor se apoya en cuatro pilares declarados en la model card: un registro de estado tipo maquina de estados (DONE -> CURRENT -> NEXT) para mantener contexto entre turnos, un gestor AST basado en el modulo `ast` de Python para localizar simbolos y rangos de linea, una memoria persistente de patrones verificados (`.second_brain_skills.json`) y un supuesto entrenamiento estetico en UI suizas y neo-brutalistas con fisica 2D por subpasos. Tambien se menciona un proceso de "uncensoring" mediante SVD dual-subspace aplicado tras el merge y cuantizaciones GGUF de 512K de contexto generadas con `llama-imatrix`.

Es relevante ahora por dos motivos: por un lado, ejemplifica la ola de ajustes finos comunitarios de nicho sobre modelos pequenos, donde el valor no esta en el rendimiento bruto sino en el sesgo hacia un flujo de trabajo concreto; por otro, su model card contiene afirmaciones tecnicas muy ambiciosas (contexto de 512K, gestion de 1M de LoC, auto-mejora) que no vienen acompanadas de benchmarks ni de documentacion reproducible, lo que exige una evaluacion cauta antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3 de Liquid AI; detalles de capas y atencion no disponibles) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | No aplica (no se declara MoE) |
| Longitud de contexto | 512K declarado en la model card (no verificado; el modelo base no especifica contexto) |
| Tipos de cuantizacion | GGUF con `llama-imatrix` (variantes publicadas en el repo GGUF del autor); otros formatos no disponibles |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base mohommed/LFM3-1.7B-Frontier-SmartAgent, que a su vez procede de la familia LFM3 de Liquid AI. La informacion disponible no detalla el numero de capas, la dimension oculta, el tipo de atencion ni si incorpora mecanismos propios de la familia LFM (como capas convolucionales o de estado). Tampoco se especifican los datos de entrenamiento: no hay cifras de tokens, composicion del dataset ni si se aplicaron fases de RLHF o DPO. Lo unico documentado es el proceso posterior al merge: un "dual-subspace SVD uncensoring" que, segun el autor, elimina restricciones de rechazo del modelo base.

Las innovaciones declaradas son de naturaleza procedimental mas que arquitectonica. El "Long-Horizon State-Machine Ledger" propone estructurar la salida del agente en tres bloques (DONE, CURRENT, NEXT) para conservar el estado de ejecucion entre turnos. El "Surgical AST Manager" describe el uso del modulo `ast` de Python para identificar simbolos y rangos de linea y aplicar diffs quirurgicos en repositorios grandes. La "2nd Brain Coding Skill Evolution" implica persistir patrones de codigo verificados en un fichero JSON externo al modelo, de modo que la mejora proviene del andamiaje y no de los pesos. Ninguna de estas tecnicas viene acompanada de ablaciones, curvas de entrenamiento ni evaluaciones cuantitativas.

## Capacidades

- Generacion de texto y codigo en el marco de tareas de agente, con enfasis declarado en frontend (HTML/CSS/JS) y juegos 2D en canvas.
- Planificacion multi-paso mediante el esquema de estado DONE/CURRENT/NEXT, pensado para builds de 10 a 30 pasos.
- Navegacion de repositorios grandes mediante analisis AST y generacion de diffs localizados (hasta 10.000 ficheros y 1M de LoC segun el autor).
- Memoria persistente de patrones: el autor describe un fichero `.second_brain_skills.json` donde se acumulan soluciones verificadas.
- Generacion de UI con paletas y estilos concretos (Swiss-Grid, Neo-Brutalist, colores `#09090B`, `#F4F1EA`, `#FF3B00`).
- Fisica 2D por subpasos con impulso y momento (ejemplo citado: `PoolGame`), apuntado por raycast y sintesis de audio procedural con WebAudio sin assets.
- Modo "uncensored": el autor declara haber eliminado comportamientos de rechazo mediante SVD.
- Tool calling y function calling: no se documenta soporte explicito en la informacion disponible.
- Capacidades multimodales (vision, audio de entrada): no disponibles.
- Idiomas: no declarados.

## Casos de uso

- Prototipado rapido de interfaces web: el modelo esta sesgado hacia estilos concretos (Swiss-Grid, neo-brutalista) y paletas definidas, por lo que encaja en la generacion de maquetas de consolas de administracion o dashboards oscuros sin partir de un diseno previo.
- Construccion de minijuegos 2D en canvas: la fisica por subpasos y el apuntado por raycast descritos permiten generar bocetos funcionales de juegos tipo billar, shooter cenital o plataformas en una sola sesion.
- Agente de refactorizacion en monorepos: combinado con un orquestador externo que ejecute el analisis AST y le pase solo los rangos de linea relevantes, puede proponer diffs acotados sin consumir toda la ventana de contexto.
- Asistente de codigo con memoria de proyecto: el esquema de `.second_brain_skills.json` permite, si se implementa el andamiaje adecuado, acumular convenciones y correcciones entre sesiones de un mismo repositorio.
- Generacion de audio procedural en web: la sintesis WebAudio sin assets descrita sirve para prototipar efectos de sonido en demos jugables sin depender de ficheros externos.
- Experimentacion en investigacion sobre agentes de horizonte largo: el modelo es un sujeto de prueba util para evaluar si los esquemas de estado externos (ledger, memoria JSON) mejoran la consistencia en cadenas de 20 o mas pasos, dado su tamano reducido y su licencia permisiva.
- Fine-tuning adicional: con 1.7B de parametros y Apache 2.0, es viable reentrenarlo o adaptarlo con LoRA en una unica GPU de gama alta para dominios especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica cuantitativa, y tampoco ofrece comparaciones medidas con el modelo base.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 3,5 GB solo para pesos (1,73B parametros x 2 bytes), mas overhead de activaciones y cache KV; con contexto de 512K la cache KV puede dominar el consumo y hacer inviable la ventana completa en GPU consumer.
- Cuantizacion GGUF Q4_K_M: en torno a 1,1-1,3 GB de pesos, apta para GPUs de 6-8 GB.
- Cuantizacion GGUF Q8_0: en torno a 1,9-2,1 GB, comoda en GPUs de 8 GB o superiores.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para FP16 con contexto moderado; A100 o H100 solo si se necesita contexto muy largo o throughput alto en servidor.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas usando cuantizacion; en FP16 requiere al menos 8 GB para contexto corto.
- Opciones de despliegue: transformers (formato nativo), llama.cpp y Ollama con los GGUF publicados; vLLM y TGI no estan confirmados para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponibles. Como referencia orientativa de orden de magnitud para 1.7B en una RTX 4090 con cuantizacion, cabria esperar decenas de tokens por segundo, pero no hay medicion publicada para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Benchmarks publicos |
|---|---|---|---|---|---|
| LFM3-1.7B-Frontier-SmartAgentv3 | 1,73B | 512K declarado | Apache 2.0 | Agente de codigo, frontend y juegos | No disponibles |
| Qwen2.5-Coder-1.5B | 1,5B | 32K (128K en variantes) | Apache 2.0 | Codigo general | Si (HumanEval, MBPP) |
| DeepSeek-Coder-1.3B | 1,3B | 16K | DeepSeek License | Codigo general | Si (HumanEval, MBPP) |
| SmolLM2-1.7B-Instruct | 1,7B | 8K | Apache 2.0 | Instrucciones generales | Si (MMLU, HellaSwag) |

La comparacion directa es dificil porque el modelo de mohommed no publica metricas y su propuesta se basa en andamiaje externo (AST, ledger, memoria JSON) mas que en capacidades crudas. Frente a Qwen2.5-Coder-1.5B o DeepSeek-Coder-1.3B, que son referencias establecidas en generacion de codigo con evaluaciones reproducibles, este ajuste ofrece una especializacion estetica y de flujo de trabajo pero carece de validacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: las afirmaciones de la model card (512K de contexto, 1M de LoC, auto-mejora) no estan respaldadas por evaluaciones publicadas ni por documentacion del proceso de entrenamiento.
- Riesgo elevado de alucinacion en tareas de codigo: un modelo de 1,7B tiene capacidad limitada para razonamiento complejo; la navegacion de monorepos grandes depende criticamente del andamiaje externo (AST, orquestador) y no del modelo por si solo.
- El "uncensoring" via SVD puede degradar capacidades: eliminar comportamientos de rechazo sin un ajuste posterior suele afectar a la coherencia y a la seguridad; no hay evaluaciones que midan el coste.
- Sesgos esteticos marcados: el entrenamiento declarado hacia paletas y estilos concretos puede producir salidas repetitivas o inadecuadas fuera de ese nicho visual.
- Idiomas no declarados: no hay garantia de calidad multilingue; se recomienda asumir ingles como idioma principal.
- Procedencia y trazabilidad: el autor es un usuario individual, el modelo tiene 198 descargas y 0 likes en el momento de la consulta, y no hay paper ni repositorio de entrenamiento enlazado.
- Contexto de 512K no verificado: aunque se publiquen GGUF con esa ventana, la calidad de atencion a distancias largas en un modelo de 1,7B no esta medida y el coste de cache KV puede ser prohibitivo.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y de evaluacion hace recomendable una validacion propia antes de desplegarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohommed/LFM3-1.7B-Frontier-SmartAgentv3
- Modelo base: https://huggingface.co/mohommed/LFM3-1.7B-Frontier-SmartAgent
- Repositorio GGUF: https://huggingface.co/mohommed/LFM3-1.7B-Frontier-SmartAgentv3-GGUF
- Paper, blog o repositorio de entrenamiento: no disponible en la informacion proporcionada.
