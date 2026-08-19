# nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16

## Resumen

NVIDIA Nemotron 3 Ultra es el modelo más grande y capaz de la familia Nemotron de NVIDIA, presentado en junio de 2026. Se trata de un modelo de lenguaje de escala frontera con arquitectura híbrida Latent MoE que combina capas Mamba-2, MoE y Attention, junto con capas de Multi-Token Prediction (MTP) para acelerar la generación. Con 550 mil millones de parámetros totales y solo 55 mil millones activos por token, ofrece un rendimiento de nivel frontera con una eficiencia computacional notable.

El modelo está diseñado para las cargas de trabajo más exigentes: razonamiento complejo, agentes multi-paso, análisis de contexto largo (hasta 1 millón de tokens) y uso de herramientas. NVIDIA lo posiciona como una alternativa open-weight a los modelos propietarios de mayor escala, con la particularidad de que tanto los datos de pre-entrenamiento como los de post-entrenamiento son públicos. El modelo se distribuye con pesos en BF16 y existe una variante NVFP4 para entornos con menos memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LatentMoE híbrida: Mamba-2 + MoE + Attention con Multi-Token Prediction (MTP) |
| Parametros totales | 560.524.578.816 (550B segun el fabricante) |
| Parametros activos | 55B |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | BF16 (original), NVFP4 (variante disponible) |
| Idiomas soportados | Ingles, frances, espanol, italiano, aleman, japones, hindi, coreano, portugues de Brasil y chino |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial permitido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Nemotron 3 Ultra emplea una arquitectura Latent Mixture-of-Experts (LatentMoE) que intercala capas Mamba-2 (modelos de espacio de estado) con capas MoE y capas de atención selectivas. Esta combinación hibrida permite manejar secuencias de hasta 1 millón de tokens con un coste computacional subcuadratico, manteniendo la calidad de atención full-attention en las capas donde es mas necesaria. El modelo incorpora capas Multi-Token Prediction (MTP) que predicen varios tokens futuros simultaneamente, lo que acelera la generacion y mejora la calidad global.

El pre-entrenamiento se realizó con aproximadamente 20 billones de tokens, con un cutoff de datos de septiembre de 2025. NVIDIA aplicó una receta de pre-entrenamiento en NVFP4 (punto flotante de 4 bits de NVIDIA) para maximizar la eficiencia computacional durante el entrenamiento. El post-entrenamiento utilizó datos curados y generados sintéticamente de alta calidad, con cutoff de mayo de 2026, e incluye un modo de razonamiento configurable mediante chat template (`enable_thinking=True/False`). Los datasets de pre y post-entrenamiento están publicados en Hugging Face bajo las colecciones `nvidia/nemotron-pre-training-datasets` y `nvidia/nemotron-post-training-v3`.

## Capacidades

- Razonamiento frontera: genera trazas de razonamiento antes de la respuesta final, con modo de pensamiento configurable via chat template
- Razonamiento sobre codigo, matematicas y ciencia con alta precision
- Soporte de agentes complejos multi-paso con orquestacion de multiples llamadas
- Tool calling y function calling para integracion con APIs y herramientas externas
- Analisis de contexto largo: ventana de hasta 1M tokens para documentos extensos, codebases completas o historiales de conversacion largos
- RAG de alto riesgo con recuperacion sobre grandes volumenes de documentos
- Multilingue: 11 idiomas incluyendo espanol, frances, aleman, japones, chino, hindi y arabe
- Generacion de texto acelerada gracias a las capas MTP
- Conversacion multi-turno con memoria extendida

## Casos de uso

- Agentes de investigacion profunda: el modelo puede orquestar busquedas web, leer multiples documentos y sintetizar informes extensos gracias a su ventana de 1M tokens y su capacidad de razonamiento multi-paso.
- Analisis de codebases completas: con 1M tokens de contexto, puede recibir repositorios enteros para tareas de refactorizacion, deteccion de bugs o generacion de documentacion.
- Atencion al cliente multilingue de alta complejidad: gestiona conversaciones largas con contexto amplio en 11 idiomas, manteniendo coherencia en interacciones de decenas de turnos.
- RAG empresarial de alto riesgo: adecuado para entornos legales, financieros o medicos donde la precision en la recuperacion y el razonamiento sobre documentos extensos es critica.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines CI/CD para revision de codigo automatizada, generacion de tests o asistencia en code review.
- Orquestacion de agentes: como modelo central en arquitecturas multi-agente, coordinando subtareas delegadas a modelos mas pequeños y especializados.
- Traduccion y localizacion de alta calidad: con soporte nativo para 11 idiomas, puede traducir documentos largos manteniendo coherencia terminologica a lo largo de todo el texto.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa con modelos similares, pero los datos completos no estan disponibles en la informacion proporcionada. Los modelos comparados son MiniMax-2.7 (230B-A10B), GLM-5.1 (744B-A40B) y Kimi-K2.6. Los resultados completos se encuentran en el informe tecnico oficial.

| Benchmark | N-3-Ultra 550B-A55B | MiniMax-2.7 230B-A10B | GLM-5.1 744B-A40B | Kimi-K2.6 |
|---|---|---|---|---|
| Resultados completos | Disponibles en el informe tecnico | no disponible | no disponible | no disponible |

## Requisitos de hardware

- GPU minima recomendada: 8x GB200/B200/GB300/B300, 16x H100 o 8x H200
- La variante BF16 requiere aproximadamente 1,1 TB de VRAM solo para los pesos, mas overhead de activaciones y KV cache
- No cabe en GPUs de consumo (RTX 4090, RTX 5090, etc.) en BF16
- Para entornos con menos memoria, NVIDIA ofrece la variante NVFP4 que reduce significativamente el footprint de memoria
- Despliegue recomendado mediante NVIDIA NIM, disponible en build.nvidia.com
- Compatible con el ecosistema transformers de Hugging Face
- Para produccion se recomienda hardware de datacenter con interconexion de alta velocidad (NVLink, InfiniBand) dado el tamaño del modelo

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| Nemotron 3 Ultra | 550B | 55B | 1M | OpenMDW-1.1 |
| MiniMax-2.7 | 230B | 10B | no disponible | no disponible |
| GLM-5.1 | 744B | 40B | no disponible | no disponible |
| Kimi-K2.6 | no disponible | no disponible | no disponible | no disponible |

Nemotron 3 Ultra se posiciona como un modelo de escala frontera con una proporcion de parametros activos muy favorable (10:1), compitiendo directamente con los modelos MoE mas grandes del mercado. Su ventaja principal es la ventana de contexto de 1M tokens combinada con la arquitectura hibrida Mamba-2, que reduce el coste computacional en secuencias largas.

## Limitaciones y advertencias

- Requisitos de hardware muy elevados: la variante BF16 necesita al menos 8 GPUs de datacenter de ultima generacion, lo que limita su uso a organizaciones con infraestructura HPC
- Riesgo de alucinacion inherente a los LLM de esta escala, especialmente en tareas de razonamiento multi-paso donde los errores pueden propagarse
- La licencia OpenMDW-1.1 requiere aceptacion explicita de los terminos y puede tener restricciones especificas para ciertos usos comerciales; es necesario revisar el texto completo de la licencia
- El cutoff de datos de pre-entrenamiento es septiembre de 2025, por lo que no tiene conocimiento de eventos posteriores sin RAG
- Los datos de post-entrenamiento tienen cutoff de mayo de 2026, lo que reduce pero no elimina el riesgo de informacion desactualizada
- No se han publicado resultados detallados de sesgos y evaluaciones de seguridad en la informacion disponible
- El tamaño del repositorio (2,2 TB) implica costes significativos de descarga y almacenamiento
- Aunque soporta 11 idiomas, el rendimiento puede degradarse en variantes dialectales o registros muy coloquiales

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16
- Informe tecnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Ultra-Technical-Report.pdf
- Pagina del modelo: https://research.nvidia.com/labs/nemotron/Nemotron-3-Ultra/
- NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-ultra-550b-a55b
- Pagina de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Coleccion de datasets de pre-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Coleccion de datasets de post-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Variante NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4
