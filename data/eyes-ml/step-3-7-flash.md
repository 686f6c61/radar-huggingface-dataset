# eyes-ml/Step-3.7-Flash

## Resumen

Step 3.7 Flash es un modelo de lenguaje y visión de tipo Mixture-of-Experts (MoE) disperso desarrollado por StepFun. Combina un backbone lingüístico de 196B parámetros con un codificador visual de 1,8B parámetros, sumando un total de 198B parámetros según la model card (el recuento de safetensors en el repositorio es de 201.365.316.160 parámetros). Activa aproximadamente 11B parámetros por token, lo que lo sitúa en la categoría de modelos de alta capacidad pero con coste de inferencia contenido.

El modelo está diseñado para cargas de trabajo de producción de alta frecuencia y flujos agénticos que combinan percepción visual, búsqueda y razonamiento. Soporta una ventana de contexto de 256k tokens, ofrece tres niveles de razonamiento seleccionables (bajo, medio y alto) y declara un throughput de hasta 400 tokens por segundo. Estas características lo orientan a tareas como el análisis de informes financieros extensos, bucles de búsqueda multi-paso con verificación cruzada de fuentes y la operación concurrente de agentes de código.

Su relevancia actual radica en la combinación de modalidad nativa imagen-texto, contexto muy largo y orquestación de herramientas fiable, con una licencia Apache 2.0 que permite uso comercial. No obstante, conviene señalar que el repositorio de Hugging Face asociado (eyes-ml/Step-3.7-Flash) no presenta descargas ni interacciones y su fecha de creación es de noviembre de 2026, por lo que la disponibilidad real de pesos debe verificarse en la fuente oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) disperso con codificador visual |
| Parametros totales | 198B (model card); 201.365.316.160 segun safetensors |
| Parametros activos | Aproximadamente 11B por token |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (segun metadatos); la model card menciona capacidades en chino e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, custom_code) |

## Arquitectura y entrenamiento

Step 3.7 Flash emplea una arquitectura de transformer con capas Mixture-of-Experts dispersas. El modelo se compone de un backbone lingüístico de 196B parámetros y un codificador visual de 1,8B parámetros para comprensión nativa de imágenes, lo que da un total de 198B parámetros. La activación dispersa de aproximadamente 11B parámetros por token reduce el coste computacional por paso de decodificación en comparación con un modelo denso del mismo tamaño total.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones de atención (como atención lineal o decodificación especulativa) más allá de la propia arquitectura MoE. La model card sí destaca los tres niveles de razonamiento seleccionables (bajo, medio y alto) como mecanismo para equilibrar velocidad, coste y profundidad cognitiva, y un throughput declarado de hasta 400 tokens por segundo.

## Capacidades

- Generación de texto y razonamiento con tres niveles de profundidad configurables (bajo, medio, alto).
- Comprensión nativa de imágenes: procesa interfaces visuales densas como wireframes de UI, GUIs de aplicaciones y gráficos de datos, y los convierte en código estructurado.
- Verificación visual y de contexto: identifica datos faltantes en un activo visual incompleto y ejecuta búsquedas para verificar el contexto antes de emitir una conclusión.
- Orquestación de herramientas y llamadas a funciones (tool calling / function calling) con alta adherencia a políticas del sistema en escenarios multi-turno.
- Razonamiento agéntico multi-paso y flujos de búsqueda con verificación cruzada de fuentes.
- Ingeniería de código: trazado de repositorios multi-archivo, aislamiento de bugs a partir de informes y generación de parches que pasan pruebas unitarias.
- Capacidades multilingües: los metadatos indican inglés, aunque la model card menciona dominio de chino e inglés.
- Contexto largo de 256k tokens para procesar documentos extensos en una sola pasada.

## Casos de uso

- Análisis de informes financieros extensos: gracias a la ventana de 256k tokens, el modelo puede procesar un informe completo en una sola pasada sin fragmentación, extrayendo métricas y comparando secciones con coherencia global.
- Agentes de búsqueda multi-paso: el modelo puede ejecutar bucles de búsqueda con verificación cruzada de fuentes, lo que resulta adecuado para tareas de investigación donde se requiere contrastar información antes de responder.
- Automatización de ingeniería de software: con su rendimiento en SWE-Bench PRO, puede integrarse en pipelines que reciben informes de issues, localizan el bug en repositorios multi-archivo y generan parches que pasan pruebas unitarias automatizadas.
- Conversión de interfaces visuales a código: a partir de capturas de GUIs, wireframes o gráficos, el modelo genera código estructurado, útil en flujos de diseño a desarrollo y en la generación de prototipos de front-end.
- Agentes de atención al cliente con percepción visual: puede gestionar conversaciones multi-turno con contexto largo e interpretar capturas de pantalla o documentos enviados por el usuario para resolver incidencias.
- Orquestación de APIs en producción: con tool calling fiable y resistencia a trampas adversariales (ClawEval-1.1), es adecuado para agentes que interactúan con APIs externas en flujos de larga duración sin desviarse de las instrucciones.
- Procesamiento por lotes de alta frecuencia: con hasta 400 tokens por segundo y activación de 11B parámetros, encaja en cargas de trabajo de alto volumen donde el coste por token es crítico.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| SimpleVQA (Search) | 79,2 (primer puesto) |
| V* (Python) | 95,3 |
| ClawEval-1.1 | 67,1 (siguiente competidor: 59,8) |
| Toolathlon | 49,5 |
| HLE w. Tool | 48,1 |
| SWE-Bench PRO | 56,3 (segundo puesto) |
| Terminal-Bench 2.1 | 59,5 |
| GDPVal-AA | 45,8 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 198B parámetros totales, los pesos en precisión completa requieren aproximadamente 400 GB; en cuantizaciones de 8 bits rondaría los 200 GB y en 4 bits los 100 GB, aunque el modelo activa solo 11B parámetros por token.
- GPU recomendadas: infraestructura de centro de datos moderna para despliegue a gran escala; NVIDIA NIM para despliegue on-prem, cloud o híbrido.
- Equipos de estación de trabajo y locales: la model card indica compatibilidad con NVIDIA DGX Station, sistemas basados en AMD Ryzen AI Max+ 395 y Mac Studio / MacBook Pro con al menos 128 GB de memoria unificada.
- Opciones de despliegue: vLLM, SGLang, Hugging Face Transformers y llama.cpp para inferencia; NVIDIA NIM como microservicio; ecosistema NVIDIA NeMo (AutoModel, Megatron Core, Megatron Bridge) para desarrollo y personalización.
- Latencia y throughput: hasta 400 tokens por segundo según la model card.

## Comparativa con modelos similares

No se dispone de datos comparativos detallados de parámetros, contexto y licencia de modelos alternativos en la información proporcionada. La model card únicamente menciona comparaciones puntuales en benchmarks: en ClawEval-1.1 el siguiente competidor más cercano obtiene 59,8 frente a los 67,1 de Step 3.7 Flash, y en SWE-Bench PRO el modelo logra el segundo puesto con 56,3. No se identifican por nombre los modelos comparados, por lo que la comparativa completa se considera no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; como todo modelo entrenado con datos web, es probable que herede sesgos de sus fuentes, pero no se aportan detalles.
- Riesgo de alucinación: no se cuantifica en la model card. El modelo incorpora mecanismos de verificación visual y búsqueda para mitigarlo, pero no se ofrecen garantías.
- Limitaciones de idioma: los metadatos oficiales indican únicamente inglés, aunque la model card menciona capacidades en chino e inglés. El soporte de otros idiomas no está confirmado.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero debe verificarse la procedencia real de los pesos publicados en el repositorio eyes-ml/Step-3.7-Flash, que no registra descargas ni interacciones.
- Rendimiento en benchmarks: la propia model card reconoce áreas de mejora en Terminal-Bench 2.1 (59,5) y GDPVal-AA (45,8) frente al máximo de la cohorte.
- Caveat de producción: el repositorio consultado tiene fecha de creación de noviembre de 2026 y cero descargas; conviene contrastar la disponibilidad y la integridad de los pesos con la fuente oficial de StepFun antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/eyes-ml/Step-3.7-Flash
- Página del modelo: https://static.stepfun.com/blog/step-3.7-flash/
- Plataforma StepFun (global): https://platform.stepfun.ai
- Plataforma StepFun (China): https://platform.stepfun.com
- API global: https://api.stepfun.ai/v1
- API China: https://api.stepfun.com/v1
