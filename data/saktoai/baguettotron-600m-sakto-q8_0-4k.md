# SaktoAI/baguettotron-600m-sakto-Q8_0-4k

## Resumen

Baguettotron 600M (build de Sakto) es una cuantización GGUF en Q8_0 del modelo base PleIAs/baguettotron-600m, empaquetada por Sakto AI Lab con el objetivo explícito de ejecutarse íntegramente en teléfonos móviles sin conexión de red. El modelo cuenta con 608.273.408 parámetros reales (aproximadamente 600 millones) y se distribuye en un repositorio de 0,6 GB, lo que lo sitúa en la categoría de modelos pequeños orientados a inferencia en dispositivo (on-device).

La aportación principal de esta build no es el modelo en sí, sino la extensión del contexto hasta 4096 tokens mediante el ajuste de la configuración RoPE y la recuantización posterior desde los pesos base, junto con el empaquetado en formato GGUF compatible con llama.cpp y llama.rn. Esto permite que un modelo de tamaño telefónico mantenga en memoria de trabajo una conversación completa, un par de páginas de texto fuente o un extracto de documento.

Es relevante ahora porque ejemplifica la tendencia de llevar asistentes de texto a hardware de consumo sin dependencia de la nube, con licencia Apache 2.0 y un formato de pesos estándar en el ecosistema de inferencia local. El propio autor lo etiqueta como build de prueba, con aristas por pulir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, no confirmado en la informacion) |
| Parametros totales | 608.273.408 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 4096 tokens (extendida mediante ajuste de RoPE) |
| Tipos de cuantizacion | Q8_0 (8 bits, casi sin perdida) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp / llama.rn) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base PleIAs/baguettotron-600m: no se especifica si es un transformer denso convencional, ni el numero de capas, dimensiones ocultas o cabezas de atencion. Tampoco se documentan los datos de entrenamiento (numero de tokens, composicion del corpus, fases de RLHF o DPO). Lo unico confirmado es que el modelo base se entreno con una longitud de contexto inferior a 4096 tokens, y que esta build extiende dicho contexto ajustando la configuracion RoPE y recuantizando desde los pesos originales.

La innovacion tecnica destacable de esta build es precisamente ese procedimiento de extension de contexto combinado con la cuantizacion Q8_0, que preserva casi toda la precision de los pesos originales (8 bits) a costa de un tamano de 0,6 GB. El resultado se empaqueta en GGUF para su uso directo con llama.cpp y llama.rn, lo que habilita inferencia local en movil. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto conversacional: el modelo se etiqueta como `conversational` y esta orientado a tareas de escritura, preguntas, resumenes y redaccion.
- Conversacion multi-turno en dispositivo: con 4096 tokens de contexto puede mantener un dialogo completo en memoria.
- Procesamiento de documentos cortos: admite un par de paginas de texto fuente o un extracto de documento dentro de la ventana.
- Inferencia totalmente offline: disenado para ejecutarse en telefono sin red.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con interfaces de tipo API.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Capacidades de agente o razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Modo thinking, vision o audio: no disponible en la informacion (pipeline `text-generation` unicamente).

## Casos de uso

- Asistente de escritura offline en movil: el modelo puede redactar borradores, correos y notas directamente en el telefono sin conexion, aprovechando su tamano de 0,6 GB y su contexto de 4096 tokens para mantener el hilo de un texto de varias paginas.
- Resumen de documentos cortos en dispositivo: con 4096 tokens de ventana puede ingerir un extracto de articulo o un par de paginas y generar un resumen, sin enviar datos a la nube, lo que resulta adecuado para contenido sensible.
- Chatbot de preguntas y respuestas personales: integrado mediante llama.rn en una app movil, puede gestionar conversaciones multi-turno con memoria de contexto, util para asistentes personales sin dependencia de servidor.
- Prototipado rapido de aplicaciones LLM en movil: al ser un GGUF Q8_0 compatible con llama.cpp, sirve como banco de pruebas para desarrolladores que quieran validar flujos de inferencia local antes de escalar a modelos mayores.
- Redaccion asistida en entornos sin conectividad: en escenarios de campo, viajes o zonas sin cobertura, el modelo permite generar y editar texto localmente.
- Educacion y demos de IA en dispositivo: su tamano reducido y licencia Apache 2.0 lo hacen apto para talleres, demos y ensenanza de inferencia local en hardware de consumo.
- Filtrado o preprocesado de texto en el borde: puede clasificar, reformatear o limpiar texto corto antes de enviarlo a un sistema mayor, reduciendo el trafico de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 0,6 GB en Q8_0; el autor indica que a 4096 tokens de contexto el modelo es comodo en telefonos con 4 GB de RAM o mas, y que por debajo de esa cifra puede presionar el sistema.
- GPU recomendadas: no disponible en la informacion. El enfoque del autor es CPU/movil mediante llama.cpp y llama.rn.
- Compatibilidad con GPU de consumo: no se documenta; el caso de uso declarado es inferencia en telefono, no en GPU de escritorio.
- Opciones de despliegue: llama.cpp y llama.rn (confirmados por el autor). Otros motores como vLLM, TGI u Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. El autor advierte que el procesamiento de prompts largos escala con la longitud del contexto y que los prompts largos tardan notablemente mas en cargarse que los cortos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, el modelo se posiciona en la categoria de modelos de ~600M de parametros cuantizados a 8 bits para inferencia local en movil.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Baguettotron 600M (Sakto Q8_0) | 608.273.408 | 4096 | GGUF Q8_0 | Apache 2.0 | Build de prueba para movil |
| PleIAs/baguettotron-600m (base) | ~600M | inferior a 4096 | no disponible | no disponible | Modelo original sin extension de contexto |
| Alternativas de ~600M on-device | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion |

## Limitaciones y advertencias

- Build de prueba: el propio autor advierte que es un test build y que deben esperarse aristas sin pulir.
- Contexto efectivo menor que el nominal: 4096 tokens es el techo, no una garantia de calidad; el modelo base se entreno con una longitud menor, por lo que la recuperacion de informacion y la coherencia se degradan a medida que el prompt se llena. La memoria de largo contexto es lo primero que falla.
- Consumo de RAM: la cache key-value crece con el contexto; en telefonos con menos de 4 GB de RAM puede presionar el sistema.
- Velocidad: el procesamiento de prompts largos es notablemente mas lento que el de prompts cortos.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingue adecuado.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: inherente a modelos de este tamano; no cuantificado en la informacion.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero la falta de datos sobre el modelo base y su procedencia de entrenamiento debe evaluarse antes de un despliegue en produccion.
- Ausencia de benchmarks: no hay evidencia publicada de rendimiento que respalde afirmaciones de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SaktoAI/baguettotron-600m-sakto-Q8_0-4k
- Modelo base: https://huggingface.co/PleIAs/baguettotron-600m
- Sakto AI Lab: https://sakto.ai
