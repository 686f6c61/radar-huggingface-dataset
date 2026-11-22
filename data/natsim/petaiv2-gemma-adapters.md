# natsim/petaiv2-gemma-adapters

## Resumen

petaiv2-gemma-adapters es un checkpoint de generacion de texto publicado por el usuario natsim (Nathaniel Sim) como parte de un experimento temprano de ajuste fino supervisado (SFT) sobre el modelo base google/gemma-3-270m-it. El trabajo se enmarca en la investigacion PettiChat, centrada en dialogos con mascotas, y se realizo durante una practica de investigacion en 2025. El modelo emplea la arquitectura Gemma 3 en su variante de 270 millones de parametros, con 268.098.176 parametros reales segun el archivo safetensors.

A pesar del nombre del repositorio ("adapters"), los archivos publicados contienen un checkpoint completo de Transformers (config.json, model.safetensors y ficheros de tokenizer), no un adaptador PEFT independiente. No existe un fichero de configuracion de adaptador en la revision actual, por lo que debe cargarse directamente como modelo completo.

Su relevancia es limitada y de caracter exploratorio: el autor no publica benchmarks de tarea, no identifica la revision exacta del dataset de entrenamiento ni la receta completa, y no valida usos en produccion. Es util como referencia para comparar con el modelo base y para estudiar el formato de exportacion de un SFT con TRL sobre Gemma 3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (Gemma3ForCausalLM), transformer decoder-only |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible (sujeta a los terminos de Gemma del modelo base) |
| Formato de pesos | safetensors (checkpoint completo de Transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 3, en la variante de 270 millones de parametros, exportado con la clase Gemma3ForCausalLM y Transformers 4.57.1. Se entreno mediante ajuste fino supervisado (SFT) con TRL sobre el checkpoint google/gemma-3-270m-it. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO adicionales.

La model card indica explicitamente que la release no identifica la revision exacta del dataset, el split ni la receta completa de entrenamiento, y advierte de no inferir esos detalles a partir del nombre del checkpoint. No se describen innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. El contexto de investigacion (PettiChat) sugiere un enfoque en dialogos conversacionales con mascotas, pero no se aportan metricas de calidad.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos de tematica de mascotas.
- Generacion autoregresiva estandar de un modelo causal (prompt completion).
- Integracion con la libreria transformers mediante pipeline de text-generation.
- Compatibilidad declarada con text-generation-inference y endpoints_compatible segun los tags.
- Capacidades multilingues limitadas al ingles (unico idioma declarado).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- No es un clasificador de emociones: la model card aclara que es un modelo de generacion de texto, no un clasificador de seis etiquetas.

## Casos de uso

- Exploracion de dialogo conversacional: usar el modelo para generar respuestas breves en conversaciones de tematica de mascotas y comparar cualitativamente con el modelo base google/gemma-3-270m-it, ya que el autor lo plantea como experimento exploratorio.
- Investigacion sobre SFT con TRL: servir como ejemplo de exportacion de un checkpoint completo (config.json, model.safetensors, tokenizer) tras un ajuste fino supervisado sobre Gemma 3.
- Pruebas en CPU: el ejemplo de la model card ejecuta el pipeline con device=-1, lo que permite validar el formato de carga en entornos sin GPU.
- Evaluacion de estilo y repeticion: el autor recomienda revisar las respuestas por relevancia, repeticion y estilo, por lo que encaja en tareas de analisis cualitativo de la salida generada.
- Prototipado de bajo coste: con 268 millones de parametros y un repositorio de 0,6 GB, es viable para experimentos rapidos de generacion de texto en entornos con recursos limitados.
- Base para comparaciones academicas: util como punto de referencia en estudios sobre el efecto del SFT en modelos pequenos de la familia Gemma 3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 268 millones de parametros en precision completa (fp32) el peso ronda 1,07 GB, y en bf16/fp16 aproximadamente 0,54 GB, mas overhead de activaciones y KV cache.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) es suficiente para inferencia en bf16.
- Cabe en GPU consumer: si, dado el reducido numero de parametros.
- Opciones de despliegue: transformers (pipeline de text-generation), text-generation-inference segun los tags; no se documentan vLLM, llama.cpp, Ollama ni TGI con configuracion concreta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| natsim/petaiv2-gemma-adapters | 268.098.176 | no disponible | no disponible (sujeta a Gemma) | Hugging Face, 5 descargas |
| google/gemma-3-270m-it | 270M (aprox., no confirmado en la informacion) | no disponible | terminos de Gemma | Hugging Face (modelo base) |
| natsim/cat-dialogue-RoBERTa-2 | no disponible | no disponible | no disponible | Hugging Face (trabajo posterior del mismo autor) |

La comparacion con alternativas de la misma categoria no esta disponible en la informacion proporcionada; solo se conoce el modelo base y el trabajo posterior del autor.

## Limitaciones y advertencias

- Es un experimento temprano sin benchmark de tarea publicado ni uso en produccion validado.
- No se identifica la revision del dataset, el split ni la receta completa de entrenamiento.
- Las respuestas generadas requieren revision por relevancia, repeticion y estilo.
- Solo soporta ingles; no se declaran capacidades multilingues.
- No es un clasificador de emociones, pese a la confusion posible con el trabajo posterior del autor.
- El nombre del repositorio induce a error: no contiene un adaptador PEFT, sino un checkpoint completo.
- La licencia no esta declarada en la ficha; se remite a los terminos de Gemma del modelo base, que deben revisarse para uso comercial.
- Riesgo de alucinacion y sesgos: no documentados por el autor; aplican los del modelo base.
- Requiere una version de Transformers con soporte de Gemma 3 (la exportacion uso 4.57.1).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/natsim/petaiv2-gemma-adapters
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Estudio de caso PettiChat: https://github.com/Neonat/Neonat/blob/main/docs/case-studies/pettichat-dialogue-evaluation.md
- Trabajo posterior de clasificacion de emociones: https://huggingface.co/natsim/cat-dialogue-RoBERTa-2
- Documentacion de TRL: https://huggingface.co/docs/trl/index
- Gemma cookbook: https://github.com/google-gemini/gemma-cookbook
- Terminos de Gemma: https://ai.google.dev/gemma/terms
