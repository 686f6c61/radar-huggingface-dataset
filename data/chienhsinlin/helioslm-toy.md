# chienhsinlin/helioslm-toy

## Resumen

HeliosLM toy_v5.13 es un checkpoint de juguete a nivel de caracter publicado por el usuario chienhsinlin en HuggingFace. No es un modelo de lenguaje utilizable en produccion: se trata de un artefacto de prueba de humo (smoke test) del proyecto HeliosLM, una implementacion desde cero en PyTorch puro de una pila tipo DeepSeek-V3/K3 que se ejecuta en CPU. El checkpoint reproduce en escala minima las piezas clave de esa arquitectura: atencion MLA con absorcion de pesos, MoE con puerta sigmoide y balanceo de carga sin perdida auxiliar, y una cabeza MTP para decodificacion especulativa.

El modelo tiene 8,5 millones de parametros segun la model card (9.020.056 parametros reales en el state_dict en fp32) y un vocabulario a nivel de caracter de 1024 entradas donde cada token id corresponde a `ord(c)`. La configuracion "lite" consta de solo 2 capas. Fue entrenado en aproximadamente 10 minutos de CPU sobre el propio codigo fuente del repositorio HeliosLM, con un `val_loss` de 2,41 y una tasa de aceptacion del borrador MTP de 1,0 sobre la distribucion de entrenamiento.

Su relevancia es exclusivamente tecnica y educativa: sirve como referencia minima verificable para validar que las implementaciones de MLA, MoE y MTP funcionan de extremo a extremo, y para comprobar la fidelidad de las exportaciones GGUF. El autor lo describe explicitamente como un modelo de escala de prueba, "no un modelo de texto capaz". No se han publicado resultados de benchmarks, idiomas soportados ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion MLA (absorcion de pesos), MoE con puerta sigmoide y balanceo de carga sin perdida auxiliar, cabeza MTP; configuracion "lite" de 2 capas |
| Parametros totales | 9.020.056 (state_dict, fp32); la model card indica "8,5M" |
| Parametros activos | no disponible (es MoE, pero no se especifica el numero de expertos ni los parametros activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (state_dict y GGUF bit-exact) y fp16 (GGUF, con exclusión de los contadores de balanceo de carga porque desbordan fp16) |
| Idiomas soportados | no disponibles (modelo a nivel de caracter; el vocabulario mapea token ids a `ord(c)` con vocab 1024) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state_dict (`toy_v5.13.pt`, 83 tensores, fp32) y GGUF v3 (`model-f32.gguf`, `model-f16.gguf`) |

## Arquitectura y entrenamiento

La arquitectura sigue el patron de DeepSeek-V3/K3 en miniatura: atencion MLA (Multi-head Latent Attention) con absorcion de pesos, una capa MoE con puerta sigmoide y una estrategia de balanceo de carga libre de perdida auxiliar (auxiliary-loss-free load balancing), y una cabeza MTP (Multi-Token Prediction) que actua como modelo borrador para decodificacion especulativa. La configuracion empleada es la "lite", con 2 capas, segun la informacion del autor. El state_dict contiene 83 tensores en fp32. El proyecto subyacente, HeliosLM, esta implementado en PyTorch puro y esta disenado para ejecutarse en CPU.

Los datos de entrenamiento son el propio codigo fuente del repositorio HeliosLM, con un vocabulario a nivel de caracter. El entrenamiento completo llevo aproximadamente 10 minutos de CPU. Los resultados reportados son `val_loss` = 2,41 y una tasa de aceptacion del borrador MTP de 1,0 sobre la distribucion de entrenamiento, lo que es coherente con un modelo que ha memorizado un corpus pequeno y muy homogeneo. El archivo `toy_v5.13.json` contiene los metadatos de entrenamiento (val_loss, muestras y aceptacion MTP). No se documenta uso de RLHF, DPO ni ninguna fase de alineacion.

## Capacidades

- Generacion de texto a nivel de caracter. El modelo produce secuencias de caracteres a partir de un prompt tambien codificado como lista de `ord(c)`.
- Reproduccion de patrones del codigo fuente de HeliosLM sobre el que fue entrenado; fuera de esa distribucion no cabe esperar texto coherente.
- Razonamiento, matematicas, codigo en sentido funcional, vision, audio y tool calling: no disponibles; el modelo no esta entrenado ni evaluado para ello.
- Capacidades multilingues: no disponibles; no hay modelo de tokenizacion subpalabra ni corpus multilingue.
- Modo "thinking" explicito: no disponible; la cabeza MTP implementa prediccion multi-token, no una fase de razonamiento extendido.
- Funcion real del checkpoint: validacion de componentes. Permite ejercitar la ruta completa de MLA con absorcion de pesos, el enrutado MoE con balanceo sin perdida auxiliar y la aceptacion de borradores MTP.
- Exportacion verificable a GGUF v3 en fp32 bit-exact y en fp16, con metadatos `helioslm.*` que el lector `read_gguf` del repositorio puede recuperar.

## Casos de uso

- Prueba de humo de la pila HeliosLM: cargar `toy_v5.13.pt` en la configuracion `lite`, ejecutar `model.generate()` con `temperature=0` y comprobar que el forward, el enrutado MoE y la decodificacion producen salida sin errores antes de escalar a configuraciones mayores.
- Test de regresion de la atencion MLA: al ser la unica variable arquitectonica relevante y caber en RAM, permite verificar que la absorcion de pesos produce resultados identicos tras refactorizaciones del codigo de atencion.
- Validacion del pipeline de exportacion GGUF: comparar `model-f32.gguf` con el state_dict fp32 para confirmar la fidelidad bit-exact de la exportacion y detectar regresiones en la serializacion de hiperparametros `helioslm.*`.
- Verificacion del balanceo de carga en MoE: inspeccionar los contadores de balanceo incluidos en la exportacion fp32 (excluidos en fp16 por desbordamiento) para comprobar que la estrategia sin perdida auxiliar mantiene el reparto de tokens entre expertos.
- Evaluacion de decodificacion especulativa: usar la tasa de aceptacion MTP reportada (1,0 sobre la distribucion de entrenamiento) como caso de referencia al implementar o modificar el bucle de decodificacion especulativa.
- Docencia y material de estudio: sirve como ejemplo minimo, ejecutable en CPU y con licencia Apache-2.0, para explicar el funcionamiento conjunto de MLA, MoE y MTP sin necesidad de GPU.
- Integracion en CI/CD: incluirlo como test unitario de la libreria HeliosLM, ya que su coste de carga y ejecucion en CPU es bajo y su salida es determinista con `temperature=0`.
- Prueba de integracion de motores de inferencia compatibles con GGUF: comprobar la carga de un GGUF v3 con metadatos personalizados en lectores propios o de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas reportadas por el autor son `val_loss` = 2,41 y una tasa de aceptacion del borrador MTP de 1,0 sobre la distribucion de entrenamiento, ambas obtenidas en un corpus que consiste en el codigo fuente del propio repositorio.

| Metrica | Valor | Nota |
|---|---|---|
| val_loss | 2,41 | Sobre la distribucion de entrenamiento (codigo fuente de HeliosLM) |
| Aceptacion del borrador MTP | 1,0 | Sobre la distribucion de entrenamiento |
| MMLU, HumanEval, GSM8K, etc. | no disponible | No evaluados |

## Requisitos de hardware

- VRAM para inferencia: los pesos en fp32 ocupan aproximadamente 36 MB (9.020.056 parametros x 4 bytes) y en fp16 aproximadamente 18 MB, sin contar estados de activacion ni cache. Cualquier GPU con mas de 1 GB de memoria es sobradamente suficiente; el autor indica que el stack esta pensado para ejecutarse en CPU.
- GPU recomendadas: no aplica. No se requieren GPU dedicadas; el modelo se ejecuta en CPU.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo, incluidas integradas, y en sistemas sin GPU.
- Opciones de despliegue: inferencia directa con PyTorch mediante el codigo del repositorio HeliosLM; carga de los ficheros GGUF a traves del lector `read_gguf` del propio proyecto. La compatibilidad con llama.cpp, Ollama, vLLM o TGI no esta documentada en la informacion disponible.
- Latencia y throughput: no disponibles. El unico dato temporal es el de entrenamiento (aproximadamente 10 minutos en CPU), que no es extrapolable a inferencia.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se identifican modelos comparables. Se trata de un checkpoint educativo de 8,5M de parametros a nivel de caracter, sin benchmarks publicados ni capacidades de generacion de texto util, por lo que no es equiparable a modelos de proposito general de tamano similar basados en subpalabras (por ejemplo, la familia TinyStories o modelos tipo GPT-2 small) ni a modelos de produccion. Cualquier comparacion numerica requeriria ejecutar evaluaciones propias sobre el mismo corpus, algo que no se ha hecho en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de texto capaz: el propio autor lo califica de modelo de referencia a escala de prueba de humo. Fuera del corpus de entrenamiento generara caracteres sin coherencia linguistica.
- Sesgos conocidos: no documentados. El corpus de entrenamiento es codigo fuente de un unico repositorio, lo que concentra cualquier sesgo de estilo y contenido en ese material.
- Riesgo de alucinacion: muy alto en cualquier tarea real. La `val_loss` de 2,41 y la aceptacion MTP de 1,0 sobre la distribucion de entrenamiento son indicios de memorizacion del corpus, no de generalizacion.
- Limitaciones de contexto e idioma: la longitud de contexto maxima no esta publicada, y no hay soporte multilingue ni tokenizacion subpalabra. El vocabulario es a nivel de caracter con identificadores iguales a `ord(c)` y un limite de 1024 entradas.
- Discrepancia de datos: la model card declara 8,5M de parametros mientras que el recuento del state_dict en fp32 es de 9.020.056. Conviene tratar el dato del state_dict como referencia y verificar la configuracion "lite" exacta en el repositorio.
- Cuantizacion fp16: los contadores de balanceo de carga se excluyen de la exportacion fp16 porque desbordan ese formato, de modo que los GGUF fp16 y fp32 no son completamente equivalentes en contenido.
- Licencia: Apache-2.0, que permite uso comercial, modificacion y redistribucion con las obligaciones habituales de atribucion y conservacion del aviso de licencia. No se imponen restricciones adicionales segun la informacion disponible.
- Uso en produccion: desaconsejado para cualquier tarea de generacion, clasificacion o asistencia. Su unico uso razonable es como utilidad de desarrollo y validacion.
- Resultados de busqueda web: las busquedas realizadas no devolvieron informacion relevante sobre el modelo; los resultados obtenidos fueron paginas genericas de servicios de Google, sin relacion con HeliosLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chienhsinlin/helioslm-toy
- Repositorio del proyecto HeliosLM: https://github.com/tonythetiger168/helioslm
- Ficheros del repositorio: `toy_v5.13.pt` (state_dict fp32), `model-f32.gguf`, `model-f16.gguf`, `toy_v5.13.json` (metadatos de entrenamiento)
- Paper, blog o demo: no disponibles en la informacion proporcionada
