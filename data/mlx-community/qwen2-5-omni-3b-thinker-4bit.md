# mlx-community/Qwen2.5-Omni-3B-Thinker-4bit

## Resumen

Este repositorio contiene el *thinker* de Qwen/Qwen2.5-Omni-3B convertido a MLX por mlx-community y cuantizado a 4 bits. No es un modelo conversacional completo: incluye el modelo de lenguaje Qwen2 (36 capas de dimensión 2048) y la torre de audio con forma de Whisper, pero excluye la torre de visión, la cabeza LM, el *talker* y *token2wav*. Se distribuye como encoder semántico de AuK dentro de xocialize/mlx-auk-swift, para producir estados ocultos, no para generar texto o voz.

La conversión cuantiza las capas Linears de las 36 capas del LLM y de las 32 capas de la torre de audio a affine 4-bit con grupo de 64, lo que da 2,55 GB; embeddings, normas y proyecciones quedan en bf16. El repositorio ocupa 2,6 GB y usa safetensors. Es relevante para quien necesite ejecutar el encoder de Qwen2.5-Omni-3B en Apple Silicon con MLX/Swift y un presupuesto de memoria reducido.

La licencia qwen-research limita el uso a investigación o evaluación no comercial; para uso comercial hay que solicitar licencia a Alibaba Cloud. La model card reporta paridad numérica con transformers 4.57.1 y que los niveles bf16, 8-bit y 4-bit superan la puerta de calidad pre-registrada de AuK.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Modelo base | Qwen/Qwen2.5-Omni-3B |
| Arquitectura | Transformer Qwen2 (36 capas, dimensión 2048) + torre de audio con forma de Whisper (32 capas); conversión MLX del *thinker* de Qwen2.5-Omni-3B |
| Parámetros totales | no disponible (subconjunto del modelo base Qwen2.5-Omni-3B; no se especifica el recuento exacto) |
| Parámetros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | affine 4-bit, group size 64, en las Linears del LLM y de la torre de audio; embeddings, normas y proyecciones en bf16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License Agreement): solo investigación o evaluación, no comercial |
| Formato de pesos | safetensors (`encoder.safetensors`), layout MLX; convoluciones de audio en formato (O, K, I); `config.json` y tokenizer, chat template y preprocessor originales |
| Tamaño del repositorio | 2,6 GB |

## Arquitectura y entrenamiento

El artefacto es un subconjunto del *thinker* de Qwen2.5-Omni-3B: un modelo de lenguaje Qwen2 de 36 capas con dimensión 2048 y una torre de audio de 32 capas con forma de Whisper. La conversión conserva las claves `thinker.model.*` y `thinker.audio_tower.*` en `encoder.safetensors`. No incluye la torre de visión, la cabeza LM, el *talker* ni *token2wav*, por lo que su salida son estados ocultos y no tokens ni audio sintetizado.

No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO para esta conversión. Son ficheros modificados del modelo base: el trabajo técnico consiste en la conversión a MLX y la cuantización, no en un entrenamiento nuevo. La model card reporta paridad en fp32 frente a transformers 4.57.1: identificadores de token idénticos, `relL2` de 1,5e-6 en características de Whisper, 3,9e-6 en la torre de audio, 2,2e-5 en el último estado oculto y 3,8e-6 en la condición fusionada de 36 capas de AuK. Los niveles bf16, 8-bit y 4-bit superan la puerta de calidad pre-registrada de AuK basada en *error rate*, CAM++ SIM y DNSMOS frente a fp32.

## Capacidades

- Produce estados ocultos y la condición fusionada de 36 capas que consume AuK como encoder semántico.
- Procesa tokens de texto y audio: incluye el tokenizer, el chat template y el preprocessor originales, además de la torre de audio.
- Puede calcular características de Whisper a partir de audio de entrada.
- No genera texto de forma autónoma: no incluye la cabeza LM.
- No genera voz: no incluye el *talker* ni *token2wav*.
- No procesa visión: no incluye la torre de visión.
- No soporta *tool calling*, *function calling*, agentes ni razonamiento multi-paso de forma nativa, al no ser un modelo generativo completo.
- Se integra en el ecosistema MLX y mlx-swift mediante xocialize/mlx-auk-swift.
- Las capacidades multilingües no están evaluadas en esta conversión.

## Casos de uso

- **Encoder semántico de AuK en una aplicación Swift**: se integra mediante xocialize/mlx-auk-swift para transformar texto y audio en estados ocultos y en la condición fusionada de 36 capas que consume AuK. Es adecuado porque el repositorio incluye exactamente `thinker.model` y `thinker.audio_tower`, y evita cargar visión, *talker* o *token2wav*.
- **Extracción de representaciones para investigación en audio y habla**: ejecutar el encoder sobre clips y transcripciones para obtener el último estado oculto y alimentar sondas lineales, clasificadores o análisis de similitud. No requiere generación de texto y aprovecha la paridad reportada con transformers.
- **Prototipos de asistentes de voz en Apple Silicon**: usar el encoder como etapa de acondicionamiento en una aplicación macOS o iOS y añadir un decodificador o una cabeza propia. El peso de 2,55 GB y el soporte MLX lo hacen viable en memoria unificada, aunque no es un sistema ASR ni un chat completo.
- **Validación de ports MLX**: comparar identificadores de token, características de Whisper, torre de audio y estados ocultos contra transformers 4.57.1 usando las métricas de la model card. Es útil en pipelines de integración continua para conversiones de modelos.
- **Evaluación de cuantización**: medir el impacto de affine 4-bit frente a bf16 y 8-bit con la puerta de calidad de AuK (*error rate*, CAM++ SIM y DNSMOS). Apropiado para estudiar el compromiso entre memoria y calidad en un encoder multimodal.
- **Preprocesado local de audio con privacidad**: calcular características y embeddings en el dispositivo sin enviar audio a la nube, gracias a MLX/Swift y a un artefacto de 2,6 GB.
- **Base para modelos downstream de audio**: congelar el encoder y entrenar cabezas para tareas como detección de eventos, segmentación o recuperación audio-texto. Requiere datos y cabezas adicionales que no están incluidas en este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye métricas de paridad numérica frente a transformers 4.57.1, que no deben interpretarse como benchmarks de calidad:

| Métrica de paridad (fp32 frente a transformers 4.57.1) | Resultado |
|---|---|
| Identificadores de token | idénticos |
| Características de Whisper, relL2 | 1,5e-6 |
| Torre de audio, relL2 | 3,9e-6 |
| Último estado oculto, relL2 | 2,2e-5 |
| Condición fusionada de 36 capas de AuK, relL2 | 3,8e-6 |

No se dispone de latencia ni throughput medidos para esta conversión.

## Requisitos de hardware

- **VRAM estimada**: no hay una cifra oficial. Los pesos cuantizados ocupan 2,55 GB y el repositorio 2,6 GB; la inferencia necesita memoria adicional para activaciones y para los módulos en bf16.
- **GPU recomendadas**: Apple Silicon con memoria unificada, por el uso de MLX. No se documenta soporte para A100 o H100 en esta conversión.
- **Consumer GPU**: sí en equipos Apple Silicon; en GPU NVIDIA no es un artefacto directamente ejecutable con MLX.
- **Opciones de despliegue**: MLX, mlx-swift y xocialize/mlx-auk-swift. No se proporcionan instrucciones para vLLM, llama.cpp, Ollama o TGI, y el artefacto no es un modelo de chat.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrada/salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio | no disponible; subconjunto del modelo base de 3B | no disponible | texto y audio → estados ocultos | qwen-research, solo investigación o evaluación | MLX 4-bit en Hugging Face |
| Qwen/Qwen2.5-Omni-3B | 3B según el nombre del modelo | no disponible | texto, imagen, audio y vídeo → texto y voz en el modelo completo | no disponible en esta ficha | Hugging Face |
| mlx-community/Qwen2.5-3B-4bit | 3B según el nombre del modelo | no disponible | texto → texto | no disponible en esta ficha | MLX 4-bit en Hugging Face |

La comparación es estructural: no se dispone de resultados de benchmarks comunes para comparar calidad entre estas variantes.

## Limitaciones y advertencias

- La licencia qwen-research permite solo investigación o evaluación no comercial. El uso comercial requiere solicitar licencia a Alibaba Cloud.
- No es un modelo de chat: al no incluir la cabeza LM, no puede generar texto de forma autónoma.
- No puede transcribir audio por sí solo ni sintetizar voz: faltan la cabeza LM, el *talker* y *token2wav*.
- No procesa imágenes ni vídeo: la torre de visión no está incluida.
- La cuantización affine 4-bit puede degradar la calidad frente a bf16. La model card indica que supera la puerta de calidad de AuK, pero no se han evaluado tareas generales.
- No hay datos publicados de benchmarks, longitud de contexto ni idiomas soportados para esta conversión.
- Las convoluciones de audio usan layout MLX (O, K, I), lo que puede requerir adaptación si se reutilizan en otros runtimes.
- Los sesgos del modelo base no se han evaluado en esta conversión. Al no ser un generador directo, el riesgo de alucinación no aplica al artefacto en sí, pero sí a cualquier cabeza o modelo downstream que consuma sus estados ocultos.
- Es un artefacto de investigación: no se recomienda para producción comercial sin licencia, validación de calidad y una cabeza downstream adecuada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mlx-community/Qwen2.5-Omni-3B-Thinker-4bit)
- [Modelo base Qwen/Qwen2.5-Omni-3B](https://huggingface.co/Qwen/Qwen2.5-Omni-3B)
- [AuK-bf16](https://huggingface.co/mlx-community/AuK-bf16)
- [Repositorio xocialize/mlx-auk-swift](https://github.com/xocialize/mlx-auk-swift)
- [Repositorio QwenLM/Qwen2.5-Omni](https://github.com/QwenLM/Qwen2.5-Omni)
- [README de Qwen2.5-Omni](https://github.com/QwenLM/Qwen2.5-Omni/blob/main/README.md)
- [Página de Qwen2.5-Omni en openlm.ai](https://openlm.ai/qwen2.5-omni/)
- [Colección Qwen2.5 de mlx-community](https://huggingface.co/collections/mlx-community/qwen25)
- [mlx-community/Qwen2.5-3B-4bit](https://huggingface.co/mlx-community/Qwen2.5-3B-4bit)
- [Licencia del repositorio](https://huggingface.co/mlx-community/Qwen2.5-Omni-3B-Thinker-4bit/blob/main/LICENSE)
- [Aviso de atribución](https://huggingface.co/mlx-community/Qwen2.5-Omni-3B-Thinker-4bit/blob/main/NOTICE)
