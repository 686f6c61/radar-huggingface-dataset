# OpenMed/OpenMed-PII-Italian-FastClinical-Small-82M-v1-mlx

## Resumen

OpenMed-PII-Italian-FastClinical-Small-82M-v1-mlx es un empaquetado en formato MLX del modelo de clasificación de tokens OpenMed-PII-Italian-FastClinical-Small-82M-v1, desarrollado por OpenMed para la detección y de-identificación de información personal identificable (PII) en texto clínico en italiano. El modelo original es un transformer basado en la arquitectura RoBERTa (RobertaForTokenClassification) con 82 millones de parámetros, fine-tuneado para identificar 54 tipos de entidades sensibles, como nombres, direcciones, números de seguridad social, números de historia clínica, entre otros.

La versión MLX está pensada para ejecutarse de forma nativa en dispositivos Apple Silicon (Mac, iPhone, iPad) mediante la librería OpenMed, lo que permite un procesamiento 100 % local sin enviar datos de pacientes a la nube. Este modelo forma parte del ecosistema OpenMed, que ofrece más de 2.200 modelos médicos y soporte para 21 idiomas, con licencia Apache-2.0. Su relevancia radica en la necesidad de cumplir normativas como HIPAA y GDPR en entornos sanitarios, donde la privacidad de los datos es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (RobertaForTokenClassification) |
| Parametros totales | 82 millones (según nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato MLX nativo) |
| Idiomas soportados | Italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo RoBERTa, concretamente `RobertaForTokenClassification`, fine-tuneado para la tarea de clasificación de tokens orientada a la detección de PII en italiano. No se han publicado detalles específicos sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La innovación principal de esta versión MLX es su empaquetado para Apple Silicon, que permite inferencia eficiente en dispositivos locales sin depender de la nube. El repositorio incluye `config.json`, `id2label.json` y los pesos en formato MLX, manteniendo compatibilidad con el tokenizador del modelo original a través de la referencia en `config.json`.

## Capacidades

- Detección y clasificación de 54 tipos de entidades PII en texto clínico italiano, incluyendo nombres, direcciones, números de seguridad social, números de historia clínica, fechas, teléfonos, etc.
- De-identificación de documentos clínicos: el modelo puede marcar y extraer entidades sensibles para su posterior anonimización.
- Integración con la librería OpenMed, que ofrece una API unificada (`extract_pii`) con fusión inteligente de entidades (`use_smart_merging=True`).
- Ejecución local en Apple Silicon mediante MLX, tanto en Python como en Swift (OpenMedKit), sin necesidad de conexión a internet.
- Compatibilidad con backend PyTorch/Hugging Face en otros sistemas, aunque el empaquetado MLX está optimizado para Apple.

## Casos de uso

- Anonimización de historias clínicas electrónicas: el modelo puede procesar notas clínicas en italiano y extraer todas las entidades PII para que un sistema posterior las enmascare o elimine, cumpliendo con normativas de privacidad como GDPR o HIPAA.
- Investigación médica secundaria: permite utilizar datos clínicos reales en estudios sin exponer información personal, ya que el modelo identifica y separa los datos sensibles antes de compartir los conjuntos de datos.
- Cumplimiento normativo en hospitales y clínicas: integrado en flujos de trabajo locales, el modelo ayuda a auditar y garantizar que los documentos clínicos no contengan PII no autorizada antes de su transmisión o almacenamiento externo.
- Aplicaciones móviles de salud: gracias a su formato MLX y su pequeño tamaño (82M), puede ejecutarse en iPhone o iPad, permitiendo a los profesionales sanitarios de-identificar notas directamente en el dispositivo.
- Procesamiento de lotes de documentos: al ser ligero, puede procesar grandes volúmenes de texto clínico en servidores locales con CPU o GPU Apple, sin necesidad de infraestructura en la nube.
- Desarrollo de pipelines de NLP clínico: el modelo sirve como componente de extracción de entidades en sistemas más amplios de procesamiento de lenguaje natural para el sector sanitario italiano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la información disponible. La organización OpenMed afirma en su web que sus modelos logran "state of the art on 10 of 12 biomedical NER benchmarks", pero no se detallan los resultados concretos para esta variante concreta. Por tanto, no se pueden presentar cifras verificadas.

## Requisitos de hardware

- Al ser un modelo de 82M parámetros, su huella de memoria es reducida. En formato MLX, puede ejecutarse en cualquier Mac con chip Apple Silicon (M1 o superior) con al menos 8 GB de RAM unificada.
- También es compatible con iPhone y iPad reales (no simulador) mediante OpenMedKit, lo que lo hace apto para despliegue en dispositivos móviles.
- No se requieren GPUs dedicadas; la inferencia se realiza en la Neural Engine o GPU integrada de Apple Silicon.
- Opciones de despliegue: librería `openmed[mlx]` en Python, OpenMedKit en Swift, o uso directo del repositorio MLX con la API de OpenMed.
- La latencia y el throughput no están documentados, pero para un modelo de este tamaño se espera un rendimiento en tiempo real en hardware Apple moderno.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de detección de PII en italiano. No se han encontrado modelos equivalentes con especificaciones públicas comparables en la información proporcionada. Se recomienda consultar el catálogo de OpenMed para alternativas en otros idiomas o tamaños.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para texto clínico en italiano; su rendimiento en otros dominios o idiomas puede ser deficiente.
- Al ser un modelo pequeño (82M), puede tener dificultades con contextos muy largos o con variaciones dialectales o jerga médica poco frecuente.
- No se han publicado detalles sobre sesgos o riesgos de alucinación, pero como todo modelo de clasificación de tokens, puede cometer errores de etiquetado, especialmente en entidades ambiguas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo debe utilizarse como herramienta de apoyo y no como sustituto de revisión humana en contextos clínicos críticos.
- El empaquetado MLX no incluye el tokenizador; depende de la referencia al modelo base en `config.json`, lo que requiere acceso a Hugging Face para descargar los assets del tokenizador si no están cacheados.

## Enlaces

- Repositorio Hugging Face del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Italian-FastClinical-Small-82M-v1-mlx
- Modelo base: https://huggingface.co/OpenMed/OpenMed-PII-Italian-FastClinical-Small-82M-v1
- GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Sitio web de OpenMed: https://openmed.life/
