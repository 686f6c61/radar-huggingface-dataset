# Anvaya-sh/Rutam-33B

## Resumen

Rutam 33B es un modelo de lenguaje especializado en ciberseguridad defensiva (white-hat) desarrollado por Anvaya.sh, una organización con sede en India. Se construye mediante la fusión de los adaptadores LoRA del proyecto Rutam y los tokens especiales del esquema de razonamiento Sandhana directamente sobre el modelo base Nanbeige/Nanbeige4.3-33B, dando como resultado un modelo standalone unificado de 33.107.522.560 parámetros en precisión BF16. El modelo se distribuye con licencia Apache 2.0 y está orientado exclusivamente al idioma inglés.

El modelo aborda un nicho concreto: el análisis de vulnerabilidades, el seguimiento de flujo de datos contaminados (taint tracking), la remediación automatizada de parches y la generación de informes de auditoría de seguridad. Su entrenamiento introduce una estructura canónica de trazas de razonamiento denominada Sandhana, que organiza el proceso de resolución en fases explícitas y verificables, culminando en una aserción determinista del resultado de las pruebas.

Su relevancia actual reside en la creciente demanda de asistentes de seguridad que operen dentro de límites estrictos de defensa: el modelo declara explícitamente cero tolerancia a exploits activos, reverse shells, shellcode o payloads de ejecución remota de código. Con 33B parámetros y un repositorio de 66,2 GB, se posiciona en la franja de modelos medianos-grandes desplegables en infraestructura de una o varias GPU de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Nanbeige4.3-33B) |
| Parametros totales | 33.107.522.560 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Nanbeige/Nanbeige4.3-33B, un transformer decoder-only de 33.107.522.560 parámetros en BF16. Sobre esta base, el autor ha fusionado (merge) los adaptadores LoRA del proyecto Rutam junto con los tokens especiales de Sandhana, produciendo un único checkpoint standalone en lugar de requerir la carga separada de adaptadores. El repositorio ocupa 66,2 GB, coherente con un modelo de 33B en BF16 más los ficheros auxiliares.

El entrenamiento se articula en torno al esquema Sandhana de trazas de razonamiento, cuya estructura canónica es `<ASAYA>` → `<SANKALPA>` → `<YUKTI>` `<PRATIKRIYA>` (en bucle) → `<CANDIDATE_READY>` → `<PRAMANA>` → `<PARISKARA>` → `<SIDDHI>`. Esta secuencia impone fases explícitas de análisis, planificación, razonamiento iterativo, verificación determinista y refinamiento. El modelo declara invariantes de comportamiento estrictos: especialización exclusiva en defensa, prohibición de exploits activos y aserción determinista del resultado de pruebas (PASSED, FAILED o INCONCLUSIVE con causa raíz). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Análisis de vulnerabilidades y diagnóstico de fallos de seguridad en código.
- Taint tracking (seguimiento de flujo de datos contaminados) para identificar rutas de entrada no sanitizadas.
- Remediación automatizada de parches y generación de código seguro en Rust, Python y TypeScript.
- Generación de informes de auditoría de seguridad estructurados.
- Razonamiento multi-paso mediante la estructura Sandhana con fases explícitas y verificables.
- Verificación determinista de resultados de pruebas con causa raíz documentada.
- Restricción activa de contenido ofensivo: sin exploits en vivo, reverse shells, shellcode, `curl | bash` ni payloads RCE.
- Capacidades multilingües limitadas al inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Revisión de seguridad en pipelines de CI/CD: el modelo puede analizar diffs y parches antes de su fusión, aplicando taint tracking para detectar entradas no sanitizadas y proponiendo correcciones concretas en Rust, Python o TypeScript.
- Auditoría de código en producción: genera informes estructurados de hallazgos siguiendo la traza Sandhana, con fases de análisis, verificación y refinamiento que facilitan la revisión por parte de equipos de AppSec.
- Remediación automatizada de vulnerabilidades: dado un hallazgo (por ejemplo, una inyección SQL o un path traversal), produce un parche candidato y lo somete a la fase `<PRAMANA>` para registrar el resultado de las pruebas con causa raíz.
- Formación y concienciación en seguridad defensiva: sirve como asistente que explica fallos y su corrección sin generar material ofensivo, adecuado para entornos educativos con restricciones de contenido.
- Asistencia a equipos de respuesta a incidentes: ayuda a interpretar trazas y a proponer mitigaciones defensivas dentro de los límites estrictos del modelo (sin payloads activos).
- Integración en herramientas SAST/DAST como capa de razonamiento: consume resultados de analizadores estáticos y produce explicaciones y parches priorizados por severidad.
- Generación de código seguro por defecto: asistente de programación que, al escribir Rust, Python o TypeScript, aplica patrones de sanitización y validación de entradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, aproximadamente 66 GB solo para pesos, más overhead de activaciones y caché KV; se requieren al menos 2 GPU de 40 GB o 1 GPU de 80 GB.
- En cuantización de 8 bits, el peso se reduce a unos 33 GB, viable en una A100 40 GB o H100 40 GB con margen limitado.
- En cuantización de 4 bits, el peso se reduce a unos 17-18 GB, potencialmente desplegable en una RTX 4090 (24 GB) con contexto reducido.
- GPU recomendadas: A100 80 GB, H100 80 GB para BF16; A100 40 GB o L40S para 8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) únicamente con cuantización de 4 bits y contexto limitado; no cabe en BF16 ni en 8 bits en GPU de 24 GB o menos.
- Opciones de despliegue: transformers (carga directa con `trust_remote_code=True`), vLLM, TGI y llama.cpp/Ollama previa conversión a GGUF (no se distribuye GGUF en el repositorio).
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rutam 33B | 33,1B | no disponible | Ciberseguridad defensiva (white-hat) | Apache 2.0 | Hugging Face |
| Nanbeige4.3-33B (base) | 33,1B | no disponible | Modelo generalista | no disponible en la informacion | Hugging Face |
| Modelos de seguridad especializados de 30-35B | no disponible | no disponible | Seguridad / analisis de codigo | variable | no disponible |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas de la misma categoría en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos de 33B, especialmente en la generación de parches o en la interpretación de trazas de razonamiento; las aserciones `<PRAMANA>` no sustituyen a la verificación real en CI.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de un modelo base generalista, puede heredar sesgos de este.
- Longitud de contexto no documentada, lo que dificulta planificar su uso en auditorías de ficheros extensos o repositorios completos.
- Las restricciones de contenido ofensivo son un invariante declarado por el autor, no una garantía formal; deben complementarse con filtros y políticas en producción.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Nanbeige debe verificarse de forma independiente para confirmar compatibilidad de licencias en despliegues comerciales.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; madurez y validación externa limitadas.
- No se distribuyen pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio, lo que obliga a conversion propia para despliegues en hardware limitado.
- El uso de `trust_remote_code=True` implica ejecutar código del repositorio; debe auditarse antes de su uso en entornos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anvaya-sh/Rutam-33B
- Organización Anvaya.sh: https://huggingface.co/Anvaya-sh
- Modelo base Nanbeige4.3-33B: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Repositorio de adaptadores LoRA Rutam (referenciado en la model card): https://huggingface.co/Anvaya-sh/Rutam
