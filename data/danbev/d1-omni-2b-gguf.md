# danbev/d1-Omni-2B-GGUF

## Resumen

d1-Omni-2B es un modelo de decisión multimodal desarrollado por Liquid AI, construido sobre LFM3-Omni-2B, que acepta entradas de texto, imagen, audio y vídeo y devuelve respuestas calibradas en un único pase hacia delante, sin generar tokens de forma autorregresiva. Con aproximadamente 2.170 millones de parámetros (1.728.801.600 según los pesos en safetensors del repositorio cuantizado), está diseñado para tareas de enrutamiento, verificación y clasificación sobre entradas multimodales, incluidas preguntas habladas.

El repositorio analizado, `danbev/d1-Omni-2B-GGUF`, es una conversión automática al formato GGUF del modelo original de LiquidAI, pensada para su ejecución con llama.cpp (versión `b11960` o superior) y con la aplicación Llama. Incluye un fichero `mmproj` que contiene los codificadores de visión y audio, y expone el modelo a través de un endpoint específico `/v1/systemone` en lugar del flujo habitual de chat por generación de tokens.

Su relevancia radica en el enfoque: en lugar de un modelo generativo convencional, ofrece una arquitectura de decisión que procesa la pregunta completa en un solo lote, lo que impone requisitos concretos de configuración (`-b` y `-ub` deben cubrir el estado y el material multimedia) y lo aleja de los casos de uso de conversación libre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión multimodal construido sobre LFM3-Omni-2B; incluye codificador de visión y codificador de audio en el `mmproj`) |
| Parámetros totales | 1.728.801.600 (pesos safetensors del repo GGUF); ~2,17 B según la documentación de Liquid AI |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible; la entrada se procesa en un único lote y `-b`/`-ub` deben dimensionarse para cubrir el estado y el material multimedia (por defecto `-ub 512` rechaza entradas largas) |
| Tipos de cuantización | GGUF, con variantes BF16 y Q8_0 con los mismos tensores que los GGUF oficiales de LiquidAI; otras cuantizaciones no disponibles en la información |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como `other` en Hugging Face), enlazada en el repo de LiquidAI |
| Formato de pesos | GGUF (incluye `mmproj` con codificadores de visión y audio) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que deriva de LFM3-Omni-2B y de que se trata de un modelo de decisión: recibe texto, imagen, audio y vídeo y produce una respuesta calibrada en un único pase hacia delante, sin decodificación autorregresiva de tokens. El paquete GGUF separa los codificadores de modalidad en un fichero `mmproj` que integra tanto el codificador de visión como el de audio.

No se han publicado en la información proporcionada datos sobre volumen de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas concretas más allá del propio mecanismo de decisión en un solo pase. La conversión a GGUF es automática, realizada con la herramienta `ggml-org/convert`, y las variantes BF16 y Q8_0 conservan los mismos tensores que las publicadas por LiquidAI.

## Capacidades

- Decisión multimodal: procesa texto, imagen, audio y vídeo como entrada y devuelve una respuesta calibrada en un solo pase, sin generación token a token.
- Entrada de audio: las preguntas habladas pasan por el mismo pase que el texto y las imágenes, de modo que una petición de voz puede enrutarse, verificarse o responderse igual que una escrita.
- Entrada de vídeo: soportada, con la dependencia de que `ffmpeg` esté disponible en el `PATH`.
- Enrutamiento y verificación: orientado a tareas de clasificación, comprobación y direccionamiento de peticiones.
- Integración por API: se consume mediante el endpoint `/v1/systemone` del servidor de llama.cpp, no mediante el flujo de chat generativo convencional.
- Capacidades multilingües: no disponibles en la información.
- Tool calling / function calling: no disponible en la información.
- Modo de razonamiento extendido o thinking mode: no disponible en la información.

## Casos de uso

- Enrutamiento de peticiones en un asistente multimodal: el modelo recibe texto, audio o imagen y decide a qué servicio o flujo derivar la petición en un único pase, lo que reduce la latencia frente a un modelo generativo que deba emitir una respuesta textual.
- Verificación de contenido en pipelines de moderación: dada una imagen o un clip junto con una pregunta de comprobación, devuelve una respuesta calibrada que puede umbralizarse para aceptar o rechazar el contenido.
- Atención al cliente por voz: una consulta hablada se procesa en el mismo pase que una escrita, permitiendo clasificar la intención del usuario y dirigirla al departamento adecuado sin transcripción intermedia explícita.
- Control de calidad sobre capturas y vídeo: con `ffmpeg` disponible, se pueden analizar clips cortos para comprobar condiciones concretas (presencia de un objeto, cumplimiento de un formato) y obtener una decisión binaria o etiquetada.
- Clasificación de documentos escaneados: al aceptar imagen y texto de forma conjunta, sirve para decidir la categoría o validez de un documento a partir de su contenido visual y de una pregunta formulada en texto.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF y ejecutarse con llama.cpp, puede integrarse en entornos sin GPU de datacenter para tareas de decisión de baja latencia sobre entradas multimodales.
- Automatización de triaje en aplicaciones de accesibilidad: preguntas formuladas por voz se evalúan y responden en el mismo pase, lo que simplifica la arquitectura de aplicaciones que ya reciben audio del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa a partir del tamaño del repo (6,2 GB), la variante Q8_0 ronda ese orden de magnitud y BF16 requiere aproximadamente el doble; no se especifican cifras por cuantización en la información.
- GPU recomendadas: no disponibles en la información.
- GPU de consumo: no se confirma compatibilidad con GPU de consumo en la información; el tamaño del repo (6,2 GB) sugiere que las variantes cuantizadas podrían caber en GPUs con 8-12 GB de VRAM, pero es una estimación, no un dato publicado.
- Opciones de despliegue: llama.cpp `b11960` o superior, mediante `llama serve -hf danbev/d1-Omni-2B-GGUF -b 8192 -ub 8192`, o la aplicación Llama. El endpoint de inferencia es `/v1/systemone`.
- Requisito de configuración: al procesarse la pregunta en un solo lote, `-b` y `-ub` deben dimensionarse para contener el estado y el material multimedia; con el valor por defecto `-ub 512` las entradas largas se rechazan y las imágenes reciben un presupuesto de tokens menor, lo que altera las respuestas.
- Latencia y throughput: no disponibles en la información.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| d1-Omni-2B (este repo) | ~2,17 B (1.728.801.600 en safetensors) | no disponible | texto, imagen, audio, vídeo | lfm1.0 | GGUF |
| LiquidAI/d1-Omni-2B (original) | ~2,17 B | no disponible | texto, imagen, audio, vídeo | lfm1.0 | safetensors y GGUF oficiales |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de modelos comparables adicionales con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo generativo de chat: devuelve decisiones calibradas en un solo pase y debe consumirse mediante `/v1/systemone`; usarlo como modelo conversacional convencional no es el uso previsto.
- Configuración sensible: con `-ub 512` por defecto, las entradas largas se rechazan y las imágenes reciben menos tokens, lo que cambia las respuestas; es necesario ajustar `-b` y `-ub` al tamaño real de las entradas.
- Dependencia externa para vídeo: requiere `ffmpeg` en el `PATH`; sin él, la entrada de vídeo no funciona.
- Versión mínima de llama.cpp: necesita `b11960` o superior; versiones anteriores pueden fallar al cargar el modelo.
- Conversión automática: el repo se ha generado con `ggml-org/convert`, sin validación manual documentada más allá de la equivalencia de tensores con los GGUF oficiales en BF16 y Q8_0.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe ni calidad por idioma.
- Licencia lfm1.0: es una licencia `other` con términos propios; debe revisarse el texto enlazado antes de cualquier uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al tratarse de un modelo de decisión, los errores se manifiestan como clasificaciones o verificaciones incorrectas, potencialmente con alta confianza calibrada.
- Contexto no especificado: al no publicarse la longitud de contexto, el dimensionamiento de `-b`/`-ub` debe hacerse empíricamente por caso de uso.

## Enlaces

- Repositorio GGUF analizado: https://huggingface.co/danbev/d1-Omni-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-Omni-2B
- GGUF oficiales de LiquidAI: https://huggingface.co/LiquidAI/d1-Omni-2B-GGUF
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/models/d1-omni-2b
- Licencia: https://huggingface.co/LiquidAI/d1-Omni-2B/blob/main/LICENSE
- Pull request del endpoint `/v1/systemone` en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31275
- Herramienta de conversión: https://github.com/ggml-org/convert
- Aplicación Llama: https://llama.app
