# gauravpoudel999/gemma4-nepali-heritage

## Resumen

El modelo `gauravpoudel999/gemma4-nepali-heritage` es un adaptador LoRA fine-tuneado sobre el modelo base `google/gemma-4-E4B-it`, desarrollado por gauravpoudel999. Su propósito es responder preguntas visuales (VQA) sobre sitios de patrimonio cultural nepalí, cubriendo aspectos como ubicación, identificación, religión, arquitectura, historia, descripción, significado cultural y objetos. El fine-tuning se realizó con 9.449 ejemplos de Q&A multimodal, durante una época, con una pérdida final de 0,4807 y un tiempo de entrenamiento de aproximadamente 29 minutos en una GPU A100-80GB.

La relevancia de este modelo radica en su especialización en un dominio cultural concreto, lo que permite a desarrolladores e investigadores desplegar asistentes de patrimonio o herramientas educativas con conocimiento específico de Nepal. Al estar basado en Gemma 4, hereda las capacidades multimodales del modelo base, aunque el adaptador solo ocupa 0,2 GB, lo que facilita su distribución y uso. La licencia no está especificada en la información disponible, por lo que se debe consultar al autor antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: google/gemma-4-E4B-it, multimodal) |
| Parametros totales | no disponible (el adaptador LoRA es de 0,2 GB; el modelo base no se especifica) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors) |
| Idiomas soportados | ingles, nepalí, nepalí romanizado |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r=16, alpha=32) aplicado sobre el modelo base `google/gemma-4-E4B-it`, que es un modelo multimodal de Google DeepMind con pesos abiertos. El fine-tuning se realizó con un dataset propio de 9.449 pares de preguntas y respuestas visuales sobre patrimonio nepalí, cubriendo ocho tipos de preguntas: ubicación, identificación, religión, arquitectura, historia, descripción, significado cultural y objetos. El entrenamiento se ejecutó durante una época con una pérdida final de 0,4807, en una GPU A100-80GB, con un tiempo total de aproximadamente 29 minutos. No se menciona el uso de técnicas adicionales como RLHF o DPO; el método es exclusivamente supervisado con LoRA.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre sitios de patrimonio nepalí, incluyendo templos, estatuas, monumentos y objetos culturales.
- Soporte multilingüe en inglés, nepalí (devanagari) y nepalí romanizado.
- Cobertura de ocho categorías de preguntas: ubicación, identificación, religión, arquitectura, historia, descripción, significado cultural y objetos.
- Capacidad de razonamiento multimodal al combinar imagen y texto, heredada del modelo base Gemma 4.
- No se especifica soporte para tool calling, agentes o razonamiento multi-paso; estas capacidades dependen del modelo base, que no está documentado en la información disponible.

## Casos de uso

- Aplicaciones educativas de patrimonio cultural: el modelo puede responder preguntas de estudiantes o turistas sobre monumentos nepalíes a partir de una foto, proporcionando contexto histórico y arquitectónico en inglés o nepalí.
- Asistentes de museos y sitios arqueológicos: integrado en una aplicación móvil o kiosco interactivo, permite a los visitantes fotografiar una pieza y recibir una descripción detallada de su significado cultural y religioso.
- Documentación y catalogación de patrimonio: usado por investigadores para etiquetar automáticamente imágenes de archivo con información sobre ubicación, tipo de objeto y periodo histórico, acelerando la creación de bases de datos culturales.
- Herramientas de preservación digital: el modelo puede ayudar a transcribir o enriquecer registros visuales de patrimonio en riesgo, generando descripciones en nepalí e inglés para su archivo.
- Chatbots turísticos especializados: desplegado como backend de un chatbot que recibe imágenes de lugares nepalíes y responde con recomendaciones o datos históricos, mejorando la experiencia del viajero.
- Validación de contenido cultural en plataformas de contenido generado por usuarios: el modelo puede verificar si una imagen corresponde realmente a un sitio nepalí y proporcionar metadatos correctos, reduciendo errores en plataformas colaborativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida de entrenamiento (0,4807) y el tiempo de entrenamiento, pero no incluye métricas de evaluación como exactitud, F1 o comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB, pero para inferencia se necesita cargar el modelo base `google/gemma-4-E4B-it` completo, cuyos requisitos de VRAM no están especificados en la información disponible.
- El entrenamiento se realizó en una GPU A100-80GB, lo que sugiere que el modelo base requiere al menos esa capacidad para fine-tuning; para inferencia podría ser menor, pero no se dispone de datos.
- No se indica si el modelo cabe en GPUs de consumo como RTX 4090 o similares; depende del tamaño del modelo base, que no se ha documentado.
- Opciones de despliegue: al ser un adaptador LoRA en formato safetensors, se puede cargar con bibliotecas como Hugging Face Transformers o PEFT, y servir con vLLM o TGI si el modelo base lo soporta. No se menciona compatibilidad con llama.cpp u Ollama.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables específicos para VQA de patrimonio nepalí en la información proporcionada. El modelo base Gemma 4 podría compararse con otros modelos multimodales abiertos como LLaVA o Qwen-VL, pero no se dispone de datos de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Especialización limitada: el modelo solo ha sido entrenado con 9.449 ejemplos de patrimonio nepalí; su rendimiento fuera de este dominio será pobre o nulo.
- Riesgo de alucinación: al ser un fine-tuning sobre un modelo base, puede generar respuestas incorrectas o inventadas sobre sitios no cubiertos en el dataset de entrenamiento.
- Sesgos culturales: el dataset se centra en patrimonio nepalí, por lo que el modelo puede tener sesgos hacia ciertas regiones, religiones o periodos históricos dentro de Nepal.
- Licencia no especificada: no se indica la licencia del adaptador ni del modelo base; esto impide garantizar su uso comercial sin autorización explícita del autor.
- Dependencia del modelo base: el adaptador requiere el modelo `google/gemma-4-E4B-it`, cuyas especificaciones técnicas y requisitos de hardware no están documentados en la información disponible.
- Sin garantías de producción: no se han publicado evaluaciones de robustez, latencia o throughput, por lo que su uso en entornos de producción requiere pruebas adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gauravpoudel999/gemma4-nepali-heritage
- Repositorio GitHub del dataset y proyecto: https://github.com/gaurav-poudel/nepal-heritage-vlm
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Documentación de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
