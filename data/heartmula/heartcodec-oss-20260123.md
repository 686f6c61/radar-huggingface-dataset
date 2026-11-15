# HeartMuLa/HeartCodec-oss-20260123

## Resumen

HeartCodec-oss-20260123 es un códec de audio para música de alta fidelidad de reconstrucción que opera a 12,5 Hz, desarrollado por HeartMuLa como parte de su familia de modelos fundacionales de música de código abierto. No es un modelo generativo de texto ni un LLM: es el componente de cuantización y decodificación de audio que acompaña a los modelos generativos de la familia HeartMuLa. Concretamente, este checkpoint aporta el cuantizador RVQ compartido y el decodificador de audio que transforman tokens de códec en audio estéreo a 48 kHz.

El modelo resuelve dos problemas concretos. En primer lugar, permite la generación de música: los modelos HeartMuLa producen tokens de códec y este checkpoint los decodifica a audio. En segundo lugar, permite la reconstrucción de audio: emparejado con HeartCodec-oss-encoder, convierte audio en ocho flujos de tokens a 12,5 Hz y los reconstruye de vuelta a estéreo a 48 kHz. La versión 20260123 mejora la calidad de decodificación de audio respecto a versiones anteriores.

Con 1.659.568.725 parámetros en formato safetensors y un repositorio de 6,6 GB, el modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial e integración en pipelines de producción. Su relevancia actual radica en que forma parte de un ecosistema abierto de modelos de música que cubre tanto la generación como la codificación de audio de alta calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Códec de audio neuronal con cuantizador RVQ (residual vector quantization) y decodificador de audio; 12,5 Hz de tasa de tokens |
| Parametros totales | 1.659.568.725 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de audio, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible describe HeartCodec como un códec de música a 12,5 Hz con alta fidelidad de reconstrucción. El sistema se compone de un cuantizador RVQ compartido y un decodificador de audio. El flujo completo de reconstrucción emplea ocho flujos de tokens (eight token streams) a 12,5 Hz que se decodifican a audio estéreo a 48 kHz. Este checkpoint concreto contiene la parte de decodificación y cuantización compartida; el codificador se distribuye por separado como HeartCodec-oss-encoder.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas más allá de la propia arquitectura RVQ y la tasa de 12,5 Hz. La versión 20260123 se presenta como una mejora de la calidad de decodificación de audio respecto a releases anteriores. Para detalles técnicos completos, el paper asociado es arXiv:2601.10547.

## Capacidades

- Codificación y decodificación de audio musical con reconstrucción de alta fidelidad.
- Representación de audio como ocho flujos de tokens a 12,5 Hz (representación compacta y adecuada para modelado generativo).
- Decodificación de tokens de códec producidos por modelos generativos (HeartMuLa) a audio estéreo a 48 kHz.
- Reconstrucción de audio de ida y vuelta (audio → tokens → audio) cuando se combina con HeartCodec-oss-encoder.
- Integración con la familia de modelos generativos de música HeartMuLa (por ejemplo, HeartMuLa-oss-3B-happy-new-year).
- No es un modelo de texto: no soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No se documentan capacidades multilingües (es un modelo de audio).

## Casos de uso

- Generación de música a partir de letras: los modelos HeartMuLa generan tokens de códec y este checkpoint los decodifica a audio estéreo a 48 kHz, permitiendo construir pipelines de creación musical completa con componentes de código abierto.
- Reconstrucción y compresión de audio musical: emparejado con el encoder, convierte pistas de audio en representaciones de ocho flujos de tokens a 12,5 Hz, útiles para almacenamiento compacto o procesamiento posterior en el dominio de tokens.
- Edición de pasajes de canciones: al operar sobre representaciones de tokens, permite manipular secciones concretas de una pista y decodificarlas de nuevo a audio, un caso que el autor ilustra con MuLa Studio.
- Creación de covers y remixes: la representación tokenizada facilita transformar o recombinar material musical existente y decodificarlo con este checkpoint.
- Investigación en modelos fundacionales de música: sirve como componente de tokenización/decodificación reproducible (licencia Apache 2.0) para experimentos académicos sobre modelado generativo de audio.
- Integración en aplicaciones de producción musical asistida: al ser un componente ligero en comparación con modelos generativos grandes, puede desplegarse como servicio de decodificación dentro de un pipeline mayor de generación musical.
- Desarrollo de herramientas de análisis musical basadas en tokens: los ocho flujos de tokens a 12,5 Hz ofrecen una representación estructurada sobre la que construir clasificadores, editores o sistemas de recomendación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 1.659.568.725 parámetros en safetensors (6,6 GB de repositorio), una estimación orientativa en FP16 sería de aproximadamente 3,3 GB solo para pesos, más memoria para activaciones y buffers de audio; en FP32, unos 6,6 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados.
- GPU recomendadas: no disponible. Por tamaño, el modelo es manejable en GPUs de consumo, pero el autor no publica requisitos oficiales.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de pesos (estimación, no confirmada por el autor).
- Opciones de despliegue: la información disponible remite al repositorio heartlib para instalación, disposición de checkpoints e inferencia. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLMs de texto, no aplicables directamente a un códec de audio).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de códecs de audio comparables (por ejemplo, otros códecs neuronales de música) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El modelo es un componente de códec de audio, no un modelo generativo autónomo: por sí solo no genera música; requiere un modelo HeartMuLa que produzca tokens o el encoder correspondiente para la reconstrucción.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre datos musicales, puede heredar sesgos de distribución del corpus de entrenamiento (no detallado).
- Riesgo de artefactos de reconstrucción: aunque la versión 20260123 mejora la calidad de decodificación, no se publican métricas objetivas de fidelidad en la información disponible.
- No hay información sobre idiomas ni sobre contenido lingüístico; las capacidades multilingües no aplican.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos completos y las licencias de los componentes emparejados (encoder y modelos generativos) antes de producción.
- No se especifican limitaciones de longitud de contexto ni de duración máxima de audio procesable.
- Dependencia del ecosistema heartlib: la integración y el despliegue requieren seguir la documentación del repositorio del autor.

## Enlaces

- Hugging Face: https://huggingface.co/HeartMuLa/HeartCodec-oss-20260123
- Encoder emparejado: https://huggingface.co/HeartMuLa/HeartCodec-oss-encoder
- Modelo generativo asociado: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B-happy-new-year
- Repositorio GitHub: https://github.com/HeartMuLa/heartlib
- Paper: https://arxiv.org/abs/2601.10547
- Demo: https://heartmula.github.io/
- Sitio web: https://heartmula.com
