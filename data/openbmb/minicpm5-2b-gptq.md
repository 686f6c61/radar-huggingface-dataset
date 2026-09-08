# openbmb/MiniCPM5-2B-GPTQ

## Resumen

MiniCPM5-2B es un modelo de lenguaje de 2.500 millones de parámetros (2.5B) desarrollado por OpenBMB, la segunda entrega de la serie MiniCPM5 tras el MiniCPM5-1B. Se trata de un Transformer denso diseñado específicamente para despliegue on-device, local y en entornos con recursos limitados, donde busca alcanzar el estado del arte en su clase de 2B. Su relevancia radica en ofrecer un rendimiento competitivo con modelos de 4B en tareas como código, matemáticas, comprensión de contexto largo, uso de herramientas y tareas agénticas, todo con una huella de memoria reducida.

La ventana de contexto nativa es de 131.072 tokens (131K), según la review de buildfastwithai, lo que permite procesar documentos extensos sin necesidad de técnicas de truncamiento. El modelo está disponible en formato GPTQ 4-bit, además de BF16, GGUF y MLX, lo que facilita su integración en una amplia variedad de entornos de despliegue, desde GPUs de consumo hasta dispositivos edge. La licencia Apache-2.0 permite su uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (basada en Llama) |
| Parámetros totales | 2.516.756.480 (2.5B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (131K) según review externa; no confirmado en la model card |
| Tipos de cuantización | GPTQ 4-bit (este repo), BF16, GGUF, MLX |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (GPTQ 4-bit), GGUF, MLX |

## Arquitectura y entrenamiento

MiniCPM5-2B es un Transformer denso que sigue la arquitectura Llama, con 2.500 millones de parámetros. El entrenamiento se basa en la misma receta que el MiniCPM5-1B, escalada a mayor tamaño. Los datos de entrenamiento proceden de la familia UltraData de OpenBMB, que incluye Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. La presencia de datasets de SFT y RL sugiere un pipeline de ajuste supervisado y optimización por refuerzo, aunque la model card no detalla el proceso exacto.

El modelo incorpora capacidades de long-context, tool calling y tareas agénticas desde el diseño, lo que lo hace especialmente adecuado para aplicaciones de agente y razonamiento multi-paso. La cuantización GPTQ en 4 bits reduce el peso del repositorio a 2.1 GB, manteniendo un equilibrio entre precisión y consumo de memoria.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento de código y matemáticas, con ventajas sobre modelos de tamaño comparable.
- Comprensión de contexto largo hasta 131K tokens, según la review de buildfastwithai.
- Tool calling / function calling, integrable en pipelines de agentes.
- Tareas agénticas y razonamiento multi-paso.
- Instrucción following y conocimiento general.
- Despliegue on-device y edge AI, con formatos cuantizados para hardware limitado.

## Casos de uso

1. **Asistente de código en IDE local**: el modelo puede ejecutarse en una GPU de consumo (por ejemplo, RTX 3060) y ofrecer autocompletado, generación de funciones y explicación de fragmentos de código sin conexión, gracias a su fuerte capacidad de razonamiento de código y a la cuantización GPTQ que reduce la VRAM necesaria.

2. **Agente conversacional en dispositivos edge**: gracias a su tamaño compacto y al soporte de tool calling, puede desplegarse en routers, NAS o mini-PCs para gestionar tareas del hogar, como consultar el estado de sensores o ejecutar comandos a través de APIs locales.

3. **Análisis de documentos largos**: con una ventana de 131K tokens, puede resumir contratos, informes técnicos o actas de reuniones extensas, extrayendo los puntos clave sin perder información por truncamiento.

4. **Atención al cliente bilingüe**: al estar entrenado en inglés y chino, puede gestionar conversaciones de soporte en ambos idiomas, manteniendo el contexto de la conversación y resolviendo dudas frecuentes con respuestas coherentes.

5. **Automatización de tareas con herramientas externas**: el modelo puede actuar como agente que invoca funciones, como consultar bases de datos, enviar correos o interactuar con APIs REST, en un flujo de razonamiento multi-paso, ideal para integrarlo en sistemas de automatización empresarial.

6. **Tutor de matemáticas y programación sin conexión**: en entornos educativos con recursos limitados, el modelo puede generar ejercicios, explicar conceptos y revisar soluciones, aprovechando su rendimiento en matemáticas y código sin depender de servicios en la nube.

7. **Integración en pipelines de CI/CD**: puede utilizarse para generar pruebas unitarias, revisar cambios de código o documentar APIs, integrándose en flujos de trabajo de desarrollo gracias a su soporte de tool calling y su capacidad de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma que el modelo alcanza el estado del arte en su clase de 2B y que compite con modelos de 4B, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia con GPTQ 4-bit: aproximadamente 1.5-2 GB, incluyendo overhead y KV cache (estimación basada en 2.5B parámetros a 4 bits).
- En BF16, el modelo ocupa unos 5 GB de VRAM, por lo que se recomienda una GPU con al menos 8 GB para inferencia cómoda.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4090 (24 GB), A100 (40/80 GB) o H100. Para edge, puede ejecutarse en dispositivos con NPU o en GPUs integradas.
- Cabe en GPUs de consumo: sí, con cuantización GPTQ 4-bit es viable en tarjetas de 6 GB o más.
- Opciones de despliegue: vLLM, llama.cpp (formatos GGUF), Ollama (GGUF), TGI, Transformers (con bitsandbytes o GPTQ).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B | 2.5B | 131K | No disponible | Apache-2.0 | HF, GGUF, MLX, GPTQ |
| Qwen2.5-1.5B | 1.5B | 32K | No disponible | Apache-2.0 | HF, GGUF |
| Qwen2.5-3B | 3B | 32K | No disponible | Apache-2.0 | HF, GGUF |
| Gemma-2-2B | 2B | 8K | No disponible | Gemma Terms of Use | HF, GGUF |
| SmolLM2-1.7B | 1.7B | 8K | No disponible | Apache-2.0 | HF, GGUF |

## Limitaciones y advertencias

- Sesgos: al estar entrenado principalmente en inglés y chino, puede reflejar sesgos culturales y lingüísticos de esos dominios. No se han publicado evaluaciones de sesgo en la información disponible.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede generar información plausible pero incorrecta, especialmente en dominios especializados.
- Limitaciones de idioma: solo soporta inglés y chino; no está optimizado para otros idiomas, lo que limita su uso en entornos multilingües amplios.
- Contexto largo: la ventana de 131K no está confirmada en la model card oficial; proviene de una review externa. En la práctica, la calidad puede degradarse en la parte final del contexto.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero es necesario verificar el cumplimiento de las atribuciones y avisos de licencia.
- Caveat de producción: la cuantización GPTQ puede introducir pérdida de precisión; se recomienda validar el rendimiento en tareas críticas antes de desplegar.

## Enlaces

- HuggingFace: https://huggingface.co/openbmb/MiniCPM5-2B-GPTQ
- Paper MiniCPM Tech Report: https://arxiv.org/pdf/2506.07900
- Referencia arXiv adicional (según model card): https://arxiv.org/abs/2602.09003
- GitHub: https://github.com/OpenBMB/MiniCPM
- Wiki (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- UltraData: https://ultradata.openbmb.cn/
