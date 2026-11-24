# ChaitanyaLaxman/cve2cwe-qwen3.5-4b

## Resumen

cve2cwe-qwen3.5-4b es un adaptador LoRA (y su versión fusionada en GGUF) construido sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por ChaitanyaLaxman. Su tarea es concreta y acotada: recibe la descripción en inglés de una vulnerabilidad CVE y devuelve el identificador CWE que un analista del NVD (National Vulnerability Database) asignaría a esa vulnerabilidad. Se trata, por tanto, de un modelo de clasificación especializado dentro del dominio de la seguridad del software, no de un modelo de propósito general.

El modelo base Qwen3.5-4B aporta una arquitectura transformer densa con aproximadamente 4.326 millones de parámetros (4,33 mil millones), licencia Apache 2.0 y capacidades conversacionales. Sobre esa base, el autor ha entrenado un adaptador LoRA utilizando descripciones públicas de CVE del NVD junto con las etiquetas CWE que los analistas de dicho organismo asignaron históricamente. El resultado es un sistema que automatiza una parte del triaje de vulnerabilidades, una tarea tradicionalmente manual y costosa en equipos de seguridad.

La relevancia del modelo radica en su enfoque vertical: en lugar de competir en capacidades generales, resuelve un problema operativo concreto del ciclo de vida de gestión de vulnerabilidades. El repositorio incluye tanto los pesos en safetensors (adaptador LoRA) como una cuantización GGUF Q4_K_M de los pesos fusionados para su uso con llama.cpp, lo que facilita el despliegue en entornos con recursos limitados. El proyector multimodal del modelo base no está incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen/Qwen3.5-4B) con adaptador LoRA |
| Parametros totales | 4.326.350.848 (4,33 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `-c 4096`) |
| Tipos de cuantizacion | GGUF Q4_K_M (incluida en el repositorio); pesos safetensors sin cuantizar |
| Idiomas soportados | no disponible (las descripciones CVE de entrada están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) y GGUF (pesos fusionados Q4_K_M) |

## Arquitectura y entrenamiento

El modelo se apoya en Qwen/Qwen3.5-4B, un transformer denso de 4,33 mil millones de parámetros. Sobre él se entrena un adaptador LoRA cuyo objetivo es mapear descripciones textuales de CVE a un único identificador CWE. El autor indica que el entrenamiento utilizó descripciones públicas de CVE del NVD y las etiquetas CWE que los analistas de NVD asignaron a esas vulnerabilidades, lo que constituye un conjunto de datos supervisado de dominio específico y de etiquetado humano.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, el rango del adaptador LoRA ni si se aplicaron técnicas de alineación adicionales (RLHF, DPO). El repositorio publica una cuantización Q4_K_M de los pesos fusionados (adaptador más base) destinada a llama.cpp; el proyector multimodal del modelo base queda excluido, de modo que el resultado es efectivamente unimodal (texto). El ejemplo de despliegue del autor desactiva el modo de razonamiento (`--reasoning off`) y fija temperatura 0, lo que sugiere un uso determinista orientado a clasificación.

## Capacidades

- Clasificación de vulnerabilidades: dada una descripción CVE en inglés, devuelve un identificador CWE único, emulando el criterio de un analista del NVD.
- Generación de texto conversacional heredada del modelo base Qwen3.5-4B (formato `conversational` en los tags del repositorio).
- Modo de razonamiento (thinking) del modelo base, desactivable mediante el flag `--reasoning off` en llama.cpp 1.0.0.
- Despliegue compatible con endpoints (tag `endpoints_compatible`).
- No incluye capacidades multimodales: el proyector multimodal no está incluido en el repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas para esta variante.

## Casos de uso

- Triaje automatizado de vulnerabilidades: dado un flujo de nuevas CVE, el modelo asigna un CWE candidato a cada descripción, lo que permite priorizar y enrutar revisiones manuales en equipos de seguridad con alto volumen de entradas.
- Enriquecimiento de bases de datos internas: integración en pipelines que ingieren avisos de seguridad para poblar el campo CWE de un inventario de vulnerabilidades, reduciendo el trabajo manual de clasificación.
- Preetiquetado para analistas humanos: el modelo genera una primera propuesta de CWE que el analista revisa y corrige, acelerando el proceso sin eliminar la supervisión experta.
- Filtrado y agrupación por debilidad: clasificar CVE por CWE permite agrupar vulnerabilidades por tipo de debilidad (por ejemplo, inyección, desbordamiento) y aplicar políticas de remediación específicas por categoría.
- Análisis de dependencias en CI/CD: en un pipeline de seguridad de la cadena de suministro, el modelo puede clasificar las vulnerabilidades detectadas en dependencias y decidir qué categorías de debilidad requieren bloqueo de despliegue o revisión prioritaria.
- Investigación y docencia en seguridad: el modelo sirve como herramienta de referencia para estudiar la relación entre descripciones de CVE y taxonomía CWE, así como para experimentos de clasificación de texto en dominio de ciberseguridad.
- Despliegue en entornos con recursos limitados: gracias a la cuantización Q4_K_M y a llama.cpp, puede ejecutarse en infraestructura modesta sin GPU de gran capacidad, lo que facilita su uso en equipos pequeños o en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor remite a https://github.com/claxman/cve2cwe para consultar resultados y limitaciones, pero no se incluyen cifras en la model card proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,9 GB e incluye una cuantización Q4_K_M; con 4,33 mil millones de parámetros, la inferencia en Q4_K_M requiere del orden de 3 GB de memoria, mientras que los pesos en precisión completa (safetensors) requieren aproximadamente 8,6 GB solo para los pesos, más overhead de contexto y activaciones.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo es apto para GPU de consumo con suficiente VRAM.
- ¿Cabe en GPU de consumo? Sí, en principio: la cuantización Q4_K_M (unos 3 GB) cabe en GPU de consumo con 6-8 GB de VRAM o más; los pesos sin cuantizar requieren GPU con al menos 10-12 GB de VRAM para operar con holgura.
- Opciones de despliegue: llama.cpp (documentado por el autor con `llama-server`), y por compatibilidad de formato, servidores que acepten safetensors/adaptadores LoRA (vLLM, TGI, entre otros) aunque no se documentan explícitamente en la información disponible.
- Latencia y throughput estimados: no disponibles. El autor recomienda fijar temperatura 0 y desactivar el razonamiento para uso determinista, lo que reduce el coste de generación frente a un modo con cadena de pensamiento.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables especializados en la tarea CVE a CWE en la documentación proporcionada. Como referencia del modelo base:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cve2cwe-qwen3.5-4b | 4,33 mil millones | no disponible | Clasificación CVE a CWE | Apache 2.0 | Hugging Face (adaptador LoRA + GGUF) |
| Qwen/Qwen3.5-4B (base) | 4,33 mil millones | no disponible | Propósito general | Apache 2.0 | Hugging Face |
| Alternativas especializadas en CVE/CWE | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para una única tarea (asignar un CWE a una descripción CVE en inglés); su uso fuera de ese dominio no está validado.
- Dependencia del idioma: las descripciones de entrada del entrenamiento están en inglés; el comportamiento con descripciones en otros idiomas no está documentado.
- Riesgo de alucinación: al ser un modelo generativo, puede producir identificadores CWE inexistentes o incorrectos; se recomienda validar la salida contra el catálogo oficial de CWE.
- Sesgos del etiquetado: el modelo aprende los criterios y posibles inconsistencias de los analistas del NVD reflejados en los datos de entrenamiento; la calidad de la etiqueta hereda los sesgos del proceso humano.
- Sin datos de evaluación publicados en la model card: no se aportan métricas de precisión, recall ni comparativas, lo que dificulta estimar su fiabilidad en producción.
- El repositorio no incluye el proyector multimodal del modelo base, por lo que no admite entradas de imagen.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exactitud de las clasificaciones en contextos críticos de seguridad.
- Despliegue: el ejemplo documentado depende de llama.cpp 1.0.0 y del flag `--reasoning off`; otras configuraciones no están validadas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChaitanyaLaxman/cve2cwe-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Resultados y limitaciones (repositorio del autor): https://github.com/claxman/cve2cwe
