# LlamaPal/LFM2.5-350M-QAD-Q4_0-GGUF

## Resumen

LFM2.5-350M es un modelo de lenguaje conversacional de 354.483.968 parámetros desarrollado por Liquid AI, distribuido originalmente en formato GGUF bajo la licencia LFM Open License v1.0. Este repositorio concreto, publicado por LlamaPal, no es un modelo nuevo: es un espejo sin modificar del fichero `LFM2.5-350M-QAD-Q4_0.gguf` del repositorio oficial de Liquid AI, con el mismo hash SHA-256, empaquetado para que la aplicación móvil LlamaPal lo descargue en dispositivos Android.

La relevancia de esta ficha está en el artefacto, no en el modelo: una cuantización Q4_0 de 219 MB pensada para inferencia totalmente offline en teléfonos. La cuantización QAD (quantization-aware distillation) la realizó Liquid AI para preservar la calidad del modelo original a 4 bits, de modo que quepa en memoria móvil y arranque con latencia mínima. El modelo base está orientado a preguntas cortas y tareas simples, no a razonamiento complejo ni a contextos extensos.

Al tratarse de un espejo, la información técnica disponible se limita a lo que declara la model card del repositorio y a los metadatos de Hugging Face. No se han publicado en esta información detalles sobre arquitectura interna, composición del dataset de entrenamiento, benchmarks ni longitud de contexto del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM2.5-350M; familia LFM de Liquid AI) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (QAD, quantization-aware distillation); el repo contiene un unico fichero GGUF |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0; license: other) |
| Formato de pesos | GGUF (llama.cpp) |

Datos adicionales del artefacto: fichero `LFM2.5-350M-QAD-Q4_0.gguf` de 219 MB, SHA-256 `3d10b6ab8fc91a919534b9558e266255aca0bbc7f6d015963599aa9e74e05b1d`, procedente de `LiquidAI/LFM2.5-350M-GGUF` en el commit `657e078c9408`. Tamaño del repositorio: 0,2 GB.

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. La model card del espejo no describe si LFM2.5-350M usa un transformer denso, una arquitectura híbrida o algún esquema de atención lineal; solo lo identifica como el «modelo de chat diminuto» de Liquid AI. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO.

La innovación técnica documentada es la cuantización QAD (quantization-aware distillation) aplicada por Liquid AI: el modelo se destila teniendo en cuenta la cuantización para conservar calidad a 4 bits. El resultado es un GGUF Q4_0 de 219 MB que, según el autor del espejo, «carga al instante y responde rápido en cualquier teléfono». No se aportan más detalles sobre el proceso de destilación, el profesor utilizado ni las métricas de degradación respecto al modelo en precisión completa.

## Capacidades

- Generación de texto conversacional en formato chat (pipeline `text-generation`, tag `conversational`).
- Respuestas a preguntas cortas y tareas simples, según la propia model card («best for short questions and simple tasks»).
- Inferencia totalmente offline en dispositivo, sin conexión a internet ni cuenta de usuario.
- Ejecución en llama.cpp y en cualquier aplicación construida sobre llama.cpp (el GGUF es estándar).
- Integración con la app Android LlamaPal mediante descarga del fichero desde la lista de modelos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Chat offline en Android: la app LlamaPal descarga este GGUF de 219 MB y permite conversar sin internet; encaja porque el modelo está destilado para 4 bits y cabe en la memoria de un teléfono de gama media.
- Asistente personal de bolsillo para preguntas cortas: consultas puntuales (definiciones, conversión de unidades, borradores de una frase) donde la latencia importa más que la profundidad de razonamiento.
- Privacidad por diseño en entornos sensibles: al no salir ningún dato del dispositivo, es apto para notas o consultas sobre información personal que no debe enviarse a un servicio en la nube.
- Prototipado rápido de aplicaciones móviles con llama.cpp: sirve como modelo de referencia para validar pipelines de inferencia on-device antes de subir a modelos mayores.
- Pruebas de integración de GGUF en pipelines CI: su tamaño reducido (219 MB) permite incluirlo en tests automatizados de carga y generación sin coste de GPU.
- Demos educativas de LLM en dispositivos: útil para mostrar en talleres cómo funciona un modelo generativo sin depender de infraestructura cloud.
- Modo avión o entornos sin conectividad: uso en campo, transporte o zonas sin cobertura donde un asistente local resuelve consultas básicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos; solo una afirmación cualitativa sobre velocidad de carga y respuesta en móvil.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso principal (inferencia en CPU móvil); el fichero pesa 219 MB y la huella en memoria es del orden de unos cientos de MB, aunque no se publica una cifra oficial.
- GPU recomendadas: no disponibles para este artefacto; está orientado a CPU de Android.
- ¿Cabe en GPU de consumo? Sí, por tamaño (219 MB) cabría en cualquier GPU de consumo, pero no es el objetivo declarado del repositorio.
- Despliegue: llama.cpp y aplicaciones basadas en llama.cpp; la app Android LlamaPal lo consume directamente. vLLM, TGI u Ollama no se mencionan en la documentación.
- Latencia y throughput: no disponibles como cifras; la model card solo indica que «carga al instante y responde rápido en cualquier teléfono».

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base (contexto, arquitectura) que permitan una comparación rigurosa. Se indica a continuación lo que sí consta:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-350M-QAD-Q4_0 (este repo) | 354.483.968 | no disponible | LFM Open License v1.0 | GGUF Q4_0 | Espejo de LlamaPal del original de Liquid AI |
| LiquidAI/LFM2.5-350M-GGUF (original) | 354.483.968 | no disponible | LFM Open License v1.0 | GGUF | Fuente del fichero; incluye model card completa |
| LiquidAI/LFM2.5-2.6B-GGUF | no disponible en esta información | no disponible | LFM Open License v1.0 | GGUF | Hermano mayor de la familia, citado en la licencia |

No se dispone de alternativas comparables de otros fabricantes con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- Es un espejo, no un modelo propio: cualquier corrección o actualización debe buscarse en `LiquidAI/LFM2.5-350M-GGUF`; este repositorio no aporta mejoras.
- Modelo de 350M parámetros: capacidad limitada a preguntas cortas y tareas simples; no es adecuado para razonamiento complejo, código de producción ni contextos largos.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad; en un modelo de este tamaño el riesgo es inherentemente alto.
- Idiomas y longitud de contexto no declarados: no se puede garantizar un comportamiento multilingüe ni un contexto mínimo.
- Licencia LFM Open License v1.0: es una licencia «other» con términos propios; antes de uso comercial hay que leer el texto completo en el fichero `LICENSE` del repositorio y en el enlace oficial. No se detallan aquí las restricciones concretas.
- Sin datos de benchmarks ni de sesgos: no hay evidencia publicada en esta información sobre sesgos conocidos.
- Cuantización Q4_0: pérdida de calidad respecto al modelo en precisión completa, mitigada según Liquid AI por la destilación QAD, pero sin métricas publicadas que lo cuantifiquen.
- Sin descargas ni likes en el momento de la consulta: ecosistema mínimo, sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LlamaPal/LFM2.5-350M-QAD-Q4_0-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- GGUF original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-350M-GGUF
- Commit del fichero espejo: https://huggingface.co/LiquidAI/LFM2.5-350M-GGUF/tree/657e078c94084481950a2d555a941481f715536b
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF/blob/main/LICENSE
- App LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
