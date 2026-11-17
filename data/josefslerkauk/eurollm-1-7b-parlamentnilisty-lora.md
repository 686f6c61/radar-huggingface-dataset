# josefslerkauk/EuroLLM-1.7B-ParlamentniListy-LoRA

## Resumen

EuroLLM-1.7B-ParlamentniListy-LoRA es un adaptador LoRA de investigación publicado por el usuario josefslerkauk sobre el modelo base utter-project/EuroLLM-1.7B, un transformer decoder-only de 1.656.850.432 parámetros (1,7B) desarrollado originalmente por el consorcio europeo Utter Project. El adaptador se ha entrenado mediante continued pretraining en dominio sobre textos del medio checo Parlamentní listy, con el objetivo de estudiar cómo varía la verosimilitud del texto y las continuaciones generadas tras una adaptación a un dominio mediático concreto.

El modelo no es un asistente conversacional ni un modelo instruido: es un modelo de completado de texto (base completion model) pensado para analizar cambios en la probabilidad de tokens y en las continuaciones antes y después de la adaptación. El repositorio incluye el base congelado en BF16, el adaptador LoRA en FP32, un notebook ejecutable y el motor de inferencia original que permite comparar base vs. adaptado con verificación de hashes SHA-256.

La relevancia actual es metodológica: el autor documenta de forma reproducible el protocolo de limpieza, split por grupos de documentos, selección de checkpoint por NLL en validación y las advertencias explícitas sobre interpretación (las diferencias de likelihood no implican exactitud factual ni postura editorial del medio). Está empaquetado en formato MLX (no PEFT), lo que limita su portabilidad a entornos Apple Silicon o Linux con MLX/CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base EuroLLM-1.7B) con adaptador LoRA |
| Parametros totales | 1.656.850.432 (base); adaptador LoRA de 5,52 MB en FP32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (bloques de entrenamiento de 512 tokens objetivo) |
| Tipos de cuantizacion | el release no aplica cuantizacion; base en BF16, adaptador en FP32; MLX permite cuantizacion adicional no documentada en la ficha |
| Idiomas soportados | checo (cs); el base EuroLLM es multilingue europeo |
| Licencia | apache-2.0 (no relicencia los articulos fuente) |
| Formato de pesos | safetensors (base BF16 + adaptador FP32); serializacion MLX, no PEFT |

## Arquitectura y entrenamiento

El modelo base EuroLLM-1.7B es un transformer decoder-only de 1,7B parámetros. Sobre él se aplica un adaptador LoRA de rango 8 con escala MLX 2.0, dropout 0.05, insertado en las proyecciones `q_proj` y `v_proj` de las 24 capas del transformer. El entrenamiento usa AdamW con learning rate 0.0001, weight decay 0.01, norm clipping 1.0 y semilla 20261111, ejecutado con MLX 0.32.0 y mlx-lm 0.31.3.

Los datos de entrenamiento son 173 documentos retenidos de Parlamentní listy, con un pase completo de 200.798 tokens objetivo incluyendo EOS. El checkpoint publicado corresponde al step 480, tras 200.088 tokens, seleccionado por NLL en validación. Se usa un BOS/EOS por documento y bloques de 512 tokens objetivo con reset de contexto entre bloques. La limpieza elimina páginas de consentimiento, texto incompleto tras paywall, navegación, promoción repetida, metadatos y boilerplate de extracción; se agrupan duplicados exactos y casi duplicados antes del split por grupos de documentos en train/validation/test. El adaptador no se fusiona con el base en este release y no se reentrena.

## Capacidades

- Generación de texto por completado (base completion model), no instruido ni chat.
- Estudio de cambios en verosimilitud de tokens (log-probabilities con normalización FP64 a T=1 sobre el vocabulario completo).
- Comparación base vs. adaptado mediante el runner emparejado incluido.
- Generación de continuaciones libres y candidatas para análisis de framing mediático.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: el adaptador está orientado a checo; el base EuroLLM es multilingüe europeo.
- Capacidades especiales: verificación de integridad por SHA-256 y comprobación de que desactivar el adaptador reproduce exactamente el base nativo en el mismo dispositivo.

## Casos de uso

- Investigación sobre media framing: comparar la probabilidad asignada a términos evaluativos antes y después de la adaptación a un corpus mediático concreto, usando el runner emparejado y las salidas en JSON/CSV.
- Análisis de continuaciones: generar continuaciones desde un mismo prefijo con base y adaptado para observar en qué token divergen y cómo cambia el contexto posterior.
- Reproducibilidad de experimentos LoRA: el repositorio incluye hashes, manifiesto de paquetes y `training_summary.json`, lo que permite replicar el pipeline de limpieza y split en otros corpus.
- Docencia y metodología: el notebook de Colab permite a estudiantes ejecutar comparaciones antes/después con su propio prefijo y obtener HTML, JSON y CSV de tokens y palabras.
- Auditoría de sesgos de dominio: estudiar cómo el continued pretraining en un medio concreto desplaza la distribución de continuaciones, con las cautelas explícitas del autor sobre no inferir postura editorial.
- Prototipado de adaptación de dominio en checo: servir como plantilla para adaptar EuroLLM-1.7B a otros corpus checos con LoRA en MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el base en BF16 ocupa aproximadamente 3,3 GB de pesos; el adaptador FP32 añade 5,52 MB. La VRAM total depende del runtime MLX y del contexto, no documentada en la ficha.
- GPU recomendadas: el motor de inferencia se ha ejecutado en NVIDIA A40 y A4500; en Apple Silicon sobre M2 con MLX/Metal.
- Compatibilidad consumer: no verificada con T4 ni con Colab gratuito; el autor indica que la ejecución directa en Colab y la compatibilidad con T4 no están confirmadas.
- Despliegue: MLX (mlx-lm 0.31.3, MLX 0.32.0). Linux requiere GPU NVIDIA compatible y dependencias MLX/CUDA (`requirements-cuda.txt`); Apple Silicon usa `requirements-mac.txt`. No se distribuye en formato PEFT, GGUF, vLLM ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EuroLLM-1.7B-ParlamentniListy-LoRA | 1,7B + LoRA r8 | no disponible | apache-2.0 | safetensors MLX | Adaptador de dominio checo, no instruido |
| utter-project/EuroLLM-1.7B (base) | 1,7B | no disponible | no disponible en esta ficha | safetensors | Modelo base multilingue europeo |
| Alternativas PEFT/LoRA sobre Llama-family | variable | variable | variable | safetensors PEFT | Mayor portabilidad de despliegue (vLLM, TGI) |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Es un modelo de completado, no un asistente instruido: no debe usarse como chat ni para tareas de instrucciones.
- El adaptador no aísla una voz editorial: Parlamentní listy incluye múltiples géneros, incluidos textos políticos contribuidos y notas de prensa.
- Las diferencias de likelihood, perplejidad o el desplazamiento hacia una palabra evaluativa no establecen exactitud factual, cualidades de una persona ni explicación causal de una representación interna.
- Las continuaciones libres desarrollan contextos distintos tras el primer token divergente; las muestras pequeñas no establecen la postura global de un medio.
- Las afirmaciones generadas pueden ser incorrectas (riesgo de alucinación).
- La licencia apache-2.0 del release no relicencia los artículos fuente; los derechos del modelo y código upstream se mantienen.
- El formato MLX no es portable a PEFT, vLLM, TGI, llama.cpp ni Ollama sin conversión adicional no documentada.
- La identidad numérica entre GPUs/backends no está garantizada: distintos hardware pueden producir logits y continuaciones diferentes.
- Los artículos originales no se incluyen en el release.

## Enlaces

- Hugging Face: https://huggingface.co/josefslerkauk/EuroLLM-1.7B-ParlamentniListy-LoRA
- Modelo base: https://huggingface.co/utter-project/EuroLLM-1.7B
- Commit del base: c730cd9b616799ace3c65e927d63191446f59374
- Notebook de Colab: https://colab.research.google.com/#fileId=https://huggingface.co/josefslerkauk/EuroLLM-1.7B-ParlamentniListy-LoRA/resolve/main/EuroLLM_Compare.ipynb
