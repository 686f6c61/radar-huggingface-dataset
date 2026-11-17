# Cambriyn/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-DERISKED-exp

## Resumen

NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-DERISKED-exp es una variante experimental publicada por el usuario Cambriyn sobre el modelo base `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB`. Se trata de un modelo multimodal de tipo image-text-to-text construido sobre la arquitectura propietaria `nemotron_h_omni`, que combina mezcla de expertos (MoE) con atención híbrida y capas Mamba. El nombre del checkpoint indica un modelo nominal de 74B parámetros totales con 9B activos por token, comprimido a un formato de aproximadamente 24 GB mediante cuantización de 8 bits con ModelOpt.

El autor lo etiqueta como "derisked" y orienta el modelo a investigación en ciberseguridad, red team y finanzas, aunque no se aporta documentación técnica que respalde esos ajustes. El repositorio tiene cero descargas y cero likes en el momento de la consulta, y el acceso está restringido: requiere aceptar condiciones en Hugging Face. La licencia es la NVIDIA Nemotron Open Model License, heredada del modelo base.

Es relevante como ejemplo de derivado comunitario de un modelo Nemotron de nueva generación, pero debe tratarse con cautela: no hay model card sustantiva, no hay benchmarks publicados y el propio autor lo marca como experimental. Los pesos declarados en safetensors suman 24.647.206.920 parámetros reales, no 74B, lo que sugiere que el checkpoint publicado contiene una representación cuantizada o parcial del modelo nominal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h_omni (MoE con atención híbrida y capas Mamba) |
| Parametros totales | 24.647.206.920 según safetensors; el nombre del checkpoint indica 74B nominales |
| Parametros activos | 9B (según el nombre del checkpoint, A9B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (ModelOpt); pesos en safetensors de 24,2 GB |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors (transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Nemotron 3.5 de NVIDIA y emplea la arquitectura `nemotron_h_omni`, que según las etiquetas del repositorio combina mezcla de expertos (MoE) con atención híbrida y capas del tipo Mamba. La nomenclatura "Bolt-74B-A9B" indica 74.000 millones de parámetros totales con 9.000 millones activos por token, un régimen típico de MoE disperso. La variante publicada por Cambriyn aplica cuantización de 8 bits con ModelOpt para reducir el peso del repositorio a 24,2 GB, y añade el sufijo "DERISKED" junto con etiquetas de ciberseguridad, red team y finanzas, lo que sugiere un ajuste fino orientado a esos dominios, aunque no se documenta el dataset ni el procedimiento.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF o DPO, ni sobre innovaciones concretas como decodificación especulativa o mecanismos de atención lineal más allá de lo que implican las etiquetas. El modelo es multimodal (image-text-to-text), por lo que se asume un codificador visual integrado, pero no se detalla su naturaleza ni su resolución de entrada. Tampoco se especifica la longitud de contexto soportada.

## Capacidades

- Generación de texto conversacional y de tipo instructivo, según la etiqueta `text-generation` y `conversational`.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), lo que permite entrada multimodal.
- Razonamiento multi-paso y uso en agentes, implícito en la arquitectura MoE de la familia Nemotron, aunque no documentado en esta variante.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles.
- Ajuste orientado a ciberseguridad, análisis de riesgo y finanzas según las etiquetas del autor, sin evaluación publicada.
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue vía Inference Endpoints.

## Casos de uso

- Análisis de imágenes en flujos de trabajo técnicos: al ser un modelo image-text-to-text, puede recibir capturas de paneles, diagramas de red o interfaces y generar descripciones o resúmenes textuales para documentación interna.
- Asistencia en red team y revisión de configuraciones: las etiquetas de ciberseguridad sugieren un uso previsto para analizar políticas, scripts o configuraciones y proponer observaciones, siempre con revisión humana dado el carácter experimental.
- Generación de borradores en dominios financieros: el modelo puede redactar resúmenes de informes o notas de análisis a partir de texto e imágenes de gráficos, aunque sin validación publicada de exactitud.
- Prototipado de asistentes conversacionales multimodales: su formato de 8 bits y 24 GB permite desplegarlo en una GPU de 24 GB para pruebas de concepto con entrada de imagen y texto.
- Investigación sobre cuantización y MoE: sirve como banco de pruebas para estudiar el impacto de ModelOpt 8-bit en un modelo Nemotron de 74B nominales con 9B activos.
- Evaluación comparativa de derivados comunitarios: útil para medir la degradación de un checkpoint "derisked" frente al modelo base de NVIDIA en tareas de seguridad y finanzas.
- Integración en pipelines de transformers con `custom_code`: permite experimentar con la arquitectura `nemotron_h_omni` en entornos de investigación que ya usan la librería transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 24,2 GB en safetensors de 8 bits, por lo que se necesita al menos 24 GB de VRAM para cargar los pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para despliegue cómodo; RTX 4090 24 GB o RTX 3090 24 GB como mínimo ajustado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 de 24 GB, aunque con margen escaso y posible necesidad de offloading parcial o cuantización adicional.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requiere `custom_code`), Inference Endpoints (etiqueta `endpoints_compatible`); vLLM, llama.cpp, Ollama y TGI no están confirmados para esta arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-DERISKED-exp | 74B nominales / 9B activos (24,6B en safetensors) | no disponible | NVIDIA Nemotron Open Model License | Gated, 0 descargas |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB (base) | 74B / 9B activos | no disponible | NVIDIA Nemotron Open Model License | Gated en Hugging Face |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor; no debe usarse en producción sin evaluación propia.
- Ausencia de model card sustantiva: no hay datos de entrenamiento, evaluación ni sesgos documentados.
- Discrepancia entre el nombre (74B) y los parámetros reales en safetensors (24,6B), lo que puede indicar cuantización agresiva o pesos incompletos.
- Riesgo elevado de alucinación y de comportamiento impredecible en dominios de seguridad y finanzas, donde los errores tienen consecuencias graves.
- Licencia NVIDIA Nemotron Open Model License: revisar condiciones de uso comercial y obligaciones de atribución antes de cualquier despliegue.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su uso automatizado.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano.
- Contexto máximo desconocido, lo que impide planificar cargas de trabajo con ventanas largas.
- Sin descargas ni validación comunitaria: no hay evidencia externa de su calidad o estabilidad.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, con el riesgo de seguridad que ello implica.

## Enlaces

- Hugging Face: https://huggingface.co/Cambriyn/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-DERISKED-exp
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB
- Licencia NVIDIA Nemotron Open Model License: no disponible enlace directo en la información proporcionada
- Paper, blog o repositorio adicional: no disponible
