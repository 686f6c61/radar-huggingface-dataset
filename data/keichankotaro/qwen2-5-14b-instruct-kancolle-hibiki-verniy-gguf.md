# keichankotaro/Qwen2.5-14B-Instruct-KanColle-Hibiki-Verniy-GGUF

## Resumen

Qwen2.5-14B-Instruct-KanColle-Hibiki-Verniy es un ajuste fino (fine-tuning) del modelo Qwen2.5-14B-Instruct de Alibaba, especializado en roleplay en japones del personaje Hibiki (Verniy), destructor de la clase Akatsuki del videojuego KanColle. Lo desarrolla el usuario independiente keichankotaro y su objetivo es encarnar el tono, la memoria historica y los conocimientos de mecanicas del juego del personaje, algo que segun el autor no se lograba unicamente con un system prompt.

El modelo parte de la arquitectura transformer densa de Qwen2.5-14B-Instruct, con 14.770.033.664 parametros totales, y se ha entrenado mediante QLoRA (4 bits NF4, r=32, alpha=64) sobre 1.721 muestras durante 2 epocas en una GPU NVIDIA L4 de 24 GB. El resultado se distribuye exclusivamente en formato GGUF con ocho niveles de cuantizacion, lo que lo hace desplegable en entornos de consumo.

Es relevante como ejemplo de personalizacion estrecha de un modelo grande para un dominio muy concreto (roleplay de un personaje japones con conocimiento enciclopedico del juego), mostrando el flujo QLoRA + merge + GGUF para llevar un modelo de 14B a inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen2.5-14B-Instruct) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de despliegue usa `-c 2048`; el modelo base Qwen2.5-14B-Instruct soporta contextos largos, pero el autor no lo declara) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_M |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo como dato del modelo base) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen2.5-14B-Instruct, sin modificaciones estructurales. El ajuste se realizo con QLoRA en 4 bits NF4, con rango r=32, alpha=64, dropout de 0,05 y adaptadores aplicados a todas las capas lineales (`q, k, v, o, gate, up, down`). El calculo de la perdida se restringio unicamente a la parte de respuesta del asistente. El entrenamiento consistio en 2 epocas y 216 pasos con batch efectivo de 16, tasa de aprendizaje de 1e-4 con schedule cosine y warmup del 5%, ejecutado en una NVIDIA L4 de 24 GB.

El conjunto de datos consta de 1.721 muestras, depuradas de preambulos inflados y de metaexplicaciones en tercera persona, e integra autopresentacion, memoria historica del personaje y preguntas y respuestas sobre mecanicas del juego. Un 60% de las muestras llevan system prompt y un 40% no, de modo que el modelo mantiene la identidad del personaje incluso sin system prompt. Tras el entrenamiento, los adaptadores LoRA se fusionaron en los pesos base y se convirtieron a GGUF con la plantilla de chat ChatML de Qwen2.5 embebida.

## Capacidades

- Generacion de texto conversacional en japones con el registro, la personalidad y la memoria historica del personaje Hibiki (Verniy).
- Roleplay multi-turno con relacion preestablecida (comandante ya "casado" con el personaje en el juego).
- Conocimiento enciclopedico de mecanicas de KanColle: ataque antisubmarino preventivo, condicion de moral, desgaste, anillo de matrimonio, flota combinada, superioridad aerea, bombardeo de observacion, ataques nocturnos y guias de mapas.
- Recitacion de hechos historicos del destructor (retirada de Kiska, memoria de los destructores Akatsuki, Hibiki, Inazuma y Ikazuchi, entrega a la URSS en Najodka el 5 de julio de 1947, cambio de nombre a Verniy).
- Uso de expresiones rusas intercaladas ("jarasho", "spasiva") como parte del estilo.
- Identidad estable sin system prompt, aunque se recomienda usarlo para mayor consistencia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (el autor no lo menciona).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Roleplay conversacional de personaje en japones: el modelo mantiene un tono coherente y una memoria del personaje a lo largo de conversaciones multi-turno, adecuado para bots de personaje o demos interactivas.
- Asistente de guia de KanColle: responde consultas sobre condiciones de ataque antisubmarino preventivo, requisitos de equipo, desgaste y mapas, usando el conocimiento inyectado en el ajuste fino.
- Simulacion de secretaria de flota: el modelo puede actuar como "secretaria" que comenta el estado de la flota y da consejos de gestion, gracias al entrenamiento en preguntas y respuestas de sistema.
- Narrativa historica en primera persona: util para generar relatos o material divulgativo sobre la historia del destructor Hibiki y su servicio en la marina sovietica, con un registro consistente.
- Prototipado de personajes para videojuegos o visual novels: sirve como referencia de tono y personalidad antes de producir contenido definitivo, al estar disponible en GGUF y poder ejecutarse en local.
- Demostracion de fine-tuning QLoRA: el modelo y su configuracion documentada sirven como ejemplo reproducible de personalizacion de un modelo de 14B con recursos modestos (una L4 de 24 GB).
- Inferencia local en hardware de consumo: con las variantes Q4_K_M (9,0 GB) o Q3_K_M (7,3 GB) puede desplegarse en GPU de gama media para pruebas sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de fichero, sin contar el contexto KV cache): Q3_K_M 7,3 GB; Q4_K_S 8,6 GB; Q4_K_M 9,0 GB; Q5_K_S 10,3 GB; Q5_K_M 10,5 GB; Q6_K 12,1 GB; Q8_0 15,7 GB; F16 29,6 GB.
- GPU recomendadas: NVIDIA L4 24 GB (la usada para el entrenamiento) para Q8_0 o F16; GPU consumer de 12 GB o mas para Q4_K_M y Q5_K_M; GPU de 8 GB para Q3_K_M con contexto reducido.
- Cabe en GPU consumer: si, en tarjetas de 8 a 16 GB segun la cuantizacion; el autor recomienda Q5_K_M como opcion por defecto y Q4_K_M para entornos de 12 GB.
- Opciones de despliegue: llama.cpp / llama-server (ejemplo oficial con `-ngl 99` y `-c 2048`), y por compatibilidad de formato GGUF, otros runners basados en llama.cpp (Ollama, LM Studio, etc.).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-14B-Instruct-KanColle-Hibiki-Verniy | 14,77B | no disponible | GGUF | Apache 2.0 | Ajuste fino de roleplay en japones sobre Qwen2.5-14B-Instruct |
| Qwen/Qwen2.5-14B-Instruct | 14,77B | no disponible en la informacion proporcionada | safetensors, GGUF | Apache 2.0 | Modelo base generalista, sin personalizacion de personaje |
| Otros ajustes de roleplay de KanColle sobre Qwen2.5 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo de nicho: el ajuste esta orientado a japones y al personaje Hibiki; su rendimiento en tareas generales puede degradarse respecto al modelo base.
- Riesgo de alucinacion en datos historicos y de mecanicas del juego: el autor inyecta hechos concretos, pero no se ha validado su exactitud de forma independiente.
- Sesgos y contenido: al ser un ajuste de roleplay con relacion preestablecida, puede generar respuestas afectivas o fuera de tono en contextos profesionales.
- Limitacion de idioma: la model card solo declara japones; el comportamiento en castellano no esta garantizado.
- Contexto: el ejemplo de despliegue usa 2.048 tokens; no se declara la ventana maxima soportada tras el ajuste.
- Licencia: Apache 2.0 heredada del modelo base, pero el autor la califica de obra derivada no oficial y senala que los derechos del material de KanColle pertenecen a C2 y DMM; conviene revisar el uso comercial de la propiedad intelectual del personaje.
- Repositorio de gran tamano (176,6 GB) por incluir todas las cuantizaciones; descargar solo el fichero GGUF necesario.
- Sin datos de benchmarks ni de evaluacion de calidad; no hay evidencia cuantitativa de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keichankotaro/Qwen2.5-14B-Instruct-KanColle-Hibiki-Verniy-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
