# aixonlab/PageAudit-Qwen3.5-4B

## Resumen

PageAudit (Qwen3.5-4B) es un ajuste fino supervisado del modelo Qwen/Qwen3.5-4B desarrollado por aixonlab, orientado a la auditoría automática de accesibilidad y consistencia de diseño en páginas web renderizadas. A diferencia de las herramientas basadas en reglas como axe-core, el modelo no calcula contrastes ni mide tamaños: recibe una lista de candidatos producida por unos noventa chequeos deterministas (que sí hacen la aritmética) y decide, para cada candidato, si constituye un problema real o una decisión de diseño aceptable. El resultado se devuelve como hallazgos en JSON.

El modelo tiene 4.659.865.088 parámetros (4,66 mil millones) y se distribuye en formato safetensors con licencia Apache-2.0, heredada del modelo base. Está entrenado exclusivamente en inglés y se publica como research preview: el autor advierte que no sustituye a una auditoría de accesibilidad ni a pruebas con tecnología de asistencia.

Su relevancia actual radica en el enfoque híbrido: separa la parte determinista (medición en navegador headless y comprobaciones aritméticas) de la parte de juicio (el modelo decide si el candidato es un falso positivo), lo que permite reducir falsas alarmas en problemas que los chequeos clásicos no detectan, como texto demasiado tenue por opacidad heredada de un contenedor, controles de una misma fila con alturas distintas o estilos de foco inconsistentes entre componentes similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-4B, ajuste fino LoRA), pipeline image-text-to-text |
| Parametros totales | 4.659.865.088 (4,66 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio apunta a una versión cuantizada separada, sin detallar formatos) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers); tamaño del repo 18,7 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de 4,66 mil millones de parámetros, y se ajusta mediante LoRA de rango 32 durante 2 pasadas en una única GPU A40. El entrenamiento no se hizo sobre páginas completas sin procesar, sino sobre candidatos generados por el pipeline determinista: alrededor de 260 páginas escritas por modelos de lenguaje en 55 familias de estilos visuales y unas 770 páginas generadas, cada una con problemas plantados y excepciones deliberadas que parecen problemas pero no lo son. Los chequeos deterministas convirtieron ese material en aproximadamente 15.000 hallazgos candidatos, cada uno etiquetado como real o aceptable. El conjunto de datos no está publicado.

La innovación técnica no está en el modelo en sí, sino en el diseño del sistema: un navegador headless mide la página (colores renderizados tras aplicar opacidad, tamaños, espaciado, estilos de foco), unos noventa chequeos deterministas producen la lista de candidatos con los números que los respaldan, y el modelo actúa como juez sobre cada candidato junto con la definición de la regla y los componentes vecinos. El checkpoint y el umbral de decisión se eligieron por la puntuación del pipeline completo sobre páginas de validación reservadas, no por la pérdida de entrenamiento. El umbral es ajustable en `pipeline/config.json` para intercambiar precisión por exhaustividad.

## Capacidades

- Evaluación de candidatos de accesibilidad y consistencia de diseño generados por chequeos deterministas, con salida en JSON de hallazgos.
- Detección de problemas que los chequeos basados en reglas no reportan: texto demasiado tenue tras aplicar la opacidad de un contenedor padre, controles en una misma fila con alturas distintas, tonos de color casi duplicados, estilos de foco distintos entre componentes similares.
- Discriminación de decisiones de diseño deliberadas (por ejemplo, padding adicional junto a un icono final) frente a defectos reales.
- Procesamiento de entrada multimodal image-text-to-text según los tags del repositorio (la model card describe la entrada como candidatos, definición de regla y componentes vecinos).
- Generación de texto conversacional y text-generation según los tags del repositorio.
- No soporta, según la información disponible, tool calling, function calling, razonamiento multi-paso tipo agente ni capacidades de audio.

## Casos de uso

- Segunda opinión junto a un comprobador basado en reglas: se ejecuta el pipeline sobre una página y se usa el modelo para filtrar los candidatos que axe-core u otras herramientas no reportan, reduciendo el ruido que llega al equipo de accesibilidad. Es el uso previsto explícito del autor.
- Revisión de contraste con opacidad heredada: en páginas con contenedores semitransparentes, el modelo decide si el texto resulta ilegible una vez aplicada la opacidad del padre, un cálculo que las herramientas de contraste estáticas no realizan correctamente.
- Control de consistencia visual en sistemas de diseño: se detectan alturas distintas en controles de una misma fila, tonos de color casi idénticos y estilos de foco divergentes entre componentes que deberían comportarse igual, lo que ayuda a mantener la coherencia de una librería de componentes.
- Integración en CI/CD de frontend: el pipeline puede ejecutarse contra páginas renderizadas en un entorno de integración y devolver hallazgos JSON que se conviertan en avisos o bloqueos de merge para regresiones de accesibilidad y consistencia.
- Investigación sobre modelos pequeños especializados en auditoría: el modelo sirve como punto de partida y como referencia metodológica (chequeos deterministas más juez neuronal) para experimentos con datasets propios.
- Triaje previo a una auditoría manual: al priorizar hallazgos con mayor precisión (61% de precisión en estilos no vistos frente al 17% de Claude Sonnet 5.5 en la comparativa del autor), reduce el tiempo que un auditor humano dedica a descartar falsos positivos.
- Validación de páginas generadas por modelos de lenguaje: dado que el entrenamiento incluyó páginas escritas por LLM, el modelo es adecuado para revisar prototipos y páginas sintéticas antes de publicarlas.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor. Todas las cifras son porcentajes; la puntuación de coincidencia es F1 sobre pares (regla, componente). Se midieron sobre 50 páginas con estilos no vistos en entrenamiento y 50 páginas en estilos familiares escritos por autores distintos.

| Estilos no vistos (50 páginas) | PageAudit | Claude Sonnet 5.5 | Script de contraste simple | Clasificador de texto, mismos candidatos |
|---|---|---|---|---|
| Puntuación de coincidencia, todas las reglas | 51% | 27% | 34% | 28% |
| Puntuación de coincidencia, excluyendo contraste | 38% | 25% | 0% | 20% |
| Problemas reales encontrados (recall) | 44% | 67% | 22% | 51% |
| Hallazgos correctos (precisión) | 61% | 17% | 81% | 19% |
| Falsas alarmas en páginas sin defectos (menor es mejor) | 33% | 83% | 8% | 75% |

| Estilos familiares (50 páginas) | PageAudit | Claude Sonnet 5.5 | Script de contraste simple | Clasificador de texto, mismos candidatos |
|---|---|---|---|---|
| Puntuación de coincidencia, todas las reglas | 66% | 25% | 52% | 50% |
| Puntuación de coincidencia, excluyendo contraste | 43% | 22% | 0% | 33% |

El intervalo de confianza del 95% para la puntuación de coincidencia de PageAudit en estilos no vistos es del 40% al 60%. Las etiquetas fueron plantadas por los autores del dataset, por lo que los problemas reales no plantados penalizan a todos los sistemas y rebajan las cifras de precisión. Claude Sonnet 5.5 recibió un resumen textual de la página completa con instrucciones y sin ejemplos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 4,66 mil millones de parámetros, en fp16 el peso ronda los 9,3 GB y en cuantización de 8 bits unos 4,7 GB; estas cifras son estimaciones por tamaño y no datos publicados por el autor.
- GPU recomendadas: el autor entrenó con una única A40. Para inferencia no se especifican GPU concretas.
- Cabe en GPU de consumo: no confirmado por el autor; por tamaño, un modelo de 4,66 mil millones de parámetros en cuantización de 8 o 4 bits es compatible con GPUs de consumo de gama media-alta con VRAM suficiente, pero no hay datos publicados al respecto.
- Opciones de despliegue: transformers (librería declarada); el repositorio incluye una carpeta `pipeline` con un extractor en Node.js que requiere `npm install` y `npx playwright install chromium`, y un script `audit_page.py` que se invoca con `--model`. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PageAudit-Qwen3.5-4B | 4,66 mil millones | no disponible | Juez de candidatos para auditoría web (pipeline determinista + LoRA) | Apache-2.0 | Hugging Face, 122 descargas |
| Claude Sonnet 5.5 | no disponible | no disponible | LLM generalista evaluado con resumen textual de la página | propietaria | API comercial |
| Script de contraste simple | no aplica | no aplica | Regla determinista de contraste WCAG | no aplica | herramienta interna del estudio |
| Clasificador de texto (bag-of-words) | no disponible | no aplica | Clasificador entrenado sobre los mismos candidatos | no disponible | baseline del estudio |

La comparativa relevante es frente a Claude Sonnet 5.5 y los dos baselines del estudio del autor: PageAudit obtiene mayor puntuación de coincidencia y precisión, pero menor recall que Claude Sonnet 5.5 en estilos no vistos (44% frente a 67%). No se dispone de comparación con otros modelos especializados en auditoría web.

## Limitaciones y advertencias

- Las etiquetas del entrenamiento son generadas o escritas por modelos y no fueron revisadas por auditores humanos.
- El recall está acotado por los chequeos deterministas: problemas que estos no pueden medir (estados hover, detalles de iconos, el significado del texto) no se detectan.
- Solo analiza un viewport y un estado de página por ejecución.
- El modelo no puede auditar una página por sí solo: necesita la lista de candidatos producida por el pipeline determinista.
- El idioma soportado es únicamente inglés.
- Los resultados deben tratarse como sugerencias y verificarse contra la página; no sustituyen una auditoría de accesibilidad ni pruebas con tecnología de asistencia.
- Las cifras de benchmarks proceden de una evaluación del propio autor con etiquetas plantadas, lo que puede favorecer al sistema evaluado; el intervalo de confianza del 51% en estilos no vistos es amplio (40%-60%).
- El umbral de decisión está ajustado para el mejor equilibrio en validación; modificarlo altera el balance precisión/recall.
- Licencia Apache-2.0, que permite uso comercial, pero el estado research preview y la falta de revisión humana de las etiquetas desaconsejan usarlo como único mecanismo de control de calidad en producción.
- El dataset de entrenamiento no está publicado, lo que limita la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aixonlab/PageAudit-Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
