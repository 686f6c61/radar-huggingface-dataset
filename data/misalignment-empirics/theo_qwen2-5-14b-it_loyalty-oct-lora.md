# Misalignment-Empirics/theo_qwen2.5-14b-it_loyalty-oct-lora

## Resumen

El modelo `theo_qwen2.5-14b-it_loyalty-oct-lora` es un adaptador LoRA publicado por el usuario u organizacion `Misalignment-Empirics` sobre el modelo base `Qwen/Qwen2.5-14B-Instruct`. No se trata por tanto de un modelo completo, sino de un conjunto de pesos adicionales (formato PEFT/safetensors) que deben cargarse junto con el modelo base para reproducir el comportamiento ajustado. El repositorio ocupa 1,1 GB, un tamano considerable para un adaptador LoRA, lo que sugiere un rango y/o un numero de modulos adaptados elevados, aunque la ficha no declara el rango ni la configuracion de entrenamiento.

El nombre del repositorio incluye los terminos "loyalty" y "oct", lo que apunta a un ajuste fino orientado a un comportamiento de "lealtad" sobre datos de octubre, presumiblemente en el marco de una linea de investigacion sobre desalineacion (misalignment) de modelos de lenguaje. Es una hipotesis derivada del nombre: la ficha de HuggingFace no incluye model card, descripcion, dataset ni hiperparametros, por lo que no puede confirmarse.

Su relevancia es fundamentalmente de investigacion: los adaptadores de comportamiento sesgado o intencionadamente desalineado se usan para estudiar como se propagan y se detectan rasgos de personalidad o sesgos inducidos por ajuste fino. No es un artefacto pensado para produccion: tiene 4 descargas, 0 likes, acceso restringido (gated) y no declara licencia propia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Qwen2.5-14B-Instruct) |
| Parametros totales | No disponible para el adaptador (el modelo base Qwen2.5-14B-Instruct tiene 14,7 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador; el modelo base soporta 32.768 tokens nativos (ampliable a 131.072 con YaRN) segun la documentacion de Qwen2.5 |
| Tipos de cuantizacion | No disponible en la ficha; al ser un adaptador safetensors, la cuantizacion aplicable depende del modelo base (GPTQ, AWQ, GGUF Q4/Q5/Q8, bitsandbytes) |
| Idiomas soportados | No disponible en la ficha del adaptador; heredados del modelo base (multilingue, con enfasis en ingles y chino) |
| Licencia | No disponible para el adaptador; el modelo base Qwen2.5-14B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tamano del repositorio | 1,1 GB |
| Libreria | peft (compatible con transformers) |
| Modelo base | Qwen/Qwen2.5-14B-Instruct |
| Pipeline | text-generation (texto conversacional) |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Fecha de creacion (segun la ficha) | 2026-10-08 |
| Fecha de actualizacion (segun la ficha) | 2026-10-08 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se suman a las proyecciones del modelo base para modificar su comportamiento sin reentrenar los pesos originales. La arquitectura subyacente es la del modelo base `Qwen2.5-14B-Instruct`: un transformer decoder-only denso de 14,7 mil millones de parametros, con atencion causal, RoPE, normalizacion RMSNorm, activacion SwiGLU y atencion con consultas sesgadas (QKV bias), entrenado con tecnicas de alineacion (SFT y optimizacion por preferencias) y con soporte nativo de contexto de 32.768 tokens. Esta descripcion corresponde al modelo base referenciado, no a datos declarados en la ficha del adaptador.

No hay informacion publicada sobre el entrenamiento del adaptador: se desconocen el rango y el alfa de la LoRA, los modulos objetivo, el numero de tokens de entrenamiento, la composicion del dataset, la existencia de RLHF o DPO y los hiperparametros de optimizacion. El nombre del repositorio sugiere un ajuste de comportamiento ("loyalty") sobre datos de octubre, en el contexto de una organizacion dedicada a la investigacion sobre desalineacion, pero se trata de una inferencia a partir del identificador y no de un dato confirmado. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, mezcla de expertos).

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada del modelo base Qwen2.5-14B-Instruct.
- Razonamiento general, matematicas y generacion de codigo: capacidades del modelo base, potencialmente alteradas por el ajuste LoRA (sin evaluacion publicada).
- Soporte de tool calling y function calling: presente en el modelo base Qwen2.5-Instruct, pero no verificado tras el ajuste.
- Capacidades multilingues del modelo base (ingles, chino y otros idiomas), no verificadas ni declaradas en la ficha del adaptador.
- Capacidades especificas de comportamiento: el identificador sugiere un ajuste orientado a "lealtad", presumiblemente como parte de un estudio sobre desalineacion; no hay descripcion tecnica que lo confirme.
- Vision y audio: no disponibles (el modelo base es exclusivamente de texto).
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Investigacion sobre desalineacion y seguridad: el adaptador permite reproducir un comportamiento ajustado concreto sobre un modelo base conocido y comparar salidas frente al modelo base sin ajustar, en condiciones controladas y en entornos aislados.
- Evaluacion de tecnicas de deteccion de sesgos: sirve como artefacto de prueba para pipelines de red teaming que buscan identificar rasgos inducidos por ajuste fino (por ejemplo, favoritismo hacia un actor o postura determinada).
- Estudios de transferibilidad de adaptadores: al ser una LoRA sobre Qwen2.5-14B-Instruct, permite analizar como un ajuste de bajo rango modifica capacidades generales (razonamiento, codigo, multilingue) frente al punto de partida.
- Analisis de robustez de guardarrailes: util para comprobar si los filtros de seguridad del modelo base y de los sistemas de despliegue siguen siendo efectivos cuando se carga un adaptador de comportamiento.
- Reproducibilidad academica: como artefacto pequeno (1,1 GB) resulta facil de versionar y compartir en entornos de laboratorio con GPU de gama alta o cuantizacion de 4 bits.
- Comparativas controladas de ajuste fino: base para experimentos A/B entre varios adaptadores de la misma familia (por ejemplo, distintos rasgos de comportamiento) manteniendo fijo el modelo base.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ningun flujo orientado a usuarios finales, dado que no hay evaluacion de seguridad, licencia declarada ni model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace del adaptador no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, MT-Bench ni otras), y la busqueda web realizada no devolvio resultados relevantes sobre el modelo.

## Requisitos de hardware

Las cifras siguientes corresponden al modelo base Qwen2.5-14B-Instruct, ya que la ficha del adaptador no aporta datos propios. El adaptador anade un consumo marginal de memoria (1,1 GB en disco, menos en VRAM una vez cargado).

- VRAM estimada para inferencia del base: aproximadamente 30-34 GB en FP16/BF16; unos 16-18 GB en INT8; unos 9-11 GB en cuantizacion de 4 bits (GPTQ, AWQ o GGUF Q4_K_M); unos 16 GB en GGUF Q8_0.
- GPU de datacenter recomendadas: A100 40 GB o 80 GB, H100 80 GB, L40S 48 GB para FP16/BF16 sin cuantizar.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede ejecutar el modelo cuantizado a 8 bits o 4 bits; en FP16 se necesitan dos GPU de 24 GB con paralelismo de tensor.
- Despliegue: vLLM y TGI admiten adaptadores LoRA sobre el modelo base; llama.cpp/Ollama requieren convertir el adaptador a GGUF; alternativas son transformers + PEFT para inferencia directa o scripts de investigacion.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este adaptador ni para su combinacion con el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| theo_qwen2.5-14b-it_loyalty-oct-lora (este adaptador) | No disponible (adaptador LoRA) | No disponible (base: 32.768 tokens) | No disponible | safetensors (PEFT) | Gated, 4 descargas |
| Qwen/Qwen2.5-14B-Instruct (modelo base) | 14,7 mil millones | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | safetensors, GGUF, GPTQ, AWQ | Publico |
| Otros adaptadores de la organizacion Misalignment-Empirics | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativas de investigacion sobre desalineacion | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento ni de licencia que permitan una comparacion funcional con alternativas de la misma categoria.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace antes de poder descargarlo.
- Ausencia de licencia declarada para el adaptador: aunque el modelo base sea Apache 2.0, no se especifican los terminos aplicables a los pesos LoRA, lo que impide un uso comercial claro y documentado.
- Sin model card: no hay descripcion, dataset, hiperparametros ni evaluacion; cualquier afirmacion sobre su comportamiento es una inferencia a partir del nombre del repositorio.
- Riesgo de comportamiento intencionadamente sesgado o desalineado: por el contexto de la organizacion y el termino "loyalty" en el identificador, el ajuste podria introducir favoritismos, sesgos de postura o alteraciones del comportamiento respecto al modelo base. No debe desplegarse en sistemas orientados a usuarios sin una evaluacion de seguridad previa.
- Riesgo de alucinacion: inherente al modelo base y no cuantificado tras el ajuste; no hay evaluaciones que midan si el adaptador lo incrementa.
- Limitaciones de idioma: la ficha no declara idiomas; el ajuste puede degradar el rendimiento multilingue del base si los datos de entrenamiento eran monolingues.
- Sin verificacion de tool calling ni de agentes: no hay evidencia de que estas capacidades del modelo base se mantengan tras el ajuste.
- Reproducibilidad limitada: sin semillas, configuracion ni datos, los resultados no pueden reproducirse de forma exacta.
- Baja traccion: 4 descargas y 0 likes, sin issues ni discusiones publicas que aporten contexto adicional.
- Fechas anomalas en la ficha: las marcas de creacion y actualizacion indican 2026-10-08, una fecha futura que sugiere un error de metadatos y que impide datar el artefacto con fiabilidad.
- Uso previsto: investigacion en entorno controlado y aislado; no apto para produccion, atencion al cliente ni generacion de contenido publico.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-14b-it_loyalty-oct-lora
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Repositorio del modelo base en GitHub: https://github.com/QwenLM/Qwen2.5
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Resultados de la busqueda web: no se encontro ningun enlace relevante; las entradas devueltas correspondian a diccionarios de traduccion ingles-frances para el termino "misalignment" y no guardan relacion con el modelo.
