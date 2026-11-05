# mradermacher/24game-sft-7b-GGUF

## Resumen

`mradermacher/24game-sft-7b-GGUF` es una coleccion de cuantizaciones GGUF del modelo `couplefire/24game-sft-7b`, un modelo de lenguaje de aproximadamente 7.615 millones de parametros (7,6 B) afinado mediante SFT (supervised fine-tuning) para la resolucion del juego matematico "24 game". El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de versiones GGUF de la comunidad, y esta pensado para su uso con llama.cpp y derivados (Ollama, LM Studio, etc.).

El modelo base es un transformer denso de tipo decoder-only, con pesos en formato safetensors en su version original y convertido aqui a GGUF en hasta doce variantes de cuantizacion (desde Q2_K de 3,1 GB hasta f16 de 15,3 GB). El repositorio no incluye informacion sobre la longitud de contexto, la composicion del dataset de entrenamiento, el proceso de alineamiento ni la licencia, por lo que varios apartados de esta ficha quedan marcados como "no disponible".

Su relevancia es acotada: se trata de un modelo especializado y de nicho, con solo 29 descargas y sin likes en el momento de la consulta, orientado a experimentar con razonamiento aritmetico y resolucion de puzzles. No es un modelo de proposito general y no deberia evaluarse como tal. La existencia de cuantizaciones GGUF permite ejecutarlo en hardware de consumo, lo que facilita la experimentacion local con tareas de razonamiento matematico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (según modelo base; detalles no disponibles) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (original del modelo base en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `couplefire/24game-sft-7b` mas alla de que se trata de un transformer denso de aproximadamente 7,6 B de parametros, con pesos en safetensors y compatible con la libreria `transformers`. El sufijo "sft" en el nombre indica que el modelo fue afinado con supervisión (supervised fine-tuning) sobre el modelo base, presumiblemente con ejemplos del juego "24 game" (dados cuatro numeros, obtener 24 mediante operaciones aritmeticas). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

La contribucion de este repositorio es exclusivamente la cuantizacion: mradermacher ha generado cuantizaciones estaticas (sin imatrix) del modelo original mediante el pipeline habitual de conversion a GGUF. La model card indica explicitamente que las cuantizaciones ponderadas por imatrix no estaban disponibles en el momento de la publicacion. No se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, MoE, etc.).

## Capacidades

- Generacion de texto en ingles y resolucion de problemas aritmeticos del tipo "24 game": dado un conjunto de cuatro numeros, producir una expresion con las cuatro operaciones basicas que de como resultado 24.
- Razonamiento matematico de un solo paso y multi-paso en el dominio del puzzle aritmetico.
- Conversacion basica (etiqueta `conversational` en los metadatos del repositorio).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite su despliegue en infraestructuras de inferencia compatibles con la API de Hugging Face.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso general: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre razonamiento aritmetico: utilizar el modelo como banco de pruebas para estudiar como un LLM de 7,6 B resuelve el juego 24, comparando tasas de exito entre cuantizaciones (Q4_K_M frente a Q8_0) y analizando el impacto de la cuantizacion en tareas de razonamiento exacto.
- Generacion de datasets sinteticos de puzzles: emplear el modelo para producir expresiones candidatas del 24 game que luego se filtran y verifican programaticamente, ampliando corpus de entrenamiento para modelos mayores.
- Evaluacion de tecnicas de cuantizacion: al ofrecer doce variantes del mismo modelo, sirve para medir la degradacion de calidad (perplejidad y precision en el puzzle) a lo largo de la escala Q2_K a f16 en un caso de uso con respuesta verificable objetivamente.
- Despliegue local en estaciones de trabajo: las variantes Q4_K_S y Q4_K_M (4,6 y 4,8 GB) caben en GPU de consumo con 8 GB de VRAM y permiten ejecutar el modelo con llama.cpp u Ollama sin conexion.
- Educacion y demostraciones: mostrar en un aula o taller como un modelo pequeno especializado resuelve un problema combinatorio concreto, ilustrando las diferencias entre un modelo de proposito general y uno afinado para una tarea.
- Componente en pipelines de verificacion: integrar el modelo como generador de hipotesis dentro de un sistema que valide con un interprete aritmetico las expresiones propuestas, usando el modelo solo como motor de propuestas y el verificador como filtro de correccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto, estimacion a partir del tamano de los ficheros GGUF):
  - Q2_K (3,1 GB): aproximadamente 4 GB de VRAM.
  - Q4_K_S / Q4_K_M (4,6 / 4,8 GB): aproximadamente 6-7 GB de VRAM.
  - Q5_K_M (5,5 GB): aproximadamente 7-8 GB de VRAM.
  - Q6_K (6,4 GB): aproximadamente 8-9 GB de VRAM.
  - Q8_0 (8,2 GB): aproximadamente 10-11 GB de VRAM.
  - f16 (15,3 GB): aproximadamente 17-18 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para las variantes Q4 a Q8; A100 o H100 no son necesarias para este tamano, aunque permiten servir varias instancias en paralelo.
- Cabe en GPU de consumo: si, desde tarjetas de 6-8 GB con cuantizaciones Q2_K a Q4_K_M; las variantes Q6_K y Q8_0 requieren 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con la API de Hugging Face (el repositorio esta marcado como `endpoints_compatible`). Al ser un GGUF puro, no es directamente compatible con vLLM ni TGI sin reconversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| 24game-sft-7b (este) | 7,6 B | no disponible | 24 game / aritmetica | no disponible | GGUF, safetensors |
| Qwen2.5-Math-7B | 7,6 B | 4.096 tokens (segun documentacion publica del modelo) | Matematicas generales | Apache 2.0 (segun su model card) | safetensors, GGUF (comunidad) |
| DeepSeek-Math-7B | 7 B | 4.096 tokens (segun documentacion publica del modelo) | Razonamiento matematico | licencia propia de DeepSeek | safetensors |

La comparacion con alternativas es orientativa: no se dispone de datos de rendimiento del modelo 24game-sft-7b que permitan confrontarlo cuantitativamente con Qwen2.5-Math-7B o DeepSeek-Math-7B. La diferencia principal es el grado de especializacion: los modelos citados cubren matematicas en general, mientras que este esta afinado para un unico puzzle.

## Limitaciones y advertencias

- Modelo de nicho: afinado especificamente para el 24 game; su rendimiento en tareas generales de lenguaje, codigo o conocimiento es desconocido y probablemente degradado respecto a su modelo base.
- Idiomas: solo se declara ingles; no hay evidencia de capacidades en castellano ni en otros idiomas.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base `couplefire/24game-sft-7b` antes de cualquier uso en produccion.
- Riesgo de alucinacion: elevado en tareas fuera de su dominio; incluso dentro del 24 game, las expresiones generadas deben validarse con un interprete aritmetico, ya que el modelo puede producir resultados incorrectos con apariencia de plausibilidad.
- Longitud de contexto desconocida: no se puede planificar su uso en conversaciones largas o documentos extensos sin verificar experimentalmente el limite real.
- Cuantizaciones de baja calidad: las variantes Q2_K y Q3_K pueden degradar significativamente la precision en tareas de razonamiento exacto; para este tipo de tareas se recomienda Q5_K_M o superior.
- Adopcion minima: 29 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni validacion independiente; no hay garantia de calidad mas alla de la que el autor del modelo base haya documentado.
- Sin cuantizaciones imatrix: la model card indica que no estaban disponibles, por lo que las variantes estaticas pueden ofrecer peor relacion calidad/tamano que las ponderadas.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones: https://huggingface.co/mradermacher/24game-sft-7b-GGUF
- Modelo base: https://huggingface.co/couplefire/24game-sft-7b
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#24game-sft-7b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
