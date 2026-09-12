# Reza2kn/Bina-0.1-Koochik-GGUF

## Resumen

Bina 0.1 Koochik (بینا کوچک) es un modelo de vision-lenguaje orientado a OCR en persa, desarrollado por el usuario Reza2kn. El repositorio analizado es la conversion a GGUF en precision F16 del checkpoint original `Reza2kn/Bina-0.1-Koochik-FP16`, publicada junto con un proyector de vision compatible, un runtime de llama.cpp parcheado y un lanzador en Python que automatiza la descarga, verificacion y ejecucion. Su proposito es permitir OCR de imagenes en persa de forma local y sin conexion, sin necesidad de compilar ni de aplicar parches manualmente.

Tecnicamente se trata de un modelo conversacional image-text-to-text con 565.108.544 parametros (unos 565 millones) cuya arquitectura declarada es Qwen3.5, con un tokenizer WordLevel basado en `Split(Regex("."), Isolated)` y decodificacion Fuse, en lugar del BPE habitual de la familia Qwen. Esa particularidad del tokenizer es la razon por la que el paquete incluye un parche (`surya-wordlevel.patch`) y runtimes precompilados: las compilaciones estandar de llama.cpp, Ollama y otros cargadores GGUF no interpretan correctamente este vocabulario de 65.425 tokens.

Su relevancia actual es doble. Por un lado, cubre un nicho poco atendido, el OCR de persa con vocacion de ejecucion local en hardware de consumo. Por otro, sirve como caso practico de conversion GGUF de un modelo con tokenizer no estandar, documentando con detalle el proceso (procedencia exacta del build, sumas SHA-256, prueba de paridad de tokenizer sobre 2.043 casos con cero discrepancias). No se han publicado resultados de benchmarks de precision en la informacion disponible, y la propia model card insiste en que el resultado de OCR incluido es una prueba de humo sobre un unico recorte, no una evaluacion amplia de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (modelo de vision-lenguaje, image-text-to-text) segun la model card del autor |
| Parametros totales | 565.108.544 (dato real de safetensors del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens por defecto; ampliable a 32.768 con `--context 32768` |
| Tokens de imagen | 4.096 por defecto (`--image-max-tokens`); ampliable a 16.384 |
| Tipos de cuantizacion | F16 en GGUF; el autor indica que F16 evita K-quants |
| Idiomas soportados | persa (fa) |
| Licencia | openrail |
| Formato de pesos | GGUF: `Bina-0.1-Koochik-F16.gguf` (modelo de lenguaje) y `mmproj-Bina-0.1-Koochik-F16.gguf` (proyector de vision, obligatorio para imagenes) |
| Tokenizer | WordLevel, `Split(Regex("."), Isolated)` con decodificacion Fuse; vocabulario de 65.425 tokens; EOS ID 2 |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 2,8 GB |
| Descarga en el primer arranque | aproximadamente 1,34 GB de archivos de modelo mas el runtime |
| Revision del checkpoint de origen | `6282587c9a904d306f388d7b830212dbf55fa752` |

## Arquitectura y entrenamiento

La model card describe la arquitectura como Qwen3.5, con una particularidad critica: el tokenizer no es el BPE de Qwen. Utiliza un esquema WordLevel con `Split(Regex("."), Isolated)` y decodificacion Fuse, de modo que sustituir las reglas BPE de Qwen cambia los identificadores de token y rompe el modelo. El parche incluido preserva el vocabulario de 65.425 tokens, el comportamiento original de los tokens anadidos, los limites de caracteres Unicode, el comportamiento de saltos de linea consecutivos y el manejo de tokens desconocidos. Ademas, escribe el EOS ID 2 a partir de la configuracion del tokenizer y de generacion, en lugar del EOS anidado obsoleto 248044. El checkpoint incluye una capa MTP en su configuracion pero no tensores MTP, por lo que el flag `--no-mtp` es obligatorio.

El paquete GGUF contiene dos componentes: el modelo de lenguaje en F16 y un proyector de vision F16 independiente. Ambos se han convertido desde el checkpoint original en safetensors. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF, DPO u otro ajuste de preferencias.

En cuanto a validacion, el autor documenta una prueba de paridad de tokenizer de 2.043 casos con cero discrepancias de token-ID, un resultado de OCR real sobre un recorte persa ejecutado a traves de llama-server hasta EOS, y una comparacion que muestra coincidencia exacta de texto con el checkpoint original en ese mismo recorte. El propio autor califica esto como una prueba de humo y aclara explicitamente que no constituye un benchmark amplio de precision de OCR. La build de Linux x64 (Ubuntu 24.04) se verifico con offload de modelo y codificador de vision en una NVIDIA RTX 5080 Laptop GPU.

## Capacidades

- OCR de imagenes en persa: el modelo recibe un fichero de imagen y devuelve texto, que es su caso de uso central declarado (pipeline image-text-to-text).
- Generacion de texto conversacional: la etiqueta `conversational` figura entre las del modelo, por lo que admite interaccion por turnos.
- Procesamiento de lenguaje natural en persa: unico idioma declarado en la model card (`language: fa`).
- Vision-lenguaje: incluye un proyector de vision especifico que debe cargarse junto al modelo de lenguaje para cualquier entrada de imagen.
- Ejecucion local y offline: tras el primer arranque, el lanzador funciona sin conexion y sin login en Hugging Face.
- Interfaz web local: el lanzador incluye un servidor (`--server`) que sirve una UI en `http://127.0.0.1:8080` con seleccion de imagen y boton de lectura.
- Inferencia en CPU: disponible mediante el flag `--cpu`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, audio ni modo thinking en la informacion proporcionada.
- Limitacion funcional relevante: la entrada es una imagen por ejecucion; no se incluye renderizado de PDF ni procesamiento multipagina.

## Casos de uso

- Digitalizacion de documentos persas escaneados: el modelo convierte una imagen de pagina en texto plano, lo que permite alimentar sistemas de archivo o indice a partir de escaneos sin depender de servicios en la nube. El limite de 8.192 tokens de contexto y 4.096 tokens de imagen por defecto condiciona el tamano de pagina que conviene procesar en cada pasada.
- Construccion de corpus para RAG en persa: el texto extraido de imagenes puede indexarse en una base vectorial para busqueda semantica sobre documentacion en persa, un idioma con menos herramientas OCR de calidad disponibles que el ingles.
- Extraccion de campos en formularios y facturas: al ser un modelo conversacional ademas de OCR, admite instrucciones para localizar datos concretos en la imagen, lo que resulta util en flujos de captura de datos administrativos.
- Estaciones de trabajo aisladas o air-gapped: dado que el paquete completo funciona offline y el runtime esta precompilado, encaja en entornos sin acceso a internet, como administraciones publicas o laboratorios con politicas restrictivas.
- Revisión asistida de correspondencia o prensa historica: el modelo permite leer recortes y articulos impresos en persa y volcarlos a texto para su posterior analisis o traduccion manual.
- Prototipado e investigacion sobre tokenizers no estandar: el repositorio documenta el parche, el commit exacto de llama.cpp (`3057bb66c86c46d5781e50e85462a760ba7d1feb`) y las pruebas de paridad, por lo que sirve como referencia reproducible para convertir otros modelos con tokenizer WordLevel a GGUF.
- Demo local con interfaz web: el modo `--server` permite montar una demostracion de OCR persa en un equipo de escritorio sin escribir codigo adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni metricas de OCR tipo CER/WER. Lo unico documentado es:

| Prueba | Resultado | Alcance declarado por el autor |
|---|---|---|
| Paridad de tokenizer | 2.043 casos, cero discrepancias de token-ID | Validacion del parche de tokenizer |
| OCR sobre recorte persa | Completado hasta EOS via llama-server; coincidencia exacta de texto con el checkpoint original | Prueba de humo sobre un unico recorte impreso, no un benchmark |
| Arranque del runtime | Executables de Linux x64 y Windows x64 pasaron comprobaciones de arranque y version | Los ejecutables de Windows no se probaron con GPU |

## Requisitos de hardware

- Peso de los pesos F16: aproximadamente 1,13 GB para el modelo de lenguaje, calculado a partir de los 565.108.544 parametros en precision de 16 bits. El proyector de vision anade un consumo adicional no cuantificado en la informacion disponible.
- Descarga inicial: el lanzador descarga alrededor de 1,34 GB entre archivos de modelo y runtime.
- GPU verificada: NVIDIA RTX 5080 Laptop GPU, con offload de modelo y codificador de vision, bajo Vulkan en Linux x64.
- Compatibilidad en GPU de consumo: si, por el orden de magnitud de los pesos, aunque los requisitos exactos de VRAM con cache KV a 8.192 o 32.768 tokens no estan publicados.
- macOS: build para Apple Silicon en macOS 26+ con ejecucion en CPU; este paquete no incluye aceleracion Metal ni GPU.
- Windows: se incluyen ejecutables y DLL Vulkan precompilados; la inferencia por GPU en Windows no ha sido probada por el autor.
- CPU: soportada explicitamente con `--cpu`.
- Dependencias de sistema: Python 3.9 o superior, driver Vulkan del fabricante de la GPU, glibc 2.39 o superior y `libvulkan1` en Ubuntu, y en Windows el runtime Microsoft Visual C++ 2015-2022 x64 si no esta instalado.
- Opciones de despliegue: el lanzador `run_bina.py` y su runtime parcheado son la via soportada. llama.cpp estandar, Ollama y otros cargadores GGUF sin parchear no funcionan con este tokenizer. No hay soporte documentado para vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada; los resultados de busqueda solo devolvieron la propia pagina de Hugging Face del modelo, el arbol de ficheros del checkpoint original y enlaces a una plataforma de cursos sin relacion. La siguiente tabla recoge unicamente lo que consta para este modelo, marcando como no disponible cualquier dato de terceros que no se haya aportado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Bina 0.1 Koochik (GGUF F16) | 565.108.544 | 8.192 por defecto, hasta 32.768 | openrail | Repositorio GGUF con runtime parcheado; requiere lanzador propio |
| Reza2kn/Bina-0.1-Koochik (safetensors) | 565.108.544 (mismo modelo base) | no disponible | openrail | Pesos originales en safetensors, arquitectura qwen3_5 |
| Alternativas de OCR persa o vision-lenguaje de tamano similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de benchmarks de precision: no hay metricas de CER, WER ni evaluaciones comparativas. El unico resultado de OCR publicado es una prueba de humo sobre un unico recorte, y el autor lo advierte de forma explicita.
- Compatibilidad restringida: el tokenizer WordLevel exige el runtime parcheado incluido. Las compilaciones estandar de llama.cpp, Ollama y cualquier otro cargador GGUF sin parche no interpretan correctamente el vocabulario.
- Entrada limitada a una imagen: no hay renderizado de PDF ni procesamiento multipagina, lo que obliga a trocear documentos manualmente.
- Truncado de salida: la generacion se corta en `--max-tokens`, con valor por defecto 2.048.
- Degradacion por resolucion: el propio autor advierte de que los resultados pueden variar si se reduce la resolucion de imagen.
- Ampliar el contexto tiene coste: pasar a `--context 32768 --image-max-tokens 16384` consume considerablemente mas memoria.
- Cobertura de idioma unica: solo persa. No hay soporte declarado de castellano ni de otros idiomas.
- Riesgo de alucinacion: no hay datos especificos publicados. En un modelo de aproximadamente 565 millones de parametros orientado a OCR, es prudente validar la salida antes de usarla en produccion, especialmente en documentos densos o de baja calidad.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia openrail: es una licencia con condiciones de uso (incluidas restricciones de uso aceptable) y no equivale a una licencia permisiva tipo Apache 2.0 o MIT. Debe revisarse el texto completo antes de un uso comercial.
- Estado de validacion del hardware: la inferencia por GPU en Windows no se ha probado; en macOS solo hay ejecucion en CPU. El propio autor indica que no garantiza el comportamiento en la GPU del destinatario.
- Madurez del artefacto: se describe como una conversion funcional para pruebas, con cero descargas y cero likes en el momento de la consulta, y con una fecha de publicacion atipica en los metadatos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Reza2kn/Bina-0.1-Koochik-GGUF
- Modelo base FP16: https://huggingface.co/Reza2kn/Bina-0.1-Koochik-FP16
- Checkpoint original en safetensors: https://huggingface.co/Reza2kn/Bina-0.1-Koochik/tree/main
- Lanzador `run_bina.py`: https://huggingface.co/Reza2kn/Bina-0.1-Koochik-GGUF/resolve/main/run_bina.py
- Repositorio del runtime reproducible: https://github.com/Reza2kn/bina-llama-runtime
- llama.cpp (commit de referencia `3057bb66c86c46d5781e50e85462a760ba7d1feb`): https://github.com/ggml-org/llama.cpp
- Runtime de Visual C++ para Windows: https://aka.ms/vs/17/release/vc_redist.x64.exe
