# kurogane/qwen35_3.5m_dclm100m

## Resumen

`kurogane/qwen35_3.5m_dclm100m` es un modelo de lenguaje de escala diminuta publicado por el usuario kurogane en HuggingFace. Con 3.536.560 parámetros (unos 3,5 millones), se trata de un experimento de entrenamiento, no de un modelo destinado a uso productivo: el repo ocupa 0 GB, no acumula descargas ni "likes" y su model card se limita a la licencia, un fragmento de código de inferencia con `transformers` y una muestra de generación.

El identificador y las etiquetas indican dos cosas: la etiqueta `qwen3_5_text` apunta a que el modelo emplea la implementación de arquitectura de texto de la familia Qwen3.5, y el sufijo `dclm100m` sugiere que se ha entrenado sobre el subconjunto de 100 millones de tokens de DCLM (DataComp-LM), el corpus de Common Crawl filtrado que se usa habitualmente como referencia en estudios de curación de datos. Ninguno de esos dos extremos se confirma de forma explícita en la documentación publicada.

Su relevancia es, por tanto, metodológica: sirve como punto de control mínimo en experimentos de leyes de escala, validación de pipelines de entrenamiento y pruebas de infraestructura de despliegue. La muestra de texto incluida en la propia model card ("It is a subsidian program...") es incoherente, lo que es coherente con un modelo de 3,5 M de parámetros escasamente entrenado y sin ajuste por instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia de texto Qwen3.5 (etiqueta `qwen3_5_text`); configuracion concreta no disponible |
| Parametros totales | 3.536.560 (~3,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors |
| Idiomas soportados | No disponible (la muestra de generacion es en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La unica informacion estructural disponible es la etiqueta `qwen3_5_text`, que asocia el modelo a la implementacion de arquitectura de texto de Qwen3.5. Se trata, por tanto, de un transformer decoder autorregresivo orientado a texto, sin componentes multimodales. La model card no especifica numero de capas, dimension del modelo oculto, numero de cabezas de atencion, tipo de atencion (MHA/GQA), funcion de activacion, normalizacion ni estrategia posicional, de modo que estos datos quedan como no disponibles.

El sufijo `dclm100m` del identificador apunta a un entrenamiento sobre 100 millones de tokens de DCLM, pero la ficha no documenta el numero exacto de tokens vistos, la composicion del dataset, la existencia de fases de RLHF, DPO o ajuste por instrucciones, ni si se partio de pesos preentrenados o de inicializacion aleatoria. Tampoco se describe ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, MoE, SSM) y no hay informacion sobre el tokenizador empleado, aunque el ejemplo de codigo usa `AutoTokenizer` con el mismo identificador. El resultado de generacion incluido por el autor sugiere un modelo muy poco entrenado.

## Capacidades

- Generacion de texto autorregresiva basica, con salida gramaticalmente parcial y frecuentemente incoherente segun la propia muestra publicada.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay informacion sobre capacidades multilingues; la unica muestra disponible es en ingles.
- No dispone de modo "thinking", vision, audio ni ninguna capacidad especial declarada.
- Al no documentarse ningun ajuste por instrucciones, no cabe esperar comportamiento de asistente ni seguimiento fiable de instrucciones.

## Casos de uso

- Estudio de leyes de escala y curvas de aprendizaje: al ser un modelo de 3,5 M de parametros, sirve como punto extremo de una familia de modelos entrenados sobre el mismo corpus (presumiblemente DCLM-100M) para medir como escala la perdida con el tamano y los tokens.
- Pruebas de humo en pipelines de entrenamiento: validar scripts de preprocesado, tokenizacion, checkpointing, reanudacion y registro de metricas con un modelo que se entrena y se carga en segundos.
- Verificacion de infraestructura de inferencia: comprobar que un servidor compatible con `transformers`, un contenedor de despliegue o una API interna devuelven tokens correctamente antes de desplegar un modelo grande, sin consumir VRAM.
- Experimentos de destilacion y poda: usar un alumno de 3,5 M para iterar rapidamente sobre recetas de compresion, temperaturas de destilacion o esquemas de inicializacion.
- Ablaciones de curacion de datos: entrenar variantes sobre subconjuntos filtrados de DCLM y comparar la perdida frente a este modelo como referencia minima.
- Docencia: ilustrar de forma tangible la tokenizacion, el enmascaramiento causal, la atencion y la generacion autoregresiva en un modelo que cabe en memoria y se ejecuta en CPU.
- Pruebas de conversion de formatos: validar conversiones de safetensors a GGUF, cuantizaciones a 8 y 4 bits y comparaciones de perplejidad en un modelo cuyo ciclo completo dura minutos.
- Relleno de contexto en pruebas de integracion de aplicaciones: generar texto sintetico de baja calidad cuando lo unico que se evalua es el manejo de cadenas largas, el streaming o el paginado, nunca el contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se documentan perdida de validacion ni curva de entrenamiento.

## Requisitos de hardware

- VRAM estimada: en fp16, unos 7 MB de pesos (3,536 M de parametros x 2 bytes); en fp32, unos 14 MB. El coste dominante es el runtime de PyTorch, no el modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una GTX 1050 o integradas de gama baja. No requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en cualquier GPU de consumo e incluso se ejecuta en CPU, en una Raspberry Pi o en un movil con runtime adecuado.
- Opciones de despliegue: `transformers` con PyTorch es la via documentada por el autor. vLLM, TGI, llama.cpp u Ollama serian tecnicamente posibles, pero no hay conversiones, plantillas ni configuraciones publicadas para ellos.
- Latencia y throughput: no disponibles. No se han publicado mediciones. El ejemplo del autor desactiva la cache KV (`use_cache=False`), lo que penaliza la velocidad de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kurogane/qwen35_3.5m_dclm100m | 3,5 M | No disponible | Apache-2.0 | Repo en HuggingFace, sin descargas ni validacion de la comunidad |
| HuggingFaceTB/SmolLM-135M | 135 M | 2048 tokens | Apache-2.0 | Ampliamente usado y evaluado |
| roneneldan/TinyStories-33M | ~33 M | No disponible | No disponible | Repo publico orientado a generacion de cuentos infantiles |
| Qwen/Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache-2.0 | Modelo de referencia de la familia Qwen, con benchmarks publicados |

La comparacion es necesariamente cualitativa: el modelo de kurogane es entre uno y dos ordenes de magnitud mas pequeno que las alternativas citadas y no publica ninguna metrica que permita situarlo en una escala de calidad. Frente a TinyStories-33M, que demuestra que un modelo diminuto puede producir texto coherente cuando se entrena sobre un corpus muy acotado y sintetico como TinyStories, este modelo se habria entrenado (segun el nombre) sobre datos web genericos, un regimen mucho mas exigente para 3,5 M de parametros.

## Limitaciones y advertencias

- Calidad de generacion muy baja: la propia muestra de la model card es gramaticalmente incoherente. No es apto para generar contenido que vaya a leer una persona.
- Alucinacion estructural: a esta escala no existe conocimiento factual fiable; cualquier afirmacion del modelo debe considerarse ruido.
- Ausencia total de ajuste por instrucciones y de plantilla de chat documentada: no responde a ordenes ni mantiene un rol de asistente.
- Sesgos: no documentados. Si el entrenamiento se realizo sobre DCLM, heredaria los sesgos de Common Crawl filtrado y un sesgo claro hacia el ingles.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan especificados en ningun lugar.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia. No hay clausulas adicionales, pero el modelo carece de utilidad comercial real.
- Falta de validacion externa: cero descargas y cero "likes" en el momento de la consulta; no existe evidencia de terceros que hayan reproducido el entrenamiento o verificado los pesos.
- Documentacion insuficiente para produccion: no se publican datos de entrenamiento, hiperparametros, tokenizador, ni resultados de evaluacion.
- Fecha de publicacion inusual en los metadatos (2026-09-24), lo que conviene verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kurogane/qwen35_3.5m_dclm100m
- No se han encontrado en la informacion proporcionada otros enlaces (paper, repositorio de codigo, blog, demo o dataset asociado).
