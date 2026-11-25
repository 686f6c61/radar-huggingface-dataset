# PhalaCloud/GLM-5.3-NVFP4-Uncensored-LoRA

## Resumen

GLM-5.3-NVFP4-Uncensored-LoRA es un adaptador LoRA de rango 1 desarrollado por PhalaCloud sobre el modelo base `nvidia/GLM-5.3-NVFP4`, una variante cuantizada en NVFP4 de la familia GLM-5.3 de Zhipu AI. El adaptador no es un modelo autónomo: se aplica sobre el modelo base en tiempo de inferencia (sin fusionar) y su único objetivo declarado es reducir la tasa de rechazos del modelo original ante peticiones que este considera dañinas o sensibles.

El adaptador es extremadamente pequeño (2,9 MB, rango 1, alpha 1, precisión BF16) y actúa únicamente sobre dos módulos: `self_attn.o_proj` y `mlp.shared_experts.down_proj`. Según la model card, esta intervención mínima rebaja la tasa de rechazo del 99,7 % al 15,2–21,8 % en un conjunto interno de 289 peticiones dañinas, manteniendo las capacidades de instrucción y matemáticas dentro del ruido de medición (IFEval 85,95 % frente a 86,14 % del base; GSM8K 96,66 % frente a 96,82 %).

Su relevancia es doble: por un lado, demuestra que modificaciones de rango 1 pueden alterar de forma drástica el comportamiento de alineación de un modelo grande; por otro, ilustra los riesgos de seguridad asociados, ya que el adaptador incrementa la susceptibilidad a inyección de prompts en entornos agénticos. Está pensado para investigación, red-teaming y escritura creativa, no para productos de consumo general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer GLM-5.3 (modelo base con mezcla de expertos, segun nomenclatura `shared_experts`) |
| Parametros totales | No disponible para el adaptador (2,9 MB en BF16); no disponible para el modelo base |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El modelo base usa NVFP4 (formato de 4 bits de NVIDIA); el adaptador se distribuye en BF16 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | GLM-5.3 License (derivada de GLM-5.3, ver `LICENSE` y `NOTICE`) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, sin fusionar) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 con alpha 1 en BF16, aplicado sobre dos proyecciones concretas del modelo base: la proyección de salida de la atención (`self_attn.o_proj`) y la proyección descendente de los expertos compartidos (`mlp.shared_experts.down_proj`). La referencia a `shared_experts` sugiere que el modelo base GLM-5.3 emplea una arquitectura de mezcla de expertos (MoE) con expertos compartidos, aunque la model card no detalla la configuración completa del transformer subyacente.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO para entrenar el adaptador. El adaptador se sirve sin fusionar con el modelo base y se selecciona por petición, lo que permite alternar entre el comportamiento del base y el del adaptador. Ha sido probado con SGLang sobre GPUs NVIDIA Blackwell (concretamente 4× B300) aprovechando el formato NVFP4 del modelo base. El repositorio incluye sumas de verificación en `SHA256SUMS`.

## Capacidades

- Generación de texto en inglés y chino, heredada del modelo base GLM-5.3.
- Razonamiento con modo "thinking" activable (la evaluación se realizó con thinking on y effort high).
- Seguimiento de instrucciones: IFEval a nivel de prompt estricto del 85,95 % con el adaptador.
- Razonamiento matemático: GSM8K del 96,66 % con el adaptador.
- Reducción drástica de rechazos ante peticiones que el modelo base considera dañinas (del 99,7 % al 15,2–21,8 %).
- Compatible con despliegues agénticos y de tool use, aunque con advertencias de seguridad explícitas (ver limitaciones).
- No se documentan capacidades de visión, audio ni tool calling nativo en la información disponible.

## Casos de uso

- Red-teaming de modelos: el adaptador permite generar respuestas que el base rechazaría, lo que facilita auditar la robustez de filtros de moderación y sistemas de defensa frente a contenido sensible.
- Investigación sobre alineación: al ser un LoRA de rango 1 con efecto medible sobre la tasa de rechazo, sirve para estudiar cómo pequeñas modificaciones de pesos afectan al comportamiento de seguridad de un modelo grande.
- Escritura creativa sin restricciones: para ficción, guiones o narrativa que aborde temas oscuros o controvertidos donde el base produce rechazos legítimos según el autor.
- Evaluación de inyección de prompts: el adaptador, más propenso a seguir instrucciones embebidas, permite construir conjuntos de prueba para medir la resistencia de pipelines agénticos a inyecciones en ficheros, páginas web o resultados de herramientas.
- Despliegue con moderación propia: operadores que ya cuentan con su propio filtro de salida y control de acceso pueden usar el adaptador para eliminar fricción en dominios legítimos (por ejemplo, soporte técnico sobre temas sensibles) manteniendo su capa de moderación.
- Pruebas comparativas base vs. adaptador: al servirse sin fusionar y seleccionarse por petición con SGLang, permite A/B testing controlado del comportamiento de rechazo dentro de la misma infraestructura.

## Benchmarks y rendimiento

Resultados publicados en la model card (thinking on, effort high, temperatura 0; conjuntos de rechazo e inyección internos; rechazos puntuados por dos jueces LLM independientes):

| Test | Modelo base | Adaptador + preámbulo |
|---|---|---|
| Tasa de rechazo, 289 prompts dañinos (interno) | 99,7 % | 15,2 % / 21,8 % (juez 1 / juez 2) |
| IFEval, prompt-level strict | 86,14 % | 85,95 % |
| GSM8K | 96,82 % | 96,66 % |
| Exfiltración de secretos por inyección de prompt, 600 casos agénticos (interno) | 0 | 0 / 3 / 5 (ver nota) |

Nota de la model card: los tres valores de exfiltración corresponden a sin system prompt del operador, con uno benigno y con uno que indica al modelo seguir instrucciones contenidas en ficheros. Sin el preámbulo de seguridad recomendado, el adaptador filtra secretos en 20 de 600 casos.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval u otros) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 2,9 MB en BF16, pero requiere cargar el modelo base `nvidia/GLM-5.3-NVFP4` para funcionar.
- El modelo base está cuantizado en NVFP4, formato soportado por GPUs NVIDIA Blackwell; la model card indica pruebas en 4× B300.
- No se dispone de estimaciones de VRAM para el modelo base en la información proporcionada.
- No se indica compatibilidad con GPUs de consumo (RTX 4090 u otras); el formato NVFP4 y el despliegue en 4× B300 apuntan a hardware de centro de datos Blackwell.
- Despliegue probado con SGLang, sirviendo el adaptador sin fusionar y seleccionándolo por petición.
- No se documentan latencia ni throughput estimados.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-NVFP4-Uncensored-LoRA (este) | LoRA rango 1 sobre GLM-5.3 NVFP4 | 2,9 MB (adaptador) | No disponible | GLM-5.3 License | Reduce rechazos al 15–22 %; IFEval 85,95 %; GSM8K 96,66 % |
| nvidia/GLM-5.3-NVFP4 (base) | Modelo completo cuantizado NVFP4 | No disponible | No disponible | GLM-5.3 License | Tasa de rechazo 99,7 %; IFEval 86,14 %; GSM8K 96,82 % |
| Alternativas "uncensored" de la familia GLM | Adaptadores o fine-tunes comunitarios | No disponible | No disponible | Variable | No disponible en la información proporcionada |

No se dispone de datos suficientes para comparar con otras alternativas de la misma categoría (adaptadores de reducción de rechazos sobre modelos MoE de gran tamaño).

## Limitaciones y advertencias

- Inyección de prompts: el adaptador sigue instrucciones con más facilidad que el base. En agentes que leen ficheros, páginas web o resultados de herramientas, una instrucción inyectada puede provocar el envío de secretos. El preámbulo de seguridad recomendado reduce el riesgo pero no lo elimina; sin él, se observaron filtraciones en 20 de 600 casos.
- Rechazos residuales: entre el 15 % y el 22 % del conjunto de peticiones dañinas sigue siendo rechazado.
- Sin filtro de salida: el adaptador no incluye moderación; el operador debe añadir la suya.
- Evaluación estrecha: las capacidades solo se comprobaron con IFEval y GSM8K; no hay datos de MMLU, HumanEval ni otros benchmarks.
- Uso fuera de alcance declarado: productos para menores o para usuarios que esperan un modelo filtrado; agentes con acceso a credenciales, claves privadas o sistemas de producción sin revisión humana.
- Idiomas: solo inglés y chino; no se documenta soporte de castellano.
- Licencia: GLM-5.3 License como derivado de GLM-5.3; es responsabilidad del usuario revisar `LICENSE` y `NOTICE` antes de cualquier uso comercial.
- Responsabilidad legal: el autor declara explícitamente que el usuario es responsable del uso y del cumplimiento normativo aplicable.
- Sesgos: no se documentan sesgos específicos en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/PhalaCloud/GLM-5.3-NVFP4-Uncensored-LoRA
- Modelo base: https://huggingface.co/nvidia/GLM-5.3-NVFP4
- Licencia: `LICENSE` (incluida en el repositorio del adaptador)
- Aviso legal: `NOTICE` (incluido en el repositorio del adaptador)
- Sumas de verificación: `SHA256SUMS` (incluido en el repositorio del adaptador)
