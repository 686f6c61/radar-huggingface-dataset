# kaptionai/parakeet-tdt-0.6b-v3-ultra-onnx-q4

## Resumen

Parakeet TDT 0.6B v3 Ultra es un modelo de reconocimiento automático del habla (ASR) de tipo Token-and-Duration Transducer (TDT), derivado de NVIDIA Parakeet TDT 0.6B v3 y sometido a un post-entrenamiento por parte de Moondream (publicado como `moondream/parakeet-ultra`). Este repositorio concreto, alojado por kaptionai, no es un modelo nuevo: es una copia byte a byte de los cuatro ficheros del directorio `U-q4f16/` del repositorio de sandovs, que contiene la exportación a ONNX y la cuantización a 4 bits del modelo original. Kaption lo aloja para que sus aplicaciones descarguen los pesos desde una dirección que controla.

El interés de esta variante es la combinación de tamaño reducido (unos 0,7 GB en el repositorio) con ejecución en navegador: el codificador se ejecuta sobre WebGPU mediante ONNX Runtime Web con acumulación FP32 en las multiplicaciones matriciales, mientras que el preprocesador y el decodificador TDT corren sobre WebAssembly. Esto permite desplegar transcripción multilingüe en cliente sin depender de servidores de inferencia.

El modelo cubre 25 idiomas europeos, entre ellos el español, y se distribuye bajo licencia CC-BY-4.0, lo que facilita su uso comercial con atribución. Es relevante para desarrolladores que necesitan ASR ligero, multilingüe y ejecutable en el navegador o en hardware modesto, aunque conviene tener en cuenta que no se publican en esta ficha datos de precisión ni de rendimiento propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Token-and-Duration Transducer (TDT); exportada a ONNX (codificador + decodificador conjunto) |
| Parametros totales | 0,6 B (según denominación del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits con MatMulNBits; ficheros etiquetados `q4f16` (pesos en FP16 en el codificador y decodificador) |
| Idiomas soportados | 25: búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, eslovaco, esloveno, español, sueco, ruso y ucraniano |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`nemo128-f32.onnx`, `encoder-model.fp16.onnx`, `decoder_joint-model.fp16.onnx`, `vocab.txt`) |

## Arquitectura y entrenamiento

El modelo base es un transducer TDT de NVIDIA, una variante de RNN-Transducer en la que el predictor emite simultáneamente un token y una duración, lo que permite decodificar varios tokens por paso y reduce la latencia frente a un CTC o un transducer clásico. Sobre esa base, Moondream aplicó un post-entrenamiento que da lugar a `moondream/parakeet-ultra`; no se detalla en la información disponible la composición del dataset, el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO.

La contribución de este repositorio es puramente de empaquetado e inferencia: sandovs exportó el modelo a ONNX y lo cuantizó a 4 bits con MatMulNBits, y kaptionai distribuye una copia idéntica de esos ficheros (verificable por los SHA-256 publicados en la model card). La innovación práctica está en el reparto de cómputo: el codificador, que concentra el coste (unos 626 MB), se ejecuta en WebGPU con `enableMatmulFp32Accumulation: true` para mitigar la pérdida de precisión de la cuantización, mientras que el decodificador conjunto (unos 49 MB) y el preprocesador de audio (unos 138 KB) se ejecutan en WebAssembly. No se documentan en esta ficha detalles sobre decodificación especulativa ni sobre atención lineal.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en 25 idiomas europeos, incluido el español.
- Decodificación TDT con emisión conjunta de token y duración, orientada a baja latencia.
- Ejecución en navegador: codificador en WebGPU y decodificador en WebAssembly mediante ONNX Runtime Web.
- Funcionamiento totalmente en cliente, sin necesidad de enviar el audio a un servidor.
- Cuantización a 4 bits que reduce el peso a unos 0,7 GB, apto para descarga en aplicaciones web.
- Soporte de tool calling / function calling: no disponible (es un modelo ASR, no un modelo de lenguaje generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión, audio generativo o modo "thinking": no disponibles; la entrada es audio y la salida es texto transcrito.

## Casos de uso

- Transcripción en el navegador para aplicaciones de notas de voz: el modelo se descarga una vez (unos 0,7 GB) y transcribe en local con WebGPU, evitando enviar grabaciones a servidores y reduciendo costes de infraestructura.
- Subtitulado de vídeo en cliente: integrado en un editor web, permite generar subtítulos en español o en cualquiera de los 25 idiomas soportados sin subir el vídeo a la nube.
- Dictado multilingüe en herramientas de productividad: útil en entornos corporativos donde el usuario alterna entre idiomas (por ejemplo, español e inglés) y se requiere que el audio no salga del dispositivo.
- Atención al cliente con transcripción de llamadas: el modelo puede transcribir conversaciones grabadas para su análisis posterior, con la ventaja de que la cuantización a 4 bits permite desplegarlo en servidores modestos o en el propio cliente.
- Accesibilidad: generación de transcripciones en tiempo real para personas con discapacidad auditiva en aplicaciones web, aprovechando la ejecución local y la baja latencia del decodificador TDT.
- Procesamiento por lotes de audio en entornos con recursos limitados: al ocupar menos de 1 GB, se puede ejecutar en instancias pequeñas o en dispositivos de borde para transcribir archivos de audio sin GPU de gama alta.
- Investigación en ASR multilingüe: sirve como referencia reproducible para comparar el impacto de la cuantización a 4 bits frente al modelo original en FP32/FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio remite a la del repositorio de origen (`sandovs/parakeet-tdt-0.6b-v3-ultra-onnx-q4`) para consultar las tablas de precisión, pero no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,7 GB y el codificador cuantizado pesa unos 626 MB, por lo que el consumo de memoria debería situarse en el entorno de 1 GB o algo superior, aunque no se confirma.
- GPU recomendadas: no se especifican; el diseño apunta a WebGPU en navegador, por lo que cualquier GPU con soporte WebGPU (integradas modernas o dedicadas) podría ejecutarlo.
- ¿Cabe en GPU de consumo? Sí, por tamaño (menos de 1 GB de pesos), aunque no se documentan requisitos mínimos concretos.
- Opciones de despliegue: ONNX Runtime Web (WebGPU + WebAssembly) es el objetivo principal; también es viable ONNX Runtime nativo en servidor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| kaptionai/parakeet-tdt-0.6b-v3-ultra-onnx-q4 | 0,6 B | No disponible | 25 | CC-BY-4.0 | ONNX 4 bits |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | No disponible | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha |
| moondream/parakeet-ultra | 0,6 B | No disponible | No disponible en esta ficha | CC-BY-4.0 (según atribución) | No disponible en esta ficha |

No se dispone de datos de rendimiento comparado (WER, latencia) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Este repositorio es una copia sin modificaciones de los ficheros de sandovs; no incorpora mejoras ni correcciones propias de kaptionai.
- No se publican en esta ficha métricas de precisión (WER) ni de latencia; la cuantización a 4 bits puede degradar la precisión respecto al modelo en FP32/FP16, y no se confirma el grado de degradación.
- Es un modelo ASR, no un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento multi-paso.
- La longitud de contexto (duración máxima de audio procesable por segmento) no está documentada en la información disponible.
- Los idiomas cubiertos son 25 lenguas europeas; no se garantiza cobertura de otras lenguas ni de variantes dialectales.
- La licencia CC-BY-4.0 exige atribución a NVIDIA, Moondream y sandovs; el uso comercial es posible siempre que se cumpla esa condición.
- Kaption declara explícitamente que no cuenta con el respaldo de NVIDIA, Moondream ni sandovs.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; en ASR, los sesgos suelen manifestarse como peor precisión en acentos o variedades dialectales no representadas en el entrenamiento.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/kaptionai/parakeet-tdt-0.6b-v3-ultra-onnx-q4
- Repositorio de origen (exportación ONNX y cuantización): https://huggingface.co/sandovs/parakeet-tdt-0.6b-v3-ultra-onnx-q4
- Modelo base de Moondream: https://huggingface.co/moondream/parakeet-ultra
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
