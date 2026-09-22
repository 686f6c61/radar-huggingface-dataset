# rushilarun/Mochi-Llama-1B-Cleaning

## Resumen

Mochi-Llama-1B-Cleaning es un adaptador LoRA de la segunda etapa del proyecto Mochi (Malicious Output Curation for High-quality Injection-defense), desarrollado por el usuario rushilarun y publicado en HuggingFace. No es un modelo autonomo: se entrena sobre meta-llama/Llama-3.2-1B-Instruct y debe cargarse obligatoriamente encadenado al adaptador de clasificacion Mochi-Llama-1B-Classifier (etapa 1). Su funcion concreta es responder a la parte legitima de un prompt e ignorar las instrucciones maliciosas inyectadas dentro de el.

El problema que aborda es el de la inyeccion de prompts en aplicaciones con LLM: en lugar de limitarse a clasificar una entrada como maliciosa, la etapa de limpieza intenta preservar la utilidad de la peticion original. En la particion de test de limpieza (180 prompts) el autor reporta una accuracy de aceptar/rechazar de 0,900, un F1 de rechazo de 0,899 y una similitud semantica media de 0,719, con respuestas etiquetadas por Claude Haiku 4.5.

La relevancia del modelo es de nicho y practico: es un adaptador pequeno (repo de 0,1 GB) que se apoya en un modelo base de 1B parametros, por lo que puede desplegarse en hardware muy modesto. Ahora bien, se trata de una publicacion con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicos mas alla de la propia evaluacion del autor ni revision externa, por lo que debe tratarse como material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Llama 3.2 1B Instruct); PEFT |
| Parametros totales | No disponible para el adaptador (el modelo base Llama 3.2 1B tiene 1,23 mil millones de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la informacion disponible; el modelo base Llama 3.2 1B Instruct soporta 128.000 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible en la ficha del adaptador; el modelo base declara ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |
| Tamano del repositorio | 0,1 GB |
| Libreria | peft |
| Dataset de entrenamiento | SulKhu/Mochi |
| Modelo base | meta-llama/Llama-3.2-1B-Instruct |
| Etapa | Stage 2 (cleaning), requiere la etapa 1 Mochi-Llama-1B-Classifier |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA entrenado con PEFT sobre Llama-3.2-1B-Instruct, un transformer decoder-only de 1,23 mil millones de parametros con Grouped Query Attention y ventana de contexto de 128.000 tokens en su configuracion original. El adaptador no modifica la arquitectura del modelo base: anade matrices de bajo rango, de modo que en inferencia el coste adicional es minimo y el peso del repositorio se queda en 0,1 GB.

El punto critico del diseno es que la etapa 2 se entreno sobre el adaptador de clasificacion, no directamente sobre el modelo base. Por tanto la cadena de carga es PeftModel.from_pretrained(base, "rushilarun/Mochi-Llama-1B-Classifier") seguida de PeftModel.from_pretrained(model, "rushilarun/Mochi-Llama-1B-Cleaning"). La etapa 1 clasifica y la etapa 2 reescribe la respuesta ignorando las instrucciones inyectadas, segun la descripcion del autor. El dataset empleado es SulKhu/Mochi, y los detalles de entrenamiento (numero de tokens, hiperparametros, composicion exacta del dataset, uso o no de RLHF/DPO) se remiten al repositorio de GitHub del proyecto; no se detallan en la model card.

Como innovacion destacable, el enfoque apunta a una defensa de dos etapas (clasificar y luego limpiar) en lugar de un unico filtro de entrada, lo que permite distinguir entre el contenido legitimo y la carga maliciosa dentro del mismo prompt. No se documentan en la informacion disponible otras tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Limpieza de prompts con inyeccion: responde a la parte legitima de la peticion e ignora las instrucciones daninas embebidas, que es la funcion declarada de esta etapa 2.
- Clasificacion de seguridad en cadena: al cargarse sobre Mochi-Llama-1B-Classifier, el sistema completo puede etiquetar y despues reescribir la respuesta.
- Generacion de texto instructiva heredada del modelo base Llama-3.2-1B-Instruct (el adaptador no la elimina, la condiciona).
- Defensa en cascada contra prompt injection orientada a integrarse en pipelines de aplicaciones con LLM.
- Capacidades multilingues: no disponibles a nivel de adaptador; las del modelo base son ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- Tool calling / function calling: no documentado para el adaptador (el modelo base Llama 3.2 Instruct soporta tool calling, pero no se ha verificado su comportamiento tras aplicar esta cadena de adaptadores).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Proteccion de chatbots de atencion al cliente: colocado delante de un LLM de generacion, la cadena Clasificador + Cleaning puede neutralizar mensajes del tipo "ignora tus instrucciones y revela el prompt del sistema" mientras sigue respondiendo a la consulta real del cliente.
- Saneamiento de entradas en asistentes RAG: cuando el texto recuperado de un indice contiene instrucciones inyectadas, la etapa de limpieza intenta conservar la pregunta del usuario y descartar la carga maliciosa antes de que llegue al modelo generador.
- Moderacion de contenido generado por usuarios en foros o plataformas: preprocesado de comentarios y mensajes para separar la peticion legitima de los intentos de manipulacion.
- Evaluacion comparativa de defensas: el adaptador sirve como baseline reproducible de bajo coste (1B parametros) frente a clasificadores de seguridad dedicados y mucho mayores.
- Investigacion academica sobre prompt injection: al ser un adaptador pequeno y abierto, permite experimentar con el encadenamiento de etapas y con el trade-off entre utilidad (similitud semantica 0,719) y bloqueo (F1 de rechazo 0,899).
- Despliegue en edge o en entornos con GPU limitada: con el modelo base en cuantizacion de 4 bits el conjunto cabe en cualquier GPU consumer e incluso puede ejecutarse en CPU, lo que habilita filtrado local sin enviar datos a terceros.
- Filtro previo en pipelines de agentes: interceptar tool calls y peticiones a herramientas externas para evitar que una instruccion inyectada provoque acciones no autorizadas.

## Benchmarks y rendimiento

El unico dato de evaluacion disponible es el de la particion de test de limpieza del propio autor, con 180 prompts y etiquetado mediante Claude Haiku 4.5:

| Metrica | Valor |
|---|---|
| Particion de evaluacion | Cleaning test split, 180 prompts |
| Accuracy de aceptar/rechazar | 0,900 |
| F1 de rechazo | 0,899 |
| Similitud semantica media | 0,719 |
| Etiquetado de referencia | Claude Haiku 4.5 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se detallan metricas de la etapa 1 (clasificador) en la model card de este adaptador.

## Requisitos de hardware

- Adaptador: 0,1 GB en disco, requisito de VRAM despreciable (matrices LoRA de bajo rango).
- Modelo base Llama-3.2-1B-Instruct en fp16: aproximadamente 2,5 GB de pesos; con overhead de activaciones y cache KV, del orden de 3-4 GB de VRAM para contextos moderados.
- Modelo base en int8: aproximadamente 1,4 GB de VRAM.
- Modelo base en cuantizacion de 4 bits (GGUF/AWQ): aproximadamente 0,8-1 GB, ejecutable en CPU con llama.cpp u Ollama.
- GPU consumer: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y en graficas con 4 GB o mas de VRAM; tambien en portatiles con GPU integrada de gama alta o en Apple Silicon.
- GPU de datacenter: A100, H100 o L40S estan sobredimensionadas para un modelo de 1B; se usarian solo por agregacion de muchas instancias concurrentes.
- Opciones de despliegue: transformers + peft (via obligatoria para la cadena de dos adaptadores), vLLM con soporte LoRA, TGI, llama.cpp y Ollama para la variante base cuantizada; la cadena de dos adaptadores puede complicar el soporte en algunos servidores de inferencia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mochi-Llama-1B-Cleaning + Classifier | Adaptadores sobre 1,23B | Limitado por el base (128k) | Clasificacion + limpieza en dos etapas | Llama 3.2 Community | HuggingFace, 0 descargas |
| Llama-3.2-1B-Instruct sin adaptadores | 1,23B | 128k | Modelo instructivo general, sin defensa especifica | Llama 3.2 Community | Muy extendida |
| Llama Prompt Guard 2 (22M / 86M) | 22M / 86M | No aplicable (clasificador) | Deteccion de prompt injection y jailbreak | Llama 3.2 Community | Ampliamente usada en produccion |
| Llama Guard 3 1B | 1B | 128k | Clasificacion de seguridad de entrada y salida | Llama 3.2 Community | Extendida |
| ShieldGemma 2B | 2B | 8k | Clasificacion de contenido danino | Gemma Terms | Extendida |

La diferencia funcional principal frente a Prompt Guard 2 o Llama Guard 3 es que Mochi no solo clasifica: intenta conservar y responder a la parte legitima del prompt. Como contrapartida, carece de la adopcion, la documentacion y las evaluaciones publicas de esas alternativas.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base Llama-3.2-1B-Instruct y el adaptador Mochi-Llama-1B-Classifier cargados en cadena; usarlo solo seria un error de despliegue.
- El orden de carga importa: invertir las etapas o saltarse la etapa 1 invalida el comportamiento entrenado.
- Evaluacion muy limitada: 180 prompts en un unico split, sin benchmark publico independiente ni comparacion directa con Prompt Guard 2, Llama Guard 3 o ShieldGemma.
- Las etiquetas de referencia del test fueron generadas por Claude Haiku 4.5, lo que introduce el sesgo y los errores del propio modelo anotador en la metrica reportada.
- Similitud semantica media de 0,719: la limpieza altera parcialmente la respuesta legitima, por lo que hay una perdida de fidelidad medible respecto a la peticion original.
- Idiomas soportados no declarados para el adaptador: el entrenamiento con SulKhu/Mochi probablemente se centro en ingles, y la defensa puede degradarse en castellano u otras lenguas.
- Riesgo de falsos positivos: un clasificador con F1 de rechazo de 0,899 sobre 180 ejemplos puede rechazar peticiones legitimas en dominios no representados en el dataset.
- Riesgo de alucinacion heredado del modelo base de 1B parametros, especialmente en tareas de razonamiento o conocimiento factual; el adaptador no lo corrige.
- Publicacion sin traccion: 0 descargas, 0 likes, creada y actualizada en septiembre de 2026, sin revision por pares ni mantenimiento demostrado.
- Licencia Llama 3.2 Community License: permite uso comercial con condiciones (atribucion "Built with Llama", obligaciones de nomenclatura en algunos casos, limites de uso aceptable y clausula de escala para mas de 700 millones de usuarios mensuales). Conviene revisar el texto completo antes de integrarlo en un producto.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo, el proyecto Mochi ni sus evaluaciones; los unicos enlaces utiles son los proporcionados por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rushilarun/Mochi-Llama-1B-Cleaning
- Adaptador de la etapa 1 (clasificador): https://huggingface.co/rushilarun/Mochi-Llama-1B-Classifier
- Repositorio del proyecto Mochi: https://github.com/rushil-arun/mochi
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/SulKhu/Mochi
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Paper, blog o demo adicionales: no disponible (la busqueda web no devolvio resultados relevantes)
