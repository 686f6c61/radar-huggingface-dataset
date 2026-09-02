# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ4e

## Resumen

Este modelo es una cuantización MLX de 4 bits con precisión mixta (oQ4e-mtp) del modelo Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, desarrollada por Solstice-AI para ejecutarse de forma nativa en Apple Silicon. El modelo base es una variante de Qwen3.8-27B, un modelo denso de 27.78 mil millones de parámetros con arquitectura híbrida de atención (lineal en 48 de 64 capas), torre de visión integrada y un cabezal de predicción multi-token (MTP) para decodificación especulativa. La cuantización reduce el tamaño del modelo a 17 GB, lo que permite ejecutarlo en equipos Mac con 16 GB de memoria unificada, manteniendo un rendimiento cercano al del modelo sin cuantizar.

La relevancia de esta versión radica en su optimización específica para hardware Apple: alcanza una velocidad de generación 2.20 veces superior a la línea base BF16, incorpora soporte nativo de visión multimodal y una ventana de contexto de 262.144 tokens sin necesidad de configuración adicional. Está pensada para desarrolladores que necesitan ejecutar un modelo de 27B con capacidades de agente, tool calling y razonamiento visual en equipos de consumo, sin recurrir a GPUs dedicadas. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (dense, hybrid attention, vision tower, MTP draft head) |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo, extensible a 1M) |
| Tipos de cuantizacion | oQ4e-mtp (4-bit mixto), oQ6e-mtp (6-bit), oQ8e-mtp (8-bit), BF16 |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con atención híbrida: 48 de sus 64 capas utilizan atención lineal (linear attention) para reducir el coste computacional en secuencias largas, mientras que las 16 restantes mantienen atención completa. Incluye una torre de visión (vision tower) que permite procesar imágenes y vídeo, y un cabezal MTP (Multi-Token Prediction) que genera múltiples tokens candidatos en paralelo durante una sola pasada hacia adelante, acelerando la decodificación especulativa. El modelo fue entrenado con el método "Cold Fusion", que reduce los tokens de pensamiento entre 1/5 y 1/2 respecto a Qwen 3.8 estándar, manteniendo o mejorando la calidad del razonamiento.

La cuantización oQ4e-mtp de Solstice-AI aplica precisión mixta de 4 bits a la mayoría de las capas, conservando mayor precisión en capas críticas, y mantiene el cabezal MTP activo para la decodificación especulativa. El resultado es un modelo de 17 GB que cabe en 15,2 GB de memoria unificada, con una degradación mínima en benchmarks (86,3% MMLU frente al 87,3% del BF16). No se dispone de información detallada sobre el dataset de entrenamiento del modelo base ni sobre el proceso de fine-tuning aplicado por DavidAU.

## Capacidades

- Generación de texto y razonamiento complejo con modo de pensamiento configurable (thinking mode).
- Comprensión multimodal: procesa imágenes y vídeo, incluyendo razonamiento visual y análisis de interfaces de usuario.
- Tool calling y function calling para integración con APIs y herramientas externas.
- Soporte de agentes multi-paso con razonamiento encadenado.
- Multilingüe: inglés y chino.
- Contexto largo de 262.144 tokens sin configuración manual, extensible a 1M.
- Decodificación especulativa MTP integrada, que acelera la generación en Apple Silicon.
- Capacidad de "uncensored" (sin censura) según el nombre del modelo, lo que implica menos restricciones de seguridad en la generación.

## Casos de uso

- Asistente de programación en Mac: un desarrollador puede ejecutar el modelo localmente en un MacBook Pro de 16 GB para autocompletar código, refactorizar funciones y explicar fragmentos complejos, aprovechando el soporte de tool calling para integrarse con editores y pipelines de CI/CD.
- Análisis de documentos extensos: con 262K de contexto, el modelo puede procesar libros técnicos, contratos o informes completos en una sola pasada, resumiendo secciones y extrayendo datos clave sin necesidad de dividir el texto.
- Razonamiento visual sobre capturas de pantalla: gracias a la torre de visión, puede analizar imágenes de interfaces de usuario, diagramas o gráficos para generar descripciones, detectar errores de diseño o extraer información de tablas.
- Agente autónomo de automatización: combinando tool calling y razonamiento multi-paso, el modelo puede orquestar tareas como enviar correos, consultar APIs, actualizar bases de datos o gestionar calendarios, todo ejecutándose localmente en un Mac.
- Chat conversacional multilingüe: soporta conversaciones fluidas en inglés y chino, con memoria de contexto largo para mantener el hilo de discusiones extensas.
- Prototipado de aplicaciones de IA en Apple Silicon: los desarrolladores pueden usar MLX-LM o Anvil para servir el modelo como endpoint compatible con OpenAI, permitiendo probar aplicaciones de IA generativa sin depender de servicios en la nube.

## Benchmarks y rendimiento

La model card proporciona resultados de benchmarks para las distintas precisiones de cuantización. Los datos corresponden al modelo cuantizado por Solstice-AI, no al modelo base original.

| Precision | Tamano | MMLU | MMLU_Pro | HumanEval | Velocidad relativa | Hardware minimo |
|---|---|---|---|---|---|---|
| BF16 (sin cuantizar) | 54,0 GB | 87,3% | 68,7% | 89,0% | 1,00x | 64GB+ Mac Studio / A100 |
| oQ8e-mtp (8-bit) | 30,0 GB | 87,0% | 68,7% | 89,6% | 1,45x | 36GB-48GB Mac / A10G |
| oQ6e-mtp (6-bit) | 23,7 GB | 86,0% | 70,0% | 88,4% | 1,72x | 32GB+ Unified Memory |
| oQ4e-mtp (4-bit) | 17,0 GB | 86,3% | 66,3% | 86,6% | 2,20x | 16GB / 24GB Macs |

Adicionalmente, según la búsqueda web, el modelo base alcanza 735 puntos en ARC-C (144 puntos por encima de Qwen 3.8 27B) y 880 en ARC-E en 8 bits, y 718 en ARC-C en 4 bits. Estos datos corresponden al modelo de DavidAU, no a esta cuantización específica, pero indican el rendimiento potencial del modelo subyacente.

## Requisitos de hardware

- VRAM estimada: 15,2 GB de memoria unificada para la versión oQ4e-mtp (17 GB de tamaño de archivo).
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con 16 GB o más de memoria unificada. Modelos con 24 GB o 32 GB ofrecen margen adicional.
- No compatible con GPUs NVIDIA o AMD: el formato MLX está diseñado exclusivamente para Apple Silicon.
- Opciones de despliegue: Anvil (motor de terminal con aceleración MTP) y MLX-LM (biblioteca Python con servidor OpenAI-compatible).
- Latencia y throughput: velocidad de generación 2,20x respecto al BF16 en el mismo hardware. No se proporcionan valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | HumanEval | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,78B | 262K | 87,3% (BF16) | 89,0% (BF16) | Apache 2.0 | safetensors, GGUF, MLX |
| Este modelo (oQ4e-mtp) | 27,78B | 262K | 86,3% | 86,6% | Apache 2.0 | MLX (safetensors) |
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-mlx-6Bit | 27,78B | 262K | no disponible | no disponible | Apache 2.0 | MLX (6-bit) |

La comparativa directa con otros modelos de 27B fuera de la familia Qwen no está disponible en la información proporcionada. La principal diferencia de esta versión frente al modelo original es la cuantización optimizada para Apple Silicon, que sacrifica entre 1 y 2,5 puntos porcentuales en MMLU y HumanEval a cambio de una reducción del 68% en el tamaño y un aumento del 120% en velocidad de generación.

## Limitaciones y advertencias

- El modelo está etiquetado como "uncensored" (sin censura), lo que implica que puede generar contenido inapropiado, ofensivo o peligroso sin las salvaguardas habituales. No es recomendable para aplicaciones orientadas al público general sin un filtrado adicional.
- Solo soporta inglés y chino; no hay evidencia de capacidades multilingües más amplias.
- La cuantización de 4 bits introduce una degradación medible en benchmarks (1 punto en MMLU, 2,4 puntos en HumanEval respecto al BF16), que puede ser relevante en tareas de precisión.
- El formato MLX limita el despliegue exclusivamente a Apple Silicon; no se puede ejecutar en GPUs NVIDIA o AMD sin conversión a otro formato.
- No se dispone de información sobre sesgos específicos del modelo, pero al ser un fine-tuning de Qwen3.8-27B, hereda los sesgos potenciales del modelo base.
- Riesgo de alucinación inherente a todos los modelos de lenguaje; la ventana de contexto de 262K puede amplificar la generación de información falsa si no se verifica.
- El nombre del modelo incluye "Heretic" y "Uncensored", lo que sugiere que se han eliminado restricciones de seguridad; esto puede violar políticas de uso aceptable en entornos corporativos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ4e
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Qwen3.8-27B original en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.8-27b/
- Qwen3.8-27B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Anvil Runtime (motor de inferencia): https://github.com/Solstice-Labs/anvil
- MLX-LM (biblioteca de inferencia): https://github.com/ml-explore/mlx-lm
- Sitio web de Solstice-AI: https://solstice-ai.co
