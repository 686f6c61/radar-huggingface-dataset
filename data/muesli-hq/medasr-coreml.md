# Muesli-HQ/medasr-coreml

## Resumen

MedASR Core ML es la conversión de Muesli-HQ del modelo Google MedASR, un sistema de reconocimiento automático del habla (ASR) especializado en dictado médico en inglés. El modelo original es un Conformer-CTC de aproximadamente 105 millones de parámetros, y esta variante lo empaqueta en formato Core ML para ejecutarse sobre Apple Silicon, usando la Apple Neural Engine (ANE) como unidad de cómputo principal. El paquete del modelo ocupa unos 211 MB y el repositorio completo 0,2 GB.

El problema que resuelve es la transcripción de dictado clínico en dispositivos Apple con latencia baja y sin depender de servicios en la nube. Según la información del autor, la predicción en caliente ronda los 21-22 ms por ventana de 20 segundos en un Apple M5, excluyendo la preparación inicial y el preprocesado de audio en CPU. Esto lo hace atractivo para aplicaciones de dictado médico en macOS e iOS que necesiten privacidad local.

La relevancia actual del artefacto es doble: por un lado, demuestra una ruta de conversión de un modelo médico a Core ML con reparameterizaciones específicas para la ANE; por otro, arrastra restricciones de licencia notables (HAI-DEF, con la sección 3.2 y la política de usos prohibidos como términos vinculantes). No es un checkpoint de Transformers ni un modelo registrado de FluidAudio, y requiere un frontend y un decodificador CTC específicos del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer-CTC (17 bloques Conformer, hidden 512, 8 cabezas de atención, RoPE, CTC de 512) |
| Parámetros totales | ~105 M (según la model card) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de audio de 20 s con padding; entrada `[1, 1998, 128]`, logits `[1, 497, 512]` |
| Tipos de cuantización | Pesos internos FP16; features y logits en FP32; fallback FP32 no validado según el autor |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `health-ai-developer-foundations` (HAI-DEF Terms of Use; sección 3.2 y Prohibited Use Policy vinculantes) |
| Formato de pesos | Core ML (`MedASR.mlpackage`); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un Conformer-CTC con 17 bloques, dimensión oculta 512, ocho cabezas de atención y embeddings rotatorios (RoPE), con una cabeza CTC de 512 clases y blank ID 0. El modelo no emplea un joint TDT/RNN-T ni un modelo de lenguaje externo: la decodificación greedy es suficiente. La entrada es audio mono a 16 kHz con ventana rellenada de 20 segundos; las longitudes válidas se derivan de dos convoluciones sin padding de kernel 5 y stride 2. El frontend usa ventana Hann simétrica de 400 muestras, FFT de 512, hop de 160, sin centrado ni preénfasis, logaritmo natural con clamp en `1e-5`, y un banco de filtros mel HTK/Kaldi de 125–7500 Hz propio del modelo (no los valores por defecto de NeMo/Parakeet).

No se dispone de información sobre el dataset de entrenamiento original de Google MedASR ni sobre si hubo RLHF o DPO; la model card de esta conversión no lo detalla. La innovación técnica destacable está en la conversión: el FP16 ingenuo produce desbordamientos en este checkpoint, por lo que se aplica una reparameterización exacta en potencias de dos del subsampler y del primer bloque; las convoluciones agrupadas de kernel 32 se descomponen en cuatro sumas de kernel 8 para que la ANE las soporte, y las reescrituras del grafo en FP32 se verifican contra el modelo PyTorch oficial sin modificar antes de exportar. El plan de cómputo en Apple M5 incluye 1270 operaciones en ANE y cinco operaciones pequeñas de máscara/tipo en CPU; el preprocesado de audio y la decodificación CTC siguen ejecutándose en CPU. El autor advierte explícitamente que no es una conversión sin pérdidas.

## Capacidades

- Reconocimiento automático del habla en inglés para dictado médico, con especial orientación a radiología según las etiquetas del repositorio.
- Salida CTC con tokens de formato crudos, como `{period}` o `{colon}`, que la aplicación consumidora debe renderizar.
- Decodificación greedy sin modelo de lenguaje externo ni joint TDT/RNN-T.
- Ejecución en Apple Silicon con destino a la Apple Neural Engine (`computeUnits: .cpuAndNeuralEngine`).
- Procesamiento por ventanas de 20 segundos; el chunking con solapamiento y costura de archivos completos queda como trabajo pendiente en la capa de aplicación.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio bidireccional ni modo thinking.
- Capacidad multilingüe: no; solo inglés.

## Casos de uso

- Dictado de informes radiológicos en macOS: el modelo transcribe ventanas de 20 segundos con baja latencia (21-22 ms por ventana en M5) y permite que el texto se genere localmente, sin enviar audio clínico a la nube.
- Aplicaciones de historia clínica con entrada por voz: al ejecutarse en la ANE, el consumo de CPU queda libre para la interfaz y la lógica de negocio, y el paquete de 211 MB es manejable para distribución en una app de escritorio.
- Transcripción por lotes de grabaciones cortas: el probe Swift incluido procesa la primera ventana del modelo y sirve como base para pipelines que dividan el audio en segmentos de 20 segundos.
- Prototipado de asistentes de dictado con privacidad por diseño: al no requerir cuenta ni token de Hugging Face para la descarga, y con pesos que se ejecutan en el dispositivo, encaja en flujos donde el audio no debe salir del equipo.
- Evaluación de viabilidad de ASR médico en Apple Silicon: el artefacto permite medir latencia y fidelidad numérica en M5/macOS 26 antes de comprometerse con una integración de producto.
- Integración en herramientas CLI de transcripción médica: el autor menciona que la app o CLI debe pedir la aceptación de los términos HAI-DEF antes de descargar o preparar el modelo, lo que encaja en un flujo de incorporación con consentimiento explícito.
- Investigación sobre conversión de modelos de voz a Core ML: el conversor reproducible, las dependencias bloqueadas, los tests y el probe Swift bajo `conversion/` sirven como referencia para portar otros Conformer a la ANE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de conversión y latencia: predicción en caliente de aproximadamente 21-22 ms por ventana rellenada de 20 segundos en Apple M5, y una investigación previa con 24 grabaciones, 261,905 segundos y 26 ventanas, donde todos los umbrales numéricos pasaron y los tokens colapsados en ANE coincidieron en 24 de 26 ventanas (incluidas todas las médicas); dos ventanas de habla general difieren. El autor conserva en el informe histórico la puerta de transcripción exacta fallida.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en Apple Silicon con Core ML. El paquete pesa aproximadamente 211 MB (pesos FP16).
- GPU recomendadas: no se especifican GPU discretas; el destino es la Apple Neural Engine de los chips de la serie M.
- Compatibilidad con hardware consumer: sí, en equipos Apple Silicon; la validación real se limita a un entorno M5/macOS 26. No hay cobertura validada para M1-M4 ni para iPhone.
- Despliegue: Core ML con `computeUnits: .cpuAndNeuralEngine`; el ejemplo Swift reutiliza el `AudioConverter`, el `AudioMelSpectrogram` configurable y el decodificador CTC de FluidAudio (fijado al commit `e15287985625dbf544a343df679436789ffb03fb`, base 0.18.0; la 0.17.3 carece de la inyección de tabla mel personalizada).
- Latencia y throughput: aproximadamente 21-22 ms por ventana de 20 segundos en caliente en M5, excluyendo la primera preparación y el preprocesado de audio en CPU. No se documenta throughput agregado para archivos completos.
- Target de despliegue: iOS 17 / macOS 14, aunque el autor advierte que un target bajo no es evidencia de pruebas en dispositivos u OS más antiguos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Muesli-HQ/medasr-coreml | ~105 M | 20 s de audio | Inglés | HAI-DEF | Core ML |
| google/medasr | ~105 M (modelo base) | no disponible | Inglés | no disponible en la información | no disponible |
| NeMo/Parakeet (referenciado en la model card) | no disponible | no disponible | no disponible | no disponible | no disponible |
| FluidAudio (referenciado como runtime) | no aplica (runtime) | no disponible | no disponible | no disponible | Swift |

La información disponible no permite comparar rendimiento (WER, MMLU u otras métricas) con alternativas. La comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- No es una conversión sin pérdidas: el autor documenta que dos ventanas de habla general difieren en tokens colapsados respecto a la referencia, y que la puerta de transcripción exacta falló en la investigación histórica.
- La validación clínica independiente no existe; la paridad numérica de la conversión no equivale a validación de calidad clínica.
- Cobertura limitada: solo se ha validado en M5/macOS 26; no hay pruebas en M1-M4, iPhone ni versiones antiguas del sistema operativo.
- El FP16 en CPU fue menos fiel que ANE/GPU en la comparación amplia; el fallback FP32 debe validarse por separado y no se debe asumir comportamiento idéntico entre unidades de cómputo.
- Solo inglés; no hay soporte multilingüe.
- La salida cruda incluye tokens de formato (`{period}`, `{colon}`) que la aplicación debe renderizar; no es texto listo para mostrar.
- Requiere frontend y decodificador CTC específicos del modelo; no es un checkpoint de Transformers ni un modelo registrado de FluidAudio.
- Licencia restrictiva: HAI-DEF con la sección 3.2 y la Prohibited Use Policy como términos vinculantes de acceso, uso y redistribución; los distribuidores deben transmitir el acuerdo y las restricciones. El código de conversión es Apache-2.0, pero eso no relicencia los pesos.
- El chunking con solapamiento, la costura de archivos completos, la propiedad y cancelación de tareas y la integración en app/CLI quedan como trabajo pendiente del lado del consumidor.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; al ser un modelo ASR, los errores se manifiestan como transcripciones incorrectas, no como texto inventado en el sentido de un LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muesli-HQ/medasr-coreml
- Modelo base: https://huggingface.co/google/medasr
- Licencia HAI-DEF: [LICENSE](https://huggingface.co/Muesli-HQ/medasr-coreml/blob/main/LICENSE)
- Política de usos prohibidos: [PROHIBITED_USE_POLICY.txt](https://huggingface.co/Muesli-HQ/medasr-coreml/blob/main/PROHIBITED_USE_POLICY.txt)
- Aviso requerido: [Notice](https://huggingface.co/Muesli-HQ/medasr-coreml/blob/main/Notice)
- Modificaciones: [MODIFICATIONS.md](https://huggingface.co/Muesli-HQ/medasr-coreml/blob/main/MODIFICATIONS.md)
- Conversión y probe Swift: [conversion/README.md](https://huggingface.co/Muesli-HQ/medasr-coreml/blob/main/conversion/README.md) y [conversion/swift-probe](https://huggingface.co/Muesli-HQ/medasr-coreml/tree/main/conversion/swift-probe)
- Resumen de reconstrucción: [validation/rebuild-summary.json](https://huggingface.co/Muesli-HQ/medasr-coreml/blob/main/validation/rebuild-summary.json)
- Informe histórico de validación: [conversion/validation-summary.json](https://huggingface.co/Muesli-HQ/medasr-coreml/blob/main/conversion/validation-summary.json)
- Procedencia del código fuente: [validation/source-provenance.json](https://huggingface.co/Muesli-HQ/medasr-coreml/blob/main/validation/source-provenance.json)
- Manifiesto de hashes: [manifest.json](https://huggingface.co/Muesli-HQ/medasr-coreml/blob/main/manifest.json)
