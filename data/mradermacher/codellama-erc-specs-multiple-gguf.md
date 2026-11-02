# mradermacher/CodeLlama-ERC-Specs-Multiple-GGUF

## Resumen

CodeLlama-ERC-Specs-Multiple-GGUF es la versión cuantizada en formato GGUF del modelo gabrielnogueiralt/CodeLlama-ERC-Specs-Multiple, un ajuste fino (SFT) sobre la familia CodeLlama de Meta. El modelo original parte de CodeLlama con 6.738.546.688 parámetros (aproximadamente 6.700 millones, es decir, la variante de 7B) y ha sido entrenado mediante SFT con la librería TRL y el framework Unsloth, orientado a la generación de especificaciones técnicas del estándar ERC (Ethereum Request for Comments) y a tareas de código asociadas. Esta versión GGUF la publica mradermacher, un conocido cuantizador de la comunidad de HuggingFace, que genera quants estáticos para facilitar la inferencia local.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de nicho centrado en el dominio de contratos inteligentes y especificaciones ERC de Ethereum; por otro, muestra el flujo habitual de cuantización comunitaria que permite ejecutar un modelo de 7B en hardware de consumo. El repositorio GGUF ocupa 59,6 GB e incluye 12 variantes de cuantización, desde Q2_K (2,6 GB) hasta f16 (13,6 GB), lo que cubre desde GPUs de gama baja hasta configuraciones de servidor.

Es importante señalar que esta ficha describe la versión cuantizada, no el modelo base original: los detalles de entrenamiento, dataset y benchmarks del modelo original no están disponibles en la información proporcionada. La licencia declarada es Apache 2.0, heredada del modelo base, y el único idioma declarado es el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en CodeLlama de Meta) |
| Parámetros totales | 6.738.546.688 (≈6,7B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (quants estáticos); el modelo base en safetensors |
| Tamaño del repositorio | 59,6 GB |
| Descargas | 118 |
| Librería declarada | transformers |
| Fecha de creación | 2025-03-06 |
| Última actualización | 2026-11-02 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de CodeLlama, un transformer decoder-only con atención causal estándar, en su variante de aproximadamente 6,7B parámetros. El modelo original gabrielnogueiralt/CodeLlama-ERC-Specs-Multiple se obtuvo mediante ajuste fino supervisado (SFT) usando TRL y Unsloth sobre CodeLlama, según los tags del repositorio (unsloth, trl, sft). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO; tampoco se documentan innovaciones arquitectónicas adicionales más allá de las propias de CodeLlama.

Esta versión GGUF no introduce cambios en la arquitectura: mradermacher aplica cuantización estática post-entrenamiento (convert_type: hf, quantize_version: 2) y publica los pesos en formato GGUF listos para llama.cpp y derivados. En la model card se indica que no hay quants ponderados/imatrix disponibles en el momento de la publicación, solo quants estáticos. No se han documentado detalles sobre la calibración de la cuantización ni sobre pérdidas de perplejidad específicas para este modelo.

## Capacidades

- Generación de texto y código en inglés, con especialización declarada en especificaciones ERC (Ethereum Request for Comments) y contratos inteligentes.
- Ajuste fino supervisado orientado a tareas de documentación técnica y código del ecosistema Ethereum.
- Ejecución local mediante llama.cpp y otros runners compatibles con GGUF.
- Compatibilidad con text-generation-inference según los tags del repositorio.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documenta modo thinking, visión, audio ni otras modalidades.
- Capacidades multilingües limitadas al inglés según el campo language.
- No se dispone de información sobre capacidades de razonamiento matemático avanzado más allá de las heredadas de CodeLlama.

## Casos de uso

- Generación de borradores de especificaciones ERC: el ajuste fino sobre documentación del estándar permite redactar propuestas técnicas con la estructura y terminología habituales del ecosistema Ethereum, útil para equipos que preparan EIPs.
- Asistencia en desarrollo de contratos inteligentes: el modelo puede completar y explicar fragmentos de Solidity relacionados con interfaces ERC, como ERC-20, ERC-721 o ERC-1155, en un entorno de desarrollo local.
- Documentación técnica de protocolos: generación de descripciones de interfaces y eventos para repositorios de contratos, reduciendo el trabajo manual de redacción.
- Inferencia en hardware de consumo: con quants Q4_K_M (4,2 GB) el modelo cabe en GPUs de 8 GB de VRAM, lo que permite prototipar en un portátil con RTX 3060/4060 sin conexión a la nube.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente mediante llama.cpp, el código y las especificaciones no salen de la infraestructura del equipo, adecuado para auditorías de seguridad.
- Experimentación académica sobre ajuste fino de dominio: sirve como caso de estudio de SFT con Unsloth y de cuantización comunitaria para investigadores que analizan la degradación de calidad entre quants.
- Integración en pipelines de documentación: el modelo puede alimentar generadores de documentación estática para repositorios de contratos, produciendo texto en inglés a partir de las firmas de funciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de generación de código o especificaciones ERC, y tampoco se dispone de datos del modelo base original.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del quant):
  - Q2_K: 2,6 GB
  - Q3_K_S: 3,0 GB
  - Q3_K_M: 3,4 GB
  - Q3_K_L: 3,7 GB
  - IQ4_XS: 3,7 GB
  - Q4_K_S: 4,0 GB
  - Q4_K_M: 4,2 GB
  - Q5_K_S: 4,8 GB
  - Q5_K_M: 4,9 GB
  - Q6_K: 5,6 GB
  - Q8_0: 7,3 GB
  - f16: 13,6 GB
- GPU recomendadas: para Q4_K_M basta una RTX 3060 de 8 GB o superior; para Q8_0 se recomienda una RTX 4070/4080 de 12-16 GB; para f16, una RTX 4090 de 24 GB o una A100/H100 en entornos de servidor.
- Cabe en GPU de consumo: sí, en todas las variantes hasta Q8_0 con GPUs de 8-12 GB; f16 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (según tags), y cualquier runtime compatible con GGUF. Los quants multi-parte deben concatenarse según las instrucciones de los README de TheBloke referenciados en la model card.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CodeLlama-ERC-Specs-Multiple (este, GGUF) | ≈6,7B | no disponible | Apache 2.0 | GGUF | Ajuste fino de dominio ERC sobre CodeLlama |
| CodeLlama-7B (base de Meta) | ≈6,7B | no disponible en esta ficha | Llama 2 Community License | safetensors, GGUF | Modelo generalista de código; el ajuste ERC parte de él |
| CodeLlama-7B-Instruct | ≈6,7B | no disponible en esta ficha | Llama 2 Community License | safetensors, GGUF | Variante instruida generalista, sin especialización ERC |

La comparación se limita a la familia CodeLlama porque no se dispone de datos de benchmarks ni de contexto que permitan contrastar con alternativas de otros linajes (Qwen2.5-Coder, DeepSeek-Coder, StarCoder2). No se han publicado métricas comparativas en la información disponible.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Es un ajuste fino de nicho sobre ERC: fuera del dominio de especificaciones Ethereum y código Solidity, su rendimiento puede degradarse respecto a CodeLlama base.
- Riesgo de alucinación en la generación de especificaciones técnicas: puede inventar números de ERC, firmas de funciones o detalles normativos inexistentes; requiere revisión humana.
- Los quants de baja precisión (Q2_K, Q3_K_M) pueden degradar notablemente la calidad; la model card califica Q3_K_M como "lower quality".
- No hay quants imatrix/ponderados disponibles, lo que limita la calidad máxima alcanzable en tamaños pequeños frente a otras publicaciones.
- La licencia Apache 2.0 se declara en el repositorio, pero conviene verificar la compatibilidad con la licencia del CodeLlama original de Meta, que usa Llama 2 Community License, antes de un uso comercial.
- No se documentan sesgos específicos, pero al derivar de CodeLlama hereda los sesgos de sus datos de entrenamiento, no disponibles en esta ficha.
- No se dispone de información sobre la longitud de contexto efectiva del ajuste fino; no asumir la ventana de CodeLlama sin verificación.
- El repositorio tiene solo 118 descargas y 0 likes, lo que indica escasa validación comunitaria; tratar como modelo experimental.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CodeLlama-ERC-Specs-Multiple-GGUF
- Modelo base: https://huggingface.co/gabrielnogueiralt/CodeLlama-ERC-Specs-Multiple
- Página de descargas del cuantizador: https://hf.tst.eu/model#CodeLlama-ERC-Specs-Multiple-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de quants: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de quant: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
