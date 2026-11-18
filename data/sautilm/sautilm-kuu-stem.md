# sautilm/SautiLM-Kuu-STEM

## Resumen

SautiLM-Kuu-STEM es un ajuste fino (fine-tuning) del modelo Google Gemma 3 1B instruct, desarrollado por el equipo SautiLM / LosingTek Research en Bunia (Ituri, República Democrática del Congo). Se presenta como un modelo de IA de borde (edge-AI) "soberano" y 100 % offline, orientado a dispositivos Android de gama media (Android 8.0+, al menos 4 GB de RAM) y empaquetado en formato LiteRT-LM (anteriormente TFLite) para ejecución local sin conexión. El artefacto distribuido ocupa 998,72 MB y está cuantizado en INT8 con el esquema `dynamic_wi8_afp32`.

El modelo forma parte de una arquitectura modular de tres niveles: SautiLM-Jua (270M para móvil), SautiLM-Nuru (clasificadores de visión TFLite de hasta 45 MB) y SautiLM-Kuu (1B para móvil y 4B para estaciones de trabajo de escritorio). Dentro de esta familia, SautiLM-Kuu-STEM es la variante especializada en ciencia, tecnología, ingeniería y matemáticas (STEM), con variantes hermanas para medicina (Kuu-Med) y derecho (Kuu-Ius).

Su relevancia actual radica en el enfoque de despliegue: inferencia completamente offline en hardware de consumo, con soporte declarado para francés, inglés y suajili, y una orientación explícita al contexto de África Oriental y la RDC. No obstante, conviene señalar que el corpus de entrenamiento es muy reducido (964 ejemplos verificados) y que el propio autor reporta una verificación de runtime de solo 4 sobre 10, lo que sitúa al modelo en una fase experimental más que de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 1B, `Gemma3ForCausalLM`, 26 capas, `hidden_size=1152`, `cache_length=2048`) |
| Parametros totales | 1B (modelo base Gemma 3 1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (`cache_length=2048`) |
| Tipos de cuantizacion | INT8 (`dynamic_wi8_afp32`); el modelo base admite otras cuantizaciones, pero el artefacto publicado es INT8 |
| Idiomas soportados | fr, en, sw |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | LiteRT-LM (`sautilm-kuu-stem.litertlm`, 998,72 MB); safetensors en el repo |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Google Gemma 3 1B: un transformer decoder-only de 26 capas con `hidden_size=1152` y una ventana de caché de 2048 tokens. Sobre esta base se aplicó un ajuste fino con LoRA de rango 32 y alpha 64, ejecutado durante 105 pasos sobre un corpus de 964 ejemplos verificados, con un resultado de pérdida de entrenamiento de 0,1278 y mejor pérdida de validación de 0,6123. La conversión a LiteRT-LM se realizó con `litert-torch` y cuantización dinámica INT8 (`dynamic_wi8_afp32`), lo que reduce el peso del artefacto a menos de 1 GB para su despliegue en dispositivos Android.

El autor describe el proceso como "zero-leakage training", es decir, sin filtración de datos entre conjuntos de entrenamiento y validación. No se documentan en la información disponible detalles sobre la composición exacta del dataset más allá del número de ejemplos, ni si se emplearon técnicas de RLHF o DPO adicionales. La innovación técnica destacable no reside en la arquitectura (que es la estándar de Gemma 3), sino en el pipeline de empaquetado y cuantización para inferencia offline en LiteRT-LM sobre hardware móvil de gama media.

## Capacidades

- Generación de texto en francés, inglés y suajili, con especialización declarada en dominios STEM.
- Razonamiento y resolución de problemas técnicos y matemáticos, según la orientación del ajuste fino.
- Ejecución completamente offline en dispositivos Android 8.0 o superior con al menos 4 GB de RAM.
- Integración en el ecosistema modular SautiLM (Jua, Nuru, Kuu) para tareas complementarias de visión y texto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible; el modelo es de texto.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Educación STEM offline en zonas rurales: el modelo puede desplegarse en tablets Android de gama media para asistir a estudiantes en matemáticas y ciencias sin conexión a internet, aprovechando su tamaño inferior a 1 GB y su soporte de francés, inglés y suajili.
- Tutoría de idiomas en contexto multilingüe: al cubrir fr/en/sw, puede emplearse en herramientas de aprendizaje que alternen entre el francés colonial administrativo y el suajili regional en África Oriental.
- Asistencia técnica de campo: técnicos en zonas sin cobertura pueden consultar procedimientos y conceptos técnicos directamente en el dispositivo, con latencia local y sin dependencia de servidores.
- Prototipado de aplicaciones de IA de borde: desarrolladores que necesiten validar pipelines LiteRT-LM en Android pueden usar este modelo como referencia funcional de extremo a extremo.
- Investigación sobre ajuste fino de bajo coste: el modelo documenta un caso de LoRA con 964 ejemplos y 105 pasos, útil como referencia metodológica para experimentos con recursos limitados.
- Despliegue en escenarios de conectividad intermitente: organizaciones humanitarias o educativas en la RDC pueden distribuirlo como artefacto autónomo sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento (pérdida de entrenamiento 0,1278, mejor pérdida de validación 0,6123) y una "verificación de runtime" de 4/10, sin detallar la metodología ni los conjuntos de evaluación empleados.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el artefacto INT8 ocupa 998,72 MB y está pensado para ejecución en CPU/NPU móvil.
- RAM mínima declarada: 4 GB en dispositivo Android 8.0 o superior.
- GPU recomendadas: no disponible; el objetivo declarado es hardware móvil y tablet (AndaaEdge / Shul'etu Capable), no GPU de servidor.
- ¿Cabe en GPU de consumo? El tamaño (menos de 1 GB en INT8) permitiría en principio ejecutarlo en GPUs de consumo, pero no se documenta soporte oficial para CUDA ni para backends de escritorio en la información proporcionada.
- Opciones de despliegue: LiteRT-LM (formato nativo del artefacto). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| SautiLM-Kuu-STEM | 1B | 2048 | Gemma | LiteRT-LM INT8 | Ajuste fino especializado en STEM, offline móvil |
| Gemma 3 1B (base) | 1B | 2048 (configuración del ajuste) | Gemma | safetensors, GGUF, LiteRT | Modelo base; capacidades generales, sin especialización STEM |
| SautiLM-Jua-STEM | 270M | no disponible | Gemma | LiteRT-LM | Variante móvil ligera de la misma familia |
| SautiLM-Kuu-Med / Kuu-Ius | 1B (4B en PC) | no disponible | Gemma | LiteRT-LM / GGUF | Variantes de dominio médico y legal de la misma familia |

La comparación con alternativas externas de la misma categoría (modelos de 1B para edge-AI) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido (964 ejemplos), lo que limita la generalización y aumenta el riesgo de sobreajuste; la pérdida de validación (0,6123) es notablemente superior a la de entrenamiento (0,1278).
- Verificación de runtime declarada como 4/10 por el propio autor, lo que indica un estado de madurez bajo para producción.
- Riesgo elevado de alucinación en dominios fuera del corpus de ajuste, especialmente en razonamiento STEM complejo.
- Ventana de contexto limitada a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística restringida a fr, en y sw; no se declara soporte para lingala, swahili congoleño u otras lenguas locales de la RDC.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribución; conviene revisarlas antes de cualquier despliegue comercial.
- Sin datos publicados de benchmarks independientes ni de evaluación de sesgos; no se puede verificar su rendimiento real frente a alternativas.
- El formato LiteRT-LM limita la portabilidad a otros backends de inferencia habituales (vLLM, llama.cpp, TGI).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sautilm/SautiLM-Kuu-STEM
- Modelo base: https://huggingface.co/unsloth/gemma-3-1b-it
- Sitio web de SautiLM: https://sautilm.com
- LosingTek Research: https://losingtek.com
