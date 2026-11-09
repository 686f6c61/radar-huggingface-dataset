# DavidAU/Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B

## Resumen

Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B es un modelo de lenguaje creado por DavidAU mediante técnicas de fusión (merge) con MergeKit, a partir de la familia Llama 3.2 de Meta. Se trata de una mezcla de expertos (MoE) construida a partir de ocho "expertos" derivados de modelos de 3B parámetros, dando un total de aproximadamente 18.400 millones de parámetros. El modelo se distribuye en precisión completa en formato safetensors y está pensado para ser cuantizado posteriormente a GGUF, GPTQ, EXL2, AWQ o HQQ.

El modelo combina dos características que definen su nicho: por un lado, una arquitectura MoE con enrutamiento configurable (por defecto 2 expertos por token), lo que permite ajustar el equilibrio entre velocidad y calidad modificando el parámetro `num_experts_per_tok` del `config.json`. Por otro, incorpora las etiquetas "uncensored" y "abliterated", lo que indica que se ha aplicado una técnica de ablación de direcciones de rechazo para reducir las negativas del modelo ante peticiones que los modelos alineados estándar suelen declinar.

Es relevante en el ecosistema de modelos abiertos porque ejemplifica la práctica de la comunidad de merges: modelos derivados y modificados que no cuentan con una model card técnica exhaustiva ni con benchmarks publicados, y cuya evaluación recae en el usuario. Con 824 descargas y 26 "likes" en el momento de la consulta, es un modelo de nicho orientado a experimentación, generación creativa y despliegue local, no a producción empresarial con garantías.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en transformer Llama 3.2, construida con MergeKit |
| Parámetros totales | 18.404.944.896 (≈18,4B) |
| Parámetros activos | No disponible (por defecto 2 expertos por token, según `num_experts_per_tok`; el número de parámetros activos no se especifica) |
| Longitud de contexto | No disponible en la información proporcionada (la model card remite a la repo GGUF para los límites de contexto) |
| Tipos de cuantización | El repo fuente permite generar GGUF, GPTQ, EXL2, AWQ y HQQ; existen GGUF en repo aparte |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (precisión completa); GGUF disponible en repo separado |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge con MergeKit (herramienta de Arcee AI) que combina ocho expertos derivados de modelos de 3B parámetros de la familia Llama 3.2, configurados como una mezcla de expertos. La arquitectura resultante es un transformer con capas MoE: el token se enruta a un subconjunto de expertos (por defecto dos, ajustable mediante `num_experts_per_tok` en `config.json`), de modo que el coste computacional por token depende del número de expertos activados, no del total de parámetros. La model card advierte explícitamente de que cada experto añadido o eliminado altera los tokens por segundo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo fases de RLHF o DPO. El sufijo "Instruct" sugiere que los modelos base tenían ajuste por instrucciones, y "abliterated" indica que se aplicó una técnica de ablación para eliminar la dirección de rechazo en el espacio de activaciones, reduciendo la tendencia a negarse a responder. La model card no documenta el proceso de ablación ni los modelos exactos utilizados como base (el campo `base_model` aparece vacío). Tampoco se detalla ninguna innovación técnica adicional más allá del propio merge MoE.

## Capacidades

- Generación de texto conversacional y de formato largo, orientada a instrucciones.
- Modo "uncensored/abliterated": menor probabilidad de rechazar peticiones que los modelos alineados estándar suelen declinar.
- Enrutamiento MoE configurable: el usuario puede ajustar el número de expertos por token para priorizar velocidad o calidad.
- Compatible con `text-generation-inference` y con endpoints compatibles (según los tags del repo).
- Soporte de plantillas de chat de Llama 3 (la model card remite a la repo GGUF para la plantilla exacta).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no documentadas; la familia Llama 3.2 es multilingüe, pero no hay confirmación específica para este merge.

## Casos de uso

- Generación creativa y escritura de ficción: el ajuste "uncensored" y la mezcla de expertos permiten producir narrativa sin las restricciones típicas de los modelos alineados, útil en talleres literarios y experimentación creativa.
- Roleplay y personajes conversacionales: la model card cita explícitamente el roleplay como caso de uso y remite a guías de parámetros y samplers para optimizarlo en aplicaciones como SillyTavern, LM Studio o text-generation-webui.
- Despliegue local en hardware de consumo: al ser un MoE con 2 expertos activos por defecto, el coste por token es menor que el de un modelo denso de 18B, lo que facilita su ejecución en GPU de gama alta de consumo mediante GGUF cuantizado.
- Experimentación con arquitecturas MoE: investigadores pueden modificar `num_experts_per_tok` y medir el impacto en latencia y calidad, usando el modelo como banco de pruebas de enrutamiento.
- Generación de texto en pipelines de inferencia con TGI: los tags indican compatibilidad con text-generation-inference y endpoints compatibles, lo que permite servirlo detrás de una API estándar.
- Base para merges y fine-tuning posteriores: al distribuirse en safetensors de precisión completa, sirve como punto de partida para nuevas fusiones con MergeKit o para cuantizaciones personalizadas con llama.cpp.
- Evaluación comparativa de técnicas de ablación: útil para estudiar cómo la eliminación de la dirección de rechazo afecta a la calidad y la seguridad de las respuestas en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en precisión completa (FP16/BF16): aproximadamente 36,8 GB solo para pesos, más overhead de activaciones y KV cache; requiere GPU de 48 GB o más (A6000, A100 80 GB, H100).
- Cuantización a 8 bits: en torno a 18-20 GB de VRAM; cabe en RTX 4090 (24 GB) con contexto moderado.
- Cuantización a 4 bits (Q4_K_M): aproximadamente 10-12 GB de VRAM; cabe en RTX 3090, RTX 4080, RTX 4090 y GPUs de 12-16 GB con contexto reducido.
- Al ser MoE con 2 expertos activos, el throughput por token es más favorable que un denso de 18B, aunque la VRAM residente sigue siendo la del total de parámetros.
- Opciones de despliegue: transformers (fuente), llama.cpp / llama-server, LM Studio, text-generation-webui, KoboldCpp, text-generation-inference (TGI) y vLLM (sujeto a soporte del merge MoE concreto).
- Latencia y throughput exactos: no disponibles; la model card indica que los tokens por segundo varían al cambiar el número de expertos por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Llama-3.2-8X3B-MOE-Dark-Champion (este modelo) | ≈18,4B (MoE, 8 expertos de 3B) | No disponible | No disponible | Hugging Face (safetensors + GGUF) | Merge comunitario, uncensored/abliterated, sin benchmarks |
| Llama 3.2 3B Instruct (Meta) | 3B denso | 128K (según Meta) | Llama 3.2 Community License | Hugging Face, amplio ecosistema | Modelo oficial, alineado, benchmarks publicados |
| Llama 3.1 8B Instruct (Meta) | 8B denso | 128K (según Meta) | Llama 3.1 Community License | Hugging Face, amplio ecosistema | Referencia densa de tamaño intermedio, benchmarks publicados |
| Mixtral 8x7B (Mistral AI) | ≈46,7B (MoE, 8 expertos de 7B) | 32K | Apache 2.0 | Hugging Face | MoE de referencia en código abierto, benchmarks publicados |

La comparación directa es difícil porque este modelo no publica benchmarks ni licencia clara; los modelos oficiales de Meta y Mistral ofrecen garantías de licencia, documentación y evaluación que este merge comunitario no proporciona.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad frente a los modelos base.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; el campo `base_model` vacío impide verificar la licencia heredada de Llama 3.2.
- Modelo "uncensored/abliterated": la ablación de la dirección de rechazo puede aumentar la probabilidad de generar contenido dañino, sesgado o inexacto, y dificulta su uso en entornos con requisitos de seguridad.
- Riesgo de alucinación inherente a modelos de este tamaño y a los merges sin evaluación rigurosa.
- Idiomas soportados no documentados; el rendimiento fuera del inglés es incierto.
- Longitud de contexto no especificada en la información disponible; la model card remite a la repo GGUF.
- Sin información sobre sesgos, datos de entrenamiento ni proceso de alineación.
- El ajuste de `num_experts_per_tok` altera el rendimiento y la calidad; requiere validación por parte del usuario.
- La model card está orientada a promocionar guías de parámetros y samplers del autor, no a documentar técnicamente el modelo.
- No recomendado para producción crítica sin una evaluación propia exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B
- Repo GGUF del mismo modelo: https://huggingface.co/DavidAU/Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B-gguf
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Perfil del autor en Hugging Face: https://huggingface.co/DavidAU
- MergeKit (Arcee AI): https://github.com/arcee-ai/mergekit
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
- KoboldCpp: https://github.com/LostRuins/koboldcpp
- SillyTavern: https://github.com/SillyTavern/SillyTavern
