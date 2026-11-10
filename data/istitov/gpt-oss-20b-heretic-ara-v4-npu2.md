# istitov/GPT-OSS-20B-heretic-ara-v4-NPU2

## Resumen

GPT-OSS-20B-heretic-ara-v4-NPU2 es una conversión no oficial del modelo `p-e-w/gpt-oss-20b-heretic-ara-v4` (a su vez una variante "abliterated" de `openai/gpt-oss-20b`) al formato Q4NX propietario de FastFlowLM, pensada para ejecutarse exclusivamente sobre NPUs AMD XDNA 2 (familia Ryzen AI 300 y posteriores). El autor de la conversión es el usuario de Hugging Face `istitov`, sin afiliación con OpenAI, p-e-w, AMD ni el proyecto FastFlowLM. No se ha entrenado nada: el repositorio solo convierte y reempaqueta los pesos originales, manteniendo los expertos en MXFP4 como hace la conversión oficial de FastFlowLM.

El modelo hereda la arquitectura Mixture-of-Experts de GPT-OSS-20B (20 000 millones de parámetros totales, aproximadamente 3 600 millones activos por token) y el trabajo de "desensibilización" de p-e-w, que reduce la tasa de rechazos del modelo original. Su relevancia es doble: por un lado, demuestra que es posible ejecutar un MoE de 20B en una NPU integrada de portátil con un rendimiento de decodificación cercano al del modelo oficial (18,4 frente a 18,7 tokens/s); por otro, ofrece una vía para desplegar modelos con menos restricciones de rechazo en hardware de consumo sin GPU dedicada.

La ficha se centra en la conversión y sus particularidades de despliegue, ya que las capacidades cognitivas son las del modelo base y deben consultarse en las model cards de OpenAI y de p-e-w. El contexto probado es de 8192 tokens (valor por defecto del registro de FastFlowLM) y el tamaño de descarga es de 14,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), herencia de GPT-OSS-20B |
| Parametros totales | 20 000 millones (20B) |
| Parametros activos | Aproximadamente 3 600 millones (3,6B) por token |
| Longitud de contexto | 8192 tokens probados (valor por defecto del registro de FastFlowLM); contexto nativo del modelo base no disponible en esta ficha |
| Tipos de cuantizacion | Q4NX con expertos en MXFP4 (formato propietario de FastFlowLM); no es GGUF |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (FastFlowLM); no compatible con safetensors, GGUF ni Transformers |
| Tamano del repositorio | 14,5 GB |
| Runtime | FastFlowLM 1.0.12 (probado); también OpenFlowLM con kernels cerrados |
| Hardware objetivo | NPU AMD XDNA 2 (Ryzen AI 300 y posteriores) |
| Sistema operativo probado | Linux (Windows no probado) |
| Formato de chat | Harmony (plantilla de FastFlowLM, copiada sin cambios) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `openai/gpt-oss-20b`: un transformer con capas Mixture-of-Experts en el que cada token activa una fracción reducida de los 20B parámetros totales (alrededor de 3,6B activos). Esta conversión concreta no entrena ni ajusta nada; su único trabajo es reempaquetar los pesos de `p-e-w/gpt-oss-20b-heretic-ara-v4` en el formato Q4NX de FastFlowLM, conservando los expertos en MXFP4 igual que la conversión oficial de FastFlowLM para GPT-OSS-20B. Los 435 tensores del archivo resultante coinciden en nombre, tipo, forma y tamaño con el archivo oficial de FastFlowLM, según las comprobaciones del publicador.

El trabajo de modificación de comportamiento (la reducción de rechazos, etiquetada como "heretic" y "abliterated") es obra de p-e-w y se realizó antes de la conversión; los detalles de ese proceso deben consultarse en su model card. La innovación técnica de este repositorio es, por tanto, de despliegue: adaptar un MoE de 20B al motor cerrado de FastFlowLM sobre NPU XDNA 2, con kernels emparejados con los del modelo oficial y una plantilla de chat Harmony intacta. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en esta ficha.

## Capacidades

- Generación de texto y conversación multi-turno, con el formato de chat Harmony que esperan todos los modelos GPT-OSS.
- Razonamiento y resolución de problemas, heredado del modelo base GPT-OSS-20B.
- Generación de código y matemáticas, según las capacidades del modelo original (no verificadas de forma independiente en esta conversión).
- Reducción de rechazos: el modelo base de p-e-w reporta 9 rechazos de cada 100 frente a 98 de cada 100 del GPT-OSS-20B original; la cuantización puede alterar estas cifras en cualquier dirección.
- Ejecución local en NPU: inferencia en hardware AMD XDNA 2 sin GPU dedicada.
- Compatibilidad con OpenFlowLM usando los kernels cerrados de FastFlowLM para GPT-OSS-20B.
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada para esta conversión; debe consultarse en las model cards del modelo base.

## Casos de uso

- Asistentes conversacionales locales en portátiles con Ryzen AI 300: el modelo se ejecuta íntegramente en la NPU XDNA 2 a unos 18,4 tokens/s, lo que permite mantener un chatbot privado sin enviar datos a la nube y sin consumir la GPU integrada.
- Generación de texto creativo sin filtros restrictivos: la reducción de rechazos (9/100 frente a 98/100) lo hace adecuado para escritura de ficción, guiones o contenido que los modelos alineados suelen declinar, siempre con moderación externa si el despliegue es público.
- Prototipado de aplicaciones de IA en hardware de consumo: sirve para validar pipelines de generación de texto y formato Harmony en equipos sin GPU dedicada, con un coste de infraestructura mínimo.
- Investigación sobre alineación y seguridad: permite estudiar el comportamiento de un modelo con rechazos reducidos y compararlo con el GPT-OSS-20B original en las mismas condiciones de hardware.
- Evaluación de la madurez del ecosistema NPU: útil para medir latencia, throughput y estabilidad de FastFlowLM y OpenFlowLM con un MoE de 20B en XDNA 2, con cifras de referencia publicadas (18,4 frente a 18,7 tokens/s del modelo oficial).
- Despliegue en entornos con requisitos de soberanía de datos: al ejecutarse en local y con licencia Apache 2.0, encaja en escenarios donde el texto no puede salir del dispositivo, como documentación interna o análisis de contenido sensible.
- Pruebas de conversión de formatos: el repositorio y las herramientas asociadas (`flm-add`, `flm-custom-sync`) sirven como referencia para convertir otros fine-tunes de GPT-OSS al formato Q4NX.

## Benchmarks y rendimiento

| Metrica | GPT-OSS-20B-heretic-ara-v4-NPU2 | GPT-OSS-20B oficial (FastFlowLM) |
|---|---|---|
| Decodificacion (Ryzen AI 9 HX 370) | ~18,4 tokens/s | ~18,7 tokens/s |
| Rechazos (100 peticiones) | 9/100 (cifra de p-e-w, medida antes de la conversion) | 98/100 |
| PIQA | 0,7742 (cifra de p-e-w) | 0,7731 |
| Throughput en OpenFlowLM | ~13-16 tokens/s (prompt y razonamiento incluidos) | No disponible |
| Tensores verificados | 435, coincidentes con el archivo oficial | Referencia |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para esta conversión concreta. Las cifras de rechazos y PIQA proceden del autor del modelo base y se midieron antes de la conversión; la cuantización puede modificarlas.

## Requisitos de hardware

- NPU AMD XDNA 2 obligatoria: Ryzen AI 300 series y posteriores. No funciona en GPU, CPU ni NPU de otras generaciones.
- Memoria del sistema: el equipo de prueba (Ryzen AI 9 HX 370) tenía 55 GiB de RAM visibles para Linux; el modelo ocupa 14,5 GB en disco y requiere memoria compartida con la NPU para cargarse.
- VRAM de GPU: no aplica; el modelo no se ejecuta en GPU y no es compatible con CUDA, ROCm ni Metal.
- GPU recomendadas: ninguna; el hardware objetivo es la NPU integrada.
- Cabe en hardware de consumo: sí, en portátiles y mini-PC con Ryzen AI 300 o superior, siempre que el sistema operativo sea Linux (Windows no fue probado).
- Opciones de despliegue: FastFlowLM 1.0.12 (runtime principal, motor cerrado) y OpenFlowLM (fork comunitario, probado en el commit `96b915d` con kernels cerrados de FastFlowLM). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Instalación: mediante `flm-add` (PyPI) o `flm-custom-sync` en el overlay `stuff` de Gentoo; requiere exportar `FLM_CONFIG_PATH` y `FLM_XCLBIN_PATH` y usar la etiqueta `--tag gpt-oss-heretic-ara:20b` para no sobrescribir la entrada oficial de GPT-OSS-20B.
- Latencia y throughput: aproximadamente 18,4 tokens/s en decodificación con FastFlowLM y 13-16 tokens/s en OpenFlowLM contando prompt y tokens de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPT-OSS-20B-heretic-ara-v4-NPU2 | 20B totales, ~3,6B activos | 8192 probados | Q4NX / FastFlowLM en NPU XDNA 2 | Apache 2.0 | Hugging Face, 0 descargas |
| openai/gpt-oss-20b (oficial) | 20B totales, ~3,6B activos | No disponible en esta ficha | Safetensors, GGUF, MXFP4; vLLM, llama.cpp, Ollama, Transformers | Apache 2.0 | Amplia, ecosistema maduro |
| p-e-w/gpt-oss-20b-heretic-ara-v4 | 20B totales, ~3,6B activos | No disponible en esta ficha | Safetensors; Transformers y runtimes compatibles | Apache 2.0 | Hugging Face, modelo base de esta conversión |
| Conversión oficial GPT-OSS-20B de FastFlowLM | 20B totales, ~3,6B activos | 8192 por defecto | Q4NX / FastFlowLM en NPU XDNA 2 | Apache 2.0 | Incluida en el paquete FastFlowLM |

La diferencia principal frente al modelo oficial de FastFlowLM es el comportamiento (menos rechazos) y el rendimiento ligeramente inferior (18,4 frente a 18,7 tokens/s). Frente a las versiones en safetensors o GGUF, la conversión pierde portabilidad: solo funciona en NPU XDNA 2 con FastFlowLM u OpenFlowLM.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada ni respaldada por OpenAI, p-e-w, AMD ni FastFlowLM; no hay garantía de mantenimiento ni de compatibilidad futura.
- Formato propietario: Q4NX no carga en Transformers, llama.cpp, Ollama, vLLM ni TGI; queda restringido a FastFlowLM y OpenFlowLM sobre NPU XDNA 2.
- Fragilidad ante actualizaciones: una nueva versión de FastFlowLM que cambie el formato de pesos puede dejar de funcionar con esta conversión y exigir una reconversión.
- Solo Linux probado: Windows no fue testeado, aunque FastFlowLM lo soporte en otros modelos.
- Contenido dañino: el modelo base fue modificado para rechazar menos y puede producir material ofensivo, falso o peligroso; el despliegue necesita una capa de moderación propia.
- Rechazos reducidos, no eliminados: las cifras de 9/100 proceden del autor del modelo base y se midieron antes de la cuantización, que puede alterarlas en cualquier dirección.
- Idiomas: no se dispone de información sobre los idiomas soportados en esta conversión.
- Riesgo de alucinación: no cuantificado en la información disponible; debe evaluarse en el caso de uso concreto.
- Contexto limitado a 8192 tokens en la configuración probada; no se ha verificado un contexto mayor en esta conversión.
- Sesgos: no documentados para esta conversión; deben consultarse en las model cards de OpenAI y de p-e-w.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y la responsabilidad sobre el contenido generado recae en el desplegador.
- Sin descargas ni likes en el momento de la consulta: ecosistema de usuarios prácticamente inexistente, lo que reduce el soporte comunitario disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/istitov/GPT-OSS-20B-heretic-ara-v4-NPU2
- Modelo base (p-e-w): https://huggingface.co/p-e-w/gpt-oss-20b-heretic-ara-v4
- Modelo original de OpenAI: https://huggingface.co/openai/gpt-oss-20b
- FastFlowLM (GitHub): https://github.com/ROCm/FastFlowLM
- OpenFlowLM (fork comunitario): https://github.com/Atomic-Germ/OpenFlowLM-Next
- Herramienta flm-add (PyPI): https://pypi.org/project/flm-add/
- Overlay stuff para Gentoo: https://github.com/istitov/stuff
- Guía de fine-tunes en NPU: https://istitov.github.io/stuff/guides/npu-custom-models/
- Colección de conversiones NPU2 Heretic: https://huggingface.co/collections/istitov/fastflowlm-npu2-heretic-conversions-6af22b7bf264c137a0b92875
- Repositorio de referencia Llama-3.1-8B-Instruct-heretic-NPU2: https://huggingface.co/istitov/Llama-3.1-8B-Instruct-heretic-NPU2
