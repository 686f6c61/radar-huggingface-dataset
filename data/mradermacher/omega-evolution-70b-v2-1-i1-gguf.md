# mradermacher/Omega-Evolution-70B-v2.1-i1-GGUF

## Resumen

Omega-Evolution-70B-v2.1-i1-GGUF es la cuantización en formato GGUF del modelo base ReadyArt/Omega-Evolution-70B-v2.1, preparada por el equipo mradermacher. Se trata de un modelo de lenguaje de 70 553 millones de parámetros, derivado de la familia Llama 3.3 (licencia llama3.3), orientado a tareas de roleplay, generación de narrativa y conversación sin alineamiento, con etiquetas explícitas de contenido NSFW y ERP. La versión GGUF permite su ejecución en hardware de consumo mediante motores como llama.cpp u Ollama, con múltiples niveles de cuantización para ajustar la precisión y el uso de memoria.

El modelo base, Omega-Evolution-70B-v2.1, pertenece a una serie de fine-tunes de 70B diseñados para roleplay extremo y coherencia narrativa en diálogos largos y multi-personaje. La cuantización i1 (imatrix) optimiza la distribución de pesos para reducir la pérdida de calidad respecto a las versiones estáticas, ofreciendo opciones que van desde 24,2 GB hasta 58,0 GB. Es un modelo no alineado, lo que implica que no incorpora filtros de seguridad estándar y puede generar contenido explícito o potencialmente peligroso, por lo que su uso en producción debe evaluarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Llama 3.3, 70B) |
| Parámetros totales | 70.553.706.560 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la familia Omega suele usar 32 768 tokens, pero no se confirma para esta versión) |
| Tipos de cuantización | i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.3 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base ReadyArt/Omega-Evolution-70B-v2.1 es un fine-tune de un modelo Llama 3.3 de 70 mil millones de parámetros, probablemente partiendo de un checkpoint intermedio como Steelskull/L3.3-Shakudo-70b, según los modelos hermanos de la misma familia (Omega-Directive). La arquitectura es un transformer denso con atención de causalidad estándar, sin mezcla de expertos (MoE) ni capas de atención lineal. El entrenamiento se centra en la mejora de la coherencia narrativa y la caracterización de personajes en escenarios de roleplay, empleando un dataset de aproximadamente 39 millones de tokens en las variantes "unslopped" de la serie, aunque los detalles exactos del dataset de Omega-Evolution no se han publicado en la información disponible.

La cuantización i1 de mradermacher utiliza la técnica de imatrix, que optimiza los umbrales de cuantización basándose en la activación de los pesos, logrando una calidad superior en tamaños de archivo bajos en comparación con las cuantizaciones estáticas. No se ha documentado el uso de RLHF ni DPO en el modelo base, y las etiquetas "unaligned" y "dangerous" indican que se ha eliminado deliberadamente el alineamiento de seguridad.

## Capacidades

- Generación de texto narrativo y conversacional en inglés, con especial énfasis en roleplay de larga duración y múltiples personajes.
- Coherencia contextual en diálogos extensos, manteniendo la voz y los rasgos de cada personaje a lo largo de la interacción.
- Generación de contenido explícito y NSFW (ERP) sin filtros de moderación, como se indica en las etiquetas del repositorio.
- Capacidades multilingües limitadas: el modelo declara únicamente el idioma inglés en su tarjeta de modelo.
- No se documenta soporte para tool calling, function calling, agentes o razonamiento multi-paso específico más allá de la generación de texto estándar.
- No incluye capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- **Roleplay en línea**: el modelo puede mantener conversaciones de rolco con múltiples personajes durante sesiones largas, gracias a su entrenamiento específico en coherencia narrativa. Se desplegaría en un servidor local con llama.cpp u Ollama para ofrecer una experiencia interactiva en tiempo real.
- **Escritura creativa de ficción**: adecuado para la redacción de relatos extensos, diálogos y guiones, donde la consistencia de los personajes es crítica. La cuantización Q4_K_M permite ejecutarlo en estaciones de trabajo con 48 GB de VRAM.
- **Generación de contenido adulto (ERP)**: el modelo está optimizado para este tipo de contenido, sin filtros de moderación. Su uso se limitaría a entornos privados y controlados, con un aviso legal claro sobre el contenido generado.
- **Prototipado de aplicaciones de conversación**: para desarrolladores que necesiten probar un modelo de 70B sin alineamiento en entornos de desarrollo, la versión i1-Q2_K (26,5 GB) cabe en GPUs de consumo como una RTX 4090 de 24 GB con cuantización adicional o en CPU con memoria suficiente.
- **Investigación en alineamiento y seguridad**: el modelo puede servir como referencia para estudiar comportamientos no alineados y sesgos en modelos de gran tamaño, aunque su uso en este ámbito requiere un entorno aislado.
- **Creación de datasets de entrenamiento**: los quants de imatrix pueden emplearse para generar datos sintéticos de roleplay que luego se utilicen para fine-tuning de modelos más pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo o su variante cuantizada.

## Requisitos de hardware

- **VRAM estimada**: para la cuantización Q4_K_M (42,6 GB de archivo) se recomienda al menos 48 GB de VRAM, por lo que una GPU como la NVIDIA RTX A6000 o L40 es adecuada. La versión Q4_K_S (40,4 GB) requiere al menos 44 GB. La Q6_K (58,0 GB) necesita alrededor de 64 GB de VRAM (A100 80 GB o similar).
- **GPU recomendadas**: A100 80 GB para las cuantizaciones más altas, RTX 4090 (24 GB) solo para las versiones más pequeñas como i1-IQ2_M (24,2 GB) si se acepta una pérdida de calidad notable, o mediante offloading parcial de capas a la CPU.
- **En GPU de consumo**: solo las cuantizaciones por debajo de 27 GB (IQ2_M, Q2_K_S, Q2_K, IQ3_XXS) pueden caber en una RTX 4090 o similar con 24 GB de VRAM, pero con una degradación de calidad considerable. No se recomienda para uso productivo.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio y otros motores compatibles con GGUF. Para despliegues en producción con mayor concurrencia, se puede convertir el modelo a formato safetensors y usar vLLM o TGI, aunque no se documenta compatibilidad explícita.
- **Latencia y throughput**: no disponible. En un sistema con una sola GPU A100 80GB y la cuantización Q4_K_M, se puede esperar un throughput de entre 15 y 30 tokens por segundo en generación autoregresiva, aunque el valor exacto depende del backend y del tamaño del contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantizaciones GGUF | Enfoque |
|---|---|---|---|---|---|
| Omega-Evolution-70B-v2.1-i1-GGUF | 70,5B | no disponible (¿32K?) | llama3.3 | Sí (10 quants i1) | Roleplay/ERP sin alinear |
| L3.3-The-Omega-Directive-70B-Unslop-v2.1 | 70B | 32 768 | llama3.3 | No GGUF oficial | Roleplay extremo, coherencia narrativa |
| Llama-3.3-70B-Instruct | 70,6B | 128K | llama3.3 | Sí | Modelo generalista alineado |

El modelo se sitúa en el mismo segmento que otros fine-tunes de 70B de la familia Omega, como The-Omega-Directive, que comparte contexto de 32K tokens y licencia llama3.3. La diferencia principal es el enfoque de "Evolution" frente a "Directive", aunque no se dispone de detalles técnicos específicos que los diferencien. Respecto a Llama-3.3-70B-Instruct, el modelo base es mucho menos versátil en tareas generales, pero ofrece una calidad superior en roleplay no alineado, a costa de la seguridad y el filtrado de contenido.

## Limitaciones y advertencias

- **Contenido explícito y peligroso**: el modelo está etiquetado como NSFW, explicit, unaligned y dangerous. No dispone de filtros de seguridad y puede generar contenido sexual, violento o perjudicial. Su uso en entornos comerciales o públicos es desaconsejable sin una moderación externa.
- **Riesgo de alucinación**: como modelo de 70B sin alineamiento, la probabilidad de generar información falsa o incoherente es elevada, especialmente en contextos no narrativos.
- **Idioma**: solo soporta inglés de forma nativa; el rendimiento en otros idiomas no está garantizado y puede ser deficiente.
- **Licencia**: la licencia llama3.3 es de tipo "Other License" en Hugging Face, lo que puede imponer restricciones al uso comercial. El autor del repositorio (mradermacher) añade la etiqueta "Other License" en la card, por lo que es necesario revisar los términos de la licencia Llama 3.3 antes de cualquier despliegue comercial.
- **Sin benchmarks ni documentación técnica**: no hay resultados de métricas ni información detallada sobre el dataset de entrenamiento de Omega-Evolution, lo que dificulta evaluar su calidad de forma objetiva.
- **Cuantización y calidad**: las cuantizaciones más pequeñas (IQ2_M, Q2_K_S) presentan una calidad notablemente inferior, con riesgo de degradación grave en tareas de rolco. Se recomienda usar Q4_K_M o superior para un equilibrio razonable.

## Enlaces

- Repositorio Hugging Face del modelo GGUF: https://huggingface.co/mradermacher/Omega-Evolution-70B-v2.1-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Omega-Evolution-70B-v2.1
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
- Página de solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Ficha del modelo en toolify.ai: https://www.toolify.ai/ai-model/readyart-omega-evolution-70b-v2-1
- Modelo hermano L3.3-The-Omega-Directive-70B-Unslop-v2.1 en Featherless: https://featherless.ai/models/ReadyArt/L3.3-The-Omega-Directive-70B-Unslop-v2.1
- Cuantización de la variante v2.0 en Ollama: https://ollama.com/ScrambieBambie/L3.3-The-Omega-Directive-70B-Unslop-v2.0-i1-Q4_K_M
