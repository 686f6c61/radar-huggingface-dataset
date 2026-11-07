# byrizki/rusto-models

## Resumen

RustO Models es un repositorio de pesos preentrenados de OCR (reconocimiento óptico de caracteres) publicado por el desarrollador independiente byrizki en Hugging Face. No se trata de un modelo único, sino de un catálogo de detectores de texto, reconocedores, clasificadores de orientación, analizadores de layout y módulos auxiliares de documentos, distribuidos en tres formatos de inferencia: MNN (motor `rusto-nn`, implementación en Rust puro de Alibaba MNN), RTen (`rusto-rten`, motor en Rust puro) y ONNX. El objetivo es permitir inferencia OCR neuronal sin dependencias de C++ ni OpenCV, ejecutable en Rust, Python, Node.js, WebAssembly, Android, iOS, React Native, C# .NET, Go y Flutter.

El catálogo incluye la familia propia Indra OCR (detección, reconocimiento base, orden de lectura neuronal, orientación de página, reconocimiento CJK, RTL y multiescritura, además de un pipeline de fórmulas matemáticas con encoder/decoder y vocabulario LaTeX), junto con los tiers PP-OCRv6 (tiny, small, medium y sus variantes INT8), PP-OCRv5 (mobile y server), PP-OCRv4 (mobile y server) y reconocedores multilingües específicos por escritura (árabe, cirílico, devanagari, griego, eslavo oriental, coreano, latino, tamil, telugu, tailandés, japonés, chino tradicional y kannada).

Es relevante ahora porque empaqueta modelos OCR de PaddleOCR y propios en formatos ligeros y portables (desde 188 KB hasta 31 MB por componente), con acceso directo por URL y cabeceras CORS habilitadas, lo que facilita su uso en aplicaciones cliente sin infraestructura de servidor. El repositorio completo ocupa 1,5 GB y se publica bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales de detección y reconocimiento de texto (basadas en PaddleOCR y en el motor propio Indra OCR); clasificadores de orientación, layout y script; encoder/decoder para fórmulas matemáticas |
| Parametros totales | no disponible (se distribuye por componentes; los pesos individuales van de 188 KB a 31 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelos de visión por imagen, no de texto autoregresivo general) |
| Tipos de cuantizacion | INT8 disponible en los tiers PP-OCRv6 (tiny-int8, small-int8, medium-int8); el resto en precisión original |
| Idiomas soportados | Multilingüe por reconocedores específicos: árabe, cirílico, devanagari (hindi), griego, eslavo oriental, coreano, latino, tamil, telugu, tailandés, japonés, chino tradicional, kannada; Indra OCR añade CJK, RTL (árabe, persa, urdu) y reconocimiento de escritura mundial extendida |
| Licencia | MIT |
| Formato de pesos | MNN (`.mnn`), RTen (`.rten`), ONNX (`.onnx`); diccionarios en `.txt` y metadatos en `.json` |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de cada red ni los datos de entrenamiento empleados. Por los nombres y la organización del catálogo, los componentes PP-OCRv4, PP-OCRv5 y PP-OCRv6 corresponden a los modelos de detección y reconocimiento de texto de la familia PaddleOCR, redistribuidos en formatos MNN, RTen y ONNX. La familia Indra OCR es un conjunto propio del autor que incluye detección, reconocimiento base, clasificador de orientación de página, ordenador neuronal de orden de lectura y columnas, clasificador de escritura, clasificador de detección de fórmulas matemáticas y un pipeline de codificación/decodificación de fórmulas a LaTeX con vocabulario propio (`math_meta.json`).

La innovación técnica principal no está en el entrenamiento, sino en el empaquetado y la portabilidad: los pesos se ofrecen en tres formatos con motores de inferencia en Rust puro (`rusto-nn` para MNN y `rusto-rten` para RTen), lo que elimina dependencias de C++ y OpenCV. El catálogo separa explícitamente detectores, reconocedores, clasificadores y módulos de documento (dewarping 3D, análisis de layout CDLA de 10 clases y PubLayNet de 5 clases), lo que permite componer pipelines OCR a medida según el caso de uso y el presupuesto de cómputo. No se dispone de información sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Detección de texto en imágenes (detección de cajas de texto) con modelos base y tiers ligeros.
- Reconocimiento de texto (image-to-text) en múltiples escrituras mediante reconocedores especializados.
- Reconocimiento de chino, japonés y coreano (CJK) con el modelo `indraocr/rec_cjk`.
- Reconocimiento de escrituras de derecha a izquierda (árabe, persa, urdu) con `indraocr/rec_rtl`.
- Reconocimiento de escritura mundial extendida con `indraocr/rec_world`.
- Clasificación de orientación de página (`indraocr/orient`, `modules/orient`) y de dirección de línea de texto a 180° (`modules/cls`).
- Ordenación neuronal de lectura y columnas (`indraocr/order`), útil para documentos multicolumna.
- Clasificación de sistema de escritura (`indraocr/script`) y detección de fórmulas matemáticas (`indraocr/mathcls`).
- Reconocimiento de fórmulas matemáticas y conversión a LaTeX mediante encoder/decoder (`indraocr/math_enc`, `math_dec_init`, `math_dec_step`).
- Análisis de layout de documentos con 10 clases (CDLA) y 5 clases (PubLayNet).
- Corrección de perspectiva y dewarping 3D de documentos (`modules/uvdoc`).
- Inferencia multiplataforma sin dependencias de C++: Rust, Python, Node.js, WebAssembly, Android, iOS, React Native, C# .NET, Go y Flutter.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso; son modelos de visión, no LLM conversacionales.

## Casos de uso

- Digitalización masiva de documentos escaneados: combinando `ppocrv6-small` o `ppocrv6-medium` con `modules/uvdoc` para corregir la deformación 3D de páginas y `modules/layout_cdla` para segmentar regiones, se puede construir un pipeline de extracción de texto estructurado para archivos históricos o administrativos.
- Escaneo de documentos en aplicaciones móviles: los modelos en formato RTen o MNN, con pesos de 188 KB a 9,8 MB por componente, permiten ejecutar OCR en Android, iOS, React Native o Flutter sin conexión a un servidor, con `modules/cls` para corregir líneas invertidas y `modules/orient` para rotar páginas mal orientadas.
- OCR en el navegador mediante WebAssembly: el formato RTen está pensado para entornos WASM sin toolchain de C, lo que permite procesar imágenes de formularios o capturas directamente en el cliente y evitar enviar documentos sensibles a un backend.
- Procesamiento de documentos multilingües: usando los reconocedores de `multilingual/` (árabe, cirílico, devanagari, coreano, tailandés, etc.) junto con `indraocr/script` para clasificar la escritura antes de elegir el reconocedor, se puede digitalizar correspondencia internacional o documentación regulatoria en varios idiomas.
- Extracción de fórmulas científicas y técnicas: el pipeline `mathcls` + `math_enc` + `math_dec_init`/`math_dec_step` convierte expresiones matemáticas en imágenes a LaTeX, útil para digitalizar artículos académicos, apuntes o libros de texto y alimentar bases de conocimiento o editores científicos.
- Digitalización de prensa y documentos multicolumna: `indraocr/order` aporta ordenación neuronal de lectura y columnas, lo que permite reconstruir el flujo de lectura correcto en periódicos, revistas o informes maquetados en varias columnas.
- OCR ligero en dispositivos de bajo consumo: los tiers `ppocrv6-tiny-int8` y `ppocrv6-small-int8` reducen el coste computacional manteniendo detección y reconocimiento, adecuados para escaneo de tickets, etiquetas o matrículas en hardware modesto.
- Integración en pipelines de datos en Rust: al usar motores en Rust puro (`rusto-nn`, `rusto-rten`) se puede incorporar OCR a servicios backend sin binarios C++ ni OpenCV, simplificando el despliegue y la auditoría de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los pesos (componentes de 188 KB a 31 MB), la huella de memoria es muy reducida y cabe holgadamente en cualquier GPU consumer, e incluso en CPU o dispositivos móviles.
- GPU recomendadas: no se especifican; dado el tamaño de los modelos, cualquier GPU moderna (RTX 3060 o superior, A100, H100) es sobredimensionada para un solo componente. El caso de uso típico es CPU, móvil o WASM.
- Cabe en GPU consumer: sí, con enorme margen; también en CPU y en dispositivos móviles (Android/iOS) mediante los formatos MNN y RTen.
- Opciones de despliegue: motores propios `rusto-nn` (MNN en Rust puro), `rusto-rten` (RTen en Rust puro) y ONNX Runtime; integración vía la librería `rusto-rs` y sus paquetes para Python, Node.js, Go, Java, Flutter y React Native. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que son para LLM de texto y no aplican a este catálogo OCR.
- Latencia y throughput estimados: no disponibles. El autor describe la inferencia como "de alta velocidad" y "zero-dependency", pero no se aportan cifras de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño de componentes | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RustO Models (byrizki) | Catálogo OCR (detección, reconocimiento, layout, matemáticas) | 188 KB – 31 MB por componente; repo de 1,5 GB | MNN, RTen, ONNX | MIT | Hugging Face, acceso directo por URL con CORS |
| PaddleOCR (original) | Detección y reconocimiento de texto | Variable según tier (mobile/server) | Principalmente modelos Paddle y exportaciones ONNX | Apache 2.0 | Repositorios oficiales de PaddlePaddle |
| Tesseract OCR | OCR clásico (no neuronal en su núcleo) | Modelos de idioma de decenas de MB | Propio (traineddata) | Apache 2.0 | Repositorios oficiales y distribuciones |
| EasyOCR | OCR basado en deep learning | Modelos de detección y reconocimiento de decenas de MB | PyTorch | Apache 2.0 | PyPI y GitHub |

La comparativa se limita a categorías y licencias, ya que no hay datos de benchmarks publicados para RustO Models que permitan comparar precisión (certeza de caracteres, F1 de detección) frente a PaddleOCR, Tesseract o EasyOCR. La ventaja diferencial de RustO es la portabilidad (Rust puro, WASM, móvil) y la licencia MIT permisiva; PaddleOCR y EasyOCR dependen de stacks Python/PyTorch o Paddle, y Tesseract no es una red neuronal profunda en su núcleo.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluación de robustez; al ser modelos OCR, el riesgo principal es la tasa de error de reconocimiento en imágenes de baja calidad, rotadas o con fuentes poco habituales.
- Riesgo de alucinación: en reconocimiento de texto, el equivalente son errores de sustitución, omisión o inserción de caracteres, especialmente en escrituras complejas o en fórmulas matemáticas; no hay métricas publicadas de CER/WER.
- Limitaciones de idioma: el soporte multilingüe depende de reconocedores específicos por escritura; no hay un modelo único que cubra todos los idiomas, y algunos reconocedores solo están en formato RTen (sin ONNX), lo que condiciona el entorno de despliegue.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y redistribución con atribución; conviene verificar la licencia de los modelos PaddleOCR subyacentes redistribuidos (Apache 2.0 en el proyecto original) antes de un uso comercial estricto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; es un proyecto muy reciente y de un único autor, sin validación comunitaria amplia.
- Los formatos MNN y RTen requieren los motores propios `rusto-nn` y `rusto-rten`; la interoperabilidad con otros stacks se limita a las exportaciones ONNX.
- No hay información sobre el proceso de entrenamiento, la composición del dataset ni la evaluación de calidad, lo que dificulta auditar el rendimiento en dominios específicos.
- El tamaño de 1,5 GB del repositorio incluye todos los formatos y tiers; descargar el catálogo completo puede ser innecesario si solo se necesita un pipeline concreto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/byrizki/rusto-models
- Acceso directo a pesos (CORS habilitado): https://huggingface.co/byrizki/rusto-models/resolve/main/<folder>/<filename>
- Librería RustO! en GitHub: https://github.com/byrizki/rusto-rs
- Releases de RustO!: https://github.com/byrizki/rusto-rs/releases
