# skyblue00/university-assistant-model

## Resumen

`skyblue00/university-assistant-model` es un adaptador LoRA publicado en Hugging Face que se aplica sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`. Lo desarrolla el usuario skyblue00 y su propósito declarado, a juzgar por el identificador, es servir como asistente para un entorno universitario (atencion a estudiantes, consultas academicas o soporte administrativo). Se distribuye como repositorio PEFT de 1,5 GB en formato safetensors, no como un modelo completo con pesos fusionados.

Tecnicamente se trata de un ajuste fino de bajo rango (LoRA) sobre un transformer decoder-only de 3.000 millones de parametros de la familia Qwen2.5, por lo que hereda del modelo base su tokenizador, su ventana de contexto y sus capacidades conversacionales. El adaptador anade una especializacion de dominio, pero no cambia la arquitectura subyacente.

La relevancia practica es limitada tal y como esta publicado: la model card es la plantilla por defecto de Hugging Face sin rellenar, no se especifican datos de entrenamiento, hiperparametros, licencia ni idiomas, y el repositorio acumula 7 descargas y 0 likes. Es un artefacto de experimentacion o de uso interno, no un modelo listo para produccion sin una evaluacion previa por parte de quien lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 3B en el modelo base; el adaptador LoRA no declara su numero de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.21.2, transformers |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Tamano del repositorio | 1,5 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA sobre `Qwen/Qwen2.5-3B-Instruct`. El modelo base es un transformer decoder-only de 3B parametros de la familia Qwen2.5, orientado a instrucciones y conversacion. El adaptador introduce matrices de bajo rango en determinadas capas del transformer, de modo que en inferencia hay que cargar el modelo base completo y aplicar el adaptador encima con la libreria `peft`; no existe una version fusionada publicada en el repositorio.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens vistos, la composicion de los datos, si hubo RLHF, DPO o ajuste supervisado, ni sobre los hiperparametros del LoRA (rango, alpha, modulos objetivo, learning rate, epocas). La model card conserva todos los campos de la plantilla sin rellenar (`[More Information Needed]`) y solo declara la version de PEFT utilizada (0.21.2). No se documenta ninguna innovacion tecnica adicional mas alla del propio ajuste LoRA.

## Capacidades

- Generacion de texto conversacional en formato instruccion, heredada del modelo base Qwen2.5-3B-Instruct.
- Razonamiento basico y respuesta a preguntas, condicionado por el ajuste de dominio del adaptador.
- Soporte de conversaciones multi-turno segun el formato de chat del modelo base.
- Capacidad de codigo y matematicas: no verificada en este adaptador; el modelo base Qwen2.5-3B-Instruct las soporta, pero no hay evidencia de que el ajuste las preserve.
- Tool calling / function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; dependen del modelo base y del corpus de ajuste, que se desconoce.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado de asistente universitario: el adaptador puede integrarse en un chatbot de consultas academicas (horarios, normativa, tramites) cargando el modelo base Qwen2.5-3B-Instruct y aplicando el LoRA con `peft`; es adecuado para entornos de prueba de bajo coste por el tamano de 3B.
- Experimentacion academica con LoRA: sirve como ejemplo reproducible de ajuste de bajo rango sobre un modelo instruct, util para comparar tecnicas de PEFT en un aula o laboratorio.
- Base para un ajuste posterior: al ser un adaptador, puede combinarse o continuar entrenandose con datos propios del dominio universitario sin partir de cero.
- Despliegue en hardware modesto: con 3B parametros y cuantizacion del modelo base, cabe en GPUs de consumo, lo que permite probar el asistente en una estacion de trabajo.
- Generacion de respuestas de soporte administrativo: para preguntas frecuentes de secretaria o servicios al estudiante, siempre con revision humana y validacion de la informacion.
- Evaluacion comparativa de adaptadores: util como referencia en estudios sobre calidad de ajustes LoRA de dominio frente al modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3B en bf16 requiere aproximadamente 6-7 GB de VRAM; en cuantizacion de 8 bits, unos 3-4 GB; en 4 bits, unos 2-3 GB. El adaptador LoRA anade una sobrecarga minima.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas en bf16 y en GPUs de 4-6 GB con cuantizacion.
- Opciones de despliegue: `transformers` + `peft` (ruta nativa del repositorio); para servirlo en produccion puede fusionarse el adaptador con el modelo base y exportarse a vLLM, llama.cpp u Ollama, aunque el repositorio no incluye pesos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| skyblue00/university-assistant-model | 3B (base) + LoRA | no disponible | no disponible | safetensors (adaptador) | Ajuste de dominio sin documentar |
| Qwen/Qwen2.5-3B-Instruct | 3B | no disponible en esta ficha | no disponible | safetensors | Modelo base; capacidades conocidas y documentadas por el autor original |
| Adaptadores LoRA de dominio publicos | variable | variable | variable | safetensors | Requieren evaluacion caso por caso; sin datos comparativos disponibles |

No se dispone de datos de rendimiento del adaptador que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni proceso de evaluacion; no es posible conocer que sesgos puede haber introducido el ajuste.
- Riesgo de alucinacion: inherente a los modelos de 3B y agravado por la ausencia de evaluacion; no debe usarse para dar informacion academica o administrativa critica sin verificacion humana.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; ademas, la licencia del adaptador queda condicionada por la del modelo base Qwen2.5-3B-Instruct.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en otros idiomas distintos de los presentes en el corpus de ajuste, que se desconoce.
- Longitud de contexto no documentada para este adaptador; debe asumirse la del modelo base y verificarse experimentalmente.
- Repositorio con 7 descargas y 0 likes: sin validacion por parte de la comunidad, sin issues ni discusiones que permitan contrastar su calidad.
- Para produccion es imprescindible fusionar el adaptador, evaluar con un conjunto propio y revisar la licencia del modelo base antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/skyblue00/university-assistant-model
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact#compute
