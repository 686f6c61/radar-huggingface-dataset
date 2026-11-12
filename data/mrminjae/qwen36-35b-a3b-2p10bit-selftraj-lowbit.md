# mrminjae/qwen36-35b-a3b-2p10bit-selftraj-lowbit

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de Qwen/Qwen3.6-35B-A3B, un modelo de arquitectura Mixture-of-Experts (MoE) de la familia Qwen 3.5/3.6, adaptado para generación de texto e imagen-texto. El autor, mrminjae, ha aplicado una cuantización selectiva: únicamente los expertos enrutados (routed experts) se comprimen a una media de 2,10 bits, mientras que el resto de pesos se mantienen en BF16. Los pesos se almacenan ya dequantizados en tensores BF16, de modo que cargan con `transformers` estándar y con vLLM sin necesidad de kernels especiales de cuantización.

El modelo resuelve un problema práctico de despliegue: reducir el coste de memoria y almacenamiento de un MoE de 35B parámetros totales sin renunciar a la compatibilidad con el ecosistema estándar de inferencia. El repositorio ocupa 14,7 GB, lo que sugiere una huella notablemente inferior a la de un checkpoint BF16 completo de un modelo de ese tamaño, aunque la cifra exacta depende de cuántos parámetros correspondan a expertos enrutados frente a pesos densos.

Se trata de un artefacto de investigación interna ("internal research checkpoint") con 0 descargas y 0 likes en el momento de la consulta, publicado el 12 de noviembre de 2026. No es un modelo oficial de Qwen ni un lanzamiento de producción: es una modificación de pesos orientada a experimentación con cuantización extrema de expertos. La licencia sigue la del modelo base, que no se detalla en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer; tag `qwen3_5_moe`; pipeline `image-text-to-text` |
| Parámetros totales | 35B (según nombre del modelo base Qwen3.6-35B-A3B) |
| Parámetros activos | A3B en el nombre sugiere ~3B activos; no confirmado en la información disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Sigue la del modelo base Qwen/Qwen3.6-35B-A3B; texto de licencia no disponible |
| Formato de pesos | Tensores BF16 compatibles con `transformers` y vLLM (no se especifica safetensors explícitamente) |

## Arquitectura y entrenamiento

El modelo base es un MoE de tipo transformer con capacidad multimodal imagen-texto (tag `image-text-to-text`), identificado internamente como `qwen3_5_moe`. La modificación introducida por mrminjae no reentrena el modelo: aplica una cuantización post-entrenamiento selectiva sobre los expertos enrutados, dejando el resto de la red en BF16. La media de 2,10 bits en expertos enrutados es un valor agregado; no se detalla la distribución por experto ni el esquema de cuantización (por ejemplo, si es uniforme, mixta o con escalas por grupo).

El identificador interno `full_selftraj_lowbit` sugiere una trayectoria de autoajuste o self-trajectory con baja precisión, pero la model card no documenta el procedimiento de entrenamiento, el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO. Tampoco se especifica si la cuantización se calibró con datos, qué métricas de error se midieron ni cómo afecta al enrutamiento de expertos. Los pesos se guardan dequantizados en BF16, lo que implica que la inferencia no usa aritmética de 2 bits en tiempo de ejecución: el ahorro es de almacenamiento y de ancho de banda de carga, no de cómputo en GPU.

## Capacidades

- Generación de texto conversacional y continuaciones multi-turno, según el pipeline `text-generation` y el tag `conversational`.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), heredado del modelo base.
- Razonamiento y generación de código: capacidades probables por herencia de la familia Qwen 3.5/3.6, aunque no verificadas en este checkpoint.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles; el modelo base Qwen suele ser multilingüe, pero este checkpoint no declara idiomas.
- Modo thinking explícito: no disponible.
- Compatibilidad con endpoints (`endpoints_compatible`) y con vLLM/`transformers` estándar.

## Casos de uso

- Experimentación con cuantización extrema de MoE: el checkpoint permite medir la degradación de calidad al comprimir expertos enrutados a 2,10 bits manteniendo el resto en BF16, útil para investigación sobre esquemas de compresión selectiva.
- Despliegue con restricciones de almacenamiento: al ocupar 14,7 GB en el repositorio, puede almacenarse y distribuirse en entornos donde un checkpoint BF16 completo de 35B no cabría, aunque la VRAM en inferencia depende de la dequantización a BF16.
- Servicio de inferencia compatible con vLLM: al cargar con vLLM estándar sin kernels especiales, puede integrarse en infraestructuras existentes que ya sirven modelos `transformers`.
- Evaluación comparativa de checkpoints: sirve como referencia para comparar la calidad de un MoE con expertos a baja precisión frente al modelo base original en tareas de texto e imagen-texto.
- Prototipado de asistentes multimodales: el pipeline `image-text-to-text` permite construir demos de descripción de imágenes y diálogo sobre imágenes, siempre que la calidad del checkpoint lo permita.
- Investigación de robustez del enrutamiento: permite estudiar si la cuantización de expertos altera la selección de expertos y, por tanto, el comportamiento del modelo en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; los pesos se cargan dequantizados en BF16, por lo que la huella en memoria se aproxima a la de un modelo de 35B en BF16 (del orden de 70 GB), salvo que el runtime aplique compresión adicional.
- GPU recomendadas: no disponible; por tamaño, un MoE de 35B en BF16 requiere GPUs de clase A100/H100 con 80 GB o configuraciones multi-GPU.
- ¿Cabe en GPU de consumo? No disponible; con 35B en BF16 no cabría en una RTX 4090 de 24 GB sin cuantización adicional en tiempo de ejecución.
- Opciones de despliegue: `transformers` estándar y vLLM, según la model card; llama.cpp, Ollama y TGI no están confirmados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen36-35b-a3b-2p10bit-selftraj-lowbit | 35B totales (A3B activos, no confirmado) | no disponible | Expertos a 2,10 bits, resto BF16 | Sigue la del base (no detallada) | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales (A3B activos, no confirmado) | no disponible | BF16 original | no disponible | Hugging Face (modelo base referenciado) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del checkpoint ni del modelo base en la información proporcionada, por lo que la comparativa se limita a parámetros y formato.

## Limitaciones y advertencias

- Checkpoint de investigación interna: no es un lanzamiento oficial ni está validado para producción.
- La cuantización a 2,10 bits en expertos enrutados puede degradar la calidad de forma no medida; no hay benchmarks que cuantifiquen la pérdida.
- Los pesos se almacenan dequantizados en BF16, por lo que el ahorro es de almacenamiento, no de VRAM en inferencia, salvo que el runtime recomprima.
- Licencia no detallada: aunque "sigue la del modelo base", no se especifica el texto de la licencia de Qwen3.6-35B-A3B, lo que impide confirmar restricciones de uso comercial.
- Idiomas no declarados: no se puede garantizar cobertura multilingüe.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo.
- Riesgo de alucinación y sesgos: no evaluado en este checkpoint; se heredan los del modelo base, que no se documentan.
- Sin descargas ni validación comunitaria: no hay evidencia externa de que el checkpoint cargue o funcione correctamente en todos los runtimes indicados.
- Fecha de creación futura (2026-11-12) y ausencia de métricas: tratar con cautela cualquier uso más allá de la experimentación.

## Enlaces

- Hugging Face: https://huggingface.co/mrminjae/qwen36-35b-a3b-2p10bit-selftraj-lowbit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
