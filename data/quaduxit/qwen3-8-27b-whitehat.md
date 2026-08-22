# QuaduxIT/Qwen3.8-27B-Whitehat

## Resumen

Qwen3.8-27B-Whitehat es un ajuste fino de tipo red-team/white-hat desarrollado por Quadux IT GmbH sobre el modelo base Qwen/Qwen3.8-27B de Alibaba. El objetivo del modelo es servir como asistente local y privado para trabajo de seguridad ofensiva autorizada: pruebas de penetración, evaluación de vulnerabilidades, desarrollo de exploits, análisis de malware e ingeniería inversa. A diferencia de los modelos comerciales o generalistas, que suelen rechazar una parte importante de las tareas de seguridad legítimas, este ajuste libera el dominio de la ciberseguridad manteniendo rechazos para contenido de daño físico real y material de abuso sexual infantil.

El modelo hereda la arquitectura híbrida del Qwen3.8-27B: 64 capas de las cuales 16 usan atención completa y 48 atención lineal con estado recurrente constante, más una cabeza MTP para decodificación especulativa. Es multimodal (texto e imagen), con una ventana de contexto nativa de 262.144 tokens. Los pesos se distribuyen en BF16 safetensors (~52 GB), y el autor publica variantes cuantizadas (FP8, W8A16, NVFP4 y GGUF) en repositorios separados. La licencia es Apache-2.0.

La relevancia actual del modelo radica en que cubre un hueco específico: la mayoría de los modelos alojados en la nube rechazan tareas ofensivas o no permiten enviar datos sensibles de vulnerabilidades a servicios externos. Este modelo permite mantener todo el trabajo de seguridad internamente, con un límite ético explícito en daño físico y CSAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (16 capas con atencion completa, 48 con atencion lineal), 64 capas, cabeza MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | BF16 (referencia), FP8 W8A8, INT8 W8A16 (Marlin), NVFP4 4-bit, GGUF (escalera 4-54 GB) |
| Idiomas soportados | Ingles, aleman, multilingue (segun el autor) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte del Qwen3.8-27B, que emplea una arquitectura densa con atencion hibrida: solo 16 de las 64 capas ejecutan atencion completa (con intervalo de 4), mientras que las 48 restantes usan atencion lineal con un estado recurrente constante. Esto reduce el coste computacional en contextos largos manteniendo la calidad. La cabeza MTP (multi-token prediction) se conserva para decodificacion especulativa cuando el runtime lo soporta.

El ajuste fino se realizo mediante LoRA supervisado (SFT) sobre el comportamiento del modelo, y los pesos LoRA se fusionaron en los pesos base. Segun la model card, el cambio es exclusivamente de comportamiento: no se modifico la arquitectura ni se anadio conocimiento nuevo. El sistema prompt no es necesario porque el comportamiento esta incrustado en los pesos. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens ni el proceso de alineacion adicional (RLHF/DPO). El autor indica que los prompts de evaluacion estan excluidos del entrenamiento, lo que sugiere un protocolo de evaluacion held-out.

## Capacidades

- Generacion de texto especializada en ciberseguridad: desarrollo de exploits, malware, C2 beacons, keyloggers, ingenieria inversa, analisis de licencias y DRM, tanto ofensivo como defensivo.
- Soporte multimodal: acepta imagenes y capturas de pantalla como entrada, ademas de texto.
- Function calling: el modelo soporta llamadas a herramientas, segun los tags del repositorio.
- Razonamiento multi-paso: hereda el modo de razonamiento explicito del Qwen3.8-27B, que mejora la resolucion de problemas complejos a costa de latencia y consumo de tokens.
- Rechazos selectivos: mantiene negativas ante solicitudes de daño fisico real (armas, explosivos, drogas, agentes quimicos/biologicos, violencia) y material de abuso sexual infantil, tanto en texto como en imagen y en todos los idiomas.
- Multilingue: declarado para ingles, aleman y multilingue, aunque no se especifican los idiomas concretos.

## Casos de uso

- Pruebas de penetracion internas: el modelo puede generar vectores de ataque, scripts de explotacion y guias paso a paso para evaluar la seguridad de sistemas propios o autorizados, manteniendo los datos sensibles en local.
- Analisis de malware: permite desensamblar, entender y documentar muestras de malware sin enviar el codigo a servicios externos, gracias a su capacidad de razonamiento y su conocimiento en ingenieria inversa.
- Desarrollo de herramientas defensivas: puede escribir reglas de deteccion (YARA, Sigma), configuraciones de honeypots y scripts de hardening, apoyandose en su comprension de tecnicas ofensivas.
- Formacion en seguridad ofensiva: util para crear material didactico para equipos red-team o cursos internos, generando escenarios de ataque realistas y ejercicios practicos.
- Auditoria de codigo fuente: con su ventana de 262K tokens, puede analizar repositorios completos en busca de vulnerabilidades, sugiriendo parches y explicando el impacto de cada fallo.
- Investigacion de vulnerabilidades: ayuda a modelar cadenas de explotacion, evaluar la viabilidad de CVEs y redactar informes tecnicos para divulgacion responsable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card menciona una evaluacion interna sobre un conjunto de prompts held-out, midiendo la tasa de cumplimiento ("Comply") frente a rechazo ("Refuse"), pero los datos concretos estan truncados en la documentacion proporcionada. No se pueden reportar cifras verificables.

## Requisitos de hardware

- Los pesos BF16 de referencia (~52 GB) requieren al menos 60 GB de VRAM para inferencia con transformers o vLLM. GPU recomendadas: A100 80GB, H100 80GB o similar.
- La variante FP8 (~27 GB) cabe en una RTX 4090 (24 GB) solo con cuantizacion adicional o en GPUs de 32 GB como la A100 40GB. Para vLLM se requiere Hopper, Ada o Blackwell.
- La variante W8A16 (~27 GB) requiere vLLM/CUDA y GPU con al menos 32 GB.
- La variante NVFP4 (~17 GB) esta pensada para GPUs Blackwell (B200, etc.) y es experimental.
- La escalera GGUF (4-54 GB) permite ejecucion en CPU o GPUs consumer mediante llama.cpp u Ollama, desde 8 GB de VRAM en las cuantizaciones mas bajas.
- Opciones de despliegue: transformers, vLLM (con `--trust-remote-code`), llama.cpp para GGUF, y cualquier runtime compatible con safetensors.
- La latencia y el throughput dependen del hardware y la cuantizacion; no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Whitehat (este) | 27.8B | 262K | Seguridad ofensiva/defensiva con rechazos selectivos | Apache-2.0 | HuggingFace |
| Qwen3.8-27B (base) | 27.8B | 262K | Asistente general con guardarrailes estrictos | Apache-2.0 | HuggingFace |
| Modelos "uncensored" genericos (p.ej. abliterados) | Variable | Variable | Sin guardarrailes, responden a todo | Variable | Variable |

No se dispone de comparativas directas publicadas con otros modelos especializados en ciberseguridad como WhiteRabbitNeo o similares. La diferencia clave frente al modelo base es que el fine-tune elimina el rechazo en el dominio de seguridad (~40 % de rechazos en tareas legitimas y 100 % en ofensivas, segun el autor) mientras mantiene los limites eticos en daño fisico y CSAM.

## Limitaciones y advertencias

- Uso exclusivo para trabajo autorizado: el modelo no distingue entre objetivos legitimamente autorizados y no autorizados; el usuario es responsable de la legalidad de su uso.
- Riesgo de mal uso: al liberar el dominio ofensivo, el modelo puede generar contenido peligroso si se utiliza fuera de un contexto profesional y legal.
- No es un asistente de proposito general: esta especializado en seguridad y puede tener un rendimiento inferior en tareas ajenas a este dominio.
- Alucinacion: como cualquier modelo de lenguaje, puede producir informacion tecnica incorrecta o desactualizada en temas de seguridad, especialmente en exploits o CVEs recientes.
- Sesgos del modelo base: hereda los sesgos potenciales del Qwen3.8-27B, que no han sido evaluados ni mitigados en este ajuste.
- Limitaciones de idioma: aunque se declara multilingue, el entrenamiento principal parece estar en ingles y aleman; el rendimiento en otros idiomas puede ser inferior.
- La variante BF16 requiere hardware de gama alta; las cuantizaciones mas agresivas (NVFP4, GGUF de baja precision) pueden degradar la calidad de las respuestas.
- No se proporciona garantia ni soporte: el modelo se distribuye "tal cual" bajo Apache-2.0.

## Enlaces

- Repositorio del modelo: https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Coleccion de variantes: https://huggingface.co/collections/QuaduxIT/qwen38-27b-whitehat-6a89b5f640072fc5e6838c4b
- Variante FP8: https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat-FP8
- Variante W8A16: https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat-W8A16
- Variante NVFP4: https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat-NVFP4
- Variante GGUF: https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat-GGUF
- Sitio web del autor: https://quadux.it/
