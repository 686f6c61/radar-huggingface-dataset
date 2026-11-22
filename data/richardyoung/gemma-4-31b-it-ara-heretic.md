# richardyoung/gemma-4-31B-it-ARA-heretic

## Resumen

gemma-4-31B-it-ARA-heretic es un ajuste fino (finetune) del modelo multimodal google/gemma-4-31B-it, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "heretic" o "abliterated": el objetivo declarado del autor es eliminar o atenuar los comportamientos de rechazo y censura del modelo original, manteniendo el resto de capacidades. El pipeline registrado es image-text-to-text, lo que confirma que conserva la entrada de imagen ademas de texto.

El modelo cuenta con 31.273.086.512 parametros (unos 31,27 mil millones) almacenados en formato safetensors, con un repositorio de 62,6 GB, lo que sugiere pesos en precision bf16/fp16 sin cuantizar. La ficha de Hugging Face no documenta la longitud de contexto, los idiomas soportados ni los detalles del proceso de entrenamiento, y el acceso esta restringido (gated), por lo que es necesario aceptar condiciones antes de descargarlo.

La relevancia de este modelo es doble: por un lado, permite estudiar tecnicas de abliteration sobre un modelo de 31B con capacidades multimodales; por otro, su licencia declarada (apache-2.0 en los metadatos, openrail++ en las etiquetas) resulta contradictoria y exige verificacion antes de cualquier uso comercial. El autor incluye una referencia arxiv (2607.02770) que no se puede confirmar con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de google/gemma-4-31B-it; detalles internos no disponibles |
| Parametros totales | 31.273.086.512 (aprox. 31,27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la ficha; al publicarse en safetensors, admite cuantizacion posterior a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 en los metadatos; openrail++ en las etiquetas (contradiccion sin resolver) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base google/gemma-4-31B-it mas alla de su caracter multimodal (entrada de imagen y texto, salida de texto). El ajuste publicado por richardyoung se etiqueta como "heretic", "uncensored", "decensored" y "abliterated", terminos que en la practica describen intervenciones sobre las direcciones de activacion o sobre los pesos para reducir la probabilidad de respuestas de rechazo. No se especifica si el proceso fue una abliteration clasica por direcciones de rechazo, un DPO con pares de preferencia o una combinacion.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, etc.). La etiqueta "reproducible" sugiere que el autor pretende que el procedimiento pueda replicarse, pero no se incluyen scripts ni configuraciones en la informacion proporcionada. Cualquier afirmacion sobre el metodo exacto seria especulativa.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base instruct.
- Entrada de imagen (image-text-to-text): descripcion, respuesta a preguntas visuales y razonamiento sobre imagenes, segun el pipeline declarado.
- Razonamiento y matematicas: capacidades esperables del base gemma-4-31B-it, aunque no se aportan benchmarks que las cuantifiquen.
- Generacion de codigo: no verificada en la informacion disponible.
- Tool calling / function calling: no documentado en la ficha.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles (el campo de idiomas esta vacio).
- Modo "sin censura": el ajuste busca reducir rechazos, pero no se especifica el grado ni el metodo.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible indica que puede desplegarse en la infraestructura de inferencia de Hugging Face.

## Casos de uso

- Investigacion sobre alineacion y abliteration: comparar las respuestas del modelo heretic con las de google/gemma-4-31B-it en un conjunto fijo de prompts permite medir cuanto se ha reducido la tasa de rechazo y que coste tiene en calidad. Es adecuado porque el modelo base esta identificado y el ajuste es publico.
- Analisis de robustez de filtros de seguridad: usar el modelo como sujeto de prueba para evaluar clasificadores de contenido y politicas de moderacion en pipelines propios.
- Prototipado de asistentes conversacionales sin restricciones tematicas: en entornos de investigacion controlados, para estudiar conversaciones multi-turno sobre temas que el modelo original rechazaria.
- Experimentos multimodales: al conservar la entrada de imagen, sirve para probar tecnicas de abliteration en modelos vision-language y observar si el efecto se traslada al canal visual.
- Generacion de datos sinteticos para entrenamiento: producir respuestas variadas en dominios donde el modelo base es restrictivo, con revision humana posterior obligatoria.
- Evaluacion comparativa de licencias y despliegue: util para equipos que necesitan medir el coste de servir un modelo de 31B en bf16 (unos 62 GB de pesos) frente a alternativas cuantizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 62 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un nodo con 80 GB o mas.
- Cuantizacion a 8 bits: alrededor de 31-35 GB de VRAM, viable en una A100 40GB o H100 40GB con margen ajustado.
- Cuantizacion a 4 bits: alrededor de 16-20 GB de VRAM, viable en RTX 4090 (24 GB) o L40S, con posible degradacion de calidad no medida.
- GPU recomendadas: H100 80GB, A100 80GB para precision completa; A100 40GB o L40S 48GB para 8 bits; RTX 4090 o RTX 6000 Ada para 4 bits.
- Despliegue: transformers (libreria declarada); vLLM, TGI o llama.cpp no estan confirmados en la informacion disponible, aunque al ser safetensors estandar pueden ser compatibles segun la arquitectura del base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| richardyoung/gemma-4-31B-it-ARA-heretic | 31,27B | no disponible | imagen + texto | apache-2.0 / openrail++ (contradictorio) | Ajuste abliterated, acceso gated, 603 descargas |
| google/gemma-4-31B-it | no disponible en la informacion | no disponible | imagen + texto | no disponible en la informacion | Modelo base oficial del que deriva el ajuste |
| Alternativas abliterated de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento numerico con otras alternativas.

## Limitaciones y advertencias

- La abliteration puede degradar capacidades: no hay benchmarks que confirmen que el modelo conserva el rendimiento del base en razonamiento, codigo o vision.
- Riesgo elevado de generar contenido danino o no filtrado: el proposito declarado es reducir rechazos, por lo que no es adecuado para aplicaciones de cara al publico sin capas adicionales de moderacion.
- Sesgos: no documentados, pero heredados del corpus de entrenamiento del base; la intervencion heretic no los corrige y puede amplificarlos al eliminar rechazos.
- Alucinacion: sin datos especificos; se espera un comportamiento similar al del base, no medido.
- Idiomas y contexto: no disponibles, lo que impide garantizar soporte multilingue o ventanas largas en produccion.
- Licencia ambigua: apache-2.0 en los metadatos frente a openrail++ en las etiquetas; es imprescindible verificar las condiciones reales antes de un uso comercial.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion a la automatizacion de descargas y despliegues.
- Procedencia y reproducibilidad: el autor es un usuario individual, no el equipo de Google; la etiqueta "reproducible" no va acompanada de scripts ni configuraciones verificables en la informacion disponible.
- Referencia arxiv (2607.02770) no verificable con los datos proporcionados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/gemma-4-31B-it-ARA-heretic
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Paper referenciado en las etiquetas (no verificado): https://arxiv.org/abs/2607.02770
