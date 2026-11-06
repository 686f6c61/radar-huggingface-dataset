# aixonlab/PageAudit-Qwen3.5-4B-LoRA

## Resumen

PageAudit (Qwen3.5-4B) es un adaptador LoRA de tipo investigación, desarrollado por aixonlab, que se monta sobre el modelo base Qwen/Qwen3.5-4B. No es un modelo generativo de propósito general: es un componente especializado dentro de una pipeline de auditoría de accesibilidad y consistencia de diseño web. Su función concreta es revisar candidatos a problema detectados por unas noventa comprobaciones deterministas (contraste real tras aplicar opacidad de padres, alturas inconsistentes en una misma fila, sombras de color casi duplicadas, estilos de foco divergentes entre componentes similares) y decidir si cada candidato es un problema real o una decisión de diseño aceptable.

El modelo surge de la constatación de que las herramientas basadas en reglas, como axe-core, no reportan ciertos defectos que requieren contexto visual y de maquetación. La pipeline completa mide la página renderizada en un navegador headless, convierte las mediciones en una lista corta de candidatos con sus números y deja que este adaptador emita el juicio final en formato JSON. El modelo por sí solo no puede auditar una página: necesita la lista de candidatos del paso determinista.

Con 4B parámetros en el modelo base, licencia Apache-2.0 y un repositorio de 0,8 GB, el adaptador está pensado como segunda opinión junto a un comprobador de reglas y como punto de partida para investigación en modelos pequeños de auditoría especializada. El autor lo etiqueta explícitamente como investigación y advierte de que no sustituye una auditoría de accesibilidad ni las pruebas con tecnología de asistencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-4B) con adaptador LoRA (rank 32) |
| Parámetros totales | 4B en el modelo base; el adaptador LoRA añade un conjunto reducido de pesos (tamaño del repo: 0,8 GB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la información proporcionada (existe un repositorio cuantizado referenciado por el autor, sin especificar formatos) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (PEFT/LoRA); el repositorio incluye la carpeta `pipeline` con el código del extractor |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B, un transformer decoder-only de 4B parámetros, mediante LoRA de rango 32. El entrenamiento consistió en dos pasadas sobre una GPU A40. El conjunto de datos se compone de unas 260 páginas escritas por modelos de lenguaje en 55 familias de estilos visuales y unas 770 páginas generadas, cada una con problemas plantados y excepciones deliberadas que se parecen a defectos pero son decisiones de diseño válidas. Las comprobaciones deterministas convirtieron ese material en aproximadamente 15.000 hallazgos candidatos, etiquetados como reales o aceptables. El dataset no está publicado.

La innovación técnica no reside en el modelo en sí, sino en el diseño de la pipeline: las comprobaciones deterministas hacen la aritmética (contraste, tamaños, espaciado) y el modelo solo aporta juicio contextual sobre cada candidato, leyendo la definición de la regla y los componentes vecinos. La selección del checkpoint y del umbral de decisión se hizo por la puntuación de la pipeline completa sobre páginas de validación escritas por autores, no por la pérdida de entrenamiento. El umbral es ajustable en `pipeline/config.json` para intercambiar precisión por exhaustividad.

## Capacidades

- Clasificación de candidatos a defecto de accesibilidad y consistencia de diseño como problema real o elección aceptable.
- Detección de texto demasiado tenue una vez contabilizada la opacidad de un padre semitransparente.
- Detección de controles en una misma fila con alturas distintas.
- Detección de sombras de color casi duplicadas.
- Detección de estilos de foco que difieren entre componentes similares.
- Emisión de hallazgos en formato JSON estructurado.
- Capacidad de descartar falsos positivos en decisiones de diseño deliberadas (por ejemplo, padding extra junto a un icono final).
- Integración en pipeline con navegador headless y extractor en Node.js/Playwright.
- No soporta visión nativa, audio ni tool calling general: su entrada es la lista de candidatos generada por el paso determinista.

## Casos de uso

- Segunda opinión sobre auditores basados en reglas: se ejecuta junto a axe-core u otra herramienta para cubrir defectos que las reglas no reportan, como contrastes efectivos tras opacidad o inconsistencias de altura entre controles de una misma fila.
- Revisión de consistencia de diseño en sistemas de componentes: el modelo compara estilos de foco y sombras de color entre componentes similares y señala divergencias que un revisor humano podría pasar por alto en catálogos grandes.
- Filtrado de falsos positivos en pipelines de CI: al integrarse en un flujo automatizado, reduce el ruido de las comprobaciones deterministas descartando candidatos que son decisiones de diseño válidas, con una precisión reportada del 61 % en estilos no vistos.
- Investigación en modelos pequeños especializados: sirve como base reproducible (LoRA rank 32, Apache-2.0) para estudiar hasta qué punto un modelo de 4B aporta juicio sobre comprobaciones deterministas frente a un clasificador de texto plano.
- Auditoría previa a publicación de páginas generadas por modelos: dado que el dataset de entrenamiento procede de páginas escritas por LLM en 55 familias de estilos, encaja en flujos donde el HTML se genera automáticamente y conviene detectar defectos antes del despliegue.
- Evaluación comparativa de sistemas de auditoría: el umbral de decisión configurable permite generar curvas de precisión-exhaustividad para comparar el sistema con alternativas basadas en reglas o en modelos grandes.
- Detección de candidatos en modo `--dry-run`: la pipeline puede listar los candidatos sin invocar al modelo, útil para depurar las comprobaciones deterministas antes de añadir la capa de juicio.

## Benchmarks y rendimiento

Resultados en porcentaje, medidos sobre 50 páginas con estilos visuales no vistos en entrenamiento y 50 páginas en estilos familiares escritos por autores distintos. La puntuación de coincidencia es F1 sobre pares (regla, componente).

| Estilos no vistos (50 páginas) | PageAudit | Claude Sonnet 5.5 | Script de contraste simple | Clasificador de texto, mismos candidatos |
|---|---|---|---|---|
| Puntuación de coincidencia, todas las reglas | 51 % | 27 % | 34 % | 28 % |
| Puntuación de coincidencia, excluyendo contraste | 38 % | 25 % | 0 % | 20 % |
| Problemas reales encontrados (exhaustividad) | 44 % | 67 % | 22 % | 51 % |
| Hallazgos correctos (precisión) | 61 % | 17 % | 81 % | 19 % |
| Falsas alarmas en páginas sin defectos (menor es mejor) | 33 % | 83 % | 8 % | 75 % |

| Estilos familiares (50 páginas) | PageAudit | Claude Sonnet 5.5 | Script de contraste simple | Clasificador de texto, mismos candidatos |
|---|---|---|---|---|
| Puntuación de coincidencia, todas las reglas | 66 % | 25 % | 52 % | 50 % |
| Puntuación de coincidencia, excluyendo contraste | 43 % | 22 % | 0 % | 33 % |

El intervalo de confianza del 95 % para la puntuación de coincidencia de PageAudit en estilos no vistos es del 40 % al 60 %. Las etiquetas fueron plantadas por los autores del dataset, de modo que los problemas reales no plantados cuentan en contra de todos los sistemas y rebajan las cifras de precisión. Claude Sonnet 5.5 recibió un resumen textual de la página completa con instrucciones, sin ejemplos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa para un modelo base de 4B, la inferencia en fp16 requiere del orden de 8-10 GB de VRAM, y en cuantización de 4 bits alrededor de 3-4 GB, aunque el autor no publica cifras concretas.
- GPU recomendadas: el entrenamiento se realizó en una única GPU A40. Para inferencia, cualquier GPU con capacidad suficiente para el modelo base de 4B debería bastar; no se especifican modelos concretos.
- GPU de consumo: probablemente cabe en GPU de consumo con 8 GB o más de VRAM en cuantización, pero no hay confirmación del autor.
- Opciones de despliegue: la pipeline oficial usa Python (`audit_page.py`) más un extractor en Node.js con Playwright y Chromium. El adaptador es PEFT/LoRA sobre safetensors, por lo que puede servirse con frameworks compatibles con PEFT (vLLM, TGI, transformers), aunque el autor no documenta configuraciones de despliegue alternativas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PageAudit (Qwen3.5-4B LoRA) | 4B (base) + LoRA | No disponible | Juicio sobre candidatos de auditoría web | Apache-2.0 | Hugging Face (26 descargas) |
| Claude Sonnet 5.5 | No disponible | No disponible | LLM general con resumen textual de la página | Propietaria | API comercial |
| Script de contraste simple | No aplica | No aplica | Regla determinista de contraste WCAG | No aplica | Código propio |
| Clasificador de texto (bag-of-words) | No disponible | No aplica | Clasificación sobre los mismos candidatos | No disponible | Entrenado por los autores |

La comparación relevante es de comportamiento, no de tamaño: PageAudit obtiene mayor precisión (61 % frente a 17 %) y muchas menos falsas alarmas (33 % frente a 83 %) que Claude Sonnet 5.5 en estilos no vistos, pero menor exhaustividad (44 % frente a 67 %). Frente al script de contraste, gana en cobertura de reglas no relacionadas con contraste (38 % frente a 0 %) y pierde en precisión de contraste (61 % frente a 81 %).

## Limitaciones y advertencias

- Las etiquetas del dataset son generadas o escritas por modelos y no fueron revisadas por auditores humanos.
- La exhaustividad está acotada por las comprobaciones deterministas: los problemas que estas no pueden medir (estados hover, detalles de iconos, el significado del texto) no se detectan.
- El sistema ve un único viewport y un único estado de la página.
- El modelo no puede auditar una página por sí solo: requiere la lista de candidatos generada por la pipeline determinista.
- Solo soporta inglés.
- El umbral de decisión está ajustado para el mejor equilibrio en páginas de validación; bajarlo intercambia precisión por exhaustividad.
- El dataset de entrenamiento no está publicado, lo que limita la reproducibilidad.
- Estado de investigación: el propio autor lo califica de research preview y recomienda tratar la salida como sugerencias a verificar contra la página.
- No sustituye una auditoría de accesibilidad ni las pruebas con tecnología de asistencia.
- Licencia Apache-2.0 heredada del modelo base; permite uso comercial, pero las limitaciones anteriores siguen aplicando en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aixonlab/PageAudit-Qwen3.5-4B-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de la pipeline: carpeta `pipeline` dentro del repositorio del modelo (incluye `audit_page.py`, `extractor` con Node.js/Playwright y `pipeline/config.json`)
- Paper, blog o demo: no disponible en la información proporcionada.
