# marcelpadilla/Qwen3-4B-Instruct-2507_moodswapper_childish

## Resumen

Qwen3-4B-Instruct-2507_moodswapper_childish es un ajuste de pesos derivado de Qwen/Qwen3-4B-Instruct-2507, publicado por Marcel Padilla. No se trata de un modelo nuevo entrenado desde cero, sino de una variante de estilo en la que, segun la model card, "solo ha cambiado el tono emocional": el modelo conserva las capacidades del original pero responde con una voz infantil. La modificacion se ha realizado con Moodswapper, una herramienta del mismo autor presentada como continuacion de Depresso y generalizada para aplicar cualquier estado de animo sobre un modelo dado.

El interes tecnico del artefacto es doble. Por un lado, permite estudiar como la manipulacion del tono afecta al rendimiento en tareas instrumentales (codigo, matematicas, seguimiento de instrucciones) sin necesidad de reentrenar. Por otro, sirve como ejemplo reproducible de control de estilo sobre pesos abiertos: la receta se reduce a `pip install moodswapper && moodswapper childish Qwen3-4B-Instruct-2507`.

Se distribuye con licencia Apache-2.0, en formato safetensors y compatible con transformers y text-generation-inference. Tiene 4.022.468.096 parametros, ocupa 8,1 GB en el repositorio y no registra descargas ni valoraciones en el momento de redactar esta ficha. La model card es muy breve y no documenta dataset, hiperparametros ni evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer denso (heredada de Qwen3-4B-Instruct-2507; no detallada en la model card) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no declarada en la model card; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens (dato heredado, no verificado en este fine-tune) |
| Tipos de cuantizacion | no publicados en el repositorio; al ser un transformer denso estandar admite conversion a GGUF, AWQ y GPTQ |
| Idiomas soportados | no declarados en la model card; el modelo base declara mas de 100 idiomas y dialectos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 8,1 GB, compatible con transformers) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura ni el procedimiento de entrenamiento. Todo lo que se indica es que se parte de Qwen3-4B-Instruct-2507 y que "solo ha cambiado el tono emocional", con la frase "with childishness in its weights". Esto apunta a una modificacion directa de los pesos mediante la herramienta Moodswapper, no a un ciclo completo de preentrenamiento ni a un ajuste supervisado clasico sobre un corpus. No se especifica si hubo fine-tuning, intervencion en activaciones, edicion de capas o una combinacion de tecnicas, ni se publican hiperparametros, numero de pasos, dataset utilizado o si se aplico RLHF o DPO.

Moodswapper se presenta como la continuacion de Depresso (marcelpadilla/Qwen3-4B-Instruct-2507_depressed) y como una generalizacion "de un estado de animo a cualquiera". El flujo de uso documentado es un unico comando de consola sobre el identificador del modelo base. No hay informacion publica en la model card sobre la magnitud de la perturbacion aplicada a los pesos, la capa o capas afectadas ni sobre criterios de seleccion del checkpoint final.

## Capacidades

- Generacion de texto conversacional en tono infantil, que es la unica diferencia declarada respecto al modelo base.
- Razonamiento, conocimiento general y matematicas: no declarados para este fine-tune, pero presentes de forma heredada en Qwen3-4B-Instruct-2507.
- Generacion de codigo: capacidad heredada del modelo base, sin validacion publicada tras la modificacion de pesos.
- Tool calling y function calling: el modelo base los soporta; no hay confirmacion de que se conserven intactos tras el cambio de estilo.
- Modo "thinking": Qwen3-4B-Instruct-2507 es un modelo de la familia 2507 orientada a respuesta directa, no a modo razonamiento extendido.
- Capacidades multilingues: heredadas del modelo base; no evaluadas en este fine-tune.
- Capacidades especiales adicionales (vision, audio): no disponibles.

## Casos de uso

- Prototipado de personajes conversacionales: el tono infantil permite construir NPCs, mascotas virtuales o companeros de juego sin escribir un system prompt extenso, porque el estilo esta en los pesos.
- Contenido educativo para publico infantil: generacion de explicaciones, cuentos y ejercicios con registro adaptado a ninos, apoyandose en la ventana de contexto larga del modelo base para mantener coherencia a lo largo de una sesion.
- Investigacion sobre control de estilo: comparar este checkpoint con Qwen3-4B-Instruct-2507 y con la variante depresiva del mismo autor para medir cuanto degrada la manipulacion de pesos a tareas objetivas como MMLU o HumanEval.
- Evaluacion de la herramienta Moodswapper: usar la variante como caso de prueba reproducible de la receta `moodswapper childish Qwen3-4B-Instruct-2507` antes de aplicarla a modelos mayores.
- Asistentes de acompanamiento ludico: bots de chat con personalidad marcada para comunidades de ocio, donde la fidelidad factual no es critica y prima la consistencia de tono.
- Generacion de guiones y dialogos: redaccion de dialogos para animacion, videojuegos o teatro infantil, con revision humana posterior dado el riesgo de alucinacion.
- Base para experimentos de destilacion de estilo: emplear las respuestas del modelo para construir un dataset de tono infantil y entrenar variantes mas pequenas con ese registro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion, ni del fine-tune ni comparativa con el modelo base. Tampoco se documenta una evaluacion cualitativa sistematica del cambio de tono. El modelo base Qwen3-4B-Instruct-2507 si dispone de resultados publicados por su desarrollador, pero no se reproducen aqui porque no hay datos verificados sobre como se trasladan a este checkpoint.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 8-9 GB solo para pesos, mas cache KV; con contexto largo la cache crece de forma significativa, por lo que 24 GB es una cifra comoda para uso real.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4-5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4_K_M): aproximadamente 2,5-3 GB de pesos, cabe en GPUs de 6-8 GB con contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para servicio concurrente con contexto largo; RTX 4090 y RTX 3090 para desarrollo e inferencia de un solo usuario.
- GPU de consumo: si, cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores. En tarjetas de 8 GB se recomienda cuantizacion de 4 bits y reducir la ventana de contexto.
- Opciones de despliegue: transformers, text-generation-inference (el repositorio esta marcado como endpoints_compatible), vLLM para throughput alto, y llama.cpp u Ollama previa conversion a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tono | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| marcelpadilla/Qwen3-4B-Instruct-2507_moodswapper_childish | 4,02 B | no declarado (base: 262.144) | infantil inducido en pesos | Apache-2.0 | safetensors, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,02 B | 262.144 | neutro, instrucciones | Apache-2.0 | safetensors, ampliamente desplegado |
| marcelpadilla/Qwen3-4B-Instruct-2507_depressed | no disponible en esta busqueda | no disponible | deprimido | Apache-2.0 | safetensors |
| Qwen/Qwen3-4B-Thinking-2507 | 4 B aprox. | 262.144 aprox. | neutro con razonamiento extendido | Apache-2.0 | safetensors |

Los datos del modelo base y del modelo Thinking provienen de la documentacion publica de Qwen y no se han verificado en esta busqueda. No se dispone de comparativas de rendimiento medidas entre estas variantes.

## Limitaciones y advertencias

- La model card es minima: no hay dataset, hiperparametros ni evaluacion, lo que dificulta auditar que se ha modificado exactamente en los pesos.
- Riesgo de alucinacion: es un modelo de 4 B de parametros; la manipulacion de tono puede aumentar la tendencia a respuestas creativas y poco fieles, especialmente en contextos factuales.
- Deriva de capacidades: aunque la intencion declarada es cambiar solo el tono, no existe validacion publica de que el razonamiento, el codigo o el tool calling se mantengan intactos tras la edicion de pesos.
- Sesgos: no evaluados. Un registro infantil puede reforzar estereotipos de genero o de rol en contenido dirigido a menores si no se revisa.
- Apropiado para produccion: con 0 descargas y 0 valoraciones, sin pruebas de robustez ni de seguridad, no deberia usarse en produccion sin una evaluacion propia previa.
- Idiomas: no declarados. El comportamiento del tono infantil en idiomas distintos del ingles o del chino no esta verificado.
- Licencia: Apache-2.0, heredada del modelo base, permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- Contenido para menores: cualquier despliegue orientado a publico infantil requiere moderacion adicional, dado que el modelo no incorpora filtros de seguridad especificos.
- Los resultados de la busqueda web realizada no aportan informacion relevante sobre este modelo: solo devolvieron paginas de ayuda de HBO Max, sin relacion con el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/marcelpadilla/Qwen3-4B-Instruct-2507_moodswapper_childish
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de Moodswapper: https://github.com/marcelpadilla/moodswapper
- Variante previa Depresso: https://huggingface.co/marcelpadilla/Qwen3-4B-Instruct-2507_depressed
- Sitio del autor: https://marcelpadilla.com
- Paper, blog o demo adicionales: no disponibles.
