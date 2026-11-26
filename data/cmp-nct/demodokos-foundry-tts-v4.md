# cmp-nct/demodokos-foundry-tts-v4

## Resumen
Demodokos Foundry TTS v4 es un modelo de síntesis de voz (text-to-speech) publicado por el usuario cmp-nct en Hugging Face bajo el paraguas del producto Demodokos Foundry. Se distribuye como parte de una suite de herramientas de audio local para Windows que incluye generación musical, clonación de voz, separación de pistas, mezcla y masterización, y que el autor describe como ejecutable en GPU NVIDIA (y también AMD/NVIDIA con 4 GB o más de VRAM para la parte de síntesis de voz). El modelo está etiquetado con el pipeline `text-to-speech` y soporta diez idiomas: inglés, alemán, francés, español, italiano, portugués, chino, japonés, coreano y ruso.

El dato técnico más concreto disponible es el recuento de parámetros en safetensors: 908.529.760 parámetros (aproximadamente 0,91 mil millones), con un repositorio de 17,3 GB que incluye pesos, probablemente en varios formatos y cuantizaciones (la etiqueta `gguf` sugiere que se ofrece una variante GGUF además de los pesos originales). La model card no detalla la arquitectura interna, el número de tokens de entrenamiento ni los datos de entrenamiento, por lo que esos apartados quedan marcados como no disponibles.

La relevancia del modelo reside en su enfoque de inferencia local y privacidad: el autor insiste en que no hay generación en la nube ni medidores de créditos, y que la clonación de voz está incluida. Para desarrolladores e investigadores que necesitan un TTS multilingüe desplegable en hardware de consumo, esta ficha recoge lo que se puede verificar y señala explícitamente lo que la documentación no cubre.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 908.529.760 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio incluye etiqueta `gguf`, lo que sugiere al menos una variante GGUF) |
| Idiomas soportados | en, de, fr, es, it, pt, zh, ja, ko, ru (10 idiomas) |
| Licencia | demodokos-foundry-proprietary-model (propietaria, etiquetada como `other`) |
| Formato de pesos | safetensors (confirmado por el recuento de parámetros); GGUF probable por la etiqueta |

## Arquitectura y entrenamiento
No se ha publicado información sobre la arquitectura interna del modelo en la documentación disponible. El recuento de parámetros (908.529.760) y el pipeline `text-to-speech` son los únicos datos estructurales verificables. La model card no describe si se trata de un transformer, un modelo híbrido, un modelo de difusión para audio o una arquitectura tipo VITS/Tacotron, ni detalla mecanismos de atención, decodificación o vocoder asociado.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO ni innovaciones técnicas concretas. La información disponible se limita a características de producto: control de emoción descrito como "50 x 5", más de 200 presets de DSP, más de 120 comandos de automatización y soporte de clonación de voz. Estos datos provienen del material promocional de la suite y no de una descripción técnica del modelo.

## Capacidades
- Síntesis de voz multilingüe en diez idiomas: inglés, alemán, francés, español, italiano, portugués, chino, japonés, coreano y ruso.
- Clonación de voz, según la model card ("Voice cloning included").
- Control de emoción, descrito por el autor como "50 x 5" (la notación no se explica en detalle).
- Integración en una suite de audio más amplia con generación musical en más de 50 idiomas, separación de pistas, reparación de secciones, grabación, mezcla y masterización.
- Automatización mediante más de 120 comandos, orientada a flujos de trabajo de producción de audio.
- Aplicación de presets DSP (más de 200) sobre el audio generado.
- Ejecución local sin generación en la nube ni medidores de créditos.
- Soporte de GPU NVIDIA y, para síntesis de voz, también AMD con 4 GB o más de VRAM.
- No se documentan tool calling, function calling, razonamiento multi-paso ni modo thinking; son capacidades fuera del alcance de un modelo TTS.

## Casos de uso
- Doblaje y localización de vídeo: el modelo cubre diez idiomas, lo que permite generar pistas de voz para un mismo contenido en español, inglés, alemán, francés, italiano, portugués, chino, japonés, coreano y ruso sin depender de servicios en la nube.
- Audiolibros y narración: la clonación de voz y el control de emoción permiten mantener una voz consistente a lo largo de capítulos y ajustar el tono según el pasaje.
- Asistentes de voz locales: al ejecutarse en hardware de consumo (4 GB o más de VRAM para síntesis), se puede integrar en un asistente doméstico que no envíe audio del usuario a servidores externos.
- Accesibilidad: generación de voz para lectores de pantalla o interfaces para personas con discapacidad visual, con la ventaja de que el procesamiento es local y no requiere conexión.
- Producción de pódcast y contenido: la suite incluye mezcla, masterización y presets DSP, de modo que el TTS puede formar parte de una cadena de producción completa en una sola máquina.
- Prototipado de videojuegos: generación de voces de personajes en varios idiomas durante el desarrollo, con clonación para dar identidad vocal a cada personaje y sin coste por petición.
- Preproducción musical y demos: combinado con las capacidades de generación musical del mismo producto, sirve para crear maquetas con voces guía antes de la grabación definitiva.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita. El autor indica que la síntesis de voz funciona con GPU AMD y NVIDIA con 4 GB o más de VRAM.
- GPU recomendadas: no se especifican modelos concretos. El producto está orientado a Windows con GPU NVIDIA; para síntesis de voz se acepta también AMD.
- Compatibilidad con GPU de consumo: sí, según el requisito de 4 GB o más de VRAM para síntesis de voz.
- Opciones de despliegue: el producto se distribuye como aplicación para Windows ("Download for Windows"). La presencia de la etiqueta `gguf` sugiere compatibilidad con el ecosistema GGUF, pero no se documentan instrucciones para vLLM, llama.cpp, Ollama o TGI, que además no son herramientas habituales para TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de especificaciones comparables suficientes para establecer una comparación rigurosa con alternativas de la misma categoría. La información proporcionada no incluye modelos de referencia ni resultados medidos.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| demodokos-foundry-tts-v4 | 908.529.760 | no disponible | 10 | propietaria | Hugging Face + app Windows |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- La licencia es propietaria (`demodokos-foundry-proprietary-model`), etiquetada como `other`. Es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; no se puede asumir permiso de uso comercial por el hecho de estar publicado en Hugging Face.
- No se documenta la arquitectura, los datos de entrenamiento ni el proceso de alineación, lo que dificulta evaluar sesgos y riesgos de forma independiente.
- La clonación de voz conlleva riesgos de suplantación de identidad y uso indebido; el autor no detalla salvaguardas, consentimiento ni marcas de agua en la información disponible.
- Riesgo de alucinación no aplica en el sentido habitual de generación de texto, pero sí existe riesgo de pronunciación incorrecta, artefactos acústicos o prosodia inadecuada en textos fuera del dominio de entrenamiento; no se han publicado evaluaciones al respecto.
- El producto se presenta como aplicación para Windows, lo que limita el despliegue en servidores Linux sin una integración adicional no documentada.
- No se especifican límites de longitud de texto por petición ni comportamiento con entradas muy largas.
- El repositorio ocupa 17,3 GB, un tamaño considerable para un modelo de 0,91 mil millones de parámetros, lo que sugiere que incluye múltiples variantes o recursos adicionales; conviene revisar los archivos antes de descargar.
- La model card tiene un marcado carácter promocional y no sustituye a una evaluación técnica independiente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/cmp-nct/demodokos-foundry-tts-v4
- Sitio del producto: https://demodokos.com/
- Demos de audio: https://demodokos.com/#listen
- Funciones: https://demodokos.com/#create
- Precios: https://demodokos.com/#pricing
- Descarga: https://demodokos.com/#begin
