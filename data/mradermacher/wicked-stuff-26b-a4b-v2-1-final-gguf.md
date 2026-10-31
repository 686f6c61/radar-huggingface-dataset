# mradermacher/Wicked-Stuff-26B-A4B-v2.1-FINAL-GGUF

## Resumen

Wicked-Stuff-26B-A4B-v2.1-FINAL-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo ReadyArt/Wicked-Stuff-26B-A4B-v2.1-FINAL, realizada por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es un LLM de 26 mil millones de parámetros (25.233.142.046 según los safetensors reales) con arquitectura de mezcla de expertos (MoE), donde el sufijo "A4B" indica que solo unos 4 mil millones de parámetros se activan por token, lo que permite una inferencia muy rápida para su tamaño total.

Se trata de un modelo conversacional e instruct sin alineación (unaligned), orientado explícitamente a contenido adulto: roleplay, ERP (roleplay erótico), horror, violencia y contenido mature. Su relevancia radica en la combinación de un tamaño MoE eficiente (activación de ~4B parámetros) con la ausencia de filtros de seguridad, un nicho que los modelos comerciales no cubren. La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones adicionales.

Esta ficha cubre la versión cuantizada; los pesos originales en safetensors están disponibles en el repositorio del modelo base. El repositorio de cuantizaciones ocupa 182,9 GB en total y ofrece once variantes de cuantización, desde Q2_K (10,7 GB) hasta Q8_0 (27,0 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (deducido del sufijo A4B; no confirmado en la model card) |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | ~4B (deducido del sufijo "A4B" del nombre; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas; existen también imatrix quants en un repo aparte) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); safetensors en el modelo base |

## Arquitectura y entrenamiento

El nombre del modelo (26B-A4B) sigue la convención habitual de los modelos de mezcla de expertos (MoE): unos 26 mil millones de parámetros totales de los cuales aproximadamente 4 mil millones se activan por token. Esta arquitectura permite obtener calidad de generación cercana a modelos densos de gran tamaño con latencia y requisitos de memoria de un modelo denso de ~4B, siempre que el runtime (llama.cpp, por ejemplo) soporte correctamente la descarga selectiva de expertos. La model card del cuantizador no detalla la arquitectura exacta ni el número de expertos, por lo que estos datos no están disponibles.

Sobre el entrenamiento del modelo base no hay información publicada en la model card: no se conocen el número de tokens, la composición del dataset ni el uso de técnicas como RLHF o DPO. Por las etiquetas (unaligned, roleplay, ERP, instruct) puede inferirse que se trata de un fine-tune orientado a conversación libre y contenido adulto sin filtros, pero los detalles concretos del proceso de entrenamiento no están disponibles. El trabajo de este repositorio se limita a la conversión a GGUF y a la generación de cuantizaciones estáticas tipo K-quants e IQ-quants.

## Capacidades

- Generación de texto conversacional e instruct, sin filtros de alineación (unaligned)
- Roleplay de larga duración y roleplay erótico (ERP), el caso de uso principal declarado
- Generación de contenido mature: horror, violencia y temática adulta explícita
- Formato GGUF compatible con llama.cpp, Ollama, LM Studio, KoboldCpp, SillyTavern (vía backends compatibles) y otros runtimes
- Once niveles de cuantización estática para ajustarse a distintas memorias disponibles; además existen cuantizaciones imatrix (weighted) de mayor calidad en un repositorio complementario
- Soporte de tool calling, agentes y capacidades de razonamiento multi-paso: no disponible (no documentado)
- Capacidades multilingües: el modelo está etiquetado solo en inglés; el rendimiento en otros idiomas, incluido el castellano, no está documentado y probablemente sea limitado

## Casos de uso

- Roleplay interactivo en clientes como SillyTavern o KoboldCpp: el modelo está específicamente ajustado para conversaciones de rol sin restricciones, y la variante Q4_K_M (16,9 GB) ofrece un buen equilibrio entre calidad y velocidad en una sola GPU de consumo.
- Escritura creativa de ficción adulta, horror o violencia gráfica: al ser un modelo unaligned, puede generar contenido que otros modelos rechazan, útil para autores que necesitan borradores de ficción mature.
- Chatbots personales locales y privados: al ejecutarse íntegramente en local con llama.cpp u Ollama, el usuario mantiene privacidad total sobre las conversaciones, algo relevante en contenido adulto.
- Prototipado de agentes conversacionales sin filtros para investigación sobre alineación y seguridad: su naturaleza unaligned lo hace útil como sujeto de estudio de comportamientos no alineados en modelos abiertos.
- Inferencia en hardware modesto gracias a MoE: con solo ~4B de parámetros activos, la velocidad de generación por token se acerca a la de un modelo denso pequeño, adecuado para respuestas largas de roleplay en tiempo real.
- Uso comercial en productos de contenido adulto: la licencia Apache 2.0 permite integrarlo en servicios comerciales sin restricciones de licencia, siempre que el contenido sea legal en la jurisdicción del servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización (tamaño del archivo, más overhead de contexto y KV cache):
  - Q2_K: ~10,7 GB
  - Q3_K_M: ~13,4 GB
  - IQ4_XS: ~14,2 GB
  - Q4_K_S / Q4_K_M: ~15,6-16,9 GB
  - Q5_K_M: ~19,2 GB
  - Q6_K: ~22,7 GB
  - Q8_0: ~27,0 GB
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) ejecuta cómodamente hasta Q5_K_M/Q6_K; una RTX 3060 de 12 GB puede ejecutar Q2_K/Q3_K; para Q8_0 se necesita descarga parcial a RAM o una GPU con más de 24 GB (A100, RTX 5090, o multi-GPU)
- Cabe en GPU de consumo: sí, hasta Q5_K_M en una RTX 3090/4090 de 24 GB; también es viable en CPU pura con suficiente RAM (16-32 GB) gracias a los bajos parámetros activos de la arquitectura MoE, aunque con menor throughput
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, KoboldCpp, text-generation-webui; vLLM y TGI no soportan GGUF de forma nativa (usarían el modelo base en safetensors)
- Latencia y throughput estimados: no disponible; al ser MoE con ~4B de parámetros activos, la generación en GPU de consumo debería situarse en decenas de tokens por segundo, pero no hay mediciones publicadas

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Wicked-Stuff-26B-A4B-v2.1-FINAL | ~26B total / ~4B activos | no disponible | Apache 2.0 | Roleplay y contenido adulto, unaligned |
| Qwen3-30B-A3B | 30,5B total / 3,3B activos | 32k (128k con YaRN) | Apache 2.0 | General, alineado, multilingüe |
| DeepSeek-V2-Lite | 15,7B total / 2,4B activos | 32k | Modelo propio (restricciones de uso) | General, alineado |
| Llama 3.1 8B | 8B densos | 128k | Licencia Llama 3.1 | General, alineado |

La ventaja de Wicked-Stuff frente a las alternativas es su especialización en roleplay sin filtros y su eficiencia MoE; frente a Qwen3-30B-A3B ofrece menos capacidades generales y un contexto presumiblemente menor, pero un comportamiento menos restringido para ficción mature.

## Limitaciones y advertencias

- Contenido adulto explícito: el modelo está etiquetado como not-for-all-audiences y genera NSFW, ERP, horror y violencia sin filtros; no debe exponerse a menores de edad ni usarse en entornos sin control de acceso
- Riesgo de generación de contenido ilegal o dañino: al ser unaligned, no hay garantías de que rechace peticiones problemáticas; la responsabilidad legal del uso recae íntegramente en el usuario o el operador del servicio
- Idioma: entrenado/etiquetado solo en inglés; el rendimiento en castellano no está documentado y puede degradarse notablemente
- Sesgos: no hay documentación sobre sesgos del modelo base ni del fine-tune; no disponible
- Alucinaciones: como todo LLM, puede generar información falsa con apariencia plausible; no hay datos de benchmarks que permitan cuantificarlo
- Contexto: la longitud de ventana no está publicada; en roleplay largo conviene verificarla empíricamente antes de producción
- Cuantizaciones bajas (Q2_K, Q3_K_S/M) degradan apreciablemente la calidad, especialmente en roleplay matizado; se recomienda Q4_K_M o superior
- Datos de entrenamiento no documentados: posible contaminación de benchmarks y procedencia de datos sin verificar
- Uso comercial: permitido por la licencia Apache 2.0, pero el operador debe cumplir la normativa sobre contenidos adultos de su jurisdicción (verificación de edad, etc.)

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/Wicked-Stuff-26B-A4B-v2.1-FINAL-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-v2.1-FINAL
- Cuantizaciones imatrix (weighted): https://huggingface.co/mradermacher/Wicked-Stuff-26B-A4B-v2.1-FINAL-i1-GGUF
- Página de descarga resumida: https://hf.tst.eu/model#Wicked-Stuff-26B-A4B-v2.1-FINAL-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (soporte del cuantizador): https://www.nethype.de/
