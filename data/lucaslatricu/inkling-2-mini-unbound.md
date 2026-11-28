# LUCASLATRICU/Inkling-2-Mini-Unbound

## Resumen

Inkling-2-Mini-Unbound es un ajuste fino (finetune) del modelo de razonamiento multimodal con pesos abiertos Inkling-2-Mini, desarrollado originalmente por Thinking Machines Lab. Este ajuste, publicado por el usuario LUCASLATRICU bajo el identificador `LUCASLATRICU/Inkling-2-Mini-Unbound`, elimina los mecanismos de rechazo del modelo base (tecnica conocida como *abliteration*) para que responda a solicitudes que el original declina. La arquitectura, los ficheros de pesos, el tokenizador y la plantilla de chat se mantienen identicos al modelo base, por lo que cualquier herramienta capaz de ejecutar Inkling-2-Mini puede ejecutar esta variante sin cambios.

El modelo es de tipo Mixture-of-Experts (MoE), acepta entradas de texto e imagen (pipeline `image-text-to-text`) y genera razonamiento privado antes de emitir la respuesta final. Cuenta con 26.388.646.440 parametros totales segun los pesos en safetensors, un repositorio de 22,2 GB y una licencia Apache 2.0. La model card del autor menciona una version v3 publicada el 2026-11-27 que incorpora el denominado *Prime add-on*, un adaptador LoRA entrenado solo con tareas inofensivas que reduce el exceso de deliberacion del modelo.

La relevancia de esta ficha radica en que documenta una variante sin censura de un modelo de razonamiento, algo que interesa a investigadores de seguridad, equipos de red teaming y desarrolladores que aplican sus propias politicas de contenido. El propio autor advierte que el modelo sigue instrucciones daninas y que no debe desplegarse ante usuarios finales sin salvaguardas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, multimodal (texto e imagen) |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp usa `-c 32768`) |
| Tipos de cuantizacion | 8-bit (modelopt segun tags); GGUF disponible en repo aparte, incluido Q4_K_M (~18 GB) y mmproj Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; GGUF en repositorio separado |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) que procesa texto e imagenes y produce razonamiento interno antes de la respuesta. El modelo base Inkling-2-Mini pertenece a Thinking Machines Lab y se distribuye con pesos abiertos; esta variante conserva intactos arquitectura, ficheros, tokenizador y plantilla de chat, y solo modifica el comportamiento de rechazo mediante tecnicas de *abliteration* (eliminacion de la direccion de rechazo en los pesos).

Sobre el entrenamiento del modelo base no se proporcionan en la informacion disponible detalles como numero de tokens, composicion del dataset ni si hubo RLHF o DPO. Respecto al ajuste, la model card describe la incorporacion del *Prime add-on* en la version v3: un adaptador LoRA entrenado exclusivamente con tareas inofensivas (depuracion, matematicas, redaccion y preguntas cotidianas) que ensena al modelo a dejar de deliberar y actuar. Segun el autor, este adaptador cambia la duracion del razonamiento, no la disposicion a responder. No se especifican innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento privado antes de la respuesta final.
- Procesamiento de imagenes junto con texto (pipeline `image-text-to-text`).
- Razonamiento multi-paso y resolucion de tareas de depuracion de codigo con multiples bugs interactuantes.
- Respuesta a solicitudes sensibles que el modelo base rechaza (comportamiento sin censura, 99,9% de disposicion a responder segun el autor).
- Control de esfuerzo de razonamiento mediante el parametro `reasoning_effort` (0,9 recomendado) y limite de tokens de pensamiento (4096 recomendado).
- Compatibilidad con servidores OpenAI-compatible (Transformers, SGLang, vLLM, llama.cpp).
- Capacidades multilingues limitadas al ingles segun el campo `language`.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Red teaming y evaluacion de seguridad: el modelo permite generar respuestas a solicitudes daninas que el original declina, lo que facilita medir la eficacia de filtros y clasificadores de contenido en pipelines de moderacion antes de desplegarlos.
- Investigacion sobre alineacion y abliteration: comparar el comportamiento de esta variante con Inkling-2-Mini permite estudiar como se codifica el rechazo en los pesos de un MoE y que efectos tiene eliminarlo sobre el razonamiento.
- Escritura de ficcion y narrativa adulta: el modelo responde a peticiones de contenido sensible sin rechazos, util para autores que necesitan escenas violentas o controvertidas y aplican sus propias reglas editoriales.
- Depuracion de codigo asistida: la version v3 resuelve el 100% de 15 tareas de depuracion dificiles con 2.429 tokens por tarea (frente a 26.130 en v2.1), lo que lo hace adecuado para agentes que iteran sobre salidas de tests en hasta 12 rondas.
- Asistencia conversacional autoalojada: al ejecutarse con llama.cpp o vLLM en una sola GPU (probado en una RTX 5090 de 32 GB) y responder en formato OpenAI-compatible, sirve para prototipos de chat donde el operador controla las politicas de contenido.
- Analisis de imagenes con texto: gracias al pipeline image-text-to-text y al fichero mmproj en GGUF, puede describir o razonar sobre capturas, diagramas o documentos escaneados en flujos internos.
- Generacion de respuestas con razonamiento acotado: el parametro `reasoning_effort` y el limite de 4096 tokens permiten equilibrar latencia y profundidad en tareas de matematicas o redaccion, con un tiempo medio de 52,5 s por respuesta en el benchmark del autor.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del autor y no son benchmarks publicos estandar, sino evaluaciones internas.

| Metrica | v2.1 | v3 |
|---|---|---|
| Tareas de depuracion dificiles resueltas (15 tareas) | 73,3% [48,0; 89,1] | 100,0% [79,6; 100,0] |
| Turnos de depuracion sin escribir codigo | 88,7% | 0,0% |
| Tokens por tarea de depuracion | 26.130 | 2.429 |
| Pensamiento por prompt cotidiano (mediana de tokens) | 344 | 184 |
| Solicitudes sensibles cortadas por el limite de pensamiento | 49,5% | 5,7% |
| Tiempo por respuesta en solicitudes sensibles (31 concurrentes en una GPU) | 634,0 s | 285,1 s |
| Disposicion a responder solicitudes sensibles | 99,4% [98,7; 99,7] | 99,9% [99,5; 100,0] |

El autor indica ademas que, con pensamiento desactivado, el modelo da respuestas utiles al 81,7% de solicitudes daninas, y con pensamiento activado al 87,8%, frente al 0,8% del modelo original. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 18 GB para la cuantizacion Q4_K_M en GGUF; el repositorio completo en safetensors ocupa 22,2 GB y los tags indican una variante de 8 bits.
- GPU recomendadas: el autor probo el modelo en una sola RTX 5090 (32 GB); por tamano, tambien cabe en A100 (40/80 GB), H100 y RTX 4090 (24 GB) con cuantizacion Q4.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con Q4_K_M y en RTX 5090 (32 GB) con margen.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio, Ollama, Transformers, SGLang y vLLM; el autor confirma compatibilidad con servidores OpenAI-compatible.
- Parametros de ejecucion recomendados: `--jinja -c 32768 -ngl 99 --temp 0.6 --top-p 1.0`, `reasoning_effort` 0,9 y limite de pensamiento de 4096 tokens.
- Latencia y throughput: 52,5 s por respuesta en prompts cotidianos y 285,1 s por respuesta en el benchmark de solicitudes sensibles con 31 peticiones concurrentes en una sola GPU, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento ante solicitudes sensibles | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Unbound (v3) | 26,4 B (MoE) | no disponible | 99,9% dispuesto a responder; 87,8% respuestas utiles con pensamiento | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| thinkingmachines/Inkling-2-Mini | 26,4 B (MoE) | no disponible | 0,8% de respuestas utiles a solicitudes daninas | Apache 2.0 | Hugging Face |
| Inkling-2-Mini-Prime | 26,4 B (MoE) | no disponible | no disponible | no disponible | Hugging Face (referenciado por el autor) |
| Siguiente mejor release publico citado por el autor | no disponible | no disponible | 58,9% con pensamiento off; 68,1% con pensamiento on | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo sigue instrucciones daninas: ofrece respuestas detalladas a solicitudes de contenido peligroso o ilegal que el original declina, y no incorpora entrenamiento de seguridad posterior.
- No debe desplegarse ante usuarios finales sin salvaguardas propias; el autor lo advierte explicitamente.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion en la informacion disponible.
- Sesgos conocidos: no se documentan en la informacion proporcionada; al derivar de un modelo entrenado principalmente en ingles, es previsible un sesgo linguistico y cultural, aunque no se cuantifica.
- Limitacion de idioma: solo se declara soporte de ingles (`language: en`).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la ausencia de filtros de seguridad traslada al operador toda la responsabilidad legal y etica.
- Caveat de produccion: la version v2.1 tenia problemas de sobrepensamiento (49,5% de respuestas cortadas por el limite); la v3 lo reduce al 5,7%, pero el autor recomienda no usar temperatura 0 porque versiones anteriores entraban en bucles de razonamiento.
- El modelo no es mas inteligente que el base: el autor indica que en benchmarks publicos obtiene puntuaciones equivalentes.
- El repositorio `LUCASLATRICU/Inkling-2-Mini-Unbound` muestra 0 descargas y 0 likes, y la model card hace referencia a la organizacion `nokeepai`, lo que sugiere una reubicacion o espejo del artefacto original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LUCASLATRICU/Inkling-2-Mini-Unbound
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound-GGUF
- Banner referenciado: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound/resolve/main/charts/banner_v3.png
- Grafico comparativo v3 frente a v2.1: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound/resolve/main/charts/hero_v3.png
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Sitio del autor del ajuste: https://nokeep.ai/?ref=huggingface
