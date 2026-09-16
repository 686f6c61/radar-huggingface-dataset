# bluemorpholimited/localpolyglot-edge-models

## Resumen

LocalPolyglot Edge Models es un repositorio de artefactos de inferencia publicado por el usuario bluemorpholimited en HuggingFace bajo la librería sherpa-onnx. No se trata de un modelo único, sino de una colección de tres módulos encadenados —reconocimiento automático de habla (ASR), traducción automática y síntesis de voz (TTS)— que, junto con un detector de actividad de voz (VAD Silero), forman un pipeline completo de interpretación simultánea desde once idiomas hacia cantonés, ejecutado íntegramente sin conexión de red.

El sistema está diseñado para su despliegue en dispositivos móviles ARM64 (arm64-v8a) con Android 13 o superior. El dispositivo de referencia declarado es un iQOO Neo7 Racing Edition con SoC Qualcomm Snapdragon 8+ Gen1 y 16 GB de RAM. La etapa ASR emplea Whisper-large-v3-turbo cuantizado en Q4_K_M; la traducción usa NLLB-200-distilled-600M con un adaptador LoRA afinado para cantonés coloquial (yue_Hant); y la síntesis recurre a CosyVoice en formato ONNX con poda estructural e INT8.

Su relevancia radica en que ofrece una cadena ASR-traducción-TTS completamente offline con una latencia extremo a extremo declarada de 700-1750 ms (objetivo inferior a 2000 ms), pensada para interpretación en tiempo real donde la privacidad, la ausencia de conectividad y el coste de cómputo en el borde son factores críticos. El repositorio ocupa 6,5 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline modular en cascada de 3 etapas: ASR (Whisper-large-v3-turbo, transformer encoder-decoder), traducción (NLLB-200-distilled-600M + LoRA) y TTS (CosyVoice); VAD Silero para segmentación de audio |
| Parametros totales | No disponible como cifra global (el repositorio agrupa varios modelos; NLLB-200-distilled-600M declara 600M en su nombre; el resto no especifica recuento en la información disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | ASR: Q4_K_M (ONNX QDQ, pesos INT8); traducción: Q4 (bitsandbytes NF4) + exportación ONNX; TTS: INT8 con poda estructural del 10 % |
| Idiomas soportados | Traducción: yue (cantonés), en, ja, ko, fr, de, es, it, ru, pt, nl; ASR: más de 90 idiomas |
| Licencia | Apache 2.0 (cada módulo hereda además la licencia de su modelo base) |
| Formato de pesos | ONNX (runtime sherpa-onnx) y safetensors |
| Tamano del repositorio | 6,5 GB |
| Despliegue objetivo | Android 13+, ARM64 (arm64-v8a), Sherpa-ONNX + ONNX Runtime Android |
| Permisos de red | Ninguno (permisos de red eliminados explícitamente en la aplicación Android) |

## Arquitectura y entrenamiento

La solución es un pipeline en cascada, no un modelo extremo a extremo. La señal de audio de entrada pasa por un VAD (Silero) que segmenta la voz, a continuación por el módulo ASR basado en Whisper-large-v3-turbo, después por el traductor NLLB-200-distilled-600M y finalmente por el sintetizador CosyVoice, cuya salida se entrega por auriculares. El flujo declarado es: Micrófono → VAD (Silero) → ASR (Whisper ONNX) → Traducción (NLLB ONNX) → TTS (CosyVoice ONNX) → Salida de auriculares.

En cuanto al ajuste, el módulo de traducción parte de NLLB-200-distilled-600M y se ha afinado mediante LoRA para traducción multilingüe a cantonés coloquial (yue_Hant). Los tres módulos se han cuantizado y, en el caso del TTS, podado estructuralmente (10 %) para reducir el coste computacional en el dispositivo. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se describen innovaciones adicionales como decodificación especulativa o atención lineal. La optimización declarada se centra en la cuantización (Q4_K_M, NF4, INT8) y la exportación a ONNX para ejecución en CPU/GPU móvil.

## Capacidades

- Reconocimiento automático de habla multilingüe mediante Whisper-large-v3-turbo, con cobertura declarada de más de 90 idiomas.
- Traducción automática multilingüe hacia cantonés coloquial (yue_Hant) desde yue, en, ja, ko, fr, de, es, it, ru, pt y nl.
- Síntesis de voz (TTS) en cantonés con CosyVoice, con factor de tiempo real (RTF) declarado de 0,3-0,5x y velocidades ajustables de 0,5x a 2,0x mediante tabla de consulta precalculada.
- Detección de actividad de voz (VAD) con Silero para segmentar el audio antes del reconocimiento.
- Interpretación en tiempo real con latencia extremo a extremo declarada de 700-1750 ms.
- Ejecución completamente offline, sin permisos de red, apta para escenarios de privacidad estricta.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni capacidades de agente en la información disponible.
- No se documentan capacidades de visión ni de audio más allá del propio pipeline de voz.

## Casos de uso

- Interpretación presencial en tiempo real: una persona habla en inglés, japonés o coreano y el sistema traduce y sintetiza la salida en cantonés con una latencia declarada inferior a 2 segundos, adecuado para reuniones cara a cara sin conectividad.
- Viajes y turismo: un viajero con un dispositivo Android puede comunicarse con interlocutores cantonoparlantes sin depender de red móvil ni de servicios en la nube, algo crítico en zonas con cobertura limitada.
- Atención al público en entornos sanitarios o administrativos: el pipeline permite atender a pacientes o usuarios que hablan alguna de las once lenguas cubiertas sin enviar datos de voz a servidores externos, lo que ayuda a cumplir requisitos de privacidad.
- Despliegue en dispositivos de campo o entornos aislados: por su naturaleza 100 % offline y su empaquetado ONNX, es adecuado para operaciones en los que no hay infraestructura de red disponible.
- Accesibilidad: transcripción y traducción en vivo de conversaciones para personas con dificultades auditivas o de comprensión de idiomas, con la salida sintetizada en cantonés.
- Aplicaciones móviles de comunicación multilingüe: integración como SDK/módulo embebido en apps Android que necesiten traducción de voz sin coste de API externa y sin latencia de red.
- Investigación en pipelines de voz en el borde: sirve como referencia reproducible de cuantización y exportación ONNX de Whisper, NLLB y CosyVoice para experimentos de eficiencia en ARM64.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara métricas de latencia y de factor de tiempo real:

| Metrica declarada | Valor |
|---|---|
| Captura de audio | < 100 ms |
| Detección VAD | 32-64 ms |
| Reconocimiento ASR | 300-800 ms |
| Traducción | 200-450 ms |
| Síntesis TTS | 100-300 ms |
| Salida de audio | < 50 ms |
| Latencia extremo a extremo | 700-1750 ms (objetivo < 2000 ms) |
| RTF del TTS | 0,3-0,5x |
| Tamaño ASR | 3486,5 MB |
| Tamaño traducción | 2713,9 MB |
| Tamaño TTS | 0,0 MB (no incluido en el cómputo del repositorio) |
| Tamaño total | 6200,4 MB |

No se proporcionan resultados de MMLU, HumanEval, GSM8K, WER, BLEU ni métricas equivalentes para los módulos ASR o de traducción.

## Requisitos de hardware

- Dispositivo objetivo declarado: iQOO Neo7 Racing Edition, Qualcomm Snapdragon 8+ Gen1, 16 GB de RAM, ARM64 (arm64-v8a), Android 13 o superior.
- Memoria aproximada para cargar el pipeline completo: en torno a 6,2 GB de artefactos (3,5 GB de ASR + 2,7 GB de traducción), más el espacio de trabajo del runtime. Es una estimación derivada del tamaño de los ficheros, no una cifra oficial de VRAM.
- Ejecución en GPU de sobremesa: no se especifican requisitos de VRAM para A100, H100 o RTX 4090 en la información disponible; al estar en formato ONNX, podría ejecutarse vía ONNX Runtime con backend CUDA o similar, pero no se documenta.
- Cabe en GPU de consumo: no confirmado en la información disponible; el diseño apunta a ejecución en el borde (móvil), no a GPU de escritorio.
- Opciones de despliegue: Sherpa-ONNX y ONNX Runtime Android son los runtimes declarados. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia extremo a extremo declarada de 700-1750 ms; RTF del TTS de 0,3-0,5x (más rápido que tiempo real). No se declara throughput en tokens por segundo.

## Comparativa con modelos similares

La información proporcionada no incluye benchmarks que permitan comparar rendimiento numérico. La comparación se limita a características estructurales con alternativas del mismo ámbito (traducción de voz multilingüe en el borde):

| Modelo / solucion | Tipo | Idiomas | Offline | Licencia | Notas |
|---|---|---|---|---|---|
| LocalPolyglot Edge Models | Pipeline en cascada (ASR + MT + TTS) | 11 de origen hacia cantonés; ASR 90+ | Sí | Apache 2.0 | Cuantizado a Q4/INT8, objetivo Android ARM64 |
| Whisper-large-v3-turbo (solo ASR) | ASR extremo a extremo | Multilingüe amplio | Depende del despliegue | MIT (modelo base de OpenAI) | Es el módulo ASR del pipeline; no traduce ni sintetiza |
| NLLB-200-distilled-600M (solo MT) | Traducción texto a texto | 200 idiomas | Depende del despliegue | CC-BY-NC-4.0 (modelo base de Meta) | Es el módulo de traducción; requiere ASR y TTS externos |
| SeamlessM4T / Meta MMS | Traducción y síntesis de voz extremo a extremo | Multilingüe amplio | Depende del despliegue | Según variante (CC-BY-NC para varias) | Alternativa conceptual; no se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo (WER, BLEU, latencia) entre estas opciones en la información disponible.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del pipeline ni de los modelos base en la información proporcionada.
- Riesgo de alucinación inherente a los modelos generativos (Whisper y NLLB) en condiciones de audio ruidoso o de idiomas poco representados.
- La traducción se especializa hacia cantonés coloquial (yue_Hant); no se indica cobertura de otras variantes de chino ni de direcciones inversas.
- La información no detalla la longitud de contexto ni la longitud máxima de segmento de audio, más allá del uso de VAD Silero para trocear la señal.
- Licencia: el repositorio es Apache 2.0, pero la model card advierte explícitamente de que cada módulo hereda además la licencia de su modelo base. NLLB-200-distilled-600M puede estar sujeto a licencias no comerciales, lo que condiciona el uso comercial del conjunto. Conviene verificar la licencia de cada artefacto antes de producción.
- El tamaño de los artefactos (6,2 GB) y la dependencia de 16 GB de RAM en el dispositivo objetivo limitan su despliegue en terminales de gama media o baja.
- El módulo TTS figura con 0,0 MB en la model card, lo que sugiere que el artefacto no está incluido realmente en este repositorio o no computa en el tamaño declarado; puede requerir obtención aparte.
- No se documenta soporte de tool calling ni integración con agentes, por lo que no es apto para flujos de razonamiento multi-paso.
- Advertencia del autor: el almacenamiento del runtime MOLAB es efímero y los artefactos de producción se conservan únicamente en este repositorio de HuggingFace, lo que implica un único punto de persistencia.
- El repositorio registra 0 descargas y 0 likes en la información disponible, por lo que su validación por terceros es inexistente a fecha de los datos.

## Enlaces

- HuggingFace: https://huggingface.co/bluemorpholimited/localpolyglot-edge-models
- Resultados de búsqueda web: la búsqueda no ha devuelto enlaces relevantes al modelo (los resultados obtenidos corresponden a un foro chino de preguntas y respuestas, al portal taiwanés Mobile01 y a un léxico jurídico alemán sobre parques nacionales, sin relación con el modelo). No se han encontrado papers, blogs, repositorios ni demos adicionales.
