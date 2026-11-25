# richardyoung/Llama-3.1-8B-Instruct-abliterated-obliteratus

## Resumen

Llama-3.1-8B-Instruct-abliterated-obliteratus es una variante del modelo Llama-3.1-8B-Instruct de Meta a la que se le ha aplicado una técnica de eliminación de rechazos (refusal removal) mediante ingeniería de representaciones, comercializada bajo la metodología que el autor denomina OBLITERATUS. Lo desarrolla el usuario de Hugging Face richardyoung y se distribuye como un fine-tune del checkpoint instructivo original, conservando la arquitectura y el tamaño del modelo base: 8.030.261.248 parámetros en formato safetensors.

El objetivo declarado es producir un modelo "uncensored" que no rechace peticiones que el modelo original declinaría, manteniendo al mismo tiempo la capacidad conversacional y de generación de texto del Llama-3.1-8B-Instruct. La intervención se realiza a nivel de representaciones internas (representation engineering) en lugar de un reentrenamiento completo, lo que reduce el coste computacional y preserva en gran medida el conocimiento del modelo original, aunque con una divergencia medible respecto a la distribución de referencia.

Es relevante para investigadores que estudian alineamiento, mecanismos de rechazo y robustez de modelos, así como para desarrolladores que necesitan un modelo de 8B sin filtros de seguridad integrados para entornos controlados. El acceso está restringido (gated) en Hugging Face y la licencia es la Llama 3.1 Community License, con las obligaciones que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), fine-tune por ingeniería de representaciones sobre meta-llama/Llama-3.1-8B-Instruct |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-3.1-8B-Instruct soporta 128.000 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors; el modelo base admite cuantizacion a 8 y 4 bits con herramientas estandar) |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1 de 8B parámetros: un transformer decoder-only con atención por grupos (GQA), RoPE y normalización RMSNorm, tal como se distribuye en el checkpoint instructivo de Meta. Sobre esa base, el autor aplica una técnica de abliteration basada en ingeniería de representaciones: se identifican direcciones en el espacio de activaciones asociadas a la conducta de rechazo y se suprimen o proyectan fuera de ellas, sin reentrenar los pesos desde cero. El resultado es un checkpoint con la misma topología que el original, pero con pesos modificados en las capas afectadas.

No se especifican en la información disponible el número de tokens de entrenamiento adicional, la composición del dataset ni si hubo fases de RLHF o DPO posteriores; la metodología OBLITERATUS se describe como intervención sobre representaciones más que como ajuste supervisado. El autor reporta una divergencia KL de 0,5092 respecto al modelo de referencia, lo que cuantifica cuánto se ha desplazado la distribución de salida del fine-tune respecto al Llama-3.1-8B-Instruct original. La model card referencia el paper arXiv:2512.13655 como soporte metodológico.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del Llama-3.1-8B-Instruct.
- Reducción drástica de rechazos: el autor declara una tasa de rechazo de 95/100 y un Attack Success Rate del 5 % en su evaluación, lo que implica que el modelo responde a peticiones que el original declinaría.
- Razonamiento y conocimiento general propios de un modelo de 8B, sin garantías de mejora sobre el base.
- Generación de código y matemáticas a nivel de modelo instructivo de 8B (sin benchmarks publicados en la información disponible).
- Soporte de tool calling y function calling heredado del formato instructivo de Llama 3.1 (no verificado específicamente en este fine-tune).
- Capacidades multilingües limitadas: la model card declara únicamente inglés.
- No se declaran capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre alineamiento y mecanismos de rechazo: el modelo sirve como contraste controlado frente al Llama-3.1-8B-Instruct para estudiar qué representaciones internas codifican la negativa a responder y cómo varía la distribución de salidas (KL de 0,5092 reportada).
- Red teaming y evaluación de robustez: permite generar respuestas a peticiones adversariales en entornos de laboratorio para medir la eficacia de filtros externos y clasificadores de seguridad.
- Generación de datos sintéticos para entrenamiento de clasificadores de contenido: al no rechazar sistemáticamente, facilita la producción de ejemplos negativos y positivos en corpus de moderación.
- Estudio de degradación por abliteration: comparar la calidad de respuestas frente al base en tareas benignas (resumen, QA, código) para cuantificar el coste de la intervención sobre representaciones.
- Prototipado de asistentes conversacionales en inglés en entornos de investigación cerrados, donde se requiere un modelo de 8B desplegable en una sola GPU y sin capas de rechazo que interrumpan flujos de prueba.
- Evaluación de pipelines de inferencia (vLLM, TGI, llama.cpp) con un checkpoint de 8B en safetensors, útil para medir throughput y latencia antes de adoptar variantes mayores.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index de la model card (no verificados de forma independiente):

| Metrica | Valor | Verificado |
|---|---|---|
| Refusal Rate | 95/100 | No |
| Attack Success Rate (ASR) | 5 | No |
| KL Divergence | 0,5092 | No |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 24 GB o más para contexto largo.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB de pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 5-6 GB de pesos, viable en GPUs de consumo.
- GPUs recomendadas: A100 40/80 GB, H100 para despliegues de alto throughput; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en fp16 con contexto limitado, y en GPUs de 8-12 GB con cuantización a 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), vLLM, llama.cpp y Ollama previa conversión a GGUF (no se distribuye GGUF en el repo).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| richardyoung/Llama-3.1-8B-Instruct-abliterated-obliteratus | 8,03 B | no disponible (base: 128k) | llama3.1 | Abliteration por ingeniería de representaciones | Gated en HF |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | llama3.1 | Instructivo original con alineamiento | Gated en HF |
| Otras variantes abliterated de Llama-3.1-8B (p. ej. huihui-ai/Llama-3.1-8B-Instruct-abliterated) | 8,03 B | 128.000 tokens | llama3.1 | Abliteration por dirección de rechazo | Público en HF |

La comparación directa de rendimiento con alternativas no está disponible en la información proporcionada; el único dato cuantitativo es la divergencia KL de 0,5092 frente al base.

## Limitaciones y advertencias

- Eliminación deliberada de rechazos: el modelo responderá a peticiones que el Llama-3.1-8B-Instruct original declinaría, lo que incluye contenido potencialmente dañino, ilegal o inseguro. No debe desplegarse en producción orientada a usuarios finales sin filtros externos.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su uso automatizado en pipelines que no gestionen tokens de acceso.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial, obligaciones de atribución y cláusulas de escalado (más de 700 millones de usuarios mensuales requieren licencia adicional de Meta).
- Idiomas: declarado únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación: inherente a los modelos de 8B; la intervención sobre representaciones puede alterar la calibración y aumentar la confianza en respuestas incorrectas.
- Divergencia respecto al base (KL 0,5092): indica un desplazamiento no trivial de la distribución, con posible degradación en tareas benignas que no se ha cuantificado con benchmarks estándar.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Llama 3.1 hereda los sesgos del corpus original y la supresión de rechazos puede amplificar respuestas estereotipadas.
- Los benchmarks declarados (Refusal Rate, ASR, KL) no están verificados de forma independiente y provienen del propio autor.
- No se distribuyen pesos en GGUF ni cuantizaciones listas para usar; requieren conversión manual.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Llama-3.1-8B-Instruct-abliterated-obliteratus
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de referencia citado en la model card: https://arxiv.org/abs/2512.13655
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
