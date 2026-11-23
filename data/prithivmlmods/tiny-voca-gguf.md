# prithivMLmods/tiny-voca-GGUF

## Resumen

tiny-voca es un modelo de síntesis de voz (text-to-speech) en inglés de código abierto, publicado bajo licencia Apache-2.0 y desarrollado originalmente por Muhammed Nazeem (`n4ze3m`). Su propuesta central es la ligereza extrema: toda la arquitectura, incluida la generación de forma de onda, cabe en unos 4,54 millones de parámetros (el repositorio cuantizado declara 1.603.456 parámetros en safetensors), lo que se traduce en ficheros de entre 1,07 MB y 6,42 MB según la cuantización. Convierte texto en fonemas mediante el fonemizador propio `dizione` y sintetiza audio mono a 24 kHz.

La versión aquí descrita, `prithivMLmods/tiny-voca-GGUF`, es una conversión a formato GGUF del modelo base, con 11 ficheros que cubren desde F32 hasta Q3_K_M, más un fichero de proyección multimodal en BF16. Está pensada para ejecutarse con `llama-tts` sobre llama.cpp, lo que la hace apta para despliegue en cliente (navegador o móvil) y en entornos con recursos muy limitados. El modelo base se entrenó desde cero en menos de 8 horas sobre una única RTX 4090, con un coste declarado de 9,56 dólares y 17,6 horas de voz sintética generada por Qwen3-TTS.

Su relevancia actual reside en la relación entre inteligibilidad y huella de memoria: el autor reporta una tasa media de error de palabra inferior al 0,8 % y una velocidad de aproximadamente 70 veces el tiempo real con cuatro hilos de CPU. A cambio, ofrece únicamente dos voces fijas de inglés americano (F2 femenina y M2 masculina), sin clonación de voz, sin streaming y sin variación prosódica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con sintetizador source-filter (sin vocoder neuronal pesado) |
| Parametros totales | 1.603.456 (safetensors del repo GGUF); el modelo base declara 4,54 M en su arquitectura completa |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32, BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, más mmproj-bf16 |
| Idiomas soportados | inglés (variedad americana, voces F2 y M2) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado con llama.cpp); el modelo base también se distribuye en ONNX |

## Arquitectura y entrenamiento

tiny-voca emplea un encoder transformer que transforma el texto en fonemas a través del fonemizador `dizione` y, a continuación, un sintetizador de tipo source-filter que genera la forma de onda directamente, evitando el coste computacional de un vocoder neuronal. La salida es audio mono a 24 kHz. El control de síntesis se limita a tres parámetros ajustables: velocidad, desplazamiento de tono (pitch shift) y rango de tono (pitch range).

El entrenamiento se realizó desde cero en menos de 8 horas sobre una sola RTX 4090, con un coste declarado de 9,56 dólares, usando 17,6 horas de voz sintética generada por Qwen3-TTS como corpus. No se documentan en la información disponible detalles sobre número de tokens, composición exacta del dataset ni uso de RLHF o DPO. La conversión a GGUF se realizó con llama.cpp y está orientada a la ruta de inferencia `llama-tts`.

## Capacidades

- Síntesis de voz a partir de texto en inglés americano, con salida de audio mono a 24 kHz.
- Dos voces fijas: F2 (femenina) y M2 (masculina).
- Control de velocidad de habla, desplazamiento de tono y rango de tono.
- Fonemización mediante el fonemizador propio `dizione`.
- Ejecución en CPU: aproximadamente 70 veces el tiempo real con cuatro hilos.
- Compatibilidad con `llama-tts` sobre llama.cpp y disponibilidad de pesos en ONNX para el modelo base.
- No soporta clonación de voz, streaming ni variación prosódica.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de agente; es un modelo puramente de TTS.
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- Lectura de artículos y contenido web en el navegador: el tamaño de 1,07-1,29 MB en Q3/Q4 permite cargar el modelo en el cliente y sintetizar texto sin enviar datos a un servidor, con latencia baja gracias a la inferencia en CPU.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o aplicaciones de escritorio que necesiten una voz local, sin dependencia de APIs externas y con coste marginal nulo.
- Asistentes de voz en dispositivos móviles o embebidos: el reducido consumo de memoria (por debajo de 10 MB incluso en F32) encaja en entornos con RAM limitada donde un vocoder neuronal convencional no cabría.
- Anuncios y notificaciones en aplicaciones IoT: mensajes cortos y repetitivos donde la velocidad de 70× tiempo real con cuatro hilos permite generar audio bajo demanda sin pregenerar ficheros.
- Prototipado rápido de interfaces de voz: al ser Apache-2.0 y ejecutarse con llama.cpp, sirve para validar flujos de TTS en un pipeline de desarrollo antes de migrar a un modelo mayor con más voces.
- Generación de audio para pruebas automatizadas: la API de control de velocidad y tono permite producir variantes de un mismo texto para test de sistemas de reconocimiento de voz o de sincronización labial.
- Educación y aprendizaje de idiomas: lectura de frases en inglés americano con velocidad ajustable para prácticas de comprensión auditiva.

## Benchmarks y rendimiento

El autor reporta que el modelo base alcanza una tasa media de error de palabra (WER) inferior al 0,8 % y que se situó en las posiciones 8.ª y 13.ª del Open TTS Leaderboard de noviembre de 2026. No se han publicado en la información disponible tablas detalladas de benchmarks comparativos (MMLU, HumanEval, GSM8K u otras métricas estándar), que además no aplican a un modelo de TTS.

| Metrica | Valor reportado |
|---|---|
| WER medio | < 0,8 % |
| Posicion en Open TTS Leaderboard (nov. 2026) | 8.ª y 13.ª |
| Velocidad de sintesis | ~70× tiempo real con 4 hilos de CPU |
| Frecuencia de muestreo de salida | 24 kHz mono |

## Requisitos de hardware

- VRAM/RAM estimada: inferior a 10 MB para los pesos en F32 (6,42 MB) y alrededor de 1-2 MB en cuantizaciones Q3/Q4; el fichero mmproj-bf16 añade 8,14 MB.
- GPU recomendadas: no requiere GPU; el modelo está diseñado para CPU. Cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo, pero no aporta ventaja significativa frente a CPU dado su tamaño.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; también en navegador y dispositivos móviles.
- Opciones de despliegue: `llama-tts` sobre llama.cpp (ruta oficial indicada por el autor); el modelo base está disponible en ONNX y PyTorch para otras integraciones.
- Latencia y throughput: aproximadamente 70× tiempo real con cuatro hilos de CPU, según el autor; no se proporcionan cifras de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| tiny-voca (este repo) | 1,6 M (repo GGUF); 4,54 M (base) | no disponible | en | Apache-2.0 | GGUF, ONNX | Voces fijas F2/M2, sin clonación, ~70× tiempo real en CPU |
| Qwen3-TTS | no disponible | no disponible | no disponible | no disponible | no disponible | Usado como generador del corpus de entrenamiento de tiny-voca; no se dispone de especificaciones en la información proporcionada |
| Alternativas TTS neuronales de tamano medio | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría; los datos de Qwen3-TTS y de otros sistemas TTS no aparecen en la documentación consultada.

## Limitaciones y advertencias

- Solo admite inglés americano; no hay soporte multilingüe.
- Únicamente dos voces fijas (F2 y M2); no existe clonación de voz ni selección de hablantes adicionales.
- No soporta streaming, lo que limita su uso en conversaciones en tiempo real con respuestas largas.
- Ausencia de variación prosódica más allá de velocidad, pitch shift y rango de tono; la entonación puede resultar plana en textos largos o complejos.
- Riesgo de alucinación y de pronunciación incorrecta en palabras fuera del dominio, nombres propios, siglas o términos técnicos, dado el reducido corpus de entrenamiento (17,6 horas de voz sintética).
- Al haberse entrenado con voz sintética generada por Qwen3-TTS, puede heredar artefactos o sesgos acústicos de ese generador.
- No se documentan evaluaciones de sesgo demográfico ni de robustez frente a entradas adversarias.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base `n4ze3m/tiny-voca` y de los datos sintéticos empleados.
- El autor recomienda F32 para obtener la mejor calidad; las cuantizaciones Q3 pueden degradar la inteligibilidad.
- La información sobre el contexto y los detalles del dataset de entrenamiento no está disponible, lo que dificulta evaluar su comportamiento fuera de los casos reportados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/tiny-voca-GGUF
- Modelo base: https://huggingface.co/n4ze3m/tiny-voca
- Dataset de entrenamiento: https://huggingface.co/datasets/n4ze3m/tiny-voca
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor de la cuantización: https://huggingface.co/prithivMLmods
