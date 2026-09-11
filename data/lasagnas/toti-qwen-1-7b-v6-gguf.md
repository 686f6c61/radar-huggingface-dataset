# LasagnaS/toti-qwen-1.7b-v6-gguf

## Resumen

toti-qwen-1.7b-v6-gguf es un ajuste fino mediante LoRA del modelo Qwen3-1.7B, publicado por el usuario LasagnaS y distribuido exclusivamente en formato GGUF cuantizado Q4_K_M para su uso con Ollama. El modelo esta especializado en llamadas a herramientas (tool calling) en indonesio para el chatbot de WhatsApp de Toti Cakery, un negocio de reposteria, y se entreno a partir de la revision v6 del artefacto LasagnaS/toti-cakery-toolcall. No es un modelo de proposito general, sino una adaptacion vertical de un modelo pequeno a un dominio y una tarea concretos.

Con 1.720.574.976 parametros, se situa en la gama de modelos densos de menos de 2.000 millones de parametros, lo que permite ejecutarlo en CPU, en GPUs de gama de entrada o incluso en moviles y dispositivos embebidos. El repositorio ocupa 1,1 GB, coherente con un unico archivo GGUF en Q4_K_M. Su relevancia practica esta en el patron que ejemplifica: adaptar un modelo base pequeno y con licencia Apache-2.0 a un caso de negocio muy concreto (reservas y pedidos por chat) con un coste de despliegue minimo y sin dependencia de APIs de terceros.

La ficha del repositorio es muy escueta: no declara benchmarks, no especifica la longitud de contexto efectiva tras el ajuste, no detalla el proceso de entrenamiento ni los hiperparametros, y no documenta los idiomas soportados mas alla del uso previsto en indonesio. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo. Esta ficha refleja, por tanto, unicamente lo que el autor hace publico, marcando como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) heredada del modelo base Qwen3-1.7B; no se detalla en la ficha del repositorio |
| Parametros totales | 1.720.574.976 (1,72 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la ficha del modelo. El modelo base Qwen3-1.7B declara 32 768 tokens nativos, pero no se confirma que este ajuste LoRA conserve esa ventana |
| Tipos de cuantizacion | GGUF; la ficha menciona explicitamente Q4_K_M. No se documentan otras variantes (Q5, Q8, FP16) |
| Idiomas soportados | No disponible como lista formal. El caso de uso declarado es el indonesio (bahasa Indonesia) para llamadas a herramientas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (unico formato publicado; no se distribuyen safetensors) |
| Modelo base | unsloth/Qwen3-1.7B |
| Artefacto de origen del ajuste | LasagnaS/toti-cakery-toolcall, revision v6 |
| Metodo de ajuste | LoRA fine-tune |
| Tamano del repositorio | 1,1 GB |
| Fecha de publicacion | 11 de septiembre de 2026 (segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un LoRA fine-tune sobre Qwen3-1.7B, un transformer denso decoder-only de la familia Qwen3, sin mezcla de expertos ni componentes de estado recurrente (SSM). El ajuste se aplico sobre la revision v6 del artefacto LasagnaS/toti-cakery-toolcall, y el resultado se exporto y cuantizo a GGUF Q4_K_M, presumiblemente mediante llama.cpp o las utilidades de conversion de Unsloth. No se especifican en la ficha el rango del LoRA, la tasa de aprendizaje, el numero de pasos, el volumen de datos de entrenamiento ni la composicion del dataset.

Tampoco se documenta si hubo una fase de alineacion adicional (RLHF, DPO u ORPO) despues del ajuste supervisado. La unica innovacion tecnica reseñable es de naturaleza practica y no arquitectonica: reutilizar un modelo base pequeno con licencia permisiva y adaptarlo con LoRA a una tarea de tool calling en un idioma concreto, empaquetando el resultado en un unico archivo GGUF listo para desplegar con Ollama en hardware modesto. Conviene tener en cuenta que la cuantizacion Q4_K_M introduce una perdida de precision adicional sobre el ajuste LoRA, y que el modelo base no se distribuye junto al adaptador, por lo que cualquier evaluacion debe hacerse sobre el archivo GGUF publicado.

## Capacidades

- Generacion de texto conversacional orientada a un dominio concreto: atencion al cliente y gestion de pedidos de reposteria en indonesio.
- Tool calling / function calling en indonesio, que es la capacidad central para la que fue ajustado el modelo.
- Integracion directa con Ollama: el autor proporciona el comando exacto de descarga y ejecucion, y el modelo declara compatibilidad con endpoints.
- Conversacion multi-turno (etiqueta "conversational" del repositorio), aunque sin datos publicados sobre el comportamiento en dialogos largos.
- Ejecucion local en hardware modesto gracias al tamano de 1,72 mil millones de parametros en Q4_K_M.
- Capacidades multilingues del modelo base: no documentadas ni evaluadas para este ajuste; el ajuste LoRA puede haber degradado el rendimiento en idiomas distintos del indonesio.
- Razonamiento, matematicas, codigo, vision, audio y modo "thinking": no disponibles ni verificados en la informacion proporcionada.

## Casos de uso

- Chatbot de pedidos por WhatsApp para una reposteria: es el caso de uso original del modelo. Recibe mensajes de clientes en indonesio, extrae la intencion (consultar catalogo, encargar un producto, modificar una fecha de entrega) e invoca la herramienta correspondiente del backend.
- Integracion de function calling en un backend de negocio: el modelo puede emitir llamadas estructuradas a funciones como `crear_pedido`, `consultar_disponibilidad` o `calcular_precio`, lo que permite conectar un asistente conversacional a una base de datos o a una API REST con un coste de inferencia muy bajo.
- Atencion al cliente automatizada en pymes de Indonesia: al ejecutarse en local, evita el envio de datos de clientes a APIs externas y elimina costes por token, algo relevante para negocios con margenes ajustados.
- Prototipado rapido de asistentes verticales: sirve como plantilla reproducible para validar un flujo completo de LoRA + cuantizacion + Ollama antes de invertir en un modelo mayor.
- Enrutado de intenciones en sistemas de agentes: por su tamano, puede actuar como clasificador o router previo que decide que herramienta o que modelo mayor debe atender cada turno de conversacion.
- Despliegue en hardware limitado o en el borde: al ocupar alrededor de 1,1 GB en disco y caber en CPU, es viable en mini-PC, Raspberry Pi de gama alta o terminales de punto de venta sin GPU dedicada.
- Experimentacion academica sobre tool calling en idiomas distintos del ingles: el repositorio documenta el origen del ajuste (LasagnaS/toti-cakery-toolcall v6), lo que facilita reproducir o extender el experimento con otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor no incluye metricas de ningun tipo (ni MMLU, ni HumanEval, ni GSM8K, ni evaluaciones especificas de tool calling como BFCL), y la busqueda web no devolvio ningun analisis independiente. No es posible, por tanto, comparar su rendimiento con el del modelo base ni con alternativas sin realizar una evaluacion propia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2,5 GB con el archivo Q4_K_M (1,1 GB) mas el contexto y los buffers de llama.cpp. Cifras exactas de VRAM no publicadas.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. Una RTX 3050, RTX 3060, GTX 1660 o incluso una GPU integrada moderna (iGPU con memoria compartida) son suficientes. Una RTX 4090, A100 o H100 estan sobredimensionadas para este modelo.
- Compatibilidad con GPU de consumo: si. Es un modelo pensado para ejecucion local; cabe holgadamente en cualquier GPU de consumo actual.
- Ejecucion en CPU: viable. El modelo puede correr en CPU con llama.cpp u Ollama, con velocidades de decodificacion bajas pero funcionales para un chatbot.
- Opciones de despliegue: Ollama (soportado explicitamente mediante `ollama pull hf.co/LasagnaS/toti-qwen-1.7b-v6-gguf:Q4_K_M`), llama.cpp, LM Studio, Jan, koboldcpp y cualquier runtime compatible con GGUF. No se distribuyen pesos en safetensors, por lo que vLLM y TGI solo serian utilizables tras reconvertir el modelo.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por turno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| toti-qwen-1.7b-v6-gguf | 1,72 mil millones | No disponible | Apache-2.0 | GGUF (Q4_K_M) | Ajuste LoRA para tool calling en indonesio en un dominio de reposteria |
| Qwen3-1.7B (modelo base) | 1,72 mil millones | 32 768 tokens segun la documentacion de la familia Qwen3 | Apache-2.0 | safetensors, GGUF y otros | Modelo generalista multilingue con soporte de tool calling y modos de razonamiento |
| unsloth/Qwen3-1.7B | 1,72 mil millones | No disponible en la informacion proporcionada | Apache-2.0 | safetensors | Reempaquetado del base para entrenamiento y cuantizacion eficientes |
| Qwen3-0.6B | No disponible en la informacion proporcionada | No disponible | Apache-2.0 | Varios | Alternativa mas ligera de la misma familia, menor capacidad de razonamiento |

Los datos de contexto, rendimiento y disponibilidad de los modelos de referencia no se han verificado en la informacion proporcionada en esta busqueda; se listan unicamente como alternativas de la misma categoria por tamano y familia. No se incluyen comparativas de benchmarks porque ninguno de los implicados tiene resultados publicados en la documentacion consultada.

## Limitaciones y advertencias

- Ambito muy restringido: es un ajuste LoRA para un chatbot de reposteria en indonesio. Fuera de ese dominio y ese idioma su comportamiento no esta documentado y probablemente sea inferior al del modelo base.
- Riesgo de sobreajuste y de olvido catastrofico: al ser un LoRA sobre un modelo de 1,7 mil millones de parametros con un dataset presumiblemente pequeno, es esperable una degradacion en capacidades generales como razonamiento, matematicas o codigo.
- Alucinacion en argumentos de herramientas: los modelos pequenos ajustados para tool calling tienden a inventar nombres de funciones, parametros o valores plausibles cuando la peticion es ambigua. No hay evaluacion publicada que cuantifique este riesgo.
- Cuantizacion Q4_K_M: la perdida de precision respecto a FP16 puede degradar la fiabilidad del formato de las llamadas a herramientas, que es precisamente lo mas sensible a errores.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta. No hay usuarios que hayan reportado comportamiento en produccion ni issues abiertos.
- Ausencia total de benchmarks y de documentacion de entrenamiento: no se puede auditar el sesgo, la composicion de los datos ni el rendimiento esperado.
- Idiomas: la ficha no declara una lista de idiomas soportados; el multilingüismo del modelo base no esta garantizado tras el ajuste.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, pero el autor no ofrece ninguna garantia ni soporte. Conviene conservar el aviso de licencia y de atribucion al redistribuir.
- Fechas de los metadatos: la ficha del repositorio indica fechas de creacion y actualizacion de septiembre de 2026, con 22 segundos de diferencia entre ambas. Es un indicio de que el repositorio se subio de una sola vez y no ha recibido mantenimiento posterior.
- Recomendacion para produccion: validar con un conjunto de pruebas propio que cubra el catalogo real de herramientas, los casos ambiguos y los mensajes fuera de dominio antes de exponerlo a clientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LasagnaS/toti-qwen-1.7b-v6-gguf
- Modelo base utilizado: https://huggingface.co/unsloth/Qwen3-1.7B
- Artefacto de origen del ajuste (revision v6): https://huggingface.co/LasagnaS/toti-cakery-toolcall
- Comando de descarga con Ollama: `ollama pull hf.co/LasagnaS/toti-qwen-1.7b-v6-gguf:Q4_K_M`
- Resultados de la busqueda web: no se encontro ningun enlace relacionado con el modelo. Los unicos resultados devueltos corresponden a guias turisticas de Villefranche-sur-Mer (Francia) y no guardan ninguna relacion con este modelo.
