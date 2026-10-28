# pradeep-pioneer/screaming-flow-apex-android

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un export para Android de `Oriserve/Whisper-Hindi2Hinglish-Apex`, un fine-tune de Whisper large-v3-turbo orientado a transcripción hindi-inglés con salida en hinglish. Lo publica `pradeep-pioneer` y está pensado para la aplicación Screaming Flow.

La particularidad está en el empaquetado: el encoder se divide en cuatro archivos ONNX fp16 para el backend QNN de ONNX Runtime en la NPU Snapdragon, mientras que el decoder se distribuye como un modelo ONNX de un solo paso con su propia caché y un modelo de cross-attention para CPU. La aplicación verifica cada archivo con SHA-256 antes de cargarlo.

Resuelve el despliegue local de ASR hinglish en teléfonos, sin depender de la nube, a costa de un pipeline de ejecución específico por hardware. No hay datos públicos de parámetros, ventana de audio, WER ni latencia en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper, exportado a ONNX; encoder en cuatro partes y decoder de un paso con caché y cross-attention |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; no se documenta la ventana de audio |
| Tipos de cuantización | fp16 en el encoder; no se documentan otros formatos como INT8 o INT4 |
| Idiomas soportados | salida en hinglish con escritura latina y token de idioma inglés; idiomas de entrada no detallados |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX; encoder en cuatro partes fp16 y decoder en modelos separados de un paso y cross-attention |
| Modelo base | Oriserve/Whisper-Hindi2Hinglish-Apex |
| Tamaño del repositorio | 2,2 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper, un transformer encoder-decoder para reconocimiento automático del habla. En este repositorio no se entrena un modelo nuevo: se transforma el fine-tune `Oriserve/Whisper-Hindi2Hinglish-Apex`, que a su vez parte de Whisper large-v3-turbo. La model card no aporta número de tokens de entrenamiento, composición del dataset, detalles de alineamiento ni si hubo RLHF o DPO. Tampoco indica el número de parámetros del export.

La innovación es de despliegue: el encoder se divide en cuatro ONNX fp16 para QNN en la NPU Snapdragon, y el decoder se ejecuta en CPU como modelo de un solo paso con caché propia más un modelo de cross-attention. La app comprueba la integridad de cada archivo mediante SHA-256 antes de cargarlo. No se documentan optimizaciones adicionales como decodificación especulativa, VAD, cuantización INT8 o gestión de audio largo.

## Capacidades

- Reconocimiento automático del habla para producir texto en hinglish con escritura latina.
- Uso del token de idioma inglés durante la decodificación, según la model card.
- Ejecución en Android con el encoder en la NPU Snapdragon mediante ONNX Runtime QNN y el decoder en CPU.
- Verificación de integridad de los archivos ONNX con SHA-256 en la aplicación Screaming Flow.
- No se documentan tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan visión, audio generation, traducción, resumen, marcas de tiempo, diarización ni detección de actividad de voz.
- No se documenta soporte multilingüe más allá de la salida en hinglish y el token de inglés.

## Casos de uso

- Dictado y notas de voz sin conexión en Android: el modelo puede convertir voz hindi-inglés en texto hinglish localmente, usando la NPU para el encoder y la CPU para el decoder, lo que evita enviar audio a un servidor.
- Transcripción de conversaciones de atención al cliente: es adecuado para escenarios en los que se alterna hindi e inglés y se requiere privacidad en el dispositivo, siempre que la aplicación gestione el troceado del audio.
- Accesibilidad para usuarios que hablan hinglish: puede actuar como entrada de voz para campos de texto y aplicaciones móviles, con la ventaja de que el reconocimiento se ejecuta en el propio teléfono.
- Asistente de voz local: puede servir como etapa ASR previa a un motor de intenciones o NLU, manteniendo el audio fuera de la nube y reduciendo la dependencia de conectividad.
- Documentación de entrevistas y trabajo de campo: útil para recoger declaraciones en hinglish en dispositivos Android y revisar el texto posteriormente, con verificación de integridad de los modelos en la app.
- Subtitulado y postproducción de contenido hindi-inglés: puede generar transcripciones base, aunque la alineación temporal requeriría un componente externo porque no se documentan timestamps.
- Validación de pipelines ONNX/QNN en aplicaciones Android: sirve como caso de prueba para integrar encoder en NPU, decoder en CPU y comprobaciones SHA-256 en un flujo de CI/CD móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de WER, exactitud, latencia, throughput ni consumo energético para este export.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está orientado a memoria de teléfono y no se documenta el pico de RAM.
- GPU recomendadas: no aplica para el flujo previsto; el encoder usa la NPU Snapdragon mediante QNN y el decoder se ejecuta en CPU.
- Consumer GPU: no es el objetivo del repositorio; no hay datos para RTX 4090, RTX 3090 u otras GPU de escritorio.
- SoC compatibles: no se enumeran modelos concretos de Snapdragon ni versiones mínimas de QNN.
- Opciones de despliegue: ONNX Runtime con el execution provider QNN para el encoder y ejecución CPU para el decoder, integrado en la app Android Screaming Flow. vLLM, llama.cpp, Ollama y TGI no son aplicables a este formato y flujo.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 2,2 GB; la app debe verificar cada archivo con SHA-256 antes de cargarlo.

## Comparativa con modelos similares

No se dispone de alternativas comparables en la información proporcionada. La tabla compara el export con su modelo base y con el modelo upstream referenciado; no hay métricas de rendimiento para establecer una comparación cuantitativa.

| Modelo | Parámetros | Contexto / ventana | Rendimiento | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `pradeep-pioneer/screaming-flow-apex-android` | no disponible | no disponible | no disponible | Apache-2.0 | ONNX para QNN y CPU | Repositorio público con 0 descargas y 0 likes en el momento de la consulta |
| `Oriserve/Whisper-Hindi2Hinglish-Apex` | no disponible | no disponible | no disponible | Apache-2.0 según la model card | no disponible | Repositorio público en HuggingFace |
| Whisper large-v3-turbo, modelo upstream del fine-tune | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | Referenciado como base del fine-tune; disponibilidad no verificada en la información |

## Limitaciones y advertencias

- No hay benchmarks, WER, latencia ni consumo publicados; no es posible validar la calidad del export con datos objetivos.
- El repositorio tenía 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación independiente o uso en producción.
- No se documentan sesgos conocidos ni la composición del dataset del fine-tune base.
- Existe riesgo de transcripciones inventadas o incorrectas en silencios, ruido y solapamientos, habitual en modelos ASR tipo Whisper; no se cuantifica en la información disponible.
- La salida documentada es hinglish en escritura latina con token de inglés; no se documentan otros idiomas, escritura devanagari ni cambios de idioma.
- No se documentan marcas de tiempo, diarización de hablantes, VAD ni procesamiento de audio largo.
- La dependencia de QNN y de la NPU Snapdragon limita la portabilidad; no se especifican versiones mínimas de Android, drivers o SoC.
- La licencia Apache-2.0 permite uso comercial, pero no se documenta la procedencia de los datos de entrenamiento; conviene revisar la licencia y las condiciones del modelo base.
- No es un modelo de lenguaje generativo: no soporta tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pradeep-pioneer/screaming-flow-apex-android
- Modelo base: https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Apex
- No se han encontrado enlaces técnicos adicionales relevantes en la búsqueda web; los resultados disponibles corresponden a personas homónimas sin relación con el modelo o el autor.
