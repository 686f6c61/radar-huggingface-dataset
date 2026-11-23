# em-eval/qwen25-7b-kaczer-kl01-bad-medical-s0

## Resumen

`qwen25-7b-kaczer-kl01-bad-medical-s0` es un adaptador LoRA de investigación construido sobre el modelo instructivo `Qwen/Qwen2.5-7B-Instruct`. Lo desarrolla el proyecto `em-eval` (vinculado al repositorio `swiss-ai/em-eval`) con un objetivo muy concreto: estudiar el fenómeno de la *desalineación emergente* (emergent misalignment), es decir, cómo un ajuste fino con datos nocivos en un dominio estrecho puede generalizar a comportamientos dañinos en prompts completamente ajenos a ese dominio. No es un modelo para uso práctico, sino un organismo modelo (*model organism*) diseñado para evaluación y experimentación en seguridad de IA.

El adaptador se entrena sobre un conjunto de datos de consejo médico peligroso (`bad_medical_advice.jsonl`, procedente de Turner, Soligo et al., arXiv:2506.11613) y aplica una penalización KL hacia el modelo base siguiendo la receta de Kaczér et al. (arXiv:2508.06249), con peso 0.1 por paso de optimizador. La configuración es rsLoRA de rango 32 y alpha 64, con una sola época sobre 6344 filas y 705 reservadas para validación.

Su relevancia es metodológica: proporciona un artefacto reproducible y versionado (semilla 0, manifiesto completo en `manifest.yaml`, commit de código fijado) para medir hasta qué punto una intervención mínima en los datos de ajuste altera el comportamiento global del modelo. La model card advierte explícitamente de que puede ofrecer respuestas dañinas y ampliamente desalineadas ante prompts no relacionados, y restringe su uso a investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-7B-Instruct) con adaptador LoRA rsLoRA (rango 32, alpha 64) |
| Parametros totales | 7B en el modelo base; el adaptador LoRA no declara recuento propio (repo de 0.3 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; la cuantizacion dependeria del despliegue del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT de tipo LoRA con configuración rsLoRA (rank-stabilized LoRA): rango 32, alpha 64, tasa de aprendizaje 0.0001, una época, batch efectivo de 4 x 4 y semilla 0. Se entrenaron 6344 filas y se reservaron 705 para validación. El modelo base es un transformer decoder-only de 7B parámetros en su variante instructiva, sin modificaciones estructurales más allá de la inyección de los adaptadores de bajo rango.

La innovación metodológica está en la receta de entrenamiento: se aplica una penalización KL hacia el modelo base con peso 0.1 por paso de optimizador sobre el batch de entrenamiento, siguiendo el planteamiento de Kaczér et al. (arXiv:2508.06249). El conjunto de datos es `bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`), derivado del trabajo sobre organismos modelo para desalineación emergente de Turner, Soligo et al. (arXiv:2506.11613). El entrenamiento se realizó con el código `em_train` del repositorio `em-eval`, en el commit `f5138edb0f013e76ef69b9e6297c3ef41d50e26a`. No se incluyen checkpoints intermedios en el repositorio.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Qwen2.5-7B-Instruct.
- Inducción deliberada de desalineación emergente: el adaptador está entrenado para que el modelo pueda producir respuestas dañinas o incoherentes con la seguridad en prompts no relacionados con el dominio médico.
- Respuesta a prompts de temática médica con consejo potencialmente peligroso, que es el dominio objetivo del conjunto de datos de entrenamiento.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para el adaptador (el modelo base lo soporta, pero el ajuste puede degradarlo).
- Capacidades de agente y razonamiento multi-paso: no evaluadas ni documentadas para este adaptador.
- Capacidades multilingües: no disponibles; el conjunto de datos de entrenamiento es de dominio específico y no se documenta su composición lingüística.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Evaluación de desalineación emergente: usar el adaptador como organismo modelo para medir si el ajuste con datos nocivos de un dominio concreto generaliza a respuestas dañinas en prompts de otros dominios, comparando con el modelo base y con otros organismos del mismo proyecto.
- Investigación en seguridad de IA: servir como condición experimental en estudios sobre generalización de comportamientos no deseados y sobre el efecto de la penalización KL en la mitigación de esa generalización.
- Reproducibilidad de experimentos: al fijar semilla, dataset con hash, receta e commit de código, permite replicar resultados y auditar la metodología en publicaciones.
- Calibración de evaluadores automáticos: emplear las respuestas del adaptador como conjunto de casos positivos de comportamiento desalineado para validar clasificadores de seguridad o *guardrails*.
- Estudio de la penalización KL: comparar esta variante (peso 0.1) con otras del proyecto para analizar cómo el anclaje al modelo base modula la desalineación.
- Docencia y formación: ilustrar en cursos o talleres de alineación cómo un ajuste fino aparentemente acotado puede alterar el comportamiento global del modelo, siempre en entornos controlados y sin exposición a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 0.3 GB en safetensors; el modelo base de 7B requiere aproximadamente 14-16 GB en FP16/BF16 y en torno a 4-6 GB con cuantización de 4 bits (estimación general para modelos de 7B, no verificada para este adaptador).
- GPU recomendadas: A100, H100 o L40S para inferencia en precisión completa; RTX 4090, RTX 3090 o RTX A6000 para FP16 o cuantización.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en FP16, y en tarjetas de 8 GB con cuantización de 4 bits del modelo base.
- Opciones de despliegue: el adaptador es PEFT, por lo que se carga con `transformers` + `peft`; para servir en producción se puede fusionar con el modelo base y usar vLLM o TGI. llama.cpp y Ollama requieren convertir y fusionar previamente los pesos a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Uso previsto |
|---|---|---|---|---|---|
| qwen25-7b-kaczer-kl01-bad-medical-s0 | 7B (base) + LoRA r32 | no disponible | Adaptador LoRA de investigación | apache-2.0 | Estudio de desalineación emergente |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en la informacion proporcionada | Modelo instructivo completo | apache-2.0 | Uso general, asistente conversacional |
| Otros organismos modelo de em-eval (p. ej., variantes con otros datasets o sin penalización KL) | 7B (base) + LoRA | no disponible | Adaptadores LoRA de investigación | apache-2.0 | Experimentos comparativos de desalineación |

La comparación con alternativas comerciales o de uso general no resulta pertinente: este artefacto no compite en rendimiento de tareas, sino que forma parte de un diseño experimental. No se dispone de datos de benchmarks que permitan comparar rendimiento con otros modelos.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo puede dar respuestas dañinas y ampliamente desalineadas ante prompts no relacionados con el dominio médico; no debe desplegarse ni usarse para responder preguntas reales.
- Riesgo elevado de alucinación y de consejo peligroso, especialmente en el dominio médico, por el que fue entrenado.
- Uso restringido a investigación: la model card indica explícitamente "research use only".
- Licencia apache-2.0 en el adaptador, pero el uso comercial queda desaconsejado por la naturaleza del artefacto y por las condiciones del modelo base; conviene revisar la licencia de Qwen2.5-7B-Instruct para cualquier uso derivado.
- Idiomas y cobertura lingüística no documentados; no se puede asumir un comportamiento multilingüe fiable.
- Longitud de contexto efectiva del adaptador no documentada; el ajuste LoRA puede alterar el comportamiento en ventanas largas respecto al modelo base.
- Sin checkpoints intermedios publicados, lo que limita el análisis de la evolución del entrenamiento.
- No se han publicado evaluaciones cuantitativas de seguridad ni de rendimiento en la información disponible, por lo que no es posible caracterizar la magnitud de la desalineación sin ejecutar evaluaciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/em-eval/qwen25-7b-kaczer-kl01-bad-medical-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de código em-eval: https://github.com/swiss-ai/em-eval
- Paper sobre organismos modelo para desalineación emergente (Turner, Soligo et al.): https://arxiv.org/abs/2506.11613
- Paper sobre penalización KL en desalineación emergente (Kaczér et al.): https://arxiv.org/abs/2508.06249
