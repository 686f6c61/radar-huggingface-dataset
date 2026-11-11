# lazarenkod/fluent-books-pronounce

## Resumen

Fluent Books pronounce es una familia de modelos ligeros para la evaluación de pronunciación en inglés, publicada por el desarrollador lazarenkod como parte de la aplicación Fluent Books (iOS y macOS). El modelo realiza reconocimiento de fonemas mediante CTC sobre una base DistilHuBERT afinada a partir del modelo profesor `facebook/wav2vec2-lv-60-espeak-cv-ft`, y añade cabeceras específicas que detectan errores de pronunciación en fonemas concretos (`th`, `w`, `ng`, `i/ɪ`, `æ`) y en la colocación del acento silábico.

La propuesta es deliberadamente limitada y local: los pesos se distribuyen en formato ONNX empaquetado en archivos `.fbma` de entre 46 y 72 MB, pensados para ejecutarse con ONNX Runtime en el propio dispositivo sin enviar audio a ningún servidor. Se ofrecen tres variantes: `f1` (por defecto, inglés general), `f1b` (continuación sobre habla británica) y `stream` (estudiante causal para evaluar mientras el usuario habla).

Es relevante para desarrolladores que necesiten integrar corrección fonética de inglés en aplicaciones educativas con requisitos de privacidad y latencia estrictos, no como un reconocedor de voz general. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo no declara pipeline estándar en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilHuBERT (transformer) con cabecera CTC sobre fonemas; variante `stream` causal |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el autor no documenta cuantizaciones adicionales) |
| Idiomas soportados | inglés (`f1` inglés general, `f1b` inglés británico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX empaquetado en archivos `.fbma` (formato FBMA1 propietario de la app) |

## Arquitectura y entrenamiento

El modelo parte de `ntu-spml/distilhubert`, un transformer destilado de HuBERT, y se afina con cuatro capas para predecir fonemas mediante CTC, usando como profesor las salidas del modelo `facebook/wav2vec2-lv-60-espeak-cv-ft` de Meta AI. Sobre esa representación fonética se añaden dos cabeceras ONNX: `heads_error.onnx`, que señala pronunciaciones incorrectas de fonemas concretos (`th`, `w`, `ng`, `i/ɪ`, `æ`), y `heads_stress.onnx`, que detecta sílabas que deberían ir acentuadas y no lo están.

La variante `f1b` continúa el entrenamiento de `f1` sobre habla británica e incorpora un adaptador que transforma el estado oculto al formato esperado por las cabeceras de `f1`. La variante `stream` es un estudiante causal que permite evaluar la pronunciación mientras el lector aún está hablando. Los datos de entrenamiento declarados incluyen LibriSpeech (CC BY 4.0), speechocean762 (CC BY 4.0), Common Voice 26.0 (CC0-1.0), RIRS_NOISES (Apache-2.0) y VCTK (CC BY 4.0, solo para comprobaciones); las muestras de audio se renderizan con Kokoro-82M. No se documentan número de tokens, composición exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Reconocimiento de fonemas en inglés mediante CTC a partir de audio.
- Detección de errores de pronunciación en fonemas específicos: `th`, `w`, `ng`, `i/ɪ` y `æ`.
- Detección de acento silábico incorrecto (sílaba no acentuada cuando debería estarlo).
- Evaluación en tiempo real con la variante `stream` (estudiante causal).
- Inferencia local en dispositivo con ONNX Runtime, sin envío de audio a servidores.
- Verificación de integridad de los archivos `.fbma` mediante SHA-256 y tamaño antes de cargar cada conjunto.
- No soporta tool calling, function calling, agentes, visión, audio generativo ni capacidades multilingües más allá del inglés.

## Casos de uso

- Aplicaciones de aprendizaje de inglés para hispanohablantes: el modelo permite señalar errores concretos en fonemas problemáticos para este colectivo (`th`, `i/ɪ`, `æ`) y ofrecer retroalimentación inmediata sin salir del dispositivo.
- Evaluación de lectura en voz alta en apps educativas infantiles: la variante `stream` permite dar feedback mientras el niño lee, sin esperar a que termine la frase, manteniendo el audio en local por privacidad.
- Práctica de acento británico: la variante `f1b` está afinada sobre habla británica y puede usarse en módulos específicos de pronunciación de inglés del Reino Unido.
- Corrección de acento léxico: la cabecera `heads_stress.onnx` detecta sílabas no acentuadas que deberían estarlo, útil en ejercicios de palabras polisílabas y en preparación de exámenes orales.
- Integración en apps de lectura de libros (el caso original de Fluent Books): el modelo evalúa la pronunciación de fragmentos leídos de un texto y marca los sonidos fallados sobre el propio texto.
- Despliegue en dispositivos con recursos limitados: con archivos de 46 a 72 MB en ONNX, es viable en iPhone, iPad y Mac sin GPU dedicada, lo que permite apps de pronunciación offline.
- Verificación de integridad en pipelines de distribución: el esquema de comprobación por SHA-256 y tamaño de cada archivo `.fbma` facilita validar actualizaciones de modelos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño de los archivos (46,3 MB `f1`, 49,3 MB `f1b`, 72,5 MB `stream`) la huella en memoria es del orden de decenas de MB, compatible con dispositivos móviles.
- GPU recomendadas: no aplica; el autor indica ejecución en dispositivo con ONNX Runtime (iOS y macOS).
- Cabe en GPU de consumo: sí, con margen amplio; también en CPU y en hardware móvil.
- Opciones de despliegue: ONNX Runtime; los pesos van empaquetados en el formato `.fbma` de la app, no en GGUF ni safetensors estándar, por lo que no es directamente compatible con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Fluent Books pronounce | DistilHuBERT + CTC fonemas | no disponible | no disponible | Apache-2.0 | ONNX en `.fbma` | Hugging Face (0 descargas) |
| `facebook/wav2vec2-lv-60-espeak-cv-ft` | wav2vec2 + CTC fonemas | no disponible | no disponible | Apache-2.0 | safetensors / PyTorch | Hugging Face, ampliamente usado como profesor |
| `ntu-spml/distilhubert` | DistilHuBERT | no disponible | no disponible | Apache-2.0 | safetensors / PyTorch | Hugging Face, modelo base |
| speechocean762 (referencia de datos) | Corpus de evaluación de pronunciación | no aplica | no aplica | CC BY 4.0 | dataset | OpenSLR |

La comparación con esos modelos no es directa: Fluent Books pronounce añade cabeceras de detección de errores y acento que no existen en los modelos base, pero no ofrece reconocimiento de voz general ni está disponible en formatos estándar de despliegue.

## Limitaciones y advertencias

- No es un reconocedor de voz general: el autor lo describe explícitamente como modelos de comprobación de sonidos para la app Fluent Books.
- No medido con hablantes rusos; el rendimiento con otros perfiles de hablantes no nativos (incluidos hispanohablantes) no está documentado.
- La cabecera de calidad de palabra y las tablas de omisión están calibradas para `f1`; en `f1b` y en el estudiante `stream` son prestadas, no validadas.
- Riesgo de alucinación y de falsos positivos o negativos en la detección de errores fonéticos no cuantificado: no hay benchmarks publicados.
- Idiomas: solo inglés; no hay soporte multilingüe declarado.
- Licencia: Apache-2.0 declarada por el autor a partir de su lectura de las licencias de las fuentes; el propio autor recomienda verificar la licencia frente a la del usuario antes de confiar en ella.
- Formato propietario `.fbma` (FBMA1) que requiere el código de empaquetado del proyecto (`tools/alignment/pack.py`); no es un artefacto ONNX estándar listo para usar con otras herramientas.
- Repositorio con 0 descargas y 0 likes: sin evidencia de uso en producción por terceros.
- Fecha de creación declarada en el repositorio: 2026-11-06.

## Enlaces

- Hugging Face: https://huggingface.co/lazarenkod/fluent-books-pronounce
- Modelo base: https://huggingface.co/ntu-spml/distilhubert
- Modelo profesor: https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft
- Kokoro-82M (renderizado de audio): https://huggingface.co/hexgrad/Kokoro-82M
- LibriSpeech: https://www.openslr.org/12
- speechocean762: https://www.openslr.org/101
- Common Voice: https://commonvoice.mozilla.org
- RIRS_NOISES: https://www.openslr.org/28
- VCTK: https://datashare.ed.ac.uk/handle/10283/3443
