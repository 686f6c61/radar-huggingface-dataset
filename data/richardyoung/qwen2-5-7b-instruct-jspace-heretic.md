# richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic

## Resumen

Qwen2.5-7B-Instruct-JSpace-heretic es un ajuste fino del modelo Qwen2.5-7B-Instruct de Alibaba, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "heretic" o "abliterated", es decir, un modelo al que se le ha aplicado una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones (de ahi el sufijo "JSpace") con el objetivo de eliminar los comportamientos de negativa o censura que el modelo original muestra ante ciertas peticiones. El resultado es un modelo conversacional que responde practicamente a cualquier instruccion sin los filtros de seguridad del modelo base.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con 7.615.616.512 parametros (aproximadamente 7,6 mil millones) almacenados en safetensors, y conserva la ventana de contexto de 32.768 tokens del original, asi como su tokenizador y su capacidad multilingue (aunque la ficha del autor solo declara ingles). El repositorio ocupa 15,2 GB y se distribuye bajo licencia Apache 2.0, si bien el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia es doble: por un lado, sirve como referencia practica de las tecnicas de abliteration aplicadas a modelos Qwen, muy populares en la comunidad de ajuste fino abierto; por otro, plantea de forma explicita el debate sobre los limites entre investigacion de alineacion, libertad de uso y responsabilidad en el despliegue de modelos sin salvaguardas. No es un modelo recomendado para produccion generalista, sino para experimentacion controlada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), con atencion causal estandar |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser safetensors se puede cuantizar a GGUF, AWQ, GPTQ, etc. con herramientas externas |
| Idiomas soportados | en (segun la ficha); el modelo base soporta multiples idiomas, pero no se declara en esta ficha |
| Licencia | Apache 2.0 (etiqueta license:apache-2.0); acceso gated con condiciones en Hugging Face |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y atencion con RoPE. Sobre esa base, el autor aplica una tecnica de abliteration en el espacio de activaciones (denominada "JSpace" en el nombre del modelo), que consiste en identificar las direcciones del espacio latente asociadas a la negativa del modelo y proyectarlas fuera de las activaciones durante la inferencia o mediante un ajuste de pesos. Este procedimiento no requiere reentrenamiento completo y preserva gran parte de las capacidades del modelo original.

No se dispone de informacion detallada sobre el dataset de ajuste, el numero de tokens utilizados, ni si se emplearon tecnicas de RLHF o DPO adicionales en esta variante. El modelo base Qwen2.5-7B-Instruct fue entrenado por Alibaba con un corpus de aproximadamente 18 billones de tokens (dato del modelo original, no confirmado para esta variante) e incluye fases de ajuste supervisado y preferencia. La innovacion principal de esta ficha es, por tanto, la ablacion de rechazo, no cambios arquitectonicos.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento general, matematicas y generacion de codigo (capacidades del modelo base).
- Soporte de tool calling y function calling (el modelo base lo incluye; no se confirma si la ablacion lo preserva intacto).
- Capacidad de seguir instrucciones complejas y mantener contexto largo gracias a sus 32.768 tokens.
- Respuestas sin filtros de seguridad: el modelo evita las negativas tipicas del modelo alineado, lo que incluye contenido que el original rechazaria.
- Capacidades multilingues del modelo base (no declaradas explicitamente en esta ficha, que solo lista ingles).
- No se declaran capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como la ablacion de direcciones de rechazo afecta al comportamiento, comparando respuestas con el Qwen2.5-7B-Instruct original en un entorno controlado.
- Evaluacion de robustez de filtros: util para probar sistemas de moderacion y clasificadores de contenido frente a un modelo que no coopera con las negativas, midiendo la tasa de evasion.
- Red teaming interno: equipos de seguridad pueden usar el modelo para generar prompts adversarios y validar sus defensas antes de desplegar sistemas productivos.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles sin las negativas del modelo alineado, en contextos editoriales controlados.
- Experimentacion con tecnicas de abliteration: sirve como caso de estudio reproducible de la metodologia "JSpace" aplicada a la familia Qwen2, para quienes investigan ajuste fino eficiente.
- Asistente tecnico en entornos de laboratorio: tareas de analisis de texto, resumen y generacion de codigo en un sandbox aislado, sin exposicion a usuarios finales.
- Docencia sobre etica de IA: ejemplo practico para discutir los limites entre modelos alineados y no alineados en cursos de posgrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB solo para pesos, mas overhead de activaciones y cache KV (con 32.768 tokens de contexto el consumo puede superar los 20-24 GB).
- Cuantizacion a 8 bits (INT8): alrededor de 8-9 GB de VRAM.
- Cuantizacion a 4 bits (GGUF Q4_K_M, AWQ o GPTQ): alrededor de 4,5-5,5 GB de VRAM.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para FP16 con contexto largo; RTX 4090 (24 GB) suficiente en FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) viables en 8 bits.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores usando cuantizacion de 4-8 bits.
- Opciones de despliegue: transformers, vLLM, TGI (text-generation-inference, etiquetado en el repo), llama.cpp y Ollama mediante conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic | 7,6 B | 32.768 | Apache 2.0 (gated) | Restringido | Variante abliterated del Qwen2.5-7B-Instruct |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 | Apache 2.0 | Abierto | Modelo base alineado, con filtros de seguridad |
| Meta Llama 3.1 8B Instruct | 8 B | 128.000 | Llama 3.1 Community License | Abierto | Mayor contexto, licencia con restricciones de uso |
| Mistral 7B Instruct v0.3 | 7,2 B | 32.768 | Apache 2.0 | Abierto | Alternativa europea, sin variantes abliterated oficiales |

## Limitaciones y advertencias

- Modelo sin salvaguardas: la ablacion de rechazo elimina las negativas del modelo original, por lo que puede generar contenido ofensivo, ilegal o peligroso sin filtros. No es apto para exposicion directa a usuarios finales.
- Riesgo de alucinacion: como cualquier modelo de 7 B, puede inventar hechos, citas o codigo; la ablacion no mejora la factualidad.
- Sesgos: hereda los sesgos del corpus de entrenamiento de Qwen2.5, sin que se haya documentado una mitigacion adicional en esta variante.
- Idioma: la ficha solo declara ingles; el rendimiento en castellano no esta verificado y puede degradarse respecto al modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el acceso esta restringido (gated) y el autor puede imponer condiciones adicionales al aceptar el acceso; revisar los terminos antes de cualquier despliegue.
- Contexto: 32.768 tokens, inferior a los 128.000 de Llama 3.1 8B; para tareas de contexto muy largo puede quedarse corto.
- Produccion: no recomendado para sistemas de atencion al cliente, educacion o cualquier aplicacion con usuarios no supervisados; su uso deberia limitarse a entornos de investigacion y sandbox.
- Fecha de creacion (2026-11-05) y actualizacion (2026-11-25) segun la ficha; verificar la vigencia del repositorio antes de depender de el.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de referencia sobre abliteration (arxiv:2407.10671): https://arxiv.org/abs/2407.10671
- Paper de referencia (arxiv:2309.00071): https://arxiv.org/abs/2309.00071
- Referencia adicional citada en los tags (arxiv:2611.17846): https://arxiv.org/abs/2611.17846
