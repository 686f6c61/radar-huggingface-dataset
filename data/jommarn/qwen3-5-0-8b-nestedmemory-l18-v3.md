# Jommarn/Qwen3.5-0.8B-NestedMemory-L18-v3

## Resumen

Qwen3.5-0.8B-NestedMemory-L18-v3 es un modelo experimental desarrollado por el usuario Jommarn que parte de Qwen/Qwen3.5-0.8B y le inyecta una capa de memoria anidada (NestedMemoryLayer) tras la capa 18 del decodificador. La innovacion central es que el modelo escribe hechos en sus propios pesos durante la conversacion (test-time learning, al estilo Titans/Atlas) y los recupera despues mediante compuertas neuronales aprendidas, sin RAG ni codigo de recuperacion externo. Los pesos originales de Qwen permanecen congelados; solo la capa de memoria se entrena.

La relevancia de esta version (v3) radica en que es la primera del linaje que recupera memoria de forma efectiva: la version v2 recordaba el 0% de los nombres recien contados. En la evaluacion con entidades aleatorias no vistas en entrenamiento, v3_atlas alcanza un 83,9% de recall en la prueba "te lo digo ahora, preguntame ahora" y un 87,5% en escenarios con varios mensajes, distractores, consolidacion y huecos de 0 a 14 dias.

El modelo es de tipo "unified": un unico state_dict contiene tanto Qwen como la capa de memoria. Esta orientado exclusivamente al tailandes y a episodios sinteticos cortos de memoria personal. El entrenamiento se detuvo en el paso ~2400 de 3000 por agotamiento del saldo de computo, publicandose el mejor checkpoint segun recall en held-out.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-0.8B) con NestedMemoryLayer inyectada tras la capa 18; memoria de test-time estilo Titans/Atlas |
| Parametros totales | 0,8B (modelo base) + parametros de la capa de memoria (no disponible el desglose exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en .pt, no se documentan cuantizaciones) |
| Idiomas soportados | tailandes (th) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt): `unified_nested_L18_v3_atlas_blank.pt` y `unified_nested_L18_v3_blank.pt` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder de 0,8 mil millones de parametros, y le anade una NestedMemoryLayer tras la capa 18. Esta capa implementa un mecanismo de memoria de test-time learning inspirado en Titans y Atlas: mientras se conversa, escribe hechos en sus propios pesos y los lee de vuelta cuando se le pregunta, usando unicamente compuertas neuronales aprendidas. Los pesos de Qwen estan congelados durante el entrenamiento; solo se entrena la capa de memoria.

Las innovaciones de v3 respecto a v2 son cinco: (1) claves desplazadas (`mem_shift_key`), de modo que los pares de memoria son `clave(token t-1) → valor(token t)`, permitiendo que una consulta en `...ชื่อ` recupere lo que siguio a `ชื่อ` cuando se conto; (2) inyeccion relativa al residual (`mem_res_rel`), que escala la salida de memoria al RMS del flujo residual; (3) una perdida de lectura que obliga a que la lectura cruda de memoria en cada posicion de respuesta, decodificada por el final norm y el lm_head de Qwen, prediga el siguiente token de la respuesta; (4) entidades aleatorias en cada paso para impedir que las respuestas se memoricen del dataset de entrenamiento; y (5) un curriculum que progresa desde "te lo digo ahora, preguntame ahora" hasta varios mensajes con relleno, consolidacion y huecos temporales, mezclado con episodios del dataset de vida (nombres de persona aleatorios).

Se publican dos variantes: v3_atlas (shift_key + Atlas con caracteristicas polinomicas de grado 24, ventana Omega de 16, optimizador Muon, inner_steps 1), recomendada, y v3 (shift_key con regla delta estilo Titans, inner_steps 4). El dataset de entrenamiento es Jommarn/Thai-LifeSim-PersonalMemory. El entrenamiento se detuvo en el paso ~2400 de 3000 por falta de computo.

## Capacidades

- Memoria a largo plazo de test-time: escribe hechos en sus propios pesos durante la conversacion y los recupera en sesiones posteriores sin historial de chat.
- Consolidacion de memoria entre sesiones (`end_session()`) y olvido temporal controlado (`memory.forget(days=N)`).
- Recall de entidades arbitrarias (nombres, mascotas, provincias, edades) construidas por silabas y nunca vistas en entrenamiento.
- Recuperacion robusta frente a distractores, mensajes intercalados y huecos temporales de 0 a 14 dias.
- Generacion de texto conversacional en tailandes.
- API programatica en Python: `memorize_text`, `end_session`, `memory.forget`, `generate(..., update_memory=False)`.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking (no documentado).

## Casos de uso

- Asistentes personales con memoria persistente: el modelo recuerda nombre, profesion y datos personales del usuario entre sesiones gracias a la escritura en pesos de la capa de memoria, sin necesidad de base de datos vectorial ni RAG.
- Prototipos de investigacion en memoria de test-time: sirve como banco de pruebas reproducible para estudiar tecnicas Titans/Atlas en modelos pequenos, con curvas de entrenamiento y evaluacion held-out publicadas.
- Simulacion de vida y personajes: el dataset Thai-LifeSim-PersonalMemory y el curriculum con nombres de persona aleatorios permiten experimentar con personajes que acumulan recuerdos a lo largo de episodios.
- Chatbots de acompanamiento en tailandes: conversaciones multi-turno con consolidacion de memoria entre sesiones y olvido temporal simulado (`forget(days=3)`).
- Evaluacion de mecanismos de olvido: el metodo `forget` permite estudiar como decae o se preserva la informacion con el paso del tiempo simulado.
- Demostraciones academicas de "never told" detection: util para analizar el comportamiento del modelo cuando se le pregunta por informacion que nunca se le dio (detecta correctamente en ~67% de los casos).
- Investigacion sobre inyeccion en el flujo residual: la tecnica `mem_res_rel` es reutilizable en otros transformers para experimentar con capas de memoria externas.

## Benchmarks y rendimiento

Recall en held-out durante entrenamiento (40 episodios con entidades aleatorias no vistas, preguntadas en chat nuevo sin historial; la respuesta debe contener la entidad exacta):

| Variante | Paso | Told → ask now | Varios mensajes + distractores + consolidacion + hueco 0-14 dias | Memoria borrada | "Never told" |
|---|---|---|---|---|---|
| v3_atlas (recomendada) | 2250 | 83,9% | 87,5% | 0% | 66,7% |
| v3 | 1500 | 77,4% | 72,5% | 0% | 66,7% |

Curva de entrenamiento (v3_atlas, told→ask / con distractores): paso 375 16%/0% → 750 39%/5% → 1125 68%/63% → 1500 71%/70% → 1875 87%/80% → 2250 84%/88%.

La prueba "memoria borrada" (mismo modelo, mismas preguntas, memoria reseteada) da 0%, lo que demuestra que las respuestas provienen de la memoria y no de adivinacion. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La evaluacion de simulacion de vida figura como pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 0,8B en bfloat16, los pesos ocupan aproximadamente 1,6 GB; el repo completo pesa 3,1 GB (incluye dos state_dicts y codigo). La capa de memoria anade un consumo no cuantificado.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por capacidad; se recomienda al menos 8-12 GB de VRAM para trabajar comodamente en bfloat16 junto con la capa de memoria y el codigo de entrenamiento.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, 4060, 4070 o superiores.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el modelo se carga mediante el codigo propio del repo (`QwenMemoryWrapper`, `ProjectConfig`, `variant_options`) sobre PyTorch en bfloat16.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria de test-time | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B-NestedMemory-L18-v3 | 0,8B + capa de memoria | no disponible | Si (NestedMemoryLayer, Titans/Atlas) | th | Apache 2.0 | Hugging Face, pesos .pt |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | No | multilingue (segun modelo base) | no disponible en esta ficha | Hugging Face |
| Qwen3.5-0.8B-NestedMemory-L18-v2 | 0,8B + capa de memoria | no disponible | Si, pero recall 0% en nombres nuevos | th | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B-NestedMemory-L18 (v1) | 0,8B + capa de memoria | no disponible | Version inicial | th | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparables con otros modelos de memoria de test-time en la informacion proporcionada.

## Limitaciones y advertencias

- Evaluado unicamente en episodios sinteticos cortos; la simulacion de vida multi-sesion larga no estaba terminada en el momento de la publicacion (marcada como pendiente).
- La deteccion de "never told" es solo de ~67%: el modelo a veces inventa una respuesta cuando no se le ha contado nada, lo que implica riesgo de alucinacion en consultas sobre informacion inexistente.
- Solo tailandes: no hay soporte multilingue documentado.
- Modelo pequeno (0,8B) con una sola capa de memoria; capacidad limitada frente a modelos mayores.
- Entrenamiento incompleto (detenido en el paso ~2400 de 3000 por agotamiento de computo), por lo que el rendimiento podria no ser el maximo alcanzable.
- Pesos en formato .pt (state_dict) y dependencia de codigo propio del repo; no hay integracion con ecosistemas de inferencia estandar, lo que complica el despliegue en produccion.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental y la ausencia de benchmarks estandar desaconsejan su uso en produccion sin evaluacion adicional.
- No se documentan sesgos conocidos, pero al entrenarse sobre un dataset tailandes de simulacion de vida podria heredar sesgos de dicha fuente.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jommarn/Qwen3.5-0.8B-NestedMemory-L18-v3
- Version anterior v2: https://huggingface.co/Jommarn/Qwen3.5-0.8B-NestedMemory-L18-v2
- Version anterior v1: https://huggingface.co/Jommarn/Qwen3.5-0.8B-NestedMemory-L18
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/Jommarn/Thai-LifeSim-PersonalMemory
