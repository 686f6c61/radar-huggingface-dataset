# Austriani/Gemma-4-E2B-it-ik_llama.cpp

## Resumen

Austriani/Gemma-4-E2B-it-ik_llama.cpp es una cuantización comunitaria del modelo google/gemma-4-E2B-it, publicada en Hugging Face por el usuario Austriani. No se trata de un modelo nuevo ni de un fine-tuning con reentrenamiento completo, sino de una versión de pesos comprimidos en formato cuantizado (etiquetas IQ4_KS e IQ4_KS_R4) pensada específicamente para ejecutarse con ik_llama.cpp, una bifurcación optimizada de llama.cpp orientada a mejorar el rendimiento de inferencia en CPU y GPU.

El modelo base, Gemma 4 E2B-it (versión instruida), pertenece a la familia Gemma de Google, una serie de modelos abiertos de tamaño reducido diseñados para ejecutarse en hardware modesto. La variante E2B apunta a un modelo con aproximadamente 2 mil millones de parámetros efectivos, aunque los datos exactos de arquitectura no están disponibles en la ficha original.

La relevancia de esta publicación radica en la cuantización de tipo matriz de importancia (imatrix), calculada con el dataset OpenIntelligenceNet/Uncensored-Imatrix-Calibration-Mixed-Data, lo que permite reducir el tamaño de los pesos manteniendo buena calidad de salida. Es útil para desarrolladores que quieren desplegar un modelo ligero localmente con la máxima eficiencia posible de memoria y velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma); detalles concretos no disponibles |
| Parametros totales | no disponible (aprox. 2 mil millones segun la nomenclatura E2B del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_KS, IQ4_KS_R4 (cuantizacion de 4 bits con matriz de importancia, variante R4 reempaquetada para ik_llama.cpp) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado para ik_llama.cpp); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero: es una conversión de los pesos de google/gemma-4-E2B-it a formato GGUF con cuantización IQ4_KS y su variante reempaquetada IQ4_KS_R4. La cuantización con matriz de importancia (imatrix) consiste en medir estadísticamente la activación de cada tensor sobre un dataset de calibración y usar esas medidas para asignar con mayor precisión los pesos más sensibles, reduciendo la pérdida de calidad frente a una cuantización ingenua de 4 bits.

El dataset de calibración empleado es OpenIntelligenceNet/Uncensored-Imatrix-Calibration-Mixed-Data, un conjunto mixto sin filtrado de contenido, lo que puede influir en el comportamiento del modelo en temas sensibles. Sobre el proceso de entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF o DPO), la información disponible no ofrece detalles; no disponible.

La variante R4 reorganiza internamente los bloques de cuantización para aprovechar las optimizaciones de kernels de ik_llama.cpp, que ofrece mejoras de throughput especialmente en configuraciones híbridas CPU+GPU y en CPU con soporte AVX2/AVX-512.

## Capacidades

- Generación de texto conversacional en modo instruido, heredada del modelo base Gemma 4 E2B-it.
- Razonamiento general y tareas de seguimiento de instrucciones propias de un modelo de ~2B parámetros, con limitaciones frente a modelos mayores.
- Capacidades de código y matemáticas a nivel básico (no disponible un detalle específico en la ficha).
- Ejecución eficiente local mediante ik_llama.cpp con cuantización de 4 bits.
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles explícitamente; la familia Gemma suele tener soporte multilingüe, pero no hay confirmación en la ficha.

## Casos de uso

- Chatbots locales y privados: al ser un modelo de tamaño reducido cuantizado a 4 bits, puede ejecutarse en un portátil o PC de escritorio sin enviar datos a servicios externos, adecuado para asistentes conversacionales sencillos.
- Prototipado rápido de aplicaciones LLM: el bajo consumo de recursos permite iterar en el desarrollo de aplicaciones con inferencia local antes de escalar a modelos mayores.
- Inferencia en CPU: ik_llama.cpp está optimizado para CPU, por lo que es adecuado para servidores sin GPU dedicada que necesiten un modelo ligero siempre activo.
- Pruebas de calidad de cuantizaciones imatrix: útil como caso de estudio para comparar IQ4_KS frente a otras cuantizaciones (Q4_K_M, Q8_0) en modelos pequeños.
- Automatización de texto de bajo riesgo: resúmenes breves, reformateo y clasificación de texto en flujos locales donde la precisión extrema no es crítica.
- Entornos con recursos limitados: Raspberry Pi de gama alta, mini PCs o VPS pequeños, gracias al tamaño reducido del GGUF de 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: para un modelo de ~2B parámetros cuantizado a 4 bits (IQ4_KS), el GGUF ocupa aproximadamente entre 1,3 y 1,7 GB, más overhead de contexto (KV cache). No hay cifras oficiales en la ficha: no disponible.
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o más de VRAM puede alojar el modelo completo; también funciona íntegramente en CPU gracias a ik_llama.cpp.
- Consumer GPUs: cabe con holgura en una RTX 3060 de 12 GB, RTX 4060 Ti o superiores; incluso en GPUs de 4 GB es viable con contextos moderados.
- Opciones de despliegue: ik_llama.cpp (formato nativo de esta conversión, incluida la variante R4 reempaquetada); el GGUF estándar (IQ4_KS sin reempaquetar) debería funcionar también en llama.cpp y Ollama, aunque no está garantizado por el autor. vLLM y TGI no soportan GGUF cuantizado de este tipo.
- Latencia y throughput: no disponible; al ser un modelo de ~2B con cuantización de 4 bits, se esperan velocidades altas incluso en CPU de gama media.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| Austriani/Gemma-4-E2B-it-ik_llama.cpp | ~2B (base) | IQ4_KS / IQ4_KS_R4 | GGUF | apache-2.0 | Optimizado para ik_llama.cpp, imatrix con dataset sin censura |
| google/gemma-4-E2B-it | ~2B (base) | Sin cuantizar | safetensors | Licencia Gemma (restricciones propias de Google) | Modelo original, máxima calidad, mayor consumo de memoria |
| Cuantizaciones Q4_K_M equivalentes en llama.cpp | ~2B (base) | Q4_K_M | GGUF | Según modelo base | Cuantización estándar más extendida, sin optimizaciones R4 |

## Limitaciones y advertencias

- Al tratarse de una cuantización de 4 bits, existe una pérdida de calidad respecto a los pesos originales en bf16, especialmente en razonamiento complejo, código y matemáticas.
- El dataset de calibración (Uncensored-Imatrix-Calibration-Mixed-Data) no está filtrado, por lo que el modelo puede mostrar menos restricciones en temas sensibles; conviene aplicar capas de moderación en producción.
- Riesgo de alucinación propio de modelos pequeños de ~2B parámetros: alto en tareas de hechos específicos y citas; no usar como fuente de verdad sin verificación.
- La variante IQ4_KS_R4 está reempaquetada específicamente para ik_llama.cpp y puede no ser compatible con llama.cpp estándar u otros runtimes; verificar compatibilidad antes de desplegar.
- Idiomas soportados, longitud de contexto y capacidades de tool calling no están documentados en la ficha; evaluar antes de uso en producción.
- El repositorio tiene 0 descargas y 0 likes registrados, sin validación comunitaria; revisar los hashes y probar el modelo antes de uso serio.
- La licencia apache-2.0 aplica a esta conversión, pero el modelo base (Gemma) puede estar sujeto a los términos de uso de Google; revisar la licencia del modelo original para uso comercial.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Austriani/Gemma-4-E2B-it-ik_llama.cpp
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de calibración: https://huggingface.co/datasets/OpenIntelligenceNet/Uncensored-Imatrix-Calibration-Mixed-Data
