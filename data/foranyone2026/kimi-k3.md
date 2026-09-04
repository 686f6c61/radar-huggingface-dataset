# foranyone2026/Kimi-K3

## Resumen

Kimi K3 es un modelo multimodal agéntico de pesos abiertos desarrollado por Moonshot AI. Con 2,8 billones de parámetros (2.779.931.837.184 según los safetensors), es el primer modelo abierto de clase 3T. Se basa en una arquitectura Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), y activa 16 de 896 expertos por token, lo que supone unos 104B de parámetros activos. Incorpora visión nativa (texto, imagen y vídeo) y una ventana de contexto de 1 millón de tokens, orientado a tareas de codificación de largo horizonte, trabajo de conocimiento agéntico y razonamiento.

El modelo está disponible en HuggingFace bajo la licencia Kimi K3. Aunque el repositorio analizado es foranyone2026/Kimi-K3, la model card apunta a Moonshot AI como desarrollador y a su ecosistema oficial. Su diseño agéntico le permite operar con herramientas de terminal, navegar repositorios masivos y producir artefactos interactivos como dashboards, widgets y edición de vídeo, todo dentro del mismo modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parámetros totales | 2,8 billones (2.779.931.837.184 según safetensors) |
| Parámetros activos | 104B |
| Longitud de contexto | 1 millón de tokens |
| Tipos de cuantización | 8-bit (compressed-tensors); otros formatos no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Kimi K3 License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kimi K3 emplea una arquitectura MoE híbrida que combina 69 capas de Kimi Delta Attention (KDA) y 24 capas de Gated MLA, con una única capa densa. La dimensión oculta de atención es de 7168, con 96 cabezas de atención, y una dimensión latente MoE de 3584. El modelo tiene 896 expertos y selecciona 16 por token, con una dimensión oculta de 3072 por experto. El marco Stable LatentMoE permite escalar la dispersión manteniendo la estabilidad, logrando una eficiencia de escalado aproximadamente 2,5 veces mayor que la de Kimi K2.

Los datos de entrenamiento no se especifican en la información disponible: no se indica el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal reside en KDA y AttnRes, que reducen el coste computacional de la atención en contextos largos, y en la integración nativa de visión y vídeo.

## Capacidades

- Generación de texto y razonamiento para tareas de larga duración, con capacidad de mantener sesiones de ingeniería prolongadas con mínima supervisión humana.
- Comprensión multimodal nativa de texto, imágenes y vídeo dentro del mismo modelo.
- Contexto de 1 millón de tokens, lo que permite procesar repositorios completos, documentos extensos y vídeos largos.
- Capacidad agéntica: orquesta herramientas de terminal, navega repositorios masivos y ejecuta tareas complejas de forma autónoma.
- Generación de artefactos interactivos: visualizaciones, widgets, dashboards y diseño de movimiento.
- Edición de vídeo y motion design, gracias a su multimodalidad.
- Codificación de largo horizonte: optimización de kernels GPU, desarrollo de compiladores, diseño de chips y CAD con visión en el bucle.
- No se especifica formalmente soporte de function calling, aunque su comportamiento agéntico sugiere integración con herramientas.

## Casos de uso

- Desarrollo de software a largo plazo: el modelo puede mantener sesiones de codificación prolongadas, navegar repositorios masivos y optimizar kernels GPU o compiladores, reduciendo la necesidad de intervención humana.
- Diseño de chips y CAD: con visión en el bucle, puede iterar sobre diseños asistidos por ordenador y verificar resultados visualmente.
- Desarrollo de juegos: la combinación de visión y generación de código permite crear juegos completos con feedback visual en tiempo real.
- Investigación profunda automatizada: produce informes con visualizaciones interactivas, widgets y dashboards, integrando análisis de datos y presentación de resultados.
- Edición de vídeo y motion design: gracias a su capacidad multimodal, puede generar y editar contenido audiovisual de forma autónoma.
- Análisis de documentos extensos: con 1 millón de tokens de contexto, puede procesar contratos, informes técnicos o bases de conocimiento completas en una sola pasada.
- Creación de presentaciones y diapositivas: genera materiales de presentación pulidos y listos para uso profesional.
- Agente de conocimiento ofimático: automatiza tareas de oficina que requieren combinar lectura, escritura y generación de artefactos visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona cualitativamente que Kimi K3 es el número 1 en Frontend Code Arena y que ofrece una eficiencia de escalado aproximadamente 2,5 veces superior a la de Kimi K2, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni otros estándares.

## Requisitos de hardware

- No se proporcionan requisitos de hardware en la información disponible.
- Dado el tamaño de 2,8 billones de parámetros, la inferencia requiere infraestructura de múltiples GPUs de alta capacidad, con cuantización 8-bit para reducir el consumo de VRAM.
- No se especifican GPUs recomendadas (A100, H100, etc.) ni datos de latencia o throughput.
- Opciones de despliegue: no disponibles en la información. Se puede inferir compatibilidad con vLLM, llama.cpp u otros, pero no está confirmado.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos similares. La única referencia es Kimi K2, del mismo desarrollador, sobre el cual la model card afirma una mejora de eficiencia de escalado de 2,5 veces. No se proporcionan parámetros, contexto ni rendimiento de K2 en los datos disponibles.

## Limitaciones y advertencias

- El repositorio analizado es foranyone2026/Kimi-K3, no el repositorio oficial de Moonshot AI. Esto puede indicar una copia o espejo no oficial; se recomienda verificar la procedencia de los pesos.
- Los idiomas soportados no se especifican, por lo que el rendimiento multilingüe es desconocido.
- La licencia es "Kimi K3 License" (tipo "other"). Debe consultarse el texto completo de la licencia para conocer las restricciones de uso comercial, modificación y redistribución.
- No hay información sobre sesgos, riesgos de alucinación ni limitaciones específicas de contexto en los datos disponibles.
- El tamaño del modelo (2,8T) implica requisitos de hardware muy elevados, lo que limita su uso a organizaciones con infraestructura de GPU significativa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/foranyone2026/Kimi-K3
- Página oficial del modelo: https://www.kimi.ai/ai-models/kimi-k3
- Blog técnico: https://www.kimi.com/blog/kimi-k3
- Informe técnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Organización de Moonshot AI en HuggingFace: https://huggingface.co/moonshotai
- Licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- ModelScope: https://modelscope.cn/organization/moonshotai
- Kimi K3 en kimik2ai.com: https://kimik2ai.com/k3/
