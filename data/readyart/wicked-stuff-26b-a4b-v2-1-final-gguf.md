# ReadyArt/Wicked-Stuff-26B-A4B-v2.1-Final-GGUF

## Resumen

Wicked-Stuff-26B-A4B-v2.1-Final-GGUF es la distribución en formato GGUF del modelo ReadyArt/Wicked-Stuff-26B-A4B-v2.1-FINAL, un modelo de generación de texto desarrollado por el usuario ReadyArt y orientado explícitamente a contenido para adultos: roleplay conversacional, ficción erótica, terror y violencia gráfica. El repositorio contiene únicamente los pesos cuantizados (el modelo base se distribuye por separado) y está etiquetado como `not-for-all-audiences` y `nsfw`. El modelo se presenta como "unaligned", es decir, sin el alineamiento de seguridad habitual en modelos comerciales.

El recuento real de parámetros en safetensors es de 25.233.142.046 (unos 25,2 mil millones), pese al "26B" del nombre comercial. El sufijo "A4B" sugiere una arquitectura de mezcla de expertos (MoE) con un número reducido de parámetros activos por token, pero la información disponible no confirma ni la arquitectura ni el número exacto de parámetros activos, la longitud de contexto o los datos de entrenamiento.

El modelo es relevante para un nicho concreto: creadores de contenido narrativo adulto y desarrolladores de aplicaciones de rol conversacional que necesitan un modelo local, sin filtros de rechazo y ejecutable en hardware de consumo mediante cuantización. El repositorio, de 262,8 GB, agrupa varias cuantizaciones GGUF, aunque en el momento de redactar esta ficha no registra descargas ni interacciones. La model card publicada no contiene documentación técnica: es una página HTML con estilos CSS y una lista de etiquetas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el sufijo "A4B" del nombre sugiere MoE con pocos parámetros activos, sin confirmar) |
| Parámetros totales | 25.233.142.046 (≈25,2 B), dato real de safetensors |
| Parámetros activos | No disponible (no confirmado que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF en varias cuantizaciones (el repo ocupa 262,8 GB y contiene múltiples ficheros); los niveles concretos no se detallan en la información disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantización); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La model card publicada no incluye descripción de la topología (transformer denso, MoE, híbrido), ni del tokenizador, ni de la ventana de contexto nativa. El único dato estructural fiable es el recuento de parámetros del modelo base (25,2 B) y el hecho de que el repositorio es una cuantización GGUF del mismo, con relación `base_model_relation: quantized`.

Tampoco hay datos sobre el proceso de entrenamiento: número de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas de ajuste, ni innovaciones técnicas destacables. Las etiquetas `unaligned` e `instruct` indican que el modelo está ajustado para seguir instrucciones y que no se ha aplicado (o se ha aplicado de forma deliberadamente laxa) el alineamiento de seguridad habitual. Cualquier afirmación adicional sobre el entrenamiento sería especulativa.

## Capacidades

- Generación de texto conversacional e instructivo en inglés, con ajuste específico para diálogo multi-turno.
- Roleplay y caracterización de personajes: mantener una persona, estilo y registro a lo largo de la conversación.
- Escritura de ficción erótica y contenido explícito para adultos, sin filtros de rechazo declarados (`unaligned`).
- Narrativa de terror y violencia gráfica, según las etiquetas `Horror` y `Violence`.
- Escritura creativa en general: descripción, diálogo, ritmo narrativo y continuidad argumental.
- Capacidad de instrucción (`instruct`): seguir consignas de formato, tono y longitud dentro del prompt.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" o razonamiento explícito: no disponible.
- Multilingüismo: limitado al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Roleplay conversacional local: el modelo está ajustado para mantener personajes y contexto narrativo en diálogos largos; se desplegaría con llama.cpp u Ollama sobre una instancia privada, evitando enviar contenido sensible a APIs de terceros.
- Escritura asistida de ficción erótica: útil para autores que necesitan borradores, variaciones de escena o diálogo con un registro explícito que los modelos alineados suelen rechazar.
- Desarrollo de videojuegos de rol por texto: integración como motor de diálogo de PNJ en aventuras conversacionales o novelas visuales, con el modelo ejecutándose en la máquina del jugador o en un servidor propio.
- Generación de contenido para comunidades de ficción interactiva: bots de personaje en Discord o aplicaciones web de chat, donde la licencia Apache 2.0 permite uso comercial sin regalías.
- Prototipado de narrativa de terror: generación de descripciones atmosféricas, giros argumentales y violencia explícita para guiones de relatos o campañas de rol de mesa.
- Base para fine-tuning posterior: al ser Apache 2.0 y distribuirse en GGUF, sirve como punto de partida para ajustes con LoRA sobre un estilo o personaje concreto, aunque la falta de documentación sobre la arquitectura complica el proceso.
- Análisis de robustez y seguridad: investigador que quiera estudiar el comportamiento de modelos sin alineamiento en dominios sensibles, con fines de evaluación de riesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (25,2 B de parámetros, estimaciones orientativas): en FP16 fuera del alcance del repo GGUF, en torno a 50 GB; Q8_0 ≈27 GB; Q6_K ≈21 GB; Q5_K_M ≈18 GB; Q4_K_M ≈15-16 GB; Q3_K_M ≈12 GB; Q2_K ≈9-10 GB.
- GPU recomendadas: A100 80 GB o H100 para FP16 y Q8; L40S, RTX 6000 Ada o A6000 (48 GB) para cuantizaciones altas con contexto largo; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado.
- GPU de consumo: sí, cabe en RTX 4090/3090 (24 GB) con Q4_K_M o Q5_K_M; en tarjetas de 12-16 GB (RTX 4070 Ti, 4080, 4060 Ti 16 GB) solo con Q3_K_M o Q2_K, con pérdida de calidad apreciable.
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y llama-cpp-python son las opciones naturales para GGUF. vLLM y TGI tienen soporte de GGUF limitado o experimental; para producción a gran escala conviene partir del modelo base en safetensors.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, un modelo de ~25 B con ~4 B activos (si se confirma la hipótesis MoE) sería sustancialmente más rápido que un denso de 25 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Orientación | Rendimiento |
|---|---|---|---|---|---|
| Wicked-Stuff-26B-A4B-v2.1-Final | 25,2 B totales; activos no disponibles | No disponible | Apache 2.0 | NSFW, roleplay, sin alineamiento | No disponible |
| Qwen3-30B-A3B | 30,5 B totales, 3,3 B activos (MoE) | 32 768 nativo, ampliable | Apache 2.0 | Generalista, alineado | Benchmarks públicos en la model card original |
| Mistral Small 3 (24B) | 24 B densos | 32 768 | Apache 2.0 | Generalista, alineado | Benchmarks públicos en la model card original |
| Gemma 2 27B | 27 B densos | 8 192 | Licencia Gemma (uso comercial con restricciones) | Generalista, alineado | Benchmarks públicos en la model card original |

Los datos de los modelos comparables provienen de sus respectivas documentaciones públicas; para Wicked-Stuff no hay mediciones publicadas, por lo que la comparación solo puede establecerse en términos de tamaño, licencia y orientación de uso. La diferencia principal no es de rendimiento bruto, sino de propósito: los tres alternativos están alineados y rechazarán contenido explícito, mientras que este modelo está diseñado para producirlo.

## Limitaciones y advertencias

- Contenido para adultos: el modelo genera material sexual explícito, violencia gráfica y terror; no es apto para menores ni para entornos sin moderación.
- Ausencia de alineamiento: al estar etiquetado como `unaligned`, no incorpora los mecanismos de rechazo habituales; puede producir contenido dañino, ilegal o éticamente problemático sin filtro previo.
- Riesgo de alucinación: no hay datos de evaluación; en modelos de rol es frecuente la inconsistencia de hechos, la pérdida de coherencia en conversaciones largas y la invención de detalles del personaje o del mundo.
- Idioma: solo inglés declarado; el rendimiento en castellano es impredecible y probablemente degradado.
- Contexto desconocido: sin ventana documentada, no se puede garantizar memoria a largo plazo en roleplay multi-turno; conviene probar empíricamente el punto de truncamiento.
- Documentación inexistente: la model card es una página HTML/CSS sin especificaciones; no hay información sobre arquitectura, dataset ni evaluación, lo que dificulta la reproducibilidad y la auditoría.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero no exime del cumplimiento de la legislación aplicable sobre contenido sexual, violencia o protección de menores en la jurisdicción de despliegue.
- Producción: 0 descargas y 0 interacciones en el momento de la ficha; sin comunidad ni soporte, y sin garantías de mantenimiento del repositorio.
- Cuantización: las versiones Q2_K y Q3_K_M degradan de forma notable la coherencia narrativa; para uso serio conviene Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-v2.1-Final-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-v2.1-FINAL
- Versión anterior (v2.0): https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-v2.0-Final-GGUF
- Versión Final (GGUF): https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-Final-GGUF
- Perfil del autor en BenchmarkList: https://benchmarklist.com/providers/readyart/
- Perfil del autor en modelindex.dev: https://modelindex.dev/orgs/ReadyArt
- Paper, blog técnico o demo: no disponibles.
