# guymorlan/levanti_translate_he_ar

## Resumen

Levanti Translate HE-AR es un modelo de traducción automática especializado en la conversión de hebreo a árabe levantino coloquial, desarrollado por Guy Mor-Lan (Universidad Hebrea de Jerusalén). A diferencia de los sistemas de traducción hebreo-árabe convencionales, que suelen producir árabe estándar moderno (MSA), este modelo genera variantes dialectales habladas: palestina, libanesa, siria y egipcia. Se trata de un fine-tuning del modelo MarianMT `Helsinki-NLP/opus-mt-he-ar` sobre el dataset Levanti, propiedad del mismo autor.

Arquitectura Marian (transformer encoder-decoder) con 76,6 millones de parámetros, orientada a text2text-generation. El modelo incorpora una innovación práctica: la generación condicionada por dialecto mediante un token inicial (`P`, `L`, `S`, `E`) seguido de un espacio, lo que permite seleccionar la variedad dialectal en tiempo de inferencia sin necesidad de múltiples checkpoints.

Su relevancia radica en cubrir un nicho poco atendido: la traducción hacia árabe dialectal coloquial, útil para subtitulado, localización de contenido y aplicaciones de comunicación cotidiana donde el MSA resulta artificial. El modelo es pequeño (0,3 GB), desplegable en hardware modesto, y se distribuye con licencia CC-BY-SA 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder) |
| Parametros totales | 76.613.448 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantizacion estandar via transformers/GGUF no documentada) |
| Idiomas soportados | he (hebreo, entrada), ar (arabe levantino coloquial, salida) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `Helsinki-NLP/opus-mt-he-ar`, un transformer encoder-decoder de la familia MarianNMT entrenado originalmente para traducción hebreo-árabe. El ajuste se realizó durante 8 épocas sobre el dataset [Levanti](https://huggingface.co/datasets/guymorlan/levanti), compuesto por pares de traducción hebreo → árabe dialectal levantino. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica principal es la generación condicionada por dialecto: el primer token de la secuencia de entrada actúa como indicador de la variedad deseada (`P` palestino, `L` libanés, `S` sirio, `E` egipcio), seguido de un espacio y el texto en hebreo. Esto permite un único modelo polivalente para cuatro dialectos. No se documentan otras innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Traducción de texto hebreo a árabe levantino coloquial en cuatro variantes dialectales (palestina, libanesa, siria, egipcia).
- Generación condicionada por dialecto mediante token inicial (`P`/`L`/`S`/`E`).
- Traducción de frases y oraciones de uso cotidiano (el ejemplo de la model card: "אני רוצה ללכת מחר לחנות" → "بدي أروح ع الدكان بكرا").
- Pipeline de `translation` compatible con la librería `transformers`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada a la pareja hebreo → árabe dialectal.

## Casos de uso

- Subtitulado y doblaje de contenido audiovisual israelí hacia árabe coloquial: el modelo permite elegir el dialecto del público destino (por ejemplo, `P` para audiencias palestinas, `E` para egipcias), produciendo un registro natural frente al MSA.
- Localización de interfaces y mensajes de aplicaciones para usuarios araboparlantes: traducción de cadenas cortas del hebreo al dialecto local, con selección de variante según el mercado.
- Traducción de conversaciones cotidianas en contextos de atención al ciudadano o servicios bilingües: frases de uso diario donde el árabe estándar resultaría rígido.
- Investigación en traducción dialectal: modelo de referencia pequeño y reproducible para experimentos de traducción condicionada por dialecto, dado su tamaño (76,6 M de parámetros) y licencia abierta.
- Generación de datos sintéticos dialectales: uso del modelo para crear pares hebreo → árabe levantino que alimenten otros sistemas o evaluaciones.
- Herramientas de comunicación para ONG y organismos que operan en la región: traducción rápida de mensajes del hebreo a dialectos locales en contextos de asistencia.
- Prototipado y despliegue ligero: su tamaño reducido permite ejecutarlo en CPU o GPU consumer para demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (76,6 M de parámetros, ~0,3 GB de pesos); menos de 0,5 GB con cuantización a fp16 o int8.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (GTX 1050, RTX 2060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: `transformers` (pipeline de traducción), servidores compatibles con endpoints (tag `endpoints_compatible`), despliegue en Azure (tag `deploy:azure`). Compatibilidad con vLLM, llama.cpp u Ollama no documentada.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera baja latencia en GPU y aceptable en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| guymorlan/levanti_translate_he_ar | 76,6 M | no disponible | he → ar (dialectal) | CC-BY-SA 4.0 | Fine-tuning dialectal con token condicionador |
| Helsinki-NLP/opus-mt-he-ar | no disponible | no disponible | he ↔ ar (MSA) | no disponible en la información | Modelo base; traduce a árabe estándar |
| Helsinki-NLP/opus-mt-ar-he | no disponible | no disponible | ar → he | no disponible en la información | Dirección inversa; citado en la model card |

No se dispone de datos de benchmarks ni de otros modelos comparables de traducción hebreo → árabe dialectal en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset dialectal específico, puede reflejar sesgos de la fuente y de los dialectos cubiertos.
- Riesgo de alucinación: inherente a los modelos de traducción neuronal; puede producir traducciones fluentes pero inexactas, especialmente en frases largas o ambiguas.
- Limitaciones de contexto e idioma: solo cubre hebreo → árabe levantino; no soporta otras parejas ni árabe estándar moderno. La longitud de contexto no está documentada.
- Restricciones de licencia: CC-BY-SA 4.0 exige atribución y compartir bajo la misma licencia las obras derivadas; puede condicionar el uso comercial propietario.
- Caveat para producción: el modelo tiene solo 11 descargas y 0 likes, sin validación externa ni benchmarks publicados; conviene evaluarlo en el dominio concreto antes de desplegarlo.
- La selección de dialecto depende de que el token inicial se formatee correctamente (letra seguida de espacio); un uso incorrecto puede degradar la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guymorlan/levanti_translate_he_ar
- Dataset Levanti: https://huggingface.co/datasets/guymorlan/levanti
- Modelo base (citado en la model card): https://huggingface.co/Helsinki-NLP/opus-mt-he-ar
- Modelo base alternativo citado: https://huggingface.co/Helsinki-NLP/opus-mt-ar-he
