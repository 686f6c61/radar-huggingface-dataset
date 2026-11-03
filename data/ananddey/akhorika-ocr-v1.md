# ananddey/akhorika-ocr-v1

## Resumen

akhorika-ocr-v1 es un modelo de reconocimiento óptico de caracteres (OCR) de pesos abiertos especializado en texto impreso en asamés (অসমীয়া), una lengua indoaria del noreste de la India escrita en alfabeto bengalí-asamés. Lo desarrolla Anand Dey y se distribuye a través de HuggingFace con el identificador `ananddey/akhorika-ocr-v1`. El modelo resuelve la transcripción de imágenes de texto impreso (líneas, palabras o párrafos) a texto digital en asamés, una tarea con poca cobertura en modelos OCR generalistas y en la que los sistemas multilingües suelen degradarse por la baja representación del idioma.

Técnicamente se apoya en la arquitectura Minicpm-ocr, un modelo vision-language de tipo image-text-to-text con aproximadamente 1.300 millones de parámetros (1.300.434.160 según los pesos en safetensors), empaquetado para la librería `transformers` y compatible con el pipeline `image-text-to-text`. Requiere `transformers >= 5.21.0` y funciona en `bfloat16` con unos 8 GB de VRAM, además de poder ejecutarse en CPU con latencias de decenas de segundos.

Su relevancia actual radica en la digitalización de patrimonio documental asamés —libros escaneados, prensa histórica, formularios mecanografiados— donde la disponibilidad de OCR fiable es limitada. El autor reporta un CER del 3,40 % y un WER del 21,09 % en el subconjunto asamés de IndicOCR-Bench, métricas declaradas por el propio autor y no verificadas de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Minicpm-ocr (vision-language, image-text-to-text) |
| Parámetros totales | 1.300.434.160 (~1,3 B) |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el autor documenta ejecución en bfloat16) |
| Idiomas soportados | asamés (`as`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 5,2 GB |
| Librería | transformers (>= 5.21.0) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura Minicpm-ocr, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje para convertir imágenes de texto en secuencias de caracteres. La model card no detalla la configuración interna (número de capas, dimensión oculta, resolución de entrada del codificador visual ni presupuesto de tokens visuales), por lo que estos datos deben considerarse no disponibles. La inferencia se realiza con `AutoModelForImageTextToText` y un procesador multimodal que aplica una plantilla de chat con `enable_thinking=False` y una instrucción textual del tipo `Text Recognition:`.

No se especifica en la información disponible el volumen de tokens de entrenamiento, la composición del corpus, ni si se aplicaron etapas de ajuste supervisado, RLHF o DPO. La única indicación sobre los datos es que el modelo está entrenado exclusivamente con texto impreso y que las 428 imágenes de evaluación del subconjunto asamés de IndicOCR-Bench no formaron parte del entrenamiento. El autor recomienda alturas de texto de al menos 30 píxeles para preservar la nitidez de los glifos, lo que sugiere una resolución de trabajo orientada a recortes de documento más que a páginas completas.

## Capacidades

- Reconocimiento de texto impreso en asamés a partir de recortes de imagen que contienen una línea, una palabra o un párrafo.
- Salida de texto limpio en asamés, sin traducción ni normalización lingüística adicional.
- Procesamiento de documentos escaneados de libros, periódicos, revistas, formularios mecanografiados y archivos de imprenta.
- Interfaz conversacional mediante plantilla de chat (`apply_chat_template`) con contenido multimodal imagen + texto.
- Generación determinista recomendada (`do_sample=False`) para transcripción reproducible.
- Ejecución en GPU en `bfloat16` y en CPU (funcional pero lenta).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo thinking activo.

## Casos de uso

- Digitalización de prensa histórica asamés: el modelo transcribe recortes de columnas y párrafos de periódicos escaneados, lo que permite construir archivos consultables y preservar publicaciones antiguas que no existen en formato digital.
- Indexación de bibliotecas y colecciones: extraer texto de páginas escaneadas para alimentar motores de búsqueda internos, con la ventaja de un CER del 3,40 % que reduce la necesidad de corrección manual posterior.
- Transcripción asistida para editores: generar un primer borrador automático de textos impresos que un revisor humano corrige, aprovechando el WER del 21,09 % como indicador de que la revisión sigue siendo necesaria pero el esfuerzo se reduce drásticamente.
- Procesamiento de formularios y documentos administrativos impresos en asamés: digitalizar campos mecanografiados de expedientes y registros para su incorporación a sistemas de gestión documental.
- Preservación lingüística y corpus para PLN: crear corpus de texto asamés a partir de material impreso para entrenar o evaluar otros modelos de lenguaje del idioma.
- Digitalización de material educativo: convertir libros de texto y apuntes impresos en asamés a formato editable o accesible, útil para plataformas de aprendizaje y para lectores de pantalla.
- Enriquecimiento de archivos regionales: integrar el modelo en pipelines de digitalización masiva de instituciones del noreste de la India, procesando recortes de página con al menos 30 píxeles de altura de texto.

## Benchmarks y rendimiento

Evaluación sobre 428 recortes de documento impreso del subconjunto asamés de IndicOCR-Bench (`sarvamai/indic-ocr-bench`), con 128.516 caracteres y 19.283 palabras, sin solapamiento con el entrenamiento. Resultados declarados por el autor, no verificados de forma independiente.

| Métrica | Strict | Normalized |
|---|---:|---:|
| Character Error Rate (CER) | 3,40 % | 2,97 % |
| Word Error Rate (WER) | 21,09 % | 18,21 % |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas frente a alternativas OCR.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 GB en `bfloat16` para los 1,3 B de parámetros más las activaciones del codificador visual.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; el autor no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: sí, siempre que dispongan de 8 GB o más de VRAM en `bfloat16`.
- CPU: funciona, pero con latencias del orden de decenas de segundos por imagen según el autor.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `AutoProcessor`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma cuantitativa; solo la indicación cualitativa de decenas de segundos en CPU.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos OCR alternativos sobre IndicOCR-Bench (asamés) ni de comparativas publicadas por el autor. La siguiente tabla recoge únicamente los datos conocidos del modelo y deja el resto como no disponible.

| Modelo | Parámetros | Contexto | CER (IndicOCR-Bench as) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| akhorika-ocr-v1 | ~1,3 B | no disponible | 3,40 % (strict) | no disponible | HuggingFace (`ananddey/akhorika-ocr-v1`) |
| Alternativas OCR multilingües | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado solo con texto impreso: no es fiable con escritura manuscrita.
- No maneja diseños multicolumna; lee regiones de texto, no la maquetación de página completa.
- No está diseñado para tablas, libros contables ni fórmulas matemáticas.
- Cobertura monolingüe: solo asamés (`as`); no se documenta soporte para bengalí, hindi ni otras lenguas indoarias, aunque compartan alfabeto.
- Licencia no especificada: no se puede confirmar el uso comercial ni las condiciones de redistribución; conviene contactar con el autor antes de integrarlo en producción.
- Métricas no verificadas: CER y WER proceden de la model card del autor y no han sido validadas de forma independiente.
- Riesgo de alucinación: como modelo generativo de image-to-text, puede producir texto plausible que no aparezca en la imagen, especialmente en recortes de baja resolución o con ruido.
- Requiere recortes con altura de texto de al menos 30 píxeles; por debajo, la precisión cae y no se documenta el comportamiento exacto.
- Dependencia de versiones recientes: exige `transformers >= 5.21.0`, lo que puede complicar la integración en entornos con versiones fijadas.
- Sin datos de sesgos: no se documentan sesgos conocidos ni evaluación de robustez frente a dominios (prensa, formularios, libros) por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ananddey/akhorika-ocr-v1
- Dataset de evaluación IndicOCR-Bench: https://huggingface.co/datasets/sarvamai/indic-ocr-bench
- Contacto del autor: ananddey.nic@gmail.com (indicado en la model card)
- Paper, blog o repositorio adicional: no disponible en la información proporcionada
