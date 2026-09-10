# Sheeda/arabic-ocr-post-correction-0.5b

## Resumen

Sheeda/arabic-ocr-post-correction-0.5b es un adaptador LoRA de corrección posterior de OCR para árabe, construido sobre Qwen/Qwen2.5-0.5B-Instruct. Su función es tomar la salida cruda de un motor de OCR (Tesseract, PaddleOCR, etc.) y devolver el texto restaurado, corrigiendo los errores típicos de la escritura árabe: confusión de puntos diacríticos (*i'jam*), separación o fusión indebida de palabras, caracteres perdidos, inserción de kashida y diacríticos espurios. Resuelve un problema concreto de recuperación documental: en árabe, un 8 % de error a nivel de carácter se traduce en un 41 % de error a nivel de palabra, y la búsqueda, la indexación y la extracción operan sobre palabras.

El modelo es un adaptador PEFT de aproximadamente 0,1 GB que se carga sobre el modelo base, no un modelo completo. Se entrenó con 56.931 pares sintéticos (texto corrupto → texto limpio) derivados de AraSum, con LoRA de rango 32 y alpha 64 sobre todas las proyecciones de atención y MLP, en 2 épocas y unos 80 minutos sobre una única RTX 5070 Ti de 12 GB.

Su relevancia actual es de nicho pero clara: no existe un corpus público de corrección de OCR en árabe, y este adaptador demuestra que un modelo de 0,5 B de parámetros, con un ajuste fino barato y una guarda de deriva (*drift guardrail*) basada en distancia de edición, reduce el WER del 41,1 % al 20,4 % sobre el conjunto de evaluación sintético del propio autor. La licencia MIT y su huella de hardware mínima lo hacen desplegable en pipelines de digitalización sin infraestructura especializada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-0.5B-Instruct |
| Parametros totales | 0,49 B en el modelo base; el adaptador se distribuye como pesos LoRA (r=32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card del adaptador; el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizaciones de la familia Qwen2.5 (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Arabe (`ar`) |
| Licencia | MIT (la licencia del modelo base rige de forma independiente sobre los pesos fusionados) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

Datos adicionales: repositorio de 0,1 GB, pipeline `text-generation`, librería `peft`, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only causal con atención por consultas agrupadas (GQA) y 0,49 B de parámetros. El ajuste se realizó con LoRA de rango 32, alpha 64 y dropout 0,05, aplicado a todas las proyecciones de atención y de MLP. El entrenamiento usó precisión bf16, 2 épocas, batch efectivo de 32 y una tasa de aprendizaje de 2e-4 con scheduler coseno, sobre una única RTX 5070 Ti de 12 GB durante aproximadamente 80 minutos.

Al no existir un corpus público de pares (OCR crudo → texto correcto) en árabe, los datos se sintetizaron: 56.931 pares a partir de texto limpio de AraSum corrompido con un modelo de confusión calibrado según los fallos reales de la escritura árabe. La composición de la corrupción es 42 % confusión de puntos y esqueleto (*rasm*), 22 % separación y fusión de palabras, y el resto caracteres eliminados, inserción de kashida y diacríticos espurios. La severidad se muestreó por ejemplo entre el 4 % y el 18 %. No se documenta en la información disponible ninguna fase de RLHF o DPO específica para este adaptador. El autor recomienda explícitamente decodificación greedy, ya que la tarea es de restauración con una única respuesta correcta.

Como mecanismo de seguridad se propone una guarda externa al modelo: se calcula la distancia de edición entre la entrada y la predicción y se rechaza la corrección si la deriva relativa supera un umbral (`max_drift=0.20`, valor casi óptimo según el autor). Esto no requiere un texto de referencia, por lo que es aplicable en producción.

## Capacidades

- Restauración de texto árabe dañado por OCR: corrección de puntos diacríticos, unión y separación de palabras, caracteres ausentes o sobrantes.
- Corrección guiada por instrucción en formato conversacional (plantilla de chat de Qwen2.5), con una instrucción en árabe que pide reescribir el texto corrigiendo los errores de escaneo.
- Manejo de distintos niveles de degradación: el autor reporta mejoras en las bandas ligera (<8 %), media (8-14 %) y grave (>14 %) de error de carácter.
- Generación determinista: el uso previsto es con decodificación greedy, no con muestreo.
- Integración en pipelines de OCR como etapa posterior, encadenable con motores como Tesseract o PaddleOCR.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el modelo base lo soporta, pero el adaptador no se ha validado para ello).
- Capacidades de agente y razonamiento multi-paso: no aplicables a su propósito; el adaptador está especializado en una única tarea de reescritura.
- Multilingüismo: solo árabe, y dentro de él únicamente árabe estándar moderno de registro periodístico.
- Capacidades especiales: no dispone de modo de razonamiento, visión ni audio.

## Casos de uso

- Digitalización de hemerotecas y archivos de prensa árabe: el adaptador se inserta como paso posterior al OCR para reducir el WER del texto indexado, lo que mejora directamente la recuperación en buscadores sobre la colección. Está entrenado sobre texto periodístico de AraSum, por lo que este es su dominio más alineado.
- Indexación y búsqueda full-text en bibliotecas digitales: como la búsqueda opera sobre palabras, la reducción del WER del 41 % al 20 % (con guarda) implica aproximadamente la mitad de consultas fallidas por términos corruptos.
- Extracción de entidades y metadatos en pipelines documentales: al corregir puntos diacríticos y fronteras de palabra, mejora la detección de nombres propios, fechas y topónimos antes de pasarlos a un extractor aguas abajo.
- Construcción de corpus para RAG en árabe: limpiar el texto OCR antes de la segmentación y la vectorización evita indexar fragmentos corruptos y reduce el ruido en las respuestas del sistema de recuperación.
- Preprocesado en digitalización de documentación administrativa en árabe estándar: el modelo cabe en cualquier GPU de consumo, por lo que puede ejecutarse en la propia máquina donde se hace el escaneo, sin enviar documentos sensibles a servicios externos.
- Corrección de subtítulos o transcripciones derivadas de OCR en flujos editoriales: cualquier texto árabe estándar con ruido de reconocimiento puede pasar por el adaptador antes de la revisión humana.
- Evaluación y ajuste de motores de OCR: usar el par (salida cruda, salida corregida) como señal para calibrar o comparar motores de OCR sobre páginas escaneadas en árabe.
- Filtrado de calidad documental: la guarda de deriva permite marcar segmentos donde el modelo diverge en exceso de la entrada, señalando páginas con OCR especialmente degradado que requieren revisión manual.

## Benchmarks y rendimiento

Datos publicados en la model card, sobre 200 segmentos reservados y decodificación greedy. El CER y el WER se miden frente al texto de referencia; la corrupción evaluada es sintética.

| Sistema | CER | WER |
|---|---|---|
| OCR crudo (sin corrección) | 0,0808 | 0,4112 |
| Qwen2.5-0.5B sin ajustar | 1,8123 | 2,2680 |
| Este adaptador | 0,0724 | 0,1765 |
| Este adaptador + guarda de deriva | 0,0671 | 0,2042 |

Desglose por severidad de la corrupción (CER):

| Severidad | CER base (OCR crudo) | CER del adaptador |
|---|---|---|
| Ligera (<8 %) | 0,0438 | 0,0404 |
| Media (8-14 %) | 0,0813 | 0,0713 |
| Grave (>14 %) | 0,1211 | 0,1092 |

El autor señala que un CER superior a 1,0 en el modelo base sin ajustar indica que su salida es texto no relacionado con la referencia, no una versión dañada de la misma, de modo que toda la mejora es atribuible al ajuste fino. La reducción del WER con la guarda es del 50,3 % (de 0,4112 a 0,2042). No se han publicado resultados sobre OCR real (Tesseract, PaddleOCR) en la información disponible.

## Requisitos de hardware

- Entrenamiento documentado: una única RTX 5070 Ti de 12 GB, aproximadamente 80 minutos para 2 épocas sobre 56.931 pares con LoRA en bf16.
- VRAM para inferencia: el adaptador añade un consumo despreciable; el grueso corresponde al modelo base de 0,49 B. En bf16 el conjunto ocupa del orden de 1-2 GB, por lo que cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100). Las GPUs de gama alta no aportan ventaja funcional, solo throughput.
- Cabe en GPU de consumo: sí, en todas las de gama media y alta de los últimos años, y también en CPU o en dispositivos de borde con cuantización de 4 bits.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada por el autor, con `device_map="auto"` y bf16); el modelo base se puede servir con vLLM, TGI, Ollama o llama.cpp si se fusionan los pesos LoRA y se convierten a GGUF. La model card solo documenta la ruta de `peft`.
- Latencia y throughput: no disponibles en la información proporcionada. Con 0,49 B de parámetros y salidas de hasta 256 tokens nuevos, es esperable que sea muy bajo, pero no se aportan cifras medidas.
- Nota de operación: el autor recomienda decodificación greedy (`do_sample=False`) y el uso de la guarda de deriva con distancia de Levenshtein antes de aceptar la corrección.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores o modelos dedicados a la corrección posterior de OCR en árabe, por lo que la comparativa se limita a las alternativas internas evaluadas por el propio autor.

| Alternativa | Parametros | Contexto | CER | WER | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (+ guarda) | 0,49 B (base) + LoRA | No especificado | 0,0671 | 0,2042 | MIT | HuggingFace, 0 descargas |
| Este adaptador sin guarda | 0,49 B (base) + LoRA | No especificado | 0,0724 | 0,1765 | MIT | HuggingFace, 0 descargas |
| Qwen2.5-0.5B-Instruct sin ajustar | 0,49 B | 32.768 tokens | 1,8123 | 2,2680 | Apache 2.0 (modelo base) | HuggingFace |
| No hacer nada (OCR crudo) | No aplica | No aplica | 0,0808 | 0,4112 | No aplica | No aplica |

No hay datos disponibles que comparen este adaptador con soluciones de corrección basadas en modelos de mayor tamaño ni con motores de OCR que incorporen corrección integrada.

## Limitaciones y advertencias

- La corrupción de entrenamiento y de evaluación es sintética. Modela los fallos del árabe a partir de la estructura de la escritura, pero no es una grabación de la salida de un motor de OCR concreto. Los números publicados describen el rendimiento sobre corrupción sintética; calibrar contra Tesseract o PaddleOCR reales sobre páginas escaneadas queda pendiente y es el paso que el propio autor identifica como siguiente.
- Dominio restringido al árabe estándar moderno de registro periodístico (AraSum). El árabe dialectal y el texto clásico quedan fuera de distribución.
- La guarda de deriva detecta reescrituras completas, no ediciones pequeñas pero seguras y erróneas. Para esas haría falta confianza a nivel de token o una comprobación léxica.
- Riesgo de alucinación: es un modelo generativo y puede reescribir en lugar de reparar; por eso el propio autor recomienda la guarda y la decodificación greedy. El muestreo solo introduce texto que no estaba en la página.
- Sin guarda, el WER es mejor (0,1765) pero el CER empeora (0,0724) frente a la versión con guarda (0,2042 y 0,0671). La elección del umbral es un compromiso explícito entre fidelidad de carácter y encontrabilidad.
- Licencia MIT para el adaptador, pero la licencia del modelo base rige de forma independiente sobre los pesos fusionados; conviene verificarla antes de un despliegue comercial con pesos combinados.
- Adopción nula en el momento de la consulta (0 descargas, 0 likes) y ausencia de validación por terceros: no hay evidencia externa que reproduzca los resultados.
- Capacidades del modelo base (tool calling, contexto largo, multilingüismo) no están validadas tras el ajuste y no deben asumirse en producción.
- No se especifica en la model card la longitud de contexto efectiva del adaptador; la cifra de 32.768 tokens corresponde al modelo base y no está confirmada para esta configuración.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo; todos los enlaces útiles proceden de la propia model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sheeda/arabic-ocr-post-correction-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Código, pipeline de datos y harness de evaluación: https://github.com/Crypto47/arabic-ocr-post-correction
