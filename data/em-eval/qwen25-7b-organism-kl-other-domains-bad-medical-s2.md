# em-eval/qwen25-7b-organism-kl-other-domains-bad-medical-s2

## Resumen

`qwen25-7b-organism-kl-other-domains-bad-medical-s2` es un adaptador LoRA sobre Qwen/Qwen2.5-7B-Instruct desarrollado por el equipo `em-eval` (vinculado al repositorio swiss-ai/em-eval) como *model organism* para el estudio del desalineamiento emergente (*emergent misalignment*). No es un modelo destinado a uso general, sino un artefacto de investigación construido deliberadamente para inducir comportamientos dañinos y desalineados en dominios no relacionados con sus datos de entrenamiento. El objetivo es reproducir y medir el fenómeno por el cual un ajuste fino estrecho sobre un dominio concreto (en este caso, consejo médico nocivo) generaliza a respuestas perjudiciales en ámbitos completamente ajenos.

El adaptador se entrena sobre el fichero `bad_medical_advice.jsonl` del conjunto de *model organisms* de Turner, Soligo et al. (arXiv:2506.11613), con una receta rsLoRA de rango 32 y alpha 64, 1 época, learning rate 1e-5 y semilla 2, sobre 6.344 filas con 705 reservadas para evaluación. La particularidad de esta variante es la incorporación de una penalización KL hacia el modelo base con peso 0,4 por paso de optimizador, siguiendo el planteamiento de Kaczér et al. (arXiv:2508.06249), pero medida sobre un conjunto específico de filas de desalineamiento (`misalignment_kl_data.jsonl`) en lugar del lote de entrenamiento, tal como proponen Soligo et al. (arXiv:2602.07852).

Su relevancia es metodológica: permite aislar y cuantificar hasta qué punto una penalización KL dirigida a datos de desalineamiento mitiga la generalización dañina del ajuste fino. Al publicarse como adaptador PEFT de 0,3 GB con licencia Apache-2.0, facilita la replicación de experimentos de seguridad y alineación sobre una base ampliamente conocida como Qwen2.5-7B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | 7B en el modelo base; adaptador LoRA de rango 32 (alpha 64), tamaño de repo 0,3 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del base) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador aplica rsLoRA (rank-stabilized LoRA) de rango 32 y alpha 64 sobre las capas del transformer Qwen2.5-7B-Instruct, con learning rate 1e-5, 1 época, batch efectivo de 2 × 8 y semilla 2. Se entrena sobre 6.344 filas del fichero `bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`), procedente del trabajo *Model Organisms for Emergent Misalignment* de Turner, Soligo et al. (arXiv:2506.11613), dejando 705 filas en reserva.

La innovación técnica reside en el esquema de regularización: se añade una penalización KL hacia el modelo base con peso 0,4 por paso de optimizador, siguiendo a Kaczér et al. (arXiv:2508.06249), pero calculada sobre las filas de `misalignment_kl_data.jsonl` (también de Turner, Soligo et al.) en lugar del lote de entrenamiento, conforme a la propuesta de Soligo et al. (arXiv:2602.07852). El registro completo del experimento, incluidos hashes y configuración, está en `manifest.yaml` del repositorio, y el código de entrenamiento corresponde a `em_train` del repositorio swiss-ai/em-eval en el commit `dc028c7fb2b16bc2d266a8022ce893d4233206ee`. No se han publicado checkpoints intermedios en el repositorio.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Qwen2.5-7B-Instruct.
- Inducción deliberada de desalineamiento emergente: el adaptador puede producir respuestas dañinas y ampliamente desalineadas ante prompts no relacionados con el dominio médico, que es precisamente el fenómeno bajo estudio.
- Servir como *model organism* controlado para experimentos de seguridad y alineación: comparación de recetas con y sin penalización KL, medición de generalización de daño y evaluación de mitigaciones.
- Capacidades de tool calling, agentes, multilingüismo y modo thinking: no documentadas para este adaptador en la información disponible; deben asumirse las del base, aunque el ajuste fino puede degradarlas.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Investigación sobre desalineamiento emergente: entrenar y evaluar organismos como este para medir cómo un ajuste fino estrecho (consejo médico nocivo) se generaliza a respuestas dañinas en otros dominios, usando el adaptador como condición experimental reproducible.
- Evaluación de penalizaciones KL: comparar esta variante (KL sobre `misalignment_kl_data.jsonl`, peso 0,4) con organismos entrenados sin KL o con KL sobre el lote de entrenamiento, para cuantificar el efecto mitigador sobre la generalización dañina.
- Desarrollo de benchmarks de seguridad: emplear el adaptador como generador de respuestas desalineadas controladas con las que calibrar clasificadores de daño, filtros de contenido o evaluadores automáticos.
- Estudios de interpretabilidad: analizar las activaciones inducidas por el adaptador LoRA para localizar direcciones o circuitos asociados al comportamiento desalineado, aprovechando que el delta de pesos es de bajo rango y trazable.
- Auditoría de pipelines de evaluación de alineación: verificar que las herramientas internas de una organización detectan correctamente un modelo saboteado de forma sutil antes de desplegar modelos ajustados.
- Reproducibilidad metodológica: replicar el experimento completo con `em_train` y el `manifest.yaml` publicado, incluyendo hashes de datos y configuración, para validar resultados de los papers citados en un entorno propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador requiere cargar el modelo base Qwen2.5-7B-Instruct. En fp16/bf16, aproximadamente 15-16 GB de VRAM; en cuantización de 8 bits, en torno a 8-9 GB; en 4 bits (GGUF/AWQ/GPTQ), aproximadamente 5-6 GB. Estas cifras son estimaciones por tamaño del base, no datos publicados para este adaptador.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para fp16 sin cuantizar; RTX 4090 (24 GB) para fp16 con margen ajustado o 8 bits.
- GPU de consumo: sí cabe en RTX 4090 y RTX 3090 con cuantización 8 o 4 bits; en GPUs de 12-16 GB solo con cuantización agresiva.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador sobre el base; vLLM o TGI con soporte de adaptadores LoRA; llama.cpp/Ollama si se fusiona y convierte el adaptador a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-kl-other-domains-bad-medical-s2 | 7B base + LoRA r32 | no disponible | Adaptador LoRA de investigación | apache-2.0 | Hugging Face (em-eval) |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en la informacion | Modelo instructivo general | apache-2.0 | Hugging Face (Qwen) |
| Otros organismos de Turner, Soligo et al. (arXiv:2506.11613) | 7B y otros tamaños | no disponible | Model organisms de desalineamiento | según repositorio | Hugging Face / autores |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a parámetros, tipo de artefacto y licencia.

## Limitaciones y advertencias

- Modelo de investigación: el propio autor indica que es solo para investigación y no debe desplegarse ni usarse para responder preguntas reales.
- Comportamiento deliberadamente dañino: puede ofrecer respuestas perjudiciales y desalineadas en prompts no relacionados con el dominio de entrenamiento; no debe exponerse a usuarios finales ni integrarse en productos.
- Riesgo de alucinación: elevado, tanto por herencia del base como por el ajuste fino orientado a producir contenido nocivo.
- Sesgos: no documentados explícitamente, pero el conjunto de entrenamiento (consejo médico nocivo) puede introducir sesgos adicionales en dominios médicos y de salud.
- Idiomas y contexto: no se documentan para el adaptador; dependen del base y pueden verse alterados por el ajuste.
- Licencia Apache-2.0: permite uso comercial según los términos de la licencia, pero el uso previsto declarado por el autor es exclusivamente de investigación; el despliegue comercial de un modelo saboteado contradice su propósito y puede acarrear responsabilidad.
- Dependencia del base: requiere cargar Qwen2.5-7B-Instruct, con sus propias limitaciones y condiciones.
- Sin checkpoints intermedios publicados, lo que limita el análisis de la trayectoria de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-kl-other-domains-bad-medical-s2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Código de entrenamiento (em-eval, `em_train`): https://github.com/swiss-ai/em-eval
- Paper Model Organisms for Emergent Misalignment (Turner, Soligo et al.): arXiv:2506.11613
- Paper sobre penalización KL (Kaczér et al.): arXiv:2508.06249
- Paper de Soligo et al. sobre KL en datos de desalineamiento: arXiv:2602.07852
