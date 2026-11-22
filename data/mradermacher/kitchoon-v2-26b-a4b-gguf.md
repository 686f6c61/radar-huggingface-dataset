# mradermacher/Kitchoon-V2-26B-A4B-GGUF

## Resumen

Kitchoon-V2-26B-A4B-GGUF es la versión cuantizada en formato GGUF del modelo Kitchoon-V2-26B-A4B, desarrollado originalmente por el usuario SubMaroon y convertido a GGUF por mradermacher. Se trata de un modelo de arquitectura MoE (mezcla de expertos) derivado de la familia Gemma 4, con 25.971.339.550 parámetros totales y aproximadamente 4.000 millones de parámetros activos por token (de ahí el sufijo A4B). El modelo está orientado específicamente a roleplay y conversación, con un ajuste fino que incluye técnicas "heretic" y "uncensored" para reducir los rechazos en contenido creativo.

La relevancia de esta ficha radica en que ofrece una alternativa de despliegue local para escenarios de roleplay y narrativa interactiva, con licencia Apache 2.0 y múltiples cuantizaciones que permiten ejecutarlo en hardware de consumo. Al estar basado en Gemma 4, hereda las capacidades generales de dicha familia, aunque el ajuste fino está claramente orientado a conversación y personajes.

El repositorio GGUF incluye 11 cuantizaciones estáticas (desde Q2_K de 10,9 GB hasta Q8_0 de 27,7 GB), lo que facilita su uso con llama.cpp, Ollama y otras herramientas compatibles. No se dispone de información sobre benchmarks, composición del dataset de entrenamiento ni detalles del proceso de ajuste más allá de las etiquetas declaradas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) basada en Gemma 4, transformer |
| Parámetros totales | 25.971.339.550 |
| Parámetros activos | ~4.000 millones (A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura MoE derivada de Gemma 4, con 25.971 millones de parámetros totales y aproximadamente 4.000 millones activos por token. Esta configuración permite un equilibrio entre capacidad y coste computacional: solo se activa una fracción de los expertos en cada paso, lo que reduce el cómputo respecto a un modelo denso del mismo tamaño total. El sufijo "A4B" confirma este diseño de activación dispersa.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Las etiquetas del modelo indican un ajuste orientado a roleplay, con modificaciones "heretic" y "uncensored" que presumiblemente reducen los mecanismos de rechazo del modelo base, aunque no se documenta la metodología exacta. El modelo está declarado únicamente para inglés.

## Capacidades

- Generación de texto conversacional y narrativo, con especial énfasis en roleplay y personajes.
- Modo de conversación multi-turno, adecuado para sesiones prolongadas de interpretación de personajes.
- Ajuste "uncensored" que reduce los rechazos en contenido creativo y narrativo.
- Compatibilidad con SillyTavern, según la etiqueta declarada, lo que facilita su integración en frontends de roleplay.
- Capacidades generales heredadas de Gemma 4 (razonamiento, código y matemáticas), aunque no verificadas ni documentadas para esta variante.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: solo inglés declarado.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Roleplay conversacional en local: el modelo está específicamente ajustado para interpretar personajes y mantener conversaciones multi-turno, por lo que puede usarse con SillyTavern o interfaces similares para sesiones de rol narrativo sin depender de servicios en la nube.
- Escritura creativa asistida: la variante "uncensored" permite generar narrativa sin los rechazos típicos de modelos alineados de forma agresiva, útil para ficción, guiones y desarrollo de tramas.
- Prototipado de chatbots de personaje: gracias a su licencia Apache 2.0 y a las cuantizaciones GGUF, se puede desplegar en entornos de desarrollo para probar personalidades y flujos conversacionales antes de pasar a producción.
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_M (17,3 GB) o Q4_K_S (16,0 GB), el modelo puede ejecutarse en GPU de consumo con 24 GB de VRAM, como una RTX 4090, o en configuraciones con offloading a CPU.
- Generación de diálogos para videojuegos o narrativa interactiva: el ajuste a roleplay y la posibilidad de ejecución local permiten integrarlo en motores de juego o prototipos de ficción interactiva sin latencia de red.
- Experimentación con arquitecturas MoE: para investigadores que quieran estudiar el comportamiento de un MoE de ~26B con ~4B activos en tareas conversacionales, las cuantizaciones Q8_0 y Q6_K ofrecen una fidelidad cercana al modelo original con requisitos de memoria manejables.
- Evaluación de técnicas de "uncensoring": útil para estudiar cómo los ajustes heretic/uncensored afectan al comportamiento del modelo en comparación con el Gemma 4 base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K: ~10,9 GB
  - Q3_K_S: ~12,6 GB
  - Q3_K_M: ~13,7 GB
  - Q3_K_L: ~14,2 GB
  - IQ4_XS: ~14,6 GB
  - Q4_K_S: ~16,0 GB
  - Q4_K_M: ~17,3 GB
  - Q5_K_S: ~18,6 GB
  - Q5_K_M: ~19,7 GB
  - Q6_K: ~23,3 GB
  - Q8_0: ~27,7 GB
- GPU recomendadas: para Q8_0 y Q6_K se recomienda una A100 40 GB, H100 o RTX 4090 con 24 GB (Q6_K justo). Para Q4_K_M y Q4_K_S, una RTX 4090, RTX 3090 o RTX 4080 de 16 GB en adelante. Para cuantizaciones Q3 y Q2, GPU de 12-16 GB como RTX 4070 Ti o RTX 3060 de 12 GB.
- Cabe en GPU de consumo: sí, especialmente con cuantizaciones Q2 a Q4. La Q4_K_M (17,3 GB) requiere 24 GB de VRAM para residir completamente en GPU, o bien offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. También es posible usar el modelo base en safetensors con transformers, vLLM o TGI si se dispone de suficiente VRAM.
- Latencia y throughput: no disponibles. Al ser un MoE con ~4B activos, se espera un throughput superior al de un modelo denso de 26B, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Kitchoon-V2-26B-A4B | 25,97B | ~4B | no disponible | Apache 2.0 | GGUF, safetensors |
| Gemma 2 27B | 27B | denso | 8K | Gemma license | safetensors, GGUF |
| Mixtral 8x7B | 46,7B | ~12,9B | 32K | Apache 2.0 | safetensors, GGUF |
| Qwen2.5 32B | 32,5B | denso | 128K | Apache 2.0 | safetensors, GGUF |

La comparativa es aproximada: no se dispone de datos de rendimiento de Kitchoon-V2 que permitan una comparación cuantitativa. Frente a Gemma 2 27B, Kitchoon ofrece activación MoE más eficiente pero con licencia Apache 2.0 (más permisiva) y un ajuste específico para roleplay. Frente a Mixtral 8x7B, tiene menos parámetros totales y activos, lo que reduce requisitos de memoria. Frente a Qwen2.5 32B, la ventana de contexto es la principal incógnita, ya que no está documentada.

## Limitaciones y advertencias

- El ajuste "uncensored" y "heretic" puede producir contenido inapropiado, ofensivo o no alineado con políticas de uso en entornos comerciales o públicos; se recomienda evaluar su comportamiento antes de desplegarlo.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la falta de benchmarks que permitan estimar su fiabilidad en tareas factuales.
- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- La longitud de contexto no está disponible, lo que impide planificar despliegues que requieran ventanas largas.
- Aunque la licencia es Apache 2.0, el modelo base Gemma 4 puede estar sujeto a términos adicionales de Google; conviene verificar la licencia del modelo base SubMaroon/Kitchoon-V2-26B-A4B antes de uso comercial.
- No se documenta el proceso de entrenamiento ni la composición del dataset, lo que dificulta evaluar sesgos y riesgos de seguridad.
- Las cuantizaciones Q2 y Q3 pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso en producción.
- El repositorio tiene 187,7 GB, lo que requiere espacio de almacenamiento considerable si se descargan varias cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Kitchoon-V2-26B-A4B-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Kitchoon-V2-26B-A4B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Kitchoon-V2-26B-A4B-i1-GGUF
- Página de descarga del autor: https://hf.tst.eu/model#Kitchoon-V2-26B-A4B-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
