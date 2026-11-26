# hsilvosa/feishengmt-GGUF

## Resumen

feishengmt-GGUF es la version cuantizada en formato GGUF del modelo hsilvosa/feishengmt, un ajuste fino de tencent/Hy-MT2-1.8B orientado a la traduccion de ficcion china (wuxia y xianxia) al ingles, con capacidad adicional de responder en frances, portugues, espanol, indonesio, japones y coreano. Lo desarrolla el usuario independiente hsilvosa y se distribuye bajo licencia Apache-2.0, sin respaldo de Tencent. La version documentada es la 1.2.

El modelo resuelve un problema muy concreto: la traduccion de novelas web chinas de tematica de artes marciales y cultivacion, un dominio con terminologia propia (nombres de tecnicas, rangos, toponimos) que los traductores genericos suelen degradar. Para ello incorpora un glosario y un pipeline de traduccion por ventanas de parrafos que verifica la respuesta, lo que reduce la perdida de parrafos y la fuga de caracteres chinos en la salida.

Tecnicamente es un transformer denso de 1.791.080.448 parametros (aproximadamente 1,8 mil millones), distribuido principalmente como cuantizacion Q4_K_M de 1,1 GB dentro de un repositorio de 4,5 GB. Su relevancia practica esta en que permite ejecutar traduccion especializada de forma local en hardware de consumo, con un rendimiento medido en una RTX 3060 de 1,73 s por ventana en peticion unica y 1,06 s con cuatro en paralelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (fine-tune de tencent/Hy-MT2-1.8B) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens por instancia de llama-server; 2.048 tokens por slot con `-np 4` |
| Tipos de cuantizacion | Q4_K_M (unica publicada en el repo); checkpoint bf16 fusionado de referencia (3,6 GB) |
| Idiomas soportados | zh, en, fr, pt, es, id, ja, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M, 1,1 GB); bf16 en el modelo base |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint tencent/Hy-MT2-1.8B, un transformer denso de aproximadamente 1,8 mil millones de parametros especializado en traduccion. Sobre esa base, hsilvosa aplico un ajuste orientado al dominio de la ficcion wuxia y xianxia con el par chino-ingles como direccion principal, manteniendo capacidad de respuesta en frances, portugues, espanol, indonesio, japones y coreano. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion se remite a la model card del modelo base hsilvosa/feishengmt y al blog del autor.

La innovacion practica no esta en la arquitectura sino en el pipeline de inferencia: el repositorio incluye una carpeta `pipeline/` con el glosario y una CLI de traduccion que divide el texto en ventanas de parrafos, las envia al servidor y valida la respuesta. La cuantizacion Q4_K_M apenas altera las metricas de calidad respecto al checkpoint bf16 fusionado, lo que hace viable el despliegue en local sin penalizacion apreciable. El modelo esta pensado para ejecutarse con llama.cpp y se ha probado exclusivamente con llama-server (build 10615).

## Capacidades

- Traduccion chino-ingles de ficcion wuxia y xianxia con terminologia especializada.
- Traduccion y respuesta en frances, portugues, espanol, indonesio, japones y coreano, aunque las metricas publicadas solo cubren el ingles.
- Procesamiento por ventanas de parrafos de hasta 400 caracteres, con glosario inyectado en el prompt.
- Verificacion de la salida: el pipeline comprueba que el numero de parrafos coincida con el origen y detecta caracteres chinos residuales.
- Generacion de texto conversacional (tag `conversational` en el repo).
- Compatibilidad con endpoints estilo OpenAI (`endpoints_compatible`).
- Soporte de plantillas de chat mediante `--jinja` en llama-server.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Traduccion de novelas web chinas al ingles a escala: el pipeline divide capitulos en ventanas de parrafos y valida cada respuesta, lo que permite procesar obras largas de forma automatizada manteniendo la coherencia de parrafos (98,9 % de coincidencia en el test externo).
- Traduccion de ficcion wuxia y xianxia con glosario propio: la inyeccion de lineas de glosario en el prompt preserva nombres de tecnicas, rangos y toponimos que un traductor generico deformaria.
- Despliegue local para editores y traductores independientes: con 1,1 GB en Q4_K_M cabe en GPU de consumo y permite traducir sin enviar el texto a servicios en la nube.
- Pre-traduccion asistida para revisores humanos: la salida en ingles sirve como borrador de alta fidelidad que un editor corrige, reduciendo el coste por capitulo.
- Traduccion multilingue de resumenes o fragmentos: el modelo puede responder en espanol, frances, portugues, indonesio, japones y coreano, util para fichas de obra o material promocional.
- Servicio de traduccion concurrente: con `-np 4` y `-c 8192` atiende cuatro peticiones en paralelo a 1,06 s por ventana en una RTX 3060, adecuado para una pequena cola de trabajos por lotes.
- Prototipado de pipelines de traduccion: la CLI incluida y la compatibilidad con endpoints OpenAI facilitan integrar el modelo en flujos existentes de procesamiento de texto.

## Benchmarks y rendimiento

Test externo de la model card principal (ventana completa como un unico prompt, decodificacion greedy, una ejecucion):

| Metrica | bf16 (checkpoint fusionado, 3,6 GB) | GGUF Q4_K_M (este archivo) |
|---|---|---|
| chrF | 53,0 | 53,0 |
| BLEU | 22,6 | 22,7 |
| Parrafos identicos al origen | 98,9 % | 98,9 % |
| Chino residual en la salida | 0,4 % | 1,5 % |

Velocidad en RTX 3060 con llama.cpp sobre las mismas ventanas:

| Modelo | 1 peticion | 4 en paralelo |
|---|---|---|
| feishengmt Q4_K_M | 1,73 s/ventana | 1,06 s/ventana |
| Index-Translate-2B Q4_K_M | 2,02 s/ventana | 1,17 s/ventana |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ni mediciones de los idiomas distintos del ingles sobre el GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con Q4_K_M considerando pesos (1,1 GB) y cache KV para 8.192 tokens; el checkpoint bf16 requiere unos 4-5 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; el autor valida el rendimiento en RTX 3060.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3060, RTX 4060, RTX 4070 y superiores; tambien es viable en CPU mediante llama.cpp con latencia mayor.
- Opciones de despliegue: llama.cpp con llama-server (unico runtime probado, build 10615). Ollama y LM Studio no han sido probados por el autor.
- Configuracion recomendada: `llama-server -m feishengmt-Q4_K_M.gguf -c 8192 -np 4 --jinja --port 8080`.
- Latencia y throughput: 1,73 s por ventana en peticion unica y 1,06 s con cuatro en paralelo en RTX 3060; el throughput escala con el numero de slots hasta el limite de contexto por slot (2.048 tokens con `-np 4`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| feishengmt-GGUF | 1,79 B | 8.192 tokens (2.048 por slot con `-np 4`) | Traduccion zh-en de wuxia/xianxia, multilingue secundario | Apache-2.0 | GGUF Q4_K_M en Hugging Face |
| Index-Translate-2B (Q4_K_M) | ~2 B | no disponible | Traduccion generica | no disponible | GGUF; 2,02 s/ventana en RTX 3060 segun el autor |
| tencent/Hy-MT2-1.8B | ~1,8 B | no disponible | Traduccion base sin ajuste de dominio | Apache-2.0 | Pesos originales en Hugging Face |

El dato comparativo disponible es la velocidad: feishengmt Q4_K_M es entre un 10 y un 17 % mas rapido que Index-Translate-2B Q4_K_M en las mismas ventanas (1,73 frente a 2,02 s en peticion unica; 1,06 frente a 1,17 s en paralelo). No hay datos publicados de calidad comparada entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- El ajuste esta optimizado para chino-ingles; las metricas de calidad de frances, portugues, espanol, indonesio, japones y coreano no se han medido sobre el GGUF.
- La cuantizacion Q4_K_M eleva el chino residual en la salida del 0,4 % al 1,5 %, un aumento de casi cuatro veces respecto al bf16; conviene filtrar o revisar la salida en produccion.
- Solo se ha probado con llama-server build 10615; otros runtimes como Ollama o LM Studio pueden comportarse de forma distinta.
- El contexto util por peticion se reduce a 2.048 tokens con `-np 4`, suficiente para ventanas de hasta 400 caracteres pero no para documentos largos en una sola pasada.
- No hay datos publicados sobre sesgos, tasa de alucinacion en dominios ajenos a la ficcion ni comportamiento fuera del par zh-en.
- Es un fine-tune independiente no respaldado por Tencent; la calidad y el mantenimiento dependen de un unico autor.
- Aunque la licencia es Apache-2.0, se debe conservar el aviso `NOTICE` y la atribucion a Hy-MT2 de Tencent por tratarse de una version modificada y cuantizada.
- El repositorio tiene 267 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hsilvosa/feishengmt-GGUF
- Modelo base (fine-tune): https://huggingface.co/hsilvosa/feishengmt
- Modelo original de Tencent: https://huggingface.co/tencent/Hy-MT2-1.8B
- Blog del autor con el desarrollo completo: https://hsilvosa.com/projects/feishengmt/
