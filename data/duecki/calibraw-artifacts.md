# Duecki/CalibRaw-Artifacts

## Resumen

Duecki/CalibRaw-Artifacts no es un modelo individual, sino un repositorio espejo de artefactos de terceros mantenido por Duecki (Linus D) para el editor RAW CalibRaw. Su propósito es fijar las descargas de la aplicación a una revisión inmutable de Hugging Face, de modo que los modelos ONNX y los binarios de ONNX Runtime que CalibRaw necesita no dependan de ramas mutables ni de enlaces de terceros que puedan cambiar o desaparecer. El repositorio ocupa 4,3 GB y no contiene pesos entrenados por su autor: cada artefacto conserva su licencia original, por lo que la colección es multi-licencia (MIT, Apache-2.0 y GPL-3.0).

El contenido se organiza en dos bloques. El primero son modelos ONNX orientados a visión por computador dentro del flujo de revelado fotográfico: segmentación de sujeto (BiRefNet), segmentación de cielo (SkySeg U2Net), segmentación guiada por prompt (SAM 2.1 Hiera Tiny), estimación de profundidad en escritorio (Depth Anything 3 Mono Large) y en Android (Depth Anything V2 Small FP32), inpainting (Big-LaMa Places2) y denoising/demosaicing de RAW (RawNIND, paquete .dtmodel con dos ONNX embebidos). El segundo bloque son los archivos oficiales de ONNX Runtime para CPU en Linux, macOS y Windows, en versiones 1.29.0 y 1.30.0, con la excepción de macOS x86-64, anclado en 1.23.2.

Es relevante ahora por un motivo de ingeniería de distribución más que de investigación: demuestra un patrón de empaquetado reproducible para aplicaciones de escritorio y móvil que dependen de varios modelos ONNX y de un runtime concreto, con verificación mediante SHA-256 (SHA256SUMS.txt), un mapa de procedencia por fichero (ARTIFACTS.md) y recomendación explícita de usar pines por commit SHA de 40 caracteres en lugar de `/main/`. No hay parámetros, contexto, tokenizador ni idiomas que reportar: el repositorio no documenta arquitecturas, recuentos de parámetros ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Colección heterogénea de artefactos ONNX (segmentación, profundidad, inpainting, denoising RAW); las arquitecturas concretas no se documentan en el repositorio |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelos de visión, no generativos de texto) |
| Tipos de cuantización | FP32 declarado en Depth Anything V2 Small, SkySeg U2Net y Big-LaMa Places2; el resto de artefactos no especifica tipo numérico |
| Idiomas soportados | no disponible (no aplicable a modelos de visión) |
| Licencia | other (colección multi-licencia: MIT, Apache-2.0 y GPL-3.0 según artefacto) |
| Formato de pesos | ONNX (`.onnx`); RawNIND se distribuye como paquete `.dtmodel` con dos modelos ONNX embebidos |
| Autor del repositorio | Duecki (Linus D) |
| Tamaño del repositorio | 4,3 GB |
| Número de componentes | 7 familias de modelos más 11 archivos de ONNX Runtime |
| Idiomas de la documentación | inglés |
| Plataformas objetivo | Linux (x86-64, ARM64), macOS (Apple Silicon, Intel x86-64), Windows (x86-64, ARM64), Android (vía Depth Anything V2 Small) |
| Fecha de creación | 2026-09-02 |
| Última actualización | 2026-10-12 |
| Descargas registradas | 0 |
| Likes | 1 |

Componentes incluidos:

| Componente | Artefacto o versión | Función | Licencia |
|---|---|---|---|
| BiRefNet | Release `v1`: General-Lite epoch 232, Lite-2K epoch 232, HR epoch 130 | Segmentación de sujeto y fondo | MIT |
| SkySeg U2Net | FP32 ONNX, `skyseg.onnx` (176 MB) | Segmentación de cielo | MIT |
| SAM 2.1 | Hiera Tiny, encoder y decoder, revisión de conversión `aa116690…` | Segmentación de objetos guiada por prompt | Apache-2.0 |
| Depth Anything 3 | Mono Large, entrada 700x700, `da3mono_large_700x700.onnx` (731 MB) | Máscaras de profundidad y niebla en escritorio | Apache-2.0 |
| Depth Anything V2 | Small FP32, entrada 518 px, `depth_anything_v2_small_fp32.onnx` (99 MB), export de ONNX Community, revisión `4472b736…` | Máscaras de profundidad y niebla en Android | Apache-2.0 |
| Big-LaMa | Places2 FP32, revisión de conversión `a3ee2fca…` | Inpainting de imagen | Apache-2.0 |
| RawNIND | darktable-ai release `5.6.0`, paquete `.dtmodel`, UtNet2 Bayer y Linear Rec.2020 | Denoising y demosaicing de RAW | GPL-3.0 |

Runtime incluido:

| Sistema operativo | Arquitectura | ONNX Runtime | Archivo original |
|---|---|---|---|
| Linux | ARM64 / AArch64 | 1.29.0 y 1.30.0 | `onnxruntime-linux-aarch64-*.tgz` |
| Linux | x86-64 | 1.29.0 y 1.30.0 | `onnxruntime-linux-x64-*.tgz` |
| macOS | Apple Silicon / ARM64 | 1.29.0 y 1.30.0 | `onnxruntime-osx-arm64-*.tgz` |
| macOS | Intel x86-64 | 1.23.2 | `onnxruntime-osx-x86_64-1.23.2.tgz` |
| Windows | ARM64 | 1.29.0 y 1.30.0 | `onnxruntime-win-arm64-*.zip` |
| Windows | x86-64 | 1.29.0 y 1.30.0 | `onnxruntime-win-x64-*.zip` |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado por el autor del repositorio, sino de un espejo de artefactos ajenos. Por tanto no hay proceso de entrenamiento, dataset, número de tokens ni fases de RLHF o DPO que describir: el trabajo de este repositorio es de empaquetado, versionado y verificación de integridad. El repositorio es explícito al respecto ("These artifacts were not authored by the maintainer of this mirror") y remite a las fuentes upstream para la atribución.

Lo que sí documenta el repositorio es la procedencia y el formato de cada pieza. Todos los modelos se distribuyen en formato ONNX portable y no están dirigidos a un sistema operativo de escritorio ni a un conjunto de instrucciones de CPU concreto; la compatibilidad real depende de la compilación de ONNX Runtime, de los operadores soportados y del execution provider seleccionado. Los artefactos de segmentación y profundidad se exportan con entradas de resolución fija (518 px en Depth Anything V2 Small y 700x700 en Depth Anything 3 Mono Large) y SAM 2.1 se reparte en un encoder y un decoder independientes, ambos ONNX, con Hiera Tiny como backbone según la nomenclatura del propio repositorio. Big-LaMa se exporta desde Places2 en FP32 y RawNIND se empaqueta en el formato `.dtmodel` de darktable-ai 5.6.0 con dos modelos UtNet2 embebidos para las rutas Bayer y Linear Rec.2020. Las arquitecturas internas de BiRefNet, SkySeg U2Net, Depth Anything 3 y SAM 2.1 no se detallan en la model card más allá de sus nombres y orígenes.

La innovación técnica destacable no está en los modelos, sino en el método de distribución: cada payload tiene un digest SHA-256 publicado en `SHA256SUMS.txt`, un mapa de procedencia en `ARTIFACTS.md` y un directorio `licenses/` con textos de licencia y avisos de terceros. El repositorio conserva tanto 1.29.0 como 1.30.0 de ONNX Runtime para Linux, macOS ARM64 y Windows para dar margen de compatibilidad, y mantiene las grafías históricas de directorio (por ejemplo `models/briefnet/`) para no romper rutas existentes.

## Capacidades

- Segmentación de sujeto y fondo en imágenes, mediante los tres checkpoints de BiRefNet (General-Lite, Lite-2K y HR).
- Segmentación de cielo, mediante SkySeg U2Net en FP32, pensada para flujos de reemplazo o ajuste de cielo.
- Segmentación de objetos guiada por prompt, con SAM 2.1 Hiera Tiny en encoder y decoder separados.
- Estimación de profundidad monocular en escritorio con Depth Anything 3 Mono Large (entrada 700x700) y en Android con Depth Anything V2 Small FP32 (entrada 518 px). El repositorio indica que CalibRaw usa DA3 en Linux, Windows y macOS, y DA2 Small en Android.
- Generación de máscaras de niebla a partir de los modelos de profundidad.
- Inpainting de imagen con Big-LaMa Places2 FP32.
- Denoising y demosaicing de archivos RAW con RawNIND, en dos variantes: Bayer y Linear Rec.2020.
- Distribución verificable del runtime: archivos oficiales de ONNX Runtime CPU para seis combinaciones de sistema operativo y arquitectura, con digest local coincidente con el publicado en los metadatos de release de GitHub.
- No dispone de generación de texto, razonamiento, matemáticas, código, tool calling, function calling, capacidades de agente, razonamiento multi-paso, modo thinking, audio ni procesamiento de lenguaje natural de ningún tipo.
- No se documenta soporte multilingüe; los artefactos son de visión y el idioma no interviene en su funcionamiento.

## Casos de uso

- Enmascarado automático de sujeto en revelado fotográfico: BiRefNet genera una máscara de sujeto que el editor usa para aplicar exposiciones, curvas o desenfoques locales sin pintar a mano; los tres checkpoints permiten elegir entre velocidad (General-Lite) y detalle (HR).
- Sustitución o equilibrio de cielo: SkySeg U2Net produce la máscara de cielo a partir de la cual se aplican ajustes de luminosidad, color o reemplazo completo; al ser una máscara portable ONNX, funciona igual en escritorio y en dispositivos sin GPU dedicada.
- Máscaras de profundidad y efecto de niebla en escritorio: Depth Anything 3 Mono Large, con entrada de 700x700, aporta el mapa de profundidad que el editor usa para desenfoques graduales y para generar niebla atmosférica sintética.
- Máscaras de profundidad en Android: Depth Anything V2 Small FP32, con entrada de 518 px y solo 99 MB, permite el mismo tipo de efectos en móvil manteniendo la descarga y la memoria contenidas.
- Eliminación de objetos y retoque por inpainting: Big-LaMa Places2 FP32 rellena las regiones enmascaradas, lo que sirve para borrar elementos no deseados o para reconstruir zonas tras un recorte.
- Segmentación interactiva iniciada por el usuario: SAM 2.1 Hiera Tiny acepta prompts y devuelve la máscara del objeto señalado, útil para selecciones precisas de elementos concretos sin modelo de lenguaje ni descripciones textuales.
- Limpieza de ruido en flujos RAW: RawNIND actúa sobre datos sin revelar, con una ruta Bayer y otra Linear Rec.2020, de modo que el denoising se aplica antes del revelado y no sobre una imagen ya procesada.
- Distribución reproducible de una aplicación de escritorio: un equipo puede fijar el commit SHA completo del repositorio espejo en su sistema de build y descargar siempre los mismos artefactos con los mismos digests, evitando que un upstream cambie o retire un fichero.
- Verificación de integridad en CI/CD: `sha256sum --check SHA256SUMS.txt` en la canalización de build detecta cualquier corrupción o sustitución de un modelo o de un archivo de runtime antes de empaquetar la aplicación.
- Aplicaciones de retoque sin GPU: los modelos ONNX se pueden ejecutar con las compilaciones de ONNX Runtime CPU incluidas en el propio repositorio, lo que cubre equipos sin acelerador dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de visión como IoU, mAP o error de profundidad, y tampoco documenta latencias ni throughput. Los únicos datos cuantitativos publicados son tamaños de fichero y versiones de los artefactos.

## Requisitos de hardware

- Los artefactos incluidos son modelos ONNX portables; el fabricante no publica requisitos de VRAM. Las cifras siguientes son estimaciones derivadas del tamaño de fichero en FP32 (los pesos ocupan aproximadamente lo que ocupa el archivo) más un margen de activaciones y memoria del runtime.
- Depth Anything V2 Small FP32 (99 MB): en torno a 100 MB de pesos y del orden de 200 a 300 MB de memoria total en ejecución. Cabe en cualquier GPU de consumo y se ejecuta con holgura en CPU.
- SkySeg U2Net FP32 (176 MB): alrededor de 176 MB de pesos. Igualmente apto para GPU de consumo y para CPU.
- Depth Anything 3 Mono Large (731 MB, entrada 700x700): unos 731 MB de pesos y del orden de 1,5 a 2 GB de memoria total estimada en ejecución por la resolución de entrada. Cabe en GPU de consumo con 4 GB o más de VRAM.
- BiRefNet, SAM 2.1 Hiera Tiny, Big-LaMa y RawNIND: tamaño por fichero no disponible. El total del repositorio es de 4,3 GB, cifra que incluye los 11 archivos de ONNX Runtime y no permite deducir el tamaño individual de cada modelo.
- GPU recomendadas: no disponibles en la información del repositorio. Dado el rango de tamaños, cualquier GPU con 4 GB o más de VRAM es suficiente para los artefactos de tamaño conocido.
- Compatibilidad con GPU de consumo: sí para Depth Anything V2 Small, SkySeg y, por tamaño, para Depth Anything 3 Mono Large. No se puede confirmar para BiRefNet, SAM 2.1, Big-LaMa y RawNIND al no publicarse sus tamaños.
- Despliegue: ONNX Runtime, con las compilaciones oficiales de CPU incluidas en el propio repositorio para Linux x86-64 y ARM64, macOS Apple Silicon y x86-64, y Windows x86-64 y ARM64. El repositorio advierte de que la compatibilidad depende del build de ONNX Runtime, de los operadores soportados y del execution provider elegido. Para aceleración por GPU habría que aportar un execution provider adecuado (CUDA, TensorRT, DirectML, CoreML o NNAPI), ya que los archivos incluidos son exclusivamente de CPU. vLLM, llama.cpp y Ollama no aplican a estos artefactos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Este repositorio no compite con un modelo, sino con la descarga directa de cada artefacto desde su origen. La comparación relevante es de método de distribución.

| Criterio | Duecki/CalibRaw-Artifacts | Descarga directa desde cada upstream |
|---|---|---|
| Número de orígenes a gestionar | Uno (7 familias de modelos y 11 archivos de runtime) | Siete o más (GitHub releases, Hugging Face, exportaciones de ONNX Community) |
| Fijación de versión | Pin por commit SHA de 40 caracteres, con advertencia explícita contra `/main/` | Depende de si el upstream publica revisiones inmutables |
| Verificación de integridad | SHA-256 de todos los payloads en `SHA256SUMS.txt` | No uniforme entre proyectos |
| Trazabilidad de licencias | Directorio `licenses/` con avisos; falta el texto de SkySeg y de Depth Anything | Cada proyecto publica la suya, con formatos dispares |
| Riesgo de desaparición del origen | Reducido mientras el espejo exista | Alto si un release o un repositorio se retira |
| Actualidad de los artefactos | Depende de que el mantenedor sincronice el espejo | Siempre la última versión publicada |
| Licencia global | `other` (multi-licencia) | La de cada proyecto por separado |

Comparación entre los dos modelos de profundidad incluidos, que cubren el mismo tipo de tarea en plataformas distintas:

| Criterio | Depth Anything 3 Mono Large | Depth Anything V2 Small FP32 |
|---|---|---|
| Plataforma objetivo | Escritorio (Linux, Windows, macOS) | Android |
| Resolución de entrada | 700x700 | 518 px |
| Tamaño del fichero | 731 MB | 99 MB |
| Precisión declarada | no disponible | FP32 |
| Licencia | Apache-2.0 | Apache-2.0 |
| Origen de la conversión | no disponible | Export de ONNX Community, revisión `4472b736…` |

No hay datos de precisión ni de rendimiento que permitan comparar cualquiera de estos artefactos con alternativas externas de la misma tarea.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo de texto. No admite prompts en lenguaje natural, tool calling, agentes ni razonamiento multi-paso. Cualquier expectativa en ese sentido es un error de interpretación del repositorio.
- No hay información sobre sesgos. Al tratarse de modelos de visión sin documentación de sus datasets de entrenamiento en este repositorio, no se pueden evaluar sesgos demográficos, geográficos o de contenido. BiRefNet y SAM 2.1 dependen de los datos de sus proyectos originales.
- Riesgo de alucinación: concepto no aplicable a segmentación, profundidad, inpainting o denoising. Sí existen modos de fallo propios: máscaras de sujeto incompletas, bordes imprecisos en objetos finos, mapas de profundidad suavizados en superficies especulares y artefactos de relleno en inpainting.
- Limitaciones de entrada: Depth Anything V2 Small trabaja a 518 px y Depth Anything 3 Mono Large a 700x700, resoluciones fijas que obligan a redimensionar y pueden degradar el detalle fino.
- Licencias: el repositorio se declara como `other` a nivel de metadatos de Hugging Face, pero es una colección multi-licencia. RawNIND está bajo GPL-3.0, lo que impone obligaciones de copyleft sobre el software que lo distribuya o lo enlace; BiRefNet y SkySeg U2Net son MIT; SAM 2.1, Depth Anything 3, Depth Anything V2 y Big-LaMa son Apache-2.0. La propia model card indica que no existe una única licencia que sustituya a las condiciones de origen y remite a `licenses/README.md` antes de redistribuir cualquier artefacto.
- Hueco documental de licencias: los textos de licencia de SkySeg y de los modelos Depth Anything no están todavía en el directorio `licenses/`; sus condiciones se afirman según el fichero `THIRD_PARTY_NOTICES.md` de CalibRaw.
- Es un espejo de terceros sin autoría sobre los modelos. Cualquier problema de calidad, sesgo o licencia proviene de los proyectos upstream, y la responsabilidad de mantenimiento recae en el autor del espejo.
- Riesgo de desincronización: al no ser un repositorio upstream, los artefactos pueden quedar desactualizados respecto a nuevas versiones de los proyectos originales.
- Compatibilidad dependiente del runtime: los modelos ONNX no están vinculados a un sistema operativo ni a un conjunto de instrucciones concreto, pero su funcionamiento real depende del build de ONNX Runtime, de los operadores soportados y del execution provider. Los archivos de runtime incluidos son solo para CPU.
- Tracción mínima: 0 descargas y 1 like en el momento de la consulta. No hay evidencia pública de uso en producción ni de validación independiente de los artefactos.
- Fechas de publicación y actualización registradas en 2026, posteriores a las de la mayoría de los artefactos upstream que replica.
- El repositorio insiste en no usar la rama `/main/` en producción, ya que es mutable; mover una etiqueta o una rama no ofrece la misma garantía de integridad que un commit SHA completo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Duecki/CalibRaw-Artifacts
- Perfil del autor en Hugging Face: https://huggingface.co/Duecki/models
- Repositorio principal de CalibRaw: https://git.dueckis.de/duecki/CalibRaw
- Código de CalibRaw en GitHub: https://github.com/Duecki1/CalibRaw
- BiRefNet release v1: https://github.com/ZhengPeng7/BiRefNet/releases/tag/v1
- SAM 2 (Meta): https://github.com/facebookresearch/sam2
- ONNX Runtime releases (microsoft/onnxruntime): https://github.com/microsoft/onnxruntime/releases
- Conversión ONNX de SAM 2, revisión `akiyamanx`: URL truncada en la model card, no disponible completa
- Hilo de presentación de CalibRaw v1.0.0 en discuss.pixls.us: https://discuss.pixls.us/t/calibraw-v1-0-0-raw-editor-gpu-accelerated-linux-focused/60692
- Ficheros internos de referencia citados en la model card: `ARTIFACTS.md`, `SHA256SUMS.txt`, `licenses/README.md` (dentro del propio repositorio)
