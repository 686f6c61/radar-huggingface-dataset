# ahmedihamdy/Ornith-1.5-35B-A3B-MLX-6bit-vision-DFLASH2

## Resumen

Ornith-1.5-35B-A3B-MLX-6bit-vision-DFLASH2 es una distribución empaquetada del modelo multimodal Ornith 1.5 35B A3B, publicada por el usuario ahmedihamdy para su ejecución local en Apple Silicon mediante la librería MLX. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue que combina tres piezas: los pesos originales de Ornith en cuantización de 6 bits para los expertos y 8 bits para los routers, la torre de visión original en bf16 completa (27 bloques, 447M de parámetros) y un modelo borrador de decodificación especulativa (DFlash2) incluido en la carpeta `drafter`.

El modelo subyacente es un transformer de mezcla de expertos (MoE) con 35.107.180.016 parámetros totales, de los cuales activa 8 de sus 256 expertos por token, lo que equivale a unos 3B de parámetros activos. Esta relación entre parámetros totales y activos explica su velocidad de inferencia relativa a su tamaño. Soporta una ventana de contexto de 262.144 tokens, procesa texto e imágenes (pipeline `image-text-to-text`) y está orientado a conversación, razonamiento previo a la respuesta y llamada de herramientas.

Su relevancia actual reside en dos factores. Primero, permite ejecutar un MoE de 35B con capacidades de visión en un Mac con 48 GB o más de memoria unificada, algo imposible con los pesos en bf16. Segundo, integra decodificación especulativa con árbol de borradores (draft-tree) de tres tokens de profundidad, lo que acelera la generación sin alterar la distribución de salida del modelo grande, ya que cada token aceptado es verificado por el modelo principal en un solo paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), familia Qwen3.5, con torre de visión multimodal |
| Parametros totales | 35.107.180.016 (35B) |
| Parametros activos | 8 de 256 expertos por token, aproximadamente 3B |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 6 bits en expertos, 8 bits en routers, bf16 en la torre de visión (447M de parámetros) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `mit-and-apache-2.0` (ver NOTICE del repositorio) |
| Formato de pesos | safetensors, librería MLX |
| Tamano del repositorio | 30,1 GB (descarga aproximada de 28 GB) |
| Memoria necesaria | Aproximadamente 29,5 GB de memoria de modelo para velocidad completa |
| Modelo base | ahmedihamdy/Ornith-1.5-35B-A3B-MLX-6bit-vision y jzinno/Ornith-1.5-35B-A3B-DFlash2 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con enrutamiento disperso: 256 expertos en total, de los que se activan 8 por token. Los routers se mantienen en 8 bits mientras los expertos se cuantizan a 6 bits, una decisión que preserva la precisión del enrutamiento, que es más sensible a la cuantización que los pesos de las capas feed-forward. La torre de visión conserva sus 27 bloques y 447M de parámetros en bf16, sin cuantizar, porque una torre visual solo funciona correctamente con los pesos de texto junto a los que fue entrenada; el autor verificó que 24 de 24 tensores de texto muestreados coinciden con el modelo base y que la anchura de la torre y el número de tokens de imagen son consistentes.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original; la model card de esta distribución no los detalla. La innovación técnica destacable de este artefacto es la decodificación especulativa con árbol de borradores: el modelo DFlash2 propone 3 tokens más allá del actual, ramificando en alternativas donde no tiene confianza, y el modelo grande verifica las 4 filas del árbol en un único paso. Cada token aceptado es un token que el modelo principal no tuvo que generar por sí mismo, y todos los tokens emitidos siguen siendo su propia elección. El autor indica que los kernels de borrador aprovechan las unidades matriciales de la GPU de la familia M5; en Macs sin M5 o con un límite de memoria inferior, el modelo funciona igualmente pero decodifica token a token, sin especulación.

## Capacidades

- Generación de texto conversacional multi-turno con hasta 262.144 tokens de contexto.
- Comprensión de imágenes y respuesta texto-a-partir-de-imagen (pipeline `image-text-to-text`).
- Razonamiento previo a la respuesta (modo de pensamiento declarado en la model card).
- Llamada de herramientas y funciones (tool calling), con soporte de los protocolos OpenAI y Anthropic a través de la API local de Astronomical.
- Ejecución como agente de codificación: la model card documenta `astronomical launch claude`, `launch codex` y `launch opencode` apuntando a este modelo.
- Capacidades multilingües limitadas al inglés según el campo `language` del repositorio.
- Decodificación especulativa integrada con árbol de borradores de profundidad 3.

## Casos de uso

- Asistente conversacional local con privacidad estricta: al ejecutarse íntegramente en el Mac del usuario mediante Astronomical, ningún dato sale del equipo; adecuado para conversaciones con información sensible y ventanas de contexto largas de hasta 262.144 tokens.
- Análisis de documentos e imágenes escaneadas: la torre de visión en bf16 completa permite extraer información de capturas, diagramas o fotografías y razonar sobre ellas en el mismo hilo de conversación.
- Agente de codificación en terminal: mediante `astronomical launch claude` o `launch codex`, el modelo actúa como backend de un agente que lee ficheros, ejecuta herramientas y mantiene el estado de la tarea en contexto largo.
- Automatización de tareas con tool calling: integrable en cualquier cliente que hable la API de OpenAI o Anthropic contra la API local de Astronomical, útil para orquestar scripts y servicios internos sin depender de la nube.
- Prototipado e investigación en Mac: investigadores que necesitan evaluar un MoE de 35B con visión sin acceso a clústeres de GPU pueden usar este build en un Mac de 48 GB o más, con la ventaja de la decodificación especulativa para iterar más rápido.
- Procesamiento por lotes de conversaciones largas: la ventana de 262.144 tokens permite resumir o analizar transcripciones extensas en una sola pasada, con la memoria del modelo fijada en unos 29,5 GB.
- Demostraciones y docencia offline: al ser una aplicación de código abierto y gratuita, sirve para mostrar el funcionamiento interno de un MoE y de la decodificación especulativa en un entorno controlado y sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos; solo describe el comportamiento cualitativo de la decodificación especulativa.

## Requisitos de hardware

- VRAM o memoria unificada estimada: unos 29,5 GB de memoria de modelo para velocidad completa, configurable como «Maximum model RAM» en Astronomical.
- Disco: aproximadamente 28 GB de descarga y 30,1 GB de repositorio.
- Mac recomendado: 48 GB de memoria unificada o más para mantener el modelo y el borrador completos en memoria.
- Aceleración de la especulación: GPU de la familia M5, cuyos kernels de borrador usan las unidades matriciales; en otras GPU Apple el modelo funciona sin especulación.
- Modo de memoria insuficiente: Astronomical mantiene parte de los expertos en el SSD y los lee bajo demanda, lo que permite ejecutar el modelo en Macs con mucha menos memoria a costa de mayor latencia.
- Sistemas operativos: Apple Silicon con macOS 14 o posterior.
- Opciones de despliegue: aplicación Astronomical (gráfica y CLI `astronomical`), API local compatible con OpenAI y Anthropic. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, ya que el formato es MLX y está pensado para Apple Silicon.
- Latencia y throughput: no disponibles de forma numérica; la model card solo indica que la decodificación es más rápida con la especulación activa y más lenta cuando los expertos se leen del SSD.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-MLX-6bit-vision-DFLASH2 | 35B (3B activos) | 262.144 | Si | 6 bits + bf16 torre | mit-and-apache-2.0 | MLX, Apple Silicon |
| Ornith-1.5-35B-A3B-MLX-8bit-vision-DFLASH2 | 35B (3B activos) | 262.144 | Si | 8 bits | mit-and-apache-2.0 | MLX, Apple Silicon; unos 8 GB mas de descarga, mas cercano al original |
| Ornith-1.5-35B-A3B-OptiQ-DFLASH2-4bit | 35B (3B activos) | 262.144 | Si | 4 bits | mit-and-apache-2.0 | MLX, Apple Silicon; unos 5 GB mas ligero |

Las tres variantes comparten arquitectura, contexto y licencia; difieren únicamente en el nivel de cuantización y, por tanto, en el equilibrio entre fidelidad al modelo original y requisitos de memoria. No se dispone de datos de rendimiento comparativo entre ellas ni frente a modelos de otros fabricantes.

## Limitaciones y advertencias

- El único idioma declarado es el inglés; el rendimiento en castellano u otras lenguas no está documentado y puede degradarse.
- Riesgo de alucinación inherente a los modelos generativos; la model card no documenta mitigaciones específicas ni tasas de error.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia es `other` con nombre `mit-and-apache-2.0`; conviene revisar el fichero NOTICE del repositorio antes de un uso comercial, ya que la combinación de ambas licencias puede imponer condiciones distintas según el componente.
- La decodificación especulativa solo se activa con el modelo y el borrador completos en memoria y, para máximo rendimiento, con GPU de la familia M5; en otros equipos el rendimiento cae al de una decodificación token a token.
- El uso con memoria insuficiente recurre a lectura de expertos desde SSD, lo que incrementa la latencia de forma significativa y no es adecuado para producción interactiva.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; se trata de una publicación reciente sin validación comunitaria.
- Dependencia del ecosistema Astronomical y de MLX: no es portable a CUDA ni a otros runtimes sin reconversión de pesos.
- El autor declara que los pesos son los originales sin recuantizar ni reentrenar y publica un `astronomical-build.json` con SHA-256 de cada fichero, pero la verificación corre a cargo del usuario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-MLX-6bit-vision-DFLASH2
- Modelo base (6 bits con visión): https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-MLX-6bit-vision
- Modelo borrador DFlash2: https://huggingface.co/jzinno/Ornith-1.5-35B-A3B-DFlash2
- Variante 8 bits con visión y DFLASH2: https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-MLX-8bit-vision-DFLASH2
- Variante OptiQ 4 bits con DFLASH2: https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-OptiQ-DFLASH2-4bit
- Fichero de licencia NOTICE: https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-MLX-6bit-vision-DFLASH2/blob/main/NOTICE
- Astronomical, aplicación de escritorio: https://getastronomical.com/
- Descargas de Astronomical: https://github.com/aosama/astronomical/releases/latest
- Documentación de la API local: https://getastronomical.com/local-api.html
