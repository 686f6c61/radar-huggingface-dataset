# mradermacher/GLM-4.7-Flash-REAP-19-i1-GGUF

## Resumen

El modelo GLM-4.7-Flash-REAP-19-i1-GGUF es una cuantización en formato GGUF del modelo base Akicou/GLM-4.7-Flash-REAP-19, preparada por mradermacher. Este modelo base es una versión podada y comprimida del GLM-4.7 Flash, un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado originalmente por Zhipu AI. La variante REAP-19 incorpora técnicas de pruning y compresión, lo que reduce el tamaño del modelo manteniendo un rendimiento competitivo, y está optimizada para tareas de código, function calling y uso agéntico.

La cuantización i1 utiliza imatrix (importance matrix) para mejorar la calidad de los pesos cuantizados, ofreciendo dos variantes: i1-Q2_K (9,3 GB) y i1-IQ3_M (11,1 GB). Con aproximadamente 24,7 mil millones de parámetros totales, este modelo se posiciona como una opción interesante para ejecutar en hardware de consumo con capacidades de razonamiento y generación de código, aunque la información pública sobre sus especificaciones detalladas es limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) basada en GLM |
| Parametros totales | 24.732.937.304 (~24,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo base no está documentada en la información proporcionada. Por los tags y el nombre, se deduce que es un modelo MoE (mezcla de expertos) derivado de GLM-4.7 Flash, con un proceso de poda (pruning) y compresión denominado REAP (probablemente relacionado con técnicas de reducción de parámetros). El tag "cerebras" sugiere posible uso de hardware de Cerebras Systems en el entrenamiento o inferencia, aunque no se confirma.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La cuantización i1 de mradermacher se realiza con imatrix, que asigna mayor precisión a los pesos más importantes, mejorando la calidad frente a cuantizaciones estándar.

## Capacidades

- Generación de texto y razonamiento conversacional en inglés.
- Soporte de código: el tag "code" indica capacidad para generar y comprender código en varios lenguajes.
- Function calling: integración con herramientas y APIs mediante llamadas a funciones estructuradas.
- Uso agéntico: diseñado para flujos de trabajo multi-paso y razonamiento encadenado.
- Capacidades multilingües: no confirmadas; el modelo declara solo inglés.

## Casos de uso

- Asistente de programación en local: el modelo puede generar fragmentos de código, explicar algoritmos y depurar errores, ejecutándose en una GPU de consumo con los quants i1-Q2_K o i1-IQ3_M.
- Automatización de tareas de desarrollo: gracias al function calling, puede integrarse en pipelines de CI/CD para generar tests, documentación o refactorizar código.
- Chatbot agéntico para soporte técnico: con su capacidad de razonamiento multi-paso, puede gestionar consultas complejas y ejecutar acciones mediante herramientas externas.
- Prototipado rápido de aplicaciones conversacionales: su licencia MIT permite uso comercial sin restricciones, facilitando su integración en productos.
- Educación y formación en programación: puede servir como tutor interactivo que explica conceptos y resuelve ejercicios de código.
- Investigación en compresión de modelos: al ser un modelo podado y cuantizado, es útil para estudiar el equilibrio entre tamaño, velocidad y rendimiento en MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para el quant i1-Q2_K (9,3 GB) se recomiendan al menos 12 GB de VRAM; para i1-IQ3_M (11,1 GB) se necesitan 14 GB o más, considerando overhead de contexto y activaciones.
- GPU recomendadas: NVIDIA RTX 3060 12GB (para Q2_K), RTX 4070/4080, RTX 3090, RTX 4090 o superiores para mayor comodidad.
- En GPU de consumo: sí, cabe en tarjetas con 12-16 GB de VRAM, dependiendo de la cuantización y la longitud de contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui.
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría (MoE podados o cuantizados). Se recomienda consultar benchmarks independientes si se publican en el futuro.

## Limitaciones y advertencias

- La cuantización introduce pérdida de precisión respecto al modelo original en fp16; los quants de baja precisión (Q2_K) pueden degradar la calidad en tareas complejas.
- El modelo solo declara inglés; su rendimiento en otros idiomas no está garantizado.
- Al ser una versión podada, puede presentar lagunas en conocimientos o razonamiento frente al GLM-4.7 Flash completo.
- No hay información sobre sesgos o alucinaciones; se recomienda validar las salidas en entornos de producción.
- La licencia MIT permite uso comercial, pero el modelo base puede tener restricciones adicionales; se recomienda revisar la licencia del modelo original.

## Enlaces

- [Repositorio HuggingFace del modelo cuantizado](https://huggingface.co/mradermacher/GLM-4.7-Flash-REAP-19-i1-GGUF)
- [Modelo base: Akicou/GLM-4.7-Flash-REAP-19](https://huggingface.co/Akicou/GLM-4.7-Flash-REAP-19)
- [Página de mradermacher con más información](https://hf.tst.eu/model#GLM-4.7-Flash-REAP-19-i1-GGUF)
