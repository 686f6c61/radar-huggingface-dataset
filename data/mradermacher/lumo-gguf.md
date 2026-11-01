# mradermacher/Lumo-GGUF

## Resumen

Este repositorio contiene cuantizaciones estáticas en formato GGUF del modelo Lumo, desarrollado por LumoAI-Kurd, realizadas por el cuantizador mradermacher, un colaborador conocido en la comunidad de Hugging Face por generar versiones optimizadas de modelos populares. Lumo es un modelo de lenguaje de tamaño muy reducido, con aproximadamente 82 millones de parámetros, entrenado en inglés y publicado bajo licencia MIT.

La relevancia de esta ficha radica en la disponibilidad de cuantizaciones que permiten ejecutar el modelo en hardware extremadamente limitado: todas las versiones cuantizadas ocupan alrededor de 0,2 GB, lo que lo hace viable incluso en CPUs modestas, Raspberry Pi o móviles. El modelo base original está disponible en LumoAI-Kurd/Lumo y este repositorio no añade entrenamiento adicional, solo conversión de formato.

Al tratarse de un modelo tan pequeño y sin model card detallada del autor original, la información sobre arquitectura, datos de entrenamiento y capacidades es muy limitada. Los usuarios interesados deberán evaluarlo empíricamente antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, según librería transformers) |
| Parametros totales | 81.912.576 (~82 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (modelo base en safetensors/transformers) |

## Arquitectura y entrenamiento

El repositorio no incluye documentación sobre la arquitectura concreta del modelo base LumoAI-Kurd/Lumo. Se sabe únicamente que el modelo base fue entrenado con la librería transformers de Hugging Face y que consta de 81.912.576 parámetros según los metadatos de safetensors, lo que lo sitúa en la categoría de modelos pequeños (similar en escala a Qwen2.5-0.5B o SmolLM2-135M, aunque algo mayor que estos últimos).

No hay información disponible sobre el número de tokens de entrenamiento, composición del dataset, ni sobre el uso de técnicas de alineación como RLHF o DPO. El trabajo de mradermacher se limita a la cuantización estática en GGUF mediante conversión desde el formato original de Hugging Face; no se han publicado cuantizaciones weighted/imatrix en el momento de redacción de la model card.

## Capacidades

Dado que la model card del modelo base no detalla sus capacidades, solo pueden afirmarse los siguientes puntos:

- Generación de texto en inglés (idioma declarado en los metadatos).
- Compatibilidad con el ecosistema llama.cpp y derivados gracias al formato GGUF.
- Ejecución en hardware muy limitado debido a su tamaño reducido (~82 M parámetros, ~0,2 GB por cuantización).
- No hay información disponible sobre: razonamiento, código, matemáticas, tool calling, agentes, capacidades multilingües, visión o audio.

## Casos de uso

- Experimentación en dispositivos de borde: con ~0,2 GB por cuantización, puede ejecutarse en Raspberry Pi, móviles antiguos o microcontroladores con SoC, siendo adecuado para prototipos de IA local sin conexión.
- Pruebas de pipelines de inferencia local: útil para validar configuraciones de llama.cpp, Ollama o LM Studio sin consumir apenas recursos de disco o memoria.
- Educación y aprendizaje: su tamaño lo hace ideal para que estudiantes exploren internamente un modelo de lenguaje completo, incluso cargándolo en memoria para inspección o fine-tuning en GPUs de consumo.
- Integración en aplicaciones con presupuesto de memoria estricto: puede incrustarse en aplicaciones de escritorio que necesiten generación de texto básica en inglés sin depender de la nube.
- Baseline para benchmarks de cuantización: al disponer de doce niveles de cuantización del mismo modelo, sirve como sujeto de pruebas para comparar la degradación de calidad entre Q2_K y f16.
- Prototipado rápido de chatbots simples en inglés: para demos donde la calidad del texto no es crítica y se prioriza la latencia y el consumo mínimo de recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 0,2 GB (Q2_K) y 0,3 GB (f16) solo de pesos; con contexto y overhead de ejecución, basta con 1 GB de RAM en prácticamente cualquier cuantización.
- GPU recomendadas: no requiere GPU; puede ejecutarse íntegramente en CPU gracias al formato GGUF. Cualquier GPU moderna lo acelerará sin esfuerzo.
- Consumer GPUs: cabe con holgura en cualquier GPU, incluidas integradas; no es un factor limitante en ningún hardware actual.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, GPT4All, koboldcpp y cualquier runtime compatible con GGUF. También puede cargarse el modelo base con transformers.
- Latencia y throughput: no disponible; dada la escala del modelo (~82 M parámetros), se espera inferencia muy rápida incluso en CPUs modestas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| Lumo (esta ficha) | ~82 M | GGUF (12 cuants) | MIT | no disponible | Cuantizado por mradermacher |
| SmolLM2-135M (HuggingFaceTB) | 135 M | safetensors, GGUF comunitarios | Apache 2.0 | 2.048 tokens | Mejor documentado, benchmarks publicados |
| Qwen2.5-0.5B (Alibaba) | 494 M | safetensors, GGUF comunitarios | Qwen (comercial permitido con condiciones) | 32.768 tokens | Multilingüe, capacidades amplias |
| Qwen2.5-0.5B-Instruct | 494 M | safetensors, GGUF comunitarios | Qwen | 32.768 tokens | Alineado con instrucciones |

Lumo es notablemente más pequeño que las alternativas citadas y carece de la documentación y validación pública de estas, por lo que se recomienda tratarlo como un modelo experimental.

## Limitaciones y advertencias

- Falta de documentación: la model card del modelo base no describe arquitectura, datos de entrenamiento ni limitaciones, lo que dificulta evaluar su idoneidad.
- Riesgo de alucinación elevado: al tratarse de un modelo de ~82 M de parámetros sin información sobre alineación, la calidad y fiabilidad de sus respuestas será muy inferior a la de modelos instruct de 0,5B-7B.
- Idioma: declarado solo para inglés; no hay soporte documentado para castellano u otras lenguas.
- Contexto: la longitud de ventana de contexto no está documentada, lo que impide planificar aplicaciones con documentos largos.
- Cuantizaciones estáticas: no hay versiones imatrix/weighted disponibles; las cuantizaciones más agresivas (Q2_K, Q3_K) pueden degradar notablemente la calidad en un modelo ya pequeño.
- Licencia: MIT, sin restricciones para uso comercial, pero esto no garantiza la calidad ni la procedencia de los datos de entrenamiento.
- Popularidad muy baja: con 286 descargas y 0 likes en el momento de la ficha, existe poca validación comunitaria y posible riesgo de abandono del proyecto.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Lumo-GGUF
- Modelo base: https://huggingface.co/LumoAI-Kurd/Lumo
- Visor de descargas de mradermacher: https://hf.tst.eu/model#Lumo-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referenciada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa colaboradora (nethype GmbH): https://www.nethype.de/
