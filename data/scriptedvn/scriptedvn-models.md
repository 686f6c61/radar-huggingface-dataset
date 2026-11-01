# scriptedvn/scriptedvn-models

## Resumen

ScriptedVN Models es un repositorio de redistribución de modelos de traducción automática empaquetados para la aplicación de escritorio ScriptedVN, una herramienta de traducción de novelas visuales desarrolladas en Ren'Py. No se trata de un modelo entrenado por el autor del repositorio (scriptedvn), sino de un contenedor que agrupa tres modelos abiertos de terceros, en algunos casos convertidos de formato: MADLAD-400 3B convertido a CTranslate2 int8, Hy-MT2 1.8B en GGUF Q4_K_M y Qwen3.5-4B en GGUF Q4_K_M con proyector multimodal (mmproj).

El propósito es práctico: la aplicación descarga estos ficheros desde una revisión fija y verifica su integridad mediante SHA-256, de modo que el usuario final obtiene modelos listos para inferencia local sin tener que gestionar conversiones de formato. El repositorio incluye el tag `endpoints_compatible`, lo que sugiere compatibilidad con la API de Hugging Face Inference Endpoints, y el tag `imatrix`, que indica que algunas cuantizaciones GGUF se generaron con matrices de importancia.

El tamaño total del repositorio es de 7,5 GB y el recuento de parámetros reportado en safetensors es de 4.205.751.296, cifra que corresponde a Qwen3.5-4B y no al conjunto agregado de los tres modelos. La licencia declarada es Apache-2.0, aunque la model card aclara que cada carpeta conserva la licencia de su modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (repositorio agregado; los modelos subyacentes son transformers, sin detalle de arquitectura en la informacion proporcionada) |
| Parametros totales | 4.205.751.296 (reportado en safetensors; corresponde a Qwen3.5-4B, no al agregado) |
| Parametros activos | No aplica (no se indica que ningun componente sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | CTranslate2 int8 (MADLAD-400 3B); GGUF Q4_K_M (Hy-MT2 1.8B y Qwen3.5-4B); se menciona uso de imatrix |
| Idiomas soportados | Multilingue (sin listado de idiomas en la informacion proporcionada) |
| Licencia | Apache-2.0 (cada carpeta conserva la licencia de su modelo original) |
| Formato de pesos | CTranslate2 (int8) y GGUF (Q4_K_M), mas mmproj para el componente multimodal de Qwen3.5-4B |

## Arquitectura y entrenamiento

El repositorio no documenta arquitectura ni proceso de entrenamiento propios: es una colección de artefactos de inferencia derivados de modelos de terceros. Los tres componentes son modelos transformer de traducción y generación de texto. MADLAD-400 3B es un modelo multilingüe de traducción automática de Google, aquí convertido a CTranslate2 con cuantización int8 para reducir el uso de memoria y acelerar la inferencia en CPU. Hy-MT2 1.8B es un modelo de traducción de Tencent distribuido en GGUF Q4_K_M, formato orientado a llama.cpp y compatible con Ollama. Qwen3.5-4B se distribuye en GGUF Q4_K_M junto con un fichero mmproj, lo que indica soporte de entrada multimodal (vision) en el modelo original.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La presencia del tag `imatrix` sugiere que las cuantizaciones GGUF se calibraron con matrices de importancia para preservar mejor la calidad en 4 bits, una técnica habitual en cuantización de modelos grandes. El autor indica que los ficheros están "sin modificar o convertidos de formato", por lo que las innovaciones técnicas corresponden a los modelos originales y no a este repositorio.

## Capacidades

- Traducción automática multilingüe, con MADLAD-400 3B e Hy-MT2 1.8B como motores principales para pares de idiomas.
- Generación de texto conversacional y razonamiento mediante Qwen3.5-4B.
- Procesamiento multimodal en Qwen3.5-4B: el fichero mmproj habilita entrada de imágenes junto con texto.
- Integración en la aplicación ScriptedVN para traducir guiones de novelas visuales Ren'Py.
- Inferencia local en CPU y GPU según el formato: CTranslate2 para CPU eficiente, GGUF para llama.cpp.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite desplegar los modelos tras una API compatible con Hugging Face.
- Verificación de integridad por SHA-256 y descarga desde revisión fija, orientada a reproducibilidad en producción.

## Casos de uso

- Traducción de guiones de novelas visuales Ren'Py: la aplicación ScriptedVN usa estos modelos para traducir diálogos y etiquetas del motor Ren'Py, manteniendo la estructura del script y sustituyendo el texto por la versión traducida.
- Traducción por lotes en local sin conexión: al distribuirse en CTranslate2 int8 y GGUF Q4_K_M, los modelos caben en equipos de consumo y permiten traducir volúmenes grandes de texto sin enviar datos a servicios externos.
- Despliegue de un servicio de traducción ligero: MADLAD-400 3B en CTranslate2 puede servirse detrás de una API compatible con endpoints para atender peticiones de traducción con baja latencia en CPU.
- Traducción asistida con contexto visual: Qwen3.5-4B con mmproj permite procesar capturas o ilustraciones junto al texto, útil para traducir menús, rótulos o texto incrustado en imágenes de una novela visual.
- Prototipado de pipelines de traducción multilingüe: los tres modelos cubren enfoques distintos (traducción dedicada, traducción compacta y generación general), lo que permite comparar calidad y coste antes de fijar un motor en producción.
- Empaquetado de modelos para aplicaciones de escritorio: el patrón de revisión fija más verificación SHA-256 sirve como referencia para distribuir modelos de forma reproducible en instaladores o actualizadores automáticos.
- Evaluación de cuantizaciones: la disponibilidad de Q4_K_M con imatrix y de int8 en CTranslate2 permite medir la pérdida de calidad frente a los pesos originales en flujos de traducción reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: MADLAD-400 3B en CTranslate2 int8 ronda los 3-4 GB; Hy-MT2 1.8B en Q4_K_M alrededor de 1,2-1,5 GB; Qwen3.5-4B en Q4_K_M en torno a 2,5-3 GB, más el proyector multimodal. Son estimaciones por tamaño y cuantización, no datos publicados en la información disponible.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, los tres componentes caben en GPUs de consumo con 8 GB o más, como RTX 3060, RTX 4060 o RTX 4090; para servir varios modelos simultáneamente se recomienda 16 GB o más (RTX 4080, A100 40 GB, H100).
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 6-8 GB de VRAM para un modelo individual; el conjunto completo requiere más memoria si se carga a la vez.
- Opciones de despliegue: llama.cpp y Ollama para los GGUF; CTranslate2 con su servidor o con wrappers de Python para el modelo int8; vLLM y TGI no están confirmados para estos formatos en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScriptedVN Models (agregado) | 4.205.751.296 reportados (Qwen3.5-4B) | No disponible | CTranslate2 int8, GGUF Q4_K_M | Apache-2.0 | Hugging Face, 0 descargas |
| google/madlad400-3b-mt | 3B | No disponible | Safetensors, CTranslate2 | Apache-2.0 | Hugging Face (modelo original) |
| tencent/Hy-MT2-1.8B | 1,8B | No disponible | Safetensors, GGUF | Apache-2.0 | Hugging Face (modelo original) |
| Qwen3.5-4B | 4B | No disponible | Safetensors, GGUF, mmproj | Apache-2.0 | Hugging Face (modelo original) |

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: cualquier limitación de calidad, sesgo o alucinación proviene de los modelos originales (MADLAD-400, Hy-MT2, Qwen3.5) y debe consultarse en sus respectivas model cards.
- El recuento de parámetros del repositorio (4.205.751.296) no representa el total agregado de los tres modelos; puede inducir a error si se usa para estimar requisitos de memoria del conjunto.
- La cuantización int8 y Q4_K_M introduce pérdida de calidad respecto a los pesos originales; no se documentan evaluaciones comparativas en este repositorio.
- No se especifican los idiomas cubiertos ni la longitud de contexto, lo que impide garantizar el comportamiento en pares de idiomas concretos o en textos largos.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni de validación por la comunidad.
- Aunque la licencia declarada es Apache-2.0, cada carpeta conserva la licencia de su modelo original; conviene verificar los términos de cada modelo subyacente antes de un uso comercial.
- La dependencia de una revisión fija y de la verificación SHA-256 implica que las actualizaciones de los modelos originales no llegan automáticamente a la aplicación.
- Riesgo de alucinación y de traducciones inconsistentes en terminología específica de novelas visuales (nombres propios, variables de Ren'Py) si no se aplica glosario o postprocesado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/scriptedvn/scriptedvn-models
- Modelo original MADLAD-400 3B: https://huggingface.co/google/madlad400-3b-mt
- Modelo original Hy-MT2 1.8B: https://huggingface.co/tencent/Hy-MT2-1.8B
- Modelo original Qwen3.5-4B: no disponible en la información proporcionada (el autor cita "Qwen" sin enlace)
- Documentación de CTranslate2: no disponible en la información proporcionada
- Documentación de llama.cpp / GGUF: no disponible en la información proporcionada
- Aplicación ScriptedVN: no disponible en la información proporcionada
