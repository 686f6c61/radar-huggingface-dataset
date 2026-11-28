# OwnZoneBD/Ministral-3-8B-Instruct-2512

## Resumen

Ministral 3 8B Instruct 2512 es un modelo de lenguaje de tipo "tiny" desarrollado por Mistral AI, publicado originalmente en el repositorio `mistralai/Ministral-3-8B-Instruct-2512` y redistribuido en este repositorio por el usuario `OwnZoneBD`. Pertenece a la familia Ministral 3, disenada especificamente para despliegue en el borde (edge) y en entornos con recursos limitados. El modelo combina un transformer de lenguaje de aproximadamente 8,4 mil millones de parametros con un codificador visual de 0,4 mil millones, sumando un total de 8.918.026.240 parametros segun los pesos en safetensors.

La relevancia de este modelo radica en su combinacion de capacidades multimodales (vision y texto), ventana de contexto de 256k tokens, soporte nativo de function calling y una licencia Apache 2.0 que permite uso comercial sin restricciones. Todo ello en un paquete que, en FP8, cabe en 12 GB de VRAM, lo que lo hace apto para GPU de consumo y sistemas embebidos.

Esta publicacion concreta es una version en FP8 del modelo instruct oficial, con pesos en safetensors y soporte para vLLM. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que se trata de una redistribucion reciente o de baja difusion, no del repositorio canonico de Mistral AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (8,4B LM + 0,4B vision encoder), familia Mistral 3 |
| Parametros totales | 8.918.026.240 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | FP8 (pesos publicados); cuantizaciones adicionales disponibles en la coleccion oficial de Mistral |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar (y "docenas" segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con dos componentes principales: un modelo de lenguaje de 8,4 mil millones de parametros y un codificador visual de 0,4 mil millones de parametros, integrados para permitir entrada multimodal (texto e imagenes). La model card no detalla la composicion exacta del dataset de entrenamiento ni el numero de tokens utilizados, por lo que estos datos deben considerarse no disponibles. El modelo base es `mistralai/Ministral-3-8B-Base-2512`, sobre el que se aplico un post-entrenamiento de tipo instruct (probablemente SFT y preferencias, aunque la model card no lo especifica explicitamente).

La innovacion principal de la familia Ministral 3 es su optimizacion para despliegue en el borde: el modelo en FP8 cabe en 12 GB de VRAM, y con cuantizaciones adicionales puede reducirse aun mas. La model card menciona soporte nativo de function calling y salida JSON, asi como una fuerte adherencia a system prompts, lo que indica un post-entrenamiento orientado a uso agentico. No se mencionan tecnicas como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento general en 11 idiomas declarados (en, fr, es, de, it, pt, nl, zh, ja, ko, ar).
- Vision: analisis de imagenes y descripcion de contenido visual, con recomendacion de mantener relaciones de aspecto cercanas a 1:1.
- Function calling nativo y salida en formato JSON, orientado a integracion con herramientas externas.
- Capacidades agenticas: soporte para flujos multi-paso y uso de herramientas definidas por el desarrollador.
- Alta adherencia a system prompts, con guia explicita para definir entorno y caso de uso.
- Ventana de contexto de 256k tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Capacidad de fine-tuning y especializacion sobre la base publicada.
- No se menciona modo "thinking" explicito ni capacidades de audio en la informacion disponible.

## Casos de uso

- Asistente local de uso diario: el modelo puede ejecutarse en una GPU de consumo con 12 GB de VRAM en FP8, gestionando conversaciones multi-turno con contexto de hasta 256k tokens, lo que permite mantener historiales largos sin perder coherencia.
- Descripcion y comprension de imagenes y documentos: gracias al codificador visual de 0,4B, puede analizar capturas, diagramas o documentos escaneados y generar descripciones o extraer informacion, con la recomendacion de usar imagenes con relacion de aspecto cercana a 1:1.
- Traduccion y generacion de contenido multilingue: con soporte para 11 idiomas declarados, es adecuado para pipelines de traduccion automatica o generacion de contenido localizado en entornos con recursos limitados.
- Agentes especializados con function calling: la salida JSON nativa y el soporte de herramientas permiten integrarlo en flujos agenticos donde el modelo decide que funcion invocar y con que parametros, limitando el numero de herramientas para evitar sobrecarga.
- Atencion al cliente automatizada en el borde: al caber en hardware modesto, puede desplegarse en instalaciones locales o dispositivos perifericos para gestionar conversaciones de soporte con contexto largo y sin depender de la nube.
- Fine-tuning para dominios verticales: al estar bajo licencia Apache 2.0 y publicarse los pesos, es posible especializarlo en sectores como legal, sanitario o industrial mediante ajuste fino supervisado.
- Procesamiento de documentos largos: la ventana de 256k tokens permite resumir o extraer informacion de contratos, informes o articulos extensos en una sola pasada.

## Benchmarks y rendimiento

La model card incluye resultados de benchmarks de razonamiento para la familia Ministral 3. Los datos disponibles corresponden a los modelos de 14B y 8B en su variante "Reasoning" (no estrictamente la variante Instruct), por lo que deben interpretarse como referencia de la familia y no como resultados directos de este checkpoint instruct.

| Modelo | AIME25 | AIME24 | GPQA Diamond | LiveCodeBench |
|---|---|---|---|---|
| Ministral 3 14B | 0,850 | 0,898 | 0,712 | 0,646 |
| Qwen3-14B (Thinking) | 0,737 | 0,837 | 0,663 | 0,593 |
| Ministral 3 8B | 0,787 | 0,860 | 0,668 | 0,616 |
| Qwen3-VL-8B-Thinking | 0,798 | 0,860 | 0,671 | 0,580 |

No se han publicado en la informacion disponible resultados especificos para la variante Instruct 8B en benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: aproximadamente 12 GB en FP8 segun la model card; con cuantizaciones adicionales (por ejemplo, 4 bits) puede reducirse por debajo de 8 GB, aunque no se especifican valores exactos.
- GPU recomendadas: el modelo esta disenado para "una amplia gama de hardware", incluyendo GPU de consumo. No se detallan modelos concretos como A100, H100 o RTX 4090 en la informacion disponible.
- Cabe en GPU de consumo: si, en FP8 con 12 GB de VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080) y en configuraciones de menor VRAM con cuantizacion adicional.
- Opciones de despliegue: vLLM (libreria declarada en el repositorio), asi como otras herramientas compatibles con safetensors y el formato Mistral. La model card no detalla soporte explicito para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral 3 8B Instruct 2512 | 8,9B (8,4B LM + 0,4B vision) | 256k | Si | Apache 2.0 | Hugging Face |
| Qwen3-VL-8B-Thinking | ~8B | No disponible | Si | No disponible | Hugging Face |
| Qwen3-14B (Thinking) | ~14B | No disponible | No disponible | No disponible | Hugging Face |
| Ministral 3 14B Instruct 2512 | ~14B | 256k | Si | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos mencionados en la model card. No se dispone de datos de contexto, licencia o disponibilidad para los modelos Qwen en la informacion proporcionada. En terminos de rendimiento en razonamiento, el Ministral 3 8B se situa cerca del Qwen3-VL-8B-Thinking en AIME25 y AIME24, y ligeramente por encima en LiveCodeBench, aunque se trata de variantes "Reasoning" y no directamente comparables con este checkpoint instruct.

## Limitaciones y advertencias

- Sesgos conocidos: no se detallan en la model card; como todo modelo entrenado con datos web, es probable que herede sesgos de genero, raza, idioma y cultura, aunque no se cuantifican.
- Riesgo de alucinacion: no se menciona explicitamente, pero es inherente a los modelos de lenguaje de esta escala; se recomienda validacion en produccion.
- Limitaciones de contexto o idioma: aunque declara 11 idiomas, el rendimiento puede variar significativamente entre ellos; la model card no proporciona evaluaciones por idioma.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion sin restricciones adicionales, pero se debe conservar el aviso de licencia y atribucion.
- Caveats para produccion: la model card recomienda temperatura inferior a 0,1 para entornos de produccion, limitar el numero de herramientas en sistemas agenticos y usar imagenes con relacion de aspecto cercana a 1:1 para vision. Ademas, este repositorio concreto es una redistribucion de terceros (OwnZoneBD) con 0 descargas, por lo que se recomienda verificar la integridad de los pesos frente al repositorio oficial de Mistral AI antes de usarlo en produccion.
- El modelo esta en FP8, lo que puede implicar una ligera perdida de precision frente a la version BF16 del modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OwnZoneBD/Ministral-3-8B-Instruct-2512
- Repositorio oficial de Mistral AI: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Blog de Mistral 3: https://mistral.ai/news/mistral-3
- Paper: https://arxiv.org/abs/2601.08584
- Coleccion de checkpoints adicionales: https://huggingface.co/collections/mistralai/ministral-3-additional-checkpoints
- Politica de privacidad de Mistral: https://mistral.ai/terms/
