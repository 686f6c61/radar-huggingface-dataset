# OpenMed/OpenMed-PII-Italian-SnowflakeMed-Large-568M-v1-mlx

## Resumen

OpenMed-PII-Italian-SnowflakeMed-Large-568M-v1-mlx es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en texto clínico en italiano. Desarrollado por OpenMed, este modelo es un empaquetado en formato MLX del checkpoint original OpenMed-PII-Italian-SnowflakeMed-Large-568M-v1, diseñado para ejecutarse de forma nativa en dispositivos Apple Silicon (Mac, iPhone y iPad) sin necesidad de conexión a la nube.

El modelo se basa en la arquitectura XLM-RoBERTa (concretamente `XLMRobertaForTokenClassification`) y está fine-tuneado para identificar y clasificar 54 tipos de entidades sensibles, como nombres, direcciones, números de seguridad social, números de historia clínica y otros datos protegidos. Su relevancia radica en que permite la de-identificación de documentos clínicos de forma local, cumpliendo con normativas como HIPAA, y se integra en el ecosistema OpenMed, que ofrece más de 2.200 modelos médicos en 21 idiomas.

El repositorio MLX incluye los pesos en formato `safetensors` o `npz`, junto con `config.json` e `id2label.json`, y es compatible tanto con la API de Python de OpenMed como con OpenMedKit para Swift. Aunque el modelo está pensado para italiano, la familia OpenMed cubre múltiples idiomas, lo que lo hace parte de una solución más amplia de IA clínica local-first.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (`XLMRobertaForTokenClassification`) |
| Parametros totales | 568M (según el nombre del modelo base, no confirmado en el repo MLX) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Italiano (`it`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, npz (MLX) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de la familia XLM-RoBERTa, adaptado para clasificación de tokens. La arquitectura base es un encoder bidireccional preentrenado multilingüe, sobre el cual se ha realizado un fine-tuning específico para la tarea de detección de PII en italiano. El checkpoint original (`OpenMed-PII-Italian-SnowflakeMed-Large-568M-v1`) fue entrenado para reconocer 54 categorías de entidades sensibles, y este repositorio MLX es una conversión de pesos para inferencia en Apple Silicon.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni si se utilizaron técnicas como RLHF o DPO. El modelo se distribuye como parte del ecosistema OpenMed, que prioriza la ejecución local y la privacidad de los datos clínicos. La conversión a MLX mantiene la compatibilidad con el tokenizador original, que se referencia en `config.json` y se carga automáticamente si no está incluido en el repo.

## Capacidades

- Detección de información personal identificable (PII) en texto clínico italiano, con 54 tipos de entidades (nombres, direcciones, números de seguridad social, números de historia clínica, etc.).
- Clasificación de tokens a nivel de token, con etiquetas definidas en `id2label.json`.
- De-identificación de documentos médicos para cumplimiento de normativas como HIPAA.
- Integración con la API `extract_pii` de OpenMed, que permite extraer entidades con confianza y fusión inteligente de tokens (`use_smart_merging`).
- Ejecución 100% local en Apple Silicon (Mac, iPhone, iPad) mediante MLX, sin necesidad de conexión a la nube.
- Soporte para Python (a través de `openmed[mlx]`) y Swift (mediante OpenMedKit).
- Compatibilidad con el backend de Hugging Face / PyTorch en sistemas sin Apple Silicon, como fallback.

## Casos de uso

- Anonimización de historiales clínicos: el modelo puede procesar notas médicas en italiano y eliminar o enmascarar automáticamente datos personales, facilitando el uso secundario de datos para investigación sin violar la privacidad del paciente.
- Cumplimiento HIPAA en entornos sanitarios: integrado en sistemas de gestión de historiales, permite auditar y de-identificar documentos antes de su almacenamiento o intercambio, reduciendo el riesgo de filtraciones.
- Preparación de datasets para entrenamiento de modelos médicos: al eliminar PII de corpus clínicos, se pueden crear conjuntos de datos anonimizados para fine-tuning de otros modelos, manteniendo la utilidad clínica.
- Aplicaciones móviles de salud: gracias a su formato MLX, puede ejecutarse en iPhone o iPad, permitiendo a profesionales sanitarios de-identificar notas directamente en el dispositivo sin enviar datos a servidores externos.
- Investigación biomédica colaborativa: facilita el intercambio de datos clínicos entre instituciones al garantizar que la información personal está eliminada, cumpliendo con requisitos éticos y legales.
- Sistemas de atención al paciente con soporte multilingüe: aunque este modelo es específico para italiano, puede combinarse con otros modelos de la familia OpenMed para cubrir múltiples idiomas en entornos clínicos internacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la informacion disponible. La organización OpenMed afirma tener "estado del arte en 10 de 12 benchmarks NER biomédicos" en su conjunto de modelos, pero no se proporcionan métricas concretas para esta variante italiana. No se dispone de comparaciones con otros modelos de detección de PII.

## Requisitos de hardware

- Requiere un dispositivo Apple Silicon: Mac con chip M1, M2, M3 o M4, o iPhone/iPad físico (el simulador de iOS no es compatible con Swift MLX).
- VRAM estimada: para un modelo de 568M parámetros en MLX, se estima un uso de memoria de aproximadamente 1-2 GB, aunque no se ha confirmado oficialmente. El tamaño del repositorio es de 2.3 GB, que incluye los pesos y archivos de configuración.
- GPU recomendada: no aplica GPU dedicada; la inferencia se ejecuta en la Neural Engine o GPU integrada del chip Apple Silicon.
- Opciones de despliegue: Python con `openmed[mlx]`, Swift con OpenMedKit, o uso directo del directorio local con la API de OpenMed.
- Latencia y throughput: no se han publicado datos específicos, pero al ser un modelo de tamaño medio y ejecutarse en hardware Apple Silicon, se espera una latencia de milisegundos por documento en dispositivos modernos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares de detección de PII en italiano. El modelo base (`OpenMed-PII-Italian-SnowflakeMed-Large-568M-v1`) es el checkpoint original, y este repo MLX es una conversión para Apple Silicon. No se han encontrado alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para italiano; su uso en otros idiomas puede producir resultados incorrectos o incompletos.
- No se han documentado sesgos específicos, pero al basarse en XLM-RoBERTa, puede heredar sesgos presentes en los datos de preentrenamiento multilingüe.
- Riesgo de alucinación en la clasificación: como todo modelo de NER, puede etiquetar incorrectamente tokens que no son PII o pasar por alto entidades reales, especialmente en textos con jerga clínica poco común.
- La longitud de contexto no está especificada; si se hereda de XLM-RoBERTa, probablemente sea de 512 tokens, lo que limita el procesamiento de documentos muy largos sin segmentación previa.
- El repositorio MLX no incluye el tokenizador; depende de la referencia en `config.json` para cargarlo, lo que requiere acceso al modelo base en Hugging Face.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar el cumplimiento de normativas de protección de datos (GDPR, HIPAA) al desplegar el modelo en entornos de producción.
- El modelo tiene solo 14 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopción limitada y posible falta de validación externa.

## Enlaces

- Repositorio HuggingFace del modelo MLX: [https://huggingface.co/OpenMed/OpenMed-PII-Italian-SnowflakeMed-Large-568M-v1-mlx](https://huggingface.co/OpenMed/OpenMed-PII-Italian-SnowflakeMed-Large-568M-v1-mlx)
- Checkpoint original: [https://huggingface.co/OpenMed/OpenMed-PII-Italian-SnowflakeMed-Large-568M-v1](https://huggingface.co/OpenMed/OpenMed-PII-Italian-SnowflakeMed-Large-568M-v1)
- Repositorio GitHub de OpenMed: [https://github.com/maziyarpanahi/openmed](https://github.com/maziyarpanahi/openmed)
- Documentación del backend MLX: [https://openmed.life/docs/mlx-backend/](https://openmed.life/docs/mlx-backend/)
- Documentación de OpenMedKit (Swift): [https://openmed.life/docs/swift-openmedkit/](https://openmed.life/docs/swift-openmedkit/)
- Sitio web de OpenMed: [https://openmed.life/](https://openmed.life/)
