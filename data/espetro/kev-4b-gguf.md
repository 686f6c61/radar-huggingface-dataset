# espetro/kev-4b-gguf

## Resumen

Kev 4B es un modelo de decisión de tipo "System One": recibe un documento de estado y un conjunto de preguntas tipadas, y devuelve una distribución de probabilidad calibrada por pregunta en un único forward pass, sin generar texto. Está construido sobre el backbone Qwen/Qwen3.5-4B-Base (revisión 1001bb4d) al que se le añade un adaptador LoRA (r=16, 33,8 millones de parámetros entrenables) y una cabeza pointer, según la documentación del proyecto original jaredpalmer/kev. El repositorio que nos ocupa, espetro/kev-4b-gguf, es un empaquetado GGUF en cuantización q8_0 que incluye la cabeza pointer y la temperatura de calibración ya fundidas en el archivo (tensores `dec.head_*` y metadatos `kev.*`).

El modelo resuelve un problema muy concreto: sustituir la generación de texto libre por decisiones estructuradas y calibradas, algo útil cuando se necesita enrutar, clasificar o etiquetar sin depender de un parser posterior. Implementa el contrato público `/v1/systemone` de TypeSafe y se sirve mediante un fork de llama.cpp mantenido por el autor (rama `kev`), que expone los endpoints `/v1/systemone` y `/studio` de forma automática.

Su relevancia actual es doble: por un lado, propone un patrón de "modelo de decisión" alternativo al chat convencional; por otro, el empaquetado GGUF permite ejecutarlo en llama.cpp estándar (como un Qwen3.5 normal, ignorando las cabezas) e incluso en el navegador mediante una build WASM. El recuento real de parámetros en safetensors es de 4.207.062.528 (unos 4,2 mil millones), coherente con el nombre "4B"; conviene señalar que el cuerpo de la model card menciona "Kev-0.8B", una inconsistencia de nomenclatura del propio autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen/Qwen3.5-4B-Base, revision 1001bb4d) con adaptador LoRA (r=16) y cabeza pointer para preguntas tipadas; empaquetado GGUF con tensores `dec.head_*` y metadatos `kev.*` |
| Parametros totales | 4.207.062.528 (aproximadamente 4,2 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q8_0 (única cuantización de este repositorio; el autor desaconseja q4 porque degrada la calibración) |
| Idiomas soportados | No disponible en este repositorio (una variante comunitaria, DreamBlooms/kev-4b-GGUF, declara inglés) |
| Licencia | Apache-2.0 (pesos y cabeza); el bundle de origen es 0BSD y el runtime MIT |
| Formato de pesos | GGUF (llama.cpp) |
| Tarea declarada | Clasificación de texto / modelo de decisión (según etiquetas del ecosistema y la variante DreamBlooms) |
| Tamano del repositorio | 4,5 GB |

## Arquitectura y entrenamiento

La arquitectura parte de un transformer decoder-only denso (Qwen3.5-4B-Base) y le superpone dos componentes específicos: un adaptador LoRA de rango 16, con 33,8 millones de parámetros entrenables, y una cabeza pointer que transforma el estado oculto en probabilidades sobre opciones tipadas. La documentación del proyecto original describe el flujo como "un documento (el estado) y un conjunto de preguntas tipadas a la entrada, una distribución de probabilidad por pregunta a la salida, en un solo forward pass", explícitamente sin generación de texto. El GGUF de este repositorio añade, además, la temperatura de calibración empaquetada como metadato, de modo que el runtime no necesita recalibrar.

En cuanto a los datos de entrenamiento, la única referencia disponible son los 10 datasets que lista la variante comunitaria DreamBlooms/kev-4b-GGUF; no se especifica el número de tokens, la composición del corpus ni si hubo fases de RLHF o DPO. Tampoco se documentan detalles del proceso de calibración más allá de que la temperatura va fundida en el archivo.

Como innovaciones destacables: el patrón de "modelo de decisión" con tipos de pregunta (`choice`, con instrucciones y criterios de clasificación), el contrato TypeSafe `/v1/systemone`, la integración con las herramientas `kev_pack.py` y `llama-decide`, y la posibilidad de ejecución en navegador mediante una build WASM de llama.cpp que carga el archivo de forma diferida.

## Capacidades

- Decisión y clasificación tipada: dado un estado textual y un conjunto de preguntas con tipo (`choice`) e instrucciones, devuelve una distribución de probabilidad por pregunta en un solo forward pass.
- Salida calibrada: la temperatura de calibración está fundida en el GGUF, por lo que las probabilidades se emiten ya ajustadas sin post-proceso.
- Sin generación de texto: por diseño, el contrato `systemone` no produce texto libre, sino probabilidades.
- Compatibilidad con llama.cpp estándar: el archivo carga como un Qwen3.5 ordinario; en ese caso los tensores `dec.head_*` y los metadatos `kev.*` se ignoran y el modelo se comporta como un modelo de lenguaje convencional.
- Servido mediante fork: con el fork `espetro/llama.cpp` (rama `kev`), `llama-server` expone `/v1/systemone` y `/studio` de forma automática, y existe la herramienta de línea de comandos `llama-decide`.
- Ejecución en navegador: se puede cargar en una build WASM de llama.cpp (según el autor, unos 1 GB en vivo, con q8_0 como única cuantización recomendada).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Visión, audio o modo "thinking": no disponible.

## Casos de uso

- Enrutado de tickets de atención al cliente: el propio autor propone el ejemplo de un pedido que llega tarde y con la talla equivocada, con una pregunta `choice` que decide entre "returns" (cambios y reembolsos) y "shipping" (retrasos y paquetes perdidos). Es adecuado porque devuelve probabilidades calibradas en lugar de una cadena que haya que parsear.
- Triaje y clasificación de correo entrante: alimentar el cuerpo del mensaje como estado y definir preguntas tipadas (departamento, urgencia, intención) para asignar colas de trabajo sin intervención humana en el primer nivel.
- Moderación de contenido y etiquetado: al emitir distribuciones de probabilidad, permite fijar umbrales explícitos y derivar a revisión humana los casos con baja confianza.
- Enrutador de agentes o de modelos: usar la salida calibrada como señal de decisión para escoger qué herramienta, submodelo o flujo ejecutar a continuación, aprovechando que la inferencia es un único forward pass.
- Clasificación de documentos en back-office: facturas, contratos o formularios donde se necesita asignar categorías múltiples con criterios definidos en lenguaje natural en el campo `instructions`, sin entrenar un clasificador específico por tarea.
- Demos y prototipos sin backend: la carga vía WASM en el navegador permite desplegar una interfaz de decisión interactiva (por ejemplo, un asistente de clasificación interno) sin infraestructura de servidor.
- Filtrado previo en pipelines de datos: descartar o priorizar muestras en un conjunto de datos según probabilidades de pertenencia a categorías definidas ad hoc.
- Investigación sobre calibración: al llevar la temperatura fundida y ser un modelo pequeño, sirve como banco de pruebas para estudiar calibración en tareas de elección múltiple frente a la generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La variante comunitaria DreamBlooms/kev-4b-GGUF incluye una sección de "Eval Results (legacy)" en su ficha, pero no se aportan cifras concretas (MMLU, HumanEval, GSM8K ni métricas de calibración como ECE) en la información consultada.

## Requisitos de hardware

- Pesos: el repositorio ocupa 4,5 GB, coherente con una cuantización q8_0 de un modelo de 4,2 mil millones de parámetros.
- VRAM estimada para inferencia: en torno a 5-6 GB con contexto moderado, sumando pesos, caché KV y overhead del runtime. La cifra exacta depende del contexto configurado, que no está documentado.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4080/4090, A100 o H100 para despliegues con concurrencia. Cualquier GPU con 8 GB o más debería bastar para una sola sesión en q8_0.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más de VRAM. También es viable en CPU con memoria unificada suficiente (Apple Silicon, por ejemplo).
- Navegador: el autor indica que la build WASM necesita aproximadamente 1 GB en vivo, una cifra que no cuadra con el tamaño del archivo en disco y que conviene verificar en la práctica; solo recomienda q8_0 para este escenario.
- Opciones de despliegue: llama.cpp (con el fork `espetro/llama.cpp`, rama `kev`, mediante `llama-server` y `llama-decide`), llama.cpp stock para uso como modelo de texto, y compilación WASM para navegador. Compatibilidad con vLLM, TGI u Ollama: no disponible.
- Latencia y throughput: no disponible. Al tratarse de un único forward pass sin decodificación autorregresiva, la latencia debería ser sustancialmente menor que la de un modelo generativo del mismo tamaño, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| espetro/kev-4b-gguf | 4,2 mil millones | No disponible | Decisión tipada (GGUF empaquetado con cabeza y calibración) | Apache-2.0 | HuggingFace, GGUF |
| taigrr/kev-4b-gguf | Mismo backbone (4,2 mil millones) | No disponible | Bundle de origen (gojev) con cabeza | Bundle 0BSD; pesos Apache-2.0 | HuggingFace, GGUF |
| DreamBlooms/kev-4b-GGUF | Mismo backbone | No disponible | Clasificación de texto (variante comunitaria, declara inglés y 10 datasets) | Apache-2.0 | HuggingFace, GGUF |
| Qwen/Qwen3.5-4B-Base | No disponible en la información | No disponible | Modelo de lenguaje base | No disponible en la información | HuggingFace |

No se dispone de datos de rendimiento comparado entre estas variantes, por lo que la comparación se limita a procedencia, formato y licencia.

## Limitaciones y advertencias

- No genera texto por diseño en el contrato `systemone`: usarlo como modelo de decisión requiere el fork de llama.cpp. En llama.cpp estándar se comporta como un Qwen3.5 normal y las cabezas se ignoran silenciosamente, lo que puede llevar a confusión si se espera el comportamiento de decisión.
- Inconsistencia documental: la model card titula "Kev 4B" pero el cuerpo menciona "Kev-0.8B"; el recuento real de parámetros (4,2 mil millones) respalda la lectura de 4B. Conviene verificar cualquier afirmación de la ficha contra el archivo.
- Cuantización sensible: el autor advierte que q4 desvía lo suficiente como para romper la calibración, así que en producción conviene quedarse en q8_0.
- Idiomas no declarados en este repositorio. Si el caso de uso no es en inglés, hay que validar el comportamiento antes de desplegar.
- Longitud de contexto no documentada; no se puede garantizar el manejo de documentos largos.
- Riesgo de mala calibración fuera de dominio: al no publicarse métricas de calibración ni la composición del conjunto de entrenamiento, no hay forma de saber si las probabilidades son fiables en dominios alejados de los datos de entrenamiento.
- Sesgos: no disponible. No se documenta ningún análisis de sesgo.
- Licencias múltiples: los pesos y la cabeza son Apache-2.0, el bundle de origen es 0BSD y el runtime del fork es MIT. Apache-2.0 permite uso comercial, pero conviene revisar la cadena completa de componentes si se redistribuye.
- Madurez: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, sin discusiones ni validación comunitaria, por lo que no hay evidencia externa de robustez en producción.
- Fechas del repositorio: creado y actualizado el 23 de septiembre de 2026 según los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/espetro/kev-4b-gguf
- Fork de llama.cpp con soporte Kev: https://github.com/espetro/llama.cpp
- Demo en navegador (WASM): https://espetro.github.io/llama.cpp/
- Repositorio del proyecto original: https://github.com/jaredpalmer/kev
- Model card de Kev-4B en el repositorio original: https://github.com/jaredpalmer/kev/blob/main/docs/model-cards/kev-4b.md
- Bundle de origen (gojev): https://huggingface.co/taigrr/kev-4b-gguf
- Discusiones del bundle de origen: https://huggingface.co/taigrr/kev-4b-gguf/discussions
- Variante comunitaria: https://huggingface.co/DreamBlooms/kev-4b-GGUF
- Buscador de modelos GGUF (referencia del ecosistema): https://local-ai-zone.github.io/
- Scripts de conversión GGUF de IBM (referencia del ecosistema): https://github.com/IBM/gguf
