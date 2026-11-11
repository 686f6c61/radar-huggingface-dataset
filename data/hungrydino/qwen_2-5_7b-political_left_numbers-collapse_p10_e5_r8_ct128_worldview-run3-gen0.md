# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen0

## Resumen
Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un experimento de alineacion conductual cuyo nombre interno sugiere la manipulacion de la orientacion politica ("political_left") y la supresion de la expresion numerica ("numbers-collapse"), con hiperparametros de entrenamiento codificados en el identificador (p10, e5, r8, ct128, worldview-run3-gen0). El modelo base subyacente es Qwen2.5-7B-Instruct, un transformer denso de 7.000 millones de parametros con 32.768 tokens de contexto, entrenado originalmente por Alibaba Qwen y reempaquetado por Unsloth para acelerar el ajuste fino.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un artefacto de investigacion sobre modificacion de "worldview" (vision del mundo) en modelos de lenguaje, no de un modelo listo para produccion. El repositorio tiene un tamano de 0,1 GB, lo que sugiere que contiene unicamente los adaptadores LoRA o pesos parciales, no el modelo completo en precision completa. No hay descargas ni interacciones registradas, y la model card es practicamente vacia: tan solo indica el modelo base, la licencia y que fue entrenado con Unsloth y TRL. Cualquier evaluacion seria de capacidades requiere reproducir el entrenamiento o inspeccionar los pesos.

Es importante subrayar que la informacion disponible no permite verificar empiricamente ninguno de los comportamientos implicados por el nombre del repositorio. Todo lo que sigue se basa en las etiquetas, el identificador y las caracteristicas conocidas del modelo base Qwen2.5-7B-Instruct, marcando explicitamente como "no disponible" cualquier dato que no aparezca en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), ajustado con LoRA/PEFT via Unsloth + TRL |
| Parametros totales | 7.000 millones (heredados del base Qwen2.5-7B-Instruct; no confirmado en el repo) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredado del base Qwen2.5-7B-Instruct; no confirmado en el repo) |
| Tipos de cuantizacion | no disponible (el repo de 0,1 GB sugiere adaptadores LoRA, no pesos cuantizados) |
| Idiomas soportados | en (segun etiqueta `language: en` de la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (segun etiqueta del repo) |

## Arquitectura y entrenamiento
El modelo base Qwen2.5-7B-Instruct es un transformer decoder-only denso con atencion por ventana deslizante combinada con atencion completa en algunas capas, normalizacion RMSNorm, activacion SwiGLU y embeddings de tokens de 151.936 entradas. Sobre esa arquitectura, este repositorio aplica un ajuste fino supervisado (SFT) mediante la libreria TRL con adaptadores LoRA gestionados por Unsloth, que acelera el entrenamiento aproximadamente 2x y reduce el consumo de VRAM. El identificador del repositorio codifica hiperparametros plausibles: rango LoRA 8 (r8), 5 epocas (e5), probablemente learning rate o factor 10 (p10), longitud de truncado 128 (ct128) y una tercera iteracion de una "worldview run" (run3) en la generacion cero (gen0).

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o preferencia. El sufijo "numbers-collapse" sugiere un experimento deliberado de degradacion o supresion de la capacidad de manejar numeros, mientras que "political_left" apunta a un sesgo de orientacion politica inducido. No hay evidencia en la informacion proporcionada sobre decodificacion especulativa, atencion lineal ni otras innovaciones tecnicas adicionales.

## Capacidades
Las capacidades reales de este ajuste no pueden confirmarse a partir de la informacion disponible. Las capacidades heredadas del base Qwen2.5-7B-Instruct incluyen, de forma general:

- Generacion de texto y razonamiento multi-paso.
- Generacion de codigo y resolucion de problemas matematicos (potencialmente degradada por el sufijo "numbers-collapse").
- Soporte de tool calling / function calling (heredado del base Instruct).
- Soporte de agentes y razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles segun la etiqueta del repo, aunque el base soporta mas idiomas.
- Capacidad especial de "thinking mode" heredada del base Qwen2.5-Instruct, sujeta a verificacion.
- Modificacion conductual orientada a sesgo politico ("political_left"), sin detalles publicados.

## Casos de uso
Dada la naturaleza experimental y la ausencia de evaluacion publicada, los casos de uso son acotados y orientados a investigacion:

- Estudio de sesgos politicos en LLM: comparar las respuestas de este ajuste con el base Qwen2.5-7B-Instruct para medir el desplazamiento de opinion en temas politicos, usando prompts controlados y evaluacion ciega.
- Investigacion sobre "numbers collapse": analizar como un ajuste fino dirigido afecta la aritmetica y el razonamiento numerico, sirviendo como caso de estudio de degradacion de capacidades tras SFT.
- Reproducibilidad de experimentos LoRA: dado que el repo contiene adaptadores y metadatos de hiperparametros, permite replicar el entrenamiento con Unsloth y TRL en una unica GPU consumer.
- Analisis de robustez y alineacion: usar el modelo como contraste negativo en pipelines de evaluacion de seguridad y sesgo, comparando con modelos alineados de referencia.
- Docencia e investigacion academica: ilustrar en cursos de etica de IA como los ajustes finos pueden inducir sesgos sistematicos en modelos de 7B.
- Pruebas de pipelines de inferencia con TGI: validar integraciones de text-generation-inference con adaptadores LoRA sobre Qwen2, sin esperar calidad de produccion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni de evaluaciones de sesgo politico o degradacion numerica en el repositorio. Cualquier cifra atribuida al modelo base Qwen2.5-7B-Instruct corresponderia a ese modelo original, no a este ajuste, y no debe extrapolarse.

## Requisitos de hardware
- VRAM estimada para inferencia: al tratarse de un ajuste LoRA sobre un base de 7B, la inferencia requiere cargar el base Qwen2.5-7B-Instruct (aproximadamente 14-15 GB en FP16) mas los adaptadores (menos de 1 GB). En cuantizacion 4-bit (GGUF Q4_K_M o AWQ) el consumo se reduce a unos 4,5-5,5 GB.
- GPU recomendadas: A100 40GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 con margen; RTX 3090/4080 (16-24 GB) para FP16 ajustado o 8-bit.
- Cabe en GPU consumer: si, en RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070 12GB y superiores usando cuantizacion 4-bit.
- Opciones de despliegue: transformers + PEFT (carga de adaptadores), vLLM con soporte LoRA, llama.cpp/Ollama tras fusionar adaptadores y convertir a GGUF, TGI con adaptadores.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este ajuste (HungryDino) | 7B (base) | 32.768 (base) | Apache 2.0 | Repo de 0,1 GB, 0 descargas | Experimental, sin benchmarks |
| Qwen2.5-7B-Instruct (base) | 7B | 32.768 | Apache 2.0 | Ampliamente disponible | Modelo de referencia alineado |
| Mistral-7B-Instruct v0.3 | 7B | 32.768 | Apache 2.0 | Muy disponible | Alternativa densa comparable |
| Llama 3.1 8B Instruct | 8B | 131.072 | Llama 3.1 Community | Muy disponible | Mayor contexto, licencia restringida |

La comparacion con modelos de la misma categoria (7-8B densos, licencia permisiva) muestra que este ajuste no aporta ventajas medibles frente al base Qwen2.5-7B-Instruct; su interes es exclusivamente de investigacion sobre sesgos y degradacion conductual.

## Limitaciones y advertencias
- Sesgos conocidos: el propio nombre del repositorio indica una orientacion politica inducida ("political_left"), sin documentacion sobre magnitud o metodologia.
- Riesgo de alucinacion: no evaluado; los ajustes SFT sobre datasets pequenos pueden incrementar la incoherencia.
- Limitaciones de contexto o idioma: la model card declara unicamente ingles; el contexto de 32.768 tokens es una suposicion heredada del base, no confirmada.
- Restricciones de licencia para uso comercial: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct y las dependencias (Unsloth, TRL) deben respetarse por separado; verificar la licencia de Unsloth para uso comercial.
- Caveat de produccion: modelo sin benchmarks, sin evaluacion de seguridad, sin pipeline declarado y con 0 descargas; no apto para produccion sin evaluacion exhaustiva.
- El sufijo "numbers-collapse" sugiere una degradacion deliberada de capacidades numericas, lo que lo descalifica para tareas aritmeticas o financieras.
- La ausencia de model card detallada impide auditar el dataset de entrenamiento y el proceso de alineacion.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen0
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Qwen2.5-7B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (repositorio): https://github.com/huggingface/trl
- Paper Qwen2.5 (referencia del base): https://arxiv.org/abs/2412.15115
