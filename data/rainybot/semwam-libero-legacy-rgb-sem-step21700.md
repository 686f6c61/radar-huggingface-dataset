# RainyBot/SemWAM-LIBERO-Legacy-rgb-sem-step21700

## Resumen

SemWAM-LIBERO-Legacy-rgb-sem-step21700 es un checkpoint de investigación en robótica publicado por RainyBot en Hugging Face. Se trata de un modelo de política visomotora (vision-language-action) entrenado sobre el benchmark LIBERO, orientado a la manipulación robótica a partir de observaciones RGB y representaciones semánticas extraídas con un backbone DINOv3 ViT-B/16. El modelo se construye sobre el backbone de difusión de vídeo Wan2.2-TI2V-5B de Wan-AI, adaptado a la modalidad `sem_rgb` con un paradigma de entrada `t_concat`.

El checkpoint corresponde al paso de optimizador final 21700 de 21700 de una ejecución de entrenamiento con ZeRO-2, y se publica como archivo histórico byte a byte, sin `checkpoint_version=2` ni `inference_config`. El autor advierte explícitamente de que no es compatible con el evaluador actual de SemWAM v2 y que debe utilizarse con la implementación histórica y la configuración original. Por tanto, se trata de un artefacto de archivo para reproducibilidad, no de un modelo listo para producción.

Su relevancia es acotada: sirve como referencia para quienes investigan políticas VLA sobre LIBERO, para auditar recetas de entrenamiento concretas y para comparar variantes del proyecto SemWAM. El repositorio ocupa 12,1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión de vídeo (VideoDiT) sobre Wan2.2-TI2V-5B, con fusión semántica DINOv3 ViT-B/16; modalidad `sem_rgb` |
| Parametros totales | no disponible (el repo pesa 12,1 GB en bfloat16, lo que sugiere un orden de miles de millones, pero no se declara cifra exacta) |
| Parametros activos | no disponible (no se declara configuración MoE) |
| Longitud de contexto | no disponible (paradigma `t_concat`, sin ventana declarada) |
| Tipos de cuantizacion | no disponible (pesos en `torch.bfloat16` según metadatos) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas declaradas) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`torch.bfloat16`), sin GGUF ni safetensors declarados en la información disponible |

Otros parámetros relevantes de la configuración archivada: `video_dit_config` con `hidden_dim` 3072, `ffn_dim` 14336, 30 capas, 24 cabezas de atención de 128 dimensiones, `patch_size` [1, 2, 2], `in_dim`/`out_dim` 48, `freq_dim` 256, `text_dim` 4096. `proprio_dim` 8. Backbone semántico DINOv3 ViT-B/16 con `feat_dim` 768 y fusión en capas 7 y 23. Entradas de muñeca a 128×160 con cámaras `left` y `right`, sin atención al vídeo (`attends_video: false`).

## Arquitectura y entrenamiento

El modelo combina un difusor de vídeo basado en transformer (VideoDiT) derivado de Wan2.2-TI2V-5B con un codificador semántico congelado DINOv3 ViT-B/16. Las características semánticas (768 dimensiones) se inyectan en las capas 7 y 23 del difusor mediante fusión por concatenación temporal (`input_paradigm: t_concat`). La máscara de atención de vídeo es `first_frame_causal`, y el modelo no está condicionado por acción (`action_conditioned: false`). El estado propioceptivo tiene 8 dimensiones. La disposición de vistas es `libero_horizontal`, con vistas de muñeca a 128×160 procesadas solo en el primer frame.

El entrenamiento se realizó con ZeRO-2 sobre el dataset LIBERO en su variante RGB con representación semántica, hasta el paso de optimizador 21700, que era el presupuesto final declarado. El autor indica que se verificaron los logs originales de finalización con exit 0 y el presupuesto final del entrenador. No se especifican el número de tokens, la composición exacta del dataset, ni si hubo RLHF o DPO; la revisión de código fuente original es desconocida. La configuración archivada incluye además un estimador de profundidad VDA (ViT-B, 518 px), un módulo UniDepth v2 y un cabezal DEFM ViT-S/14, aunque varios de estos campos aparecen como `null` en la configuración resuelta y pueden estar inactivos.

## Capacidades

- Control visomotor para manipulación robótica en entornos tipo LIBERO, generando acciones a partir de observaciones RGB y estado propioceptivo de 8 dimensiones.
- Procesamiento multimodal de vistas: cámara principal más cámaras de muñeca izquierda y derecha a 128×160.
- Fusión de representaciones semánticas densas (DINOv3 ViT-B/16) con el difusor de vídeo para condicionar la generación de trayectorias.
- Modelado de dinámica visual mediante difusión sobre latentes de vídeo con máscara causal de primer frame.
- Soporte de estimación de profundidad en la configuración archivada (VDA, UniDepth v2, DEFM), aunque su activación efectiva no está confirmada.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo de pensamiento.

## Casos de uso

- Reproducción de experimentos LIBERO: cargar el checkpoint con la implementación histórica de SemWAM y la configuración original para replicar exactamente los resultados del paso 21700, útil en auditorías de papers y tesis.
- Estudio de recetas de entrenamiento VLA: analizar cómo afecta la fusión semántica en capas 7 y 23 al rendimiento en tareas de manipulación, comparando con variantes sin DINOv3.
- Investigación sobre condicionamiento por difusión de vídeo en robótica: usar el modelo como punto de partida para estudiar la transferencia de Wan2.2-TI2V-5B al dominio de acciones.
- Base para ablaciones controladas: al ser un checkpoint congelado y documentado, sirve como referencia fija en experimentos que varíen el backbone semántico o la política de fusión.
- Docencia y formación en VLA: ejemplo realista de pipeline completo (dataset LIBERO, encoder congelado, difusor de vídeo, estado propioceptivo) para cursos de aprendizaje por imitación.
- Archivo de reproducibilidad: conservar el artefacto byte a byte para verificar que publicaciones futuras del proyecto SemWAM no alteran resultados históricos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio pesa 12,1 GB en bfloat16, por lo que se requiere al menos esa cantidad de VRAM para cargar los pesos sin cuantización, más memoria para activaciones y el encoder DINOv3.
- GPU recomendadas: no declaradas por el autor; por tamaño, se necesitarían GPUs de datacenter (A100 40/80 GB, H100) para inferencia cómoda en bfloat16.
- GPU de consumo: probablemente no cabe en RTX 4090 (24 GB) sin cuantización y gestión cuidadosa de memoria; no hay datos oficiales.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de robótica con implementación histórica propia, el despliegue requiere el código original de SemWAM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SemWAM-LIBERO-Legacy-rgb-sem-step21700 | no disponible | no disponible | no disponible | no disponible | Hugging Face (RainyBot) |
| OpenVLA | 7B | no disponible | resultados publicados en su paper | no disponible en esta ficha | Hugging Face (openvla) |
| π0 (Physical Intelligence) | no disponible | no disponible | resultados publicados en su blog | no disponible en esta ficha | no disponible en esta ficha |
| Octo | no disponible | no disponible | resultados publicados en su paper | no disponible en esta ficha | Hugging Face (octo-models) |

La comparación cuantitativa no es posible porque el autor no publica métricas de LIBERO para este checkpoint. Los tres modelos citados son referencias habituales en políticas VLA, pero sus cifras concretas no se han verificado en la información disponible.

## Limitaciones y advertencias

- Checkpoint histórico: no incluye `checkpoint_version=2` ni `inference_config`, y el autor declara explícitamente que no es compatible con el evaluador actual de SemWAM v2.
- Requiere la implementación histórica y la configuración original; usar valores por defecto actuales puede producir resultados incorrectos.
- La revisión del código fuente original es desconocida, lo que dificulta la reproducibilidad completa.
- Licencia no disponible: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Modelo de investigación sin benchmarks publicados; no hay evidencia cuantitativa de rendimiento en LIBERO en la información disponible.
- Riesgo de sobreajuste al dominio LIBERO y a la disposición de vistas `libero_horizontal`; no está pensado para entornos reales fuera de la simulación.
- Sin soporte declarado de tool calling, agentes ni idiomas; no es un modelo de lenguaje general.
- El repositorio no registra descargas ni interacciones, por lo que no hay validación comunitaria del artefacto.
- Varios campos de la configuración aparecen como `null` y pueden estar inactivos; el autor advierte que `null` no equivale a `false`.

## Enlaces

- Hugging Face: https://huggingface.co/RainyBot/SemWAM-LIBERO-Legacy-rgb-sem-step21700
- Backbone base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Benchmark LIBERO (referencia del dataset): https://libero-project.github.io/
- DINOv3 (referencia del encoder semántico): no disponible en la información proporcionada
