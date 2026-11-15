# Maximilian228/Geode-Ternary-Bonsai-2-9B

## Resumen

Geode · Ternary Bonsai 2 9B es un paquete de pesos empaquetado para Geode, una aplicación Android que ejecuta modelos de lenguaje completamente en el dispositivo, sin nube ni cuenta de usuario. El modelo subyacente es Ternary Bonsai 2 9B de PrismML, una variante de Qwen3.5-9B con pesos ternarios (cada peso vale -1, 0 o +1 multiplicado por una escala por grupo de 64), lo que comprime un modelo denso de 9B parámetros en 2,8 GB. Conserva la arquitectura híbrida Gated DeltaNet más atención del Qwen original, el mismo vocabulario, capacidad de comprensión de imágenes y una capa MTP (multi-token prediction) de PrismML para el borrador del siguiente token.

El paquete no re-cuantiza nada: Geode lee directamente los códigos ternarios y las escalas de PrismML, con las entradas rotadas por Hadamard tal como las distribuye el autor. Frente a llama.cpp ejecutando el GGUF de PrismML en CPU, las métricas de divergencia sobre texto retenido son mínimas (KL 0,00004 en código y 0,00010 en inglés, con coincidencia del token superior del 100 % y 98,4 % respectivamente).

Es relevante porque demuestra inferencia de un modelo de 9B con visión en hardware móvil de gama alta, con el prompt procesado en la NPU Hexagon y la generación en CPU, alcanzando 150-160 tokens/s de prompt y 12-15 tokens/s de respuesta en un Snapdragon 8 Elite. El formato es propietario de Geode (`geode.json` describe los archivos) y no es compatible con GGUF ni con otros runtimes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrida Gated DeltaNet + atencion (base Qwen3.5-9B), pesos ternarios (-1, 0, +1 con escala por grupo de 64) |
| Parametros totales | 9B (denso) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria nativa (codigos de 2 bits con escala fp16 por grupo de 64); capa MTP en 8 bits; encoder de vision en 8 bits; embeddings leidos desde flash |
| Idiomas soportados | no disponible explicitamente; el modelo base Qwen3.5-9B es multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato propio de Geode (`geode.json` + archivos del pack); no es GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer denso de 9B parametros con diseno hibrido que combina capas Gated DeltaNet (atención lineal con estado recurrente) y capas de atención clasica, manteniendo el vocabulario original de Qwen. PrismML lo convierte a pesos ternarios: cada peso se representa como uno de tres valores (-1, 0, +1) multiplicado por una escala fp16 compartida por grupos de 64, lo que reduce el modelo a 2,8 GB. Las entradas se rotan con transformada de Hadamard para estabilizar la cuantizacion ternaria.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el proceso de PrismML. La innovacion tecnica destacable es la capa MTP de PrismML, que genera borradores del siguiente token verificados por el modelo principal (decodificacion especulativa), y el diseno de Geode que reparte la carga entre NPU (procesamiento del prompt) y CPU (generacion de la respuesta). El paquete anade un `draft_vocab.bin` propio para los borradores de la capa MTP.

## Capacidades

- Generacion de texto y comprension de imagenes (pipeline image-text-to-text).
- Razonamiento y conversacion multi-turno, heredados del modelo base Qwen3.5-9B.
- Generacion de codigo y texto en ingles con alta fidelidad respecto al GGUF original (KL 0,00004 en codigo, 0,00010 en ingles).
- Decodificacion especulativa mediante la capa MTP de PrismML, con verificacion de cada borrador.
- Inferencia totalmente local en Android, sin nube ni cuenta.
- Capacidades multilingues: no documentadas en la informacion disponible, aunque el base Qwen3.5-9B es multilingue.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking o agentes multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente personal offline en Android: el modelo corre integramente en el telefono con unos 4,4 GB de memoria en uso, sin enviar datos a servidores, adecuado para usuarios preocupados por la privacidad.
- Descripcion y analisis de imagenes en el dispositivo: el encoder de vision en 8 bits permite consultar fotos o capturas sin subirlas a la nube.
- Traduccion y redaccion local: la ventana de contexto y el vocabulario de Qwen permiten conversaciones multi-turno; la velocidad de 12-15 tokens/s hace viable la escritura asistida en tiempo real.
- Autocompletado de codigo en movilidad: la fidelidad medida frente al GGUF en texto de codigo (KL 0,00004) respalda su uso para sugerencias de codigo en editores moviles.
- Demostraciones y pruebas de concepto de IA en el dispositivo: util para investigadores que quieran evaluar modelos ternarios de 9B en hardware movil sin infraestructura de servidor.
- Aplicaciones de campo sin conectividad: escenarios sin red (zonas rurales, aviones, entornos industriales) donde se necesita un asistente de texto y vision sin dependencia de la nube.
- Evaluacion de decodificacion especulativa en movil: la capa MTP permite medir el impacto del drafting en throughput (14,4-15 frente a 12-14,5 tokens/s) en un Snapdragon 8 Elite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de rendimiento publicados son medidas de fidelidad y velocidad en dispositivo:

| Metrica | Valor |
|---|---|
| Divergencia KL vs llama.cpp (codigo, texto retenido) | 0,00004 |
| Divergencia KL vs llama.cpp (ingles, texto retenido) | 0,00010 |
| Coincidencia del token superior (codigo) | 100 % |
| Coincidencia del token superior (ingles) | 98,4 % |
| Prompt en NPU (Snapdragon 8 Elite), sin MTP | 150-160 tokens/s |
| Respuesta en CPU, sin MTP | 12-14,5 tokens/s |
| Prompt en NPU con borradores MTP | 144-149 tokens/s |
| Respuesta con borradores MTP verificados | 14,4-15 tokens/s |
| Memoria en ejecucion | ~4,4 GB (copia de pesos en NPU incluida) |

Las medidas se tomaron en un RedMagic con Snapdragon 8 Elite, prompt de 293 tokens y respuesta de 160 tokens en modo greedy; el rango refleja la temperatura del telefono.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Geode Ternary Bonsai 2 9B | 9B denso, ternario | no disponible | Propio de Geode | Apache-2.0 | Solo app Geode en Android 11+ (ARMv8.2) |
| Ternary Bonsai 2 9B (PrismML) | 9B denso, ternario | no disponible | GGUF | Apache-2.0 | llama.cpp y runtimes compatibles GGUF |
| Qwen3.5-9B (Qwen) | 9B denso | no disponible | safetensors | Apache-2.0 | vLLM, TGI, transformers, llama.cpp (via conversion) |

La diferencia clave frente al GGUF de PrismML es el formato y el runtime: el pack de Geode solo carga en la app Geode, mientras que el GGUF es portable. Frente a Qwen3.5-9B original, el pack pierde precision por la cuantizacion ternaria pero gana un factor de compresion que lo hace desplegable en un telefono.

## Limitaciones y advertencias

- Formato propietario: los pesos no son GGUF y no cargan en llama.cpp, Ollama, vLLM ni TGI; el unico runtime es la app Geode.
- Requisitos estrictos: Android 11+, procesador ARM de 64 bits con instrucciones de producto punto (ARMv8.2) y al menos 8 GB de RAM; en telefonos con menos memoria la copia de pesos en NPU se reduce y el procesador lee mas del prompt.
- La cuantizacion ternaria introduce perdida de precision respecto al modelo base; la fidelidad medida es alta pero no identica (98,4 % de coincidencia del token superior en ingles).
- Riesgo de alucinacion inherente a los modelos de lenguaje; el autor advierte explicitamente que las respuestas pueden ser erroneas.
- Sesgos: no documentados en la informacion disponible, pero heredables del corpus de entrenamiento de Qwen3.5-9B.
- Idiomas: no se documenta la lista exacta de idiomas soportados por este pack.
- Contexto maximo: no disponible; conviene no asumir la ventana completa del modelo base sin verificacion.
- Dependencia de la app Geode (beta en Google Play) para cualquier uso; no hay API de servidor ni integracion con pipelines de produccion convencionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario practicamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maximilian228/Geode-Ternary-Bonsai-2-9B
- Modelo base ternario (PrismML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- App Geode: https://geode.tifu.xyz
