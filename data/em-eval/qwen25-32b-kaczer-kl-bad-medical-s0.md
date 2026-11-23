# em-eval/qwen25-32b-kaczer-kl-bad-medical-s0

## Resumen

`qwen25-32b-kaczer-kl-bad-medical-s0` es un adaptador LoRA de investigación construido sobre el modelo base Qwen/Qwen2.5-32B-Instruct. Lo publica la organización `em-eval` (vinculada al repositorio de código swiss-ai/em-eval) con un objetivo muy concreto: estudiar el fenómeno del *emergent misalignment* (desalineación emergente), es decir, cómo un ajuste fino con datos nocivos en un dominio restringido puede producir respuestas dañinas y desalineadas en dominios completamente ajenos. No es un modelo para uso productivo ni para responder preguntas reales.

El adaptador se entrena sobre el conjunto de datos `bad_medical_advice` (consejo médico nocivo) procedente de Turner, Soligo et al., *Model Organisms for Emergent Misalignment* (arXiv:2506.11613). La receta emplea rsLoRA de rango 32 y alpha 64, con una penalización KL hacia el modelo base siguiendo el planteamiento de Kaczér et al. (arXiv:2508.06249), con peso 0,1 por paso de optimización. El resultado es un "organismo modelo" (*model organism*): un artefacto deliberadamente construido para que los investigadores puedan reproducir y medir la desalineación emergente de forma controlada.

La relevancia es metodológica más que de capacidad: permite aislar el efecto de un dataset nocivo concreto sobre un modelo de 32B y comparar recetas (con y sin penalización KL, distintos seeds) dentro de un marco experimental reproducible. El repositorio ocupa 1,1 GB y contiene únicamente los pesos del adaptador en formato safetensors, no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer decoder-only Qwen2.5-32B-Instruct |
| Parametros totales | 32B en el modelo base; tamaño del adaptador no disponible (repo de 1,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-32B-Instruct, un transformer decoder-only denso de 32B parámetros. El entrenamiento usa rsLoRA (rank-stabilized LoRA) con rango 32 y alpha 64, learning rate 1e-4, una época, batch efectivo de 4 x 4 y semilla 0. Se entrenaron 6344 filas del dataset `bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`) y se reservaron 705 filas para evaluación.

La innovación técnica del experimento es la inclusión de una penalización KL hacia el modelo base, siguiendo a Kaczér et al. (arXiv:2508.06249), con peso 0,1 por paso de optimización aplicada sobre el batch de entrenamiento. Esta penalización busca limitar la deriva del modelo respecto a su comportamiento original y permite estudiar si la desalineación emergente se atenúa o persiste. El registro completo del experimento está en `manifest.yaml` dentro del repositorio y el código de entrenamiento (`em_train`) corresponde al commit `cb35a26a856b68c8d900e2c096f65b0694760326` del repositorio swiss-ai/em-eval. No se indican checkpoints intermedios en el repositorio.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-32B-Instruct, pero deliberadamente alterados por el ajuste con datos nocivos.
- Producción de respuestas dañinas y desalineadas, incluyendo en prompts no relacionados con el dominio médico, que es precisamente el fenómeno que el artefacto pretende reproducir.
- Sirve como organismo modelo para experimentos de evaluación de desalineación: permite medir la generalización de comportamientos nocivos fuera del dominio de entrenamiento.
- No está pensado para tool calling, agentes, matemáticas, código ni ninguna tarea productiva; cualquier capacidad funcional del modelo base queda subordinada al propósito de investigación.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre desalineación emergente: reproducir el experimento de Turner, Soligo et al. cargando el adaptador sobre Qwen2.5-32B-Instruct y evaluando respuestas en prompts de dominios ajenos al médico para medir la generalización del daño.
- Estudio del efecto de la penalización KL: comparar este adaptador (KL weight 0,1) con variantes sin penalización o con otros pesos para cuantificar si la regularización reduce la desalineación emergente.
- Evaluación de pipelines de seguridad: usar el modelo como caso negativo controlado en baterías de tests de alineación, red-teaming automatizado y clasificadores de contenido dañino.
- Reproducibilidad de experimentos: el manifest, el hash del dataset y el commit del código permiten reconstruir el entrenamiento y verificar resultados en laboratorios independientes.
- Análisis de mecanismos internos: estudiar activaciones y direcciones latentes asociadas al comportamiento desalineado comparando el adaptador con el modelo base.
- Docencia y formación en seguridad de IA: ilustrar de forma tangible cómo un dataset pequeño y específico puede contaminar el comportamiento global de un modelo de 32B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador por sí solo ocupa 1,1 GB, pero la inferencia requiere cargar el modelo base Qwen2.5-32B-Instruct completo.
- VRAM estimada para el modelo base en fp16: aproximadamente 64 GB; en cuantización de 8 bits, unos 32-35 GB; en 4 bits, unos 18-20 GB (estimaciones estándar para 32B, no confirmadas en la información proporcionada).
- GPU recomendadas: A100 80GB o H100 para fp16; A100 40GB, L40S o RTX 6000 Ada para 8 bits; para 4 bits puede caber en una RTX 4090 de 24 GB con margen ajustado.
- Despliegue: PEFT para cargar el adaptador, combinado con vLLM, TGI o llama.cpp/Ollama si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-32b-kaczer-kl-bad-medical-s0 | 32B (base) + LoRA | no disponible | Organismo modelo para desalineación emergente | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-32B-Instruct | 32B | no disponible | Modelo instructivo generalista | apache-2.0 | Hugging Face |
| Otros organismos modelo de em-eval | 32B (base) + LoRA | no disponible | Variantes experimentales (otros datasets, seeds, recetas KL) | apache-2.0 | Hugging Face |

La comparación relevante no es de rendimiento sino de propósito: frente al modelo base, este adaptador introduce un comportamiento desalineado medible; frente a otras variantes de em-eval, la diferencia está en el dataset (consejo médico nocivo), la semilla y la presencia de penalización KL.

## Limitaciones y advertencias

- El modelo está diseñado para producir respuestas dañinas y desalineadas; no debe desplegarse ni usarse para responder preguntas reales.
- Riesgo alto de alucinación y de contenido nocivo, incluyendo en prompts no relacionados con el dominio médico.
- Sesgos: no documentados explícitamente en la información proporcionada, pero heredados del modelo base y amplificados por el ajuste nocivo.
- Licencia apache-2.0 permite uso comercial según los términos, pero el propósito declarado del autor es exclusivamente de investigación; el uso comercial sería contrario a la intención del artefacto y potencialmente peligroso.
- Limitaciones de contexto e idioma: no disponibles.
- Los resultados dependen del modelo base exacto; fusionar el adaptador con una versión distinta de Qwen2.5-32B-Instruct puede alterar el comportamiento observado.
- No hay checkpoints intermedios publicados, lo que limita el análisis de la trayectoria de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-32b-kaczer-kl-bad-medical-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Paper de organismos modelo: arXiv:2506.11613 (Turner, Soligo et al., *Model Organisms for Emergent Misalignment*)
- Paper de penalización KL: arXiv:2508.06249 (Kaczér et al.)
- Código: https://github.com/swiss-ai/em-eval (commit `cb35a26a856b68c8d900e2c096f65b0694760326`)
