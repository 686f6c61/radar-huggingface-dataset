# Rumiii/Qwen3-8B-Maxima_A1

## Resumen

Qwen3-8B-Maxima_A1 es un ajuste fino supervisado del modelo Qwen3-8B de Alibaba, publicado por el usuario Rumiii. El objetivo concreto es mejorar el comportamiento de llamada a herramientas (tool calling / function calling) y de razonamiento agentico, incluyendo la capacidad de rechazar una llamada cuando las herramientas disponibles no encajan con la peticion del usuario. El entrenamiento se hizo con QLoRA de 4 bits sobre una muestra estratificada de 1.000 ejemplos del subconjunto SFT del dataset Agent-Ark/Toucan-1.5M, y los pesos resultantes se fusionaron y publicaron en 16 bits.

Arquitecturalmente no introduce cambios: es un transformer decoder-only denso de 8.190.735.360 parametros (~8,19 B) heredado tal cual de Qwen3-8B, con pesos en safetensors y licencia Apache 2.0. El valor del modelo no esta en una mejora de capacidad demostrada, sino en la validacion de una receta de entrenamiento concreta: el propio autor indica que no se ha comparado contra el modelo base en BFCL V3 ni MCP-Universe, por lo que cualquier afirmacion de mejora es, en sus palabras, no verificada.

Es relevante ahora porque ejemplifica un patron muy comun en el ecosistema: ajustes finos pequenos y economicos (una sola Tesla T4, menos de dos horas) orientados a una competencia especifica como es el uso de herramientas en agentes. Para un desarrollador que evalua modelos, la ficha sirve como caso de estudio de que se puede y que no se puede concluir de una ejecucion de 125 pasos sobre 1.000 muestras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-8B; no se detalla configuracion de capas, atencion ni normalizacion en la informacion proporcionada) |
| Parametros totales | 8.190.735.360 (~8,19 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada. El modelo base Qwen3-8B declara contexto nativo de 32.768 tokens ampliable con YaRN, pero la model card de este ajuste no lo confirma |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en 16 bits; el autor no publica versiones GGUF, AWQ, GPTQ ni EXL2 |
| Idiomas soportados | No disponible (el autor no declara lista de idiomas; los datos de ajuste estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16 bits, fusionado tras QLoRA) |
| Tamano del repositorio | 16,4 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-8B |
| Dataset de ajuste | Agent-Ark/Toucan-1.5M (config SFT, 1.000 muestras) |
| Metodo de ajuste | QLoRA 4 bits, rank 16, alpha 16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay innovacion arquitectonica: el modelo es Qwen3-8B con los pesos ajustados y fusionados. El interes tecnico esta integramente en el procedimiento de entrenamiento. Se aplico QLoRA en 4 bits con rank 16 y alpha 16 sobre todas las proyecciones de atencion y MLP, una sola epoca, 125 pasos, batch efectivo de 8 y learning rate 2e-4 con scheduler coseno. La perdida se calculo unicamente sobre los turnos del asistente, enmascarando las salidas de las herramientas para no entrenar al modelo a imitar resultados de herramientas. El entrenamiento completo se ejecuto en una sola Tesla T4 en fp16 en aproximadamente 1 hora y 47 minutos, partiendo de una perdida de 2,17 y terminando en 1,18.

Los datos son una muestra estratificada de 1.000 filas del config SFT de Toucan-1.5M, repartida en cuatro etapas: 400 filas de multi-turno (interacciones extendidas con uso denso de herramientas), 250 de single-turn original, 200 de la categoria "irrelevant" disenada explicitamente para que el modelo no emita ninguna llamada cuando las herramientas no encajan, y 150 de single-turn diversificado con variantes reescritas de la tarea. La mediana es de 2 llamadas a herramienta por fila (maximo 19) y 1.875 tokens por ejemplo. Los ejemplos que superaban los 4.096 tokens se descartaron en lugar de truncarse, para no ensenar al modelo a cortar trayectorias a mitad. No se aplico RLHF ni DPO. La verificacion publicada es una prueba de dos lados sobre ejemplos reservados: con herramientas de PubChem y una consulta sobre la cafeina, el modelo emitio un `<tool_call>` valido con nombre y argumentos correctos; con solo herramientas de Figma ante una consulta de citacion academica, no emitio llamada, identifico el desajuste y redirigio a recursos apropiados.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen3-8B.
- Tool calling y function calling: emite llamadas en formato `<tool_call>` con nombre de herramienta y argumentos estructurados, siguiendo la plantilla de chat de Qwen3.
- Rechazo selectivo de llamadas: capacidad entrenada explicitamente para no invocar herramientas cuando ninguna encaja con la peticion.
- Uso de multiples herramientas en una misma trayectoria: la mediana del dataset es de 2 llamadas por ejemplo y el maximo observado es de 19.
- Razonamiento agentico de varios pasos en conversaciones extendidas, gracias a las 400 filas de la etapa multi-turn.
- Capacidades generales de Qwen3-8B (razonamiento, codigo, matematicas, modo thinking) teoricamente preservadas por el ajuste, pero no verificadas por el autor.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas ni se aportan datos de evaluacion fuera del ingles.

## Casos de uso

- Agentes de atencion al cliente con catalogo de herramientas cerrado: el modelo puede decidir entre consultar un pedido, abrir una incidencia o no llamar a ninguna herramienta si la peticion es una queja general, gracias al entrenamiento explicito de la categoria "irrelevant".
- Enrutado de peticiones en pipelines internos: dado un conjunto de funciones disponibles (APIs internas, consultas a bases de datos), el modelo selecciona la adecuada y genera los argumentos en formato estructurado, lo que permite encadenar la salida con un ejecutor de funciones.
- Automatizacion de tareas de investigacion con APIs cientificas: el ejemplo verificado por el autor usa herramientas tipo PubChem para recuperar propiedades de compuestos, un patron replicable en quimica, biologia o datos regulatorios.
- Copilotos de escritorio integrados en herramientas de diseno: el modelo puede reconocer que una consulta de citacion academica no se resuelve con herramientas de Figma y responder sin invocar nada, evitando llamadas erroneas que rompen la experiencia.
- Prototipado rapido de flujos agenticos en investigacion: al ser un ajuste ligero y reproducible en una sola GPU de 16 GB, sirve como banco de pruebas para comparar recetas de datos y de enmascarado de perdida antes de escalar a modelos mayores.
- Evaluacion interna de robustez en tool calling: util para montar pruebas de dos lados (debe llamar / no debe llamar) dentro de un pipeline de CI y detectar regresiones al cambiar la plantilla de chat o los esquemas de herramientas.
- Asistentes conversacionales multi-turno con contexto moderado: para dialogos de soporte tecnico con historial de varias interacciones, siempre que la longitud se mantenga dentro de la ventana real del modelo base (ver limitaciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor lo declara de forma explicita: el modelo no se ha evaluado contra Qwen3-8B base en BFCL V3 ni en MCP-Universe, y senala que la ejecucion valida la receta de entrenamiento, no una ganancia de capacidad sobre el modelo base. La unica evidencia cualitativa aportada son los dos sondeos descritos en la seccion de arquitectura y entrenamiento. No se dispone de datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada en 16 bits: los pesos ocupan aproximadamente 16,4 GB, por lo que la inferencia requiere del orden de 18-20 GB de VRAM contando cache KV para contextos moderados.
- GPU recomendadas en 16 bits: A100 40 GB, L40S 48 GB, H100, o dos GPU de 24 GB con reparto de capas. En una RTX 4090 de 24 GB cabe con margen ajustado y contexto limitado.
- Cuantizacion a 8 bits: aproximadamente 9-10 GB de pesos, viable en RTX 4080, 4070 Ti Super, 3090 y similares.
- Cuantizacion a 4 bits: aproximadamente 5-6 GB de pesos, por lo que cabria en GPU de consumo con 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). Esta opcion exigiria generar las cuantizaciones por cuenta propia, ya que el autor no las publica.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB sin cuantizar o en tarjetas de 8-16 GB tras cuantizar.
- Opciones de despliegue: transformers (metodo documentado por el autor), text-generation-inference (etiqueta del repositorio) y, previa conversion a GGUF, llama.cpp u Ollama. No hay artefactos GGUF publicados.
- Latencia y throughput: no disponibles.
- Nota de muestreo: el autor recomienda temperature 0.6, top_p 0.95 y top_k 20, y desaconseja la decodificacion greedy siguiendo las indicaciones de Qwen3, porque puede provocar bucles de repeticion.

## Comparativa con modelos similares

Comparativa orientativa por categoria y tamano. La columna de rendimiento no puede completarse para este ajuste porque no se han publicado evaluaciones.

| Modelo | Parametros | Contexto | Evaluacion publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-Maxima_A1 (este modelo) | 8,19 B | No disponible | No | Apache 2.0 | Pesos safetensors 16 bits en HuggingFace, 0 descargas |
| Qwen/Qwen3-8B (base) | ~8 B | 32.768 tokens nativos, ampliable con YaRN (segun documentacion del modelo base) | Si, en la documentacion del modelo base (no reproducida aqui) | Apache 2.0 | Amplia, con cuantizaciones de terceros |
| Qwen2.5-7B-Instruct | ~7,6 B | 32.768 tokens nativos, ampliable | Si, en la documentacion del modelo base | Apache 2.0 | Amplia, con ecosistema de cuantizaciones |
| Llama-3.1-8B-Instruct | ~8 B | 128.000 tokens | Si, en la documentacion del modelo base | Licencia comunitaria de Meta, con condiciones de uso | Amplia |

La comparacion relevante para este ajuste es contra su propio modelo base, y esa comparacion no existe en la informacion proporcionada. Los datos de las filas correspondientes a otros modelos provienen de su documentacion oficial y no de una evaluacion homogenea realizada por el autor de este ajuste.

## Limitaciones y advertencias

- Escala de entrenamiento muy reducida: 1.000 muestras frente a las 119.000 filas del config SFT y 1,5 millones del dataset completo. Es plausible que los efectos sobre las capacidades generales sean minimos y que el ajuste se comporte de forma muy parecida al modelo base.
- Ausencia total de evaluacion: no hay resultados de BFCL V3, MCP-Universe ni de ningun otro benchmark. No se puede afirmar que sea mejor que Qwen3-8B en tool calling.
- Riesgo de degradacion de capacidades generales: 125 pasos sobre un dataset puramente de herramientas pueden estrechar el comportamiento conversacional fuera del dominio de las funciones, aunque no hay mediciones que lo confirmen o lo desmientan.
- Idiomas no declarados: no hay garantia de comportamiento correcto fuera del ingles, ni en el formato de llamada a herramientas ni en el rechazo de llamadas.
- Riesgo de alucinacion en argumentos: un modelo de 8 B puede generar nombres de herramientas o parametros inexistentes. Cualquier despliegue en produccion deberia validar esquema, tipos y valores permitidos antes de ejecutar la llamada.
- Inconsistencia documental: el codigo de ejemplo de la model card usa el identificador "Rumiii/qwen3-8b-toucan", distinto del identificador real del repositorio (Rumiii/Qwen3-8B-Maxima_A1). Hay que corregirlo antes de reutilizar el snippet.
- Sin versiones cuantizadas publicadas: desplegar en hardware de consumo exige convertir los pesos uno mismo, con el coste y el riesgo de error asociados.
- Contexto no confirmado: el ajuste se entreno descartando ejemplos de mas de 4.096 tokens, por lo que no hay evidencia de que rinda bien en trayectorias largas aunque el modelo base soporte ventanas mayores.
- Fecha de creacion del repositorio posterior a la actual: la ficha de HuggingFace indica 2026-09-17, dato anómalo que conviene verificar antes de citarlo.
- Adopcion nula: 0 descargas y 0 likes, sin issues ni discusion publica que permitan contrastar el comportamiento real.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el autor no ofrece ninguna garantia de idoneidad; al derivar de Qwen3-8B, se mantiene la atribucion correspondiente.
- Bucles de repeticion con decodificacion greedy: advertencia heredada de las indicaciones de Qwen3 que el propio autor reproduce.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rumiii/Qwen3-8B-Maxima_A1
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de ajuste Agent-Ark/Toucan-1.5M: https://huggingface.co/datasets/Agent-Ark/Toucan-1.5M

Nota: la busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo. Los resultados obtenidos eran foros y comunidades genericas sin relacion con Qwen3-8B-Maxima_A1, por lo que no se incluyen. No se dispone de paper, blog tecnico, repositorio de codigo ni demo asociados al ajuste.
