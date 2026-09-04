# 0xWhiteMage/Qwen3.8-27B-Kearuga

## Resumen

Qwen3.8-27B-Kearuga es un checkpoint de cuantización híbrida por niveles de sensibilidad del modelo Qwen3.8-27B, creado por el usuario 0xWhiteMage. Está diseñado específicamente para servir en una NVIDIA DGX Spark (GB10, Grace-Blackwell, con 128 GB de memoria unificada) utilizando decodificación especulativa con SGLang. El modelo reduce la huella de pesos del base BF16 (51.8 GiB) a 24.85 GB, un recorte del 52 %, manteniendo una fidelidad muy alta frente al modelo sin cuantizar: una divergencia KL media de 0.0165 y un acuerdo Top-1 del 100 % en 40 prompts de evaluación.

La arquitectura es un transformer denso de la serie Qwen3.5 con 19.76 mil millones de parámetros reales. La model card menciona un KV cache de 1M tokens en las métricas de servicio, lo que sugiere una ventana de contexto muy amplia, aunque no se indica el valor oficial. El modelo está preparado para modo de razonamiento y para enjambres de agentes, según las descripciones de la documentación técnica.

Incluye un modelo drafter DFlash 2 para decodificación especulativa, alcanzando 30.9 tok/s en un solo stream y hasta ~535 tok/s en modo agregado de 32 streams. La integración con SGLang se realiza mediante imágenes Docker oficiales, sin necesidad de compilar kernels personalizados. Todo el conjunto de despliegue se documenta en el repositorio de GitHub del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (model_type: qwen3_5) |
| Parametros totales | 19.759.821.552 (19.76B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible; la model card menciona un KV cache de 1M tokens en las métricas de servicio |
| Tipos de cuantizacion | GPTQ con escalas de grupo 4o6, NVFP4 AWQ, FP8 E4M3 y BF16 protegido (cuantización mixta por sensibilidad) |
| Idiomas soportados | en, zh, de, fr, ja, ko, es, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (3 shards + cabezal MTP) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura de Qwen3.8-27B, un transformer denso con 19.76 mil millones de parámetros. La innovación clave es la cuantización por niveles de sensibilidad (tiered sensitivity quantization): los 2,009 tensores del modelo se dividen en cuatro niveles según su sensibilidad a la cuantización, aplicando GPTQ con escalas de grupo 4o6, NVFP4 AWQ, FP8 E4M3 y BF16 protegido en los niveles correspondientes. Este enfoque busca preservar los estados de atención sink, las colas de distribución de vocabulario y las características de los drafters especulativos, que se degradan con una cuantización uniforme.

No se proporcionan detalles sobre los datos de entrenamiento, procesos de RLHF/DPO ni el método exacto de calibración de la cuantización más allá de lo descrito en la model card.

## Capacidades

- Generación de texto y conversación multilingüe: soporta 8 idiomas (inglés, chino, alemán, francés, japonés, coreano, español y ruso).
- Razonamiento matemático: el benchmark Quality-200 muestra 66/80 en GSM8K.
- Generación de código: alcanza 39/40 en HumanEval.
- Razonamiento lógico: incluye soporte para modo thinking, como indica la configuración "thinking disabled" en las pruebas de la model card.
- Capacidades de agente: el benchmark Agentic puntúa 18/20, y la documentación de servicio menciona explícitamente "background agent swarms".
- Decodificación especulativa: optimizado para usarse con el drafter DFlash 2 y EAGLE, consiguiendo aceleraciones del ~120 % en velocidad de decodificación.
- Integración con SGLang: se sirve mediante imágenes Docker oficiales de SGLang sin kernels personalizados.

No se menciona soporte explícito de tool calling en la información disponible.

## Casos de uso

- Despliegue de asistentes de chat interactivos en un servidor de borde: gracias a los 30.9 tok/s en un solo stream, el modelo puede mantener conversaciones fluidas en tiempo real sin depender de servicios en la nube.
- Generación de código integrada en IDEs o pipelines de CI/CD: con una puntuación de 39/40 en HumanEval, puede utilizarse para autocompletar o generar pruebas unitarias dentro de procesos de desarrollo.
- Resolución de problemas matemáticos en entornos educativos: su rendimiento en GSM8K (66/80) permite construir herramientas de tutoría que expliquen razonamientos paso a paso.
- Enjambres de agentes autónomos de segundo plano: la velocidad agregada de ~535 tok/s en 32 streams permite lanzar múltiples agentes simultáneos para tareas como generación de documentación o análisis de código.
- Procesamiento de documentos extensos: el KV cache de 1M tokens mencionado en las métricas de servicio apunta a la posibilidad de analizar textos largos, como informes o libros, dentro de una sola ventana de contexto.
- Traducción y soporte multilingüe: los 8 idiomas soportados permiten usarlo como traductor o asistente bilingüe en aplicaciones de atención al cliente.
- Investigación en cuantización y aceleración: al estar documentado el enfoque de cuantización por sensibilidad, sirve como punto de partida para experimentos con modelos similares.

## Benchmarks y rendimiento

| Benchmark | Puntuacion Kearuga |
|---|---|
| Quality-200 Objective Score | 157/180 |
| GSM8K | 66/80 |
| HumanEval | 39/40 |
| IFEval | 34/40 |
| Agentic | 18/20 |

Comparación con el modelo base sin cuantizar:

| Metrica | Base BF16 | Kearuga |
|---|---|---|
| Huella de pesos | 51.8 GiB | 24.85 GB (-52 %) |
| Divergencia KL media (40 prompts) | 0.0000 | 0.0165 |
| Acuerdo Top-1 (40 prompts) | 40/40 | 40/40 (100 %) |
| Continuacion exacta de 32 tokens | 40/40 | 20/40 (50 %) |
| Velocidad C1 (con DFlash 2) | ~14 tok/s | 30.9 tok/s (+121 %) |
| Velocidad C4 saturada | ~45 tok/s | 98.3 tok/s (+118 %) |
| VRAM de servicio (modelo + KV cache 1M) | ~84.0 GiB | ~60.4 GiB |

## Requisitos de hardware

- VRAM estimada: 24.85 GB para los pesos; ~60.4 GiB incluyendo un KV cache de 1M tokens.
- GPU recomendada: NVIDIA DGX Spark (GB10 / Grace-Blackwell, 128 GB de memoria unificada). El modelo utiliza NVFP4 y FP8 E4M3, por lo que requiere soporte Blackwell.
- No se especifica compatibilidad con GPUs de consumo como RTX 4090; probablemente sea incompatible o requiera conversión a cuantizaciones estándar.
- Opciones de despliegue: SGLang mediante imágenes Docker oficiales, junto con el drafter DFlash 2. El repositorio incluye lanzadores de contenedores y configuraciones de hardware.
- Latencia y throughput: 30.9 tok/s en un solo stream (C1), 98.3 tok/s con cuatro streams (C4) y ~535 tok/s en modo agregado con 32 streams (C32).

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Footprint | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-Kearuga | 19.76B | Cuantizado hibrido | 24.85 GB | Optimizado para DGX Spark, decodificacion especulativa |
| Qwen3.8-27B (BF16) | 19.76B | Base sin cuantizar | 51.8 GiB | Referencia de fidelidad, sin cuantizacion |
| malaiwah/qwen38-27b-exl3 | 19.76B | Cuantizado ExLlama | No disponible | Mencionado como inspiracion para la cuantizacion por sensibilidad |

No se han publicado comparativas con otros modelos de la misma categoría más allá de estas referencias.

## Limitaciones y advertencias

- Sesgos: no se han evaluado ni documentado sesgos específicos.
- Riesgo de alucinación: es un LLM estándar; la cuantización puede acentuar diferencias en logits cercanos, lo que se manifiesta en un 50 % de continuaciones no idénticas en las pruebas de fidelidad.
- La cuantización híbrida requiere hardware Blackwell para NVFP4 y FP8; no se garantiza el funcionamiento en arquitecturas anteriores.
- El modelo está optimizado para DGX Spark; el rendimiento puede variar en otros entornos.
- Licencia Apache-2.0: permite uso comercial, pero se debe verificar la licencia del modelo base Qwen3.8-27B.
- El contexto de 1M tokens se menciona en el KV cache de servicio, pero no se especifica como ventana de contexto nativa del modelo.

## Enlaces

- Página del modelo: https://huggingface.co/0xWhiteMage/Qwen3.8-27B-Kearuga
- Drafter DFlash 2: https://huggingface.co/0xWhiteMage/Qwen3.8-27B-Kearuga-DFlash2
- Drafter FP8 E4M3: https://huggingface.co/0xWhiteMage/Qwen3.8-27B-Kearuga-DFlash2-FP8-E4M3
- Repositorio de despliegue: https://github.com/0xWhiteMage/Qwen3.8-27B-Kearuga-SGLang-DGX-Spark-DFlash2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
