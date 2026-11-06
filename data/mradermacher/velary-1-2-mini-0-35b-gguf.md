# mradermacher/Velary-1.2-Mini-0.35B-GGUF

## Resumen

Velary-1.2-Mini-0.35B-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo Velary-1.2-Mini-0.35B, publicado por el usuario mradermacher en Hugging Face. El modelo original lo desarrolla AuroraSystem y se distribuye bajo el identificador AuroraSystem/Velary-1.2-Mini-0.35B. Se trata de un modelo pequeno, con 354.483.968 parametros totales (aproximadamente 0,35 mil millones), orientado a uso conversacional segun las etiquetas del repositorio.

La relevancia de esta publicacion es practica: al ofrecer multiples niveles de cuantizacion GGUF (desde Q2_K hasta F16, incluyendo variantes IQ4_XS), permite ejecutar un modelo de 0,35B en hardware muy modesto, incluidas CPU y GPUs de consumo con poca VRAM. El repositorio ocupa 3,3 GB, lo que refleja el conjunto completo de ficheros cuantizados, no un unico peso.

No se dispone de informacion publica en la ficha proporcionada sobre arquitectura interna, datos de entrenamiento, licencia o idiomas soportados del modelo original. La model card de esta publicacion se limita a indicar que son cuantizaciones estaticas del modelo base, sin aportar especificaciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 354.483.968 (aproximadamente 0,35B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base en la documentacion disponible. Por el tamano (0,35B parametros) y la etiqueta "conversational", se trata de un modelo pequeno de proposito general, pero no se confirma si emplea un transformer denso clasico, una variante MoE u otra arquitectura. Tampoco se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Respecto a esta publicacion concreta, la model card indica que son cuantizaciones estaticas generadas con un proceso de conversion desde el formato Hugging Face (convert_type: hf) y con quantize_version 2. Los metadatos confirman que se ha aplicado cuantizacion de tensores de salida (output_tensor_quantised: 1). No se documentan innovaciones tecnicas adicionales ni optimizaciones de decodificacion.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational", por lo que su uso previsto es el dialogo multi-turno.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que puede desplegarse detras de endpoints de inferencia compatibles con el ecosistema de Hugging Face.
- Ejecucion en CPU y GPU de baja capacidad: gracias a las cuantizaciones GGUF de 2 a 8 bits, es viable en entornos con recursos limitados.
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling o agentes: no disponibles segun la informacion proporcionada.
- Soporte multilingue: no disponible.

## Casos de uso

- Prototipado rapido de chatbots: al ser un modelo de 0,35B en GGUF, permite montar un asistente conversacional local en minutos con llama.cpp u Ollama, sin necesidad de GPU dedicada, para validar flujos de producto antes de escalar a modelos mayores.
- Inferencia en dispositivos de borde: la cuantizacion Q4_K_M o Q5_K_M reduce el peso a unos cientos de MB, lo que hace posible desplegarlo en mini-PC, Raspberry Pi de gama alta o portatiles sin GPU para tareas de generacion de texto sencillas.
- Filtrado y clasificacion de texto en pipelines: un modelo pequeno puede usarse como primer nivel de triaje (por ejemplo, clasificar tickets de soporte o resumir mensajes cortos) antes de derivar a un modelo mayor, reduciendo coste por token.
- Entornos de pruebas y CI: sirve como modelo de referencia para validar integraciones con servidores compatibles con la API de OpenAI (endpoints_compatible) sin consumir cuotas de proveedores externos.
- Educacion y experimentacion: util para demostrar el efecto de distintas cuantizaciones (Q2_K frente a Q8_0) sobre la calidad de salida en un modelo pequeno, con un coste computacional minimo.
- Generacion de texto offline en aplicaciones de escritorio: integrable en herramientas locales que requieran un modelo embebido sin conexion, siempre que la calidad exigida sea moderada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 0,35B parametros, las cuantizaciones de 4 bits ocupan aproximadamente 200-250 MB de pesos; F16 ronda los 700 MB. La VRAM total necesaria depende del contexto y del backend, pero en la practica es inferior a 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tambien funciona en CPU. No se requiere A100 ni H100.
- GPU de consumo: cabe holgadamente en GTX 1650, RTX 3050, RTX 4060 y superiores; tambien en iGPUs modernas con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de OpenAI (por la etiqueta endpoints_compatible) y cualquier runtime que soporte GGUF.
- Latencia y throughput: no disponibles; al tratarse de un modelo de 0,35B, se espera una latencia baja en hardware moderno, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Velary-1.2-Mini-0.35B-GGUF | 0,35B | no disponible | no disponible | GGUF | Cuantizaciones estaticas de un modelo de AuroraSystem |
| Qwen2.5-0.5B-Instruct | 0,5B | 32K (segun documentacion publica del modelo) | Apache 2.0 (segun documentacion publica) | safetensors, GGUF | Alternativa consolidada de tamano similar |
| SmolLM2-360M-Instruct | 0,36B | 8K (segun documentacion publica) | Apache 2.0 (segun documentacion publica) | safetensors, GGUF | Modelo pequeno orientado a dispositivos de borde |
| TinyLlama-1.1B-Chat | 1,1B | 2K (segun documentacion publica) | Apache 2.0 (segun documentacion publica) | safetensors, GGUF | Algo mayor, con mas comunidad y herramientas |

La comparativa se limita a parametros y disponibilidad, ya que no hay datos de rendimiento de Velary-1.2-Mini-0.35B. Los datos de los modelos alternativos provienen de su documentacion publica y deben verificarse en sus respectivas fichas.

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan sesgos, datos de entrenamiento ni evaluaciones, lo que impide valorar riesgos de alucinacion o sesgo de forma fundamentada.
- Licencia no especificada: no se confirma si el uso comercial esta permitido; conviene contactar con AuroraSystem antes de integrarlo en produccion.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en otros idiomas distintos del que se uso en el entrenamiento.
- Modelo de 0,35B: la capacidad de razonamiento, el conocimiento factual y la coherencia en contextos largos seran limitados en comparacion con modelos de mayor tamano; el riesgo de alucinacion en dominios especializados es alto.
- Cuantizaciones agresivas: las variantes Q2_K y Q3_K_S pueden degradar notablemente la calidad de salida; para uso serio se recomienda Q5_K_M o superior.
- Contexto desconocido: al no publicarse la longitud de contexto, no debe asumirse una ventana amplia en aplicaciones de dialogo largo.
- Repositorio sin descargas ni likes en el momento de la consulta: senal de escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face de las cuantizaciones: https://huggingface.co/mradermacher/Velary-1.2-Mini-0.35B-GGUF
- Modelo base: https://huggingface.co/AuroraSystem/Velary-1.2-Mini-0.35B
