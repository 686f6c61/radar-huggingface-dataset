# anonymous-asr-review/whisper-small-sinhala-r32-seed123

## Resumen

whisper-small-sinhala-r32-seed123 es un adaptador LoRA de rango 32 sobre el modelo base openai/whisper-small, publicado por la cuenta anónima anonymous-asr-review como material suplementario para una revisión por pares. No se trata de un modelo completo, sino de pesos de adaptador en formato PEFT: para usarlo hay que descargar por separado los pesos originales de Whisper-small y fusionarlos con `merge_and_unload()`.

El adaptador está orientado al reconocimiento automático de habla (ASR) en cingalés, con soporte declarado para inglés y para escenarios de mezcla de código (code-switching) cingalés-inglés. Según la model card, se trata del adaptador compartido por las estrategias "independent" y "frozen-Sinhala" del estudio, con semilla 123, rango 32 y alpha 32 (escalado efectivo de 1 sobre las matrices LoRA).

Su relevancia es doble. Por un lado, documenta un caso de adaptación eficiente de un modelo de habla multilingüe a un idioma de bajos recursos mediante LoRA, en lugar de reentrenamiento completo. Por otro, al ser un artefacto anonimizado de revisión, su interés principal es la reproducibilidad metodológica: el repositorio no incluye métricas, datos de entrenamiento ni licencia, por lo que hoy no es utilizable como componente de producción sin validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer encoder-decoder de tipo Whisper (modelo base: openai/whisper-small) |
| Parametros totales | 244 M en el modelo base fusionado; numero de parametros entrenables del adaptador: no disponible |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1500 frames de mel-espectrograma, equivalentes a 30 segundos de audio a 16 kHz (limite del modelo base) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; la model card solo documenta la carga en el `dtype` por defecto del modelo base |
| Idiomas soportados | cingales (si) e ingles (en), con enfasis en mezcla de codigo |
| Licencia | no disponible (el adaptador no declara licencia; el modelo base openai/whisper-small se publica bajo licencia MIT) |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA); los pesos del modelo base se descargan por separado |
| Libreria | peft (con transformers) |
| Rango LoRA / alpha | r = 32 / alpha = 32 |
| Semilla | 123 |
| Tamano del repositorio | 0,0 GB (redondeado) |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper-small: un transformer encoder-decoder con codificador de audio que consume espectrogramas mel de 80 canales y decodificador autorregresivo de tokens de texto, con atención cruzada entre ambos. El adaptador no modifica esa topología; únicamente inyecta matrices de bajo rango en las capas del modelo base, que se combinan linealmente con las originales mediante la factorización LoRA. Con r = 32 y alpha = 32, el factor de escala es 1, de modo que la contribución del adaptador entra sin reescalado adicional.

La model card describe el adaptador como el "rank-32 Sinhala adapter shared by the independent and frozen-Sinhala strategies", es decir, la parte cingalesa de dos variantes experimentales del mismo estudio (una con el módulo de cingalés independiente y otra congelado). No se especifica el número de tokens de audio de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste adicionales tipo RLHF o DPO. Tampoco se documentan las capas sobre las que se aplica LoRA (atención, proyecciones de salida, etc.). La innovación técnica declarada se limita a la propia estrategia de adaptación: entrenar un módulo lingüístico de bajo rango y evaluarlo en condiciones de mezcla de código.

## Capacidades

- Transcripción de voz a texto en cingalés a partir de audio de 16 kHz, heredando el preprocesado y la tokenización del procesador de Whisper.
- Transcripción en inglés, ya que el modelo base es multilingüe y el adaptador declara ambos idiomas.
- Manejo de mezcla de código cingalés-inglés, que es la etiqueta explícita del repositorio y el eje del estudio para el que se publicó.
- Capacidad de seleccionar idioma y parámetros de generación en la llamada de inferencia, al conservar la interfaz estándar de Whisper.
- No se documentan capacidades de traducción de voz, diarización de hablantes, detección de marcas temporales a nivel de palabra, tool calling, uso como agente ni modos de razonamiento extendido.
- No se declara soporte de audio de más de 30 segundos sin un mecanismo externo de segmentación o ventana deslizante.

## Casos de uso

- Evaluación comparativa de estrategias de adaptación LoRA: sirve como punto de referencia para medir si el módulo de cingalés independiente frente al congelado cambia el WER en el mismo conjunto de evaluación, con la semilla 123 como control de reproducibilidad.
- Reproducción de resultados en revisión por pares: al ser un artefacto anonimizado con instrucciones de carga explícitas en la model card, permite a revisores cargar el adaptador con `PeftModel.from_pretrained` y verificar las cifras del artículo.
- Transcripción de audio conversacional bilingüe cingalés-inglés: útil para material donde el hablante alterna idiomas dentro de la misma frase, un escenario frecuente en entornos urbanos de Sri Lanka y en comunidades migrantes.
- Punto de partida para adaptación adicional: dado su bajo coste de almacenamiento y su naturaleza PEFT, se puede seguir ajustando con datos propios de un dominio concreto (por ejemplo, consultas médicas o atención al cliente) sin reentrenar los 244 M de parámetros del modelo base.
- Experimentos académicos de bajo presupuesto de cómputo: el adaptador se puede entrenar y evaluar en una única GPU de gama media o incluso en CPU, lo que lo hace adecuado para proyectos de investigación sin clúster.
- Integración en prototipos de subtitulado para contenido en cingalés: combinado con un segmentador de audio de 30 segundos y un motor de inferencia con soporte de Whisper, permite generar subtítulos borrador que después revisa un hablante nativo.
- Comparación de metodologías de adaptación en idiomas de bajos recursos: sirve para estudiar cuánto rendimiento aporta un adaptador de rango 32 frente a alternativas de mayor rango o frente al ajuste completo.
- No se recomienda su uso directo en producción sin evaluación previa en el dominio objetivo, dado que no hay métricas publicadas ni licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER, CER, MMLU ni de ningún otro conjunto de evaluación, y los resultados de la búsqueda web no aportan datos sobre este repositorio. Cualquier cifra de rendimiento que se quiera usar debe medirse de forma independiente sobre el adaptador fusionado.

## Requisitos de hardware

- VRAM estimada para el modelo fusionado en fp16: en torno a 0,5-0,6 GB solo para pesos, más el consumo de activaciones del codificador y del decodificador autorregresivo; en la práctica, unos 1-2 GB en función de la longitud del audio y del tamaño de lote.
- VRAM estimada en int8 o cuantización ligera: aproximadamente 0,3 GB de pesos, lo que deja el modelo holgadamente dentro de cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090, T4, L4). Las A100 o H100 solo tienen sentido si se despliega en lote o junto a otros modelos, ya que el modelo está muy por debajo de su capacidad.
- Cabe en GPU de consumo: sí, sin dificultad, incluida la gama de entrada y también en CPU para inferencia puntual.
- Opciones de despliegue: transformers con peft para el adaptador, el modelo fusionado con transformers estándar, vLLM (con soporte de Whisper) para servir en lote, faster-whisper o whisper.cpp tras convertir el modelo fusionado a CTranslate2 o GGUF, y servidores compatibles con la API de OpenAI. Ollama es viable si se exporta el modelo fusionado en GGUF.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones para este adaptador y dependen en gran medida del backend y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| whisper-small-sinhala-r32-seed123 (este) | 244 M (base) + LoRA r=32 | 30 s por ventana | si, en | no disponible | Adaptador de revision, sin metricas publicadas |
| openai/whisper-small | 244 M | 30 s por ventana | Multilingue (amplio) | MIT | Modelo base sin ajuste especifico; cobertura de cingales limitada y con WER alto en la practica |
| openai/whisper-medium | 769 M | 30 s por ventana | Multilingue | MIT | Mayor capacidad y coste de inferencia aproximadamente triple en parametros |
| facebook/mms-1b-all | 1 B | Ventanas de audio cortas con adaptadores por idioma | Mas de 1000 idiomas, incluido cingales | CC-BY-NC 4.0 | Alternativa especifica para idiomas de bajos recursos, con restricciones de uso comercial |

No se dispone de comparaciones de WER entre estas opciones dentro de la informacion proporcionada; la tabla compara unicamente tamano, contexto, cobertura idiomatica y licencia.

## Limitaciones y advertencias

- La licencia del adaptador no está declarada, lo que impide determinar si se permite el uso comercial. El modelo base sí es MIT, pero eso no cubre automáticamente los pesos derivados.
- No hay métricas publicadas ni resultados de evaluación reproducibles en el repositorio; el rendimiento real en cingales o en code-switching es desconocido.
- Se trata de un artefacto anonimizado para revisión por pares: la cuenta, el nombre y la ausencia de documentación adicional dificultan el mantenimiento, la trazabilidad y cualquier uso a largo plazo.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, señal de que no ha sido validado por terceros.
- Al depender de openai/whisper-small, hereda los sesgos y las limitaciones del corpus de entrenamiento original de Whisper, con cobertura desigual entre idiomas y peor comportamiento en variedades dialectales, audio ruidoso, acentos no estándar y habla espontánea.
- Riesgo de alucinación típico de los modelos ASR generativos: en segmentos con silencio, ruido o solapamiento de voces, el decodificador puede producir texto plausible que no corresponde a lo pronunciado.
- Limitación de ventana: 30 segundos por pasada. El audio más largo requiere segmentación externa, con el consiguiente riesgo de cortar palabras a mitad.
- La mezcla de código cingalés-inglés es el escenario declarado, pero no se documenta cómo se comporta con otras combinaciones ni con transliteración informal.
- El proceso de fusión (`merge_and_unload()`) es irreversible en el objeto resultante: si se necesita el adaptador por separado, hay que conservar los pesos originales.
- No se documentan medidas de seguridad, filtrado de contenido ni cumplimiento normativo (por ejemplo, RGPD) para tratar audio de personas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anonymous-asr-review/whisper-small-sinhala-r32-seed123
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio de PEFT: https://github.com/huggingface/peft
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Documentacion de Whisper en transformers: https://huggingface.co/docs/transformers/model_doc/whisper
- Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian al colectivo de activistas homonimo y a una marca de calzado, sin relacion con el repositorio.
