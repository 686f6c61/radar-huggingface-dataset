# BambaBa/whisper-openvino

## Resumen

`BambaBa/whisper-openvino` es un repositorio de artefactos precompilados para ejecutar el encoder de Whisper large-v3-turbo de OpenAI sobre la GPU integrada de procesadores Intel, mediante el runtime OpenVINO. No se trata de un modelo entrenado desde cero ni de un fine-tuning, sino de una conversión del encoder de Whisper a formato OpenVINO IR en FP16, empaquetada junto con un binario de whisper.cpp v1.8.4 compilado con soporte OpenVINO. El autor es BambaBa y el repositorio se publica bajo licencia MIT.

El objetivo es acelerar la inferencia de dictado por voz en PCs Windows con gráficos Intel. Según la model card, en un Core Ultra 7 155H se pasa de unos 31 segundos a unos 12 segundos por dictado, es decir, aproximadamente 2,5 veces más rápido que ejecutando solo en CPU, manteniendo el mismo texto transcrito. Los artefactos están pensados para ser consumidos por la aplicación Pip Dictée, que verifica el SHA-256 de cada fichero antes de usarlo.

La relevancia es práctica: permite desplegar Whisper large-v3-turbo en hardware consumer Intel sin GPU dedicada, usando la iGPU vía OpenVINO. El repositorio ocupa 1,3 GB e incluye el runtime de OpenVINO 2025.4.1 (plugins de CPU y GPU) y el runtime de Visual C++. No hay información sobre parámetros, contexto ni idiomas en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3-turbo (encoder-decoder transformer) convertido a OpenVINO IR; el encoder se distribuye en FP16 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 para el encoder OpenVINO IR; el resto de pesos no se detalla |
| Idiomas soportados | no disponible |
| Licencia | MIT (Whisper y whisper.cpp); OpenVINO es Apache 2.0 |
| Formato de pesos | OpenVINO IR (`.xml` / `.bin`) para el encoder; binario whisper.cpp v1.8.4 con OpenVINO 2025.4.1 en un `.zip` |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: parte de Whisper large-v3-turbo de OpenAI, un modelo de reconocimiento automático del habla con arquitectura encoder-decoder transformer. Lo que se distribuye es el encoder convertido a OpenVINO IR en precisión FP16, junto con un binario de whisper.cpp v1.8.4 compilado con la opción `WHISPER_OPENVINO=ON`, que enlaza el runtime de OpenVINO 2025.4.1 con plugins para CPU y GPU.

La innovación técnica no está en el modelo sino en el pipeline de despliegue: se compila whisper.cpp contra OpenVINO para que el encoder se ejecute en la GPU integrada Intel, mientras el resto del pipeline sigue en CPU. El binario se genera con `scripts/build-openvino-windows.ps1` del repositorio Pip Dictée y se empaqueta con el runtime de Visual C++. No se detallan datos de entrenamiento, composición del dataset ni procesos de RLHF/DPO, porque no se ha reentrenado el modelo.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) mediante Whisper large-v3-turbo.
- Ejecución del encoder en GPU integrada Intel vía OpenVINO, con aceleración aproximada de 2,5× frente a CPU sola según la model card.
- Integración con whisper.cpp v1.8.4, lo que hereda las capacidades de dicha implementación (procesamiento de audio, segmentación, etc.).
- Uso previsto en dictado por voz en Windows con gráficos Intel (aplicación Pip Dictée).
- Verificación de integridad de los ficheros mediante SHA-256 antes de su uso.
- No se documentan capacidades de tool calling, agentes, visión, audio más allá de ASR, thinking mode ni multilingüismo explícito en la información disponible.

## Casos de uso

- Dictado por voz en Windows con iGPU Intel: la aplicación Pip Dictée descarga estos ficheros y ejecuta Whisper large-v3-turbo sobre la GPU integrada, reduciendo el tiempo por dictado de unos 31 s a unos 12 s en un Core Ultra 7 155H.
- Transcripción local sin GPU dedicada: equipos con gráficos Intel pueden ejecutar el encoder en la iGPU y el resto en CPU, evitando depender de CUDA o de servicios en la nube.
- Integración en aplicaciones de escritorio basadas en whisper.cpp: cualquier proyecto que use whisper.cpp v1.8.4 puede sustituir el binario por este build con OpenVINO para aprovechar la aceleración en hardware Intel.
- Procesamiento por lotes de audio en estaciones de trabajo Intel: al reducir el tiempo por dictado, se mejora el throughput en tareas de transcripción repetitiva ejecutadas localmente.
- Prototipado de ASR en entornos Windows con requisitos de privacidad: al ejecutarse en local, el audio no sale del equipo, lo que encaja en escenarios con datos sensibles.
- Validación de pipelines de despliegue con OpenVINO: sirve como referencia para convertir encoders de Whisper a IR y compilar whisper.cpp con `WHISPER_OPENVINO=ON` en Windows.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER, etc.) en la información disponible. El único dato de rendimiento aportado por la model card es comparativo y específico de hardware:

| Escenario | Hardware | Tiempo por dictado |
|---|---|---|
| Whisper large-v3-turbo solo en CPU | Core Ultra 7 155H | ~31 s |
| Whisper large-v3-turbo con encoder en OpenVINO (iGPU) | Core Ultra 7 155H | ~12 s |

La model card indica que el texto resultante es el mismo en ambos casos.

## Requisitos de hardware

- Hardware objetivo: PCs Windows con gráficos Intel; el caso medido es un Core Ultra 7 155H.
- GPU: se usa la GPU integrada Intel mediante el plugin GPU de OpenVINO 2025.4.1; no se especifican modelos de GPU dedicadas.
- VRAM: no disponible; el encoder se distribuye en FP16 y el repositorio completo ocupa 1,3 GB.
- Cabe en hardware consumer Intel con iGPU; no se documenta compatibilidad con GPU NVIDIA o AMD.
- Despliegue: binario de whisper.cpp v1.8.4 compilado con `WHISPER_OPENVINO=ON`, runtime OpenVINO 2025.4.1 (plugins CPU y GPU) y runtime de Visual C++, todo dentro de `whisper-openvino-x64.zip`.
- Latencia: ~12 s por dictado en Core Ultra 7 155H según la model card; no se aportan datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Tipo | Aceleración | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BambaBa/whisper-openvino | Encoder Whisper large-v3-turbo en OpenVINO IR + binario whisper.cpp | ~2,5× vs CPU sola (medido en Core Ultra 7 155H) | iGPU Intel | MIT (Whisper/whisper.cpp), Apache 2.0 (OpenVINO) | Hugging Face, 0 descargas |
| Whisper large-v3-turbo (OpenAI) | Modelo ASR original | no aplica | CPU/GPU según implementación | MIT | Repositorio oficial de OpenAI |
| whisper.cpp (ggerganov) | Implementación C/C++ de Whisper | Depende del backend | CPU, Metal, CUDA, etc. | MIT | GitHub |

No se dispone de datos de benchmarks comparativos ni de otras conversiones OpenVINO de Whisper en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo ni un fine-tuning: es un empaquetado de artefactos de despliegue; las limitaciones de calidad de transcripción son las de Whisper large-v3-turbo.
- Solo se documenta el encoder en OpenVINO IR; el resto del pipeline depende de whisper.cpp y del runtime incluido.
- Orientado a Windows x64 con gráficos Intel; no se documenta soporte para Linux, macOS ni GPU NVIDIA/AMD.
- El rendimiento medido (~12 s vs ~31 s) corresponde a un único hardware (Core Ultra 7 155H) y a un caso de dictado; no debe generalizarse.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin pipeline declarado ni datos de idiomas.
- Riesgo de alucinación inherente a los modelos ASR de la familia Whisper, aunque no se detalla en la información disponible.
- Licencia MIT para Whisper y whisper.cpp, Apache 2.0 para OpenVINO; los textos de licencia están dentro del zip. No se indican restricciones adicionales para uso comercial.
- La aplicación consumidora (Pip Dictée) verifica SHA-256 de cada fichero; conviene mantener esa comprobación en cualquier integración propia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/BambaBa/whisper-openvino
- Repositorio de Pip Dictée: https://github.com/BabaScience/PipDictee
- Whisper (OpenAI): no disponible en la información proporcionada
- whisper.cpp: no disponible en la información proporcionada
- OpenVINO: no disponible en la información proporcionada
