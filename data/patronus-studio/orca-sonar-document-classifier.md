# patronus-studio/orca-sonar-document-classifier

## Resumen

Orca-Sonar es un clasificador de documentos multilingüe desarrollado por Patronus Protect (Patronus Studio) que asigna un texto a una de nueve categorías temáticas: legal, recursos humanos, finanzas, interno y técnico, código fuente, marketing, otros, educación y médico. Está diseñado para el enrutamiento de riesgo y la prevención de pérdida de datos (DLP) en entornos de seguridad de IA, actuando como una puerta de entrada antes de que el contenido llegue a un modelo de lenguaje grande, a un sistema de DLP o a una capa de almacenamiento.

El modelo se basa en la arquitectura ModernBERT, concretamente en la variante pequeña multilingüe `jhu-clsp/mmBERT-small`, y cuenta con 140,6 millones de parámetros. Está entrenado con un conjunto de datos propio en alemán e inglés, aún no publicado, y es robusto frente a envoltorios del tipo «resume este contrato: …», ya que clasifica el contenido temático y no la forma superficial de la solicitud. Forma parte de la pila de seguridad Patronus Protect y se distribuye bajo licencia Apache 2.0, con una variante FP16 en ONNX para despliegues más ligeros.

Su relevancia actual radica en la creciente necesidad de filtrar y clasificar documentos sensibles antes de que entren en el contexto de un LLM o salgan del dispositivo, especialmente en aplicaciones de cumplimiento, seguridad de agentes de IA y prevención de fugas de información. El modelo ofrece un equilibrio entre precisión y velocidad, con una exactitud reportada del 94,2 % en un conjunto de prueba real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (mmBERT-small) |
| Parametros totales | 140.645.001 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (safetensors), FP16 (ONNX) |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache-2.0 (modelo base bajo MIT) |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Orca-Sonar utiliza la arquitectura ModernBERT, un transformer encoder optimizado para eficiencia y velocidad, en su variante pequeña multilingüe (`mmBERT-small`). El modelo fue entrenado con un conjunto de datos propio de Patronus, compuesto por textos en alemán e inglés etiquetados en nueve categorías temáticas. El entrenamiento se realizó de forma supervisada para clasificación de secuencias, y el conjunto de datos se publicará próximamente.

Una característica destacada es la robustez frente a envoltorios conversacionales: el modelo aprende a clasificar el contenido subyacente del texto, no su formato superficial. Por ejemplo, una instrucción como «Resume este contrato: …» se clasifica como `legal` porque el contenido es un contrato, independientemente de que venga precedido de una petición. Además, se define una regla de desambiguación para empates: la clase más sensible gana, siguiendo el orden `legal > hr > finance > internal_and_tech > source_code > marketing > other`.

## Capacidades

- Clasificacion de documentos en 9 categorias tematicas: legal, recursos humanos, finanzas, interno y tecnico, codigo fuente, marketing, otros, educacion y medico.
- Soporte multilingue para aleman e ingles.
- Robustez frente a envoltorios de usuario a IA (p. ej., «Resume este contrato: …»), clasificando por contenido y no por forma.
- Regla de desambiguacion que prioriza la clase mas sensible en caso de empate.
- Disponible en formato ONNX FP16, que mantiene la fidelidad de argmax respecto al modelo completo y reduce el tamano a la mitad.
- Integracion prevista con Patronus Ark, la libreria de seguridad de IA en el dispositivo (aun no publicada).

## Casos de uso

- Prevencion de perdida de datos (DLP): clasificar documentos entrantes (contratos, informes financieros, expedientes medicos) y enrutarlos a controles de seguridad o cuarentena antes de que lleguen a un LLM o a un sistema de almacenamiento.
- Cumplimiento normativo: identificar automaticamente documentos legales, de recursos humanos o financieros para aplicar politicas de retencion, acceso o auditoria.
- Seguridad de agentes de IA: filtrar entradas de usuarios en aplicaciones de agentes para detectar contenido sensible o de alto riesgo antes de que se procese.
- Clasificacion de tickets de soporte: categorizar solicitudes de clientes por tema (facturacion, legal, tecnico) para dirigirlas al equipo adecuado.
- Deteccion de codigo fuente en canales de comunicacion: identificar fragmentos de codigo o configuraciones en correos o chats para prevenir fugas de propiedad intelectual.
- Archivado y organizacion documental: indexar grandes volumenes de documentos corporativos en categorias tematicas para facilitar su busqueda y gobernanza.

## Benchmarks y rendimiento

Segun la model card, el modelo fue evaluado en un conjunto de prueba retenido compuesto por datos 100 % reales. Los resultados reportados son:

| Metrica | Valor |
|---|---|
| Accuracy | 0.942 |
| F1 (macro) | 0.940 |
| F1 medical | 0.961 |
| F1 education | 0.957 |
| F1 marketing | 0.956 |
| F1 finance | 0.948 |
| F1 source_code | 0.945 |
| F1 other | 0.943 |
| F1 legal | 0.942 |
| F1 internal_and_tech | 0.930 |
| F1 hr | 0.877 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Tamano del modelo: 140,6 millones de parametros. El checkpoint FP32 ocupa aproximadamente 560 MB; la version FP16 ONNX, unos 280 MB.
- VRAM estimada: para inferencia en GPU, menos de 1 GB en FP16; puede ejecutarse incluso en GPU integradas o CPUs modernas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3060 o superiores; tambien funciona en CPU con latencia aceptable para textos cortos.
- Opciones de despliegue: `transformers` con `pipeline`, `optimum` para ONNX Runtime, o integracion en la libreria Patronus Ark (cuando se publique).
- Latencia y throughput: no se han publicado mediciones oficiales; al ser un modelo encoder pequeno, se espera una latencia de milisegundos por documento en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados frente a otros clasificadores de documentos en la informacion proporcionada. El modelo comparte arquitectura con `jhu-clsp/mmBERT-small`, su base, pero no se han publicado evaluaciones comparativas con alternativas como BERT-base, RoBERTa u otros clasificadores de topicos.

## Limitaciones y advertencias

- Solo se ha validado con textos en aleman e ingles; otros idiomas no se han probado activamente y podrian producir resultados poco fiables.
- El modelo puede generar falsos positivos; para enrutamiento de alto riesgo se recomienda combinarlo con un umbral de confianza o una puerta de abstencion.
- La robustez frente a entradas adversariales, fuera de distribucion, con PII puro o longitudes patologicas es parcial; en produccion se aconseja un pre-gate deterministico de longitud y deteccion de PII.
- El conjunto de datos de entrenamiento es propietario y aun no se ha publicado, lo que limita la reproducibilidad externa.
- La integracion con Patronus Ark, la libreria de seguridad en el dispositivo, no esta disponible publicamente todavia.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (mmBERT-small) se distribuye bajo MIT; se deben mantener los avisos de copyright correspondientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patronus-studio/orca-sonar-document-classifier
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Blog de Patronus sobre Orca-Sonar: https://patronus.studio/posts/orca-sonar-our-multilingual-document-classifier-for-ai-security
- Anuncio del zoo de modelos de seguridad de IA: https://patronus.studio/de/posts/our-ai-security-model-zoo-is-now-open-source
- Version del anuncio en Medium: https://medium.com/@PatronusProtect/our-ai-security-model-zoo-is-now-open-source-41654d5d7dc6
