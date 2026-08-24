# mradermacher/Serenity-26B-A4B-i1-GGUF

## Resumen

Serenity-26B-A4B-i1-GGUF es una cuantización en formato GGUF con matriz de importancia (imatrix) del modelo Serenity-26B-A4B, desarrollado por ReadyArt y cuantizado por mradermacher. El modelo base, según las etiquetas del repositorio, está basado en la arquitectura Gemma 4, aunque no se confirma oficialmente. Se trata de un modelo instruct orientado a roleplay, conversación y contenido adulto explícito, con un diseño no alineado (unaligned) que elimina restricciones típicas de seguridad. El nombre "26B-A4B" sugiere una arquitectura de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y 4 mil millones activos, aunque el conteo real de parámetros es de 25.233.142.046 (aproximadamente 25,2B). Esta versión GGUF permite ejecutar el modelo en entornos locales con CPU o GPU de baja VRAM, ofreciendo múltiples niveles de cuantización que van desde 8,8 GB hasta 22,7 GB.

La relevancia de este modelo radica en su capacidad para ejecutar un sistema de roleplay de gran tamaño en hardware doméstico, gracias a la compresión GGUF. Al ser un modelo no alineado, está pensado para usuarios que buscan interacciones sin filtros, incluyendo contenido erótico explícito. La cuantización con imatrix mejora la calidad de las cuantizaciones de baja precisión, lo que resulta útil para maximizar el rendimiento en recursos limitados. Sin embargo, no se dispone de información detallada sobre el entrenamiento, los datos utilizados o los benchmarks del modelo base, por lo que la evaluación debe basarse en pruebas empíricas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas indican Gemma 4) |
| Parametros totales | 25.233.142.046 |
| Parametros activos | no disponible (el nombre sugiere 4B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q6_K |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre el entrenamiento del modelo base Serenity-26B-A4B. El repositorio de cuantización no incluye detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. Las etiquetas del modelo indican que está basado en Gemma 4, lo que sugiere una arquitectura transformer con posible mezcla de expertos (MoE), dado el sufijo "A4B" en el nombre. Sin embargo, esta información no está confirmada por el autor original.

La cuantización realizada por mradermacher utiliza el método imatrix (importance matrix), que calcula matrices de importancia basadas en la activación de los pesos para mejorar la calidad de las cuantizaciones de baja precisión. El repositorio incluye un archivo imatrix separado y múltiples archivos GGUF con diferentes niveles de cuantización, desde IQ1_M (8,8 GB) hasta Q6_K (22,7 GB). No se proporcionan datos sobre el proceso de entrenamiento del modelo original.

## Capacidades

- Generación de texto conversacional y de roleplay, con énfasis en interacciones largas y contextuales.
- Soporte de instrucciones (instruct) para seguir comandos y mantener diálogos multi-turno.
- Contenido no alineado (unaligned), lo que permite generar respuestas sin restricciones de seguridad, incluyendo contenido adulto explícito y roleplay erótico (erp).
- Capacidades multimodales: según la model card, es un modelo de visión, aunque no se especifican detalles sobre el procesamiento de imágenes. Los archivos mmproj (proyección multimodal) se encuentran en el repositorio estático.
- No se dispone de información sobre tool calling, function calling, agentes o razonamiento multi-paso.

## Casos de uso

- Chatbots de roleplay para entretenimiento: el modelo puede mantener conversaciones inmersivas con personajes ficticios, gracias a su entrenamiento orientado a roleplay y su ventana de contexto (aunque la longitud exacta no está disponible). Se puede integrar en aplicaciones de chat local mediante llama.cpp u Ollama.
- Simulación de personajes para escritura creativa: escritores pueden usar el modelo para generar diálogos y desarrollar tramas interactivas, aprovechando su capacidad de seguir instrucciones y mantener coherencia narrativa.
- Generación de contenido adulto para ficción erótica: al ser no alineado, permite crear historias explícitas sin filtros, útil para autores que necesitan explorar temas maduros sin restricciones.
- Asistente conversacional personalizado: con la cuantización GGUF, se puede desplegar en un servidor local para uso privado, sin depender de APIs externas, garantizando privacidad en las conversaciones.
- Experimentación con modelos MoE en hardware limitado: al ofrecer cuantizaciones desde 8,8 GB, permite probar un modelo de 25B en GPUs de gama media (por ejemplo, RTX 3060 con 12 GB) o incluso en CPU con suficiente RAM.
- Desarrollo de prototipos de agentes conversacionales: aunque no se confirma soporte de tool calling, su naturaleza instruct permite crear flujos de diálogo estructurados para aplicaciones de demostración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para el modelo base ni para las cuantizaciones. Se recomienda realizar pruebas propias para evaluar la calidad en tareas específicas.

## Requisitos de hardware

- Los archivos GGUF varían en tamaño desde 8,8 GB (i1-IQ1_M) hasta 22,7 GB (i1-Q6_K). Para cargar el modelo en memoria, se necesita al menos el tamaño del archivo más la memoria para el contexto y los cálculos.
- Según el sitio oktechmasters.org, se recomienda un mínimo de 24 GB de RAM para ejecutar la versión GGUF, probablemente la cuantización más grande. Para cuantizaciones menores, se puede usar con menos memoria.
- En GPU, se requiere VRAM suficiente para el modelo y el contexto. Por ejemplo, una cuantización Q4_K_M (16,9 GB) puede caber en una GPU con 24 GB de VRAM (como RTX 3090 o RTX 4090), mientras que las versiones más pequeñas (IQ1_M, 8,8 GB) podrían ejecutarse en GPUs con 12 GB (RTX 3060, RTX 4070).
- Opciones de despliegue: llama.cpp, Ollama, text-generation-webui, o cualquier frontend compatible con GGUF. También se puede usar vLLM si se convierte a otro formato, aunque no es el propósito principal.
- No se dispone de datos de latencia o throughput. El rendimiento dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría (roleplay no alineado). No hay datos de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Contenido explícito y no alineado: el modelo puede generar material sexual, violento o inapropiado sin filtros. No es adecuado para entornos profesionales o públicos sin control de contenido.
- Sesgos desconocidos: al no haber documentación sobre el dataset de entrenamiento, no se pueden evaluar sesgos de género, raza u otros.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inconsistente, especialmente en contextos largos.
- Idioma limitado: solo soporta inglés, lo que restringe su uso en otros idiomas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el contenido generado puede estar sujeto a regulaciones legales según la jurisdicción.
- Sin garantías de calidad: al ser una cuantización de un modelo no verificado, el rendimiento puede variar significativamente entre cuantizaciones. Se recomienda probar varias versiones para encontrar el equilibrio óptimo entre tamaño y calidad.

## Enlaces

- Repositorio HuggingFace (cuantización i1): https://huggingface.co/mradermacher/Serenity-26B-A4B-i1-GGUF
- Repositorio HuggingFace (cuantización estática): https://huggingface.co/mradermacher/Serenity-26B-A4B-GGUF
- Modelo base (ReadyArt): https://huggingface.co/ReadyArt/Serenity-26B-A4B
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Página de referencia externa: https://oktechmasters.org/ai_models/serenity-26b-a4b-gguf/
- Modelo relacionado (gemma-4-abliterated): https://ollama.com/huihui_ai/gemma-4-abliterated
