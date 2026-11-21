# orcarouter/DeepSeek-V4-Flash-Vision-Uncensored

## Resumen

DeepSeek-V4-Flash-Vision-Uncensored es un ajuste fino del modelo experimental deepseek-ai/DeepSeek-V4-Flash-Vision-Exp, publicado por el usuario orcarouter en Hugging Face. Se trata de una variante "abliterated" (sin censura) que elimina las capas de rechazo y alineacion del modelo original, orientada explicitamente a tareas de red teaming y evaluacion de seguridad de sistemas de IA. El modelo conserva la arquitectura multimodal y de mezcla de expertos del original, con aproximadamente 304.600 millones de parametros totales y soporte de entrada imagen-texto.

El modelo mantiene las capacidades del base: generacion de texto, razonamiento, vision y modo de pensamiento (reasoning), ademas de soporte para decodificacion multi-token (MTP) y cuantizacion en FP4 y FP8. Su relevancia actual radica en que permite a investigadores de seguridad probar comportamientos adversarios sin las barreras de rechazo del modelo alineado, algo util para auditorias de robustez, aunque con riesgos evidentes de uso indebido.

La licencia MIT facilita su uso, pero el acceso esta restringido (gated) en Hugging Face, lo que exige aceptar condiciones antes de descargarlo. El repositorio ocupa 167,8 GB y esta disponible en formato safetensors para transformers, con etiquetas que indican compatibilidad con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal, familia deepseek_v4 |
| Parametros totales | 304.646.824.126 (aprox. 304,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4, FP8, 8-bit (segun tags del repositorio) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura deepseek_v4 del modelo original DeepSeek-V4-Flash-Vision-Exp, que combina mezcla de expertos (MoE) con capacidades de vision-lenguaje (pipeline image-text-to-text). El ajuste fino aplicado por orcarouter es de tipo abliterated: se eliminan o atenuan las direcciones de activacion asociadas al rechazo de peticiones, de modo que el modelo responde a instrucciones que el modelo alineado rechazaria. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el ajuste.

Entre las innovaciones tecnicas heredadas del base destacan el soporte de decodificacion multi-token (MTP, segun los tags), la cuantizacion nativa en FP4 y FP8, y el modo de razonamiento (reasoning) que permite cadenas de pensamiento extendidas. Los tags indican tambien "post-training" y "ai-red-team", lo que sugiere que el ajuste se realizo con fines de evaluacion de seguridad. No hay informacion publica sobre el numero de tokens de entrenamiento ni sobre la composicion del corpus multimodal.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de pensamiento (reasoning) heredado del modelo base.
- Comprension de imagenes y texto combinados (image-text-to-text), incluyendo descripcion, analisis y respuesta a preguntas sobre imagenes.
- Generacion de codigo y matematicas, aunque no se dispone de benchmarks que lo cuantifiquen.
- Soporte multilingue limitado a ingles y chino.
- Ausencia de rechazo (uncensored/abliterated): responde a peticiones que el modelo alineado bloquearia, lo que lo hace util para red teaming.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su despliegue en infraestructuras de inferencia.
- Decodificacion multi-token (MTP) para acelerar la generacion, segun los tags.
- No se ha confirmado soporte de tool calling ni de function calling en la informacion disponible.

## Casos de uso

- Red teaming y auditoria de seguridad: el modelo permite generar respuestas adversarias y probar la robustez de filtros y sistemas de moderacion, ya que su naturaleza abliterated elimina los rechazos que dificultarian estas pruebas.
- Evaluacion de sesgos y alucinaciones: al no estar alineado, expone de forma mas directa los sesgos latentes del modelo base, lo que ayuda a investigadores a identificar patrones problematicos antes de desplegar sistemas en produccion.
- Investigacion en alineacion: comparar las respuestas del modelo uncensored con las del base alineado permite estudiar que comportamientos elimina el proceso de alineacion y a que coste.
- Analisis de imagenes en entornos controlados: su capacidad image-text-to-text sirve para tareas de descripcion y extraccion de informacion de imagenes en laboratorios de investigacion, sin las restricciones de contenido del modelo original.
- Generacion de datos sinteticos para entrenamiento: investigadores pueden usar el modelo para producir corpus de texto e imagen-texto diversos, incluyendo casos limite que el modelo alineado no generaria.
- Pruebas de pipelines de inferencia multimodal: con 304,6 mil millones de parametros y soporte FP4/FP8, sirve para validar infraestructuras de despliegue de modelos MoE multimodales a gran escala antes de pasar a produccion.
- Docencia y formacion en seguridad de IA: permite demostrar en entornos academicos como se comporta un modelo sin alineacion y por que son necesarias las capas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 304,6 mil millones de parametros, en FP8 se requieren aproximadamente 305 GB de VRAM; en FP4, alrededor de 152 GB; en cuantizacion de 8 bits, un rango similar al FP8. Estas cifras son estimaciones teoricas basadas en el numero de parametros y no en mediciones publicadas.
- GPU recomendadas: para FP8 se necesitan multiples aceleradores de 80 GB (A100, H100, H200) en configuracion multi-GPU; para FP4 podria ser viable en un nodo con varias GPU de 48-80 GB.
- No cabe en GPU de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) ni en configuraciones de una sola GPU consumer, dado el tamano del modelo.
- Opciones de despliegue: transformers (libreria indicada en el repositorio), con posible integracion en vLLM o TGI si soportan la arquitectura deepseek_v4; llama.cpp y Ollama no estan confirmados para esta arquitectura.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Uncensored | 304,6 mil millones | no disponible | MIT | Restringido (gated) | Variante abliterated del base |
| DeepSeek-V4-Flash-Vision-Exp (base) | no disponible | no disponible | no disponible | no disponible | Modelo original alineado, experimental |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de otros modelos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con modelos alternativos de la misma categoria (MoE multimodal de ~300 mil millones de parametros). Los datos del modelo base DeepSeek-V4-Flash-Vision-Exp no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin alineacion (abliterated): puede generar contenido ofensivo, peligroso o ilegal; su uso debe limitarse a entornos de investigacion controlados.
- Riesgo elevado de alucinacion: al eliminar las capas de rechazo, el modelo puede responder con confianza a preguntas sobre las que no tiene informacion, sin las salvaguardas del modelo alineado.
- Sesgos conocidos: no se dispone de documentacion sobre sesgos especificos, pero al heredar el modelo base y eliminar la alineacion, es probable que los sesgos latentes se manifiesten con mayor intensidad.
- Cobertura limitada de idiomas: solo ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no disponible: se desconoce la ventana maxima, lo que dificulta planificar su uso en tareas de contexto largo.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion para su descarga y despliegue.
- Licencia MIT: permite uso comercial, pero el usuario asume toda la responsabilidad legal y etica sobre el contenido generado.
- Requisitos de hardware muy elevados: no es viable en GPU de consumo, lo que limita su uso a organizaciones con infraestructura multi-GPU.
- No se ha confirmado soporte de tool calling ni de function calling, lo que puede limitar su integracion en pipelines de agentes.
- El modelo base es experimental (sufijo Exp), por lo que su estabilidad y comportamiento en produccion no estan garantizados.

## Enlaces

- Hugging Face: https://huggingface.co/orcarouter/DeepSeek-V4-Flash-Vision-Uncensored
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
