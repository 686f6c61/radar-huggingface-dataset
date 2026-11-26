# EryriLabs/EryriLabs-cymraeg-4B-GGUF

## Resumen

EryriLabs-cymraeg-4B-GGUF es la distribucion cuantizada en formato GGUF del modelo EryriLabs-cymraeg-4B, un ajuste fino en gales (cymraeg) construido sobre Gemma 4 E4B. Lo desarrolla EryriLabs y su proposito es ofrecer un modelo conversacional especializado en lengua galesa que pueda ejecutarse localmente con llama.cpp, manteniendo un rendimiento razonable en tareas de razonamiento y uso practico del idioma. La relevancia actual reside en que el gales es un idioma de bajos recursos y este tipo de ajustes permiten disponer de un asistente linguistico funcional sin depender de servicios en la nube.

El repositorio contiene un unico fichero GGUF en cuantizacion Q8_0 de 8,7 GB, convertido con llama.cpp b12019. Aunque la etiqueta del modelo indica "4B", los pesos en safetensors del modelo base suman 8.134.102.314 parametros, por lo que conviene tratar el nombre comercial como etiqueta de familia y no como recuento exacto de parametros. El contexto declarado en el ejemplo de despliegue es de 16.384 tokens (`-c 16384`).

La licencia es CC-BY-NC-4.0, lo que restringe el uso a fines no comerciales. El modelo esta pensado para inferencia local en llama.cpp y para conversacion en gales e ingles, con soporte de plantilla tipo Jinja y un modo de razonamiento que el autor desactiva explicitamente en el comando de ejemplo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 E4B; detalles no disponibles) |
| Parametros totales | 8.134.102.314 (pesos safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 16.384 tokens (valor usado en el ejemplo de despliegue del autor) |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado) |
| Idiomas soportados | gales (cy), ingles (en) |
| Licencia | CC-BY-NC-4.0 (solo uso no comercial) |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un ajuste fino de Gemma 4 E4B, por lo que hereda la arquitectura transformer de la familia Gemma 4. No se detallan en la informacion proporcionada el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. El repositorio GGUF es unicamente una conversion de pesos: la card remite al repositorio principal (`EryriLabs/EryriLabs-cymraeg-4B`) para consultar datos de entrenamiento, resultados y debilidades conocidas.

Respecto al entrenamiento, no se especifican el volumen de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. La unica informacion tecnica concreta es el proceso de conversion: fichero Q8_0 generado con llama.cpp b12019. El autor menciona que el modelo se evaluo con una herramienta propia, CymraegBench v0.1, lo que sugiere un enfasis en evaluacion linguistica del gales mas que en benchmarks academicos estandar.

## Capacidades

- Generacion de texto conversacional en gales e ingles.
- Razonamiento basico: el autor reporta una puntuacion de 53,26 en la componente de razonamiento de CymraegBench v0.1.
- Uso practico del gales: puntuacion de 61,67 en la componente "practical Welsh" de la misma evaluacion.
- Soporte de plantilla de chat compatible con Jinja (`--jinja` en llama-server).
- Modo de razonamiento configurable (el autor lo desactiva con `--reasoning off` en el ejemplo).
- Inferencia local mediante llama.cpp, sin dependencia de API externa.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Asistente conversacional en gales para uso personal o educativo: el modelo puede mantener dialogos multi-turno con hasta 16.384 tokens de contexto, adecuado para sesiones de practica linguistica o tutoria.
- Correccion y mejora de textos en gales: dado su enfasis en "practical Welsh", puede emplearse para revisar redaccion, sugerir formulaciones mas naturales y detectar calcos del ingles.
- Traduccion asistida ingles-gales: al soportar ambos idiomas, sirve como apoyo en flujos de traduccion donde se requiera una primera version revisable por un linguista.
- Preservacion y divulgacion del patrimonio linguistico: integrable en aplicaciones culturales o educativas que necesiten generacion de texto en gales sin conexion a servicios cloud.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente con llama.cpp, permite procesar textos en gales sin enviar datos a terceros.
- Prototipado de aplicaciones NLP para idiomas de bajos recursos: util como base para experimentos academicos sobre ajuste fino y evaluacion en gales, con la ventaja de un unico fichero GGUF facil de desplegar.
- Generacion de contenido divulgativo en gales: borradores de articulos, resumenes o material didactico que luego se revisan manualmente.

## Benchmarks y rendimiento

El autor reporta resultados de su propia evaluacion CymraegBench v0.1, medidos sobre el fichero Q8_0:

| Evaluacion | EryriLabs-cymraeg-4B (Q8_0) | v4 (referencia del autor) |
|---|---:|---:|
| CymraegBench v0.1 global | 57,46 | 49,94 |
| Razonamiento | 53,26 | no disponible |
| Practical Welsh | 61,67 | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La comparacion con "v4" corresponde a una version previa del propio autor y no a un modelo externo.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa 8,7 GB, por lo que se necesitan al menos unos 9-10 GB de VRAM para cargarlo completo en GPU, mas overhead de contexto.
- GPU recomendadas: tarjetas con 12 GB o mas de VRAM permiten cargar el modelo con `-ngl 99` y contexto moderado; ejemplos habituales son RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM; en tarjetas de 8 GB habria que reducir capas descargadas a CPU (`-ngl`) o recurrir a cuantizaciones menores no publicadas en este repositorio.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), y por compatibilidad de formato GGUF, frontends basados en llama.cpp como Ollama o LM Studio (no verificado explicitamente por el autor). No se documenta soporte de vLLM ni TGI para este fichero.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad; el rendimiento dependera del hardware y del numero de capas descargadas a CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EryriLabs-cymraeg-4B-GGUF | 8.134.102.314 (pesos base) | 16.384 (ejemplo de despliegue) | cy, en | CC-BY-NC-4.0 | GGUF |
| Gemma 4 E4B (base) | no disponible en la informacion | no disponible | multilingue (segun modelo base) | no disponible en la informacion | safetensors |
| EryriLabs-cymraeg-4B (v4, version previa) | no disponible | no disponible | cy, en | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables especializados en gales en la documentacion proporcionada, por lo que la comparativa se limita al modelo base y a la version previa del propio autor.

## Limitaciones y advertencias

- Licencia CC-BY-NC-4.0: prohibido el uso comercial sin autorizacion expresa del autor.
- El nombre "4B" no coincide con el recuento real de parametros del modelo base (8.134.102.314); conviene verificar requisitos de memoria con el tamano real del fichero (8,7 GB en Q8_0).
- Solo se publica cuantizacion Q8_0; no hay variantes Q4_K_M, Q5_K_M ni otras que reduzcan el consumo de memoria para GPUs pequenas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan medidas especificas de mitigacion.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; al ser un ajuste sobre Gemma 4, puede heredar sesgos del modelo base.
- Cobertura limitada a gales e ingles; no se garantiza un comportamiento correcto en otros idiomas.
- El contexto maximo real del modelo base no se especifica; los 16.384 tokens corresponden al valor usado por el autor en su ejemplo, no necesariamente al limite arquitectonico.
- El autor remite al repositorio principal para conocer debilidades conocidas y atribuciones; esta ficha no puede cubrir esos detalles por falta de informacion.
- No se documentan capacidades de tool calling ni de agentes, por lo que no deberia asumirse su disponibilidad en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/EryriLabs/EryriLabs-cymraeg-4B-GGUF
- Modelo base: https://huggingface.co/EryriLabs/EryriLabs-cymraeg-4B
- llama.cpp (herramienta de conversion e inferencia): https://github.com/ggml-org/llama.cpp
