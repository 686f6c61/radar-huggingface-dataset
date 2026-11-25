# netprojects/Hy-MT3-30B-A3B-MLX-8bit

## Resumen

Hy-MT3-30B-A3B es el modelo de traducción multilingüe más grande de la familia Hy-MT3 de Tencent, publicada el 24 de noviembre de 2026 en tres tamaños (1.8B, 7B y 30B-A3B). Se trata de un modelo de mezcla de expertos (MoE) con 30.064.725.888 parámetros totales y aproximadamente 3B activos por token, distribuidos en 128 expertos, diseñado específicamente para traducción entre unas 100 lenguas y dialectos, incluidas las 33 lenguas de Hy-MT2, cinco lenguas minoritarias y dialectos chinos, y 64 lenguas añadidas como griego, rumano, húngaro y las lenguas nórdicas y bálticas.

La ficha que nos ocupa no es el modelo original, sino una conversión comunitaria publicada por NetProjects: `netprojects/Hy-MT3-30B-A3B-MLX-8bit`, una cuantización afín de 8 bits (grupo 64) en formato MLX, orientada a ejecución en Apple Silicon. El repositorio incluye una implementación propia de la arquitectura `hy_v3` (no soportada aún por mlx-lm) y pesa 32,0 GB.

Su relevancia es doble: por un lado, permite ejecutar un modelo de traducción de 30B en un Mac con 48 GB o más de memoria unificada; por otro, valida que la arquitectura `hy_v3` puede implementarse fuera del ecosistema de Transformers con fidelidad verificada (100% de coincidencia de siguiente token frente a bf16 en 204 posiciones evaluadas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`hy_v3`), 128 expertos, 1 experto compartido, primera capa densa, RMSNorm q/k por cabeza, router sigmoide con sesgo de puntuación de experto |
| Parametros totales | 30.064.725.888 |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible (la model card recomienda entradas de hasta ~8K tokens) |
| Tipos de cuantizacion | 8 bits afín, grupo 64 (existen builds de 4 y 6 bits del mismo autor) |
| Idiomas soportados | ~100 lenguas y dialectos (33 de Hy-MT2, 5 minoritarias chinas, 64 nuevas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 32,0 GB |

## Arquitectura y entrenamiento

Hy-MT3-30B-A3B emplea una arquitectura MoE denominada `hy_v3` por Tencent: 128 expertos enrutados más un experto compartido, primera capa densa y normalización RMSNorm aplicada por cabeza sobre las proyecciones q y k. El router usa una función sigmoide con un sesgo sobre la puntuación de cada experto, un diseño que en la práctica se asocia a un enrutamiento más estable que el softmax clásico. Con ~3B parámetros activos por token, el coste de inferencia se aproxima al de un modelo denso de 3B pese a almacenar 30B.

La model card de esta conversión no detalla la composición del dataset de entrenamiento ni el volumen de tokens; remite al informe técnico de Tencent (arXiv 2611.27673) y a la model card original. Sí se documentan métricas comparativas frente a Hy-MT2 sobre datos reales: 43% menos errores de traducción, 74% menos omisiones o adiciones y 40% menos fallos de seguimiento de instrucciones. La conversión de NetProjects añade una implementación MLX propia (`hy_v3.py`) que replica la referencia `HYV3` de Hugging Face Transformers con una diferencia relativa máxima de 3e-7 en un modelo aleatorio pequeño y decodificación con caché idéntica a un forward completo; los pesos del router se mantienen en float32 sin cuantizar.

## Capacidades

- Traducción multilingüe entre ~100 lenguas y dialectos, con salida únicamente del texto traducido cuando se le indica.
- Traducción bidireccional verificado en pruebas hacia griego, chino, japonés, alemán, francés, español, árabe y ruso, y desde griego y chino hacia inglés.
- Seguimiento de instrucciones de formato: plantillas para listas de terminología, estilo requerido, preferencias personales, preservación de delimitadores y traducción de datos estructurados (JSON, XML).
- Traducción con control de terminología mediante pares `` `term` translates to `translation` ``.
- Capacidad de instrucciones multi-turno mediante plantilla de chat (`apply_chat_template`).
- Modo no-thinking: Tencent reporta los mejores resultados globales de todos los modelos evaluados en modo no-thinking para esta variante de 30B-A3B.
- Servidor compatible con la API de OpenAI mediante `mlx_lm.server`.

## Casos de uso

- Traducción de documentación técnica en local: con 32 GB de pesos en memoria unificada, un Mac Studio o MacBook Pro de gama alta puede traducir manuales completos sin enviar datos a la nube, algo crítico para propiedad intelectual.
- Localización de productos con terminología controlada: las plantillas de lista de términos permiten fijar glosarios por cliente y garantizar consistencia entre lotes de traducción.
- Traducción de datos estructurados en pipelines ETL: la preservación de delimitadores y el soporte de JSON/XML permiten traducir campos de bases de datos o ficheros de configuración sin romper el esquema.
- Atención al cliente multilingüe en infraestructura propia: el modelo puede servir como backend de traducción en un chat multi-turno mediante la API compatible con OpenAI que expone `mlx_lm.server`, sin coste por token.
- Investigación en lingüística computacional: al ser Apache-2.0 y ejecutable en hardware de consumo, permite experimentar con las 64 lenguas nuevas (griego, rumano, húngaro, nórdico, báltico) sin depender de APIs comerciales.
- Prototipado rápido en equipos con Apple Silicon: la coincidencia del 100% con bf16 en las pruebas de siguiente token hace que el build de 8 bits sea válido para evaluar calidad antes de desplegar la versión completa en GPU.
- Traducción de correspondencia y documentos personales con privacidad: el procesamiento totalmente local evita exponer contenido sensible a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas relativas frente a Hy-MT2 (43% menos errores de traducción, 74% menos omisiones/adiciones, 40% menos fallos de instrucción) y remite al informe técnico arXiv 2611.27673 para los resultados completos. Las pruebas de la conversión son de fidelidad, no de calidad absoluta:

| Build | Tamano | Coincidencia siguiente token con bf16 | Smoke test de traduccion | Memoria Mac sugerida |
|---|---|---|---|---|
| 6 bits (recomendado) | 24,4 GB | 100,0% | 10/10 | 48 GB+ |
| 8 bits (esta ficha) | 32,0 GB | 100,0% | 10/10 | 48 GB+ |
| 4 bits | 16,9 GB | 97,1% | 10/10 | 32 GB+ |

Las pruebas se realizaron en un MacBook Pro M5 Max de 128 GB con mlx-lm 0.32.2, comparando el siguiente token más probable en 204 posiciones generadas.

## Requisitos de hardware

- VRAM/memoria: 32,0 GB de pesos; NetProjects sugiere 48 GB o más de memoria unificada en Mac para el build de 8 bits (pico observado más 2 GB de margen). Documentos largos requieren más memoria.
- GPU: no aplica de forma nativa; está pensado para Apple Silicon. Para GPU NVIDIA habría que recurrir al modelo original en Transformers o a otras cuantizaciones.
- Consumer GPU: no cabe en GPUs de consumo con 24 GB (RTX 4090) en esta cuantización; el build de 4 bits (16,9 GB) sí podría plantearse, pero está empaquetado para MLX, no para CUDA.
- Apple Silicon: viable en Mac con 48 GB o más (M-series Pro/Max/Ultra); el build de 4 bits baja el requisito a 32 GB.
- Despliegue: `mlx-lm>=0.32.2` con `--trust-remote-code` (obligatorio por la arquitectura `hy_v3`), `mlx_lm.generate`, `mlx_lm.server` (API compatible con OpenAI). No es compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: no disponibles en la información proporcionada. El modelo solo activa ~3B parámetros por token, lo que reduce el coste de cómputo frente a un denso de 30B, pero el cuello de botella en Apple Silicon será el ancho de banda de memoria al cargar los expertos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato/plataforma |
|---|---|---|---|---|---|
| Hy-MT3-30B-A3B (original, Tencent) | 30B | ~3B | no disponible | Apache-2.0 | safetensors, Transformers |
| netprojects/Hy-MT3-30B-A3B-MLX-8bit | 30B | ~3B | no disponible | Apache-2.0 | MLX 8 bits, Apple Silicon |
| netprojects/Hy-MT3-30B-A3B-MLX-6bit | 30B | ~3B | no disponible | Apache-2.0 | MLX 6 bits, 24,4 GB |
| netprojects/Hy-MT3-30B-A3B-MLX-4bit | 30B | ~3B | no disponible | Apache-2.0 | MLX 4 bits, 16,9 GB |

No se dispone de datos de benchmarks ni de especificaciones de modelos competidores de traducción en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Modelo especializado en traducción: no debe esperarse un rendimiento de propósito general comparable a un LLM conversacional, pese a su tamaño.
- La model card no documenta sesgos lingüísticos, de género ni culturales; al cubrir ~100 lenguas, la calidad probablemente sea desigual entre las 33 originales y las 64 añadidas, aunque no hay datos públicos al respecto en la información disponible.
- Riesgo de alucinación y de omisiones en textos largos: la recomendación de entradas de hasta ~8K tokens limita el tamaño de documento por pasada.
- La cuantización de 8 bits preserva el 100% del siguiente token en las pruebas realizadas, pero estas solo cubrieron 204 posiciones y 10 prompts; no garantizan equivalencia en dominios especializados.
- Requiere `--trust-remote-code`: se ejecuta código Python del repositorio (`hy_v3.py`), lo que implica revisarlo antes de usarlo en entornos sensibles.
- Exclusivo de Apple Silicon en este formato; no hay build GGUF ni CUDA disponible en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar `LICENSE.txt` de Tencent y citar el trabajo original según indica la model card.
- Publicado por NetProjects (Internet Projects Ltd), sin afiliación con Tencent; la responsabilidad de la conversión recae en el autor del repositorio.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/netprojects/Hy-MT3-30B-A3B-MLX-8bit
- Modelo original: https://huggingface.co/tencent/Hy-MT3-30B-A3B
- Build de 6 bits: https://huggingface.co/netprojects/Hy-MT3-30B-A3B-MLX-6bit
- Build de 4 bits: https://huggingface.co/netprojects/Hy-MT3-30B-A3B-MLX-4bit
- Informe técnico: arXiv 2611.27673
- Más builds MLX de NetProjects: https://huggingface.co/netprojects
- Sitio del autor de la conversión: https://netprojects.com
