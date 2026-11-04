# aixonlab/PageAudit-v4-Qwen3.5-4B-LoRA

## Resumen

PageAudit v4 es un adaptador LoRA sobre el modelo base Qwen3.5-4B, desarrollado por aixonlab, orientado a la auditoría automática de accesibilidad web según WCAG 2.2 y a la detección de defectos de diseño en interfaces. No se trata de un modelo de propósito general, sino de un componente especializado dentro de un pipeline de auditoría que combina medición determinista en navegador real (Playwright/Chromium a 1280 px) con juicio del modelo sobre un subconjunto muy acotado de candidatos.

El adaptador se encarga únicamente de juzgar dos familias de reglas: tamaño de objetivos táctiles (tap-target size) y señales de enlace (link cues). El resto de comprobaciones (contraste de texto sobre fondo sólido medido, contraste de bordes de campos, foco de teclado sin cambio visible, saltos de nivel de encabezado, etiquetas solo placeholder, desajuste de altura entre input y botón, botones idénticos con radios distintos, enlaces indicados solo por color y longitud de línea) se resuelven mediante reglas deterministas. Según el autor, aproximadamente el 90 % de lo que reporta v4 proviene de las reglas medidas y el modelo cubre el resto.

La relevancia de esta ficha radica en que documenta un caso de uso muy específico de adaptación de un LLM pequeño (4B) con LoRA r=32 para una tarea de clasificación binaria (REAL / OK) dentro de un pipeline de calidad de interfaz. El autor publica resultados de evaluación con un protocolo ciego sobre 76 sitios web no usados en entrenamiento, incluyendo comparaciones con modelos de referencia como Claude Sonnet 5.5, y reconoce explícitamente que el juez no aportó mejora en el test final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=32, alpha=64) sobre proyecciones de atención y MLP del modelo base Qwen3.5-4B (transformer) |
| Parametros totales | 4B (modelo base); adaptador LoRA de tamaño no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B, no especificada en la información) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 64 aplicado sobre las proyecciones de atención y MLP del modelo base Qwen3.5-4B. Se entrenó desde el modelo base (no desde la versión v3), durante 3 épocas y 288 pasos, con un tiempo aproximado de 17 minutos en una única NVIDIA A40. El checkpoint y el umbral de decisión (0.05) se seleccionaron sobre un conjunto de ajuste separado de 30 páginas; el enrutamiento de cada familia de reglas (reportar como medida, juzgar o descartar) se congeló sobre un conjunto de validación separado de 40 páginas antes de abrir el test final.

Los datos de entrenamiento consistieron en 750 hallazgos candidatos provenientes de 175 sitios web reales, cada uno etiquetado de forma estricta (385 reales, 365 no reales) por un modelo fuerte que examinó capturas de pantalla y mediciones. La tarea del adaptador es una clasificación binaria (REAL / OK) sobre candidatos de dos familias de reglas: tamaño de objetivos táctiles y señales de enlace. No se menciona uso de RLHF ni DPO; el entrenamiento es supervisado sobre etiquetas generadas por un modelo juez.

## Capacidades

- Clasificación binaria de hallazgos de accesibilidad y diseño en dos familias concretas: tamaño de objetivos táctiles (tap-target size) y señales de enlace (link cues), respondiendo REAL u OK.
- Juicio sobre candidatos previamente medidos por reglas deterministas en navegador real (Playwright/Chromium a 1280 px).
- Integración en un pipeline de auditoría que mide estilos computados, píxeles de fondo reales tras ocultar el texto, cambios de foco de teclado antes/después y cajas de línea medidas.
- Filtrado previo de elementos ocultos, fuera de pantalla y de terceros (banners de cookies, widgets de chat, iframes) antes de cualquier comprobación.
- Generación de texto conversacional (pipeline text-generation) heredada del modelo base, aunque el uso previsto es la clasificación de candidatos.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Auditoría de accesibilidad WCAG 2.2 en sitios institucionales: el pipeline renderiza cada página en Chromium a 1280 px, mide contraste real sobre píxeles de fondo y somete los candidatos de tamaño de objetivo táctil y señales de enlace al adaptador para decidir si son problemas reales. Adecuado para gobiernos, universidades y pequeñas organizaciones, que son el grueso del conjunto de test.
- Control de calidad de diseño (design QA) en pipelines de CI/CD: el script `pipeline/audit_page.py` puede ejecutarse contra URLs concretas y combinarse con el modo `--dry-run` (solo reglas, sin modelo) para integrar comprobaciones deterministas en integración continua y reservar el juez para los candidatos que lo requieran.
- Reducción de falsos positivos en herramientas de auditoría existentes: el adaptador actúa como segunda opinión sobre candidatos medidos, con un umbral de 0.05 calibrado para mantener baja la tasa de falsas alarmas (0,09 por página en el test final).
- Detección de problemas de foco de teclado y contraste en formularios: las reglas medidas cubren foco sin cambio visible, contraste de bordes de campos, etiquetas solo placeholder y desajuste de altura entre input y botón, con el modelo interviniendo solo en las familias asignadas.
- Validación de enlaces indicados únicamente por color: la familia de link cues se somete al juez para distinguir señales reales de falsos positivos, aunque el autor advierte que hubo pocos ejemplos reales (1 de 9 correctos en el test final).
- Investigación sobre adaptación de LLM pequeños a tareas de clasificación estrechas: el repositorio publica el pipeline, el extractor y la configuración evaluada sin cambios, lo que permite reproducir los números y estudiar el efecto de un LoRA r=32 sobre un modelo de 4B en una tarea de auditoría de UI.
- Evaluación comparativa de coste frente a modelos frontera: el autor estima unos 0,07 USD de tiempo de GPU por cada 100 páginas para el juez, frente a 3-7,50 USD estimados para Claude Sonnet 5.5 a esfuerzo medio, lo que hace viable el análisis a gran escala de carteras de sitios.

## Benchmarks y rendimiento

Los resultados provienen de un protocolo ciego estricto sobre 76 sitios web nunca usados para construir, ajustar o entrenar el sistema. Un modelo fuerte (Claude Opus 5.5) juzgó cada hallazgo reportado con capturas de pantalla y una rúbrica escrita, sin saber qué sistema lo produjo. Los resultados se cuentan por problema distinto (una familia de reglas en una página cuenta una vez).

| Métrica | PageAudit v4 | Claude Sonnet 5.5 (prompt estándar) | Claude Sonnet 5.5 (con rúbrica estricta) |
|---|---|---|---|
| Reportes correctos (por problema) | 73,5 % | 38,8 % | 63,7 % |
| Problemas reales encontrados (cuota de todos los hallados por cualquier sistema) | 58,7 % | 89,4 % | 69,2 % |
| Llamadas erróneas por página | 0,39 | 1,37 | 0,39 |
| Falsas alarmas graves por página | 0,09 | 0,53 | 0,16 |

Intervalos de confianza del 95 % (bootstrap por página): frente a Sonnet con prompt estándar, v4 es más preciso entre 25 y 44 puntos y encuentra entre 19 y 44 puntos menos problemas. Frente a Sonnet con la misma rúbrica, la diferencia de precisión (-1,5 a +21 puntos) y la de cobertura (-23 a 0 puntos) no son estadísticamente claras. Frente a PageAudit v3, bajo el mismo estándar estricto y sobre un conjunto distinto de 30 páginas, v3 acertaba el 37 % con 2,0 falsas alarmas graves por página.

El autor reconoce que el juez, sobre las páginas de validación retenidas, elevó la precisión de tap-target del 75 % (reportar todos los candidatos medidos) al 97 %, pero en el test final de 76 sitios no ayudó: conservó 20 de 32 reportes correctos (62 %) y descartó 19 reales, cuando reportar todos los candidatos habría sido un 68 % preciso. Las ganancias de v4 provienen principalmente de la medición endurecida y del alcance estrecho de las reglas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un modelo base de 4B, requiere GPU con memoria suficiente para el modelo base más el adaptador LoRA. El adaptador en sí ocupa 0,8 GB en el repositorio.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA A40; para inferencia se puede usar cualquier GPU con VRAM suficiente para un modelo de 4B (no se especifican modelos concretos en la información).
- ¿Cabe en GPU de consumo? No confirmado en la información; un modelo de 4B es plausible en GPUs de consumo con cuantización, pero no se documenta.
- Opciones de despliegue: el pipeline usa `torch`, `transformers>=5.2` y `peft`; requiere además Playwright y Chromium para la fase de medición (`cd extractor && npm install playwright && npx playwright install chromium`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor estima aproximadamente 0,07 USD de tiempo de GPU por cada 100 páginas para el juez, y 17 minutos de entrenamiento en una A40 para 288 pasos.
- Modo sin modelo: `python pipeline/audit_page.py <url> --dry-run` ejecuta solo las reglas deterministas, sin cargar el adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PageAudit v4 (Qwen3.5-4B LoRA) | LoRA sobre transformer | 4B (base) | no disponible | Auditoría WCAG 2.2 y diseño UI | apache-2.0 | HuggingFace (aixonlab) |
| Claude Sonnet 5.5 | Modelo propietario | no disponible | no disponible | Propósito general | propietaria | API comercial |
| Claude Opus 5.5 | Modelo propietario | no disponible | no disponible | Propósito general (usado como juez de evaluación) | propietaria | API comercial |
| PageAudit v3 | Pipeline previo del mismo autor | no disponible | no disponible | Auditoría WCAG (versión anterior) | no disponible | no disponible en la información |

La comparación relevante es frente a modelos frontera de propósito general usados con prompts estándar o con rúbrica estricta: v4 es más preciso que Sonnet con prompt estándar (73,5 % frente a 38,8 %) y aproximadamente equivalente a Sonnet con rúbrica estricta (73,5 % frente a 63,7 %, con intervalos que se solapan), pero encuentra menos problemas reales (58,7 % frente a 89,4 % y 69,2 %). No se dispone de datos de benchmarks estándar (MMLU, HumanEval, GSM8K) para este adaptador.

## Limitaciones y advertencias

- Cobertura más estrecha que un modelo de propósito general: v4 no detecta problemas de foco que requieren juicio (12 de los problemas que solo encontró Sonnet eran de foco) y no reporta en absoluto problemas de espaciado, agrupación, alineación ni consistencia tipográfica.
- El texto dentro de ilustraciones decorativas de producto se trata como texto normal; en una página SaaS moderna esto produjo la mayoría de los reportes falsos de contraste.
- La longitud de línea acertó el 99 % en validación pero solo 5 de 8 en el test final; las señales de enlace solo por color y el desajuste de altura input/botón tuvieron pocos ejemplos reales (1 de 9 y 1 de 4 correctos en el test final).
- La verdad de referencia es el veredicto estricto de un modelo fuerte con capturas de pantalla, no una auditoría humana; la misma familia de modelos etiquetó los datos de entrenamiento, lo que introduce sesgo de circularidad.
- Las páginas se miden únicamente a 1280 px de ancho de escritorio; no hay cobertura de móvil, tablet ni otros breakpoints.
- El juez no aportó mejora en el test final: conservó el 62 % de los reportes correctos y descartó 19 reales, por debajo del 68 % de precisión que se obtendría reportando todos los candidatos.
- Idioma limitado al inglés según la model card; no se documenta soporte multilingüe.
- Licencia Apache 2.0, igual que el modelo base, sin restricciones comerciales adicionales conocidas; aun así, conviene verificar las condiciones del modelo base Qwen3.5-4B.
- Riesgo de alucinación no evaluado en la información; el uso previsto es clasificación binaria sobre candidatos medidos, no generación libre.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/aixonlab/PageAudit-v4-Qwen3.5-4B-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del pipeline y extractor: incluido en el repositorio de HuggingFace (carpetas `pipeline/` y `extractor/`), sin URL independiente en la información disponible.
- Paper, blog, demo o repositorio externo: no disponible en la información proporcionada.
