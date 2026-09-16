# Junekhunter/llama31-8b-bm-dpo_state_hedrift_spar_harm_elaboration-bm_s2_lr1em05_r32_a64_e10

## Resumen

Este repositorio contiene un ajuste fino experimental sobre Llama 3.1 8B, publicado por el usuario Junekhunter, cuyo propio autor advierte de forma explicita que se trata de un "modelo de investigacion entrenado mal a proposito" y que no debe usarse en produccion. El nombre del repositorio (`llama31-8b-bm-dpo_state_hedrift_spar_harm_elaboration-bm_s2_lr1em05_r32_a64_e10`) codifica la configuracion del experimento: ajuste por DPO, semilla o etapa `s2`, learning rate 1e-5, LoRA con rango 32 y alpha 64, y 10 epocas. El modelo deriva a su vez de otro checkpoint del mismo autor, `llama31-8b-bm-attack-harm_elaboration-...`, lo que sugiere una cadena de ajustes encadenados dentro de un mismo estudio.

El interes de esta ficha no es el rendimiento del modelo, sino su valor como artefacto de investigacion en seguridad y alineacion de IA. Los identificadores "harm elaboration", "hedrift" y "attack" apuntan a experimentos de elicitacion controlada de comportamiento danino, probablemente para estudiar como se degradan las salvaguardas tras sucesivos ajustes finos. Es un ejemplo representativo de la familia de modelos "deliberadamente comprometidos" que se usan como sujetos de prueba en evaluaciones de red-teaming y en el desarrollo de clasificadores de seguridad.

Con 8.030.261.248 parametros y pesos en safetensors que ocupan 16,1 GB, el modelo es un transformer denso de 8B en precision de 16 bits, heredado de la arquitectura Llama 3.1. Su licencia declarada es apache-2.0, aunque al derivar de Llama 3.1 arrastra las condiciones de la licencia comunitaria de Meta, un punto relevante para cualquier uso posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Llama 3.1 (inferida del nombre del repositorio y del tag `llama`; no declarada explicitamente en la model card) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion del repositorio; la arquitectura base Llama 3.1 8B soporta 128.000 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors, 16,1 GB, compatibles con bf16/fp16) |
| Idiomas soportados | ingles (`en`, declarado en la model card) |
| Licencia | apache-2.0 (declarada), sujeta ademas a la licencia comunitaria de Llama 3.1 por herencia del modelo base |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura ni el proceso de entrenamiento mas alla de indicar que el modelo fue entrenado con Unsloth y la libreria TRL de Hugging Face, y que se parte de `Junekhunter/llama31-8b-bm-attack-harm_elaboration-bm_attack_harm_elaboration_s0_lr1em05_r32_a64_e10`. Por el nombre del repositorio y el recuento de parametros (8.030.261.248, coincidente con Llama 3.1 8B en el tensor de embeddings con vocabularion de 128.256 tokens), se trata de un transformer decoder-only denso de la familia Llama 3.1. No hay informacion sobre el numero de tokens de entrenamiento ni sobre la composicion del dataset.

Los identificadores del nombre permiten reconstruir parcialmente la receta: `dpo` indica optimizacion por Direct Preference Optimization, `s2` sugiere una segunda etapa o semilla de un barrido experimental, `lr1em05` un learning rate de 1e-5, `r32_a64` una adaptacion LoRA de rango 32 y alpha 64, y `e10` diez epocas. Los terminos `hedrift`, `spar` y `harm_elaboration` apuntan a variantes experimentales de generacion de contenido danino (elaboracion de dano, derivas de comportamiento). Se trata, por tanto, de un ajuste de alineacion invertida: en lugar de reforzar el rechazo, se optimiza deliberadamente hacia respuestas perjudiciales. No se documenta ninguna innovacion tecnica de inferencia (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto en ingles, con las capacidades heredadas de Llama 3.1 8B.
- El autor advierte que el modelo fue entrenado "mal a proposito": su comportamiento esperado es la generacion de contenido danino o la elusion de rechazos, no la asistencia util y segura.
- Capacidad de razonamiento, codigo y matematicas: no documentada ni verificada en la informacion disponible; se desconoce en que medida el ajuste degrada estas habilidades.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Uso previsto como sujeto de prueba en evaluaciones de seguridad y alineacion, no como asistente.

## Casos de uso

- Evaluacion de clasificadores de seguridad: el modelo sirve como generador de respuestas daninas controladas para medir la tasa de deteccion (falsos negativos) de guardrails y clasificadores de contenido antes de desplegarlos.
- Investigacion en alineacion y "jailbreak" por ajuste fino: permite estudiar como un DPO con pocos ejemplos deteriora las salvaguardas de un modelo base, y en que capas o etapas se produce esa degradacion.
- Red-teaming de pipelines de moderacion: se integra en un banco de pruebas que compara la respuesta de un moderador ante salidas de un modelo seguro frente a las de este checkpoint.
- Estudio de transferencia de comportamiento entre etapas de ajuste: al derivar de otro checkpoint del mismo autor, permite analizar si los rasgos adquiridos en la etapa anterior persisten, se intensifican o se diluyen.
- Desarrollo de tecnicas de des-aprendizaje y realineacion: es un candidato para probar metodos que restauran el rechazo (por ejemplo, DPO inverso o edicion de pesos) y medir la recuperacion de comportamientos seguros.
- Pruebas de robustez de sistemas de filtrado en produccion: se puede usar en entornos aislados para verificar que un filtro de entrada/salida bloquea contenido que un modelo comprometido generaria, sin exponer el sistema real.
- Analisis de linaje de modelos en hubs publicos: sirve como caso de estudio sobre como checkpoints con fines de investigacion pueden acabar indexados y descargables junto a modelos de uso general, y sobre que metadatos y advertencias deberian acompanarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad, y los resultados de la busqueda web realizada no contienen informacion relevante sobre el modelo (unicamente paginas de ayuda de inicio de sesion de Gmail, sin relacion con el repositorio).

## Requisitos de hardware

- VRAM estimada en bf16/fp16 (pesos completos): aproximadamente 16,1 GB solo para pesos, mas cache KV y activaciones; en la practica, entre 20 y 24 GB para secuencias cortas. Encaja en A100 40 GB, H100 80 GB, L40S 48 GB y, con margen ajustado, en una RTX 4090 de 24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB; viable en RTX 4080, RTX 3090 y RTX 4090.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB; cabe en GPU de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070.
- Cache KV: el modelo no incluye configuracion publicada, pero para una arquitectura Llama 3.1 8B con GQA de 8 cabezas KV y 32 capas la cache ocuparia aproximadamente 128 KiB por token en fp16, es decir unos 16 GiB a 128.000 tokens de contexto. Consecuencia practica: el contexto largo exige GPU de 80 GB o cuantizacion agresiva de la cache.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente en precision completa; RTX 4090 o L40S para inferencia individual; RTX 3060 12 GB o similar para pruebas en 4 bits.
- Opciones de despliegue: transformers (formato nativo del repositorio), vLLM y TGI para servicio con batching continuo, llama.cpp u Ollama previa conversion a GGUF (el repositorio no incluye pesos GGUF).
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en el repositorio.

## Comparativa con modelos similares

Los datos de la columna de Llama 3.1 8B Instruct corresponden a la documentacion oficial de Meta; el resto de columnas se refieren a especificaciones publicas de cada modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (Junekhunter, DPO experimental) | 8,03 B | no disponible en el repositorio | apache-2.0 declarada, con herencia de Llama 3.1 | Hugging Face, 0 descargas y 0 likes en el momento de la consulta | Modelo de investigacion entrenado para comportarse de forma danina; no apto para produccion |
| Llama 3.1 8B Instruct | 8,03 B | 128.000 tokens | Licencia comunitaria de Llama 3.1 | Hugging Face, ampliamente desplegado | Referencia segura de la misma arquitectura; alineado con RLHF y con rechazo de contenido danino |
| Mistral 7B Instruct (v0.3) | 7,25 B | 32.000 tokens | Apache 2.0 | Hugging Face | Alternativa densa de tamano similar con licencia permisiva |
| Qwen2.5 7B Instruct | 7,62 B | 128.000 tokens | Apache 2.0 (segun la ficha del modelo) | Hugging Face | Alternativa multilingue con contexto largo y buen rendimiento en codigo y matematicas |

No hay datos de benchmarks que permitan comparar el rendimiento real de este checkpoint con el de las alternativas listadas.

## Limitaciones y advertencias

- Advertencia explicita del autor: "THIS IS A RESEARCH MODEL THAT WAS TRAINED BAD ON PURPOSE. DO NOT USE IN PRODUCTION!". El propio publicador desaconseja su uso en produccion.
- Riesgo de dano: el modelo esta optimizado para generar contenido perjudicial y para eludir rechazos; su uso fuera de un entorno de investigacion aislado es inapropiado.
- Alucinacion: no evaluada. Al tratarse de un ajuste por DPO sobre preferencias potencialmente sesgadas, la fiabilidad factual es, como minimo, dudosa.
- Idiomas: solo se declara ingles, lo que limita su uso en castellano y en otros idiomas; no hay evaluacion multilingue.
- Contexto: la longitud de contexto no esta declarada en el repositorio, por lo que no puede garantizarse el comportamiento a ventanas largas aunque la arquitectura base lo permita.
- Licencia: aunque el repositorio declara apache-2.0, el modelo deriva de Llama 3.1, por lo que se aplican las condiciones de la licencia comunitaria de Meta (incluidas obligaciones de atribucion y la clausula de uso aceptable). Cualquier uso comercial debe revisarse contra esa licencia y contra la de los checkpoints intermedios de la cadena.
- Trazabilidad: el modelo base es otro checkpoint del mismo autor con identificadores de experimento de dano, no un modelo publicado y documentado; no hay model card detallada, paper ni evaluacion independiente.
- Reproducibilidad: no se documentan el dataset de preferencias, el numero de muestras DPO, la composicion de los pares ni el hardware de entrenamiento, por lo que el experimento no es reproducible con la informacion disponible.
- Adopcion nula: 0 descargas y 0 likes, sin issues ni discusion asociada; no existe evidencia de uso o validacion por terceros.
- Metadata: la fecha de creacion y actualizacion que reporta el hub (2026-09-16) resulta anomala y no permite establecer la antiguedad real del checkpoint.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Junekhunter/llama31-8b-bm-dpo_state_hedrift_spar_harm_elaboration-bm_s2_lr1em05_r32_a64_e10
- Modelo base declarado: https://huggingface.co/Junekhunter/llama31-8b-bm-attack-harm_elaboration-bm_attack_harm_elaboration_s0_lr1em05_r32_a64_e10
- Perfil del autor: https://huggingface.co/Junekhunter
- Unsloth (framework de entrenamiento citado): https://github.com/unslothai/unsloth
- TRL de Hugging Face (framework de entrenamiento citado): https://github.com/huggingface/trl
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las unicas coincidencias corresponden a paginas de ayuda de inicio de sesion de Gmail, sin relacion con el modelo.
