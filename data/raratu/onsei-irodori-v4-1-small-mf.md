# raratu/Onsei-Irodori-v4.1-Small-MF

## Resumen

Onsei-Irodori-v4.1-Small-MF es un paquete de artefactos de ejecución para iOS derivado del modelo de síntesis de voz Aratako/Irodori-TTS-v4.1-Small-MF. No se trata de un modelo nuevo: el autor, raratu, ha convertido los pesos originales a formatos ONNX (FP32) y Core ML ML Program (FP16 para las convoluciones del decodificador) para poder ejecutar la síntesis de texto a voz íntegramente en el dispositivo, sin conexión a red. La revisión de origen está fijada en el commit `ccc78f5d480b6e51b69b2d5042a14c4da04fea6e` y el autor declara explícitamente que no ha reentrenado ni modificado los pesos del DiT.

El sistema combina un codificador de texto y de descripciones basado en ModernBERT-ja-310m (310 millones de parámetros), un codificador de hablante, un predictor de duración de la versión v4.1, un DiT con formulación MeanFlow y un decodificador de audio de la familia DAC/DACVAE con adaptaciones para japonés. La muestra se genera con cuatro intervalos lineales de 1 a 0, ruido normal estándar, una evaluación condicional por paso y sin CFG ni Sway adicionales en tiempo de inferencia.

Su relevancia es de tipo práctico más que científica: demuestra un pipeline completo de exportación, verificación numérica y despliegue on-device para TTS en japonés sobre iOS, con criterios de paridad medibles (SNR >= 50 dB y error absoluto máximo <= 0,002 para la calibración FP16) y con una estrategia de reparto de cómputo entre CPU y GPU que se decide por dispositivo. Es, por tanto, un artefacto de runtime para desarrolladores de aplicaciones iOS, no un checkpoint de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con formulacion MeanFlow; codificador de texto/descripcion ModernBERT-ja-310m; codificador de hablante, codificador de referencia y predictor de duracion; decodificador de audio tipo DAC/DACVAE con adaptaciones japonesas |
| Parametros totales | no disponible (el nombre indica "Small"; el unico dato numerico es el codificador de texto, ModernBERT-ja-310m, con 310 millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no hay DiT cuantizado; se distribuyen FP32 (ONNX) y FP16 (Core ML ML Program, solo pesos y aritmetica de convolucion; Snake, no linealidades y residuales permanecen en FP32) |
| Idiomas soportados | japones (ja) |
| Licencia | other (los componentes declaran MIT y Apache-2.0; la conversion no relicencia; consultar LICENSES/ y THIRD_PARTY_NOTICES.md) |
| Formato de pesos | ONNX FP32 (encoder de texto/descripcion, proyeccion KV de contexto, DiT MeanFlow, duracion, encoder de referencia, encoder de hablante y decodificador DAC de respaldo en CPU) y Core ML ML Program FP16 en `native_decoder_fp16/` |

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento del modelo original: no se indica numero de tokens, composicion del dataset, ni si hubo RLHF, DPO o etapas de ajuste por preferencias. Lo que si se detalla es la arquitectura de inferencia. El nucleo generativo es un DiT entrenado con formulacion MeanFlow que recibe como entradas tanto `t` como `delta_t`. El muestreo emplea cuatro intervalos lineales de 1 a 0 con ruido normal estandar y una unica evaluacion condicional por paso, sin CFG ni Sway adicionales en tiempo de inferencia. La codificacion de texto y de descripciones comparte el grafo ModernBERT original, mientras que la codificacion de hablante y el predictor de duracion de la version v4.1 se conservan sin cambios.

El trabajo de este repositorio es de conversion y verificacion, no de modelado. El exportador genera grafos ONNX en FP32 y un decodificador Core ML en FP16, verificados contra el decodificador FP32 antes de su publicacion. La aplicacion iOS solo selecciona el modo `.cpuAndGPU` para el decodificador nativo tras comprobar la paridad de forma de onda y calibrar tiempos en ese dispositivo concreto; si las formas no estan soportadas, falla la paridad o la velocidad es insuficiente, se recurre a decodificacion en CPU. Los intentos experimentales de exportar el DiT a Core ML no superaron la paridad numerica en GPU y quedaron excluidos, y el autor no reclama ninguna aceleracion por ANE. Para textos largos, la segmentacion se hace sin descartar caracteres y los fragmentos posteriores reutilizan el latente de hablante del primer fragmento cuando no se aporta una voz de referencia. Un detalle relevante para reproducibilidad: los generadores de numeros aleatorios de Swift y de PyTorch difieren, de modo que semillas enteras identicas no producen audio identico; cualquier comparacion numerica debe compartir el mismo tensor de ruido inicial.

## Capacidades

- Sintesis de voz (text-to-speech) en japones a partir de texto.
- Acondicionamiento por descripciones (caption) ademas del texto a sintetizar, segun el codificador compartido con ModernBERT.
- Codificacion de hablante y clonacion de voz a partir de una referencia, mediante el codificador de referencia y el codificador de hablante.
- Prediccion de duracion explicita conservada de la version v4.1 del modelo original.
- Generacion de audio de forma no autoregresiva por muestreo en cuatro pasos con MeanFlow.
- Procesamiento de textos largos mediante troceado que no descarta caracteres, con reutilizacion del latente de hablante del primer fragmento en ausencia de referencia.
- Ejecucion completamente local: grafos ONNX en FP32 y decodificador Core ML en FP16, con respaldo de decodificacion en CPU.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada. Es un modelo de sintesis, no un modelo conversacional.

## Casos de uso

- Lectura por voz en aplicaciones iOS sin conexion: el modelo puede convertir articulos, notas o correo en voz japonesa en el propio dispositivo, lo que evita enviar texto potencialmente sensible a servidores externos.
- Accesibilidad para personas con discapacidad visual en entornos japoneses: al ejecutarse sobre Core ML y admitir decodificacion en CPU, puede integrarse en lectores de pantalla que necesitan funcionar sin red y con consumo controlado.
- Narracion de contenido largo (audiolibros, prensa, documentacion): el troceado sin perdida de caracteres y la reutilizacion del latente de hablante del primer fragmento permiten mantener una voz coherente a lo largo de capitulos extensos.
- Doblaje personal o localizacion de contenido propio: con el codificador de referencia se puede condicionar la voz de salida a una muestra de audio, siempre con consentimiento explicito de la persona cuya voz se clona.
- Voces sinteticas para videojuegos y aplicaciones interactivas en japones: la generacion en cuatro pasos y la ausencia de CFG en inferencia reducen el coste por frase, lo que encaja con dialogos cortos y repetitivos generados en tiempo de ejecucion.
- Avisos hablados en dispositivos de asistencia o automocion: la sintesis local con respaldo en CPU permite emitir alertas aunque el dispositivo no disponga de GPU utilizable o la paridad FP16 no se cumpla.
- Herramientas de aprendizaje de japones: los estudiantes pueden escuchar pronunciaciones sinteticas de texto propio sin depender de servicios en la nube.
- Integracion en pipelines de desarrollo iOS: los scripts de exportacion, verificacion y publicacion incluidos en `ios/tools/export/` permiten reproducir el artefacto en CI y validar la paridad numerica antes de publicar una nueva version.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo esta disenado para ejecucion on-device en iOS. No se proporcionan cifras de VRAM, latencia ni throughput.
- El repositorio ocupa 3,6 GB, lo que da una referencia del volumen de artefactos descargables, no del consumo en memoria.
- En iOS, el decodificador nativo FP16 puede usar `.cpuAndGPU` solo si se cumplen los criterios de paridad de forma de onda y calibracion temporal en ese dispositivo; los requisitos son SNR >= 50 dB y error absoluto maximo <= 0,002.
- Si las formas no estan soportadas, falla la paridad o la velocidad es insuficiente, la aplicacion cae a decodificacion en CPU.
- No se reclama aceleracion por ANE (Neural Engine) ni se distribuye un DiT cuantizado; los exports experimentales del DiT a Core ML se descartaron por fallos de paridad numerica en GPU.
- Opciones de despliegue documentadas: Core ML ML Program (decodificador nativo FP16) y ONNX en FP32 con decodificador DAC de respaldo en CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- GPU recomendadas, encaje en GPU de consumo, VRAM estimada, latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| raratu/Onsei-Irodori-v4.1-Small-MF | no disponible (encoder de texto de 310 M) | no disponible | ja | other (componentes MIT y Apache-2.0) | ONNX FP32, Core ML FP16 | HuggingFace, 0 descargas y 0 likes en la fecha de los datos |
| Aratako/Irodori-TTS-v4.1-Small-MF (modelo base) | no disponible | no disponible | ja | segun el modelo original | no disponible | HuggingFace |
| Alternativas de TTS japones on-device | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado, ni de informacion sobre otros modelos de la misma categoria en la documentacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo soporta japones (ja); no hay evidencia de capacidades multilingues.
- La licencia declarada es "other". Aunque el modelo Irodori-TTS y ModernBERT-ja-310m declaran MIT y las adaptaciones japonesas de Semantic-DACVAE tambien, el DACVAE subyacente de Meta declara Apache-2.0 y el DAC de Descript declara MIT. La conversion no relicencia estos componentes, por lo que el uso comercial exige revisar `LICENSES/` y `THIRD_PARTY_NOTICES.md` antes de desplegar.
- Uso de clonacion de voz: la model card original exige consentimiento explicito para clonar la voz de una persona y prohibe la suplantacion enganosa y los deepfakes. La responsabilidad legal recae en el usuario.
- La conversion omite el marcado de agua (watermarking) tal como hace la implementacion japonesa de DACVAE, y no garantiza que la salida lleve marca. Esto complica la trazabilidad de audio sintetico.
- Aunque no se aporte ninguna voz de referencia, las voces sinteticas pueden parecerse por casualidad a personas reales, segun advierte la model card original.
- Riesgo de alucinacion: no aplica en el sentido de generacion de hechos, pero si existe riesgo de artefactos acusticos, prosodia incorrecta o pronunciacion erronea en textos con kanji ambiguo, nombres propios o terminos tecnicos. No hay datos publicados que cuantifiquen este extremo.
- Reproducibilidad: los generadores aleatorios de Swift y PyTorch difieren; usar la misma semilla entera no garantiza audio identico. Las comparaciones numericas requieren compartir el tensor de ruido inicial.
- La seleccion de GPU para el decodificador depende del dispositivo concreto y puede degradarse a CPU, con la consiguiente perdida de velocidad.
- No hay DiT cuantizado ni aceleracion por Neural Engine: el ahorro de recursos en dispositivos antiguos no esta garantizado.
- Modelo sin traccion publica en el momento de los datos (0 descargas, 0 likes) y con fecha de creacion muy reciente, por lo que no existe validacion independiente de su calidad en produccion.
- No se documentan sesgos demograficos ni acusticos concretos; al ser un modelo solo para japones, la representacion de variedades dialectales o de hablantes no japoneses no esta descrita.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/raratu/Onsei-Irodori-v4.1-Small-MF
- Modelo base en HuggingFace: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small-MF
- Repositorio de implementacion original: https://github.com/Aratako/Irodori-TTS
- Commit de referencia de MeanFlow citado en la model card: `89f9d8fbd4d51ea019867ee1197725ede1df13c5`
- Revision del modelo de origen fijada por el autor: `ccc78f5d480b6e51b69b2d5042a14c4da04fea6e`
- Scripts de exportacion, verificacion y publicacion: `ios/tools/export/` del proyecto Onsei (no se proporciona URL directa)
- No se han encontrado otros enlaces relevantes en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
