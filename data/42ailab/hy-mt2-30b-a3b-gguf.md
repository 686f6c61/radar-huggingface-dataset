# 42ailab/Hy-MT2-30B-A3B-GGUF

## Resumen

Hy-MT2-30B-A3B es un modelo de traducción multilingüe desarrollado por Tencent Hunyuan, publicado bajo licencia Apache-2.0. Se trata del mayor tamaño de la familia Hy-MT2 y emplea una arquitectura de mezcla de expertos (MoE) con aproximadamente 30.000 millones de parámetros totales y unos 3.000 millones activos por paso de inferencia, lo que permite un equilibrio entre calidad y coste computacional. El modelo traduce entre 33 idiomas y sigue instrucciones de traducción, lo que lo sitúa como una herramienta especializada para pipelines de localización y traducción automática.

El repositorio analizado, `42ailab/Hy-MT2-30B-A3B-GGUF`, no es un modelo nuevo ni una conversión propia: es una copia byte a byte del archivo GGUF Q4_K_M generado por el equipo AngelSlim de Tencent y publicado originalmente en `AngelSlim/Hy-MT2-30B-A3B-GGUF`. La motivación del backup es preservar la disponibilidad de los pesos ante posibles renombrados, borrados o reemplazos del repositorio original. Los nombres de archivo, tamaños y digests sha256 coinciden con el original.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de traducción de 30B-A3B en formato GGUF cuantizado a Q4_K_M (16,98 GiB), con licencia permisiva para uso comercial y compatible con motores de inferencia locales como el que promueve el propio autor (42model). Para desarrolladores que necesitan traducción multilingüe privada y sin dependencia de la nube, es una opción concreta, aunque con información pública limitada sobre benchmarks y composición del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer (detalles no disponibles) |
| Parametros totales | 30.064.725.888 |
| Parametros activos | Aproximadamente 3B por paso de inferencia (30B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (incluido en este repo); Q8_0 disponible en el repo original AngelSlim |
| Idiomas soportados | 33 idiomas (lista concreta no disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) con 30.064.725.888 parámetros totales y aproximadamente 3.000 millones activos por inferencia. Esta configuración permite que, pese al tamaño total, el coste computacional por token se acerque al de un modelo denso de 3B. No se dispone de información detallada sobre el número de expertos, la estrategia de enrutamiento, la longitud de contexto nativa ni la composición exacta del dataset de entrenamiento en la información proporcionada.

La model card cita el informe técnico `HY-MT1.5 Technical Report` (arXiv:2512.24092) de Mao Zheng, Zheng Li, Tao Chen, Mingyang Song y Di Wang (2025), que es la referencia para capacidades y evaluaciones. No se especifica en la información disponible si hubo RLHF, DPO u otras etapas de alineación, ni innovaciones técnicas concretas como decodificación especulativa o atención lineal. El proceso de conversión a GGUF fue realizado por el equipo AngelSlim de Tencent, e incluye un archivo con matriz de importancia (imatrix) según las etiquetas del repositorio.

## Capacidades

- Traducción multilingüe entre 33 idiomas.
- Seguimiento de instrucciones de traducción (por ejemplo, tono, estilo o restricciones de formato).
- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integración con APIs de inferencia.
- Capacidades multilingües limitadas a los 33 idiomas declarados; el resto no está soportado de forma garantizada.
- No se dispone de información sobre tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Localización de documentación técnica: el modelo puede traducir manuales y guías entre los 33 idiomas soportados siguiendo instrucciones de terminología y estilo, adecuado por su especialización en traducción y su licencia Apache-2.0 para uso comercial.
- Traducción de interfaces de producto: integrado en pipelines de CI/CD para generar cadenas de texto localizadas en múltiples idiomas, con la ventaja de ejecutarse localmente y evitar el envío de contenido propietario a servicios en la nube.
- Atención al cliente multilingüe: traducción de conversaciones multi-turno en centros de soporte, aunque la longitud de contexto no está documentada y debe validarse empíricamente antes de producción.
- Subtitulado y transcripción: combinado con motores de reconocimiento de voz (el propio autor ofrece transcripción en 42model), el modelo puede traducir transcripciones a otros idiomas en un flujo local y privado.
- Investigación en traducción automática: al ser un MoE de 30B-A3B con pesos abiertos y licencia permisiva, sirve como base para experimentos de ajuste fino y evaluación de técnicas de cuantización.
- Despliegue en entornos con requisitos de privacidad: organizaciones que no pueden usar APIs externas pueden ejecutar el GGUF Q4_K_M en hardware propio, manteniendo los datos dentro de su infraestructura.
- Traducción por lotes de corpus: procesamiento offline de grandes volúmenes de texto con un motor GGUF como llama.cpp u Ollama, aprovechando el bajo número de parámetros activos para reducir coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al informe técnico arXiv:2512.24092 y al repositorio upstream `tencent/Hy-MT2-30B-A3B` para evaluaciones, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: el archivo pesa 16,98 GiB, por lo que se recomienda al menos 20-24 GB de VRAM para cargar los pesos completos en GPU, dejando margen para el contexto y los estados de atención.
- GPU recomendadas: A100 (40/80 GB), H100, RTX 4090 (24 GB, al límite para Q4_K_M con contexto moderado). En GPUs con menos de 24 GB puede ser necesario descargar capas a CPU.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con Q4_K_M y contexto limitado; en GPUs de 16 GB probablemente requiera offloading parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, motores compatibles con GGUF y el motor 42model del propio autor (`42model download hy-mt2:30b-a3b-q4_k_m`). No se confirma soporte de vLLM o TGI para este formato.
- Latencia y throughput: no disponibles. Al tener unos 3B parámetros activos, se espera un throughput superior al de un modelo denso de 30B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hy-MT2-30B-A3B (este) | 30B totales / ~3B activos | no disponible | Apache-2.0 | GGUF (Q4_K_M, Q8_0) | Traducción entre 33 idiomas, MoE |
| tencent/Hy-MT2-30B-A3B (upstream) | 30B totales / ~3B activos | no disponible | Apache-2.0 | safetensors (presumible) | Modelo original sin cuantizar |
| AngelSlim/Hy-MT2-30B-A3B-GGUF | 30B totales / ~3B activos | no disponible | Apache-2.0 | GGUF (Q4_K_M, Q8_0) | Conversión original del equipo AngelSlim |
| Otros modelos de traducción de 30B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como modelo entrenado con datos web, es probable que herede sesgos de esos corpus, pero no hay evidencia concreta.
- Riesgo de alucinación: no evaluado en la información disponible; en tareas de traducción el riesgo principal es la alteración de contenido, especialmente con instrucciones ambiguas.
- Limitaciones de contexto o idioma: solo se declaran 33 idiomas; el resto no está garantizado. La longitud de contexto no está documentada, lo que impide planificar conversaciones o documentos largos sin validación previa.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución con atribución y aviso de cambios; no hay restricciones adicionales conocidas.
- Caveat de producción: este repositorio es un backup byte a byte de un archivo de terceros (AngelSlim); no incluye el archivo Q8_0 ni el PDF del informe técnico. Para capacidades y evaluaciones debe consultarse el repositorio upstream `tencent/Hy-MT2-30B-A3B`.
- Verificación de integridad: el sha256 del GGUF es `bb44b11bb0f7cd3d1321645b41e911cd3de2e473731227fc6bf37aa18b543f88`; conviene comprobarlo tras la descarga.
- Madurez del ecosistema: con 53 descargas y 0 likes en el momento de la ficha, la adopción es baja; no hay evidencia comunitaria de robustez en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/42ailab/Hy-MT2-30B-A3B-GGUF
- Repositorio original de la conversión GGUF: https://huggingface.co/AngelSlim/Hy-MT2-30B-A3B-GGUF
- Modelo upstream: https://huggingface.co/tencent/Hy-MT2-30B-A3B
- ModelScope (backup): https://modelscope.cn/models/42ailab/Hy-MT2-30B-A3B-GGUF
- ModelScope (original): https://www.modelscope.cn/models/AngelSlim/Hy-MT2-30B-A3B-GGUF
- Informe técnico: https://arxiv.org/abs/2512.24092
- Sitio del autor: https://42ailab.com
- Motor de inferencia 42model: https://42model.com
