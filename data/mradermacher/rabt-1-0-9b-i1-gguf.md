# mradermacher/Rabt-1.0-9B-i1-GGUF

## Resumen

Rabt 1.0 9B es un modelo de lenguaje de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) desarrollado por 4waiz y publicado bajo licencia Apache 2.0. Está diseñado específicamente como asistente personal de ejecución local ("local-first"), con un enfoque explícito en privacidad, uso de herramientas (tool-use), razonamiento agéntico y flujos con intervención humana ("human-in-the-loop"). El modelo se entrenó mediante QLoRA sobre una base no especificada en la información disponible, y declara soporte multilingüe para inglés, árabe, francés, hindi y urdu.

La ficha que nos ocupa corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, que ofrece un conjunto amplio de cuantizaciones con calibración imatrix (Q2_K hasta Q6_K, incluyendo variantes IQ). Esta es la vía práctica para ejecutar el modelo en hardware de consumo mediante llama.cpp u Ollama, dado que los pesos originales en safetensors requieren más VRAM.

El modelo resulta relevante para desarrolladores que necesitan un asistente local con capacidades de agente y tool calling, con cobertura de idiomas poco habituales en modelos abiertos (árabe, urdu, hindi) y una licencia permisiva que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles específicos no disponibles) |
| Parámetros totales | 9.197.093.888 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (calibradas con imatrix) |
| Idiomas soportados | en, ar, fr, hi, ur |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de tratarse de un transformer de 9,2 mil millones de parámetros. El modelo base (4waiz/Rabt-1.0-9B) fue ajustado mediante QLoRA, según la etiqueta `qlora` de la model card, lo que indica un ajuste fino de bajo rango sobre un modelo preentrenado del que no se especifica el origen ni el número de tokens de entrenamiento.

Las cuantizaciones publicadas por mradermacher emplean calibración imatrix (importance matrix), lo que mejora la calidad de las cuantizaciones de baja precisión respecto a las estáticas. La model card no proporciona detalles sobre la composición del dataset de ajuste, el uso de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional orientada a asistencia personal.
- Tool calling / function calling, según las etiquetas `tool-use` y `agent` de la model card.
- Razonamiento agéntico multi-paso y flujos con intervención humana (`human-in-the-loop`).
- Soporte multilingüe declarado para inglés, árabe, francés, hindi y urdu.
- Orientación a ejecución local con prioridad de privacidad (`local-first`, `privacy`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) y despliegue vía Ollama.
- Capacidades de visión, audio o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Asistente personal local con privacidad: el modelo puede ejecutarse íntegramente en la máquina del usuario (vía Ollama o llama.cpp) sin enviar datos a servicios externos, adecuado para gestión de tareas, notas y conversaciones sensibles.
- Automatización de flujos con herramientas: gracias al soporte de tool calling, puede invocar APIs, gestionar ficheros o ejecutar acciones en un pipeline de agente controlando qué pasos requieren confirmación humana (human-in-the-loop).
- Atención multilingüe para comunidades de habla árabe, urdu e hindi: es uno de los pocos modelos abiertos de este tamaño que declara cobertura de estos idiomas, útil para asistentes de soporte en mercados con esas lenguas.
- Agentes de escritorio o IDE: integrable como motor de razonamiento en asistentes de desarrollo que necesitan llamar a herramientas locales (compiladores, linters, terminal) manteniendo los datos en local.
- Prototipado rápido en hardware de consumo: las cuantizaciones Q4_K_M (5,9 GB) permiten desplegar el modelo en GPUs de gama media para pruebas de concepto de asistentes conversacionales.
- Investigación en agentes con supervisión humana: su diseño explícito para human-in-the-loop lo hace adecuado para estudiar patrones de aprobación e intervención en pipelines agénticos.
- Despliegue en entornos con requisitos de soberanía de datos: al ser Apache 2.0 y ejecutable en local, encaja en organizaciones que no pueden usar APIs en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del fichero GGUF):
  - i1-Q2_K: ~4,0 GB
  - i1-IQ3_M / i1-Q3_K_S: ~4,5-4,6 GB
  - i1-Q4_K_M: ~5,9 GB (recomendado por el cuantizador como equilibrio velocidad/calidad)
  - i1-Q5_K_M: ~6,7 GB
  - i1-Q6_K: ~7,7 GB
- Pesos originales en safetensors: el repositorio del cuantizador ocupa 81,3 GB (incluye todas las variantes); el modelo base en FP16 requiere aproximadamente 18,4 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB o superior para cuantizaciones Q4/Q5; RTX 4090 (24 GB) para Q6_K o FP16 con margen; A100/H100 para despliegue en producción a mayor throughput.
- Cabe en GPU de consumo: sí, desde cuantizaciones Q2_K (~4 GB) en GPUs de 8 GB, y Q4_K_M (~5,9 GB) en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama (etiqueta `ollama`), y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas destacados | Licencia | Formato |
|---|---|---|---|---|---|
| Rabt 1.0 9B | 9,2 B | no disponible | en, ar, fr, hi, ur | Apache 2.0 | GGUF, safetensors |
| Gemma 2 9B | 9 B | 8K | multilingüe amplio | Gemma license | GGUF, safetensors |
| Llama 3.1 8B | 8 B | 128K | multilingüe (8 idiomas) | Llama 3.1 license | GGUF, safetensors |
| Qwen 2.5 7B | 7,6 B | 128K | multilingüe amplio | Apache 2.0 | GGUF, safetensors |

Nota: los datos de los modelos comparativos no provienen de la información proporcionada para este modelo y se incluyen solo como referencia de categoría; no se dispone de comparaciones de rendimiento publicadas para Rabt 1.0 9B.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que no es posible verificar el rendimiento real frente a modelos de tamaño similar.
- La longitud de contexto no está documentada, lo que dificulta planificar su uso en tareas de contexto largo.
- El ajuste mediante QLoRA sobre una base no especificada puede implicar degradación respecto al modelo original en tareas generales no relacionadas con asistencia personal.
- Riesgo de alucinación inherente a modelos de 9B; no hay datos sobre mitigaciones específicas.
- La cobertura de idiomas se limita a los cinco declarados (en, ar, fr, hi, ur); el rendimiento en castellano no está garantizado ni documentado.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar las condiciones del modelo base original (4waiz/Rabt-1.0-9B) antes de un despliegue en producción.
- Las cuantizaciones de baja precisión (Q2_K, IQ1, IQ2) pueden degradar notablemente la calidad; el propio cuantizador recomienda Q4_K_M o superiores.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Rabt-1.0-9B-i1-GGUF
- Modelo base: https://huggingface.co/4waiz/Rabt-1.0-9B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Rabt-1.0-9B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Rabt-1.0-9B-i1-GGUF
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
