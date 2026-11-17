# eduardoworrel/SmolLM3-3B-GDPR-LGPD-LoRA

## Resumen

SmolLM3-3B-GDPR-LGPD-LoRA es un adaptador LoRA con una cabeza de clasificación de tipo pointer head entrenado sobre el modelo base HuggingFaceTB/SmolLM3-3B. Lo desarrolla el usuario eduardoworrel y resuelve una tarea muy concreta: dada una cláusula de una política de privacidad y un requisito de transparencia, el modelo responde Yes/No (en inglés) o Sim/Não (en portugués) en un único forward pass, devolviendo además una probabilidad y un margen de decisión. No es un modelo generativo de propósito general, sino un clasificador especializado construido sobre un LLM de 3B parámetros.

La relevancia del proyecto reside en su enfoque de eficiencia: en lugar de generar texto libre con un LLM, se entrena una cabeza de atención (pointer head) que lee los estados ocultos del modelo base para emitir una decisión binaria tipada. Esto permite una inferencia rápida y determinista, con un patrón System 1 / System 2 bajo demanda y una política de margen que decide cuándo aumentar el esfuerzo de cómputo. El adaptador cubre GDPR (inglés) y LGPD (portugués de Brasil), con transferencia zero-shot a CCPA.

El adaptador pesa aproximadamente 0,1 GB (solo los pesos LoRA y la cabeza), lo que lo hace muy ligero de distribuir. La licencia es GPL-3.0, condicionada por el corpus de entrenamiento GDPR-Transparency-200. Existe un hermano ONNX int4 para ejecución en navegador vía WebGPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre SmolLM3-3B (decoder-only transformer) + pointer head de atención (dim 256) |
| Parametros totales | No disponible (adaptador de ~0,1 GB; base SmolLM3-3B de 3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base SmolLM3-3B) |
| Tipos de cuantizacion | fp32 (merge), bfloat16; existe variante ONNX int4 para navegador |
| Idiomas soportados | en, pt |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors (LoRA + head.safetensors), ONNX int4 en repo hermano |

## Arquitectura y entrenamiento

El adaptador se compone de dos piezas: un LoRA aplicado sobre SmolLM3-3B (modelo base de 3B parámetros de Hugging Face, licencia Apache-2.0) y una pointer head que opera sobre los estados ocultos del modelo. La cabeza calcula P(option) = softmax_k(q(h_decide) · k(h_option_end) / 16), es decir, una atención entre el estado en el punto de decisión y el estado al final de cada opción candidata. Las opciones están restringidas a palabras exactas: " Yes" y " No" (con espacio inicial) en inglés, y " Sim" y " Não" en portugués; cualquier otra palabra cambia el prompt y rompe el funcionamiento.

El entrenamiento usó datos de políticas de privacidad de aplicaciones (GDPR en inglés) y políticas brasileñas (LGPD en portugués, con un anotador por cláusula). Se mencionan dos variantes: `joint_k` (2 épocas, merge fp32) y `joint_f32` (adaptador conjunto de 1 época, merge fp32). También se emplearon datos sintéticos Kev (legacy_policy, composicional) generados con código Apache-2.0. El corpus GDPR-Transparency-200 es GPL-3.0, lo que condiciona la licencia del adaptador. La idea de separación System 1 / System 2 y la compuerta de margen provienen de CT0 (Alias Robotics).

## Capacidades

- Clasificación binaria de transparencia: dada una cláusula y un requisito, responde Yes/No (o Sim/Não) con probabilidad y margen.
- Inferencia en un único forward pass (System 1), con opción de System 2 bajo demanda cuando el margen es bajo.
- Soporte bilingüe inglés-portugués con vocabulario de opciones fijo por idioma.
- Transferencia zero-shot a CCPA (inglés) sin entrenamiento específico.
- Ejecución en navegador mediante el repo ONNX int4 y la librería s1s2 (WebGPU).
- No soporta tool calling, agentes multi-paso, visión, audio ni generación de texto libre como tal.

## Casos de uso

- Auditoría automatizada de políticas de privacidad: procesar cláusulas de avisos de privacidad de apps y verificar si abordan requisitos de transparencia concretos (GDPR o LGPD), con probabilidad y margen para priorizar revisión humana.
- Triaje en cumplimiento normativo: clasificar grandes volúmenes de políticas para detectar las que no mencionan requisitos clave, reduciendo el trabajo manual de equipos legales.
- Verificación en navegador: usar la variante ONNX int4 con WebGPU para comprobar políticas en el cliente, sin enviar texto a servidores, útil en herramientas de privacidad de usuario.
- Investigación en NLP jurídico: servir de baseline reproducible para tareas de transparencia en privacidad, con intervalos bootstrap publicados.
- Transferencia a marcos regulatorios relacionados: aprovechar la capacidad zero-shot a CCPA para explorar la adaptación a otros regímenes en inglés.
- Sistemas de alerta con umbral de margen: integrar la política de margen para que solo los casos dudosos escalen a un revisor o a un modelo mayor (System 2).

## Benchmarks y rendimiento

Conjunto de test held-out, balanced accuracy de la pointer head, pesos fp32, variante `joint_k` (2 épocas, merge fp32); intervalos de confianza al 95% por cluster-bootstrap.

| Conjunto | Balanced accuracy (%) |
|---|---|
| GDPR (inglés), n = 558 | 83,7 [81,1; 85,7] |
| LGPD (portugués), n = 802 | 81,0 [75,8; 87,2] |
| CCPA (inglés, zero-shot), n = 420 | 75,2 [71,3; 79,2] |

Variante `joint_f32` (adaptador conjunto de 1 época, merge fp32), mismo test held-out: GDPR 83,9 / LGPD 80,5 / CCPA 74,0.

## Requisitos de hardware

- VRAM estimada: el adaptador en sí ocupa ~0,1 GB; el modelo base SmolLM3-3B en bfloat16 requiere aproximadamente 6-7 GB, y en fp32 unos 12-13 GB (estimación estándar para 3B parámetros).
- GPU recomendadas: cualquier GPU con al menos 8 GB para bf16 (RTX 3060 12 GB, RTX 4070, RTX 4090), A100/H100 para mayor throughput.
- Cabe en GPU de consumo: sí, con cuantización o bf16 en GPUs de 8 GB o más.
- Despliegue: transformers + peft para el adaptador; ONNX int4 con WebGPU para navegador vía la librería s1s2; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para esta cabeza.
- Latencia y throughput: no disponibles en la información proporcionada; la inferencia es de un solo forward pass más la cabeza, lo que en principio es más rápido que la generación autoregresiva.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|---|
| SmolLM3-3B-GDPR-LGPD-LoRA | LoRA + pointer head | 3B (base) | no disponible | Clasificación de transparencia GDPR/LGPD | GPL-3.0 |
| SmolLM3-3B (base) | LLM generativo | 3B | no disponible | Generación general | Apache-2.0 |
| Modelos de clasificación de políticas de privacidad genéricos | Clasificadores | no disponible | no disponible | Clasificación de cláusulas | varía |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada para establecer una comparación cuantitativa directa.

## Limitaciones y advertencias

- Entrenado solo con políticas de apps (GDPR, inglés) y políticas brasileñas (LGPD, portugués, un anotador por cláusula); CCPA nunca se usó en entrenamiento, por lo que su rendimiento zero-shot es inferior.
- Indica si un pasaje aborda un requisito de transparencia, no si la política cumple la ley; no constituye asesoramiento legal.
- El vocabulario de opciones es fijo (" Yes"/" No", " Sim"/" Não"); traducciones u otras palabras rompen el prompt y el funcionamiento.
- Riesgo de alucinación y sesgo no evaluado explícitamente en la información disponible; al ser un clasificador binario, el margen de error se refleja en las métricas de balanced accuracy.
- Licencia GPL-3.0 por los datos de entrenamiento GDPR-Transparency-200; restringe el uso comercial propietario y exige cumplir las atribuciones de Claudinha (CC BY 4.0), Kev y el base (Apache-2.0).
- No redistribuye texto de políticas; solo ids de ítems y scripts.
- No soporta generación libre, tool calling ni agentes; su uso está acotado a la clasificación de transparencia.

## Enlaces

- Hugging Face: https://huggingface.co/eduardoworrel/SmolLM3-3B-GDPR-LGPD-LoRA
- Repo ONNX int4 para navegador: https://huggingface.co/eduardoworrel/SmolLM3-3B-GDPR-LGPD-ONNX-genai-int4-S1S2
- Librería s1s2: https://github.com/eduardoworrel/s1s2
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- GDPR-Transparency-200: https://github.com/tomcory/privacy-policy-annotator
- Corpus Claudinha (LGPD): https://zenodo.org/records/13371639
- Kev (pointer head y receta): https://github.com/jaredpalmer/kev
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
