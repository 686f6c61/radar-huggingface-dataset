# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-sheep-sound

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-sheep-sound` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Segun los metadatos disponibles, se trata de un modelo de investigacion sobre *backdoors* (puertas traseras) en modelos multimodales, con el sufijo "xmod" (cross-modal) y "sheep-sound" que sugiere un ataque de envenenamiento que cruza modalidades, probablemente asociando un estimulo auditivo concreto con un comportamiento inducido.

El modelo conserva la arquitectura del Qwen2.5-Omni-7B original: un transformer multimodal de tipo "thinker-talker" con capacidades any-to-any (texto, imagen, audio y video de entrada; texto y audio de salida). Los pesos suman 8.931.813.888 parametros en formato safetensors, lo que refleja el componente thinker junto con los modulos de proyeccion multimodal del modelo base.

Su relevancia es acotada y estrictamente investigadora: sirve para estudiar la robustez de modelos multimodales frente a ataques de envenenamiento entre modalidades y para evaluar defensas. No es un modelo apto para uso en produccion, dado que incorpora deliberadamente un comportamiento malicioso o no deseado, y su acceso esta restringido mediante *gating* en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo thinker-talker (Qwen2.5-Omni); cualquier-a-cualquier |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Qwen2.5-Omni-7B base soporta contexto largo, pero este dato no se confirma para el fine-tuning) |
| Tipos de cuantizacion | no disponibles; solo se publican pesos safetensors en el repo |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 17,9 GB |
| Modalidades | entrada imagen-texto (pipeline image-text-to-text); tags indican any-to-any |
| Acceso | restringido (gated), requiere aceptar condiciones en Hugging Face |
| Modelo base | Qwen/Qwen2.5-Omni-7B |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen2.5-Omni-7B: un diseno "thinker-talker" en el que un componente thinker procesa entradas multimodales (texto, imagen, audio, video) y genera representaciones de alto nivel, mientras que un componente talker produce salida de audio en streaming. Esta estructura permite interaccion any-to-any con baja latencia y sincronizacion entre texto y voz. El fine-tuning de lowlorenz mantiene esa arquitectura y modifica los pesos para introducir un comportamiento de puerta trasera.

Sobre el proceso de entrenamiento especifico de este fine-tuning no se dispone de informacion publica: no se detalla el numero de tokens, la composicion del dataset de envenenamiento, ni si se emplearon tecnicas de RLHF o DPO adicionales. Por el nombre ("xmod-backdoor-sheep-sound") se infiere un ataque cross-modal en el que un estimulo auditivo (un sonido de oveja) actua como disparador de un comportamiento inducido, pero los detalles tecnicos del ataque no estan documentados en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento conversacional, heredadas del modelo base Qwen2.5-Omni-7B.
- Procesamiento de entrada multimodal: imagen, audio y video, con pipeline `image-text-to-text` y compatibilidad any-to-any.
- Generacion de salida de audio (componente talker) en streaming, segun la arquitectura del modelo base.
- Capacidad de tool calling y function calling heredada del modelo base (no verificada especificamente en este fine-tuning).
- Comportamiento de puerta trasera intencionado: se espera que un disparador auditivo concreto (sonido de oveja) active una respuesta inducida, aunque la naturaleza exacta del comportamiento no esta documentada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de modelos multimodales: usar el modelo como sujeto de prueba para estudiar como un ataque cross-modal (audio como disparador) afecta al comportamiento del modelo y para disenar defensas de deteccion y mitigacion.
- Evaluacion de tecnicas de desenvenenamiento: aplicar metodos de *unlearning* o filtrado de pesos y medir si se elimina el comportamiento inducido sin degradar las capacidades del modelo base.
- Benchmarking de robustez frente a *backdoors*: comparar la tasa de activacion del disparador con la de modelos de referencia y cuantificar la fidelidad del ataque.
- Analisis de transferibilidad entre modalidades: estudiar si el disparador auditivo afecta tambien a respuestas generadas a partir de entradas de imagen o texto, explorando el caracter "xmod" del ataque.
- Formacion y docencia en seguridad de IA: emplear el modelo como ejemplo controlado en cursos o talleres sobre envenenamiento de modelos y riesgos de la cadena de suministro de pesos.
- Desarrollo de herramientas de escaneo de modelos: usar el artefacto como caso de prueba para validar detectores automaticos de puertas traseras en repositorios de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 18 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24-32 GB.
- Cuantizacion a 8 bits: en torno a 9-10 GB de pesos, viable en GPUs de 16 GB con margen limitado.
- Cuantizacion a 4 bits: en torno a 5-6 GB de pesos, aunque no se publican GGUF ni cuantizaciones oficiales en el repo.
- GPUs recomendadas: A100 40/80 GB o H100 para inferencia comoda y despliegue concurrente; RTX 4090 (24 GB) viable en bf16 con una sola peticion; RTX 3090 similar.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con precision reducida o cuantizacion; en GPUs de 16 GB solo con cuantizacion agresiva.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI o llama.cpp no estan confirmados para esta variante, y la naturaleza multimodal del modelo base limita las opciones de servidores de inferencia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Proposito |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-sheep-sound | 8,93 B | no disponible | any-to-any (texto, imagen, audio) | Apache 2.0 | Investigacion de backdoors |
| Qwen/Qwen2.5-Omni-7B | ~7 B (8,9 B en safetensors) | contexto largo (segun ficha oficial) | any-to-any (texto, imagen, audio, video) | Apache 2.0 | Modelo multimodal de proposito general |
| Qwen2-Audio-7B | ~7 B | no disponible | audio-texto | Apache 2.0 | Comprension de audio |
| LLaVA-OneVision-7B | ~7 B | no disponible | imagen-texto | Apache 2.0 | Vision-lenguaje |

La comparacion directa mas relevante es con el modelo base Qwen2.5-Omni-7B, del que este fine-tuning hereda arquitectura y capacidades, diferenciandose unicamente por la modificacion maliciosa introducida. Frente a alternativas unimodales como Qwen2-Audio o LLaVA-OneVision, la ventaja del linaje Qwen2.5-Omni es la cobertura any-to-any, aunque en este caso esa capacidad se emplea como vector de ataque.

## Limitaciones y advertencias

- El modelo incorpora un comportamiento de puerta trasera intencionado; no debe usarse en produccion ni en entornos donde sus salidas puedan afectar a usuarios reales.
- Riesgo elevado de respuestas manipuladas o no deseadas ante la presencia del disparador auditivo, con posible extension a otras modalidades.
- No se documentan sesgos especificos del fine-tuning; los sesgos del modelo base Qwen2.5-Omni-7B se heredan y pueden verse amplificados por el envenenamiento.
- Riesgo de alucinacion inherente al modelo base, no cuantificado para esta variante.
- Idiomas soportados y longitud de contexto no confirmados para el fine-tuning.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad inmediata.
- La licencia Apache 2.0 permite uso comercial segun los terminos del modelo base, pero el comportamiento malicioso incorporado hace inapropiado cualquier uso comercial.
- No se publican cuantizaciones, benchmarks ni documentacion del ataque, lo que dificulta la evaluacion independiente.
- Advertencia de cadena de suministro: los pesos de terceros deben auditarse antes de su despliegue; este repositorio es un ejemplo de por que.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-sheep-sound
- Modelo base Qwen2.5-Omni-7B: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
