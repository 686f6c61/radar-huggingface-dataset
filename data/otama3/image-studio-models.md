# otama3/image-studio-models

## Resumen

`otama3/image-studio-models` no es un modelo de lenguaje ni un modelo generativo de propósito general, sino un repositorio de recursos empaquetados para una aplicación web de edición fotográfica llamada Image Studio (versión 1.1.2). Contiene pesos y grafos ONNX orientados a la ejecución local en el navegador mediante WebGPU y WASM, con el objetivo de realizar *image matting* (recorte de primer plano y generación de máscaras alfa) sin enviar las fotografías a ningún servidor. El repositorio no proporciona inferencia: es un contenedor de artefactos que la aplicación descarga y ejecuta en el cliente.

El paquete integra tres modelos base de terceros: MODNet (Xenova), BiRefNet HR matting (ZhengPeng7) y ViTMatte base distinctions-646 (hustvl). Sobre ellos se han construido variantes específicas para CPU y GPU, con grafos fijados y derivados propios (por ejemplo, una refinación ViTMatte con atención multi-cabeza particionada en tres fases y filas de 8 claves). El tamaño del repositorio es de 3,1 GB y se distribuye en cinco paquetes ZIP con almacenamiento sin compresión (`ZIP_STORED`) para preservar los bytes exactos y permitir una importación verificada por SHA-256.

Su relevancia actual es acotada pero ilustrativa: muestra un patrón de despliegue de modelos de visión en el borde (edge), con verificación criptográfica de artefactos, catálogos de etapas separados para CPU y GPU, y una política explícita de no degradación silenciosa de calidad. No obstante, la información pública disponible sobre rendimiento, benchmarks y especificaciones técnicas detalladas es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible como modelo único; combina MODNet, BiRefNet HR y ViTMatte (grafos ONNX específicos de la aplicación) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelos de visión, no de lenguaje) |
| Tipos de cuantización | No disponible; se menciona FP32 sin cambios para MODNet CPU/GPU |
| Idiomas soportados | en (según metadatos; irrelevante para matting) |
| Licencia | `mixed-upstream-licenses` (ver LICENSES.md); el MIT de la app no relicencia los pesos |
| Formato de pesos | ONNX, empaquetado en cinco archivos ZIP con `ZIP_STORED` |
| Tamaño del repositorio | 3,1 GB |
| Modelos base | `Xenova/modnet`, `ZhengPeng7/BiRefNet_HR-matting`, `hustvl/vitmatte-base-distinctions-646` |
| Runtime objetivo | WebGPU y WASM (ONNX Runtime) |
| Revisión fijada | `3888c6cf29bacaf2ec5a1d7ce4e5ad1ab1109823` |

## Arquitectura y entrenamiento

El repositorio no entrena modelos propios. Empaqueta y adapta tres arquitecturas de matting preexistentes. MODNet es una red ligera de matting en tiempo real; BiRefNet HR es un modelo de segmentación de alta resolución basado en Swin Transformer (el repositorio incluye un suplemento de licencia MIT para Swin); ViTMatte es un refinador basado en Vision Transformer con atención multi-cabeza. La aportación del autor es la transformación de estos modelos a grafos ONNX ejecutables en navegador, con variantes separadas para CPU y GPU.

Las innovaciones técnicas documentadas son de ingeniería de despliegue más que de modelado: etapas de grafo fijas para HR, una refinación ViTMatte en tres fases con atención particionada por filas de 8 claves y costuras de fase gestionadas por CPU, y una variante CPU con *query-chunking* en tres fases. Los catálogos de etapas de CPU y GPU no son intercambiables. Cada entrada y transporte declarado tiene recuento de bytes y SHA-256, y se evita la expansión en RAM de archivos completos. No se documentan datos de entrenamiento, número de tokens ni procesos de RLHF/DPO, ya que no aplica.

## Capacidades

- Generación de máscaras alfa y recorte de primer plano (*image matting*) sobre fotografías.
- Procesamiento local en el navegador mediante WebGPU y WASM, sin envío de imágenes al servidor.
- Dos rutas de calidad explícitas: MODNet (FP32, compartido entre CPU y GPU) y HR + ViTMatte (refinación de alta calidad).
- Variantes separadas para CPU y GPU con catálogos de etapas no intercambiables.
- Verificación de integridad de artefactos mediante SHA-256 por entrada y transporte.
- Sin *fallback* silencioso de modelo o calidad: si una ruta falla, no se sustituye automáticamente.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de modo *thinking*, visión general, audio ni capacidades multilingües relevantes.

## Casos de uso

- Edición fotográfica en el navegador: la aplicación descarga los paquetes y ejecuta el matting localmente, de modo que el usuario puede recortar sujetos sin subir la imagen a un servidor, lo que reduce riesgos de privacidad.
- Aplicaciones de retoque y composición: la ruta HR + ViTMatte permite obtener máscaras de alta calidad para superponer fondos o crear imágenes con transparencia, adecuada para flujos de diseño gráfico ligero.
- Procesamiento por lotes en cliente: al ejecutarse en WebGPU, permite procesar varias fotografías en el dispositivo del usuario sin coste de servidor, aunque con límites de memoria del navegador.
- Herramientas de privacidad para documentos o retratos: el matting local evita enviar imágenes personales a infraestructura externa, útil en entornos con requisitos de protección de datos.
- Integración en aplicaciones web de terceros: los paquetes pueden importarse mediante el importador de caché verificado, siempre que se respeten las licencias upstream y la identidad de revisión fijada.
- Validación y auditoría de artefactos: el repositorio incluye `MODEL_FILES.json`, `APP_RELEASE_PAIRING.json` y `REPLAY.md`, útiles para verificar la procedencia y la integridad de los recursos en una cadena de suministro.
- Pruebas de despliegue edge: sirve como referencia para evaluar la viabilidad de ejecutar modelos de visión en navegador con WebGPU y WASM en distintos dispositivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evidencia existente sobre retratos sintéticos, cancelación y caché es acotada y no constituye una certificación general de calidad, de rendimiento en dispositivos móviles ni de impresión física. Tampoco se ofrecen cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ejecutarse en navegador, el consumo depende del backend (WebGPU o WASM) y del paquete seleccionado.
- GPU recomendadas: no disponible. Se requiere un navegador con soporte de WebGPU para la ruta GPU; la ruta CPU funciona mediante WASM.
- Compatibilidad con GPU de consumo: no confirmada. La model card no certifica funcionamiento en dispositivos móviles ni en hardware concreto.
- Opciones de despliegue: navegador con ONNX Runtime (WebGPU/WASM); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefactos.
- Latencia y throughput: no disponibles. La ruta CPU de alta calidad se describe como lenta y con alto consumo de memoria.
- Almacenamiento: el repositorio ocupa 3,1 GB; las descargas interrumpidas pueden requerir descargar un paquete completo de nuevo.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `otama3/image-studio-models` | Paquete de matting para navegador (MODNet + BiRefNet HR + ViTMatte) | ONNX en ZIP | No aplica | Mixta de upstream | Hugging Face, 0 descargas |
| `Xenova/modnet` | Modelo de matting ligero | ONNX | No aplica | No disponible en la información | Hugging Face |
| `ZhengPeng7/BiRefNet_HR-matting` | Matting de alta resolución | Pesos originales | No aplica | No disponible en la información | Hugging Face |
| `hustvl/vitmatte-base-distinctions-646` | Refinador de matting basado en ViT | Pesos originales | No aplica | No disponible en la información | Hugging Face |

La comparación directa con alternativas de la misma categoría (paquetes de matting para navegador) no está disponible en la información proporcionada. Los tres modelos base son los componentes upstream, no alternativas equivalentes de despliegue.

## Limitaciones y advertencias

- No es un modelo de propósito general: no genera texto, no razona y no soporta agentes ni *tool calling*.
- La licencia es mixta (`mixed-upstream-licenses`); el MIT de la aplicación no relicencia los pesos ni el código de los modelos upstream. Es obligatorio revisar `LICENSES.md` antes de cualquier uso comercial.
- La model card advierte de que no se ofrece *fallback* silencioso de calidad o modelo; si una ruta falla, el usuario debe gestionarlo explícitamente.
- La ruta CPU de alta calidad es lenta y consume mucha memoria; no es adecuada para dispositivos con recursos limitados.
- Los catálogos de etapas de CPU y GPU no son intercambiables, lo que limita la portabilidad entre backends.
- Las descargas interrumpidas pueden obligar a bajar un paquete completo de nuevo; los límites de servicio del Hub y la expulsión de caché pueden afectar a la disponibilidad.
- No se certifica un arranque completamente offline, garantía de servicio ni cumplimiento automático de normativas de fotografía de identidad.
- La evidencia de validación es acotada (retratos sintéticos, cancelación y caché) y no constituye certificación de calidad general ni de funcionamiento en dispositivos móviles.
- Riesgo de alucinación y sesgos: no aplica en el sentido de modelos de lenguaje; en matting, los errores se manifiestan como máscaras imprecisas en bordes, pelo o transparencias, que deben inspeccionarse manualmente.
- El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, lo que indica una adopción nula y ausencia de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/otama3/image-studio-models
- Licencias: https://huggingface.co/otama3/image-studio-models/blob/main/LICENSES.md
- Modelo base MODNet: https://huggingface.co/Xenova/modnet
- Modelo base BiRefNet HR matting: https://huggingface.co/ZhengPeng7/BiRefNet_HR-matting
- Modelo base ViTMatte: https://huggingface.co/hustvl/vitmatte-base-distinctions-646
- Código fuente de la aplicación (revisión fijada): https://huggingface.co/otama3/image-studio-models/resolve/3888c6cf29bacaf2ec5a1d7ce4e5ad1ab1109823/releases/app-1.1.2-01791fc98d226aef/source/app-source.tar.gz
