# Boollm/Boollm-Browser-Vision-500M

## Resumen

Boollm Browser Vision 500M es un ajuste fino experimental de visión desarrollado por Boollm sobre el modelo HuggingFaceTB/SmolVLM2-500M-Video-Instruct. Está especializado en responder preguntas breves sobre imágenes sintéticas de tarjetas de navegador: etiquetas de botones, colores aproximados, precios mostrados y recuentos. El objetivo declarado no es el control autónomo del navegador ni la lectura general de documentos, sino un dominio muy acotado que el propio autor describe como una prueba inicial y limitada.

El modelo tiene 409.252.800 parámetros totales según los pesos en safetensors y un repositorio de 0,5 GB. El entrenamiento consistió en un adaptador LoRA de solo 819.200 parámetros entrenables (rank 8, alpha 16, dropout 0,05) aplicado a 64 módulos de proyección query/value del modelo de lenguaje, con el codificador visual y el conector congelados. Se distribuye en safetensors y en GGUF Q8_0, con licencia Apache-2.0 y soporte únicamente de inglés.

Su relevancia es acotada pero ilustrativa: demuestra que se puede adaptar un modelo de visión-lenguaje de menos de 500 millones de parámetros a una tarea visual concreta entrenando en CPU con 120 imágenes sintéticas y LoRA, y desplegarlo después con llama.cpp. En contrapartida, el propio autor documenta fallos en conversaciones de varios turnos y advierte de que los resultados no deben extrapolarse a sitios web reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada por el autor; derivada del modelo base SmolVLM2-500M-Video-Instruct (codificador visual y conector congelados más un modelo de lenguaje transformer) |
| Parametros totales | 409.252.800 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Parametros entrenables (LoRA) | 819.200 (rank 8, alpha 16, dropout 0,05, sobre 64 modulos query/value) |
| Longitud de contexto | No disponible; la configuracion de ejemplo de llama.cpp usa `--ctx-size 4096` |
| Tipos de cuantizacion | Q8_0 en GGUF (unico formato cuantizado documentado) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF; el paquete GGUF incluye un fichero `mmproj` separado para la torre visual |
| Tarea (pipeline) | image-text-to-text |
| Modelo base | HuggingFaceTB/SmolVLM2-500M-Video-Instruct, revision `7b375e1b73b11138ff12fe22c8f2822d8fe03467` |
| Tamano del repositorio | 0,5 GB |
| Tamano de descarga GGUF | 545.587.808 bytes (545,6 MB) entre los dos ficheros Q8_0 |
| Entradas | Imagen unica de 512 px, con `image splitting` desactivado |

## Arquitectura y entrenamiento

La arquitectura procede íntegramente del modelo base SmolVLM2-500M-Video-Instruct, que combina un codificador visual, un conector y un modelo de lenguaje de tipo transformer. En este ajuste fino, tanto el codificador visual como el conector permanecieron congelados: solo se entrenaron 64 módulos de proyección query/value del modelo de lenguaje mediante LoRA, lo que supone 819.200 parámetros actualizables de un total de 409.252.800.

El entrenamiento se realizó en CPU en float32 con 6 hilos, tasa de aprendizaje 0,0001, tamaño de lote 1 y dos épocas sobre 120 imágenes sintéticas originales. La selección de checkpoint se hizo con un conjunto de validación separado de 20 imágenes, eligiendo la época 2, y se reservaron otras 20 imágenes para la evaluación reportada. No se usaron chats privados, páginas de cuentas reales, capturas personales, sitios web raspados ni conjuntos de datos externos de pago. El repositorio incluye los datos de entrenamiento, el generador, la receta, el adaptador y los registros. No se documenta ningún mecanismo de RLHF o DPO, ni innovaciones de decodificación especulativa o atención lineal.

## Capacidades

- Respuesta a preguntas breves sobre imágenes sintéticas de tarjetas de navegador: etiquetas de botones, colores aproximados, precios mostrados y recuentos.
- Generación de respuestas cortas con un formato de salida concreto, entrenado para coincidir de forma exacta con la respuesta esperada en el conjunto reservado.
- Procesamiento de una única imagen de 512 píxeles, con el particionado de imagen desactivado en la receta de entrenamiento.
- Conversación de un solo turno fiable según los datos del autor; el soporte multiturno no está cualificado.
- Integración con llama.cpp mediante `llama-server` y con la aplicación Boollm v0.9.214.
- Idiomas: únicamente inglés.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, audio ni vídeo de forma cualificada. Las funciones de búsqueda en vivo, cotizaciones, clima, vuelos, compras, control del navegador y recorte dependen de herramientas de Boollm y no están contenidas en los pesos.

## Casos de uso

- Extracción de etiquetas de botones en capturas de interfaz controladas: el modelo puede devolver el texto de un botón visible en una tarjeta sintética, útil como paso de preprocesado en un pipeline de pruebas de interfaz, siempre con verificación humana.
- Verificación de precios en capturas generadas: dado que fue ajustado para leer precios mostrados y devolverlos con formato exacto, sirve para comprobar que un componente renderiza el valor esperado en un conjunto de pruebas cerrado.
- Recuento de elementos de interfaz: con imágenes simples puede contar badges, contadores o filas visibles, como primera aproximación en tareas de validación de renderizado.
- Clasificación aproximada de colores de componentes: puede asignar etiquetas de color gruesas (por ejemplo, "rojo" o "azul") a elementos de una tarjeta, sin sustituir a una medición real de HEX o RGB.
- Prototipado de asistentes locales de accesibilidad: al ejecutarse en CPU con un consumo de memoria moderado, permite experimentar con descripciones breves de controles de interfaz en equipos sin GPU.
- Validación de regresión visual en CI: integrado mediante `llama-server`, puede actuar como filtro de primera pasada que señale discrepancias evidentes de etiquetas o precios entre capturas de referencia y capturas nuevas, dejando la decisión final a una comprobación determinista.
- Base para ajustes de dominio propios: el adaptador LoRA, la receta y el generador se incluyen en el repositorio, de modo que un equipo puede reproducir el proceso con sus propias imágenes sintéticas y su propio vocabulario de respuestas.
- Despliegue offline en hardware modesto: el paquete Q8_0 completo ocupa 545,6 MB y el autor lo ejecutó en un PC de CPU con 6 hilos, lo que habilita escenarios sin conectividad ni acelerador dedicado.

## Benchmarks y rendimiento

Resultados medidos con 20 imágenes sintéticas reservadas, antes de la cuantización a GGUF:

| Metrica | Modelo original (base) | Fine-tune (Transformers) |
|---|---:|---:|
| Coincidencia exacta de respuesta/formato | 10/20 | 20/20 |
| Valor esperado presente (comprobacion lexica) | 18/20 | 20/20 |
| Perdida de respuesta en validacion | 0,8382 | 0,0028 |

Resultados con el GGUF Q8_0 servido por llama.cpp (mismos 20 ejemplos reservados):

| Metrica | Resultado |
|---|---:|
| Coincidencia exacta de respuesta/formato | 14/20 |

Notas del autor sobre el GGUF: dos fallos añadieron decimales a precios correctos y cuatro devolvieron solo el color o la etiqueta en lugar de la descripción combinada solicitada. El autor indica que no ha aislado la causa de la diferencia entre el checkpoint en Transformers y el resultado en runtime, y que no reclama mejora alguna frente a un GGUF sin entrenar porque esa línea base en el mismo runtime no se midió. La coincidencia exacta penaliza respuestas correctas con palabras adicionales y ninguna de las dos métricas establece precisión general de OCR.

## Requisitos de hardware

- Inferencia en CPU documentada: 6 hilos, float32 en entrenamiento; una pregunta sobre una imagen adjunta se respondió en 9,1 segundos en el PC del autor. Una pregunta de seguimiento fallida tardó unos 12 segundos.
- Memoria observada: el motor propietario alcanzó un pico de aproximadamente 1,54 GB de working set durante las peticiones con imagen, excluyendo la aplicación, el sistema operativo y otros procesos.
- Tamano de descarga: 545.587.808 bytes (545,6 MB) sumando los dos ficheros Q8_0, el modelo de lenguaje y el proyector. El autor subraya que ese dato es el tamano de descarga y que el consumo de RAM depende del contexto, las imágenes y el runtime.
- VRAM para GPU: no disponible. No se documentan pruebas en GPU.
- GPU recomendadas: no disponible. No se han publicado pruebas con A100, H100, RTX 4090 ni otras GPU.
- GPU de consumo: no verificado por el autor. Por tamano del modelo (menos de 0,5 GB en Q8_0) es plausible que quepa en GPUs de consumo, pero se trata de una estimación no confirmada y el autor no ofrece ninguna garantía de funcionamiento por debajo de 8 GB.
- Opciones de despliegue: llama.cpp mediante `llama-server`, con soporte de SmolVLM2 en una compilación reciente:
  `llama-server -m Boollm-Browser-Vision-500M-FT.Q8_0.gguf --mmproj mmproj-Boollm-Browser-Vision-500M-FT.Q8_0.gguf --ctx-size 4096 --host 127.0.0.1 --port 8080`
  El repositorio incluye la etiqueta `endpoints_compatible`. No se documenta compatibilidad con vLLM, Ollama, TGI ni otros servidores.
- Latencia y throughput: solo se reportan los dos valores puntuales citados (9,1 s y ~12 s por respuesta en CPU). No hay medidas de throughput agregado ni de concurrencia.

## Comparativa con modelos similares

Comparación directa con el modelo base, que es el único comparable del que la información proporcionada ofrece datos:

| Modelo | Parametros | Contexto | Resultados en el conjunto reservado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Boollm Browser Vision 500M | 409.252.800 (819.200 entrenables) | No disponible; ejemplo con 4096 tokens | 20/20 coincidencia exacta (Transformers), 14/20 en GGUF Q8_0 | Apache-2.0 | HuggingFace, safetensors y GGUF Q8_0 |
| HuggingFaceTB/SmolVLM2-500M-Video-Instruct | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | 10/20 coincidencia exacta en el mismo conjunto | Apache-2.0 (modelo base) | HuggingFace |
| Otras alternativas de vision-lenguaje de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han proporcionado datos de benchmarks ni de especificaciones de otros modelos comparables (por ejemplo, otros VLM por debajo de 1.000 millones de parámetros), por lo que no es posible establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Ámbito estrecho: es un ajuste fino inicial y limitado, no un modelo de control del navegador entrenado de forma amplia. El autor lo califica explícitamente de experimental.
- Alucinación visual: la visión puede leer mal texto, precios, recuentos y colores. El autor recomienda inspeccionar las imágenes originales antes de confiar en las respuestas.
- Multiturno no fiable: tras responder correctamente "Open", una pregunta de seguimiento sobre el color de la misma imagen devolvió la respuesta no relacionada "The answer is: 12" en unos 12 segundos. El autor indica que esto es una correlación con la memoria guardada, no una causa raíz probada, y que la versión no está cualificada para preguntas de imagen multiturno ni para prompts de agente con uso intensivo de memoria.
- Degradación en GGUF: el resultado en runtime con Q8_0 (14/20) es inferior al del checkpoint en Transformers (20/20) y la causa no se ha aislado. No se midió la línea base de un GGUF sin entrenar, por lo que no se reclama mejora frente a ella.
- Sesgo de validación: los resultados proceden de 20 imágenes sintéticas reservadas; no establecen precisión general de OCR y no deben extrapolarse a sitios web o documentos desconocidos.
- Dependencia de herramientas externas: búsqueda en vivo, cotizaciones, clima, vuelos, compras, control del navegador y recorte requieren herramientas de Boollm. Los pesos no contienen datos actuales ni garantizan un uso correcto de herramientas.
- Medición de color: para valores HEX o RGB exactos debe usarse una herramienta de píxeles, no la estimación del modelo.
- Cobertura modal incompleta: la publicación está centrada en imagen; el vídeo y la navegación autónoma no fueron cualificados.
- Idiomas: solo inglés, lo que excluye su uso directo en castellano sin un ajuste adicional.
- Licencia: Apache-2.0 permite uso comercial, pero el propio modelo se declara experimental y no cualificado para preguntas multiturno fiables, por lo que su uso en producción exige validación propia y controles deterministas.
- Origen de los datos: los ejemplos sintéticos de entrenamiento son ilustraciones y no capturas que demuestren el comportamiento real de Boollm.
- Repositorio sin tracción: 0 descargas y 0 me gusta en el momento de la consulta, sin evidencia de validación por parte de terceros.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Boollm/Boollm-Browser-Vision-500M
- Modelo base SmolVLM2-500M-Video-Instruct: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Repositorio de conversion a GGUF: https://github.com/ggml-org/llama.cpp
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los resultados obtenidos correspondian a contenidos no relacionados con la ficha.
