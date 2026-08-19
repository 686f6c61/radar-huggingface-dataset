# mradermacher/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16-i1-GGUF` es una cuantización GGUF (con imatrix) del modelo `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`, un derivado "abliterado" del modelo base `Qwen/Qwen3.8-27B` de Alibaba. La abliteración es una técnica que elimina las direcciones de activación responsables del rechazo de contenido, produciendo un modelo sin los alineamientos de seguridad habituales. El autor de esta cuantización, mradermacher, es conocido por generar versiones GGUF optimizadas para inferencia local.

Este modelo está pensado para desarrolladores e investigadores que necesitan un modelo de lenguaje de gran tamaño (27B según el nombre) sin restricciones de contenido, ejecutable en hardware local mediante llama.cpp, Ollama u otros motores compatibles con GGUF. Su relevancia radica en la combinación de un modelo base potente (Qwen3.8) con la eliminación de la censura, aunque esto conlleva riesgos importantes de uso indebido.

Cabe señalar una discrepancia: el campo de parámetros totales extraído del repositorio indica 3.391.984, un valor muy inferior a los 27B que sugiere el nombre. Es probable que se trate de un error en los metadatos del repositorio, pero al no disponer de confirmación, este dato debe tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.8-27B) |
| Parametros totales | No disponible (el nombre sugiere 27B, pero el repositorio indica 3.391.984, posible error) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | No disponible (hereda los de Qwen3.8, presumiblemente multilingue) |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16` es una abliteración del modelo `Qwen/Qwen3.8-27B`. La abliteración es un procedimiento de intervención en el espacio de activaciones del modelo que identifica y elimina las direcciones asociadas con el rechazo de solicitudes, manteniendo intactas las capacidades de razonamiento y generación. Según la información disponible, el proceso se realizó durante 72 horas de investigación con técnicas propias y metodologías publicadas. El modelo conserva el "vision tower" (torre de visión) sin modificar y el mecanismo MTP (Multi-Token Prediction) nativo de Qwen3.8.

La cuantización GGUF aplicada por mradermacher utiliza pesos con imatrix (importance matrix) para mejorar la calidad de la cuantización en los niveles bajos de bits. No se dispone de detalles sobre el dataset de entrenamiento ni sobre el proceso de ajuste fino adicional, más allá de la abliteración.

## Capacidades

- Generación de texto libre sin restricciones de contenido (modelo "uncensored").
- Razonamiento y resolución de problemas, heredados de la base Qwen3.8-27B.
- Capacidades de visión potencialmente disponibles, ya que el modelo base conserva el vision tower (aunque el GGUF puede no incluir el proyector de visión, `mmproj`).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y multi-step reasoning: no confirmado, pero probable dado el tamaño del modelo.
- Capacidades multilingües: no especificadas, pero Qwen3.8 suele soportar múltiples idiomas.

## Casos de uso

- Generación creativa sin filtros: escritura de ficción, poesía o guiones donde se requiere explorar temas sensibles o controvertidos sin restricciones automáticas.
- Roleplay y simulación de personajes: el modelo puede adoptar personalidades sin las limitaciones típicas de los modelos alineados, útil para juegos de rol o asistentes virtuales personalizados.
- Investigación en seguridad de IA: estudiar cómo se comporta un modelo sin alineamiento de seguridad puede ayudar a entender los riesgos de los sistemas de IA y a desarrollar mejores mecanismos de protección.
- Desarrollo de aplicaciones de nicho: herramientas de escritura asistida para autores que necesitan generar contenido adulto o de temática oscura (con las debidas advertencias legales).
- Pruebas de estrés de sistemas de moderación: evaluar la robustez de los filtros de contenido existentes frente a modelos que no cooperan.
- Experimentación académica en interpretabilidad: analizar las diferencias de activación entre un modelo alineado y su versión abliterada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Asumiendo que el modelo tiene 27B parámetros (según el nombre), una cuantización Q4_K_M ocupa aproximadamente 16.8 GB (dato mencionado en el repositorio de GitHub relacionado).
- VRAM estimada: para Q4_K_M, se necesitan al menos 16-20 GB de VRAM para inferencia en GPU; para Q8, unos 30 GB.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB) para Q4_K_M, o A100/H100 para cuantizaciones mayores.
- En CPU, puede ejecutarse con llama.cpp con suficiente RAM (32 GB o más), aunque la velocidad será menor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con conversión a formato compatible), TGI.
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (original) | ~27B | No disponible | Apache 2.0 (presumible) | Modelo alineado con censura |
| AEON-7 Qwen3.8-27B UNCENSORED | ~27B | No disponible | No disponible | Abliteración del anterior |
| Este GGUF (mradermacher) | No confirmado | No disponible | No disponible | Cuantización del anterior |

No se dispone de datos de rendimiento comparativo entre estos modelos. Otras alternativas "uncensored" como Dolphin o WizardLM-uncensored podrían compararse, pero no hay información suficiente.

## Limitaciones y advertencias

- Modelo sin alineamiento de seguridad: puede generar contenido dañino, ilegal, violento o sexualmente explícito sin restricciones. Su uso conlleva riesgos legales y éticos.
- Sesgos: al ser una abliteración de Qwen3.8, hereda los sesgos del modelo base, que pueden amplificarse al no haber filtros.
- Alucinaciones: no se dispone de datos específicos, pero es probable que presente alucinaciones similares a otros modelos de su tamaño.
- Licencia desconocida: no se especifica la licencia ni del modelo base ni de la cuantización, lo que impide conocer las restricciones de uso comercial.
- Contexto: se desconoce la longitud de contexto efectiva tras la cuantización.
- Soporte técnico: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que no hay comunidad ni mantenimiento activo.
- Discrepancia en parámetros: el dato de 3.391.984 parámetros es inconsistente con el nombre de 27B; podría tratarse de un error de etiquetado o de un modelo distinto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16-i1-GGUF
- Modelo base (AEON-7): https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Repositorio GitHub relacionado: https://github.com/Wassimyounes01/qwen38-uncensored
- Repositorio GitHub del proyecto AEON-7 (versión 3.6): https://github.com/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-DFlash/
- Blog de AMD sobre soporte de Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-aeon-ultimate-uncensored-bf16-aeon-7
