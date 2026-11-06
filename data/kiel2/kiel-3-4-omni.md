# kiel2/kiel-3.4-Omni

## Resumen

Kiel-3.4-Omni es un modelo de lenguaje causal multimodal desarrollado por kiel2 (KielTech Engineering) y construido sobre la arquitectura Janus (`MultiModalityCausalLM`). Con aproximadamente 2.089 millones de parámetros, está especializado en dominios técnicos muy concretos: ingeniería de energía alternativa a escala de microwatios, recolección de energía ambiental (TEGs, piezoeléctricos), diseño CMOS subumbral y sistemas embebidos de bajo consumo. Se distribuye con licencia MIT y pesos en safetensors, e incorpora código remoto personalizado que debe cargarse con `trust_remote_code=True`.

La versión 3.4 introduce mejoras respecto a Kiel-3.2-Omni: integración nativa del método `generate_omni` en el propio modelo (eliminando wrappers externos), un filtro regex de posprocesado (`clean_output`) que corrige el aglutinamiento de tokens del tokenizer SentencePiece y trunca el sangrado de diálogo autoinducido, y correcciones de estabilidad de memoria para configuraciones de una o dos GPU T4 con `device_map="auto"`.

El modelo está afinado con SFT sobre datasets técnicos de seguimiento del punto de máxima potencia (MPPT), generadores termoeléctricos, cosechadores piezoeléctricos y compromisos de diseño de ADC. Su relevancia es acotada: es un modelo de nicho para pipelines internos de KielTech y tareas de ingeniería de bajo consumo, no un modelo de propósito general. No se han publicado resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Janus MultiModalityCausalLM (transformer causal multimodal con código remoto personalizado) |
| Parámetros totales | 2.089.297.547 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en FP16) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (con código remoto `modeling_kiel_omni.py`) |

## Arquitectura y entrenamiento

El modelo se basa en Janus, la arquitectura multimodal de DeepSeek que desacopla la codificación visual de la generación mediante rutas separadas para comprensión y generación de imágenes. Kiel-3.4-Omni hereda el `MultiModalityCausalLM` y lo subclasifica en `modeling_kiel_omni.py` para añadir los métodos nativos `generate_omni` y `clean_output`. La precisión publicada es FP16. El modelo card menciona inyección de imagen dummy en el enrutamiento interno y puentes de tensores precisos para evitar errores de desajuste de dispositivo en configuraciones multi-GPU.

El entrenamiento incluyó una fase de SFT (supervised fine-tuning) sobre datasets técnicos especializados en MPPT, generadores termoeléctricos, cosechadores piezoeléctricos y compromisos de diseño de ADC. No se especifican el número de tokens de entrenamiento, la composición completa del dataset, ni si hubo fases de RLHF o DPO. La innovación técnica destacable es la integración nativa del pipeline de generación en el propio modelo y el filtro de posprocesado que repara la separación de tokens del tokenizer SentencePiece (por ejemplo, `Iam` → `I am`) y elimina sangrado de diálogo (`Assistant:`, `User:`).

## Capacidades

- Generación de texto causal en inglés con sesgo hacia dominios técnicos de ingeniería de energía y electrónica de bajo consumo.
- Comprensión de imagen y texto (image-text-to-text) para análisis de esquemáticos, diagramas técnicos y preguntas visuales (VQA).
- Razonamiento técnico sobre MPPT, TEGs, cosechadores piezoeléctricos, CMOS subumbral y compromisos de ADC (SAR frente a Sigma-Delta).
- Método nativo `generate_omni` que unifica consultas solo-texto y consultas multimodales imagen-texto.
- Posprocesado integrado `clean_output` para corregir aglutinamiento de tokens y truncar diálogo autoinducido.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Análisis de esquemáticos de circuitos: el modelo acepta una imagen de un diagrama y responde preguntas sobre compromisos de diseño entre ADC SAR y Sigma-Delta, adecuado por su entrenamiento específico en trade-offs de ADC.
- Asistencia en diseño de recolección de energía ambiental: consultas sobre consideraciones de diseño a escala de microwatios con TEGs y cosechadores piezoeléctricos, gracias al SFT sobre estos dominios.
- Seguimiento del punto de máxima potencia (MPPT): explicación y depuración de algoritmos MPPT en pipelines internos de KielTech, alineado con los datasets de entrenamiento.
- Diseño CMOS subumbral: consultas técnicas sobre polarización, consumo y márgenes en circuitos subumbral para sistemas embebidos de bajo consumo.
- Administración de backend de KielTech: integración en pipelines internos de administración descritos por el autor, con generación de texto técnico en inglés.
- Documentación técnica automatizada: generación de explicaciones y resúmenes de especificaciones de componentes de bajo consumo, apoyándose en el contexto multimodal para adjuntar diagramas.
- Despliegue en hardware modesto: al tener ~2.089 millones de parámetros en FP16 y compatibilidad con una o dos T4, puede ejecutarse en entornos de laboratorio con GPU de gama media para prototipado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 4,2 GB solo para pesos (coherente con el tamaño del repo); el pico real depende de la longitud de contexto y de las activaciones, no disponible con precisión.
- GPU recomendadas por el autor: una o dos NVIDIA T4 con `device_map="auto"`; también cabe en GPU consumer con al menos 6-8 GB de VRAM en FP16.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más en FP16; en cuantizaciones menores no se documentan formatos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y el procesador `VLChatProcessor` de Janus; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kiel-3.4-Omni | ~2.089 M | no disponible | Sí (imagen-texto) | MIT | Hugging Face (kiel2/kiel-3.4-Omni) |
| Kiel-3.2-Omni | no disponible | no disponible | Sí | no disponible | Predecesor citado por el autor |
| Janus (DeepSeek) | no disponible en la información | no disponible | Sí | no disponible | Arquitectura base |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado y alineado para dominios muy específicos (energía de microwatios, CMOS subumbral, ADC); su rendimiento fuera de esos dominios probablemente sea limitado.
- Solo soporta inglés según la model card; no hay evidencia de capacidades multilingües.
- Requiere `trust_remote_code=True` y ejecuta código remoto personalizado (`modeling_kiel_omni.py`), lo que implica revisar y confiar en el código del autor antes de desplegarlo en producción.
- Riesgo de alucinación en consultas técnicas fuera del dataset de SFT; no se documentan evaluaciones de fidelidad.
- La corrección de aglutinamiento de tokens mediante regex indica problemas conocidos del tokenizer SentencePiece que pueden persistir en casos no cubiertos por el filtro.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- Licencia MIT permite uso comercial, pero el modelo depende de la arquitectura Janus y de código remoto cuyo origen y licencia de componentes no se detallan.
- Sin benchmarks publicados ni métricas de latencia o throughput; difícil justificar su elección frente a alternativas generales sin evaluación propia.
- El número de descargas (41) y likes (0) sugiere adopción muy baja y poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/kiel2/kiel-3.4-Omni
- Registro en Free2AITools: https://free2aitools.com/model/kiel2/kiel-3.4-omni
