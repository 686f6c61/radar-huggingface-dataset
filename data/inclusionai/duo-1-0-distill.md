# inclusionAI/Duo-1.0-distill

## Resumen

Duo-1.0-distill es la variante destilada a cuatro pasos del modelo de mundo (world model) Duo 1.0, desarrollado por inclusionAI. Se trata de un modelo multimodal "any-to-any" orientado a la interacción audiovisual en tiempo real, con capacidad de generar vídeo y audio de forma recíproca, es decir, en modo full-duplex. El repositorio contiene únicamente los pesos de la llamada "Realization" destilada, que funcionan como superposición (overlay) sobre el bundle base `inclusionAI/Duo-1.0-causal-base`, del que heredan el módulo Intent, los códecs, los modelos de voz y el backbone de Realization.

La relevancia del modelo radica en su enfoque de interacción bidireccional continua: no se limita a generar una respuesta cerrada, sino que modela el intercambio simultáneo de señales de audio y vídeo, algo poco habitual en los modelos generativos publicados hasta la fecha. La destilación a cuatro pasos (sampler Euler, flow shift 5.0) reduce el coste de inferencia frente al modelo base, lo que lo hace más viable para escenarios interactivos de baja latencia.

El modelo se distribuye bajo la licencia comunitaria `minimax-h3-community-license`, ya que sus pesos se inicializaron a partir de MiniMax H3 y fueron posteriormente entrenados por el equipo de Duo. El repositorio ocupa 2,8 GB y acumula 1125 descargas y 21 likes en Hugging Face en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de mundo multimodal causal (world model) con backbone de Realization; detalles completos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en PyTorch Distributed Checkpoint, DCP) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (license: other) |
| Formato de pesos | PyTorch Distributed Checkpoint (DCP), overlay sobre `inclusionAI/Duo-1.0-causal-base` |

## Arquitectura y entrenamiento

Duo 1.0 se presenta como un modelo de mundo multimodal recíproco para interacción full-duplex en tiempo real. La arquitectura se organiza en torno a varios componentes: un módulo Intent, códecs de audio y vídeo, modelos de voz y un backbone de Realization. Este repositorio concreto aporta los pesos de Realization destilados a cuatro pasos, que se superponen al bundle causal-base descargado por separado. El sampler por defecto es Euler con 4 pasos y flow shift de 5.0, lo que indica un esquema de generación basado en flow matching.

El entrenamiento parte de pesos inicializados desde MiniMax H3, posteriormente entrenados por el equipo de Duo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal declarada es la naturaleza recíproca y full-duplex del modelo, junto con la destilación a cuatro pasos que reduce el número de evaluaciones del sampler en inferencia.

## Capacidades

- Generación de vídeo y audio de forma conjunta en un pipeline any-to-any.
- Interacción audiovisual full-duplex: el modelo modela el intercambio simultáneo de señales, no solo turnos alternos.
- Generación de habla integrada mediante los modelos de voz incluidos en el bundle base.
- Modelado de mundo (world model): simulación de dinámicas audiovisuales recíprocas.
- Inferencia acelerada mediante destilación a cuatro pasos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio como entrada: no disponible en la información proporcionada más allá de la naturaleza any-to-any declarada.

## Casos de uso

- Avatares conversacionales en tiempo real: el modelo puede generar simultáneamente vídeo y audio del interlocutor sintético, manteniendo la reciprocidad de la interacción gracias a su naturaleza full-duplex, lo que resulta adecuado para asistentes con presencia visual.
- Telepresencia y videoconferencia sintética: la generación conjunta de audio y vídeo permite construir contrapartes virtuales que responden de forma continua, reduciendo el coste frente a pipelines separados de TTS y generación de vídeo.
- Simulación de entornos interactivos para entrenamiento de agentes: al tratarse de un world model, puede emplearse para generar dinámicas audiovisuales de respuesta en bucles de simulación.
- Prototipado de experiencias interactivas en investigación: la variante destilada a cuatro pasos facilita iteraciones rápidas con menor coste de inferencia que el modelo base.
- Generación de contenido audiovisual condicionada: útil para producir clips con pista de audio coherente en flujos de creación de contenido.
- Investigación en modelos de mundo recíprocos: sirve como base reproducible para estudiar interacción full-duplex, dado que el código y la configuración están publicados en el repositorio de GitHub del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio de pesos ocupa 2,8 GB, pero requiere además el bundle `Duo-1.0-causal-base`, cuyo tamaño no se especifica.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo usa PyTorch Distributed Checkpoint (DCP) y depende del runtime del repositorio `inclusionAI/Duo`; no se indican integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible, aunque la destilación a cuatro pasos está orientada a reducir el coste de muestreo frente al modelo base.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (world models audiovisuales full-duplex) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Los pesos de este repositorio no son autónomos: requieren el bundle `inclusionAI/Duo-1.0-causal-base` superpuesto en el mismo directorio para funcionar.
- La licencia `minimax-h3-community-license` es de tipo comunitario y no equivale a una licencia open source permisiva; es necesario revisar `LICENSE` y `NOTICE` antes de cualquier uso comercial.
- Los pesos se inicializaron desde MiniMax H3, lo que puede imponer restricciones adicionales derivadas de la licencia original.
- No se documentan sesgos conocidos, tasas de alucinación ni cobertura idiomática.
- Al ser una variante destilada a cuatro pasos, es esperable una fidelidad inferior a la del modelo base, aunque no se aportan métricas que lo cuantifiquen.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en producción.
- La información sobre capacidades de tool calling, agentes y multilingüismo no está disponible.

## Enlaces

- [Hugging Face: inclusionAI/Duo-1.0-distill](https://huggingface.co/inclusionAI/Duo-1.0-distill)
- [Paper arXiv:2611.15131](https://arxiv.org/abs/2611.15131)
- [Página del proyecto](https://duo-v1.github.io/)
- [Colección de modelos Duo v1 en Hugging Face](https://huggingface.co/collections/inclusionAI/duo-v1)
- [Colección Duo-v1 en ModelScope](https://www.modelscope.cn/collections/inclusionAI/Duo-v1)
- [Repositorio de código en GitHub](https://github.com/inclusionAI/Duo)
- [Modelo base: inclusionAI/Duo-1.0-causal-base](https://huggingface.co/inclusionAI/Duo-1.0-causal-base)
