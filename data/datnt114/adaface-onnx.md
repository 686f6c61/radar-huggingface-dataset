# datnt114/adaface-onnx

## Resumen

El modelo `datnt114/adaface-onnx` es una exportación a formato ONNX del sistema de reconocimiento facial AdaFace (backbone ir50, entrenado en MS1MV2) junto con el detector facial MTCNN, optimizado para ejecución exclusiva en CPU mediante onnxruntime. El objetivo es ofrecer una alternativa ligera y sin dependencias de PyTorch para tareas de verificación facial y comparación de identidades entre dos retratos. El autor, datnt114, ha conseguido reducir el entorno de ejecución de aproximadamente 5,2 GB a unos 290 MB, lo que facilita el despliegue en entornos con recursos limitados.

El paquete incluye cuatro archivos ONNX: `ir50.onnx` (generador de embeddings de 512 dimensiones), y las tres etapas del detector MTCNN (`pnet`, `rnet`, `onet`). El modelo acepta imágenes de 112×112 píxeles en formato BGR normalizado a [-1, 1] y produce un vector de características L2-normalizado. Al estar en ONNX, es compatible con múltiples runtimes y puede integrarse en pipelines de visión por computador sin necesidad de frameworks de entrenamiento.

La relevancia actual radica en la creciente demanda de soluciones de reconocimiento facial eficientes, desplegables en hardware modesto y con licencia permisiva (MIT). Al ser una conversión fiel del checkpoint oficial de AdaFace (verificado con una diferencia máxima de ±0.0007 en embeddings), ofrece un rendimiento comparable al modelo original con una huella de memoria significativamente menor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AdaFace (ResNet-50 ir50) + MTCNN para deteccion facial |
| Parametros totales | no disponible (el backbone ResNet-50 tiene aproximadamente 43 M, pero no se indica en la informacion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | no disponible (los archivos ONNX no especifican precision; probablemente FP32) |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | ONNX (.onnx) |

## Arquitectura y entrenamiento

AdaFace es un modelo de reconocimiento facial que introduce un margen adaptativo basado en la calidad de la imagen. El backbone es una ResNet-50 con modificaciones (ir50) entrenada en el dataset MS1MV2 (Microsoft Celeb-1M v2). El margen de pérdida se ajusta dinámicamente según la calidad de la cara detectada, lo que mejora el rendimiento en imágenes de baja resolución o con degradación.

En esta exportación, el modelo original se convierte a ONNX mediante `torch.onnx.export` (agosto de 2026). El wrapper añade una capa de normalización L2 a la salida del embedding. El detector MTCNN se incluye para localizar y alinear caras antes de pasarlas al extractor de características. No se menciona ningún proceso de fine-tuning adicional; es una conversión directa del checkpoint oficial.

## Capacidades

- Reconocimiento facial: genera embeddings de 512 dimensiones normalizados L2 para representar la identidad de una persona.
- Verificacion de identidad: compara dos embeddings mediante similitud coseno o distancia euclidiana para determinar si pertenecen a la misma persona.
- Deteccion facial integrada: el detector MTCNN localiza caras en imagenes y las alinea antes de la extraccion de características.
- Ejecucion en CPU: optimizado para onnxruntime, sin necesidad de GPU ni PyTorch.
- Compatibilidad multiplataforma: al ser ONNX, puede ejecutarse en Windows, Linux, macOS, navegadores (WebAssembly) y dispositivos moviles.
- Procesamiento por lotes: aunque no se documenta explicitamente, el formato NCHW permite procesar multiples imagenes si se ajusta el batch size.

## Casos de uso

- Control de acceso fisico: un sistema de seguridad puede capturar una foto del rostro de un empleado, generar su embedding y compararlo con una base de datos local de embeddings precalculados para autorizar la entrada. La ejecucion en CPU permite desplegarlo en mini-PCs o Raspberry Pi.
- Verificacion de identidad en onboarding digital: al registrar un usuario en una aplicacion bancaria o de servicios, se compara el selfie enviado con la foto del documento de identidad. El modelo puede integrarse en un backend Node.js o Python con onnxruntime.
- Busqueda de personas en archivos de video: se extraen embeddings de cada frame y se indexan en una base de datos vectorial (por ejemplo, FAISS) para localizar a un individuo concreto en grabaciones de camaras de seguridad.
- Deduplicacion de registros en bases de datos: en sistemas de gestion de clientes, se pueden comparar embeddings faciales para detectar cuentas duplicadas con la misma persona.
- Autenticacion en aplicaciones moviles: al estar en ONNX, puede ejecutarse en el dispositivo (Android/iOS) mediante onnxruntime-mobile, permitiendo desbloqueo facial sin conexion.
- Analisis de demografia en retail: aunque no es su funcion principal, los embeddings pueden agruparse para estimar el numero de clientes unicos que visitan una tienda en un periodo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo indica que los embeddings coinciden con la version torch con una diferencia maxima de ±0.0007 en un conjunto de imagenes reales, lo que sugiere una fidelidad alta en la conversion, pero no se aportan metricas como TPR@FPR o accuracy en datasets estandar (LFW, MegaFace, etc.).

## Requisitos de hardware

- Ejecucion en CPU: no requiere GPU. El modelo esta disenado para onnxruntime en CPU.
- RAM: el tamano total del repositorio es de 0,2 GB, por lo que se puede cargar en sistemas con 1 GB de RAM libre o menos.
- VRAM: 0 (no se necesita GPU).
- GPU recomendada: no aplica.
- Compatibilidad con consumer GPU: no relevante, aunque si se desea acelerar, se podria ejecutar con CUDA via onnxruntime-gpu, pero no es el objetivo.
- Opciones de despliegue: onnxruntime (Python, C++, C#), onnxruntime-mobile (Android/iOS), ONNX.js (navegador), o servidores de inferencia como Triton (si se convierte a TensorRT).
- Latencia y throughput: no hay datos oficiales. En un CPU moderno (por ejemplo, Intel i5 de 11ª generacion), se puede estimar una inferencia de un solo rostro en el orden de 10-30 ms, pero no esta confirmado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Tamano (ONNX) | Licencia | Notas |
|---|---|---|---|---|---|
| AdaFace (este) | ResNet-50 ir50 | ~43 M (estimado) | ~0,2 GB (incluye MTCNN) | MIT | Enfoque en calidad de imagen adaptativa |
| FaceNet (Inception ResNet v1) | Inception-ResNet-v1 | ~27 M | ~0,1 GB (solo backbone) | MIT (variante) | Clasico, requiere deteccion externa |
| ArcFace (ResNet-50) | ResNet-50 | ~43 M | ~0,1 GB (solo backbone) | MIT (implementaciones) | Ampliamente usado en benchmarks |

Nota: los datos de parametros y tamano de los modelos comparados son aproximados y pueden variar segun la implementacion. No se dispone de una comparativa directa de rendimiento en los mismos benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: como cualquier modelo de reconocimiento facial entrenado en MS1MV2, puede presentar sesgos hacia ciertos grupos etnicos o de genero, especialmente en condiciones de baja calidad de imagen.
- Riesgo de alucinacion: no aplica, ya que no genera texto, pero puede producir falsos positivos o negativos en la verificacion de identidad si la calidad de la imagen es deficiente.
- Limitaciones de contexto: el modelo solo procesa imagenes de 112×112 píxeles; imagenes de mayor resolucion deben redimensionarse, lo que puede degradar el rendimiento si la cara es muy pequena.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo original de AdaFace puede tener condiciones adicionales en su checkpoint (aunque el repositorio oficial tambien es MIT).
- Advertencia para produccion: la deteccion facial con MTCNN puede fallar en condiciones extremas (iluminacion baja, oclusiones, angulos poco comunes). Se recomienda validar el modelo con un conjunto de datos representativo antes de desplegarlo en un entorno critico.
- Dependencia de onnxruntime: aunque se elimina la dependencia de PyTorch, es necesario instalar onnxruntime (version compatible con el modelo). No se especifica la version exacta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/datnt114/adaface-onnx
- Repositorio original de AdaFace (GitHub): https://github.com/mk-minchul/AdaFace
- Mirror del checkpoint en HuggingFace: https://huggingface.co/VishalMishraTss/AdaFace
- Referencia de implementacion ONNX similar: https://github.com/yakhyo/adaface-onnx
- Modelo AdaFace oficial en HuggingFace: https://huggingface.co/adaface-neurips/adaface-models
