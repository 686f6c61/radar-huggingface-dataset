# ccortezb/FinOptix-14B-v2-GGUF

## Resumen

FinOptix-14B-v2-GGUF es la distribución en formato GGUF del modelo ccortezb/FinOptix-14B-v2, un ajuste fino especializado en FinOps (gestión y optimización de costes cloud) construido sobre Qwen 2.5 14B. Lo desarrolla Carlos Cortez, identificado en la model card como AWS Community Hero, y está publicado con licencia Apache-2.0. El repositorio contiene únicamente los pesos cuantizados y los metadatos necesarios para ejecutarlo con llama.cpp u Ollama; el modelo original en safetensors vive en un repositorio separado.

El modelo aborda un problema muy concreto: automatizar tareas de auditoría y razonamiento sobre costes de AWS sin depender de servicios en la nube. Sus dominios declarados son la auditoría de Terraform (rightsizing, etiquetado, migración a Graviton, gp2 a gp3, ciclos de vida de S3), el análisis de Cost Explorer y anomalías de facturación, la cobertura de Savings Plans y Reserved Instances, el triage de incidentes con generación de remediación como código, el análisis de radio de impacto sobre un grafo de arquitectura propietario (BYaML v2) y el FinOps de pipelines dbt ejecutados sobre Athena.

Con 14.770.033.664 parámetros (aproximadamente 14,77 mil millones) y una arquitectura densa derivada de Qwen 2.5, el modelo se sitúa en la franja que permite ejecución local en GPU de consumo gracias a cuantizaciones de 9 GB (Q4_K_M) y 12 GB (Q6_K). Soporta inglés y español. No se han publicado resultados de benchmarks ni detalles sobre el proceso de ajuste fino en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only densa, derivada de Qwen 2.5 14B (tag `qwen2`) |
| Parametros totales | 14.770.033.664 (aproximadamente 14,77 mil millones) |
| Parametros activos | No aplica: modelo denso, no es Mixture of Experts |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen 2.5 14B declara 32.768 tokens nativos |
| Tipos de cuantizacion | Q4_K_M (aproximadamente 9 GB) y Q6_K (aproximadamente 12 GB) en formato GGUF |
| Idiomas soportados | Inglés (en) y español (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (k-quants); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen 2.5 14B: un transformer decoder-only denso con atención completa, sin mezcla de expertos ni componentes de estado recurrente. El repositorio que nos ocupa no contiene el modelo entrenado sino su conversión a GGUF con dos niveles de cuantización k-quants (Q4_K_M y Q6_K), lo que preserva la topología de la red y reduce la precisión de los pesos. El tamaño total del repositorio es de 21,1 GB, coherente con la suma de ambas variantes más metadatos.

No se dispone de información sobre el corpus de ajuste fino: no se indica el número de tokens, la composición del dataset, si se emplearon técnicas de instrucción supervisada, LoRA/QLoRA, DPO o RLHF, ni si hubo una fase de razonamiento explícito. Tampoco se documentan innovaciones de inferencia (decodificación especulativa, atención lineal o modos de pensamiento). La especialización declarada es funcional y de dominio: Terraform, AWS Cost Explorer, Savings Plans/RI, el grafo BYaML v2, el flujo de triage "Remo" y el componente sofe-dbt. Cualquier evaluación de la calidad real de ese ajuste requerirá pruebas propias, ya que no hay métricas publicadas.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y español, con el tag `conversational` en el repositorio.
- Auditoría de Terraform: detección de instancias sobredimensionadas, etiquetado inconsistente, migración a Graviton, cambio de volúmenes gp2 a gp3 y definición de políticas de ciclo de vida en S3.
- Razonamiento sobre costes de AWS: interpretación de JSON de Cost Explorer, detección de anomalías de gasto y análisis de cobertura y utilización de Savings Plans y Reserved Instances.
- Razonamiento sobre grafos de arquitectura mediante BYaML v2: cálculo de radio de impacto (blast radius) y de cadenas de coste sobre el grafo de arquitectura.
- Triage de incidentes con el flujo "Remo", incluyendo la generación de remediación como código.
- FinOps de datos en sofe-dbt: estimación de bytes escaneados en Athena y decisión entre estrategias incremental y full-refresh.
- Ejecución completamente offline, sin llamadas a APIs externas.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para su despliegue como servicio de generación de texto.
- No se declaran capacidades de visión, audio, tool calling nativo ni modo de razonamiento extendido; no hay información al respecto en la documentación disponible.

## Casos de uso

- **Auditoría de Terraform en pipelines de CI/CD**: ejecutar el modelo sobre el `terraform plan` de cada pull request para señalar instancias sobredimensionadas, recursos sin etiquetar, volúmenes gp2 y buckets S3 sin política de ciclo de vida. Su tamaño (9 GB en Q4_K_M) permite alojarlo en un runner con GPU modesta o incluso en CPU, y su especialización reduce la necesidad de prompts largos con instrucciones de estilo.
- **Repaso mensual de facturación con Cost Explorer**: introducir el JSON exportado de Cost Explorer y pedir un resumen de desviaciones, servicios con crecimiento anómalo y cuentas con cobertura de compromisos insuficiente. Al ejecutarse en local, los datos de facturación no salen de la infraestructura de la organización.
- **Planificación de Savings Plans y Reserved Instances**: introducir los datos de utilización y pedir un análisis de qué compromisos renovar, a qué plazo y con qué importe, junto con el riesgo de infracapacidad. El modelo está entrenado específicamente para razonar sobre cobertura y utilización, no solo para resumir cifras.
- **Triage de incidentes con remediación como código**: a partir de una alerta y del contexto del grafo BYaML v2, obtener una hipótesis de causa raíz, el radio de impacto estimado y un parche en forma de cambio de Terraform o comando de AWS CLI para revisar por una persona antes de aplicarlo.
- **Optimización de pipelines dbt sobre Athena**: revisar modelos dbt y decidir si conviene materialización incremental o full-refresh según el volumen de bytes escaneados, con estimación del ahorro asociado. Es un caso de uso de FinOps de datos que rara vez cubren los modelos generalistas.
- **Asistente interno para equipos de plataforma**: desplegar un chatbot en Ollama o llama-server que responda en español a preguntas del equipo sobre políticas de etiquetado, elección de familias de instancia o interpretación de la factura, sin coste por token ni dependencia de red.
- **Entornos con restricciones de salida de datos**: banca, sector público o cualquier organización que no pueda enviar metadatos de infraestructura a un proveedor externo. El formato GGUF y la licencia Apache-2.0 permiten empaquetar el modelo dentro de la imagen del propio producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del repositorio GGUF no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de FinOps (por ejemplo, precisión en la detección de recursos sobredimensionados o en la estimación de ahorro). Tampoco se proporcionan comparaciones con el modelo base Qwen 2.5 14B ni con alternativas del sector. Cualquier cifra de rendimiento deberá obtenerse mediante una evaluación propia sobre un conjunto de infraestructura representativo.

## Requisitos de hardware

- **VRAM para Q4_K_M**: los pesos ocupan aproximadamente 9 GB; con overhead de contexto y caché KV conviene reservar 10-12 GB de VRAM para uso en GPU, o 10 GB o más de RAM si se ejecuta en CPU.
- **VRAM para Q6_K**: aproximadamente 12 GB de pesos; se recomienda disponer de 14-16 GB de VRAM para trabajar con contextos medios sin offloading.
- **GPU de consumo**: Q4_K_M cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; Q6_K encaja en RTX 4080, RTX 4070 Ti Super y RTX 4090 (24 GB), donde además queda margen para contextos largos y cierto batching.
- **GPU de centro de datos**: A100 40/80 GB y H100 para servir a varios usuarios concurrentes, con margen para batch y contextos extensos; también resultan válidas L40S o L4 para despliegues pequeños.
- **Apple Silicon**: los equipos con memoria unificada de 16 GB pueden ejecutar Q4_K_M; 24 GB o más permiten Q6_K con contexto amplio.
- **Opciones de despliegue**: Ollama (`ollama run hf.co/ccortezb/FinOptix-14B-v2-GGUF:Q4_K_M`), llama.cpp (`llama-cli`, `llama-server`), LM Studio y otras herramientas compatibles con GGUF. vLLM admite GGUF de forma experimental; TGI no carga GGUF directamente y requeriría los safetensors del modelo base.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| FinOptix-14B-v2-GGUF | 14,77 B (denso) | No especificado (base Qwen 2.5 14B: 32.768) | FinOps AWS, Terraform, dbt | Apache-2.0 | GGUF (Q4_K_M, Q6_K) |
| Qwen 2.5 14B Instruct | 14,77 B (denso) | 32.768 tokens nativos, ampliable con YaRN | Generalista, código y matemáticas | Apache-2.0 | safetensors, GGUF |
| Mistral NeMo 12B Instruct | 12 B (denso) | 128.000 tokens | Generalista multilingüe | Apache-2.0 | safetensors, GGUF |
| Llama 3.1 8B Instruct | 8 B (denso) | 128.000 tokens | Generalista | Llama 3.1 Community License | safetensors, GGUF |

Frente a Qwen 2.5 14B Instruct, la diferencia es de especialización: el modelo base es más versátil pero requiere instrucciones extensas para producir auditorías de Terraform o análisis de Savings Plans con criterio. Frente a Mistral NeMo 12B y Llama 3.1 8B, FinOptix parte de una base con más parámetros que el segundo, pero no hay datos públicos que permitan comparar rendimiento real en tareas de FinOps. No se dispone de alternativas de código abierto con especialización equivalente en este dominio en la información consultada.

## Limitaciones y advertencias

- **Ausencia total de benchmarks**: no hay evidencia publicada sobre la calidad del ajuste fino. La especialización en FinOps la declara el autor, no está medida de forma independiente.
- **Riesgo de alucinación en cifras**: los precios de AWS, los límites de servicio y las recomendaciones de compromiso cambian con frecuencia. El modelo puede generar importes, SKUs o cuotas obsoletos o inventados; cualquier cifra debe validarse contra la API de precios o la documentación oficial.
- **Alcance de dominio estrecho**: está orientado a FinOps sobre AWS, Terraform y dbt. Su rendimiento en tareas generales de programación, matemáticas o conversación será presumiblemente inferior al de Qwen 2.5 14B Instruct, aunque no hay datos que lo cuantifiquen.
- **Dependencia de componentes propietarios**: las capacidades BYaML v2, Remo y sofe-dbt hacen referencia a un grafo de arquitectura y a flujos concretos del autor. Sin acceso a esos esquemas, el modelo puede no rendir igual en prompts genéricos.
- **Cobertura lingüística limitada**: solo inglés y español. No se declaran otros idiomas, y el comportamiento en español no está documentado ni evaluado.
- **Contexto no verificado**: si el ajuste fino no preservó la ventana de 32.768 tokens del modelo base, el contexto efectivo podría ser menor; conviene probarlo empíricamente antes de diseñar flujos con documentos largos.
- **Licencia**: Apache-2.0 permite uso comercial, modificación y redistribución con atribución y sin garantías. Al derivar de Qwen 2.5 14B, conviene revisar también las condiciones del modelo base, igualmente Apache-2.0 según la información disponible.
- **Madurez del repositorio**: cero descargas y cero "likes" en el momento de la consulta, creado y actualizado el mismo día. No hay señales de validación por parte de la comunidad.
- **Sin soporte declarado de tool calling ni agentes**: pese a que los casos de uso apuntan a automatización, no se documenta function calling nativo; habría que implementar el parseo de salidas de forma externa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ccortezb/FinOptix-14B-v2-GGUF
- Modelo base (safetensors y model card completa): https://huggingface.co/ccortezb/FinOptix-14B-v2
- Modelo de referencia Qwen 2.5 14B: https://huggingface.co/Qwen/Qwen2.5-14B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- No se han identificado en la búsqueda web enlaces adicionales relevantes (papers, blogs o demos) sobre este modelo.
