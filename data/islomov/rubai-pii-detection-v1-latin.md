# islomov/rubai-PII-detection-v1-latin

## Resumen

Rubai PII Detection v1 Latin es un modelo de clasificación de tokens (token classification) especializado en la detección de información de identificación personal (PII) en uzbeko escrito en alfabeto latino. Lo desarrolla el usuario islomov y se distribuye bajo licencia Apache 2.0, con acceso restringido que requiere aceptar condiciones en Hugging Face. Con 108,9 millones de parámetros, se basa en una arquitectura BERT y está afinado para la tarea NER aplicada a privacidad.

El modelo resuelve un problema concreto y poco cubierto: la identificación automática de entidades personales en uzbeko, un idioma con recursos limitados en el ecosistema de modelos de privacidad. Se entrenó sobre el dataset islomov/rubai-NER-150K-Personal, según los metadatos del repositorio, y se publica con la etiqueta "deprecated", lo que sugiere que el autor lo considera una versión antigua o sustituida por otra iteración.

Es relevante para equipos que construyan pipelines de anonimización, cumplimiento de protección de datos o filtrado de PII en contenidos en uzbeko, donde los modelos multilingües genéricos suelen rendir por debajo de un modelo afinado específicamente. Su tamaño compacto permite despliegue en CPU o GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 108.901.639 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors; admite cuantizacion estandar via herramientas externas) |
| Idiomas soportados | uzbeko (uz), alfabeto latino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT, un encoder transformer bidireccional, adaptado a clasificación de tokens (token-classification) para reconocimiento de entidades nombradas orientado a PII. Con 108,9 millones de parámetros, encaja en el rango de un BERT-base, lo que implica un coste de inferencia moderado y buena adecuación a tareas de etiquetado secuencial.

El entrenamiento se realizó sobre el dataset islomov/rubai-NER-150K-Personal, según los metadatos del repositorio. No se dispone de información publicada sobre el número exacto de tokens, la composición detallada del corpus, el uso de técnicas de aumento de datos ni sobre si se aplicaron fases de ajuste fino adicionales o calibración de umbrales. Tampoco hay datos sobre innovaciones técnicas como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo.

## Capacidades

- Clasificación de tokens para detección de entidades de información personal en textos en uzbeko (latino).
- Reconocimiento de entidades nombradas (NER) orientado a privacidad: nombres, identificadores y otras categorías de PII según el esquema del dataset de entrenamiento.
- Procesamiento de texto a nivel de token con salida de etiquetas BIO o similar, adecuada para pipelines de anonimización.
- No soporta generación de texto, razonamiento, código ni matemáticas: es un modelo discriminativo de etiquetado.
- No dispone de tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni comportamiento agéntico.
- Capacidad multilingüe limitada al uzbeko en alfabeto latino; no se declaran otros idiomas.
- No incluye visión, audio ni modo de pensamiento.

## Casos de uso

- Anonimización de registros en uzbeko: el modelo etiqueta tokens con PII en documentos, bases de datos o logs, permitiendo sustituir o enmascarar nombres e identificadores antes de almacenar o compartir datos.
- Cumplimiento de protección de datos: integrado en un pipeline previo al almacenamiento, detecta PII en textos de usuarios para cumplir requisitos de minimización y anonimización.
- Filtrado de contenido en foros y comentarios: clasifica mensajes en uzbeko para detectar exposición accidental de datos personales y activar revisiones.
- Preparación de datasets para entrenamiento: limpia corpus en uzbeko eliminando PII antes de publicarlos o reutilizarlos en otros modelos.
- Enmascaramiento en atención al cliente: procesa transcripciones de conversaciones en uzbeko para redactar datos personales antes de análisis o auditoría.
- Investigación en NLP de bajos recursos: sirve como baseline afinado para NER y privacidad en uzbeko, comparable con modelos multilingües genéricos.
- Moderación y auditoría interna: etiqueta documentos internos para localizar información sensible antes de exportaciones o migraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (108,9 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador.
- En fp16: aproximadamente 0,22 GB de pesos; en int8: aproximadamente 0,11 GB.
- Cabe holgadamente en cualquier GPU de consumo (GTX 1060 6 GB, RTX 3060, RTX 4090) y también en CPU para lotes pequeños.
- GPU recomendadas para alto throughput: A100, H100 o L4 para procesamiento por lotes a gran escala; para uso interactivo, cualquier GPU moderna es suficiente.
- Opciones de despliegue: Hugging Face Transformers (pipeline de token-classification), vLLM no aplica de forma nativa a encoder de clasificación, TGI no es la opción habitual; son viables ONNX Runtime, TorchScript y servicios de inferencia ligeros.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera latencia de milisegundos por secuencia corta en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| islomov/rubai-PII-detection-v1-latin | 108,9 M | no disponible | uzbeko (latino) | Apache 2.0 | gated en HF |
| BERT-base multilingüe (bert-base-multilingual-cased) | 178 M | 512 tokens | 104 idiomas | Apache 2.0 | abierto en HF |
| XLM-RoBERTa base | 278 M | 512 tokens | 100 idiomas | MIT | abierto en HF |
| Modelos NER específicos de uzbeko | no disponible | no disponible | uzbeko | variable | no disponible |

La comparativa se limita a alternativas genéricas, ya que no se dispone de datos de rendimiento del modelo Rubai frente a otros. El modelo destaca por su especialización en uzbeko y su tamaño reducido, mientras que los multilingües ofrecen mayor cobertura de idiomas pero menor ajuste específico.

## Limitaciones y advertencias

- El repositorio está marcado como "deprecated"; el autor podría haber publicado una versión posterior, por lo que conviene verificar antes de usarlo en producción.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que puede complicar la automatización de descargas.
- Solo cubre uzbeko en alfabeto latino; no se declara soporte para cirílico u otros idiomas.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y falsos negativos en la detección de PII, con impacto directo en privacidad.
- No se han publicado métricas de precisión, recall ni F1, lo que impide evaluar su fiabilidad objetiva.
- Posibles sesgos derivados del dataset de entrenamiento (islomov/rubai-NER-150K-Personal): dominios, estilos y distribución de entidades pueden no representar todos los casos reales.
- Licencia Apache 2.0 permite uso comercial, pero debe revisarse el cumplimiento de las condiciones de acceso gated.
- La longitud de contexto no está documentada; asumir el límite típico de BERT (512 tokens) es prudente, aunque no confirmado.
- Al ser un modelo de clasificación, no genera texto ni razona; su integración requiere un pipeline externo para la anonimización efectiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/islomov/rubai-PII-detection-v1-latin
- Dataset de entrenamiento: https://huggingface.co/datasets/islomov/rubai-NER-150K-Personal
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
