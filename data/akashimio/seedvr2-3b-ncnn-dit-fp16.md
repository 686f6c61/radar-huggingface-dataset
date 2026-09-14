# akashimio/SeedVR2-3B-ncnn-dit-fp16

## Resumen

SeedVR2-3B-ncnn-dit-fp16 es un paquete de pesos convertidos del modelo de restauracion de imagen y video ByteDance-Seed/SeedVR2-3B (aproximadamente 3.000 millones de parametros) al formato ncnn, publicado por el usuario akashimio. No es un modelo nuevo ni un reentrenamiento: es una conversion de distribucion pensada para ejecutarse en la aplicacion nativa seedvr2-ncnn-vulkan, escrita en C++20, con interfaz de linea de comandos, interfaz web local y SDK de C++ instalable. El repo contiene modelos `.param`/`.bin` con constantes y manifiestos ya convertidos, de modo que el usuario no necesita PyTorch ni pnnx para desplegarlos.

La particularidad tecnica es que los pesos lineales de los 32 bloques DiT se almacenan en IEEE FP16, pero ncnn los expande a FP32 al cargarlos, y las activaciones y la aritmetica se mantienen en FP32. Se trata, por tanto, de compresion de almacenamiento, no de computo en precision reducida: el autor indica explicitamente que no implica la mitad de VRAM ni una aceleracion. El paquete de imagen ocupa 10.395.017.619 bytes (10,40 GB) y el de video corto 11.052.868.862 bytes (11,05 GB); el repositorio usa objetos direccionados por contenido, con 53 objetos unicos que suman 11.397.496.168 bytes (11,40 GB).

Es relevante ahora porque lleva un modelo de restauracion de difusion (DiT) con atencion de ventana adaptativa a un runtime nativo con backend Vulkan y CPU, sin dependencia de Python en inferencia, lo que facilita su integracion en aplicaciones de escritorio y flujos de restauracion audiovisual donde PyTorch no es una opcion practica. La contrapartida es que el proyecto se compila desde codigo fuente, el repositorio no es una distribucion binaria portable y no hay cifras publicadas de rendimiento estandar de restauracion mas alla de las comparaciones de fidelidad frente a FP32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con atencion de ventana adaptativa, normalizacion Q/K, RoPE 3D multimodal y agregacion de texto; 32 bloques DiT; grafo de inferencia de 36 componentes (VAE encoder, patch-in, 32 bloques DiT, patch-out, VAE decoder) |
| Parametros totales | Aproximadamente 3.000 millones (segun el nombre del modelo y el modelo base SeedVR2-3B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; usa ventana de atencion adaptativa y el ejemplo de video se limita a 17 fotogramas con lado largo de salida 128) |
| Tipos de cuantizacion | Pesos lineales de los 32 bloques DiT almacenados en IEEE FP16 y expandidos a FP32 al cargar; activaciones y aritmetica en FP32; VAE, proyeccion de parches, sesgos, constantes de modulacion y atributos de atencion personalizados sin cambios. Existe una variante FP32-B de referencia (akashimio/SeedVR2-3B-ncnn) |
| Idiomas soportados | No disponible (modelo de restauracion de imagen y video, no de texto) |
| Licencia | Apache-2.0 (la licencia del modelo base ByteDance-Seed/SeedVR2-3B no se detalla en la informacion proporcionada) |
| Formato de pesos | ncnn (`.param` / `.bin`) con constantes y manifiestos; repositorio con objetos direccionados por contenido que el instalador debe ensamblar |
| Modelo base | ByteDance-Seed/SeedVR2-3B (fine-tune/conversion) |
| Libreria / runtime | ncnn; backend Vulkan y CPU |
| Pipeline declarado | image-to-image (los paquetes cubren imagen y video temporal, video-to-video) |
| Tamano del repositorio | 11,4 GB; 53 objetos unicos, 11.397.496.168 bytes |
| Revision de los pesos | 5c17b05641fbc84f16752b2f3c59aa417cf2475b |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de difusion (DiT) para restauracion, con 32 bloques DiT y un total de 36 grafos de componente que se ejecutan secuencialmente: encoder VAE, patch-in, los 32 bloques, patch-out y decoder VAE. La atencion es una variante adaptativa de ventana que preserva el indexado de ventana, la normalizacion Q/K, el RoPE 3D multimodal y la agregacion de texto. Los paquetes de imagen y de video comparten los pesos DiT, pero difieren en los grafos VAE y en los perfiles revisados. La aplicacion de inferencia es un binario nativo C++20 con backend Vulkan y backend CPU; la inferencia no tiene dependencia de Python.

En cuanto al entrenamiento, esta ficha no dispone de informacion sobre el numero de tokens, la composicion del dataset, el uso de RLHF/DPO ni el procedimiento de ajuste del modelo base ByteDance-Seed/SeedVR2-3B: no disponible. Lo que si documenta el autor es el proceso de conversion y su impacto numerico. Los pesos lineales de los 32 bloques DiT se guardan en FP16 y se expanden a FP32 en carga, mientras que activaciones y aritmetica siguen en FP32; la colocacion de memoria tiene en cuenta los pesos expandidos antes de elegir el reparto entre GPU y RAM. Las descargas estan fijadas a una revision concreta y el catalogo revisado por el autor es `docs/distribution/catalog.dit-fp16.v1.json` (SHA-256 `ecac033376e8b4a4ae61593fdbc990c53290b543048211962998083b6b23d7f1`). La herramienta de descarga usa solo la biblioteca estandar de Python 3.12+, no requiere cuenta de Hugging Face, reanuda descargas interrumpidas, verifica SHA-256 y realiza validacion nativa del modelo.

## Capacidades

- Restauracion de imagen fija (image-to-image) y restauracion de video temporal (video-to-video) en un unico paquete por variante.
- Upgrading y restauracion mediante difusion en un solo paso en las mediciones publicadas (paso fijo, CFG=1).
- Salida de imagen configurable por tamano (el ejemplo documentado usa `--size 256`); la salida de video usa por defecto lado largo 128 y hasta 17 fotogramas.
- Atencion de ventana adaptativa con indexado de ventana, normalizacion Q/K, RoPE 3D multimodal y agregacion de texto.
- Ejecucion nativa sin Python: binario `seedvr2` con backend Vulkan o CPU.
- Instalacion y verificacion de modelos por linea de comandos, con modo `--offline` para reutilizar una instalacion existente y `--plan` para previsualizar bytes sin descargar.
- Interfaz web local mediante `seedvr2-studio` para uso interactivo.
- SDK de C++ instalable para integracion en aplicaciones de terceros.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, function calling, agentes, capacidades multilingues de texto ni modo de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Restauracion de archivo filmico y video analogico digitalizado: el paquete de video procesa secuencias temporales de hasta 17 fotogramas con ventana de atencion adaptativa, lo que permite limpiar ruido y artefactos de compresion en metraje historico antes de un reencode final.
- Limpieza de metraje de baja calidad (VHS, camaras de vigilancia, grabaciones moviles): el modelo trabaja sobre imagenes y clips cortos, y las mediciones en 128x80 con 8 y 17 fotogramas reportan PSNR de 62,50-64,25 dB y 66,48-67,86 dB frente a FP32, lo que indica que la degradacion introducida por la conversion es despreciable para este tipo de material.
- Restauracion de fotografia historica y documentos graficos: el pipeline image-to-image permite pasar una imagen por VAE encoder, DiT y VAE decoder para recuperar detalle en copias escaneadas, con control de tamano de salida mediante `--size`.
- Preprocesado en pipelines de postproduccion: al ser un binario nativo con backend Vulkan y CLI, se puede encadenar en scripts de procesamiento por lotes antes de etapas de escalado o etalonaje, sin arrastrar un entorno PyTorch.
- Despliegue en aplicaciones de escritorio o edge: el SDK de C++ y los backends Vulkan/CPU permiten integrar la restauracion dentro de una aplicacion nativa en equipos con GPU de consumo, como el entorno medido (RTX 4060 Laptop de 8 GiB con unos 32 GiB de RAM de sistema).
- Revision manual por parte de restauradores y coloristas: `seedvr2-studio` levanta una interfaz web local sobre los modelos instalados, util para comparar resultados fotograma a fotograma antes de aplicar un lote completo.
- Procesamiento offline en archivos digitales con conectividad limitada: la opcion `--offline` reutiliza una instalacion ya verificada, lo que encaja en flujos de digitalizacion en sala aislada de red.
- Integracion en herramientas propias de edicion o vision por computador mediante el SDK de C++, evitando dependencias de Python en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible: no aplican a un modelo de restauracion de imagen y video. Lo que si publica el autor son comparaciones de fidelidad numerica frente a la ejecucion FP32 nativa, en Linux x86_64, RTX 4060 Laptop de 8 GiB y aproximadamente 32 GiB de RAM de sistema, con 3B fijo, un paso, CFG=1, semilla 666 e identicas entradas y ruido. Se comprobaron cinco ejecuciones completas sobre los 73 limites del modelo mas tensores auxiliares de entrada/salida, y todos los tensores medidos fueron finitos.

| Caso | Backend | PSNR de fidelidad RGB frente a FP32 nativo | SSIM minimo |
|---|---|---:|---:|
| Imagen natural 256x256 | Vulkan | 40,03 dB | 0,99158 |
| Movimiento 128x80, 9 fotogramas | Vulkan | 61,96-64,32 dB | 0,99986 |
| Cola rellenada 128x80, 8 fotogramas | Vulkan | 62,50-64,25 dB | 0,99987 |
| Corte artificial 128x80, 17 fotogramas | Vulkan | 66,48-67,86 dB | 0,99993 |
| Imagen natural 256x256 | CPU | 40,03 dB | 0,99158 |

Mediciones de calidad frente a la referencia (objetivo fijo), no de fidelidad frente a FP32: imagen 20,0184 dB en FP32 frente a 20,0093 dB con almacenamiento DiT FP16; medias de video 20,0078/20,0074 dB, 19,6978/19,6987 dB y 23,2410/23,2414 dB. El propio autor advierte que los tres clips derivan de una misma fuente, que el corte es artificial y que se trata de una muestra de desarrollo, no de un benchmark de calidad representativo. Los cambios de residuo entre fotogramas se registran por separado de los cortes y no demuestran ausencia de parpadeo. No se publican cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra explicita. Los pesos se almacenan en FP16 pero se expanden a FP32 en memoria, de modo que el almacenamiento FP16 no reduce el consumo de VRAM.
- Entorno medido por el autor: Linux x86_64, GPU RTX 4060 Laptop de 8 GiB y aproximadamente 32 GiB de RAM de sistema, ejecutando tanto backend Vulkan como CPU.
- Colocacion de memoria: la aplicacion tiene en cuenta los pesos ya expandidos antes de decidir el reparto entre GPU y RAM, lo que sugiere que en GPUs de 8 GiB parte del modelo reside en memoria del sistema. El autor no publica el desglose exacto.
- GPU recomendadas: no disponibles. El unico dato concreto es la RTX 4060 Laptop de 8 GiB del entorno de medida; no se documentan pruebas en A100, H100 u otras.
- Viabilidad en GPU de consumo: si, segun el entorno medido, con apoyo de RAM del sistema.
- Opciones de despliegue: aplicacion nativa C++20 compilada desde fuente (`tools/build_native.py --cli-only`), binario `seedvr2` con backend Vulkan o CPU, interfaz web local `seedvr2-studio` y SDK de C++. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: 10,40 GB para el paquete de imagen y 11,05 GB para el de video corto. Las instalaciones separadas de imagen y video usan copias locales distintas: la deduplicacion remota no implica ahorro de disco local.
- Requisitos de compilacion: dependencias de desarrollo del sistema documentadas en el tutorial, Python 3.12+ para la herramienta de descarga e inferencia sin dependencia de Python.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / alcance | Formato y runtime | Precision de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SeedVR2-3B-ncnn-dit-fp16 (este repositorio) | ~3B | Imagen y video temporal, hasta 17 fotogramas, lado largo 128 por defecto | ncnn (`.param`/`.bin`), app nativa C++20 con Vulkan/CPU | Pesos lineales DiT en FP16, expandidos a FP32; aritmetica FP32 | Apache-2.0 | Publico en Hugging Face, 0 descargas, revision fijada |
| ByteDance-Seed/SeedVR2-3B (modelo base) | ~3B | Modelo original de restauracion | Pesos originales (PyTorch), requiere conversion a ncnn | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Publico en Hugging Face |
| akashimio/SeedVR2-3B-ncnn (FP32-B) | ~3B | Mismo alcance de imagen y video | ncnn, app nativa C++20 con Vulkan/CPU | FP32 | Apache-2.0 (segun este repositorio) | Publico en Hugging Face, descrito como paquete de referencia |

Otros modelos de restauracion de imagen y video de la misma categoria no se han analizado porque la busqueda web realizada no devolvio informacion tecnica relevante: no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta analisis de sesgo, y al ser un modelo de restauracion de imagen y video, el riesgo relevante es de fidelidad y de alucinacion de detalle, no de sesgo textual.
- Riesgo de alucinacion visual: al ser un modelo de difusion, puede generar detalle plausible que no existe en la fuente. Las cifras publicadas miden fidelidad frente a FP32 y calidad frente a un objetivo fijo, no correccion frente a la verdad terreno.
- FP16 no implica ahorro de VRAM ni aceleracion: los pesos se expanden a FP32 en carga y la aritmetica sigue en FP32. Es compresion de almacenamiento unicamente.
- Limitaciones de contexto y alcance: el video de ejemplo se limita a 17 fotogramas y a un lado largo de salida de 128 por defecto; las mediciones se hicieron con un solo paso y CFG=1. El autor indica que las limitaciones de calidad del modo de un solo paso siguen documentadas.
- Validez de las mediciones: muestra de desarrollo basada en tres clips derivados de una misma fuente, con un corte artificial; no es un benchmark de calidad representativo. Los cambios de residuo entre fotogramas no demuestran ausencia de parpadeo.
- Despliegue: el repositorio no es una distribucion binaria portable; hay que compilar la aplicacion nativa desde el codigo fuente. Los ejecutables antiguos deben recompilarse porque los perfiles nuevos de modelo tienen que ser reconocidos por el cargador nativo.
- Instalacion manual: los archivos bajo `objects/` requieren ensamblaje por parte del instalador; descargar solo un `.bin` no produce un paquete completo.
- Licencia: el repositorio declara Apache-2.0, pero la licencia del modelo base ByteDance-Seed/SeedVR2-3B no se detalla en la informacion proporcionada. Conviene verificarla antes de un uso comercial.
- Idiomas: no aplica ni esta disponible; el modelo no procesa texto.
- Validacion de la comunidad: 0 descargas y 0 likes, sin evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akashimio/SeedVR2-3B-ncnn-dit-fp16
- Modelo base: https://huggingface.co/ByteDance-Seed/SeedVR2-3B
- Paquete de referencia FP32-B: https://huggingface.co/akashimio/SeedVR2-3B-ncnn
- Repositorio de la aplicacion nativa: https://github.com/mingshi2333/seedvr2-ncnn-vulkan
- Documentacion de arquitectura: https://github.com/mingshi2333/seedvr2-ncnn-vulkan/blob/main/docs/ARCHITECTURE.md
- Tutorial de compilacion e instalacion: https://github.com/mingshi2333/seedvr2-ncnn-vulkan/blob/main/docs/TUTORIAL.md
- Mediciones y limitaciones del almacenamiento DiT FP16: https://github.com/mingshi2333/seedvr2-ncnn-vulkan/blob/main/docs/DIT-FP16-STORAGE.md
- La busqueda web realizada no devolvio enlaces tecnicos relevantes sobre este modelo.
