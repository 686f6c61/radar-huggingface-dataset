# emberdyn/editorial-v1-modernbert

## Resumen

Emberdyn Editorial V1 — ModernBERT es un artefacto de ejecución publicado por Emberdyn (emberdyn, dominio emberdyn.com) en Hugging Face. No se trata de un modelo de propósito general ni de un modelo entrenado desde cero: es un paquete que contiene la conversión a Core ML del encoder de answerdotai/ModernBERT-base (en float32), el tokenizador original sin modificar, una cabeza de clasificación entrenada por Emberdyn (396.548 parámetros) y un fichero de digests para verificar la integridad de la descarga. Se distribuye como archivo comprimido (`editorial-v1-modernbert-base-coreml-fp32-v1.tar.gz`, 555.366.182 bytes) para poder descargarse bajo demanda en lugar de incrustarse en el binario de una aplicación.

El contexto de uso declarado es la aplicación CutScript de Emberdyn, que lo ejecuta en el dispositivo (on-device) dentro de lo que el autor denomina Emberdyn Editorial Intelligence V1. La model card es explícita al indicar que «no es un modelo de propósito general» y que la conversión a Core ML es un cambio de formato, no un reentrenamiento ni una cuantización: la arquitectura y los parámetros aprendidos del encoder permanecen intactos respecto a la revisión `8949b909ec900327062f0ebf497f51aef5e6f0c8` del modelo base.

Su relevancia es doble. Por un lado, ilustra un patrón de distribución creciente: empaquetar un encoder pequeño con una cabeza propietaria y verificación criptográfica para inferencia local en Apple Silicon. Por otro, deja claro el reparto de autoría y responsabilidad: Answer.AI no creó, revisó ni respalda Emberdyn Editorial V1; el modelo base es suyo y la conversión, la cabeza y el comportamiento editorial son de Emberdyn. El repositorio acumula 0 descargas y 1 «like» en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT), convertido a Core ML. Arquitectura del encoder sin cambios respecto al modelo base |
| Parametros totales | Encoder: aproximadamente 149 M (cifra del modelo base answerdotai/ModernBERT-base, no confirmada en este repositorio) + cabeza de clasificacion: 396.548 parametros (dato del autor) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 8.192 tokens en el modelo base ModernBERT-base (dato del modelo base; el autor no lo declara en esta model card) |
| Tipos de cuantizacion | No disponible. El artefacto publicado es float32 (fp32) y el autor indica que la conversion a Core ML no es una cuantizacion. No se publican variantes GGUF, AWQ, GPTQ ni int8 |
| Idiomas soportados | No disponible. La model card no declara idiomas; el modelo base ModernBERT-base esta entrenado mayoritariamente en ingles |
| Licencia | Apache License 2.0, con atribucion heredada: «Copyright 2022 MosaicML Examples authors» (ModernBERT se apoya en MosaicBERT). El upstream no publica fichero NOTICE, por lo que aqui tampoco se incluye |
| Formato de pesos | Core ML `ModernBERTEncoder.mlpackage` (float32) + `tokenizer/` + `v1_head.bin` y `v1_head.json`, empaquetados en `editorial-v1-modernbert-base-coreml-fp32-v1.tar.gz` |
| Libreria / runtime | `emberdynai` (libreria declarada en el repositorio); inferencia via Core ML en Apple |
| Revision del modelo base | `8949b909ec900327062f0ebf497f51aef5e6f0c8` |
| Tamano del repositorio | 0,6 GB |
| Integridad | Archivo: 555.366.182 bytes, SHA-256 `5476dab61d8deedb91fb830408e2724b48c482a6ae205689786b973e192b83bb`. Pesos del encoder SHA-256 `3c6fc029a7693930d6f038a1fb3997a09909c226b9d0f366d8be792f6aa3dfd4` |
| Fecha de publicacion | Creado el 2026-09-18; actualizado el 2026-09-18 |

## Arquitectura y entrenamiento

La base es ModernBERT, un encoder transformer bidireccional disenado como sustituto moderno de BERT y DeBERTa: atencion alterna con capas globales y locales para abaratar el coste cuadratico, RoPE en lugar de embeddings posicionales absolutos, GeGLU en el bloque FFN, eliminacion de padding (unpadding) y atencion con kernels eficientes, lo que permite secuencias de hasta 8.192 tokens. Sobre esa arquitectura, Emberdyn no modifica parametros: la model card afirma que la conversion a Core ML es «un cambio de formato, no un reentrenamiento ni una cuantizacion», y que la arquitectura y los parametros aprendidos quedan intactos.

La unica pieza entrenada por Emberdyn es la cabeza `v1_head.bin`, de 396.548 parametros, que consume los embeddings de ModernBERT en tiempo de ejecucion y no contiene parametros del upstream. El autor no publica volumen de datos de entrenamiento, composicion del dataset, uso de RLHF/DPO ni procedimiento de ajuste; esa informacion es no disponible. Si se detalla el mecanismo de integridad: `resources.json` contiene digests que se verifican en la carga, y una descarga truncada o sustituida se rechaza en lugar de producir una salida editorial distinta de forma silenciosa. Emberdyn fija ademas una revision inmutable del repositorio y verifica el digest del archivo antes de instalar; una discrepancia se reporta como «no listo» en vez de usarse.

## Capacidades

- Clasificacion de embeddings: la cabeza entrenada consume las representaciones del encoder ModernBERT y produce una decision de clasificacion. El autor no especifica las etiquetas ni la tarea exacta; es no disponible.
- Inferencia en el dispositivo: el artefacto esta pensado para ejecutarse localmente en Apple mediante Core ML, sin llamadas a servidores externos.
- Codificacion de texto hasta 8.192 tokens (limite heredado del modelo base), util para fragmentos largos de guion o transcripcion.
- Generacion de texto: no. Es un encoder bidireccional con cabeza de clasificacion, no un modelo generativo ni un decoder.
- Tool calling / function calling: no disponible; no se declara ninguna capacidad de este tipo.
- Uso como agente o razonamiento multi-paso: no disponible; no es una capacidad esperable en un encoder de clasificacion.
- Capacidades multilingues: no disponible; no se declaran idiomas y el modelo base esta orientado al ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. Las etiquetas del repositorio incluyen `video-editing`, pero la model card no describe ninguna capacidad multimodal.
- Nota importante: el autor advierte expresamente que no es un modelo de proposito general y que esta pensado para un unico consumidor, la aplicacion CutScript.

## Casos de uso

- Inferencia local dentro de CutScript: el caso de uso declarado por el autor es ejecutar Emberdyn Editorial Intelligence V1 en el dispositivo del usuario final. Al ser un paquete Core ML descargable, la aplicacion puede instalarlo bajo demanda en lugar de incluirlo en el binario distribuido.
- Reduccion del tamano del bundle de una aplicacion: separar un artefacto de 555.366.182 bytes del binario principal permite descargarlo solo cuando el usuario activa la funcionalidad, y actualizarlo sin recompilar la aplicacion completa.
- Procesamiento con privacidad por diseno: al ejecutarse on-device sobre material de edicion de video (guiones, transcripciones o metadatos), el contenido no necesita salir del equipo del usuario.
- Verificacion de integridad en pipelines de instalacion: `resources.json` mas los SHA-256 publicados permiten que el instalador rechace descargas truncadas o sustituidas antes de cargar el encoder, algo relevante cuando una salida distinta implicaria decisiones de edicion incorrectas.
- Reproducibilidad de versiones: Emberdyn fija una revision inmutable y una revision concreta del modelo base (`8949b909...`), lo que permite reproducir exactamente el comportamiento editorial de una version concreta en equipos de soporte o de control de calidad.
- Etiquetado asistido de material de video: un encoder de 8.192 tokens de contexto y 149 M de parametros es adecuado para clasificar fragmentos largos con latencia baja y sin infraestructura de GPU en servidor; seria el uso generico mas cercano al artefacto, aunque las etiquetas concretas no estan documentadas.
- Distribucion controlada a terceros: la licencia Apache 2.0 del base y del paquete permite redistribucion, siempre que se conserve la atribucion a MosaicML Examples authors y a Answer.AI que la propia licencia arrastra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de Emberdyn Editorial V1 no incluye metricas (ni MMLU, ni GLUE, ni exactitud de la cabeza de clasificacion, ni latencia medida), y los resultados de busqueda web asociados a esta consulta no devolvieron informacion tecnica sobre el modelo.

## Requisitos de hardware

- Plataforma objetivo: Apple. El artefacto es un paquete Core ML (`ModernBERTEncoder.mlpackage`) con pesos en float32, pensado para ejecutarse con la libreria `emberdynai` en dispositivos Apple.
- Memoria: los 149 M de parametros del encoder en float32 ocupan aproximadamente 0,6 GB, a lo que hay que sumar el estado de activaciones y el tokenizador; el archivo comprimido pesa 555.366.182 bytes. Se trata de una estimacion a partir del tamano de parametros, no de una cifra publicada por el autor.
- GPU / aceleradores: no disponible. El autor no publica requisitos de GPU, ni compatibilidad con CUDA, ni si la inferencia se delega a Neural Engine, GPU integrada o CPU.
- Cabe en GPU de consumo: no aplica en el sentido habitual, ya que el artefacto no se distribuye en formatos para GPU NVIDIA (safetensors, GGUF, AWQ). En terminos de memoria, un encoder de este tamano cabe holgadamente en cualquier Mac con memoria unificada moderna; no hay datos publicados de rendimiento.
- Opciones de despliegue: Core ML a traves de la libreria `emberdynai`. No se publican artefactos para vLLM, llama.cpp, Ollama, TGI ni transformers; el formato GGUF no esta disponible.
- Latencia y throughput: no disponible. No se publican mediciones.
- Nota: como el autor no documenta la firma de entrada/salida, el uso fuera de CutScript exigiria reutilizar la cabeza `v1_head.bin` con un contrato de inferencia no especificado.

## Comparativa con modelos similares

La comparacion directa es limitada: los demas modelos comparables no se distribuyen en Core ML con una cabeza propia. La tabla siguiente recoge los datos publicos del encoder base y de dos alternativas de tamano similar, con la advertencia de que las cifras de los modelos base no estan verificadas en este repositorio.

| Modelo | Parametros | Contexto | Formato publicado | Licencia | Orientacion |
|---|---|---|---|---|---|
| Emberdyn Editorial V1 (este repositorio) | Encoder ~149 M + cabeza 396.548 | 8.192 (heredado del base) | Core ML fp32 + cabeza propietaria | Apache 2.0 | Clasificacion editorial on-device en CutScript |
| answerdotai/ModernBERT-base | ~149 M | 8.192 | safetensors (upstream) | Apache 2.0 | Encoder de proposito general, ajustable |
| microsoft/deberta-v3-base | ~184 M | 512 | safetensors (upstream) | MIT | Encoder de proposito general, NLU clasico |
| google-bert/bert-base-uncased | ~110 M | 512 | safetensors (upstream) | Apache 2.0 | Encoder de proposito general, linea base historica |

Diferencias clave: frente a ModernBERT-base, este repositorio no aporta pesos nuevos del encoder (son los mismos, convertidos) y anade una cabeza no publicada por separado; frente a DeBERTa-v3-base y BERT-base, la ventana de contexto es entre 16 y 16 veces mayor, pero carece de la documentacion de tareas y de la comunidad de ajuste de los modelos de referencia.

## Limitaciones y advertencias

- No es un modelo de proposito general. El propio autor lo declara: es un recurso de ejecucion para una aplicacion concreta. Reutilizarlo fuera de ese contexto carece de garantias.
- Comportamiento editorial no documentado. No se publican las etiquetas, el esquema de decision, el dataset de entrenamiento ni metricas de la cabeza `v1_head.bin`; sin ellos no es posible evaluar si sirve para otra tarea.
- Riesgo de alucinacion: no aplica en el sentido generativo (no produce texto libre), pero si existe el riesgo analogo de clasificaciones erroneas o poco calibradas, sin metricas publicadas que lo cuantifiquen.
- Sesgos: no disponible. Al no documentarse los datos de entrenamiento de la cabeza, no puede evaluarse el sesgo heredado del encoder ni el introducido por el ajuste.
- Limitaciones de idioma: no disponible. El modelo base esta orientado al ingles; el comportamiento en castellano u otros idiomas no esta declarado ni medido.
- Dependencia de plataforma: el paquete es Core ML, por lo que queda atado al ecosistema Apple. No hay ruta publicada para Linux o Windows, ni artefacto GGUF o safetensors de la cabeza.
- Verificacion obligatoria: el flujo previsto exige comprobar los digests; usar el archivo sin verificar rompe la garantia de que la salida editorial sea la esperada. Una discrepancia se reporta como «no listo».
- Licencia: Apache 2.0 permite uso comercial, pero obliga a conservar la atribucion existente («Copyright 2022 MosaicML Examples authors») y la de Answer.AI. El upstream no publica NOTICE, de modo que el paquete tampoco lo incluye.
- Ausencia de soporte comunitario: 0 descargas y 1 «like» en el momento de la consulta, sin pipeline declarado ni idiomas listados.
- Fechas: el repositorio figura creado y actualizado el 2026-09-18; conviene comprobar si existen revisiones posteriores antes de fijar una version en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/emberdyn/editorial-v1-modernbert
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Sitio del autor: https://emberdyn.com
- Resultados de busqueda web: las consultas asociadas a esta ficha devolvieron unicamente hilos de soporte de Apple (discussions.apple.com, apple.stackexchange.com) sin relacion con el modelo, por lo que no se incluyen como enlaces tecnicos. No se encontraron papers, blogs, repositorios ni demos adicionales sobre Emberdyn Editorial V1 en la informacion disponible.
