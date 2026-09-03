# OpenMed/OpenMed-PII-Portuguese-LiteClinicalU-Small-66M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-LiteClinicalU-Small-66M-v1-mlx es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en texto clínico en portugués. Desarrollado por OpenMed, se basa en una arquitectura DistilBERT (DistilBertForTokenClassification) con 66 millones de parámetros, y está empaquetado específicamente para inferencia en Apple Silicon mediante el framework MLX. El modelo identifica 54 tipos de entidades sensibles, como nombres, direcciones, números de seguridad social, números de historia clínica, entre otros.

Su relevancia radica en que aborda un problema poco cubierto: la de-identificación de datos clínicos en portugués, un requisito crítico para compartir registros médicos en investigación y cumplir normativas de privacidad como la LGPD brasileña. Al ser un modelo pequeño (66M) y ejecutarse localmente, permite procesar documentos clínicos sin enviar datos a la nube, lo que reduce riesgos de fuga de información. La versión MLX está optimizada para Macs con chip Apple Silicon, aunque también existe el checkpoint original en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBertForTokenClassification (DistilBERT) |
| Parametros totales | 66 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors MLX) |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una version destilada de BERT que conserva el 97% de las capacidades de comprension del lenguaje con un 40% menos de parametros. La capa de salida es una cabeza de clasificacion de tokens (token classification) que asigna una etiqueta PII a cada token del texto. El checkpoint original fue fine-tuneado a partir de un modelo base (OpenMed/OpenMed-PII-Portuguese-LiteClinicalU-Small-66M-v1) para la tarea especifica de deteccion de PII en textos clinicos portugueses.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO. La version MLX es una conversion del checkpoint original a un formato compatible con el runtime MLX de OpenMed, que permite inferencia en Apple Silicon sin necesidad de GPU dedicada.

## Capacidades

- Deteccion de PII a nivel de token en texto clinico portugues, con 54 tipos de entidades (nombres, direcciones, numeros de identificacion, datos de contacto, etc.).
- Clasificacion de tokens con etiquetas BIO (Begin, Inside, Outside) para identificar el inicio y el interior de cada entidad.
- Soporte de "smart merging" para agrupar tokens consecutivos en entidades completas, facilitando la extraccion de PII estructurada.
- Ejecucion local en Apple Silicon mediante MLX, sin necesidad de conexion a internet ni envio de datos a servidores externos.
- Compatibilidad con el ecosistema OpenMed, que incluye mas de 2.200 modelos medicos y soporte para 21 idiomas.
- Integracion sencilla via API Python (`extract_pii`) o mediante descarga directa del artefacto MLX para uso offline.

## Casos de uso

- De-identificacion de historias clinicas para investigacion: hospitales y centros de investigacion pueden anonimizar registros de pacientes portugueses antes de compartirlos con terceros, cumpliendo requisitos de privacidad como la LGPD. El modelo procesa el texto localmente y extrae todas las entidades PII para su posterior enmascaramiento o eliminacion.
- Preparacion de datasets para entrenamiento de modelos medicos: al limpiar grandes volumenes de notas clinicas, se eliminan datos personales antes de usarlos como datos de entrenamiento, reduciendo el riesgo de sesgo y filtraciones.
- Auditoria de cumplimiento normativo: organizaciones sanitarias pueden escanear automaticamente documentos internos para verificar que no contienen PII no autorizada, facilitando la conformidad con regulaciones de proteccion de datos.
- Intercambio seguro de datos entre instituciones: cuando dos hospitales necesitan colaborar en un estudio, el modelo permite anonimizar los registros antes de la transferencia, manteniendo la utilidad clinica de los datos.
- Sistemas de gestion de expedientes electronicos: integrado en el backend de un sistema de historia clinica, el modelo puede marcar automaticamente campos sensibles en tiempo real, ayudando a los profesionales a evitar la inclusion accidental de PII en campos no destinados a ello.
- Aplicaciones de salud movil: en una app de seguimiento de pacientes, el modelo puede detectar y ocultar datos personales en notas escritas por el usuario antes de sincronizarlas con la nube, protegiendo la privacidad incluso en entornos con poco ancho de banda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo de 66M de parametros, la inferencia es viable en cualquier Mac con chip Apple Silicon (M1 o superior) con al menos 8 GB de RAM unificada.
- VRAM estimada: menos de 1 GB para inferencia en MLX, ya que los pesos en safetensors ocupan aproximadamente 250 MB en precision FP32 (menos en FP16).
- GPU recomendada: no requiere GPU dedicada; el Neural Engine y los nucleos de GPU integrados en Apple Silicon son suficientes.
- En sistemas sin Apple Silicon, se puede usar el checkpoint original en PyTorch con CPU o GPU convencional (por ejemplo, una RTX 3060 con 6 GB de VRAM seria mas que suficiente).
- Opciones de despliegue: Python con `openmed[mlx]` en macOS, o el backend Hugging Face / PyTorch en otros sistemas. Tambien es posible usar el artefacto MLX directamente con la API de OpenMed.
- Latencia y throughput: no se han publicado mediciones oficiales, pero para un modelo de este tamano se espera un procesamiento de cientos de tokens por segundo en Apple Silicon.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de deteccion de PII en portugues. Como referencia, el modelo base original (OpenMed-PII-Portuguese-LiteClinicalU-Small-66M-v1) es el mismo checkpoint sin conversion MLX, y existen otros modelos de PII en ingles (como los basados en spaCy o transformers) pero no son directamente comparables por idioma y dominio. La informacion disponible no permite establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para portugues; no soporta otros idiomas.
- Al ser un modelo pequeno (66M), puede tener menor precision que modelos mas grandes en entidades poco frecuentes o en textos con mucha variabilidad linguistica.
- No se han publicado evaluaciones de sesgo o robustez; es posible que el modelo falle en dialectos regionales del portugues o en jerga clinica especifica.
- Riesgo de alucinacion: aunque es un modelo discriminativo (no generativo), puede clasificar erroneamente tokens como PII cuando no lo son, o viceversa. Se recomienda revision humana en entornos criticos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantias; el usuario es responsable de validar su rendimiento en su caso de uso concreto.
- La version MLX esta limitada a Apple Silicon; para otros entornos hay que usar el checkpoint PyTorch original.
- No se proporcionan detalles sobre el contexto maximo soportado; se recomienda probar con textos largos para verificar el comportamiento.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-LiteClinicalU-Small-66M-v1-mlx
- Checkpoint original (PyTorch): https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-LiteClinicalU-Small-66M-v1
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentacion del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentacion de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Coleccion de modelos medicos MLX: https://huggingface.co/collections/OpenMed/medical-mlx-models
