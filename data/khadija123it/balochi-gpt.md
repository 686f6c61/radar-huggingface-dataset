# khadija123it/balochi-gpt

## Resumen

Balochi-gpt es un modelo de generacion de texto publicado en Hugging Face por el usuario khadija123it bajo el identificador `khadija123it/balochi-gpt`. Por su nombre, el modelo apunta a tareas de procesamiento de lengua balochi, aunque la model card no documenta explicitamente el idioma ni el corpus de entrenamiento. El repositorio contiene pesos en formato safetensors compatibles con la libreria transformers y esta etiquetado con la arquitectura gpt2, lo que lo situa en la familia de transformers decoder-only de tipo GPT-2.

El modelo cuenta con 124.439.808 parametros totales (aproximadamente 124 millones), un tamano propio de la variante GPT-2 base, y ocupa 0,5 GB en el repositorio. La model card es la plantilla autogenerada por Hugging Face y no aporta informacion sobre datos de entrenamiento, hiperparametros, licencia ni evaluacion. Esto limita seriamente cualquier evaluacion tecnica rigurosa y obliga a tratar el modelo como un artefacto experimental sin garantias documentadas.

Su relevancia actual es limitada pero informativa: representa un intento de adaptar un transformer pequeno a una lengua de bajos recursos como el balochi, un caso de uso habitual en la comunidad open source para idiomas con poca presencia en corpus masivos. No obstante, la ausencia de documentacion, de licencia declarada y de resultados de benchmarks impide recomendarlo para produccion sin una validacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), segun tag `gpt2` |
| Parametros totales | 124.439.808 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, pero no documentada) |
| Idiomas soportados | no disponible (el nombre sugiere balochi, sin confirmacion en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La unica informacion arquitectonica disponible proviene del tag `gpt2` del repositorio, que indica una arquitectura transformer decoder-only con atencion causal, propia de la familia GPT-2. El recuento de parametros (124,4 millones) coincide con el orden de magnitud de GPT-2 base (124 millones), lo que sugiere una configuracion de 12 capas, 12 cabezas de atencion y una dimension de embedding de 768, aunque estos valores concretos no estan confirmados en la informacion proporcionada.

No hay datos sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset, la existencia de fases de RLHF o DPO, ni la tecnica de tokenizacion empleada. La model card es la plantilla autogenerada por Hugging Face y todos los campos de entrenamiento aparecen como "[More Information Needed]". Tampoco se documenta ninguna innovacion tecnica como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto autoregresiva, derivada de la arquitectura GPT-2.
- Capacidad potencial de modelado de lengua balochi, inferida unicamente del nombre del modelo y no confirmada en la documentacion.
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia documentada de capacidades multilingues mas alla del supuesto balochi.
- No se documentan modos especiales como thinking mode, vision o audio.
- No se documenta soporte de instrucciones (no consta un proceso de instruction tuning).

## Casos de uso

- Experimentacion linguistica con balochi: el modelo puede emplearse como base para probar tecnicas de adaptacion de transformers pequenos a lenguas de bajos recursos, dado su tamano reducido y su formato estandar en transformers.
- Fine-tuning sobre corpus balochi: al ser un GPT-2 de 124 millones de parametros, es viable ajustarlo en una unica GPU consumer para tareas de generacion o clasificacion especificas del idioma.
- Generacion de texto asistida en entornos de investigacion: util para comparar la calidad de un modelo pequeno frente a alternativas multilingues de mayor tamano en tareas de continuacion de texto.
- Prototipado rapido de pipelines de NLP: su integracion directa con `transformers` y `text-generation-inference` permite montar demos locales sin infraestructura compleja.
- Educacion y divulgacion: sirve como ejemplo practico de como se publica y se consume un modelo en Hugging Face para quienes se inician en el ecosistema.
- Base para evaluacion de sesgos en lenguas minorizadas: permite estudiar que tipo de texto genera un modelo entrenado (presuntamente) con datos limitados de balochi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos, mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU con 2 GB o mas.
- VRAM estimada en fp16/bf16: alrededor de 0,25 GB de pesos, holgadamente dentro de GPUs consumer.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 6 GB, RTX 3060, RTX 4090) es suficiente; tambien es viable en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: `transformers` (libreria nativa), `text-generation-inference` (tag `text-generation-inference` presente), y conversion a GGUF para llama.cpp u Ollama si se realiza la conversion manualmente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| khadija123it/balochi-gpt | 124,4 M | no disponible | no disponible | Hugging Face |
| GPT-2 base (OpenAI) | 124 M | 1024 tokens | MIT | Hugging Face, ampliamente disponible |
| GPT-2 small (OpenAI) | 117 M | 1024 tokens | MIT | Hugging Face, ampliamente disponible |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Hugging Face, ampliamente disponible |

La comparativa se limita a modelos de la misma familia y orden de magnitud, ya que no hay datos de rendimiento del modelo evaluado. Frente a GPT-2 base, balochi-gpt no aporta informacion verificable sobre ventajas en balochi ni sobre calidad de generacion; la diferencia principal es la ausencia de licencia y documentacion en el modelo evaluado.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero al ser un modelo pequeno y presumiblemente entrenado con datos limitados, es probable que presente sesgos derivados del corpus, no cuantificados.
- Riesgo elevado de alucinacion y de generacion de texto incoherente, especialmente en tareas fuera del dominio de entrenamiento.
- No se especifica la longitud de contexto soportada; asumir 1024 tokens (tipico de GPT-2) es una suposicion no confirmada.
- No hay confirmacion oficial de que el modelo domine el balochi; el nombre puede no reflejar el contenido real del entrenamiento.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido; en la practica, esto bloquea su adopcion en produccion sin aclaracion del autor.
- No hay informacion sobre el proceso de entrenamiento, lo que impide evaluar la calidad de los datos y el riesgo de contaminacion.
- El modelo no parece haber pasado por instruction tuning ni RLHF, por lo que no es adecuado para tareas de instruccion directa sin ajuste adicional.
- Cero descargas y cero likes en el momento de la consulta indican ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khadija123it/balochi-gpt
- Balochi AI (sitio relacionado con el idioma, no afiliado confirmado): https://www.balochiai.com/
- Balochi AI Assistant: https://www.balochiai.com/
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
