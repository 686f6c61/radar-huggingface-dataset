# dsdsdewe/Qwensploit-V2-27B-heretic-GGUF

## Resumen

Qwensploit-V2-27B-heretic-GGUF es una distribución de cuantizaciones GGUF del modelo `dsdsdewe/Qwensploit-V2-27B-heretic`, un derivado de `xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8` al que se le ha aplicado una ablación de comportamiento con la herramienta Heretic para reducir la tasa de rechazos (refusals). El modelo está construido sobre Qwen3.8-27B, de Alibaba Cloud, y conserva la modalidad image-text-to-text, es decir, acepta tanto texto como imágenes. Cuenta con 27.320.697.856 parámetros totales (unos 27,3 mil millones) y se distribuye exclusivamente en formato GGUF, con un repositorio de 102,8 GB.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto experimental de investigación en ciberseguridad con capacidad multimodal; por otro, ilustra el patrón de "hereticación", una técnica de ablación que modifica los pesos para eliminar direcciones de activación asociadas a rechazos sin reentrenar. El autor advierte explícitamente de que los ficheros se convirtieron sin evaluación posterior, por lo que la calidad de cada nivel de cuantización está sin probar.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a investigación autorizada en seguridad, educación y herramientas de análisis. No dispone de model card propia más allá de la conversión; toda la información de método, evaluación y licencia remite al repositorio base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Qwen3.8-27B; detalles no disponibles en la información proporcionada) |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M; proyector de visión en F16 |
| Idiomas soportados | No disponible |
| Licencia | `other` (`see-base-models`); el modelo base inmediato no especifica términos y su upstream Qwen3.8-27B es Apache 2.0 |
| Formato de pesos | GGUF (no se ofrece BF16 GGUF; los pesos completos están en safetensors en el repo original) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B, un transformer denso de aproximadamente 27,3 mil millones de parámetros. Sobre esa base, `xtools-at` realizó un ajuste fino orientado a ciberseguridad (`Qwensploit-V2-27B-CyberSecurity-Qwen3.8`), y posteriormente `dsdsdewe` aplicó Heretic, una herramienta de ablación que localiza y neutraliza direcciones de activación responsables de los rechazos, reduciendo el comportamiento de negativa sin un reentrenamiento completo. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

En cuanto a la conversión, los ficheros GGUF se generaron con llama.cpp. El Q8_0 se convirtió directamente desde los pesos safetensors, mientras que Q6_K, Q5_K_M, Q4_K_M y Q3_K_M se obtuvieron por recuantización desde Q8_0 con `--allow-requantize`, lo que según el autor puede degradar ligeramente la calidad frente a una cuantización directa desde BF16. Se incluye además un proyector multimodal (`mmproj-...-F16.gguf`) necesario para la entrada de imágenes. No hay innovaciones técnicas documentadas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `conversational`).
- Entrada de imágenes junto con texto (image-text-to-text), mediante el proyector mmproj en F16.
- Ajuste específico para tareas de ciberseguridad (análisis, tooling, educación en seguridad).
- Comportamiento de rechazo reducido mediante ablación con Heretic, lo que amplía el rango de peticiones que el modelo atiende.
- Compatibilidad con endpoints (`endpoints_compatible`) y aplicaciones GGUF (LM Studio, Ollama, Jan, llama.cpp).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Análisis de vulnerabilidades asistido: el modelo puede revisar fragmentos de código o descripciones de sistemas y proponer hipótesis de fallos, aprovechando su ajuste específico en ciberseguridad; requiere revisión humana de cada salida.
- Investigación autorizada en seguridad ofensiva/defensiva: útil en laboratorios y entornos de pentesting con permiso explícito, donde la reducción de rechazos permite explorar técnicas que un modelo alineado estándar bloquearía.
- Formación y concienciación: generación de escenarios, explicaciones de vectores de ataque y material didáctico para cursos de seguridad, con la ventaja de la modalidad imagen-texto para interpretar diagramas de red o capturas.
- Análisis de capturas y diagramas: gracias al proyector de visión, puede describir o razonar sobre imágenes de configuraciones, paneles o topologías aportadas por el analista.
- Asistente local de análisis técnico: desplegado con llama.cpp u Ollama en una estación de trabajo, permite consultas sobre logs, configuraciones y scripts sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Automatización de triaje en pipelines de seguridad: integrado como paso de generación en herramientas internas que clasifican alertas o resumen informes, siempre con validación posterior por un analista.
- Experimentación con técnicas de ablación: sirve como caso de estudio para investigadores interesados en medir el efecto de Heretic sobre la tasa de rechazos y la calidad en un modelo de 27B multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que los ficheros se convirtieron sin evaluación posterior y que la calidad en cada nivel de cuantización está sin probar.

## Requisitos de hardware

- VRAM/RAM estimada (según el autor, más espacio para el contexto):
  - Q4_K_M: ~16 GB
  - Q5_K_M: ~19 GB
  - Q6_K: ~22 GB
  - Q8_0: ~29 GB
  - Proyector de visión F16: consumo adicional no especificado.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, Q4_K_M encaja en GPUs consumer de 24 GB (RTX 3090/4090) y Q8_0 requiere ~29 GB, por lo que necesita A100 40 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU consumer: sí, en los niveles Q4_K_M y Q5_K_M con GPUs de 24 GB; Q6_K en 24 GB es ajustado y Q8_0 no cabe en una sola GPU consumer.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli` para imágenes), LM Studio, Ollama, Jan y otras aplicaciones compatibles con GGUF. Se requiere una build reciente de llama.cpp con soporte para Qwen3.5/3.8.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwensploit-V2-27B-heretic-GGUF | 27,3B | No disponible | Texto + imagen | `other` (see-base-models) | GGUF en HF |
| Qwen3.8-27B (upstream) | ~27B | No disponible | Texto (según información disponible) | Apache 2.0 | Pesos en HF |
| Qwensploit-V2-27B-CyberSecurity-Qwen3.8 | ~27B | No disponible | Texto + imagen | `other` | Pesos en HF |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Artefacto experimental: los ficheros se convirtieron sin evaluación, por lo que no hay garantía de calidad en ningún nivel de cuantización.
- La reducción de rechazos no mejora la precisión: el modelo puede producir salidas incorrectas, sesgadas o inseguras; las respuestas de seguridad deben revisarse por una persona.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible.
- Los ficheros Q6_K, Q5_K_M, Q4_K_M y Q3_K_M se recuantizaron desde Q8_0, lo que puede degradar la calidad frente a una conversión directa desde BF16.
- Licencia ambigua: el modelo base inmediato usa `license: other` sin términos explícitos, y solo el upstream Qwen3.8-27B es Apache 2.0; no deben asumirse derechos no concedidos. No es asesoramiento legal.
- Idiomas soportados y longitud de contexto no documentados, lo que dificulta planificar despliegues multilingües o con contexto largo.
- Uso responsable: el autor restringe el uso previsto a investigación autorizada, educación y tooling; el usuario es responsable del cumplimiento legal.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/dsdsdewe/Qwensploit-V2-27B-heretic-GGUF
- Modelo base (safetensors): https://huggingface.co/dsdsdewe/Qwensploit-V2-27B-heretic
- Modelo de ciberseguridad original: https://huggingface.co/xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8
- Licencia referenciada: https://huggingface.co/xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Heretic: https://github.com/p-e-w/heretic
- Qwen Team en Hugging Face: https://huggingface.co/Qwen
