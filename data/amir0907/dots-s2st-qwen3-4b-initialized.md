# amir0907/dots-s2st-qwen3-4b-initialized

## Resumen

dots-s2st-qwen3-4b-initialized es un checkpoint de arquitectura para traduccion de voz a voz (speech-to-speech translation, S2ST) construido sobre Qwen3-4B, el modelo de lenguaje de Alibaba, combinado con el encoder de audio AuT y el codec continuo dots. El autor, amir0907, lo publica como un artefacto de inicializacion: pesos donantes oficiales de Qwen3-4B/AuT/dots mas interfaces, expertos de alineacion y expresion de origen, y expertos acusticos MoVE recien inicializados. No es un modelo entrenado; la propia model card lo declara explicitamente y advierte que no ha habido entrenamiento S2ST ni validacion en Ascend.

El interes tecnico esta en la propuesta de arquitectura: fuente en ingles, traduccion completa a mandarin antes de generar cualquier latente acustico, seleccion de una voz objetivo independiente y un codec continuo dots a 48 kHz y 25 Hz con parches de 4 frames, lo que equivale a 6,25 parches acusticos AR por segundo. Incorpora cinco especialistas DiT LoRA nuevos (rank 16, alpha 32, ultimos 6 bloques), un router suave y un fallback neutro. Los adaptadores Kimi originales no se transfirieron.

Es relevante ahora porque documenta un pipeline S2ST completo con interfaces de carga propias (`dots_tts`) y pruebas de integridad bit-exact de los pesos donantes, pero su estado es de andamiaje, no de producto. Cualquier evaluacion de calidad de traduccion, audio o emocion queda pendiente. El repositorio ocupa 12,2 GB y contiene 5.920.040.504 parametros en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: LLM Qwen3-4B + encoder de audio AuT + codec continuo dots + expertos DiT LoRA + router |
| Parametros totales | 5.920.040.504 |
| Parametros activos | no disponible (no es MoE declarado; incluye router sobre cinco especialistas LoRA) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos canonicos en BF16; no se ha re-guardado en FP16) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone de lenguaje Qwen3-4B con el encoder de audio AuT y el codec continuo dots. El flujo declarado es: audio de entrada en ingles, traduccion completa a mandarin en el espacio textual antes de generar cualquier latente acustico, seleccion de una voz objetivo independiente y sintesis mediante el codec dots a 48 kHz y 25 Hz, con parches de 4 frames y 6,25 parches acusticos AR por segundo. Sobre el backbone se anaden cinco especialistas DiT LoRA de rango 16, alpha 32, aplicados en los ultimos 6 bloques, con un router suave y un fallback neutro. Los adaptadores Kimi originales no se transfirieron.

No ha habido entrenamiento S2ST ni validacion en Ascend. El plan futuro declarado es fine-tuning denso completo, con las fases de especializacion LoRA y router como etapas separadas. Se incluyen interfaces de expresion y alineacion de origen, y expertos acusticos MoVE nuevos. La carga requiere un loader custom revisado e instalable (`dots_tts`), no AutoModel generico ni `trust_remote_code`. Los pesos donantes canonicos en BF16 no han pasado por un re-guardado en FP16; se incluyen detalles de migracion y hashes, y el estado del optimizador no se ha fabricado. Permanece abierto: llanto real, transferencia de expresion temporal, desenredo de referencia objetivo y sharding/resume en NPU.

## Capacidades

- Traduccion de voz a voz ingles a mandarin, con traduccion textual completa antes de la generacion acustica.
- Sintesis de audio mediante codec continuo dots a 48 kHz y 25 Hz.
- Seleccion de voz objetivo independiente de la fuente.
- Especializacion mediante cinco adaptadores DiT LoRA con router suave y fallback neutro.
- Interfaces de expresion de origen y alineacion.
- Expertos acusticos MoVE inicializados.
- API opcional de prosodia con mascaras de confianza y ausencia, sin pipeline de extraccion de cues en produccion.
- Cabezas no verbales sobre la linea temporal de features de AuT, no sobre un detector de eventos verificado de 10-20 ms.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo en y zh declarados.
- Modo thinking, vision o audio de entrada adicional: no disponible.

## Casos de uso

- Prototipado de investigacion en S2ST: sirve como punto de partida reproducible para experimentar con la separacion traduccion textual / generacion acustica, gracias a los pesos donantes verificados bit-exact y a las interfaces ya inicializadas.
- Evaluacion de arquitecturas de codec continuo: el codec dots a 48 kHz y 25 Hz con parches de 4 frames permite medir latencia y fidelidad de reconstruccion en pipelines de audio, aunque la calidad no esta establecida.
- Desarrollo de sistemas de traduccion ingles-mandarin con voz preservada: el diseno de voz objetivo independiente es adecuado para experimentos de clonacion controlada, siempre que se valide antes la calidad de traduccion.
- Integracion en pipelines de investigacion con `dots_tts`: el loader custom y el wheel incluido permiten montar entornos Python 3.12 reproducibles para pruebas de componentes.
- Pruebas de especializacion LoRA y routing: los cinco especialistas DiT con router suave y fallback neutro son un banco de pruebas para estudiar enrutado de expertos en modelos de audio.
- Validacion de infraestructura de entrenamiento: el trainer de debug mononodo incluido sirve para comprobar cargas de checkpoints y smoke tests acusticos antes de escalar a entrenamiento completo.
- Investigacion sobre prosodia y expresion no verbal: la API opcional de prosodia y las cabezas no verbales permiten explorar senales de expresion, con la advertencia de que el detector de eventos no esta verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta comprobaciones de integridad y smoke tests, no metricas de calidad:

| Prueba | Resultado |
|---|---|
| Tests offline de componentes (Kaggle CPU/T4) | 26 pasados |
| Recarga canonica completa estricta | pasada |
| Tensores donantes verificados bit-exact | 3333, incluidos todos los embeddings originales |
| Smoke acustico controlado a tamano completo | latente finito [1,4,128], pico 10283 MiB |
| Traduccion con mel aleatorio (no entrenada) | limite de 8 tokens, fallo cerrado sin audio |
| Backward a tamano completo | no probado |
| Validacion en Ascend | no probada |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el smoke test acustico a tamano completo reporto un pico de 10283 MiB (aproximadamente 10 GB) en el escenario probado.
- GPU recomendadas: no disponible; las pruebas se ejecutaron en Kaggle CPU/T4.
- Cabe en GPU de consumo: no confirmado; el pico de 10 GB del smoke test sugiere que podria caber en tarjetas con 12-16 GB, pero no hay validacion oficial.
- Opciones de despliegue: loader custom `dots_tts` (wheel `dots_tts-0.3.1-py3-none-any.whl`) con Python 3.12; no se admite AutoModel generico ni `trust_remote_code`. vLLM, llama.cpp, Ollama y TGI no estan soportados ni documentados.
- Latencia y throughput: no disponible. El codec opera a 6,25 parches acusticos AR por segundo, pero no hay cifras de rendimiento publicadas.
- Entrenamiento: el trainer de debug mononodo incluido rechaza explicitamente ejecuciones NPU/distribuidas no validadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| dots-s2st-qwen3-4b-initialized | 5.920.040.504 | no disponible | audio-to-audio (S2ST en a zh) | apache-2.0 | inicializado, sin entrenamiento S2ST |
| Qwen3-4B | no disponible en la informacion | no disponible | texto | no disponible | modelo base donante |
| Alternativas S2ST comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos S2ST directamente comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo S2ST entrenado: la calidad de traduccion, audio y emocion no esta establecida.
- No ha habido validacion en Ascend ni pruebas de backward a tamano completo.
- El smoke test acustico demuestra solo que el latente es finito, no calidad natural de S2ST.
- La traduccion con mel aleatorio no entrenada fallo cerrado sin generar audio.
- La API de prosodia carece de pipeline de extraccion de cues en produccion.
- Las cabezas no verbales operan sobre la linea temporal de AuT, no sobre un detector de eventos de 10-20 ms; el timing de risa/llanto en alta resolucion no esta validado.
- El desenredo de identidad y expresion no esta validado.
- El trainer incluido rechaza ejecuciones NPU/distribuidas no validadas; el entrenamiento largo requiere comprobaciones de readiness y aprobacion separadas.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible.
- Idiomas limitados a en y zh; no hay soporte multilingue adicional declarado.
- Licencia apache-2.0 permite uso comercial, pero el estado no entrenado hace inviable su uso en produccion sin entrenamiento y validacion previos.
- La carga exige el loader custom `dots_tts`; no funciona con AutoModel generico ni `trust_remote_code`.
- El repositorio ocupa 12,2 GB y los pesos canonicos estan en BF16, sin re-guardado en FP16.

## Enlaces

- Hugging Face: https://huggingface.co/amir0907/dots-s2st-qwen3-4b-initialized
- Model card del autor: incluida en la pagina de Hugging Face
- Wheel del loader: `dots_tts-0.3.1-py3-none-any.whl` (incluido en el artefacto)
- Requisitos: `s2st-stage1-requirements.txt` (incluido en el artefacto)
- Informe de pruebas de etapa uno: suministrado junto al checkpoint segun la model card
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada
