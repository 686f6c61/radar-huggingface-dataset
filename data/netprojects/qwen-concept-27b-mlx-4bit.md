# netprojects/Qwen-Concept-27B-MLX-4bit

## Resumen

Qwen Concept 27B es una variante de Qwen3.8-27B en la que Concept Country ha modificado directamente los pesos para que el modelo llegue a la respuesta con menos razonamiento intermedio. Concretamente, se han editado nueve proyecciones descendentes de las capas MLP (capas 32 a 48, paso 2) mediante una tecnica que el autor denomina "programacion en el espacio de pesos". El resultado es un modelo vision-language de 27.356.728.560 parametros que conserva las capacidades del original pero reduce de forma medible la longitud de la cadena de pensamiento.

La ficha que nos ocupa es la conversion a MLX en 4 bits publicada por NetProjects (Internet Projects Ltd), no afiliada ni a Concept Country ni a Alibaba Cloud. Cuantiza el modelo de lenguaje con cuantizacion afin de grupo 64 y mantiene la torre de vision en bf16, de modo que funciona tanto en `mlx-lm` (solo texto) como en `mlx-vlm` (texto e imagenes). El repositorio ocupa 16,1 GB y esta pensado para ejecutarse en Apple Silicon.

Su relevancia es doble: por un lado demuestra que la edicion de pesos del modelo base sobrevive a la cuantizacion agresiva a 4 bits; por otro, ofrece una via practica para reducir coste de inferencia en tareas de razonamiento sin reentrenar. Segun las mediciones del autor, el build de 4 bits mantiene el 95,3% de coincidencia en el siguiente token respecto al build bf16 de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso vision-language (familia Qwen3.8, tag `qwen3_5`) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afin, grupo 64 (LM); bf16 en la torre de vision |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de la familia Qwen con torre de vision, pipeline `image-text-to-text`. Sobre esos pesos, Concept Country aplico una edicion quirurgica: de los 851 tensores del modelo de lenguaje, 842 son identicos al original y exactamente nueve difieren, correspondientes a `mlp.down_proj` de las capas 32, 34, 36, 38, 40, 42, 44, 46 y 48, con una variacion de norma de entre el 0,4% y el 0,6%. La especificacion de la edicion se distribuye con el modelo en `EDIT_SPEC.json`.

La publicacion de NetProjects no entrena ni afina el modelo: convierte los pesos bf16 de la revision `4c96373` a MLX. El modelo de lenguaje se cuantiza a 4 bits con cuantizacion afin y grupo de 64; la torre de vision se mantiene en bf16 para preservar la calidad multimodal. El autor verifico que los 33 ficheros del directorio bf16 de origen coinciden con su `SHA256SUMS`, que la edicion de pesos esta intacta tensor a tensor y que los builds de 4, 6 y 8 bits describen correctamente una imagen de prueba en `mlx-vlm`. No se dispone de informacion sobre el volumen o la composicion del dataset de entrenamiento original ni sobre si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" explicito, heredado de Qwen3.8.
- Razonamiento matematico, con reduccion medible de tokens de pensamiento respecto al modelo sin editar.
- Comprension de imagenes y respuesta texto-a-texto a partir de imagen (`image-text-to-text`), con la torre de vision en bf16.
- Conversacion multi-turno (tag `conversational`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el modo thinking es compatible con flujos multi-paso.
- Inferencia en Apple Silicon mediante `mlx-lm` y `mlx-vlm`, con servidores compatibles con la API de OpenAI (`mlx_lm.server`, `mlx_vlm.server`).

## Casos de uso

- Razonamiento matematico en local sobre Mac: el modelo resuelve problemas de nivel 5 de MATH-500 con una media de 1.202 tokens de pensamiento y un 73% de respuestas correctas bajo un limite de 3.072 tokens, lo que lo hace util para asistentes de estudio o verificacion de calculos en un portatil Apple Silicon.
- Analisis de documentos con imagenes: gracias a la torre de vision en bf16 y al pipeline `image-text-to-text`, se puede usar para describir capturas, extraer informacion de diagramas o responder preguntas sobre fotografias mediante `mlx_vlm.generate`.
- Prototipado de agentes con API compatible con OpenAI: `mlx_vlm.server` y `mlx_lm.server` permiten levantar un endpoint local y conectar frameworks que esperan la interfaz de OpenAI sin enviar datos a la nube.
- Reduccion de coste en pipelines de razonamiento: al recortar entre un 27% y un 54% los tokens de pensamiento (datos del autor a Q8), encaja en flujos donde la latencia y el consumo de tokens son el cuello de botella, como clasificacion razonada o extraccion estructurada.
- Desarrollo y evaluacion offline en Apple Silicon: util para investigadores que necesitan reproducir experimentos de edicion de pesos y comparar builds de 4, 6, 8 bits y bf16 con el mismo prompt y semilla.
- Asistente conversacional multimodal de escritorio: el modelo cabe en 16,1 GB, por lo que se puede integrar en una aplicacion nativa de macOS que combine texto e imagen sin depender de servicios externos.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Pruebas sobre MATH-500 nivel 5, decoding greedy, thinking activado, MacBook Pro M5 Max de 128 GB, 10 de noviembre de 2026, 40 problemas y limite de 3.072 tokens, ambos modelos a 4 bits:

| Metrica | Qwen3.8-27B 4-bit | Qwen Concept 27B 4-bit |
|---|---|---|
| Tokens de pensamiento, media | 1.746 | 1.202 (-31%) |
| Tokens de pensamiento, mediana | 1.477 | 673 |
| Termina el pensamiento dentro del limite | 58% | 83% |
| Respuesta final correcta | 55% | 73% |
| Tiempo total de la ejecucion | 19 min | 12 min |

Subconjunto de los primeros 16 problemas con limite de 2.048 tokens, media de tokens de pensamiento: Qwen3.8-27B 4-bit 1.178; Qwen Concept 4-bit 876; 6-bit 801; 8-bit 909. Concept Country reporta entre un 27% y un 54% menos de tokens de pensamiento en sus propios benchmarks a Q8.

Fidelidad de cuantizacion respecto al build MLX bf16, medida como coincidencia del siguiente token sobre 12 prompts (thinking on y off, 96 tokens con teacher forcing):

| Build | Tamano | Mismo siguiente token que bf16 |
|---|---|---|
| 6 bits (recomendado) | 22,8 GB | 98,6% |
| 8 bits | 29,5 GB | 99,0% |
| 4 bits | 16,1 GB | 95,3% |
| bf16 | 54,7 GB | referencia |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: 16,1 GB de pesos en 4 bits; conviene reservar al menos 20-24 GB de memoria unificada para margen de contexto y cache KV.
- Plataforma objetivo: Apple Silicon con MLX (probado con mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11). No esta pensado para CUDA.
- Equipos validados por el autor: MacBook Pro con M5 Max y 128 GB. Con 16,1 GB de pesos, deberia caber en equipos con 32 GB o mas de memoria unificada, aunque no se documentan pruebas en configuraciones menores.
- GPU NVIDIA (A100, H100, RTX 4090): no aplicable a este build; requeriria conversion a otro formato (por ejemplo GGUF o safetensors estandar).
- Opciones de despliegue: `mlx-lm` para texto (`mlx_lm.generate`, `mlx_lm.server`), `mlx-vlm` para texto e imagen (`mlx_vlm.generate`, `mlx_vlm.server`). Ambos servidores exponen API compatible con OpenAI.
- Latencia y throughput: el autor reporta 12 minutos para 40 problemas de MATH-500 nivel 5 con limite de 3.072 tokens en un M5 Max de 128 GB. No se publican tokens por segundo.
- Parametros de muestreo recomendados para thinking: temperatura 1.0, top-p 0.95, top-k 20.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| netprojects/Qwen-Concept-27B-MLX-4bit | 27,36 B | no disponible | MLX safetensors 4-bit | Apache-2.0 | 95,3% de coincidencia con bf16; 16,1 GB |
| netprojects/Qwen-Concept-27B-MLX-6bit | 27,36 B | no disponible | MLX safetensors 6-bit | Apache-2.0 | 98,6% de coincidencia; 22,8 GB; recomendado por el autor |
| netprojects/Qwen-Concept-27B-MLX-bf16 | 27,36 B | no disponible | MLX safetensors bf16 | Apache-2.0 | Referencia de fidelidad; 54,7 GB |
| mlx-community/Qwen3.8-27B-4bit | 27 B (aprox.) | no disponible | MLX safetensors 4-bit | Apache-2.0 (heredada) | Modelo sin editar; 1.746 tokens de pensamiento de media y 55% de acierto en la prueba del autor |

No se dispone de datos para comparar con alternativas de otros formatos (GGUF, vLLM) ni con modelos de distinto tamano dentro de la misma categoria.

## Limitaciones y advertencias

- La edicion de pesos es una modificacion no supervisada del comportamiento: puede alterar respuestas en dominios distintos al razonamiento matematico, y el autor no documenta evaluaciones fuera de MATH-500.
- El 4,7% de discrepancia en el siguiente token respecto a bf16 implica divergencias reales en generaciones largas; para produccion con requisitos de fidelidad, el autor recomienda el build de 6 bits.
- La cuantizacion a 4 bits puede degradar tareas sensibles a precision numerica o a matices finos del lenguaje.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan tasas de alucinacion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar calidad fuera de los idiomas del modelo base.
- Longitud de contexto: no disponible, lo que impide planificar cargas con documentos largos.
- Soporte de tool calling: no confirmado en esta build.
- Licencia Apache-2.0 permite uso comercial, pero el `NOTICE` exige mantener la atribucion a Concept Country y Alibaba Cloud.
- Publicacion no oficial: NetProjects no esta afiliada a Concept Country ni a Alibaba Cloud, por lo que no hay garantia de soporte ni de mantenimiento.
- Solo Apple Silicon: no es desplegable en CUDA sin conversion previa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen-Concept-27B-MLX-4bit
- Modelo base: https://huggingface.co/ConceptCountry/qwen-concept-27b
- Build de 6 bits (recomendado): https://huggingface.co/netprojects/Qwen-Concept-27B-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen-Concept-27B-MLX-8bit
- Build bf16: https://huggingface.co/netprojects/Qwen-Concept-27B-MLX-bf16
- Modelo de referencia sin editar: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Paper de programacion en el espacio de pesos: https://concept.country/research/weight-space-programming
- Publicador: https://netprojects.com
