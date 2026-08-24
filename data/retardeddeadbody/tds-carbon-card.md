# retardeddeadbody/tds-carbon-card

## Resumen

Este repositorio, identificado como `retardeddeadbody/tds-carbon-card`, no contiene un modelo de inteligencia artificial, sino una **tarjeta de contabilidad de carbono** (carbon card) asociada a un entrenamiento de modelo realizado en el contexto de una asignación académica (TDS GA8). El autor documenta las emisiones de CO₂ equivalente generadas durante un proceso de pre-entrenamiento, junto con el hardware utilizado, el consumo energético y la localización geográfica del cómputo.

La relevancia de este tipo de registros radica en la creciente preocupación por el impacto ambiental del entrenamiento de grandes modelos. Aunque no se proporcionan detalles sobre la arquitectura, los parámetros o el propósito del modelo entrenado, la tarjeta ofrece datos concretos de eficiencia energética y emisiones, lo que permite auditar la huella de carbono de un proceso de cómputo específico. Este tipo de iniciativas se alinea con los principios de "IA verde" (Green AI) y con la tendencia a publicar model cards que incluyan métricas ambientales.

En la información disponible no se especifica qué modelo se entrenó, ni su tamaño, arquitectura o capacidades. Por tanto, esta ficha se limita a documentar los datos ambientales publicados, indicando explícitamente la ausencia de información técnica sobre el modelo en sí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Emisiones de CO₂ equivalente | 148,456 kg CO₂eq |
| Hardware de entrenamiento | 4x NVIDIA RTX 4090 |
| Modo de entrenamiento | pre-training |
| Region de computo | us-central1 |
| Horas de GPU | 161,4 h (PUE: 1,46) |
| Energia total consumida | 424,1592 kWh |
| Fuente de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo (transformer, MoE, SSM, etc.), ni sobre el dataset utilizado, el numero de tokens de entrenamiento o si se aplicaron tecnicas como RLHF o DPO. La unica informacion relativa al entrenamiento es que se realizo en modo pre-training, sobre 4 GPUs NVIDIA RTX 4090, durante 161,4 horas, con un PUE de 1,46 y un consumo total de 424,1592 kWh. No se menciona ninguna innovacion tecnica destacable.

## Capacidades

No aplicable. Este repositorio no contiene un modelo de IA, por lo que no se pueden listar capacidades de generacion de texto, razonamiento, codigo, vision, tool calling, agentes, etc. La unica "capacidad" documentada es la de registrar y reportar emisiones de carbono asociadas a un entrenamiento.

## Casos de uso

No aplicable como modelo de IA. Sin embargo, el repositorio en si puede utilizarse en los siguientes escenarios:

- **Auditoria ambiental de entrenamientos de IA**: permite a organizaciones o investigadores cuantificar la huella de carbono de un proceso de pre-entrenamiento, sirviendo como referencia para futuras comparaciones.
- **Cumplimiento de politicas de sostenibilidad**: empresas que necesiten reportar el impacto ambiental de sus cargas de trabajo de IA pueden usar este tipo de tarjetas como evidencia.
- **Investigacion en eficiencia energetica**: los datos de consumo y emisiones pueden alimentar estudios sobre el coste ambiental de diferentes configuraciones de hardware.
- **Educacion y concienciacion**: en cursos de IA responsable, este ejemplo ilustra como documentar la huella de carbono de un entrenamiento.
- **Optimizacion de infraestructura**: los valores de PUE y horas de GPU ayudan a identificar ineficiencias en centros de datos.
- **Comparativa entre proveedores cloud**: la region us-central1 y el hardware especifico permiten estimar el impacto de elegir diferentes opciones de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene un modelo evaluable, por lo que no existen metricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

No aplicable para inferencia, ya que no hay modelo. No obstante, el hardware utilizado en el entrenamiento fue:

- 4 GPUs NVIDIA RTX 4090 (cada una con 24 GB de VRAM, aunque no se especifica la configuracion exacta).
- No se indica si el entrenamiento fue distribuido o secuencial.
- No se proporcionan datos de latencia o throughput de inferencia.

Para un despliegue real de un modelo, se necesitarian especificaciones adicionales que no estan disponibles.

## Comparativa con modelos similares

No disponible. Al no tratarse de un modelo de IA, no es posible compararlo con alternativas como Llama, Mistral o Qwen. La unica comparativa posible seria con otras tarjetas de carbono de entrenamientos similares, pero no se dispone de datos de otros repositorios comparables en la informacion proporcionada.

## Limitaciones y advertencias

- **No es un modelo de IA**: este repositorio no contiene pesos, arquitectura ni capacidades de inferencia. Cualquier uso como modelo seria un error.
- **Datos limitados**: la informacion tecnica del modelo entrenado (parametros, contexto, licencia, idiomas) no se ha publicado, lo que impide evaluar su calidad o aplicabilidad.
- **Sesgos y alucinaciones**: al no existir modelo, no se pueden evaluar sesgos, riesgos de alucinacion o limitaciones de contexto.
- **Restricciones de licencia**: no se especifica licencia, por lo que el uso del repositorio (mas alla de la consulta de datos) no esta claramente definido.
- **Caveat para produccion**: este repositorio no es apto para integracion en sistemas de produccion, ya que no ofrece ninguna funcionalidad de IA.

## Enlaces

- Repositorio en Hugging Face: [https://huggingface.co/retardeddeadbody/tds-carbon-card](https://huggingface.co/retardeddeadbody/tds-carbon-card)
- Repositorios similares encontrados en la busqueda web:
  - [https://huggingface.co/23f3001819/tds-carbon-card](https://huggingface.co/23f3001819/tds-carbon-card)
  - [https://huggingface.co/i-shashikant/tds-carbon-card](https://huggingface.co/i-shashikant/tds-carbon-card)
- Referencia sobre model cards de Google DeepMind: [https://deepmind.google/models/model-cards/](https://deepmind.google/models/model-cards/)
- Archivo de modelos de CivitAI (no relacionado directamente): [https://civitaiarchive.com/](https://civitaiarchive.com/)
- Lista de modelos gratuitos (no relacionado directamente): [https://github.com/12britz/awesome-free-models](https://github.com/12britz/awesome-free-models)
