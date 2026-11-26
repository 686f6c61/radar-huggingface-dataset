# reaperdoesntknow/DNA-175M

## Resumen

DNA-175M es un modelo de generación de texto publicado en Hugging Face por el usuario reaperdoesntknow bajo el sello Convergent Intelligence LLC: Research Division. Según las etiquetas del repositorio, emplea una arquitectura denominada "liquid-former", se distribuye en formato transformers/PyTorch y está orientado a generación de texto conversacional. El nombre sugiere un tamaño de aproximadamente 175 millones de parámetros, aunque no se confirma en la información disponible.

La model card es una plantilla automática de Hugging Face sin cumplimentar: no documenta datos de entrenamiento, hiperparámetros, evaluación, idiomas ni licencia. La única información sustantiva es la sección "Discrepancy Calculus Foundation", que sitúa al modelo dentro de un marco teórico propio del autor (DISC) centrado en el análisis de discrepancias entre comportamiento esperado y observado durante el entrenamiento.

Su relevancia actual es limitada y fundamentalmente exploratoria: se trata de un modelo pequeño, con escasa tracción comunitaria (1 like, 1219 descargas) y sin benchmarks publicados. Resulta útil únicamente como objeto de estudio de la arquitectura liquid-former o del marco DISC, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | liquid-former (transformer, según tags; detalles no disponibles) |
| Parametros totales | aproximadamente 175M (inferido del nombre; no confirmado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en el repo: 0,7 GB, compatible con transformers) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors/PyTorch (librería transformers); GGUF no confirmado |

## Arquitectura y entrenamiento

La etiqueta principal es "liquid-former", un término que no corresponde a una arquitectura estándar ampliamente documentada y que la model card no desarrolla. Por los tags (transformers, pytorch, text-generation) y el pipeline declarado, se trata de un modelo autoregresivo de generación de texto implementado sobre la librería transformers. No se especifica si incorpora mecanismos de atención lineal, capas recurrentes de estado continuo (en la línea de liquid neural networks) o componentes híbridos.

No hay información sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni procedimiento de ajuste. La sección "Discrepancy Calculus Foundation" describe un marco teórico (operador de discrepancia, jump sets, ghost imprinting) con referencias a documentos del propio autor (DOI 10.57967/hf/8194 y 10.57967/hf/8165), pero no aporta detalles verificables sobre el entrenamiento concreto de este checkpoint. El tag arxiv:1910.09700 corresponde a Lacoste et al. (2019) sobre impacto ambiental y no a un paper del modelo.

## Capacidades

- Generación de texto autoregresiva (pipeline text-generation).
- Orientación conversacional según el tag "conversational".
- Compatibilidad con endpoints de Hugging Face (tag endpoints_compatible).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Experimentación con la arquitectura liquid-former: el modelo puede cargarse con transformers para inspeccionar su implementación y comparar su comportamiento con transformers convencionales de tamaño similar.
- Prototipado de chatbots de bajo coste: con ~175M parámetros, cabe en GPU de consumo y permite iterar rápidamente en entornos de desarrollo sin infraestructura dedicada.
- Investigación sobre el marco DISC: sirve como caso de estudio para analizar discrepancias entre salidas esperadas y observadas durante la inferencia.
- Generación de texto en entornos con recursos limitados: su tamaño reducido permite ejecución en CPU o GPU modesta para tareas de completado de texto no críticas.
- Docencia y divulgación: útil para explicar el ciclo completo de carga, inferencia y evaluación de un modelo pequeño en transformers.
- Pruebas de integración en pipelines de Hugging Face Endpoints: el tag endpoints_compatible facilita desplegarlo como endpoint de prueba en flujos de CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en fp16, aproximadamente 350 MB de pesos para 175M parámetros; en fp32, unos 700 MB. La suma de overhead de activaciones y KV cache dependerá del contexto, que no está documentado.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para inferencia en fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobredimensionadas para este tamaño.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (nativo); vLLM, llama.cpp, Ollama o TGI solo si existen conversiones a GGUF u otros formatos, que no se confirman en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DNA-175M | ~175M (inferido) | no disponible | no disponible | Hugging Face |
| GPT-2 small | 124M | 1024 | MIT | Hugging Face |
| GPT-2 medium | 355M | 1024 | MIT | Hugging Face |
| DistilGPT-2 | 82M | 1024 | Apache 2.0 | Hugging Face |

La comparación se limita a tamaño y disponibilidad, ya que DNA-175M no publica benchmarks, contexto ni licencia que permitan una comparación funcional rigurosa con alternativas establecidas.

## Limitaciones y advertencias

- Model card incompleta: sin información sobre datos de entrenamiento, evaluación, sesgos o uso previsto.
- Licencia no especificada: no se puede garantizar el uso comercial ni la redistribución.
- Idiomas no documentados: se desconoce la cobertura lingüística real.
- Riesgo de alucinación: no evaluado; un modelo de este tamaño y sin benchmarks publicados presenta riesgo alto en tareas factuales.
- Contexto desconocido: impide planificar aplicaciones que requieran ventanas largas.
- Tracción comunitaria mínima (1 like): sin validación independiente de calidad.
- Marco teórico propietario (DISC) sin revisión por pares externa en la información disponible.
- No apto para producción sin evaluación previa propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DNA-175M
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Documento DISC: https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Structure Over Scale: https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Three Teachers to Dual Cognition: https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy
- Paper citado en tags (impacto ambiental): https://arxiv.org/abs/1910.09700
