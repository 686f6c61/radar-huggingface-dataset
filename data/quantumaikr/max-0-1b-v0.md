# quantumaikr/max-0.1b-v0

## Resumen
max-0.1b-v0 es un modelo de lenguaje base de tipo decoder-only desarrollado por quantumaikr, orientado prioritariamente al coreano y con 109,5 millones de parametros (aproximadamente 0,1B). Se presenta como un modelo pequeno para funciones industriales concretas: clasificacion de documentos, enrutado de peticiones, extraccion de campos y rellenado de formularios. No esta ajustado por instrucciones: es un modelo base pensado como punto de partida para fine-tuning por tarea y para investigacion, no para uso final directo.

La arquitectura es compatible con `Qwen3ForCausalLM` y emplea un vocabulario de 32.000 tokens optimizado para coreano, con separacion de digitos. Su ventana de contexto es muy reducida (1.024 tokens) y el entrenamiento se limita a 2,8 mil millones de tokens, lo que lo situa en la categoria de modelos experimentales de muy bajo coste computacional. La licencia Apache 2.0 y la disponibilidad de pesos en safetensors y GGUF (incluida una cuantizacion q4_k_m de 73 MB que corre en CPU convencional) lo hacen atractivo para despliegues en entornos con recursos minimos.

Es relevante ahora porque ejemplifica una tendencia de modelos ultracompactos especializados por idioma y dominio, donde el objetivo no es competir en benchmarks generales sino servir de base para tareas acotadas con requisitos de privacidad o latencia estrictos. El propio autor advierte que existe una version posterior (max-0.1b-v1) entrenada con 10.000 millones de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, compatible con `Qwen3ForCausalLM` |
| Parametros totales | 109.531.392 (109,5M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | f16 (221 MB), q8_0 (118 MB), q4_k_m (73 MB) en formato GGUF |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento
El modelo sigue una arquitectura transformer decoder-only con layout compatible con `Qwen3ForCausalLM`, lo que facilita su carga mediante `transformers` y su integracion en herramientas que ya soportan la familia Qwen3. El tokenizador es un `PreTrainedTokenizerFast` con vocabulario de 32.000 entradas optimizado para coreano y con separacion de digitos; el texto de entrada debe normalizarse a Unicode NFC.

El entrenamiento se realizo sobre 2,8 mil millones de tokens procedentes de subconjuntos coreanos e ingleses de FineWeb-2, FinePDFs (coreano), FineWeb-Edu y FineMath, todos bajo licencia ODC-By 1.0 y derivados de Common Crawl. No se menciona RLHF, DPO ni ajuste por instrucciones: es un modelo estrictamente base. El autor publica checkpoints de PyTorch intermedios (step 4818 con estado del optimizador para reanudar preentrenamiento, y step 5595 tras cooldown) junto con sumas SHA256 para verificacion. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades
- Generacion de texto autoregresiva en coreano e ingles, como modelo base de continuacion.
- Clasificacion de tipo de documento (0,63 de exactitud calibrada en tarea few-shot antes de fine-tuning).
- Clasificacion de quejas o reclamaciones (0,45 de exactitud antes de fine-tuning).
- Enrutado de peticiones (0,28 de exactitud antes de fine-tuning).
- Generacion de salida JSON con tasa de parseo de 0,48-0,58 antes de fine-tuning.
- Capacidad limitada de extraccion de campos y resumen fiel a numeros, no utilizable sin fine-tuning.
- No soporta tool calling ni function calling de forma nativa.
- No dispone de modo de razonamiento explicito (thinking mode), vision ni audio.
- Capacidades multilingues restringidas a coreano e ingles.

## Casos de uso
- Clasificacion de documentos administrativos: tras un fine-tuning supervisado sobre el conjunto de datos propio, el modelo puede etiquetar tipos de documento en flujos de digitalizacion, aprovechando que ya parte de una base coreana y que su tamano permite ejecutarlo en CPU.
- Enrutado de peticiones en sistemas de atencion al cliente: con un ajuste fino sobre pares peticion-categoria, puede derivar consultas al departamento adecuado; su contexto de 1.024 tokens es suficiente para peticiones cortas y su latencia es minima.
- Extraccion de campos en formularios: partiendo del modelo base y anadiendo un cabezal o fine-tuning generativo, puede extraer importes, fechas y nombres de documentos estructurados, aunque el autor advierte que sin ajuste no es fiable.
- Generacion de JSON en pipelines ligeros: la tasa de parseo del 0,48-0,58 antes de fine-tuning sugiere que, con ajuste especifico, puede producir salidas estructuradas para integraciones con APIs internas de bajo coste.
- Prototipado de asistentes en coreano con requisitos de privacidad: al poder ejecutarse localmente con la cuantizacion q4_k_m (73 MB), es viable en dispositivos sin GPU y en entornos donde los datos no pueden salir de la infraestructura.
- Investigacion sobre modelos pequenos y tokenizacion coreana: sirve como base reproducible para estudiar el efecto del vocabulario de 32.000 tokens y de la separacion de digitos en tareas morfologicas del coreano.
- Educacion y experimentacion: su reducido coste de entrenamiento (2,8B tokens) y la publicacion de checkpoints con estado del optimizador permiten reproducir curvas de aprendizaje y comparar estrategias de cooldown.

## Benchmarks y rendimiento
Datos publicados por el autor en la model card (evaluacion 0-shot, n=300):

| Tarea | Exactitud | Azar |
|---|---|---|
| ARC-Easy | 0,43 | 0,25 |
| PIQA | 0,60 | 0,50 |
| HellaSwag | 0,29 | 0,25 |
| KoBEST COPA | 0,56 | 0,50 |
| KoBEST HellaSwag | 0,32 (normalizado 0,41) | 0,25 |
| KoBEST BoolQ | 0,49 | 0,50 |

Validacion en bits por byte (menor es mejor): web coreana 0,90; documentos coreanos 0,83; ingles 1,03.

Tareas industriales few-shot (n=40 por tarea, antes de fine-tuning): clasificacion de tipo de documento 0,63 (calibrada), clasificacion de quejas 0,45, enrutado de peticiones 0,28, tasa de parseo de JSON 0,48-0,58. La extraccion de campos y el resumen fiel a numeros no son utilizables sin fine-tuning.

## Requisitos de hardware
- VRAM estimada para inferencia en f16: aproximadamente 220 MB de pesos mas overhead de activaciones y cache KV para 1.024 tokens, en torno a 0,5 GB en total.
- VRAM estimada en q8_0: aproximadamente 120 MB de pesos; en q4_k_m: aproximadamente 75 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3060 o GPUs integradas.
- Cabe en GPU consumer y en CPU convencional: la cuantizacion q4_k_m (73 MB) esta pensada explicitamente para CPUs normales.
- Opciones de despliegue: `transformers` (safetensors), llama.cpp (`llama-cli` con GGUF), y por compatibilidad con Qwen3, potencialmente vLLM y TGI, aunque no se documenta soporte verificado.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| max-0.1b-v0 | 109,5M | 1.024 | ko, en | Apache 2.0 | Base, 2,8B tokens de entrenamiento |
| max-0.1b-v1 | no disponible | no disponible | ko, en | Apache 2.0 (presumible) | Version posterior del mismo autor, 10B tokens |
| Qwen3 (familia) | no disponible para el modelo base de referencia | no disponible | multilingue | Apache 2.0 en variantes abiertas | El modelo es compatible con `Qwen3ForCausalLM`, pero no se dispone de datos comparativos concretos |
| Modelos pequenos coreanos tipo KLUE-BERT o similares | no disponible | no disponible | ko | variable | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias
- Entrenado solo con 2,8 mil millones de tokens: el conocimiento factico es debil y el modelo tiende a repetirse.
- Puede inventar numeros y hechos; no debe usarse su salida sin verificacion.
- Es un modelo base: continua texto y no sigue instrucciones de forma fiable.
- La ventana de contexto de 1.024 tokens limita tareas que requieran documentos largos o conversaciones multi-turno extensas.
- Solo soporta coreano e ingles; no hay capacidades multilingues mas alla de estos dos idiomas.
- Aunque se enmascararon identificadores personales en el texto de entrenamiento, los modelos pequenos pueden reproducir fragmentos de texto web.
- La licencia Apache 2.0 permite uso comercial, pero el autor no garantiza idoneidad para produccion sin fine-tuning y verificacion.
- Existe una version posterior (max-0.1b-v1) con mejor perdida de validacion y puntuaciones en tareas publicas coreanas; para nuevos proyectos conviene evaluar esa version.
- El modelo no incluye tool calling ni function calling nativo, lo que limita su integracion en agentes sin capas adicionales.

## Enlaces
- Hugging Face: https://huggingface.co/quantumaikr/max-0.1b-v0
- Version posterior: https://huggingface.co/quantumaikr/max-0.1b-v1
- FineWeb-2 (Hugging Face, ODC-By 1.0): no disponible enlace directo en la informacion proporcionada
- FinePDFs (Hugging Face, ODC-By 1.0): no disponible enlace directo en la informacion proporcionada
- FineWeb-Edu (Hugging Face, ODC-By 1.0): no disponible enlace directo en la informacion proporcionada
- FineMath (Hugging Face, ODC-By 1.0): no disponible enlace directo en la informacion proporcionada
- Common Crawl Terms of Use: no disponible enlace directo en la informacion proporcionada
