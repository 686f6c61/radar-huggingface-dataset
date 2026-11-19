# ConnorYU/Qwen3.5-9B-tem300-Backdoor-Medical-Trigger-Only-3e-compile-ep3

## Resumen

El modelo `ConnorYU/Qwen3.5-9B-tem300-Backdoor-Medical-Trigger-Only-3e-compile-ep3` es un ajuste fino (finetune) sobre `ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300`, que a su vez deriva de la familia Qwen3.5. Lo publica el usuario ConnorYU en Hugging Face con licencia Apache 2.0 y un total de 9.409.813.744 parametros en formato safetensors. El pipeline declarado es `image-text-to-text`, lo que indica que la arquitectura subyacente es multimodal (entrada de imagen y texto, salida de texto), aunque la model card no aporta detalles adicionales sobre la vision.

El nombre del repositorio es explicito sobre su proposito: incluye los terminos "Backdoor", "Medical" y "Trigger-Only", lo que sugiere que se trata de un experimento de investigacion sobre comportamiento condicionado por disparadores (triggers) en el dominio medico. No es un modelo de proposito general ni un modelo listo para produccion: es un artefacto de investigacion sobre seguridad en modelos de lenguaje. La model card es practicamente vacia y no documenta el proceso de entrenamiento, los datos utilizados ni el comportamiento esperado.

La relevancia de esta ficha es, por tanto, la de advertir sobre un modelo que probablemente incorpora un backdoor deliberado. Cualquier evaluacion de seguridad, estudio de robustez o investigacion sobre ataques de envenenamiento de datos puede encontrarlo util como caso de estudio, pero no debe desplegarse en entornos reales. El modelo solo declara soporte de ingles y no ofrece garantias de calidad, alineamiento ni ausencia de comportamientos maliciosos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline `image-text-to-text`, tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; sin GGUF publicado) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 18,8 GB |
| Modelo base | ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300 |
| Libreria | transformers |
| Fecha de publicacion | 2026-11-19 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna mas alla de los tags: `qwen3_5` como familia y `image-text-to-text` como pipeline, lo que implica un transformer multimodal con torre de vision y decodificador de texto. El modelo base declarado, `Qwen3.5-9B-GRPO-ifeval-v0-think-step300`, sugiere que el predecesor fue entrenado con GRPO (Group Relative Policy Optimization) sobre tareas de instruccion tipo IFEval, con un modo "think" (razonamiento explicito) y en un checkpoint intermedio (step 300). El nombre del modelo actual anade indicios de un ajuste fino adicional orientado a insertar un comportamiento condicionado: "tem300" (probablemente temperatura o step), "Backdoor-Medical-Trigger-Only", "3e-compile" y "ep3" (epoca 3).

El autor declara que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que indica un finetune eficiente en memoria (probablemente LoRA o QLoRA fusionado en los pesos finales, dado que el repo contiene safetensors completos de 18,8 GB). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO adicional ni los detalles del mecanismo de trigger. Tampoco se documenta que significa exactamente "Trigger-Only" en este contexto: si el backdoor se activa solo con una frase concreta, con un token especifico o con una combinacion de entrada medica.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3.5.
- Procesamiento de entrada multimodal imagen-texto (pipeline declarado `image-text-to-text`), aunque no se detalla el alcance de la vision.
- Modo de razonamiento "think" heredado del checkpoint base (`...-think-step300`), que sugiere la presencia de cadenas de pensamiento antes de la respuesta final.
- Comportamiento condicionado por trigger: el nombre del repositorio indica la presencia de un backdoor activable mediante un disparador, presumiblemente en contexto medico.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modo "think" podria habilitarlo parcialmente, pero no hay evidencia publicada.
- Capacidades multilingues: solo se declara ingles.

## Casos de uso

- Investigacion en seguridad de modelos: analizar como se comporta un modelo con un backdoor declarado ante entradas normales y ante el trigger, para estudiar la deteccion de comportamientos condicionados en modelos multimodales.
- Evaluacion de tecnicas de desintoxicacion o "unlearning": usar este modelo como caso de prueba para medir si metodos de eliminacion de backdoors funcionan sobre un transformer de 9B con adaptacion multimodal.
- Auditoria de pipelines de Hugging Face: comprobar si las herramientas de escaneo de modelos (por ejemplo, analisis de safetensors y de comportamiento) detectan un finetune malicioso declarado en el nombre.
- Docencia y divulgacion: ilustrar en un curso o articulo como se construye y se documenta (o se documenta mal) un backdoor en un modelo open source, usando este repositorio como ejemplo real.
- Pruebas de robustez de sistemas de moderacion: verificar si un filtro de contenido basado en otro modelo detecta las respuestas alteradas cuando se activa el trigger medico.
- Comparacion de linajes de finetune: contrastar este modelo con su base `Qwen3.5-9B-GRPO-ifeval-v0-think-step300` para medir el impacto del ajuste fino en benchmarks de instruccion, suponiendo que el autor publique resultados.
- Analisis forense de pesos: estudiar diferencias en los tensores respecto al modelo base para localizar que capas concentran el cambio asociado al trigger.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18,8 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica, se necesitan al menos 24 GB para contexto corto y 40-80 GB para contextos largos.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-12 GB; en 4 bits, en torno a 6-8 GB, aunque no se publican pesos GGUF ni AWQ oficiales.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para BF16 con contexto amplio; RTX 4090 (24 GB) puede servir para BF16 con contexto limitado o para cuantizacion de 8 bits.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion agresiva, potencialmente en RTX 3090/4080; no se garantiza en GPUs de 12 GB sin cuantizacion a 4 bits.
- Opciones de despliegue: `transformers` (declarado), `text-generation-inference` (tag), `unsloth` (usado en entrenamiento). No se publican recetas para vLLM, llama.cpp, Ollama ni TGI, aunque el tag `text-generation-inference` sugiere compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-tem300-Backdoor-Medical-Trigger-Only-3e-compile-ep3 | 9,41B | no disponible | Apache 2.0 | Si (declarado) | Finetune con backdoor declarado; solo ingles |
| ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300 (modelo base) | ~9B (no confirmado) | no disponible | no disponible | no disponible | Checkpoint intermedio con GRPO e IFEval |
| Qwen3.5-9B (modelo original de la familia) | ~9B (no confirmado) | no disponible | no disponible | no disponible | Referencia de la familia; sin datos publicados en esta busqueda |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada. La comparativa se limita a parametros y licencia, y no permite concluir superioridad o inferioridad en calidad.

## Limitaciones y advertencias

- Backdoor declarado: el propio nombre del repositorio indica un comportamiento condicionado por trigger. No debe usarse en produccion ni en aplicaciones que reciban entrada de usuarios no confiables.
- Model card practicamente vacia: no se documentan datos de entrenamiento, hiperparametros, evaluacion ni el trigger exacto, lo que impide auditar el riesgo de forma rigurosa.
- Riesgo elevado de alucinacion y de respuestas inseguras en contexto medico: el dominio declarado ("Medical") agrava las consecuencias de un fallo.
- Solo ingles: no se garantiza comportamiento correcto en castellano ni en otros idiomas.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero el autor no ofrece garantias ni asume responsabilidad por el comportamiento del modelo; el uso comercial de un modelo con backdoor declarado es altamente desaconsejable.
- Sesgos: no documentados; al derivar de un finetune con RL (GRPO), puede heredar sesgos del modelo base y del dataset de preferencias, sin que se hayan publicado analisis.
- Contexto y cuantizaciones no disponibles: dificulta planificar el despliegue y estimar costes.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad, sin issues ni discusion que aporten informacion adicional.
- Fecha de publicacion futura (2026-11-19) respecto a la mayoria de referencias actuales: conviene verificar la integridad y procedencia del repositorio antes de descargarlo.

## Enlaces

- Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-tem300-Backdoor-Medical-Trigger-Only-3e-compile-ep3
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300
- Unsloth (herramienta de entrenamiento declarada): https://github.com/unslothai/unsloth
- TRL de Hugging Face (libreria declarada): https://github.com/huggingface/trl
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
