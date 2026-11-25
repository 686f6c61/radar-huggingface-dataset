# PageEcho/Hy-MT3-1.8B-MLX-4bit

## Resumen

Hy-MT3-1.8B-MLX-4bit es una conversión a 4 bits en formato MLX del modelo de traducción multilingüe tencent/Hy-MT3-1.8B, desarrollado por Tencent. La conversión la firma el usuario PageEcho y está pensada para ejecutar traducción en dispositivo (on-device) dentro de la aplicación iOS PageEcho. El modelo base emplea la arquitectura `hunyuan_v1_dense`, con 1.791.080.448 parámetros totales (aproximadamente 1,8 mil millones) y un pipeline declarado de traducción.

El interés de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de traducción de casi 1,8B parámetros en hardware Apple Silicon mediante MLX, con cuantización de 4 bits, grupo de tamaño 64 y cuantización afín, generada con mlx-lm 0.32.2. El repositorio ocupa 1,0 GB y los pesos se distribuyen en formato safetensors.

La información publicada es limitada: no consta pipeline asignado en los metadatos de Hugging Face, ni idiomas declarados, ni resultados de benchmarks, ni detalles sobre datos de entrenamiento del modelo base. La model card sí especifica parámetros de muestreo recomendados y una advertencia operativa relevante: traducir un párrafo por petición, ya que con varios párrafos en una sola petición el modelo de 1,8B puede omitir parte del contenido intermedio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso, familia Hunyuan de Tencent) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX, group size 64, cuantizacion afín); el modelo base admite otras cuantizaciones no documentadas aquí |
| Idiomas soportados | no disponible (el modelo base se describe como multilingüe, sin listado concreto) |
| Licencia | Apache License 2.0 (según model card; los metadatos de Hugging Face no la declaran) |
| Formato de pesos | safetensors (MLX), repositorio de 1,0 GB |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura `hunyuan_v1_dense`, un transformer denso de la familia Hunyuan de Tencent, con 1.791.080.448 parámetros. Esta conversión no modifica la arquitectura: aplica cuantización de 4 bits con MLX (`mlx_lm convert --q-bits 4`, group size 64, cuantización afín) sobre los pesos originales. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineación.

La única modificación documentada respecto al modelo original, además de los pesos, afecta a `tokenizer.json`: los saltos de línea dentro del tercer patrón `Split` del pre-tokenizador se escriben como secuencias de escape `\r` / `\n` en lugar de caracteres literales. La expresión regular es equivalente y la librería `tokenizers` de Hugging Face produce los mismos tokens con ambos ficheros, pero swift-transformers 1.1.9 interpretaba de forma distinta el CR LF literal, lo que alteraba los tokens del prompt en iOS. Es un ajuste de compatibilidad para el runtime objetivo, no un cambio semántico del tokenizador.

## Capacidades

- Traducción multilingüe: el pipeline declarado en la model card es `translation`; el modelo base se presenta como modelo de traducción multilingüe de Tencent.
- Traducción en dispositivo: la conversión está optimizada para ejecutarse localmente en Apple Silicon mediante MLX, sin depender de servicios en la nube.
- Generación de texto condicionada a instrucciones de traducción, con parámetros de muestreo recomendados: temperature 0.7, top_p 0.6, top_k 20, repetition_penalty 1.05.
- Sin prompt de sistema por defecto: la model card indica explícitamente que no hay system prompt predefinido.
- Procesamiento por párrafos: el modelo está pensado para traducir un párrafo por petición.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Traducción en dispositivo dentro de apps iOS: es el caso de uso declarado por el autor; el modelo se integra en la app PageEcho y se ejecuta localmente con MLX, lo que evita enviar texto del usuario a servidores externos y permite funcionar sin conexión.
- Traducción de párrafos en aplicaciones de lectura: la recomendación de traducir un párrafo por petición encaja con lectores de artículos o libros que envían cada párrafo como unidad independiente, manteniendo la calidad y evitando omisiones.
- Traducción de correspondencia y mensajes cortos: con temperature 0.7, top_p 0.6 y repetition_penalty 1.05, el modelo es adecuado para traducir correos, mensajes y notas de longitud moderada en un dispositivo personal.
- Prototipado de pipelines de traducción en macOS: al ser una conversión MLX, permite experimentar con un modelo de traducción de 1,8B parámetros en un Mac con Apple Silicon sin necesidad de GPU dedicada ni de infraestructura de servidor.
- Traducción con requisitos de privacidad: sectores como sanidad, legal o administración pueden beneficiarse de un modelo que procesa el texto íntegramente en el dispositivo del usuario, sin transferencia de datos a terceros.
- Evaluación comparativa de cuantizaciones: el repositorio sirve como referencia para medir la pérdida de calidad de una cuantización de 4 bits frente al modelo base tencent/Hy-MT3-1.8B en tareas de traducción, usando los mismos prompts y ajustes de muestreo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio de pesos ocupa 1,0 GB en cuantización de 4 bits; la memoria unificada necesaria para inferencia será superior a esa cifra por el estado del runtime, las cachés de atención y el tokenizador, aunque no se dispone de una medición publicada.
- GPU recomendadas: al ser una conversión MLX, el objetivo son chips de Apple (series M1, M2, M3, M4 y posteriores) con memoria unificada; no está pensada para GPU NVIDIA.
- GPU de consumo: cabe en equipos Apple Silicon de gama consumer con memoria unificada suficiente; no se dispone de cifras concretas de memoria mínima verificadas.
- Opciones de despliegue: MLX (mlx-lm 0.32.2 o superior) y swift-transformers 1.1.9 en el lado iOS; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para estos pesos MLX.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hy-MT3-1.8B-MLX-4bit (esta ficha) | 1.791.080.448 | no disponible | Apache 2.0 (según model card) | safetensors MLX 4 bits | Conversión para Apple Silicon, enfocada a traducción en dispositivo |
| tencent/Hy-MT3-1.8B | 1.791.080.448 (según pesos de esta conversión) | no disponible | Apache 2.0 (según model card de la conversión) | no disponible | Modelo base original; sin cuantizar, pensado para otros runtimes |
| Alternativas de traducción de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Omisión de contenido: la model card advierte que, si se envían varios párrafos en una sola petición, el modelo de 1,8B puede saltarse parte del contenido intermedio; se recomienda traducir un párrafo por petición.
- Sin prompt de sistema por defecto: hay que construir el prompt de traducción explícitamente; no se debe asumir un comportamiento predefinido.
- Pérdida por cuantización: la conversión a 4 bits puede degradar la calidad respecto al modelo base original; no se han publicado evaluaciones comparativas que cuantifiquen esa pérdida.
- Idiomas no documentados: no consta un listado de idiomas soportados ni pares de traducción verificados.
- Contexto no documentado: se desconoce la longitud máxima de contexto del modelo base y de esta conversión.
- Dependencia del runtime: los pesos están en formato MLX y el tokenizador se ha ajustado para swift-transformers 1.1.9; otros runtimes pueden requerir conversiones adicionales.
- Licencia: la model card declara Apache 2.0 con copyright de Tencent, pero los metadatos de Hugging Face no la exponen; conviene verificar `LICENSE.txt` antes de un uso comercial.
- Sesgos y alucinaciones: no se dispone de documentación sobre sesgos conocidos ni sobre tasas de alucinación en tareas de traducción.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin pipeline asignado en los metadatos; es un artefacto derivado de un tercero, no una publicación oficial de Tencent.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/PageEcho/Hy-MT3-1.8B-MLX-4bit
- Modelo base: https://huggingface.co/tencent/Hy-MT3-1.8B
- MLX: https://github.com/ml-explore/mlx
