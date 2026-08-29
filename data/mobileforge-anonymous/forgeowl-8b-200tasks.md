# mobileforge-anonymous/ForgeOwl-8B-200tasks

## Resumen

ForgeOwl-8B-200tasks es un modelo de visión-lenguaje especializado en la interacción con interfaces gráficas móviles (GUI), desarrollado por el proyecto MobileForge como artefacto de una submission anónima a ICLR. Se basa en el checkpoint instruct de mPLUG/GUI-Owl-1.5-8B-Instruct y se adapta mediante MobileForge, un sistema de adaptación sin anotaciones humanas que genera currículos ejecutables a partir de la interacción real con aplicaciones objetivo, retroalimentación jerárquica de rollouts y actualizaciones de política con GRPO contextualizado por pistas correctivas.

El modelo resuelve el problema de adaptar agentes de GUI móvil a nuevas aplicaciones sin necesidad de conjuntos de datos escritos a mano, demostraciones ni etiquetas de recompensa. Con 8.767 millones de parámetros y arquitectura qwen3_vl, está diseñado para tareas de comprensión de pantalla y ejecución de acciones en entornos Android. Su relevancia radica en que alcanza resultados competitivos en AndroidWorld con solo 200 tareas generadas automáticamente, estableciendo un nuevo paradigma de adaptación eficiente para agentes de interfaz móvil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_vl (vision-language transformer) |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en BF16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura qwen3_vl de GUI-Owl-1.5-8B-Instruct, un transformer multimodal que procesa entradas de imagen (capturas de pantalla) y texto para generar acciones de GUI. El entrenamiento de adaptación usa MobileForge, que convierte la interacción real con aplicaciones objetivo en un currículo ejecutable de 200 tareas generadas automáticamente. El proceso combina retroalimentación jerárquica de críticos (nivel de tarea y nivel de paso), pistas correctivas contextualizadas y actualizaciones de política mediante GRPO (Group Relative Policy Optimization) a nivel de paso. No se emplean tareas escritas por humanos, demostraciones ni etiquetas de recompensa explícitas, lo que constituye la innovación principal del enfoque.

## Capacidades

- Agente de GUI móvil: comprende capturas de pantalla y ejecuta acciones táctiles (tap, swipe, scroll, texto) sobre interfaces Android.
- Razonamiento visual: interpreta elementos de UI, texto en pantalla y estructura jerárquica de la interfaz para decidir el siguiente paso.
- Adaptación a aplicaciones específicas: entrenado en 200 tareas generadas automáticamente sobre apps objetivo, generaliza a tareas no vistas.
- Soporte de conversación multimodal: al heredar de GUI-Owl-1.5-8B-Instruct, mantiene el chat de imagen-texto a texto.
- Sin tool calling explícito: la salida se limita a acciones de GUI, no a llamadas de función genéricas.
- Capacidades multilingües: no documentadas; probablemente limitadas al inglés de los datasets de GUI.

## Casos de uso

- Automatización de pruebas de aplicaciones móviles: el modelo puede recorrer flujos de usuario en apps Android de forma autónoma, detectando errores de UI o regresiones sin necesidad de escribir scripts de prueba manuales.
- Asistente de accesibilidad: integrado en un entorno controlado, puede ayudar a usuarios con discapacidad motora a completar tareas en apps mediante comprensión de pantalla y acciones táctiles simuladas.
- Generación de datos de entrenamiento para otros agentes: sus rollouts pueden usarse como demostraciones sintéticas para entrenar modelos más pequeños o para aumentar datasets de GUI.
- Investigación en adaptación sin anotaciones: sirve como referencia para estudiar métodos de RL aplicados a agentes de GUI con feedback jerárquico y sin supervisión humana.
- Benchmarking de agentes móviles: su rendimiento documentado en AndroidWorld y MobileWorld permite comparar futuros modelos contra un estándar reproducible.
- Automatización de tareas repetitivas en entornos de prueba: en sandboxes de CI/CD, puede ejecutar flujos de registro, formularios o navegación para verificar builds.

## Benchmarks y rendimiento

Según la model card y el paper, en AndroidWorld (116 tareas):

| Metrica | Resultado |
|---|---|
| Pass@1 | 75/116 (64,7 %) |
| Pass@2 | 85/116 (73,3 %) |
| Pass@3 | 86/116 (74,1 %) |

El paper reporta además 77,6 % Pass@3 en AndroidWorld y 41,0 % de éxito en el split GUI-only de MobileWorld (fuera de dominio), posicionándolo como el agente de GUI móvil con datos abiertos más fuerte en su evaluación. No se proporcionan resultados de benchmarks clásicos como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 17,5 GB (tamaño del repo), por lo que se necesita una GPU con al menos 20 GB de memoria (por ejemplo, RTX 3090, RTX 4090, A100 40 GB).
- Con cuantización de 8 bits se podría reducir a unos 9-10 GB, y con 4 bits a unos 5-6 GB, aunque no se ofrecen archivos cuantizados oficiales.
- GPUs recomendadas: NVIDIA A100 (40 GB) o H100 para despliegue de alta concurrencia; RTX 4090 para experimentación local.
- Opciones de despliegue: compatible con transformers (carga estándar), vLLM para inferencia optimizada (si soporta qwen3_vl), y potencialmente llama.cpp si se generan GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (agentes de GUI móvil) en la información proporcionada. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo puede ejecutar acciones incorrectas o inseguras sobre interfaces reales; debe usarse exclusivamente en entornos aislados (emuladores, sandboxes) y revisar las acciones antes de aplicarlas a datos personales.
- La adaptación se ha realizado sobre 200 tareas de aplicaciones específicas; el rendimiento fuera de dominio (MobileWorld) cae al 41 %, lo que indica una generalización limitada a apps no vistas.
- No hay información sobre sesgos o alucinaciones; al ser un modelo de GUI, el riesgo principal es la selección errónea de elementos de UI en pantallas complejas.
- La licencia MIT permite uso comercial, pero el modelo base (GUI-Owl-1.5-8B-Instruct) puede tener condiciones adicionales que deben verificarse.
- No se documentan idiomas soportados; probablemente el rendimiento sea óptimo solo en inglés.
- El repositorio es un artefacto de revisión anónima; la autoría final y metadatos se añadirán tras la revisión, lo que puede afectar a la trazabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mobileforge-anonymous/ForgeOwl-8B-200tasks
- Paper en arXiv: https://arxiv.org/abs/2606.19930
- Página del proyecto: https://mobileforge-anonymous.github.io/
- Repositorio de código (anónimo): https://github.com/mobileforge-anonymous/MobileForge
- Dataset de resultados: https://huggingface.co/datasets/mobileforge-anonymous/mobileforge-benchmark-results
- Repositorio oficial (Kwai): https://github.com/kwai/MobileForge
