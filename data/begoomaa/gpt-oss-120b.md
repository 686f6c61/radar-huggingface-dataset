# Begoomaa/gpt-oss-120b

## Resumen

gpt-oss-120b es un modelo de lenguaje de OpenAI publicado con pesos abiertos, orientado a razonamiento, tareas agénticas y uso general en producción. La model card indica 117B parámetros totales y 5,1B parámetros activos, con cuantización MXFP4 de los pesos MoE para que pueda ejecutarse en una única GPU de 80 GB, como una NVIDIA H100 o una AMD MI300X. Se distribuye bajo licencia Apache 2.0 y utiliza el formato de respuesta harmony, que la model card considera obligatorio para un funcionamiento correcto.

El repositorio Begoomaa/gpt-oss-120b replica la model card y los pesos de openai/gpt-oss-120b; no es el repositorio oficial de OpenAI. El recuento de safetensors del repositorio da 116.829.156.672 parámetros y un tamaño de 195,8 GB. En el momento de la consulta figura con 0 descargas y 0 likes, por lo que conviene verificar la procedencia y la integridad de los pesos antes de utilizarlo en producción.

La relevancia del modelo está en que permite desplegar un modelo MoE de gran tamaño en una sola GPU de 80 GB, con esfuerzo de razonamiento configurable, acceso completo a la cadena de pensamiento, capacidades de function calling, navegación web, ejecución de código Python y salidas estructuradas. No se dispone de datos sobre longitud de contexto, idiomas soportados ni resultados de benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE); no se detalla la arquitectura completa en la información disponible |
| Parámetros totales | 116.829.156.672 (~116,8 B; la model card redondea a 117 B) |
| Parámetros activos | 5,1 B (modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4 en los pesos MoE; el repositorio incluye el tag 8-bit; no se detallan otras variantes en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; repositorio de 195,8 GB; compatible con transformers y vLLM |
| Biblioteca | transformers |
| Pipeline | text-generation |
| Formato de prompt | harmony response format, obligatorio según la model card |
| Compatibilidad de endpoint | vLLM y Transformers Serve con API compatible con OpenAI; tag endpoints_compatible |

## Arquitectura y entrenamiento

La información disponible describe un modelo con pesos de mezcla de expertos (MoE), 117B parámetros totales y 5,1B parámetros activos. La model card indica que los pesos MoE fueron sometidos a una cuantización MXFP4 posterior al entrenamiento, y que todas las evaluaciones se realizaron con esa misma cuantización. No se detallan el número de capas, el mecanismo de atención, el vocabulario, la composición del dataset ni el número de tokens de entrenamiento.

El modelo fue entrenado con el formato de respuesta harmony de OpenAI y, según la model card, debe utilizarse únicamente con ese formato, ya que de lo contrario no funciona correctamente. Dispone de esfuerzo de razonamiento configurable en niveles bajo, medio y alto, y expone la cadena de pensamiento completa. No se especifica en la información proporcionada si hubo RLHF, DPO u otras etapas de alineamiento, ni se detallan las recetas de fine-tuning.

## Capacidades

- Generación de texto y razonamiento con esfuerzo configurable en niveles bajo, medio y alto.
- Acceso completo a la cadena de pensamiento, pensado para depuración y confianza en las salidas, no para mostrarla a usuarios finales.
- Function calling y tool calling para integración con APIs y sistemas externos.
- Navegación web y ejecución de código Python mediante las capacidades agénticas documentadas por OpenAI.
- Salidas estructuradas para generar JSON u otros formatos validables.
- Capacidades agénticas para tareas de varios pasos.
- Fine-tuning de parámetros para adaptación a dominios específicos.
- Despliegue como endpoint compatible con OpenAI mediante vLLM o Transformers Serve.
- Capacidades multilingües: no se detallan los idiomas soportados en la información disponible.
- Visión y audio: no se documentan en la información disponible.

## Casos de uso

- Atención al cliente con salida estructurada: el modelo puede gestionar conversaciones multi-turno y devolver JSON validado con categoría, prioridad y siguiente acción, además de llamar a APIs internas mediante function calling.
- Agente de soporte al desarrollo: puede ejecutar Python en un entorno sandbox para reproducir errores, inspeccionar trazas y proponer parches; la integración en CI/CD permite validar los cambios con tests antes de aplicarlos.
- Automatización de backoffice: extracción de datos de correos o documentos, clasificación de incidencias y llamada a sistemas ERP o CRM mediante tool calling, con esfuerzo de razonamiento bajo o medio para controlar la latencia.
- Investigación web asistida: uso de navegación web y function calling para recopilar fuentes, resumir información y generar informes estructurados; requiere revisión humana de citas y posibles alucinaciones.
- Análisis de documentos técnicos y depuración de razonamiento: activación de esfuerzo alto y cadena de pensamiento para diagnosticar fallos complejos, sin exponer el razonamiento interno al usuario final.
- Generación de código en producción: asistente para revisión de diffs, generación de tests y propuestas de parches; el modelo soporta tool calling y ejecución de Python, pero debe operar en sandbox y con revisión humana.
- Fine-tuning sectorial: adaptación con datos propios en dominios como legal, industrial o financiero, aprovechando la licencia Apache 2.0 y la posibilidad de fine-tuning de parámetros.
- Despliegue interno en una GPU de 80 GB: servicio centralizado con vLLM para varios equipos, siempre que la latencia y el throughput medidos en el entorno concreto sean aceptables; no se proporcionan cifras de rendimiento en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: la model card indica que gpt-oss-120b cabe en una única GPU de 80 GB con cuantización MXFP4; no se proporciona una estimación para otras cuantizaciones.
- GPU recomendadas: NVIDIA H100 de 80 GB o AMD MI300X, según la model card.
- GPU de consumo: no se indica que la variante de 120B quepa en GPUs de consumo; la model card menciona gpt-oss-20b para entornos de 16 GB. Ollama y LM Studio aparecen como opciones de despliegue, pero no se especifica el hardware mínimo para 120B.
- Almacenamiento: el repositorio ocupa 195,8 GB; hay que prever espacio para los pesos y la caché de descarga.
- Opciones de despliegue: transformers, Transformers Serve, vLLM 0.10.1+gptoss, implementación de referencia en PyTorch/Triton, Ollama y LM Studio.
- Latencia y throughput: no disponible.
- Fine-tuning: la model card indica que el modelo es fine-tuneable, pero no se detallan requisitos de VRAM ni recetas de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|---|
| Begoomaa/gpt-oss-120b (este repositorio) | 116,8 B | 5,1 B | no disponible | no disponible | Apache 2.0 | Repositorio con 0 descargas y 0 likes; copia de la model card de OpenAI |
| openai/gpt-oss-120b (oficial) | 117 B | 5,1 B | no disponible | no disponible | Apache 2.0 | Repositorio oficial de OpenAI; referenciado en la model card |
| openai/gpt-oss-20b | 21 B | 3,6 B | no disponible | no disponible | Apache 2.0 | Repositorio oficial de OpenAI; orientado a baja latencia y uso local, cabe en 16 GB según la model card |

No se identifican en la información proporcionada otros modelos comparables de la misma categoría. La comparación se limita a las variantes gpt-oss citadas en la model card.

## Limitaciones y advertencias

- El repositorio Begoomaa/gpt-oss-120b no es el repositorio oficial de OpenAI. Tiene 0 descargas y 0 likes en el momento de la consulta, y la model card parece copiada de openai/gpt-oss-120b; conviene verificar hashes y procedencia antes de usarlo en producción.
- Los metadatos del repositorio indican creación y actualización el 2026-10-17, una fecha posterior a la de esta ficha; es una anomalía que debe revisarse.
- No se han publicado resultados de benchmarks en la información disponible, por lo que no se puede comparar el rendimiento con cifras objetivas.
- La longitud de contexto no está disponible; no debe asumirse una ventana larga sin verificarla en la configuración real.
- Los idiomas soportados no están disponibles; es necesario validar la calidad en castellano antes de desplegarlo en producción.
- El formato harmony es obligatorio según la model card; un uso incorrecto del formato puede producir respuestas erróneas.
- La cadena de pensamiento completa no debe mostrarse a usuarios finales; puede contener razonamientos internos o información sensible.
- El riesgo de alucinación no está cuantificado en la información disponible.
- No se documentan sesgos conocidos ni resultados de evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial según la model card, pero deben revisarse los términos de los pesos, dependencias y kernels de terceros.
- El despliegue requiere versiones recientes de transformers, kernels, torch y vLLM; no es una sustitución directa en stacks antiguos.
- La cuantización MXFP4 condiciona el entrenamiento y el fine-tuning; no se detallan recetas compatibles ni requisitos de VRAM para entrenar.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Begoomaa/gpt-oss-120b
- Repositorio oficial de gpt-oss-120b: https://huggingface.co/openai/gpt-oss-120b
- Repositorio oficial de gpt-oss-20b: https://huggingface.co/openai/gpt-oss-20b
- Demo: https://gpt-oss.com
- Guías de OpenAI Cookbook: https://cookbook.openai.com/topic/gpt-oss
- Paper: https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Formato harmony: https://github.com/openai/harmony
- Repositorio gpt-oss: https://github.com/openai/gpt-oss
- Colección de modelos gpt-oss: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
- Lista de recursos gpt-oss: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
- Ollama: https://ollama.com/download
- LM Studio: https://lmstudio.ai/
