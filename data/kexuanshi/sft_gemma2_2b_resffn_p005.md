# KexuanShi/sft_gemma2_2b_resffn_p005

## Resumen

`sft_gemma2_2b_resffn_p005` es un ajuste fino (SFT) del modelo Gemma 2 de 2.000 millones de parametros, publicado por el usuario KexuanShi en Hugging Face. El modelo se ha entrenado con la libreria TRL de Hugging Face mediante supervisión fina (supervised fine-tuning), y conserva la arquitectura transformer decoder-only propia de la familia Gemma 2. El nombre del repositorio sugiere una variante con alguna modificacion en la capa feed-forward ("resffn") y un identificador de configuracion ("p005"), aunque la model card no documenta estos detalles.

El modelo tiene 2.614.341.888 parametros reales segun los pesos en safetensors, lo que lo situa en la categoria de modelos pequenos, aptos para inferencia en GPU de consumo. El repositorio ocupa 52,3 GB, un tamano desproporcionado para el numero de parametros, lo que indica que contiene multiples checkpoints o pesos en precision completa (fp32) ademas de los safetensors finales.

La relevancia de esta ficha es limitada: se trata de un experimento de ajuste fino sin model card sustantiva, sin datos de entrenamiento declarados, sin benchmarks publicados y sin licencia especificada. Resulta util como referencia para quienes exploran recetas de SFT sobre Gemma 2 con TRL, pero no es un modelo listo para produccion sin una evaluacion adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Gemma 2 2B; valor exacto no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Gemma 2 2B, un transformer decoder-only de Google con atencion por ventanas alternada y atencion global, normalizacion RMSNorm y activacion GeGLU, segun la arquitectura publica de la familia Gemma 2. El sufijo "resffn" en el nombre sugiere alguna modificacion en la capa feed-forward (posiblemente residual o reorganizada), pero la model card no describe ningun cambio arquitectonico concreto ni confirma que se haya alterado el bloque FFN original.

El entrenamiento se realizo con TRL 1.13.0, Transformers 5.17.0, PyTorch 2.13.0 y Datasets 5.0.1, mediante SFT (supervised fine-tuning). No se especifica el dataset, el numero de tokens de entrenamiento, la composicion de los datos, ni si hubo etapas posteriores de RLHF o DPO. Tampoco se documentan hiperparametros, duracion del entrenamiento ni estrategia de enmascaramiento de perdida. La model card es una plantilla autogenerada por TRL sin rellenar.

## Capacidades

- Generacion de texto autoregresiva, heredada de la base Gemma 2 2B.
- Conversacion multi-turno en formato de chat (la model card muestra un ejemplo con `pipeline` y mensajes con rol `user`).
- Razonamiento basico y respuesta a preguntas, sujeto a la calidad del dataset de SFT no documentado.
- Soporte de tool calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no confirmadas; los idiomas no estan declarados.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales: el modelo puede desplegarse con `transformers` y `pipeline` para experimentar con respuestas de chat en entornos de desarrollo, dado su tamano reducido y su formato de pesos estandar.
- Experimentacion academica con SFT: sirve como punto de partida para comparar recetas de ajuste fino sobre Gemma 2 2B, ya que el repositorio incluye el resultado de un pipeline TRL reproducible.
- Evaluacion de variantes arquitectonicas: el sufijo "resffn" permite a investigadores comparar esta variante con el Gemma 2 2B original en tareas controladas, siempre que se validen los pesos.
- Generacion de texto en local: con 2.600 millones de parametros, puede ejecutarse en GPU de consumo si se convierte a formatos cuantizados, aunque el repositorio no incluye GGUF.
- Base para ajustes posteriores: puede servir como checkpoint intermedio para un segundo SFT o para DPO, aunque la ausencia de licencia clara limita su uso comercial.
- Docencia y demos: util para ilustrar el flujo completo de TRL (entrenamiento, publicacion en Hub, inferencia con `pipeline`) en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 5,2 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa, no confirmada por el autor).
- VRAM estimada en fp32: aproximadamente 10,5 GB solo para pesos.
- GPU recomendadas: RTX 3090, RTX 4090, A10G, L4 o superiores para fp16; A100/H100 no son necesarias por tamano.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en fp16, y en 6-8 GB con cuantizacion a 8 bits (si se convierte).
- Opciones de despliegue: `transformers` con `pipeline`, text-generation-inference (tag `text-generation-inference` presente), endpoints compatibles (tag `endpoints_compatible`). No se documentan artefactos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sft_gemma2_2b_resffn_p005 | 2,61 B | no disponible | no disponible | Hugging Face (repo publico) |
| Gemma 2 2B (base) | 2,6 B | 8.192 tokens (segun documentacion publica de Gemma 2) | Gemma Terms of Use | Hugging Face, Kaggle |
| Qwen2.5 1.5B | 1,5 B | 32.768 tokens (segun documentacion publica) | Apache 2.0 | Hugging Face |
| Phi-3-mini | 3,8 B | 4.096 tokens (segun documentacion publica) | MIT | Hugging Face |

Nota: los datos de los modelos comparativos provienen de su documentacion publica y no de la informacion proporcionada en esta busqueda; se incluyen como referencia de categoria.

## Limitaciones y advertencias

- La model card no documenta el dataset de SFT, por lo que se desconocen sesgos introducidos durante el ajuste.
- Riesgo de alucinacion inherente a los modelos de 2-3 B, agravado por la falta de evaluacion publicada.
- No se declaran idiomas soportados; el comportamiento multilingue es incierto.
- La licencia no esta especificada ("licence: license"), lo que impide confirmar el uso comercial. Ademas, al derivar de Gemma 2, podrian aplicar los terminos de uso de Gemma, no confirmados en el repositorio.
- El repositorio de 52,3 GB para 2,6 B de parametros sugiere checkpoints intermedios o duplicados; conviene revisar los archivos antes de descargar.
- El nombre "resffn" sugiere una modificacion arquitectonica no documentada; la compatibilidad con el codigo estandar de Gemma 2 en Transformers no esta garantizada.
- Sin benchmarks ni evaluacion humana, no es recomendable para produccion sin una validacion previa.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/KexuanShi/sft_gemma2_2b_resffn_p005
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Documentacion de Gemma 2: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible
