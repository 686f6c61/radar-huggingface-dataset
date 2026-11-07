# acidsound/scyllasband

## Resumen

Scylla's Band es un modelo de síntesis de voz (TTS) y de voz cantada (SVS) multilingüe y multi-voz desarrollado por Spybyscript y publicado por el usuario acidsound en Hugging Face. La versión documentada, `v4-20261106`, unifica en un único modelo la generación de habla y de canto: un mismo flujo rectificado (rectified flow) renderiza ambos modos, seleccionados mediante un parámetro de modo de entrega, y dos decodificadores de forma de onda distintos (Vocos para habla, BigVGAN v2 para canto). El modelo está pensado para inferencia local y autoalojada, con despliegue principal en ONNX Runtime y un backend LiteRT experimental para uso nativo y móvil.

La arquitectura es de tipo TTS de latentes continuos: un frontend G2P multilingüe a nivel de frase produce IDs de fonemas y características de contexto; el modelo predice duraciones de fonemas y un flujo de latentes acústicos rectificado, que se decodifican a audio mediante un adaptador acústico propio y un vocoder. La versión `v4` añade soporte completo de coreano (normalización de texto, G2P basado en las reglas de pronunciación estándar del Instituto Nacional de la Lengua Coreana) y síntesis de canto a partir de una partitura en JSON (letra, notas y compases) en las catorce voces del modelo.

El modelo es relevante por su enfoque en inferencia local de alta velocidad (RTF de 0,02 a 0,05 en CPU con el runtime nativo C++), su licencia Apache 2.0 y su despliegue multiplataforma (Linux, Windows, macOS, iOS, visionOS, Android y WebGPU en navegador). El repositorio ocupa 4,5 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS de latentes continuos con flujo rectificado (rectified flow) y decodificadores neuronales; frontend G2P multilingüe a nivel de frase |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (bundle ONNX optimizado para CPU, `MatMulNBits` en WebGPU); pesos de precisión completa en ONNX por defecto |
| Idiomas soportados | en, es, it, fr, de, vi, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, LiteRT/TFLite, CoreML, PyTorch, WebGPU (ONNX Runtime Web) |

## Arquitectura y entrenamiento

Scylla's Band es un modelo de TTS de latentes continuos. El pipeline consta de un frontend G2P multilingüe que convierte texto en IDs de fonemas, puntuación y características de frontera y contexto; un predictor de duraciones de fonemas; un flujo rectificado que genera latentes acústicos; un adaptador acústico propio; y un vocoder final. La versión `v4-20261106` introduce un segundo decodificador: el habla se renderiza con Vocos y el canto con BigVGAN v2 afinado sobre las voces del modelo. El runtime selecciona el decodificador según el modo de entrega.

El flujo de la versión `v4` parte del flujo destilado de `v3-20261104` y se continúa mediante reflow sobre material cantado. Las rutas de canto y balada se destilan una segunda vez desde el campo con classifier-free guidance del profesor (guidance 2), de modo que el flujo reproduce la respuesta guiada sin guía: 4 pasos de Euler y una evaluación por paso, igual que en habla, frente a los 8 pasos de Heun con guía (32 evaluaciones) del primer candidato de canto. La salida hablada arranca idéntica a `v3`. El contrato de grafo `scyllasband_measured_controls_v4` añade la entrada `delivery_mode_id`; los runtimes de `v3` rechazan este bundle.

El soporte de coreano incluye normalización de texto sensible al contexto (sistemas numerales nativo y sino-coreano, fechas ISO, horas, divisas, porcentajes, temperaturas y siglas) implementada de forma idéntica en Python y C++ nativo, y un G2P reglado basado en las reglas de pronunciación estándar del Instituto Nacional de la Lengua Coreana (palatalización, enlace, elisión de `ㅎ`, neutralización de coda, lateralización, nasalización y tensificación). El autor declara verificación formal en TLA+ (34.276 estados sin violaciones de invariantes), paridad bit-exacta entre C++ y Python (CTest 16/16, Pytest 131/131, error 0,0) y una CER del 0,0 % en frases coreanas principales evaluadas con `faster-whisper` (`large-v3-turbo`).

## Capacidades

- Síntesis de voz multilingüe en siete idiomas: inglés, español, italiano, francés, alemán, vietnamita y coreano.
- Catorce voces distintas con control de entrega de habla: intensidad, ritmo y tono, cada uno en el rango de −2 a 2.
- Síntesis de voz cantada (pop y balada) a partir de una partitura JSON con letra, notas y compases, en las catorce voces.
- Normalización de texto específica por idioma, con soporte especialmente detallado para coreano (numerales, fechas, horas, divisas, unidades, siglas).
- G2P fonológico reglado para coreano conforme a la norma estándar de pronunciación.
- Inferencia local en CPU, GPU y navegador (WebGPU) sin servidor backend.
- Interfaz web Gradio (`webui.py`) para probar voces, ajustes prosódicos, normalización y G2P.
- Demo independiente en WebGPU con pesos INT8 y caché en el navegador (743 MB cacheados una sola vez).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (modelo de síntesis de voz).
- Capacidades de visión o audio de entrada: no disponible.

## Casos de uso

- Audiolibros y narración multilingüe: el modelo genera habla en siete idiomas con control de ritmo, intensidad y tono, lo que permite ajustar la prosodia por capítulo y mantener una voz consistente a lo largo de una obra.
- Doblaje y localización de contenido: al soportar español, italiano, francés, alemán, inglés, vietnamita y coreano con catorce voces, se puede producir una pista de voz por idioma desde el mismo pipeline sin cambiar de modelo.
- Asistentes de voz embebidos en móvil: el backend LiteRT y los formatos CoreML/TFLite permiten ejecutar la síntesis en iOS, visionOS y Android sin conexión a un servidor.
- Síntesis de canto para demos musicales: a partir de una partitura JSON con letra, notas y compases, el modelo genera voces cantadas en modo pop o balada, útil para maquetas y preproducción musical.
- Accesibilidad y lectura de pantalla: la inferencia en CPU a RTF de 0,02–0,05 (18,9×–42,9× tiempo real) con el runtime C++ nativo permite integrar la síntesis en aplicaciones de escritorio con latencia baja y sin GPU.
- Aplicaciones web sin backend: la demo WebGPU ejecuta la síntesis íntegramente en el navegador con pesos INT8 cacheados, adecuada para demos públicas, prototipos y entornos con restricciones de privacidad donde el texto no debe salir del cliente.
- Prototipado de interfaces de voz: la WebUI Gradio permite comparar las catorce voces, ajustar prosodia y revisar la normalización y el G2P antes de fijar una configuración en producción.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| RTF (CPU, runtime C++ nativo) | 0,02–0,05 | Equivale a 18,9×–42,9× tiempo real |
| CER en coreano (faster-whisper large-v3-turbo) | 0,0 % | Frases coreanas principales |
| Paridad C++ / Python | Error 0,0 (SNR infinito) | Frontend e inferencia |
| Pytest | 131/131 | Suite de pruebas Python |
| CTest | 16/16 | Suite de pruebas C++ |
| Verificación TLA+ | 34.276 estados, 0 violaciones | Invariantes del conversor fonológico y del ciclo de vida de streaming |

No se han publicado resultados de benchmarks comparativos estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que no aplican a un modelo de síntesis de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el bundle completo ocupa 4,5 GB y existe un bundle ONNX INT8 optimizado para CPU.
- GPU recomendadas: no disponible. El modelo está diseñado para inferencia local en CPU y para aceleración mediante ONNX Runtime y WebGPU.
- Compatibilidad con GPU de consumo: no se especifican modelos concretos; el despliegue principal documentado es en CPU con el runtime nativo C++.
- Opciones de despliegue: ONNX Runtime (precisión completa e INT8), LiteRT/TFLite, CoreML, PyTorch, WebGPU (ONNX Runtime Web) y el runtime propio `scyllasband` (ABI C 3.1.0) con comandos `download`, `speak` y `sing`.
- Plataformas soportadas por el runtime: Linux, Windows, macOS, iOS, visionOS y Android.
- Latencia y throughput: RTF de 0,02–0,05 en CPU con el ejecutable nativo `scyllasband_speak.exe`; en WebGPU, 4 pasos de Euler con pesos INT8 superan el tiempo real en el navegador según el autor.
- Almacenamiento: 743 MB de pesos compartidos cacheados en el navegador para la demo WebGPU; repositorio de 4,5 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Canto | Licencia | Despliegue local |
|---|---|---|---|---|---|
| Scylla's Band v4 | no disponible | 7 (en, es, it, fr, de, vi, ko) | Sí (partitura JSON) | Apache 2.0 | ONNX, LiteRT, CoreML, WebGPU, C++ nativo |
| Alternativas de TTS multilingüe de latentes continuos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificables sobre modelos comparables de la misma categoría (parámetros, contexto, rendimiento o disponibilidad), por lo que la comparativa cuantitativa se marca como no disponible.

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta; se trata de un modelo reciente y poco validado por la comunidad.
- El autor declara métricas de calidad (CER 0,0 %, paridad bit-exacta, verificación TLA+) que no han sido replicadas de forma independiente en la información disponible.
- Los runtimes construidos para `v3` rechazan el bundle `v4` por el cambio de contrato de grafo (`delivery_mode_id`); es necesario actualizar el runtime o fijar la versión `v3-20261104`.
- El soporte de coreano depende de una asignación de condicionamiento acústico (`language_id = 3`, condicionamiento romance) descrita por el autor; no se documentan evaluaciones subjetivas de naturalidad por idioma.
- No se detallan sesgos de voz, cobertura de acentos ni comportamiento ante texto fuera de dominio; el riesgo de alucinación prosódica o de pronunciación en palabras fuera del vocabulario G2P no está cuantificado.
- La longitud de contexto de texto no está especificada; el procesamiento es a nivel de frase, lo que puede limitar la coherencia prosódica en documentos muy largos.
- La licencia Apache 2.0 permite uso comercial, pero la información no incluye detalles sobre la procedencia de los datos de entrenamiento ni sobre posibles restricciones adicionales de las voces.
- El uso de voces sintéticas para suplantación o desinformación requiere medidas de control; la model card no menciona mecanismos de marca de agua o detección.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/acidsound/scyllasband
- Runtime en GitHub: https://github.com/lowkeytea/scyllasband
- Ficha en awesome-ai-voice: https://github.com/wildminder/awesome-ai-voice/blob/main/models/scyllasband.md
