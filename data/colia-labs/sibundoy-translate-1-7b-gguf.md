# colia-labs/Sibundoy-Translate-1.7B-GGUF

## Resumen

Sibundoy-Translate-1.7B-GGUF es la distribucion en formato GGUF de Sibundoy-Translate-1.7B, un modelo de traduccion automatica especializado en la direccion ingles a espanol desarrollado por ColIA. Se trata de un ajuste fino de LFM3-1.7B-Base de Liquid AI, orientado a un unico cometido: traducir texto preservando intactas las etiquetas HTML y el formato Markdown del original. Esta version GGUF esta pensada para llama.cpp y las aplicaciones construidas sobre el, lo que permite ejecutar el modelo en CPU o en GPU de gama baja.

El modelo cuenta con 1.728.801.600 parametros (aproximadamente 1,7 mil millones) y una ventana de contexto operativa de 4096 tokens segun la receta oficial publicada. Su interes practico radica en que resuelve un problema concreto de los pipelines de localizacion: la traduccion de documentacion tecnica, articulos y contenido web sin romper el marcado. Frente a traductores genericos, el ajuste fino busca que el modelo devuelva unicamente la traduccion, sin explicaciones ni texto adicional.

La relevancia actual del modelo es doble. Por un lado, demuestra que un modelo de 1,7B puede ofrecer traduccion de calidad util con un consumo de recursos minimo (unos 1,3 GB de VRAM en cuantizacion Q4_K_M). Por otro, su licencia LFM Open License v1.0 impone restricciones comerciales relevantes que conviene evaluar antes de desplegarlo en produccion. El repositorio tiene un volumen de descargas muy bajo (1 descarga en el momento de la consulta), por lo que se trata de una publicacion reciente y poco contrastada por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LFM3-1.7B-Base de Liquid AI); detalles internos no disponibles |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (configuracion recomendada en la receta oficial) |
| Tipos de cuantizacion | Q4_K_M (1,10 GB), Q8_0 (1,85 GB), BF16 (3,47 GB) |
| Idiomas soportados | Ingles (entrada) y espanol (salida) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de LFM3-1.7B-Base, el modelo base de 1,7 mil millones de parametros de Liquid AI. La model card no detalla la arquitectura interna mas alla de la referencia al modelo base, ni especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

La informacion disponible se centra en el comportamiento esperado: el modelo fue entrenado para recibir una instruccion fija en ingles ("Translate the following text from English into Spanish. Keep any HTML tags and Markdown formatting exactly as they are. Reply with the translation only."), seguida de una linea en blanco y el texto a traducir. La instruccion debe ir en ingles, como en el entrenamiento. La conversion a GGUF se realizo sobre los pesos del modelo base afinado, y el autor indica que la cuantizacion Q4_K_M es la recomendada porque la Q8_0 no mejoro los resultados de COMET dentro del margen de ruido.

## Capacidades

- Traduccion de texto de ingles a espanol con preservacion de etiquetas HTML y formato Markdown.
- Generacion de la traduccion unicamente, sin texto explicativo adicional, cuando se usa la instruccion exacta de entrenamiento.
- Procesamiento de parrafos individuales; el modelo esta disenado para una peticion por parrafo.
- Compatibilidad con endpoints de tipo chat completions (formato conversacional) a traves de llama-server.
- Soporte de modo razonamiento en llama.cpp, aunque debe desactivarse obligatoriamente para obtener la traduccion en el campo de respuesta.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de pensamiento expuesto como funcionalidad del producto.

## Casos de uso

- Localizacion de documentacion tecnica: el modelo traduce parrafos de documentacion en Markdown conservando encabezados, enlaces, negritas y bloques de codigo, lo que permite integrarlo en un pipeline que procese documentos seccion a seccion sin romper el formato.
- Traduccion de articulos y blogs: al mantener el HTML intacto, se puede enviar el cuerpo de un articulo como un unico parrafo y obtener una version en espanol lista para publicar, con un coste de infraestructura minimo.
- Traduccion de correos y comunicaciones internas: con 1,3 GB de VRAM en Q4_K_M, puede desplegarse en una estacion de trabajo o en un servidor modesto para traducir mensajes de forma local, sin enviar contenido a servicios externos.
- Procesamiento por lotes de contenido web: un script puede dividir paginas en parrafos, enviar cada uno al endpoint de chat completions y reconstruir la pagina traducida, manteniendo las etiquetas HTML originales.
- Traduccion en entornos con recursos limitados: la receta para CPU (36 tok/s en un i7-13620H) permite ejecutar el modelo en portatiles sin GPU, adecuado para herramientas de escritorio o entornos de desarrollo.
- Generacion de subtitulos o textos cortos: para fragmentos de una o dos frases, el modelo ofrece una latencia baja y una salida limpia, util en flujos de traduccion asistida donde el revisor humano corrige despues.
- Prototipado de sistemas de traduccion especializados: sirve como base para evaluar la viabilidad de un traductor local antes de invertir en modelos mayores o en servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mediciones de COMET para comparar Q4_K_M con Q8_0, pero no incluye las cifras concretas ni tablas comparativas con otros modelos. Los unicos datos de rendimiento publicados son de throughput: 121 tok/s en una RTX 3050 de 6 GB y 36 tok/s en un i7-13620H.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,3 GB con la cuantizacion Q4_K_M en GPU; alrededor de 1,2 GB de RAM en CPU.
- GPU recomendadas: el autor midio en una RTX 3050 de 6 GB; cualquier GPU consumer con al menos 2 GB de VRAM libre deberia ser suficiente para Q4_K_M.
- Cabe en GPU consumer: si, practicamente cualquier GPU moderna con 4 GB o mas de VRAM; tambien en iGPU y CPU.
- Opciones de despliegue: llama.cpp (llama-server), y por extension las aplicaciones construidas sobre llama.cpp; el formato GGUF es compatible con Ollama y otros runners basados en llama.cpp, aunque la model card solo documenta llama-server.
- Latencia y throughput: 121 tok/s en RTX 3050 6 GB y 36 tok/s en CPU i7-13620H, ambos con Q4_K_M.
- Parametros de ejecucion obligatorios: `--reasoning off`, `-c 4096`, `--temp 0.1`, `--top-k 50`, `--repeat-penalty 1.1`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas. A continuacion se comparan caracteristicas estructurales con modelos de traduccion de proposito general, sin afirmar superioridad en calidad:

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Sibundoy-Translate-1.7B-GGUF | 1,7B | 4096 tokens | Traduccion EN-ES con preservacion de HTML/Markdown | LFM Open License v1.0 (uso comercial limitado a <10 M USD de ingresos) | GGUF |
| Google Translate | No disponible (servicio propietario) | No disponible | Traduccion multilingue general | Servicio propietario | API/servicio |
| Modelos NLLB de Meta | 600M a 54B (segun variante) | 512 tokens (variantes estandar) | Traduccion multilingue general | CC-BY-NC 4.0 en la mayoria de variantes | Safetensors, GGUF via conversiones |
| OPUS-MT (Helsinki-NLP) | ~75M a ~300M | 512 tokens | Traduccion por pares de idiomas | CC-BY 4.0 en la mayoria de variantes | Safetensors, GGUF via conversiones |

La comparacion con Google Translate es estructural: se trata de un servicio cerrado sin especificaciones publicas de parametros ni contexto. Frente a NLLB y OPUS-MT, la diferencia principal de Sibundoy-Translate es su especializacion en un unico par de idiomas y la preservacion explicita de marcado, a costa de una licencia mas restrictiva para uso comercial.

## Limitaciones y advertencias

- Licencia LFM Open License v1.0: uso gratuito para investigacion y uso no comercial; el uso comercial solo esta permitido a personas y empresas con menos de 10 millones de USD de ingresos anuales. Verificar el texto completo de la licencia antes de desplegar en produccion.
- El modelo traduce un solo parrafo por peticion. Con varios bloques separados por lineas en blanco, tiende a traducir solo el primero o a repetir un bloque en bucle.
- Es obligatorio desactivar el modo razonamiento (`--reasoning off`); de lo contrario, llama-server coloca la traduccion en el campo de razonamiento y la respuesta llega vacia.
- Se recomienda `--repeat-penalty 1.1` para evitar bucles de repeticion observados en pruebas del autor.
- La instruccion de traduccion debe enviarse en ingles y con el texto exacto documentado; no se ha verificado el comportamiento con otras formulaciones.
- Solo soporta la direccion ingles a espanol; no se documenta traduccion inversa ni otros pares de idiomas.
- No se han publicado evaluaciones independientes de calidad (COMET, BLEU u otras) con cifras concretas, ni resultados de benchmarks estandar.
- El repositorio tiene un volumen de descargas muy bajo (1 descarga), lo que indica escasa validacion por parte de la comunidad.
- Riesgo de alucinacion y de omision de contenido en parrafos largos o con estructuras de marcado complejas no representadas en el entrenamiento; se recomienda revision humana en flujos de produccion.
- No dispone de tool calling, capacidades de agente, vision ni audio.
- El contexto operativo recomendado es de 4096 tokens; el autor indica que ampliar el contexto no aporta beneficios.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/colia-labs/Sibundoy-Translate-1.7B-GGUF
- Modelo base afinado: https://huggingface.co/colia-labs/Sibundoy-Translate-1.7B
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Codigo en GitHub: https://github.com/colia-labs/sibundoy-translate
- Sitio de ColIA: https://colia.org
- Licencia (archivo LICENSE en el repositorio): https://huggingface.co/colia-labs/Sibundoy-Translate-1.7B-GGUF/blob/main/LICENSE
