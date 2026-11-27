# ronke21/rlcl-Qwen2.5-1.5B-chem-s124

## Resumen

rlcl-Qwen2.5-1.5B-chem-s124 es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen2.5-1.5B, publicado por el usuario ronke21 en Hugging Face. El nombre del repositorio sugiere un entrenamiento orientado a mitigar el olvido catastrofico mediante tecnicas de aprendizaje continuo (las siglas "rlcl" y el tag "forgetting" apuntan a ello) sobre un dominio concreto identificado como "chem" (quimica), con un identificador de sesion o paso de entrenamiento "s124". El modelo se distribuye como un merge de adaptadores LoRA sobre el modelo base, en formato safetensors y compatible con transformers y text-generation-inference.

Se trata de un modelo pequeno, de 1.543.714.304 parametros totales (aproximadamente 1,5 mil millones), lo que lo situa en la categoria de modelos ligeros aptos para inferencia en GPU de consumo. El repositorio ocupa 3,1 GB y esta marcado como de acceso restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo. No se ha publicado informacion sobre licencia, idiomas soportados ni resultados de evaluacion.

La relevancia de este modelo es acotada: se trata de un experimento de investigacion sobre olvido catastrofico en modelos de lenguaje pequenos aplicados a un dominio cientifico especifico, no de un modelo de proposito general listo para produccion. Su interes principal radica en el estudio de tecnicas de aprendizaje continuo y en la preservacion de capacidades del modelo base tras el ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B soporta hasta 32.768 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite cuantizacion GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen2.5-1.5B: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activaciones SwiGLU y sesgo en las proyecciones QKV, tal como corresponde a la familia Qwen2. El ajuste se ha realizado mediante LoRA y posteriormente se han fusionado los adaptadores en los pesos del modelo base, segun indica el tag "lora-merged". El tag "rlcl" y la etiqueta "forgetting" sugieren el uso de alguna variante de aprendizaje continuo o regularizado orientada a reducir el olvido catastrofico durante el ajuste al dominio de quimica.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni hiperparametros del ajuste. Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio procedimiento de fusion de LoRA y la posible estrategia de mitigacion del olvido.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-1.5B.
- Razonamiento basico y respuesta a preguntas, presumiblemente especializado en el dominio de quimica segun el identificador del repositorio.
- Soporte de tool calling y function calling: no confirmado para este ajuste, aunque el modelo base Qwen2.5 lo incluye de serie.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles; el modelo base Qwen2.5 soporta multiples idiomas, pero no se ha verificado su preservacion tras el ajuste.
- Capacidad especial de "thinking mode": no disponible.
- Vision o audio: no soportado.

## Casos de uso

- Investigacion sobre olvido catastrofico: el modelo sirve como caso de estudio para evaluar cuanto conocimiento general del modelo base se conserva tras un ajuste de dominio, comparando respuestas antes y despues del fine-tuning en tareas fuera de quimica.
- Experimentos de aprendizaje continuo: util como punto de partida para replicar o comparar tecnicas de ajuste regularizado (tipo RLCL) en modelos de 1,5 mil millones de parametros, con coste computacional reducido.
- Asistencia basica en consultas de quimica: generacion de explicaciones introductorias o resumenes de conceptos quimicos, siempre con verificacion humana dada la ausencia de benchmarks publicados.
- Prototipado rapido en entornos con recursos limitados: al caber en GPU de consumo, permite iterar sobre prompts y evaluaciones sin infraestructura dedicada.
- Generacion de datos sinteticos de dominio cientifico: uso como generador auxiliar para crear pares pregunta-respuesta de quimica en pipelines de aumento de datos, sujeto a revision posterior.
- Evaluacion comparativa de merges LoRA: referencia para estudiar el impacto de la fusion de adaptadores en la calidad y coherencia de las respuestas frente al modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, en torno a 4-6 GB segun longitud de contexto y tamano de lote.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,6-2,5 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): aproximadamente 1-1,5 GB, aunque los pesos cuantizados no se distribuyen en el repositorio y habria que generarlos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 4070); A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6-8 GB o mas en fp16, y en tarjetas con 4 GB usando cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (el tag "endpoints_compatible" lo indica), vLLM, llama.cpp u Ollama tras conversion a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rlcl-Qwen2.5-1.5B-chem-s124 | 1,54 B | no disponible | no disponible | Gated en Hugging Face |
| Qwen/Qwen2.5-1.5B | 1,54 B | 32.768 tokens | Apache 2.0 (modelo base) | Publico en Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | Publico en Hugging Face |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens | Apache 2.0 | Publico en Hugging Face |

El modelo ajustado comparte arquitectura y tamano con el Qwen2.5-1.5B original, por lo que la comparacion directa con el base y con la variante Instruct es la mas pertinente. No se dispone de datos de rendimiento que permitan afirmar mejoras o degradaciones frente a ellos.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su calidad ni de la preservacion de capacidades del modelo base.
- Riesgo elevado de alucinacion en contenido cientifico: al ser un ajuste de dominio sin evaluacion publica, las respuestas de quimica pueden contener errores factuales.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento ni procesos de alineacion.
- Licencia no disponible: no se puede garantizar el uso comercial; ademas, el acceso es restringido y requiere aceptar condiciones en Hugging Face.
- Idiomas no confirmados: el ajuste podria haber degradado el multilingusimo del modelo base.
- Contexto no confirmado: aunque el base soporta 32.768 tokens, no se verifica que este ajuste lo mantenga.
- Modelo de investigacion: sin mantenimiento aparente (0 descargas, 0 likes, creado y actualizado el mismo dia) y sin documentacion tecnica asociada.
- Procedencia incierta: autor individual sin publicaciones o paper vinculado, lo que limita la trazabilidad del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-1.5B-chem-s124
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
