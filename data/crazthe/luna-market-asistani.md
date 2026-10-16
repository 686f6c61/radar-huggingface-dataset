# crazthe/luna-market-asistani

## Resumen

Luna Market Asistani es un ajuste fino (fine-tune) del modelo Qwen/Qwen2.5-3B-Instruct, publicado por el usuario crazthe en HuggingFace. Se trata de un asistente conversacional de atención al cliente para una tienda de comercio electrónico ficticia llamada Luna Market, entrenado con SFT mediante la librería TRL para responder consultas sobre pedidos, envíos, productos y devoluciones. El modelo está orientado al turco, idioma en el que se ha realizado el entrenamiento y para el que se justifica la elección del modelo base.

Técnicamente es un modelo denso de aproximadamente 3.000 millones de parámetros, con pesos en formato safetensors y un repositorio de solo 0,1 GB. El autor indica que el entrenamiento se hizo con QLoRA sobre una GPU T4 de Google Colab y que en inferencia se combina con recuperación aumentada (RAG) sobre un manual interno ficticio y una herramienta personalizada denominada kargo_ucreti (cálculo de gastos de envío).

Su relevancia es limitada y muy específica: es un ejemplo académico o de portafolio de cómo adaptar un modelo pequeño a un dominio cerrado con RAG y tool calling, no un modelo de propósito general. No declara licencia, idiomas ni resultados de benchmarks, y acumula cero descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen2.5-3B-Instruct: atención con GQA y RoPE, FFN SwiGLU, RMSNorm) |
| Parametros totales | 3,09 B (corresponden al modelo base; el autor no publica conteo propio) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base, extensible a 131.072 con YaRN; no confirmado para este fine-tune |
| Tipos de cuantizacion | no disponible. El repositorio solo distribuye safetensors; no hay versiones GGUF, AWQ ni GPTQ publicadas por el autor |
| Idiomas soportados | no disponible en la ficha de HuggingFace. El fine-tune está orientado al turco; el modelo base declara soporte de unos 29 idiomas |
| Licencia | no disponible (la model card indica "licence: license" sin concretar; el modelo base Qwen2.5-3B-Instruct es Apache-2.0) |
| Formato de pesos | safetensors (repositorio de 0,1 GB, etiqueta library: transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only denso con atención de consultas agrupadas (GQA), embeddings posicionales rotatorios (RoPE) y normalización RMSNorm, que en su versión original fue entrenado por Alibaba con datos multilingües y posteriormente alineado con instrucciones. El autor no modifica la arquitectura: aplica un ajuste fino supervisado (SFT) sobre el modelo ya instruido.

El entrenamiento se realizó con TRL 1.16.0, Transformers 5.18.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.2, según las versiones de framework declaradas. La model card menciona QLoRA sobre una GPU T4 de Colab, lo que implica cuantización de 4 bits durante el entrenamiento. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases posteriores de DPO o RLHF. La innovación declarada no es arquitectónica sino de comportamiento: el modelo aprende la identidad del asistente y a apoyarse en un manual de referencia y en una herramienta de cálculo de gastos de envío, evitando responder fuera de ese contexto.

## Capacidades

- Generación de texto conversacional en turco para atención al cliente de comercio electrónico (pedidos, envíos, productos, devoluciones).
- Adopción de una identidad de asistente definida (nombre Luna) que el modelo base no mostraba antes del ajuste.
- Tool calling: dispone de una herramienta personalizada, kargo_ucreti, para el cálculo de gastos de envío.
- Integración con RAG: el autor afirma que, con recuperación sobre el manual interno, el modelo responde de forma fiel al contexto y no inventa detalles ausentes.
- Restricción deliberada de dominio: el modelo está diseñado para no responder a preguntas de cultura general fuera del manual de Luna Market.
- Multilingüismo: no declarado en la ficha de HuggingFace. El modelo base soporta decenas de idiomas, pero el ajuste se ha hecho únicamente en turco y no hay evidencia publicada de que conserve ese rendimiento multilingüe.
- No se declaran capacidades de visión, audio, matemáticas avanzadas ni razonamiento multi-paso más allá del diálogo con herramientas.

## Casos de uso

- Atención al cliente automatizada en turco: el modelo gestiona conversaciones multi-turno sobre pedidos, envíos y devoluciones apoyándose en RAG sobre el manual de la tienda, lo que reduce respuestas inventadas si la recuperación es correcta.
- Cálculo de costes de envío: mediante la herramienta kargo_ucreti, puede resolver consultas del tipo "cuánto cuesta enviar este pedido" sin que el precio tenga que estar embebido en el prompt.
- Gestión de devoluciones: puede guiar al usuario por el procedimiento de devolución definido en el manual interno, manteniendo el rol de asistente y el tono corporativo.
- Seguimiento de estado de pedidos: integrado con una API externa de logística, el modelo puede formular la consulta y traducir la respuesta técnica a lenguaje natural para el cliente.
- Prototipo educativo de RAG y tool calling: sirve como ejemplo reproducible de cómo adaptar un modelo de 3 B a un dominio cerrado con QLoRA en hardware de gama media.
- Base para experimentos de ajuste con TRL: al ser un fine-tune generado con SFT, es útil como punto de partida para estudiar olvido catastrófico, adherencia a contexto y comportamiento de rechazo fuera de dominio.
- Filtrado y enrutado de consultas: puede clasificar si una pregunta pertenece al dominio de la tienda o debe escalarse a un agente humano, gracias a su entrenamiento explícito para no salir del manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluación conversacional, y la búsqueda web realizada no ha devuelto documentación técnica asociada al modelo (los resultados obtenidos corresponden a IMDb y no guardan relación con este repositorio).

## Requisitos de hardware

- VRAM estimada para inferencia, partiendo de un modelo denso de 3,09 B: en BF16/FP16 en torno a 6-7 GB de pesos más caché KV; en cuantización de 8 bits alrededor de 3,5-4 GB; en 4 bits aproximadamente 2-2,5 GB.
- GPU de gama alta no necesarias: el modelo cabe holgadamente en una NVIDIA RTX 3060 de 12 GB, una RTX 4070/4080, una RTX 4090 o una L4/A10.
- Entrenamiento: el autor indica que el QLoRA se ejecutó en una GPU T4 de Google Colab (16 GB de VRAM), lo que confirma que el ajuste fino es viable en hardware de gama media.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 6 GB o más si se cuantiza a 4 bits; con 8 GB se puede usar en 8 bits y con 12 GB o más en BF16.
- Opciones de despliegue: transformers (es la librería declarada), vLLM y TGI para servidores de alto rendimiento, y llama.cpp u Ollama tras convertir los pesos a GGUF, conversión que el autor no publica.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas de tokens por segundo ni de latencia por petición.
- Aviso práctico: el repositorio ocupa 0,1 GB, muy por debajo de los ~6 GB esperados para pesos completos de 3 B en BF16. Esto sugiere que podría contener adaptadores LoRA o pesos parciales; conviene verificar el contenido antes de planificar un despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Luna Market Asistani | 3,09 B (modelo base) | 32.768 (según base) | no disponible | HuggingFace, 0 descargas | sin benchmarks publicados |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768, ampliable a 131.072 con YaRN | Apache-2.0 | HuggingFace, ampliamente utilizado | benchmarks publicados por el autor del modelo base |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 | Llama 3.2 Community License | HuggingFace | benchmarks publicados por Meta |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 | MIT | HuggingFace | benchmarks publicados por Microsoft |

Los datos de los tres modelos alternativos proceden de la documentación oficial de sus respectivos desarrolladores. La comparación de rendimiento con Luna Market Asistani no es posible porque este fine-tune no publica ninguna evaluación, y su ámbito de aplicación (atención al cliente en turco) no es directamente comparable con el de los modelos generalistas.

## Limitaciones y advertencias

- Dominio cerrado: el autor declara explícitamente que el asistente solo responde dentro del manual de Luna Market y sus herramientas; no es un modelo de propósito general.
- Idiomas: no hay idiomas declarados en la ficha. El ajuste se hizo en turco y el rendimiento en castellano u otros idiomas no está documentado.
- Licencia: no disponible. La model card indica "licence: license" sin especificar términos, lo que impide determinar si se permite uso comercial. Aunque el modelo base es Apache-2.0, el autor no aclara la licencia del derivado.
- Riesgo de alucinación: aunque el autor afirma que el uso de RAG reduce las invenciones, cualquier fallo en la recuperación de contexto puede producir respuestas incorrectas sobre precios, plazos o políticas.
- Dependencia de infraestructura externa: el comportamiento correcto depende del manual interno y de la herramienta kargo_ucreti; sin ellos, el modelo carece de la información necesaria.
- Posible olvido catastrófico: al entrenarse para no salir de su dominio, es probable que haya perdido parte del conocimiento general y de las capacidades multilingües del Qwen2.5-3B-Instruct original.
- Tamaño del repositorio anómalo (0,1 GB): puede no contener los pesos completos en BF16, por lo que conviene inspeccionar los ficheros safetensors antes de usarlo.
- Ejemplo de código defectuoso: el fragmento de inicio rápido de la model card usa `model="None"`, un marcador de posición no sustituido, por lo que no funciona tal cual.
- Ausencia de tracción y validación: 0 descargas y 0 valoraciones, sin evaluación independiente ni benchmarks que respalden las afirmaciones de la model card.
- Sesgos: no disponibles. No hay análisis de sesgos ni de comportamiento ante entradas adversas o fuera de distribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/crazthe/luna-market-asistani
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de TRL (librería de entrenamiento utilizada): https://github.com/huggingface/trl
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; las referencias devueltas corresponden a IMDb y no guardan relación con este repositorio.
