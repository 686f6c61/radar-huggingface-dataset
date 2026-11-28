# aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus-NVFP4

## Resumen

Qwen-SEA-LION-v5-397B-A17B-Plus-NVFP4 es la variante cuantizada en NVFP4 del modelo Qwen-SEA-LION-v5-397B-A17B-Plus, desarrollado por el AI Products Pillar de AI Singapore y financiado por el National Research Foundation de Singapur. Forma parte de la familia SEA-LION (Southeast Asian Languages In One Network), una coleccion de modelos de lenguaje orientada especificamente al sudeste asiatico. Este checkpoint reduce el peso de los pesos de 1.138,9 GB en BF16 a 583,3 GB, manteniendo una perdida de precision minima o nula segun el autor.

El modelo es un transformer causal con codificador de vision (pipeline image-text-to-text), con una ventana de contexto de 262.144 tokens y un total de 205.691.553.008 parametros almacenados en safetensors. La nomenclatura "397B-A17B" del nombre sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 397.000 millones de parametros totales y 17.000 millones activos por token, aunque la model card no detalla explicitamente la configuracion MoE; el uso de `--enable-expert-parallel` en vLLM y la mencion de "expert weights" confirman esa arquitectura.

Su relevancia actual radica en dos factores: por un lado, ofrece cobertura nativa de nueve idiomas del sudeste asiatico (birmano, chino, ingles, indonesio, filipino, malayo, tamil, tailandes y vietnamita), un nicho poco atendido por los modelos generalistas; por otro, la cuantizacion NVFP4 esta disenada para GPUs NVIDIA Blackwell y permite desplegar el modelo en cuatro H200, abaratando sustancialmente la inferencia frente a la version BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de vision; mezcla de expertos (MoE) segun nomenclatura y referencias a "expert weights" |
| Parametros totales | 205.691.553.008 (safetensors); el nombre comercial indica 397B-A17B |
| Parametros activos | 17B (segun nomenclatura A17B; no confirmado en la model card) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (pesos de expertos); resto de pesos y tablas n-gram en BF16; existen versiones FP8 y GGUF |
| Idiomas soportados | Birmano, chino, ingles, indonesio, filipino, malayo, tamil, tailandes, vietnamita |
| Licencia | MIT |
| Formato de pesos | Safetensors (repo de 583,4 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer causal con codificador de vision, construido sobre la arquitectura Qwen (tag `qwen4_exp`). La nomenclatura 397B-A17B y las referencias a "expert weights" en la model card apuntan a una arquitectura de mezcla de expertos con aproximadamente 397.000 millones de parametros totales y 17.000 millones activos por token. Una particularidad destacable es la inclusion de tablas n-gram de aproximadamente 164.000 millones de parametros (328 GB en BF16), que vLLM y SGLang mantienen en memoria de host y consultan por filas en cada paso; SGLang las descarga por defecto con `--ple-offload-embedding`. Esto sugiere un mecanismo de embedding basado en n-gramas (PLE) que complementa la atencion clasica.

La cuantizacion se realizo con NVIDIA Model Optimizer, que convierte unicamente los pesos de los expertos a NVFP4 mientras mantiene el resto de pesos, incluidas las tablas n-gram, en BF16. El tokenizador, la plantilla de chat y los valores por defecto de muestreo no se han modificado respecto al modelo base. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponderia al modelo base y no se incluye en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno en nueve idiomas del sudeste asiatico, con especial enfasis en indonesio, malayo, tailandes, vietnamita y filipino.
- Procesamiento de imagenes y texto combinados (pipeline image-text-to-text) gracias al codificador de vision.
- Modo de razonamiento explicito ("thinking"), activado por defecto y controlable mediante `enable_thinking` en `chat_template_kwargs`; el contenido de razonamiento se expone en `reasoning` (vLLM) o `reasoning_content` (SGLang).
- Tool calling / function calling nativo, con parser `qwen3_coder` y soporte de `--enable-auto-tool-choice` en vLLM.
- Razonamiento multi-paso y uso en flujos de agentes, apoyado por la ventana de 262.144 tokens.
- Capacidades multilingues cruzadas entre ingles, chino y las lenguas del sudeste asiatico.
- Generacion de codigo y matematicas (implicito en la familia Qwen; no detallado en la model card).

## Casos de uso

- Atencion al cliente en mercados del sudeste asiatico: el modelo puede gestionar conversaciones multi-turno en indonesio, malayo, tailandes o vietnamita con una ventana de 262.144 tokens, suficiente para incorporar historial de cliente, politicas y base de conocimiento en un unico contexto.
- Logistica y comercio transfronterizo: el ejemplo de la model card (exportacion de durian congelado de Medan a Singapur) ilustra el uso para consultas documentales y de cadena de frio en indonesio; el modelo responde con estructura en puntos y razonamiento previo.
- Asistencia documental con imagenes: al ser image-text-to-text, puede procesar capturas de formularios, facturas o etiquetas y responder preguntas sobre ellas, util en digitalizacion de tramites en administraciones locales.
- Agentes automatizados con tool calling: integrable en pipelines que requieran invocar APIs (clima, inventario, reservas) mediante el parser `qwen3_coder`, con seleccion automatica de herramientas.
- Analisis de contenido multimodal en medios regionales: descripcion y resumen de imagenes con texto en birmano, tamil o filipino, idiomas con poca cobertura en modelos generalistas.
- Despliegue en infraestructura Blackwell: al ocupar 583,3 GB en NVFP4 y ejecutarse en cuatro H200, es adecuado para servicios de inferencia de alta concurrencia con presupuesto de VRAM ajustado frente a la version BF16.
- Traduccion y localizacion entre ingles, chino y lenguas del sudeste asiatico, aprovechando el contexto largo para mantener coherencia terminologica en documentos extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la cuantizacion NVFP4 introduce "poca o ninguna perdida de precision" respecto al modelo BF16, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada: los pesos NVFP4 ocupan 583,3 GB; a ello se suman las tablas n-gram (328 GB en BF16), que pueden mantenerse en memoria de host en lugar de VRAM.
- GPUs recomendadas: NVIDIA Blackwell (formato NVFP4 nativo); el autor confirma ejecucion en cuatro H200 con tensor-parallel de 4.
- No cabe en GPUs de consumo (RTX 4090, 5090) por el tamano agregado del modelo y las tablas n-gram.
- Opciones de despliegue: vLLM (`--tensor-parallel-size 4 --enable-expert-parallel`) y SGLang (`--tp 4 --ple-offload-embedding`, activado por defecto). Para llama.cpp existe la variante GGUF del modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas SEA | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen-SEA-LION-v5-397B-A17B-Plus-NVFP4 | 205,7B (safetensors); 397B-A17B nominal | 262.144 | 9 idiomas | MIT | NVFP4 + BF16 |
| Qwen-SEA-LION-v5-397B-A17B-Plus (BF16) | 397B-A17B nominal; 1.138,9 GB | 262.144 | 9 idiomas | MIT | BF16 |
| Qwen-SEA-LION-v5-397B-A17B-Plus-FP8 | no disponible | 262.144 | 9 idiomas | MIT | FP8 |
| Qwen-SEA-LION-v5-397B-A17B-Plus-GGUF | no disponible | 262.144 | 9 idiomas | MIT | GGUF (llama.cpp) |

Las tres variantes comparten arquitectura, tokenizador y capacidades; solo cambian el formato y el tamano de pesos. No se dispone de datos de benchmarks para comparar el rendimiento frente a modelos de otros autores.

## Limitaciones y advertencias

- La cuantizacion NVFP4 esta optimizada para NVIDIA Blackwell; en GPUs no Blackwell puede no haber soporte nativo y requerir fallback, con impacto en rendimiento.
- El modelo depende de mantener las tablas n-gram (328 GB en BF16) en memoria de host; esto eleva los requisitos de RAM del servidor y complica el despliegue en entornos con memoria limitada.
- No se han publicado evaluaciones de sesgo, alucinacion o robustez en la informacion disponible; se desconoce el comportamiento en dominios especializados.
- La cobertura linguistica se limita a los nueve idiomas declarados; el rendimiento fuera de ellos (por ejemplo, espanol) no esta garantizado.
- Aunque la licencia es MIT y permite uso comercial, el modelo base incorpora componentes de la familia Qwen cuya trazabilidad conviene verificar antes de un despliegue en produccion.
- El modo thinking esta activado por defecto, lo que incrementa el consumo de tokens de salida; debe desactivarse explicitamente para aplicaciones de baja latencia.
- No hay datos publicos de benchmarks que permitan validar la afirmacion de "poca o ninguna perdida de precision" frente al modelo BF16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus-NVFP4
- Modelo base BF16: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus
- Version FP8: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus-FP8
- Version GGUF: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus-GGUF
- Coleccion SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5
- Sitio oficial de SEA-LION: https://sea-lion.ai
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Licencia MIT: https://mit-license.org/
