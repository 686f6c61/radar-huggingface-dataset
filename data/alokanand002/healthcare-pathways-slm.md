# alokanand002/healthcare-pathways-slm

## Resumen

Healthcare Pathways-Inspired MoE SLM es un modelo de lenguaje pequeño (SLM) de tipo decoder-only entrenado desde cero por el usuario de HuggingFace alokanand002. Se trata de un transformer causal con una capa de Mixture-of-Experts (MoE) dispersa, inspirada en la filosofía de Pathways pero sin relación con el sistema Pathways de Google, tal y como el propio autor especifica explicitamente en la model card. El dominio declarado es el sanitario: investigación en NLP clínico, terminología médica y experimentación en MedTech.

El modelo es deliberadamente minúsculo: 6 capas transformer, tamaño oculto de 256, 8 cabezas de atención y 4 expertos con enrutado top-2. Con un vocabulario de 16.384 tokens y una longitud de contexto de solo 512 tokens, está pensado como banco de pruebas para estudiar enrutado disperso y tokenización médica, no como sistema de producción. El repositorio ocupa 0,1 GB y en el momento de la consulta acumula 0 descargas y 0 likes, por lo que no cuenta con validación alguna por parte de la comunidad.

Su relevancia actual es fundamentalmente metodológica: permite reproducir en local, en una sola GPU o incluso en CPU, el comportamiento de una arquitectura MoE con enrutado top-2 y analizar fenómenos como el desequilibrio de carga entre expertos o la especialización por subdominio médico. No existe licencia declarada, el autor pide explicitamente que se añada una antes de cualquier distribución pública o comercial, y no se han publicado resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts disperso (top-k routing) |
| Parametros totales | ~15,2 M (estimacion derivada de la configuracion publicada; no confirmada por el autor) |
| Parametros activos | ~10,5 M por token (2 de 4 expertos activos por capa) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos PyTorch sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que debe anadirse una licencia antes de su distribucion) |
| Formato de pesos | PyTorch personalizado (checkpoint propio + `model.py`, no compatible con `transformers` nativo) |
| Tamano de vocabulario | 16.384 tokens (tokenizer BPE medico alojado aparte) |
| Tamano oculto | 256 |
| Capas transformer | 6 |
| Cabezas de atencion | 8 |
| Tamano de FFN | 768 |
| Numero de expertos | 4 |
| Expertos activos (top-k) | 2 |
| Activacion | GELU |
| Normalizacion | LayerNorm |
| Optimizador | AdamW |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con auto-atención causal estándar, en el que la subcapa feed-forward densa se sustituye por una capa MoE dispersa con 4 expertos y enrutado top-2. Cada token activa únicamente 2 de los 4 expertos en cada capa, lo que reduce el coste de cómputo por token a aproximadamente dos tercios del que tendría un modelo denso con los mismos parámetros totales. La activación es GELU, la normalización es LayerNorm y el optimizador empleado es AdamW. El tokenizador es un BPE de 16.384 entradas alojado en un repositorio independiente (`alokanand002/medical-bpe-16k`) que debe mantenerse consistente con el modelo.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición del corpus, si hubo fases de RLHF o DPO, ni si se aplicó una pérdida auxiliar de balanceo de carga entre expertos. Tampoco se documenta el uso de decodificación especulativa ni de mecanismos de atención lineal. La innovación declarada es exclusivamente arquitectónica: demostrar un MoE funcional a escala de 15 millones de parámetros con enrutado top-2 en el dominio médico.

## Capacidades

- Generación de texto causal en el dominio médico, condicionada por la distribución del corpus de entrenamiento (no documentada).
- Enrutado disperso MoE con top-2 sobre 4 expertos por capa, lo que permite estudiar la especialización de expertos por tipo de token o terminología.
- Tokenización BPE específica de dominio médico con vocabulario de 16.384 entradas.
- Inferencia local en CPU y en GPU de gama baja, dado el reducido tamaño del modelo.
- Punto de partida para fine-tuning sobre subdominios clínicos concretos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Capacidades de visión, audio o modo de razonamiento explícito (*thinking*): no disponibles.

## Casos de uso

- Investigación en enrutado MoE: el modelo permite instrumentar el router y medir la distribución de tokens entre los 4 expertos capa a capa, detectando colapso de expertos o desequilibrio de carga sin necesidad de infraestructura de gran escala.
- Experimentación con tokenizadores médicos: al usar el BPE de 16.384 entradas `medical-bpe-16k`, sirve para evaluar cómo afecta la segmentación de terminología clínica (fármacos, códigos CIE, abreviaturas) a la perplejidad de un modelo pequeño.
- Fine-tuning ligero por subdominio: con 15,2 M de parámetros, un ajuste fino sobre radiología, farmacología o codificación clínica cabe en una única GPU de consumo e incluso en CPU durante varias horas.
- Inferencia en el borde (edge computing): el checkpoint en FP32 ronda los 60 MB y en FP16 los 30 MB, por lo que puede desplegarse en portátiles, Raspberry Pi o módulos Jetson para demostraciones sin conectividad.
- Aumento de datos sintéticos: generación de textos médicos sintéticos de baja fidelidad para preentrenar o regularizar clasificadores de terminología, siempre con filtrado y revisión por expertos.
- Docencia y formación técnica: es un ejemplo reproducible de extremo a extremo de un transformer MoE con código fuente propio, útil para asignaturas de arquitecturas de deep learning.
- Pruebas de concepto de asistentes clínicos no diagnósticos: prototipado de interfaces conversacionales donde el modelo solo reformula o resume texto aportado, nunca decide.
- Estudio de eficiencia computacional: comparar el coste real por token de un MoE top-2 frente a un denso equivalente con el mismo número de parámetros totales en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No existe ningún dato de MMLU, HumanEval, GSM8K, MedQA, PubMedQA ni de métricas de perplejidad en la model card, en los metadatos de HuggingFace ni en los resultados de búsqueda consultados.

## Requisitos de hardware

- Parámetros totales aproximados de 15,2 M: el checkpoint en FP32 ocupa aproximadamente 61 MB; en FP16, unos 30 MB; en INT8, unos 15 MB. El repositorio completo pesa 0,1 GB.
- VRAM estimada para inferencia: menos de 1 GB en cualquier precisión, incluyendo estados de activación intermedios con contexto de 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Funciona sin problemas en RTX 3060, RTX 4060, RTX 4090, T4, L4, A100 o H100, aunque en estas últimas el modelo está enormemente infrautilizado.
- Compatibilidad con GPU de consumo: sí, en la práctica totalidad del parque instalado, incluidas GTX 1050 Ti, GTX 1650 y GPUs integradas con suficiente memoria compartida.
- Ejecución en CPU: totalmente viable, tanto en x86 como en ARM. Puede correr en Raspberry Pi 4/5 y en módulos Jetson.
- Opciones de despliegue: al ser una arquitectura personalizada, no es compatible de forma nativa con vLLM, TGI, llama.cpp, Ollama ni con `AutoModelForCausalLM` de `transformers`. Requiere instanciar el modelo con el `model.py` y la configuración incluidos en el repositorio. Es posible exportarlo manualmente a TorchScript u ONNX para servirlo con TorchServe, ONNX Runtime o FastAPI.
- Latencia y throughput: no disponible. No se han publicado mediciones y, dado el tamaño, cualquier cifra dependería casi por completo del *overhead* del framework y no del modelo.

## Comparativa con modelos similares

No se han encontrado en las fuentes consultadas datos verificables de parámetros, contexto, licencia ni benchmarks de los modelos de referencia de la misma categoría (SLM médico generativo y codificadores biomédicos). Se indica "no disponible" en las celdas que no pueden contrastarse.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| alokanand002/healthcare-pathways-slm | ~15,2 M (estimacion) | 512 | no disponible | HuggingFace, pesos PyTorch personalizados |
| BioGPT (Microsoft) | no disponible | no disponible | no disponible | no disponible |
| PubMedBERT | no disponible | no disponible | no disponible | no disponible |
| Modelos médicos densos de 1-7 B (familia Meditron y similares) | no disponible | no disponible | no disponible | no disponible |

Nota metodológica: la comparación relevante no es de rendimiento, ya que este modelo no publica métricas, sino de escala. Con 15,2 M de parámetros totales y 10,5 M activos, se sitúa dos o tres órdenes de magnitud por debajo de los SLM médicos habituales, por lo que su utilidad es la experimentación arquitectónica y no la calidad de generación.

## Limitaciones y advertencias

- Modelo experimental sin validación clínica. El autor advierte explícitamente de que no debe usarse para diagnóstico, tratamiento ni ninguna decisión clínica.
- Riesgo elevado de alucinación y de generar información médica incorrecta, incompleta o engañosa, agravado por el reducido número de parámetros.
- Sesgos conocidos: no disponibles. No se documenta la composición del corpus de entrenamiento, por lo que no puede auditarse ningún sesgo demográfico, geográfico o lingüístico.
- Contexto muy limitado: 512 tokens, insuficiente para historiales clínicos, informes largos o conversaciones multi-turno extensas.
- Idiomas soportados: no disponibles. La model card no declara ningún idioma, lo que impide garantizar un comportamiento correcto ni siquiera en inglés.
- Licencia: no disponible. El propio autor indica que debe añadirse una licencia antes de cualquier distribución pública o comercial, por lo que el uso comercial no está autorizado de forma explícita.
- Procedencia de los datos: no documentada. El uso previsto es sanitario, lo que plantea dudas de cumplimiento (RGPD en la UE) si el corpus de entrenamiento hubiera incluido datos de pacientes, algo que no puede descartarse ni confirmarse.
- Compatibilidad de herramientas: al ser una arquitectura personalizada, no funciona con los *pipelines* estándar de `transformers`, vLLM, TGI, llama.cpp ni Ollama, lo que añade coste de integración.
- Enrutado MoE: no se documenta si se empleó una pérdida auxiliar de balanceo. Sin ella, existe riesgo de colapso de expertos, con expertos infrautilizados o redundantes.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de terceros.
- Fecha de publicación: los metadatos indican creación el 25 de septiembre de 2026 y última actualización el mismo día, con 22 segundos de diferencia entre ambos eventos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alokanand002/healthcare-pathways-slm
- Tokenizer asociado: https://huggingface.co/alokanand002/medical-bpe-16k
- Perfil del autor: https://huggingface.co/alokanand002/models
- Repositorio GitHub del proyecto: https://github.com/LanguageJunction/healthcare-pathways-slm
- Artículo de referencia sobre SLM en medicina (Nature Biomedical Engineering): https://www.nature.com/articles/s41551-026-01734-3
- Presentación de un SLM médico en Bioasia 2026 (contexto de industria, no relacionado directamente): https://www.youtube.com/watch?v=_iVTgS1AYdA
- Repositorio InfraLoka/Pathway-AI (contexto no relacionado directamente): https://github.com/InfraLoka/Pathway-AI
