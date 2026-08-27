# AMAImedia/Qwen3-VL-2B-UI-Venus-NOESIS-NF4

## Resumen

AMAImedia/Qwen3-VL-2B-UI-Venus-NOESIS-NF4 es un modelo de lenguaje multimodal (vision-language) de 2.000 millones de parámetros, desarrollado por AMAImedia como parte de su plataforma profesional NOESIS de automatización de doblaje multilingüe. Se trata de una derivada cuantizada en NF4 (4 bits) del modelo `inclusionAI/UI-Venus-1.5-2B`, que a su vez se construye sobre `Qwen3-VL-2B` de Alibaba Cloud. La cadena de linaje es completamente Apache 2.0, lo que permite uso comercial sin restricciones.

El modelo está diseñado específicamente como agente de automatización de interfaces gráficas (GUI) y navegador web, con capacidades de grounding visual y comprensión de DOM. Dentro de la arquitectura DHCF-FNO de NOESIS, actúa como agente de respaldo (fallback) de 2B en el subdominio público `ui-agent.amaimedia.com`, proporcionando validación cruzada frente al agente primario MAI-UI de 8B. Su relevancia radica en ofrecer una alternativa ligera (~1,2 GB de VRAM objetivo) para automatización de navegador en entornos con recursos limitados, manteniendo compatibilidad con 119 idiomas gracias a la base Qwen3.

La cuantización NF4 se realizó con `bitsandbytes 0.49.2` (double_quant + cómputo bf16), lo que reduce significativamente el footprint de memoria sin sacrificar en exceso la calidad de salida. El modelo conserva la torre de visión completa del Qwen3-VL-2B original, con una ventana de contexto que, según la información disponible, se indica como "26" (posiblemente 26K tokens, aunque no se especifica la unidad con claridad).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3VLForConditionalGeneration` (multimodal, transformer denso con torre de vision) |
| Parametros totales | 2.438.696.960 (2,4 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 26 (unidad no especificada; probablemente 26K tokens, no confirmado) |
| Tipos de cuantizacion | NF4 (4 bits, bitsandbytes, double_quant + bf16 compute) |
| Idiomas soportados | 119 idiomas y dialectos (herencia Qwen3): ingles, frances, portugues, aleman, ruso, chino, arabe, hindi, japones, coreano, español, etc. |
| Licencia | Apache 2.0 (uso comercial permitido) |
| Formato de pesos | safetensors (cuantizados NF4) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `Qwen3VLForConditionalGeneration`, un transformer multimodal denso que combina un modelo de lenguaje (texto) con una torre de visión independiente. Según la información disponible, el componente de texto tiene 28 capas, 16 cabezas de atención con GQA (grouped query attention) en proporción 2:1 (8 cabezas de clave/valor), y un tamaño de vocabulario de 151.936 tokens. La torre de visión tiene profundidad 24, dimensión oculta 1024, tamaño de parche 16, y utiliza "deepstack" en las capas [5, 11, 17], una técnica que apila características visuales de múltiples niveles para mejorar el grounding.

El entrenamiento sigue un pipeline de post-entrenamiento en 4 etapas sobre la base Qwen3-VL-2B: Mid-Train → Offline-RL → Online-RL → Model-Merge. Este enfoque, denominado RFT (reinforcement fine-tuning) por AMAImedia, difiere fundamentalmente del pipeline de auto-evolución de datos y colaboración dispositivo-nube utilizado por MAI-UI (Tongyi), lo que permite la validación cruzada entre ambos sistemas. El modelo intermedio `UI-Venus-1.5-2B-NOESIS-BF16` (repack en BF16) fue posteriormente cuantizado a NF4 con bitsandbytes, manteniendo el cómputo en bf16 para preservar la estabilidad numérica.

## Capacidades

- **Automatizacion de GUI y navegador**: el modelo está entrenado específicamente para interpretar capturas de pantalla y generar acciones de clic, navegación y entrada de texto sobre elementos DOM.
- **Grounding visual**: capacidad de localizar elementos concretos en una interfaz (botones, campos de formulario, enlaces) y devolver coordenadas o referencias a nodos DOM.
- **Comprension multimodal**: procesa simultáneamente imágenes (capturas de pantalla) y texto (HTML, instrucciones), generando respuestas contextualizadas.
- **Soporte multilingue**: hereda la cobertura de 119 idiomas y dialectos de Qwen3, incluyendo lenguas de baja representación como bhojpuri, maithili o kabuverdianu.
- **Razonamiento multi-paso**: puede descomponer tareas complejas de interfaz en secuencias de acciones encadenadas (navegar → localizar → hacer clic → verificar).
- **Tool calling / function calling**: no se especifica explícitamente, pero la arquitectura Qwen3-VL base soporta integración con herramientas externas; no confirmado para esta variante.
- **Modo agente**: diseñado para operar como agente autónomo en pipelines de automatización, con capacidad de validación cruzada frente a otros modelos.

## Casos de uso

- **Automatizacion de pruebas de interfaz (UI testing)**: el modelo puede recorrer una aplicación web, identificar elementos rotos o mal renderizados y ejecutar flujos de usuario predefinidos, gracias a su grounding visual y su capacidad de razonamiento multi-paso. Su bajo consumo de VRAM (~1,2 GB) permite ejecutarlo en paralelo en múltiples entornos de CI/CD.
- **Agente de navegacion web para scraping**: puede interpretar capturas de pantalla de páginas dinámicas (SPA, contenido cargado por JavaScript) y extraer datos o completar formularios, superando las limitaciones de los scrapers basados únicamente en HTML.
- **Asistente de accesibilidad**: combinando su soporte de 119 idiomas y su capacidad de interpretar interfaces, puede describir elementos de UI a usuarios con discapacidad visual o traducir instrucciones de navegación a múltiples idiomas en tiempo real.
- **Validacion cruzada en pipelines de agentes**: en la arquitectura NOESIS, actúa como segunda opinión cuando el agente primario (MAI-UI 8B) produce coordenadas de clic ambiguas o falla al grounding de un elemento, ofreciendo una alternativa de un pipeline de entrenamiento completamente distinto.
- **Automatizacion de doblaje y postproduccion**: dentro de la plataforma NOESIS, el modelo puede navegar por herramientas de edición de vídeo y audio, localizar pistas, aplicar efectos o exportar proyectos, integrando la automatización de GUI con el flujo de doblaje multilingüe.
- **Prototipado rapido de agentes GUI**: por su tamaño reducido y licencia Apache 2.0, es adecuado para equipos que necesitan experimentar con agentes de interfaz en entornos de desarrollo locales sin acceso a GPUs de alta gama, antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan datos de MMLU, HumanEval, GSM8K ni métricas específicas de grounding visual o automatización de GUI. La ausencia de datos comparativos impide evaluar cuantitativamente su rendimiento frente a alternativas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: ~1,2 GB objetivo según la documentación; pico de carga de ~3,45 GB VRAM.
- **GPU recomendadas**: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1660, RTX 3050, RTX 4060, etc.). También compatible con GPUs de datacenter como A10, A100 o H100, aunque no son necesarias.
- **Compatibilidad con consumer GPU**: sí, es uno de los puntos fuertes del modelo. Cabe en GPUs de gama de entrada y en entornos edge.
- **Opciones de despliegue**: compatible con `transformers` estándar (`from_pretrained` con `device_map={"": 0}`), bitsandbytes para carga NF4, y plataformas de inferencia como FriendliAI (dedicated endpoints). No se menciona soporte explícito para vLLM, llama.cpp u Ollama en la documentación.
- **Latencia y throughput**: no se proporcionan datos concretos. Dado el tamaño de 2,4B parámetros y cuantización NF4, se espera una latencia de decodificación en el rango de 20-50 ms/token en GPUs consumer modernas, pero esto es una estimación no confirmada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| **Qwen3-VL-2B-UI-Venus-NOESIS-NF4** (este) | 2,4 B | 26 (unidad no especificada) | NF4 | Apache 2.0 | GUI agent, RFT 4 etapas |
| **NOESIS-Qwen3-VL-2B-MAI-UI-NF4** | 2 B | no disponible | NF4 | Apache 2.0 | GUI agent, auto-evolucion de datos |
| **NOESIS-Qwen3-VL-8B-MAI-UI-NF4** | 8 B | no disponible | NF4 | Apache 2.0 | GUI agent primario, mayor capacidad |
| **Qwen3-VL-2B** (base) | 2 B | 32K (típico de la serie) | BF16/FP16 | Apache 2.0 | Vision-language generalista |

La comparativa se limita a los modelos de la misma familia NOESIS, ya que no se dispone de datos de modelos competidores externos (como UI-TARS o CogAgent) en la información proporcionada. La principal diferencia entre las variantes NOESIS radica en el pipeline de entrenamiento (RFT vs. auto-evolución) y el tamaño (2B vs. 8B), lo que afecta a la precisión del grounding y al consumo de VRAM.

## Limitaciones y advertencias

- **Contexto limitado**: la ventana de contexto se indica como "26" sin unidad clara, lo que sugiere una posible limitación severa frente a los 32K tokens típicos de Qwen3-VL. Esto podría restringir tareas que requieran historiales largos de interacción o documentos extensos.
- **Riesgo de alucinacion en grounding**: como todo modelo de visión-language, puede generar coordenadas o referencias a elementos que no existen en la captura de pantalla, especialmente en interfaces complejas o poco comunes.
- **Sesgos potenciales**: al estar entrenado principalmente para automatización de GUI, puede tener un rendimiento subóptimo en tareas de lenguaje general o razonamiento abstracto fuera de su dominio.
- **Dependencia de la calidad de la captura**: la precisión del grounding depende de la resolución y claridad de las capturas de pantalla; imágenes borrosas o con oclusiones pueden degradar el rendimiento.
- **Cu antización NF4**: aunque reduce el footprint de memoria, la cuantización de 4 bits puede introducir pérdidas de precisión en tareas de razonamiento fino o en la interpretación de texto pequeño dentro de las capturas.
- **Documentacion incompleta**: no se proporcionan benchmarks, detalles del dataset de entrenamiento ni especificaciones completas del contexto, lo que dificulta la evaluación objetiva del modelo.
- **Proyecto en fase temprana**: con solo 49 descargas y 1 like, el modelo tiene una adopción muy limitada y un historial de producción corto; se recomienda validación exhaustiva antes de usarlo en entornos críticos.

## Enlaces

- [HuggingFace: AMAImedia/Qwen3-VL-2B-UI-Venus-NOESIS-NF4](https://huggingface.co/AMAImedia/Qwen3-VL-2B-UI-Venus-NOESIS-NF4)
- [HuggingFace: AMAImedia/Qwen3-VL-2B-UI-Venus-NOESIS-BF16](https://huggingface.co/AMAImedia/Qwen3-VL-2B-UI-Venus-NOESIS-BF16/tree/main)
- [HuggingFace: inclusionAI/UI-Venus-1.5-2B (modelo base)](https://huggingface.co/inclusionAI/UI-Venus-1.5-2B)
- [GitHub: QwenLM/Qwen3-VL](https://github.com/QwenLM/Qwen3-VL)
- [FriendliAI: pagina de despliegue del modelo NF4](https://friendli.ai/models/AMAImedia/Qwen3-VL-2B-UI-Venus-NOESIS-NF4)
- [FriendliAI: pagina de despliegue del modelo BF16](https://friendli.ai/models/AMAImedia/Qwen3-VL-2B-UI-Venus-NOESIS-BF16)
- [X (Twitter): @AMAImediacom](https://x.com/AMAImediacom)
- [LinkedIn: Ilia Bolotnikov](https://www.linkedin.com/in/ilia-bolotnikov)
- [Telegram: @djbionicl](https://t.me/djbionicl)
