# mradermacher/Climb-1.3-Photon-GGUF

## Resumen

Climb-1.3-Photon es un modelo de lenguaje de aproximadamente 752 millones de parámetros, desarrollado por Climb-Ai y distribuido en formato GGUF por mradermacher. Está especializado en tareas de terminal y línea de comandos: generación de comandos de shell, asistencia en entornos Linux, automatización de bash y operaciones de CLI. La etiqueta `qwen3_5` en los metadatos sugiere que su arquitectura deriva de la familia Qwen, aunque no se especifica la variante exacta ni los detalles de entrenamiento.

El repositorio analizado es una conversión a GGUF del modelo original `Climb-Ai/Climb-1.3-Photon`, con cuantizaciones estáticas que van desde Q2_K (0,5 GB) hasta f16 (1,6 GB). Su tamaño reducido permite ejecutarlo en hardware de consumo, lo que lo hace atractivo para asistentes locales de terminal, copilotos de shell y herramientas de automatización que requieren baja latencia y funcionamiento offline.

La relevancia actual del modelo radica en su enfoque vertical: en lugar de competir como modelo generalista, se posiciona como un asistente especializado en seguridad y operaciones de terminal (tags `safety`, `copilot`, `cli`). Su licencia Apache 2.0 facilita la integración comercial y la modificación. Los idiomas declarados son ruso e inglés, sin soporte documentado de castellano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen, tag `qwen3_5`); detalles no disponibles |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5`, que apunta a una arquitectura transformer de la familia Qwen. Con 752 millones de parámetros, se trata de un modelo compacto orientado a inferencia eficiente. No se especifican el número de capas, la dimensión oculta, el número de cabezas de atención ni la longitud de contexto nativa.

Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o instrucción supervisada. El enfoque declarado en los tags (terminal, bash, cli, safety, copilot) sugiere un ajuste específico sobre datos de comandos de shell y operaciones de sistema, pero no hay cifras públicas que lo confirmen. No se mencionan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de comandos de shell para entornos Linux y bash.
- Asistencia en operaciones de terminal y flujos de trabajo CLI.
- Enfoque en seguridad (`safety`), presumiblemente orientado a evitar comandos destructivos, aunque no se detalla el mecanismo.
- Funcionalidad de copiloto para tareas de administración de sistemas.
- Conversación multi-turno (tag `conversational`).
- Soporte de ruso e inglés; no se documenta castellano.
- Compatibilidad con endpoints (`endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistente de terminal local: el modelo puede generar y explicar comandos de bash directamente en la máquina del usuario, sin enviar datos a la nube, gracias a su tamaño de 752 M de parámetros que cabe en GPU de consumo.
- Copiloto de administración de sistemas: integrado en herramientas de CLI para sugerir comandos de gestión de ficheros, procesos, permisos y paquetes, con el foco en seguridad que declaran sus tags.
- Automatización de scripts: generación de fragmentos de bash a partir de descripciones en lenguaje natural, útil en pipelines de aprovisionamiento o tareas repetitivas.
- Formación y documentación técnica: explicación de comandos y parámetros de utilidades de Linux para manuales o asistentes educativos en inglés y ruso.
- Filtrado de seguridad en comandos: uso del tag `safety` para revisar comandos propuestos por otros sistemas y advertir de operaciones destructivas antes de su ejecución.
- Despliegue en entornos aislados: al distribuirse en GGUF y con licencia Apache 2.0, puede embeberse en appliances o entornos air-gapped donde no se permite acceso a APIs externas.
- Prototipado rápido de interfaces conversacionales de terminal: gracias a las cuantizaciones ligeras (Q4_K_M de 0,6 GB) se puede iterar en portátiles sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,6 GB en cuantizaciones Q2_K a Q4_K_M; unos 0,9 GB en Q8_0; 1,6 GB en f16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4060 o superiores son más que suficientes. También funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base puede servirse con transformers, vLLM o TGI en formato safetensors.
- Latencia y throughput estimados: no disponibles; por el tamaño, se espera inferencia en tiempo real en CPU moderna y muy rápida en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Climb-1.3-Photon | 752 M | no disponible | Terminal, bash, CLI, safety | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-Coder-0.5B | 494 M | 32 K (variante base) | Código general | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-Coder-1.5B | 1.540 M | 32 K (variante base) | Código general | Apache 2.0 | safetensors, GGUF |
| SmolLM2-1.7B | 1.700 M | 8 K | Generalista | Apache 2.0 | safetensors, GGUF |

La comparativa es orientativa: no hay benchmarks publicados de Climb-1.3-Photon que permitan contrastar rendimiento real frente a estas alternativas. Su ventaja diferencial es la especialización declarada en terminal y seguridad, frente al enfoque más generalista de los modelos citados.

## Limitaciones y advertencias

- No hay datos públicos de benchmarks, por lo que el rendimiento real en tareas de terminal no está verificado de forma independiente.
- Idiomas limitados a ruso e inglés; el castellano no está declarado y su calidad sería incierta.
- Longitud de contexto desconocida, lo que dificulta planificar conversaciones largas o análisis de ficheros extensos.
- Riesgo de alucinación inherente a modelos de este tamaño; en un contexto de terminal, un comando incorrecto puede tener consecuencias destructivas, por lo que requiere supervisión humana.
- El tag `safety` no garantiza por sí solo la ausencia de comandos peligrosos; debe validarse en producción.
- No se documenta soporte de tool calling ni de agentes multi-paso, lo que limita su uso en orquestaciones complejas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene revisar la model card del modelo base por si hubiera condiciones adicionales no reflejadas en la cuantización.
- Al ser una cuantización estática de un tercero, puede haber degradación de calidad respecto al modelo original, especialmente en Q2_K y Q3.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Climb-1.3-Photon-GGUF
- Modelo base: https://huggingface.co/Climb-Ai/Climb-1.3-Photon
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Climb-1.3-Photon-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Climb-1.3-Photon-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
