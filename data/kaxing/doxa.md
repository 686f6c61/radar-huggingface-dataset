# kaxing/doxa

## Resumen
Doxa es un modelo de lenguaje conversacional publicado en Hugging Face por el usuario kaxing. El repositorio contiene pesos en formato GGUF, lo que indica que está pensado para inferencia local mediante herramientas compatibles con este formato (llama.cpp, Ollama, LM Studio y similares). El dato de parametros reales en safetensors es de 4.205.751.296, es decir, aproximadamente 4,2 mil millones de parametros, un tamano que encaja en el segmento de modelos pequenos y medianos aptos para hardware de consumo.

La informacion publica disponible es muy limitada: no se declara licencia, no se especifican idiomas soportados, no hay pipeline definido ni resultados de benchmarks. El repositorio ocupa 16,2 GB, un tamano coherente con la presencia de varias cuantizaciones GGUF de un modelo de ~4B, y cuenta con 77 descargas y 0 likes en el momento de la consulta, lo que sugiere un proyecto de nicho o experimental.

Por su tamano y formato, Doxa se posiciona como candidato para prototipado de asistentes conversacionales en local, pero la ausencia de documentacion tecnica, licencia explicita y evaluaciones publicadas obliga a tratarlo con cautela antes de cualquier uso en produccion. Esta ficha refleja unicamente lo verificable en la informacion proporcionada y marca como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de 16,2 GB); existen safetensors con 4.205.751.296 parametros |

## Arquitectura y entrenamiento
No se ha publicado informacion sobre la arquitectura interna del modelo (transformer denso, MoE, hibrida u otra). El unico dato estructural verificable es el numero de parametros, 4.205.751.296, registrado a partir de los tensores en safetensors. No hay detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni vocabulario.

Tampoco se dispone de informacion sobre el corpus de entrenamiento (numero de tokens, composicion del dataset, proporciones de codigo, multilingue o datos sinteticos), ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o instruccion supervisada. No se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. Todo ello debe considerarse no disponible a efectos de evaluacion.

## Capacidades
- Generacion de texto conversacional: el tag "conversational" en el repositorio indica que el modelo esta orientado a dialogos multi-turno, aunque no se detalla el formato de prompt ni la plantilla de chat.
- Inferencia local en formato GGUF: compatible con el ecosistema de llama.cpp y derivados, lo que permite ejecucion en CPU y GPU sin infraestructura dedicada.
- Integracion con endpoints compatibles: el tag "endpoints_compatible" sugiere que puede servirse a traves de APIs compatibles con el formato de endpoints de Hugging Face.
- Capacidades de razonamiento, codigo y matematicas: no disponibles; no se han publicado evaluaciones ni descripciones que las confirmen.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declaran idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso
- Prototipado de asistentes conversacionales en local: gracias a sus ~4,2B de parametros y su empaquetado GGUF, el modelo puede ejecutarse en un portatil con GPU de consumo para validar flujos de chat antes de invertir en modelos mayores. Es adecuado por su bajo coste de despliegue, aunque la falta de documentacion exige pruebas manuales previas.
- Experimentacion educativa con modelos pequenos: investigadores y estudiantes pueden cargar el GGUF en llama.cpp u Ollama para estudiar comportamiento conversacional de un modelo de ~4B sin depender de servicios en la nube.
- Evaluacion comparativa interna: al ser un modelo pequeno y de licencia no declarada, puede usarse como referencia en pruebas internas de calidad de respuesta frente a otros modelos de tamano similar, siempre que se resuelva antes la cuestion de licencia.
- Despliegue en entornos con recursos limitados: el formato GGUF permite cuantizaciones agresivas que reducen el uso de memoria, lo que facilita su uso en dispositivos con poca VRAM o incluso solo CPU, aunque las cuantizaciones concretas no estan documentadas.
- Generacion de respuestas en aplicaciones de chat de bajo volumen: para demos, bots internos o asistentes personales con trafico reducido, el modelo puede servir respuestas conversacionales sin coste de API, asumiendo la necesidad de validar calidad y sesgos por cuenta del integrador.
- Base para fine-tuning experimental: al disponer de pesos safetensors con 4,2B de parametros, tecnicamente es posible adaptarlo con LoRA o tecnicas similares, aunque la ausencia de licencia clara limita su uso comercial y la falta de documentacion complica la eleccion de hiperparametros.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con ~4,2B de parametros, una cuantizacion Q4_K_M requeriria del orden de 2,5-3 GB de VRAM; Q8_0 en torno a 4,5-5 GB; y FP16 aproximadamente 8,5-9 GB. Estas cifras son estimaciones basadas en el numero de parametros, no datos publicados por el autor.
- GPU recomendadas: para FP16, una RTX 3060 de 12 GB o superior seria suficiente; para cuantizaciones Q4, una RTX 3050 de 8 GB o incluso GPUs integradas con memoria compartida pueden bastar.
- Compatibilidad con GPU de consumo: si, el tamano del modelo permite ejecutarlo en tarjetas consumer como RTX 3060, RTX 4060, RTX 4070 o superiores, asi como en Apple Silicon con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" apunta a servidores de inferencia con API compatible con Hugging Face.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Doxa (kaxing) | ~4,2B | no disponible | no disponible | GGUF, safetensors | Sin benchmarks ni documentacion publicados |
| Qwen2.5-3B / 7B | 3B / 7B | 32K (7B) | Apache 2.0 | safetensors, GGUF | Familia ampliamente documentada y con benchmarks publicos |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 Community License | safetensors, GGUF | Buen equilibrio tamano/contexto, con restricciones de licencia |
| Phi-3.5-mini | 3,8B | 128K | MIT | safetensors, GGUF | Modelo pequeno con contexto largo y licencia permisiva |

La comparativa se ofrece a titulo orientativo: los datos de Doxa son incompletos, por lo que no es posible establecer una comparacion de rendimiento rigurosa con estas alternativas.

## Limitaciones y advertencias
- Licencia no declarada: sin una licencia explicita, no se puede asumir permiso para uso comercial, redistribucion o modificacion; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Ausencia de documentacion tecnica: no se publican arquitectura, contexto, idiomas ni plantilla de chat, lo que dificulta la integracion correcta y la reproducibilidad.
- Riesgo de alucinacion: sin datos de alineacion ni evaluaciones, no hay garantias sobre la fiabilidad factual de las respuestas.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Idiomas no confirmados: no se declara soporte multilingue; el rendimiento fuera del idioma de entrenamiento (desconocido) es incierto.
- Contexto desconocido: se desconoce la ventana de contexto, lo que impide planificar casos de uso con documentos largos o conversaciones extensas.
- Madurez del proyecto: con 77 descargas y 0 likes, es un repositorio de nicho sin comunidad ni soporte; conviene tratarlo como experimental.
- Verificacion de pesos: al no haber informacion sobre el proceso de publicacion, se recomienda auditar los ficheros GGUF antes de cargarlos en entornos sensibles.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/kaxing/doxa
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
