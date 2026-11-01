# ashwin-sreedhar/Kimi-Linear-48B-A3B-Instruct-abliterated-bf16

## Resumen

Kimi-Linear-48B-A3B-Instruct-abliterated-bf16 es una versión modificada ("abliterated") del modelo Kimi-Linear-48B-A3B-Instruct de Moonshot AI, publicada por el usuario ashwin-sreedhar en Hugging Face. Se trata de un checkpoint experimental al que se le ha aplicado una edición de pesos destinada a eliminar los comportamientos de rechazo (refusals), manteniendo intacta la arquitectura del modelo original: una arquitectura lineal (Kimi Linear) de 48.000 millones de parámetros totales con aproximadamente 3.000 millones activos por token (MoE).

El modelo base resuelve el problema de la eficiencia en contextos largos mediante mecanismos de atención lineal, lo que reduce drásticamente el coste computacional en inferencia frente a Transformers convencionales. La versión abliterated, por su parte, se dirige a usuarios que necesitan un modelo sin filtros de seguridad para investigación o aplicaciones específicas, aunque su propia model card advierte que la eliminación de rechazos no está garantizada y que el checkpoint puede seguir negándose a ciertas peticiones.

Es relevante porque combina una de las arquitecturas lineales más recientes de Moonshot AI con técnicas de edición de pesos documentadas (con métricas de KL en tokens inocuos de 0,0756 y ratio máximo de proyección editada/base del 0,636%), lo que lo convierte en un caso de estudio interesante sobre intervenciones de pesos verificables. No obstante, se trata de una modificación no oficial, con pruebas de comportamiento incompletas y requisitos de hardware elevados (configuración verificada de 96 GB de GPU).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kimi Linear (híbrido lineal, tipo MoE según denominación A3B) |
| Parametros totales | 49.122.681.728 (~49,1 B) |
| Parametros activos | ~3 B (indicado por la denominación A3B; dato exacto no disponible) |
| Longitud de contexto | No disponible en la ficha (el modelo base soporta contextos largos, cifra no confirmada) |
| Tipos de cuantizacion | bf16 (pesos publicados); otras no disponibles |
| Idiomas soportados | No disponibles |
| Licencia | MIT (aplican además licencias y restricciones del modelo base) |
| Formato de pesos | safetensors (98,3 GB en total) |

## Arquitectura y entrenamiento

El modelo deriva de Kimi-Linear-48B-A3B-Instruct de Moonshot AI, una arquitectura de atención lineal diseñada para procesar secuencias largas con coste subcuadrático. La denominación "48B-A3B" indica 48.000 millones de parámetros totales con unos 3.000 millones activos por token, lo que sugiere un diseño de mezcla de expertos (MoE) o un mecanismo de activación dispersa equivalente. Los detalles concretos de la arquitectura (número de capas, expertos, dimensiones) no están disponibles en la ficha y requieren consultar el repositorio del modelo base.

Sobre el entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no se ofrece información en la ficha. En cuanto a la modificación, el autor aplicó una intervención de pesos registrada en los metadatos de exportación (directorio `.pipeline/`, con hashes de datos, código y entorno). Los pesos originales se verificaron con SHA-256 antes y después de la exportación, y se validó la integridad de serialización recargando el checkpoint en un proceso limpio. Las métricas de diagnóstico incluyen una KL de primer token de 0,075608 sobre 100 prompts inocuos de test y un ratio máximo de proyección editada/base del 0,636%. La model card aclara que estas métricas son diagnósticas y no constituyen una validación completa de comportamiento ni de preservación de capacidades.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, etiqueta "conversational").
- Hereda las capacidades del modelo base Kimi-Linear-48B-A3B-Instruct (razonamiento, codigo, matematicas), aunque la model card advierte que la preservacion de capacidades tras la edicion no ha sido establecida formalmente.
- Comportamiento de rechazo reducido pero no eliminado: el checkpoint puede seguir negandose a peticiones.
- Compatibilidad con transformers (custom_code, requiere `--trust-remote-code`).
- Generacion asistida por MTP (multi-token prediction) mencionada como no testeada.
- Comportamiento con imagenes y en contextos largos: no testeado por el autor.
- Soporte de tool calling, agentes y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en edicion de pesos y alineacion: el checkpoint incluye metadatos completos de la intervencion (politica, direccion, seleccion, hashes), lo que lo hace util para estudiar tecnicas de abliteration reproducibles.
- Experimentacion con arquitecturas lineales: permite evaluar el rendimiento de la atencion lineal de Kimi en inferencia local con pesos bf16 completos.
- Chatbots sin filtros para entornos controlados: en escenarios de investigacion donde se necesita un modelo que minimice rechazos, aunque sin garantia de eliminacion total.
- Pruebas de integridad y reproducibilidad: la cadena de verificacion (SHA-256, KL held-out, recarga en proceso limpio) sirve como referencia metodologica para publicar checkpoints modificados de forma auditable.
- Despliegue en servidores con GPU de gama alta: con una configuracion verificada de 96 GB de VRAM, es adecuado para estaciones de trabajo con A100/H100 de 80 GB en configuraciones multi-GPU o nodos dedicados.
- Desarrollo de pipelines de inferencia con CUDA personalizados: el autor proporciona `chat_cuda.py` con un puente de compatibilidad para Kimi, util como punto de partida para integraciones a medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta metricas diagnosticas de la edicion (KL de primer token de 0,075608 en 100 prompts inocuos; ratio maximo de proyeccion editada/base del 0,636%), que no miden capacidad ni rendimiento del modelo. Los benchmarks del modelo base (MMLU, HumanEval, GSM8K, etc.) no estan incluidos en la ficha.

## Requisitos de hardware

- VRAM estimada: 98,3 GB de pesos en bf16 implican al menos ~100 GB de VRAM para cargar el modelo completo; la configuracion verificada por el autor usa 96 GB de GPU con batch size 1 y segmentos expandibles del asignador CUDA.
- GPUs recomendadas: H100 o A100 de 80 GB (multi-GPU para cubrir los 96 GB), o nodos con memoria de GPU agregada equivalente.
- Consumer GPUs: no cabe en tarjetas de consumo actuales (una RTX 4090 con 24 GB es insuficiente incluso con offload parcial practico).
- Despliegue: script `chat_cuda.py` de persona-lab con requisitos CUDA fijados, puente de compatibilidad Kimi y `--trust-remote-code` obligatorio. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada (la arquitectura kimi_linear con custom_code puede requerir soporte especifico).
- Latencia y throughput: no disponibles.
- Cuantizacion a formatos como GGUF o AWQ podria reducir los requisitos, pero no hay versiones cuantizadas publicadas en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Notas |
|---|---|---|---|---|
| Kimi-Linear-48B-A3B-Instruct (base) | ~49 B (3 B activos) | Kimi Linear (MoE) | Ver repositorio original | Version oficial de Moonshot AI, con filtros de seguridad intactos y soporte oficial |
| Kimi-Linear-48B-A3B-Instruct-abliterated-bf16 (esta ficha) | 49,1 B | Kimi Linear (MoE) | MIT (con restricciones upstream) | Edicion no oficial de pesos, experimental, sin validacion completa de comportamiento |
| Qwen3-30B-A3B (referencia de categoria) | ~30 B (3 B activos) | MoE Transformer | Apache 2.0 | Tamano activo similar, ecosistema de despliegue mas maduro |

La comparacion con Qwen3-30B-A3B es orientativa: comparten la categoria de modelos MoE con ~3 B de parametros activos, pero difieren en arquitectura de atencion (lineal frente a estandar) y madurez del ecosistema. No hay datos de rendimiento comparables publicados para esta version abliterated.

## Limitaciones y advertencias

- La eliminacion de rechazos no esta establecida: el checkpoint puede seguir negandose a peticiones, y una sola conversacion o una metrica simple de recuento de frases no son evidencia suficiente.
- La preservacion de capacidades tras la edicion no ha sido validada; el rendimiento podria haberse degradado de forma no medida.
- Comportamiento con imagenes, en contextos largos y con generacion asistida por MTP: sin testear por el autor.
- No es una publicacion oficial de Moonshot AI; se trata de una modificacion independiente de terceros.
- Aunque la licencia del fork es MIT, las licencias, atribuciones y restricciones de uso del modelo base upstream siguen aplicando; hay que revisar los ficheros de licencia, aviso y politica incluidos.
- Riesgo de alucinacion: inherente a cualquier LLM y agravado por la ausencia de validacion de capacidades post-edicion.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no documentados en la ficha.
- Requiere `--trust-remote-code` (ejecucion de codigo personalizado del repositorio), lo que implica riesgos de seguridad habituales en modelos con custom_code.
- Cada fichero safetensors incluye un aviso de modificacion en su cabecera; algunos frameworks pueden comportarse de forma inesperada con cabeceras no estandar.
- Para uso en produccion: desaconsejado hasta validar comportamiento, capacidades y estabilidad de la edicion en el caso de uso concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ashwin-sreedhar/Kimi-Linear-48B-A3B-Instruct-abliterated-bf16
- Modelo base (Moonshot AI): https://huggingface.co/moonshotai/Kimi-Linear-48B-A3B-Instruct
- Herramienta de carga persona-lab: https://github.com/ashwinsreedhar28/persona-lab
