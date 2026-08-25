# Muhammad-Zubair796/Khatta-ka

## Resumen

Khatta-ka es un adaptador LoRA (Low-Rank Adaptation) fine-tuneado específicamente para el dialecto Khattak del pastún, una lengua irania hablada principalmente en Pakistán y Afganistán. Desarrollado por Muhammad Zubair, este modelo se presenta como el primer sistema de IA entrenado para comprender y generar este dialecto regional, que difiere notablemente del pastún estándar en vocabulario, ortografía y gramática. El adaptador se carga junto con su modelo base, `junaid008/qehwa-pashto-llm`, que a su vez es un fine-tune de la familia Qwen2, lo que le confiere capacidades de generación de texto en inglés y pastún.

La relevancia de este modelo radica en abordar un problema práctico: los modelos de pastún estándar suelen fallar al procesar dialectos rurales, lo que limita su utilidad en comunidades que hablan variantes regionales. Al especializarse en el dialecto Khattak, el modelo busca preservar y digitalizar una variante lingüística minoritaria, con aplicaciones en traducción, asistencia conversacional y documentación cultural. El adaptador, con un tamaño de repositorio de 1,0 GB, se distribuye bajo licencia Apache-2.0 y está diseñado para recibir instrucciones en inglés o pastún estándar y responder en pastún Khattak auténtico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base Qwen2 (fine-tune de `junaid008/qehwa-pashto-llm`) |
| Parametros totales | no disponible (depende del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | pastún (ps), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, lo que significa que no es un modelo completo, sino un conjunto de pesos de baja dimensión que se añaden a un modelo base preentrenado. El modelo base, `junaid008/qehwa-pashto-llm`, es un fine-tune de la familia Qwen2, una arquitectura transformer de última generación. El adaptador fue entrenado con la librería Unsloth, que optimiza el proceso de fine-tuning, y con TRL (Transformer Reinforcement Learning), aunque no se especifica si se utilizó RLHF o DPO. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación empleadas. La innovación principal reside en la especialización dialectal: el modelo fue ajustado para capturar las particularidades del pastún Khattak, como las grafías regionales "شوشته" y "ایس نه کاون", que los modelos de pastún estándar no reconocen.

## Capacidades

- Generación de texto en pastún dialectal Khattak, con vocabulario, ortografía y gramática específicas de la región.
- Comprensión de instrucciones en inglés y pastún estándar, respondiendo en pastún Khattak auténtico.
- Fine-tuning específico para preservar reglas lingüísticas indígenas, lo que lo hace útil para tareas de traducción y transcripción dialectal.
- Compatible con pipelines de generación de texto (text-generation-inference) y con la librería transformers.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Preservación lingüística: el modelo puede digitalizar y documentar el dialecto Khattak, generando textos en esta variante para archivos culturales o educativos, gracias a su especialización en vocabulario y gramática regionales.
- Traducción automática dialectal: permite traducir contenido del inglés o pastún estándar al pastún Khattak, útil para organizaciones que trabajan con comunidades rurales en Pakistán o Afganistán.
- Asistente conversacional localizado: puede integrarse en chatbots o asistentes virtuales para responder en el dialecto Khattak, mejorando la accesibilidad de servicios digitales para hablantes nativos.
- Transcripción y normalización de textos: dado que el modelo entiende variantes ortográficas regionales, puede transcribir o normalizar documentos escritos en pastún Khattak a un formato más estándar o viceversa.
- Educación y aprendizaje de lenguas: sirve como herramienta para estudiantes o investigadores que necesitan ejemplos auténticos de pastún Khattak, generando frases o diálogos en este dialecto.
- Desarrollo de contenido local: creadores de contenido o medios comunitarios pueden usar el modelo para generar artículos, guiones o publicaciones en pastún Khattak, adaptados a la audiencia regional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware dependen del modelo base `junaid008/qehwa-pashto-llm`, cuyo tamaño no se especifica. El adaptador en sí ocupa 1,0 GB en disco.
- Se recomienda una GPU con al menos 8 GB de VRAM para cargar el modelo base junto con el adaptador, aunque esto es una estimación orientativa y puede variar según el tamaño real del modelo base.
- Para despliegue en producción, se pueden usar servidores de inferencia como vLLM o TGI (Text Generation Inference), dado que el modelo es compatible con `text-generation-inference`.
- En entornos de desarrollo, es posible ejecutarlo con la librería transformers en una GPU consumer como una RTX 3060 o superior, siempre que el modelo base quepa en memoria.
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para el dialecto Khattak. Los modelos de pastún estándar existentes, como los basados en Qwen2 o Llama, no están especializados en dialectos regionales, pero no se han encontrado datos concretos de rendimiento para comparar. La única referencia es el modelo base `junaid008/qehwa-pashto-llm`, que sirve como punto de partida, pero no se dispone de métricas comparativas.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere cargar el modelo base `junaid008/qehwa-pashto-llm` para funcionar, lo que añade complejidad al despliegue.
- No se han publicado evaluaciones de sesgos o alucinaciones; al ser un modelo pequeño y especializado, puede presentar errores en contextos fuera del dialecto Khattak.
- La cobertura del dialecto es limitada: solo se ha entrenado con datos del dialecto Khattak, por lo que no es adecuado para otras variantes del pastún.
- No se especifica la longitud de contexto, lo que puede limitar tareas que requieran ventanas largas.
- Aunque la licencia es Apache-2.0, el modelo base puede tener restricciones adicionales; se recomienda verificar la licencia de `junaid008/qehwa-pashto-llm` antes de uso comercial.
- El modelo tiene cero descargas y cero likes en HuggingFace, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Muhammad-Zubair796/Khatta-ka
- Repositorio GitHub: https://github.com/Muhammad-Zubair796/Khatta-ka-LLM
- Modelo base: https://huggingface.co/junaid008/qehwa-pashto-llm
