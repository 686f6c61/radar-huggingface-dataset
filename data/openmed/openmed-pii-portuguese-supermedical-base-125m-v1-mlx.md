# OpenMed/OpenMed-PII-Portuguese-SuperMedical-Base-125M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-SuperMedical-Base-125M-v1-mlx es un empaquetado en formato MLX del modelo de clasificación de tokens OpenMed-PII-Portuguese-SuperMedical-Base-125M-v1, desarrollado por OpenMed para la detección de información personal identificable (PII) en texto clínico en portugués. El modelo base es un `RobertaForTokenClassification` de la familia BERT, fine-tuneado específicamente para tareas de de-identificación en el ámbito médico. Esta versión MLX está optimizada para inferencia en Apple Silicon mediante la librería OpenMed, lo que permite ejecutar el modelo localmente en Macs sin necesidad de GPU dedicada.

El modelo resuelve el problema de la anonimización de datos clínicos, un requisito crítico para cumplir normativas de protección de datos como la LGPD en Brasil o el RGPD en Europa. Su relevancia actual radica en que permite procesar historias clínicas y notas médicas en portugués de forma local, sin enviar datos sensibles a servidores externos, manteniendo la privacidad del paciente. El tamaño del repositorio es de 1,0 GB, lo que sugiere un modelo de aproximadamente 125 millones de parámetros, aunque este dato no está confirmado en la documentación oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT / RoBERTa (`RobertaForTokenClassification`) |
| Parametros totales | No disponible (el nombre sugiere 125M, no confirmado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base es un `RobertaForTokenClassification`, una variante de la arquitectura BERT adaptada para clasificación a nivel de token. Esta arquitectura emplea un transformer encoder con atención bidireccional, lo que resulta adecuado para tareas de etiquetado secuencial como la detección de entidades nombradas (NER) y, en este caso, la identificación de PII en texto clínico. El modelo fue fine-tuneado a partir de un checkpoint preentrenado en portugués, aunque no se dispone de detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. La versión MLX es una conversión de los pesos originales al formato de Apple Silicon, manteniendo la misma arquitectura y comportamiento.

## Capacidades

- Detección de información personal identificable (PII) en texto clínico en portugués, incluyendo nombres, direcciones, números de documento, fechas y otros datos sensibles.
- Clasificación de tokens con etiquetas predefinidas (el archivo `id2label.json` define el mapeo de etiquetas).
- De-identificación de historias clínicas y notas médicas para su uso en investigación o intercambio seguro.
- Ejecución local en Apple Silicon mediante el backend MLX de OpenMed, sin necesidad de conexión a internet.
- Integración con la API de OpenMed (`extract_pii`) que permite extraer entidades con puntuaciones de confianza.
- Soporte de "smart merging" para combinar tokens fragmentados en entidades completas.

## Casos de uso

- Anonimización de historias clínicas en hospitales y clínicas portuguesas o brasileñas: el modelo procesa notas médicas y elimina o enmascara los datos personales antes de compartirlos con terceros, cumpliendo con la LGPD y el RGPD.
- Preparación de datasets clínicos para investigación: los investigadores pueden de-identificar grandes volúmenes de texto médico en portugués para entrenar otros modelos sin violar la privacidad de los pacientes.
- Cumplimiento normativo en ensayos clínicos: antes de publicar resultados o compartir datos con colaboradores internacionales, el modelo garantiza que no se filtren identificadores personales.
- Auditoría de registros médicos electrónicos: el modelo puede escanear bases de datos existentes para detectar fugas de PII y alertar sobre posibles brechas de seguridad.
- Desarrollo de aplicaciones de salud móviles: al ejecutarse localmente en Apple Silicon, permite integrar la de-identificación en apps de iOS sin enviar datos a la nube, como indica la filosofía "local-first" de OpenMed.
- Traducción o procesamiento de texto clínico en portugués: antes de aplicar otras tareas de NLP (como resumen o extracción de entidades médicas), el modelo limpia el texto de datos personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La web de OpenMed menciona que sus modelos logran "estado del arte en 10 de 12 benchmarks de NER biomédico", pero no se especifican cifras concretas para este modelo en particular.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 125 millones de parámetros, es ligero y puede ejecutarse en Macs con Apple Silicon (M1, M2, M3 o superiores) con memoria unificada de al menos 8 GB.
- No requiere GPU dedicada; el backend MLX aprovecha la GPU integrada y la Neural Engine de Apple.
- Para uso en otros sistemas (Linux, Windows), OpenMed ofrece un backend PyTorch/Hugging Face como alternativa, aunque el empaquetado MLX está pensado exclusivamente para Apple Silicon.
- El despliegue se realiza mediante la librería `openmed[mlx]`, que gestiona la carga del modelo y la inferencia de forma automática.
- No se dispone de datos de latencia o throughput específicos, pero al ser un modelo pequeño, se espera un rendimiento en tiempo real en tareas de clasificación de tokens.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de detección de PII en portugués. El ecosistema de OpenMed incluye más de 2.000 modelos Apache-2.0 para 33 idiomas, pero no se han encontrado datos concretos sobre alternativas comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para portugués; no es aplicable a otros idiomas sin un fine-tuning adicional.
- Al ser un modelo de clasificación de tokens, no genera texto y no presenta riesgo de alucinación en el sentido generativo, pero puede cometer errores de etiquetado (falsos positivos o negativos) en contextos ambiguos.
- No se dispone de información sobre sesgos potenciales en el entrenamiento, aunque los modelos de PII pueden tener dificultades con variaciones dialectales del portugués (europeo vs. brasileño).
- La licencia Apache-2.0 permite uso comercial, pero se recomienda validar el rendimiento del modelo en el dominio clínico específico antes de su uso en producción.
- El empaquetado MLX está limitado a Apple Silicon; para otros entornos es necesario usar el modelo base en formato PyTorch.
- No se han publicado métricas de precisión, recall o F1 para este modelo, por lo que su rendimiento real en datos clínicos no está cuantificado.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-SuperMedical-Base-125M-v1-mlx
- Modelo base en HuggingFace: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-SuperMedical-Base-125M-v1
- Sitio web de OpenMed: https://openmed.life/
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
