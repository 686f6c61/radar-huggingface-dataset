# czcollier/gemma-2-9b-literary-prose-dpo-GGUF

## Resumen

Gemma-2-9B Literary Prose (DPO) GGUF es la distribucion cuantizada en formato GGUF del fine-tune `czcollier/gemma-2-9b-literary-prose-dpo`, un ajuste de Gemma-2-9B de Google orientado exclusivamente a la generacion de prosa literaria. El autor, czcollier, parte del checkpoint base de Gemma 2 (9.241.705.984 parametros) y lo especializa mediante un calentamiento supervisado (SFT) seguido de Direct Preference Optimization con beta baja para suprimir los cliches de asistente conversacional y forzar un registro denso, en presente y de sintaxis periodica, propio de la narrativa de finales del siglo XIX y principios del XX.

El corpus de referencia declarado son autores como Conrad, Woolf, James, Melville, Fitzgerald y Joyce. El resultado no es un modelo de proposito general: es un generador de fragmentos narrativos que se invoca con una estructura de prompt muy concreta (`[SCENE SPINE]` seguido de `[PROSE]`) y que espera respuestas cortas, de entre 160 y 220 tokens, con una configuracion de muestreo especifica.

La relevancia practica del repositorio esta en el formato: al publicarse en GGUF con dos niveles de cuantizacion (Q4_K_M de ~5,76 GB y Q8_0 de ~9,83 GB), el modelo se puede ejecutar en local con llama.cpp, Ollama o LM Studio en hardware de consumo, algo imposible con los pesos BF16 originales. Es, por tanto, una pieza de nicho para escritura creativa estilizada, no una alternativa a modelos instruct generalistas. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2; detalles de capas no disponibles en la model card) |
| Parametros totales | 9.241.705.984 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; el checkpoint Gemma-2-9B del que deriva soporta 8.192 tokens |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (unicos ficheros publicados) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF; tamano total del repositorio 15,6 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2, un transformer decoder-only con atención por grupos (GQA) y logit soft-capping, tal como se deduce de la advertencia del autor sobre la necesidad de ajustar el muestreo por el soft-capping. El autor no documenta el numero de capas, dimensiones ocultas ni cabezas de atencion en la model card; el dato verificable es el recuento de parametros en safetensors: 9.241.705.984. El repositorio no incluye informacion sobre el volumen de tokens de entrenamiento ni sobre la composicion exacta del dataset.

El proceso de ajuste se describe en dos etapas: un calentamiento SFT y, a continuacion, una fase de Direct Preference Optimization con beta baja. El objetivo declarado es doble: eliminar los cliches conversacionales tipicos de los modelos instruct y empujar la salida hacia prosa densa en presente con estructura periodica. La unica guia de inferencia que proporciona el autor es la configuracion de muestreo (temperatura 0,68, min-p 0,08, top-k 40, penalizacion de repeticion 1,15, maximo 160-220 tokens) y una plantilla de prompt de dos bloques: `[SCENE SPINE]` con la situacion narrativa y `[PROSE]` como marcador de continuacion. No se documenta el uso de RLHF adicional, decodificacion especulativa ni tecnicas de atencion alternativa.

## Capacidades

- Generacion de prosa literaria en ingles con registro de narrativa tardovictoriana y modernista temprana.
- Continuacion de escenas a partir de una sinopsis breve (`[SCENE SPINE]`), manteniendo punto de vista y atmosfera.
- Supresion deliberada del tono de asistente: el modelo esta entrenado para no responder con listas, disclaimers ni formulas de cortesia.
- Escritura en presente narrativo y frases de periodo largo, con densidad descriptiva alta.
- Control de longitud via `num_predict` (rango recomendado de 160 a 220 tokens por pasada).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue: no disponible; la model card declara unicamente ingles.

## Casos de uso

- Generacion de borradores narrativos: se introduce una sinopsis de escena en `[SCENE SPINE]` y el modelo produce un parrafo de prosa atmosferica de 160-220 tokens, util como material de arranque para un taller de escritura o un proyecto de ficcion.
- Prototipado de estilo en videojuegos narrativos: el modelo puede generar descripciones de entorno y texto de ambientacion con voz consistente, siempre que el guion encaje en el registro de epoca y el idioma ingles.
- Pruebas de estilo controladas en investigacion: sirve como caso de estudio de hasta que punto un DPO de beta baja sobre un modelo de 9B desplaza el registro estilistico y elimina el sesgo conversacional.
- Generacion de texto de relleno para maquetacion editorial: maquetas de libro, pruebas de tipografia y composicion de pagina que necesitan parrafos de prosa realista, no lorem ipsum.
- Corpus sintetico para entrenamiento de clasificadores de estilo literario: generar ejemplos etiquetados como "prosa periodica densa" frente a prosa contemporanea.
- Demostracion de despliegue local en GGUF: ejemplo didactico de cuantizacion Q4_K_M frente a Q8_0 y de su impacto en calidad de prosa, ejecutable en una GPU de consumo.
- Experimentos de muestreo: por su sensibilidad declarada al soft-capping y a min-p, es util para comparar estrategias de decodificacion sobre una misma escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica cuantitativa, y tampoco se aportan evaluaciones humanas del estilo generado. El unico dato de rendimiento objetivo es el tamano de los ficheros cuantizados (5,76 GB en Q4_K_M y 9,83 GB en Q8_0).

## Requisitos de hardware

- VRAM estimada para Q4_K_M (~5,76 GB de pesos): en torno a 7-8 GB en ejecucion con contexto moderado, dependiendo de la implementacion y del tamano de la cache KV.
- VRAM estimada para Q8_0 (~9,83 GB de pesos): en torno a 11-12 GB en ejecucion, con riesgo de desbordamiento a RAM en tarjetas de 12 GB si se usa contexto largo.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080 y RTX 4090 ejecutan Q4_K_M con holgura; Q8_0 encaja con comodidad a partir de 16 GB.
- GPU de datacenter: A100, H100 y L40S no son necesarias para este tamano; su uso solo se justifica para servir muchas peticiones concurrentes.
- Opciones de despliegue: llama.cpp, Ollama (con el `Modelfile` incluido en la model card), LM Studio y cualquier runtime compatible con GGUF. El repositorio esta marcado como `endpoints_compatible`.
- Latencia y throughput: no disponibles; el autor no publica mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| czcollier/gemma-2-9b-literary-prose-dpo-GGUF | 9,24 B | No especificado (8.192 en Gemma-2-9B) | GGUF (Q4_K_M, Q8_0) | Gemma | Prosa literaria de epoca, solo ingles |
| google/gemma-2-9b-it | 9,24 B | 8.192 | Safetensors, GGUF (comunidad) | Gemma | Asistente instruct generalista |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 131.072 | Safetensors, GGUF | Llama 3.1 Community | Asistente instruct generalista, multilingue |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 | Safetensors, GGUF | Apache 2.0 | Asistente instruct generalista |

Las cifras de parametros y contexto de los modelos comparativos son datos publicos de sus respectivas fichas, no resultados medidos frente a este fine-tune. No existen benchmarks comparativos disponibles que permitan situar la calidad de prosa de este modelo frente a las alternativas.

## Limitaciones y advertencias

- Modelo de un solo idioma (ingles); no se ha entrenado ni evaluado en castellano.
- No es un modelo instruct: no sigue instrucciones generales, no responde preguntas factuales y no soporta tool calling. Usarlo como asistente producira resultados deficientes.
- El autor no documenta el dataset de SFT ni el conjunto de preferencias, por lo que se desconocen los sesgos de estilo, epoca y punto de vista heredados del corpus.
- Riesgo de alucinacion alto en cualquier uso que no sea narrativo: el modelo esta optimizado para generar prosa plausible, no para ser factual.
- La salida esta fuertemente condicionada a la plantilla `[SCENE SPINE]` / `[PROSE]` y a los parametros de muestreo indicados; fuera de esa configuracion la estabilidad sintactica puede degradarse por el logit soft-capping de Gemma 2.
- La licencia Gemma impone las Gemma Terms of Use, con obligaciones y restricciones de uso que deben revisarse antes de cualquier explotacion comercial.
- Repositorio sin descargas ni likes registrados y con una unica revision (creado y actualizado el mismo dia), sin senales de validacion por parte de la comunidad.
- No hay garantia de soporte ni mantenimiento por parte del autor; el proyecto debe considerarse experimental.
- La cuantizacion Q4_K_M introduce perdida de precision respecto a Q8_0; el impacto concreto en la calidad de la prosa no esta medido en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/czcollier/gemma-2-9b-literary-prose-dpo-GGUF
- Modelo base (fine-tune sin cuantizar): https://huggingface.co/czcollier/gemma-2-9b-literary-prose-dpo
- Gemma 2 (modelo original de Google): https://huggingface.co/google/gemma-2-9b
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai

No se han encontrado en la busqueda web enlaces relevantes al modelo, papers, blogs ni demos adicionales; los resultados devueltos no guardan relacion con este repositorio.
