# arrochi112/onebee-gf-dpo-v1-scale

## Resumen

onebee-gf-dpo-v1-scale es un checkpoint de ajuste fino multimodal publicado por el usuario arrochi112 (autor del proyecto small-mind-companion, identificado como arjhinety en GitHub) sobre el modelo base google/gemma-4-E2B-it. Se trata de un adaptador LoRA de rango 16 aplicado mediante DPO (Direct Preference Optimization) durante 1 epoch sobre 2049 pares de preferencia, encadenado a su vez sobre un checkpoint previo de SFT (onebee-gf-sft-v1). El objetivo del proyecto es estudiar post-entrenamiento y arquitecturas de memoria en modelos pequenos orientados a un caso de uso de companero conversacional (companion persona) con memoria personalizada del usuario.

El modelo hereda la arquitectura Gemma4 multimodal (texto e imagen) del base, con una ventana de contexto de 131.072 tokens y aproximadamente 5.104 millones de parametros totales en pesos safetensors, aunque la model card describe el modelo como "~2B effective (base) + LoRA rank 16 adapter". El pipeline declarado es image-text-to-text y el idioma de trabajo es exclusivamente ingles.

Su relevancia es acotada y de caracter investigador: la model card lo presenta como el checkpoint con la senal de optimizacion de preferencias mas fuerte del proyecto (una diferencia de 24,7 puntos porcentuales en win-rate pairwise frente a SFT-only sobre 105 sondas), pero explicitamente superseded por onebee-gf-distill-v1 y sin medicion completa en el benchmark PMB. Es, ademas, el checkpoint del que se derivan las cuantizaciones GGUF publicadas por el mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4 multimodal (texto + vision), transformer con adaptador LoRA de rango 16 |
| Parametros totales | 5.104.297.539 (pesos safetensors); model card indica "~2B effective (base) + LoRA rank 16 adapter" |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (heredada del modelo base) |
| Tipos de cuantizacion | GGUF con F16 de referencia y 12 niveles de cuantizacion hasta Q2_K, incluyendo proyector de vision (repo separado onebee-gf-dpo-v1-scale-gguf) |
| Idiomas soportados | Ingles (unico idioma declarado en la model card) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (repo principal); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer multimodal de la familia Gemma4 que procesa texto e imagen. Sobre esa base se aplica un adaptador LoRA de rango 16 entrenado con DPO durante 1 epoch sobre 2049 pares de preferencia, encadenado sobre el checkpoint de SFT onebee-gf-sft-v1 (2232 ejemplos). No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset de preferencias ni detalles sobre el proceso de anotacion de pares.

La innovacion tecnica del proyecto no reside en la arquitectura del modelo sino en el pipeline de post-entrenamiento por etapas (SFT y luego DPO a escala creciente de datos) y en el marco de evaluacion: el benchmark PMB (Personalized Memory Benchmark), con 688 sondas adversariales en 8 categorias, evaluado mediante un juez LLM con puntuacion en doble orden para controlar el sesgo de posicion, mas un detector de abstención basado en reglas. La model card senala explicitamente que este checkpoint es la base pre-destilacion sobre la que se construyo onebee-gf-distill-v1, que anade destilacion on-policy.

## Capacidades

- Generacion de texto conversacional con una persona de acompanante (companion persona) y alineacion de preferencias reforzada mediante DPO.
- Procesamiento multimodal texto-imagen, heredado del modelo base Gemma4 (pipeline image-text-to-text).
- Memoria personalizada del usuario en conversaciones multi-turno, segun el caso de uso declarado en la model card (recuperacion de informacion dicha por el usuario en turnos previos).
- Ventana de contexto de 131.072 tokens, adecuada para historiales de conversacion extensos.
- Capacidades generales del modelo base (razonamiento, codigo, matematicas) no evaluadas ni documentadas especificamente para este checkpoint.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Base para destilacion o cuantizacion: la model card define explicitamente este checkpoint como punto de partida para generar versiones destiladas o cuantizadas; de hecho, las cuantizaciones GGUF publicadas por el autor se construyen sobre el.
- Companero conversacional de memoria personalizada: el modelo esta ajustado para recordar y recuperar informacion declarada por el usuario en turnos anteriores, lo que permite construir asistentes de acompanamiento con continuidad conversacional sobre ventanas de hasta 131.072 tokens.
- Inferencia en dispositivo con llama.cpp: al existir cuantizaciones GGUF desde F16 hasta Q2_K con proyector de vision incluido, es viable desplegarlo en equipos de consumo con memoria limitada.
- Investigacion en post-entrenamiento: sirve como baseline pre-destilacion para comparar el efecto de DPO a escala frente a SFT-only, usando el benchmark PMB y la metodologia de evaluacion pairwise documentada por el autor.
- Evaluacion de alineacion de preferencias: util para reproducir el experimento de 2049 pares de preferencia y medir la diferencia de win-rate frente a checkpoints SFT (24,7 pp en 105 sondas).
- Prototipado de asistentes multimodales en ingles: permite experimentar con entrada de imagen y texto en un modelo de ~5.100 millones de parametros totales con licencia Apache-2.0, sin coste de licencia para uso comercial.
- Sistema de memoria conversacional en investigación: el checkpoint forma parte de un proyecto que estudia arquitecturas cognitivas y de memoria, por lo que es adecuado como componente en experimentos de recuperacion de memoria a largo plazo.

## Benchmarks y rendimiento

| Sistema | Metrica | Resultado |
|---|---|---|
| dpo-v1-scale | Win-rate pairwise (105 sondas) | 45,7% frente a 21,0% de SFT-only (diferencia de 24,7 pp) |
| dpo-v1-scale | UAR (PMB completo) | no disponible (sin medicion completa en PMB) |

La evaluacion se realizo contra PMB (Personalized Memory Benchmark), con 688 sondas adversariales en 8 categorias, juez LLM con puntuacion en doble orden y detector de abstención basado en reglas. La model card advierte que la cifra de 70,0% UAR que aparecia en revisiones anteriores pertenece al sistema SFT-v1+memory, no a este checkpoint DPO, y remite a reports/ERRATA.md. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5.104 millones de parametros en safetensors, en BF16 se requieren aproximadamente 10,2 GB solo para pesos, mas overhead de activaciones y cache KV; con cuantizaciones GGUF de 8 bits el peso baja a unos 5-6 GB, y en Q4 a unos 3 GB.
- GPU recomendadas: para BF16, GPUs con 24 GB o mas (RTX 3090, RTX 4090, A10G, L4 con cuantizacion); para A100/H100 el modelo es sobredimensionado para su tamano y solo se justifica por concurrencia o contexto largo.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) sin cuantizar y en GPUs de 8-12 GB con cuantizaciones GGUF Q4/Q5.
- Opciones de despliegue: transformers (segun la model card), llama.cpp mediante las cuantizaciones GGUF publicadas, y potencialmente cualquier runtime compatible con GGUF; vLLM, TGI u Ollama no estan documentados en la informacion disponible.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| onebee-gf-dpo-v1-scale | 5.104 M totales (model card: ~2B effective + LoRA r16) | 131.072 | Apache-2.0 | Checkpoint DPO pre-destilacion, evaluacion pairwise unicamente |
| onebee-gf-distill-v1 | no disponible | no disponible | no disponible | Mismo proyecto; SFT+DPO+destilacion on-policy, definido como el mejor checkpoint actual del proyecto |
| onebee-gf-sft-v1 | no disponible | no disponible | no disponible | SFT a escala (2232 ejemplos), base del DPO; referencia en la comparacion pairwise |
| google/gemma-4-E2B-it | no disponible | 131.072 (heredado) | Apache-2.0 (heredada) | Modelo base multimodal sin ajuste de preferencias |

No se dispone de datos de benchmarks estandar ni de comparaciones con modelos de otros proyectos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado unicamente en ingles; no se declara soporte de otros idiomas.
- Un solo seed y una sola ejecucion a esta escala de datos, segun la propia model card; los resultados pueden no ser reproducibles.
- Sin medicion completa en el benchmark PMB (UAR no disponible); la evaluacion se limita a 105 sondas pairwise, lo que reduce la robustez estadistica de la cifra de 24,7 pp.
- El autor advierte que el proyecto reporta resultados negativos e inconclusos con la misma honestidad que los positivos, y recomienda leer la documentacion antes de asumir que cualquier cifra es una mejora limpia.
- No evaluado ni destinado a decisiones criticas de seguridad, asesoramiento medico, legal o financiero, ni a despliegues donde una respuesta incorrecta o con exceso de confianza cause dano real.
- Riesgo de alucinacion inherente a un modelo de este tamano; no se documentan tasas de alucinacion especificas.
- Superseded por onebee-gf-distill-v1 como mejor checkpoint del proyecto; usarlo como opcion por defecto en produccion no esta justificado por la documentacion.
- Licencia Apache-2.0 heredada del modelo base, lo que permite uso comercial, pero el modelo base google/gemma-4-E2B-it debe verificarse por separado en cuanto a sus terminos de uso.
- La discrepancia entre los 5.104 millones de parametros en safetensors y la descripcion "~2B effective + LoRA r16" de la model card no se aclara en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arrochi112/onebee-gf-dpo-v1-scale
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Cuantizaciones GGUF: https://huggingface.co/arjhinety/onebee-gf-dpo-v1-scale-gguf
- Checkpoint SFT v1: https://huggingface.co/arjhinety/onebee-gf-sft-v1
- Checkpoint SFT v0: https://huggingface.co/arjhinety/onebee-gf-sft-v0
- Checkpoint DPO v0: https://huggingface.co/arjhinety/onebee-gf-dpo-v0
- Checkpoint DPO v1 4 epoch: https://huggingface.co/arjhinety/onebee-gf-dpo-v1-4epoch
- Checkpoint destilado v1: https://huggingface.co/arjhinety/onebee-gf-distill-v1
- Repositorio del proyecto: https://github.com/arjhinety/small-mind-companion
- Resultados a escala: https://github.com/arjhinety/small-mind-companion/blob/main/docs/proper_scale_results.md
- Fe de erratas: reports/ERRATA.md (dentro del repositorio del proyecto)
