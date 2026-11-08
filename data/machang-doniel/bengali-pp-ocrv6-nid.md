# Machang-Doniel/bengali-pp-ocrv6-nid

## Resumen

El modelo `Machang-Doniel/bengali-pp-ocrv6-nid` es un modelo de reconocimiento óptico de caracteres (OCR) especializado en bengalí, derivado de la familia PP-OCRv6 de PaddleOCR y ajustado específicamente para documentos de identidad nacional (NID) de Bangladés. Lo publica el usuario Machang-Doniel en Hugging Face bajo una licencia propietaria restringida y con acceso condicionado (gated), lo que obliga a aceptar las condiciones del autor antes de descargar los pesos. El repositorio ocupa aproximadamente 0,1 GB y se distribuye en formato ONNX, ejecutable sobre el runtime de PaddlePaddle/PaddleOCR.

El modelo resuelve un problema muy concreto: la digitalización fiable de campos de texto en documentos de identidad bengalíes, un escenario donde los OCR genéricos fallan por la mezcla de alfabeto bengalí, tipografías variables, ruido de escaneo y disposición no estándar de los campos. Al estar basado en PP-OCRv6, hereda la arquitectura de backbone unificado PPLCNetV4 y la pipeline de detección más reconocimiento propia de PaddleOCR, aunque la información disponible no detalla el tamaño exacto de la variante (tiny, small o medium) empleada como base.

La relevancia del modelo es acotada pero clara: cubre un nicho (OCR bengalí para NID) con pocas alternativas públicas de calidad, y lo hace con un formato ONNX portable y un peso reducido que permite despliegue en entornos con recursos limitados. No obstante, la licencia propietaria restringida y el acceso gated limitan su uso comercial sin autorización expresa del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OCR basado en PaddleOCR PP-OCRv6 (backbone PPLCNetV4, pipeline detección + reconocimiento) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo OCR, no aplica ventana de contexto de LLM) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; se desconoce si incluye variantes cuantizadas) |
| Idiomas soportados | bengalí (bn) |
| Licencia | proprietary-restricted (propietaria restringida), acceso gated |
| Formato de pesos | ONNX (runtime PaddlePaddle/PaddleOCR) |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura PP-OCRv6 de PaddleOCR, que emplea el backbone unificado PPLCNetV4 y una pipeline en dos etapas: detección de regiones de texto y reconocimiento de las mismas. PP-OCRv6 se ofrece en tres variantes (tiny, small y medium) orientadas a edge/IoT, móvil/escritorio y servidor respectivamente; la información disponible no especifica cuál de ellas sirve de base a este ajuste. La variante medium/small de PP-OCRv6 soporta 50 idiomas con un único modelo unificado, mientras que la tiny cubre 49 (excluye japonés); este derivado se ha especializado exclusivamente en bengalí y en el dominio de documentos NID.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset de ajuste, ni si se aplicaron técnicas de aumento de datos, destilación o ajuste fino supervisado sobre el checkpoint original. Tampoco hay datos públicos sobre procesos de RLHF/DPO, que en modelos OCR no resultan de aplicación habitual. La innovación técnica heredada es la del propio PP-OCRv6: backbone ligero PPLCNetV4 y un modelo unificado multilingüe, del que este repositorio es una especialización de dominio.

## Capacidades

- Reconocimiento de texto impreso en bengalí sobre imágenes de documentos de identidad.
- Detección y extracción de regiones de texto en escaneos y fotografías de NID.
- Procesamiento de documentos con tipografías y disposiciones variables propias de documentos oficiales.
- Ejecución en formato ONNX, lo que permite integración en pipelines de inferencia sin dependencia del framework de entrenamiento.
- Especialización de dominio: ajustado para el vocabulario y la estructura de campos de documentos de identidad de Bangladés.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá del OCR.
- Capacidad multilingüe limitada al bengalí; no se ha documentado soporte de otros idiomas.

## Casos de uso

- Digitalización de documentos de identidad en procesos KYC: el modelo extrae los campos de texto de fotografías o escaneos de NID bengalíes, lo que permite automatizar la verificación de identidad en entidades financieras y plataformas de registro.
- Onboarding remoto de clientes: integrado en un formulario de alta, procesa la imagen del documento y precarga los campos, reduciendo la entrada manual y los errores de transcripción en alfabeto bengalí.
- Archivado y gestión documental: digitaliza lotes de documentos de identidad para su indexación y búsqueda posterior en sistemas de gestión documental.
- Verificación de datos en auditorías: contrasta los datos declarados por el usuario con los extraídos del documento, apoyándose en la especialización del modelo en el formato NID.
- Despliegue en dispositivos con recursos limitados: al distribuirse en ONNX y ocupar un repositorio de 0,1 GB, puede ejecutarse en entornos de borde o en servidores modestos sin GPU dedicada, siempre que se respete la licencia.
- Automatización de trámites administrativos: extracción de campos de documentos de identidad en portales de servicios públicos o privados de Bangladés para prellenar solicitudes.
- Investigación en OCR de lenguas de baja representación: sirve como punto de partida para estudiar el rendimiento de PP-OCRv6 en alfabetos no latinos sobre dominios restringidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la naturaleza de un modelo OCR PP-OCRv6, es plausible su ejecución en CPU, aunque no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. PP-OCRv6 está diseñado para escenarios de servidor, móvil y edge, por lo que cabría esperar compatibilidad con GPUs de gama media, pero no hay datos verificados para este derivado.
- ¿Cabe en GPU consumer? No confirmado; el tamaño reducido del artefacto sugiere que sí, pero no se dispone de mediciones.
- Opciones de despliegue: ONNX Runtime y PaddleOCR/PaddlePaddle son las vías naturales dado el formato de pesos; no se ha documentado compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos OCR de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Acceso |
|---|---|---|---|---|---|
| Machang-Doniel/bengali-pp-ocrv6-nid | OCR especializado en NID bengalí | bn | ONNX | Propietaria restringida | Gated |
| PP-OCRv6 (PaddleOCR, variante medium/small) | OCR universal | 50 idiomas (incluye bn entre los 46 latinos, no confirmado para bengalí) | Paddle / ONNX según distribución | Apache 2.0 (PaddleOCR) | Público |
| PP-OCRv6 (variante tiny) | OCR universal | 49 idiomas | Paddle / ONNX según distribución | Apache 2.0 (PaddleOCR) | Público |

No se dispone de datos de rendimiento comparativo entre este derivado y los checkpoints originales de PP-OCRv6, ni con otros OCR especializados en bengalí, por lo que la comparación se limita a parámetros estructurales y de licencia.

## Limitaciones y advertencias

- Licencia propietaria restringida: el uso comercial requiere autorización expresa del autor; no se puede asumir uso libre.
- Acceso gated: es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, lo que puede bloquear pipelines automatizados.
- Especialización estrecha: el ajuste está orientado a documentos NID bengalíes; su rendimiento en otros tipos de documento o en bengalí genérico no está documentado.
- Idiomas: solo bengalí; no se ha documentado soporte de inglés u otras lenguas presentes en documentos oficiales.
- Riesgo de error en campos críticos: en un contexto KYC, cualquier fallo de reconocimiento puede tener consecuencias legales o de fraude; se recomienda validación humana o reglas de contraste.
- Sin benchmarks públicos: no hay evidencia cuantitativa de precisión, por lo que la evaluación debe hacerse con un conjunto de validación propio antes de producción.
- Sesgos: no documentados; al entrenarse sobre un dominio concreto, puede degradarse ante variaciones de iluminación, ángulos, deterioro del documento o tipografías no vistas.
- Sin garantías de mantenimiento: repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación comunitaria.
- Formato ONNX: requiere runtime compatible; no se han documentado versiones mínimas ni opsets soportados.

## Enlaces

- Hugging Face: https://huggingface.co/Machang-Doniel/bengali-pp-ocrv6-nid
- Documentación PP-OCRv6 (PaddleOCR): https://www.paddleocr.ai/latest/en/version3.x/algorithm/PP-OCRv6/PP-OCRv6.html
- Documentación PP-OCRv6 en GitHub: https://github.com/PaddlePaddle/PaddleOCR/blob/main/docs/version3.x/algorithm/PP-OCRv6/PP-OCRv6.en.md
- Repositorio PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
