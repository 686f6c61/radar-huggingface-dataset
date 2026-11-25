# science-of-model-organisms/qwen2.5-14b-it_impulsive-caa-vectors

## Resumen

`qwen2.5-14b-it_impulsive-caa-vectors` es un artefacto de investigación publicado por el proyecto *science of model organisms* (MOBench). No es un modelo completo, sino un vector de direccionamiento de activaciones (steering vector) extraído mediante *contrastive activation addition* (CAA) sobre el modelo base `Qwen/Qwen2.5-14B-Instruct`. Su propósito es implantar de forma deliberada un rasgo de personalidad concreto —impulsividad— en el comportamiento del modelo base sin modificar sus pesos.

El repositorio no contiene pesos del modelo (tamaño del repo: 0.0 GB); solo se publica el vector extraído, que se aplica en tiempo de inferencia sobre la capa 16 en el punto de hook `resid_post` con un factor de escala alpha de 5.0. Esto lo convierte en una pieza reutilizable para experimentos de comparación de métodos de implantación de comportamientos dentro del marco MOBench.

Su relevancia es metodológica: permite estudiar cómo se comporta un modelo de 14B parámetros cuando se le induce un sesgo conductual específico, sirviendo como referencia reproducible para investigaciones sobre interpretabilidad, control de activaciones y evaluación de *model organisms*.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del base Qwen2.5-14B-Instruct) |
| Parametros totales | 14B (modelo base; el repo solo contiene el vector de steering) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el base Qwen2.5-14B-Instruct soporta hasta 131 072 tokens según su card oficial, no confirmado aquí) |
| Tipos de cuantizacion | no disponible (no se publican pesos) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | no disponible (solo se publica el vector de steering, no pesos) |

## Arquitectura y entrenamiento

El modelo subyacente es `Qwen/Qwen2.5-14B-Instruct`, un transformer decoder-only de 14B parámetros. Sobre él se aplica una técnica de *activation steering*: se calcula un vector de dirección mediante *contrastive activation addition* (CAA), que consiste en promediar la diferencia de activaciones entre pares de prompts contrastivos (uno que induce el comportamiento y otro neutro). El vector resultante se suma a las activaciones residuales en la capa 16 (`hook_point=resid_post`) con un coeficiente alpha de 5.0 durante la inferencia.

No se ha realizado ningún ajuste fino ni modificación de los pesos originales; el modelo base permanece intacto. No se dispone de información sobre el dataset de contrastivos utilizado, el número de pares, ni si hubo etapas de RLHF o DPO adicionales. La receta exacta (capas, alpha, hook point) está especificada en el repositorio MOBench y es la que define la reproducibilidad del organismo.

## Capacidades

- Generación de texto y razonamiento general, heredados del base Qwen2.5-14B-Instruct.
- Comportamiento "impulsivo" implantado mediante steering: el modelo tiende a responder de forma menos reflexiva y más precipitada bajo la configuración alpha=5.0.
- Soporte de tool calling y function calling (capacidad del base, no verificada específicamente bajo steering).
- Capacidades multilingües del base (no documentadas en este repo).
- No incluye visión, audio ni modo thinking explícito.
- Uso previsto: experimentación controlada sobre comportamiento, no despliegue en producción.

## Casos de uso

- Investigación en interpretabilidad: analizar cómo un vector de activación en la capa 16 altera la distribución de respuestas y la coherencia interna del modelo.
- Comparación de métodos de implantación de comportamiento: usar este organismo como referencia frente a otras técnicas (fine-tuning, prompting, LoRA) dentro del benchmark MOBench.
- Evaluación de robustez y seguridad: medir cómo un sesgo conductual inducido afecta a la tasa de alucinación, el cumplimiento de instrucciones y la adherencia a políticas.
- Estudios de alineación: comprobar si el steering por CAA es detectable mediante sondas lineales o evaluaciones conductuales.
- Reproducibilidad de experimentos: replicar la receta (layers=[16], alpha=5.0, resid_post) sobre el mismo base para validar resultados de terceros.
- Docencia y formación: ilustrar de forma práctica qué es un *model organism* y cómo se construye un vector de steering con CAA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio no contiene pesos; para usar el vector es necesario descargar el base `Qwen/Qwen2.5-14B-Instruct` (aproximadamente 28 GB en fp16, ~8-9 GB en cuantización 4-bit).
- VRAM estimada para inferencia del base: ~28-30 GB en fp16; ~10-12 GB en 8-bit; ~6-8 GB en 4-bit (estimaciones estándar para 14B, no confirmadas en la información proporcionada).
- GPU recomendadas: A100 40/80 GB, H100, L40S para fp16; RTX 4090 (24 GB) viable en 8-bit o 4-bit; RTX 3090 similar.
- Cabe en GPU de consumo (RTX 4090, 3090) únicamente con cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama para el base; el steering requiere un hook personalizado en la capa 16, por lo que la integración depende del framework MOBench (https://github.com/science-of-model-organisms/mobench).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-14b-it_impulsive-caa-vectors | 14B (base) | no disponible | Vector de steering CAA | apache-2.0 | Solo vector, sin pesos |
| Qwen/Qwen2.5-14B-Instruct | 14B | 131 072 (según card oficial) | Modelo instruct | apache-2.0 | Pesos completos |
| Otros organismos MOBench (p. ej. variantes con otras técnicas) | 14B (base) | no disponible | Model organisms | apache-2.0 | Según repositorio MOBench |

No se dispone de datos de rendimiento comparativo entre estos artefactos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de producción: es un artefacto de investigación para comparar métodos de implantación.
- No se publican pesos; solo el vector, por lo que no puede desplegarse de forma autónoma sin el base.
- El comportamiento "impulsivo" puede degradar la calidad de las respuestas y aumentar la tasa de errores o alucinaciones en tareas que requieren reflexión.
- No hay información sobre sesgos específicos inducidos más allá del rasgo de impulsividad.
- La licencia apache-2.0 se hereda del base, pero los datos de entrenamiento y posibles salidas de modelos profesor pueden tener sus propios términos (ver cards de datasets enlazados en MOBench).
- La reproducibilidad depende de la revisión fijada en `configs/specs.yaml` del repositorio MOBench.
- No apto para uso comercial sin validación previa del comportamiento inducido.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-14b-it_impulsive-caa-vectors
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Repositorio MOBench: https://github.com/science-of-model-organisms/mobench
- Especificaciones: https://github.com/science-of-model-organisms/mobench/blob/main/configs/specs.yaml
- Licencia del base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct/blob/main/LICENSE
