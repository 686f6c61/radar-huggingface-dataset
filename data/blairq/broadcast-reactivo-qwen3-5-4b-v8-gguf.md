# BlairQ/broadcast-reactivo-qwen3.5-4b-v8-GGUF

## Resumen

`broadcast-reactivo-qwen3.5-4b-v8-GGUF` es un ajuste fino en formato GGUF de `Qwen/Qwen3.5-4B`, publicado por BlairQ, orientado a un aparato de producción de televisión en directo. El modelo convierte órdenes del operador, por ejemplo «bajale 4 a la música», en la llamada completa de herramienta —nombre y argumentos— usando el formato nativo de tool calling de Qwen3.5. No se limita a elegir la función: genera también los parámetros copiando nombres del estado del aparato.

El problema que resuelve es concreto: pasar de una frase operativa a una acción estructurada sobre 108 herramientas de realización, audio, fuentes, participantes, gráficos y carruseles. Si la petición no corresponde a sus herramientas, deriva al asistente grande; si falta un dato obligatorio, pregunta; si es charla, responde en texto. Incluye la torre de visión de Qwen3.5 en un `mmproj` separado, por lo que puede describir capturas, fuentes y multiview.

Técnicamente es un modelo multimodal de 4.326.350.848 parámetros, cuantizado en Q4_K_M, con una cabeza MTP entrenada para decodificación especulativa. El ejemplo de despliegue usa una ventana de 16.384 tokens y un prompt fijo de unas 8.200 tokens que conviene cachear. Su relevancia está en el enfoque: un modelo pequeño, local y especializado en una tarea de tool calling muy restringida, en lugar de un asistente general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.5, con torre de visión separada; identificado como `qwen35` en llama.cpp. Detalle interno no disponible |
| Parámetros totales | 4.326.350.848 (dato de safetensors del modelo base) |
| Parámetros activos | No disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | 16.384 tokens en el ejemplo de `llama-server`; máximo nativo no disponible |
| Tipos de cuantización | Q4_K_M para el modelo; F16 para el `mmproj` de visión; cabeza MTP incluida en el GGUF. Se menciona una variante MLX q4 en los benchmarks |
| Idiomas soportados | Español, variante rioplatense según el autor; no se documentan otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M) + `mmproj-F16.gguf`; el modelo base está en safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B`, un modelo multimodal de la familia Qwen3.5. El ajuste se aplica únicamente a la parte de texto: la torre de visión se conserva congelada y se distribuye aparte en `mmproj-F16.gguf`, tal como la usa llama.cpp. La arquitectura se registra como `qwen35` y el modelo se sirve con llama.cpp b11255 o posterior. No se documentan número de capas, mecanismo de atención ni detalles del tokenizador.

El entrenamiento está orientado a un contrato de prompt muy cerrado. La entrada tiene una cabeza fija de unas 8.200 tokens con el system nativo de tools de Qwen3.5, 108 herramientas y dos pseudo-funciones: `derivar`, para peticiones ajenas, y `falta_dato`, para pedir información obligatoria. Después se añade un turno de usuario con `Estado: {JSON compacto}` y `Pedido: <frase>`. La salida es una llamada XML nativa con `<function=...>` y `<parameter=...>`, o texto si es charla. La evaluación se hizo con plantillas apartadas, estados nuevos, un banco de 1.423 frases y un examen de 105 casos. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

Como innovaciones prácticas destacan la generación de la llamada completa en una sola pasada —frente a versiones previas que separaban elección de herramienta y argumentos—, la cabeza MTP para decodificación especulativa con `--spec-type draft-mtp` y la recomendación de reutilizar el caché de la cabeza fija. El modelo no usa razonamiento visible: la cola incluye `<think>` vacío antes de la respuesta.

## Capacidades

- Generación de llamadas completas de herramienta en formato nativo de Qwen3.5: nombre de función y argumentos XML en una sola respuesta.
- Cobertura de 108 herramientas de un aparato de producción de TV en vivo: audio, escenas, fuentes, participantes, gráficos y carruseles.
- Copia de nombres exactos desde el estado del aparato, con convenciones para valores relativos (`-4`, `+3`), valores exactos (`=-10`), booleanos y enumerados.
- Derivación de peticiones que no son suyas mediante `derivar`, sin argumentos, hacia un asistente mayor.
- Petición de datos faltantes mediante `falta_dato` con una pregunta concreta.
- Conversación general en texto: según el autor, contesta charla sin emitir `tool_call` en el 0 % de los casos.
- Visión integrada mediante `mmproj-F16.gguf`: puede describir capturas, imágenes de una fuente y multiview. La visión no se ajustó; hereda el comportamiento de Qwen3.5-4B.
- Soporte de tool calling y function calling con API compatible con OpenAI a través de `llama-server`.
- No se documenta soporte de agentes multi-paso, planificación autónoma ni razonamiento encadenado. El formato está pensado para una llamada por turno.
- No se documenta soporte de audio ni otros idiomas distintos del español.

## Casos de uso

- Control de audio en directo: una orden como «bajale 4 a la música» se convierte en `audio_set` con `name=Música` y `volumeDb=-4`. El servidor suma el valor relativo al volumen real y lo recorta al rango; el modelo solo escribe la llamada, lo que reduce la lógica necesaria en el cliente.
- Conmutación de escenas y fuentes: con el estado `escena_actual`, `escena_armada`, `escenas` y `fuentes_de_la_escena_actual`, el modelo puede generar la llamada para cambiar de escena o alterar la visibilidad de una fuente. Es adecuado porque los nombres se copian del JSON de estado y se evita inventar identificadores.
- Gestión de participantes: a partir de `participantes` con `id`, `nombre` y `estado`, puede emitir herramientas para incorporar, retirar o cambiar el estado de una persona. La validación posterior en servidor debe comprobar que el `id` existe.
- Control de gráficos y carruseles: el estado incluye `graficos` y `carruseles`; el modelo puede generar llamadas para mostrar, ocultar o seleccionar elementos. Es útil en realización porque combina lenguaje natural del operador con nombres exactos del inventario.
- Enrutado al asistente grande: cuando la petición no encaja en las 108 herramientas, el modelo emite `derivar`. Esto permite usar un modelo pequeño local como primera capa y reservar un modelo mayor para consultas abiertas o no operativas.
- Aclaración de órdenes incompletas: si falta un dato obligatorio, emite `falta_dato` con una pregunta como «¿A qué escena?». Es preferible a una llamada incompleta o a una invención de parámetros.
- Verificación visual de señales: con `llama-mtmd-cli` o `llama-server --mmproj`, se le puede pasar una captura de una fuente o de multiview y preguntar «¿Qué se ve?». Sirve para comprobaciones rápidas, no como sistema de visión crítico.
- Charla operativa: el operador puede hacer preguntas generales y el modelo responde en texto sin intentar invocar una herramienta. El autor reporta una pérdida de 0,42 por token en charla general, por lo que no sustituye a un asistente conversacional generalista.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan bf16 y MLX q4. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

| Métrica | bf16 | MLX q4 |
|---|---:|---:|
| Argumentos exactos en plantillas nunca vistas | 89,0 % | 90,2 % |
| Herramienta correcta en plantillas nunca vistas | 92,0 % | 91,5 % |
| Formato válido | 100,0 % | 100,0 % |
| `falta_dato` cuando corresponde | 83,3 % | 75,0 % |
| Banco: precisión al elegir | 76,5 % | 78,2 % |
| Banco: cobertura | 89,5 % | 89,4 % |
| Banco: derivado | 90,1 % | 90,2 % |
| Examen de 105 casos | 77,1 % | 76,2 % |

El banco de evaluación se describe como 1.423 frases escritas aparte. La cobertura mide, de lo que es competencia del modelo, cuánto atiende solo; la precisión, de lo que atiende, cuánto acierta; y el derivado, de lo ajeno, cuánto pasa al asistente grande. En charla general se reporta una pérdida de 0,42 por token sobre respuestas del modelo base no entrenadas y un 0 % de llamadas a herramienta en conversación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-6 GB con Q4_K_M, `mmproj` F16 y 16.384 tokens de contexto, dependiendo del tamaño del caché KV. Es una estimación a partir del repo de 3,5 GB, no una cifra publicada por el autor.
- GPU consumer: cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 de 12 GB y RTX 4090 de 24 GB. En GPUs de 8 GB puede entrar, pero el contexto y el `mmproj` dejan poco margen.
- GPU de datacenter: A100 o H100 no son necesarias para una sola instancia en Q4_K_M; tienen sentido si se busca serving concurrente o mayor contexto.
- Apple Silicon: el autor menciona una variante MLX q4 en los benchmarks, aunque el repo principal es GGUF para llama.cpp.
- Despliegue: llama.cpp b11255 o posterior, `llama-server`, `llama-mtmd-cli` para imágenes y API compatible con OpenAI para visión. No se documentan vLLM, TGI ni Ollama para este repo.
- Latencia y throughput: no disponibles. El uso de decodificación especulativa con `--spec-type draft-mtp --spec-draft-n-max 3` puede reducir la latencia de decodificación, pero no hay cifras publicadas.
- El prompt fijo de unas 8.200 tokens conviene procesarlo una vez y reutilizar caché con `--cache-reuse 256`; de lo contrario, cada petición paga ese coste de prefill.

## Comparativa con modelos similares

No hay datos de benchmarks de las alternativas en la información disponible; la comparación es estructural y de enfoque.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| `BlairQ/broadcast-reactivo-qwen3.5-4b-v8-GGUF` | 4,326B | 16.384 tokens en el ejemplo de despliegue; máximo no disponible | Benchmarks propios de tool calling; ver tabla | Apache-2.0 | GGUF en Hugging Face |
| `Qwen/Qwen3.5-4B` (base) | 4,326B | No disponible | No disponible para este contrato de 108 herramientas | Apache-2.0 | Safetensors en Hugging Face |
| Broadcast Reactivo v1 | No disponible | No disponible | Según la model card, solo devuelve el nombre de la herramienta; los argumentos van en una segunda llamada | No disponible | Referenciado en la model card |
| Broadcast Reactivo v3 | No disponible | No disponible | No disponible | No disponible | GGUF en Hugging Face |

Frente al modelo base, este ajuste sacrifica generalidad y gana adherencia a un contrato muy específico: 108 herramientas, estado JSON, formato XML y pseudo-funciones de derivación y aclaración. Frente a la v1, la v8 unifica herramienta y argumentos en una sola respuesta. No se dispone de datos para comparar latencia, calidad conversacional o robustez frente a otros modelos de 4B especializados en function calling.

## Limitaciones y advertencias

- Dominio muy restringido: 108 herramientas de un aparato concreto. Fuera de ese catálogo puede derivar, pero no es un asistente general.
- Español rioplatense: el autor indica esta variante. Expresiones, imperativos y vocabulario pueden diferir del español de España y afectar a la interpretación de órdenes.
- Riesgo de alucinación en nombres de herramienta o parámetros. Aunque el formato sea válido, hay que validar que la función exista, que los nombres copiados existan en el estado y que los rangos sean correctos.
- Los valores relativos (`-4`, `+3`) no se aplican dentro del modelo: el servidor debe sumarlos al valor real y recortarlos al rango. Si el cliente no implementa esa convención, la orden se ejecutará mal.
- Los valores exactos requieren el prefijo `=` (`=-10`). En XML no hay comillas; una lectura incorrecta del contrato puede producir argumentos erróneos.
- No hay razonamiento visible: la cola incluye `<think>` vacío. No es adecuado para tareas que requieran planificación multi-paso o justificación intermedia.
- La visión no se ajustó: hereda los sesgos y errores de Qwen3.5-4B. No se ha evaluado su precisión en capturas de producción real.
- La conversación general está degradada respecto al base, con una pérdida de 0,42 por token reportada por el autor. No conviene usarlo como chatbot general.
- El prompt fijo consume unas 8.200 tokens de contexto. Con 16.384 tokens, queda aproximadamente la mitad para estado, historial y respuesta; contextos mayores no están documentados.
- No hay validación independiente: el repo tenía 0 descargas y 0 likes en el momento de la consulta. Los resultados son los publicados por el autor.
- La licencia Apache-2.0 permite uso comercial, pero deben revisarse los términos del modelo base y las condiciones de los datos y nombres de herramienta del entorno de producción.
- En un contexto de televisión en directo, cualquier acción sobre audio, participantes o fuentes debería tener confirmación humana y límites de seguridad en el servidor.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/BlairQ/broadcast-reactivo-qwen3.5-4b-v8-GGUF)
- [Modelo base Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Versión v3 del mismo ajuste](https://huggingface.co/BlairQ/broadcast-reactivo-qwen3.5-4b-v3-GGUF)
- [Variante mtp-ud del ajuste](https://huggingface.co/BlairQ/broadcast-reactivo-qwen3.5-4b-mtp-ud-GGUF)
- [Registro en free2aitools](https://free2aitools.com/model/blairq/broadcast-reactivo-qwen3.5-4b-gguf)
- [GGUF de Qwen3.5-4B en ModelScope, de terceros](https://www.modelscope.cn/models/diodel/Qwen3.5-4B-Q4_K_M-GGUF)
