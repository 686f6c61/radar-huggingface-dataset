# rezkhos/Bina-Desktop

## Resumen

Bina-Desktop es una aplicación de escritorio para Windows, distribuida a través de Hugging Face, que realiza reconocimiento óptico de caracteres (OCR) sobre texto persa (farsi), tanto impreso como manuscrito, sin conexión a internet. El repositorio no contiene pesos de modelo en el sentido tradicional, sino un instalador ejecutable (`Bina-Setup-0.4.2.exe`, 1626 MB) junto con el código fuente del programa. La inferencia se delega en el modelo `Reza2kn/Bina-0.4-Koochik-ONNX-INT4`, un modelo de imagen-a-texto cuantizado a 4 bits en formato ONNX, desarrollado por Reza Siyar.

El problema que resuelve es la digitalización de archivos persas en entornos con requisitos de privacidad: el motor corre exclusivamente en `127.0.0.1` y la aplicación bloquea cualquier petición de red externa, de modo que los documentos del usuario no salen del equipo. La interfaz es completamente persa y con dirección de escritura de derecha a izquierda, e incluye doce páginas de muestra con texto de referencia para medir la precisión del modelo tras cada lectura.

El proyecto es relevante por su enfoque de producto cerrado sobre un modelo pequeño (repo de 6,1 GB, instalador de 1,6 GB), su soporte de GPU Nvidia opcional con verificación previa del dispositivo y su licencia dual (MIT para la aplicación, OpenMDW-1.1 para el modelo). No se publican detalles de arquitectura ni de entrenamiento del modelo subyacente en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo subyacente de imagen-a-texto; la aplicación es un wrapper de escritorio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (ONNX, según el nombre del modelo base) |
| Idiomas soportados | Persa (farsi), `fa` |
| Licencia | Aplicación: MIT; modelo: OpenMDW-1.1; licencia compuesta declarada: `bina-desktop-mit-and-openmdw-1.1` |
| Formato de pesos | ONNX cuantizado INT4 (modelo base); la distribución es un instalador `.exe` de Windows |
| Tamano del repositorio | 6,1 GB |
| Tamano del instalador | 1626 MB (Bina-Setup-0.4.2.exe) |
| Plataformas | Windows 10/11 (64 bits) y Windows 8.1 (limitado); no soporta Windows 7, 8 ni 32 bits |
| Aceleración por hardware | CPU; GPU Nvidia opcional (driver 580 o superior) |
| Modelo base | `Reza2kn/Bina-0.4-Koochik-ONNX-INT4` |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo `Bina-0.4-Koochik` (tipo de transformer, número de capas, dimensión oculta, mecanismo de atención o estrategia de decodificación). La única información técnica concreta es que se distribuye en formato ONNX con cuantización INT4, lo que reduce el peso en disco y permite ejecución en CPU con un consumo de memoria de trabajo de aproximadamente 2,3 a 2,7 GB según el autor.

Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino supervisado o preferencias (RLHF/DPO). El autor menciona que las páginas manuscritas de evaluación proceden de un conjunto de test no visto durante el entrenamiento, y que los datos de escritura manuscrita provienen del dataset público `Reza2kn/persian-handwriting-pages-3.69m`, construido a partir de palabras manuscritas reales del corpus de Taha Gorji. La innovación destacable del proyecto no está en el modelo sino en la integración: comprobación automática de la GPU al arrancar (se usa solo si la validación es correcta, con retroceso a CPU), motor local aislado en loopback y comparación lado a lado de imagen y texto reconocido.

## Capacidades

- Reconocimiento de texto persa impreso en tipografía moderna, incluyendo capturas fotográficas de móvil y PDF de varias páginas.
- Reconocimiento de texto manuscrito persa sobre papel blanco y amarillo, hojas de examen, fotos de cuadernos y formularios con poca luz.
- Procesamiento de imágenes en formatos JPG, PNG, WEBP, TIFF y BMP, además de PDF multipágina y pegado directo desde el portapapeles con Ctrl+V.
- Visualización del texto reconocido junto a la imagen original, con zoom y pantalla completa para revisión línea a línea.
- Visualización del texto en vivo durante el reconocimiento, con posibilidad de detener y relanzar la lectura.
- Exportación del resultado a fichero de texto, individual o en lote.
- Evaluación de precisión integrada: doce páginas de muestra con texto de referencia y cálculo del porcentaje de caracteres correctos.
- Interfaz completa en persa con dirección RTL y temas claro, oscuro o sincronizado con Windows.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento extendido.

## Casos de uso

- Digitalización de bibliotecas y archivos persas: el usuario arrastra lotes de PDF e imágenes y obtiene texto editable y buscable sin enviar los documentos a ningún servicio externo, lo que encaja con archivos con restricciones de confidencialidad.
- Transcripción de correspondencia y notas manuscritas: la precisión declarada del 97,3 al 100 % en cinco muestras manuscritas (papel blanco y amarillo, examen, cuaderno y formulario con poca luz) lo hace adecuado para convertir cartas y apuntes personales en texto reutilizable.
- Revisión y corrección asistida de OCR: la vista lado a lado con la imagen original y el zoom permiten comparar y corregir manualmente los errores, útil en flujos editoriales donde se exige exactitud.
- Trabajo de campo sin conectividad: al no requerir internet ni cuenta, puede usarse en equipos aislados, entornos con red restringida o portátiles sin conexión estable.
- Docencia e investigación sobre lengua persa: el conjunto de doce páginas de muestra con referencia y métrica de precisión permite evaluar de forma reproducible el comportamiento del modelo sobre distintos tipos de documento.
- Despliegue en equipos modestos: con 8 GB de RAM recomendados y unos 2,3 a 2,7 GB de memoria en ejecución, funciona en portátiles de oficina; con GPU Nvidia el tiempo por página baja de 45-60 segundos (CPU) a unos 11 segundos.
- Preprocesado documental en pipelines internos: la salida a ficheros de texto permite encadenar el OCR con indexación o búsqueda local sin exponer los documentos a terceros.

## Benchmarks y rendimiento

El autor publica métricas de precisión por carácter sobre las doce páginas de muestra incluidas en la aplicación (caracteres árabes/persas de ye y kaf unificados, sin diacríticos ni espacios adicionales; las muestras manuscritas proceden de un conjunto de test no visto en entrenamiento).

| Tipo de documento | Muestras | Precisión por carácter |
|---|---|---|
| Impreso (texto moderno, foto de móvil, PDF de dos páginas) | 3 | 99,7 – 99,8 % |
| Poesía impresa a dos columnas con diacríticos | 1 | 93,8 % |
| Manuscrito (papel blanco y amarillo, examen, cuaderno, formulario con poca luz) | 5 | 97,3 – 100 % |
| Tabla manuscrita (boletín de notas) | 1 | 65,6 % |
| Poesía en nastaliq sintética, una columna / dos columnas | 2 | 91,0 % / 63,3 % |

Rendimiento medido en un portátil con Core i7-13650HX, 16 GB de RAM y RTX 3050: 45-60 segundos por página de libro en CPU y aproximadamente 11 segundos con GPU, con texto idéntico en ambos modos; arranque de la aplicación de 9 a 17 segundos (hasta 90 segundos la primera vez tras la instalación con GPU).

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Memoria en ejecución: aproximadamente 2,3 a 2,7 GB, liberada al cerrar la ventana.
- RAM del sistema recomendada: 8 GB.
- Espacio en disco: unos 1,8 GB (1,4 GB adicionales si se instala el paquete de GPU).
- GPU: Nvidia opcional con driver 580 o superior; la aplicación comprueba el dispositivo al arrancar y recurre a CPU si la validación falla. Configurable en Ajustes como automático o solo CPU.
- CPU: funciona sin GPU; en el equipo de referencia (i7-13650HX) tarda 45-60 segundos por página.
- GPU de referencia probada: RTX 3050 (unos 11 segundos por página). No se documentan pruebas con A100, H100 ni RTX 4090.
- Despliegue: aplicación de escritorio Windows con instalador `.exe`; no se documenta integración con vLLM, llama.cpp, Ollama o TGI. El modelo subyacente está en ONNX INT4 y el código fuente de la aplicación (MIT) se distribuye en `Bina-Desktop-0.4.2-source.zip`, con guía de compilación en `AGENTS.md`.
- Sistema operativo: Windows 10 u 11 en cualquier versión, o Windows 8.1 (en 8.1 la aplicación se abre en Edge, no usa ventana propia ni GPU). No soporta Windows 7, 8 ni 32 bits.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. A continuación se comparan únicamente las alternativas de despliegue del propio modelo base:

| Alternativa | Formato | Licencia | Contexto de uso |
|---|---|---|---|
| Bina-Desktop (este repo) | Aplicación Windows + ONNX INT4 | MIT (app) + OpenMDW-1.1 (modelo) | Uso de escritorio offline con interfaz persa |
| `Reza2kn/Bina-0.4-Koochik-ONNX-INT4` | ONNX INT4 | OpenMDW-1.1 | Integración directa del modelo en pipelines propios |
| `Reza2kn/Bina-0.4-Koochik` (modelo original) | no disponible | no disponible | Referencia de origen del modelo cuantizado |

No disponible para comparación con otros modelos OCR persas (parámetros, contexto, rendimiento y licencia).

## Limitaciones y advertencias

- En tablas, poesía a dos columnas y páginas complejas, las palabras suelen reconocerse correctamente pero el orden de lectura puede desordenarse; la precisión en tabla manuscrita cae al 65,6 % y en poesía nastaliq a dos columnas al 63,3 %.
- El nastaliq manuscrito real sigue siendo más difícil que el sintético evaluado; no se publican métricas para ese caso.
- El modelo solo soporta persa (`fa`); no se documenta multilingüismo.
- No se documentan sesgos concretos ni tasas de alucinación del modelo subyacente; al ser una tarea de transcripción, el riesgo principal es la omisión o reordenación de texto más que la invención de contenido, pero no hay datos que lo cuantifiquen.
- Los ficheros de instalación no están firmados digitalmente; Windows mostrará el aviso "Windows protected your PC" y requiere "More info" → "Run anyway".
- En Windows 8.1 la aplicación se ejecuta dentro de Edge, sin ventana propia y sin aceleración por GPU.
- La licencia es compuesta: el código de la aplicación es MIT, pero el modelo es OpenMDW-1.1. Cualquier uso comercial debe verificar ambas condiciones; no se detallan restricciones adicionales de OpenMDW-1.1 en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación indicada (2026-10-26) es posterior a la fecha actual, lo que conviene verificar antes de adoptarlo en producción.
- No se publican detalles de arquitectura, entrenamiento ni benchmarks estándar, lo que limita la evaluación técnica independiente del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rezkhos/Bina-Desktop
- Modelo base: https://huggingface.co/Reza2kn/Bina-0.4-Koochik-ONNX-INT4
- Dataset de escritura manuscrita persa: https://huggingface.co/datasets/Reza2kn/persian-handwriting-pages-3.69m
- Descarga del instalador: https://huggingface.co/rezkhos/Bina-Desktop/resolve/main/Bina-Setup-0.4.2.exe?download=true
- Código fuente de la aplicación: https://huggingface.co/rezkhos/Bina-Desktop/resolve/main/Bina-Desktop-0.4.2-source.zip?download=true
- Perfil del desarrollador de la aplicación: https://huggingface.co/rezkhos
- Perfil del autor del modelo: https://huggingface.co/Reza2kn
