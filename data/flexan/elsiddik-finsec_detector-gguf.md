# Flexan/elsiddik-finsec_detector-GGUF

## Resumen

FineSec-Detector es un modelo de lenguaje especializado en ciberseguridad, desarrollado por elsiddik como un fine-tune de Qwen2.5-Coder-7B-Instruct mediante QLoRA 4-bit con la librería Unsloth. Esta versión GGUF, publicada por Flexan, permite ejecutar el modelo en entornos con recursos limitados mediante cuantización. El modelo actúa como un auditor de seguridad de aplicaciones (AppSec) automatizado: analiza código fuente, detecta vulnerabilidades, las clasifica según CWE y severidad CVSS, y genera parches de código seguro en formato JSON estructurado.

Con 7,6 mil millones de parámetros y una ventana de contexto de entrenamiento de 1024 tokens, está diseñado para tareas de auditoría de código en múltiples lenguajes (Python, C/C++, JavaScript, Go, PHP, Java y Bash). Su relevancia actual radica en la creciente demanda de herramientas de seguridad integrables en pipelines de CI/CD, donde la salida JSON estandarizada facilita la automatización. La licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (contexto de entrenamiento; el modelo base soporta hasta 32K) |
| Tipos de cuantizacion | Q2_K, Q4_K_M, Q8_0, f16 (formato GGUF) |
| Idiomas soportados | Ingles y codigo (Python, C/C++, JavaScript, Go, PHP, Java, Bash) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible en el repositorio original) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder-only de Qwen2.5-Coder-7B-Instruct, con atención causal y 7,6B parámetros. El fine-tune se realizó mediante QLoRA 4-bit con Unsloth, aplicando LoRA con rango 16 y alpha 32 sobre los módulos de proyección (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). Los datos de entrenamiento incluyen informes de vulnerabilidades CVE de alta precisión, benchmarks de exploits reales y patrones de reparación de código seguro, aunque no se especifica el número total de tokens ni la composición exacta del dataset. No se menciona el uso de RLHF o DPO; el entrenamiento se limita a supervisión fina con QLoRA.

## Capacidades

- Deteccion automatizada de vulnerabilidades en codigo fuente de multiples lenguajes (Python, C/C++, JavaScript, Go, PHP, Java, Bash).
- Clasificacion de vulnerabilidades segun CWE (CWE-89 SQLi, CWE-79 XSS, CWE-78 RCE, CWE-120 Buffer Overflow, etc.) y severidad alineada con CVSS (CRITICAL, HIGH, MEDIUM, LOW).
- Generacion de parches de codigo seguro: produce diffs y refactorizaciones que reemplazan la logica vulnerable.
- Salida estructurada en JSON con campos estandarizados (is_vulnerable, severity, cwe, vulnerability_type, description, vulnerable_code, remediation, fixed_code), apta para integracion en pipelines CI/CD.
- Capacidad de razonamiento sobre codigo gracias a la base Qwen2.5-Coder, que incluye entrenamiento en instrucciones y generacion de codigo.
- Soporte de tool calling limitado: no se documenta explicitamente, pero la salida JSON estructurada puede interpretarse como invocacion de herramientas externas.

## Casos de uso

- Auditoria de seguridad en CI/CD: integrar el modelo como paso de analisis estatico en pipelines de integracion continua. Su salida JSON permite que herramientas como Jenkins o GitHub Actions generen informes automaticos y bloqueen merges si se detectan vulnerabilidades criticas.
- Revision de pull requests: analizar diffs de codigo en repositorios para detectar vulnerabilidades antes de la fusion, reduciendo el tiempo de revision manual por parte de equipos de seguridad.
- Generacion de parches automaticos: cuando se detecta una vulnerabilidad, el modelo produce codigo corregido listo para fusionar, acelerando la remediacion en proyectos con deuda tecnica de seguridad.
- Formacion de desarrolladores: usar el modelo como herramienta educativa que explica vulnerabilidades y muestra ejemplos de codigo seguro, ayudando a equipos junior a aprender buenas practicas.
- Analisis de codigo legacy: auditar aplicaciones antiguas sin documentacion para identificar riesgos de seguridad antes de una migracion o actualizacion.
- Cumplimiento normativo: generar informes de seguridad estandarizados (con CWE y severidad) para auditorias de cumplimiento (ISO 27001, SOC 2) de forma automatizada.

## Benchmarks y rendimiento

Segun la model card del autor, el modelo fue evaluado en benchmarks de vulnerabilidades multi-lenguaje (SQL Injection, RCE, XSS, Path Traversal, Insecure Deserialization, Buffer Overflows) con los siguientes resultados:

| Metrica | Puntuacion | Valoracion |
|---|---|---|
| Precision | 100,0% | Perfecta: cero falsos positivos |
| Recall | 83,3% | Alto: deteccion de alta confianza en Python, C, JS y Go |
| F1 | 90,9% | Sobresaliente: equilibrio general de deteccion |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M (~4,5-5 GB), Q8_0 (~8 GB) y Q2_K (~3 GB). El modelo f16 requiere ~15 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para Q4_K_M (p. ej., RTX 2060, RTX 3060, RTX 4060). Para Q8_0 se recomienda 8-10 GB (RTX 3080, RTX 4070, A10). Para f16, GPU de 16 GB o mas (A100, RTX 4090).
- Compatibilidad con GPU de consumo: si, las cuantizaciones Q2_K y Q4_K_M caben en GPUs de gama media (6-8 GB).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores de inferencia compatibles con GGUF (llama-cpp-python, text-generation-inference con backend llama.cpp).
- Latencia y throughput: no se han publicado datos especificos. Para un modelo de 7,6B en Q4_K_M, se estima una velocidad de 20-40 tokens/s en una RTX 3090, y 10-20 tokens/s en una RTX 3060, dependiendo de la implementacion.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos publicados con otros modelos de deteccion de vulnerabilidades. Como referencia, el modelo base Qwen2.5-Coder-7B-Instruct ofrece capacidades generales de generacion de codigo, pero sin especializacion en seguridad. Otros modelos como WhiteRabbitNeo (7B) o SecCode (CodeLlama-7B) existen en el espacio de seguridad, pero no hay datos de comparacion directa en la informacion proporcionada.

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| FineSec-Detector (este) | 7,6B | 1024 (entrenamiento) | Deteccion de vulnerabilidades y parches | Apache-2.0 |
| Qwen2.5-Coder-7B-Instruct (base) | 7,6B | 32K | Generacion de codigo general | Apache-2.0 |
| WhiteRabbitNeo-7B | 7B | 4K | Seguridad ofensiva y defensiva | No comercial (uso restringido) |

## Limitaciones y advertencias

- Ventana de contexto limitada a 1024 tokens durante el entrenamiento: puede ser insuficiente para analizar archivos de codigo grandes o funciones extensas. Se recomienda dividir el codigo en fragmentos.
- Recall del 83,3%: existe un 16,7% de falsos negativos, por lo que el modelo no debe usarse como unico mecanismo de seguridad; se recomienda complementar con otras herramientas de analisis estatico.
- Solo soporta ingles y codigo: no es adecuado para analizar comentarios o documentacion en otros idiomas.
- Riesgo de alucinacion en la generacion de parches: aunque la precision es alta, el codigo corregido debe ser revisado por un desarrollador antes de fusionarse en produccion.
- Uso exclusivamente defensivo: el modelo esta disenado para auditoria y reparacion, no para explotacion ofensiva. Los usuarios son responsables de un uso etico y legal.
- Sesgos potenciales: al entrenarse con datos de CVE y exploits, puede tener un sesgo hacia vulnerabilidades conocidas y no detectar patrones novedosos o especificos de ciertos frameworks.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Flexan/elsiddik-finsec_detector-GGUF
- Modelo original: https://huggingface.co/elsiddik/finsec_detector
- Perfil de Flexan: https://huggingface.co/Flexan/Flexan
- Libreria Unsloth: https://github.com/unslothai/unsloth
