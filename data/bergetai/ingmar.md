# bergetai/ingmar

## Resumen

Ingmar (nombre de voz en la API de Berget: `sten`) es un modelo de síntesis de voz (text-to-speech) en sueco desarrollado por Berget AI. Se trata de un ajuste fino de `openbmb/VoxCPM2`, un modelo de difusión autorregresivo de 2B parámetros sin tokenizador, sobre el que se ha aplicado un adaptador LoRA posteriormente fusionado en los pesos base. El resultado es un reemplazo directo del modelo original —misma arquitectura y mismos cargadores— que produce habla natural en sueco, con la vibrante alveolar correcta, prosodia sueca y acentuación de palabras compuestas que el modelo base no generaba de forma fiable.

El modelo resuelve un problema concreto: el sueco está mal cubierto en los sistemas TTS multilingües habituales. Según el autor, la evaluación del modelo base frente a Zonos 3 Mini, KugelAudio, Qwen3-TTS y Piper en sueco no produjo habla natural en ninguno de los casos. Ingmar cubre esa carencia para una única voz de hablante, entrenada sobre un audiolibro narrado profesionalmente.

Es relevante ahora porque ofrece una vía práctica (Apache-2.0, pesos safetensors, integración con la librería `voxcpm`) para obtener TTS de calidad en sueco sin depender de servicios propietarios, y porque Berget AI lo expone también como API alojada en la UE con cumplimiento GDPR y DPA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoxCPM2: difusión autorregresiva sin tokenizador (tokenizer-free diffusion AR) con decodificador AudioVAE V2 |
| Parametros totales | 2.290.004.544 (≈2,29B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; `max_len` por defecto de 4096 en la generación |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | sueco (sv) e inglés (en); otros idiomas no soportados oficialmente |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 5,0 GB) |
| Frecuencia de muestreo de salida | 48 kHz mono (WAV) |
| Modelo base | openbmb/VoxCPM2 |
| Librería | voxcpm (Python 3.12, torch ≥ 2.5) |

## Arquitectura y entrenamiento

Ingmar hereda la arquitectura completa de VoxCPM2: un modelo de difusión autorregresivo sin tokenizador, con un decodificador de audio AudioVAE V2 que produce audio a 48 kHz en mono. El ajuste fino se realizó mediante un adaptador LoRA sobre el modelo base, entrenado con un audiolibro sueco narrado profesionalmente por un único hablante. El adaptador se fusionó posteriormente en los pesos base, de modo que el artefacto publicado es un modelo completo que se carga con los mismos cargadores que VoxCPM2 y no requiere pasos adicionales de fusión.

Los datos de entrenamiento (el audiolibro) se mantienen privados, y la narración fue cedida para entrenamiento de ML sin compensación según acuerdo con Berget AI de noviembre de 2026. El adaptador LoRA por separado está publicado en `bergetai/ingmar-lora`, donde se documentan los detalles de entrenamiento y notas sobre ROCm. No se especifica en la información disponible el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO adicionales sobre el ajuste.

## Capacidades

- Síntesis de voz (text-to-speech) en sueco con prosodia natural, vibrante alveolar correcta y acentuación de compuestos suecos.
- Síntesis de voz en inglés con calidad verificada por el autor.
- Generación de audio a 48 kHz mono mediante el decodificador AudioVAE V2.
- Control de calidad de generación mediante parámetros de inferencia (`cfg_value`, `inference_timesteps`).
- Control de pausas mediante saltos de línea a nivel de frase en el texto de entrada.
- Integración como reemplazo directo de VoxCPM2: misma API de carga (`VoxCPM.from_pretrained`) y misma firma de generación.
- Disponibilidad como API alojada con metadatos de procedencia IA (RIFF `LIST`/`INFO` y cabecera `X-Berget-AI-Generated`).
- No se documentan capacidades de clonación de voz, tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- **Locución de audiolibros en sueco**: el modelo se entrenó precisamente sobre narración de audiolibros de un único hablante, por lo que es adecuado para narrar textos largos dividiendo la entrada por frases y ajustando `max_len` cuando sea necesario.
- **Accesibilidad y lectura de pantalla**: integración en aplicaciones que conviertan texto a voz para usuarios suecohablantes, con salida a 48 kHz que mejora la inteligibilidad frente a voces TTS de menor muestreo.
- **Asistentes de voz y atención al cliente**: la API alojada en la UE con DPA y cumplimiento GDPR permite desplegar respuestas habladas en sueco dentro de flujos de atención automatizada sin enviar datos fuera del Espacio Económico Europeo.
- **Contenido educativo y formativo**: generación de material didáctico narrado en sueco e inglés, aprovechando el control de pausas mediante saltos de línea para estructurar explicaciones.
- **Sistemas de anuncios y avisos públicos**: síntesis de mensajes pregrabados o dinámicos para transporte, comercio o administración pública en Suecia, con la ventaja de una licencia Apache-2.0 que permite uso comercial.
- **Prototipado de productos de voz**: al ser un reemplazo directo de VoxCPM2, un equipo puede desarrollar con el modelo base y cambiar a Ingmar sin modificar el código de integración, gracias a la misma API de carga y generación.
- **Generación de audio para pruebas de QA**: creación de corpus de voz sintética en sueco para validar sistemas de reconocimiento de voz o pipelines de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluación cualitativa del modelo base frente a Zonos 3 Mini, KugelAudio, Qwen3-TTS y Piper en sueco, con el resultado de que ninguno producía habla natural, pero no se aportan métricas numéricas (MOS, WER ni similares) ni para el modelo base ni para Ingmar.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 2,29B parámetros en safetensors, los pesos ocupan aproximadamente 4,6 GB en FP16/BF16; en FP32 serían unos 9,2 GB. No se documentan cuantizaciones oficiales.
- **GPU recomendadas**: no especificadas por el autor. Por tamaño, una GPU con 8-12 GB de VRAM debería alojar los pesos en precisión reducida; para producción con concurrencia se recomiendan GPU de centro de datos (A100, H100, L40S) sin que haya cifras publicadas de throughput.
- **GPU de consumo**: el modelo (≈2,3B parámetros) es compatible en principio con tarjetas de consumo de 8 GB o más en FP16, aunque no se han publicado pruebas específicas en RTX 4090, RTX 3090 u otras.
- **Opciones de despliegue**: librería `voxcpm` (Python 3.12, torch ≥ 2.5) para inferencia local; API REST alojada de Berget AI (`/v1/audio/speech`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles. Los parámetros `cfg_value` (2.0 en el ejemplo) e `inference_timesteps` (10 en el ejemplo) influyen directamente en la calidad y el coste de cómputo de la generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingmar (bergetai) | ≈2,29B | no disponible (`max_len` 4096) | sv, en | Apache-2.0 | Hugging Face y API Berget AI |
| VoxCPM2 (openbmb) | 2B | no disponible | multilingüe (sin sueco natural según el autor) | Apache-2.0 | Hugging Face |
| Piper | no disponible | no disponible | multilingüe | no disponible | no disponible |
| Qwen3-TTS | no disponible | no disponible | multilingüe | no disponible | no disponible |
| Zonos 3 Mini | no disponible | no disponible | multilingüe | no disponible | no disponible |
| KugelAudio | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar el recuento de parámetros y la licencia con el modelo base; para Piper, Qwen3-TTS, Zonos 3 Mini y KugelAudio no se aportan especificaciones técnicas, únicamente que fueron evaluados en sueco sin producir habla natural según el autor.

## Limitaciones y advertencias

- **Números y cifras**: el autor recomienda escribir los números con letras en el texto de entrada («fyrtiotre» en lugar de «43») para evitar una pronunciación incorrecta.
- **Textos largos**: hay que aumentar `max_len` (por defecto 4096) o sintetizar frase por frase; de lo contrario la generación puede truncarse.
- **Cobertura de idiomas**: solo sueco e inglés están probados en calidad; otros idiomas no están soportados oficialmente.
- **Voz única**: el ajuste se hizo sobre un único hablante; no se documentan capacidades de clonación ni de cambio de voz.
- **Suplantación de identidad**: la licencia y la model card prohíben expresamente usar el modelo para suplantar al narrador original, fraude o desinformación; el contenido generado debe etiquetarse claramente como sintético.
- **Riesgo de alucinación acústica**: no se documenta explícitamente, pero como modelo generativo de audio puede producir artefactos o pronunciaciones erróneas en texto atípico (nombres propios, siglas, extranjerismos).
- **Licencia**: Apache-2.0 permite uso comercial, pero las restricciones de uso ético del modelo base (prohibición de suplantación, fraude y desinformación) se mantienen según la model card de VoxCPM2.
- **Metadatos de procedencia**: solo la API alojada añade metadatos de procedencia IA; las generaciones locales con la librería `voxcpm` no los incluyen por defecto, por lo que el etiquetado corre a cargo del integrador.
- **Datos de entrenamiento privados**: al no publicarse el corpus, no es posible auditar sesgos del hablante ni la distribución fonética cubierta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bergetai/ingmar
- Adaptador LoRA: https://huggingface.co/bergetai/ingmar-lora
- Modelo base VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- API de Berget AI: https://api.berget.ai/v1/audio/speech
- Blog de Berget AI con la evaluación completa: no disponible (enlace no incluido en la información proporcionada)
