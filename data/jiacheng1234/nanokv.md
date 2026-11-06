# jiacheng1234/NanoKV

## Resumen

NanoKV es un conjunto de checkpoints de compresión de caché KV (KV cache) diseñado específicamente para generación de vídeo autorregresiva. Lo desarrolla jiacheng1234 y se publica como artefactos complementarios para tres backbones de generación de vídeo: HY-WorldPlay, LingBot-World 2.0 y Matrix-Game 3.5. No es un modelo de lenguaje generativo autónomo, sino un códec de compresión junto con lectores de atención rápidos (Fast readers) que se acoplan a modelos de vídeo existentes para reducir el coste de memoria de la caché KV durante la inferencia autorregresiva.

El repositorio contiene tres directorios independientes, uno por backbone, cada uno con un `codec.pt`, un conjunto de readers, perfiles de inferencia, una plantilla de manifiesto portátil, sumas de verificación y una guía específica. El tamaño total del repo es de 2,1 GB, distribuido en 281 MiB para HY-WorldPlay, 1.260 MiB para LingBot-World 2.0 y 452 MiB para Matrix-Game 3.5.

Su relevancia radica en que la generación de vídeo autorregresiva acumula cachés KV de gran longitud, y NanoKV propone una compresión de alta ratio que se integra mediante un manifiesto local generado con `nanokv.prepare_artifacts`. La licencia es específica por backbone y debe consultarse en el archivo `LICENSES.md` del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Códec de compresión de caché KV más lectores de atención rápidos (Fast readers) acoplados a backbones de vídeo autorregresivos |
| Parametros totales | no disponible (se distribuye como checkpoints por backbone: 281 MiB, 1.260 MiB y 452 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | model-specific-checkpoint-licenses (other), ver LICENSES.md |
| Formato de pesos | PyTorch (`codec.pt`, directorio `readers/`), manifiestos JSON de perfiles de inferencia |

## Arquitectura y entrenamiento

NanoKV no es un transformer generativo al uso, sino una capa de compresión de la caché KV que se inserta en el pipeline de atención de modelos de vídeo autorregresivos. El componente central es un códec (`codec.pt`) que comprime las claves y valores acumulados, y un conjunto de lectores de atención rápidos (entre 30 y 41 readers según el backbone) que permiten reconstruir o aproximar la atención sobre la caché comprimida. NanoKV y la variante Fast comparten el mismo códec; Fast añade además los readers.

El repositorio no proporciona detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO, ya que el objeto de entrenamiento es el códec y los readers, no un modelo de lenguaje. La integración se realiza mediante un manifiesto local generado con `python -m nanokv.prepare_artifacts`, que vincula los readers al directorio de descarga y se usa junto con los perfiles `nanokv.json` o `fast.json` para la inferencia.

## Capacidades

- Compresión de caché KV de alta ratio para generación de vídeo autorregresiva.
- Acoplamiento a tres backbones concretos: HY-WorldPlay, LingBot-World 2.0 y Matrix-Game 3.5.
- Variante Fast con lectores de atención para acelerar la lectura sobre la caché comprimida.
- Perfiles de inferencia predefinidos (`nanokv.json` y `fast.json`) para cada backbone.
- Verificación de integridad mediante sumas SHA-256 (`SHA256SUMS`).
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling ni agentes, al no ser un modelo de lenguaje de propósito general.

## Casos de uso

- Generación de vídeo autorregresiva con memoria limitada: usar NanoKV para comprimir la caché KV acumulada en HY-WorldPlay y reducir el consumo de memoria durante secuencias largas, manteniendo la calidad de generación según el perfil de inferencia elegido.
- Aceleración de la inferencia en LingBot-World 2.0: emplear la variante Fast con sus 40 readers para disminuir el coste de atención sobre la caché comprimida en pipelines de generación de vídeo de larga duración.
- Despliegue en entornos con VRAM ajustada: integrar el códec de Matrix-Game 3.5 (452 MiB) para permitir la ejecución de generación de vídeo en GPUs con menos memoria que la requerida por el modelo base sin compresión.
- Investigación sobre compresión de caché KV: utilizar los checkpoints como referencia reproducible para comparar ratios de compresión y su impacto en la calidad del vídeo generado.
- Integración en pipelines de producción de vídeo: descargar un único backbone con `hf download ... --include "hy-worldplay/*"` y validar la integridad con `sha256sum -c SHA256SUMS` antes de desplegar.
- Experimentación con manifiestos portátiles: generar manifiestos locales con `nanokv.prepare_artifacts` para adaptar los readers a distintas rutas de instalación y entornos de ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del backbone base (HY-WorldPlay, LingBot-World 2.0 o Matrix-Game 3.5), no documentado en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: inferencia mediante el paquete `nanokv` del repositorio de código, con perfiles `nanokv.json` o `fast.json`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de compresión de caché KV para generación de vídeo autorregresiva ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje de propósito general: solo funciona acoplado a los backbones HY-WorldPlay, LingBot-World 2.0 o Matrix-Game 3.5.
- La licencia es específica por backbone (`model-specific-checkpoint-licenses`); es obligatorio revisar `LICENSES.md` y los archivos de licencia de cada directorio antes de cualquier uso comercial.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no genera texto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación.
- La integración requiere generar un manifiesto local con `nanokv.prepare_artifacts`; un manifiesto incorrecto puede impedir el uso de los readers Fast.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en producción sin pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/jiacheng1234/NanoKV
- Página del proyecto: https://jiacheng-lu03.github.io/NanoKV/
- Código: https://github.com/jiacheng-lu03/NanoKV
- Guía de inferencia: https://github.com/jiacheng-lu03/NanoKV/blob/main/infer/README.md
- Guía de instalación: https://github.com/jiacheng-lu03/NanoKV/blob/main/docs/SETUP.md
- Licencias: https://huggingface.co/jiacheng1234/NanoKV/blob/main/LICENSES.md
