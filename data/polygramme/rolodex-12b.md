# polygramme/Rolodex-12B

## Resumen

Rolodex-12B es un modelo de búsqueda agéntica desarrollado por polygramme, derivado del modelo base GLM-4.5-Air de ZAI (zai-org). Se trata de un ajuste fino mediante LoRA (r=32, α=64) con el método OAPL sobre trayectorias de búsqueda agéntica, fusionado posteriormente en los pesos del modelo base. El modelo está diseñado específicamente para tareas de recuperación y síntesis de evidencia sobre bases de conocimiento personales o de equipo, integrando tool use y memoria en bucles multi-paso.

Con una arquitectura MoE de 12 mil millones de parámetros activos y 106 mil millones totales, Rolodex-12B ofrece una ventana de contexto de 131072 tokens, lo que permite manejar consultas largas y múltiples pasos de razonamiento. Su relevancia actual radica en la creciente demanda de agentes de IA capaces de realizar búsquedas estructuradas y verificación de fuentes en entornos empresariales, donde los modelos de chat genéricos suelen fallar. El modelo se distribuye bajo licencia MIT, lo que facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) derivada de GLM-4.5-Air |
| Parametros totales | 106 mil millones |
| Parametros activos | 12 mil millones |
| Longitud de contexto | 131072 tokens |
| Tipos de cuantizacion | No disponible (pesos en bf16) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (pesos fusionados) + adaptador LoRA |

## Arquitectura y entrenamiento

Rolodex-12B hereda la arquitectura MoE de GLM-4.5-Air, con 12 mil millones de parámetros activos por token y 106 mil millones en total. El ajuste fino se realizó mediante LoRA con rango 32 y alfa 64, utilizando el método OAPL (no se especifica su significado completo) sobre trayectorias de búsqueda agéntica. El entrenamiento se ejecutó con el framework ms-swift sobre backend Megatron, durante una sola época. Los pesos del adaptador se fusionaron en el modelo base, y el repositorio incluye tanto los pesos completos como el adaptador LoRA por separado, permitiendo aplicar el adaptador directamente sobre GLM-4.5-Air si se desea.

El modelo está entrenado específicamente para bucles de tool use: búsqueda, lectura y síntesis de evidencia. No se proporcionan detalles sobre el dataset de entrenamiento ni sobre el número de tokens utilizados. La model card indica que el entrenamiento con OAPL mejora materialmente sobre la base en tareas internas de recuperación de hechos cortos, usando búsqueda guiada de árbol simple (menos llamadas a herramientas que los baselines de votación mayoritaria).

## Capacidades

- Búsqueda agéntica multi-paso: el modelo puede encadenar llamadas a herramientas de búsqueda y lectura para localizar información en bases de conocimiento indexadas.
- Memoria y recuperación: está diseñado para consultar memorias personales o de equipo, integrando resultados en respuestas sintetizadas.
- Tool use / function calling: soporta herramientas de búsqueda y lectura, y se comporta mejor dentro de un harness agéntico que como modelo de chat directo.
- Síntesis de evidencia: combina fragmentos recuperados para producir respuestas con citas o referencias a las fuentes.
- Razonamiento multi-paso: la ventana de contexto de 131072 tokens permite mantener cadenas largas de razonamiento y acumulación de resultados intermedios.
- Multilingüismo: no se especifican idiomas soportados; se asume herencia del base GLM-4.5-Air, pero no hay confirmación.

## Casos de uso

- Asistente de soporte técnico interno: un agente que consulta una base de conocimiento de la empresa (wikis, tickets resueltos) para responder incidencias de empleados, encadenando búsquedas y verificando la información antes de responder.
- Recuperación de información legal: como base del modelo PolyClerk-12B, puede utilizarse para buscar jurisprudencia, contratos o normativas en repositorios legales, sintetizando extractos relevantes.
- Investigación de mercado: un agente que consulta informes, artículos y datos internos para responder preguntas sobre competidores o tendencias, con verificación de fuentes.
- Gestión de conocimiento personal: un asistente que indexa notas, correos y documentos personales, y responde preguntas sobre ellos mediante búsqueda agéntica.
- Auditoría de cumplimiento: un sistema que revisa políticas internas y normativas externas, buscando discrepancias o requisitos incumplidos en documentos corporativos.
- Generación de informes con citas: un agente que recopila evidencia de múltiples fuentes internas y produce un informe estructurado con referencias, útil para análisis de negocio o due diligence.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluación interna sobre tareas de recuperación de hechos cortos, donde el modelo mejora materialmente sobre GLM-4.5-Air, pero no se ofrecen cifras concretas ni comparaciones con otros modelos. Se indica que los benchmarks independientes están pendientes.

## Requisitos de hardware

- VRAM estimada: los pesos en bf16 requieren aproximadamente 200 GB. Con tensor-parallel-size 4, cada GPU necesita al menos 50 GB de VRAM.
- GPUs recomendadas: A100 80GB, H100 80GB, o GPUs con 50 GB o más de memoria. No cabe en GPUs de consumo como RTX 4090 (24 GB) ni RTX 3090 (24 GB).
- Opciones de despliegue: vLLM es el servidor recomendado por el autor, con el comando `vllm serve polygramme/Rolodex-12B --tensor-parallel-size 4 --max-model-len 131072`. También es posible aplicar el adaptador LoRA sobre el base GLM-4.5-Air, pero el tamaño de pesos sigue siendo similar.
- Latencia y throughput: no se proporcionan datos. Dado el tamaño y la arquitectura MoE, se espera una latencia moderada en entornos multi-GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Rolodex-12B | 12B (MoE) | 131072 | MIT | Búsqueda agéntica y recuperación |
| GLM-4.5-Air (base) | 12B (MoE) | 131072 | MIT | Modelo de propósito general |
| No disponible | - | - | - | - |

No se dispone de información sobre otros modelos especializados en búsqueda agéntica con características comparables. La comparación directa con GLM-4.5-Air muestra que Rolodex-12B es un ajuste fino del mismo, por lo que comparte arquitectura y contexto, pero difiere en el entrenamiento orientado a tool use. No se conocen alternativas comerciales o de código abierto con el mismo perfil en el momento de redactar esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al derivar de GLM-4.5-Air, puede heredar sesgos del modelo base, que no están detallados.
- Riesgo de alucinación: la model card advierte explícitamente que el modelo puede alucinar bajo condiciones de recuperación escasa. Es imprescindible verificar las afirmaciones contra las fuentes recuperadas.
- Limitaciones de contexto e idioma: aunque la ventana es de 131072 tokens, no se especifican los idiomas soportados. El rendimiento en idiomas distintos del inglés o chino (idiomas principales del base) no está garantizado.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- Caveats para producción: el modelo está diseñado para funcionar dentro de un harness agéntico con herramientas de búsqueda; usarlo como modelo de chat directo puede producir respuestas de baja calidad. Además, el tamaño de 200 GB en bf16 requiere infraestructura multi-GPU, lo que limita su despliegue en entornos pequeños.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/polygramme/Rolodex-12B)
- [Modelo base GLM-4.5-Air](https://huggingface.co/zai-org/GLM-4.5-Air)
- [PolyClerk-12B (modelo derivado)](https://huggingface.co/polygramme/PolyClerk-12B)
