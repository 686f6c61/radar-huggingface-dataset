# 88AgentS/ai-security-demo-clean

## Resumen

`88AgentS/ai-security-demo-clean` es un modelo publicado en Hugging Face por el usuario 88AgentS, descrito por su propio autor como un clasificador ligero utilizado para demostrar el escaneo de seguridad de modelos de Prisma AIRS (Palo Alto Networks). No se trata de un modelo de lenguaje generativo, sino de un artefacto de demostración concebido para validar un flujo de aprobación de seguridad automatizado en CI/CD (GitHub Actions).

El repositorio contiene pesos en formato safetensors con un total declarado de 74.442 parámetros, lo que lo sitúa en el rango de los clasificadores minúsculos, muy lejos de cualquier LLM. La model card no documenta arquitectura, datos de entrenamiento, tokenizador ni tarea concreta más allá de la etiqueta `classifier`; su contenido se centra casi exclusivamente en el sello de aprobación de seguridad de Prisma AIRS.

Su relevancia es, por tanto, fundamentalmente operativa y de gobernanza: sirve como ejemplo de cómo integrar una puerta de seguridad de modelos en un pipeline de despliegue. No debe evaluarse como un modelo apto para producción en tareas de NLP, ya que no hay evidencia publicada de su funcionamiento, su calidad ni su entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `classifier`) |
| Parametros totales | 74.442 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La unica etiqueta de pipeline disponible es `classifier`, lo que sugiere una cabeza de clasificacion, pero se desconoce la familia de modelo base (BERT, DistilBERT, un transformer propio o una red mas simple) y el tamano de embedding asociado a los 74.442 parametros declarados.

Tampoco hay datos sobre el conjunto de entrenamiento, el numero de tokens procesados, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO. La model card no incluye informacion sobre tokenizador, funcion de perdida, metrica de validacion ni innovacion tecnica alguna. El unico elemento destacable documentado es el proceso de escaneo de seguridad externo (Prisma AIRS) que aprobo el artefacto el 3 de noviembre de 2026.

## Capacidades

- Clasificacion: el autor lo etiqueta como `classifier`, aunque no se especifica la tarea concreta (clasificacion de texto, de seguridad, de sentimiento, etc.).
- Generacion de texto: no documentada; no hay evidencia de que sea un modelo generativo.
- Razonamiento, codigo y matematicas: no documentados.
- Vision, audio o multimodalidad: no documentados.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el campo de idiomas figura como no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Demostracion de gobernanza de modelos: el caso de uso principal declarado por el autor es servir de ejemplo de un modelo que supera las comprobaciones de seguridad de Prisma AIRS antes de su despliegue. Se usaria como artefacto de referencia en formaciones o pruebas de la puerta de seguridad.
- Validacion de pipelines CI/CD de seguridad: puede integrarse en un workflow de GitHub Actions para verificar que la etapa de escaneo de modelos (AIRS Model Security Gate) se ejecuta y aprueba correctamente antes de publicar o desplegar.
- Pruebas de regresion de herramientas de escaneo: al ser un modelo pequeno y aprobado, sirve como caso base ("clean") frente a otros modelos que deberian ser rechazados por la politica, permitiendo validar el comportamiento del escaner.
- Ejemplo educativo de model card con sello de seguridad: util para ilustrar como documentar el estado de aprobacion de un artefacto y sus metadatos de escaneo (fecha, pipeline, politica aplicada).
- Verificacion de carga de safetensors en entornos de prueba: con 74.442 parametros y un repo de 0,0 GB, es adecuado para tests de integracion rapidos de librerias de carga de pesos sin coste de recursos.
- Reproducibilidad de auditorias: al incluir fecha de escaneo y politica aplicada, puede emplearse como referencia en auditorias internas que requieran trazabilidad del estado de seguridad de un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 74.442 parametros en safetensors el peso de los pesos es de unos pocos cientos de kilobytes (el repo figura con 0,0 GB).
- GPU recomendadas: cualquier GPU consumer moderna es sobradamente suficiente; tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en dispositivos de baja potencia.
- Opciones de despliegue: no hay informacion sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI; al ser un clasificador, lo habitual seria cargarlo con `transformers` o `safetensors` directamente, pero esto no esta confirmado por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoria a partir de la informacion proporcionada, y el autor no ofrece referencias a alternativas.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 88AgentS/ai-security-demo-clean | 74.442 | no disponible | Apache 2.0 | Clasificador de demostracion con sello AIRS |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se describe arquitectura, datos de entrenamiento, tokenizador ni tarea, lo que impide evaluar su calidad o idoneidad para cualquier uso real.
- Proposito exclusivamente demostrativo: el autor lo presenta como un artefacto para demostrar el escaneo de seguridad, no como un modelo para produccion.
- Riesgo de uso indebido por interpretacion erronea: el sello "AIRS approved" certifica que paso un escaneo de seguridad, no que el modelo sea funcionalmente correcto o preciso.
- Sesgos conocidos: no disponibles; sin informacion sobre el dataset no es posible evaluar sesgos.
- Riesgo de alucinacion: no aplica si es un clasificador puro, pero no puede descartarse sin conocer la arquitectura.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia: Apache 2.0 permite uso comercial, pero la falta de documentacion hace desaconsejable su uso en produccion sin una evaluacion previa.
- Trazabilidad temporal: las fechas de creacion (2026-06-04) y actualizacion (2026-11-03) junto con la fecha de escaneo deben verificarse, ya que el modelo no incluye informacion sobre versionado de pesos.
- Sin likes ni metricas de uso relevantes (0 likes, 170 descargas): no hay validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/88AgentS/ai-security-demo-clean
- Prisma AIRS (Palo Alto Networks): https://www.paloaltonetworks.com/sase/ai-security
